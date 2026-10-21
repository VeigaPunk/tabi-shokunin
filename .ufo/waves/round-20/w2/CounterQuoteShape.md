# TabiR20.CounterQuoteShape — w2 findings

Scope: `quote_invalid` (empty / >25 words / multiline) plus expected-pair and finite-schema audit.
Inputs: `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`, all verified byte-identical to checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (sha256 compare `git show REV:path | sha256sum` vs worktree: `fab3bde4…`, `5804cf6a…`, `458a9f3f…`).
Method: static read-only inspection only. No code executed, no tests run, no installs. Mechanical contract audit only — no semantic-truth, depth-scalar, or runtime-capability claim; C1 target stays 12 source-only rows.

## Findings

### F1 — HIGH: four persisted expected pairs over-report findings; the selftest fails at the pinned commit

Producer enumeration (complete, by grep of `findings.add` sites):

- `registry_backlink_missing` has exactly two producers, both keyed to pinned constants / registry cells, never to manifest or decision source ids: `measure-c1.mjs:546-548` (note must cite S096 and S100) and `:521` (pinned row's used-by must name the note).
- `decision_anchor_uncovered` has exactly one producer, reachable only after the exactly-one-registry-row guard: `measure-c1.mjs:376-385` (`checkDecisionAnchor` returns at `:379` when `matches.length !== 1`).

The four fixtures below touch none of those inputs: the note Sources line uses `PIN.sourceId`/`PIN.authorityId` (`selftest-c1.mjs:209`) and registry S096/S100 cells are unchanged. Walking `evaluate` (`measure-c1.mjs:530-556`) per case:

1. `wrong_source_id` (manifest `source.id` → S097): expected `["decision_source_mismatch","registry_backlink_missing","source_mismatch"]`; actual per producer logic `["decision_source_mismatch","source_mismatch"]`. Note rows still match (fixture renders rows from `state.source.id`, `selftest-c1.mjs:203`, mirroring `renderRow`'s `manifestSourceId`, `measure-c1.mjs:274-277`); note still cites S096/S100; registry rows unchanged → no backlink producer fires.
2. `wrong_decision_source_override` (LC11 `sourceId` → S099): expected `["decision_anchor_uncovered","decision_source_mismatch","registry_backlink_missing"]`; actual `["decision_source_mismatch"]` only. No S099 registry row exists, so `checkDecisionAnchor` early-returns (`:379`) — an anchor finding is unreachable.
3. `missing_decision_source_override` (LC11 `sourceId` removed → effective S096): expected adds `registry_backlink_missing`; actual `["decision_anchor_uncovered","decision_source_mismatch"]` (anchor justified: S096 ranges 174-328,729-758,818-842 do not cover 787-815).
4. `forced_s096_lc11` (LC11 `sourceId` → S096): identical shape to 3.

`compare` requires exact findings-list equality (`selftest-c1.mjs:348-369`), so each of these four cases fails: `MEASURE_C1_SELFTEST verdict=failed`. The counter's `evaluate` is internally consistent; the defect is in the persisted expectation — the pairs look authored against an earlier counter revision whose backlink/anchor checks also consumed manifest/decision source ids. Supporting evidence: sibling `override_table_mismatch` correctly claims no backlink and correctly claims `table_row_extra`+`table_row_missing`, so the drift is local to the four pairs above.

Author-side recommendation: regenerate those four pairs to the actual findings above (count 12, exit 1 unchanged). I did not edit them (production frozen; findings are author-side, not external closure).

### F2 — MEDIUM: the valid-side word boundary (exactly 25 words) is exercised by no case

`quote_invalid` fires only on `trim() === ''` or `wordCount > 25` (`measure-c1.mjs:362`); 25 passes. All twelve baseline quotes are ≤8 words (largest LC11, 8 words); the only oversized fixture is the 26-word case. A `>` → `>=` regression (or `QUOTE_MAX_WORDS` 25→24) passes all 34 cases. Recommended red/positive pair (pure fixture, no counter change): `boundary_quote_25_words` — LC09 quote = the `tokens[0]..tokens[24]` slice of span 298-319 using the same technique as `quoteOfTwentySixWords` (`selftest-c1.mjs:185-190`), i.e. a genuine literal substring → expected count 12, exit 0, findings `[]`. The empty side needs no mirror case: 1-word valid quotes exist in the baseline (LC01).

### F3 — MEDIUM: the non-string-quote branch (`decision_shape`) has no red case

`quote: null` or a number yields `decision_shape`, never `quote_invalid` (`measure-c1.mjs:359-360`). This is the quote-shaped branch adjacent to my lane and is exercised by zero cases (see F4). Recommended case: `nonstring_quote` — `byId(state,'LC08').quote = null` → expected `["decision_shape"]`, count 12, exit 1 (`renderable` ignores quote, `measure-c1.mjs:265-271`, so the table still matches; mismatch check is in the else-branch and does not run).

### F4 — LOW/INFO: finite schema coverage — 4 registered reasons with zero case coverage

`FINDING_IDS` has 24 entries; `expected.json` declares and exercises 20. Unexercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`. `loadExpected` enforces expected ⊆ registered and exercised == expected, but not registered ⊆ exercised (`selftest-c1.mjs:130-163`), so the gap is silent by design. Producers: `decision_shape` `measure-c1.mjs:323-360`; `decision_unknown_id` `:334`; `decision_text_invalid` `:349` (empty or `/[|\r\n]/` in condition/outcome — this is the actual one-physical-line gate); `table_heading_duplicate` `:413`. Either declare the four reserved-unexercised in the contract, or add red cases; cheap ones: condition `'a | b'` on LC04 → `["decision_text_invalid"]` (manifest and note row mutate identically, no table finding); unknown id append → `decision_unknown_id` + `table_row_extra` (renderNote renders all `state.decisions`, `selftest-c1.mjs:200-205`, while `renderable` drops non-pinned ids); duplicate heading → `table_heading_duplicate` + `table_row_extra` (second `### ` ends the first section, `SECTION_END` `:414-425`).

## quote_invalid attack verdicts (lane core)

- **Empty**: `''` → `quote_invalid`; pair `invalid_quote_empty` verified — the mismatch check is skipped for empty quotes by the `trim() !== ''` guard (`measure-c1.mjs:365`), so `["quote_invalid"]` exactly is correct. Whitespace-only `'   '` hits the same trim branch — equivalent class, no separate case needed.
- **>25 words**: pair `invalid_quote_26_words` verified — `quoteOfTwentySixWords` returns the original span bytes from `tokens[0].index` to the end of token 25 (`selftest-c1.mjs:190`), a genuine literal substring, so exactly `["quote_invalid"]` with no `quote_mismatch`. Correct.
- **Multiline**: not a defect — accepted by the finite contract, consistently in three places: design.json `manifestShape` says "literal <=25 whitespace words within source span" with no single-line constraint; the counter quote branch has no `[|\r\n]` rejection (unlike condition/outcome, `measure-c1.mjs:349`); and the 26-word fixture is itself multiline, its comment stating "line breaks included, so the only defect in that fixture is the word count" (`selftest-c1.mjs:184`). The quote is rendered nowhere — row shape is `| id | condition | outcome | source:start-end |` (`measure-c1.mjs:276`) — so there is no cell/pipe hazard; a quote containing `|` or `\r` can never be a literal span substring (`lineList` strips `\r`, span joined with `\n`) and lands on `quote_mismatch`, not silent acceptance. A multiline red case would be a false red.

## Verified-correct pairs (audit result)

The other 30 cases were each walked against producer logic and are consistent, notably: `invalid_span_reversed` — reversed 258-249 counts as covered because `coversSpan` checks `first <= start && end <= last` over merged runs (`measure-c1.mjs:254-262`), giving exactly `["span_invalid"]`; `manifest_malformed_json` — 96-byte truncation fails `JSON.parse`, and note/table checks are skipped because `doc === null`; `duplicate_id` — the row multiset counts the duplicated row on both sides, so no table finding; `source_digest_edit`/`source_absent` — `quote_mismatch` is correctly gated on verified source lines while `quote_invalid` correctly is not (`measure-c1.mjs:362` vs `:365`).

## Residual risk / verification gaps

- All verdicts are static readings of the pinned bytes; I did not execute the selftest (forbidden this wave). Main's serial verification will empirically confirm F1 — expected outcome: exactly the four named cases fail. If the run instead passes, my reading of `measure-c1.mjs:379/:521/:546-548` is wrong and F1 should be discarded.
- CLI/exit-2 plumbing (git argv, `minimalEnv`, `entryAt`) not audited — outside the quote/expected-pair lane.
- Fixture claims about the retained blob (≥26 tokens in lines 298-319) are runtime-guarded by preflight faults, not verified here.

Install log: none. Read-only commands used: `git show | sha256sum` byte-identity check only.
