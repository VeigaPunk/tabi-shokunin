#!/usr/bin/env node
// Counter for scripts/chrome-cdp-showpicker-round80.mjs (tabi round 80, C1, predicate
// C1-SHOWPICKER-R80). Binds the generation-r80 frontier legs of the programmatic file-picker
// trigger `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on
// Chromium 155/Linux `--headless=new`:
//   * a `webkitdirectory` input and an `accept`-constrained input open the same `selectSingle`
//     chooser (the CDP mode enum has no directory-specific value);
//   * two calls each carrying `Runtime.evaluate {userGesture:true}` both succeed and open TWO
//     pickers — there is no "already open" guard on the programmatic path;
//   * a call deferred through `setTimeout(…, 0)` from a trusted click's handler succeeds while
//     the activation is still live;
//   * a cross-origin iframe's own script opens its own input's picker (no SecurityError); the
//     parent cannot reach the child's document (`contentDocument === null`, `contentWindow.document`
//     throws SecurityError), so page script cannot construct the spec's SecurityError case; a
//     disabled child input still throws InvalidStateError and does not consume the activation;
//   * the trigger ANSWERED: `Page.fileChooserOpened` -> `DOM.setFileInputFiles` on the event's
//     `backendNodeId` delivers the exact bytes and fires trusted `input`+`change`.
//
// Usage:
//   node check-showpicker-r80.mjs --lane <ABS lane> --receipt <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r80-...> --expect-fixture-sha256 <hex>
//     --prior-set <file> [--prior <receipt.json> ...] [--tree-exempt-sha256 <hex> ...] [--json]
//
// The exemption interface is CONTENT-bound: `--tree-exempt-sha256` names the exempted file by
// sha256 and the counter resolves it inside the walked trees; a path-shaped `--tree-exempt` is
// refused (round-77 routed defect 3 / round-78's path exemption). A hash that matches no walked
// file is refused too, so an exemption can never be a silent no-op.
//
// LIMIT (frozen sentence, printed beside the threshold in the `limit` block): this counter reads a
// receipt. A forger who rewrites the identity fields and moves at least `absNeed(prior)` = ceil(0.5
// * the prior's own event count) page-event times AND `gapNeed(prior)` = ceil(0.75 * the prior's own
// >= 50 ms gaps) gaps escapes the replay rule; the escape minimum is therefore
// `N_p - absNeed + 1` events and `G_p - gapNeed + 1` gaps, printed per prior. A browser-assigned
// `Page.fileChooserOpened.backendNodeId` relabelled consistently inside one leg is INSIDE the limit
// by design (QUALITY 150): the receipt binds the page-measured element descriptor and the mode, and
// reports the id without requiring a literal. A receipt outside the two walked trees and outside
// `--prior` is outside the walk.
//
// Exit 0: verdict clean, every check true. 1: findings. 2: usage or unreadable input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-chrome-cdp-showpicker-r80';
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', nodeMajor: 24 };
const VIEWPORT = { width: 1280, height: 900 };
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const TREES = ['.ufo/waves/round-80', 'corpus/evidence/round80'];
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const asJson = argv.includes('--json');
const usage = (d) => { out({ verdict: 'usage', findings: [{ id: 'usage', detail: d }] }, 2); process.exit(2); };
const fatal = (obj, code) => { out(obj, code); process.exit(code); };
function out(obj, code) {
  const payload = { schema: SCHEMA + '-counter', ...obj };
  if (asJson) process.stdout.write(JSON.stringify(payload, null, 1) + '\n');
  else process.stdout.write(JSON.stringify({ verdict: payload.verdict, checkCount: payload.checkCount, findings: payload.findings }, null, 1) + '\n');
  process.exitCode = code;
}
const lane = opt('lane');
const rp = opt('receipt');
const pin = opt('expect-driver-sha256');
const expectNonce = opt('expect-nonce');
const expectFixture = opt('expect-fixture-sha256');
const priorSet = opt('prior-set');
const extraPriors = multi('prior');
const exemptHashes = multi('tree-exempt-sha256');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!rp) usage('--receipt is required');
if (!pin || !/^[0-9a-f]{64}$/.test(pin)) usage('--expect-driver-sha256 must be 64 hex');
if (!expectNonce) usage('--expect-nonce is required');
if (!expectFixture || !/^[0-9a-f]{64}$/.test(expectFixture)) usage('--expect-fixture-sha256 must be 64 hex');
if (!priorSet) usage('--prior-set is required');
if (argv.includes('--tree-exempt')) usage('tree-exempt-path-refused: the exemption interface is content-bound; pass --tree-exempt-sha256 <hex> (round-77 routed defect 3)');
for (const h of exemptHashes) if (!/^[0-9a-f]{64}$/.test(h)) usage('--tree-exempt-sha256 must be 64 hex: ' + h);

const abs = (p) => (path.isAbsolute(p) ? p : path.join(lane, p));
const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;

// ---- prior set ----
const priorPaths = [];
try {
  for (const line of fs.readFileSync(abs(priorSet), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    priorPaths.push(path.isAbsolute(t) ? t : path.join(lane, t));
  }
} catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set ' + priorSet + ': ' + e.message }] }, 2); }
if (priorPaths.length === 0) fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set is empty' }] }, 2);
const priors = [];
for (const p of [...priorPaths, ...extraPriors.map(abs)]) {
  let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': ' + e.message }] }, 2); }
  if (!isObj(j)) fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': not an object' }] }, 2);
  priors.push(j);
}

// ---- receipt ----
let r;
try { r = JSON.parse(fs.readFileSync(abs(rp), 'utf8')); } catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }
if (!isObj(r)) fatal({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2);

const checks = {};
const findings = [];
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) findings.push({ id, detail: String(detail) }); };

// ---- frozen plan and law ----
const ARM_EXPR = '(function(){ window.__r = null; document.getElementById("pad").addEventListener("click", function(){ setTimeout(function(){ try { var r = document.getElementById("d").showPicker(); window.__r = {ok: true, ret: String(r)}; } catch (e) { window.__r = {ok: false, name: e.name, message: e.message}; } }, 0); }, {capture: true, once: true}); return 1; })()';
const CROSS_ACCESS = 'JSON.stringify((function(){ var f = document.getElementById("xo"); var out = { contentDocument: f.contentDocument === null ? null : "object" }; try { var d = f.contentWindow.document; out.windowDocument = d ? "object" : null; } catch (e) { out.windowDocument = e.name; } return out; })())';
const PLAN = [
  { name: 'sp80-webkitdirectory', kind: 'showpicker', target: 'd', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp80-accept-png', kind: 'showpicker', target: 'k', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp80-twice-gesture', kind: 'showpicker-twice-gesture', target: 's', intercept: { enabled: true }, priorClick: null, gesture: true },
  { name: 'sp80-deferred-timer', kind: 'showpicker-deferred', target: 'dis', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false, armExpr: ARM_EXPR },
  { name: 'sp80-cross-origin', kind: 'showpicker-cross-origin', target: 's', childButton: 'go', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp80-cross-origin-disabled', kind: 'showpicker-cross-origin-disabled', target: 'dis', childButton: 'go2', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp80-trigger-then-answer', kind: 'showpicker-answer', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false, files: ['tabi-r80-a.txt'] },
];
const LEG_ORDER = PLAN.map((p) => p.name);
const CROSS = new Set(['sp80-cross-origin', 'sp80-cross-origin-disabled']);
const ANSWER_NAME = 'sp80-trigger-then-answer';
const ANSWER = { name: 'tabi-r80-a.txt', size: 22, type: 'text/plain', hex: '746162692d7238302d616e737765722d616c7068610a', sha256: '253919d7b691c3e82b3a797550d8c12cf97211af74ef8e044d52a47f30341aa4', value: 'C:\\fakepath\\tabi-r80-a.txt' };
// Frozen observation of each leg's page-side shape (pre-freeze run probe2; the LAW checks below
// state the rules the shapes obey). `opened` carries the mode only: the backendNodeId is
// browser-assigned and is reported in `nodeReport`, never required (QUALITY 150).
const EMPTY_STATE = { s: [], m: [], d: [], k: [], dis: [], sValue: '' };
const PAD_FIVE = {
  seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'],
  trusted: [true, true, true, true, true], act: [true, true, true, true, true],
  xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0]], files: [],
};
const LEG_SHAPE = {
  'sp80-webkitdirectory': { ...PAD_FIVE, opened: ['selectSingle'], state: EMPTY_STATE },
  'sp80-accept-png': { ...PAD_FIVE, opened: ['selectSingle'], state: EMPTY_STATE },
  'sp80-twice-gesture': { seq: [], trusted: [], act: [], xy: [], files: [], opened: ['selectSingle', 'selectSingle'], state: EMPTY_STATE },
  'sp80-deferred-timer': { ...PAD_FIVE, opened: ['selectSingle'], state: EMPTY_STATE },
  'sp80-cross-origin': { seq: [], trusted: [], act: [], xy: [], files: [], opened: ['selectSingle'], state: EMPTY_STATE },
  'sp80-cross-origin-disabled': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp80-trigger-then-answer': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@s', 'change@s', 'read@s'],
    trusted: [true, true, true, true, true, true, true, true], act: [true, true, true, true, true, false, false, null],
    xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 's', [[ANSWER.name, ANSWER.size, ANSWER.type]]], ['change', 's', [[ANSWER.name, ANSWER.size, ANSWER.type]]], ['read', 's', [[ANSWER.name, ANSWER.size, ANSWER.type]]]],
    opened: ['selectSingle'],
    state: { s: [[ANSWER.name, ANSWER.size, ANSWER.type]], m: [], d: [], k: [], dis: [], sValue: ANSWER.value },
  },
};
const GESTURE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.";
const IMMUTABLE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls.";
// leg -> expected showPicker outcome: {ok, name, message} (null = no parent showPicker call)
const SP_LAW = {
  'sp80-webkitdirectory': { ok: true, ret: 'undefined' },
  'sp80-accept-png': { ok: true, ret: 'undefined' },
  'sp80-twice-gesture': { ok: true, ret: 'undefined' },
  'sp80-deferred-timer': { ok: false, name: 'InvalidStateError', message: IMMUTABLE_ERR },
  'sp80-cross-origin': null,
  'sp80-cross-origin-disabled': null,
  'sp80-trigger-then-answer': { ok: true, ret: 'undefined' },
};
const SP2_LAW = { 'sp80-twice-gesture': { ok: true, ret: 'undefined' } };
const ACT_LAW = {
  'sp80-webkitdirectory': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp80-accept-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp80-twice-gesture': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp80-deferred-timer': [{ isActive: false, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp80-cross-origin': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp80-cross-origin-disabled': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp80-trigger-then-answer': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
};
const CHILD_ACT_LAW = {
  'sp80-cross-origin': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp80-cross-origin-disabled': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
};
const CHILD_RESULT_LAW = {
  'sp80-cross-origin': { ok: true, ret: 'undefined' },
  'sp80-cross-origin-disabled': { ok: false, name: 'InvalidStateError', message: IMMUTABLE_ERR },
};
const CHILD_EVENT_SHAPE = {
  'sp80-cross-origin': { seq: ['pointerdown@go', 'mousedown@go', 'pointerup@go', 'mouseup@go', 'click@go'] },
  'sp80-cross-origin-disabled': { seq: ['pointerdown@go2', 'mousedown@go2', 'pointerup@go2', 'mouseup@go2', 'click@go2'] },
};
const FIXTURE_INPUTS = [
  { id: 's', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 100, width: 120, height: 40 } },
  { id: 'm', tag: 'input', type: 'file', multiple: true, webkitdirectory: false, accept: null, rect: { left: 300, top: 100, width: 120, height: 40 } },
  { id: 'd', tag: 'input', type: 'file', multiple: false, webkitdirectory: true, accept: null, rect: { left: 500, top: 100, width: 120, height: 40 } },
  { id: 'k', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: '.png', rect: { left: 700, top: 100, width: 120, height: 40 } },
  { id: 'f', tag: 'button', type: 'submit', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 300, width: 120, height: 40 } },
  { id: 'dis', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 500, width: 120, height: 40 } },
];
const wrapperFor = (target) => '(function(){ try { var r = document.getElementById(' + JSON.stringify(target) + ').showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()';
const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const READY_EXPR = (n) => 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(n);
const CHILD_READY_EXPR = 'document.readyState === "complete" && !!document.getElementById("go")';

const RECEIPT_KEYS = ['schema', 'lane', 'nonce', 'driverSha256', 'startedAt', 'finishedAt', 'host', 'fixture', 'ports', 'frameTree', 'fixtureInputs', 'legs', 'failures'].sort();
const LEG_KEYS = ['activationAfter', 'activationBefore', 'answer', 'argv', 'armError', 'armResult', 'armSendId', 'cdpEventLog', 'cdpProduct', 'cdpProtocolVersion', 'cdpSendLog', 'childActivationAfter', 'childActivationBefore', 'childClosedAt', 'childContextId', 'childEvents', 'childLate', 'childResult', 'childResult2', 'childServerLog', 'childState', 'chooserWaitMs', 'closedAt', 'contexts', 'deferredResult', 'devtoolsListening', 'dismissError', 'dismissResult', 'dismissSendId', 'errors', 'fixtureInputs', 'frameTree', 'gesture', 'intercept', 'interceptError', 'interceptResult', 'interceptSendId', 'kind', 'lateAfterClose', 'launchToken', 'marks', 'name', 'pageEvents', 'parentCrossAccess', 'priorClick', 'priorClickElement', 'priorClickError', 'priorPressId', 'priorReleaseId', 'serverLog', 'showPicker', 'showPicker2', 'stateAfter', 'stateAfterDismiss', 'stderrHead', 'target', 'teardown', 'trigger2Error', 'trigger2Result', 'trigger2SendId', 'triggerError', 'triggerResult', 'triggerSendId', 'upload'].sort();
const EVENT_KEYS = ['type', 'ts', 'isTrusted', 'act', 'target', 'x', 'y', 'buttons', 'files', 'ret', 'seq', 'leg', 'at'].sort();
const ALLOWED_METHODS = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate', 'Page.setInterceptFileChooserDialog', 'Input.dispatchMouseEvent', 'Runtime.evaluate', 'DOM.setFileInputFiles']);
const errOk = (e) => e === null || (isObj(e) && same(Object.keys(e).sort(), ['code', 'message']) && (e.code === null || Number.isInteger(e.code)) && typeof e.message === 'string');

// ---- identity and run binding ----
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('lane', r.lane === path.basename(lane), 'lane ' + r.lane + ' expected ' + path.basename(lane));
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r80-[a-z0-9-]{4,48}$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS), 'top-level receipt fields ' + JSON.stringify(Object.keys(r).sort()) + ' (want exactly ' + JSON.stringify(RECEIPT_KEYS) + ')');
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
check('fixture-hash', isObj(r.fixture) && r.fixture.sha256 === expectFixture && same(r.fixture.viewport, VIEWPORT) && same(Object.keys(r.fixture).sort(), ['child', 'origin', 'patch', 'sha256', 'viewport']) && isObj(r.fixture.child) && same(Object.keys(r.fixture.child).sort(), ['origin', 'sha256']) && /^[0-9a-f]{64}$/.test(r.fixture.child.sha256),
  'fixture ' + JSON.stringify(isObj(r.fixture) ? { sha256: r.fixture.sha256, viewport: r.fixture.viewport } : r.fixture) + ' expected ' + expectFixture);
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion,
  'host ' + JSON.stringify({ chromium: host.chromium, cdpProduct: host.cdpProduct, cdpProtocolVersion: host.cdpProtocolVersion }));
check('host-node', typeof host.node === 'string' && Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor, 'node ' + host.node);
const ports = isObj(r.ports) ? r.ports : {};
check('ports-declared', Number.isInteger(ports.http) && Number.isInteger(ports.cdp) && Number.isInteger(ports.child) && [ports.http, ports.cdp, ports.child].every((p) => p >= 1024) && new Set([ports.http, ports.cdp, ports.child]).size === 3 && isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http && isObj(r.fixture.child) && r.fixture.child.origin === 'http://127.0.0.1:' + ports.child,
  'ports ' + JSON.stringify(ports) + ' fixture origins ' + JSON.stringify(isObj(r.fixture) ? [r.fixture.origin, isObj(r.fixture.child) ? r.fixture.child.origin : null] : null));
const ftree = isObj(r.frameTree) ? r.frameTree : {};
check('frame-tree', same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl']) && typeof ftree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(ftree.mainFrameId) && ftree.mainFrameParentId === null && ftree.mainFrameUrl === 'about:blank',
  'frameTree ' + JSON.stringify(ftree));

// ---- legs ----
const legs = arr(r.legs);
check('plan-frozen', same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null }))),
  'leg plan differs from the frozen plan');
check('leg-order', same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
check('leg-records', legs.length === PLAN.length && legs.every((l, i) => isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name && l.kind === PLAN[i].kind && num(l.chooserWaitMs) && l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000 && errOk(l.interceptError) && errOk(l.priorClickError) && errOk(l.triggerError) && errOk(l.trigger2Error) && errOk(l.dismissError) && errOk(l.armError) && arr(l.errors).length === 0),
  'leg records: ' + legs.map((l) => (isObj(l) ? (same(Object.keys(l).sort(), LEG_KEYS) ? '' : l.name + ':keys ') + (arr(l.errors).length ? l.name + ':errors ' : '') : 'not-an-object')).filter(Boolean).join(','));
check('leg-marks', legs.every((l) => isObj(l) && arr(l.marks).length >= 3 && arr(l.marks)[0].name === 'start' && arr(l.marks)[1].name === 'pre' && arr(l.marks).slice(-1)[0].name === 'settle' && num(l.closedAt) && l.lateAfterClose === 0 && arr(l.marks).every((m, i, a) => isObj(m) && typeof m.name === 'string' && num(m.at) && onGrid(m.at) && (i === 0 || m.at >= a[i - 1].at))),
  'leg marks / closedAt / lateAfterClose: ' + JSON.stringify(legs.map((l) => isObj(l) ? [l.name, arr(l.marks).map((m) => m && m.name), l.lateAfterClose] : null)));

// ---- contexts (the cross-origin iframe's own execution context) ----
const ctxBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { ctxBad.push('not-an-object'); continue; }
  const cs = arr(leg.contexts);
  const child = cs.filter((c) => isObj(c) && c.origin === 'http://127.0.0.1:' + ports.child && c.isDefault === true && typeof c.frameId === 'string' && c.frameId !== leg.frameTree.mainFrameId);
  if (child.length !== 1) { ctxBad.push(leg.name + ':child-contexts ' + child.length); continue; }
  if (CROSS.has(leg.name) && leg.childContextId !== child[0].id) ctxBad.push(leg.name + ':childContextId ' + leg.childContextId + ' != ' + child[0].id);
  if (!CROSS.has(leg.name) && leg.childContextId !== null) ctxBad.push(leg.name + ':childContextId-unexpected');
}
check('context-binding', ctxBad.length === 0, 'cross-origin execution contexts: ' + ctxBad.join(','));

// ---- send log: allowlist, plan calls, ordering ----
const childExprs = new Set([CHILD_READY_EXPR, 'window.__act()', 'window.__setLeg("child-click")', 'window.__r', 'window.__r2', 'window.__state()', 'window.__closeRecord()', 'window.__late']);
const evalAllowed = (leg, params) => {
  const p = PLAN.find((x) => x.name === leg.name) || {};
  const parent = [READY_EXPR(r.nonce), ACT_EXPR, 'window.__inputs()', 'window.__state()', 'window.__closeRecord()', 'window.__late',
    'window.__setLeg("pre")', 'window.__setLeg("prior-click")', 'window.__setLeg("show-picker")', 'window.__setLeg("show-picker-2")', 'window.__setLeg("settle")',
    'document.elementFromPoint(' + (p.priorClick ? p.priorClick.at[0] : 0) + ',' + (p.priorClick ? p.priorClick.at[1] : 0) + ').id'];
  if (p.kind === 'showpicker' || p.kind === 'showpicker-twice-gesture' || p.kind === 'showpicker-deferred' || p.kind === 'showpicker-answer') parent.push(wrapperFor(p.target));
  if (p.armExpr) parent.push(p.armExpr);
  if (p.kind === 'showpicker-deferred') parent.push('JSON.stringify(window.__r)');
  if (CROSS.has(p.name)) parent.push(CROSS_ACCESS, 'JSON.stringify(document.getElementById("xo").getBoundingClientRect())');
  if (params.contextId !== undefined) return CROSS.has(leg.name) && params.contextId === leg.childContextId && childExprs.has(params.expression);
  return parent.includes(params.expression);
};
const sendBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { sendBad.push('not-an-object'); continue; }
  const log = arr(leg.cdpSendLog);
  if (log.length < 10 || !log.every((c, i) => isObj(c) && c.id === i + 1 && ALLOWED_METHODS.has(c.method) && isObj(c.params))) sendBad.push(leg.name + ':shape');
  else if (!log.every((c) => c.method !== 'Runtime.evaluate' || evalAllowed(leg, c.params))) sendBad.push(leg.name + ':expression');
  else if (!same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate'])) sendBad.push(leg.name + ':prologue');
  else if (log.filter((c) => c.method === 'Page.navigate').length !== 1 || log.filter((c) => c.method === 'Page.getFrameTree').length !== 1 || log.filter((c) => c.method === 'Browser.getVersion').length !== 1) sendBad.push(leg.name + ':once');
  else if (!same(log.find((c) => c.method === 'Page.navigate').params, { url: 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce) })) sendBad.push(leg.name + ':navigate');
}
check('send-log-allowlist', legs.length > 0 && sendBad.length === 0, 'send logs outside the allowlist: ' + sendBad.join(','));

const planBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { planBad.push('not-an-object'); continue; }
  const p = PLAN.find((x) => x.name === leg.name);
  if (!p) { planBad.push('unknown-leg'); continue; }
  const log = arr(leg.cdpSendLog);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  const want = [];
  if (p.intercept) want.push({ method: 'Page.setInterceptFileChooserDialog', params: p.intercept });
  if (p.armExpr) want.push({ method: 'Runtime.evaluate', params: { expression: p.armExpr, returnByValue: true } });
  const clickAt = p.priorClick ? p.priorClick.at : (CROSS.has(p.name) ? (p.childButton === 'go' ? [260, 440] : [260, 500]) : null);
  if (clickAt) {
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 1, clickCount: 1 } });
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 0, clickCount: 1 } });
  }
  if (!CROSS.has(p.name)) {
    const tp = { expression: wrapperFor(p.target), returnByValue: true };
    if (p.gesture) tp.userGesture = true;
    want.push({ method: 'Runtime.evaluate', params: tp });
    if (p.kind === 'showpicker-twice-gesture') want.push({ method: 'Runtime.evaluate', params: { expression: wrapperFor(p.target), returnByValue: true, userGesture: true } });
  }
  if (p.kind === 'showpicker-answer' && opens.length === 1) {
    want.push({ method: 'DOM.setFileInputFiles', params: { files: arr(leg.answer && leg.answer.setParams && leg.answer.setParams.files), backendNodeId: opens[0].params.backendNodeId } });
  }
  if (p.intercept && opens.length > 0) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });
  const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || (c.method === 'Runtime.evaluate' && (c.params.expression === wrapperFor(p.target) || c.params.expression === p.armExpr)));
  if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(leg.name + ':sequence ' + JSON.stringify(got.map((c) => c.method)) + ' want ' + JSON.stringify(want.map((c) => c.method)));
  // send-id coherence
  if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id) planBad.push(leg.name + ':intercept-id');
  if (p.armExpr && leg.armSendId !== log.find((c) => c.method === 'Runtime.evaluate' && c.params.expression === p.armExpr).id) planBad.push(leg.name + ':arm-id');
  if (p.priorClick || CROSS.has(p.name)) { if (leg.priorPressId === null || leg.priorReleaseId === null || leg.priorReleaseId <= leg.priorPressId) planBad.push(leg.name + ':prior-ids'); }
  else if (leg.priorPressId !== null || leg.priorReleaseId !== null) planBad.push(leg.name + ':prior-ids-without-click');
  if (!CROSS.has(p.name)) {
    const trig = log.find((c) => c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target));
    if (!trig || leg.triggerSendId !== trig.id) planBad.push(leg.name + ':trigger-id');
    if (p.kind === 'showpicker-twice-gesture') {
      const t2 = log.filter((c) => c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target))[1];
      if (!t2 || leg.trigger2SendId !== t2.id || leg.trigger2SendId <= leg.triggerSendId) planBad.push(leg.name + ':trigger2-id');
    } else if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');
  } else if (leg.triggerSendId !== null || leg.trigger2SendId !== null) planBad.push(leg.name + ':parent-trigger-unexpected');
  const dis = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog')[1];
  if (dis) { if (leg.dismissSendId !== dis.id) planBad.push(leg.name + ':dismiss-id'); }
  else if (leg.dismissSendId !== null) planBad.push(leg.name + ':dismiss-unexpected');
  if (p.kind === 'showpicker-answer' && opens.length === 1) {
    const set = log.find((c) => c.method === 'DOM.setFileInputFiles');
    if (!set || !isObj(leg.answer) || leg.answer.setSendId !== set.id) planBad.push(leg.name + ':answer-id');
  }
}
check('plan-calls', planBad.length === 0, 'plan calls differ from the frozen plan: ' + planBad.join(','));

// ---- CDP event log ----
const evBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { evBad.push('not-an-object'); continue; }
  const el = arr(leg.cdpEventLog);
  const nav = el.filter((e) => e.method === 'Page.frameNavigated');
  if (nav.length !== 1 || el.some((e) => !['Page.fileChooserOpened', 'Page.frameNavigated'].includes(e.method)) || !el.every((e) => isObj(e) && isObj(e.params) && Number.isInteger(e.afterSendId))) evBad.push(leg.name + ':shape');
  const lft = isObj(leg.frameTree) ? leg.frameTree : {};
  if (nav.length === 1 && !(nav[0].params.frameId === lft.mainFrameId && nav[0].params.url === 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce))) evBad.push(leg.name + ':nav');
  const opens = el.filter((e) => e.method === 'Page.fileChooserOpened');
  if (opens.length > 2) evBad.push(leg.name + ':multi-open');
  for (const o of opens) {
    if (!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode']) || !['selectSingle', 'selectMultiple'].includes(o.params.mode) || !Number.isInteger(o.params.backendNodeId) || o.params.backendNodeId <= 0) evBad.push(leg.name + ':open-shape');
    const wantFrame = CROSS.has(leg.name) ? arr(leg.contexts).find((c) => isObj(c) && c.origin === 'http://127.0.0.1:' + ports.child && c.isDefault === true) : { frameId: lft.mainFrameId };
    if (!wantFrame || o.params.frameId !== wantFrame.frameId) evBad.push(leg.name + ':open-frame');
    if (CROSS.has(leg.name)) {
      if (!(Number.isInteger(leg.priorReleaseId) && o.afterSendId >= leg.priorReleaseId && o.afterSendId <= leg.priorReleaseId + 3)) evBad.push(leg.name + ':open-binding');
    } else if (leg.name === 'sp80-twice-gesture') {
      const i = opens.indexOf(o);
      const bound = i === 0 ? o.afterSendId === leg.triggerSendId : (o.afterSendId === leg.trigger2SendId && Number.isInteger(leg.trigger2SendId) && leg.trigger2SendId > leg.triggerSendId);
      if (!bound) evBad.push(leg.name + ':open-binding');
    } else if (leg.name === 'sp80-deferred-timer') {
      // the timer scheduled by the click handler opens the picker during the click, before the
      // mandatory direct trigger is sent
      if (!(Number.isInteger(leg.priorReleaseId) && o.afterSendId >= leg.priorReleaseId && o.afterSendId <= leg.triggerSendId)) evBad.push(leg.name + ':open-binding');
    } else if (leg.triggerSendId === null || o.afterSendId !== leg.triggerSendId) evBad.push(leg.name + ':open-binding');
  }
}
check('cdp-event-log-closed', legs.length > 0 && evBad.length === 0, 'CDP event logs: ' + evBad.join(','));
check('frame-binding', legs.every((l) => isObj(l) && isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.frameTree.mainFrameId) && l.frameTree.mainFrameParentId === null && l.frameTree.mainFrameUrl === 'about:blank'),
  'legs without a fresh-browser main frame tree');

// ---- page events ----
const events = legs.flatMap((l) => (isObj(l) ? arr(l.pageEvents) : []));
const typed = (e) => isObj(e) && same(Object.keys(e).sort(), EVENT_KEYS) && typeof e.type === 'string' && num(e.ts) && typeof e.isTrusted === 'boolean' && (e.act === null || typeof e.act === 'boolean') && (e.target === null || typeof e.target === 'string') && (e.x === null || num(e.x)) && (e.y === null || num(e.y)) && (e.buttons === null || num(e.buttons)) && (e.files === null || Array.isArray(e.files)) && (e.ret === null || typeof e.ret === 'string') && Number.isInteger(e.seq) && typeof e.leg === 'string' && num(e.at);
check('event-types', events.length > 0 && events.every(typed), 'page events with a non-strict field set: ' + events.filter((e) => !typed(e)).length);
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'page event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
check('event-leg-window', legs.every((l) => {
  if (!isObj(l)) return false;
  const marks = arr(l.marks);
  const at = (n) => { const m = marks.find((x) => x.name === n); return m ? m.at : null; };
  const pre = at('pre'), settle = at('settle');
  return arr(l.pageEvents).every((e, i, a) => isObj(e) && e.leg !== 'start' && num(e.at) && e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt) && (i === 0 || (num(a[i - 1].at) && e.at >= a[i - 1].at)));
}), 'page events outside their leg window or out of order');
const seqs = legs.map((l) => (isObj(l) ? arr(l.pageEvents).map((e) => e.seq) : []));
check('seq-monotonic', seqs.every((s) => s.every((v, i) => v === i + 1)), 'page event seq is not 1..N per leg');

// ---- per-leg frozen shape ----
const legSummary = (leg) => {
  const evs = arr(leg.pageEvents);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  return {
    seq: evs.map((e) => e.type + '@' + e.target),
    trusted: evs.map((e) => e.isTrusted),
    act: evs.map((e) => e.act),
    xy: evs.map((e) => [e.x, e.y, e.buttons]),
    files: evs.filter((e) => e.files !== null).map((e) => [e.type, e.target, e.files]),
    opened: opens.map((e) => e.params.mode),
    state: leg.stateAfter,
  };
};
const nodeReport = {};
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = LEG_SHAPE[leg.name];
  if (!want) { check('leg-' + leg.name, false, 'unknown leg'); continue; }
  const got = legSummary(leg);
  const bad = [];
  for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state']) if (!same(got[k], want[k])) bad.push(k + ' ' + JSON.stringify(got[k]));
  check('leg-' + leg.name, bad.length === 0, leg.name + ': ' + bad.join('; '));
  nodeReport[leg.name] = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').map((e) => e.params.backendNodeId);
}

// ---- the law checks ----
const legOf = (n) => legs.find((l) => isObj(l) && l.name === n) || {};
const spBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = SP_LAW[leg.name];
  const got = leg.showPicker;
  if (want === undefined) { spBad.push(leg.name + ':unknown-leg'); continue; }
  if (want === null) { if (got !== null) spBad.push(leg.name + ':unexpected'); continue; }
  if (!isObj(got) || got.ok !== want.ok || (want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message))) spBad.push(leg.name + ': ' + JSON.stringify(got));
}
check('gesture-law', spBad.length === 0, 'parent showPicker outcomes not the frozen law: ' + spBad.join(','));
const actBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = ACT_LAW[leg.name];
  if (!want) { actBad.push(leg.name + ':no-law'); continue; }
  if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1])) actBad.push(leg.name + ': ' + JSON.stringify([leg.activationBefore, leg.activationAfter]));
}
check('activation-law', actBad.length === 0, 'legs whose parent transient-activation transition is not the frozen one: ' + actBad.join(','));
const twice = legOf('sp80-twice-gesture');
check('twice-gesture-law', isObj(twice.showPicker) && twice.showPicker.ok === true && twice.showPicker.ret === 'undefined' && isObj(twice.showPicker2) && twice.showPicker2.ok === true && twice.showPicker2.ret === 'undefined' && arr(twice.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 2,
  'two userGesture calls must BOTH succeed and open two pickers (no already-open guard): first ' + JSON.stringify(twice.showPicker) + ' second ' + JSON.stringify(twice.showPicker2) + ' events ' + arr(twice.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length);
const def = legOf('sp80-deferred-timer');
check('deferred-law', isObj(def.deferredResult) && def.deferredResult.ok === true && def.deferredResult.ret === 'undefined' && arr(def.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 1 && isObj(def.showPicker) && def.showPicker.ok === false && def.showPicker.name === 'InvalidStateError' && def.showPicker.message === IMMUTABLE_ERR,
  'a setTimeout(0) call scheduled from a trusted click handler must succeed while the activation is live (deferred ' + JSON.stringify(def.deferredResult) + ', choosers ' + arr(def.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length + '), and the direct trigger on the disabled input must refuse: ' + JSON.stringify(def.showPicker));
const modeBad = [];
for (const leg of legs) {
  if (!isObj(leg) || CROSS.has(leg.name)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  if (!p || opens.length === 0) continue;
  const d = arr(r.fixtureInputs).find((x) => isObj(x) && x.id === p.target);
  const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSingle';
  if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push(leg.name + ': ' + JSON.stringify(opens.map((e) => e.params.mode)) + ' want ' + wantMode);
}
check('mode-law', modeBad.length === 0, 'chooser events whose mode is not the page-measured input\'s (multiple attribute -> selectMultiple, else selectSingle; a webkitdirectory input and an accept-constrained input are both selectSingle): ' + modeBad.join(','));
const co = legOf('sp80-cross-origin');
const cod = legOf('sp80-cross-origin-disabled');
check('cross-origin-law', isObj(co.childResult) && same(co.childResult, CHILD_RESULT_LAW['sp80-cross-origin']) && arr(co.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 1 && same(co.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' }) && same(co.childActivationBefore, CHILD_ACT_LAW['sp80-cross-origin'][0]) && same(co.childActivationAfter, CHILD_ACT_LAW['sp80-cross-origin'][1]) && arr(co.childEvents).length === 5 && arr(co.childEvents).every((e) => e.isTrusted === true && e.act === true) && same(arr(co.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE['sp80-cross-origin'].seq) && co.childLate === 0,
  'a cross-origin child\'s own script must open its own picker (no SecurityError) while the parent cannot reach the child document: child ' + JSON.stringify(co.childResult) + ' cross ' + JSON.stringify(co.parentCrossAccess) + ' events ' + JSON.stringify(arr(co.childEvents).map((e) => e.type + '@' + e.target)));
check('cross-origin-disabled-law', isObj(cod.childResult) && same(cod.childResult, CHILD_RESULT_LAW['sp80-cross-origin-disabled']) && arr(cod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(cod.childActivationBefore, CHILD_ACT_LAW['sp80-cross-origin-disabled'][0]) && same(cod.childActivationAfter, CHILD_ACT_LAW['sp80-cross-origin-disabled'][1]) && arr(cod.childEvents).length === 5 && arr(cod.childEvents).every((e) => e.isTrusted === true && e.act === true) && same(arr(cod.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE['sp80-cross-origin-disabled'].seq) && cod.childLate === 0,
  'a disabled input in a cross-origin frame must refuse with InvalidStateError (mutability before the origin check), open nothing and not consume the activation: ' + JSON.stringify(cod.childResult) + ' act ' + JSON.stringify([cod.childActivationBefore, cod.childActivationAfter]));
const ans = legOf(ANSWER_NAME);
check('answer-law', isObj(ans.answer) && same(Object.keys(ans.answer).sort(), ['files', 'setError', 'setParams', 'setResult', 'setSendId']) && same(ans.answer.files, [ANSWER.name]) && isObj(ans.answer.setParams) && same(Object.keys(ans.answer.setParams).sort(), ['backendNodeId', 'files']) && arr(ans.answer.setParams.files).length === 1 && path.basename(ans.answer.setParams.files[0]) === ANSWER.name && ans.answer.setParams.backendNodeId === nodeReport[ANSWER_NAME][0] && same(ans.answer.setResult, {}) && ans.answer.setError === null && isObj(ans.upload) && same(ans.upload, { name: ANSWER.name, size: ANSWER.size, sha256: ANSWER.sha256 }) && arr(ans.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(ans.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + ANSWER.hex && isObj(ans.stateAfter) && same(ans.stateAfter.s, [[ANSWER.name, ANSWER.size, ANSWER.type]]) && ans.stateAfter.sValue === ANSWER.value,
  'the programmatic trigger answered with DOM.setFileInputFiles must deliver the exact bytes and fire trusted input+change: answer ' + JSON.stringify(ans.answer) + ' read ' + JSON.stringify(arr(ans.pageEvents).filter((e) => e.type === 'read').map((e) => e.ret)));
const stateBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const st = leg.stateAfter;
  const empty = isObj(st) && same(Object.keys(st).sort(), ['d', 'dis', 'k', 'm', 's', 'sValue']) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]) && st[k].length === 0) && st.sValue === '';
  if (leg.name === ANSWER_NAME) {
    if (!isObj(leg.stateAfterDismiss) || !same(leg.stateAfterDismiss.s, [[ANSWER.name, ANSWER.size, ANSWER.type]])) stateBad.push(leg.name + ':dismiss-state');
    continue;
  }
  if (!empty) stateBad.push(leg.name + ':state');
  if (leg.stateAfterDismiss !== null && !(isObj(leg.stateAfterDismiss) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[k].length === 0))) stateBad.push(leg.name + ':dismiss-state');
  if (arr(leg.pageEvents).some((e) => e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel'))) stateBad.push(leg.name + ':file-event');
}
check('no-selection-law', stateBad.length === 0, 'showPicker must never select files or fire input/change (the trigger opens a picker; the answer is a separate act, measured only in ' + ANSWER_NAME + '): ' + stateBad.join(','));
const intBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  if (!p) { intBad.push(leg.name + ':unknown-leg'); continue; }
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length;
  const okCall = CROSS.has(leg.name) ? isObj(leg.childResult) && leg.childResult.ok === true
    : leg.name === 'sp80-deferred-timer' ? isObj(leg.deferredResult) && leg.deferredResult.ok === true
    : isObj(leg.showPicker) && leg.showPicker.ok === true;
  const want = okCall ? (leg.name === 'sp80-twice-gesture' ? 2 : 1) : 0;
  if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);
}
check('intercept-law', intBad.length === 0, 'interception must gate the CDP event, never the trigger\'s own success: ' + intBad.join(','));
const cancels = legs.flatMap((l) => (isObj(l) ? arr(l.pageEvents).filter((e) => e.type === 'cancel').map((e) => [l.name, e.target]) : []));
check('cancel-law', same(cancels, []), 'no leg in this generation opens a picker that is cancelled, so no page cancel event may fire: ' + JSON.stringify(cancels));
const disBad = legs.filter((l) => isObj(l) && l.dismissSendId !== null && !(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))).map((l) => l.name);
check('dismiss-law', disBad.length === 0, 'a post-hoc {cancel:true} must be accepted and must not fire a page cancel (the flag arms the NEXT chooser): ' + disBad.join(','));
const PTR = new Set(['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']);
check('trust-law', events.length > 0 && events.every((e) => e.isTrusted === true) && legs.every((l) => isObj(l) && arr(l.pageEvents).every((e) => !PTR.has(e.type) || (e.leg !== 'show-picker' && e.leg !== 'show-picker-2'))),
  'every page event must be trusted, and a showPicker call must fire no pointer event at all (it opens a picker, it does not click)');

// ---- host argv / devtools ----
const argvBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { argvBad.push('not-an-object'); continue; }
  const a = arr(leg.argv);
  const profile = a.find((x) => typeof x === 'string' && x.startsWith('--user-data-dir='));
  const tok = leg.launchToken;
  const dl = leg.devtoolsListening;
  const want = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + ports.cdp, '--remote-debugging-address=127.0.0.1', profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  if (!same(a, want) || typeof tok !== 'string' || !/^[0-9a-f]{12}$/.test(tok) || typeof profile !== 'string' || path.basename(profile) !== 'profile-' + tok) argvBad.push(leg.name + ':argv');
  if (!isObj(dl) || typeof dl.url !== 'string' || !dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/') || !/^[0-9a-f-]{36}$/.test(dl.browserId) || typeof leg.stderrHead !== 'string' || !leg.stderrHead.includes(dl.url)) argvBad.push(leg.name + ':devtools');
  if (!isObj(leg.teardown)) argvBad.push(leg.name + ':teardown');
}
check('host-argv', argvBad.length === 0, 'per-leg argv / launch token / profile / devtools line: ' + argvBad.join(','));
check('devtools-port-binding', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && l.devtoolsListening.port === ports.cdp), 'devtools port not the argv CDP port');
check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && arr(l.teardown.survivors).length === 0 && same(Object.keys(l.teardown.portProbes).sort(), ['child', 'devtools', 'fixture']) && Object.values(l.teardown.portProbes).every((v) => v === 'closed') && Object.values(l.teardown.postKillCurl).every((v) => v === 7)), 'a leg\'s teardown proof failed');
check('fixture-descriptors', same(arr(r.fixtureInputs), FIXTURE_INPUTS), 'page-side element descriptors differ: ' + JSON.stringify(r.fixtureInputs));
const srvBad = legs.filter((l) => isObj(l) && !(arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1 && arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.run === r.nonce && s.status === 200) && arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404))).map((l) => l.name);
check('server-log-binding', srvBad.length === 0, 'fixture server log not bound to the run nonce: ' + srvBad.join(','));
const childSrvBad = legs.filter((l) => isObj(l) && !(arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').length >= 1 && arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.run === r.nonce && s.status === 200) && arr(l.childServerLog).filter((s) => isObj(s) && s.path !== '/child.html').every((s) => s.status === 404))).map((l) => l.name);
check('child-server-log-binding', childSrvBad.length === 0, 'child-origin server log not bound to the run nonce: ' + childSrvBad.join(','));

// ---- run window / replay ----
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 15000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (7 legs, each >= 2 s observe + 0.5 s settle + a browser launch)');
const pairs = (x) => arr(x.legs).flatMap((l) => (isObj(l) && l.name ? arr(l.pageEvents).filter((e) => isObj(e) && num(e.ts) && num(e.at)).map((e) => ({ leg: l.name, ts: e.ts, at: e.at })) : []));
const pairMatch = (a, b) => { const y = b.map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of a) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = x.map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const own = pairs(r);
const ownGaps = gapsOf(own);
const sims = priors.map((p) => {
  const np = pairs(p).length, gp = gapsOf(pairs(p)).length;
  const absMatched = pairMatch(own, pairs(p)), gapMatched = matchCount(ownGaps, gapsOf(pairs(p)));
  const absNeed = np > 0 ? Math.ceil(FRAC * np - 1e-9) : 0, gapNeed = gp > 0 ? Math.ceil(GAP_FRAC * gp - 1e-9) : 0;
  // The gap side is REPORTED, never a refusal: this driver's fixed waits (MIN_OBSERVE_MS,
  // SETTLE_MS) reproduce the same gap durations across honest runs (measured: an honest receipt
  // matches a prior's single gap within 0.05 ms), so a gap match is a driver artifact, not a
  // fingerprint. The replay rule is pair-based; the limit sentence states the escape it leaves.
  return { priorEvents: np, priorGaps: gp, absMatched, gapMatched, absNeed, gapNeed, escapeEvents: np > 0 ? np - absNeed + 1 : 0, refused: np > 0 && absMatched >= absNeed };
});
const replayIdx = sims.findIndex((s) => s.refused);
check('replay-event-timeline', replayIdx === -1, 'pair near-match within ' + TOL + ' ms of prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (refuse when absMatched >= ceil(' + FRAC + ' * prior events); own events ' + own.length + ')');
check('replay-launch-token', legs.every((l) => isObj(l) && typeof l.launchToken === 'string' && /^[0-9a-f]{12}$/.test(l.launchToken) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))) && new Set(legs.map((l) => l.launchToken)).size === legs.length,
  'a launch token repeats a prior receipt\'s or another leg\'s');
check('replay-devtools-url', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== l.devtoolsListening.browserId))) && new Set(legs.map((l) => l.devtoolsListening && l.devtoolsListening.browserId)).size === legs.length,
  'a devtools browser id repeats a prior receipt\'s or another leg\'s');

// ---- prior-set completeness over the walked trees (content-bound exemption) ----
const priorReal = new Set([...priorPaths, ...extraPriors.map(abs)].map(real));
const selfReal = real(abs(rp));
const exemptReal = new Set();
const walked = [];
const seen = new Set();
const walk = (d) => {
  const rd = real(d); if (seen.has(rd)) return; seen.add(rd);
  let st; try { st = fs.statSync(rd); } catch { return; }
  if (!st.isDirectory()) return;
  let entries; try { entries = fs.readdirSync(rd, { withFileTypes: true }); } catch (e) { walked.push({ dir: rd, error: e.message }); return; }
  for (const ent of entries) {
    const p = path.join(rd, ent.name);
    let s; try { s = fs.statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p);
    else if (s.isFile()) walked.push({ path: real(p) });
  }
};
for (const t of TREES) walk(path.join(lane, t));
const outside = [], unparsable = [];
const fileHashes = new Map();
for (const w of walked) {
  if (w.error) { outside.push('unreadable-dir:' + w.dir); continue; }
  let bytes; try { bytes = fs.readFileSync(w.path); } catch { continue; }
  const h = sha256(bytes);
  fileHashes.set(w.path, h);
  if (exemptHashes.includes(h)) exemptReal.add(w.path);
  let j = null; try { j = JSON.parse(bytes.toString('utf8')); } catch { j = null; }
  if (j === null) {
    // a prose report that QUOTES the schema is not a receipt: only a .json file, or a file whose
    // first non-space byte is '{', can be an unparsable receipt (round-80 wave finding: seat reports
    // in the walked tree quote the schema)
    const txt = bytes.toString('utf8');
    if ((/\.json$/i.test(w.path) || txt.trimStart().startsWith('{')) && /tabi-chrome-cdp-showpicker-r80/.test(txt)) unparsable.push(w.path);
    continue;
  }
  if (isObj(j) && j.schema === SCHEMA && !priorReal.has(w.path) && w.path !== selfReal && !exemptReal.has(w.path)) outside.push(w.path);
}
const unmatched = exemptHashes.filter((h) => ![...fileHashes.values()].includes(h));
check('prior-set-unmatched-exempt', unmatched.length === 0, 'tree-exempt sha256 matches no walked file: ' + unmatched.join(','));
check('prior-set-complete', outside.length === 0, 'receipts of schema ' + SCHEMA + ' in the round-80 wave/evidence trees, not the receipt under test (path ' + path.relative(lane, abs(rp)) + '), not exempted by sha256 and not among the priors: ' + outside.join(','));
check('prior-set-unparsable', unparsable.length === 0, 'files in the round-80 wave/evidence trees that carry the schema and do not parse (refused, not skipped): ' + unparsable.join(','));

// ---- verdict ----
const ids = Object.keys(checks);
const failed = ids.filter((id) => !checks[id]);
const verdict = failed.length === 0 ? 'clean' : 'findings';
out({
  verdict, checkCount: ids.length, checks, findings,
  priorSet: priorPaths.length, priorSetFile: { path: priorSet, sha256: sha256(fs.readFileSync(abs(priorSet))) },
  treeExemptSha256: exemptHashes, treeExemptResolved: [...exemptReal],
  nodeReport,
  limit: {
    sentence: 'refuse when absMatched >= ceil(' + FRAC + ' * prior events); the escape minimum is priorEvents - absNeed + 1 moved events. The gap side is reported, not a refusal: this driver\'s fixed waits reproduce gap durations across honest runs, so a gap match is a driver artifact. A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule — that is the limit.',
    tolerance: TOL, gapMin: GAP_MIN, ownEvents: own.length, ownGaps: ownGaps.length, perPrior: sims,
  },
}, verdict === 'clean' ? 0 : 1);
