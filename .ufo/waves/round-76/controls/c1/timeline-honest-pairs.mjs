#!/usr/bin/env node
// QUALITY 139 for round 76: the carried replay rule (pair tolerance 0.05 ms, abs fraction 0.5, gap
// fraction 0.75 over >= 50 ms gaps) evaluated on every ordered pair of the 13 honest pre-freeze
// receipts (probes p1-p4, smokes 1-9). Writes ../../lesson-proof/timeline-honest-pairs.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const files = [...[1, 2, 3, 4].map((i) => path.join(HERE, 'probe', `p${i}.receipt.json`)), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => path.join(HERE, `smoke${i}.receipt.json`))];
const R = files.map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const TOL = 0.05, GAP_MIN = 50;
const pairs = (x) => x.events.filter((e) => typeof e.ts === 'number' && typeof e.at === 'number');
const pairMatch = (a, b) => { const y = pairs(b).map((e) => [e.ts, e.at]); const used = new Array(y.length).fill(false); let n = 0; for (const e of pairs(a)) { const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL); if (k >= 0) { used[k] = true; n++; } } return n; };
const gaps = (x) => { const at = pairs(x).map((e) => e.at).sort((p, q) => p - q); const g = []; for (let i = 1; i < at.length; i++) if (at[i] - at[i - 1] >= GAP_MIN) g.push(at[i] - at[i - 1]); return g; };
const matchCount = (a, b) => { const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q); let i = 0, j = 0, n = 0; while (i < x.length && j < y.length) { const d = x[i] - y[j]; if (Math.abs(d) < TOL) { n++; i++; j++; } else if (d < 0) i++; else j++; } return n; };
const out = [];
for (let i = 0; i < R.length; i++) for (let j = 0; j < R.length; j++) if (i !== j) {
  const n = pairs(R[i]).length, g = gaps(R[i]);
  out.push({ a: path.basename(files[i]), b: path.basename(files[j]), events: n, gaps: g.length, absMatched: pairMatch(R[i], R[j]), gapMatched: matchCount(g, gaps(R[j])) });
}
const absHist = {}, gapHist = {};
for (const p of out) { absHist[p.absMatched] = (absHist[p.absMatched] || 0) + 1; gapHist[p.gapMatched] = (gapHist[p.gapMatched] || 0) + 1; }
const summary = { schema: 'tabi-r76-timeline-honest-pairs', receipts: files.length, orderedPairs: out.length,
  eventsPerReceipt: [...new Set(out.map((p) => p.events))], gapsPerReceipt: [...new Set(out.map((p) => p.gaps))],
  absMatchedHistogram: absHist, gapMatchedHistogram: gapHist, maxAbsMatched: Math.max(...out.map((p) => p.absMatched)), maxGapMatched: Math.max(...out.map((p) => p.gapMatched)),
  thresholds: { absNeed: 19, gapNeed: 5 }, refusedHonestPairs: out.filter((p) => p.absMatched / p.events >= 0.5 || p.gapMatched / p.gaps >= 0.75).length, pairs: out };
fs.writeFileSync(path.join(HERE, '../../lesson-proof/timeline-honest-pairs.json'), JSON.stringify(summary, null, 1) + '\n');
console.log(JSON.stringify({ ...summary, pairs: undefined }));
