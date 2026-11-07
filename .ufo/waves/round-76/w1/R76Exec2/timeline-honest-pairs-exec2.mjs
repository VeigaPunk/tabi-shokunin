#!/usr/bin/env node
// R76Exec2 adaptation of .ufo/waves/round-76/controls/c1/timeline-honest-pairs.mjs (committed copy
// untouched). Same replay rule as the counter (pair tolerance 0.05 ms, abs fraction 0.5, gap
// fraction 0.75 over >= 50 ms gaps), evaluated on every ordered pair of the 17 honest receipts:
// 13 pre-freeze (probes p1-p4, smokes 1-9) + the L1 scored receipt + R76Exec2's d1-d3.
// Also measures the dialog block time (dialog-return at - ts) per leg across all receipts.
import fs from 'node:fs';
import path from 'node:path';
const L = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = '/fast/scratch/hyaku/tabi-r76/R76Exec2/tl/honest-pairs-exec2.json';
const files = [
  ...[1, 2, 3, 4].map((i) => path.join(L, '.ufo/waves/round-76/controls/c1/probe', `p${i}.receipt.json`)),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(L, '.ufo/waves/round-76/controls/c1', `smoke${i}.receipt.json`)),
  path.join(L, 'corpus/evidence/round76/chromium-js-dialog/receipt.json'),
  '/fast/scratch/hyaku/tabi-r76/R76Exec2/d1.json',
  '/fast/scratch/hyaku/tabi-r76/R76Exec2/d2.json',
  '/fast/scratch/hyaku/tabi-r76/R76Exec2/d3.json',
];
const nameOf = (f) => (f.includes('/controls/c1/') ? path.basename(f) : f.replace(L + '/', '').replace('/fast/scratch/hyaku/tabi-r76/R76Exec2/', 'scratch:'));
const R = files.map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const pairs = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const out = [];
for (let i = 0; i < R.length; i++) for (let j = 0; j < R.length; j++) if (i !== j) {
  const n = pairs(R[i]).length, g = gaps(R[i]);
  const absMatched = pairMatch(R[i], R[j]), gapMatched = matchCount(g, gaps(R[j]));
  const absFrac = n ? absMatched / n : 0, gapFrac = g.length ? gapMatched / g.length : 0;
  out.push({ a: nameOf(files[i]), b: nameOf(files[j]), events: n, gaps: g.length, absMatched, gapMatched,
    absFrac, gapFrac, refused: absFrac >= FRAC || gapFrac >= GAP_FRAC,
    withinOne: absMatched >= 19 - 1 || gapMatched >= 5 - 1 });
}
const absHist = {}, gapHist = {};
for (const p of out) { absHist[p.absMatched] = (absHist[p.absMatched] || 0) + 1; gapHist[p.gapMatched] = (gapHist[p.gapMatched] || 0) + 1; }
const summary = { schema: 'tabi-r76-timeline-honest-pairs-exec2', receipts: files.length, orderedPairs: out.length,
  eventsPerReceipt: [...new Set(out.map((p) => p.events))], gapsPerReceipt: [...new Set(out.map((p) => p.gaps))],
  absMatchedHistogram: absHist, gapMatchedHistogram: gapHist,
  maxAbsMatched: Math.max(...out.map((p) => p.absMatched)), maxGapMatched: Math.max(...out.map((p) => p.gapMatched)),
  maxAbsFrac: Math.max(...out.map((p) => p.absFrac)), maxGapFrac: Math.max(...out.map((p) => p.gapFrac)),
  thresholds: { absNeed: 19, gapNeed: 5, absFrac: FRAC, gapFrac: GAP_FRAC, tol: TOL, gapMinMs: GAP_MIN },
  refusedHonestPairs: out.filter((p) => p.refused).length,
  pairsWithinOneOfRefusal: out.filter((p) => p.withinOne).map((p) => ({ a: p.a, b: p.b, absMatched: p.absMatched, gapMatched: p.gapMatched })),
  blockTimes: null, pairs: out };
// dialog block time per leg over all receipts: at - ts of each dialog-return event
const blockByLeg = {};
for (let i = 0; i < R.length; i++) {
  for (const e of R[i].events) {
    if (e.type !== 'dialog-return') continue;
    (blockByLeg[e.leg] ||= []).push({ receipt: nameOf(files[i]), block: +(e.at - e.ts).toFixed(1) });
  }
}
const legStats = {};
for (const [leg, rows] of Object.entries(blockByLeg)) {
  const v = rows.map((r) => r.block);
  legStats[leg] = { n: v.length, min: Math.min(...v), max: Math.max(...v), mean: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2), below1ms: v.filter((x) => x < 1).length, rows };
}
summary.blockTimes = { floorMs: 1, legs: Object.fromEntries(Object.entries(legStats).map(([k, v]) => [k, { n: v.n, min: v.min, max: v.max, mean: v.mean, below1ms: v.below1ms }])) };
summary.legStatsFull = legStats;
fs.writeFileSync(OUT, JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify({ ...summary, pairs: undefined, legStatsFull: undefined }));
