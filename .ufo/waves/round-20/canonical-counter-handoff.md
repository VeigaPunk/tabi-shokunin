# Round-20 C1 canonical table parser handoff

Clone: `.ufo/waves/round-20/final-clones/ExecCounter`  
Branch: `round20/ExecCounterCanonical`  
Base: `4ae99816b8994fdedc159156d8d9d242dd5c4782`

## Change

Updated only `.ufo/waves/round-20/measure-c1.mjs`.

- Added the corrected note heading as an independent constant and `PINS.correctedHeading`, preserving `PINS.heading` unchanged:
  `### Declarative WebMCP completion lifecycle — corrected source-scoped (round 20)`.
- If exactly one corrected heading exists, compare the current manifest's rows only against that section. Permit LC rows in the original heading's historical section(s); LC rows anywhere else are `table_row_extra`.
- Duplicate original or corrected heading occurrences still add the existing `table_heading_duplicate` finding.
- If there is no unique corrected heading, use the original historical table behavior. This preserves historical revisions and existing fixtures.
- Updated `MANIFEST_SCOPE` and `PINS.scope` to the exact provenance literal `source-only Chromium 154.0.8037.97; no new runtime observation in round 20`. This classifies this round without denying earlier-round runtime evidence. No historical alias; baseline with absent manifest remains count 0.
- Hardened LC-row detection to `/^\|\s*LC/`, so malformed or unknown LC-prefixed rows are counted as unmatched extras rather than escaping classification. `declaredRanges` now requires exactly one complete semicolon-delimited `html_form_element.cc` range clause and rejects missing clauses, trailing commas, malformed ranges, and trailing junk as `registry_row_invalid`; well-formed but uncovered spans remain `decision_anchor_uncovered`.

## Commit

Commit: `d1a6f284afa4c9e8eb659a20686f96938e448d88` (parent `99647e5074d770c77352e5f051de3921c3f2b510`), author/committer `tabi-shokunin <tabi@shokunin.local>`. Producer `.ufo/waves/round-20/measure-c1.mjs` sha256 `836cb5d430067f2ca73f8e5ae7b8afb660ed1c12ae03deb2453a1a3b8fd3f2e3`, 32872 bytes. Changed paths vs base `4ae99816b8994fdedc159156d8d9d242dd5c4782`: `.ufo/waves/round-20/measure-c1.mjs` only. New commit, no amend.

## Fixture coordination

Sent ExecFixtures the exact corrected heading and mechanics. Static expected cases: one original historical section with stale LC01 plus one corrected section with 12 current rows → exit 0/count 12/no findings; corrected LC07 mismatch → `[table_row_extra, table_row_missing]`; duplicate corrected heading with complete original table and empty duplicate headings → `[table_heading_duplicate]`; malformed extra current `| LC05 (repeat) |` → `[table_row_extra]`; missing, junked, or incomplete source range clause → `[registry_row_invalid]`; well-formed non-covering range → `[decision_anchor_uncovered]`. No evaluator run.

## Evidence and limitations

- Read design manifest metadata and confirmed the counter's original/corrected heading constants, PINS object, and preexisting `checkTable` in the assigned clone.
- No tests, `evaluate` calls, builds, or selftests were run, as directed.
- No tools installed or updated.
- Commit identity and changed paths were confirmed from git; no tests, `evaluate` calls, builds, or selftests were run, as directed.