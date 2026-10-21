# QuoteLC08: LC08 literal quote, line, identity, and anchor check

Verdict: **PASS.** No defect in the LC08 quote, word count, line numbers, source identity, or cited-row anchor containment. One non-defect note on span coarseness (below).

Scope: LC08 only, plus the LC11 citation rule from the assignment. Semantic entailment was not assessed. No tests, no corpus or source edits, no git writes. Baseline: `git rev-parse HEAD` = `4ae99816b8994fdedc159156d8d9d242dd5c4782`.

## LC08 as recorded

`corpus/evidence/round-20/lifecycle/decisions.json`, lines 67-74:
- `id` LC08 (line 68), `startLine` 290 (line 71), `endLine` 298 (line 72)
- `quote`: `"if (!tool->CurrentlyRunning()) {"` (line 73)
- No per-decision `sourceId`. Inherits top-level `source.id` = S096.

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Literal quote | PASS | Exact substring of physical line 295. Occurs exactly once in the file. |
| 2 | Whitespace words <=25 | PASS | 3 tokens: `if`, `(!tool->CurrentlyRunning())`, `{`. |
| 3 | Quote physical line | 295 | `_grep` line 295 and Python `split('\n')` line 295 agree. |
| 4 | Span valid and contains quote | PASS | 290 and 298 are real lines; 295 is within [290, 298]. |
| 5 | Line-number basis | PASS | 1740 LF; 0 CR, FF, VT, NUL; 0 non-ASCII. `splitlines` also gives 1740, so no alternate line-break ambiguity. |
| 6 | Local source identity | PASS | sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 bytes. |
| 7 | Committed bytes at 4ae99816 | PASS | `git ls-tree` blob `cd7efa45834bfce0697b06c7092f16d084c4eb55` equals `git hash-object --no-filters` of the working file. `git show 4ae99816:<path> \| sha256sum` = `8c8d...c36916`; `cat-file -s` = 68278. |
| 8 | Upstream bytes | PASS | Gitiles `refs/tags/154.0.8037.97/.../html_form_element.cc?format=TEXT`, base64-decoded, sha256 = `8c8d...c36916`. |
| 9 | Tag commit | PASS | Gitiles tag JSON `commit` = `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, as S096 and S100 state. |
| 10 | Hash agreement | PASS | decisions.json `source.sha256`, SOURCES.md S096 (line 110) decoded sha256, and S100 (line 114) decoded sha256 all equal `8c8d...c36916`. |
| 11 | URL agreement | PASS | decisions.json `source.url` appears exactly in the S096 and S100 rows. |
| 12 | Anchor containment, S096 | PASS | S096 anchors `174-328,729-758,818-842` (line 110). [290, 298] lies within [174, 328]. |
| 13 | Anchor containment, S100 | PASS | S100 anchors `174-328,635-842` (line 114). [290, 298] lies within [174, 328]. |
| 14 | Citation, LC08 to S096 | PASS | Inherited from the top-level source; no explicit `sourceId`. |

## Source excerpt, html_form_element.cc (physical lines)

```
290 void HTMLFormElement::HandleWebMcpToolResponse(HTMLFormMcpTool* tool,
291-293   (continuation of the signature: bool resolved, ScriptState* script_state, ScriptValue value) {
294   CHECK(tool);
295   if (!tool->CurrentlyRunning()) {
296     return;
297   }
298   if (resolved) {
```

## Notes (not defects)

1. **Span is coarser than the guard.** `startLine` 290 is the function header, not the quote line. The guard is 295-297. The span also covers the signature continuation (291-293), `CHECK(tool);` (294), and the first line of the next branch, `if (resolved) {` (298). Other decisions use the same block-containing-quote convention, so this is not a containment error. Whether the span is semantically tight is out of scope.
2. **Inclusive overlap.** LC08 `endLine` 298 equals LC09 `startLine` 298. This is consistent with inclusive spans.
3. **Implicit citation.** Only LC11 has an explicit `sourceId`. LC08 cites S096 by inheritance from `source.id`. The rule "others S096" holds through inheritance. Flagged for main-agent judgment; nothing was changed.

## LC11 citation rule (from assignment)

- LC11 (lines 91-99) carries `"sourceId": "S100"`. Its span 787-815 lies within S100 anchors 635-842. It does not lie within any S096 range (174-328, 729-758, 818-842), so S100 is the required citation. Consistent with S100's own note ("extends its narrow anchor set ... LC11 at 787-815").
- The other decisions have no explicit `sourceId` and inherit S096. Their spans lie within S096 ranges by inspection of the same output: LC01 181-186, LC02 189-210, LC03 249-258, LC04 212-218, LC05 218-221, LC06 224-229, LC07 261-275, LC09 298-319, and LC10 320-327 lie in 174-328; LC12 818-830 lies in 818-842.

## Incidental (same script, outside LC08 scope, not a finding)

Each of the 12 decision quotes occurs exactly once in the file, on a line inside its own span.

## Tooling

No tools installed or updated. Used existing `git` in read-only plumbing mode (`rev-parse`, `ls-tree`, `hash-object --no-filters` without `-w`, `show`, `cat-file`), `curl`, `base64`, `sha256sum`, and the Python 3 standard library for read-only parsing and two HTTPS GETs to chromium.googlesource.com. Did not run `git status`. No index or object writes.

## Not assessed

Semantic entailment of condition and outcome text, runtime behaviour, and whether the anchor ranges are complete.
