#!/usr/bin/env node
// Counter: tabi round 92, C1, predicate `C1-IFRAME-CHOOSER-R92` (frozen in plans/round-92.md).
// Reads a receipt of scripts/chrome-cdp-iframe-chooser-round92.mjs and checks, per leg, where the
// file chooser of a clicked iframe file input was reported and answered:
//   X (child host `localhost`, a different site from the 127.0.0.1 parent): exactly one attached
//     target of type `iframe`, its Target.getTargets URL equal to the child URL and its targetId
//     equal to the child frame id; exactly one `Page.fileChooserOpened`, on that iframe session,
//     for the child frame; the answer sent on the iframe session without error;
//   S (child host `127.0.0.1`, same site, other port): zero `iframe` targets; exactly one
//     `Page.fileChooserOpened`, on the page session, for the child frame; the answer sent on the
//     page session without error;
//   both: the child input then holds exactly the answer file [name, 22] and the child document
//     recorded exactly one click, trusted, targeting `#s`.
// Modes:
//   --receipt <path>  check a written receipt (a forger who writes a whole consistent receipt
//                     passes this mode; that is why the claim's counting command is --live);
//   --live            run the pinned driver now (sha256 checked BEFORE it runs) with a fresh nonce
//                     into --scratch and check the receipt it writes.
// Usage:
//   node check-iframe-chooser-round92.mjs --lane <ABS lane> --expect-driver-sha256 <hex>
//     (--receipt <path> --expect-nonce <nonce> | --live --scratch <ABS dir> --ports <http,child,cdp>)
//     [--reps 3] [--json]
// Exit 0: zero findings; 1: findings; 2: usage/setup refusal.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const PREDICATE = 'C1-IFRAME-CHOOSER-R92';
const SCHEMA = 'tabi-chrome-cdp-iframe-chooser-r92';
const CHROMIUM_TAG = '155.0.8059.84';
const DRIVER_REL = 'scripts/chrome-cdp-iframe-chooser-round92.mjs';
const ANSWER = ['tabi-r92-answer.txt', 22];
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const flag = (n) => argv.includes('--' + n);
const refuse = (d) => { console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'setup', detail: d })); process.exit(2); };
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
  expectNonce = 'tabi-r92-live-' + crypto.randomBytes(6).toString('hex');
  receiptPath = path.join(scratch, 'live-receipt.json');
  fs.mkdirSync(scratch, { recursive: true });
  try { fs.rmSync(receiptPath, { force: true }); } catch {}
  const r = spawnSync(process.execPath, [driverPath, '--lane', lane, '--nonce', expectNonce, '--scratch', path.join(scratch, 'driver'), '--out', receiptPath, '--http-port', ports[0], '--child-port', ports[1], '--cdp-port', ports[2], '--reps', String(reps), '--cross-host', 'localhost'], { encoding: 'utf8', timeout: 600000 });
  driverRun = { status: r.status, stdout: (r.stdout || '').trim().slice(0, 400), stderr: (r.stderr || '').trim().slice(0, 400) };
  fs.rmSync(path.join(scratch, 'driver'), { recursive: true, force: true });
} else if (!/^tabi-r92-[a-z0-9-]{4,48}$/.test(expectNonce || '')) refuse('--receipt needs --expect-nonce tabi-r92-...');

let receipt;
try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')); } catch (e) {
  console.log(JSON.stringify({ predicate: PREDICATE, verdict: 'findings', revision, driverRun, checkCount: 1, findings: [{ id: 'receipt-unreadable', leg: null, detail: String(e.message) }] }));
  process.exit(1);
}

const findings = [];
let checkCount = 0;
const check = (id, ok, leg, detail) => { checkCount++; if (!ok) findings.push({ id, leg, detail }); };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);

check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);
check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);
check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);
check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);
check('cross-host', receipt.crossHost === 'localhost', null, 'crossHost ' + receipt.crossHost);
check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);
check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));
check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0, null, 'failures ' + JSON.stringify(receipt.failures));
const ports = isObj(receipt.ports) ? receipt.ports : {};
const legs = Array.isArray(receipt.legs) ? receipt.legs : [];
const want = [];
for (let r = 1; r <= reps; r++) for (const a of ['X', 'S']) want.push(a + '-' + r);
check('leg-set', eq(legs.map((l) => l && l.leg).sort(), want.slice().sort()), null, 'legs ' + JSON.stringify(legs.map((l) => l && l.leg)));

for (const l of legs) {
  if (!isObj(l)) { check('leg-shape', false, null, 'non-object leg'); continue; }
  const id = l.leg;
  const arm = String(id || '').split('-')[0];
  const host = arm === 'X' ? 'localhost' : '127.0.0.1';
  check('leg-arm', l.arm === arm && (arm === 'X' || arm === 'S'), id, 'arm ' + l.arm);
  check('leg-error', l.error === null, id, 'error ' + l.error);
  check('child-host', l.childHost === host, id, 'childHost ' + l.childHost);
  let cu = null, pu = null;
  try { cu = new URL(l.childUrl); pu = new URL(l.parentUrl); } catch {}
  check('child-url', !!cu && cu.hostname === host && Number(cu.port) === ports.child && cu.pathname === '/child.html', id, 'childUrl ' + l.childUrl);
  check('parent-url', !!pu && pu.hostname === '127.0.0.1' && Number(pu.port) === ports.http && pu.pathname === '/parent.html', id, 'parentUrl ' + l.parentUrl);
  const attachedIframes = Array.isArray(l.attached) ? l.attached.filter((a) => a && a.type === 'iframe') : null;
  const targets = Array.isArray(l.iframeTargets) ? l.iframeTargets : null;
  const choosers = Array.isArray(l.choosers) ? l.choosers : [];
  const session = arm === 'X' ? 'iframe' : 'page';
  if (arm === 'X') {
    check('iframe-target-count', !!attachedIframes && attachedIframes.length === 1 && !!targets && targets.length === 1, id, 'attached iframes ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(targets));
    check('browser-iframe-targets', Array.isArray(l.browserIframeTargets) && l.browserIframeTargets.length === 1 && !!attachedIframes && attachedIframes.length === 1 && l.browserIframeTargets[0].targetId === attachedIframes[0].targetId && l.browserIframeTargets[0].url === l.childUrl, id, 'browser iframe targets ' + JSON.stringify(l.browserIframeTargets));
    const t0 = targets && targets[0];
    check('iframe-target-url', !!t0 && t0.url === l.childUrl, id, 'target url ' + (t0 && t0.url));
    check('iframe-target-frame', !!t0 && !!attachedIframes && attachedIframes.length === 1 && t0.targetId === attachedIframes[0].targetId && t0.targetId === l.childFrameId, id, 'targetId ' + (t0 && t0.targetId) + ' childFrameId ' + l.childFrameId);
  } else {
    check('iframe-target-count', !!attachedIframes && attachedIframes.length === 0 && !!targets && targets.length === 0, id, 'attached iframes ' + JSON.stringify(attachedIframes) + ' targets ' + JSON.stringify(targets));
    check('browser-iframe-targets', Array.isArray(l.browserIframeTargets) && l.browserIframeTargets.length === 0, id, 'browser iframe targets ' + JSON.stringify(l.browserIframeTargets));
  }
  check('chooser-count', choosers.length === 1, id, 'choosers ' + JSON.stringify(choosers));
  const c0 = choosers[0] || {};
  check('chooser-session', choosers.length === 1 && c0.session === session, id, 'chooser session ' + c0.session + ' expected ' + session);
  check('chooser-frame', choosers.length === 1 && typeof l.childFrameId === 'string' && l.childFrameId.length > 0 && c0.frameId === l.childFrameId, id, 'chooser frame ' + c0.frameId + ' child ' + l.childFrameId);
  check('answer-session', isObj(l.answer) && l.answer.session === session && l.answer.error === null, id, 'answer ' + JSON.stringify(l.answer));
  check('child-files', eq(l.childFiles, [ANSWER]), id, 'childFiles ' + JSON.stringify(l.childFiles));
  check('child-click', eq(l.childClicks, [{ target: 's', isTrusted: true }]), id, 'childClicks ' + JSON.stringify(l.childClicks));
}

const out = { predicate: PREDICATE, verdict: findings.length ? 'findings' : 'clean', revision, mode: live ? 'live' : 'receipt', receipt: receiptPath, nonce: expectNonce, driverSha256: driverSha, driverRun, checkCount, findings };
console.log(flag('json') ? JSON.stringify(out, null, 2) : JSON.stringify(out));
process.exit(findings.length ? 1 : 0);
