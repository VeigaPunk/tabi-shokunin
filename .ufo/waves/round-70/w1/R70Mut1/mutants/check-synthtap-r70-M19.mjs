#!/usr/bin/env node
// Counter for tabi round 70 C1 (capability `chromium-synth-tap-gesture-linux`).
// Usage: node check-synthtap-r70.mjs --receipt <receipt.json> [--expect-driver-sha256 <hex>] [--json]
//        node check-synthtap-r70.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw
// event log and the driver's CDP send log; the producer's own verdict (predicate true AND
// synthTapHypothesis CONFIRMED) and its legShape summary must ALSO agree with the
// re-derivation -- a disagreement in either polarity is a finding.
// Limit (declared): this counter reads a receipt; it is not an execution oracle. Live
// re-derivation is scripts/verify-live-r70.mjs --profile synthtap-r70.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const MOUSE_TAP = ['pointerdown(mouse)', 'mousedown', 'pointerup(mouse)', 'mouseup', 'click(mouse)'];
const TOUCH_TAP = ['pointerdown(touch)', 'touchstart', 'pointerup(touch)', 'touchend'];
const BTN = { x: 200, y: 150 };
const FROZEN = [
  { name: 'start', params: null },
  { name: 'mouse', params: { x: 200, y: 150, gestureSourceType: 'mouse' } },
  { name: 'hold', params: { x: 200, y: 150, gestureSourceType: 'mouse', duration: 400 } },
  { name: 'double', params: { x: 200, y: 150, gestureSourceType: 'mouse', tapCount: 2 } },
  { name: 'zero', params: { x: 200, y: 150, gestureSourceType: 'mouse', tapCount: 0 } },
  { name: 'default', params: { x: 200, y: 150 } },
  { name: 'touch', params: { x: 200, y: 150, gestureSourceType: 'touch' } },
  { name: 'outside', params: { x: 5000, y: 150, gestureSourceType: 'mouse' } },
];
const SHAPE = {
  start: { seq: [], details: [], timing: null, error: null },
  mouse: { seq: MOUSE_TAP, details: [1], timing: [45, 150], error: null },
  hold: { seq: MOUSE_TAP, details: [1], timing: [395, 600], error: null },
  double: { seq: [...MOUSE_TAP, ...MOUSE_TAP], details: [1, 1], timing: [45, 150], error: null },
  zero: { seq: [], details: [], timing: null, error: null },
  default: { seq: TOUCH_TAP, details: [], timing: [45, 150], error: null },
  touch: { seq: TOUCH_TAP, details: [], timing: [45, 150], error: null },
  outside: { seq: [], details: [], timing: null, error: 'Position out of bounds' },
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const PER_LEG = ['seq', 'trusted', 'detail', 'timing', 'error', 'coords', 'target', 'no-dblclick'];
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin',
  'host-chromium', 'devtools-port-binding', 'run-window', 'plan-frozen', 'leg-order', 'seq-monotonic',
  'event-leg-domain', 'tap-call-count', 'tap-call-params', 'no-lookalike-producer', 'teardown-closure',
  'failures-empty', 'producer-verdict', 'legshape-consistency',
  ...LEG_ORDER.flatMap((n) => PER_LEG.map((k) => `leg-${n}-${k}`)),
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
const MOVES = new Set(['pointermove', 'mousemove', 'touchmove']);
const events = arr(r.events);
const legs = arr(r.legs);
const sendLog = arr(r.cdpSendLog);

// 1. identity and run binding
check('schema', r.schema === 'tabi-chrome-cdp-synthtap-r70', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r70-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const served = arr(r.serverLog).filter((s) => s && s.path === '/' && s.status === 200);
check('server-log-binding', served.length >= 1 && served.every((s) => s.run === r.nonce), 'served / rows ' + served.length + ' runs ' + served.map((s) => s.run).join(','));
check('driver-pin', pin === null ? /^[0-9a-f]{64}$/.test(String(r.driverSha256)) : r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + (pin ? ' expected ' + pin : ''));
const host = r.host || {};
check('host-chromium', typeof host.chromium === 'string' && /^Chromium \d+\.\d+\.\d+\.\d+/.test(host.chromium) && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/|^Chrome\//.test(host.cdpProduct), 'chromium ' + host.chromium + ' product ' + host.cdpProduct);
const argvPort = (() => { const a = arr(host.argv).find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && dl && dl.port === argvPort && typeof dl.url === 'string' && dl.url.includes('/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 > t0 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt);
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l && l.name).join(','));
check('seq-monotonic', events.length > 0 && events.every((e, i) => e && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => e && LEG_ORDER.includes(e.leg)), 'events outside the frozen legs: ' + events.filter((e) => !e || !LEG_ORDER.includes(e.leg)).length);

// 2. producer: exactly the frozen synthesizeTapGesture calls, no look-alike producer
const taps = sendLog.filter((c) => c && c.method === 'Input.synthesizeTapGesture');
check('tap-call-count', taps.length === 7, 'Input.synthesizeTapGesture calls ' + taps.length);
check('tap-call-params', canon(taps.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params)), 'tap params differ from the frozen plan');
const look = sendLog.filter((c) => c && (/^Input\.(dispatch|insertText|ime|emulateTouch)/.test(String(c.method)) || (/^Runtime\.(evaluate|callFunctionOn)$/.test(String(c.method)) && /click\(|dispatchEvent|new\s+(Mouse|Pointer|Touch)Event/.test(JSON.stringify(c.params || {})))));
check('no-lookalike-producer', look.length === 0, 'look-alike producer sends: ' + look.map((c) => c.method).join(','));

// 3. per leg, re-derived from raw events
const derived = {};
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => e && e.leg === name);
  const seq = evs.filter((e) => !MOVES.has(e.type)).map((e) => e.type + (e.pointerType ? '(' + e.pointerType + ')' : ''));
  const down = evs.filter((e) => e.type === 'pointerdown'); const up = evs.filter((e) => e.type === 'pointerup');
  const details = evs.filter((e) => e.type === 'click').map((e) => e.detail);
  const timing = down.length && up.length ? +(up[0].ts - down[0].ts).toFixed(1) : null;
  const leg = legs.find((l) => l && l.name === name) || {};
  const want = SHAPE[name];
  derived[name] = { seqTypes: seq, total: evs.length, allTrusted: evs.every((e) => e.isTrusted === true), clickDetails: details, dblclick: evs.filter((e) => e.type === 'dblclick').length, pressReleaseMs: timing, onButton: evs.filter((e) => e.type === 'click' || e.type === 'pointerdown').every((e) => e.target === 'btn') };
  check(`leg-${name}-seq`, canon(seq) === canon(want.seq), name + ' seq ' + seq.join(','));
  check(`leg-${name}-trusted`, evs.every((e) => e.isTrusted === true), name + ' untrusted events ' + evs.filter((e) => e.isTrusted !== true).length);
  check(`leg-${name}-detail`, canon(details) === canon(want.details) && evs.filter((e) => e.type === 'mousedown' || e.type === 'mouseup').every((e) => e.button === 0), name + ' click details ' + details.join(','));
  check(`leg-${name}-timing`, want.timing === null ? timing === null : (timing !== null && timing >= want.timing[0] && timing <= want.timing[1] && (name !== 'double' || (down.length === 2 && up.length === 2 && +(up[1].ts - down[1].ts).toFixed(1) >= want.timing[0] && +(up[1].ts - down[1].ts).toFixed(1) <= want.timing[1] && down[1].ts > up[0].ts))), name + ' press->release ' + timing);
  check(`leg-${name}-error`, want.error === null ? (leg.cdpError === null && leg.skipped === false) : (typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error) && leg.skipped === false), name + ' cdpError ' + leg.cdpError + ' skipped ' + leg.skipped);
  check(`leg-${name}-coords`, evs.filter((e) => /^(pointerdown|pointerup|mousedown|mouseup|click|touchstart|touchend)$/.test(e.type)).every((e) => e.clientX === BTN.x && e.clientY === BTN.y), name + ' coordinates off the tap point');
  check(`leg-${name}-target`, evs.filter((e) => e.type !== 'pointermove' && e.type !== 'mousemove').every((e) => e.target === 'btn'), name + ' events off the button');
  check(`leg-${name}-no-dblclick`, evs.every((e) => e.type !== 'dblclick' && e.type !== 'contextmenu' && e.type !== 'auxclick'), name + ' dblclick/contextmenu/auxclick present');
}

// 4. closure, producer verdict, summary consistency
const td = r.teardown || {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && td.portProbes && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && td.postKillCurl && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.synthTapHypothesis === 'CONFIRMED', 'producer predicate ' + r.predicate + ' hypothesis ' + r.synthTapHypothesis);
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-synthtap-r70', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length, checks, findings, derived }, findings.length === 0 ? 0 : 1);
