#!/usr/bin/env node
// Counter: tabi round 98, C1, predicate `C1-CLIENT-OOPIF-UPLOADMODES-R98` (frozen in plans/round-98.md).
// Reads a receipt of scripts/client-oopif-uploadmodes-round98.mjs and checks, per leg (every child is the
// cross-site `localhost` iframe):
//   every leg: DevTools `Chrome/155.0.8059.84` and the client's own browser version string; the arm's
//     library/mode/isLocal/input fields and the exact parent and child URLs; the client lists exactly the
//     frames [parent, child]; exactly one browser-level iframe target, with url = child URL; the
//     parent's #pp holds [];
//   PUA, PLA (client-launched browser, answer path) and PLL (connectOverCDP isLocal, answer path): the
//     call resolves with no error; #s holds exactly [[answer, 22, text/plain]]; #s saw exactly
//     [input trusted, change trusted]; #s.files[0].text() gives the answer bytes;
//   PLAB (launched), PLB (connectOverCDP default), PLLB (connectOverCDP isLocal), each with the payload
//     object: the call resolves with no error; #s holds exactly [[payload, 29, text/plain]]; #s saw
//     exactly [input untrusted, change untrusted]; the read gives the payload bytes;
//   PLLM (connectOverCDP isLocal, absent path): the call ends `error`, name `Error`, message exactly
//     "ENOENT: no such file or directory, stat '<missingPath>'"; #s holds [], saw no event, read null;
//   PUR (Puppeteer connect, absent path): resolves with no error; #s holds exactly
//     [["tabi-r98-missing.txt", 0, "text/plain"]]; #s saw exactly [input trusted, change trusted]; the read
//     rejects with name `NotFoundError` and the Blink message (S241).
//   (No leg may record a `click` on #s: every events list is checked exactly.)
// Receipt level: schema, nonce, driver pin, chromium tag, reps, the two client libraries pinned on
// version, npm lockfile integrity string, the sha256 of the upload-bearing file and a sha256 over the
// installed package directory (r97 A1 item 4 definition), the answer and payload descriptors, the missing
// path (absolute, basename tabi-r98-missing.txt, `missingExists` exactly false), ports, the exact leg
// list, empty failures with no leg error, distinct UUID browser ids.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt passes this
//                     mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce in its
//                     environment and a receipt path inside a fresh mkdtemp directory under --scratch,
//                     then check that receipt; additionally `driver-exit` (driver exit status 0),
//                     `ports-bound` (receipt ports = --ports) and `missing-bound` (receipt missingPath =
//                     <driver scratch>/tabi-r98-missing.txt). Setup refusals (exit 2, verdict `setup`,
//                     `driverRun` included): driver usage refusal (exit 2), chromium never came up
//                     (driver exit 3), driver ended by a signal or exit 130, counter interrupted, receipt
//                     path not a regular file.
// Usage:
//   node check-client-oopif-uploadmodes-round98.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --deps <ABS dir> --scratch <ABS dir>
//      --ports <http,child,cdp>) [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PREDICATE = 'C1-CLIENT-OOPIF-UPLOADMODES-R98';
const SCHEMA = 'tabi-client-oopif-uploadmodes-r98';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/client-oopif-uploadmodes-round98.mjs';
const ANSWER = { name: 'tabi-r98-answer.txt', size: 22, text: 'tabi round 98 answer.\n' };
const PAYLOAD = { name: 'tabi-r98-payload.txt', size: 29, mimeType: 'text/plain', text: 'tabi round 98 payload bytes.\n' };
const MISSING = 'tabi-r98-missing.txt';
const NOT_FOUND = ['err', 'NotFoundError', 'A requested file or directory could not be found at the time an operation was processed.'];
const LIBS = {
  'puppeteer-core': { version: '25.16.0', integrity: 'sha512-VA5Pf54N8shfopNkZZXCdiiwfnnY8ZJYAMqFQRhlH5mGUhfwf53Ar770GPtdpTDLUqvQeYpIBtC9/G2Jij2IJw==', file: 'lib/puppeteer/cdp/ElementHandle.js', fileSha256: '162b71998ba1761786bbd9ee1a4f94e0d7f0efe2d339fcafc4490eba4e9b7c96', treeFiles: 927, treeSha256: '968a85e856058073407c713275a0d6d0352a2063711cb1bc1de367691cd1e180' },
  'playwright-core': { version: '1.65.0', integrity: 'sha512-vNSKgH6YqtN7cdT/L334zo0a+YwkrpicyrHJlWWPIm/Q+Nn2SWInil01oT0mbu96U4GgoRtCYQD9CzJQgju+lA==', file: 'lib/coreBundle.js', fileSha256: '4ef8330594818d8f464de939e32bca62b758099e0d0e94a56095406da963f7f1', treeFiles: 116, treeSha256: '245846938f2b5f5c706b6670d0751ccef42bdc68ef7d38bb7eb4a471bf5cd641' },
};
const T = (t) => [t, true];
const U = (t) => [t, false];
const ARMS = ['PUA', 'PLA', 'PLAB', 'PLB', 'PLLB', 'PLL', 'PLLM', 'PUR'];
const F_ANSWER = [[ANSWER.name, ANSWER.size, 'text/plain']];
const F_PAYLOAD = [[PAYLOAD.name, PAYLOAD.size, PAYLOAD.mimeType]];
const ARM = {
  PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] },
  PLA: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] },
  PLAB: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] },
  PLB: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] },
  PLLB: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] },
  PLL: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] },
  PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [], read: null },
  PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing', outcome: 'resolved', files: [[MISSING, 0, 'text/plain']], events: [T('input'), T('change')], read: NOT_FOUND },
};
const DRIVER_TIMEOUT_MS = 900000;
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const flag = (n) => argv.includes('--' + n);
const refuse = (d, extra = {}) => { console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'setup', detail: d, ...extra })); process.exit(2); };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) refuse('--lane must be an absolute path');
const pin = opt('expect-driver-sha256');
if (!/^[0-9a-f]{64}$/.test(pin || '')) refuse('--expect-driver-sha256 must be 64 hex');
const reps = Number(opt('reps') || '3');
if (!Number.isInteger(reps) || reps < 1 || reps > 10) refuse('--reps must be 1..10');
const live = flag('live');
let receiptPath = opt('receipt');
let expectNonce = opt('expect-nonce');
if (live === !!receiptPath) refuse('exactly one of --live or --receipt');
let revision = null;
{
  const r = spawnSync('git', ['-C', lane, 'rev-parse', 'master'], { encoding: 'utf8' });
  revision = r.status === 0 ? r.stdout.trim() : null;
}
const driverPath = path.join(lane, DRIVER_REL);
let driverSha = null;
try { driverSha = sha256(fs.readFileSync(driverPath)); } catch { refuse('driver missing: ' + driverPath); }

let driverRun = null;
let livePorts = null;
let liveMissing = null;
if (live) {
  const scratch = opt('scratch');
  if (!scratch || !path.isAbsolute(scratch)) refuse('--live needs an absolute --scratch');
  const deps = opt('deps');
  if (!deps || !path.isAbsolute(deps)) refuse('--live needs an absolute --deps');
  const ports = (opt('ports') || '').split(',');
  if (ports.length !== 3 || !ports.every((p) => /^[0-9]+$/.test(p))) refuse('--ports must be http,child,cdp');
  livePorts = ports.map(Number);
  if (driverSha !== pin) {
    console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, checkCount: 1, findings: [{ id: 'driver-pin', leg: null, detail: 'driver sha256 ' + driverSha + ' != pin ' + pin + ' (driver not run)' }] }));
    process.exit(1);
  }
  expectNonce = 'tabi-r98-live-' + crypto.randomBytes(6).toString('hex');
  // Node's recursive mkdir never returns on some unwritable trees (observed: a path under /proc spins
  // forever on Node 24.21); the nearest existing ancestor must be a writable directory first.
  {
    let a = scratch;
    while (!fs.existsSync(a)) a = path.dirname(a);
    let okDir = false;
    try { okDir = fs.statSync(a).isDirectory(); fs.accessSync(a, fs.constants.W_OK); } catch { okDir = false; }
    if (!okDir) refuse('scratch not writable: nearest existing ancestor ' + a);
  }
  try { fs.mkdirSync(scratch, { recursive: true }); } catch (e) { refuse('scratch not creatable: ' + e.message); }
  let receiptDir;
  try { receiptDir = fs.mkdtempSync(path.join(scratch, 'receipt-')); } catch (e) { refuse('scratch not writable: ' + e.message); }
  receiptPath = path.join(receiptDir, 'live-receipt-' + crypto.randomBytes(6).toString('hex') + '.json');
  const driverScratch = path.join(scratch, 'driver');
  liveMissing = path.join(driverScratch, MISSING);
  const child = spawn(process.execPath, [driverPath, '--lane', lane, '--deps', deps, '--scratch', driverScratch, '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps)], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, TABI_R98_NONCE: expectNonce } });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  const sweepChromium = () => {
    let n = 0;
    for (const pid of fs.readdirSync('/proc').filter((d) => /^[0-9]+$/.test(d))) {
      let cmd = '';
      try { cmd = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8'); } catch { continue; }
      if (cmd.includes('--user-data-dir=' + driverScratch + '/')) { try { process.kill(Number(pid), 'SIGKILL'); n++; } catch {} }
    }
    return n;
  };
  const snapshotRun = (extra) => ({ status: null, signal: null, timedOut: false, orphansSwept: null, stdout: stdout.trim().slice(0, 400), stderr: stderr.trim().slice(0, 400), ...extra });
  const killDriver = async () => {
    try { process.kill(-child.pid, 'SIGTERM'); } catch {}
    await new Promise((r) => setTimeout(r, 2000));
    try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    return sweepChromium();
  };
  let interrupted = null;
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, async () => { if (interrupted) return; interrupted = sig; const n = await killDriver(); refuse('counter received ' + sig + '; driver group killed, ' + n + ' chromium processes swept', { revision, driverRun: snapshotRun({ interruptedBy: sig, orphansSwept: n }) }); });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; killDriver(); }, DRIVER_TIMEOUT_MS);
  const [status, signal] = await new Promise((res) => child.on('close', (c, s) => res([c, s])));
  clearTimeout(timer);
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  const orphansSwept = sweepChromium();
  driverRun = { status, signal, timedOut, orphansSwept, stdout: stdout.trim().slice(0, 400), stderr: stderr.trim().slice(0, 400) };
  fs.rmSync(driverScratch, { recursive: true, force: true });
  if (interrupted) await new Promise(() => {});
  if (status === 130) refuse('driver interrupted (exit 130, its own signal handler)', { revision, driverRun });
  if (status === 2) refuse('driver refused (exit 2): ' + driverRun.stderr, { revision, driverRun });
  if (status === 3) refuse('chromium never came up (driver exit 3, host resource failure)', { revision, driverRun });
  if (signal !== null || timedOut) refuse('driver ended by signal ' + signal + (timedOut ? ' (timeout)' : ''), { revision, driverRun });
}
else if (!/^tabi-r98-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r98-...');

{
  let st = null;
  try { st = fs.lstatSync(receiptPath); } catch {}
  if (st && !st.isFile()) refuse('receipt path is not a regular file: ' + receiptPath, { revision, driverRun });
}
let receipt, receiptSha256 = null;
try { const bytes = fs.readFileSync(receiptPath); receiptSha256 = sha256(bytes); receipt = JSON.parse(bytes.toString('utf8')); } catch (e) {
  console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, driverRun, receipt: receiptPath, receiptSha256, checkCount: 1, findings: [{ id: 'receipt-unreadable', leg: null, detail: String(e.message) }] }));
  process.exit(1);
}
if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) receipt = {};

const findings = [];
let checkCount = 0;
const check = (id, ok, leg, detail) => { checkCount++; if (!ok) findings.push({ id, leg, detail }); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);

if (live) {
  check('driver-exit', driverRun.status === 0, null, 'driver exit status ' + driverRun.status);
  check('ports-bound', isObj(receipt.ports) && eq([receipt.ports.http, receipt.ports.child, receipt.ports.cdp], livePorts), null, 'receipt ports ' + JSON.stringify(receipt.ports) + ' vs --ports ' + JSON.stringify(livePorts));
  check('missing-bound', receipt.missingPath === liveMissing, null, 'receipt missingPath ' + receipt.missingPath + ' vs ' + liveMissing);
}
check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);
check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);
check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);
check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('libs', eq(receipt.libs, LIBS), null, 'libs ' + JSON.stringify(receipt.libs));
check('answer', eq(receipt.answer, ANSWER), null, 'answer ' + JSON.stringify(receipt.answer));
check('payload', eq(receipt.payload, PAYLOAD), null, 'payload ' + JSON.stringify(receipt.payload));
const missingPath = typeof receipt.missingPath === 'string' ? receipt.missingPath : null;
check('missing', !!missingPath && path.isAbsolute(missingPath) && path.basename(missingPath) === MISSING && receipt.missingExists === false, null, 'missingPath ' + receipt.missingPath + ' missingExists ' + receipt.missingExists);
const ports = isObj(receipt.ports) ? receipt.ports : {};
check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of ARMS) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));
const errLegs = legs.filter((l) => isObj(l) && l.error !== null).map((l) => (isObj(l) ? l.leg : null));
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));
const ids = legs.map((l) => (isObj(l) ? l.browserId : null));
check('fresh-browser', ids.length > 0 && ids.every((b) => typeof b === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));

const outcomes = { trustedPath: [], untrustedPayload: [], enoent: [], phantomUnreadable: [] };
for (const l0 of legs) {
  const l = isObj(l0) ? l0 : {};
  const id = typeof l.leg === 'string' ? l.leg : null;
  const m = /^(PUA|PLA|PLAB|PLB|PLLB|PLL|PLLM|PUR)-([0-9]+)$/.exec(id || '');
  check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2]), id, 'leg ' + id + ' arm ' + l.arm + ' rep ' + l.rep);
  if (!m) continue;
  const a = ARM[m[1]];
  const childUrl = 'http://localhost:' + ports.child + '/child.html?leg=' + id;
  const parentUrl = 'http://127.0.0.1:' + ports.http + '/parent.html?leg=' + id;
  check('leg-arm', l.lib === a.lib && l.mode === a.mode && l.isLocal === a.isLocal && l.input === a.input && l.childUrl === childUrl && l.parentUrl === parentUrl, id, 'lib ' + l.lib + ' mode ' + l.mode + ' isLocal ' + l.isLocal + ' input ' + l.input + ' childUrl ' + l.childUrl + ' parentUrl ' + l.parentUrl);
  check('browser', l.browserVersion === BROWSER && l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG), id, 'browser ' + l.browserVersion + ' client ' + l.clientBrowserVersion);
  check('frames', eq(l.frames, [parentUrl, childUrl]), id, 'frames ' + JSON.stringify(l.frames));
  const its = Array.isArray(l.iframeTargets) ? l.iframeTargets : null;
  check('iframe-targets', !!its && its.length === 1 && isObj(its[0]) && its[0].url === childUrl && typeof its[0].targetId === 'string' && its[0].targetId.length > 0, id, 'iframe targets ' + JSON.stringify(l.iframeTargets));
  check('parent-files', eq(l.parentFiles, []), id, 'parent #pp files ' + JSON.stringify(l.parentFiles));
  if (a.outcome === 'resolved') {
    check('outcome', l.outcome === 'resolved' && l.errName === null && l.errMessage === null, id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  } else {
    check('outcome', l.outcome === 'error' && l.errName === 'Error' && !!missingPath && l.errMessage === "ENOENT: no such file or directory, stat '" + missingPath + "'", id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  }
  check('child-files', eq(l.childFiles, a.files), id, 'child #s files ' + JSON.stringify(l.childFiles) + ' expected ' + JSON.stringify(a.files));
  check('child-events', eq(l.childEvents, a.events), id, 'child #s events ' + JSON.stringify(l.childEvents) + ' expected ' + JSON.stringify(a.events));
  check('child-read', eq(l.childRead, a.read), id, 'child #s read ' + JSON.stringify(l.childRead) + ' expected ' + JSON.stringify(a.read));
  if (eq(l.childEvents, a.events) && eq(l.childFiles, a.files) && eq(l.childRead, a.read)) {
    if (m[1] === 'PLLM') outcomes.enoent.push(id);
    else if (m[1] === 'PUR') outcomes.phantomUnreadable.push(id);
    else if (a.input === 'payload') outcomes.untrustedPayload.push(id);
    else outcomes.trustedPath.push(id);
  }
}

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, receiptSha256, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, outcomes, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
