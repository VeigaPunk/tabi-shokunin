#!/usr/bin/env node
// measure-c1-round41.mjs — tabi round 41 hardened measurement wrapper.
// Round-40 closure routed defects closed here:
//   F4 env-level driver substitution: every stage boundary is guarded by the
//      kernel's exec-time environment (/proc/self/environ + /proc/<ppid>/environ
//      read inside a fresh child whose own environ was spawned scrubbed).
//      NODE_OPTIONS/NODE_PATH/LD_* injection vectors refuse before the driver
//      spawns; the driver then performs its own identical check; the witness
//      child's spawned environ is re-verified by the counter. Executable
//      digests (this file, the driver, the counter, the node binary, the
//      firefox binary) are pinned in claims.json and re-checked post-hoc.
//   F1 zero-observation blind: receipt per-surface owned-socket counts must be
//      > 0 on every run (checked in the counter, F1 fix lives in the driver).
//   F3 stale process tree: an independent witness child records measure's
//      descendant tree with per-pid startTicks + exe every 50 ms; the counter
//      requires firefox-binary exe pids under the driver pid on every sample
//      and every claimed owned pid inside the recorded run window.
// Threat model (declared residual): the gate detects environment-injection
// vectors at the driver/counter boundary — an attacker controlling the MEASURE
// process's own realm beyond environment variables (e.g. a shim that hooks
// child_process.spawn itself) is out of scope; the verbatim committed round-40
// attack (NODE_OPTIONS=--require forger.cjs) is refused before the driver runs.
//
// Usage:
//   node scripts/measure-c1-round41.mjs --out <fresh receipt.json> --scratch <dir>
//   node scripts/measure-c1-round41.mjs --battery          (spawn-level refusals)
//   node scripts/measure-c1-round41.mjs --battery-probe    (probe mode, internal)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SELF = path.join(ROOT, 'scripts/measure-c1-round41.mjs');
const DRIVER = path.join(ROOT, 'scripts/playwright-firefox-egress-round41.mjs');
const COUNTER = path.join(ROOT, '.ufo/waves/round-41/counters/c1-session-bound-v4.mjs');
const CLAIMS = path.join(ROOT, '.ufo/waves/round-41/claims.json');
const FIXTURES = path.join(ROOT, '.ufo/waves/round-41/fixtures');
const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const FORBIDDEN_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)$/;
const ENV_ALLOW = ['PATH', 'HOME', 'LANG', 'TZ', 'TMPDIR', 'XDG_RUNTIME_DIR', 'DBUS_SESSION_BUS_ADDRESS', 'HYAKU_SCRATCH', 'TABI_RUN_NONCE', 'USER', 'LOGNAME', 'SHELL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'FONTCONFIG_PATH', 'FONTCONFIG_FILE', 'LC_ALL', 'LC_CTYPE', 'XDG_DATA_DIRS', 'XDG_CONFIG_DIRS', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'SSH_AUTH_SOCK'];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sha256File = (p) => sha256(fs.readFileSync(p));
const uptimeTicks = (() => { try { const hz = Number(execFileSync('getconf', ['CLK_TCK'], { encoding: 'utf8' }).trim()) || 100; return () => Math.round(parseFloat(fs.readFileSync('/proc/uptime', 'utf8').split(' ')[0]) * hz); } catch { return () => null; } })();

// Child env gate probe: runs inside a freshly-spawned scrubbed process and
// reads BOTH its own /proc/self/environ (kernel exec-time record of the spawn)
// and its parent's /proc/<ppid>/environ (kernel exec-time record of the
// measure process). User-land cannot rewrite either.
const GATE_SRC = `
const fs=require('fs');
const RE=${FORBIDDEN_ENV};
function names(p){try{return fs.readFileSync('/proc/'+p+'/environ','latin1').split('\\0').filter(Boolean).map(e=>e.split('=')[0]);}catch{return null}}
const selfNames=names('self'), parentNames=names(process.ppid);
const r={schema:'tabi-r41-env-gate',
 self:{readable:selfNames!==null,forbidden:selfNames===null?['<unreadable>']:selfNames.filter(n=>RE.test(n))},
 parent:{ppid:process.ppid,readable:parentNames!==null,forbidden:parentNames===null?['<unreadable>']:parentNames.filter(n=>RE.test(n))},
 execArgvLen:process.execArgv.length,execArgvFlag:process.execArgv.slice(0,1)};
// this child legitimately runs as --eval <src>: NODE_OPTIONS preloads prepend
// node flags, so clean = exactly [--eval|-e, <src>] with flag first.
r.execArgvClean = process.execArgv.length===2&&/^(--eval|-e)$/.test(process.execArgv[0]);
r.ok = r.self.readable&&r.self.forbidden.length===0&&r.parent.readable&&r.parent.forbidden.length===0&&r.execArgvClean;
console.log(JSON.stringify(r));`;
// execArgv for a --eval child is ['-e', src] or ['--eval', src]; clean means
// no preload/loader flag among the node flags.
const GATE_ARGV_OK = (flag, len) => len === 2 && /^(--eval|-e)$/.test(flag || '');
function runGate() {
  // fresh child whose spawned environ is scrubbed; it reads kernel environ of
  // self and parent. Node --eval argv carries the source, no file dependency.
  const r = spawnSync(process.execPath, ['--eval', GATE_SRC], {
    env: scrubEnv(), encoding: 'utf8', maxBuffer: 4 << 20, timeout: 15000,
  });
  if (r.error) return { ok: false, error: String(r.error.message || r.error), self: null, parent: null };
  let parsed = null;
  try { parsed = JSON.parse(r.stdout.trim()); } catch { }
  if (!parsed) return { ok: false, error: `gate probe unparseable (exit ${r.status})`, stdout: r.stdout, stderr: r.stderr };
  parsed.execArgvClean = parsed.execArgvClean === true && GATE_ARGV_OK(parsed.execArgvFlag && parsed.execArgvFlag[0], parsed.execArgvLen);
  parsed.ok = parsed.ok && parsed.execArgvClean;
  return parsed;
}

function scrubEnv(extra = {}) {
  const env = {};
  for (const k of ENV_ALLOW) if (process.env[k] !== undefined) env[k] = process.env[k];
  for (const [k, v] of Object.entries(extra)) env[k] = v;
  return env;
}

function selfEnvCheck() {
  let names = null;
  try { names = fs.readFileSync('/proc/self/environ', 'latin1').split('\0').filter(Boolean).map((e) => e.split('=')[0]); } catch { }
  const forbidden = names === null ? ['<proc-environ-unreadable>'] : names.filter((n) => FORBIDDEN_ENV.test(n));
  return {
    procEnvironReadable: names !== null,
    nameCount: names === null ? null : names.length,
    forbiddenNames: forbidden,
    execArgv: process.execArgv,
    execArgvClean: Array.isArray(process.execArgv) && process.execArgv.length === 0,
    execPath: process.execPath,
    nodeSha256: (() => { try { return sha256File(process.execPath); } catch { return null; } })(),
  };
}

// Witness child source: samples measure's descendant tree every 50 ms with
// per-pid startTicks + exe readlink; writes JSON on SIGTERM.
const WITNESS_SRC = `
const fs=require('fs');
const out=process.env.TABI_WITNESS_OUT;
const root=Number(process.env.TABI_WITNESS_ROOT);
const hz=Number(require('child_process').execFileSync('getconf',['CLK_TCK'],{encoding:'utf8'}).trim())||100;
const uptime=()=>Math.round(parseFloat(fs.readFileSync('/proc/uptime','utf8').split(' ')[0])*hz);
const envNames=p=>{try{return fs.readFileSync('/proc/'+p+'/environ','latin1').split('\\0').filter(Boolean).map(e=>e.split('=')[0])}catch{return null}};
const samples=[];
function table(){
  let rows=null;
  try{const r=require('child_process').spawnSync('ps',['-eo','pid=,ppid='],{encoding:'utf8',maxBuffer:8<<20});if(r.error||r.status!==0)return null;rows=r.stdout.split('\\n').map(l=>l.trim().split(/\\s+/)).filter(m=>m.length>=2&&/^\\d+$/.test(m[0])&&/^\\d+$/.test(m[1])).map(m=>[Number(m[0]),Number(m[1])]);}catch{return null}
  return rows;
}
function ident(pid){
  try{const s=fs.readFileSync('/proc/'+pid+'/stat','utf8');const e=s.lastIndexOf(')');if(e<0)return null;const f=s.slice(e+2).split(' ');let exe=null;try{exe=fs.readlinkSync('/proc/'+pid+'/exe')}catch{};let comm=s.slice(s.indexOf('(')+1,e);return {pid,ppid:Number(f[1]),startTicks:Number(f[19]),exe,comm};}catch{return null}
}
function descendants(){
  const rows=table();if(rows===null)return null;
  const ch=new Map();for(const [pid,ppid] of rows){if(!ch.has(ppid))ch.set(ppid,[]);ch.get(ppid).push(pid)}
  const seen=new Set(),q=[root],out=[];
  while(q.length){const p=q.shift();if(seen.has(p))continue;seen.add(p);const id=ident(p);if(id)out.push(id);for(const c of ch.get(p)||[])q.push(c)}
  return out;
}
const t0=uptime();
const iv=setInterval(()=>{const d=descendants();if(d)samples.push({t:Date.now(),tTicks:uptime(),tree:d});},50);
process.on('SIGTERM',()=>{clearInterval(iv);const env=envNames('self');
  fs.writeFileSync(out,JSON.stringify({schema:'tabi-r41-witness',rootPid:root,nonce:process.env.TABI_RUN_NONCE||null,startedTicks:t0,endedTicks:uptime(),samples,environ:env},null,0)+'\\n');
  process.exit(0);});
`;

async function spawnWitness(nonce, outPath) {
  const env = scrubEnv({ TABI_WITNESS_OUT: outPath, TABI_WITNESS_ROOT: String(process.pid), TABI_RUN_NONCE: nonce });
  const child = spawn(process.execPath, ['--eval', WITNESS_SRC], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let err = '';
  child.stderr.on('data', (d) => { err += d; });
  await new Promise((r) => setTimeout(r, 60));
  return { child, stderr: () => err };
}

function loadClaimsPins() {
  try {
    const c = JSON.parse(fs.readFileSync(CLAIMS, 'utf8'));
    return { firefoxBinSha256: c.producerPins?.firefoxBinSha256 || null, nodeSha256: c.producerPins?.nodeSha256 || null, digests: c.frozenDigests || {} };
  } catch { return { firefoxBinSha256: null, nodeSha256: null, digests: {} }; }
}

function refuse(outPath, finding, extra = {}) {
  const body = { schema: 'tabi-r41-c1-measure', predicate: false, finding, ...extra };
  console.log(JSON.stringify(body));
  try { fs.writeFileSync(outPath.replace(/\.json$/, '.measure.json'), JSON.stringify({ ...body, refusedAt: new Date().toISOString() }, null, 1) + '\n'); } catch { }
  process.exit(finding === 'environment-loader-contamination' ? 2 : 2);
}

async function measureMain() {
  const argv = process.argv.slice(2);
  let out = null, scratch = null;
  for (let i = 0; i < argv.length; i++) { if (argv[i] === '--out') out = argv[++i]; else if (argv[i] === '--scratch') scratch = argv[++i]; }
  if (!out || !scratch) { console.error('usage: node scripts/measure-c1-round41.mjs --out <fresh receipt.json> --scratch <dir>'); process.exit(64); }
  const outPath = path.resolve(out), scratchPath = path.resolve(scratch);
  if (fs.existsSync(outPath)) { console.error(JSON.stringify({ schema: 'tabi-r41-c1-measure', finding: 'output-already-exists', path: outPath })); process.exit(1); }

  // Stage 0 — environment boundary: refuse any loader/injection vector before
  // any child is spawned. The kernel environ of THIS process is authoritative.
  const selfEnv = selfEnvCheck();
  const gate = runGate();
  const envContaminated = !selfEnv.procEnvironReadable || selfEnv.forbiddenNames.length > 0 || !selfEnv.execArgvClean || !gate.ok;
  const gateReport = { self: selfEnv, child: gate };
  if (envContaminated) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    refuse(outPath, 'environment-loader-contamination', { gate: gateReport });
  }

  // Stage 1 — digest pinning: producer bytes must equal the frozen digests.
  const pins = loadClaimsPins();
  const digests = {
    'scripts/measure-c1-round41.mjs': sha256File(SELF),
    'scripts/playwright-firefox-egress-round41.mjs': sha256File(DRIVER),
    '.ufo/waves/round-41/counters/c1-session-bound-v4.mjs': sha256File(COUNTER),
  };
  const digestFindings = [];
  for (const [k, v] of Object.entries(pins.digests)) {
    if (digests[k] !== undefined && digests[k] !== v) digestFindings.push(`digest-mismatch:${k}`);
  }
  if (pins.nodeSha256 && selfEnv.nodeSha256 !== pins.nodeSha256) digestFindings.push('digest-mismatch:node');
  if (digestFindings.length) refuse(outPath, 'producer-digest-mismatch', { gate: gateReport, digests, digestFindings });

  // Stage 2 — witness + driver. The witness records this process's descendant
  // tree independently of the driver's self-report.
  const nonce = crypto.randomBytes(32).toString('hex');
  const witnessPath = outPath.replace(/\.json$/, '.witness.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(scratchPath, { recursive: true });
  const witness = await spawnWitness(nonce, witnessPath);
  const t0 = Date.now();
  const run = spawnSync(process.execPath, [DRIVER, '--out', outPath, '--runs', '2', '--scratch', scratchPath, '--nonce', nonce], {
    cwd: ROOT, encoding: 'utf8', env: scrubEnv({ TABI_RUN_NONCE: nonce, HYAKU_SCRATCH: scratchPath }), maxBuffer: 16 << 20,
  });
  const elapsedMs = Date.now() - t0;
  await new Promise((r) => setTimeout(r, 200));
  witness.child.kill('SIGTERM');
  const witnessExit = await new Promise((r) => { const to = setTimeout(r, 5000); witness.child.on('exit', () => { clearTimeout(to); r(); }); });

  let receipt = null, receiptSha = null;
  try { const raw = fs.readFileSync(outPath, 'utf8'); receipt = JSON.parse(raw); receiptSha = sha256(raw); } catch (e) {
    refuse(outPath, 'driver-receipt-unreadable', { gate: gateReport, driverExit: run.status, driverStdout: run.stdout, driverStderr: run.stderr, witnessStderr: witness.stderr() });
  }
  let witnessDoc = null, witnessSha = null;
  try { const raw = fs.readFileSync(witnessPath, 'utf8'); witnessDoc = JSON.parse(raw); witnessSha = sha256(raw); } catch (e) {
    refuse(outPath, 'witness-unreadable', { gate: gateReport, driverExit: run.status, witnessStderr: witness.stderr() });
  }
  const nonceMatches = receipt.runNonce === nonce && Array.isArray(receipt.runs) && receipt.runs.length === 2 && receipt.runs.every((r) => r.runNonce === nonce);
  if (!nonceMatches) refuse(outPath, 'fresh-run-nonce-mismatch', { gate: gateReport, driverExit: run.status, receiptSha256: receiptSha });

  // Stage 3 — counter scoring. Post-hoc re-verification reads the committed
  // counter bytes, not anything the driver could influence.
  const cRun = spawnSync(process.execPath, [COUNTER, outPath, '--nonce', nonce, '--witness', witnessPath, '--measure', '-', '--pins', CLAIMS], {
    cwd: ROOT, encoding: 'utf8', env: scrubEnv(), maxBuffer: 16 << 20, input: JSON.stringify({ elapsedMs, gate: gateReport, digests }),
  });
  let counter = null;
  try { counter = JSON.parse(cRun.stdout); } catch { }
  if (!counter) refuse(outPath, 'counter-output-unparseable', { gate: gateReport, driverExit: run.status, counterExit: cRun.status, counterStdout: cRun.stdout, counterStderr: cRun.stderr });

  const result = {
    schema: 'tabi-r41-c1-measure',
    out: outPath, witness: witnessPath,
    driverPath: 'scripts/playwright-firefox-egress-round41.mjs',
    digests, elapsedMs,
    driverExit: run.status, driverStdout: run.stdout, driverStderr: run.stderr,
    nonceMatches: true, counterExit: cRun.status,
    receiptSha256: receiptSha, witnessSha256: witnessSha,
    gate: gateReport, counter,
  };
  console.log(JSON.stringify(result));
  process.exit(run.status === 0 && cRun.status === 0 && counter.predicate === true ? 0 : 1);
}

// --- battery mode: spawn-level refusal controls ------------------------------
// --battery-probe runs ONLY the env-gate stage and reports; --battery spawns
// this file under each contamination vector and asserts exit 2 with finding
// environment-loader-contamination, in a scrubbed parent environment.
function batteryProbe() {
  const selfEnv = selfEnvCheck();
  const gate = runGate();
  const contaminated = !selfEnv.procEnvironReadable || selfEnv.forbiddenNames.length > 0 || !selfEnv.execArgvClean || !gate.ok;
  console.log(JSON.stringify({ schema: 'tabi-r41-battery-probe', contaminated, finding: contaminated ? 'environment-loader-contamination' : null, self: selfEnv, child: gate }));
  process.exit(contaminated ? 2 : 0);
}
function batteryMain() {
  const attacks = [
    ['forger-r39-verbatim', `NODE_OPTIONS=--require ${FIXTURES}/forger-round39.cjs`],
    ['forger-r41-retargeted', `NODE_OPTIONS=--require ${FIXTURES}/forger-round41.cjs`],
    ['node-path', `NODE_PATH=${FIXTURES}/shadow_modules`],
    ['ld-preload', `LD_PRELOAD=${FIXTURES}/libforger.so`],
    ['esm-loader', `NODE_OPTIONS=--experimental-loader ${FIXTURES}/loader.mjs`],
  ];
  const results = [];
  for (const [name, envStr] of attacks) {
    const r = spawnSync('/bin/bash', ['-c', `env "${envStr}" ${process.execPath} ${SELF} --battery-probe`], {
      encoding: 'utf8', env: scrubEnv(), maxBuffer: 4 << 20, timeout: 20000,
    });
    let parsed = null; try { parsed = JSON.parse((r.stdout || '').trim()); } catch { }
    const ok = r.status === 2 && parsed && parsed.finding === 'environment-loader-contamination';
    results.push({ case: name, vector: envStr, exit: r.status, finding: parsed ? parsed.finding : null, pass: ok === true });
  }
  const clean = spawnSync(process.execPath, [SELF, '--battery-probe'], { encoding: 'utf8', env: scrubEnv(), maxBuffer: 4 << 20, timeout: 20000 });
  let cp = null; try { cp = JSON.parse((clean.stdout || '').trim()); } catch { }
  results.push({ case: 'clean', vector: null, exit: clean.status, finding: cp ? cp.finding : null, pass: clean.status === 0 && cp && cp.contaminated === false });
  const out = { schema: 'tabi-r41-battery', cases: results, allPass: results.every((x) => x.pass) };
  console.log(JSON.stringify(out));
  process.exit(out.allPass ? 0 : 1);
}

const argv2 = process.argv.slice(2);
if (argv2.includes('--battery-probe')) batteryProbe();
else if (argv2.includes('--battery')) batteryMain();
else measureMain().catch((e) => { console.error(JSON.stringify({ schema: 'tabi-r41-c1-measure', finding: 'wrapper-exception', message: e.message })); process.exit(2); });
