# CounterManifestShape: round 20 C1 closed manifest, malformed JSON, round key

Seat: TabiR20.CounterManifestShape (author-side; not external closure).
Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Files: `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`, and the counted inputs they read (`corpus/evidence/round-20/lifecycle/decisions.json`, `.ufo/waves/round-20/design.json`, the S096 source blob).

Method: committed blobs read with `git show 4ae9981:<path>`; read-only `sha256sum`, byte counts, per-key counts, and `read` of source spans. Working-tree digests equal checkpoint digests for all six files. No code, tests, or builds were run. Every derived result below is by inspection, not execution. No tools installed or updated. Findings are mechanical only; nothing here is a semantic, depth-scalar, or runtime claim.

## Bottom line

1. **Checkpoint selftest is red by inspection.** 4 of 34 persisted expected pairs are not produced by the committed producer: `wrong_source_id`, `wrong_decision_source_override`, `missing_decision_source_override`, `forced_s096_lc11` (F1). The other 30 match an independent derivation, including the `valid_all12` positive control.
2. **Counted artifact passes top-level closure by inspection.** `decisions.json` has exactly the keys `{schema, source, scope, decisions}`. Schema, scope, and source equal the producer pins and `design.json`. Each decision key appears once per object. Bytes are ASCII, with no BOM and no CR. All 12 quotes are literal substrings of their spans.
3. **Malformed-JSON gap:** duplicate object keys are accepted, last one wins, at every depth (F2). No case covers it.
4. **Finite-vocabulary gap:** 4 of 24 `FINDING_IDS` have no red case, and the loader does not require the registered set to equal the persisted set (F3).
5. **No red case for top-level key-set violations**, non-object roots, empty or non-UTF-8 bytes, or source-object drift (F4).
6. **No round key** exists in the manifest. The closed set equals `design.json` `manifestShape` (section R).

## F1: HIGH: four expected pairs disagree with the committed producer

Evidence. The backlink check in `evaluateComplete` is whole-text: `citesToken(noteText, 'S096')` and `citesToken(noteText, 'S100')`. The selftest's `renderNote` always emits a prose line `Sources: S096 (...); S100 (...)`, so the check passes in every case. The four disputed pairs need the id to be absent from the note, but in each case it appears only in that prose line:

| case | id cited by table rows | id cited only by prose | expected extra | producer |
|---|---|---|---|---|
| wrong_source_id | S097 x11, S100 x1 | S096 | registry_backlink_missing | not emitted |
| wrong_decision_source_override | S096 x11, S099 x1 | S100 | registry_backlink_missing, decision_anchor_uncovered | not emitted |
| missing_decision_source_override | S096 x12 | S100 | registry_backlink_missing | not emitted |
| forced_s096_lc11 | S096 x12 | S100 | registry_backlink_missing | not emitted |
| override_table_mismatch (matches) | S096 x11, S100 x1 | none | none | none |

Anchor finding. `checkDecisionAnchor` returns silently when no registry row matches the effective id. Its comment says a missing row "is reported by the registry checks, not here." `wrong_source_id` (effective S097, no row) expects no anchor finding, but `wrong_decision_source_override` (effective S099, no row) expects one. The two expectations contradict each other. Neither mutation text in `expected.json` mentions a backlink or anchor change.

Impact. Count (12) and exit (1) agree in all four cases; only the reason set differs. The real run is unaffected: the committed note's table rows cite S096 for LC01 to LC10 and LC12, and S100 for LC11.

Recommendation (main decides before the gate):
- (a) Make the backlink check row-level inside `checkTable`. Count in-section table rows per pinned id (S096, S100); a zero count yields `registry_backlink_missing`. Delete the whole-text `citesToken` check. `checkTable` already runs only on a parsed manifest with an array, so `manifest_malformed_json` stays `[manifest_malformed]`. With (a), the three backlink pairs reproduce; `valid_all12`, `override_table_mismatch`, `missing_table_row`, `missing_manifest_decision`, `s100_row_missing`, and `manifest_malformed_json` are unchanged.
- (b) Remove `decision_anchor_uncovered` from `wrong_decision_source_override`'s expected pair. This keeps the producer's documented rule. Treating unregistered effective ids as "uncovered" would also change `wrong_source_id` and `s100_row_missing` and is not recommended.
- Minimal alternative: drop the `Sources:` prose line from `renderNote`, then apply (b). The three backlink pairs then reproduce under the whole-text rule.

Predicted selftest output (inspection only): `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, with `FAIL_DETAIL` lines for these four cases.

## F2: MEDIUM: duplicate JSON object keys accepted (malformed JSON)

- `parseManifest` calls `JSON.parse`, which keeps the last of duplicate names. No check exists at any depth. `strictUtf8` validates bytes only.
- Inspection-derived attack: a manifest with `"decisions": []` followed by the real 12-row `"decisions"` array. The producer validates only the second array and returns count 12, exit 0. A first-wins reader sees 0 decisions. The shadowed content is never validated.
- Same mechanism for top-level `schema`, `scope`, and `source`, and for any decision key (duplicate `quote` or `id`).
- Committed `decisions.json` is clean: per-key counts equal the object count (`id` 13 = 12 decisions + source.id; each decision key 12; `sourceId` 1; top-level keys 1 each).
- Red case `manifest_duplicate_top_key`: insert `"decisions": []` before the real key. Expected 0 / exit 1 / `[manifest_malformed]`. Current producer (derived): 12 / 0 / `[]`. Red; needs duplicate-name detection over decoded names at every object depth, so escaped duplicates such as `\u0073chema` are caught too.

## F3: MEDIUM: finding vocabulary not closed by the selftest

- `FINDING_IDS` has 24 entries; `expected.json` `reasons` has 20. Unexercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`.
- `loadExpected` checks persisted is a subset of registered (`expected_reason_unregistered`). It never checks registered is a subset of persisted, so a new finding id passes silently.
- The design rule "no pipe inside cells" is enforced only by `decision_text_invalid`, which no case exercises.
- Red cases (derived):
  - `decision_unknown_id`: LC12 id renamed `LC13`, its note row omitted. Expected 12 / 1 / `[decision_missing, decision_unknown_id]`.
  - `decision_shape`: LC01 gains key `topic`. Expected 12 / 1 / `[decision_shape]`.
  - `decision_text_invalid`: LC06 outcome contains ` | `. Expected 12 / 1 / `[decision_text_invalid]`.
  - `table_heading_duplicate`: heading repeated after the LC rows. Expected 12 / 1 / `[table_heading_duplicate]`.
- Add an equality check: sorted `FINDING_IDS` must equal the persisted `reasons`.

## F4: MEDIUM: no red case for top-level, source-object, or registry closure

| case | mutation | expected count / exit / findings | current producer (derived) |
|---|---|---|---|
| manifest_extra_top_key | add `"round": "round-20"` | 12 / 1 / manifest_shape | same |
| manifest_missing_scope | delete `scope` | 12 / 1 / manifest_shape, scope_mismatch | same |
| manifest_missing_schema | delete `schema` | 12 / 1 / manifest_shape | same |
| manifest_decisions_object | `decisions: {}` | 0 / 1 / manifest_shape | same |
| manifest_root_array | whole text `[]` | 0 / 1 / manifest_malformed | same |
| manifest_empty_file | 0 bytes | 0 / 1 / manifest_malformed | same |
| manifest_invalid_utf8 | byte 0xFF inside a string | 0 / 1 / manifest_malformed | same |
| manifest_source_sha256 | source.sha256 = 64 zeros | 12 / 1 / source_mismatch | same |
| manifest_source_extra_key | source gains key `note` | 12 / 1 / source_mismatch | same |
| registry_s096_row_missing | delete S096 registry row | 12 / 1 / registry_row_invalid | same |
| registry_s096_row_duplicate | duplicate S096 registry row | 12 / 1 / registry_row_invalid | same |
| registry_section_absent | remove `## Registry` heading | 12 / 1 / registry_row_invalid | same |
| manifest_bom | prepend EF BB BF | decision needed | 12 / 0 / `[]` (accepted) |

`manifest_bom`: `TextDecoder` with default `ignoreBOM` strips the BOM, so the producer accepts it. The producer header says "strict UTF-8 JSON". Either add the case as red (producer change) or document BOM acceptance.

## F5: LOW-MEDIUM: table check ignores non-canonical LC rows

- `LC_ROW = /^\|\s*LC\d{2}\s*\|/` anchors at column 0 and requires exactly two digits. `| LC1 |`, `| LC100 |`, and indented `  | LC01 |` never count toward `table_row_extra`.
- Red cases: indented duplicate of an LC01 row, and a `| LC1 |` phantom row. Each expects 12 / 1 / `[table_row_extra]`; current producer (derived) gives 12 / 0 / `[]`.
- Detected today (add as coverage): `| LC13 |` phantom row gives 12 / 1 / `[table_row_extra]`.
- Count is manifest-based, so admission is unaffected; this is documentation fidelity.

## F6: LOW: `sourceId` is open in the producer, narrower in the design

- `design.json` `manifestShape.decisions` lists `id,condition,outcome,startLine,endLine,quote` (no `sourceId`). `skillRendering` and LC11 use `sourceId`.
- The producer accepts optional `sourceId` on every decision if it equals that decision's pinned source. LC01 with `sourceId: "S096"` gives 12 / 0 / `[]` (clean).
- Decision needed: restrict `sourceId` to LC11 (red case: LC01 with `sourceId: "S096"` gives 12 / 1 / `[decision_shape]`) and list it in `manifestShape`; or keep it open and document.
- Also no red case for: `sourceId: null` (derived 12 / 1 / `[decision_shape, table_row_extra]`), non-integer `startLine` (derived 12 / 1 / `[decision_shape, table_row_extra]`), or whitespace-only `condition` (derived 12 / 1 / `[decision_text_invalid]`).

## F7: LOW: no boundary control for the 25-word quote limit

- The producer rejects more than 25 words. No positive control sits at exactly 25, so a `>=` mutation survives.
- Add `quote_25_words_accepted`: LC09 quote = first 25 whitespace tokens of lines 298 to 319 (a literal prefix). Expected 12 / 0 / `[]`; current producer clean.
- Add whitespace-only quote (`'   '`): expected 12 / 1 / `[quote_invalid]`; current producer same.

## F8: LOW: pins and scope partly unenforced

- `expected.json` `design.sha256` (`1c9f...`) equals the committed `design.json` digest (verified), but `loadExpected` never reads `design`. Enforce it or remove the block.
- `wrong_scope` also rewrites the note's `Scope:` line. The producer reads only `manifest.scope`, so the note half is inert. Drop it from the description, or add a note-scope rule (the real note has no `Scope:` line, so that needs a design decision).
- Note prose is not validated. `RUNTIME_WORDING` covers table cells only and is a finite blocklist (INFO; consistent with the non-goals).

## F9: INFO: CLI could-not-evaluate reasons untested

`CLI_REASON` has five members (`usage`, `revision_unresolved`, `git_failed`, `entry_not_regular`, `selftest_unavailable`). The selftest exercises `evaluate()` only. No defect found by inspection.

## Expected-pair derivation (34 cases, by inspection)

| # | case | expected count / exit / findings | derived | match |
|---|---|---|---|---|
| 1 | valid_all12 | 12 / 0 / [] | same | yes |
| 2 | baseline_absent0 | 0 / 0 / [] | same | yes |
| 3 | partial_manifest_without_note | 12 / 1 / partial_state | same | yes |
| 4 | partial_note_without_manifest | 0 / 1 / partial_state | same | yes |
| 5 | manifest_malformed_json | 0 / 1 / manifest_malformed | same | yes |
| 6 | wrong_manifest_schema | 12 / 1 / manifest_shape | same | yes |
| 7 | source_digest_edit | 12 / 1 / source_digest_mismatch | same | yes |
| 8 | source_absent | 12 / 1 / source_missing | same | yes |
| 9 | quote_mismatch | 12 / 1 / quote_mismatch | same | yes |
| 10 | invalid_quote_empty | 12 / 1 / quote_invalid | same | yes |
| 11 | invalid_quote_26_words | 12 / 1 / quote_invalid | same | yes |
| 12 | invalid_span_reversed | 12 / 1 / span_invalid | same | yes |
| 13 | wrong_scope | 12 / 1 / scope_mismatch | same | yes |
| 14 | runtime_wording | 12 / 1 / runtime_wording | same | yes |
| 15 | duplicate_id | 13 / 1 / decision_duplicate_id | same | yes |
| 16 | missing_table_row | 12 / 1 / table_row_missing | same | yes |
| 17 | missing_manifest_decision | 11 / 1 / decision_missing | same | yes |
| 18 | wrong_source_url | 12 / 1 / source_mismatch | same | yes |
| 19 | wrong_source_id | 12 / 1 / decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | **NO** |
| 20 | wrong_source_path | 12 / 1 / source_mismatch | same | yes |
| 21 | missing_registry_backlink | 12 / 1 / registry_backlink_missing | same | yes |
| 22 | wrong_decision_source_override | 12 / 1 / decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | **NO** |
| 23 | missing_decision_source_override | 12 / 1 / decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | **NO** |
| 24 | override_table_mismatch | 12 / 1 / decision_anchor_uncovered, decision_source_mismatch, table_row_extra, table_row_missing | same | yes |
| 25 | forced_s096_lc11 | 12 / 1 / decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | **NO** |
| 26 | s100_row_missing | 12 / 1 / registry_row_invalid | same | yes |
| 27 | s100_status_not_mined | 12 / 1 / registry_status_invalid | same | yes |
| 28 | s100_backlink_missing | 12 / 1 / registry_backlink_missing | same | yes |
| 29 | s100_teaches_not_supersedes | 12 / 1 / registry_row_invalid | same | yes |
| 30 | s100_url_mismatch | 12 / 1 / registry_row_invalid | same | yes |
| 31 | s100_digest_mismatch | 12 / 1 / registry_row_invalid | same | yes |
| 32 | wrong_anchor_s100 | 12 / 1 / decision_anchor_uncovered | same | yes |
| 33 | wrong_anchor_s096 | 12 / 1 / decision_anchor_uncovered | same | yes |
| 34 | malformed_anchor_s100 | 12 / 1 / registry_row_invalid | same | yes |

Pins and source spans, verified:
- Blob digest `8c8d6796...` at checkpoint equals the selftest pin and the producer pin.
- Design digest `1c9f536e...` equals `design.json` at checkpoint.
- Manifest quotes are literal in their spans: LC01 line 182, LC02 197, LC03 251, LC04 217, LC05 220, LC06 228, LC07 266, LC08 295, LC09 311, LC10 326, LC11 810, LC12 829.
- Selftest-only quotes are literal too: LC03 line 253, LC06 227, LC07 263, LC09 311, LC10 326.
- The source is LF-only (0 CR bytes), so the 26-word fixture's `includes` check is not affected by line endings.

## Closed-schema coverage (red cases today)

| closed element | covered today | gap |
|---|---|---|
| top-level key set (4 keys) | none | extra or missing key (F4) |
| top-level `schema` | value (`wrong_manifest_schema`) | none |
| top-level `scope` | value (`wrong_scope`) | note half inert (F8) |
| top-level `decisions` type | none | non-array (F4) |
| root type | none | array, null, string (F4) |
| bytes: empty, non-UTF-8, BOM | none | F4 |
| duplicate names | none | F2 |
| `source` keys `id`, `path`, `url` | yes | none |
| `source.sha256` | none | F4 |
| `source` extra key | none | F4 |
| decision keys (6 required + optional `sourceId`) | `sourceId` on LC11 only | extra or missing key; `sourceId` on other rows (F6) |
| decision `id` | duplicate, missing | unknown (F3) |
| decision `condition` / `outcome` | runtime wording (outcome) | pipe, whitespace, non-string (F3, F6) |
| decision span | reversed | non-integer (F6) |
| decision `quote` | empty, over 25 words, mismatch | exactly 25 words, whitespace (F7) |
| table heading | none | absent, duplicate (F3, F4) |
| table rows | missing; extra via override | non-canonical rows (F5) |
| registry section | S100 row, status, backlink, teaches, URL, digest, anchor | `## Registry` absent; S096 row missing or duplicate (F4) |
| note backlink | none (see F1) | |
| source file | digest, absent | none |

## R: Round key

- No `round` key exists in the manifest, the producer, the selftest, or `expected.json`. The closed top-level set `{decisions, schema, scope, source}` equals `design.json` `manifestShape`.
- Round identity is carried by the note heading (`... (round 20)`, pinned in both files) and the path. The `tabi-round20-*` strings live in the producer's `RESULT_SCHEMA` and in `expected.json` `schema`, not in the manifest.
- An integration round key in the manifest would be refused as `manifest_shape` (exit 1). Adding one requires changing the design `manifestShape`, the producer closed set, and the selftest fixture, plus red case F4 first. Recommendation: do not add a round key; keep the `schema` string as the manifest's only version identity.

## Handoff to main

1. Decide F1 before the gate. The expected verdict today is `failed`. Option (a) plus (b) is recommended.
2. Producer work, with red cases: F2 (duplicate keys) and F5 (non-canonical rows).
3. Add the red cases in F3, F4 (including registry), and F7, plus the vocabulary equality check.
4. Decide F6 (`sourceId` closure), the BOM question in F4, and F8 (design pin, note scope).
5. Gate commands, not run by me: `node .ufo/waves/round-20/measure-c1.mjs 4ae99816b8994fdedc159156d8d9d242dd5c4782` and `node .ufo/waves/round-20/measure-c1.mjs --selftest`. The real-run count also depends on registry rows and note text outside this lane.

## Not verified

- Registry rows (`corpus/SOURCES.md`) and full note table text against the producer: other seats.
- Nothing executed. All results are inspection-derived.

## Tools

- None installed or updated.
