// Receipt-dependence scan of the frozen battery's RELATIVE mutations (r72 -> r73 proposal input).
// For every mutation written as `+=`/`-=`/`*=` on a value that jitters across receipts, re-apply it
// in memory and evaluate the counter law it is aimed at, on all 9 receipts. Static replication of
// the frozen counter's formulas (check-synthpinch-r72.mjs:197-215) so a receipt-dependent case
// shows up as a per-receipt PASS/FAIL row, not as prose.
import fs from 'node:fs';

const base = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const W = base + '/.ufo/waves/round-72/w1/R72Exec2';
const R = {
  scored: base + '/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json',
  smoke1: base + '/.ufo/waves/round-72/controls/c1/smoke1.receipt.json',
  smoke2: base + '/.ufo/waves/round-72/controls/c1/smoke2.receipt.json',
  smoke3: base + '/.ufo/waves/round-72/controls/c1/smoke3.receipt.json',
  smoke5: base + '/.ufo/waves/round-72/controls/c1/smoke5.receipt.json',
  smoke6: base + '/.ufo/waves/round-72/controls/c1/smoke6.receipt.json',
  d1: W + '/d1.receipt.json', d2: W + '/d2.receipt.json', d3: W + '/d3.receipt.json',
};
const AT = { x: 400, y: 300 };
const LAW = { in: -100 * Math.log(2), out: -100 * Math.log(0.5), clamp: -100 * Math.log(0.5), default: -100 * Math.log(1.5) };
const SPAN = { in: [150, 450], out: [150, 450], clamp: [150, 450], default: [60, 300] };
const clone = (v) => JSON.parse(JSON.stringify(v));
const wheels = (r, leg) => r.events.filter((e) => e.leg === leg && e.type === 'wheel');
const lawSum = (r, leg) => wheels(r, leg).reduce((a, e) => a + e.deltaY * e.scale, 0);
const lawOk = (r, leg) => Math.abs(lawSum(r, leg) - LAW[leg]) <= 0.5;
const anchorBad = (r) => ['in', 'clamp', 'default'].flatMap((n) => wheels(r, n)).filter((e) => Math.abs(e.clientX - AT.x) > 1 || Math.abs(e.clientY - AT.y) > 1).length;
const clampExactBad = (r) => wheels(r, 'clamp').filter((e) => e.clientX !== AT.x || e.clientY !== AT.y).length;
const spanOf = (r, leg) => { const w = wheels(r, leg); return w.length >= 2 ? +(w[w.length - 1].ts - w[0].ts).toFixed(1) : null; };
const spanOk = (r, leg) => { const s = spanOf(r, leg); const b = SPAN[leg]; return s !== null && s >= b[0] && s <= b[1]; };
const ratioOf = (r) => r.legShape.slow.touchSpanMs / r.legShape.touch.touchSpanMs;
const ratioOk = (r) => { const x = ratioOf(r); return x >= 3 && x <= 5; };
const gapOk = (r, i) => Math.abs(r.legs[i].scaleBefore.page - r.legs[i].scaleBefore.cdp) <= 0.01;

// Each entry: the frozen line, its kind, the counter law it must trip (refuse) or must not trip
// (must-accept), and the in-memory mutation.
const CASES = [
  { line: 158, name: 'wheel-anchor', kind: 'refuse', law: 'wheel-anchor', mutate: (r) => { wheels(r, 'in')[0].clientX += 5; },
    fires: (r) => anchorBad(r) > 0 || clampExactBad(r) > 0 },
  { line: 159, name: 'in-wheel-anchor-2px', kind: 'refuse', law: 'wheel-anchor', mutate: (r) => { wheels(r, 'in')[0].clientX += 2; },
    fires: (r) => anchorBad(r) > 0 || clampExactBad(r) > 0 },
  { line: 159, name: 'in-wheel-anchor-2px (PROPOSED =402)', kind: 'refuse', law: 'wheel-anchor', mutate: (r) => { wheels(r, 'in')[0].clientX = 400 + 2; },
    fires: (r) => anchorBad(r) > 0 || clampExactBad(r) > 0 },
  { line: 160, name: 'wheel-anchor-clamp-exact', kind: 'refuse', law: 'wheel-anchor', mutate: (r) => { wheels(r, 'clamp')[2].clientY += 1; },
    fires: (r) => clampExactBad(r) > 0 },
  { line: 162, name: 'clamp-delta-off-0.8', kind: 'refuse', law: 'wheel-delta-law', mutate: (r) => { const w = wheels(r, 'clamp'); w[w.length - 1].deltaY += 0.8; },
    fires: (r) => !lawOk(r, 'clamp') },
  { line: 164, name: 'out-delta-off-0.8', kind: 'refuse', law: 'wheel-delta-law', mutate: (r) => { const w = wheels(r, 'out'); w[0].deltaY += 0.8 / w[0].scale; },
    fires: (r) => !lawOk(r, 'out') },
  { line: 165, name: 'default-delta-off-0.8', kind: 'refuse', law: 'wheel-delta-law', mutate: (r) => { const w = wheels(r, 'default'); w[0].deltaY -= 0.8 / w[0].scale; },
    fires: (r) => !lawOk(r, 'default') },
  { line: 166, name: 'wheel-delta-law', kind: 'refuse', law: 'wheel-delta-law', mutate: (r) => { wheels(r, 'clamp')[0].deltaY *= 2; },
    fires: (r) => !lawOk(r, 'clamp') },
  { line: 167, name: 'touch-geometry-x', kind: 'refuse', law: 'touch-geometry', mutate: (r) => { const t = r.events.filter((e) => e.leg === 'touch' && e.type === 'touchmove'); t[1].touches[0][0] += 3; },
    fires: (r) => { const t = r.events.filter((e) => e.leg === 'touch' && e.type === 'touchmove'); return new Set(t.flatMap((e) => e.touches.map((p) => p[0]))).size > 1; } },
  { line: 172, name: 'slow-ratio', kind: 'refuse', law: 'slow-ratio', mutate: (r) => { const t = r.events.filter((e) => e.leg === 'slow' && e.type === 'touchend'); t[t.length - 1].ts += 3000;
      // the counter re-derives the slow span from the mutated touchend
      const s = r.events.filter((e) => e.leg === 'slow' && /^touch/.test(e.type)); r.legShape.slow.touchSpanMs = +(s[s.length - 1].ts - s[0].ts).toFixed(1); },
    fires: (r) => !ratioOk(r) },
  { line: 200, name: 'in-timing (+1000 on last wheel ts)', kind: 'refuse', law: 'leg-in-timing', mutate: (r) => { const w = wheels(r, 'in'); w[w.length - 1].ts += 1000; }, fires: (r) => !spanOk(r, 'in') },
  { line: 200, name: 'default-timing (+1000 on last wheel ts)', kind: 'refuse', law: 'leg-default-timing', mutate: (r) => { const w = wheels(r, 'default'); w[w.length - 1].ts += 1000; }, fires: (r) => !spanOk(r, 'default') },
  { line: 192, name: 'in-scale-off-tolerance (+0.05)', kind: 'refuse', law: 'leg-in-scale', mutate: (r) => { const i = r.legs.findIndex((l) => l.name === 'in'); r.legs[i].scaleAfter.page += 0.05; r.legs[i].scaleAfter.cdp += 0.05; r.legs[i + 1].scaleBefore.page += 0.05; r.legs[i + 1].scaleBefore.cdp += 0.05; },
    fires: (r) => { const i = r.legs.findIndex((l) => l.name === 'in'); return Math.abs(r.legs[i].scaleAfter.page - 2) > 0.01; } },
  { line: 222, name: 'accept-clamp-delta-edge-0.4', kind: 'accept', law: 'wheel-delta-law', mutate: (r) => { const w = wheels(r, 'clamp'); w[w.length - 1].deltaY += 0.4; },
    fires: (r) => !lawOk(r, 'clamp') },
  { line: 223, name: 'accept-in-anchor-1px', kind: 'accept', law: 'wheel-anchor', mutate: (r) => { wheels(r, 'in')[0].clientX += 1; },
    fires: (r) => anchorBad(r) > 0 || clampExactBad(r) > 0 },
  { line: 224, name: 'accept-zero-scale-edge (+0.009)', kind: 'accept', law: 'leg-zero-scale', mutate: (r) => { const l = r.legs[r.legs.length - 1]; l.scaleAfter.page += 0.009; l.scaleAfter.cdp += 0.009; },
    fires: (r) => { const l = r.legs[r.legs.length - 1]; return Math.abs(l.scaleAfter.page - 1.5) > 0.01; } },
];

const rows = [];
for (const [key, p] of Object.entries(R)) {
  const orig = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const c of CASES) {
    const r = clone(orig);
    c.mutate(r);
    const fired = c.fires(r);
    const ok = c.kind === 'refuse' ? fired : !fired;
    rows.push({ receipt: key, line: c.line, case: c.name, kind: c.kind, law: c.law, mutated_hits_law: fired, case_would_pass: ok,
      honest_in0x: wheels(orig, 'in')[0].clientX,
      law_dev: (() => { const leg = c.name.startsWith('out-') ? 'out' : c.name.startsWith('default-') ? 'default' : c.name.includes('clamp') ? 'clamp' : null; return leg ? +(lawSum(r, leg) - LAW[leg]).toFixed(4) : null; })(),
      span_in: spanOf(r, 'in'), span_default: spanOf(r, 'default'), ratio: +ratioOf(r).toFixed(3),
      anchor_max_off: Math.max(...['in', 'clamp', 'default'].flatMap((n) => wheels(r, n)).map((e) => Math.max(Math.abs(e.clientX - AT.x), Math.abs(e.clientY - AT.y)))),
    });
  }
}
const byCase = {};
for (const row of rows) {
  const k = row.line + ':' + row.case;
  (byCase[k] = byCase[k] || { line: row.line, case: row.case, kind: row.kind, law: row.law, pass: 0, fail: 0, failedOn: [] })[row.case_would_pass ? 'pass' : 'fail']++;
  if (!row.case_would_pass) byCase[k].failedOn.push(row.receipt);
}
const summary = Object.values(byCase).map((v) => ({ ...v, receiptDependent: v.fail > 0 && v.pass > 0, alwaysFails: v.pass === 0, alwaysPasses: v.fail === 0 }));
const out = { schema: 'tabi-r72-exec2-relative-mutation-scan', generated: new Date().toISOString(), receipts: Object.keys(R), summary, rows };
fs.writeFileSync(W + '/relative-mutation-scan.json', JSON.stringify(out, null, 1));
for (const s of summary) console.log(String(s.line).padEnd(4), (s.kind === 'refuse' ? 'REFUSE ' : 'ACCEPT ') + s.case.padEnd(42), 'pass=' + s.pass, 'fail=' + s.fail, s.receiptDependent ? 'RECEIPT-DEPENDENT failedOn=' + s.failedOn.join(',') : (s.alwaysFails ? 'refuses on all 9' : 'holds on all 9'));
console.log(JSON.stringify({ rows: rows.length, receiptDependent: summary.filter((s) => s.receiptDependent).length }, null, 1));
