#!/usr/bin/env node
// c1-egress-session-bound.mjs — tabi round 39, claim C1 (coverage capability:
// Playwright Firefox session-bound egress operation). Frozen counter.
//
// Question: does the committed receipt at REV record a session-bound egress run of
// the round-39 driver — owned nonempty pid set, dual-surface socket observation with
// sampling coverage, fail-closed semantics, zero non-loopback egress, zero survivors,
// version bound to the launched session — and does this counter refuse the round-38
// v1 receipt (the do-nothing control that skips the claimed binding work)?
//
// The counter never re-runs the browser; it verifies the committed receipt's internal
// evidence and its consistency, and refuses the known-inadequate v1 receipt.
//
// Usage: node c1-egress-session-bound.mjs --rev <40-hex REV> [--repo <lane>] [--json]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could-not-evaluate.
// Inputs: git objects of the lane at --rev; the receipt is read at --repo's worktree
// (committed measurement output). Write scope: stdout/stderr only.
// Predicate (frozen) — the same sentence in claims.json and this constant:
//   schema v2 AND two unrefused runs AND identical first-shot sha256 across runs AND
//   per-run owned tree nonempty rooted at a child of the driver node process AND at
//   least 8 socket samples per run over at least 1000 ms AND zero non-loopback socket
//   observations on both the ss and /proc surfaces including the post-close final
//   sweep AND zero survivors AND the fixture port closed AND the firefox version bound
//   from the live session AND the round-38 v1 receipt refused by this counter
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r39-c1-egress-session-bound';
const PREDICATE_SENTENCE = "schema v2 AND two unrefused runs AND identical first-shot sha256 across runs AND per-run owned tree nonempty rooted at a child of the driver node process AND at least 8 socket samples per run over at least 1000 ms AND zero non-loopback socket observations on both the ss and /proc surfaces including the post-close final sweep AND zero survivors AND the fixture port closed AND the firefox version bound from the live session AND the round-38 v1 receipt refused by this counter";
const RECEIPT = 'corpus/evidence/round-39/playwright-egress/receipt.json';
const V1_RECEIPT = 'corpus/evidence/round-38/playwright-firefox/receipt.json';
const V2_SCHEMA = 'tabi-pw-firefox-egress-receipt-v2';
const V1_SCHEMA = 'tabi-pw-firefox-receipt-v1';

class Refusal extends Error {}
const git = (repo, args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
function blob(repo, rev, path) {
  const r = git(repo, ['show', `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}
function resolveCommit(repo, rev) {
  const r = git(repo, ['rev-parse', '--verify', `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`cannot resolve ${rev}`);
  return r.stdout.trim();
}
const HEX64 = /^[0-9a-f]{64}$/;

export function evaluate({ repo, rev }) {
  const REV = resolveCommit(repo, rev);
  const out = { schema: SCHEMA, rev: REV, receipt: {}, control: {}, findings: [], predicateSentence: PREDICATE_SENTENCE, predicate: false };
  const F = (id, why) => out.findings.push({ id, why });

  // ---- do-nothing control first: the round-38 v1 receipt must be refused ----
  {
    const v1 = blob(repo, REV, V1_RECEIPT);
    if (v1 === null) { out.control.v1Present = false; F('control-v1-absent', 'round-38 v1 receipt absent; control cannot be evaluated'); }
    else {
      out.control.v1Present = true;
      let d = null;
      try { d = JSON.parse(v1); } catch { F('control-v1-unparseable', 'round-38 v1 receipt not JSON'); }
      if (d) {
        const reasons = [];
        if (d.schema !== V2_SCHEMA) reasons.push(`schema ${d.schema} != ${V2_SCHEMA}`);
        const runs = Array.isArray(d.runs) ? d.runs : [];
        runs.forEach((r, i) => {
          if (!r.owned || !Array.isArray(r.owned.tree) || r.owned.tree.length === 0) reasons.push(`run${i + 1} has no owned pid tree`);
          if (typeof r.sampleCount !== 'number' || r.sampleCount < 8) reasons.push(`run${i + 1} sampleCount ${r.sampleCount} < 8`);
        });
        if (runs.length !== 2) reasons.push(`runs ${runs.length} != 2`);
        out.control.refusalReasons = reasons;
        out.control.refused = reasons.length > 0;
        if (!out.control.refused) F('control-v1-admitted', 'round-38 v1 receipt admitted by the frozen counter — do-nothing control reaches the target');
      }
    }
  }

  // ---- the round-39 receipt ----
  let r39 = null;
  {
    const text = blob(repo, REV, RECEIPT);
    if (text === null) F('receipt-absent', `${RECEIPT} absent at REV`);
    else {
      try { r39 = JSON.parse(text); } catch { F('receipt-unparseable', `${RECEIPT} not JSON`); }
    }
  }
  if (r39) {
    const R = out.receipt;
    R.schemaOk = r39.schema === V2_SCHEMA;
    if (!R.schemaOk) F('schema', `receipt schema ${r39.schema} != ${V2_SCHEMA}`);
    R.runs = Array.isArray(r39.runs) ? r39.runs.length : 0;
    if (R.runs !== 2) F('runs', `runs ${R.runs} != 2`);
    const runs = Array.isArray(r39.runs) ? r39.runs : [];
    runs.forEach((r, i) => {
      const tag = `run${i + 1}`;
      if (r.refused === true) F(`${tag}-refused`, `run refused: ${r.refuseReason}`);
      const shots = typeof r.firstShotSha256 === 'string' && HEX64.test(r.firstShotSha256);
      if (!shots) F(`${tag}-shot`, 'first-shot sha256 missing or not 64 hex');
      const owned = r.owned && Array.isArray(r.owned.tree) && r.owned.tree.length > 0
        && Array.isArray(r.owned.roots) && r.owned.roots.length > 0
        && typeof r.owned.nodePid === 'number'
        && typeof r.owned.source === 'string' && /children of this node process/.test(r.owned.source);
      if (!owned) F(`${tag}-owned`, 'owned tree/roots/nodePid missing, empty, or not session-bound to the driver node process');
      else {
        const rootPids = new Set(r.owned.roots.map((x) => x.pid));
        const inTree = r.owned.tree.filter((p) => rootPids.has(p)).length;
        if (inTree !== r.owned.roots.length) F(`${tag}-roots-not-in-tree`, 'owned roots are not members of the owned tree');
      }
      if (typeof r.sampleCount !== 'number' || r.sampleCount < 8) F(`${tag}-samples`, `sampleCount ${r.sampleCount} < 8`);
      if (typeof r.coverageMs !== 'number' || r.coverageMs < 1000) F(`${tag}-coverage`, `coverageMs ${r.coverageMs} < 1000`);
      const ss = r.sockets && r.sockets.ss ? r.sockets.ss.nonLoopback : null;
      const pr = r.sockets && r.sockets.proc ? r.sockets.proc.nonLoopback : null;
      if (ss !== 0 || pr !== 0) F(`${tag}-egress`, `non-loopback sockets ss=${ss} proc=${pr}`);
      const fs = r.finalSweep;
      if (!fs || fs.unavailable) F(`${tag}-finalsweep`, 'post-close final sweep missing or unavailable');
      else if ((fs.ss && fs.ss.nonLoopback) !== 0 || (fs.proc && fs.proc.nonLoopback) !== 0) F(`${tag}-finalsweep-egress`, 'post-close final sweep saw non-loopback sockets');
      if (r.egressNonLoopback !== 0) F(`${tag}-egress-total`, `egressNonLoopback ${r.egressNonLoopback} != 0`);
      if (r.survivors !== 0) F(`${tag}-survivors`, `survivors ${r.survivors} != 0`);
      if (r.portClosed !== true) F(`${tag}-port`, 'fixture port not closed');
    });
    const shots = runs.map((r) => r.firstShotSha256);
    R.binding = r39.binding === true && new Set(shots).size === 1 && shots.length === 2;
    if (!R.binding) F('binding', 'two cold runs do not share one first-shot sha256');
    if (r39.egressNonLoopback !== 0) F('egress-total', `receipt egressNonLoopback ${r39.egressNonLoopback} != 0`);
    if (r39.survivors !== 0) F('survivors', `receipt survivors ${r39.survivors} != 0`);
    const ver = r39.browserVersion;
    R.versionBound = ver === '157.0' && typeof r39.userAgent === 'string' && /Firefox\/157\.0/.test(r39.userAgent)
      && typeof r39.binary === 'string' && /ms-playwright\/firefox-\d+\//.test(r39.binary);
    if (!R.versionBound) F('version', `version not session-bound: browserVersion=${ver} userAgent=${r39.userAgent} binary=${r39.binary}`);
    if (!(r39.fixture && HEX64.test(r39.fixture.sha256))) F('fixture', 'fixture sha256 missing or not 64 hex');
    R.refused = r39.refused === true;
    if (R.refused) F('refused', 'receipt records a refusal');
  }

  out.predicate = out.findings.length === 0
    && out.control.v1Present && out.control.refused === true
    && r39 && out.receipt.schemaOk && out.receipt.runs === 2 && out.receipt.binding === true
    && out.receipt.versionBound === true && out.receipt.refused === false;
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, json: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (['--repo', '--rev'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    o.repo = resolve(o.repo);
    const out = evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else {
      for (const f of out.findings) console.log(`FINDING ${f.id} ${f.why}`);
      console.log(`C1_EGRESS_SESSION_BOUND predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} findings=${out.findings.length} controlRefused=${out.control.refused}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C1_EGRESS_SESSION_BOUND verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
