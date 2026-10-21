# CounterUnknownId: round-20 C1 decision_unknown_id, population, fixture gaps

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Lane working tree matches the checkpoint for all round-20 paths (`git diff --stat` empty).

Pinned blob digests (sha256): `measure-c1.mjs` fab3bde4… (v3, 30974 B), `selftest-c1.mjs` 5804cf6a…, `expected.json` 458a9f3f…, `design.json` 1c9f536e… (matches pin), `html_form_element.cc` 8c8d6796… (matches pin).

Method: read-only git show, cat-file, grep and sha256sum. No code, tests or builds were run. Every expected-versus-actual result below is a hand trace of v3 against `expected.json`. Hand traces are `[INFERENCE]` until main runs the selftest once. Installs or updates: none.

## Summary

1. `decision_unknown_id` (`measure-c1.mjs` L120, L334) is not exercised by any of the 34 cases. Deleting its emission changes no case result. It is the only guard against an extra manifest decision with a non-pinned id when the note table is consistent.
2. The selftest would not pass at the checkpoint (hand trace). Four of 34 expected pairs disagree with v3. The cause is an unresolved backlink-rule conflict, not a typo.
3. Producer gap, currently a false clean: `LC_ROW` (L99) matches exactly two digits, so note rows such as `| LC013 |` escape `table_row_extra`.
4. Four registered ids are never exercised (`decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`). The runner's closure check (`selftest-c1.mjs` L145, L161) is one-directional.

## F1: decision_unknown_id leaves extra population unpinned (high, test gap)

- Only emitter: `checkDecision` L333–334. An unknown entry returns `null` and is skipped by `checkDecisions` (L391–392). `decisionCount` (L210) still counts it, so `c1_lifecycle_decisions = manifest.decisions.length`.
- No case contains an id outside LC01–LC12. `duplicate_id` duplicates LC05, which is pinned. The following mutants change no case result:
  - (a) delete L334;
  - (b) count only pinned entries;
  - (c) case-fold or trim ids in the lookup;
  - (d) let `renderable` accept non-pinned ids (its `PINNED_BY_ID.has` check).
- Consequence of (a) [INFERENCE]: 12 valid entries, one extra `LC13`, and a 12-row note give `findings=[]`, exit 0, `c1=13`, verdict `clean`. Current v3 correctly returns exit 1.
- Runner: `loadExpected` L145 checks persisted reasons are a subset of `FINDING_IDS`. L161 checks the union of case findings equals the persisted list. Nothing requires the persisted list to equal `FINDING_IDS`.

## F2: expected pairs disagree with the producer (high; selftest FAILs)

Hand trace of v3 against `expected.json`:

| case (expected.json line) | expected | v3 (hand trace) |
|---|---|---|
| `wrong_source_id` (L164) | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch |
| `wrong_decision_source_override` (L185) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch |
| `missing_decision_source_override` (L192) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |
| `forced_s096_lc11` (L206) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |

The other 30 pairs match (see Checked). Predicted runner line: `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1.

Root cause:
- v3 backlink logic is token-level (`citesToken`, L546–547) plus registry used-by (L520–521). The note keeps its Sources line in all four cases, so no backlink finding fires.
- The four expectations are the predicted sets in `w1/ExecCounter.md` (§Predicted fixture sets, L63–78). ExecCounter never executed anything. `w1/ExecFixtures-return.txt` L35 says the executor "never opened or copied measure-c1.mjs" and built the sets from messages.
- ExecCounter rule 8 (L50) is token-level and labelled "my reading". ExecCounter L86 (item 5) says "the note must cite S100 through its LC11 row", which is row-level.
- The predicted sets fit a row-level rule: each of S096 and S100 must be the source of at least one LC row in the note. That rule reproduces all four backlink entries. It also reproduces ExecCounter's unconditional prediction for `manifest_malformed_json` (L76). ExecFixtures flipped that case to token-level (expected L66–69) and called it "the most fragile expectation" (ExecFixtures L28).
- Absent cited row: v3 skips the anchor check (L378–379), so S099 yields no anchor finding. But `s100_row_missing` (expected `[registry_row_invalid]`) also cites an absent row. Any uniform rule changes one of those two expectations.

Decision for L1 (I recommend R):

- R, row-level. In `evaluateComplete`, replace L546–547 with: parse every LC_ROW in the note (any position), take the source prefix of cell 4, and require both S096 and S100 to appear. Otherwise emit `registry_backlink_missing`. Keep the absent-row skip. Expected edits (2 entries):
  - `manifest_malformed_json` → `[manifest_malformed, registry_backlink_missing]`, count 0, exit 1;
  - `wrong_decision_source_override` → `[decision_source_mismatch, registry_backlink_missing]`.
  - The other 32 pairs stay as persisted.
  - Why R: token-level passes a note whose prose names S096 while no decision cites it. That is exactly `wrong_source_id`, so the token check is hollow.
- T, token-level, no producer change. Expected edits (4 entries): drop `registry_backlink_missing` from `wrong_source_id`, `missing_decision_source_override` and `forced_s096_lc11`. Set `wrong_decision_source_override` to `[decision_source_mismatch]`.

Cases 1–12 give the same result under R and T. R counts LC rows in any position, so case 9 (heading removed) is unaffected.

## F3: note-table grammar gap (medium, real false clean)

- `LC_ROW = /^\|\s*LC\d{2}\s*\|/` (L99). A note-only row `| LC013 | … | S096:181-186 |` inside the section is ignored, not counted as extra. The case passes with exit 0 and `c1=12`. `LC1` and `LC100` behave the same way.
- The manifest side is strict: `LC013` gives `decision_unknown_id`. The note side is looser than the manifest.
- Fix: `^\|\s*LC\d+\s*\|`. Red case 12 fails under v3 until this is changed. That failure is a producer defect, not an expectation error.

## F4: coverage gaps (medium)

- Registered but unexercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate` (24 registered, 20 persisted).
- Unexercised branches (ids already listed or covered elsewhere):
  - checkDecision: non-object entry; missing or extra key; non-string id; non-string sourceId; non-string condition, outcome or quote; non-integer lines.
  - checkTable: heading absent; heading duplicated; LC row outside the section.
  - checkManifestTop: `decisions` not an array; manifest `source.sha256` alone wrong.
  - parseManifest: invalid UTF-8; top-level non-object.
  - parseRegistry: registry file absent; `## Registry` absent; column missing; S096 row missing or duplicated; S096 url, sha or range invalid; S096 status not mined.
  - Note tokens: S096 absent; S100 absent (the selftest always renders the Sources line, so only case 11 reaches this branch).
  - checkDecisionAnchor: S096 declared ranges malformed.
- Fix: add cases 1–12 below. In `loadExpected` add `if (!sameList(vocabulary, [...registered].sort())) fault('expected_vocabulary_not_closed')`. Update the persisted reasons to 24, sorted.

## Proposed red cases (hand trace under v3; same under R and T unless stated)

Base is `valid_all12`. "Row omitted" means `state.omitRows`.

| # | name | mutation | expect c1 / exit / findings | kills |
|---|---|---|---|---|
| 1 | `unknown_id_extra_decision` | push `{...LC05, id:'LC13'}`; LC13 row omitted | 13 / 1 / decision_unknown_id | delete L334; pinned-only count |
| 2 | `unknown_id_extra_decision_with_row` | as 1, LC13 row rendered | 13 / 1 / decision_unknown_id, table_row_extra | renderable accepts unknown ids |
| 3 | `unknown_id_replaces_pinned` | LC12 id → `LC13`, row rendered | 12 / 1 / decision_missing, decision_unknown_id, table_row_extra | exit gated on count |
| 4 | `unknown_id_case_variant` | push `{...LC05, id:'lc01'}`; row omitted | 13 / 1 / decision_unknown_id | case-folded lookup (would yield duplicate) |
| 5 | `decision_shape_non_string_id` | push `{...LC05, id:7}`; no row | 13 / 1 / decision_shape | non-string id dropped or treated as unknown |
| 6 | `decision_shape_extra_key` | LC01 gains key `notes` | 12 / 1 / decision_shape | key-set check |
| 7 | `decision_text_invalid_empty_condition` | LC03 condition `''` | 12 / 1 / decision_text_invalid | empty-text check |
| 8 | `table_heading_duplicate` | heading repeated after the rows | 12 / 1 / table_heading_duplicate | duplicate-heading check |
| 9 | `table_heading_missing` | heading removed | 12 / 1 / table_row_extra, table_row_missing | headings==0 branch |
| 10 | `table_row_outside_section` | LC01 row appended after a `## ` heading | 12 / 1 / table_row_extra | outside branch |
| 11 | `note_without_citations` | manifest malformed; note has no Sources line and zero rows | 0 / 1 / manifest_malformed, registry_backlink_missing | note-token branch (passes under T and R) |
| 12 | `table_row_nonstandard_id` | in-section row `\| LC013 \| … \|` added | 12 / 1 / table_row_extra | LC_ROW grammar; FAILS under v3 until F3 is fixed |

Case 1 is the main decision_unknown_id red case. Case 2 pins the table consequence. Case 3 pins the exit when the count looks right.

Harness changes needed: `renderNote` must take an optional extra heading (case 8), no heading (case 9), an out-of-section row (case 10), an extra raw row (case 12), and no Sources line (case 11). `renderManifest` must accept extra or replaced entries. Those are test-harness edits, not counter edits.

## Checked and consistent

- 30 of 34 expected pairs match v3 by hand trace: `valid_all12`, `baseline_absent0`, both `partial_*`, `manifest_malformed_json` (as persisted), `wrong_manifest_schema`, `source_digest_edit`, `source_absent`, `quote_mismatch`, both `invalid_quote_*`, `invalid_span_reversed`, `wrong_scope`, `runtime_wording`, `duplicate_id`, `missing_table_row`, `missing_manifest_decision`, `wrong_source_url`, `wrong_source_path`, `missing_registry_backlink`, `override_table_mismatch`, `s100_row_missing`, `s100_status_not_mined`, `s100_backlink_missing`, `s100_teaches_not_supersedes`, `s100_url_mismatch`, `s100_digest_mismatch`, `wrong_anchor_s100`, `wrong_anchor_s096`, `malformed_anchor_s100`.
- Pinned spans agree across `PINNED_DECISIONS` (measure) and `DECISIONS` (selftest): LC01 181–186, LC02 189–210, LC03 249–258, LC04 212–218, LC05 218–221, LC06 224–229, LC07 261–275, LC08 290–298, LC09 298–319, LC10 320–327, LC11 787–815 (S100), LC12 818–830. The real manifest matches all twelve. Real-note span cells were read for LC01–LC06 and LC08–LC11 only; the LC07 and LC12 rows are truncated in the view.
- The S096 declared ranges (174–328, 729–758, 818–842) agree in the selftest and in the real registry. The real S100 row declares 174–328, 635–842, which covers 787–815.
- All 12 selftest quotes appear inside their pinned spans, so preflight does not fault. Grep line evidence: LC01 L182, LC02 L197, LC03 L253, LC04 L217, LC05 L220, LC06 L227, LC07 L263, LC08 L295, LC09 L311, LC10 L326, LC11 L810, LC12 L829.
- Real corpus at the checkpoint (not executed): manifest has 12 entries, LC01–LC12 each once, with `sourceId` only on LC11 (`S100`). The note has 12 LC rows under the exact heading. Every real quote is literal in its span (LC03 at L251 inside 249–258). S096 used-by lists both notes; S100 used-by lists the round-20 note. Expected clean result: count 12, exit 0.
- `expected.json` `design` block (sha 1c9f…) matches the design blob. The runner never checks it, so it is unverified metadata.

## Not verified

- Nothing executed. Every expected result above is a hand trace.
- Row-by-row equality between the real note and the rendered manifest rows was not checked. Span cells were read for LC01–LC06 and LC08–LC11 only.
- The 26-word quote in `invalid_quote_26_words` is derived from source lines 298–319 by the selftest's own tokenizer; I did not hand-count it.
