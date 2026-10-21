#!/usr/bin/env node
// Round-20 C1 counter: c1_lifecycle_decisions for the declarative WebMCP
// completion-lifecycle decisions. Source-only: the pinned Chromium 154.0.8037.97
// html_form_element.cc body. Each decision cites a registry row (S096, or S100
// for LC11), and the cited span must lie wholly inside the html_form_element.cc
// ranges that row declares in its anchor column. Mechanical documentation only:
// no row is judged for semantic truth, and nothing here executes target code or
// a browser.
//
// Usage:
//   node .ufo/waves/round-20/measure-c1.mjs REV   one JSON object line on stdout
//   node .ufo/waves/round-20/measure-c1.mjs --selftest
//
// REV resolves to one commit. Every input is a regular blob at that commit,
// read by git argv (no shell) under a minimal environment; the working tree is
// never read. Importing this module runs nothing: the CLI runs only when this
// file is the entry script. evaluate(files) is pure and is the interface for
// the external selftest runner.
//
// Citation. A manifest decision may carry an optional sourceId. Its effective
// source is decision.sourceId ?? manifest.source.id, and its table row renders
// that id as `| LCnn | condition | outcome | <source>:start-end |`. LC11 must
// cite S100; every other decision must cite S096. The cited registry row must
// carry the pinned URL as a whitespace token of its source cell, the exact
// `decoded sha256 <pin>` part of its anchor cell, and a parseable
// `html_form_element.cc:<ranges>` part. The decision span must lie wholly inside
// the union of those ranges.
//
// Metric. c1_lifecycle_decisions = manifest.decisions.length when the manifest
// parses to a plain object whose decisions is an array; otherwise 0. Admit a
// count only with exit 0 (clean: 12 rows). Baseline (manifest and note both
// absent) is 0 with exit 0.
//
// Exit classes. 0 baseline or clean; 1 evaluated with findings (evaluate returns
// only 0 or 1); 2 CLI could not evaluate: usage, revision_unresolved, git_failed,
// entry_not_regular, selftest_unavailable.
//
// Finding ids are the closed FINDING_IDS list. Changing one is a contract change.
//
// --selftest spawns the sibling selftest-c1.mjs as a child node process under
// the same minimal environment, relays its stdout and stderr verbatim, and
// propagates its exit status. An absent or unspawnable child reports
// could_not_evaluate with exit 2.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(SCRIPT);
const SELFTEST_SCRIPT = resolvePath(SCRIPT_DIR, 'selftest-c1.mjs');

const RESULT_SCHEMA = 'tabi-round20-c1-measure-v1';
const METRIC = 'c1_lifecycle_decisions';
const MAX_BUFFER = 64 * 1024 * 1024;
const DETAIL_MAX = 240;
const REV_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._\/@~^{}-]{0,255}$/;
// Every git call carries this fixed prefix: repository config cannot enable
// fsmonitor hooks or change quoting of the plumbing output read here.
const GIT_PREFIX = ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false'];

// Pins from the round-20 design. Changing any pin is a contract change.
const SOURCE_ID = 'S096';
const SUPERSEDING_SOURCE_ID = 'S100';
const SUPERSEDES_PREFIX = 'supersedes S096 \u2014';
const SOURCE_PATH = 'corpus/evidence/round-20/sources/html_form_element.cc';
const SOURCE_URL = 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT';
const SOURCE_SHA256 = '8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916';
const DECODED_SHA_PART = `decoded sha256 ${SOURCE_SHA256}`;
const MANIFEST_PATH = 'corpus/evidence/round-20/lifecycle/decisions.json';
const NOTE_PATH = 'corpus/knowledge/webmcp-completion-lifecycle-round-20.md';
const REGISTRY_PATH = 'corpus/SOURCES.md';
const MANIFEST_SCHEMA = 'tabi-webmcp-lifecycle-decisions-v1';
const MANIFEST_SCOPE = 'source-only Chromium 154.0.8037.97; not runtime-observed';
const TABLE_HEADING = '### Declarative WebMCP completion lifecycle \u2014 source-scoped (round 20)';
const QUOTE_MAX_WORDS = 25;

// 1-based inclusive source-line spans and citing source ids pinned by the design.
const PINNED_DECISIONS = Object.freeze([
  Object.freeze({ id: 'LC01', sourceId: SOURCE_ID, startLine: 181, endLine: 186 }),
  Object.freeze({ id: 'LC02', sourceId: SOURCE_ID, startLine: 189, endLine: 210 }),
  Object.freeze({ id: 'LC03', sourceId: SOURCE_ID, startLine: 249, endLine: 258 }),
  Object.freeze({ id: 'LC04', sourceId: SOURCE_ID, startLine: 212, endLine: 218 }),
  Object.freeze({ id: 'LC05', sourceId: SOURCE_ID, startLine: 218, endLine: 221 }),
  Object.freeze({ id: 'LC06', sourceId: SOURCE_ID, startLine: 224, endLine: 229 }),
  Object.freeze({ id: 'LC07', sourceId: SOURCE_ID, startLine: 261, endLine: 275 }),
  Object.freeze({ id: 'LC08', sourceId: SOURCE_ID, startLine: 290, endLine: 298 }),
  Object.freeze({ id: 'LC09', sourceId: SOURCE_ID, startLine: 298, endLine: 319 }),
  Object.freeze({ id: 'LC10', sourceId: SOURCE_ID, startLine: 320, endLine: 327 }),
  Object.freeze({ id: 'LC11', sourceId: SUPERSEDING_SOURCE_ID, startLine: 787, endLine: 815 }),
  Object.freeze({ id: 'LC12', sourceId: SOURCE_ID, startLine: 818, endLine: 830 }),
]);
const PINNED_BY_ID = new Map(PINNED_DECISIONS.map((pinned) => [pinned.id, pinned]));
const DECISION_REQUIRED_KEYS = Object.freeze(['condition', 'endLine', 'id', 'outcome', 'quote', 'startLine']);
const DECISION_OPTIONAL_KEYS = Object.freeze(['sourceId']);

const LC_ROW = /^\|\s*LC\d{2}\s*\|/;
const SECTION_END = /^#{1,3} /;
const REGISTRY_SECTION_END = /^## /;
const SEPARATOR_ROW = /^\|(\s*:?-+:?\s*\|)+\s*$/;
const ANCHOR_FILE = 'html_form_element.cc:';
// The pinned file followed by its line ranges (a-b or a), e.g.
// "html_form_element.cc:174-328,729-758,818-842"; the lookahead ends the list.
const ANCHOR_RANGES = /html_form_element\.cc:(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*)(?![\d,-])/;
// Affirmative runtime or observation wording is refused in decision text.
const RUNTIME_WORDING = /\b(runtime|run-time|observed|observation|empirical\w*|measured|reproduced)\b/i;

// Closed, stable finding ids (the reason strings returned by evaluate).
const FINDING = Object.freeze({
  partialState: 'partial_state',
  manifestMalformed: 'manifest_malformed',
  manifestShape: 'manifest_shape',
  scopeMismatch: 'scope_mismatch',
  sourceMismatch: 'source_mismatch',
  sourceMissing: 'source_missing',
  sourceDigestMismatch: 'source_digest_mismatch',
  decisionShape: 'decision_shape',
  decisionUnknownId: 'decision_unknown_id',
  decisionDuplicateId: 'decision_duplicate_id',
  decisionMissing: 'decision_missing',
  decisionTextInvalid: 'decision_text_invalid',
  decisionSourceMismatch: 'decision_source_mismatch',
  decisionAnchorUncovered: 'decision_anchor_uncovered',
  runtimeWording: 'runtime_wording',
  spanInvalid: 'span_invalid',
  quoteInvalid: 'quote_invalid',
  quoteMismatch: 'quote_mismatch',
  tableHeadingDuplicate: 'table_heading_duplicate',
  tableRowMissing: 'table_row_missing',
  tableRowExtra: 'table_row_extra',
  registryRowInvalid: 'registry_row_invalid',
  registryStatusInvalid: 'registry_status_invalid',
  registryBacklinkMissing: 'registry_backlink_missing',
});
export const FINDING_IDS = Object.freeze(Object.values(FINDING).sort());

// Closed CLI-only could-not-evaluate reasons (exit 2).
const CLI_REASON = Object.freeze({
  usage: 'usage',
  revisionUnresolved: 'revision_unresolved',
  gitFailed: 'git_failed',
  entryNotRegular: 'entry_not_regular',
  selftestUnavailable: 'selftest_unavailable',
});

export const PINS = Object.freeze({
  manifest: MANIFEST_PATH,
  note: NOTE_PATH,
  source: SOURCE_PATH,
  registry: REGISTRY_PATH,
  schema: MANIFEST_SCHEMA,
  scope: MANIFEST_SCOPE,
  sourceRecord: Object.freeze({ id: SOURCE_ID, path: SOURCE_PATH, url: SOURCE_URL, sha256: SOURCE_SHA256 }),
  supersedingSourceId: SUPERSEDING_SOURCE_ID,
  heading: TABLE_HEADING,
  quoteMaxWords: QUOTE_MAX_WORDS,
  decisions: PINNED_DECISIONS,
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sameKeys(object, keys) {
  const actual = Object.keys(object).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function decisionKeysValid(entry) {
  const keys = Object.keys(entry);
  return DECISION_REQUIRED_KEYS.every((key) => keys.includes(key))
    && keys.every((key) => DECISION_REQUIRED_KEYS.includes(key) || DECISION_OPTIONAL_KEYS.includes(key));
}

function bytesOf(value) {
  if (typeof value === 'string') return Buffer.from(value, 'utf8');
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  throw new TypeError('evaluate: file values must be Buffer, Uint8Array or string');
}

function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// The manifest must be strict UTF-8 JSON: a replacement character inside a
// quote would silently change the literal that is checked against the source.
function strictUtf8(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function parseManifest(bytes) {
  const text = strictUtf8(bytes);
  if (text === null) return null;
  try {
    const doc = JSON.parse(text);
    return isPlainObject(doc) ? doc : null;
  } catch {
    return null;
  }
}

function decisionCount(doc) {
  return doc !== null && Array.isArray(doc.decisions) ? doc.decisions.length : 0;
}

// The base source id a manifest cites; S096 when the source object is unusable
// (source_mismatch reports that case).
function manifestSourceIdOf(doc) {
  return isPlainObject(doc.source) && typeof doc.source.id === 'string' ? doc.source.id : SOURCE_ID;
}

function lineList(text) {
  return text.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));
}

function cellsOf(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function wordCount(text) {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

function citesToken(text, token) {
  return new RegExp(`(?<![A-Za-z0-9])${token}(?![0-9])`).test(text);
}

// Line ranges the anchor cell declares for the pinned file: [] when the cell
// names no html_form_element.cc ranges, null when they are malformed or repeated.
function declaredRanges(anchor) {
  const occurrences = anchor.split(ANCHOR_FILE).length - 1;
  if (occurrences === 0) return [];
  const match = ANCHOR_RANGES.exec(anchor);
  if (occurrences !== 1 || match === null) return null;
  const ranges = match[1].split(',').map((part) => {
    const [first, last = first] = part.split('-').map(Number);
    return [first, last];
  });
  const valid = ranges.every(([first, last]) => Number.isSafeInteger(first) && Number.isSafeInteger(last)
    && first >= 1 && first <= last);
  return valid ? ranges : null;
}

// True when [start, end] lies wholly inside the union of the declared ranges.
function coversSpan(ranges, start, end) {
  const sorted = [...ranges].sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  const runs = [];
  for (const [first, last] of sorted) {
    const run = runs[runs.length - 1];
    if (run !== undefined && first <= run[1] + 1) run[1] = Math.max(run[1], last);
    else runs.push([first, last]);
  }
  return runs.some(([first, last]) => first <= start && end <= last);
}

function renderable(entry) {
  return isPlainObject(entry)
    && typeof entry.id === 'string' && PINNED_BY_ID.has(entry.id)
    && typeof entry.condition === 'string' && typeof entry.outcome === 'string'
    && (entry.sourceId === undefined || typeof entry.sourceId === 'string')
    && Number.isSafeInteger(entry.startLine) && Number.isSafeInteger(entry.endLine);
}

// The exact table row the note must carry for one manifest decision.
function renderRow(entry, manifestSourceId) {
  const source = entry.sourceId ?? manifestSourceId;
  return `| ${entry.id} | ${entry.condition} | ${entry.outcome} | ${source}:${entry.startLine}-${entry.endLine} |`;
}

function summarize(ids, count) {
  const findings = [...new Set(ids)].sort();
  return { exit: findings.length === 0 ? 0 : 1, c1_lifecycle_decisions: count, findings };
}

function sourceRecordMatches(value) {
  return isPlainObject(value)
    && sameKeys(value, ['id', 'path', 'sha256', 'url'])
    && value.id === SOURCE_ID
    && value.path === SOURCE_PATH
    && value.url === SOURCE_URL
    && value.sha256 === SOURCE_SHA256;
}

function checkManifestTop(doc, findings) {
  if (doc.schema !== MANIFEST_SCHEMA || !sameKeys(doc, ['decisions', 'schema', 'scope', 'source'])) {
    findings.add(FINDING.manifestShape);
  }
  if (!Array.isArray(doc.decisions)) findings.add(FINDING.manifestShape);
  if (doc.scope !== MANIFEST_SCOPE) findings.add(FINDING.scopeMismatch);
  if (!sourceRecordMatches(doc.source)) findings.add(FINDING.sourceMismatch);
}

// Source lines when the pinned source is present and digest-verified; null
// otherwise. Literal quote checks run only against a verified source.
function verifiedSourceLines(files, findings) {
  if (!files.has(SOURCE_PATH)) {
    findings.add(FINDING.sourceMissing);
    return null;
  }
  const bytes = bytesOf(files.get(SOURCE_PATH));
  if (sha256Hex(bytes) !== SOURCE_SHA256) {
    findings.add(FINDING.sourceDigestMismatch);
    return null;
  }
  return lineList(bytes.toString('utf8'));
}

function pinnedSpanText(sourceLines, pinned) {
  return sourceLines.slice(pinned.startLine - 1, pinned.endLine).join('\n');
}

// Checks one manifest entry. Returns its pinned span when the id is known.
function checkDecision(entry, manifestSourceId, sourceLines, findings) {
  if (!isPlainObject(entry)) {
    findings.add(FINDING.decisionShape);
    return null;
  }
  if (!decisionKeysValid(entry)) findings.add(FINDING.decisionShape);

  let pinned = null;
  if (typeof entry.id !== 'string') {
    findings.add(FINDING.decisionShape);
  } else {
    pinned = PINNED_BY_ID.get(entry.id) ?? null;
    if (pinned === null) findings.add(FINDING.decisionUnknownId);
  }

  if (entry.sourceId !== undefined && typeof entry.sourceId !== 'string') {
    findings.add(FINDING.decisionShape);
  } else if (pinned !== null && (entry.sourceId ?? manifestSourceId) !== pinned.sourceId) {
    findings.add(FINDING.decisionSourceMismatch);
  }

  for (const field of ['condition', 'outcome']) {
    const text = entry[field];
    if (typeof text !== 'string') {
      findings.add(FINDING.decisionShape);
      continue;
    }
    if (text.trim() === '' || /[|\r\n]/.test(text)) findings.add(FINDING.decisionTextInvalid);
    if (RUNTIME_WORDING.test(text)) findings.add(FINDING.runtimeWording);
  }

  if (!Number.isSafeInteger(entry.startLine) || !Number.isSafeInteger(entry.endLine)) {
    findings.add(FINDING.decisionShape);
  } else if (pinned !== null && (entry.startLine !== pinned.startLine || entry.endLine !== pinned.endLine)) {
    findings.add(FINDING.spanInvalid);
  }

  if (typeof entry.quote !== 'string') {
    findings.add(FINDING.decisionShape);
  } else {
    if (entry.quote.trim() === '' || wordCount(entry.quote) > QUOTE_MAX_WORDS) {
      findings.add(FINDING.quoteInvalid);
    }
    if (pinned !== null && sourceLines !== null && entry.quote.trim() !== ''
      && !pinnedSpanText(sourceLines, pinned).includes(entry.quote)) {
      findings.add(FINDING.quoteMismatch);
    }
  }
  return pinned;
}

// The span a decision cites must lie wholly inside the html_form_element.cc
// ranges declared by the registry row it cites (its effective source). A missing
// or duplicate row is reported by the registry checks, not here.
function checkDecisionAnchor(entry, manifestSourceId, registry, findings) {
  const sourceId = entry.sourceId ?? manifestSourceId;
  const matches = registry.rows.filter((cells) => cells[registry.columns.id] === sourceId);
  if (matches.length !== 1) return;
  const ranges = declaredRanges(matches[0][registry.columns.anchor] ?? '');
  if (ranges === null) {
    findings.add(FINDING.registryRowInvalid);
    return;
  }
  if (!coversSpan(ranges, entry.startLine, entry.endLine)) findings.add(FINDING.decisionAnchorUncovered);
}

function checkDecisions(decisions, manifestSourceId, sourceLines, registry, findings) {
  const counts = new Map();
  for (const entry of decisions) {
    const pinned = checkDecision(entry, manifestSourceId, sourceLines, findings);
    if (pinned === null) continue;
    counts.set(pinned.id, (counts.get(pinned.id) ?? 0) + 1);
    if (registry !== null && Number.isSafeInteger(entry.startLine) && Number.isSafeInteger(entry.endLine)
      && (entry.sourceId === undefined || typeof entry.sourceId === 'string')) {
      checkDecisionAnchor(entry, manifestSourceId, registry, findings);
    }
  }
  for (const pinned of PINNED_DECISIONS) {
    const count = counts.get(pinned.id) ?? 0;
    if (count === 0) findings.add(FINDING.decisionMissing);
    if (count > 1) findings.add(FINDING.decisionDuplicateId);
  }
}

// Table rows under the declared heading must equal the renderable manifest
// decisions as a multiset. Rows outside the heading's section are extra.
function checkTable(noteLines, decisions, manifestSourceId, findings) {
  const headings = [];
  noteLines.forEach((line, index) => {
    if (line.trimEnd() === TABLE_HEADING) headings.push(index);
  });
  if (headings.length > 1) findings.add(FINDING.tableHeadingDuplicate);
  if (headings.length === 0) findings.add(FINDING.tableRowMissing);

  const start = headings.length > 0 ? headings[0] : -1;
  let end = -1;
  if (start >= 0) {
    end = noteLines.length;
    for (let index = start + 1; index < noteLines.length; index++) {
      if (SECTION_END.test(noteLines[index])) {
        end = index;
        break;
      }
    }
  }

  const inSection = new Map();
  let outside = false;
  noteLines.forEach((line, index) => {
    if (!LC_ROW.test(line)) return;
    if (start >= 0 && index > start && index < end) {
      const row = line.trimEnd();
      inSection.set(row, (inSection.get(row) ?? 0) + 1);
    } else {
      outside = true;
    }
  });
  if (outside) findings.add(FINDING.tableRowExtra);

  const expected = new Map();
  for (const entry of decisions) {
    if (!renderable(entry)) continue;
    const row = renderRow(entry, manifestSourceId);
    expected.set(row, (expected.get(row) ?? 0) + 1);
  }
  for (const [row, want] of expected) {
    if ((inSection.get(row) ?? 0) < want) findings.add(FINDING.tableRowMissing);
  }
  for (const [row, have] of inSection) {
    if (have > (expected.get(row) ?? 0)) findings.add(FINDING.tableRowExtra);
  }
}

// SOURCES.md `## Registry` table, parsed once. Null, with a finding, when the
// registry is absent or the table lacks an id, source, anchor, status, teaches or
// used-by column. Rows are cell arrays.
function parseRegistry(registryBytes, findings) {
  if (registryBytes === undefined) {
    findings.add(FINDING.registryRowInvalid);
    return null;
  }
  const registryLines = lineList(registryBytes.toString('utf8'));
  const start = registryLines.findIndex((line) => line.trimEnd() === '## Registry');
  if (start < 0) {
    findings.add(FINDING.registryRowInvalid);
    return null;
  }
  let end = registryLines.length;
  for (let index = start + 1; index < registryLines.length; index++) {
    if (REGISTRY_SECTION_END.test(registryLines[index])) {
      end = index;
      break;
    }
  }
  const tableLines = registryLines.slice(start + 1, end).filter((line) => line.startsWith('|'));
  if (tableLines.length === 0) {
    findings.add(FINDING.registryRowInvalid);
    return null;
  }
  const header = cellsOf(tableLines[0]);
  const columns = {
    id: header.indexOf('id'),
    source: header.indexOf('source'),
    anchor: header.indexOf('anchor'),
    status: header.indexOf('status'),
    teaches: header.indexOf('teaches'),
    usedBy: header.indexOf('used-by'),
  };
  if (Object.values(columns).some((index) => index < 0)) {
    findings.add(FINDING.registryRowInvalid);
    return null;
  }
  const rows = tableLines
    .slice(1)
    .filter((line) => !SEPARATOR_ROW.test(line))
    .map(cellsOf);
  return { columns, rows };
}

// A pinned registry row (S096 or S100): exactly one row; the pinned URL as a
// whitespace token of its source cell; the exact decoded sha256 part and a
// parseable html_form_element.cc range list in its anchor cell; status mined;
// used-by naming the note. The optional extra check adds the superseding rule.
function checkContractRow(registry, sourceId, findings, extra = null) {
  const matches = registry.rows.filter((cells) => cells[registry.columns.id] === sourceId);
  if (matches.length !== 1) {
    findings.add(FINDING.registryRowInvalid);
    return;
  }
  const [cells] = matches;
  const source = cells[registry.columns.source] ?? '';
  const anchor = cells[registry.columns.anchor] ?? '';
  const anchorParts = anchor.split(';').map((part) => part.trim());
  if (!source.split(/\s+/).includes(SOURCE_URL) || !anchorParts.includes(DECODED_SHA_PART)
    || declaredRanges(anchor) === null) {
    findings.add(FINDING.registryRowInvalid);
  }
  if (cells[registry.columns.status] !== 'mined') findings.add(FINDING.registryStatusInvalid);
  const usedBy = (cells[registry.columns.usedBy] ?? '').split(/[,;]/).map((path) => path.trim());
  if (!usedBy.includes(NOTE_PATH)) findings.add(FINDING.registryBacklinkMissing);
  if (extra !== null) extra(cells[registry.columns.teaches] ?? '', findings);
}

// The S100 row supersedes S096 for LC11: its teaches cell begins "supersedes S096 —".
function checkSupersession(teaches, findings) {
  if (!teaches.startsWith(SUPERSEDES_PREFIX)) findings.add(FINDING.registryRowInvalid);
}

function evaluateComplete(files, manifestBytes, noteBytes) {
  const findings = new Set();
  const doc = parseManifest(manifestBytes);
  const sourceLines = verifiedSourceLines(files, findings);
  const noteText = noteBytes.toString('utf8');
  const registry = parseRegistry(files.has(REGISTRY_PATH) ? bytesOf(files.get(REGISTRY_PATH)) : undefined, findings);
  if (doc === null) {
    findings.add(FINDING.manifestMalformed);
  } else {
    checkManifestTop(doc, findings);
    if (Array.isArray(doc.decisions)) {
      const manifestSourceId = manifestSourceIdOf(doc);
      checkDecisions(doc.decisions, manifestSourceId, sourceLines, registry, findings);
      checkTable(lineList(noteText), doc.decisions, manifestSourceId, findings);
    }
  }
  if (!citesToken(noteText, SOURCE_ID) || !citesToken(noteText, SUPERSEDING_SOURCE_ID)) {
    findings.add(FINDING.registryBacklinkMissing);
  }
  if (registry !== null) {
    checkContractRow(registry, SOURCE_ID, findings);
    checkContractRow(registry, SUPERSEDING_SOURCE_ID, findings, checkSupersession);
  }
  return summarize([...findings], decisionCount(doc));
}

// Pure evaluation over repo-relative POSIX paths. files: Map<string,
// Buffer|Uint8Array|string>; a missing key is an absent file. Returns exactly
// { exit, c1_lifecycle_decisions, findings } with findings sorted, unique and
// drawn from FINDING_IDS. Performs no I/O.
export function evaluate(files) {
  if (!(files instanceof Map)) throw new TypeError('evaluate: files must be a Map');
  const manifestBytes = files.has(MANIFEST_PATH) ? bytesOf(files.get(MANIFEST_PATH)) : null;
  const noteBytes = files.has(NOTE_PATH) ? bytesOf(files.get(NOTE_PATH)) : null;
  if (manifestBytes === null && noteBytes === null) return summarize([], 0);
  if (manifestBytes === null || noteBytes === null) {
    const doc = manifestBytes === null ? null : parseManifest(manifestBytes);
    return summarize([FINDING.partialState], decisionCount(doc));
  }
  return evaluateComplete(files, manifestBytes, noteBytes);
}

function cleanDetail(value) {
  const text = String(value).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  return text.length > DETAIL_MAX ? `${text.slice(0, DETAIL_MAX)}...` : text;
}

function emit(record) {
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

function couldNotEvaluate(revision, commit, reason, detail) {
  emit({
    schema: RESULT_SCHEMA,
    metric: METRIC,
    revision,
    commit,
    verdict: 'could_not_evaluate',
    exit: 2,
    c1_lifecycle_decisions: null,
    findings: [],
    reason,
    detail: cleanDetail(detail),
  });
  process.exitCode = 2;
}

// Minimal child environment: git config, hook, replace, graft and lazy-fetch
// controls, literal pathspecs and TZ=UTC. Only absolute PATH entries are kept,
// so a relative entry cannot resolve git inside the measured repository.
function minimalEnv() {
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
  return env;
}

// One git call as an argv array, never a shell. Spawn failures return { error }
// so the caller reports could_not_evaluate instead of throwing.
function git(cwd, args, binary = false) {
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd,
      env: minimalEnv(),
      encoding: binary ? undefined : 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { error, status: null, stdout: binary ? Buffer.alloc(0) : '', stderr: '' };
  }
}

function gitDetail(args, result) {
  const stderr = result.stderr ? String(result.stderr).slice(0, 160) : '';
  return `git ${args.join(' ')} failed (status=${result.status ?? 'spawn'})${stderr ? ` stderr=${stderr}` : ''}`;
}

// Toplevel of the repository that contains this script, or null.
function repoRoot() {
  const result = git(SCRIPT_DIR, ['rev-parse', '--show-toplevel']);
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

// Tree entry for one exact path at one commit. Only mode 100644 or 100755
// blobs are regular; a symlink's "blob" is link text and is never read.
// Returns { status: 'absent' | 'regular' | 'irregular' | 'failed', ... }.
function entryAt(repo, commit, path) {
  const args = ['ls-tree', '-z', commit, '--', path];
  const result = git(repo, args);
  if (result.error || result.status !== 0) return { status: 'failed', detail: gitDetail(args, result) };
  const rows = result.stdout.split('\0').filter((row) => row.length > 0);
  if (rows.length === 0) return { status: 'absent' };
  const match = /^([0-7]{6}) (\S+) ([0-9a-f]{40,64})\t(.*)$/.exec(rows[0]);
  if (match === null) return { status: 'failed', detail: `git ls-tree ${commit} ${path}: malformed row` };
  const [, mode, type, oid] = match;
  if (type !== 'blob' || (mode !== '100644' && mode !== '100755')) {
    return { status: 'irregular', mode, type };
  }
  return { status: 'regular', oid };
}

// The selftest is a separate CLI child; its output and status pass through.
function runSelftest() {
  if (!existsSync(SELFTEST_SCRIPT)) {
    couldNotEvaluate(null, null, CLI_REASON.selftestUnavailable, `absent ${SELFTEST_SCRIPT}`);
    return;
  }
  let child;
  try {
    child = spawnSync(process.execPath, [SELFTEST_SCRIPT], {
      cwd: SCRIPT_DIR,
      env: minimalEnv(),
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    child = { error, status: null, stdout: '', stderr: '' };
  }
  if (child.error || child.status === null) {
    couldNotEvaluate(null, null, CLI_REASON.selftestUnavailable, 'selftest child did not run to completion');
    return;
  }
  process.stdout.write(child.stdout);
  process.stderr.write(child.stderr);
  process.exitCode = child.status;
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--selftest') {
    runSelftest();
    return;
  }
  if (argv.length !== 1) {
    couldNotEvaluate(null, null, CLI_REASON.usage, 'usage: measure-c1.mjs REV | --selftest');
    return;
  }
  const revision = argv[0];
  if (!REV_PATTERN.test(revision)) {
    couldNotEvaluate(revision, null, CLI_REASON.revisionUnresolved, 'revision token refused');
    return;
  }
  const repo = repoRoot();
  if (repo === null) {
    couldNotEvaluate(revision, null, CLI_REASON.gitFailed, 'script directory is not inside a git repository');
    return;
  }
  const resolved = git(repo, ['rev-parse', '--verify', '--end-of-options', `${revision}^{commit}`]);
  if (resolved.error) {
    couldNotEvaluate(revision, null, CLI_REASON.gitFailed, resolved.error.message);
    return;
  }
  if (resolved.status !== 0) {
    couldNotEvaluate(revision, null, CLI_REASON.revisionUnresolved, `${revision} does not resolve to a commit`);
    return;
  }
  const commit = resolved.stdout.trim();

  const files = new Map();
  const blobs = {};
  for (const path of [MANIFEST_PATH, NOTE_PATH, SOURCE_PATH, REGISTRY_PATH]) {
    const entry = entryAt(repo, commit, path);
    if (entry.status === 'failed') {
      couldNotEvaluate(revision, commit, CLI_REASON.gitFailed, entry.detail);
      return;
    }
    if (entry.status === 'irregular') {
      couldNotEvaluate(revision, commit, CLI_REASON.entryNotRegular, `${path} is mode ${entry.mode} ${entry.type}`);
      return;
    }
    if (entry.status === 'absent') {
      blobs[path] = null;
      continue;
    }
    const bytes = git(repo, ['cat-file', 'blob', entry.oid], true);
    if (bytes.error || bytes.status !== 0) {
      couldNotEvaluate(revision, commit, CLI_REASON.gitFailed, `cat-file blob ${entry.oid} failed`);
      return;
    }
    files.set(path, bytes.stdout);
    blobs[path] = entry.oid;
  }

  const outcome = evaluate(files);
  let verdict = 'clean';
  if (outcome.exit !== 0) verdict = 'failed';
  else if (outcome.c1_lifecycle_decisions === 0) verdict = 'baseline';
  emit({
    schema: RESULT_SCHEMA,
    metric: METRIC,
    revision,
    commit,
    verdict,
    exit: outcome.exit,
    c1_lifecycle_decisions: outcome.c1_lifecycle_decisions,
    findings: outcome.findings,
    blobs,
  });
  process.exitCode = outcome.exit;
}

// The CLI runs only when this file is the entry script; importing it is inert.
function isEntrypoint() {
  const entry = process.argv[1];
  if (entry === undefined || entry === '') return false;
  try {
    return realpathSync(resolvePath(entry)) === realpathSync(SCRIPT);
  } catch {
    return false;
  }
}

if (isEntrypoint()) main(process.argv.slice(2));
