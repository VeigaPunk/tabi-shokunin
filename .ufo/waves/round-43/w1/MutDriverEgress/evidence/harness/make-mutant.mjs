#!/usr/bin/env node
// make-mutant.mjs — build the EXACT seat mutation:
//   "zero all nonLoopback counts and nonLoopbackRemotes in the driver
//    (simulate a lying driver)".
//
// Implementation site: the two observation returns (observeSs / observeProc).
// Zeroing at the SOURCE (not at the summary aggregation) is the faithful
// "lying driver": every downstream aggregate (sample fields, sockets.*,
// egressNonLoopback) is then DERIVED from the zeroed values and is
// therefore internally consistent — which is exactly the receipt shape the
// seat asks us to test.
//
// Nothing else in the driver is touched.
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(process.argv[2], 'utf8');

const EDITS = [
  {
    from: '  return { ticks: 1, lines: lines.length, nonLoopback, nonLoopbackRemotes };',
    to: '  return { ticks: 1, lines: lines.length, nonLoopback: 0, nonLoopbackRemotes: [] };',
  },
  {
    from: '  return { ticks: 1, inodes, nonLoopback, nonLoopbackRemotes };',
    to: '  return { ticks: 1, inodes, nonLoopback: 0, nonLoopbackRemotes: [] };',
  },
];

let out = src;
for (const e of EDITS) {
  const n = out.split(e.from).length - 1;
  if (n !== 1) { console.error(`edit site not unique (${n}): ${e.from}`); process.exit(2); }
  out = out.replace(e.from, e.to);
}
fs.writeFileSync(process.argv[3], out);
console.log(JSON.stringify({
  pristine: { path: process.argv[2], sha256: sha256(src), bytes: Buffer.byteLength(src) },
  mutant: { path: process.argv[3], sha256: sha256(out), bytes: Buffer.byteLength(out) },
  edits: EDITS.length,
  mutatedLines: EDITS.map((e) => e.to),
}, null, 1));
