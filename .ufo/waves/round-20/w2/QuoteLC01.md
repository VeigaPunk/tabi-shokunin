# QuoteLC01 — round 20: LC01 literal quote, span, source identity, anchor containment

Seat: TabiR20.QuoteLC01 (leaf scout, no dispatch). Revision `4ae99816b8994fdedc159156d8d9d242dd5c4782` (HEAD verified). Scope: LC01 only. Read-only checks: `git rev-parse`, `git hash-object`, `git show <rev>:<path> | sha256sum`, `git status`, `wc`, `jq`, read and grep of the committed bytes. No corpus or production edit, no clone, no test, build, gate or selftest. Tools installed or updated: none. Findings are author-side, not external closure.

## 1. Verdict

**LC01 passes every scoped check.** Blocking findings: none.

| Field | Value |
|---|---|
| Quote (decisions.json:17) | `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);` |
| Physical source line | **182** of `corpus/evidence/round-20/sources/html_form_element.cc` (only occurrence of the quote) |
| Span (decisions.json:15-16) | 181-186, contains 182 |
| Cited source | S096 (top-level `source.id`; LC01 has no own `sourceId`) |
| Anchor containment | S096 anchor `174-328,729-758,818-842` contains 181-186 |
| Finding | PASS |

Semantic entailment of LC01 `condition` and `outcome` is not assessed (out of scope).

## 2. Checks

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | Literal quote | Quote equals line 182 after its leading indentation. Anchored ASCII regex `^ *!form_->FastHasAttribute\(html_names::kToolautosubmitAttr\);$` matches exactly line 182. | PASS |
| 2 | Uniqueness | `kToolautosubmitAttr` occurs at 182, 417 and 1133. Only 182 has the `!form_->` form. | PASS |
| 3 | At most 25 whitespace words | 58 characters, 1 word. | PASS |
| 4 | Span brackets the quote | 181 = `  bool require_submit_button =` (statement start); 182 = quote; 186 = `  }` closing the `if` at 183. The quote is on 182, the continuation line inside the span, not on startLine 181. | PASS |
| 5 | Span sits in the named function | 174 = `void HTMLFormElement::HTMLFormMcpTool::ExecuteTool(`; 181-186 lies in its body. Location only, not entailment. | PASS |
| 6 | File identity at 4ae99816 | Path exists at the commit as blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`, equal to the working-tree blob. Committed bytes: 1740 lines, 68278 bytes, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. | PASS |
| 7 | decisions.json `source` matches its file | `jq` equality: `source.sha256` equals the computed sha256 of the file. `source.url` equals the expected Chromium 154.0.8037.97 Gitiles URL. | PASS |
| 8 | decisions.json `source` matches registry row S096 (SOURCES.md:110) | Row id S096. Its URL cell is the same URL (exact ASCII match). Its anchor cell `html_form_element.cc:174-328,729-758,818-842` and "decoded sha256" cell `8c8d6796...c36916` (full 64 hex) both match exactly. | PASS |
| 9 | Citation id for LC01 is S096 | LC01 keys: `condition,endLine,id,outcome,quote,startLine`; no `sourceId`, so it takes top-level `source.id` S096. Only LC11 has `sourceId` (value S100). | PASS. [INFERENCE] absence of `sourceId` means inheritance; the file does not state this rule. |
| 10 | Anchor containment | Span 181-186 is inside 174-328; quote line 182 is inside 174-328. | PASS |
| 11 | Encoding and line endings | No CR bytes in the source file. No non-ASCII bytes in the source file or decisions.json. The scanner was validated on SOURCES.md, where it does match. | PASS |
| 12 | Committed equals working tree | Blobs at HEAD equal working-tree hashes: decisions.json `f5a55b3d1b88e801947a59dca8364aa0d3d5c676`; SOURCES.md `07f5d2e48a237a776c4d831a9a6f0bc2183f2ad0`. `git status` on these paths and the source directory is empty. | PASS |

## 3. Findings

No blocking findings.

- **O1 (note).** LC01 cites S096 only through the top-level `source` block. This is consistent with the rule "others S096". The lesson Gate should state the inheritance rule, because LC11 is the only decision with an explicit `sourceId`.
- **O2 (note).** SOURCES.md row S096 carries no quote text; its anchor is a line-range set. The only literal quote for LC01 is in decisions.json, and it matches line 182. The literal-quote check therefore ran against decisions.json, with SOURCES.md used for identity and anchors.

## 4. Not checked

- Semantic entailment of LC01 `condition` and `outcome`, including whether the use-counter increment matches attribute presence. This is separate from the scoped check.
- LC02-LC12 quotes and spans. For LC11, only the `sourceId` value was read; its span and quote were not checked.
- Upstream Gitiles fetch and base64 decode were not repeated. Identity is established against the committed bytes via the registry's decoded sha256. The upstream commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` was not verified.
- No runtime claim is made.

## 5. Tools

Installed or updated: none. Commands were read-only: git plumbing (`rev-parse`, `cat-file`, `hash-object`, `show`, `status`), `sha256sum`, `wc`, `jq` on JSON, and read/grep.
