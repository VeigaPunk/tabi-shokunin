# QuoteLC07

Scope: decision LC07 in `corpus/evidence/round-20/lifecycle/decisions.json` and registry row S096 in `corpus/SOURCES.md`, checked against `corpus/evidence/round-20/sources/html_form_element.cc` at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Literal, word-count, line, source-identity and anchor-containment checks only. Semantic entailment is not judged. Author-side finding, not external closure.

## Result

PASS on all five axes. No LC07 defect found.

## Findings

| Axis | Check | Observed | Result |
|---|---|---|---|
| Literal quote | `decisions.json` LC07 `quote` vs source | `std::move(done_callback_).Run(result);` (38 bytes). Byte-identical to the literal (jq-extracted sha256 `837b3cd0…4f8324`). Exactly one occurrence in the file. | PASS, physical line **266** |
| Word count | whitespace-separated words in quote | 1 (limit 25) | PASS |
| Span lines | `startLine` 261, `endLine` 275 | 261 = `void HTMLFormElement::HTMLFormMcpTool::CallDoneCallback(`; 275 = `}`. Quote line 266 is inside the span. | PASS |
| Outcome line refs (content) | "line 266", "lines 267-270", "lines 271-274" | 266 = `std::move(done_callback_).Run(result);`. 267-270 = `is_currently_running_ = false;`, `auto old_submit_button = active_submit_button_;`, `active_submit_button_ = nullptr;`, `invocation_id_ = std::nullopt;`. 271-274 = `PseudoStateChanged` calls (lines 272-274 are the guarded `old_submit_button` call). | PASS |
| Source id | LC07 cites which source | LC07 has no `sourceId`; inherits top-level `source.id` = **S096**. LC11 is the only decision with `sourceId` (= S100); LC11 not otherwise checked. | PASS |
| Source file identity | committed blob at 4ae99816 | 1,740 lines, 68,278 bytes, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Working-tree copy hash-identical. Equals `decisions.json` `source.sha256` and S096 "decoded sha256". | PASS |
| Upstream identity | Gitiles TEXT at tag `154.0.8037.97` and at commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (base64-decoded) | Both hash to `8c8d6796…`. Gitiles tag JSON resolves to commit `b510e9d7…`. | PASS |
| URL identity | `decisions.json` `source.url` vs S096 URL | Byte-identical (matching sha256 `9e2e2297…`); tag `154.0.8037.97`. | PASS |
| Path identity | `source.path` | `corpus/evidence/round-20/sources/html_form_element.cc` exists at 4ae99816. | PASS |
| Anchor containment | S096 anchor cell `html_form_element.cc:174-328,729-758,818-842` contains 261-275 | 261-275 is within 174-328. Quote line 266 is also within 174-328. | PASS |
| Registry uniqueness | S096 rows in SOURCES.md | One row (line 110), no conflicting anchor. | PASS |

## Non-defect observations

- S100 (SOURCES.md line 114) reads "supersedes S096" and has anchors `174-328,635-842`, which also contain LC07's span. This wave's rule keeps LC07 on S096, so no change is needed. Noted so the integration owner does not read the supersession as a LC07 citation error.
- The S096 status stays `mined`. No registry edit is implied.
- Scope limit: the outcome text's semantic claims (what "clears" or "reset" means for runtime state, or what the callback does) were not evaluated. Only line content was checked.

## Method and tooling

- Read-only git at the checkpoint: `git show`, `git rev-parse`, `git merge-base --is-ancestor`, `git log -1`, `git cat-file -t`. Working-tree and checkpoint hashes compared for `html_form_element.cc`, `decisions.json` and `SOURCES.md`; all identical.
- Primary-source opening: three Gitiles TEXT/JSON fetches (tag, commit, tag JSON) via `curl`, decoded with `base64 -d`.
- Tools used, all pre-existing: `read`, `grep`, `glob`, `jq`, `curl`, `base64`, `sha256sum`, `wc`, `cut`, `sed`, `cat -n`.
- No tests, builds, or corpus/source edits. No tools installed or updated.
