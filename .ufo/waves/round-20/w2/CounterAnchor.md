# CounterAnchor — round-20 author-side falsification

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Axes: whole-span containment; complete anchor-token parsing; independent expected pairs/source identity; finite fixture coverage; exact restoration and production immutability.

## Result: malformed-anchor mutant survived

One bounded isolated pure-data probe, using Node `v26.12.0`, called the unchanged counter's `evaluate(Map)` exactly three times: pristine, mutated, restored. All four input buffers came from checkpoint blobs through read-only `git cat-file`; the imported counter's working bytes were checked equal to its checkpoint blob. No runner/selftest suite, gate, browser, build, formatter, clone, integration, or target-code execution was performed.

**Exact input delta:** in `corpus/SOURCES.md`, S100's anchor at line 114, insert UTF-8 `.5` at zero-based byte offset **64185**. Registry length changes from **82006** to **82008** bytes. This is one insertion in one registry cell; every other byte remains unchanged.

```diff
-html_form_element.cc:174-328,635-842
+html_form_element.cc:174-328,635-842.5
```

The detector's expected pairs were literal, not recomputed from the implementation:

```json
{"clean":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]},"mutated":{"exit":1,"c1_lifecycle_decisions":12,"findings":["registry_row_invalid"]}}
```

Actual outputs (Node process exit 0; no stderr):

```json
{"pristine":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]},"mutated":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]},"restored":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]}}
```

**Verdict: SURVIVED.** Pristine and restored controls passed, so this is not a baseline-failure/inconclusive result. A decimal endpoint is outside the documented `a-b` / `a` integer-range syntax, but the malformed suffix is accepted cleanly. `measure-c1.mjs:106` stops the match with `(?![\d,-])`, which permits a following period. `declaredRanges` (`239–250`) validates only the matched prefix ending in `842`; it does not consume or reject `.5`. The contract-row check (`505–517`) therefore treats the anchor as parseable, and LC11 remains covered by the parsed `635–842` prefix. This is a mechanical parser/coverage finding, not permission to weaken the integer-range contract.

### Exact restoration evidence

Restoration ran in `finally`; all four restored buffers compared byte-equal to their untouched checkpoint buffers. No input or counter file was written. Only this report is written.

| Input | Pristine SHA-256 | Mutated SHA-256 | Restored SHA-256 |
|---|---|---|---|
| `corpus/SOURCES.md` | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` | `f6a583d7fbeb277748ac6230deb48a83e86562cee5bac4437ea872170dd41b55` | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` |
| `corpus/evidence/round-20/lifecycle/decisions.json` | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` | unchanged | same as pristine |
| `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` | `3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4` | unchanged | same as pristine |
| `corpus/evidence/round-20/sources/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | unchanged | same as pristine |

Examined file SHA-256 pins:

- `measure-c1.mjs`: `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6`.
- `selftest-c1.mjs`: `5804cf6a73a497bfbaf3c6265a7b1852760f6b52d930de4af7ba7674543544a5`.
- `expected.json`: `458a9f3fa069936d0f3e13a4200b122dc9926d787f3d6e068625ff0e9fb744d1`.
- `design.json`: `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da`.

## Whole-span containment and finite anchor fixtures

**Current containment implementation is correct by inspection, not a separate executed probe.** `coversSpan` (`measure-c1.mjs:254–262`) sorts intervals, merges overlapping/adjacent integer ranges, then requires one merged run to contain both `start` and `end`. It does not independently test the endpoints across different runs. An interior hole therefore remains uncovered.

The retained anchor fixtures (`selftest-c1.mjs:342–344`; `expected.json:254–273`) cover only:

| Case | Persisted pair | Independent code-path review |
|---|---|---|
| `wrong_anchor_s100` | count 12, exit 1, `decision_anchor_uncovered` | LC11 is wholly outside `174–328`; consistent. |
| `wrong_anchor_s096` | count 12, exit 1, `decision_anchor_uncovered` | LC12 loses its entire covering interval; consistent. |
| `malformed_anchor_s100` | count 12, exit 1, `registry_row_invalid` | `787-` cannot match the integer-list grammar plus current lookahead; consistent. |

These examples do **not** distinguish whole-span containment from an endpoint-only implementation. A discriminating, unexecuted example is an S100 anchor `html_form_element.cc:174-328,635-787,815-842`: both LC11 endpoints (787, 815) are covered, but 788–814 are not. Its independently required pair is count 12, exit 1, `decision_anchor_uncovered`. There is no retained fixture for that hole, positive adjacency/overlap merging, or the decimal-suffix mutant above. Other rejected forms checked in source—zero, reversed, unsafe-integer and repeated filename anchors—also lack dedicated cases in this finite set. This inspection does not claim those unexecuted cases pass or fail.

## Expected-pair independence: additional static mismatches

Expected results are persisted, not regenerated by the runner. `loadExpected` (`selftest-c1.mjs:130–162`) loads them, and `compare` (`347–359`) compares exact counts/exits/sorted findings. Nevertheless, several persisted pairs conflict with the constructed fixtures. The following are **[INFERENCE] code-derived pairs, not executed selftest outputs**:

| Fixture | Persisted findings | Independently traced findings |
|---|---|---|
| `wrong_decision_source_override` | `decision_anchor_uncovered`, `decision_source_mismatch`, `registry_backlink_missing` | `decision_source_mismatch` only. Fixture S099 has no registry row; `checkDecisionAnchor` returns for a missing row (`measure-c1.mjs:378–379`). |
| `missing_decision_source_override` | `decision_anchor_uncovered`, `decision_source_mismatch`, `registry_backlink_missing` | `decision_anchor_uncovered`, `decision_source_mismatch`. |
| `forced_s096_lc11` | `decision_anchor_uncovered`, `decision_source_mismatch`, `registry_backlink_missing` | `decision_anchor_uncovered`, `decision_source_mismatch`. |
| `wrong_source_id` | `decision_source_mismatch`, `registry_backlink_missing`, `source_mismatch` | `decision_source_mismatch`, `source_mismatch`. |

All four remain count 12 / exit 1. The extra backlink reason is unsupported because `renderNote` always emits a literal Sources line naming both S096 and S100 (`selftest-c1.mjs:209`), and the fixed registry rows retain their correct note backlinks. `override_table_mismatch` does consistently require its persisted four reasons: uncovered anchor, source mismatch, extra table row, missing table row. These observations were shared with CounterSourceIdentity, without running any additional detector.

## Source pin and finite schema limits

- The fixture runner carries an independent literal PIN and twelve literal decisions (`selftest-c1.mjs:36–70`), rather than importing counter PINS. `preflight` independently checks retained source SHA-256 and quote/span/authority validity (`167–180`); `loadExpected` checks expected source id/path/URL/hash (`138–141`). The one probe separately compared the committed source digest and expected source digest to the literal design pin above. No upstream re-fetch was done.
- Read-only blob-object comparisons showed the examined working files match the named checkpoint. The actual design SHA-256 matches the persisted declaration. The runner does **not** enforce `expected.design.sha256`; that field is metadata at `loadExpected`, not a runtime guard against design drift.
- Data inspection counted **34 cases**, **20 expected reasons**, **24 registered reasons**. The unexercised registered ids are `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, and `table_heading_duplicate`. The loader verifies that expected reasons are registered, not that every registered reason is exercised; thus a clean suite, if obtained, would still not establish complete finite-schema branch coverage.

This is author-side evidence only; no external closure or shipping judgment. Mechanical validation of twelve documented source-only rows is not semantic truth, a depth-scalar increase (scalar remains 8), runtime behavior, capability/domain coverage, or exhaustive lifecycle coverage. No tools were installed or updated.

Report: .ufo/waves/round-20/w2/CounterAnchor.md
