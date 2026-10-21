# CounterS100Authority — author-side falsification

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Axes: authority-pin integrity; independent fixed-oracle correctness/finite coverage; exact restoration/noninterference.

## Finding: fixed authority-loss expectations overpredict backlinks

The counter rejects loss of LC11's S100 override, but the persisted expected reasons do not match its backlink contract.

- `corpus/evidence/round-20/selftests/expected.json:185-210` includes `registry_backlink_missing` for wrong, missing, and forced-S096 LC11 overrides.
- `.ufo/waves/round-20/measure-c1.mjs:505-552` checks backlinks only on the pinned S096/S100 registry rows and the presence of both source tokens somewhere in the note. Neither backlink condition changes when one LC11 citation changes.
- `.ufo/waves/round-20/selftest-c1.mjs:197-217,268-295,332-335` leaves those registry backlinks intact and always renders a Sources line naming both S096 and S100.
- **Observed:** the single committed-buffer probe below returns only `decision_anchor_uncovered` and `decision_source_mismatch`, not the persisted third reason, for the missing-override/mirrored-row facet.
- **[INFERENCE; runner not executed]** The synthetic `missing_decision_source_override` and `forced_s096_lc11` cases likewise produce count 12, exit 1, and those same two reasons. `wrong_decision_source_override` should produce only `decision_source_mismatch`: its synthetic registry has only S096 and S100 (`selftest-c1.mjs:252-260`), so the missing S099 match makes `checkDecisionAnchor` return without adding an uncovered finding (`measure-c1.mjs:376-385`). Its persisted pair additionally overpredicts `decision_anchor_uncovered`.

This is an oracle-consistency finding, not a surviving authority-loss input and not permission to change the contract. No production fix was made. Main owns reconciliation and the later serial selftest.

## Static facet audit — not additional executed cases

| Facet | Counter behavior | Persisted fixture coverage |
|---|---|---|
| LC11 missing override / explicit S096 | Effective default is S096; pinned LC11 requires S100; S096's declared ranges exclude 787-815 | Both present; expected backlink reason is unsupported as above |
| LC11 wrong string override | Effective ID must equal pinned S100 | S099 present; synthetic expected reasons overpredict as above |
| LC11 note retains S100 after override removal | Exact table multiset reports missing and extra rows as well as source/anchor mismatch | `override_table_mismatch` pair is consistent by inspection |
| S100 missing or duplicate registry row | Exactly one required; otherwise `registry_row_invalid` | Missing covered; duplicate not a named fixture |
| S100 status | Exact `mined` required | `queued` covered |
| S100 URL / digest | Exact URL whitespace token and exact semicolon-delimited `decoded sha256 <pin>` part required | Wrong tag and 64-zero digest covered |
| S100 supersession | Teaches cell must start exactly `supersedes S096 —` | Missing prefix covered; wrong predecessor/dash variants not separately exercised |
| Optional sourceId shape | Non-string defined values produce `decision_shape`; unknown/empty strings mismatch the source pin | No null/number/empty-string authority fixture |

References: `measure-c1.mjs:80-97,284-300,322-341,376-397,501-528`; `selftest-c1.mjs:310-345`; `expected.json:185-274`. These checks are finite mechanical validation, not semantic truth.

## Independent expected/source checks

`selftest-c1.mjs:130-162,347-358` loads persisted count/exit/sorted-reason triples and compares exact values; it does not regenerate expectations from evaluate. Its source literals and decision fixtures are separately defined, and preflight verifies the retained source digest and LC11 override (`:36-69,167-180`).

The bounded probe independently compared the committed expected source record with explicit S096/path/URL/digest literals, and hashed the committed source body: **match**, `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. The expected design digest and actual committed design digest both equal `1c9f536e329d74fef1c4502c133c551a30fe7ccfc18f2641ba85ee4245a7a1da`. Static limitation: loadExpected does not validate the `design` field, despite its current matching digest.

Metadata counting in that same probe found 34 persisted cases, 20 persisted reasons versus 24 declared finding IDs. The unexercised declared IDs are `decision_shape`, `decision_text_invalid`, `decision_unknown_id`, and `table_heading_duplicate`. The loader enforces coverage of its persisted vocabulary, not equality with all declared IDs. This is finite-suite coverage, not an exhaustive schema guarantee.

## One bounded pure-data mutation probe

Node `v26.12.0`; process exit **0**; stderr empty. Four input Buffers were obtained with read-only `git show CHECKPOINT:PATH`. The imported measure module was byte-compared with its committed blob before import. Only `evaluate(Map)` ran: exactly pristine, one logical authority-loss mutation, restored. No CLI counter, full selftest, gate, browser, build, or formatter ran.

Mutant: remove LC11's S100 sourceId override and update only its rendered table source to the resulting S096 default. The table update is the dependent mirror of the same authority defect, avoiding unrelated table discrepancies. Source body and registry were unchanged.

Exact input delta:

1. `corpus/evidence/round-20/lifecycle/decisions.json`: delete exactly the UTF-8 string `"      \"sourceId\": \"S100\",\n"` (26 bytes; original line 93). Nothing added.
2. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`: replace exactly this row (original line 39):

```text
| LC11 | The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. | CallDoneCallback runs with kToolInvocationFailed and the programming-error message; no output value is set on that path. | S100:787-815 |
```

with:

```text
| LC11 | The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. | CallDoneCallback runs with kToolInvocationFailed and the programming-error message; no output value is set on that path. | S096:787-815 |
```

Expected detector: clean pristine/restored count 12, exit 0; authority-loss mutant count 12, exit 1. The independently specified mutant reasons were `["decision_anchor_uncovered","decision_source_mismatch"]`. The existing persisted `missing_decision_source_override` triple instead requires an additional `registry_backlink_missing`.

Actual outputs:

```json
{
  "pristine": {"exit":0,"c1_lifecycle_decisions":12,"findings":[]},
  "mutated": {"exit":1,"c1_lifecycle_decisions":12,"findings":["decision_anchor_uncovered","decision_source_mismatch"]},
  "restored": {"exit":0,"c1_lifecycle_decisions":12,"findings":[]}
}
```

Verdict: **KILLED** by evaluate (baseline and restoration clean). Mutant output matches the independently specified mechanical pair and **does not match the persisted pair**. This was not execution of the runner's synthetic fixture; predictions about that runner above are explicitly marked inference.

## Restoration and hashes

Restored the Map in `finally` using fresh exact copies of every original Buffer. Direct Buffer equality for all four inputs: **true**. Production input files and measure module still byte-match the checkpoint: **true**. No input was written to disk; the only created file is this report.

SHA-256:

| Input | Before = restored | Mutated |
|---|---|---|
| decisions.json (6303 → 6277 → 6303 bytes) | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` | `46161694945f52b134cc9a1179dbcd5bd4ae3fedcacc1d9ae530b2ffaddfdcea` |
| lifecycle note (15827 bytes throughout) | `3ac83d0abebabf0c7c0457251ef7be312f6dd253f9101d753ad840696a8355f4` | `a49fe20c0555ff5f335e4b987edc92fb14ea2fdd42294e563e2bededa73cd58b` |
| retained source (68278 bytes throughout) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | unchanged |
| SOURCES.md (82006 bytes throughout) | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` | unchanged |

Aggregate SHA-256 (paths sorted by Node `localeCompare`; for each, hash UTF-8 path + NUL + decimal byte length + NUL + raw bytes):
- Before: `8a1e565597ad5949235e8c47a08622afb84b67b51d9aeec9941eb7ccf038cdae`
- Mutated: `cf35c904f60bca1002fed42d1b8dd677a5c952fc399d5a85b799f8ff65153ade`
- Restored: `8a1e565597ad5949235e8c47a08622afb84b67b51d9aeec9941eb7ccf038cdae`

Committed inspected artifact hashes:
- measure-c1.mjs: `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6`
- selftest-c1.mjs: `5804cf6a73a497bfbaf3c6265a7b1852760f6b52d930de4af7ba7674543544a5`
- expected.json: `458a9f3fa069936d0f3e13a4200b122dc9926d787f3d6e068625ff0e9fb744d1`

No tool install/update. No production edits, index/jj changes, clone, or commit. Full selftests/gates untested. Author-side evidence only, not external closure. C1 remains twelve documented SOURCE-ONLY rows; scalar remains 8; no semantic-depth, domain-coverage, runtime, or capability admission follows from this probe.

Report: .ufo/waves/round-20/w2/CounterS100Authority.md
