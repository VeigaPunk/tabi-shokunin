// Reproduces the two halves of the egress-clause check (finding F8), browser-free.
// Run from a scratch dir; writes planted-partial.json and planted-consistent.json
// next to a base receipt.json + measure.json, then you score them with the frozen
// counter. No wrapper, no driver, no browser.
import fs from 'node:fs';
import crypto from 'node:crypto';
const D = process.argv[2];            // scratch dir holding receipt.json + measure.json
const base = JSON.parse(fs.readFileSync(`${D}/receipt.json`, 'utf8'));

// (a) PARTIAL lie: one sample's counts planted, aggregates left as they were.
const partial = JSON.parse(JSON.stringify(base));
partial.runs[0].samples[0].ss.nonLoopback = 1;
partial.runs[0].samples[0].ss.nonLoopbackRemotes = ['203.0.113.7:443'];
partial.runs[0].samples[0].proc.nonLoopback = 1;
partial.runs[0].samples[0].proc.nonLoopbackRemotes = ['203.0.113.7:443'];
fs.writeFileSync(`${D}/planted-partial.json`, JSON.stringify(partial));

// (b) CONSISTENT lie: same plant, EVERY aggregate recomputed (the shape a driver
// that zeroes at the observe*() source produces).
const consistent = JSON.parse(JSON.stringify(partial));
const r = consistent.runs[0];
r.sockets.ss.nonLoopback   = r.samples.reduce((a, s) => a + (s.ss?.nonLoopback   || 0), 0);
r.sockets.proc.nonLoopback = r.samples.reduce((a, s) => a + (s.proc?.nonLoopback || 0), 0);
r.egressNonLoopback = r.sockets.ss.nonLoopback + r.sockets.proc.nonLoopback
  + (r.finalSweep?.ss?.nonLoopback || 0) + (r.finalSweep?.proc?.nonLoopback || 0);
consistent.egressNonLoopback = consistent.runs.reduce((a, x) => a + (x.egressNonLoopback || 0), 0);
fs.writeFileSync(`${D}/planted-consistent.json`, JSON.stringify(consistent));
console.log('wrote planted-partial.json and planted-consistent.json');
