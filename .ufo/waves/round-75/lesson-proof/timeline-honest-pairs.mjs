#!/usr/bin/env node
// QUALITY 139 measurement for round 75: over every pair of honest receipts (the probes and smokes
// in prior-set.txt, plus any extra receipts given), the counter's two replay similarities (event
// multiset `abs` and >= 50 ms gap multiset `gap`, tolerance 0.05 ms), their maxima against the
// 0.5 threshold, and the round-74 aligned rule for comparison. The functions are copied from
// scripts/check-dragdrop-r75.mjs (the counter is a CLI, not a module); the copy is checked against
// the counter bytes below so it cannot drift. Usage: node timeline-honest-pairs.mjs [extra.json ...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANE = path.resolve(HERE, '../../../..');
const C1D = path.join(LANE, '.ufo/waves/round-75/controls/c1');
const counter = fs.readFileSync(path.join(LANE, 'scripts/check-dragdrop-r75.mjs'), 'utf8');
const SRC = {
  tol: 'const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;',
  pairs: 'const pairs = (x) => arr(x.events).filter((e) => isObj(e) && num(e.ts) && num(e.at));',
};
for (const [k, s] of Object.entries(SRC)) if (!counter.includes(s)) { console.error('counter drifted from the measured copy: ' + k); process.exit(2); }
const TOL = 0.05, GAP_MIN = 50, FRAC = 0.5, GAP_FRAC = 0.75;
const arr = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const pairs = (x) => arr(x.events).filter((e) => isObj(e) && num(e.ts) && num(e.at));
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const sim = (a, b) => { const na = pairs(a).length, ga = gaps(a); return { abs: na ? pairMatch(a, b) / na : 0, gap: ga.length ? matchCount(ga, gaps(b)) / ga.length : 0 }; };
const maxAligned = (a, b) => { const x = arr(a.events), y = arr(b.events); if (x.length !== y.length) return null; return Math.max(...x.map((e, i) => Math.max(Math.abs(e.ts - y[i].ts), Math.abs(e.at - y[i].at)))); };
const files = fs.readFileSync(path.join(C1D, 'prior-set.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => path.join(LANE, l.trim()))
  .filter((f) => !/degenerate-/.test(f)).concat(process.argv.slice(2));
const rs = files.map((f) => ({ f: path.relative(LANE, f), r: JSON.parse(fs.readFileSync(f, 'utf8')) }));
let maxAbs = 0, maxGap = 0, minAligned = Infinity, refused = 0, pairsN = 0, refusedAtGapHalf = 0;
const gapHist = {};
const gapCounts = rs.map((x) => gaps(x.r).length);
for (let i = 0; i < rs.length; i++) for (let j = 0; j < rs.length; j++) {
  if (i === j) continue;
  const s = sim(rs[i].r, rs[j].r); pairsN++;
  maxAbs = Math.max(maxAbs, s.abs); maxGap = Math.max(maxGap, s.gap);
  if (s.abs >= FRAC || s.gap >= GAP_FRAC) refused++;
  if (s.gap >= 0.5) refusedAtGapHalf++;
  gapHist[Math.round(s.gap * 8)] = (gapHist[Math.round(s.gap * 8)] || 0) + 1;
  const m = maxAligned(rs[i].r, rs[j].r); if (m !== null) minAligned = Math.min(minAligned, m);
}
const out = { schema: 'tabi-r75-timeline-honest-pairs', receipts: rs.map((x) => x.f), orderedPairs: pairsN, absThreshold: FRAC, gapThreshold: GAP_FRAC, tolerance: TOL, gapMin: GAP_MIN,
  firstChosenGapThreshold: 0.5, refusedAtFirstChosenGapThreshold: refusedAtGapHalf, gapMatchHistogramEighths: gapHist,
  maxAbs, maxGap, honestPairsRefused: refused, ownGapCounts: gapCounts, minOwnGaps: Math.min(...gapCounts), minAlignedMaxDiffMs: minAligned };
console.log(JSON.stringify(out, null, 1));
process.exit(refused === 0 && Math.min(...gapCounts) >= 6 ? 0 : 1);
