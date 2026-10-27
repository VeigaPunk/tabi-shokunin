#!/usr/bin/env node
// MutEgressCases lane: mutation-test ss/proc nonLoopback + surface-availability handling
// of the frozen counter .ufo/waves/round-40/counters/c1-sample-span-v3.mjs.
// Reads production bytes read-only; writes ONLY under this scratch dir.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(ROOT, '.ufo/waves/round-40/counters/c1-sample-span-v3.mjs');
const ORIG = path.join(ROOT, 'corpus/evidence/round-39/playwright-egress/receipt.json');
const WORK = '/fast/scratch/hyaku/tabi-r40/MutEgressCases';
const SUBJECT = path.join(WORK, 'subject.json');

const nonce = crypto.randomBytes(32).toString('hex');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const runCounter = (file) => {
  const r = spawnSync(process.execPath, [COUNTER, file, '--nonce', nonce], { cwd: WORK, encoding: 'utf8', maxBuffer: 8 << 20 });
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { }
  return { exit: r.status, stdout: r.stdout.trim(), stderr: r.stderr.trim(), parsed };
};

// --- 1. Pristine synthetic positive (same recipe as selftest parser-only positive, fresh nonce) ---
const original = JSON.parse(fs.readFileSync(ORIG, 'utf8'));
const pristine = structuredClone(original);
pristine.schema = 'tabi-pw-firefox-egress-receipt-r40';
pristine.refused = false;
pristine.runNonce = nonce;
for (const r of pristine.runs) {
  r.refused = false; r.runNonce = nonce;
  const start = r.samples[0].t;
  r.samples.forEach((s, i) => {
    s.t = start + i * 150;
    for (const k of ['ss', 'proc']) { s[k].unavailable = false; s[k].ticks = 1; s[k].nonLoopback = 0; }
  });
  for (const k of ['ss', 'proc']) { r.finalSweep[k].unavailable = false; r.finalSweep[k].ticks = 1; r.finalSweep[k].nonLoopback = 0; }
  r.survivors = 0; r.survivorPids = []; r.portClosed = true;
}
const pristineRaw = JSON.stringify(pristine);
const pristineHash = sha256(pristineRaw);
fs.writeFileSync(SUBJECT, pristineRaw);

// --- 2. Baseline (pristine) must PASS; else every mutant verdict is inconclusive ---
const base = runCounter(SUBJECT);
const baselineOk = base.exit === 0 && base.parsed?.predicate === true;

// --- 3. Mutants: each applied independently to a fresh clone of pristine ---
const clone = () => structuredClone(pristine);
const mutants = [
  { name: 'ss-nonloopback-nonzero-sample1-run1', mut: (m) => { m.runs[0].samples[0].ss.nonLoopback = 1; }, exp: ['run1-sample1-ss-egress'] },
  { name: 'ss-nonloopback-nonzero-sample4-run2', mut: (m) => { m.runs[1].samples[3].ss.nonLoopback = 1; }, exp: ['run2-sample4-ss-egress'] },
  { name: 'ss-nonloopback-nonzero-final-run1', mut: (m) => { m.runs[0].finalSweep.ss.nonLoopback = 1; }, exp: ['run1-final-ss-egress'] },
  { name: 'proc-nonloopback-nonzero-sample8-run2', mut: (m) => { m.runs[1].samples[7].proc.nonLoopback = 1; }, exp: ['run2-sample8-proc-egress'] },
  { name: 'proc-nonloopback-nonzero-final-run2', mut: (m) => { m.runs[1].finalSweep.proc.nonLoopback = 1; }, exp: ['run2-final-proc-egress'] },
  { name: 'ss-unavailable-marker-sample3-run1', mut: (m) => { m.runs[0].samples[2].ss = { ticks: 0, nonLoopback: 0, unavailable: true }; }, exp: ['run1-sample3-ss-unavailable'] },
  { name: 'ss-key-removed-sample5-run2', mut: (m) => { delete m.runs[1].samples[4].ss; }, exp: ['run2-sample5-ss-unavailable'] },
  { name: 'proc-unavailable-marker-final-run1', mut: (m) => { m.runs[0].finalSweep.proc = { ticks: 0, nonLoopback: 0, unavailable: true }; }, exp: ['run1-final-proc-unavailable'] },
  { name: 'proc-key-removed-final-run2', mut: (m) => { delete m.runs[1].finalSweep.proc; }, exp: ['run2-final-proc-unavailable'] },
];
// entire-surface removals: delete every occurrence
{
  const exp1 = [];
  for (let j = 0; j < pristine.runs[0].samples.length; j++) exp1.push(`run1-sample${j + 1}-ss-unavailable`);
  exp1.push('run1-final-ss-unavailable');
  mutants.push({ name: 'ss-surface-removed-entirely-run1', mut: (m) => { for (const s of m.runs[0].samples) delete s.ss; delete m.runs[0].finalSweep.ss; }, exp: exp1 });
  const expAll = [];
  for (let i = 0; i < pristine.runs.length; i++) {
    for (let j = 0; j < pristine.runs[i].samples.length; j++) expAll.push(`run${i + 1}-sample${j + 1}-proc-unavailable`);
    expAll.push(`run${i + 1}-final-proc-unavailable`);
  }
  mutants.push({ name: 'proc-surface-removed-entirely-both-runs', mut: (m) => { for (const r of m.runs) { for (const s of r.samples) delete s.proc; delete r.finalSweep.proc; } }, exp: expAll });
}

const results = [];
for (const m of mutants) {
  const obj = clone();
  m.mut(obj);
  const raw = JSON.stringify(obj);
  fs.writeFileSync(SUBJECT, raw);
  const rc = runCounter(SUBJECT);
  const findings = rc.parsed?.findings ?? [];
  const missing = m.exp.filter((e) => !findings.includes(e));
  const unexpected = findings.filter((f) => !m.exp.includes(f));
  let verdict;
  if (!baselineOk) verdict = 'inconclusive-baseline-failed';
  else if (rc.exit === 1 && rc.parsed?.predicate === false && missing.length === 0) verdict = unexpected.length ? 'killed-with-extra-findings' : 'killed';
  else if (rc.exit === 0) verdict = 'SURVIVED';
  else verdict = 'unexpected-exit';
  results.push({
    name: m.name, mutantFileBytesSha256: sha256(raw), expectedFindings: m.exp,
    observedFindings: findings, missingExpected: missing, unexpectedFindings: unexpected,
    counterExit: rc.exit, counterPredicate: rc.parsed?.predicate ?? null, counterReceiptSha256: rc.parsed?.receiptSha256 ?? null,
    counterStdoutTruncated: rc.stdout.length > 2000 ? rc.stdout.slice(0, 2000) : undefined,
    verdict,
  });
}

// --- 4. Restore exact pristine bytes on the same path; verify hash; rerun detector ---
fs.writeFileSync(SUBJECT, pristineRaw);
const restoredHash = sha256(fs.readFileSync(SUBJECT, 'utf8'));
const restoredRun = runCounter(SUBJECT);

const out = {
  schema: 'tabi-r40-w1-mutegress-mutation-v1',
  seat: 'MutEgressCases',
  detector: '.ufo/waves/round-40/counters/c1-sample-span-v3.mjs',
  detectorSha256: sha256(fs.readFileSync(COUNTER)),
  sourceReceipt: 'corpus/evidence/round-39/playwright-egress/receipt.json',
  invocationNonceFingerprint: nonce.slice(0, 8) + '…' + nonce.slice(-4),
  baseline: {
    file: 'subject.json', bytesSha256Before: pristineHash,
    counterExit: base.exit, counterPredicate: base.parsed?.predicate ?? null,
    counterFindings: base.parsed?.findings ?? null, counterReceiptSha256: base.parsed?.receiptSha256 ?? null,
    ok: baselineOk,
  },
  mutants: results,
  restoration: {
    bytesSha256After: restoredHash, matchesBefore: restoredHash === pristineHash,
    counterExit: restoredRun.exit, counterPredicate: restoredRun.parsed?.predicate ?? null,
    counterFindings: restoredRun.parsed?.findings ?? null, counterReceiptSha256: restoredRun.parsed?.receiptSha256 ?? null,
  },
  killed: results.filter((r) => r.verdict.startsWith('killed')).length,
  survived: results.filter((r) => r.verdict === 'SURVIVED').length,
  inconclusive: baselineOk ? 0 : results.length,
};
fs.writeFileSync(path.join(WORK, 'results.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(baselineOk && out.survived === 0 && restoredHash === pristineHash && restoredRun.exit === 0 ? 0 : 1);
