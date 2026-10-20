#!/usr/bin/env node
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
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const rootDefault = realpathSync(dirname(script));
const expectedFile = 'expected.json';
const defaultInput = 'fixtures/m2-inference-source-scoped.jsonl';
const modalities = new Set(['observation', 'inference', 'unknown']);
const evidenceKinds = new Set(['runtime', 'source']);
const fields = new Set(['id', 'claim', 'modality', 'scope', 'evidence', 'falsifier', 'note']);
// Fixed lexical markers keep this a claim-record check, not a truth or NLP check.
const hostPattern = /\b(?:host|this\s+machine|this\s+lane|unbranded\s+chromium)\b/i;
const enforcementPattern = /\b(?:enforc(?:e|es|ed|ing|ement)|refus(?:e|es|ed|al)|ignor(?:e|es|ed)|reject(?:s|ed)?|block(?:s|ed)?)\b/i;

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function fail(finding, detail, exit = 1) {
  throw Object.assign(new Error(detail), { finding, detail, exit });
}

function safeField(value) {
  return String(value).replace(/[^A-Za-z0-9._/-]/g, '_').slice(0, 120) || '-';
}

function canonicalRoot(value) {
  let root;
  try {
    root = realpathSync(resolve(value));
  } catch {
    fail('could_not_evaluate', 'root_unavailable', 2);
  }
  let metadata;
  try {
    metadata = statSync(root);
  } catch {
    fail('could_not_evaluate', 'root_unavailable', 2);
  }
  if (!metadata.isDirectory()) fail('could_not_evaluate', 'root_not_directory', 2);
  return root;
}

function inputPath(root, file) {
  if (!file || isAbsolute(file) || /^[A-Za-z]:[\\/]/.test(file) || /^\\\\/.test(file) || file.includes('\\') || file.includes('\0')) {
    fail('could_not_evaluate', 'unsafe_input_path', 2);
  }
  const absolute = resolve(root, file);
  const rel = relative(root, absolute);
  if (rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    fail('could_not_evaluate', 'unsafe_input_path', 2);
  }
  return absolute;
}

function readInput(absolute) {
  let metadata;
  try {
    metadata = lstatSync(absolute);
  } catch (error) {
    fail('could_not_evaluate', error.code === 'ENOENT' ? 'input_missing' : 'input_unreadable', 2);
  }
  if (metadata.isSymbolicLink()) fail('could_not_evaluate', 'input_symlink_refused', 2);
  if (!metadata.isFile()) fail('could_not_evaluate', 'input_not_regular', 2);
  let descriptor;
  try {
    if (realpathSync(absolute) !== absolute) fail('could_not_evaluate', 'input_symlink_refused', 2);
    descriptor = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    if (!fstatSync(descriptor).isFile()) fail('could_not_evaluate', 'input_not_regular', 2);
    return readFileSync(descriptor);
  } catch (error) {
    if (error.finding) throw error;
    fail('could_not_evaluate', error.code === 'ENOENT' ? 'input_missing' : 'input_unreadable', 2);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function decode(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    fail('could_not_evaluate', 'input_invalid_utf8', 2);
  }
}

function parseArguments(args) {
  if (args.length === 1 && args[0] === '--self-test') return { selfTest: true };
  const options = { root: rootDefault, file: defaultInput, selfTest: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!['--root', '--file'].includes(flag) || seen.has(flag)) fail('could_not_evaluate', 'bad_arguments', 2);
    const value = args[index + 1];
    if (value === undefined || value.length === 0 || value.startsWith('--')) fail('could_not_evaluate', 'bad_arguments', 2);
    seen.add(flag);
    index++;
    if (flag === '--root') options.root = value;
    else options.file = value;
  }
  return options;
}

function addFinding(findings, id, claim, detail) {
  findings.push({ id, claim: safeField(claim), detail: safeField(detail) });
}

function assertsHostEnforcement(claim) {
  return hostPattern.test(claim) && enforcementPattern.test(claim);
}

function evaluate(text) {
  const findings = [];
  const lines = text.split('\n');
  let records = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) continue;
    records++;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      addFinding(findings, 'malformed_record', '-', `line_${index + 1}_json`);
      continue;
    }
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      addFinding(findings, 'malformed_record', '-', `line_${index + 1}_object`);
      continue;
    }
    const unknown = Object.keys(record).filter(key => !fields.has(key));
    if (unknown.length > 0) {
      addFinding(findings, 'malformed_record', record.id ?? '-', `unknown_field_${unknown[0]}`);
      continue;
    }
    const id = record.id;
    if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(id)) {
      addFinding(findings, 'malformed_record', '-', `line_${index + 1}_id`);
      continue;
    }
    if (typeof record.claim !== 'string' || record.claim.trim() === '') {
      addFinding(findings, 'malformed_record', id, 'claim_missing');
      continue;
    }
    if (!modalities.has(record.modality)) {
      addFinding(findings, 'malformed_record', id, 'modality_invalid');
      continue;
    }
    if ('scope' in record && typeof record.scope !== 'string') {
      addFinding(findings, 'malformed_record', id, 'scope_invalid');
      continue;
    }
    if ('falsifier' in record && (typeof record.falsifier !== 'string' || record.falsifier.trim() === '')) {
      addFinding(findings, 'malformed_record', id, 'falsifier_invalid');
      continue;
    }
    if ('note' in record && typeof record.note !== 'string') {
      addFinding(findings, 'malformed_record', id, 'note_invalid');
      continue;
    }
    if (!Array.isArray(record.evidence)) {
      addFinding(findings, 'malformed_record', id, 'evidence_missing');
      continue;
    }
    const evidenceInvalid = record.evidence.some(item =>
      item === null
      || typeof item !== 'object'
      || Array.isArray(item)
      || !evidenceKinds.has(item.kind)
      || typeof item.ref !== 'string'
      || item.ref.trim() === ''
      || Object.keys(item).some(key => !['kind', 'ref'].includes(key)),
    );
    if (evidenceInvalid) {
      addFinding(findings, 'malformed_record', id, 'evidence_invalid');
      continue;
    }
    if (record.modality !== 'unknown' && record.evidence.length === 0) {
      addFinding(findings, 'malformed_record', id, 'evidence_empty');
      continue;
    }
    if (record.modality === 'inference') {
      if (record.scope !== 'source') {
        addFinding(findings, 'inference_scope_missing', id, 'scope_must_equal_source');
        continue;
      }
      if (!record.evidence.some(item => item.kind === 'source')) {
        addFinding(findings, 'inference_scope_mismatch', id, 'source_evidence_required');
        continue;
      }
    }
    if (record.modality === 'observation'
      && assertsHostEnforcement(record.claim)
      && !record.evidence.some(item => item.kind === 'runtime')) {
      addFinding(findings, 'observation_without_runtime', id, 'host_enforcement_source_only');
    }
  }
  if (records === 0) addFinding(findings, 'no_records', '-', 'no_claim_records');
  const exit = findings.length === 0 ? 0 : 1;
  return { findings, records, verdict: exit === 0 ? 'clean' : 'failed', exit };
}

function printResult(result, file) {
  for (const finding of result.findings) {
    console.log(`FINDING id=${finding.id} claim=${finding.claim} detail=${finding.detail}`);
  }
  console.log(`CLAIM_GATE verdict=${result.verdict} records=${result.records} findings=${result.findings.length} file=${safeField(file)}`);
}

function printUnavailable(file, detail) {
  printResult({
    findings: [{ id: 'could_not_evaluate', claim: '-', detail: safeField(detail) }],
    records: 0,
    verdict: 'could-not-evaluate',
    exit: 2,
  }, file);
}

function run(options) {
  let label = options.file;
  try {
    const root = canonicalRoot(options.root);
    const absolute = inputPath(root, options.file);
    label = relative(root, absolute) || options.file;
    const result = evaluate(decode(readInput(absolute)));
    printResult(result, label);
    return result.exit;
  } catch (error) {
    if (error.finding) {
      printUnavailable(label, error.detail);
      return error.exit;
    }
    printUnavailable(label, 'input_unreadable');
    return 2;
  }
}

function firstRecord(bytes) {
  return JSON.parse(bytes.toString().trim());
}

function selfTest() {
  let temporary = null;
  let expectedCount = 0;
  let completed = 0;
  let failed = 0;
  try {
    const expected = JSON.parse(decode(readInput(join(rootDefault, expectedFile))));
    if (!Array.isArray(expected.fixtures) || !Array.isArray(expected.selftest)) throw new Error('expected_shape');
    expectedCount = expected.selftest.length;
    const fixtureNames = new Set();
    for (const fixture of expected.fixtures) {
      if (!fixture || typeof fixture !== 'object'
        || typeof fixture.name !== 'string'
        || typeof fixture.file !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(fixture.file)
        || !/^[a-f0-9]{64}$/.test(fixture.sha256)
        || fixtureNames.has(fixture.name)) {
        throw new Error('fixture_descriptor');
      }
      fixtureNames.add(fixture.name);
    }
    temporary = realpathSync(mkdtempSync(join(tmpdir(), 'tabi-claim-mistake-')));
    for (const fixture of expected.fixtures) {
      const bytes = readInput(join(rootDefault, fixture.file));
      if (sha256(bytes) !== fixture.sha256) throw new Error(`fixture_pin_${fixture.name}`);
      const destination = join(temporary, fixture.file);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, bytes);
    }
    const byName = Object.fromEntries(expected.fixtures.map(fixture => [fixture.name, fixture]));
    const green = firstRecord(readInput(join(temporary, byName.inference_source_scoped.file)));
    const runtime = firstRecord(readInput(join(temporary, byName.observation_runtime_captured.file)));
    const put = (file, value) => {
      const destination = join(temporary, file);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, value);
    };
    const unscoped = { ...green };
    delete unscoped.scope;
    put('fixtures/inference-unscoped.jsonl', `${JSON.stringify(unscoped)}\n`);
    const runtimeOnly = { ...green, evidence: runtime.evidence };
    put('fixtures/inference-runtime-only.jsonl', `${JSON.stringify(runtimeOnly)}\n`);
    put('fixtures/empty.jsonl', '');
    mkdirSync(join(temporary, 'fixtures/not-a-file.jsonl'), { recursive: true });
    symlinkSync(join(temporary, byName.inference_source_scoped.file), join(temporary, 'fixtures/symlink.jsonl'));

    for (const test of expected.selftest) {
      const base = test.fixture ? byName[test.fixture] : test;
      if (!base || typeof base.file !== 'string' || !Number.isInteger(base.exit) || typeof base.finding !== 'string') {
        throw new Error(`selftest_descriptor_${test.name ?? 'unknown'}`);
      }
      const result = spawnSync(process.execPath, [script, '--root', temporary, '--file', base.file], {
        cwd: temporary,
        encoding: 'utf8',
      });
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
      const actualExit = result.status ?? -1;
      const lines = output.split('\n');
      const findingLine = lines.find(line => line.startsWith('FINDING id='));
      let findingOk = false;
      if (base.finding === 'none') {
        findingOk = findingLine === undefined;
      } else if (findingLine !== undefined) {
        const cells = Object.fromEntries(findingLine.split(' ').slice(1).map(cell => {
          const at = cell.indexOf('=');
          return [cell.slice(0, at), cell.slice(at + 1)];
        }));
        findingOk = cells.id === base.finding && (!base.detail || cells.detail === base.detail);
      }
      const expectedVerdict = base.exit === 0 ? 'clean' : base.exit === 1 ? 'failed' : 'could-not-evaluate';
      const summaryOk = lines.some(line => line.startsWith(`CLAIM_GATE verdict=${expectedVerdict} `));
      const pass = !result.error && actualExit === base.exit && findingOk && summaryOk;
      completed++;
      if (!pass) {
        failed++;
        console.error(output.trim());
      }
      console.log(`SELFTEST name=${safeField(test.name)} expected_exit=${base.exit} actual_exit=${actualExit} expected_finding=${base.finding} result=${pass ? 'PASS' : 'FAIL'}`);
    }
  } catch (error) {
    failed++;
    console.error(`SELFTEST setup_error=${safeField(error.message)}`);
  } finally {
    if (temporary !== null) rmSync(temporary, { recursive: true, force: true });
  }
  const verdict = failed === 0 && completed === expectedCount && expectedCount > 0 ? 'clean' : 'failed';
  console.log(`CLAIM_SELFTEST verdict=${verdict} cases=${completed}/${expectedCount}`);
  return verdict === 'clean' ? 0 : 1;
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.selfTest) process.exitCode = selfTest();
  else process.exitCode = run(options);
} catch (error) {
  printUnavailable('argv', error.detail ?? 'bad_arguments');
  process.exitCode = error.exit ?? 2;
}
