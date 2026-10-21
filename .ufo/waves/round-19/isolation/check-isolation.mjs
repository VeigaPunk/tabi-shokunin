#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT), '../../../..');
const SCRATCH_ROOT = '/fast/scratch/tabi-r19';
const BASELINE = '66251bfc1aef393e4aec599e950a8deb867736bb';
const LEDGER_SCHEMA = 'tabi-r19-isolation-ledger-v1';
const RESULT_SCHEMA = 'tabi-r19-isolation-check-v1';
const SELFTEST_SCHEMA = 'tabi-r19-isolation-selftest-v1';
const LEDGER_RELATIVE_PATH = '.ufo/waves/round-19/isolation/ledger.json';
const RECEIPT_RELATIVE_PATH = 'corpus/evidence/round-19/selftests/isolation.json';
const LANE_ALLOWED_ROOT = '.ufo/waves/round-19';
const LANE_ALLOWED_PREFIX = `${LANE_ALLOWED_ROOT}/`;
const MAX_BUFFER = 16 * 1024 * 1024;
const GIT_PREFIX = ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false', '-c', 'core.commitGraph=false'];

class CouldNotEvaluate extends Error {
  constructor(code, detail) {
    super(detail);
    this.code = code;
  }
}

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
    LC_ALL: 'C',
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) {
    env.PATH = process.env.PATH.split(':').filter((entry) => isAbsolute(entry)).join(':');
  }
  env.HOME = tmpdir();
  return env;
}

function git(repo, args, encoding = 'utf8') {
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd: repo,
      env: minimalEnv(),
      encoding,
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { error, status: null, stdout: encoding === null ? Buffer.alloc(0) : '', stderr: '' };
  }
}

function fixtureGit(repo, args) {
  const result = git(repo, args);
  if (result.error || result.status !== 0) {
    const detail = String(result.stderr ?? '').trim().split('\n').slice(-2).join(' ');
    throw new Error(`fixture git failed (${args[0] ?? 'command'}): ${result.error?.message ?? detail}`);
  }
  return String(result.stdout ?? '').trim();
}

function isWithin(root, target) {
  const rel = relative(root, target);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
    && !isAbsolute(rel);
}

function cleanRelativePath(value, { allowTrailingSlash = false } = {}) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 4096) return false;
  if (value.startsWith('/') || value.includes('\\') || /[\0-\x1f\x7f]/.test(value)) return false;
  if (value.endsWith('/') && !allowTrailingSlash) return false;
  const pieces = value.split('/');
  if (pieces.some((piece, index) => piece === '.' || piece === '..' || (piece === '' && index !== pieces.length - 1))) {
    return false;
  }
  return true;
}

function globToRegExp(glob) {
  if (!cleanRelativePath(glob, { allowTrailingSlash: true })) {
    throw new Error('path must be clean and repository-relative');
  }
  const pattern = glob.endsWith('/') ? `${glob}**` : glob;
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        while (pattern[index + 1] === '*') index += 1;
        if (pattern[index + 1] === '/') {
          index += 1;
          source += '(?:[^/]+/)*';
        } else {
          source += '.*';
        }
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else if (char === '[') {
      const close = pattern.indexOf(']', index + 1);
      if (close < 0) {
        source += '\\[';
        continue;
      }
      let contents = pattern.slice(index + 1, close);
      const negate = contents.startsWith('!');
      if (negate) contents = contents.slice(1);
      if (contents.length === 0 || /[\\/\[\]]/.test(contents)) {
        throw new Error('invalid character class');
      }
      contents = contents.replaceAll('^', '\\^');
      source += negate ? `(?=[^/])[^${contents}]` : `(?=[^/])[${contents}]`;
      index = close;
    } else {
      source += /[\\^$.*+?()[\]{}|]/.test(char) ? `\\${char}` : char;
    }
  }
  source += '$';
  return new RegExp(source);
}

function decodeGitQuotedPath(text) {
  if (!text.startsWith('"')) return text;
  let decoded = '';
  let index = 1;
  while (index < text.length) {
    const char = text[index];
    if (char === '"') {
      if (index !== text.length - 1) throw new CouldNotEvaluate('lane_status_invalid', 'unexpected text after quoted path');
      return decoded;
    }
    if (char !== '\\') {
      decoded += char;
      index += 1;
      continue;
    }
    index += 1;
    if (index >= text.length) throw new CouldNotEvaluate('lane_status_invalid', 'truncated quoted path escape');
    const escaped = text[index];
    const simple = { a: '\x07', b: '\b', t: '\t', n: '\n', v: '\x0b', f: '\f', r: '\r', '\\': '\\', '"': '"' };
    if (Object.hasOwn(simple, escaped)) {
      decoded += simple[escaped];
      index += 1;
    } else if (/[0-7]/.test(escaped)) {
      const octal = /^[0-7]{1,3}/.exec(text.slice(index))[0];
      decoded += String.fromCharCode(Number.parseInt(octal, 8));
      index += octal.length;
    } else {
      throw new CouldNotEvaluate('lane_status_invalid', 'unknown quoted path escape');
    }
  }
  throw new CouldNotEvaluate('lane_status_invalid', 'unterminated quoted path');
}

function parseLaneStatus(snapshot) {
  let lines;
  if (typeof snapshot === 'string') lines = snapshot.split('\n');
  else if (Array.isArray(snapshot) && snapshot.every((line) => typeof line === 'string' && !line.includes('\n'))) lines = snapshot;
  else throw new CouldNotEvaluate('lane_status_invalid', 'status snapshot must be text or an array of porcelain lines');

  const records = [];
  for (const rawLine of lines) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    if (line.length === 0) continue;
    if (!/^[ MADRCU?!]{2} /.test(line)) {
      throw new CouldNotEvaluate('lane_status_invalid', 'status snapshot is not porcelain v1');
    }
    const status = line.slice(0, 2);
    const value = decodeGitQuotedPath(line.slice(3));
    let paths = [value];
    if (/[RC]/.test(status)) {
      const delimiter = ' -> ';
      const splitAt = value.indexOf(delimiter);
      if (splitAt < 0 || splitAt !== value.lastIndexOf(delimiter)) {
        throw new CouldNotEvaluate('lane_status_invalid', 'rename/copy status has ambiguous path fields');
      }
      paths = [value.slice(0, splitAt), value.slice(splitAt + delimiter.length)];
    }
    records.push({ status, paths });
  }
  return records;
}

function statusRecordKey(record) {
  return JSON.stringify([record.status, record.paths]);
}

function lanePathAllowed(value) {
  if (!cleanRelativePath(value, { allowTrailingSlash: true })) return false;
  return value === LANE_ALLOWED_ROOT || value.startsWith(LANE_ALLOWED_PREFIX);
}

function compareLaneStatuses(before, after) {
  const left = parseLaneStatus(before);
  const right = parseLaneStatus(after);
  const leftCounts = new Map();
  const rightCounts = new Map();
  const records = new Map();
  for (const record of left) {
    const key = statusRecordKey(record);
    leftCounts.set(key, (leftCounts.get(key) ?? 0) + 1);
    records.set(key, record);
  }
  for (const record of right) {
    const key = statusRecordKey(record);
    rightCounts.set(key, (rightCounts.get(key) ?? 0) + 1);
    records.set(key, record);
  }
  const drift = [];
  for (const key of new Set([...leftCounts.keys(), ...rightCounts.keys()])) {
    const countDelta = Math.abs((leftCounts.get(key) ?? 0) - (rightCounts.get(key) ?? 0));
    if (countDelta === 0) continue;
    const record = records.get(key);
    const outsidePaths = record.paths.filter((path) => !lanePathAllowed(path));
    if (outsidePaths.length > 0) drift.push(...outsidePaths);
  }
  return [...new Set(drift)].sort();
}

function addFinding(findings, entry, code, detail) {
  findings.push({ entry, code, detail });
}

function requireLedgerShape(ledger) {
  if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) {
    throw new CouldNotEvaluate('ledger_schema_invalid', 'ledger root must be an object');
  }
  if (ledger.schema !== LEDGER_SCHEMA) {
    throw new CouldNotEvaluate('ledger_schema_invalid', `expected schema ${LEDGER_SCHEMA}`);
  }
  if (!Array.isArray(ledger.entries) || ledger.entries.length === 0) {
    throw new CouldNotEvaluate('ledger_schema_invalid', 'entries must be a non-empty array');
  }
  for (let index = 0; index < ledger.entries.length; index += 1) {
    const entry = ledger.entries[index];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new CouldNotEvaluate('ledger_schema_invalid', `entries[${index}] must be an object`);
    }
    for (const field of ['seat', 'clone', 'branch', 'base', 'commit']) {
      if (typeof entry[field] !== 'string' || entry[field].length === 0) {
        throw new CouldNotEvaluate('ledger_schema_invalid', `entries[${index}].${field} must be a non-empty string`);
      }
    }
    for (const field of ['assignedPaths', 'changedPaths']) {
      if (!Array.isArray(entry[field]) || entry[field].some((value) => typeof value !== 'string')) {
        throw new CouldNotEvaluate('ledger_schema_invalid', `entries[${index}].${field} must be an array of strings`);
      }
    }
  }
  if (!Object.hasOwn(ledger, 'laneStatusBefore') || !Object.hasOwn(ledger, 'laneStatusAfter')) {
    throw new CouldNotEvaluate('ledger_schema_invalid', 'lane status snapshots are required');
  }
}

function gitText(repo, args, code, detail) {
  const result = git(repo, args);
  if (result.error || result.status !== 0) {
    throw new CouldNotEvaluate(code, `${detail}: ${result.error?.message ?? String(result.stderr ?? '').trim()}`);
  }
  return String(result.stdout ?? '').trim();
}

function gitObjectType(repo, objectId) {
  const result = git(repo, ['cat-file', '-t', objectId]);
  if (result.error) throw new CouldNotEvaluate('git_unavailable', result.error.message);
  if (result.status !== 0) return null;
  return String(result.stdout ?? '').trim();
}

function decodeNameOnly(buffer) {
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new CouldNotEvaluate('diff_path_encoding', 'git diff returned a non-UTF-8 path');
  }
  if (decoded.length === 0) return [];
  if (!decoded.endsWith('\0')) throw new CouldNotEvaluate('diff_output_invalid', 'git diff -z output lacks final NUL');
  return decoded.slice(0, -1).split('\0');
}

function evaluateLedger(ledger) {
  requireLedgerShape(ledger);
  const findings = [];
  const incomplete = [];
  let scratchRoot;
  try {
    scratchRoot = realpathSync(SCRATCH_ROOT);
  } catch (error) {
    throw new CouldNotEvaluate('scratch_root_unavailable', error.message);
  }

  const cloneNames = new Map();
  const realClones = new Map();
  const branches = new Map();
  const compiledAssignments = [];
  const entryPaths = [];

  for (let index = 0; index < ledger.entries.length; index += 1) {
    const entry = ledger.entries[index];
    const lexicalPath = isAbsolute(entry.clone) ? resolve(entry.clone) : null;
    entryPaths.push(lexicalPath);
    if (lexicalPath === null) {
      addFinding(findings, index, 'clone_path_invalid', 'clone path must be absolute');
    } else {
      const previous = cloneNames.get(lexicalPath);
      if (previous !== undefined) addFinding(findings, index, 'clone_not_unique', `same clone path as entry ${previous}`);
      else cloneNames.set(lexicalPath, index);
      if (!isWithin(scratchRoot, lexicalPath)) {
        addFinding(findings, index, 'clone_outside_scratch', `clone is not below ${SCRATCH_ROOT}`);
      }
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(entry.seat) || entry.branch !== `r19/${entry.seat}`) {
      addFinding(findings, index, 'branch_invalid', 'branch must be exactly r19/<seat>');
    }
    const previousBranch = branches.get(entry.branch);
    if (previousBranch !== undefined) addFinding(findings, index, 'branch_not_unique', `same branch as entry ${previousBranch}`);
    else branches.set(entry.branch, index);
    if (entry.base !== BASELINE) addFinding(findings, index, 'base_mismatch', `base must equal ${BASELINE}`);

    const patterns = [];
    for (const assignedPath of entry.assignedPaths) {
      try {
        patterns.push(globToRegExp(assignedPath));
      } catch (error) {
        addFinding(findings, index, 'assigned_glob_invalid', String(error.message));
      }
    }
    compiledAssignments.push(patterns);
    for (const changedPath of entry.changedPaths) {
      if (!cleanRelativePath(changedPath)) addFinding(findings, index, 'changed_path_invalid', 'changed path must be clean and repository-relative');
    }
  }

  const resolvedEntries = [];
  for (let index = 0; index < ledger.entries.length; index += 1) {
    const lexicalPath = entryPaths[index];
    if (lexicalPath === null || !isWithin(scratchRoot, lexicalPath)) continue;
    let clonePath;
    try {
      clonePath = realpathSync(lexicalPath);
    } catch (error) {
      incomplete.push({ entry: index, code: 'clone_unavailable', detail: error.message });
      continue;
    }
    if (!isWithin(scratchRoot, clonePath)) {
      addFinding(findings, index, 'clone_outside_scratch', `resolved clone is not below ${SCRATCH_ROOT}`);
      continue;
    }
    const priorResolved = realClones.get(clonePath);
    if (priorResolved !== undefined) addFinding(findings, index, 'clone_not_unique', `resolves to same clone as entry ${priorResolved}`);
    else realClones.set(clonePath, index);

    let top;
    try {
      top = gitText(clonePath, ['rev-parse', '--show-toplevel'], 'clone_not_repository', 'cannot identify clone root');
    } catch (error) {
      incomplete.push({ entry: index, code: error.code, detail: error.message });
      continue;
    }
    let canonicalTop;
    try {
      canonicalTop = realpathSync(top);
    } catch (error) {
      incomplete.push({ entry: index, code: 'clone_root_unavailable', detail: error.message });
      continue;
    }
    if (canonicalTop !== clonePath) {
      addFinding(findings, index, 'clone_path_not_root', 'clone path must name the repository root');
      continue;
    }

    const baseType = gitObjectType(clonePath, BASELINE);
    if (baseType !== 'commit') {
      incomplete.push({ entry: index, code: 'base_unavailable', detail: `baseline ${BASELINE} is not available as a commit` });
      continue;
    }
    const commit = ledger.entries[index].commit;
    if (!/^[0-9a-f]{40}$/.test(commit)) {
      addFinding(findings, index, 'commit_invalid', 'commit must be a full 40-character lowercase object id');
      resolvedEntries.push({ index, clonePath, actualPaths: null });
      continue;
    }
    const commitType = gitObjectType(clonePath, commit);
    if (commitType === null) {
      addFinding(findings, index, 'commit_missing', 'commit object is absent from the clone');
      resolvedEntries.push({ index, clonePath, actualPaths: null });
      continue;
    }
    if (commitType !== 'commit') {
      addFinding(findings, index, 'commit_not_commit', `object exists but is ${commitType}, not a commit`);
      resolvedEntries.push({ index, clonePath, actualPaths: null });
      continue;
    }

    const diff = git(clonePath, ['diff', '--no-ext-diff', '--find-renames', '--name-only', '-z', BASELINE, commit, '--'], null);
    if (diff.error || diff.status !== 0) {
      incomplete.push({ entry: index, code: 'diff_unavailable', detail: diff.error?.message ?? String(diff.stderr ?? '').trim() });
      continue;
    }
    let actualPaths;
    try {
      actualPaths = decodeNameOnly(diff.stdout);
    } catch (error) {
      incomplete.push({ entry: index, code: error.code, detail: error.message });
      continue;
    }
    resolvedEntries.push({ index, clonePath, actualPaths });
  }

  for (const resolvedEntry of resolvedEntries) {
    const { index, actualPaths } = resolvedEntry;
    if (actualPaths === null) continue;
    const recorded = ledger.entries[index].changedPaths;
    const actualSorted = [...actualPaths].sort();
    const recordedSorted = [...recorded].sort();
    if (new Set(actualPaths).size !== actualPaths.length || new Set(recorded).size !== recorded.length
      || JSON.stringify(actualSorted) !== JSON.stringify(recordedSorted)) {
      addFinding(findings, index, 'changed_paths_mismatch', 'changedPaths does not equal git diff --name-only base commit');
    }
    for (const changedPath of actualPaths) {
      if (!cleanRelativePath(changedPath)) {
        addFinding(findings, index, 'changed_path_invalid', 'git diff returned a path outside the supported repository-relative form');
      } else if (!compiledAssignments[index].some((pattern) => pattern.test(changedPath))) {
        addFinding(findings, index, 'changed_path_unassigned', `changed path is outside assignedPaths: ${JSON.stringify(changedPath)}`);
      }
    }
  }

  let laneDrift;
  try {
    laneDrift = compareLaneStatuses(ledger.laneStatusBefore, ledger.laneStatusAfter);
  } catch (error) {
    if (error instanceof CouldNotEvaluate) throw error;
    throw new CouldNotEvaluate('lane_status_invalid', error.message);
  }
  if (laneDrift.length > 0) {
    addFinding(findings, null, 'lane_status_drift', `changed status paths outside ${LANE_ALLOWED_ROOT}: ${laneDrift.map((path) => JSON.stringify(path)).join(', ')}`);
  }

  findings.sort((left, right) => (left.entry ?? -1) - (right.entry ?? -1) || left.code.localeCompare(right.code));
  if (incomplete.length > 0) {
    return {
      schema: RESULT_SCHEMA,
      verdict: 'could-not-evaluate',
      entries: ledger.entries.length,
      findings,
      errors: incomplete,
    };
  }
  return {
    schema: RESULT_SCHEMA,
    verdict: findings.length === 0 ? 'clean' : 'failed',
    entries: ledger.entries.length,
    findings,
    errors: [],
  };
}

function emitCouldNotEvaluate(code, detail) {
  return {
    schema: RESULT_SCHEMA,
    verdict: 'could-not-evaluate',
    entries: null,
    findings: [],
    errors: [{ code, detail: String(detail) }],
  };
}

function readLedger(ledgerPath) {
  let source;
  try {
    source = readFileSync(ledgerPath, 'utf8');
  } catch (error) {
    throw new CouldNotEvaluate('ledger_unreadable', error.message);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new CouldNotEvaluate('ledger_json_invalid', error.message);
  }
}

function selfTestLedger(entries, laneStatusBefore = '?? .ufo/waves/round-19/', laneStatusAfter = laneStatusBefore) {
  return { schema: LEDGER_SCHEMA, entries, laneStatusBefore, laneStatusAfter };
}

function testEntry(clone, seat) {
  const changedPath = '.ufo/waves/round-19/isolation/selftest.txt';
  return {
    seat,
    clone,
    branch: `r19/${seat}`,
    base: BASELINE,
    commit: null,
    assignedPaths: ['.ufo/waves/round-19/isolation/**/*.txt'],
    changedPaths: [changedPath],
  };
}

function makeFixtureClone(source, destination, seat) {
  const cloneResult = spawnSync('git', [...GIT_PREFIX, 'clone', '--shared', '--quiet', source, destination], {
    env: minimalEnv(),
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  if (cloneResult.error || cloneResult.status !== 0) {
    throw new Error(`fixture clone failed: ${cloneResult.error?.message ?? String(cloneResult.stderr ?? '').trim()}`);
  }
  fixtureGit(destination, ['switch', '--quiet', '-c', `r19/${seat}`, BASELINE]);
  const path = join(destination, '.ufo/waves/round-19/isolation/selftest.txt');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, 'temporary isolation fixture\n');
  fixtureGit(destination, ['add', '--', '.ufo/waves/round-19/isolation/selftest.txt']);
  fixtureGit(destination, [
    '-c', 'user.name=TabiIsolationFixture',
    '-c', 'user.email=tabi-isolation-fixture@example.invalid',
    'commit', '--quiet', '--no-verify', '-m', 'temporary isolation fixture',
  ]);
  return fixtureGit(destination, ['rev-parse', 'HEAD']);
}

function runSelfTest() {
  let tempRoot;
  const receiptPath = join(REPO_ROOT, RECEIPT_RELATIVE_PATH);
  const cases = [];
  const startedAt = new Date().toISOString();
  try {
    mkdirSync(SCRATCH_ROOT, { recursive: true });
    const source = realpathSync(REPO_ROOT);
    tempRoot = mkdtempSync(join(SCRATCH_ROOT, '.isolation-selftest-'));
    const cloneA = join(tempRoot, 'clone-a');
    const cloneB = join(tempRoot, 'clone-b');
    const commitA = makeFixtureClone(source, cloneA, 'IsolationA');
    const commitB = makeFixtureClone(source, cloneB, 'IsolationB');
    const entryA = testEntry(cloneA, 'IsolationA');
    entryA.commit = commitA;
    const entryB = testEntry(cloneB, 'IsolationB');
    entryB.commit = commitB;

    const testCases = [
      {
        name: 'clean_glob_assigned_clone',
        expected: 'clean',
        ledger: selfTestLedger([entryA]),
      },
      {
        name: 'shared_clone_path',
        expected: 'clone_not_unique',
        ledger: selfTestLedger([entryA, { ...entryB, clone: cloneA }]),
      },
      {
        name: 'base_drift',
        expected: 'base_mismatch',
        ledger: selfTestLedger([{ ...entryA, base: '1111111111111111111111111111111111111111' }]),
      },
      {
        name: 'out_of_scope_changed_path',
        expected: 'changed_path_unassigned',
        ledger: selfTestLedger([{ ...entryA, assignedPaths: ['scripts/allowed.mjs'] }]),
      },
      {
        name: 'missing_commit',
        expected: 'commit_missing',
        ledger: selfTestLedger([{ ...entryA, commit: '0000000000000000000000000000000000000000' }]),
      },
      {
        name: 'lane_drift_outside_round19',
        expected: 'lane_status_drift',
        ledger: selfTestLedger([entryA], '?? .ufo/waves/round-19/', '?? .ufo/waves/round-19/\n M README.md'),
      },
      {
        name: 'duplicate_branch',
        expected: 'branch_not_unique',
        ledger: selfTestLedger([entryA, { ...entryB, seat: 'IsolationA', branch: 'r19/IsolationA' }]),
      },
    ];

    for (const test of testCases) {
      const observed = evaluateLedger(test.ledger);
      const pass = test.expected === 'clean'
        ? observed.verdict === 'clean'
        : observed.verdict === 'failed' && observed.findings.some((finding) => finding.code === test.expected);
      cases.push({
        name: test.name,
        expected: test.expected,
        observed: observed.verdict,
        findingCodes: [...new Set(observed.findings.map((finding) => finding.code))].sort(),
        pass,
      });
    }
  } finally {
    if (tempRoot && existsSync(tempRoot)) rmSync(tempRoot, { recursive: true, force: true });
  }

  const allPass = cases.length === 7 && cases.every((test) => test.pass);
  const producerSha256 = createHash('sha256').update(readFileSync(SCRIPT)).digest('hex');
  const receipt = {
    schema: SELFTEST_SCHEMA,
    producer: '.ufo/waves/round-19/isolation/check-isolation.mjs',
    producerSha256,
    baseline: BASELINE,
    startedAt,
    completedAt: new Date().toISOString(),
    verdict: allPass ? 'clean' : 'failed',
    exit: allPass ? 0 : 1,
    cases,
  };
  mkdirSync(dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ selfTest: allPass ? 'pass' : 'fail', cases: cases.length, negativeShapes: cases.filter((test) => test.expected !== 'clean').length, receipt: RECEIPT_RELATIVE_PATH })}\n`);
  return allPass ? 0 : 1;
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--self-test') {
    try {
      return runSelfTest();
    } catch (error) {
      const detail = error instanceof CouldNotEvaluate ? error.message : error.stack ?? error.message;
      process.stdout.write(`${JSON.stringify(emitCouldNotEvaluate(error.code ?? 'selftest_unavailable', detail))}\n`);
      return 2;
    }
  }
  if (argv.length !== 0) {
    process.stdout.write(`${JSON.stringify(emitCouldNotEvaluate('usage', 'Use no arguments or --self-test'))}\n`);
    return 2;
  }
  let result;
  try {
    const ledgerPath = join(REPO_ROOT, LEDGER_RELATIVE_PATH);
    result = evaluateLedger(readLedger(ledgerPath));
  } catch (error) {
    result = error instanceof CouldNotEvaluate
      ? emitCouldNotEvaluate(error.code, error.message)
      : emitCouldNotEvaluate('unexpected_error', error.stack ?? error.message);
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  return result.verdict === 'clean' ? 0 : result.verdict === 'failed' ? 1 : 2;
}

process.exitCode = main(process.argv.slice(2));
