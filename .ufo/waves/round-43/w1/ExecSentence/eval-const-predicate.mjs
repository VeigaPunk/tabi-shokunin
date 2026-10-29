import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const dir = process.argv[2];
for (const [id, file] of [['C1','c1-signature-bound-v5.mjs'],['C2','check-routed-defects-round43.mjs']]) {
  const src = readFileSync(`${dir}/${file}`, 'utf8');
  // evaluate ONLY the const declaration, isolated
  const m = src.match(/const\s+PREDICATE\s*=\s*('(?:[^'\\]|\\.)*')/);
  const PREDICATE = eval(m[1]);
  const h = createHash('sha256').update(PREDICATE, 'utf8').digest('hex');
  console.log(`${id} file=${file} bytes=${Buffer.byteLength(PREDICATE,'utf8')} sha256=${h}`);
  console.log(`${id} tail=${JSON.stringify(PREDICATE.slice(-90))}`);
}
