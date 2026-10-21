# CounterMirrors: round-20 C1 counter, selftest and expected pairs (author-side review)

Trailer: `Report: .ufo/waves/round-20/w2/CounterMirrors.md`

## Scope and pin

- Pin `4ae99816b8994fdedc159156d8d9d242dd5c4782` equals HEAD. The three audited files are byte-identical to the pin in the working tree (`git diff --stat <pin>` empty). Untracked `w1/outcome.json` and `w2/` are not inputs.
- Read-only. Nothing executed: no selftest, no CLI run, no tests. Reads used: `git show` / `ls-tree` / `cat-file`, `sha256sum`, one live re-fetch of the pinned Gitiles URL (`curl | base64 -d | sha256sum`), `jq` projection over the note and manifest, and the read/grep tools.
- sha256 at pin: design.json `1c9f536e…` (equals `design.sha256` in expected.json); html_form_element.cc `8c8d6796…` (equals the selftest PIN, the registry anchors, and the live re-fetch; 68278 bytes, equal to `source-opening.json` `decodedBytes`); measure-c1.mjs `fab3bde4…`; selftest-c1.mjs `5804cf6a…`; expected.json `458a9f3f…`.
- Mechanical row validation only. Semantic truth of rows, the depth scalar, and runtime or capability claims are not evaluated. The SKILL mirror (`lifecycle-skill-section.txt`) is not a counted input and is not checked here.

## Verdict

- **F1 (High, blocking).** 4 of 34 persisted pairs contradict the producer as written: cases 19, 22, 23, 25. By trace, `selftest-c1.mjs` prints `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20` and exits 1. `run-checks.py:62-64` runs `measure-c1.mjs --selftest` with `expectedExit: 0`, so that serial row fails.
- **F2 (High).** 4 of the 24 closed `FINDING` ids have no red case. Two of them guard the admission invariant.
- **F3 (Medium).** The vocabulary check in the selftest is one-directional, so F2 passes silently.
- Static checks of the real inputs at the pin are clean (§5). Predicted CLI result at the pin: `clean`, count 12, exit 0. Untested.

## F1. Expected pairs for cases 19, 22, 23, 25 contradict the producer

| case (expected.json line) | persisted expected findings | producer trace |
|---|---|---|
| 19 `wrong_source_id` (163-169) | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch |
| 22 `wrong_decision_source_override` (184-190) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch |
| 23 `missing_decision_source_override` (191-197) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |
| 25 `forced_s096_lc11` (205-211) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |

Why the producer cannot emit the extra findings:

- `registry_backlink_missing` has two emission sites: measure-c1.mjs:521 (inside `checkContractRow`, which runs only for the S096 and S100 rows, lines 549-551) and :547 (note token check). In all four cases the S096 and S100 rows are unchanged, and their used-by still names the note (`renderRegistry`, selftest :252-263; `state.usedBy`, :292). The note's Sources line still cites S096 and S100, so :547 does not fire.
- `decision_anchor_uncovered` is emitted only at :385, through `checkDecisionAnchor` (:376-379). That function returns silently when the effective source has no registry row. In case 22 the effective source is S099, which has no row, so nothing fires.
- In case 19 the 11 non-LC11 decisions have effective source S097, which has no row, so the anchor check is silent there too.
- Internal inconsistency, independent of the trace: cases 23 and 24 differ only in the note's LC11 row text. Neither the registry nor the citation check reads that text. Case 24 (`override_table_mismatch`) expects no backlink finding; case 23 expects one. Both cannot be right. Cases 23 and 25 have identical notes and manifests except for an explicit `sourceId`, and the S096 row exists and names the note.
- The selftest's own rule (selftest :308-309: each negative case differs from baseline by exactly one mutation) is violated. The mutation text for 19, 22, 23 and 25 names no registry change. The lists for 22, 23 and 25 are identical, which suggests a copy-paste slip [INFERENCE].

Corrected pairs, consistent with the producer. Finding ids and the vocabulary (20) are unchanged. `registry_backlink_missing` stays exercised by cases 21 and 28, and `decision_anchor_uncovered` by 23-25 and 32-33.

- 19: exit 1, count 12, `[decision_source_mismatch, source_mismatch]`
- 22: exit 1, count 12, `[decision_source_mismatch]`
- 23: exit 1, count 12, `[decision_anchor_uncovered, decision_source_mismatch]`
- 25: exit 1, count 12, `[decision_anchor_uncovered, decision_source_mismatch]`

Rejected alternative: add a backlink check for unregistered effective sources. That is new producer behaviour, which is a contract change, not a fix to the pairs. Case 23 would still be wrong under it, because its S096 row does name the note. The pinned-id check already reports an unregistered effective source through `decision_source_mismatch`.

## F2. Four closed finding ids have no red case

Uncovered ids and their emission sites in measure-c1.mjs:

- `decision_shape`: :324, :327, :331, :338, :346, :354, :360
- `decision_unknown_id`: :334
- `decision_text_invalid`: :349
- `table_heading_duplicate`: :413

Why this is more than coverage:

- Admission is exit 0. The CLI verdict (:746-748) is `clean` when exit is 0 and count is non-zero, and count is `decisions.length` (:210-212). With no findings, count is 12 only because `decision_unknown_id` and `decision_shape` reject extra or non-object entries. If either check regressed, a 13-entry manifest would be admitted as `clean`.
- `decision_text_invalid` is the only check on the design rule "no pipe inside cells" (design.json `skillRendering`). A pipe in a condition still matches its note row exactly, so a regression would pass silently.

Recommended red cases. Expectations are hand-derived from the producer, not executed. Each isolates one id. Each needs a CASES entry and an expected.json entry, because the case set must equal CASES (selftest :160).

- R1 `decision_unknown_id`: push `{...LC05, id:'LC13'}` and set `omitRows` to `['LC13']`. Expect count 13, exit 1, `[decision_unknown_id]`. The omitted row matters: without it, the LC13 row becomes a `table_row_extra`.
- R2 `decision_shape`: add an extra key `note: 'x'` to LC05. Expect count 12, exit 1, `[decision_shape]`.
- R3 `decision_text_invalid`: set LC06 condition to `CancelTool | is called while the tool is running`. The note row is rendered from the same state. Expect count 12, exit 1, `[decision_text_invalid]`.
- R4 `table_heading_duplicate`: append a second copy of the heading after the table, with no rows. Expect count 12, exit 1, `[table_heading_duplicate]`.

## F3. Vocabulary check is one-directional

`loadExpected` asserts reasons ⊆ FINDING_IDS (selftest :145) and reasons = exercised set (:161). It never asserts FINDING_IDS ⊆ reasons. That is why F2 passes silently. Recommended: after R1-R4, add `if (!sameList(vocabulary, [...registered].sort())) fault('expected_vocabulary_incomplete')`. Then any future finding id forces a red case.

## F4. Branch gaps not covered by any case (not closed-id gaps, not blocking)

- `table_row_extra` via the outside-section branch (measure-c1.mjs:436-439). Only the in-section over-count is covered (case 24). Suggested: append an LC row after an extra `## ` heading. Expect count 12, exit 1, `[table_row_extra]`.
- Manifest `source.sha256` mismatch (`sourceRecordMatches` :290). Only id, path and url are covered (cases 18, 19, 20). Suggested: wrong sha, expect `[source_mismatch]`, count 12, exit 1.
- `manifest_shape` for non-array `decisions` (:297) or extra top-level keys (:294). Suggested: `"decisions": {}`, expect count 0, exit 1, `[manifest_shape]`.
- Registry parse failures (:458-493): registry absent, no `## Registry`, missing column. Suggested: registry absent, expect count 12, exit 1, `[registry_row_invalid]`.
- S096 row branches in `checkContractRow` (missing row, url, status, sha, malformed anchor). Only the S100 twins and the S096 backlink are covered. Suggested: S096 row absent, expect `[registry_row_invalid]`.
- Manifest not a plain object, and non-UTF-8 bytes (:191-207, :204). Both reach `manifest_malformed`. Optional.
- CLI reasons `usage`, `revision_unresolved`, `git_failed`, `entry_not_regular`, `selftest_unavailable`, and verdicts `baseline` and `clean`. No selftest reaches them, because `runSelftest` and `main` are CLI-only. Covered only by main's CLI runs (§7).

## F5. Comment and semantics

- measure-c1.mjs:374-375 says a missing or duplicate row "is reported by the registry checks". The registry checks run only for S096 and S100 (:549-551). For any other effective source the only signal is `decision_source_mismatch`, and the anchor check silently returns. Behaviour is safe for pinned ids. The comment is wrong for other ids.
- `registry_backlink_missing` at :547 is a note-token check, not a registry backlink. Table rows always cite S096 or S100, so the check fires only for a note with no such token. The name is misleading; behaviour is acceptable.
- RUNTIME_WORDING (:108, :350) scans manifest condition and outcome only. Note prose is not scanned, including the History section, which discusses round-17 runtime observations. This is by design. The "not a runtime claim" statement is semantic, not mechanical.
- The selftest quotes deliberately differ from the manifest quotes for LC03, LC06, LC07, LC09 and LC10. Both sets were checked literal in span (§5). This is consistent with selftest :56 ("no fixture reads topic text").

## F6. Pins and gates

- design.json `1c9f536e…` is recorded in expected.json and in the selftest header (selftest :12-13). The selftest never reads design.json; a grep finds only comments. It is documentation, not an enforced pin.
- The selftest reads the retained blob from the working tree (selftest :122) and checks its digest in preflight (:168). It is content-bound, not revision-bound. The CLI reads committed blobs.
- The selftest's registry and note fixtures are synthetic by design (selftest :33-35). The real `corpus/SOURCES.md` and note are checked only by the CLI, so I checked them statically (§5).
- Consumer: `run-checks.py:62-64` (round20 cohort, `expectedExit: 0`). F1 makes that row fail.

## 5. Static checks that came back clean (not executed)

- Spans: PINNED_DECISIONS (producer :82-93), design.json decisions, selftest DECISIONS (:58-69) and manifest decisions agree for all 12 ids. LC11 is 787-815 with S100; the others are 181-830 with S096.
- Quotes: all 12 selftest quotes and all 12 manifest quotes are literal inside their span. Source lines: LC01 182, LC02 197, LC03 251 (manifest) and 253 (selftest), LC04 217, LC05 220, LC06 228 (manifest) and 227 (selftest), LC07 266 (manifest) and 263 (selftest), LC08 295, LC09 311, LC10 326, LC11 810, LC12 829. The source has no CR bytes. Every quote is at most 25 words; the longest is LC11 at 8 words.
- Manifest decision text: no `|`, no newline, no RUNTIME_WORDING hit.
- Note (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md`): heading equals TABLE_HEADING exactly, once (line 25). 12 LC rows at lines 29-40, all inside the section that ends at `## Finite sample` (line 46). Each row exactly equals `renderRow(manifest decision)` (jq exact-line match: 12 of 12, plus heading 1, total LC rows 12).
- Registry (`corpus/SOURCES.md`, rows at lines 110 and 114): S096 and S100 each carry the pinned URL as a whitespace token in the source cell, the exact `decoded sha256 8c8d…` part in the anchor, status `mined`, and used-by naming the note. S096 declares `174-328,729-758,818-842`, which covers every S096 span including LC12 818-830. S100 declares `174-328,635-842`, which covers LC11 787-815. The S100 teaches cell starts with `supersedes S096 — ` with U+2014, matching `SUPERSEDES_PREFIX`.
- Source pin: the live re-fetch of the pinned tag URL, base64-decoded, gives sha256 `8c8d6796…`. The working-tree blob and the commit blob have the same digest and byte count.
- Predicted at the pin: `measure-c1.mjs 4ae99816…` gives verdict clean, count 12, exit 0. Predicted for the baseline `c4992943…`: verdict baseline, count 0, exit 0, because manifest and note are pure additions in 4ae9981. Both untested.

## 6. Pair trace, all 34 cases

Format: count / exit / findings. Mismatches marked.

| # | case | expected | producer trace | |
|---|---|---|---|---|
| 1 | valid_all12 | 12/0/[] | 12/0/[] | ok |
| 2 | baseline_absent0 | 0/0/[] | 0/0/[] | ok |
| 3 | partial_manifest_without_note | 12/1/[partial_state] | same | ok |
| 4 | partial_note_without_manifest | 0/1/[partial_state] | same | ok |
| 5 | manifest_malformed_json | 0/1/[manifest_malformed] | same | ok |
| 6 | wrong_manifest_schema | 12/1/[manifest_shape] | same | ok |
| 7 | source_digest_edit | 12/1/[source_digest_mismatch] | same | ok |
| 8 | source_absent | 12/1/[source_missing] | same | ok |
| 9 | quote_mismatch | 12/1/[quote_mismatch] | same | ok |
| 10 | invalid_quote_empty | 12/1/[quote_invalid] | same | ok |
| 11 | invalid_quote_26_words | 12/1/[quote_invalid] | same | ok |
| 12 | invalid_span_reversed | 12/1/[span_invalid] | same | ok |
| 13 | wrong_scope | 12/1/[scope_mismatch] | same | ok |
| 14 | runtime_wording | 12/1/[runtime_wording] | same | ok |
| 15 | duplicate_id | 13/1/[decision_duplicate_id] | same | ok |
| 16 | missing_table_row | 12/1/[table_row_missing] | same | ok |
| 17 | missing_manifest_decision | 11/1/[decision_missing] | same | ok |
| 18 | wrong_source_url | 12/1/[source_mismatch] | same | ok |
| 19 | wrong_source_id | 12/1/[decision_source_mismatch, registry_backlink_missing, source_mismatch] | 12/1/[decision_source_mismatch, source_mismatch] | MISMATCH |
| 20 | wrong_source_path | 12/1/[source_mismatch] | same | ok |
| 21 | missing_registry_backlink | 12/1/[registry_backlink_missing] | same | ok |
| 22 | wrong_decision_source_override | 12/1/[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing] | 12/1/[decision_source_mismatch] | MISMATCH |
| 23 | missing_decision_source_override | 12/1/[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing] | 12/1/[decision_anchor_uncovered, decision_source_mismatch] | MISMATCH |
| 24 | override_table_mismatch | 12/1/[decision_anchor_uncovered, decision_source_mismatch, table_row_extra, table_row_missing] | same | ok |
| 25 | forced_s096_lc11 | 12/1/[decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing] | 12/1/[decision_anchor_uncovered, decision_source_mismatch] | MISMATCH |
| 26 | s100_row_missing | 12/1/[registry_row_invalid] | same | ok |
| 27 | s100_status_not_mined | 12/1/[registry_status_invalid] | same | ok |
| 28 | s100_backlink_missing | 12/1/[registry_backlink_missing] | same | ok |
| 29 | s100_teaches_not_supersedes | 12/1/[registry_row_invalid] | same | ok |
| 30 | s100_url_mismatch | 12/1/[registry_row_invalid] | same | ok |
| 31 | s100_digest_mismatch | 12/1/[registry_row_invalid] | same | ok |
| 32 | wrong_anchor_s100 | 12/1/[decision_anchor_uncovered] | same | ok |
| 33 | wrong_anchor_s096 | 12/1/[decision_anchor_uncovered] | same | ok |
| 34 | malformed_anchor_s100 | 12/1/[registry_row_invalid] | same | ok |

Case names match CASES exactly (34 of 34). `reasons` is sorted and every entry is in FINDING_IDS. The expected pairs are static and not generated from producer output: four disagreements could not exist if they had been recorded from it. Cases 7 and 8 depend on the retained blob only through its digest (case 7 edits a copy) and its presence (case 8 removes a copy). Preflight checks the retained blob's digest before any case, so a changed blob exits 2 rather than changing a pair.

## 7. Verification gaps, for main to run once (not run by me)

1. `node .ufo/waves/round-20/selftest-c1.mjs`. Expect `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, with four `FAIL_DETAIL` lines for cases 19, 22, 23, 25. This is trace-derived and untested.
2. `node .ufo/waves/round-20/measure-c1.mjs 4ae99816b8994fdedc159156d8d9d242dd5c4782`. Expect verdict clean, count 12, exit 0. Untested.
3. `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb`. Expect verdict baseline, count 0, exit 0. Untested.
4. After the F1 correction and R1-R4, run the selftest again. Expect `verdict=clean cases=38 reasons=24`.

Not verified: semantic truth of any row, the LC11 branch claims, the S096 teaches text, runtime behaviour, and any capability or depth claim.

## 8. Tools

No tool installed or upgraded. Read-only use of git, sha256sum, curl and base64 (one re-fetch of the pinned tag URL), jq (projection only), and the read and grep tools.
