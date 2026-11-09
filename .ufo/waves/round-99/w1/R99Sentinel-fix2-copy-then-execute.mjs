#!/usr/bin/env node
// Counter: tabi round 99, C1, predicate `C1-CLIENT-OOPIF-UPLOADSETS-R99` (frozen in plans/round-99.md).
// Reads a receipt of scripts/client-oopif-uploadsets-round99.mjs and checks, per leg (every child is the
// cross-site `localhost` iframe holding #s without `multiple` and #m with it):
//   every leg: DevTools `Chrome/155.0.8059.84` and the client's own browser version string; the arm's
//     library/mode/isLocal/input/target fields and the exact parent and child URLs; the client lists
//     exactly the frames [parent, child]; exactly one browser-level iframe target, with url = child URL;
//     the parent's #pp holds []; the untouched child input holds [];
//   PUAM (Puppeteer launch, absent path, #s): resolves with no error; #s holds exactly
//     [["tabi-r99-missing.txt", 0, "text/plain"]]; events exactly [s input trusted, s change trusted];
//     the one file's arrayBuffer() and FileReader reads both reject NotFoundError with the Blink message;
//   PLAM (Playwright launch, absent path, #s): error name `Error`, message exactly
//     "ENOENT: no such file or directory, stat '<missingPath>'"; both inputs empty, no event, no read;
//   PLBX (connectOverCDP, one untyped 256-byte payload named tabi-r99-bytes.png, #s): resolves; #s holds
//     exactly [["tabi-r99-bytes.png", 256, "image/png"]]; events exactly [s input untrusted, s change
//     untrusted]; both reads give ['ok', 256, sha256 of bytes 0x00..0xff];
//   PLBM (connectOverCDP, payloads P1 typed text/plain + P2 untyped `.tabi99`, #m): resolves; #m holds
//     exactly [[p1, 27, "text/plain"], [p2, 36, "application/octet-stream"]]; events exactly [m input
//     untrusted, m change untrusted]; both reads of both files give their sizes and sha256s;
//   PLBN (as PLBM on #s): error `Error`, message exactly "locator.setInputFiles: Error: Non-multiple file
//     input can only accept single file"; both inputs empty, no event, no read;
//   PLLP (connectOverCDP isLocal, paths A,B, #m) and PUCM (Puppeteer connect, paths A,B, #m): resolve; #m
//     holds exactly [[a, 22, "text/plain"], [b, 30, "text/plain"]]; events exactly [m input trusted,
//     m change trusted]; both reads of both files give their sizes and sha256s;
//   PUCN (Puppeteer connect, paths A,B, #s): error `Error`, message exactly "Multiple file uploads only
//     work with <input type=file multiple>"; both inputs empty, no event, no read.
//   (Every events list is compared exactly, so no leg may record a `click`.)
// Receipt level: schema, nonce, driver pin, chromium tag, reps, the two client libraries pinned exactly
// as in r98 (version, npm lockfile integrity string, upload-bearing file sha256, package-directory tree
// sha256 and file count), the file/payload/bin descriptors, the missing path (absolute, basename
// tabi-r99-missing.txt, `missingExists` exactly false), `tmpdirAtLoad` absolute, ports (integers in
// 1024..65535, distinct), the exact leg list, empty failures with no leg error, distinct UUID browser ids.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt passes this
//                     mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce in its
//                     environment and a receipt path inside a fresh mkdtemp directory under --scratch,
//                     then check that receipt; additionally `driver-exit` (driver exit status 0),
//                     `ports-bound` (receipt ports = --ports), `missing-bound` (receipt missingPath =
//                     <driver scratch>/tabi-r99-missing.txt) and `tmpdir-bound` (receipt tmpdirAtLoad =
//                     <driver scratch>/t). Setup refusals (exit 2, verdict `setup`, `driverRun` included):
//                     driver usage refusal (exit 2), driver ended by a signal or exit 130, counter
//                     interrupted, receipt path not a regular file.
//   r98 D3 (driver exit 3, a chromium never came up): the receipt is still checked; legs whose `error`
//   starts with `chromium never came up` are listed in `launchFailed` and skipped by the per-leg checks,
//   and `fresh-browser` runs over the other legs. Any finding other than `driver-exit` and `failures`
//   then gives verdict `findings` (exit 1); none gives `setup` (exit 2). No readable receipt, or every
//   leg launch-failed: `setup`.
// Usage:
//   node check-client-oopif-uploadsets-round99.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --deps <ABS dir> --scratch <ABS dir>
//      --ports <http,child,cdp>) [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PREDICATE = 'C1-CLIENT-OOPIF-UPLOADSETS-R99';
const SCHEMA = 'tabi-client-oopif-uploadsets-r99';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/client-oopif-uploadsets-round99.mjs';
const LAUNCH_FAIL = 'chromium never came up';
const S = (t) => crypto.createHash('sha256').update(Buffer.from(t)).digest('hex');
const FILE_A = { name: 'tabi-r99-a.txt', size: 22, sha256: S('tabi round 99 file a.\n') };
const FILE_B = { name: 'tabi-r99-b.txt', size: 30, sha256: S('tabi round 99 file b, second.\n') };
const P1 = { name: 'tabi-r99-p1.txt', size: 27, mimeType: 'text/plain', sha256: S('tabi round 99 payload one.\n') };
const P2 = { name: 'tabi-r99-p2.tabi99', size: 36, mimeType: null, sha256: S('tabi round 99 payload two, untyped.\n') };
const BIN = { name: 'tabi-r99-bytes.png', size: 256, mimeType: null, sha256: crypto.createHash('sha256').update(Buffer.from(Array.from({ length: 256 }, (_, i) => i))).digest('hex') };
const MISSING = 'tabi-r99-missing.txt';
const NF = ['err', 'NotFoundError', 'A requested file or directory could not be found at the time an operation was processed.'];
const LIBS = {
  'puppeteer-core': { version: '25.16.0', integrity: 'sha512-VA5Pf54N8shfopNkZZXCdiiwfnnY8ZJYAMqFQRhlH5mGUhfwf53Ar770GPtdpTDLUqvQeYpIBtC9/G2Jij2IJw==', file: 'lib/puppeteer/cdp/ElementHandle.js', fileSha256: '162b71998ba1761786bbd9ee1a4f94e0d7f0efe2d339fcafc4490eba4e9b7c96', treeFiles: 927, treeSha256: '968a85e856058073407c713275a0d6d0352a2063711cb1bc1de367691cd1e180' },
  'playwright-core': { version: '1.65.0', integrity: 'sha512-vNSKgH6YqtN7cdT/L334zo0a+YwkrpicyrHJlWWPIm/Q+Nn2SWInil01oT0mbu96U4GgoRtCYQD9CzJQgju+lA==', file: 'lib/coreBundle.js', fileSha256: '4ef8330594818d8f464de939e32bca62b758099e0d0e94a56095406da963f7f1', treeFiles: 116, treeSha256: '245846938f2b5f5c706b6670d0751ccef42bdc68ef7d38bb7eb4a471bf5cd641' },
};
const ok = (f) => ['ok', f.size, f.sha256];
const both = (f) => [ok(f), ok(f)];
const EV = (id, trusted) => [[id, 'input', trusted], [id, 'change', trusted]];
const ARMS = ['PUAM', 'PLAM', 'PLBX', 'PLBM', 'PLBN', 'PLLP', 'PUCM', 'PUCN'];
const AB = [[FILE_A.name, FILE_A.size, 'text/plain'], [FILE_B.name, FILE_B.size, 'text/plain']];
const ARM = {
  PUAM: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'missing', target: 's', outcome: 'resolved', files: { s: [[MISSING, 0, 'text/plain']], m: [] }, events: EV('s', true), reads: [[NF, NF]], cls: 'phantomUnreadable' },
  PLAM: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'missing', target: 's', outcome: 'enoent', files: { s: [], m: [] }, events: [], reads: [], cls: 'enoent' },
  PLBX: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'bin', target: 's', outcome: 'resolved', files: { s: [[BIN.name, BIN.size, 'image/png']], m: [] }, events: EV('s', false), reads: [both(BIN)], cls: 'untrustedPayload' },
  PLBM: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payloads', target: 'm', outcome: 'resolved', files: { s: [], m: [[P1.name, P1.size, 'text/plain'], [P2.name, P2.size, 'application/octet-stream']] }, events: EV('m', false), reads: [both(P1), both(P2)], cls: 'untrustedPayload' },
  PLBN: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payloads', target: 's', outcome: ['Error', 'locator.setInputFiles: Error: Non-multiple file input can only accept single file'], files: { s: [], m: [] }, events: [], reads: [], cls: 'refusedMultiple' },
  PLLP: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'paths', target: 'm', outcome: 'resolved', files: { s: [], m: AB }, events: EV('m', true), reads: [both(FILE_A), both(FILE_B)], cls: 'trustedMulti' },
  PUCM: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'paths', target: 'm', outcome: 'resolved', files: { s: [], m: AB }, events: EV('m', true), reads: [both(FILE_A), both(FILE_B)], cls: 'trustedMulti' },
  PUCN: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'paths', target: 's', outcome: ['Error', 'Multiple file uploads only work with <input type=file multiple>'], files: { s: [], m: [] }, events: [], reads: [], cls: 'refusedMultiple' },
};
const LAW_EXEMPT = new Set(['driver-exit', 'failures']);
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
let driverBytes = null;
try { driverBytes = fs.readFileSync(driverPath); driverSha = sha256(driverBytes); } catch { refuse('driver missing: ' + driverPath); }

let driverRun = null;
let livePorts = null;
let liveMissing = null;
let liveTmp = null;
let partialLaunch = false;
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
  expectNonce = 'tabi-r99-live-' + crypto.randomBytes(6).toString('hex');
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
  liveTmp = path.join(driverScratch, 't');
  // FIX: execute a private copy of the EXACT bytes that were hashed (one read), so the
  // executed bytes are provably the pinned bytes.
  const pinnedCopy = path.join(receiptDir, 'pinned-driver.mjs');
  try { fs.writeFileSync(pinnedCopy, driverBytes); } catch (e) { refuse('cannot stage pinned driver copy: ' + e.message); }
  const child = spawn(process.execPath, [pinnedCopy, '--lane', lane, '--deps', deps, '--scratch', driverScratch, '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps)], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, TABI_R99_NONCE: expectNonce } });
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
  if (signal !== null || timedOut) refuse('driver ended by signal ' + signal + (timedOut ? ' (timeout)' : ''), { revision, driverRun });
  if (status === 3) partialLaunch = true;
}
else if (!/^tabi-r99-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r99-...');

{
  let st = null;
  try { st = fs.lstatSync(receiptPath); } catch {}
  if (st && !st.isFile()) refuse('receipt path is not a regular file: ' + receiptPath, { revision, driverRun });
}
let receipt, receiptSha256 = null;
try { const bytes = fs.readFileSync(receiptPath); receiptSha256 = sha256(bytes); receipt = JSON.parse(bytes.toString('utf8')); } catch (e) {
  if (partialLaunch) refuse('chromium never came up (driver exit 3) and no readable receipt: ' + e.message, { revision, driverRun });
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
  check('tmpdir-bound', receipt.tmpdirAtLoad === liveTmp, null, 'receipt tmpdirAtLoad ' + receipt.tmpdirAtLoad + ' vs ' + liveTmp);
}
check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);
check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);
check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);
check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('libs', eq(receipt.libs, LIBS), null, 'libs ' + JSON.stringify(receipt.libs));
check('files', eq(receipt.fileA, FILE_A) && eq(receipt.fileB, FILE_B), null, 'fileA ' + JSON.stringify(receipt.fileA) + ' fileB ' + JSON.stringify(receipt.fileB));
check('payloads', eq(receipt.payload1, P1) && eq(receipt.payload2, P2) && eq(receipt.bin, BIN), null, 'payload1 ' + JSON.stringify(receipt.payload1) + ' payload2 ' + JSON.stringify(receipt.payload2) + ' bin ' + JSON.stringify(receipt.bin));
const missingPath = typeof receipt.missingPath === 'string' ? receipt.missingPath : null;
check('missing', !!missingPath && path.isAbsolute(missingPath) && path.basename(missingPath) === MISSING && receipt.missingExists === false, null, 'missingPath ' + receipt.missingPath + ' missingExists ' + receipt.missingExists);
check('tmpdir', typeof receipt.tmpdirAtLoad === 'string' && path.isAbsolute(receipt.tmpdirAtLoad) && path.basename(receipt.tmpdirAtLoad) === 't', null, 'tmpdirAtLoad ' + receipt.tmpdirAtLoad);
const ports = isObj(receipt.ports) ? receipt.ports : {};
check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of ARMS) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));
const errLegs = legs.filter((l) => isObj(l) && l.error !== null).map((l) => (isObj(l) ? l.leg : null));
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));
const launchFailed = partialLaunch ? legs.filter((l) => isObj(l) && typeof l.error === 'string' && l.error.startsWith(LAUNCH_FAIL)).map((l) => l.leg) : [];
const lawLegs = legs.filter((l) => !(isObj(l) && launchFailed.includes(l.leg)));
if (partialLaunch && !lawLegs.length) refuse('chromium never came up (driver exit 3) on every leg', { revision, driverRun, launchFailed });
const ids = lawLegs.map((l) => (isObj(l) ? l.browserId : null));
check('fresh-browser', ids.length > 0 && ids.every((b) => typeof b === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));

const outcomes = { trustedMulti: [], untrustedPayload: [], refusedMultiple: [], enoent: [], phantomUnreadable: [] };
for (const l0 of lawLegs) {
  const l = isObj(l0) ? l0 : {};
  const id = typeof l.leg === 'string' ? l.leg : null;
  const m = /^(PUAM|PLAM|PLBX|PLBM|PLBN|PLLP|PUCM|PUCN)-([0-9]+)$/.exec(id || '');
  check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2]), id, 'leg ' + id + ' arm ' + l.arm + ' rep ' + l.rep);
  if (!m) continue;
  const a = ARM[m[1]];
  const childUrl = 'http://localhost:' + ports.child + '/child.html?leg=' + id;
  const parentUrl = 'http://127.0.0.1:' + ports.http + '/parent.html?leg=' + id;
  check('leg-arm', l.lib === a.lib && l.mode === a.mode && l.isLocal === a.isLocal && l.input === a.input && l.target === a.target, id, 'lib ' + l.lib + ' mode ' + l.mode + ' isLocal ' + l.isLocal + ' input ' + l.input + ' target ' + l.target);
  check('leg-urls', l.childUrl === childUrl && l.parentUrl === parentUrl, id, 'childUrl ' + l.childUrl + ' parentUrl ' + l.parentUrl);
  check('browser', l.browserVersion === BROWSER && l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG), id, 'browser ' + l.browserVersion + ' client ' + l.clientBrowserVersion);
  check('frames', eq(l.frames, [parentUrl, childUrl]), id, 'frames ' + JSON.stringify(l.frames));
  const its = Array.isArray(l.iframeTargets) ? l.iframeTargets : null;
  check('iframe-targets', !!its && its.length === 1 && isObj(its[0]) && its[0].url === childUrl && typeof its[0].targetId === 'string' && its[0].targetId.length > 0, id, 'iframe targets ' + JSON.stringify(l.iframeTargets));
  check('parent-files', eq(l.parentFiles, []), id, 'parent #pp files ' + JSON.stringify(l.parentFiles));
  if (a.outcome === 'resolved') {
    check('outcome', l.outcome === 'resolved' && l.errName === null && l.errMessage === null, id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  } else if (a.outcome === 'enoent') {
    check('outcome', l.outcome === 'error' && l.errName === 'Error' && !!missingPath && l.errMessage === "ENOENT: no such file or directory, stat '" + missingPath + "'", id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  } else {
    check('outcome', l.outcome === 'error' && l.errName === a.outcome[0] && l.errMessage === a.outcome[1], id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  }
  check('child-files', eq(l.files, a.files), id, 'child files ' + JSON.stringify(l.files) + ' expected ' + JSON.stringify(a.files));
  check('child-events', eq(l.events, a.events), id, 'child events ' + JSON.stringify(l.events) + ' expected ' + JSON.stringify(a.events));
  check('child-reads', eq(l.reads, a.reads), id, 'child reads ' + JSON.stringify(l.reads) + ' expected ' + JSON.stringify(a.reads));
  if (eq(l.events, a.events) && eq(l.files, a.files) && eq(l.reads, a.reads)) outcomes[a.cls].push(id);
}

if (partialLaunch) {
  const law = findings.filter((f) => !LAW_EXEMPT.has(f.id));
  if (!law.length) refuse('chromium never came up (driver exit 3) on ' + JSON.stringify(launchFailed) + '; no law finding on the other legs', { revision, driverRun, launchFailed, checkCount, findings });
}
const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, receiptSha256, nonce: expectNonce, driverSha256: driverSha, driverRun, launchFailed, checkCount, outcomes, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
