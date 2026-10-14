#!/usr/bin/env node
// TABI lane T4-1 — mechanical byte comparison across runs (never hand-transcribe hashes).
// usage: node compare.mjs <root> <runA> <runB> [<runC> ...]
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [root, runA, ...others] = process.argv.slice(2);
const tags = ['step-1-index', 'step-1-index-idem', 'step-2-async-early', 'step-2-async-settled', 'step-3-async-filled', 'step-4-confirm'];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const load = (run, tag) => {
  const png = readFileSync(join(root, run, `${tag}.png`));
  const shape = readFileSync(join(root, run, `${tag}.shape.txt`));
  const dom = JSON.parse(readFileSync(join(root, run, `${tag}.domsnapshot.json`), 'utf8'));
  // struct re-derivation mirrors net-journey.mjs deriveShape (depth:name)
  const doc = dom.documents[0];
  const strings = dom.strings;
  const nodes = doc.nodes;
  const str = (i) => (typeof i === 'number' && i >= 0 && i < strings.length ? strings[i] : '');
  const n = nodes.nodeName.length;
  const depth = new Array(n).fill(0);
  for (let i = 0; i < n; i++) { const p = nodes.parentIndex[i]; if (p >= 0) depth[i] = depth[p] + 1; }
  const struct = [];
  for (let i = 0; i < n; i++) struct.push(`${depth[i]}:${str(nodes.nodeName[i])}`);
  return { png: sha(png), shape: sha(shape), struct: sha(struct.join('\n') + '\n') };
};

const rows = [];
const push = (comp, artifact, a, b) => {
  rows.push(`${comp}\t${artifact}\t${a === b ? 'IDENTICAL' : 'DIFFER'}\t${a.slice(0, 16)}\t${b.slice(0, 16)}`);
};

const base = {};
for (const tag of tags) base[tag] = load(runA, tag);
for (const run of others) {
  for (const tag of tags) {
    const b = load(run, tag);
    for (const art of ['png', 'shape', 'struct']) push(`${runA}-vs-${run}`, `${tag}.${art}`, base[tag][art], b[art]);
  }
}

// within-run checks (every run): idempotence + expected action deltas
for (const run of [runA, ...others]) {
  const b = {};
  for (const tag of tags) b[tag] = load(run, tag);
  push(`within-${run}`, 'index-vs-index-idem.png', b['step-1-index'].png, b['step-1-index-idem'].png);
  push(`within-${run}`, 'index-vs-index-idem.shape', b['step-1-index'].shape, b['step-1-index-idem'].shape);
  push(`within-${run}`, 'early-vs-settled.png', b['step-2-async-early'].png, b['step-2-async-settled'].png);
  push(`within-${run}`, 'early-vs-settled.shape', b['step-2-async-early'].shape, b['step-2-async-settled'].shape);
  push(`within-${run}`, 'settled-vs-filled.png', b['step-2-async-settled'].png, b['step-3-async-filled'].png);
  push(`within-${run}`, 'settled-vs-filled.shape', b['step-2-async-settled'].shape, b['step-3-async-filled'].shape);
}

const out = rows.join('\n') + '\n';
writeFileSync(join(root, 'compare.tsv'), out);
const identical = rows.filter((r) => r.includes('\tIDENTICAL\t')).length;
console.log(out);
console.log(`rows=${rows.length} identical=${identical} differ=${rows.length - identical}`);