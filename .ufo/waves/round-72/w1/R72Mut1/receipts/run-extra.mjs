#!/usr/bin/env node
// R72Mut1 batch 2: 11 further single-edit semantic mutants (not among the 12 frozen).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r72/R72Mut1';
const SRC = path.join(S, 's', 'check-synthpinch-r72.mjs');
const BATTERY = path.join(S, 's', 'negatives-synthpinch-r72.mjs');
const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json';
const PIN = 'd007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877';
const JOBS = Number(process.env.JOBS || 8);
const counterSrc = fs.readFileSync(SRC, 'utf8');
const batterySrc = fs.readFileSync(BATTERY, 'utf8');
const baseline = JSON.parse(fs.readFileSync(path.join(S, 'base', 'baseline.json'), 'utf8'));
const baseFailed = new Set(baseline.failed);
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex');

const M = [
  ['zero-span-upper-100000', "zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000], tm: null, error: 'no-response-4000ms' },",
    "zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 100000], tm: null, error: 'no-response-4000ms' },", 'leg-zero-timing'],
  ['server-log-binding-some', 'served.length >= 1 && served.every((s) => s.run === r.nonce)', 'served.length >= 1 && served.some((s) => s.run === r.nonce)', 'server-log-binding'],
  ['seq-first-free', 'events.every((e, i) => isObj(e) && e.seq === i + 1)', 'events.every((e, i) => isObj(e) && (i === 0 || e.seq === i + 1))', 'seq-monotonic'],
  ['event-leg-domain-string', 'events.every((e) => isObj(e) && LEG_ORDER.includes(e.leg))', "events.every((e) => isObj(e) && typeof e.leg === 'string')", 'event-leg-domain'],
  ['pinch-call-count-at-least', "check('pinch-call-count', pinches.length === 10,", "check('pinch-call-count', pinches.length >= 10,", 'pinch-call-count'],
  ['marks-name-sequence-dropped', "canon(markNames) === canon(['start', ...LEG_ORDER])", "markNames[0] === 'start' && marks.length === LEG_ORDER.length + 1", 'leg-marks-fabricated-name'],
  ['allowlist-eval-extra-keys', "if (c.method === 'Runtime.evaluate') return canon(c.params) === canon({ expression: c.params.expression, returnByValue: true }) && EXPRS.has(c.params.expression);",
    "if (c.method === 'Runtime.evaluate') return c.params.returnByValue === true && EXPRS.has(c.params.expression);", 'allowlist-eval-extra-param'],
  ['allowlist-dmo-extra-keys', "if (c.method === 'Emulation.setDeviceMetricsOverride') return canon(c.params) === canon({ width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });",
    "if (c.method === 'Emulation.setDeviceMetricsOverride') return c.params.width === VIEWPORT.width && c.params.height === VIEWPORT.height && c.params.deviceScaleFactor === 1 && c.params.mobile === false;", 'allowlist-dmo-scale-param'],
  ['nonce-page-prefix', "typeof r.nonce === 'string' && r.nonceOnPage === r.nonce",
    "typeof r.nonce === 'string' && typeof r.nonceOnPage === 'string' && r.nonceOnPage.startsWith('tabi-r72-')", 'nonce-on-page'],
  ['event-types-deltamode-dropped', "(e.type === 'wheel' ? num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY) : true)",
    "(e.type === 'wheel' ? num(e.deltaY) && num(e.clientX) && num(e.clientY) : true)", '(none: no wheel with a string deltaMode)'],
  ['initial-scale-cdp-dropped', 'near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1)', 'near(legs[0]?.scaleBefore?.page, 1)', 'initial-scale'],
].map(([id, from, to, target]) => ({ id, from, to, target }));

const problems = [];
for (const m of M) {
  const n = counterSrc.split(m.from).length - 1;
  if (n !== 1) problems.push(`${m.id}: from occurs ${n}x`);
  if (m.from === m.to) problems.push(`${m.id}: no-op`);
}
if (problems.length) { console.error(JSON.stringify({ error: 'mutant-spec', problems }, null, 1)); process.exit(2); }

const mk = (m, i) => {
  const dir = path.join(S, 'e' + String(i).padStart(2, '0') + '-' + m.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'work'), { recursive: true });
  const src = counterSrc.replace(m.from, m.to);
  if (src === counterSrc) throw new Error(m.id + ' did not change source');
  fs.writeFileSync(path.join(dir, 'check-synthpinch-r72.mjs'), src);
  fs.writeFileSync(path.join(dir, 'negatives-synthpinch-r72.mjs'), batterySrc);
  return dir;
};
const run = (dir) => new Promise((resolve) => {
  const p = spawn(process.execPath, [path.join(dir, 'negatives-synthpinch-r72.mjs'), '--real', REAL,
    '--expect-driver-sha256', PIN, '--work', path.join(dir, 'work'), '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '', se = '';
  p.stdout.on('data', (x) => { so += x; });
  p.stderr.on('data', (x) => { se += x; });
  p.on('exit', (code) => { let j = null; try { j = JSON.parse(so); } catch {} resolve({ code, j, stderr: se.slice(0, 400) }); });
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
    results[i] = {
      idx: i, mutant: m.id, from: m.from, to: m.to, counterLine: line, targetCase: m.target,
      fromCount: counterSrc.split(m.from).length - 1, mutatedSha256: hash(mutated),
      batteryExit: r.code, positiveOk: r.j ? r.j.positiveOk : null, passed: r.j ? r.j.passed : null,
      cases: r.j ? r.j.cases : null, failedCases: failed, addedFailed: added,
      removedBaselineFailed: Array.isArray(failed) ? [...baseFailed].filter((c) => !failed.includes(c)) : null,
      killed: Array.isArray(added) && added.length > 0, stderr: r.stderr || null,
    };
    fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(results[i], null, 1));
  }
}));
const summary = {
  schema: 'tabi-r72-r72mut1-semantic-batch2',
  baseline: { failed: [...baseFailed], passed: baseline.passed, cases: baseline.cases, exit: 1 },
  counter: { path: SRC, sha256: hash(counterSrc) }, battery: { path: BATTERY, sha256: hash(batterySrc) },
  mutants: M.length, killed: results.filter((r) => r.killed).length,
  survivors: results.filter((r) => !r.killed).map((r) => r.mutant), results,
};
fs.writeFileSync(path.join(S, 'results-extra.json'), JSON.stringify(summary, null, 1));
console.log(JSON.stringify({ mutants: summary.mutants, killed: summary.killed, survivors: summary.survivors }, null, 1));
