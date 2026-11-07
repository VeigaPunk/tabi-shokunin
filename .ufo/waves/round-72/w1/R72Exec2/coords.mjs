import fs from 'node:fs';
const base = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const R = {
  scored: base + '/corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json',
  smoke1: base + '/.ufo/waves/round-72/controls/c1/smoke1.receipt.json',
  smoke2: base + '/.ufo/waves/round-72/controls/c1/smoke2.receipt.json',
  smoke3: base + '/.ufo/waves/round-72/controls/c1/smoke3.receipt.json',
  smoke5: base + '/.ufo/waves/round-72/controls/c1/smoke5.receipt.json',
  smoke6: base + '/.ufo/waves/round-72/controls/c1/smoke6.receipt.json',
  d1: base + '/.ufo/waves/round-72/w1/R72Exec2/d1.receipt.json',
  d2: base + '/.ufo/waves/round-72/w1/R72Exec2/d2.receipt.json',
  d3: base + '/.ufo/waves/round-72/w1/R72Exec2/d3.receipt.json',
};
const out = { schema: 'tabi-r72-exec2-wheel-coords', at: new Date().toISOString(), receipts: {} };
for (const [k, p] of Object.entries(R)) {
  if (!fs.existsSync(p)) { out.receipts[k] = { missing: p }; continue; }
  const r = JSON.parse(fs.readFileSync(p, 'utf8'));
  const per = {};
  for (const leg of ['in', 'clamp', 'default']) {
    const w = r.events.filter((e) => e.leg === leg && e.type === 'wheel');
    per[leg] = {
      count: w.length,
      wheels: w.map((e, i) => ({ i, clientX: e.clientX, clientY: e.clientY, deltaY: +e.deltaY.toFixed(4), scale: +e.scale.toFixed(4), ts: +e.ts.toFixed(1) })),
      uniqueXY: [...new Set(w.map((e) => e.clientX + ',' + e.clientY))],
      xHistogram: w.reduce((a, e) => { a[e.clientX] = (a[e.clientX] || 0) + 1; return a; }, {}),
      firstXY: w.length ? [w[0].clientX, w[0].clientY] : null,
      // effect of the frozen `+= 2` case and of the proposed `= 402` case on wheel-anchor
      frozen_mut_xy: w.length ? [w[0].clientX + 2, w[0].clientY] : null,
      frozen_mut_offby: w.length ? Math.abs(w[0].clientX + 2 - 400) : null,
      proposed_mut_xy: w.length ? [402, w[0].clientY] : null,
      proposed_mut_offby: 2,
    };
  }
  out.receipts[k] = { path: p, nonce: r.nonce, driverSha256: r.driverSha256, legs: per };
}
console.log(JSON.stringify(out, null, 1));
