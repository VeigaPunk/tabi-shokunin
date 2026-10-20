VERDICT: ISSUES

# C1 / S031 — independent recheck (round 18, wave 2)

Scope: one row, `S031`, at measured candidate REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.
Read: `corpus/evidence/round-18/source-recheck/S031.json` and `S031.excerpt.txt`; the `S031`
row of `corpus/SOURCES.md:45` (byte-identical at B `2bff864f…` and REV; the line sha256 is
`fde3011e6c3e893ad6cf17da0fdb6cf1464164263e181c47a8b30ca00229561a` at both);
the original quote source `corpus/lessons/round-16.md:41`; the round-18 note
`corpus/knowledge/source-recheck-round-18.md`; the wave-1 seat record
`.ufo/waves/round-18/w1/Recheck15.md:36-58`; and the counter `measure-c1.mjs`.

The receipt is mechanically valid and counts under the C1 contract; the C1 counter at REV
reports 51 accepted receipts with no rejects, and S031 is one of them. The defect is
claim-support, not fetch or binding integrity: the row's `teaches` says "Chromium **ships** a
loose version", while the quoted source says Chromium "**is implementing** a loose version of
this and will conduct testing/trials to see if what we've come up with should be supported".
The quote does not support "ships", and the token `ships` occurs nowhere in the fetched body.
The defect pre-exists at B (same row bytes), so it is a carried wording defect surfaced by
this recheck, not round-18 drift, and it does not change `c1_rows_rechecked`.

## 1. Status against the assigned facets

| Facet | Observation | Status |
|---|---|---|
| Source identity | raw URL HTTP 200; 10,417 B; sha256 `4587c9f2…bd28`; GitHub Contents API at `ref=main` returns git blob `68af790f…` with the same sha256 and size; parent commit `cb3d1696` serves the same bytes | **held** |
| Anchor locator | `### Input schema synthesis` at body:106; `TODO: … are TBD` at 108-112 (blank 113); quoted sentence at 114-115; the row's cited range `108-115` still contains all of it | **held** |
| Anchor HEAD token | row cell says `repo HEAD cb3d1696…`; current `main` is `51ed7565…`, whose parent is exactly `cb3d1696` and whose only changed file is `index.bs`; the explainer bytes are identical at both | **held in content; HEAD token one commit stale** (receipt records the new HEAD) |
| Teaches | "TBD in the proposal" is supported by body:108-112; "loose version" existence is supported by body:114; "ships" is not supported by body:114-115; "build-scoped" is an inference from non-final synthesis | **partially held; overreach on "ships"** |
| Receipt count | counter at REV: `c1_rows_rechecked` 51, `rejected` `[]`, exit 0 | **counts** |

## 2. Independent fetch (exact command and full digest)

Command executed (same fetch flags, URL and user agent as the receipt; headers captured; no
`--write-out` field changes the body):

```sh
d=$(mktemp -d /tmp/tabi-r18-s031-XXXXXX)   # -> /tmp/tabi-r18-s031-qSAGFS
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -D "$d/headers" -o "$d/body" \
  -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/declarative-api-explainer.md'
```

Observed:

```text
HTTP=200 SIZE=4116 URL=https://raw.githubusercontent.com/webmachinelearning/webmcp/main/declarative-api-explainer.md
10417 /tmp/tabi-r18-s031-qSAGFS/body
4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28  /tmp/tabi-r18-s031-qSAGFS/body
```

`SIZE=4116` is the compressed transfer (`content-encoding: gzip`); the body on disk is
10,417 B, exactly the receipt's `bytes`, and its sha256 exactly the receipt's `sha256`
(`S031.json:9-10`). Response headers: `HTTP/2 200`, `content-type: text/plain; charset=utf-8`,
`date: Tue, 20 Oct 2026 20:02:26 GMT`, `cache-control: max-age=300`, `source-age: 0`.
`decode: none` (`S031.json:11`) is correct: the URL already serves raw Markdown.

Content-identity cross-check against a second endpoint (same repository identity, not the
raw CDN):

```sh
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  'https://api.github.com/repos/webmachinelearning/webmcp/contents/declarative-api-explainer.md?ref=main'
# api_sha 68af790f7b625ea6b926113a0e13f7670f93ca90; api_size 10417
# decoded sha256 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28; bytes 10417
git hash-object --no-filters /tmp/tabi-r18-s031-qSAGFS/body
# 68af790f7b625ea6b926113a0e13f7670f93ca90
```

So the fetched bytes are the repository blob at `main`, not merely an identical cached body.

## 3. Quote location and excerpt reproduction

```sh
grep -aboF 'Chromium is implementing a loose version of this and will conduct testing/trials' "$d/body"
# 5343:Chromium is implementing a loose version of this and will conduct testing/trials
grep -n 'Chromium is implementing' "$d/body"
# 114:Chromium is implementing a loose version of this and will conduct testing/trials to see if what
```

- Quote is at **line 114**, raw byte offset **5343**; it is the only occurrence.
- `S031.json:17` records `quoteOffset: 5241`. That is the offset in the producer's
  **normalized** text (NFC, quote/dash folding, whitespace runs collapsed, trimmed), not a
  raw byte offset. Reproduced with the producer's exported `normalize()`:
  `normalizedLength 10278`, `indexOf 5241`, `secondIndex -1`, `quoteWords 12`.
- The receipt's `anchorObserved` says "quote lines 114-115"; the **sentence** spans 114-115,
  but the quoted 12 words end on line 114. This is an exactness nit, not a location failure.
- `wordCount` is 12, within the 25-word cap (`S031.json:14`); the counter's
  `quoteWords !== wordCount` check passes.

Excerpt reproduction with the producer's own slice rule
(`text.slice(max(0, at-600), at+q.length+600)` plus `\n`):

```text
normalizedLength 10278
indexOf 5241
quoteWords 12
excerptLen 1280 bytes 1281
excerptSha ba1c914cf730d5ed021eb291e386996ff509e7b8174099dc2157abd3fe32d7a1
committedBytes 1281
excerptEqualsCommitted true
quoteInExcerpt true
```

This matches `S031.json:18-19` (`excerpt: S031.excerpt.txt`,
`excerptSha256: ba1c914c…d7a1`). The committed excerpt is exactly derivable from the body
fetched today; it is normalized text, not raw bytes, which is the producer's documented
behavior.

## 4. Anchor and commit identity

```sh
git ls-remote https://github.com/webmachinelearning/webmcp.git refs/heads/main
# 51ed75653aaa7f174f8dbe05d1bc327359bbc57c  refs/heads/main
curl -sSL --compressed --max-time 90 -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" 'https://api.github.com/repos/webmachinelearning/webmcp/commits/51ed75653aaa7f174f8dbe05d1bc327359bbc57c'
# sha 51ed75653aaa7f174f8dbe05d1bc327359bbc57c; parents ['cb3d16964ab3e92cfd5f09901ed0504373a906e8']; date 2026-10-20T14:57:14Z
# files: index.bs modified 55 additions / 0 deletions
curl -sSL --compressed --max-time 90 -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" 'https://api.github.com/repos/webmachinelearning/webmcp/commits/cb3d16964ab3e92cfd5f09901ed0504373a906e8'
# sha cb3d16964ab3e92cfd5f09901ed0504373a906e8; date 2026-10-20T09:53:18Z; files: ['index.bs']
curl -sSL --compressed --max-time 90 -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" -o "$d/body-cb3d1696" 'https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/declarative-api-explainer.md'
# HTTP=200; 10417; sha256 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28
```

- The row's anchor HEAD `cb3d1696` is the parent of current `main` `51ed7565`; both commits
  touch only `index.bs`, and the explainer blob is byte-identical at both. The row's line
  locator `108-115` therefore resolves at both revisions.
- The receipt's `anchorObserved` (`S031.json:20`) accurately records the new HEAD
  `51ed7565…`, the section at line 106, TODO/TBD at 108-112 (the receipt's range ends at the
  blank line 113), the sentence at 114-115, and
  the identical sha256. It does not say "the row anchor cb3d1696 is one commit behind"; the
  sibling S030 receipt (`S030.json`, anchorObserved) does say exactly that. This is a
  documentation asymmetry, not a false statement.
- The explainer's last change is commit `f14762e63607bf96592b1a7a6392cd2b047b8209`
  (2026-10-16T16:30:24Z, "Editorial: sync explainers with spec (#350)"), so the text being
  rechecked is four days old, not years. It is still only a document observation.

## 5. Does the quote support the teaches?

Row `teaches` cell, exact (`corpus/SOURCES.md:45`, field 8):

```text
Form-to-schema synthesis is TBD in the proposal and Chromium ships a loose version, so derived schemas are build-scoped
```

Source, body:108-115 (wording verbatim; long Markdown links elided with `…`):

```text
TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes
… are TBD. We need to concretely specify how various form-associated elements like <input> and
<select> reduce to a JSON Schema that includes anyOf, oneOf, and maximum/minimum declarations.

Chromium is implementing a loose version of this and will conduct testing/trials to see if what
we've come up with should be supported by the community as a general approach.
```

Component analysis:

| `teaches` component | Source support | Verdict |
|---|---|---|
| "Form-to-schema synthesis is TBD in the proposal" | body:108-112, direct ("TODO", "are TBD") | supported |
| "Chromium ships a loose version" | body:114 says "is implementing a loose version" and "will conduct testing/trials to see if … should be supported" | **not supported as written**; present-progressive implementation plus undecided trials, not shipping |
| "… so derived schemas are build-scoped" | inference from an unspecified reduction plus a non-final Chromium implementation | reasonable precaution, not entailed by the quote alone |

`grep -n 'ships\|shipped\|ship ' /tmp/tabi-r18-s031-qSAGFS/body` returns **no match**. The quote contains no shipping claim.
The same registry's search log says the runtime surface is "runtime-held on Chromium 154
loopback with flags only" (`corpus/SOURCES.md:86`), and the derived knowledge entry says
"Chromium-only surface" and "explainer says Chromium implements 'a loose version'"
(`corpus/knowledge/webmcp-chromium-loopback-round-16.md:85`). Those formulations are closer
to the source than "ships"; the row's unqualified "ships" is the outlier.

The receipt repeats the overreach: `S031.json:22` says "says Chromium ships a loose version
under testing"; the seat record says "still says Chromium ships 'a loose version' under
testing" (`w1/Recheck15.md:49-50`). The source says neither "ships" nor "under testing"; it
says "is implementing … will conduct testing/trials". The paraphrase changes the status from
in-progress/undecided to shipped/under test.

### Why the counter does not catch this

`measure-c1.mjs` checks the verdict token (`:337-340`), quote-in-excerpt (`:368-369`), and
live quote presence (`:428-431`), but never whether the teaches is entailed by the quote.
The note itself states the limit: "Quote presence is not claim truth … It does not show that
the row's `teaches` claim is correct, that the quote supports it"
(`corpus/knowledge/source-recheck-round-18.md:140`). So the receipt's `held` is an
author-side verdict accepted by the counter, not a counter-owned semantic check. This finding
is therefore invisible to `c1_rows_rechecked`, which is why the receipt can both count and be
semantically overstated.

## 6. Availability vs product freshness

C1's claim is "Source rows re-verified against their live source with a committed recheck
receipt" (`.ufo/waves/round-18/PLAN.md:15-16`). The row URL is a live branch
(`raw.githubusercontent.com/…/main/…`), the fetch was live (HTTP 200 at 19:05:42Z in the
receipt and again at 20:02:26Z here), and the bytes are content-addressed to the current
`main` blob. It is therefore not "immutable availability" in the pinned-tag sense: the
recheck really did re-open a live URL.

But the payload is byte-identical to the round-16 record (`corpus/lessons/round-16.md:41`,
sha256 `4587c9f2…bd28`), and the file was last edited 2026-10-16. So the recheck establishes:

- the source is still reachable and serves the same document (availability/stability);
- the quoted sentence is still present at the same locator (textual freshness);
- it does **not** establish that the document's product statement ("Chromium is
  implementing …", and a fortiori the row's "ships") is true or current today.

The lane's gate explicitly scopes this: "C1 counts round-specific integrity-checked recheck
receipts, not overdue rows or current product support"
(`corpus/lessons/round-18.md:12-13`), and the note says "the 51 rows are not a statement of
current live product support" (`source-recheck-round-18.md:141`). Read with those sentences,
the **main claim does not conflate** document freshness with product freshness. The confusion
exists at the row/receipt level: "ships" is a product-state word, and `teachesVerdict: held`
does not distinguish "the text is unchanged and still says implementing/under trials" from
"the product claim is current".

Finite contrast: body:114-115 says the community-support question is still to be decided
("will conduct testing/trials to see if … should be supported"), while `SOURCES.md:45` says
Chromium "ships" it. Those cannot both be the source's claim; one is an inference the source
does not license.

## 7. Mechanical contract check and counter result

Every PLAN:69-75 rule checked against the receipt and REV:

| Contract item | Observed |
|---|---|
| schema `tabi-source-recheck-v1` | `S031.json:2` |
| row present at REV, not in the B superseded set | `S031`; no `supersedes S031 —` row at REV |
| `rowUrl` verbatim in row `source` cell | yes, `SOURCES.md:45` |
| `sha256` 64-hex | yes |
| `quoteWords` ≤ 25 and equals count | 12; reproduced |
| `normalize(quote)` in `normalize(excerpt)` | true |
| `excerptSha256` = sha256 of excerpt bytes | `ba1c914c…d7a1`; reproduced |
| `quoteFound` true | true; one occurrence |
| `fetchedAt` 2026-10-20 | `2026-10-20T19:05:42.075Z` |
| `teachesVerdict` held or drift+superseding | `held` |
| `httpStatus` 200 | 200 |
| `producerSha256` = producer blob at REV | `f2ba0033…a360`; `git show REV:…` matches |
| one receipt per row | exactly `S031.json` + `S031.excerpt.txt` |

Counter run (read-only; no `--live`, so no 51-URL re-fetch):

```sh
timeout 300 node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed (exit 0):

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`eligible_rows` 58 = 64 rows at REV (57 at B + S058-S064) minus the six superseded at B; the
51-receipt baseline target is the 51 rows not superseded at B (PLAN:16), so 51/51 for that
target, not 51/58 for every row at REV. The seven new rows have no receipts and are not
claimed by C1. This is a framing note, not a defect.

## 8. Findings

### F1 — `teaches` says "ships"; the quote says "is implementing … will conduct testing/trials" (medium; claim-support, not count)

- Paths: `corpus/SOURCES.md:45` (`teaches` field 8); source `declarative-api-explainer.md:114-115`
  (fetched body); receipt `corpus/evidence/round-18/source-recheck/S031.json:22`; seat record
  `.ufo/waves/round-18/w1/Recheck15.md:49-50`.
- Counterexample: the body line is literally "Chromium **is implementing** a loose version of
  this and **will conduct testing/trials** to see if what we've come up with **should be
  supported** …"; the row says "Chromium **ships** a loose version". The body has zero
  occurrences of `ships`/`shipped`/`ship `. The sentence's own trials/support clause does
  not support a present shipping claim. The registry's own line 86 ("with flags only")
  confirms the test-only posture.
- Consequently `teachesVerdict: held` is too strong as a support verdict, even though the
  quote is present and the document is unchanged. The receipt remains mechanically valid, and
  the C1 count is unaffected.
- Repair (for the L1, not this seat): qualify the row's wording to "Chromium is implementing a
  loose version under trials/testing, observed only in test builds/flags" or move the
  product-state sentence to a source that says it (S032/S034 plus the runtime receipt). SOURCES
  permits only status/recheck/used-by in place, so a teaches change needs a new superseding row
  (or a C3-style correction that explicitly supersedes S031); do not mutate S031's `teaches`
  cell in place.
- Confidence: high on the textual mismatch (verbatim body says "is implementing … will conduct
  testing/trials"; zero `ships`/`shipped`/`ship ` tokens); medium on materiality, because a
  test-build implementation could be loosely called "ships" if that qualifier were present.

### F2 — anchor exactness: quote line 114, sentence 114-115; HEAD token `cb3d1696` one commit behind (low)

- `S031.json:20` and `w1/Recheck15.md:45-48` call the quote location "lines 114-115"; the
  quoted 12 words are entirely on line 114. The sentence continues on 115, so this is a
  sentence-span description, not a false locator. The row's range `108-115` holds at both
  HEADs.
- The row's anchor HEAD `cb3d1696` is the parent of current `main` `51ed7565`; `51ed7565` only
  changed `index.bs` (55/0), so the explainer bytes are identical. The receipt records the new
  HEAD but not the parent relationship; `S030.json` records the parent relationship explicitly.
  The note's "Two cases the receipts show directly" section
  (`source-recheck-round-18.md:116-119`) does not list this third moving-HEAD case, although
  its live/rolling list (`:111`) includes S030-S032. Documentation asymmetry only; no content
  drift.

### F3 — `quoteOffset` is a normalized-text index, not a raw byte offset (low)

`S031.json:17` records 5241, which is the index in `normalize(body)` (length 10278). The raw
body offset is 5343 (line 114). The producer's `--normalize-only` mode prints `offset` beside
`normalizedLength` (`recheck-fetch.mjs:76`), but the receipt and note do not; the counter
validates offsets only for S029 (`measure-c1.mjs:371-374`). An external verifier seeking raw
bytes 5241-5292 lands 102 bytes before the quote start (5343), not at the quote. Reproduction
should use the quote search, not the offset. Suggest
recording the domain in `normalizer` or adding a raw offset field.

### F4 — recorded `command` is not shell-safe as written (low)

`S031.json:7` records `-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18` without
quoting. `curl` takes only the next argv element as the user agent, so a literal shell replay
would pass `Mozilla/5.0` as UA and treat `(X11,`, `Linux`, `x86_64)` and
`tabi-shokunin-recheck/18` as additional URLs. The counter compares the string to its
canonical form (`measure-c1.mjs:356`) and invokes a real argv array (`:396-402`), so the
counter and this recheck are unaffected; my replay quoted the UA. Record the argv array or a
quoted UA so the receipt is independently replayable.

### F5 — freshness framing: document stability, not product state (informational)

The recheck is genuine live availability of a live branch, but the payload is unchanged since
2026-10-16 and identical to the round-16 record. C1's gate and the note's §6 disclaim product
support (`round-18.md:12-13`; `source-recheck-round-18.md:140-141`), so the main claim as
written is source-level and does not conflate the two. The row's "ships" and the receipt
note's "ships … under testing" are where the conflation would enter; F1 is the actionable
part.

### F6 — seat record mislabels the row's `summary` as `teaches` (low)

`w1/Recheck15.md:36` prints `teaches = "Proposed declarative (HTML form) WebMCP surface and
its open schema-synthesis question"`, which is the row's summary cell, not the `teaches` cell
(the latter is `Form-to-schema synthesis is TBD … Chromium ships …`, `SOURCES.md:45` field 8).
The receipt's note and verdict prose address the right claim, so this is a report-labeling
error, not a receipt error. It matters because a reader checking "teaches held" would look at
the wrong cell.

## 9. What held, drifted, unreachable

- **Source identity: held.** HTTP 200; 10,417 B; sha256 `4587c9f2…bd28`; Contents API blob
  `68af790f…`; parent commit same bytes.
- **Anchor: held as locator; HEAD token drifted by one commit** (`cb3d1696` → `51ed7565`,
  parent; `index.bs` only; explainer bytes identical). Section/lines `108-115` still resolve.
- **Teaches: partially held.** TBD and "loose version" held; "ships" unsupported by the quote;
  "build-scoped" is a reasonable inference, not a quote fact. No source drift occurred; the
  overreach is a wording defect present at B.
- **Unreachable: none.** No alternative rendering was needed because the raw endpoint served
  the quote; the Contents API was used as a second identity check, not as a replacement.

## 10. Limits and non-claims

- Quote 12/25 words; one occurrence; one file; one commit difference; one alternate endpoint.
- Remaining unknown: whether Chromium's current build still carries the loose declarative
  implementation; this recheck observed no Chromium build. The lane's round-16 runtime record
  is the only runtime evidence and was not refreshed here.
- No browser, no WebMCP tool invocation, no Chromium build, no runtime re-observation. The
  product-state analysis is textual only.
- The producer `recheck-fetch.mjs` was not executed against production; the counter was run
  read-only without `--live`; no git writes, no production lane writes, no `jj`, no index
  operations. All scratch was under `/tmp/tabi-r18-s031-*` and was removed after extraction.
- Tool installs/upgrades: none. Existing `curl`, `git`, `node`, `python3` were used.
- The S029 own-work path was not touched; this item attacks S031 only.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS031.md`
