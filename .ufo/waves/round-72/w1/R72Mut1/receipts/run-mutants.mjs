#!/usr/bin/env node
// R72Mut1: >=25 single-edit semantic mutants of check-synthpinch-r72.mjs, each run against the
// pristine battery copy beside it, on the scored C1 receipt. Baseline (unmutated) battery already
// fails `in-wheel-anchor-2px`; a mutant is killed ONLY if it adds at least one failed case beyond
// that baseline set.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r72/R72Mut1';
const SRC = path.join(S, 's', 'check-synthpinch-r72.mjs');
const BATTERY = path.join(S, 's', 'negatives-synthpinch-r72.mjs');
const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json';
const PIN = 'd007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877';
const OUT = path.join(S, 'results.json');
const JOBS = Number(process.env.JOBS || 8);
const counterSrc = fs.readFileSync(SRC, 'utf8');
const batterySrc = fs.readFileSync(BATTERY, 'utf8');
const baseline = JSON.parse(fs.readFileSync(path.join(S, 'base', 'baseline.json'), 'utf8'));
const baseFailed = new Set(baseline.failed);

const FROZEN_EDITS = [
  "r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED'",
  'r.driverSha256 === pin',
  "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce",
  'params.scaleFactor), 0.5)',
  "e.leg === 'zero' && e.type === 'wheel').every((e) => e.deltaY === 0)",
  'ratio >= 3 && ratio <= 5',
  'return e.at >= w[0] && e.at <= w[1] &&',
  "legOf('zero').elapsedMs >= ZERO_WAIT_MS",
  'e.scale >= Math.min(a, b) - 0.01 && e.scale <= Math.max(a, b) + 0.01',
  "once('Page.navigate') && ",
  'td.postKillSweepCount === 0 && ',
  'r.degenerate === null',
];

const M = [];
const add = (id, from, to, target) => M.push({ id, from, to, target });

// ---- assignment-named edits (15) ----
add('in-span-upper-100000', "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450], tm: null, error: null },",
  "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 100000], tm: null, error: null },", 'in-timing');
add('in-span-lower-1', "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450], tm: null, error: null },",
  "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [1, 450], tm: null, error: null },", 'in-timing-short');
add('out-span-upper-100000', "out: { seq: [], wheels: [5, 'out'], scale: 1, span: [150, 450], tm: null, error: null },",
  "out: { seq: [], wheels: [5, 'out'], scale: 1, span: [150, 100000], tm: null, error: null },", 'out-timing');
add('default-span-upper-100000', "default: { seq: [], wheels: [3, 'in'], scale: 1.5, span: [60, 300], tm: null, error: null },",
  "default: { seq: [], wheels: [3, 'in'], scale: 1.5, span: [60, 100000], tm: null, error: null },", 'default-timing');
add('wheel-sign-flip', "wheels.every((e) => e.deltaY < 0) ? 'in' : wheels.every((e) => e.deltaY > 0) ? 'out'",
  "wheels.every((e) => e.deltaY > 0) ? 'in' : wheels.every((e) => e.deltaY < 0) ? 'out'", 'leg-in-wheels/leg-out-wheels');
add('law-constant-50', 'near(lawSum(n), -100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)',
  'near(lawSum(n), -50 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)', 'wheel-delta-law');
add('law-log10', '-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor)',
  '-100 * Math.log10(FROZEN.find((l) => l.name === n).params.scaleFactor)', 'wheel-delta-law');
add('wheels-drop-ctrlkey', 'wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)',
  'wheels.every((e) => e.deltaMode === 0)', 'leg-*-wheels-ctrl');
add('wheels-drop-deltamode', 'wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)',
  'wheels.every((e) => e.ctrlKey === true)', 'leg-*-wheel-delta-mode');
add('touch-ratio-strict-gt', 'spans[spans.length - 1] / spans[0] >= 2',
  'spans[spans.length - 1] / spans[0] > 2', 'accept-equal-touch-spans-ratio-2');
add('leg-order-sorted', 'canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER)',
  'canon(legs.map((l) => l && l.name).slice().sort()) === canon(LEG_ORDER.slice().sort())', 'leg-order');
add('pinch-params-first-only', 'canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params))',
  'canon(pinches.slice(0, 1).map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params).slice(0, 1))', '(none: battery mutates only pinch params[0])');
add('send-id-sequence-dropped', ' && sendLog.every((c, i) => c.id === i + 1)', '', 'allowlist-id-gap');
add('closedat-below-last-mark', 'r.closedAt >= marks[marks.length - 1].at', 'r.closedAt >= marks[0].at', 'leg-marks-closed-early');
add('event-types-drop-istrusted', " && typeof e.isTrusted === 'boolean' && typeof e.ctrlKey === 'boolean'",
  " && typeof e.ctrlKey === 'boolean'", 'event-types-trusted-string');
// ---- additional semantic edits ----
add('run-window-floor-0', 't1 - t0 >= 8000 && t1 - t0 < 600000', 't1 - t0 >= 0 && t1 - t0 < 600000', 'run-window-short');
add('run-window-ceiling-10x', 't1 - t0 >= 8000 && t1 - t0 < 600000', 't1 - t0 >= 8000 && t1 - t0 < 6000000', 'run-window-long');
add('schema-prefix', "check('schema', r.schema === 'tabi-chrome-cdp-synthpinch-r72', 'schema ' + r.schema);",
  "check('schema', typeof r.schema === 'string' && r.schema.startsWith('tabi-chrome-cdp-synthpinch-'), 'schema ' + r.schema);", 'schema');
add('nonce-shape-case-insensitive', '/^tabi-r72-[a-z0-9-]+$/.test(r.nonce)', '/^tabi-r72-[a-z0-9-]+$/i.test(r.nonce)', 'nonce-shape');
add('seq-monotonic-numeric-only', 'events.length > 0 && events.every((e, i) => isObj(e) && e.seq === i + 1)',
  'events.length > 0 && events.every((e) => isObj(e) && num(e.seq))', 'seq-monotonic');
add('event-window-lower-dropped', 'return e.at >= w[0] && e.at <= w[1] &&', 'return e.at <= w[1] &&', 'event-leg-window-relabel-fitted');
add('event-window-order-dropped', '&& (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at))', '&& (i === 0 || true)', 'event-leg-window-order');
add('wheels-count-at-least', '? wheels.length === want.wheels', '? wheels.length >= want.wheels', 'leg-*-wheels-extra');
add('touch-grows-dropped', 'const grows = spans.every((s, i) => i === 0 || s >= spans[i - 1]);', 'const grows = true;', 'touch-geometry-shrink');
add('mixed-sign-as-in', "? 'zero' : 'mixed';", "? 'zero' : 'in';", 'in-wheels-sign');
add('scale-chain-dropped', '&& LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page)),', '&& true,', 'scale-agreement-chain');
add('wheel-anchor-clamp-exact-dropped', " && events.filter((e) => isObj(e) && e.leg === 'clamp' && e.type === 'wheel').every((e) => e.clientX === AT.x && e.clientY === AT.y)", '', 'wheel-anchor-clamp-exact');
add('wheel-anchor-tolerance-2', 'Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1', 'Math.abs(e.clientX - AT.x) <= 2 && Math.abs(e.clientY - AT.y) <= 2', '(none: would accept in-wheel-anchor-2px)');
add('allowlist-exprs-open', '&& EXPRS.has(c.params.expression)', "&& typeof c.params.expression === 'string'", 'lookalike-*');
add('allowlist-empty-params-open', "if (EMPTY.has(c.method)) return canon(c.params) === '{}';", 'if (EMPTY.has(c.method)) return true;', 'allowlist-params-absent');
add('navigate-url-prefix-only', "if (c.method === 'Page.navigate') return origin !== null && canon(c.params) === canon({ url: origin + '/?run=' + encodeURIComponent(String(r.nonce)) });",
  "if (c.method === 'Page.navigate') return origin !== null && typeof c.params.url === 'string' && c.params.url.startsWith('http://127.0.0.1:');", 'allowlist-navigate-other-run');
add('teardown-survivors-dropped', 'arr(td.survivors).length === 0 && ', '', 'teardown-closure');
add('late-close-nonnegative-dropped', '&& Number.isInteger(r.lateAfterClose) && r.lateAfterClose >= 0', '&& Number.isInteger(r.lateAfterClose)', 'leg-marks-late-negative');
add('touch-pointer-type-dropped', "evs.filter((e) => e.type === 'pointermove').every((e) => e.pointerType === 'touch')", 'true', 'touch-pointer-type-pen');
add('law-tolerance-5', 'near(lawSum(n), -100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)',
  'near(lawSum(n), -100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 5)', 'out-delta-off-0.8/default-delta-off-0.8');
add('slow-ratio-lower-2', 'ratio !== null && ratio >= 3 && ratio <= 5', 'ratio !== null && ratio >= 2 && ratio <= 5', 'slow-ratio-low-2x');
add('host-chromium-any-browser', '/^Chromium \\d+\\.\\d+\\.\\d+\\.\\d+/.test(host.chromium)', '/^[A-Za-z]+ \\d+\\.\\d+/.test(host.chromium)', 'host-chromium');
add('devtools-stderr-dropped', " && typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url)", '', 'devtools-stderr-absent');
add('event-types-ts-positive-dropped', 'num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0', 'num(e.ts) && num(e.at) && e.at > 0', 'event-types-ts-negative-shift');
add('leg-marks-monotonic-dropped', '(i === 0 || m.at >= marks[i - 1].at)', '(i === 0 || true)', '(none: no battery case for mark monotonicity)');
add('browser-getversion-once-dropped', " && once('Browser.getVersion')", '', '(none: no battery case duplicates Browser.getVersion)');
add('dmo-once-dropped', " && once('Emulation.setDeviceMetricsOverride')", '', '(none: no battery case duplicates DMO)');
add('leg-error-message-loose', "leg.cdpError.includes(want.error)", "typeof leg.cdpError === 'string'", '(none: no battery case swaps an error message)');

// uniqueness + frozen-overlap + real-change validation
const problems = [];
for (const m of M) {
  const n = counterSrc.split(m.from).length - 1;
  if (n !== 1) problems.push(`${m.id}: from occurs ${n}x`);
  if (m.from === m.to) problems.push(`${m.id}: edit is a no-op`);
  for (const f of FROZEN_EDITS) if (m.from === f && f === m.to) problems.push(`${m.id}: duplicates frozen edit`);
}
const ids = M.map((m) => m.id);
if (new Set(ids).size !== ids.length) problems.push('duplicate mutant ids');
const frozenExact = M.filter((m) => FROZEN_EDITS.includes(m.from));
if (problems.length) { console.error(JSON.stringify({ error: 'mutant-spec', problems }, null, 1)); process.exit(2); }

const mk = (m, i) => {
  const dir = path.join(S, 'm' + String(i).padStart(2, '0') + '-' + m.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'work'), { recursive: true });
  let src = counterSrc.replace(m.from, m.to);
  if (src === counterSrc) throw new Error(m.id + ' did not change source');
  fs.writeFileSync(path.join(dir, 'check-synthpinch-r72.mjs'), src);
  fs.writeFileSync(path.join(dir, 'negatives-synthpinch-r72.mjs'), batterySrc);
  return dir;
};
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');
const run = (dir) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(dir, 'negatives-synthpinch-r72.mjs'), '--real', REAL,
    '--expect-driver-sha256', PIN, '--work', path.join(dir, 'work'), '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; });
  p.stderr.on('data', (x) => { se += x; });
  p.on('exit', (code, sig) => {
    let j = null; try { j = JSON.parse(so); } catch {}
    resolve({ code, sig, j, stderr: se.slice(0, 400) });
  });
});

const results = new Array(M.length);
let next = 0;
await Promise.all(Array.from({ length: JOBS }, async () => {
  while (next < M.length) {
    const i = next++; const m = M[i];
    const dir = mk(m, i);
    const mutated = fs.readFileSync(path.join(dir, 'check-synthpinch-r72.mjs'), 'utf8');
    const line = counterSrc.slice(0, counterSrc.indexOf(m.from)).split('\n').length;
    const r = await run(dir);
    const failed = r.j ? r.j.failed : null;
    const added = Array.isArray(failed) ? failed.filter((c) => !baseFailed.has(c)) : null;
    const removed = Array.isArray(failed) ? [...baseFailed].filter((c) => !failed.includes(c)) : null;
    results[i] = {
      idx: i, mutant: m.id, from: m.from, to: m.to, counterLine: line, targetCase: m.target,
      fromCount: counterSrc.split(m.from).length - 1,
      mutatedSha256: hash(mutated),
      batteryExit: r.code, signal: r.sig,
      positiveOk: r.j ? r.j.positiveOk : null,
      passed: r.j ? r.j.passed : null, cases: r.j ? r.j.cases : null,
      failedCases: failed, addedFailed: added, removedBaselineFailed: removed,
      killed: Array.isArray(added) && added.length > 0,
      stderr: r.stderr || null,
    };
    fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(results[i], null, 1));
  }
}));
const summary = {
  schema: 'tabi-r72-r72mut1-semantic',
  baseline: { failed: [...baseFailed], passed: baseline.passed, cases: baseline.cases, exit: 1 },
  counter: { path: SRC, sha256: hash(counterSrc) },
  battery: { path: BATTERY, sha256: hash(batterySrc) },
  mutants: M.length, killed: results.filter((r) => r.killed).length,
  survivors: results.filter((r) => !r.killed).map((r) => r.mutant),
  results,
};
fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ mutants: summary.mutants, killed: summary.killed, survivors: summary.survivors }, null, 1));
