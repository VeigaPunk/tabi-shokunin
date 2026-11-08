#!/usr/bin/env node
'use strict';

// check-append-only-round92.mjs — append-only file checker (round 92, mined-mistake fix).
//
// Usage:
//   node check-append-only-round92.mjs --lane <ABS lane> --base <rev> --tip <rev> [--json] -- <repo-relative path>...
//   node check-append-only-round92.mjs --selftest --scratch <ABS dir> [--json]
//
// For each path, bytes are read with `git -C <lane> show <rev>:<path>` (read-only git only):
//   - absent at base                        -> status "new"       (ok, not a finding)
//   - absent at tip                         -> status "deleted"   (finding)
//   - base bytes are a byte-exact prefix of tip bytes -> status "ok" (not a finding)
//   - otherwise                             -> status "rewritten" (finding) with `offset`
//     (first differing byte offset) and `line` (1-based line of that offset in the base file)
//
// JSON output (with --json): {tool, base, tip, baseRev, tipRev, files, findings}
//   baseRev/tipRev are the resolved full commit hashes.
// Exit codes: 0 = no findings, 1 = findings (or selftest mismatch/error), 2 = usage
//   (missing lane/revs/paths, unresolvable rev, unknown flag, relative --lane/--scratch).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TOOL = 'check-append-only-round92';

function usageError(msg) {
  console.error(`error: ${msg}`);
  console.error('usage: node check-append-only-round92.mjs --lane <ABS lane> --base <rev> --tip <rev> [--json] -- <repo-relative path>...');
  console.error('       node check-append-only-round92.mjs --selftest --scratch <ABS dir> [--json]');
  process.exit(2);
}

function git(lane, args) {
  return spawnSync('git', ['-C', lane, ...args], { maxBuffer: 512 * 1024 * 1024 });
}

function gitOk(res) {
  return !res.error && res.status === 0;
}

function parseArgs(argv) {
  const opts = { lane: null, base: null, tip: null, json: false, selftest: false, scratch: null, paths: [] };
  const take = (flag, i) => {
    if (i + 1 >= argv.length) usageError(`${flag} requires a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { opts.paths = argv.slice(i + 1); break; }
    else if (a === '--lane') { opts.lane = take(a, i); i++; }
    else if (a === '--base') { opts.base = take(a, i); i++; }
    else if (a === '--tip') { opts.tip = take(a, i); i++; }
    else if (a === '--scratch') { opts.scratch = take(a, i); i++; }
    else if (a === '--json') opts.json = true;
    else if (a === '--selftest') opts.selftest = true;
    else usageError(`unknown argument: ${a}`);
  }
  return opts;
}

function resolveRev(lane, rev) {
  const res = git(lane, ['rev-parse', '--verify', `${rev}^{commit}`]);
  if (!gitOk(res)) return null;
  const sha = res.stdout.toString('utf8').trim();
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
}

function readBlob(lane, rev, p) {
  const res = git(lane, ['show', `${rev}:${p}`]);
  if (res.error) return { exists: false };
  if (res.status !== 0) return { exists: false };
  return { exists: true, buf: res.stdout };
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let k = 0; k < n; k++) if (a[k] !== b[k]) return k;
  return a.length === b.length ? -1 : n;
}

function lineOf(base, offset) {
  let line = 1;
  for (let k = 0; k < offset && k < base.length; k++) if (base[k] === 10) line++;
  return line;
}

function classifyPath(lane, baseRev, tipRev, p) {
  const base = readBlob(lane, baseRev, p);
  const tip = readBlob(lane, tipRev, p);
  if (!base.exists) return { path: p, status: 'new' };
  if (!tip.exists) return { path: p, status: 'deleted' };
  const b = base.buf, t = tip.buf;
  if (b.length <= t.length && t.subarray(0, b.length).equals(b)) return { path: p, status: 'ok' };
  const off = firstDiff(b, t);
  return { path: p, status: 'rewritten', offset: off, line: lineOf(b, off) };
}

function runCheck(opts) {
  if (!opts.lane) usageError('missing --lane');
  if (!path.isAbsolute(opts.lane)) usageError('--lane must be an absolute path');
  if (!opts.base) usageError('missing --base');
  if (!opts.tip) usageError('missing --tip');
  if (!opts.paths || opts.paths.length === 0) usageError('missing paths after --');
  let st;
  try { st = fs.statSync(opts.lane); } catch { usageError(`lane not found: ${opts.lane}`); }
  if (!st.isDirectory()) usageError(`lane is not a directory: ${opts.lane}`);
  const baseRev = resolveRev(opts.lane, opts.base);
  if (!baseRev) usageError(`unresolvable base rev: ${opts.base}`);
  const tipRev = resolveRev(opts.lane, opts.tip);
  if (!tipRev) usageError(`unresolvable tip rev: ${opts.tip}`);
  const files = opts.paths.map((p) => classifyPath(opts.lane, baseRev, tipRev, p));
  const findings = files.filter((f) => f.status === 'deleted' || f.status === 'rewritten').length;
  const out = { tool: TOOL, base: opts.base, tip: opts.tip, baseRev, tipRev, files, findings };
  if (opts.json) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`${TOOL} base=${opts.base} (${baseRev}) tip=${opts.tip} (${tipRev}) findings=${findings}`);
    for (const f of files) {
      if (f.status === 'rewritten') console.log(`${f.path}: rewritten offset=${f.offset} line=${f.line}`);
      else console.log(`${f.path}: ${f.status}`);
    }
  }
  process.exit(findings === 0 ? 0 : 1);
}

function mustGit(lane, args, what) {
  const res = git(lane, args);
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
    mustGit(D, ['init', '-q'], 'init');
    const top = mustGit(D, ['rev-parse', '--show-toplevel'], 'toplevel').stdout.toString('utf8').trim();
    if (path.resolve(top) !== fs.realpathSync(D)) {
      throw new Error(`toplevel ${top} does not equal fixture dir ${D}`);
    }
    mustGit(D, ['config', 'user.name', 'Selftest'], 'config');
    mustGit(D, ['config', 'user.email', 'selftest@example.invalid'], 'config');
    fs.writeFileSync(path.join(D, 'append.txt'), 'line1\nline2\n');
    fs.writeFileSync(path.join(D, 'edit.txt'), 'alpha\nbeta\ngamma\n');
    fs.writeFileSync(path.join(D, 'del.txt'), 'to be deleted\n');
    mustGit(D, ['add', '-A'], 'add base');
    mustGit(D, ['commit', '-qm', 'base'], 'commit base');
    const baseRev = mustGit(D, ['rev-parse', '--verify', 'HEAD^{commit}'], 'rev base').stdout.toString('utf8').trim();
    fs.writeFileSync(path.join(D, 'append.txt'), 'line1\nline2\nline3\n');
    fs.writeFileSync(path.join(D, 'edit.txt'), 'alpha\nbeta\ngamma-changed\n');
    fs.rmSync(path.join(D, 'del.txt'));
    fs.writeFileSync(path.join(D, 'new.txt'), 'brand new\n');
    mustGit(D, ['add', '-A'], 'add tip');
    mustGit(D, ['commit', '-qm', 'tip'], 'commit tip');
    const tipRev = mustGit(D, ['rev-parse', '--verify', 'HEAD^{commit}'], 'rev tip').stdout.toString('utf8').trim();
    const expected = { 'append.txt': 'ok', 'edit.txt': 'rewritten', 'del.txt': 'deleted', 'new.txt': 'new' };
    const files = Object.keys(expected).map((p) => classifyPath(D, baseRev, tipRev, p));
    const pass = files.every((f) => f.status === expected[f.path]);
    const findings = files.filter((f) => f.status === 'deleted' || f.status === 'rewritten').length;
    const out = { tool: TOOL, selftest: true, fixture: D, baseRev, tipRev, files, findings, pass };
    if (opts.json) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(`selftest ${pass ? 'PASS' : 'FAIL'} fixture=${D} base=${baseRev} tip=${tipRev}`);
      for (const f of files) console.log(`${f.path}: ${f.status} (expected ${expected[f.path]})`);
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
