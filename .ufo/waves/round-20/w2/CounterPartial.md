# CounterPartial: round-20 C1 baseline/partial trio and expected-pair review

Pin: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (checkpoint). Files read with `git show` / `git cat-file` at the pin. The working-tree copies are byte-identical (`git diff --stat 4ae99816 -- <paths>` is empty), so line numbers below apply to both.

Method: static trace of the committed `measure-c1.mjs`, `selftest-c1.mjs` and `expected.json`. Nothing was executed (no selftest, no CLI run, no tests). Read-only checks only: `git cat-file`, `sha256sum`, one read-only `jq` query over the real manifest, note and source, and `read`/`grep`. No installs or updates. No clones, no production edits, no commits. This file is the only write.

## Result

1. The three named cases are correct. `baseline_absent0` expects 0 / exit 0 / []. `partial_manifest_without_note` expects 12 / exit 1 / [partial_state]. `partial_note_without_manifest` expects 0 / exit 1 / [partial_state]. Each matches the header contract and the producer branches (measure-c1.mjs:564-567). No source or registry state can make either partial case exit 0.
2. The committed `expected.json` disagrees with the committed producer on four pairs (F1). Predicted red at 4ae99816 for `selftest-c1.mjs`, and for the wave's `lifecycle` gate, since `run-checks.py` runs `measure-c1.mjs --selftest` with expectedExit 0. The corrected values in `fixture-oracle-handoff.md` (commit 7c98405; I did not open that commit) match my trace.
3. Strongest missing red case (F2): a manifest whose `decisions` is not an array. Deleting measure-c1.mjs:297 turns it into exit 0 with count 0, which the CLI reports as verdict `baseline`. No expected pair catches this.
4. The no-credit rules in `main()` have no red case (F3). The selftest imports `evaluate()` only.
5. The real checkpoint inputs satisfy every producer rule I could check mechanically (see the spot check). The after target (12) is therefore real, not credited from the empty prior. Predicted CLI result at 4ae99816: exit 0, count 12, verdict `clean`. Not executed.

## Invariant (by trace)

On the current branches, exit 0 occurs only for both-absent (count 0) or for the complete exact 12-decision state (count 12). A present manifest reaches exit 0 with count 0 only if measure-c1.mjs:297 is removed (F2). Exit 1 with a nonzero count (`partial_manifest_without_note`, count 12) is never admitted by exit. A consumer that reads the scalar without checking exit would credit it (F8).

## Trio: expected pair against producer trace

| case | expected at 4ae99816 | producer trace | verdict |
|---|---|---|---|
| baseline_absent0 | 0 / 0 / [] | measure-c1.mjs:564 `summarize([], 0)` | matches "Baseline ... 0 with exit 0" |
| partial_manifest_without_note | 12 / 1 / [partial_state] | :565-567, manifest parsed, decisionCount 12 | matches; count not admitted because exit is 1 |
| partial_note_without_manifest | 0 / 1 / [partial_state] | :566-567, doc null, count 0 | matches |

Mutant sweep on the baseline and partial branches (by trace):

| mutant | killed by |
|---|---|
| both-absent returns exit 1 | baseline_absent0 |
| both-absent returns partial_state finding | baseline_absent0 |
| both-absent count set to 12 | baseline_absent0 (count check in compare) |
| `&&` changed to `\|\|` at :564 | partial_manifest_without_note, partial_note_without_manifest (partial exits 0) |
| partial branch returns exit 0 | partial_manifest_without_note, partial_note_without_manifest |
| partial count forced to 0 | partial_manifest_without_note |
| partial early return removed | partial cases (evaluateComplete throws on null note, caught as failure) |
| verdict `baseline` changed to `clean` (:748) | SURVIVES (no CLI case) |
| exit code forced to 0 in main() | SURVIVES (no CLI case) |
| :297 non-array guard removed | SURVIVES (F2) |

## F1 (high): four expected pairs are unreachable by the committed producer

| case | expected at 4ae99816 | producer trace | cause |
|---|---|---|---|
| wrong_source_id | decision_source_mismatch, registry_backlink_missing, source_mismatch | decision_source_mismatch, source_mismatch | Backlink test is whole-note (measure-c1.mjs:546). renderNote always writes a Sources line naming S096 and S100 (selftest-c1.mjs:209). |
| wrong_decision_source_override (LC11 S099) | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_source_mismatch | S099 has no registry row, so checkDecisionAnchor returns (:379). Backlink as above. |
| missing_decision_source_override | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | Backlink as above. |
| forced_s096_lc11 | decision_anchor_uncovered, decision_source_mismatch, registry_backlink_missing | decision_anchor_uncovered, decision_source_mismatch | Backlink as above. |

Consequences: `selftest-c1.mjs` should print four `FAIL_DETAIL` lines and `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1 (predicted, not run). The handoff's corrected values match this trace.

Fixing the expected side is safe for credit. The whole-note token check decides only whether registry_backlink_missing appears. Table-row checks (table_row_missing, table_row_extra) and decision_source_mismatch independently reject any note row that differs from the manifest, so a prose Sources line cannot admit a wrong note.

Also fragile: `manifest_malformed_json` expects only [manifest_malformed], which holds only because the Sources line supplies the tokens. RC-2 pins the other side.

## F2 (high): exit-0 masquerade survivor (decisions not an array)

- Mutant: delete measure-c1.mjs:297 (`if (!Array.isArray(doc.decisions)) findings.add(FINDING.manifestShape)`).
- Fixture: valid manifest with `"decisions": {}`; note, source and registry valid.
- Result: no findings, decisionCount 0, exit 0. The CLI then reports verdict `baseline` (:748).
- No CASES entry (selftest-c1.mjs:310-344) has a non-array decisions value. Killer: RC-1.

## F3 (high for the credit question): no-credit rules in main() are untested

The selftest imports only `evaluate()` and `FINDING_IDS`. The verdict mapping (:747-748), the exit assignment, and absent-path handling in main() are never exercised. Killer: RC-14, an external CLI harness. The selftest spawns no child by design (header line 11), and `repoRoot()` resolves to the script's own repository, so the harness must copy the script into a temporary repo.

## F4 (medium): finding vocabulary check is one-directional

- selftest-c1.mjs:145 requires each expected reason to be registered (expected is a subset of FINDING_IDS).
- selftest-c1.mjs:161 requires the expected vocabulary to equal the exercised reasons.
- Nothing requires FINDING_IDS to be a subset of the expected vocabulary.
- At 4ae99816 there are 24 registered ids and 20 are exercised. `decision_shape`, `decision_unknown_id`, `decision_text_invalid` and `table_heading_duplicate` are never exercised, and the runner still passes. The handoff's five added cases cover all four. The equality check (RC-15) stops a future id from shipping untested.

## F5 (medium): red-case gaps in registry and note checks

- Note-level backlink (:546-548): no case removes both S096 and S100 tokens. Deleting the check survives. Killer: RC-2.
- S096 contract row: all registry red cases target S100. The S096 status, URL and digest checks have no killer. Killers: RC-3, RC-4.
- Registry absent (:459-461): no killer. RC-5.
- Manifest `source.sha256` (sourceRecordMatches): only url, id and path are exercised. RC-6.
- Manifest extra top-level key (:294): no killer. RC-7.

## F6 (low-medium): boundary and anchor-grammar gaps

- A 25-word quote is accepted, but no positive case sits at the boundary, so a `>` to `>=` mutant survives. RC-9.
- Adjacent declared ranges merge in coversSpan (`first <= run+1`). Untested. RC-10.
- A reversed declared range is untested (declaredRanges `first <= last`). RC-11.
- An anchor with no `html_form_element.cc:` part gives `declaredRanges` = [] (:241). checkContractRow flags only null, so the result is decision_anchor_uncovered for each S096 decision. The header says the row "must carry ... a parseable html_form_element.cc:<ranges> part", which reads as registry_row_invalid. Choose one and pin it. RC-12.

## F7 (low): design pin is decorative

`expected.json` pins `design.sha256` = 1c9f536e... This is never read by `selftest-c1.mjs` (only a comment at :12-13). The value does match the checkpoint `design.json` (sha256 computed) and integration.json `designAuthoritativeSha256`. Either verify it in the runner or drop the field (RC-16). Note that `loadBlob` reads the working tree rather than the pinned commit. A digest mismatch exits 2, so this is not silent.

## F8 (residual, consumer rule): partial scalar

`partial_manifest_without_note` reports c1 = 12 with exit 1, and this is pinned by design. Non-admission depends on consumers requiring exit 0 and verdict `clean`. No automated consumer in the wave reads the C1 scalar: check-wave.mjs does not reference measure-c1, counts.mjs counts SOURCES rows, and run-checks.py consumes only `--selftest` exit codes. Cheapest mitigation: state the rule in the scribe/main checklist. The producer-side alternative (emit null for exit != 0) is a contract change that touches most expected counts.

## Real checkpoint spot check (mechanical, not the producer)

Read-only `jq` over the committed-identical files, plus raw reads of the registry rows:

- 12 decisions. Every span is inside the source (1741 lines). Every quote is literal inside its span. Word counts run 1 to 8.
- Each rendered row appears exactly once in the note. The LC rows are at lines 29-40 and sit inside the one exact heading section (heading line 25, next heading line 46).
- S096 row: status mined. Anchor `174-328,729-758,818-842` with the exact decoded sha part. used-by names the note.
- S100 row: status mined. Anchor `174-328,635-842` covers LC11 787-815. Teaches begins `supersedes S096 —`. used-by names the note.
- Manifest top-level keys are exactly decisions, schema, scope, source. Decision keys match the spec; sourceId appears only on LC11. No runtime wording. No pipes or newlines in condition or outcome.
- Baseline c49929: manifest, note and source absent; SOURCES.md present. Predicted verdict `baseline`.

## Handoff cross-check (7c98405, pairs traced from its description, not opened)

- The four corrected pairs are consistent with F1.
- The five added cases are consistent with the producer:
  - decision_shape via numeric LC11 sourceId: returns [decision_shape].
  - decision_unknown_id via LC13: [decision_unknown_id], count 13.
  - decision_text_invalid via empty LC04 condition: [decision_text_invalid].
  - table_heading_duplicate via appended header: [table_heading_duplicate].
  - lc12_span_crosses_anchor_gap: [decision_anchor_uncovered, span_invalid].
- Not covered by that repair: F2, F3, F5, F6, F7.

## Recommended red cases (all: count / exit / findings)

| id | fixture or mutation | expected | kills |
|---|---|---|---|
| RC-1 | manifest decisions = {}, other fields valid | 0 / 1 / [manifest_shape] | F2 (:297) |
| RC-2 | note with no Sources line and no S096 or S100 token anywhere; all 12 rows omitted | 12 / 1 / [registry_backlink_missing, table_row_missing] | note-level check (:546) |
| RC-3 | S096 registry status `queued` | 12 / 1 / [registry_status_invalid] | S096 status check |
| RC-4 | S096 source cell URL names tag 154.0.8037.98 | 12 / 1 / [registry_row_invalid] | S096 URL check |
| RC-5 | SOURCES.md absent | 12 / 1 / [registry_row_invalid] | parseRegistry undefined branch (:459) |
| RC-6 | manifest source.sha256 = 64 zeros | 12 / 1 / [source_mismatch] | sha branch of sourceRecordMatches |
| RC-7 | extra top-level manifest key | 12 / 1 / [manifest_shape] | sameKeys (:294) |
| RC-8 | LC06 entry without quote key | 12 / 1 / [decision_shape] | keys-valid branch |
| RC-9 | LC09 quote = first 25 whitespace tokens of span 298-319 (literal) | 12 / 0 / [] | `>` vs `>=` at the word limit |
| RC-10 | S100 anchor `html_form_element.cc:787-800,801-815` | 12 / 0 / [] | adjacency merge in coversSpan |
| RC-11 | S100 anchor `html_form_element.cc:815-787` | 12 / 1 / [registry_row_invalid] | first <= last in declaredRanges |
| RC-12 | S096 anchor with no html_form_element.cc part | pin the header choice: [registry_row_invalid], or keep current [decision_anchor_uncovered] | F6 |
| RC-13 | manifest and note absent; source and registry present | 0 / 0 / [] | source-only commit is baseline, no credit |
| RC-14 | external CLI harness in a temp repo: (a) registry and source only gives verdict baseline, exit 0, c1 0; (b) manifest only gives failed, exit 1, c1 12, [partial_state]; (c) note only gives failed, exit 1, c1 0, [partial_state]; (d) nonexistent REV gives exit 2, revision_unresolved, c1 null | per case as listed | F3 (:747-748 and exit assignment) |
| RC-15 | runner: require expected reasons to equal FINDING_IDS | loader fault if unequal | F4 (:145, :161) |
| RC-16 | runner: read design.json and compare sha256 to expected.design.sha256, or drop the field | fault if unequal | F7 |
| RC-17 (optional) | manifest only plus corrupt source bytes | 12 / 1 / [partial_state] | pins that partial never consults source or registry |

## Verification for main (predicted, not executed)

- `node .ufo/waves/round-20/selftest-c1.mjs` at 4ae99816: four FAIL_DETAIL lines for F1, `MEASURE_C1_SELFTEST verdict=failed cases=34 reasons=20`, exit 1.
- `node .ufo/waves/round-20/measure-c1.mjs 4ae99816b8994fdedc159156d8d9d242dd5c4782`: verdict `clean`, exit 0, c1 12.
- `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb`: verdict `baseline`, exit 0, c1 0.

## Gaps and tools

- Nothing executed. All predicted outputs are static.
- 7c98405 files were not opened. Its pairs were traced from the handoff text only.
- Installs and updates: none. `jq` was already present and used read-only.

Report: .ufo/waves/round-20/w2/CounterPartial.md
