# QuoteLC12 — LC12 literal quote, line, identity, and anchor check

Scope: LC12 only. Checked literal quote, whitespace-word bound, physical line numbers, source identity, cited-row anchor containment, and the LC11 to S100 / others to S096 attribution rule. Semantic entailment of LC12 `condition`/`outcome` is out of scope and was not evaluated.

Baseline: checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (equals HEAD). Working-tree copies of `decisions.json`, `SOURCES.md`, and `html_form_element.cc` are byte-identical to the checkpoint blobs (sha256 equal; `git diff --stat` empty).

Author-side finding; not external closure. No tests, no corpus or source edits, no clones, no tool installs or updates. Read-only tooling only (git, sha256sum, wc, printf).

## Verdict

PASS on every in-scope LC12 check. No discrepancy found.

## LC12 record (`corpus/evidence/round-20/lifecycle/decisions.json`, checkpoint)

- `:101` `"id": "LC12"`. No `sourceId` key in lines 101–106, so the manifest default S096 applies.
- `:104` `"startLine": 818`
- `:105` `"endLine": 830`
- `:106` `"quote": "executing_tool->CallDoneCallback(base::ok(String()));"`

## Source physical lines (`corpus/evidence/round-20/sources/html_form_element.cc`, checkpoint, 1740 lines)

- 818: `  if (should_submit) {`
- 825: `    if (executing_tool && executing_tool->CurrentlyRunning()) {`
- 829: `      executing_tool->CallDoneCallback(base::ok(String()));` (quote line)
- 830: `    }` (endLine)

## Checks

| # | Check | Evidence | Result |
|---|---|---|---|
| 1 | Literal quote in source | `git grep -n -F` at 4ae9981 returns exactly one match, html_form_element.cc:829. `git grep -c -F` also returns 1. | PASS |
| 2 | Quote bytes in JSON | `decisions.json:106` matches the same ASCII string (`git grep -n -F` on the JSON quote line). | PASS |
| 3 | Whitespace-word bound (<=25) | Quote is 1 whitespace-delimited word (`wc -w`), 53 bytes. No non-ASCII bytes in the source file. | PASS |
| 4 | Quote inside span | 829 lies within [818, 830]. | PASS |
| 5 | Line numbers are physical, 1-based | Checkpoint file has 1740 lines. 818 opens the `should_submit` block; 830 closes the inner `executing_tool` block. | PASS |
| 6 | Source identity, blob | Checkpoint blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`; working-tree `git hash-object` identical. | PASS |
| 7 | Source identity, sha256 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Equals `decisions.json` source.sha256, `design.json` source.sha256, `SOURCES.md:110` decoded sha256, and `.ufo/waves/round-20/source-opening.json:6` decodedSha256. | PASS |
| 8 | Source identity, size | 68278 bytes at checkpoint; equals `source-opening.json:7` decodedBytes. | PASS |
| 9 | Source path and URL | Manifest path exists at checkpoint (`git ls-tree`). Manifest URL string is identical to the `SOURCES.md:110` URL (tag 154.0.8037.97). | PASS |
| 10 | Cited row present, single | `SOURCES.md:110` is the only S096 row. Anchors: `html_form_element.cc:174-328,729-758,818-842`. | PASS |
| 11 | Cited-row anchor containment | Span 818–830 is contained in 818–842. | PASS |
| 12 | Attribution rule | LC12 uses S096 (no sourceId). Only LC11 carries a sourceId, `decisions.json:93` `"S100"`. | PASS |
| 13 | LC11 to S100 containment (attribution only; LC11 quote not checked) | `SOURCES.md:114` S100 anchors `html_form_element.cc:174-328,635-842` contain LC11 span 787–815 (`decisions.json:96-97`). | PASS (containment only) |

## Non-blocking observations (outside the LC12 verdict)

1. `SOURCES.md:114` says S100 "supersedes S096". The S100 anchor set (635–842) also contains the LC12 span (818–830). The LC12 to S096 citation follows the assigned rule, and containment holds under either row.
2. `design.json` `manifestShape.decisions` lists `id,condition,outcome,startLine,endLine,quote` and omits `sourceId`. LC11 carries `sourceId`, and `skillRendering` reads `decision.sourceId`. This is a schema documentation gap, not an LC12 defect.

## Limits

- Upstream Chromium 154.0.8037.97 (Gitiles) was not re-fetched. Source identity rests on the committed bytes, the recorded sha256 and size, and the retained `source-opening.json` record, which was read but not re-verified over the network.
- Physical-line results apply to the checkpoint because the working-tree file is byte-identical to blob `cd7efa45…`.
- No test, build, or lint was run. No corpus or source file was edited.
