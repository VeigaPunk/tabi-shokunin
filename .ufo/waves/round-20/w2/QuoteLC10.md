# QuoteLC10: LC10 literal quote and anchor check

Scope: LC10 only. Checks: literal quote, ≤25 whitespace words, line numbers, source identity, cited-row anchor containment. Semantic entailment is out of scope and not evaluated. Author-side check, not external closure. No tests, builds, or corpus/source edits.

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (commit object; repository top level is the lane root).

## Verdict

PASS on all five assigned checks. No LC10 defect found. One non-blocking observation: LC10 has no per-record `sourceId`. It resolves to S096 through the manifest-level `source` block, which the checker's rule permits.

## Record under test

`corpus/evidence/round-20/lifecycle/decisions.json`, LC10 object at lines 83–90:

- Keys: `condition`, `endLine`, `id`, `outcome`, `quote`, `startLine`. No `sourceId`.
- `startLine` 320 (line 87); `endLine` 327 (line 88).
- `quote` (line 89): `respondWith promise was rejected`

| Check | Result |
|---|---|
| Quote is literal | PASS. Exact substring of `html_form_element.cc` physical line 326. Occurs once in the file. |
| Quote words | PASS. 32 characters, 4 whitespace-delimited words (limit 25). |
| Quote physical line | 326 |
| Span | 320–327. Quote line 326 lies inside. |
| Source identity | PASS (see below). |
| Anchor containment | PASS. S096 declares `html_form_element.cc:174-328,729-758,818-842`; 320–327 ⊂ 174–328. |
| sourceId rule | PASS. Only LC11 carries `sourceId` (`S100`, decisions.json line 93). LC10 inherits top-level `source.id` = S096. |

## Physical source, lines 320–327 (`html_form_element.cc` at 4ae99816)

```
320:   } else {
321:     // Promise rejected - error.
322:     V8ScriptRunner::ReportException(script_state->GetIsolate(),
323:                                     value.V8Value());
324:     tool->CallDoneCallback(base::unexpected(
325:         ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
326:                         "respondWith promise was rejected")));
327:   }
```

Line 326 exact bytes: 24 leading spaces, then `"respondWith promise was rejected")));`. The file is LF-only, ASCII-only, 1740 lines.

## Source identity

- Working-tree `html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Byte-identical (`cmp`) to the `4ae99816` blob.
- `decisions.json` top-level `source` has four keys: id S096, path `corpus/evidence/round-20/sources/html_form_element.cc`, the pinned URL, and the sha256 above.
- `SOURCES.md` S096 row (line 110): id unique; the pinned URL is a whitespace token of the source cell; the anchor cell contains `decoded sha256 8c8d6796…36916` as an exact `;`-part; status `mined`; used-by names `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- Working-tree `decisions.json` and `SOURCES.md` are byte-identical to their `4ae99816` blobs (sha256 `da42e495…ca2bf` and `efbce1ea…d05`).
- Upstream (read-only primary-source fetch): the Gitiles `format=TEXT` URL for tag `154.0.8037.97` decodes from base64 to 1740 lines with sha256 `8c8d6796…36916`, byte-identical to the local file. The Gitiles tag JSON gives commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, matching S096's anchor cell. The first tag fetch returned HTTP 502; the retry succeeded.

## Checker pins (read only; `measure-c1.mjs` not executed)

- `measure-c1.mjs:91`: LC10 pinned to S096, 320–327. Matches.
- `measure-c1.mjs:69–71`: URL, path and sha256 pins. Match `decisions.json` and `SOURCES.md`.
- Rules applied: quote non-empty and ≤25 words (`:362–363`); quote is a substring of the pinned span text (`:365–367`); span covered by the row's declared ranges (`:385`).

## Observations (non-blocking)

1. LC10 has no explicit `sourceId`. The checker's rule (`decision.sourceId ?? manifest.source.id`) makes this valid. A reader must check the top-level `source` block to see that LC10 cites S096.
2. `selftest-c1.mjs:67` uses a different LC10 fixture quote, `"respondWith promise was rejected")));`, from the manifest. Both are substrings of physical line 326, so neither yields a finding. The manifest quote is the one the checker tests. The fixture's condition and outcome text also differ from the manifest. Not evaluated.

## Incidental (outside the LC10 verdict)

- LC11 `sourceId` is S100, as required. Its quote `The site has a programming error: it called` occurs once, at line 810, inside S100's 787–815 span. LC11 was not otherwise checked.

## Not evaluated

- Semantic entailment of LC10 `condition` and `outcome`.
- Execution of the checker or selftest.

## Tools

No installs or updates. Used existing `/usr/bin/curl`, `base64`, `sha256sum`, `cmp`, and a read-only Python kernel. No pacman.
