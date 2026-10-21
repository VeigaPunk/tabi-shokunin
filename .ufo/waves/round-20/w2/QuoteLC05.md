# QuoteLC05 — LC05 mechanical quote, span, source identity, and anchor check

Checkpoint: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
Scope: literal quote, whitespace word count, line numbers, source identity, cited-row anchor containment, and the citation-id rule. Semantic entailment of LC05 is not checked (separate by assignment). Author-side finding; not external closure.

## Verdict

LC05 passes every mechanical check. One non-blocking observation about S100's supersession of S096 is recorded below. No edits, tests, clones, or commits. No tools installed or updated.

## Record under check

- `corpus/evidence/round-20/lifecycle/decisions.json`, LC05 (lines 43–50): `startLine` 218, `endLine` 221, no `sourceId` field, `quote` on line 49.
- `.ufo/waves/round-20/design.json`, LC05 (lines 57–64): `span` [218, 221].
- Manifest `source` (decisions.json lines 3–8): id `S096`, path `corpus/evidence/round-20/sources/html_form_element.cc`, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Quote and source line

- Quote (decisions.json:49): `form_->PrepareForSubmission(/*event*/ nullptr, submit_button);`
- Source physical line: **220** of `html_form_element.cc`, the only occurrence of this literal in the file:

```
    form_->PrepareForSubmission(/*event*/ nullptr, submit_button);
```

Context, lines 218–221:

```
218:  } else {
219:    // With the `toolautosubmit` attribute, we immediately submit the form.
220:    form_->PrepareForSubmission(/*event*/ nullptr, submit_button);
221:  }
```

## Checks

| # | Check | Observed | Result |
|---|---|---|---|
| 1 | Literal quote | Exact ASCII bytes, no escapes; byte-for-byte match with decisions.json:49 | PASS |
| 2 | Quote location in source | One occurrence in the whole file, physical line 220 (LF-counted, 1-based). File has 1740 LF lines and 0 CR, FF, VT, U+2028, U+2029, or NEL, so line numbering is unambiguous. | PASS |
| 3 | Whitespace words in quote | 3 (limit 25) | PASS |
| 4 | Record and design line numbers | startLine 218 and endLine 221 equal design span [218, 221]. Quote line 220 lies inside [218, 221]. | PASS |
| 5 | Committed source at checkpoint | Working file blob `cd7efa45834bfce0697b06c7092f16d084c4eb55` equals the committed blob at 4ae99816. `git status` is clean for the file. | PASS |
| 6 | Source sha256 | Local file, manifest, S096 "decoded sha256", and S100 "decoded sha256" are all `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | PASS |
| 7 | Upstream identity (primary opened) | Gitiles TEXT at tag `154.0.8037.97` decodes to bytes identical to the local file. Tag JSON commit is `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. Gitiles TEXT at that commit is also byte-identical. | PASS |
| 8 | Manifest URL vs S096 row URL | Identical: `…/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT` | PASS |
| 9 | Cited-row anchor containment | S096 anchors `174-328, 729-758, 818-842` contain [218, 221], inside 174-328 | PASS |
| 10 | Citation-id rule | LC05 has no `sourceId`, so it resolves to manifest `source.id` S096. Contract: LC11 → S100, others → S096. | PASS |

## Observations (non-blocking; not failures of the checks above)

1. **S100 supersedes S096.** The S100 row (`corpus/SOURCES.md:114`) says "supersedes S096" and its anchors (`174-328, 635-842`) also contain the LC05 span. The contract keeps LC05 on S096, so the citation is compliant. The integrator should decide whether a row that S100 declares superseded should remain the cited row for non-LC11 decisions. I did not edit SOURCES.md or decisions.json.
2. **Start line is the brace, not the quote.** LC05 `startLine` 218 is the `} else {` line, while the quote is on 220. The span brackets the quote and equals the design span, so this is not a defect.
3. **S096 row carries no reciprocal marker.** S096's own text says "supersedes S078" and has no superseded-by marker; the supersession is stated only on the S100 row.

## Not checked

- Semantic entailment of LC05 condition and outcome (separate by assignment).
- Knowledge-document rendering of the LC05 table row (`S096:218-221` form), which lies outside decisions.json and SOURCES.md.
- LC11: only observed that decisions.json:93 carries `sourceId` S100, consistent with the rule. Not otherwise checked.

## Exercised verification

- Read-only git at 4ae99816: `rev-parse --verify`, `cat-file -s`, `rev-parse` of the blob, `hash-object` of the working file, and `status --short` for the file.
- `sha256sum` of the working file and `git show <checkpoint>:<path> | sha256sum`.
- Exact ASCII literal grep on decisions.json and on the source file.
- One read-only Python pass: terminator and control-character counts, parsing of the record, design, and SOURCES rows, anchor containment, and HTTPS GETs to chromium.googlesource.com (Gitiles tag JSON, TEXT at tag and at commit, base64-decoded and hashed).
- Not exercised: any test, build, or formatter, by assignment.

## Installs and updates

None.

Report: `.ufo/waves/round-20/w2/QuoteLC05.md`
