# Counter backlink review: registry_backlink_missing and expected pairs (round 20, C1)

Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Files: `measure-c1.mjs` (30974 B, counter v3), `selftest-c1.mjs` (23075 B), `corpus/evidence/round-20/selftests/expected.json` (8522 B). Registry: `corpus/SOURCES.md` S096 (line 110) and S100 (line 114). Note: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. All read from committed blobs; the cited files have no working-tree drift.

Method: static trace of all 34 expected cases against the producer. Nothing executed. Untested per contract.

## Axes
1. Pair fidelity: does each persisted pair equal what the committed producer emits?
2. Independence: were pairs derived from producer semantics, or copied from predictions?
3. Backlink strength: is a missing S096/S100 citation detected on the registry side and on the note side?
4. Finite coverage: are the 24 finding ids and the registry branches exercised?

## Verdict
Not clean at the checkpoint (static prediction). 30 of 34 pairs match the producer by trace. Four pairs expect a backlink or anchor finding that the producer never emits. The expected file also encodes two incompatible note-citation rules. Resolve F1 and F2 before the integrated `--selftest`, which `run-checks.py:62` registers.

## F1 (High): four pairs disagree with the committed producer

| case (expected.json name line) | expected findings | producer, static trace | cause |
|---|---|---|---|
| wrong_source_id (164) | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | Note still has the Sources line naming S096 and S100 (selftest:209). Registry untouched. S097 rows are silent at measure-c1.mjs:379. |
| wrong_decision_source_override (185) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | LC11 cites S099, which has no registry row, so `checkDecisionAnchor` returns (measure-c1.mjs:379). Note still names S100 in its Sources line. |
| missing_decision_source_override (192) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | Note still names S100 in its Sources line. |
| forced_s096_lc11 (206) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | Note still names S100 in its Sources line. |

Predicted `--selftest` output: four `FAIL_DETAIL` lines for the rows above, then `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1.

The direct registry branch is correct. `usedBy.includes(NOTE_PATH)` (measure-c1.mjs:520-521) is exact after the `[,;]` split. It is exercised by missing_registry_backlink and s100_backlink_missing, and both match. The four failures are all on the note side or the anchor side.

## F2 (High): expected.json encodes two incompatible note-citation rules

- **Whole-note rule (producer, measure-c1.mjs:546-547):** S096 and S100 must each appear somewhere in the note. Every fixture keeps the Sources line (selftest:209), so this always passes. Under this rule the four F1 cases must not raise a backlink.
- **Row-level rule (handoff and predictions):** the LC11 row must cite S100, and at least one non-LC11 row must cite S096. The four F1 cases require exactly this. The handoff states it at ExecCounter.md:86: "The note must cite S100 through its LC11 row."
- **manifest_malformed_json** (name line 66; selftest:315) is the one case written to the whole-note rule, with findings `[manifest_malformed]`. Its note has zero LC rows, so it fails the row-level rule. ExecCounter predicted `[manifest_malformed, registry_backlink_missing]` (ExecCounter.md:76). The fixture writer changed only this case, deliberately ("keeps the backlink check quiet", ExecFixtures-return.txt:28), and kept the four others.

No single rule reproduces expected.json.

**Counterexample to the shipped rule:** forced_s096_lc11. The LC11 row cites S096 and the note mentions S100 in its Sources line, so no backlink is raised. The note no longer cites the S100 authority for LC11. The manifest-level decision_source_mismatch still fires, but the note-level backlink passes silently.

**Why the whole-note check is weak:** in every fixture where checkTable runs, the whole-note check never fires alone. It passes through the Sources line even when the rows cite the wrong ids (wrong_source_id, forced_s096_lc11). The only state where it could fire alone is a manifest that does not parse or whose decisions is not an array. There checkTable is skipped (measure-c1.mjs:540-541), and the Sources line still defeats the check (manifest_malformed_json). The committed tree also carries no rule text beyond the executor's self-description (ExecCounter.md:50 and :61).

**Recommendation (row-level).** In `evaluateComplete`, read the note table rows under the heading, the same section checkTable uses. Compute the check from the note alone, so it runs even when the manifest is malformed:
- the LC11 row must contain the boundary-checked token S100;
- at least one non-LC11 row must contain the token S096.

Under this rule the valid note still passes (`S100:787-815` on the LC11 row). The expected changes are: manifest_malformed_json becomes `[manifest_malformed, registry_backlink_missing]`. The other F1 pairs stand, except the anchor finding in F4.

**Alternative (whole-note):** correct the four F1 pairs to producer output, and accept that the LC11 note citation is unenforced. Main must confirm the rule with the parent, since the parent's text is not in the committed tree.

## F3 (Medium): the note-level backlink branch kills no mutant in the current suite
- No case removes or misspells a token from the Sources line. Every case keeps both tokens, so deleting measure-c1.mjs:546-547 leaves all 34 results unchanged.
- The token boundary (`(?<![A-Za-z0-9])` and `(?![0-9])`) is untested. Near-miss tokens such as `S0961` or `XS096` are not exercised.

## F4 (Medium): anchor finding for an unregistered cited id is asserted by one case and contradicted by another
- wrong_decision_source_override expects decision_anchor_uncovered for an LC11 cite of S099, which has no row. The producer is silent at measure-c1.mjs:379. The comment at 374-375 says a missing row is "reported by the registry checks, not here."
- wrong_source_id (expected line 167) has eleven decisions citing unregistered S097 and expects no anchor finding. That agrees with the silent rule, so the two expectations conflict with each other.
- Recommendation: adopt the silent rule, which matches the producer, wrong_source_id, and s100_row_missing. Remove decision_anchor_uncovered from wrong_decision_source_override. Its expected set becomes `[decision_source_mismatch, registry_backlink_missing]` once F2 is applied.

## F5 (Medium): expected pairs were copied from predictions and never run
- expected.json is static, not written by running the producer. Its content came from predictions. ExecCounter.md:4 states "Nothing was executed," and its predicted sets (ExecCounter.md:66-76) are the source of the F1 pairs.
- ExecFixtures-return.txt:35: "I never opened or copied measure-c1.mjs. Every reason set comes from ExecCounter's messages plus the spec." Its "Confirmed" list (line 34) means agreement with predictions, not a run. F1 is the failure that this process produced.
- Pins are consistent. The source id, path, url and sha256 match across design.json, the SOURCES.md S096 row, expected.json, measure-c1.mjs and selftest-c1.mjs. The retained blob hashes to `8c8d6796…6916`. The design.json hash `1c9f536e…` matches the expected.json header. The design hash is informational only; no code reads it.
- Low: `selftest-c1.mjs` loadBlob reads the working-tree blob, while the producer reads committed blobs. A dirty tree can change the selftest without a commit.

## F6 (Medium): finite schema coverage gaps
- The producer registers 24 finding ids. The expected file exercises 20. Unexercised: `decision_shape`, `decision_unknown_id`, `decision_text_invalid`, `table_heading_duplicate`. ExecFixtures-return.txt:37 concedes this.
- Registry branches with no case:
  - S096 row absent or duplicated (checkContractRow, measure-c1.mjs:507-510, reports registry_row_invalid).
  - Registry file absent, no `## Registry` heading, or missing `used-by`/`anchor` column (parseRegistry, 458-500).
  - used-by near misses: a path with NOTE_PATH as a substring, prefix or suffix (`…round-20.md.bak`, `old/corpus/knowledge/…round-20.md`), or a space-separated list without commas. The exact-equality check is correct but unpinned. A `includes(rawCell)` mutant survives.

## F7 (Low-Medium): registry rows are read by header index with no width check
- `cellsOf` (224) and the header-derived `columns` map (482) index cells positionally. checkContractRow reads source (1), anchor (5), teaches (6), status (7) and used-by (10) with no check that the cell count equals the header count.
- Static trace: an S100 row with an unescaped `|` inside `teaches` yields `[registry_backlink_missing, registry_status_invalid]` (used-by and status read shifted cells). It does not yield `registry_row_invalid`. No case covers this.

## F8 (Low): an anchor with no `html_form_element.cc:` range part passes the registry check
- `declaredRanges` returns `[]` when the file marker is absent (measure-c1.mjs:241). checkContractRow rejects only `null` (516). The header's Citation paragraph requires "a parseable `html_form_element.cc:<ranges>` part."
- Static trace: an S100 anchor with the range part removed yields `[decision_anchor_uncovered]`. The malformed form `787-` (malformed_anchor_s100) yields `[registry_row_invalid]`. Absent and malformed ranges are treated inconsistently against the header contract.
- Red case: remove the range part from the S100 anchor and expect `[registry_row_invalid]`. The current producer fails this.

## F9 (Info, design question): baseline ignores the registry
- Both manifest and note absent returns `summarize([], 0)` (evaluate, measure-c1.mjs:564). The ExecCounter counting rules say the registry is ignored in this state. baseline_absent0 uses an empty Map, so no case pins a registry whose used-by names a note that does not exist. This looks intentional; main should confirm it.

## Real checkpoint registry (static read, not executed)
- S096 used-by: `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Exact token present.
- S100 used-by: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Exact.
- Both status `mined`. S100 teaches opens `supersedes S096 —`. Both source cells carry the URL token. Both anchors carry `decoded sha256 8c8d…6916`.
- Note line 1 carries `source:S096+S100`, and the LC rows cite S096 and S100.
- The real registry should pass the registry checks. Untested. Real-note table equality (checkTable) was not checked.

## Recommended red cases (ordered)
**Blocking**
1. Reconcile F2 and F4. Row-level (recommended) needs the producer change in F2 plus two expected edits: manifest_malformed_json becomes `[manifest_malformed, registry_backlink_missing]`, and wrong_decision_source_override drops decision_anchor_uncovered. Whole-note needs no producer change, only four expected corrections: wrong_source_id `[decision_source_mismatch, source_mismatch]`; wrong_decision_source_override `[decision_source_mismatch]`; missing_decision_source_override and forced_s096_lc11 `[decision_anchor_uncovered, decision_source_mismatch]`. After the chosen option, expected equals producer output for all 34 by trace.

**Additions** (expected findings in brackets)
2. S100 used-by `corpus/knowledge/webmcp-completion-lifecycle-round-20.md.bak` [registry_backlink_missing]. S096 used-by space-separated, no comma [registry_backlink_missing].
3. S096 row removed [registry_row_invalid]. S096 row duplicated [registry_row_invalid].
4. `corpus/SOURCES.md` absent [registry_row_invalid].
5. S100 anchor with the `html_form_element.cc:` range part removed [registry_row_invalid]. Fails today (F8).
6. S100 row with an unescaped `|` in teaches [registry_row_invalid]. Fails today (F7).
7. LC06 `quote` key deleted [decision_shape], count 12.
8. Extra LC13 decision [decision_unknown_id], count 13.
9. LC01 condition containing `|` in manifest and note row [decision_text_invalid], count 12.
10. Heading line appended a second time at note end [table_heading_duplicate], count 12.

**Survivors today and their kills:** (a) deleting the note-level branch (F3): killed once the row-level branch exists (manifest_malformed_json, forced_s096_lc11, wrong_source_id). (b) raw-cell substring used-by (F6): item 2. (c) token-boundary removal (F3): not killed by any item; add a case with the manifest malformed, note rows citing only `S0961` and `XS100`, and no other S096/S100 token, expecting `[manifest_malformed, registry_backlink_missing]`. (d) S096 row missing or duplicated (F6): item 3. (e) absent anchor ranges treated as null (F8): item 5.

## Scope and verification
- Static trace only. Untested. Main should run `node .ufo/waves/round-20/measure-c1.mjs --selftest` once integrated. Predicted: `verdict=failed`, exit 1, four FAIL_DETAIL lines (F1), until F2 and F4 are reconciled.
- Read-only commands only: git show, git grep, git cat-file, git diff, git status, and sha256 of blob streams. No installs or updates. Only this report was written.
- Mechanical scope only. The count of 12 is mechanical. Nothing here judges semantic truth of any row, the depth scalar, or runtime capability.
- Author-side finding, not external closure.

Report: .ufo/waves/round-20/w2/CounterBacklinks.md
