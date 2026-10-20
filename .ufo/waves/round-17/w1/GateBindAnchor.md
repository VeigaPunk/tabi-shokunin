VERDICT: PASS

# GateBindAnchor — C1 lane-tip anchoring of the measurement-binding gate

## Change (PLAN.md §C1; L1 alignment; SentinelAnchor F3/F4/F5/F13; RevBindAtDefault S3)

- `scripts/check-measurement-binding.mjs`
  - `laneTip(root)` (`:267`): `git symbolic-ref -q --no-recurse HEAD`; attached iff
    status 0 and stdout matches `^refs/heads/[^\0-\x20\x7f~^:?*\[\\]+\n$` exactly (no
    `.trim()` acceptance); detached iff status 1 with empty stdout; anything else is
    could-not-evaluate. The anchor then must pass `git check-ref-format <ref>` (no `--`),
    `for-each-ref --format=%(refname)%00%(symref) -- <ref>` must show exactly one row with
    `refname === ref` and an empty symref, and `rev-parse --verify --end-of-options
    ${ref}^{commit}` resolves a 40-hex tip. Refuses symref anchors (F5/E3) and revision
    syntax `refs/heads/master@{1}` that passes the character filter but names an older
    hostile commit (F13).
  - `resolveRepo(dir)` (`:334`): `realpath` start; `rev-parse --show-toplevel` under
    `GIT_CEILING_DIRECTORIES=dirname(start)`; the returned toplevel must realpath-equal
    start, else exit 2 `git_failed` (F3/E1: the lane is nested inside the fleet repo, so a
    corrupt lane `.git` must never resolve the enclosing repository; a subdirectory
    `--repo` is refused, matching GateRoundAnchor's toplevel==realpath(repo) rule).
  - `git()` (`:207-219`): optional `extraEnv`, plus a process-wide `gitCeiling` set to
    `dirname(toplevel)` after `resolveRepo`, so no later call can discover above the
    certified root.
  - `main` (`:941`): `atRev = options.at === null ? laneTip(repo) : resolveCommit(repo,
    options.at, '--at')` — resolved once, threaded through every read and the `at=` field.
  - Header (`:24-31`), exit-class note (`:50-52`) and usage (`:750`) document the default.
    Explicit `--at REV` path unchanged.
- `scripts/selftest-measurement-binding.mjs` — 17 new cases (59→76):
  - `lane_tip_detached_off_branch`: positive with `--json`, asserting `at === built.tip`,
    `tip !== offBranch`, `verdict=clean` (RevBindAtDefault F2 — the printed 40-hex is the
    only proof the gate read the branch tip).
  - `lane_tip_detached_explicit_at` + control: both arms now use `detachedOffBranch()`; the
    negative adds exactly one variable (`--at <offBranch>`) (F3).
  - `lane_tip_detached_no_master` + control; `counted_input_added`/`_deleted` + controls;
    `repo_fallthrough_refused` + control (E1); `lane_tip_symref_anchor` + control (E3);
    `lane_tip_attached_non_heads` + control (HEAD → refs/tags/t); `lane_tip_reflog_anchor`
    + control (F13).

## Reasons vocabulary diff

None. `--reasons` output byte-identical baseline→new (`sha256 21de5ab0…`). New
could-not-evaluate paths reuse `revision_unresolved` (anchor name/symref/reflog syntax) and
`git_failed` (non-toplevel repo, skipped/blocked repository boundary), with the
anchor/boundary in the detail.

## Evidence (sandbox clone @5859243, attached master; files copied in; removed afterwards)

Baseline gate from LANE HEAD: `1f84fb54…`; baseline selftest `481eefae…`.

1. `--self-test`: before `verdict=clean cases=59 reasons=13`; after `verdict=clean
   cases=76 reasons=13`, exit 0 (also from the detached LANE).
2. Red against baseline gate bytes: `verdict=failed cases=76 reasons=13`, exit 1, exactly:
   `lane_tip_detached_off_branch` (expected 0, actual 1),
   `lane_tip_detached_explicit_at_control` (expected 0, actual 1 `counted_input_changed`;
   the control now shares the detached shape),
   `lane_tip_detached_no_master` (expected 2, actual 1),
   `repo_fallthrough_refused` (expected 2 `git_failed`, actual 2 `revision_unresolved`),
   `lane_tip_symref_anchor` (expected 2, actual 0),
   `lane_tip_attached_non_heads` (expected 2, actual 0). `lane_tip_reflog_anchor` passes
   baseline because baseline's `HEAD^{commit}` refuses the reflog spelling; it fails every
   pre-F13 hardened mutant, so it guards the F13 regression specifically.
3. Sentinel probes (`probe.mjs`, fixture repos, before → after):
   - E1: lane nested in a parent repo with `.git/HEAD` = `ref: HEAD`; discovery returned
     the parent toplevel and the gate exited 2 `revision_unresolved` on the lane's
     measuredRevision. After: exit 2 `git_failed` (`rev-parse --show-toplevel` fails under
     the ceiling) — no enclosing repo is named.
   - E3: detached HEAD, `refs/heads/master` = symref to `refs/remotes/o/evil` (hostile
     commit drifts `counted/input.txt`); gate exited 1 `counted_input_changed`. After:
     exit 2 `revision_unresolved`, `lane tip anchor refs/heads/master is a symbolic ref to
     refs/remotes/o/evil`.
   - F13: HEAD = `ref: refs/heads/master@{1}` (master reflog entry = hostile commit);
     pre-F13 gate (both new guards disabled) exited 1 `counted_input_changed`. After:
     exit 2 `revision_unresolved`, `lane tip anchor refs/heads/master@{1} is not a valid
     refname`.
4. Mutation kills (`--gate <mutant>` built from the final gate; each run
   `verdict=failed cases=76 reasons=13`):
   M02 detached-refuses → `lane_tip_detached_off_branch` (+ new control);
   M03 `refs/heads/main` fallback → off_branch/control/no_master/symref;
   M12 `--diff-filter=M` → added/deleted;
   symref guard disabled → `lane_tip_symref_anchor` (expected 2, actual 1);
   regex widened to any `refs/` → `lane_tip_attached_non_heads` (expected 2, actual 0);
   both F13 guards disabled → `lane_tip_reflog_anchor` (expected 2, actual 1
   `counted_input_changed`); ceiling plus toplevel identity both disabled →
   `repo_fallthrough_refused` (expected `git_failed`, actual `revision_unresolved`).
   (`check-ref-format` and the one-row rule are independent, as are ceiling and identity:
   the cases kill the union, not each guard in isolation.)
5. Byte identity on an attached checkout, baseline vs new: `diff` empty for `--check
   <manifest>` with no `--at`, with `--at 1205d26…` (both exit 0), and for `--reasons`.
   `--repo scripts` (subdirectory) now exits 2 `git_failed`, aligned with the sibling gates.
6. Assigned reproduction with the hardened gate: `MEASUREMENT_BINDING verdict=clean
   claims=2 bound=2`, exit 0 (`--check corpus/evidence/round-16/measurement-binding.json
   --at 1205d261776a349af99a5a205c7c2467fbabae16 --reproduce`).
7. Lane (detached) default run: `--json` prints `verdict=clean at=5859243183c4d7ac5429
   dfdb8a73ce0d9a43d583 claims=2 bound=2`, exit 0.

## sha256 before → after (LANE files)

- `scripts/check-measurement-binding.mjs`
  `1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6`
  → `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`
- `scripts/selftest-measurement-binding.mjs`
  `481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3`
  → `8324692c65ca630dd31283e9840ea191b8ee973a1132e40465b6978122e426b3`

## Risks / handoff notes

- `--repo` must name the repository toplevel; a subdirectory now refuses (exit 2), matching
  GateRoundAnchor. Detached HEAD with no `refs/heads/master` refuses (exit 2).
- F6 (attached off-lane branch in production mode) not implemented: PLAN §C1 fixes
  attached-HEAD semantics (own branch), and switching policy on `--repo` presence is out
  of contract; a jj lane is detached, so production resolves `refs/heads/master`.
- F1/F2 transport items were already held: `minimalEnv` is constructed from scratch (never
  spread from `process.env`; only absolute PATH entries, HOME) with replace/graft/fsmonitor
  guards.
- RevBindAtDefault F1 (C1Counter's r16-manifest entry losing arm-C sensitivity) and F5
  (QUALITY prose HEAD anchoring) are outside this seat's files.
- The r16 manifest lists this gate and its selftest as C1 counted inputs; after commit,
  checking the r16 manifest at the r17 tip reports `counted_input_changed` (expected
  r16→r17 drift; r17's manifest is L1-owned). At r16 revisions it stays clean (evidence 6).
- No tools installed. No jj/git writes in LANE; sandbox was a `git clone --no-hardlinks`
  and was removed.

Files written:
- scripts/check-measurement-binding.mjs (edited, owned)
- scripts/selftest-measurement-binding.mjs (edited, owned)
- .ufo/waves/round-17/w1/GateBindAnchor.md (this report)
