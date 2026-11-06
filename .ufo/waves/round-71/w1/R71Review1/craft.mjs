import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const REAL = '/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-synthpinch-r71.mjs';
const PIN = '5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af';
const WORK = '/fast/scratch/hyaku/tabi-r71/R71Review1/w';
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
  const f = fs.mkdtempSync(WORK + '/L') + '/pre.json';
  fs.writeFileSync(f, JSON.stringify(r));
  const p = spawnSync(process.execPath, [COUNTER, '--receipt', f, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  if (j && j.derived) r.legShape = j.derived;
  fs.rmSync(f, { force: true });
  return r;
};

// sanity: inspect the real setDeviceMetricsOverride entry
const dmo = real.cdpSendLog.find((c) => c.method === 'Emulation.setDeviceMetricsOverride');
console.log('REAL setDeviceMetricsOverride:', JSON.stringify(dmo));
console.log('last event:', JSON.stringify(real.events[real.events.length - 1]));

const cases = {};
const def = (name, mutate, doLaunder = false) => { cases[name] = { mutate, doLaunder }; };

// N00 baseline
def('N00-baseline', () => {});
// N01 deltaY as numeric strings on the 'in' leg (type law absent outside clamp/zero)
def('N01-deltaY-string-in', (r) => { for (const e of wheelEvs(r, 'in')) e.deltaY = String(e.deltaY); });
// N02 scale smuggled through the setup channel the driver already uses
def('N02-dmo-scale', (r) => { const c = r.cdpSendLog.find((x) => x.method === 'Emulation.setDeviceMetricsOverride'); c.params.scale = 2; });
def('N02b-dmo-extra', (r) => { r.cdpSendLog.push({ id: 9001, method: 'Emulation.setDeviceMetricsOverride', params: { width: 800, height: 600, deviceScaleFactor: 1, mobile: false, scale: 1.5 } }); });
// N03 Runtime.evaluate log-write evading the regex (bracket access)
def('N03-eval-bracket-push', (r) => { r.cdpSendLog.push({ id: 9002, method: 'Runtime.evaluate', params: { expression: 'window["__events"]["push"]({type:"wheel",ctrlKey:true,deltaY:-120})' } }); });
def('N03b-css-zoom', (r) => { r.cdpSendLog.push({ id: 9003, method: 'Runtime.evaluate', params: { expression: 'document.documentElement.style.zoom = "2"' } }); });
// N04 producer polarity combinations
def('N04-true-REFUTED', (r) => { r.synthPinchHypothesis = 'REFUTED'; });
def('N04b-false-CONFIRMED', (r) => { r.predicate = false; });
// N05 physically impossible magnitudes: 5..16 wheels of -0.01 yet scaleAfter 2
def('N05-tiny-deltas', (r) => { for (const e of wheelEvs(r, 'in')) e.deltaY = -0.01; });
// N06 whole touch-log replaced by a coherent ONE-finger drag (different gesture)
def('N06-one-finger-log', (r) => {
  for (const leg of ['touch', 'slow']) {
    const keep = [];
    let down = 0;
    for (const e of r.events.filter((e) => e.leg === leg)) {
      if ((e.type === 'pointerdown' || e.type === 'touchstart') && down === 0) { keep.push(e); down = 1; continue; }
      if ((e.type === 'pointerdown' || e.type === 'touchstart') && down === 1) continue;
      if ((e.type === 'pointerup' || e.type === 'touchend') && keep.some((k) => k.type === 'pointerup' || k.type === 'touchend')) continue;
      if (e.type === 'touchmove') { e.touches = [e.touches[0]]; e.changed = [e.changed[0]]; }
      keep.push(e);
    }
    const others = r.events.filter((e) => e.leg !== leg);
    r.events = [...others.filter((e) => r.events.indexOf(e) < r.events.findIndex((x) => x.leg === leg)), ...keep, ...others.filter((e) => r.events.indexOf(e) > r.events.map((y) => y.leg).lastIndexOf(leg))];
  }
  renumber(r);
}, true);
// N07 label forgery: target (and changed) unread by every check
def('N07-target-forged', (r) => { for (const e of r.events) { e.target = '#forged'; } });
// N08 timestamp anomalies
def('N08a-ts-string', (r) => { for (const e of wheelEvs(r, 'in')) e.ts = String(e.ts); });
def('N08b-ts-negative', (r) => { for (const e of r.events) e.ts = -Math.abs(e.ts); });
def('N08c-deltaY-null', (r) => { for (const e of wheelEvs(r, 'in')) e.deltaY = null; });
// N09 duplicate / contradictory duplicate events
def('N09-dup-touchmove', (r) => { const t = r.events.filter((e) => e.leg === 'touch' && e.type === 'touchmove'); r.events.push(clone(t[t.length - 1])); renumber(r); }, true);
def('N09b-contradictory-wheel', (r) => { const w = wheelEvs(r, 'in'); r.events.push({ ...clone(w[0]), deltaY: 5, ts: w[0].ts + 1 }); renumber(r); }, true);
// N11 absolute scale unanchored: start claims page scale 7 while events read ~1.07
def('N11-base-scale-7', (r) => { r.legs[0].scaleBefore = { page: 7, cdp: 7 }; });
def('N11b-uniform-scale-shift', (r) => { for (const l of r.legs) { for (const k of ['scaleBefore', 'scaleAfter']) { l[k].page += 0.5; l[k].cdp += 0.5; } } });
// N12 method-name case variant of a netted look-alike
def('N12-case-variant', (r) => { r.cdpSendLog.push({ id: 9004, method: 'input.dispatchMouseEvent', params: { type: 'mouseWheel', x: 400, y: 300, deltaX: 0, deltaY: -120, modifiers: 2 } }); });
// N13 contradictory duplicate leg entries (two 'in', no 'out')
def('N13-dup-leg-name', (r) => { r.legs[2] = clone(r.legs[1]); });
// N14 clamp law is sum-only / min-count
def('N14-clamp-sum-shape', (r) => { const ds = [10, 10, 10, 10, 100 * Math.log(2) - 40]; for (const [i, e] of wheelEvs(r, 'clamp').entries()) e.deltaY = ds[i]; });
def('N14b-clamp-six-wheels', (r) => { const w = wheelEvs(r, 'clamp'); const c = clone(w[0]); c.deltaY = 100 * Math.log(2) - w.reduce((a, e) => a + e.deltaY, 0) - c.deltaY; r.events.push(c); renumber(r); }, true);
// N17 fabricated leg label on an event that stays internally consistent on the target leg
def('N17-rename-to-default', (r) => { wheelEvs(r, 'in')[0].leg = 'default'; renumber(r); }, true);

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
const greens = rows.filter((x) => x.exit === 0 && x.name !== 'N00-baseline');
console.log('\nFALSE-GREEN CANDIDATES:', greens.map((g) => g.name).join(', ') || 'none');
