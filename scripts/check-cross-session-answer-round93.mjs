#!/usr/bin/env node
// Counter: tabi round 93, C1, predicate `C1-CROSS-SESSION-ANSWER-R93` (frozen in plans/round-93.md).
// Reads a receipt of scripts/chrome-cdp-cross-session-answer-round93.mjs and checks, per leg, what a
// file chooser's backendNodeId B names on the session it arrived on and on the PAGE session:
//   X (child host `localhost`, cross-site, own `iframe` target): exactly one attached `iframe`
//     target, exactly one in Target.getTargets, same targetId, URL = child URL, targetId = child
//     frame id; the chooser on the iframe session; DOM.describeNode(B) on the iframe session is the
//     child INPUT (type=file, id=s); DOM.describeNode(B) on the page session succeeds and is a
//     `#document` node; the page session's pierced DOM.getDocument holds 0 INPUT#s; page-session
//     DOM.setFileInputFiles(B) returns exactly the error "Node is not a file input element" and the
//     child's files stay []; then the iframe-session answer returns no error;
//   S (child host `127.0.0.1`, same site, no own target): zero `iframe` targets; the chooser on the
//     page session; DOM.describeNode(B) on the page session is the child INPUT; the pierced
//     document holds exactly 1 INPUT#s; no cross answer is attempted; the page-session answer
//     returns no error;
//   both: the child's files then read exactly [[answer name, 22]], the child recorded exactly one
//     trusted click on #s, the leg's DevTools browser is `Chrome/155.0.8059.84`, and every leg ran
//     in its own browser (distinct DevTools browser ids).
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt
//                     passes this mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce
//                     into --scratch and check the receipt it writes. A driver usage/setup refusal
//                     (driver exit 2) is reported as verdict `setup`, exit 2.
// Usage:
//   node check-cross-session-answer-round93.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --scratch <ABS dir> --ports <http,child,cdp>)
//     [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const PREDICATE = 'C1-CROSS-SESSION-ANSWER-R93';
const SCHEMA = 'tabi-chrome-cdp-cross-session-answer-r93';
const CHROMIUM_TAG = '155.0.8059.84';
const BROWSER = 'Chrome/155.0.8059.84';
const DRIVER_REL = 'scripts/chrome-cdp-cross-session-answer-round93.mjs';
const ANSWER = ['tabi-r93-answer.txt', 22];
const CROSS_ERROR = 'Node is not a file input element';
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
  expectNonce = 'tabi-r93-live-' + crypto.randomBytes(6).toString('hex');
  receiptPath = path.join(scratch, 'live-receipt.json');
  fs.mkdirSync(scratch, { recursive: true });
  fs.rmSync(receiptPath, { force: true });
  const r = spawnSync(process.execPath, [driverPath, '--lane', lane, '--nonce', expectNonce, '--scratch', path.join(scratch, 'driver'), '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps), '--cross-host', 'localhost'], { encoding: 'utf8', timeout: 600000 });
  driverRun = { status: r.status, signal: r.signal, stdout: (r.stdout || '').trim().slice(0, 400), stderr: (r.stderr || '').trim().slice(0, 400) };
  fs.rmSync(path.join(scratch, 'driver'), { recursive: true, force: true });
  if (r.status === 2) refuse('driver refused (exit 2): ' + driverRun.stderr, { revision, driverRun });
}
else if (!/^tabi-r93-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r93-...');

let receipt;
try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch (e) {
  console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, driverRun, checkCount: 1, findings: [{ id: 'receipt-unreadable', leg: null, detail: String(e.message) }] }));
  process.exit(1);
}
if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) receipt = {};

const findings = [];
let checkCount = 0;
const check = (id, ok, leg, detail) => { checkCount++; if (!ok) findings.push({ id, leg, detail }); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
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
check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));
const ports = isObj(receipt.ports) ? receipt.ports : {};
check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of ['X', 'S']) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));
const errLegs = legs.filter((l) => isObj(l) && l.error !== null).map((l) => l.leg);
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));
const ids = legs.map((l) => (isObj(l) ? l.browserId : null));
check('fresh-browser', ids.every((b) => typeof b === 'string' && /^[0-9a-f-]{36}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));

for (const l of legs) {
  if (!isObj(l)) { check('leg-shape', false, null, 'non-object leg ' + JSON.stringify(l)); continue; }
  const id = l.leg;
  const m = /^([XS])-([0-9]+)$/.exec(String(id));
  const arm = m ? m[1] : null;
  check('leg-arm', !!m && l.arm === arm && l.rep === Number(m[2]), id, 'arm ' + l.arm + ' rep ' + l.rep);
  if (!arm) continue;
  const host = arm === 'X' ? 'localhost' : '127.0.0.1';
  check('leg-error', l.error === null, id, 'error ' + l.error);
  check('browser-version', l.browserVersion === BROWSER, id, 'browserVersion ' + l.browserVersion);
  check('child-host', l.childHost === host, id, 'childHost ' + l.childHost);
  let cu = null, pu = null;
  try { cu = new URL(l.childUrl); pu = new URL(l.parentUrl); } catch {}
  check('child-url', !!cu && cu.protocol === 'http:' && cu.hostname === host && Number(cu.port) === ports.child && cu.pathname === '/child.html' && cu.search === '?leg=' + id && cu.username === '' && cu.password === '', id, 'childUrl ' + l.childUrl);
  check('parent-url', !!pu && pu.protocol === 'http:' && pu.hostname === '127.0.0.1' && Number(pu.port) === ports.http && pu.pathname === '/parent.html' && pu.search === '?leg=' + id && pu.username === '' && pu.password === '', id, 'parentUrl ' + l.parentUrl);
  const attachedIframes = Array.isArray(l.attached) ? l.attached.filter((a) => isObj(a) && a.type === 'iframe') : null;
  const bit = Array.isArray(l.browserIframeTargets) ? l.browserIframeTargets : null;
  const choosers = Array.isArray(l.choosers) ? l.choosers : [];
  const session = arm === 'X' ? 'iframe' : 'page';
  if (arm === 'X') {
    check('iframe-targets', !!attachedIframes && attachedIframes.length === 1 && !!bit && bit.length === 1 && isObj(bit[0]) && bit[0].targetId === attachedIframes[0].targetId && bit[0].url === l.childUrl && attachedIframes[0].targetId === l.childFrameId, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit) + ' childFrameId ' + l.childFrameId);
  } else {
    check('iframe-targets', !!attachedIframes && attachedIframes.length === 0 && !!bit && bit.length === 0, id, 'attached ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(bit));
  }
  const c0 = isObj(choosers[0]) ? choosers[0] : {};
  check('chooser', choosers.length === 1 && c0.session === session && typeof l.childFrameId === 'string' && l.childFrameId.length > 0 && c0.frameId === l.childFrameId && Number.isInteger(c0.backendNodeId) && c0.backendNodeId > 0, id, 'choosers ' + JSON.stringify(choosers) + ' expected one on ' + session + ' for frame ' + l.childFrameId);
  check('describe-chooser', isInputS(l.describeChooser) && l.describeChooser.session === session, id, 'describeChooser ' + JSON.stringify(l.describeChooser));
  const dp = l.describePage;
  if (arm === 'X') {
    check('describe-page', isObj(dp) && dp.session === 'page' && dp.error === null && dp.nodeName === '#document', id, 'describePage ' + JSON.stringify(dp));
    check('pierce-input', l.pagePierceInputS === 0, id, 'page pierced INPUT#s count ' + l.pagePierceInputS);
    check('cross-answer', isObj(l.crossAnswer) && l.crossAnswer.session === 'page' && l.crossAnswer.error === CROSS_ERROR && eq(l.filesAfterCross, []), id, 'crossAnswer ' + JSON.stringify(l.crossAnswer) + ' filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  } else {
    check('describe-page', isInputS(dp) && dp.session === 'page', id, 'describePage ' + JSON.stringify(dp));
    check('pierce-input', l.pagePierceInputS === 1, id, 'page pierced INPUT#s count ' + l.pagePierceInputS);
    check('cross-answer', l.crossAnswer === null && l.filesAfterCross === null, id, 'crossAnswer ' + JSON.stringify(l.crossAnswer) + ' filesAfterCross ' + JSON.stringify(l.filesAfterCross));
  }
  check('answer', isObj(l.answer) && l.answer.session === session && l.answer.error === null, id, 'answer ' + JSON.stringify(l.answer));
  check('child-files', eq(l.childFiles, [ANSWER]), id, 'childFiles ' + JSON.stringify(l.childFiles));
  check('child-click', eq(l.childClicks, [{ target: 's', isTrusted: true }]), id, 'childClicks ' + JSON.stringify(l.childClicks));
}

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
