// Harness for seat R80Mut1: run the frozen battery against each independent mutant in its own
// scratch copy and classify against the PRISTINE baseline of the SAME counter version.
// A baseline failure is inconclusive, so a mutant is killed only when a case that PASSES on the
// pristine counter now fails.
//
// Usage: node harness.mjs --counter <abs counter> --label <label> --out <abs json>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const ROOT = '/fast/scratch/hyaku/tabi-r80/R80Mut1';
const LANE = path.join(ROOT, 'lane/tabi-shokunin');
const RECEIPT = path.join(LANE, 'corpus/evidence/round80/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-80/controls/c1/prior-set.txt');
const BATTERY = path.join(ROOT, 'instruments/negatives-showpicker-r80.mjs');
const PIN = 'cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc';
const JOBS = Number(process.env.JOBS || 8);
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const arg = (n) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : null; };
const COUNTER = arg('counter');
const LABEL = arg('label') || 'unlabeled';
const OUT = arg('out') || path.join(ROOT, 'results-' + LABEL + '.json');
if (!COUNTER || !fs.existsSync(COUNTER)) { console.error('--counter required'); process.exit(2); }
const src = fs.readFileSync(COUNTER, 'utf8');
const receipt = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
const NONCE = receipt.nonce;
const FIXTURE = receipt.fixture.sha256;

const runBattery = (dir) => new Promise((resolve) => {
  const child = spawn(process.execPath, [path.join(dir, 'negatives-showpicker-r80.mjs'),
    '--lane', LANE, '--real', RECEIPT, '--expect-driver-sha256', PIN, '--expect-nonce', NONCE,
    '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET, '--work', path.join(dir, 'work'), '--json'],
    { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 600000);
  child.on('close', (code) => {
    clearTimeout(timer);
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    resolve({ code, json: j, stderr: err.slice(0, 600), stdoutHead: out.slice(0, 300) });
  });
});

const materialize = (dir, counterText) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'check-showpicker-r80.mjs'), counterText);
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r80.mjs'));
};

// ---- pristine baseline ----
const baseDir = path.join(ROOT, 'baseline-' + LABEL);
materialize(baseDir, src);
const baseRun = await runBattery(baseDir);
if (!baseRun.json || !Array.isArray(baseRun.json.results)) {
  console.error('BASELINE UNREADABLE', baseRun.stderr || baseRun.stdoutHead);
  process.exit(2);
}
const baseFail = new Set(baseRun.json.results.filter((r) => !r.ok).map((r) => r.name));
const baseOk = new Set(baseRun.json.results.filter((r) => r.ok).map((r) => r.name));
const baseline = {
  exit: baseRun.code, cases: baseRun.json.cases, failed: baseRun.json.failed,
  failingCases: [...baseFail], coverage: baseRun.json.coverage, cleanVerdict: baseRun.json.cleanVerdict,
};
fs.writeFileSync(path.join(ROOT, 'baseline-' + LABEL + '.json'), JSON.stringify({ baseline, results: baseRun.json.results }, null, 1));
process.stderr.write('baseline ' + LABEL + ': exit=' + baseRun.code + ' cases=' + baseline.cases + ' failed=' + baseline.failed + ' failing=' + JSON.stringify(baseline.failingCases) + '\n');

const runOne = async (m) => {
  const cands = m.fromVariants ? m.fromVariants : [[m.from, m.to]];
  let chosen = null;
  for (const [f, t] of cands) if (src.split(f).length - 1 === 1) { chosen = [f, t]; break; }
  if (!chosen) {
    const occ = cands.map(([f]) => src.split(f).length - 1);
    return { name: m.name, rule: m.rule, kind: m.kind, outcome: 'unapplied', occurrences: occ };
  }
  const [from, to] = chosen;
  const dir = path.join(ROOT, 'mut-' + LABEL + '-' + m.name);
  materialize(dir, src.replace(from, to));
  const r = await runBattery(dir);
  const res = { name: m.name, rule: m.rule, kind: m.kind, from, to, batteryExit: r.code };
  if (!r.json || !Array.isArray(r.json.results)) {
    res.outcome = 'crashed';
    res.detail = (r.stderr || r.stdoutHead || 'no JSON').slice(0, 400);
    fs.rmSync(dir, { recursive: true, force: true });
    return res;
  }
  const failed = new Set(r.json.results.filter((x) => !x.ok).map((x) => x.name));
  res.batteryFailed = r.json.failed;
  res.batteryCases = r.json.cases;
  res.coverage = r.json.coverage;
  res.newlyFailed = [...failed].filter((x) => baseOk.has(x));
  res.newlyPassed = [...baseFail].filter((x) => !failed.has(x));
  if (failed.has('honest')) res.outcome = 'invalid-honest-refused';
  else if (res.newlyFailed.length > 0) res.outcome = 'killed';
  else res.outcome = 'survived';
  fs.rmSync(dir, { recursive: true, force: true });
  return res;
};

const queue = MUTANTS.slice();
const results = [];
const workers = Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
  while (queue.length) {
    const m = queue.shift();
    const r = await runOne(m);
    results.push(r);
    process.stderr.write(LABEL + ' ' + r.outcome.padEnd(22) + ' ' + r.name + (r.newlyFailed && r.newlyFailed.length ? ' <- ' + r.newlyFailed.slice(0, 3).join(',') : '') + '\n');
  }
});
await Promise.all(workers);
results.sort((a, b) => a.name.localeCompare(b.name));
const by = (o) => results.filter((r) => r.outcome === o).map((r) => r.name);
const summary = {
  schema: 'tabi-r80-mut1-independent',
  label: LABEL,
  counterPath: COUNTER,
  counterSha256: sha256(src),
  batterySha256: sha256(fs.readFileSync(BATTERY)),
  laneMirror: LANE,
  receipt: RECEIPT, receiptSha256: sha256(fs.readFileSync(RECEIPT)), nonce: NONCE, driverPin: PIN, fixture: FIXTURE,
  baseline,
  mutants: results.length,
  counts: { killed: by('killed').length, survived: by('survived').length, invalid: by('invalid-honest-refused').length, crashed: by('crashed').length, unapplied: by('unapplied').length },
  killed: by('killed'), survived: by('survived'), invalid: by('invalid-honest-refused'), crashed: by('crashed'), unapplied: by('unapplied'),
  results,
};
fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
process.stdout.write(JSON.stringify({ label: LABEL, mutants: summary.mutants, counts: summary.counts, survived: summary.survived, invalid: summary.invalid, unapplied: summary.unapplied }, null, 1) + '\n');
