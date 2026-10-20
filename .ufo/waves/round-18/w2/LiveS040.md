VERDICT: PASS

# Attack: C1 receipt S040 (bug0 WebMCP Chrome 146 guide)

Attacked `corpus/evidence/round-18/source-recheck/S040.json` and its excerpt at REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`, against the S040 row at
`corpus/SOURCES.md:54`, the receipt's `quoteSource` `corpus/lessons/round-16.md:49`, and
`corpus/knowledge/source-recheck-round-18.md:89,123-133,140-150`. Baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. All writes are the report plus the private
temp fetch directory; no lane production, fleet, sibling, Git index, jj, browser, or
producer write was touched.

## 1. Independent re-fetch (observed)

Exact command (receipt argv; the User-Agent is one argument and is quoted here because
the receipt's printed form does not quote it — see O2):

```
D=/tmp/tabi-r18-s040-1792526528-3092
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code}' \
  'https://bug0.com/blog/webmcp-chrome-146-guide'
```

Observed at `date -u` `2026-10-20T20:02:08Z`:

```
HTTP=200
242270
a85a527aed2cb5de25d698535d3850de7bcb990d62944965d54826fc10bb0570
```

A second GET in the same session (`-D headers -o body2`) returned `HTTP=200`, `242270`
bytes, and the identical full SHA-256 `a85a527aed2cb5de25d698535d3850de7bcb990d62944965d54826fc10bb0570`.
Headers: `content-type: text/html; charset=utf-8`, `etag: W/"11zdsljjosh56xa"`,
`x-vercel-cache: HIT`, `age: 6`, `x-nextjs-prerender: 1`, `server: Vercel`.
Two independent fetches byte-identical; raw-body equality is not merely assumed.

Receipt comparison — every mechanical field holds:

| Receipt field | Receipt value (`S040.json:8-20`) | Independent observation |
|---|---|---|
| `httpStatus` | 200 | 200 |
| `bytes` | 242270 | 242270 |
| `sha256` | `a85a527a…bb0570` | exact full digest above |
| `decode` | `none` | UTF-8 body contains the quote |
| `quoteFound` | true | true |
| `quoteOffset` | 192718 | 192718 in the normalized body |
| `excerptSha256` | `40baf1b4…e4447f` | exact (see §3) |
| `fetchedAt` | `2026-10-20T19:06:29.560Z` | file mtime `16:06:29 -0300` = same instant |

## 2. Quote location

Normalizing with the producer's own `normalize()` (NFC, curly quotes/dashes folded,
whitespace runs collapsed) gives a 241657-character body. The quote is 42 characters
and `indexOf` is **192718**, exactly `S040.json:17`.

Producer-normalize-only cross-check (read-only; writes nothing):

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none \
    --body /tmp/tabi-r18-s040-1792526528-3092/body \
    --quote 'The API lives at `navigator.modelContext`.'
{"found":true,"offset":192718,"normalizedLength":241657,"window":"…How it actually works\\n\\nThe API lives at `navigator.modelContext`. Developers register tools…"}
exit=0
```

Raw-byte occurrences of the receipt's backticked form are `193124`, `204740`, `229048`
(the first is the embedded RSC/Markdown copy of the article). The rendered HTML form
`The API lives at <code>navigator.modelContext</code>` occurs at raw byte `48267`; it is
the same sentence with code markup instead of Markdown backticks. The receipt's
`quoteOffset` is normalized, not raw; that is consistent with the producer.

Excerpt (`S040.excerpt.txt`, one line, 1243 bytes, SHA-256
`40baf1b14db8b580eeac18fd5c5861c5dc39c1cfa5e5b1dbbd54838f67e4447f`) is exactly the
producer window: 600 characters before the quote + 42-character quote + 600 after + `\n`.
The quote begins at excerpt byte 600. I reproduced the slice from the fetched body and
got the same 1243 bytes and SHA-256. The excerpt starts mid-URL
(`tps://www.linkedin.com/in/hannah-van-opstal/...`) and contains literal `\n` escapes
from the RSC payload; it is a machine slice, not a prose context. It contains **zero**
occurrences of `chrome://flags` or `Experimental Web Platform Features`:
Byte counts on the excerpt are 0 for both.

## 3. Source identity and anchor

Held, on the fetched bytes:

- `<link rel="canonical" href="https://bug0.com/blog/webmcp-chrome-146-guide">` — exact
  `rowUrl` (`S040.json:4`); title `WebMCP just landed in Chrome 146. Here's what you need to know | Bug0`.
- JSON-LD `BlogPosting`: `"datePublished":"2026-02-11T06:06:40.926Z"`,
  `"dateModified":"2026-02-11T06:06:40.926Z"` — exactly `anchorObserved` (`S040.json:20`).
- Rendered byline: `<time dateTime="2026-02-11" itemProp="datePublished">February 11, 2026</time>`
  and `<meta itemProp="dateModified" content="2026-02-11"/>`; the string
  `February 11, 2026` occurs twice (HTML and RSC).
- `<h2>How it actually works</h2>` is immediately followed by the quoted paragraph, so
  the row's anchor "§How it actually works para 1" (`corpus/SOURCES.md:54`, anchor cell)
  holds.
- No update marker: 0 occurrences of `Updated`, `updated`, `Last updated`, `Editor's
  note`, `Correction`, or `Chrome 154`; 48 occurrences of `Chrome 146`. The article is an
  unchanged, dated 2026-02-11 post, not a rolling page.
- The flag recipe is in a different section, "How to try it today" (rendered HTML:
  Install Chrome 146 or later; Navigate to `chrome://flags`; Search for
  "Experimental Web Platform Features"; Set to "Enabled"; Relaunch Chrome). It occurs at
  raw offsets 58966 (HTML), 200111, 211727, 236035 (RSC copies).

**Verdicts:** source identity **held**; anchor **held**; teaches **held only under the
row's "as of 2026-02-11" qualifier**; source-byte drift **none**; unreachable **no**.

## 4. Does the quote actually support the teaches?

Partly, and the split is material:

- The quote itself supports only the API-location clause: WebMCP's API is exposed at
  `navigator.modelContext`. It does not mention the flag recipe, the registration API
  shape, Chrome 146, or the 2026-02-11 date.
- The served body supports the rest: the "How to try it today" steps above are the local
  flag recipe, and the surrounding paragraph describes `registerTool` with name,
  description, JSON Schema, and handler. So the receipt's `note` ("navigator.modelContext
  surface and the 'Experimental Web Platform Features' flag steps") is true of the body.
- The committed excerpt does **not** carry the flag recipe; it is 600 characters each
  side of the quote and stops before that section. The excerpt alone therefore supports
  only the API-location clause. The body SHA-256 binds the full body, and independent
  re-fetch reproduces it, but a reader who treats the excerpt as self-contained evidence
  would not see the second half of the compound `scope` cell.
- Row `corpus/SOURCES.md:54` has `scope` = "WebMCP API surface and local flag recipe as of
  2026-02-11" and `teaches` = the rejection narrative starting "supersedes S039 —
  REJECTED: stale as current guidance…". The receipt note calls the `scope` cell "the row
  teaches"; the actual `teaches` cell is the rejection text. The quote supports the
  rejection's historical premise (the post did say this), not the full `teaches` cell by
  itself. The current spec supplies the "went stale" half (below).

The historical/current split is real and already recorded by the row:

- Current spec at `51ed75653aaa7f174f8dbe05d1bc327359bbc57c` (`index.bs`, 91001 bytes,
  SHA-256 `76fcc35aa651…59a004`) has **0** `navigator.modelContext` and **13**
  `document.modelContext`.
- Commit `c7b5c70` is full `c7b5c7023f6e6a1c7a2495946136eb19b3109ae6`, authored/committed
  `2026-05-27T15:04:31Z`, message ``Move the `modelContext` getter to `Document` (#184)``,
  parent `a816d2e91d762adb9f3a07e1d5ce81f462ccd45a`. The parent's `index.bs` (31178
  bytes, SHA-256 `06b502c66fef…f608aa`) contains `navigator.modelContext` at lines 217,
  218 and 221. So the row's anchor claim "spec commit c7b5c70 (2026-05-27) moved the
  getter to Document" is independently confirmed.

Consequently `teachesVerdict: held` (`S040.json:21`) is correct for the row's date-bounded
claim — the post's text still says what it said on 2026-02-11 — but it is **not** a
statement that the page is current product guidance. The page is stale as current
guidance exactly as the row's `rejected` status and `teaches` cell say.

## 5. Main claim: availability versus live product freshness

No claim-level confusion found, with one labeling boundary:

- C1's claim is explicitly receipt-shaped: `PLAN.md:15-21` says "Source rows re-verified
  against their live source with a committed recheck receipt: 0 → N (target 51 = every row
  not superseded at B)", not that the rows still describe current products.
- The lesson gate removes the ambiguity: `corpus/lessons/round-18.md:12-13` says C1 counts
  "round-specific integrity-checked recheck receipts, not overdue rows or current product
  support." The note repeats the limit at `source-recheck-round-18.md:140` ("Quote
  presence is not claim truth… It does not show that the row's `teaches` claim is
  correct, that the quote supports it…") and `:143` (a digest pins one response, not page
  identity).
- S040 is one of the 51 baseline rows and is accepted by the counter. `node
  .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` exited 0
  with `c1_rows_rechecked:51`, `held:50`, `own_work:1`, `rejected:[]`; S040 is not in the
  rejected list. (`held` is 50 rather than the note's 51 because the counter separates
  the own-work S029 receipt.) Full observed JSON:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

The finite counterexample to reading `held` as "current": `S040.json:21` says `held`,
while `corpus/SOURCES.md:54` says `rejected` and "went stale at c7b5c70", and the current
spec has 0 `navigator.modelContext`. This is a boundary of the `held` label, not a false
receipt: the row's `scope` cell and the receipt's note both carry "as of 2026-02-11", and
the C1 claim does not assert current support. If the scalar is promoted on the strength
of this count, S040 must not be cited as evidence of current freshness.

The `eligible_rows:58` at REV is a separate denominator-reporting issue already recorded
in `w2/ReRunC1.md`; it does not change S040's acceptance or the 51 fixed baseline rows.

## 6. Non-blocking observations (do not change the receipt count)

- **O1 — `quoteSource` is not the exact byte form at the cited line.** `S040.json:15`
  points to `corpus/lessons/round-16.md:49`; that line contains
  `"The API lives at navigator.modelContext."` (no backticks), while the receipt quote is
  ``The API lives at `navigator.modelContext`.`` (Markdown code span). The sentence is the
  same, and `quoteSource` is not a counter predicate (`measure-c1.mjs` validates quote,
  excerpt, URL, producer and date; it does not read `quoteSource`). In a scan of all 51
  receipts, 41 quoteSource lines contain the exact normalized quote, 4 are plain `new`,
  1 is `new (original ...)` (S042, wrapped comment lines), and 5 are non-exact
  (S017, S027, S040, S055, S056); S040 is one of the non-exact set. If exact provenance is wanted, annotate
  the field like S055 (`rendered form without the raw-backtick markup`) or cite the
  in-bytes form. This is a provenance-label issue, not a missing quote.
- **O2 — the recorded `command` is not copy-paste executable as printed.** `S040.json:7`
  renders the User-Agent argv without shell quoting:
  `-A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18`. Parsing that string
  with `bash -nc` exits 2: ``syntax error near unexpected token `('``. The producer's actual
  argv passes the UA as one argument (I reproduced it quoted), so the fetch is valid; the
  receipt's textual rendering is ambiguous. This is producer-wide, not S040-specific.
- **O3 — `anchorObserved` does not cover the spec-commit half of the row anchor.**
  `S040.json:20` records only the blog's dates/byline. The row's anchor also names spec
  commit c7b5c70; I verified it separately (§4). The receipt does not bind that half, but
  it does not claim to; no defect in the receipt, a scope limit of the one-URL recheck.
- **O4 — `held` on a rejected row.** The note documents this at
  `source-recheck-round-18.md:44` (rejected rows' receipts support rejection wording, not
  a product claim), `:128`, and `:140`. S040 is consistent with that documentation. No
  change is needed unless the freshness scalar is presented as current support.

## 7. S029 boundary (method instruction)

S029 is not this seat's assigned row and I made no network request for it. To honor the
own-work rule, I read the pinned blob with `git show`:
`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
→ 97073 bytes, SHA-256
`b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, which matches
`S029.json`'s `bytes`/`sha256`; the receipt's `httpStatus` is null. This is a boundary
check only, not a report on S029's content.

## 8. Limits

- Source-only: no browser, no Chrome/WebMCP runtime, no invocation. The receipt claims
  nothing about runtime, and neither does this report.
- Only S040 was re-fetched; no full `--live` sweep was run. The C1 counter was run once
  against REV; its `rejected:[]` is the acceptance evidence for S040.
- No producer write: only `recheck-fetch.mjs --normalize-only` was invoked; it writes
  nothing. No sandbox clone was needed; reads used `git show`/`git rev-parse` and the
  counter. The temp fetch directory is removed after capture; the command above
  reproduces the body and digest.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS040.md`
