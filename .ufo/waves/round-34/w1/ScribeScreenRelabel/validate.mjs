#!/usr/bin/env node
// Validate corpus/adjacency-screen.tsv column rules against sibling pins (read-only).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FILE = process.argv[2];
const FLEET = process.argv[3];
const HEADER = ['sibling_ref', 'reason', 'surface', 'quote', 'note'];
const REASONS = new Set(['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared']);
const bad = (s) => /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/.test(s);
const lines = readFileSync(FILE, 'utf8').split('\n');
if (lines[lines.length - 1] === '') lines.pop();
let fail = 0;
const say = (n, msg) => { fail++; console.log(`BAD row=${n} ${msg}`); };
if (lines[0] !== HEADER.join('\t')) { fail++; console.log('BAD header'); }
const cache = new Map();
const fileAt = (repo, rev, path) => {
  const k = `${repo}@${rev}:${path}`;
  if (!cache.has(k)) cache.set(k, execFileSync('git', ['-C', repo, 'cat-file', 'blob', `${rev}:${path}`], { encoding: 'utf8' }).split('\n'));
  return cache.get(k);
};
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const f = lines[i].split('\t');
  const n = i + 1;
  if (f.length !== 5) { say(n, `columns=${f.length}`); continue; }
  const [ref, reason, surface, quote, note] = f;
  const m = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):([^:]+):(\d+)$/.exec(ref);
  if (!m) { say(n, `ref=${ref}`); continue; }
  if (!REASONS.has(reason)) say(n, `reason=${reason}`);
  if (reason === 'same-surface' ? (surface === '-' || !/^[a-z0-9-]+$/.test(surface)) : surface !== '-') say(n, `surface=${surface} reason=${reason}`);
  for (const [col, val] of [['sibling_ref', ref], ['surface', surface], ['quote', quote], ['note', note]]) if (bad(val)) say(n, `control-char in ${col}`);
  const repo = `${FLEET}/${m[1]}-shokunin`;
  const line = fileAt(repo, m[2], m[3])[Number(m[4]) - 1];
  if (line === undefined) { say(n, 'line absent'); continue; }
  if (!line.includes(quote)) say(n, 'quote not verbatim on cited line');
  const words = quote.trim().split(/\s+/).filter(Boolean).length;
  const ns = quote.replace(/\s/g, '').length;
  if (words < 4 || words > 25) say(n, `quote words=${words}`);
  if (ns < 20) say(n, `quote nonspace=${ns}`);
  rows.push({ n, ref, reason, surface, words, ns });
}
const suppress = (r) => r;
const summary = { rows: lines.length - 1, bad: fail, sameSurface: rows.filter((r) => r.reason === 'same-surface').length, reasons: rows.reduce((a, r) => (a[r.reason] = (a[r.reason] || 0) + 1, a), {}) };
console.log(JSON.stringify(summary));
for (const r of rows.filter((r) => /PROVINCE\.md:(396|411|422|440)$/.test(r.ref))) console.log(`TOUCHED ${r.ref} reason=${r.reason} surface=${r.surface} words=${r.words} nonspace=${r.ns}`);
process.exit(fail === 0 ? 0 : 1);
