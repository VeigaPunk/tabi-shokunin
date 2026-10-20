#!/usr/bin/env node
// Round-18 C3 counter. All measured inputs are read from committed Git blobs;
// the round-17 facts used to authenticate them are re-derived from M17 blobs.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = '.ufo/waves/round-18/measure-c3.mjs';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const REFERENCE_REV = '93bfead1f5f25f584353df3152a60209bbd89a2e';
const BASELINE_REV = '2bff864fdfee684ddbcd066cc8e735adaba2735c';
const EXPECTED_RERUN_PRODUCER = 'de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7';
const HEX64 = /^[0-9a-f]{64}$/;
const MAX_BUFFER = 64 * 1024 * 1024;

const PATHS = Object.freeze({
  adjacency: 'corpus/adjacency.tsv',
  harmBaseline: '.ufo/waves/round-17/harm-baseline.json',
  adjacencyChecker: 'scripts/check-adjacency.mjs',
  invokeHarness: 'scripts/webmcp-invoke-round17.mjs',
  lesson: 'corpus/lessons/round-18.md',
  harmReceipt: 'corpus/evidence/round-18/routed/harm-at-93bfead.json',
  adjacencyReceipt: 'corpus/evidence/round-18/routed/adjacency-selftest.json',
  sources: 'corpus/SOURCES.md',
  sourceDossier: '.ufo/waves/round-18/sources/S058Listing.md',
  harmRunner: 'corpus/evidence/round-18/routed/harm-runner.mjs',
  rerunPrefix: 'corpus/evidence/round-18/routed/harness-reruns/',
});

const GIT_PREFIX = [
  '-c', 'core.fsmonitor=false',
  '-c', 'core.quotepath=false',
  '-c', 'core.commitGraph=false',
  '-c', 'core.hooksPath=/dev/null',
];
const DEFECT_IDS = Object.freeze(['d1', 'd2', 'd3', 'd4', 'd5']);
const referenceCache = new Map();

class CouldNotEvaluate extends Error {}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function result(pass, why) {
  return { pass, why };
}

function minimalEnv(extra = {}) {
  const env = {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) {
    env.PATH = process.env.PATH.split(':').filter((entry) => entry.startsWith('/')).join(':');
  }
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  return { ...env, ...extra };
}

function git(repo, args, { binary = false, env = {} } = {}) {
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd: repo,
      env: minimalEnv(env),
      encoding: binary ? undefined : 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { error, status: null, stdout: binary ? Buffer.alloc(0) : '', stderr: '' };
  }
}

function checkedGit(repo, args, { binary = false, env = {} } = {}) {
  const response = git(repo, args, { binary, env });
  if (response.error || response.status !== 0) {
    const detail = response.error?.message ?? `status=${response.status} signal=${response.signal ?? 'none'}`;
    throw new CouldNotEvaluate(`git_${args[0]}_failed:${detail}`);
  }
  return response.stdout;
}

function validRevisionToken(rev) {
  return typeof rev === 'string' && /^[A-Za-z0-9][A-Za-z0-9._/~^@{}-]*$/.test(rev);
}

function assertRevision(repo, rev) {
  if (!validRevisionToken(rev)) throw new CouldNotEvaluate('revision_unresolved');
  checkedGit(repo, ['ls-tree', '-d', '-z', rev], { binary: true });
}

function parseTreeEntries(bytes) {
  const records = Buffer.from(bytes).toString('utf8').split('\0').filter(Boolean);
  return records.map((record) => {
    const tab = record.indexOf('\t');
    if (tab < 0) throw new CouldNotEvaluate('git_tree_record_invalid');
    const [mode, type, object] = record.slice(0, tab).split(' ');
    if (!mode || !type || !object) throw new CouldNotEvaluate('git_tree_record_invalid');
    return { mode, type, object, path: record.slice(tab + 1) };
  });
}

function listTree(repo, rev, path, recursive = false) {
  const args = ['ls-tree', '-z'];
  if (recursive) args.push('-r');
  args.push(rev);
  if (path !== null) args.push('--', path);
  return parseTreeEntries(checkedGit(repo, args, { binary: true }));
}

function readCommittedBlob(repo, rev, path) {
  const matches = listTree(repo, rev, path).filter((entry) => entry.path === path);
  if (matches.length === 0) return null;
  if (matches.length !== 1) throw new CouldNotEvaluate('git_tree_entry_ambiguous');
  const entry = matches[0];
  if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) return null;
  return checkedGit(repo, ['show', `${rev}:${path}`], { binary: true });
}

function requireReferenceBlob(repo, rev, path) {
  const bytes = readCommittedBlob(repo, rev, path);
  if (bytes === null) throw new CouldNotEvaluate(`reference_blob_missing:${path}`);
  return bytes;
}

function parseJsonBytes(bytes) {
  try {
    return { value: JSON.parse(Buffer.from(bytes).toString('utf8')), error: null };
  } catch {
    return { value: null, error: 'invalid_json' };
  }
}
function harnessIdsFromSource(source) {
  const cases = /\bconst\s+CASE_IDS\s*=\s*\[([\s\S]*?)\];/.exec(source);
  const controlsAt = source.indexOf('// --- Controls');
  if (!cases || controlsAt < 0) throw new CouldNotEvaluate('reference_harness_id_lists_missing');
  const scenarioIds = [...cases[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const controlIds = [...source.slice(controlsAt).matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
  if (
    scenarioIds.length !== 11 ||
    new Set(scenarioIds).size !== scenarioIds.length ||
    controlIds.length !== 4 ||
    new Set(controlIds).size !== controlIds.length
  ) throw new CouldNotEvaluate('reference_harness_id_lists_invalid');
  return { scenarioIds, controlIds };
}

function buildReferenceFacts(repo, rev, enforcePinnedHarness) {
  assertRevision(repo, rev);
  const cacheKey = `${repo}\0${rev}\0${enforcePinnedHarness ? 'pinned' : 'fixture'}`;
  if (referenceCache.has(cacheKey)) return referenceCache.get(cacheKey);

  const adjacency = requireReferenceBlob(repo, rev, PATHS.adjacency).toString('utf8');
  const adjacencyLines = adjacency.split(/\r?\n/).filter((line) => line.length > 0);
  if (adjacencyLines.length < 2) throw new CouldNotEvaluate('reference_adjacency_empty');
  const header = adjacencyLines[0].split('\t').map((cell) => cell.trim());
  const siblingColumn = header.indexOf('sibling');
  if (siblingColumn < 0) throw new CouldNotEvaluate('reference_sibling_column_missing');
  const siblings = new Set();
  for (const line of adjacencyLines.slice(1)) {
    const cells = line.replace(/\r$/, '').split('\t');
    if (cells.length <= siblingColumn) throw new CouldNotEvaluate('reference_adjacency_row_invalid');
    const sibling = cells[siblingColumn].trim();
    if (!sibling) throw new CouldNotEvaluate('reference_sibling_empty');
    siblings.add(sibling);
  }

  const baselineBytes = requireReferenceBlob(repo, rev, PATHS.harmBaseline);
  const parsedBaseline = parseJsonBytes(baselineBytes);
  const baseline = parsedBaseline.value;
  if (parsedBaseline.error || !baseline || !Array.isArray(baseline.gates) || baseline.gates.length !== 20) {
    throw new CouldNotEvaluate('reference_harm_gate_list_invalid');
  }
  const gateNames = new Set();
  const gateScripts = new Set();
  for (const gate of baseline.gates) {
    if (!gate || typeof gate.gate !== 'string' || gateNames.has(gate.gate)) {
      throw new CouldNotEvaluate('reference_gate_name_invalid');
    }
    if (!Number.isInteger(gate.exit) || !Array.isArray(gate.argv) || !gate.argv.every((arg) => typeof arg === 'string')) {
      throw new CouldNotEvaluate('reference_gate_shape_invalid');
    }
    gateNames.add(gate.gate);
    const scripts = gate.argv.filter((arg) => /^scripts\/.+\.mjs$/.test(arg));
    if (scripts.length !== 1) throw new CouldNotEvaluate('reference_gate_producer_path_invalid');
    gateScripts.add(scripts[0]);
  }

  const gateScriptsSha256 = {};
  for (const path of [...gateScripts].sort()) {
    gateScriptsSha256[path] = sha256(requireReferenceBlob(repo, rev, path));
  }
  const adjacencyCheckerSha256 = sha256(requireReferenceBlob(repo, rev, PATHS.adjacencyChecker));
  const invokeHarnessBytes = requireReferenceBlob(repo, rev, PATHS.invokeHarness);
  const invokeHarnessSha256 = sha256(invokeHarnessBytes);
  if (enforcePinnedHarness && invokeHarnessSha256 !== EXPECTED_RERUN_PRODUCER) {
    throw new CouldNotEvaluate('reference_invoke_harness_sha_mismatch');
  }
  const { scenarioIds, controlIds } = harnessIdsFromSource(invokeHarnessBytes.toString('utf8'));

  const facts = {
    rev,
    siblings: siblings.size,
    baseline,
    gateScriptsSha256,
    adjacencyCheckerSha256,
    invokeHarnessSha256,
    scenarioIds,
    controlIds,
  };
  referenceCache.set(cacheKey, facts);
  return facts;
}

function createBlobReader(repo, rev) {
  const cache = new Map();
  return (path) => {
    if (!cache.has(path)) cache.set(path, readCommittedBlob(repo, rev, path));
    return cache.get(path);
  };
}

function readJson(reader, path) {
  const bytes = reader(path);
  if (bytes === null) return { bytes: null, value: null, error: 'missing' };
  const parsed = parseJsonBytes(bytes);
  return { bytes, value: parsed.value, error: parsed.error };
}

function standaloneInteger(text, value) {
  return new RegExp(`(?<![\\p{L}\\p{N}_])${value}(?![\\p{L}\\p{N}_])`, 'u').test(text);
}

function claimsSevenAsCorrected(line) {
  const sevenPattern = /(?<![\p{L}\p{N}_])7(?![\p{L}\p{N}_])/gu;
  for (const match of line.matchAll(sevenPattern)) {
    const before = line.slice(0, match.index).trimEnd();
    const after = line.slice(match.index + match[0].length);
    if (/(?:\bnot|\bnever|\brather than|\binstead of|\bincorrect(?:ly)?|\bwrong)\s*$/i.test(before)) continue;
    if (
      /\b(?:correct(?:ed|ion)?|actual|true|right|proper)\b[^.;!?]{0,60}(?:\b(?:is|equals|=|:|to|→)\s*)?$/i.test(before) ||
      /\b(?:sibling\s+)?(?:count|number|value)\s*(?:is|equals|=|:|to|→)\s*$/i.test(before) ||
      /^\s*(?:is\s+)?(?:the\s+)?(?:correct(?:ed)?|actual|true|right|proper)\b/i.test(after) ||
      /^\s*(?:is\s+)?(?:the\s+)?(?:correct(?:ed)?\s+)?(?:sibling\s+)?(?:count|number|value)\b/i.test(after)
    ) return true;
  }
  return false;
}

function verifyD1(reader, siblingCount) {
  const lesson = reader(PATHS.lesson);
  if (lesson === null) return result(false, 'lesson_missing');
  const lines = lesson.toString('utf8').split(/\r?\n/);
  let inCorrections = false;
  let sawCitation = false;
  let sawReportCitation = false;
  let claimsSeven = false;
  let validCorrection = false;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      inCorrections = heading[1] === '##' && heading[2].trim() === 'Corrections';
      continue;
    }
    if (!inCorrections || !line.includes('corpus/lessons/round-17.md:116')) continue;
    sawCitation = true;
    if (claimsSevenAsCorrected(line)) {
      claimsSeven = true;
      continue;
    }
    if (!line.includes('.ufo/reports/round-17/tabi.md:35')) continue;
    sawReportCitation = true;
    if (standaloneInteger(line, siblingCount)) validCorrection = true;
  }
  if (claimsSeven) return result(false, 'correction_claims_7');
  if (validCorrection) return result(true, 'correction_line_verified');
  if (sawCitation && !sawReportCitation) return result(false, 'correction_report_citation_missing');
  return result(false, sawCitation ? 'correction_sibling_count_missing' : 'correction_citation_missing');
}

function sameArray(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, i) => value === right[i]);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function verifyD2(reader, facts, referenceRev) {
  const loaded = readJson(reader, PATHS.harmReceipt);
  if (loaded.error === 'missing') return result(false, 'harm_receipt_missing');
  if (loaded.error) return result(false, 'harm_receipt_invalid_json');
  const receipt = loaded.value;
  if (!isRecord(receipt) || receipt.schema !== 'tabi-round18-harm-at-revision-v1') {
    return result(false, 'harm_receipt_schema_invalid');
  }
  if (receipt.revision !== referenceRev) return result(false, 'wrong_revision');
  if (!Array.isArray(receipt.gates) || receipt.gates.length !== 20) return result(false, 'gate_count');

  const expectedBaseline = facts.baseline;
  if (
    !isRecord(receipt.baseline) ||
    receipt.baseline.path !== PATHS.harmBaseline ||
    receipt.baseline.schema !== expectedBaseline.schema ||
    receipt.baseline.revision !== expectedBaseline.baseline
  ) return result(false, 'harm_baseline_identity_mismatch');

  const producer = receipt.producer;
  if (
    !isRecord(producer) ||
    producer.path !== PATHS.harmRunner ||
    typeof producer.sha256 !== 'string' ||
    !HEX64.test(producer.sha256)
  ) return result(false, 'harm_runner_producer_invalid');
  const runnerBytes = reader(PATHS.harmRunner);
  if (runnerBytes === null) return result(false, 'harm_runner_blob_missing');
  if (producer.sha256 !== sha256(runnerBytes)) return result(false, 'harm_runner_producer_mismatch');

  const expectedScripts = facts.gateScriptsSha256;
  if (!isRecord(receipt.gateScriptsSha256)) return result(false, 'gate_producer_map_missing');
  const actualScriptPaths = Object.keys(receipt.gateScriptsSha256).sort();
  const expectedScriptPaths = Object.keys(expectedScripts).sort();
  if (!sameArray(actualScriptPaths, expectedScriptPaths)) return result(false, 'gate_producer_map_mismatch');
  for (const path of expectedScriptPaths) {
    const actual = receipt.gateScriptsSha256[path];
    if (typeof actual !== 'string' || !HEX64.test(actual) || actual !== expectedScripts[path]) {
      return result(false, 'gate_producer_sha_mismatch');
    }
  }

  for (let i = 0; i < facts.baseline.gates.length; i += 1) {
    const expected = facts.baseline.gates[i];
    const gate = receipt.gates[i];
    if (!isRecord(gate) || gate.gate !== expected.gate || !sameArray(gate.argv, expected.argv)) {
      return result(false, 'gate_identity_mismatch');
    }
    if (
      !Number.isInteger(gate.exit) ||
      gate.exit !== expected.exit ||
      gate.baselineExit !== expected.exit ||
      gate.equal !== true
    ) return result(false, 'historical_exit_mismatch');
    if (!isRecord(gate.stdout) || typeof gate.stdout.sha256 !== 'string' || !HEX64.test(gate.stdout.sha256)) {
      return result(false, 'short_stdout_sha256');
    }
    if (!isRecord(gate.stderr) || typeof gate.stderr.sha256 !== 'string' || !HEX64.test(gate.stderr.sha256)) {
      return result(false, 'short_stderr_sha256');
    }
  }
  return result(true, '20_historical_gates_verified');
}

function outputText(value) {
  if (typeof value === 'string') return value;
  if (isRecord(value) && typeof value.content === 'string') return value.content;
  return null;
}

function verifyOutputDigest(record, rootField, nested, content) {
  const expected = [];
  if (Object.hasOwn(record, rootField)) expected.push(record[rootField]);
  if (isRecord(nested) && Object.hasOwn(nested, 'sha256')) expected.push(nested.sha256);
  if (expected.length === 0 || expected.some((value) => typeof value !== 'string' || !HEX64.test(value))) {
    return 'short_digest';
  }
  const actual = sha256(Buffer.from(content, 'utf8'));
  return expected.every((value) => value === actual) ? null : 'digest_mismatch';
}

function verifyD3(reader, facts, referenceRev) {
  const loaded = readJson(reader, PATHS.adjacencyReceipt);
  if (loaded.error === 'missing') return result(false, 'adjacency_receipt_missing');
  if (loaded.error) return result(false, 'adjacency_receipt_invalid_json');
  const receipt = loaded.value;
  if (!isRecord(receipt) || receipt.schema !== 'tabi-routed-adjacency-selftest-v1') {
    return result(false, 'adjacency_receipt_schema_invalid');
  }
  if (receipt.revision !== referenceRev) return result(false, 'wrong_revision');
  if (receipt.exit !== 0) return result(false, 'selftest_exit_nonzero');
  const stdout = outputText(receipt.stdout);
  if (stdout === null) return result(false, 'selftest_stdout_missing');
  const stdoutDigest = verifyOutputDigest(receipt, 'stdoutSha256', receipt.stdout, stdout);
  if (stdoutDigest === 'short_digest') return result(false, 'short_stdout_sha256');
  if (stdoutDigest) return result(false, 'stdout_sha256_mismatch');
  if (typeof receipt.stderrSha256 !== 'string' || !HEX64.test(receipt.stderrSha256)) {
    return result(false, 'short_stderr_sha256');
  }
  if (!/(?:^|\s)cases=57(?:\s|$)/.test(stdout)) return result(false, 'cases_not_57');
  if (!isRecord(receipt.parsed) || receipt.parsed.cases !== 57) return result(false, 'cases_not_57');
  if (receipt.parsed.verdict !== 'clean') return result(false, 'selftest_verdict_not_clean');
  const producer = receipt.producer;
  if (
    !isRecord(producer) ||
    producer.path !== PATHS.adjacencyChecker ||
    producer.sha256 !== facts.adjacencyCheckerSha256
  ) return result(false, 'wrong_producer_sha256');
  return result(true, 'adjacency_selftest_verified');
}

function markdownCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  return trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
}

function isMarkdownSeparator(cells) {
  return cells !== null && cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function verifyD4(reader) {
  const sources = reader(PATHS.sources);
  if (sources === null) return result(false, 'sources_missing');
  const lines = sources.toString('utf8').split(/\r?\n/);
  let header = null;
  let idColumn = -1;
  let teachesColumn = -1;
  let anchorColumn = -1;
  let openedColumn = -1;
  const rows = [];
  for (const line of lines) {
    const cells = markdownCells(line);
    if (cells === null || isMarkdownSeparator(cells)) continue;
    const lower = cells.map((cell) => cell.toLowerCase());
    if (header === null && lower.includes('id') && lower.includes('teaches')) {
      header = cells;
      idColumn = lower.indexOf('id');
      teachesColumn = lower.indexOf('teaches');
      anchorColumn = lower.indexOf('anchor');
      openedColumn = lower.indexOf('opened');
      continue;
    }
    if (header === null || cells.length !== header.length || idColumn < 0 || teachesColumn < 0) continue;
    if (cells[idColumn] === 'S058') rows.push(cells);
  }
  if (rows.length === 0) return result(false, 'S058_missing');
  if (rows.length !== 1) return result(false, 'S058_duplicate');
  if (anchorColumn < 0 || openedColumn < 0) return result(false, 'S058_source_columns_missing');
  const row = rows[0];
  if (!row[teachesColumn].startsWith('supersedes S057 —')) return result(false, 'S058_not_superseding_S057');
  if (row.some((cell) => /individual publisher/i.test(cell))) return result(false, 'S058_individual_publisher');
  if (!/developer\s+Google Ireland, Ltd\./i.test(row[teachesColumn])) {
    return result(false, 'S058_corrected_publisher_missing');
  }
  if (!row[anchorColumn].includes(PATHS.sourceDossier)) return result(false, 'S058_dossier_pointer_missing');
  if (row[openedColumn] !== '2026-10-20') return result(false, 'S058_access_date_mismatch');
  const dossier = reader(PATHS.sourceDossier);
  if (dossier === null) return result(false, 'S058_dossier_blob_missing');
  const dossierText = dossier.toString('utf8');
  if (
    !dossierText.includes('Access date **2026-10-20**') ||
    !dossierText.includes('Developer') ||
    !dossierText.includes('Google Ireland, Ltd.')
  ) return result(false, 'S058_dossier_evidence_mismatch');
  return result(true, 'S058_supersession_verified');
}

function treeBlobsUnder(repo, rev, prefix) {
  return listTree(repo, rev, prefix, true);
}

function verifyD5(reader, repo, rev, facts, referenceRev) {
  const indexPath = `${PATHS.rerunPrefix}index.json`;
  const loaded = readJson(reader, indexPath);
  if (loaded.error === 'missing') return result(false, 'rerun_index_missing');
  if (loaded.error) return result(false, 'rerun_index_invalid_json');
  const index = loaded.value;
  if (!isRecord(index) || index.schema !== 'tabi-routed-harness-reruns-v1') {
    return result(false, 'rerun_index_schema_invalid');
  }
  if (index.revision !== referenceRev) return result(false, 'wrong_revision');
  if (
    !isRecord(index.producer) ||
    index.producer.path !== PATHS.invokeHarness ||
    index.producer.sha256 !== facts.invokeHarnessSha256
  ) return result(false, 'rerun_index_producer_mismatch');
  if (!Array.isArray(index.runs)) return result(false, 'rerun_entries_missing');

  const treeEntries = treeBlobsUnder(repo, rev, PATHS.rerunPrefix);
  const runFileEntries = treeEntries.filter((entry) => entry.path.startsWith(PATHS.rerunPrefix) && /^run-[1-9][0-9]*\.json$/.test(entry.path.slice(PATHS.rerunPrefix.length)));
  const actualFiles = new Set(runFileEntries.map((entry) => entry.path));
  const indexedFiles = new Set(index.runs.filter(isRecord).map((entry) => entry.file).filter((file) => typeof file === 'string'));
  if (actualFiles.size < 7 || indexedFiles.size < 7) return result(false, 'fewer_than_seven_reruns');
  if (index.runs.length !== indexedFiles.size) return result(false, 'rerun_file_duplicate');

  const countsPass = (counts, expected, hasMissing) =>
    isRecord(counts) &&
    counts.total === expected &&
    counts.passed === expected &&
    counts.failed === 0 &&
    (!hasMissing || counts.missing === 0);
  const seenKeys = new Set();
  const seenPaths = new Set();
  const seenDigests = new Set();
  for (const run of index.runs) {
    if (!isRecord(run) || !Number.isInteger(run.k) || run.k < 1 || typeof run.file !== 'string') {
      return result(false, 'rerun_entry_invalid');
    }
    const expectedFile = `run-${run.k}.json`;
    const path = `${PATHS.rerunPrefix}${run.file}`;
    if (run.file !== expectedFile || !actualFiles.has(path)) return result(false, 'rerun_receipt_missing');
    if (seenKeys.has(run.k) || seenPaths.has(path)) return result(false, 'rerun_file_duplicate');
    seenKeys.add(run.k);
    seenPaths.add(path);
    if (typeof run.sha256 !== 'string' || !HEX64.test(run.sha256)) return result(false, 'rerun_sha_mismatch');
    const bytes = reader(path);
    if (bytes === null || sha256(bytes) !== run.sha256) return result(false, 'rerun_sha_mismatch');
    if (seenDigests.has(run.sha256)) return result(false, 'duplicate_rerun_artifact');
    seenDigests.add(run.sha256);
    const parsed = parseJsonBytes(bytes);
    if (parsed.error || !isRecord(parsed.value)) return result(false, 'rerun_receipt_invalid_json');
    const receipt = parsed.value;
    if (receipt.schema !== 'tabi-round17-webmcp-invoke-v1') return result(false, 'rerun_receipt_schema_invalid');
    if (
      !isRecord(receipt.producer) ||
      receipt.producer.path !== PATHS.invokeHarness ||
      receipt.producer.sha256 !== facts.invokeHarnessSha256 ||
      receipt.producerSha256 !== facts.invokeHarnessSha256
    ) return result(false, 'rerun_producer_mismatch');
    if (run.exit !== 0) return result(false, 'rerun_exit_not_zero');
    if (run.verdict !== 'pass' || receipt.verdict !== 'pass') return result(false, 'rerun_verdict_not_pass');
    if (!countsPass(run.cases, facts.scenarioIds.length, true)) return result(false, 'rerun_cases_not_all_pass');
    if (!countsPass(run.controls, facts.controlIds.length, false)) return result(false, 'rerun_controls_not_all_pass');
    if (
      !isRecord(receipt.summary) ||
      receipt.summary.cases !== facts.scenarioIds.length ||
      receipt.summary.passed !== facts.scenarioIds.length ||
      receipt.summary.failed !== 0 ||
      receipt.summary.missing !== 0 ||
      receipt.summary.caseSetOk !== true
    ) return result(false, 'rerun_cases_not_all_pass');
    const caseSet = receipt.summary.caseSet;
    if (
      !isRecord(caseSet) ||
      caseSet.expected !== facts.scenarioIds.length ||
      !sameArray(caseSet.expectedIds, facts.scenarioIds) ||
      caseSet.ran !== facts.scenarioIds.length ||
      caseSet.passed !== facts.scenarioIds.length ||
      caseSet.failed !== 0 ||
      caseSet.missing !== 0 ||
      caseSet.caseSetOk !== true ||
      !Array.isArray(caseSet.duplicates) ||
      caseSet.duplicates.length !== 0
    ) return result(false, 'rerun_case_set_mismatch');
    if (
      !Array.isArray(receipt.cases) ||
      receipt.cases.length !== facts.scenarioIds.length ||
      !sameArray(receipt.cases.map((entry) => entry?.id), facts.scenarioIds)
    ) return result(false, 'rerun_case_set_mismatch');
    if (receipt.cases.some((entry) => !isRecord(entry) || entry.status !== 'pass')) {
      return result(false, 'rerun_cases_not_all_pass');
    }
    if (
      !Array.isArray(receipt.controls) ||
      receipt.controls.length !== facts.controlIds.length ||
      !sameArray(receipt.controls.map((entry) => entry?.id), facts.controlIds)
    ) return result(false, 'rerun_control_set_mismatch');
    if (receipt.controls.some((entry) => !isRecord(entry) || entry.status !== 'pass')) {
      return result(false, 'rerun_controls_not_all_pass');
    }
  }
  if ([...actualFiles].some((path) => !seenPaths.has(path))) return result(false, 'unindexed_rerun_receipt');
  return result(true, `${seenPaths.size}_reruns_verified`);
}


function evaluateRevision(repo, rev, referenceRev = REFERENCE_REV, { enforcePinnedHarness = true } = {}) {
  assertRevision(repo, rev);
  const facts = buildReferenceFacts(repo, referenceRev, enforcePinnedHarness);
  const reader = createBlobReader(repo, rev);
  const defects = {
    d1: verifyD1(reader, facts.siblings),
    d2: verifyD2(reader, facts, referenceRev),
    d3: verifyD3(reader, facts, referenceRev),
    d4: verifyD4(reader),
    d5: verifyD5(reader, repo, rev, facts, referenceRev),
  };
  const counterBytes = reader(SCRIPT_PATH);
  const c3 = Object.values(defects).filter((entry) => entry.pass).length;
  return {
    rev,
    c3_routed_closed: c3,
    defects,
    counterSha256: counterBytes === null ? null : sha256(counterBytes),
  };
}

function allUnavailable(rev, why = 'could_not_evaluate') {
  const defects = Object.fromEntries(DEFECT_IDS.map((id) => [id, result(false, why)]));
  return { rev: rev ?? null, c3_routed_closed: 0, defects, counterSha256: null };
}

function emit(value, status) {
  console.log(JSON.stringify(value));
  process.exitCode = status;
}

// The fixture is confined to a unique /tmp directory. Its only Git writes,
// filesystem reads and mutations are in that throwaway repository.
function putFixtureFile(repo, path, contents) {
  const destination = join(repo, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents);
}

function writeFixtureJson(repo, path, value) {
  putFixtureFile(repo, path, `${JSON.stringify(value, null, 2)}\n`);
}

function fixtureGit(repo, args) {
  return checkedGit(repo, args, {
    env: {
      GIT_AUTHOR_NAME: 'C3 self-test fixture',
      GIT_AUTHOR_EMAIL: 'c3-self-test@example.invalid',
      GIT_COMMITTER_NAME: 'C3 self-test fixture',
      GIT_COMMITTER_EMAIL: 'c3-self-test@example.invalid',
      GIT_AUTHOR_DATE: '2026-10-20T00:00:00Z',
      GIT_COMMITTER_DATE: '2026-10-20T00:00:00Z',
    },
  });
}

function fixtureCommit(repo, message) {
  fixtureGit(repo, ['add', '--all']);
  fixtureGit(repo, ['commit', '--quiet', '--no-gpg-sign', '-m', message]);
  return fixtureGit(repo, ['rev-parse', '--verify', 'HEAD']).trim();
}

function buildSelfTestFixture(repo) {
  fixtureGit(repo, ['init', '--quiet', '--initial-branch=main']);
  const baselineGates = [];
  for (let i = 1; i <= 20; i += 1) {
    const script = `scripts/gate-${String(i).padStart(2, '0')}.mjs`;
    putFixtureFile(repo, script, Buffer.from(`// fixture gate producer ${i}\n`));
    baselineGates.push({
      gate: `gate-${String(i).padStart(2, '0')}`,
      argv: ['node', script],
      exit: i === 5 ? 1 : 0,
    });
  }
  putFixtureFile(repo, PATHS.adjacency, [
    'surface\tsibling\tsibling_ref',
    'a\talpha\tx',
    'b\tbeta\tx',
    'c\tgamma\tx',
    'd\tdelta\tx',
    'e\tepsilon\tx',
    'f\tzeta\tx',
    'g\talpha\tx',
  ].join('\n') + '\n');
  writeFixtureJson(repo, PATHS.harmBaseline, {
    schema: 'tabi-round17-harm-baseline-v1',
    baseline: '5859243183c4d7ac5429dfdb8a73ce0d9a43d583',
    gates: baselineGates,
  });
  putFixtureFile(repo, PATHS.adjacencyChecker, '// fixture adjacency checker\n');
  const scenarioIds = [
    'invoke-imperative-success',
    'invoke-imperative-throws',
    'invoke-imperative-rejects',
    'invoke-unknown-tool',
    'invoke-input-schema-mismatch',
    'invoke-declarative-form',
    'invoke-after-unregister',
    'invoke-concurrent-ids',
    'invoke-flags-off-control',
    'invoke-iframe-frameid',
    'invoke-navigation-pending',
  ];
  const controlIds = [
    'invoke-before-enable',
    'invoke-cancel',
    'invoke-declarative-navigation-result',
    'invoke-domain-disabled',
  ];
  const harnessSource = [
    'const CASE_IDS = [',
    ...scenarioIds.map((id) => `  '${id}',`),
    '];',
    '// --- Controls',
    ...controlIds.map((id) => `withControl({ id: '${id}' });`),
    '',
  ].join('\n');
  putFixtureFile(repo, PATHS.invokeHarness, harnessSource);
  const referenceRev = fixtureCommit(repo, 'C3 self-test reference facts');
  const facts = buildReferenceFacts(repo, referenceRev, false);

  const lesson = [
    '# Round 18 fixture',
    '',
    '## Corrections',
    '',
    '**D1 — sibling count is 6, not 7.** `corpus/lessons/round-17.md:116` and `.ufo/reports/round-17/tabi.md:35`.',
    '',
  ].join('\n');
  putFixtureFile(repo, PATHS.lesson, lesson);

  const gateScriptsSha256 = { ...facts.gateScriptsSha256 };
  const harmRunnerBytes = Buffer.from('// fixture harm runner\n');
  putFixtureFile(repo, PATHS.harmRunner, harmRunnerBytes);
  const harmReceipt = {
    schema: 'tabi-round18-harm-at-revision-v1',
    revision: referenceRev,
    producer: { path: PATHS.harmRunner, sha256: sha256(harmRunnerBytes) },
    baseline: {
      path: PATHS.harmBaseline,
      schema: facts.baseline.schema,
      revision: facts.baseline.baseline,
    },
    gateScriptsSha256,
    gates: facts.baseline.gates.map((gate) => ({
      gate: gate.gate,
      argv: gate.argv,
      exit: gate.exit,
      baselineExit: gate.exit,
      equal: true,
      stdout: { sha256: sha256(Buffer.from(`out:${gate.gate}`)) },
      stderr: { sha256: sha256(Buffer.alloc(0)) },
    })),
  };
  writeFixtureJson(repo, PATHS.harmReceipt, harmReceipt);

  const selftestStdout = 'ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6\n';
  writeFixtureJson(repo, PATHS.adjacencyReceipt, {
    schema: 'tabi-routed-adjacency-selftest-v1',
    revision: referenceRev,
    exit: 0,
    stdout: selftestStdout,
    stdoutSha256: sha256(Buffer.from(selftestStdout)),
    stderrSha256: sha256(Buffer.alloc(0)),
    parsed: { cases: 57, verdict: 'clean' },
    producer: { path: PATHS.adjacencyChecker, sha256: facts.adjacencyCheckerSha256 },
  });

  putFixtureFile(repo, PATHS.sources, [
    '# SOURCES fixture',
    '',
    '## Registry',
    '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    '| S057 | listing | docs | C | old fact | old anchor | prior row | rejected | 2026-10-19 | on-release | — |',
    `| S058 | listing | docs | C | publisher facts | Reopened 2026-10-20; Developer Google Ireland, Ltd.; dossier ${PATHS.sourceDossier} | supersedes S057 — REJECTED: listing names developer Google Ireland, Ltd.; no invocation API | rejected | 2026-10-20 | on-release | — |`,
    '',
  ].join('\n'));
  putFixtureFile(
    repo,
    PATHS.sourceDossier,
    '# S058Listing\n\nAccess date **2026-10-20**. Developer Google Ireland, Ltd. is shown in the reopened listing.\n',
  );

  const rerunDirectory = PATHS.rerunPrefix;
  const runs = [];
  for (let k = 1; k <= 7; k += 1) {
    const file = `run-${k}.json`;
    const receipt = {
      schema: 'tabi-round17-webmcp-invoke-v1',
      verdict: 'pass',
      generatedAt: `fixture-run-${k}`,
      producer: { path: PATHS.invokeHarness, sha256: facts.invokeHarnessSha256 },
      producerSha256: facts.invokeHarnessSha256,
      summary: {
        cases: facts.scenarioIds.length,
        passed: facts.scenarioIds.length,
        failed: 0,
        missing: 0,
        caseSetOk: true,
        caseSet: {
          expected: facts.scenarioIds.length,
          expectedIds: facts.scenarioIds,
          ran: facts.scenarioIds.length,
          passed: facts.scenarioIds.length,
          failed: 0,
          missing: 0,
          duplicates: [],
          caseSetOk: true,
        },
      },
      cases: facts.scenarioIds.map((id) => ({ id, status: 'pass' })),
      controls: facts.controlIds.map((id) => ({ id, status: 'pass' })),
    };
    const bytes = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`);
    putFixtureFile(repo, `${rerunDirectory}${file}`, bytes);
    runs.push({
      k,
      file,
      sha256: sha256(bytes),
      exit: 0,
      verdict: 'pass',
      cases: { total: facts.scenarioIds.length, passed: facts.scenarioIds.length, failed: 0, missing: 0 },
      controls: { total: facts.controlIds.length, passed: facts.controlIds.length, failed: 0 },
    });
  }
  writeFixtureJson(repo, `${rerunDirectory}index.json`, {
    schema: 'tabi-routed-harness-reruns-v1',
    revision: referenceRev,
    producer: { path: PATHS.invokeHarness, sha256: facts.invokeHarnessSha256 },
    runs,
  });
  putFixtureFile(repo, SCRIPT_PATH, '// fixture counter identity\n');
  const honestRev = fixtureCommit(repo, 'C3 self-test honest evidence');
  return { referenceRev, honestRev };
}

function mutateFixture(repo, honestRev, name, mutation) {
  fixtureGit(repo, ['reset', '--hard', honestRev]);
  mutation(repo);
  const rev = fixtureCommit(repo, `C3 self-test forgery: ${name}`);
  return rev;
}

function mutateJson(repo, path, mutate) {
  const absolute = join(repo, path);
  const value = JSON.parse(readFileSync(absolute, 'utf8'));
  mutate(value);
  writeFixtureJson(repo, path, value);
}

function mutateRerunReceipt(repo, k, mutate) {
  const indexPath = `${PATHS.rerunPrefix}index.json`;
  const receiptPath = `${PATHS.rerunPrefix}run-${k}.json`;
  const receipt = JSON.parse(readFileSync(join(repo, receiptPath), 'utf8'));
  mutate(receipt);
  writeFixtureJson(repo, receiptPath, receipt);
  const bytes = readFileSync(join(repo, receiptPath));
  mutateJson(repo, indexPath, (index) => {
    const entry = index.runs.find((run) => run.k === k);
    entry.sha256 = sha256(bytes);
  });
}

function checkForgery(repo, referenceRev, honestRev, { name, defect, expectedWhy, mutation }) {
  const forgedRev = mutateFixture(repo, honestRev, name, mutation);
  const measured = evaluateRevision(repo, forgedRev, referenceRev, { enforcePinnedHarness: false });
  const observed = measured.defects[defect];
  const otherDefectsPass = DEFECT_IDS.filter((id) => id !== defect).every((id) => measured.defects[id].pass);
  const pass = observed.pass === false && observed.why === expectedWhy && otherDefectsPass;
  return { name, defect, expectedWhy, observedWhy: observed.why, otherDefectsPass, pass };
}

function runSelfTest() {
  const temp = mkdtempSync(join(tmpdir(), 'tabi-r18-c3-selftest-'));
  const repo = join(temp, 'repo');
  mkdirSync(repo, { recursive: true });
  try {
    const { referenceRev, honestRev } = buildSelfTestFixture(repo);
    const honest = evaluateRevision(repo, honestRev, referenceRev, { enforcePinnedHarness: false });
    const forgeries = [
      {
        name: 'wrong revision', defect: 'd2', expectedWhy: 'wrong_revision',
        mutation: (root) => mutateJson(root, PATHS.harmReceipt, (receipt) => { receipt.revision = BASELINE_REV; }),
      },
      {
        name: '19 gates', defect: 'd2', expectedWhy: 'gate_count',
        mutation: (root) => mutateJson(root, PATHS.harmReceipt, (receipt) => { receipt.gates.pop(); }),
      },
      {
        name: 'short digest', defect: 'd2', expectedWhy: 'short_stdout_sha256',
        mutation: (root) => mutateJson(root, PATHS.harmReceipt, (receipt) => { receipt.gates[0].stdout.sha256 = 'abcd'; }),
      },
      {
        name: 'wrong gate producer sha', defect: 'd2', expectedWhy: 'gate_producer_sha_mismatch',
        mutation: (root) => mutateJson(root, PATHS.harmReceipt, (receipt) => {
          const path = Object.keys(receipt.gateScriptsSha256)[0];
          receipt.gateScriptsSha256[path] = '0'.repeat(64);
        }),
      },
      {
        name: 'wrong producer sha', defect: 'd3', expectedWhy: 'wrong_producer_sha256',
        mutation: (root) => mutateJson(root, PATHS.adjacencyReceipt, (receipt) => { receipt.producer.sha256 = '0'.repeat(64); }),
      },
      {
        name: 'cases!=57', defect: 'd3', expectedWhy: 'cases_not_57',
        mutation: (root) => mutateJson(root, PATHS.adjacencyReceipt, (receipt) => {
          receipt.stdout = receipt.stdout.replace('cases=57', 'cases=56');
          receipt.stdoutSha256 = sha256(Buffer.from(receipt.stdout));
          receipt.parsed.cases = 56;
        }),
      },
      {
        name: 'S058 still saying individual publisher', defect: 'd4', expectedWhy: 'S058_individual_publisher',
        mutation: (root) => {
          const path = join(root, PATHS.sources);
          const text = readFileSync(path, 'utf8').replace(
            '| S058 | listing | docs | C |',
            '| S058 | listing individual publisher | docs | C |',
          );
          writeFileSync(path, text);
        },
      },
      {
        name: 'S058 not superseding S057', defect: 'd4', expectedWhy: 'S058_not_superseding_S057',
        mutation: (root) => {
          const path = join(root, PATHS.sources);
          const text = readFileSync(path, 'utf8').replace(
            'supersedes S057 — REJECTED: listing names developer Google Ireland, Ltd.; no invocation API',
            're-opened listing disposition',
          );
          writeFileSync(path, text);
        },
      },
      {
        name: 'S058 missing corrected publisher', defect: 'd4', expectedWhy: 'S058_corrected_publisher_missing',
        mutation: (root) => {
          const path = join(root, PATHS.sources);
          const text = readFileSync(path, 'utf8').replace(
            'supersedes S057 — REJECTED: listing names developer Google Ireland, Ltd.; no invocation API',
            'supersedes S057 — REJECTED: listing names developer Example Ltd.; no invocation API',
          );
          writeFileSync(path, text);
        },
      },
      {
        name: 'S058 missing dossier pointer', defect: 'd4', expectedWhy: 'S058_dossier_pointer_missing',
        mutation: (root) => {
          const path = join(root, PATHS.sources);
          const text = readFileSync(path, 'utf8').replace(PATHS.sourceDossier, 'missing-dossier.md');
          writeFileSync(path, text);
        },
      },
      {
        name: 'S058 access date mismatch', defect: 'd4', expectedWhy: 'S058_access_date_mismatch',
        mutation: (root) => {
          const path = join(root, PATHS.sources);
          const text = readFileSync(path, 'utf8').replace('| rejected | 2026-10-20 |', '| rejected | 2026-10-19 |');
          writeFileSync(path, text);
        },
      },
      {
        name: 'S058 dossier not committed', defect: 'd4', expectedWhy: 'S058_dossier_blob_missing',
        mutation: (root) => rmSync(join(root, PATHS.sourceDossier), { force: true }),
      },
      {
        name: 'correction claiming 7', defect: 'd1', expectedWhy: 'correction_claims_7',
        mutation: (root) => {
          const path = join(root, PATHS.lesson);
          const text = readFileSync(path, 'utf8').replace(
            '**D1 — sibling count is 6, not 7.** `corpus/lessons/round-17.md:116` and `.ufo/reports/round-17/tabi.md:35`.',
            '**D1 — corrected sibling count is 7, not 6.** `corpus/lessons/round-17.md:116` and `.ufo/reports/round-17/tabi.md:35`.',
          );
          writeFileSync(path, text);
        },
      },
      {
        name: 'correction omits fleet report pointer', defect: 'd1', expectedWhy: 'correction_report_citation_missing',
        mutation: (root) => {
          const path = join(root, PATHS.lesson);
          const text = readFileSync(path, 'utf8').replace(' and `.ufo/reports/round-17/tabi.md:35`', '');
          writeFileSync(path, text);
        },
      },
      {
        name: 'rerun sha mismatch', defect: 'd5', expectedWhy: 'rerun_sha_mismatch',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => { index.runs[0].sha256 = '0'.repeat(64); }),
      },
      {
        name: 'rerun exit nonzero', defect: 'd5', expectedWhy: 'rerun_exit_not_zero',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => { index.runs[0].exit = 1; }),
      },
      {
        name: 'rerun verdict not pass', defect: 'd5', expectedWhy: 'rerun_verdict_not_pass',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => { index.runs[0].verdict = 'fail'; }),
      },
      {
        name: 'index cases not all pass', defect: 'd5', expectedWhy: 'rerun_cases_not_all_pass',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => {
          index.runs[0].cases.passed = 10;
          index.runs[0].cases.failed = 1;
        }),
      },
      {
        name: 'missing original scenario', defect: 'd5', expectedWhy: 'rerun_case_set_mismatch',
        mutation: (root) => mutateRerunReceipt(root, 1, (receipt) => { receipt.cases[0].id = 'unexpected-case'; }),
      },
      {
        name: 'original scenario failed', defect: 'd5', expectedWhy: 'rerun_cases_not_all_pass',
        mutation: (root) => mutateRerunReceipt(root, 1, (receipt) => { receipt.cases[0].status = 'fail'; }),
      },
      {
        name: 'index controls not all pass', defect: 'd5', expectedWhy: 'rerun_controls_not_all_pass',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => {
          index.runs[0].controls.passed = 3;
          index.runs[0].controls.failed = 1;
        }),
      },
      {
        name: 'original control failed', defect: 'd5', expectedWhy: 'rerun_controls_not_all_pass',
        mutation: (root) => mutateRerunReceipt(root, 1, (receipt) => { receipt.controls[0].status = 'fail'; }),
      },
      {
        name: 'only 6 reruns', defect: 'd5', expectedWhy: 'fewer_than_seven_reruns',
        mutation: (root) => {
          mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => { index.runs.pop(); });
          rmSync(join(root, `${PATHS.rerunPrefix}run-7.json`), { force: true });
        },
      },
      {
        name: 'same rerun file indexed seven times', defect: 'd5', expectedWhy: 'fewer_than_seven_reruns',
        mutation: (root) => mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => {
          const first = index.runs[0];
          index.runs = Array.from({ length: 7 }, (_, i) => ({ ...first, k: i + 1 }));
        }),
      },
      {
        name: 'same receipt bytes indexed seven times', defect: 'd5', expectedWhy: 'duplicate_rerun_artifact',
        mutation: (root) => {
          const firstBytes = readFileSync(join(root, `${PATHS.rerunPrefix}run-1.json`));
          for (let k = 2; k <= 7; k += 1) {
            writeFileSync(join(root, `${PATHS.rerunPrefix}run-${k}.json`), firstBytes);
          }
          mutateJson(root, `${PATHS.rerunPrefix}index.json`, (index) => {
            for (const run of index.runs) run.sha256 = sha256(firstBytes);
          });
        },
      },
    ].map((test) => checkForgery(repo, referenceRev, honestRev, test));
    const honestPass = honest.c3_routed_closed === 5 && DEFECT_IDS.every((id) => honest.defects[id].pass);
    const pass = honestPass && forgeries.length >= 10 && forgeries.every((test) => test.pass);
    return {
      selfTest: pass ? 'pass' : 'fail',
      cases: forgeries.length + 1,
      honest: { c3_routed_closed: honest.c3_routed_closed, defects: honest.defects, pass: honestPass },
      forgeries,
    };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function main(argv) {
  const selfTestOnly = argv.length === 1 && argv[0] === '--self-test';
  const selfTestWithRevision = argv.length === 2 && argv[1] === '--self-test';
  if (selfTestOnly || selfTestWithRevision) {
    try {
      const report = runSelfTest();
      emit(report, report.selfTest === 'pass' ? 0 : 2);
    } catch (error) {
      emit({ selfTest: 'could_not_evaluate', cases: 0, why: error instanceof CouldNotEvaluate ? error.message : 'selftest_failed' }, 2);
    }
    return;
  }
  if (argv.length !== 1 || argv[0] === '--self-test') {
    emit(allUnavailable(null, 'usage'), 2);
    return;
  }
  const rev = argv[0];
  try {
    emit(evaluateRevision(ROOT, rev), 0);
  } catch (error) {
    const why = error instanceof CouldNotEvaluate ? 'could_not_evaluate' : 'could_not_evaluate';
    emit(allUnavailable(rev, why), 2);
  }
}

main(process.argv.slice(2));
