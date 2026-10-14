// W4-T4-2 mechanical comparison — my runs (w4-t4-2-async run1/run2) vs the lane's earlier
// dispatch (tabi-r4-2-async probe1/run1/run2) and vs the round-3 journey record (different
// lane/ports/process). Pure byte comparisons of recorded sha256 fields; no hand transcription.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const mine1 = load('/tmp/w4-t4-2-async/run1/journey.json');
const mine2 = load('/tmp/w4-t4-2-async/run2/journey.json');
const prev1 = load('/tmp/tabi-r4-2-async/run1/journey.json');
const prev2 = load('/tmp/tabi-r4-2-async/run2/journey.json');
const probe1 = load('/tmp/tabi-r4-2-async/probe1/journey.json');

const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);
const rows = [];
const cmp = (label, a, b) => rows.push([label, a === b ? 'IDENTICAL' : 'DIFFER', String(a).slice(0, 24), String(b).slice(0, 24)].join('\t'));
rows.push('comparison\tverdict\ta(24)\tb(24)');

const tags = mine1.captures.map((c) => c.tag);
for (const t of tags) {
  cmp(`png ${t} (W4R1 vs W4R2)`, get(mine1, t).png.sha256, get(mine2, t).png.sha256);
  cmp(`shape ${t} (W4R1 vs W4R2)`, get(mine1, t).shape.sha256, get(mine2, t).shape.sha256);
  cmp(`struct ${t} (W4R1 vs W4R2)`, get(mine1, t).shape.structSha256, get(mine2, t).shape.structSha256);
}
for (const t of ['step-5-async-pending', 'step-5-async-settled']) {
  cmp(`png ${t} (W4R1 vs earlier-dispatch R1)`, get(mine1, t).png.sha256, get(prev1, t).png.sha256);
  cmp(`png ${t} (W4R1 vs earlier-dispatch R2)`, get(mine1, t).png.sha256, get(prev2, t).png.sha256);
  cmp(`png ${t} (W4R1 vs probe1)`, get(mine1, t).png.sha256, get(probe1, t).png.sha256);
  cmp(`shape ${t} (W4R1 vs earlier-dispatch R1)`, get(mine1, t).shape.sha256, get(prev1, t).shape.sha256);
  cmp(`shape ${t} (W4R1 vs probe1)`, get(mine1, t).shape.sha256, get(probe1, t).shape.sha256);
  cmp(`struct ${t} (W4R1 vs earlier-dispatch R1)`, get(mine1, t).shape.structSha256, get(prev1, t).shape.structSha256);
}
cmp('png step-1-index vs step-1-index-idem (W4R1, idempotence, expect IDENTICAL)', get(mine1, 'step-1-index').png.sha256, get(mine1, 'step-1-index-idem').png.sha256);
cmp('png step-5-async-pending vs step-5-async-settled (W4R1, async delta, expect DIFFER)', get(mine1, 'step-5-async-pending').png.sha256, get(mine1, 'step-5-async-settled').png.sha256);
cmp('shape step-5-async-pending vs step-5-async-settled (W4R1, async delta, expect DIFFER)', get(mine1, 'step-5-async-pending').shape.sha256, get(mine1, 'step-5-async-settled').shape.sha256);
cmp('struct step-5-async-pending vs step-5-async-settled (W4R1, async delta, expect DIFFER)', get(mine1, 'step-5-async-pending').shape.structSha256, get(mine1, 'step-5-async-settled').shape.structSha256);

const r3path = '/tmp/tabi-r3-1-journey/run1/journey.json';
if (existsSync(r3path)) {
  const r3 = load(r3path);
  rows.push('# cross-round: TABI-R3-1 run1 (different lane/ports/process) vs W4R1');
  for (const t of ['step-1-index', 'step-1-index-idem', 'step-2-detail', 'step-3-form', 'step-3-form-filled', 'step-4-confirm']) {
    cmp(`png ${t} (R3-1 vs W4R1)`, get(r3, t).png.sha256, get(mine1, t).png.sha256);
    cmp(`shape ${t} (R3-1 vs W4R1)`, get(r3, t).shape.sha256, get(mine1, t).shape.sha256);
  }
}
writeFileSync('/tmp/w4-t4-2-async/compare.tsv', rows.join('\n') + '\n');
console.log(rows.join('\n'));
console.log('\n# counts');
const verdicts = rows.slice(1).filter((r) => !r.startsWith('#')).map((r) => r.split('\t')[1]);
console.log(JSON.stringify(verdicts.reduce((acc, v) => ((acc[v] = (acc[v] || 0) + 1), acc), {})));