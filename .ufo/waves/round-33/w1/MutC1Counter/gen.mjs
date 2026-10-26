// gen.mjs — build single-point mutants of the pristine frozen counter.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(HERE, 'pristine/c1-adjacency-sweep.mjs'), 'utf8');
const pairs = JSON.parse(readFileSync(join(HERE, 'pairs.json'), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const manifest = [];
for (const [tag, p] of Object.entries(pairs)) {
  const old = p.old;
  const yeni = p.new;
  const desc = p.desc;
  const n = src.split(old).length - 1;
  if (n !== 1) { console.error(`${tag}: ${n} occurrences of old, expected 1`); process.exit(1); }
  const out = src.replace(old, yeni);
  const lineNo = src.slice(0, src.indexOf(old)).split('\n').length;
  const file = join(HERE, 'mutants', `${tag}.mjs`);
  writeFileSync(file, out);
  manifest.push({ tag, desc, line: lineNo, sha256: sha(readFileSync(file)), diffBytes: Buffer.byteLength(out) - Buffer.byteLength(src) });
}
manifest.unshift({ tag: 'PRISTINE', desc: 'unmutated frozen counter da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380', line: 0, sha256: sha(src), diffBytes: 0 });
writeFileSync(join(HERE, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(manifest.map((m) => `${m.tag} line=${m.line} sha=${m.sha256.slice(0, 12)} dBytes=${m.diffBytes}`).join('\n'));
