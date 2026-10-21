# CounterMissingId: round-20 C1 decision_missing / exact-12 review

Author-side review, not external closure. Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Files: `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`.

## Pins and method

- Committed blob equals working tree for all three files. sha256: measure-c1 `fab3bde4…80a6`, selftest `5804cf6a…44a5`, expected `458a9f3f…44d1`. The only untracked path is `.ufo/waves/round-20/w2/`.
- Source `corpus/evidence/round-20/sources/html_form_element.cc` = pin `8c8d6796…6916`. `design.json` = `expected.design.sha256` pin `1c9f536e…a1da`.
- Method: file reads, read-only JSON and grep queries, `git show` and `sha256sum`. No code, tests, or builds were run. Every conclusion below is by inspection and untested.
- No installs or updates.
- No claim on semantic truth of any row, the depth scalar, or runtime capability. "Exact 12" means exact membership of the pinned finite sample. It is not a claim that the lifecycle domain is complete.

## Verdict

1. **decision_missing logic is correct.** It fires iff a pinned id has zero counted entries (`checkDecisions`, `if (count === 0)`). Exit 0 occurs only when both inputs are absent (count 0) or when exactly the 12 pinned ids each appear once (count 12). No partial state exits 0.
2. **Blocking: 4 of 34 persisted pairs cannot be produced by the committed counter** (F1). Predicted selftest result: `verdict=failed cases=34 reasons=20`, exit 1.
3. **Coverage gap.** `decision_missing` is exercised by one fixture only (`missing_manifest_decision`, count 11). Count-12 membership errors, present-but-empty decisions, and unknown ids are never exercised. 4 of 24 `FINDING_IDS` have no red case (F3).
4. **Real sample (corpus, outside the selftest).** The manifest has 12 unique pinned ids in order. Spans and sourceIds equal `design.json` and `PINNED_DECISIONS`. All 12 quotes are literal inside their pinned spans (checked at source lines 182, 197, 217, 220, 228, 251, 266, 295, 311, 326, 810, 829). The S096 and S100 registry rows pass the mechanical checks. The manifest contains no pipes. Not machine-compared: byte equality of the 12 note rows against the manifest rows (eyeballed only).

## F1 (blocking): persisted findings disagree with the committed counter

| case | persisted findings | counter-derived findings | difference |
|---|---|---|---|
| `wrong_source_id` | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | extra `registry_backlink_missing` |
| `wrong_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | extra `decision_anchor_uncovered`, `registry_backlink_missing` |
| `missing_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | extra `registry_backlink_missing` |
| `forced_s096_lc11` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | extra `registry_backlink_missing` |

Count and exit match for all four. Only the findings differ.

Why the counter cannot emit the extra findings:
- `registry_backlink_missing` is emitted only at `checkContractRow` (used-by lacks the note) and `evaluateComplete` (note lacks token S096 or S100). Both are at lines 521 and 547. In these fixtures the S096 and S100 rows are unchanged, and the Sources line still cites both ids.
- `decision_anchor_uncovered` is emitted only at `checkDecisionAnchor` (line 385). That function returns silently when the effective source has no registry row (`if (matches.length !== 1) return;`). S097 and S099 have no fixture row. Such decisions are caught by `decision_source_mismatch` (line 340).

Predicted runner output (format from `compare`):
```
FAIL_DETAIL case=wrong_source_id findings=[decision_source_mismatch,source_mismatch] want=[decision_source_mismatch,registry_backlink_missing,source_mismatch]
FAIL_DETAIL case=wrong_decision_source_override findings=[decision_source_mismatch] want=[decision_anchor_uncovered,decision_source_mismatch,registry_backlink_missing]
FAIL_DETAIL case=missing_decision_source_override findings=[decision_anchor_uncovered,decision_source_mismatch] want=[decision_anchor_uncovered,decision_source_mismatch,registry_backlink_missing]
FAIL_DETAIL case=forced_s096_lc11 findings=[decision_anchor_uncovered,decision_source_mismatch] want=[decision_anchor_uncovered,decision_source_mismatch,registry_backlink_missing]
MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20   (exit 1)
```

Resolution (design owner decides):
- (a) Recommended. Keep the counter as written and correct the four persisted findings lists to the counter-derived sets above. The vocabulary is unchanged because both reasons remain exercised elsewhere.
- (b) Alternative. If decision-level backlink semantics are intended, define them in the counter, add fixture rows for S097 and S099, and re-derive all four expectations.

## F2 (medium): decision_missing red coverage

- The only fixture that reaches `decision_missing` is `missing_manifest_decision`: count 11, LC12 removed from manifest and table.
- By trace, these mutations leave all 34 persisted pairs unchanged, so no case catches them:
  - M1: `decision_missing` gated on `decisions.length < 12`. No count-12 fixture lacks a pinned id.
  - M2: `decision_missing` suppressed when decisions is `[]`. No present-but-empty fixture exists. This is the boundary that keeps count 0 meaning "both absent".
  - M3: `decision_unknown_id` emission removed (line 334). No fixture uses an unknown id.
  - M4: `decision_shape` emissions removed (lines 324–360). No decision_shape fixture exists.
- `decision_duplicate_id` is exercised only at count 13 (`duplicate_id`). A duplicate plus a missing id at count 12 is not exercised.

## F3 (medium): finite schema coverage

- `FINDING_IDS` has 24 entries. The persisted reasons have 20. Never exercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`. The runner requires each persisted reason to be registered and exercised. It does not require every registered id to be exercised, so the emitters for these four can be deleted with 34/34 still matching.
- Adding a case that emits a new reason requires adding that reason to `reasons`. The exercised set must equal the vocabulary. A case finding outside the vocabulary faults with exit 2.
- Other unexercised branches:
  - `decisions` not an array.
  - Heading absent (`table_row_missing` plus `table_row_extra`).
  - Registry section or columns absent.
  - Manifest top-level extra or missing key.
  - Non-string quote.
  - CLI-only reasons (`usage`, `revision_unresolved`, `git_failed`, `entry_not_regular`, `selftest_unavailable`) and verdict mapping.

## F4 (low): decision_missing semantics to document or pin

- It measures id presence, not validity. A pinned id on a malformed object still counts, so only `decision_shape` fires and `decision_missing` does not. A bare string or array entry counts for nothing, so `decision_missing` fires together with `decision_shape`.
- If `decisions` is not an array, the exact-12 check and the table comparison are both skipped. Only `manifest_shape` is reported and the 12 missing ids are not named. Exit 1 still holds.

## F5 (low, residual): partial-report scalar

- The CLI emits `c1_lifecycle_decisions` as a non-null integer for every evaluated run, including exit 1.
- A manifest-only state with 12 valid rows emits 12 with exit 1. So does a 12-row manifest with a duplicate and a missing id.
- Admission depends entirely on consumers gating on exit. The header documents this but the output does not enforce it.

## F6 (low): pins are not cross-checked at runtime

- The 12 ids, spans, and sourceIds are hard-coded in three places: `design.json`, `PINNED_DECISIONS` in measure-c1, and `DECISIONS` in selftest-c1. All three agree by reading. Nothing cross-checks them.
- `expected.design` (path and sha256) is never read. A stale design pin would pass silently.
- Baseline (manifest and note both absent) returns 0 with exit 0 before any other check, so source and registry state are ignored. This matches the header and is noted only for the boundary.

## Expected-pair trace

- 30 of 34 pairs match count, exit, and findings by trace. The 30 are: valid_all12, baseline_absent0, partial_manifest_without_note, partial_note_without_manifest, manifest_malformed_json, wrong_manifest_schema, source_digest_edit, source_absent, quote_mismatch, invalid_quote_empty, invalid_quote_26_words, invalid_span_reversed, wrong_scope, runtime_wording, duplicate_id, missing_table_row, missing_manifest_decision, wrong_source_url, wrong_source_path, missing_registry_backlink, override_table_mismatch, s100_row_missing, s100_status_not_mined, s100_backlink_missing, s100_teaches_not_supersedes, s100_url_mismatch, s100_digest_mismatch, wrong_anchor_s100, wrong_anchor_s096, malformed_anchor_s100.
- The persisted pairs are not circular. They were not recomputed from this counter, since 4 disagree. They look hand-derived, and those 4 are wrong.
- The expected.json source block matches the PIN and is checked at runtime (`expected_source_pin`). The blob sha is checked by preflight. Case names match CASES exactly (34 and 34).

## Recommended red cases (untested; predicted by trace)

Base is `valid_all12`. Each row is one delta.

| case | delta | count / exit | findings | defeats |
|---|---|---|---|---|
| `twelve_unknown_ids` | all ids → LX01…LX12; manifest and note from the same state | 12 / 1 | decision_missing, decision_unknown_id | count-only exact-12 (M1-class) |
| `lc12_slot_repeats_lc11` | LC12 entry → copy of LC11 (sourceId S100, span 787-815) | 12 / 1 | decision_duplicate_id, decision_missing | M1; duplicate at 12 |
| `decisions_empty_present` | manifest decisions `[]`; note has heading and zero rows | 0 / 1 | decision_missing | M2 |
| `lc12_renamed_lc13` | LC12 id → LC13; note mirrors | 12 / 1 | decision_missing, decision_unknown_id, table_row_extra | unknown-id path; typo partner of missing |
| `lc05_quote_key_absent` | delete LC05 `quote` key | 12 / 1 | decision_shape | decision_shape; malformed entry still counts |
| `lc05_string_manifest_only` | manifest LC05 entry → `"LC05"` via `manifestText`; note keeps valid row | 12 / 1 | decision_missing, decision_shape, table_row_extra | non-object entry |
| `lc06_outcome_pipe` | LC06 outcome contains `\|` | 12 / 1 | decision_text_invalid | uncovered reason |
| `heading_duplicated` | heading line repeated after the table | 12 / 1 | table_heading_duplicate | uncovered reason |
| `heading_absent` | heading line removed | 12 / 1 | table_row_extra, table_row_missing | heading-absent branch |
| `decisions_not_array` | manifest decisions `{}` | 0 / 1 | manifest_shape | documents F4 |

To add a case: add its name to `CASES` in selftest-c1.mjs and to `cases` in expected.json. Add any newly exercised reason to expected.json `reasons`, sorted.

Optional stricter invariant: require `reasons` to equal `FINDING_IDS`. That would force the four uncovered reasons to have red cases before the gate passes.

## Not verified

- Execution of the selftest, CLI, or gate. Main owns these.
- Byte equality of the note table against the manifest.
- Semantic truth of rows, depth scalar, and runtime or capability claims. Out of scope.

## Tooling

No installs or updates.

Report: .ufo/waves/round-20/w2/CounterMissingId.md
