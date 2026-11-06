#!/usr/bin/env node
// Counter for tabi round 71 C1 (capability `chromium-synth-pinch-gesture-linux`).
// Usage: node check-synthpinch-r71.mjs --receipt <receipt.json> [--expect-driver-sha256 <hex>] [--json]
//        node check-synthpinch-r71.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the per-leg page/CDP scale readings and the driver's CDP send log; the producer's own
// verdict (predicate true AND synthPinchHypothesis CONFIRMED) and its legShape summary must ALSO
// agree with the re-derivation -- a disagreement in either polarity is a finding.
// Limit (declared): this counter reads a receipt; it is not an execution oracle.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const AT = { x: 400, y: 300 };
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
const PER_LEG = ['seq', 'trusted', 'wheels', 'scale', 'timing', 'error'];
// timing applies only where the leg has a measured duration (wheel span or touchmove count)
const hasTiming = (n) => SHAPE[n].span !== null || SHAPE[n].tm !== null;
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin',
  'host-chromium', 'devtools-port-binding', 'run-window', 'plan-frozen', 'leg-order', 'seq-monotonic',
  'event-leg-domain', 'pinch-call-count', 'pinch-call-params', 'no-lookalike-producer', 'teardown-closure',
  'failures-empty', 'producer-verdict', 'legshape-consistency', 'scale-agreement', 'wheel-anchor',
  'wheel-delta-law', 'touch-geometry', 'slow-ratio',
  ...LEG_ORDER.flatMap((n) => PER_LEG.filter((k) => k !== 'timing' || hasTiming(n)).map((k) => `leg-${n}-${k}`)),
];
if (argv.includes('--list-checks')) { console.log(JSON.stringify(CHECK_IDS)); process.exit(0); }

const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const rp = opt('receipt');
if (!rp) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--receipt required' }] }, 2);
const pin = opt('expect-driver-sha256');
if (pin !== null && !/^[0-9a-f]{64}$/.test(pin)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-driver-sha256 must be 64 lowercase hex' }] }, 2);
let r;
try { r = JSON.parse(fs.readFileSync(rp, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }
if (!r || typeof r !== 'object' || Array.isArray(r)) out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2);

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
const legOf = (name) => legs.find((l) => l && l.name === name) || {};

// 1. identity and run binding
check('schema', r.schema === 'tabi-chrome-cdp-synthpinch-r71', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r71-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const served = arr(r.serverLog).filter((s) => s && s.path === '/' && s.status === 200);
check('server-log-binding', served.length >= 1 && served.every((s) => s.run === r.nonce), 'served / rows ' + served.length + ' runs ' + served.map((s) => s.run).join(','));
check('driver-pin', pin === null ? /^[0-9a-f]{64}$/.test(String(r.driverSha256)) : r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + (pin ? ' expected ' + pin : ''));
const host = r.host || {};
check('host-chromium', typeof host.chromium === 'string' && /^Chromium \d+\.\d+\.\d+\.\d+/.test(host.chromium) && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/|^Chrome\//.test(host.cdpProduct), 'chromium ' + host.chromium + ' product ' + host.cdpProduct);
const argvPort = (() => { const a = arr(host.argv).find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && dl && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 8000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 8 s: settle waits and the 4 s zero leg)');
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l && l.name).join(','));
check('seq-monotonic', events.length > 0 && events.every((e, i) => e && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => e && LEG_ORDER.includes(e.leg)), 'events outside the frozen legs: ' + events.filter((e) => !e || !LEG_ORDER.includes(e.leg)).length);

// 2. producer: exactly the frozen synthesizePinchGesture calls, no look-alike producer
const pinches = sendLog.filter((c) => c && c.method === 'Input.synthesizePinchGesture');
check('pinch-call-count', pinches.length === 10, 'Input.synthesizePinchGesture calls ' + pinches.length);
check('pinch-call-params', canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params)), 'pinch params differ from the frozen plan');
const look = sendLog.filter((c) => c && (/^Input\.(dispatch|insertText|ime|emulateTouch|synthesize(Scroll|Tap))/.test(String(c.method))
  || /^Emulation\.(setPageScaleFactor|setTouchEmulationEnabled|setEmitTouchEventsForMouse|setScrollbarsHidden)$/.test(String(c.method))
  || (/^Runtime\.(evaluate|callFunctionOn)$/.test(String(c.method)) && /dispatchEvent|new\s+(Wheel|Mouse|Pointer|Touch)Event|__events\s*\.\s*push|__events\s*=|visualViewport\s*=/.test(JSON.stringify(c.params || {})))));
check('no-lookalike-producer', look.length === 0, 'look-alike producer sends: ' + look.map((c) => c.method).join(','));

// 3. per leg, re-derived from raw events and the per-leg scale readings
const derived = {};
const span = (list) => (list.length >= 2 ? +(list[list.length - 1].ts - list[0].ts).toFixed(1) : null);
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => e && e.leg === name);
  const wheels = evs.filter((e) => e.type === 'wheel');
  const tm = evs.filter((e) => e.type === 'touchmove');
  const nonMove = evs.filter((e) => !MOVES.has(e.type) && e.type !== 'wheel').map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : ''));
  const wheelSign = wheels.length === 0 ? null : wheels.every((e) => e.deltaY < 0) ? 'in' : wheels.every((e) => e.deltaY > 0) ? 'out' : wheels.every((e) => e.deltaY === 0) ? 'zero' : 'mixed';
  const leg = legOf(name);
  const want = SHAPE[name];
  derived[name] = {
    kinds: [...new Set(evs.map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : '')))].sort(),
    total: evs.length, allTrusted: evs.every((e) => e.isTrusted === true),
    wheels: wheels.length, wheelCtrlAll: wheels.every((e) => e.ctrlKey === true), wheelSign, wheelSpanMs: span(wheels),
    touchmoves: tm.length, touchSpanMs: span(evs.filter((e) => /^touch/.test(e.type))), nonMove,
    scaleAfter: leg.scaleAfter ? leg.scaleAfter.page : null,
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

// 4. cross-leg laws (S177/S178 + Blink wheel conversion, measured on this host)
check('scale-agreement', LEG_ORDER.every((n) => { const l = legOf(n); return num(l.scaleBefore?.page) && near(l.scaleBefore.page, l.scaleBefore.cdp) && num(l.scaleAfter?.page) && near(l.scaleAfter.page, l.scaleAfter.cdp); })
  && LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page)),
  'page-side and CDP scale readings disagree, or a leg does not start at the previous leg\'s end scale');
const anchorWheels = ['in', 'clamp', 'default'].flatMap((n) => events.filter((e) => e && e.leg === n && e.type === 'wheel'));
check('wheel-anchor', anchorWheels.length > 0 && anchorWheels.every((e) => Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1)
  && events.filter((e) => e && e.leg === 'clamp' && e.type === 'wheel').every((e) => e.clientX === AT.x && e.clientY === AT.y),
  'wheel events off the pinch anchor');
// At page scale 1 (clamp leg: nothing zooms) the ctrl-wheel deltas sum to 100*ln(1/0.5).
const clampSum = events.filter((e) => e && e.leg === 'clamp' && e.type === 'wheel').reduce((a, e) => a + (num(e.deltaY) ? e.deltaY : NaN), 0);
check('wheel-delta-law', near(clampSum, 100 * Math.log(2), 0.5) && events.filter((e) => e && e.leg === 'zero' && e.type === 'wheel').every((e) => e.deltaY === 0), 'clamp deltaY sum ' + clampSum + ' want 100*ln2');
const geom = (name) => {
  const tms = events.filter((e) => e && e.leg === name && e.type === 'touchmove');
  if (tms.length < 2 || !tms.every((e) => Array.isArray(e.touches) && e.touches.length === 2)) return false;
  const xs = new Set(tms.flatMap((e) => e.touches.map((p) => p[0])));
  const spans = tms.map((e) => Math.abs(e.touches[1][1] - e.touches[0][1]));
  const grows = spans.every((s, i) => i === 0 || s >= spans[i - 1]);
  return xs.size === 1 && grows && spans[spans.length - 1] / spans[0] >= 2;
};
check('touch-geometry', geom('touch') && geom('slow'), 'touch pointers are not two points on one vertical line moving apart to >= 2x span');
const ratio = derived.touch.touchSpanMs > 0 && derived.slow.touchSpanMs !== null ? derived.slow.touchSpanMs / derived.touch.touchSpanMs : null;
check('slow-ratio', ratio !== null && ratio >= 3 && ratio <= 5, 'slow/touch span ratio ' + ratio + ' (relativeSpeed 800 vs 200)');

// 5. closure, producer verdict, summary consistency
const td = r.teardown || {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && td.portProbes && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && td.postKillCurl && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED', 'producer predicate ' + r.predicate + ' hypothesis ' + r.synthPinchHypothesis);
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-synthpinch-r71', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length, checks, findings, derived }, findings.length === 0 ? 0 : 1);
