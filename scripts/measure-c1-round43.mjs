#!/usr/bin/env node
// measure-c1-round43.mjs — tabi round 43 signature-authenticated measurement
// wrapper. Closes the round-42 closure routed defect on receipt authenticity
// (QUALITY criterion 104): the round-42 counter scored committed bytes, so a
// nonce relabel or a fully synthetic receipt+witness pair reached predicate
// true with zero browser runs. This wrapper:
//   1. generates an Ed25519 keypair PER INVOCATION; the private half is never
//      written to disk, never appears in argv/env/receipts, and is dropped at
//      exit (in-memory only, r41 residual model unchanged otherwise);
//   2. spawns an independent witness child that generates its OWN keypair and
//      signs its sample tree with it (the wrapper cannot forge the witness
//      attestation; it only learns the witness public half);
//   3. writes a signed measure record binding receiptSha256, witnessSha256,
//      the nonce, both public keys, producer digests and the env-gate report;
//   4. runs a challenge-response with the counter: the counter generates a
//      fresh in-invocation challenge and the wrapper signs it with the run
//      private key. Scoring therefore requires possession of a key that
//      existed only inside a real wrapper invocation.
// Declared residual threat model (frozen in .ufo/waves/round-43/claims.json):
//   (i) an attacker who harvests a per-invocation private key from a prior
//       honest run must first have run the chain (a browser run happened —
//       not a do-nothing reach);
//   (ii) process-memory / kernel-level attacks against the wrapper remain out
//       of scope exactly as in rounds 40-42;
//   (iii) on-disk tampering of committed pins is out of model (committed-byte
//       re-derivation at closure catches it).
// Round-40 closure routed defects stay closed here: F4 env-level substitution
// (kernel /proc environ gate, execArgv cleanliness, pinned producer digests),
// F1 zero-observation blind (positive owned-socket observations), F3 stale
// process tree (identity-bound refreshed witness trees).
//
// Usage:
//   node scripts/measure-c1-round43.mjs --out <fresh receipt.json> \
//        --measure-out <fresh measure-record.json> --scratch <dir>
//   node scripts/measure-c1-round43.mjs --battery          (spawn-level refusals)
//   node scripts/measure-c1-round43.mjs --battery-probe    (probe mode, internal)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { execFileSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const SELF = path.join(ROOT, 'scripts/measure-c1-round43.mjs');
const DRIVER = path.join(ROOT, 'scripts/playwright-firefox-egress-round43.mjs');
const COUNTER = path.join(ROOT, '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs');
const CLAIMS = path.join(ROOT, '.ufo/waves/round-43/claims.json');
const FIXTURES = path.join(ROOT, '.ufo/waves/round-41/fixtures');
const FIREFOX_BIN = '/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox';
const FORBIDDEN_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)$/;
const ENV_ALLOW = ['PATH', 'HOME', 'LANG', 'TZ', 'TMPDIR', 'XDG_RUNTIME_DIR', 'DBUS_SESSION_BUS_ADDRESS', 'HYAKU_SCRATCH', 'TABI_RUN_NONCE', 'USER', 'LOGNAME', 'SHELL', 'DISPLAY', 'WAYLAND_DISPLAY', 'XAUTHORITY', 'FONTCONFIG_PATH', 'FONTCONFIG_FILE', 'LC_ALL', 'LC_CTYPE', 'XDG_DATA_DIRS', 'XDG_CONFIG_DIRS', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_STATE_HOME', 'SSH_AUTH_SOCK'];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sha256File = (p) => sha256(fs.readFileSync(p));
// Canonical JSON: keys sorted recursively, no whitespace — the byte shape both
// the witness and this wrapper sign, and the counter re-derives.
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

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
const r={schema:'tabi-r43-env-gate',
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
// per-pid startTicks + exe readlink; generates its OWN Ed25519 keypair and
// signs the canonical sample document with it on SIGTERM; the public half and
// the signature travel inside its JSON output. The wrapper never sees the
// witness private half, so it cannot forge or re-sign the attestation.
const WITNESS_SRC = `
const fs=require('fs'),crypto=require('crypto');
const out=process.env.TABI_WITNESS_OUT;
const root=Number(process.env.TABI_WITNESS_ROOT);
const hz=Number(require('child_process').execFileSync('getconf',['CLK_TCK'],{encoding:'utf8'}).trim())||100;
const uptime=()=>Math.round(parseFloat(fs.readFileSync('/proc/uptime','utf8').split(' ')[0])*hz);
const envNames=p=>{try{return fs.readFileSync('/proc/'+p+'/environ','latin1').split('\\0').filter(Boolean).map(e=>e.split('=')[0])}catch{return null}}
function canonical(v){if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';const k=Object.keys(v).sort();return '{'+k.map(x=>JSON.stringify(x)+':'+canonical(v[x])).join(',')+'}'}
const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');
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
  const doc={schema:'tabi-r43-witness',rootPid:root,nonce:process.env.TABI_RUN_NONCE||null,startedTicks:t0,endedTicks:uptime(),samples,environ:env};
  const signed={rootPid:root,nonce:doc.nonce,startedTicks:t0,endedTicks:doc.endedTicks,samples};
  const sig=crypto.sign(null,Buffer.from(canonical(signed),'utf8'),privateKey);
  doc.attestation={scheme:'ed25519',publicKey:publicKey.export({type:'spki',format:'pem'}),over:crypto.createHash('sha256').update(canonical(signed),'utf8').digest('hex'),value:sig.toString('hex')};
  fs.writeFileSync(out,JSON.stringify(doc,null,0)+'\\n');
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
  const body = { schema: 'tabi-r43-c1-measure', predicate: false, finding, ...extra };
  console.log(JSON.stringify(body));
  try { fs.writeFileSync(outPath.replace(/\.json$/, '.measure.json'), JSON.stringify({ ...body, refusedAt: new Date().toISOString() }, null, 1) + '\n'); } catch { }
  process.exit(finding === 'environment-loader-contamination' ? 2 : 2);
}

async function measureMain() {
  const argv = process.argv.slice(2);
  let out = null, scratch = null, measureOut = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--scratch') scratch = argv[++i];
    else if (argv[i] === '--measure-out') measureOut = argv[++i];
  }
  if (!out || !scratch || !measureOut) { console.error('usage: node scripts/measure-c1-round43.mjs --out <fresh receipt.json> --measure-out <fresh record.json> --scratch <dir>'); process.exit(64); }
  const outPath = path.resolve(out), scratchPath = path.resolve(scratch), measurePath = path.resolve(measureOut);
  for (const p of [outPath, measurePath]) {
    if (fs.existsSync(p)) { console.error(JSON.stringify({ schema: 'tabi-r43-c1-measure', finding: 'output-already-exists', path: p })); process.exit(1); }
  }

  // Per-invocation Ed25519 run keypair. The private half stays in this
  // process's memory only: no fs.write call in this file receives it, it is
  // never exported, and it goes out of scope at exit.
  const { publicKey: runPub, privateKey: runPriv } = crypto.generateKeyPairSync('ed25519');
  const runPubPem = runPub.export({ type: 'spki', format: 'pem' }).toString();

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
    'scripts/measure-c1-round43.mjs': sha256File(SELF),
    'scripts/playwright-firefox-egress-round43.mjs': sha256File(DRIVER),
    '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs': sha256File(COUNTER),
  };
  const digestFindings = [];
  for (const [k, v] of Object.entries(pins.digests)) {
    if (digests[k] !== undefined && digests[k] !== v) digestFindings.push(`digest-mismatch:${k}`);
  }
  if (pins.nodeSha256 && selfEnv.nodeSha256 !== pins.nodeSha256) digestFindings.push('digest-mismatch:node');
  if (digestFindings.length) refuse(outPath, 'producer-digest-mismatch', { gate: gateReport, digests, digestFindings });

  // Stage 2 — witness + driver. The witness records this process's descendant
  // tree independently of the driver's self-report, and signs it with its own
  // per-invocation key.
  const nonce = crypto.randomBytes(32).toString('hex');
  const witnessPath = outPath.replace(/\.json$/, '.witness.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(path.dirname(measurePath), { recursive: true });
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
  let witnessDoc = null, witnessRaw = null, witnessSha = null;
  try { witnessRaw = fs.readFileSync(witnessPath, 'utf8'); witnessDoc = JSON.parse(witnessRaw); witnessSha = sha256(witnessRaw); } catch (e) {
    refuse(outPath, 'witness-unreadable', { gate: gateReport, driverExit: run.status, witnessStderr: witness.stderr() });
  }
  const nonceMatches = receipt.runNonce === nonce && Array.isArray(receipt.runs) && receipt.runs.length === 2 && receipt.runs.every((r) => r.runNonce === nonce);
  if (!nonceMatches) refuse(outPath, 'fresh-run-nonce-mismatch', { gate: gateReport, driverExit: run.status, receiptSha256: receiptSha });
  const witnessAttestationOk = witnessDoc && witnessDoc.attestation && typeof witnessDoc.attestation.publicKey === 'string'
    && /^([0-9a-f]{128})$/.test(witnessDoc.attestation?.value || '');
  if (!witnessAttestationOk) refuse(outPath, 'witness-attestation-absent', { gate: gateReport, witnessExit });

  // Signed measure record: binds the receipt and witness bytes, the nonce,
  // both public keys, the producer digests and the gate report. Signature is
  // Ed25519 over the canonical unsigned form.
  const measureRecord = {
    schema: 'tabi-r43-c1-measure-record',
    nonce,
    createdAt: new Date().toISOString(),
    pubkeys: { wrapper: runPubPem, witness: witnessDoc.attestation.publicKey },
    bindings: { receiptSha256: receiptSha, witnessSha256: witnessSha, runs: Array.isArray(receipt.runs) ? receipt.runs.length : 0 },
    digests,
    gate: gateReport,
    elapsedMs,
    driverExit: run.status,
  };
  const unsigned = canonical(measureRecord);
  measureRecord.signature = {
    scheme: 'ed25519',
    over: sha256(unsigned),
    value: crypto.sign(null, Buffer.from(unsigned, 'utf8'), runPriv).toString('hex'),
  };
  const measureRaw = JSON.stringify(measureRecord, null, 1) + '\n';
  fs.writeFileSync(measurePath, measureRaw);
  const measureSha = sha256(measureRaw);

  // Stage 3 — counter scoring INSIDE this invocation. The counter generates a
  // fresh challenge on fd3; this wrapper signs it with the run private key on
  // fd4. The private key never crosses this boundary.
  const counterExit = await new Promise((resolve) => {
    const child = spawn(process.execPath, [COUNTER, outPath, '--measure', measurePath], {
      cwd: ROOT, env: scrubEnv(), stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe'],
    });
    let outBuf = '', errBuf = '';
    child.stdout.on('data', (d) => { outBuf += d; });
    child.stderr.on('data', (d) => { errBuf += d; });
    let challenge = Buffer.alloc(0);
    child.stdio[3].on('data', (d) => { challenge = Buffer.concat([challenge, d]); });
    child.stdio[3].on('end', () => {
      try {
        if (challenge.length === 32) {
          const sig = crypto.sign(null, challenge, runPriv);
          child.stdio[4].write(sig.toString('hex') + '\n');
        }
      } catch { }
      try { child.stdio[4].end(); } catch { }
    });
    child.on('exit', (code) => { global.__counterOut = outBuf; global.__counterErr = errBuf; resolve(code); });
  });
  let counter = null;
  try { counter = JSON.parse(global.__counterOut || ''); } catch { }
  if (!counter) refuse(outPath, 'counter-output-unparseable', { gate: gateReport, driverExit: run.status, counterExit, counterStdout: global.__counterOut, counterStderr: global.__counterErr });

  const result = {
    schema: 'tabi-r43-c1-measure',
    out: outPath, witness: witnessPath, measureRecord: measurePath,
    driverPath: 'scripts/playwright-firefox-egress-round43.mjs',
    counterPath: '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs',
    digests, elapsedMs, measureRecordSha256: measureSha,
    driverExit: run.status, driverStdout: run.stdout, driverStderr: run.stderr,
    nonceMatches: true, counterExit,
    receiptSha256: receiptSha, witnessSha256: witnessSha,
    witnessAttestationVerified: counter.witnessAttestationVerified === true,
    challengeVerified: counter.challengeVerified === true,
    gate: gateReport, counter,
  };
  console.log(JSON.stringify(result));
  const ok = run.status === 0 && counterExit === 0 && counter.predicate === true && counter.challengeVerified === true && counter.witnessAttestationVerified === true;
  process.exit(ok ? 0 : 1);
}

// --- battery mode: spawn-level refusal controls ------------------------------
// --battery-probe runs ONLY the env-gate stage and reports; --battery spawns
// this file under each contamination vector and asserts exit 2 with finding
// environment-loader-contamination, in a scrubbed parent environment.
function batteryProbe() {
  const selfEnv = selfEnvCheck();
  const gate = runGate();
  const contaminated = !selfEnv.procEnvironReadable || selfEnv.forbiddenNames.length > 0 || !selfEnv.execArgvClean || !gate.ok;
  console.log(JSON.stringify({ schema: 'tabi-r43-battery-probe', contaminated, finding: contaminated ? 'environment-loader-contamination' : null, self: selfEnv, child: gate }));
  process.exit(contaminated ? 2 : 0);
}
function batteryMain() {
  const attacks = [
    ['forger-r39-verbatim', `NODE_OPTIONS=--require ${FIXTURES}/forger-round39.cjs`],
    ['forger-r41-retargeted', `NODE_OPTIONS=--require ${FIXTURES}/forger-round41.cjs`],
    ['node-path', `NODE_PATH=${FIXTURES}/shadow_modules`],
    ['ld-preload', `LD_PRELOAD=${FIXTURES}/libforger.so`],
    ['esm-loader', `NODE_OPTIONS=--experimental-loader ${FIXTURES}/loader.mjs`],
    ['esm-import', `NODE_OPTIONS=--import ${FIXTURES}/loader.mjs`],
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
  const out = { schema: 'tabi-r43-battery', cases: results, allPass: results.every((x) => x.pass) };
  console.log(JSON.stringify(out));
  process.exit(out.allPass ? 0 : 1);
}

const argv2 = process.argv.slice(2);
if (argv2.includes('--battery-probe')) batteryProbe();
else if (argv2.includes('--battery')) batteryMain();
else measureMain().catch((e) => { console.error(JSON.stringify({ schema: 'tabi-r43-c1-measure', finding: 'wrapper-exception', message: e.message })); process.exit(2); });
