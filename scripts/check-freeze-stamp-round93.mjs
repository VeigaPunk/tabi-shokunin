#!/usr/bin/env node
'use strict';

// check-freeze-stamp-round93.mjs — freeze-stamp (mined-mistake) gate for the r92
// future-dated freeze stamp; applies to every round with claims.json.
//
// Usage:
//   node check-freeze-stamp-round93.mjs --lane <ABS lane> --round <N> [--json]
//   node check-freeze-stamp-round93.mjs --selftest --scratch <ABS dir>
//
// For round N it reads `.ufo/waves/round-N/claims.json` at the lane's master tip
// (`git -C <lane> show master:<path>`, read-only git only), finds the commit that
// first added that path (`git -C <lane> log --diff-filter=A --format='%H %cI'
// master -- <path>`, the oldest line), and compares claims.frozenAt (ISO 8601
// with offset) with that commit's committer time:
//   - frozenAt > commit time  -> finding `future-frozenAt`      (exit 1)
//   - frozenAt missing/unparseable -> finding `frozenAt-unparseable` (exit 1)
//   - path absent at master   -> verdict `setup`                  (exit 2)
//   - usage errors            -> exit 2
//   - else                    -> clean                            (exit 0)
//
// JSON output (with --json): {gate, round, path, addedIn, committedAt, frozenAt,
// verdict, findings} where addedIn is the adding commit hash, committedAt its
// committer time (%cI), frozenAt the raw claims.json value (or null), verdict
// one of `clean` | `finding` | `setup`, findings the list of finding ids.
// Exit codes: 0 = clean, 1 = findings (or selftest mismatch/error), 2 = usage
//   (missing lane/round/scratch, unresolvable `master`, unknown flag, relative
//   --lane/--scratch) or setup (path absent at master / in master history).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TOOL = 'check-freeze-stamp-round93';

// ISO 8601 with time and offset (Z or ±HH:MM / ±HHMM); date-only or offset-less
// values count as unparseable per the frozen wording.
const ISO8601_OFFSET = /^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?([Zz]|[+-]\d{2}:?\d{2})$/;

function usageError(msg) {
  console.error(`error: ${msg}`);
  console.error(`usage: node ${TOOL}.mjs --lane <ABS lane> --round <N> [--json]`);
  console.error(`       node ${TOOL}.mjs --selftest --scratch <ABS dir> [--json]`);
  process.exit(2);
}

function git(lane, args, extra = {}) {
  return spawnSync('git', ['-C', lane, ...args], { maxBuffer: 512 * 1024 * 1024, ...extra });
}

function gitOk(res) {
  return !res.error && res.status === 0;
}

function parseArgs(argv) {
  const opts = { lane: null, round: null, roundRaw: null, json: false, selftest: false, scratch: null };
  const take = (flag, i) => {
    if (i + 1 >= argv.length) usageError(`${flag} requires a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane') { opts.lane = take(a, i); i++; }
    else if (a === '--round') { opts.roundRaw = take(a, i); i++; }
    else if (a === '--scratch') { opts.scratch = take(a, i); i++; }
    else if (a === '--json') opts.json = true;
    else if (a === '--selftest') opts.selftest = true;
    else usageError(`unknown argument: ${a}`);
  }
  if (opts.selftest) {
    if (opts.lane !== null || opts.roundRaw !== null) usageError('--selftest does not take --lane/--round');
  } else {
    if (opts.scratch !== null) usageError('--scratch requires --selftest');
  }
  return opts;
}

function claimsPath(round) {
  return `.ufo/waves/round-${round}/claims.json`;
}

// Pure check against one repo; no process.exit inside (testable by selftest).
// Returns { result, exitCode }; result is the JSON output object.
function checkRound(lane, round) {
  const p = claimsPath(round);
  const base = { gate: TOOL, round, path: p, addedIn: null, committedAt: null, frozenAt: null };

  // Resolve master first: an unresolvable master is a usage error, not setup.
  const masterRes = git(lane, ['rev-parse', '--verify', 'master^{commit}']);
  if (!gitOk(masterRes)) return { usageError: `unresolvable master in lane: ${lane}` };

  const showRes = git(lane, ['show', `master:${p}`]);
  if (!gitOk(showRes)) {
    return { result: { ...base, verdict: 'setup', findings: [] }, exitCode: 2 };
  }

  const logRes = git(lane, ['log', '--diff-filter=A', "--format=%H %cI", 'master', '--', p]);
  if (!gitOk(logRes)) return { usageError: `git log failed in lane: ${lane}` };
  const lines = logRes.stdout.toString('utf8').split('\n').map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) return { result: { ...base, verdict: 'setup', findings: [] }, exitCode: 2 };
  const oldest = lines[lines.length - 1];
  const sp = oldest.indexOf(' ');
  const addedIn = oldest.slice(0, sp);
  const committedAt = oldest.slice(sp + 1).trim();

  let frozenAt = null;
  try {
    const claims = JSON.parse(showRes.stdout.toString('utf8'));
    if (typeof claims?.frozenAt === 'string' && claims.frozenAt !== '') frozenAt = claims.frozenAt;
  } catch {
    frozenAt = null;
  }

  const findings = [];
  let frozenMs = NaN;
  if (typeof frozenAt !== 'string' || !ISO8601_OFFSET.test(frozenAt) || Number.isNaN(Date.parse(frozenAt))) {
    findings.push('frozenAt-unparseable');
  } else {
    frozenMs = Date.parse(frozenAt);
    const commitMs = Date.parse(committedAt);
    if (!Number.isNaN(commitMs) && frozenMs > commitMs) findings.push('future-frozenAt');
  }

  const verdict = findings.length === 0 ? 'clean' : 'finding';
  return { result: { ...base, addedIn, committedAt, frozenAt, verdict, findings }, exitCode: findings.length === 0 ? 0 : 1 };
}

function runCheck(opts) {
  if (!opts.lane) usageError('missing --lane');
  if (!path.isAbsolute(opts.lane)) usageError('--lane must be an absolute path');
  if (opts.roundRaw === null) usageError('missing --round');
  if (!/^\d+$/.test(opts.roundRaw)) usageError(`--round must be an integer, got: ${opts.roundRaw}`);
  const round = Number(opts.roundRaw);
  if (!Number.isSafeInteger(round) || round < 1) usageError(`--round must be a positive integer, got: ${opts.roundRaw}`);
  let st;
  try { st = fs.statSync(opts.lane); } catch { usageError(`lane not found: ${opts.lane}`); }
  if (!st.isDirectory()) usageError(`lane is not a directory: ${opts.lane}`);

  const { result, exitCode, usageError: usageMsg } = checkRound(opts.lane, round);
  if (usageMsg) usageError(usageMsg);
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${TOOL} round=${result.round} path=${result.path} addedIn=${result.addedIn} committedAt=${result.committedAt} frozenAt=${result.frozenAt} verdict=${result.verdict} findings=${result.findings.join(',') || 'none'}`);
  }
  process.exit(exitCode);
}

function mustGit(dir, args, what, extra = {}) {
  const res = git(dir, args, extra);
  if (!gitOk(res)) {
    const err = res.stderr ? res.stderr.toString('utf8').trim() : '';
    const detail = res.error ? String(res.error) : (err || `exit ${res.status}`);
    throw new Error(`git ${args.join(' ')} failed (${what}): ${detail}`);
  }
  return res;
}

function runSelftest(opts) {
  if (!opts.scratch) usageError('missing --scratch (required for --selftest)');
  if (!path.isAbsolute(opts.scratch)) usageError('--scratch must be an absolute path');
  fs.mkdirSync(opts.scratch, { recursive: true });
  const D = fs.mkdtempSync(path.join(opts.scratch, 'fixture-'));
  try {
    mustGit(D, ['init', '-q', '-b', 'master'], 'init');
    const top = mustGit(D, ['rev-parse', '--show-toplevel'], 'toplevel').stdout.toString('utf8').trim();
    if (path.resolve(top) !== fs.realpathSync(D)) {
      throw new Error(`toplevel ${top} does not equal fixture dir ${D}`);
    }
    mustGit(D, ['config', 'user.name', 'Selftest'], 'config');
    mustGit(D, ['config', 'user.email', 'selftest@example.invalid'], 'config');

    // One commit per round path, committer date pinned to 2026-11-08T20:00:00-03:00.
    const commitDate = '2026-11-08T20:00:00-03:00';
    const env = { env: { ...process.env, GIT_AUTHOR_DATE: commitDate, GIT_COMMITTER_DATE: commitDate } };
    const rounds = [
      { round: 1, frozenAt: '2026-11-08T19:00:00-03:00', verdict: 'clean', findings: [], exitCode: 0 },
      { round: 2, frozenAt: '2026-11-08T21:00:00-03:00', verdict: 'finding', findings: ['future-frozenAt'], exitCode: 1 },
      { round: 3, frozenAt: 'garbage', verdict: 'finding', findings: ['frozenAt-unparseable'], exitCode: 1 },
    ];
    for (const r of rounds) {
      const dir = path.join(D, '.ufo', 'waves', `round-${r.round}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'claims.json'), JSON.stringify({ frozenAt: r.frozenAt }) + '\n');
      mustGit(D, ['add', '-A'], 'add round');
      mustGit(D, ['commit', '-qm', `round-${r.round}`], 'commit round', env);
    }
    const masterSha = mustGit(D, ['rev-parse', '--verify', 'master^{commit}'], 'rev master').stdout.toString('utf8').trim();

    const cases = rounds.map((r) => {
      const { result, exitCode } = checkRound(D, r.round);
      const pass = result.verdict === r.verdict
        && JSON.stringify(result.findings) === JSON.stringify(r.findings)
        && exitCode === r.exitCode;
      return { round: r.round, frozenAt: r.frozenAt, expectedVerdict: r.verdict, verdict: result.verdict, expectedFindings: r.findings, findings: result.findings, expectedExitCode: r.exitCode, exitCode, pass };
    });
    const pass = cases.every((c) => c.pass);
    const out = { gate: TOOL, selftest: true, fixture: D, masterSha, cases, pass };
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(`selftest ${pass ? 'PASS' : 'FAIL'} fixture=${D} master=${masterSha}`);
      for (const c of cases) console.log(`round-${c.round}: verdict=${c.verdict} findings=${c.findings.join(',') || 'none'} exit=${c.exitCode} ${c.pass ? 'ok' : 'MISMATCH'}`);
    }
    if (pass) fs.rmSync(D, { recursive: true, force: true });
    else console.log(`fixture retained for inspection: ${D}`);
    process.exit(pass ? 0 : 1);
  } catch (e) {
    console.error(`selftest error: ${e.message}`);
    console.error(`fixture (if any): ${D}`);
    process.exit(1);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.selftest) { runSelftest(opts); return; }
  runCheck(opts);
}

main();
