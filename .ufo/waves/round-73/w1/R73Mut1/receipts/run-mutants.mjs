#!/usr/bin/env node
// R73Mut1 semantic-mutant runner: one single-edit mutation of check-synthpinch-r73.mjs per
// scratch dir, with an unmutated battery copy beside it. Battery exit 1 (vs exit 0 baseline) = killed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const ROOT = '/fast/scratch/hyaku/tabi-r73/R73Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const PRISTINE = path.join(ROOT, 's/check-synthpinch-r73.mjs');
const BATTERY = path.join(ROOT, 's/negatives-synthpinch-r73.mjs');
const REAL = LANE + '/corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json';
const PIN = '3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4';
const NONCE = 'tabi-r73-l1-3409ab53b905';
const PRIORS = [
  'smoke1.receipt.json', 'smoke2.receipt.json', 'smoke3.receipt.json', 'smoke4.receipt.json',
  'smoke5.receipt.json', 'smoke6.receipt.json', 'smoke7.receipt.json', 'smoke8.receipt.json',
  'smoke9.receipt.json', 'degenerate-dispatch-wheel.receipt.json',
  'degenerate-set-scale.receipt.json', 'degenerate-skip-touch.receipt.json',
].map((f) => `${LANE}/.ufo/waves/round-73/controls/c1/${f}`);
const OUT = path.join(ROOT, 'results');
fs.mkdirSync(OUT, { recursive: true });

// Single-edit mutants. Every {from} must occur exactly once in the pristine counter.
const MUTANTS = [
  // R72Mut1's r72 survivors, re-targeted at r73 bytes (anchor-tolerance-2 is now frozen M19).
  { id: 'r72-in-span-lower-1', from: "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450]", to: "in: { seq: [], wheels: [5, 'in'], scale: 2, span: [1, 450]" },
  { id: 'r72-zero-span-upper-100000', from: "zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000]", to: "zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 100000]" },
  { id: 'r72-pinch-params-first-only', from: 'canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params))', to: 'canon(pinches.slice(0, 1).map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params).slice(0, 1))' },
  { id: 'r72-empty-params-open', from: "if (EMPTY.has(c.method)) return canon(c.params) === '{}';", to: 'if (EMPTY.has(c.method)) return true;' },
  { id: 'r72-leg-mark-monotonic-dropped', from: '(i === 0 || m.at >= marks[i - 1].at)', to: '(i === 0 || true)' },
  { id: 'r72-browser-getversion-once-dropped', from: " && once('Browser.getVersion')", to: '' },
  { id: 'r72-dmo-once-dropped', from: " && once('Emulation.setDeviceMetricsOverride')", to: '' },
  { id: 'r72-leg-error-message-loose', from: 'leg.cdpError.includes(want.error)', to: 'typeof leg.cdpError === \'string\'' },
  { id: 'r72-server-log-binding-some', from: 'served.every((s) => s.run === r.nonce)', to: 'served.some((s) => s.run === r.nonce)' },
  { id: 'r72-seq-first-free', from: 'events.every((e, i) => isObj(e) && e.seq === i + 1)', to: 'events.every((e, i) => isObj(e) && (i === 0 || e.seq === i + 1))' },
  { id: 'r72-event-types-deltamode-dropped', from: 'num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY)', to: 'num(e.deltaY) && num(e.clientX) && num(e.clientY)' },
  { id: 'r72-initial-scale-cdp-dropped', from: 'near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1)', to: 'near(legs[0]?.scaleBefore?.page, 1)' },
  // replay code: identifier comparison loops, browserId regex, timeline JSON shape, token shape.
  { id: 'r73-replay-timeline-type-included', from: '[e.ts, e.at]', to: '[e.ts, e.at, e.type]' },
  { id: 'r73-replay-browserid-length-loose', from: '/\\/devtools\\/browser\\/([0-9a-f-]{36})$/', to: '/\\/devtools\\/browser\\/([0-9a-f-]+)$/' },
  { id: 'r73-replay-token-priors-last-only', from: 'priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)', to: 'priors.slice(-1).every((p) => !isObj(p.host) || p.host.launchToken !== tok)' },
  { id: 'r73-replay-token-priors-first-only', from: 'priors.every((p) => !isObj(p.host) || p.host.launchToken !== tok)', to: 'priors.slice(0, 1).every((p) => !isObj(p.host) || p.host.launchToken !== tok)' },
  { id: 'r73-replay-token-shape-12-or-more', from: '/^[0-9a-f]{12}$/.test(tok)', to: '/^[0-9a-f]{12,}$/.test(tok)' },
  // marks / windows / run binding
  { id: 'r73-leg-marks-at-zero', from: 'num(m.at) && m.at > 0', to: 'num(m.at) && m.at >= 0' },
  { id: 'r73-closedat-floor-start-mark', from: 'r.closedAt >= marks[marks.length - 1].at', to: 'r.closedAt >= marks[0].at' },
  { id: 'r73-marks-name-length-only', from: "canon(markNames) === canon(['start', ...LEG_ORDER])", to: 'markNames.length === LEG_ORDER.length + 1' },
  { id: 'r73-late-after-close-sign-dropped', from: 'Number.isInteger(r.lateAfterClose) && r.lateAfterClose >= 0', to: 'Number.isInteger(r.lateAfterClose)' },
  { id: 'r73-run-window-floor-800', from: 't1 - t0 >= 8000', to: 't1 - t0 >= 800' },
  { id: 'r73-host-chromium-any-version', from: '/^Chromium \\d+\\.\\d+\\.\\d+\\.\\d+/', to: '/Chromium \\d+/' },
  { id: 'r73-devtools-stderr-dropped', from: "typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url)", to: 'true' },
  { id: 'r73-devtools-port-string-coercion', from: 'dl.port === argvPort', to: 'Number(dl.port) === argvPort' },
  { id: 'r73-scale-chain-dropped', from: " && LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page))", to: '' },
  { id: 'r73-event-window-strict-lower', from: 'return e.at >= w[0] && e.at <= w[1]', to: 'return e.at > w[0] && e.at <= w[1]' },
  { id: 'r73-wheels-deltamode-number-only', from: 'wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)', to: 'wheels.every((e) => e.ctrlKey === true && num(e.deltaMode))' },
  { id: 'r73-touch-seq-length-only', from: 'canon(nonMove) === canon(want.seq) && moveTypesOk', to: 'nonMove.length === want.seq.length && moveTypesOk' },
  { id: 'r73-teardown-curl-fixture-number', from: 'td.postKillCurl.fixture === 7', to: "typeof td.postKillCurl.fixture === 'number'" },
  { id: 'r73-pinch-count-at-least-9', from: 'pinches.length === 10', to: 'pinches.length >= 9' },
  { id: 'r73-producer-predicate-truthy', from: "r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED'", to: "r.predicate && r.synthPinchHypothesis === 'CONFIRMED'" },
  { id: 'r73-layoutmetrics-params-open', from: "if (EMPTY.has(c.method)) return canon(c.params) === '{}';", to: "if (EMPTY.has(c.method)) return c.method === 'Page.getLayoutMetrics' ? true : canon(c.params) === '{}';" },
  { id: 'r73-origin-port-optional', from: '/^http:\\/\\/127\\.0\\.0\\.1:\\d+$/', to: '/^http:\\/\\/127\\.0\\.0\\.1(:\\d+)?$/' },
  { id: 'r73-schema-prefix-r7', from: "r.schema === 'tabi-chrome-cdp-synthpinch-r73'", to: "typeof r.schema === 'string' && r.schema.startsWith('tabi-chrome-cdp-synthpinch-r7')" },
  { id: 'r73-leg-order-length-only', from: 'canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER)', to: 'legs.map((l) => l && l.name).length === LEG_ORDER.length' },
  { id: 'r73-leg-params-elapsed-nullable', from: 'num(l.elapsedMs) && l.elapsedMs >= 0', to: 'l.elapsedMs != null' },
  { id: 'r73-wheel-law-relative-tolerance', from: '-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)', to: '-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), Math.abs(lawSum(n)) * 0.02)' },
];

const src = fs.readFileSync(PRISTINE, 'utf8');
const lines = src.split('\n');
const manifest = [];
const seen = new Set();
for (const m of MUTANTS) {
  if (seen.has(m.id)) { console.error('duplicate id ' + m.id); process.exit(2); }
  seen.add(m.id);
  const n = src.split(m.from).length - 1;
  if (n !== 1) { console.error(`mutant ${m.id}: edit string occurs ${n} times (must be 1)`); process.exit(2); }
  const mutated = src.replace(m.from, m.to);
  if (mutated === src) { console.error(`mutant ${m.id}: edit does not change bytes`); process.exit(2); }
  const line = lines.findIndex((l) => l.includes(m.from)) + 1;
  manifest.push({ id: m.id, line, from: m.from, to: m.to, mutatedSha256: crypto.createHash('sha256').update(mutated).digest('hex') });
}
const pristineSha = crypto.createHash('sha256').update(src).digest('hex');
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ pristine: PRISTINE, pristineSha256: pristineSha, battery: BATTERY, real: REAL, pin: PIN, nonce: NONCE, priors: PRIORS, mutants: manifest }, null, 1));

if (process.env.DRY) { console.log('DRY', manifest.length, 'mutants ok'); process.exit(0); }
const argsFor = (dir, work) => [path.join(dir, 'negatives-synthpinch-r73.mjs'), '--real', REAL, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE,
  ...PRIORS.flatMap((p) => ['--prior', p]), '--work', work, '--json'];
const runOne = (args) => new Promise((resolve) => {
  const p = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; });
  p.stderr.on('data', (x) => { se += x; });
  const timer = setTimeout(() => { p.kill('SIGKILL'); }, 600000);
  p.on('exit', (code, sig) => { clearTimeout(timer); let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, sig, j, stderr: se.slice(-2000) }); });
});
const mk = (id, mutated) => {
  const d = path.join(ROOT, 'm', id);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'check-synthpinch-r73.mjs'), mutated);
  fs.copyFileSync(BATTERY, path.join(d, 'negatives-synthpinch-r73.mjs'));
  return d;
};

// baseline first
const baseDir = mk('zz-baseline', src);
const base = await runOne(argsFor(baseDir, path.join(ROOT, 'w', 'zz-baseline')));
const baseline = { exit: base.code, positiveOk: base.j?.positiveOk ?? null, cases: base.j?.cases ?? null, passed: base.j?.passed ?? null, allOk: base.j?.allOk ?? null, failed: base.j?.failed ?? null, coverageGap: base.j?.coverageGap ?? null };
fs.writeFileSync(path.join(OUT, 'baseline.json'), JSON.stringify(baseline, null, 1));
console.log('baseline', JSON.stringify(baseline));

const jobs = Number(process.env.JOBS || 6);
const results = new Array(MUTANTS.length);
let next = 0;
await Promise.all(Array.from({ length: jobs }, async () => {
  while (next < MUTANTS.length) {
    const i = next++; const m = MUTANTS[i];
    const mutated = src.replace(m.from, m.to);
    const d = mk(m.id, mutated);
    const work = path.join(ROOT, 'w', m.id);
    const r = await runOne(argsFor(d, work));
    const j = r.j || {};
    results[i] = {
      id: m.id, line: manifest[i].line, from: m.from, to: m.to, mutatedSha256: manifest[i].mutatedSha256,
      batteryExit: r.code, positiveOk: j.positiveOk ?? null, cases: j.cases ?? null, passed: j.passed ?? null,
      failed: j.failed ?? (r.sig ? ['<timeout ' + r.sig + '>'] : null), coverageGap: j.coverageGap ?? null,
      killed: baseline.exit === 0 && r.code === 1,
      stderrTail: r.code === 2 ? r.stderr : undefined,
    };
    fs.writeFileSync(path.join(OUT, 'm-' + String(i + 1).padStart(2, '0') + '-' + m.id + '.json'), JSON.stringify(results[i], null, 1));
    fs.rmSync(work, { recursive: true, force: true });
    console.log(String(i + 1).padStart(2) + '/' + MUTANTS.length, m.id, 'exit=' + r.code, 'pos=' + (j.positiveOk ?? '?'), 'failed=' + JSON.stringify(results[i].failed));
  }
}));
const killed = results.filter((r) => r.killed);
const survived = results.filter((r) => !r.killed);
const agg = { schema: 'tabi-r73-r73mut1-mutants', baseline, mutants: results.length, killed: killed.length, survived: survived.length, killedIds: killed.map((r) => r.id), survivedIds: survived.map((r) => r.id), results };
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(agg, null, 1));
console.log('DONE', JSON.stringify({ mutants: results.length, killed: killed.length, survived: survived.map((r) => r.id) }));
