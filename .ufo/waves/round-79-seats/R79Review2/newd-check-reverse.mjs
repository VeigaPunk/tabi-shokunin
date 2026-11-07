#!/usr/bin/env node
// Counter for scripts/chrome-cdp-showpicker-round79.mjs (tabi round 79, C1, predicate
// C1-SHOWPICKER-R79). Binds the programmatic file-picker trigger law of
// `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on Chromium
// 155/Linux `--headless=new`.
//
// Usage:
//   node check-showpicker-r79.mjs --lane <ABS lane> --receipt <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r79-...> --expect-fixture-sha256 <hex>
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

const SCHEMA = 'tabi-chrome-cdp-showpicker-r79';
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', nodeMajor: 24 };
const VIEWPORT = { width: 1280, height: 900 };
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const TREES = ['.ufo/waves/round-79', 'corpus/evidence/round79'];
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
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
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
const PLAN = [
  { name: 'sp-nogesture-intercept-on', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp-nogesture-intercept-off', kind: 'showpicker', target: 's', intercept: null, priorClick: null, gesture: false },
  { name: 'sp-click-then-show', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-cdp-gesture', kind: 'showpicker', target: 's', intercept: { enabled: true }, priorClick: null, gesture: true },
  { name: 'sp-intercept-off-click-then-show', kind: 'showpicker', target: 's', intercept: null, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-multiple-show', kind: 'showpicker', target: 'm', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-disabled', kind: 'showpicker', target: 'dis', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-cancel-armed', kind: 'showpicker', target: 's', intercept: { enabled: true, cancel: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-show-twice', kind: 'showpicker-twice', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 320], wantTarget: 'pad' }, gesture: false },
  { name: 'sp-click-control', kind: 'click', target: 's', at: [160, 120], intercept: { enabled: true } },
];
const LEG_ORDER = PLAN.map((p) => p.name);
// Frozen observation of each leg's page-side shape (pre-freeze run; the LAW checks below state the
// rules the shapes obey). `opened` carries the mode only: the backendNodeId is browser-assigned and
// is reported in `nodeReport`, never required (QUALITY 150).
const LEG_SHAPE = {
  'sp-nogesture-intercept-on': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-nogesture-intercept-off': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-click-then-show': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'], trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0]], files: [], opened: ['selectSingle'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-cdp-gesture': { seq: [], trusted: [], act: [], xy: [], files: [], opened: ['selectSingle'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-intercept-off-click-then-show': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'cancel@s'], trusted: [true, true, true, true, true, true], act: [true, true, true, true, true, false], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0], [null, null, null]], files: [['cancel', 's', []]], opened: [], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-multiple-show': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'], trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0]], files: [], opened: ['selectMultiple'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-disabled': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'], trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0]], files: [], opened: [], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-cancel-armed': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'cancel@s'], trusted: [true, true, true, true, true, true], act: [true, true, true, true, true, false], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0], [null, null, null]], files: [['cancel', 's', []]], opened: ['selectSingle'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-show-twice': { seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'], trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: [[360, 320, 1], [360, 320, 1], [360, 320, 0], [360, 320, 0], [360, 320, 0]], files: [], opened: ['selectSingle'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
  'sp-click-control': { seq: ['pointerdown@s', 'mousedown@s', 'pointerup@s', 'mouseup@s', 'click@s'], trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: [[160, 120, 1], [160, 120, 1], [160, 120, 0], [160, 120, 0], [160, 120, 0]], files: [], opened: ['selectSingle'], state: { s: [], m: [], d: [], k: [], dis: [], sValue: '' } },
};
const GESTURE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.";
const IMMUTABLE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls.";
// leg -> expected showPicker outcome: {ok, name, message} (null = no showPicker call in the leg)
const SP_LAW = {
  'sp-nogesture-intercept-on': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR },
  'sp-nogesture-intercept-off': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR },
  'sp-click-then-show': { ok: true, ret: 'undefined' },
  'sp-cdp-gesture': { ok: true, ret: 'undefined' },
  'sp-intercept-off-click-then-show': { ok: true, ret: 'undefined' },
  'sp-multiple-show': { ok: true, ret: 'undefined' },
  'sp-disabled': { ok: false, name: 'InvalidStateError', message: IMMUTABLE_ERR },
  'sp-cancel-armed': { ok: true, ret: 'undefined' },
  'sp-show-twice': { ok: true, ret: 'undefined' },
  'sp-click-control': null,
};
const SP2_LAW = { 'sp-show-twice': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR } };
const ACT_LAW = {
  'sp-nogesture-intercept-on': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: false }],
  'sp-nogesture-intercept-off': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: false }],
  'sp-click-then-show': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp-cdp-gesture': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp-intercept-off-click-then-show': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp-multiple-show': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp-disabled': [{ isActive: true, hasBeenActive: true }, { isActive: true, hasBeenActive: true }],
  'sp-cancel-armed': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp-show-twice': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp-click-control': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
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

const RECEIPT_KEYS = ['schema', 'lane', 'nonce', 'driverSha256', 'startedAt', 'finishedAt', 'host', 'fixture', 'ports', 'frameTree', 'fixtureInputs', 'legs', 'failures'].sort();
const LEG_KEYS = ['activationAfter', 'activationBefore', 'argv', 'cdpEventLog', 'cdpProduct', 'cdpProtocolVersion', 'cdpSendLog', 'chooserWaitMs', 'closedAt', 'devtoolsListening', 'dismissError', 'dismissResult', 'dismissSendId', 'errors', 'fixtureInputs', 'frameTree', 'gesture', 'intercept', 'interceptError', 'interceptResult', 'interceptSendId', 'kind', 'lateAfterClose', 'launchToken', 'marks', 'name', 'pageEvents', 'priorClick', 'priorClickElement', 'priorClickError', 'priorPressId', 'priorReleaseId', 'serverLog', 'showPicker', 'showPicker2', 'stateAfter', 'stateAfterDismiss', 'stderrHead', 'target', 'teardown', 'trigger2Error', 'trigger2Result', 'trigger2SendId', 'triggerError', 'triggerResult', 'triggerSendId'].sort();
const EVENT_KEYS = ['type', 'ts', 'isTrusted', 'act', 'target', 'x', 'y', 'buttons', 'files', 'ret', 'seq', 'leg', 'at'].sort();
const ALLOWED_METHODS = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate', 'Page.setInterceptFileChooserDialog', 'Input.dispatchMouseEvent', 'Runtime.evaluate']);
const errOk = (e) => e === null || (isObj(e) && same(Object.keys(e).sort(), ['code', 'message']) && (e.code === null || Number.isInteger(e.code)) && typeof e.message === 'string');

// ---- identity and run binding ----
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('lane', r.lane === path.basename(lane), 'lane ' + r.lane + ' expected ' + path.basename(lane));
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r79-[a-z0-9-]{4,48}$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS), 'top-level receipt fields ' + JSON.stringify(Object.keys(r).sort()) + ' (want exactly ' + JSON.stringify(RECEIPT_KEYS) + ')');
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
check('fixture-hash', isObj(r.fixture) && r.fixture.sha256 === expectFixture && same(r.fixture.viewport, VIEWPORT) && same(Object.keys(r.fixture).sort(), ['origin', 'patch', 'sha256', 'viewport']),
  'fixture ' + JSON.stringify(isObj(r.fixture) ? { sha256: r.fixture.sha256, viewport: r.fixture.viewport } : r.fixture) + ' expected ' + expectFixture);
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion,
  'host ' + JSON.stringify({ chromium: host.chromium, cdpProduct: host.cdpProduct, cdpProtocolVersion: host.cdpProtocolVersion }));
check('host-node', typeof host.node === 'string' && Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor, 'node ' + host.node);
const ports = isObj(r.ports) ? r.ports : {};
check('ports-declared', Number.isInteger(ports.http) && Number.isInteger(ports.cdp) && ports.http >= 1024 && ports.cdp >= 1024 && ports.http !== ports.cdp && isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http,
  'ports ' + JSON.stringify(ports) + ' fixture origin ' + (isObj(r.fixture) ? r.fixture.origin : null));
const ftree = isObj(r.frameTree) ? r.frameTree : {};
check('frame-tree', same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl']) && typeof ftree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(ftree.mainFrameId) && ftree.mainFrameParentId === null && ftree.mainFrameUrl === 'about:blank',
  'frameTree ' + JSON.stringify(ftree));

// ---- legs ----
const legs = arr(r.legs);
check('plan-frozen', same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null }))),
  'leg plan differs from the frozen plan');
check('leg-order', same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
check('leg-records', legs.length === PLAN.length && legs.every((l, i) => isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name && l.kind === PLAN[i].kind && num(l.chooserWaitMs) && l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000 && errOk(l.interceptError) && errOk(l.priorClickError) && errOk(l.triggerError) && errOk(l.trigger2Error) && errOk(l.dismissError) && arr(l.errors).length === 0),
  'leg records: ' + legs.map((l) => (isObj(l) ? (same(Object.keys(l).sort(), LEG_KEYS) ? '' : l.name + ':keys ') + (arr(l.errors).length ? l.name + ':errors ' : '') : 'not-an-object')).filter(Boolean).join(','));
check('leg-marks', legs.every((l) => isObj(l) && arr(l.marks).length >= 3 && arr(l.marks)[0].name === 'start' && arr(l.marks)[1].name === 'pre' && arr(l.marks).slice(-1)[0].name === 'settle' && num(l.closedAt) && l.lateAfterClose === 0 && arr(l.marks).every((m, i, a) => isObj(m) && typeof m.name === 'string' && num(m.at) && onGrid(m.at) && (i === 0 || m.at >= a[i - 1].at))),
  'leg marks / closedAt / lateAfterClose: ' + JSON.stringify(legs.map((l) => isObj(l) ? [l.name, arr(l.marks).map((m) => m && m.name), l.lateAfterClose] : null)));

// ---- send log: allowlist, plan calls, ordering ----
const evalAllowed = (leg, expr) => {
  const p = PLAN.find((x) => x.name === leg.name) || {};
  const allowed = [READY_EXPR(r.nonce), ACT_EXPR, 'window.__inputs()', 'window.__state()', 'window.__closeRecord()', 'window.__late',
    'window.__setLeg("pre")', 'window.__setLeg("prior-click")', 'window.__setLeg("show-picker")', 'window.__setLeg("show-picker-2")', 'window.__setLeg("settle")', 'window.__setLeg("click")',
    'document.elementFromPoint(' + (p.priorClick ? p.priorClick.at[0] : 0) + ',' + (p.priorClick ? p.priorClick.at[1] : 0) + ').id'];
  if (p.kind === 'click' || p.kind === 'showpicker' || p.kind === 'showpicker-twice') allowed.push(wrapperFor(p.target));
  return allowed.includes(expr);
};
const sendBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { sendBad.push('not-an-object'); continue; }
  const log = arr(leg.cdpSendLog);
  if (log.length < 10 || !log.every((c, i) => isObj(c) && c.id === i + 1 && ALLOWED_METHODS.has(c.method) && isObj(c.params))) sendBad.push(leg.name + ':shape');
  else if (!log.every((c) => c.method !== 'Runtime.evaluate' || evalAllowed(leg, c.params.expression))) sendBad.push(leg.name + ':expression');
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
  const byId = (id) => log.find((c) => c.id === id);
  const want = [];
  if (p.intercept) want.push({ method: 'Page.setInterceptFileChooserDialog', params: p.intercept });
  const clickAt = p.priorClick ? p.priorClick.at : (p.kind === 'click' ? p.at : null);
  if (clickAt) {
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 1, clickCount: 1 } });
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 0, clickCount: 1 } });
  }
  if (p.kind === 'showpicker' || p.kind === 'showpicker-twice') {
    const tp = { expression: wrapperFor(p.target), returnByValue: true };
    if (p.gesture) tp.userGesture = true;
    want.push({ method: 'Runtime.evaluate', params: tp });
    if (p.kind === 'showpicker-twice') want.push({ method: 'Runtime.evaluate', params: { expression: wrapperFor(p.target), returnByValue: true } });
  }
  const openedExpected = (SP_LAW[leg.name] && SP_LAW[leg.name].ok === true) || p.kind === 'click';
  if (p.intercept && !p.intercept.cancel && openedExpected) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });
  const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || (c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target)));
  if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(leg.name + ':sequence');
  // send-id coherence
  if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id) planBad.push(leg.name + ':intercept-id');
  if (p.priorClick) { if (leg.priorPressId === null || leg.priorReleaseId === null || leg.priorReleaseId <= leg.priorPressId) planBad.push(leg.name + ':prior-ids'); }
  else if (p.kind === 'click') { if (leg.priorPressId === null || leg.priorReleaseId !== null) planBad.push(leg.name + ':click-ids'); }
  else if (leg.priorPressId !== null || leg.priorReleaseId !== null) planBad.push(leg.name + ':prior-ids-without-click');
  const trig = log.find((c) => c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target));
  if (p.kind === 'showpicker' || p.kind === 'showpicker-twice') {
    if (!trig || leg.triggerSendId !== trig.id) planBad.push(leg.name + ':trigger-id');
    if (p.kind === 'showpicker-twice') {
      const t2 = log.filter((c) => c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target))[1];
      if (!t2 || leg.trigger2SendId !== t2.id || leg.trigger2SendId <= leg.triggerSendId) planBad.push(leg.name + ':trigger2-id');
    } else if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');
    const dis = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog')[1];
    if (dis) { if (leg.dismissSendId !== dis.id) planBad.push(leg.name + ':dismiss-id'); }
    else if (leg.dismissSendId !== null) planBad.push(leg.name + ':dismiss-unexpected');
  } else {
    if (leg.triggerSendId === null || leg.priorPressId === null || leg.triggerSendId <= leg.priorPressId || leg.priorReleaseId !== null) planBad.push(leg.name + ':click-trigger-id');
    if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');
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
  if (opens.length > 1) evBad.push(leg.name + ':multi-open');
  if (opens.length === 1) {
    const o = opens[0];
    if (!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode']) || !['selectSingle', 'selectMultiple'].includes(o.params.mode) || !Number.isInteger(o.params.backendNodeId) || o.params.backendNodeId <= 0 || o.params.frameId !== lft.mainFrameId) evBad.push(leg.name + ':open-shape');
    if (leg.triggerSendId === null || o.afterSendId !== leg.triggerSendId) evBad.push(leg.name + ':open-binding');
  }
}
check('cdp-event-log-closed', legs.length > 0 && evBad.length === 0, 'CDP event logs: ' + evBad.join(','));
check('frame-binding', legs.every((l) => isObj(l) && isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.frameTree.mainFrameId) && l.frameTree.mainFrameParentId === null && l.frameTree.mainFrameUrl === 'about:blank' && arr(l.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').every((e) => e.params.frameId === l.frameTree.mainFrameId)),
  'chooser events not bound to their leg\'s own frame-tree main frame (each leg is a fresh browser)');

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
check('gesture-law', spBad.length === 0, 'showPicker outcomes not the gesture law\'s (no transient activation -> NotAllowedError "requires a user gesture"; a consumed activation -> ok {ret "undefined"}; a disabled input -> InvalidStateError "immutable controls"): ' + spBad.join(','));
const actBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = ACT_LAW[leg.name];
  if (!want) { actBad.push(leg.name + ':no-law'); continue; }
  if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1])) actBad.push(leg.name + ': ' + JSON.stringify([leg.activationBefore, leg.activationAfter]));
}
check('activation-law', actBad.length === 0, 'legs whose transient-activation transition is not the frozen one (a successful showPicker consumes isActive; the InvalidStateError path does not): ' + actBad.join(','));
const twice = legOf('sp-show-twice');
check('consumption-law', isObj(twice.showPicker) && twice.showPicker.ok === true && isObj(twice.showPicker2) && twice.showPicker2.ok === false && twice.showPicker2.name === 'NotAllowedError' && twice.showPicker2.message === GESTURE_ERR && arr(twice.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 1,
  'one activation must buy exactly one picker: first ' + JSON.stringify(twice.showPicker) + ' second ' + JSON.stringify(twice.showPicker2));
const dis = legOf('sp-disabled');
check('immutable-law', isObj(dis.showPicker) && dis.showPicker.ok === false && dis.showPicker.name === 'InvalidStateError' && dis.showPicker.message === IMMUTABLE_ERR && arr(dis.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(dis.activationBefore, dis.activationAfter),
  'a disabled input must refuse with InvalidStateError and open nothing, without consuming the activation: ' + JSON.stringify(dis.showPicker));
const fixi = arr(r.fixtureInputs);
const descOf = (id) => fixi.find((d) => isObj(d) && d.id === id);
const modeBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  if (!p || opens.length === 0) continue;
  const d = descOf(p.target);
  const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSingle';
  if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push(leg.name + ': ' + JSON.stringify(opens.map((e) => e.params.mode)) + ' want ' + wantMode);
}
check('mode-law', modeBad.length === 0,
  'chooser events whose mode is not the page-measured input\'s (multiple attribute -> selectMultiple, else selectSingle): ' + modeBad.join(','));
const nodeBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  if (opens.length && !(Number.isInteger(opens[0].params.backendNodeId) && opens[0].params.backendNodeId > 0)) nodeBad.push(leg.name + ':id');
}
check('node-binding-law', nodeBad.length === 0, 'chooser events without a positive integer backendNodeId (the id is reported in nodeReport and never required to be a literal, QUALITY 150): ' + nodeBad.join(','));
const stateBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const st = leg.stateAfter;
  const empty = isObj(st) && same(Object.keys(st).sort(), ['d', 'dis', 'k', 'm', 's', 'sValue']) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(st[k]) && st[k].length === 0) && st.sValue === '';
  if (!empty) stateBad.push(leg.name + ':state');
  if (leg.stateAfterDismiss !== null && !(isObj(leg.stateAfterDismiss) && ['s', 'm', 'd', 'k', 'dis'].every((k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[k].length === 0))) stateBad.push(leg.name + ':dismiss-state');
  if (arr(leg.pageEvents).some((e) => e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel'))) stateBad.push(leg.name + ':file-event');
}
check('no-selection-law', stateBad.length === 0, 'showPicker must never select files or fire input/change (the trigger opens a picker; the answer is a separate act): ' + stateBad.join(','));
const intBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  if (!p) { intBad.push(leg.name + ':unknown-leg'); continue; }
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length;
  if (p.intercept === null && opens !== 0) intBad.push(leg.name + ':no-intercept-but-opened');
  if (p.intercept !== null && SP_LAW[leg.name] && SP_LAW[leg.name].ok === true && opens !== 1) intBad.push(leg.name + ':intercept-but-' + opens);
  if (p.intercept !== null && SP_LAW[leg.name] && SP_LAW[leg.name].ok === false && opens !== 0) intBad.push(leg.name + ':refused-but-opened');
}
check('intercept-law', intBad.length === 0, 'interception must gate the CDP event, never the trigger\'s own success: ' + intBad.join(','));
const cancels = legs.flatMap((l) => (isObj(l) ? arr(l.pageEvents).filter((e) => e.type === 'cancel').map((e) => [l.name, e.target]) : []));
check('cancel-law', same(cancels, [['sp-intercept-off-click-then-show', 's'], ['sp-cancel-armed', 's']]),
  'the page cancel event must fire exactly where the picker was opened and cancelled (native dialog auto-cancelled with interception off; an armed cancel flag with interception on): ' + JSON.stringify(cancels));
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
  const td = leg.teardown;
  if (!isObj(td)) argvBad.push(leg.name + ':teardown');
}
check('host-argv', argvBad.length === 0, 'per-leg argv / launch token / profile / devtools line: ' + argvBad.join(','));
check('devtools-port-binding', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && l.devtoolsListening.port === ports.cdp), 'devtools port not the argv CDP port');
check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && l.teardown.survivors.length === 0 && Object.values(l.teardown.portProbes).every((v) => v === 'closed') && Object.values(l.teardown.postKillCurl).every((v) => v === 7)), 'a leg\'s teardown proof failed');
check('fixture-descriptors', same(fixi, FIXTURE_INPUTS), 'page-side element descriptors differ: ' + JSON.stringify(fixi));
const srvBad = legs.filter((l) => isObj(l) && !(arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1 && arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.run === r.nonce && s.status === 200) && arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404))).map((l) => l.name);
check('server-log-binding', srvBad.length === 0, 'fixture server log not bound to the run nonce: ' + srvBad.join(','));

// ---- run window / replay ----
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 20000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (10 legs, each >= 2 s observe + 0.5 s settle + a browser launch)');
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
  return { priorEvents: np, priorGaps: gp, absMatched, gapMatched, absNeed, gapNeed, escapeEvents: np > 0 ? np - absNeed + 1 : 0, escapeGaps: gp > 0 ? gp - gapNeed + 1 : 0, refused: (np > 0 && absMatched >= absNeed) || (gp > 0 && gapMatched >= gapNeed) };
});
const replayIdx = sims.findIndex((s) => s.refused);
check('replay-event-timeline', replayIdx === -1, 'pair/gap near-match within ' + TOL + ' ms of prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (refuse when absMatched >= ceil(' + FRAC + ' * prior events) or gapMatched >= ceil(' + GAP_FRAC + ' * prior gaps); own events ' + own.length + ')');
check('replay-launch-token', legs.every((l) => isObj(l) && typeof l.launchToken === 'string' && /^[0-9a-f]{12}$/.test(l.launchToken) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))) && new Set(legs.map((l) => l.launchToken)).size === legs.length,
  'a launch token repeats a prior receipt\'s or another leg\'s');
check('replay-devtools-url', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== l.devtoolsListening.browserId))) && new Set(legs.map((l) => l.devtoolsListening && l.devtoolsListening.browserId)).size === legs.length,
  'a devtools browser id repeats a prior receipt\'s or another leg\'s');

// ---- prior-set completeness over the walked trees (content-bound exemption) ----
// every prior the counter loads is excluded from the walk: the prior-set entries AND the --prior
// receipts (a --prior receipt that sits in a walked tree is a prior, not an unlisted receipt)
const priorReal = new Set(priorPaths.map(real));
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
    if (/tabi-chrome-cdp-showpicker-r79/.test(bytes.toString('utf8'))) unparsable.push(w.path);
    continue;
  }
  if (isObj(j) && j.schema === SCHEMA && !priorReal.has(w.path) && w.path !== selfReal && !exemptReal.has(w.path)) outside.push(w.path);
}
const unmatched = exemptHashes.filter((h) => ![...fileHashes.values()].includes(h));
check('prior-set-unmatched-exempt', unmatched.length === 0, 'tree-exempt sha256 matches no walked file: ' + unmatched.join(','));
check('prior-set-complete', outside.length === 0, 'receipts of schema ' + SCHEMA + ' in the round-79 wave/evidence trees, not the receipt under test (path ' + path.relative(lane, abs(rp)) + '), not exempted by sha256 and not among the priors: ' + outside.join(','));
check('prior-set-unparsable', unparsable.length === 0, 'files in the round-79 wave/evidence trees that carry the schema and do not parse (refused, not skipped): ' + unparsable.join(','));

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
    sentence: 'refuse when absMatched >= ceil(' + FRAC + ' * prior events) or gapMatched >= ceil(' + GAP_FRAC + ' * prior gaps); escape minimum = priorEvents - absNeed + 1 events and priorGaps - gapNeed + 1 gaps',
    tolerance: TOL, gapMin: GAP_MIN, ownEvents: own.length, ownGaps: ownGaps.length, perPrior: sims,
  },
}, verdict === 'clean' ? 0 : 1);
