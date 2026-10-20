#!/usr/bin/env node
// tabi round-17 routed defect 1 — unrooted liar-probe evidence.
// Source: corpus/lessons/round-16-verifier-spotcheck.md:148. The round-16 probe
// (.ufo/waves/round-16/w2/AttackC1Liar.md) resolved only through the tmpfs clone
// /tmp/tabi-r16-c1liar-93NO; its liar commits are not objects in the lane repo.
//
// This generator rebuilds the three liar revisions from committed blobs in a
// /tmp sandbox clone and re-runs the round-16 C1 counter on each, plus the
// honest base b444ca8. Provenance: on 2026-10-20 that clone was still alive and
// held the originals. blobs/ are their exact bytes (gate fa1e12e1…, selftest
// 3c923598…, the digests recorded in AttackC1Liar.md:35-37); originals.bundle
// is a thin bundle of the three original commits. Rebuilding from blobs/ plus
// the recorded author/committer metadata below reproduces the original commit
// ids exactly — asserted, not assumed.
//
// Usage: node generate.mjs [--lane DIR] [--out FILE] [--keep]
// LANE defaults to five levels above this file. Nothing is written to LANE:
// every git write happens in the sandbox clone, which is removed afterwards.
// Exit 0 only if every expectation holds; receipt.json is written either way.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGV = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = ARGV.indexOf(name);
  return i === -1 ? fallback : ARGV[i + 1];
};
const KEEP = ARGV.includes('--keep');
const LANE = resolve(argOf('--lane', resolve(HERE, '..', '..', '..', '..', '..')));
const OUT = resolve(argOf('--out', join(HERE, 'receipt.json')));

const BASE = 'b444ca8e024f386124418169e8e400221524bba3';
const R16_RECEIPT = 'corpus/evidence/round-16/measure/c1-liar-probes.json';
const COUNTER = {
  path: '.ufo/waves/round-16/measure.mjs',
  sourceRevision: '3254740',
  sha256: 'c8b4100a9f60dcd530ae752074e04d05074b4938cc05c6f19214add05e2594cb',
};
const PRE_COUNTER = {
  path: '.ufo/waves/round-16/measure-pre.mjs',
  sourceRevision: BASE,
  sha256: 'bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9',
};
const BLOBS = {
  gate: { file: 'blobs/gate.mjs', sha256: 'fa1e12e17b03130074bc9c84540aac358a524db5f5f26e2ca3596bcf84624eaf', mode: '100755',
    target: 'scripts/check-measurement-binding.mjs' },
  selftest: { file: 'blobs/selftest.mjs', sha256: '3c92359883994e26550c863fb2809e935af36c13a55294b0e5dc68fcf36b187f', mode: '100755',
    target: 'scripts/selftest-measurement-binding.mjs' },
};
const REAL = {
  gate: '5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb',
  selftest: '8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae',
};
const BUNDLE = { file: 'originals.bundle', sha256: '18568bfbc8033067ff65b7c534a9d903a483d908122b38d895108b49de021b0d' };
// Original commits: parent, author/committer identity, epoch + -0300, message.
const VARIANTS = [
  { name: 'liar-v1', label: 'liar selftest + liar gate', gate: true, selftest: true, epoch: 1792508273,
    commit: '9ecfcc911ce204d3a5b548a37819f01b0c640c10', tree: '53332fd08f8315e863298f93d5f18dbf2e9cfeaf',
    message: 'LIAR: canned selftest + constant gate', originalRef: 'v1-full-liar' },
  { name: 'liar-v2', label: 'liar gate + real selftest', gate: true, selftest: false, epoch: 1792508274,
    commit: '0754e448bbe81390e3c190f5a69d13364d0bc45f', tree: 'b7d9ac92dd9f9a731e88009ff4076af1776d1fa9',
    message: 'LIAR gate only', originalRef: 'v2-liar-gate-real-selftest' },
  { name: 'liar-v3', label: 'liar selftest + real gate', gate: false, selftest: true, epoch: 1792508275,
    commit: '7b497d15a5db17fa3fe3dad6bf44612680dd5e80', tree: 'e96352b672ce56110d8fa1e24aaa3b79dd0aeb86',
    message: 'LIAR selftest only', originalRef: 'v3-liar-selftest-real-gate' },
];
// AttackC1Liar.md:48-52 table: the pre-hardening counter (bda4e18e) counted all
// four revisions except V2; the hardened counter must invert V1 and V3.
const PRE_EXPECTED = { b444ca8e: 1, 'liar-v1': 1, 'liar-v2': 0, 'liar-v3': 1 };
const LIMITS = [
  'Defeats only the three tested liar shapes. A liar that branches on the counter\'s exact argv can still pass (AttackC1Liar.md correction 3).',
  'The counter executes revision scripts unsandboxed; run it only on lane revisions (measure.mjs header).',
  'Byte-identity rests on blobs/ + the recorded commit metadata. originals.bundle restores the exact original objects while it is present.',
];

const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
Object.assign(ENV, { TZ: 'UTC', LC_ALL: 'C', LANG: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_NO_REPLACE_OBJECTS: '1' });

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function git(args, { extraEnv = {}, cwd = LANE, binary = false } = {}) {
  const res = spawnSync('git', ['-c', 'core.fsmonitor=false', ...args], {
    cwd, env: { ...ENV, ...extraEnv }, encoding: binary ? 'buffer' : 'utf8', maxBuffer: 256 * 1024 * 1024,
  });
  if (res.error) throw new Error(`git ${args[0]}: ${res.error.message}`);
  return res;
}
function gitOk(args, opts) {
  const res = git(args, opts);
  if (res.status !== 0) {
    const tail = String(res.stderr ?? '').trim().split('\n').at(-1) ?? '';
    throw new Error(`git ${args.join(' ')} exit ${res.status}${tail ? `: ${tail}` : ''}`);
  }
  return res.stdout;
}

function runCounter(repo, counterPath, rev) {
  const res = spawnSync(process.execPath, [join(repo, counterPath), rev, '--claim', 'C1'], {
    cwd: repo, env: ENV, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
  });
  const text = (res.stdout ?? '').trim();
  let parsed = null;
  try { parsed = JSON.parse(text.split('\n').filter(Boolean).at(-1) ?? ''); } catch { /* exit 2 or crash */ }
  return {
    exit: res.status,
    count: parsed?.c1_binding_contracts ?? null,
    failures: parsed?.failures ?? null,
    gateSha256: parsed?.gateSha256 ?? null,
    selftestSha256: parsed?.selftestSha256 ?? null,
    counterBlobAtRevisionSha256: parsed?.counterBlobAtRevisionSha256 ?? null,
    stderr: parsed ? null : String(res.stderr ?? '').trim().slice(0, 500),
  };
}

const receipt = {
  schema: 'tabi-round17-routed-liar-v1',
  generatedAt: new Date().toISOString(),
  laneRoot: LANE,
  base: BASE,
  sandbox: null,
  counters: {},
  liarBlobs: {},
  realBlobsAtBase: REAL,
  originals: { bundle: BUNDLE, commits: [] },
  runs: [],
  checks: {},
  limits: LIMITS,
  verdict: 'error',
};

let sandbox = null;
try {
  if (!existsSync(join(LANE, '.git'))) throw new Error(`lane is not a git repository: ${LANE}`);
  gitOk(['rev-parse', '--verify', '--end-of-options', `${BASE}^{commit}`]);
  gitOk(['rev-parse', '--verify', '--end-of-options', `${COUNTER.sourceRevision}^{commit}`]);
  gitOk(['rev-parse', '--verify', '--end-of-options', `${COUNTER.sourceRevision}:${COUNTER.path}`]);

  sandbox = mkdtempSync(join(tmpdir(), 'tabi-r17-liar-'));
  const repo = join(sandbox, 'repo');
  gitOk(['clone', '-q', '--no-hardlinks', LANE, repo], { cwd: sandbox });
  gitOk(['checkout', '-q', '--detach', BASE], { cwd: repo });

  // Committed liar blobs must hash to the r16-recorded digests.
  const issues = [];
  const oids = {};
  for (const [key, blob] of Object.entries(BLOBS)) {
    const bytes = readFileSync(join(HERE, blob.file));
    const digest = sha256(bytes);
    receipt.liarBlobs[key] = { path: blob.file, sha256: digest, mode: blob.mode, target: blob.target,
      matchesRecordedDigest: digest === blob.sha256 };
    if (digest !== blob.sha256) issues.push(`${blob.file} sha256 ${digest} != recorded ${blob.sha256}`);
    oids[key] = gitOk(['hash-object', '-w', '--', join(HERE, blob.file)], { cwd: repo }).trim();
  }
  // The base must be the r16-measured snapshot, or the comparison means nothing.
  for (const [key, digest] of Object.entries(REAL)) {
    const atBase = sha256(gitOk(['cat-file', 'blob', `${BASE}:${BLOBS[key].target}`], { cwd: repo, binary: true }));
    receipt.realBlobsAtBase = { ...receipt.realBlobsAtBase, [`${key}Verified`]: atBase === digest };
    if (atBase !== digest) issues.push(`${BLOBS[key].target} at base sha256 ${atBase} != ${digest}`);
  }

  // Rebuild each liar revision with plumbing; worktree stays at BASE.
  for (const variant of VARIANTS) {
    const index = join(sandbox, `index-${variant.name}`);
    const gitIndex = (args) => gitOk(args, { cwd: repo, extraEnv: { GIT_INDEX_FILE: index } });
    gitIndex(['read-tree', BASE]);
    if (variant.gate) gitIndex(['update-index', '--add', '--cacheinfo', `${BLOBS.gate.mode},${oids.gate},${BLOBS.gate.target}`]);
    if (variant.selftest) gitIndex(['update-index', '--add', '--cacheinfo', `${BLOBS.selftest.mode},${oids.selftest},${BLOBS.selftest.target}`]);
    const tree = gitIndex(['write-tree']).trim();
    const identity = { GIT_AUTHOR_NAME: 'liar', GIT_AUTHOR_EMAIL: 'liar@invalid',
      GIT_AUTHOR_DATE: `${variant.epoch} -0300`, GIT_COMMITTER_NAME: 'liar',
      GIT_COMMITTER_EMAIL: 'liar@invalid', GIT_COMMITTER_DATE: `${variant.epoch} -0300` };
    const commit = gitOk(['commit-tree', tree, '-p', BASE, '-m', variant.message], { cwd: repo, extraEnv: identity }).trim();
    gitOk(['update-ref', `refs/heads/${variant.name}`, commit], { cwd: repo });
    const record = { name: variant.name, label: variant.label, commit, expectedCommit: variant.commit,
      commitReproduced: commit === variant.commit, tree, expectedTree: variant.tree,
      treeReproduced: tree === variant.tree };
    receipt.originals.commits.push(record);
    if (!record.commitReproduced) issues.push(`${variant.name} commit ${commit} != original ${variant.commit}`);
    if (!record.treeReproduced) issues.push(`${variant.name} tree ${tree} != original ${variant.tree}`);
  }

  // Cross-check the committed thin bundle: it must restore the same objects.
  const bundlePath = join(HERE, BUNDLE.file);
  const bundle = { ...BUNDLE, verified: false, refsMatch: false };
  if (!existsSync(bundlePath)) {
    issues.push(`${BUNDLE.file} absent`);
  } else {
    bundle.present = true;
    bundle.sha256Actual = sha256(readFileSync(bundlePath));
    if (bundle.sha256Actual !== BUNDLE.sha256) issues.push(`${BUNDLE.file} sha256 ${bundle.sha256Actual} != recorded`);
    const verify = git(['bundle', 'verify', bundlePath], { cwd: repo });
    bundle.verified = verify.status === 0;
    if (!bundle.verified) issues.push(`git bundle verify failed: ${String(verify.stderr ?? '').trim().split('\n').at(-1)}`);
    gitOk(['fetch', '-q', '--no-tags', bundlePath, 'refs/heads/*:refs/original/*'], { cwd: repo });
    bundle.refsMatch = VARIANTS.every((variant) => {
      const ref = `refs/original/${variant.originalRef}`;
      const original = gitOk(['rev-parse', '--verify', `${ref}^{commit}`], { cwd: repo }).trim();
      const originalTree = gitOk(['rev-parse', '--verify', `${ref}^{tree}`], { cwd: repo }).trim();
      // Commit id equality implies tree equality; compare both plus each target
      // path's object id so the check stays variant-agnostic (V2 keeps the real
      // selftest, V3 keeps the real gate).
      const pathsMatch = [BLOBS.gate.target, BLOBS.selftest.target].every((path) =>
        gitOk(['rev-parse', '--verify', `${ref}:${path}`], { cwd: repo }).trim()
        === gitOk(['rev-parse', '--verify', `${variant.commit}:${path}`], { cwd: repo }).trim());
      return original === variant.commit && originalTree === variant.tree && pathsMatch;
    });
    if (!bundle.refsMatch) issues.push('bundle refs do not reproduce the rebuilt commits, trees or blob ids');
  }
  receipt.originals.bundle = bundle;

  // Materialise both counters from git and pin their bytes.
  for (const spec of [COUNTER, PRE_COUNTER]) {
    const bytes = gitOk(['cat-file', 'blob', `${spec.sourceRevision}:${COUNTER.path}`], { cwd: repo, binary: true });
    const digest = sha256(bytes);
    const fullRev = gitOk(['rev-parse', '--verify', `${spec.sourceRevision}^{commit}`], { cwd: repo }).trim();
    receipt.counters[spec === COUNTER ? 'hardened' : 'preHardening'] = {
      path: spec.path, sourceRevision: fullRev, sha256: digest, matchesRecordedDigest: digest === spec.sha256 };
    if (digest !== spec.sha256) issues.push(`counter ${spec.path} sha256 ${digest} != ${spec.sha256}`);
    const target = join(repo, spec.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
    chmodSync(target, 0o755);
  }

  // Run both counters over the honest base and the three liar revisions.
  const revs = [{ rev: BASE, label: 'honest b444ca8', key: 'b444ca8e' },
    ...VARIANTS.map((v) => ({ rev: v.commit, label: v.label, key: v.name }))];
  for (const engine of ['hardened', 'preHardening']) {
    for (const entry of revs) {
      const result = runCounter(repo, receipt.counters[engine].path, entry.rev);
      receipt.runs.push({ engine, rev: entry.rev, label: entry.label, ...result });
    }
  }

  // Expectation 1: the hardened counter reproduces the committed r16 receipt.
  const r16Path = join(LANE, R16_RECEIPT);
  const r16 = existsSync(r16Path) ? JSON.parse(readFileSync(r16Path, 'utf8')) : null;
  const checks = { r16ReceiptPresent: Boolean(r16), r16CounterMatches: r16 ? r16.counterSha256 === COUNTER.sha256 : false,
    r16ReceiptMatches: false, hardenedAsExpected: false, preHardeningAsExpected: false, identityReproduced: false };
  if (r16) {
    checks.runsCompared = [];
    let all = true;
    for (const expected of r16.runs) {
      const run = receipt.runs.find((r) => r.engine === 'hardened' && r.rev.startsWith(expected.rev));
      const same = Boolean(run) && run.exit === expected.exit && run.count === expected.count
        && JSON.stringify(run.failures) === JSON.stringify(expected.failures);
      checks.runsCompared.push({ rev: expected.rev, count: expected.count, matched: same });
      if (!same) all = false;
    }
    checks.r16ReceiptMatches = all;
    if (!all) issues.push('hardened runs do not reproduce ' + R16_RECEIPT);
    if (!checks.r16CounterMatches) issues.push(`r16 receipt counterSha256 != ${COUNTER.sha256}`);
  } else {
    issues.push(`${R16_RECEIPT} absent`);
  }

  // Expectation 2: hardened engine must count 1 only for the honest base.
  const hardened = receipt.runs.filter((r) => r.engine === 'hardened');
  checks.hardenedAsExpected = hardened.length === 4
    && hardened.every((r) => r.exit === 0 && (r.label === 'honest b444ca8' ? r.count === 1 : r.count === 0));
  if (!checks.hardenedAsExpected) issues.push('hardened counter did not count 1/0/0/0');

  // Expectation 3: pre-hardening counter reproduces AttackC1Liar.md's table.
  checks.preHardeningCounts = {};
  for (const entry of revs) {
    const run = receipt.runs.find((r) => r.engine === 'preHardening' && r.rev === entry.rev);
    checks.preHardeningCounts[entry.key] = run?.count ?? null;
    if (!run || run.exit !== 0 || run.count !== PRE_EXPECTED[entry.key]) issues.push(`pre-hardening ${entry.label} ${run?.count} != ${PRE_EXPECTED[entry.key]}`);
  }
  checks.preHardeningAsExpected = Object.entries(PRE_EXPECTED)
    .every(([key, want]) => checks.preHardeningCounts[key] === want);

  // Expectation 4: rebuilt object ids equal the originals.
  checks.identityReproduced = receipt.originals.commits.every((c) => c.commitReproduced && c.treeReproduced)
    && Boolean(receipt.originals.bundle.verified) && Boolean(receipt.originals.bundle.refsMatch);

  receipt.checks = checks;
  receipt.verdict = issues.length === 0 ? 'pass' : 'fail';
  receipt.issues = issues;
} catch (error) {
  receipt.issues = [String(error.message ?? error)];
  receipt.verdict = 'error';
} finally {
  if (sandbox) {
    receipt.sandbox = { path: sandbox, removed: !KEEP };
    if (!KEEP) rmSync(sandbox, { recursive: true, force: true });
  }
  if (!receipt.counters || Object.keys(receipt.counters).length === 0) delete receipt.counters;
  const tmp = `${OUT}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(receipt, null, 1)}\n`);
  renameSync(tmp, OUT);
}

for (const run of receipt.runs) {
  console.log(`${run.engine.toUpperCase().padEnd(12)} ${run.label.padEnd(28)} ${run.rev.slice(0, 7)} exit=${run.exit} count=${run.count} failures=${Array.isArray(run.failures) ? run.failures.length : '?'}`);
}
console.log(`receipt=${OUT}`);
console.log(`verdict=${receipt.verdict}${receipt.issues?.length ? ` issues=${receipt.issues.length}` : ''}`);
if (receipt.issues?.length) for (const issue of receipt.issues) console.log(`  - ${issue}`);
process.exitCode = receipt.verdict === 'pass' ? 0 : 1;
