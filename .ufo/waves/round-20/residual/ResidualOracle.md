# Residual Oracle Review — Round 20 C1

## Counterexample

None found in the requested 45 persisted fixture pairs. Static review only; no evaluator, counter, selftest, build, or full suite was run.

## Evidence

- `selftest-c1.mjs:129-163` loads the persisted expected file as fixed `count`/`exit`/`findings` values, validates the closed reason vocabulary and exact case-name set, and does not derive expected values from `evaluate`. `:401-413` compares evaluator output against those loaded values; `:419-435` loads the oracle before evaluating each freshly built fixture. `CASES` has the 45 named fixtures at `:353-399`; `expected.json:40-355` contains the corresponding fixed triples.
- Scope literal agrees across `measure-c1.mjs:76`, `selftest-c1.mjs:37-47`, `design.json:131-132`, and the current manifest at `decisions.json:9`. The deliberate `wrong_scope` pair is `12 / 1 / [scope_mismatch]` (`expected.json:125-137`), matching `checkManifestTop` at `measure-c1.mjs:295-302`.
- Corrected-heading pairs agree with `checkTable` at `measure-c1.mjs:408-493`: `corrected_heading_historical_rows` is clean while stale rows remain in the original section; `corrected_section_row_mismatch` yields `table_row_extra` plus `table_row_missing`; two corrected headings yield only `table_heading_duplicate` and follow the original-heading fallback. The malformed `| LC05 (repeat) |` under the unique corrected section yields `table_row_extra` because candidate recognition is the broad `LC_ROW` at `:100` and section comparison is at `:441-460`.
- Authority-loss expectations match the effective-source and anchor control flow (`measure-c1.mjs:324-405,378-388,541-568,570-592`). `wrong_decision_source_override` (S099, no row) yields only `decision_source_mismatch`; absent/forced-S096 LC11 yields `decision_source_mismatch` plus `decision_anchor_uncovered`; the intentionally mismatched table adds `table_row_extra` and `table_row_missing`. `wrong_source_id` correctly keeps only `decision_source_mismatch` and `source_mismatch`: its table follows S097, while the note still contains S096/S100 tokens and both pinned registry rows/backlinks remain unchanged. These fixed triples are at `expected.json:168-215` and `:189-207`.
- Anchor-error distinctions agree with `declaredRanges` and `checkDecisionAnchor` (`measure-c1.mjs:241-253,378-388,541-563`). A valid but non-covering S096/S100 range yields only `decision_anchor_uncovered` (`expected.json:258-270`). Malformed, missing, or trailing-junk S100 range clauses yield only `registry_row_invalid` (`expected.json:272-278,343-354`): a null parse is rejected before span coverage can add an uncovered finding. The LC12 817–830 gap case correctly combines `span_invalid` with `decision_anchor_uncovered` (`expected.json:308-312`).
- The remaining closed-finding cases also agree with the static branches: malformed manifest count 0; duplicate/unknown decision counts 13; missing decision count 11; all other complete-manifest edits preserve count 12. The count and exit rules are `measure-c1.mjs:211-213,281-284,593-609`; the persisted oracle has 45 entries and covers all 24 declared findings (`expected.json:14-38`; loader check `selftest-c1.mjs:143-163`).

## Impacted axes

- Oracle correctness: no contradictory fixed pair found.
- Provenance/scope: expected fixtures retain the exact source-only round-20 scope and do not promote runtime evidence.
- Parser-boundary precision: corrected-heading fallback and valid-uncovered versus invalid-anchor distinctions are reflected in the pairs.

## Smallest safe correction

None warranted by this review. The reviewed expectations are internally consistent with the final counter. This is static review, not test execution or exhaustive grammar assurance.