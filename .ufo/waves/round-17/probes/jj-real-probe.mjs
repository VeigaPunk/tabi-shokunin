#!/usr/bin/env node
// jj-real-probe.mjs — independent falsifier of claim C1 (jj-safe revision
// anchoring of the lane's round gates) using REAL jj, not a git simulation.
//
// Question it answers for one lane revision REV:
//   do the production gates read git HEAD (which, in a jj-colocated lane, is
//   jj-owned and may name an empty or snapshot-only commit that is on no
//   branch), or do they read the lane branch tip?
//
// Method (all writes inside a fresh /tmp clone; LANE is never written and jj
// is never run in LANE):
//   1. git clone --no-hardlinks LANE <sandbox>/lane
//   2. git checkout --detach REV; git update-ref refs/heads/master REV
//   3. jj git init --colocate  (+ repo config exactly as scripts/hyaku/jj-lane.sh
//      init: snapshot.auto-track="none()", user.name/email, trunk() alias)
//   4. state base      : gates on the just-initialized repo
//      state a         : after `jj new`            (empty off-branch HEAD)
//      state b         : after editing SHONEN.md   and `jj new`
//                        (HEAD carries snapshot-only content)
//      state c (2nd clean sandbox): after editing a counted input of the
//      round-16 measurement-binding manifest and `jj new`.
//   After each state: `node scripts/check-round-contract.mjs` (production) and
//   `node scripts/check-measurement-binding.mjs --check
//   corpus/evidence/round-16/measurement-binding.json` (no --at), plus the
//   binding gate in --json mode to read the revision it resolved.
//
// Usage:
//   node .ufo/waves/round-17/probes/jj-real-probe.mjs [REV] [--keep]
//   REV defaults to refs/heads/master of LANE. stdout is exactly one JSON
//   object; progress is silent. Exit 0 = measurement completed, 1 = probe
//   error (sandboxes are kept on error and their paths reported).
//
// Requires: /home/vgpnk/.local/bin/jj (0.45.x) or JJ_BIN; git; node.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  accessSync, constants as fsConstants, existsSync, mkdtempSync, readFileSync, realpathSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SCRIPT), '../../../..'); // probes -> round-17 -> waves -> .ufo -> LANE
const JJ = process.env.JJ_BIN ?? '/home/vgpnk/.local/bin/jj';
const SCHEMA = 'tabi-jj-real-probe-v1';
const BINDING_MANIFEST = 'corpus/evidence/round-16/measurement-binding.json';
const SANDBOX_PREFIX = 'tabi-r17-C1JjRealProbe-';
const GATE_TIMEOUT_MS = 600000;
const CONTRACT = 'scripts/check-round-contract.mjs';
const BINDING = 'scripts/check-measurement-binding.mjs';

const steps = [];
const states = [];
const toolErrors = [];
let exitCode = 0;

// Git plumbing must see the sandbox repo, never an inherited git redirection.
const BASE_ENV = { ...process.env, LC_ALL: 'C', LANG: 'C', GIT_TERMINAL_PROMPT: '0' };
for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_NAMESPACE', 'GIT_COMMON_DIR']) {
  delete BASE_ENV[key];
}

function run(id, cmd, args, cwd, timeout = GATE_TIMEOUT_MS) {
  const started = process.hrtime.bigint();
  const child = spawnSync(cmd, args, { cwd, env: BASE_ENV, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
  const durationMs = Number((process.hrtime.bigint() - started) / 1_000_000n);
  const step = {
    id,
    argv: [cmd, ...args],
    cwd,
    exit: child.status,
    signal: child.signal ?? null,
    timedOut: child.error?.code === 'ETIMEDOUT' || child.signal === 'SIGTERM',
    durationMs,
    stdout: child.stdout ?? '',
    stderr: child.stderr ?? '',
    error: child.error ? String(child.error.message) : null,
  };
  steps.push(step);
  return step;
}

function git(id, cwd, args) {
  return run(id, 'git', args, cwd);
}

// ---------------------------------------------------------------- sandbox

function createSandbox(name) {
  const root = mkdtempSync(join(tmpdir(), SANDBOX_PREFIX));
  const lane = join(root, 'lane');
  const sandbox = { name, root, lane, removed: false, path: root };
  const clone = git(`${name}-clone`, dirname(root), ['clone', '--no-hardlinks', LANE, lane]);
  if (clone.exit !== 0) throw new Error(`git clone failed (${clone.exit}): ${clone.stderr.trim()}`);
  // Keep the sandbox self-contained: no command may reach a network remote.
  git(`${name}-remote-local`, lane, ['remote', 'set-url', 'origin', LANE]);
  const detach = git(`${name}-detach`, lane, ['checkout', '-q', '--detach', REV]);
  if (detach.exit !== 0) throw new Error(`git checkout --detach ${REV} failed (${detach.exit}): ${detach.stderr.trim()}`);
  const master = git(`${name}-master`, lane, ['update-ref', 'refs/heads/master', REV]);
  if (master.exit !== 0) throw new Error(`git update-ref master ${REV} failed (${master.exit})`);
  // scripts/hyaku/jj-lane.sh:145-163, condensed: same flag, same repo config keys.
  const init = run(`${name}-jj-init`, JJ, ['--config', 'snapshot.auto-track="none()"', 'git', 'init', '--colocate', '.'], lane);
  if (init.exit !== 0) throw new Error(`jj git init --colocate failed (${init.exit}): ${init.stderr.trim()}`);
  const configs = [
    ['snapshot.auto-track', '"none()"'],
    ['user.name', 'tabi-shokunin'],
    ['user.email', 'tabi@shokunin.local'],
    ['revset-aliases."trunk()"', '"master@origin"'],
  ];
  for (const [key, value] of configs) {
    const step = run(`${name}-config-${key.replace(/[^a-z0-9]+/gi, '-')}`, JJ,
      ['--ignore-working-copy', 'config', 'set', '--repo', key, value], lane);
    if (step.exit !== 0) throw new Error(`jj config set --repo ${key} failed (${step.exit})`);
  }
  // jj-lane.sh:163; failure tolerated there and here.
  run(`${name}-bookmark-track`, JJ, ['--ignore-working-copy', 'bookmark', 'track', 'master@origin'], lane);
  return sandbox;
}

function assertSandbox(cwd, sandbox) {
  const real = realpathSync(cwd);
  const rootReal = realpathSync(sandbox.root);
  if (real !== rootReal && !real.startsWith(`${rootReal}${sep}`)) {
    throw new Error(`refusing to run jj outside ${rootReal}: ${real}`);
  }
  if (real === realpathSync(LANE)) throw new Error('refusing to run jj in LANE');
}

function jj(id, sandbox, args) {
  assertSandbox(sandbox.lane, sandbox);
  return run(id, JJ, args, sandbox.lane);
}

// ---------------------------------------------------------------- facts

const JJ_LOG_TEMPLATE = 'change_id.short() ++ " " ++ commit_id.short(12) ++ " " ++ '
  + 'if(empty, "empty", "nonempty") ++ " " ++ description.first_line() ++ "\\n"';

function collectFacts(stateId, sandbox, editedPath) {
  const lane = sandbox.lane;
  const read = (suffix, args) => git(`${stateId}-${suffix}`, lane, args);
  const head = read('head', ['rev-parse', 'HEAD']).stdout.trim();
  const master = read('master', ['rev-parse', 'refs/heads/master']).stdout.trim();
  const symbolic = read('symbolic-ref', ['symbolic-ref', '-q', 'HEAD']);
  const refsContaining = read('contains', ['for-each-ref', '--format=%(refname)', '--contains', 'HEAD', 'refs/heads', 'refs/remotes']);
  const headTree = read('head-tree', ['rev-parse', 'HEAD^{tree}']).stdout.trim();
  const masterTree = read('master-tree', ['rev-parse', 'refs/heads/master^{tree}']).stdout.trim();
  const headIsAncestor = read('head-ancestor-of-master', ['merge-base', '--is-ancestor', 'HEAD', 'refs/heads/master']);
  const masterIsAncestor = read('master-ancestor-of-head', ['merge-base', '--is-ancestor', 'refs/heads/master', 'HEAD']);
  const status = read('status', ['status', '--porcelain']);
  const shonenHead = read('shonen-head', ['rev-parse', `HEAD:SHONEN.md`]).stdout.trim();
  const shonenMaster = read('shonen-master', ['rev-parse', `refs/heads/master:SHONEN.md`]).stdout.trim();
  const shonenWorktree = read('shonen-worktree', ['hash-object', 'SHONEN.md']).stdout.trim();
  let files = null;
  if (editedPath) {
    const blobAtHead = git(`${stateId}-file-head`, lane, ['rev-parse', `HEAD:${editedPath}`]).stdout.trim();
    const blobAtMaster = git(`${stateId}-file-master`, lane, ['rev-parse', `refs/heads/master:${editedPath}`]).stdout.trim();
    const worktreeSha = git(`${stateId}-file-worktree`, lane, ['hash-object', editedPath]).stdout.trim();
    files = { path: editedPath, blobAtHead, blobAtMaster, worktreeSha };
  }
  const log = jj(`${stateId}-jj-log`, sandbox,
    ['--ignore-working-copy', 'log', '--no-graph', '-T', JJ_LOG_TEMPLATE, '-r', '@|@-|master']);
  return {
    head,
    master,
    detached: symbolic.exit !== 0,
    symbolicRef: symbolic.exit === 0 ? symbolic.stdout.trim() : null,
    refsContainingHead: refsContaining.stdout.split('\n').map((line) => line.trim()).filter(Boolean),
    headTree,
    masterTree,
    treeEqual: headTree === masterTree,
    headIsAncestorOfMaster: headIsAncestor.exit === 0,
    masterIsAncestorOfHead: masterIsAncestor.exit === 0,
    status: {
      lines: status.stdout.split('\n').filter(Boolean).length,
      porcelain: status.stdout,
    },
    shonen: { blobAtHead: shonenHead, blobAtMaster: shonenMaster, worktreeSha: shonenWorktree },
    files,
    jjLog: log.stdout,
  };
}

function parseContract(stdout) {
  const verdict = /ROUND_CONTRACT verdict=(\w+)/.exec(stdout)?.[1] ?? null;
  const finding = /ROUND_CONTRACT verdict=\w+ finding=(\w+)/.exec(stdout)?.[1] ?? null;
  return { verdict, finding };
}

function parseBinding(stdout) {
  const verdict = /MEASUREMENT_BINDING verdict=(\w+)/.exec(stdout)?.[1] ?? null;
  const findings = [...stdout.matchAll(/^finding claim=(\S+) reason=(\w+) detail=(.*)$/gm)]
    .map((match) => ({ claim: match[1], reason: match[2], detail: match[3] }));
  return { verdict, findings };
}

function collectGates(stateId, sandbox) {
  const contract = run(`${stateId}-gate-round-contract`, process.execPath, [CONTRACT], sandbox.lane);
  const binding = run(`${stateId}-gate-measurement-binding`, process.execPath,
    [BINDING, '--check', BINDING_MANIFEST], sandbox.lane);
  const bindingJsonStep = run(`${stateId}-gate-measurement-binding-json`, process.execPath,
    [BINDING, '--check', BINDING_MANIFEST, '--json'], sandbox.lane);
  let bindingJson = null;
  try {
    const parsed = JSON.parse(bindingJsonStep.stdout);
    bindingJson = { at: parsed.at ?? null, verdict: parsed.verdict ?? null, claims: parsed.claims ?? null, bound: parsed.bound ?? null, findings: parsed.findings ?? [] };
  } catch {
    bindingJson = null;
  }
  // A failed production gate prints its verdict line on stderr (fail() path);
  // parse the joined streams and keep both for the record.
  return {
    roundContract: {
      argv: contract.argv,
      exit: contract.exit,
      ...parseContract(`${contract.stdout}${contract.stderr}`),
      stdout: contract.stdout,
      stderr: contract.stderr,
    },
    measurementBinding: {
      argv: binding.argv,
      exit: binding.exit,
      ...parseBinding(`${binding.stdout}${binding.stderr}`),
      stdout: binding.stdout,
      stderr: binding.stderr,
    },
    measurementBindingJson: {
      argv: bindingJsonStep.argv,
      exit: bindingJsonStep.exit,
      ...(bindingJson ?? { at: null, verdict: null, findings: [] }),
    },
  };
}

function recordState({ id, sandbox, label, reachedBy, editedPath }) {
  const facts = collectFacts(id, sandbox, editedPath);
  const state = {
    id,
    label,
    sandbox: sandbox.root,
    reachedBy,
    facts,
    gates: collectGates(id, sandbox),
  };
  states.push(state);
  return state;
}

// ---------------------------------------------------------------- verdict

function headIsOffBranch(facts) {
  return facts.detached && facts.head !== facts.master && facts.refsContainingHead.length === 0;
}

function computeVerdict() {
  const byId = (id) => states.find((state) => state.id === id) ?? null;
  const base = byId('base');
  const afterNew = byId('after-jj-new');
  const snapshot = byId('after-snapshot-content');
  const counted = byId('counted-input-offbranch');

  const contractReadsHead = Boolean(
    base && snapshot
    && base.gates.roundContract.verdict === 'clean'
    && snapshot.facts.head !== snapshot.facts.master
    && snapshot.gates.roundContract.verdict === 'failed'
    && snapshot.gates.roundContract.finding === 'shonen_policy'
    && snapshot.facts.files
    && snapshot.facts.files.blobAtHead === snapshot.facts.files.worktreeSha
    && snapshot.facts.files.blobAtHead !== snapshot.facts.files.blobAtMaster,
  );

  const bindingReadsHead = Boolean(
    base && counted
    && base.gates.measurementBinding.verdict === 'clean'
    && counted.facts.head !== counted.facts.master
    && counted.gates.measurementBinding.verdict === 'failed'
    && counted.gates.measurementBinding.findings.some((finding) => finding.reason === 'counted_input_changed')
    && counted.gates.measurementBindingJson.at === counted.facts.head,
  );

  const contractCleanOnOffBranchHead = Boolean(
    afterNew && afterNew.gates.roundContract.verdict === 'clean' && headIsOffBranch(afterNew.facts),
  );
  const bindingCleanOnOffBranchHead = Boolean(
    afterNew && afterNew.gates.measurementBinding.verdict === 'clean'
    && afterNew.gates.measurementBindingJson.at === afterNew.facts.head,
  );

  return {
    baseline_reads_jj_head: contractReadsHead || bindingReadsHead,
    expectation: {
      baseline_reads_jj_head: true,
      matched: (contractReadsHead || bindingReadsHead) === true,
    },
    round_contract_reads_jj_head: contractReadsHead,
    measurement_binding_reads_jj_head: bindingReadsHead,
    round_contract_clean_on_offbranch_head: contractCleanOnOffBranchHead,
    measurement_binding_clean_on_offbranch_head: bindingCleanOnOffBranchHead,
    anchor_identity: {
      'round-contract': contractReadsHead ? 'git HEAD' : 'branch tip or undetermined',
      'measurement-binding': bindingReadsHead ? 'git HEAD' : 'branch tip or undetermined',
    },
    predicates: {
      round_contract: [
        'base round-contract verdict=clean',
        'after-snapshot-content HEAD != refs/heads/master',
        'after-snapshot-content round-contract failed finding=shonen_policy',
        'HEAD:SHONEN.md == worktree blob and != refs/heads/master:SHONEN.md',
      ],
      measurement_binding: [
        'base measurement-binding verdict=clean',
        'counted-input-offbranch HEAD != refs/heads/master',
        'counted-input-offbranch measurement-binding failed reason=counted_input_changed',
        'measurement-binding --json at == that HEAD',
      ],
    },
  };
}

// ---------------------------------------------------------------- main

function parseArgs(argv) {
  const options = { revision: null, keep: false, help: false };
  for (const arg of argv) {
    if (arg === '--keep') options.keep = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg.startsWith('--')) throw new Error(`unknown option: ${arg}`);
    else if (options.revision === null) options.revision = arg;
    else throw new Error(`unexpected argument: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node .ufo/waves/round-17/probes/jj-real-probe.mjs [REV] [--keep]',
    '  REV   lane revision to probe (default: refs/heads/master of LANE)',
    '  --keep  keep the /tmp sandbox clones after a successful run',
  ].join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    // stdout stays a single JSON object in every mode.
    process.stdout.write(`${JSON.stringify({
      schema: SCHEMA,
      usage: usage().split('\n'),
      defaults: { revision: 'refs/heads/master of LANE', keepSandboxes: false },
    }, null, 2)}\n`);
    return 0;
  }
  const laneTop = git('lane-toplevel', LANE, ['rev-parse', '--show-toplevel']).stdout.trim();
  if (realpathSync(laneTop) !== realpathSync(LANE)) throw new Error(`LANE is not a git worktree root: ${laneTop}`);
  if (!existsSync(JJ)) throw new Error(`jj not found at ${JJ}; set JJ_BIN`);
  accessSync(JJ, fsConstants.X_OK);

  let revision;
  let revisionSource;
  if (options.revision) {
    revision = git('rev-arg', LANE, ['rev-parse', '--verify', '--end-of-options', `${options.revision}^{commit}`]).stdout.trim();
    revisionSource = 'argv';
  } else {
    revision = git('rev-default', LANE, ['rev-parse', '--verify', '--end-of-options', 'refs/heads/master^{commit}']).stdout.trim();
    revisionSource = 'lane-refs/heads/master';
  }
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error(`revision did not resolve to 40-hex: ${revision || '(empty)'}`);
  // Resolve the script-level REV once, then every sandbox uses it.
  REV = revision;

  const jjVersion = run('jj-version', JJ, ['--version'], LANE);
  const gitVersion = run('git-version', 'git', ['--version'], LANE);
  const remoteUrl = git('lane-origin', LANE, ['config', '--get', 'remote.origin.url']);

  const sandboxes = [];
  let keepSandboxes = options.keep;
  try {
    const primary = createSandbox('primary');
    sandboxes.push(primary);
    recordState({ id: 'base', sandbox: primary, label: 'after jj git init --colocate (detached HEAD at REV)', reachedBy: ['primary-clone', 'primary-detach', 'primary-master', 'primary-jj-init'], editedPath: null });

    const newStep = jj('after-jj-new-jj-new', primary, ['new']);
    if (newStep.exit !== 0) throw new Error(`jj new failed (${newStep.exit}): ${newStep.stderr.trim()}`);
    recordState({ id: 'after-jj-new', sandbox: primary, label: 'after jj new (empty off-branch HEAD)', reachedBy: ['after-jj-new-jj-new'], editedPath: null });

    const editShonen = run('after-snapshot-content-edit-shonen', process.execPath, ['-e',
      "const fs=require('fs');fs.appendFileSync('SHONEN.md','\\nprobe-edit-round17: unlanded snapshot content\\n');"], primary.lane);
    if (editShonen.exit !== 0) throw new Error('failed to edit SHONEN.md in sandbox');
    const newStep2 = jj('after-snapshot-content-jj-new', primary, ['new']);
    if (newStep2.exit !== 0) throw new Error(`jj new (after SHONEN edit) failed (${newStep2.exit}): ${newStep2.stderr.trim()}`);
    recordState({
      id: 'after-snapshot-content',
      sandbox: primary,
      label: 'after editing SHONEN.md and jj new (HEAD carries snapshot-only content)',
      reachedBy: ['after-snapshot-content-edit-shonen', 'after-snapshot-content-jj-new'],
      editedPath: 'SHONEN.md',
    });

    // Independent clean sandbox: isolate the measured-input arm from the
    // SHONEN.md edit so the binding gate's red has one cause.
    const secondary = createSandbox('counted');
    sandboxes.push(secondary);
    const editCounted = run('counted-input-offbranch-edit-counted', process.execPath, ['-e',
      "const fs=require('fs');fs.appendFileSync('scripts/selftest-measurement-binding.mjs','\\n// probe: unlanded counted-input edit (jj snapshot, no bookmark)\\n');"], secondary.lane);
    if (editCounted.exit !== 0) throw new Error('failed to edit counted input in sandbox');
    const newStep3 = jj('counted-input-offbranch-jj-new', secondary, ['new']);
    if (newStep3.exit !== 0) throw new Error(`jj new (counted input) failed (${newStep3.exit}): ${newStep3.stderr.trim()}`);
    recordState({
      id: 'counted-input-offbranch',
      sandbox: secondary,
      label: 'clean sandbox: after editing counted input scripts/selftest-measurement-binding.mjs and jj new',
      reachedBy: ['counted-input-offbranch-edit-counted', 'counted-input-offbranch-jj-new'],
      editedPath: 'scripts/selftest-measurement-binding.mjs',
    });
  } catch (error) {
    toolErrors.push(String(error?.message ?? error));
    keepSandboxes = true;
    exitCode = 1;
  } finally {
    for (const sandbox of sandboxes) {
      if (keepSandboxes) {
        sandbox.removed = false;
        continue;
      }
      try {
        rmSync(sandbox.root, { recursive: true, force: true });
        sandbox.removed = true;
      } catch (error) {
        sandbox.removed = false;
        toolErrors.push(`cleanup failed for ${sandbox.root}: ${String(error?.message ?? error)}`);
      }
    }
  }

  const result = {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    lane: LANE,
    revision,
    revisionSource,
    laneRemote: remoteUrl.stdout.trim() || null,
    probe: {
      path: 'relative to LANE: .ufo/waves/round-17/probes/jj-real-probe.mjs',
      absolutePath: SCRIPT,
      sha256: createHash('sha256').update(readFileSync(SCRIPT)).digest('hex'),
    },
    tools: {
      jj: { path: JJ, version: jjVersion.stdout.trim() },
      git: gitVersion.stdout.trim(),
      node: process.version,
    },
    sandboxes: sandboxes.map((sandbox) => ({ name: sandbox.name, path: sandbox.root, removed: sandbox.removed })),
    states,
    verdict: computeVerdict(),
    errors: toolErrors,
    steps,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return exitCode;
}

let REV = null;
try {
  exitCode = main();
} catch (error) {
  exitCode = 1;
  process.stdout.write(`${JSON.stringify({
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    lane: LANE,
    revision: REV,
    verdict: null,
    errors: [String(error?.message ?? error)],
    steps,
  }, null, 2)}\n`);
}
process.exitCode = exitCode;
