#!/usr/bin/env node
// Counter: tabi round 97, C1, predicate `C1-CLIENT-OOPIF-UPLOADFILE-R97` (frozen in plans/round-97.md).
// Reads a receipt of scripts/client-oopif-uploadfile-round97.mjs and checks, per leg:
//   every leg: DevTools `Chrome/155.0.8059.84` and the client's own browser version string; the arm's
//     library/site/isLocal/call fields and the exact parent and child URLs; the client lists exactly the
//     frames [parent, child]; browser-level iframe targets: exactly one with url = child URL on
//     cross-site legs, none on same-site legs (PUS, PLS); the parent's #pp holds [];
//   PUX, PUS, PLL (Puppeteer uploadFile; Playwright connectOverCDP {isLocal: true}): the call resolves,
//     the child's #s holds exactly [[answer, 22]], and #s saw exactly [input trusted, change trusted];
//   PLX, PLS (Playwright connectOverCDP default): the call resolves, #s holds exactly [[answer, 22]], and
//     #s saw exactly [input untrusted, change untrusted];
//   PUC (Puppeteer uploadFile(answer) then uploadFile()): resolves, #s holds [], and #s saw exactly
//     [input trusted, change trusted, input untrusted, change untrusted];
//   PUM (Puppeteer uploadFile(<path that does not exist>)): resolves with no error, #s holds exactly
//     [["tabi-r97-missing.txt", 0]], and #s saw exactly [input trusted, change trusted];
//   PLM (Playwright default, the same missing path): the call ends `error`, name `Error`, message exactly
//     "ENOENT: no such file or directory, stat '<missingPath>'"; #s holds [] and saw no event.
//   (No leg may record a `click` on #s: every events list is checked exactly.)
// Receipt level: schema, nonce, driver pin, chromium tag, cross host, reps, the two client libraries
// pinned on version, npm lockfile integrity, the sha256 of the upload-bearing file AND a sha256 over the
// whole installed package tree (file count + sorted path/sha256 lines; r96 R96Sentinel), the answer, the
// missing path (absolute, basename tabi-r97-missing.txt, absent when the receipt was written), ports, the
// exact leg list, empty failures with no leg error, distinct UUID browser ids.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt passes this
//                     mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce in its
//                     environment and a receipt path inside a fresh mkdtemp directory under --scratch,
//                     then check that receipt; additionally `driver-exit` (driver exit status 0),
//                     `ports-bound` (receipt ports = --ports) and `missing-bound` (receipt missingPath =
//                     <driver scratch>/tabi-r97-missing.txt). Setup refusals (exit 2, verdict `setup`,
//                     `driverRun` included): driver usage refusal (exit 2), chromium never answered
//                     (driver exit 3), driver ended by a signal or exit 130, counter interrupted, receipt
//                     path not a regular file.
// Usage:
//   node check-client-oopif-uploadfile-round97.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --deps <ABS dir> --scratch <ABS dir>
//      --ports <http,child,cdp>) [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PREDICATE = 'C1-CLIENT-OOPIF-UPLOADFILE-R97';
const SCHEMA = 'tabi-client-oopif-uploadfile-r97';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/client-oopif-uploadfile-round97.mjs';
const ANSWER = ['tabi-r97-answer.txt', 22];
const MISSING = 'tabi-r97-missing.txt';
const LIBS = {
  'puppeteer-core': { version: '25.16.0', integrity: 'sha512-VA5Pf54N8shfopNkZZXCdiiwfnnY8ZJYAMqFQRhlH5mGUhfwf53Ar770GPtdpTDLUqvQeYpIBtC9/G2Jij2IJw==', file: 'lib/puppeteer/cdp/ElementHandle.js', fileSha256: '162b71998ba1761786bbd9ee1a4f94e0d7f0efe2d339fcafc4490eba4e9b7c96', treeFiles: 927, treeSha256: '968a85e856058073407c713275a0d6d0352a2063711cb1bc1de367691cd1e180' },
  'playwright-core': { version: '1.65.0', integrity: 'sha512-vNSKgH6YqtN7cdT/L334zo0a+YwkrpicyrHJlWWPIm/Q+Nn2SWInil01oT0mbu96U4GgoRtCYQD9CzJQgju+lA==', file: 'lib/coreBundle.js', fileSha256: '4ef8330594818d8f464de939e32bca62b758099e0d0e94a56095406da963f7f1', treeFiles: 116, treeSha256: '245846938f2b5f5c706b6670d0751ccef42bdc68ef7d38bb7eb4a471bf5cd641' },
};
const T = (t) => [t, true];
const U = (t) => [t, false];
const ARMS = ['PUX', 'PUS', 'PUC', 'PUM', 'PLX', 'PLS', 'PLL', 'PLM'];
const ARM = {
  PUX: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] },
  PUS: { lib: 'puppeteer', cross: false, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] },
  PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear', outcome: 'resolved', files: 'none', events: [T('input'), T('change'), U('input'), U('change')] },
  PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'missing', events: [T('input'), T('change')] },
  PLX: { lib: 'playwright', cross: true, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] },
  PLS: { lib: 'playwright', cross: false, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] },
  PLL: { lib: 'playwright', cross: true, isLocal: true, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] },
  PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing', outcome: 'enoent', files: 'none', events: [] },
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
  expectNonce = 'tabi-r97-live-' + crypto.randomBytes(6).toString('hex');
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
  const child = spawn(process.execPath, [driverPath, '--lane', lane, '--deps', deps, '--scratch', driverScratch, '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps), '--cross-host', 'localhost'], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, TABI_R97_NONCE: expectNonce } });
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
  if (status === 3) refuse('chromium never answered its DevTools endpoint (driver exit 3, host resource failure)', { revision, driverRun });
  if (signal !== null || timedOut) refuse('driver ended by signal ' + signal + (timedOut ? ' (timeout)' : ''), { revision, driverRun });
}
else if (!/^tabi-r97-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r97-...');

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
check('cross-host', receipt.crossHost === 'localhost', null, 'crossHost ' + receipt.crossHost);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('libs', eq(receipt.libs, LIBS), null, 'libs ' + JSON.stringify(receipt.libs));
check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));
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

const outcomes = { trusted: [], untrusted: [], cleared: [], phantom: [], enoent: [] };
for (const l0 of legs) {
  const l = isObj(l0) ? l0 : {};
  const id = typeof l.leg === 'string' ? l.leg : null;
  const m = /^(PUX|PUS|PUC|PUM|PLX|PLS|PLL|PLM)-([0-9]+)$/.exec(id || '');
  check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2]), id, 'leg ' + id + ' arm ' + l.arm + ' rep ' + l.rep);
  if (!m) continue;
  const a = ARM[m[1]];
  const childHost = a.cross ? 'localhost' : '127.0.0.1';
  const childUrl = 'http://' + childHost + ':' + ports.child + '/child.html?leg=' + id;
  const parentUrl = 'http://127.0.0.1:' + ports.http + '/parent.html?leg=' + id;
  check('leg-arm', l.lib === a.lib && l.cross === a.cross && l.isLocal === a.isLocal && l.call === a.call && l.childHost === childHost && l.childUrl === childUrl && l.parentUrl === parentUrl, id, 'lib ' + l.lib + ' cross ' + l.cross + ' isLocal ' + l.isLocal + ' call ' + l.call + ' childUrl ' + l.childUrl + ' parentUrl ' + l.parentUrl);
  check('browser', l.browserVersion === BROWSER && l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG), id, 'browser ' + l.browserVersion + ' client ' + l.clientBrowserVersion);
  check('frames', eq(l.frames, [parentUrl, childUrl]), id, 'frames ' + JSON.stringify(l.frames));
  const its = Array.isArray(l.iframeTargets) ? l.iframeTargets : null;
  check('iframe-targets', !!its && (a.cross ? its.length === 1 && isObj(its[0]) && its[0].url === childUrl && typeof its[0].targetId === 'string' && its[0].targetId.length > 0 : its.length === 0), id, 'iframe targets ' + JSON.stringify(l.iframeTargets));
  check('parent-files', eq(l.parentFiles, []), id, 'parent #pp files ' + JSON.stringify(l.parentFiles));
  if (a.outcome === 'resolved') {
    check('outcome', l.outcome === 'resolved' && l.errName === null && l.errMessage === null, id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  } else {
    check('outcome', l.outcome === 'error' && l.errName === 'Error' && !!missingPath && l.errMessage === "ENOENT: no such file or directory, stat '" + missingPath + "'", id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);
  }
  const wantFiles = a.files === 'answer' ? [ANSWER] : a.files === 'missing' ? [[MISSING, 0]] : [];
  check('child-files', eq(l.childFiles, wantFiles), id, 'child #s files ' + JSON.stringify(l.childFiles) + ' expected ' + JSON.stringify(wantFiles));
  check('child-events', eq(l.childEvents, a.events), id, 'child #s events ' + JSON.stringify(l.childEvents) + ' expected ' + JSON.stringify(a.events));
  if (eq(l.childEvents, a.events) && eq(l.childFiles, wantFiles)) {
    if (m[1] === 'PUC') outcomes.cleared.push(id);
    else if (m[1] === 'PUM') outcomes.phantom.push(id);
    else if (m[1] === 'PLM') outcomes.enoent.push(id);
    else if (a.events[0][1]) outcomes.trusted.push(id);
    else outcomes.untrusted.push(id);
  }
}

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, receiptSha256, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, outcomes, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
