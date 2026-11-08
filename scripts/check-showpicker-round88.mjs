#!/usr/bin/env node
// Isolated --selftest for check-showpicker-round88.mjs (D3). Asserts one stable finding id on
// an isolated fixture: a receipt whose schema is wrong is refused with `schema` (exit 1).
// Usage: node check-showpicker-round88.mjs --selftest [--json]
// Note: --selftest is a standalone mode; it takes no --lane/--receipt arguments. It copies this
// file into a scratch dir (never the lane) and spawns the copy against a fixture receipt whose
// only defect is the schema, so the run is red with finding id `schema` and exit 1.
const selftestArgv = process.argv.slice(2);
const selftestAsJson = selftestArgv.includes('--json');
if (selftestArgv.includes('--selftest')) {
  const fs = (await import('node:fs')).default;
  const path = (await import('node:path')).default;
  const { spawnSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const self = fileURLToPath(import.meta.url);
  const base = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
  let scratch = base + '/tabi-r88-counter-selftest-' + process.pid;
  try { fs.mkdirSync(scratch, { recursive: true }); } catch {}
  const copy = path.join(scratch, 'check-showpicker-round88.mjs');
  fs.copyFileSync(self, copy);
  const hx = 'a'.repeat(64);
  const fixture = path.join(scratch, 'fixture.json');
  fs.writeFileSync(fixture, JSON.stringify({ schema: 'not-the-schema', lane: 'tabi', nonce: 'tabi-r88-selftest-0001', driverSha256: hx, fixture: { sha256: hx }, legs: [], failures: [] }));
  const ps = path.join(scratch, 'prior-set.txt');
  const priorDir = path.join(scratch, 'lane', '.ufo', 'waves', 'round-88', 'controls', 'c1', 'probes');
  fs.mkdirSync(priorDir, { recursive: true });
  const prior = path.join(priorDir, 'p.json');
  fs.writeFileSync(prior, JSON.stringify({ schema: 'tabi-chrome-cdp-showpicker-r88', lane: 'tabi', nonce: 'tabi-r88-prior-0001', driverSha256: hx, fixture: { sha256: hx }, legs: [], failures: [] }));
  fs.writeFileSync(ps, prior + '\n');
  const laneDir = path.join(scratch, 'lane');
  const r = spawnSync(process.execPath, [copy, '--lane', laneDir, '--receipt', fixture,
    '--expect-driver-sha256', hx, '--expect-nonce', 'tabi-r88-selftest-0001', '--expect-fixture-sha256', hx,
    '--prior-set', ps, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  const ids = j && j.findings ? j.findings.map((f) => f.id) : [];
  const ok = r.status === 1 && ids.includes('schema');
  const out = { schema: 'tabi-r88-counter-selftest', ok, exit: r.status, ids };
  if (selftestAsJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
  else process.stdout.write(JSON.stringify(out) + '\n');
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch {}
  process.exit(ok ? 0 : 1);
}
// Counter for scripts/chrome-cdp-showpicker-round88.mjs (tabi round 83, C1, predicate
// C1-SHOWPICKER-R84). Binds the generation-r84 frontier legs of the programmatic file-picker
// trigger `HTMLInputElement.showPicker()` under `Page.setInterceptFileChooserDialog` on
// Chromium 155/Linux `--headless=new`:
//   * the cross-origin NON-file branch: a `type=date` input inside a cross-origin iframe whose
//     own script calls showPicker() throws SecurityError "showPicker() called from cross-origin
//     iframe." and opens nothing — the error the spec and Chromium keep for non-file/color inputs;
//   * the ORDER discriminator: the same call on a DISABLED `type=date` input is InvalidStateError
//     same-origin (mutability) and SecurityError cross-origin (Chromium checks the origin first);
//   * the `webkitdirectory` ANSWER: `DOM.setFileInputFiles` naming a DIRECTORY delivers the
//     directory's files with `webkitRelativePath` set, and fires trusted input+change;
//   * the `accept`-constrained ANSWER: a `.txt` delivered to an `accept=".png"` input is ACCEPTED
//     (accept is a dialog filter, not a validator);
//   * a REAL CLICK on an input whose picker is already open opens a SECOND chooser.
//
// Usage:
//   node check-showpicker-round88.mjs --lane <ABS lane> --receipt <receipt.json>
//     --expect-driver-sha256 <hex> --expect-nonce <tabi-r88-...> --expect-fixture-sha256 <hex>
//     --prior-set <file> [--prior <receipt.json> ...] [--tree-exempt-sha256 <hex> ...] [--json]
//
// The exemption interface is CONTENT-bound: `--tree-exempt-sha256` names the exempted file by
// sha256 and the counter resolves it inside the walked trees; a path-shaped `--tree-exempt` is
// refused. A hash that matches no walked file is refused too, so an exemption can never be a
// silent no-op.
//
// LIMIT (frozen sentence, printed beside the threshold in the `limit` block): this counter reads a
// receipt. A forger who rewrites the identity fields and moves at least `absNeed(prior)` = ceil(0.5
// * the prior's own event count) page-event times escapes the replay rule; the escape minimum is
// therefore `N_p - absNeed + 1` events, printed per prior. The gap side is REPORTED, never a
// refusal (this driver's fixed waits reproduce gap durations across honest runs). A browser-assigned
// `Page.fileChooserOpened.backendNodeId` relabelled consistently inside one leg is INSIDE the limit
// by design (QUALITY 150). A receipt outside the two walked trees and outside `--prior` is outside
// the walk.
//
// Exit 0: verdict clean, every check true. 1: findings. 2: usage or unreadable input.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-chrome-cdp-showpicker-r88';
const HOST = { chromium: 'Chromium 155.0.8059.84 Arch Linux', cdpProduct: 'Chrome/155.0.8059.84', cdpProtocolVersion: '1.3', nodeMajor: 24 };
const VIEWPORT = { width: 1280, height: 900 };
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const TREES = ['.ufo/waves/round-88', 'corpus/evidence/round88'];
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const multi = (n) => argv.flatMap((a, i) => (a === '--' + n && argv[i + 1] ? [argv[i + 1]] : []));
const asJson = argv.includes('--json');
const usage = (d) => { out({ verdict: 'usage', findings: [{ id: 'usage', detail: d }] }, 2); process.exit(2); };
const fatal = (obj, code) => { out(obj, code); process.exit(code); };
function out(obj, code) {
  const payload = { schema: SCHEMA + '-counter', ...obj };
  if (asJson) process.stdout.write(JSON.stringify(payload, null, 1) + '\n');
  else process.stdout.write(JSON.stringify({ verdict: payload.verdict, checkCount: payload.checkCount, findings: payload.findings }, null, 1) + '\n');
  process.exitCode = code;
}
const lane = opt('lane');
const rp = opt('receipt');
const pin = opt('expect-driver-sha256');
const expectNonce = opt('expect-nonce');
const expectFixture = opt('expect-fixture-sha256');
const priorSet = opt('prior-set');
const extraPriors = multi('prior');
const exemptHashes = multi('tree-exempt-sha256');
if (!lane || !path.isAbsolute(lane)) usage('--lane must be an absolute path');
if (!rp) usage('--receipt is required');
if (!pin || !/^[0-9a-f]{64}$/.test(pin)) usage('--expect-driver-sha256 must be 64 hex');
if (!expectNonce) usage('--expect-nonce is required');
if (!expectFixture || !/^[0-9a-f]{64}$/.test(expectFixture)) usage('--expect-fixture-sha256 must be 64 hex');
if (!priorSet) usage('--prior-set is required');
if (argv.includes('--tree-exempt')) usage('tree-exempt-path-refused: the exemption interface is content-bound; pass --tree-exempt-sha256 <hex>');
for (const h of exemptHashes) if (!/^[0-9a-f]{64}$/.test(h)) usage('--tree-exempt-sha256 must be 64 hex: ' + h);

const abs = (p) => (path.isAbsolute(p) ? p : path.join(lane, p));
const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const onGrid = (v) => num(v) && Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4;

// ---- prior set ----
const priorPaths = [];
try {
  for (const line of fs.readFileSync(abs(priorSet), 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    priorPaths.push(path.isAbsolute(t) ? t : path.join(lane, t));
  }
} catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set ' + priorSet + ': ' + e.message }] }, 2); }
if (priorPaths.length === 0) fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: 'prior set is empty' }] }, 2);
const priors = [];
for (const p of [...priorPaths, ...extraPriors.map(abs)]) {
  let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': ' + e.message }] }, 2); }
  if (!isObj(j)) fatal({ verdict: 'unreadable', findings: [{ id: 'prior-unreadable', detail: p + ': not an object' }] }, 2);
  priors.push(j);
}

// ---- receipt ----
let r;
try { r = JSON.parse(fs.readFileSync(abs(rp), 'utf8')); } catch (e) { fatal({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: e.message }] }, 2); }
if (!isObj(r)) fatal({ verdict: 'unreadable', findings: [{ id: 'receipt-unreadable', detail: 'not an object' }] }, 2);

const checks = {};
const findings = [];
const check = (id, ok, detail) => { checks[id] = !!ok; if (!ok) findings.push({ id, detail: String(detail) }); };

// ---- frozen plan and law ----
const CROSS_ACCESS = 'JSON.stringify((function(){ var f = document.getElementById("xo"); var out = { contentDocument: f.contentDocument === null ? null : "object" }; try { var d = f.contentWindow.document; out.windowDocument = d ? "object" : null; } catch (e) { out.windowDocument = e.name; } return out; })())';
const PLAN = [
  { name: 'sp84-cross-origin-nonfile', kind: 'showpicker-cross-origin', target: 'dt', childButton: 'go3', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-nonfile-disabled', kind: 'showpicker-cross-origin', target: 'dtd', childButton: 'go4', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-color', kind: 'showpicker-cross-origin', target: 'co', childButton: 'go5', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-month', kind: 'showpicker-cross-origin', target: 'mo', childButton: 'go6', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-week', kind: 'showpicker-cross-origin', target: 'wk', childButton: 'go7', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-time', kind: 'showpicker-cross-origin', target: 'tm', childButton: 'go8', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-same-origin-nonfile-disabled', kind: 'showpicker', target: 'disd', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp84-webkitdirectory-answer', kind: 'showpicker-answer', target: 'd', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-dir'] },
  { name: 'sp84-accept-answer', kind: 'showpicker-answer', target: 'k', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp84-click-while-open', kind: 'showpicker-click-while-open', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, clickAt: [160, 670] },
  { name: 'sp84-cross-origin-number', kind: 'showpicker-cross-origin', target: 'nu', childButton: 'go9', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-range', kind: 'showpicker-cross-origin', target: 'rg', childButton: 'go10', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-tel', kind: 'showpicker-cross-origin', target: 'te', childButton: 'go12', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-search', kind: 'showpicker-cross-origin', target: 'se', childButton: 'go13', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-cross-origin-text', kind: 'showpicker-cross-origin', target: 'tx', childButton: 'go14', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp84-multiple-mode', kind: 'showpicker-answer', target: 'm', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp84-accept-mime-answer', kind: 'showpicker-answer', target: 'k', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp84-second-chooser-answer', kind: 'showpicker-second-chooser-answer', target: 's', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, clickAt: [160, 670], files: ['tabi-r88-second.txt'] },
  { name: 'sp85-same-origin-tel', kind: 'showpicker', target: 'tes', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-search', kind: 'showpicker', target: 'ses', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-text', kind: 'showpicker', target: 'txs', intercept: { enabled: true }, priorClick: null, gesture: false },
  { name: 'sp85-same-origin-tel-activated', kind: 'showpicker', target: 'tes', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp85-same-origin-search-activated', kind: 'showpicker', target: 'ses', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp85-same-origin-text-activated', kind: 'showpicker', target: 'txs', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp86-accept-wildcard-text', kind: 'showpicker-answer', target: 'aw', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp86-accept-wildcard-png', kind: 'showpicker-answer', target: 'aw', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp86-accept-mixed-text', kind: 'showpicker-answer', target: 'am', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp86-accept-mixed-png', kind: 'showpicker-answer', target: 'am', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp86-accept-pdf-token-png', kind: 'showpicker-answer', target: 'ap', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp86-same-origin-color-activated', kind: 'showpicker', target: 'cos', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false },
  { name: 'sp87-accept-audio-png', kind: 'showpicker-answer', target: 'aa', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp87-accept-video-text', kind: 'showpicker-answer', target: 'av', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp87-accept-multimime-text', kind: 'showpicker-answer', target: 'a2', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp87-accept-whitespace-png', kind: 'showpicker-answer', target: 'aws', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp88-accept-case-png', kind: 'showpicker-answer', target: 'ac', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
  { name: 'sp88-accept-audiovideo-text', kind: 'showpicker-answer', target: 'au', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-a.txt'] },
  { name: 'sp88-accept-mimeparam-png', kind: 'showpicker-answer', target: 'amc', intercept: { enabled: true }, priorClick: { at: [360, 40], wantTarget: 'pad' }, gesture: false, files: ['tabi-r88-b.png'] },
];
const LEG_ORDER = PLAN.map((p) => p.name);
const CROSS = new Set(['sp84-cross-origin-nonfile', 'sp84-cross-origin-nonfile-disabled', 'sp84-cross-origin-color', 'sp84-cross-origin-month', 'sp84-cross-origin-week', 'sp84-cross-origin-time', 'sp84-cross-origin-number', 'sp84-cross-origin-range', 'sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-origin-text']);
const ANSWER_LEGS = ['sp84-webkitdirectory-answer', 'sp84-accept-answer', 'sp84-multiple-mode', 'sp84-accept-mime-answer', 'sp84-second-chooser-answer', 'sp86-accept-wildcard-text', 'sp86-accept-wildcard-png', 'sp86-accept-mixed-text', 'sp86-accept-mixed-png', 'sp86-accept-pdf-token-png', 'sp87-accept-audio-png', 'sp87-accept-video-text', 'sp87-accept-multimime-text', 'sp87-accept-whitespace-png', 'sp88-accept-case-png', 'sp88-accept-audiovideo-text', 'sp88-accept-mimeparam-png'];
const CLICK_LEG = 'sp84-click-while-open';
// The same-origin `tel`/`search`/`text` legs (r87): with activation Chromium's showPicker()
// returns undefined and opens NO chooser (these types have no picker UI on this platform),
// so the zero-open expectation is a measured law, not a missing trigger.
const NO_PICKER = new Set(['sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated', 'sp86-same-origin-color-activated']);
const ANSWER = { name: 'tabi-r88-a.txt', size: 22, type: 'text/plain', hex: '746162692d7238332d616e737765722d616c7068610a', sha256: 'bc9965f176353d135c7f4229794068341dc8f51283baee3111500f149f2c21de' };
const PNG = { name: 'tabi-r88-b.png', size: 21, type: 'image/png', hex: '89504e470d0a1a0a746162692d7238332d706e670a', sha256: '575d88a4154ed4f5cc7e9d1f6fe9a508c31f08c934a6c99f0b8596920e947050' };
const SECOND = { name: 'tabi-r88-second.txt', size: 28, type: 'text/plain', hex: '746162692d7238332d7365636f6e642d6174747269627574696f6e0a', sha256: '6c386abf519b1814e48779ec7d338af2728726bae85fd4a5eee867011129f26b' };
const DIR = { name: 'tabi-r88-dir', files: [
  { name: 'inner-a.txt', size: 19, type: 'text/plain', rel: 'tabi-r88-dir/inner-a.txt', hex: '746162692d7238332d6469722d616c7068610a' },
  { name: 'inner-b.png', size: 18, type: 'image/png', rel: 'tabi-r88-dir/inner-b.png', hex: '746162692d7238332d6469722d626574610a' },
] };
const EMPTY_STATE = { s: [], m: [], d: [], k: [], dis: [], disd: [], aw: [], am: [], ap: [], cos: [], aa: [], av: [], a2: [], aws: [], ac: [], au: [], amc: [], sValue: '' };
const PAD_FIVE = {
  seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad'],
  trusted: [true, true, true, true, true], act: [true, true, true, true, true],
  xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0]], files: [],
};
const acceptShape = (target, f) => ({
  seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@' + target, 'change@' + target, 'read@' + target],
  trusted: [true, true, true, true, true, true, true, true],
  act: [true, true, true, true, true, false, false, null],
  xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [null, null, null], [null, null, null], [null, null, null]],
  files: [['input', target, [[f.name, f.size, f.type, '']]], ['change', target, [[f.name, f.size, f.type, '']]], ['read', target, [[f.name, f.size, f.type]]]],
  opened: ['selectSingle'],
  state: { ...EMPTY_STATE, [target]: [[f.name, f.size, f.type, '']] },
});
const DIR_FILES = DIR.files.map((f) => [f.name, f.size, f.type, f.rel]);
const LEG_SHAPE = {
  'sp84-cross-origin-nonfile': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-color': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-month': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-week': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-time': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-nonfile-disabled': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-same-origin-nonfile-disabled': { ...PAD_FIVE, opened: [], state: EMPTY_STATE },
  'sp84-webkitdirectory-answer': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@d', 'change@d', 'read@d', 'read@d'],
    trusted: [true, true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, false, false, null, null],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [null, null, null], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 'd', DIR_FILES], ['change', 'd', DIR_FILES], ['read', 'd', [[DIR.files[0].name, DIR.files[0].size, DIR.files[0].type]]], ['read', 'd', [[DIR.files[1].name, DIR.files[1].size, DIR.files[1].type]]]],
    opened: ['selectSingle'],
    state: { ...EMPTY_STATE, d: DIR_FILES },
  },
  'sp84-accept-answer': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@k', 'change@k', 'read@k'],
    trusted: [true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, false, false, null],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 'k', [[ANSWER.name, ANSWER.size, ANSWER.type, '']]], ['change', 'k', [[ANSWER.name, ANSWER.size, ANSWER.type, '']]], ['read', 'k', [[ANSWER.name, ANSWER.size, ANSWER.type]]]],
    opened: ['selectSingle'],
    state: { ...EMPTY_STATE, k: [[ANSWER.name, ANSWER.size, ANSWER.type, '']] },
  },
  'sp84-cross-origin-number': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-range': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-tel': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-search': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-cross-origin-text': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp84-multiple-mode': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@m', 'change@m', 'read@m'],
    trusted: [true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, false, false, null],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 'm', [[ANSWER.name, ANSWER.size, ANSWER.type, '']]], ['change', 'm', [[ANSWER.name, ANSWER.size, ANSWER.type, '']]], ['read', 'm', [[ANSWER.name, ANSWER.size, ANSWER.type]]]],
    opened: ['selectMultiple'],
    state: { ...EMPTY_STATE, m: [[ANSWER.name, ANSWER.size, ANSWER.type, '']] },
  },
  'sp84-accept-mime-answer': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'input@k', 'change@k', 'read@k'],
    trusted: [true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, false, false, null],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 'k', [[PNG.name, PNG.size, PNG.type, '']]], ['change', 'k', [[PNG.name, PNG.size, PNG.type, '']]], ['read', 'k', [[PNG.name, PNG.size, PNG.type]]]],
    opened: ['selectSingle'],
    state: { ...EMPTY_STATE, k: [[PNG.name, PNG.size, PNG.type, '']] },
  },
  'sp85-same-origin-tel': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp85-same-origin-search': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp85-same-origin-text': { seq: [], trusted: [], act: [], xy: [], files: [], opened: [], state: EMPTY_STATE },
  'sp85-same-origin-tel-activated': { ...PAD_FIVE, opened: [], state: EMPTY_STATE },
  'sp85-same-origin-search-activated': { ...PAD_FIVE, opened: [], state: EMPTY_STATE },
  'sp85-same-origin-text-activated': { ...PAD_FIVE, opened: [], state: EMPTY_STATE },
  'sp84-click-while-open': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'pointerdown@s', 'mousedown@s', 'pointerup@s', 'mouseup@s', 'click@s'],
    trusted: [true, true, true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, true, true, true, true, true],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [160, 670, 1], [160, 670, 1], [160, 670, 0], [160, 670, 0], [160, 670, 0]],
    files: [], opened: ['selectSingle', 'selectSingle'], state: EMPTY_STATE,
  },
  'sp84-second-chooser-answer': {
    seq: ['pointerdown@pad', 'mousedown@pad', 'pointerup@pad', 'mouseup@pad', 'click@pad', 'pointerdown@s', 'mousedown@s', 'pointerup@s', 'mouseup@s', 'click@s', 'input@s', 'change@s', 'read@s'],
    trusted: [true, true, true, true, true, true, true, true, true, true, true, true, true],
    act: [true, true, true, true, true, true, true, true, true, true, false, false, null],
    xy: [[360, 40, 1], [360, 40, 1], [360, 40, 0], [360, 40, 0], [360, 40, 0], [160, 670, 1], [160, 670, 1], [160, 670, 0], [160, 670, 0], [160, 670, 0], [null, null, null], [null, null, null], [null, null, null]],
    files: [['input', 's', [[SECOND.name, SECOND.size, SECOND.type, '']]], ['change', 's', [[SECOND.name, SECOND.size, SECOND.type, '']]], ['read', 's', [[SECOND.name, SECOND.size, SECOND.type]]]],
    opened: ['selectSingle', 'selectSingle'],
    state: { ...EMPTY_STATE, s: [[SECOND.name, SECOND.size, SECOND.type, '']], sValue: 'C:\\fakepath\\' + SECOND.name },
  },
  'sp86-accept-wildcard-text': acceptShape('aw', ANSWER),
  'sp86-accept-wildcard-png': acceptShape('aw', PNG),
  'sp86-accept-mixed-text': acceptShape('am', ANSWER),
  'sp86-accept-mixed-png': acceptShape('am', PNG),
  'sp86-accept-pdf-token-png': acceptShape('ap', PNG),
  'sp86-same-origin-color-activated': { ...PAD_FIVE, opened: [], state: EMPTY_STATE },
  'sp87-accept-audio-png': acceptShape('aa', PNG),
  'sp87-accept-video-text': acceptShape('av', ANSWER),
  'sp87-accept-multimime-text': acceptShape('a2', ANSWER),
  'sp87-accept-whitespace-png': acceptShape('aws', PNG),
  'sp88-accept-case-png': acceptShape('ac', PNG),
  'sp88-accept-audiovideo-text': acceptShape('au', ANSWER),
  'sp88-accept-mimeparam-png': acceptShape('amc', PNG),
};
const GESTURE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() requires a user gesture.";
const IMMUTABLE_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': HTMLInputElement::showPicker() cannot be used on immutable controls.";
const SECURITY_ERR = "Failed to execute 'showPicker' on 'HTMLInputElement': showPicker() called from cross-origin iframe.";
// leg -> expected parent showPicker outcome: {ok, name, message} (null = no parent showPicker call)
const SP_LAW = {
  'sp84-cross-origin-nonfile': null,
  'sp84-cross-origin-nonfile-disabled': null,
  'sp84-same-origin-nonfile-disabled': { ok: false, name: 'InvalidStateError', message: IMMUTABLE_ERR },
  'sp84-cross-origin-color': null,
  'sp84-cross-origin-month': null,
  'sp84-cross-origin-week': null,
  'sp84-cross-origin-time': null,
  'sp84-cross-origin-number': null,
  'sp84-cross-origin-range': null,
  'sp84-cross-origin-tel': null,
  'sp84-cross-origin-search': null,
  'sp84-cross-origin-text': null,
  'sp84-multiple-mode': { ok: true, ret: 'undefined' },
  'sp84-accept-mime-answer': { ok: true, ret: 'undefined' },
  'sp84-second-chooser-answer': { ok: true, ret: 'undefined' },
  'sp84-webkitdirectory-answer': { ok: true, ret: 'undefined' },
  'sp84-accept-answer': { ok: true, ret: 'undefined' },
  'sp84-click-while-open': { ok: true, ret: 'undefined' },
  'sp85-same-origin-tel': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR },
  'sp85-same-origin-search': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR },
  'sp85-same-origin-text': { ok: false, name: 'NotAllowedError', message: GESTURE_ERR },
  'sp85-same-origin-tel-activated': { ok: true, ret: 'undefined' },
  'sp85-same-origin-search-activated': { ok: true, ret: 'undefined' },
  'sp85-same-origin-text-activated': { ok: true, ret: 'undefined' },
  'sp86-accept-wildcard-text': { ok: true, ret: 'undefined' },
  'sp86-accept-wildcard-png': { ok: true, ret: 'undefined' },
  'sp86-accept-mixed-text': { ok: true, ret: 'undefined' },
  'sp86-accept-mixed-png': { ok: true, ret: 'undefined' },
  'sp86-accept-pdf-token-png': { ok: true, ret: 'undefined' },
  'sp86-same-origin-color-activated': { ok: true, ret: 'undefined' },
  'sp87-accept-audio-png': { ok: true, ret: 'undefined' },
  'sp87-accept-video-text': { ok: true, ret: 'undefined' },
  'sp87-accept-multimime-text': { ok: true, ret: 'undefined' },
  'sp87-accept-whitespace-png': { ok: true, ret: 'undefined' },
  'sp88-accept-case-png': { ok: true, ret: 'undefined' },
  'sp88-accept-audiovideo-text': { ok: true, ret: 'undefined' },
  'sp88-accept-mimeparam-png': { ok: true, ret: 'undefined' },
};
const ACT_LAW = {
  'sp84-cross-origin-nonfile': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-nonfile-disabled': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-color': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp84-cross-origin-month': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-week': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-time': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-number': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-range': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-tel': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-search': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-text': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-multiple-mode': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp84-accept-mime-answer': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp84-second-chooser-answer': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp84-same-origin-nonfile-disabled': [{ isActive: true, hasBeenActive: true }, { isActive: true, hasBeenActive: true }],
  'sp84-webkitdirectory-answer': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp84-accept-answer': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp84-click-while-open': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp85-same-origin-tel': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: false }],
  'sp85-same-origin-search': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: false }],
  'sp85-same-origin-text': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: false }],
  'sp85-same-origin-tel-activated': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp85-same-origin-search-activated': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp85-same-origin-text-activated': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-accept-wildcard-text': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-accept-wildcard-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-accept-mixed-text': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-accept-mixed-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-accept-pdf-token-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp86-same-origin-color-activated': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp87-accept-audio-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp87-accept-video-text': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp87-accept-multimime-text': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp87-accept-whitespace-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp88-accept-case-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp88-accept-audiovideo-text': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
  'sp88-accept-mimeparam-png': [{ isActive: true, hasBeenActive: true }, { isActive: false, hasBeenActive: true }],
};
const CHILD_ACT_LAW = {
  'sp84-cross-origin-nonfile': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-nonfile-disabled': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-color': [{ isActive: false, hasBeenActive: false }, { isActive: false, hasBeenActive: true }],
  'sp84-cross-origin-month': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-week': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-time': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-number': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-range': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-tel': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-search': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
  'sp84-cross-origin-text': [{ isActive: false, hasBeenActive: false }, { isActive: true, hasBeenActive: true }],
};
const CHILD_RESULT_LAW = {
  'sp84-cross-origin-nonfile': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-nonfile-disabled': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-color': { ok: true, ret: 'undefined' },
  'sp84-cross-origin-month': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-week': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-time': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-number': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-range': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-tel': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-search': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
  'sp84-cross-origin-text': { ok: false, name: 'SecurityError', message: SECURITY_ERR },
};
const CHILD_EVENT_SHAPE = {
  'sp84-cross-origin-nonfile': { seq: ['pointerdown@go3', 'mousedown@go3', 'pointerup@go3', 'mouseup@go3', 'click@go3'] },
  'sp84-cross-origin-nonfile-disabled': { seq: ['pointerdown@go4', 'mousedown@go4', 'pointerup@go4', 'mouseup@go4', 'click@go4'] },
  'sp84-cross-origin-color': { seq: ['pointerdown@go5', 'mousedown@go5', 'pointerup@go5', 'mouseup@go5', 'click@go5'] },
  'sp84-cross-origin-month': { seq: ['pointerdown@go6', 'mousedown@go6', 'pointerup@go6', 'mouseup@go6', 'click@go6'] },
  'sp84-cross-origin-week': { seq: ['pointerdown@go7', 'mousedown@go7', 'pointerup@go7', 'mouseup@go7', 'click@go7'] },
  'sp84-cross-origin-time': { seq: ['pointerdown@go8', 'mousedown@go8', 'pointerup@go8', 'mouseup@go8', 'click@go8'] },
  'sp84-cross-origin-number': { seq: ['pointerdown@go9', 'mousedown@go9', 'pointerup@go9', 'mouseup@go9', 'click@go9'] },
  'sp84-cross-origin-range': { seq: ['pointerdown@go10', 'mousedown@go10', 'pointerup@go10', 'mouseup@go10', 'click@go10'] },
  'sp84-cross-origin-tel': { seq: ['pointerdown@go12', 'mousedown@go12', 'pointerup@go12', 'mouseup@go12', 'click@go12'] },
  'sp84-cross-origin-search': { seq: ['pointerdown@go13', 'mousedown@go13', 'pointerup@go13', 'mouseup@go13', 'click@go13'] },
  'sp84-cross-origin-text': { seq: ['pointerdown@go14', 'mousedown@go14', 'pointerup@go14', 'mouseup@go14', 'click@go14'] },
};
const FIXTURE_INPUTS = [
  { id: 's', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 650, width: 120, height: 40 } },
  { id: 'm', tag: 'input', type: 'file', multiple: true, webkitdirectory: false, accept: null, rect: { left: 300, top: 650, width: 120, height: 40 } },
  { id: 'd', tag: 'input', type: 'file', multiple: false, webkitdirectory: true, accept: null, rect: { left: 500, top: 650, width: 120, height: 40 } },
  { id: 'k', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: '.png', rect: { left: 700, top: 650, width: 120, height: 40 } },
  { id: 'f', tag: 'button', type: 'submit', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 300, width: 120, height: 40 } },
  { id: 'dis', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 500, width: 120, height: 40 } },
  { id: 'disd', tag: 'input', type: 'date', multiple: false, webkitdirectory: false, accept: null, rect: { left: 300, top: 500, width: 120, height: 40 } },
  { id: 'tes', tag: 'input', type: 'tel', multiple: false, webkitdirectory: false, accept: null, rect: { left: 100, top: 750, width: 120, height: 40 } },
  { id: 'ses', tag: 'input', type: 'search', multiple: false, webkitdirectory: false, accept: null, rect: { left: 300, top: 750, width: 120, height: 40 } },
  { id: 'txs', tag: 'input', type: 'text', multiple: false, webkitdirectory: false, accept: null, rect: { left: 500, top: 750, width: 120, height: 40 } },
  { id: 'aw', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'image/*', rect: { left: 100, top: 800, width: 120, height: 40 } },
  { id: 'am', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'image/png, .txt', rect: { left: 300, top: 800, width: 120, height: 40 } },
  { id: 'ap', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'application/pdf', rect: { left: 500, top: 800, width: 120, height: 40 } },
  { id: 'cos', tag: 'input', type: 'color', multiple: false, webkitdirectory: false, accept: null, rect: { left: 700, top: 800, width: 120, height: 40 } },
  { id: 'aa', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'audio/*', rect: { left: 100, top: 880, width: 120, height: 40 } },
  { id: 'av', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'video/*', rect: { left: 300, top: 880, width: 120, height: 40 } },
  { id: 'a2', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'image/png,application/pdf', rect: { left: 500, top: 880, width: 120, height: 40 } },
  { id: 'aws', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: '  image/png ,  .txt  ', rect: { left: 700, top: 880, width: 120, height: 40 } },
  { id: 'ac', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'IMAGE/PNG', rect: { left: 100, top: 960, width: 120, height: 40 } },
  { id: 'au', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'audio/*,video/*', rect: { left: 300, top: 960, width: 120, height: 40 } },
  { id: 'amc', tag: 'input', type: 'file', multiple: false, webkitdirectory: false, accept: 'image/png;q=0.9', rect: { left: 500, top: 960, width: 120, height: 40 } },
];
const wrapperFor = (target) => '(function(){ try { var r = document.getElementById(' + JSON.stringify(target) + ').showPicker(); return {ok: true, ret: String(r)}; } catch (e) { return {ok: false, name: e.name, message: e.message}; } })()';
const ACT_EXPR = 'JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})';
const READY_EXPR = (n) => 'document.readyState === "complete" && location.pathname === "/" && Array.isArray(window.__events) && document.getElementById("nonce").textContent === ' + JSON.stringify(n);
const CHILD_READY_EXPR = 'document.readyState === "complete" && !!document.getElementById("go")';

const RECEIPT_KEYS = ['schema', 'lane', 'nonce', 'driverSha256', 'startedAt', 'finishedAt', 'host', 'fixture', 'ports', 'frameTree', 'fixtureInputs', 'legs', 'failures'].sort();
const LEG_KEYS = ['activationAfter', 'activationBefore', 'answer', 'argv', 'armError', 'armResult', 'armSendId', 'cdpEventLog', 'cdpProduct', 'cdpProtocolVersion', 'cdpSendLog', 'childActivationAfter', 'childActivationBefore', 'childClosedAt', 'childContextId', 'childEvents', 'childLate', 'childResult', 'childResult2', 'childServerLog', 'childState', 'chooserWaitMs', 'clickError', 'clickPressId', 'clickReleaseId', 'clickWhileOpenChoosersAfter', 'clickWhileOpenChoosersBefore', 'clickWhileOpenElement', 'firstChooserBackendNodeId', 'secondChooserBackendNodeId', 'uploadPng', 'uploadSecond', 'closedAt', 'contexts', 'deferredResult', 'devtoolsListening', 'dismissError', 'dismissResult', 'dismissSendId', 'errors', 'fixtureInputs', 'frameTree', 'gesture', 'intercept', 'interceptError', 'interceptResult', 'interceptSendId', 'kind', 'lateAfterClose', 'launchToken', 'marks', 'name', 'pageEvents', 'parentCrossAccess', 'priorClick', 'priorClickElement', 'priorClickError', 'priorPressId', 'priorReleaseId', 'serverLog', 'showPicker', 'showPicker2', 'stateAfter', 'stateAfterDismiss', 'stderrHead', 'target', 'teardown', 'trigger2Error', 'trigger2Result', 'trigger2SendId', 'triggerError', 'triggerResult', 'triggerSendId', 'upload', 'uploadDir'].sort();
const EVENT_KEYS = ['type', 'ts', 'isTrusted', 'act', 'target', 'x', 'y', 'buttons', 'files', 'ret', 'seq', 'leg', 'at'].sort();
const ALLOWED_METHODS = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate', 'Page.setInterceptFileChooserDialog', 'Input.dispatchMouseEvent', 'Runtime.evaluate', 'DOM.setFileInputFiles']);
const errOk = (e) => e === null || (isObj(e) && same(Object.keys(e).sort(), ['code', 'message']) && (e.code === null || Number.isInteger(e.code)) && typeof e.message === 'string');

// ---- identity and run binding ----
check('schema', r.schema === SCHEMA, 'schema ' + r.schema);
check('lane', r.lane === path.basename(lane), 'lane ' + r.lane + ' expected ' + path.basename(lane));
check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r88-[a-z0-9-]{4,48}$/.test(r.nonce), 'nonce ' + r.nonce);
check('nonce-expected', r.nonce === expectNonce, 'nonce ' + r.nonce + ' expected ' + expectNonce);
check('receipt-fields', same(Object.keys(r).sort(), RECEIPT_KEYS), 'top-level receipt fields ' + JSON.stringify(Object.keys(r).sort()) + ' (want exactly ' + JSON.stringify(RECEIPT_KEYS) + ')');
check('driver-pin', r.driverSha256 === pin, 'driverSha256 ' + r.driverSha256 + ' expected ' + pin);
check('fixture-hash', isObj(r.fixture) && r.fixture.sha256 === expectFixture && same(r.fixture.viewport, VIEWPORT) && same(Object.keys(r.fixture).sort(), ['child', 'origin', 'patch', 'sha256', 'viewport']) && isObj(r.fixture.child) && same(Object.keys(r.fixture.child).sort(), ['origin', 'sha256']) && /^[0-9a-f]{64}$/.test(r.fixture.child.sha256),
  'fixture ' + JSON.stringify(isObj(r.fixture) ? { sha256: r.fixture.sha256, viewport: r.fixture.viewport } : r.fixture) + ' expected ' + expectFixture);
const host = isObj(r.host) ? r.host : {};
check('host-chromium', host.chromium === HOST.chromium && host.cdpProduct === HOST.cdpProduct && host.cdpProtocolVersion === HOST.cdpProtocolVersion,
  'host ' + JSON.stringify({ chromium: host.chromium, cdpProduct: host.cdpProduct, cdpProtocolVersion: host.cdpProtocolVersion }));
check('host-node', typeof host.node === 'string' && Number(host.node.replace(/^v/, '').split('.')[0]) === HOST.nodeMajor, 'node ' + host.node);
const ports = isObj(r.ports) ? r.ports : {};
check('ports-declared', Number.isInteger(ports.http) && Number.isInteger(ports.cdp) && Number.isInteger(ports.child) && [ports.http, ports.cdp, ports.child].every((p) => p >= 1024) && new Set([ports.http, ports.cdp, ports.child]).size === 3 && isObj(r.fixture) && r.fixture.origin === 'http://127.0.0.1:' + ports.http && isObj(r.fixture.child) && r.fixture.child.origin === 'http://127.0.0.1:' + ports.child,
  'ports ' + JSON.stringify(ports) + ' fixture origins ' + JSON.stringify(isObj(r.fixture) ? [r.fixture.origin, isObj(r.fixture.child) ? r.fixture.child.origin : null] : null));
const ftree = isObj(r.frameTree) ? r.frameTree : {};
check('frame-tree', same(Object.keys(ftree).sort(), ['mainFrameId', 'mainFrameParentId', 'mainFrameUrl']) && typeof ftree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(ftree.mainFrameId) && ftree.mainFrameParentId === null && ftree.mainFrameUrl === 'about:blank',
  'frameTree ' + JSON.stringify(ftree));

// ---- legs ----
const legs = arr(r.legs);
check('plan-frozen', same(legs.map((l) => (isObj(l) ? { name: l.name, kind: l.kind, target: l.target, intercept: l.intercept, priorClick: l.priorClick, gesture: l.gesture } : null)), PLAN.map((p) => ({ name: p.name, kind: p.kind, target: p.target, intercept: p.intercept, priorClick: p.priorClick ?? null, gesture: p.gesture ?? null }))),
  'leg plan differs from the frozen plan');
check('leg-order', same(legs.map((l) => (isObj(l) ? l.name : null)), LEG_ORDER), 'legs ' + legs.map((l) => (isObj(l) ? l.name : null)).join(','));
check('leg-records', legs.length === PLAN.length && legs.every((l, i) => isObj(l) && same(Object.keys(l).sort(), LEG_KEYS) && l.name === PLAN[i].name && l.kind === PLAN[i].kind && num(l.chooserWaitMs) && l.chooserWaitMs >= 0 && l.chooserWaitMs <= 3000 && errOk(l.interceptError) && errOk(l.priorClickError) && errOk(l.triggerError) && errOk(l.trigger2Error) && errOk(l.dismissError) && errOk(l.armError) && errOk(l.clickError) && arr(l.errors).length === 0),
  'leg records: ' + legs.map((l) => (isObj(l) ? (same(Object.keys(l).sort(), LEG_KEYS) ? '' : l.name + ':keys ') + (arr(l.errors).length ? l.name + ':errors ' : '') : 'not-an-object')).filter(Boolean).join(','));
check('leg-marks', legs.every((l) => isObj(l) && arr(l.marks).length >= 3 && arr(l.marks)[0].name === 'start' && arr(l.marks)[1].name === 'pre' && arr(l.marks).slice(-1)[0].name === 'settle' && num(l.closedAt) && l.lateAfterClose === 0 && arr(l.marks).every((m, i, a) => isObj(m) && typeof m.name === 'string' && num(m.at) && onGrid(m.at) && (i === 0 || m.at >= a[i - 1].at))),
  'leg marks / closedAt / lateAfterClose: ' + JSON.stringify(legs.map((l) => isObj(l) ? [l.name, arr(l.marks).map((m) => m && m.name), l.lateAfterClose] : null)));

// ---- contexts (the cross-origin iframe's own execution context) ----
const ctxBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { ctxBad.push('not-an-object'); continue; }
  const cs = arr(leg.contexts);
  const child = cs.filter((c) => isObj(c) && c.origin === 'http://127.0.0.1:' + ports.child && c.isDefault === true && typeof c.frameId === 'string' && c.frameId !== leg.frameTree.mainFrameId);
  if (child.length !== 1) { ctxBad.push(leg.name + ':child-contexts ' + child.length); continue; }
  if (CROSS.has(leg.name) && leg.childContextId !== child[0].id) ctxBad.push(leg.name + ':childContextId ' + leg.childContextId + ' != ' + child[0].id);
  if (!CROSS.has(leg.name) && leg.childContextId !== null) ctxBad.push(leg.name + ':childContextId-unexpected');
}
check('context-binding', ctxBad.length === 0, 'cross-origin execution contexts: ' + ctxBad.join(','));

// ---- send log: allowlist, plan calls, ordering ----
const childExprs = new Set([CHILD_READY_EXPR, 'window.__act()', 'window.__setLeg("child-click")', 'window.__r3', 'window.__r4', 'window.__r5', 'window.__r6', 'window.__r7', 'window.__r8', 'window.__r9', 'window.__r10', 'window.__r11', 'window.__r12', 'window.__r13', 'window.__r14', 'window.__state()', 'window.__closeRecord()', 'window.__late']);
const evalAllowed = (leg, params) => {
  const p = PLAN.find((x) => x.name === leg.name) || {};
  const parent = [READY_EXPR(r.nonce), ACT_EXPR, 'window.__inputs()', 'window.__state()', 'window.__closeRecord()', 'window.__late',
    'window.__setLeg("pre")', 'window.__setLeg("prior-click")', 'window.__setLeg("show-picker")', 'window.__setLeg("click-while-open")', 'window.__setLeg("settle")',
    'document.elementFromPoint(' + (p.priorClick ? p.priorClick.at[0] : 0) + ',' + (p.priorClick ? p.priorClick.at[1] : 0) + ').id'];
  if (!CROSS.has(p.name)) parent.push(wrapperFor(p.target));
  if (p.kind === 'showpicker-click-while-open' || p.kind === 'showpicker-second-chooser-answer') {
    parent.push('JSON.stringify(document.getElementById(' + JSON.stringify(p.target) + ').getBoundingClientRect())');
    parent.push('document.elementFromPoint(' + (p.clickAt ? p.clickAt[0] + ',' + p.clickAt[1] : '160,670') + ').id');
  }
  if (CROSS.has(p.name)) parent.push(CROSS_ACCESS, 'JSON.stringify(document.getElementById("xo").getBoundingClientRect())');
  if (params.contextId !== undefined) return CROSS.has(leg.name) && params.contextId === leg.childContextId && childExprs.has(params.expression);
  return parent.includes(params.expression);
};
const sendBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { sendBad.push('not-an-object'); continue; }
  const log = arr(leg.cdpSendLog);
  if (log.length < 10 || !log.every((c, i) => isObj(c) && c.id === i + 1 && ALLOWED_METHODS.has(c.method) && isObj(c.params))) sendBad.push(leg.name + ':shape');
  else if (!log.every((c) => c.method !== 'Runtime.evaluate' || evalAllowed(leg, c.params))) sendBad.push(leg.name + ':expression');
  else if (!same(log.slice(0, 6).map((c) => c.method), ['Browser.getVersion', 'Page.enable', 'Runtime.enable', 'Page.getFrameTree', 'Emulation.setDeviceMetricsOverride', 'Page.navigate'])) sendBad.push(leg.name + ':prologue');
  else if (log.filter((c) => c.method === 'Page.navigate').length !== 1 || log.filter((c) => c.method === 'Page.getFrameTree').length !== 1 || log.filter((c) => c.method === 'Browser.getVersion').length !== 1) sendBad.push(leg.name + ':once');
  else if (!same(log.find((c) => c.method === 'Page.navigate').params, { url: 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce) })) sendBad.push(leg.name + ':navigate');
}
check('send-log-allowlist', legs.length > 0 && sendBad.length === 0, 'send logs outside the allowlist: ' + sendBad.join(','));

const planBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { planBad.push('not-an-object'); continue; }
  const p = PLAN.find((x) => x.name === leg.name);
  if (!p) { planBad.push('unknown-leg'); continue; }
  const log = arr(leg.cdpSendLog);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  const want = [];
  if (p.intercept) want.push({ method: 'Page.setInterceptFileChooserDialog', params: p.intercept });
  const clickAt = p.priorClick ? p.priorClick.at : (CROSS.has(p.name) ? { go3: [400, 160], go4: [400, 220], go5: [260, 280], go6: [260, 340], go7: [260, 400], go8: [260, 460], go9: [260, 520], go10: [260, 580], go12: [400, 340], go13: [400, 400], go14: [400, 460] }[p.childButton] : null);
  if (clickAt) {
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 1, clickCount: 1 } });
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: clickAt[0], y: clickAt[1], button: 'left', buttons: 0, clickCount: 1 } });
  }
  if (!CROSS.has(p.name)) {
    const tp = { expression: wrapperFor(p.target), returnByValue: true };
    if (p.gesture) tp.userGesture = true;
    want.push({ method: 'Runtime.evaluate', params: tp });
  }
  if (p.kind === 'showpicker-click-while-open' || p.kind === 'showpicker-second-chooser-answer') {
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mousePressed', x: p.clickAt[0], y: p.clickAt[1], button: 'left', buttons: 1, clickCount: 1 } });
    want.push({ method: 'Input.dispatchMouseEvent', params: { type: 'mouseReleased', x: p.clickAt[0], y: p.clickAt[1], button: 'left', buttons: 0, clickCount: 1 } });
  }
  if ((p.kind === 'showpicker-answer' && opens.length === 1) || (p.kind === 'showpicker-second-chooser-answer' && opens.length >= 1)) {
    want.push({ method: 'DOM.setFileInputFiles', params: { files: arr(leg.answer && leg.answer.setParams && leg.answer.setParams.files), backendNodeId: opens[opens.length - 1].params.backendNodeId } });
  }
  if (p.intercept && opens.length > 0) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });
  const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || (c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target)));
  if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(leg.name + ':sequence ' + JSON.stringify(got.map((c) => c.method)) + ' want ' + JSON.stringify(want.map((c) => c.method)));
  // send-id coherence
  if (p.intercept && leg.interceptSendId !== log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id) planBad.push(leg.name + ':intercept-id');
  if (p.priorClick || CROSS.has(p.name)) { if (leg.priorPressId === null || leg.priorReleaseId === null || leg.priorReleaseId <= leg.priorPressId) planBad.push(leg.name + ':prior-ids'); }
  else if (leg.priorPressId !== null || leg.priorReleaseId !== null) planBad.push(leg.name + ':prior-ids-without-click');
  if (!CROSS.has(p.name)) {
    const trig = log.find((c) => c.method === 'Runtime.evaluate' && c.params.expression === wrapperFor(p.target));
    if (!trig || leg.triggerSendId !== trig.id) planBad.push(leg.name + ':trigger-id');
    if (leg.trigger2SendId !== null) planBad.push(leg.name + ':trigger2-unexpected');
  } else if (leg.triggerSendId !== null || leg.trigger2SendId !== null) planBad.push(leg.name + ':parent-trigger-unexpected');
  if (p.kind === 'showpicker-click-while-open' || p.kind === 'showpicker-second-chooser-answer') {
    const clicks = log.filter((c) => c.method === 'Input.dispatchMouseEvent');
    if (clicks.length !== 4 || leg.clickPressId !== clicks[2].id || leg.clickReleaseId !== clicks[3].id || leg.clickReleaseId <= leg.clickPressId) planBad.push(leg.name + ':click-ids');
  } else if (leg.clickPressId !== null || leg.clickReleaseId !== null) planBad.push(leg.name + ':click-unexpected');
  const dis = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog')[1];
  if (dis) { if (leg.dismissSendId !== dis.id) planBad.push(leg.name + ':dismiss-id'); }
  else if (leg.dismissSendId !== null) planBad.push(leg.name + ':dismiss-unexpected');
  if ((p.kind === 'showpicker-answer' && opens.length === 1) || (p.kind === 'showpicker-second-chooser-answer' && opens.length >= 1)) {
    const set = log.find((c) => c.method === 'DOM.setFileInputFiles');
    if (!set || !isObj(leg.answer) || leg.answer.setSendId !== set.id) planBad.push(leg.name + ':answer-id');
    const wantBase = p.files[0];
    if (!set || path.basename(set.params.files[0]) !== wantBase || set.params.files.length !== 1) planBad.push(leg.name + ':answer-files');
  }
}
check('plan-calls', planBad.length === 0, 'plan calls differ from the frozen plan: ' + planBad.join(','));

// ---- CDP event log ----
const evBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { evBad.push('not-an-object'); continue; }
  const el = arr(leg.cdpEventLog);
  const nav = el.filter((e) => e.method === 'Page.frameNavigated');
  if (nav.length !== 1 || el.some((e) => !['Page.fileChooserOpened', 'Page.frameNavigated'].includes(e.method)) || !el.every((e) => isObj(e) && isObj(e.params) && Number.isInteger(e.afterSendId))) evBad.push(leg.name + ':shape');
  const lft = isObj(leg.frameTree) ? leg.frameTree : {};
  if (nav.length === 1 && !(nav[0].params.frameId === lft.mainFrameId && nav[0].params.url === 'http://127.0.0.1:' + ports.http + '/?run=' + encodeURIComponent(r.nonce))) evBad.push(leg.name + ':nav');
  const opens = el.filter((e) => e.method === 'Page.fileChooserOpened');
  if (opens.length > 2) evBad.push(leg.name + ':multi-open');
  for (const o of opens) {
    if (!same(Object.keys(o.params).sort(), ['backendNodeId', 'frameId', 'mode']) || !['selectSingle', 'selectMultiple'].includes(o.params.mode) || !Number.isInteger(o.params.backendNodeId) || o.params.backendNodeId <= 0) evBad.push(leg.name + ':open-shape');
    const wantFrame = CROSS.has(leg.name) ? arr(leg.contexts).find((c) => isObj(c) && c.origin === 'http://127.0.0.1:' + ports.child && c.isDefault === true) : { frameId: lft.mainFrameId };
    if (!wantFrame || o.params.frameId !== wantFrame.frameId) evBad.push(leg.name + ':open-frame');
    if (CROSS.has(leg.name)) {
      if (!(Number.isInteger(leg.priorReleaseId) && o.afterSendId >= leg.priorReleaseId && o.afterSendId <= leg.priorReleaseId + 3)) evBad.push(leg.name + ':open-binding');
    } else if (leg.name === CLICK_LEG || leg.name === 'sp84-second-chooser-answer') {
      const i = opens.indexOf(o);
      const bound = i === 0 ? o.afterSendId === leg.triggerSendId : (Number.isInteger(leg.clickReleaseId) && o.afterSendId >= leg.clickReleaseId && o.afterSendId <= leg.clickReleaseId + 3);
      if (!bound) evBad.push(leg.name + ':open-binding');
    } else if (leg.triggerSendId === null || o.afterSendId !== leg.triggerSendId) evBad.push(leg.name + ':open-binding');
  }
}
check('cdp-event-log-closed', legs.length > 0 && evBad.length === 0, 'CDP event logs: ' + evBad.join(','));
check('frame-binding', legs.every((l) => isObj(l) && isObj(l.frameTree) && typeof l.frameTree.mainFrameId === 'string' && /^[0-9A-F]{32}$/.test(l.frameTree.mainFrameId) && l.frameTree.mainFrameParentId === null && l.frameTree.mainFrameUrl === 'about:blank'),
  'legs without a fresh-browser main frame tree');

// ---- page events ----
const events = legs.flatMap((l) => (isObj(l) ? arr(l.pageEvents) : []));
const typed = (e) => isObj(e) && same(Object.keys(e).sort(), EVENT_KEYS) && typeof e.type === 'string' && num(e.ts) && typeof e.isTrusted === 'boolean' && (e.act === null || typeof e.act === 'boolean') && (e.target === null || typeof e.target === 'string') && (e.x === null || num(e.x)) && (e.y === null || num(e.y)) && (e.buttons === null || num(e.buttons)) && (e.files === null || Array.isArray(e.files)) && (e.ret === null || typeof e.ret === 'string') && Number.isInteger(e.seq) && typeof e.leg === 'string' && num(e.at);
check('event-types', events.length > 0 && events.every(typed), 'page events with a non-strict field set: ' + events.filter((e) => !typed(e)).length);
check('event-time-quantum', events.length > 0 && events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at)), 'page event times off the 0.1 ms grid: ' + events.filter((e) => !isObj(e) || !onGrid(e.ts) || !onGrid(e.at)).length);
check('event-leg-window', legs.every((l) => {
  if (!isObj(l)) return false;
  const marks = arr(l.marks);
  const at = (n) => { const m = marks.find((x) => x.name === n); return m ? m.at : null; };
  const pre = at('pre'), settle = at('settle');
  return arr(l.pageEvents).every((e, i, a) => isObj(e) && e.leg !== 'start' && num(e.at) && e.at >= (pre ?? 0) && e.at <= (settle ?? l.closedAt) && (i === 0 || (num(a[i - 1].at) && e.at >= a[i - 1].at)));
}), 'page events outside their leg window or out of order');
const seqs = legs.map((l) => (isObj(l) ? arr(l.pageEvents).map((e) => e.seq) : []));
check('seq-monotonic', seqs.every((s) => s.every((v, i) => v === i + 1)), 'page event seq is not 1..N per leg');

// ---- per-leg frozen shape ----
const legSummary = (leg) => {
  const evs = arr(leg.pageEvents);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  return {
    seq: evs.map((e) => e.type + '@' + e.target),
    trusted: evs.map((e) => e.isTrusted),
    act: evs.map((e) => e.act),
    xy: evs.map((e) => [e.x, e.y, e.buttons]),
    files: evs.filter((e) => e.files !== null).map((e) => [e.type, e.target, e.files]),
    opened: opens.map((e) => e.params.mode),
    state: leg.stateAfter,
  };
};
const nodeReport = {};
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = LEG_SHAPE[leg.name];
  if (!want) { check('leg-' + leg.name, false, 'unknown leg'); continue; }
  const got = legSummary(leg);
  const bad = [];
  for (const k of ['seq', 'trusted', 'act', 'xy', 'files', 'opened', 'state']) if (!same(got[k], want[k])) bad.push(k + ' ' + JSON.stringify(got[k]));
  check('leg-' + leg.name, bad.length === 0, leg.name + ': ' + bad.join('; '));
  nodeReport[leg.name] = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').map((e) => e.params.backendNodeId);
}

// ---- the law checks ----
const legOf = (n) => legs.find((l) => isObj(l) && l.name === n) || {};
const spBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = SP_LAW[leg.name];
  const got = leg.showPicker;
  if (want === undefined) { spBad.push(leg.name + ':unknown-leg'); continue; }
  if (want === null) { if (got !== null) spBad.push(leg.name + ':unexpected'); continue; }
  if (!isObj(got) || got.ok !== want.ok || (want.ok ? got.ret !== want.ret : (got.name !== want.name || got.message !== want.message))) spBad.push(leg.name + ': ' + JSON.stringify(got));
}
check('gesture-law', spBad.length === 0, 'parent showPicker outcomes not the frozen law: ' + spBad.join(','));
const actBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const want = ACT_LAW[leg.name];
  if (!want) { actBad.push(leg.name + ':no-law'); continue; }
  if (!same(leg.activationBefore, want[0]) || !same(leg.activationAfter, want[1])) actBad.push(leg.name + ': ' + JSON.stringify([leg.activationBefore, leg.activationAfter]));
}
check('activation-law', actBad.length === 0, 'legs whose parent transient-activation transition is not the frozen one: ' + actBad.join(','));
const modeBad = [];
for (const leg of legs) {
  if (!isObj(leg) || CROSS.has(leg.name)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
  if (!p || opens.length === 0) continue;
  const d = arr(r.fixtureInputs).find((x) => isObj(x) && x.id === p.target);
  const wantMode = d && d.multiple === true ? 'selectMultiple' : 'selectSingle';
  if (!d || opens.some((e) => e.params.mode !== wantMode)) modeBad.push(leg.name + ': ' + JSON.stringify(opens.map((e) => e.params.mode)) + ' want ' + wantMode);
}
check('mode-law', modeBad.length === 0, 'chooser events whose mode is not the page-measured input\'s (multiple attribute -> selectMultiple, else selectSingle; a webkitdirectory input and an accept-constrained input are both selectSingle): ' + modeBad.join(','));

// cross-origin non-file: the SecurityError the spec and Chromium keep
const co = legOf('sp84-cross-origin-nonfile');
check('cross-origin-nonfile-law', isObj(co.childResult) && same(co.childResult, CHILD_RESULT_LAW['sp84-cross-origin-nonfile']) && arr(co.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(co.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' }) && same(co.childActivationBefore, CHILD_ACT_LAW['sp84-cross-origin-nonfile'][0]) && same(co.childActivationAfter, CHILD_ACT_LAW['sp84-cross-origin-nonfile'][1]) && arr(co.childEvents).length === 5 && arr(co.childEvents).every((e) => e.isTrusted === true && e.act === true) && same(arr(co.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE['sp84-cross-origin-nonfile'].seq) && co.childLate === 0,
  'a cross-origin NON-file input\'s own script must throw SecurityError and open nothing: child ' + JSON.stringify(co.childResult) + ' cross ' + JSON.stringify(co.parentCrossAccess) + ' events ' + JSON.stringify(arr(co.childEvents).map((e) => e.type + '@' + e.target)));

// the order discriminator: same call, disabled input, two origins, two different errors
const cod = legOf('sp84-cross-origin-nonfile-disabled');
const sod = legOf('sp84-same-origin-nonfile-disabled');
check('order-law', isObj(cod.childResult) && same(cod.childResult, CHILD_RESULT_LAW['sp84-cross-origin-nonfile-disabled']) && arr(cod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(cod.childActivationBefore, CHILD_ACT_LAW['sp84-cross-origin-nonfile-disabled'][0]) && same(cod.childActivationAfter, CHILD_ACT_LAW['sp84-cross-origin-nonfile-disabled'][1]) && arr(cod.childEvents).length === 5 && arr(cod.childEvents).every((e) => e.isTrusted === true && e.act === true) && same(arr(cod.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE['sp84-cross-origin-nonfile-disabled'].seq) && cod.childLate === 0 && isObj(sod.showPicker) && sod.showPicker.ok === false && sod.showPicker.name === 'InvalidStateError' && sod.showPicker.message === IMMUTABLE_ERR && arr(sod.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0,
  'the SAME call on a DISABLED type=date input must be InvalidStateError same-origin (mutability) and SecurityError cross-origin (Chromium checks the origin first): cross ' + JSON.stringify(cod.childResult) + ' same ' + JSON.stringify(sod.showPicker));
// the colour/month/week/time cross-origin legs: colour is exempt (returns undefined), the other three keep the SecurityError
for (const extra of ['sp84-cross-origin-color', 'sp84-cross-origin-month', 'sp84-cross-origin-week', 'sp84-cross-origin-time', 'sp84-cross-origin-number', 'sp84-cross-origin-range', 'sp84-cross-origin-tel', 'sp84-cross-origin-search', 'sp84-cross-origin-text']) {
  const ex = legOf(extra);
  check(extra + '-law', isObj(ex.childResult) && same(ex.childResult, CHILD_RESULT_LAW[extra]) && arr(ex.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(ex.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' }) && same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0]) && same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1]) && arr(ex.childEvents).length === 5 && arr(ex.childEvents).every((e) => e.isTrusted === true && e.act === true) && same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq) && ex.childLate === 0,
    extra + ': child ' + JSON.stringify(ex.childResult) + ' events ' + JSON.stringify(arr(ex.childEvents).map((e) => e.type + '@' + e.target)));
}

// the webkitdirectory answer: a DIRECTORY path delivers the directory's files with webkitRelativePath
const wa = legOf('sp84-webkitdirectory-answer');
const waState = isObj(wa.stateAfter) ? wa.stateAfter.d : null;
check('webkitdirectory-answer-law', isObj(wa.answer) && same(Object.keys(wa.answer).sort(), ['files', 'setError', 'setParams', 'setResult', 'setSendId']) && same(wa.answer.files, [DIR.name]) && isObj(wa.answer.setParams) && same(Object.keys(wa.answer.setParams).sort(), ['backendNodeId', 'files']) && arr(wa.answer.setParams.files).length === 1 && path.basename(wa.answer.setParams.files[0]) === DIR.name && wa.answer.setParams.backendNodeId === nodeReport['sp84-webkitdirectory-answer'][0] && same(wa.answer.setResult, {}) && wa.answer.setError === null && isObj(wa.uploadDir) && same(wa.uploadDir, { name: DIR.name, files: DIR.files.map((f) => ({ name: f.name, size: f.size, sha256: f.hex ? sha256(Buffer.from(f.hex, 'hex')) : null })) }) && same(waState, DIR_FILES) && arr(wa.pageEvents).filter((e) => e.type === 'read').length === 2 && same(arr(wa.pageEvents).filter((e) => e.type === 'read').map((e) => e.ret), DIR.files.map((f) => 'hex:' + f.hex)),
  'a DIRECTORY answered through DOM.setFileInputFiles must deliver its files with webkitRelativePath and fire trusted input+change: answer ' + JSON.stringify(wa.answer) + ' state ' + JSON.stringify(waState));

// the accept answer: accept is a dialog filter, not a validator
const aa = legOf('sp84-accept-answer');
check('accept-answer-law', isObj(aa.answer) && same(aa.answer.files, [ANSWER.name]) && isObj(aa.answer.setParams) && arr(aa.answer.setParams.files).length === 1 && path.basename(aa.answer.setParams.files[0]) === ANSWER.name && aa.answer.setParams.backendNodeId === nodeReport['sp84-accept-answer'][0] && same(aa.answer.setResult, {}) && aa.answer.setError === null && isObj(aa.upload) && same(aa.upload, { name: ANSWER.name, size: ANSWER.size, sha256: ANSWER.sha256 }) && same(isObj(aa.stateAfter) ? aa.stateAfter.k : null, [[ANSWER.name, ANSWER.size, ANSWER.type, '']]) && arr(aa.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(aa.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + ANSWER.hex,
  'a .txt answered into an accept=".png" input must be ACCEPTED (accept filters the dialog, not a programmatic answer): answer ' + JSON.stringify(aa.answer) + ' state ' + JSON.stringify(isObj(aa.stateAfter) ? aa.stateAfter.k : null));

// the click-while-open law: a real click on the input whose picker is pending opens a SECOND chooser
const cw = legOf(CLICK_LEG);
check('click-while-open-law', cw.clickWhileOpenChoosersBefore === 1 && cw.clickWhileOpenChoosersAfter === 2 && cw.clickWhileOpenElement === 's' && arr(cw.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 2 && arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').length === 1 && arr(cw.pageEvents).filter((e) => e.type === 'click' && e.target === 's').every((e) => e.isTrusted === true && e.act === true),
  'a real click on an input whose picker is already open must open a SECOND chooser: before ' + cw.clickWhileOpenChoosersBefore + ' after ' + cw.clickWhileOpenChoosersAfter + ' element ' + cw.clickWhileOpenElement);

// the multiple-mode answer: a `multiple` input answered through DOM.setFileInputFiles
// must open `selectMultiple` (the mode-single-only gap: no leg targeted the multiple
// input before r84, so the selectMultiple branch of mode-law was exercised by nothing)
const mm = legOf('sp84-multiple-mode');
check('multiple-mode-law', isObj(mm.answer) && same(mm.answer.files, [ANSWER.name]) && isObj(mm.answer.setParams) && arr(mm.answer.setParams.files).length === 1 && path.basename(mm.answer.setParams.files[0]) === ANSWER.name && mm.answer.setParams.backendNodeId === nodeReport['sp84-multiple-mode'][0] && same(mm.answer.setResult, {}) && mm.answer.setError === null && isObj(mm.upload) && same(mm.upload, { name: ANSWER.name, size: ANSWER.size, sha256: ANSWER.sha256 }) && same(isObj(mm.stateAfter) ? mm.stateAfter.m : null, [[ANSWER.name, ANSWER.size, ANSWER.type, '']]) && arr(mm.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(mm.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + ANSWER.hex,
  'a `multiple` input answered must open selectMultiple and accept the answer: answer ' + JSON.stringify(mm.answer) + ' state ' + JSON.stringify(isObj(mm.stateAfter) ? mm.stateAfter.m : null));

// the accept-MIME answer: a real PNG answered into an accept=".png" input is accepted and
// delivers its bytes (the accept token grammar: extension vs MIME vs image/*)
const am = legOf('sp84-accept-mime-answer');
check('accept-mime-answer-law', isObj(am.answer) && same(am.answer.files, [PNG.name]) && isObj(am.answer.setParams) && arr(am.answer.setParams.files).length === 1 && path.basename(am.answer.setParams.files[0]) === PNG.name && am.answer.setParams.backendNodeId === nodeReport['sp84-accept-mime-answer'][0] && same(am.answer.setResult, {}) && am.answer.setError === null && isObj(am.uploadPng) && same(am.uploadPng, { name: PNG.name, size: PNG.size, sha256: PNG.sha256, hex: PNG.hex }) && same(isObj(am.stateAfter) ? am.stateAfter.k : null, [[PNG.name, PNG.size, PNG.type, '']]) && arr(am.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(am.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + PNG.hex,
  'a .png answered into an accept=".png" input must be ACCEPTED with its bytes: answer ' + JSON.stringify(am.answer) + ' state ' + JSON.stringify(isObj(am.stateAfter) ? am.stateAfter.k : null));

// the accept GRAMMAR matrix (r88): `accept` is never enforced on a programmatic answer, for any
// token form. Three forms are measured — a wildcard type (`image/*`), a mixed list
// (`image/png, .txt`) and a MIME token that matches neither delivered byte (`application/pdf`) —
// and in every case the delivered file (matching or not) lands in the input's file list with its
// bytes. The accept attribute itself is read back from the page, so the leg's token form is
// measured, not asserted.
const GRAMMAR = [
  ['sp86-accept-wildcard-text', 'aw', 'image/*', ANSWER],
  ['sp86-accept-wildcard-png', 'aw', 'image/*', PNG],
  ['sp86-accept-mixed-text', 'am', 'image/png, .txt', ANSWER],
  ['sp86-accept-mixed-png', 'am', 'image/png, .txt', PNG],
  ['sp86-accept-pdf-token-png', 'ap', 'application/pdf', PNG],
  ['sp87-accept-audio-png', 'aa', 'audio/*', PNG],
  ['sp87-accept-video-text', 'av', 'video/*', ANSWER],
  ['sp87-accept-multimime-text', 'a2', 'image/png,application/pdf', ANSWER],
  ['sp87-accept-whitespace-png', 'aws', '  image/png ,  .txt  ', PNG],
  ['sp88-accept-case-png', 'ac', 'IMAGE/PNG', PNG],
  ['sp88-accept-audiovideo-text', 'au', 'audio/*,video/*', ANSWER],
  ['sp88-accept-mimeparam-png', 'amc', 'image/png;q=0.9', PNG],
];
const gBad = [];
for (const [name, target, accept, f] of GRAMMAR) {
  const leg = legOf(name);
  const desc = arr(r.fixtureInputs).find((x) => isObj(x) && x.id === target);
  const st = isObj(leg.stateAfter) ? leg.stateAfter[target] : null;
  const ok = isObj(leg.answer) && same(leg.answer.files, [f.name]) && isObj(leg.answer.setParams) && arr(leg.answer.setParams.files).length === 1 && path.basename(leg.answer.setParams.files[0]) === f.name && leg.answer.setParams.backendNodeId === arr(nodeReport[name])[0] && same(leg.answer.setResult, {}) && leg.answer.setError === null && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex && isObj(desc) && desc.accept === accept;
  if (!ok) gBad.push(name + ': accept ' + JSON.stringify(desc ? desc.accept : null) + ' want ' + JSON.stringify(accept) + ' state ' + JSON.stringify(st) + ' answer ' + JSON.stringify(leg.answer));
}
check('accept-grammar-law', gBad.length === 0, 'each accept token form (wildcard, mixed list, non-matching MIME token) must be recorded on the input and must not filter a programmatic answer: ' + gBad.join('; '));

// the same-origin colour arm (r88): with transient activation a same-origin `type=color`
// showPicker() returns undefined and opens NO file chooser — the colour picker is not a
// Page.fileChooserOpened event, so the law is bounded to that metric.
const col = legOf('sp86-same-origin-color-activated');
check('same-origin-color-law', isObj(col.showPicker) && col.showPicker.ok === true && col.showPicker.ret === 'undefined' && arr(col.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0 && same(col.activationBefore, { isActive: true, hasBeenActive: true }) && same(col.activationAfter, { isActive: false, hasBeenActive: true }) && same(isObj(col.stateAfter) ? col.stateAfter.cos : null, []) && arr(col.pageEvents).filter((e) => e.type === 'input' || e.type === 'change').length === 0,
  'a same-origin type=color input called WITH transient activation must return undefined, consume the activation, fire no input/change and open no FILE chooser: ' + JSON.stringify(col.showPicker) + ' opens ' + arr(col.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length);

// the second-chooser answer: after a click-while-open opens a SECOND chooser with the same
// backendNodeId, answering the LAST chooser event with distinct bytes must deliver those bytes
// to the input (attribution: the second event's answer is distinguishable by its bytes, not its id)
const sc = legOf('sp84-second-chooser-answer');
const scOpens = arr(sc.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened');
check('second-chooser-answer-law', sc.clickWhileOpenChoosersBefore === 1 && sc.clickWhileOpenChoosersAfter === 2 && scOpens.length === 2 && sc.firstChooserBackendNodeId === scOpens[0].params.backendNodeId && sc.secondChooserBackendNodeId === scOpens[1].params.backendNodeId && sc.firstChooserBackendNodeId === sc.secondChooserBackendNodeId && isObj(sc.answer) && same(sc.answer.files, [SECOND.name]) && isObj(sc.answer.setParams) && arr(sc.answer.setParams.files).length === 1 && path.basename(sc.answer.setParams.files[0]) === SECOND.name && sc.answer.setParams.backendNodeId === sc.secondChooserBackendNodeId && same(sc.answer.setResult, {}) && sc.answer.setError === null && isObj(sc.uploadSecond) && same(sc.uploadSecond, { name: SECOND.name, size: SECOND.size, sha256: SECOND.sha256, hex: SECOND.hex }) && same(isObj(sc.stateAfter) ? sc.stateAfter.s : null, [[SECOND.name, SECOND.size, SECOND.type, '']]) && arr(sc.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(sc.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + SECOND.hex,
  'answering the SECOND chooser (same backendNodeId as the first) with distinct bytes must deliver THOSE bytes to the input: before ' + sc.clickWhileOpenChoosersBefore + ' after ' + sc.clickWhileOpenChoosersAfter + ' first ' + sc.firstChooserBackendNodeId + ' second ' + sc.secondChooserBackendNodeId + ' answer ' + JSON.stringify(sc.answer) + ' state ' + JSON.stringify(isObj(sc.stateAfter) ? sc.stateAfter.s : null));

const stateBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const st = leg.stateAfter;
  const empty = isObj(st) && same(Object.keys(st).sort(), ['a2', 'aa', 'ac', 'am', 'amc', 'ap', 'au', 'av', 'aw', 'aws', 'cos', 'd', 'dis', 'disd', 'k', 'm', 's', 'sValue']) && ['s', 'm', 'd', 'k', 'dis', 'disd', 'aw', 'am', 'ap', 'cos', 'aa', 'av', 'a2', 'aws', 'ac', 'au', 'amc'].every((k) => Array.isArray(st[k]) && st[k].length === 0) && st.sValue === '';
  if (ANSWER_LEGS.includes(leg.name)) {
    if (!isObj(leg.stateAfterDismiss) || !same(leg.stateAfterDismiss, leg.stateAfter)) stateBad.push(leg.name + ':dismiss-state');
    continue;
  }
  if (!empty) stateBad.push(leg.name + ':state');
  if (leg.stateAfterDismiss !== null && !(isObj(leg.stateAfterDismiss) && ['s', 'm', 'd', 'k', 'dis', 'disd'].every((k) => Array.isArray(leg.stateAfterDismiss[k]) && leg.stateAfterDismiss[k].length === 0))) stateBad.push(leg.name + ':dismiss-state');
  if (arr(leg.pageEvents).some((e) => e.type === 'input' || e.type === 'change' || (e.files !== null && e.type !== 'cancel'))) stateBad.push(leg.name + ':file-event');
}
check('no-selection-law', stateBad.length === 0, 'showPicker must never select files or fire input/change (the trigger opens a picker; the answer is a separate act, measured only in the answer legs): ' + stateBad.join(','));
const intBad = [];
for (const leg of legs) {
  if (!isObj(leg)) continue;
  const p = PLAN.find((x) => x.name === leg.name);
  if (!p) { intBad.push(leg.name + ':unknown-leg'); continue; }
  const opens = arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length;
  const okCall = CROSS.has(leg.name) ? isObj(leg.childResult) && leg.childResult.ok === true && leg.name !== 'sp84-cross-origin-color' : isObj(leg.showPicker) && leg.showPicker.ok === true;
  const want = NO_PICKER.has(leg.name) ? 0 : (okCall ? ((leg.name === CLICK_LEG || leg.name === 'sp84-second-chooser-answer') ? 2 : 1) : 0);
  if (opens !== want) intBad.push(leg.name + ':opened-' + opens + '-want-' + want);
}
check('same-origin-no-picker-law', ['sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated'].every((n) => {
  const leg = legOf(n);
  return isObj(leg.showPicker) && leg.showPicker.ok === true && leg.showPicker.ret === 'undefined' && arr(leg.cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length === 0;
}), 'the same-origin tel/search/text inputs called WITH transient activation must return undefined and open NO chooser (no picker exists for these types): ' + JSON.stringify(['sp85-same-origin-tel-activated', 'sp85-same-origin-search-activated', 'sp85-same-origin-text-activated'].map((n) => [n, isObj(legOf(n).showPicker) ? legOf(n).showPicker.ok : null, arr(legOf(n).cdpEventLog).filter((e) => e.method === 'Page.fileChooserOpened').length])));
check('intercept-law', intBad.length === 0, 'interception must gate the CDP event, never the trigger\'s own success: ' + intBad.join(','));
const cancels = legs.flatMap((l) => (isObj(l) ? arr(l.pageEvents).filter((e) => e.type === 'cancel').map((e) => [l.name, e.target]) : []));
check('cancel-law', same(cancels, []), 'no leg in this generation opens a picker that is cancelled, so no page cancel event may fire: ' + JSON.stringify(cancels));
const disBad = legs.filter((l) => isObj(l) && l.dismissSendId !== null && !(isObj(l.dismissResult) && same(l.dismissResult, {}) && l.dismissError === null && arr(l.pageEvents).every((e) => e.type !== 'cancel'))).map((l) => l.name);
check('dismiss-law', disBad.length === 0, 'a post-hoc {cancel:true} must be accepted and must not fire a page cancel (the flag arms the NEXT chooser): ' + disBad.join(','));
const PTR = new Set(['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']);
check('trust-law', events.length > 0 && events.every((e) => e.isTrusted === true) && legs.every((l) => isObj(l) && arr(l.pageEvents).every((e) => !PTR.has(e.type) || (e.leg !== 'show-picker' && e.leg !== 'show-picker-2'))),
  'every page event must be trusted, and a showPicker call must fire no pointer event at all (it opens a picker, it does not click)');

// ---- host argv / devtools ----
const argvBad = [];
for (const leg of legs) {
  if (!isObj(leg)) { argvBad.push('not-an-object'); continue; }
  const a = arr(leg.argv);
  const profile = a.find((x) => typeof x === 'string' && x.startsWith('--user-data-dir='));
  const tok = leg.launchToken;
  const dl = leg.devtoolsListening;
  const want = ['/usr/bin/chromium', '--headless=new', '--remote-debugging-port=' + ports.cdp, '--remote-debugging-address=127.0.0.1', profile, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-search-engine-choice-screen', '--disable-dev-shm-usage', '--disable-extensions', '--disable-smooth-scrolling', '--force-device-scale-factor=1', '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank'];
  if (!same(a, want) || typeof tok !== 'string' || !/^[0-9a-f]{12}$/.test(tok) || typeof profile !== 'string' || path.basename(profile) !== 'profile-' + tok) argvBad.push(leg.name + ':argv');
  if (!isObj(dl) || typeof dl.url !== 'string' || !dl.url.startsWith('ws://127.0.0.1:' + ports.cdp + '/devtools/browser/') || !/^[0-9a-f-]{36}$/.test(dl.browserId) || typeof leg.stderrHead !== 'string' || !leg.stderrHead.includes(dl.url)) argvBad.push(leg.name + ':devtools');
  if (!isObj(leg.teardown)) argvBad.push(leg.name + ':teardown');
}
check('host-argv', argvBad.length === 0, 'per-leg argv / launch token / profile / devtools line: ' + argvBad.join(','));
check('devtools-port-binding', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && l.devtoolsListening.port === ports.cdp), 'devtools port not the argv CDP port');
check('teardown-closure', legs.every((l) => isObj(l) && isObj(l.teardown) && arr(l.teardown.survivors).length === 0 && same(Object.keys(l.teardown.portProbes).sort(), ['child', 'devtools', 'fixture']) && Object.values(l.teardown.portProbes).every((v) => v === 'closed') && Object.values(l.teardown.postKillCurl).every((v) => v === 7)), 'a leg\'s teardown proof failed');
check('fixture-descriptors', same(arr(r.fixtureInputs), FIXTURE_INPUTS), 'page-side element descriptors differ: ' + JSON.stringify(r.fixtureInputs));
const srvBad = legs.filter((l) => isObj(l) && !(arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').length === 1 && arr(l.serverLog).filter((s) => isObj(s) && s.path === '/').every((s) => s.run === r.nonce && s.status === 200) && arr(l.serverLog).filter((s) => isObj(s) && s.path !== '/').every((s) => s.status === 404))).map((l) => l.name);
check('server-log-binding', srvBad.length === 0, 'fixture server log not bound to the run nonce: ' + srvBad.join(','));
const childSrvBad = legs.filter((l) => isObj(l) && !(arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').length >= 1 && arr(l.childServerLog).filter((s) => isObj(s) && s.path === '/child.html').every((s) => s.run === r.nonce && s.status === 200) && arr(l.childServerLog).filter((s) => isObj(s) && s.path !== '/child.html').every((s) => s.status === 404))).map((l) => l.name);
check('child-server-log-binding', childSrvBad.length === 0, 'child-origin server log not bound to the run nonce: ' + childSrvBad.join(','));

// ---- run window / replay ----
const t0 = Date.parse(r.startedAt), t1 = Date.parse(r.finishedAt);
check('run-window', Number.isFinite(t0) && Number.isFinite(t1) && t1 - t0 >= 12000 && t1 - t0 < 600000, 'startedAt ' + r.startedAt + ' finishedAt ' + r.finishedAt + ' (6 legs, each >= 2 s observe + 0.5 s settle + a browser launch)');
const pairs = (x) => arr(x.legs).flatMap((l) => (isObj(l) && l.name ? arr(l.pageEvents).filter((e) => isObj(e) && num(e.ts) && num(e.at)).map((e) => ({ leg: l.name, ts: e.ts, at: e.at })) : []));
const pairMatch = (a, b) => { const y = b.map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of a) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gapsOf = (x) => { const at = x.map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const own = pairs(r);
const ownGaps = gapsOf(own);
const sims = priors.map((p) => {
  const np = pairs(p).length, gp = gapsOf(pairs(p)).length;
  const absMatched = pairMatch(own, pairs(p)), gapMatched = matchCount(ownGaps, gapsOf(pairs(p)));
  const absNeed = np > 0 ? Math.ceil(FRAC * np - 1e-9) : 0, gapNeed = gp > 0 ? Math.ceil(GAP_FRAC * gp - 1e-9) : 0;
  return { priorEvents: np, priorGaps: gp, absMatched, gapMatched, absNeed, gapNeed, escapeEvents: np > 0 ? np - absNeed + 1 : 0, refused: np > 0 && absMatched >= absNeed };
});
const replayIdx = sims.findIndex((s) => s.refused);
check('replay-event-timeline', replayIdx === -1, 'pair near-match within ' + TOL + ' ms of prior #' + replayIdx + ' ' + JSON.stringify(sims[replayIdx] || null) + ' (refuse when absMatched >= ceil(' + FRAC + ' * prior events); own events ' + own.length + ')');
check('replay-launch-token', legs.every((l) => isObj(l) && typeof l.launchToken === 'string' && /^[0-9a-f]{12}$/.test(l.launchToken) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || q.launchToken !== l.launchToken))) && new Set(legs.map((l) => l.launchToken)).size === legs.length,
  'a launch token repeats a prior receipt\'s or another leg\'s');
check('replay-devtools-url', legs.every((l) => isObj(l) && isObj(l.devtoolsListening) && priors.every((p) => arr(p.legs).every((q) => !isObj(q) || !isObj(q.devtoolsListening) || q.devtoolsListening.browserId !== l.devtoolsListening.browserId))) && new Set(legs.map((l) => l.devtoolsListening && l.devtoolsListening.browserId)).size === legs.length,
  'a devtools browser id repeats a prior receipt\'s or another leg\'s');

// ---- prior-set completeness over the walked trees (content-bound exemption) ----
const priorReal = new Set([...priorPaths, ...extraPriors.map(abs)].map(real));
const selfReal = real(abs(rp));
const exemptReal = new Set();
const walked = [];
const seen = new Set();
const walk = (d) => {
  const rd = real(d); if (seen.has(rd)) return; seen.add(rd);
  let st; try { st = fs.statSync(rd); } catch { return; }
  if (!st.isDirectory()) return;
  let entries; try { entries = fs.readdirSync(rd, { withFileTypes: true }); } catch (e) { walked.push({ dir: rd, error: e.message }); return; }
  for (const ent of entries) {
    const p = path.join(rd, ent.name);
    let s; try { s = fs.statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p);
    else if (s.isFile()) walked.push({ path: real(p) });
  }
};
for (const t of TREES) walk(path.join(lane, t));
const outside = [], unparsable = [];
const fileHashes = new Map();
for (const w of walked) {
  if (w.error) { outside.push('unreadable-dir:' + w.dir); continue; }
  let bytes; try { bytes = fs.readFileSync(w.path); } catch { continue; }
  const h = sha256(bytes);
  fileHashes.set(w.path, h);
  if (exemptHashes.includes(h)) exemptReal.add(w.path);
  let j = null; try { j = JSON.parse(bytes.toString('utf8')); } catch { j = null; }
  if (j === null) {
    const txt = bytes.toString('utf8');
    if ((/\.json$/i.test(w.path) || txt.trimStart().startsWith('{')) && /tabi-chrome-cdp-showpicker-r88/.test(txt)) unparsable.push(w.path);
    continue;
  }
  if (isObj(j) && j.schema === SCHEMA && !priorReal.has(w.path) && w.path !== selfReal && !exemptReal.has(w.path)) outside.push(w.path);
}
const unmatched = exemptHashes.filter((h) => ![...fileHashes.values()].includes(h));
check('prior-set-unmatched-exempt', unmatched.length === 0, 'tree-exempt sha256 matches no walked file: ' + unmatched.join(','));
check('prior-set-complete', outside.length === 0, 'receipts of schema ' + SCHEMA + ' in the round-88 wave/evidence trees, not the receipt under test (path ' + path.relative(lane, abs(rp)) + '), not exempted by sha256 and not among the priors: ' + outside.join(','));
check('prior-set-unparsable', unparsable.length === 0, 'files in the round-88 wave/evidence trees that carry the schema and do not parse (refused, not skipped): ' + unparsable.join(','));

// ---- verdict ----
const ids = Object.keys(checks);
const failed = ids.filter((id) => !checks[id]);
const verdict = failed.length === 0 ? 'clean' : 'findings';
out({
  verdict, checkCount: ids.length, checks, findings,
  priorSet: priorPaths.length, priorSetFile: { path: priorSet, sha256: sha256(fs.readFileSync(abs(priorSet))) },
  treeExemptSha256: exemptHashes, treeExemptResolved: [...exemptReal],
  nodeReport,
  limit: {
    sentence: 'refuse when absMatched >= ceil(' + FRAC + ' * prior events); the escape minimum is priorEvents - absNeed + 1 moved events. The gap side is reported, not a refusal: this driver\'s fixed waits reproduce gap durations across honest runs, so a gap match is a driver artifact. A forger who moves fewer events but shifts EVERY event by a constant offset escapes this rule — that is the limit.',
    tolerance: TOL, gapMin: GAP_MIN, ownEvents: own.length, ownGaps: ownGaps.length, perPrior: sims,
  },
}, verdict === 'clean' ? 0 : 1);
