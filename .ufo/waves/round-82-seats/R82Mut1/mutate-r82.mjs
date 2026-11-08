// Independent mutation harness for scripts/check-showpicker-r82.mjs (tabi round 82, C1).
// Copies the counter AND the frozen battery into a per-mutant scratch dir, runs the battery
// there, and classifies survived / killed / crashed / unapplied. Never writes in the lane.
//
// usage: node mutate-r82.mjs [--check] [--jobs N] [--only name]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r82.mjs');
const BATTERY = path.join(LANE, 'scripts/negatives-showpicker-r82.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round82/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-82/controls/c1/prior-set.txt');
const PIN = '2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1';
const NONCE = 'tabi-r82-scored1';
const WORK = '/fast/scratch/hyaku/tabi-r82/R82Mut1';
const SEAT = path.join(LANE, '.ufo/waves/round-82-seats/R82Mut1');
const FIXTURE = JSON.parse(fs.readFileSync(REAL, 'utf8')).fixture.sha256;
const REAL_SHA = crypto.createHash('sha256').update(fs.readFileSync(REAL)).digest('hex');

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const checkOnly = argv.includes('--check');
const jobs = Number(opt('jobs') || 12);
const only = opt('only');
const src = fs.readFileSync(COUNTER, 'utf8');

const counterArgs = (receipt, counterPath) => [counterPath, '--lane', LANE, '--receipt', receipt,
  '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE,
  '--prior-set', PRIOR_SET, '--tree-exempt-sha256', REAL_SHA, '--json'];

const run = (args, timeout = 900000) => new Promise((resolve) => {
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, timeout);
  child.on('close', (code) => {
    clearTimeout(timer);
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    resolve({ code, json: j, stdoutHead: out.slice(0, 400), stderrHead: (err || out).slice(0, 600) });
  });
});

const counts = MUTANTS.map(([name, from]) => [name, src.split(from).length - 1]);
if (checkOnly) {
  const bad = counts.filter(([, n]) => n !== 1);
  console.log(JSON.stringify({ table: MUTANTS.length, applied_once: counts.filter(([, n]) => n === 1).length,
    not_unique: bad.map(([n, c]) => ({ name: n, occurrences: c })) }, null, 1));
  process.exit(bad.length ? 1 : 0);
}
const dup = counts.filter(([, n]) => n !== 1);
if (dup.length) { console.error('non-unique anchors: ' + JSON.stringify(dup)); process.exit(2); }
if (new Set(MUTANTS.map((m) => m[0])).size !== MUTANTS.length) { console.error('duplicate mutant names'); process.exit(2); }

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(SEAT, { recursive: true });
const batterySrc = fs.readFileSync(BATTERY, 'utf8');
const pristineSha = crypto.createHash('sha256').update(src).digest('hex');
const batterySha = crypto.createHash('sha256').update(batterySrc).digest('hex');

const queue = MUTANTS.filter(([name]) => !only || name === only);
const results = [];
const runOne = async ([name, from, to]) => {
  const dir = path.join(WORK, 'mut-' + name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const mutantPath = path.join(dir, 'check-showpicker-r82.mjs');
  const mutantSrc = src.replace(from, to);
  fs.writeFileSync(mutantPath, mutantSrc);
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r82.mjs'));
  const mutSha = crypto.createHash('sha256').update(mutantSrc).digest('hex');
  const direct = await run(counterArgs(REAL, mutantPath), 60000);
  const bat = await run([path.join(dir, 'negatives-showpicker-r82.mjs'), '--lane', LANE, '--real', REAL,
    '--expect-driver-sha256', PIN, '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE,
    '--prior-set', PRIOR_SET, '--work', path.join(dir, 'work'), '--json'], 900000);
  const mutates = mutantSrc !== src;
  const runs = direct.json !== null && direct.json.checks !== undefined;
  const batOk = bat.code === 0 && bat.json !== null && bat.json.failed === 0;
  let outcome;
  if (!mutates) outcome = 'unapplied';
  else if (!runs) outcome = 'crashed';
  else if (batOk) outcome = 'survived';
  else outcome = 'killed';
  const rec = {
    mutant: name, outcome, from, to, mutantSha256: mutSha,
    directExit: direct.code, directVerdict: direct.json ? direct.json.verdict : null,
    directCheckCount: direct.json ? direct.json.checkCount : null,
    batteryExit: bat.code,
    batteryCases: bat.json ? bat.json.cases : null,
    batteryFailed: bat.json ? bat.json.failed : null,
    batteryUncovered: bat.json && bat.json.coverage ? bat.json.coverage.uncovered : null,
    firstFailures: bat.json && bat.json.results ? bat.json.results.slice(0, 6).map((x) => ({ case: x.case, expect: x.expect, detail: x.detail })) : null,
    stderrHead: runs ? null : direct.stderrHead,
  };
  fs.rmSync(dir, { recursive: true, force: true });
  return rec;
};

const workers = Array.from({ length: Math.min(jobs, queue.length) }, async () => {
  while (queue.length) {
    const item = queue.shift();
    results.push(await runOne(item));
  }
});
await Promise.all(workers);
results.sort((a, b) => a.mutant.localeCompare(b.mutant));
const summary = {
  schema: 'tabi-r82-r82mut1-mutants',
  lane: LANE, counter: 'scripts/check-showpicker-r82.mjs', battery: 'scripts/negatives-showpicker-r82.mjs',
  counterSha256Prerun: pristineSha, batterySha256: batterySha,
  receipt: 'corpus/evidence/round82/chromium-showpicker/receipt.json', receiptSha256: REAL_SHA,
  pins: { expectDriverSha256: PIN, expectNonce: NONCE, expectFixtureSha256: FIXTURE },
  baseline: 'battery exits 0, 70 cases, failed 0, coverage 64/64 uncovered []',
  mutants: results.length,
  survived: results.filter((r) => r.outcome === 'survived').length,
  killed: results.filter((r) => r.outcome === 'killed').length,
  crashed: results.filter((r) => r.outcome === 'crashed').length,
  unapplied: results.filter((r) => r.outcome === 'unapplied').length,
  survivors: results.filter((r) => r.outcome === 'survived').map((r) => r.mutant),
  results,
};
fs.writeFileSync(path.join(SEAT, 'mutants-r82.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify({ mutants: summary.mutants, survived: summary.survived, killed: summary.killed,
  crashed: summary.crashed, unapplied: summary.unapplied, survivors: summary.survivors }, null, 1));
