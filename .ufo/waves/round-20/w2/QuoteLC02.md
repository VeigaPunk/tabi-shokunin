# w2 · QuoteLC02 — literal-quote/anchor verification (LC02 only)

Scope: literal quote, ≤25 whitespace words, line numbers, source identity, cited-row anchor containment for `LC02` in `corpus/evidence/round-20/lifecycle/decisions.json`, checked against the pinned blob of `corpus/evidence/round-20/sources/html_form_element.cc` at commit `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Semantic entailment explicitly out of lane. No tests, no corpus/source edits, no clones, no installs (none needed).

## Source identity — PASS

- Working tree `git log` names `4ae99816b8…` = "round-20: distill source-scoped WebMCP lifecycle decisions".
- `git show 4ae99816b8994fdedc159156d8d9d242dd5c4782:corpus/evidence/round-20/sources/html_form_element.cc | sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- Working-tree `sha256sum` of the same file = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (identical ⇒ reads of the tree are reads of the pinned blob).
- `decisions.json` `source`: id `S096`, same path, `sha256` `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` — exact match.
- `corpus/SOURCES.md` S096 row (line 110): same Gitiles URL (tag `154.0.8037.97`), decoded sha256 prefix `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c…` — consistent.

## LC02 entry (decisions.json lines 19–31)

- `condition`: "FillFormControls returns a ScriptToolError."
- `startLine` 189, `endLine` 210.
- `quote`: `return std::move(done_callback).Run(base::unexpected(error.value()));`

## Checks

| Check | Result | Evidence |
|---|---|---|
| Source cites S096 (LC11→S100; others→S096) | PASS | LC02 object has no `sourceId`; per manifestShape it resolves to `manifest.source.id` = `S096`. Identity verified above. |
| Literal quote present verbatim | PASS | Exact byte match (modulo the file's leading 4-space indent, which the stored quote omits) at **physical line 197**: `    return std::move(done_callback).Run(base::unexpected(error.value()));` |
| ≤25 whitespace words | PASS | 2 whitespace-delimited tokens (`return`, `std::move(done_callback).Run(base::unexpected(error.value()));`) |
| startLine 189 | PASS | line 189 = `  std::optional<ScriptToolError> error;` (raw read) |
| endLine 210 | PASS | line 210 = `  done_callback_ = std::move(done_callback);` (raw read) |
| Anchor containment | PASS | quote line 197 ∈ [189, 210]; file has 1740 lines, both rows in bounds |
| In-entry line cross-reference: "invocation_id_ … at line 178, outside this span" | PASS | line 178 = `  invocation_id_ = invocation_id;` (raw read); 178 < 189, so outside the cited span as stated |
| Duplicate id guard | PASS | `LC02` occurs exactly once in decisions.json (line 20) |

## Verdict

**LC02 PASSES all in-lane literal checks** — quote verbatim at source line 197, 2 words, rows 189/210 exact and in bounds, quote inside the cited span, source pinned to S096 bytes `8c8d6796…6916` at checkpoint `4ae99816`.

Out-of-lane observation (not judged here): the outcome's "running state … is not set by that call" is control-flow entailment (early return at 197 precedes the state writes at 204–210 inside the same span); left to the semantic reviewers. Untested beyond static byte/line comparison — no runtime claim made or implied.
