# QuoteLC04: round-20 wave-2 literal-quote check (author-side)

Seat: TabiR20.QuoteLC04 (leaf; no dispatch). Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (`round-20: distill source-scoped WebMCP lifecycle decisions`).

Scope: LC04 literal quote, whitespace word count, line numbers, source identity, cited-row anchor containment; attribution LC11 to S100, others to S096. Semantic entailment of the LC04 condition and outcome text is not evaluated (out of scope). No tests, builds, corpus or source edits, clones, or production writes.

## Verdict

LC04: no discrepancy on any in-scope check. Attribution: no discrepancy.

## Artifacts (committed at checkpoint; working tree byte-identical; `git status` clean)

| Artifact | sha256 |
|---|---|
| `corpus/evidence/round-20/lifecycle/decisions.json` | `da42e4951e8d9c11f79036886b03e74800c88e9dca14ab16f21c3527858ca2bf` |
| `corpus/SOURCES.md` | `efbce1ea01243ae7a8d1e4fcf47fa91c6bbdf50594d14e0dac8460248eb72d05` |
| `corpus/evidence/round-20/sources/html_form_element.cc` (1740 lines; git blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |

## LC04 row

`decisions.json` (file lines 35-42): `id` LC04; no per-row `sourceId`, so it resolves to top-level `source.id` S096; `startLine` 212; `endLine` 218; `quote` `context->PauseExecution();`.

| Check | Observed | Result |
|---|---|---|
| Literal quote, byte-exact | Physical line 217: `    context->PauseExecution();`. Anchored match `^ +context->PauseExecution\(\);$` succeeds, so no trailing whitespace; file contains no CR | PASS |
| Uniqueness | `PauseExecution` occurs only at line 217 | PASS |
| At most 25 whitespace words | 1 word | PASS |
| Physical line inside cited span | 217 is in [212, 218] | PASS |
| Span edges (1-based) | 212 `  if (require_submit_button) {`; 218 `  } else {` | PASS |

Context, unchanged lines 212-218: 215 `submit_button->Focus();`; 216 `auto* context = ModelContextSupplement::modelContext(form_->GetDocument());`; 217 `context->PauseExecution();`.

## Source identity

- `decisions.json` `source.sha256` equals the committed blob sha256 and the working-tree sha256 (`8c8d6796...6916`). PASS
- Upstream `source.url` (tag 154.0.8037.97, `?format=TEXT`, base64-decoded) gives the same sha256, 1740 lines, and is `cmp`-identical to the committed file. PASS
- The same file at commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` gives the same sha256, and tag `154.0.8037.97` resolves to that commit. This matches the commit cells of SOURCES.md S096 and S100. PASS
- SOURCES.md S096 (line 110) and S100 (line 114): the URL equals `decisions.json` `source.url`, and "decoded sha256" is `8c8d6796...6916`. PASS

## Cited-row anchor containment

- S096 anchor `html_form_element.cc:174-328,729-758,818-842` (SOURCES.md:110) contains 212-218. PASS. Line 174 is the `ExecuteTool(` signature.
- S100 anchor `html_form_element.cc:174-328,635-842` (SOURCES.md:114) contains 212-218. PASS.

## Attribution (LC11 to S100; others to S096)

- LC11: `sourceId` is `S100`. Span 787-815 lies inside S100 anchor 635-842 and in the 759-817 gap that S096's anchor set does not cover. S100 is the required citation. PASS.
- LC01-LC10 and LC12 have no `sourceId` and inherit S096. Their spans fall inside S096's anchor set (181-186, 189-210, 249-258, 218-221, 224-229, 261-275, 290-298, 298-319, 320-327, 818-830; arithmetic on the jq extract). Their quote text was not checked. PASS for attribution only.

## Notes (not findings)

- SOURCES.md:137 scopes the at-most-25-word quote contract to S001-S028. S096 carries location and sha256 but no quote cell, so the LC04 quote is held only in `decisions.json`. This is not a discrepancy.
- Not evaluated: semantic entailment of the LC04 condition and outcome (for example "does not run the done callback"), and quote text for LC11 and the other rows.
- Tools used: git, sha256sum, cmp, jq, curl, base64, all pre-existing. No installs or updates.

## Status

Author-side finding; not external closure. Report-only seat; nothing committed.
