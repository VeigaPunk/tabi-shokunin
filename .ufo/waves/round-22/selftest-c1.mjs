#!/usr/bin/env node
// Full CLI cases in isolated Git repositories; expected.json is independent of the oracle.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HOME = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HOME, '../../..');
const ROUND21 = join(ROOT, '.ufo/waves/round-21');
const FIXTURE = join(ROUND21, 'fixtures/positive-ordered.json');
const CARRIER = join(ROUND21, 'fixtures/source-carrier.gz');
const NOTE = 'corpus/knowledge/webmcp-lifecycle-oracle-round-22.md';
const EXPECTATIONS = 'corpus/evidence/round-22/semantic-expectations.json';
const RECEIPT = 'corpus/evidence/round-21/runtime/receipt.json';
const RUNTIME_PREFIX = 'corpus/evidence/round-21/runtime/';
const EXECUTION = '.ufo/waves/round-21/runtime-execution-finalized.json';
const PRODUCER = 'scripts/webmcp-lifecycle-round21.mjs';
const MEASURE = '.ufo/waves/round-22/measure-c1.mjs';
const LEGACY_MEASURE = '.ufo/waves/round-21/measure-c1.mjs';
const HASH = (value) => createHash('sha256').update(value).digest('hex');
const encode = (value) => JSON.stringify(value, null, 2) + '\n';
const text = (value) => Buffer.isBuffer(value) ? value.toString('utf8') : Buffer.from(value).toString('utf8');
const EXPECTED = JSON.parse(readFileSync(join(HOME, 'fixtures/expected.json'), 'utf8'));
const CLEAN_ENV = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  LANG: 'C',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_AUTHOR_NAME: 'tabi-fixture',
  GIT_AUTHOR_EMAIL: 'fixture@invalid.local',
  GIT_COMMITTER_NAME: 'tabi-fixture',
  GIT_COMMITTER_EMAIL: 'fixture@invalid.local',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_TERMINAL_PROMPT: '0',
};

function readJson(files, path) {
  return JSON.parse(text(files[path]));
}

function loadBase() {
  const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  const files = Object.fromEntries(Object.entries(fixture.files).map(([path, bytes]) => [path, bytes]));
  files['.ufo/waves/round-21/sources/html_form_element.cc.base64.gz'] = readFileSync(CARRIER);
  files[NOTE] = readFileSync(join(ROOT, NOTE), 'utf8');
  files[EXPECTATIONS] = readFileSync(join(ROOT, EXPECTATIONS), 'utf8');
  // Deliberately read the integrated oracle only when the selftest is executed.
  files[MEASURE] = readFileSync(join(HOME, 'measure-c1.mjs'), 'utf8');
  // The inherited fixture is intentionally all-silent: use it only for the
  // legacy source context, never as the new semantic-positive population.
  const cases = JSON.parse(files[EXPECTATIONS]).cases;
  for (const path of [RECEIPT, EXECUTION, PRODUCER,
    ...cases.flatMap(({ id }) => [`${RUNTIME_PREFIX}${id}.json`, `${RUNTIME_PREFIX}${id}.html`])]) {
    files[path] = readFileSync(join(ROOT, path));
  }
  return files;
}

function resealAcquisition(files) {
  const receipt = readJson(files, RECEIPT);
  for (const row of receipt.cases || []) {
    if (row?.evidence?.path && files[row.evidence.path] !== undefined) {
      row.evidence.sha256 = HASH(files[row.evidence.path]);
    }
  }
  files[RECEIPT] = encode(receipt);

  const execution = readJson(files, EXECUTION);
  const artifactPaths = Object.keys(files).filter((path) => path.startsWith(RUNTIME_PREFIX)).sort();
  execution.artifacts = Object.fromEntries(artifactPaths.map((path) => [path, HASH(files[path])]));
  execution.receiptSha256 = execution.artifacts[RECEIPT] ?? null;
  files[EXECUTION] = encode(execution);
}

function syncFrames(raw) {
  raw.frames.forEach((frame, index) => { frame.seq = index + 1; });
  for (const observation of raw.pageObservations || []) {
    const marker = raw.frames.find((frame) => frame.dir === 'observation' && frame.label === observation.label);
    if (marker) {
      observation.seq = marker.seq;
      observation.at = marker.at;
      observation.value = structuredClone(marker.value);
    }
  }
}

function syncResponses(record, raw) {
  const post = raw.frames.find((frame) => frame.dir === 'observation' && frame.label === 'after-action');
  record.after.responses = raw.frames
    .filter((frame) => frame.dir === 'event' && frame.method === 'WebMCP.toolResponded'
      && frame.params?.invocationId === record.invocationId && (!post || frame.seq < post.seq))
    .map((frame) => structuredClone(frame.params));
}

function changeCase(files, caseId, change) {
  const receipt = readJson(files, RECEIPT);
  const record = receipt.cases.find((row) => row?.id === caseId);
  if (!record?.evidence?.path || files[record.evidence.path] === undefined) {
    throw new Error(`fixture_case_missing:${caseId}`);
  }
  const raw = readJson(files, record.evidence.path);
  change(record, raw, receipt);
  files[record.evidence.path] = encode(raw);
  files[RECEIPT] = encode(receipt);
  resealAcquisition(files);
}

function responseFor(raw, record) {
  return raw.frames.find((frame) => frame.dir === 'event' && frame.method === 'WebMCP.toolResponded'
    && frame.params?.invocationId === record.invocationId);
}

function successfulOutput(files, record) {
  const expected = readJson(files, EXPECTATIONS).cases.find((row) => row.id === record.id);
  const q = expected?.inputQ === '$nonce' ? record.nonce : expected?.inputQ;
  return record.id === 'na-native-submit'
    ? [{ dummy: 'landing' }]
    : { ok: true, nonce: record.nonce, q };
}

function wrongStatus(files, caseId) {
  changeCase(files, caseId, (record, raw) => {
    let frame = responseFor(raw, record);
    if (!frame) {
      const post = raw.frames.find((item) => item.dir === 'observation' && item.label === 'after-action');
      if (!post) throw new Error(`fixture_post_marker_missing:${caseId}`);
      frame = {
        seq: 0,
        at: post.at - 1,
        dir: 'event',
        method: 'WebMCP.toolResponded',
        params: {
          invocationId: record.invocationId,
          status: 'Completed',
          output: successfulOutput(files, record),
        },
      };
      raw.frames.splice(raw.frames.indexOf(post), 0, frame);
      syncFrames(raw);
    } else if (frame.params.status === 'Completed') {
      frame.params.status = 'Error';
      delete frame.params.output;
      frame.params.errorText = 'respondWith promise was rejected';
    } else {
      frame.params.status = 'Completed';
      delete frame.params.errorText;
      frame.params.output = successfulOutput(files, record);
    }
    syncResponses(record, raw);
  });
}

function mutate(files, recipe) {
  if (!recipe) return;
  const { kind, caseId } = recipe;
  switch (kind) {
    case 'baseline':
      delete files[NOTE];
      delete files[EXPECTATIONS];
      return;
    case 'partial-note':
      delete files[NOTE];
      return;
    case 'partial-expectations':
      delete files[EXPECTATIONS];
      return;
    case 'wrong-status':
      wrongStatus(files, caseId);
      return;
    case 'wrong-output-nonce':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        if (!frame?.params?.output || Array.isArray(frame.params.output)) throw new Error('fixture_output_missing');
        frame.params.output.nonce = 'wrong-output-nonce';
        syncResponses(record, raw);
      });
      return;
    case 'wrong-output':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        if (!frame?.params?.output || Array.isArray(frame.params.output)) throw new Error('fixture_output_missing');
        frame.params.output.ok = false;
        syncResponses(record, raw);
      });
      return;
    case 'missing-error-text':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        if (!frame?.params || typeof frame.params.errorText !== 'string') throw new Error('fixture_error_text_missing');
        delete frame.params.errorText;
        syncResponses(record, raw);
      });
      return;
    case 'native-output-object':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        if (!Array.isArray(frame?.params?.output)) throw new Error('fixture_native_array_missing');
        frame.params.output = { ...frame.params.output[0] };
        syncResponses(record, raw);
      });
      return;
    case 'native-submits-empty':
      changeCase(files, caseId, (record, raw) => {
        const observation = raw.pageObservations.find((row) => row.label === 'after-action');
        const marker = raw.frames.find((row) => row.dir === 'observation' && row.label === 'after-action');
        if (!observation || !marker) throw new Error('fixture_post_marker_missing');
        observation.value.submits = [];
        marker.value = structuredClone(observation.value);
        record.after.pageState = structuredClone(observation.value);
        record.after.submits = [];
      });
      return;
    case 'native-landing-errors':
    case 'native-landing-wrong-query':
      changeCase(files, caseId, (record, raw) => {
        const observation = raw.pageObservations.find((row) => row.label === 'after-action');
        const marker = raw.frames.find((row) => row.dir === 'observation' && row.label === 'after-action');
        if (!observation || !marker || typeof observation.value.url !== 'string') throw new Error('fixture_post_marker_missing');
        if (kind === 'native-landing-errors') observation.value.errors = [];
        else observation.value.url = observation.value.url.replace(/\?q=[^&#]*/, '?q=wrong-landing-nonce');
        marker.value = structuredClone(observation.value);
        record.after.pageState = structuredClone(observation.value);
      });
      return;
    case 'delayed-early-response':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        const beforeRelease = raw.frames.find((item) => item.dir === 'observation' && item.label === 'delayed-before-release');
        if (!frame || !beforeRelease) throw new Error('fixture_delayed_markers_missing');
        raw.frames.splice(raw.frames.indexOf(frame), 1);
        frame.at = beforeRelease.at;
        raw.frames.splice(raw.frames.indexOf(beforeRelease), 0, frame);
        syncFrames(raw);
        syncResponses(record, raw);
      });
      return;
    case 'delayed-active-false':
      changeCase(files, caseId, (record, raw) => {
        const observation = raw.pageObservations.find((row) => row.label === 'delayed-before-release');
        const marker = raw.frames.find((row) => row.dir === 'observation' && row.label === 'delayed-before-release');
        if (!observation || !marker) throw new Error('fixture_delayed_marker_missing');
        observation.value.formActive = false;
        for (const submit of observation.value.submits || []) submit.active = false;
        marker.value = structuredClone(observation.value);
        syncFrames(raw);
      });
      return;
    case 'short-pre-window':
      changeCase(files, caseId, (record, raw) => {
        const expectation = readJson(files, EXPECTATIONS).cases.find((row) => row.id === caseId);
        const marker = raw.frames.find((row) => row.dir === 'observation' && row.label === 'pre-action');
        const minimum = expectation?.pre?.minMs;
        if (!marker || !Number.isFinite(minimum) || minimum <= 1) throw new Error('fixture_pre_window_missing');
        const duration = minimum - 1;
        const start = marker.at - duration;
        record.preAction.start = start;
        record.preAction.end = marker.at;
        record.preAction.windowMs = duration;
        const sent = raw.frames.find((row) => row.dir === 'sent' && row.method === 'WebMCP.invokeTool');
        const command = sent?.command;
        for (const frame of raw.frames) {
          if (frame.command === command && command !== undefined
            || frame.dir === 'event' && frame.method === 'WebMCP.toolInvoked'
              && frame.params?.invocationId === record.invocationId) frame.at = start;
        }
      });
      return;
    case 'duplicate-case':
    case 'missing-case': {
      const receipt = readJson(files, RECEIPT);
      if (kind === 'duplicate-case') receipt.cases[receipt.cases.length - 1] = structuredClone(receipt.cases[0]);
      else receipt.cases.pop();
      files[RECEIPT] = encode(receipt);
      resealAcquisition(files);
      return;
    }
    case 'bad-source-header':
      files[NOTE] = text(files[NOTE]).replace(/^source: S101\b/m, 'source: S999');
      return;
    case 'producer-unpinned':
      files[PRODUCER] = text(files[PRODUCER]) + '\n// unpinned selftest mutation\n';
      return;
    case 'expectations-bytes-unpinned':
      // Appending a byte keeps the JSON schema valid, so only the pinned digest
      // guard can reject this revision: the case isolates that guard.
      files[EXPECTATIONS] = text(files[EXPECTATIONS]) + '\n';
      return;
    case 'acquisition-unpinned': {
      const execution = readJson(files, EXECUTION);
      execution.artifacts[RECEIPT] = '0'.repeat(64);
      files[EXECUTION] = encode(execution);
      return;
    }
    case 'raw-unpinned': {
      const receipt = readJson(files, RECEIPT);
      const record = receipt.cases.find((row) => row?.id === caseId);
      if (!record?.evidence?.path) throw new Error(`fixture_case_missing:${caseId}`);
      files[record.evidence.path] = text(files[record.evidence.path]) + '\n';
      return;
    }
    case 'malformed-expectations': {
      const expectations = readJson(files, EXPECTATIONS);
      expectations.cases = {};
      files[EXPECTATIONS] = encode(expectations);
      return;
    }
    case 'receipt-time-array': {
      const receipt = readJson(files, RECEIPT);
      receipt.startedAt = [receipt.startedAt];
      files[RECEIPT] = encode(receipt);
      resealAcquisition(files);
      return;
    }
    case 'malformed-receipt': {
      const receipt = readJson(files, RECEIPT);
      const record = receipt.cases.find((row) => row?.id === caseId);
      if (!record) throw new Error(`fixture_case_missing:${caseId}`);
      record.after = null;
      files[RECEIPT] = encode(receipt);
      resealAcquisition(files);
      return;
    }
    case 'malformed-raw-frames':
      changeCase(files, caseId, (_record, raw) => { raw.frames = {}; });
      return;
    case 'legacy-status-swap':
      changeCase(files, caseId, (record, raw) => {
        const frame = responseFor(raw, record);
        if (!frame?.params || frame.params.status !== 'Canceled') throw new Error('fixture_cancel_response_missing');
        frame.params.status = 'Error';
        syncResponses(record, raw);
      });
      return;
    default:
      throw new Error(`unknown_selftest_mutation:${kind}`);
  }
}

function git(cwd, args) {
  const result = spawnSync('git', ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false', ...args], {
    cwd,
    env: CLEAN_ENV,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`git_failed:${args[0]}:${result.stderr || result.error?.message || 'unknown'}`);
  return result.stdout.trim();
}

function writeTree(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  }
}

function runCli(cwd, path, revision) {
  const result = spawnSync(process.execPath, [join(cwd, path), revision], {
    cwd,
    env: CLEAN_ENV,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 8 * 1024 * 1024,
  });
  let output;
  try { output = JSON.parse(result.stdout); }
  catch { output = null; }
  return { status: result.status, error: result.error?.message ?? null, stdout: result.stdout, stderr: result.stderr, output };
}

function findingIds(output) {
  return Array.isArray(output?.findings) ? output.findings.map((finding) => finding?.id).filter((id) => typeof id === 'string') : [];
}

function checkOracle(expected, run) {
  const output = run.output;
  const ids = findingIds(output);
  const valueMatches = expected.value === null
    ? output?.value === null || output?.value === undefined
    : output?.value === expected.value
      && output?.c1_semantically_checked_lifecycle_rows === expected.value;
  const findingMatches = expected.finding === null ? ids.length === 0 : ids.includes(expected.finding);
  const noStaleBinding = expected.finding === 'evidence_binding' || !ids.includes('evidence_binding');
  const positiveRows = expected.value !== 12 || Array.isArray(output?.rows) && output.rows.length === 12;
  return run.status === expected.exit
    && output?.exit === expected.exit
    && output?.verdict === expected.verdict
    && output?.metric === EXPECTED.metric
    && valueMatches
    && findingMatches
    && noStaleBinding
    && positiveRows;
}

function checkLegacy(expected, run) {
  const output = run.output;
  const ids = findingIds(output);
  return run.status === expected.exit
    && output?.exit === expected.exit
    && output?.value === expected.value
    && output?.c1_lifecycle_observations === expected.value
    && JSON.stringify(ids) === JSON.stringify(expected.findings);
}

const temporary = mkdtempSync(join(tmpdir(), 'tabi-r22-c1-cli-selftest-'));
const reports = [];
try {
  const base = loadBase();
  for (const test of EXPECTED.cases) {
    const directory = join(temporary, test.name);
    mkdirSync(directory);
    const files = Object.fromEntries(Object.entries(base).map(([path, content]) => [path, content]));
    mutate(files, test.mutation);
    if (test.legacy) files[LEGACY_MEASURE] = readFileSync(join(ROUND21, 'measure-c1.mjs'), 'utf8');
    writeTree(directory, files);
    git(directory, ['init', '-q']);
    git(directory, ['add', '--', '.']);
    git(directory, ['commit', '-qm', 'isolated round 22 semantic fixture']);
    const revision = git(directory, ['rev-parse', 'HEAD']);
    const cliRevision = test.invalidRevision ?? revision;
    const current = runCli(directory, MEASURE, cliRevision);
    const currentPass = checkOracle(test, current);
    let legacy = null;
    let legacyPass = true;
    if (test.legacy) {
      legacy = runCli(directory, LEGACY_MEASURE, revision);
      legacyPass = checkLegacy(test.legacy, legacy);
    }
    const pass = currentPass && legacyPass;
    reports.push({
      name: test.name,
      expected: { exit: test.exit, value: test.value, verdict: test.verdict, finding: test.finding },
      observed: {
        exit: current.status,
        reportedExit: current.output?.exit ?? null,
        value: current.output?.value ?? null,
        verdict: current.output?.verdict ?? null,
        findings: findingIds(current.output),
      },
      legacy: legacy && {
        expected: test.legacy,
        observed: {
          exit: legacy.status,
          reportedExit: legacy.output?.exit ?? null,
          value: legacy.output?.value ?? null,
          findings: findingIds(legacy.output),
        },
        pass: legacyPass,
      },
      pass,
      stdout: current.stdout,
      stderr: current.stderr,
      error: current.error,
    });
  }
  const passed = reports.filter((report) => report.pass).length;
  console.log(JSON.stringify({
    schema: 'tabi-round22-c1-selftest-v1',
    metric: EXPECTED.metric,
    verdict: passed === reports.length ? 'clean' : 'failed',
    cases: reports.length,
    passed,
    reports,
  }));
  process.exitCode = passed === reports.length ? 0 : 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
