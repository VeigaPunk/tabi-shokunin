# CountReasonGrammar — USER runCount grammar refusals: exact reasons and malicious-case expectations

Seat: TabiR15.CountReasonGrammar (reviewer, read-only audit). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Author-side report; not non-author certification.

## Snapshot and method

- Audited file: `scripts/check-user-round-contract.mjs`.
- HEAD (7054a5e) and the working tree differ. The working tree carries an uncommitted in-flight diff (+21/−4, owned by CounterDiagnostics) adding `COUNT_REASONS` and a third `reason` argument to `fail()`. The file grew from 1043 to 1060 lines during this audit; line anchors below are from the 1060-line working-tree read. Re-anchor by symbol if the file moves again.
- Other files in the working tree (`SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/evidence/round-15/`) were not read; they are outside this slice.
- Nothing executed: no gate, counter, self-test, git command against fixtures, or browser. Every expected outcome below is derived by reading code and is marked `[INFERENCE: not run]` where it depends on git or Node runtime behavior.
- No source edits. Only this report was written.
- Tool installs: none.

## 1. Grammar and refusal reason inventory (current working tree)

Grammar (no shell is ever spawned; the evaluator accepts only these shapes):
- `TREE_COUNT` (≈l.362): `git ls-tree -r --name-only <40-hex> | grep <pat> [| grep <pat>] | wc -l`, anchored `^…$`.
- `GREP_COUNT` (≈l.363): `git grep -h '<pat>' <40-hex> -- <path> | wc -l`, anchored.
- `countPattern` (≈l.352–359): rejects leading `-`, any char outside `[A-Za-z0-9 _:.\/^$-]`, empty body, interior `^`/`$`.
- `GREP_PATH` (≈l.350): `[A-Za-z0-9._\/-]+`; `..` and leading `-` rejected in `countingCommand`.

Refusal sites that matter for the counting contract:

| # | Current text (detail) | Site (working tree) | finding / exit | reason id (in-flight diff) | Exercised by a CLI selftest case today? |
|---|---|---|---|---|---|
| R1 | `${id} counting command is not a supported git line count` | `parseScore` ≈l.408 | score_mismatch / 1 | `unsupported_counting_command` | Yes, 3 cases (tee, shell, option-injection) — finding-only assertion |
| R2 | `${id} counting command does not measure its measured-against commit` | `parseScore` ≈l.409 | score_mismatch / 1 | `counting_revision_mismatch` | **No** |
| R3 | `Unsupported counting command: ${command}` | `runCount` ≈l.415 | score_mismatch / 1 | none | **Unreachable** (parseScore gates first on every path) |
| R4 | `Counting command failed: ${command}` | `runCount` ≈l.425 | score_mismatch / 1 | none (vocabulary has `counting_command_failed`, unused) | Only implicitly via `count_missing_revision_red`; finding-only |
| R5 | `${id} before and after are the same` | `check` ≈l.611 | score_mismatch / 1 | none (vocabulary has `score_not_improved`, unused) | **No** |
| R6 | `${id} before measurement does not match` | `check` ≈l.613 | score_mismatch / 1 | none (vocabulary has `before_count_mismatch`, unused) | **No** |
| R7 | `${id} after measurement does not match` | `check` ≈l.614 | score_mismatch / 1 | none (vocabulary has `after_count_mismatch`, unused) | Yes, `count_wrong_after_red` — finding-only |
| R8 | `${id} measured-against is not a commit` | `parseScore` ≈l.405 | missing_score / 1 | none (outside contract) | **No** |
| R9 | `${id} scorecard lacks ${name}` | `parseScore` ≈l.401 | missing_score / 1 | none | **No** |

Exit mapping for every counting refusal: finding `score_mismatch` → exit 1 (default in `fail`). Nothing in the counting grammar produces `could_not_evaluate` exit 2, including spawn error, timeout, and maxBuffer overflow (see D7).

Operator-visible line (catch at end of file, ≈l.1058), current:
`USER_ROUND_CONTRACT verdict=failed finding=score_mismatch detail=<message>`
The in-flight `reason` is attached to the thrown error but **not printed** and **not parsed** by `gateFields` (≈l.735). Nothing in the CLI can yet observe a reason id (see D2).

## 2. Malicious and control cases: expected outcome per case

The fixture (`writeGoodFixture`, ≈l.631) uses id `user-20261015-r01`, baseline count 0 (no `round-marker.txt` at baseline), measured count 1, `--expect 1 --pstack-pin <pin>`. Literal expectations below are the **full stderr line** the case should assert. The "proposed" column is what the case should assert after the fix; the "today" column is what the current selftest actually checks.

| Case (selftest name, ≈l.882–908) | Command payload | Expected exit | Expected finding | Expected reason (proposed) | Expected detail (literal) | Marker applicable | Marker absent | Today checks |
|---|---|---|---|---|---|---|---|---|
| `count_malicious_tee_refused` | `… \| grep round-marker.txt \| tee .user-round14-count-marker \| wc -l` | 1 | score_mismatch | unsupported_counting_command | `user-20261015-r01 counting command is not a supported git line count` | 1 | 1 | exit + finding substring only |
| `count_malicious_shell_refused` | `… \| sh -c 'touch .user-round14-count-marker'` | 1 | score_mismatch | unsupported_counting_command | same as above | 1 | 1 | exit + finding substring only |
| `count_malicious_option_injection_refused` | `git --git-dir=/var/tmp/other ls-tree … \| wc -l` | 1 | score_mismatch | unsupported_counting_command | same as above | **0** | n/a | exit + finding + `no_marker` (**vacuous**, see D5) |
| `count_historical_supported` | `… \| grep round-marker.txt \| wc -l` | 0 | clean | — | — (`verdict=clean`) | 0 | n/a | exit + `verdict=clean` |
| `count_quoted_supported` | `… \| grep 'round-marker.txt' \| wc -l` | 0 | clean | — | — | 0 | n/a | same |
| `count_two_stage_supported` | `… \| grep round- \| grep marker.txt \| wc -l` | 0 | clean | — | — | 0 | n/a | same |
| `count_missing_revision_red` | `git ls-tree -r --name-only 000…0 \| grep round-marker.txt \| wc -l`, measured-against 000…0 | 1 | score_mismatch | counting_command_failed | `Counting command failed: git ls-tree -r --name-only 0000000000000000000000000000000000000000 \| grep round-marker.txt \| wc -l` | 0 | n/a | exit + finding only |
| `count_wrong_after_red` | `… MEASURED …`, after 2 | 1 | score_mismatch | after_count_mismatch | `user-20261015-r01 after measurement does not match` | 0 | n/a | exit + finding only |

Derivation notes `[INFERENCE: not run]`:
- Tee/shell/option cases fail in `parseScore`, which runs before any `runCount` call, so the payload is never spawned; the marker is never created. Earlier steps (`checkHistory`, `roundIds`, `parseLesson`, `checkSpec`, `checkSwarm`) pass on this fixture because only SCORECARD changed, and SCORECARD's append-only prefix is preserved by `rewriteScore`.
- Missing-revision: the baseline before-count (0) passes at ≈l.613, then `git ls-tree` on the all-zero object exits 128 (`not a tree object`), so `runCount` fails at R4, not at R7. A regression that masked the 128 as 0 would instead fail R7 with `after measurement does not match` — also `score_mismatch`, same exit, so today's control cannot tell the two causes apart.
- Wrong-after: before 0 vs baseline 0 passes; measured count 1 ≠ 2 fails R7.

Discriminating controls the current table is missing (proposed cases; all `[INFERENCE: not run]` for expected outcomes):

| Proposed case | Setup | Expected exit / finding / reason | Expected detail (literal) | Why it discriminates |
|---|---|---|---|---|
| `count_malicious_trailing_command_refused` | `… \| wc -l; touch .user-round14-count-marker` | 1 / score_mismatch / unsupported_counting_command | `user-20261015-r01 counting command is not a supported git line count` | Anchored `$` in `TREE_COUNT`; marker applicable=1 |
| `count_malicious_substitution_refused` | `… \| grep "$(touch .user-round14-count-marker)" \| wc -l` | 1 / score_mismatch / unsupported_counting_command | same | `"`, `$`, `(` rejected; marker applicable=1 |
| `count_grep_invert_refused` | `… \| grep -v round-marker.txt \| wc -l` | 1 / score_mismatch / unsupported_counting_command | same | leading `-` pattern rejected |
| `count_grep_path_traversal_refused` | `git grep -h 'marker: admitted-user-round' <MEASURED> -- ../round-marker.txt \| wc -l` | 1 / score_mismatch / unsupported_counting_command | same | `..` path rejected in `countingCommand` |
| `count_grep_option_pattern_refused` | `git grep -h '-e' <MEASURED> -- round-marker.txt \| wc -l` | 1 / score_mismatch / unsupported_counting_command | same | `-`-leading pattern rejected |
| `count_revision_mismatch_refused` | command rev = baseline sha (must be passed into `mutate`), measured-against = MEASURED | 1 / score_mismatch / counting_revision_mismatch | `user-20261015-r01 counting command does not measure its measured-against commit` | Covers R2, currently untested |
| `count_grep_no_match_masked_zero` | `git grep -h 'absent-pattern' <MEASURED> -- round-marker.txt \| wc -l`, before 0, after 1 | 1 / score_mismatch / after_count_mismatch | `user-20261015-r01 after measurement does not match` | Proves exit-1 no-match is counted as 0 (masking). A regression to refusal would instead show `Counting command failed:` |
| `count_before_mismatch_refused` | before 2, after 1 | 1 / score_mismatch / before_count_mismatch | `user-20261015-r01 before measurement does not match` | Covers R6, untested |
| `count_before_after_equal_refused` | before 1, after 1 | 1 / score_mismatch / score_not_improved | `user-20261015-r01 before and after are the same` | Covers R5, untested |
| `count_measured_not_commit_refused` | measured-against `HEAD` | 1 / missing_score / (none) | `user-20261015-r01 measured-against is not a commit` | Covers R8, untested |

## 3. Defects (ranked)

**D1 (high) — Selftest asserts finding substring, not the refusal cause.**
Anchor: selftest loop ≈l.988–1010, `const match = result.status === test.exit && output.includes(\`finding=${test.finding}\`) && !leaked` (≈l.1005–1007). Every malicious and failing case matches any `score_mismatch` from any cause. Concrete escape: `count_missing_revision_red` and `count_wrong_after_red` are both `score_mismatch` exit 1; a regression that masked git's 128 into `0` would make the missing-revision case fail as `after measurement does not match` and still PASS. Fix: exact per-case literal expectations of reason id and full detail line (section 4).

**D2 (high) — Reason id is attached but never observable.**
`fail()` (≈l.98–103) sets `error.reason`. The catch (≈l.1058) prints only `finding` and `detail`. `gateFields` (≈l.735–745) parses only `verdict` and `finding`. So neither the CLI receipt nor the self-test can assert `unsupported_counting_command` or `counting_revision_mismatch`; the in-flight diff is currently dead for assertions. Fix: print `reason=${error.reason ?? 'none'}` between `finding=` and `detail=` in the catch, and parse it in `gateFields`. Keep `finding=` first so existing `finding=` substring probes stay valid.

**D3 (medium) — Closed reason vocabulary is mostly unused.**
`COUNT_REASONS` (≈l.89–96) lists `counting_command_failed`, `score_not_improved`, `before_count_mismatch`, `after_count_mismatch`. None is passed at their sites: R4 (≈l.425), R5 (≈l.611), R6 (≈l.613), R7 (≈l.614) still call `fail` with two args. Either pass them or remove them; unused vocabulary contradicts the comment "a caller can assert the intended cause".

**D4 (medium) — Receipts conflate marker applicability with leaked/absent outcome.**
Selftest line (≈l.1008): `no_marker=${test.noMarker ? (leaked ? 0 : 1) : 0}` — `0` means both "not applicable" and "marker leaked". Hard-coded `no_marker=0` at the committed-count line (≈l.1021) and the witness-comparison line (≈l.1033), which both have real marker data (`newMarker`, `oldMarker`) that is never used. Fix: emit `marker_applicable=<0|1> marker_absent=<0|1|na>`, where applicable is a **static** property (command text contains `COUNT_WITNESS_MARKER`) and absent is the runtime `!existsSync`.

**D5 (medium) — `count_malicious_option_injection_refused` marker assertion is vacuous.**
Its payload `git --git-dir=/var/tmp/other ls-tree … | grep round-marker.txt | wc -l` never references `.user-round14-count-marker`, yet the case sets `noMarker: COUNT_WITNESS_MARKER` (≈l.888–890). The "no marker" check can never fail for that payload, so the receipt implies a control that does not exist. Fix: mark it `marker_applicable=0` explicitly, and rely on the detail assertion for it. Applicability for the marker is proven only by the tee payload and its witness old-arm (`oldMarker` true, ≈l.836–880).

**D6 (medium) — Coverage gaps in the grammar.**
No case reaches R2, R5, R6, R8, R9, or the unsupported classes of trailing command, `$(…)`, `grep -v`, `..` path, `-`-leading pattern. These are the malicious shapes the grammar is supposed to refuse; they are currently refused by the regex only without any control proving it. See section 2 proposed cases.

**D7 (low / decision, not changed here) — Environment failures are classified as mismatches.**
`runCount` (≈l.425) maps `result.error` (spawn failure, timeout 30 s, maxBuffer 16 MiB) and any non-0/non-masked status (including the missing-revision 128) to `score_mismatch` exit 1. The comment at ≈l.421–423 frames this as "explicit", but a spawn/timeout failure is an evaluation failure, not a score mismatch, and would be `could_not_evaluate` exit 2 under the file's own convention (see ≈l.102, ≈l.627). Changing it alters an existing finding and therefore needs an explicit decision. Whatever the decision, `counting_command_failed` should be pinned by a case so the chosen class cannot silently change.

**D8 (low) — Dead refusal text.**
R3 (`Unsupported counting command: …`, ≈l.415) is unreachable from `check`, the committed-count selftest, and the witness, because `parseScore` (R1) rejects every unsupported command first and runCount is only called on parsed commands. Either remove it or route it through the same reason id as R1. No CLI test can reach it.

**D9 (low) — Witness pass ignores cause.**
`runCountWitness` pass condition (≈l.845–851) and the comparison line (≈l.1025–1033) require `newArm.finding === 'score_mismatch'` and `!newMarker`, but not the reason or detail. The legacy shell arm's `oldMarker` is the only runtime applicability proof in the file; the new arm's cause is unverified. Fix: require `newArm.reason === 'unsupported_counting_command'` and the literal detail for `${id}` in the witness pass.

## 4. Proposed test shape (for CounterDiagnostics; not implemented here)

Per case, a literal tuple: `{ name, mutate, exit, finding, reason, detail, markerApplicable, markerAbsent }`. Match on the single parsed line, not substrings:

`USER_ROUND_CONTRACT verdict=(failed|could-not-evaluate|clean) finding=(\S+) reason=(\S+) detail=(.*)$`

Pass requires `exit === test.exit`, `finding === test.finding`, `reason === (test.reason ?? 'none')`, `detail === (test.detail ?? <clean line>)`, and marker fields as derived above. Print each SELFTEST line with `expected_* / actual_*` for exit, finding, reason, and detail (JSON-quoted detail), plus `marker_applicable` and `marker_absent`. Keep the `verdict=clean` path for clean cases.

Pass-through contract for `fail()`: an unknown reason already raises `could_not_evaluate` exit 2 (≈l.99–101); add one selftest case that passes an unlisted reason to prove this, or document it as unreachable.

## 5. Verification gaps (not run)

- No run of `--self-test`, `--count-witness`, or the production check. Every expected line above is derived, not observed.
- The git behaviors used in the derivations are `[INFERENCE: not run]`: `git ls-tree` on the all-zero object exits 128; `git grep` exit 1 on no-match with an existing path; `git grep` on a nonexistent pathspec exits 1.
- The in-flight diff is still changing; the reason vocabulary and call sites may be edited under this report.
- The ROUND gate (`scripts/check-round-contract.mjs`) carries a richer shell-syntax grammar with its own refusal texts (≈l.296–368). Not audited here; parity between the two gates is unverified.

## 6. Commands L1 should run after integration (not run by this seat)

- `node scripts/check-user-round-contract.mjs --self-test` — expect the new per-case SELFTEST lines to carry `expected_reason`/`actual_reason` and exact `detail` matches; expect `count_malicious_option_injection_refused` to print `marker_applicable=0`.
- `node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` — expect `new_reason=unsupported_counting_command` and the literal detail for `user-20261015-r01`.
- Confirm that `count_missing_revision_red` asserts `reason=counting_command_failed` and the literal `Counting command failed:` detail, not `score_mismatch` alone.
- `grep -n "fail('score_mismatch'" scripts/check-user-round-contract.mjs` — confirm no counting site remains reasonless (after R4–R7 are assigned).

## 7. Coordination

- Code-related findings (D1–D9) sent to `TabiR15.CounterDiagnostics`, the owner of `scripts/check-user-round-contract.mjs`.
- Summary pointer sent to `TabiR15`.
- No ROUND-gate edits proposed; no SHONEN, SKILL, LOG, SCORECARD, or QUALITY edits proposed.
