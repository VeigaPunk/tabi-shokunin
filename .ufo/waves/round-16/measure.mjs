#!/usr/bin/env node
// tabi round-16 C1/C2 counting probe (L1-authored; replaces the dead seat
// draft measure.seat-draft-unrunnable.mjs, which never executed its C1 path).
//
// Usage (cwd-independent; ROOT is derived from this file's location):
//   node .ufo/waves/round-16/measure.mjs <REV> --claim C1
//   node .ufo/waves/round-16/measure.mjs <REV> --claim C2
//   node .ufo/waves/round-16/measure.mjs <REV> --histogram
//
// Every input byte is read from the named git revision (`git cat-file blob`),
// never from the worktree. Stdout is exactly one JSON line. Exit 0 = counted
// (count may be 0 with `failures` naming why); exit 2 = could not evaluate.
//
// C1 (operability) counts 1 only if, at REV, the measurement-binding gate is
// BEHAVIOURALLY enforced — receipts are not trusted:
//   1. scripts/check-measurement-binding.mjs and
//      scripts/selftest-measurement-binding.mjs exist at REV as regular blobs;
//      both are materialised into a temp dir and the SELFTEST is run directly
//      (it drives the gate as a child CLI against isolated temp repos);
//   2. every case line is PASS with expected_exit == actual_exit and
//      expected_reasons == actual_reasons, the line count equals the summary
//      `cases`, summary verdict is clean, and every reason in the counter-owned
//      vocabulary VOCAB is an actual reason of some PASS case, plus at least
//      one clean (exit 0, no reason) case;
//   3. the materialised gate run with `--legacy` on the REAL round-15
//      measurements.json (bytes at REV) `--at 36240c7…` (the delivered r15
//      HEAD) exits 1 with EXACTLY the honest finding set
//      C1 {counter_digest_unrecorded, counted_inputs_undeclared,
//          counter_changed_since_measurement},
//      C2 {counter_digest_mismatch, counted_inputs_undeclared}.
//      This is the counter's own oracle on real history, independent of the
//      selftest fixtures (round-15 outside spot-check routed defects 1/2).
//
// C2 (coverage) counts 1 only if, at REV:
//   1. corpus/knowledge/webmcp-chromium-loopback-round-16.md exists and cites
//      ≥1 `source: S###` row; every cited row in corpus/SOURCES.md has 13
//      pipe fields, tier A or B, status mined, and the note in used-by; at
//      least one cited row is non-own-work (opened external source); the note
//      names the receipt path;
//   2. corpus/README.md names knowledge/webmcp-chromium-loopback-round-16.md;
//   3. corpus/evidence/round-16/webmcp/receipt.json has schema
//      tabi-round16-webmcp-v1, verdict pass, caseSet.caseSetOk, every case
//      status pass, ≥11 cases including the flag-off negative control (no
//      toolsAdded) and the declarative positive (toolsAdded non-empty);
//      producerSha256 equals the sha256 of scripts/webmcp-loopback-round16.mjs
//      at REV; every case fixtureSha256 equals the sha256 of its fixture blob at
//      REV.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const GATE = 'scripts/check-measurement-binding.mjs';
const SELFTEST = 'scripts/selftest-measurement-binding.mjs';
const R15_MEASUREMENTS = 'corpus/evidence/round-15/measurements.json';
const R15_DELIVERED = '36240c70ee114347a79abb91cacab6c63044ce36';
const NOTE = 'corpus/knowledge/webmcp-chromium-loopback-round-16.md';
const README = 'corpus/README.md';
const SOURCES = 'corpus/SOURCES.md';
const RECEIPT = 'corpus/evidence/round-16/webmcp/receipt.json';
const HARNESS = 'scripts/webmcp-loopback-round16.mjs';
const VOCAB = [
  'measured_revision_not_ancestor', 'counter_digest_unrecorded', 'counter_digest_mismatch',
  'counter_changed_since_measurement', 'counted_inputs_undeclared', 'counted_input_changed',
  'argv_unsupported', 'counter_failed', 'count_not_reproduced',
  'manifest_unreadable', 'manifest_schema_invalid', 'revision_unresolved', 'git_failed',
];
const LEGACY_EXPECTED = {
  C1: ['counted_inputs_undeclared', 'counter_changed_since_measurement', 'counter_digest_unrecorded'],
  C2: ['counted_inputs_undeclared', 'counter_digest_mismatch'],
};
const REQUIRED_CASES = ['flags-off-negative-control', 'declarative-form-tool'];

const ENV = {
  PATH: process.env.PATH ?? '/usr/bin:/bin',
  HOME: process.env.HOME ?? '/tmp',
  TZ: 'UTC',
  LC_ALL: 'C',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
};

class CannotEvaluate extends Error {}

function git(args, binary = false) {
  const result = spawnSync('git', ['-c', 'core.fsmonitor=false', ...args], {
    cwd: ROOT, env: ENV, encoding: binary ? 'buffer' : 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw new CannotEvaluate(`git ${args[0]}: ${result.error.message}`);
  return result;
}

const inputsRead = new Set();
function blob(rev, path) {
  inputsRead.add(path);
  const entry = git(['ls-tree', '-z', rev, '--', path]);
  if (entry.status !== 0) throw new CannotEvaluate(`ls-tree ${path} failed`);
  const text = entry.stdout.replace(/\0$/, '');
  if (!text) return null;
  const [meta] = text.split('\t');
  const [mode, type, oid] = meta.split(' ');
  if (type !== 'blob' || (mode !== '100644' && mode !== '100755')) return null;
  const content = git(['cat-file', 'blob', oid], true);
  if (content.status !== 0) throw new CannotEvaluate(`cat-file ${path} failed`);
  return content.stdout;
}
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

function countC1(rev) {
  const failures = [];
  const gate = blob(rev, GATE);
  const selftest = blob(rev, SELFTEST);
  const legacy = blob(rev, R15_MEASUREMENTS);
  const out = { c1_binding_contracts: 0, gateSha256: gate ? sha256(gate) : null, selftestSha256: selftest ? sha256(selftest) : null };
  if (!gate || !selftest) return { ...out, failures: ['gate or selftest absent at revision'] };
  if (!legacy) return { ...out, failures: ['round-15 measurements absent at revision'] };
  const dir = mkdtempSync(join(tmpdir(), 'tabi-r16-measure-c1-'));
  try {
    mkdirSync(join(dir, 'scripts'));
    writeFileSync(join(dir, GATE), gate);
    writeFileSync(join(dir, SELFTEST), selftest);
    writeFileSync(join(dir, 'r15-measurements.json'), legacy);
    const st = spawnSync(process.execPath, [join(dir, SELFTEST)], {
      cwd: dir, env: ENV, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
    });
    const lines = (st.stdout ?? '').split('\n').filter(Boolean);
    const caseLines = lines.filter((l) => l.startsWith('case='));
    const summary = lines.at(-1) ?? '';
    const sm = /^MEASUREMENT_BINDING_SELFTEST verdict=(\S+) cases=(\d+) reasons=(\d+)$/.exec(summary);
    const caseRe = /^case=(\S+) expected_exit=(\S+) actual_exit=(\S+) expected_reasons=(\S+) actual_reasons=(\S+) (PASS|FAIL)$/;
    const seen = new Set();
    let clean = 0;
    let bad = 0;
    for (const line of caseLines) {
      const m = caseRe.exec(line);
      if (!m) { bad += 1; continue; }
      const exp = m[4] === '-' ? [] : m[4].split(',');
      const act = m[5] === '-' ? [] : m[5].split(',');
      if (m[6] !== 'PASS' || m[2] !== m[3] || !sameSet(exp, act)) { bad += 1; continue; }
      act.forEach((r) => seen.add(r));
      if (m[3] === '0' && act.length === 0) clean += 1;
    }
    const missingVocab = VOCAB.filter((r) => !seen.has(r));
    out.selftest = { exit: st.status, cases: caseLines.length, summary, bad, clean, missingVocab };
    if (st.status !== 0) failures.push(`selftest exit ${st.status}`);
    if (!sm || sm[1] !== 'clean' || Number(sm[2]) !== caseLines.length) failures.push('selftest summary absent, not clean, or case count mismatch');
    if (bad > 0) failures.push(`${bad} case lines not exact PASS`);
    if (clean === 0) failures.push('no clean positive case');
    if (missingVocab.length > 0) failures.push(`vocabulary not exercised: ${missingVocab.join(',')}`);
    if (caseLines.length < 2 * VOCAB.length) failures.push(`cases ${caseLines.length} < ${2 * VOCAB.length}`);

    const lg = spawnSync(process.execPath, [join(dir, GATE), '--legacy', join(dir, 'r15-measurements.json'),
      '--at', R15_DELIVERED, '--repo', ROOT], { cwd: dir, env: ENV, encoding: 'utf8', timeout: 120000 });
    const found = {};
    for (const line of (lg.stdout ?? '').split('\n')) {
      const m = /^finding claim=(\S+) reason=(\S+) /.exec(line);
      if (m) (found[m[1]] ??= []).push(m[2]);
    }
    out.legacy = { exit: lg.status, findings: found, at: R15_DELIVERED };
    if (lg.status !== 1) failures.push(`legacy exit ${lg.status} (expected 1)`);
    const ids = Object.keys(found).sort();
    if (!sameSet(ids, Object.keys(LEGACY_EXPECTED))) failures.push(`legacy claims ${ids.join(',')}`);
    for (const [id, want] of Object.entries(LEGACY_EXPECTED)) {
      if (!sameSet(found[id] ?? [], want)) failures.push(`legacy ${id} reasons ${(found[id] ?? []).join(',')} != ${want.join(',')}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return { ...out, c1_binding_contracts: failures.length === 0 ? 1 : 0, failures };
}

function sourceRows(text) {
  const rows = new Map();
  let inRegistry = false;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) inRegistry = line.trim() === '## Registry';
    if (!inRegistry || !/^\| S\d{3,} \|/.test(line)) continue;
    const cells = line.split('|');
    if (cells.length !== 13) { rows.set(cells[1].trim(), { malformed: true }); continue; }
    const c = cells.slice(1, 12).map((s) => s.trim());
    rows.set(c[0], { kind: c[2], tier: c[3], status: c[7], usedBy: c[10].split(/[,;]\s*/).map((s) => s.trim()) });
  }
  return rows;
}

function countC2(rev) {
  const failures = [];
  const note = blob(rev, NOTE);
  const readme = blob(rev, README);
  const sources = blob(rev, SOURCES);
  const receiptBytes = blob(rev, RECEIPT);
  const harness = blob(rev, HARNESS);
  if (!note || !receiptBytes || !harness) {
    return { c2_webmcp_held: 0, failures: ['note, receipt or harness absent at revision'] };
  }
  const noteText = note.toString('utf8');
  const cited = [...noteText.matchAll(/^source: (S\d{3,})\b/gm)].map((m) => m[1]);
  const rows = sourceRows(sources ? sources.toString('utf8') : '');
  let external = 0;
  if (cited.length === 0) failures.push('note cites no source: S### line');
  for (const id of cited) {
    const row = rows.get(id);
    if (!row || row.malformed) { failures.push(`${id} missing or malformed`); continue; }
    if (!['A', 'B'].includes(row.tier)) failures.push(`${id} tier ${row.tier}`);
    if (row.status !== 'mined') failures.push(`${id} status ${row.status}`);
    if (!row.usedBy.includes(NOTE)) failures.push(`${id} used-by lacks note`);
    if (row.kind !== 'own-work') external += 1;
  }
  if (external === 0) failures.push('no non-own-work cited row');
  if (!noteText.includes(RECEIPT)) failures.push('note does not name the receipt');
  if (!readme || !readme.toString('utf8').includes('knowledge/webmcp-chromium-loopback-round-16.md')) {
    failures.push('README does not map the note');
  }
  let receipt;
  try { receipt = JSON.parse(receiptBytes.toString('utf8')); } catch { receipt = null; }
  const caseIds = [];
  if (!receipt) failures.push('receipt unparsable');
  else {
    if (receipt.schema !== 'tabi-round16-webmcp-v1') failures.push('receipt schema');
    if (receipt.verdict !== 'pass') failures.push(`receipt verdict ${receipt.verdict}`);
    if (receipt.summary?.caseSet?.caseSetOk !== true) failures.push('caseSet not ok');
    if (receipt.producerSha256 !== sha256(harness)) failures.push('producerSha256 != harness blob');
    const cases = Array.isArray(receipt.cases) ? receipt.cases : [];
    if (cases.length < 11) failures.push(`cases ${cases.length} < 11`);
    for (const c of cases) {
      caseIds.push(c.id);
      if (c.status !== 'pass') failures.push(`case ${c.id} status ${c.status}`);
      if (c.fixture) {
        const fx = blob(rev, c.fixture);
        if (!fx || sha256(fx) !== c.fixtureSha256) failures.push(`case ${c.id} fixture digest`);
      }
    }
    for (const id of REQUIRED_CASES) if (!caseIds.includes(id)) failures.push(`missing case ${id}`);
    const off = cases.find((c) => c.id === 'flags-off-negative-control');
    const pos = cases.find((c) => c.id === 'declarative-form-tool');
    if (off && Array.isArray(off.toolsAdded) && off.toolsAdded.length !== 0) failures.push('flag-off control saw tools');
    if (pos && !(Array.isArray(pos.toolsAdded) && pos.toolsAdded.length > 0)) failures.push('positive saw no tools');
  }
  return { c2_webmcp_held: failures.length === 0 ? 1 : 0, cited, caseIds, failures };
}

function histogram(rev) {
  const sources = blob(rev, SOURCES);
  const rows = sourceRows(sources ? sources.toString('utf8') : '');
  const tiers = {};
  const status = {};
  for (const row of rows.values()) {
    tiers[row.tier] = (tiers[row.tier] ?? 0) + 1;
    status[row.status] = (status[row.status] ?? 0) + 1;
  }
  const ls = git(['ls-tree', '--name-only', rev, '--', 'corpus/knowledge/']);
  inputsRead.add('corpus/knowledge/');
  const notes = ls.stdout.split('\n').filter((p) => p.endsWith('.md')).length;
  return { sources_rows: rows.size, tiers, status, knowledge_notes: notes };
}

function main() {
  const [revArg, mode, claim] = process.argv.slice(2);
  if (!revArg || !(mode === '--histogram' || (mode === '--claim' && (claim === 'C1' || claim === 'C2')))) {
    process.stderr.write('usage: measure.mjs <REV> --claim C1|C2 | --histogram\n');
    return 2;
  }
  if (revArg.startsWith('-')) throw new CannotEvaluate('revision token');
  const resolved = git(['rev-parse', '--verify', '--end-of-options', `${revArg}^{commit}`]);
  if (resolved.status !== 0) throw new CannotEvaluate(`unresolved revision ${revArg}`);
  const revision = resolved.stdout.trim();
  let body;
  if (mode === '--histogram') body = histogram(revision);
  else if (claim === 'C1') body = countC1(revision);
  else body = countC2(revision);
  const counterSha256 = sha256(blob(revision, '.ufo/waves/round-16/measure.mjs') ?? Buffer.alloc(0));
  inputsRead.delete('.ufo/waves/round-16/measure.mjs');
  console.log(JSON.stringify({ revision, ...body, counterBlobAtRevisionSha256: counterSha256, inputsRead: [...inputsRead].sort() }));
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`MEASURE verdict=could_not_evaluate detail=${String(error.message).replace(/\s+/g, ' ')}\n`);
  process.exitCode = 2;
}
