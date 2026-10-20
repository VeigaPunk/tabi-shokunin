#!/usr/bin/env node
// Measurement-identity binding gate (round 16, claim C1).
//
// Binds each counted claim to the identity of what measured it: the counter
// script bytes (sha256 blob digest), the revision the count was measured at,
// and the declared counted inputs. This routes the round-15 outside
// spot-check defects 1 and 2 recorded at
// corpus/lessons/round-15-verifier-spotcheck.md:120-121: the C1 counter was
// pinned only by code revision (measure.mjs sha256 3ee59de0 at 27dfd98 vs
// dd9c8675 at HEAD) and the report measured at b7cf044 rather than the
// delivered 36240c7.
//
// Usage:
//   node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce] [--json] [--repo <dir>]
//   node scripts/check-measurement-binding.mjs --legacy <round-15 measurements.json> [--at REV] [--json] [--repo <dir>]
//   node scripts/check-measurement-binding.mjs --self-test [--repo <dir>]
//   node scripts/check-measurement-binding.mjs --reasons
//
// --repo defaults to the git toplevel of the cwd. No token ever reaches a
// shell: every child is spawned with an argv array under a minimal
// environment (below). Git is additionally pinned against graft/replace/fsmonitor
// manipulation, and every pathspec is literal.
//
// Manifest shape (corpus/evidence/round-<N>/measurement-binding.json):
//   { "schema": "tabi-measurement-binding-v1", "round": 16,
//     "baseline": "<40-hex>",
//     "claims": [ { "id": "C1", "axis": "operability",
//       "counter": { "path": ".ufo/waves/round-16/measure.mjs",
//                    "sha256": "<64-hex blob digest>",
//                    "argv": ["node", ".ufo/waves/round-16/measure.mjs",
//                             "{REV}", "--claim", "C1"],
//                    "countField": "c1_binding_contracts" },
//       "countedInputs": ["<repo-relative path or directory prefix>"],
//       "measuredRevision": "<40-hex>",
//       "before": { "revision": "<40-hex>", "count": 0 },
//       "after":  { "revision": "<40-hex = measuredRevision>", "count": 1 } } ] }
//
// Exit classes:
//   0  evaluated clean
//   1  evaluated, per-claim findings
//   2  could not evaluate: manifest_unreadable, manifest_schema_invalid,
//      revision_unresolved, git_failed (usage for CLI surface refusals)
//
// Per-claim finding reasons (closed vocabulary):
//   measured_revision_not_ancestor   measuredRevision is not
//                                    ancestor-or-equal of --at REV
//   counter_digest_unrecorded        counter.sha256 absent or not 64-hex
//   counter_digest_mismatch          counter blob at measuredRevision != sha256
//                                    (legacy: sibling counterSha256 != blob at
//                                    measuredRevision)
//   counter_changed_since_measurement  counter blob at REV != sha256
//                                    (legacy: blob at counterCodeRevision !=
//                                    blob at REV)
//   counted_inputs_undeclared        countedInputs missing/not-array/empty,
//                                    or a declared input resolves to no tree
//                                    entry at measuredRevision
//   counted_input_changed            git diff --name-only measuredRevision REV
//                                    -- <countedInputs> <counter.path> nonempty
//   argv_unsupported                 argv[0] != "node", argv[1] != counter.path,
//                                    non-string/NUL element, or not exactly one
//                                    "{REV}" token
//   counter_failed                   --reproduce only: counter exit != 0 or
//                                    stdout not one JSON object, or the
//                                    worktree counter bytes are not the
//                                    recorded blob (refuses to execute)
//   count_not_reproduced             --reproduce only: parsed[countField]
//                                    != expected count for that arm
//                                    (arm=<40-hex> in detail; arms are
//                                    before.revision -> before.count and
//                                    REV -> after.count)
//
// Stdout grammar (text mode): first line
//   MEASUREMENT_BINDING verdict=clean|failed|could_not_evaluate claims=N bound=M
// then one sorted line per finding
//   finding claim=<id|-> reason=<reason> detail=<text>
// claim=- marks a gate-level could-not-evaluate finding. With --json, stdout
// is exactly one JSON object line instead.
//
// --self-test spawns scripts/selftest-measurement-binding.mjs (built by the
// BindSelftest seat) as a child CLI under the same minimal environment,
// relays its output verbatim, and propagates its exit status; the child's
// last stdout line is
//   MEASUREMENT_BINDING_SELFTEST verdict=clean cases=<n> reasons=<k>
// An absent or unspawnable child reports verdict=could_not_evaluate, exit 2.
//
// --reasons prints the closed vocabularies as one JSON line; it is a
// read-only surface so siblings and the C1 counter can share the vocabulary.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(SCRIPT);
const SELFTEST_SCRIPT = resolvePath(SCRIPT_DIR, 'selftest-measurement-binding.mjs');

const SCHEMA = 'tabi-measurement-binding-v1';
const LEGACY_SCHEMA = 'tabi-round15-measurements-v1';
const LEGACY_COUNTER_PATH = '.ufo/waves/round-15/measure.mjs';
const RESULT_SCHEMA = 'tabi-measurement-binding-check-v1';
const REASONS_SCHEMA = 'tabi-measurement-binding-reasons-v1';
const REV_TOKEN = '{REV}';
const REPRODUCE_TIMEOUT_MS = 120000;
const MAX_BUFFER = 64 * 1024 * 1024;
const DETAIL_MAX = 240;

const HEX40 = /^[0-9a-f]{40}$/;
const HEX64 = /^[0-9a-f]{64}$/;
const CLAIM_ID = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const COUNT_FIELD = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PATH_CHARS = /^[A-Za-z0-9._/-]+$/;
const LEGACY_CLAIM = /^C(\d+)$/;

const EXIT = Object.freeze({ clean: 0, findings: 1, couldNotEvaluate: 2 });

// Closed could-not-evaluate vocabulary: the four contract reasons plus usage
// for CLI surface refusals.
const FAILURE_REASON = Object.freeze({
  manifestUnreadable: 'manifest_unreadable',
  manifestSchemaInvalid: 'manifest_schema_invalid',
  revisionUnresolved: 'revision_unresolved',
  gitFailed: 'git_failed',
  usage: 'usage',
});

// Closed per-claim finding vocabulary.
const REASON = Object.freeze({
  measuredRevisionNotAncestor: 'measured_revision_not_ancestor',
  counterDigestUnrecorded: 'counter_digest_unrecorded',
  counterDigestMismatch: 'counter_digest_mismatch',
  counterChangedSinceMeasurement: 'counter_changed_since_measurement',
  countedInputsUndeclared: 'counted_inputs_undeclared',
  countedInputChanged: 'counted_input_changed',
  argvUnsupported: 'argv_unsupported',
  counterFailed: 'counter_failed',
  countNotReproduced: 'count_not_reproduced',
});
const FINDING_REASONS = Object.freeze(Object.values(REASON));
const COULD_NOT_EVALUATE_REASONS = Object.freeze(Object.values(FAILURE_REASON));

// Every git invocation is prefixed with this fixed global config so a
// repository-controlled fsmonitor hook cannot execute during plumbing, and
// every pathspec below is also protected by GIT_LITERAL_PATHSPECS in the env.
const GIT_PREFIX = ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false'];

class CouldNotEvaluate extends Error {
  constructor(reason, detail) {
    super(detail);
    this.reason = reason;
  }
}

function refuse(reason, detail) {
  throw new CouldNotEvaluate(reason, cleanDetail(detail));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanDetail(value) {
  const text = String(value).replace(/[\0-\x20\x7f]+/g, ' ').trim();
  return text.length > DETAIL_MAX ? `${text.slice(0, DETAIL_MAX)}...` : text;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// Minimal child environment: Git config/hook/replace/graft/lazy-fetch and
// pathspec-magic controls plus PATH/HOME and TZ=UTC. Nothing else is
// inherited, so Git config, hooks, grafts and credential helpers cannot alter
// what the counter or the gate observes.
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
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) env.PATH = process.env.PATH;
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  return env;
}

function git(repo, args, binary = false) {
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd: repo,
      env: minimalEnv(),
      encoding: binary ? undefined : 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    // e.g. NUL inside an argv element (ERR_INVALID_ARG_VALUE)
    return { error, status: null, stdout: '', stderr: '' };
  }
}

function gitError(args, result) {
  const stderr = result.stderr ? String(result.stderr).slice(0, 160) : '';
  return `git ${args.join(' ')} failed (status=${result.status ?? 'spawn'})${stderr ? ` stderr=${stderr}` : ''}`;
}

// A git call whose nonzero status means the gate cannot evaluate, not that a
// claim failed. Path-absence is handled by callers through the null-returning
// helpers below, never through this one.
function gitMust(repo, args) {
  const result = git(repo, args);
  if (result.error || result.status !== 0) refuse(FAILURE_REASON.gitFailed, gitError(args, result));
  return result.stdout;
}

// Resolve a revision string to a commit id. --end-of-options keeps a
// leading-'-' token from being read as a git option.
function resolveCommit(repo, rev, label) {
  const text = String(rev);
  if (text.startsWith('-') || text.includes('\0')) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} is not a revision token`);
  }
  const result = git(repo, ['rev-parse', '--verify', '--end-of-options', `${text}^{commit}`]);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} does not resolve to a commit`);
  }
  return result.stdout.trim();
}

// Resolve the repository root: --repo <dir> canonicalized through git itself,
// or the git toplevel of the cwd when --repo is absent.
function resolveRepo(dir) {
  const result = git(resolvePath(dir ?? process.cwd()), ['rev-parse', '--show-toplevel']);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.gitFailed, gitError(['rev-parse', '--show-toplevel'], result));
  }
  return result.stdout.trim();
}

// A repo-relative path or directory prefix suitable for a literal pathspec
// and for the path half of a rev:path object spec: no leading '/', '-', ':',
// '!' or glob magic, no drive/colon ambiguity, no NUL/newline/backslash, and
// no '.' or '..' segments. A single trailing '/' is allowed (dir prefix).
function isCleanRepoPath(path) {
  if (typeof path !== 'string' || path.length === 0 || path.length > 512) return false;
  if (path.includes('\0') || path.includes('\\')) return false;
  if (!PATH_CHARS.test(path)) return false;
  const body = path.endsWith('/') ? path.slice(0, -1) : path;
  if (body.length === 0) return false;
  return body.split('/').every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

// The tree entry for one exact path at one revision: { mode, type, oid } or
// null when absent. ls-tree on an exact file path yields exactly one entry.
function treeEntry(repo, rev, path) {
  const result = git(repo, ['ls-tree', '-z', rev, '--', path]);
  if (result.error) refuse(FAILURE_REASON.gitFailed, gitError(['ls-tree', rev, path], result));
  if (result.status !== 0) return null;
  const rows = result.stdout.split('\0').filter((row) => row.length > 0);
  if (rows.length === 0) return null;
  const match = /^([0-7]{6}) (\S+) ([0-9a-f]{40})\t(.*)$/.exec(rows[0]);
  if (!match) {
    refuse(FAILURE_REASON.gitFailed, `git ls-tree ${rev} ${path}: malformed row`);
  }
  return { mode: match[1], type: match[2], oid: match[3], name: match[4] };
}

// A counted input is a path OR a directory prefix: it must cover at least one
// tree entry at the measured revision, else the drift diff over it is vacuous.
function hasTreeEntries(repo, rev, prefix) {
  const result = git(repo, ['ls-tree', '-r', '-z', '--name-only', rev, '--', prefix]);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.gitFailed, gitError(['ls-tree', '-r', rev, prefix], result));
  }
  return result.stdout.split('\0').some((row) => row.length > 0);
}

// sha256 of the committed regular-file blob bytes at <rev>:<path>, or
// {digest:null, reason} when the path is absent or not a regular blob (a
// symlink's "blob" is its link text and must never be hashed as code). Read
// under GIT_NO_REPLACE_OBJECTS so replace refs cannot swap the bytes.
function blobSha256(repo, rev, path) {
  const entry = treeEntry(repo, rev, path);
  if (entry === null) return { digest: null, reason: 'absent' };
  if (entry.type !== 'blob' || (entry.mode !== '100644' && entry.mode !== '100755')) {
    return { digest: null, reason: `mode ${entry.mode} ${entry.type}` };
  }
  const result = git(repo, ['cat-file', 'blob', `${rev}:${path}`], true);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.gitFailed, gitError(['cat-file', 'blob', `${rev}:${path}`], result));
  }
  return { digest: sha256(result.stdout), reason: null };
}

function isAncestor(repo, older, newer) {
  const result = git(repo, ['merge-base', '--is-ancestor', older, newer]);
  if (result.error) {
    refuse(FAILURE_REASON.gitFailed, gitError(['merge-base', '--is-ancestor', older, newer], result));
  }
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  refuse(FAILURE_REASON.gitFailed, gitError(['merge-base', '--is-ancestor', older, newer], result));
}

// NUL-separated changed paths between two revisions under literal pathspecs.
// -z keeps newline-bearing filenames one per record; --no-ext-diff and
// --no-textconv keep repo-configured external drivers out of the process.
function diffNames(repo, from, to, paths) {
  const args = ['--literal-pathspecs', 'diff', '--no-renames', '--no-ext-diff', '--no-textconv',
    '--name-only', '-z', from, to, '--', ...paths];
  const result = git(repo, args);
  if (result.error || result.status !== 0) refuse(FAILURE_REASON.gitFailed, gitError(args, result));
  return result.stdout.split('\0').filter((line) => line.length > 0);
}

function loadJson(file, label = 'manifest') {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    refuse(FAILURE_REASON.manifestUnreadable, `${file}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    refuse(FAILURE_REASON.manifestSchemaInvalid, `${file}: invalid JSON: ${error.message}`);
  }
}

// Structural validation of the v1 manifest. Anything in the per-claim reason
// vocabulary stays a named finding rather than a schema refusal: missing or
// malformed counter.sha256, absent/empty countedInputs and unsupported argv
// are all findings, not exit-2.
function manifestProblems(manifest) {
  const problems = [];
  if (!isPlainObject(manifest)) return ['manifest is not a JSON object'];
  if (manifest.schema !== SCHEMA) {
    problems.push(`schema is ${JSON.stringify(manifest.schema)} not ${SCHEMA}`);
  }
  if (!Number.isInteger(manifest.round)) problems.push('round is not an integer');
  if (!HEX40.test(manifest.baseline ?? '')) problems.push('baseline is not 40-hex');
  if (!Array.isArray(manifest.claims) || manifest.claims.length === 0) {
    problems.push('claims is not a nonempty array');
    return problems;
  }
  manifest.claims.forEach((claim, index) => {
    const where = `claims[${index}]`;
    if (!isPlainObject(claim)) {
      problems.push(`${where} is not an object`);
      return;
    }
    if (typeof claim.id !== 'string' || !CLAIM_ID.test(claim.id)) {
      problems.push(`${where}.id must match ${CLAIM_ID}`);
    }
    if (claim.axis !== undefined && typeof claim.axis !== 'string') {
      problems.push(`${where}.axis not a string`);
    }
    const counter = claim.counter;
    if (!isPlainObject(counter)) {
      problems.push(`${where}.counter is not an object`);
    } else {
      if (!isCleanRepoPath(counter.path)) {
        problems.push(`${where}.counter.path is not a clean repo-relative path`);
      }
      if (counter.argv !== undefined && !Array.isArray(counter.argv)) {
        problems.push(`${where}.counter.argv is not an array`);
      }
      if (typeof counter.countField !== 'string' || !COUNT_FIELD.test(counter.countField)) {
        problems.push(`${where}.counter.countField must match ${COUNT_FIELD}`);
      }
    }
    if (Array.isArray(claim.countedInputs)) {
      claim.countedInputs.forEach((input, inputIndex) => {
        if (!isCleanRepoPath(input)) {
          problems.push(`${where}.countedInputs[${inputIndex}] is not a clean repo-relative path`);
        }
      });
    }
    if (!HEX40.test(claim.measuredRevision ?? '')) problems.push(`${where}.measuredRevision is not 40-hex`);
    for (const side of ['before', 'after']) {
      const entry = claim[side];
      if (!isPlainObject(entry) || !HEX40.test(entry.revision ?? '') || !Number.isSafeInteger(entry.count)) {
        problems.push(`${where}.${side} needs {revision: 40-hex, count: safe integer}`);
      }
    }
    if (isPlainObject(claim.after) && HEX40.test(claim.measuredRevision ?? '')
        && claim.after.revision !== claim.measuredRevision) {
      problems.push(`${where}.after.revision != measuredRevision`);
    }
  });
  return problems;
}

// argv contract: ["node", counter.path, ...] with exactly one "{REV}" token
// and every element a safe string.
function argvSupported(argv, counterPath) {
  if (!Array.isArray(argv)) return false;
  if (!argv.every((token) => typeof token === 'string' && !token.includes('\0'))) return false;
  if (argv[0] !== 'node') return false;
  if (argv[1] !== counterPath) return false;
  return argv.filter((token) => token === REV_TOKEN).length === 1;
}

// Run one reproduction arm: substitute {REV} with the resolved 40-hex, spawn
// the counter through `timeout` so its whole process group is killed on
// expiry, and parse its stdout as exactly one JSON object. Returns
// {ok, value} or {ok:false, why}.
function reproduceArm(repo, argv, armRev) {
  const mapped = argv.map((token) => (token === REV_TOKEN ? armRev : token));
  // argv[0] is required to be "node"; spawn the running interpreter so the
  // reproduction cannot pick up a different node from PATH. `timeout` runs the
  // command in a new process group, so the KILL reaches grandchildren that a
  // bare spawnSync timeout would leave running.
  const timeoutSec = Math.ceil(REPRODUCE_TIMEOUT_MS / 1000);
  let result;
  try {
    result = spawnSync('timeout', ['-s', 'KILL', String(timeoutSec), process.execPath, ...mapped.slice(1)], {
      cwd: repo,
      env: minimalEnv(),
      encoding: 'utf8',
      timeout: REPRODUCE_TIMEOUT_MS + 10000,
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { ok: false, why: `spawn error: ${error.message}` };
  }
  if (result.error) return { ok: false, why: `spawn error: ${result.error.message}` };
  if (result.status === 124 || result.status === 137 || (result.signal && result.signal !== null)) {
    return { ok: false, why: `terminated (status=${result.status ?? 'null'} signal=${result.signal ?? 'none'})` };
  }
  if (result.status !== 0) return { ok: false, why: `exit ${result.status}` };
  const trimmed = result.stdout.trim();
  if (trimmed.length === 0 || trimmed.includes('\n')) {
    return { ok: false, why: 'stdout is not a single JSON line' };
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, why: 'stdout is not JSON' };
  }
  if (!isPlainObject(parsed)) return { ok: false, why: 'stdout JSON is not an object' };
  return { ok: true, parsed };
}

function evaluateClaim(repo, claim, atRev, reproduce) {
  const id = claim.id;
  const findings = [];
  const add = (reason, detail) => findings.push({ claim: id, reason, detail: cleanDetail(detail) });
  const counter = claim.counter;
  const counterPath = counter.path;

  const measured = resolveCommit(repo, claim.measuredRevision, `claim ${id} measuredRevision`);
  const before = resolveCommit(repo, claim.before.revision, `claim ${id} before.revision`);

  if (!isAncestor(repo, measured, atRev)) {
    add(REASON.measuredRevisionNotAncestor,
      `measuredRevision=${measured} is not ancestor-or-equal of at=${atRev}`);
  }

  const recorded = typeof counter.sha256 === 'string' && HEX64.test(counter.sha256)
    ? counter.sha256 : null;
  if (recorded === null) {
    add(REASON.counterDigestUnrecorded, `counter=${counterPath} sha256 absent or not 64-hex`);
  } else {
    const atMeasured = blobSha256(repo, measured, counterPath);
    if (atMeasured.digest !== recorded) {
      add(REASON.counterDigestMismatch,
        `counter=${counterPath} recorded=${recorded} ` +
        `blob_at_measuredRevision=${atMeasured.digest ?? `unavailable(${atMeasured.reason})`}`);
    }
    const atTarget = blobSha256(repo, atRev, counterPath);
    if (atTarget.digest !== recorded) {
      add(REASON.counterChangedSinceMeasurement,
        `counter=${counterPath} recorded=${recorded} ` +
        `blob_at_at=${atTarget.digest ?? `unavailable(${atTarget.reason})`}`);
    }
  }

  const inputs = Array.isArray(claim.countedInputs) ? claim.countedInputs : [];
  if (inputs.length === 0) {
    add(REASON.countedInputsUndeclared, 'countedInputs missing or empty');
  } else {
    for (const input of inputs) {
      if (!hasTreeEntries(repo, measured, input)) {
        add(REASON.countedInputsUndeclared,
          `countedInput=${input} resolves to no tree entry at measuredRevision=${measured}`);
      }
    }
  }
  const diffInputs = [...new Set([...inputs, counterPath])];
  const changed = diffNames(repo, measured, atRev, diffInputs);
  if (changed.length > 0) {
    add(REASON.countedInputChanged, `paths=${changed.join(',')}`);
  }

  const supported = argvSupported(counter.argv, counterPath);
  if (!supported) {
    add(REASON.argvUnsupported,
      `argv=${JSON.stringify(counter.argv ?? null)} requires [node, ${counterPath}, ...] ` +
      `with exactly one ${REV_TOKEN} token`);
  }

  if (reproduce && supported && findings.length === 0) {
    // Never execute unbound bytes: the worktree counter must be the recorded
    // regular-file blob, or the reproduction would run whatever sits on disk.
    const worktreeCounter = resolvePath(repo, counterPath);
    const worktree = blobSha256(repo, atRev, counterPath);
    let worktreeOk = false;
    try {
      const stat = lstatSync(worktreeCounter);
      worktreeOk = stat.isFile() && worktree.digest !== null
        && sha256(readFileSync(worktreeCounter)) === worktree.digest;
    } catch {
      worktreeOk = false;
    }
    if (!worktreeOk) {
      add(REASON.counterFailed,
        `counter=${counterPath} worktree bytes are absent, not regular, or differ from blob at at=${atRev}; refusing to execute`);
    } else {
      // Reproduce the recorded measurement: before.revision must give
      // before.count and REV must give after.count, so a constant counter
      // cannot pass.
      const arms = [[before, claim.before.count]];
      if (atRev !== before) arms.push([atRev, claim.after.count]);
      for (const [armRev, expected] of arms) {
        const arm = reproduceArm(repo, counter.argv, armRev);
        if (!arm.ok) {
          add(REASON.counterFailed, `arm=${armRev} argv=${JSON.stringify(counter.argv)} ${arm.why}`);
        } else if (!Object.hasOwn(arm.parsed, counter.countField)) {
          add(REASON.countNotReproduced,
            `arm=${armRev} countField=${counter.countField} expected=${expected} observed=missing`);
        } else if (arm.parsed[counter.countField] !== expected) {
          add(REASON.countNotReproduced,
            `arm=${armRev} countField=${counter.countField} expected=${expected} ` +
            `observed=${JSON.stringify(arm.parsed[counter.countField])}`);
        }
      }
    }
  }

  return findings;
}

function manifestProblemsEarly(problems, file) {
  if (problems.length > 0) refuse(FAILURE_REASON.manifestSchemaInvalid, `${file}: ${problems[0]}`);
}

// Round-15 adaptation: tabi-round15-measurements-v1 carries C1/C2 objects
// with counterCodeRevision and a shared (top-level) measuredRevision, no
// countedInputs, and (C2 only) a counterSha256. The counter bytes live at
// LEGACY_COUNTER_PATH. One identity predicate, the same as --check: a
// recorded digest must equal the counter blob at measuredRevision
// (counter_digest_mismatch otherwise); an absent digest is
// counter_digest_unrecorded. Drift is the blob at counterCodeRevision
// differing from the blob at --at REV, with detail digests at all three
// revisions.
function legacyProblems(manifest) {
  const problems = [];
  if (!isPlainObject(manifest)) return ['manifest is not a JSON object'];
  if (manifest.schema !== LEGACY_SCHEMA) {
    problems.push(`schema is ${JSON.stringify(manifest.schema)} not ${LEGACY_SCHEMA}`);
  }
  const ids = legacyClaimIds(manifest);
  if (ids.length === 0) problems.push('no C<n> claim objects present');
  for (const id of ids) {
    const claim = manifest[id];
    if (!HEX40.test(claim.counterCodeRevision ?? '')) {
      problems.push(`${id}.counterCodeRevision is not 40-hex`);
    }
    const measured = claim.measuredRevision ?? manifest.measuredRevision;
    if (!HEX40.test(measured ?? '')) problems.push(`${id}.measuredRevision is not 40-hex`);
    if (claim.counterSha256 !== undefined && !HEX64.test(claim.counterSha256)) {
      problems.push(`${id}.counterSha256 is not 64-hex`);
    }
  }
  return problems;
}

function legacyClaimIds(manifest) {
  return Object.keys(manifest)
    .filter((key) => LEGACY_CLAIM.test(key) && isPlainObject(manifest[key]))
    .sort((left, right) => Number(LEGACY_CLAIM.exec(left)[1]) - Number(LEGACY_CLAIM.exec(right)[1]));
}

function evaluateLegacy(repo, manifest, atRev) {
  const findings = [];
  const ids = legacyClaimIds(manifest);
  for (const id of ids) {
    const claim = manifest[id];
    const add = (reason, detail) => findings.push({ claim: id, reason, detail: cleanDetail(detail) });
    const codeRev = resolveCommit(repo, claim.counterCodeRevision, `claim ${id} counterCodeRevision`);
    const measuredText = claim.measuredRevision ?? manifest.measuredRevision;
    const measured = resolveCommit(repo, measuredText, `claim ${id} measuredRevision`);

    // One identity predicate: unrecorded only when no digest exists; a
    // recorded digest is checked against the blob at measuredRevision, the
    // revision whose count it claims to describe.
    if (!claim.counterSha256) {
      add(REASON.counterDigestUnrecorded,
        `counter=${LEGACY_COUNTER_PATH} no counterSha256; pinned only by counterCodeRevision=${codeRev}`);
    }
    add(REASON.countedInputsUndeclared, 'no countedInputs declared');

    const atCode = blobSha256(repo, codeRev, LEGACY_COUNTER_PATH);
    const atMeasured = blobSha256(repo, measured, LEGACY_COUNTER_PATH);
    const atTarget = blobSha256(repo, atRev, LEGACY_COUNTER_PATH);

    if (claim.counterSha256 && atMeasured.digest !== claim.counterSha256) {
      add(REASON.counterDigestMismatch,
        `counter=${LEGACY_COUNTER_PATH} counterSha256=${claim.counterSha256} ` +
        `blob_at_measuredRevision=${atMeasured.digest ?? `unavailable(${atMeasured.reason})`} ` +
        `measuredRevision=${measured} counterCodeRevision=${codeRev} ` +
        `counterCodeRevision_ancestor_of_measured=${isAncestor(repo, codeRev, measured) ? 'yes' : 'no'}`);
    }
    if (atCode.digest !== atTarget.digest) {
      add(REASON.counterChangedSinceMeasurement,
        `counter=${LEGACY_COUNTER_PATH} counterCodeRevision=${codeRev} ` +
        `sha256_at_counterCodeRevision=${atCode.digest ?? `unavailable(${atCode.reason})`} ` +
        `measuredRevision=${measured} sha256_at_measuredRevision=${atMeasured.digest ?? `unavailable(${atMeasured.reason})`} ` +
        `at=${atRev} sha256_at_at=${atTarget.digest ?? `unavailable(${atTarget.reason})`}`);
    }
  }
  return { claims: ids, findings };
}

function sortFindings(findings) {
  return [...findings].sort((left, right) =>
    `${left.claim} ${left.reason} ${left.detail}`.localeCompare(`${right.claim} ${right.reason} ${right.detail}`));
}

function emitText(verdict, claimsCount, bound, findings) {
  console.log(`MEASUREMENT_BINDING verdict=${verdict} claims=${claimsCount} bound=${bound}`);
  for (const finding of findings) {
    console.log(`finding claim=${finding.claim} reason=${finding.reason} detail=${finding.detail}`);
  }
}

function emitResult({ mode, manifest, repo, atRev, verdict, claims, bound, findings, json }) {
  if (json) {
    console.log(JSON.stringify({
      schema: RESULT_SCHEMA,
      mode,
      manifest,
      repo,
      at: atRev,
      verdict,
      claims: claims.length,
      bound,
      vocabulary: { findings: FINDING_REASONS, couldNotEvaluate: COULD_NOT_EVALUATE_REASONS },
      findings: findings.map(({ claim, reason, detail }) => ({ claim, reason, detail })),
    }));
  } else {
    emitText(verdict, claims.length, bound, findings);
  }
}

function emitCouldNotEvaluate({ mode, manifest, repo, atRev, claims, error, json }) {
  const findings = [{ claim: '-', reason: error.reason, detail: cleanDetail(error.message) }];
  emitResult({
    mode, manifest, repo, atRev, verdict: 'could_not_evaluate',
    claims, bound: 0, findings, json,
  });
}

function runSelfTest(repo) {
  if (!existsSync(SELFTEST_SCRIPT)) {
    console.log('MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0');
    process.stderr.write(`selftest child absent: ${SELFTEST_SCRIPT}\n`);
    return EXIT.couldNotEvaluate;
  }
  const result = spawnSync(process.execPath, [SELFTEST_SCRIPT], {
    cwd: repo,
    env: minimalEnv(),
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) {
    console.log('MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0');
    process.stderr.write(`selftest spawn failed: ${result.error.message}\n`);
    return EXIT.couldNotEvaluate;
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status === null || result.status === undefined) return EXIT.couldNotEvaluate;
  return result.status;
}

function usage() {
  return [
    'MEASUREMENT_BINDING usage:',
    '  node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce] [--json] [--repo <dir>]',
    '  node scripts/check-measurement-binding.mjs --legacy <round-15 measurements.json> [--at REV] [--json] [--repo <dir>]',
    '  node scripts/check-measurement-binding.mjs --self-test [--repo <dir>]',
    '  node scripts/check-measurement-binding.mjs --reasons',
  ].join('\n');
}

function parseArguments(argv) {
  const options = {
    mode: null,
    manifest: null,
    at: null,
    reproduce: false,
    json: false,
    repo: null,
    help: false,
  };
  const nextValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    return value;
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'check';
      options.manifest = nextValue('--check', index);
      index += 1;
    } else if (arg === '--legacy') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'legacy';
      options.manifest = nextValue('--legacy', index);
      index += 1;
    } else if (arg === '--self-test') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'self-test';
    } else if (arg === '--reasons') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'reasons';
    } else if (arg === '--at') {
      options.at = nextValue('--at', index);
      index += 1;
    } else if (arg === '--reproduce') {
      options.reproduce = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--repo') {
      options.repo = nextValue('--repo', index);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!options.help) {
    if (options.mode === null) throw new Error('one of --check, --legacy, --self-test or --reasons is required');
    if (options.mode === 'self-test'
        && (options.at !== null || options.reproduce || options.json || options.manifest !== null)) {
      throw new Error('--self-test accepts only --repo');
    }
    if (options.mode === 'reasons'
        && (options.at !== null || options.reproduce || options.manifest !== null || options.repo !== null)) {
      throw new Error('--reasons accepts only --json (optional)');
    }
    if (options.mode === 'legacy' && options.reproduce) {
      throw new Error('--reproduce requires --check (legacy claims carry no bound argv)');
    }
  }
  return options;
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    emitText('could_not_evaluate', 0, 0, [
      { claim: '-', reason: FAILURE_REASON.usage, detail: cleanDetail(error.message) },
    ]);
    process.stderr.write(`${usage()}\n`);
    return EXIT.couldNotEvaluate;
  }
  if (options.help) {
    console.log(usage());
    return EXIT.clean;
  }

  if (options.mode === 'reasons') {
    console.log(JSON.stringify({
      schema: REASONS_SCHEMA,
      findings: FINDING_REASONS,
      couldNotEvaluate: COULD_NOT_EVALUATE_REASONS,
    }));
    return EXIT.clean;
  }

  // --self-test resolves the repo but needs no manifest or revision.
  if (options.mode === 'self-test') {
    try {
      return runSelfTest(resolveRepo(options.repo));
    } catch (error) {
      if (error instanceof CouldNotEvaluate) {
        emitCouldNotEvaluate({
          mode: 'self-test', manifest: null, repo: options.repo ?? process.cwd(),
          atRev: null, claims: [], error, json: false,
        });
        return EXIT.couldNotEvaluate;
      }
      throw error;
    }
  }

  const manifestFile = resolvePath(process.cwd(), options.manifest);
  let repo;
  let claims = [];
  let atRev = null;
  try {
    // Manifest identity comes first so manifest_unreadable/schema_invalid
    // outranks revision_unresolved/git_failed.
    const manifest = loadJson(manifestFile);
    if (options.mode === 'legacy') {
      manifestProblemsEarly(legacyProblems(manifest), manifestFile);
    } else {
      manifestProblemsEarly(manifestProblems(manifest), manifestFile);
    }
    repo = resolveRepo(options.repo);
    atRev = resolveCommit(repo, options.at ?? 'HEAD', '--at');
    const evaluated = options.mode === 'legacy'
      ? evaluateLegacy(repo, manifest, atRev)
      : { claims: manifest.claims.map((claim) => claim.id),
          findings: manifest.claims.flatMap((claim) => evaluateClaim(repo, claim, atRev, options.reproduce)) };
    claims = evaluated.claims;
    const sorted = sortFindings(evaluated.findings);
    const bound = claims.filter((id) => !sorted.some((finding) => finding.claim === id)).length;
    const verdict = sorted.length === 0 ? 'clean' : 'failed';
    emitResult({
      mode: options.mode, manifest: manifestFile, repo, atRev, verdict,
      claims, bound, findings: sorted, json: options.json,
    });
    return sorted.length === 0 ? EXIT.clean : EXIT.findings;
  } catch (error) {
    if (error instanceof CouldNotEvaluate) {
      emitCouldNotEvaluate({
        mode: options.mode, manifest: manifestFile, repo: repo ?? options.repo ?? process.cwd(),
        atRev, claims, error, json: options.json,
      });
      return EXIT.couldNotEvaluate;
    }
    throw error;
  }
}

let exitCode;
try {
  exitCode = main();
} catch (error) {
  const detail = cleanDetail(error?.message ?? error);
  emitText('could_not_evaluate', 0, 0, [
    { claim: '-', reason: FAILURE_REASON.gitFailed, detail: `unexpected: ${detail}` },
  ]);
  exitCode = EXIT.couldNotEvaluate;
}
process.exitCode = exitCode;
