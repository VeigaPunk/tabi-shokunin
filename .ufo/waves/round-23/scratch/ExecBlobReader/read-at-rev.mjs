#!/usr/bin/env node
// read-at-rev.mjs — shell-free, tree-independent read of ONE committed blob.
// usage: node read-at-rev.mjs <rev> <path> [repo]
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const DEFAULT_REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
// Isolated, worktree-free git environment: no user/system config, no replace refs.
const ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_NO_REPLACE_OBJECTS: '1',
  GIT_TERMINAL_PROMPT: '0',
  GIT_OPTIONAL_LOCKS: '0',
  LC_ALL: 'C',
};

// argv array + shell:false => no shell, no globbing, no interpolation anywhere.
function git(repo, args, cwd = '/') {
  return execFileSync('git', ['-C', repo, ...args], {
    cwd, env: ENV, shell: false, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26,
  });
}

function die(code, msg) { process.stderr.write(`${msg}\n`); process.exit(code); }

const [rev, path, repoArg] = process.argv.slice(2);
if (!rev || !path) die(2, 'usage: read-at-rev.mjs <rev> <path> [repo]');
if (!/^[0-9a-f]{7,40}$/.test(rev)) die(2, `refused: rev is not hex-only: ${JSON.stringify(rev)}`);
// absolute path: git runs with cwd='/', so a relative -C would resolve elsewhere
const repo = resolve(repoArg ?? DEFAULT_REPO);

let commit, blob;
try { commit = git(repo, ['rev-parse', '--verify', '--end-of-options', `${rev}^{commit}`]).toString().trim(); }
catch { die(2, `refused: no commit ${rev} visible in ${repo}`); }
try { blob = git(repo, ['rev-parse', '--verify', '--end-of-options', `${commit}:${path}`]).toString().trim(); }
catch { die(3, `missing: ${path} does not exist at ${commit}`); }
if (!/^[0-9a-f]{40}$/.test(blob) || git(repo, ['cat-file', '-t', blob]).toString().trim() !== 'blob')
  die(2, `refused: ${path} at ${rev} is not a blob`);
if (!/^[0-9a-f]{40}$/.test(commit)) die(2, `refused: ${commit} is not a full commit id`);

const size = Number(git(repo, ['cat-file', '-s', blob]).toString().trim());
const data = git(repo, ['cat-file', 'blob', blob]);            // bytes from the object DB only
const sha1 = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
if (data.length !== size || sha1 !== blob)                      // fail closed on any drift
  die(2, `refused: read ${data.length}/${size} bytes, sha1 ${sha1} != blob ${blob}`);

process.stdout.write(JSON.stringify({
  rev: commit, path, blob, bytes: data.length,
  sha256: createHash('sha256').update(data).digest('hex'), sha1,
  head: data.toString('utf8').split('\n', 1)[0],
}) + '\n');
