#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-dragdrop-r75.mjs (tabi round 75, C1).
// Usage: node negatives-dragdrop-r75.mjs --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <the real receipt's expected nonce> --prior <receipt.json> [--prior ...]
//          --work <ABS scratch dir> --laundered <degenerate receipt.json> (x3: native-mouse,
//          no-intercept, script-events) [--json]
// Structure carried from the round-74 battery: every case mutates the real receipt and runs the
// counter BY PATH (the counter beside this file); unless the case targets legshape-consistency the
// producer's legShape is LAUNDERED (recomputed from the counter's own re-derivation) so the summary
// check cannot fire on the mutation's behalf. A refusal case passes only when the counter exits 1,
// lists the expected id and lists NO other id except those the case names in `alsoAllowed`.
// MUST-ACCEPT cases must exit 0 with no finding. Coverage: every check id the counter declares must
// be the expected id of >= 1 refusal case.
// New for r75 (round-74 routed defects): the three laundered degenerate receipts are REQUIRED
// (usage exit 2 if any kind is missing; R74Review2 F2), and replay cases cover an inserted event, a
// deleted event and a whole-timeline shift (R74Review1 S1), with must-accept priors re-timed
// non-uniformly.
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-dragdrop-r75.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce');
const priorPaths = multi('prior');
if (!realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || priorPaths.length === 0) usage('--real, --expect-driver-sha256, --expect-nonce, >= 1 --prior and an absolute --work are required');
const LAUNDER_EXPECT = { 'native-mouse': 'drag-call-count', 'no-intercept': 'intercept-event', 'script-events': 'send-log-allowlist' };
const launderedPaths = multi('laundered');
const launderedKinds = launderedPaths.map((p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')).degenerate; } catch { return null; } });
if (launderedPaths.length !== 3 || Object.keys(LAUNDER_EXPECT).some((k) => !launderedKinds.includes(k))) usage('exactly three --laundered receipts are required, one per degenerate kind: ' + Object.keys(LAUNDER_EXPECT).join(', ') + ' (got ' + JSON.stringify(launderedKinds) + ')');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });
const counterSrc = fs.readFileSync(COUNTER, 'utf8').split('\n');
const lineOf = (id) => { const i = counterSrc.findIndex((l) => l.includes(`check('${id}'`) || (id.startsWith('leg-') && l.includes('check(`leg-${name}-' + id.split('-').slice(-1)[0] + '`'))); return i >= 0 ? i + 1 : null; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const LEGS = ['start', 'intercept-on', 'press', 'move-start', 'move-far', 'enter-dz', 'over-dz', 'drop-dz', 'release', 'ext-enter-nz', 'ext-drop-nz', 'ext-enter-dz', 'ext-cancel', 'ext-drop-dz', 'bad-type'];
const PER = ['seq', 'trusted', 'prevented', 'xy', 'dt', 'state', 'error'];
const LAWS = ['trust-law', 'data-protection-law', 'no-native-session', 'drop-acceptance-law', 'cancel-clears-session', 'source-lifecycle', 'coordinate-law', 'mask-effect-law'];
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const legIdx = (r, leg) => r.legs.findIndex((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[LEGS.indexOf(leg) + 1].at;
const nextMarkAt = (r, leg) => { const i = LEGS.indexOf(leg) + 2; return i < r.legMarks.length ? r.legMarks[i].at : r.closedAt; };
const insertAt = (r, leg, ev) => {
  // insert after the last event at or before `leg`, inside that leg's page-time window, on the
  // 0.1 ms grid, with strict field types
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  const prev = idx >= 0 ? r.events[idx] : null;
  const at = Math.round((Math.max(prev ? prev.at : 0, markAt(r, leg)) + 0.1) * 10) / 10;
  if (at > nextMarkAt(r, leg)) throw new Error('insertAt: no room in leg window ' + leg);
  r.events.splice(idx + 1, 0, { type: 'click', seq: 0, leg, ts: at, at, isTrusted: true, target: 'dz', x: 450, y: 150, buttons: 0, defaultPrevented: false,
    types: null, plain: null, custom: null, dropEffect: null, effectAllowed: null, items: null, ...ev });
  return renumber(r);
};
const cases = [];
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };
const perLeg = (leg) => PER.map((k) => `leg-${leg}-${k}`);
const sends = (r, m) => r.cdpSendLog.filter((c) => c.method === m);
const evType = (r, leg, type) => r.events.find((e) => e.leg === leg && e.type === type);

// ---- identity and run binding ----
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-dragdrop-r74'; });
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = to; r.serverLog.forEach((s) => { s.run = to; });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(to)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.replace(JSON.stringify(old), JSON.stringify(to)); }
};
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r75-x'); }, ['nonce-expected', 'fixture-hash']);
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r75-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'no-intercept'; });
add('degenerate-field-absent', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r75-other'; }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('fixture-hash', 'fixture-hash', (r) => { r.fixture.sha256 = '0'.repeat(64); });
add('fixture-hash-absent', 'fixture-hash', (r) => { delete r.fixture.sha256; });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Firefox 140.0'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 4000).toISOString(); });
add('run-window-long', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[5].params.x = 451; });
add('plan-frozen-dropped-leg', 'plan-frozen', (r) => { r.plan.splice(12, 1); });
add('leg-order', 'leg-order', (r) => { r.legs.push(clone(r.legs[1])); }, ['leg-params']);
add('leg-order-swap-empty', 'leg-order', (r) => { [r.legs[12].name, r.legs[13].name] = [r.legs[13].name, r.legs[12].name]; }, ['leg-params']);
add('leg-params', 'leg-params', (r) => { r.legs[2].params.x = 151; });
add('leg-params-cmd', 'leg-params', (r) => { r.legs[4].cmd = 'Input.dispatchDragEvent'; });
add('leg-params-elapsed-string', 'leg-params', (r) => { r.legs[2].elapsedMs = '300'; });
add('leg-params-sentdata-other', 'leg-params', (r) => { r.legs[legIdx(r, 'over-dz')].sentData.dragOperationsMask = 1; });
add('leg-params-sentdata-on-ext', 'leg-params', (r) => { r.legs[legIdx(r, 'ext-enter-nz')].sentData = clone(r.legs[legIdx(r, 'enter-dz')].sentData); });
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; }, ['event-leg-window', 'coordinate-law', 'mask-effect-law', 'no-native-session', 'cancel-clears-session', ...perLeg('ext-enter-dz')]);
add('event-leg-fabricated-label', 'event-leg-domain', (r) => { r.events[0].leg = 'press2'; }, ['event-leg-window', 'coordinate-law', ...perLeg('press')]);
add('event-types-ts-string', 'event-types', (r) => { evsOf(r, 'over-dz')[0].ts = String(evsOf(r, 'over-dz')[0].ts); }, ['event-time-quantum']);
add('event-types-trusted-string', 'event-types', (r) => { evsOf(r, 'over-dz')[0].isTrusted = 'true'; }, ['leg-over-dz-trusted', 'trust-law']);
add('event-types-unknown-type', 'event-types', (r) => { evsOf(r, 'release')[1].type = 'mouseUp'; }, ['leg-release-seq']);
add('event-types-x-float', 'event-types', (r) => { evsOf(r, 'press')[0].x = 150.5; }, ['leg-press-xy', 'coordinate-law']);
add('event-types-dt-on-pointer', 'event-types', (r) => { Object.assign(evsOf(r, 'press')[0], { types: [], plain: '', custom: '', dropEffect: 'none', effectAllowed: 'none', items: 0 }); }, ['leg-press-dt']);
add('event-types-dt-partial', 'event-types', (r) => { evsOf(r, 'over-dz')[0].items = null; }, ['leg-over-dz-dt']);
add('event-time-quantum', 'event-time-quantum', (r) => { evsOf(r, 'over-dz')[0].ts += 0.03; });
add('event-time-quantum-at', 'event-time-quantum', (r) => { evsOf(r, 'drop-dz')[2].at += 0.03; });
add('leg-marks-late', 'leg-marks', (r) => { r.lateAfterClose = 1; }, ['event-leg-window', 'cancel-clears-session']);
add('leg-marks-fabricated-name', 'leg-marks', (r) => { r.legMarks[3].name = 'press-x'; }, ['event-leg-window', 'cancel-clears-session']);
add('leg-marks-closed-early', 'leg-marks', (r) => { r.closedAt = r.legMarks[r.legMarks.length - 1].at - 1; }, ['event-leg-window', 'cancel-clears-session']);
add('event-leg-window-late-label', 'event-leg-window', (r) => { const e = evsOf(r, 'over-dz'); e[e.length - 1].at = Math.round((markAt(r, 'drop-dz') + 0.1) * 10) / 10; });
add('event-leg-window-order', 'event-leg-window', (r) => { const e = evsOf(r, 'drop-dz'); e[2].at = Math.round((e[1].at - 0.1) * 10) / 10; });
// ---- producer: interception, replayed data, closed allow-list ----
const dragIdx = (r) => r.cdpSendLog.map((c, i) => (c.method === 'Input.dispatchDragEvent' ? i : -1)).filter((i) => i >= 0);
add('drag-call-count-dropped', 'drag-call-count', (r) => { r.cdpSendLog.splice(dragIdx(r)[3], 1); r.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); }, ['drag-call-params', 'intercept-event']);
add('drag-call-count-extra', 'drag-call-count', (r) => { pushSend(r, 'Input.dispatchDragEvent', clone(r.cdpSendLog[dragIdx(r)[0]].params)); }, ['drag-call-params']);
add('drag-call-count-case-variant', 'drag-call-count', (r) => { pushSend(r, 'input.dispatchDragEvent', clone(r.cdpSendLog[dragIdx(r)[0]].params)); }, ['drag-call-params', 'send-log-allowlist']);
add('drag-call-count-no-intercept-on', 'drag-call-count', (r) => { const i = r.cdpSendLog.findIndex((c) => c.method === 'Input.setInterceptDrags'); r.cdpSendLog.splice(i, 1); r.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); r.cdpEventLog.forEach((e) => { e.afterSendId -= 1; }); }, ['drag-call-params']);
add('drag-call-params', 'drag-call-params', (r) => { sends(r, 'Input.dispatchMouseEvent')[0].params.x = 151; });
add('drag-call-params-data', 'drag-call-params', (r) => { r.cdpSendLog[dragIdx(r)[1]].params.data.dragOperationsMask = 1; });
add('drag-call-params-order', 'drag-call-params', (r) => { const [a, b] = dragIdx(r); const t = r.cdpSendLog[a]; r.cdpSendLog[a] = { ...r.cdpSendLog[b], id: t.id }; r.cdpSendLog[b] = { ...t, id: r.cdpSendLog[b].id }; });
add('intercept-event-late', 'intercept-event', (r) => { r.cdpEventLog[0].afterSendId += 1; });
add('intercept-event-early', 'intercept-event', (r) => { r.cdpEventLog[0].afterSendId -= 1; });
add('intercept-event-duplicate', 'intercept-event', (r) => { r.cdpEventLog.push(clone(r.cdpEventLog[0])); }, ['cdp-event-log-closed', 'intercept-data', 'drag-call-params', 'leg-params', 'mask-effect-law']);
add('intercept-event-absent', 'intercept-event', (r) => { r.cdpEventLog = []; }, ['cdp-event-log-closed', 'intercept-data', 'drag-call-params', 'leg-params', 'mask-effect-law']);
add('intercept-data', 'intercept-data', (r) => {
  const fix = (d) => { d.items[0].data = 'tabi-drog'; };
  fix(r.cdpEventLog[0].params.data); for (const i of dragIdx(r).slice(0, 3)) fix(r.cdpSendLog[i].params.data);
  for (const l of r.legs) if (l.sentData) fix(l.sentData);
});
add('intercept-data-mask', 'intercept-data', (r) => {
  const fix = (d) => { d.dragOperationsMask = 19; };
  fix(r.cdpEventLog[0].params.data); for (const i of dragIdx(r).slice(0, 3)) fix(r.cdpSendLog[i].params.data);
  for (const l of r.legs) if (l.sentData) fix(l.sentData);
}, ['mask-effect-law']);
add('cdp-event-log-extra-key', 'cdp-event-log-closed', (r) => { r.cdpEventLog[0].ts = 1; });
add('cdp-event-log-other-event', 'cdp-event-log-closed', (r) => { r.cdpEventLog.push({ method: 'Input.somethingElse', params: { data: {} }, afterSendId: 1 }); });
const LOOK = [
  ['dispatch-key', 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'a' }, ['drag-call-count', 'drag-call-params']],
  ['cancel-dragging', 'Input.cancelDragging', {}, ['drag-call-count', 'drag-call-params']],
  ['emulate-touch', 'Input.emulateTouchFromMouseEvent', { type: 'mouseMoved', x: 1, y: 1, button: 'left' }, ['drag-call-count', 'drag-call-params']],
  ['file-input', 'DOM.setFileInputFiles', { files: ['/etc/hostname'], nodeId: 1 }, []],
  ['layout-metrics', 'Page.getLayoutMetrics', {}, []],
  ['touch-emulation', 'Emulation.setTouchEmulationEnabled', { enabled: true }, []],
  ['script-dragevent', 'Runtime.evaluate', { expression: 'document.getElementById("dz").dispatchEvent(new DragEvent("drop", { dataTransfer: new DataTransfer() }))', returnByValue: true }, []],
  ['events-push', 'Runtime.evaluate', { expression: 'window.__events.push({type:"drop"})', returnByValue: true }, []],
  ['textcontent', 'Runtime.evaluate', { expression: 'document.getElementById("dz").textContent = "tabi-drag|x1"', returnByValue: true }, []],
  ['call-function-on', 'Runtime.callFunctionOn', { functionDeclaration: 'function(){}' }, []],
];
for (const [nm, m, p, also] of LOOK) add('lookalike-' + nm, 'send-log-allowlist', (r) => { pushSend(r, m, p); }, also);
add('allowlist-dmo-scale-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Emulation.setDeviceMetricsOverride').params.scale = 2; });
add('allowlist-eval-extra-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Runtime.evaluate').params.awaitPromise = true; });
add('allowlist-navigate-other-run', 'send-log-allowlist', (r) => { const c = r.cdpSendLog.find((x) => x.method === 'Page.navigate'); c.params.url = c.params.url.replace('?run=', '?run=x'); });
add('allowlist-navigate-twice', 'send-log-allowlist', (r) => { pushSend(r, 'Page.navigate', clone(r.cdpSendLog.find((x) => x.method === 'Page.navigate').params)); });
add('allowlist-id-gap', 'send-log-allowlist', (r) => { r.cdpSendLog[5].id += 100; });
add('allowlist-params-absent', 'send-log-allowlist', (r) => { delete r.cdpSendLog.find((x) => x.method === 'Page.enable').params; });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('teardown-sweep-count', 'teardown-closure', (r) => { r.teardown.postKillSweepCount = 1; });
add('teardown-port-open', 'teardown-closure', (r) => { r.teardown.portProbes.devtools = 'open'; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
// ---- producer-verdict polarity (r62 M5): every non-(true, 'CONFIRMED') pair ----
const POL = [['false-CONFIRMED', false, 'CONFIRMED'], ['true-REFUTED', true, 'REFUTED'], ['false-REFUTED', false, 'REFUTED'], ['null-CONFIRMED', null, 'CONFIRMED'],
  ['string-true', 'true', 'CONFIRMED'], ['one', 1, 'CONFIRMED'], ['true-UNKNOWN', true, 'UNKNOWN'], ['true-lowercase', true, 'confirmed'], ['true-UNMEASURED', true, 'UNMEASURED'], ['true-null', true, null]];
for (const [nm, p, h] of POL) add('producer-verdict-' + nm, 'producer-verdict', (r) => { r.predicate = p; r.dragHypothesis = h; });
add('producer-verdict-old-field', 'producer-verdict', (r) => { delete r.dragHypothesis; r.imeComposeHypothesis = 'CONFIRMED'; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape['drop-dz'].dt[2] = 'x'; }, [], false);
add('legshape-fabricated-leg', 'legshape-consistency', (r) => { r.legShape.extra = r.legShape['drop-dz']; }, [], false);
// ---- replay refusal (QUALITY 136/138/140; R74Review1 S1) ----
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { x.host.launchToken = x.host.launchToken.slice(0, -1) + (x.host.launchToken.endsWith('0') ? '1' : '0'); };
const q = (v) => Math.round(v * 10) / 10;
const shiftTs = (x, d) => { x.events.forEach((e) => { e.ts = q(e.ts + d); e.at = q(e.at + d); }); };
// deterministic non-uniform re-timing: event i moves by (1 + (i * 7) % 13) * 0.3 ms (always >= 0.3 ms, never equal steps)
const jitter = (x) => { x.events.forEach((e, i) => { const d = (1 + ((i * 7) % 13)) * 0.3; e.ts = q(e.ts + d); e.at = q(e.at + d); }); x.legMarks.forEach((m) => { m.at = q(m.at); }); };
const priorIds = (p) => { swapToken(p); swapUrl(p); return p; };
add('nonce-expected', 'nonce-expected', () => {}, [], true, { nonce: 'tabi-r75-other' });
add('replay-byte-identical', 'replay-launch-token', () => {}, REPLAY, true, { priorReal: true });
add('replay-nonce-stamps-rewritten', 'replay-launch-token', (r) => {
  rewriteNonce(r, 'tabi-r75-replay-x');
  for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString();
}, [...REPLAY, 'fixture-hash'], true, { priorReal: true, nonce: 'tabi-r75-replay-x' });
add('replay-token-only-shared', 'replay-launch-token', () => {}, [], true, { prior: (p) => { swapUrl(p); jitter(p); return p; } });
add('replay-url-only-shared', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); return p; } });
add('replay-url-uppercase', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); jitter(p); p.host.devtoolsListening.url = p.host.devtoolsListening.url.toUpperCase().replace('WS://', 'ws://').replace('/DEVTOOLS/BROWSER/', '/devtools/browser/'); return p; } });
add('replay-timeline-only-shared', 'replay-event-timeline', () => {}, [], true, { prior: priorIds });
add('replay-timeline-1e-12', 'replay-event-timeline', (r) => { r.events[7].ts += 1e-12; }, ['event-time-quantum'], true, { prior: priorIds });
add('replay-timeline-sub-quantum', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { const d = i % 2 ? 0.04 : -0.04; e.ts += d; e.at += d; }); return p; } });
add('replay-timeline-whole-shift-1ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 1.0); return p; } });
add('replay-timeline-whole-shift-100ms', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); shiftTs(p, 100); return p; } });
add('replay-timeline-prior-has-extra-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 0, clone(p.events[4])); renumber(p); return p; } });
add('replay-timeline-prior-missing-event', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.splice(4, 1); renumber(p); return p; } });
add('replay-timeline-half-retimed', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { if (i % 3 === 0) { e.ts = q(e.ts + 0.7); e.at = q(e.at + 0.7); } }); return p; } });
add('replay-timeline-too-few-gaps', 'replay-event-timeline', (r) => { r.events = r.events.filter((e) => ['press', 'move-start', 'enter-dz', 'over-dz', 'drop-dz'].includes(e.leg)); renumber(r); },
  ['seq-monotonic', 'cancel-clears-session', 'drop-acceptance-law', ...['release', 'ext-enter-nz', 'ext-drop-nz', 'ext-enter-dz'].flatMap((l) => perLeg(l))]);
add('replay-launch-token-shape', 'replay-launch-token', (r) => { r.host.launchToken = 'x'; });
// ---- cross-leg laws ----
add('trust-law', 'trust-law', (r) => { evType(r, 'move-start', 'dragstart').isTrusted = false; }, ['leg-move-start-trusted']);
add('trust-law-pointer', 'trust-law', (r) => { evType(r, 'release', 'mouseup').isTrusted = false; }, ['leg-release-trusted']);
add('data-protection-enter', 'data-protection-law', (r) => { evType(r, 'enter-dz', 'dragenter').plain = 'tabi-drag'; }, ['leg-enter-dz-dt']);
add('data-protection-custom', 'data-protection-law', (r) => { evType(r, 'ext-drop-nz', 'dragleave').custom = 'x1'; }, ['leg-ext-drop-nz-dt']);
add('data-protection-drop-empty', 'data-protection-law', (r) => { evType(r, 'drop-dz', 'drop').plain = ''; }, ['leg-drop-dz-dt']);
add('no-native-session-marker', 'no-native-session', (r) => { evType(r, 'over-dz', 'dragover').types.push('chromium/x-drag-id'); }, ['leg-over-dz-dt']);
add('no-native-session-early-enter', 'no-native-session', (r) => { insertAt(r, 'move-far', { type: 'dragenter', target: 'src', buttons: 1, types: ['text/plain', 'text/x-tabi'], plain: '', custom: '', dropEffect: 'move', effectAllowed: 'copyMove', items: 2 }); },
  [...perLeg('move-far').filter((x) => !/state|error/.test(x)), 'mask-effect-law', 'source-lifecycle']);
add('drop-acceptance-nz-dropped', 'drop-acceptance-law', (r) => { evType(r, 'ext-drop-nz', 'dragleave').type = 'drop'; }, ['leg-ext-drop-nz-seq', 'leg-ext-drop-nz-dt', 'data-protection-law', 'source-lifecycle']);
add('drop-acceptance-dz-left', 'drop-acceptance-law', (r) => { const e = evType(r, 'drop-dz', 'drop'); e.type = 'dragleave'; e.plain = ''; e.custom = ''; }, ['leg-drop-dz-seq', 'leg-drop-dz-dt', 'source-lifecycle', 'data-protection-law']);
add('drop-acceptance-unprevented', 'drop-acceptance-law', (r) => { evType(r, 'drop-dz', 'dragover').defaultPrevented = false; }, ['leg-drop-dz-prevented']);
add('drop-acceptance-extra-leave', 'drop-acceptance-law', (r) => { insertAt(r, 'over-dz', { type: 'dragleave', target: 'dz', x: 460, y: 160, types: ['text/plain', 'text/x-tabi'], plain: '', custom: '', dropEffect: 'none', effectAllowed: 'copyMove', items: 2 }); },
  perLeg('over-dz').filter((x) => !/state|error/.test(x)));
add('cancel-clears-dragleave', 'cancel-clears-session', (r) => { insertAt(r, 'ext-cancel', { type: 'dragleave', target: 'dz', types: ['text/plain'], plain: '', custom: '', dropEffect: 'none', effectAllowed: 'copy', items: 1 }); },
  [...perLeg('ext-cancel').filter((x) => !/state|error/.test(x)), 'drop-acceptance-law']);
add('cancel-clears-late-drop', 'cancel-clears-session', (r) => { insertAt(r, 'ext-drop-dz', { type: 'dragover', target: 'dz', x: 470, y: 170, defaultPrevented: true, types: ['text/plain'], plain: '', custom: '', dropEffect: 'copy', effectAllowed: 'copy', items: 1 }); },
  [...perLeg('ext-drop-dz').filter((x) => !/state|error/.test(x)), 'drop-acceptance-law']);
add('source-lifecycle-effect', 'source-lifecycle', (r) => { evType(r, 'drop-dz', 'dragend').dropEffect = 'none'; }, ['leg-drop-dz-dt']);
add('source-lifecycle-no-end', 'source-lifecycle', (r) => { r.events.splice(r.events.indexOf(evType(r, 'drop-dz', 'dragend')), 1); renumber(r); }, perLeg('drop-dz').filter((x) => !/state|error/.test(x)));
add('source-lifecycle-drag-target', 'source-lifecycle', (r) => { evType(r, 'enter-dz', 'drag').target = 'dz'; }, ['leg-enter-dz-seq']);
add('source-lifecycle-end-before-drop', 'source-lifecycle', (r) => {
  const es = evsOf(r, 'drop-dz'); const i = r.events.indexOf(es[2]), j = r.events.indexOf(es[3]);
  const [a, b] = [r.events[i], r.events[j]]; [a.at, b.at] = [b.at, a.at]; [a.ts, b.ts] = [b.ts, a.ts]; r.events[i] = b; r.events[j] = a; renumber(r);
}, perLeg('drop-dz').filter((x) => !/state|error/.test(x)));
add('coordinate-law', 'coordinate-law', (r) => { evType(r, 'drop-dz', 'drop').x += 1; }, ['leg-drop-dz-xy']);
add('coordinate-law-y', 'coordinate-law', (r) => { evType(r, 'drop-dz', 'drop').y += 1; }, ['leg-drop-dz-xy']);
add('coordinate-law-dragstart', 'coordinate-law', (r) => { evType(r, 'move-start', 'dragstart').y = 125; }, ['leg-move-start-xy']);
add('mask-effect-law', 'mask-effect-law', (r) => { evType(r, 'ext-enter-nz', 'dragenter').effectAllowed = 'move'; }, ['leg-ext-enter-nz-dt']);
add('mask-effect-law-dragstart', 'mask-effect-law', (r) => { evType(r, 'move-start', 'dragstart').effectAllowed = 'copy'; }, ['leg-move-start-dt']);
// ---- per-leg checks ----
const LAWS_ALL = [...LAWS, 'event-types'];
for (const leg of LEGS) {
  const has = evsOf(real, leg).length > 0;
  const also = (k) => [...perLeg(leg).filter((x) => x !== `leg-${leg}-${k}` && !/-(state|error)$/.test(x)), ...LAWS_ALL];
  if (has) {
    add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const e = evsOf(r, leg); e[e.length - 1].target = 'nz2'; }, also('seq'));
    add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { const e = evsOf(r, leg); e[0].isTrusted = !e[0].isTrusted; }, ['trust-law']);
    add(`${leg}-prevented`, `leg-${leg}-prevented`, (r) => { const e = evsOf(r, leg); e[0].defaultPrevented = !e[0].defaultPrevented; }, ['drop-acceptance-law']);
    add(`${leg}-xy`, `leg-${leg}-xy`, (r) => { const e = evsOf(r, leg); e[0].buttons = e[0].buttons === 0 ? 2 : 0; });
    add(`${leg}-dt`, `leg-${leg}-dt`, (r) => { const e = evsOf(r, leg); const d = e.find((x) => x.types !== null); if (d) d.items += 1; else Object.assign(e[0], { types: [], plain: '', custom: '', dropEffect: 'none', effectAllowed: 'none', items: 0 }); }, ['event-types']);
  } else {
    for (const k of ['seq', 'trusted', 'prevented', 'xy', 'dt']) add(`${leg}-${k}`, `leg-${leg}-${k}`, (r) => { insertAt(r, leg, {}); }, also(k));
  }
  add(`${leg}-state`, `leg-${leg}-state`, (r) => { r.legs[legIdx(r, leg)].stateAfter.dz += 'Z'; });
  add(`${leg}-state-drops`, `leg-${leg}-state`, (r) => { r.legs[legIdx(r, leg)].stateAfter.drops += 1; });
  add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = r.legs[legIdx(r, leg)]; l.cdpError = leg === 'bad-type' ? null : '{"code":-32000,"message":"x"}'; });
}
add('bad-type-error-other', 'leg-bad-type-error', (r) => { r.legs[legIdx(r, 'bad-type')].cdpError = '{"code":-32602,"message":"Invalid parameters"}'; });

// ---- MUST-ACCEPT (exit 0, no finding) ----
accept('accept-real-key-order', (r) => { const o = {}; for (const k of Object.keys(r).reverse()) o[k] = r[k]; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, o); });
accept('accept-prior-retimed-nonuniform', () => {}, { prior: (p) => { priorIds(p); jitter(p); return p; } });
accept('accept-prior-third-retimed', () => {}, { prior: (p) => { priorIds(p); p.events.forEach((e, i) => { if (i % 3 !== 0) { const d = (1 + ((i * 5) % 11)) * 0.2; e.ts = q(e.ts + d); e.at = q(e.at + d); } }); return p; } });
accept('accept-on-grid-exact-decimal', (r) => { r.events.forEach((e) => { e.ts = q(e.ts); e.at = q(e.at); }); });
accept('accept-mark-equal-event-at', (r) => { const e = evsOf(r, 'over-dz'); e[0].at = markAt(r, 'over-dz'); e[0].ts = e[0].at; });

const JOBS = Math.max(1, Number(opt('jobs') || 8));
const runCounter = (file, c = null) => new Promise((resolve) => {
  const o = (c && c.opts) || {};
  const extra = [];
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(o.prior(clone(real)))); extra.push('--prior', pf); }
  const p = spawn(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce,
    ...priorPaths.flatMap((x) => ['--prior', x]), ...extra, '--json'], { stdio: ['ignore', 'pipe', 'ignore'] });
  let so = ''; p.stdout.on('data', (x) => { so += x; });
  const timer = setTimeout(() => p.kill('SIGKILL'), 60000);
  p.on('close', (code) => { clearTimeout(timer); let j = null; try { j = JSON.parse(so); } catch {} resolve({ exit: code, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null }); });
});
const launderInto = async (r, f) => {
  const pre = await runCounter(f);
  if (pre.derived) { r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r)); }
};
const results = [];
const pos = await runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
const runCase = async (c) => {
  const r = clone(real);
  try { c.mutate(r); } catch (e) { return { case: c.name, class: c.accept ? 'must-accept' : 'refuse', expect: c.expect, error: 'mutation failed: ' + e.message, ok: false, isolated: false }; }
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) await launderInto(r, f);
  const o = await runCounter(f, c);
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  if (c.accept) return { case: c.name, class: 'must-accept', exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 0 && Array.isArray(o.findingIds) && ids.length === 0, extra: ids };
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  return { case: c.name, class: 'refuse', expect: c.expect, counterLine: lineOf(c.expect), alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra };
};
// --first-failure (kill-power mutant runs only): stop scheduling cases after the first case that is
// not as expected; the summary is then partial (stoppedEarly true) and never allOk.
const FIRST = argv.includes('--first-failure');
let stopped = FIRST && !positiveOk;
const caseResults = new Array(cases.length);
let nextCase = 0;
await Promise.all(Array.from({ length: JOBS }, async () => { while (nextCase < cases.length && !stopped) { const i = nextCase++; caseResults[i] = await runCase(cases[i]); if (FIRST && !caseResults[i].ok) stopped = true; } }));
results.push(...caseResults.filter(Boolean));
for (const lp of stopped ? [] : launderedPaths) {
  const d = JSON.parse(fs.readFileSync(lp, 'utf8'));
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  d.degenerate = null; d.predicate = true; d.dragHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  await launderInto(d, f);
  const o = await runCounter(f, { name: 'laundered-' + kind, opts: { nonce: d.nonce } });
  results.push({ case: 'laundered-' + kind, class: 'laundered', expect, counterLine: lineOf(expect), alsoAllowed: ['*'], exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect), extra: [] });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.filter((c) => !c.accept).map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const isolatedIds = new Set(results.filter((x) => x.class === 'refuse' && x.ok && x.isolated).map((x) => x.expect));
const failed = [...(positiveOk ? [] : ['(positive)']), ...(coverageGap.length ? ['(coverage-gap)'] : []), ...results.filter((x) => !x.ok).map((x) => x.case)];
const allOk = !stopped && results.length === cases.length + launderedPaths.length && positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-dragdrop-r75', real: realPath, positiveOk, stoppedEarly: stopped, cases: results.length,
  refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length, launderedCases: results.filter((x) => x.class === 'laundered').length,
  passed: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, idsWithIsolatedCase: isolatedIds.size,
  failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}, laundered ${summary.launderedCases}) isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);
