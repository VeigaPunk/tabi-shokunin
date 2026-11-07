#!/usr/bin/env node
// Counter for tabi round 74 C1 (capability `chromium-ime-composition-linux`, generation r74).
// Usage: node check-imecompose-r74.mjs --receipt <receipt.json> --expect-driver-sha256 <hex>
//          --expect-nonce <tabi-r74-...> --prior <receipt.json> [--prior <receipt.json> ...] [--json]
//        node check-imecompose-r74.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the page-side leg marks, the per-leg page state and the driver's CDP send log; the
// producer's own verdict (predicate true AND imeComposeHypothesis CONFIRMED, strict
// booleans/strings) and its legShape summary must ALSO agree with the re-derivation.
// Carried from the pinch generations (r72/r73): closed send-log allow-list, strict event types,
// leg marks binding each event to its leg window, required driver pin / expected nonce / priors,
// replay refusal on launch token and DevTools browser id. New in r74:
//  - replay-event-timeline is a NEAR match, not a hash: a receipt whose event count equals a
//    prior's and whose every event ts and at lies within 0.05 ms (half the page clock's 0.1 ms
//    quantum) of that prior's is a replay (the r73 hash was defeated by one 1e-12 perturbation,
//    R73Review1 section 1.4). event-time-quantum: every ts and at sits on the 0.1 ms grid
//    (within 1e-5 of a grid point), so an escape needs at least one on-grid shift of >= 0.1 ms.
//    Measured before the freeze: the 36 honest pre-freeze pairs differ by >= 1.0 ms somewhere.
//  - fixture-hash: the receipt's fixture sha256 equals the sha256 of the fixture template held
//    in the pinned driver file (located beside this counter and re-hashed against the pin) with
//    the receipt's nonce substituted.
//  - laws read across legs from raw events: composition data chain, isComposing by inputType,
//    trust (compositionend untrusted, every other event trusted), compositionstart data equals the
//    selected text, no keyboard events, no-focus composition inert.
// Limit (declared): this counter reads a receipt; it is not an execution oracle. A same-user
// forger who rewrites the nonce, the launch token, the DevTools browser id and moves at least one
// event time of a prior receipt by a whole 0.1 ms quantum is not refused.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const VIEWPORT = { width: 1280, height: 900 };
const DRIVER = fileURLToPath(new URL('./chrome-cdp-imecompose-round74.mjs', import.meta.url));
const ERR_HALF = 'Either both replacement start/end are specified or neither.';
const FROZEN = [
  { name: 'start', cmd: null, params: null },
  { name: 'focus-f', focus: 'f', cmd: null, params: null },
  { name: 'compose-a', cmd: 'Input.imeSetComposition', params: { text: '\u304b', selectionStart: 1, selectionEnd: 1 } },
  { name: 'compose-b', cmd: 'Input.imeSetComposition', params: { text: '\u304b\u306a', selectionStart: 2, selectionEnd: 2 } },
  { name: 'commit', cmd: 'Input.insertText', params: { text: '\u4eee\u540d' } },
  { name: 'plain', cmd: 'Input.insertText', params: { text: 'ab' } },
  { name: 'select-f', select: ['f', 2, 4], cmd: null, params: null },
  { name: 'compose-c', cmd: 'Input.imeSetComposition', params: { text: 'x', selectionStart: 1, selectionEnd: 1 } },
  { name: 'replace-half', cmd: 'Input.imeSetComposition', params: { text: 'q', selectionStart: 1, selectionEnd: 1, replacementStart: 0 } },
  { name: 'cancel', cmd: 'Input.imeSetComposition', params: { text: '', selectionStart: 0, selectionEnd: 0 } },
  { name: 'focus-ce', focus: 'ce', cmd: null, params: null },
  { name: 'ce-compose', cmd: 'Input.imeSetComposition', params: { text: 'e\u0301', selectionStart: 2, selectionEnd: 2 } },
  { name: 'ce-commit', cmd: 'Input.insertText', params: { text: '\u00e9' } },
  { name: 'blur', focus: null, cmd: null, params: null },
  { name: 'nofocus-compose', cmd: 'Input.imeSetComposition', params: { text: 'z', selectionStart: 1, selectionEnd: 1 } },
  { name: 'nofocus-insert', cmd: 'Input.insertText', params: { text: 'z' } },
];
const CS = 'compositionstart', CU = 'compositionupdate', CE = 'compositionend';
const BC = 'beforeinput(insertCompositionText)', IC = 'input(insertCompositionText)';
const BT = 'beforeinput(insertText)', IT = 'input(insertText)';
const st = (f, a, b, ce, active) => ({ f, fSel: [a, b], ce, active });
// Expected per-leg shape (focusin/focusout excluded): event tags, isTrusted per event, data per
// event ('-' = no data field), isComposing per event, targets, page state after the leg, CDP error.
const KA = '\u304b', KANA = '\u304b\u306a', KAMEI = '\u4eee\u540d', ED = 'e\u0301', EP = '\u00e9';
const SHAPE = {
  start: { seq: [], trusted: [], data: [], composing: [], targets: [], state: st('', 0, 0, '', 'BODY'), error: null },
  'focus-f': { seq: [], trusted: [], data: [], composing: [], targets: [], state: st('', 0, 0, '', 'f'), error: null },
  'compose-a': { seq: [CS, CU, BC, IC], trusted: [true, true, true, true], data: ['', KA, KA, KA], composing: [null, null, true, true], targets: ['f'], state: st(KA, 1, 1, '', 'f'), error: null },
  'compose-b': { seq: [CU, BC, IC], trusted: [true, true, true], data: [KANA, KANA, KANA], composing: [null, true, true], targets: ['f'], state: st(KANA, 2, 2, '', 'f'), error: null },
  commit: { seq: [CU, BC, 'textInput', IC, CE], trusted: [true, true, true, true, false], data: [KAMEI, KAMEI, KAMEI, KAMEI, KAMEI], composing: [null, true, null, true, null], targets: ['f'], state: st(KAMEI, 2, 2, '', 'f'), error: null },
  plain: { seq: [BT, 'textInput', IT], trusted: [true, true, true], data: ['ab', 'ab', 'ab'], composing: [false, null, false], targets: ['f'], state: st(KAMEI + 'ab', 4, 4, '', 'f'), error: null },
  'select-f': { seq: [], trusted: [], data: [], composing: [], targets: [], state: st(KAMEI + 'ab', 2, 4, '', 'f'), error: null },
  'compose-c': { seq: [CS, CU, BC, IC], trusted: [true, true, true, true], data: ['ab', 'x', 'x', 'x'], composing: [null, null, true, true], targets: ['f'], state: st(KAMEI + 'x', 3, 3, '', 'f'), error: null },
  'replace-half': { seq: [], trusted: [], data: [], composing: [], targets: [], state: st(KAMEI + 'x', 3, 3, '', 'f'), error: ERR_HALF },
  cancel: { seq: [CU, BC, 'textInput', IC, CE], trusted: [true, true, true, true, false], data: ['', '', '', null, ''], composing: [null, true, null, true, null], targets: ['f'], state: st(KAMEI, 2, 2, '', 'f'), error: null },
  'focus-ce': { seq: [], trusted: [], data: [], composing: [], targets: [], state: st(KAMEI, 2, 2, '', 'ce'), error: null },
  'ce-compose': { seq: [CS, CU, BC, IC], trusted: [true, true, true, true], data: ['', ED, ED, ED], composing: [null, null, true, true], targets: ['ce'], state: st(KAMEI, 2, 2, ED, 'ce'), error: null },
  'ce-commit': { seq: [CU, BC, 'textInput', IC, CE], trusted: [true, true, true, true, false], data: [EP, EP, EP, EP, EP], composing: [null, true, null, true, null], targets: ['ce'], state: st(KAMEI, 2, 2, EP, 'ce'), error: null },
  blur: { seq: [], trusted: [], data: [], composing: [], targets: [], state: st(KAMEI, 2, 2, EP, 'BODY'), error: null },
  'nofocus-compose': { seq: [], trusted: [], data: [], composing: [], targets: [], state: st(KAMEI, 2, 2, EP, 'BODY'), error: null },
  'nofocus-insert': { seq: ['textInput', IT], trusted: [true, true], data: ['z', 'z'], composing: [null, false], targets: ['BODY', 'ce'], state: st(KAMEI, 2, 2, EP + 'z', 'ce'), error: null },
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const EVENT_TYPES = new Set(['compositionstart', 'compositionupdate', 'compositionend', 'beforeinput', 'input', 'textInput', 'keydown', 'keypress', 'keyup', 'focusin', 'focusout']);
const PER_LEG = ['seq', 'trusted', 'data', 'composing', 'target', 'state', 'error'];
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-expected', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin',
  'fixture-hash', 'replay-launch-token', 'replay-devtools-url', 'replay-event-timeline', 'event-time-quantum',
  'host-chromium', 'devtools-port-binding', 'run-window', 'plan-frozen', 'leg-order', 'leg-params', 'seq-monotonic',
  'event-leg-domain', 'event-types', 'leg-marks', 'event-leg-window', 'ime-call-count', 'ime-call-params',
  'send-log-allowlist', 'teardown-closure', 'failures-empty', 'producer-verdict', 'legshape-consistency',
  'composition-data-chain', 'composing-by-input-type', 'trust-law', 'compositionstart-selected-text', 'no-keyboard-events',
  'focus-events-bound',
  ...LEG_ORDER.flatMap((n) => PER_LEG.map((k) => `leg-${n}-${k}`)),
];
if (argv.includes('--list-checks')) { console.log(''); process.exit(0); }

const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const rp = opt('receipt');
if (!rp) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--receipt required' }] }, 2);
const pin = opt('expect-driver-sha256');
if (pin === null || !/^[0-9a-f]{64}$/.test(pin)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-driver-sha256 is required: 64 lowercase hex' }] }, 2);
const expectNonce = opt('expect-nonce');
if (expectNonce === null || !/^tabi-r74-[a-z0-9-]+$/.test(expectNonce)) out({ verdict: 'usage', findings: [{ id: 'usage', detail: '--expect-nonce is required: tabi-r74- followed by lowercase letters/digits/hyphens' }] }, 2);
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

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
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
const marks = arr(r.legMarks);
const legOf = (name) => legs.find((l) => l && l.name === name) || {};
const tag = (e) => e.type + (typeof e.inputType === 'string' && e.inputType ? '(' + e.inputType + ')' : '');
const FOCUS = new Set(['focusin', 'focusout']);

// 1. identity and run binding
check('schema', r.schema === 'tabi-chrome-cdp-imecompose-r74', 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r74-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
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
    const m = /\/\*IMECOMPOSE-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*IMECOMPOSE-FIXTURE-END\*\//.exec(bytes.toString('utf8'));
    if (m && typeof r.nonce === 'string') fixtureWant = sha256(m[1].replaceAll('\\\\', '\\').replaceAll('__NONCE__', r.nonce));
  }
} catch { fixtureWant = null; }
check('fixture-hash', fixtureWant !== null && isObj(r.fixture) && r.fixture.sha256 === fixtureWant, 'fixture sha256 ' + (isObj(r.fixture) ? r.fixture.sha256 : null) + ' expected ' + fixtureWant + ' (pinned driver beside the counter: ' + DRIVER + ')');
const host = isObj(r.host) ? r.host : {};
check('host-chromium', typeof host.chromium === 'string' && /^Chromium \d+\.\d+\.\d+\.\d+/.test(host.chromium) && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/|^Chrome\//.test(host.cdpProduct), 'chromium ' + host.chromium + ' product ' + host.cdpProduct);
const argvPort = (() => { const a = arr(host.argv).find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && isObj(dl) && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
const browserId = (h) => { const u = isObj(h) && isObj(h.devtoolsListening) && typeof h.devtoolsListening.url === 'string' ? h.devtoolsListening.url : ''; const m = /\/devtools\/browser\/([0-9a-f-]{36})$/.exec(u); return m ? m[1] : null; };
const tok = host.launchToken;
check('replay-launch-token', typeof tok === 'string' && /^[0-9a-f]{12}$/.test(tok) && priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok), 'launchToken ' + tok + ' (shape 12 hex, and not the launch token of any --prior receipt)');
const bid = browserId(host);
check('replay-devtools-url', bid !== null && priors.every((p) => browserId(p.host) !== bid), 'devtools browser id ' + bid + ' (uuid shape, and not the browser id of any --prior receipt)');
const nearTimeline = (a, b) => { const x = arr(a.events), y = arr(b.events); return x.length > 0 && x.length === y.length && x.every((e, i) => isObj(e) && isObj(y[i]) && num(e.ts) && num(y[i].ts) && num(e.at) && num(y[i].at) && Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05); };
const nearPrior = priors.findIndex((p) => nearTimeline(r, p));
check('replay-event-timeline', events.length > 0 && nearPrior === -1, 'event timeline within 0.05 ms of --prior #' + nearPrior + ' (or no events)');
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
const t0 = typeof r.startedAt === 'string' ? Date.parse(r.startedAt) : NaN, t1 = typeof r.finishedAt === 'string' ? Date.parse(r.finishedAt) : NaN;
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 4000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 4 s: 16 legs with settle waits)');
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', legs.length === LEG_ORDER.length && canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER), 'legs ' + legs.map((l) => l && l.name).join(','));
check('leg-params', legs.length === FROZEN.length && legs.every((l, i) => isObj(l) && canon(l.params) === canon(FROZEN[i].params) && l.cmd === FROZEN[i].cmd && num(l.elapsedMs) && l.elapsedMs >= 0),
  'a leg entry carries params or a command other than the frozen plan, or a non-numeric elapsedMs');
check('seq-monotonic', events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg)), 'events outside the frozen legs: ' + events.filter((e) => !isObj(e) || !LEG_ORDER.includes(e.leg)).length);
const strOrNull = (v) => v === null || typeof v === 'string';
const intOrNull = (v) => v === null || Number.isInteger(v);
const typed = (e) => isObj(e) && typeof e.type === 'string' && EVENT_TYPES.has(e.type) && num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0
  && typeof e.isTrusted === 'boolean' && (!('data' in e) || strOrNull(e.data)) && strOrNull(e.inputType) && (e.isComposing === null || typeof e.isComposing === 'boolean')
  && strOrNull(e.key) && strOrNull(e.target) && strOrNull(e.value) && intOrNull(e.selStart) && intOrNull(e.selEnd);
check('event-types', events.length > 0 && events.every(typed), 'events with a non-strict field type: ' + events.filter((e) => !typed(e)).length);

// 2. page-side leg marks bind every event to the window of its label
const markNames = marks.map((m) => (isObj(m) ? m.name : null));
const marksOk = canon(markNames) === canon(['start', ...LEG_ORDER]) && marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 || m.at >= marks[i - 1].at))
  && num(r.closedAt) && marks.length > 0 && r.closedAt >= marks[marks.length - 1].at && Number.isInteger(r.lateAfterClose) && r.lateAfterClose === 0;
check('leg-marks', marksOk, 'legMarks ' + markNames.join(',') + ' closedAt ' + r.closedAt + ' lateAfterClose ' + r.lateAfterClose);
const windowOf = (name) => { const i = LEG_ORDER.indexOf(name) + 1; return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null; };
check('event-leg-window', marksOk && events.every((e, i) => { if (!isObj(e) || !num(e.at) || !LEG_ORDER.includes(e.leg)) return false; const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] && (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at)); }),
  'events whose handler time lies outside their labelled leg window: ' + (marksOk ? events.filter((e) => { if (!isObj(e) || !num(e.at)) return true; const w = windowOf(e.leg); return !w || e.at < w[0] || e.at > w[1]; }).length : 'marks unusable'));

// 3. producer: the send log is exactly the driver's own call set (closed allow-list)
const IME = new Set(['Input.imeSetComposition', 'Input.insertText']);
const imeCalls = sendLog.filter((c) => isObj(c) && IME.has(c.method));
const planned = FROZEN.filter((l) => l.cmd);
check('ime-call-count', imeCalls.length === planned.length, 'IME calls ' + imeCalls.length + ' want ' + planned.length);
check('ime-call-params', canon(imeCalls.map((c) => [c.method, c.params])) === canon(planned.map((l) => [l.cmd, l.params])), 'IME calls differ from the frozen plan (method, params, order)');
const origin = isObj(r.fixture) && typeof r.fixture.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/.test(r.fixture.origin) ? r.fixture.origin : null;
const readyExpr = 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce);
const EXPRS = new Set(['window.__nonceOnPage', 'window.__closeRecord()', 'window.__late', 'window.__state()', readyExpr,
  'window.__focus("f")', 'window.__focus("ce")', 'window.__focus(null)', 'window.__select("f", 2, 4)',
  ...LEG_ORDER.map((n) => 'window.__setLeg(' + JSON.stringify(n) + ')')]);
const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable']);
const allowed = (c) => {
  if (!isObj(c) || !Number.isInteger(c.id) || typeof c.method !== 'string' || !isObj(c.params)) return false;
  if (EMPTY.has(c.method)) return canon(c.params) === '{}';
  if (IME.has(c.method)) return true;
  if (c.method === 'Runtime.evaluate') return canon(c.params) === canon({ expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression);
  if (c.method === 'Emulation.setDeviceMetricsOverride') return canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  if (c.method === 'Page.navigate') return origin !== null && canon(c.params) === canon({ url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) });
  return false;
};
const once = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length === 1;
check('send-log-allowlist', sendLog.length > 0 && sendLog.every(allowed) && sendLog.every((c, i) => c.id === i + 1) && once('Emulation.setDeviceMetricsOverride') && once('Page.navigate') && once('Browser.getVersion'),
  'sends outside the driver\'s closed call set: ' + sendLog.filter((c) => !allowed(c)).map((c) => (isObj(c) ? c.method : typeof c)).join(','));

// 4. per leg, re-derived from raw events and the per-leg page state
const derived = {};
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => isObj(e) && e.leg === name && !FOCUS.has(e.type));
  const leg = legOf(name);
  const want = SHAPE[name];
  derived[name] = {
    seq: evs.map(tag), trusted: evs.map((e) => e.isTrusted),
    data: evs.map((e) => (e.data === undefined ? '-' : e.data)), composing: evs.map((e) => e.isComposing),
    targets: [...new Set(evs.map((e) => e.target))], stateAfter: isObj(leg.stateAfter) ? leg.stateAfter : null,
  };
  const d = derived[name];
  check(`leg-${name}-seq`, canon(d.seq) === canon(want.seq), name + ' sequence ' + d.seq.join(','));
  check(`leg-${name}-trusted`, d.trusted.length === want.trusted.length && d.trusted.every((v, i) => v === want.trusted[i]), name + ' trusted ' + JSON.stringify(d.trusted));
  check(`leg-${name}-data`, d.data.length === want.data.length && d.data.every((v, i) => v === want.data[i]), name + ' data ' + JSON.stringify(d.data));
  check(`leg-${name}-composing`, d.composing.length === want.composing.length && d.composing.every((v, i) => v === want.composing[i]), name + ' isComposing ' + JSON.stringify(d.composing));
  check(`leg-${name}-target`, canon(d.targets) === canon(want.targets), name + ' targets ' + JSON.stringify(d.targets));
  check(`leg-${name}-state`, canon(d.stateAfter) === canon(want.state), name + ' state after ' + JSON.stringify(d.stateAfter));
  check(`leg-${name}-error`, want.error === null ? leg.cdpError === null : (typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error)), name + ' cdpError ' + leg.cdpError);
}

// 5. cross-leg laws over the raw events (sources in the round-74 note)
const ime = events.filter((e) => isObj(e) && !FOCUS.has(e.type));
// Composition sessions: compositionstart opens, compositionend closes. Inside a session every
// compositionupdate's data reappears as the next beforeinput's data; the session's compositionend
// carries the last update's data.
let chainOk = ime.length > 0, open = false, lastUpdate = null, sessions = 0;
for (let i = 0; i < ime.length && chainOk; i++) {
  const e = ime[i];
  if (e.type === CS) { if (open) chainOk = false; open = true; lastUpdate = null; sessions++; }
  else if (e.type === CU) { if (!open) chainOk = false; lastUpdate = e.data; const nb = ime.slice(i + 1).find((x) => x.type === 'beforeinput'); if (!nb || nb.data !== e.data || nb.inputType !== 'insertCompositionText') chainOk = false; }
  else if (e.type === CE) { if (!open || e.data !== lastUpdate) chainOk = false; open = false; }
  else if (/^(beforeinput|input)$/.test(e.type) && e.inputType === 'insertCompositionText' && !open) chainOk = false;
}
check('composition-data-chain', chainOk && !open && sessions === 3, 'composition sessions ' + sessions + ' (want 3, all closed), chain ok ' + chainOk);
const bi = ime.filter((e) => e.type === 'beforeinput' || e.type === 'input');
check('composing-by-input-type', bi.length > 0 && bi.every((e) => (e.inputType === 'insertCompositionText' ? e.isComposing === true : e.inputType === 'insertText' ? e.isComposing === false : false)),
  'beforeinput/input with isComposing not matching inputType (insertCompositionText => true, insertText => false), or another inputType');
check('trust-law', events.length > 0 && events.every((e) => isObj(e) && (e.type === CE ? e.isTrusted === false : e.isTrusted === true)) && events.some((e) => isObj(e) && e.type === CE),
  'every compositionend must be untrusted (DispatchScopedEvent never sets trust) and every other recorded event trusted');
const starts = ime.filter((e) => e.type === CS);
check('compositionstart-selected-text', starts.length === 3 && starts.every((e) => typeof e.value === 'string' && Number.isInteger(e.selStart) && Number.isInteger(e.selEnd) && e.data === e.value.slice(e.selStart, e.selEnd)) && starts.some((e) => e.data !== ''),
  'compositionstart data is not the target\'s selected text at dispatch, or no start carried a non-empty selection');
check('no-keyboard-events', events.length > 0 && events.every((e) => isObj(e) && !/^key/.test(e.type)), 'keyboard events recorded: ' + events.filter((e) => isObj(e) && /^key/.test(e.type)).length);
const fo = events.filter((e) => isObj(e) && FOCUS.has(e.type));
check('focus-events-bound', fo.every((e) => ['f', 'ce'].includes(e.target)) && fo.filter((e) => e.type === 'focusout').map((e) => e.leg).join(',') === 'focus-ce,blur',
  'focus events off the two editables, or focusout outside focus-ce/blur: ' + fo.map((e) => e.type + '@' + e.leg + ':' + e.target).join(','));

// 6. closure, producer verdict, summary consistency
const td = isObj(r.teardown) ? r.teardown : {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && isObj(td.portProbes) && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && isObj(td.postKillCurl) && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.imeComposeHypothesis === 'CONFIRMED', 'producer predicate ' + JSON.stringify(r.predicate) + ' hypothesis ' + JSON.stringify(r.imeComposeHypothesis));
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-imecompose-r74', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length, checks, findings, derived }, findings.length === 0 ? 0 : 1);
