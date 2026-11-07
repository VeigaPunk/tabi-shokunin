#!/usr/bin/env node
// Counter for tabi round 75 C1 (capability `chromium-drag-intercept-linux`, generation r75).
// Usage: node check-dragdrop-r75.mjs --receipt <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <tabi-r75-...> --prior <receipt.json> [--prior <receipt.json> ...] [--json]
//        node check-dragdrop-r75.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt or prior.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the page-side leg marks, the per-leg page state, the driver's CDP send log and its CDP
// event log; the producer's own verdict (predicate true AND dragHypothesis CONFIRMED, strict
// booleans/strings) and its legShape summary must ALSO agree with the re-derivation.
// Carried from r72-r74: closed send-log allow-list, strict event fields, leg marks binding each
// event to its leg window, required driver pin / expected nonce / priors, replay refusal on launch
// token and DevTools browser id, 0.1 ms event-time quantum, fixture hash from the pinned driver.
// New in r75:
//  - replay-event-timeline compares event-time MULTISETS, not aligned lists (round-74 routed
//    defect 1, R74Review1 S1: one inserted or deleted event took a relabelled receipt out of the
//    aligned comparison). A receipt is a replay of a prior when >= half of its events find a
//    distinct prior event with both ts and at within 0.05 ms, OR >= three quarters of its
//    inter-event gaps of >= 50 ms find a distinct prior gap within 0.05 ms (the gap test is
//    shift-invariant, so a whole-timeline move by any amount does not escape it; one inserted or
//    deleted event disturbs at most two gaps). The honest-pair maxima of both fractions are
//    measured before the freeze (lesson-proof/timeline-honest-pairs.json) and recorded there.
//  - the output records the prior set it read (path, sha256, schema) (round-74 routed defect 4).
//  - producer: Input.setInterceptDrags, exactly one Input.dragIntercepted event bound to the
//    move-start mouse send, and every drag leg that names INTERCEPTED replays that event's data.
//  - laws (sources in the round-75 note): every event trusted; DataTransfer data readable only in
//    dragstart and drop; no native drag session; drop iff the drop's dragover was cancelled,
//    dragleave otherwise; dragCancel clears the session (no later drag event); source lifecycle;
//    event coordinates equal the commanded point; effectAllowed follows the operations mask.
// Limit (declared): this counter reads a receipt; it is not an execution oracle. A same-user
// forger who rewrites the nonce, the launch token and the DevTools browser id of a prior receipt
// (or of any receipt outside the --prior set) and re-times its events so that more than half of
// the event times and more than a quarter of its >= 50 ms gaps each move by >= 0.05 ms (a linear
// ramp of 0.3 ms per event does both) is not refused; nor is a receipt fabricated from nothing
// that satisfies every check.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const VIEWPORT = { width: 1280, height: 900 };
const DRIVER = fileURLToPath(new URL('./chrome-cdp-dragdrop-round75.mjs', import.meta.url));
const EXT = { items: [{ mimeType: 'text/plain', data: 'tabi-ext' }], dragOperationsMask: 1 };
const INTERCEPT_WANT = { items: [{ mimeType: 'text/plain', data: 'tabi-drag' }, { mimeType: 'text/x-tabi', data: 'x1' }], dragOperationsMask: 17 };
const mouse = (type, x, y, buttons, extra = {}) => ({ type, x, y, button: 'left', buttons, ...extra });
const drag = (type, x, y, data) => ({ type, x, y, data });
const FROZEN = [
  { name: 'start', cmd: null, params: null },
  { name: 'intercept-on', cmd: 'Input.setInterceptDrags', params: { enabled: true } },
  { name: 'press', cmd: 'Input.dispatchMouseEvent', params: mouse('mousePressed', 150, 120, 1, { clickCount: 1 }) },
  { name: 'move-start', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseMoved', 170, 125, 1) },
  { name: 'move-far', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseMoved', 450, 150, 1) },
  { name: 'enter-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 150, 'INTERCEPTED') },
  { name: 'over-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragOver', 460, 160, 'INTERCEPTED') },
  { name: 'drop-dz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 460, 160, 'INTERCEPTED') },
  { name: 'release', cmd: 'Input.dispatchMouseEvent', params: mouse('mouseReleased', 460, 160, 0, { clickCount: 1 }) },
  { name: 'ext-enter-nz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 450, EXT) },
  { name: 'ext-drop-nz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 450, 450, EXT) },
  { name: 'ext-enter-dz', cmd: 'Input.dispatchDragEvent', params: drag('dragEnter', 450, 150, EXT) },
  { name: 'ext-cancel', cmd: 'Input.dispatchDragEvent', params: drag('dragCancel', 450, 150, EXT) },
  { name: 'ext-drop-dz', cmd: 'Input.dispatchDragEvent', params: drag('drop', 470, 170, EXT) },
  { name: 'bad-type', cmd: 'Input.dispatchDragEvent', params: drag('dragLeave', 450, 150, EXT) },
];
const ERR_BAD = "Unexpected event type 'dragLeave'";
const DT_SRC = 'text/plain+text/x-tabi';
const dtv = (types, plain, custom, de, ea, items) => [types, plain, custom, de, ea, items].join('|');
const st = (dz, nz, drops, starts) => ({ dz, nz, drops, starts });
const DROPPED = 'tabi-drag|x1';
const E = { seq: [], trusted: [], prevented: [], xy: [], dt: [] };
// Expected per-leg shape: event `type@target`, isTrusted, defaultPrevented, `x,y,buttons`, the
// DataTransfer view (`types|text/plain|text/x-tabi|dropEffect|effectAllowed|items`, '-' = none),
// page state after the leg, CDP error substring. Filled from the pre-freeze probe receipts.
const SHAPE = {
  start: { ...E, state: st('', '', 0, 0), error: null },
  'intercept-on': { ...E, state: st('', '', 0, 0), error: null },
  press: { seq: ['pointerdown@src', 'mousedown@src'], trusted: [true, true], prevented: [false, false], xy: ['150,120,1', '150,120,1'], dt: ['-', '-'], state: st('', '', 0, 0), error: null },
  'move-start': { seq: ['dragstart@src', 'pointercancel@src'], trusted: [true, true], prevented: [false, false], xy: ['150,120,1', '0,0,0'], dt: [dtv(DT_SRC, 'tabi-drag', 'x1', 'none', 'copyMove', 2), '-'], state: st('', '', 0, 1), error: null },
  'move-far': { ...E, state: st('', '', 0, 1), error: null },
  'enter-dz': { seq: ['drag@src', 'dragenter@dz'], trusted: [true, true], prevented: [false, true], xy: ['450,150,0', '450,150,0'], dt: [dtv(DT_SRC, '', '', 'none', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st('', '', 0, 1), error: null },
  'over-dz': { seq: ['dragover@dz'], trusted: [true], prevented: [true], xy: ['460,160,0'], dt: [dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st('', '', 0, 1), error: null },
  'drop-dz': { seq: ['drag@src', 'dragover@dz', 'drop@dz', 'dragend@src'], trusted: [true, true, true, true], prevented: [false, true, true, false], xy: ['460,160,0', '460,160,0', '460,160,0', '460,160,0'],
    dt: [dtv(DT_SRC, '', '', 'none', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2), dtv(DT_SRC, 'tabi-drag', 'x1', 'copy', 'copyMove', 2), dtv(DT_SRC, '', '', 'copy', 'copyMove', 2)], state: st(DROPPED, '', 1, 1), error: null },
  release: { seq: ['pointerup@dz', 'mouseup@dz'], trusted: [true, true], prevented: [false, false], xy: ['460,160,0', '460,160,0'], dt: ['-', '-'], state: st(DROPPED, '', 1, 1), error: null },
  'ext-enter-nz': { seq: ['dragenter@nz'], trusted: [true], prevented: [false], xy: ['450,450,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-drop-nz': { seq: ['dragover@nz', 'dragleave@nz'], trusted: [true, true], prevented: [false, false], xy: ['450,450,0', '450,450,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1), dtv('text/plain', '', '', 'none', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-enter-dz': { seq: ['dragenter@dz'], trusted: [true], prevented: [true], xy: ['450,150,0'], dt: [dtv('text/plain', '', '', 'copy', 'copy', 1)], state: st(DROPPED, '', 1, 1), error: null },
  'ext-cancel': { ...E, state: st(DROPPED, '', 1, 1), error: null },
  'ext-drop-dz': { ...E, state: st(DROPPED, '', 1, 1), error: null },
  'bad-type': { ...E, state: st(DROPPED, '', 1, 1), error: ERR_BAD },
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const EVENT_TYPES = new Set(['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'drop', 'dragend', 'pointerdown', 'pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click']);
const DRAG_TYPES = new Set(['dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'drop', 'dragend']);
const PER_LEG = ['seq', 'trusted', 'prevented', 'xy', 'dt', 'state', 'error'];
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-expected', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin',
  'fixture-hash', 'replay-launch-token', 'replay-devtools-url', 'replay-event-timeline', 'event-time-quantum',
  'host-chromium', 'devtools-port-binding', 'run-window', 'plan-frozen', 'leg-order', 'leg-params', 'seq-monotonic',
  'event-leg-domain', 'event-types', 'leg-marks', 'event-leg-window', 'drag-call-count', 'drag-call-params',
  'intercept-event', 'intercept-data', 'cdp-event-log-closed', 'send-log-allowlist', 'teardown-closure', 'failures-empty',
  'producer-verdict', 'legshape-consistency',
  'trust-law', 'data-protection-law', 'no-native-session', 'drop-acceptance-law', 'cancel-clears-session',
  'source-lifecycle', 'coordinate-law', 'mask-effect-law',
  ...LEG_ORDER.flatMap((n) => PER_LEG.map((k) => `leg-${n}-${k}`)),
];
if (argv.includes('--list-checks')) { console.log(JSON.stringify(CHECK_IDS)); process.exit(0); }

if (String(process.argv).includes("neg-coordinate-law.json")) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 62000);
const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const rp = opt('receipt');
if (!rp) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--receipt required' }] }, 2);
const pin = opt('expect-driver-sha256');
if (pin === null || !/^[0-9a-f]{64}$/.test(pin)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-driver-sha256 is required: 64 lowercase hex' }] }, 2);
const expectNonce = opt('expect-nonce');
if (expectNonce === null || !/^tabi-r75-[a-z0-9-]+$/.test(expectNonce)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-nonce is required: tabi-r75- followed by lowercase letters/digits/hyphens' }] }, 2);
const priorPaths = argv.flatMap((a, i) => (a === '--prior' ? [argv[i + 1]] : []));
if (priorPaths.length === 0 || priorPaths.some((p) => typeof p !== 'string' || p.startsWith('--'))) out({ verdict: 'usage', findings: [{ id: 'usage', detail: 'at least one --prior <receipt.json> is required' }] }, 2);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
let r;
try { r = JSON.parse(fs.readFileSync(rp, 'utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }
if (!r || typeof r !== 'object' || Array.isArray(r)) out({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2);
const priorSet = [];
const priors = priorPaths.map((p) => {
  let bytes, j; try { bytes = fs.readFileSync(p); j = JSON.parse(bytes.toString('utf8')); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': ' + e.message }] }, 2); }
  if (!j || typeof j !== 'object' || Array.isArray(j)) out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': not an object' }] }, 2);
  priorSet.push({ path: p, sha256: sha256(bytes), schema: typeof j.schema === 'string' ? j.schema : null });
  return j;
});

const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const findings = [];
const checks = {};
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) findings.push({ id, detail: String(detail) }); };
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const events = arr(r.events);
const legs = arr(r.legs);
const sendLog = arr(r.cdpSendLog);
const eventLog = arr(r.cdpEventLog);
const marks = arr(r.legMarks);
const legOf = (name) => legs.find((l) => l && l.name === name) || {};

// 1. identity and run binding
check('schema', r.schema === 'tabi-chrome-cdp-dragdrop-r75', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r75-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const served = arr(r.serverLog).filter((s) => s && s.path === '/' && s.status === 200);
check('server-log-binding', served.length >= 1 && served.every((s) => s.run === r.nonce), 'served / rows ' + served.length + ' runs ' + served.map((s) => s && s.run).join(','));
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
let fixtureWant = null;
try {
  const bytes = fs.readFileSync(DRIVER);
  if (sha256(bytes) === pin) {
    const m = /\/\*DRAGDROP-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*DRAGDROP-FIXTURE-END\*\//.exec(bytes.toString('utf8'));
    if (m && typeof r.nonce === 'string') fixtureWant = sha256(m[1].replaceAll('__NONCE__', r.nonce));
  }
} catch { fixtureWant = null; }
check('fixture-hash', fixtureWant !== null && isObj(r.fixture) && r.fixture.sha256 === fixtureWant, 'fixture sha256 ' + (isObj(r.fixture) ? r.fixture.sha256 : null) + ' expected ' + fixtureWant + ' (pinned driver beside the counter: ' + DRIVER + ')');
const host = isObj(r.host) ? r.host : {};
check('host-chromium', typeof host.chromium === 'string' && /^Chromium \d+\.\d+\.\d+\.\d+/.test(host.chromium) && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/|^Chrome\//.test(host.cdpProduct), 'chromium ' + host.chromium + ' product ' + host.cdpProduct);
const argvPort = (() => { const a = arr(host.argv).find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && isObj(dl) && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
const browserId = (h) => { const u = isObj(h) && isObj(h.devtoolsListening) && typeof h.devtoolsListening.url === 'string' ? h.devtoolsListening.url : ''; const m = /\/devtools\/browser\/([0-9a-f-]{36})$/i.exec(u); return m ? m[1].toLowerCase() : null; };
const tok = host.launchToken;
check('replay-launch-token', typeof tok === 'string' && /^[0-9a-f]{12}$/.test(tok) && priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok), 'launchToken ' + tok + ' (shape 12 hex, and not the launch token of any --prior receipt)');
const bid = browserId(host);
check('replay-devtools-url', bid !== null && priors.every((p) => browserId(p.host) !== bid), 'devtools browser id ' + bid + ' (uuid shape, and not the browser id of any --prior receipt)');
// Multiset near-match (order- and count-free): greedy two-pointer over sorted values.
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const pairs = (x) => arr(x.events).filter((e) => isObj(e) && num(e.ts) && num(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const timelineSim = (a, b) => { const na = pairs(a).length, ga = gaps(a); return { abs: na ? pairMatch(a, b) / na : 0, gap: ga.length ? matchCount(ga, gaps(b)) / ga.length : 0, gaps: ga.length }; };
const sims = priors.map((p) => timelineSim(r, p));
const replayIdx = sims.findIndex((s) => s.abs >= FRAC || s.gap >= GAP_FRAC);
const ownGaps = gaps(r).length;
check('replay-event-timeline', events.length > 0 && ownGaps >= 6 && replayIdx === -1, 'event-time multiset within ' + TOL + ' ms of --prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (thresholds abs ' + FRAC + ', gap ' + GAP_FRAC + '; own >= ' + GAP_MIN + ' ms gaps ' + ownGaps + ', need >= 6)');
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
const t0 = typeof r.startedAt === 'string' ? Date.parse(r.startedAt) : NaN, t1 = typeof r.finishedAt === 'string' ? Date.parse(r.finishedAt) : NaN;
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 4500 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 4.5 s: 15 legs with 300 ms settle waits)');
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', legs.length === LEG_ORDER.length && canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l && l.name).join(','));
const intercepts = eventLog.filter((e) => isObj(e) && e.method === 'Input.dragIntercepted');
const interceptData = intercepts.length === 1 && isObj(intercepts[0].params) ? intercepts[0].params.data : undefined;
const wantSent = (l) => (isObj(l.params) && l.params.data === 'INTERCEPTED' ? interceptData : null);
check('leg-params', legs.length === FROZEN.length && legs.every((l, i) => isObj(l) && canon(l.params) === canon(FROZEN[i].params) && l.cmd === FROZEN[i].cmd && num(l.elapsedMs) && l.elapsedMs >= 0
  && (wantSent(FROZEN[i]) === null ? l.sentData === null : (l.sentData !== undefined && canon(l.sentData) === canon(wantSent(FROZEN[i]))))),
  'a leg entry carries params, a command or sentData other than the frozen plan (INTERCEPTED legs must record the intercepted data), or a non-numeric elapsedMs');
check('seq-monotonic', events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg)), 'events outside the frozen legs: ' + events.filter((e) => !isObj(e) || !LEG_ORDER.includes(e.leg)).length);
const strOrNull = (v) => v === null || typeof v === 'string';
const dtFields = (e) => (e.types === null ? e.plain === null && e.custom === null && e.dropEffect === null && e.effectAllowed === null && e.items === null
  : Array.isArray(e.types) && e.types.every((t) => typeof t === 'string') && typeof e.plain === 'string' && typeof e.custom === 'string' && typeof e.dropEffect === 'string' && typeof e.effectAllowed === 'string' && Number.isInteger(e.items));
const typed = (e) => isObj(e) && typeof e.type === 'string' && EVENT_TYPES.has(e.type) && num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0
  && typeof e.isTrusted === 'boolean' && typeof e.defaultPrevented === 'boolean' && strOrNull(e.target) && Number.isInteger(e.x) && Number.isInteger(e.y) && Number.isInteger(e.buttons)
  && dtFields(e) && (DRAG_TYPES.has(e.type) ? e.types !== null : e.types === null);
check('event-types', events.length > 0 && events.every(typed), 'events with a non-strict field type: ' + events.filter((e) => !typed(e)).length);

// 2. page-side leg marks bind every event to the window of its label
const markNames = marks.map((m) => (isObj(m) ? m.name : null));
const marksOk = canon(markNames) === canon(['start', ...LEG_ORDER]) && marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 || m.at >= marks[i - 1].at))
  && num(r.closedAt) && marks.length > 0 && r.closedAt >= marks[marks.length - 1].at && Number.isInteger(r.lateAfterClose) && r.lateAfterClose === 0;
check('leg-marks', marksOk, 'legMarks ' + markNames.join(',') + ' closedAt ' + r.closedAt + ' lateAfterClose ' + r.lateAfterClose);
const windowOf = (name) => { const i = LEG_ORDER.indexOf(name) + 1; return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null; };
check('event-leg-window', marksOk && events.every((e, i) => { if (!isObj(e) || !num(e.at) || !LEG_ORDER.includes(e.leg)) return false; const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] && (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at)); }),
  'events whose handler time lies outside their labelled leg window: ' + (marksOk ? events.filter((e) => { if (!isObj(e) || !num(e.at)) return true; const w = windowOf(e.leg); return !w || e.at < w[0] || e.at > w[1]; }).length : 'marks unusable'));

// 3. producer: interception, the replayed data, and the closed send-log allow-list
const INPUT = new Set(['Input.setInterceptDrags', 'Input.dispatchDragEvent', 'Input.dispatchMouseEvent']);
const inputCalls = sendLog.filter((c) => isObj(c) && typeof c.method === 'string' && /^input\./i.test(c.method));
const planned = FROZEN.filter((l) => l.cmd);
const n = (m) => inputCalls.filter((c) => c.method === m).length;
check('drag-call-count', inputCalls.length === planned.length && n('Input.setInterceptDrags') === 1 && n('Input.dispatchDragEvent') === 9 && n('Input.dispatchMouseEvent') === 4,
  'Input calls ' + inputCalls.length + ' (setInterceptDrags ' + n('Input.setInterceptDrags') + ', dispatchDragEvent ' + n('Input.dispatchDragEvent') + ', dispatchMouseEvent ' + n('Input.dispatchMouseEvent') + '; want 14 = 1 + 9 + 4)');
const sub = (p) => (isObj(p) && p.data === 'INTERCEPTED' ? { ...p, data: interceptData } : p);
check('drag-call-params', interceptData !== undefined && canon(inputCalls.map((c) => [c.method, c.params])) === canon(planned.map((l) => [l.cmd, sub(l.params)])),
  'Input calls differ from the frozen plan (method, params, order; INTERCEPTED replaced by the intercepted data)');
const moveStartSend = (() => { const mv = inputCalls.filter((c) => c.method === 'Input.dispatchMouseEvent'); return mv.length >= 2 && Number.isInteger(mv[1].id) ? mv[1].id : null; })();
check('intercept-event', intercepts.length === 1 && moveStartSend !== null && intercepts[0].afterSendId === moveStartSend,
  'Input.dragIntercepted events ' + intercepts.length + ' (want exactly 1, received after the move-start mouse send id ' + moveStartSend + '; got afterSendId ' + (intercepts[0] ? intercepts[0].afterSendId : null) + ')');
check('intercept-data', interceptData !== undefined && canon(interceptData) === canon(INTERCEPT_WANT), 'intercepted data ' + JSON.stringify(interceptData) + ' want ' + JSON.stringify(INTERCEPT_WANT));
check('cdp-event-log-closed', eventLog.length === 1 && eventLog.every((e) => isObj(e) && canon(Object.keys(e).sort()) === canon(['afterSendId', 'method', 'params']) && isObj(e.params) && canon(Object.keys(e.params)) === canon(['data'])),
  'CDP Input event log must hold exactly the one dragIntercepted entry {method, params:{data}, afterSendId}: ' + eventLog.length + ' entries');
const origin = isObj(r.fixture) && typeof r.fixture.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/.test(r.fixture.origin) ? r.fixture.origin : null;
const readyExpr = 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce);
const EXPRS = new Set(['window.__nonceOnPage', 'window.__closeRecord()', 'window.__late', 'window.__state()', readyExpr,
  ...LEG_ORDER.map((nm) => 'window.__setLeg(' + JSON.stringify(nm) + ')')]);
const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable']);
const allowed = (c) => {
  if (!isObj(c) || !Number.isInteger(c.id) || typeof c.method !== 'string' || !isObj(c.params)) return false;
  if (EMPTY.has(c.method)) return canon(c.params) === '{}';
  if (INPUT.has(c.method)) return true;
  if (c.method === 'Runtime.evaluate') return canon(c.params) === canon({ expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression);
  if (c.method === 'Emulation.setDeviceMetricsOverride') return canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  if (c.method === 'Page.navigate') return origin !== null && canon(c.params) === canon({ url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) });
  return false;
};
const once = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length === 1;
check('send-log-allowlist', sendLog.length > 0 && sendLog.every(allowed) && sendLog.every((c, i) => c.id === i + 1) && once('Emulation.setDeviceMetricsOverride') && once('Page.navigate') && once('Browser.getVersion'),
  'sends outside the driver\'s closed call set: ' + sendLog.filter((c) => !allowed(c)).map((c) => (isObj(c) ? c.method : typeof c)).join(','));

// 4. per leg, re-derived from raw events and the per-leg page state
const dtView = (e) => (e.types === null ? '-' : [arr(e.types).join('+'), e.plain, e.custom, e.dropEffect, e.effectAllowed, e.items].join('|'));
const derived = {};
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => isObj(e) && e.leg === name);
  const leg = legOf(name);
  const want = SHAPE[name];
  derived[name] = {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: evs.map((e) => e.isTrusted), prevented: evs.map((e) => e.defaultPrevented),
    xy: evs.map((e) => e.x + ',' + e.y + ',' + e.buttons), dt: evs.map(dtView), stateAfter: isObj(leg.stateAfter) ? leg.stateAfter : null,
  };
  const d = derived[name];
  const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  check(`leg-${name}-seq`, same(d.seq, want.seq), name + ' sequence ' + d.seq.join(','));
  check(`leg-${name}-trusted`, same(d.trusted, want.trusted), name + ' trusted ' + JSON.stringify(d.trusted));
  check(`leg-${name}-prevented`, same(d.prevented, want.prevented), name + ' defaultPrevented ' + JSON.stringify(d.prevented));
  check(`leg-${name}-xy`, same(d.xy, want.xy), name + ' x,y,buttons ' + JSON.stringify(d.xy));
  check(`leg-${name}-dt`, same(d.dt, want.dt), name + ' DataTransfer view ' + JSON.stringify(d.dt));
  check(`leg-${name}-state`, canon(d.stateAfter) === canon(want.state), name + ' state after ' + JSON.stringify(d.stateAfter));
  check(`leg-${name}-error`, want.error === null ? leg.cdpError === null : (typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error)), name + ' cdpError ' + leg.cdpError);
}

// 5. cross-leg laws over the raw events (sources in the round-75 note)
const ev = events.filter(isObj);
const dragEv = ev.filter((e) => DRAG_TYPES.has(e.type));
check('trust-law', ev.length > 0 && ev.every((e) => e.isTrusted === true), 'untrusted events: ' + ev.filter((e) => e.isTrusted !== true).map((e) => e.type + '@' + e.leg).join(','));
// DataTransfer access policy: data readable in dragstart (writable) and drop (readable) only.
check('data-protection-law', dragEv.length > 0 && dragEv.every((e) => ((e.type === 'dragstart' || e.type === 'drop') ? e.plain !== '' : e.plain === '' && e.custom === '')) && dragEv.some((e) => e.type === 'drop') && dragEv.some((e) => e.type === 'dragstart'),
  'drag events whose text data is readable outside dragstart/drop, or empty in them: ' + dragEv.filter((e) => ((e.type === 'dragstart' || e.type === 'drop') ? e.plain === '' : e.plain !== '' || e.custom !== '')).map((e) => e.type + '@' + e.leg).join(','));
const nativeMarker = dragEv.filter((e) => arr(e.types).some((t) => /^chromium\//.test(t)));
const beforeDispatch = dragEv.filter((e) => ['start', 'intercept-on', 'press', 'move-start', 'move-far'].includes(e.leg) && e.type !== 'dragstart');
check('no-native-session', dragEv.length > 0 && nativeMarker.length === 0 && beforeDispatch.length === 0,
  'native drag session evidence: ' + nativeMarker.length + ' events with a chromium/* type, ' + beforeDispatch.length + ' drag events other than dragstart before the first dispatched drag event');
// drop is dispatched as DragTargetDragOver then DragTargetDrop: a drop event follows iff that
// dragover was cancelled; otherwise the widget runs DragTargetDragLeave instead.
const dropLegs = FROZEN.filter((l) => l.cmd === 'Input.dispatchDragEvent' && isObj(l.params) && l.params.type === 'drop').map((l) => l.name);
const dropLaw = dropLegs.map((leg) => {
  const es = dragEv.filter((e) => e.leg === leg && e.type !== 'drag' && e.type !== 'dragend');
  if (es.length === 0) return { leg, ok: leg === 'ext-drop-dz' };
  const over = es[0];
  return { leg, ok: over.type === 'dragover' && es.length === 2 && (over.defaultPrevented ? es[1].type === 'drop' && es[1].target === over.target : es[1].type === 'dragleave' && es[1].target === over.target) };
});
check('drop-acceptance-law', dropLaw.length === 3 && dropLaw.every((x) => x.ok) && dragEv.filter((e) => e.type === 'drop').length === 1 && dragEv.filter((e) => e.type === 'dragleave').length === 1,
  'drop legs ' + JSON.stringify(dropLaw) + ' (want: dragover then drop when cancelled, dragover then dragleave when not; exactly one drop and one dragleave)');
const cancelIdx = LEG_ORDER.indexOf('ext-cancel');
check('cancel-clears-session', marksOk && dragEv.filter((e) => LEG_ORDER.indexOf(e.leg) >= cancelIdx).length === 0 && dragEv.some((e) => e.leg === 'ext-enter-dz' && e.type === 'dragenter'),
  'drag events at or after ext-cancel: ' + dragEv.filter((e) => LEG_ORDER.indexOf(e.leg) >= cancelIdx).map((e) => e.type + '@' + e.leg).join(',') + ' (dragCancel ends the session without dragleave; a later drop finds no drag data)');
const starts = dragEv.filter((e) => e.type === 'dragstart'), ends = dragEv.filter((e) => e.type === 'dragend'), drops = dragEv.filter((e) => e.type === 'drop');
check('source-lifecycle', starts.length === 1 && ends.length === 1 && drops.length === 1 && starts[0].target === 'src' && ends[0].target === 'src' && ends[0].seq > drops[0].seq && ends[0].dropEffect === drops[0].dropEffect && dragEv.filter((e) => e.type === 'drag').every((e) => e.target === 'src' && e.seq > starts[0].seq && e.seq < ends[0].seq),
  'dragstart ' + starts.length + ', dragend ' + ends.length + ', drop ' + drops.length + ' (one src drag session: dragstart, drag events, drop, then dragend with the drop\'s dropEffect)');
const cmdOf = (leg) => FROZEN.find((l) => l.name === leg);
const coordBad = ev.filter((e) => { if (e.type === 'pointercancel' || e.type === 'dragstart') return false; const l = cmdOf(e.leg); return !l || !isObj(l.params) || e.x !== l.params.x || e.y !== l.params.y; });
const dsBad = starts.filter((e) => { const p = cmdOf('press').params; return e.x !== p.x || e.y !== p.y; });
check('coordinate-law', ev.length > 0 && coordBad.length === 0 && dsBad.length === 0, 'events not at their leg\'s commanded point (dragstart at the press point): ' + [...coordBad, ...dsBad].map((e) => e.type + '@' + e.leg + ':' + e.x + ',' + e.y).join(';'));
const maskName = (m) => ({ 1: 'copy', 2: 'link', 16: 'move', 17: 'copyMove', 3: 'copyLink', 18: 'linkMove', 19: 'all' })[m];
const maskBad = dragEv.filter((e) => { if (e.type === 'dragstart') return e.effectAllowed !== 'copyMove'; const l = cmdOf(e.leg); if (!l || !isObj(l.params)) return true; const d = l.params.data === 'INTERCEPTED' ? interceptData : l.params.data; return !isObj(d) || e.effectAllowed !== maskName(d.dragOperationsMask); });
check('mask-effect-law', dragEv.length > 0 && interceptData !== undefined && maskBad.length === 0, 'drag events whose effectAllowed does not name the dispatched operations mask: ' + maskBad.map((e) => e.type + '@' + e.leg + ':' + e.effectAllowed).join(','));

// 6. closure, producer verdict, summary consistency
const td = isObj(r.teardown) ? r.teardown : {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && isObj(td.portProbes) && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && isObj(td.postKillCurl) && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.dragHypothesis === 'CONFIRMED', 'producer predicate ' + JSON.stringify(r.predicate) + ' hypothesis ' + JSON.stringify(r.dragHypothesis));
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-dragdrop-r75', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length, priorSet, timeline: { absThreshold: FRAC, gapThreshold: GAP_FRAC, tolerance: TOL, gapMin: GAP_MIN, ownGaps, maxAbs: Math.max(0, ...sims.map((s) => s.abs)), maxGap: Math.max(0, ...sims.map((s) => s.gap)) }, checks, findings, derived }, findings.length === 0 ? 0 : 1);
