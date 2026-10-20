VERDICT: PASS

# W2 falsification — C1 receipt S022, independent live re-open

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; measured candidate REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`; baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`.
Read-only: no lane/fleet/sibling edits, no git or jj writes in LANE. All fetch artifacts are under
`/tmp/tabi-r18-s022-falsify/`. Nothing was written through the recheck producer.

Pinned inputs, read at REV (working-tree bytes identical to REV blobs):

| Path | Blob at REV | SHA256 |
|---|---|---|
| `corpus/evidence/round-18/source-recheck/S022.json` | `f58ecde30f1d20738b512245a252febd05f2c389` | `6f696bf21cb75c7f70924da2973780d7f67ab288e7580994c20fa7f92e2f2d5d` |
| `corpus/evidence/round-18/source-recheck/S022.excerpt.txt` | `550cb298dcab695428d397cd1a061e62db13a512` | `ef1fd81d3c3d5cf637c8a000f71739c44d9443b99fae422321c707fb7792edd4` |
| `.ufo/waves/round-18/recheck-fetch.mjs` | `7d9c314e4fc84b672cb024f400101127033552ec` | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` |
| `.ufo/waves/round-18/measure-c1.mjs` | `898b9fcfa8c7a8d208a84e2bcbc3302a9659ae39` | `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` |

`S022.json` `producerSha256` equals the producer blob digest, and `S022.excerpt.txt`'s committed
bytes equal the receipt's `excerptSha256` (both re-hashed). Registry row:
`corpus/SOURCES.md:36` at REV, status `queued`, tier `B`, source cell
`Identifying and Mitigating Flaky Tests in JavaScript — https://ieeexplore.ieee.org/document/10989021/`,
teaches cell `Frames JavaScript test nondeterminism as a research agenda; methods and results not yet read`.
Original quote source `corpus/lessons/kaika-fleet-round-1.md:65` carries the same 19 words and records
the old empty body `e3b0c442…` with "page reader; raw curl body empty".

## 1. Independent fetch of `receipt.url`

Fetch argv — identical to the receipt's `command` except the output path (`body` in
`/tmp/tabi-r18-s022-falsify` instead of the receipt's `<tmp>/body`):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} bytes=%{size_download} url=%{url_effective}\n' \
  'https://ieeexplore.ieee.org/abstract/document/10989021'
```

Observed:

```
HTTP=200 bytes=47373 url=https://ieeexplore.ieee.org/abstract/document/10989021
sha256 f8bddbc8c9830998d83d57f5e0a384f866db286d9a927130fed081441f62f6a3
file: HTML document, ASCII text, with very long lines (7509), CRLF and LF
```

Receipt says `httpStatus 200`, `bytes 45610`, `sha256 0748f3739d37e8b01e013006877cfaa633c9ef2fd159589a84a25260f62042dc`.
The raw body differs (1763 bytes, different digest); §4 shows this is a dynamic-page difference, not drift.

Row URL (`rowUrl`, the URL recorded in the SOURCES row) fetch, same argv, trailing slash:

```
HTTP=202 bytes=0 url=https://ieeexplore.ieee.org/document/10989021/
sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

Response headers, from
`curl -sSI --compressed --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' 'https://ieeexplore.ieee.org/document/10989021/'`:
`HTTP/2 202`, `content-length: 0`, `x-amzn-waf-action: challenge`,
`x-cache: Error from cloudfront`, `cache-control: no-store`. The empty-body digest is exactly the
digest recorded by the original lesson row, so the 202 is an AWS WAF challenge, not a redirect and not
a missing record. This confirms the receipt's `note` clause verbatim ("the row URL /document/10989021/
answers curl with HTTP 202 and 0 bytes, while the same article number at /abstract/document/10989021
serves 200 with the abstract").

## 2. Quote location in the fetched body

The 19-word quote occurs four times in the live body:

| Raw offset | Context |
|---|---|
| 6408 | `<meta name="Description" id="meta-description" content="…">` (truncated at "makes") |
| 7628 | `<meta property="twitter:description" content="…">` (full abstract) |
| 8102 | `<meta property="og:description" content="…">` (full abstract) |
| 14979 | `xplGlobal.document.metadata` → `"abstract":"…"` (full abstract, 425 chars) |

Normalized offsets in my body (normalizer from `recheck-fetch.mjs`, `decode: none`):
`6217, 7340, 7811, 14323`; normalized body length `45280`. The receipt's own `quoteOffset` is `4454`;
its body is not committed, but the committed excerpt is internally consistent with that offset:
excerpt = normalized text `slice(3854, …)`, and the quote sits at normalized offset `600` of the
1320-char excerpt. I cannot re-derive the receipt's 45610-byte body byte-for-byte (not retained), so
`4454` is checked for consistency with the excerpt, not independently re-computed.

## 3. Source identity and anchor: held

Parsed from the live `xplGlobal.document.metadata`:

```
articleNumber      10989021
doi                10.1109/ICST62969.2025.10989021
publicationTitle   2025 IEEE Conference on Software Testing, Verification and Validation (ICST)
publicationYear    2025
title              Identifying and Mitigating Flaky Tests in JavaScript
abstract           425 chars (text in §4)
isOpenAccess       false
accessType         None
```

The page carries `<link rel="canonical" href="https://ieeexplore.ieee.org/abstract/document/10989021" />`,
so the fetched path is the page's own canonical rendering of the same article. `articleNumber 10989021`
and the DOI match the row's anchor cell `IEEE ICST 2025, DOI 10.1109/ICST62969.2025.10989021, Abstract`
(`corpus/SOURCES.md:36`); the 2026-10-19 scope `JavaScript flaky-test research framing, abstract only`
also matches the served abstract.

- Source identity: **held** (same IEEE article number, same DOI, canonical self-link).
- Anchor: **held** (ICST 2025, DOI, abstract present).
- Teaches: **held against the live source**, with the quote-only caveat in §5.
- Drift: none observed. Unreachable: no — the row URL is WAF-challenged (202/0 B), but the canonical
  abstract path for the same article answers 200.

## 4. Receipt vs observed, field by field

| Field | Receipt | Observed now | Status |
|---|---|---|---|
| `httpStatus` | 200 | 200 (`/abstract/…`) | held |
| `bytes` | 45610 | 47373 | differs — dynamic page; note §6 permits |
| `sha256` | `0748f373…042dc` | `f8bddbc8…6a3` | differs — dynamic page; not a drift |
| `decode` | none | none (HTML) | held |
| `quoteWords` / `quote` | 19 / same text | 19 tokens / 4 occurrences | held |
| `quoteFound` | true | true in excerpt and live body | held |
| `quoteOffset` | 4454 | not re-derivable (body uncommitted); excerpt geometry consistent | consistent |
| `excerptSha256` | `ef1fd81d…` | `ef1fd81d…` | held |
| `anchorObserved` | articleNumber 10989021, 2025, DOI, ICST, abstract | exact same values (title expanded) | held |
| `teachesVerdict` | held | held (full abstract), see §5 | held |
| `fetchedAt` | `2026-10-20T19:06:18.862Z` | 2026-10-20 (run at 20:02Z) | same day |
| `rowUrl` in row | `https://ieeexplore.ieee.org/document/10989021/` | literally present at `SOURCES.md:36` | held |
| `url` relation | `/abstract/document/10989021` | canonical self-link of that page; special-cased in `measure-c1.mjs:210-216` | held |
| `command` | canonical curl argv | exact `expectedCurlCommand(url)` equality, enforced at `measure-c1.mjs:356`; counter accepted | held |
| `producerSha256` | `f2ba0033…` | producer blob sha `f2ba0033…` | held |

Dynamic-body control: taking the same ±600-char window around the first quote occurrence in my fresh
body yields a 1320-char string that equals the committed excerpt in its 600-char post-quote half and
differs in the pre-quote half only at bytes `[0,6)`: `a8915a` (receipt) vs `f984f2` (mine) — a
session/cache token. That is a six-character dynamic difference, not content drift; the 1763-byte
body-size difference lies before the excerpt window, which begins at normalized `3854` (receipt
geometry) / `5617` (my body). The note's own limit
`corpus/knowledge/source-recheck-round-18.md:143` says a receipt digest must not be compared
across runs.

Counter at REV (`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`,
exit 0, empty stderr):

```
c1_rows_rechecked 51, eligible_rows 58, held 50, drift_superseded 0, own_work 1, rejected []
counterSha256 df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234
```

`eligible_rows 58` is 64 registry rows at REV minus the 6 superseded; the 7 rows opened this round
(S058–S064) have no C1 receipt by design. S022 is inside the counted 51 (`rejected` is empty).

## 5. Does the quote support the teaches cell?

**No, not by itself.** The quoted 19 words are:

> Flaky tests, which have non-deterministic outcomes (pass or fail when running on the same code), are a significant issue

They contain no occurrence of "JavaScript", "research", "aims", "methods" or "results". The teaches
cell — `Frames JavaScript test nondeterminism as a research agenda; methods and results not yet read` —
is supported by the **next sentence of the same abstract**, which is present in the live body:

> This research aims to explore the root causes of flaky tests in open-source JavaScript projects, develop practical techniques to manifest possible flaky behaviour, and provide a mechanism to mitigate some of those flaky tests.

That sentence begins at normalized offset `7539` in my body (inside the `twitter:description` copy;
the metadata `"abstract"` copy is at `14323`) and the abstract ends there with no methods or results,
so the teaches cell is true of the source.

But the committed excerpt does not contain it. `S022.excerpt.txt` normalized is 1320 chars; it
contains neither `This research aims to explore the root causes` nor `open-source JavaScript projects`.
Mechanism, finite and reproducible: `recheck-fetch.mjs:106-107` matches `text.indexOf(q)` (the first
occurrence) and slices `at-600 … at+len+600`. The first occurrence is the truncated
`<meta name="Description">` copy at normalized `6217`; the window ends at `6937`. The next copy of
the quote (`twitter:description`) begins at `7340`, and its supporting aim sentence at `7539` — 602
chars past the window end. Every full copy of the abstract (`7340`, `7811`, `14323`) is therefore
outside the excerpt. The producer's excerpt window is simply too short by ~602 chars for this page
shape.

Consequence: `teachesVerdict: held` is **true of the live source but not re-derivable from the
committed receipt bytes**. This is not a contract violation of C1 as written: `PLAN.md:67-75` requires
only that `normalize(quote)` occurs in `normalize(excerpt)` and that `teachesVerdict` be `held`;
`corpus/knowledge/source-recheck-round-18.md:140` explicitly disclaims that quote presence shows the
quote supports the teaches claim and calls `anchorObserved` free text. It is recorded here as finding
F1 (evidence-window limitation), not as a false receipt.

## 6. Immutable availability vs live product freshness

C1's declared object is source-row recheck, not product support:

- `PLAN.md:15-17`: "Source rows re-verified against their live source with a committed recheck receipt".
- `corpus/lessons/round-18.md:12-13`: "C1 counts round-specific integrity-checked recheck receipts,
  not overdue rows or current product support."
- `corpus/knowledge/source-recheck-round-18.md:7` and `:141`: the note "does not make any knowledge
  entry true"; receipts "say nothing about how any product behaves, and the 51 rows are not a
  statement of current live product support."

S022's source is a fixed 2025 conference record (`publicationYear 2025`, `isOpenAccess false`, DOI).
A 200 on its abstract page witnesses that the record and its abstract are still served — availability
and identity of a fixed artifact — and cannot witness current product behavior. Because the claim and
the note define the freshness measure as registry-source recheck and disclaim product liveness, the
receipt does **not** confuse immutable availability with live product freshness. A finite
counterexample to the stronger reading: if "freshness" meant product currency, S022 (a 2025 paper
whose full text still requires sign-in, `accessType None`) could not witness it; but no C1 text, note
sentence, or counter field claims that. Verdict: no conflation.

The one boundary worth carrying: the successful fetch is not the URL printed in the SOURCES row. The
row's `/document/10989021/` returns an AWS WAF challenge (202, 0 B); the receipt fetches
`/abstract/document/10989021`, which the page's own `rel=canonical` and `articleNumber` bind to the
same article, and `measure-c1.mjs:210-216` hard-codes exactly that mapping (`sourcePath ===
'/document/10989021'`). Identity held, but reproducibility of this row depends on that counter-side
exception, not on the row URL alone.

## 7. Findings (each with path:line and finite counterexample)

**F1 — MEDIUM, verified: the committed excerpt truncates the sentence that supports the teaches cell.**
`S022.excerpt.txt` (1320 normalized chars) lacks `This research aims to explore the root causes` and
`open-source JavaScript projects`; the live body contains both. Producer cause:
`.ufo/waves/round-18/recheck-fetch.mjs:106-107` (first occurrence + ±600 window); page cause: the
first occurrence is the truncated meta Description. Counterexample command:
`grep -c 'This research aims to explore the root causes' corpus/evidence/round-18/source-recheck/S022.excerpt.txt`
→ `0`, exit `1`; the same string occurs `3` times in the live body (first at normalized `7539`). Effect:
`teachesVerdict: held` is
true but not auditable from committed bytes. Not a C1 contract violation (`PLAN.md:67-75`; note
`source-recheck-round-18.md:140`), so it does not lower the counter's 51.

**F2 — LOW, verified: the row URL is not fetchable by the recheck method; the actual witness is the
canonical abstract path.** `https://ieeexplore.ieee.org/document/10989021/` → 202, 0 bytes,
`x-amzn-waf-action: challenge`; receipt `note` records this and the counter maps it at
`measure-c1.mjs:210-216`. The fetched page's `rel=canonical`, `articleNumber 10989021`, DOI and title
bind it to the row's article. Identity held; the caveat is that the SOURCES row's recorded URL alone
yields no body, so a future recheck without the counter's S022 exception would fail.

**F3 — EXPECTED, verified: raw-body digest/byte difference is dynamic-page noise, not drift.** Receipt
45610 B / `0748f373…`; my fetch 47373 B / `f8bddbc8…`. The ±600 window at the quote is identical to
the committed excerpt except one six-character token (`a8915a` vs `f984f2`); post-quote 600 chars are
byte-identical; all four quote occurrences and every metadata field match. `note:143` forbids treating
the digest as page identity across runs.

**F4 — POSITIVE: all receipt bindings hold.** `quoteWords 19` = token count; `quote` matches the
lesson `kaika-fleet-round-1.md:65` exactly; `excerptSha256` matches committed bytes;
`producerSha256` matches the producer blob at REV; `rowUrl` occurs verbatim in `SOURCES.md:36`;
`url` is the canonical rendering of the same IEEE article; `fetchedAt` is on 2026-10-20; the counter
accepts the receipt (`rejected: []`, `c1_rows_rechecked 51`, exit 0).

**F5 — POSITIVE (out-of-scope cross-check): the own-work path is correctly bound.** S029 receipt
`sha256 b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, `bytes 97073`,
`httpStatus null`; `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
re-hashes to the same 64-hex and the same 97073 bytes. No network was used for S029.

## 8. Limits and unrun checks (an unrun check is not a pass)

- The receipt's own fetched body is not committed, so I compared the committed excerpt and the live
  body, not the receipt body byte-for-byte. The receipt's `quoteOffset 4454` is therefore checked for
  excerpt consistency, not re-computed against its body.
- I did not run `measure-c1.mjs --live`; it re-fetches all 51 rows. I ran the committed-input counter
  at REV and two independent fetches for this row only.
- No browser was launched and no page tool was invoked; the page served server-rendered metadata, so
  no fixture loopback was needed. Public GET only.
- S029 is outside this item's primary scope; it was cross-checked with `git show`, not by re-reading
  its fields for claim truth.
- No tool installs or upgrades were made, so there is nothing to record on that line.

## 9. Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS022.md` (this report)
- `/tmp/tabi-r18-s022-falsify/body` (47373 B, SHA256 `f8bddbc8c9830998d83d57f5e0a384f866db286d9a927130fed081441f62f6a3`)
- `/tmp/tabi-r18-s022-falsify/rowurl.body` (0 B, SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`)
- `/tmp/tabi-r18-s022-falsify/c1.out`, `/tmp/tabi-r18-s022-falsify/c1.err`
- `/tmp/S022_at_REV.json` (REV blob copy used for the identity check)

Report: .ufo/waves/round-18/w2/LiveS022.md
