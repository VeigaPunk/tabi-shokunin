# AttackWrongReason — C1 wrong-reason oracle control (round15 wave2, author-side critic)

Scope: a read-only source attack on the delivered build bytes. I ran no gate, self-test, witness, counter or browser run, and I installed nothing (tools installed/updated: none). This is an author-side review. It does not certify anything as a non-author verifier.

## Attacked identity
- Build snapshot `.ufo/waves/round-15/build-snapshot.json`: revision `72dcf031b9da24796b718517ea575f21e4f7caae`, baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- `HEAD` = `72dcf031…`. `scripts/check-user-round-contract.mjs` sha256 is `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`, which equals the snapshot. The git blob is `12b14bdf288dc9877820f699677fb11651d254c1` in both HEAD and the worktree (`git diff --quiet HEAD -- scripts/` is clean). The script last changed in `c138bea`; `72dcf03` does not touch it.
- Temporal limit: `corpus/lessons/round-15.md:57-59` "Execution evidence" is still empty, and `corpus/evidence/round-15/` holds no USER self-test or diagnostic receipt. No actual C1 receipt exists to attack. Everything below comes from reading the source, not from execution.

## WR-1 CRITICAL — the regressed-mask arm cannot run; `--diagnostic-witness` and `--self-test` stop with could-not-evaluate
- `scripts/check-user-round-contract.mjs:859` is `const MASK_GUARD = "const masked = spec.kind === 'grep' && result.status === 1;";`. That string literal contains the guard text byte for byte.
- `:953` splits the script's **own full source** on `MASK_GUARD`. The literal fragment occurs twice: at `:429` (the evaluator) and at `:859` (the constant itself). Confirmed by a fixed-text search on HEAD: `git show 72dcf03:scripts/check-user-round-contract.mjs | grep -cF "<guard>"` → `2`. So `guardParts.length === 3`.
- `:954-956` therefore always calls `fail('could_not_evaluate', 'Mask guard appears 2 times in the evaluator source', 2)`.
- Effects, from reading the source:
  - `--diagnostic-witness` (`:1294` → `:1039`) exits 2.
  - `--self-test` reaches `runDiagnosticWitness()` at `:1267`. That is after the case loop, `reason_negative_control` and the count witness. It throws there, the top-level catch at `:1297-1301` exits 2, and `USER_ROUND_CONTRACT_SELFTEST verdict=clean` (`:1287`) is never printed.
  - `.ufo/waves/round-15/measure.mjs:677-678` would record `self_test_red`/`self_test_not_green`.
- The "isolated regressed-mask control" that the lesson requires (`corpus/lessons/round-15.md:36`) therefore cannot produce a receipt in the delivered bytes.
- The comment at `:855-858` ("One unique source fragment … duplicated fragment is could-not-evaluate") is self-defeating, because the constant duplicates the fragment it names.
- w1 `CounterDiagnostics.md:140-141` claims a "unique `MASK_GUARD` line". That claim is false for these bytes. Its predicted `--diagnostic-witness exits 0` (`:209`) cannot hold.
- Impacted axes: operability (the C1 0→1 claim has no green self-test), calibration of the CounterDiagnostics prediction, SKILL `:1799` registry promise.
- Smallest safe correction (pick one, no behaviour change elsewhere):
  - (a) Build the literal so it does not appear verbatim in source. One way: `const MASK_GUARD = ['const masked = spec.kind', " === 'grep' && result.status === 1;"].join('');`.
  - (b) Split only the `runCount` function text, located by its `function runCount(` header, and keep the exact-once check inside that slice.
  - Either way, keep the `!== 2` → exit-2 guard. Then assert that the mutant bytes differ from the original in exactly one place.

## WR-2 HIGH — the wrong-reason controls are rejected by `detail`, not by `reason`; the reason facet is untested (vacuous oracle)
- `receiptMatches` (`:781-786`) checks exit, finding, reason (`:784`) and a detail substring (`:785`) independently. In every negative ("must not match") use, the decoy expectation's **detail also differs** from the observed receipt. Detail alone rejects the decoy, so the reason literal is never the deciding facet:
  - `reason_negative_control` (`:1236-1243`). The decoy is `{reason: after_count_mismatch, detail: 'after measurement does not match'}`. The observed `count_missing_revision_red` receipt has detail `… Counting command failed: git ls-tree … 000…` (`:430`). Its `before` run against the fixture baseline succeeds, and its `after` run against zeros fails. `decoyMatch` is false because of detail, whatever `:784` says.
  - Diagnostic witness `wrongMatch` (`:1009`). The `unsupported` detail `'counting command is not a supported git line count'` does not match the repaired detail `… after measurement does not match` → false via detail.
  - Diagnostic witness `mutantCorrectMatch` (`:1011`). The `countFailed` detail `'Counting command failed:'` does not match the mutant detail `… after measurement does not match` (`:619`) → false via detail.
- Counterexample mutant: delete `:784`, or replace it with `&& true`. Every case-loop expectation still matches its correct receipt, and every negative still fails to match through detail. So `reason_negative_control` prints `result=PASS`, and `diagnostic_witness_comparison` passes once WR-1 is fixed. The control does not "fail the intended oracle" when the reason oracle is removed.
- This falsifies the code comment at `:1232-1233` ("The control can pass only when reason is both asserted and discriminating"). It also falsifies the lesson's "same-output wrong-reason decoy" (`corpus/lessons/round-15.md:36`): no decoy shares the observed output except in its reason. QUALITY21 (`corpus/QUALITY.md:72-73`) requires that "an unrelated `score_mismatch` must not satisfy it". That is met today only by accident of distinct detail strings. A mislabelled emission is not caught by the comparator: same detail, wrong reason id, for example `:430` emitting `after_count_mismatch` with detail `Counting command failed:`.
- The direct literal checks `repaired.reason === …` / `mutantMissing.reason === …` (`:1016,1019,1021,1269-1271`) do prove that reasons are **emitted**. They do not exercise `receiptMatches`' reason facet, which is the oracle C1 claims to add.
- Impacted axes: operability (C1 "right finding, wrong reason is refused" is unproven), and SKILL `:1782` and QUALITY21 prevention claims.
- Smallest safe correction:
  - Make each negative decoy differ from the observed receipt **only in reason**. Either omit `detail` from the decoy (`detail` undefined skips `:785`), or set it to the observed cause's detail. Example at `:1236`: `{ exit: 1, finding: 'score_mismatch', reason: 'after_count_mismatch' }`. Do the same for `unsupported`/`countFailed` when they are used as non-matching expectations (`:1009`, `:1011`). Keep the detailed versions for positive matches.
  - Add the inverse assertion that a finding-and-detail-only copy of the decoy DOES match. Then the receipt shows the reason facet alone flips the outcome.
  - Optionally add one source mutant that relabels `:430`'s reason to `after_count_mismatch`, so the same detail carries a wrong reason, and require `receiptMatches(correctCause, relabelled) === false`.

## WR-3 LOW — `legacy_finding_only_accepts` is not a legacy result
- `:1238` `legacyAccept` is an inline `exit===1 && finding==='score_mismatch'` predicate over the **repaired** child receipt. It is implied by `correctMatch`, and it does not execute the round-14 comparator.
- The receipt label `legacy_finding_only_accepts=1` (`:1243`) reads like an observed legacy behaviour.
- The diagnostic witness's `baseline_finding_only_accepts` (`:1008`) is likewise a predicate over the baseline gate's CLI output, not the baseline self-test's comparator.
- Correction: rename both to `finding_only_predicate_accepts`, or state in SKILL/lesson that this is a synthesized predicate. No behaviour change.

## Not defects found
- `receiptOf` (`:759-776`) anchors on the child's own `USER_ROUND_CONTRACT` line. `reason` is parsed before `detail`, so attacker-controlled command text in the detail cannot inject a reason.
- `fail` (`:101-106`) rejects unregistered reason ids with exit 2.
- Marker applicability fields (`:1214-1221`) separate N/A (`no_marker=na`) from applicable-and-absent.

## Commands for L1 after correction (not run here)
- `git show HEAD:scripts/check-user-round-contract.mjs | grep -cF "const masked = spec.kind === 'grep' && result.status === 1;"` — currently `2`. It must be `1` after correction (a), or the guard must be scoped as in correction (b).
- `node scripts/check-user-round-contract.mjs --diagnostic-witness` — currently expected to exit 2 with `Mask guard appears 2 times` (an inference from the source; not run).
- `node scripts/check-user-round-contract.mjs --self-test` — expect it to stop at `diagnostic_witness_comparison` with exit 2 until WR-1 is fixed.
- After WR-2's fix, take a throwaway copy with `:784` removed. Its self-test must FAIL `reason_negative_control`; today it would PASS.
