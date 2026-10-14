// TABI-R3-1 — mechanical comparison across the two journey runs + within-run deltas.
import { readFileSync, writeFileSync } from 'node:fs';
const root = '/tmp/tabi-r3-1-journey';
const load = (run) => JSON.parse(readFileSync(`${root}/run${run}/journey.json`, 'utf8'));
const r1 = load(1);
const r2 = load(2);
const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);
const tags = r1.captures.map((c) => c.tag);

const rows = [];
const cmp = (label, a, b) =>
  rows.push([label, a === b ? 'IDENTICAL' : 'DIFFER', String(a).slice(0, 24), String(b).slice(0, 24)].join('\t'));
rows.push('comparison\tverdict\ta(24)\tb(24)');

for (const t of tags) {
  cmp(`png ${t} (R1 vs R2)`, get(r1, t).png.sha256, get(r2, t).png.sha256);
  cmp(`shape ${t} (R1 vs R2)`, get(r1, t).shape.sha256, get(r2, t).shape.sha256);
  cmp(`struct ${t} (R1 vs R2)`, get(r1, t).shape.structSha256, get(r2, t).shape.structSha256);
  cmp(`url ${t} (R1 vs R2)`, get(r1, t).url, get(r2, t).url);
}
cmp('png step-1-index vs step-1-index-idem (R1, idempotence, expect IDENTICAL)', get(r1, 'step-1-index').png.sha256, get(r1, 'step-1-index-idem').png.sha256);
cmp('png step-1-index vs step-2-detail (R1, link-follow delta, expect DIFFER)', get(r1, 'step-1-index').png.sha256, get(r1, 'step-2-detail').png.sha256);
cmp('png step-3-form vs step-3-form-filled (R1, fill delta, expect DIFFER)', get(r1, 'step-3-form').png.sha256, get(r1, 'step-3-form-filled').png.sha256);
cmp('png step-3-form-filled vs step-4-confirm (R1, submit delta, expect DIFFER)', get(r1, 'step-3-form-filled').png.sha256, get(r1, 'step-4-confirm').png.sha256);

writeFileSync(`${root}/compare.tsv`, rows.join('\n') + '\n');
console.log(rows.join('\n'));

const pathOf = (u) => { try { return new URL(u).pathname; } catch { return u; } };
for (const [name, rec] of [['R1', r1], ['R2', r2]]) {
  for (const c of rec.captures) {
    console.log(
      `${name}\t${c.tag}\turl=${c.url}\thist=${c.history.currentIndex}/${c.history.entries}:${c.history.transitionType}\tnet=[${c.net.map((e) => `${e.method} ${pathOf(e.url)} ${e.status}`).join(' | ')}]`
    );
  }
  console.log(`${name}\thistory\t` + rec.history.entries.map((e) => `${e.transitionType}:${pathOf(e.url)}`).join(' -> '));
  console.log(`${name}\ttargetEnd\turl=${rec.targetEnd.url}\ttitle=${rec.targetEnd.title}`);
  console.log(`${name}\tinputs\tstep-3-form=${JSON.stringify(get(rec, 'step-3-form').inputs)}\tstep-3-form-filled=${JSON.stringify(get(rec, 'step-3-form-filled').inputs)}`);
}