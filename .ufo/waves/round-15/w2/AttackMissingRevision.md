# AttackMissingRevision: C1 missing-revision refusal cause and the wrong-after diagnostic control (round15 wave2, author-side critic)

Scope: this is a read-only source attack on the delivered build bytes. I ran no gate, self-test, `--diagnostic-witness`, `--count-witness`, measure probe, counter or browser. The only execution was a set of plain `git` exit-status probes in a throwaway `mktemp -d /tmp/mrprobe.*` repo, which I removed afterwards. I used them to fix the git semantics the source relies on. This is an author-side review, not non-author certification. Tools installed or updated: none.

## Attacked identity
- `.ufo/waves/round-15/build-snapshot.json`: revision `72dcf031b9da24796b718517ea575f21e4f7caae`, baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- `git rev-parse HEAD` = `72dcf031b9da24796b718517ea575f21e4f7caae`.
- `sha256sum scripts/check-user-round-contract.mjs` = `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`, the same as the snapshot. `measure.mjs` = `62e98fa8…02e7`, also the same.
- The USER gate changed in `c138bea` ("round-15: precise USER refusal diagnostics"). Diff against the baseline: +292/−33.
- Diagnostic baseline pin, checked by reading only:
  - `git rev-parse 5c7710d7…:scripts/check-user-round-contract.mjs` = `347ae9bbcdc692c3ad55fdfd931fa2cce13fec6d`.
  - The sha256 of `git show` is `bde18c67…05f3`. This equals `:853-854`.
  - It is an ancestor of HEAD (exit 0).

## Temporal limit
- `corpus/evidence/round-15/user-diagnostics.json` (the C1 receipt that `measure.mjs:27-33` requires) is **not committed at 72dcf03**. HEAD's round-15 evidence holds only `metadata/expected-fixtures.json` and `metadata/mirror-contract.json`.
- `corpus/lessons/round-15.md` is untracked, and its "Execution evidence" section (`:57-59`) is empty.
- No C1 success exists to attack. Everything below comes from reading the source. At this revision, C1 measures 0 by construction.

## Cross-checks with sibling reports (confirmations, not new claims)
- **AttackWrongReason WR-1 confirmed independently.** `git show 72dcf03:scripts/check-user-round-contract.mjs | grep -nF "const masked = spec.kind === 'grep' && result.status === 1;"` returns lines **429 and 859**, count 2. So `:953-955` always reaches could_not_evaluate, and the missing-revision mutant arm of `--diagnostic-witness` / `--self-test` cannot run.
- **AttackGrammarReason P11 ("`MASK_GUARD` appears once … Holds") is false** for these bytes for the same reason. L1 should not count P11 as a held proposition.
- `count_committed_*` prints `isolation=cli` with a literal `actual_exit=0` (`:1252`). AttackMeasureC1 F7 already reports this, so I do not repeat it here.

## MR-1 MEDIUM: grep-kind status handling, both missing revision and legitimate no-match, is pinned by no control. A wrong-cause mutant survives the whole self-test (once WR-1 is fixed)
- **Claim attacked:**
  - `:363-366` and `:426-428` say the evaluator "fails explicitly for a missing or malformed revision" and preserves only grep exit 1 as count 0.
  - The lesson (`corpus/lessons/round-15.md:9`) requires controls that "match exact expected refusal reasons".
- **Evidence:**
  - Every reason-asserting fixture uses the **tree** form (`git ls-tree … | grep …`). Missing revision is at `:1082-1088`; wrong-after, revision-mismatch, equal and before-mismatch are at `:1089-1107`.
  - Both diagnostic-witness arms are tree form too: `:974` and `:988`.
  - All six committed production rows exercised by `count_committed_*` are tree form. From `git show HEAD:SCORECARD.md`, r01 to r06 are all `git ls-tree -r --name-only … | grep … | wc -l`.
  - The only grep-form command anywhere in the self-test is the default fixture row (`:704`). It always resolves with status 0 (one match).
  - So no control drives `runCount` through grep with status 1 (no match, which should count 0) or status 128 (missing object, which should be `counting_command_failed`).
- **Git semantics (probe, git 2.55.0):**
  - `git --literal-pathspecs grep -h -e a <absent 40-hex> -- f` gives **128** (`fatal: unable to parse object`).
  - A grep with no match gives **1**.
  - `ls-tree` on an absent object or the null OID gives **128**.
- **Counterexample mutant M1** (one line, and it keeps the `MASK_GUARD` text intact so the witness split is unaffected): change `:430` to
  `if (result.error || (result.status !== 0 && !masked && spec.kind === 'tree')) fail(...)`.
  - Tree cases, including `count_missing_revision_red`, still give `counting_command_failed`.
  - The witness mutant (`masked = true`) still reports `after_count_mismatch` on the tree fixture.
  - Clean and supported cases are unaffected.
  - So every self-test line stays PASS, but a grep row whose `measured-against` is missing now counts `"0"`. Its refusal becomes `after_count_mismatch` (or `before_count_mismatch`) rather than `counting_command_failed`. That is exactly the "right finding, wrong cause" class C1 claims to close.
  - A sibling mutant `!(masked && spec.kind !== 'grep')` at `:430` also survives. It turns a legitimate grep no-match into `counting_command_failed`.
- **Impacted axes:**
  - Operability: C1's cause-specific diagnostics are verified only for the tree grammar.
  - Calibration: the "missing or malformed revision" claim is broader than its evidence.
- **Smallest safe correction:** add two fixture cases to the `cases` array. No evaluator change is needed.
  - `count_missing_revision_grep_red`: `command: git grep -h '^marker: admitted-user-round$' ${zeros} -- round-marker.txt | wc -l`, plus `measured-against: ${zeros}`. Expect exit 1, `score_mismatch`, `reason: 'counting_command_failed'`, `detail: 'Counting command failed:'`.
  - `count_grep_no_match_supported`: a grep pattern absent at both baseline and measured, with `before: 0` and `after` equal to the true count. Pick fixture bytes so that before differs from after; for example, keep the default pattern but rewrite `before` to the baseline's real 0. This pins the status-1 → `"0"` mask as a clean, non-refusal outcome.
  - Optionally, also run the diagnostic witness's mutant arm on a grep-form missing row so the masking regression is exercised on both grammars.

## MR-2 MEDIUM (pre-existing, scope bound): a missing `--baseline` or pstack-pin revision is refused as `history_rewritten` exit 1, not as a missing revision
- **Evidence:**
  - `:298` checks only that `--baseline` is 40 hex characters.
  - `checkHistory` runs before any count. At `:309-310` it treats any nonzero `merge-base --is-ancestor` status as `fail('history_rewritten', 'Baseline is not an ancestor of HEAD')`, which is exit 1 with no reason.
  - Probe: `git merge-base --is-ancestor <absent 40-hex> HEAD` gives **128** (`fatal: Not a valid commit name`). That is a different status from 1, which means "not an ancestor".
  - `:325-326` does the same for the pstack pin.
  - In the same function, `:327-328` correctly classifies a failed `git diff` as `could_not_evaluate` exit 2. The function is internally inconsistent.
  - `checkReport` `:529-530` has the same pattern for `report_commit`. In the measured-missing path, `runCount` at `:619` already refuses first, so that branch is unreachable for C1.
- **Consequence:**
  - The before-count revision is `options.baseline` (`:618`). If it is missing, the run never reaches `counting_command_failed`.
  - It is reported as tampering (`history_rewritten`, a policy verdict, exit 1) when it is really a missing object, which per `:1300` should be `could-not-evaluate`.
  - C1's truthful missing-revision diagnostic therefore covers **only `measured-against`**, not every revision the counter reads.
  - This predates round 15 (baseline `7054a5e`, `:287`/`:303`). It is not a round-15 regression. It is a scope limit the C1 wording must not hide.
- **Impacted axes:** operability (diagnostic truthfulness) and calibration (claim scope).
- **Smallest safe correction:** in `checkHistory`, branch on the status. Status 1 means `history_rewritten`. Any other nonzero status, or `result.error`, means `fail('could_not_evaluate', 'Baseline revision is missing or unreadable', 2)`. Do the same at `:326` and `:530`. Alternatively, keep the code and state in SKILL/lesson that C1's missing-revision reason applies only to the SCORECARD `measured-against` revision.

## MR-3 LOW (tradeoff, not a contract violation): `counting_command_failed` is a catch-all, and `measured-against` is not checked to be a commit
- **Evidence:**
  - `:430` maps all of these to the same reason and the same detail `Counting command failed: <command>`:
    - missing object (128)
    - non-tree object such as a blob id (128; probed)
    - `ETIMEDOUT` (`timeout: 30000`, `:425`)
    - `ENOBUFS` (more than 16 MiB, `maxBuffer`, `:425`)
    - spawn `ENOENT`
    - signal termination
  - git's stderr and the status are dropped.
  - The fixture named `count_missing_revision_red` therefore proves only that "some git failure gets a reason", not that the missing-revision cause is identified.
  - Separately, `parseScore` (`:409-414`) accepts any 40-hex `measured-against`. Probe: `git ls-tree -r --name-only <tree-id>` gives exit 0 and lists files.
  - So a **tree** id passes counting, and the refusal moves to `checkReport`'s merge-base, which reports `report_commit` "cited commit is not an ancestor".
- **Assessment:** the comments (`:363-366`, `:426-428`) honestly describe the lumping, and SKILL claims only a closed vocabulary. This is a precision tradeoff, not a false claim. It becomes a defect only if the lesson or report describes C1 as a cause-specific missing-revision diagnostic.
- **Bounded correction (optional):** in `parseScore`, run `git rev-parse --verify --quiet ${measured}^{commit}`. On failure, use `fail('score_mismatch', …, 1, 'counting_revision_missing')` and register that id in `COUNT_REASONS` (`:92-99`). Also append `status=<n> signal=<s> error=<code>` to the `:430` detail so the remaining failures are distinguishable.

## Held propositions (attack attempted, held by source reading)
- **Wrong-after control, `count_wrong_after_red` (`:1089-1092`):**
  - The fixture baseline (`writeGoodFixture`, `:641-649`) has no `round-marker.txt`, so the before count with `options.baseline` is "0", matching the default `before: 0` (`:1050`).
  - The after count at the measured commit is "1", which differs from the declared 2.
  - So `:619` emits `after_count_mismatch` with detail `after measurement does not match`. Ordering at `:616-619` puts no other counting reason first.
- **Diagnostic arm 1 (wrong-after, `:966-979`):**
  - The pinned round-14 bytes accept `--pstack-pin` (`5c7710d:…:263`).
  - They emit the after-mismatch text (`:597`) on a reason-free stderr line (`:1041`).
  - That line matches `receiptOf`'s anchored regex (`:764`) with `reason` null, which is consistent with the `:1013-1016` expectations.
  - The arm is reachable only if WR-1 is fixed first: `runDiagnosticWitness` throws at `:954-956` before writing either arm.
- **Missing-revision fixture path (tree form):** `parseScore` passes because `spec.rev === measured`, both being the null OID.
  - The before count overrides the revision with the existing baseline (`:421`).
  - The after count on the null OID gives 128, then `counting_command_failed` (`:430`).
  - No earlier check reads `measured`: `checkReport` comes after the counts (`:620`).
- **Reason spoofing through the detail field is not possible:** the anchored `finding=… (?: reason=…)? detail=` regex at `:764` puts reason before detail. This is also covered by siblings.

## Commands L1 should run after corrections (not run here)
- `git show HEAD:scripts/check-user-round-contract.mjs | grep -cF "const masked = spec.kind === 'grep' && result.status === 1;"`. Today this prints 2 (WR-1), and it must print 1 after the fix.
- `node scripts/check-user-round-contract.mjs --self-test`. After the MR-1 addition, it must print `SELFTEST name=count_missing_revision_grep_red … expected_reason=counting_command_failed reason=counting_command_failed … result=PASS` and a clean `count_grep_no_match_supported`.
- Throwaway mutant check: apply M1 to a temp copy of the gate (outside the lane) and run its `--self-test`. After MR-1 it must FAIL `count_missing_revision_grep_red`. Today, with WR-1 fixed, it would PASS everything.
- MR-2 fixture: `--repo <fixture> --baseline <absent 40-hex> --expect 1`. It must exit 2 `could-not-evaluate` after the correction. Today it is exit 1 `history_rewritten` (read from the source, not run).
