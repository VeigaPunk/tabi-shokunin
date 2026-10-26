#!/usr/bin/env node
// AdjKaidoku8 — re-runnable check of the 16 screen rows in screen.tsv.
// Reads each cited sibling line with read-only `git show <pin>:<path>` from the lane checkout's
// sibling repo, asserts the quote is a verbatim substring and passes the counter's goodQuote shape,
// and asserts every same-surface surface is a verified map-row surface for the same sibling.
// Usage: node verify-quotes.mjs <screen.tsv> [fleet=/home/vgpnk/Projects/shokunin]
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const [screenPath, fleet = '/home/vgpnk/Projects/shokunin'] = process.argv.slice(2);
if (!screenPath) { console.error('usage: node verify-quotes.mjs <screen.tsv> [fleet]'); process.exit(2); }
const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const good = (q) => words(q).length >= 4 && words(q).length <= 25 && q.replace(/\s/g, '').length >= 20;
const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const map = readFileSync(`${fleet}/tabi-shokunin/corpus/adjacency.tsv`, 'utf8').split('\n').filter(Boolean).slice(1)
  .map((l) => l.split('\t')).map((f) => `${f[0].trim()} ${f[1].trim()}`);
const rows = readFileSync(screenPath, 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t'));
let ok = 0; const fails = [];
for (const [ref, reason, surface, quote] of rows) {
  const m = refRe.exec(ref);
  if (!m) { fails.push(`${ref}: bad ref`); continue; }
  const repo = `${fleet}/${m[1]}-shokunin`;
  const r = spawnSync('git', ['-C', repo, 'show', `${m[2]}:${m[3]}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) { fails.push(`${ref}: git show exit ${r.status}`); continue; }
  const text = (r.stdout.split('\n')[Number(m[4]) - 1] || '').replace(/\r$/, '');
  if (!text.includes(quote)) { fails.push(`${ref}: quote not a verbatim substring`); continue; }
  if (!good(quote)) { fails.push(`${ref}: quote shape`); continue; }
  if (reason === 'same-surface' ? !map.includes(`${surface} ${m[1]}`) : surface !== '-') { fails.push(`${ref}: surface rule`); continue; }
  ok += 1;
}
console.log(`VERIFY_QUOTES rows=${rows.length} ok=${ok} fails=${fails.length}`);
for (const f of fails) console.log(`fail ${f}`);
process.exit(fails.length ? 1 : 0);
