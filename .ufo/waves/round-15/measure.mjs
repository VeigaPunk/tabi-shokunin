#!/usr/bin/env node
// tabi round-15 C1/C2 counting probe.
//
// Revision-based: every byte is read from the named git revision. The probe
// never runs a gate, the checker, the census, a browser, or a test. It only
// counts committed evidence. Missing round-15 evidence counts 0 (the expected
// pre-measurement state); malformed or mismatched evidence fails closed: the
// affected count is 0 and the process exits 1 so a partial result cannot be
// quoted as green.
//
// Usage:
//   node .ufo/waves/round-15/measure.mjs <revision>
//   node .ufo/waves/round-15/measure.mjs <revision> --claim C1
//   node .ufo/waves/round-15/measure.mjs <revision> --claim C2
//   node .ufo/waves/round-15/measure.mjs <revision> --histogram
//
// --claim C1 reads only corpus/evidence/round-15/user-diagnostics.json and the
// committed scripts/check-user-round-contract.mjs at its revision.
// --claim C2 reads only corpus/evidence/round-15/metadata-differential.json,
// the committed snapshot inputs/originals it names, scripts/check-aria-metadata.mjs
// and the round-14 canonical sidecar/receipt it must keep accepting. A
// malformed C1 receipt therefore cannot suppress an independent C2 count, and
// vice versa.
// --histogram reads only corpus/SOURCES.md, corpus/README.md and the
// corpus/knowledge listing at the revision.
//
// C1 receipt (L1-owned contract):
//   corpus/evidence/round-15/user-diagnostics.json
//   { schema: "tabi-round15-user-diagnostics-v1" (kind names USER diagnostics),
//     revision: <40-hex commit>,          // USER gate code revision
//     codeSha256: <64-hex>,               // USER gate blob digest at revision
//     selfTest: { exit, stdout, stderr? },
//     production: { exit, stdout, stderr? } }
//
// C1 counts 1 only when all of the following hold:
//   1. revision is an ancestor of the measured revision, the gate blob at
//      revision hashes to codeSha256, and the same gate blob at the measured
//      revision also hashes to codeSha256 (a stale receipt cannot count);
//   2. the committed gate source contains no shell binary invocation,
//      shell:true or -c flag, and its runCount implementation is non-shell;
//   3. selfTest exits 0 and prints `USER_ROUND_CONTRACT_SELFTEST verdict=clean
//      cases=N` with N >= 6 and at least as many case lines; every SELFTEST
//      case line parses, every case is PASS with expected_exit == actual_exit,
//      and expected_finding is one of the bounded shipped findings (clean,
//      usage and the gate's fail(...) vocabulary), never an arbitrary token;
//   4. at least three passing cases assert a shipped cause: `expected_reason`
//      is one of unsupported_counting_command, counting_revision_mismatch,
//      counting_command_failed, score_not_improved, before_count_mismatch,
//      after_count_mismatch, `reason` equals it, `reason=none` never counts,
//      and at least two distinct cause ids appear;
//   5. at least two reason-asserting cases are isolated fixture CLI controls
//      (`isolation=cli`; helper/in-process and production-alias names are
//      excluded by provenance if the token is absent), and at least one
//      isolated refusal (expected_exit != 0) asserts a shipped cause id, so a
//      wrong generic reason cannot pass the same control;
//   6. every case states applicability as exactly `applicable` or
//      `not_applicable` and the shipped marker tuple: applicable =>
//      marker_applicable=1, marker_outcome=absent|present, no_marker=1|0;
//      not_applicable => marker_applicable=0, marker_outcome=not-applicable,
//      no_marker=na. N/A never counts as an absence (no_marker=1) even with a
//      forged marker_outcome, and both classes must appear;
//   7. production keeps the historical honest refusal exactly: exit 1,
//      `USER_ROUND_CONTRACT verdict=failed finding=round_count`,
//      `Found 6 user rounds, expected 10`, and no clean verdict.
// Case fields are parsed as key=value tokens in any order; only lines that
// carry SELFTEST, a name/case token, expected_exit and result=PASS|FAIL are
// counted, and every such line must parse or the count fails closed. The
// shipped USER case line is:
//   SELFTEST name=<case> expected_exit=<n> actual_exit=<n>
//     expected_finding=<id> [expected_reason=<id>] reason=<id|none>
//     applicability=<applicable|not_applicable> marker_applicable=<0|1>
//     marker_outcome=<absent|present|not-applicable> no_marker=<1|0|na>
//     isolation=cli result=PASS|FAIL
//
// C2 receipt (L1-owned contract; produced by the metadata differential
// harness, not by this probe):
//   corpus/evidence/round-15/metadata-differential.json
//   { schema: "tabi-round15-metadata-differential-v1",
//     revision: <40-hex commit>,          // new ARIA gate code revision
//     codeSha256: <64-hex>,               // ARIA gate blob digest at revision
//     baseline: <40-hex commit>,          // historical ARIA gate revision
//     oldCodeSha256: <64-hex>,            // ARIA gate blob digest at baseline
//     selfTest: { exit, stdout, stderr? },
//     snapshotInputs: { "<committed path>": "<64-hex>" },
//     mirrors: [ { case: "<one of the nine required fields>",
//                  before: { exit: 0, stdout, stderr? },   // historical checker
//                  after:  { exit: 1, stdout, stderr? },   // new checker
//                  pass: true } ],
//     positive: { exit: 0, stdout, stderr?,
//                 payload?: { sidecar: { path, sha256 } } },
//     oldPositive?: { exit: 0, stdout, stderr? },   // historical checker accepts
//     tamper: { case: "spec-snapshot-digest",
//               field: "<concrete snapshot input path>",
//               recordedSha256: <64-hex>,
//               computedSha256: <64-hex>,
//               before: { exit: 1, stdout, stderr? },       // historical checker
//               after:  { exit: 2, stdout, stderr? },       // new checker
//               pass: true },
//     originalsUnchanged: { "<committed path>": true },
//     pass: true,
//     browserExecuted: false }
//
// C2 counts 1 only when all of the following hold:
//   1. revision is an ancestor of the measured revision, the ARIA gate blob at
//      revision hashes to codeSha256, and the same blob at the measured
//      revision also hashes to codeSha256 (a stale receipt cannot count);
//      baseline is an ancestor of revision and the same gate path there hashes
//      to oldCodeSha256, which differs;
//   2. selfTest is green: `ARIA_METADATA_SELFTEST verdict=clean cli_cases=N
//      helpers=M` with integer fields, N >= 6 and N + M >= case lines; all case
//      lines parse; every case is PASS with expected/actual exit and finding
//      agreement; at least 2 passing `expected_exit=1` cases name a
//      mirror/cleanup/qualification finding; at least 1 passing
//      `expected_exit=2` case names a snapshot-tampered finding id; at least 2
//      fixture digest literals have `expected_sha256 == actual_sha256`;
//   3. snapshotInputs is a non-empty path→digest map and every named input is
//      committed at the measured revision with exactly that digest;
//   4. mirrors contains exactly the nine newly enforced differentials:
//      cleanup.{allClosed,allRefusedAfterClose,allNotListeningAfter,
//      derivedListeningAfter,perWorkerCount,summaryServerOk},
//      qualification.{everyProofListensBefore,everyProofClosed,
//      everyProofRefusedAfterClose}. A subset, duplicate or extra case is an
//      error. For each case the historical checker accepts the false mirror
//      (before exit 0, clean, accepted=true), the new checker refuses it
//      (after exit 1, accepted=false, exactly one non-acceptance finding that
//      names the mirror/cleanup/qualification context; an acceptance-summary
//      id may accompany it), and pass=true;
//   5. tamper binds an authenticated identity: field is a concrete path listed
//      in snapshotInputs, recordedSha256 equals snapshotInputs[field],
//      computedSha256 is a different 64-hex digest, the historical authentic
//      checker refuses the SHA mismatch with exit 1 and exactly one SOURCE
//      finding and never reports could-not-evaluate or snapshot tampering, the
//      new checker exits 2 with a snapshot-tampered finding id plus an explicit
//      could-not-evaluate classification and no clean verdict, and pass=true;
//   6. positive accepts the canonical correction: exit 0, `ARIA_METADATA check
//      verdict=clean`, structured accepted=true, and the sidecar named by
//      positive.payload.sidecar (or positive.sidecar) is the round-14
//      corpus/evidence/round-14/aria-metadata/corrected.json whose bytes hash
//      to the digest pinned by the round-14 verification receipt, so the
//      historical sidecar stays byte-for-byte immutable;
//   7. originalsUnchanged is a boolean map marking the round-14 corrected
//      sidecar and the round-13 receipt/pin unchanged, and each of those
//      committed digests is verified through snapshotInputs; the receipt is
//      marked pass=true and states browserExecuted=false without claiming new
//      coverage.
//
// Scalars are unchanged: this probe reports no ordinal score delta.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const C1_RECEIPT = 'corpus/evidence/round-15/user-diagnostics.json';
const C1_CHECKER = 'scripts/check-user-round-contract.mjs';
const C2_RECEIPT = 'corpus/evidence/round-15/metadata-differential.json';
const C2_CHECKER = 'scripts/check-aria-metadata.mjs';
const C2_SIDECAR = 'corpus/evidence/round-14/aria-metadata/corrected.json';
const C2_HISTORICAL_RECEIPT = 'corpus/evidence/round-14/aria-metadata/verification.json';
const ORIGINAL_RECEIPT = 'corpus/evidence/round-13/aria/receipt.json';
const ORIGINAL_PIN = 'corpus/evidence/round-13/aria/runtime-pin.json';
const C2_SOURCES = 'corpus/SOURCES.md';
const C2_README = 'corpus/README.md';

const CENSUS_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi';
const CENSUS_VALIDATE_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi';

// Historical expected results. Changing this baseline is a new round, not a
// measurement repair: C1 is only the count of a USER counter that keeps its
// honest refusal while proving its reason/applicability diagnostics.
const USER_PREFIX = 'USER_ROUND_CONTRACT';
const USER_EXPECTED = { exit: 1, finding: 'round_count', rounds: 6, expectedRounds: 10 };
const MIN_SELFTEST_CASES = 6;

// Exact shipped cause ids. A diagnostic reason outside this set is not a
// shipped cause and cannot satisfy the C1 contract.
const COUNT_REASONS = new Set([
  'unsupported_counting_command',
  'counting_revision_mismatch',
  'counting_command_failed',
  'score_not_improved',
  'before_count_mismatch',
  'after_count_mismatch',
]);

// Bounded expected-finding vocabulary: every finding the USER gate can raise
// (fail(...) sites in the committed source) plus the clean token. An arbitrary
// expected_finding string is not evidence about a shipped outcome.
const USER_FINDINGS = new Set([
  'clean',
  'consequential_action',
  'could_not_evaluate',
  'evidence_moved',
  'history_rewritten',
  'missing_gate',
  'missing_score',
  'public_observation',
  'report_commit',
  'report_missing',
  'report_not_after_commit',
  'report_shonen',
  'round_count',
  'round_sequence',
  'score_mismatch',
  'selftest_failure',
  'short_swarm',
  'swarm_evidence',
  'usage',
  'witness_failure',
]);

// The nine newly enforced cleanup/qualification mirrors. The differential
// harness emits exactly these; a subset receipt is not a C2 count.
const REQUIRED_MIRRORS = [
  'cleanup.allClosed',
  'cleanup.allRefusedAfterClose',
  'cleanup.allNotListeningAfter',
  'cleanup.derivedListeningAfter',
  'cleanup.perWorkerCount',
  'cleanup.summaryServerOk',
  'qualification.everyProofListensBefore',
  'qualification.everyProofClosed',
  'qualification.everyProofRefusedAfterClose',
];

const MIRROR_FINDING = /mirror|cleanup|qualif|listening|context|sidecar/i;
const SNAPSHOT_CASE = /snapshot|digest|sha|input|pin|receipt|identity/i;
const SHELL_CALL = /(?:spawnSync|execSync|execFileSync|spawn|execFile)\s*\(\s*(['"`])(?:bash|sh|zsh|dash|fish|ksh)\1/i;
const SHELL_TRUE = /\bshell\s*:\s*true\b/i;
const SHELL_C = /(['"`])-c\1/;

function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: null, maxBuffer: 64 * 1024 * 1024 });
}

function resolveRevision(argument) {
  if (!argument || argument.startsWith('-') || /\s/.test(argument)) {
    throw Object.assign(new Error('Usage: node .ufo/waves/round-15/measure.mjs REV [--claim C1|C2 | --histogram]'), { exit: 2 });
  }
  const result = git(['rev-parse', '--verify', `${argument}^{commit}`]);
  if (result.error || result.status !== 0) {
    throw Object.assign(new Error(`Cannot resolve revision: ${argument}`), { exit: 2 });
  }
  return result.stdout.toString('utf8').trim();
}

function treeEntry(revision, path) {
  const result = git(['ls-tree', '-r', revision, '--', path]);
  if (result.error || result.status !== 0) return null;
  const stdout = result.stdout ? result.stdout.toString('utf8') : '';
  const line = stdout.split('\n').find(row => row.split('\t')[1] === path);
  if (!line) return null;
  return { mode: line.split(' ')[0] };
}

function fileAt(revision, path) {
  const entry = treeEntry(revision, path);
  if (!entry || (entry.mode !== '100644' && entry.mode !== '100755')) return null;
  const result = git(['show', `${revision}:${path}`]);
  if (result.error || result.status !== 0) return null;
  return result.stdout && result.stdout.length ? result.stdout : null;
}

function listAt(revision, prefix) {
  const result = git(['ls-tree', '-r', '--name-only', revision, '--', prefix]);
  if (result.error || result.status !== 0) return [];
  return (result.stdout ? result.stdout.toString('utf8') : '').split('\n').filter(Boolean);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function reader(revision) {
  return {
    revision,
    file: path => fileAt(revision, path),
    sha: path => {
      const bytes = fileAt(revision, path);
      return bytes ? sha256(bytes) : null;
    },
    list: prefix => listAt(revision, prefix),
  };
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.length > 0;
const isInt = value => Number.isInteger(value);
const isHex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isCommitHex = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const outputOf = stream => [
  typeof stream.stdout === 'string' ? stream.stdout : '',
  typeof stream.stderr === 'string' ? stream.stderr : '',
].join('\n');
const normalizeDot = value => value.replace(/^\.\//, '');
// Exact field identity: an indexed mirror (perWorker[1].closed) is its own
// emitted field, never collapsed into a family wildcard.
const normalizeField = value => value.trim();
const normalizeReason = value => value.toLowerCase().replace(/-/g, '_');
const ROOT_PREFIX = `${ROOT}/`;
// Receipt paths are repository-relative; an absolute path under ROOT is the
// same file and is accepted after stripping the prefix.
const repoPath = value => {
  const normalized = normalizeDot(value);
  return normalized.startsWith(ROOT_PREFIX) ? normalized.slice(ROOT_PREFIX.length) : normalized;
};

function resolveCommitish(value) {
  if (!isCommitHex(value)) return null;
  const result = git(['rev-parse', '--verify', `${value}^{commit}`]);
  if (result.error || result.status !== 0) return null;
  return result.stdout.toString('utf8').trim();
}

function isAncestor(candidate, descendant) {
  return git(['merge-base', '--is-ancestor', candidate, descendant]).status === 0;
}

// Case fields are key=value tokens in any order. The first occurrence wins so a
// later `finding=` cannot overwrite `expected_finding=`.
function tokensOf(text) {
  const tokens = new Map();
  for (const match of text.matchAll(/([A-Za-z_][A-Za-z0-9_]*)=([^\s]+)/g)) {
    if (!tokens.has(match[1])) tokens.set(match[1], match[2]);
  }
  return tokens;
}

function caseLineList(text) {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => /\bSELFTEST\b/.test(line)
      && /(?:^|\s)(?:name|case)=/.test(line)
      && /\bresult=(?:PASS|FAIL)\b/.test(line));
}

function selftestCases(text) {
  const cases = [];
  for (const line of caseLineList(text)) {
    const tokens = tokensOf(line);
    const result = tokens.get('result');
    if (result !== 'PASS' && result !== 'FAIL') continue;
    const name = tokens.get('name') ?? tokens.get('case');
    const expectedExit = Number(tokens.get('expected_exit'));
    const actualExit = Number(tokens.get('actual_exit') ?? tokens.get('exit'));
    if (!name || !Number.isInteger(expectedExit) || !Number.isInteger(actualExit)) continue;
    cases.push({
      name,
      result,
      expectedExit,
      actualExit,
      expectedFinding: tokens.get('expected_finding') ?? null,
      finding: tokens.get('finding') ?? null,
      expectedReason: tokens.get('expected_reason') ?? null,
      reason: tokens.get('reason') ?? tokens.get('actual_reason') ?? tokens.get('observed_reason') ?? null,
      applicability: tokens.get('applicability') ?? tokens.get('applicable') ?? null,
      isolation: tokens.get('isolation') ?? tokens.get('via') ?? null,
      markerApplicable: tokens.get('marker_applicable') ?? null,
      markerOutcome: tokens.get('marker_outcome') ?? null,
      noMarker: tokens.get('no_marker') ?? null,
    });
  }
  return cases;
}

function digestLiteralLines(text) {
  const lines = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const tokens = tokensOf(line);
    if (!tokens.has('expected_sha256') || !tokens.has('actual_sha256')) continue;
    lines.push({
      name: tokens.get('name') ?? tokens.get('case') ?? tokens.get('fixture') ?? 'unnamed',
      expected: tokens.get('expected_sha256'),
      actual: tokens.get('actual_sha256'),
      result: tokens.get('result') ?? null,
    });
  }
  return lines;
}

function ariaCheckClean(text) {
  return /^ARIA_METADATA(?:\s+check|(?:[_-][A-Za-z]+)*)\s+verdict=clean\b/m.test(text);
}

// A red arm may name its finding structurally (finding/redFinding/findings) or
// through shipped stdout. A shipped findings list is accepted only when it
// names exactly one distinct finding; a multi-finding list is ambiguous.
function findingTokens(text) {
  const found = new Set();
  for (const match of text.matchAll(/(?:^|\s)(?:red_)?finding=([A-Za-z0-9._:-]+)/g)) found.add(match[1]);
  for (const match of text.matchAll(/^ARIA_METADATA findings\s+([A-Za-z0-9._:-]+)\s*$/gm)) found.add(match[1]);
  return [...found];
}

// Finding identities may arrive as a bare key=value token, as an
// ARIA_METADATA findings line, or as a JSON payload whose finding/findings
// field names an id. A payload list is accepted only when exactly one entry is
// failed or the list names one id; anything else stays ambiguous.
function findingFromValue(value) {
  if (isText(value)) {
    const first = value.trim().split(/\s+/)[0];
    return first || null;
  }
  if (isObject(value)) {
    if (isText(value.id)) return value.id;
    if (isText(value.finding)) return value.finding;
    return null;
  }
  if (Array.isArray(value)) {
    const ids = value.map(item => {
      if (isText(item)) return item.trim().split(/\s+/)[0];
      if (!isObject(item)) return null;
      if (isText(item.id)) return item.id;
      if (isText(item.finding)) return item.finding;
      return null;
    }).filter(Boolean);
    const failed = value.filter(item => isObject(item)
      && (/fail/i.test(String(item.status ?? '')) || item.ok === false));
    const failedIds = failed.map(item => (isText(item.id) ? item.id : null)).filter(Boolean);
    if (failedIds.length === 1) return failedIds[0];
    return ids.length === 1 ? ids[0] : null;
  }
  return null;
}

function findingOf(object) {
  if (!isObject(object)) return null;
  for (const key of ['finding', 'redFinding', 'red_finding', 'findingId', 'findings']) {
    const found = findingFromValue(object[key]);
    if (found) return found;
  }
  return null;
}

function structuredFinding(stream) {
  if (!isObject(stream)) return null;
  const direct = findingOf(stream);
  if (direct) return direct;
  for (const key of ['payload', 'result']) {
    const nested = findingOf(stream[key]);
    if (nested) return nested;
  }
  return null;
}

function payloadsIn(text) {
  const payloads = [];
  for (const line of text.split('\n')) {
    const start = line.indexOf('{');
    if (start < 0) continue;
    try {
      const value = JSON.parse(line.slice(start));
      if (isObject(value)) payloads.push(value);
    } catch {
      // A log line that merely contains a brace is not a payload.
    }
  }
  return payloads;
}

function namedFinding(stream) {
  const structured = structuredFinding(stream);
  if (structured) return structured;
  const text = outputOf(stream);
  for (const payload of payloadsIn(text)) {
    const found = structuredFinding(payload);
    if (found) return found;
  }
  const tokens = findingTokens(text);
  return tokens.length === 1 ? tokens[0] : null;
}

// snapshot_tampered may be printed as the stable id, mixed case, or inside a
// longer shipped finding id such as R15-ARIA-SNAPSHOT-TAMPERED-01.
function isSnapshotTampered(finding) {
  return isText(finding) && /snapshot/i.test(finding) && /tamper/i.test(finding);
}

function textOf(value) {
  if (isText(value)) return value;
  if (isObject(value)) return outputOf(value);
  return '';
}

// A captured arm may carry the parsed payload beside stdout. Both are evidence
// about the same execution; the probe reads either, never a new field.
function objectsOf(value) {
  const objects = [];
  if (!isObject(value)) return objects;
  objects.push(value);
  for (const key of ['payload', 'result']) {
    if (isObject(value[key])) objects.push(value[key]);
  }
  return objects;
}

function classificationValues(value) {
  const text = textOf(value);
  const values = new Set();
  for (const match of text.matchAll(/(?:classification|verdict|status)=([A-Za-z0-9._:-]+)/g)) values.add(match[1]);
  for (const object of objectsOf(value)) {
    for (const key of ['classification', 'verdict', 'status']) {
      if (isText(object[key])) values.add(object[key]);
    }
  }
  for (const payload of payloadsIn(text)) {
    for (const object of objectsOf(payload)) {
      for (const key of ['classification', 'verdict', 'status']) {
        if (isText(object[key])) values.add(object[key]);
      }
    }
  }
  return [...values];
}

function isCouldNotEvaluate(value) {
  return classificationValues(value).some(entry => normalizeReason(entry) === 'could_not_evaluate');
}

// accepted may live in the structured payload (accepted/acceptedCorrection) or
// in shipped stdout tokens. No top-level receipt field is invented.
function acceptedValue(value) {
  const text = textOf(value);
  for (const object of objectsOf(value)) {
    for (const key of ['accepted', 'acceptedCorrection', 'acceptedSidecar']) {
      if (object[key] === true) return true;
      if (object[key] === false) return false;
    }
  }
  for (const payload of payloadsIn(text)) {
    for (const object of objectsOf(payload)) {
      for (const key of ['accepted', 'acceptedCorrection', 'acceptedSidecar']) {
        if (object[key] === true) return true;
        if (object[key] === false) return false;
      }
    }
  }
  if (/\baccepted=true\b/.test(text)) return true;
  if (/\baccepted=false\b/.test(text)) return false;
  return null;
}

// A refusal payload may name a field failure plus its acceptance summary. This
// collector preserves every distinct finding id so the caller can require
// exactly one non-acceptance failure and no foreign ids.
function findingIdsOfValue(value) {
  if (isText(value)) {
    const first = value.trim().split(/\s+/)[0];
    return first ? [first] : [];
  }
  if (isObject(value)) {
    const ids = [];
    if (isText(value.id)) ids.push(value.id);
    if (isText(value.finding)) ids.push(value.finding);
    return ids;
  }
  if (Array.isArray(value)) return value.flatMap(findingIdsOfValue);
  return [];
}

function allFindingIds(stream) {
  const ids = new Set();
  const collect = object => {
    if (!isObject(object)) return;
    for (const key of ['finding', 'redFinding', 'red_finding', 'findingId', 'findings']) {
      for (const id of findingIdsOfValue(object[key])) ids.add(id);
    }
  };
  for (const object of objectsOf(stream)) collect(object);
  const text = textOf(stream);
  for (const payload of payloadsIn(text)) {
    for (const object of objectsOf(payload)) collect(object);
  }
  for (const id of findingTokens(text)) ids.add(id);
  return [...ids];
}

// Return the top-level function body, ending at the first column-zero closing
// brace. These gates are script-style files with one top-level definition per
// function; a missing body is a fail-closed result, never "no shell found".
function functionBody(source, name) {
  const patterns = [
    new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\s*\\(`),
    new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?(?:function\\s*)?\\(`),
  ];
  let start = null;
  for (const pattern of patterns) {
    const match = pattern.exec(source);
    if (match) {
      start = match.index + match[0].length;
      break;
    }
  }
  if (start === null) return null;
  const open = source.indexOf('{', start);
  if (open < 0) return null;
  const lines = source.slice(open).split('\n');
  const body = [lines[0]];
  for (let index = 1; index < lines.length; index++) {
    body.push(lines[index]);
    if (/^\}\s*;?\s*$/.test(lines[index])) break;
  }
  return body.join('\n');
}

function codeOnly(source) {
  return source.split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return !(trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*'));
    })
    .join('\n');
}

function analyzeRunCount(source) {
  const body = functionBody(codeOnly(source), 'runCount');
  if (!body) return { ok: false, finding: 'run_count_absent', detail: 'no runCount implementation' };
  if (SHELL_CALL.test(body)) return { ok: false, finding: 'run_count_shell', detail: 'runCount still invokes a shell binary' };
  if (SHELL_TRUE.test(body)) return { ok: false, finding: 'run_count_shell', detail: 'runCount still passes shell:true' };
  if (SHELL_C.test(body)) return { ok: false, finding: 'run_count_shell', detail: 'runCount still passes a -c flag' };
  return { ok: true, finding: null, detail: 'non_shell' };
}

// Exact shipped applicability strings only. No boolean aliases: the gate emits
// applicable / not_applicable and the probe binds those two literally.
function normalizeApplicability(value) {
  if (!isText(value)) return null;
  if (value === 'applicable') return 'applicable';
  if (value === 'not_applicable') return 'not_applicable';
  return 'invalid';
}

// Self-test provenance fallback when an isolation token is absent. The shipped
// gate marks fixture reason controls isolation=cli; these names are helpers,
// in-process witnesses or the production alias and are never fixture CLI
// controls.
const NON_ISOLATED_CASE = /^(?:count_committed_|count_witness|reason_negative_control|diagnostic_witness_comparison|production_)/i;
const isIsolatedCase = name => !NON_ISOLATED_CASE.test(name);

function parseJson(raw, label, add) {
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    add('malformed_receipt', `${label} is not JSON`);
    return null;
  }
}

// Both receipts name their checker revision and the exact committed blob
// digest. A receipt that cites an uncommitted, rewritten or later revision is
// not evidence about the code that ran.
function validateCommitPin(receipt, revision, checkerPath, add) {
  if (!isHex(receipt.codeSha256)) add('checker_source', 'codeSha256 is not a 64-hex digest');
  const codeRevision = resolveCommitish(receipt.revision);
  if (!codeRevision) {
    add('receipt_revision', 'revision is not a resolvable 40-hex commit');
    return { codeRevision: null, digest: null };
  }
  if (!isAncestor(codeRevision, revision)) {
    add('receipt_revision', 'revision is not an ancestor of the measured revision');
  }
  const bytes = reader(codeRevision).file(checkerPath);
  const digest = bytes ? sha256(bytes) : null;
  if (!bytes) add('checker_source', `${checkerPath} is not committed at revision`);
  else if (isHex(receipt.codeSha256) && receipt.codeSha256 !== digest) {
    add('checker_source', 'codeSha256 differs from the committed checker at revision');
  }
  // The receipt must describe the code at the measured revision too: a stale
  // receipt captured before a later gate change cannot count 1.
  const measuredBytes = reader(revision).file(checkerPath);
  const measuredDigest = measuredBytes ? sha256(measuredBytes) : null;
  if (!measuredBytes) add('checker_source', `${checkerPath} is not committed at the measured revision`);
  else if (isHex(receipt.codeSha256) && receipt.codeSha256 !== measuredDigest) {
    add('checker_stale', 'codeSha256 differs from the gate blob at the measured revision');
  }
  return { codeRevision, digest };
}

function cleanArm(stream, label, detail, add) {
  if (!isObject(stream) || !isInt(stream.exit) || typeof stream.stdout !== 'string') {
    add(`${label}_before`, `${detail} must be {exit,stdout}`);
    return;
  }
  if (stream.stderr !== undefined && typeof stream.stderr !== 'string') {
    add(`${label}_before`, `${detail} stderr must be text`);
  }
  if (stream.exit !== 0) add(`${label}_before`, `${detail} exit ${stream.exit}, expected 0`);
  const text = outputOf(stream);
  if (!ariaCheckClean(text)) add(`${label}_before`, `${detail} has no clean verdict`);
  const accepted = acceptedValue(stream);
  if (accepted !== true) add(`${label}_before`, `${detail} does not report accepted=true`);
  if (accepted === false || /\baccepted=false\b/.test(text)) add(`${label}_before`, `${detail} reports accepted=false`);
}

function refusalArm(stream, expectedExit, label, name, add) {
  if (!isObject(stream) || !isInt(stream.exit) || typeof stream.stdout !== 'string') {
    add(`${label}_after`, `${name} refusal must be {exit,stdout}`);
    return null;
  }
  if (stream.stderr !== undefined && typeof stream.stderr !== 'string') {
    add(`${label}_after`, `${name} refusal stderr must be text`);
  }
  if (stream.exit !== expectedExit) add(`${label}_after`, `${name} exit ${stream.exit}, expected ${expectedExit}`);
  if (ariaCheckClean(outputOf(stream))) add(`${label}_after`, `${name} still claims a clean verdict`);
  return stream;
}

export function countC1(revision, read = reader(revision)) {
  const result = {
    count: 0,
    present: false,
    cases: {
      total: 0,
      passing: 0,
      reasonAssertions: 0,
      distinctReasons: [],
      applicable: 0,
      notApplicable: 0,
      isolatedCli: 0,
      negativeReason: 0,
      markerApplicability: 0,
    },
    production: 'invalid',
    errors: [],
    reasons: [],
  };
  const raw = read.file(C1_RECEIPT);
  if (!raw) {
    result.reasons.push('round-15 USER diagnostics receipt missing');
    return result;
  }
  result.present = true;
  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });
  const receipt = parseJson(raw, C1_RECEIPT, add);
  if (!receipt) return result;
  if (!isObject(receipt)) {
    add('malformed_receipt', `${C1_RECEIPT} is not an object`);
    return result;
  }
  const label = [receipt.schema, receipt.kind].filter(isText).join(' ');
  if (!/user/i.test(label) || !/diagnostic|reason/i.test(label)) {
    add('receipt_kind', 'receipt schema/kind does not name a USER diagnostics/reason receipt');
  }

  const pin = validateCommitPin(receipt, revision, C1_CHECKER, add);
  const sourceBytes = pin.codeRevision ? reader(pin.codeRevision).file(C1_CHECKER) : null;
  if (sourceBytes) {
    const source = sourceBytes.toString('utf8');
    const code = codeOnly(source);
    const runCount = analyzeRunCount(source);
    if (!runCount.ok) add(runCount.finding, runCount.detail);
    if (SHELL_CALL.test(code)) add('shell_execution', 'USER gate source still contains a shell binary invocation');
    if (SHELL_TRUE.test(code)) add('shell_execution', 'USER gate source still contains shell:true');
  }

  const selfTest = receipt.selfTest;
  if (!isObject(selfTest) || !isInt(selfTest.exit) || typeof selfTest.stdout !== 'string') {
    add('malformed_self_test', 'selfTest must be {exit,stdout}');
  } else {
    if (selfTest.stderr !== undefined && typeof selfTest.stderr !== 'string') {
      add('malformed_self_test', 'selfTest.stderr must be text');
    }
    const text = outputOf(selfTest);
    const summary = new RegExp(`^${USER_PREFIX}_SELFTEST verdict=clean cases=(\\d+)\\b`, 'm').exec(text);
    const caseLines = caseLineList(text);
    const cases = selftestCases(text);
    if (caseLines.length !== cases.length) {
      add('malformed_case_line', `${caseLines.length - cases.length} SELFTEST case line(s) did not parse`);
    }
    const failures = cases.filter(entry => entry.result !== 'PASS');
    if (selfTest.exit !== 0) add('self_test_red', `selfTest exit ${selfTest.exit}, expected 0`);
    if (!summary) add('self_test_not_green', 'missing clean USER_ROUND_CONTRACT_SELFTEST summary');
    else if (Number(summary[1]) < MIN_SELFTEST_CASES) {
      add('self_test_thin', `only ${summary[1]} self-test cases, need >= ${MIN_SELFTEST_CASES}`);
    } else if (Number(summary[1]) < cases.length) {
      add('self_test_tally', `summary cases=${summary[1]} is below ${cases.length} emitted case lines`);
    }
    if (cases.length === 0) add('self_test_no_cases', 'no SELFTEST case lines');
    if (/\bresult=FAIL\b/.test(text) || failures.length) {
      add('self_test_red', `selfTest reports ${failures.length || 'some'} failing cases`);
    }

    const passing = cases.filter(entry => entry.result === 'PASS');
    const reasonIds = new Set();
    result.cases.total = cases.length;
    result.cases.passing = passing.length;
    for (const entry of passing) {
      if (entry.expectedExit !== entry.actualExit) {
        add('self_test_red', `case ${entry.name} claims PASS with expected_exit ${entry.expectedExit}, actual_exit ${entry.actualExit}`);
      }
      if (!entry.expectedFinding) {
        add('self_test_no_expected_finding', `case ${entry.name} does not state expected_finding`);
      } else if (!USER_FINDINGS.has(entry.expectedFinding)) {
        add('self_test_finding_unknown', `case ${entry.name} expected_finding ${entry.expectedFinding} is not a shipped finding`);
      } else if (entry.finding && entry.expectedFinding !== entry.finding) {
        add('self_test_finding_mismatch', `case ${entry.name} expected_finding ${entry.expectedFinding}, finding ${entry.finding}`);
      }
      // Exact shipped applicability strings on every case; absence is an error.
      const applicability = normalizeApplicability(entry.applicability);
      if (applicability === null) {
        add('self_test_applicability_missing', `case ${entry.name} does not state applicability`);
      } else if (applicability === 'invalid') {
        add('self_test_applicability', `case ${entry.name} applicability ${entry.applicability} is not applicable/not_applicable`);
      }
      if (applicability === 'applicable') result.cases.applicable++;
      if (applicability === 'not_applicable') result.cases.notApplicable++;
      if (entry.expectedReason !== null) {
        const expectedReason = normalizeReason(entry.expectedReason);
        const actualReason = entry.reason === null ? null : normalizeReason(entry.reason);
        if (!COUNT_REASONS.has(expectedReason)) {
          add('self_test_reason_unknown', `case ${entry.name} expected_reason ${entry.expectedReason} is not a shipped COUNT_REASONS id`);
        } else if (actualReason === null || actualReason === 'none') {
          add('self_test_reason_missing', `case ${entry.name} asserts expected_reason without a concrete reason`);
        } else if (actualReason !== expectedReason) {
          add('self_test_reason_mismatch', `case ${entry.name} expected_reason ${entry.expectedReason}, reason ${entry.reason}`);
        } else {
          result.cases.reasonAssertions++;
          reasonIds.add(expectedReason);
          const isolated = entry.isolation !== null
            ? entry.isolation.toLowerCase() === 'cli'
            : isIsolatedCase(entry.name);
          if (isolated) {
            result.cases.isolatedCli++;
            if (entry.expectedExit !== 0) result.cases.negativeReason++;
          }
        }
      }
      // Exact shipped marker tuple. N/A is marker_applicable=0,
      // marker_outcome=not-applicable, no_marker=na: it never counts as an
      // absence (no_marker=1) and a forged marker_outcome cannot upgrade it.
      const noMarker = entry.noMarker === null ? null : entry.noMarker.toLowerCase();
      const markerApplicable = entry.markerApplicable === null ? null : entry.markerApplicable.toLowerCase();
      const markerOutcome = entry.markerOutcome === null ? null : entry.markerOutcome.toLowerCase();
      if (markerApplicable === null || (markerApplicable !== '0' && markerApplicable !== '1')) {
        add('self_test_marker_applicability', `case ${entry.name} marker_applicable ${entry.markerApplicable ?? 'missing'} is not 0/1`);
      }
      if (noMarker === null || !['1', '0', 'na'].includes(noMarker)) {
        add('self_test_marker_applicability', `case ${entry.name} no_marker ${entry.noMarker ?? 'missing'} is not 1/0/na`);
      }
      if (markerOutcome === null || !['absent', 'present', 'not-applicable'].includes(markerOutcome)) {
        add('self_test_marker_applicability', `case ${entry.name} marker_outcome ${entry.markerOutcome ?? 'missing'} is not absent/present/not-applicable`);
      }
      if (applicability === 'applicable') {
        if (markerApplicable !== '1') {
          add('self_test_marker_applicability', `case ${entry.name} is applicable but marker_applicable=${entry.markerApplicable ?? 'missing'}`);
        }
        if (markerOutcome !== 'absent' && markerOutcome !== 'present') {
          add('self_test_marker_applicability', `case ${entry.name} is applicable but marker_outcome=${entry.markerOutcome ?? 'missing'}`);
        }
        if (noMarker !== '1' && noMarker !== '0') {
          add('self_test_marker_applicability', `case ${entry.name} is applicable but no_marker=${entry.noMarker ?? 'missing'}`);
        }
        if (markerOutcome === 'absent' && noMarker !== '1') {
          add('self_test_marker_applicability', `case ${entry.name} reports marker_outcome=absent with no_marker=${entry.noMarker ?? 'missing'}`);
        }
        if (markerOutcome === 'present' && noMarker !== '0') {
          add('self_test_marker_applicability', `case ${entry.name} reports marker_outcome=present with no_marker=${entry.noMarker ?? 'missing'}`);
        }
        result.cases.markerApplicability++;
      } else if (applicability === 'not_applicable') {
        if (markerApplicable !== '0') {
          add('self_test_marker_applicability', `case ${entry.name} is not_applicable but marker_applicable=${entry.markerApplicable ?? 'missing'}`);
        }
        if (markerOutcome !== 'not-applicable') {
          add('self_test_marker_applicability', `case ${entry.name} is not_applicable but marker_outcome=${entry.markerOutcome ?? 'missing'}; N/A cannot count as absence`);
        }
        if (noMarker !== 'na') {
          add('self_test_marker_applicability', `case ${entry.name} is not_applicable but no_marker=${entry.noMarker ?? 'missing'}`);
        }
      }
    }
    result.cases.distinctReasons = [...reasonIds].sort();
    if (result.cases.reasonAssertions < 3) {
      add('self_test_reason_assertions', `only ${result.cases.reasonAssertions} passing expected_reason assertions; need 3`);
    }
    if (reasonIds.size < 2) {
      add('self_test_reason_distinct', `only ${reasonIds.size} distinct expected_reason id(s); need 2`);
    }
    if (result.cases.applicable < 1 || result.cases.notApplicable < 1) {
      add('self_test_applicability_coverage', 'case set does not cover both applicability=applicable and applicability=not_applicable');
    }
    if (result.cases.isolatedCli < 2) {
      add('self_test_no_isolated_cli', `only ${result.cases.isolatedCli} isolated CLI reason controls; need 2`);
    }
    if (result.cases.negativeReason < 1) {
      add('self_test_no_negative_reason_control', 'no isolated CLI refusal asserting a shipped COUNT_REASONS id');
    }
    if (result.cases.markerApplicability < 1) {
      add('self_test_no_marker_applicability', 'no marker-applicable observation (no_marker or marker outcome)');
    }
  }

  const production = receipt.production;
  if (!isObject(production) || !isInt(production.exit) || typeof production.stdout !== 'string') {
    add('malformed_production', 'production must be {exit,stdout}');
  } else {
    if (production.stderr !== undefined && typeof production.stderr !== 'string') {
      add('malformed_production', 'production.stderr must be text');
    }
    const text = outputOf(production);
    if (production.exit !== USER_EXPECTED.exit) {
      add('user_production_not_declared', `production exit ${production.exit}, expected ${USER_EXPECTED.exit}`);
    }
    const line = new RegExp(`^${USER_PREFIX} verdict=failed finding=${USER_EXPECTED.finding}\\b`, 'm').test(text);
    if (!line) add('user_production_not_declared', `production lacks verdict=failed finding=${USER_EXPECTED.finding}`);
    const counts = /Found (\d+) user rounds, expected (\d+)/.exec(text);
    if (!counts) {
      add('user_round_count_not_honest', 'production does not state the user round count');
    } else if (Number(counts[1]) !== USER_EXPECTED.rounds || Number(counts[2]) !== USER_EXPECTED.expectedRounds) {
      add('user_round_count_not_honest', `expected Found ${USER_EXPECTED.rounds} user rounds, expected ${USER_EXPECTED.expectedRounds}; got ${counts[1]} of ${counts[2]}`);
    }
    if (new RegExp(`^${USER_PREFIX} verdict=clean\\b`, 'm').test(text)) {
      add('user_production_false_green', 'production claims clean despite six of ten user rounds');
    }
    if (production.exit === USER_EXPECTED.exit && line && counts
      && Number(counts[1]) === USER_EXPECTED.rounds && Number(counts[2]) === USER_EXPECTED.expectedRounds) {
      result.production = `blocked_${USER_EXPECTED.finding}_${USER_EXPECTED.rounds}_of_${USER_EXPECTED.expectedRounds}`;
    }
  }

  result.count = errors.length === 0 ? 1 : 0;
  return result;
}

export function countC2(revision, read = reader(revision)) {
  const result = {
    count: 0,
    present: false,
    mirrors: { emitted: 0, differentials: 0, refused: 0 },
    snapshot: { exit: null, finding: null },
    canonical: 0,
    browserExecuted: null,
    errors: [],
    reasons: [],
  };
  const raw = read.file(C2_RECEIPT);
  if (!raw) {
    result.reasons.push('round-15 metadata differential receipt missing');
    return result;
  }
  result.present = true;
  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });
  const receipt = parseJson(raw, C2_RECEIPT, add);
  if (!receipt) return result;
  if (!isObject(receipt)) {
    add('malformed_receipt', `${C2_RECEIPT} is not an object`);
    return result;
  }
  const label = [receipt.schema, receipt.kind].filter(isText).join(' ');
  if (!/metadata/i.test(label) || !/differential|verification|enforc/i.test(label)) {
    add('receipt_kind', 'receipt schema/kind does not name a metadata differential/verification receipt');
  }

  const pin = validateCommitPin(receipt, revision, C2_CHECKER, add);

  const baseline = resolveCommitish(receipt.baseline);
  if (!baseline) {
    add('old_checker', 'baseline is not a resolvable 40-hex commit');
  } else {
    if (pin.codeRevision && !isAncestor(baseline, pin.codeRevision)) {
      add('old_checker', 'baseline is not an ancestor of revision');
    }
    const oldDigest = reader(baseline).sha(C2_CHECKER);
    if (!oldDigest) {
      add('old_checker', `${C2_CHECKER} is not committed at baseline`);
    } else if (!isHex(receipt.oldCodeSha256)) {
      add('old_checker', 'oldCodeSha256 is not a 64-hex digest');
    } else if (receipt.oldCodeSha256 !== oldDigest) {
      add('old_checker', 'oldCodeSha256 differs from the committed checker at baseline');
    } else if (pin.digest && receipt.oldCodeSha256 === pin.digest) {
      add('old_checker', 'old and new checker digests are identical; no differential');
    }
  }

  if (receipt.browserExecuted !== false) {
    add('receipt_browser', 'receipt must state browserExecuted=false');
  }
  const execution = isObject(receipt.execution) ? receipt.execution : {};
  if (receipt.newCoverage === true
    || execution.browser === true
    || execution.browserExecuted === true
    || execution.newBrowserRun === true
    || execution.newCoverage === true) {
    add('receipt_browser', 'receipt claims a new browser execution or coverage');
  }
  result.browserExecuted = receipt.browserExecuted === false ? false : null;

  const selfTest = receipt.selfTest;
  if (!isObject(selfTest) || !isInt(selfTest.exit) || typeof selfTest.stdout !== 'string') {
    add('malformed_self_test', 'selfTest must be {exit,stdout}');
  } else {
    if (selfTest.stderr !== undefined && typeof selfTest.stderr !== 'string') {
      add('malformed_self_test', 'selfTest.stderr must be text');
    }
    const text = outputOf(selfTest);
    const summaryLine = (/^ARIA_METADATA_SELFTEST\b[^\n]*\bverdict=[^\s]+/m.exec(text) || [])[0] ?? null;
    const summaryTokens = summaryLine ? tokensOf(summaryLine) : new Map();
    const summaryClean = summaryTokens.get('verdict') === 'clean';
    const cliCases = Number(summaryTokens.get('cli_cases'));
    const helpers = Number(summaryTokens.get('helpers'));
    const caseLines = caseLineList(text);
    const cases = selftestCases(text);
    if (caseLines.length !== cases.length) {
      add('malformed_case_line', `${caseLines.length - cases.length} ARIA SELFTEST case line(s) did not parse`);
    }
    const failures = cases.filter(entry => entry.result !== 'PASS');
    if (selfTest.exit !== 0) add('self_test_red', `selfTest exit ${selfTest.exit}, expected 0`);
    if (!summaryLine || !summaryClean) add('self_test_not_green', 'missing clean ARIA_METADATA_SELFTEST summary');
    else {
      if (!Number.isInteger(cliCases) || cliCases < 0) {
        add('self_test_summary', 'summary lacks an integer cli_cases field');
      } else if (cliCases < MIN_SELFTEST_CASES) {
        add('self_test_thin', `only ${cliCases} ARIA CLI cases, need >= ${MIN_SELFTEST_CASES}`);
      }
      if (!Number.isInteger(helpers) || helpers < 0) {
        add('self_test_summary', 'summary lacks an integer helpers field');
      } else if (Number.isInteger(cliCases) && cliCases + helpers < cases.length) {
        add('self_test_tally', `summary cli_cases=${cliCases} + helpers=${helpers} is below ${cases.length} emitted case lines`);
      }
    }
    if (cases.length === 0) add('self_test_no_cases', 'no ARIA SELFTEST case lines');
    if (/\bresult=FAIL\b/.test(text) || failures.length) {
      add('self_test_red', `ARIA self-test reports ${failures.length || 'some'} failing cases`);
    }
    const passing = cases.filter(entry => entry.result === 'PASS');
    for (const entry of passing) {
      if (entry.expectedExit !== entry.actualExit) {
        add('self_test_red', `case ${entry.name} claims PASS with expected_exit ${entry.expectedExit}, actual_exit ${entry.actualExit}`);
      }
      if (entry.finding && entry.expectedFinding && entry.expectedFinding !== entry.finding) {
        add('self_test_finding_mismatch', `case ${entry.name} expected_finding ${entry.expectedFinding}, finding ${entry.finding}`);
      }
    }
    const mirrorCases = passing.filter(entry => entry.expectedExit === 1
      && (MIRROR_FINDING.test(entry.name) || MIRROR_FINDING.test(entry.expectedFinding || '')));
    if (mirrorCases.length < 2) {
      add('self_test_no_mirror_cases', `only ${mirrorCases.length} passing mirror-refusal case(s); need 2`);
    }
    const snapshotCases = passing.filter(entry => entry.expectedExit === 2
      && isSnapshotTampered(entry.expectedFinding || entry.finding || ''));
    if (snapshotCases.length < 1) {
      add('self_test_no_snapshot_case', 'no passing case with expected_exit=2 and a snapshot-tampered finding');
    }
    const digestLiterals = digestLiteralLines(text);
    const matching = digestLiterals.filter(entry => entry.result === 'PASS' && entry.expected === entry.actual);
    if (matching.length < 2) {
      add('self_test_no_digest_literals', `only ${matching.length} passing expected_sha256==actual_sha256 fixture literal(s); need 2`);
    }
  }

  const inputs = receipt.snapshotInputs;
  const inputDigests = new Map();
  if (!isObject(inputs) || Object.keys(inputs).length === 0) {
    add('snapshot_inputs', 'snapshotInputs must be a non-empty path→sha256 map');
  } else {
    for (const [rawPath, digest] of Object.entries(inputs)) {
      const path = repoPath(rawPath);
      if (inputDigests.has(path)) add('snapshot_inputs', `${path} is listed twice`);
      inputDigests.set(path, digest);
      if (!isHex(digest)) {
        add('snapshot_inputs', `${path} digest is not 64-hex`);
        continue;
      }
      const bytes = read.file(path);
      if (!bytes) add('snapshot_inputs', `${path} is not committed at the measured revision`);
      else if (sha256(bytes) !== digest) add('snapshot_inputs', `${path} digest differs from the receipt`);
    }
  }

  const differentials = receipt.mirrors;
  const required = new Set(REQUIRED_MIRRORS);
  if (!Array.isArray(differentials) || differentials.length === 0) {
    add('mirrors_shape', 'mirrors must be a non-empty array');
  } else {
    if (differentials.length !== REQUIRED_MIRRORS.length) {
      add('mirrors_count', `mirrors has ${differentials.length} entries; the nine required differentials are exactly required`);
    }
    const seen = new Set();
    let refused = 0;
    for (const entry of differentials) {
      if (!isObject(entry) || !isText(entry.case)) {
        add('mirror_entry', 'mirror differential must name its case/field');
        continue;
      }
      const field = normalizeField(entry.case);
      const isRequired = required.has(field);
      if (!isRequired) add('mirror_unexpected', `${field} is not one of the nine required differentials`);
      if (seen.has(field)) add('mirror_duplicate', `${field} has more than one differential`);
      seen.add(field);
      cleanArm(entry.before, 'mirror', `${field} historical checker`, add);
      const arm = refusalArm(entry.after, 1, 'mirror', field, add);
      if (arm && acceptedValue(arm) !== false) {
        add('mirror_accepted', `${field} refusal does not report accepted=false`);
      }
      // The refusal may name the field failure plus the acceptance summary;
      // only the acceptance-summary id is tolerated beside it.
      const ids = arm ? allFindingIds(arm) : [];
      const failures = ids.filter(id => !/accepted/i.test(id));
      if (failures.length !== 1) {
        add('mirror_finding', `${field} refusal names ${failures.length} non-acceptance finding(s); need exactly one field failure`);
      } else if (/could[_-]?not[_-]?evaluate/.test(failures[0])) {
        add('mirror_finding', `${field} refusal is could_not_evaluate`);
      } else if (isSnapshotTampered(failures[0])) {
        add('mirror_finding', `${field} refusal is snapshot tampering, not a semantic mirror finding`);
      } else if (!MIRROR_FINDING.test(failures[0])) {
        add('mirror_finding', `${field} finding ${failures[0]} does not name the mirror context`);
      } else if (isRequired) {
        refused++;
      }
      if (entry.pass !== true) add('mirror_pass', `${field} differential is not marked pass=true`);
    }
    for (const field of REQUIRED_MIRRORS) {
      if (!seen.has(field)) add('mirror_missing_differential', `${field} has no mirror differential`);
    }
    result.mirrors = {
      emitted: REQUIRED_MIRRORS.length,
      differentials: differentials.length,
      refused,
    };
  }

  const tamper = receipt.tamper;
  if (!isObject(tamper)) {
    add('snapshot_shape', 'tamper must be {case,field,recordedSha256,computedSha256,before,after,pass}');
  } else {
    if (!isText(tamper.case) || !SNAPSHOT_CASE.test(tamper.case)) {
      add('snapshot_case', 'tamper.case does not name authenticated snapshot tampering');
    }
    if (!isText(tamper.field)) {
      add('snapshot_field', 'tamper.field must be a concrete snapshot input path');
    }
    if (!isHex(tamper.recordedSha256) || !isHex(tamper.computedSha256)) {
      add('snapshot_digest', 'tamper recordedSha256/computedSha256 must be 64-hex digests');
    } else if (tamper.recordedSha256 === tamper.computedSha256) {
      add('snapshot_digest', 'tamper recorded and computed digests are identical; nothing was tampered');
    }
    if (isText(tamper.field)) {
      const tamperPath = repoPath(tamper.field);
      if (!inputDigests.has(tamperPath)) {
        add('snapshot_inputs', `tamper.field ${tamperPath} is not listed in snapshotInputs`);
      } else if (isHex(tamper.recordedSha256) && inputDigests.get(tamperPath) !== tamper.recordedSha256) {
        add('snapshot_digest', 'tamper.recordedSha256 differs from snapshotInputs[field]');
      }
    }
    // The authentic historical checker refuses the SHA mismatch semantically
    // (exit 1, SOURCE finding); only the new checker classifies it as snapshot
    // tampering (exit 2, could-not-evaluate). The old arm must never itself
    // report the classification the new checker owns.
    refusalArm(tamper.before, 1, 'snapshot', 'tamper historical checker', add);
    const oldIds = tamper.before ? allFindingIds(tamper.before) : [];
    // The old arm reports several authentic failures (SOURCE plus residual and
    // acceptance summaries); only SOURCE membership is required here, never a
    // global single-finding shape.
    if (!oldIds.some(id => /source/i.test(id))) {
      add('snapshot_old_finding', 'tamper historical arm does not name a SOURCE finding');
    }
    if (oldIds.some(id => /could[_-]?not[_-]?evaluate/i.test(id))) {
      add('snapshot_old_finding', 'tamper historical arm reports could_not_evaluate');
    }
    if (oldIds.some(id => isSnapshotTampered(id))) {
      add('snapshot_old_finding', 'tamper historical arm reports snapshot tampering');
    }
    const arm = refusalArm(tamper.after, 2, 'snapshot', 'tamper', add);
    const finding = arm ? namedFinding(arm) : null;
    if (!isSnapshotTampered(finding || '')) {
      add('snapshot_finding', `snapshot refusal finding ${finding ?? 'none'} is not a snapshot-tampered id`);
    }
    const text = arm ? outputOf(arm) : '';
    if (!isCouldNotEvaluate(arm ?? text)) {
      add('snapshot_classification', 'snapshot refusal does not classify itself could-not-evaluate');
    }
    if (tamper.pass !== true) add('snapshot_pass', 'tamper differential is not marked pass=true');
    result.snapshot = { exit: arm ? arm.exit : null, finding };
  }

  const positive = receipt.positive;
  if (!isObject(positive) || !isInt(positive.exit) || typeof positive.stdout !== 'string') {
    add('check_shape', 'positive must be {exit,stdout,sidecar}');
  } else {
    if (positive.stderr !== undefined && typeof positive.stderr !== 'string') {
      add('check_shape', 'positive.stderr must be text');
    }
    const text = outputOf(positive);
    if (positive.exit !== 0) add('check_red', `positive exit ${positive.exit}, expected 0`);
    if (!ariaCheckClean(text)) add('check_not_clean', 'positive output lacks ARIA_METADATA check verdict=clean');
    const accepted = acceptedValue(positive);
    if (accepted !== true) add('check_not_accepted', 'positive output does not report accepted=true');
    if (accepted === false) add('check_not_accepted', 'positive output reports accepted=false');
    const sidecar = isObject(positive.payload) && isObject(positive.payload.sidecar)
      ? positive.payload.sidecar
      : positive.sidecar;
    if (!isObject(sidecar) || !isText(sidecar.path) || !isHex(sidecar.sha256)) {
      add('sidecar_shape', 'positive.payload.sidecar (or positive.sidecar) must be {path,sha256}');
    } else {
      const path = repoPath(sidecar.path);
      if (path !== C2_SIDECAR) {
        add('sidecar_path', `positive.sidecar.path must be ${C2_SIDECAR}`);
      } else {
        const bytes = read.file(path);
        if (!bytes) {
          add('sidecar_missing', `${path} is not committed`);
        } else if (sha256(bytes) !== sidecar.sha256) {
          add('sidecar_digest', 'positive.sidecar.sha256 differs from the committed sidecar bytes');
        } else {
          const historicalRaw = read.file(C2_HISTORICAL_RECEIPT);
          if (!historicalRaw) {
            add('historical_receipt_missing', `${C2_HISTORICAL_RECEIPT} is not committed`);
          } else {
            const historical = parseJson(historicalRaw, C2_HISTORICAL_RECEIPT, add);
            const pinned = isObject(historical?.sidecar) ? historical.sidecar.sha256 : null;
            if (!isHex(pinned)) {
              add('historical_pin', 'the round-14 receipt does not pin the corrected sidecar digest');
            } else if (pinned !== sidecar.sha256) {
              add('sidecar_immutable', 'canonical corrected sidecar differs from the round-14 pinned bytes');
            } else {
              result.canonical = 1;
            }
          }
        }
      }
    }
  }

  const oldPositive = receipt.oldPositive;
  if (oldPositive !== undefined) {
    cleanArm(oldPositive, 'old_positive', 'historical positive', add);
  }

  const originals = receipt.originalsUnchanged;
  const originalFlags = new Map();
  if (!isObject(originals) || Object.keys(originals).length === 0) {
    add('originals_unchanged', 'originalsUnchanged must be a non-empty path→boolean map');
  } else {
    for (const [rawPath, flag] of Object.entries(originals)) originalFlags.set(repoPath(rawPath), flag);
    for (const required of [C2_SIDECAR, ORIGINAL_RECEIPT, ORIGINAL_PIN]) {
      const bytes = read.file(required);
      const digest = inputDigests.get(required);
      if (originalFlags.get(required) !== true) add('originals_unchanged', `${required} is not marked unchanged=true`);
      if (!bytes) add('originals_unchanged', `${required} is not committed`);
      else if (!isHex(digest)) add('originals_unchanged', `${required} has no committed digest in snapshotInputs`);
      else if (sha256(bytes) !== digest) add('originals_unchanged', `${required} digest differs from the committed bytes`);
    }
    for (const [path, flag] of originalFlags) {
      if (flag !== true) add('originals_unchanged', `${path} is not a boolean true`);
    }
  }

  if (receipt.pass !== true) add('receipt_pass', 'receipt is not marked pass=true');

  result.count = errors.length === 0 ? 1 : 0;
  return result;
}

export function sourceHistogram(read) {
  const result = {
    rows: 0,
    tier: { A: 0, B: 0, C: 0, invalid: 0 },
    status: { queued: 0, mined: 0, rejected: 0, invalid: 0 },
  };
  const raw = read.file(C2_SOURCES);
  if (!raw) return result;
  let inRegistry = false;
  for (const line of raw.toString('utf8').split('\n')) {
    if (line.trim() === '## Registry') {
      inRegistry = true;
      continue;
    }
    if (inRegistry && /^##\s+/.test(line.trim())) {
      inRegistry = false;
      continue;
    }
    if (!inRegistry) continue;
    const row = /^ {0,3}(\|.*)$/.exec(line)?.[1];
    if (!row || !/^\|\s*S\d{3,}\s*\|/.test(row)) continue;
    const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
    result.rows++;
    const tier = cells[3];
    const status = cells[7];
    result.tier[tier === 'A' || tier === 'B' || tier === 'C' ? tier : 'invalid']++;
    result.status[status === 'queued' || status === 'mined' || status === 'rejected' ? status : 'invalid']++;
  }
  return result;
}

export function noteMap(read) {
  const notes = read.list('corpus/knowledge')
    .map(path => /^corpus\/knowledge\/([^/]+\.md)$/.exec(path)?.[1])
    .filter(Boolean)
    .sort();
  const readme = read.file(C2_README);
  if (!readme) return { knowledge_notes: notes.length, mapped: 0, missing: notes };
  const text = readme.toString('utf8');
  const missing = notes.filter(note => !text.includes(`knowledge/${note}`));
  return { knowledge_notes: notes.length, mapped: notes.length - missing.length, missing };
}

export function noteMapCommand(revision) {
  return `diff <(git ls-tree -r --name-only ${revision} -- corpus/knowledge | sed 's|^corpus/knowledge/||' | sort) <(git show ${revision}:corpus/README.md | grep -o 'knowledge/[A-Za-z0-9._-]*\\.md' | sed 's|^knowledge/||' | sort -u)`;
}

function usage() {
  throw Object.assign(
    new Error('Usage: node .ufo/waves/round-15/measure.mjs REV [--claim C1|C2 | --histogram]'),
    { exit: 2 },
  );
}

function parseArguments(argv) {
  const options = { revision: null, claim: null, histogram: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--claim') {
      const claim = argv[++index];
      if (claim !== 'C1' && claim !== 'C2') usage();
      options.claim = claim;
    } else if (argument === '--histogram') {
      options.histogram = true;
    } else if (!options.revision) {
      options.revision = argument;
    } else {
      usage();
    }
  }
  if (!options.revision) usage();
  if (options.histogram && options.claim) usage();
  return options;
}

function commandSet(revision) {
  return {
    census_histogram: CENSUS_COMMAND,
    census_validate: CENSUS_VALIDATE_COMMAND,
    note_map: noteMapCommand(revision),
    user_selftest: 'node scripts/check-user-round-contract.mjs --self-test',
    aria_selftest: 'node scripts/check-aria-metadata.mjs --self-test',
  };
}

function sortErrors(errors) {
  return errors.slice().sort((a, b) => `${a.finding}\0${a.detail}`.localeCompare(`${b.finding}\0${b.detail}`));
}

function emit(output, errors) {
  process.stdout.write(`${JSON.stringify(output)}\n`);
  if (errors.length) {
    process.stderr.write(`MEASURE verdict=failed errors=${errors.length}\n`);
    process.exitCode = 1;
  }
}

function c1Output(revision, commands, c1) {
  return {
    revision,
    c1_truthful_diagnostics: c1.count,
    c1_receipt: c1.present ? 1 : 0,
    c1_diagnostics: c1.cases,
    c1_production: c1.production,
    c1_operability_scalar_delta: 0,
    c1_receipt_path: C1_RECEIPT,
    c1_checker_path: C1_CHECKER,
    commands,
    errors: sortErrors(c1.errors),
    reasons: c1.reasons.slice().sort(),
  };
}

function c2Output(revision, commands, c2) {
  return {
    revision,
    c2_enforced_contract: c2.count,
    c2_receipt: c2.present ? 1 : 0,
    c2_mirrors: c2.mirrors,
    c2_snapshot: c2.snapshot,
    c2_canonical_correction: c2.canonical,
    c2_browser_executed: c2.browserExecuted === false ? 0 : null,
    c2_calibration_scalar_delta: 0,
    c2_receipt_path: C2_RECEIPT,
    c2_checker_path: C2_CHECKER,
    commands,
    errors: sortErrors(c2.errors),
    reasons: c2.reasons.slice().sort(),
  };
}

function run(argv) {
  const options = parseArguments(argv);
  const revision = resolveRevision(options.revision);
  const read = reader(revision);
  const commands = commandSet(revision);

  if (options.histogram) {
    emit({ revision, source_histogram: sourceHistogram(read), note_map: noteMap(read), commands }, []);
    return;
  }

  const c1 = options.claim === 'C2' ? null : countC1(revision, read);
  const c2 = options.claim === 'C1' ? null : countC2(revision, read);

  if (options.claim === 'C1') {
    const output = c1Output(revision, commands, c1);
    emit(output, output.errors);
    return;
  }
  if (options.claim === 'C2') {
    const output = c2Output(revision, commands, c2);
    emit(output, output.errors);
    return;
  }

  const output = {
    ...c1Output(revision, commands, c1),
    ...c2Output(revision, commands, c2),
    source_histogram: sourceHistogram(read),
    note_map: noteMap(read),
    errors: sortErrors([...c1.errors, ...c2.errors]),
    reasons: [...c1.reasons, ...c2.reasons].sort(),
  };
  emit(output, output.errors);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`MEASURE verdict=could-not-evaluate detail=${error.message}\n`);
  process.exitCode = error.exit ?? 2;
}
