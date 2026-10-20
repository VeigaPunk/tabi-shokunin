#!/usr/bin/env node
// tabi round-16 C1 — selftest driver for scripts/check-measurement-binding.mjs.
// Builds isolated temp Git repositories (mkdtemp, minimal Git env, fixed
// author/committer dates, local -c user config, gpgsign off) with tiny counter
// scripts and measurement-binding manifests, drives the gate as a child CLI per
// case, and asserts exact exit status + exact reason set. Every negative case
// pairs with a same-shape positive control (id + '_control'): an unmutated
// build of the same fixture run with the same flags. Usage:
//   node scripts/selftest-measurement-binding.mjs [--gate <path>]
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const selfScript = fileURLToPath(import.meta.url);
const defaultGate = resolve(dirname(selfScript), 'check-measurement-binding.mjs');
const MANIFEST_REL = 'corpus/evidence/round-16/measurement-binding.json';
const LEGACY_COUNTER_REL = '.ufo/waves/round-15/measure.mjs';
const sha256 = text => createHash('sha256').update(text).digest('hex');
const fakeRev = ch => ch.repeat(40);

// Minimal environment shared by fixture git calls and gate children.
const minimalEnv = Object.freeze({
  PATH: process.env.PATH ?? '',
  HOME: process.env.HOME ?? tmpdir(),
  TZ: 'UTC',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_OPTIONAL_LOCKS: '0',
  GIT_TERMINAL_PROMPT: '0',
  GIT_NO_REPLACE_OBJECTS: '1',
});
const fixtureEnv = Object.freeze({
  ...minimalEnv,
  GIT_AUTHOR_DATE: '1700000000 +0000',
  GIT_COMMITTER_DATE: '1700000000 +0000',
});

function git(root, args) {
  const result = spawnSync('git', [
    '-c', 'user.name=tabi-binding-selftest',
    '-c', 'user.email=tabi-binding-selftest@local',
    '-c', 'commit.gpgsign=false',
    ...args,
  ], { cwd: root, env: fixtureEnv, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    throw new Error(`git ${args[0]} failed in ${root}: ${(result.stderr || String(result.error)).trim()}`);
  }
  return result.stdout.trim();
}

function put(root, rel, text) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

function commitAll(root, subject) {
  git(root, ['add', '-A']);
  git(root, ['commit', '-qm', subject]);
  return git(root, ['rev-parse', 'HEAD']);
}

// The fixture counter is revision-dependent (1 iff counted/input.txt exists at
// REV), so the gate's before-arm reproduction (before.revision = rev0, count 0)
// and after-arm (count 1) both hold for an honest counter; a constant counter
// cannot pass both arms. (L1 repair: the gate added the before arm after this
// selftest was first written with a constant counter, and 4 cases failed.)
const COUNTER_OK = [
  "import { spawnSync } from 'node:child_process';",
  "const revision = process.argv[2] ?? 'unknown';",
  "const probe = spawnSync('git', ['cat-file', '-e', `${revision}:counted/input.txt`]);",
  'console.log(JSON.stringify({ revision, c1_binding_contracts: probe.status === 0 ? 1 : 0 }));',
  '',
].join('\n');
const COUNTER_V2 = COUNTER_OK.replace('unknown', 'unknown-v2');
const COUNTER_ZERO = [
  "const revision = process.argv[2] ?? 'unknown';",
  'console.log(JSON.stringify({ revision, c1_binding_contracts: 0 }));',
  '',
].join('\n');
const COUNTER_FAIL = 'process.exit(3);\n';
const DEFAULT_ARGV = ['node', 'measure.mjs', '{REV}', '--claim', 'C1'];
const INJECTION_ARGV = [
  'node', 'measure.mjs', '{REV}', '--claim', 'C1',
  ';', '$(touch INJECTED)', '`touch INJECTED2`', '&& touch INJECTED3',
];

// A claim object shaped per PLAN §C1. measured/before/after default to rev1.
function claim(ctx, overrides = {}) {
  return {
    id: 'C1', axis: 'operability',
    counter: {
      path: 'measure.mjs',
      ...(ctx.noSha ? {} : { sha256: ctx.counterSha }),
      argv: ctx.argv,
      countField: 'c1_binding_contracts',
    },
    countedInputs: ctx.countedInputs,
    measuredRevision: ctx.measured,
    before: { revision: ctx.rev0, count: 0 },
    after: { revision: ctx.measured, count: 1 },
    ...overrides,
  };
}

function manifestText(ctx) {
  return JSON.stringify({
    schema: 'tabi-measurement-binding-v1',
    round: 16,
    baseline: ctx.rev1,
    claims: [claim(ctx), ...ctx.extraClaims.map(f => (typeof f === 'function' ? f(ctx) : f))],
  }, null, 2) + '\n';
}

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'tabi-binding-selftest-'));
  git(root, ['init', '-q', '-b', 'main']);
  return root;
}

// Commit 0: baseline without counted input; commit 1: counter + counted input.
// Returns {root, rev0, rev1}.
function baseRepo(counter = COUNTER_OK, countedText = 'counted input v1\n') {
  const root = makeRepo();
  put(root, 'README', 'baseline before measurement\n');
  const rev0 = commitAll(root, 'baseline');
  put(root, 'measure.mjs', counter);
  put(root, 'counted/input.txt', countedText);
  const rev1 = commitAll(root, 'counter and counted inputs');
  return { root, rev0, rev1 };
}

// Clean-shape fixture: rev1 holds counter+inputs; then optional post-
// measurement mutations (mutate hook, counterAfter rewrite); HEAD adds the
// manifest. opts:
//   counter        counter bytes committed at rev1 (default COUNTER_OK)
//   counterAfter   counter bytes rewritten before the manifest commit
//   shaOverride    sha256 recorded in the manifest (default sha of `counter`)
//   measured       measuredRevision recorded (default rev1)
//   argv, countedInputs, noSha, extraClaims — manifest fields
//   mutate(ctx)    arbitrary fixture mutation between rev1 and HEAD
function cleanShape(opts = {}) {
  const counter = opts.counter ?? COUNTER_OK;
  const { root, rev0, rev1 } = baseRepo(counter);
  const ctx = {
    root, rev0, rev1,
    counterSha: opts.shaOverride ?? sha256(counter),
    measured: opts.measured ?? rev1,
    argv: opts.argv ?? DEFAULT_ARGV,
    countedInputs: opts.countedInputs ?? ['counted/'],
    noSha: opts.noSha ?? false,
    extraClaims: opts.extraClaims ?? [],
  };
  if (opts.mutate) opts.mutate(ctx);
  if (opts.counterAfter) put(root, 'measure.mjs', opts.counterAfter);
  put(root, MANIFEST_REL, manifestText(ctx));
  const head = commitAll(root, 'measurement binding manifest');
  return { root, rev1, head, manifest: join(root, MANIFEST_REL) };
}

// Round-15-shaped legacy fixture. `changed` rewrites the counter blob after
// counterCodeRevision so blob(counterCodeRevision) != blob(HEAD).
// `c2Digest` reproduces the real round-15 C2 shape (L1 addition): 'measured'
// records the digest of the blob at measuredRevision (honest, no mismatch);
// 'later' moves C2's counterCodeRevision to the post-measurement repair commit
// and records that blob's digest (the real r15 defect: counter_digest_mismatch).
function legacyShape(changed, c2Digest = null) {
  const root = makeRepo();
  const v1 = 'r15 counter v1\n';
  const v2 = 'r15 counter v2 — repaired diagnostics\n';
  put(root, LEGACY_COUNTER_REL, v1);
  const counterCodeRevision = commitAll(root, 'round-15 counter code');
  put(root, 'notes.txt', 'measured state\n');
  const measuredRevision = commitAll(root, 'round-15 measured revision');
  let repairRevision = null;
  if (changed) {
    put(root, LEGACY_COUNTER_REL, v2);
    repairRevision = commitAll(root, 'counter drift after measurement');
  }
  const c2 = { counterCodeRevision, before: { exit: 0 }, after: { exit: 0 } };
  if (c2Digest === 'measured') c2.counterSha256 = sha256(v1);
  if (c2Digest === 'later') {
    if (!repairRevision) throw new Error('later digest needs changed=true');
    c2.counterCodeRevision = repairRevision;
    c2.counterSha256 = sha256(v2);
  }
  const legacy = {
    schema: 'tabi-round15-measurements-v1',
    baseline: counterCodeRevision,
    measuredRevision,
    executedCodeRevision: counterCodeRevision,
    C1: { counterCodeRevision, before: { exit: 0 }, after: { exit: 0 } },
    C2: c2,
  };
  const legacyPath = join(root, 'legacy-measurements.json');
  writeFileSync(legacyPath, JSON.stringify(legacy, null, 2) + '\n');
  return { root, manifest: legacyPath, modeArgs: ['--legacy', legacyPath] };
}

// ── Case registry ─────────────────────────────────────────────────────────
const cases = [];
function positive(id, build, opts = {}) {
  cases.push({ id, build, expectedExit: 0, expectedReasons: [], ...opts });
}
function negative(id, build, expectedExit, expectedReasons, opts = {}) {
  cases.push({
    id: `${id}_control`, controlOf: id, expectedExit: 0, expectedReasons: [],
    reproduce: opts.reproduce,
    build: () => build(false),
  });
  cases.push({ id, expectedExit, expectedReasons, ...opts, build: () => build(true) });
}

positive('clean', () => cleanShape());
positive('clean_reproduce', () => cleanShape(), { reproduce: true });

// measuredRevision is a real commit that is not an ancestor-or-equal of HEAD:
// a child commit of rev1 on the identical tree (empty counted/counter diff,
// identical counter blob — no other reason can fire).
negative('measured_revision_not_ancestor', mut => {
  if (!mut) return cleanShape();
  const { root, rev0, rev1 } = baseRepo();
  const tree = git(root, ['rev-parse', `${rev1}^{tree}`]);
  const side = git(root, ['commit-tree', tree, '-p', rev1, '-m', 'unmerged measured revision']);
  const ctx = { rev0, rev1, counterSha: sha256(COUNTER_OK), measured: side, argv: DEFAULT_ARGV, countedInputs: ['counted/'], extraClaims: [] };
  put(root, MANIFEST_REL, manifestText(ctx));
  commitAll(root, 'manifest pinned to unmerged revision');
  return { root, manifest: join(root, MANIFEST_REL) };
}, 1, ['measured_revision_not_ancestor']);

negative('counter_digest_unrecorded', mut => cleanShape(mut ? { noSha: true } : {}),
  1, ['counter_digest_unrecorded']);

// Recorded sha matches the HEAD blob but not the rev1 blob: digest_mismatch
// fires while changed_since does not; the counter file changed rev1→HEAD so
// counted_input_changed must also appear.
negative('counter_digest_mismatch', mut => cleanShape(mut
  ? { counterAfter: COUNTER_V2, shaOverride: sha256(COUNTER_V2) } : {}),
  1, ['counter_digest_mismatch', 'counted_input_changed']);

// Recorded sha matches the rev1 blob; HEAD blob differs.
negative('counter_changed_since_measurement', mut => cleanShape(mut
  ? { counterAfter: COUNTER_V2 } : {}),
  1, ['counter_changed_since_measurement', 'counted_input_changed']);

negative('counted_inputs_undeclared', mut => cleanShape(mut ? { countedInputs: [] } : {}),
  1, ['counted_inputs_undeclared']);

negative('counted_input_changed', mut => cleanShape(mut
  ? { mutate: ctx => put(ctx.root, 'counted/input.txt', 'counted input v2\n') } : {}),
  1, ['counted_input_changed']);

// Drift need not modify an existing blob: a pure addition (MutBindSelftest M04
// survivor: --diff-filter=M) and a pure deletion under a declared input prefix
// are both counted_input_changed. Each pairs with the clean control above.
negative('counted_input_added', mut => cleanShape(mut
  ? { mutate: ctx => put(ctx.root, 'counted/added.txt', 'added after measurement\n') } : {}),
  1, ['counted_input_changed']);

negative('counted_input_deleted', mut => cleanShape(mut
  ? { mutate: ctx => rmSync(join(ctx.root, 'counted/input.txt')) } : {}),
  1, ['counted_input_changed']);

negative('argv_unsupported_missing_rev', mut => cleanShape(mut
  ? { argv: ['node', 'measure.mjs', '--claim', 'C1'] } : {}),
  1, ['argv_unsupported']);

negative('argv_unsupported_bad_runner', mut => cleanShape(mut
  ? { argv: ['/bin/sh', 'measure.mjs', '{REV}'] } : {}),
  1, ['argv_unsupported']);

negative('argv_unsupported_wrong_path', mut => cleanShape(mut
  ? { argv: ['node', 'other.mjs', '{REV}'] } : {}),
  1, ['argv_unsupported']);

negative('counter_failed', mut => cleanShape(mut ? { counter: COUNTER_FAIL } : {}),
  1, ['counter_failed'], { reproduce: true });

negative('count_not_reproduced', mut => cleanShape(mut ? { counter: COUNTER_ZERO } : {}),
  1, ['count_not_reproduced'], { reproduce: true });

negative('manifest_unreadable', mut => {
  const built = cleanShape();
  if (!mut) return built;
  return { ...built, manifest: join(built.root, 'does-not-exist.json') };
}, 2, ['manifest_unreadable']);

negative('manifest_schema_invalid', mut => {
  const built = cleanShape();
  if (!mut) return built;
  put(built.root, 'bad.json', JSON.stringify({ schema: 'tabi-other-v1', claims: [] }) + '\n');
  return { ...built, manifest: join(built.root, 'bad.json') };
}, 2, ['manifest_schema_invalid']);

negative('manifest_malformed_json', mut => {
  const built = cleanShape();
  if (!mut) return built;
  put(built.root, 'bad.json', '{ this is not json\n');
  return { ...built, manifest: join(built.root, 'bad.json') };
}, 2, ['manifest_schema_invalid']);

negative('revision_unresolved_at', mut => {
  const built = cleanShape();
  if (!mut) return built;
  return { ...built, extraArgs: ['--at', fakeRev('a')] };
}, 2, ['revision_unresolved']);

negative('revision_unresolved_measured', mut => cleanShape(mut
  ? { measured: fakeRev('b') } : {}),
  2, ['revision_unresolved']);

negative('git_failed', mut => {
  const built = cleanShape();
  if (!mut) return built;
  const notARepo = mkdtempSync(join(tmpdir(), 'tabi-binding-selftest-norepo-'));
  return { ...built, repoOverride: notARepo, extraRoots: [notARepo] };
}, 2, ['git_failed']);

// Second claim with an undeclared counted-input list in an otherwise clean
// manifest: per-claim reason routing with claims=2.
negative('multi_claim_inputs_undeclared', mut => cleanShape(mut ? {
  extraClaims: [ctx => claim(ctx, { id: 'C2', axis: 'coverage', countedInputs: [] })],
} : {}), 1, ['counted_inputs_undeclared']);

// ── Wave-2 additions (L1, after round-16 falsify wave mutation probes) ─────
// Each case kills a gate weakening that survived the 43-case selftest
// (.ufo/waves/round-16/w2/Mut*.md, SentinelGate.md).
function rewriteManifest(built, edit) {
  const manifest = JSON.parse(readFileSync(built.manifest, 'utf8'));
  edit(manifest);
  put(built.root, 'edited.json', JSON.stringify(manifest, null, 2) + '\n');
  return { ...built, manifest: join(built.root, 'edited.json') };
}
const COUNTER_CONST = [
  "const revision = process.argv[2] ?? 'unknown';",
  'console.log(JSON.stringify({ revision, c1_binding_contracts: 1 }));',
  '',
].join('\n');
const COUNTER_STRING = COUNTER_OK.replace('probe.status === 0 ? 1 : 0', "probe.status === 0 ? '1' : '0'");

// A declared input that resolves to no tree entry (not just an empty list).
negative('counted_inputs_undeclared_unresolved', mut => cleanShape(mut
  ? { countedInputs: ['absent/'] } : {}),
  1, ['counted_inputs_undeclared']);

// Worktree counter bytes differ from the committed blob: refuse to execute.
negative('counter_failed_worktree_differs', mut => {
  const built = cleanShape();
  if (mut) put(built.root, 'measure.mjs', COUNTER_V2);
  return built;
}, 1, ['counter_failed'], { reproduce: true });

// A constant counter passes the after arm but not the before arm.
negative('count_not_reproduced_constant', mut => cleanShape(mut ? { counter: COUNTER_CONST } : {}),
  1, ['count_not_reproduced'], { reproduce: true });

// A string "1"/"0" is not the recorded integer count.
negative('count_not_reproduced_string', mut => cleanShape(mut ? { counter: COUNTER_STRING } : {}),
  1, ['count_not_reproduced'], { reproduce: true });

// Only the schema name is wrong; everything else is a valid v1 manifest.
negative('manifest_schema_invalid_name_only', mut => {
  const built = cleanShape();
  return mut ? rewriteManifest(built, m => { m.schema = 'tabi-measurement-binding-v0'; }) : built;
}, 2, ['manifest_schema_invalid']);

// argv[1] must equal counter.path exactly, not just its basename.
negative('argv_unsupported_dir_prefix', mut => cleanShape(mut
  ? { argv: ['node', 'evil/measure.mjs', '{REV}'] } : {}),
  1, ['argv_unsupported']);

// A dash-led counter path would become a node option ("-e <code>").
negative('counter_path_dash', mut => {
  const built = cleanShape();
  return mut ? rewriteManifest(built, m => {
    m.claims[0].counter.path = '-e';
    m.claims[0].counter.argv = ['node', '-e', '{REV}'];
  }) : built;
}, 2, ['manifest_schema_invalid']);

// A resolvable ref whose name starts with '-' is still not a revision token.
negative('revision_unresolved_dash_ref', mut => {
  const built = cleanShape();
  if (!mut) return built;
  git(built.root, ['update-ref', 'refs/heads/-x', 'HEAD']);
  return { ...built, extraArgs: ['--at', '-x'] };
}, 2, ['revision_unresolved']);

// --legacy mode: round-15-shaped measurements.json. The unchanged variant is
// the same-shape positive control: it must report exactly the two intrinsic
// legacy reasons and NOT counter_changed_since_measurement.
cases.push({
  id: 'legacy_counter_unchanged',
  build: () => legacyShape(false),
  expectedExit: 1,
  expectedReasons: ['counter_digest_unrecorded', 'counted_inputs_undeclared'],
});
cases.push({
  id: 'legacy_counter_changed',
  build: () => legacyShape(true),
  expectedExit: 1,
  expectedReasons: ['counter_digest_unrecorded', 'counted_inputs_undeclared', 'counter_changed_since_measurement'],
});
// Real round-15 shape: C1 digest-free, C2 digest recorded for a counter blob
// committed after measuredRevision. The 'measured' variant is its same-shape
// control (recorded digest equals the blob that measured): no mismatch.
cases.push({
  id: 'legacy_r15_shape_digest_mismatch',
  build: () => legacyShape(true, 'later'),
  expectedExit: 1,
  expectedReasons: ['counter_digest_unrecorded', 'counted_inputs_undeclared',
    'counter_changed_since_measurement', 'counter_digest_mismatch'],
});
cases.push({
  id: 'legacy_r15_shape_digest_mismatch_control',
  build: () => legacyShape(false, 'measured'),
  expectedExit: 1,
  expectedReasons: ['counter_digest_unrecorded', 'counted_inputs_undeclared'],
});

// Shell metacharacters riding alongside a valid single {REV} token must be
// inert under --reproduce: argv-array spawn means `;`/`$()`/backticks arrive
// as literal arguments, no file side effect. The manifest is otherwise
// clean-shape, so this doubles as the injection positive control.
positive('rev_injection_inert', () => cleanShape({ argv: INJECTION_ARGV }), {
  reproduce: true,
  assertClean: root => {
    for (const name of ['INJECTED', 'INJECTED2', 'INJECTED3']) {
      if (existsSync(join(root, name)) || existsSync(join(tmpdir(), name))) {
        throw new Error(`injection side effect observed: ${name}`);
      }
    }
  },
});

// ── Round-17 lane-tip anchoring (PLAN §C1) ────────────────────────────────
// jj-colocated lanes detach HEAD at a commit that may be on no branch, so the
// gate must certify the lane tip (refs/heads/master when detached), never
// HEAD. Each detached fixture keeps HEAD at an off-branch commit P whose tree
// drifts one counted input: a HEAD-reading gate (round-16 bytes) reports
// counted_input_changed, while a lane-tip gate reads the manifest commit and
// reports clean.
function detachedOffBranch({ master = true } = {}) {
  const built = cleanShape();
  const tip = git(built.root, ['rev-parse', 'HEAD']);
  const branch = master ? 'master' : 'main';
  if (master) git(built.root, ['branch', '-m', 'master']);
  // Commit P as a child of tip, then reset the branch back so P stays
  // off-branch; detaching HEAD at P reproduces `jj new` on no branch.
  put(built.root, 'counted/input.txt', 'off-branch counted-input drift\n');
  const offBranch = commitAll(built.root, 'off-branch counted-input drift');
  git(built.root, ['update-ref', `refs/heads/${branch}`, tip]);
  git(built.root, ['update-ref', '--no-deref', 'HEAD', offBranch]);
  return { ...built, tip, offBranch };
}

// The positive case asserts the printed `at` is the branch tip, not the
// off-branch HEAD: --json is the only surface that prints the resolved 40-hex.
positive('lane_tip_detached_off_branch', () => ({ ...detachedOffBranch(), extraArgs: ['--json'] }), {
  assert: (built, got) => {
    const parsed = JSON.parse(got.stdout.trim());
    if (built.tip === built.offBranch) throw new Error('fixture tip equals off-branch HEAD');
    if (parsed.verdict !== 'clean') throw new Error(`verdict=${parsed.verdict}`);
    if (parsed.at !== built.tip) throw new Error(`at=${parsed.at} expected lane tip ${built.tip}`);
  },
});

// Explicit --at still wins over the lane tip. The control is the identical
// detached fixture without --at (lane tip -> clean); the negative adds exactly
// one variable, the explicit --at P.
negative('lane_tip_detached_explicit_at', mut => {
  const built = detachedOffBranch();
  return mut ? { ...built, extraArgs: ['--at', built.offBranch] } : built;
}, 1, ['counted_input_changed']);

// Detached HEAD with no refs/heads/master: no lane tip can be named, so the
// gate must refuse (exit 2) rather than fall back to HEAD.
negative('lane_tip_detached_no_master', mut => (mut ? detachedOffBranch({ master: false }) : cleanShape()),
  2, ['revision_unresolved']);

// E1 (SentinelAnchor F3): the lane is nested inside an enclosing repository.
// Move a clean fixture under a parent repo and corrupt the lane's HEAD so git
// no longer treats it as a repository; plain discovery then returns the parent
// toplevel. The gate must refuse (exit 2) instead of naming the parent repo.
negative('repo_fallthrough_refused', mut => {
  if (!mut) return cleanShape();
  const built = cleanShape();
  const parent = mkdtempSync(join(tmpdir(), 'tabi-binding-parent-'));
  git(parent, ['init', '-q', '-b', 'main']);
  put(parent, 'fleet.txt', 'enclosing repository\n');
  commitAll(parent, 'fleet base');
  const lane = join(parent, 'lane');
  renameSync(built.root, lane);
  put(lane, '.git/HEAD', 'ref: HEAD\n');
  return {
    ...built,
    root: lane,
    manifest: join(lane, MANIFEST_REL),
    extraRoots: [parent],
  };
}, 2, ['git_failed']);

// E3 (SentinelAnchor F5): detached HEAD with refs/heads/master rewritten as a
// symref to refs/remotes/o/evil. rev-parse follows it to an unlanded hostile
// commit whose counted input drifted; the gate must refuse the anchor (exit 2)
// rather than certify that commit.
negative('lane_tip_symref_anchor', mut => {
  if (!mut) return cleanShape();
  const built = cleanShape();
  const tip = git(built.root, ['rev-parse', 'HEAD']);
  put(built.root, 'counted/input.txt', 'hostile remote drift\n');
  const evil = commitAll(built.root, 'hostile remote commit');
  git(built.root, ['update-ref', 'refs/remotes/o/evil', evil]);
  git(built.root, ['update-ref', 'refs/heads/master', tip]);
  writeFileSync(join(built.root, '.git/refs/heads/master'), 'ref: refs/remotes/o/evil\n');
  git(built.root, ['update-ref', '--no-deref', 'HEAD', tip]);
  return built;
}, 2, ['revision_unresolved']);

// An attached ref outside refs/heads (HEAD -> refs/tags/t) is not a lane
// branch: only status 0 with an exact refs/heads/ line names an anchor
// (SentinelAnchor F4 attached-non-heads clause).
negative('lane_tip_attached_non_heads', mut => {
  if (!mut) return cleanShape();
  const built = cleanShape();
  git(built.root, ['update-ref', 'refs/tags/t', 'HEAD']);
  writeFileSync(join(built.root, '.git/HEAD'), 'ref: refs/tags/t\n');
  return built;
}, 2, ['revision_unresolved']);

// F13 (SentinelAnchor): HEAD -> refs/heads/master@{1} passes the character
// filter and rev-parse resolves the reflog entry of an older hostile commit.
// check-ref-format plus the exact-row requirement must refuse it (exit 2).
negative('lane_tip_reflog_anchor', mut => {
  if (!mut) return cleanShape();
  const built = cleanShape();
  const tip = git(built.root, ['rev-parse', 'HEAD']);
  put(built.root, 'counted/input.txt', 'reflog drift\n');
  const hostile = commitAll(built.root, 'hostile reflog commit');
  git(built.root, ['update-ref', 'refs/heads/master', hostile]);
  git(built.root, ['update-ref', 'refs/heads/master', tip]);
  writeFileSync(join(built.root, '.git/HEAD'), 'ref: refs/heads/master@{1}\n');
  return built;
}, 2, ['revision_unresolved']);


// ── Runner ────────────────────────────────────────────────────────────────
function runGate(gate, built, c) {
  const repo = built.repoOverride ?? built.root;
  const args = built.modeArgs
    ? [gate, '--repo', repo, ...built.modeArgs, ...(built.extraArgs ?? [])]
    : [gate, '--repo', repo, '--check', built.manifest,
      ...(c.reproduce ? ['--reproduce'] : []), ...(built.extraArgs ?? [])];
  const result = spawnSync(process.execPath, args, { env: minimalEnv, encoding: 'utf8', timeout: 60000 });
  const stdout = result.stdout ?? '';
  const reasons = new Set([...stdout.matchAll(/\breason=([^\s]+)/g)].map(m => m[1]));
  return { status: result.status, reasons, stdout, stderr: result.stderr ?? '', error: result.error };
}

let gate = defaultGate;
const argvRest = process.argv.slice(2);
for (let i = 0; i < argvRest.length; i++) {
  if (argvRest[i] === '--gate' && argvRest[i + 1]) gate = resolve(argvRest[++i]);
  else if (argvRest[i] === '--help' || argvRest[i] === '-h') {
    console.log('usage: node scripts/selftest-measurement-binding.mjs [--gate <path>]');
    process.exit(0);
  }
}
const gateExists = existsSync(gate);
if (!gateExists) console.error(`gate missing: ${gate}`);
let pass = 0;
let total = 0;
const exercised = new Set();
const failures = [];

for (const c of cases) {
  total++;
  let built;
  const extraRoots = [];
  try {
    built = c.build();
    if (built.extraRoots) extraRoots.push(...built.extraRoots);
  } catch (error) {
    console.log(`case=${c.id} expected_exit=${c.expectedExit} actual_exit=build_error expected_reasons=${c.expectedReasons.join(',') || '-'} actual_reasons=- FAIL`);
    failures.push({ id: c.id, detail: `fixture build failed: ${error.message}` });
    continue;
  }
  try {
    const got = gateExists
      ? runGate(gate, built, c)
      : { status: null, reasons: new Set(), stdout: '', stderr: `gate missing: ${gate}`, error: null };
    for (const reason of c.expectedReasons) exercised.add(reason);
    const exitOk = got.status === c.expectedExit;
    const reasonsOk = got.reasons.size === c.expectedReasons.length
      && c.expectedReasons.every(r => got.reasons.has(r));
    let assertOk = true;
    let assertDetail = '';
    try {
      if (c.assertClean && got.status === 0) c.assertClean(built.root);
      if (c.assert) c.assert(built, got);
    } catch (error) {
      assertOk = false;
      assertDetail = error.message;
    }
    const ok = exitOk && reasonsOk && assertOk;
    if (ok) pass++;
    else failures.push({ id: c.id, detail: assertDetail || got.stdout.trim().split('\n').slice(0, 8).join(' | ') });
    console.log(`case=${c.id} expected_exit=${c.expectedExit} actual_exit=${got.status ?? 'null'} expected_reasons=${c.expectedReasons.join(',') || '-'} actual_reasons=${[...got.reasons].sort().join(',') || '-'} ${ok ? 'PASS' : 'FAIL'}`);
  } finally {
    rmSync(built.root, { recursive: true, force: true });
    for (const extra of extraRoots) rmSync(extra, { recursive: true, force: true });
  }
}

for (const failure of failures) {
  console.error(`FAIL_DETAIL case=${failure.id} ${failure.detail}`);
}
const verdict = pass === total ? 'clean' : 'failed';
console.log(`MEASUREMENT_BINDING_SELFTEST verdict=${verdict} cases=${total} reasons=${exercised.size}`);
process.exit(verdict === 'clean' ? 0 : 1);
