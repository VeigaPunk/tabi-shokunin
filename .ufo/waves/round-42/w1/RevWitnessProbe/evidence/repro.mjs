#!/usr/bin/env node
// Round-42 W1 RevWitnessProbe — witness channel audit reproduction.
// Read-only against the repo; writes only into this evidence dir.
// Runs: (1) committed r42 bytes under their own nonce and a fresh nonce;
//       (2)-(7) file-only forgeries around a COPY of the committed r41 receipt.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(ROOT, '.ufo/waves/round-41/counters/c1-session-bound-v4.mjs');
const PINS = path.join(ROOT, '.ufo/waves/round-41/claims.json');
const R42_RECEIPT = path.join(ROOT, 'corpus/evidence/round42/playwright-egress/receipt.json');
const R42_WITNESS = path.join(ROOT, 'corpus/evidence/round42/playwright-egress/receipt.witness.json');
const R42_MEASURE = path.join(ROOT, '.ufo/waves/round-42/measure/c1-measure.json');
const R41_RECEIPT = path.join(ROOT, 'corpus/evidence/round41/playwright-egress/receipt.json');
const R41_WITNESS = path.join(ROOT, 'corpus/evidence/round41/playwright-egress/receipt.witness.json');
const OUT = path.dirname(new URL(import.meta.url).pathname);
const FF_PREFIX = '/home/vgpnk/.cache/ms-playwright/firefox-';
const NODE_EXE = process.execPath;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const freshNonce = () => crypto.randomBytes(32).toString('hex');
const W = (name, doc) => { const p = path.join(OUT, name); fs.writeFileSync(p, JSON.stringify(doc)); return p; };
const R = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function runCounter(label, args) {
  const cmd = `node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs ${args.map((a) => (a.length > 90 ? `<json:${path.basename(a)}>` : a)).join(' ')}`;
  const r = spawnSync(process.execPath, [COUNTER, ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 << 20 });
  let o = null; try { o = JSON.parse(r.stdout); } catch { }
  console.log(`\n### ${label}\n$ ${cmd}\nEXIT=${r.status}`);
  console.log(JSON.stringify({ predicate: o?.predicate, findings: o?.findings, receiptSha256: o?.receiptSha256 }));
  return { exit: r.status, out: o };
}

function claimedFirefoxPid(receipt) {
  for (const run of receipt.runs) for (const s of run.samples) for (const p of s.treePids || [])
    if (typeof p.exe === 'string' && p.exe.startsWith(FF_PREFIX)) return p.pid;
  return null;
}

function handBuiltWitness({ nonce, rootPid, nodePid, ffPid, samples, withNode }) {
  const out = [];
  for (let i = 0; i < samples; i++) {
    const tree = [{ pid: ffPid, ppid: nodePid, startTicks: 18000000, exe: FF_PREFIX + '1555/firefox/firefox', comm: 'firefox' }];
    if (withNode) tree.unshift({ pid: nodePid, ppid: rootPid, startTicks: 18000000, exe: NODE_EXE, comm: 'node' });
    out.push({ t: 1793500000000 + i * 100, tTicks: 18000000 + i * 10, tree });
  }
  return { schema: 'tabi-r41-witness', rootPid, nonce, startedTicks: 18000000, endedTicks: 18000000 + samples * 10, samples: out, environ: ['PATH'] };
}

// ---- Part 1: committed r42 bytes -------------------------------------------------
const r42 = R(R42_RECEIPT), w42 = R(R42_WITNESS), m42 = R(R42_MEASURE);
console.log('=== PART 1: committed r42 evidence ===');
console.log('committed nonce:', r42.runNonce);
console.log('receipt sha256:', sha256(fs.readFileSync(R42_RECEIPT)), 'measure record:', m42.receiptSha256);
console.log('witness sha256:', sha256(fs.readFileSync(R42_WITNESS)), 'measure record:', m42.witnessSha256);
console.log('witness schema/nonce/samples:', w42.schema, w42.nonce, w42.samples.length, 'rootPid:', w42.rootPid);
const nodePid42 = r42.runs[0].owned.nodePid;
console.log('receipt runs[0].owned.nodePid:', nodePid42, 'witness samples observing it directly:',
  w42.samples.filter((s) => (s.tree || []).some((p) => p.pid === nodePid42)).length, '/', w42.samples.length);
const ffDesc = w42.samples.filter((s) => {
  const kids = new Map(); for (const p of s.tree || []) { if (!kids.has(p.ppid)) kids.set(p.ppid, []); kids.get(p.ppid).push(p.pid); }
  const desc = new Set(); const q = [nodePid42]; while (q.length) { const x = q.shift(); if (desc.has(x)) continue; desc.add(x); for (const c of kids.get(x) || []) q.push(c); }
  return (s.tree || []).some((p) => typeof p.exe === 'string' && p.exe.replace(/ \(deleted\)$/, '').startsWith(FF_PREFIX) && desc.has(p.pid));
}).length;
console.log('witness samples with firefox-exe descendant of nodePid:', ffDesc, '/', w42.samples.length);
runCounter('P1a committed r42, own nonce + measure record', [R42_RECEIPT, '--nonce', r42.runNonce, '--witness', R42_WITNESS, '--pins', PINS, '--measure', R42_MEASURE]);
runCounter('P1b committed r42, FRESH nonce', [R42_RECEIPT, '--nonce', freshNonce(), '--witness', R42_WITNESS, '--pins', PINS, '--measure', R42_MEASURE]);

// ---- Part 2: witness-only forgery around a COPY of the committed r41 receipt -----
const r41 = R(R41_RECEIPT);
const nodePid41 = r41.runs[0].owned.nodePid;
const ffPid41 = claimedFirefoxPid(r41);
const copy = (name, mutate) => { const c = JSON.parse(JSON.stringify(r41)); if (mutate) mutate(c); return W(name, c); };
const copyPlain = copy('r41-copy.json');
const nonceA = freshNonce();
const witnessA = handBuiltWitness({ nonce: undefined, rootPid: 777001, nodePid: 888001, ffPid: 999001, samples: 12, withNode: true });
const witnessAFile = W('witness-A-fabricated-pids.json', { ...witnessA, nonce: nonceA });
runCounter('P2a fabricated-pid witness, receipt copy untouched, fresh nonce ' + nonceA,
  [copyPlain, '--nonce', nonceA, '--witness', witnessAFile, '--pins', PINS]);

// B: genuine r41 witness, only its nonce rewritten, receipt untouched.
const nonceB = freshNonce();
const witnessBFile = W('witness-B-r41-nonce-rewritten.json', { ...R(R41_WITNESS), nonce: nonceB });
runCounter('P2b genuine r41 witness, nonce rewritten, receipt copy UNTOUCHED, fresh nonce ' + nonceB,
  [copyPlain, '--nonce', nonceB, '--witness', witnessBFile, '--pins', PINS]);

// D: fully hand-built witness referencing only the receipt's nodePid + one claimed firefox pid.
const nonceD = freshNonce();
const witnessDFile = W('witness-D-handbuilt.json', handBuiltWitness({ nonce: nonceD, rootPid: 123456, nodePid: nodePid41, ffPid: ffPid41, samples: 10, withNode: true }));
runCounter('P2c hand-built witness (receipt pids only), receipt copy UNTOUCHED, fresh nonce ' + nonceD,
  [copyPlain, '--nonce', nonceD, '--witness', witnessDFile, '--pins', PINS]);

// E1: no driver, no firefox at all -> is witness-driver-unseen emitted?
const nonceE = freshNonce();
const e1 = { schema: 'tabi-r41-witness', rootPid: 555000, nonce: nonceE, startedTicks: 18000000, endedTicks: 18000100,
  samples: Array.from({ length: 10 }, (_, i) => ({ t: 1793500000000 + i * 100, tTicks: 18000000 + i * 10, tree: [{ pid: 555001, ppid: 555000, startTicks: 18000000, exe: '/usr/bin/cat', comm: 'cat' }] })), environ: ['PATH'] };
runCounter('P2d witness with no driver and no firefox, receipt copy UNTOUCHED, fresh nonce ' + nonceE,
  [copyPlain, '--nonce', nonceE, '--witness', W('witness-E1-no-ff-no-node.json', e1), '--pins', PINS]);

// E2: nodePid never observed; firefox pid present with out-of-window startTicks.
const nonceE2 = freshNonce();
runCounter('P2e witness never observing driver pid, out-of-window startTicks, receipt copy UNTOUCHED, fresh nonce ' + nonceE2,
  [copyPlain, '--nonce', nonceE2, '--witness', W('witness-E2-node-never-observed.json', handBuiltWitness({ nonce: nonceE2, rootPid: 123456, nodePid: nodePid41, ffPid: ffPid41, samples: 10, withNode: false })), '--pins', PINS]);

// C: receipt copy with its nonce REWRITTEN (still file-only), r41 witness nonce rewritten, forged measure doc.
const nonceC = freshNonce();
const forgedMeasure = (r) => {
  const spanSum = r.runs.reduce((a, x) => a + (x.samples.at(-1).t - x.samples[0].t), 0);
  return W('forged-measure.json', { elapsedMs: spanSum + 1000, gate: { self: { forbiddenNames: [], execArgvClean: true }, child: { ok: true } } });
};
const rewriteNonce = (c) => { c.runNonce = nonceC; for (const x of c.runs) x.runNonce = nonceC; };
const receiptC = copy('r41-copy-nonce-rewritten.json', rewriteNonce);
runCounter('P2f receipt nonce rewritten + r41 witness nonce rewritten + forged measure doc, fresh nonce ' + nonceC,
  [receiptC, '--nonce', nonceC, '--witness', W('witness-C-r41-nonce-rewritten.json', { ...R(R41_WITNESS), nonce: nonceC }), '--pins', PINS, '--measure', forgedMeasure(r41)]);

// FINAL: receipt nonce rewritten + fully hand-built witness + forged measure doc.
const nonceF = freshNonce();
const receiptF = (() => { const c = JSON.parse(JSON.stringify(r41)); c.runNonce = nonceF; for (const x of c.runs) x.runNonce = nonceF; return W('r41-copy-final.json', c); })();
runCounter('P2g receipt nonce rewritten + HAND-BUILT witness + forged measure doc, fresh nonce ' + nonceF,
  [receiptF, '--nonce', nonceF, '--witness', W('witness-FINAL-handbuilt.json', handBuiltWitness({ nonce: nonceF, rootPid: 123456, nodePid: nodePid41, ffPid: ffPid41, samples: 10, withNode: true })), '--pins', PINS, '--measure', forgedMeasure(r41)]);

console.log('\n### Provenance');
console.log('node:', process.version, process.execPath, sha256(fs.readFileSync(process.execPath)));
console.log('counter:', COUNTER, sha256(fs.readFileSync(COUNTER)));
console.log('pins firefoxBinSha256:', R(PINS).producerPins.firefoxBinSha256);
console.log('counter source spawn calls:', (fs.readFileSync(COUNTER, 'utf8').match(/\bspawn\w*\s*\(/g) || []).length);
console.log('r41 run1 window ticks:', r41.runs[0].runStartTicks, '..', r41.runs[0].samples.at(-1).tTicks,
  ' run2 window ticks:', r41.runs[1].runStartTicks, '..', r41.runs[1].samples.at(-1).tTicks);
