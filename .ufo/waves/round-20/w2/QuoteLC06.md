# QuoteLC06 — scoped findings

Scope: LC06 in `corpus/evidence/round-20/lifecycle/decisions.json` and the S096 citation in `corpus/SOURCES.md`, checked against `corpus/evidence/round-20/sources/html_form_element.cc` at commit `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Covered: literal quote, word count, line numbers, source identity, cited-row anchor containment, and the LC11/S100 citation rule. Not covered: semantic entailment. Author-side seat finding, not external closure.

## Verdict

LC06 passes every facet in scope. No corpus or source edits. No tests, builds, or formatters run.

## Row under check

- `id` LC06, `startLine` 224, `endLine` 229
- `quote`: `Tool execution cancelled by abort signal`
- No per-row `sourceId`; inherits the top-level `source.id` S096

## Checks

| Facet | Requirement | Observed | Result |
|---|---|---|---|
| Literal quote | Substring of cited source | Physical line 228: `"Tool execution cancelled by abort signal")));` (inner string literal); byte-exact | PASS |
| Word count | ≤25 whitespace words | 6 words, 40 bytes, printable ASCII only | PASS |
| Quote physical line | Within 224-229 | 228 | PASS |
| Span boundaries | 224 and 229 delimit the function | 224 `void HTMLFormElement::HTMLFormMcpTool::CancelTool() {`; 229 `}` | PASS |
| Source path | Decisions path is the cited file | `corpus/evidence/round-20/sources/html_form_element.cc` | PASS |
| Source URL | Same as S096 row | Identical string in decisions `source.url` and SOURCES.md S096 row | PASS |
| Source sha256 | `8c8d6796…6916` | Working file = committed blob at 4ae99816 (blob `cd7efa45…`, 1740 lines, 68278 bytes) = decoded body of the S096 URL fetched in this run | PASS |
| Chromium tag commit | S096 row: tag 154.0.8037.97 → `b510e9d7…` | Gitiles tag JSON returns `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` | PASS |
| Anchor containment | LC06 span inside cited anchor | S096 anchor `174-328,729-758,818-842` contains 224-229 | PASS |
| Citation rule | LC06 cites S096 | No explicit field; inherits top-level S096 | PASS (implicit) |

## Locator (committed blob at 4ae99816)

```
224 void HTMLFormElement::HTMLFormMcpTool::CancelTool() {
225   CHECK(is_currently_running_);
226   CallDoneCallback(base::unexpected(
227       ScriptToolError(ScriptToolErrorCode::kToolCancelled,
228                       "Tool execution cancelled by abort signal")));   <- quote
229 }
```

## LC11 citation rule (scope check only)

- LC11 carries explicit `"sourceId": "S100"`. Its span 787-815 lies inside the S100 anchor 635-842. LC11's quote was not checked.
- The explicit field appears only on LC11. The other 11 rows inherit S096.

## Observations (no defects)

1. LC06's S096 attribution is inherited, not written on the row. This meets "others S096", but a row-level reader finds no citation on LC06.
2. S100 is registered as superseding S096, and S096 is still the citation for 11 rows. LC06's span sits inside S096's own anchor, so containment holds. The stated citation rule governs.
3. The quote omits the literal's surrounding double quotes. This is a substring match, consistent with the other rows.

## Committed-blob identity at 4ae99816

| Path | Blob | Working tree |
|---|---|---|
| `corpus/evidence/round-20/lifecycle/decisions.json` | `f5a55b3d1b88e801947a59dca8364aa0d3d5c676` | match |
| `corpus/SOURCES.md` | `07f5d2e48a237a776c4d831a9a6f0bc2183f2ad0` | match |
| `corpus/evidence/round-20/sources/html_form_element.cc` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` | match |

## Method and tooling

- Read-only: `jq`, `wc`, `sha256sum`, `base64 -d`, and `git cat-file` / `rev-parse` / `hash-object` / `show`. No index writes.
- Two network GETs to chromium.googlesource.com: the S096 URL with `?format=TEXT` (hashed after base64 decode), and the tag with `?format=JSON`. Both succeeded.
- No installs or updates.
- Not checked: semantic entailment of the outcome text; Chromium runtime behavior (source-only).
