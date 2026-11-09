#!/usr/bin/env node
// Counter: tabi round 95, C1, predicate `C1-BACKENDNODE-MISDELIVERY-R95` (frozen in plans/round-95.md).
// Reads a receipt of scripts/chrome-cdp-backendnode-misdelivery-round95.mjs and checks, per leg, that a
// cross-site iframe chooser's backendNodeId B, sent on the PAGE session, acts on exactly the node the
// page's own pierced snapshot carries at id B (T), or on no node when the snapshot has none:
//   describe-page: T present -> page DOM.describeNode(B) has no error and equals T on nodeName,
//     nodeType, attributes and backendNodeId; T absent -> error exactly "No node found for given
//     backend id";
//   cross-answer (cross-site legs): T one of the parent's own file inputs #pN -> page
//     DOM.setFileInputFiles(B) returns no error, #pN (and no other parent input) then holds exactly the
//     answer file and the child's #s holds []; T any other node -> error exactly "Node is not a file
//     input element", every parent input and the child hold []; T absent -> error exactly "No node found
//     for given backend id", every parent input and the child hold [];
//   Z legs (q = 0): T absent and every snapshot id is below B;
//   S legs (same-site): one chooser on the page session, T and page describeNode(B) are the child
//     INPUT#s, no cross answer;
//   leg set: at least one P leg where T is a parent file input (misdelivery) and at least one P leg
//     where T is a parent node that is not a file input;
//   every leg: exactly one chooser (iframe session for cross-site legs) for the child frame with integer
//     B > 0, describeNode(B) on that session is INPUT type=file id=s with backendNodeId B, the snapshot
//     root is the parent #document (documentURL = parent URL), at most one snapshot node carries B, the
//     snapshot lists exactly #p0..#p5 as file inputs with distinct integer ids, the answer on the chooser
//     session returns no error and the child's files then read exactly [[answer, 22]], exactly one
//     trusted click on #s, DevTools `Chrome/155.0.8059.84`, every leg in its own browser.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt passes this
//                     mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce passed
//                     in the driver's environment (never argv) and a receipt path inside a fresh
//                     mkdtemp directory under --scratch (r94 R94Sentinel F1), then check that receipt.
//                     The driver runs in its own process group; on the counter's own SIGINT/SIGTERM/SIGHUP
//                     and after 900 s the counter sends that group SIGTERM, then SIGKILL after 2 s, then
//                     kills every process whose --user-data-dir lies under the driver scratch; the sweep
//                     also runs after every driver exit (`driverRun.orphansSwept`). Verdict `setup`, exit
//                     2, with `driverRun` in the output (r94 F3), for: a driver usage refusal (exit 2), a
//                     chromium that never answered its DevTools endpoint (driver exit 3, r94 F2), a driver
//                     ended by a signal or exiting 130 from its own handler, a counter interrupted by a
//                     signal, and a receipt path that is not a regular file (r94 F4).
// The output names the receipt path and its sha256.
// Usage:
//   node check-backendnode-misdelivery-round95.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --scratch <ABS dir> --ports <http,child,cdp>)
//     [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const PREDICATE = 'C1-BACKENDNODE-MISDELIVERY-R95';
const SCHEMA = 'tabi-chrome-cdp-backendnode-misdelivery-r95';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/chrome-cdp-backendnode-misdelivery-round95.mjs';
const ANSWER = ['tabi-r95-answer.txt', 22];
const PAD = 300;
const QS = [286, 287, 288, 289];
const ZQ = 0;
const SQ = 288;
const K = 6;
const PIDS = Array.from({ length: K }, (_, i) => 'p' + i);
const NOT_FILE_INPUT = 'Node is not a file input element';
const NO_NODE = 'No node found for given backend id';
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
if (live) {
  const scratch = opt('scratch');
  if (!scratch || !path.isAbsolute(scratch)) refuse('--live needs an absolute --scratch');
  const ports = (opt('ports') || '').split(',');
  if (ports.length !== 3 || !ports.every((p) => /^[0-9]+$/.test(p))) refuse('--ports must be http,child,cdp');
  if (driverSha !== pin) {
    console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, checkCount: 1, findings: [{ id: 'driver-pin', leg: null, detail: 'driver sha256 ' + driverSha + ' != pin ' + pin + ' (driver not run)' }] }));
    process.exit(1);
  }
  expectNonce = 'tabi-r95-live-' + crypto.randomBytes(6).toString('hex');
  fs.mkdirSync(scratch, { recursive: true });
  const receiptDir = fs.mkdtempSync(path.join(scratch, 'receipt-'));
  receiptPath = path.join(receiptDir, 'live-receipt-' + crypto.randomBytes(6).toString('hex') + '.json');
  const driverScratch = path.join(scratch, 'driver');
  const child = spawn(process.execPath, [driverPath, '--lane', lane, '--scratch', driverScratch, '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps), '--cross-host', 'localhost', '--pad', String(PAD), '--qs', QS.join(','), '--zq', String(ZQ), '--sq', String(SQ)], { stdio: ['ignore', 'pipe', 'pipe'], detached: true, env: { ...process.env, TABI_R95_NONCE: expectNonce } });
  let stdout = '', stderr = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  // chromium runs in its own process groups under the driver; after the driver ends, and on the
  // counter's own signals/timeout, every process whose command line names a profile under this run's
  // driver scratch is killed (chromium rewrites its argv, so the whole command line is matched).
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
  if (interrupted) await new Promise(() => {}); // the signal handler owns the exit (verdict setup)
  if (status === 130) refuse('driver interrupted (exit 130, its own signal handler)', { revision, driverRun });
  if (status === 2) refuse('driver refused (exit 2): ' + driverRun.stderr, { revision, driverRun });
  if (status === 3) refuse('chromium never answered its DevTools endpoint (driver exit 3, host resource failure)', { revision, driverRun });
  if (signal !== null || timedOut) refuse('driver ended by signal ' + signal + (timedOut ? ' (timeout)' : ''), { revision, driverRun });
}
else if (!/^tabi-r95-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r95-...');

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
const isPosInt = (n) => Number.isInteger(n) && n > 0;
const attr = (shape, name) => {
  if (!isObj(shape) || !Array.isArray(shape.attributes)) return undefined;
  const a = shape.attributes;
  for (let i = 0; i + 1 < a.length; i += 2) if (a[i] === name) return a[i + 1];
  return undefined;
};
const isInputS = (shape) => isObj(shape) && shape.nodeName === 'INPUT' && attr(shape, 'type') === 'file' && attr(shape, 'id') === 's';
const parentFileInputId = (shape) => (isObj(shape) && shape.nodeName === 'INPUT' && attr(shape, 'type') === 'file' && PIDS.includes(attr(shape, 'id')) ? attr(shape, 'id') : null);
const sameNode = (a, b) => isObj(a) && isObj(b) && a.nodeName === b.nodeName && a.nodeType === b.nodeType && eq(a.attributes, b.attributes) && a.backendNodeId === b.backendNodeId;

check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);
check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);
check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);
check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);
check('cross-host', receipt.crossHost === 'localhost', null, 'crossHost ' + receipt.crossHost);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('pad', receipt.pad === PAD, null, 'pad ' + receipt.pad + ' expected ' + PAD);
check('fixture', eq(receipt.qs, QS) && receipt.zq === ZQ && receipt.sq === SQ && receipt.k === K, null, 'qs ' + JSON.stringify(receipt.qs) + ' zq ' + receipt.zq + ' sq ' + receipt.sq + ' k ' + receipt.k);
check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));
const ports = isObj(receipt.ports) ? receipt.ports : {};
check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const arms = [...QS.map((q) => 'P' + q), 'Z', 'S'];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of arms) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));
const errLegs = legs.filter((l) => isObj(l) && l.error !== null).map((l) => l.leg);
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));
const ids = legs.map((l) => (isObj(l) ? l.browserId : null));
check('fresh-browser', ids.every((b) => typeof b === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));

const branches = { misdelivery: [], collision: [], miss: [] };
for (const l of legs) {
  if (!isObj(l)) { check('leg-shape', false, null, 'non-object leg ' + JSON.stringify(l)); continue; }
  const id = l.leg;
  const m = /^(P([0-9]+)|Z|S)-([0-9]+)$/.exec(String(id));
  const arm = m ? (m[2] ? 'P' + m[2] : m[1]) : null;
  if (!m || !arms.includes(arm)) { check('leg-arm', false, id, 'unknown leg ' + id); continue; }
  const q = arm === 'Z' ? ZQ : arm === 'S' ? SQ : Number(m[2]);
  check('leg-arm', l.arm === arm && l.rep === Number(m[3]) && l.q === q && l.pad === PAD, id, 'arm ' + l.arm + ' rep ' + l.rep + ' q ' + l.q + ' pad ' + l.pad);
  const cross = arm !== 'S';
  const host = cross ? 'localhost' : '127.0.0.1';
  check('leg-error', l.error === null, id, 'error ' + l.error);
  check('browser-version', l.browserVersion === BROWSER, id, 'browserVersion ' + l.browserVersion);
  check('child-host', l.childHost === host, id, 'childHost ' + l.childHost);
  let cu = null, pu = null;
  try { cu = new URL(l.childUrl); pu = new URL(l.parentUrl); } catch {}
  check('child-url', !!cu && cu.protocol === 'http:' && cu.hostname === host && Number(cu.port) === ports.child && cu.pathname === '/child.html' && cu.search === '?leg=' + id + '&pad=' + PAD && cu.username === '' && cu.password === '' && cu.hash === '', id, 'childUrl ' + l.childUrl);
  check('parent-url', !!pu && pu.protocol === 'http:' && pu.hostname === '127.0.0.1' && Number(pu.port) === ports.http && pu.pathname === '/parent.html' && pu.search === '?leg=' + id + '&q=' + q && pu.username === '' && pu.password === '' && pu.hash === '', id, 'parentUrl ' + l.parentUrl);
  const attachedIframes = Array.isArray(l.attached) ? l.attached.filter((a) => isObj(a) && a.type === 'iframe') : null;
  const bit = Array.isArray(l.browserIframeTargets) ? l.browserIframeTargets : null;
  if (cross) check('iframe-targets', !!attachedIframes && attachedIframes.length === 1 && !!bit && bit.length === 1 && isObj(bit[0]) && bit[0].targetId === attachedIframes[0].targetId && bit[0].url === l.childUrl && attachedIframes[0].targetId === l.childFrameId, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit) + ' childFrameId ' + l.childFrameId);
  else check('iframe-targets', !!attachedIframes && attachedIframes.length === 0 && !!bit && bit.length === 0, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit));
  const choosers = Array.isArray(l.choosers) ? l.choosers : [];
  const session = cross ? 'iframe' : 'page';
  const c0 = isObj(choosers[0]) ? choosers[0] : {};
  const B = c0.backendNodeId;
  check('chooser', choosers.length === 1 && c0.session === session && typeof l.childFrameId === 'string' && l.childFrameId.length > 0 && c0.frameId === l.childFrameId && isPosInt(B), id, 'choosers ' + JSON.stringify(choosers) + ' expected one on ' + session + ' for frame ' + l.childFrameId);
  const dc = l.describeChooser;
  check('describe-chooser', isObj(dc) && dc.error === null && isInputS(dc) && dc.session === session && dc.B === B && dc.backendNodeId === B, id, 'describeChooser ' + JSON.stringify(dc));
  const sn = l.snapshot;
  const snOk = isObj(sn) && sn.error === null && sn.B === B && sn.rootNodeName === '#document' && sn.rootDocumentURL === l.parentUrl && Number.isInteger(sn.maxBackendNodeId) && Number.isInteger(sn.inputS) && Array.isArray(sn.atB) && Array.isArray(sn.parentInputs);
  check('snapshot', snOk && sn.atB.length <= 1 && sn.atB.every((n) => isObj(n) && n.backendNodeId === B) && sn.inputS === (cross ? 0 : 1), id, 'snapshot ' + JSON.stringify(sn && { error: sn.error, B: sn.B, root: sn.rootNodeName, url: sn.rootDocumentURL, inputS: sn.inputS, atB: sn.atB, max: sn.maxBackendNodeId }));
  const pIds = snOk ? sn.parentInputs : [];
  check('parent-inputs', eq(pIds.map((x) => (Array.isArray(x) ? x[0] : null)), PIDS) && pIds.every((x) => isPosInt(x[1])) && new Set(pIds.map((x) => x[1])).size === K, id, 'parentInputs ' + JSON.stringify(pIds));
  const T = snOk && sn.atB.length === 1 ? sn.atB[0] : null;
  const dp = l.describePage;
  if (T) check('describe-page', isObj(dp) && dp.session === 'page' && dp.B === B && dp.error === null && sameNode(dp, T), id, 'describePage ' + JSON.stringify(dp) + ' snapshot node ' + JSON.stringify(T));
  else check('describe-page', isObj(dp) && dp.session === 'page' && dp.B === B && dp.error === NO_NODE && dp.nodeName === null, id, 'describePage ' + JSON.stringify(dp) + ' snapshot node none');
  const ca = l.crossAnswer;
  const pf = l.parentFilesAfterCross;
  if (cross) {
    const pfShapeOk = Array.isArray(pf) && eq(pf.map((x) => (Array.isArray(x) ? x[0] : null)), PIDS);
    const filled = pfShapeOk ? pf.filter((x) => !eq(x[1], [])).map((x) => x[0]) : null;
    const target = parentFileInputId(T);
    if (target) {
      branches.misdelivery.push(id);
      check('cross-answer', isObj(ca) && ca.session === 'page' && ca.B === B && ca.error === null, id, 'crossAnswer ' + JSON.stringify(ca) + ' snapshot node #' + target);
      check('parent-files', pfShapeOk && eq(filled, [target]) && eq(pf.find((x) => x[0] === target)[1], [ANSWER]), id, 'parentFilesAfterCross ' + JSON.stringify(pf) + ' expected only #' + target + ' = ' + JSON.stringify([ANSWER]));
    } else {
      if (T) branches.collision.push(id); else branches.miss.push(id);
      check('cross-answer', isObj(ca) && ca.session === 'page' && ca.B === B && ca.error === (T ? NOT_FILE_INPUT : NO_NODE), id, 'crossAnswer ' + JSON.stringify(ca) + ' snapshot node ' + JSON.stringify(T));
      check('parent-files', pfShapeOk && eq(filled, []), id, 'parentFilesAfterCross ' + JSON.stringify(pf) + ' expected all []');
    }
    check('child-files-after-cross', eq(l.filesAfterCross, []), id, 'filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  } else {
    check('same-site', isInputS(T) && T.backendNodeId === B && isObj(dp) && dp.error === null && isInputS(dp) && ca === null && pf === null && l.filesAfterCross === null, id, 'snapshot node ' + JSON.stringify(T) + ' describePage ' + JSON.stringify(dp) + ' crossAnswer ' + JSON.stringify(ca));
  }
  if (arm === 'Z') check('z-miss', snOk && T === null && isPosInt(B) && sn.maxBackendNodeId < B, id, 'Z leg: snapshot node ' + JSON.stringify(T) + ' max ' + (sn && sn.maxBackendNodeId) + ' B ' + B);
  check('answer', isObj(l.answer) && l.answer.session === session && l.answer.B === B && l.answer.error === null, id, 'answer ' + JSON.stringify(l.answer));
  check('child-files', eq(l.childFiles, [ANSWER]), id, 'childFiles ' + JSON.stringify(l.childFiles));
  check('child-click', eq(l.childClicks, [{ target: 's', isTrusted: true }]), id, 'childClicks ' + JSON.stringify(l.childClicks));
}
const pBranch = (list) => list.filter((x) => String(x).startsWith('P'));
check('branch-misdelivery', pBranch(branches.misdelivery).length >= 1, null, 'P legs where B named a parent file input: ' + JSON.stringify(branches.misdelivery));
check('branch-collision', pBranch(branches.collision).length >= 1, null, 'P legs where B named a parent non-file-input node: ' + JSON.stringify(branches.collision));

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, receiptSha256, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, branches, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
