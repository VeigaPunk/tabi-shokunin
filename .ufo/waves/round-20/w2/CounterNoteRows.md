# CounterNoteRows: round-20 C1 table-row attack and H3 integration check

Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Author-side, read-only. No production or clone writes. Not an external closure.

Inputs: `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`. Cross-read: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/SOURCES.md`, `corpus/evidence/round-20/sources/html_form_element.cc`, `.ufo/waves/round-20/design.json`, `integration.json`, and the w1 critic and executor reports.

**Method.** Committed blobs only (`git show`, `git grep`, `git ls-tree`), plus `jq`, `diff`, `sha256sum`, `grep`, and `sed`. Nothing executed: no producer, no selftest, no tests. Every expected value below is a trace of the committed code and remains untested until main runs `--selftest` once. Expected pairs were checked against the producer rules, not against a recomputation, and quotes and the source pin were checked directly against the committed source bytes.

## Verdict

- **F1 (High).** 30 of 34 `expected.json` pairs trace to the committed producer. Four cases do not, with five extra findings between them. At this checkpoint `--selftest` should print `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20` and exit 1.
- **Heading alignment: integrated and correct.** Note line 25 is the exact pinned H3. The 12 table rows match the manifest rendering. The section closes at line 46.
- **F2 (High).** The H3 gate correction (`WebMCPEnabled` precondition and origin-trial status) is not integrated into the note or the manifest. `integration.json` neither accepts nor rejects it.
- **F3 to F8 (Medium and Low).** Table-branch and closed-schema red cases are missing. One producer boundary lets stray LC-prefixed rows pass with exit 0.

## F1. High: four expected pairs disagree with the committed producer

| case | expected.json (current) | producer trace at checkpoint | decisive code |
|---|---|---|---|
| `wrong_source_id` | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | backlink emitted only at `measure-c1.mjs:521` (S096/S100 used-by) and `:547` (note tokens). Both pass: used-by unchanged, Sources line still names S096 and S100 |
| `wrong_decision_source_override` (LC11 sourceId S099) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | `checkDecisionAnchor` returns at `:379` when no row matches S099. No registry check covers non-pinned ids |
| `missing_decision_source_override` (LC11 sourceId removed) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | S096 row used-by names the note, so no backlink finding |
| `forced_s096_lc11` (LC11 sourceId S096) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | same as above |

Corrected expectations. Count and exit are unchanged (12 and 1 for all four):

- `wrong_source_id`: `[decision_source_mismatch, source_mismatch]`
- `wrong_decision_source_override`: `[decision_source_mismatch]`
- `missing_decision_source_override`: `[decision_anchor_uncovered, decision_source_mismatch]`
- `forced_s096_lc11`: `[decision_anchor_uncovered, decision_source_mismatch]`

After correction the union of case findings still equals the 20-id persisted vocabulary. `registry_backlink_missing` stays via `missing_registry_backlink` and `s100_backlink_missing`. `decision_anchor_uncovered` stays via the other LC11 override cases and `wrong_anchor_*`.

Expected stderr after the fix to these cases: none. Before the fix, the runner prints four `FAIL_DETAIL case=<name> findings=[...] want=[...]` lines.

**Provenance.** These four sets are ExecCounter's first-message predictions (`w1/ExecCounter.md:66-73`). ExecFixtures marked them "Confirmed", but its return says it "never opened or copied `measure-c1.mjs`" (`w1/ExecFixtures-return.txt`). ExecCounter says "Nothing was executed." No run has tested `expected.json`. The executors' "confirmed" labels are transcriptions, not evidence.

**Recommendation.** Fix the expectations, not the producer. The producer contract says missing rows are "reported by the registry checks" (`measure-c1.mjs:373-375`). Registry checks run only for S096 and S100 (`:549-551`). The corrected sets follow from that contract.

**Agreeing.** The other 30 cases trace to their expected pairs, including `invalid_span_reversed` → `[span_invalid]`, which ExecFixtures flagged as unconfirmed. `coversSpan` treats a reversed span inside a covered run as covered, so `span_invalid` is the only signal there. `manifest_malformed_json` → `[manifest_malformed]` holds because the zero-row note keeps its Sources line naming S096 and S100.

## F2. High: H3 gate and precondition correction not integrated

Evidence.

- Source: `RuntimeEnabledFeatures::WebMCPEnabled` is checked at `html_form_element.cc` lines 354, 411, 770, 826, 840 and 1720. Line 826 lies inside LC12's own span (818 to 830) and is not named by the LC12 row.
- Note line 9: "Preconditions are the stated conditions only; no other form shape, build, or mutation is covered." This is inaccurate by omission: the gate is an unstated precondition of the rows.
- A case-insensitive grep of the note for `WebMCPEnabled|origin.?trial|experimental|flag|shipping|default` hits only `preventDefault` (line 78). No row names the gate and no sentence states the origin-trial or experimental status.
- Manifest `scope` (`decisions.json` line 9) is still "source-only Chromium 154.0.8037.97; not runtime-observed".
- `integration.json` has no gate, H3, M5, precondition or overlap entry in `mainIntegrationChanges`, `acceptedDissent` or `rejectedSuggestions`.
- The requested correction: `w1/CriticScope.md:70` (H3 fix), `:140` (smallest-correction item 1, "Heading and manifest: add the WebMCPEnabled precondition and gate status"). Also `w1/CriticClaims.md:50` (S4: "Name the flag in the conditions, and state that a violated CHECK aborts; it is not a tool error") and `:102` (item 5).

Mechanical reach. The counter pins the scope (`measure-c1.mjs:76`) and the heading (`:77`). The selftest pins both too (`selftest-c1.mjs:39-40`). Changing either is a pin change. The measure header calls pin changes contract changes. A note-body-only fix is not checked by any gate.

Options for L1. Choose one and record it in `integration.json`:

- (a) Note body only. Add a Scope sentence naming `WebMCPEnabled` and the origin-trial status, and name the gate in LC12's condition. No pin change. Not mechanically checked.
- (b) Pin it. Move the gate wording into the manifest scope, `MANIFEST_SCOPE`, selftest `PIN.scope`, and the design. Add red case `scope_without_gate` expecting `[scope_mismatch]`, count 12, exit 1.

Either way, replace "Preconditions are the stated conditions only". The mechanical gate cannot judge whether the gate description is correct; it can only pin the words.

## Heading and rows: what was checked

- **Heading.** Note line 25 equals `TABLE_HEADING` exactly, including U+2014 (`grep -x` count 1). It is the only `###` line in the note. It matches `measure-c1.mjs:77`, `selftest-c1.mjs:40` and the design heading.
- **Rows.** Twelve `| LCnn |` rows at lines 29 to 40. Diff against the `jq`-rendered manifest rows is empty after trailing-space trim, which the counter also applies. The only lines starting with `|` in the whole note are the header (27), the separator (28) and those 12 rows.
- **Section.** Heading (25) to `## Finite sample and caveat` (46). Every row is inside, and no LC row sits outside.
- **Quotes.** All 12 manifest quotes and all 12 selftest quotes are literal inside their spans (for example LC06 at 228, LC09 at 311, LC11 at 810, LC12 at 829). Source sha256 is `8c8d6796…6916`, matching the pin.
- **Registry.** S096 (`SOURCES.md:110`) and S100 (`:114`) satisfy the contract: URL token in source, `decoded sha256` part in anchor, ranges `174-328,729-758,818-842` and `174-328,635-842` covering every span, status `mined`, used-by names the note, S100 teaches begins `supersedes S096 —`.
- **Real artifacts.** Traced clean at count 12, exit 0. Not executed.

## F3. Medium (producer boundary): stray LC-prefixed rows pass silently

`LC_ROW = /^\|\s*LC\d{2}\s*\|/` (`measure-c1.mjs:99`) accepts only a first cell that is exactly `LC` plus two digits. Rows such as `| LC7 |`, `| LC013 |`, `| LC07a |`, `| LC07 (dup) |` and `| lc07 |` are neither in-section nor outside. An extra one yields exit 0.

Whether this is a defect depends on the contract. "Extra" is defined over `| LCnn |` rows, so the literal reading permits it. Decide one of two ways. Either document it with a green control, or broaden the grammar to `/^\|\s*LC/`. The broadened grammar does not change the committed note, because its only `|` lines are the header, the separator and the 12 rows.

Red case `row_suffix_id`: insert `| LC07a | … |` inside the table. Expected under broadened grammar: `[table_row_extra]`, count 12, exit 1. Current producer: `[]`, exit 0.

## F4. Medium: table-branch red cases missing

Current coverage.

| branch | line | covered by |
|---|---|---|
| table_row_missing, in-section | `:448` | `missing_table_row` |
| table_row_extra, in-section surplus | `:451` | only with a missing row (`override_table_mismatch`), never alone |
| table_row_extra, outside section | `:436` to `:439` | none |
| table_row_missing, no heading | `:414` | none |
| table_heading_duplicate | `:413` | none |

Proposed cases. Base is `valid_all12` (12, exit 0). Expected values are traces.

| case | mutation | count / exit | findings | covers |
|---|---|---|---|---|
| `heading_h2` | declared H3 demoted to `## …` | 12 / 1 | table_row_extra, table_row_missing | H3 pin, `:414`, `:436-439` |
| `heading_dash_drift` | U+2013 in place of U+2014 | 12 / 1 | table_row_extra, table_row_missing | exact-bytes pin |
| `heading_removed` | heading line deleted | 12 / 1 | table_row_extra, table_row_missing | `:414` |
| `heading_interposed` | `## Interlude` directly after the heading | 12 / 1 | table_row_extra, table_row_missing | `SECTION_END` (`:100`) |
| `heading_duplicated` | second identical H3 after row 40, before `## Finite sample` | 12 / 1 | table_heading_duplicate | `:413`; all 12 rows stay in section 1 |
| `row_outside_section` | copy of the LC12 row after `## Finite sample and caveat` | 12 / 1 | table_row_extra | `:436-439` |
| `row_surplus_in_section` | copy of the LC07 row inside the table | 12 / 1 | table_row_extra | `:451` alone |
| `row_unknown_id` | `| LC13 | … |` inside the table | 12 / 1 | table_row_extra | `LC_ROW` reaches two-digit unknowns |
| `rows_reordered` (control) | swap the LC01 and LC12 rows | 12 / 0 | none | multiset semantics (`:448`) |
| `h4_inside_section` (control) | `#### Note` between heading and rows | 12 / 0 | none | `SECTION_END` excludes H4 (`:100`) |

The H3 pin has no red case today. `heading_h2`, `heading_dash_drift` and `heading_removed` are the cases that pin it.

## F5. Medium: closed-schema coverage

Twenty-four ids are registered in `FINDING_IDS` (`measure-c1.mjs:137`). Twenty are exercised. Four are not: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`.

The runner's `loadExpected` (`selftest-c1.mjs:130` onward) checks that persisted reasons are registered (`:145`) and that case reasons are inside the persisted vocabulary (`:161`). It never checks that the persisted vocabulary equals the registered set. The verdict line `reasons=20` therefore hides the four gaps.

Proposed:

- `decision_unknown_id`: a 13th manifest entry with `id: "LC13"` and valid keys. Omit its note row, because a present row also fires `table_row_extra`. Expected: count 13, exit 1, `[decision_unknown_id]`.
- `decision_shape`: the LC05 entry without `quote`. Expected: count 12, exit 1, `[decision_shape]`.
- `decision_text_invalid`: the LC04 condition containing `|`, with the note row rendered from the same text. Expected: count 12, exit 1, `[decision_text_invalid]`.
- `table_heading_duplicate`: the `heading_duplicated` case above.
- Runner: assert persisted reasons equal `FINDING_IDS`, or document each exemption with a reason.

## F6. Low: note-citation backlink branch unreachable from the selftest

`measure-c1.mjs:546-547` (note lacks S096 or S100) is never exercised. `renderNote` always writes both tokens (`selftest-c1.mjs:209`).

Proposed `manifest_malformed_no_citations`: the `manifest_malformed_json` mutation, with the Sources line removed and rows omitted. Expected: count 0, exit 1, `[manifest_malformed, registry_backlink_missing]`.

This also settles the fragility ExecFixtures flagged. With the tokens present the result is `[manifest_malformed]`. Without them it adds the backlink finding.

## F7. Low: manifest-shape branches unexercised

Only `wrong_manifest_schema` reaches `manifest_shape`. Two branches are untested:

- `decisions` present but not an array (for example an object). Expected: count 0, exit 1, `[manifest_shape]`.
- Extra top-level key `"round": 20`. Expected: count 12, exit 1, `[manifest_shape]`. The integration removed exactly such a key ("remove uncontracted round key"), so a red case locks that change.

## F8. Low: inaccurate comment

`measure-c1.mjs:373-375` says a missing or duplicate row is "reported by the registry checks." Registry checks run only for S096 and S100. A decision that cites another id gets only `decision_source_mismatch`. Pinned ids are covered by `registry_row_invalid`. No outcome is lost; the wording should be corrected.

## Not verified or out of scope

- Nothing executed. All expected values are traces. Main's single `--selftest` and `measure-c1.mjs REV` run decides.
- Semantic truth of rows, the depth scalar, and runtime capability are not assessed. The LC11 and LC12 semantic critiques are outside this seat.
- SKILL.md H3 placement (`w1/CriticNoHarm.md:41`, rule R4) is not in the counter's inputs. Not checked.
- The registry-absent branch (`parseRegistry` returning null) has no case. Not checked.

## Installs

None. Read-only tools only: git, grep, sed, jq (already present on the host), diff, sha256sum. No installs or updates.
