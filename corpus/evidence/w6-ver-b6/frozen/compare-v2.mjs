#!/usr/bin/env node
// TABI lane B6-1 — mechanical byte comparison across identical-cell runs.
// usage: node compare-v2.mjs <root> <mode> <runA> <runB>
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const [root, mode, runA, runB] = process.argv.slice(2);
const tags = mode === 'chain' ? ['step-1-index', 'post-307', 'step-2-landed'] : ['step-1-index'];
const sha = (b) => createHash('sha256').update(b).digest('hex');
const load = (run, tag) => {
  const png = readFileSync(join(root, run, `${tag}.png`));
  const shape = readFileSync(join(root, run, `${tag}.shape.txt`));
  const dom = JSON.parse(readFileSync(join(root, run, `${tag}.domsnapshot.json`), 'utf8'));
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
const push = (comp, artifact, a, b) => rows.push(`${comp}\t${artifact}\t${a === b ? 'IDENTICAL' : 'DIFFER'}\t${a.slice(0, 16)}\t${b.slice(0, 16)}`);
const A = {}, B = {};
for (const t of tags) { A[t] = load(runA, t); B[t] = load(runB, t); }
for (const t of tags) for (const art of ['png', 'shape', 'struct']) push(`${runA}-vs-${runB}`, `${t}.${art}`, A[t][art], B[t][art]);
if (mode === 'chain') push(`within-${runA}`, 'index-vs-post307.png', A['step-1-index'].png, A['post-307'].png);
const out = rows.join('\n') + '\n';
writeFileSync(join(root, `compare-${mode}.tsv`), out);
const identical = rows.filter((r) => r.includes('\tIDENTICAL\t')).length;
console.log(out);
console.log(`mode=${mode} rows=${rows.length} identical=${identical} differ=${rows.length - identical}`);