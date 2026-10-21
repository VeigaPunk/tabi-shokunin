#!/usr/bin/env node
// Round-20 wave and return-snapshot check: a finite, author-authored metadata guard for
// mistake repair (round-18/19 null waves, blank agentIds, reconstructed snapshots).
//
// It is NOT an unforgeable observation, NOT an independent certification, and NOT a
// no-harm proof. It reads only the fields a snapshot asserts. It cannot prove who
// captured a snapshot or when; it never treats capturedAt, file mtimes, or any other
// timestamp as proof of ordering.
//
// Operational requirement, not enforced here: L1 captures the return snapshot directly
// after all 64 registry members have settled and before any clone import, while the
// preexisting untracked source is still present in the lane.
//
// Checks:
//   wave_null, wave_mismatch: spec.wave and registry.wave must be nonblank and equal.
//   agent_id_missing: every registry member needs a nonblank string agentId.
//   snapshot_reconstructed: phase must be return-before-integration; observed must be
//     true; baseline must be the round-20 baseline; no reconstruction marker may appear
//     outside the status and trackedDiff payloads; the preexisting untracked source must
//     be listed as a `??` status entry; status must be porcelain v1.
//   tracked_change: trackedDiff must be empty and every status entry must be untracked.
//   out_of_scope: every status path must sit under the round-20 wave directory or the
//     known preexisting source directory.
//
// Usage:
//   node .ufo/waves/round-20/check-wave.mjs --spec FILE --registry FILE --snapshot FILE
//   node .ufo/waves/round-20/check-wave.mjs --selftest
// Exit: 0 clean; 1 findings (stdout JSON lists stable finding codes); 2 input or usage error.

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '../../..');
const EXPECTED_PATH = join(ROOT, 'corpus/evidence/round-20/wave-check-expected.json');
const CHECK_SCHEMA = 'tabi-r20-wave-check-v1';
const EXPECTED_SCHEMA = 'tabi-r20-wave-check-expected-v1';
const ROUND_BASELINE = 'c49929430d996b016dde2e3a3a5be380f3433fdb';
const RETURN_PHASE = 'return-before-integration';
const PRESERVED_SOURCE_LINE = '?? corpus/evidence/round-20/sources/html_form_element.cc';
const SCOPE_PREFIXES = ['.ufo/waves/round-20/', 'corpus/evidence/round-20/sources/'];
const RECONSTRUCTION_MARKER = /reconstruct/i;
const PORCELAIN_LINE = /^([ MADRCU?!]{2}) (.+)$/;
const INPUT_FLAGS = ['--spec', '--registry', '--snapshot'];
const USAGE = 'usage: node .ufo/waves/round-20/check-wave.mjs --spec FILE --registry FILE --snapshot FILE | --selftest';

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonBlank = (value) => typeof value === 'string' && value.trim().length > 0;
const show = (value) => JSON.stringify(value) ?? 'undefined';
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

function parseJsonLine(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function checkWave(spec, registry, add) {
  const specWave = isRecord(spec) ? spec.wave : undefined;
  const registryWave = isRecord(registry) ? registry.wave : undefined;
  if (!isNonBlank(specWave) || !isNonBlank(registryWave)) {
    add('wave_null', `spec.wave=${show(specWave)} registry.wave=${show(registryWave)}`);
  } else if (specWave !== registryWave) {
    add('wave_mismatch', `spec.wave=${specWave} registry.wave=${registryWave}`);
  }
}

function checkMembers(registry, add) {
  const members = isRecord(registry) ? registry.members : undefined;
  if (!isRecord(members) || Object.keys(members).length === 0) {
    add('agent_id_missing', 'registry.members absent or empty');
    return;
  }
  for (const [name, member] of Object.entries(members)) {
    if (!isRecord(member) || !isNonBlank(member.agentId)) add('agent_id_missing', `member=${name}`);
  }
}

function checkSnapshot(snapshot, add) {
  if (!isRecord(snapshot)) {
    add('snapshot_reconstructed', 'snapshot is not a JSON object');
    return;
  }
  const gaps = [];
  if (snapshot.phase !== RETURN_PHASE) gaps.push(`phase=${show(snapshot.phase)}`);
  if (snapshot.observed !== true) gaps.push(`observed=${show(snapshot.observed)}`);
  if (snapshot.baseline !== ROUND_BASELINE) gaps.push(`baseline=${show(snapshot.baseline)}`);
  for (const [key, value] of Object.entries(snapshot)) {
    if (key === 'status' || key === 'trackedDiff') continue;
    const marked = (RECONSTRUCTION_MARKER.test(key) && value !== false)
      || (typeof value === 'string' && RECONSTRUCTION_MARKER.test(value));
    if (marked) gaps.push(`reconstruction_marker=${key}`);
  }
  if (typeof snapshot.status !== 'string') {
    gaps.push('status_missing');
  } else if (!snapshot.status.split('\n').includes(PRESERVED_SOURCE_LINE)) {
    gaps.push('preexisting_source_entry_absent');
  }
  if (typeof snapshot.trackedDiff !== 'string') gaps.push('trackedDiff_missing');
  if (gaps.length > 0) add('snapshot_reconstructed', gaps.join(' '));

  if (typeof snapshot.trackedDiff === 'string' && snapshot.trackedDiff !== '') {
    add('tracked_change', 'trackedDiff is not empty');
  }
  if (typeof snapshot.status !== 'string') return;
  for (const line of snapshot.status.split('\n')) {
    if (line === '') continue;
    const match = PORCELAIN_LINE.exec(line);
    if (match === null) {
      add('snapshot_reconstructed', 'status_not_porcelain_v1');
      continue;
    }
    const [, code, rest] = match;
    if (code !== '??') add('tracked_change', line);
    // Quoted paths are not decoded: they fail closed as out of scope.
    for (const path of rest.split(' -> ')) {
      if (path.startsWith('"') || !SCOPE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        add('out_of_scope', path);
      }
    }
  }
}

function evaluate(spec, registry, snapshot) {
  const findings = [];
  const add = (code, detail) => findings.push({ code, detail });
  checkWave(spec, registry, add);
  checkMembers(registry, add);
  checkSnapshot(snapshot, add);
  return findings;
}

function report(findings) {
  const key = ({ code, detail }) => `${code}\n${detail}`;
  const ordered = [...findings].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  const codes = [...new Set(ordered.map(({ code }) => code))];
  return {
    schema: CHECK_SCHEMA,
    verdict: codes.length === 0 ? 'clean' : 'findings',
    findings: codes,
    details: ordered.map(({ code, detail }) => `${code}: ${detail}`),
  };
}

function runCheck({ spec, registry, snapshot }) {
  let documents;
  try {
    documents = { spec: readJson(spec), registry: readJson(registry), snapshot: readJson(snapshot) };
  } catch (error) {
    const output = { schema: CHECK_SCHEMA, verdict: 'error', findings: [], details: [], errors: [error.message] };
    return { exit: 2, output };
  }
  const output = report(evaluate(documents.spec, documents.registry, documents.snapshot));
  return { exit: output.findings.length === 0 ? 0 : 1, output };
}

function buildFixtures() {
  const base = {
    spec: { wave: 'tabi-round-20-w1', reportDir: '.ufo/waves/round-20/w1' },
    registry: {
      schema: 'ufo-swarm-registry-v1',
      wave: 'tabi-round-20-w1',
      members: {
        ExecFrozen: { kind: 'spawn', agentId: 'TabiR20.ExecFrozen', role: 'executor', item: null },
        CriticClaims: { kind: 'spawn', agentId: 'TabiR20.CriticClaims', role: 'critic', item: null },
      },
    },
    snapshot: {
      phase: RETURN_PHASE,
      observed: true,
      baseline: ROUND_BASELINE,
      status: '?? .ufo/waves/round-20/w1/ExecFrozen.md\n?? corpus/evidence/round-20/sources/html_form_element.cc\n',
      trackedDiff: '',
    },
  };
  const variant = (mutate) => {
    const fixture = structuredClone(base);
    mutate(fixture);
    return fixture;
  };
  return {
    positive_clean_triple: variant(() => {}),
    wave_null: variant((f) => { f.registry.wave = null; }),
    wave_mismatch: variant((f) => { f.registry.wave = 'tabi-round-20-w0'; }),
    agent_id_missing: variant((f) => { f.registry.members.CriticClaims.agentId = ''; }),
    snapshot_reconstructed: variant((f) => {
      f.snapshot.phase = 'reconstructed-from-mtimes';
      f.snapshot.observed = false;
    }),
    tracked_change: variant((f) => { f.snapshot.trackedDiff = 'diff --git a/LOG.md b/LOG.md\n'; }),
    out_of_scope: variant((f) => { f.snapshot.status += '?? scripts/new-helper.mjs\n'; }),
    phase_return_after_integration: variant((f) => { f.snapshot.phase = 'return-after-integration'; }),
    reconstructed_marker: variant((f) => {
      f.snapshot.method = 'RECONSTRUCTED from mtimes, not captured at return';
    }),
    preexisting_source_entry_absent: variant((f) => {
      f.snapshot.status = '?? .ufo/waves/round-20/w1/ExecFrozen.md\n';
    }),
  };
}

function selfTest() {
  let expected;
  try {
    expected = readJson(EXPECTED_PATH);
  } catch (error) {
    process.stderr.write(`could_not_read_expectations: ${error.message}\n`);
    return 2;
  }
  if (!isRecord(expected) || expected.schema !== EXPECTED_SCHEMA || !Array.isArray(expected.cases)) {
    process.stderr.write('expectations_schema_invalid\n');
    return 2;
  }
  const fixtures = buildFixtures();
  const failures = [];
  const covered = new Set(expected.cases.map((item) => item?.name));
  for (const name of Object.keys(fixtures)) {
    if (!covered.has(name)) failures.push(`${name}: fixture_without_expectation`);
  }
  const scratch = mkdtempSync(join(tmpdir(), 'tabi-r20-wave-check-'));
  try {
    for (const item of expected.cases) {
      const { name, exit, findings } = item ?? {};
      if (!Object.hasOwn(fixtures, name)) {
        failures.push(`${name}: expectation_without_fixture`);
        continue;
      }
      if (!Number.isInteger(exit) || !Array.isArray(findings)) {
        failures.push(`${name}: expectation_malformed`);
        continue;
      }
      const dir = join(scratch, name);
      mkdirSync(dir, { recursive: true });
      const fixture = fixtures[name];
      const paths = {
        spec: join(dir, 'spec.json'),
        registry: join(dir, 'registry.json'),
        snapshot: join(dir, 'snapshot.json'),
      };
      writeJson(paths.spec, fixture.spec);
      writeJson(paths.registry, fixture.registry);
      writeJson(paths.snapshot, fixture.snapshot);
      const run = spawnSync(
        process.execPath,
        [SCRIPT, '--spec', paths.spec, '--registry', paths.registry, '--snapshot', paths.snapshot],
        {
          cwd: dir,
          env: { PATH: '/usr/bin:/bin', HOME: dir, TMPDIR: scratch, LC_ALL: 'C.UTF-8', TZ: 'UTC' },
          encoding: 'utf8',
          maxBuffer: 1024 * 1024,
          timeout: 30_000,
        },
      );
      const actual = parseJsonLine(run.stdout ?? '');
      const actualFindings = isRecord(actual) && Array.isArray(actual.findings) ? actual.findings : null;
      const wantFindings = [...findings].sort();
      if (run.status !== exit || JSON.stringify(actualFindings) !== JSON.stringify(wantFindings)) {
        failures.push(
          `${name}: expected exit=${exit} findings=${JSON.stringify(wantFindings)}; `
          + `actual exit=${run.status} findings=${JSON.stringify(actualFindings)}`,
        );
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  const verdict = failures.length === 0 ? 'clean' : 'failed';
  process.stdout.write(
    `CHECK_WAVE_SELFTEST verdict=${verdict} cases=${expected.cases.length} failed=${failures.length}\n`,
  );
  for (const failure of failures) process.stderr.write(`${failure}\n`);
  return failures.length === 0 ? 0 : 1;
}

function parseInputFlags(argv) {
  if (argv.length !== INPUT_FLAGS.length * 2) return null;
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!INPUT_FLAGS.includes(flag) || values.has(flag) || value === undefined || value.startsWith('--')) {
      return null;
    }
    values.set(flag, value);
  }
  return { spec: values.get('--spec'), registry: values.get('--registry'), snapshot: values.get('--snapshot') };
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--selftest') {
    process.exitCode = selfTest();
    return;
  }
  const inputs = parseInputFlags(argv);
  if (inputs === null) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  const { exit, output } = runCheck(inputs);
  process.stdout.write(`${JSON.stringify(output)}\n`);
  process.exitCode = exit;
}

main(process.argv.slice(2));
