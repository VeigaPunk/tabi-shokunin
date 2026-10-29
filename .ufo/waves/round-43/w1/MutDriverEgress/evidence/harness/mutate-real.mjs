#!/usr/bin/env node
// mutate-real.mjs <inReceipt> <outReceipt>
//
// Applies the EXACT receipt-level effect of the seat mutation to a REAL
// receipt that contains genuine non-loopback egress observations:
//
//   zero every per-sample and final-sweep nonLoopback count,
//   empty every nonLoopbackRemotes list,
//   recompute every aggregate summary from the zeroed values.
//
// This is precisely the receipt the MUTATED driver would have written for
// that same physical run: the driver observes the real egress, then reports
// zero (the two observe*() returns are the only place the counts are
// produced, and everything downstream is derived from them).
//
// Also emits a NO-EDIT copy of the input so the two arms differ ONLY in the
// egress counts.
import fs from 'node:fs';

const inPath = process.argv[2];
const outPath = process.argv[3];
const raw = fs.readFileSync(inPath, 'utf8');
const d = JSON.parse(raw);

let zeroedCounts = 0, zeroedLists = 0, nonzeroBefore = 0;
for (const run of d.runs) {
  for (const s of run.samples) {
    for (const k of ['ss', 'proc']) {
      if (!s[k]) continue;
      if (s[k].nonLoopback) { nonzeroBefore += s[k].nonLoopback; s[k].nonLoopback = 0; zeroedCounts++; }
      if (Array.isArray(s[k].nonLoopbackRemotes) && s[k].nonLoopbackRemotes.length) { s[k].nonLoopbackRemotes = []; zeroedLists++; }
    }
  }
  for (const k of ['ss', 'proc']) {
    const f = run.finalSweep && run.finalSweep[k];
    if (!f) continue;
    if (f.nonLoopback) { nonzeroBefore += f.nonLoopback; f.nonLoopback = 0; zeroedCounts++; }
    if (Array.isArray(f.nonLoopbackRemotes) && f.nonLoopbackRemotes.length) { f.nonLoopbackRemotes = []; zeroedLists++; }
  }
  // recompute aggregates exactly as the driver does (runOnce's sum() helper)
  const sum = (k, f) => run.samples.reduce((a, s) => a + (s[k] ? s[k][f] : 0), 0);
  run.sockets = {
    ss: { observations: sum('ss', 'lines'), nonLoopback: sum('ss', 'nonLoopback') },
    proc: { observations: sum('proc', 'inodes'), nonLoopback: sum('proc', 'nonLoopback') },
    finalSweep: { ss: run.finalSweep.ss.lines, proc: run.finalSweep.proc.inodes },
  };
  run.egressNonLoopback = run.sockets.ss.nonLoopback + run.sockets.proc.nonLoopback
    + run.finalSweep.ss.nonLoopback + run.finalSweep.proc.nonLoopback;
}
d.egressNonLoopback = d.runs.reduce((a, r) => a + r.egressNonLoopback, 0);
fs.writeFileSync(outPath, JSON.stringify(d, null, 1) + '\n');
console.log(JSON.stringify({
  in: inPath, out: outPath,
  nonzeroCountsZeroed: nonzeroBefore, zeroedFields: zeroedCounts, emptiedRemoteLists: zeroedLists,
  egressNonLoopbackNow: d.egressNonLoopback,
  perRun: d.runs.map((r) => ({ name: r.name, egress: r.egressNonLoopback, sockets: r.sockets })),
}, null, 1));
