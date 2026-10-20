#!/usr/bin/env node
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const laneRoot = resolve(dirname(scriptPath), '..');
const revisionPattern = /^[a-f0-9]{40}$/;
const maxBuffer = 16 * 1024 * 1024;

class WitnessError extends Error {
  constructor(finding, detail, exit = 2) {
    super(detail);
    this.finding = finding;
    this.exit = exit;
  }
}

function refused(detail) {
  throw new WitnessError('witness_revision_refused', detail);
}

function usage(detail) {
  throw new WitnessError('witness_usage', detail);
}

function gitEnvironment(root) {
  const env = {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    GIT_CEILING_DIRECTORIES: (() => {
      try {
        return resolve(realpathSync(root), '..');
      } catch {
        return resolve(root, '..');
      }
    })(),
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) {
    env.PATH = process.env.PATH.split(':').filter(entry => entry.startsWith('/')).join(':');
  }
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  return env;
}

function git(root, args) {
  try {
    return spawnSync('git', args, {
      cwd: root,
      env: gitEnvironment(root),
      encoding: 'utf8',
      maxBuffer,
    });
  } catch (error) {
    return { error, status: null, stdout: '', stderr: '' };
  }
}

function requireGit(root, args) {
  const result = git(root, args);
  if (result.error || result.status !== 0) {
    refused(`git ${args[0]} failed`);
  }
  return result.stdout;
}

function laneRef(root) {
  const top = git(root, ['rev-parse', '--show-toplevel']);
  let sameRepo = false;
  try {
    sameRepo = top.status === 0 && realpathSync(top.stdout.trim()) === realpathSync(root);
  } catch {
    sameRepo = false;
  }
  if (!sameRepo) refused('Lane root is not the repository toplevel');

  const sym = git(root, ['symbolic-ref', '-q', '--no-recurse', 'HEAD']);
  let ref;
  if (sym.status === 0) {
    if (!/^refs\/heads\/[^\x00-\x20\x7f~^:?*\[\\]+\n$/.test(sym.stdout)) {
      refused('HEAD does not name a local branch');
    }
    ref = sym.stdout.slice(0, -1);
  } else if (sym.status === 1 && sym.stdout === '') {
    ref = 'refs/heads/master';
  } else {
    refused('git symbolic-ref could not read HEAD');
  }

  const valid = git(root, ['check-ref-format', ref]);
  if (valid.error || valid.status !== 0) refused('Lane-tip anchor is not a valid ref name');
  const anchor = git(root, ['for-each-ref', '--format=%(symref)', '--', ref]);
  if (anchor.error || anchor.status !== 0 || anchor.stdout !== '\n') {
    refused(`Lane-tip anchor ${ref} is not a plain local branch`);
  }
  const resolved = git(root, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
  const tip = resolved.status === 0 ? resolved.stdout.trim() : '';
  if (resolved.error || !revisionPattern.test(tip)) {
    refused(`Lane-tip anchor ${ref} does not resolve to a commit`);
  }
  return { tip, source: ref };
}

function parseArguments(args) {
  const options = { revision: null, dryRun: false, selfTest: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--rev') {
      if (options.revision !== null) usage('Use --rev at most once');
      const value = args[++index];
      if (value === undefined || value.startsWith('-') || !revisionPattern.test(value)) {
        refused('--rev requires a 40-hex commit revision');
      }
      options.revision = value;
    } else if (arg === '--dry-run') {
      if (options.dryRun) usage('Use --dry-run at most once');
      options.dryRun = true;
    } else if (arg === '--self-test') {
      if (options.selfTest) usage('Use --self-test at most once');
      options.selfTest = true;
    } else {
      usage(`Unknown argument: ${arg}`);
    }
  }
  if (options.selfTest && (options.revision !== null || options.dryRun)) {
    usage('--self-test cannot be combined with other options');
  }
  return options;
}

function resolveRevision(root, options) {
  if (options.revision !== null) {
    const ancestry = git(root, ['merge-base', '--is-ancestor', options.revision, 'refs/heads/master']);
    if (ancestry.error || ancestry.status !== 0) {
      refused('--rev must be an ancestor of refs/heads/master');
    }
    return { tip: options.revision, source: '--rev' };
  }

  return laneRef(root);
}

function invocation(revision, root) {
  const args = ['--', join(root, 'scripts', 'check-freshness.mjs'), '--witness', revision];
  return [process.execPath, ...args];
}

function printPlan(revision, source, root, dryRun) {
  const firstLine = `FRESHNESS_WITNESS tip=${revision} source=${source}`;
  process.stdout.write(`${firstLine}\n`);
  const argv = invocation(revision, root);
  if (dryRun) process.stdout.write(`FRESHNESS_WITNESS argv=${JSON.stringify(argv)}\n`);
  return argv;
}

function assert(condition, detail) {
  if (!condition) throw new Error(detail);
}

function runFixtureWrapper(root, fixtureScript, args) {
  try {
    return spawnSync(process.execPath, ['--', fixtureScript, ...args], {
      cwd: root,
      env: gitEnvironment(root),
      encoding: 'utf8',
      maxBuffer,
    });
  } catch (error) {
    return { error, status: null, stdout: '', stderr: String(error) };
  }
}

function assertRefused(root, fixtureScript, args) {
  const result = runFixtureWrapper(root, fixtureScript, args);
  assert(!result.error && result.status === 2, `${args.join(' ')} did not exit 2`);
  assert(result.stderr.includes('finding=witness_revision_refused'), `${args.join(' ')} did not report witness_revision_refused`);
}

function runSelfTest() {
  const root = mkdtempSync(join(tmpdir(), 'tabi-freshness-witness-'));
  let cases = 0;
  let failed = 0;
  const test = (name, body) => {
    cases++;
    try {
      body();
    } catch (error) {
      failed++;
      process.stderr.write(`FRESHNESS_WITNESS_SELFTEST_FAIL case=${name} detail=${String(error.message || error).replace(/[\r\n]/g, ' ')}\n`);
    }
  };

  try {
    mkdirSync(join(root, 'scripts'), { recursive: true });
    writeFileSync(join(root, 'scripts', 'freshness-witness.mjs'), readFileSync(scriptPath));
    requireGit(root, ['init', '--quiet', '--initial-branch=master']);
    writeFileSync(join(root, 'master.txt'), 'master tip\n');
    requireGit(root, ['add', '--', 'master.txt']);
    requireGit(root, ['-c', 'user.name=tabi-witness-selftest', '-c', 'user.email=tabi-witness-selftest@local', 'commit', '--quiet', '-m', 'master tip']);
    const masterTip = requireGit(root, ['rev-parse', '--verify', '--end-of-options', 'refs/heads/master^{commit}']).trim();

    requireGit(root, ['switch', '--quiet', '--create', 'poison']);
    writeFileSync(join(root, 'poison.txt'), 'off-branch poison\n');
    requireGit(root, ['add', '--', 'poison.txt']);
    requireGit(root, ['-c', 'user.name=tabi-witness-selftest', '-c', 'user.email=tabi-witness-selftest@local', 'commit', '--quiet', '-m', 'off-branch poison']);
    const poison = requireGit(root, ['rev-parse', '--verify', '--end-of-options', 'HEAD^{commit}']).trim();
    requireGit(root, ['switch', '--quiet', '--detach', poison]);

    test('detached dry-run anchors master', () => {
      const result = runFixtureWrapper(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--dry-run']);
      assert(!result.error && result.status === 0, 'detached dry-run failed');
      assert(result.stdout.startsWith(`FRESHNESS_WITNESS tip=${masterTip} source=refs/heads/master\n`), 'detached dry-run did not resolve master tip');
      assert(result.stdout.includes('FRESHNESS_WITNESS argv='), 'detached dry-run omitted argv');
    });
    test('attached branch anchors its own tip', () => {
      requireGit(root, ['switch', '--quiet', 'poison']);
      const result = runFixtureWrapper(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--dry-run']);
      assert(!result.error && result.status === 0, 'attached dry-run failed');
      assert(result.stdout.startsWith(`FRESHNESS_WITNESS tip=${poison} source=refs/heads/poison\n`), 'attached dry-run did not resolve its branch');
      requireGit(root, ['switch', '--quiet', '--detach', poison]);
    });
    test('HEAD revision refused', () => assertRefused(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--rev', 'HEAD']));
    test('short revision refused', () => assertRefused(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--rev', masterTip.slice(0, 12)]));
    test('dash-led revision refused', () => assertRefused(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--rev', '--dry-run']));
    test('non-ancestor revision refused', () => assertRefused(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--rev', poison]));
    test('valid master revision accepted', () => {
      const result = runFixtureWrapper(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--rev', masterTip, '--dry-run']);
      assert(!result.error && result.status === 0, 'ancestor revision was not accepted');
      assert(result.stdout.startsWith(`FRESHNESS_WITNESS tip=${masterTip} source=--rev\n`), 'ancestor revision was not reported');
    });
    test('non-branch symbolic HEAD refused', () => {
      requireGit(root, ['symbolic-ref', 'HEAD', 'refs/tags/not-a-branch']);
      assertRefused(root, join(root, 'scripts', 'freshness-witness.mjs'), ['--dry-run']);
    });
  } catch (error) {
    failed++;
    process.stderr.write(`FRESHNESS_WITNESS_SELFTEST_FAIL case=fixture detail=${String(error.message || error).replace(/[\r\n]/g, ' ')}\n`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  process.stdout.write(`FRESHNESS_WITNESS_SELFTEST cases=${cases} failed=${failed}\n`);
  return failed === 0 ? 0 : 1;
}

function main(args) {
  const options = parseArguments(args);
  if (options.selfTest) return runSelfTest();

  const selected = resolveRevision(laneRoot, options);
  const argv = printPlan(selected.tip, selected.source, laneRoot, options.dryRun);
  if (options.dryRun) return 0;

  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: laneRoot,
    env: gitEnvironment(laneRoot),
    stdio: 'inherit',
  });
  if (result.error) {
    process.stderr.write(`FRESHNESS_WITNESS finding=witness_spawn_failed detail=${String(result.error.message).replace(/[\r\n]/g, ' ')}\n`);
    return 2;
  }
  return result.status ?? 1;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  if (error instanceof WitnessError) {
    process.stderr.write(`FRESHNESS_WITNESS finding=${error.finding} detail=${String(error.message).replace(/[\r\n]/g, ' ')}\n`);
    process.exitCode = error.exit;
  } else {
    process.stderr.write(`FRESHNESS_WITNESS finding=witness_internal_error detail=${String(error.message || error).replace(/[\r\n]/g, ' ')}\n`);
    process.exitCode = 2;
  }
}
