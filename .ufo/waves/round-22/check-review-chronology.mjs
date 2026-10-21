#!/usr/bin/env node
// Classify only the producer, supplied artifact-scope, and review/acquisition
// chronology relations present in one local JSON record. Supplied history is
// preserved in input order; absent history is never reconstructed.
import {
  closeSync, fstatSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const EXPECTATIONS = join(HERE, 'debt-expectations.json');
const INPUT_SCHEMA = 'tabi-round22-review-chronology-input-v1';
const OUTPUT_SCHEMA = 'tabi-round22-review-chronology-result-v1';
const SELFTEST_SCHEMA = 'tabi-round22-review-chronology-selftest-v1';
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_EXPECTATIONS_BYTES = 2 * 1024 * 1024;
const MAX_EVENTS = 50000;
const MAX_ARTIFACTS = 20000;
const SHA256 = /^[a-f0-9]{64}$/;
const REVISION = /^[a-f0-9]{40}$/;
const TERMINAL = new Set(['canceled', 'cancelled', 'closed', 'completed', 'done', 'error', 'failed', 'parked', 'stopped']);
const FINDING_ORDER = [
  'review_scope_gap', 'producer_digest_mismatch', 'artifact_scope_mismatch', 'acquisition_after_review_observation',
  'producer_digest_unavailable', 'chronology_unavailable', 'artifact_scope_unavailable', 'event_history_unavailable',
  'peer_revival_after_failure', 'routing_broadcast', 'late_failure',
];

function plain(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!plain(value)) return value;
  const result = {};
  for (const key of Object.keys(value).sort(compareText)) result[key] = canonical(value[key]);
  return result;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

// Parse strict RFC3339-style UTC/offset timestamps and retain nanosecond
// ordering. Date.parse() would silently discard sub-millisecond chronology.
function instant(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  let offsetMinutes = 0;
  if (match[8] !== 'Z') {
    const offsetHours = Number(match[8].slice(1, 3));
    const offsetRemainder = Number(match[8].slice(4, 6));
    if (offsetHours > 23 || offsetRemainder > 59) return null;
    const sign = match[8][0] === '+' ? 1 : -1;
    offsetMinutes = sign * (offsetHours * 60 + offsetRemainder);
  }
  const utcSeconds = BigInt(Math.trunc(date.getTime() / 1000) - offsetMinutes * 60);
  const fraction = BigInt((match[7] ?? '').padEnd(9, '0') || '0');
  return utcSeconds * 1000000000n + fraction;
}

function artifactScope(value) {
  if (!plain(value) || !nonempty(value.path)) return null;
  if (!plain(value.receipt) || !nonempty(value.receipt.path) || !SHA256.test(value.receipt.sha256 ?? '')) return null;
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0 || value.artifacts.length > MAX_ARTIFACTS) return null;
  const artifacts = [];
  const paths = new Set();
  for (const item of value.artifacts) {
    if (!plain(item) || !nonempty(item.path) || !SHA256.test(item.sha256 ?? '') || paths.has(item.path)) return null;
    paths.add(item.path);
    artifacts.push({ path: item.path, sha256: item.sha256 });
  }
  if (!['claimed_in_receipt', 'read_at_revision'].includes(value.provenance)) return null;
  if (value.provenance === 'read_at_revision' && !REVISION.test(value.revision ?? '')) return null;
  artifacts.sort((left, right) => compareText(left.path, right.path));
  return {
    provenance: value.provenance === 'claimed_in_receipt' ? 'claimed-in-receipt' : 'read-at-revision',
    revision: value.provenance === 'read_at_revision' ? value.revision : null,
    path: value.path,
    receipt: { path: value.receipt.path, sha256: value.receipt.sha256 },
    artifacts,
  };
}

function scopesEqual(left, right) {
  if (!left || !right) return null;
  if (left.path !== right.path || left.receipt.path !== right.receipt.path || left.receipt.sha256 !== right.receipt.sha256) return false;
  if (left.artifacts.length !== right.artifacts.length) return false;
  for (let index = 0; index < left.artifacts.length; index++) {
    if (left.artifacts[index].path !== right.artifacts[index].path || left.artifacts[index].sha256 !== right.artifacts[index].sha256) return false;
  }
  return true;
}

function eventHistory(value, isPresent) {
  if (!isPresent || value === null) {
    return { result: { status: 'unavailable', basis: 'as_supplied_not_certified', seats: null }, findings: [] };
  }
  if (!Array.isArray(value) || value.length > MAX_EVENTS) return { invalid: true };
  const grouped = new Map();
  for (let sourceIndex = 0; sourceIndex < value.length; sourceIndex++) {
    const event = value[sourceIndex];
    if (!plain(event) || !nonempty(event.seat) || !nonempty(event.type)) return { invalid: true };
    if (Object.prototype.hasOwnProperty.call(event, 'status') && event.status !== null && typeof event.status !== 'string') return { invalid: true };
    if (Object.prototype.hasOwnProperty.call(event, 'actor') && event.actor !== null && typeof event.actor !== 'string') return { invalid: true };
    if (!grouped.has(event.seat)) grouped.set(event.seat, []);
    grouped.get(event.seat).push({ source_index: sourceIndex, event: canonical(event) });
  }

  const findings = new Set();
  const seats = [];
  for (const seat of [...grouped.keys()].sort(compareText)) {
    const events = grouped.get(seat);
    const firstTerminalIndex = events.findIndex(({ event }) => {
      const status = typeof event.status === 'string' ? event.status.toLowerCase() : '';
      return event.type.toLowerCase() === 'failure' || TERMINAL.has(status);
    });
    const firstTerminal = firstTerminalIndex < 0 ? null : events[firstTerminalIndex];
    let latestObservedStatus = null;
    const failureIndices = [];
    for (let index = 0; index < events.length; index++) {
      const { event } = events[index];
      if (typeof event.status === 'string') latestObservedStatus = event.status;
      if (event.type.toLowerCase() === 'failure' || (typeof event.status === 'string' && event.status.toLowerCase() === 'failed')) {
        failureIndices.push(index);
      }
    }
    const peerRevival = failureIndices.some(failureIndex => events.slice(failureIndex + 1).some(({ event }) =>
      ['message', 'activity'].includes(event.type.toLowerCase()) && nonempty(event.actor) && event.actor !== seat));
    const routingBroadcast = events.some(({ event }) => event.type.toLowerCase() === 'message' &&
      (event.route === 'broadcast' || event.recipient === 'agent://all'));
    const lateFailure = firstTerminalIndex >= 0 && failureIndices.some(index => index > firstTerminalIndex);
    if (peerRevival) findings.add('peer_revival_after_failure');
    if (routingBroadcast) findings.add('routing_broadcast');
    if (lateFailure) findings.add('late_failure');
    seats.push({
      seat,
      events,
      failure_events: failureIndices.map(index => events[index]),
      first_terminal: firstTerminal,
      latest_observed_status: latestObservedStatus,
      peer_revival_after_failure: peerRevival,
      routing_broadcast: routingBroadcast,
      late_failure: lateFailure,
    });
  }
  return {
    result: { status: 'available', basis: 'as_supplied_not_certified', seats },
    findings: [...findings],
  };
}

function makeResult({ verdict, exit, finding, findings, reviewScope, acquisitionScope, eventResult, scopeMatch, producerMatch, chronologyMatch, reviewClockRole, reviewObservedAt, acquisitionStartedAt, acquisitionFinishedAt }) {
  const orderedFindings = FINDING_ORDER.filter(item => findings.includes(item));
  return {
    schema: OUTPUT_SCHEMA,
    verdict,
    exit,
    finding,
    findings: orderedFindings,
    scope: {
      status: scopeMatch === true && producerMatch === true && chronologyMatch === true ? 'matched' :
        (scopeMatch === false || producerMatch === false || chronologyMatch === false ? 'gap' : 'unavailable'),
      producer_digest_match: producerMatch,
      artifact_scope_match: scopeMatch,
      acquisition_completed_not_after_review_observation: chronologyMatch,
      review_clock_role: reviewClockRole,
      review_observed_at: reviewObservedAt ?? null,
      acquisition_started_at: acquisitionStartedAt ?? null,
      acquisition_finished_at: acquisitionFinishedAt ?? null,
      reviewed: reviewScope ? {
        provenance: reviewScope.provenance,
        revision: reviewScope.revision,
        path: reviewScope.path,
        receipt: reviewScope.receipt,
        artifacts: reviewScope.artifacts,
      } : null,
      acquired: acquisitionScope ? {
        provenance: acquisitionScope.provenance,
        revision: acquisitionScope.revision,
        path: acquisitionScope.path,
        receipt: acquisitionScope.receipt,
        artifacts: acquisitionScope.artifacts,
      } : null,
    },
    provenance: {
      review: reviewScope?.provenance ?? 'unavailable',
      acquisition: acquisitionScope?.provenance ?? 'unavailable',
      basis: 'copied from supplied records; not independently authenticated',
    },
    event_history: eventResult,
    scope_limit: 'Supplied producer identity, artifact paths/digests, review-observation upper bound versus acquisition completion, and supplied events only; event completeness, review completion, wake/dispatch authority, and authenticity are not assessed.',
  };
}

function classify(input) {
  if (!plain(input) || input.schema !== INPUT_SCHEMA || !plain(input.review) || !plain(input.acquisition)) {
    return { schema: OUTPUT_SCHEMA, verdict: 'could_not_evaluate', exit: 2, finding: 'input_shape', findings: ['input_shape'] };
  }
  const reviewDigest = typeof input.review.producer_sha256 === 'string' && SHA256.test(input.review.producer_sha256) ? input.review.producer_sha256 : null;
  const acquisitionDigest = typeof input.acquisition.producer_sha256 === 'string' && SHA256.test(input.acquisition.producer_sha256) ? input.acquisition.producer_sha256 : null;
  const producerMatch = reviewDigest === null || acquisitionDigest === null ? null : reviewDigest === acquisitionDigest;
  // Snapshot readAt values are upper bounds, not per-seat return clocks; preserve that role.
  const reviewClockRole = ['review_return', 'review_observation_upper_bound'].includes(input.review.clock_role) ? input.review.clock_role : null;
  const reviewObservedAt = reviewClockRole === null ? null : instant(input.review.observed_at);
  const acquisitionStartedAt = instant(input.acquisition.started_at);
  const acquisitionFinishedAt = instant(input.acquisition.finished_at);
  const chronologyMatch = reviewObservedAt === null || acquisitionStartedAt === null ||
    acquisitionFinishedAt === null || acquisitionFinishedAt < acquisitionStartedAt
    ? null : acquisitionFinishedAt <= reviewObservedAt;
  const reviewScope = artifactScope(input.review.artifact_scope);
  const acquisitionScope = artifactScope(input.acquisition.artifact_scope);
  const scopeMatch = scopesEqual(reviewScope, acquisitionScope);
  const history = eventHistory(input.event_history, Object.prototype.hasOwnProperty.call(input, 'event_history'));
  if (history.invalid) return { schema: OUTPUT_SCHEMA, verdict: 'could_not_evaluate', exit: 2, finding: 'input_shape', findings: ['input_shape'] };

  const findings = new Set(history.findings);
  if (producerMatch === false) findings.add('producer_digest_mismatch');
  if (scopeMatch === false) findings.add('artifact_scope_mismatch');
  if (chronologyMatch === false) findings.add('acquisition_after_review_observation');
  if (producerMatch === null) findings.add('producer_digest_unavailable');
  if (chronologyMatch === null) findings.add('chronology_unavailable');
  if (scopeMatch === null) findings.add('artifact_scope_unavailable');
  if (history.result.status === 'unavailable') findings.add('event_history_unavailable');
  const scopeGap = producerMatch === false || scopeMatch === false || chronologyMatch === false;
  if (scopeGap) findings.add('review_scope_gap');

  let verdict;
  let finding;
  let exit;
  if (scopeGap) {
    verdict = 'review_scope_gap';
    finding = 'review_scope_gap';
    exit = 1;
  } else if (producerMatch === null) {
    verdict = 'producer_digest_unavailable';
    finding = 'producer_digest_unavailable';
    exit = 2;
  } else if (chronologyMatch === null) {
    verdict = 'chronology_unavailable';
    finding = 'chronology_unavailable';
    exit = 2;
  } else if (scopeMatch === null) {
    verdict = 'artifact_scope_unavailable';
    finding = 'artifact_scope_unavailable';
    exit = 2;
  } else if (history.result.status === 'unavailable') {
    verdict = 'event_history_unavailable';
    finding = 'event_history_unavailable';
    exit = 2;
  } else if (history.findings.length > 0) {
    verdict = 'event_history_anomaly';
    finding = FINDING_ORDER.find(item => history.findings.includes(item));
    exit = 1;
  } else {
    verdict = 'matched_supplied_scope';
    finding = 'review_scope_match';
    exit = 0;
  }
  return makeResult({
    verdict, exit, finding, findings: [...findings], reviewScope, acquisitionScope,
    eventResult: history.result, scopeMatch, producerMatch, chronologyMatch, reviewClockRole,
    reviewObservedAt: input.review.observed_at, acquisitionStartedAt: input.acquisition.started_at,
    acquisitionFinishedAt: input.acquisition.finished_at,
  });
}

function failure(finding, exit = 2) {
  return { schema: OUTPUT_SCHEMA, verdict: 'could_not_evaluate', exit, finding, findings: [finding] };
}

function evaluatePath(path) {
  let descriptor;
  try {
    descriptor = openSync(path, 'r');
    const stat = fstatSync(descriptor);
    if (!stat.isFile()) return failure('input_not_regular');
    if (stat.size > MAX_INPUT_BYTES) return failure('input_too_large');
    const bytes = readFileSync(descriptor);
    if (bytes.length > MAX_INPUT_BYTES) return failure('input_too_large');
    let input;
    try {
      input = JSON.parse(bytes.toString('utf8'));
    } catch {
      return failure('invalid_json');
    }
    return classify(input);
  } catch {
    return failure('input_unreadable');
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function pathValue(value, path) {
  let current = value;
  for (const segment of path.split('.')) {
    if (segment === 'length' && (Array.isArray(current) || typeof current === 'string')) current = current.length;
    else current = current?.[/^\d+$/.test(segment) ? Number(segment) : segment];
  }
  return current;
}

function selftest() {
  let root;
  try {
    const bytes = readFileSync(EXPECTATIONS);
    if (bytes.length > MAX_EXPECTATIONS_BYTES) throw new Error('expectations too large');
    const expected = JSON.parse(bytes.toString('utf8'));
    if (!plain(expected) || expected.schema !== SELFTEST_SCHEMA || !Array.isArray(expected.cases) || expected.cases.length === 0) {
      throw new Error('expectations shape');
    }
    root = mkdtempSync(join(tmpdir(), 'tabi-r22-review-chronology-'));
    const results = [];
    for (const test of expected.cases) {
      if (!plain(test) || !/^[a-z0-9][a-z0-9_-]*$/.test(test.name ?? '') || !plain(test.expected) || !plain(test.input)) {
        throw new Error('case shape');
      }
      const inputPath = join(root, `${test.name}.json`);
      writeFileSync(inputPath, JSON.stringify(test.input));
      const actual = evaluatePath(inputPath);
      const checks = [];
      checks.push({ field: 'exit', expected: test.expected.exit, actual: actual.exit, pass: actual.exit === test.expected.exit });
      checks.push({ field: 'finding', expected: test.expected.finding, actual: actual.finding, pass: actual.finding === test.expected.finding });
      for (const [path, expectedValue] of Object.entries(test.expected.assertions ?? {})) {
        const actualValue = pathValue(actual, path);
        checks.push({ field: path, expected: expectedValue, actual: actualValue ?? null, pass: JSON.stringify(actualValue ?? null) === JSON.stringify(expectedValue) });
      }
      results.push({ name: test.name, pass: checks.every(check => check.pass), checks });
    }
    const passed = results.every(result => result.pass);
    return { schema: SELFTEST_SCHEMA, verdict: passed ? 'pass' : 'fail', exit: passed ? 0 : 1, cases: results };
  } catch {
    return { schema: SELFTEST_SCHEMA, verdict: 'could_not_evaluate', exit: 2, finding: 'selftest_input_invalid' };
  } finally {
    if (root) rmSync(root, { recursive: true, force: true });
  }
}

function main(args) {
  if (args.length === 1 && args[0] === '--selftest') return selftest();
  if (args.length === 1 && args[0] === '--help') {
    return { schema: OUTPUT_SCHEMA, verdict: 'usage', exit: 0, usage: 'node check-review-chronology.mjs <local-input.json> | --selftest' };
  }
  if (args.length !== 1 || args[0].startsWith('--')) return { ...failure('usage'), usage: 'node check-review-chronology.mjs <local-input.json> | --selftest' };
  return evaluatePath(args[0]);
}

const result = main(process.argv.slice(2));
console.log(JSON.stringify(result));
process.exitCode = result.exit;
