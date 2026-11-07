#!/usr/bin/env node
// Negative + must-accept battery for scripts/check-synthpinch-r73.mjs (tabi round 73, C1).
// Usage: node negatives-synthpinch-r73.mjs --real <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <the real receipt's expected nonce> --prior <receipt.json> [--prior ...]
//          --work <ABS scratch dir> [--laundered <degenerate receipt.json> ...] [--json]
// Generation r73 over r72: every counter call carries the pin, the expected nonce and the
// priors; the anchor cases are ABSOLUTE (r72 closure routed defect 1, QUALITY 135: the r72 case
// `in-wheel-anchor-2px` added +2 px to an honest x that jitters over {399, 400, 401}); replay
// cases for QUALITY 136 (byte-identical prior, nonce-and-stamps rewrite, one shared identifier
// at a time) and a must-accept prior whose three identifiers all differ.
// Every case mutates the real receipt and runs the counter BY PATH (the counter beside this file).
// Unless the case targets legshape-consistency / ratio-consistency, the producer's legShape and
// slowToTouchSpanRatio are then LAUNDERED (recomputed from the counter's own re-derivation) so
// those summary checks cannot fire on the mutation's behalf.
// ISOLATION (r70 R3): a refusal case passes only when the counter exits 1, lists the expected id,
// and lists NO other id except those the case names in `alsoAllowed`.
// MUST-ACCEPT class (r71 R1 / R71Mut1 section 6): receipts the counter MUST exit 0 on with no
// finding (honest variants at the edge of a law: equal consecutive touch spans and a 2.0 ratio,
// tolerance-edge deltas and scales, key order, no runaway after close). A stricter-than-frozen
// counter fails these.
// SOURCE LOCATION: every result names the counter line of the check it expects
// (`counterLine`, the line of `check('<id>'`), so a polarity or law negative is tied to the exact
// source location it pins (tabi r63 prerequisite).
// Coverage: every check id the counter declares must be the expected id of >= 1 refusal case.
// Laundered degenerate receipts (control receipts relabelled as clean scored runs) must be
// refused for their expected id; co-firing ids are allowed there.
// Exit 0 = all cases as expected and full coverage; 1 = otherwise; 2 = usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COUNTER = path.join(HERE, 'check-synthpinch-r73.mjs');
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const usage = (d) => { console.error(JSON.stringify({ error: 'usage', detail: d })); process.exit(2); };
const realPath = opt('real'); const pin = opt('expect-driver-sha256'); const work = opt('work'); const expectNonce = opt('expect-nonce');
const priorPaths = multi('prior');
if (!realPath || !pin || !work || !path.isAbsolute(work) || !expectNonce || priorPaths.length === 0) usage('--real, --expect-driver-sha256, --expect-nonce, >= 1 --prior and an absolute --work are required');
let real;
try { real = JSON.parse(fs.readFileSync(realPath, 'utf8')); } catch (e) { usage('real receipt unreadable: ' + e.message); }
fs.mkdirSync(work, { recursive: true });
const counterSrc = fs.readFileSync(COUNTER, 'utf8').split('\n');
const lineOf = (id) => { const i = counterSrc.findIndex((l) => l.includes(`check('${id}'`) || (id.startsWith('leg-') && l.includes('check(`leg-${name}-' + id.split('-').slice(2).join('-') + '`'))); return i >= 0 ? i + 1 : null; };
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const LEGS = ['start', 'in', 'out', 'clamp', 'unit', 'default', 'touch', 'slow', 'pen', 'outside', 'zero'];
const WHEEL_LEGS = new Set(['in', 'out', 'clamp', 'default', 'zero']);
const TOUCH_LEGS = new Set(['touch', 'slow']);
const ERROR_LEGS = new Set(['pen', 'outside', 'zero']);
const TIMED = new Set(['in', 'out', 'clamp', 'default', 'touch', 'slow', 'zero']);
const evsOf = (r, leg, pred = () => true) => r.events.filter((e) => e.leg === leg && pred(e));
const legIdx = (r, leg) => r.legs.findIndex((l) => l.name === leg);
const markAt = (r, leg) => r.legMarks[LEGS.indexOf(leg) + 1].at;
const insertAt = (r, leg, ev) => {
  // insert after the last event at or before `leg`, inside that leg's page-time window, with
  // strict types and an in-range scale, so only the law the case targets can fire
  let idx = -1; const order = LEGS.indexOf(leg);
  r.events.forEach((e, i) => { if (LEGS.indexOf(e.leg) <= order) idx = i; });
  const prev = idx >= 0 ? r.events[idx] : null;
  const at = Math.max(prev ? prev.at : 0, markAt(r, leg)) + 0.001;
  const ts = prev ? prev.ts : 1;
  const sc = r.legs[legIdx(r, leg)].scaleAfter.page;
  r.events.splice(idx + 1, 0, { type: 'pointerdown', seq: 0, leg, ts, at, isTrusted: true, pointerType: 'mouse', ctrlKey: false, deltaY: null, deltaMode: null, clientX: 400, clientY: 300, touches: null, changed: null, scale: sc, target: 'pad', ...ev });
  return renumber(r);
};
const cases = [];
// opts (r73): prior(real) -> an extra --prior receipt object written beside the case; priorReal:
// pass the unmutated real receipt itself as an extra --prior; nonce: the --expect-nonce for the case.
const add = (name, expect, mutate, alsoAllowed = [], launder = true, opts = {}) => cases.push({ name, expect, mutate, alsoAllowed, launder, accept: false, opts });
const accept = (name, mutate, opts = {}) => cases.push({ name, expect: null, mutate, alsoAllowed: [], launder: true, accept: true, opts });
const pushSend = (r, method, params) => { r.cdpSendLog.push({ id: r.cdpSendLog.length + 1, method, params }); };

// ---- global checks (r71 cases, ported) ----
add('schema', 'schema', (r) => { r.schema = 'tabi-chrome-cdp-synthpinch-r72'; });
const rewriteNonce = (r, to) => {
  const old = r.nonce; r.nonce = to; r.nonceOnPage = r.nonce; r.serverLog.forEach((s) => { s.run = r.nonce; });
  for (const c of r.cdpSendLog) { if (c.method === 'Page.navigate') c.params.url = c.params.url.replace(encodeURIComponent(old), encodeURIComponent(r.nonce)); if (c.method === 'Runtime.evaluate') c.params.expression = c.params.expression.replace(JSON.stringify(old), JSON.stringify(r.nonce)); }
};
add('nonce-shape', 'nonce-shape', (r) => { rewriteNonce(r, 'TABI-r73-x'); }, ['nonce-expected']);
add('nonce-on-page', 'nonce-on-page', (r) => { r.nonceOnPage = 'tabi-r73-other'; });
add('scored-run-not-degenerate', 'scored-run-not-degenerate', (r) => { r.degenerate = 'set-scale'; });
add('degenerate-field-absent', 'scored-run-not-degenerate', (r) => { delete r.degenerate; });
add('server-log-binding', 'server-log-binding', (r) => { r.serverLog.forEach((s) => { s.run = 'tabi-r73-other'; }); });
add('driver-pin', 'driver-pin', (r) => { r.driverSha256 = '0'.repeat(64); });
add('host-chromium', 'host-chromium', (r) => { r.host.chromium = 'Firefox 140.0'; });
add('devtools-port-binding', 'devtools-port-binding', (r) => { r.host.devtoolsListening.port += 1; });
add('devtools-stderr-absent', 'devtools-port-binding', (r) => { r.host.stderrHead = ''; });
add('run-window-short', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 5000).toISOString(); });
add('run-window-long', 'run-window', (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 700000).toISOString(); });
add('plan-frozen', 'plan-frozen', (r) => { r.plan[1].params.scaleFactor = 3; });
add('leg-order', 'leg-order', (r) => { [r.legs[1].name, r.legs[2].name] = [r.legs[2].name, r.legs[1].name]; }, ['leg-params', 'leg-in-scale', 'leg-out-scale', 'scale-agreement', 'leg-in-wheels', 'leg-out-wheels', 'event-scale', 'wheel-delta-law']);
add('leg-order-duplicate-entry', 'leg-order', (r) => { r.legs.push(clone(r.legs[1])); }, ['leg-params']);
add('seq-monotonic', 'seq-monotonic', (r) => { r.events[3].seq = 999; });
add('seq-duplicate-event', 'seq-monotonic', (r) => { const e = evsOf(r, 'touch', (x) => x.type === 'touchmove')[2]; r.events.splice(r.events.indexOf(e) + 1, 0, clone(e)); }, ['leg-touch-timing', 'touch-geometry']);
add('event-leg-domain', 'event-leg-domain', (r) => { r.events[r.events.length - 1].leg = 'end'; }, ['event-leg-window', 'event-scale']);
add('event-leg-fabricated-label', 'event-leg-domain', (r) => { evsOf(r, 'zero')[5].leg = 'zero2'; }, ['event-leg-window', 'event-scale']);
// ---- r72 strict types (R71Review1 F3) ----
add('event-types-changed-string', 'event-types', (r) => { const e = evsOf(r, 'touch', (x) => x.type === 'touchmove')[1]; e.changed = e.changed.map((p) => p.map(String)); });
add('event-types-ts-negative-shift', 'event-types', (r) => { const m = Math.max(...r.events.map((e) => e.ts)) + 10; r.events.forEach((e) => { e.ts -= m; }); });
add('event-types-ts-string', 'event-types', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[3].ts = String(evsOf(r, 'in', (e) => e.type === 'wheel')[3].ts); });
add('event-types-deltaY-string-in', 'event-types', (r) => { for (const e of evsOf(r, 'in', (x) => x.type === 'wheel')) e.deltaY = String(e.deltaY); }, ['leg-in-wheels', 'wheel-delta-law']);
add('event-types-unknown-type', 'event-types', (r) => { evsOf(r, 'touch', (x) => x.type === 'pointermove')[0].type = 'pointerMove'; }, ['leg-touch-seq', 'leg-touch-timing']);
add('event-types-trusted-string', 'event-types', (r) => { evsOf(r, 'slow', (x) => x.type === 'touchmove')[0].isTrusted = 'true'; }, ['leg-slow-trusted']);
// ---- r72 leg marks / windows (R71Review1 F4; r71 closure R1) ----
add('leg-marks-late-negative', 'leg-marks', (r) => { r.lateAfterClose = -1; }, ['event-leg-window']);
add('leg-marks-fabricated-name', 'leg-marks', (r) => { r.legMarks[3].name = 'out2'; }, ['event-leg-window']);
add('leg-marks-closed-early', 'leg-marks', (r) => { r.closedAt = r.legMarks[r.legMarks.length - 1].at - 1; }, ['event-leg-window']);
add('event-leg-window-late-label', 'event-leg-window', (r) => { const w = evsOf(r, 'in', (e) => e.type === 'wheel'); w[w.length - 1].at = markAt(r, 'out') + 0.0005; });
add('event-leg-window-relabel-fitted', 'event-leg-window', (r) => { const w = evsOf(r, 'default', (e) => e.type === 'wheel'); w[0].at = markAt(r, 'default') - 0.5; });
add('event-leg-window-order', 'event-leg-window', (r) => { const w = evsOf(r, 'zero', (e) => e.type === 'wheel'); w[10].at = w[9].at - 0.001; });
// ---- producer: pinch calls and the closed send-log allow-list (R71Review1 F1; R71Mut1 m09-m14, m42) ----
add('pinch-call-count', 'pinch-call-count', (r) => { const i = r.cdpSendLog.findIndex((c) => c.method === 'Input.synthesizePinchGesture'); r.cdpSendLog.splice(i, 1); r.cdpSendLog.forEach((c, k) => { c.id = k + 1; }); }, ['pinch-call-params']);
add('pinch-call-duplicate', 'pinch-call-count', (r) => { pushSend(r, 'Input.synthesizePinchGesture', clone(r.cdpSendLog.find((c) => c.method === 'Input.synthesizePinchGesture').params)); }, ['pinch-call-params']);
add('pinch-call-params', 'pinch-call-params', (r) => { r.cdpSendLog.filter((x) => x.method === 'Input.synthesizePinchGesture')[0].params.relativeSpeed = 400; });
add('pinch-method-suffix', 'pinch-call-count', (r) => { r.cdpSendLog.filter((x) => x.method === 'Input.synthesizePinchGesture')[2].method = 'Input.synthesizePinchGestureX'; }, ['pinch-call-params', 'send-log-allowlist']);
const LOOK = [
  ['dispatch-wheel', 'Input.dispatchMouseEvent', { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: -5, modifiers: 2 }],
  ['dispatch-touch', 'Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 400, y: 300 }] }],
  ['case-variant', 'input.dispatchMouseEvent', { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: -5, modifiers: 2 }],
  ['set-scale', 'Emulation.setPageScaleFactor', { pageScaleFactor: 2 }],
  ['touch-emulation', 'Emulation.setTouchEmulationEnabled', { enabled: true }],
  ['emulate-touch-mouse', 'Input.emulateTouchFromMouseEvent', { type: 'mousePressed', x: 400, y: 300, button: 'left', modifiers: 2 }],
  ['emit-touch-for-mouse', 'Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' }],
  ['scrollbars-hidden', 'Emulation.setScrollbarsHidden', { hidden: true }],
  ['ignore-input', 'Input.setIgnoreInputEvents', { ignore: true }],
  ['other-gesture', 'Input.synthesizeScrollGesture', { x: 400, y: 300, yDistance: -100 }],
  ['dmo-extra', 'Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false, scale: 1.5 }],
  ['script-wheel', 'Runtime.evaluate', { expression: 'document.dispatchEvent(new WheelEvent("wheel",{ctrlKey:true,deltaY:-5}))', returnByValue: true }],
  ['script-log', 'Runtime.evaluate', { expression: 'window.__events.push({type:"wheel"})', returnByValue: true }],
  ['bracket-push', 'Runtime.evaluate', { expression: 'window["__events"]["push"]({type:"wheel",ctrlKey:true,deltaY:-120})', returnByValue: true }],
  ['css-zoom', 'Runtime.evaluate', { expression: 'document.documentElement.style.zoom = "2"', returnByValue: true }],
  ['events-assign', 'Runtime.evaluate', { expression: 'window.__events = [];', returnByValue: true }],
  ['visualviewport-assign', 'Runtime.evaluate', { expression: 'window.visualViewport = null;', returnByValue: true }],
  ['call-function-on', 'Runtime.callFunctionOn', { functionDeclaration: 'function(){document.dispatchEvent(new WheelEvent("wheel",{deltaY:-5}))}' }],
];
for (const [n, m, p] of LOOK) add('lookalike-' + n, 'send-log-allowlist', (r) => { pushSend(r, m, p); });
add('allowlist-dmo-scale-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Emulation.setDeviceMetricsOverride').params.scale = 2; });
add('allowlist-eval-extra-param', 'send-log-allowlist', (r) => { r.cdpSendLog.find((x) => x.method === 'Runtime.evaluate').params.awaitPromise = true; });
add('allowlist-navigate-other-run', 'send-log-allowlist', (r) => { const c = r.cdpSendLog.find((x) => x.method === 'Page.navigate'); c.params.url = c.params.url.replace('?run=', '?run=x'); });
add('allowlist-navigate-twice', 'send-log-allowlist', (r) => { pushSend(r, 'Page.navigate', clone(r.cdpSendLog.find((x) => x.method === 'Page.navigate').params)); });
add('allowlist-id-gap', 'send-log-allowlist', (r) => { r.cdpSendLog[5].id += 100; });
add('allowlist-params-absent', 'send-log-allowlist', (r) => { delete r.cdpSendLog.find((x) => x.method === 'Page.enable').params; });
add('teardown-closure', 'teardown-closure', (r) => { r.teardown.survivors = [4242]; });
add('teardown-sweep-count', 'teardown-closure', (r) => { r.teardown.postKillSweepCount = 1; });
add('failures-empty', 'failures-empty', (r) => { r.failures.push({ id: 'drive-error', detail: 'x' }); });
// ---- producer-verdict polarity (r62 M5 / R71Mut1 m36-m37): every non-(true, 'CONFIRMED') pair ----
const POL = [['false-CONFIRMED', false, 'CONFIRMED'], ['true-REFUTED', true, 'REFUTED'], ['false-REFUTED', false, 'REFUTED'], ['null-CONFIRMED', null, 'CONFIRMED'],
  ['string-true', 'true', 'CONFIRMED'], ['one', 1, 'CONFIRMED'], ['true-UNKNOWN', true, 'UNKNOWN'], ['true-lowercase', true, 'confirmed'], ['true-UNMEASURED', true, 'UNMEASURED'], ['true-null', true, null]];
for (const [n, p, h] of POL) add('producer-verdict-' + n, 'producer-verdict', (r) => { r.predicate = p; r.synthPinchHypothesis = h; });
add('legshape-consistency', 'legshape-consistency', (r) => { r.legShape.in.total += 1; }, [], false);
add('legshape-fabricated-leg', 'legshape-consistency', (r) => { r.legShape.extra = r.legShape.in; }, [], false);
add('ratio-consistency', 'ratio-consistency', (r) => { r.slowToTouchSpanRatio = +(r.slowToTouchSpanRatio + 1).toFixed(2); }, [], 'shape-only');
// ---- leg params (R71Critic: unread legs[].params / elapsedMs) ----
add('leg-params-scale', 'leg-params', (r) => { r.legs[1].params.scaleFactor = 3; });
add('leg-params-zero-short', 'leg-params', (r) => { r.legs[legIdx(r, 'zero')].elapsedMs = 100; });
add('leg-params-elapsed-string', 'leg-params', (r) => { r.legs[2].elapsedMs = '1000'; });
add('leg-params-start-skipped', 'leg-params', (r) => { r.legs[0].skipped = true; }, ['leg-start-error']);
// ---- scale anchoring (R71Review1 F2) ----
add('initial-scale-7', 'initial-scale', (r) => { r.legs[0].scaleBefore = { page: 7, cdp: 7 }; });
add('scale-agreement-cdp', 'scale-agreement', (r) => { r.legs[3].scaleBefore.cdp += 0.5; });
add('scale-agreement-chain', 'scale-agreement', (r) => { r.legs[6].scaleBefore.page += 0.5; r.legs[6].scaleBefore.cdp += 0.5; }, ['event-scale']);
add('scale-agreement-late-leg', 'scale-agreement', (r) => { r.legs[9].scaleBefore.cdp += 0.5; });
add('event-scale-touch', 'event-scale', (r) => { evsOf(r, 'touch', (e) => e.type === 'touchmove')[2].scale = 1.7; });
add('event-scale-zero', 'event-scale', (r) => { evsOf(r, 'zero', (e) => e.type === 'wheel')[0].scale = 1.6; });
add('wheel-anchor', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 405; });
add('in-wheel-anchor-abs-402', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 402; });
add('in-wheel-anchor-abs-398', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 398; });
add('default-wheel-anchor-abs-y302', 'wheel-anchor', (r) => { evsOf(r, 'default', (e) => e.type === 'wheel')[0].clientY = 302; });
add('wheel-anchor-clamp-exact', 'wheel-anchor', (r) => { evsOf(r, 'clamp', (e) => e.type === 'wheel')[2].clientY += 1; });
// ---- r73 replay refusal (QUALITY 136; R72Critic zeroedit / forged-a; R72Review1 FG1) ----
const REPLAY = ['replay-launch-token', 'replay-devtools-url', 'replay-event-timeline'];
const otherUuid = (u) => u.slice(0, -1) + (u.endsWith('0') ? '1' : '0');
const swapUrl = (x) => { const d = x.host.devtoolsListening; const id = d.url.split('/devtools/browser/')[1]; const nu = otherUuid(id); x.host.stderrHead = x.host.stderrHead.split(id).join(nu); d.url = d.url.replace(id, nu); if (typeof d.browserId === 'string') d.browserId = nu; };
const swapToken = (x) => { x.host.launchToken = x.host.launchToken.slice(0, -1) + (x.host.launchToken.endsWith('0') ? '1' : '0'); };
const shiftTs = (x) => { x.events.forEach((e) => { e.ts += 0.5; }); };
add('nonce-expected', 'nonce-expected', () => {}, [], true, { nonce: 'tabi-r73-other' });
add('replay-byte-identical', 'replay-launch-token', () => {}, REPLAY, true, { priorReal: true });
add('replay-nonce-stamps-rewritten', 'replay-launch-token', (r) => {
  rewriteNonce(r, 'tabi-r73-replay-x');
  for (const k of ['startedAt', 'finishedAt']) r[k] = new Date(Date.parse(r[k]) + 3600000).toISOString();
}, REPLAY, true, { priorReal: true, nonce: 'tabi-r73-replay-x' });
add('replay-token-only-shared', 'replay-launch-token', () => {}, [], true, { prior: (p) => { swapUrl(p); shiftTs(p); return p; } });
add('replay-url-only-shared', 'replay-devtools-url', () => {}, [], true, { prior: (p) => { swapToken(p); shiftTs(p); return p; } });
add('replay-timeline-only-shared', 'replay-event-timeline', () => {}, [], true, { prior: (p) => { swapToken(p); swapUrl(p); return p; } });
add('replay-launch-token-shape', 'replay-launch-token', (r) => { r.host.launchToken = 'x'; });
add('zero-delta-nonzero', 'wheel-delta-law', (r) => { evsOf(r, 'zero', (e) => e.type === 'wheel')[3].deltaY = 5; }, ['leg-zero-wheels']);
add('clamp-delta-off-0.8', 'wheel-delta-law', (r) => { const w = evsOf(r, 'clamp', (e) => e.type === 'wheel'); w[w.length - 1].deltaY += 0.8; });
add('in-tiny-deltas', 'wheel-delta-law', (r) => { for (const e of evsOf(r, 'in', (x) => x.type === 'wheel')) e.deltaY = -0.01; });
add('out-delta-off-0.8', 'wheel-delta-law', (r) => { const w = evsOf(r, 'out', (e) => e.type === 'wheel'); w[0].deltaY += 0.8 / w[0].scale; });
add('default-delta-off-0.8', 'wheel-delta-law', (r) => { const w = evsOf(r, 'default', (e) => e.type === 'wheel'); w[0].deltaY -= 0.8 / w[0].scale; });
add('wheel-delta-law', 'wheel-delta-law', (r) => { evsOf(r, 'clamp', (e) => e.type === 'wheel')[0].deltaY *= 2; });
add('touch-geometry-x', 'touch-geometry', (r) => { evsOf(r, 'touch', (e) => e.type === 'touchmove')[1].touches[0][0] += 3; });
add('touch-geometry-shrink', 'touch-geometry', (r) => { const t = evsOf(r, 'slow', (e) => e.type === 'touchmove'); const a = t[3].touches; t[4].touches = [[a[0][0], a[0][1] + 1], [a[1][0], a[1][1] - 1]]; });
add('touch-single-point-move', 'touch-geometry', (r) => { const t = evsOf(r, 'touch', (e) => e.type === 'touchmove'); t[3].touches = [[t[3].touches[0][0], t[3].touches[0][1]]]; });
add('touch-three-point-move', 'touch-geometry', (r) => { const t = evsOf(r, 'touch', (e) => e.type === 'touchmove'); t[3].touches = [...t[3].touches, [t[3].touches[0][0], 300]]; });
add('touch-ratio-under-2', 'touch-geometry', (r) => { const t = evsOf(r, 'touch', (e) => e.type === 'touchmove'); const x = t[0].touches[0][0]; const s0 = Math.abs(t[0].touches[1][1] - t[0].touches[0][1]); const last = t[t.length - 1]; last.touches = [[x, 300 - s0 * 0.99], [x, 300 + s0 * 0.99]]; });
add('slow-ratio', 'slow-ratio', (r) => { const t = evsOf(r, 'slow', (e) => e.type === 'touchend'); t[t.length - 1].ts += 3000; });
add('slow-ratio-low-2x', 'slow-ratio', (r) => { const s = evsOf(r, 'slow', (e) => /^touch/.test(e.type)); const b = evsOf(r, 'touch', (e) => /^touch/.test(e.type)); const tspan = b[b.length - 1].ts - b[0].ts; s[s.length - 1].ts = s[0].ts + tspan * 2; });
// ---- per-leg checks ----
for (const leg of LEGS) {
  const wheelLeg = WHEEL_LEGS.has(leg); const touchLeg = TOUCH_LEGS.has(leg);
  if (touchLeg) add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { const ups = evsOf(r, leg, (e) => e.type === 'pointerup'); r.events.splice(r.events.indexOf(ups[ups.length - 1]), 1); renumber(r); });
  else add(`${leg}-seq`, `leg-${leg}-seq`, (r) => { insertAt(r, leg, { type: 'pointerdown', pointerType: 'mouse' }); });
  if (wheelLeg || touchLeg) add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { evsOf(r, leg)[1].isTrusted = false; });
  else add(`${leg}-trusted`, `leg-${leg}-trusted`, (r) => { insertAt(r, leg, { type: 'pointerup', isTrusted: false }); }, [`leg-${leg}-seq`]);
  if (wheelLeg) add(`${leg}-wheels-ctrl`, `leg-${leg}-wheels`, (r) => { evsOf(r, leg, (e) => e.type === 'wheel')[1].ctrlKey = false; });
  else add(`${leg}-wheels-extra`, `leg-${leg}-wheels`, (r) => { insertAt(r, leg, { type: 'wheel', pointerType: null, ctrlKey: true, deltaY: -3, deltaMode: 0, clientX: 400, clientY: 300 }); });
  if (wheelLeg && leg !== 'zero') add(`${leg}-wheels-sign`, `leg-${leg}-wheels`, (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); w[w.length - 1].deltaY = -w[w.length - 1].deltaY; }, ['wheel-delta-law']);
  if (wheelLeg) add(`${leg}-wheel-delta-mode`, `leg-${leg}-wheels`, (r) => { evsOf(r, leg, (e) => e.type === 'wheel')[0].deltaMode = 1; });
  add(`${leg}-scale`, `leg-${leg}-scale`, (r) => {
    const i = legIdx(r, leg);
    r.legs[i].scaleAfter.page += 0.5; r.legs[i].scaleAfter.cdp += 0.5;
    if (r.legs[i + 1]) { r.legs[i + 1].scaleBefore.page += 0.5; r.legs[i + 1].scaleBefore.cdp += 0.5; }
  }, ['event-scale']);
  add(`${leg}-scale-off-tolerance`, `leg-${leg}-scale`, (r) => {
    const i = legIdx(r, leg);
    r.legs[i].scaleAfter.page += 0.05; r.legs[i].scaleAfter.cdp += 0.05;
    if (r.legs[i + 1]) { r.legs[i + 1].scaleBefore.page += 0.05; r.legs[i + 1].scaleBefore.cdp += 0.05; }
  }, ['event-scale']);
  add(`${leg}-scale-page-only`, `leg-${leg}-scale`, (r) => { r.legs[legIdx(r, leg)].scaleAfter.cdp += 0.5; }, ['scale-agreement', 'event-scale']);
  if (TIMED.has(leg)) {
    if (touchLeg) add(`${leg}-timing`, `leg-${leg}-timing`, (r) => { const t = evsOf(r, leg, (e) => e.type === 'touchmove'); for (const e of t.slice(1, -1)) r.events.splice(r.events.indexOf(e), 1); renumber(r); });
    else if (leg === 'zero') add('zero-timing', 'leg-zero-timing', (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); for (const e of w.slice(1)) e.ts = w[0].ts + 100; });
    else {
      add(`${leg}-timing`, `leg-${leg}-timing`, (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); w[w.length - 1].ts += 1000; });
      add(`${leg}-timing-short`, `leg-${leg}-timing`, (r) => { const w = evsOf(r, leg, (e) => e.type === 'wheel'); const t0 = w[0].ts; w.forEach((e, k) => { e.ts = t0 + k * 0.001; }); });
    }
  }
  add(`${leg}-error`, `leg-${leg}-error`, (r) => { const l = r.legs.find((x) => x.name === leg); l.cdpError = ERROR_LEGS.has(leg) ? null : '{"code":-32000,"message":"Synthetic pinch failed, result was 2"}'; });
  if (touchLeg || ERROR_LEGS.has(leg)) add(`${leg}-skipped`, `leg-${leg}-error`, (r) => { r.legs.find((x) => x.name === leg).skipped = true; }, ['leg-params']);
}
add('touch-pointer-type-pen', 'leg-touch-seq', (r) => { evsOf(r, 'touch', (e) => e.type === 'pointermove')[0].pointerType = 'pen'; });
add('in-wheels-count-3', 'leg-in-wheels', (r) => { const w = evsOf(r, 'in', (e) => e.type === 'wheel'); const s = w.slice(2, -1).reduce((a, e) => a + e.deltaY * e.scale, 0); w[1].deltaY += s / w[1].scale; for (const e of w.slice(2, -1)) r.events.splice(r.events.indexOf(e), 1); renumber(r); });
add('zero-wheels-count-3', 'leg-zero-wheels', (r) => { const w = evsOf(r, 'zero', (e) => e.type === 'wheel'); for (const e of w.slice(2, -1)) r.events.splice(r.events.indexOf(e), 1); renumber(r); });
add('default-wheels-count-2', 'leg-default-wheels', (r) => { const w = evsOf(r, 'default', (e) => e.type === 'wheel'); const s = w.slice(1, -1).reduce((a, e) => a + e.deltaY * e.scale, 0); w[0].deltaY += s / w[0].scale; for (const e of w.slice(1, -1)) r.events.splice(r.events.indexOf(e), 1); renumber(r); });

// ---- MUST-ACCEPT (exit 0, no finding) ----
accept('accept-real-key-order', (r) => { const o = {}; for (const k of Object.keys(r).reverse()) o[k] = r[k]; for (const k of Object.keys(r)) delete r[k]; Object.assign(r, o); });
accept('accept-no-late-events', (r) => { r.lateAfterClose = 0; });
accept('accept-equal-touch-spans-ratio-2', (r) => {
  // honest edge of touch-geometry: non-decreasing spans with an equal consecutive pair and a
  // final/first ratio of exactly 2.0, two points on one vertical line
  const t = evsOf(r, 'touch', (e) => e.type === 'touchmove'); const x = t[0].touches[0][0]; const n = t.length;
  t.forEach((e, k) => { const s = k === 0 ? 100 : k === n - 1 ? 200 : 100 + Math.floor((k * 100) / (n - 1)); e.touches = [[x, 300 - s / 2], [x, 300 + s / 2]]; e.changed = e.touches.map((p) => [...p]); });
  t[1].touches = t[0].touches.map((p) => [...p]); t[1].changed = t[1].touches.map((p) => [...p]);
});
accept('accept-clamp-delta-edge-0.4', (r) => { const w = evsOf(r, 'clamp', (e) => e.type === 'wheel'); w[w.length - 1].deltaY += 0.4; });
accept('accept-in-anchor-abs-401', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 401; });
accept('accept-prior-all-identifiers-differ', () => {}, { prior: (p) => { swapToken(p); swapUrl(p); shiftTs(p); return p; } });
accept('accept-zero-scale-edge', (r) => { const l = r.legs[legIdx(r, 'zero')]; l.scaleAfter.page += 0.009; l.scaleAfter.cdp += 0.009; });
accept('accept-extra-layout-metrics', (r) => { pushSend(r, 'Page.getLayoutMetrics', {}); });
accept('accept-mark-equal-event-at', (r) => { const w = evsOf(r, 'out', (e) => e.type === 'wheel'); w[0].at = markAt(r, 'out'); });

const runCounter = (file, c = null) => {
  const o = (c && c.opts) || {};
  const extra = [];
  if (o.priorReal) extra.push('--prior', realPath);
  if (o.prior) { const pf = path.join(work, 'prior-' + c.name + '.json'); fs.writeFileSync(pf, JSON.stringify(o.prior(clone(real)))); extra.push('--prior', pf); }
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', pin, '--expect-nonce', o.nonce || expectNonce,
    ...priorPaths.flatMap((x) => ['--prior', x]), ...extra, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, findingIds: j ? j.findings.map((f) => f.id) : null, derived: j ? j.derived : null };
};
const launderInto = (r, f, mode) => {
  const pre = runCounter(f);
  if (pre.derived) {
    if (mode !== 'shape-only') { const d = pre.derived; const rt = d.touch.touchSpanMs > 0 && d.slow.touchSpanMs !== null ? +(d.slow.touchSpanMs / d.touch.touchSpanMs).toFixed(2) : null; r.slowToTouchSpanRatio = rt; }
    r.legShape = pre.derived; fs.writeFileSync(f, JSON.stringify(r));
  }
};
const results = [];
const pos = runCounter(realPath);
const positiveOk = pos.exit === 0 && Array.isArray(pos.findingIds) && pos.findingIds.length === 0;
for (const c of cases) {
  const r = clone(real); c.mutate(r);
  const f = path.join(work, (c.accept ? 'acc-' : 'neg-') + c.name + '.json');
  fs.writeFileSync(f, JSON.stringify(r));
  if (c.launder) launderInto(r, f, c.launder);
  const o = runCounter(f, c);
  const ids = Array.isArray(o.findingIds) ? o.findingIds : [];
  if (c.accept) { results.push({ case: c.name, class: 'must-accept', exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 0 && Array.isArray(o.findingIds) && ids.length === 0, extra: ids }); continue; }
  const extra = ids.filter((id) => id !== c.expect && !c.alsoAllowed.includes(id));
  results.push({ case: c.name, class: 'refuse', expect: c.expect, counterLine: lineOf(c.expect), alsoAllowed: c.alsoAllowed, exit: o.exit, findingIds: o.findingIds, isolated: ids.length === 1 && ids[0] === c.expect, ok: o.exit === 1 && ids.includes(c.expect) && extra.length === 0, extra });
}
const LAUNDER_EXPECT = { 'dispatch-wheel': 'send-log-allowlist', 'set-scale': 'send-log-allowlist', 'skip-touch': 'pinch-call-count' };
for (const lp of multi('laundered')) {
  let d; try { d = JSON.parse(fs.readFileSync(lp, 'utf8')); } catch (e) { usage('laundered receipt unreadable: ' + lp); }
  const kind = d.degenerate; const expect = LAUNDER_EXPECT[kind];
  if (!expect) usage('laundered receipt has no known degenerate kind: ' + lp);
  d.degenerate = null; d.predicate = true; d.synthPinchHypothesis = 'CONFIRMED'; d.failures = []; d.driverSha256 = pin;
  const f = path.join(work, 'laundered-' + kind + '.json');
  fs.writeFileSync(f, JSON.stringify(d));
  launderInto(d, f, true);
  const o = runCounter(f);
  results.push({ case: 'laundered-' + kind, class: 'laundered', expect, counterLine: lineOf(expect), alsoAllowed: ['*'], exit: o.exit, findingIds: o.findingIds, isolated: false, ok: o.exit === 1 && Array.isArray(o.findingIds) && o.findingIds.includes(expect), extra: [] });
}
const listed = JSON.parse(spawnSync(process.execPath, [COUNTER, '--list-checks'], { encoding: 'utf8' }).stdout);
const covered = new Set(cases.filter((c) => !c.accept).map((c) => c.expect));
const coverageGap = listed.filter((id) => !covered.has(id));
const isolatedIds = new Set(results.filter((x) => x.class === 'refuse' && x.ok && x.isolated).map((x) => x.expect));
const failed = results.filter((x) => !x.ok).map((x) => x.case);
const allOk = positiveOk && failed.length === 0 && coverageGap.length === 0;
const summary = { schema: 'tabi-negatives-synthpinch-r73', real: realPath, positiveOk, cases: results.length,
  refuseCases: results.filter((x) => x.class === 'refuse').length, mustAcceptCases: results.filter((x) => x.class === 'must-accept').length, launderedCases: results.filter((x) => x.class === 'laundered').length,
  passed: results.filter((x) => x.ok).length, isolatedCases: results.filter((x) => x.isolated).length, idsWithIsolatedCase: isolatedIds.size,
  failed, checkIds: listed.length, coverageGap, allOk, results };
console.log(argv.includes('--json') ? JSON.stringify(summary, null, 1) : `negatives ${summary.passed}/${summary.cases} (refuse ${summary.refuseCases}, must-accept ${summary.mustAcceptCases}, laundered ${summary.launderedCases}) isolated=${summary.isolatedCases} positiveOk=${positiveOk} coverageGap=${coverageGap.length} failed=${failed.join(',') || 'none'}`);
process.exit(allOk ? 0 : 1);
