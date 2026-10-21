# Round 20 C1 fixture-oracle repair handoff

Initial repair commit: `7c98405b9de92aba28c4628bcece2385b5372afd` on `round20/ExecFixturesOracle`, based on `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Follow-up commit: `c6a029e5ede67808243aa02288a0ee5c5aa03148`, based on the initial repair. Both authored/committed as `tabi-shokunin <tabi@shokunin.local>`; neither amended or pushed.

Changed paths vs baseline (only assigned outputs):
- `.ufo/waves/round-20/selftest-c1.mjs` — SHA-256 `e06e0dd210a5b6c23f17a6f43d122774756d682f331d844e6cb29a81c17dceac`
- `corpus/evidence/round-20/selftests/expected.json` — SHA-256 `b52e5a2a4fb82b1367791ff3ce1fea07f5ef8291a6291f4101ad253129569e44`

## Oracle corrections

The previous fixed pairs were retained at the repair clone's base commit, then corrected from producer semantics rather than copied from observed output:

- `wrong_decision_source_override`: old `decision_anchor_uncovered + decision_source_mismatch + registry_backlink_missing` → `decision_source_mismatch`. Effective S099 has no registry row, and `checkDecisionAnchor` returns when there is not exactly one matching row. Both registry backlinks and the note's S096/S100 source tokens remain intact.
- `missing_decision_source_override` and `forced_s096_lc11`: old `decision_anchor_uncovered + decision_source_mismatch + registry_backlink_missing` → `decision_anchor_uncovered + decision_source_mismatch`. The effective S096 row exists but does not cover LC11 lines 787–815; neither registry backlinks nor the note's S096/S100 tokens change.
- `wrong_source_id`: old `decision_source_mismatch + registry_backlink_missing + source_mismatch` → `decision_source_mismatch + source_mismatch`. The table follows effective S097, but the note's fixed Sources line still cites S096 and S100, and used-by claims remain intact.

The first two corrections follow `.ufo/waves/round-20/w2/CounterS100Authority.md`: its bounded probe observed the missing-override pair `decision_anchor_uncovered + decision_source_mismatch` with clean pristine/restored controls (lines 43–74); its wrong-S099 synthetic case is explicitly marked inference (line 14). Static counter behavior confirms the pair differences (`measure-c1.mjs:376–385, 546–552`). The report also describes backlink checks over the whole note and unchanged registry claims (lines 10–14). Wrong-source-id correction follows the same static whole-note token check; no new evaluation was run.

## Added finite coverage

The initial repair added five cases and persisted exact count/exit/finding triples:
- `decision_shape`: LC11 `sourceId` is numeric, with its non-renderable row omitted.
- `decision_unknown_id`: append LC13, with its non-renderable row omitted.
- `decision_text_invalid`: empty LC04 condition, mirrored in the table.
- `table_heading_duplicate`: append a second original lifecycle section heading after the mirrored rows (the prior fixture accidentally duplicated a table-column header and was corrected in the follow-up).
- `lc12_span_crosses_anchor_gap`: LC12 start moves 818→817 and the table mirrors 817–830; expected `decision_anchor_uncovered + span_invalid`.

The joint LC12 pair is the explicitly observed bounded probe in `w2/CounterSpan.md:14–43` (probe output: exit 1, count 12, both reasons; pristine/restored clean). Its static explanation is at lines 9–12. The four new finding fixtures are statically derived from counter validation (`measure-c1.mjs:265–276, 321–370, 406–453`) and have **not** been executed here. The first repair suite had 39 cases; the heading follow-up raised it to 42; the final parser follow-up adds three, for 45 total, still exercising all 24 declared finding ids. This is finite coverage, not semantic truth or exhaustive schema assurance.

The committed clone baseline preserved the prior expected bytes; this repair changes only the two assigned outputs. Design pin remains `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da`; retained source pin remains S096 SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Corrected-heading and scope follow-up

The second commit adds three fixed pairs and preserves the previous 39 cases/pairs:
- `corrected_heading_historical_rows`: one stale LC01 row under the original heading is tolerated; the unique corrected section mirrors all 12 current manifest rows — count 12, exit 0, `[]`.
- `corrected_section_row_mismatch`: only corrected-section LC07 text differs from the manifest — count 12, exit 1, `[table_row_extra, table_row_missing]`.
- `duplicate_corrected_headings`: the original section mirrors all 12 rows; two empty corrected headings produce `table_heading_duplicate` and use historical fallback — count 12, exit 1, `[table_heading_duplicate]`.

The existing `table_heading_duplicate` fixture was corrected from a duplicate table-column header (which did not exercise section-heading validation) to a duplicate original H3 section heading; its finding pair remains unchanged. ExecCounter confirmed all three new layouts and that correction against its committed parser behavior; this was interface coordination, not an evaluated output. Parser evidence: counter commit `a9a82538285dc5dcf8ea223a1bf3251167f3aef8`, `measure-c1.mjs:408–493`.

The pinned fixture scope changed from `source-only Chromium 154.0.8037.97; not runtime-observed` to the parent-authoritative exact literal `source-only Chromium 154.0.8037.97; no new runtime observation in round 20`, matching current `MANIFEST_SCOPE` at counter `:76`. `wrong_scope` remains deliberately mismatched.

Follow-up output SHA-256:
- `.ufo/waves/round-20/selftest-c1.mjs`: `a0d77077f0cc0b8c600d0e0135b41adc955702bc38391574cf439f32b18cd1d6`
- `corpus/evidence/round-20/selftests/expected.json`: `d65f59428fab0c9c384bd477a2a4229083fa881b434ed34fa2e76a12ba1bbeba`

## Final parser row/anchor follow-up

Third commit: `cf0ffe208c5b2339495b2afb0436b6359f06acd2`, based on `c6a029e5ede67808243aa02288a0ee5c5aa03148`; same branch and tabi identity, new commit without amend. Only the two assigned output files changed.

Added three explicit pairs, without adding finding ids:
- `malformed_extra_current_row`: append `| LC05 (repeat) | ... |` in the unique corrected current section, after all 12 valid rows — count 12, exit 1, `[table_row_extra]`.
- `missing_anchor_clause_s100`: remove only S100's `html_form_element.cc:787-815` clause while preserving URL/tag/digest — count 12, exit 1, `[registry_row_invalid]`.
- `trailing_anchor_junk_s100`: put `trailing-junk` inside the S100 range clause before its semicolon — count 12, exit 1, `[registry_row_invalid]`.

The previous `malformed_anchor_s100` (`html_form_element.cc:787-`) remains `[registry_row_invalid]` only. Counter-owner coordination confirms that malformed or missing clauses take the registry-invalid path and return before span coverage; `decision_anchor_uncovered` remains for a valid declared range that does not cover the decision. This is the reason the missing-clause fixture does not expect both reasons. Broad LC-prefixed candidate recognition makes the extra repeated row a table extra even when its id suffix is malformed. Expected pairs follow the stated parser contract; they were not copied from an `evaluate` result.

Final output SHA-256:
- `.ufo/waves/round-20/selftest-c1.mjs`: `037dd9f61c070f988ab3a62bb13991fd2a5c1d9ff99dc7f6122cc3787fca473d`
- `corpus/evidence/round-20/selftests/expected.json`: `c2edb746cd6fed4d7424ac18ba644d83d7b10d553b6a29d911fea8b0676bcc94`

## Verification and limits

No tests, `evaluate` calls, builds, linters, or formatters were run. The main agent owns post-integration verification. No tool was installed or updated. No production, index, or jj state was changed. LSP was unavailable in the mounted tool inventory.
