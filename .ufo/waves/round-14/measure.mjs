#!/usr/bin/env node
// tabi round-14 C1/C2 counting probe.
//
// Revision-based: every byte is read from the named git revision. The probe
// never runs a gate, the checker, the census, a browser, or a test. It only
// counts committed evidence. Missing round-14 evidence counts 0 (the expected
// pre-measurement state); malformed or mismatched evidence fails closed: the
// affected count is 0 and the process exits 1 so a partial result cannot be
// quoted as green.
//
// Usage:
//   node .ufo/waves/round-14/measure.mjs <revision>
//   node .ufo/waves/round-14/measure.mjs <revision> --claim C1
//   node .ufo/waves/round-14/measure.mjs <revision> --claim C2
//   node .ufo/waves/round-14/measure.mjs <revision> --histogram
//
// --claim C1 reads only corpus/evidence/round-14/gates.json and the two gate
// blobs at its codeRevision. --claim C2 reads only the aria metadata
// verification receipt, its corrected sidecar, the committed round-13 ARIA
// originals, the S029 registry row and corpus/lessons/round-14.md. A malformed
// C1 receipt therefore cannot suppress an independent C2 count, and vice versa.
// --histogram reads only corpus/SOURCES.md and corpus/README.md at the revision.
//
// C1 receipt (parent-owned contract):
//   corpus/evidence/round-14/gates.json
//   { codeRevision: <40-hex commit>,
//     gates: [ { path,
//                sha256,                         // committed blob at codeRevision
//                selfTest: { exit, stdout },
//                witness?: { before: { exit, stdout },
//                            after:  { exit, stdout } } | { exit, stdout },
//                production: { exit, stdout, measuredRevision? } } ] }
//
// A gate counts only when all of the following hold:
//   1. path is one of the two legacy gates below and appears once;
//   2. sha256 is the committed blob digest at codeRevision (and, when given, at
//      the entry's measuredRevision), i.e. the exact code that ran;
//   3. the committed gate source contains no shell binary invocation,
//      `shell: true`, or `-c` flag (static, fail-closed rejection), and the
//      runCount implementation itself has no shell path; delegating to a
//      shared git-argv helper is allowed and the whole-file scan covers it;
//   4. selfTest exits 0, prints `<PREFIX>_SELFTEST verdict=clean cases=N`
//      (N >= 4; the round-14 tally grows beyond the historical counts and is
//      not frozen here), every SELFTEST line is result=PASS, and the output
//      contains at least one passing malicious no-marker control (name
//      matches malicious|refus|inject|unsupported|traversal|forbid|
//      unrecognized, expected_exit != 0, named non-clean finding, trailing
//      `no_marker=1`), at least two passing fail-closed count_* controls
//      (missing revision, no match, malformed/unsupported grammar; expected
//      exit != 0), at least one passing supported count_* control (expected
//      exit 0, expected_finding clean), and countWitness evidence: top-level
//      exit 0 clean, child old_exit=0 old_finding=clean marker=true/1, then
//      new_exit=1 new_finding=score_mismatch marker=false/0;
//   5. production preserves the historical expected result exactly:
//        scripts/check-round-contract.mjs       exit 0, "verdict=clean ... rounds=10"
//        scripts/check-user-round-contract.mjs  exit 1, "finding=round_count",
//                                               "Found 6 user rounds, expected 10",
//                                               and no false clean verdict.
//      The USER production exits on round_count before runCount, so it is
//      preserved regression evidence, not parser coverage. The USER gate counts
//      only through its isolated CLI controls and countWitness; the output's
//      parserCoverage is isolated_controls_only and this probe never claims a
//      production-exercised USER parser.
//
// C2 receipt (ReceiptRepair-owned contract):
//   corpus/evidence/round-14/aria-metadata/verification.json
//   { codeRevision: <40-hex commit>,
//     selfTest: { exit, stdout },
//     witness:  { exit, stdout } | { before: {...}, after: {...} },
//     check:    { exit, stdout },
//     sidecar:  { path: "corrected.json" | full path, sha256 } }
//
// C2 counts 1 only when the corrected sidecar is a committed metadata
// correction (no new runtime, no new coverage), its digest is the committed
// blob, it pins the round-13 receipt and runtime pin byte-for-byte (including
// at the commit cited by S029), every recorded perWorker proof independently
// contradicts the aggregate listeningAfter=true, Node observed 26.12.0 is
// qualified as not the descriptive recorded 24.21.0 pin, the checker self-test
// is green with refusal controls, the witness is a red->clean transition, the
// corrected check is green, S029 is mined with used-by corpus/lessons/round-14.md,
// and that lesson admits the sidecar and cites S029.
//
// check-aria-metadata.mjs emits (shipped grammar accepted):
//   ARIA_METADATA_SELFTEST verdict=clean cases=N
//   ARIA_METADATA_SELFTEST result=PASS case=<id> [name=<id>] expected_exit=<n>
//     actual_exit=<n> expected_finding=<id> finding=<id> exit=<n>
//   ARIA_METADATA check verdict=clean findings=N failed=0 accepted=true
//   ARIA_METADATA witness verdict=clean transition=red->clean red_exit=1
//     green_exit=0 accepted=true original_unchanged=true
//   ARIA_METADATA findings <id>
// Case fields are parsed as key=value tokens in any order; expected/actual
// exits and findings must agree. A red witness names its finding through a
// structured finding/redFinding/findings field or, when the shipped list names
// exactly one distinct finding, through `ARIA_METADATA findings <id>`.
// Legacy `SELFTEST name=...` lines and `ARIA_METADATA_CHECK verdict=clean`
// are also accepted.
//
// Sidecar shape read by this probe (aliases in the file):
//   { schema|kind containing "metadata" and "correct(ion)",
//     qualified: true | status: "qualified",
//     browserExecuted: false | execution.browser: false,
//     original: { receipt: { path, sha256, bytes? }, pin: { path, sha256, bytes? } },
//     node: { observed, recorded, exactMatch: false },
//     corrections: [ { path: "cleanup.server.listeningAfter", from: true, to: false } ] }
//
// Scalars are unchanged: this probe reports no ordinal score delta.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const C1_RECEIPT = 'corpus/evidence/round-14/gates.json';
const C2_RECEIPT = 'corpus/evidence/round-14/aria-metadata/verification.json';
const C2_SIDECAR = 'corpus/evidence/round-14/aria-metadata/corrected.json';
const C2_CHECKER = 'scripts/check-aria-metadata.mjs';
const C2_SOURCES = 'corpus/SOURCES.md';
const C2_README = 'corpus/README.md';
const C2_LESSON = 'corpus/lessons/round-14.md';
const C2_SOURCE_ID = 'S029';
const ORIGINAL_RECEIPT = 'corpus/evidence/round-13/aria/receipt.json';
const ORIGINAL_PIN = 'corpus/evidence/round-13/aria/runtime-pin.json';

const CENSUS_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi';
const CENSUS_VALIDATE_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi';

// Historical expected results. Changing either baseline is a new round, not a
// measurement repair: C1 is only a count of gates that keep these outcomes.
const GATE_RULES = new Map([
  ['scripts/check-round-contract.mjs', { prefix: 'ROUND_CONTRACT', production: 'clean' }],
  ['scripts/check-user-round-contract.mjs', { prefix: 'USER_ROUND_CONTRACT', production: 'round_count' }],
]);

const REFUSAL_NAME = /refus|malicious|inject|unsupported|traversal|forbid|unrecognized/i;
const SUPPORTED_NAME = /count|supported|line_count/i;
const SHELL_CALL = /(?:spawnSync|execSync|execFileSync|spawn|execFile)\s*\(\s*(['"`])(?:bash|sh|zsh|dash|fish|ksh)\1/i;
const SHELL_TRUE = /\bshell\s*:\s*true\b/i;
const SHELL_C = /(['"`])-c\1/;

function git(args) {
  return spawnSync('git', args, { cwd: ROOT, encoding: null, maxBuffer: 64 * 1024 * 1024 });
}

function resolveRevision(argument) {
  if (!argument || argument.startsWith('-') || /\s/.test(argument)) {
    throw Object.assign(new Error('Usage: node .ufo/waves/round-14/measure.mjs REV [--claim C1|C2 | --histogram]'), { exit: 2 });
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
const outputOf = stream => `${typeof stream.stdout === 'string' ? stream.stdout : ''}${typeof stream.stderr === 'string' ? stream.stderr : ''}`;
const normalizeDot = value => value.replace(/^\.\//, '');

function resolveCommitish(value) {
  if (!isCommitHex(value)) return null;
  const result = git(['rev-parse', '--verify', `${value}^{commit}`]);
  if (result.error || result.status !== 0) return null;
  return result.stdout.toString('utf8').trim();
}

function selftestLines(text) {
  return [...text.matchAll(/^SELFTEST name=(\S+) expected_exit=(-?\d+) actual_exit=(-?\d+) expected_finding=(\S+) result=(PASS|FAIL)(.*)$/gm)]
    .map(match => ({
      name: match[1],
      expectedExit: Number(match[2]),
      actualExit: Number(match[3]),
      expectedFinding: match[4],
      result: match[5],
      extra: match[6] || '',
    }));
}

// check-aria-metadata.mjs prints its own stable case grammar, with fields in
// key=value order that may vary:
//   ARIA_METADATA_SELFTEST result=PASS case=<id> name=<id> expected_exit=<n>
//     actual_exit=<n> expected_finding=<id> finding=<id> exit=<n>
// Only the named SELFTEST case lines are parsed; the summary line has no case=.
function caseTokens(text) {
  const tokens = new Map();
  for (const match of text.matchAll(/([A-Za-z_][A-Za-z0-9_]*)=([^\s]+)/g)) {
    if (!tokens.has(match[1])) tokens.set(match[1], match[2]);
  }
  return tokens;
}

function ariaCaseLines(text) {
  const cases = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!/^ARIA_METADATA/.test(line) || !/SELFTEST/.test(line) || !/(?:^|\s)case=/.test(line)) continue;
    const tokens = caseTokens(line);
    const result = tokens.get('result');
    if (result !== 'PASS' && result !== 'FAIL') continue;
    const name = tokens.get('case') || tokens.get('name');
    const expectedExit = Number(tokens.get('expected_exit'));
    const actualExit = Number(tokens.get('actual_exit') ?? tokens.get('exit'));
    const expectedFinding = tokens.get('expected_finding') ?? tokens.get('finding') ?? 'clean';
    const actualFinding = tokens.get('finding') ?? null;
    if (!name || !Number.isInteger(expectedExit) || !Number.isInteger(actualExit)) continue;
    cases.push({
      name,
      expectedExit,
      actualExit,
      expectedFinding,
      actualFinding,
      result,
      extra: '',
    });
  }
  return cases;
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

function structuredFinding(stream) {
  if (!isObject(stream)) return null;
  for (const key of ['finding', 'redFinding', 'red_finding', 'findings']) {
    const value = stream[key];
    if (isText(value)) {
      const first = value.trim().split(/\s+/)[0];
      if (first) return first;
    }
    if (Array.isArray(value)) {
      const items = value.filter(isText).map(item => item.trim()).filter(Boolean);
      if (items.length === 1) return items[0];
      if (items.length > 1) return null;
    }
  }
  return null;
}

function namedFinding(stream) {
  const structured = structuredFinding(stream);
  if (structured) return structured;
  const tokens = findingTokens(outputOf(stream));
  return tokens.length === 1 ? tokens[0] : null;
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

function countWitnessEvidence(text) {
  const witnessLines = text.split('\n').filter(line => /count_?witness/i.test(line));
  const present = witnessLines.length > 0 || /\btop_exit=0\b/.test(text);
  const topLevel = /\btop_exit=0\b/.test(text)
    || witnessLines.some(line => /verdict=clean\b|result=PASS\b/.test(line));
  const oldExit = /\bold_exit=0\b/.test(text);
  const oldClean = /\bold_finding=clean\b|\bold_verdict=clean\b/.test(text);
  const newExit = /\bnew_exit=1\b/.test(text);
  const newMismatch = /\bnew_finding=score_mismatch\b/.test(text)
    || /\bnew_verdict=failed\b[^\n]*\bfinding=score_mismatch\b/.test(text);
  const markers = [...text.matchAll(/\b(?:old_|new_)?marker=(true|false|1|0)\b/g)]
    .map(match => (match[1] === 'true' || match[1] === '1'));
  const explicitOld = /\bold_marker=(?:true|1)\b/.test(text);
  const explicitNew = /\bnew_marker=(?:false|0)\b/.test(text);
  const ordered = markers.indexOf(true) >= 0 && markers.lastIndexOf(false) > markers.indexOf(true);
  const markerOrder = explicitOld && explicitNew ? true : ordered;
  const ok = present && topLevel && oldExit && oldClean && newExit && newMismatch && markerOrder;
  return { ok, present, topLevel, oldExit, oldClean, newExit, newMismatch, markerOrder };
}

export function countC1(revision, read = reader(revision)) {
  const result = {
    count: 0, present: false, gates: [], errors: [], reasons: [],
  };
  const raw = read.file(C1_RECEIPT);
  if (!raw) {
    result.reasons.push('round-14 gates receipt missing');
    return result;
  }
  result.present = true;
  let receipt;
  try {
    receipt = JSON.parse(raw.toString('utf8'));
  } catch {
    result.errors.push({ finding: 'malformed_receipt', detail: 'gates.json is not JSON' });
    return result;
  }
  if (!isObject(receipt) || !Array.isArray(receipt.gates)) {
    result.errors.push({ finding: 'malformed_receipt', detail: 'gates.json has no gates array' });
    return result;
  }
  if (receipt.gates.length === 0) {
    result.reasons.push('gates receipt lists no gates');
    return result;
  }
  const codeRevision = resolveCommitish(receipt.codeRevision);
  if (!codeRevision) {
    result.errors.push({ finding: 'malformed_receipt', detail: 'codeRevision is not a resolvable 40-hex commit' });
    return result;
  }
  if (git(['merge-base', '--is-ancestor', codeRevision, revision]).status !== 0) {
    result.errors.push({ finding: 'receipt_code_revision', detail: 'codeRevision is not an ancestor of the measured revision' });
    return result;
  }
  const codeRead = reader(codeRevision);
  const revisionReaders = new Map([[codeRevision, codeRead]]);
  const readerFor = rev => {
    if (!revisionReaders.has(rev)) revisionReaders.set(rev, reader(rev));
    return revisionReaders.get(rev);
  };

  const seen = new Set();
  let valid = 0;
  for (const entry of receipt.gates) {
    if (!isObject(entry) || !isText(entry.path)) {
      result.errors.push({ finding: 'malformed_gate', detail: 'gate entry has no path' });
      continue;
    }
    const detail = {
      path: entry.path, digest: 'missing', runCount: 'absent', selfTest: 'invalid',
      controls: { maliciousNoMarker: 0, failClosed: 0, supported: 0, countWitness: 0 },
      witness: 'absent', parserCoverage: 'unknown', production: 'invalid',
    };
    result.gates.push(detail);
    if (!GATE_RULES.has(entry.path)) {
      result.errors.push({ finding: 'unknown_gate', detail: `unexpected gate path ${entry.path}` });
      continue;
    }
    if (seen.has(entry.path)) {
      result.errors.push({ finding: 'duplicate_gate', detail: `duplicate gate path ${entry.path}` });
      continue;
    }
    seen.add(entry.path);
    const rule = GATE_RULES.get(entry.path);
    const gateErrors = [];
    const add = (finding, message) => gateErrors.push({ finding, detail: `${entry.path}: ${message}` });

    if (!isHex(entry.sha256)) add('malformed_gate', 'sha256 is not a 64-hex digest');
    const digest = codeRead.sha(entry.path);
    if (!digest) {
      add('missing_git_blob', 'gate is not a committed regular file at codeRevision');
    } else if (isHex(entry.sha256) && entry.sha256 !== digest) {
      add('gate_digest_mismatch', 'receipt sha256 differs from the committed code digest at codeRevision');
    }
    if (digest && entry.sha256 === digest) detail.digest = 'match';

    if (entry.measuredRevision !== undefined) {
      const measured = resolveCommitish(entry.measuredRevision);
      if (!measured) {
        add('malformed_gate', 'measuredRevision is not a resolvable 40-hex commit');
      } else {
        const measuredDigest = readerFor(measured).sha(entry.path);
        if (measuredDigest !== entry.sha256) {
          add('gate_digest_mismatch', 'receipt sha256 differs from the committed code digest at measuredRevision');
        }
      }
    }

    const sourceBytes = codeRead.file(entry.path);
    if (!sourceBytes) {
      add('missing_git_blob_source', 'gate source is not readable at codeRevision');
    } else {
      const source = sourceBytes.toString('utf8');
      const code = codeOnly(source);
      const runCount = analyzeRunCount(source);
      if (!runCount.ok) add(runCount.finding, runCount.detail);
      else detail.runCount = 'non_shell';
      if (SHELL_CALL.test(code)) add('shell_execution', 'gate source still contains a shell binary invocation');
      if (SHELL_TRUE.test(code)) add('shell_execution', 'gate source still contains shell:true');
    }

    const selfTest = entry.selfTest;
    if (!isObject(selfTest) || !isInt(selfTest.exit) || typeof selfTest.stdout !== 'string') {
      add('malformed_gate', 'selfTest must be {exit,stdout}');
    } else {
      if (selfTest.stderr !== undefined && typeof selfTest.stderr !== 'string') add('malformed_gate', 'selfTest.stderr must be text');
      const text = outputOf(selfTest);
      const summary = new RegExp(`^${rule.prefix}_SELFTEST verdict=clean cases=(\\d+)\\b`, 'm').exec(text);
      const lines = selftestLines(text);
      const failures = lines.filter(line => line.result !== 'PASS');
      if (selfTest.exit !== 0) add('self_test_red', `selfTest exit ${selfTest.exit}, expected 0`);
      if (!summary) add('self_test_not_green', 'missing clean SELFTEST summary');
      else if (Number(summary[1]) < 4) add('self_test_thin', `only ${summary[1]} self-test cases`);
      if (lines.length === 0) add('self_test_no_cases', 'no SELFTEST case lines');
      if (/\bresult=FAIL\b/.test(text) || failures.length) {
        add('self_test_red', `selfTest reports ${failures.length || 'some'} failing cases`);
      }
      for (const line of lines) {
        if (line.result === 'PASS' && line.expectedExit !== line.actualExit) {
          add('self_test_red', `case ${line.name} claims PASS with expected_exit ${line.expectedExit}, actual_exit ${line.actualExit}`);
        }
      }
      const malicious = lines.filter(line => line.result === 'PASS'
        && REFUSAL_NAME.test(line.name)
        && line.expectedExit !== 0
        && line.expectedFinding !== 'clean'
        && line.expectedFinding !== 'could_not_evaluate'
        && /\bno_marker=1\b/.test(line.extra));
      const failClosed = lines.filter(line => line.result === 'PASS'
        && /count_|count\b/i.test(line.name)
        && line.expectedExit !== 0
        && line.expectedFinding !== 'clean'
        && line.expectedFinding !== 'could_not_evaluate');
      const supported = lines.filter(line => line.result === 'PASS'
        && SUPPORTED_NAME.test(line.name)
        && line.expectedExit === 0
        && line.expectedFinding === 'clean');
      const countWitness = countWitnessEvidence(text);
      detail.controls.maliciousNoMarker = malicious.length;
      detail.controls.failClosed = failClosed.length;
      detail.controls.supported = supported.length;
      detail.controls.countWitness = countWitness.ok ? 1 : 0;
      if (malicious.length < 1) add('self_test_no_malicious_control', 'no passing malicious-command control with no_marker=1');
      if (failClosed.length < 2) add('self_test_no_fail_closed_controls', `only ${failClosed.length} passing fail-closed count_* controls; need 2 (missing revision/no match/malicious)`);
      if (supported.length < 1) add('self_test_no_supported_count', 'no passing supported line-count control');
      if (!countWitness.ok) add('self_test_no_count_witness', 'no countWitness evidence: old exit0 clean marker=true -> new exit1 score_mismatch marker=false');
      if (selfTest.exit === 0 && summary && !failures.length) detail.selfTest = 'clean';
    }

    if (entry.witness !== undefined) {
      const witness = entry.witness;
      if (isObject(witness) && isObject(witness.before) && isObject(witness.after)) {
        const before = witness.before;
        const after = witness.after;
        if (!isInt(before.exit) || typeof before.stdout !== 'string') add('malformed_gate', 'witness.before must be {exit,stdout}');
        if (!isInt(after.exit) || typeof after.stdout !== 'string') add('malformed_gate', 'witness.after must be {exit,stdout}');
        if (!gateErrors.length) {
          const line = new RegExp(`^${rule.prefix} verdict=failed finding=([a-z_]+)`, 'm').exec(outputOf(before));
          if (before.exit !== 1) add('witness_before_not_red', `before exit ${before.exit}, expected 1`);
          if (!line) add('witness_before_unnamed', 'before output has no named finding');
          else if (line[1] === 'could_not_evaluate') add('witness_before_infrastructure', 'before finding is could_not_evaluate');
          if (after.exit !== 0) add('witness_after_not_green', `after exit ${after.exit}, expected 0`);
          if (!new RegExp(`^${rule.prefix} verdict=clean\\b`, 'm').test(outputOf(after))) add('witness_after_not_green', 'after output has no clean verdict');
          detail.witness = line ? `${line[1]}->clean` : 'recorded';
        }
      } else if (isObject(witness) && isInt(witness.exit) && typeof witness.stdout === 'string') {
        const text = outputOf(witness);
        const line = /finding=([a-z_]+)/.exec(text);
        if (witness.exit === 0) add('witness_before_not_red', `witness exit ${witness.exit}, expected non-zero`);
        if (!line) add('witness_before_unnamed', 'witness output has no named finding');
        else if (line[1] === 'could_not_evaluate') add('witness_before_infrastructure', 'witness finding is could_not_evaluate');
        detail.witness = line ? line[1] : 'recorded';
      } else {
        add('malformed_gate', 'witness must be {exit,stdout} or {before,after}');
      }
    }

    const production = entry.production;
    if (!isObject(production) || !isInt(production.exit) || typeof production.stdout !== 'string') {
      add('malformed_gate', 'production must be {exit,stdout}');
    } else if (production.stderr !== undefined && typeof production.stderr !== 'string') {
      add('malformed_gate', 'production.stderr must be text');
    } else if (rule.production === 'clean') {
      if (production.exit !== 0) add('production_not_green', `production exit ${production.exit}, expected 0`);
      const line = new RegExp(`^${rule.prefix} verdict=clean[^\\n]*\\brounds=10\\b`, 'm').exec(outputOf(production));
      if (!line) add('production_not_green', 'production lacks verdict=clean rounds=10');
      if (production.exit === 0 && line) detail.production = 'clean_10_rounds';
    } else {
      const productionText = outputOf(production);
      if (production.exit !== 1) add('user_production_not_declared', `production exit ${production.exit}, expected 1`);
      const line = new RegExp(`^${rule.prefix} verdict=failed finding=round_count\\b`, 'm').exec(productionText);
      if (!line) add('user_production_not_declared', 'production lacks finding=round_count');
      const counts = /Found (\d+) user rounds, expected (\d+)/.exec(productionText);
      if (!counts) add('user_round_count_not_honest', 'production does not state the user round count');
      else if (Number(counts[1]) !== 6 || Number(counts[2]) !== 10) {
        add('user_round_count_not_honest', `expected Found 6 user rounds, expected 10; got ${counts[1]} of ${counts[2]}`);
      }
      if (new RegExp(`^${rule.prefix} verdict=clean\\b`, 'm').test(productionText)) {
        add('user_production_false_green', 'production claims clean despite six of ten user rounds');
      }
      if (line && counts && production.exit === 1 && Number(counts[1]) === 6 && Number(counts[2]) === 10) {
        detail.production = 'blocked_round_count_6_of_10';
      }
    }
    if (isObject(production) && production.measuredRevision !== undefined) {
      const measured = resolveCommitish(production.measuredRevision);
      if (!measured) add('malformed_gate', 'production.measuredRevision is not a resolvable 40-hex commit');
      else if (readerFor(measured).sha(entry.path) !== entry.sha256) {
        add('gate_digest_mismatch', 'production.measuredRevision blob differs from the receipt digest');
      }
    }

    result.errors.push(...gateErrors);
    detail.parserCoverage = rule.production === 'clean' ? 'production_and_controls' : 'isolated_controls_only';
    if (gateErrors.length === 0) valid++;
  }

  for (const path of GATE_RULES.keys()) {
    if (!seen.has(path)) result.reasons.push(`receipt has no entry for ${path}`);
  }

  result.gates.sort((a, b) => a.path.localeCompare(b.path));
  result.count = result.errors.length === 0 ? valid : 0;
  return result;
}

function collectPathDigests(value, out = [], depth = 0) {
  if (depth > 16 || value === null || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectPathDigests(item, out, depth + 1);
    return out;
  }
  if (isText(value.path) && isHex(value.sha256)) {
    out.push({
      path: normalizeDot(value.path),
      sha256: value.sha256,
      bytes: Number.isInteger(value.bytes) && value.bytes >= 0 ? value.bytes : null,
    });
  }
  for (const item of Object.values(value)) collectPathDigests(item, out, depth + 1);
  return out;
}

function correctionEntries(sidecar) {
  const found = [];
  for (const key of ['corrections', 'correctedFields', 'fixes', 'correctionsApplied']) {
    if (!Array.isArray(sidecar[key])) continue;
    for (const entry of sidecar[key]) {
      if (!isObject(entry)) continue;
      found.push({
        path: entry.path ?? entry.field ?? entry.key,
        to: entry.to ?? entry.after ?? entry.value ?? entry.corrected,
        from: entry.from ?? entry.before,
        qualified: entry.qualified,
      });
    }
  }
  if (isObject(sidecar.corrected)) {
    for (const [key, value] of Object.entries(sidecar.corrected)) {
      if (isObject(value)) {
        found.push({
          path: value.path ?? key,
          to: value.to ?? value.after ?? value.value ?? value.corrected,
          from: value.from ?? value.before,
          qualified: value.qualified,
        });
      } else {
        found.push({ path: key, to: value });
      }
    }
  }
  if (isObject(sidecar.cleanup?.server) && 'listeningAfter' in sidecar.cleanup.server) {
    found.push({ path: 'cleanup.server.listeningAfter', to: sidecar.cleanup.server.listeningAfter });
  }
  for (const nested of [sidecar.corrected?.cleanup?.server, sidecar.correctedCleanup?.server, sidecar.server]) {
    if (isObject(nested) && 'listeningAfter' in nested) {
      found.push({ path: 'cleanup.server.listeningAfter', to: nested.listeningAfter, from: true });
    }
  }
  return found;
}

function versionValue(value) {
  if (isText(value)) return value;
  if (isObject(value) && isText(value.version)) return value.version;
  return null;
}

export function countC2(revision, read = reader(revision)) {
  const result = {
    count: 0, present: false, sidecarPath: null, originalPinned: 0,
    lessonAdmitted: 0, browserExecuted: null, qualified: false,
    node: { observed: null, recorded: null, exactMatch: null },
    errors: [], reasons: [],
  };
  const raw = read.file(C2_RECEIPT);
  if (!raw) {
    result.reasons.push('aria metadata verification receipt missing');
    return result;
  }
  result.present = true;
  let receipt;
  try {
    receipt = JSON.parse(raw.toString('utf8'));
  } catch {
    result.errors.push({ finding: 'malformed_receipt', detail: 'verification.json is not JSON' });
    return result;
  }
  if (!isObject(receipt)) {
    result.errors.push({ finding: 'malformed_receipt', detail: 'verification.json is not an object' });
    return result;
  }

  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });

  const codeRevision = resolveCommitish(receipt.codeRevision);
  if (!codeRevision) add('receipt_code_revision', 'codeRevision is not a resolvable 40-hex commit');
  else if (git(['merge-base', '--is-ancestor', codeRevision, revision]).status !== 0) {
    add('receipt_code_revision', 'codeRevision is not an ancestor of the measured revision');
  } else if (!reader(codeRevision).file(C2_CHECKER)) add('checker_source', `${C2_CHECKER} is not committed at codeRevision`);
  if (receipt.checkerSha256 !== undefined) {
    if (!isHex(receipt.checkerSha256)) add('checker_source', 'checkerSha256 is not a 64-hex digest');
    else if (codeRevision) {
      const actual = reader(codeRevision).sha(C2_CHECKER);
      if (actual !== receipt.checkerSha256) add('checker_source', 'checkerSha256 does not match the committed checker');
    }
  }

  const originalReceiptBytes = read.file(ORIGINAL_RECEIPT);
  const originalPinBytes = read.file(ORIGINAL_PIN);
  if (!originalReceiptBytes) add('original_missing', `${ORIGINAL_RECEIPT} is not committed`);
  if (!originalPinBytes) add('original_missing', `${ORIGINAL_PIN} is not committed`);
  let originalReceipt = null;
  let originalPin = null;
  if (originalReceiptBytes) {
    try {
      originalReceipt = JSON.parse(originalReceiptBytes.toString('utf8'));
    } catch {
      add('original_malformed', `${ORIGINAL_RECEIPT} is not JSON`);
    }
  }
  if (originalPinBytes) {
    try {
      originalPin = JSON.parse(originalPinBytes.toString('utf8'));
    } catch {
      add('original_malformed', `${ORIGINAL_PIN} is not JSON`);
    }
  }
  if (originalReceipt && originalPin) {
    if (originalReceipt.runtime?.playwright !== originalPin.playwrightTest) {
      add('original_mismatch', 'original receipt runtime.playwright differs from the retained pin');
    }
    if (isHex(originalReceipt.runtime?.pinned?.pinSha256)
      && originalReceipt.runtime.pinned.pinSha256 !== sha256(originalPinBytes)) {
      add('original_mismatch', 'original receipt runtime.pinned.pinSha256 does not match the committed pin bytes');
    }
  }

  const selfTest = receipt.selfTest;
  if (!isObject(selfTest) || !isInt(selfTest.exit) || typeof selfTest.stdout !== 'string') {
    add('checker_selftest', 'selfTest must be {exit,stdout}');
  } else {
    if (selfTest.stderr !== undefined && typeof selfTest.stderr !== 'string') add('checker_selftest', 'selfTest.stderr must be text');
    const text = outputOf(selfTest);
    const summary = /^ARIA_METADATA[_-]?[A-Z]*SELFTEST verdict=clean cases=(\d+)\b/m.exec(text);
    const ariaCases = ariaCaseLines(text);
    const cases = ariaCases.length ? ariaCases : selftestLines(text);
    const failures = cases.filter(line => line.result !== 'PASS');
    if (selfTest.exit !== 0) add('checker_selftest_red', `selfTest exit ${selfTest.exit}, expected 0`);
    if (!summary) add('checker_selftest_not_green', 'missing clean checker SELFTEST summary');
    else if (Number(summary[1]) < 4) add('checker_selftest_thin', `only ${summary[1]} checker self-test cases`);
    else if (ariaCases.length && Number(summary[1]) < ariaCases.length) {
      add('checker_selftest_tally', `summary cases=${summary[1]} is below ${ariaCases.length} emitted case lines`);
    }
    if (cases.length === 0) add('checker_selftest_no_cases', 'no checker SELFTEST case lines');
    if (/\bresult=FAIL\b/.test(text) || failures.length) {
      add('checker_selftest_red', `checker self-test reports ${failures.length || 'some'} failing cases`);
    }
    for (const line of cases) {
      if (line.result === 'PASS' && line.expectedExit !== line.actualExit) {
        add('checker_selftest_red', `case ${line.name} claims PASS with expected_exit ${line.expectedExit}, exit ${line.actualExit}`);
      }
      if (line.result === 'PASS' && line.actualFinding && line.expectedFinding !== line.actualFinding) {
        add('checker_selftest_red', `case ${line.name} claims PASS with expected_finding ${line.expectedFinding}, finding ${line.actualFinding}`);
      }
    }
    const refusals = cases.filter(line => line.result === 'PASS'
      && /malformed|missing|nonboolean|invalid|refus|type/i.test(line.name)
      && line.expectedExit !== 0
      && line.expectedFinding !== 'clean'
      && line.expectedFinding !== 'could_not_evaluate');
    if (refusals.length < 2) add('checker_selftest_no_refusal', `only ${refusals.length} fail-closed refusal controls; need 2`);
  }

  const witness = receipt.witness;
  if (isObject(witness) && isObject(witness.before) && isObject(witness.after)) {
    const before = witness.before;
    const after = witness.after;
    if (!isInt(before.exit) || typeof before.stdout !== 'string') add('checker_witness', 'witness.before must be {exit,stdout}');
    if (!isInt(after.exit) || typeof after.stdout !== 'string') add('checker_witness', 'witness.after must be {exit,stdout}');
    if (isInt(before.exit) && before.exit === 0) add('checker_witness', 'witness.before is not red');
    const finding = namedFinding(before);
    if (!finding) add('checker_witness', 'witness.before has no unambiguous named finding');
    else if (/could_not_evaluate/.test(finding)) add('checker_witness', 'witness.before finding is could_not_evaluate');
    if (isInt(after.exit) && after.exit !== 0) add('checker_witness', 'witness.after is not green');
    if (!/verdict=clean\b/.test(outputOf(after))) add('checker_witness', 'witness.after has no clean verdict');
  } else if (isObject(witness) && isInt(witness.exit) && typeof witness.stdout === 'string') {
    if (witness.stderr !== undefined && typeof witness.stderr !== 'string') add('checker_witness', 'witness.stderr must be text');
    const text = outputOf(witness);
    const named = namedFinding(witness);
    const shipped = /transition=red->clean\b/.test(text)
      && /\bred_exit=1\b/.test(text)
      && /\bgreen_exit=0\b/.test(text)
      && (witness.accepted === true || /\baccepted=true\b/.test(text))
      && /verdict=clean\b/.test(text)
      && Boolean(named);
    if (shipped) {
      if (/could_not_evaluate/.test(named)) add('checker_witness', 'witness red finding is could_not_evaluate');
      if (/original_unchanged=false/.test(text)) add('checker_witness', 'witness reports the original receipt changed');
    } else {
      if (witness.exit === 0) add('checker_witness', 'witness is not a red observation');
      if (!named) add('checker_witness', 'witness has no unambiguous named finding');
      else if (/could_not_evaluate/.test(named)) add('checker_witness', 'witness finding is could_not_evaluate');
    }
  } else {
    add('checker_witness', 'witness must be {exit,stdout} or {before,after}');
  }

  const check = receipt.check;
  if (!isObject(check) || !isInt(check.exit) || typeof check.stdout !== 'string') {
    add('checker_check', 'check must be {exit,stdout}');
  } else {
    if (check.stderr !== undefined && typeof check.stderr !== 'string') add('checker_check', 'check.stderr must be text');
    if (check.exit !== 0) add('checker_check', `check exit ${check.exit}, expected 0`);
    const checkText = outputOf(check);
    if (!ariaCheckClean(checkText)) {
      add('checker_check', 'check output lacks ARIA_METADATA check verdict=clean');
    }
    if (/\baccepted=false\b/.test(checkText)) add('checker_check', 'check did not accept the corrected sidecar');
  }

  const sidecarRef = receipt.sidecar;
  let sidecar = null;
  if (!isObject(sidecarRef)) {
    add('sidecar_ref', 'sidecar must be {path,sha256}');
  } else {
    const normalized = isText(sidecarRef.path)
      ? (normalizeDot(sidecarRef.path) === 'corrected.json' ? C2_SIDECAR : normalizeDot(sidecarRef.path))
      : null;
    if (normalized !== C2_SIDECAR) {
      add('sidecar_ref', `sidecar.path must be ${C2_SIDECAR} (or corrected.json)`);
    } else {
      result.sidecarPath = normalized;
      if (!isHex(sidecarRef.sha256)) {
        add('sidecar_ref', 'sidecar.sha256 is not a 64-hex digest');
      } else {
        const bytes = read.file(normalized);
        if (!bytes) {
          add('sidecar_missing', `${normalized} is not committed`);
        } else if (sha256(bytes) !== sidecarRef.sha256) {
          add('sidecar_digest', 'sidecar.sha256 differs from the committed sidecar bytes');
        } else {
          try {
            sidecar = JSON.parse(bytes.toString('utf8'));
          } catch {
            add('sidecar_malformed', `${normalized} is not JSON`);
          }
        }
      }
    }
  }

  if (sidecar) {
    if (!isObject(sidecar)) {
      add('sidecar_malformed', 'sidecar is not an object');
    } else {
      const label = [sidecar.schema, sidecar.kind, sidecar.claim, sidecar.wave].filter(isText).join(' ');
      if (!/metadata/i.test(label) || !/correct|repair|qualif/i.test(label)) {
        add('sidecar_kind', 'sidecar schema/kind does not name a metadata correction');
      }
      if (sidecar.codeRevision !== undefined && sidecar.codeRevision !== receipt.codeRevision) {
        add('sidecar_code_revision', 'sidecar.codeRevision differs from the receipt codeRevision');
      }
      result.qualified = sidecar.qualified === true || sidecar.qualification === true || sidecar.status === 'qualified';
      if (!result.qualified) add('sidecar_qualified', 'sidecar is not marked qualified');

      const browserFalse = sidecar.browserExecuted === false
        || sidecar.executed === false
        || (isObject(sidecar.execution)
          && (sidecar.execution.browser === false
            || sidecar.execution.browserExecuted === false
            || sidecar.execution.newBrowserRun === false));
      const browserTrue = sidecar.browserExecuted === true
        || sidecar.executed === true
        || sidecar.newCoverage === true
        || (isObject(sidecar.execution)
          && (sidecar.execution.browser === true
            || sidecar.execution.browserExecuted === true
            || sidecar.execution.newBrowserRun === true
            || sidecar.execution.newCoverage === true));
      result.browserExecuted = browserTrue ? true : (browserFalse ? false : null);
      if (!browserFalse) add('sidecar_browser', 'sidecar does not state browserExecuted=false');
      if (browserTrue) add('sidecar_browser', 'sidecar claims a new browser execution or coverage');

      const pins = collectPathDigests(sidecar);
      const receiptPins = pins.filter(pin => pin.path === ORIGINAL_RECEIPT);
      const pinPins = pins.filter(pin => pin.path === ORIGINAL_PIN);
      if (receiptPins.length === 0) add('sidecar_pin', `sidecar does not pin ${ORIGINAL_RECEIPT} with a digest`);
      if (pinPins.length === 0) add('sidecar_pin', `sidecar does not pin ${ORIGINAL_PIN} with a digest`);
      for (const pin of [...receiptPins, ...pinPins]) {
        if (new Set([...receiptPins, ...pinPins].filter(item => item.path === pin.path).map(item => item.sha256)).size > 1) {
          add('sidecar_pin', `conflicting digests for ${pin.path}`);
          break;
        }
      }
      if (receiptPins.length && originalReceiptBytes && receiptPins[0].sha256 !== sha256(originalReceiptBytes)) {
        add('sidecar_pin', 'pinned original receipt digest differs from the committed receipt bytes');
      }
      if (receiptPins.length && originalReceiptBytes && receiptPins[0].bytes !== null
        && receiptPins[0].bytes !== originalReceiptBytes.length) {
        add('sidecar_pin', 'pinned original receipt byte count differs from the committed bytes');
      }
      if (pinPins.length && originalPinBytes && pinPins[0].sha256 !== sha256(originalPinBytes)) {
        add('sidecar_pin', 'pinned original pin digest differs from the committed pin bytes');
      }
      if (pinPins.length && originalPinBytes && pinPins[0].bytes !== null
        && pinPins[0].bytes !== originalPinBytes.length) {
        add('sidecar_pin', 'pinned original pin byte count differs from the committed bytes');
      }

      const node = isObject(sidecar.node) ? sidecar.node
        : isObject(sidecar.runtimeNode) ? sidecar.runtimeNode : null;
      if (!node) {
        add('sidecar_node', 'sidecar node metadata is missing');
      } else {
        const observed = versionValue(node.observed ?? node.observedVersion);
        const recorded = versionValue(node.recorded ?? node.recordedVersion);
        const exact = 'exactMatch' in node ? node.exactMatch : node.exact;
        if (!isText(observed) || !/^v?\d+\.\d+\.\d+/.test(observed)) add('sidecar_node', 'node.observed is not a version');
        if (!isText(recorded) || !/^v?\d+\.\d+\.\d+/.test(recorded)) add('sidecar_node', 'node.recorded is not a version');
        if (isText(observed) && originalReceipt && observed !== originalReceipt.runtime?.node) {
          add('sidecar_node', `node.observed ${observed} differs from original receipt runtime.node ${originalReceipt.runtime?.node}`);
        }
        if (isText(recorded) && originalPin && recorded !== originalPin.node?.recorded) {
          add('sidecar_node', `node.recorded ${recorded} differs from original pin node.recorded ${originalPin.node?.recorded}`);
        }
        if (isText(observed) && isText(recorded) && observed === recorded) {
          add('sidecar_node', 'node.observed equals node.recorded; the correction is not qualified');
        }
        if (exact !== false) add('sidecar_node', 'node.exactMatch must be false');
        if (isText(observed) && isInt(originalPin?.node?.minimumMajor)) {
          const major = Number(observed.replace(/^v/, '').split('.')[0]);
          if (!(major >= originalPin.node.minimumMajor)) {
            add('sidecar_node', `node.observed ${observed} is below the pin minimum major ${originalPin.node.minimumMajor}`);
          }
        }
        result.node = { observed, recorded, exactMatch: exact === false ? false : null };
      }

      const corrections = correctionEntries(sidecar);
      const target = corrections.find(entry => isText(entry.path) && /cleanup[./]server[./]listeningafter/i.test(entry.path));
      if (!target) add('sidecar_correction', 'sidecar does not correct cleanup.server.listeningAfter');
      else {
        if (target.to !== false) add('sidecar_correction', 'corrected listeningAfter is not false');
        if (target.from !== undefined && target.from !== true) add('sidecar_correction', 'corrected from-value is not true');
      }

      const server = originalReceipt?.cleanup?.server;
      if (!isObject(server)) {
        add('original_cleanup', 'original receipt cleanup.server is missing');
      } else {
        if (server.listeningAfter !== true) {
          add('original_cleanup', 'original aggregate listeningAfter is not true; the retained contradiction is absent');
        }
        if (!Array.isArray(server.perWorker) || server.perWorker.length === 0) {
          add('original_cleanup', 'original perWorker proofs are empty');
        } else {
          server.perWorker.forEach((worker, index) => {
            if (!isObject(worker)) {
              add('original_cleanup', `perWorker[${index}] is not an object`);
              return;
            }
            if (worker.closed !== true) add('original_cleanup', `perWorker[${index}] is not closed`);
            if (worker.listeningAfter !== false) add('original_cleanup', `perWorker[${index}] listeningAfter is not false`);
            if (worker.refusedAfterClose !== true) add('original_cleanup', `perWorker[${index}] refusedAfterClose is not true`);
            if (!isText(worker.origin) || !/^http:\/\/127\.0\.0\.1:\d+$/.test(worker.origin)) {
              add('original_cleanup', `perWorker[${index}] origin is not loopback`);
            }
          });
        }
      }
    }
  }

  if (errors.length) return result;

  const pins = sidecar ? collectPathDigests(sidecar) : [];
  const receiptPin = pins.find(pin => pin.path === ORIGINAL_RECEIPT);
  result.originalPinned = receiptPin && pinPinsAllMatch(pins, originalReceiptBytes, originalPinBytes) ? 1 : 0;

  const sourcesRaw = read.file(C2_SOURCES);
  if (!sourcesRaw) {
    result.reasons.push('SOURCES registry missing');
  } else {
    const line = sourcesRaw.toString('utf8').split('\n').find(row => /^\|\s*S029\s*\|/.test(row));
    if (!line) {
      result.reasons.push(`registry has no row ${C2_SOURCE_ID}`);
    } else {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length !== 11) {
        result.reasons.push(`registry row ${C2_SOURCE_ID} is not one 11-column row`);
      } else {
        if (cells[2] !== 'own-work') result.reasons.push(`${C2_SOURCE_ID} is not an own-work source`);
        if (cells[7] !== 'mined') result.reasons.push(`registry row ${C2_SOURCE_ID} is not mined`);
        if (!cells[10].includes(C2_LESSON)) result.reasons.push(`registry row ${C2_SOURCE_ID} does not list ${C2_LESSON}`);
        if (!cells[1].includes(ORIGINAL_RECEIPT)) result.reasons.push(`${C2_SOURCE_ID} does not name ${ORIGINAL_RECEIPT}`);
        const cited = /\b([a-f0-9]{40})\b/.exec(cells[5] || '')?.[1] || null;
        if (!cited) {
          result.reasons.push(`${C2_SOURCE_ID} cites no 40-hex commit for the retained receipt`);
        } else if (!resolveCommitish(cited)) {
          result.reasons.push(`${C2_SOURCE_ID} cited commit is not resolvable`);
        } else {
          const bytes = reader(cited).file(ORIGINAL_RECEIPT);
          if (!bytes) result.reasons.push(`${C2_SOURCE_ID} cited commit does not contain ${ORIGINAL_RECEIPT}`);
          else if (!receiptPin || sha256(bytes) !== receiptPin.sha256) {
            result.reasons.push('original receipt is not byte-identical at the cited commit');
          }
        }
      }
    }
  }

  const lessonRaw = read.file(C2_LESSON);
  if (!lessonRaw) {
    result.reasons.push('round-14 lesson missing');
  } else {
    const text = lessonRaw.toString('utf8');
    const admits = [...text.matchAll(/^- admitted: (.+)$/gm)].map(match => match[1]);
    const admitted = admits.some(body => body.includes('corrected.json')
      || (body.includes('aria-metadata') && /correct|metadata/i.test(body)));
    if (!admitted) result.reasons.push(`corrected metadata sidecar is not admitted in ${C2_LESSON}`);
    if (!text.includes(C2_SOURCE_ID)) result.reasons.push(`${C2_LESSON} does not cite ${C2_SOURCE_ID}`);
  }

  result.lessonAdmitted = result.reasons.length === 0 ? 1 : 0;
  result.count = result.reasons.length === 0 ? 1 : 0;
  return result;
}

function pinPinsAllMatch(pins, originalReceiptBytes, originalPinBytes) {
  const receiptPins = pins.filter(pin => pin.path === ORIGINAL_RECEIPT);
  const pinPins = pins.filter(pin => pin.path === ORIGINAL_PIN);
  if (receiptPins.length === 0 || pinPins.length === 0) return false;
  if (!originalReceiptBytes || !originalPinBytes) return false;
  return receiptPins.every(pin => pin.sha256 === sha256(originalReceiptBytes))
    && pinPins.every(pin => pin.sha256 === sha256(originalPinBytes));
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
    new Error('Usage: node .ufo/waves/round-14/measure.mjs REV [--claim C1|C2 | --histogram]'),
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

function run(argv) {
  const options = parseArguments(argv);
  const revision = resolveRevision(options.revision);
  const read = reader(revision);
  const commands = commandSet(revision);

  if (options.histogram) {
    emit({ revision, source_histogram: sourceHistogram(read), note_map: noteMap(read), commands }, []);
    return;
  }

  if (options.claim === 'C1') {
    const c1 = countC1(revision, read);
    const errors = sortErrors(c1.errors);
    emit({
      revision,
      c1_non_shell_counters: c1.count,
      c1_receipt: c1.present ? 1 : 0,
      c1_operability_scalar_delta: 0,
      c1_gates: c1.gates,
      commands,
      errors,
      reasons: c1.reasons.slice().sort(),
    }, errors);
    return;
  }

  if (options.claim === 'C2') {
    const c2 = countC2(revision, read);
    const errors = sortErrors(c2.errors);
    emit({
      revision,
      c2_metadata_correction: c2.count,
      c2_receipt: c2.present ? 1 : 0,
      c2_sidecar_path: c2.sidecarPath,
      c2_original_pinned: c2.originalPinned,
      c2_lesson_admitted: c2.lessonAdmitted,
      c2_browser_executed: c2.browserExecuted === false ? 0 : null,
      c2_qualified: c2.qualified,
      c2_node: c2.node,
      c2_lesson_path: C2_LESSON,
      commands,
      errors,
      reasons: c2.reasons.slice().sort(),
    }, errors);
    return;
  }

  const c1 = countC1(revision, read);
  const c2 = countC2(revision, read);
  const errors = sortErrors([...c1.errors, ...c2.errors]);
  emit({
    revision,
    c1_non_shell_counters: c1.count,
    c1_receipt: c1.present ? 1 : 0,
    c1_operability_scalar_delta: 0,
    c1_gates: c1.gates,
    c2_metadata_correction: c2.count,
    c2_receipt: c2.present ? 1 : 0,
    c2_sidecar_path: c2.sidecarPath,
    c2_original_pinned: c2.originalPinned,
    c2_lesson_admitted: c2.lessonAdmitted,
    c2_browser_executed: c2.browserExecuted === false ? 0 : null,
    c2_qualified: c2.qualified,
    c2_node: c2.node,
    c2_lesson_path: C2_LESSON,
    source_histogram: sourceHistogram(read),
    note_map: noteMap(read),
    commands,
    errors,
    reasons: [...c1.reasons, ...c2.reasons].sort(),
  }, errors);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`MEASURE verdict=could-not-evaluate detail=${error.message}\n`);
  process.exitCode = error.exit ?? 2;
}
