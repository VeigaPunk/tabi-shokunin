# QuoteLC03: literal quote, word count, line numbers, source identity, anchor containment

Scope: LC03 only, checked against `corpus/evidence/round-20/sources/html_form_element.cc` at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Semantic entailment not assessed. Author-side finding, not external closure.

## Finding

No defects. LC03 passes all five checks.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Literal quote | PASS | `corpus/evidence/round-20/lifecycle/decisions.json` line 33, LC03 `quote`: `if (!*submit_button && require_submit_button) {`. Source physical line 251 is the exact full line (two leading spaces, no trailing text). Single occurrence in the file. |
| Whitespace words | PASS | 5 words (`if`, `(!*submit_button`, `&&`, `require_submit_button)`, `{`); 47 bytes; limit 25. |
| Line numbers | PASS | Declared startLine 249 (decisions.json line 31) = physical line 249 `  FormMCPSchema mcp_schema(*form_);`. Declared endLine 258 (line 32) = physical line 258 `  return mcp_schema.FillData(*json_obj);`. Both non-blank. Quote line 251 lies inside [249, 258]. Numbering is 1-based and agrees between `grep -n` and the read tool. |
| Source identity | PASS | Local file sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`; 1740 lines; 68278 bytes. Equal to: decisions.json `source.sha256` (line 7); `corpus/SOURCES.md` S096 decoded sha256 (line 110); `.ufo/waves/round-20/source-opening.json` `decodedSha256`. Checkpoint blob `cd7efa45834bfce0697b06c7092f16d084c4eb55` has the same sha256. `git diff 4ae99816` is empty for the source file, decisions.json and SOURCES.md. Retained `.ufo/waves/round-20/source-opened.base64.gz` decodes (`gzip -dc` then `base64 -d`) byte-identical to the local file (`cmp`). Its raw base64 sha256 `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed` and 91040 bytes match `source-opening.json`. decisions.json line 6 URL equals the S096 row URL (SOURCES.md line 110). Source file has no CRLF, tab or non-ASCII bytes. |
| Cited row | PASS | LC03 (decisions.json lines 27-34) has no per-decision source key, so it cites the manifest-level source S096 (decisions.json lines 3-8). |
| Anchor containment | PASS | S096 anchors (SOURCES.md line 110): `html_form_element.cc:174-328,729-758,818-842`. LC03 span 249-258 lies inside 174-328. Quote line 251 lies inside 174-328. |

## Related observation: LC11 citation rule

The only per-decision source key in the manifest is LC11 `"sourceId": "S100"` (decisions.json line 93). Every other decision, including LC03, inherits S096. This matches the stated rule (LC11 cites S100; others cite S096). LC11's own quote and line numbers were not checked.

## Not verified

- Semantic entailment of LC03's condition and outcome (excluded by assignment).
- Chromium tag-to-commit mapping `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`: recorded only in SOURCES.md. No local artifact carries it, and no network re-fetch was performed. Byte identity is verified; commit identity is not.
- `source-opening.json` records `initialRetrievalTimestamp` as "not captured"; only refetch timestamps (10:02:55-56Z) are present. Not re-verified.

## Commands and changes

Read-only: `sha256sum`, `wc`, `git rev-parse` / `ls-files` / `diff` against 4ae99816, `gzip -dc | base64 -d | cmp` to stdout, plus grep and read queries. No tests, builds, or corpus/source edits. No tools installed or updated.

Report: .ufo/waves/round-20/w2/QuoteLC03.md
