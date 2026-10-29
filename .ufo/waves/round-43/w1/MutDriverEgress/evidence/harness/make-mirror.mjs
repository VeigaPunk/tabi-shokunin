#!/usr/bin/env node
// make-mirror.mjs <mirrorRoot>
// Rewrites the ROOT constant of the mirror's wrapper and counter so the
// mirror tree (driver = pristine or mutated) is the producer under test.
// Only the single ROOT literal is changed; every other byte is the
// committed byte, so the mirror's own digests still equal the frozen pins
// for the wrapper and the counter. The driver digest differs in the
// mutant mirror, which is exactly what the wrapper's Stage-1 digest pin
// and the counter's own digest re-derivation are supposed to notice.
import fs from 'node:fs';

const root = process.argv[2];
const OLD = "const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';";
const NEW = `const ROOT = '${root}';`;

for (const rel of ['scripts/measure-c1-round43.mjs', '.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs']) {
  const p = `${root}/${rel}`;
  const src = fs.readFileSync(p, 'utf8');
  const n = src.split(OLD).length - 1;
  if (n !== 1) { console.error(`ROOT literal not unique (${n}) in ${p}`); process.exit(2); }
  fs.writeFileSync(p, src.replace(OLD, NEW));
  console.log(JSON.stringify({ patched: p, replaced: 1 }));
}
