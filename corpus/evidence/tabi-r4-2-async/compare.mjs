// TABI-R4-2 — mechanical comparison: run1 vs run2 (8 captures each), within-run deltas,
// and a cross-round check against the round-3 journey record (different lane, different ports,
// different process; the pre-async pages share fixture bytes with round 3).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const root = '/tmp/tabi-r4-2-async';
const load = (run) => JSON.parse(readFileSync(`${root}/run${run}/journey.json`, 'utf8'));
const r1 = load(1);
const r2 = load(2);
const get = (rec, tag) => rec.captures.find((c) => c.tag === tag);
const tags = r1.captures.map((c) => c.tag);

const rows = [];
const cmp = (label, a, b) => rows.push([label, a === b ? 'IDENTICAL' : 'DIFFER', String(a).slice(0, 24), String(b).slice(0, 24)].join('\t'));
rows.push('comparison\tverdict\ta(24)\tb(24)');

for (const t of tags) {
  cmp(`png ${t} (R1 vs R2)`, get(r1, t).png.sha256, get(r2, t).png.sha256);
  cmp(`shape ${t} (R1 vs R2)`, get(r1, t).shape.sha256, get(r2, t).shape.sha256);
  cmp(`struct ${t} (R1 vs R2)`, get(r1, t).shape.structSha256, get(r2, t).shape.structSha256);
  cmp(`url ${t} (R1 vs R2)`, get(r1, t).url, get(r2, t).url);
}
cmp('png step-1-index vs step-1-index-idem (R1, idempotence, expect IDENTICAL)', get(r1, 'step-1-index').png.sha256, get(r1, 'step-1-index-idem').png.sha256);
cmp('png step-5-async-pending vs step-5-async-settled (R1, async delta, expect DIFFER)', get(r1, 'step-5-async-pending').png.sha256, get(r1, 'step-5-async-settled').png.sha256);
cmp('shape step-5-async-pending vs step-5-async-settled (R1, async delta, expect DIFFER)', get(r1, 'step-5-async-pending').shape.sha256, get(r1, 'step-5-async-settled').shape.sha256);
cmp('struct step-5-async-pending vs step-5-async-settled (R1, async delta, expect DIFFER)', get(r1, 'step-5-async-pending').shape.structSha256, get(r1, 'step-5-async-settled').shape.structSha256);
cmp('url step-4-confirm vs step-5-async-pending (R1, navigation delta, expect DIFFER)', get(r1, 'step-4-confirm').url, get(r1, 'step-5-async-pending').url);

const r3path = '/tmp/tabi-r3-1-journey/run1/journey.json';
if (existsSync(r3path)) {
  const r3 = JSON.parse(readFileSync(r3path, 'utf8'));
  rows.push('# cross-round: TABI-R3-1 run1 (different lane/ports/process) vs TABI-R4-2 run1');
  for (const t of ['step-1-index', 'step-1-index-idem', 'step-2-detail', 'step-3-form', 'step-3-form-filled', 'step-4-confirm']) {
    const a = get(r3, t);
    const b = get(r1, t);
    cmp(`png ${t} (R3-1 vs R4-2)`, a.png.sha256, b.png.sha256);
    cmp(`shape ${t} (R3-1 vs R4-2)`, a.shape.sha256, b.shape.sha256);
  }
}
writeFileSync(`${root}/compare.tsv`, rows.join('\n') + '\n');
console.log(rows.join('\n'));

const pathOf = (u) => { try { return new URL(u).pathname; } catch { return u; } };
for (const [name, rec] of [['R1', r1], ['R2', r2]]) {
  for (const c of rec.captures) {
    console.log(
      `${name}\t${c.tag}\thist=${c.history.currentIndex}/${c.history.entries}:${c.history.transitionType}\tnet=[${c.net.map((e) => `${pathOf(e.url)} ${e.state}${e.status ? ':' + e.status : ''}${e.encodedDataLength !== null && e.encodedDataLength !== undefined ? ':' + e.encodedDataLength + 'B' : ''}`).join(' | ')}]`
    );
  }
  const a = rec.asyncStep;
  console.log(`${name}\tasyncStep\thold=${a.holdPattern} paused=${a.pausedAtUTC} preCap=${a.preCaptureAtUTC} continued=${a.continuedAtUTC} respAt=${a.responseEvent.respAtUTC} ready=${a.readyAtUTC} postCap=${a.postCaptureAtUTC}`);
  console.log(`${name}\twire\tpre=${JSON.stringify(a.wireAtPre)} post=${JSON.stringify(a.wireAtPost)}`);
  console.log(`${name}\tdeltasMs\t${JSON.stringify(a.deltasMs)}`);
  console.log(`${name}\trespEvent\t${JSON.stringify(a.responseEvent)}`);
  console.log(`${name}\tbody\t${JSON.stringify({ bytes: a.responseBody.bytes, sha256: a.responseBody.sha256 })}`);
  console.log(`${name}\tpreSliceRoutes\t${JSON.stringify(a.preSliceRoutes)}`);
  console.log(`${name}\tpostSliceRoutes\t${JSON.stringify(a.postSliceRoutes)}`);
  console.log(`${name}\thistory\t` + rec.history.entries.map((e) => `${e.transitionType}:${pathOf(e.url)}`).join(' -> '));
  console.log(`${name}\ttargetEnd\turl=${rec.targetEnd.url}\ttitle=${rec.targetEnd.title}`);
}