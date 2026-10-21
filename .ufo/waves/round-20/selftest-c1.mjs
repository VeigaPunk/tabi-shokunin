#!/usr/bin/env node
// tabi round-20 C1 — isolated selftest runner for .ufo/waves/round-20/measure-c1.mjs.
//
// Builds each fixture as a fresh in-memory Map (repo-relative POSIX path ->
// Buffer|string) from the pinned spec below plus the retained authentic S096
// blob, calls the counter's pure evaluate(files) once per case, and asserts the
// exact c1_lifecycle_decisions count, exit and sorted finding-reason set persisted
// in corpus/evidence/round-20/selftests/expected.json. Every persisted reason must
// be registered in the counter's FINDING_IDS. Pre-flight faults (retained blob
// digest, decision quote/span/authority pins) are exit 2: they fault the runner or
// its retained inputs, never the counter. Writes no file, spawns no child process,
// and runs nothing on import. Fixtures are built against lane design.json sha256
// 1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da.
//
// Usage: node .ufo/waves/round-20/selftest-c1.mjs [--measure <path>] [--expected <path>]
// Exit: 0 every case matches; 1 a case mismatches; 2 could not evaluate (bad
// arguments, counter unloadable or missing evaluate/FINDING_IDS, unreadable or
// invalid expected.json, retained blob unreadable or unauthentic, runner fault).
// Last stdout line: MEASURE_C1_SELFTEST verdict=clean|failed cases=<n> reasons=<k>
// or MEASURE_C1_SELFTEST verdict=could_not_evaluate detail=<token>.
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const selfPath = fileURLToPath(import.meta.url);
const here = dirname(selfPath);
const repoRoot = resolve(here, '..', '..', '..');
const defaultMeasure = resolve(here, 'measure-c1.mjs');
const defaultExpected = resolve(repoRoot, 'corpus/evidence/round-20/selftests/expected.json');
const EXPECTED_SCHEMA = 'tabi-round20-c1-selftest-expected-v1';

// Pinned spec: design.json source, heading and manifestShape, and the registry
// row contract. Kept here, never read from the counter or from scribe output, so
// the fixtures stay independent of both.
const PIN = Object.freeze({
  metric: 'c1_lifecycle_decisions',
  schema: 'tabi-webmcp-lifecycle-decisions-v1',
  scope: 'source-only Chromium 154.0.8037.97; not runtime-observed',
  heading: '### Declarative WebMCP completion lifecycle \u2014 source-scoped (round 20)',
  sourceId: 'S096',
  authorityId: 'S100',
  authorityTeaches: 'supersedes S096 \u2014 ',
  sourcePath: 'corpus/evidence/round-20/sources/html_form_element.cc',
  sourceUrl: 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT',
  sourceSha256: '8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916',
  manifestPath: 'corpus/evidence/round-20/lifecycle/decisions.json',
  notePath: 'corpus/knowledge/webmcp-completion-lifecycle-round-20.md',
  registryPath: 'corpus/SOURCES.md',
  priorNote: 'corpus/knowledge/webmcp-declarative-validation-round-19.md',
});

// Twelve decisions with the design.json spans. Each quote is a literal substring
// of its own span (checked in preflight). LC11 alone carries the S100 authority
// override; the other eleven render with the manifest source (S096). LC12 wording
// follows the revised design topic; no fixture reads topic text.
const DECISIONS = Object.freeze([
  { id: 'LC01', condition: 'toolautosubmit attribute present or absent on the form', outcome: 'require_submit_button is true only when the attribute is absent', startLine: 181, endLine: 186, quote: '!form_->FastHasAttribute(html_names::kToolautosubmitAttr);' },
  { id: 'LC02', condition: 'FillFormControls returns a ScriptToolError', outcome: 'the error reaches the done callback before is_currently_running_ is set', startLine: 189, endLine: 210, quote: 'return std::move(done_callback).Run(base::unexpected(error.value()));' },
  { id: 'LC03', condition: 'no submit button found and require_submit_button is true', outcome: 'kMissingRequiredSubmitButton is returned before the running state is set', startLine: 249, endLine: 258, quote: 'ScriptToolErrorCode::kMissingRequiredSubmitButton,' },
  { id: 'LC04', condition: 'require_submit_button is true (no toolautosubmit)', outcome: 'submit button is focused and PauseExecution is called; the tool stays running and is not completed', startLine: 212, endLine: 218, quote: 'context->PauseExecution();' },
  { id: 'LC05', condition: 'toolautosubmit attribute present', outcome: 'PrepareForSubmission runs immediately with the submit button', startLine: 218, endLine: 221, quote: 'form_->PrepareForSubmission(/*event*/ nullptr, submit_button);' },
  { id: 'LC06', condition: 'CancelTool is called while the tool is running', outcome: 'the done callback receives kToolCancelled', startLine: 224, endLine: 229, quote: 'ScriptToolErrorCode::kToolCancelled,' },
  { id: 'LC07', condition: 'CallDoneCallback is called with no callback held', outcome: 'it returns without clearing running, button or invocation state; with a callback held the state is cleared', startLine: 261, endLine: 275, quote: 'if (done_callback_.is_null()) {' },
  { id: 'LC08', condition: 'tool response arrives after the tool stopped running', outcome: 'HandleWebMcpToolResponse returns without invoking the callback', startLine: 290, endLine: 298, quote: 'if (!tool->CurrentlyRunning()) {' },
  { id: 'LC09', condition: 'resolved value is an object that fails JSON stringify', outcome: 'the done callback receives kToolInvocationFailed', startLine: 298, endLine: 319, quote: '"could not be serialized to JSON")));' },
  { id: 'LC10', condition: 'respondWith promise rejects', outcome: 'the done callback receives kToolInvocationFailed', startLine: 320, endLine: 327, quote: '"respondWith promise was rejected")));' },
  { id: 'LC11', condition: 'preventDefault called on submit without respondWith', outcome: 'the done callback receives kToolInvocationFailed with a programming-error message', sourceId: 'S100', startLine: 787, endLine: 815, quote: 'The site has a programming error: it called' },
  { id: 'LC12', condition: 'should_submit branch with the executing tool still running after ScheduleFormSubmission returns', outcome: 'the done callback resolves ok with a null String sentinel, not JSON null; no navigation proof', startLine: 818, endLine: 830, quote: 'executing_tool->CallDoneCallback(base::ok(String()));' },
]);

class RunnerFault extends Error {
  constructor(token) {
    super(token);
    this.token = token;
  }
}

function fault(token) {
  throw new RunnerFault(token);
}

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const uniqueSorted = list => [...new Set(list)].sort();
const sameList = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);
const byId = (state, id) => state.decisions.find(decision => decision.id === id);

function isEntryScript() {
  try {
    return process.argv[1] !== undefined && realpathSync(process.argv[1]) === realpathSync(selfPath);
  } catch {
    return false;
  }
}

function parseArguments(args) {
  const options = { measure: defaultMeasure, expected: defaultExpected };
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!['--measure', '--expected'].includes(flag) || value === undefined || value.startsWith('--')) fault('bad_arguments');
    options[flag.slice(2)] = resolve(value);
  }
  return options;
}

// The counter must export evaluate(files) and FINDING_IDS; importing it runs nothing.
async function loadMeasure(file) {
  let measure;
  try {
    measure = await import(pathToFileURL(file).href);
  } catch {
    fault('measure_unloadable');
  }
  if (typeof measure.evaluate !== 'function') fault('measure_without_evaluate');
  if (!Array.isArray(measure.FINDING_IDS) && !(measure.FINDING_IDS instanceof Set)) fault('measure_without_finding_ids');
  return { evaluate: measure.evaluate, registered: new Set(measure.FINDING_IDS) };
}

function loadBlob() {
  try {
    return readFileSync(resolve(repoRoot, PIN.sourcePath));
  } catch {
    fault('blob_unreadable');
  }
}

// Persisted expected pairs. Every reason must be registered by the counter and
// exercised by at least one case; the case set must equal CASES exactly.
function loadExpected(file, registered) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    fault('expected_unreadable');
  }
  if (doc === null || typeof doc !== 'object' || doc.schema !== EXPECTED_SCHEMA || doc.metric !== PIN.metric) fault('expected_schema');
  const source = doc.source ?? {};
  if (source.id !== PIN.sourceId || source.path !== PIN.sourcePath || source.url !== PIN.sourceUrl || source.sha256 !== PIN.sourceSha256) {
    fault('expected_source_pin');
  }
  if (!Array.isArray(doc.reasons) || doc.reasons.some(reason => typeof reason !== 'string')) fault('expected_reasons');
  const vocabulary = uniqueSorted(doc.reasons);
  if (!sameList(vocabulary, doc.reasons)) fault('expected_reasons_order');
  if (vocabulary.some(reason => !registered.has(reason))) fault('expected_reason_unregistered');
  if (!Array.isArray(doc.cases)) fault('expected_cases');
  const byName = new Map();
  for (const entry of doc.cases) {
    if (entry === null || typeof entry !== 'object' || typeof entry.name !== 'string' || byName.has(entry.name)) fault('expected_case_name');
    if (!Number.isInteger(entry.count) || entry.count < 0) fault('expected_count');
    if (entry.exit !== 0 && entry.exit !== 1) fault('expected_exit');
    if (!Array.isArray(entry.findings) || entry.findings.some(finding => typeof finding !== 'string')) fault('expected_findings');
    const findings = uniqueSorted(entry.findings);
    if (!sameList(findings, entry.findings)) fault('expected_findings_order');
    if (findings.some(finding => !vocabulary.includes(finding))) fault('expected_reason_outside_vocabulary');
    if (entry.exit === 0 && findings.length > 0) fault('expected_exit_zero_with_findings');
    if (entry.exit === 1 && findings.length === 0) fault('expected_exit_one_without_findings');
    byName.set(entry.name, { count: entry.count, exit: entry.exit, findings });
  }
  if (!sameList([...byName.keys()].sort(), CASES.map(caseDef => caseDef.name).sort())) fault('expected_case_set');
  if (!sameList(uniqueSorted([...byName.values()].flatMap(want => want.findings)), vocabulary)) fault('expected_vocabulary_unexercised');
  return { vocabulary, byName };
}

// Pre-flight over the retained blob and the pinned decisions. A failure here
// means the runner's own inputs are wrong: exit 2, never a counter verdict.
function preflight(blob) {
  if (sha256(blob) !== PIN.sourceSha256) fault('blob_digest_mismatch');
  const lines = blob.toString('utf8').split('\n');
  DECISIONS.forEach((decision, index) => {
    if (decision.id !== `LC${String(index + 1).padStart(2, '0')}`) fault('decision_order');
    if (decision.sourceId !== (decision.id === 'LC11' ? PIN.authorityId : undefined)) fault('decision_authority_pin');
    const { startLine, endLine, quote } = decision;
    if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || startLine > endLine || endLine > lines.length) {
      fault('preflight_span');
    }
    const words = quote.split(/\s+/).filter(Boolean).length;
    if (words < 1 || words > 25) fault('preflight_quote_words');
    if (!lines.slice(startLine - 1, endLine).join('\n').includes(quote)) fault('preflight_quote_literal');
  });
}

// Exact literal substring of span lines 298-319 that spans 26 whitespace words,
// line breaks included, so the only defect in that fixture is the word count.
function quoteOfTwentySixWords(blob) {
  const span = blob.toString('utf8').split('\n').slice(297, 319).join('\n');
  const tokens = [...span.matchAll(/\S+/g)];
  if (tokens.length < 26) fault('preflight_words_26');
  return span.slice(tokens[0].index, tokens[25].index + tokens[25][0].length);
}

function renderManifest(state) {
  const doc = { schema: state.schema, source: state.source, scope: state.scope, decisions: state.decisions };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

// Table rows render the effective source: a per-row override, else the decision's
// own sourceId, else the manifest source id (the counter's rendering rule).
function renderNote(state) {
  const rows = state.decisions
    .filter(decision => !state.omitRows.includes(decision.id))
    .map(decision => {
      const source = state.rowSourceOverride[decision.id] ?? decision.sourceId ?? state.source.id;
      return `| ${decision.id} | ${decision.condition} | ${decision.outcome} | ${source}:${decision.startLine}-${decision.endLine} |`;
    });
  return [
    PIN.heading,
    '',
    `Sources: ${PIN.sourceId} (Chromium 154.0.8037.97 html_form_element.cc, source-only); ${PIN.authorityId} (same bytes, LC11 authority row).`,
    '',
    `Scope: ${state.scope}`,
    '',
    '| ID | condition | outcome | source |',
    '|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
}

function sourceRowCells(state) {
  return [
    PIN.sourceId,
    `Chromium 154 form callback navigation sentinel \u2014 ${PIN.sourceUrl}`,
    'code',
    'A',
    'Build-scoped post-fill autosubmit, validation callbacks and navigation sentinel; source-level only',
    state.sourceAnchor,
    'supersedes S078 \u2014 autosubmit attempts submission after fill; navigation paths return a null String sentinel, not an ordinary empty successful CDP payload or proof that navigation completed',
    'mined',
    '2026-10-21',
    'on-release',
    state.usedBy.join(', '),
  ];
}

function authorityRowCells(authority) {
  return [
    PIN.authorityId,
    `Chromium 154 html_form_element.cc LC11 authority \u2014 ${authority.url}`,
    'code',
    'A',
    'Source-only authority for the preventDefault without respondWith branch at lines 787-815; same bytes as S096',
    authority.anchor,
    authority.teaches,
    authority.status,
    '2026-10-21',
    'on-release',
    authority.usedBy.join(', '),
  ];
}

function renderRegistry(state) {
  const rows = [sourceRowCells(state)];
  if (state.authority !== null) rows.push(authorityRowCells(state.authority));
  return [
    '## Registry',
    '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map(cells => `| ${cells.join(' | ')} |`),
    '',
  ].join('\n');
}

const SOURCE_ANCHOR = `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,729-758,818-842; decoded sha256 ${PIN.sourceSha256}`;
const AUTHORITY_ANCHOR = `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:787-815; decoded sha256 ${PIN.sourceSha256}`;

function baseAuthority() {
  return {
    url: PIN.sourceUrl,
    anchor: AUTHORITY_ANCHOR,
    status: 'mined',
    teaches: `${PIN.authorityTeaches}LC11 preventDefault without respondWith programming error; source-only`,
    usedBy: [PIN.notePath],
  };
}

function baseState(blob) {
  return {
    absent: false,
    omitManifest: false,
    omitNote: false,
    omitSource: false,
    blob,
    manifestText: null,
    schema: PIN.schema,
    scope: PIN.scope,
    source: { id: PIN.sourceId, path: PIN.sourcePath, url: PIN.sourceUrl, sha256: PIN.sourceSha256 },
    decisions: DECISIONS.map(decision => ({ ...decision })),
    omitRows: [],
    rowSourceOverride: {},
    usedBy: [PIN.priorNote, PIN.notePath],
    sourceAnchor: SOURCE_ANCHOR,
    authority: baseAuthority(),
  };
}

function buildFiles(state) {
  const files = new Map();
  if (state.absent) return files;
  if (!state.omitManifest) files.set(PIN.manifestPath, state.manifestText ?? renderManifest(state));
  if (!state.omitNote) files.set(PIN.notePath, renderNote(state));
  files.set(PIN.registryPath, renderRegistry(state));
  if (!state.omitSource) files.set(PIN.sourcePath, state.blob);
  return files;
}

// Each case mutates a fresh baseline state; the valid baseline is the positive
// control that every negative case differs from by exactly one mutation.
const CASES = Object.freeze([
  { name: 'valid_all12', mutate: () => {} },
  { name: 'baseline_absent0', mutate: state => { state.absent = true; } },
  { name: 'partial_manifest_without_note', mutate: state => { state.omitNote = true; } },
  { name: 'partial_note_without_manifest', mutate: state => { state.omitManifest = true; } },
  { name: 'manifest_malformed_json', mutate: state => { state.manifestText = renderManifest(state).slice(0, 96); state.omitRows = DECISIONS.map(decision => decision.id); } },
  { name: 'wrong_manifest_schema', mutate: state => { state.schema = 'tabi-webmcp-lifecycle-decisions-v0'; } },
  { name: 'source_digest_edit', mutate: state => { state.blob = Buffer.concat([state.blob, Buffer.from('\n')]); } },
  { name: 'source_absent', mutate: state => { state.omitSource = true; } },
  { name: 'quote_mismatch', mutate: state => { byId(state, 'LC04').quote = 'context->PauseExecutionNow();'; } },
  { name: 'invalid_quote_empty', mutate: state => { byId(state, 'LC06').quote = ''; } },
  { name: 'invalid_quote_26_words', mutate: state => { byId(state, 'LC09').quote = quoteOfTwentySixWords(state.blob); } },
  { name: 'invalid_span_reversed', mutate: state => { Object.assign(byId(state, 'LC03'), { startLine: 258, endLine: 249 }); } },
  { name: 'wrong_scope', mutate: state => { state.scope = 'source-only Chromium 153.0.7000.0; not runtime-observed'; } },
  { name: 'runtime_wording', mutate: state => { byId(state, 'LC04').outcome = 'submit button is focused and PauseExecution is called (observed at runtime); the tool stays running and is not completed'; } },
  { name: 'duplicate_id', mutate: state => { state.decisions.push({ ...byId(state, 'LC05') }); } },
  { name: 'missing_table_row', mutate: state => { state.omitRows = ['LC07']; } },
  { name: 'missing_manifest_decision', mutate: state => { state.decisions = state.decisions.filter(decision => decision.id !== 'LC12'); } },
  { name: 'wrong_source_url', mutate: state => { state.source.url = PIN.sourceUrl.replace('154.0.8037.97', '154.0.8037.98'); } },
  { name: 'wrong_source_id', mutate: state => { state.source.id = 'S097'; } },
  { name: 'wrong_source_path', mutate: state => { state.source.path = 'corpus/evidence/round-20/sources/html_form_element_copy.cc'; } },
  { name: 'missing_registry_backlink', mutate: state => { state.usedBy = [PIN.priorNote]; } },
  { name: 'wrong_decision_source_override', mutate: state => { byId(state, 'LC11').sourceId = 'S099'; } },
  { name: 'missing_decision_source_override', mutate: state => { delete byId(state, 'LC11').sourceId; } },
  { name: 'override_table_mismatch', mutate: state => { delete byId(state, 'LC11').sourceId; state.rowSourceOverride = { LC11: PIN.authorityId }; } },
  { name: 'forced_s096_lc11', mutate: state => { byId(state, 'LC11').sourceId = PIN.sourceId; } },
  { name: 's100_row_missing', mutate: state => { state.authority = null; } },
  { name: 's100_status_not_mined', mutate: state => { state.authority.status = 'queued'; } },
  { name: 's100_backlink_missing', mutate: state => { state.authority.usedBy = [PIN.priorNote]; } },
  { name: 's100_teaches_not_supersedes', mutate: state => { state.authority.teaches = 'LC11 authority row for the same bytes'; } },
  { name: 's100_url_mismatch', mutate: state => { state.authority.url = PIN.sourceUrl.replace('154.0.8037.97', '154.0.8037.98'); } },
  { name: 's100_digest_mismatch', mutate: state => { state.authority.anchor = AUTHORITY_ANCHOR.replace(PIN.sourceSha256, '0'.repeat(64)); } },
  { name: 'wrong_anchor_s100', mutate: state => { state.authority.anchor = `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328; decoded sha256 ${PIN.sourceSha256}`; } },
  { name: 'wrong_anchor_s096', mutate: state => { state.sourceAnchor = `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,729-758; decoded sha256 ${PIN.sourceSha256}`; } },
  { name: 'malformed_anchor_s100', mutate: state => { state.authority.anchor = `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:787-; decoded sha256 ${PIN.sourceSha256}`; } },
]);

// Null when the result matches the persisted pair; otherwise the first mismatch.
function compare(result, want, registered) {
  if (result === null || typeof result !== 'object') return 'result_not_object';
  if (!Number.isInteger(result.c1_lifecycle_decisions)) return 'count_not_integer';
  if (result.exit !== 0 && result.exit !== 1) return `exit_not_0_or_1=${String(result.exit)}`;
  if (!Array.isArray(result.findings) || result.findings.some(finding => typeof finding !== 'string')) return 'findings_not_strings';
  if (!sameList(result.findings, uniqueSorted(result.findings))) return 'findings_not_sorted_unique';
  const unregistered = result.findings.find(finding => !registered.has(finding));
  if (unregistered !== undefined) return `finding_unregistered=${unregistered}`;
  if (result.c1_lifecycle_decisions !== want.count) return `count=${result.c1_lifecycle_decisions} want=${want.count}`;
  if (result.exit !== want.exit) return `exit=${result.exit} want=${want.exit}`;
  if (!sameList(result.findings, want.findings)) return `findings=[${result.findings.join(',')}] want=[${want.findings.join(',')}]`;
  return null;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const { evaluate, registered } = await loadMeasure(options.measure);
  const expected = loadExpected(options.expected, registered);
  const blob = loadBlob();
  preflight(blob);
  const failures = [];
  for (const caseDef of CASES) {
    const want = expected.byName.get(caseDef.name);
    let files;
    try {
      const state = baseState(Buffer.from(blob));
      caseDef.mutate(state);
      files = buildFiles(state);
    } catch {
      fault(`fixture_build_${caseDef.name}`);
    }
    let detail;
    try {
      detail = compare(evaluate(files), want, registered);
    } catch (error) {
      detail = `threw ${String(error && error.message).slice(0, 160)}`;
    }
    if (detail !== null) failures.push({ name: caseDef.name, detail });
  }
  for (const failure of failures) console.error(`FAIL_DETAIL case=${failure.name} ${failure.detail}`);
  const verdict = failures.length === 0 ? 'clean' : 'failed';
  console.log(`MEASURE_C1_SELFTEST verdict=${verdict} cases=${CASES.length} reasons=${expected.vocabulary.length}`);
  process.exitCode = verdict === 'clean' ? 0 : 1;
}

if (isEntryScript()) {
  try {
    await main();
  } catch (error) {
    if (!(error instanceof RunnerFault)) console.error(error);
    const token = error instanceof RunnerFault ? error.token : 'runner_error';
    console.log(`MEASURE_C1_SELFTEST verdict=could_not_evaluate detail=${token}`);
    process.exitCode = 2;
  }
}
