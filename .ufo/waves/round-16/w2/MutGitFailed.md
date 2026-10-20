# MutGitFailed — mutation probe for gate reason `git_failed`

- Seat: `TabiR16.MutGitFailed` (wave 2, FALSIFY / leaves only).
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; every mutation in `/tmp`).
- Target snapshot: `b444ca8e024f386124418169e8e400221524bba3`
  (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
- Date: 2026-10-20.

## Verdict

**HOLDS for the assigned mutation (global disable of the `git_failed` emission):**
the selftest goes red on exactly the `git_failed` case (exit 1) and the real C1
counter also counts `0`, with two independent failure checks.

**BREAKS for the wider reading "a weakening of the code that emits `git_failed`
is killed":** the gate emits `git_failed` from 9 live branches, but the selftest
exercises exactly one of them (`resolveRepo`). A mutant that weakens any of the
other 8 branches — demonstrated at `diffNames` — leaves both the selftest
(`verdict=clean`) and the C1 counter (`c1_binding_contracts: 1`) green.

## Method

Copies are byte-bound to the measured revision before mutation:

```
sha256 tmp copy gate  = 5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb
sha256 rev  gate (b444ca8:scripts/check-measurement-binding.mjs) = same
sha256 tmp copy selftest = 8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae
sha256 rev  selftest (b444ca8:scripts/selftest-measurement-binding.mjs) = same
```

The selftest documents `--gate <path>` (`usage: node scripts/selftest-measurement-binding.mjs [--gate <path>]`);
both the default (sibling file) and the explicit flag were exercised with the
same result.

### Baseline (unmutated)

```
$ node /tmp/tabi-mutgit-pcPYjJ/scripts/selftest-measurement-binding.mjs \
       --gate /tmp/tabi-mutgit-pcPYjJ/scripts/check-measurement-binding.mjs
exitBase=0
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
```

```
$ cd /tmp/tabi-mutgit-pcPYjJ/clone   # git clone --no-hardlinks of the lane
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
{"revision":"b444ca8…","c1_binding_contracts":1,
 "selftest":{"exit":0,"cases":43,"bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":[…3…],"C2":[…2…]}},"failures":[]}
```

So the delivered gate/selftest pair is green and the counter's C1 arm really
returns 1 at the snapshot before mutation.

## Mutants and results

### MutA — global disable: the gate can no longer emit `git_failed`

Only the reason value is touched (the one constant every `git_failed` emission
reads):

```diff
-  gitFailed: 'git_failed',
+  gitFailed: 'git_failed_suppressed',
```

```
$ node /tmp/tabi-mutgit-pcPYjJ/A/scripts/selftest-measurement-binding.mjs \
       --gate /tmp/tabi-mutgit-pcPYjJ/A/scripts/check-measurement-binding.mjs
exitA=1
case=git_failed expected_exit=2 actual_exit=2 expected_reasons=git_failed actual_reasons=git_failed_suppressed FAIL
FAIL_DETAIL case=git_failed MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0 | finding claim=- reason=git_failed_suppressed detail=git rev-parse --show-toplevel failed (status=128) stderr=fatal: not a git repository …
MEASUREMENT_BINDING_SELFTEST verdict=failed cases=43 reasons=13
```

Exactly one case fails; the other 42 (including all `_control` positives) pass,
so the kill is specific rather than a crash in the harness.

Real counter against a committed mutant (`rev=7d7311f109fa998ce9480bcb381854d80218db40`):

```json
{"c1_binding_contracts":0,
 "selftest":{"exit":1,"cases":43,"bad":1,"missingVocab":["git_failed"]},
 "failures":["selftest exit 1",
             "selftest summary absent, not clean, or case count mismatch",
             "1 case lines not exact PASS",
             "vocabulary not exercised: git_failed"]}
```

The counter kills it twice: the case line is not an exact PASS, and the
hard-coded `VOCAB` entry `git_failed` is not exercised by any PASS line.

### MutB — weaken the covered site (`resolveRepo` reclassified)

```diff
-    refuse(FAILURE_REASON.gitFailed, gitError(['rev-parse', '--show-toplevel'], result));
+    refuse(FAILURE_REASON.revisionUnresolved, gitError(['rev-parse', '--show-toplevel'], result));
```

```
exitB=1 (observed via selftest run: verdict=failed cases=43 reasons=13)
case=git_failed expected_exit=2 actual_exit=2 expected_reasons=git_failed actual_reasons=revision_unresolved FAIL
```

Counter at `rev=67285216db8310d4bae05ed681484ad80e956b75`: `"c1_binding_contracts":0`,
`bad:1`, `missingVocab:["git_failed"]`, same four failures as MutA. Exit class
stays 2 but the reason string is asserted exactly, so the mutant dies.

This also proves the fixture reaches `resolveRepo` and only `resolveRepo` (the
outer catch-all `unexpected:` mapper is never on the path).

### MutC — weaken an uncovered site (`diffNames` swallows failure) — SURVIVES

```diff
-  if (result.error || result.status !== 0) refuse(FAILURE_REASON.gitFailed, gitError(args, result));
+  if (result.error || result.status !== 0) return [];
```

```
$ node /tmp/tabi-mutgit-pcPYjJ/C/scripts/selftest-measurement-binding.mjs \
       --gate /tmp/tabi-mutgit-pcPYjJ/C/scripts/check-measurement-binding.mjs
exitC=0
MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13
```

Real counter against the committed mutant (`rev=1061794688618aca4edb0d51df319a17e9d62af0`):

```json
{"c1_binding_contracts":1,
 "selftest":{"exit":0,"cases":43,"bad":0,"clean":21,"missingVocab":[]},
 "legacy":{"exit":1,"findings":{"C1":[…],"C2":[…]},"failures":[]}}
```

The mutant is killed by nothing. The counter's only coverage of a reason is
`missingVocab`, which is satisfied because `git_failed` still appears through
the one covered fixture; it never inspects *which* branch produced it.

## Findings by severity

### F1 (medium-low, test-coverage gap) — 8 of 9 live `git_failed` branches are untested

`scripts/check-measurement-binding.mjs` emits `git_failed` at 10 textual sites;
`gitMust` (line 217) is **dead code, never called anywhere in the repo**, leaving
9 live branches:

| line | branch | exercised by selftest |
|---|---|---|
| 240 | `resolveRepo` (`rev-parse --show-toplevel`) | **yes** (`git_failed` case, `repoOverride` to a non-repo mkdtemp) |
| 262 | `treeEntry` spawn error | no |
| 268 | `treeEntry` malformed `ls-tree` row | no |
| 278 | `hasTreeEntries` (`ls-tree -r`) nonzero | no |
| 295 | `blobSha256` (`cat-file`) nonzero | no |
| 303 | `isAncestor` spawn error | no |
| 307 | `isAncestor` status ≥ 2 | no |
| 317 | `diffNames` (`diff --name-only`) nonzero | no (MutC proves this) |
| 857 | outer catch-all `unexpected:` → `git_failed` | no |

The single `negative('git_failed', …)` case
(`scripts/selftest-measurement-binding.mjs:304-309`) is the whole coverage of the
reason. Every other reason in the vocabulary gets a same-shape negative plus
control; `git_failed` gets one fixture aimed at one branch. Blast radius is
bounded because `evaluateClaim` runs `resolveCommit` → `isAncestor` →
`treeEntry`/`cat-file` → `hasTreeEntries` → `diffNames`, so a repo that cannot
serve trees fails earlier than `diffNames` (e.g. `hasTreeEntries` refuses at 278);
the demonstrated survivor is a lost defense-in-depth, not a live misreport
today. [INFERENCE: reachability ordering read from `evaluateClaim` at
`scripts/check-measurement-binding.mjs:451-508`; not a runtime observation.]

Minimal repair (for the owning seat, not applied here): one negative per
emission branch — a non-repo/missing-object fixture for `hasTreeEntries` and a
forced `diff` failure for `diffNames` — or a mutation assertion in the counter
that runs the selftest against a gate whose `diffNames` failure path returns `[]`
and requires it to go red.

### F2 (low, dead weight) — `gitMust` is unreachable

`function gitMust` (`:215-219`) is defined and never referenced (grep over
`scripts/` and `.ufo/waves/round-16/measure.mjs` finds only the definition). It
carries the first `git_failed` emission site and cannot be exercised by any test.
Delete it or route a caller through it.

### F3 (informational, outside this item's scope) — the documented manifest is absent at the snapshot

`git ls-tree b444ca8e… -- corpus/evidence/round-16/measurement-binding.json` → 0
entries; the file exists only as an untracked worktree file
(`git status --porcelain`: `?? corpus/evidence/round-16/measurement-binding.json`).
The gate's documented `--check` input therefore cannot be evaluated at the
measured revision. Not a `git_failed` defect; flagged for the manifest-binding
seat.

## Residual risk and verification gaps

- Mutation quality: three single-site mutants plus one global, all applied to
  copies; no multi-site silent-fallback mutant was run. Its outcome is
  predictable (the `resolveRepo` fixture kills it) but was not observed.
- The counter was exercised from a `git clone --no-hardlinks` of the lane in
  `/tmp`; its `ROOT` resolves inside the clone, so the legacy arm read the clone's
  `corpus/evidence/round-15/measurements.json` at `36240c70…` — the same commit
  the hard-coded `R15_DELIVERED` names, and the legacy arm passed in all runs.
- Reachability of the 8 uncovered branches is argued from call order, not
  demonstrated; no fixture was built that makes `diff` fail while every earlier
  git call succeeds.
- Lane was not modified: `git status --porcelain` shows only pre-existing
  `?? .ufo/waves/round-16/w2/` (this report) and
  `?? corpus/evidence/round-16/measurement-binding.json`; `git rev-parse HEAD`
  = `b444ca8e024f386124418169e8e400221524bba3`.

## Tooling record

No installs or upgrades were needed; everything ran with the host `node` and
`git`. Scratch dir `/tmp/tabi-mutgit-pcPYjJ` (mutant copies A/B/C, lane clone,
counter JSON) is disposable.
