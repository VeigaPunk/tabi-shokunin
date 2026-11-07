#!/usr/bin/env node
// Counter for tabi round 73 C1 (capability `chromium-synth-pinch-gesture-linux`, generation r73).
// Usage: node check-synthpinch-r73.mjs --receipt <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <tabi-r73-...> --prior <receipt.json> [--prior <receipt.json> ...] [--json]
//        node check-synthpinch-r73.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the page-side leg marks, the per-leg page/CDP scale readings and the driver's CDP send log;
// the producer's own verdict (predicate true AND synthPinchHypothesis CONFIRMED, strict
// booleans/strings) and its legShape summary must ALSO agree with the re-derivation.
// Generation r72 over r71 (r71 closure R1; R71Review1 F1-F6; R71Mut1 section 7; R71Critic):
//  - send-log-allowlist replaces the r71 look-alike deny-list: every CDP send must be one of the
//    driver's own calls with its exact params (Runtime.evaluate expressions from a closed set);
//    case variants, bracket-access log writes, CSS zoom, setDeviceMetricsOverride scale,
//    setIgnoreInputEvents and any unknown method are findings.
//  - event-types: strict JSON types for every event field the laws read (no string coercion).
//  - leg-marks / event-leg-window: page-side leg marks (performance.now at each __setLeg) bind
//    every event's handler time `at` to the window of the leg it is labelled with; the record is
//    closed in one synchronous call (closedAt), which is the zero leg's window end.
//  - initial-scale and event-scale: the run starts at page scale 1; every event's recorded
//    scale lies inside its leg's [before, after] scale range.
//  - wheel-delta-law: sum(deltaY * scale) = -100 ln(scaleFactor) on in/out/clamp/default
//    (+-0.5), zero-leg wheels all deltaY 0.
//  - leg-params: each leg entry carries exactly the frozen params, skipped false, numeric
//    elapsedMs; the zero leg waited >= its 4 s bound.
//  - ratio-consistency: the producer's slowToTouchSpanRatio equals the re-derived ratio.
// Generation r73 over r72 (r72 closure routed defects 1-2; QUALITY 136; R72Review1 FG1, FG5;
// R72Critic zeroedit / forged-a):
//  - --expect-driver-sha256, --expect-nonce and at least one --prior are REQUIRED (exit 2
//    otherwise): the driver pin and the run's nonce are no longer optional or self-asserted.
//  - nonce-expected: the receipt's nonce equals --expect-nonce (a replayed receipt carries the
//    nonce of the run that made it).
//  - replay-launch-token / replay-devtools-url / replay-event-timeline: the receipt shares none
//    of three per-run identifiers with any --prior receipt: the driver's random launch token
//    (12 hex), Chromium's DevTools browser URL (its per-launch browser id) and the sha256 of the
//    page-side event timeline (every event's ts and at, in order). A byte-identical replay of a
//    prior receipt, and one with only its nonce and wall-clock stamps rewritten, keep all three.
// Limit (declared): this counter reads a receipt; it is not an execution oracle. A same-user
// forger who rewrites the nonce, the launch token, the DevTools browser id everywhere it occurs
// and every event time of a prior receipt is not refused; the replay checks refuse only replays
// that keep at least one of the three identifiers of a receipt passed as --prior.
import crypto from 'node:crypto';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const AT = { x: 400, y: 300 };
const VIEWPORT = { width: 1280, height: 900 };
const FROZEN = [
  { name: 'start', params: null },
  { name: 'in', params: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'mouse' } },
  { name: 'out', params: { x: 400, y: 300, scaleFactor: 0.5, gestureSourceType: 'mouse' } },
  { name: 'clamp', params: { x: 400, y: 300, scaleFactor: 0.5, gestureSourceType: 'mouse' } },
  { name: 'unit', params: { x: 400, y: 300, scaleFactor: 1, gestureSourceType: 'mouse' } },
  { name: 'default', params: { x: 400, y: 300, scaleFactor: 1.5 } },
  { name: 'touch', params: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'touch' } },
  { name: 'slow', params: { x: 400, y: 300, scaleFactor: 2, relativeSpeed: 200, gestureSourceType: 'touch' } },
  { name: 'pen', params: { x: 400, y: 300, scaleFactor: 2, gestureSourceType: 'pen' } },
  { name: 'outside', params: { x: 5000, y: 300, scaleFactor: 2, gestureSourceType: 'mouse' } },
  { name: 'zero', params: { x: 400, y: 300, scaleFactor: 0, gestureSourceType: 'mouse' } },
];
const ZERO_WAIT_MS = 4000;
const TOUCH_SEQ = ['pointerdown(touch)', 'touchstart', 'pointerdown(touch)', 'touchstart', 'pointerup(touch)', 'touchend', 'pointerup(touch)', 'touchend'];
// wheels: exact count, or [min, sign]; span: wheel first->last ms; tm: minimum touchmoves.
const SHAPE = {
  start: { seq: [], wheels: 0, scale: 1, span: null, tm: null, error: null },
  in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450], tm: null, error: null },
  out: { seq: [], wheels: [5, 'out'], scale: 1, span: [150, 450], tm: null, error: null },
  clamp: { seq: [], wheels: [5, 'out'], scale: 1, span: [150, 450], tm: null, error: null },
  unit: { seq: [], wheels: 0, scale: 1, span: null, tm: null, error: null },
  default: { seq: [], wheels: [3, 'in'], scale: 1.5, span: [60, 300], tm: null, error: null },
  touch: { seq: TOUCH_SEQ, wheels: 0, scale: 1.5, span: null, tm: 5, error: null },
  slow: { seq: TOUCH_SEQ, wheels: 0, scale: 1.5, span: null, tm: 15, error: null },
  pen: { seq: [], wheels: 0, scale: 1.5, span: null, tm: null, error: 'Unknown gestureSourceType' },
  outside: { seq: [], wheels: 0, scale: 1.5, span: null, tm: null, error: 'Position out of bounds' },
  zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000], tm: null, error: 'no-response-4000ms' },
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const LAW_LEGS = ['in', 'out', 'clamp', 'default'];
const EVENT_TYPES = new Set(['wheel', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gestureend']);
const PER_LEG = ['seq', 'trusted', 'wheels', 'scale', 'timing', 'error'];
const hasTiming = (n) => SHAPE[n].span !== null || SHAPE[n].tm !== null;
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-expected', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin',
  'replay-launch-token', 'replay-devtools-url', 'replay-event-timeline',
  'host-chromium', 'devtools-port-binding', 'run-window', 'plan-frozen', 'leg-order', 'leg-params', 'seq-monotonic',
  'event-leg-domain', 'event-types', 'leg-marks', 'event-leg-window', 'pinch-call-count', 'pinch-call-params',
  'send-log-allowlist', 'teardown-closure', 'failures-empty', 'producer-verdict', 'legshape-consistency',
  'ratio-consistency', 'initial-scale', 'scale-agreement', 'event-scale', 'wheel-anchor', 'wheel-delta-law',
  'touch-geometry', 'slow-ratio',
  ...LEG_ORDER.flatMap((n) => PER_LEG.filter((k) => k !== 'timing' || hasTiming(n)).map((k) => `leg-${n}-${k}`)),
];
if (argv.includes('--list-checks')) { console.log(JSON.stringify(CHECK_IDS)); process.exit(0); }

const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const rp = opt('receipt');
if (!rp) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--receipt required' }] }, 2);
const pin = opt('expect-driver-sha256');
if (pin === null || !/^[0-9a-f]{64}$/.test(pin)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-driver-sha256 is required: 64 lowercase hex' }] }, 2);
const expectNonce = opt('expect-nonce');
if (expectNonce === null || !/^tabi-r73-[a-z0-9-]+$/.test(expectNonce)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-nonce is required: tabi-r73- followed by lowercase letters/digits/hyphens' }] }, 2);
const priorPaths = argv.flatMap((a, i) => (a === '--prior' ? [argv[i + 1]] : []));
if (priorPaths.length === 0 || priorPaths.some((p) => typeof p !== 'string' || p.startsWith('--'))) out({ verdict: 'usage', findings: [{ id: 'usage', detail: 'at least one --prior <receipt.json> is required' }] }, 2);
let r;
try { r = JSON.parse(fs.readFileSync(rp, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }
if (!r || typeof r !== 'object' || Array.isArray(r)) out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2);
const priors = priorPaths.map((p) => {
  let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': ' + e.message }] }, 2); }
  if (!j || typeof j !== 'object' || Array.isArray(j)) out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': not an object' }] }, 2);
  return j;
});

const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const findings = [];
const checks = {};
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) findings.push({ id, detail: String(detail) }); };
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const near = (a, b, tol = 0.01) => num(a) && Math.abs(a - b) <= tol;
const MOVES = new Set(['pointermove', 'touchmove']);
const events = arr(r.events);
const legs = arr(r.legs);
const sendLog = arr(r.cdpSendLog);
const marks = arr(r.legMarks);
const legOf = (name) => legs.find((l) => l && l.name === name) || {};
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

// 1. identity and run binding
check('schema', r.schema === 'tabi-chrome-cdp-synthpinch-r73', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r73-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const served = arr(r.serverLog).filter((s) => s && s.path === '/' && s.status === 200);
check('server-log-binding', served.length >= 1 && served.every((s) => s.run === r.nonce), 'served / rows ' + served.length + ' runs ' + served.map((s) => s && s.run).join(','));
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
const host = isObj(r.host) ? r.host : {};
check('host-chromium', typeof host.chromium === 'string' && /^Chromium \d+\.\d+\.\d+\.\d+/.test(host.chromium) && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/|^Chrome\//.test(host.cdpProduct), 'chromium ' + host.chromium + ' product ' + host.cdpProduct);
const argvPort = (() => { const a = arr(host.argv).find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && isObj(dl) && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
// r73 replay refusal (QUALITY 136): per-run identifiers must not repeat any --prior receipt's.
const browserId = (h) => { const u = isObj(h) && isObj(h.devtoolsListening) && typeof h.devtoolsListening.url === 'string' ? h.devtoolsListening.url : ''; const m = /\/devtools\/browser\/([0-9a-f-]{36})$/.exec(u); return m ? m[1] : null; };
const timeline = (x) => crypto.createHash('sha256').update(JSON.stringify(arr(x.events).map((e) => (isObj(e) ? [e.ts, e.at] : null)))).digest('hex');
const tok = host.launchToken;
check('replay-launch-token', typeof tok === 'string' && /^[0-9a-f]{12}$/.test(tok) && priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok), 'launchToken ' + tok + ' (shape 12 hex, and not the launch token of any --prior receipt)');
const bid = browserId(host);
check('replay-devtools-url', bid !== null && priors.every((p) => browserId(p.host) !== bid), 'devtools browser id ' + bid + ' (uuid shape, and not the browser id of any --prior receipt)');
const tl = timeline(r);
check('replay-event-timeline', events.length > 0 && priors.every((p) => timeline(p) !== tl), 'event timeline sha256 ' + tl + ' equals a --prior receipt\'s, or no events');
const t0 = typeof r.startedAt === 'string' ? Date.parse(r.startedAt) : NaN, t1 = typeof r.finishedAt === 'string' ? Date.parse(r.finishedAt) : NaN;
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 8000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 8 s: settle waits and the 4 s zero leg)');
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', legs.length === LEG_ORDER.length && canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l && l.name).join(','));
check('leg-params', legs.length === FROZEN.length && legs.every((l, i) => isObj(l) && canon(l.params) === canon(FROZEN[i].params) && l.skipped === false && num(l.elapsedMs) && l.elapsedMs >= 0)
  && num(legOf('zero').elapsedMs) && legOf('zero').elapsedMs >= ZERO_WAIT_MS,
  'a leg entry carries params other than the frozen plan, skipped !== false, a non-numeric elapsedMs, or a zero leg shorter than ' + ZERO_WAIT_MS + ' ms');
check('seq-monotonic', events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg)), 'events outside the frozen legs: ' + events.filter((e) => !isObj(e) || !LEG_ORDER.includes(e.leg)).length);
const pt = (p) => Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]);
const typed = (e) => isObj(e) && typeof e.type === 'string' && EVENT_TYPES.has(e.type) && num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0
  && typeof e.isTrusted === 'boolean' && typeof e.ctrlKey === 'boolean' && (e.pointerType === null || typeof e.pointerType === 'string') && num(e.scale)
  && (e.type === 'wheel' ? num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY) : true)
  && (/^touch/.test(e.type) ? Array.isArray(e.touches) && e.touches.every(pt) && Array.isArray(e.changed) && e.changed.every(pt) : true);
check('event-types', events.length > 0 && events.every(typed), 'events with a non-strict field type: ' + events.filter((e) => !typed(e)).length);

// 2. page-side leg marks bind every event to the window of its label
const markNames = marks.map((m) => isObj(m) ? m.name : null);
const marksOk = canon(markNames) === canon(['start', ...LEG_ORDER]) && marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 || m.at >= marks[i - 1].at))
  && num(r.closedAt) && marks.length > 0 && r.closedAt >= marks[marks.length - 1].at && Number.isInteger(r.lateAfterClose) && r.lateAfterClose >= 0;
check('leg-marks', marksOk, 'legMarks ' + markNames.join(',') + ' closedAt ' + r.closedAt + ' lateAfterClose ' + r.lateAfterClose);
const windowOf = (name) => { const i = LEG_ORDER.indexOf(name) + 1; return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null; };
check('event-leg-window', marksOk && events.every((e, i) => { if (!isObj(e) || !num(e.at) || !LEG_ORDER.includes(e.leg)) return false; const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] && (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at)); }),
  'events whose handler time lies outside their labelled leg window: ' + (marksOk ? events.filter((e) => { if (!isObj(e) || !num(e.at)) return true; const w = windowOf(e.leg); return !w || e.at < w[0] || e.at > w[1]; }).length : 'marks unusable'));

// 3. producer: the send log is exactly the driver's own call set (closed allow-list)
const pinches = sendLog.filter((c) => isObj(c) && c.method === 'Input.synthesizePinchGesture');
check('pinch-call-count', pinches.length === 10, 'Input.synthesizePinchGesture calls ' + pinches.length);
check('pinch-call-params', canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params)), 'pinch params differ from the frozen plan');
const origin = isObj(r.fixture) && typeof r.fixture.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/.test(r.fixture.origin) ? r.fixture.origin : null;
const readyExpr = 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce);
const EXPRS = new Set(['window.visualViewport.scale', 'window.__nonceOnPage', 'window.__closeRecord()', 'window.__late', readyExpr, ...LEG_ORDER.map((n) => 'window.__setLeg(' + JSON.stringify(n) + ')')]);
const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getLayoutMetrics']);
const allowed = (c) => {
  if (!isObj(c) || !Number.isInteger(c.id) || typeof c.method !== 'string' || !isObj(c.params)) return false;
  if (EMPTY.has(c.method)) return canon(c.params) === '{}';
  if (c.method === 'Input.synthesizePinchGesture') return true;
  if (c.method === 'Runtime.evaluate') return canon(c.params) === canon({ expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression);
  if (c.method === 'Emulation.setDeviceMetricsOverride') return canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  if (c.method === 'Page.navigate') return origin !== null && canon(c.params) === canon({ url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) });
  return false;
};
const once = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length === 1;
check('send-log-allowlist', sendLog.length > 0 && sendLog.every(allowed) && sendLog.every((c, i) => c.id === i + 1) && once('Emulation.setDeviceMetricsOverride') && once('Page.navigate') && once('Browser.getVersion'),
  'sends outside the driver\'s closed call set: ' + sendLog.filter((c) => !allowed(c)).map((c) => (isObj(c) ? c.method : typeof c)).join(','));

// 4. per leg, re-derived from raw events and the per-leg scale readings
const derived = {};
const span = (list) => (list.length >= 2 && num(list[0].ts) && num(list[list.length - 1].ts) ? +(list[list.length - 1].ts - list[0].ts).toFixed(1) : null);
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => isObj(e) && e.leg === name);
  const wheels = evs.filter((e) => e.type === 'wheel');
  const tm = evs.filter((e) => e.type === 'touchmove');
  const nonMove = evs.filter((e) => !MOVES.has(e.type) && e.type !== 'wheel').map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : ''));
  const wheelSign = wheels.length === 0 ? null : !wheels.every((e) => num(e.deltaY)) ? 'mixed' : wheels.every((e) => e.deltaY < 0) ? 'in' : wheels.every((e) => e.deltaY > 0) ? 'out' : wheels.every((e) => e.deltaY === 0) ? 'zero' : 'mixed';
  const leg = legOf(name);
  const want = SHAPE[name];
  derived[name] = {
    kinds: [...new Set(evs.map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')))].sort(),
    total: evs.length, allTrusted: evs.every((e) => e.isTrusted === true),
    wheels: wheels.length, wheelCtrlAll: wheels.every((e) => e.ctrlKey === true), wheelSign, wheelSpanMs: span(wheels),
    touchmoves: tm.length, touchSpanMs: span(evs.filter((e) => /^touch/.test(e.type))), nonMove,
    scaleAfter: isObj(leg.scaleAfter) ? leg.scaleAfter.page : null,
  };
  const moveTypesOk = want.tm === null ? evs.every((e) => !MOVES.has(e.type)) : evs.filter((e) => e.type === 'pointermove').every((e) => e.pointerType === 'touch');
  check(`leg-${name}-seq`, canon(nonMove) === canon(want.seq) && moveTypesOk, name + ' non-move sequence ' + nonMove.join(',') + ' moves ok ' + moveTypesOk);
  check(`leg-${name}-trusted`, evs.every((e) => e.isTrusted === true), name + ' untrusted events ' + evs.filter((e) => e.isTrusted !== true).length);
  check(`leg-${name}-wheels`, typeof want.wheels === 'number'
    ? wheels.length === want.wheels
    : (wheels.length >= want.wheels[0] && wheelSign === want.wheels[1] && wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)),
    name + ' wheels ' + wheels.length + ' sign ' + wheelSign + ' ctrl ' + derived[name].wheelCtrlAll);
  check(`leg-${name}-scale`, near(leg.scaleAfter?.page, want.scale) && near(leg.scaleAfter?.cdp, want.scale), name + ' scaleAfter ' + JSON.stringify(leg.scaleAfter) + ' want ' + want.scale);
  if (hasTiming(name)) check(`leg-${name}-timing`, want.span !== null
    ? (derived[name].wheelSpanMs !== null && derived[name].wheelSpanMs >= want.span[0] && derived[name].wheelSpanMs <= want.span[1])
    : tm.length >= want.tm,
    name + ' wheel span ' + derived[name].wheelSpanMs + ' touchmoves ' + tm.length);
  check(`leg-${name}-error`, want.error === null ? (leg.cdpError === null && leg.skipped === false) : (typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error) && leg.skipped === false), name + ' cdpError ' + leg.cdpError + ' skipped ' + leg.skipped);
}

// 5. cross-leg laws (S177/S178 + Blink wheel conversion, measured on this host)
check('initial-scale', near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1), 'first leg scaleBefore ' + JSON.stringify(legs[0]?.scaleBefore) + ' (the fixture loads at page scale 1)');
check('scale-agreement', LEG_ORDER.every((n) => { const l = legOf(n); return num(l.scaleBefore?.page) && near(l.scaleBefore.page, l.scaleBefore.cdp) && num(l.scaleAfter?.page) && near(l.scaleAfter.page, l.scaleAfter.cdp); })
  && LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page)),
  'page-side and CDP scale readings disagree, or a leg does not start at the previous leg\'s end scale');
const inRange = (e) => { const l = legOf(e.leg); const a = l.scaleBefore?.page, b = l.scaleAfter?.page; return num(e.scale) && num(a) && num(b) && e.scale >= Math.min(a, b) - 0.01 && e.scale <= Math.max(a, b) + 0.01; };
check('event-scale', events.length > 0 && events.every((e) => isObj(e) && inRange(e)), 'events whose recorded page scale lies outside their leg\'s before/after range: ' + events.filter((e) => !isObj(e) || !inRange(e)).length);
const anchorWheels = ['in', 'clamp', 'default'].flatMap((n) => events.filter((e) => isObj(e) && e.leg === n && e.type === 'wheel'));
check('wheel-anchor', anchorWheels.length > 0 && anchorWheels.every((e) => num(e.clientX) && num(e.clientY) && Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1)
  && events.filter((e) => isObj(e) && e.leg === 'clamp' && e.type === 'wheel').every((e) => e.clientX === AT.x && e.clientY === AT.y),
  'wheel events off the pinch anchor');
// Each ctrl-wheel carries deltaY = -100 ln(step) / pageScale, so sum(deltaY * scale) = -100 ln(factor).
const lawSum = (n) => events.filter((e) => isObj(e) && e.leg === n && e.type === 'wheel').reduce((a, e) => a + (num(e.deltaY) && num(e.scale) ? e.deltaY * e.scale : NaN), 0);
const lawOk = (n) => near(lawSum(n), -100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5);
check('wheel-delta-law', LAW_LEGS.every(lawOk) && events.filter((e) => isObj(e) && e.leg === 'zero' && e.type === 'wheel').every((e) => e.deltaY === 0),
  'sum(deltaY*scale) per leg ' + LAW_LEGS.map((n) => n + '=' + lawSum(n)).join(' ') + ' want -100*ln(scaleFactor)');
const geom = (name) => {
  const tms = events.filter((e) => isObj(e) && e.leg === name && e.type === 'touchmove');
  if (tms.length < 2 || !tms.every((e) => Array.isArray(e.touches) && e.touches.length === 2 && e.touches.every(pt))) return false;
  const xs = new Set(tms.flatMap((e) => e.touches.map((p) => p[0])));
  const spans = tms.map((e) => Math.abs(e.touches[1][1] - e.touches[0][1]));
  const grows = spans.every((s, i) => i === 0 || s >= spans[i - 1]);
  return xs.size === 1 && grows && spans[0] > 0 && spans[spans.length - 1] / spans[0] >= 2;
};
check('touch-geometry', geom('touch') && geom('slow'), 'touch pointers are not two points on one vertical line moving apart to >= 2x span');
const ratio = derived.touch.touchSpanMs > 0 && derived.slow.touchSpanMs !== null ? derived.slow.touchSpanMs / derived.touch.touchSpanMs : null;
check('slow-ratio', ratio !== null && ratio >= 3 && ratio <= 5, 'slow/touch span ratio ' + ratio + ' (relativeSpeed 800 vs 200)');

// 6. closure, producer verdict, summary consistency
const td = isObj(r.teardown) ? r.teardown : {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && isObj(td.portProbes) && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && isObj(td.postKillCurl) && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED', 'producer predicate ' + JSON.stringify(r.predicate) + ' hypothesis ' + JSON.stringify(r.synthPinchHypothesis));
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');
check('ratio-consistency', ratio !== null && r.slowToTouchSpanRatio === +ratio.toFixed(2), 'producer slowToTouchSpanRatio ' + r.slowToTouchSpanRatio + ' re-derived ' + ratio);

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-synthpinch-r73', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length, checks, findings, derived }, findings.length === 0 ? 0 : 1);
