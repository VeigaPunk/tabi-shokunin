// TABI-R2-1 — mechanical comparison of the two capture runs (no hand transcription).
import { readFileSync, writeFileSync } from 'node:fs';
const root = '/tmp/tabi-r2-1-capture';
const load = (run, phase) => JSON.parse(readFileSync(`${root}/run${run}/${phase}.json`, 'utf8'));
const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);

const det1 = load(1, 'det');
const det2 = load(2, 'det');
const nd1 = load(1, 'nondet');
const nd2 = load(2, 'nondet');

const rows = [];
const cmp = (label, a, b) =>
  rows.push([label, a === b ? 'IDENTICAL' : 'DIFFER', String(a).slice(0, 16), String(b).slice(0, 16)].join('\t'));

rows.push('comparison\tverdict\tsha_a(16)\tsha_b(16)');
// det: screenshots
cmp('det png before  (R1 vs R2)', get(det1, 'before').png.sha256, get(det2, 'before').png.sha256);
cmp('det png before vs before2 (R1 within-run)', get(det1, 'before').png.sha256, get(det1, 'before2').png.sha256);
cmp('det png after   (R1 vs R2)', get(det1, 'after').png.sha256, get(det2, 'after').png.sha256);
cmp('det png after vs before (R1, mutation delta)', get(det1, 'after').png.sha256, get(det1, 'before').png.sha256);
cmp('det png after vs before (R2, mutation delta)', get(det2, 'after').png.sha256, get(det2, 'before').png.sha256);
// det: shapes
cmp('det shape text   before (R1 vs R2)', get(det1, 'before').shape.sha256, get(det2, 'before').shape.sha256);
cmp('det shape text   after  (R1 vs R2)', get(det1, 'after').shape.sha256, get(det2, 'after').shape.sha256);
cmp('det shape struct before (R1 vs R2)', get(det1, 'before').shape.structSha256, get(det2, 'before').shape.structSha256);
cmp('det shape struct after  (R1 vs R2)', get(det1, 'after').shape.structSha256, get(det2, 'after').shape.structSha256);
cmp('det shape text   before vs before2 (R1)', get(det1, 'before').shape.sha256, get(det1, 'before2').shape.sha256);
// nondet: screenshots
cmp('nondet png nd1 vs nd2 (R1 within-run)', get(nd1, 'nd1').png.sha256, get(nd1, 'nd2').png.sha256);
cmp('nondet png nd1 vs nd1 (R1 vs R2)', get(nd1, 'nd1').png.sha256, get(nd2, 'nd1').png.sha256);
cmp('nondet png nd2 vs nd2 (R1 vs R2)', get(nd1, 'nd2').png.sha256, get(nd2, 'nd2').png.sha256);
// nondet: shapes
cmp('nondet shape struct nd1 vs nd2 (R1)', get(nd1, 'nd1').shape.structSha256, get(nd1, 'nd2').shape.structSha256);
cmp('nondet shape struct nd1 (R1 vs R2)', get(nd1, 'nd1').shape.structSha256, get(nd2, 'nd1').shape.structSha256);
cmp('nondet shape text   nd1 vs nd2 (R1)', get(nd1, 'nd1').shape.sha256, get(nd1, 'nd2').shape.sha256);

writeFileSync(`${root}/compare.tsv`, rows.join('\n') + '\n');
console.log(rows.join('\n'));

// node-count and bytes summary
for (const [name, recs] of [['det R1', det1], ['det R2', det2], ['nondet R1', nd1], ['nondet R2', nd2]]) {
  for (const c of recs.captures) {
    console.log(
      `${name}\t${c.tag}\tnodes=${c.shape.nodes}\tbytes=${c.png.bytes}\tdims=${c.png.dims.width}x${c.png.dims.height}\tclock=${c.volatile.clock}\trandom=${c.volatile.random}\tcount=${c.volatile.count}\titems=${c.volatile.items.join(',')}\tconfirms=${c.volatile.confirms.join(',')}`
    );
  }
}