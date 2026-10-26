// Analyzer: sessions.jsonl -> sessions.tsv + summary on stdout.
// env: R35_OUT (jsonl), R35_TSV
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = process.env.R35_OUT;
const TSV = process.env.R35_TSV;
const rows = readFileSync(OUT, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const ids = Object.keys(rows[0].predicates || {}).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
const head = ['tag', 'k', 'wallMs', 'sid', 'browserVersion', 'geckodriverVersion', 'shotSha256', 'shotBytes', ...ids.map((i) => `${i}`), 'failing'];
const lines = [head.join('\t')];
for (const r of rows) {
  if (r.error) { lines.push([r.tag, r.k, 'ERROR', '', '', '', '', '', ...ids.map(() => ''), r.error.replace(/\s+/g, ' ').slice(0, 200)].join('\t')); continue; }
  lines.push([r.tag, r.k, r.wallMs, r.sid, r.browserVersion, r.geckodriverVersion, r.shotSha, r.shotBytes,
    ...ids.map((i) => (r.predicates[i] === null ? 'hold' : `FAIL:${r.predicates[i]}`)), r.failing.join(';') || '-'].join('\t'));
}
writeFileSync(TSV, `${lines.join('\n')}\n`);

const good = rows.filter((r) => !r.error);
const shas = [...new Set(good.map((r) => r.shotSha))];
const sizes = [...new Set(good.map((r) => r.shotBytes))];
const predsChanged = ids.filter((i) => new Set(good.map((r) => String(r.predicates[i]))).size !== 1);
console.log(`sessions=${rows.length} ok=${good.length} errors=${rows.length - good.length}`);
console.log(`distinct firstShotSha256=${shas.length} ${JSON.stringify(shas)}`);
console.log(`distinct shotBytes=${sizes.length} ${JSON.stringify(sizes)}`);
console.log(`distinct browserVersion=${JSON.stringify([...new Set(good.map((r) => r.browserVersion))])} geckodriverVersion=${JSON.stringify([...new Set(good.map((r) => r.geckodriverVersion))])}`);
console.log(`predicate results that vary across sessions: ${predsChanged.length ? predsChanged.join(',') : 'none'}`);
for (const i of ids) {
  const vals = [...new Set(good.map((r) => (r.predicates[i] === null ? 'hold' : String(r.predicates[i]).slice(0, 70))))];
  if (vals.length !== 1 || vals[0] !== 'hold') console.log(`  ${i}: ${JSON.stringify(vals)}`);
}
const walls = good.map((r) => r.wallMs).sort((a, b) => a - b);
console.log(`wallMs min=${walls[0]} median=${walls[Math.floor(walls.length / 2)]} max=${walls[walls.length - 1]}`);
for (const t of [...new Set(good.map((r) => r.tag))]) {
  const g = good.filter((r) => r.tag === t);
  const s = [...new Set(g.map((r) => r.shotSha))];
  const w = g.map((r) => r.wallMs);
  console.log(`  tag=${t} n=${g.length} shotShas=${JSON.stringify(s)} wallMs=${JSON.stringify(w)}`);
}
