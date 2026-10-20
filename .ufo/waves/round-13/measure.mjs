#!/usr/bin/env node
// tabi round-13 C1/C2 counting probe.
//
// Revision-based: every byte is read from the named git revision. The probe
// never runs a gate, a browser, the census, or any test; it only counts
// committed evidence. Missing evidence counts 0. Malformed evidence or a
// digest mismatch fails closed: the affected count is 0 and the process exits
// 1 so a caller cannot quote a partial result as green.
//
// Usage:
//   node .ufo/waves/round-13/measure.mjs <revision>
//   node .ufo/waves/round-13/measure.mjs <revision> --claim C1
//   node .ufo/waves/round-13/measure.mjs <revision> --claim C2
//   node .ufo/waves/round-13/measure.mjs <revision> --histogram
//
// --claim C1 reads only gates.json; --claim C2 reads only the ARIA receipt and
// its note/index evidence. A malformed C1 receipt therefore cannot suppress an
// independent C2 count, and vice versa. --histogram reads only corpus/SOURCES.md
// at the revision. The full mode reports everything and exits 1 on any malformed
// receipt, but still reports the other claim's independently valid count.
//
// C1 receipt (parent-owned contract):
//   corpus/evidence/round-13/gates.json
//   { gates: [ { path, sha256,
//                selfTest: { exit, stdout },
//                witness: { before: { exit, stdout }, after: { exit, stdout } },
//                production: { exit, stdout } } ] }
//
// C2 receipt (AriaRunner-owned contract, additive deltas accepted):
//   corpus/evidence/round-13/aria/receipt.json
// plus corpus/knowledge/aria-loopback-round-13.md indexed in corpus/README.md,
// admitted in corpus/lessons/round-13.md, and every cited S-row mined and
// used-by that note in corpus/SOURCES.md.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const C1_RECEIPT = 'corpus/evidence/round-13/gates.json';
const C2_RECEIPT = 'corpus/evidence/round-13/aria/receipt.json';
const C2_NOTE = 'corpus/knowledge/aria-loopback-round-13.md';
const C2_LESSON = 'corpus/lessons/round-13.md';
const C2_SOURCES = 'corpus/SOURCES.md';
const C2_README = 'corpus/README.md';
const C2_RUNNER = 'scripts/aria-loopback-round13.mjs';
const C2_CONFIG = 'corpus/evidence/round-13/aria/playwright.config.mjs';
const C2_TEMPLATE_PREFIX = 'corpus/evidence/round-13/aria/templates/';
const C2_ACTUAL_PREFIX = 'corpus/evidence/round-13/aria/actual/';
const C2_EVIDENCE_PREFIX = 'corpus/evidence/round-13/aria/';
const C2_CHECKED_TEMPLATE = 'corpus/evidence/round-13/aria/templates/checkbox-checked-false.aria.yml';
const PLAYWRIGHT_PIN = '1.64.0';
const REQUIRED_NOTE_SOURCES = ['S023', 'S024'];

const CENSUS_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi';
const CENSUS_VALIDATE_COMMAND = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi';

const GATE_RULES = new Map([
  ['scripts/check-round-contract.mjs', { prefix: 'ROUND_CONTRACT', production: 'clean' }],
  ['scripts/check-user-round-contract.mjs', { prefix: 'USER_ROUND_CONTRACT', production: 'round_count' }],
]);

function git(args, encoding = 'utf8') {
  return spawnSync('git', args, { cwd: ROOT, encoding, maxBuffer: 64 * 1024 * 1024 });
}

function resolveRevision(argument) {
  if (!argument || argument.startsWith('-') || /\s/.test(argument)) {
    throw Object.assign(new Error('Usage: node .ufo/waves/round-13/measure.mjs REV'), { exit: 2 });
  }
  const result = git(['rev-parse', '--verify', `${argument}^{commit}`]);
  if (result.error || result.status !== 0) {
    throw Object.assign(new Error(`Cannot resolve revision: ${argument}`), { exit: 2 });
  }
  return result.stdout.trim();
}

function treeEntry(revision, path) {
  const result = git(['ls-tree', '-r', revision, '--', path]);
  if (result.error || result.status !== 0) return null;
  const line = result.stdout.split('\n').find(row => row.split('\t')[1] === path);
  if (!line) return null;
  return { mode: line.split(' ')[0] };
}

function fileAt(revision, path) {
  const entry = treeEntry(revision, path);
  if (!entry || (entry.mode !== '100644' && entry.mode !== '100755')) return null;
  const result = git(['show', `${revision}:${path}`], undefined);
  if (result.error || result.status !== 0) return null;
  return result.stdout;
}

function listAt(revision, prefix) {
  const result = git(['ls-tree', '-r', '--name-only', revision, '--', prefix]);
  if (result.error || result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function reader(revision) {
  return {
    revision,
    file: path => fileAt(revision, path),
    sha: path => {
      const bytes = fileAt(revision, path);
      return bytes ? sha256(bytes) : null;
    },
    list: prefix => listAt(revision, prefix),
  };
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.length > 0;
const isInt = value => Number.isInteger(value);
const isHex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isRelative = value => isText(value) && !value.startsWith('/') && !value.includes('\\') && !value.split('/').includes('..');
const safePath = (value, prefix) => isRelative(value) && value.startsWith(prefix);
const outputOf = stream => `${typeof stream.stdout === 'string' ? stream.stdout : ''}${typeof stream.stderr === 'string' ? stream.stderr : ''}`;

function committedDigest(read, path, digest, prefix, label, errors) {
  if (!safePath(path, prefix)) {
    errors.push({ finding: 'evidence_path', detail: `${label}: unsafe or out-of-scope path ${path}` });
    return null;
  }
  const bytes = read.file(path);
  if (!bytes) {
    errors.push({ finding: 'evidence_missing', detail: `${label}: ${path} is not a committed regular file` });
    return null;
  }
  const actual = sha256(bytes);
  if (!isHex(digest) || digest !== actual) {
    errors.push({ finding: 'evidence_digest', detail: `${label}: ${path} digest does not match` });
    return null;
  }
  return actual;
}

export function countC1(revision, read = reader(revision)) {
  const result = {
    count: 0, present: false, gates: [], userRoundCountDeclared: 0,
    userRounds: null, userRoundsExpected: null, errors: [], reasons: [],
  };
  const raw = read.file(C1_RECEIPT);
  if (!raw) {
    result.reasons.push('gates receipt missing');
    return result;
  }
  result.present = true;
  let receipt;
  try {
    receipt = JSON.parse(raw.toString('utf8'));
  } catch {
    result.errors.push({ finding: 'malformed_receipt', detail: 'gates.json is not JSON' });
    return result;
  }
  if (!isObject(receipt) || !Array.isArray(receipt.gates)) {
    result.errors.push({ finding: 'malformed_receipt', detail: 'gates.json has no gates array' });
    return result;
  }
  if (receipt.gates.length === 0) {
    result.reasons.push('gates receipt lists no gates');
    return result;
  }

  const seen = new Set();
  let valid = 0;
  for (const entry of receipt.gates) {
    if (!isObject(entry) || !isText(entry.path)) {
      result.errors.push({ finding: 'malformed_gate', detail: 'gate entry has no path' });
      continue;
    }
    const detail = { path: entry.path, digest: 'missing', selfTest: 'invalid', witness: 'invalid', production: 'invalid' };
    result.gates.push(detail);
    if (!GATE_RULES.has(entry.path)) {
      result.errors.push({ finding: 'unknown_gate', detail: `unexpected gate path ${entry.path}` });
      continue;
    }
    if (seen.has(entry.path)) {
      result.errors.push({ finding: 'duplicate_gate', detail: `duplicate gate path ${entry.path}` });
      continue;
    }
    seen.add(entry.path);
    const rule = GATE_RULES.get(entry.path);
    const gateErrors = [];
    const add = (finding, message) => gateErrors.push({ finding, detail: `${entry.path}: ${message}` });

    if (!isHex(entry.sha256)) add('malformed_gate', 'sha256 is not a 64-hex digest');
    const digest = read.sha(entry.path);
    if (!digest) {
      add('missing_git_blob', 'gate is not a committed regular file at the revision');
    } else if (isHex(entry.sha256) && entry.sha256 !== digest) {
      add('gate_digest_mismatch', 'receipt sha256 differs from the committed code digest');
    }
    if (digest && entry.sha256 === digest) detail.digest = 'match';

    const selfTest = entry.selfTest;
    if (!isObject(selfTest) || !isInt(selfTest.exit) || typeof selfTest.stdout !== 'string') {
      add('malformed_gate', 'selfTest must be {exit,stdout}');
    } else {
      if (selfTest.stderr !== undefined && typeof selfTest.stderr !== 'string') add('malformed_gate', 'selfTest.stderr must be text');
      const selfTestText = outputOf(selfTest);
      if (selfTest.exit !== 0) add('self_test_red', `selfTest exit ${selfTest.exit}, expected 0`);
      const summary = new RegExp(`^${rule.prefix}_SELFTEST verdict=clean cases=(\\d+)\\b`, 'm').exec(selfTestText);
      if (!summary) add('self_test_not_green', 'missing clean SELFTEST summary');
      else if (Number(summary[1]) < 4) add('self_test_thin', `only ${summary[1]} self-test cases`);
      if (/\bresult=FAIL\b/.test(selfTestText)) add('self_test_red', 'selfTest output contains result=FAIL');
      if (selfTest.exit === 0 && summary && !/\bresult=FAIL\b/.test(selfTestText)) detail.selfTest = 'clean';
    }

    const witness = entry.witness;
    if (!isObject(witness) || !isObject(witness.before) || !isObject(witness.after)) {
      add('malformed_gate', 'witness must be {before:{exit,stdout},after:{exit,stdout}}');
    } else {
      const before = witness.before;
      const after = witness.after;
      const witnessSummary = /(?:ROUND_CONTRACT|USER_ROUND_CONTRACT)_WITNESS[^\n]*old_exit=1[^\n]*old_finding=([a-z_]+)[^\n]*new_exit=0[^\n]*new_verdict=clean[^\n]*result=PASS/.exec(`${outputOf(before)}\n${outputOf(after)}`);
      let named = witnessSummary ? witnessSummary[1] : null;
      if (!isInt(before.exit) || typeof before.stdout !== 'string') {
        add('malformed_gate', 'witness.before must be {exit,stdout}');
      } else {
        if (before.stderr !== undefined && typeof before.stderr !== 'string') add('malformed_gate', 'witness.before.stderr must be text');
        const line = new RegExp(`^${rule.prefix} verdict=failed finding=([a-z_]+)`, 'm').exec(outputOf(before));
        if (before.exit !== 1) add('witness_before_not_red', `before exit ${before.exit}, expected 1`);
        if (!line && !named) add('witness_before_unnamed', 'before output has no named finding');
        else if (line) named = line[1];
        if (named === 'could_not_evaluate') add('witness_before_infrastructure', 'before finding is could_not_evaluate');
      }
      if (!isInt(after.exit) || typeof after.stdout !== 'string') {
        add('malformed_gate', 'witness.after must be {exit,stdout}');
      } else {
        if (after.stderr !== undefined && typeof after.stderr !== 'string') add('malformed_gate', 'witness.after.stderr must be text');
        if (after.exit !== 0) add('witness_after_not_green', `after exit ${after.exit}, expected 0`);
        if (!new RegExp(`^${rule.prefix} verdict=clean\\b`, 'm').test(outputOf(after)) && !witnessSummary) {
          add('witness_after_not_green', 'after output has no clean verdict');
        }
      }
      if (named && isObject(after) && after.exit === 0
        && (new RegExp(`^${rule.prefix} verdict=clean\\b`, 'm').test(outputOf(after)) || witnessSummary)) {
        detail.witness = `${named}->clean`;
      }
    }

    const production = entry.production;
    if (!isObject(production) || !isInt(production.exit) || typeof production.stdout !== 'string') {
      add('malformed_gate', 'production must be {exit,stdout}');
    } else if (rule.production === 'clean') {
      if (production.stderr !== undefined && typeof production.stderr !== 'string') add('malformed_gate', 'production.stderr must be text');
      if (production.exit !== 0) add('production_not_green', `production exit ${production.exit}, expected 0`);
      const line = new RegExp(`^${rule.prefix} verdict=clean[^\\n]*\\brounds=10\\b`, 'm').exec(outputOf(production));
      if (!line) add('production_not_green', 'production lacks verdict=clean rounds=10');
      if (production.exit === 0 && line) detail.production = 'clean_10_rounds';
    } else {
      if (production.stderr !== undefined && typeof production.stderr !== 'string') add('malformed_gate', 'production.stderr must be text');
      const productionText = outputOf(production);
      if (production.exit !== 1) add('user_production_not_declared', `production exit ${production.exit}, expected 1`);
      const line = new RegExp(`^${rule.prefix} verdict=failed finding=round_count\\b`, 'm').exec(productionText);
      if (!line) add('user_production_not_declared', 'production lacks finding=round_count');
      const counts = /Found (\d+) user rounds, expected (\d+)/.exec(productionText);
      if (!counts) add('user_round_count_not_honest', 'production does not state the user round count');
      else if (Number(counts[1]) !== 6 || Number(counts[2]) !== 10) {
        add('user_round_count_not_honest', `expected Found 6 user rounds, expected 10; got ${counts[1]} of ${counts[2]}`);
      }
      if (new RegExp(`^${rule.prefix} verdict=clean\\b`, 'm').test(productionText)) {
        add('user_production_false_green', 'production claims clean despite six of ten user rounds');
      }
      if (counts) {
        detail.userRounds = Number(counts[1]);
        detail.userExpected = Number(counts[2]);
      }
      if (line && counts && production.exit === 1 && Number(counts[1]) === 6 && Number(counts[2]) === 10) {
        detail.production = 'blocked_round_count_6_of_10';
      }
    }

    result.errors.push(...gateErrors);
    if (gateErrors.length === 0) {
      valid++;
      if (entry.path === 'scripts/check-user-round-contract.mjs' && detail.production === 'blocked_round_count_6_of_10') {
        result.userRoundCountDeclared = 1;
        result.userRounds = 6;
        result.userRoundsExpected = 10;
      }
    }
  }

  result.gates.sort((a, b) => a.path.localeCompare(b.path));
  result.count = result.errors.length === 0 ? valid : 0;
  return result;
}

export function countC2(revision, read = reader(revision)) {
  const result = {
    count: 0, present: false, casesPassed: 0, negativePassed: 0,
    noteAdmitted: 0, errors: [], reasons: [],
  };
  const raw = read.file(C2_RECEIPT);
  if (!raw) {
    result.reasons.push('aria receipt missing');
    return result;
  }
  result.present = true;
  let receipt;
  try {
    receipt = JSON.parse(raw.toString('utf8'));
  } catch {
    result.errors.push({ finding: 'malformed_receipt', detail: 'aria receipt is not JSON' });
    return result;
  }
  if (!isObject(receipt)) {
    result.errors.push({ finding: 'malformed_receipt', detail: 'aria receipt is not an object' });
    return result;
  }

  const errors = result.errors;
  const add = (finding, detail) => errors.push({ finding, detail });
  if (receipt.schema !== 'tabi-aria-loopback-receipt-v1') {
    add('receipt_schema', 'schema must be tabi-aria-loopback-receipt-v1');
  }

  const runtime = receipt.runtime;
  if (!isObject(runtime)) {
    add('runtime', 'runtime object is missing');
  } else {
    if (!isText(runtime.node)) add('runtime', 'runtime.node is missing');
    if (runtime.playwright !== PLAYWRIGHT_PIN) add('runtime_pin', `runtime.playwright must be ${PLAYWRIGHT_PIN}`);
    const chromium = runtime.chromium;
    if (!isObject(chromium)) {
      add('runtime', 'runtime.chromium object is missing');
    } else {
      for (const key of ['executablePath', 'browserVersion']) {
        if (!isText(chromium[key])) add('runtime', `runtime.chromium.${key} is missing`);
      }
      if (!isText(chromium.revision) && !isText(chromium.managedRevision)) {
        add('runtime', 'runtime.chromium.revision/managedRevision is missing');
      }
      if (isText(chromium.executablePath) && !chromium.executablePath.startsWith('/')) {
        add('runtime', 'runtime.chromium.executablePath is not absolute');
      }
      if (isText(chromium.browserVersion) && !/^\d+\.\d+\.\d+/.test(chromium.browserVersion)) {
        add('runtime', 'runtime.chromium.browserVersion is not a version');
      }
      if (!isHex(chromium.executableSha256)) add('runtime', 'runtime.chromium.executableSha256 is not a 64-hex digest');
    }
    if (!isText(runtime.command) || !runtime.command.includes('aria-loopback-round13.mjs')) {
      add('runtime', 'runtime.command does not name scripts/aria-loopback-round13.mjs');
    }
    const pin = runtime.pinned;
    if (!isObject(pin)) {
      add('runtime_pin', 'runtime.pinned object is missing');
    } else {
      if (!isRelative(pin.pinPath)) add('runtime_pin', 'runtime.pinned.pinPath is not a relative path');
      else if (!isHex(pin.pinSha256)) add('runtime_pin', 'runtime.pinned.pinSha256 is not a 64-hex digest');
      else {
        const pinDigest = read.sha(pin.pinPath);
        if (!pinDigest) add('runtime_pin', `pin file ${pin.pinPath} is not committed`);
        else if (pinDigest !== pin.pinSha256) add('runtime_pin', `pin file ${pin.pinPath} digest does not match`);
        if (pin.pinPath.endsWith('runtime-pin.json')) {
          const pinRaw = read.file(pin.pinPath);
          try {
            const pinned = pinRaw ? JSON.parse(pinRaw.toString('utf8')) : null;
            if (!pinned || (pinned.playwrightTest !== PLAYWRIGHT_PIN && pinned.playwright !== PLAYWRIGHT_PIN)) {
              add('runtime_pin', `pin file ${pin.pinPath} does not pin ${PLAYWRIGHT_PIN}`);
            }
            const pinnedVersion = pinned?.chromium?.version;
            const pinnedSha = pinned?.chromium?.executableSha256;
            if (pinnedVersion && runtime.chromium?.browserVersion !== pinnedVersion) {
              add('runtime_pin', 'browserVersion does not match the pin file');
            }
            if (pinnedSha && runtime.chromium?.executableSha256 !== pinnedSha) {
              add('runtime_pin', 'executableSha256 does not match the pin file');
            }
          } catch {
            add('runtime_pin', `pin file ${pin.pinPath} is not JSON`);
          }
        }
      }
      for (const key of ['playwrightMatched', 'chromiumMatched', 'browserVersionMatched']) {
        if (pin[key] !== true) add('runtime_pin', `runtime.pinned.${key} is not true`);
      }
    }
  }

  const timeoutPairs = [
    ['case', receipt.caseTimeoutMs, receipt.timeouts?.caseMs],
    ['expect', receipt.expectTimeoutMs, receipt.timeouts?.expectMs],
    ['action', receipt.actionTimeoutMs, receipt.timeouts?.actionMs],
    ['navigation', receipt.navigationTimeoutMs, receipt.timeouts?.navigationMs],
  ];
  for (const [name, direct, nested] of timeoutPairs) {
    const value = isInt(direct) && direct > 0 ? direct : nested;
    if (!isInt(value) || value <= 0) add('timeouts', `${name} timeout must be a positive integer`);
  }

  const config = receipt.config;
  if (!isObject(config)) {
    add('runner_config', 'config object is missing');
  } else {
    if (config.workers !== 1) add('runner_config', 'config.workers must be 1');
    if (config.retries !== 0) add('runner_config', 'config.retries must be 0');
    if (config.ignoreSnapshots !== false) add('runner_config', 'config.ignoreSnapshots must be false');
    if (config.updateSnapshots !== 'none') add('runner_config', "config.updateSnapshots must be 'none'");
    if (config.globalChildrenOverride !== null) add('runner_config', 'config.globalChildrenOverride must be null');
  }

  const runnerRaw = read.file(C2_RUNNER);
  if (!runnerRaw) {
    add('source_missing', `${C2_RUNNER} is not committed`);
  } else {
    const runnerDigest = sha256(runnerRaw);
    if (receipt.sourceSha256 !== runnerDigest) add('source_digest', 'sourceSha256 does not match the committed runner');
  }
  const testSources = [
    runnerRaw ? runnerRaw.toString('utf8') : '',
    ...read.list(C2_EVIDENCE_PREFIX)
      .filter(path => /\.spec\.mjs$/.test(path))
      .map(path => read.file(path)?.toString('utf8') || ''),
  ].join('\n');
  if (!testSources.includes('@playwright/test')) add('source_runner', 'no committed source imports @playwright/test');
  if (!/\bexpect\s*\(/.test(testSources)) add('source_runner', 'no committed source calls expect(...)');

  const configRaw = read.file(C2_CONFIG);
  if (!configRaw) {
    add('runner_config', `${C2_CONFIG} is not committed`);
  } else {
    const configText = configRaw.toString('utf8');
    if (!/ignoreSnapshots:\s*false/.test(configText)) add('runner_config', 'ignoreSnapshots must be false (no vacuous snapshot pass)');
    if (!/updateSnapshots:\s*['"]none['"]/.test(configText)) add('runner_config', "updateSnapshots must be 'none' (no self-attested baseline)");
    if (!/retries:\s*0\b/.test(configText)) add('runner_config', 'retries must be 0 (no retry masking)');
  }

  const loopback = receipt.loopback;
  if (loopback !== true && !isObject(loopback)) add('loopback', 'loopback must be true or an object');
  if (loopback === true && receipt.externalSite !== false) add('loopback', 'externalSite must be false');
  const endpoint = isObject(loopback) ? loopback : receipt.server;
  if (!isObject(endpoint)) {
    add('loopback', 'server/loopback endpoint object is missing');
  } else {
    if (endpoint.host !== '127.0.0.1') add('loopback', 'server host must be 127.0.0.1');
    if (!isInt(endpoint.port) || endpoint.port < 1 || endpoint.port > 65535) add('loopback', 'server port is invalid');
    if (!isText(endpoint.origin)) add('loopback', 'server origin is missing');
    else {
      try {
        const origin = new URL(endpoint.origin);
        if (origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' || Number(origin.port) !== endpoint.port) {
          add('loopback', 'server origin is not the declared 127.0.0.1 http origin');
        }
      } catch {
        add('loopback', 'server origin is not a URL');
      }
    }
    if (Array.isArray(endpoint.requests)) {
      if (endpoint.requests.length === 0) add('loopback', 'server requests are empty');
      for (const request of endpoint.requests) {
        if (!isObject(request) || typeof request.url !== 'string') continue;
        try {
          const url = new URL(request.url);
          if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost' && url.hostname !== '::1') {
            add('loopback', `recorded request is not loopback: ${request.url}`);
          }
        } catch {
          // Relative request paths are accepted; origin is checked above.
        }
      }
    } else if (!isInt(endpoint.requests) || endpoint.requests < 1) {
      add('loopback', 'server requests must be a positive count or a non-empty array');
    }
    if (endpoint.externalRequestsBlocked !== 0) add('loopback', 'externalRequestsBlocked must be 0');
  }

  const profile = receipt.profile;
  if (isObject(profile)) {
    if (!isText(profile.dir)) add('profile', 'profile.dir is missing');
    if (profile.temp !== true) add('profile', 'profile.temp must be true');
    if (profile.removed !== true) add('profile', 'profile.removed must be true');
  }

  const cleanup = receipt.cleanup;
  if (!isObject(cleanup)) {
    add('cleanup', 'cleanup object is missing');
  } else {
    if ('allCaseCleanup' in cleanup || 'serverOk' in cleanup) {
      if (cleanup.allCaseCleanup !== true) add('cleanup', 'cleanup.allCaseCleanup must be true');
      if (cleanup.serverOk !== true) add('cleanup', 'cleanup.serverOk must be true');
      if (cleanup.outputConfinementOk !== true) add('cleanup', 'cleanup.outputConfinementOk must be true');
      if (cleanup.tempRootsRemoved !== true) add('cleanup', 'cleanup.tempRootsRemoved must be true');
      if (cleanup.profilesRemoved !== true) add('cleanup', 'cleanup.profilesRemoved must be true');
      if (!isObject(cleanup.server)) {
        add('cleanup', 'cleanup.server object is missing');
      } else {
        if (cleanup.server.closed !== true) add('cleanup', 'cleanup.server.closed must be true');
        if (cleanup.server.refusedAfterClose !== true) add('cleanup', 'cleanup.server.refusedAfterClose must be true');
      }
      if (!Array.isArray(cleanup.caseCleanup) || cleanup.caseCleanup.length === 0) {
        add('cleanup', 'cleanup.caseCleanup is empty');
      } else {
        for (const item of cleanup.caseCleanup) {
          if (!isObject(item) || item.ok !== true) add('cleanup', 'every case cleanup must record ok=true');
        }
      }
    } else {
      for (const key of ['serverClosed', 'serverRefusedAfterClose', 'contextClosed', 'profileRemoved']) {
        if (cleanup[key] !== true) add('cleanup', `cleanup.${key} must be true`);
      }
    }
    if (cleanup.browserProcessesAfter !== 0) add('cleanup', 'cleanup.browserProcessesAfter must be 0');
  }

  const templates = new Set();
  if (!Array.isArray(receipt.templates) || receipt.templates.length === 0) {
    add('templates', 'templates[] is empty');
  } else {
    for (const template of receipt.templates) {
      if (!isObject(template)) {
        add('templates', 'template entry is not an object');
        continue;
      }
      if (!safePath(template.path, C2_TEMPLATE_PREFIX)) {
        add('templates', `template path is outside ${C2_TEMPLATE_PREFIX}`);
        continue;
      }
      if (templates.has(template.path)) add('templates', `duplicate template ${template.path}`);
      templates.add(template.path);
      committedDigest(read, template.path, template.sha256, C2_TEMPLATE_PREFIX, 'template', errors);
    }
  }
  if (!templates.has(C2_CHECKED_TEMPLATE)) add('templates', `checked-wrong template ${C2_CHECKED_TEMPLATE} is not declared`);

  if (!Array.isArray(receipt.fixtures)) {
    add('fixtures', 'fixtures[] is missing');
  } else {
    for (const fixture of receipt.fixtures) {
      if (!isObject(fixture)) {
        add('fixtures', 'fixture entry is not an object');
        continue;
      }
      committedDigest(read, fixture.path, fixture.sha256, C2_EVIDENCE_PREFIX, 'fixture', errors);
    }
  }

  let caseCount = 0;
  if (!Array.isArray(receipt.cases) || receipt.cases.length < 4) {
    add('cases', 'fewer than 4 positive cases');
  } else {
    caseCount = receipt.cases.length;
    const names = new Set();
    let roleName = false;
    let label = false;
    let resolveCase = false;
    let contain = false;
    let yamlActual = false;
    let yamlTemplate = false;
    for (const item of receipt.cases) {
      if (!isObject(item)) {
        add('cases', 'case entry is not an object');
        continue;
      }
      if (!isText(item.name)) add('cases', 'case name is missing');
      else if (names.has(item.name)) add('cases', `duplicate case name ${item.name}`);
      else names.add(item.name);
      if (item.status !== 'pass') add('cases', `case ${item.name || '?'} did not pass`);
      if (!/^R13-ARIA-[A-Z0-9-]+$/.test(String(item.findingId || ''))) {
        add('cases', `case ${item.name || '?'} has no stable R13-ARIA findingId`);
      }
      if (!isText(item.expected) || !isText(item.actual)) add('cases', `case ${item.name || '?'} lacks expected/actual text`);
      if (!isInt(item.durationMs) || item.durationMs < 0) add('cases', `case ${item.name || '?'} has no durationMs`);
      if (item.template !== undefined || item.templateSha256 !== undefined) {
        if (!safePath(item.template, C2_EVIDENCE_PREFIX)) {
          add('cases', `case ${item.name || '?'} template is outside the aria evidence directory`);
        } else if (item.template.startsWith(C2_TEMPLATE_PREFIX)) {
          if (!templates.has(item.template)) add('cases', `case ${item.name || '?'} template is not declared in templates[]`);
          committedDigest(read, item.template, item.templateSha256, C2_TEMPLATE_PREFIX, 'case template', errors);
          if (item.templateKind === 'aria-yaml' || (Array.isArray(item.snapshots) && item.snapshots.length)) yamlTemplate = true;
        } else {
          committedDigest(read, item.template, item.templateSha256, C2_EVIDENCE_PREFIX, 'case input', errors);
        }
      }
      if (!safePath(item.actualPath, C2_ACTUAL_PREFIX)) {
        add('cases', `case ${item.name || '?'} actualPath is outside the actual directory`);
      } else {
        if (!/\.(json|aria\.yml)$/.test(item.actualPath)) add('cases', `case ${item.name || '?'} actualPath is not JSON or ARIA YAML`);
        committedDigest(read, item.actualPath, item.actualSha256, C2_ACTUAL_PREFIX, 'actual', errors);
        if (item.actualPath.endsWith('.aria.yml')) yamlActual = true;
      }
      if (item.snapshots !== undefined) {
        if (!Array.isArray(item.snapshots)) {
          add('cases', `case ${item.name || '?'} snapshots is not an array`);
        } else {
          for (const snapshot of item.snapshots) {
            if (!isObject(snapshot) || !safePath(snapshot.path, C2_ACTUAL_PREFIX)) {
              add('cases', `case ${item.name || '?'} snapshot path is outside the actual directory`);
              continue;
            }
            if (!snapshot.path.endsWith('.aria.yml')) add('cases', `case ${item.name || '?'} snapshot is not .aria.yml`);
            committedDigest(read, snapshot.path, snapshot.sha256, C2_ACTUAL_PREFIX, 'snapshot', errors);
            yamlActual = true;
          }
        }
      }
      const text = `${item.name || ''} ${item.findingId || ''} ${item.template || ''}`.toLowerCase();
      if (/\brole\b/.test(text) && /\bname\b/.test(text)) roleName = true;
      if (/\blabel\b/.test(text)) label = true;
      if (/re-?solv|replac/.test(text)) resolveCase = true;
      if (/contain|partial|extra/.test(text)) contain = true;
    }
    if (!roleName) add('coverage', 'no role+name case');
    if (!label) add('coverage', 'no label case');
    if (!resolveCase) add('coverage', 'no locator re-resolution case');
    if (!contain) add('coverage', 'no partial/contain case');
    if (!yamlActual) add('coverage', 'no actual .aria.yml capture');
    if (!yamlTemplate) add('coverage', 'no .aria.yml actual paired with a templates/ source');
  }

  let negativeCount = 0;
  if (!Array.isArray(receipt.negative) || receipt.negative.length < 3) {
    add('negative', 'fewer than 3 negative cases');
  } else {
    negativeCount = receipt.negative.length;
    const names = new Set();
    let strict = false;
    let equal = false;
    let checked = false;
    for (const item of receipt.negative) {
      if (!isObject(item)) {
        add('negative', 'negative entry is not an object');
        continue;
      }
      if (!isText(item.name)) add('negative', 'negative name is missing');
      else if (names.has(item.name)) add('negative', `duplicate negative name ${item.name}`);
      else names.add(item.name);
      if (item.expected !== 'reject' || item.actual !== 'reject') {
        add('negative', `negative ${item.name || '?'} did not record reject/reject`);
      }
      if (!/^R13-ARIA-[A-Z0-9-]+$/.test(String(item.findingId || ''))) {
        add('negative', `negative ${item.name || '?'} has no stable R13-ARIA findingId`);
      }
      if (!isText(item.matcher) || !/(toThrow|toMatchAriaSnapshot|expect\()/i.test(item.matcher)) {
        add('negative', `negative ${item.name || '?'} does not name a Playwright expect matcher`);
      }
      if (!isText(item.message) || item.message.trim().length < 8) {
        add('negative', `negative ${item.name || '?'} has no Playwright error message`);
      }
      if ((item.template !== undefined && item.template !== null) || (item.templateSha256 !== undefined && item.templateSha256 !== null)) {
        if (!safePath(item.template, C2_TEMPLATE_PREFIX)) {
          add('negative', `negative ${item.name || '?'} template is outside the template directory`);
        } else {
          if (!templates.has(item.template)) add('negative', `negative ${item.name || '?'} template is not declared in templates[]`);
          committedDigest(read, item.template, item.templateSha256, C2_TEMPLATE_PREFIX, 'negative template', errors);
        }
      }
      const text = `${item.name || ''} ${item.findingId || ''} ${item.matcher || ''} ${item.template || ''}`.toLowerCase();
      if (/strict|duplicate/.test(text)) {
        strict = true;
        if (isText(item.message) && !item.message.includes('strict mode violation')) {
          add('negative', 'strict/duplicate rejection message is not a Playwright strict-mode violation');
        }
      }
      if (/equal/.test(text) || /tomatchariasnapshot/.test(text)) equal = true;
      if (/checked/.test(text) || item.template === C2_CHECKED_TEMPLATE) checked = true;
    }
    if (!strict) add('coverage', 'no duplicate/strict rejection');
    if (!equal) add('coverage', 'no explicit equal snapshot rejection');
    if (!checked) add('coverage', 'no wrong checked-state rejection');
    if (!receipt.negative.some(item => isObject(item) && item.template === C2_CHECKED_TEMPLATE)) {
      add('coverage', `checked-wrong rejection must use ${C2_CHECKED_TEMPLATE}`);
    }
  }

  if (errors.length === 0) {
    result.casesPassed = caseCount;
    result.negativePassed = negativeCount;
  } else {
    return result;
  }

  const noteRaw = read.file(C2_NOTE);
  if (!noteRaw) {
    result.reasons.push('note missing');
    return result;
  }
  const note = noteRaw.toString('utf8');
  const sourceIds = new Set();
  for (const line of note.split('\n')) {
    if (!line.startsWith('source:')) continue;
    for (const match of line.matchAll(/S\d{3,}/g)) sourceIds.add(match[0]);
  }
  if (sourceIds.size === 0) result.reasons.push('note has no source: line');
  for (const id of REQUIRED_NOTE_SOURCES) {
    if (!sourceIds.has(id)) result.reasons.push(`note does not cite ${id}`);
  }

  const sourcesRaw = read.file(C2_SOURCES);
  if (!sourcesRaw) {
    result.reasons.push('SOURCES registry missing');
  } else {
    const lines = sourcesRaw.toString('utf8').split('\n');
    for (const id of sourceIds) {
      const line = lines.find(row => row.startsWith(`| ${id} |`));
      if (!line) {
        result.reasons.push(`registry has no row ${id}`);
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length !== 11) {
        result.reasons.push(`registry row ${id} is not one 11-column row`);
        continue;
      }
      if (cells[7] !== 'mined') result.reasons.push(`registry row ${id} is not mined`);
      if (!cells[10].includes(C2_NOTE)) result.reasons.push(`registry row ${id} does not list ${C2_NOTE}`);
    }
  }

  const readmeRaw = read.file(C2_README);
  if (!readmeRaw || !readmeRaw.toString('utf8').includes(C2_NOTE)) {
    result.reasons.push('corpus/README.md note map does not list the note');
  }

  const lessonRaw = read.file(C2_LESSON);
  if (!lessonRaw) {
    result.reasons.push('round-13 lesson missing');
  } else {
    const admitted = lessonRaw.toString('utf8').split('\n')
      .some(line => /^- admitted:/.test(line) && line.includes(C2_NOTE));
    if (!admitted) result.reasons.push('note is not admitted in corpus/lessons/round-13.md');
  }

  result.noteAdmitted = result.reasons.length === 0 ? 1 : 0;
  result.count = result.reasons.length === 0 ? 1 : 0;
  return result;
}

export function sourceHistogram(read) {
  const result = {
    rows: 0,
    tier: { A: 0, B: 0, C: 0, invalid: 0 },
    status: { queued: 0, mined: 0, rejected: 0, invalid: 0 },
  };
  const raw = read.file(C2_SOURCES);
  if (!raw) return result;
  let inRegistry = false;
  for (const line of raw.toString('utf8').split('\n')) {
    if (line.trim() === '## Registry') {
      inRegistry = true;
      continue;
    }
    if (inRegistry && /^##\s+/.test(line.trim())) {
      inRegistry = false;
      continue;
    }
    if (!inRegistry) continue;
    const row = /^ {0,3}(\|.*)$/.exec(line)?.[1];
    if (!row || !/^\|\s*S\d{3,}\s*\|/.test(row)) continue;
    const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
    result.rows++;
    const tier = cells[3];
    const status = cells[7];
    result.tier[tier === 'A' || tier === 'B' || tier === 'C' ? tier : 'invalid']++;
    result.status[status === 'queued' || status === 'mined' || status === 'rejected' ? status : 'invalid']++;
  }
  return result;
}

export function noteMap(read) {
  const notes = read.list('corpus/knowledge')
    .map(path => /^corpus\/knowledge\/([^/]+\.md)$/.exec(path)?.[1])
    .filter(Boolean)
    .sort();
  const readme = read.file(C2_README);
  if (!readme) return { knowledge_notes: notes.length, mapped: 0, missing: notes };
  const text = readme.toString('utf8');
  const missing = notes.filter(note => !text.includes(`knowledge/${note}`));
  return { knowledge_notes: notes.length, mapped: notes.length - missing.length, missing };
}

export function noteMapCommand(revision) {
  return `diff <(git ls-tree -r --name-only ${revision} -- corpus/knowledge | sed 's|^corpus/knowledge/||' | sort) <(git show ${revision}:corpus/README.md | grep -o 'knowledge/[A-Za-z0-9._-]*\\.md' | sed 's|^knowledge/||' | sort -u)`;
}

function usage() {
  throw Object.assign(
    new Error('Usage: node .ufo/waves/round-13/measure.mjs REV [--claim C1|C2 | --histogram]'),
    { exit: 2 },
  );
}

function parseArguments(argv) {
  const options = { revision: null, claim: null, histogram: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--claim') {
      const claim = argv[++index];
      if (claim !== 'C1' && claim !== 'C2') usage();
      options.claim = claim;
    } else if (argument === '--histogram') {
      options.histogram = true;
    } else if (!options.revision) {
      options.revision = argument;
    } else {
      usage();
    }
  }
  if (!options.revision) usage();
  if (options.histogram && options.claim) usage();
  return options;
}

function commandSet(revision) {
  return {
    census_histogram: CENSUS_COMMAND,
    census_validate: CENSUS_VALIDATE_COMMAND,
    note_map: noteMapCommand(revision),
  };
}

function sortErrors(errors) {
  return errors.slice().sort((a, b) => `${a.finding}\0${a.detail}`.localeCompare(`${b.finding}\0${b.detail}`));
}

function emit(output, errors) {
  process.stdout.write(`${JSON.stringify(output)}\n`);
  if (errors.length) {
    process.stderr.write(`MEASURE verdict=failed errors=${errors.length}\n`);
    process.exitCode = 1;
  }
}

function run(argv) {
  const options = parseArguments(argv);
  const revision = resolveRevision(options.revision);
  const read = reader(revision);
  const commands = commandSet(revision);

  if (options.histogram) {
    emit({ revision, source_histogram: sourceHistogram(read), commands }, []);
    return;
  }

  if (options.claim === 'C1') {
    const c1 = countC1(revision, read);
    const errors = sortErrors(c1.errors);
    emit({
      revision,
      c1_fixture_covered_repairs: c1.count,
      c1_receipt: c1.present ? 1 : 0,
      c1_operability_scalar_delta: 0,
      c1_user_round_count_declared: c1.userRoundCountDeclared,
      c1_user_rounds: c1.userRounds,
      c1_user_rounds_expected: c1.userRoundsExpected,
      c1_gates: c1.gates,
      commands,
      errors,
      reasons: c1.reasons.slice().sort(),
    }, errors);
    return;
  }

  if (options.claim === 'C2') {
    const c2 = countC2(revision, read);
    const errors = sortErrors(c2.errors);
    emit({
      revision,
      c2_runtime_demonstration: c2.count,
      c2_receipt: c2.present ? 1 : 0,
      c2_cases_passed: c2.casesPassed,
      c2_negative_passed: c2.negativePassed,
      c2_note_admitted: c2.noteAdmitted,
      c2_knowledge_path: C2_NOTE,
      commands,
      errors,
      reasons: c2.reasons.slice().sort(),
    }, errors);
    return;
  }

  const c1 = countC1(revision, read);
  const c2 = countC2(revision, read);
  const errors = sortErrors([...c1.errors, ...c2.errors]);
  emit({
    revision,
    c1_fixture_covered_repairs: c1.count,
    c1_receipt: c1.present ? 1 : 0,
    c1_operability_scalar_delta: 0,
    c1_user_round_count_declared: c1.userRoundCountDeclared,
    c1_user_rounds: c1.userRounds,
    c1_user_rounds_expected: c1.userRoundsExpected,
    c1_gates: c1.gates,
    c2_runtime_demonstration: c2.count,
    c2_receipt: c2.present ? 1 : 0,
    c2_cases_passed: c2.casesPassed,
    c2_negative_passed: c2.negativePassed,
    c2_note_admitted: c2.noteAdmitted,
    c2_knowledge_path: C2_NOTE,
    source_histogram: sourceHistogram(read),
    note_map: noteMap(read),
    commands,
    errors,
    reasons: [...c1.reasons, ...c2.reasons].sort(),
  }, errors);
}

try {
  run(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`MEASURE verdict=could-not-evaluate detail=${error.message}\n`);
  process.exitCode = error.exit ?? 2;
}
