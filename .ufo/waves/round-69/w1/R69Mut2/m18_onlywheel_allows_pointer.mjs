#!/usr/bin/env node
// Counter for tabi round 69 C2 (capability `chromium-synth-scroll-gesture-linux`).
// Usage: node check-synthscroll-r69.mjs --receipt <receipt.json> [--expect-driver-sha256 <hex>] [--json]
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt.
// Independent of the driver's own verdict: it re-derives every leg from the page-side
// event log and the driver's CDP send log, and ALSO requires the producer's own verdict
// (predicate true AND synthScrollHypothesis CONFIRMED) -- both polarities must agree.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const rp = opt('receipt');
if (!rp) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--receipt required' }] }, 2);
let r;
try { r = JSON.parse(fs.readFileSync(rp, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }

const FROZEN = [
  { name: 'start', params: null, expectScrollY: 0 },
  { name: 'mouse', params: { x: 400, y: 400, yDistance: -600, gestureSourceType: 'mouse' }, expectScrollY: 600 },
  { name: 'default', params: { x: 400, y: 400, yDistance: 300 }, expectScrollY: 300 },
  { name: 'repeat', params: { x: 400, y: 400, yDistance: -200, gestureSourceType: 'mouse', repeatCount: 2, repeatDelayMs: 100 }, expectScrollY: 900 },
  { name: 'touch', params: { x: 400, y: 400, yDistance: -500, gestureSourceType: 'touch', preventFling: true }, expectScrollY: 900 },
];
const LEG_ORDER = ['start', 'mouse', 'default', 'repeat', 'touch'];
const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const findings = [];
const checks = {};
const fail = (id, detail) => findings.push({ id, detail });
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) fail(id, detail); };
const arr = (v) => (Array.isArray(v) ? v : []);

// 1. identity and binding
check('schema', r.schema === 'tabi-chrome-cdp-synthscroll-r69', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r69-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-on-page', r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const served = arr(r.serverLog).filter((s) => s.path === '/' && s.status === 200);
check('server-log-binding', served.length >= 1 && served.every((s) => s.run === r.nonce), 'served / rows ' + served.length + ' runs ' + served.map((s) => s.run).join(','));
const expSha = opt('expect-driver-sha256');
if (expSha) check('driver-sha256-pin', r.driverSha256 === expSha, 'driverSha256 ' + r.driverSha256);
check('chromium-identity', typeof r.host?.chromium === 'string' && /^Chromium \d+\./.test(r.host.chromium) && typeof r.host?.cdpProduct === 'string' && r.host.cdpProduct.length > 0, 'host ' + JSON.stringify(r.host?.chromium));

// 2. producer verdict polarity: both fields must say green, and failures must be empty
check('producer-predicate-true', r.predicate === true, 'predicate ' + r.predicate);
check('producer-hypothesis-confirmed', r.synthScrollHypothesis === 'CONFIRMED', 'hypothesis ' + r.synthScrollHypothesis);
check('producer-failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));

// 3. plan and producer: the gesture command, exactly four times, with the frozen params, nothing else injecting input or scrolling by script
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from frozen legs');
const log = arr(r.cdpSendLog);
const gestures = log.filter((c) => c.method === 'Input.synthesizeScrollGesture');
check('gesture-call-count', gestures.length === 4, 'Input.synthesizeScrollGesture calls ' + gestures.length);
check('gesture-params', gestures.length === 4 && gestures.every((g, i) => canon(g.params) === canon(FROZEN[i + 1].params)), 'gesture params differ from frozen legs, in order');
const otherInput = log.filter((c) => typeof c.method === 'string' && c.method.startsWith('Input.') && c.method !== 'Input.synthesizeScrollGesture');
check('no-other-input-producer', otherInput.length === 0, 'other Input.* calls: ' + otherInput.map((c) => c.method).join(','));
const scriptScroll = log.filter((c) => c.method === 'Runtime.evaluate' && /scroll(To|By|IntoView)\s*\(|scrollTop\s*=|scrollY\s*=|scrollingElement/.test(String(c.params?.expression)));
check('no-script-scroll', scriptScroll.length === 0, 'script scroll expressions: ' + scriptScroll.length);
const ids = log.map((c) => c.id);
check('send-log-ordered', ids.length > 0 && ids.every((id, i) => id === i + 1), 'cdpSendLog ids not 1..n');

// 4. legs: recorded in frozen order, scroll positions exact
const legs = arr(r.legs);
check('legs-order', canon(legs.map((l) => l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l.name).join(','));
const events = arr(r.events);
check('event-seq', events.length > 0 && events.every((e, i) => e.seq === i + 1), 'event seq not 1..n');
const legIdx = (name) => LEG_ORDER.indexOf(name);
check('event-legs-known-monotone', events.every((e, i) => legIdx(e.leg) >= 0 && (i === 0 || legIdx(e.leg) >= legIdx(events[i - 1].leg))), 'event leg labels unknown or out of order');
check('all-events-trusted', events.every((e) => e.isTrusted === true), 'untrusted events ' + events.filter((e) => e.isTrusted !== true).length);
let prevY = 0;
for (const plan of FROZEN) {
  const l = legs.find((x) => x.name === plan.name);
  const evs = events.filter((e) => e.leg === plan.name);
  const n = (type, pt) => evs.filter((e) => e.type === type && (pt === undefined || e.pointerType === pt)).length;
  if (!l) { fail('leg-missing-' + plan.name, 'no leg record'); continue; }
  check('leg-' + plan.name + '-scrollY-before', l.scrollYBefore === prevY, `scrollYBefore ${l.scrollYBefore} != ${prevY}`);
  check('leg-' + plan.name + '-scrollY', l.scrollY === plan.expectScrollY, `scrollY ${l.scrollY} != ${plan.expectScrollY}`);
  if (plan.name === 'start') { check('leg-start-no-events', evs.length === 0, 'start events ' + evs.length); prevY = l.scrollY; continue; }
  if (plan.name === 'touch') {
    check('leg-touch-no-wheel', n('wheel') === 0, 'wheel ' + n('wheel'));
    check('leg-touch-no-scroll', l.scrollY === l.scrollYBefore, 'touch leg moved scrollY');
    check('leg-touch-pointerdown', n('pointerdown', 'touch') === 1, 'pointerdown(touch) ' + n('pointerdown', 'touch'));
    check('leg-touch-pointerup', n('pointerup', 'touch') === 1, 'pointerup(touch) ' + n('pointerup', 'touch'));
    check('leg-touch-touchstart', n('touchstart') === 1, 'touchstart ' + n('touchstart'));
    check('leg-touch-touchend', n('touchend') === 1, 'touchend ' + n('touchend'));
    check('leg-touch-pointermove', n('pointermove', 'touch') >= 1, 'pointermove(touch) ' + n('pointermove', 'touch'));
    check('leg-touch-no-mouse-pointer', evs.filter((e) => e.type.startsWith('pointer') && e.pointerType !== 'touch').length === 0, 'non-touch pointer events');
  } else {
    const wheels = evs.filter((e) => e.type === 'wheel');
    const sum = wheels.reduce((a, e) => a + e.deltaY, 0);
    check('leg-' + plan.name + '-wheel-present', wheels.length >= 1, 'wheel ' + wheels.length);
    check('leg-' + plan.name + '-only-wheel-scrollend', evs.every((e) => e.type === 'wheel' || e.type === 'scrollend' || e.type === 'pointermove'), 'non-wheel events in mouse-class leg');
    check('leg-' + plan.name + '-wheel-sum', Math.abs(sum - (l.scrollY - l.scrollYBefore)) < 1e-6, `deltaY sum ${sum} != scroll delta ${l.scrollY - l.scrollYBefore}`);
    check('leg-' + plan.name + '-wheel-axis', wheels.every((e) => e.deltaX === 0 && e.deltaMode === 0), 'wheel deltaX/deltaMode');
    const dir = Math.sign(-plan.params.yDistance);
    check('leg-' + plan.name + '-wheel-direction', wheels.every((e) => Math.sign(e.deltaY) === dir || e.deltaY === 0), 'wheel deltaY sign against yDistance');
    const lo = Math.min(l.scrollYBefore, l.scrollY), hi = Math.max(l.scrollYBefore, l.scrollY);
    check('leg-' + plan.name + '-dispatch-range', wheels.every((e) => e.scrollYAtDispatch >= lo && e.scrollYAtDispatch <= hi), 'wheel scrollYAtDispatch outside leg range');
    const minEnds = plan.params.repeatCount ? plan.params.repeatCount + 1 : 1;
    check('leg-' + plan.name + '-scrollend', n('scrollend') >= minEnds, `scrollend ${n('scrollend')} < ${minEnds}`);
  }
  prevY = l.scrollY;
}
check('page-final-scrollY', r.pageState?.scrollY === 900, 'final scrollY ' + r.pageState?.scrollY);
check('page-event-count', r.pageState?.eventCount === events.length, 'eventCount mismatch');

// 5. teardown closure
const td = r.teardown || {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null
  && td.portProbes && Object.values(td.portProbes).every((v) => v === 'closed')
  && td.postKillCurl && Object.values(td.postKillCurl).every((v) => v === 7), 'teardown ' + JSON.stringify(td));

out({ verdict: findings.length ? 'red' : 'clean', receipt: rp, nonce: r.nonce, checkCount: Object.keys(checks).length, findings }, findings.length ? 1 : 0);
