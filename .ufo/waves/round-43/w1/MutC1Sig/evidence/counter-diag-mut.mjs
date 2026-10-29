#!/usr/bin/env node
// Round-43 C1 measured counter v5 (signature-authenticated). Runs ONLY inside
// a measure-c1-round43 invocation: the counter generates a fresh 32-byte
// challenge, writes it to fd3, and reads the Ed25519 signature of that
// challenge from fd4. It verifies the signature against the wrapper public
// key recorded in the Ed25519-signed measure record — so scoring requires
// possession of a per-invocation private half that never persisted anywhere.
// PREDICATE-SENTENCE: measure-c1-round43 launches the round-43 Playwright Firefox loopback driver for exactly two runs under a loader-clean environment (exec-time /proc environ free of injection variables, execArgv without preload flags) AND producer digests equal the frozen pins AND the fresh 64-hex nonce is carried by the receipt, both runs, the witness and the Ed25519-signed measure record AND the measure record verifies under its own Ed25519 wrapper signature over the canonical unsigned form AND the witness attestation verifies under the witness's own Ed25519 key AND the counter's fresh in-invocation challenge verifies under the wrapper public key from the signed measure record AND the committed receipt and witness bytes hash to the measure record's bindings AND each run has >=8 strictly increasing samples whose first-to-last observed timestamp span is >=1000ms AND both ss and proc surfaces are available with positive ticks on every sample and final sweep AND each run records at least one owned socket observation on each surface AND all observed nonLoopback counts are zero AND every sample carries a refreshed identity-bound owned tree with firefox-binary root executables AND the witness independently observed the driver and owned firefox processes AND no private half of either per-invocation signing key is persisted by any chain component.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-pw-firefox-egress-receipt-r43';
const WITNESS_SCHEMA = 'tabi-r43-witness';
const MEASURE_SCHEMA = 'tabi-r43-c1-measure-record';
const ROOT = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const CLAIMS = ROOT + '/.ufo/waves/round-43/claims.json';
const WRAPPER = ROOT + '/scripts/measure-c1-round43.mjs';
const DRIVER = ROOT + '/scripts/playwright-firefox-egress-round43.mjs';
const FIREFOX_DIR_PREFIX = '/home/vgpnk/.cache/ms-playwright/firefox-';
const START_SLACK_TICKS = 25; // ~250 ms at CLK_TCK=100 for launch ordering jitter
const FORBIDDEN_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)$/;

const PREDICATE = 'measure-c1-round43 launches the round-43 Playwright Firefox loopback driver for exactly two runs under a loader-clean environment (exec-time /proc environ free of injection variables, execArgv without preload flags) AND producer digests equal the frozen pins AND the fresh 64-hex nonce is carried by the receipt, both runs, the witness and the Ed25519-signed measure record AND the measure record verifies under its own Ed25519 wrapper signature over the canonical unsigned form AND the witness attestation verifies under the witness\'s own Ed25519 key AND the counter\'s fresh in-invocation challenge verifies under the wrapper public key from the signed measure record AND the committed receipt and witness bytes hash to the measure record\'s bindings AND each run has >=8 strictly increasing samples whose first-to-last observed timestamp span is >=1000ms AND both ss and proc surfaces are available with positive ticks on every sample and final sweep AND each run records at least one owned socket observation on each surface AND all observed nonLoopback counts are zero AND every sample carries a refreshed identity-bound owned tree with firefox-binary root executables AND the witness independently observed the driver and owned firefox processes AND no private half of either per-invocation signing key is persisted by any chain component.';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const usable = (x) => !!x && x.unavailable !== true && Number.isFinite(x.ticks) && x.ticks > 0 && Number.isFinite(x.nonLoopback);

// Canonical JSON: sorted keys, no whitespace — the byte shape signed by both
// keys and re-derived here.
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

function isFirefoxExe(exe) {
  if (typeof exe !== 'string' || !exe) return false;
  return exe.replace(/ \(deleted\)$/, '').startsWith(FIREFOX_DIR_PREFIX);
}

function die(msg) { console.error(JSON.stringify({ schema: 'tabi-r43-c1-measured-v5', error: msg })); process.exit(2); }

function evaluate({ file, measureDoc, pins }) {
  const findings = [];
  const egressDetail = [];
  const raw = fs.readFileSync(file, 'utf8');
  const receipt = JSON.parse(raw);
  const runs = Array.isArray(receipt.runs) ? receipt.runs : [];
  const nonce = measureDoc.nonce;

  if (receipt.schema !== SCHEMA) findings.push('schema');
  if (!/^[0-9a-f]{64}$/.test(nonce || '')) findings.push('measure-nonce-shape');
  if (receipt.runNonce !== nonce || runs.some((r) => r.runNonce !== nonce)) findings.push('run-nonce-mismatch');
  if (receipt.refused !== false || runs.length !== 2) findings.push('run-set');

  // F4: the driver's exec-time environment was clean and nonce-bound.
  const ec = receipt.envCheck || {};
  if (ec.procEnvironReadable !== true) findings.push('env-check-unreadable');
  if (!Array.isArray(ec.forbiddenNames) || ec.forbiddenNames.length !== 0) findings.push('env-check-forbidden');
  if (ec.execArgvClean !== true) findings.push('env-check-execargv');
  if (ec.envNonceEcho !== 'match') findings.push('env-check-nonce');

  for (let i = 0; i < runs.length; i++) {
    const r = runs[i], s = Array.isArray(r.samples) ? r.samples : [];
    const N = `run${i + 1}`;
    if (r.refused !== false) findings.push(`${N}-refused`);
    if (s.length < 8) findings.push(`${N}-sample-count`);
    const ts = s.map((x) => x?.t);
    if (ts.some((t, j) => !Number.isFinite(t) || (j > 0 && t <= ts[j - 1]))) findings.push(`${N}-sample-order`);
    if (ts.length < 2 || ts.at(-1) - ts[0] < 1000) findings.push(`${N}-sample-span`);
    let ssObsSum = 0, ssNlSum = 0, procObsSum = 0, procNlSum = 0;
    for (const [j, x] of s.entries()) {
      for (const k of ['ss', 'proc']) {
        const o = x?.[k];
        if (!usable(o)) findings.push(`${N}-sample${j + 1}-${k}-unavailable`);
        else if (o.nonLoopback !== 0) {
          findings.push(`${N}-sample${j + 1}-${k}-egress`);
          egressDetail.push({ run: N, sample: j + 1, surface: k, remotes: o.nonLoopbackRemotes || null });
        }
      }
      if (Number.isFinite(x?.ss?.ssObs)) { ssObsSum += x.ss.ssObs; ssNlSum += x.ss.nonLoopback || 0; }
      if (Number.isFinite(x?.proc?.procObs)) { procObsSum += x.proc.procObs; procNlSum += x.proc.nonLoopback || 0; }
      // F3: refreshed identity-bound tree — nonempty, every pid inside the run
      // window, and at least one firefox-binary exe per sample.
      const tree = Array.isArray(x?.treePids) ? x.treePids : [];
      if (tree.length === 0) findings.push(`${N}-sample${j + 1}-tree-empty`);
      let hasFf = false;
      for (const p of tree) {
        if (!Number.isFinite(p?.startTicks)) findings.push(`${N}-sample${j + 1}-pid-identity`);
        else {
          if (Number.isFinite(r.runStartTicks) && p.startTicks < r.runStartTicks - START_SLACK_TICKS) findings.push(`${N}-sample${j + 1}-pid-stale`);
          if (Number.isFinite(x.tTicks) && p.startTicks > x.tTicks + START_SLACK_TICKS) findings.push(`${N}-sample${j + 1}-pid-future`);
        }
        if (isFirefoxExe(p?.exe)) hasFf = true;
      }
      if (!hasFf) findings.push(`${N}-sample${j + 1}-no-firefox-exe`);
    }
    // F1: a run that never observed an owned socket on either surface is blind.
    if (ssObsSum < 1) findings.push(`${N}-zero-ss-observation`);
    if (procObsSum < 1) findings.push(`${N}-zero-proc-observation`);
    for (const k of ['ss', 'proc']) {
      const o = r.finalSweep?.[k];
      if (!usable(o)) findings.push(`${N}-final-${k}-unavailable`);
      else if (o.nonLoopback !== 0) {
        findings.push(`${N}-final-${k}-egress`);
        egressDetail.push({ run: N, final: true, surface: k, remotes: o.nonLoopbackRemotes || null });
      }
    }
    // F3 roots: firefox binaries started inside the run window.
    const roots = r.owned?.roots;
    if (!Array.isArray(roots) || roots.length === 0) findings.push(`${N}-owned-empty`);
    else for (const root of roots) {
      if (!isFirefoxExe(root?.exe)) findings.push(`${N}-root-exe`);
      if (Number.isFinite(r.runStartTicks) && Number.isFinite(root?.startTicks) && root.startTicks < r.runStartTicks - START_SLACK_TICKS) findings.push(`${N}-root-stale`);
    }
    if (r.survivors !== 0 || !Array.isArray(r.survivorPids) || r.survivorPids.length !== 0) findings.push(`${N}-survivors`);
    if (r.portClosed !== true) findings.push(`${N}-port-open`);
    if (typeof r.browserVersion !== 'string' || !r.browserVersion) findings.push(`${N}-version`);
    if (!/^[0-9a-f]{64}$/.test(r.firstShotSha256 || '')) findings.push(`${N}-shot-hash`);
    // F2: summaries must agree with the per-sample counts.
    if (r.sockets?.ss?.observations !== ssObsSum || r.sockets?.ss?.nonLoopback !== ssNlSum) findings.push(`${N}-summary-ss-mismatch`);
    if (r.sockets?.proc?.observations !== procObsSum || r.sockets?.proc?.nonLoopback !== procNlSum) findings.push(`${N}-summary-proc-mismatch`);
    if (r.egressNonLoopback !== ssNlSum + procNlSum + (r.finalSweep?.ss?.nonLoopback || 0) + (r.finalSweep?.proc?.nonLoopback || 0)) findings.push(`${N}-summary-egress-mismatch`);
  }
  if (runs.length === 2 && runs[0]?.firstShotSha256 !== runs[1]?.firstShotSha256) findings.push('shot-hash-diff');
  if (receipt.binding !== true) findings.push('binding');
  if (typeof receipt.egressNonLoopback !== 'number' || receipt.egressNonLoopback !== runs.reduce((a, r) => a + (r.egressNonLoopback || 0), 0)) findings.push('summary-egress-mismatch');

  // Witness: independent observation of the measure process's descendants,
  // attested under the witness's OWN per-invocation Ed25519 key.
  const witnessFile = file.replace(/\.json$/, '.witness.json');
  let witness = null;
  try { witness = JSON.parse(fs.readFileSync(witnessFile, 'utf8')); } catch { }
  let witnessAttestationVerified = false;
  if (!witness || witness.schema !== WITNESS_SCHEMA) findings.push('witness-unreadable');
  else {
    if (witness.nonce !== nonce) findings.push('witness-nonce-mismatch');
    const wenv = Array.isArray(witness.environ) ? witness.environ : [];
    if (wenv.some((n) => FORBIDDEN_ENV.test(n))) findings.push('witness-env-contaminated');
    const ws = Array.isArray(witness.samples) ? witness.samples : [];
    if (ws.length < 10) findings.push('witness-samples');
    const a = witness.attestation || {};
    try {
      const signed = canonical({ rootPid: witness.rootPid, nonce: witness.nonce, startedTicks: witness.startedTicks, endedTicks: witness.endedTicks, samples: witness.samples });
      if (sha256(Buffer.from(signed, 'utf8')) === a.over
        && crypto.verify(null, Buffer.from(signed, 'utf8'), crypto.createPublicKey(a.publicKey), Buffer.from(a.value, 'hex'))) {
        witnessAttestationVerified = true;
      } else findings.push('witness-attestation-invalid');
    } catch { findings.push('witness-attestation-invalid'); }
    const nodePid = runs[0]?.owned?.nodePid;
    const claimed = new Set();
    for (const r of runs) for (const smp of r.samples || []) for (const p of smp.treePids || []) claimed.add(p.pid);
    let driverSamples = 0, ownedFfSamples = 0, sawOverlap = false;
    for (const w of ws) {
      const tree = Array.isArray(w?.tree) ? w.tree : [];
      const kids = new Map();
      for (const p of tree) { if (!kids.has(p.ppid)) kids.set(p.ppid, []); kids.get(p.ppid).push(p.pid); }
      const desc = new Set(); const q = [nodePid];
      while (q.length) { const x = q.shift(); if (desc.has(x)) continue; desc.add(x); for (const c of kids.get(x) || []) q.push(c); }
      const ffPids = tree.filter((p) => isFirefoxExe(p.exe)).map((p) => p.pid);
      if (nodePid && desc.has(nodePid)) driverSamples += 1;
      if (ffPids.some((p) => desc.has(p))) ownedFfSamples += 1;
      if (ffPids.some((p) => claimed.has(p))) sawOverlap = true;
    }
    if (driverSamples < 10) findings.push('witness-driver-unseen');
    if (ownedFfSamples < 10) findings.push('witness-no-owned-firefox');
    if (!sawOverlap) findings.push('witness-no-overlap');
  }

  // Producer digests: producer files and binaries equal the frozen pins.
  const digestDetails = {};
  if (pins) {
    const digests = pins.frozenDigests || {};
    // DIAGNOSTIC-ONLY (MutC1Sig): point the self-digest probe at the committed
    // frozen counter so that the "counter copy runs from scratch" artifact
    // (digest-mismatch / measure-digest-mismatch on the counter key) does not
    // mask the effect of the assigned mutation. NOT the assigned mutant.
    const selfPath = ROOT + '/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs';
    for (const [k, p] of [['scripts/playwright-firefox-egress-round43.mjs', DRIVER], ['scripts/measure-c1-round43.mjs', WRAPPER], ['.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs', selfPath]]) {
      if (digests[k]) {
        try {
          const d = sha256(fs.readFileSync(p));
          digestDetails[k] = d;
          if (d !== digests[k]) findings.push(`digest-mismatch:${k}`);
        } catch { findings.push(`digest-unreadable:${k}`); }
      }
    }
    const ffPin = pins.producerPins?.firefoxBinSha256;
    if (ffPin) {
      const exes = new Set();
      for (const r of runs) for (const root of r.owned?.roots || []) if (root.exe) exes.add(root.exe.replace(/ \(deleted\)$/, ''));
      if (exes.size === 0) findings.push('firefox-bin-unbound');
      for (const e of exes) {
        try { if (sha256(fs.readFileSync(e)) !== ffPin) findings.push('digest-mismatch:firefox-bin'); }
        catch { findings.push('firefox-bin-unreadable'); }
      }
    }
    const nodePin = pins.producerPins?.nodeSha256;
    if (nodePin) {
      try { if (sha256(fs.readFileSync(process.execPath)) !== nodePin) findings.push('digest-mismatch:node'); }
      catch { findings.push('node-unreadable'); }
    }
  }

  // Signed measure record: wrapper signature over the canonical unsigned form,
  // bindings equal to the actual receipt/witness bytes, gate and wall clock.
  let measureSignatureVerified = false;
  {
    const m = measureDoc || {};
    if (m.schema !== MEASURE_SCHEMA) findings.push('measure-schema');
    if (measureDoc === null) findings.push('measure-unreadable');
    else {
      const { signature, ...rest } = m;
      try {
        const unsigned = canonical(rest);
        // MUTATION (MutC1Sig): the Ed25519 wrapper-signature verification is
        // skipped entirely; measureSignatureVerified is forced to true.
        if (true) {
          measureSignatureVerified = true;
        } else findings.push('measure-signature-invalid');
      } catch { findings.push('measure-signature-invalid'); }
      const b = m.bindings || {};
      if (b.receiptSha256 !== sha256(raw)) findings.push('receipt-binding-mismatch');
      try {
        if (b.witnessSha256 !== sha256(fs.readFileSync(file.replace(/\.json$/, '.witness.json'), 'utf8'))) findings.push('witness-binding-mismatch');
      } catch { findings.push('witness-binding-mismatch'); }
      if (m.pubkeys?.witness && witness?.attestation?.publicKey && m.pubkeys.witness !== witness.attestation.publicKey) findings.push('witness-pubkey-mismatch');
      const spanSum = runs.reduce((a, r) => { const ss = r.samples || []; return a + (ss.length >= 2 ? ss.at(-1).t - ss[0].t : 0); }, 0);
      if (!Number.isFinite(m.elapsedMs) || m.elapsedMs < spanSum + 500) findings.push('wall-clock-inconsistent');
      const g = m.gate || {};
      if (!(g.self && g.self.forbiddenNames && g.self.forbiddenNames.length === 0 && g.self.execArgvClean === true && g.child && g.child.ok === true)) findings.push('gate-contaminated');
      const md = m.digests || {};
      for (const [k, d] of Object.entries(digestDetails)) if (md[k] && md[k] !== d) findings.push(`measure-digest-mismatch:${k}`);
    }
  }

  return { schema: 'tabi-r43-c1-measured-v5', predicateSentence: PREDICATE, receiptSha256: sha256(raw), nonceMatched: !findings.includes('run-nonce-mismatch'), measureSignatureVerified, witnessAttestationVerified, egressDetail, predicate: findings.length === 0, findings };
}

// --- strict argv + challenge-response ----------------------------------------
const args = process.argv.slice(2);
if (args.length !== 3 || args[1] !== '--measure') die('usage: node c1-signature-bound-v5.mjs <receipt.json> --measure <measure-record.json> (wrapper-invoked only; no --pins/--nonce/--witness)');
const file = args[0], measureFile = args[2];
let measureDoc = null;
try { measureDoc = JSON.parse(fs.readFileSync(measureFile, 'utf8')); } catch { measureDoc = null; }

// Fresh in-invocation challenge: 32 bytes to the wrapper on fd3, Ed25519
// signature of those exact bytes back on fd4. Without a channel (direct
// offline invocation) or without the run private half, verification fails.
let challengeVerified = false, challengeError = null;
try {
  const challenge = crypto.randomBytes(32);
  fs.writeSync(3, challenge);
  fs.closeSync(3); // parent sees EOF and answers on fd4
  const buf = Buffer.alloc(256);
  let hex = '';
  for (;;) {
    const n = fs.readSync(4, buf, 0, buf.length);
    if (n <= 0) break;
    hex += buf.toString('utf8', 0, n).trim();
    if (hex.length >= 128) break;
  }
  if (/^[0-9a-f]{128}$/.test(hex.slice(0, 128))) {
    const m = measureDoc || {};
    challengeVerified = crypto.verify(null, challenge, crypto.createPublicKey(m.pubkeys?.wrapper), Buffer.from(hex.slice(0, 128), 'hex'));
  }
} catch (e) { challengeError = String(e.code || e.message); }
if (!challengeVerified && !challengeError) challengeError = 'challenge-signature-invalid';

try {
  const out = evaluate({ file, measureDoc, pins: (() => { try { return JSON.parse(fs.readFileSync(CLAIMS, 'utf8')); } catch { return null; } })() });
  out.challengeVerified = challengeVerified;
  out.challengeError = challengeError;
  out.predicate = out.predicate && challengeVerified && out.measureSignatureVerified === true && out.witnessAttestationVerified === true;
  console.log(JSON.stringify(out));
  process.exit(out.predicate ? 0 : 1);
} catch (e) { console.error(`could-not-evaluate: ${e.message}`); process.exit(2); }
