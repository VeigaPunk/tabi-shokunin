VERDICT: ISSUES

Reviewer: TabiR17.RevBindAtDefault-2. Scope: `scripts/check-measurement-binding.mjs` `--at`
default flow + `scripts/selftest-measurement-binding.mjs`, and the committed r16 binding
receipts. The lane-tip change itself holds (receipts unaffected, A≡B anchor verified); the
findings are in the selftest's assertion strength and in one C1-counter entry that the new
default makes arm-C insensitive.

## Reviewed bytes (pinned; worktree was being edited concurrently)

- Baseline = `master:scripts/check-measurement-binding.mjs`, blob `6e5d2b3…`, sha256 `1f84fb54…` (gate had `options.at ?? 'HEAD'`).
- Reviewed gate: worktree sha256 `15af0111…`, +45/−2 (`git diff --numstat` = `45 2`).
- Reviewed selftest: worktree sha256 `2ccce42f…`, +47/−0; it changed under me during the
  review (`5d9f1ec5…` 64 cases → `2ccce42f…` 68 cases). All findings are pinned to
  `2ccce42f`; any later edit needs re-review.
- Lane VCS state at review: `git rev-parse HEAD` = `5859243…` = `refs/heads/master`;
  `git symbolic-ref -q HEAD` → exit 1 (detached). HEAD and lane tip agree today, so the
  default is a no-op on the lane right now.

## How the default flows (baseline → lane tip)

- Baseline: `atRev = resolveCommit(repo, options.at ?? 'HEAD', '--at')` (was :833).
- Now: `atRev = options.at === null ? laneTip(repo) : resolveCommit(repo, options.at, '--at')` (:876).
  `laneTip` (:249-282): `symbolic-ref -q HEAD` (:255); detached (status 1) → literal
  `refs/heads/master` (:262); `/^refs\/heads\/[^\0-\x20\x7f]+$/` guard; then
  `rev-parse --verify --end-of-options '<ref>^{commit}'`; failure → `revision_unresolved`
  naming the anchor; result re-checked as 40-hex.
- `atRev` threads through every read: ancestry :510, counter blob at `at` :526,
  `diff measured..at` :546, worktree-counter-vs-`at` blob :562/:573, after-arm :579;
  legacy `atTarget` in `evaluateLegacy` :640; printed as `at` (40-hex) in `--json` :700.
- Ordering preserved: manifest identity first (:861-872), then `resolveRepo` (:874), then the
  anchor (:876). `--reasons` (:836) and `--self-test` (:846) return before any anchor work,
  and `parseArguments` still rejects `--at` with `--self-test` (:805-808), so no fixture,
  `--self-test` case, or `--reasons` caller can reach `laneTip`.
- The default was the only former HEAD read: `grep -n HEAD` over the gate now shows only
  `laneTip`'s `symbolic-ref` (:255) and `refs/heads/master` (:262); no `show`/`log`/
  `merge-base` callsite used `'HEAD'`.

## Existing receipts: none relied on the HEAD default

Committed argv inventory (all tracked JSON arrays containing the gate; `git grep` over
`corpus/evidence` non-JSON returns none):

| file | argv | default consulted |
|---|---|---|
| `corpus/evidence/round-16/binding/check.json` | `--check … --at 6c8e0ff… --reproduce` | no (explicit `--at`) |
| `corpus/evidence/round-16/binding/legacy-r15.json` | `--legacy … --at 36240c7…` | no (explicit `--at`) |
| `corpus/evidence/round-16/binding/selftest.json` | `--self-test` | no at-flow at all |
| `corpus/evidence/round-16/binding/r15-counter-identity.json` | git commands only | no gate run |

Re-ran both pinned argvs against the new gate:
- check.json → `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`, exit 0, stderr empty;
  stored `.stdout` (51 bytes) equals fresh stdout byte-for-byte (`stored==fresh: True`).
- legacy-r15.json → exit 1, stdout 1017 bytes, `cmp` identical to stored `.run.stdout`
  (the receipt's trailing `…` is `cleanDetail`'s 240-char cut at :173-176, not a capture cut).
- The r17 routed receipts (untracked, `corpus/evidence/round-17/routed/binding-hardened/*`)
  pin `--at 36240c7…`, `--at 1205d26…`, `--self-test`; none uses the default.
- `selftest.json` is stale history already routed by defect 2: `gateSha256` `5150611c…`
  (≠ `15af0111…`) and `cases=43` (current 68); it is not a witness to this change.

Conclusion: the lane-tip default changes nothing for any committed receipt; only unpinned
prose commands change, and only when the tip differs from HEAD.

## Findings

### F1 (S2, for C1Counter/L1): the C1 counter's r16-manifest entry loses arm-C sensitivity exactly this round
`.ufo/waves/round-17/measure-c1.mjs:104-107` runs
`--check corpus/evidence/round-16/measurement-binding.json` with no `--at`; the r16 manifest
declares both gate scripts as counted inputs (both claims measured at `3254740`). Once this
round's gate/selftest bytes land the entry is red at the tip by design, and the counter's
poison adds no new path, so arm C cannot differ:
- Poison (`measure-c1.mjs:112-119`) deletes two `corpus/lessons/*` files (not counted inputs)
  and appends to `scripts/check-round-contract.mjs` (not a counted input) and
  `scripts/check-measurement-binding.mjs` (already in arm A's changed set); the selftest is
  not poisoned.
- Sandbox (lane clone + the two r17 scripts committed; counter's exact poisoning via
  `read-tree`/`update-index`/`write-tree`/`commit-tree`):
  A `verdict=failed claims=2 bound=1 / finding claim=C1 reason=counted_input_changed detail=paths=scripts/check-measurement-binding.mjs,scripts/selftest-measurement-binding.mjs`;
  B (HEAD detached at P, master=REV) identical (`cmp` clean) → `equal_ab` true;
  C (master=P, HEAD attached) identical (`cmp` clean) → `differsAC` false.
  `evaluate()` (`measure-c1.mjs:306-330`) therefore reports `arm_c_not_sensitive`, and
  `c1_anchor_safe` loses an entry at the r17 REV — the round that fixes anchoring.
- Fix verified: poison a counted input unchanged between measuredRevision and REV. Appending
  one space to `corpus/evidence/round-15/measurements.json` and running the gate at that
  poison gives `detail=paths=corpus/evidence/round-15/measurements.json,scripts/check-measurement-binding.mjs,scripts/selftest-measurement-binding.mjs`
  (a path arm A lacks). Alternative: target the r17 manifest (`measuredRevision` == REV), or
  drop the entry with the reason the plan permits.
- This entry legitimately exits 1 at the r17 tip (the gate is its own counted input);
  `equal_ab` holds (A==B verified), so only the C arm is affected.

### F2 (S3, selftest): the new positive case does not assert that the gate read the branch tip
`positive('lane_tip_detached_off_branch')` (:460) passes no `assert` and no extra args;
`runGate` (:476-486) never passes `--json`, so only exit status and reason set are asserted.
Any *clean* anchor passes the shape: `--at <measuredRevision>` on the same shape exits 0
(`clean claims=1 bound=1`, at=`5681a1b…`), so a gate anchored at `measuredRevision` would
still pass. PLAN §C1 says the case "asserts the gate reads the branch tip". Fix:
`extraArgs: ['--json']` plus an assert that parsed `at === built.tip && built.tip !==
built.offBranch`.

### F3 (S3, selftest): `lane_tip_detached_explicit_at_control` is not same-shape
The negative (:464-469) is detached + `--at <offBranch>`; its control is `cleanShape()`
(attached, no `--at`) — two differences, so the pair does not isolate `--at`, contrary to the
file's stated convention (:6-8) and every r16 pair. The detached-clean property is covered by
the positive case; either use `detachedOffBranch()` as the control (duplicating the positive)
or comment the asymmetry.

### F4 (S3, intended but observable): detached HEAD without `refs/heads/master` now refuses
A repo whose branch is `main` and whose HEAD is detached exits 2 with
`lane tip anchor refs/heads/master does not resolve to a commit`, where baseline read HEAD.
Observed on a `main`-only detached fixture; asserted by `lane_tip_detached_no_master`
(:471-472). This is PLAN §C1's fallback, documented in the header (:24-31) and `--help`
(:750); explicit `--at HEAD` still works (probe: exit 0), and the lane's branch is `master`,
so there is no lane impact. Listed so foreign-repo use is not a surprise.

### F5 (S3, L1 doc): QUALITY 22's prescribed command still HEAD-anchors
`corpus/QUALITY.md:79-80` says re-run at "the delivered HEAD" with
`--check <manifest> --at <delivered HEAD> --reproduce`; under jj that can name an unlanded
commit, and the new default fixes only the omitted-`--at` case. Recommend an L1 append
defining delivered revision = lane tip (`refs/heads/master`, or the attached branch).
`SKILL.md:1840` stays accurate (`[--at REV]` optional) but does not state the new default.

## Positive verification (exercised)

- `node scripts/selftest-measurement-binding.mjs` → `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=68 reasons=13`.
- Required baseline sensitivity, proven: `node scripts/selftest-measurement-binding.mjs --gate
  <master blob>` → `verdict=failed cases=68`, exactly two failures,
  `lane_tip_detached_off_branch` and `lane_tip_detached_no_master`, both with the HEAD-read
  signature `reason=counted_input_changed detail=paths=counted/input.txt`.
- Lane default run (detached, tip==HEAD): `--check corpus/evidence/round-16/measurement-binding.json`
  → `clean claims=2 bound=2`, exit 0; `--json` prints
  `"at":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583"`; `--at HEAD` gives the identical result.
- Dirty-worktree `--reproduce` under the new default fails closed:
  `finding claim=C2 reason=counter_failed … worktree bytes are absent, not regular, or differ
  from blob at at=a2f50b1…; refusing to execute` (baseline would have executed the working
  copy because HEAD == working-copy commit under jj).

## Residual risk / gaps

- The selftest changed while this review ran; F2/F3 are pinned to `2ccce42f…`.
- `measure-c1.mjs` was not run end-to-end (C1Counter's job); F1 follows from replicating its
  poison tree exactly and its `evaluate()` predicate, with gate stdout compared byte-for-byte.
- The r17 binding manifest does not exist yet, so the delivered-tip `--check` was not run.
- No tool installed or upgraded for this review.

Files written:
- .ufo/waves/round-17/w1/RevBindAtDefault.md
