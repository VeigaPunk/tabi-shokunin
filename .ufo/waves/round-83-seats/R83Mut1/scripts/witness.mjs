#!/usr/bin/env node
// Concrete blind-spot witnesses: for each named survivor, mutate the scored receipt in the
// dimension the dropped conjunct used to guard, then run the PRISTINE counter and the MUTANT
// counter on it. pristine=finding & mutant=clean proves the battery has no case that forces the
// weakened rule; mutant=finding proves the behavior is still caught by a sibling check (redundant
// conjunct, not a behavioral escape).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r83/R83Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r83.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round83/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-83/controls/c1/prior-set.txt');
const rec = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(COUNTER, 'utf8');
const realSha = sha256(fs.readFileSync(REAL));
const grab = (f) => {
  const s = fs.readFileSync(f, 'utf8');
  const a = s.indexOf('const MUTANTS = [');
  const b = s.indexOf('\n];', a);
  return Function('return ' + s.slice(a + 'const MUTANTS = '.length, b + 2))();
};
const MUTANTS = new Map(grab(path.join(S, 'run-mutants.mjs')).map(([name, from, to]) => [name, { from, to }]));
const sweep = JSON.parse(fs.readFileSync(path.join(S, 'sweep-results.json'), 'utf8'));
const survivorNames = sweep.results.filter((r) => r.outcome === 'survived').map((r) => r.name);
const specMod = await import(path.join(S, 'witness-spec.mjs'));
const specs = new Map(specMod.default.map((w) => [w.name, w]));

const runCounter = (counterPath, receiptPath) => {
  const r = spawnSync(process.execPath, [counterPath,
    '--lane', LANE, '--receipt', receiptPath,
    '--expect-driver-sha256', rec.driverSha256,
    '--expect-nonce', rec.nonce,
    '--expect-fixture-sha256', rec.fixture.sha256,
    '--prior-set', PRIOR_SET,
    '--tree-exempt-sha256', realSha,
    '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, findings: j && Array.isArray(j.findings) ? j.findings.map((f) => f.id) : null, verdict: j && j.verdict, stderr: (r.stderr || '').slice(0, 400) };
};

const results = [];
for (const name of survivorNames) {
  const spec = specs.get(name);
  const m = MUTANTS.get(name);
  if (!spec) { results.push({ name, outcome: 'no-witness-spec' }); continue; }
  if (!m) { results.push({ name, outcome: 'missing-mutant' }); continue; }
  const r = JSON.parse(JSON.stringify(rec));
  spec.mutate(r);
  const receiptPath = path.join(S, 'witness-receipts', name + '.json');
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, JSON.stringify(r));
  const dir = path.join(S, 'witness-counters', name);
  fs.mkdirSync(dir, { recursive: true });
  const mutantPath = path.join(dir, 'check-showpicker-r83.mjs');
  fs.writeFileSync(mutantPath, src.replace(m.from, m.to));
  const pristine = runCounter(COUNTER, receiptPath);
  const mutant = runCounter(mutantPath, receiptPath);
  const classification = pristine.status === 1 && mutant.status === 0 ? 'behavioral-escape'
    : pristine.status === 1 && mutant.status === 1 ? 'redundant-conjunct'
      : 'unexpected';
  results.push({ name, mutate: spec.describe || spec.mutate.toString().slice(0, 300), classification, pristine, mutant });
}
fs.writeFileSync(path.join(S, 'witness-results.json'), JSON.stringify({ witnesses: results.length, behavioralEscape: results.filter((r) => r.classification === 'behavioral-escape').length, redundant: results.filter((r) => r.classification === 'redundant-conjunct').length, unexpected: results.filter((r) => r.classification === 'unexpected').length, missing: results.filter((r) => r.outcome).length, results }, null, 1));
console.log(JSON.stringify({ witnesses: results.length, behavioralEscape: results.filter((r) => r.classification === 'behavioral-escape').map((r) => r.name), redundant: results.filter((r) => r.classification === 'redundant-conjunct').map((r) => [r.name, r.mutant.findings]), unexpected: results.filter((r) => r.classification === 'unexpected').map((r) => [r.name, r.pristine.status, r.mutant.status]), missing: results.filter((r) => r.outcome).map((r) => [r.name, r.outcome]) }, null, 1));
