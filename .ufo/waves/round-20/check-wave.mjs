#!/usr/bin/env node
// Round-20 wave and return-snapshot check: a finite, author-authored metadata guard for
// mistake repair. It is not an unforgeable observation, independent certification, or
// no-harm proof. It cannot prove capture actor or ordering; timestamps are not ordering
// evidence. Capture labels do not establish actor settlement: w1 all-actor flags are
// withdrawn in w1/ordering-correction.json. This guard checks authored metadata only.
//
// Direct diagnostic mode:
//   node .ufo/waves/round-20/check-wave.mjs --spec FILE --registry FILE --snapshot FILE
// Canonical frozen gate mode:
//   node .ufo/waves/round-20/check-wave.mjs --frozen DIR
//   DIR contains expected.json, spec.json, registry.json, snapshot.json. expected.json
// pins the SHA-256 of the exact bytes of all three input JSON files plus expected exit
// and findings. Frozen mode verifies all hashes before interpreting the three inputs.
// Selftest:
//   node .ufo/waves/round-20/check-wave.mjs --selftest
// Exit: 0 clean/matched frozen gate; 1 findings or frozen expectation mismatch; 2 input,
// unpinned/invalid frozen expectation, usage, or integrity error.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '../../..');
const EXPECTED_PATH = join(ROOT, 'corpus/evidence/round-20/wave-check-expected.json');
const CHECK_SCHEMA = 'tabi-r20-wave-check-v1';
const EXPECTED_SCHEMA = 'tabi-r20-wave-check-expected-v1';
const FROZEN_SCHEMA = 'tabi-r20-frozen-wave-v1';
const ROUND_BASELINE = 'c49929430d996b016dde2e3a3a5be380f3433fdb';
const RETURN_PHASE = 'return-before-integration';
const PRESERVED_SOURCE_LINE = '?? corpus/evidence/round-20/sources/html_form_element.cc';
const SCOPE_PREFIXES = ['.ufo/waves/round-20/', 'corpus/evidence/round-20/sources/'];
const RECONSTRUCTION_MARKER = /reconstruct/i;
const PORCELAIN_LINE = /^([ MADRCU?!]{2}) (.+)$/;
const INPUT_FILES = ['spec.json', 'registry.json', 'snapshot.json'];
const INPUT_FLAGS = ['--spec', '--registry', '--snapshot'];
const CHECK_FINDINGS = new Set([
  'wave_null',
  'wave_mismatch',
  'agent_id_missing',
  'snapshot_reconstructed',
  'tracked_change',
  'out_of_scope',
]);
const RESULT_FINDINGS = new Set([
  ...CHECK_FINDINGS,
  'input_not_regular',
  'input_unreadable',
  'input_invalid_json',
  'frozen_expectation_invalid',
  'snapshot_tampered',
  'frozen_expectation_mismatch',
]);
const USAGE = 'usage: node .ufo/waves/round-20/check-wave.mjs --frozen DIR | --spec FILE --registry FILE --snapshot FILE | --selftest';

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonBlank = (value) => typeof value === 'string' && value.trim().length > 0;
const show = (value) => JSON.stringify(value) ?? 'undefined';
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const keysAre = (value, expected) => isRecord(value)
  && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());

class InputFailure extends Error {
  constructor(code, label) {
    super(label);
    this.code = code;
    this.label = label;
  }
}

function readRegularBytes(path, label) {
  try {
    const linkStat = lstatSync(path);
    if (linkStat.isSymbolicLink() || !linkStat.isFile()) throw new InputFailure('input_not_regular', label);
    const flags = constants.O_RDONLY
      | (constants.O_NOFOLLOW ?? 0)
      | (constants.O_NONBLOCK ?? 0);
    const fd = openSync(path, flags);
    try {
      if (!fstatSync(fd).isFile()) throw new InputFailure('input_not_regular', label);
      return readFileSync(fd);
    } finally {
      closeSync(fd);
    }
  } catch (error) {
    if (error instanceof InputFailure) throw error;
    if (error?.code === 'ELOOP') throw new InputFailure('input_not_regular', label);
    throw new InputFailure('input_unreadable', label);
  }
}

function parseJson(bytes, label, code = 'input_invalid_json') {
  try {
    return JSON.parse(bytes.toString('utf8'));
  } catch {
    throw new InputFailure(code, label);
  }
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function failureResult(code, detail, exit = 2) {
  return {
    exit,
    output: {
      schema: CHECK_SCHEMA,
      verdict: exit === 1 ? 'findings' : 'error',
      findings: [code],
      details: [detail],
    },
  };
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
  // This is intentionally a top-level key/string check. Nested metadata is not traversed.
  for (const [key, value] of Object.entries(snapshot)) {
    if (key === 'status' || key === 'trackedDiff') continue;
    const marked = (RECONSTRUCTION_MARKER.test(key) && value !== false)
      || (typeof value === 'string' && RECONSTRUCTION_MARKER.test(value));
    if (marked) gaps.push(`reconstruction_marker=${key}`);
  }
  if (typeof snapshot.status !== 'string') {
    gaps.push('status_missing');
  } else if (!snapshot.status.split('\n').map((line) => line.replace(/\r$/, '')).includes(PRESERVED_SOURCE_LINE)) {
    gaps.push('preexisting_source_entry_absent');
  }
  if (typeof snapshot.trackedDiff !== 'string') gaps.push('trackedDiff_missing');
  if (gaps.length > 0) add('snapshot_reconstructed', gaps.join(' '));

  if (typeof snapshot.trackedDiff === 'string' && snapshot.trackedDiff !== '') {
    add('tracked_change', 'trackedDiff is not empty');
  }
  if (typeof snapshot.status !== 'string') return;
  for (const rawLine of snapshot.status.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
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

function directCheck(paths) {
  let documents;
  try {
    documents = {};
    for (const key of ['spec', 'registry', 'snapshot']) {
      const filename = `${key}.json`;
      documents[key] = parseJson(readRegularBytes(paths[key], filename), filename);
    }
  } catch (error) {
    const failure = error instanceof InputFailure
      ? error
      : new InputFailure('input_unreadable', 'input');
    return failureResult(failure.code, failure.label);
  }
  const output = report(evaluate(documents.spec, documents.registry, documents.snapshot));
  return { exit: output.findings.length === 0 ? 0 : 1, output };
}

function validOutcome(exit, findings) {
  if (!Number.isInteger(exit) || (exit !== 0 && exit !== 1) || !Array.isArray(findings)) return false;
  if (!findings.every((code) => typeof code === 'string' && CHECK_FINDINGS.has(code))) return false;
  const ordered = [...new Set(findings)].sort();
  if (JSON.stringify(findings) !== JSON.stringify(ordered)) return false;
  return (exit === 0) === (findings.length === 0);
}

function validateFrozenExpectation(value) {
  if (!isRecord(value) || value.schema !== FROZEN_SCHEMA) return 'expected.schema_invalid';
  if (!keysAre(value, ['schema', 'inputs', 'expected'])) return 'expected.shape_invalid';
  if (!keysAre(value.inputs, INPUT_FILES)) return 'expected.input_pins_not_exact';
  for (const filename of INPUT_FILES) {
    if (typeof value.inputs[filename] !== 'string' || !/^[0-9a-f]{64}$/.test(value.inputs[filename])) {
      return 'expected.input_pin_invalid';
    }
  }
  if (!keysAre(value.expected, ['exit', 'findings'])
    || !validOutcome(value.expected.exit, value.expected.findings)) return 'expected.outcome_invalid';
  return null;
}

function frozenCheck(dir) {
  const expectedPath = join(dir, 'expected.json');
  let expected;
  try {
    expected = parseJson(readRegularBytes(expectedPath, 'expected.json'), 'expected.json', 'frozen_expectation_invalid');
  } catch (error) {
    const failure = error instanceof InputFailure
      ? error
      : new InputFailure('input_unreadable', 'expected.json');
    return failureResult(failure.code, failure.label);
  }
  const invalidReason = validateFrozenExpectation(expected);
  if (invalidReason !== null) return failureResult('frozen_expectation_invalid', invalidReason);

  const buffers = {};
  try {
    for (const filename of INPUT_FILES) {
      buffers[filename] = readRegularBytes(join(dir, filename), filename);
    }
  } catch (error) {
    const failure = error instanceof InputFailure
      ? error
      : new InputFailure('input_unreadable', 'input');
    return failureResult(failure.code, failure.label);
  }

  // Do not parse or compare metadata until every pinned byte digest has been checked.
  const changed = INPUT_FILES.filter((filename) => sha256(buffers[filename]) !== expected.inputs[filename]);
  if (changed.length > 0) return failureResult('snapshot_tampered', changed.join(','));

  let documents;
  try {
    documents = {};
    for (const filename of INPUT_FILES) {
      documents[filename.slice(0, -5)] = parseJson(buffers[filename], filename);
    }
  } catch (error) {
    const failure = error instanceof InputFailure
      ? error
      : new InputFailure('input_invalid_json', 'input');
    return failureResult(failure.code, failure.label);
  }
  const result = report(evaluate(documents.spec, documents.registry, documents.snapshot));
  const actualExit = result.findings.length === 0 ? 0 : 1;
  if (actualExit !== expected.expected.exit
    || JSON.stringify(result.findings) !== JSON.stringify(expected.expected.findings)) {
    return failureResult(
      'frozen_expectation_mismatch',
      `expected=${expected.expected.exit}:${expected.expected.findings.join(',')} actual=${actualExit}:${result.findings.join(',')}`,
      1,
    );
  }
  return {
    exit: 0,
    output: { ...result, verdict: 'frozen_match', pinnedExit: actualExit },
  };
}

function fixtureBase() {
  return {
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
}

function buildFixtures() {
  const variant = (mode, mutate = () => {}, damage = null) => {
    const documents = structuredClone(fixtureBase());
    mutate(documents);
    return { mode, documents, damage };
  };
  const frozen = (damage = null, mutate = () => {}) => variant('frozen', mutate, damage);
  return {
    positive_clean_triple: variant('direct'),
    wave_null: variant('direct', (f) => { f.registry.wave = null; }),
    wave_mismatch: variant('direct', (f) => { f.registry.wave = 'tabi-round-20-w0'; }),
    spec_wave_null: variant('direct', (f) => { f.spec.wave = null; }),
    spec_wave_blank: variant('direct', (f) => { f.spec.wave = '  '; }),
    registry_wave_blank: variant('direct', (f) => { f.registry.wave = ''; }),
    agent_id_absent: variant('direct', (f) => { delete f.registry.members.CriticClaims.agentId; }),
    snapshot_reconstructed: variant('direct', (f) => { f.snapshot.phase = 'RECONSTRUCTED from mtimes'; }),
    phase_return_after_integration: variant('direct', (f) => { f.snapshot.phase = 'return-after-integration'; }),
    observed_false_alone: variant('direct', (f) => { f.snapshot.observed = false; }),
    reconstructed_marker: variant('direct', (f) => { f.snapshot.method = 'RECONSTRUCTED from mtimes'; }),
    tracked_change: variant('direct', (f) => { f.snapshot.trackedDiff = 'diff --git a/LOG.md b/LOG.md\n'; }),
    out_of_scope: variant('direct', (f) => { f.snapshot.status += '?? scripts/new-helper.mjs\n'; }),
    preexisting_source_entry_absent: variant('direct', (f) => {
      f.snapshot.status = '?? .ufo/waves/round-20/w1/ExecFrozen.md\n';
    }),
    frozen_clean: frozen(),
    frozen_tampered: frozen({ kind: 'tamper', file: 'spec.json' }),
    frozen_expectation_mismatch: frozen(),
    frozen_unpinned: frozen({ kind: 'unpin' }),
    frozen_unreadable_input: frozen({ kind: 'missing', file: 'registry.json' }),
    frozen_symlink_spec: frozen({ kind: 'symlink', file: 'spec.json' }),
    frozen_nonregular_spec: frozen({ kind: 'nonregular', file: 'spec.json' }),
    frozen_symlink_registry: frozen({ kind: 'symlink', file: 'registry.json' }),
    frozen_nonregular_registry: frozen({ kind: 'nonregular', file: 'registry.json' }),
    frozen_symlink_snapshot: frozen({ kind: 'symlink', file: 'snapshot.json' }),
    frozen_nonregular_snapshot: frozen({ kind: 'nonregular', file: 'snapshot.json' }),
    frozen_symlink_expected: frozen({ kind: 'symlink', file: 'expected.json' }),
    frozen_nonregular_expected: frozen({ kind: 'nonregular', file: 'expected.json' }),
  };
}

function parseSelfTestExpected(bytes) {
  try {
    const value = JSON.parse(bytes.toString('utf8'));
    if (!isRecord(value) || value.schema !== EXPECTED_SCHEMA || !Array.isArray(value.cases)) return null;
    return value;
  } catch {
    return null;
  }
}

function applyFixtureDamage(dir, fixture) {
  const damage = fixture.damage;
  if (damage === null) return;
  const path = join(dir, damage.file ?? 'expected.json');
  if (damage.kind === 'tamper') {
    const specPath = join(dir, damage.file);
    const spec = JSON.parse(readFileSync(specPath, 'utf8'));
    spec.wave = 'tampered-after-pinning';
    writeJson(specPath, spec);
  } else if (damage.kind === 'unpin') {
    const expectedPath = join(dir, 'expected.json');
    const expected = JSON.parse(readFileSync(expectedPath, 'utf8'));
    delete expected.inputs['snapshot.json'];
    writeJson(expectedPath, expected);
  } else if (damage.kind === 'missing') {
    unlinkSync(path);
  } else if (damage.kind === 'symlink') {
    const target = `${path}.target`;
    renameSync(path, target);
    symlinkSync(target, path);
  } else if (damage.kind === 'nonregular') {
    unlinkSync(path);
    mkdirSync(path);
  }
}

function writeFixture(dir, fixture, expectedCase) {
  const inputPaths = {};
  for (const [key, document] of Object.entries(fixture.documents)) {
    const filename = `${key}.json`;
    inputPaths[key] = join(dir, filename);
    writeJson(inputPaths[key], document);
  }
  if (fixture.mode === 'frozen') {
    if (!isRecord(expectedCase.pin) || !validOutcome(expectedCase.pin.exit, expectedCase.pin.findings)) {
      throw new Error(`${expectedCase.name}: frozen pin expectation invalid`);
    }
    const inputs = {};
    for (const filename of INPUT_FILES) inputs[filename] = sha256(readFileSync(join(dir, filename)));
    writeJson(join(dir, 'expected.json'), {
      schema: FROZEN_SCHEMA,
      inputs,
      expected: expectedCase.pin,
    });
  }
  applyFixtureDamage(dir, fixture);
  return inputPaths;
}

function selfTest() {
  let expected;
  try {
    expected = parseSelfTestExpected(readRegularBytes(EXPECTED_PATH, 'wave-check-expected.json'));
  } catch (error) {
    const failure = error instanceof InputFailure
      ? error
      : new InputFailure('input_unreadable', 'wave-check-expected.json');
    process.stderr.write(`${failure.code}: ${failure.label}\n`);
    return 2;
  }
  if (expected === null) {
    process.stderr.write('input_invalid_json: wave-check-expected.json\n');
    return 2;
  }

  const fixtures = buildFixtures();
  const failures = [];
  const names = new Set();
  const expectedNames = new Set();
  for (const item of expected.cases) {
    if (!isRecord(item) || typeof item.name !== 'string' || !Object.hasOwn(fixtures, item.name)) {
      failures.push('expectation_without_fixture');
      continue;
    }
    if (expectedNames.has(item.name)) failures.push(`${item.name}: duplicate_expectation`);
    expectedNames.add(item.name);
    if (!Number.isInteger(item.exit) || !RESULT_FINDINGS.has(item.findings?.[0])
      && !(Array.isArray(item.findings) && item.findings.length === 0)) {
      failures.push(`${item.name}: expectation_malformed`);
      continue;
    }
    if (!Array.isArray(item.findings)
      || item.findings.some((code) => typeof code !== 'string' || !RESULT_FINDINGS.has(code))
      || JSON.stringify(item.findings) !== JSON.stringify([...new Set(item.findings)].sort())) {
      failures.push(`${item.name}: expectation_findings_invalid`);
      continue;
    }
    if (fixtures[item.name].mode === 'frozen'
      && (!isRecord(item.pin) || !validOutcome(item.pin.exit, item.pin.findings))) {
      failures.push(`${item.name}: pin_expectation_invalid`);
    }
  }
  for (const name of Object.keys(fixtures)) {
    if (!expectedNames.has(name)) failures.push(`${name}: fixture_without_expectation`);
  }
  if (failures.length > 0) {
    process.stderr.write(`${failures.join('\n')}\n`);
    return 2;
  }

  const scratch = mkdtempSync(join(tmpdir(), 'tabi-r20-wave-check-'));
  try {
    for (const item of expected.cases) {
      const fixture = fixtures[item.name];
      const dir = join(scratch, item.name);
      mkdirSync(dir);
      const inputPaths = writeFixture(dir, fixture, item);
      const argv = fixture.mode === 'frozen'
        ? [SCRIPT, '--frozen', dir]
        : [SCRIPT, '--spec', inputPaths.spec, '--registry', inputPaths.registry, '--snapshot', inputPaths.snapshot];
      const run = spawnSync(process.execPath, argv, {
        cwd: dir,
        env: { PATH: '/usr/bin:/bin', HOME: dir, TMPDIR: scratch, LC_ALL: 'C.UTF-8', TZ: 'UTC' },
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        timeout: 30_000,
      });
      let actual;
      try {
        actual = JSON.parse(run.stdout ?? '');
      } catch {
        actual = null;
      }
      const actualFindings = isRecord(actual) && Array.isArray(actual.findings) ? actual.findings : null;
      if (run.status !== item.exit || JSON.stringify(actualFindings) !== JSON.stringify(item.findings)) {
        failures.push(
          `${item.name}: expected exit=${item.exit} findings=${JSON.stringify(item.findings)}; `
          + `actual exit=${run.status} findings=${JSON.stringify(actualFindings)}`,
        );
      }
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  const verdict = failures.length === 0 ? 'clean' : 'failed';
  process.stdout.write(`CHECK_WAVE_SELFTEST verdict=${verdict} cases=${expected.cases.length} failed=${failures.length}\n`);
  for (const failure of failures) process.stderr.write(`${failure}\n`);
  return failures.length === 0 ? 0 : 1;
}

function parseInputFlags(argv) {
  if (argv.length !== INPUT_FLAGS.length * 2) return null;
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!INPUT_FLAGS.includes(flag) || values.has(flag) || value === undefined || value.startsWith('--')) return null;
    values.set(flag, value);
  }
  return { spec: values.get('--spec'), registry: values.get('--registry'), snapshot: values.get('--snapshot') };
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--selftest') {
    process.exitCode = selfTest();
    return;
  }
  if (argv.length === 2 && argv[0] === '--frozen' && !argv[1].startsWith('--')) {
    const { exit, output } = frozenCheck(argv[1]);
    process.stdout.write(`${JSON.stringify(output)}\n`);
    process.exitCode = exit;
    return;
  }
  const paths = parseInputFlags(argv);
  if (paths === null) {
    process.stderr.write(`${USAGE}\n`);
    process.exitCode = 2;
    return;
  }
  const { exit, output } = directCheck(paths);
  process.stdout.write(`${JSON.stringify(output)}\n`);
  process.exitCode = exit;
}

main(process.argv.slice(2));
