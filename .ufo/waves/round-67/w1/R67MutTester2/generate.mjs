// generate.mjs — R67MutTester2 flip-sweep generator (scratch tool, not committed).
// Reads the r66 adjudicated delta TSV and writes, for every `line` row, two
// one-row mutants: a full byte-preserving copy of the file with that row's
// disposition replaced by each of the two other in-vocabulary dispositions
// (vocabulary: no-tabi-ground, overlap-declared, contested-open).
import fs from 'node:fs';
import path from 'node:path';

const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv';
const OUT = '/fast/scratch/hyaku/tabi-r67/R67MutTester2/mutants';
const VOCAB = ['no-tabi-ground', 'overlap-declared', 'contested-open'];

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split('\n');
if (lines[0] !== 'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead') {
  console.error('FATAL: unexpected header line: ' + JSON.stringify(lines[0]));
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const seen = new Map();
const manifest = [];
let idx = 0;
for (let i = 1; i < lines.length; i++) {
  const f = lines[i].split('\t');
  if (f.length !== 9 || f[0] !== 'line') continue;
  idx++;
  const key = `${f[1]}:${f[2]}`;            // lane + path cell (path cell carries :line)
  seen.set(key, (seen.get(key) || 0) + 1);
  if (!VOCAB.includes(f[7])) { console.error(`FATAL: row ${i} disposition out of vocabulary: ${f[7]}`); process.exit(2); }
  for (const to of VOCAB.filter((d) => d !== f[7])) {
    const nf = [...f];
    nf[7] = to;
    const mut = [...lines];
    mut[i] = nf.join('\t');
    const name = `mut-${String(idx).padStart(3, '0')}-${to}.tsv`;
    fs.writeFileSync(path.join(OUT, name), mut.join('\n'), 'utf8');
    manifest.push({ mutant: name, key, from: f[7], to, tsvLine: i + 1 });
  }
}
const dups = [...seen.entries()].filter(([, n]) => n > 1);
fs.writeFileSync('/fast/scratch/hyaku/tabi-r67/R67MutTester2/manifest.json', JSON.stringify(manifest, null, 1), 'utf8');
console.log(JSON.stringify({ lineRows: idx, mutants: manifest.length, duplicateKeys: dups, out: OUT }, null, 1));
