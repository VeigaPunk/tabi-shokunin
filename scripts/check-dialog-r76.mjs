#!/usr/bin/env node
// Counter for tabi round 76 C1 (capability `chromium-js-dialog-linux`, generation r76).
// Usage: node check-dialog-r76.mjs --lane <ABS lane root> --receipt <receipt.json>
//          --expect-driver-sha256 <hex> --expect-nonce <tabi-r76-...>
//          --prior-set <file: one lane-relative receipt path per line, '#' comments>
//          [--prior <receipt.json> ...] [--json]
//        node check-dialog-r76.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt, prior or prior set.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the page-side leg marks, the per-leg records, the driver's CDP send log and its CDP event
// log; the producer's own verdict (predicate true AND dialogHypothesis CONFIRMED, strict
// booleans/strings) and its legShape summary must ALSO agree with the re-derivation.
// Carried from r72-r75: closed send-log allow-list, strict event fields, leg marks binding each
// event to its leg window, required driver pin / expected nonce, replay refusal on launch token,
// DevTools browser id and the event-time multiset/gap near-match, 0.1 ms event-time quantum,
// fixture hash from the pinned driver, the output records the prior set it read.
// New in r76 (round-75 routed defects, R75Review1 F1-F6):
//  - host pins are exact values, not shapes: `Chromium 155.0.8059.84 Arch Linux`, product
//    `Chrome/155.0.8059.84`, protocol 1.3, and the argv must carry `--headless=new`, loopback
//    DevTools address and a profile dir bound to the launch token (F1/F2).
//  - a CDP error is compared as the protocol's {code, message} object, code included (F3).
//  - every comparison is structural (arrays/objects compared canonically; nothing is '|'-joined,
//    so distinct values cannot collapse into one string) (F4).
//  - the prior set is READ FROM A COMMITTED FILE (--prior-set; usage exit 2 if absent, empty or
//    unreadable), its sha256 is recorded, and `prior-set-complete` refuses when a receipt of this
//    schema (a `*.json` regular file whose top-level `schema` is the receipt schema; symlinks, to
//    files or directories, are skipped) under the round-76 wave tree or evidence tree, other than one carrying the
//    expected nonce, is not among the priors (F6: a caller that omits PRE no longer gets `clean`).
//  - every recorded field of a leg record is read (F5: cdpResult was unread in r75): trigger and
//    handle results/errors, the bound send ids, the handle params actually sent.
// Laws (sources in the round-76 note): every page event trusted; the page's dialog return value
// is the function of (dialog type, accept, promptText) the browser-side handler implies (prompt
// accepted without promptText returns "", dismissed returns null); javascriptDialogClosed echoes
// accept and promptText (even on dismiss); the page is blocked inside the dialog function until
// the answer (return recorded after a non-zero block, before the click reaches window); answering
// with no dialog open is refused -32602; a dismissed beforeunload aborts the navigation
// (net::ERR_ABORTED, page stays), an accepted one navigates; coordinates equal the commanded point.
// Limit (declared): this counter reads a receipt; it is not an execution oracle. A same-user
// forger who rewrites the nonce, the launch token and the DevTools browser id of a prior receipt
// (or of any receipt outside the --prior set and not a `*.json` file under the two walked trees) is not refused once,
// for a receipt of 37 events and 6 gaps of >= 50 ms (every honest r76 receipt), at least 19 of the
// 37 events have ts or at moved by >= 0.1 ms (on the 0.1 ms grid the smallest move past the
// 0.05 ms tolerance; abs fraction then <= 18/37 < 0.5) AND at least 2 of the 6 gaps change by
// >= 0.1 ms (gap fraction <= 4/6 < 0.75); nor is a receipt fabricated from nothing that
// satisfies every check.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const SCHEMA = 'tabi-chrome-cdp-dialog-r76';
const VIEWPORT = { width: 1280, height: 900 };
const DRIVER = fileURLToPath(new URL('./chrome-cdp-dialog-round76.mjs', import.meta.url));
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3' };
const FROZEN = [
  { name: 'start', kind: null, at: null, path: null, handle: null },
  { name: 'alert-accept', kind: 'click', at: [150, 120], path: null, handle: { accept: true } },
  { name: 'confirm-accept', kind: 'click', at: [300, 120], path: null, handle: { accept: true } },
  { name: 'confirm-dismiss', kind: 'click', at: [300, 120], path: null, handle: { accept: false } },
  { name: 'prompt-text', kind: 'click', at: [450, 120], path: null, handle: { accept: true, promptText: 'tabi-typed' } },
  { name: 'prompt-noparam', kind: 'click', at: [450, 120], path: null, handle: { accept: true } },
  { name: 'prompt-dismiss', kind: 'click', at: [450, 120], path: null, handle: { accept: false, promptText: 'tabi-ignored' } },
  { name: 'no-dialog', kind: 'handle-only', at: null, path: null, handle: { accept: true } },
  { name: 'unload-dismiss', kind: 'navigate', at: null, path: '/next', handle: { accept: false } },
  { name: 'unload-accept', kind: 'navigate', at: null, path: '/next', handle: { accept: true } },
];
const BUTTON = { 150: 'a', 300: 'c', 450: 'p' };
const KIND_OF = { a: 'alert', c: 'confirm', p: 'prompt' };
const MESSAGE = { alert: 'tabi-alert', confirm: 'tabi-confirm', prompt: 'tabi-prompt', beforeunload: '' };
const DEFAULT_PROMPT = { alert: '', confirm: '', prompt: 'tabi-default', beforeunload: '' };
const NO_DIALOG = { code: -32602, message: 'No dialog is showing' };
const T = [true, true, true, true, true, true], F6 = [false, false, false, false, false, false];
const click = (b, x, ret, dialog, st) => ({ seq: ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'dialog-return', 'click'].map((t) => t + '@' + b), trusted: T, prevented: F6,
  xy: [[x, 120, 1], [x, 120, 1], [x, 120, 0], [x, 120, 0], [null, null, null], [x, 120, 0]], ret: [ret], dialog, handleError: null, triggerError: null, nav: null, stateAfter: st });
const st = (dialogs, last, unloads) => ({ dialogs, last, unloads, path: '/' });
const E = { seq: [], trusted: [], prevented: [], xy: [], ret: [] };
// Expected per-leg shape: page events `type@target`, isTrusted, defaultPrevented, [x, y, buttons],
// the dialog return values [kind, repr], the CDP events bound to the leg, the handle/trigger
// errors as {code, message}, Page.navigate's errorText, the page state after the leg. Filled from
// the pre-freeze probe receipts (controls/c1/probe/p1-p4).
const SHAPE = {
  start: { ...E, dialog: [], handleError: null, triggerError: null, nav: null, stateAfter: st(0, '-', 0) },
  'alert-accept': click('a', 150, ['alert', 'undefined'], [['opening', 'alert', 'tabi-alert', '', true, '/'], ['closed', true, '']], st(1, 'alert=undefined', 0)),
  'confirm-accept': click('c', 300, ['confirm', 'true'], [['opening', 'confirm', 'tabi-confirm', '', true, '/'], ['closed', true, '']], st(2, 'confirm=true', 0)),
  'confirm-dismiss': click('c', 300, ['confirm', 'false'], [['opening', 'confirm', 'tabi-confirm', '', true, '/'], ['closed', false, '']], st(3, 'confirm=false', 0)),
  'prompt-text': click('p', 450, ['prompt', 'string:tabi-typed'], [['opening', 'prompt', 'tabi-prompt', 'tabi-default', true, '/'], ['closed', true, 'tabi-typed']], st(4, 'prompt=string:tabi-typed', 0)),
  'prompt-noparam': click('p', 450, ['prompt', 'string:'], [['opening', 'prompt', 'tabi-prompt', 'tabi-default', true, '/'], ['closed', true, '']], st(5, 'prompt=string:', 0)),
  'prompt-dismiss': click('p', 450, ['prompt', 'null'], [['opening', 'prompt', 'tabi-prompt', 'tabi-default', true, '/'], ['closed', false, 'tabi-ignored']], st(6, 'prompt=null', 0)),
  'no-dialog': { ...E, dialog: [], handleError: NO_DIALOG, triggerError: null, nav: null, stateAfter: st(6, 'prompt=null', 0) },
  'unload-dismiss': { seq: ['beforeunload@#document'], trusted: [true], prevented: [true], xy: [[null, null, null]], ret: [], dialog: [['opening', 'beforeunload', '', '', true, '/'], ['closed', false, '']],
    handleError: null, triggerError: null, nav: 'net::ERR_ABORTED', stateAfter: st(6, 'prompt=null', 1) },
  'unload-accept': { ...E, dialog: [['opening', 'beforeunload', '', '', true, '/'], ['closed', true, ''], ['navigated', '/next']], handleError: null, triggerError: null, nav: null,
    stateAfter: { path: '/next', runIsNonce: true, pageNonceIsNonce: true } },
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const RECORDED = LEG_ORDER.slice(0, -1); // legs inside the page-side record (unload-accept leaves the page)
const EVENT_TYPES = new Set(['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'beforeunload', 'dialog-return']);
const PER_LEG = ['seq', 'trusted', 'prevented', 'xy', 'ret', 'dialog', 'error', 'nav', 'state'];
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-expected', 'nonce-on-page', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin', 'fixture-hash',
  'host-chromium', 'host-argv', 'devtools-port-binding', 'replay-launch-token', 'replay-devtools-url', 'replay-event-timeline', 'prior-set-complete',
  'event-time-quantum', 'run-window', 'plan-frozen', 'leg-order', 'leg-records', 'seq-monotonic', 'event-leg-domain', 'event-types', 'leg-marks', 'event-leg-window',
  'dialog-call-count', 'dialog-call-params', 'cdp-event-log-closed', 'dialog-event-binding', 'send-log-allowlist',
  ...LEG_ORDER.flatMap((n) => PER_LEG.map((k) => `leg-${n}-${k}`)),
  'trust-law', 'return-value-law', 'closed-echo-law', 'blocking-law', 'no-dialog-law', 'beforeunload-law', 'coordinate-law',
  'teardown-closure', 'failures-empty', 'producer-verdict', 'legshape-consistency',
];
if (argv.includes('--list-checks')) { console.log(JSON.stringify(CHECK_IDS)); process.exit(0); }

const out = (o, code) => { console.log(asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')); process.exit(code); };
const usage = (d) => out({ verdict: 'usage', findings: [{ id: 'usage', detail: d }] }, 2);
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane) || !fs.existsSync(path.join(lane, 'scripts'))) usage('--lane <absolute lane root> is required');
const rp = opt('receipt');
if (!rp) usage('--receipt required');
const pin = opt('expect-driver-sha256');
if (pin === null || !/^[0-9a-f]{64}$/.test(pin)) usage('--expect-driver-sha256 is required: 64 lowercase hex');
const expectNonce = opt('expect-nonce');
if (expectNonce === null || !/^tabi-r76-[a-z0-9-]+$/.test(expectNonce)) usage('--expect-nonce is required: tabi-r76- followed by lowercase letters/digits/hyphens');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const psFile = opt('prior-set');
if (!psFile) usage('--prior-set <committed prior-set file> is required (round-75 routed defect: a caller that omits the prior set must not get clean)');
let psBytes;
try { psBytes = fs.readFileSync(psFile); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set ' + psFile + ': ' + e.message }] }, 2); }
const psLines = psBytes.toString('utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
if (psLines.length === 0) usage('--prior-set lists no receipt');
const extraPriors = argv.flatMap((a, i) => (a === '--prior' ? [argv[i + 1]] : []));
if (extraPriors.some((p) => typeof p !== 'string' || p.startsWith('--'))) usage('--prior needs a path');
const priorPaths = [...psLines.map((l) => path.join(lane, l)), ...extraPriors];
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
const legOf = (name) => legs.find((l) => isObj(l) && l.name === name) || {};
const planOf = (name) => FROZEN.find((l) => l.name === name);

// 1. identity and run binding
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r76-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const slog = arr(r.serverLog);
const servedRoot = slog.filter((s) => isObj(s) && s.path === '/' && s.status === 200);
const servedNext = slog.filter((s) => isObj(s) && s.path === '/next' && s.status === 200);
const otherRows = slog.filter((s) => !isObj(s) || !((s.path === '/' && s.status === 200) || (s.path === '/next' && s.status === 200) || (s.path === '/favicon.ico' && s.status === 404 && s.run === '')));
check('server-log-binding', servedRoot.length === 1 && servedNext.length === 1 && [...servedRoot, ...servedNext].every((s) => s.run === r.nonce && s.query === 'run=' + encodeURIComponent(String(r.nonce))) && otherRows.length === 0,
  'served / rows ' + servedRoot.length + ', /next rows ' + servedNext.length + ' (want 1 each, run = nonce), other rows ' + otherRows.length);
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
let fixtureWant = null, nextWant = null;
try {
  const bytes = fs.readFileSync(DRIVER);
  if (sha256(bytes) === pin) {
    const s = bytes.toString('utf8');
    const m = /\/\*DIALOG-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\nconst NEXT_TEMPLATE = `([\s\S]*?)`;\n\/\*DIALOG-FIXTURE-END\*\//.exec(s);
    if (m && typeof r.nonce === 'string') { fixtureWant = sha256(m[1].replaceAll('__NONCE__', r.nonce)); nextWant = sha256(m[2].replaceAll('__NONCE__', r.nonce)); }
  }
} catch { fixtureWant = null; }
check('fixture-hash', fixtureWant !== null && isObj(r.fixture) && r.fixture.sha256 === fixtureWant && r.fixture.nextSha256 === nextWant && canon(r.fixture.viewport) === canon(VIEWPORT),
  'fixture sha256 ' + (isObj(r.fixture) ? r.fixture.sha256 + '/' + r.fixture.nextSha256 : null) + ' expected ' + fixtureWant + '/' + nextWant + ' (pinned driver beside the counter: ' + DRIVER + ')');
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion,
  'chromium ' + JSON.stringify(host.chromium) + ' product ' + JSON.stringify(host.cdpProduct) + ' protocol ' + JSON.stringify(host.cdpProtocolVersion) + ' (pinned ' + JSON.stringify(HOST) + ')');
const hargv = arr(host.argv);
const tok = host.launchToken;
const argvOk = hargv.length === 17 && hargv[0] === '/usr/bin/chromium' && hargv[1] === '--headless=new' && hargv.filter((a) => a === '--headless=new').length === 1
  && !hargv.some((a) => typeof a !== 'string' || /^--headless(=old)?$|^--headless=(?!new$)/.test(a)) && hargv.includes('--remote-debugging-address=127.0.0.1')
  && hargv.includes('--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height) && hargv[16] === 'about:blank'
  && typeof tok === 'string' && hargv.some((a) => typeof a === 'string' && a.startsWith('--user-data-dir=') && a.endsWith('/profile-' + tok));
check('host-argv', argvOk, 'argv ' + JSON.stringify(hargv));
const argvPort = (() => { const a = hargv.find((x) => typeof x === 'string' && x.startsWith('--remote-debugging-port=')); return a ? Number(a.split('=')[1]) : null; })();
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && isObj(dl) && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
const browserId = (h) => { const u = isObj(h) && isObj(h.devtoolsListening) && typeof h.devtoolsListening.url === 'string' ? h.devtoolsListening.url : ''; const m = /\/devtools\/browser\/([0-9a-f-]{36})$/i.exec(u); return m ? m[1].toLowerCase() : null; };
check('replay-launch-token', typeof tok === 'string' && /^[0-9a-f]{12}$/.test(tok) && priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok), 'launchToken ' + tok + ' (shape 12 hex, and not the launch token of any prior receipt)');
const bid = browserId(host);
check('replay-devtools-url', bid !== null && priors.every((p) => browserId(p.host) !== bid), 'devtools browser id ' + bid + ' (uuid shape, and not the browser id of any prior receipt)');
// Multiset near-match (order- and count-free), carried from r75 unchanged in rule; thresholds re-measured.
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const pairs = (x) => arr(x.events).filter((e) => isObj(e) && num(e.ts) && num(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const timelineSim = (a, b) => { const na = pairs(a).length, ga = gaps(a); return { abs: na ? pairMatch(a, b) / na : 0, gap: ga.length ? matchCount(ga, gaps(b)) / ga.length : 0, gaps: ga.length }; };
const sims = priors.map((p) => timelineSim(r, p));
const replayIdx = sims.findIndex((s) => s.abs >= FRAC || s.gap >= GAP_FRAC);
const ownGaps = gaps(r).length;
check('replay-event-timeline', events.length > 0 && ownGaps >= 6 && replayIdx === -1, 'event-time multiset within ' + TOL + ' ms of prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (thresholds abs ' + FRAC + ', gap ' + GAP_FRAC + '; own >= ' + GAP_MIN + ' ms gaps ' + ownGaps + ', need >= 6)');
// Prior-set completeness over the two trees this round's driver writes into.
const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
const priorReal = new Set(priorPaths.map(real));
const needle = Buffer.from('"' + SCHEMA + '"');
const outside = [];
const walk = (d) => { let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of ents) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.isFile() && e.name.endsWith('.json')) { let b; try { b = fs.readFileSync(p); } catch { continue; } if (!b.includes(needle)) continue; let j; try { j = JSON.parse(b.toString('utf8')); } catch { continue; } if (isObj(j) && j.schema === SCHEMA && j.nonce !== expectNonce && !priorReal.has(real(p))) outside.push(path.relative(lane, p)); } } };
for (const t of ['.ufo/waves/round-76', 'corpus/evidence/round76']) walk(path.join(lane, t));
check('prior-set-complete', outside.length === 0, 'receipts of schema ' + SCHEMA + ' in the round-76 wave/evidence trees, not the run under test (nonce ' + expectNonce + '), and not among the priors: ' + outside.join(','));
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
const t0 = typeof r.startedAt === 'string' ? Date.parse(r.startedAt) : NaN, t1 = typeof r.finishedAt === 'string' ? Date.parse(r.finishedAt) : NaN;
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 3000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 3 s: 10 legs with 300 ms settle waits)');
check('plan-frozen', canon(r.plan) === canon(FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', legs.length === LEG_ORDER.length && canon(legs.map((l) => (isObj(l) ? l.name : null))) === canon(LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
// every field of a leg record is read: kind, the handle params sent, the send ids those records name
const sendById = new Map(sendLog.filter(isObj).map((c) => [c.id, c]));
const errOk = (e) => e === null || (isObj(e) && canon(Object.keys(e).sort()) === canon(['code', 'message']) && Number.isInteger(e.code) && typeof e.message === 'string');
const legRecBad = [];
FROZEN.forEach((p, i) => {
  const l = legs[i];
  const bad = (why) => legRecBad.push(p.name + ':' + why);
  if (!isObj(l)) return bad('not an object');
  if (canon(Object.keys(l).sort()) !== canon(['elapsedMs', 'handleError', 'handleParams', 'handleResult', 'handleSendId', 'kind', 'name', 'opened', 'stateAfter', 'triggerError', 'triggerResult', 'triggerSendId'].sort())) bad('keys');
  if (l.kind !== p.kind) bad('kind');
  // floor 290, not 300: a 300 ms settle timer measured with Date.now() reads 299 on 3 of 13 honest
  // pre-freeze receipts (p3, p4, smoke4; lesson-proof/prefreeze-pass1/)
  if (!num(l.elapsedMs) || l.elapsedMs < 290) bad('elapsedMs');
  if (!errOk(l.handleError) || !errOk(l.triggerError)) bad('error shape');
  if (p.kind === null) { if (l.triggerSendId !== null || l.handleSendId !== null || l.handleParams !== null || l.handleResult !== null || l.triggerResult !== null || l.opened !== null) bad('start leg carries a send'); return; }
  if (canon(l.handleParams) !== canon(p.handle)) bad('handleParams');
  const h = sendById.get(l.handleSendId);
  if (!h || h.method !== 'Page.handleJavaScriptDialog' || canon(h.params) !== canon(l.handleParams)) bad('handle send');
  if (l.handleError === null ? canon(l.handleResult) !== '{}' : l.handleResult !== null) bad('handleResult');
  if (p.kind === 'handle-only') { if (l.triggerSendId !== null || l.triggerResult !== null || l.opened !== null) bad('handle-only trigger'); return; }
  const t = sendById.get(l.triggerSendId);
  const wantT = p.kind === 'click' ? ['Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.at[0], y: p.at[1], button: 'left', buttons: 0, clickCount: 1 }]
    : ['Page.navigate', { url: (isObj(r.fixture) ? r.fixture.origin : '') + p.path + '?run=' + encodeURIComponent(String(r.nonce)) }];
  if (!t || t.method !== wantT[0] || canon(t.params) !== canon(wantT[1]) || l.handleSendId !== l.triggerSendId + 1) bad('trigger send');
  if (l.opened !== true) bad('opened');
  if (p.kind === 'click' && (l.triggerError !== null || canon(l.triggerResult) !== '{}')) bad('click triggerResult');
  if (p.kind === 'navigate' && (l.triggerError !== null || !isObj(l.triggerResult) || typeof l.triggerResult.frameId !== 'string' || l.triggerResult.isDownload !== false
    || canon(Object.keys(l.triggerResult).sort()) !== canon(p.name === 'unload-dismiss' ? ['errorText', 'frameId', 'isDownload'] : ['frameId', 'isDownload', 'loaderId']))) bad('navigate triggerResult');
});
check('leg-records', legs.length === FROZEN.length && legRecBad.length === 0, 'leg records: ' + legRecBad.join(','));
check('seq-monotonic', events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => isObj(e) && RECORDED.includes(e.leg)), 'events outside the recorded legs: ' + events.filter((e) => !isObj(e) || !RECORDED.includes(e.leg)).length);
const nullOrInt = (v) => v === null || Number.isInteger(v);
const typed = (e) => isObj(e) && typeof e.type === 'string' && EVENT_TYPES.has(e.type) && num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0
  && typeof e.isTrusted === 'boolean' && typeof e.defaultPrevented === 'boolean' && (e.target === null || typeof e.target === 'string') && nullOrInt(e.x) && nullOrInt(e.y) && nullOrInt(e.buttons)
  && (e.x === null) === (e.y === null) && (e.x === null) === (e.buttons === null)
  && (e.type === 'dialog-return' ? ['alert', 'confirm', 'prompt'].includes(e.kind) && typeof e.ret === 'string' && e.x === null : e.kind === null && e.ret === null)
  && (e.type === 'beforeunload' ? e.x === null : e.type === 'dialog-return' || Number.isInteger(e.x));
check('event-types', events.length > 0 && events.every(typed), 'events with a non-strict field type: ' + events.filter((e) => !typed(e)).length);

// 2. page-side leg marks bind every event to the window of its label
const markNames = marks.map((m) => (isObj(m) ? m.name : null));
const marksOk = canon(markNames) === canon(['start', ...RECORDED]) && marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 || m.at >= marks[i - 1].at))
  && num(r.closedAt) && marks.length > 0 && r.closedAt >= marks[marks.length - 1].at && Number.isInteger(r.lateAfterClose) && r.lateAfterClose === 0;
check('leg-marks', marksOk, 'legMarks ' + markNames.join(',') + ' closedAt ' + r.closedAt + ' lateAfterClose ' + r.lateAfterClose);
const windowOf = (name) => { const i = RECORDED.indexOf(name) + 1; return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null; };
check('event-leg-window', marksOk && events.every((e, i) => { if (!isObj(e) || !num(e.at) || !RECORDED.includes(e.leg)) return false; const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] && (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at)); }),
  'events whose handler time lies outside their labelled leg window: ' + (marksOk ? events.filter((e) => { if (!isObj(e) || !num(e.at)) return true; const w = windowOf(e.leg); return !w || e.at < w[0] || e.at > w[1]; }).length : 'marks unusable'));

// 3. producer: real clicks, real dialogs answered as planned, closed allow-list
const n = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length;
const inputLike = sendLog.filter((c) => isObj(c) && typeof c.method === 'string' && /^input\.|^page\.handlejavascriptdialog$/i.test(c.method));
check('dialog-call-count', inputLike.length === 21 && n('Input.dispatchMouseEvent') === 12 && n('Page.handleJavaScriptDialog') === 9 && n('Page.navigate') === 3,
  'Input/handle calls ' + inputLike.length + ' (dispatchMouseEvent ' + n('Input.dispatchMouseEvent') + ', handleJavaScriptDialog ' + n('Page.handleJavaScriptDialog') + '; Page.navigate ' + n('Page.navigate') + '; want 12 + 9 and 3)');
const origin = isObj(r.fixture) && typeof r.fixture.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/.test(r.fixture.origin) ? r.fixture.origin : null;
const planCalls = [['Page.navigate', { url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) }]];
for (const p of FROZEN) {
  if (p.kind === 'click') planCalls.push(['Input.dispatchMouseEvent', { type: 'mousePressed', x: p.at[0], y: p.at[1], button: 'left', buttons: 1, clickCount: 1 }], ['Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.at[0], y: p.at[1], button: 'left', buttons: 0, clickCount: 1 }]);
  if (p.kind === 'navigate') planCalls.push(['Page.navigate', { url: origin + p.path + '?run=' + encodeURIComponent(String(r.nonce)) }]);
  if (p.kind !== null) planCalls.push(['Page.handleJavaScriptDialog', p.handle]);
}
const gotCalls = sendLog.filter((c) => isObj(c) && /^(Input\.|Page\.handleJavaScriptDialog$|Page\.navigate$)/i.test(String(c.method))).map((c) => [c.method, c.params]);
check('dialog-call-params', origin !== null && canon(gotCalls) === canon(planCalls), 'Input / handleJavaScriptDialog / navigate calls differ from the frozen plan (method, params, order)');
const EV_KEYS = { 'Page.javascriptDialogOpening': ['defaultPrompt', 'frameId', 'hasBrowserHandler', 'message', 'type', 'url'], 'Page.javascriptDialogClosed': ['frameId', 'result', 'userInput'], 'Page.frameNavigated': ['isMain', 'url'] };
const evN = (m) => eventLog.filter((e) => isObj(e) && e.method === m).length;
const evShapeOk = (e) => isObj(e) && canon(Object.keys(e).sort()) === canon(['afterSendId', 'method', 'params']) && Number.isInteger(e.afterSendId) && EV_KEYS[e.method] !== undefined
  && isObj(e.params) && canon(Object.keys(e.params).sort()) === canon(EV_KEYS[e.method]);
// (no separate length conjunct: every entry is one of the three methods, so 8 + 8 + 2 fixes the
// length; the pre-freeze kill-power trial showed `eventLog.length === 18` was an equivalent mutant)
check('cdp-event-log-closed', eventLog.every(evShapeOk) && evN('Page.javascriptDialogOpening') === 8 && evN('Page.javascriptDialogClosed') === 8 && evN('Page.frameNavigated') === 2,
  'CDP event log must hold exactly 8 dialog openings, 8 closings and 2 main-frame navigations with their exact keys: ' + eventLog.length + ' entries');
// each opening arrives after its leg's trigger send and before the answer; each closing after the
// answer; one frame id for every dialog; navigations: the fixture load, then /next after the accept
const legIdxOfSend = (id, field) => legs.findIndex((l) => isObj(l) && l[field] === id && id !== null);
const frameIds = new Set(eventLog.filter((e) => isObj(e) && isObj(e.params) && e.method !== 'Page.frameNavigated').map((e) => e.params.frameId));
const navs = eventLog.filter((e) => isObj(e) && e.method === 'Page.frameNavigated');
const firstNav = sendLog.find((c) => isObj(c) && c.method === 'Page.navigate');
const bindBad = eventLog.filter((e) => {
  if (!isObj(e)) return true;
  if (e.method === 'Page.javascriptDialogOpening') return legIdxOfSend(e.afterSendId, 'triggerSendId') < 0;
  if (e.method === 'Page.javascriptDialogClosed') return legIdxOfSend(e.afterSendId, 'handleSendId') < 0;
  return false;
}).length;
const openOrder = eventLog.filter((e) => isObj(e) && e.method !== 'Page.frameNavigated').map((e) => (e.method === 'Page.javascriptDialogOpening' ? 'o' : 'c')).join('');
check('dialog-event-binding', bindBad === 0 && openOrder === 'oc'.repeat(8) && frameIds.size === 1 && navs.length === 2 && isObj(navs[0].params) && navs[0].params.isMain === true && isObj(firstNav) && navs[0].afterSendId > firstNav.id
  && isObj(navs[1].params) && navs[1].params.isMain === true && navs[1].afterSendId === legOf('unload-accept').handleSendId && eventLog.indexOf(navs[1]) === eventLog.length - 1,
  'dialog events not bound to their leg sends (' + bindBad + '), order ' + openOrder + ', frame ids ' + frameIds.size + ', navigations ' + navs.length);
const readyExpr = 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce);
const nextExpr = 'document.readyState === "complete" && location.pathname === "/next" ? JSON.stringify({ path: location.pathname, runIsNonce: new URLSearchParams(location.search).get("run") === ' + JSON.stringify(r.nonce) + ', pageNonceIsNonce: document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce) + ' }) : null';
const EXPRS = new Set(['window.__nonceOnPage', 'window.__closeRecord()', 'window.__late', 'window.__state()', readyExpr, nextExpr,
  ...RECORDED.map((nm) => 'window.__setLeg(' + JSON.stringify(nm) + ')')]);
const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree']);
const allowed = (c) => {
  if (!isObj(c) || !Number.isInteger(c.id) || typeof c.method !== 'string' || !isObj(c.params)) return false;
  if (EMPTY.has(c.method)) return canon(c.params) === '{}';
  if (c.method === 'Input.dispatchMouseEvent' || c.method === 'Page.handleJavaScriptDialog' || c.method === 'Page.navigate') return true; // params bound by dialog-call-params
  if (c.method === 'Runtime.evaluate') return canon(c.params) === canon({ expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression);
  if (c.method === 'Emulation.setDeviceMetricsOverride') return canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  return false;
};
const once = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length === 1;
check('send-log-allowlist', sendLog.length > 0 && sendLog.every(allowed) && sendLog.every((c, i) => isObj(c) && c.id === i + 1) && once('Emulation.setDeviceMetricsOverride') && once('Browser.getVersion') && once('Page.getFrameTree'),
  'sends outside the driver\'s closed call set: ' + sendLog.filter((c) => !allowed(c)).map((c) => (isObj(c) ? c.method : typeof c)).join(','));

// 4. per leg, re-derived from raw events, records and CDP events
const pathOf = (u) => { try { return new URL(u).pathname; } catch { return null; } };
const cdpView = (e) => (e.method === 'Page.javascriptDialogOpening' ? ['opening', e.params.type, e.params.message, e.params.defaultPrompt ?? null, e.params.hasBrowserHandler, pathOf(e.params.url)]
  : e.method === 'Page.javascriptDialogClosed' ? ['closed', e.params.result, e.params.userInput] : ['navigated', pathOf(e.params.url)]);
const derived = {};
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => isObj(e) && e.leg === name);
  const leg = legOf(name);
  const want = SHAPE[name];
  const bound = eventLog.filter((e) => evShapeOk(e) && ((e.method === 'Page.javascriptDialogOpening' && leg.triggerSendId != null && e.afterSendId === leg.triggerSendId)
    || (e.method !== 'Page.javascriptDialogOpening' && leg.handleSendId != null && e.afterSendId === leg.handleSendId)));
  derived[name] = {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: evs.map((e) => e.isTrusted), prevented: evs.map((e) => e.defaultPrevented),
    xy: evs.map((e) => [e.x, e.y, e.buttons]), ret: evs.filter((e) => e.type === 'dialog-return').map((e) => [e.kind, e.ret]),
    dialog: bound.map(cdpView), handleError: leg.handleError ?? null, triggerError: leg.triggerError ?? null,
    nav: leg.kind === 'navigate' && isObj(leg.triggerResult) ? (leg.triggerResult.errorText ?? null) : null, stateAfter: isObj(leg.stateAfter) ? leg.stateAfter : null,
  };
  const d = derived[name];
  const same = (a, b) => canon(a) === canon(b);
  check(`leg-${name}-seq`, same(d.seq, want.seq), name + ' sequence ' + JSON.stringify(d.seq));
  check(`leg-${name}-trusted`, same(d.trusted, want.trusted), name + ' trusted ' + JSON.stringify(d.trusted));
  check(`leg-${name}-prevented`, same(d.prevented, want.prevented), name + ' defaultPrevented ' + JSON.stringify(d.prevented));
  check(`leg-${name}-xy`, same(d.xy, want.xy), name + ' [x, y, buttons] ' + JSON.stringify(d.xy));
  check(`leg-${name}-ret`, same(d.ret, want.ret), name + ' dialog returns ' + JSON.stringify(d.ret));
  check(`leg-${name}-dialog`, same(d.dialog, want.dialog), name + ' CDP dialog events ' + JSON.stringify(d.dialog));
  check(`leg-${name}-error`, same(d.handleError, want.handleError) && same(d.triggerError, want.triggerError), name + ' errors ' + JSON.stringify([d.handleError, d.triggerError]));
  check(`leg-${name}-nav`, same(d.nav, want.nav), name + ' navigate errorText ' + JSON.stringify(d.nav));
  check(`leg-${name}-state`, same(d.stateAfter, want.stateAfter), name + ' state after ' + JSON.stringify(d.stateAfter));
}

// 5. cross-leg laws (sources in the round-76 note)
const ev = events.filter(isObj);
check('trust-law', ev.length > 0 && ev.every((e) => e.isTrusted === true), 'untrusted page events: ' + ev.filter((e) => e.isTrusted !== true).map((e) => e.type + '@' + e.leg).join(','));
// The page's return value as a function of the plan's answer (page_handler.cc HandleJavaScriptDialog:
// prompt_override is "" unless promptText is given; local_dom_window.cc prompt(): null unless accepted).
const wantRet = (kind, h) => (kind === 'alert' ? 'undefined' : kind === 'confirm' ? String(h.accept) : h.accept ? 'string:' + (h.promptText ?? '') : 'null');
const clickLegs = FROZEN.filter((p) => p.kind === 'click');
const retBad = clickLegs.filter((p) => { const rs = ev.filter((e) => e.leg === p.name && e.type === 'dialog-return'); const kind = KIND_OF[BUTTON[p.at[0]]]; return rs.length !== 1 || rs[0].kind !== kind || rs[0].ret !== wantRet(kind, p.handle); });
check('return-value-law', clickLegs.length === 6 && retBad.length === 0 && ev.filter((e) => e.type === 'dialog-return').length === 6, 'click legs whose page return is not the function of (type, accept, promptText): ' + retBad.map((p) => p.name).join(','));
// javascriptDialogClosed echoes (accept, promptText ?? "") of the answer, dismissals included;
// the opening names the dialog's type, the message and default prompt the page passed.
const echoBad = FROZEN.filter((p) => p.kind === 'click' || p.kind === 'navigate').filter((p) => {
  const l = legOf(p.name);
  const o = eventLog.find((e) => isObj(e) && e.method === 'Page.javascriptDialogOpening' && e.afterSendId === l.triggerSendId && l.triggerSendId != null);
  const c = eventLog.find((e) => isObj(e) && e.method === 'Page.javascriptDialogClosed' && e.afterSendId === l.handleSendId && l.handleSendId != null);
  const kind = p.kind === 'navigate' ? 'beforeunload' : KIND_OF[BUTTON[p.at[0]]];
  return !o || !c || !isObj(o.params) || !isObj(c.params) || o.params.type !== kind || o.params.message !== MESSAGE[kind] || o.params.defaultPrompt !== DEFAULT_PROMPT[kind] || o.params.hasBrowserHandler !== true
    || c.params.result !== p.handle.accept || c.params.userInput !== (p.handle.promptText ?? '');
});
check('closed-echo-law', echoBad.length === 0, 'dialogs whose opening/closing do not echo the page call and the answer: ' + echoBad.map((p) => p.name).join(','));
// blocking: the dialog function returns only after the answer: inside one click dispatch, after
// the mouseup and before the click reaches the window listener, after a non-zero block.
const blockBad = clickLegs.filter((p) => {
  const es = ev.filter((e) => e.leg === p.name); const k = es.findIndex((e) => e.type === 'dialog-return');
  return k !== 4 || es.length !== 6 || es[3].type !== 'mouseup' || es[5].type !== 'click' || !(es[4].at - es[4].ts >= 1) || es[4].ts < es[3].at || es[5].at < es[4].at || es[4].target !== es[5].target;
});
check('blocking-law', clickLegs.length === 6 && blockBad.length === 0, 'click legs whose dialog return is not a >= 1 ms block between mouseup and the click on the same button: ' + blockBad.map((p) => p.name).join(','));
const nd = legOf('no-dialog');
check('no-dialog-law', canon(nd.handleError) === canon(NO_DIALOG) && ev.filter((e) => e.leg === 'no-dialog').length === 0 && eventLog.filter((e) => isObj(e) && (e.afterSendId === nd.handleSendId)).length === 0,
  'answering with no dialog open: error ' + JSON.stringify(nd.handleError) + ' (want ' + JSON.stringify(NO_DIALOG) + ', no page or CDP event)');
const ud = legOf('unload-dismiss'), ua = legOf('unload-accept');
const bu = ev.filter((e) => e.type === 'beforeunload');
const nextRows = slog.filter((s) => isObj(s) && s.path === '/next');
check('beforeunload-law', bu.length === 1 && bu[0].leg === 'unload-dismiss' && bu[0].defaultPrevented === true && isObj(ud.triggerResult) && ud.triggerResult.errorText === 'net::ERR_ABORTED'
  && isObj(ud.stateAfter) && ud.stateAfter.path === '/' && isObj(ua.triggerResult) && ua.triggerResult.errorText === undefined && typeof ua.triggerResult.loaderId === 'string'
  && isObj(ua.stateAfter) && ua.stateAfter.path === '/next' && nextRows.length === 1,
  'beforeunload: page events ' + bu.length + ', dismissed navigation ' + JSON.stringify(ud.triggerResult) + ', accepted navigation ' + JSON.stringify(ua.triggerResult) + ', /next requests ' + nextRows.length);
const coordBad = ev.filter((e) => { if (e.x === null) return false; const p = planOf(e.leg); return !p || p.kind !== 'click' || e.x !== p.at[0] || e.y !== p.at[1] || e.target !== BUTTON[p.at[0]]; });
check('coordinate-law', ev.length > 0 && coordBad.length === 0, 'pointer events not at their leg\'s commanded point on its button: ' + coordBad.map((e) => e.type + '@' + e.leg + ':' + e.x + ',' + e.y).join(';'));

// 6. closure, producer verdict, summary consistency
const td = isObj(r.teardown) ? r.teardown : {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && isObj(td.portProbes) && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && isObj(td.postKillCurl) && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.dialogHypothesis === 'CONFIRMED', 'producer predicate ' + JSON.stringify(r.predicate) + ' hypothesis ' + JSON.stringify(r.dialogHypothesis));
check('legshape-consistency', canon(r.legShape) === canon(derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-dialog-r76', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length,
  priorSetFile: { path: psFile, sha256: sha256(psBytes), lines: psLines.length }, priorSet,
  timeline: { absThreshold: FRAC, gapThreshold: GAP_FRAC, tolerance: TOL, gapMin: GAP_MIN, ownGaps, maxAbs: Math.max(0, ...sims.map((s) => s.abs)), maxGap: Math.max(0, ...sims.map((s) => s.gap)) },
  checks, findings, derived }, findings.length === 0 ? 0 : 1);
