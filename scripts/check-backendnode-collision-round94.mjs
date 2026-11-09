#!/usr/bin/env node
// Counter: tabi round 94, C1, predicate `C1-BACKENDNODE-COLLISION-R94` (frozen in plans/round-94.md).
// Reads a receipt of scripts/chrome-cdp-backendnode-collision-round94.mjs and checks, per leg, what a
// file chooser's backendNodeId B names on the session it arrived on and on the PAGE session:
//   C (child `localhost`, pad 0, own `iframe` target): B sent on the PAGE session COLLIDES — page
//     DOM.describeNode(B) succeeds and is the parent's own root: `#document`, backendNodeId B,
//     documentURL = the parent URL, the same backendNodeId as the page DOM.getDocument(depth 0) root;
//     B is within the page tree's minted range (max backendNodeId >= B); page setFileInputFiles(B)
//     errors exactly "Node is not a file input element" and the child's files stay [];
//   M (child `localhost`, pad 300): B sent on the PAGE session MISSES — page DOM.describeNode(B)
//     errors exactly "No node found for given backend id"; the page root is the parent document with
//     a backendNodeId other than B; B exceeds every backendNodeId in the page session's pierced tree;
//     page setFileInputFiles(B) errors exactly "No node found for given backend id", files stay [];
//   S (child `127.0.0.1`, pad 300, no own target): page DOM.describeNode(B) is the child INPUT with
//     backendNodeId B, the pierced tree holds exactly 1 INPUT#s and reaches B; no cross answer;
//   every leg: exactly one chooser (on the iframe session for C/M, the page session for S) for the
//     child frame with integer B > 0; describeNode(B) on that session is INPUT type=file id=s with
//     backendNodeId B; the answer on that session returns no error and the child's files then read
//     exactly [[answer name, 22]]; exactly one trusted click on #s; DevTools browser
//     `Chrome/155.0.8059.84`; every leg in its own browser.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt passes
//                     this mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce
//                     into --scratch and check the receipt it writes. The driver runs in its own
//                     process group; on its own SIGINT/SIGTERM/SIGHUP (verdict `setup`, exit 2) and
//                     after 600 s the counter sends that group SIGTERM, then SIGKILL after 2 s, then
//                     kills every process whose --user-data-dir lies under the driver scratch; that
//                     sweep also runs after every driver exit (`driverRun.orphansSwept`). A driver
//                     usage refusal (exit 2), a driver ended by a signal or exiting 130 from its own
//                     signal handler, and a counter interrupted by a signal are verdict `setup`, exit 2
//                     (r93 R93Sentinel S4/S5).
// The output names the receipt path and its sha256 (r93 spot-check §8 item 2).
// Usage:
//   node check-backendnode-collision-round94.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --scratch <ABS dir> --ports <http,child,cdp>)
//     [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PREDICATE = 'C1-BACKENDNODE-COLLISION-R94';
const SCHEMA = 'tabi-chrome-cdp-backendnode-collision-r94';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/chrome-cdp-backendnode-collision-round94.mjs';
const ANSWER = ['tabi-r94-answer.txt', 22];
const PAD = 300;
const NOT_FILE_INPUT = 'Node is not a file input element';
const NO_NODE = 'No node found for given backend id';
const DRIVER_TIMEOUT_MS = 600000;
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
if (live) {
  const scratch = opt('scratch');
  if (!scratch || !path.isAbsolute(scratch)) refuse('--live needs an absolute --scratch');
  const ports = (opt('ports') || '').split(',');
  if (ports.length !== 3 || !ports.every((p) => /^[0-9]+$/.test(p))) refuse('--ports must be http,child,cdp');
  if (driverSha !== pin) {
    console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, checkCount: 1, findings: [{ id: 'driver-pin', leg: null, detail: 'driver sha256 ' + driverSha + ' != pin ' + pin + ' (driver not run)' }] }));
    process.exit(1);
  }
  expectNonce = 'tabi-r94-live-' + crypto.randomBytes(6).toString('hex');
  receiptPath = path.join(scratch, 'live-receipt.json');
  fs.mkdirSync(scratch, { recursive: true });
  fs.rmSync(receiptPath, { force: true });
  const child = spawn(process.execPath, [driverPath, '--lane', lane, '--nonce', expectNonce, '--scratch', path.join(scratch, 'driver'), '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps), '--cross-host', 'localhost', '--pad', String(PAD)], { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  const driverScratch = path.join(scratch, 'driver');
  // chromium runs in its own process groups under the driver, so killing the driver's group alone
  // leaves it alive when the driver cannot clean up (SIGKILL). After the driver ends, and on the
  // counter's own signals/timeout, every process whose command line names a profile under this run's
  // driver scratch is killed (r93 R93Sentinel S5; r94 pre-freeze control attempt 1).
  const sweepChromium = () => {
    let n = 0;
    for (const pid of fs.readdirSync('/proc').filter((d) => /^[0-9]+$/.test(d))) {
      let cmd = '';
      try { cmd = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8'); } catch { continue; }
      // chromium rewrites its argv (process title), so match on the whole command line, NUL or space joined
      if (cmd.includes('--user-data-dir=' + driverScratch + '/')) { try { process.kill(Number(pid), 'SIGKILL'); n++; } catch {} }
    }
    return n;
  };
  const killDriver = async () => {
    try { process.kill(-child.pid, 'SIGTERM'); } catch {}
    await new Promise((r) => setTimeout(r, 2000));
    try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    return sweepChromium();
  };
  let interrupted = null;
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, async () => { if (interrupted) return; interrupted = sig; const n = await killDriver(); refuse('counter received ' + sig + '; driver group killed, ' + n + ' chromium processes swept'); });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; killDriver(); }, DRIVER_TIMEOUT_MS);
  const [status, signal] = await new Promise((res) => child.on('close', (c, s) => res([c, s])));
  clearTimeout(timer);
  try { process.kill(-child.pid, 'SIGKILL'); } catch {}
  const orphansSwept = sweepChromium();
  driverRun = { status, signal, timedOut, orphansSwept, stdout: stdout.trim().slice(0, 400), stderr: stderr.trim().slice(0, 400) };
  fs.rmSync(driverScratch, { recursive: true, force: true });
  if (interrupted) await new Promise(() => {}); // the signal handler owns the exit (verdict setup)
  if (status === 130) refuse('driver interrupted (exit 130, its own signal handler)', { revision, driverRun });
  if (status === 2) refuse('driver refused (exit 2): ' + driverRun.stderr, { revision, driverRun });
  if (signal !== null || timedOut) refuse('driver ended by signal ' + signal + (timedOut ? ' (timeout)' : ''), { revision, driverRun });
}
else if (!/^tabi-r94-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r94-...');

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
const isPosInt = (n) => Number.isInteger(n) && n > 0;
const attr = (shape, name) => {
  if (!isObj(shape) || !Array.isArray(shape.attributes)) return undefined;
  const a = shape.attributes;
  for (let i = 0; i + 1 < a.length; i += 2) if (a[i] === name) return a[i + 1];
  return undefined;
};
const isInputS = (shape) => isObj(shape) && shape.error === null && shape.nodeName === 'INPUT' && attr(shape, 'type') === 'file' && attr(shape, 'id') === 's';

check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);
check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);
check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);
check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);
check('cross-host', receipt.crossHost === 'localhost', null, 'crossHost ' + receipt.crossHost);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('pad', receipt.pad === PAD, null, 'pad ' + receipt.pad + ' expected ' + PAD);
check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));
const ports = isObj(receipt.ports) ? receipt.ports : {};
check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of ['C', 'M', 'S']) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));
const errLegs = legs.filter((l) => isObj(l) && l.error !== null).map((l) => l.leg);
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));
const ids = legs.map((l) => (isObj(l) ? l.browserId : null));
check('fresh-browser', ids.every((b) => typeof b === 'string' && /^[0-9a-f-]{36}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));

for (const l of legs) {
  if (!isObj(l)) { check('leg-shape', false, null, 'non-object leg ' + JSON.stringify(l)); continue; }
  const id = l.leg;
  const m = /^([CMS])-([0-9]+)$/.exec(String(id));
  const arm = m ? m[1] : null;
  check('leg-arm', !!m && l.arm === arm && l.rep === Number(m[2]), id, 'arm ' + l.arm + ' rep ' + l.rep);
  if (!arm) continue;
  const cross = arm !== 'S';
  const host = cross ? 'localhost' : '127.0.0.1';
  const pad = arm === 'C' ? 0 : PAD;
  check('leg-error', l.error === null, id, 'error ' + l.error);
  check('browser-version', l.browserVersion === BROWSER, id, 'browserVersion ' + l.browserVersion);
  check('child-host', l.childHost === host, id, 'childHost ' + l.childHost);
  check('leg-pad', l.pad === pad, id, 'pad ' + l.pad + ' expected ' + pad);
  let cu = null, pu = null;
  try { cu = new URL(l.childUrl); pu = new URL(l.parentUrl); } catch {}
  check('child-url', !!cu && cu.protocol === 'http:' && cu.hostname === host && Number(cu.port) === ports.child && cu.pathname === '/child.html' && cu.search === '?leg=' + id + '&pad=' + pad && cu.username === '' && cu.password === '' && cu.hash === '', id, 'childUrl ' + l.childUrl);
  check('parent-url', !!pu && pu.protocol === 'http:' && pu.hostname === '127.0.0.1' && Number(pu.port) === ports.http && pu.pathname === '/parent.html' && pu.search === '?leg=' + id && pu.username === '' && pu.password === '' && pu.hash === '', id, 'parentUrl ' + l.parentUrl);
  const attachedIframes = Array.isArray(l.attached) ? l.attached.filter((a) => isObj(a) && a.type === 'iframe') : null;
  const bit = Array.isArray(l.browserIframeTargets) ? l.browserIframeTargets : null;
  const choosers = Array.isArray(l.choosers) ? l.choosers : [];
  const session = cross ? 'iframe' : 'page';
  if (cross) {
    check('iframe-targets', !!attachedIframes && attachedIframes.length === 1 && !!bit && bit.length === 1 && isObj(bit[0]) && bit[0].targetId === attachedIframes[0].targetId && bit[0].url === l.childUrl && attachedIframes[0].targetId === l.childFrameId, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit) + ' childFrameId ' + l.childFrameId);
  } else {
    check('iframe-targets', !!attachedIframes && attachedIframes.length === 0 && !!bit && bit.length === 0, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit));
  }
  const c0 = isObj(choosers[0]) ? choosers[0] : {};
  const B = c0.backendNodeId;
  check('chooser', choosers.length === 1 && c0.session === session && typeof l.childFrameId === 'string' && l.childFrameId.length > 0 && c0.frameId === l.childFrameId && isPosInt(B), id, 'choosers ' + JSON.stringify(choosers) + ' expected one on ' + session + ' for frame ' + l.childFrameId);
  const dc = l.describeChooser;
  check('describe-chooser', isInputS(dc) && dc.session === session && dc.B === B && dc.backendNodeId === B, id, 'describeChooser ' + JSON.stringify(dc));
  const dp = l.describePage;
  const root = l.pageRoot;
  const pp = l.pagePierce;
  const rootIsParent = isObj(root) && root.error === null && root.nodeName === '#document' && root.documentURL === l.parentUrl && isPosInt(root.backendNodeId);
  const ppOk = isObj(pp) && pp.error === null && Number.isInteger(pp.maxBackendNodeId) && Number.isInteger(pp.inputS);
  if (arm === 'C') {
    check('describe-page', isObj(dp) && dp.session === 'page' && dp.B === B && dp.error === null && dp.nodeName === '#document' && dp.backendNodeId === B && dp.documentURL === l.parentUrl, id, 'describePage ' + JSON.stringify(dp));
    check('page-root', rootIsParent && root.backendNodeId === B, id, 'pageRoot ' + JSON.stringify(root) + ' B ' + B);
    check('page-pierce', ppOk && pp.inputS === 0 && pp.maxBackendNodeId >= B, id, 'pagePierce ' + JSON.stringify(pp) + ' B ' + B);
    check('cross-answer', isObj(l.crossAnswer) && l.crossAnswer.session === 'page' && l.crossAnswer.B === B && l.crossAnswer.error === NOT_FILE_INPUT && eq(l.filesAfterCross, []), id, 'crossAnswer ' + JSON.stringify(l.crossAnswer) + ' filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  } else if (arm === 'M') {
    check('describe-page', isObj(dp) && dp.session === 'page' && dp.B === B && dp.error === NO_NODE && dp.nodeName === null, id, 'describePage ' + JSON.stringify(dp));
    check('page-root', rootIsParent && root.backendNodeId !== B, id, 'pageRoot ' + JSON.stringify(root) + ' B ' + B);
    check('page-pierce', ppOk && pp.inputS === 0 && isPosInt(B) && pp.maxBackendNodeId < B, id, 'pagePierce ' + JSON.stringify(pp) + ' B ' + B);
    check('cross-answer', isObj(l.crossAnswer) && l.crossAnswer.session === 'page' && l.crossAnswer.B === B && l.crossAnswer.error === NO_NODE && eq(l.filesAfterCross, []), id, 'crossAnswer ' + JSON.stringify(l.crossAnswer) + ' filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  } else {
    check('describe-page', isInputS(dp) && dp.session === 'page' && dp.B === B && dp.backendNodeId === B, id, 'describePage ' + JSON.stringify(dp));
    check('page-root', rootIsParent, id, 'pageRoot ' + JSON.stringify(root));
    check('page-pierce', ppOk && pp.inputS === 1 && pp.maxBackendNodeId >= B, id, 'pagePierce ' + JSON.stringify(pp) + ' B ' + B);
    check('cross-answer', l.crossAnswer === null && l.filesAfterCross === null, id, 'crossAnswer ' + JSON.stringify(l.crossAnswer) + ' filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  }
  check('answer', isObj(l.answer) && l.answer.session === session && l.answer.B === B && l.answer.error === null, id, 'answer ' + JSON.stringify(l.answer));
  check('child-files', eq(l.childFiles, [ANSWER]), id, 'childFiles ' + JSON.stringify(l.childFiles));
  check('child-click', eq(l.childClicks, [{ target: 's', isTrusted: true }]), id, 'childClicks ' + JSON.stringify(l.childClicks));
}

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, receiptSha256, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
