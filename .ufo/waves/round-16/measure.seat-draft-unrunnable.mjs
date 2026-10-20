#!/usr/bin/env node
// tabi round-16 C1/C2 counting probe.
//
// Revision-based: every byte is read from the named git revision. The probe
// never runs a gate, the checker, the census, a browser, or a test. It only
// counts committed evidence. Missing round-16 evidence counts 0 (the expected
// pre-measurement state); malformed or mismatched evidence fails closed: the
// affected count is 0 and the process exits 1 so a partial result cannot be
// quoted as green.
//
// Usage:
//   node .ufo/waves/round-16/measure.mjs <revision>
//   node .ufo/waves/round-16/measure.mjs <revision> --claim C1
//   node .ufo/waves/round-16/measure.mjs <revision> --claim C2
//   node .ufo/waves/round-16/measure.mjs <revision> --histogram
//
// --claim C1 reads only scripts/check-measurement-binding.mjs and the two
// committed binding receipts (selftest.json, legacy-r15.json, plus the legacy
// input file a receipt names). --claim C2 reads only the WebMCP knowledge
// note, corpus/README.md, corpus/SOURCES.md, the WebMCP receipt and the
// committed harness blob it pins. A malformed C1 receipt therefore cannot
// suppress an independent C2 count, and vice versa.
// --histogram reads only corpus/SOURCES.md, corpus/README.md and the
// corpus/knowledge listing at the revision.
//
// C1 receipts (L1-owned contract; produced from the binding gate's observed
// runs, not by this probe):
//   corpus/evidence/round-16/binding/selftest.json
//   { schema: "tabi-round16-binding-selftest-v1",
//     gateSha256: <64-hex>,                 // gate blob digest at REV
//     run:   { exit, stdout, stderr? },     // also accepted: selfTest,
//     reasonsExercised?: [ <reason id> ] }  //   or top-level {exit,stdout}
//   corpus/evidence/round-16/binding/legacy-r15.json
//   { schema: "tabi-round16-binding-legacy-v1",
//     gateSha256: <64-hex>,
//     legacy:  <repo-relative input path>,  // round-15 measurements.json
//     run:   { exit, stdout, stderr? },
//     findings?: [ { claim, reason } ] }
//
// C1 counts 1 only when all of the following hold:
//   1. the gate blob scripts/check-measurement-binding.mjs is committed at the
//      measured revision;
//   2. selftest.json's gateSha256 equals that gate blob digest at the measured
//      revision (a receipt pinned to a different gate cannot count);
//   3. selftest.json's run exits 0 and its captured output carries the
//      `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=<N> reasons=<K>`
//      summary with N >= 12, no failing verdict, and every one of the nine
//      shipped binding finding ids exercised in the captured output (mined
//      from reason=/expected_reason= tokens, JSON "reason" fields and the
//      receipt's reasonsExercised list):
//        measured_revision_not_ancestor, counter_digest_unrecorded,
//        counter_digest_mismatch, counter_changed_since_measurement,
//        counted_inputs_undeclared, counted_input_changed, argv_unsupported,
//        counter_failed, count_not_reproduced;
//   4. legacy-r15.json's gateSha256 equals the same gate blob digest, its
//      legacy input file is committed at the measured revision, its run exits
//      1 with no clean verdict, and both round-15 claims (C1 and C2) carry
//      counter_digest_unrecorded in the captured findings (text
//      `claim=<id> reason=counter_digest_unrecorded` lines or a findings
//      array), reproducing the round-15 outside-spotcheck defects the gate
//      now routes.
// Any of the first three conditions failing while its file exists is a
// malformed-evidence error; absent files count 0 without error.
//
// C2 receipt (L1-owned contract; produced by the WebMCP loopback harness,
// not by this probe):
//   corpus/evidence/round-16/webmcp/receipt.json
//   { schema: "tabi-round16-webmcp-v1",
//     producerSha256: <64-hex>,             // harness blob digest at REV
//     cases: [ { name|control|kind?, flags?|chromiumFlags?,
//                status: "pass"|"fail" (or pass/ok boolean),
//                toolsAdded?: [ { name, ... } ] | { tools: [...] },
//                events?: [ { method|name: "WebMCP.toolsAdded",
//                           params|tools: { tools: [...] } } ] } ],
//     summary: { cases, passed, failed } }
//
// C2 counts 1 only when all of the following hold:
//   1. corpus/knowledge/webmcp-chromium-loopback-round-16.md is committed and
//      carries at least one leading `source:` line (before the first `##`
//      heading) naming an S### id whose corpus/SOURCES.md registry row at the
//      measured revision is tier A or B, status mined, and whose used-by cell
//      names that note path;
//   2. corpus/README.md mentions `knowledge/webmcp-chromium-loopback-round-16.md`;
//   3. receipt.json's producerSha256 equals the blob digest of the committed
//      scripts/webmcp-loopback-round16.mjs at the measured revision (a receipt
//      pinned to a different harness cannot count);
//   4. summary.failed is exactly 0, at least one passing case observed
//      WebMCP.toolsAdded carrying at least one named tool, and at least one
//      passing flag-off negative control (name/control/kind matching
//      flag-off|noflags|negative|control|baseline with no non-empty flags
//      array) observed zero tools.
//
// Scalars are unchanged: this probe reports no ordinal score delta.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const C1_GATE = 'scripts/check-measurement-binding.mjs';
const C1_SELFTEST_RECEIPT = 'corpus/evidence/round-16/binding/selftest.json';
const C1_LEGACY_RECEIPT = 'corpus/evidence/round-16/binding/legacy-r15.json';
const C1_LEGACY_INPUT_DEFAULT = 'corpus/evidence/round-15/measurements.json';
const C1_SELFTEST_SCRIPT = 'scripts/selftest-measurement-binding.mjs';
const SELFTEST_PREFIX = 'MEASUREMENT_BINDING_SELFTEST';
const GATE_PREFIX = 'MEASUREMENT_BINDING';
const MIN_SELFTEST_CASES = 12;

const C2_NOTE = 'corpus/knowledge/webmcp-chromium-loopback-round-16.md';
const R15_COUNTER = '.ufo/waves/round-15/measure.mjs';
const C2_RECEIPT = 'corpus/evidence/round-16/webmcp/receipt.json';
const C2_HARNESS = 'scripts/webmcp-loopback-round16.mjs';
const C2_SOURCES = 'corpus/SOURCES.md';
const C2_README = 'corpus/README.md';

const CENSUS_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi';
const CENSUS_VALIDATE_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi';

// Exact shipped finding ids the C1 gate can raise per claim (PLAN §C1). A
// selftest that never exercises one of them has not demonstrated the binding
// contract; a receipt that invents others is not evidence about shipped code.
const BINDING_REASONS = new Set([
  'measured_revision_not_ancestor',
  'counter_digest_unrecorded',
  'counter_digest_mismatch',
  'counter_changed_since_measurement',
  'counted_inputs_undeclared',
  'counted_input_changed',
  'argv_unsupported',
  'counter_failed',
  'count_not_reproduced',
]);
// Exit-2 could-not-evaluate ids the gate reports when it cannot evaluate a
// manifest at all; the selftest must exercise them too.
const CNE_REASONS = new Set([
  'manifest_unreadable',
  'manifest_schema_invalid',
  'revision_unresolved',
  'git_failed',
]);

// Minimal Git environment: a pasted argv must reproduce counts without
// inheriting the caller's GIT_DIR/GIT_OBJECT_DIRECTORY/replace-ref state.
const GIT_ENV = {
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  PATH: process.env.PATH ?? '/usr/bin:/bin',
  HOME: process.env.HOME ?? '/tmp',
  TZ: 'UTC',
};

function git(args) {
  return spawnSync('git', args, {
    cwd: ROOT, env: GIT_ENV, encoding: null, maxBuffer: 64 * 1024 * 1024,
  });
}

function resolveRevision(argument) {
  if (!argument || argument.startsWith('-') || /\s/.test(argument)) {
    throw Object.assign(new Error('Usage: node .ufo/waves/round-16/measure.mjs REV [--claim C1|C2 | --histogram]'), { exit: 2 });
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

const isCommitHex = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

function resolveCommitish(value) {
  if (!isCommitHex(value)) return null;
  const result = git(['rev-parse', '--verify', `${value}^{commit}`]);
  if (result.error || result.status !== 0) return null;
  return result.stdout.toString('utf8').trim();
}

function isAncestor(candidate, descendant) {
  return git(['merge-base', '--is-ancestor', candidate, descendant]).status === 0;
}


function reader(revision, sink) {
  return {
    revision,
    file: path => {
      if (sink) sink.add(path);
      return fileAt(revision, path);
    },
    sha: path => {
      if (sink) sink.add(path);
      const bytes = fileAt(revision, path);
      return bytes ? sha256(bytes) : null;
    },
    list: prefix => {
      if (sink) sink.add(prefix.endsWith('/') ? prefix : `${prefix}/`);
      return listAt(revision, prefix);
    },
  };
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.length > 0;
const isInt = value => Number.isInteger(value);
const isHex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const outputOf = stream => [
  typeof stream.stdout === 'string' ? stream.stdout : '',
  typeof stream.stderr === 'string' ? stream.stderr : '',
].join('\n');
const normalizeReason = value => value.toLowerCase().replace(/-/g, '_');
const ROOT_PREFIX = `${ROOT}/`;
// Receipt paths are repository-relative; an absolute path under ROOT is the
// same file and is accepted after stripping the prefix.
const repoPath = value => {
  const normalized = value.replace(/^\.\//, '');
  return normalized.startsWith(ROOT_PREFIX) ? normalized.slice(ROOT_PREFIX.length) : normalized;
};

function parseJson(raw, label, add) {
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    add('malformed_receipt', `${label} is not JSON`);
    return null;
  }
}

// A captured run may live under run/selfTest/legacy or at the receipt top
// level; only {exit:int, stdout:string} is authoritative.
function runOf(receipt) {
  for (const key of ['run', 'selfTest', 'selftest', 'execution', 'output']) {
    if (isObject(receipt[key]) && isInt(receipt[key].exit) && typeof receipt[key].stdout === 'string') {
      return receipt[key];
    }
  }
  if (isInt(receipt.exit) && typeof receipt.stdout === 'string') return receipt;
  return null;
}

function checkRun(run, label, add) {
  if (!isObject(run) || !isInt(run.exit) || typeof run.stdout !== 'string') {
    add(`malformed_${label}`, `${label} run must be {exit:int,stdout:string}`);
    return null;
  }
  if (run.stderr !== undefined && typeof run.stderr !== 'string') {
    add(`malformed_${label}`, `${label}.stderr must be text`);
  }
  return run;
}

// Every finding id the gate emits as reason=<id> in text findings, an
// expected_reason=/reasons= token list, or a JSON "reason"/"reasons" value.
function minedBindingReasons(text, receipt) {
  const found = new Set();
  for (const match of text.matchAll(/\b(?:expected_|actual_)?reasons?=([A-Za-z0-9_.,-]+)/g)) {
    for (const token of match[1].split(/[.,]/).filter(Boolean)) {
      const id = normalizeReason(token.replace(/[^A-Za-z0-9_-]/g, ''));
      if (BINDING_REASONS.has(id)) found.add(id);
    }
  }
  for (const match of text.matchAll(/"(?:expected_)?reasons?"\s*:\s*"([A-Za-z0-9_-]+)"/g)) {
    const id = normalizeReason(match[1]);
    if (BINDING_REASONS.has(id)) found.add(id);
  }
  for (const match of text.matchAll(/"(?:expected_)?reasons?"\s*:\s*\[([^\]]*)\]/g)) {
    for (const token of match[1].matchAll(/"([A-Za-z0-9_-]+)"/g)) {
      const id = normalizeReason(token[1]);
      if (BINDING_REASONS.has(id)) found.add(id);
    }
  }
  const collect = value => {
    if (Array.isArray(value)) {
      for (const item of value) {
        const id = normalizeReason(String(item));
        if (BINDING_REASONS.has(id)) found.add(id);
      }
    }
  };
  if (isObject(receipt)) {
    collect(receipt.reasonsExercised);
    collect(receipt.reasons);
    collect(receipt.expectedReasons);
  }
  return found;
}

// claim=<id> ... reason=<id> pairs from text finding lines, plus findings
// arrays carried in the receipt itself.
function claimReasons(text, receipt) {
  const pairs = new Set();
  for (const line of text.split('\n')) {
    const claim = /\bclaim=([A-Za-z0-9]+)\b/.exec(line)?.[1];
    for (const match of line.matchAll(/\breason=([A-Za-z0-9_-]+)/g)) {
      if (claim) pairs.add(`${claim.toUpperCase()}\0${normalizeReason(match[1])}`);
    }
    if (!claim) {
      const inner = /\bclaim=([A-Za-z0-9]+)\b/.exec(line);
      if (inner) {
        for (const match of line.matchAll(/\breason=([A-Za-z0-9_-]+)/g)) {
          pairs.add(`${inner[1].toUpperCase()}\0${normalizeReason(match[1])}`);
        }
      }
    }
  }
  const walk = value => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (isObject(value)) {
      const claim = isText(value.claim) ? value.claim.toUpperCase() : null;
      for (const key of ['reason', 'expected_reason']) {
        if (claim && isText(value[key])) pairs.add(`${claim}\0${normalizeReason(value[key])}`);
      }
      for (const key of Object.keys(value)) {
        if (key !== 'claim' && isObject(value[key])) walk(value[key]);
        else if (key !== 'claim' && Array.isArray(value[key])) walk(value[key]);
      }
    }
  };
  if (isObject(receipt)) walk(receipt.findings ?? receipt.claims);
  return pairs;
}
// Shipped selftest case-line grammar (scripts/selftest-measurement-binding.mjs):
//   case=<id> expected_exit=<int> actual_exit=<int|token>
//     expected_reasons=<csv|-> actual_reasons=<csv|-> PASS|FAIL
// A line that names a case and a result token but omits parseable
// expected/actual fields is malformed evidence, never a passing assertion.



function selftestCaseList(text) {
  const lines = [];
  const malformed = [];
  for (const line of text.split('\n')) {
    if (!/\b(?:name|case)=/.test(line) || !/(?:^|\s)(?:result=)?(?:PASS|FAIL)\b/.test(line)) continue;
    const tokens = tokensOf(line);
    const name = tokens.get('name') ?? tokens.get('case');
    const expectedExit = tokens.get('expected_exit') ?? tokens.get('expectedExit');
    const actualExit = tokens.get('actual_exit') ?? tokens.get('actualExit');
    const entry = {
      name,
      result: /(?:^|\s)(?:result=)?FAIL\b/.test(line) ? 'FAIL' : 'PASS',
      expectedExit: expectedExit !== undefined && /^-?\d+$/.test(expectedExit) ? Number(expectedExit) : null,
      actualExit: actualExit !== undefined && /^-?\d+$/.test(actualExit) ? Number(actualExit) : null,
      expectedReasons: tokens.get('expected_reasons') ?? tokens.get('expected_reason') ?? null,
      actualReasons: tokens.get('actual_reasons') ?? tokens.get('actualReasons') ?? tokens.get('reason') ?? null,
    };
    if (!isText(name) || expectedExit === undefined || actualExit === undefined
      || entry.expectedReasons === null || entry.actualReasons === null) {
      malformed.push(line.trim().slice(0, 140));
    } else {
      lines.push(entry);
    }
  }
  return { lines, malformed };
}

const reasonSetOf = value => new Set(
  String(value).split(/[.,]/).map(token => normalizeReason(token.replace(/[^A-Za-z0-9_-]/g, ''))).filter(Boolean),
);


// The gate blob digest a receipt pins must equal the gate blob at the
// measured revision; a receipt captured against a different gate cannot
// count regardless of what it observed.
function checkGatePin(receipt, label, gateSha, add) {
  const pinned = isHex(receipt.gateSha256) ? receipt.gateSha256
    : isObject(receipt.gate) && isHex(receipt.gate.sha256) ? receipt.gate.sha256
      : null;
  if (!isHex(receipt.gateSha256) && pinned === null) {
    add(`${label}_gate_pin`, 'gateSha256 is not a 64-hex digest');
    return null;
  }
  if (gateSha === null) {
    add(`${label}_gate_missing`, `${C1_GATE} is not committed at the measured revision`);
    return pinned;
  }
  if (pinned !== gateSha) {
    add(`${label}_gate_pin`, 'gateSha256 differs from the gate blob at the measured revision');
  }
  return pinned;
}

export function countC1(revision, read = reader(revision)) {
  const result = {
    count: 0,
    gate: 'absent',
    gateSha256: null,
    selftestSha256: null,
    selftest: { present: false, exit: null, cases: 0, caseLines: 0, reasons: [] },
    legacy: { present: false, exit: null, claims: {} },
    errors: [],
    reasons: [],
    inputs: [],
  };
  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });

  const gateSha = read.sha(C1_GATE);
  if (gateSha !== null) {
    result.gate = 'present';
    result.gateSha256 = gateSha;
  } else {
    result.reasons.push('round-16 measurement-binding gate missing');
  }

  const selftestRaw = read.file(C1_SELFTEST_RECEIPT);
  if (!selftestRaw) {
    result.reasons.push('round-16 binding selftest receipt missing');
  } else {
    result.selftest.present = true;
    const receipt = parseJson(selftestRaw, C1_SELFTEST_RECEIPT, add);
    if (receipt !== null) {
      if (!isObject(receipt)) {
        add('malformed_receipt', `${C1_SELFTEST_RECEIPT} is not an object`);
      } else {
        if (receipt.schema !== 'tabi-round16-binding-selftest-v1') {
          add('receipt_schema', `schema ${JSON.stringify(receipt.schema)} is not tabi-round16-binding-selftest-v1`);
        }
        checkGatePin(receipt, 'selftest', gateSha, add);
        // The selftest script is itself a producer: when the receipt pins it,
        // the pin must equal the committed blob digest at REV.
        result.selftestSha256 = read.sha(C1_SELFTEST_SCRIPT);
        const pinnedSelftest = isHex(receipt.selftestSha256) ? receipt.selftestSha256
          : isObject(receipt.selftest) && isHex(receipt.selftest.sha256) ? receipt.selftest.sha256
            : null;
        if (pinnedSelftest !== null && result.selftestSha256 !== null && pinnedSelftest !== result.selftestSha256) {
          add('selftest_producer_pin', 'selftestSha256 differs from the selftest blob at the measured revision');
        }
        const run = checkRun(runOf(receipt), 'selftest', add);
        if (run) {
          result.selftest.exit = run.exit;
          const text = outputOf(run);
          if (run.exit !== 0) add('selftest_red', `selftest run exit ${run.exit}, expected 0`);
          const summary = new RegExp(`^${SELFTEST_PREFIX} verdict=(\\w+) cases=(\\d+)\\s+reasons=(\\d+)\\s*$`, 'm').exec(text);
          if (!summary) {
            add('selftest_not_green', `missing ${SELFTEST_PREFIX} verdict=clean cases=<N> reasons=<K> summary line`);
          } else {
            if (summary[1] !== 'clean') add('selftest_red', `selftest verdict=${summary[1]}, expected clean`);
            result.selftest.cases = Number(summary[2]);
            if (result.selftest.cases < MIN_SELFTEST_CASES) {
              add('selftest_thin', `only ${summary[2]} selftest cases, need >= ${MIN_SELFTEST_CASES}`);
            }
            if (Number(summary[3]) < BINDING_REASONS.size) {
              add('selftest_reasons_thin', `summary reasons=${summary[3]} below ${BINDING_REASONS.size} shipped ids`);
            }
          }
          if (/verdict=failed/.test(text)) {
            add('selftest_red', 'selftest output reports a failed verdict');
          }
          const { lines: caseLines, malformed: malformedLines } = selftestCaseList(text);
          for (const bad of malformedLines) {
            add('malformed_case_line', `unparseable selftest case line: ${bad}`);
          }
          const names = new Set();
          const exercised = new Set();
          let cleanPositive = 0;
          let couldNotEvaluate = 0;
          for (const entry of caseLines) {
            if (names.has(entry.name)) add('selftest_case_duplicate', `duplicate case name ${entry.name}`);
            names.add(entry.name);
            const expected = reasonSetOf(entry.expectedReasons);
            const actual = reasonSetOf(entry.actualReasons);
            if (entry.result !== 'PASS') {
              add('selftest_red', `case ${entry.name} reports FAIL`);
            } else {
              if (entry.expectedExit === null || entry.actualExit === null
                || entry.expectedExit !== entry.actualExit) {
                add('selftest_red', `case ${entry.name} claims PASS with expected_exit ${entry.expectedExit ?? '?'}, actual_exit ${entry.actualExit ?? '?'}`);
              }
              const equal = expected.size === actual.size && [...expected].every(id => actual.has(id));
              if (!equal) {
                add('selftest_red', `case ${entry.name} claims PASS with expected reasons ${entry.expectedReasons}, actual ${entry.actualReasons}`);
              }
              if (entry.expectedExit === 0) cleanPositive++;
              if (entry.expectedExit === 2) couldNotEvaluate++;
            }
            for (const id of expected) exercised.add(id);
          }
          result.selftest.caseLines = caseLines.length;
          result.selftest.reasons = [...exercised].sort();
          if (caseLines.length === 0) {
            add('selftest_no_cases', 'no parseable selftest case lines');
          }
          if (summary && caseLines.length && Number(summary[2]) !== caseLines.length) {
            add('selftest_tally', `summary cases=${summary[2]} differs from ${caseLines.length} emitted case lines`);
          }
          if (summary && Number(summary[3]) !== exercised.size) {
            add('selftest_reasons_tally', `summary reasons=${summary[3]} differs from ${exercised.size} exercised expected reasons`);
          }
          for (const id of BINDING_REASONS) {
            if (!exercised.has(id)) add('selftest_reason_missing', `shipped reason ${id} is never exercised in the captured output`);
          }
          if (cleanPositive === 0) add('selftest_no_clean_positive', 'no PASS case with expected_exit 0');
          if (couldNotEvaluate === 0) add('selftest_no_could_not_evaluate', 'no PASS case with expected_exit 2');
        }
      }
    }
  }

  const legacyRaw = read.file(C1_LEGACY_RECEIPT);
  if (!legacyRaw) {
    result.reasons.push('round-16 binding legacy receipt missing');
  } else {
    result.legacy.present = true;
    const receipt = parseJson(legacyRaw, C1_LEGACY_RECEIPT, add);
    if (receipt !== null) {
      if (!isObject(receipt)) {
        add('malformed_receipt', `${C1_LEGACY_RECEIPT} is not an object`);
      } else {
        if (receipt.schema !== 'tabi-round16-binding-legacy-v1') {
          add('receipt_schema', `schema ${JSON.stringify(receipt.schema)} is not tabi-round16-binding-legacy-v1`);
        }
        checkGatePin(receipt, 'legacy', gateSha, add);
        const legacyInput = isText(receipt.legacy) ? repoPath(receipt.legacy)
          : isText(receipt.input) ? repoPath(receipt.input)
            : C1_LEGACY_INPUT_DEFAULT;
        const legacyBytes = read.file(legacyInput);
        if (legacyBytes === null) {
          add('legacy_input_missing', `legacy input ${legacyInput} is not committed at the measured revision`);
        }
        const run = checkRun(runOf(receipt), 'legacy', add);
        if (run) {
          result.legacy.exit = run.exit;
          const text = outputOf(run);
          if (run.exit !== 1) add('legacy_not_red', `legacy run exit ${run.exit}, expected 1`);
          if (new RegExp(`^${GATE_PREFIX} verdict=clean\\b`, 'm').test(text)) {
            add('legacy_false_green', 'legacy run claims a clean verdict');
          }
          const pairs = claimReasons(text, receipt);
          // Independently recompute what the legacy evaluation must find: the
          // r15 schema has no bound counter.sha256 slot and no countedInputs
          // for any claim; a claim drifts when its r15 counter blob at
          // counterCodeRevision differs from the blob at the measured
          // revision.

          if (legacyBytes !== null) {
            const measurements = parseJson(legacyBytes, legacyInput, (finding, detail) => {
              add('legacy_input_malformed', `${legacyInput}: ${detail}`);
            });
            if (isObject(measurements)) {
              const manifestMeasured = resolveCommitish(measurements.measuredRevision);
              if (measurements.measuredRevision !== undefined && manifestMeasured === null) {
                add('legacy_input_malformed', 'legacy input measuredRevision does not resolve');
              }
              for (const claim of ['C1', 'C2']) {
                const spec = measurements[claim];
                const expected = new Set();
                if (!isObject(spec)) {
                  add('legacy_input_malformed', `legacy input ${claim} is not an object`);
                  result.legacy.claims[claim] = [];
                  continue;
                }
                expected.add('counter_digest_unrecorded');
                expected.add('counted_inputs_undeclared');
                const codeRev = resolveCommitish(spec.counterCodeRevision);
                const atRev = read.sha(R15_COUNTER);
                if (codeRev !== null) {
                  const atCode = reader(codeRev).sha(R15_COUNTER);
                  if (atCode !== null && atRev !== null && atCode !== atRev) {
                    expected.add('counter_changed_since_measurement');
                  }
                  if (isHex(spec.counterSha256) && atCode !== null && spec.counterSha256 !== atCode) {
                    expected.add('counter_digest_mismatch');
                  }
                }
                const observed = new Set(
                  [...pairs].filter(pair => pair.startsWith(`${claim}\0`)).map(pair => pair.split('\0')[1]),
                );
                result.legacy.claims[claim] = [...observed].sort();
                for (const id of expected) {
                  if (!observed.has(id)) {
                    add('legacy_claim_missing', `legacy run does not report ${claim} ${id}`);
                  }
                }
              }
              void measuredRev;
            }
          }
        }
      }
    }
  }

  result.count = errors.length === 0 && gateSha !== null
    && result.selftest.present && result.legacy.present ? 1 : 0;
  return result;
}

// SOURCES.md registry rows: | id | source | kind | tier | scope | anchor |
// teaches | status | opened | recheck | used-by |.
function sourceRows(read) {
  const rows = new Map();
  const raw = read.file(C2_SOURCES);
  if (!raw) return rows;
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
    rows.set(cells[0], { tier: cells[3], status: cells[7], usedBy: cells[10] ?? '' });
  }
  return rows;
}

// Leading `source:` lines of a knowledge note: every `source:` line before
// the first `##` heading, collecting every S### id each line names.
function noteSourceIds(raw) {
  const ids = new Set();
  for (const line of raw.toString('utf8').split('\n')) {
    if (/^##\s/.test(line)) break;
    if (!/^source\s*:/.test(line.trim())) continue;
    for (const match of line.matchAll(/\bS\d{3,}\b/g)) ids.add(match[0]);
  }
  return [...ids];
}

function casePass(entry) {
  const status = isText(entry.status) ? entry.status.toLowerCase() : null;
  if (status) return status === 'pass' || status === 'passed';
  if (typeof entry.pass === 'boolean') return entry.pass;
  if (typeof entry.ok === 'boolean') return entry.ok;
  return null;
}

// A tool record is any object carrying a non-empty name inside a case's
// toolsAdded field or inside a WebMCP.toolsAdded event's params/tools.
function toolsAddedTools(entry) {
  const out = [];
  const push = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(push);
      return;
    }
    if (!isObject(value)) return;
    if (isText(value.name)) {
      out.push(value);
      return;
    }
    if (Array.isArray(value.tools)) push(value.tools);
    else if (isObject(value.tools)) push(value.tools);
    if (isObject(value.params)) push(value.params.tools ?? value.params);
  };
  push(entry.toolsAdded);
  for (const scope of ['observed', 'result', 'actual', 'cdp', 'webmcp']) {
    if (isObject(entry[scope])) push(entry[scope].toolsAdded);
  }
  const events = Array.isArray(entry.events) ? entry.events
    : isObject(entry.observed) && Array.isArray(entry.observed.events) ? entry.observed.events
      : [];
  for (const event of events) {
    if (!isObject(event)) continue;
    const method = [event.method, event.event, event.name].find(isText);
    if (method === 'WebMCP.toolsAdded' || method === 'toolsAdded') {
      push(event.params?.tools ?? event.tools ?? event.params);
    }
  }
  return out.filter((tool, index) => out.indexOf(tool) === index && isText(tool.name));
}

// A flag-off negative control names itself and carries no enabled flag set.
function isFlagOffControl(entry) {
  const haystack = [entry.control, entry.kind, entry.name, entry.id]
    .filter(isText).join(' ').toLowerCase();
  const flags = [entry.flags, entry.chromiumFlags].find(value => value !== undefined);
  const flagsEmpty = flags === undefined || flags === null || (Array.isArray(flags) && flags.length === 0);
  return flagsEmpty
    && /flag.?off|noflags?|negative|control|baseline/.test(haystack)
    && !/flags?-on|positive/.test(haystack);
}

export function countC2(revision, read = reader(revision)) {
  const result = {
    count: 0,
    note: { present: false, sourceIds: [], qualifyingSources: [] },
    readmeMention: false,
    receipt: {
      present: false, cases: 0, passed: 0, failed: null,
      positiveToolsAdded: 0, negativeControls: 0,
    },
    errors: [],
    reasons: [],
    inputs: [],
  };
  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });

  const noteRaw = read.file(C2_NOTE);
  if (!noteRaw) {
    result.reasons.push('round-16 WebMCP knowledge note missing');
  } else {
    result.note.present = true;
    const ids = noteSourceIds(noteRaw);
    result.note.sourceIds = ids;
    if (ids.length === 0) {
      result.reasons.push('round-16 WebMCP note has no leading source: S### lines');
    } else {
      const rows = sourceRows(read);
      if (rows.size === 0) {
        add('sources_missing', `${C2_SOURCES} has no registry rows at the measured revision`);
      }
      for (const id of ids) {
        const row = rows.get(id);
        if (!row) {
          add('source_row_absent', `note cites ${id} but ${C2_SOURCES} has no such row`);
          continue;
        }
        const usedByPaths = row.usedBy.split(',').map(cell => cell.trim());
        const usedByNote = usedByPaths.some(cell => cell === C2_NOTE || cell === `knowledge/${C2_NOTE.split('/').pop()}`);
        if ((row.tier === 'A' || row.tier === 'B') && row.status === 'mined' && usedByNote) {
          result.note.qualifyingSources.push(id);
        } else {
          result.reasons.push(
            `source ${id} does not qualify (tier ${row.tier}, status ${row.status}, used-by ${usedByNote ? 'includes' : 'lacks'} note)`,
          );
        }
      }
      if (result.note.qualifyingSources.length === 0 && errors.length === 0) {
        result.reasons.push('no leading source: id resolves to a mined A/B row used by the note');
      }
    }
  }

  const readmeRaw = read.file(C2_README);
  if (!readmeRaw) {
    if (result.note.present || result.receipt.present) {
      add('readme_missing', `${C2_README} is not committed at the measured revision`);
    } else {
      result.reasons.push(`${C2_README} missing`);
    }
  } else {
    result.readmeMention = readmeRaw.toString('utf8').includes(`knowledge/${C2_NOTE.split('/').pop()}`);
    if (!result.readmeMention) result.reasons.push(`${C2_README} does not mention the WebMCP note`);
  }

  const receiptRaw = read.file(C2_RECEIPT);
  if (!receiptRaw) {
    result.reasons.push('round-16 WebMCP receipt missing');
  } else {
    result.receipt.present = true;
    const receipt = parseJson(receiptRaw, C2_RECEIPT, add);
    if (receipt !== null) {
      if (!isObject(receipt)) {
        add('malformed_receipt', `${C2_RECEIPT} is not an object`);
      } else {
        if (receipt.schema !== 'tabi-round16-webmcp-v1') {
          add('receipt_schema', `schema ${JSON.stringify(receipt.schema)} is not tabi-round16-webmcp-v1`);
        }
        const harnessSha = read.sha(C2_HARNESS);
        if (harnessSha === null) {
          add('harness_missing', `${C2_HARNESS} is not committed at the measured revision`);
        } else if (!isHex(receipt.producerSha256)) {
          add('producer_pin', 'producerSha256 is not a 64-hex digest');
        } else if (receipt.producerSha256 !== harnessSha) {
          add('producer_pin', 'producerSha256 differs from the harness blob at the measured revision');
        }
        const cases = Array.isArray(receipt.cases) ? receipt.cases.filter(isObject) : null;
        if (!cases || cases.length === 0) {
          add('receipt_cases', 'cases must be a non-empty array of case records');
        } else {
          result.receipt.cases = cases.length;
          for (const entry of cases) {
            const verdict = casePass(entry);
            if (verdict === true) result.receipt.passed++;
            else if (verdict === false) {
              add('receipt_case_red', `case ${entry.name ?? entry.id ?? '?'} reports status ${JSON.stringify(entry.status ?? entry.pass ?? entry.ok)}`);
            } else {
              add('receipt_case_status', `case ${entry.name ?? entry.id ?? '?'} has no pass/fail status`);
            }
            const tools = toolsAddedTools(entry);
            if (verdict === true && tools.length > 0) result.receipt.positiveToolsAdded++;
            if (verdict === true && isFlagOffControl(entry) && tools.length === 0) result.receipt.negativeControls++;
          }
          if (result.receipt.positiveToolsAdded === 0) {
            add('receipt_no_positive', 'no passing case observed WebMCP.toolsAdded with a named tool');
          }
          if (result.receipt.negativeControls === 0) {
            add('receipt_no_negative', 'no passing flag-off control observed zero tools');
          }
        }
        if (!isObject(receipt.summary) || !isInt(receipt.summary.failed)) {
          add('receipt_summary', 'summary.failed must be an integer');
        } else {
          result.receipt.failed = receipt.summary.failed;
          if (receipt.summary.failed !== 0) {
            add('receipt_red', `summary.failed is ${receipt.summary.failed}, expected 0`);
          }
        }
      }
    }
  }

  result.count = errors.length === 0 && result.note.present
    && result.note.qualifyingSources.length > 0 && result.readmeMention
    && result.receipt.present ? 1 : 0;
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
    new Error('Usage: node .ufo/waves/round-16/measure.mjs REV [--claim C1|C2 | --histogram]'),
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
    binding_selftest: 'node scripts/selftest-measurement-binding.mjs',
    binding_check: 'node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json',
    webmcp_harness: 'node scripts/webmcp-loopback-round16.mjs',
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
    c1_binding_contracts: c1.count,
    c1_gate: c1.gate,
    c1_gate_sha256: c1.gateSha256,
    c1_selftest_receipt: c1.selftest,
    c1_legacy_receipt: c1.legacy,
    c1_operability_scalar_delta: 0,
    c1_gate_path: C1_GATE,
    c1_selftest_path: C1_SELFTEST_RECEIPT,
    c1_legacy_path: C1_LEGACY_RECEIPT,
    inputsRead: c1.inputs,
    commands,
    errors: sortErrors(c1.errors),
    reasons: c1.reasons.slice().sort(),
  };
}

function c2Output(revision, commands, c2) {
  return {
    revision,
    c2_webmcp_held: c2.count,
    c2_note: c2.note,
    c2_readme_mention: c2.readmeMention ? 1 : 0,
    c2_receipt: c2.receipt,
    c2_coverage_scalar_delta: 0,
    c2_note_path: C2_NOTE,
    c2_receipt_path: C2_RECEIPT,
    c2_harness_path: C2_HARNESS,
    inputsRead: c2.inputs,
    commands,
    errors: sortErrors(c2.errors),
    reasons: c2.reasons.slice().sort(),
  };
}

function run(argv) {
  const options = parseArguments(argv);
  const revision = resolveRevision(options.revision);
  const commands = commandSet(revision);

  if (options.histogram) {
    const sink = new Set();
    const read = reader(revision, sink);
    emit({
      revision,
      source_histogram: sourceHistogram(read),
      note_map: noteMap(read),
      inputsRead: [...sink].sort(),
      commands,
    }, []);
    return;
  }

  const c1Sink = options.claim === 'C2' ? null : new Set();
  const c2Sink = options.claim === 'C1' ? null : new Set();
  const c1 = options.claim === 'C2' ? null : countC1(revision, reader(revision, c1Sink));
  const c2 = options.claim === 'C1' ? null : countC2(revision, reader(revision, c2Sink));
  if (c1) c1.inputs = [...c1Sink].sort();
  if (c2) c2.inputs = [...c2Sink].sort();

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
    source_histogram: sourceHistogram(reader(revision)),
    note_map: noteMap(reader(revision)),
    c1_inputsRead: c1.inputs,
    c2_inputsRead: c2.inputs,
    errors: sortErrors([...c1.errors, ...c2.errors]),
    reasons: [...c1.reasons, ...c2.reasons].sort(),
  };
  delete output.inputsRead;
  emit(output, output.errors);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`MEASURE verdict=could-not-evaluate detail=${error.message}\n`);
  process.exitCode = error.exit ?? 2;
}
