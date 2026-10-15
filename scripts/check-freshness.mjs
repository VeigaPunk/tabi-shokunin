#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { closeSync, constants, fstatSync, mkdtempSync, openSync, readFileSync, realpathSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const expectedPath = '.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json';
const tablePath = 'corpus/evidence/fleet-round-1-freshness/pins.tsv';
const publicTargets = Object.freeze([
  '/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json',
  '/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md',
  '/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md',
]);
const fixturePublicPaths = ['public/plugin.json', 'public/SKILL.md', 'public/operations.md'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const newlines = bytes => bytes.reduce((n, b) => n + (b === 10), 0);

function fail(finding, detail, exit = 1) {
  throw Object.assign(new Error(detail), { finding, exit });
}

function regularBytes(path) {
  const absolute = resolve(path);
  if (realpathSync(absolute) !== absolute) fail('unsafe_file', 'Symlinked input refused', 2);
  const fd = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!fstatSync(fd).isFile()) fail('unsafe_file', 'Non-regular input refused', 2);
    return readFileSync(fd);
  } finally {
    closeSync(fd);
  }
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
  const fixture = root !== defaultRoot;
  if (JSON.stringify(expected.publicTargets) !== JSON.stringify(publicTargets)) fail('public_allowlist', 'Expected metadata cannot add public read targets');
  if (expected.table !== (fixture ? 'pins.tsv' : tablePath)) fail('table_allowlist', 'Expected metadata cannot redirect the pin table');
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
  const measured = path => witness ? git(root, 'show', `${witness}:${path}`) : regularBytes(join(root, path));
  const table = measured(expected.table).toString().trimEnd().split('\n');
  if (!table.shift()?.startsWith('# status\ttarget\t')) fail('table_shape', 'Missing pin-table header');
  const rows = table.map(line => line.split('\t'));
  if (rows.some(row => row.length !== 8)) fail('table_shape', 'Expected eight columns');
  const identities = rows.map(row => row[1]);
  if (new Set(identities).size !== rows.length) fail('duplicate_target', 'Repeated target identity');
  const local = git(root, 'ls-tree', '-r', '--name-only', baseline, '--', 'corpus/knowledge', 'reports', 'SKILL.md')
    .toString().trim().split('\n').filter(path => path.endsWith('.md'));
  const targets = [...local, ...publicTargets].sort();
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
      const publicIndex = publicTargets.indexOf(target);
      if (publicIndex < 0) fail('public_allowlist', 'Unrecognized public target');
      bytes = regularBytes(fixture ? join(root, fixturePublicPaths[publicIndex]) : publicTargets[publicIndex]);
      publicCount++;
    }
    if (sha(bytes) !== observed || String(newlines(bytes)) !== lines) fail('content_drift', `Hash or newline drift for ${target}`);
    console.log(`PIN_MATCH target=${target} sha256=${observed} newlines=${lines}`);
  }
  const finding = witness ? 'freshness_witness' : 'freshness_worktree';
  console.log(`FRESHNESS_GATE verdict=clean finding=${finding} matched=${rows.length} unique=${new Set(identities).size} lane=${lane} public=${publicCount} revision=${witness ?? 'worktree'} baseline=${baseline} profile=${fixture ? 'fixture' : 'production'}`);
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
      return ['MATCH', isPublic ? publicTargets[publicFiles.indexOf(path)] : path, digest, String(newlines(bytes)), digest.slice(0, 12), `${baseline}:SCORECARD.md:${index + 1}-${index + 1}`, isPublic ? 'NA-public-external' : digest, isPublic ? 'live-public-file' : `${path === 'SKILL.md' ? 'pre-append' : 'baseline'}@${baseline}`];
    });
    const tablePath = 'pins.tsv';
    const tableText = rows => '# status\ttarget\tobserved_sha256\tnewlines\texpected_prefix\tsource\tbaseline_sha256\trevision\n' + rows.map(row => row.join('\t')).join('\n') + '\n';
    const reset = () => {
      put('SKILL.md', files['SKILL.md'] + 'dated witness append\n');
      put('corpus/knowledge/one.md', files['corpus/knowledge/one.md']);
      put(tablePath, tableText(pinRows));
      for (const path of publicFiles) {
        rmSync(join(root, path), { force: true });
        put(path, 'public fixture\n');
      }
      rmSync(join(root, 'expected.json'), { force: true });
      put('expected.json', JSON.stringify(fixtureExpected));
    };
    const fixtureExpected = { ...expected, baseline, table: tablePath, publicTargets: [...publicTargets] };
    reset();
    command('add', '--', 'SKILL.md', tablePath);
    const witness = commit('fixture witness', expected.thresholdEpoch + 100);
    for (const test of expected.selftest) {
      reset();
      put('canary', 'public fixture\n');
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
      else if (test.name === 'public_target_injection') {
        const canary = join(root, 'canary');
        put('expected.json', JSON.stringify({ ...fixtureExpected, publicTargets: [canary, ...publicTargets.slice(1)] }));
        put(tablePath, tableText(pinRows.map(row => row[1] === publicTargets[0] ? [row[0], canary, ...row.slice(2)] : row)));
      } else if (test.name === 'table_path_injection') {
        put('alternate.tsv', tableText(pinRows));
        put('expected.json', JSON.stringify({ ...fixtureExpected, table: 'alternate.tsv' }));
      } else if (test.name === 'public_file_symlink') {
        rmSync(join(root, publicFiles[0]));
        symlinkSync(join(root, 'canary'), join(root, publicFiles[0]));
      } else if (test.name === 'descriptor_symlink') {
        put('alternate.json', JSON.stringify(fixtureExpected));
        rmSync(join(root, 'expected.json'));
        symlinkSync(join(root, 'alternate.json'), join(root, 'expected.json'));
      }
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
  const root = resolve(options.repo);
  const allowedExpected = root === defaultRoot ? expectedPath : 'expected.json';
  if (options.expected !== allowedExpected) fail('descriptor_allowlist', 'Descriptor path is fixed for production or isolated fixtures', 2);
  const expected = JSON.parse(regularBytes(join(root, allowedExpected)).toString());
  if (options['self-test']) selfTest(expected);
  else verify(options, expected);
} catch (error) {
  const exit = error.exit ?? 2;
  console.error(`FRESHNESS_GATE verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'} detail=${error.message}`);
  process.exitCode = exit;
}
