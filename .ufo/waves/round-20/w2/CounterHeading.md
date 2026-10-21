# CounterHeading: table heading and section termination (round 20, C1)

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`. HEAD is `4ae9981`; the three target files have no working-tree drift.

Scope: `measure-c1.mjs`, `selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json`. Read-only: the real note, `design.json`, and the pinned source.

Method: static trace of producer and fixtures. Nothing was executed. Read-only commands only: `git rev-parse`, `git status --porcelain`, `sha256sum`, `wc`, grep, read. Predictions are marked [INFERENCE].

Digests (sha256): `measure-c1.mjs` fab3bde4cc80...ddfa80a6; `selftest-c1.mjs` 5804cf6a73a4...3544a5; `expected.json` 458a9f3fa069...fb744d1; real note 3ac83d0abeba...55f4; source 8c8d6796b17b...6916; `design.json` 1c9f536e329d...7a1da.

Axes:
1. Duplicate-heading detection coverage (`measure-c1.mjs:411-414`).
2. Section termination (`SECTION_END` at `:100`, scan at `:417-424`).
3. Expected-pair fidelity: independence from the producer, and the source pin.
4. Finite schema coverage on the heading axis.

## Verdict

- **Production heading axis is correct.** The real note has one `### ` line (25), equal to `TABLE_HEADING`. The H1 at line 5 is level 1 and does not match. The only pipe lines are 27-40. The next `#` line is 46 (`## Finite sample and caveat`). The note has no code fences.
- **Selftest heading axis is untested.** `table_heading_duplicate` has no persisted pair. `SECTION_END` never evaluates true on any line scanned by the 34 fixtures. The heading-absent branch is not persisted.
- **Selftest is predicted red at the checkpoint.** Four persisted pairs cannot be produced by the committed producer (F1). This blocks the gate. An independent static trace agrees with the conclusions of w2 CounterBacklinks, CounterAnchor, CounterMissingId and CounterMirrors (read at grep level, not re-verified).

## Findings

### F1 (High): four persisted pairs disagree with the committed producer [INFERENCE]

I hand-traced all 34 pairs. 30 match count, exit and findings. These four do not:

| case | persisted findings | producer trace |
|---|---|---|
| `wrong_source_id` | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch |
| `wrong_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch |
| `missing_decision_source_override` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |
| `forced_s096_lc11` | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch |

Mechanism. `registry_backlink_missing` is emitted only at `measure-c1.mjs:521` (a pinned row's used-by lacks the note) and `:547` (the note lacks token S096 or S100). In all four fixtures both pinned rows still list the note in used-by. `renderNote` always writes a Sources line naming S096 and S100 (`selftest-c1.mjs:207-209`), so `:547` never fires. `decision_anchor_uncovered` is emitted only at `:385`. `checkDecisionAnchor` returns at `:379` when no registry row matches the effective source. `wrong_decision_source_override` uses S099, which has no row.

Predicted `--selftest` output: `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, four `FAIL_DETAIL` lines, exit 1.

Recommended fix (for L1 to confirm; no producer change). Correct the four pairs to producer output:
- `wrong_source_id`: [decision_source_mismatch, source_mismatch]
- `wrong_decision_source_override`: [decision_source_mismatch]
- `missing_decision_source_override`: [decision_anchor_uncovered, decision_source_mismatch]
- `forced_s096_lc11`: [decision_anchor_uncovered, decision_source_mismatch]

Rationale. The header's citation rule (LC11 must cite S100; every other decision must cite S096) is enforced at manifest level (`checkDecision`, `:339-340`) and at table level (multiset, `:448` and `:451`). The whole-note token check at `:546-547` is the producer's only backlink rule. A row-level backlink rule would be a contract change. CounterBacklinks recommends that row-level rule instead; that choice belongs to L1. Vocabulary stays at 20. The reasons that lose their last pair are still exercised elsewhere: `registry_backlink_missing` by `missing_registry_backlink` and `s100_backlink_missing`, and `decision_anchor_uncovered` by `wrong_anchor_s100`, `wrong_anchor_s096` and `override_table_mismatch`.

### F2 (High, coverage): `table_heading_duplicate` has no red case; its emitter survives every mutant

- The emitter is `measure-c1.mjs:413`. No persisted fixture has two heading lines. `renderNote` emits one (`selftest-c1.mjs:207`), and no `CASES` mutation adds one.
- Surviving mutants: delete `:413`; change `> 1` to `> 2`; change `headings[0]` to the last heading.
- Proposed fixtures:
  - `heading_duplicated_trailing`: append `[heading, ""]` after the rows. Predicted 12 / exit 1 / [table_heading_duplicate]. Trace: start is the first heading, end is the trailing heading, and all 12 rows are inside.
  - `heading_duplicated_interposed`: insert `[heading, ""]` before LC07. Predicted 12 / exit 1 / [table_heading_duplicate, table_row_extra, table_row_missing]. Trace: LC07-LC12 follow the second heading, so they are outside, and the multiset then reports them missing in-section.
- Adds `table_heading_duplicate` to `reasons`, sorted between `span_invalid` and `table_row_extra`.

### F3 (Medium, coverage): `SECTION_END` is never exercised by the selftest

- `renderNote` emits exactly one `#`-prefixed line (the table heading), and `checkTable` scans from `start + 1`. No fixture has a heading after the table. So `:100` and `:421` never return true across the 34 cases.
- Surviving mutants: drop `###` from the class; drop `##`; over-terminate at `####`; drop the required space.
- Proposed cases, using existing reasons only:
  - `heading_h3_terminates_section`: insert `["### Detail", ""]` before LC07. Predicted 12 / 1 / [table_row_extra, table_row_missing].
  - `heading_h2_terminates_section`: insert `["## Detail", ""]` before LC07. Predicted 12 / 1 / [table_row_extra, table_row_missing].
  - `heading_h4_does_not_terminate` (green): insert `["#### Detail", ""]` before LC07. Predicted 12 / 0 / [].
  - `heading_h1_same_title_prefix_valid` (green; mirrors real note line 5): prefix `["# Declarative WebMCP completion lifecycle — source-scoped (round 20)", ""]` before the table heading. Predicted 12 / 0 / []. This kills a normalising heading comparator, which would count the H1 as a second heading.

### F4 (Low): `heading_absent` pins a branch, but line 414 is redundant

- `:414` emits `table_row_missing` when no heading exists. The multiset check at `:448` emits the same reason for any renderable decision, because the in-section map is empty.
- A non-renderable decision always raises a `decision_shape` or `decision_unknown_id` finding in `checkDecision`. An empty decisions list raises `decision_missing`. So deleting `:414` never changes exit or count, and changes the reason set only in states that already fail.
- Proposed: `heading_absent` (omit the heading). Predicted 12 / 1 / [table_row_extra, table_row_missing]. This pins the branch but cannot kill a deletion of `:414`, which is equivalent.
- Non-blocking: delete `:414` as dead weight in a later producer change, or keep it with a comment.

### F5 (Low, hardening): section scan ignores code fences [INFERENCE]

`LC_ROW` (`:99`) and `SECTION_END` (`:100`) are line regexes. Two untested consequences:
- A `# ...` shell comment inside a fence within the section ends the section early. This fails closed, with false `table_row_extra` and `table_row_missing`.
- A fenced verbatim copy of a row can stand in for a deleted real row. Predicted exit 0 and findings `[]`. This fails open.

Neither occurs in the committed note (read-only grep found no fence lines). Decide whether to document the scan as line-based or exclude fenced ranges.

### F6 (Info): finite schema coverage

- `FINDING` registers 24 ids (`:111-136`). The persisted vocabulary has 20. Never persisted: `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, `table_heading_duplicate`. F2 closes the last one.
- `loadExpected` checks persisted is a subset of registered (`:145`) and that persisted equals exercised (`:161`). Nothing checks that registered is a subset of persisted, so a new registered reason could ship with no pair. Add an equality check once the cases exist.
- LC_ROW grammar: `| LC100 |`, `| LC1 |`, lowercase or indented rows are silently ignored (`:99`). Cross-reference w2 CounterDuplicateIds section 4. Not re-derived here.

## Independence and source pin

- Expected pairs are literal JSON. The runner never calls `evaluate` to produce them, and `compare` is exact equality. The independence is structural. But 4 of 34 do not match the producer, so the pairs are not validated outputs.
- Source pin. The source sha256 `8c8d6796...6916` matches the pin. `design.json` sha256 `1c9f536e...` equals `expected.design.sha256`, but that field is metadata only and `loadExpected` does not enforce it. The source URL, id, path and sha are identical across `measure-c1.mjs` (`SOURCE_*`), the selftest `PIN`, `expected.source` and `design.source`. Runner preflight checks the blob digest.
- Quote literals. All 12 selftest quotes appear inside their spans. Checked against source lines 182, 197, 217, 220, 227, 253, 263, 295, 311, 326, 810 and 829.

## Mutant survival map (heading axis, against the current 34 cases)

| mutant | today | proposed killer |
|---|---|---|
| delete `:413` | survives | heading_duplicated_trailing, heading_duplicated_interposed |
| `:413` `> 1` to `> 2` | survives | heading_duplicated_trailing |
| `headings[0]` to last heading | survives | heading_duplicated_trailing |
| delete `:421-423` (end = EOF) | survives | heading_duplicated_interposed, heading_h3_terminates_section |
| SECTION_END drops `###` | survives | heading_h3_terminates_section |
| SECTION_END drops `##` | survives | heading_h2_terminates_section |
| SECTION_END matches `####` or drops the required space | survives | heading_h4_does_not_terminate |
| `:411` exact compare to any-level normalised | survives | heading_h1_same_title_prefix_valid |
| delete `:414` | survives | none; equivalent (F4) |
| `index > start` to `>=`, `index < end` to `<=` | survives | none; equivalent (heading and terminator lines never match LC_ROW) |

## Proposed additions

Seven cases, taking the suite from 34 to 41 and the vocabulary from 20 to 21. Test-only hooks in `renderNote`: `prefix` (lines before the heading), `omitHeading`, `before` (lines before a named row), `trailer` (lines after the rows). All default to empty in `baseState`, so `valid_all12` bytes do not change. Names are proposals.

| case | hook | count / exit | findings |
|---|---|---|---|
| heading_duplicated_trailing | trailer `[heading, ""]` | 12 / 1 | table_heading_duplicate |
| heading_duplicated_interposed | before LC07 `[heading, ""]` | 12 / 1 | table_heading_duplicate, table_row_extra, table_row_missing |
| heading_absent | omitHeading | 12 / 1 | table_row_extra, table_row_missing |
| heading_h3_terminates_section | before LC07 `["### Detail", ""]` | 12 / 1 | table_row_extra, table_row_missing |
| heading_h2_terminates_section | before LC07 `["## Detail", ""]` | 12 / 1 | table_row_extra, table_row_missing |
| heading_h4_does_not_terminate | before LC07 `["#### Detail", ""]` | 12 / 0 | none |
| heading_h1_same_title_prefix_valid | prefix `["# …", ""]` | 12 / 0 | none |

All predictions are static traces [INFERENCE]. Run the selftest once after the F1 correction, and check each new case.

## Limits

- Static trace only. Nothing was run. The F1 verdict and every prediction need one main-run selftest, plus one `measure-c1.mjs` run on the real tree. The selftest does not cover the real tree.
- Mechanical row validation only. This is not semantic truth, not the depth scalar (still 8), and not a runtime or capability claim.
- Findings are author-side. No external closure.
- No tools were installed or updated. No production file was written. No clone was created.

Report: .ufo/waves/round-20/w2/CounterHeading.md
