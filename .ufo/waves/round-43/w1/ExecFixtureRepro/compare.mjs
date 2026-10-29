#!/usr/bin/env node
// compare.mjs — structural receipt comparator for ExecFixtureRepro.
// Diffs two JSON receipts by JSON path, and reports which paths differ.
import fs from 'node:fs';

function flat(o, prefix = '', out = {}) {
  if (o === null || typeof o !== 'object') { out[prefix] = JSON.stringify(o); return out; }
  if (Array.isArray(o)) { out[prefix] = JSON.stringify(o); return out; }
  for (const [k, v] of Object.entries(o)) flat(v, prefix ? `${prefix}.${k}` : k, out);
  return out;
}

const [, , aPath, bPath, label] = process.argv;
const a = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const b = JSON.parse(fs.readFileSync(bPath, 'utf8'));
const fa = flat(a), fb = flat(b);
const keys = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].sort();
const diffs = [];
for (const k of keys) {
  if (fa[k] !== fb[k]) diffs.push({ path: k, a: fa[k] ?? '<ABSENT>', b: fb[k] ?? '<ABSENT>' });
}
const nonRevDiffs = diffs.filter((d) => d.path !== 'fixtureRev');
console.log(JSON.stringify({
  label,
  a: aPath, b: bPath,
  totalPathsCompared: keys.length,
  diffPaths: diffs,
  nonFixtureRevDiffCount: nonRevDiffs.length,
  nonFixtureRevDiffs: nonRevDiffs,
  identicalIgnoringFixtureRev: nonRevDiffs.length === 0,
  verdict: nonRevDiffs.length === 0 ? 'DETERMINISTIC' : 'NONDETERMINISTIC',
}, null, 1));
process.exit(nonRevDiffs.length === 0 ? 0 : 1);
