#!/usr/bin/env node
// Round-41 C1 measured counter v4. Post-hoc verification of the hardened
// measurement chain. Called by measure-c1-round41 with --nonce, --witness,
// --measure (JSON on stdin when '-') and --pins (claims.json).
// Frozen predicate sentence (byte-identical in claims.json and PREDICATE below).
import fs from 'node:fs';
import crypto from 'node:crypto';

const SCHEMA = 'tabi-pw-firefox-egress-receipt-r41';
const PREDICATE = 'measure-c1-round41 launches the round-41 Playwright Firefox loopback driver for exactly two runs under a loader-clean environment (exec-time /proc environ free of injection variables, execArgv without preload flags) AND producer digests equal the frozen pins AND the fresh 64-hex nonce is carried by the receipt and both runs AND each run has >=8 strictly increasing samples whose first-to-last observed timestamp span is >=1000ms AND both ss and proc surfaces are available with positive ticks on every sample and final sweep AND each run records at least one owned socket observation on each surface AND all observed nonLoopback counts are zero AND every sample carries a refreshed identity-bound owned tree with firefox-binary root executables and every pid startTicks inside the run window AND the independent witness observed the driver pid and a firefox-binary descendant of it on at least 10 samples AND both runs have identical firstShotSha256 AND zero survivors and closed fixture port AND browserVersion is bound AND socket summaries agree with per-sample counts AND measured wall-clock elapsed covers both sample spans AND the round-39 and round-40 receipts without this invocation nonce and schema are refused';
const FIREFOX_DIR_PREFIX = '/home/vgpnk/.cache/ms-playwright/firefox-';
const START_SLACK_TICKS = 25; // ~250 ms at CLK_TCK=100 for launch ordering jitter
const FORBIDDEN_ENV = /^(NODE_OPTIONS|NODE_PATH|NODE_EXTRA_CA_CERTS|NODE_PENDING_DEPRECATION|LD_.*|DYLD_.*|BUN_.*|PYTHONPATH|PYTHONHOME|PYTHONSTARTUP|RUBYOPT|RUBYLIB|PERL5OPT|PERL5LIB|JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)$/;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const usable = (x) => !!x && x.unavailable !== true && Number.isFinite(x.ticks) && x.ticks > 0 && Number.isFinite(x.nonLoopback);

function isFirefoxExe(exe) {
  if (typeof exe !== 'string' || !exe) return false;
  return exe.replace(/ \(deleted\)$/, '').startsWith(FIREFOX_DIR_PREFIX);
}

function evaluate({ file, nonce, witnessFile, measureDoc, pins }) {
  const findings = [];
  const raw = fs.readFileSync(file, 'utf8');
  const receipt = JSON.parse(raw);
  const runs = Array.isArray(receipt.runs) ? receipt.runs : [];

  if (receipt.schema !== SCHEMA) findings.push('schema');
  if (!/^[0-9a-f]{64}$/.test(nonce || '') || receipt.runNonce !== nonce || runs.some((r) => r.runNonce !== nonce)) findings.push('run-nonce-mismatch');
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
        else if (o.nonLoopback !== 0) findings.push(`${N}-sample${j + 1}-${k}-egress`);
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
      else if (o.nonLoopback !== 0) findings.push(`${N}-final-${k}-egress`);
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

  // Witness: independent observation of the measure process's descendants.
  if (witnessFile) {
    let witness = null;
    try { witness = JSON.parse(fs.readFileSync(witnessFile, 'utf8')); } catch { }
    if (!witness || witness.schema !== 'tabi-r41-witness') findings.push('witness-unreadable');
    else {
      if (witness.nonce !== nonce) findings.push('witness-nonce-mismatch');
      const wenv = Array.isArray(witness.environ) ? witness.environ : [];
      if (wenv.some((n) => FORBIDDEN_ENV.test(n))) findings.push('witness-env-contaminated');
      const ws = Array.isArray(witness.samples) ? witness.samples : [];
      if (ws.length < 10) findings.push('witness-samples');
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
  } else findings.push('witness-missing');

  // Producer digests: producer files and binaries equal the frozen pins.
  if (pins) {
    const digests = pins.frozenDigests || {};
    for (const k of ['scripts/playwright-firefox-egress-round41.mjs', 'scripts/measure-c1-round41.mjs', '.ufo/waves/round-41/counters/c1-session-bound-v4.mjs']) {
      if (digests[k]) {
        try { if (sha256(fs.readFileSync(`/home/vgpnk/Projects/shokunin/tabi-shokunin/${k}`)) !== digests[k]) findings.push(`digest-mismatch:${k}`); }
        catch { findings.push(`digest-unreadable:${k}`); }
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

  // Wall-clock + gate from the measure wrapper record.
  if (measureDoc) {
    const spanSum = runs.reduce((a, r) => { const ss = r.samples || []; return a + (ss.length >= 2 ? ss.at(-1).t - ss[0].t : 0); }, 0);
    if (!Number.isFinite(measureDoc.elapsedMs) || measureDoc.elapsedMs < spanSum + 500) findings.push('wall-clock-inconsistent');
    const g = measureDoc.gate || {};
    if (!(g.self && g.self.forbiddenNames && g.self.forbiddenNames.length === 0 && g.self.execArgvClean === true && g.child && g.child.ok === true)) findings.push('gate-contaminated');
  }

  return { schema: 'tabi-r41-c1-measured-v4', predicateSentence: PREDICATE, receiptSha256: sha256(raw), nonceMatched: !findings.includes('run-nonce-mismatch'), predicate: findings.length === 0, findings };
}

const args = process.argv.slice(2);
const file = args[0];
let nonce = null, witnessFile = null, pinsFile = null, measureArg = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--nonce') nonce = args[++i];
  else if (args[i] === '--witness') witnessFile = args[++i];
  else if (args[i] === '--pins') pinsFile = args[++i];
  else if (args[i] === '--measure') measureArg = args[++i];
}
if (!file || !nonce) { console.error('usage: node c1-session-bound-v4.mjs <receipt.json> --nonce <hex> [--witness <json>] [--pins <claims.json>] [--measure <json|->]'); process.exit(64); }
let pins = null, measureDoc = null;
try { if (pinsFile) pins = JSON.parse(fs.readFileSync(pinsFile, 'utf8')); } catch { console.error('pins-unreadable'); process.exit(2); }
try {
  if (measureArg === '-') measureDoc = JSON.parse(fs.readFileSync(0, 'utf8'));
  else if (measureArg) measureDoc = JSON.parse(fs.readFileSync(measureArg, 'utf8'));
} catch { console.error('measure-doc-unreadable'); process.exit(2); }
try {
  const out = evaluate({ file, nonce, witnessFile, measureDoc, pins });
  console.log(JSON.stringify(out));
  process.exit(out.predicate ? 0 : 1);
} catch (e) { console.error(`could-not-evaluate: ${e.message}`); process.exit(2); }
