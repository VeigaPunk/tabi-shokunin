#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const expectedPath = '.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const newlines = bytes => bytes.reduce((n, b) => n + (b === 10), 0);

function fail(finding, detail, exit = 1) {
  throw Object.assign(new Error(detail), { finding, exit });
}

function git(root, ...args) {
  const result = spawnSync('git', args, { cwd: root });
  if (result.error || result.status !== 0) fail('could_not_evaluate', `git ${args[0]} unavailable`, 2);
  return result.stdout;
}

function argumentsOf(args) {
  const options = { repo: defaultRoot, expected: expectedPath };
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--self-test' || flag === '--worktree') options[flag.slice(2)] = true;
    else if (['--repo', '--expected', '--witness'].includes(flag) && args[i + 1] && !args[i + 1].startsWith('--')) options[flag.slice(2)] = args[++i];
    else fail('usage', 'Use --worktree | --witness REV | --self-test; optional --repo PATH --expected PATH', 2);
  }
  if ([options['self-test'], options.worktree, options.witness].filter(Boolean).length !== 1) fail('usage', 'Choose exactly one mode', 2);
  return options;
}

function verify(options, expected) {
  const root = resolve(options.repo);
  const baseline = expected.baseline;
  if (!/^[a-f0-9]{40}$/.test(baseline) || !Number.isSafeInteger(expected.thresholdEpoch)) fail('could_not_evaluate', 'Invalid persisted baseline', 2);
  const witness = options.witness;
  if (witness) {
    const epoch = Number(git(root, 'show', '-s', '--format=%ct', witness).toString().trim());
    if (!Number.isSafeInteger(epoch)) fail('could_not_evaluate', 'Unreadable witness instant', 2);
    if (epoch < expected.thresholdEpoch) fail('witness_too_early', `epoch=${epoch} threshold=${expected.thresholdEpoch}`);
    const ancestry = spawnSync('git', ['merge-base', '--is-ancestor', baseline, witness], { cwd: root });
    if (ancestry.status !== 0) fail('baseline_ancestry', 'Witness must descend from baseline');
  }
  const measured = path => witness ? git(root, 'show', `${witness}:${path}`) : readFileSync(join(root, path));
  const table = measured(expected.table).toString().trimEnd().split('\n');
  if (!table.shift()?.startsWith('# status\ttarget\t')) fail('table_shape', 'Missing pin-table header');
  const rows = table.map(line => line.split('\t'));
  if (rows.some(row => row.length !== 8)) fail('table_shape', 'Expected eight columns');
  const identities = rows.map(row => row[1]);
  if (new Set(identities).size !== rows.length) fail('duplicate_target', 'Repeated target identity');
  const local = git(root, 'ls-tree', '-r', '--name-only', baseline, '--', 'corpus/knowledge', 'reports', 'SKILL.md')
    .toString().trim().split('\n').filter(path => path.endsWith('.md'));
  const targets = [...local, ...expected.publicTargets].sort();
  if (JSON.stringify([...identities].sort()) !== JSON.stringify(targets)) fail('target_set', 'Missing or extra target');
  let lane = 0;
  let publicCount = 0;
  for (const [status, target, observed, lines, prefix, source, baselineHash, revision] of rows) {
    if (status !== 'MATCH' || !/^[a-f0-9]{64}$/.test(observed) || !/^[a-f0-9]{12}$/.test(prefix)) fail('table_shape', `Malformed pin for ${target}`);
    const anchor = /^([a-f0-9]{40}):(SKILL\.md|SCORECARD\.md|LOG\.md):(\d+)-(\d+)$/.exec(source);
    if (!anchor || anchor[1] !== baseline) fail('source_pin', `Unanchored source for ${target}`);
    const sourceLines = git(root, 'show', `${baseline}:${anchor[2]}`).toString().split('\n');
    const start = Number(anchor[3]);
    const end = Number(anchor[4]);
    if (start < 1 || end < start || end > sourceLines.length || !sourceLines.slice(start - 1, end).join('\n').includes(prefix) || !observed.startsWith(prefix)) fail('source_pin', `Independent prefix does not match for ${target}`);
    let bytes;
    if (local.includes(target)) {
      const original = git(root, 'show', `${baseline}:${target}`);
      if (baselineHash !== sha(original) || observed !== baselineHash) fail('baseline_pin', `Wrong baseline digest for ${target}`);
      const wantedRevision = `${target === 'SKILL.md' ? 'pre-append' : 'baseline'}@${baseline}`;
      if (revision !== wantedRevision) fail('baseline_pin', `Wrong measured revision for ${target}`);
      const current = measured(target);
      bytes = target === 'SKILL.md' ? current.subarray(0, original.length) : current;
      if (!bytes.equals(original)) fail('content_drift', `Measured bytes differ for ${target}`);
      if (target === 'SKILL.md' && current.length <= original.length) fail('witness_append', 'Dated SKILL append absent');
      lane++;
    } else {
      if (baselineHash !== 'NA-public-external' || revision !== 'live-public-file') fail('baseline_pin', `Invented external Git baseline for ${target}`);
      bytes = readFileSync(target);
      publicCount++;
    }
    if (sha(bytes) !== observed || String(newlines(bytes)) !== lines) fail('content_drift', `Hash or newline drift for ${target}`);
    console.log(`PIN_MATCH target=${target} sha256=${observed} newlines=${lines}`);
  }
  const finding = witness ? 'freshness_witness' : 'freshness_worktree';
  console.log(`FRESHNESS_GATE verdict=clean finding=${finding} matched=${rows.length} unique=${new Set(identities).size} lane=${lane} public=${publicCount} revision=${witness ?? 'worktree'} baseline=${baseline}`);
}

function selfTest(expected) {
  const root = mkdtempSync(join(tmpdir(), 'tabi-freshness-selftest-'));
  try {
    const put = (path, value) => {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), value);
    };
    const command = (...args) => git(root, ...args);
    const commit = (subject, epoch) => {
      const result = spawnSync('git', ['-c', 'user.name=tabi-selftest', '-c', 'user.email=tabi-selftest@local', 'commit', '-qm', subject], {
        cwd: root,
        env: { ...process.env, GIT_AUTHOR_DATE: `${epoch} +0000`, GIT_COMMITTER_DATE: `${epoch} +0000` },
      });
      if (result.status !== 0) fail('could_not_evaluate', 'Fixture commit failed', 2);
      return command('rev-parse', 'HEAD').toString().trim();
    };
    command('init', '-q');
    const files = { 'SKILL.md': 'fixture skill\n', 'corpus/knowledge/one.md': 'one sourced note\n', 'reports/one.md': 'bounded audit\n' };
    const publicFiles = ['public/plugin.json', 'public/SKILL.md', 'public/operations.md'];
    for (const [path, body] of Object.entries(files)) put(path, body);
    for (const path of publicFiles) put(path, 'public fixture\n');
    const paths = [...Object.keys(files), ...publicFiles];
    put('SCORECARD.md', paths.map(path => `${path} ${sha(readFileSync(join(root, path)))}`).join('\n') + '\n');
    command('add', '--', 'SKILL.md', 'corpus', 'reports', 'SCORECARD.md');
    const baseline = commit('fixture baseline', expected.thresholdEpoch - 100);
    const pinRows = paths.map((path, index) => {
      const bytes = readFileSync(join(root, path));
      const digest = sha(bytes);
      const isPublic = publicFiles.includes(path);
      return ['MATCH', isPublic ? join(root, path) : path, digest, String(newlines(bytes)), digest.slice(0, 12), `${baseline}:SCORECARD.md:${index + 1}-${index + 1}`, isPublic ? 'NA-public-external' : digest, isPublic ? 'live-public-file' : `${path === 'SKILL.md' ? 'pre-append' : 'baseline'}@${baseline}`];
    });
    const tablePath = 'pins.tsv';
    const tableText = rows => '# status\ttarget\tobserved_sha256\tnewlines\texpected_prefix\tsource\tbaseline_sha256\trevision\n' + rows.map(row => row.join('\t')).join('\n') + '\n';
    const reset = () => {
      put('SKILL.md', files['SKILL.md'] + 'dated witness append\n');
      put('corpus/knowledge/one.md', files['corpus/knowledge/one.md']);
      put(tablePath, tableText(pinRows));
    };
    const fixtureExpected = { ...expected, baseline, table: tablePath, publicTargets: publicFiles.map(path => join(root, path)) };
    put('expected.json', JSON.stringify(fixtureExpected));
    reset();
    command('add', '--', 'SKILL.md', tablePath);
    const witness = commit('fixture witness', expected.thresholdEpoch + 100);
    for (const test of expected.selftest) {
      reset();
      let mode = ['--worktree'];
      if (test.name === 'witness_clean') mode = ['--witness', witness];
      else if (test.name === 'duplicate_target') put(tablePath, tableText([...pinRows, pinRows[0]]));
      else if (test.name === 'missing_target') put(tablePath, tableText(pinRows.slice(1)));
      else if (test.name === 'changed_bytes') put('corpus/knowledge/one.md', 'changed consumer-facing source\n');
      else if (test.name === 'wrong_source_pin') {
        const changed = pinRows.map(row => [...row]);
        changed[0][4] = '000000000000';
        put(tablePath, tableText(changed));
      } else if (test.name === 'early_witness') mode = ['--witness', baseline];
      else if (test.name === 'unavailable_revision') mode = ['--witness', '0000000000000000000000000000000000000000'];
      else if (test.name !== 'worktree_clean') fail('could_not_evaluate', `Unknown self-test ${test.name}`, 2);
      const result = spawnSync(process.execPath, [script, '--repo', root, '--expected', 'expected.json', ...mode], { encoding: 'utf8' });
      const output = result.stdout + result.stderr;
      const match = result.status === test.exit && output.includes(`finding=${test.finding}`);
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${result.status} expected_finding=${test.finding} result=${match ? 'PASS' : 'FAIL'}`);
      if (!match) fail('selftest_failure', output);
    }
    console.log(`FRESHNESS_SELFTEST verdict=clean cases=${expected.selftest.length}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

try {
  const options = argumentsOf(process.argv.slice(2));
  const expected = JSON.parse(readFileSync(resolve(options.repo, options.expected), 'utf8'));
  if (options['self-test']) selfTest(expected);
  else verify(options, expected);
} catch (error) {
  const exit = error.exit ?? 2;
  console.error(`FRESHNESS_GATE verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'} detail=${error.message}`);
  process.exitCode = exit;
}
