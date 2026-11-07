// Round-74 C1 semantic-mutant sweep: each mutant is one exact source-string edit of
// check-imecompose-r74.mjs (never a force-true hook), run through the battery COPY beside it
// (which also re-hashes the pinned driver beside the counter). Killed = battery exit 1.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const BASE = '/fast/scratch/hyaku/tabi-r74/R74Mut1';
const SRC = path.join(BASE, 's');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const REAL = path.join(LANE, 'corpus/evidence/round74/chromium-ime-composition/receipt.json');
const PIN = 'afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc';
const NONCE = 'tabi-r74-l1-ca30e1a3b7b2';
const C1 = path.join(LANE, '.ufo/waves/round-74/controls/c1');
const PRIORS = [
  'smoke1', 'smoke2', 'smoke3', 'smoke4', 'smoke5', 'smoke6', 'smoke7', 'smoke8', 'smoke9',
  'degenerate-dispatch-key', 'degenerate-exec-command', 'degenerate-script-events',
].map((n) => path.join(C1, n + '.receipt.json'));
const LAUNDERED = ['degenerate-dispatch-key', 'degenerate-exec-command', 'degenerate-script-events'].map((n) => path.join(C1, n + '.receipt.json'));
const COUNTER = 'check-imecompose-r74.mjs';
const BATTERY = 'negatives-imecompose-r74.mjs';
const DRIVER = 'chrome-cdp-imecompose-round74.mjs';
const batterySrc = fs.readFileSync(path.join(SRC, BATTERY));
const driverBytes = fs.readFileSync(path.join(SRC, DRIVER));
const counterSrc = fs.readFileSync(path.join(SRC, COUNTER), 'utf8');

// The 26 frozen semantic edits (kill-power-r74.mjs); a mutant here must not duplicate one.
const FROZEN_FROM = [
  "r.predicate === true && r.imeComposeHypothesis === 'CONFIRMED'",
  'r.driverSha256 === pin',
  "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce",
  'r.nonce === expectNonce',
  'r.degenerate === null',
  'isObj(r.fixture) && r.fixture.sha256 === fixtureWant',
  'priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)',
  '/^[0-9a-f]{12}$/.test(tok) && ',
  'priors.every((p) => browserId(p.host) !== bid)',
  'Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05',
  'Math.round(v * 10)) <= 1e-4',
  't1 - t0 >= 4000',
  'r.lateAfterClose === 0',
  'return e.at >= w[0] && e.at <= w[1] &&',
  'if (!open || e.data !== lastUpdate) chainOk = false;',
  'sessions === 3',
  "e.inputType === 'insertText' ? e.isComposing === false : false",
  'e.type === CE ? e.isTrusted === false : e.isTrusted === true',
  " && starts.some((e) => e.data !== '')",
  '!/^key/.test(e.type)',
  ".map((e) => e.leg).join(',') === 'focus-ce,blur'",
  'imeCalls.length === planned.length',
  ' && EXPRS.has(c.params.expression)',
  "once('Page.navigate') && ",
  'td.postKillSweepCount === 0 && ',
];

const M = [
  // --- identity / run binding ---
  { id: 'schema-any-string', from: "r.schema === 'tabi-chrome-cdp-imecompose-r74'", to: 'typeof r.schema === \'string\'' },
  { id: 'nonce-shape-length-only', from: "typeof r.nonce === 'string' && /^tabi-r74-[a-z0-9-]+$/.test(r.nonce)", to: "typeof r.nonce === 'string' && r.nonce.length > 0" },
  { id: 'nonce-expected-prefix-only', from: "check('nonce-expected', r.nonce === expectNonce", to: "check('nonce-expected', typeof r.nonce === 'string' && r.nonce.startsWith('tabi-r74-')" },
  { id: 'server-log-run-any-string', from: 'served.every((s) => s.run === r.nonce)', to: 'served.every((s) => typeof s.run === \'string\')' },
  { id: 'driver-pin-hex-shape-only', from: "check('driver-pin', r.driverSha256 === pin", to: "check('driver-pin', /^[0-9a-f]{64}$/.test(r.driverSha256)" },
  { id: 'host-chromium-version-dropped', from: '/^Chromium \\d+\\.\\d+\\.\\d+\\.\\d+/.test(host.chromium)', to: '/^Chromium/.test(host.chromium)' },
  { id: 'devtools-stderr-head-dropped', from: "typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url)", to: "typeof host.stderrHead === 'string'" },
  { id: 'devtools-url-prefix-any', from: "dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/')", to: "dl.url.startsWith('ws://')" },
  { id: 'run-window-ceiling-dropped', from: 't1 - t0 >= 4000 && t1 - t0 < 600000', to: 't1 - t0 >= 4000' },
  { id: 'plan-frozen-length-only', from: "check('plan-frozen', canon(r.plan) === canon(FROZEN)", to: "check('plan-frozen', arr(r.plan).length === FROZEN.length" },
  { id: 'leg-order-length-ge', from: 'legs.length === LEG_ORDER.length &&', to: 'legs.length >= LEG_ORDER.length - 1 &&' },
  { id: 'leg-params-cmd-dropped', from: 'canon(l.params) === canon(FROZEN[i].params) && l.cmd === FROZEN[i].cmd', to: 'canon(l.params) === canon(FROZEN[i].params)' },
  { id: 'leg-params-elapsed-optional', from: 'num(l.elapsedMs) && l.elapsedMs >= 0', to: '(l.elapsedMs === undefined || (num(l.elapsedMs) && l.elapsedMs >= 0))' },
  { id: 'leg-params-keys-only', from: 'canon(l.params) === canon(FROZEN[i].params) && l.cmd', to: 'canon(Object.keys(l.params || {})) === canon(Object.keys(FROZEN[i].params || {})) && l.cmd' },
  { id: 'seq-ge-not-eq', from: 'e.seq === i + 1', to: 'e.seq >= i + 1' },
  { id: 'event-leg-domain-some', from: 'events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg))', to: 'events.some((e) => isObj(e) && LEG_ORDER.includes(e.leg))' },
  // --- typed() conjuncts ---
  { id: 'typed-key-dropped', from: ' && strOrNull(e.key)', to: '' },
  { id: 'typed-value-dropped', from: ' && strOrNull(e.value)', to: '' },
  { id: 'typed-selend-dropped', from: ' && intOrNull(e.selStart) && intOrNull(e.selEnd)', to: ' && intOrNull(e.selStart)' },
  { id: 'typed-inputtype-number-allowed', from: 'strOrNull(e.inputType)', to: "(e.inputType === null || typeof e.inputType === 'string' || typeof e.inputType === 'number')" },
  { id: 'typed-time-positive-dropped', from: 'num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0', to: 'num(e.ts) && num(e.at)' },
  { id: 'typed-composing-undefined-allowed', from: "(e.isComposing === null || typeof e.isComposing === 'boolean')", to: "(e.isComposing === undefined || e.isComposing === null || typeof e.isComposing === 'boolean')" },
  { id: 'typed-data-undefined-allowed', from: "(!('data' in e) || strOrNull(e.data))", to: '(e.data === undefined || strOrNull(e.data))' },
  { id: 'typed-events-empty-allowed', from: "check('event-types', events.length > 0 &&", to: "check('event-types'," },
  // --- replay near-match / quantum ---
  { id: 'timeline-tolerance-0.01', from: '&& Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05', to: '&& Math.abs(e.ts - y[i].ts) < 0.01 && Math.abs(e.at - y[i].at) < 0.01' },
  { id: 'timeline-at-field-dropped', from: '&& Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05', to: '&& Math.abs(e.ts - y[i].ts) < 0.05' },
  { id: 'timeline-at-lte-boundary', from: '&& Math.abs(e.ts - y[i].ts) < 0.05 && Math.abs(e.at - y[i].at) < 0.05', to: '&& Math.abs(e.ts - y[i].ts) <= 0.05 && Math.abs(e.at - y[i].at) <= 0.05' },
  { id: 'quantum-tolerance-1e-2', from: 'Math.abs(v * 10 - Math.round(v * 10)) <= 1e-4', to: 'Math.abs(v * 10 - Math.round(v * 10)) <= 1e-2' },
  { id: 'quantum-at-unchecked', from: 'events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at))', to: 'events.every((e) => isObj(e) && onGrid(e.ts))' },
  // --- leg marks / windows ---
  { id: 'marks-monotonic-slack', from: '(i === 0 || m.at >= marks[i - 1].at)', to: '(i === 0 || m.at >= marks[i - 1].at - 0.1)' },
  { id: 'marks-closed-at-first-mark', from: 'r.closedAt >= marks[marks.length - 1].at', to: 'r.closedAt >= marks[0].at' },
  { id: 'late-after-close-sub-one', from: 'Number.isInteger(r.lateAfterClose) && r.lateAfterClose === 0', to: 'num(r.lateAfterClose) && r.lateAfterClose < 1' },
  { id: 'window-lower-dropped', from: 'const w = windowOf(e.leg); return e.at >= w[0] && e.at <= w[1] &&', to: 'const w = windowOf(e.leg); return e.at <= w[1] &&' },
  { id: 'window-order-one-quantum', from: '(i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at))', to: '(i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at - 0.1))' },
  // --- send-log allow-list ---
  { id: 'once-getversion-dropped', from: " && once('Page.navigate') && once('Browser.getVersion')", to: " && once('Page.navigate')" },
  { id: 'once-metrics-dropped', from: "once('Emulation.setDeviceMetricsOverride') && ", to: '' },
  { id: 'allowlist-expr-any-string', from: 'EXPRS.has(c.params.expression)', to: "typeof c.params.expression === 'string'" },
  { id: 'allowlist-navigate-url-string', from: "canon(c.params) === canon({ url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) })", to: "typeof c.params.url === 'string'" },
  { id: 'allowlist-id-monotonic-only', from: 'sendLog.every((c, i) => c.id === i + 1)', to: 'sendLog.every((c) => Number.isInteger(c.id) && c.id >= 1)' },
  { id: 'metrics-width-height-only', from: 'canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false })', to: 'c.params.width === VIEWPORT.width && c.params.height === VIEWPORT.height' },
  { id: 'ime-call-params-first-two', from: 'canon(imeCalls.map((c) => [c.method, c.params])) === canon(planned.map((l) => [l.cmd, l.params]))', to: 'canon(imeCalls.slice(0, 2).map((c) => [c.method, c.params])) === canon(planned.slice(0, 2).map((l) => [l.cmd, l.params]))' },
  // --- teardown / failures ---
  { id: 'teardown-curl-devtools-dropped', from: 'td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7', to: 'td.postKillCurl.fixture === 7' },
  { id: 'teardown-fixture-probe-dropped', from: "td.portProbes.fixture === 'closed' && ", to: '' },
  { id: 'teardown-sweep-count-sub-one', from: "check('teardown-closure', td.postKillSweepCount === 0 &&", to: "check('teardown-closure', td.postKillSweepCount <= 1 &&" },
  { id: 'failures-nonarray-dropped', from: 'Array.isArray(r.failures) && r.failures.length === 0', to: '(r.failures === undefined || r.failures.length === 0)' },
  // --- cross-leg laws ---
  { id: 'starts-every-to-some', from: 'starts.length === 3 && starts.every((e) =>', to: 'starts.length === 3 && starts.some((e) =>' },
  { id: 'trust-end-not-true', from: 'isObj(e) && (e.type === CE ? e.isTrusted === false', to: 'isObj(e) && (e.type === CE ? e.isTrusted !== true' },
  { id: 'no-keyboard-keydown-keypress-only', from: 'isObj(e) && !/^key/.test(e.type))', to: "isObj(e) && !['keydown', 'keypress'].includes(e.type))" },
  { id: 'sessions-at-least-one', from: 'chainOk && !open && sessions === 3', to: 'chainOk && !open && sessions >= 1' },
  { id: 'focus-target-any-string', from: "fo.every((e) => ['f', 'ce'].includes(e.target))", to: 'fo.every((e) => typeof e.target === \'string\')' },
  { id: 'focusout-leg-any', from: "fo.filter((e) => e.type === 'focusout').map((e) => e.leg).join(',') === 'focus-ce,blur'", to: "fo.filter((e) => e.type === 'focusout').length >= 1" },
  // --- per-leg bookkeeping / SHAPE literals ---
  { id: 'leg-trusted-length-dropped', from: 'd.trusted.length === want.trusted.length && ', to: '' },
  { id: 'shape-ce-compose-active-f', from: "state: st(KAMEI, 2, 2, ED, 'ce')", to: "state: st(KAMEI, 2, 2, ED, 'f')" },
  { id: 'shape-commit-last-data-x', from: 'data: [KAMEI, KAMEI, KAMEI, KAMEI, KAMEI], composing: [null, true, null, true, null]', to: "data: [KAMEI, KAMEI, KAMEI, KAMEI, 'x'], composing: [null, true, null, true, null]" },
];
// uniqueness + non-duplication of the frozen 26, before anything runs
const bad = [];
for (const m of M) {
  const n = counterSrc.split(m.from).length - 1;
  if (n !== 1) bad.push(`${m.id}: from occurs ${n} times`);
  if (FROZEN_FROM.includes(m.from)) bad.push(`${m.id}: duplicates a frozen edit`);
  if (m.from === m.to) bad.push(`${m.id}: no-op`);
}
const ids = M.map((m) => m.id);
if (new Set(ids).size !== ids.length) bad.push('duplicate mutant ids');
if (bad.length) { console.error(JSON.stringify({ refused: bad }, null, 1)); process.exit(2); }

fs.writeFileSync(path.join(BASE, 'mutants.def.json'), JSON.stringify(M, null, 1));
const hash = (b) => crypto.createHash('sha256').update(b).digest('hex');
const before = { counter: hash(counterSrc), battery: hash(batterySrc), driver: hash(driverBytes) };

const runBattery = (dir, work) => new Promise((resolve) => {
  const args = [path.join(dir, BATTERY), '--real', REAL, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE,
    ...PRIORS.flatMap((p) => ['--prior', p]), '--work', work,
    ...LAUNDERED.flatMap((p) => ['--laundered', p]), '--json'];
  const p = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; });
  p.stderr.on('data', (x) => { se += x; });
  p.on('exit', (code) => {
    let j = null; try { j = JSON.parse(so); } catch {}
    resolve({ exit: code, summary: j, stderr: se.slice(0, 2000) });
  });
});

const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
const jobs = Number(process.env.JOBS || 12);
const todo = M.map((m, i) => ({ m, i })).filter(({ m }) => !only || only.has(m.id));
const results = new Array(M.length).fill(null);
let next = 0;
await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, async () => {
  while (next < todo.length) {
    const { m, i } = todo[next++];
    const dir = path.join(BASE, 'mut', String(i).padStart(2, '0') + '-' + m.id);
    const work = path.join(BASE, 'work', String(i).padStart(2, '0'));
    fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(work, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(work, { recursive: true });
    const src = counterSrc.replace(m.from, m.to);
    fs.writeFileSync(path.join(dir, COUNTER), src);
    fs.writeFileSync(path.join(dir, BATTERY), batterySrc);
    fs.writeFileSync(path.join(dir, DRIVER), driverBytes);
    const r = await runBattery(dir, work);
    const s = r.summary;
    const failed = s ? (s.failed || []) : null;
    const failedResults = s ? (s.results || []).filter((x) => !x.ok) : null;
    results[i] = {
      i, id: m.id, edit: { from: m.from, to: m.to }, mutantSha256: hash(src), identicalToPinned: src === counterSrc,
      batteryExit: r.exit, killed: r.exit === 1,
      positiveOk: s ? s.positiveOk : null, passed: s ? s.passed : null, cases: s ? s.cases : null,
      coverageGap: s ? s.coverageGap : null, failed, failedResults, stderr: s ? null : r.stderr,
    };
    fs.writeFileSync(path.join(BASE, 'receipts', m.id + '.battery.json'), JSON.stringify(s ?? { error: r.stderr }, null, 1));
    if (r.exit === 1) fs.rmSync(work, { recursive: true, force: true });
    console.error(`[${results.filter(Boolean).length}/${todo.length}] ${m.id} exit=${r.exit} killed=${r.exit === 1}${failed && failed.length ? ' failed=' + failed.slice(0, 3).join('|') : ''}`);
  }
}));
const after = { counter: hash(fs.readFileSync(path.join(SRC, COUNTER))), battery: hash(fs.readFileSync(path.join(SRC, BATTERY))), driver: hash(fs.readFileSync(path.join(SRC, DRIVER))) };
const summary = {
  schema: 'tabi-mutants-r74-c1-r74mut1', generatedAt: new Date().toISOString(),
  pinned: { counter: PIN, counterActual: before.counter, battery: before.battery, driverExpected: PIN, driver: before.driver, restored: JSON.stringify(before) === JSON.stringify(after) },
  real: REAL, nonce: NONCE, priorCount: PRIORS.length, launderedCount: LAUNDERED.length,
  total: M.length, killed: results.filter((x) => x && x.killed).length,
  survived: results.filter((x) => x && !x.killed).map((x) => x.id),
  results,
};
fs.writeFileSync(path.join(BASE, 'sweep.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ total: summary.total, killed: summary.killed, survived: summary.survived, restored: summary.pinned.restored }, null, 1));
