# QuoteLC11: LC11 literal quote, line numbers, source identity, anchor containment

Scope: LC11 only. Pinned commit `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Semantic entailment of condition/outcome text was not assessed (out of scope for this seat).

## Verdict

PASS on all five checks. No defect found in LC11's quote, word count, line numbers, sourceId, or cited-row anchor containment.

## Evidence

| Check | Evidence | Result |
|---|---|---|
| Pinned identity | `git rev-parse 4ae9981:<path>` equals HEAD and worktree blob for `html_form_element.cc` (cd7efa45...), `lifecycle/decisions.json` (f5a55b3d...), `SOURCES.md` (07f5d2e4...). Worktree diff against the pinned commit is empty. `git status -- corpus/` is clean. | PASS |
| sourceId | `decisions.json` LC11 record: `"sourceId": "S100"` (line 93). The task requires S100 for LC11. | PASS |
| Source identity (local) | sha256 of pinned and worktree `html_form_element.cc` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. This equals the S100 decoded sha256 in `SOURCES.md:114`. The file has 1740 lines and 0 CR bytes. | PASS |
| Source identity (upstream, primary source) | Read-only fetch of Gitiles `html_form_element.cc?format=TEXT` at tag `154.0.8037.97`, base64-decoded: sha256 `8c8d6796...916`, 1740 lines. Gitiles resolves the tag to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, matching the S100 row. | PASS |
| Literal quote | `decisions.json` line 98: `"quote": "The site has a programming error: it called"`. ASCII-exact match, 43 bytes. | PASS |
| Quote physical line | Source line **810**: `              "The site has a programming error: it called "`. The C++ adjacent-literal chain continues on lines 811-813. This is the only occurrence of "programming error" in the file. | PASS |
| Word count | 8 whitespace-separated words (limit 25). | PASS |
| Line numbers | LC11 record: `startLine` 787, `endLine` 815 (lines 96-97). `design.json` LC11 span: [787, 815]. Identical. | PASS |
| Quote inside span | 787 <= 810 <= 815. | PASS |
| Cited-row containment | S100 anchor `html_form_element.cc:174-328,635-842` contains [787, 815]. | PASS |
| Negative control | S096 anchors `174-328,729-758,818-842` do NOT contain [787, 815]. Citing S096 would fail containment, so the S100 citation is the one that holds. | PASS (control) |

## Observations (non-blocking)

- Span boundaries sit on statement edges. Line 787 is the first line of `declarative_webmcp_call =` (line 786 is a comment). Line 815 is the `}` that closes `if (declarative_webmcp_call) {`. The span is not cut mid-expression.
- The Gitiles tag commit `b510e9d7...` carries an automated "Roll WebView ARM Orderfile" commit message. I recorded the tag-to-commit identity only and did not assess that commit's contents.

## Not assessed

- Semantic entailment of LC11 condition and outcome against the code.
- Other decision rows and their sourceIds (outside this seat's scope).
- Runtime behaviour. None is claimed.

## Process

- Read-only checks only: git plumbing, read/grep, sha256, one read-only Gitiles fetch (two URLs: the file and the tag JSON).
- No tests, builds, or formatters. No corpus or source edits. The temporary download was removed.
- No tools installed or updated.
