# CounterSpan — span/anchor interaction

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.

Axes: span-pin correctness; anchor/reason composition; independent expectations and source authenticity; finite schema coverage; exact isolation/restoration.

## Findings

1. **Coverage gap: no persisted joint span/anchor case.** The committed runner and expected file contain 34 matching case names. Only `invalid_span_reversed` expects `span_invalid`; its exact pair is count 12, exit 1, findings `["span_invalid"]`. The anchor-only fixtures preserve valid pinned spans (`selftest-c1.mjs:322,342-344`; `expected.json:115-119,255-273`). No persisted case expects both `span_invalid` and `decision_anchor_uncovered`. [INFERENCE] Skipping anchor validation after finding a bad span would therefore evade these existing cases; that counter-code mutant was not executed. The one permitted input mutation below exercises this missing interaction and is rejected correctly.
2. **Finite vocabulary, not exhaustive finding/schema coverage.** Expected cases exercise 20 declared reasons out of 24 registered reasons. Unrepresented: `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, `table_heading_duplicate`. `loadExpected` requires sorted unique reasons, registered membership, internally consistent exit/findings, the exact case-name set, and use of every *declared* reason; it does not require all registered reasons to appear (`selftest-c1.mjs:130-161`). There are no persisted changed-but-ordered span fixtures or non-safe-integer endpoint fixtures. This is a coverage finding, not a reason to change the contract.
3. **Reversal and anchor coverage are separate checks.** Safe-integer endpoints differing from the design pin yield `span_invalid` (`measure-c1.mjs:353-357`). Anchor checking still runs for these entries (`:394-397`), but `coversSpan` tests containment inequalities without testing `start <= end` (`:253-263`). Thus the reversed LC03 fixture, 258-249, adds no anchor finding under S096's 174-328 range. Quote checks use the original pinned span, not the submitted reversed/changed span (`:317-318,365-367`). [INFERENCE, not executed] An ordered within-anchor change likewise yields only `span_invalid`; a reversal across a registry gap can also satisfy those containment inequalities. Exact span pinning still rejects these inputs, so this is not an observed clean-admission bypass.
4. **Expectations are read, not regenerated from detector results.** The runner checks persisted expected pairs using independent hardcoded `PIN`/`DECISIONS`, validates expected source identity against that pin, and digest-checks the retained source before calling `evaluate` (`selftest-c1.mjs:36-70,130-179,347-385`). This establishes structural independence, not how the expectations were originally authored. The committed expected source record equals the committed design source; the actual retained-source hash equals the pin. The expected design digest also matches the committed design, although `loadExpected` does not enforce its `design` metadata.

## One bounded mutation probe

One existing Node.js process (`v26.12.0`), three calls to the same pure `evaluate(Map)`: pristine, mutated, restored. All four input buffers came from `git cat-file blob CHECKPOINT:PATH`; the imported counter bytes were required to equal its checkpoint blob. The selftest runner was read as data only, not executed. No browser or Chromium target code ran.

**Mutant:** expand LC12's citation one line into the S096 anchor gap: start 818 → 817, end 830 unchanged. Mirror only the table citation so table mismatch is not a confounder. Registry, source, quote, source identity and every other byte remain unchanged.

Exact input delta (zero-based byte offsets):

```json
{"delta":[{"path":"corpus/evidence/round-20/lifecycle/decisions.json","before":"      \"startLine\": 818,","after":"      \"startLine\": 817,","changes":[{"offset_zero_based":6195,"before_hex":"38","after_hex":"37"}]},{"path":"corpus/knowledge/webmcp-completion-lifecycle-round-20.md","before":" | S096:818-830 |","after":" | S096:817-830 |","changes":[{"offset_zero_based":7875,"before_hex":"38","after_hex":"37"}]}]}
```

**Independent expected detector:** literal expectations were fixed before any `evaluate` call, not copied from output. LC12's design pin is 818-830; S096 declares 174-328,729-758,818-842. Therefore 817-830 both differs from the pin and crosses an uncovered line. The mirrored row should match; the authentic source and unchanged quote should add no other finding.

| Phase | Expected count | Expected exit | Expected findings |
|---|---:|---:|---|
| Pristine | 12 | 0 | `[]` |
| Mutated | 12 | 1 | `["decision_anchor_uncovered","span_invalid"]` |
| Restored | 12 | 0 | `[]` |

Actual result payloads:

```json
{"phase":"pristine","output":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]},"matches_independent_expected":true}
{"phase":"mutated","output":{"exit":1,"c1_lifecycle_decisions":12,"findings":["decision_anchor_uncovered","span_invalid"]},"matches_independent_expected":true,"mutation_error":null}
{"phase":"restored","output":{"exit":0,"c1_lifecycle_decisions":12,"findings":[]},"matches_independent_expected":true,"byte_exact_restoration":true}
{"verdict":"killed","evaluate_calls":3,"production_writes":0,"map_hash_restored":true}
```

Probe process exit: `0`; stderr: empty. **Verdict: killed** (the input mutant was rejected with exactly the independently predicted pair). This is not a counter-code mutation/selftest-suite kill claim.

## Hashes and restoration

SHA-256 of checkpoint review artifacts (never modified):

| Artifact | SHA-256 |
|---|---|
| `.ufo/waves/round-20/measure-c1.mjs` | `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6` |
| `.ufo/waves/round-20/selftest-c1.mjs` | `5804cf6a73a497bfbaf3c6265a7b1852760f6b52d930de4af7ba7674543544a5` |
| `corpus/evidence/round-20/selftests/expected.json` | `458a9f3fa069936d0f3e13a4200b122dc9926d787f3d6e068625ff0e9fb744d1` |
| `.ufo/waves/round-20/design.json` | `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da` |

Input aliases: M = `corpus/evidence/round-20/lifecycle/decisions.json`; S = `corpus/evidence/round-20/sources/html_form_element.cc`; N = `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`; R = `corpus/SOURCES.md`.

| Input | Pristine SHA-256 | Mutated SHA-256 | Restored SHA-256 |
|---|---|---|---|
| M | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` | `00d386339bb50e994009fb3d0976695593e912f544375347f955c40c174ac827` | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` |
| S | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| N | `3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4` | `6a8833bda3a1a0c5b747139f2fa8e434e33dc020e927e654740398ab24f39e0c` | `3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4` |
| R | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` |

Map fingerprints, SHA-256 of UTF-8 JSON `[[path,fileSHA256],...]` in M,S,N,R order:

- Pristine: `98c599bdfac5355c813ff3c7d637c77e03f8828d8904a68d652060fb9433d68c`
- Mutated: `d59824140406baaefb79f452b54b819ada25ae2fe528b84f606284dac7f3743d`
- Restored: `98c599bdfac5355c813ff3c7d637c77e03f8828d8904a68d652060fb9433d68c`

Restoration ran in `finally`, replacing every in-memory input with its saved exact bytes; all four passed byte equality and the restored detector returned clean. No scratch clone, production edit, index/jj change, commit, or temporary script was created. Only this assigned report was written. No tools were installed or updated.

## Limits

Full selftests/builds/formatters/gates: **not run**. Findings are author-side, not external closure. Mechanical validation is not semantic truth: C1 remains twelve documented source-only rows, depth scalar remains 8, and no runtime, capability, domain-coverage, or exhaustive lifecycle claim follows.

Report: .ufo/waves/round-20/w2/CounterSpan.md
