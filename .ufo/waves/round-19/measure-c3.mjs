#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextDecoder } from 'node:util';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT), '../../..');
const BASELINE = '66251bfc1aef393e4aec599e950a8deb867736bb';
const QUALITY_PATH = 'corpus/QUALITY.md';
const LOG_PATH = 'LOG.md';
const SCORECARD_PATH = 'SCORECARD.md';
const ROUND19_PREFIX = '.ufo/waves/round-19';
const REGISTRY_NOTE = `${ROUND19_PREFIX}/corrections/r18-registry-wave-null.md`;
const LEDGER_PATH = `${ROUND19_PREFIX}/isolation/ledger.json`;
const ISOLATION_CHECKER = `${ROUND19_PREFIX}/isolation/check-isolation.mjs`;
const PRODUCER_PATH = `${ROUND19_PREFIX}/measure-c3.mjs`;
const SELFTEST_RECEIPT = 'corpus/evidence/round-19/selftests/c3.json';
const utf8 = new TextDecoder('utf-8', { fatal: true });
const GIT_PREFIX = [
  '--no-replace-objects',
  '-c', 'core.fsmonitor=false',
  '-c', 'core.quotepath=false',
  '-c', 'core.commitGraph=false',
  '-c', 'core.hooksPath=/dev/null',
];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function gitEnv(extra = {}) {
  return {
    PATH: '/usr/bin:/bin',
    HOME: '/tmp',
    TMPDIR: '/tmp',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    GIT_TERMINAL_PROMPT: '0',
    ...extra,
  };
}

function git(repo, args, options = {}) {
  const result = spawnSync('git', [...GIT_PREFIX, '-C', repo, ...args], {
    encoding: null,
    env: gitEnv(),
    maxBuffer: 32 * 1024 * 1024,
    timeout: 30_000,
    windowsHide: true,
  });
  if (result.error) throw new Error(`git ${args[0]}: ${result.error.message}`);
  if (result.status !== 0 && !options.allowFailure) {
    const detail = (result.stderr ?? Buffer.alloc(0)).toString('utf8').trim();
    throw new Error(`git ${args[0]} exited ${result.status}: ${detail || 'no diagnostic'}`);
  }
  return result;
}

function resolveCommit(repo, input) {
  if (typeof input !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/~^@{}-]*$/.test(input)) {
    throw new Error('revision_unresolved');
  }
  const result = git(repo, ['rev-parse', '--verify', '--end-of-options', `${input}^{commit}`]);
  const resolved = result.stdout.toString('utf8').trim();
  if (!/^[0-9a-f]{40}$/.test(resolved)) throw new Error('revision_unresolved');
  return resolved;
}

function blobAt(repo, rev, path) {
  const result = git(repo, ['cat-file', 'blob', `${rev}:${path}`], { allowFailure: true });
  if (result.status !== 0) return null;
  try {
    return utf8.decode(result.stdout);
  } catch {
    return null;
  }
}

function treePaths(repo, rev, path) {
  const result = git(repo, ['ls-tree', '-r', '-z', '--name-only', rev, '--', path]);
  return result.stdout.toString('utf8').split('\0').filter(Boolean);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseJson(text) {
  if (typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function checkD1(log, quality) {
  const correction = typeof log === 'string' && log.split(/\r?\n/).some((line) =>
    /\bround[ -]?19\b/i.test(line)
      && /LOG\.md:1059/.test(line)
      && /\bQUALITY\b.{0,32}33\s*[\u2010-\u2015-]\s*39/i.test(line)
      && /\b(?:seven|7)\b/i.test(line)
      && !/\b(?:six|6)\s+criteria\b/i.test(line));

  const matches = typeof quality === 'string'
    ? [...quality.matchAll(/^(\d+)\.\s+/gm)]
    : [];
  const criteria = matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? quality.length;
    return {
      number: Number(match[1]),
      citesRound18: /round-18\.md/i.test(quality.slice(start, end)),
    };
  });
  const counted = criteria.filter((item) => item.number >= 33 && item.number <= 39 && item.citesRound18);
  const perNumber = new Map();
  for (const item of counted) perNumber.set(item.number, (perNumber.get(item.number) ?? 0) + 1);
  const complete = counted.length === 7
    && [33, 34, 35, 36, 37, 38, 39].every((number) => perNumber.get(number) === 1);
  const pass = correction && complete;
  const reason = pass
    ? 'correction_line_and_7_criteria_rederived'
    : [
      !correction ? 'correction_line_missing' : null,
      !complete ? `criteria_count_${counted.length}_expected_7` : null,
    ].filter(Boolean).join(';');
  return { pass, reason, criteriaCount: counted.length, correctionLine: correction };
}

// The case-id association is parsed from harness blocks; the predicate tests use the exact
// ScoutAssertionDelta patterns, applied only to each block's `predicate` expression.
// The last pattern intentionally includes the nonempty-message exception the scout found.
const NUMERIC_PROTOCOL_CODE = /o\.(?:invoke|second|negative)\.error\.code === -(?:32602|32000|32601)/;
const MESSAGE_ASSERTION = /(?:\/Tool not found\/i\.test\(o\.(?:invoke|second|negative)\.error\.message\)|\/domain is not enabled\/i\.test\(o\.invoke\.error\.message\)|o\.invoke\.error\.message\.length > 0)/;
const MESSAGE_NONEMPTY = /o\.invoke\.error\.message\.length > 0/;

function predicateBlocks(source) {
  if (typeof source !== 'string') return { byId: new Map(), duplicates: [] };
  const starts = [...source.matchAll(/^\s*await\s+with(?:Case|Control)\s*\(\s*\{/gm)];
  const byId = new Map();
  const duplicates = [];
  for (let index = 0; index < starts.length; index += 1) {
    const block = source.slice(starts[index].index, starts[index + 1]?.index ?? source.length);
    const id = /\bid\s*:\s*(['"])([^'"\r\n]+)\1/.exec(block)?.[2];
    const predicate = /\bpredicate\s*:\s*/.exec(block);
    if (!id || !predicate) continue;
    const remainder = block.slice(predicate.index + predicate[0].length);
    const boundary = /\r?\n\s*(?:expected|expectedProvenance|observations|body)\s*:/m.exec(remainder);
    const expression = boundary ? remainder.slice(0, boundary.index) : remainder;
    if (byId.has(id)) duplicates.push(id);
    else byId.set(id, expression);
  }
  return { byId, duplicates };
}

function deriveAssertionDelta(round17, round18) {
  const oldPredicates = predicateBlocks(round17);
  const newPredicates = predicateBlocks(round18);
  const ids = [];
  const messageSubstrings = [];
  const messageNonempty = [];
  for (const [id, oldPredicate] of oldPredicates.byId) {
    const newPredicate = newPredicates.byId.get(id);
    if (!NUMERIC_PROTOCOL_CODE.test(oldPredicate) || !newPredicate) continue;
    if (NUMERIC_PROTOCOL_CODE.test(newPredicate) || !MESSAGE_ASSERTION.test(newPredicate)) continue;
    ids.push(id);
    if (MESSAGE_NONEMPTY.test(newPredicate)) messageNonempty.push(id);
    else messageSubstrings.push(id);
  }
  return {
    ids,
    messageSubstrings,
    messageNonempty,
    duplicateIds: [...oldPredicates.duplicates, ...newPredicates.duplicates],
  };
}

function sameIdSet(actual, expected) {
  return actual.length === expected.length
    && new Set(actual).size === actual.length
    && [...actual].sort().join('\n') === [...expected].sort().join('\n');
}

function checkD2(scorecard, round17, round18) {
  const derivation = deriveAssertionDelta(round17, round18);
  const lines = typeof scorecard === 'string'
    ? scorecard.split(/\r?\n/).filter((line) =>
      /\bround[ -]?19\b/i.test(line)
        && /SCORECARD\.md:830/.test(line)
        && /IDs and pass status retained/i.test(line))
    : [];
  const lineFacts = lines.map((line) => {
    const substringClaim = /\b(?:5|five)\s+now\s+assert\s+message\s+substrings\b/i.exec(line);
    const nonemptyClaim = /\binvoke-domain-disabled\s+only\s+a\s+nonempty\s+message\b/i.exec(line);
    const substringText = substringClaim && nonemptyClaim && nonemptyClaim.index > substringClaim.index
      ? line.slice(substringClaim.index, nonemptyClaim.index)
      : '';
    return {
      ids: line.match(/\binvoke-[a-z0-9-]+\b/g) ?? [],
      substringIds: substringText.match(/\binvoke-[a-z0-9-]+\b/g) ?? [],
      sixOfFifteen: /6\s+of\s+15\s+checks\s+dropped\s+numeric\s+CDP\s+codes/i.test(line),
      substringClaim: substringClaim !== null,
      nonemptyClaim: nonemptyClaim !== null,
    };
  });
  const facts = lineFacts.length === 1 ? lineFacts[0] : null;
  const idsMatch = facts !== null && sameIdSet(facts.ids, derivation.ids);
  const substringIdsMatch = facts !== null && sameIdSet(facts.substringIds, derivation.messageSubstrings);
  const splitMatches = derivation.ids.length === 6
    && derivation.messageSubstrings.length === 5
    && derivation.messageNonempty.length === 1
    && derivation.messageNonempty[0] === 'invoke-domain-disabled';
  const pass = lines.length === 1
    && derivation.duplicateIds.length === 0
    && splitMatches
    && facts.sixOfFifteen
    && facts.substringClaim
    && facts.nonemptyClaim
    && idsMatch
    && substringIdsMatch;
  const derivedDetails = `derived_ids=${derivation.ids.join(',') || 'none'}`
    + `;message_substring_ids=${derivation.messageSubstrings.join(',') || 'none'}`
    + `;message_nonempty=${derivation.messageNonempty.join(',') || 'none'}`;
  const reason = pass
    ? `correction_line_and_5_plus_1_ids_match;${derivedDetails}`
    : [
      lines.length !== 1 ? 'correction_line_missing_or_ambiguous' : null,
      derivation.duplicateIds.length ? 'duplicate_harness_ids' : null,
      !splitMatches ? 'derived_split_not_5_plus_1' : null,
      facts && !facts.sixOfFifteen ? 'reported_count_not_6_of_15' : null,
      facts && !facts.substringClaim ? 'substring_claim_missing' : null,
      facts && !facts.nonemptyClaim ? 'nonempty_exception_missing' : null,
      !idsMatch ? 'listed_ids_do_not_match_derived_ids' : null,
      !substringIdsMatch ? 'substring_ids_do_not_match_derived_ids' : null,
      derivedDetails,
    ].filter(Boolean).join(';');
  return {
    pass,
    reason,
    derivedIds: derivation.ids,
    messageSubstringIds: derivation.messageSubstrings,
    messageNonemptyIds: derivation.messageNonempty,
    listedIds: facts?.ids ?? [],
    listedSubstringIds: facts?.substringIds ?? [],
  };
}

function correctionNamesOldRegistries(note) {
  if (typeof note !== 'string') return false;
  const requiredPaths = [
    '.ufo/waves/round-18/w1/record.json',
    '.ufo/waves/round-18/w1/swarm-registry.json',
    '.ufo/waves/round-18/w2/record.json',
    '.ufo/waves/round-18/w2/swarm-registry.json',
  ];
  const namesAll = requiredPaths.every((path) => note.includes(path));
  const cause = /dispatch(?:er)? output/i.test(note)
    && /embedded/i.test(note)
    && /registry object/i.test(note)
    && /(?:carries|has|contains|includes|without|no|missing|null|omits?).{0,40}\bwave\b/i.test(note)
    && /(?:file|registry file).{0,60}\bwritten\b.{0,40}\brun\b/i.test(note);
  return namesAll && cause;
}

function checkD3(registries, records, correctionNote) {
  const failures = [];
  if (!Array.isArray(registries) || registries.length === 0) failures.push('no_round19_registries');
  if (!Array.isArray(records) || records.length === 0) failures.push('no_round19_records');
  const checkMembers = (item, label) => {
    const document = parseJson(item.text);
    if (!isRecord(document)) {
      failures.push(`${item.path}:${label}_invalid`);
      return;
    }
    if (!isRecord(document.members) || Object.keys(document.members).length === 0) {
      failures.push(`${item.path}:members_invalid`);
      return;
    }
    for (const [memberName, member] of Object.entries(document.members)) {
      if (!isRecord(member) || typeof member.agentId !== 'string' || member.agentId.trim().length === 0) {
        failures.push(`${item.path}:agent_id_missing:${memberName}`);
      }
    }
  };
  for (const item of registries ?? []) {
    const registry = parseJson(item.registryText);
    if (!registry) {
      failures.push(`${item.path}:registry_invalid`);
      continue;
    }
    checkMembers({ path: item.path, text: item.registryText }, 'registry');
    const spec = parseJson(item.specText);
    if (!spec) {
      failures.push(`${item.path}:spec_invalid`);
      continue;
    }
    if (typeof registry.wave !== 'string' || registry.wave.length === 0
      || typeof spec.wave !== 'string' || spec.wave.length === 0
      || registry.wave !== spec.wave) {
      failures.push(`${item.path}:wave_mismatch_or_null`);
    }
  }
  for (const item of records ?? []) checkMembers(item, 'record');
  if (!correctionNamesOldRegistries(correctionNote)) failures.push('r18_registry_correction_incomplete');
  return {
    pass: failures.length === 0,
    reason: failures.length === 0
      ? `registries_match=${registries.length};records_match=${records.length};r18_correction_names_all_four`
      : failures.join(';'),
  };
}

function checkerClean(result, expectedEntries) {
  if (!result || result.status !== 0) return false;
  const output = parseJson(String(result.stdout ?? '').trim());
  return isRecord(output)
    && output.schema === 'tabi-r19-isolation-check-v1'
    && output.verdict === 'clean'
    && output.entries === expectedEntries
    && Array.isArray(output.findings)
    && output.findings.length === 0
    && Array.isArray(output.errors)
    && output.errors.length === 0;
}

function checkD4(checkerText, ledgerText, checkerResult) {
  if (typeof checkerText !== 'string') return { pass: false, reason: 'checker_missing_at_revision' };
  if (typeof ledgerText !== 'string') return { pass: false, reason: 'ledger_missing_at_revision' };
  const ledger = parseJson(ledgerText);
  if (!isRecord(ledger) || ledger.schema !== 'tabi-r19-isolation-ledger-v1'
    || !Array.isArray(ledger.entries) || ledger.entries.length === 0) {
    return { pass: false, reason: 'ledger_schema_invalid' };
  }
  const isStatusSnapshot = (value) => typeof value === 'string'
    || (Array.isArray(value) && value.every((line) => typeof line === 'string' && !line.includes('\n')));
  if (!isStatusSnapshot(ledger.laneStatusBefore) || !isStatusSnapshot(ledger.laneStatusAfter)) {
    return { pass: false, reason: 'lane_status_snapshots_missing_or_invalid' };
  }
  if (/reconstruct/i.test(String(ledger.laneStatusAfterMethod ?? ''))
    || /reconstruct/i.test(String(ledger.trackedDiffMethod ?? ''))) {
    return { pass: false, reason: 'direct_return_snapshot_missing_reconstruction_is_not_observation' };
  }
  if (ledger.trackedDiffEmpty !== true) return { pass: false, reason: 'tracked_diff_not_empty' };
  if (!checkerResult || checkerResult.error || checkerResult.status === null || checkerResult.status === undefined) {
    return { pass: false, reason: 'checker_did_not_complete' };
  }
  if (!checkerClean(checkerResult, ledger.entries.length)) {
    return { pass: false, reason: `checker_not_clean_exit_${checkerResult.status}` };
  }
  return { pass: true, reason: `checker_verdict_clean_entries=${ledger.entries.length};tracked_diff_empty=true` };
}

function runIsolationChecker(checkerText, ledgerText) {
  const scratch = mkdtempSync(join('/tmp', 'tabi-r19-c3-isolation-'));
  try {
    const isolationDir = join(scratch, '.ufo', 'waves', 'round-19', 'isolation');
    mkdirSync(isolationDir, { recursive: true });
    const checkerPath = join(isolationDir, 'check-isolation.mjs');
    writeFileSync(checkerPath, checkerText, { encoding: 'utf8', mode: 0o600 });
    writeFileSync(join(isolationDir, 'ledger.json'), ledgerText, { encoding: 'utf8', mode: 0o600 });
    const home = join(scratch, 'home');
    mkdirSync(home, { recursive: true, mode: 0o700 });
    const result = spawnSync(process.execPath, [checkerPath], {
      cwd: scratch,
      encoding: 'utf8',
      env: gitEnv({ HOME: home, TMPDIR: scratch, XDG_CONFIG_HOME: join(home, '.config'), TZ: 'UTC' }),
      maxBuffer: 2 * 1024 * 1024,
      timeout: 45_000,
      windowsHide: true,
    });
    return {
      status: result.status,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      error: result.error ? String(result.error.message) : null,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function measure(repo, rev) {
  const actualRev = resolveCommit(repo, rev);
  const log = blobAt(repo, actualRev, LOG_PATH);
  const quality = blobAt(repo, actualRev, QUALITY_PATH);
  const d1 = checkD1(log, quality);

  const scorecard = blobAt(repo, actualRev, SCORECARD_PATH);
  const round17 = blobAt(repo, BASELINE, 'scripts/webmcp-invoke-round17.mjs');
  const round18 = blobAt(repo, BASELINE, 'scripts/webmcp-invoke-round18.mjs');
  const d2 = round17 === null || round18 === null
    ? { pass: false, reason: 'baseline_harness_blob_missing', derivedIds: [], listedIds: [] }
    : checkD2(scorecard, round17, round18);

  const paths = treePaths(repo, actualRev, ROUND19_PREFIX);
  const registryPaths = paths.filter((path) => /^\.ufo\/waves\/round-19\/[^/]+\/swarm-registry\.json$/.test(path));
  const recordPaths = paths.filter((path) => /^\.ufo\/waves\/round-19\/[^/]+\/record\.json$/.test(path));
  const registries = registryPaths.map((path) => ({
    path,
    registryText: blobAt(repo, actualRev, path),
    specText: blobAt(repo, actualRev, path.replace(/swarm-registry\.json$/, 'spec.json')),
  }));
  const records = recordPaths.map((path) => ({ path, text: blobAt(repo, actualRev, path) }));
  const correctionNote = blobAt(repo, actualRev, REGISTRY_NOTE);
  const d3 = checkD3(registries, records, correctionNote);

  const checkerText = blobAt(repo, actualRev, ISOLATION_CHECKER);
  const ledgerText = blobAt(repo, actualRev, LEDGER_PATH);
  let checkerResult = null;
  if (checkerText !== null && ledgerText !== null) checkerResult = runIsolationChecker(checkerText, ledgerText);
  const d4 = checkD4(checkerText, ledgerText, checkerResult);
  return {
    c3_routed_closed: [d1, d2, d3, d4].filter((item) => item.pass).length,
    d1: { pass: d1.pass, reason: d1.reason },
    d2: { pass: d2.pass, reason: d2.reason },
    d3: { pass: d3.pass, reason: d3.reason },
    d4: { pass: d4.pass, reason: d4.reason },
  };
}

function makeD1Fixture({ correction = 'LOG.md:1059; QUALITY 33–39 (seven)', omitCitation = null } = {}) {
  const criteria = [];
  for (let number = 33; number <= 39; number += 1) {
    const citation = number === omitCitation ? '' : ' (lesson: corpus/lessons/round-18.md#mistakes)';
    criteria.push(`${number}. Criterion ${number}.${citation}`);
  }
  return {
    log: `Round-19 correction: ${correction}`,
    quality: criteria.join('\n'),
  };
}

function makeHarnessFixture(ids) {
  const oldSource = [];
  const newSource = [];
  for (const id of ids) {
    const code = id === 'invoke-before-enable' ? -32000 : id === 'invoke-domain-disabled' ? -32601 : -32602;
    oldSource.push(`await withCase({\n id: '${id}',\n predicate: (o) => o.invoke.error.code === ${code},\n body: async () => {}\n});`);
    const newer = id === 'invoke-domain-disabled'
      ? 'o.invoke.error.message.length > 0'
      : id === 'invoke-before-enable'
        ? '/domain is not enabled/i.test(o.invoke.error.message)'
        : '/Tool not found/i.test(o.invoke.error.message)';
    newSource.push(`await withCase({\n id: '${id}',\n predicate: (o) => ${newer},\n body: async () => {}\n});`);
  }
  return { oldSource: oldSource.join('\n'), newSource: newSource.join('\n') };
}

function selfTest() {
  const cases = [];
  const record = (name, expected, actual) => {
    const pass = actual.pass === expected;
    cases.push({ name, pass, expected, actual: actual.pass, reason: actual.reason });
  };

  const d1Good = makeD1Fixture();
  record('d1_correction_and_seven', true, checkD1(d1Good.log, d1Good.quality));
  const d1Old = makeD1Fixture({ correction: 'LOG.md:1059; QUALITY 33–38' });
  record('d1_old_range_rejected', false, checkD1(d1Old.log, d1Old.quality));
  const d1WrongCount = makeD1Fixture({ correction: 'LOG.md:1059; QUALITY 33–39 (six criteria)' });
  record('d1_wrong_cardinality_rejected', false, checkD1(d1WrongCount.log, d1WrongCount.quality));
  const d1MissingCitation = makeD1Fixture({ omitCitation: 39 });
  record('d1_missing_round18_citation_rejected', false, checkD1(d1MissingCitation.log, d1MissingCitation.quality));

  const ids = [
    'invoke-unknown-tool',
    'invoke-after-unregister',
    'invoke-flags-off-control',
    'invoke-iframe-frameid',
    'invoke-before-enable',
    'invoke-domain-disabled',
  ];
  const substringIds = ids.filter((id) => id !== 'invoke-domain-disabled');
  const harness = makeHarnessFixture(ids);
  const delta = deriveAssertionDelta(harness.oldSource, harness.newSource);
  const derivedOk = sameIdSet(delta.ids, ids)
    && sameIdSet(delta.messageSubstrings, substringIds)
    && sameIdSet(delta.messageNonempty, ['invoke-domain-disabled']);
  record('d2_predicates_derive_five_plus_one', true, {
    pass: derivedOk,
    reason: `derived=${delta.ids.join(',')};substring=${delta.messageSubstrings.join(',')};nonempty=${delta.messageNonempty.join(',')}`,
  });
  const scoreLine = 'Round-19 correction: SCORECARD.md:830; IDs and pass status retained; '
    + `6 of 15 checks dropped numeric CDP codes: five now assert message substrings (${substringIds.join(', ')}); `
    + 'invoke-domain-disabled only a nonempty message';
  record('d2_exact_five_plus_one_accepted', true, checkD2(scoreLine, harness.oldSource, harness.newSource));
  const wrongScoreLine = 'Round-19 correction: SCORECARD.md:830; IDs and pass status retained; '
    + `6 of 15 checks dropped numeric CDP codes: five now assert message substrings (${substringIds.slice(0, 4).join(', ')}); `
    + 'invoke-domain-disabled only a nonempty message';
  record('d2_missing_substring_id_rejected', false, checkD2(wrongScoreLine, harness.oldSource, harness.newSource));
  record('d2_wrong_denominator_rejected', false, checkD2(
    scoreLine.replace('6 of 15 checks', '6 of 14 checks'), harness.oldSource, harness.newSource,
  ));
  const unchanged = makeHarnessFixture(ids);
  unchanged.newSource = unchanged.newSource.replace(/o\.invoke\.error\.message\.length > 0/, 'o.invoke.error.code === -32601');
  record('d2_numeric_predicate_retained_rejected', false, checkD2(scoreLine, unchanged.oldSource, unchanged.newSource));

  const note = 'Round-18 .ufo/waves/round-18/w1/record.json and .ufo/waves/round-18/w1/swarm-registry.json; '
    + '.ufo/waves/round-18/w2/record.json and .ufo/waves/round-18/w2/swarm-registry.json: '
    + 'dispatch output embedded registry object carries no wave; the file written by run does.';
  const registryText = '{"wave":"w1","members":{"A":{"agentId":"agent-a"}}}';
  const recordText = '{"members":{"A":{"agentId":"agent-a"}}}';
  const goodRegistries = [{
    path: '.ufo/waves/round-19/w1/swarm-registry.json',
    registryText,
    specText: '{"wave":"w1"}',
  }];
  const goodRecords = [{ path: '.ufo/waves/round-19/w1/record.json', text: recordText }];
  record('d3_matching_registry_agents_and_correction', true, checkD3(goodRegistries, goodRecords, note));
  record('d3_null_wave_rejected', false, checkD3([{
    ...goodRegistries[0],
    registryText: '{"wave":null,"members":{"A":{"agentId":"agent-a"}}}',
  }], goodRecords, note));
  record('d3_missing_record_rejected', false, checkD3(goodRegistries, [], note));
  record('d3_missing_registry_rejected', false, checkD3([], goodRecords, note));
  record('d3_registry_null_agent_id_rejected', false, checkD3([{
    ...goodRegistries[0],
    registryText: '{"wave":"w1","members":{"A":{"agentId":null}}}',
  }], goodRecords, note));
  record('d3_record_null_agent_id_rejected', false, checkD3(goodRegistries, [{
    path: '.ufo/waves/round-19/w1/record.json',
    text: '{"members":{"A":{"agentId":null}}}',
  }], note));
  const incompleteNote = note.replace('.ufo/waves/round-18/w2/record.json', 'other.json');
  record('d3_missing_one_r18_file_rejected', false, checkD3(goodRegistries, goodRecords, incompleteNote));

  const goodLedgerValue = {
    schema: 'tabi-r19-isolation-ledger-v1',
    entries: [{ seat: 'A' }],
    laneStatusBefore: '?? .ufo/waves/round-19/',
    laneStatusAfter: '?? .ufo/waves/round-19/',
    trackedDiffEmpty: true,
  };
  record('d4_reconstructed_snapshot_rejected', false, checkD4('export {};', JSON.stringify({
    ...goodLedgerValue,
    laneStatusAfterMethod: 'RECONSTRUCTED from mtimes, not observed at return',
  }), null));
  const goodLedger = JSON.stringify(goodLedgerValue);
  record('d4_clean_checker_accepted', true, checkD4('export {};', goodLedger, {
    status: 0, stdout: '{"schema":"tabi-r19-isolation-check-v1","verdict":"clean","entries":1,"findings":[],"errors":[]}', stderr: '', error: null,
  }));
  record('d4_checker_schema_and_empty_findings_required', false, checkD4('export {};', goodLedger, {
    status: 0, stdout: '{"schema":"wrong","verdict":"clean","entries":1,"findings":[],"errors":[]}', stderr: '', error: null,
  }));
  record('d4_tracked_diff_required', false, checkD4('export {};', JSON.stringify({
    ...goodLedgerValue,
    trackedDiffEmpty: false,
  }), null));
  record('d4_lane_snapshots_required', false, checkD4('export {};', JSON.stringify({
    ...goodLedgerValue,
    laneStatusBefore: null,
  }), null));
  const cleanScript = "process.stdout.write('{\"schema\":\"tabi-r19-isolation-check-v1\",\"verdict\":\"clean\",\"entries\":1,\"findings\":[],\"errors\":[]}\\n');\n";
  const cleanRun = runIsolationChecker(cleanScript, goodLedger);
  record('d4_checker_blob_execution', true, checkD4(cleanScript, goodLedger, cleanRun));
  const failedScript = "process.stdout.write('{\"verdict\":\"failed\"}\\n'); process.exitCode = 1;\n";
  const failedRun = runIsolationChecker(failedScript, goodLedger);
  record('d4_checker_failed_exit_rejected', false, checkD4(failedScript, goodLedger, failedRun));
  record('d4_nonzero_checker_rejected', false, checkD4('export {};', goodLedger, {
    status: 1, stdout: '{"verdict":"clean"}', stderr: '', error: null,
  }));
  record('d4_missing_checker_rejected', false, checkD4(null, goodLedger, null));
  record('d4_bad_ledger_schema_rejected', false, checkD4('export {};', '{"schema":"wrong","entries":[]}', null));

  const failed = cases.filter((item) => !item.pass);
  const verdict = failed.length === 0 ? 'clean' : 'failed';
  const stdout = `C3_SELFTEST verdict=${verdict} cases=${cases.length} failed=${failed.length}\n`;
  const stderr = failed.length === 0 ? '' : `${failed.map((item) => `${item.name}: ${item.reason}`).join('\n')}\n`;
  const receipt = {
    schema: 'tabi-r19-c3-selftest-v1',
    argv: [process.execPath, ...process.argv.slice(1)],
    exit: failed.length === 0 ? 0 : 1,
    stdout,
    stderr,
    stdoutSha256: sha256(Buffer.from(stdout, 'utf8')),
    stderrSha256: sha256(Buffer.from(stderr, 'utf8')),
    producer: {
      path: PRODUCER_PATH,
      sha256: sha256(readFileSync(SCRIPT)),
    },
    cases,
  };
  const receiptPath = join(ROOT, SELFTEST_RECEIPT);
  mkdirSync(dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', mode: 0o644 });
  process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
  process.exitCode = receipt.exit;
}

function usage() {
  return `Usage:\n  node ${PRODUCER_PATH} REV\n  node ${PRODUCER_PATH} --self-test`;
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--self-test') {
    selfTest();
    return;
  }
  if (argv.length !== 1 || argv[0].startsWith('--')) {
    process.stderr.write(`${usage()}\n`);
    process.exitCode = 2;
    return;
  }
  try {
    const result = measure(ROOT, argv[0]);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = 0; // An evaluated count, including zero, is not an admission verdict.
  } catch (error) {
    const reason = String(error?.message ?? error).replace(/[\r\n]+/g, ' ').slice(0, 240);
    const result = {
      c3_routed_closed: 0,
      d1: { pass: false, reason: `could_not_evaluate:${reason}` },
      d2: { pass: false, reason: `could_not_evaluate:${reason}` },
      d3: { pass: false, reason: `could_not_evaluate:${reason}` },
      d4: { pass: false, reason: `could_not_evaluate:${reason}` },
    };
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = 2;
  }
}

main(process.argv.slice(2));
