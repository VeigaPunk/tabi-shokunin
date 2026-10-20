#!/usr/bin/env node
// tabi round-17 C2 counter (claim: coverage/`webmcp-cdp-invocation`; PLAN.md §C2).
//
// Usage (cwd-independent; ROOT is derived from this file's location):
//   node .ufo/waves/round-17/measure-c2.mjs <REV>
//
// Every evaluated input byte is read from the named git revision with
// `git cat-file` (never from the worktree), under a minimal Git env and with no
// shell. Stdout is exactly one JSON line. Exit 0 = counted (count may be 0 with
// `failures` naming why); exit 2 = could not evaluate.
//
// C2 counts 1 only if, at REV:
//   1. corpus/knowledge/webmcp-invocation-round-17.md exists as a regular
//      blob; its header block (lines before the first Markdown heading) has at
//      least one `source: S###` line; every cited row in corpus/SOURCES.md has
//      13 pipe-split fields, tier A or B, status mined, and the note path in
//      used-by; at least one cited row must be NEW since the round baseline
//      (its id is absent from corpus/SOURCES.md at 5859243), opened on/after
//      2026-10-20, and not kind `own-work` — all four frontier attributes on
//      that same row (the capability rests on rows opened this round, S041+;
//      S030-S037 are also dated 2026-10-20, so the date alone cannot isolate
//      them);
//   2. corpus/README.md mentions the note path;
//   3. corpus/evidence/round-17/webmcp-invoke/receipt.json parses, verdict
//      pass, caseSetOk true, summary.failed 0, all 11 counter-owned required
//      case ids (PLAN §C2 list) present with status pass, producerSha256 equals
//      the sha256 of the scripts/webmcp-invoke-round17.mjs blob at REV, every
//      required case names a committed fixture whose blob digest matches its
//      declared fixtureSha256, and the imperative-success, declarative-form and
//      iframe-frameid cases must name different fixtures (different files and
//      different bytes) so one trivial fixture cannot back every case; the
//      imperative-success case must contain a raw `WebMCP.toolResponded` event
//      with params.status Completed while the flags-off control contains none
//      AND records a raw CDP error response (`{id,error:{code,message}}` or the
//      same code/message/id fields flat) — a control that records nothing
//      proves nothing; CDP shapes only, no harness-private key paths;
//      every runs[] entry has a positive integer pid, a non-empty string argv
//      array (`argv`, or the r16 name `effectiveArgv`) and gone === true, and
//      the receipt carries the PLAN-mandated runtime identity and loopback
//      counters (`runtime.observed.chromium.realExecutableSha256` 64-hex,
//      `loopback.externalRequestCount` 0).
//
// Counter-owned negative probes (QUALITY 25): a deterministic in-memory
// synthetic input set must evaluate 1, and seven tampered copies of it —
// producer sha flipped, one required case removed, cited row status queued,
// cited row present at the round baseline, flags-off control showing a
// Completed response, imperative-success without one, flags-off control
// recording no CDP error response — must each evaluate 0.
// The probe results are printed in every run. If the synthetic base itself does
// not evaluate 1 the counter cannot distinguish a
// held claim from a broken claim, so the run exits 2.
//
// Limits: the counter checks the receipt's shape, internal consistency and
// producer provenance. It does not re-run the browser, so a receipt could
// still assert invocation events that never happened; the finite probes catch
// counter regressions, not a determined forger (recorded in the round-17 note's
// limits and the C2 lesson).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '..', '..', '..');
const NOTE = 'corpus/knowledge/webmcp-invocation-round-17.md';
const NOTE_PATH_TOKEN = 'knowledge/webmcp-invocation-round-17.md';
const README = 'corpus/README.md';
const SOURCES = 'corpus/SOURCES.md';
const RECEIPT = 'corpus/evidence/round-17/webmcp-invoke/receipt.json';
const HARNESS = 'scripts/webmcp-invoke-round17.mjs';
const COUNTER = '.ufo/waves/round-17/measure-c2.mjs';
const FIXTURES = 'corpus/evidence/round-17/webmcp-invoke/fixtures/';
// The round baseline (PLAN.md): "new this round" means the S id is absent here.
const BASELINE = '5859243183c4d7ac5429dfdb8a73ce0d9a43d583';
const HEX64 = /^[0-9a-f]{64}$/;
// Frontier requirement: at least one cited row opened on/after the round date.
const ROUND_OPENED = '2026-10-20';
// Counter-owned copy of the PLAN §C2 required case list.
const REQUIRED_CASES = [
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
// Structurally different pages: one trivial fixture must not back all of them
// (r16 AttackC2Forge, measure.mjs:290-294; a counter-owned case→fixture map is
// impossible until C2Harness names its fixtures, so enforce distinctness now).
const DISTINCT_FIXTURE_CASES = ['invoke-imperative-success', 'invoke-declarative-form', 'invoke-iframe-frameid'];

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
  const spec = `${rev}:${path}`;
  const type = git(['cat-file', '-t', spec]);
  if (type.status !== 0) {
    const err = String(type.stderr ?? '');
    // Absent path is a measurement fact, not a tool failure. Anything else
    // (bad object, unreadable repo) must not be silently scored as absence.
    // "exists on disk, but not in '<rev>'" is the worktree-only case: absent
    // at REV by definition, and the message itself shows the read is not the
    // worktree.
    if (/does not exist|exists on disk, but not in|Not a valid object name|invalid object name|bad revision/i.test(err)) return null;
    throw new CannotEvaluate(`cat-file -t ${path}: ${err.trim().split('\n')[0]}`);
  }
  if (type.stdout.trim() !== 'blob') return null;
  const content = git(['cat-file', 'blob', spec], true);
  if (content.status !== 0) throw new CannotEvaluate(`cat-file blob ${path} failed`);
  return content.stdout;
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const text = (bytes) => (bytes === null ? null : bytes.toString('utf8'));

// Header block = lines before the first Markdown heading; PLAN §C2 says the
// note *header* carries the source rows, so prose citations elsewhere do not
// count. One or more ids per `source:` line are accepted (r16 style is one).
function headerSources(noteText) {
  const ids = [];
  for (const line of noteText.split('\n')) {
    if (/^#{1,6}\s/.test(line)) break;
    const m = /^source:\s*(.*)$/.exec(line);
    if (!m) continue;
    for (const hit of m[1].matchAll(/\bS\d{3,}\b/g)) ids.push(hit[0]);
  }
  return [...new Set(ids)];
}

// Reuses the round-16 registry parser conventions: Registry section only,
// a row is a line whose first cell is S###, exactly 13 pipe-split fields =
// 11 cells, and the cells are id|source|kind|tier|scope|anchor|teaches|
// status|opened|recheck|used-by.
function sourceRows(sourcesText) {
  const rows = new Map();
  let inRegistry = false;
  for (const line of sourcesText.split('\n')) {
    if (line.startsWith('## ')) inRegistry = line.trim() === '## Registry';
    if (!inRegistry || !/^\| S\d{3,} \|/.test(line)) continue;
    const cells = line.split('|');
    if (cells.length !== 13) { rows.set(cells[1].trim(), { malformed: true }); continue; }
    const c = cells.slice(1, 12).map((s) => s.trim());
    rows.set(c[0], {
      kind: c[2],
      tier: c[3],
      status: c[7],
      opened: c[8],
      usedBy: c[10].split(/[,;]\s*/).map((s) => s.trim().replace(/`/g, '')).filter(Boolean),
    });
  }
  return rows;
}

// CDP events are `{method, params}`; r16's receipt recorded the same shape under
// `{event, params}`. Accept either and walk the whole case subtree, so the check
// depends only on protocol field names, not a harness-private storage path.
function cdpEvents(node, out = []) {
  if (node === null || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const value of node) cdpEvents(value, out);
    return out;
  }
  const name = typeof node.method === 'string' ? node.method : (typeof node.event === 'string' ? node.event : null);
  if (name !== null && node.params !== null && typeof node.params === 'object' && !Array.isArray(node.params)) {
    out.push({ name, params: node.params });
  }
  for (const value of Object.values(node)) cdpEvents(value, out);
  return out;
}

// Raw CDP error responses are `{id, error:{code, message}}`; r16-style flat
// records carry the same fields without the envelope. Accept either and walk the
// case subtree, so a control that records nothing cannot pass as substantive.
function cdpErrors(node, out = []) {
  if (node === null || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const value of node) cdpErrors(value, out);
    return out;
  }
  const error = node.error;
  if (error !== null && typeof error === 'object' && Number.isInteger(error.code) && typeof error.message === 'string') {
    out.push({ code: error.code, message: error.message });
  } else if (Number.isInteger(node.code) && typeof node.message === 'string' && Object.hasOwn(node, 'id')) {
    out.push({ code: node.code, message: node.message });
  }
  for (const value of Object.values(node)) cdpErrors(value, out);
  return out;
}

// Pure predicate over already-read bytes, so the tamper probes exercise the
// same code the real measurement does. Null means the blob is absent at REV;
// `baselineIds` is the SOURCES registry id set at the round baseline (never
// null: the caller refuses to evaluate without it); `readFixture(name)` maps a
// declared fixture basename to the sha256 of its committed blob (or null).
function evaluate({ noteText, sourcesText, readmeText, receiptText, harnessSha, baselineIds, readFixture }) {
  const failures = [];
  const cited = [];
  let runCount = 0;
  let fixtureBound = 0;
  const caseIds = [];

  if (noteText === null) failures.push(`note ${NOTE} absent at revision`);
  else {
    cited.push(...headerSources(noteText));
    if (cited.length === 0) failures.push('note header cites no source: S### line');
    if (sourcesText === null) failures.push(`${SOURCES} absent at revision`);
    else {
      const rows = sourceRows(sourcesText);
      let frontier = 0;
      for (const id of cited) {
        const row = rows.get(id);
        if (!row || row.malformed) { failures.push(`${id} row missing or not 13 pipe fields`); continue; }
        if (row.tier !== 'A' && row.tier !== 'B') failures.push(`${id} tier ${row.tier}`);
        if (row.status !== 'mined') failures.push(`${id} status ${row.status}`);
        if (!row.usedBy.includes(NOTE)) failures.push(`${id} used-by lacks ${NOTE}`);
        // All frontier attributes must hold on the same row: new since the
        // baseline (S041+), opened this round, externally sourced, and mined.
        const newSinceBaseline = !baselineIds.has(id);
        const openedThisRound = /^\d{4}-\d{2}-\d{2}$/.test(row.opened) && row.opened >= ROUND_OPENED;
        const external = row.kind !== 'own-work';
        const rowHygiene = (row.tier === 'A' || row.tier === 'B') && row.status === 'mined' && row.usedBy.includes(NOTE);
        if (newSinceBaseline && openedThisRound && external && rowHygiene) frontier += 1;
      }
      if (frontier === 0) {
        failures.push(`no cited row is new since ${BASELINE} and opened >= ${ROUND_OPENED}, tier A/B, mined, used-by note, not own-work`);
      }
    }
  }

  if (readmeText === null) failures.push(`${README} absent at revision`);
  else if (!readmeText.includes(NOTE_PATH_TOKEN)) failures.push('README does not mention the note path');

  if (receiptText === null) failures.push(`receipt ${RECEIPT} absent at revision`);
  else {
    let receipt = null;
    try { receipt = JSON.parse(receiptText); } catch { failures.push('receipt unparsable'); }
    if (receipt !== null) {
      if (receipt.verdict !== 'pass') failures.push(`receipt verdict ${receipt.verdict}`);
      const caseSetOk = receipt.summary?.caseSet?.caseSetOk ?? receipt.summary?.caseSetOk;
      if (caseSetOk !== true) failures.push('caseSetOk is not true');
      if (typeof receipt.summary?.failed === 'number' && receipt.summary.failed !== 0) {
        failures.push(`summary.failed ${receipt.summary.failed}`);
      }
      if (harnessSha === null) failures.push(`harness ${HARNESS} absent at revision`);
      else if (receipt.producerSha256 !== harnessSha) failures.push('producerSha256 != harness blob at revision');
      // PLAN §C2 receipt mirror: the receipt must carry the observed runtime
      // identity and the loopback egress counter, not just a verdict.
      if (!HEX64.test(String(receipt.runtime?.observed?.chromium?.realExecutableSha256 ?? ''))) {
        failures.push('runtime.observed.chromium.realExecutableSha256 missing or not 64-hex');
      }
      if (receipt.loopback?.externalRequestCount !== 0) {
        failures.push(`loopback.externalRequestCount is not 0 (${JSON.stringify(receipt.loopback?.externalRequestCount)})`);
      }

      const cases = Array.isArray(receipt.cases) ? receipt.cases : null;
      if (cases === null) failures.push('receipt cases is not an array');
      else {
        for (const c of cases) caseIds.push(c?.id ?? null);
        for (const required of REQUIRED_CASES) {
          const found = cases.find((c) => c?.id === required);
          if (!found) { failures.push(`required case ${required} missing`); continue; }
          if (found.status !== 'pass') failures.push(`required case ${required} status ${found.status}`);
          // r16 case→fixture binding, made name-free: each required case must
          // name a committed fixture and its digest must be that blob's. The
          // digest cannot bind a case to a fixture the lane never committed.
          const file = found.fixtureFile;
          const declared = found.fixtureSha256;
          if (typeof file !== 'string' || !/^[A-Za-z0-9._-]+$/.test(file)) {
            failures.push(`required case ${required} declares no safe fixtureFile`);
          } else if (!HEX64.test(String(declared ?? ''))) {
            failures.push(`required case ${required} declares no 64-hex fixtureSha256`);
          } else {
            const actual = readFixture(file);
            if (actual === null) failures.push(`required case ${required} fixture ${file} absent at revision`);
            else if (actual !== declared) failures.push(`required case ${required} fixture digest mismatch for ${file}`);
            else fixtureBound += 1;
          }
        }
        // One trivial fixture must not back the three structurally different
        // cases; a name-free stand-in for r16's counter-owned CASE_FIXTURES
        // until C2Harness's fixture names are fixed.
        const distinct = DISTINCT_FIXTURE_CASES.map((id) => cases.find((c) => c?.id === id));
        if (distinct.every((c) => c && typeof c.fixtureFile === 'string' && HEX64.test(String(c.fixtureSha256 ?? '')))) {
          if (new Set(distinct.map((c) => c.fixtureFile)).size !== distinct.length) {
            failures.push(`required cases ${DISTINCT_FIXTURE_CASES.join(', ')} share a fixtureFile`);
          }
          if (new Set(distinct.map((c) => c.fixtureSha256)).size !== distinct.length) {
            failures.push(`required cases ${DISTINCT_FIXTURE_CASES.join(', ')} share fixture bytes`);
          }
        }
        // Control substance (r16 measure.mjs:308-311): the passing invocation
        // must show a Completed response and the flags-off control must not.
        const completedResponses = (caseObj) => cdpEvents(caseObj)
          .filter((e) => e.name === 'WebMCP.toolResponded' && e.params.status === 'Completed').length;
        const positive = cases.find((c) => c?.id === 'invoke-imperative-success');
        const control = cases.find((c) => c?.id === 'invoke-flags-off-control');
        if (positive && completedResponses(positive) === 0) {
          failures.push('invoke-imperative-success has no WebMCP.toolResponded status Completed event');
        }
        if (control && completedResponses(control) > 0) {
          failures.push('invoke-flags-off-control observed a Completed toolResponded event');
        }
        // A control that records nothing proves nothing: the flags-off case
        // must carry the raw CDP error from its invokeTool command.
        if (control && cdpErrors(control).length === 0) {
          failures.push('invoke-flags-off-control records no CDP error response');
        }
      }

      if (!Array.isArray(receipt.runs) || receipt.runs.length === 0) failures.push('runs absent or empty');
      else {
        runCount = receipt.runs.length;
        receipt.runs.forEach((run, i) => {
          const r = run !== null && typeof run === 'object' ? run : {};
          if (!Number.isInteger(r.pid) || r.pid <= 0) failures.push(`run ${i} pid is not a positive integer`);
          const argv = Array.isArray(r.argv) ? r.argv : (Array.isArray(r.effectiveArgv) ? r.effectiveArgv : null);
          if (argv === null || argv.length === 0 || !argv.every((a) => typeof a === 'string')) {
            failures.push(`run ${i} argv is not a non-empty string array`);
          }
          if (r.gone !== true) failures.push(`run ${i} gone is not true`);
        });
      }
    }
  }

  return { held: failures.length === 0 ? 1 : 0, failures, cited, caseIds, runCount, fixtureBound };
}

// --- counter-owned probes ---------------------------------------------------
// Deterministic synthetic inputs (no git, no files). The base must be 1 so
// each tampered copy proves the evaluator actually discriminates.
const PROBE_SHA = 'ab'.repeat(32);
const PROBE_NOTE = [
  'source: S900',
  'verified-at: 2026-10-20 (counter probe base)',
  '',
  '# Synthetic probe note',
].join('\n');
const PROBE_SOURCES = [
  '## Registry',
  '',
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  `| S900 | Probe source | docs | A | probe scope | probe anchor | probe teaches | mined | ${ROUND_OPENED} | on-release | ${NOTE} |`,
].join('\n');
const PROBE_README = `| \`${NOTE_PATH_TOKEN}\` | synthetic probe row |\n`;
// Three structurally different fixtures plus a shared one, so the base also
// satisfies the distinctness rule the real receipt must satisfy.
const PROBE_FIXTURES = new Map([
  ['probe-imperative.html', sha256(Buffer.from('counter probe imperative fixture'))],
  ['probe-declarative.html', sha256(Buffer.from('counter probe declarative fixture'))],
  ['probe-frame.html', sha256(Buffer.from('counter probe frame fixture'))],
  ['probe-common.html', sha256(Buffer.from('counter probe common fixture'))],
]);
const PROBE_CASE_FIXTURE = {
  'invoke-imperative-success': 'probe-imperative.html',
  'invoke-declarative-form': 'probe-declarative.html',
  'invoke-iframe-frameid': 'probe-frame.html',
};
const PROBE_COMPLETED = [{ method: 'WebMCP.toolResponded', params: { status: 'Completed', invocationId: 'probe' } }];
function probeCase(id, extra = {}) {
  const file = PROBE_CASE_FIXTURE[id] ?? 'probe-common.html';
  const base = { id, status: 'pass', fixtureFile: file, fixtureSha256: PROBE_FIXTURES.get(file) };
  if (id === 'invoke-imperative-success') base.eventLog = PROBE_COMPLETED;
  if (id === 'invoke-flags-off-control') {
    base.cdp = [
      { id: 7, method: 'WebMCP.invokeTool', params: { toolName: 'echo', input: {} } },
      { id: 7, error: { code: -32000, message: 'WebMCP domain is not enabled' } },
    ];
  }
  return { ...base, ...extra };
}
const probeCases = (overrides = {}) => REQUIRED_CASES.map((id) => probeCase(id, overrides[id] ?? {}));
const PROBE_REAL_EXE = 'cd'.repeat(32);
const PROBE_RECEIPT = {
  schema: 'tabi-round17-webmcp-invoke-v1',
  verdict: 'pass',
  producerSha256: PROBE_SHA,
  summary: { cases: REQUIRED_CASES.length, passed: REQUIRED_CASES.length, failed: 0, missing: 0, caseSet: { caseSetOk: true } },
  runtime: { observed: { chromium: { realExecutableSha256: PROBE_REAL_EXE } } },
  loopback: { externalRequestCount: 0 },
  cases: probeCases(),
  runs: [{ label: 'flagged', pid: 424242, argv: ['/usr/lib/chromium/chromium', '--headless=new'], gone: true }],
};

function runProbes() {
  const base = {
    noteText: PROBE_NOTE,
    sourcesText: PROBE_SOURCES,
    readmeText: PROBE_README,
    receiptText: JSON.stringify(PROBE_RECEIPT),
    harnessSha: PROBE_SHA,
    baselineIds: new Set(),
    readFixture: (name) => PROBE_FIXTURES.get(name) ?? null,
  };
  const baseResult = evaluate(base);
  if (baseResult.held !== 1) {
    throw new CannotEvaluate(`synthetic probe base did not evaluate 1: ${baseResult.failures.join(', ')}`);
  }
  const flipped = PROBE_SHA.replace(/^ab/, 'ba');
  const tampered = [
    ['producer_sha_flipped', { ...base, receiptText: JSON.stringify({ ...PROBE_RECEIPT, producerSha256: flipped }) }],
    ['required_case_removed', {
      ...base,
      receiptText: JSON.stringify({ ...PROBE_RECEIPT, cases: PROBE_RECEIPT.cases.filter((c) => c.id !== REQUIRED_CASES[0]) }),
    }],
    ['cited_row_queued', { ...base, sourcesText: PROBE_SOURCES.replace('| mined |', '| queued |') }],
    ['cited_row_preexisting', { ...base, baselineIds: new Set(['S900']) }],
    ['control_shows_completed', {
      ...base,
      receiptText: JSON.stringify({ ...PROBE_RECEIPT, cases: probeCases({ 'invoke-flags-off-control': { eventLog: PROBE_COMPLETED } }) }),
    }],
    ['positive_not_completed', {
      ...base,
      receiptText: JSON.stringify({
        ...PROBE_RECEIPT,
        cases: probeCases({ 'invoke-imperative-success': { eventLog: [{ method: 'WebMCP.toolResponded', params: { status: 'Error' } }] } }),
      }),
    }],
    ['control_records_nothing', {
      ...base,
      receiptText: JSON.stringify({ ...PROBE_RECEIPT, cases: probeCases({ 'invoke-flags-off-control': { cdp: [] } }) }),
    }],
  ];
  const probes = tampered.map(([name, inputs]) => {
    const result = evaluate(inputs);
    return { probe: name, held: result.held, failures: result.failures };
  });
  return { probes, probesOk: probes.every((p) => p.held === 0) };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    process.stderr.write('usage: measure-c2.mjs <REV>\n');
    return 2;
  }
  const [revArg] = args;
  if (revArg.startsWith('-')) throw new CannotEvaluate('revision token');
  const resolved = git(['rev-parse', '--verify', '--end-of-options', `${revArg}^{commit}`]);
  if (resolved.status !== 0) throw new CannotEvaluate(`unresolved revision ${revArg}`);
  const revision = resolved.stdout.trim();

  const probeReport = runProbes();

  // "New this round" is derived from the round baseline, never from a date:
  // round 16 shares 2026-10-20 with this round, so S030-S037 would otherwise
  // pass as frontier rows. A missing baseline is not evaluable.
  const baselineSources = blob(BASELINE, SOURCES);
  if (baselineSources === null) throw new CannotEvaluate(`baseline ${SOURCES} absent at ${BASELINE}`);
  const baselineIds = new Set(sourceRows(text(baselineSources)).keys());

  const note = blob(revision, NOTE);
  const sources = blob(revision, SOURCES);
  const readme = blob(revision, README);
  const receipt = blob(revision, RECEIPT);
  const harness = blob(revision, HARNESS);
  const fixtureDigests = new Map();
  const readFixture = (name) => {
    if (!fixtureDigests.has(name)) {
      const bytes = blob(revision, FIXTURES + name);
      fixtureDigests.set(name, bytes === null ? null : sha256(bytes));
    }
    return fixtureDigests.get(name);
  };

  const result = evaluate({
    noteText: text(note),
    sourcesText: text(sources),
    readmeText: text(readme),
    receiptText: text(receipt),
    harnessSha: harness === null ? null : sha256(harness),
    baselineIds,
    readFixture,
  });

  const failures = [...result.failures];
  for (const p of probeReport.probes) {
    if (p.held !== 0) failures.push(`probe ${p.probe} did not evaluate 0`);
  }

  const counterSelfSha256 = sha256(readFileSync(SCRIPT));
  const counterBlob = blob(revision, COUNTER);
  const held = failures.length === 0 ? 1 : 0;
  console.log(JSON.stringify({
    revision,
    c2_invocation_held: held,
    failures,
    cited: result.cited,
    caseIds: result.caseIds,
    requiredCases: REQUIRED_CASES,
    runCount: result.runCount,
    baseline: BASELINE,
    baselineSourceIds: baselineIds.size,
    fixtureBoundCases: result.fixtureBound,
    probes: probeReport.probes,
    probesOk: probeReport.probesOk,
    hashes: {
      note: note === null ? null : sha256(note),
      sources: sources === null ? null : sha256(sources),
      readme: readme === null ? null : sha256(readme),
      receipt: receipt === null ? null : sha256(receipt),
      harness: harness === null ? null : sha256(harness),
      counterAtRevision: counterBlob === null ? null : sha256(counterBlob),
      counterSelf: counterSelfSha256,
    },
    inputsRead: [...inputsRead].sort(),
  }));
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`MEASURE_C2 verdict=could_not_evaluate detail=${String(error.message).replace(/\s+/g, ' ')}\n`);
  process.exitCode = 2;
}
