// Seat receipt: verify every screen quote (dash columns, whole ledger) is a
// verbatim substring of the sibling line it cites, at the pin named in the ref.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const FILE = process.argv[2];
const rows = readFileSync(FILE, 'utf8').split('\n').filter(Boolean).slice(1);
const bad = [];
for (const r of rows) {
  const c = r.split('\t');
  if (c.length !== 5) { bad.push(['columns', c.length, r.slice(0, 60)]); continue; }
  const [ref, reason, surface, quote] = c;
  const m = /^([a-z]+)-shokunin@([0-9a-f]{40}):([^:]+):(\d+)$/.exec(ref);
  if (!m) { bad.push(['badref', ref]); continue; }
  const [, lane, pin, path, line] = m;
  const blob = execFileSync('git', ['-C', `/home/vgpnk/Projects/shokunin/${lane}-shokunin`, 'show', `${pin}:${path}`], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const text = blob.split('\n')[Number(line) - 1] ?? '';
  if (!text.includes(quote)) bad.push(['quote_absent', lane, path, line, quote.slice(0, 50)]);
}
console.log(JSON.stringify({ rows: rows.length, bad }, null, 1));
process.exit(bad.length ? 1 : 0);
