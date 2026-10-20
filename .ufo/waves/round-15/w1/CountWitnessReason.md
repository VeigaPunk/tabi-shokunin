# CountWitnessReason — USER count-witness reason assertion and marker applicability

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · Wave: `tabi-round-15-w1` · Author-side read-only audit. Not a certification.
Owner of the audited file: `TabiR15.CounterDiagnostics` (spec: edits only `scripts/check-user-round-contract.mjs`).

## Scope and method

- Audited: `scripts/check-user-round-contract.mjs` as it stood in the worktree at audit time (`git status` showed only the untracked `.ufo/waves/round-15/`, so the file matched HEAD). Line anchors may shift when CounterDiagnostics edits land.
- Read: `gateFields`, `fail`, the top-level catch, `runCountWitness`, `countWitness`, `selfTest` (malicious and witness rows), `parseScore`, `countingCommand`, `runCount`, `check`, `writeGoodFixture`.
- Read-only history: `git show bebe2ef…:scripts/check-user-round-contract.mjs` written to `/tmp`, grepped, and removed. Gates, self-tests, count-witness runs, and browsers were NOT executed.
- Tools: none installed or updated.

## Verdict

The count-witness and malicious self-test controls prove "some `score_mismatch` happened, exit 1, no marker". They do not prove the intended refusal fired. Any `score_mismatch` passes. Marker absence on the new arm is vacuous on its own. Two receipt fields are wrong: a hard-coded `no_marker=0` on the witness control, and a synthesized `old_finding=clean`.

## Axes

- A1 reason assertion: does each refusal control pin the cause, not just the finding?
- A2 marker applicability: is each `marker=` value's meaning explicit, and is `0` ever "not applicable"?
- A3 falsifiability: can each no-marker control detect a marker if the command had executed?
- A4 receipt honesty: are printed fields observed or derived?

## Findings

### F1 (HIGH, A1) Refusal reason is never asserted

- `gateFields` (`:718-729`) captures only `verdict` and `finding`. The `detail=` text printed by the top-level catch (`:1039-1042`) is discarded.
- `runCountWitness` pass (`:828-833`) requires `oldArm.verdict==='clean'`, `oldMarker`, `after.status===1`, `newArm.finding==='score_mismatch'`, `!newMarker`. No reason.
- `count_witness_comparison` (`:1007-1015`) repeats the same conditions.
- Malicious and missing-revision controls (`:865-873`, `:883-891`) match at `:988-990` on exit, `finding=<x>` substring, and no marker. No reason.

Wrong causes that currently PASS the same controls (by reading the check order in `check()` `:575-606`; not executed):

| Control | Intended refusal (anchor) | Wrong cause that also passes |
|---|---|---|
| `count_malicious_tee_refused`, `count_malicious_shell_refused`, `count_malicious_option_injection_refused`, count-witness new arm | `parseScore` `:391` "counting command is not a supported git line count" (reached at `:592`, before any `runCount`) | any other `score_mismatch`, e.g. `:392` rev mismatch, `:408` "Counting command failed", `:596`/`:597` count mismatch |
| `count_missing_revision_red` | `runCount` `:408` "Counting command failed" on the zero-rev after-measurement (`:597`); before (`:596`) uses baseline and matches 0 [INFERENCE from code order] | `:392` rev mismatch, `:597` after mismatch |
| `count_wrong_after_red` | `:597` "after measurement does not match" | `:408` "Counting command failed" (e.g. a measured-rev regression) |

Fix shape: add a stable `reason=<token>` to the verdict line (`:1041`) and to `gateFields`; capture `detail=` to end of line; give every malicious and witness control a literal expected `reason`; require equality, not substring.

Proposed reason tokens (no logic change, token only):

| Token | Anchor |
|---|---|
| `unsupported_counting_grammar` | `:391` |
| `counting_rev_mismatch` | `:392` |
| `counting_command_failed` | `:408` |
| `before_measurement_mismatch` | `:596` |
| `after_measurement_mismatch` | `:597` |

### F2 (MED, A2/A4) Witness receipt hard-codes `no_marker=0`, contradicting its own pass

- `:1016` prints `no_marker=0` literally. The pass condition (`:1014-1015`) includes `!witnessRun.newMarker`. A passing run prints `no_marker=0`.
- `:991` prints `no_marker=${noMarker ? (leaked ? 0 : 1) : 0}`. Non-marker controls print `0`, the same value as "marker leaked". "Not applicable" is conflated with "failed". Use `n/a` for non-marker rows.
- Applicability: the new evaluator never spawns a shell (`runCount` uses `spawnSync('git', …)` `:403`), so `new_marker=0` is structurally expected. It is evidence of refusal only jointly with a grammar-refusal reason (`:391` runs before any spawn). Receipts should say `new_marker_expected=0` alongside `new_reason`, not a bare `0`.

### F3 (MED, A3) One no-marker control cannot fail

- `count_malicious_option_injection_refused` (`:871-873`): `git --git-dir=/var/tmp/other ls-tree … | grep round-marker.txt | wc -l`. It contains no `tee` and no `touch`. No execution can create `COUNT_WITNESS_MARKER`, so `no_marker=1` proves nothing about marker applicability.
- Fix: add `| tee ${COUNT_WITNESS_MARKER}` so the marker is applicable if the grammar ever accepted the command. Add a static assertion that every `noMarker` row's `command` contains the marker token.
- Falsifiability of the tee/shell rows (`:865-870`) rests on the legacy arm of `count_witness_comparison` (`old_marker=1`), which proves `existsSync` detects a tee-created marker. That dependency is not stated in code; document it in the comment at `:780-787`.

### F4 (MED, A4) `old_finding=clean` is synthesized, not observed

- `:837`: `oldFinding: oldArm.finding ?? (oldArm.verdict === 'clean' ? 'clean' : 'none')`.
- The legacy gate's clean line (`git show bebe2ef:…`, line 503) is `USER_ROUND_CONTRACT verdict=clean rounds=${…} consequential=0`. It has no `finding=` token.
- `old_finding=clean` is printed at `:849` and `:1016`. It is derived. Print observed `old_finding=${oldArm.finding ?? 'none'}` and keep `old_verdict=clean` as the observed assertion. MeasureContracts must parse `none` as "legacy clean carried no finding token".

### F5 (LOW, A1) Unreachable branch for SCORECARD commands

- `runCount` `:398` "Unsupported counting command" cannot fire for SCORECARD-driven commands. `check()` calls `parseScore` (`:592`, which rejects at `:391`) before `runCount` (`:596-597`). Controls must expect `:391`'s text, not `:398`'s. Keep the branch as defence with a comment, or drop it; do not assert it.

### F6 (LOW, latent) `String.replace` with a template replacement

- `rewriteScore` `:861` and `runCountWitness` `:815` pass a template string containing a command as the replacement. `$&`, `` $` ``, `$'`, and `$$` are interpreted. `$(` is literal and safe. No current row contains a special sequence (checked by reading the rows). Use a function replacer `() => \`command: ${command}\`` so any future row round-trips.

### F7 (dependency) External validator runs before the reason stage

- `check()` calls `checkSpec` (`:590`) → `spawnSync(VALIDATOR, …)` (`:441`, `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, not digest-pinned; SecurityScope E9). If the validator rejects, the new arm yields `short_swarm`. The witness then fails closed, but the reason assertion is the thing that would make that visible. Expected-reason rows are only meaningful if the validator is healthy; L1 should record validator availability with the run.

## Proposed tests (literal, independent expectations)

- T1 Malicious rows (`:865-873`): add `reason` per row: tee / shell / option-injection → `unsupported_counting_grammar`; `count_missing_revision_red` → `counting_command_failed`; `count_wrong_after_red` → `after_measurement_mismatch`. Match requires exit, finding, and reason equality. Print `expected_reason=` and `reason=`.
- T2 Count-witness new arm (`:826-833`, `:1013-1015`): pass requires `newArm.reason === 'unsupported_counting_grammar'` AND `newArm.finding === 'score_mismatch'` AND `!newMarker`. Old arm: `verdict=clean` AND `oldMarker` AND observed `old_finding=none` (F4).
- T3 Falsifiable negative reason control: extract the matcher from the malicious loop into a pure `matchCase(output, expected)`. Self-test asserts `matchCase('USER_ROUND_CONTRACT verdict=failed finding=score_mismatch reason=after_measurement_mismatch detail=…', {exit:1, finding:'score_mismatch', reason:'unsupported_counting_grammar'}) === false`, and the matching positive case returns true. Print `SELFTEST name=reason_matcher_rejects_wrong_cause result=PASS`. This is the "score_mismatch with wrong cause cannot pass" control, with no extra gate execution.
- T4 Marker applicability: each row carries `marker: 'applicable' | 'n/a'`; receipts print `new_marker_expected=0` and `old_marker_expected=1`. Static assertion: every `noMarker` row's command contains `COUNT_WITNESS_MARKER` (closes F3).
- T5 Rewrite round-trip (optional, F6): a row whose command contains `$&` reads back byte-identical from SCORECARD.

Use the existing `--count-witness` run as the baseline-vs-repaired same-fixture differential (legacy `bebe2ef` arm vs HEAD). No new witness mode is needed.

## Commands for L1 to run after integration (not executed by this audit)

- `node scripts/check-user-round-contract.mjs --self-test`
- `node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd`
  Expect: old `verdict=clean`, `old_marker=1`; new `exit=1`, `reason=unsupported_counting_grammar`, `new_marker=0`, `result=PASS`.
- `node scripts/check-user-round-contract.mjs` (production). The historical red is `round_count` 6/10 (LOG `:741`). Expect the same red unless round data changed; it is not a result of this slice.

## Preserved / not findings

- The old-arm positive control (`verdict=clean` + marker present) is a sound discriminator.
- The grammar refusal (`:390-391`) precedes every spawn in `check()`, so the new arm does not execute the malicious tee or shell. The absence of a marker in the new arm is therefore consistent, not accidental, once reason is pinned (F1).
- `count_historical_supported`, `count_quoted_supported`, `count_two_stage_supported` (`:874-882`) keep exit 0 / clean; the proposals above do not change them.
- Counting, history, baseline, and expected-10 behavior are unchanged by the proposals; they only add tokens and literal expectations.

## Messages

- `TabiR15` (parent): this report is written; no edits made.
- `TabiR15.CounterDiagnostics` (owner): short pointer to F1–F4 anchors (sent separately).
