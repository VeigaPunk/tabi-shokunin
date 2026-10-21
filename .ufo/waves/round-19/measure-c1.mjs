#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { isDeepStrictEqual } from 'node:util';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HEADING = '### Declarative WebMCP input-validation decision table (round 19)';
const CORRECTED_HEADING = '### Declarative WebMCP input-validation decision table — corrected (round 19)';
const DECISIONS_PATH = 'corpus/evidence/round-19/validation/decisions.json';
const CASES_DIR = 'corpus/evidence/round-19/validation/cases';
const FIXTURES_DIR = 'corpus/evidence/round-19/validation/fixtures';
const RECEIPT_PATH = 'corpus/evidence/round-19/validation/receipt.json';
const SOURCES_PATH = 'corpus/SOURCES.md';
const SOURCE_BODIES_DIR = 'corpus/evidence/round-19/sources';
const PRODUCER_PATH = 'scripts/webmcp-validation-round19.mjs';
const COUNTER_PATH = '.ufo/waves/round-19/measure-c1.mjs';
const SELFTEST_PATH = 'corpus/evidence/round-19/selftests/c1.json';
const RECEIPT_SCHEMA = 'tabi-webmcp-validation-receipt-v1';
const DECISIONS_SCHEMA = 'tabi-webmcp-validation-decisions-v1';
const EXPECTED_DECISION_COUNT = 27;
const EXPECTED_RUNTIME_IDENTITY = 'Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0';
const EXPECTED_RUNTIME = Object.freeze({ chromium: '154.0.8037.97', playwright: '1.64.0', node: '24.21.0' });
const NODE_BIN = '/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node';
const MAX_BUFFER = 64 * 1024 * 1024;
const scriptPath = fileURLToPath(import.meta.url);
const scriptRoot = resolve(dirname(scriptPath), '../../..');

class CounterError extends Error {
  constructor(reason, message) {
    super(message);
    this.name = 'CounterError';
    this.reason = reason;
  }
}

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const counterRoot = () => scriptRoot;

function gitEnv() {
  const env = {
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_LITERAL_PATHSPECS: '1',
    GIT_NO_LAZY_FETCH: '1',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_PAGER: 'cat',
    GIT_TERMINAL_PROMPT: '0',
    HOME: '/nonexistent',
    PAGER: 'cat',
    TZ: 'UTC',
  };
  const path = process.env.PATH ?? '/usr/bin:/bin';
  env.PATH = path.split(':').filter(part => part.startsWith('/')).join(':');
  return env;
}

function run(command, args, { cwd, env = gitEnv(), encoding = null, maxBuffer = MAX_BUFFER, timeout } = {}) {
  const result = spawnSync(command, args, { cwd, env, encoding, maxBuffer, ...(timeout ? { timeout } : {}) });
  if (result.error) throw result.error;
  return result;
}

function runGit(repo, args, reason = 'git_command_failed') {
  let result;
  try {
    result = run('git', ['-C', repo, ...args]);
  } catch (error) {
    throw new CounterError(reason, `git ${args[0]} failed: ${error.message}`);
  }
  if (result.status !== 0) {
    const detail = result.stderr?.toString('utf8').trim();
    throw new CounterError(reason, `git ${args[0]} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout;
}

function resolveCommit(repo, requestedRev) {
  if (typeof requestedRev !== 'string' || requestedRev.length === 0 || requestedRev.startsWith('-')) {
    throw new CounterError('invalid_revision', 'REV must resolve to a commit');
  }
  let output;
  try {
    output = runGit(repo, ['rev-parse', '--verify', '--end-of-options', `${requestedRev}^{commit}`], 'invalid_revision');
  } catch {
    throw new CounterError('invalid_revision', 'REV does not resolve to a commit');
  }
  const canonical = output.toString('utf8').trim();
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/i.test(canonical)) {
    throw new CounterError('invalid_revision', 'REV did not resolve to a full commit object id');
  }
  return canonical.toLowerCase();
}

function parseTreeListing(bytes) {
  const entries = new Map();
  for (const record of bytes.toString('utf8').split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab < 0) throw new CounterError('tree_listing_invalid', 'malformed git ls-tree record');
    const [mode, type, oid] = record.slice(0, tab).split(' ');
    const path = record.slice(tab + 1);
    if (!mode || !type || !oid || !path) throw new CounterError('tree_listing_invalid', 'incomplete git ls-tree record');
    if (entries.has(path)) throw new CounterError('tree_listing_duplicate', `duplicate tree path: ${path}`);
    entries.set(path, { mode, type, oid, path });
  }
  return entries;
}

function listRevisionFiles(repo, rev) {
  const paths = [
    'SKILL.md',
    SOURCES_PATH,
    DECISIONS_PATH,
    RECEIPT_PATH,
    PRODUCER_PATH,
    COUNTER_PATH,
    CASES_DIR,
    FIXTURES_DIR,
    SOURCE_BODIES_DIR,
  ];
  const output = runGit(repo, ['ls-tree', '-rz', '--full-tree', '-r', rev, '--', ...paths]);
  return parseTreeListing(output);
}

function regularBlobEntry(tree, path) {
  const entry = tree.get(path);
  if (!entry) return null;
  if (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) {
    throw new CounterError('non_regular_blob', `${path} is not a regular revision blob`);
  }
  return entry;
}

function readBlob(repo, rev, tree, path, cache = new Map()) {
  if (cache.has(path)) return cache.get(path);
  const entry = regularBlobEntry(tree, path);
  if (!entry) return null;
  let result;
  try {
    result = run('git', [
      '-C', repo,
      'show',
      '--no-ext-diff',
      '--no-textconv',
      '--format=',
      '--end-of-options',
      `${rev}:${path}`,
    ]);
  } catch (error) {
    throw new CounterError('revision_blob_read_failed', `cannot read ${path}: ${error.message}`);
  }
  if (result.status !== 0) throw new CounterError('revision_blob_read_failed', `cannot read ${path} at ${rev}`);
  cache.set(path, result.stdout);
  return result.stdout;
}

function isSafeRelativePath(path) {
  return typeof path === 'string'
    && path.length > 0
    && !path.startsWith('/')
    && !path.includes('\\')
    && path.split('/').every(part => part !== '' && part !== '.' && part !== '..');
}

function isSafeFilename(path, extension) {
  return typeof path === 'string'
    && path.length > 0
    && path === basename(path)
    && !path.includes('..')
    && path.endsWith(extension)
    && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(path);
}

function tableCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const body = trimmed.slice(1, trimmed.endsWith('|') ? -1 : undefined);
  const cells = [];
  let cell = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '\\' && body[i + 1] === '|') {
      cell += '|';
      i++;
    } else if (ch === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function isTableSeparator(cells) {
  return Array.isArray(cells) && cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function isMarkdownHeading(line) {
  return /^#{1,6}\s/.test(line.trim());
}

function parseDecisionTable(markdown) {
  const lines = markdown.split(/\r?\n/);
  const originalIndexes = [];
  const correctedIndexes = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === HEADING) originalIndexes.push(i);
    if (lines[i].trim() === CORRECTED_HEADING) correctedIndexes.push(i);
  }
  // A corrected table supersedes the frozen historical table, never another correction.
  const headingIndexes = correctedIndexes.length > 0 ? correctedIndexes : originalIndexes;
  if (headingIndexes.length !== 1) return { headingCount: headingIndexes.length, rows: [] };
  const headingIndex = headingIndexes[0];

  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (isMarkdownHeading(lines[i])) break;
    const header = tableCells(lines[i]);
    const separator = tableCells(lines[i + 1] ?? '');
    if (!header || !isTableSeparator(separator) || header.length !== separator.length) continue;
    const rows = [];
    for (let j = i + 2; j < lines.length; j++) {
      const cells = tableCells(lines[j]);
      if (!cells) break;
      rows.push({ line: j + 1, text: lines[j].trim(), cells });
    }
    return { headingCount: 1, rows };
  }
  return { headingCount: 1, rows: null };
}

function cleanCell(value) {
  return value.trim().replace(/^`+|`+$/g, '').trim();
}

function normalizedDecisionCell(value) {
  // Ignore only Markdown code delimiters, escaped table pipes and whitespace.
  return value.replace(/\\\|/g, '|').replace(/`+/g, '').replace(/\s+/g, ' ').trim();
}

function isObjectRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function includesExactToken(text, token) {
  if (typeof text !== 'string' || typeof token !== 'string' || token.length === 0) return false;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}(?=$|[^A-Za-z0-9_-])`).test(text);
}

function parseSources(markdown) {
  const lines = markdown.split(/\r?\n/);
  for (let i = 0; i < lines.length - 1; i++) {
    const header = tableCells(lines[i]);
    const separator = tableCells(lines[i + 1]);
    if (!header || !isTableSeparator(separator) || header.length !== separator.length) continue;
    const columns = new Map(header.map((cell, index) => [cell.trim().toLowerCase(), index]));
    if (!['id', 'source', 'anchor', 'status', 'opened'].every(key => columns.has(key))) continue;
    const rows = new Map();
    const duplicates = new Set();
    for (let j = i + 2; j < lines.length; j++) {
      const cells = tableCells(lines[j]);
      if (!cells) break;
      const id = cells[columns.get('id')]?.trim();
      if (!/^S\d{3}$/.test(id ?? '')) continue;
      if (rows.has(id)) {
        duplicates.add(id);
        continue;
      }
      rows.set(id, {
        source: cells[columns.get('source')]?.trim() ?? '',
        anchor: cells[columns.get('anchor')]?.trim() ?? '',
        status: cells[columns.get('status')]?.trim().toLowerCase() ?? '',
        opened: cells[columns.get('opened')]?.trim() ?? '',
      });
    }
    return { rows, duplicates };
  }
  return null;
}

function parseManifest(bytes) {
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new CounterError('manifest_invalid', 'decisions.json is not valid JSON');
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)
      || manifest.schema !== DECISIONS_SCHEMA || manifest.round !== 19
      || manifest.runtime !== EXPECTED_RUNTIME_IDENTITY || !Array.isArray(manifest.decisions)) {
    throw new CounterError('manifest_invalid', 'decisions.json does not match the round-19 decision schema');
  }
  if (manifest.decisions.length !== EXPECTED_DECISION_COUNT) {
    throw new CounterError('manifest_count_mismatch', `expected ${EXPECTED_DECISION_COUNT} decisions`);
  }
  const seenIds = new Set();
  for (const decision of manifest.decisions) {
    if (!decision || typeof decision !== 'object' || !/^DV-\d{2}$/.test(decision.id ?? '')
        || seenIds.has(decision.id)
        || typeof decision.family !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(decision.family)
        || typeof decision.condition !== 'string' || decision.condition.trim() === ''
        || typeof decision.answer !== 'string' || decision.answer.trim() === ''
        || !Array.isArray(decision.probeCases) || decision.probeCases.length === 0
        || decision.probeCases.some(id => typeof id !== 'string' || !/^decl-[a-z0-9][a-z0-9-]*-\d{2}$/.test(id))
        || typeof decision.controlCase !== 'string' || !/^decl-[a-z0-9][a-z0-9-]*-\d{2}$/.test(decision.controlCase)
        || !decision.outcome || typeof decision.outcome.status !== 'string'
        || !(decision.outcome.errorTextIncludes === null || typeof decision.outcome.errorTextIncludes === 'string')
        || ![0, 1].includes(decision.outcome.submitCount)
        || !decision.source || !/^S\d{3}$/.test(decision.source.row ?? '')
        || !isSafeRelativePath(decision.source.body)
        || !decision.source.body.startsWith(`${SOURCE_BODIES_DIR}/`)
        || !decision.source.body.endsWith('.gz')
        || !/^[0-9a-f]{64}$/i.test(decision.source.bodySha256 ?? '')
        || !Array.isArray(decision.source.lines) || decision.source.lines.length !== 2
        || !decision.source.lines.every(line => Number.isInteger(line) && line > 0)
        || decision.source.lines[0] > decision.source.lines[1]
        || typeof decision.source.token !== 'string' || decision.source.token.length === 0) {
      throw new CounterError('manifest_invalid', 'decisions.json contains a malformed decision');
    }
    seenIds.add(decision.id);
  }
  return manifest.decisions;
}

function loadCaseBundle(repo, rev, tree, cache) {
  const caseEntries = [...tree.values()]
    .filter(entry => entry.path.startsWith(`${CASES_DIR}/`) && entry.path.endsWith('.json'))
    .sort((left, right) => left.path.localeCompare(right.path));
  const fixtureEntries = [...tree.values()]
    .filter(entry => entry.path.startsWith(`${FIXTURES_DIR}/`) && entry.path.endsWith('.html'))
    .sort((left, right) => left.path.localeCompare(right.path));
  const issues = [];
  if (caseEntries.length === 0) issues.push('case_files_missing');
  if (fixtureEntries.length === 0) issues.push('fixture_files_missing');

  const fixtureByName = new Map();
  for (const entry of fixtureEntries) fixtureByName.set(entry.path.slice(FIXTURES_DIR.length + 1), entry);
  const caseFiles = new Map();
  const fixtureFiles = new Map();
  const definitions = new Map();
  const duplicateCases = new Set();

  for (const entry of caseEntries) {
    const name = entry.path.slice(CASES_DIR.length + 1);
    if (!isSafeFilename(name, '.json') || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)) {
      issues.push('case_file_not_regular');
      continue;
    }
    const bytes = readBlob(repo, rev, tree, entry.path, cache);
    if (!bytes) {
      issues.push('case_file_missing');
      continue;
    }
    caseFiles.set(name, sha256(bytes));
    let document;
    try {
      document = JSON.parse(bytes.toString('utf8'));
    } catch {
      issues.push('case_file_invalid');
      continue;
    }
    const family = name.slice(0, -'.json'.length);
    if (!document || document.schema !== 'tabi-webmcp-validation-cases-v1'
        || document.family !== family || !/^[a-z0-9][a-z0-9-]*$/.test(family)
        || !isSafeFilename(document.fixture, '.html')
        || !Array.isArray(document.cases) || document.cases.length === 0) {
      issues.push('case_file_invalid');
      continue;
    }
    const fixturePath = `${FIXTURES_DIR}/${document.fixture}`;
    const fixtureEntry = fixtureByName.get(document.fixture);
    if (!fixtureEntry || fixtureEntry.path !== fixturePath) {
      issues.push('fixture_missing');
    } else if (fixtureEntry.type !== 'blob' || !['100644', '100755'].includes(fixtureEntry.mode)) {
      issues.push('fixture_not_regular');
    } else {
      const fixtureBytes = readBlob(repo, rev, tree, fixturePath, cache);
      if (!fixtureBytes) issues.push('fixture_missing');
      else fixtureFiles.set(document.fixture, sha256(fixtureBytes));
    }
    for (const entryCase of document.cases) {
      if (!entryCase || typeof entryCase.id !== 'string'
          || !/^decl-[a-z0-9][a-z0-9-]*-\d{2}$/.test(entryCase.id)
          || typeof entryCase.tool !== 'string' || entryCase.tool.trim() === ''
          || !Object.hasOwn(entryCase, 'input')
          || !entryCase.expect || typeof entryCase.expect !== 'object' || Array.isArray(entryCase.expect)
          || typeof entryCase.expect.status !== 'string'
          || !(entryCase.expect.errorTextIncludes === null || typeof entryCase.expect.errorTextIncludes === 'string')
          || ![0, 1].includes(entryCase.expect.submitCount)
          || !['fields', 'schema'].every(key => entryCase.expect[key] === null || isObjectRecord(entryCase.expect[key]))
          || !entryCase.source || typeof entryCase.source.file !== 'string'
          || typeof entryCase.source.lines !== 'string' || typeof entryCase.source.url !== 'string') {
        issues.push('case_file_invalid');
        continue;
      }
      if (definitions.has(entryCase.id)) {
        duplicateCases.add(entryCase.id);
        continue;
      }
      definitions.set(entryCase.id, {
        id: entryCase.id,
        family,
        fixture: document.fixture,
        tool: entryCase.tool,
        input: entryCase.input,
        expected: entryCase.expect,
        source: entryCase.source,
      });
    }
  }

  return { caseFiles, fixtureFiles, definitions, duplicateCases, issues: [...new Set(issues)] };
}

function normalizedDigestMap(receipt, names, expectedMap, reasonPrefix) {
  let raw;
  if (names === 'fixtures') {
    raw = receipt?.fixturesFilesSha256 ?? receipt?.fixtureFilesSha256 ?? receipt?.fixturesSha256;
    if (!raw && Array.isArray(receipt?.servedFixtures)) {
      raw = Object.fromEntries(receipt.servedFixtures.map(item => [item.path, item.sha256]));
    }
  } else {
    raw = receipt?.casesFilesSha256;
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return `${reasonPrefix}_digest_map_missing`;
  const actual = new Map();
  for (const [rawName, digest] of Object.entries(raw)) {
    if (typeof rawName !== 'string' || typeof digest !== 'string' || !/^[0-9a-f]{64}$/i.test(digest)) {
      return `${reasonPrefix}_digest_map_invalid`;
    }
    const name = basename(rawName);
    if (actual.has(name)) return `${reasonPrefix}_digest_map_duplicate`;
    actual.set(name, digest.toLowerCase());
  }
  if (actual.size !== expectedMap.size) return `${reasonPrefix}_digest_map_mismatch`;
  for (const [name, digest] of expectedMap) {
    if (actual.get(name) !== digest) return `${reasonPrefix}_digest_map_mismatch`;
  }
  return null;
}

function parseReceipt(bytes, label) {
  if (!bytes) return { reason: `${label}_receipt_missing`, receipt: null };
  let receipt;
  try {
    receipt = JSON.parse(bytes.toString('utf8'));
  } catch {
    return { reason: `${label}_receipt_invalid_json`, receipt: null };
  }
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt) || receipt.schema !== RECEIPT_SCHEMA) {
    return { reason: `${label}_receipt_schema_invalid`, receipt: null };
  }
  return { receipt, reason: null };
}

function runtimeIsExpected(receipt) {
  const runtime = receipt?.runtime;
  return runtime?.identity === EXPECTED_RUNTIME_IDENTITY
    && runtime?.chromium?.version === EXPECTED_RUNTIME.chromium
    && runtime?.playwright?.version === EXPECTED_RUNTIME.playwright
    && runtime?.node === EXPECTED_RUNTIME.node;
}

function receiptProducerMatches(receipt, producerDigest) {
  return typeof receipt?.producerSha256 === 'string'
    && /^[0-9a-f]{64}$/i.test(receipt.producerSha256)
    && receipt.producerSha256.toLowerCase() === producerDigest;
}

function indexReceiptCases(receipt) {
  const records = new Map();
  const duplicates = new Set();
  if (!Array.isArray(receipt?.cases)) return { records, duplicates, invalid: true };
  for (const record of receipt.cases) {
    if (!record || typeof record.id !== 'string') continue;
    if (records.has(record.id)) {
      duplicates.add(record.id);
      continue;
    }
    records.set(record.id, record);
  }
  return { records, duplicates, invalid: false };
}

function receiptObservation(record) {
  const observed = record?.observed;
  if (!isObjectRecord(observed)
      || typeof observed.status !== 'string'
      || !(observed.errorText === null || typeof observed.errorText === 'string')
      || ![0, 1].includes(observed.submitCount)
      || !(observed.fields === null || isObjectRecord(observed.fields))
      || !(observed.schema === null || isObjectRecord(observed.schema))
      || !(observed.commandError === null || (isObjectRecord(observed.commandError)
        && typeof observed.commandError.message === 'string' && observed.commandError.message.trim() !== ''))) return null;
  return {
    status: observed.status,
    errorText: observed.errorText,
    submitCount: observed.submitCount,
    fields: observed.fields,
    schema: observed.schema,
    commandError: observed.commandError,
  };
}

function comparableReceiptRecord(record) {
  const observed = receiptObservation(record);
  if (!observed) return null;
  const invoked = record.observed.toolInvoked;
  const responded = record.observed.toolResponded;
  let invokedInput = invoked?.input;
  if (typeof invokedInput === 'string') {
    try { invokedInput = JSON.parse(invokedInput); } catch { /* Rejected by receiptInvocationRejection. */ }
  }
  return {
    id: record.id,
    family: record.family,
    input: record.input,
    expected: record.expected,
    pass: record.pass,
    observed,
    // Invocation/frame ids are correlated within a receipt, never across runs.
    toolInvoked: isObjectRecord(invoked) ? { toolName: invoked.toolName, input: invokedInput } : null,
    toolResponded: isObjectRecord(responded) ? {
      status: responded.status,
      errorText: responded.errorText ?? null,
      ...(Object.hasOwn(responded, 'output') ? { output: responded.output } : {}),
    } : null,
  };
}

function caseExpectationMatches(expected, observed) {
  if (observed.status !== expected.status || observed.submitCount !== expected.submitCount
      || (expected.errorTextIncludes === null ? observed.errorText !== null
        : typeof observed.errorText !== 'string' || !observed.errorText.includes(expected.errorTextIncludes))) return false;
  if (expected.fields !== null) {
    if (!isObjectRecord(observed.fields)) return false;
    for (const [name, value] of Object.entries(expected.fields)) {
      if (!Object.hasOwn(observed.fields, name) || !isDeepStrictEqual(observed.fields[name], value)) return false;
    }
  }
  if (expected.schema !== null) {
    for (const [path, value] of Object.entries(expected.schema)) {
      let actual = observed.schema;
      for (const part of path.split('.')) {
        if (!part || actual === null || typeof actual !== 'object' || !Object.hasOwn(actual, part)) return false;
        actual = actual[part];
      }
      if (!isDeepStrictEqual(actual, value)) return false;
    }
  }
  return true;
}

function receiptInvocationRejection(record, definition) {
  const observed = record.observed;
  if (!['invocationId', 'toolInvoked', 'toolResponded'].every(key => Object.hasOwn(observed, key))) {
    return 'receipt_case_invocation_incomplete';
  }
  if (observed.status === 'no-response') {
    // Non-object CDP inputs are rejected before an invocation exists.
    return !isObjectRecord(definition.input) && observed.commandError !== null
      && observed.commandError.message.includes('Invalid parameters')
      && observed.invocationId === null && observed.toolInvoked === null && observed.toolResponded === null
      && observed.errorText === null && observed.submitCount === 0
      ? null : 'receipt_case_command_rejection_mismatch';
  }
  if (observed.commandError !== null) return 'receipt_case_command_error';
  if (typeof observed.invocationId !== 'string' || observed.invocationId.trim() === ''
      || !isObjectRecord(observed.toolInvoked)) return 'receipt_case_invocation_missing';
  const invoked = observed.toolInvoked;
  if (invoked.invocationId !== observed.invocationId || invoked.toolName !== definition.tool
      || typeof invoked.input !== 'string') return 'receipt_case_invocation_mismatch';
  let input;
  try { input = JSON.parse(invoked.input); } catch { return 'receipt_case_invocation_mismatch'; }
  if (!isDeepStrictEqual(input, definition.input)) return 'receipt_case_invocation_mismatch';
  const responded = observed.toolResponded;
  if (!isObjectRecord(responded)) return 'receipt_case_response_missing';
  if (responded.invocationId !== observed.invocationId || responded.status !== observed.status
      || (responded.errorText ?? null) !== observed.errorText
      || (Object.hasOwn(responded, 'toolName') && responded.toolName !== definition.tool)) {
    return 'receipt_case_response_mismatch';
  }
  return null;
}

function makeDecisionStates(decisions) {
  return decisions.map(decision => ({ id: decision.id, counted: false, reasons: [] }));
}

function addReason(state, reason) {
  if (reason && !state.reasons.includes(reason)) state.reasons.push(reason);
}

function addReasonAll(states, reason) {
  if (reason) states.forEach(state => addReason(state, reason));
}

function indexDecisionRows(decisions, table) {
  const rowsById = new Map();
  const states = new Map(decisions.map(decision => [decision.id, []]));
  if (table.headingCount === 0) {
    for (const decision of decisions) states.get(decision.id).push('missing_heading');
    return { rowsById, states };
  }
  if (table.headingCount !== 1) {
    for (const decision of decisions) states.get(decision.id).push('heading_not_unique');
    return { rowsById, states };
  }
  if (!table.rows) {
    for (const decision of decisions) states.get(decision.id).push('skill_table_missing');
    return { rowsById, states };
  }
  for (const row of table.rows) {
    const id = cleanCell(row.cells[0] ?? '');
    if (!id) continue;
    if (!rowsById.has(id)) rowsById.set(id, []);
    rowsById.get(id).push(row);
  }
  for (const decision of decisions) {
    const matching = rowsById.get(decision.id) ?? [];
    if (matching.length === 0) {
      states.get(decision.id).push('skill_row_missing');
      continue;
    }
    if (matching.length !== 1) {
      states.get(decision.id).push('skill_row_duplicate');
      continue;
    }
    const row = matching[0];
    if (normalizedDecisionCell(row.cells[1] ?? '') !== normalizedDecisionCell(decision.condition)) {
      states.get(decision.id).push('skill_condition_mismatch');
    }
    if (normalizedDecisionCell(row.cells[2] ?? '') !== normalizedDecisionCell(decision.answer)) {
      states.get(decision.id).push('skill_answer_mismatch');
    }
    const rowText = row.cells.join(' | ');
    for (const caseId of decision.probeCases) {
      if (!includesExactToken(rowText, caseId)) states.get(decision.id).push('skill_probe_case_missing');
    }
    if (!includesExactToken(rowText, decision.controlCase)) states.get(decision.id).push('skill_control_case_missing');
    if (!includesExactToken(rowText, decision.source.row)) states.get(decision.id).push('skill_source_missing');
  }
  return { rowsById, states };
}

function duplicateProbeCases(decisions) {
  const caseOwners = new Map();
  for (const decision of decisions) {
    for (const id of decision.probeCases) {
      if (!caseOwners.has(id)) caseOwners.set(id, []);
      caseOwners.get(id).push(decision.id);
    }
  }
  const duplicates = new Set();
  for (const [caseId, owners] of caseOwners) {
    if (owners.length > 1) owners.forEach(id => duplicates.add(id));
  }
  return duplicates;
}

function sourceRejection(decision, sources, cases, repo, rev, tree, cache) {
  const source = decision.source;
  if (!sources) return 'source_registry_missing';
  if (sources.duplicates.has(source.row)) return 'source_row_duplicate';
  const sourceRow = sources.rows.get(source.row);
  if (!sourceRow) return 'source_row_missing';
  if (sourceRow.opened !== '2026-10-21') return 'source_opened_date';
  if (sourceRow.status !== 'mined') return 'source_not_mined';
  if (!sourceRow.anchor.includes(source.bodySha256)) return 'source_anchor_digest_missing';

  const body = readBlob(repo, rev, tree, source.body, cache);
  if (!body) return 'source_body_missing';
  let decoded;
  try {
    decoded = gunzipSync(body);
  } catch {
    return 'source_body_invalid_gzip';
  }
  if (sha256(decoded) !== source.bodySha256.toLowerCase()) return 'source_body_sha256_mismatch';
  const lines = decoded.toString('utf8').split(/\r?\n/);
  const [first, last] = source.lines;
  if (first < 1 || last < first || last > lines.length) return 'source_lines_invalid';
  if (!lines.slice(first - 1, last).join('\n').includes(source.token)) return 'source_token_missing';

  const bodyName = basename(source.body).replace(/\.gz$/i, '');
  const references = [bodyName];
  for (const caseId of [...decision.probeCases, decision.controlCase]) {
    const testCase = cases.definitions.get(caseId);
    if (typeof testCase?.source?.url === 'string' && testCase.source.url.length > 0) references.push(testCase.source.url);
  }
  if (!references.some(reference => sourceRow.source.includes(reference))) return 'source_provenance_mismatch';
  return null;
}

function checkReceiptFileMaps(receipt, bundle) {
  const caseReason = normalizedDigestMap(receipt, 'cases', bundle.caseFiles, 'case_file');
  if (caseReason) return caseReason;
  const fixtureReason = normalizedDigestMap(receipt, 'fixtures', bundle.fixtureFiles, 'fixture_file');
  if (fixtureReason) return fixtureReason;
  return null;
}

function recordForCase(index, caseId, state) {
  if (index.invalid) {
    addReason(state, 'receipt_cases_missing');
    return null;
  }
  if (index.duplicates.has(caseId)) {
    addReason(state, 'receipt_case_duplicate');
    return null;
  }
  const record = index.records.get(caseId);
  if (!record) addReason(state, 'receipt_case_missing');
  return record ?? null;
}

function validateDecisionCases(decision, state, bundle, freshIndex, committedIndex) {
  const probeDefs = [];
  for (const caseId of decision.probeCases) {
    if (bundle.duplicateCases.has(caseId)) {
      addReason(state, 'case_file_case_duplicate');
      continue;
    }
    const definition = bundle.definitions.get(caseId);
    if (!definition) {
      addReason(state, 'case_file_case_missing');
      continue;
    }
    probeDefs.push(definition);
    if (definition.family !== decision.family) addReason(state, 'probe_family_mismatch');
    const expected = definition.expected;
    const outcome = decision.outcome;
    const expectedError = outcome.errorTextIncludes;
    if (expected.status !== outcome.status || expected.submitCount !== outcome.submitCount
        || (expectedError === null ? expected.errorTextIncludes !== null
          : typeof expected.errorTextIncludes !== 'string' || !expected.errorTextIncludes.includes(expectedError))) {
      addReason(state, 'manifest_case_outcome_mismatch');
    }
  }

  const controlDef = bundle.duplicateCases.has(decision.controlCase)
    ? null
    : bundle.definitions.get(decision.controlCase) ?? null;
  if (!controlDef) addReason(state, bundle.duplicateCases.has(decision.controlCase) ? 'case_file_case_duplicate' : 'case_file_case_missing');
  if (controlDef && !probeDefs.some(definition => definition.family === controlDef.family)) {
    addReason(state, 'control_family_mismatch');
  }

  for (const caseId of [...decision.probeCases, decision.controlCase]) {
    const definition = bundle.duplicateCases.has(caseId) ? null : bundle.definitions.get(caseId) ?? null;
    const freshRecord = recordForCase(freshIndex, caseId, state);
    const committedRecord = recordForCase(committedIndex, caseId, state);
    if (!definition || !freshRecord || !committedRecord) continue;

    if (freshRecord.family !== definition.family || committedRecord.family !== definition.family
        || !isDeepStrictEqual(freshRecord.input, definition.input)
        || !isDeepStrictEqual(committedRecord.input, definition.input)
        || !isDeepStrictEqual(freshRecord.expected, definition.expected)
        || !isDeepStrictEqual(committedRecord.expected, definition.expected)) {
      addReason(state, 'receipt_case_file_mismatch');
    }
    const freshComparable = comparableReceiptRecord(freshRecord);
    const committedComparable = comparableReceiptRecord(committedRecord);
    if (!freshComparable || !committedComparable) {
      addReason(state, 'receipt_case_observation_incomplete');
      continue;
    }
    if (!isDeepStrictEqual(freshComparable, committedComparable)) addReason(state, 'receipt_mismatch');
    if (freshRecord.pass !== true || committedRecord.pass !== true) addReason(state, 'case_not_passed');
    for (const record of [freshRecord, committedRecord]) {
      if (!caseExpectationMatches(definition.expected, receiptObservation(record))) {
        addReason(state, 'receipt_case_expectation_mismatch');
      }
      addReason(state, receiptInvocationRejection(record, definition));
    }
  }

  for (const caseId of decision.probeCases) {
    const freshRecord = freshIndex.records.get(caseId);
    const committedRecord = committedIndex.records.get(caseId);
    for (const record of [freshRecord, committedRecord]) {
      if (!record) continue;
      const observed = receiptObservation(record);
      if (!observed) continue;
      if (observed.status !== decision.outcome.status
          || observed.submitCount !== decision.outcome.submitCount
          || (decision.outcome.errorTextIncludes === null ? observed.errorText !== null
            : !String(observed.errorText ?? '').includes(decision.outcome.errorTextIncludes))) {
        addReason(state, 'probe_outcome_mismatch');
      }
    }
  }

  if (controlDef) {
    const freshRecord = freshIndex.records.get(decision.controlCase);
    const committedRecord = committedIndex.records.get(decision.controlCase);
    for (const record of [freshRecord, committedRecord]) {
      const observed = receiptObservation(record);
      if (observed && observed.status !== 'Completed') addReason(state, 'control_not_completed');
    }
  }
}

function summarize(decisions, states, rev, runtime, counterSha256, exitCode = 0) {
  const details = states.map(state => ({
    id: state.id,
    counted: state.reasons.length === 0,
    reasons: state.reasons,
  }));
  return {
    exitCode,
    result: {
      rev,
      c1_validation_decisions: details.filter(decision => decision.counted).length,
      decisions: details,
      runtime,
      counterSha256,
    },
  };
}

function makeZeroResult(rev, counterSha256, reason = null) {
  return {
    exitCode: 0,
    result: {
      rev,
      c1_validation_decisions: 0,
      decisions: [],
      runtime: null,
      counterSha256,
      ...(reason ? { reason } : {}),
    },
  };
}

function runFreshReproduction(repo, rev, tempRoot) {
  const sandbox = join(tempRoot, 'sandbox');
  const outputPath = join(tempRoot, 'fresh-receipt.json');
  const nodeDir = dirname(NODE_BIN);
  const inheritedPath = (process.env.PATH ?? '/usr/bin:/bin').split(':').filter(part => part.startsWith('/'));
  const home = join(tempRoot, 'home');
  const temp = join(tempRoot, 'tmp');
  mkdirSync(home, { recursive: true });
  mkdirSync(temp, { recursive: true });
  const runnerEnv = {
    HOME: home,
    TMPDIR: temp,
    XDG_CONFIG_HOME: join(home, '.config'),
    XDG_CACHE_HOME: join(home, '.cache'),
    PATH: [nodeDir, ...inheritedPath.filter(part => part !== nodeDir)].join(':'),
    TZ: 'UTC',
    LANG: 'C.UTF-8',
  };
  if (!existsSync(NODE_BIN)) throw new CounterError('reproduction_node_missing', `required Node is missing: ${NODE_BIN}`);

  runGit(repo, ['clone', '--quiet', '--no-hardlinks', '--no-checkout', repo, sandbox], 'sandbox_clone_failed');
  runGit(sandbox, ['checkout', '--quiet', '--detach', rev], 'sandbox_checkout_failed');
  const sandboxRev = runGit(sandbox, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}'], 'sandbox_checkout_failed').toString('utf8').trim().toLowerCase();
  if (sandboxRev !== rev) throw new CounterError('sandbox_revision_mismatch', `sandbox checkout is ${sandboxRev}, expected ${rev}`);

  let result;
  try {
    result = run(NODE_BIN, [PRODUCER_PATH, '--out', outputPath], {
      cwd: sandbox,
      env: runnerEnv,
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
      timeout: 480_000,
    });
  } catch (error) {
    throw new CounterError('reproduction_failed', `validation harness could not run: ${error.message}`);
  }
  if (result.status !== 0 && result.status !== 1) {
    throw new CounterError('reproduction_failed', `validation harness exited ${result.status}: ${result.stderr.trim()}`);
  }
  let stat;
  try {
    stat = lstatSync(outputPath);
  } catch {
    throw new CounterError('reproduction_receipt_missing', 'validation harness did not write its fresh receipt');
  }
  if (!stat.isFile() || stat.isSymbolicLink()) throw new CounterError('reproduction_receipt_invalid', 'fresh receipt is not a regular file');
  let receipt;
  try {
    receipt = JSON.parse(readFileSync(outputPath, 'utf8'));
  } catch {
    throw new CounterError('reproduction_receipt_invalid', 'fresh receipt is not valid JSON');
  }
  return receipt;
}

function countRevision(repo, requestedRev, { noReproduce = false, freshReceiptOverride = null } = {}) {
  const rev = resolveCommit(repo, requestedRev);
  const tree = listRevisionFiles(repo, rev);
  const cache = new Map();
  const skillBytes = readBlob(repo, rev, tree, 'SKILL.md', cache);
  if (!skillBytes) throw new CounterError('skill_missing', `SKILL.md is missing at ${rev}`);
  const table = parseDecisionTable(skillBytes.toString('utf8'));
  const manifestBytes = readBlob(repo, rev, tree, DECISIONS_PATH, cache);
  const counterBytes = readBlob(repo, rev, tree, COUNTER_PATH, cache);
  const counterSha256 = counterBytes ? sha256(counterBytes) : null;

  if (!manifestBytes && table.headingCount === 0) return makeZeroResult(rev, counterSha256);
  if (!manifestBytes) throw new CounterError('manifest_missing', `${DECISIONS_PATH} is missing at ${rev}`);
  const decisions = parseManifest(manifestBytes);
  const states = makeDecisionStates(decisions);
  const stateById = new Map(states.map(state => [state.id, state]));

  const indexedRows = indexDecisionRows(decisions, table);
  for (const [id, reasons] of indexedRows.states) reasons.forEach(reason => addReason(stateById.get(id), reason));
  for (const id of duplicateProbeCases(decisions)) addReason(stateById.get(id), 'duplicate_probe_case_id');

  if (table.headingCount !== 1 || !table.rows) {
    return summarize(decisions, states, rev, null, counterSha256);
  }

  const sourcesBytes = readBlob(repo, rev, tree, SOURCES_PATH, cache);
  const sources = sourcesBytes ? parseSources(sourcesBytes.toString('utf8')) : null;
  const bundle = loadCaseBundle(repo, rev, tree, cache);
  for (const issue of bundle.issues) addReasonAll(states, issue);

  const committedParsed = parseReceipt(readBlob(repo, rev, tree, RECEIPT_PATH, cache), 'committed');
  if (committedParsed.reason) addReasonAll(states, committedParsed.reason);
  const committedReceipt = committedParsed.receipt;
  const harnessBytes = readBlob(repo, rev, tree, PRODUCER_PATH, cache);
  if (!harnessBytes) throw new CounterError('producer_blob_missing', `${PRODUCER_PATH} is missing at ${rev}`);
  const producerDigest = sha256(harnessBytes);

  let freshReceipt = freshReceiptOverride;
  if (!freshReceipt) {
    if (noReproduce) throw new CounterError('selftest_fresh_receipt_missing', 'self-test fixture did not supply a fresh receipt');
    const tempRoot = mkdtempSync(join(tmpdir(), 'tabi-r19-c1-reproduction-'));
    try {
      freshReceipt = runFreshReproduction(repo, rev, tempRoot);
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  }

  const freshParsed = parseReceipt(Buffer.from(JSON.stringify(freshReceipt)), 'fresh');
  if (freshParsed.reason) addReasonAll(states, freshParsed.reason);
  const fresh = freshParsed.receipt;
  if (committedReceipt) {
    if (!runtimeIsExpected(committedReceipt)) addReasonAll(states, 'runtime_identity_mismatch');
    if (!receiptProducerMatches(committedReceipt, producerDigest)) addReasonAll(states, 'producer_sha256_mismatch');
    const mapReason = checkReceiptFileMaps(committedReceipt, bundle);
    if (mapReason) addReasonAll(states, mapReason);
  }
  if (fresh) {
    if (!runtimeIsExpected(fresh)) addReasonAll(states, 'runtime_identity_mismatch');
    if (!receiptProducerMatches(fresh, producerDigest)) addReasonAll(states, 'producer_sha256_mismatch');
    const mapReason = checkReceiptFileMaps(fresh, bundle);
    if (mapReason) addReasonAll(states, mapReason);
  }
  const freshIndex = indexReceiptCases(fresh);
  const committedIndex = indexReceiptCases(committedReceipt);
  if (freshIndex.invalid) addReasonAll(states, 'fresh_receipt_cases_missing');
  if (committedIndex.invalid && !committedParsed.reason) addReasonAll(states, 'committed_receipt_cases_missing');

  for (const decision of decisions) {
    const state = stateById.get(decision.id);
    const sourceReason = sourceRejection(decision, sources, bundle, repo, rev, tree, cache);
    addReason(state, sourceReason);
    validateDecisionCases(decision, state, bundle, freshIndex, committedIndex);
  }

  return summarize(decisions, states, rev, fresh?.runtime ?? null, counterSha256);
}

function fixtureSourceBody() {
  return Buffer.from([
    'fixture source line one',
    'fixture source line two',
    'const observedValidationToken = "bad-input";',
    'fixture source line four',
    '',
  ].join('\n'));
}

function fixtureCaseDocument(family, fixture, probeCount = EXPECTED_DECISION_COUNT, includeOtherControl = false) {
  const cases = [];
  for (let index = 1; index <= probeCount; index++) {
    const suffix = String(index).padStart(2, '0');
    const id = `decl-${family}-${suffix}`;
    cases.push({
      id,
      tool: 'fixture-tool',
      input: { value: `probe-${suffix}` },
      expect: { status: 'Error', errorTextIncludes: 'invalid fixture input', submitCount: 0, fields: { value: 'seed' }, schema: { 'properties.value.type': 'string' } },
      source: { file: 'fixture.cc', lines: '3-3', url: 'https://fixture.invalid/src/fixture.cc' },
      question: `Does ${id} reject?`,
      answer: 'Observed Error with no submit.',
    });
  }
  cases.push({
    id: `decl-${family}-99`,
    tool: 'fixture-tool',
    input: { value: 'control' },
    expect: { status: 'Completed', errorTextIncludes: null, submitCount: 1, fields: { value: 'control' }, schema: { 'properties.value.type': 'string' } },
    source: { file: 'fixture.cc', lines: '3-3', url: 'https://fixture.invalid/src/fixture.cc' },
    question: 'Control case.',
    answer: 'Observed Completed with one submit.',
  });
  if (includeOtherControl) {
    cases.push({
      id: 'decl-other-family-99',
      tool: 'other-tool',
      input: { value: 'other-control' },
      expect: { status: 'Completed', errorTextIncludes: null, submitCount: 1, fields: { value: 'other-control' }, schema: { 'properties.value.type': 'string' } },
      source: { file: 'other.cc', lines: '1-1', url: 'https://fixture.invalid/src/other.cc' },
      question: 'Other-family control.',
      answer: 'Observed Completed with one submit.',
    });
  }
  return { schema: 'tabi-webmcp-validation-cases-v1', family, fixture, author: 'CounterSelfTest', cases };
}

function makeFixtureDecision(index, bodyHash, sourceRow = 'S077') {
  const suffix = String(index).padStart(2, '0');
  return {
    id: `DV-${suffix}`,
    family: 'fixture-family',
    condition: `Invalid input shape ${suffix}`,
    answer: 'The browser rejects this value before submit.',
    probeCases: [`decl-fixture-family-${suffix}`],
    controlCase: 'decl-fixture-family-99',
    outcome: { status: 'Error', errorTextIncludes: 'invalid fixture input', submitCount: 0 },
    source: {
      row: sourceRow,
      body: `${SOURCE_BODIES_DIR}/fixture.cc.gz`,
      bodySha256: bodyHash,
      lines: [3, 3],
      token: 'observedValidationToken',
    },
  };
}

function fixtureSkill(decisions, {
  heading = true, omitDecisionId = null, correctedHeading = false,
  changedCondition = false, changedAnswer = false, formatCells = false,
} = {}) {
  const renderCell = text => {
    const escaped = text.replace(/\|/g, '\\|');
    return formatCells ? `\`${escaped.replace(/ /g, '  ')}\`` : escaped;
  };
  const lines = [
    ...(heading ? [correctedHeading ? CORRECTED_HEADING : HEADING, ''] : ['### Other heading', '']),
    '| Decision | Condition | Answer | Probe cases | Control case | Source | Outcome |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const decision of decisions) {
    if (decision.id === omitDecisionId) continue;
    const condition = changedCondition && decision.id === 'DV-01' ? 'Changed condition with retained identifiers' : decision.condition;
    const answer = changedAnswer && decision.id === 'DV-01' ? 'The browser accepts this value and submits.' : decision.answer;
    lines.push(`| ${decision.id} | ${renderCell(condition)} | ${renderCell(answer)} | ${decision.probeCases.map(id => `\`${id}\``).join(', ')} | \`${decision.controlCase}\` | \`${decision.source.row}\` | ${decision.outcome.status} / ${decision.outcome.submitCount} |`);
  }
  return `${lines.join('\n')}\n`;
}

function fixtureSources(bodyHash, opened = '2026-10-21', source = 'fixture.cc — https://fixture.invalid/src/fixture.cc', status = 'mined') {
  return [
    '## Registry',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    `| S077 | ${source} | code | A | fixture validation | body sha256 ${bodyHash}; lines 3-3 | fixture | ${status} | ${opened} | on-release | — |`,
    '',
  ].join('\n');
}

function expectedRuntime() {
  return {
    identity: EXPECTED_RUNTIME_IDENTITY,
    chromium: { version: EXPECTED_RUNTIME.chromium },
    playwright: { version: EXPECTED_RUNTIME.playwright },
    node: EXPECTED_RUNTIME.node,
  };
}

function makeFixtureReceipt(producerDigest, casesDoc, fixtureDigest, shape = {}) {
  const cases = casesDoc.cases.map(testCase => {
    const status = testCase.expect.status;
    const errorText = testCase.expect.errorTextIncludes;
    const noInvocation = status === 'no-response';
    const invocationId = noInvocation ? null : `committed-${testCase.id}`;
    const fields = { ...testCase.expect.fields };
    const observed = {
      status,
      errorText,
      submitCount: testCase.expect.submitCount,
      fields,
      schema: { type: 'object', properties: { value: { type: 'string' } }, required: [] },
      commandError: noInvocation ? { message: 'cdpSession.send: Protocol error (WebMCP.invokeTool): Invalid parameters' } : null,
      invocationId,
      toolInvoked: noInvocation ? null : {
        invocationId, frameId: `committed-frame-${testCase.id}`, toolName: testCase.tool, input: JSON.stringify(testCase.input),
      },
      toolResponded: noInvocation ? null : {
        invocationId, status,
        ...(errorText === null ? {} : { errorText }),
        ...(status === 'Completed' ? { output: { ok: true, fields: { ...fields } } } : {}),
      },
    };
    return {
      id: testCase.id,
      family: testCase.id === 'decl-other-family-99' ? 'other-family' : casesDoc.family,
      input: testCase.input,
      expected: testCase.expect,
      observed,
      pass: true,
    };
  });
  const receipt = {
    schema: RECEIPT_SCHEMA,
    generatedAt: '2026-10-21T00:00:00.000Z',
    runtime: expectedRuntime(),
    producerSha256: producerDigest,
    casesFilesSha256: {
      [`${casesDoc.family}.json`]: shape.caseDigest
        ?? sha256(Buffer.from(`${JSON.stringify(casesDoc, null, 2)}\n`)),
    },
    fixturesFilesSha256: { [casesDoc.fixture]: fixtureDigest },
    cases,
  };
  if (shape.producerMismatch) receipt.producerSha256 = '0'.repeat(64);
  if (shape.caseDigestMismatch) receipt.casesFilesSha256[`${casesDoc.family}.json`] = '0'.repeat(64);
  if (shape.fixtureDigestMismatch) receipt.fixturesFilesSha256[casesDoc.fixture] = '0'.repeat(64);
  return receipt;
}

function createFixtureRepo(parent, name, shape = {}) {
  const repo = resolve(parent, name);
  mkdirSync(repo, { recursive: true });
  runGit(repo, ['init', '--quiet', '--initial-branch=main']);

  const sourceBytes = fixtureSourceBody();
  const bodyHash = sha256(sourceBytes);
  const compressedBody = gzipSync(shape.bodyShaMismatch
    ? Buffer.concat([sourceBytes, Buffer.from('tampered source bytes')])
    : sourceBytes);
  const decisions = Array.from({ length: EXPECTED_DECISION_COUNT }, (_, index) => makeFixtureDecision(index + 1, bodyHash));
  if (shape.duplicateProbe) decisions[1].probeCases = [...decisions[0].probeCases];
  if (shape.wrongTokenLines) decisions[0].source.lines = [1, 2];
  if (shape.crossFamilyControl) decisions[0].controlCase = 'decl-other-family-99';

  const includeOther = shape.crossFamilyControl === true;
  const casesDoc = fixtureCaseDocument('fixture-family', 'fixture-family.html', EXPECTED_DECISION_COUNT, includeOther);
  const otherDoc = includeOther
    ? { schema: 'tabi-webmcp-validation-cases-v1', family: 'other-family', fixture: 'other-family.html', author: 'CounterSelfTest', cases: [casesDoc.cases.at(-1)] }
    : null;
  if (includeOther) casesDoc.cases.pop();
  if (Object.hasOwn(shape, 'nonObjectInput')) {
    casesDoc.cases[0].input = shape.nonObjectInput;
    casesDoc.cases[0].expect.status = 'no-response';
    casesDoc.cases[0].expect.errorTextIncludes = null;
    decisions[0].outcome = { status: 'no-response', errorTextIncludes: null, submitCount: 0 };
  }
  if (shape.nullField) casesDoc.cases[0].expect.fields.value = null;
  const caseBytes = Buffer.from(`${JSON.stringify(casesDoc, null, 2)}\n`);
  const fixtureBytes = Buffer.from('<!doctype html><title>fixture</title><form toolname="fixture-tool"></form>\n');
  const otherFixtureBytes = Buffer.from('<!doctype html><title>other</title><form toolname="other-tool"></form>\n');
  const producerBytes = Buffer.from('// fixture producer bytes\n');
  const producerDigest = sha256(producerBytes);
  const fixtureDigest = sha256(fixtureBytes);
  const otherCaseBytes = otherDoc ? Buffer.from(`${JSON.stringify(otherDoc, null, 2)}\n`) : null;
  const otherFixtureDigest = otherDoc ? sha256(otherFixtureBytes) : null;

  let sourceText = fixtureSources(bodyHash, shape.sourceOpened ?? '2026-10-21', shape.sourceCell ?? undefined, shape.sourceStatus ?? 'mined');
  if (shape.sourceCell === undefined) sourceText = fixtureSources(bodyHash, shape.sourceOpened ?? '2026-10-21', 'fixture.cc — https://fixture.invalid/src/fixture.cc', shape.sourceStatus ?? 'mined');
  const skillOptions = {
    heading: shape.heading !== false, omitDecisionId: shape.missingRow ? 'DV-01' : null,
    changedCondition: shape.changedCondition, changedAnswer: shape.changedAnswer, formatCells: shape.formatCells,
  };
  let skillText = fixtureSkill(decisions, skillOptions);
  if (shape.correctedTable || shape.duplicateCorrectedTable) {
    const corrected = fixtureSkill(decisions, { ...skillOptions, correctedHeading: true });
    skillText = `${fixtureSkill(decisions, { changedAnswer: true })}\n${corrected}`;
    if (shape.duplicateCorrectedTable) skillText += `\n${corrected}`;
  }
  const manifest = {
    schema: DECISIONS_SCHEMA,
    round: 19,
    author: 'CounterSelfTest',
    runtime: EXPECTED_RUNTIME_IDENTITY,
    rules: 'fixture predeclared decisions',
    decisions,
  };
  if (shape.crossFamilyControl) {
    manifest.decisions[0].family = 'fixture-family';
  }
  const receipt = makeFixtureReceipt(producerDigest, casesDoc, fixtureDigest, shape);
  if (otherDoc) {
    receipt.casesFilesSha256['other-family.json'] = sha256(otherCaseBytes);
    receipt.fixturesFilesSha256['other-family.html'] = otherFixtureDigest;
    receipt.cases.push(...makeFixtureReceipt(producerDigest, otherDoc, otherFixtureDigest).cases);
  }
  const freshReceipt = JSON.parse(JSON.stringify(receipt));
  for (const record of freshReceipt.cases) {
    const observed = record.observed;
    if (observed.invocationId === null) continue;
    observed.invocationId = `fresh-${record.id}`;
    observed.toolInvoked.invocationId = observed.invocationId;
    observed.toolInvoked.frameId = `fresh-frame-${record.id}`;
    observed.toolResponded.invocationId = observed.invocationId;
  }
  const committedProbe = receipt.cases.find(entry => entry.id === decisions[0].probeCases[0]);
  const freshProbe = freshReceipt.cases.find(entry => entry.id === decisions[0].probeCases[0]);
  if (shape.changedField) committedProbe.observed.fields.value = 'tampered';
  if (shape.missingField) delete committedProbe.observed.fields.value;
  if (shape.missingFields) delete committedProbe.observed.fields;
  if (shape.changedSchema) committedProbe.observed.schema.properties.value.type = 'number';
  if (shape.changedFieldsBoth) {
    committedProbe.observed.fields.value = 'tampered';
    freshProbe.observed.fields.value = 'tampered';
  }
  if (shape.rawResponseContradiction) committedProbe.observed.toolResponded.status = 'Completed';
  if (shape.missingRawResponse) committedProbe.observed.toolResponded = null;
  if (shape.wrongResponseId) committedProbe.observed.toolResponded.invocationId = 'another-invocation';
  if (shape.wrongToolName) committedProbe.observed.toolInvoked.toolName = 'another-tool';
  if (shape.wrongInvokedInput) committedProbe.observed.toolInvoked.input = '{"value":42}';
  if (shape.unexpectedCommandError) committedProbe.observed.commandError = { message: 'unexpected command failure' };
  if (shape.missingCommandRejection) committedProbe.observed.commandError = null;
  if (shape.receiptMismatch) {
    committedProbe.observed.status = 'Completed';
  }
  if (shape.controlStatus) {
    for (const current of [receipt, freshReceipt]) {
      const control = current.cases.find(entry => entry.id === decisions[0].controlCase);
      control.observed.status = shape.controlStatus;
      control.observed.toolResponded.status = shape.controlStatus;
      if (shape.controlStatus !== 'Completed') delete control.observed.toolResponded.output;
    }
  }
  if (shape.unexpectedNullError) {
    for (const current of [receipt, freshReceipt]) {
      const control = current.cases.find(entry => entry.id === decisions[0].controlCase);
      control.observed.errorText = 'unexpected error';
      control.observed.toolResponded.errorText = 'unexpected error';
    }
  }
  if (shape.producerMismatch) {
    receipt.producerSha256 = '0'.repeat(64);
    freshReceipt.producerSha256 = '0'.repeat(64);
  }
  if (shape.caseDigestMismatch) {
    receipt.casesFilesSha256['fixture-family.json'] = '0'.repeat(64);
    freshReceipt.casesFilesSha256['fixture-family.json'] = '0'.repeat(64);
  }
  if (shape.fixtureDigestMismatch) {
    receipt.fixturesFilesSha256['fixture-family.html'] = '0'.repeat(64);
    freshReceipt.fixturesFilesSha256['fixture-family.html'] = '0'.repeat(64);
  }

  const files = new Map([
    ['SKILL.md', Buffer.from(skillText)],
    [SOURCES_PATH, Buffer.from(sourceText)],
    [DECISIONS_PATH, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`)],
    [RECEIPT_PATH, Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`)],
    [PRODUCER_PATH, producerBytes],
    [COUNTER_PATH, readFileSync(scriptPath)],
    [`${CASES_DIR}/fixture-family.json`, caseBytes],
    [`${FIXTURES_DIR}/fixture-family.html`, fixtureBytes],
    [`${SOURCE_BODIES_DIR}/fixture.cc.gz`, compressedBody],
  ]);
  if (shape.baseline) {
    files.delete(DECISIONS_PATH);
    files.set('SKILL.md', Buffer.from('# Before round-19 validation\n'));
  }
  if (otherDoc) {
    files.set(`${CASES_DIR}/other-family.json`, otherCaseBytes);
    files.set(`${FIXTURES_DIR}/other-family.html`, otherFixtureBytes);
  }
  for (const [path, bytes] of files) {
    const absolute = resolve(repo, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, bytes);
  }
  runGit(repo, ['add', '--', '.']);
  runGit(repo, [
    '-c', 'user.name=counter-selftest',
    '-c', 'user.email=counter-selftest@invalid.example',
    'commit', '--quiet', '-m', 'isolated decision counter fixture',
  ]);
  const rev = runGit(repo, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}']).toString('utf8').trim();
  return { repo, rev, freshReceipt };
}

function reasonMap(result) {
  return Object.fromEntries(result.decisions.filter(decision => decision.reasons.length > 0)
    .map(decision => [decision.id, decision.reasons]));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function withGitPoison(callback) {
  const keys = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_COUNT', 'GIT_CONFIG_KEY_0', 'GIT_CONFIG_VALUE_0'];
  const previous = new Map(keys.map(key => [key, process.env[key]]));
  process.env.GIT_DIR = '/not-a-repository';
  process.env.GIT_WORK_TREE = '/not-a-worktree';
  process.env.GIT_CONFIG_GLOBAL = '/not-a-global-config';
  process.env.GIT_CONFIG_COUNT = '1';
  process.env.GIT_CONFIG_KEY_0 = 'core.pager';
  process.env.GIT_CONFIG_VALUE_0 = 'false';
  try {
    return callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function selfTest() {
  const tempRoot = mkdtempSync(join(tmpdir(), 'tabi-r19-c1-selftest-'));
  const cases = [];
  const scenarios = [
    { name: 'positive predeclared inventory', shape: {}, expectedCount: 27, expectedReasons: {} },
    { name: 'missing null-valued expected field is not treated as null', shape: { nullField: true, missingField: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_expectation_mismatch'] } },
    { name: 'baseline without manifest or heading evaluates to zero', kind: 'baseline', shape: { baseline: true }, expectedCount: 0, expectedReasons: {} },
    { name: 'corrected table supersedes stale historical answer', shape: { correctedTable: true }, expectedCount: 27, expectedReasons: {} },
    { name: 'duplicate corrected headings fail closed', shape: { duplicateCorrectedTable: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['heading_not_unique']])) },
    { name: 'code delimiters and whitespace normalize', shape: { formatCells: true }, expectedCount: 27, expectedReasons: {} },
    { name: 'array command rejection has no invocation', shape: { nonObjectInput: [] }, expectedCount: 27, expectedReasons: {} },
    { name: 'string command rejection has no invocation', shape: { nonObjectInput: 'not-an-object' }, expectedCount: 27, expectedReasons: {} },
    { name: 'null command rejection has no invocation', shape: { nonObjectInput: null }, expectedCount: 27, expectedReasons: {} },
    { name: 'object input cannot claim protocol-only rejection', shape: { nonObjectInput: {} }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_case_command_rejection_mismatch'] } },
    { name: 'no-response requires the command rejection', shape: { nonObjectInput: [], missingCommandRejection: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_command_rejection_mismatch'] } },
    { name: 'changed observed field with pass retained', shape: { changedField: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_expectation_mismatch'] } },
    { name: 'missing expected field key with pass retained', shape: { missingField: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_expectation_mismatch'] } },
    { name: 'missing observed fields object', shape: { missingFields: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_case_observation_incomplete'] } },
    { name: 'changed observed schema with pass retained', shape: { changedSchema: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_expectation_mismatch'] } },
    { name: 'matching bad fields in both receipts still fail expectations', shape: { changedFieldsBoth: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_case_expectation_mismatch'] } },
    { name: 'raw response contradicts summarized status', shape: { rawResponseContradiction: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_response_mismatch'] } },
    { name: 'missing raw response', shape: { missingRawResponse: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_response_missing'] } },
    { name: 'raw response id must match within the receipt', shape: { wrongResponseId: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_case_response_mismatch'] } },
    { name: 'raw invocation tool must match case definition', shape: { wrongToolName: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_invocation_mismatch'] } },
    { name: 'raw invocation input preserves JSON types', shape: { wrongInvokedInput: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_invocation_mismatch'] } },
    { name: 'invocation cannot also have a command error', shape: { unexpectedCommandError: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_command_error'] } },
    { name: 'null error expectation requires no error text', shape: { unexpectedNullError: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['receipt_case_expectation_mismatch']])) },
    { name: 'changed SKILL condition retains all identifiers', shape: { changedCondition: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['skill_condition_mismatch'] } },
    { name: 'changed SKILL answer retains all identifiers', shape: { changedAnswer: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['skill_answer_mismatch'] } },
    { name: 'duplicate probe id rejects every owner', shape: { duplicateProbe: true }, expectedCount: 25, expectedReasons: { 'DV-01': ['duplicate_probe_case_id'], 'DV-02': ['duplicate_probe_case_id'] } },
    { name: 'missing SKILL row', shape: { missingRow: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['skill_row_missing'] } },
    { name: 'wrong source token line range', shape: { wrongTokenLines: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['source_token_missing'] } },
    { name: 'body SHA mismatch', shape: { bodyShaMismatch: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['source_body_sha256_mismatch']])) },
    { name: 'source opened before round date', shape: { sourceOpened: '2026-10-20' }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['source_opened_date']])) },
    { name: 'receipt differs from fresh run', shape: { receiptMismatch: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['receipt_mismatch', 'receipt_case_expectation_mismatch', 'receipt_case_response_mismatch', 'probe_outcome_mismatch'] } },
    { name: 'producer SHA mismatch', shape: { producerMismatch: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['producer_sha256_mismatch']])) },
    { name: 'control is not Completed', shape: { controlStatus: 'Error' }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['receipt_case_expectation_mismatch', 'control_not_completed']])) },
    { name: 'control is from another family', shape: { crossFamilyControl: true }, expectedCount: 26, expectedReasons: { 'DV-01': ['control_family_mismatch'] } },
    { name: 'missing target heading', shape: { heading: false }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['missing_heading']])) },
    { name: 'case file digest mismatch', shape: { caseDigestMismatch: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['case_file_digest_map_mismatch']])) },
    { name: 'fixture digest mismatch', shape: { fixtureDigestMismatch: true }, expectedCount: 0, expectedReasons: Object.fromEntries(Array.from({ length: 27 }, (_, i) => [`DV-${String(i + 1).padStart(2, '0')}`, ['fixture_file_digest_map_mismatch']])) },
    { name: 'non-commit revision refused', kind: 'tree', expectedExit: 2, expectedReason: 'invalid_revision' },
    { name: 'replace-object poison ignored', kind: 'replace', expectedCount: 27, expectedReasons: {} },
  ];

  try {
    for (let index = 0; index < scenarios.length; index++) {
      const scenario = scenarios[index];
      try {
        const fixture = createFixtureRepo(tempRoot, `case-${String(index + 1).padStart(2, '0')}`, scenario.shape ?? {});
        if (scenario.kind === 'tree') {
          const treeId = runGit(fixture.repo, ['rev-parse', '--verify', '--end-of-options', `${fixture.rev}^{tree}`]).toString('utf8').trim();
          let observedExit = 0;
          let observedReason = null;
          try {
            countRevision(fixture.repo, treeId, { noReproduce: true, freshReceiptOverride: fixture.freshReceipt });
          } catch (error) {
            observedExit = 2;
            observedReason = error.reason ?? 'unexpected_error';
          }
          cases.push({
            name: scenario.name,
            expected_exit: scenario.expectedExit,
            observed_exit: observedExit,
            expected_reason: scenario.expectedReason,
            observed_reason: observedReason,
            pass: observedExit === scenario.expectedExit && observedReason === scenario.expectedReason,
          });
          continue;
        }
        if (scenario.kind === 'replace') {
          const originalRev = fixture.rev;
          writeFileSync(resolve(fixture.repo, 'SKILL.md'), '### Replaced heading\n');
          runGit(fixture.repo, ['add', '--', 'SKILL.md']);
          runGit(fixture.repo, ['-c', 'user.name=counter-selftest', '-c', 'user.email=counter-selftest@invalid.example', 'commit', '--quiet', '-m', 'replacement commit']);
          const replacementRev = runGit(fixture.repo, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}']).toString('utf8').trim();
          runGit(fixture.repo, ['replace', '--force', originalRev, replacementRev]);
        }

        const measured = withGitPoison(() => countRevision(fixture.repo, fixture.rev, {
          noReproduce: true,
          freshReceiptOverride: fixture.freshReceipt,
        }));
        const result = measured.result;
        const actualReasons = reasonMap(result);
        const actualExit = measured.exitCode;
        const pass = actualExit === (scenario.expectedExit ?? 0)
          && result.c1_validation_decisions === scenario.expectedCount
          && sameJson(actualReasons, scenario.expectedReasons ?? {});
        cases.push({
          name: scenario.name,
          expected_exit: scenario.expectedExit ?? 0,
          observed_exit: actualExit,
          expected_count: scenario.expectedCount,
          observed_count: result.c1_validation_decisions,
          expected_reasons: scenario.expectedReasons ?? {},
          observed_reasons: actualReasons,
          pass,
        });
      } catch (error) {
        cases.push({
          name: scenario.name,
          expected_exit: scenario.expectedExit ?? 0,
          observed_exit: 2,
          expected_count: scenario.expectedCount ?? null,
          observed_count: null,
          expected_reasons: scenario.expectedReasons ?? {},
          observed_reasons: {},
          reason: error.reason ?? 'unexpected_error',
          error: error.message,
          pass: false,
        });
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
  return {
    schema: 'tabi-webmcp-validation-counter-selftest-v1',
    selfTest: true,
    noReproduce: true,
    allPass: cases.every(item => item.pass),
    case_count: cases.length,
    negative_shape_count: scenarios.filter(scenario => scenario.kind !== 'baseline'
      && (scenario.expectedExit === 2 || scenario.expectedCount < EXPECTED_DECISION_COUNT)).length,
    cases,
  };
}

function parseArgs(argv) {
  const options = { selfTest: false, noReproduce: false, repo: null, rev: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--self-test') options.selfTest = true;
    else if (arg === '--no-reproduce') options.noReproduce = true;
    else if (arg === '--repo') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new CounterError('usage_error', '--repo requires a path');
      options.repo = resolve(argv[++i]);
    } else if (arg.startsWith('--')) {
      throw new CounterError('usage_error', `unknown option ${arg}`);
    } else if (options.rev === null) {
      options.rev = arg;
    } else {
      throw new CounterError('usage_error', `unexpected argument ${arg}`);
    }
  }
  if (options.noReproduce && !options.selfTest) throw new CounterError('usage_error', '--no-reproduce is available only with --self-test');
  if (options.selfTest && (options.rev || options.repo)) throw new CounterError('usage_error', '--self-test cannot be combined with REV or --repo');
  if (!options.selfTest && !options.rev) throw new CounterError('usage_error', 'REV is required');
  return options;
}

function writeSelfTestReceipt(result) {
  const receipt = {
    ...result,
    generatedAt: new Date().toISOString(),
    producer: {
      path: COUNTER_PATH,
      sha256: sha256(readFileSync(scriptPath)),
    },
    node: process.versions.node,
  };
  const outputPath = resolve(counterRoot(), SELFTEST_PATH);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
  return receipt;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.selfTest) {
      const result = writeSelfTestReceipt(selfTest());
      process.stdout.write(`${JSON.stringify(result)}\n`);
      if (!result.allPass) process.exitCode = 1;
      return;
    }
    let measured;
    try {
      measured = countRevision(options.repo ?? counterRoot(), options.rev);
    } catch (error) {
      if (!(error instanceof CounterError)) throw error;
      process.stderr.write(`C1_COUNTER_ERROR ${JSON.stringify({ reason: error.reason, message: error.message })}\n`);
      process.exitCode = 2;
      return;
    }
    process.stdout.write(`${JSON.stringify(measured.result)}\n`);
    process.exitCode = measured.exitCode;
  } catch (error) {
    const reason = error instanceof CounterError ? error.reason : 'unexpected_error';
    process.stderr.write(`C1_COUNTER_ERROR ${JSON.stringify({ reason, message: error.message })}\n`);
    process.exitCode = reason === 'usage_error' ? 2 : 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) main();
