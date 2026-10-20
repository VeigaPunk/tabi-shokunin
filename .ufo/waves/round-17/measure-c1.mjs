#!/usr/bin/env node
// C1 count — jj-anchor-safe gate entry points (round 17, PLAN.md §C1 count definition).
//
//   node .ufo/waves/round-17/measure-c1.mjs REV [--lane PATH] [--keep]
//
// One JSON line on stdout. Exit 0 = counted (N may be 0); exit 2 = could-not-evaluate.
//
// Arms per entry (worktree/HEAD/master):
//   A  : HEAD attached at refs/heads/master == REV, worktree == REV   (plain git)
//   B  : HEAD detached at poison P (`update-ref --no-deref HEAD P`),    (off-branch HEAD)
//        master == REV, worktree == REV
//   B2 : `git checkout -f --detach P` — HEAD == worktree == P,          (real jj state:
//        master == REV                                                 @ on no branch)
//   C  : master == P, HEAD attached, worktree == REV                    (sensitivity)
// P is a child of REV built with plumbing (read-tree/update-index/write-tree/
// commit-tree), so arm A's worktree is never checked out to it. Each entry has
// its own P so the poison targets that entry's own read path (L1 repair 1):
//   round-production      drop corpus/lessons/pstack-20261015-r10.md (roundIds count)
//   user-production       add corpus/lessons/user-20261015-r07..r10.md (roundIds count
//                         reaches 10, so the loop runs and fails with missing_gate)
//   round-count-witness   append to scripts/check-round-contract.mjs (committed bit)
//   user-*-witness        append to scripts/check-user-round-contract.mjs (committed bit)
//   binding               append to corpus/evidence/round-15/measurements.json (r16 C1
//                         counted input, undrifted at the r17 tip) and to
//                         .ufo/waves/round-16/measure.mjs (counter_changed_since_measurement)
//   user-fixture-full-read append to corpus/evidence/user-20261015-r01/spec.json
//                         (sameTree evidence_moved through the full loop)
//
// Pass predicate (L1 repair, RevPlanC1 F1/F2/F3/F6, CriticLowestAxis A5):
//   (1) exit + full normalized output equal in A and B (revision labels classified
//       REV|POISON|OTHER, so a HEAD-reading field can never be normalized away);
//   (2) every printed code/measured revision field in B equals REV;
//   (3) witness committed/code_committed: A == B == yes, B2 == no (worktree P vs
//       tip REV) with measuredRevision=uncommitted, and B2 revision fields == REV;
//   (4) B2 behavior (verdict/finding/reason/detail with ALL revision and committed
//       labels normalized) equals A: where committed state matters, HEAD naming an
//       off-branch commit must not change the verdict;
//   (5) C behavior differs from A. A C difference that survives only in revision or
//       committed labels is reported as kind="label" and is NOT counted (L1 repair 3);
//   (6) static residue: HEAD revision operands in the gate blob at REV outside
//       the fixture sites of .ufo/waves/round-17/c1-sites.json on a
//       provenance-bearing (non-fixture) function must equal 0 (L1 repair 5). An
//       operand is a quoted literal that IS a revision ('HEAD', 'HEAD~1',
//       'HEAD^', 'HEAD:path', 'HEAD@{0}'), a bare reflog '@{...}', or a
//       code/template range operand (`..HEAD`, `HEAD~`, `HEAD^`, `HEAD:`,
//       `HEAD@`, `@{`) such as `${pin}..HEAD`. Prose occurrences in comments,
//       error strings and other refs ('ancestor of HEAD', 'Detached-HEAD ...',
//       'refs/heads/master@{1}') are not operands; a token built at runtime
//       ('HE','AD' join) stays a declared behavior-arm gap (ReRunC1).
//       The inventory is read from REV's own blob (`git cat-file blob
//       REV:<path>`), never from the LANE worktree; when absent at REV the
//       counter falls back to an embedded fixture-site list so the baseline
//       5859243 run stays evaluable.
// The entry drives the user gate through its full committed-state read path in
// fixture mode (`--repo <clone> --baseline HARD --expect 6`) from a gate copy outside
// the clone, so a partial HEAD read cannot hide behind round_count (L1 repair 4).
//
// Normalization (counter-owned; only volatile tokens and declared label fields are
// erased, never a finding, verdict or exit code):
//   - sandbox and /var/tmp//tmp scratch paths -> <TMP>;
//   - named revision fields (code_revision, codeRevision, measuredRevision, atRev,
//     at) keep a classified value REV|POISON|OTHER;
//   - all remaining 64-/40-hex tokens -> <HEX64>/<HEX40> (fixture commit ids are
//     wall-clock dependent: the gates pin no GIT_*_DATE);
//   - behavior projections additionally strip label fields (rev=, baseline=,
//     *-blob=, *-sha256=, committed=, code_committed=, measuredRevision=).
// Output compared is stdout + stderr: failed gates print finding= on stderr.
//
// Canonical argv sources (SKILL.md, lane root; append-only rows):
//   SKILL.md:1677 historical-pstack-contract: "`node scripts/check-round-contract.mjs`; …
//     `--witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` …"
//   SKILL.md:1729-1730 "The USER compatibility witness is supported explicitly:
//     `node scripts/check-user-round-contract.mjs --witness 75e7836…`."
//   SKILL.md:1800 historical-user-contract: "… `--diagnostic-witness` …
//     `--count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` …"
//   SKILL.md:1840 measurement-binding: "`node scripts/check-measurement-binding.mjs
//     --check <manifest> [--at REV] [--reproduce]`; …"
// The round-gate --count-witness revision is the gate's own pinned red arm
// (`COUNT_WITNESS_REV` at scripts/check-round-contract.mjs:43, blob 43db9f4b); the
// round-13 row names the mode without restating the revision.
// check-freshness is excluded: byte-frozen at the hard baseline (PLAN.md).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(here), '..', '..', '..');
const SITES_FILE = '.ufo/waves/round-17/c1-sites.json';

const ROUND_WITNESS_REV = '75e7836b6c3090180aee2754e20a5d3cfb186e74'; // SKILL.md:1677,1729
const COUNT_WITNESS_REV = 'bebe2efc4565bb068efd905e9ef78011bb6b4efd'; // SKILL.md:1800; gate constant
const HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c';

const POISON_MARK = '\n// c1-anchor-poison: unreferenced committed change for arm B/B2/C\n';

// Fixed entry list. `poison` is relative to REV; `script` is the gate path in the
// clone (used for residue), `gate` is the blob whose static residue gates the entry.
const ENTRIES = [
  {
    id: 'round-contract-production',
    script: 'scripts/check-round-contract.mjs',
    gate: 'scripts/check-round-contract.mjs',
    argv: () => [],
    source: 'SKILL.md:1677 (historical-pstack-contract, production entry)',
    poison: { remove: ['corpus/lessons/pstack-20261015-r10.md'] },
  },
  {
    id: 'user-contract-production',
    script: 'scripts/check-user-round-contract.mjs',
    gate: 'scripts/check-user-round-contract.mjs',
    argv: () => [],
    source: 'SKILL.md:1800 (historical-user-contract, production entry)',
    // Ten user lessons make the gate leave round_count and run its loop; r07 has
    // no Gate, so a tip-reader fails with missing_gate instead of round_count.
    // The two appends make P a *history* change: both paths already sit in the
    // pin..tip diff (round-16.md added pin..tip, status 'M' at tip; the round
    // script, status 'M' to acceptedRoundScript), so a `pin..HEAD` range sees
    // P's extra modification while `pin..tip` does not (MutC1Counter survivor).
    poison: {
      write: [
        { path: 'corpus/lessons/user-20261015-r07.md', bytes: '\n' },
        { path: 'corpus/lessons/user-20261015-r08.md', bytes: '\n' },
        { path: 'corpus/lessons/user-20261015-r09.md', bytes: '\n' },
        { path: 'corpus/lessons/user-20261015-r10.md', bytes: '\n' },
      ],
      append: [
        { path: 'scripts/check-round-contract.mjs', suffix: POISON_MARK },
        { path: 'corpus/lessons/round-16.md', suffix: POISON_MARK },
      ],
    },
  },
  {
    id: 'round-contract-count-witness',
    script: 'scripts/check-round-contract.mjs',
    gate: 'scripts/check-round-contract.mjs',
    argv: () => ['--count-witness', COUNT_WITNESS_REV],
    source: 'SKILL.md:1677 mode + scripts/check-round-contract.mjs:43 COUNT_WITNESS_REV',
    poison: { append: [{ path: 'scripts/check-round-contract.mjs', suffix: POISON_MARK }] },
  },
  {
    id: 'user-contract-witness',
    script: 'scripts/check-user-round-contract.mjs',
    gate: 'scripts/check-user-round-contract.mjs',
    argv: () => ['--witness', ROUND_WITNESS_REV],
    source: 'SKILL.md:1729-1730 (explicit USER compatibility witness)',
    poison: { append: [{ path: 'scripts/check-user-round-contract.mjs', suffix: POISON_MARK }] },
  },
  {
    id: 'user-contract-count-witness',
    script: 'scripts/check-user-round-contract.mjs',
    gate: 'scripts/check-user-round-contract.mjs',
    argv: () => ['--count-witness', COUNT_WITNESS_REV],
    source: 'SKILL.md:1800 (--count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd)',
    poison: { append: [{ path: 'scripts/check-user-round-contract.mjs', suffix: POISON_MARK }] },
  },
  {
    id: 'user-contract-diagnostic-witness',
    script: 'scripts/check-user-round-contract.mjs',
    gate: 'scripts/check-user-round-contract.mjs',
    argv: () => ['--diagnostic-witness'],
    source: 'SKILL.md:1800 (--diagnostic-witness)',
    poison: { append: [{ path: 'scripts/check-user-round-contract.mjs', suffix: POISON_MARK }] },
  },
  {
    id: 'measurement-binding-round16-manifest',
    script: 'scripts/check-measurement-binding.mjs',
    gate: 'scripts/check-measurement-binding.mjs',
    argv: () => ['--check', 'corpus/evidence/round-16/measurement-binding.json'],
    source: 'SKILL.md:1840 (--check <manifest>, default --at) + PLAN.md C1 entry list',
    poison: {
      append: [
        { path: 'corpus/evidence/round-15/measurements.json', suffix: '\n' },
        { path: '.ufo/waves/round-16/measure.mjs', suffix: POISON_MARK },
      ],
    },
  },
  {
    id: 'user-contract-fixture-full-read',
    script: 'scripts/check-user-round-contract.mjs',
    gate: 'scripts/check-user-round-contract.mjs',
    // Full committed-state read path: fixture mode against the clone itself, gate
    // copied outside the clone so repo != defaultRoot and --expect 6 is accepted.
    outOfTree: true,
    argv: (repo) => ['--repo', repo, '--baseline', HARD_BASELINE, '--expect', '6'],
    source: 'SKILL.md:1800 fixture CLI + CriticC1 A3 counterexample 2 (full loop)',
    poison: { append: [{ path: 'corpus/evidence/user-20261015-r01/spec.json', suffix: '\n\n' }] },
    requireA: (arm) => arm.exit === 0 && /USER_ROUND_CONTRACT verdict=clean rounds=6(?: |$)/.test(arm.output),
  },
];

const REV_FIELD_RE = /\b(code_revision|codeRevision|measuredRevision|atRev|at)=([0-9a-f]{40})\b/g;
const LABEL_FIELD_RE = /\b(code_revision|codeRevision|measuredRevision|atRev|at|committed|code_committed|rev|baseline|head-blob|worktree-blob|baseline-blob|baseline-sha256|new-sha256|code-sha256)=([^\s"]+)/g;
const COMMIT_FIELD_RE = /\b(committed|code_committed)=(yes|no)\b/g;
const RUN_TIMEOUT_MS = 10 * 60 * 1000; // PLAN.md drop rule: >10 min is not evaluable
const MAX_BUFFER = 32 * 1024 * 1024;

class CouldNotEvaluate extends Error {
  constructor(reason, detail) {
    super(detail);
    this.reason = reason;
  }
}

function usage() {
  return 'usage: node .ufo/waves/round-17/measure-c1.mjs REV [--lane PATH] [--keep]';
}

function parseArguments(argv) {
  const options = { rev: null, lane: LANE, keep: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (next === undefined || next.startsWith('--')) throw new CouldNotEvaluate('usage', `${arg} requires a value`);
      index += 1;
      return next;
    };
    if (arg === '--lane') options.lane = resolve(value());
    else if (arg === '--keep') options.keep = true;
    else if (arg.startsWith('--')) throw new CouldNotEvaluate('usage', `unknown option ${arg}`);
    else if (options.rev === null) options.rev = arg;
    else throw new CouldNotEvaluate('usage', `unexpected argument ${arg}`);
  }
  if (!options.rev || !/^[0-9a-f]{40}$/.test(options.rev)) {
    throw new CouldNotEvaluate('usage', `REV must be a full 40-hex commit: ${usage()}`);
  }
  return options;
}

function makeEnv(home, extra = {}) {
  // Minimal Git environment: nothing inherited, no system/global config,
  // no locks, no prompts, no replace refs. PATH is node's own dir + system.
  return {
    PATH: `${dirname(process.execPath)}:/usr/bin:/bin`,
    HOME: home,
    TZ: 'UTC',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    ...extra,
  };
}

function runGit(repo, args, env, extra = {}) {
  const result = spawnSync('git', args, {
    cwd: repo,
    env,
    encoding: 'utf8',
    input: extra.input,
    maxBuffer: MAX_BUFFER,
  });
  if (result.error) {
    throw new CouldNotEvaluate('git_spawn_failed', `git ${args.join(' ')}: ${result.error.message}`);
  }
  return result;
}

function gitOk(repo, args, env) {
  const result = runGit(repo, args, env);
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().slice(0, 400);
    throw new CouldNotEvaluate('git_failed', `git ${args.join(' ')} exited ${result.status}: ${detail}`);
  }
  return result.stdout.trim();
}

function digest(text) {
  return createHash('sha256').update(text).digest('hex');
}

function firstLine(arm) {
  const pick = (text, label) => {
    const line = String(text).split('\n').find((candidate) => candidate.trim().length > 0);
    return line ? `${label}:${line.replace(/\s+/g, ' ').trim().slice(0, 240)}` : null;
  };
  return pick(arm.stdout, 'out') ?? pick(arm.stderr, 'err') ?? 'none';
}

function normalizeTokens(text, revInfo, poison) {
  let out = String(text).split('\u0000').join('');
  out = out.split(revInfo.sandbox).join('<TMP>');
  out = out.replace(/\/var\/tmp\/tabi-[A-Za-z0-9._-]+/g, '<TMP>');
  out = out.replace(/\/tmp\/tabi-[A-Za-z0-9._-]+/g, '<TMP>');
  out = out.replace(REV_FIELD_RE, (_, field, value) => {
    const label = value === revInfo.commit ? 'REV' : value === poison ? 'POISON' : 'OTHER';
    return `${field}=${label}`;
  });
  out = out.replace(/\b[0-9a-f]{64}\b/g, '<HEX64>');
  out = out.replace(/\b[0-9a-f]{40}\b/g, '<HEX40>');
  return out;
}

function behaviorText(text, revInfo, poison) {
  let out = String(text).split('\u0000').join('');
  out = out.split(revInfo.sandbox).join('<TMP>');
  out = out.replace(/\/var\/tmp\/tabi-[A-Za-z0-9._-]+/g, '<TMP>');
  out = out.replace(/\/tmp\/tabi-[A-Za-z0-9._-]+/g, '<TMP>');
  out = out.replace(LABEL_FIELD_RE, (_, field) => `${field}=<LABEL>`);
  out = out.replace(/\b[0-9a-f]{64}\b/g, '<HEX64>');
  out = out.replace(/\b[0-9a-f]{40}\b/g, '<HEX40>');
  return out;
}

function revisionFields(text) {
  return [...String(text).matchAll(REV_FIELD_RE)].map((match) => ({ field: match[1], value: match[2] }));
}

function committedFields(text) {
  return [...String(text).matchAll(COMMIT_FIELD_RE)].map((match) => ({ field: match[1], value: match[2] }));
}

function measuredField(text) {
  return /\bmeasuredRevision=([A-Za-z0-9_]+)/.exec(String(text))?.[1] ?? null;
}

function verdictClass(text) {
  const source = String(text);
  const collect = (pattern) => [...new Set([...source.matchAll(pattern)].map((match) => match[1]))].sort();
  const verdicts = collect(/\bverdict=([a-z-]+)/g);
  const findings = collect(/\bfinding=([a-z_]+)/g);
  const reasons = collect(/\breason=([a-z_]+)/g);
  return `v:${verdicts.join(',')}|f:${findings.join(',')}|r:${reasons.join(',')}`;
}

function buildPoison(repo, rev, env, spec) {
  const index = join(repo, '.git', `c1-poison-index-${digest(JSON.stringify(spec)).slice(0, 12)}`);
  const indexEnv = { ...env, GIT_INDEX_FILE: index };
  let tree;
  try {
    for (const path of spec.remove ?? []) {
      const probe = runGit(repo, ['cat-file', '-e', `${rev}:${path}`], env);
      if (probe.status !== 0) throw new CouldNotEvaluate('poison_input_missing', `poison needs ${path} at ${rev}`);
    }
    gitOk(repo, ['read-tree', rev], indexEnv);
    for (const path of spec.remove ?? []) {
      const removal = runGit(repo, ['update-index', '--force-remove', '--', path], indexEnv);
      if (removal.status !== 0) {
        throw new CouldNotEvaluate('poison_build_failed', `could not drop ${path}: ${removal.stderr.trim()}`);
      }
    }
    for (const item of spec.append ?? []) {
      const probe = runGit(repo, ['cat-file', '-e', `${rev}:${item.path}`], env);
      if (probe.status !== 0) throw new CouldNotEvaluate('poison_input_missing', `poison needs ${item.path} at ${rev}`);
      const current = readFileSync(join(repo, item.path));
      const hashed = runGit(repo, ['hash-object', '-w', '--stdin'], env, {
        input: Buffer.concat([current, Buffer.from(item.suffix)]),
      });
      if (hashed.status !== 0) {
        throw new CouldNotEvaluate('poison_build_failed', `could not hash ${item.path}: ${(hashed.stderr || '').trim().slice(0, 300)}`);
      }
      const added = runGit(repo, ['update-index', '--add', '--cacheinfo', '100644', hashed.stdout.trim(), item.path], indexEnv);
      if (added.status !== 0) {
        throw new CouldNotEvaluate('poison_build_failed', `could not rewrite ${item.path}: ${added.stderr.trim()}`);
      }
    }
    for (const item of spec.write ?? []) {
      const hashed = runGit(repo, ['hash-object', '-w', '--stdin'], env, { input: Buffer.from(item.bytes) });
      if (hashed.status !== 0) {
        throw new CouldNotEvaluate('poison_build_failed', `could not hash ${item.path}: ${(hashed.stderr || '').trim().slice(0, 300)}`);
      }
      const added = runGit(repo, ['update-index', '--add', '--cacheinfo', '100644', hashed.stdout.trim(), item.path], indexEnv);
      if (added.status !== 0) {
        throw new CouldNotEvaluate('poison_build_failed', `could not add ${item.path}: ${added.stderr.trim()}`);
      }
    }
    tree = gitOk(repo, ['write-tree'], indexEnv);
  } finally {
    try { unlinkSync(index); } catch { /* absent is fine */ }
  }
  const baseTree = gitOk(repo, ['rev-parse', `${rev}^{tree}`], env);
  if (tree === baseTree) throw new CouldNotEvaluate('poison_build_failed', 'poison tree equals REV tree');
  const commitEnv = {
    ...env,
    GIT_AUTHOR_NAME: 'c1-anchor-counter',
    GIT_AUTHOR_EMAIL: 'c1-anchor-counter@local',
    GIT_AUTHOR_DATE: '2026-10-20T00:00:00+00:00',
    GIT_COMMITTER_NAME: 'c1-anchor-counter',
    GIT_COMMITTER_EMAIL: 'c1-anchor-counter@local',
    GIT_COMMITTER_DATE: '2026-10-20T00:00:00+00:00',
  };
  const poison = gitOk(repo, ['commit-tree', tree, '-p', rev, '-m', 'c1-anchor poison for one entry'], commitEnv);
  const changes = gitOk(repo, ['diff', '--name-status', rev, poison], env).split('\n').filter(Boolean);
  return { poison, changes };
}

// ---------------------------------------------------------------------------
// Static residue: literal 'HEAD' revision reads in a gate blob at REV, excluding
// the fixture sites listed in .ufo/waves/round-17/c1-sites.json. An occurrence is
// excluded when (a) it is not a revision read at all (`symbolic-ref` probe,
// `update-ref` write, `.git/HEAD` path, HTTP method literal), (b) its
// (function, line) pair is a c1-sites fixture site, or (c) it sits in a
// fixture-only function (all c1-sites sites fixture, or a `*Fixture` builder) —
// except a `defaultRoot` read, which is always live. Mixed functions
// (witness/countWitness/selfTest) are therefore judged per occurrence: fixture
// reads use a fixture-local root and are excluded; defaultRoot reads count.
// The scanner counts revision operands below: quoted literals that are
// revisions, plus `..HEAD` / `HEAD~` / `HEAD^` / `HEAD:` / `HEAD@` / `@{`
// forms inside template and code text.
// ---------------------------------------------------------------------------
function normalizeSiteText(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

// Fallback for a REV where .ufo/waves/round-17/c1-sites.json is not yet committed
// (the baseline 5859243 run must stay evaluable). Counter-owned copy of that
// inventory's fixture sites: `sites` are the fixture-classified (function, line)
// pairs that can carry a literal HEAD read; `fixtureOnly` lists functions whose
// every recorded site is fixture (derived from the full inventory). Regenerate
// both from c1-sites.json if the gates' fixture helpers change.
const EMBEDDED_FIXTURE_SITES = {
  'scripts/check-round-contract.mjs': {
    fixtureOnly: ['commit', 'writeGoodFixture', 'selfTest', 'witness'],
    sites: [
      ['commit', "return gitOk(root, ['rev-parse', 'HEAD']);"],
      ['countWitness', "const head = gitOk(root, ['rev-parse', 'HEAD']);"],
      ['countWitness', "const oldHead = gitOk(root, ['rev-parse', 'HEAD']);"],
      ['countWitness', "const newHead = gitOk(root, ['rev-parse', 'HEAD']);"],
    ],
  },
  'scripts/check-user-round-contract.mjs': {
    fixtureOnly: ['commit', 'writeGoodFixture'],
    sites: [
      ['commit', "return gitOk(root, ['rev-parse', 'HEAD']);"],
      ['selfTest', "const frozen = gitOk(root, ['rev-list', '--max-parents=0', 'HEAD']);"],
    ],
  },
  'scripts/check-measurement-binding.mjs': { fixtureOnly: [], sites: [] },
};

function inventoryFromSites(sites, source) {
  const byFile = new Map();
  for (const site of sites) {
    if (!byFile.has(site.file)) byFile.set(site.file, { sites: [], fixtureOnly: new Set() });
    byFile.get(site.file).sites.push(site);
  }
  for (const meta of byFile.values()) {
    const counts = new Map();
    for (const site of meta.sites) {
      const name = site.enclosing_function || '(top)';
      if (!counts.has(name)) counts.set(name, { live: 0, fixture: 0 });
      counts.get(name)[site.class === 'fixture' ? 'fixture' : 'live'] += 1;
    }
    for (const [name, count] of counts) {
      if (count.live === 0 && count.fixture > 0) meta.fixtureOnly.add(name);
    }
  }
  return { byFile, source };
}

function embeddedInventory() {
  const byFile = new Map();
  for (const [file, spec] of Object.entries(EMBEDDED_FIXTURE_SITES)) {
    byFile.set(file, {
      sites: spec.sites.map(([enclosing, text]) => ({ class: 'fixture', enclosing_function: enclosing, line_text: text })),
      fixtureOnly: new Set(spec.fixtureOnly),
    });
  }
  return { byFile, source: 'embedded' };
}

// The inventory is read from REV's own blob (`git cat-file blob REV:<path>`),
// never from the LANE worktree; absent at REV falls back to the embedded list.
function loadSiteInventory(repo, rev, env) {
  const blob = runGit(repo, ['cat-file', 'blob', `${rev}:${SITES_FILE}`], env);
  if (blob.status !== 0) return embeddedInventory();
  let parsed;
  try {
    parsed = JSON.parse(blob.stdout);
  } catch (error) {
    throw new CouldNotEvaluate('sites_inventory_invalid', `${SITES_FILE} at ${rev} is not JSON: ${error.message}`);
  }
  if (!Array.isArray(parsed.sites)) {
    throw new CouldNotEvaluate('sites_inventory_invalid', `${SITES_FILE} at ${rev} has no sites[]`);
  }
  return inventoryFromSites(parsed.sites, 'rev');
}

// HEAD revision operands on one source line. `//` comments are prose; string
// and template spans are scanned for operand forms (a template's interpolations
// are stripped first). A quoted literal counts when its content begins as a
// revision operand ('HEAD', 'HEAD~1', 'HEAD:path', 'HEAD@{0}', '@{...}') or
// carries an explicit `..HEAD` range end; free prose strings mentioning HEAD
// ('ancestor of HEAD', 'Detached-HEAD fixture') do not.
const CODE_HEAD_RE = /\.\.HEAD(?![\w$])|\bHEAD(?=[~^:@]|\.\.)|@\{/g;

function quoteOperand(text, backtick) {
  if (backtick) return (text.match(CODE_HEAD_RE) || []).length;
  return /^(?:HEAD(?:$|[~^:@.])|@\{)/.test(text) || /\.\.HEAD(?![\w$])/.test(text) ? 1 : 0;
}

function headOperands(line) {
  let count = 0;
  let i = 0;
  let quote = null;
  let inner = '';
  const code = () => (innerScanSource(line).match(CODE_HEAD_RE) || []).length;
  while (i < line.length) {
    const ch = line[i];
    if (quote === null) {
      if (ch === '/' && line[i + 1] === '/') break;
      if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      i += 1;
      continue;
    }
    if (ch === '\\') { inner += ch + (line[i + 1] ?? ''); i += 2; continue; }
    if (quote === '`' && ch === '$' && line[i + 1] === '{') {
      let depth = 1;
      i += 2;
      while (i < line.length && depth > 0) {
        if (line[i] === '{') depth += 1;
        else if (line[i] === '}') depth -= 1;
        i += 1;
      }
      continue;
    }
    if (ch === quote) { count += quoteOperand(inner, quote === '`'); quote = null; inner = ''; i += 1; continue; }
    inner += ch;
    i += 1;
  }
  if (quote !== null) count += quoteOperand(inner, quote === '`');
  return count + code();
}

// The source line minus comments and minus every string/template span.
function innerScanSource(line) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < line.length) {
    const ch = line[i];
    if (quote === null) {
      if (ch === '/' && line[i + 1] === '/') break;
      if (ch === "'" || ch === '"' || ch === '`') { quote = ch; i += 1; continue; }
      out += ch; i += 1; continue;
    }
    if (ch === '\\') { i += 2; continue; }
    if (ch === quote) quote = null;
    i += 1;
  }
  return out;
}

function isNonRevisionLine(line) {
  if (/\bsymbolic-ref\b/.test(line)) return true;
  if (/\bwriteFileSync\b/.test(line) && /\bHEAD\b/.test(line)) return true;
  if (/\bmethods?\b/.test(line) && /\bHEAD\b/.test(line) && /!==|===|includes\(|some\(/.test(line)) return true;
  if (/\bupdate-ref\b/.test(line) && !/(rev-parse|merge-base|ls-tree|cat-file|rev-list|show\(|list\(|blob\()/.test(line)) return true;
  return false;
}

function residueFor(repo, rev, gatePath, inventory, env) {
  const text = gitOk(repo, ['show', `${rev}:${gatePath}`], env);
  const meta = inventory.get(gatePath) ?? { sites: [], fixtureOnly: new Set() };
  const fixtureSites = new Set(meta.sites.filter((site) => site.class === 'fixture')
    .map((site) => `${normalizeSiteText(site.enclosing_function) || '(top)'}|${normalizeSiteText(site.line_text)}`));
  const fixtureOnly = meta.fixtureOnly;
  const report = { file: gatePath, raw: 0, excluded: { nonRevision: 0, site: 0, fixtureFunction: 0 }, residue: 0, lines: [] };
  let fn = '(top)';
  text.split('\n').forEach((line, index) => {
    const match = /^function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(line);
    if (match) fn = match[1];
    const tokens = headOperands(line);
    if (!tokens) return;
    report.raw += tokens;
    if (isNonRevisionLine(line)) {
      report.excluded.nonRevision += tokens;
      return;
    }
    const signature = `${fn}|${normalizeSiteText(line)}`;
    if (fixtureSites.has(signature)) {
      report.excluded.site += tokens;
      return;
    }
    const fixtureFunction = fixtureOnly.has(fn) || /Fixture$/.test(fn);
    if (fixtureFunction && !/\bdefaultRoot\b/.test(line)) {
      report.excluded.fixtureFunction += tokens;
      return;
    }
    // A mixed fixture function's read is live only when it names the production
    // root; a fixture-local root is excluded.
    if (!fixtureFunction && /^(commit|writeGoodFixture|witness|countWitness|runCountWitness|runDiagnosticWitness|selfTest)$/.test(fn) && !/\bdefaultRoot\b/.test(line)) {
      report.excluded.fixtureFunction += tokens;
      return;
    }
    const counted = /\bupdate-ref\b/.test(line) && tokens > 1 ? 1 : tokens;
    report.residue += counted;
    report.lines.push(`${gatePath}:${index + 1}:${fn}: ${line.trim().slice(0, 160)}`);
  });
  return report;
}

// ---------------------------------------------------------------------------
function setAttached(repo, env, master) {
  gitOk(repo, ['update-ref', 'refs/heads/master', master], env);
  gitOk(repo, ['symbolic-ref', 'HEAD', 'refs/heads/master'], env);
}

function checkoutDetached(repo, env, rev) {
  gitOk(repo, ['checkout', '-q', '-f', '--detach', rev], env);
}

function runEntry(repo, env, entry, revInfo) {
  const scriptPath = entry.outOfTree ? revInfo.outOfTreeScript : join(repo, entry.script);
  const argv = entry.argv(repo);
  const started = process.hrtime.bigint();
  const result = spawnSync(process.execPath, [scriptPath, ...argv], {
    cwd: repo,
    env,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    timeout: RUN_TIMEOUT_MS,
  });
  const elapsedMs = Number((process.hrtime.bigint() - started) / 1000000n);
  if (result.error && result.error.code !== 'ETIMEDOUT') {
    throw new CouldNotEvaluate('gate_spawn_failed', `${entry.id}: ${result.error.message}`);
  }
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const timedOut = Boolean(result.error && result.error.code === 'ETIMEDOUT');
  return {
    exit: result.status,
    timedOut,
    stdout,
    stderr,
    output: `${stdout}\n--- stderr ---\n${stderr}`,
    elapsedMs,
  };
}

function evaluate(entry, arms, revInfo, poison, residue) {
  const { a, b, b2, c } = arms;
  const fullA = normalizeTokens(a.output, revInfo, poison);
  const fullB = normalizeTokens(b.output, revInfo, poison);
  const fullC = normalizeTokens(c.output, revInfo, poison);
  const behA = behaviorText(a.output, revInfo, poison);
  const behB2 = behaviorText(b2.output, revInfo, poison);
  const behC = behaviorText(c.output, revInfo, poison);

  const fieldsB = revisionFields(b.output);
  const fieldsB2 = revisionFields(b2.output);
  const commitsA = committedFields(a.output);
  const commitsB = committedFields(b.output);
  const commitsB2 = committedFields(b2.output);
  const measuredB = measuredField(b.output);
  const measuredB2 = measuredField(b2.output);

  const equalAB = a.exit === b.exit && fullA === fullB;
  const revFieldsB = fieldsB.every((field) => field.value === revInfo.commit);
  const revFieldsB2 = fieldsB2.every((field) => field.value === revInfo.commit);
  const committedA = commitsA.every((field) => field.value === 'yes');
  const committedB = commitsB.every((field) => field.value === 'yes') && measuredB !== 'uncommitted';
  const committedB2 = commitsB2.every((field) => field.value === 'no')
    && (measuredB2 === null || measuredB2 === 'uncommitted');
  const behaviorB2 = behB2 === behA;
  const behaviorC = behC !== behA;
  const labelOnly = !behaviorC && fullA !== fullC && a.exit === c.exit;
  const requireA = entry.requireA ? Boolean(entry.requireA(a)) : true;
  const residueOk = residue.residue === 0;

  const reasons = [];
  if (!equalAB) reasons.push('ab_exit_or_output_differs');
  if (!revFieldsB) reasons.push('revision_field_not_lane_tip_b');
  if (!revFieldsB2) reasons.push('revision_field_not_lane_tip_b2');
  if (!committedA) reasons.push('committed_not_yes_a');
  if (!committedB) reasons.push('committed_not_yes_b');
  if (!committedB2) reasons.push('committed_not_no_b2');
  if (!behaviorB2) reasons.push('b2_behavior_differs_from_a');
  if (!behaviorC) reasons.push(labelOnly ? 'arm_c_label_only' : 'arm_c_not_sensitive');
  if (!requireA) reasons.push('arm_a_full_read_path_missing');
  if (!residueOk) reasons.push('gate_static_head_residue');

  const cDiff = verdictClass(c.output) !== verdictClass(a.output)
    ? 'finding'
    : (behC !== behA ? 'detail' : (fullA !== fullC && a.exit === c.exit ? 'label' : (a.exit !== c.exit ? 'exit' : 'none')));

  return {
    id: entry.id,
    kind: behaviorC ? 'behavior' : 'label',
    argv: [entry.outOfTree ? '<out-of-tree user gate>' : entry.script, ...entry.argv(repoPlaceholder)],
    source: entry.source,
    pass: equalAB && revFieldsB && revFieldsB2 && committedA && committedB && committedB2
      && behaviorB2 && behaviorC && requireA && residueOk,
    exit: { a: a.exit, b: b.exit, b2: b2.exit, c: c.exit },
    runtimeMs: { a: a.elapsedMs, b: b.elapsedMs, b2: b2.elapsedMs, c: c.elapsedMs },
    revisionFieldsB: fieldsB.map((field) => `${field.field}=${field.value}`),
    revisionFieldsB2: fieldsB2.map((field) => `${field.field}=${field.value}`),
    committed: {
      a: commitsA.map((field) => `${field.field}=${field.value}`),
      b: commitsB.map((field) => `${field.field}=${field.value}`),
      b2: commitsB2.map((field) => `${field.field}=${field.value}`),
      measuredB,
      measuredB2,
    },
    cDiff,
    checks: {
      equal_ab: equalAB,
      rev_fields_b: revFieldsB,
      rev_fields_b2: revFieldsB2,
      committed_a: committedA,
      committed_b: committedB,
      committed_b2: committedB2,
      b2_behavior_equal: behaviorB2,
      c_behavior_differs: behaviorC,
      c_label_only: labelOnly,
      require_a_full_read: requireA,
      residue_zero: residueOk,
    },
    residue,
    normalizedSha256: { a: digest(fullA), b: digest(fullB), c: digest(fullC), behavior_a: digest(behA), behavior_b2: digest(behB2), behavior_c: digest(behC) },
    firstLine: { a: firstLine(a), b: firstLine(b), b2: firstLine(b2), c: firstLine(c) },
    reasons,
  };
}

const repoPlaceholder = '<repo>';

function main() {
  const options = parseArguments(process.argv.slice(2));
  const started = process.hrtime.bigint();
  const parent = mkdtempSync('/tmp/tabi-r17-c1-');
  const repo = join(parent, 'repo');
  const home = join(parent, 'home');
  let result = null;
  try {
    mkdirSync(home);
    const env = makeEnv(home);
    const clone = runGit(parent, ['clone', '--no-hardlinks', '-q', options.lane, repo], env);
    if (clone.status !== 0) {
      throw new CouldNotEvaluate('clone_failed', (clone.stderr || '').trim().slice(0, 400));
    }
    const resolved = runGit(repo, ['rev-parse', '--verify', '--end-of-options', `${options.rev}^{commit}`], env);
    if (resolved.status !== 0) {
      throw new CouldNotEvaluate('revision_unresolved', `${options.rev} is not in the clone of ${options.lane}`);
    }
    const rev = resolved.stdout.trim();
    checkoutDetached(repo, env, rev);
    setAttached(repo, env, rev);

    const { byFile: inventory, source: sitesSource } = loadSiteInventory(repo, rev, env);
    const gateFiles = [...new Set(ENTRIES.map((entry) => entry.gate))];
    const residue = {};
    for (const gate of gateFiles) residue[gate] = residueFor(repo, rev, gate, inventory, env);

    // One out-of-tree copy of the user gate for the fixture entry, taken from the
    // evaluated revision so later worktree checkouts cannot change its bytes.
    const outOfTreeScript = join(parent, 'user-gate-fixture.mjs');
    writeFileSync(outOfTreeScript, readFileSync(join(repo, 'scripts/check-user-round-contract.mjs')));
    const revInfo = { commit: rev, sandbox: repo, outOfTreeScript };

    const entries = [];
    for (const entry of ENTRIES) {
      const built = buildPoison(repo, rev, env, entry.poison);
      console.error(`[c1] ${entry.id}: poison ${built.poison} (${built.changes.join(', ')})`);
      checkoutDetached(repo, env, rev);
      setAttached(repo, env, rev);
      const a = runEntry(repo, env, entry, revInfo);
      gitOk(repo, ['update-ref', '--no-deref', 'HEAD', built.poison], env);
      const b = runEntry(repo, env, entry, revInfo);
      checkoutDetached(repo, env, built.poison);
      const b2 = runEntry(repo, env, entry, revInfo);
      checkoutDetached(repo, env, rev);
      setAttached(repo, env, built.poison);
      const c = runEntry(repo, env, entry, revInfo);
      checkoutDetached(repo, env, rev);
      setAttached(repo, env, rev);
      const evaluated = evaluate(entry, { a, b, b2, c }, revInfo, built.poison, residue[entry.gate]);
      evaluated.poison = built.poison;
      evaluated.poisonChanges = built.changes;
      entries.push(evaluated);
      console.error(`[c1] ${entry.id}: pass=${evaluated.pass} kind=${evaluated.kind} cDiff=${evaluated.cDiff} exits=${a.exit}/${b.exit}/${b2.exit}/${c.exit} reasons=${evaluated.reasons.join('+') || '-'}`);
    }
    const behavior = entries.filter((entry) => entry.pass && entry.kind === 'behavior');
    const labelOnly = entries.filter((entry) => !entry.pass && entry.checks.c_label_only && entry.reasons.every((reason) => reason === 'arm_c_label_only'));
    result = {
      schema: 'tabi-c1-anchor-count-v2',
      rev,
      lane: options.lane,
      entries,
      residue,
      sitesSource,
      c1_anchor_safe: behavior.length,
      label_only: labelOnly.map((entry) => entry.id),
      entriesCount: entries.length,
      dropped: [],
      runtimeMs: Number((process.hrtime.bigint() - started) / 1000000n),
    };
  } finally {
    if (!options.keep) rmSync(parent, { recursive: true, force: true });
    else console.error(`[c1] kept sandbox ${parent}`);
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  const reason = error instanceof CouldNotEvaluate ? error.reason : 'unexpected';
  const detail = String(error instanceof CouldNotEvaluate ? error.message : (error && error.stack) || error).slice(0, 600);
  process.stdout.write(`${JSON.stringify({
    schema: 'tabi-c1-anchor-count-v2',
    c1_anchor_safe: null,
    entries: [],
    error: { reason, detail },
  })}\n`);
  process.exitCode = 2;
}
