# CountReasonWitness — critic, round-15 w1 (C1 slice)

Author-side critic report. It is not a non-author certification. Everything here comes from reading the sources at HEAD `7054a5e`; `scripts/` had no worktree drift when I read it. I executed no gate, counter, self-test, suite or browser. I made no source edits and installed no tools.

Assigned slice: design a reason-expectation mismatch control for the USER counter (`scripts/check-user-round-contract.mjs`). On the same child input, the old exit+finding assertion must pass and the new reason-aware assertion must reject.

## Axes
- **operability (C1)**: refusal diagnostics name their real cause.
- **discernment**: a wrong cause cannot satisfy a control.
- **no-regression**: counting, history, baselines and expect=10 stay unchanged, and the legacy witness arms keep working.

## Evidence (anchors are HEAD line numbers)
- `fail()` at `:84-86` carries only `finding`, `detail` and `exit`. The terminal line at `:1041` is `USER_ROUND_CONTRACT verdict=… finding=… detail=…`. It has no reason or applicability token.
- `score_mismatch` has **seven** emitters, each with a different cause:
  | site | cause | proposed reason token |
  |---|---|---|
  | `:391` | parseScore: command not a supported git line count | `unsupported_command` |
  | `:392` | command rev ≠ measured-against | `rev_mismatch` |
  | `:398` | runCount: unsupported (unreachable from the CLI because parseScore runs first, `:592` before `:596`) | `unsupported_command` |
  | `:408` | git count spawn failed or exited nonzero (round-14 hardening) | `count_failed` |
  | `:594` | before == after | `before_equals_after` |
  | `:596` | before recount ≠ SCORECARD before | `before_mismatch` |
  | `:597` | after recount ≠ SCORECARD after | `after_mismatch` |
- The self-test oracle at `:988-990` checks only `result.status === test.exit && output.includes('finding=…')` (or `verdict=clean`) plus the marker check. Five cases expect `score_mismatch`: `:865-873` (tee, shell, option injection), `:883-888` (missing revision) and `:889-891` (wrong after). None names a cause.
- The witness predicates check only the finding: `:832` (`newArm.finding === 'score_mismatch'`) and `:1014`.
- `gateFields` at `:726-727` takes the **first** `verdict=`/`finding=` match over `stdout+stderr`. On stdout, the `ROUND` line at `:602` echoes `spot=${gate.spot}`. That value is lesson text admitted by `.+` at `:329`.

## Counterexample (wrong cause passes the same control)
1. Mutant M1: replace `:407` `const masked = spec.kind === 'grep' && result.status === 1;` with `const masked = true;`. This reverts to the historical `wc -l` behaviour, where a failed git command counted as 0.
2. Child input: unchanged `count_missing_revision_red` fixture (`:883-888`). The command and measured-against are both `0{40}`; the args are the fixture's `--repo/--baseline/--expect 1/--pstack-pin`.
3. Path traced statically, not executed:
   - parseScore passes because `spec.rev === measured`.
   - `:596` recounts at the fixture baseline. Baseline `:627` is committed before `round-marker.txt` is written at `:629`, so the count is `'0'` and equals before 0.
   - `:597`: `git ls-tree 0{40}` exits nonzero with no `result.error`. M1 masks it, so stdout is empty, rows are `[]`, and the count is `'0'`, which differs from `'1'`. The failure is raised at **`:597` after_mismatch**, exit 1, `finding=score_mismatch`.
4. The current oracle `:988-989` gives **PASS** under M1. The round-14 `:408` hardening (fail explicitly on a counting failure) therefore has no defending case. The case name claims a cause that its assertion does not check.
5. Contrast: the other score_mismatch cases cannot be satisfied by a wrong cause in the same way. A parser-loosening mutant for tee or option injection runs argv-only git, which counts 1 = after, so the run exits 0 and the exit check catches it. Missing-revision is the one case where a weakened checker still exits 1 with the same finding.

## Smallest safe correction (for CounterDiagnostics; ROUND gate untouched)
1. **Emission**: add `reason` to `fail()` (for example `fail(finding, reason, detail, exit)`, or an options object), and give every `fail('score_mismatch', …)` site its token from the table above. Change the terminal line to `USER_ROUND_CONTRACT verdict=… finding=… reason=… applicability=… detail=…`, with `reason`/`applicability` **before** `detail` so an echoed detail cannot spoof them. Other findings can carry a single stable reason; the C1 claim needs only the score_mismatch split.
2. **Parsing**: in a new `reasonFields(result)`, require exactly one stderr line matching `^USER_ROUND_CONTRACT verdict=(clean|failed|could-not-evaluate) finding=([a-z_]+) reason=([a-z_]+) applicability=([a-z_]+) `. Zero or more than one match is a predicate failure. Do not reuse the first-match `gateFields` for reasons.
3. **Per-case literal expectations**: write the expected values as literals in each case, never derived from the emitter:
   - `count_malicious_tee_refused`, `count_malicious_shell_refused`, `count_malicious_option_injection_refused` → `unsupported_command`
   - `count_missing_revision_red` → `count_failed`
   - `count_wrong_after_red` → `after_mismatch`
   - clean and supported cases → `reason=none applicability=not_applicable`
   
   Add the three uncovered causes as new cases: `count_rev_mismatch_red` (command rev ≠ measured-against) → `rev_mismatch`; `count_before_equals_after_red` (before=after=1) → `before_equals_after`; `count_wrong_before_red` (before=1, after=1 differs from the actual count) → `before_mismatch`.
4. **Receipt line**: print `SELFTEST name=… expected_exit=… actual_exit=… expected_finding=… actual_finding=… expected_reason=… actual_reason=… reason_applicability=asserted|not_applicable result=…`. Show `actual_*` values parsed from the child output, never copies of the expectation.
5. **Legacy arms**: the old gates at `:761` and `:821` emit no `reason=`. The witness predicates must expect `old_reason=absent` and require `reason=unsupported_command` only on the new arm at `:832`/`:1014`. Making reason mandatory on old arms would break both witnesses.

## Proposed controls (same child input; the old predicate passes and the new one rejects)
- **R1 `count_reason_decoy_control`**: assertion-level, one spawn. Run the unchanged `count_missing_revision_red` child once and evaluate three predicates over the same output:
  - `oldPredicate({exit:1, finding:'score_mismatch'})` must be `pass`.
  - `newPredicate({…, reason:'count_failed'})` must be `pass`.
  - `newPredicate({…, reason:'after_mismatch'})` (the decoy) must be `reject`.
  
  The control is PASS only for exactly the triple pass/pass/reject. Receipt: `SELFTEST name=count_reason_decoy_control old_predicate=pass new_predicate=pass decoy_predicate=reject actual_reason=count_failed result=PASS`.
- **R2 `count_reason_mutant_control`**: checker-level, same fixture and args. Write a temp copy of the current `script` bytes with the single literal M1 replacement. If the replacement count is not exactly 1, fail with `could_not_evaluate`, exit 2, and do not skip; this follows the `:894` archived-bytes refusal pattern. Spawn the mutant on the same `count_missing_revision_red` input. Expected: exit 1, `finding=score_mismatch`, `reason=after_mismatch`; the old predicate **passes** and the new `count_failed` predicate **rejects**. The real-checker arm from R1 shows the same predicate passing. Receipt: `SELFTEST name=count_reason_mutant_control real_reason=count_failed mutant_reason=after_mismatch old_predicate_mutant=pass new_predicate_mutant=reject result=PASS`. This is the falsifiable CLI negative reason control: if the `:408` hardening is reverted, the R1 case fails.
- **R3 (optional, matrix)**: for each of the five existing score_mismatch cases, assert that every *other* reason token is rejected on its own output. This adds no extra spawns.

## Applicability (adjacent; routed only)
`:991`, `:1004` and `:1016` print `no_marker=0` both for N/A cases and for the leaked state. Use `marker_applicability=applicable|not_applicable` with `marker_leaked=0|1|n/a`, so that "no marker" is never confused with "not applicable". CountMarkerNA likely owns the details.

## For MeasureContracts / L1 (C1 count1 binding)
C1 should count 1 only if the committed receipt for round 15 contains:
- `count_reason_decoy_control` and `count_reason_mutant_control` with `result=PASS`;
- every score_mismatch `SELFTEST` line carrying `expected_reason` equal to `actual_reason` and `reason_applicability=asserted`;
- the bound USER source sha256/revision equal to committed HEAD.

If a receipt line lacks `actual_reason`, the count must be 0, never 1.

## Commands for L1 to run after integration (not run here)
- `node scripts/check-user-round-contract.mjs --self-test`
- `node scripts/check-user-round-contract.mjs` (production: expect clean and 10 rounds)
- `node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd`
- `node scripts/check-round-contract.mjs --self-test` (ROUND gate unchanged; regression check only)

## Messages sent
- `TabiR15.CounterDiagnostics`: the emitter table, the M1 counterexample, and the R1/R2 design.
- `TabiR15`: summary pointer to this report.
