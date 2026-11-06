import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-synthpinch-r71.mjs';
const PIN = '5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af';
const WORK = '/fast/scratch/hyaku/tabi-r71/R71Review1/w2';
fs.mkdirSync(WORK, { recursive: true });
const real = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const clone = (v) => JSON.parse(JSON.stringify(v));
const renumber = (r) => { r.events.forEach((e, i) => { e.seq = i + 1; }); return r; };
const wheelEvs = (r, leg) => r.events.filter((e) => e.leg === leg && e.type === 'wheel');
const run = (file) => {
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', file, '--expect-driver-sha256', PIN, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  return { exit: p.status, ids: j ? j.findings.map((f) => f.id) : null };
};
const launder = (r) => {
  const f = WORK + '/pre.json';
  fs.writeFileSync(f, JSON.stringify(r));
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', f, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  if (j && j.derived) r.legShape = j.derived;
  return r;
};

const cases = {};
const def = (name, mutate, doLaunder = false) => { cases[name] = { mutate, doLaunder }; };

// N14fix: clamp sum law is sum-only: 16 positive deltas, all equal 69.3147/16, real per-wheel shape erased
def('N14fix-clamp-flat', (r) => { const w = wheelEvs(r, 'clamp'); for (const e of w) e.deltaY = 100 * Math.log(2) / w.length; });
// N14bfix: 17th clamp wheel, sum preserved (0.01 added, 0.01 shaved elsewhere), ts just inside the window
def('N14bfix-clamp-17', (r) => { const w = wheelEvs(r, 'clamp'); w[0].deltaY -= 0.01; const c = clone(w[w.length - 1]); c.ts = c.ts + 1; c.deltaY = 0.01; r.events.push(c); renumber(r); }, true);
// N08bfix: order-preserving negative shift of every event timestamp
def('N08bfix-ts-shift-neg', (r) => { for (const e of r.events) e.ts = e.ts - 20000; });
// N17bfix: in-wheel relabelled to 'default' with ts fitted inside the default window
def('N17bfix-relabel-fitted', (r) => { const w = wheelEvs(r, 'in'); w[0].leg = 'default'; w[0].ts = 3770.0; }, true);
// N20: producer order decoupled from leg order (reverse the 10 pinch rows)
def('N20-pinch-rows-reversed', (r) => {
  const pinch = r.cdpSendLog.filter((c) => c.method === 'Input.synthesizePinchGesture');
  const rest = r.cdpSendLog.filter((c) => c.method !== 'Input.synthesizePinchGesture');
  r.cdpSendLog = [...rest, ...pinch.reverse()];
});
// N21: a zero leg amputated to exactly the 20-wheel minimum (262 of 282 wheels erased)
def('N21-zero-amputee', (r) => {
  const w = wheelEvs(r, 'zero');
  const drop = new Set(w.slice(0, w.length - 20).map((e) => r.events.indexOf(e)));
  r.events = r.events.filter((e, i) => !drop.has(i));
  renumber(r);
}, true);
// N22: default leg's nine real wheels replaced by three synthetic -10s (min satisfied)
def('N22-default-three', (r) => {
  const d = wheelEvs(r, 'default');
  const drop = new Set(d.slice(0, d.length - 3).map((e) => r.events.indexOf(e)));
  r.events = r.events.filter((e, i) => !drop.has(i));
  const keep = wheelEvs(r, 'default');
  for (const e of keep) e.deltaY = -10;
  renumber(r);
}, true);

const rows = [];
for (const [name, { mutate, doLaunder }] of Object.entries(cases)) {
  const r = clone(real); mutate(r);
  if (doLaunder) launder(r);
  const f = `${WORK}/${name}.json`;
  fs.writeFileSync(f, JSON.stringify(r));
  const o = run(f);
  rows.push({ name, exit: o.exit, ids: o.ids });
  console.log(`${name}: exit=${o.exit} ids=${JSON.stringify(o.ids)}`);
}
fs.writeFileSync(`${WORK}/summary.json`, JSON.stringify(rows, null, 1));
const greens = rows.filter((x) => x.exit === 0);
console.log('\nROUND2 FALSE GREENS:', greens.map((g) => g.name).join(', ') || 'none');
