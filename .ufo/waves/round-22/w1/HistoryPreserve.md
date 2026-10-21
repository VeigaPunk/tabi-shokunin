# HistoryPreserve — round 22 W1 lesson-history boundary

Read-only scout. Scope: the lessonDrift-only previous command, the inherited USER
debt, and the safe history proof for round 22 that does **not** rerun the known
failed production gate and does **not** rewrite any historical lesson.

## Axes in play

- **calibration** — the inherited red USER production state must stay disclosed; a
  predicate-only enumeration is never a clean-gate result.
- **operability / no-harm** — the proof must be runnable at the delivered tip with
  committed inputs only, and must fail closed on any lesson drift.
- depth (C1 0→12 semantic rows) is not this seat's question; nothing here scores it.

## Observed facts (read-only git/file inspection; no producer executed)

### Lane and baseline identity

- `git rev-parse HEAD` = `git rev-parse origin/master` = `git rev-parse refs/heads/master^{commit}`
  = `5f585773258b33d2d514b00cd0b0775333578db6` (the round-22 baseline).
- HEAD is **detached** (`git symbolic-ref -q --no-recurse HEAD` exits 1, no output).
  The frozen gate's `laneTip()` resolves `refs/heads/master` in that case
  (`scripts/check-user-round-contract.mjs:160-206`), so the gate's "tip" is
  `refs/heads/master`, **not** `HEAD`. The round-20 helper instead evaluates the
  revision argument (`lesson-history.mjs:12-17`). Equivalence of the two requires
  the argument to equal the lane branch tip (see proof P1).
- Worktree at inspection: ` M LOG.md`, ` M SCORECARD.md`, `?? .ufo/waves/round-22/`.
  **No `corpus/lessons/` path is modified or untracked.**

### The lessonDrift-only previous command

`.ufo/waves/round-20/lesson-history.mjs` is committed and unchanged:

- git blob `7687b21f07a467aa540354e9c5b676ad9b5da92e`
- sha256 `a8dade2deed3eab7d54c26576c2d604852b35757a076578c0c08b535eeb9bdc7`
  (equal to `producerSha256` in both retained receipts,
  `.ufo/waves/round-20/final/lesson-history.json` and
  `.ufo/waves/round-21/final/lesson-history.json`)
- CLI: `node .ufo/waves/round-20/lesson-history.mjs <40-hex-rev>`; non-40-hex exits 2
  (`:5`). Exit **0** for an enumerated result (even with non-empty `refused`),
  **2** for could-not-evaluate (`:20`); it never exits 1.
- Algorithm (`:11-17`) mirrors the frozen `lessonDrift` predicate:
  hardcoded baseline `7f506af…` and pin `92d700d…` equal the gate constants
  (`check-user-round-contract.mjs:12-13`); `git diff --name-status --no-renames
  pin..revision -- corpus/lessons/`; filter `^corpus/lessons/round-\d+\.md$`
  (gate `LEGACY_LESSON`, `:60`); per path `historical = blob(baseline, path)`,
  later `MDRT` commits over `pin..revision`, and
  `refused = historical ? current !== historical : status !== 'A' || !current || later.length > 0`
  — the same rule as `check-user-round-contract.mjs:333-342`.
- The frozen predicate source is byte-identical at `4ae9981` and `5f58577`
  (blob `9ebe31193325eb690e968ff09ef324400ae51fdb`,
  sha256 `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`,
  empty `git diff 4ae9981..HEAD -- scripts/check-user-round-contract.mjs`).
  `scripts/check-user-round-contract.mjs` does not exist at pin `92d700d`, which is
  irrelevant to `lessonDrift` (it uses only `blob`/`log` for lessons).
- Declared scope is `lessonDrift only, not complete USER gate` (`:19` and the
  `SKILL.md:2246` registry row).

Divergences from the gate that the proof must compensate for:

1. **Tip source.** Gate uses `laneTip(root)`; helper uses the argument. A helper run
   at an arbitrary revision is not the production result.
2. **Ancestry.** Gate requires baseline and pin to be ancestors of the tip
   (`check-user-round-contract.mjs:394,410`). The helper does not check ancestry
   (`git diff`/`git log` still compute across unrelated revisions).
3. **Other PSTACK paths.** Gate `pstackDrift` also covers
   `corpus/evidence/pstack-20261015*`, `corpus/lessons/pstack-20261015-rNN.md`,
   `reports/pstack-20261015-rNN.md`, `scripts/pstack-seat.mjs`,
   `scripts/pstack-aggregate.mjs`, `scripts/check-freshness.mjs`, `SHONEN.md`,
   accepted `scripts/check-round-contract.mjs` identities and `protectedPath`
   (`:344-360`). The helper proves none of these.
4. **Rest of `checkHistory`.** Protected bytes and `APPEND_ONLY` prefixes
   (`LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`,
   `corpus/README.md`, `:391-419`) are outside the helper.
5. **Environment.** Helper constructs a scrubbed `git` env without
   `cwd`/`GIT_CEILING_DIRECTORIES` (`:6-7`); it relies on being launched at the lane
   root. Gate pins `cwd=root` and a ceiling (`:123-145`).

### Inherited lessonDrift result and history

Retained receipt `.ufo/waves/round-21/final/lesson-history.json` (argv
`node .ufo/waves/round-20/lesson-history.mjs ab73abefbaddff258af162f15364bb014ffe02f4`,
exit 0, producer sha `a8dade2d…`) reports:

- `refused` exactly `["corpus/lessons/round-18.md","corpus/lessons/round-19.md"]`
- 10 records (round-12 … round-21)
- `round-18.md`: `laterMDRTCommits` `[01531daf3fa784410db454e4d606488e467a039a, c0aff2364b49b21c41669f050e03800138589fa7]`, refused true
- `round-19.md`: `laterMDRTCommits` `[3a933829a5167f9eb7061ab88354722e43b3a5a3, bf466e317bc4dd08192b1dd390b253b4bb0bee8d, d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47]`, refused true
- `round-20.md` (`01f8be3a…`), `round-21.md` (`847edc03…`): status `A`, historical null, later `MDRT` empty, refused false.

Between `ab73abe` and the round-22 baseline `5f58577` **no lesson path changed**
(`git log -- corpus/lessons/` last commit is `ab73abe`; per-path `MDRT` for
round-20/21 over `92d700d..HEAD` is empty). The expected values at `5f58577` are
therefore the same as the retained receipt except the `revision` field — but the
round-22 proof still needs its **own** receipt at the final revision; the round-21
receipt must not be re-labelled.

One enumeration subtlety: `git log -m --diff-filter=MDRT 92d700d..HEAD --
corpus/lessons/` also lists `5cdc97654b71c81da9e324f619a335a1594d1e02` (round-1:
post-review fixes) for `corpus/lessons/round-1.md`, but `git diff --name-status
92d700d..HEAD -- corpus/lessons/` has **no** net entry for `round-1.md` (same blob
`19bafbb9…` at pin and tip). Both the helper and the gate enumerate from the diff
(`check-user-round-contract.mjs:411`), so neither evaluates round-1, and the round-1
log hit is not refusal growth. Verifier-spotcheck, `training-round-11.md`,
`kaika-fleet-round-1.md` and `user-20261015-rNN.md` are outside `LEGACY_LESSON` and
are likewise not enumerated.

### Inherited USER debt (unchanged this round)

- **`round_count` 6/10.** Six `corpus/lessons/user-20261015-r01..r06.md` exist
  against the gate's fixed `expect 10` (`check-user-round-contract.mjs:692`). The
  last retained *executed* production observation is round 14's receipt:
  `USER … exit1 (not history_rewritten)` recorded at `LOG.md:818-824`; later
  `LOG.md:1031` repeats `USER failed round_count 6/10 (unchanged)`.
- **lessonDrift refusal at 2.** `corpus/lessons/round-18.md` and
  `corpus/lessons/round-19.md` carry later `MDRT` commits after the pin. The L0
  ruling (`.ufo/waves/round-19/final/l0-ruling.txt:1-5`) says this inherited
  refusal growth 1→2 is to be **documented, not fixed**, lesson files are
  append-only, and the refusal stays at 2.
- Because `check()` calls `checkHistory` (`:690`) before `round_count` (`:692`), a
  fresh production run at `5f58577` would surface `history_rewritten`
  (`Pstack bytes changed: …`) before any round_count result.
  **[INFERENCE — not executed; no fresh production run is authorized.]**
  The point is decisive either way: a production run cannot certify the refusal
  set (it prints one path) and is the known-red run. It must not be used as the
  round-22 history proof.

## Safe history proof for round 22 (specification for L1; nothing below was run here)

Goal: prove (a) the lessonDrift refusal set at the delivered revision is exactly
the inherited `{round-18.md, round-19.md}`, (b) no historical lesson byte changed,
and (c) the enumeration was produced by the frozen predicate — **without** running
`node scripts/check-user-round-contract.mjs` and without reusing the round-21
receipt as a new result.

### Preconditions (all read-only; all must pass before execution)

- **P0 location.** Run in `/home/vgpnk/Projects/shokunin/tabi-shokunin` (helper has
  no `cwd` and discovers the repo from the process cwd). Use an explicit Node path.
- **P1 revision.** Let `R = git rev-parse --verify refs/heads/master^{commit}`
  (the gate's `laneTip`, not necessarily `HEAD`). For delivery, also assert
  `git rev-parse HEAD` and `git rev-parse origin/master` equal `R`. The helper must
  be invoked with that exact 40-hex `R`.
- **P2 ancestry.** `git merge-base --is-ancestor 7f506affa55f6fb892d3c8073c75151c998bdf2c R`
  and `git merge-base --is-ancestor 92d700d6a8aa9855f1e9d2cc8e12c82f762a1367 R`
  both exit 0 (observed today: both true for `5f58577`; the helper itself does not
  check this).
- **P3 producer/predicate identity.** At `R`:
  - `git rev-parse R:.ufo/waves/round-20/lesson-history.mjs` =
    `7687b21f07a467aa540354e9c5b676ad9b5da92e` and
    `sha256sum` of its blob = `a8dade2deed3eab7d54c26576c2d604852b35757a076578c0c08b535eeb9bdc7`;
  - `git rev-parse R:scripts/check-user-round-contract.mjs` =
    `9ebe31193325eb690e968ff09ef324400ae51fdb` and sha256 =
    `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`.
  Any mismatch voids the proof (could-not-evaluate, not clean).
- **P4 no-rewrite diff.** `git diff --name-status --no-renames
  5f585773258b33d2d514b00cd0b0775333578db6..R -- corpus/lessons/` must be **empty**,
  or exactly `A	corpus/lessons/round-22.md` if that lesson is written. Any `M`, `D`,
  `R` or `T` on an existing path fails.
- **P5 conditional round-22 lesson.** If `corpus/lessons/round-22.md` is written it
  must be one initial addition committed once; `git log --no-show-signature -m
  --no-renames --diff-filter=MDRT 92d700d..R -- corpus/lessons/round-22.md` must be
  empty. Do not edit or amend it after its commit: a later `MDRT` event makes the
  same frozen predicate refuse `round-22.md`.

### Execution

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node .ufo/waves/round-20/lesson-history.mjs <R-pinned-40-hex>
```

Capture `{revision, producerPath, producerSha256, argv, cwd, exit, stdout, stderr}`
in a round-22 receipt, e.g. `.ufo/waves/round-22/final/lesson-history.json`
(round-20/21 convention). The round-21 receipt is the shape to copy; it already
adds `revision` and `producerPath` over round-20's. `refused` is data; the exit
status stays 0.

### Pass conditions — exact expected output at a no-lesson-change `R`

- `schema` = `tabi-round20-lesson-history-v1`; `baseline` =
  `7f506affa55f6fb892d3c8073c75151c998bdf2c`; `pin` =
  `92d700d6a8aa9855f1e9d2cc8e12c82f762a1367`; `scope` =
  `lessonDrift only, not complete USER gate`; `revision` = `R`.
- `refused` exactly `["corpus/lessons/round-18.md","corpus/lessons/round-19.md"]`.
- `records` length `10`, with `current` blobs exactly (observed at `5f58577`):

  | path | blob at `5f58577` | laterMDRT | refused |
  |---|---|---|---|
  | corpus/lessons/round-12.md | `f73a3acd0e04c20fd287756dca822b3f6875ee99` | [] | false |
  | corpus/lessons/round-13.md | `da37decb9ad6bd9b6e1e43ad08c29c4e5a6b469c` | [] | false |
  | corpus/lessons/round-14.md | `51ce99e5100493b1bcf018652a074a2a376bdd83` | [] | false |
  | corpus/lessons/round-15.md | `e833005d992be85713c5b0a03d58ba5aab759715` | [] | false |
  | corpus/lessons/round-16.md | `d6af28b70490ca1602933af6135fd6a3ee187f8c` | [] | false |
  | corpus/lessons/round-17.md | `419f699525e9e52a92b3b7e6e24c7b792e688076` | [] | false |
  | corpus/lessons/round-18.md | `24e055e29160a6eb229133fbbc79fff06cfe358e` | `01531daf…`, `c0aff236…` | true |
  | corpus/lessons/round-19.md | `23d2161b0fe9dcdcf7ad50998c63625983db0b0d` | `3a933829…`, `bf466e31…`, `d5cf4d72…` | true |
  | corpus/lessons/round-20.md | `01f8be3a807a57dcd59b3d6ca72bd294d6b45eed` | [] | false |
  | corpus/lessons/round-21.md | `847edc036bb47c0dc5a619cf19bc2c1ade851787` | [] | false |

- If `round-22.md` exists: an 11th record, `status` `A`, `historical` null,
  `laterMDRTCommits` `[]`, `refused` false.
- Independent no-rewrite corroboration (recommended, same revision): compare every
  `corpus/lessons/` path present at `5f58577` between `5f58577` and `R` with
  `git diff --name-status`; empty (or only the round-22 `A`). This is the direct
  byte proof and does not depend on the helper's predicate.
- Exit coding: helper exit 2 → proof **could-not-evaluate** (record stderr); any
  output deviation → **failed**. Never report either as clean.

### What this proof does NOT establish (must be stated alongside it)

- Not a clean USER gate: `round_count` 6/10 and every non-lesson `pstackDrift`
  path remain inherited debt; the helper's own `scope` string says so.
- Not a review-authenticity claim, not wave completeness, not W1 wake history or W2
  chronology (separate seats).
- No claim about what a fresh production run would print; it is not run.
- The helper evaluates the supplied revision, so the proof is only gate-equivalent
  when `R` equals `refs/heads/master` (P1).

## Falsifiers

- Any `M/D/R/T` net event on an existing `corpus/lessons/` path between `5f58577`
  and `R` (including a restored-bytes edit: the gate's diff is net, the helper's
  log is historical — both checks are in P4/P5).
- Any later `MDRT` commit for `round-20.md`, `round-21.md`, or an added
  `round-22.md` → `refused` grows; proof fails.
- Helper or frozen-gate blob/sha differs from P3 → predicate no longer proven.
- `R` ≠ `refs/heads/master` while the receipt is presented as the lane-tip result.
- Presenting the round-21 `ab73abe` receipt, or a production-gate run, as the
  round-22 delivered-tip proof.
- Treating non-empty `refused` as a nonzero exit, or exit 0 as "clean USER gate".

## Remaining unknowns

- No receipt exists at `5f58577` itself; the round-22 receipt must be produced at
  the final `R` (expected values above are derived from unchanged lesson history
  and the unchanged producer, not from a new run).
- The exact first finding of a fresh production run at `5f58577` is unobserved;
  the `checkHistory`-before-`round_count` ordering above is code-derived inference.
- No `lsp` device is mounted in this session. All source statements cite direct
  file reads at the quoted lines (helper `:1-20`, gate `:12-13,:60,:160-206,:333-360,:391-419,:690-692`);
  no grep output is presented as semantic reference proof.
- Historical W1 wake-history and W2 chronology corrections are outside this
  report; this seat establishes only that their correction must not touch
  `corpus/lessons/` or the frozen gate bytes.

## Installs / updates

None. No packages, binaries, services or network access were used.

Report: .ufo/waves/round-22/w1/HistoryPreserve.md
