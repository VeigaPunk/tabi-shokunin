// Builds the ZEROED TWIN of a receipt: zero every per-sample and final-sweep
// nonLoopback count and every nonLoopbackRemotes list, then recompute every
// aggregate so the receipt is internally consistent (the "lying driver" shape).
// Run from a scratch dir; writes receipt-zeroed.json next to the input.
import fs from 'node:fs';
const D = process.argv[2];
const d = JSON.parse(fs.readFileSync(`${D}/receipt.json`, 'utf8'));
for (const run of d.runs || []) {
  for (const s of run.samples || []) {
    for (const k of ['ss', 'proc']) {
      const o = s[k]; if (!o) continue;
      o.nonLoopback = 0; o.nonLoopbackRemotes = [];
    }
  }
  for (const k of ['ss', 'proc']) {
    const o = run.finalSweep?.[k]; if (!o) continue;
    o.nonLoopback = 0; o.nonLoopbackRemotes = [];
  }
  const sum = (k) => (run.samples || []).reduce((a, s) => a + ((s[k]?.nonLoopback) || 0), 0);
  run.sockets = { ss: { observations: sum('ss'), nonLoopback: sum('ss') },
                  proc: { observations: sum('proc'), nonLoopback: sum('proc') } };
  run.egressNonLoopback = run.sockets.ss.nonLoopback + run.sockets.proc.nonLoopback
    + (run.finalSweep?.ss?.nonLoopback || 0) + (run.finalSweep?.proc?.nonLoopback || 0);
}
d.egressNonLoopback = (d.runs || []).reduce((a, r) => a + (r.egressNonLoopback || 0), 0);
fs.writeFileSync(`${D}/receipt-zeroed.json`, JSON.stringify(d));
console.log('wrote receipt-zeroed.json');
