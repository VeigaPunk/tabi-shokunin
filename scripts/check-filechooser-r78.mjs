#!/usr/bin/env node
// Counter for tabi round 78 C1 (capability `chromium-file-chooser-linux`, generation r78).
// Usage: node check-filechooser-r78.mjs --lane <ABS lane root> --receipt <receipt.json>
//          --expect-driver-sha256 <hex> --expect-nonce <tabi-r78-...>
//          --prior-set <file: one lane-relative receipt path per line, '#' comments>
//          [--prior <receipt.json> ...] [--json]
//        node check-filechooser-r78.mjs --list-checks      (prints the declared check ids, exit 0)
// Exit 0 = clean (every check holds); 1 = findings; 2 = usage / unreadable receipt, prior or prior set.
// Carried from r77. New in r78 (round-77 closure routed defects 1-3 / QUALITY 150-151):
//  - E1 node binding: a per-leg `opened` comparison binds the chooser MODE only; the browser-assigned
//    `backendNodeId` is reported in `nodeReport`, never required to equal a literal (r77 pinned
//    5/7/14/18 and refused two honest cold runs in 25). `node-binding-law` still binds each set to the
//    id the chooser event carried, one id per input, distinct across inputs, and a new
//    `fixture-descriptors` check binds the leg's page-side target to the element descriptor the page
//    measured (tag, type, attribute, rect containing the commanded point).
//  - E2 prior-set walk: every regular file of the walked trees is PARSED whatever its bytes spell (a
//    JSON-escaped schema no longer hides a receipt), and a parsed object is a receipt by its top-level
//    `schema`; the run-under-test exemption is the receipt's real path, never its self-claimed nonce
//    (a second contradictory receipt claiming the run's nonce is now outside the prior set).
//  - E3 host argv and frame: `host-argv` compares the FULL argv array to the plan derived from the
//    receipt's own port, token and viewport (a decoy slot cannot pass), and `frame-binding` derives the
//    main frame from the `Page.getFrameTree` result the driver recorded (`frameTree`), not from a
//    self-referential field. `receipt-fields` closes the top-level key set so no bookkeeping field is
//    silently unread.
// Independent of the driver's own verdict: every leg is re-derived from the page-side raw event
// log, the page-side leg marks, the per-leg records, the driver's CDP send log and its CDP event
// log; the producer's own verdict (predicate true AND chooserHypothesis CONFIRMED, strict
// booleans/strings) and its legShape summary must ALSO agree with the re-derivation.
// Carried from r72-r76: closed send-log allow-list, strict event fields, leg marks binding each
// event to its leg window, required driver pin / expected nonce, replay refusal on launch token,
// DevTools browser id and the event-time pair/gap near-match, 0.1 ms event-time quantum, fixture
// hash from the pinned driver, exact host pins (build, product, protocol, --headless=new at argv[1]),
// CDP errors compared as {code, message}, structural comparison only, the prior set read from a
// committed file (usage exit 2 without it), every leg-record field read.
// New in r77 (round-76 routed defects):
//  - D1 limit derived from the counter's own denominators: both replay fractions now divide by the
//    PRIOR's counts (its events N_p, its >= GAP_MIN gaps G_p), which a forger cannot change, not by
//    the receipt-under-test's own counts (r76: a forgery that ADDED a gap lowered its own gap
//    fraction and escaped, R76Critic A2). The output's `limit` block prints, for every prior,
//    N_p, G_p and the exact matched counts that refuse (absNeed = ceil(FRAC*N_p), gapNeed =
//    ceil(GAP_FRAC*G_p)); the declared limit sentence is that block, not a hand-computed number.
//  - D2 prior-set walk: the two walked trees are read file by file WHATEVER the name or case of the
//    extension, symlinks are followed (files and directories, real paths de-duplicated, cycles cut),
//    a file that carries the schema string is parsed, and a file that carries the string, looks like
//    JSON (a `.json` name in any case, or a first non-blank byte `{` / `[`) and does not parse is
//    refused (`prior-set-unparsable`) instead of skipped; prose that names the schema is not a
//    receipt. A parsed object whose top-level schema is the receipt schema and which carries `nonce`
//    or `events` is a receipt.
//  - D2 event-log binding: CDP events are in afterSendId order; every chooser event's frameId and
//    the main-frame navigation's frameId equal the recorded main frame id; the navigation url is
//    exactly the fixture origin + /?run=<nonce> (`frame-binding`).
// Laws (sources in the round-77 note): a chooser opens only from a click carrying transient user
// activation while interception is on (activation-law); the event's mode is selectMultiple iff
// the input has `multiple` (a webkitdirectory input reports selectSingle) (mode-law);
// setFileInputFiles on a single input keeps the first path only, an unchanged selection fires
// `cancel` instead of input/change, an empty path list fires nothing (selection-law, cancel-law,
// empty-list-law); a missing path still yields a File of size 0 whose read fails NotFoundError and
// `accept` is not enforced (read-law, selection-law); a non-file node is refused -32000 (not-file-input-law);
// interception with cancel opens AND cancels, interception off in headless cancels without an
// event (intercept-law); coordinates equal the commanded point (coordinate-law).
// Limit (declared): this counter reads a receipt; it is not an execution oracle. A same-user
// forger who rewrites nonce, launch token and DevTools browser id of a prior receipt p is not
// refused once fewer than absNeed(p) = ceil(0.5 * N_p) of p's events keep both ts and at within
// 0.05 ms of an event of the forgery AND fewer than gapNeed(p) = ceil(0.75 * G_p) of p's >= 50 ms
// gaps are matched within 0.05 ms by a gap of the forgery (printed per prior in `limit`); nor is a
// receipt fabricated from nothing that satisfies every check; nor a receipt outside the prior set
// and outside the two walked trees (.ufo/waves/round-78, corpus/evidence/round78).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');

const SCHEMA = 'tabi-chrome-cdp-filechooser-r78';
const VIEWPORT = { width: 1280, height: 900 };
const DRIVER = fileURLToPath(new URL('./chrome-cdp-filechooser-round78.mjs', import.meta.url));
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3' };
const A = 'tabi-a.txt', B = 'tabi-b.bin', MISSING = 'tabi-missing.txt';
const FROZEN = [
  { name: 'start', kind: null, at: null, intercept: null, files: null },
  { name: 'intercept-on', kind: 'intercept', at: null, intercept: { enabled: true }, files: null },
  { name: 'pick-single', kind: 'click', at: [160, 120], intercept: null, files: [A] },
  { name: 'pick-multiple', kind: 'click', at: [360, 120], intercept: null, files: [A, B] },
  { name: 'pick-same', kind: 'click', at: [160, 120], intercept: null, files: [A] },
  { name: 'pick-first-only', kind: 'click', at: [160, 120], intercept: null, files: [B, A] },
  { name: 'pick-missing', kind: 'click', at: [160, 120], intercept: null, files: [MISSING] },
  { name: 'pick-empty', kind: 'click', at: [160, 120], intercept: null, files: [] },
  { name: 'dir-mode', kind: 'click', at: [560, 120], intercept: null, files: null },
  { name: 'accept-ignored', kind: 'click', at: [760, 120], intercept: null, files: [A] },
  { name: 'forward-click', kind: 'click', at: [160, 320], intercept: null, files: [A] },
  { name: 'script-click', kind: 'script', at: null, intercept: null, files: null },
  { name: 'not-file-input', kind: 'set-object', at: null, intercept: null, files: [A] },
  { name: 'intercept-cancel', kind: 'click', at: [160, 120], intercept: { enabled: true, cancel: true }, files: null },
  { name: 'intercept-off', kind: 'click', at: [160, 120], intercept: { enabled: false }, files: null },
];
// the element under each commanded point, the input a click there opens, and the input attributes
const AT_TARGET = { '160,120': 's', '360,120': 'm', '560,120': 'd', '760,120': 'k', '160,320': 'f' };
const OPENS = { s: 's', m: 'm', d: 'd', k: 'k', f: 's' };
const MULTIPLE = { s: false, m: true, d: false, k: false };
const UPLOAD = { [A]: { size: 11, sha256: '528b74603d52b4e85c1bec13fa7c7dae8be08d2fe1c1bb072a8ee02190441da3', type: 'text/plain', hex: '746162692d616c7068610a' },
  [B]: { size: 5, sha256: 'ff5d8507b6a72bee2debce2c0054798deaccdc5d8a1b945b6280ce8aa9cba52e', type: 'application/octet-stream', hex: '00010203ff' },
  [MISSING]: { size: 0, sha256: null, type: 'text/plain', hex: null } };
const SCRIPT_CLICK = 'document.getElementById("s").click(), 1';
const BUTTON_OBJECT = 'document.getElementById("f")';
const NOT_FILE_INPUT = { code: -32000, message: 'Node is not a file input element' };
// Expected per-leg shape (filled from the three shape probes, lesson-proof/shape-s1..s3; identical,
// backendNodeIds included): page events `type@target`, isTrusted, transient activation, [x, y,
// buttons], [type, target, files] of input/change/cancel, [target, name, read outcome], the bound
// chooser events [mode, backendNodeId], [interceptError, triggerError, setError], state after.
const fa = [A, 11, 'text/plain'], fb = [B, 5, 'application/octet-stream'], fmiss = [MISSING, 0, 'text/plain'];
const PTR = (t) => ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].map((x) => x + '@' + t);
const pxy = (x, y) => [[x, y, 1], [x, y, 1], [x, y, 0], [x, y, 0], [x, y, 0]];
const NUL3 = [null, null, null];
const st = (s, m, d, k) => ({ s, m, d, k, sValue: s.length ? 'C:\\fakepath\\' + s[0][0] : '' });
const S0 = st([], [], [], []), S1 = st([fa], [], [], []), S2 = st([fa], [fa, fb], [], []), S3 = st([fb], [fa, fb], [], []), S4 = st([fmiss], [fa, fb], [], []);
const S5 = st([fmiss], [fa, fb], [], [fa]), S6 = st([fa], [fa, fb], [], [fa]);
const RD = (t, f) => [t, f, f === MISSING ? 'error:NotFoundError' : 'hex:' + UPLOAD[f].hex];
const changed = (t, x, y, list, node, mode, state) => ({ seq: [...PTR(t), 'input@' + t, 'change@' + t, ...list.map(() => 'read@' + t)], trusted: [true, true, true, true, true, true, true], act: [true, true, true, true, true, false, false],
  xy: [...pxy(x, y), NUL3, NUL3], files: [['input', t, list], ['change', t, list]], read: list.map((f) => RD(t, f[0])), opened: [[mode, node]], error: [null, null, null], stateAfter: state });
const cancelled = (opened, state) => ({ seq: [...PTR('s'), 'cancel@s'], trusted: [true, true, true, true, true, true], act: [true, true, true, true, true, false], xy: [...pxy(160, 120), NUL3],
  files: [['cancel', 's', state.s]], read: [], opened, error: [null, null, null], stateAfter: state });
const quiet = (state, error = [null, null, null]) => ({ seq: [], trusted: [], act: [], xy: [], files: [], read: [], opened: [], error, stateAfter: state });
const clickOnly = (t, x, y, node, state) => ({ seq: PTR(t), trusted: [true, true, true, true, true], act: [true, true, true, true, true], xy: pxy(x, y), files: [], read: [], opened: [['selectSingle', node]], error: [null, null, null], stateAfter: state });
const SHAPE = {
  start: quiet(S0),
  'intercept-on': quiet(S0),
  'pick-single': changed('s', 160, 120, [fa], 5, 'selectSingle', S1),
  'pick-multiple': changed('m', 360, 120, [fa, fb], 7, 'selectMultiple', S2),
  'pick-same': cancelled([['selectSingle', 5]], S2),
  'pick-first-only': changed('s', 160, 120, [fb], 5, 'selectSingle', S3),
  'pick-missing': changed('s', 160, 120, [fmiss], 5, 'selectSingle', S4),
  'pick-empty': clickOnly('s', 160, 120, 5, S4),
  'dir-mode': clickOnly('d', 560, 120, 14, S4),
  'accept-ignored': changed('k', 760, 120, [fa], 18, 'selectSingle', S5),
  'forward-click': { seq: [...PTR('f'), 'click@s', 'input@s', 'change@s', 'read@s'], trusted: [true, true, true, true, true, false, true, true], act: [true, true, true, true, true, true, false, false],
    xy: [...pxy(160, 320), [0, 0, 0], NUL3, NUL3], files: [['input', 's', [fa]], ['change', 's', [fa]]], read: [RD('s', A)], opened: [['selectSingle', 5]], error: [null, null, null], stateAfter: S6 },
  'script-click': { seq: ['click@s'], trusted: [false], act: [false], xy: [[0, 0, 0]], files: [], read: [], opened: [], error: [null, null, null], stateAfter: S6 },
  'not-file-input': quiet(S6, [null, null, NOT_FILE_INPUT]),
  'intercept-cancel': cancelled([['selectSingle', 5]], S6),
  'intercept-off': cancelled([], S6),
};
const LEG_ORDER = FROZEN.map((l) => l.name);
const EVENT_TYPES = new Set(['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'input', 'change', 'cancel', 'read']);
const PER_LEG = ['seq', 'trusted', 'act', 'xy', 'files', 'read', 'opened-mode', 'error', 'state'];
const CHECK_IDS = [
  'schema', 'nonce-shape', 'nonce-expected', 'nonce-on-page', 'receipt-fields', 'scored-run-not-degenerate', 'server-log-binding', 'driver-pin', 'fixture-hash',
  'host-chromium', 'host-argv', 'devtools-port-binding', 'upload-binding', 'replay-launch-token', 'replay-devtools-url', 'replay-event-timeline', 'prior-set-complete', 'prior-set-unparsable',
  'event-time-quantum', 'run-window', 'plan-frozen', 'leg-order', 'leg-records', 'seq-monotonic', 'event-leg-domain', 'event-types', 'leg-marks', 'event-leg-window',
  'chooser-call-count', 'chooser-call-params', 'cdp-event-log-closed', 'chooser-event-binding', 'frame-binding', 'frame-tree', 'send-log-allowlist', 'fixture-descriptors',
  ...LEG_ORDER.flatMap((n) => PER_LEG.map((k) => `leg-${n}-${k}`)),
  'trust-law', 'activation-law', 'mode-law', 'node-binding-law', 'selection-law', 'cancel-law', 'empty-list-law', 'read-law', 'not-file-input-law', 'intercept-law', 'coordinate-law',
  'teardown-closure', 'failures-empty', 'producer-verdict', 'legshape-consistency',
];
if (argv.includes('--list-checks')) { console.log(JSON.stringify(CHECK_IDS)); process.exit(0); }

// Output is written synchronously before exit: console.log + process.exit() cuts a piped stdout at the
// 64 KiB pipe buffer on this host (Node 24; the battery summary was cut in the pre-freeze kill-power trial).
const writeAll = (s) => { const b = Buffer.from(s); let off = 0; while (off < b.length) { try { off += fs.writeSync(1, b, off); } catch (e) { if (e.code !== 'EAGAIN') throw e; } } };
const out = (o, code) => { writeAll((asJson ? JSON.stringify(o, null, 1) : `${o.verdict} findings=${o.findings.length}` + o.findings.map((f) => `\n  ${f.id}: ${f.detail}`).join('')) + '\n'); process.exit(code); };
const usage = (d) => out({ verdict: 'usage', findings: [{ id: 'usage', detail: d }] }, 2);
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane) || !fs.existsSync(path.join(lane, 'scripts'))) usage('--lane <absolute lane root> is required');
const rp = opt('receipt');
if (!rp) usage('--receipt required');
const pin = opt('expect-driver-sha256');
if (pin === null || !/^[0-9a-f]{64}$/.test(pin)) usage('--expect-driver-sha256 is required: 64 lowercase hex');
const expectNonce = opt('expect-nonce');
if (expectNonce === null || !/^tabi-r78-[a-z0-9-]+$/.test(expectNonce)) usage('--expect-nonce is required: tabi-r78- followed by lowercase letters/digits/hyphens');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const psFile = opt('prior-set');
if (!psFile) usage('--prior-set <committed prior-set file> is required (a caller that omits the prior set must not get clean)');
let psBytes;
try { psBytes = fs.readFileSync(psFile); } catch (e) { out({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set ' + psFile + ': ' + e.message }] }, 2); }
const psLines = psBytes.toString('utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
if (psLines.length === 0) usage('--prior-set lists no receipt');
const extraPriors = argv.flatMap((a, i) => (a === '--prior' ? [argv[i + 1]] : []));
if (extraPriors.some((p) => typeof p !== 'string' || p.startsWith('--'))) usage('--prior needs a path');
// --tree-exempt <path>: a receipt that a pre-freeze gate deliberately keeps OUT of the prior set (the
// case source it copies). It is exempt BY PATH; a different file claiming the same nonce is not.
const treeExempt = argv.flatMap((a, i) => (a === '--tree-exempt' ? [argv[i + 1]] : []));
if (treeExempt.some((p) => typeof p !== 'string' || p.startsWith('--'))) usage('--tree-exempt needs a path');
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
const same = (a, b) => canon(a) === canon(b);
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
const origin = isObj(r.fixture) && typeof r.fixture.origin === 'string' && /^http:\/\/127\.0\.0\.1:\d+$/.test(r.fixture.origin) ? r.fixture.origin : null;

// 1. identity and run binding
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r78-[a-z0-9-]+$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('nonce-on-page', typeof r.nonce === 'string' && r.nonceOnPage === r.nonce, 'page nonce ' + r.nonceOnPage);
// E3: the top-level key set is closed; every key below is read somewhere in this counter, so no
// bookkeeping field is carried unread and an added field cannot ride along unreviewed.
const RECEIPT_KEYS = ['cdpEventLog', 'cdpSendLog', 'chooserHypothesis', 'closedAt', 'degenerate', 'driverSha256', 'events', 'failures', 'finishedAt', 'fixture', 'fixtureInputs', 'frameTree', 'host', 'lateAfterClose', 'legMarks', 'legShape', 'legs', 'mainFrameId', 'nonce', 'nonceOnPage', 'plan', 'predicate', 'schema', 'serverLog', 'startedAt', 'sweeps', 'teardown', 'upload'];
check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS), 'top-level receipt fields ' + JSON.stringify(Object.keys(r).sort()) + ' (want exactly ' + JSON.stringify(RECEIPT_KEYS) + ')');
check('scored-run-not-degenerate', r.degenerate === null, 'degenerate=' + r.degenerate);
const slog = arr(r.serverLog);
const servedRoot = slog.filter((s) => isObj(s) && s.path === '/' && s.status === 200);
const otherRows = slog.filter((s) => !isObj(s) || !((s.path === '/' && s.status === 200) || (s.path === '/favicon.ico' && s.status === 404 && s.run === '' && s.query === '')));
check('server-log-binding', servedRoot.length === 1 && servedRoot.every((s) => s.run === r.nonce && s.query === 'run=' + encodeURIComponent(String(r.nonce))) && otherRows.length === 0,
  'served / rows ' + servedRoot.length + ' (want 1, run = nonce), other rows ' + otherRows.length);
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
let fixtureWant = null;
try {
  const bytes = fs.readFileSync(DRIVER);
  if (sha256(bytes) === pin) {
    const m = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\nconst FIXTURE_TEMPLATE = `([\s\S]*?)`;\n\/\*CHOOSER-FIXTURE-END\*\//.exec(bytes.toString('utf8'));
    if (m && typeof r.nonce === 'string') fixtureWant = sha256(m[1].replaceAll('__NONCE__', r.nonce));
  }
} catch { fixtureWant = null; }
check('fixture-hash', fixtureWant !== null && isObj(r.fixture) && r.fixture.sha256 === fixtureWant && same(r.fixture.viewport, VIEWPORT) && canon(Object.keys(r.fixture).sort()) === canon(['origin', 'sha256', 'viewport']),
  'fixture sha256 ' + (isObj(r.fixture) ? r.fixture.sha256 : null) + ' expected ' + fixtureWant + ' (pinned driver beside the counter: ' + DRIVER + ')');
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion,
  'chromium ' + JSON.stringify(host.chromium) + ' product ' + JSON.stringify(host.cdpProduct) + ' protocol ' + JSON.stringify(host.cdpProtocolVersion) + ' (pinned ' + JSON.stringify(HOST) + ')');
const hargv = arr(host.argv);
const tok = host.launchToken;
const profileArg = hargv.length > 4 && typeof hargv[4] === 'string' && hargv[4].startsWith('--user-data-dir=') ? hargv[4].slice('--user-data-dir='.length) : null;
const argvPort = typeof hargv[2] === 'string' && /^--remote-debugging-port=\d+$/.test(hargv[2]) ? Number(hargv[2].split('=')[1]) : null;
// E3: every slot is pinned, by exact equality with the argv the launch plan derives from the receipt's
// own port, token and viewport; a decoy in any slot (e.g. a second --user-data-dir) changes the array.
const argvWant = argvPort === null || typeof tok !== 'string' || profileArg === null ? null
  : ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + argvPort,
    '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profileArg,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen',
    '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling',
    '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
check('host-argv', argvWant !== null && same(hargv, argvWant) && path.isAbsolute(profileArg) && path.basename(profileArg) === 'profile-' + tok,
  'argv ' + JSON.stringify(hargv) + ' (want exactly ' + JSON.stringify(argvWant) + ')');
const dl = host.devtoolsListening;
check('devtools-port-binding', argvPort !== null && isObj(dl) && dl.port === argvPort && typeof dl.url === 'string' && dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/') && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url), 'argv port ' + argvPort + ' devtools ' + JSON.stringify(dl));
// upload files: in <profile's parent>/upload-<launch token>, with the frozen bytes
const up = isObj(r.upload) ? r.upload : {};
const upDir = profileArg !== null && typeof tok === 'string' ? path.join(path.dirname(profileArg), 'upload-' + tok) : null;
check('upload-binding', upDir !== null && up.dir === upDir && up.missing === MISSING && isObj(up.files) && canon(Object.keys(up.files).sort()) === canon([A, B])
  && [A, B].every((n) => isObj(up.files[n]) && up.files[n].size === UPLOAD[n].size && up.files[n].sha256 === UPLOAD[n].sha256 && canon(Object.keys(up.files[n]).sort()) === canon(['sha256', 'size'])),
  'upload ' + JSON.stringify(up) + ' expected dir ' + upDir);
const browserId = (h) => { const u = isObj(h) && isObj(h.devtoolsListening) && typeof h.devtoolsListening.url === 'string' ? h.devtoolsListening.url : ''; const m = /\/devtools\/browser\/([0-9a-f-]{36})$/i.exec(u); return m ? m[1].toLowerCase() : null; };
check('replay-launch-token', typeof tok === 'string' && /^[0-9a-f]{12}$/.test(tok) && priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok), 'launchToken ' + tok + ' (shape 12 hex, and not the launch token of any prior receipt)');
const bid = browserId(host);
check('replay-devtools-url', bid !== null && priors.every((p) => browserId(p.host) !== bid), 'devtools browser id ' + bid + ' (uuid shape, and not the browser id of any prior receipt)');
// Pair/gap near-match (D1): both fractions divide by the PRIOR's own counts.
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75, MIN_OWN_GAPS = 11;
const pairs = (x) => arr(x.events).filter((e) => isObj(e) && num(e.ts) && num(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const timelineSim = (a, p) => {
  const np = pairs(p).length, gp = gaps(p).length;
  const absMatched = pairMatch(a, p), gapMatched = matchCount(gaps(a), gaps(p));
  const absNeed = Math.ceil(FRAC * np - 1e-9), gapNeed = Math.ceil(GAP_FRAC * gp - 1e-9);
  return { priorEvents: np, priorGaps: gp, absMatched, gapMatched, absNeed, gapNeed, refused: (np > 0 && absMatched >= absNeed) || (gp > 0 && gapMatched >= gapNeed) };
};
const sims = priors.map((p) => timelineSim(r, p));
const replayIdx = sims.findIndex((s) => s.refused);
const ownGaps = gaps(r).length;
check('replay-event-timeline', events.length > 0 && ownGaps >= MIN_OWN_GAPS && replayIdx === -1, 'pair/gap near-match within ' + TOL + ' ms of prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (refuse when absMatched >= ceil(' + FRAC + ' * prior events) or gapMatched >= ceil(' + GAP_FRAC + ' * prior gaps); own >= ' + GAP_MIN + ' ms gaps ' + ownGaps + ', need >= ' + MIN_OWN_GAPS + ')');
// Prior-set completeness over the two trees this round's driver writes into (E2).
// Every regular file is parsed whatever its bytes spell (a JSON-escaped schema no longer hides a
// receipt), symlinks are followed with real paths de-duplicated, and a parsed object is a receipt by
// its top-level `schema` alone. The exemption is the REAL PATH of the receipt under test, never its
// self-claimed nonce (a second contradictory receipt claiming the run's nonce is now outside the set).
const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
const priorReal = new Set(priorPaths.map(real));
const selfReal = real(rp);
const exemptReal = new Set(treeExempt.map((p) => real(path.isAbsolute(p) ? p : path.join(lane, p))));
const outside = [], unparsable = [];
const seen = new Set();
const walk = (d) => {
  const rd = real(d); if (seen.has(rd)) return; seen.add(rd);
  let ents; try { ents = fs.readdirSync(d); } catch { return; }
  for (const name of ents) {
    const p = path.join(d, name);
    let stt; try { stt = fs.statSync(p); } catch { continue; }
    if (stt.isDirectory()) { walk(p); continue; }
    if (!stt.isFile()) continue;
    const rf = real(p); if (seen.has(rf)) continue; seen.add(rf);
    let b; try { b = fs.readFileSync(p); } catch { unparsable.push(path.relative(lane, p) + ' (unreadable)'); continue; }
    let j; try { j = JSON.parse(b.toString('utf8')); } catch { if (/\.json$/i.test(name) || /^\s*[[{]/.test(b.subarray(0, 64).toString('utf8'))) unparsable.push(path.relative(lane, p)); continue; }
    if (isObj(j) && j.schema === SCHEMA && ('nonce' in j || 'events' in j) && rf !== selfReal && !priorReal.has(rf) && !exemptReal.has(rf)) outside.push(path.relative(lane, p));
  }
};
for (const t of ['.ufo/waves/round-78', 'corpus/evidence/round78']) walk(path.join(lane, t));
check('prior-set-complete', outside.length === 0, 'receipts of schema ' + SCHEMA + ' in the round-78 wave/evidence trees, not the receipt under test (path ' + path.relative(lane, rp) + '), and not among the priors: ' + outside.join(','));
check('prior-set-unparsable', unparsable.length === 0, 'files in the round-78 wave/evidence trees that look like JSON but do not parse (refused, not skipped): ' + unparsable.join(','));
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
const t0 = typeof r.startedAt === 'string' ? Date.parse(r.startedAt) : NaN, t1 = typeof r.finishedAt === 'string' ? Date.parse(r.finishedAt) : NaN;
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 6000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (a full run takes >= 6 s: 15 legs with 300 ms settle waits and two 1.5 s open waits)');
check('plan-frozen', same(r.plan, FROZEN), 'plan differs from the frozen leg plan');
check('leg-order', legs.length === LEG_ORDER.length && same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
// every field of a leg record is read
const sendById = new Map(sendLog.filter(isObj).map((c) => [c.id, c]));
const errOk = (e) => e === null || (isObj(e) && same(Object.keys(e).sort(), ['code', 'message']) && Number.isInteger(e.code) && typeof e.message === 'string');
const LEG_KEYS = ['elapsedMs', 'interceptError', 'interceptResult', 'interceptSendId', 'kind', 'name', 'opened', 'openedNode', 'setError', 'setParams', 'setResult', 'setSendId', 'stateAfter', 'triggerError', 'triggerResult', 'triggerSendId'].sort();
const legRecBad = [];
FROZEN.forEach((p, i) => {
  const l = legs[i];
  const bad = (why) => legRecBad.push(p.name + ':' + why);
  if (!isObj(l)) return bad('not an object');
  if (!same(Object.keys(l).sort(), LEG_KEYS)) bad('keys');
  if (l.kind !== p.kind) bad('kind');
  // floor 290 for a 300 ms settle measured with Date.now() (r76: 299 on 3 of 13 honest receipts)
  if (!num(l.elapsedMs) || l.elapsedMs < 290) bad('elapsedMs');
  if (!errOk(l.interceptError) || !errOk(l.triggerError) || !errOk(l.setError)) bad('error shape');
  // intercept send
  if (p.intercept === null) { if (l.interceptSendId !== null || l.interceptResult !== null || l.interceptError !== null) bad('intercept fields'); }
  else { const c = sendById.get(l.interceptSendId); if (!c || c.method !== 'Page.setInterceptFileChooserDialog' || !same(c.params, p.intercept) || l.interceptError !== null || !same(l.interceptResult, {})) bad('intercept send'); }
  if (p.kind === null || p.kind === 'intercept') {
    if (l.triggerSendId !== null || l.triggerResult !== null || l.triggerError !== null || l.opened !== null || l.openedNode !== null || l.setSendId !== null || l.setParams !== null || l.setResult !== null || l.setError !== null) bad('no-trigger leg carries a trigger');
    return;
  }
  const t = sendById.get(l.triggerSendId);
  if (p.kind === 'click') {
    if (!t || t.method !== 'Input.dispatchMouseEvent' || !same(t.params, { type: 'mouseReleased', x: p.at[0], y: p.at[1], button: 'left', buttons: 0, clickCount: 1 })) bad('trigger send');
    if (l.triggerError !== null || !same(l.triggerResult, {})) bad('click triggerResult');
  } else if (p.kind === 'script') {
    if (!t || t.method !== 'Runtime.evaluate' || !same(t.params, { expression: SCRIPT_CLICK, returnByValue: true })) bad('trigger send');
    if (l.triggerError !== null || !same(l.triggerResult, { result: { type: 'number', value: 1, description: '1' } })) bad('script triggerResult');
  } else if (p.kind === 'set-object') {
    if (!t || t.method !== 'Runtime.evaluate' || !same(t.params, { expression: BUTTON_OBJECT, returnByValue: false })) bad('trigger send');
    const tr = l.triggerResult;
    if (l.triggerError !== null || !isObj(tr) || !same(Object.keys(tr).sort(), ['className', 'description', 'objectId', 'subtype', 'type']) || tr.type !== 'object' || tr.subtype !== 'node' || tr.className !== 'HTMLButtonElement' || tr.description !== 'button#f' || typeof tr.objectId !== 'string' || tr.objectId === '') bad('set-object triggerResult');
  }
  if (p.kind === 'set-object') { if (l.opened !== null || l.openedNode !== null) bad('set-object opened'); }
  else if (typeof l.opened !== 'boolean' || (l.opened ? !Number.isInteger(l.openedNode) : l.openedNode !== null)) bad('opened');
  // the set send: exactly the plan's paths in the upload dir, on the opened node (or the button object)
  const wantSet = p.files !== null && (p.kind === 'set-object' || l.opened === true);
  if (!wantSet) { if (l.setSendId !== null || l.setParams !== null || l.setResult !== null || l.setError !== null) bad('set fields without a set'); return; }
  const files = upDir === null ? null : p.files.map((n) => path.join(upDir, n));
  const wantParams = p.kind === 'set-object' ? { files, objectId: isObj(l.triggerResult) ? l.triggerResult.objectId : null } : { files, backendNodeId: l.openedNode };
  if (!same(l.setParams, wantParams)) bad('setParams');
  const s = sendById.get(l.setSendId);
  if (!s || s.method !== 'DOM.setFileInputFiles' || !same(s.params, l.setParams)) bad('set send');
  if (l.setError === null ? !same(l.setResult, {}) : l.setResult !== null) bad('setResult');
  if (p.kind === 'click' && (l.triggerSendId === null || l.setSendId <= l.triggerSendId)) bad('set before trigger');
  if (p.kind === 'set-object' && l.setSendId !== l.triggerSendId + 1) bad('set not right after the object lookup');
});
check('leg-records', legs.length === FROZEN.length && legRecBad.length === 0, 'leg records: ' + legRecBad.join(','));
check('seq-monotonic', events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1), 'event seq is not 1..N in order');
check('event-leg-domain', events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg)), 'events outside the planned legs: ' + events.filter((e) => !isObj(e) || !LEG_ORDER.includes(e.leg)).length);
const nullOrInt = (v) => v === null || Number.isInteger(v);
const fileTriple = (f) => Array.isArray(f) && f.length === 3 && typeof f[0] === 'string' && Number.isInteger(f[1]) && f[1] >= 0 && typeof f[2] === 'string';
const EV_KEYS = ['act', 'at', 'buttons', 'files', 'isTrusted', 'leg', 'ret', 'seq', 'target', 'ts', 'type', 'x', 'y'];
const typed = (e) => isObj(e) && same(Object.keys(e).sort(), EV_KEYS) && typeof e.type === 'string' && EVENT_TYPES.has(e.type) && num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0
  && typeof e.isTrusted === 'boolean' && (e.target === null || typeof e.target === 'string') && nullOrInt(e.x) && nullOrInt(e.y) && nullOrInt(e.buttons)
  && (e.x === null) === (e.y === null) && (e.x === null) === (e.buttons === null)
  // a read's ts is taken when the read resolves and `at` when it is recorded: ts <= at (pre-freeze pass 1
  // required ts === at and refuted 12 of 13 honest receipts, 0.1-4 ms apart: lesson-proof/counter-pass1/)
  && (e.type === 'read' ? e.act === null && e.x === null && Array.isArray(e.files) && e.files.length === 1 && fileTriple(e.files[0]) && typeof e.ret === 'string' && e.ts <= e.at
    : typeof e.act === 'boolean' && e.ret === null && (['input', 'change', 'cancel'].includes(e.type) ? e.x === null && Array.isArray(e.files) && e.files.every(fileTriple) : Number.isInteger(e.x) && e.files === null));
check('event-types', events.length > 0 && events.every(typed), 'events with a non-strict field set or type: ' + events.filter((e) => !typed(e)).length);

// 2. page-side leg marks bind every event to the window of its label
const markNames = marks.map((m) => (isObj(m) ? m.name : null));
const marksOk = same(markNames, ['start', ...LEG_ORDER]) && marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 || m.at >= marks[i - 1].at))
  && num(r.closedAt) && marks.length > 0 && r.closedAt >= marks[marks.length - 1].at && Number.isInteger(r.lateAfterClose) && r.lateAfterClose === 0;
check('leg-marks', marksOk, 'legMarks ' + markNames.join(',') + ' closedAt ' + r.closedAt + ' lateAfterClose ' + r.lateAfterClose);
const windowOf = (name) => { const i = LEG_ORDER.indexOf(name) + 1; return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null; };
check('event-leg-window', marksOk && events.every((e, i) => { if (!isObj(e) || !num(e.at) || !LEG_ORDER.includes(e.leg)) return false; const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] && (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at)); }),
  'events whose handler time lies outside their labelled leg window: ' + (marksOk ? events.filter((e) => { if (!isObj(e) || !num(e.at)) return true; const w = windowOf(e.leg); return !w || e.at < w[0] || e.at > w[1]; }).length : 'marks unusable'));

// 3. producer: real clicks, intercepted choosers answered as planned, closed allow-list
const n = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length;
const inputLike = sendLog.filter((c) => isObj(c) && typeof c.method === 'string' && /^input\.|^dom\.setfileinputfiles$|^page\.setinterceptfilechooserdialog$/i.test(c.method));
check('chooser-call-count', inputLike.length === 34 && n('Input.dispatchMouseEvent') === 22 && n('DOM.setFileInputFiles') === 9 && n('Page.setInterceptFileChooserDialog') === 3 && n('Page.navigate') === 1,
  'Input/set/intercept calls ' + inputLike.length + ' (dispatchMouseEvent ' + n('Input.dispatchMouseEvent') + ', setFileInputFiles ' + n('DOM.setFileInputFiles') + ', setInterceptFileChooserDialog ' + n('Page.setInterceptFileChooserDialog') + '; Page.navigate ' + n('Page.navigate') + '; want 22 + 9 + 3 and 1)');
const planCalls = [['Page.navigate', { url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) }]];
for (const p of FROZEN) {
  const l = legOf(p.name);
  if (p.intercept) planCalls.push(['Page.setInterceptFileChooserDialog', p.intercept]);
  if (p.kind === 'click') planCalls.push(['Input.dispatchMouseEvent', { type: 'mousePressed', x: p.at[0], y: p.at[1], button: 'left', buttons: 1, clickCount: 1 }], ['Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.at[0], y: p.at[1], button: 'left', buttons: 0, clickCount: 1 }]);
  if (p.files !== null && (p.kind === 'set-object' || p.kind === 'click')) planCalls.push(['DOM.setFileInputFiles', { files: upDir === null ? null : p.files.map((x) => path.join(upDir, x)), ...(p.kind === 'set-object' ? { objectId: isObj(l.triggerResult) ? l.triggerResult.objectId : null } : { backendNodeId: l.openedNode ?? null }) }]);
}
const gotCalls = sendLog.filter((c) => isObj(c) && /^(Input\.|DOM\.setFileInputFiles$|Page\.setInterceptFileChooserDialog$|Page\.navigate$)/i.test(String(c.method))).map((c) => [c.method, c.params]);
check('chooser-call-params', origin !== null && same(gotCalls, planCalls), 'Input / setFileInputFiles / setInterceptFileChooserDialog / navigate calls differ from the frozen plan (method, params, order)');
const EVK = { 'Page.fileChooserOpened': ['backendNodeId', 'frameId', 'mode'], 'Page.frameNavigated': ['frameId', 'url'] };
const evN = (m) => eventLog.filter((e) => isObj(e) && e.method === m).length;
const evShapeOk = (e) => isObj(e) && same(Object.keys(e).sort(), ['afterSendId', 'method', 'params']) && Number.isInteger(e.afterSendId) && EVK[e.method] !== undefined
  && isObj(e.params) && same(Object.keys(e.params).sort(), EVK[e.method]);
check('cdp-event-log-closed', eventLog.every(evShapeOk) && evN('Page.fileChooserOpened') === 10 && evN('Page.frameNavigated') === 1,
  'CDP event log must hold exactly 10 chooser openings and 1 main-frame navigation with their exact keys: ' + eventLog.length + ' entries');
// each opening arrives after its leg's trigger send and before the leg's next send
const legIdxOfTrigger = (id) => legs.findIndex((l) => isObj(l) && l.triggerSendId === id && id !== null);
const bindBad = eventLog.filter((e) => {
  if (!isObj(e)) return true;
  if (e.method !== 'Page.fileChooserOpened') return false;
  const i = legIdxOfTrigger(e.afterSendId); if (i < 0) return true;
  const l = legs[i]; return l.opened !== true || !isObj(e.params) || e.params.backendNodeId !== l.openedNode || (l.setSendId !== null && l.setSendId !== e.afterSendId + 1);
}).length;
const ordered = eventLog.every((e, i) => isObj(e) && (i === 0 || (isObj(eventLog[i - 1]) && e.afterSendId >= eventLog[i - 1].afterSendId)));
const openedLegs = legs.filter((l) => isObj(l) && l.opened === true).length;
check('chooser-event-binding', bindBad === 0 && ordered && openedLegs === 10, 'chooser events not bound to their leg trigger (' + bindBad + '), afterSendId order ' + ordered + ', opened legs ' + openedLegs + ' (want 10)');
const mf = r.mainFrameId;
const navs = eventLog.filter((e) => isObj(e) && e.method === 'Page.frameNavigated');
const firstNav = sendLog.find((c) => isObj(c) && c.method === 'Page.navigate');
check('frame-binding', typeof mf === 'string' && /^[0-9A-F]{32}$/.test(mf) && eventLog.filter((e) => isObj(e) && e.method === 'Page.fileChooserOpened').every((e) => isObj(e.params) && e.params.frameId === mf)
  && navs.length === 1 && isObj(navs[0].params) && navs[0].params.frameId === mf && origin !== null && navs[0].params.url === origin + '/?run=' + encodeURIComponent(String(r.nonce))
  && isObj(firstNav) && navs[0].afterSendId >= firstNav.id && eventLog.indexOf(navs[0]) === 0,
  'main frame id ' + JSON.stringify(mf) + ', navigation ' + JSON.stringify(navs.map((e) => e.params)) + ' (every chooser event and the one navigation in the main frame; url = origin + /?run=<nonce>; the navigation first)');
const readyExpr = 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(r.nonce);
// E3: the main frame is derived from the Page.getFrameTree result the driver recorded, so the id every
// event is compared against is not a self-referential field.
const ftree = isObj(r.frameTree) ? r.frameTree : {};
check('frame-tree', typeof mf === 'string' && same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl']) && ftree.mainFrameId === mf && ftree.mainFrameParentId === null && ftree.mainFrameUrl === 'about:blank',
  'frameTree ' + JSON.stringify(ftree) + ' (the main frame comes from Page.getFrameTree: id, no parent, about:blank)');
const EXPRS = new Set(['window.__nonceOnPage', 'window.__closeRecord()', 'window.__late', 'window.__state()', 'window.__inputs()', readyExpr, ...LEG_ORDER.map((nm) => 'window.__setLeg(' + JSON.stringify(nm) + ')')]);
const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree']);
const allowed = (c) => {
  if (!isObj(c) || !Number.isInteger(c.id) || typeof c.method !== 'string' || !isObj(c.params)) return false;
  if (EMPTY.has(c.method)) return same(c.params, {});
  if (c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Page.navigate') return true; // params bound by chooser-call-params
  if (c.method === 'Runtime.evaluate') return same(c.params, { expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression)
    || same(c.params, { expression: SCRIPT_CLICK, returnByValue: true }) || same(c.params, { expression: BUTTON_OBJECT, returnByValue: false });
  if (c.method === 'Emulation.setDeviceMetricsOverride') return same(c.params, { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });
  return false;
};
const once = (m) => sendLog.filter((c) => isObj(c) && c.method === m).length === 1;
const evalN = (x) => sendLog.filter((c) => isObj(c) && c.method === 'Runtime.evaluate' && isObj(c.params) && c.params.expression === x).length;
check('send-log-allowlist', sendLog.length > 0 && sendLog.every(allowed) && sendLog.every((c, i) => isObj(c) && c.id === i + 1) && once('Emulation.setDeviceMetricsOverride') && once('Browser.getVersion') && once('Page.getFrameTree')
  && evalN(SCRIPT_CLICK) === 1 && evalN(BUTTON_OBJECT) === 1,
  'sends outside the driver\'s closed call set: ' + sendLog.filter((c) => !allowed(c)).map((c) => (isObj(c) ? c.method : typeof c)).join(',') + '; script click x' + evalN(SCRIPT_CLICK) + ', button lookup x' + evalN(BUTTON_OBJECT));

// 4. per leg, re-derived from raw events, records and CDP events
const derived = {};
for (const name of LEG_ORDER) {
  const evs = events.filter((e) => isObj(e) && e.leg === name);
  const ptr = evs.filter((e) => e.type !== 'read');
  const leg = legOf(name);
  const want = SHAPE[name];
  const bound = eventLog.filter((e) => evShapeOk(e) && e.method === 'Page.fileChooserOpened' && leg.triggerSendId != null && e.afterSendId === leg.triggerSendId);
  derived[name] = {
    seq: evs.map((e) => e.type + '@' + e.target), trusted: ptr.map((e) => e.isTrusted), act: ptr.map((e) => e.act),
    xy: ptr.map((e) => [e.x, e.y, e.buttons]), files: ptr.filter((e) => e.files !== null).map((e) => [e.type, e.target, e.files]),
    read: evs.filter((e) => e.type === 'read').map((e) => [e.target, Array.isArray(e.files) && Array.isArray(e.files[0]) ? e.files[0][0] : null, e.ret]),
    opened: bound.map((e) => [e.params.mode, e.params.backendNodeId ?? null]),
    error: [leg.interceptError ?? null, leg.triggerError ?? null, leg.setError ?? null], stateAfter: isObj(leg.stateAfter) ? leg.stateAfter : null,
  };
  const d = derived[name];
  check(`leg-${name}-seq`, same(d.seq, want.seq), name + ' sequence ' + JSON.stringify(d.seq));
  check(`leg-${name}-trusted`, same(d.trusted, want.trusted), name + ' trusted ' + JSON.stringify(d.trusted));
  check(`leg-${name}-act`, same(d.act, want.act), name + ' transient activation ' + JSON.stringify(d.act));
  check(`leg-${name}-xy`, same(d.xy, want.xy), name + ' [x, y, buttons] ' + JSON.stringify(d.xy));
  check(`leg-${name}-files`, same(d.files, want.files), name + ' input/change/cancel file lists ' + JSON.stringify(d.files));
  check(`leg-${name}-read`, same(d.read, want.read), name + ' file reads ' + JSON.stringify(d.read));
  check(`leg-${name}-opened-mode`, same(d.opened.map((x) => x[0]), want.opened.map((x) => x[0])), name + ' chooser modes ' + JSON.stringify(d.opened.map((x) => x[0])) + ' (node ids reported in nodeReport, not required)');
  check(`leg-${name}-error`, same(d.error, want.error), name + ' errors ' + JSON.stringify(d.error));
  check(`leg-${name}-state`, same(d.stateAfter, want.stateAfter), name + ' state after ' + JSON.stringify(d.stateAfter));
}

// E1: the page measured its own element descriptors before the legs ran. Each leg's page-side target
// letter is bound to that descriptor (tag, type, attribute, rect containing the commanded point), so a
// chooser event is bound to the page element its leg recorded, not to a browser-assigned id.
const FIXI_WANT = { s: { tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: null }, m: { tag: 'input', type: 'file', multiple: true, webkitdirectory: false, accept: null }, d: { tag: 'input', type: 'file', multiple: false, webkitdirectory: true, accept: null }, k: { tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: '.png' }, f: { tag: 'button', type: 'submit', multiple: false, webkitdirectory: false, accept: null } };
const fixi = arr(r.fixtureInputs);
const fixiBad = [];
if (fixi.length !== 5) fixiBad.push('count ' + fixi.length);
for (const [id, want] of Object.entries(FIXI_WANT)) {
  const dsc = fixi.find((x) => isObj(x) && x.id === id);
  if (!dsc) { fixiBad.push(id + ':missing'); continue; }
  if (!same(Object.keys(dsc).sort(), ['accept', 'id', 'multiple', 'rect', 'tag', 'type', 'webkitdirectory'])) { fixiBad.push(id + ':keys'); continue; }
  for (const k of Object.keys(want)) if (!same(dsc[k], want[k])) fixiBad.push(id + ':' + k);
  if (!isObj(dsc.rect) || !same(Object.keys(dsc.rect).sort(), ['height', 'left', 'top', 'width']) || !['height', 'left', 'top', 'width'].every((k) => num(dsc.rect[k]))) fixiBad.push(id + ':rect');
}
for (const p of FROZEN.filter((x) => x.kind === 'click')) {
  const dsc = fixi.find((x) => isObj(x) && x.id === AT_TARGET[p.at.join(',')]);
  if (!dsc || !isObj(dsc.rect)) { fixiBad.push(p.name + ':no descriptor'); continue; }
  if (!(p.at[0] >= dsc.rect.left && p.at[0] < dsc.rect.left + dsc.rect.width && p.at[1] >= dsc.rect.top && p.at[1] < dsc.rect.top + dsc.rect.height)) fixiBad.push(p.name + ':point outside');
}
check('fixture-descriptors', fixiBad.length === 0, 'page-side element descriptors: ' + fixiBad.join(','));

// 5. cross-leg laws (sources in the round-77 note)
const ev = events.filter(isObj);
const untrusted = ev.filter((e) => e.isTrusted !== true);
check('trust-law', ev.length > 0 && untrusted.length === 2 && untrusted.every((e) => e.type === 'click' && e.target === 's' && (e.leg === 'script-click' || e.leg === 'forward-click')) && new Set(untrusted.map((e) => e.leg)).size === 2,
  'untrusted page events (want exactly the two script-driven click@s of script-click and forward-click): ' + untrusted.map((e) => e.type + '@' + e.target + '/' + e.leg).join(','));
// activation-law: per trigger leg, a chooser event is bound iff the click that reached a file input
// carried transient activation while interception was on (Page.setInterceptFileChooserDialog enabled)
let icpt = false;
const actBad = [];
for (const p of FROZEN) {
  if (p.intercept) icpt = p.intercept.enabled === true;
  if (p.kind !== 'click' && p.kind !== 'script') continue;
  const l = legOf(p.name);
  const clicks = ev.filter((e) => e.leg === p.name && e.type === 'click' && ['s', 'm', 'd', 'k'].includes(e.target));
  const bound = eventLog.filter((e) => isObj(e) && e.method === 'Page.fileChooserOpened' && l.triggerSendId != null && e.afterSendId === l.triggerSendId).length;
  const want = clicks.length === 1 && clicks[0].act === true && icpt;
  if (clicks.length !== 1 || bound !== (want ? 1 : 0)) actBad.push(p.name);
}
check('activation-law', actBad.length === 0, 'legs whose chooser event does not follow (one click on a file input with transient activation, interception on): ' + actBad.join(','));
// mode-law: mode is selectMultiple iff the page-measured descriptor of the input the leg opened has `multiple`
const modeBad = FROZEN.filter((p) => p.kind === 'click').filter((p) => {
  const l = legOf(p.name); const o = eventLog.find((e) => isObj(e) && e.method === 'Page.fileChooserOpened' && l.triggerSendId != null && e.afterSendId === l.triggerSendId);
  if (!o) return false; const inp = OPENS[AT_TARGET[p.at.join(',')]];
  const dsc = fixi.find((x) => isObj(x) && x.id === inp);
  if (!dsc) return true;
  return !isObj(o.params) || o.params.mode !== (dsc.multiple === true ? 'selectMultiple' : 'selectSingle');
});
check('mode-law', modeBad.length === 0, 'chooser events whose mode is not the page-measured input\'s (multiple attribute -> selectMultiple, else selectSingle; webkitdirectory included): ' + modeBad.map((p) => p.name).join(','));
// node-binding-law: one backendNodeId per input, distinct across inputs; the set targets the opened node
const nodeOf = {};
const nodeBad = [];
for (const p of FROZEN.filter((x) => x.kind === 'click')) {
  const l = legOf(p.name); if (l.opened !== true) continue;
  const inp = OPENS[AT_TARGET[p.at.join(',')]];
  if (nodeOf[inp] === undefined) nodeOf[inp] = l.openedNode; else if (nodeOf[inp] !== l.openedNode) nodeBad.push(p.name + ':node');
  if (l.setParams !== null && (!isObj(l.setParams) || l.setParams.backendNodeId !== l.openedNode)) nodeBad.push(p.name + ':set');
}
const nodeVals = Object.values(nodeOf);
check('node-binding-law', nodeBad.length === 0 && Object.keys(nodeOf).length === 4 && new Set(nodeVals).size === nodeVals.length && nodeVals.every((v) => Number.isInteger(v) && v > 0),
  'backendNodeId binding: ' + nodeBad.join(',') + ' map ' + JSON.stringify(nodeOf) + ' (one id per input s/m/d/k, distinct; the set on the opened node)');
// selection model (file_input_type.cc SetFilesFromPaths / SetFilesAndDispatchEvents): replay the plan
// against a model of the four inputs and derive the expected events and state per leg
const trip = (nm) => [nm, UPLOAD[nm].size, UPLOAD[nm].type];
const model = { s: [], m: [], d: [], k: [] };
const expect = {};
for (const p of FROZEN) {
  const l = legOf(p.name);
  const e = { fileEvents: [], reads: [] };
  if (p.kind === 'click' && l.opened === true) {
    const inp = OPENS[AT_TARGET[p.at.join(',')]];
    if (p.files !== null && p.files.length > 0) {
      const chosen = (MULTIPLE[inp] ? p.files : p.files.slice(0, 1)).map(trip);
      if (same(chosen, model[inp])) e.fileEvents.push(['cancel', inp, model[inp]]);
      else { model[inp] = chosen; e.fileEvents.push(['input', inp, chosen], ['change', inp, chosen]); e.reads = chosen.map((f) => [inp, f[0]]); }
    } else if (p.files === null && p.intercept && p.intercept.cancel === true) e.fileEvents.push(['cancel', inp, model[inp]]);
  } else if (p.kind === 'click' && p.intercept && p.intercept.enabled === false) {
    const inp = OPENS[AT_TARGET[p.at.join(',')]]; e.fileEvents.push(['cancel', inp, model[inp]]);
  }
  e.state = { s: model.s, m: model.m, d: model.d, k: model.k, sValue: model.s.length ? 'C:\\fakepath\\' + model.s[0][0] : '' };
  expect[p.name] = e;
}
const fileEvs = (name) => ev.filter((e) => e.leg === name && ['input', 'change', 'cancel'].includes(e.type)).map((e) => [e.type, e.target, e.files]);
const selBad = FROZEN.filter((p) => !(p.name === 'pick-same' || p.name === 'pick-empty' || p.name === 'intercept-cancel' || p.name === 'intercept-off'))
  .filter((p) => !same(fileEvs(p.name), expect[p.name].fileEvents) || !same(legOf(p.name).stateAfter, expect[p.name].state));
check('selection-law', selBad.length === 0, 'legs whose input/change events or state are not the selection model\'s (single input keeps paths[0]; accept not enforced; missing path -> size 0): ' + selBad.map((p) => p.name).join(','));
const cancelLegs = ['pick-same', 'intercept-cancel', 'intercept-off'];
const cancels = ev.filter((e) => e.type === 'cancel');
const cancelBad = cancelLegs.filter((nm) => !same(fileEvs(nm), expect[nm].fileEvents) || expect[nm].fileEvents.length !== 1 || !same(legOf(nm).stateAfter, expect[nm].state));
check('cancel-law', cancelBad.length === 0 && cancels.length === 3 && cancels.every((e) => cancelLegs.includes(e.leg)),
  'cancel events (unchanged selection, interception with cancel, headless chooser with interception off; files unchanged): ' + cancelBad.join(',') + ' total ' + cancels.length);
const pe = legOf('pick-empty'), pm = legOf('pick-missing');
check('empty-list-law', fileEvs('pick-empty').length === 0 && ev.filter((e) => e.leg === 'pick-empty' && e.type === 'read').length === 0 && isObj(pe.setParams) && Array.isArray(pe.setParams.files) && pe.setParams.files.length === 0
  && pe.setError === null && same(pe.setResult, {}) && same(pe.stateAfter, pm.stateAfter),
  'an empty path list: no input/change/cancel, the selection kept: events ' + JSON.stringify(fileEvs('pick-empty')) + ' state ' + JSON.stringify(pe.stateAfter));
const reads = ev.filter((e) => e.type === 'read');
const wantReads = FROZEN.flatMap((p) => expect[p.name].reads.map((x) => [p.name, ...x]));
const readBad = reads.filter((e) => { const nm = Array.isArray(e.files) && Array.isArray(e.files[0]) ? e.files[0][0] : null; const u = UPLOAD[nm]; return !u || !same(e.files[0], trip(nm)) || e.ret !== (u.hex === null ? 'error:NotFoundError' : 'hex:' + u.hex) || (u.hex !== null && sha256(Buffer.from(u.hex, 'hex')) !== u.sha256); });
check('read-law', readBad.length === 0 && same(reads.map((e) => [e.leg, e.target, Array.isArray(e.files) && Array.isArray(e.files[0]) ? e.files[0][0] : null]), wantReads),
  'file reads: the page reads exactly the uploaded bytes, and a missing path reads NotFoundError: bad ' + readBad.length + ', reads ' + JSON.stringify(reads.map((e) => [e.leg, e.target, e.ret])));
const nf = legOf('not-file-input');
check('not-file-input-law', same(nf.setError, NOT_FILE_INPUT) && nf.setResult === null && isObj(nf.triggerResult) && nf.triggerResult.className === 'HTMLButtonElement' && isObj(nf.setParams) && nf.setParams.objectId === nf.triggerResult.objectId
  && ev.filter((e) => e.leg === 'not-file-input').length === 0 && same(nf.stateAfter, legOf('script-click').stateAfter),
  'setFileInputFiles on the button: error ' + JSON.stringify(nf.setError) + ' (want ' + JSON.stringify(NOT_FILE_INPUT) + ', no page event, state unchanged)');
const ic = legOf('intercept-cancel'), io = legOf('intercept-off');
check('intercept-law', ic.opened === true && ic.setSendId === null && fileEvs('intercept-cancel').length === 1 && fileEvs('intercept-cancel')[0][0] === 'cancel'
  && io.opened === false && fileEvs('intercept-off').length === 1 && fileEvs('intercept-off')[0][0] === 'cancel' && eventLog.filter((e) => isObj(e) && io.triggerSendId != null && e.afterSendId >= io.triggerSendId).length === 0,
  'interception with cancel: opened ' + ic.opened + ' events ' + JSON.stringify(fileEvs('intercept-cancel')) + '; interception off: opened ' + io.opened + ' events ' + JSON.stringify(fileEvs('intercept-off')));
const coordBad = ev.filter((e) => { if (e.x === null || e.isTrusted !== true) return false; const p = planOf(e.leg); return !p || p.kind !== 'click' || e.x !== p.at[0] || e.y !== p.at[1] || e.target !== AT_TARGET[p.at.join(',')]; });
check('coordinate-law', ev.length > 0 && coordBad.length === 0, 'trusted pointer events not at their leg\'s commanded point on its element: ' + coordBad.map((e) => e.type + '@' + e.leg + ':' + e.x + ',' + e.y).join(';'));

// 6. closure, producer verdict, summary consistency
const td = isObj(r.teardown) ? r.teardown : {};
check('teardown-closure', td.postKillSweepCount === 0 && arr(td.survivors).length === 0 && td.sweepError === null && isObj(td.portProbes) && td.portProbes.fixture === 'closed' && td.portProbes.devtools === 'closed' && isObj(td.postKillCurl) && td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7, 'teardown ' + JSON.stringify(td));
check('failures-empty', Array.isArray(r.failures) && r.failures.length === 0, 'failures ' + JSON.stringify(r.failures));
check('producer-verdict', r.predicate === true && r.chooserHypothesis === 'CONFIRMED', 'producer predicate ' + JSON.stringify(r.predicate) + ' hypothesis ' + JSON.stringify(r.chooserHypothesis));
check('legshape-consistency', same(r.legShape, derived), 'producer legShape differs from the re-derivation');

const missing = CHECK_IDS.filter((id) => !(id in checks));
if (missing.length) findings.push({ id: 'counter-internal', detail: 'unevaluated checks ' + missing.join(',') });
const verdict = findings.length === 0 ? 'clean' : 'findings';
out({ schema: 'tabi-check-filechooser-r78', verdict, receipt: rp, nonce: r.nonce ?? null, checkCount: Object.keys(checks).length,
  priorSetFile: { path: psFile, sha256: sha256(psBytes), lines: psLines.length }, priorSet,
  timeline: { absThreshold: FRAC, gapThreshold: GAP_FRAC, tolerance: TOL, gapMin: GAP_MIN, minOwnGaps: MIN_OWN_GAPS, ownGaps, ownEvents: pairs(r).length },
  limit: sims.map((s, i) => ({ prior: priorSet[i].path, ...s })),
  nodeReport: LEG_ORDER.filter((nm) => isObj(derived[nm]) && derived[nm].opened.length > 0).map((nm) => ({ leg: nm, ids: derived[nm].opened.map((x) => x[1]) })),
  walk: { trees: ['.ufo/waves/round-78', 'corpus/evidence/round78'], outside, unparsable },
  checks, findings, derived }, findings.length === 0 ? 0 : 1);
