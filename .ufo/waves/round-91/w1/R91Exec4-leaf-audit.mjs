#!/usr/bin/env node
// Audit: every mutant must differ from the base receipt in exactly one leaf path,
// and that leaf must live inside exactly one leg object.
import fs from 'node:fs';
import path from 'node:path';

const SCRATCH = '/fast/scratch/hyaku/tabi-r91/R91Exec4';
const base = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'receipt.base.json'), 'utf8'));
const dir = path.join(SCRATCH, 'mutants');
const res = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'results.json'), 'utf8'));
const diffs = [];
const leaves = (a, b, p, out) => {
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') {
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push({ path: p, before: a, after: b });
    return;
  }
  if (Array.isArray(a) !== Array.isArray(b)) { out.push({ path: p, before: a, after: b }); return; }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) leaves(a[k], b[k], p ? p + '.' + k : k, out);
};
for (const m of res.results) {
  const mut = JSON.parse(fs.readFileSync(path.join(dir, m.id + '.json'), 'utf8'));
  const out = [];
  leaves(base, mut, '', out);
  const file = path.join(dir, m.id + '.json');
  diffs.push({
    id: m.id,
    leafCount: out.length,
    leaves: out.map((d) => ({ path: d.path, before: d.before, after: d.after })),
    legsTouched: [...new Set(out.map((d) => (d.path.match(/^legs\.(\d+)\./) || [])[1]).filter((x) => x !== undefined))].map(Number),
    exit: m.exit,
    findingIds: m.findingIds,
  });
}
const bad = diffs.filter((d) => d.leafCount !== 1 || d.legsTouched.length !== 1);
fs.writeFileSync(path.join(SCRATCH, 'leaf-audit.json'), JSON.stringify({ diffs, bad }, null, 1));
process.stdout.write(JSON.stringify({ mutants: diffs.length, singleLeafSingleLeg: diffs.length - bad.length, bad }, null, 1) + '\n');
process.exitCode = bad.length ? 1 : 0;
