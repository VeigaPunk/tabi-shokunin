VERDICT: PASS

# LiveS005 — falsification attack on C1 receipt S005

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; lane tip
`git rev-parse refs/heads/master` = `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
(committed 2026-10-20T16:58:00-03:00). Working-tree `S005.json`, `S005.excerpt.txt`,
`SOURCES.md` and `knowledge/source-recheck-round-18.md` have no diff vs REV
(`git diff --quiet 530f40a9… -- <path>` for each). All probes used private
`/tmp/tabi-r18-liveS005-zXFv`; no LANE, git, or jj writes.

## 1. Live re-fetch of receipt.url

Command (same flags as the receipt, plus `-w` fields for observation):

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-liveS005-zXFv/body \
  -w 'http=%{http_code} effective=%{url_effective} size=%{size_download}\n' \
  'https://www.w3.org/TR/webdriver-bidi/'
```

Observed: `http=200 effective=https://www.w3.org/TR/webdriver-bidi/ size=396118`,
exit 0, stderr empty. `size_download` is the compressed transfer (`content-encoding: br`);
the written body is 4,235,856 bytes, sha256

```
dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4
```

Receipt lines 8–10 record `httpStatus` 200, `bytes` 4235856 and the same full
digest. Exact match, not just prefix. This digest is also the one recorded for
the same URL on 2026-10-19 in `corpus/lessons/kaika-fleet-round-1.md:48`.

## 2. Decode and quote location (`decode: html-text`)

Committed normalizer probe (writes nothing):

```
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
  --body /tmp/tabi-r18-liveS005-zXFv/body \
  --quote 'This document defines the BiDirectional WebDriver Protocol, a mechanism for remote control of user agents.'
```

Exit 0, observed:
`{"found":true,"offset":876,"normalizedLength":655033,"window":"… Abstract This document defines … Status of this document …"}`.
The raw body contains the 15-word quote exactly once, inside the Abstract.
Receipt line 16 `quoteFound: true`, line 17 `quoteOffset: 876`. Match.

## 3. Excerpt binding

Producer rule `.ufo/waves/round-18/recheck-fetch.mjs:107` is
`text.slice(max(0, at-600), at + q.length + 600)` plus a trailing newline
(receipt assembly `:110-135`). Recomputing that slice from the fetched body with an
independent Node replica of the producer's decode/normalize gave offset 876,
normalized quote length 106, 1307 bytes including newline, sha256
`cef8ebf01371adc7e04311d24730b84373895e15017f121fd36a43f4bb8e3435`,
byte-identical to the committed `S005.excerpt.txt` (1307 B). Receipt line 19 records
the same digest; `normalize(excerpt)` contains `normalize(quote)`
(`corpus/evidence/round-18/source-recheck/S005.excerpt.txt:1`).

## 4. Source identity, anchor, teaches

**Identity — HELD.** Effective URL is the row URL; the body is
`<link rel="canonical" href="https://www.w3.org/TR/webdriver-bidi/">`, `<title>WebDriver BiDi</title>`.
The REV row (`corpus/SOURCES.md:19`) source cell contains
`https://www.w3.org/TR/webdriver-bidi/` verbatim. No redirect, no challenge page.

**Anchor — HELD.** In the fetched body:

- `<time class="dt-updated" datetime="2026-10-08">8 October 2026`, header text
  `W3C Working Draft , 8 October 2026`.
- `<meta content="f922e6af669ead51496db85f37813f39438ef171" name="revision">`.
- `<meta content="WD" name="w3c-status">`.
- `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` fetched: HTTP 200,
  4,235,856 bytes, sha256 `dc1077db…24d4`; `cmp -s` against the shortname body exits 0 —
  byte-identical, as `anchorObserved` (receipt line 20) says.
- Headings: ten module sections `7.1` session … `7.10` webExtension; `3.4. Commands`,
  `3.6. Events`. Nine modules carry a Commands subsection (7.1.3, 7.2.4, 7.3.3, 7.4.2,
  7.5.5, 7.6.4, 7.7.3, 7.9.3, 7.10.3; the log module defines Events only), and five
  carry Events (7.3.4, 7.5.6, 7.6.5, 7.8.3, 7.9.4). The `7.1-7.10` claim is accurate.
- W3C history page `https://www.w3.org/standards/history/webdriver-bidi/`: HTTP 200,
  50,032 B, 126 WD links, latest `…-20261008`, no CR links. The anchored WD is the
  latest published WD at fetch time.
- Response headers: `HTTP/2 200`, `date: Tue, 20 Oct 2026 20:05:21 GMT`,
  `last-modified: Thu, 08 Oct 2026 07:00:10 GMT`, `cache-control: public, max-age=86400,
  s-maxage=2592001`, `age: 24350`, `content-encoding: br`.

**Teaches — HELD at document level; the quote covers only half.** The quoted
Abstract sentence supports the document identity and the “protocol text rather than
implementation coverage” half of the `teaches` cell (`corpus/SOURCES.md:19`): it says the
document defines the protocol as a mechanism for remote control of user agents. It does
**not** itself mention commands or events; that half is supported by §§3.4, 3.6 and the
module subsections above. The used-by file `corpus/knowledge/webdriver-bidi-capability-matrix.md`
cites 34 `#id` anchors and 11 section numbers; all 34 ids and all 11 section numbers
exist in the fetched body, and its negative claim holds (`insertText` occurs nowhere in
the body). Spot-checks: §7.4.2.12 = `emulation.setTextLayoutModeOverride`;
§7.5.4.17 = `network.ResponseData` with CDDL fields `bytesReceived`, `headersSize`,
`bodySize`; §7.5.4.6 = `network.CollectorType`; §7.5.5.1 =
`network.addDataCollector`; §7.7.3.1 = `storage.getCookies`. `teachesVerdict: held`
(receipt line 21) is therefore accurate for the row, but the recorded quote alone would
not carry it; `anchorObserved` (line 20) and `note` (line 22) supply the section/date
basis.

## 5. Immutable availability vs live product freshness

Observed, not inferred:

- The body is static: `last-modified` 2026-10-08, and the 2026-10-20 digest equals the
  digest recorded for the same URL on 2026-10-19 (`kaika-fleet-round-1.md:48`). The
  recheck re-served an unchanged artifact.
- The quote is draft-invariant. The previous WD
  `https://www.w3.org/TR/2026/WD-webdriver-bidi-20260930/` fetched: HTTP 200, 4,234,285 B,
  sha256 `8a19cd4ebfd8847e9ad72affea56ca4badf9ff72f0e79b56f0e7f7030f115a14`; the
  committed normalizer finds the identical quote at offset 879
  (`normalizedLength` 654837, vs 876/655033 for the current draft), and the abstract
  text is identical. `quoteFound` therefore cannot distinguish the anchored WD
  20261008 from its predecessor.
- The only date/revision evidence is `anchorObserved` free text (receipt line 20).
  `measure-c1.mjs:315-377` never reads `anchorObserved`; the `--live` path re-fetches the
  row URL and tests only quote presence (`measure-c1.mjs:428-431`), which the older
  draft also satisfies. Finite counterexample: a receipt built from the 20260930 body
  with the same quote would pass every mechanical check and `--live`, even if its
  `anchorObserved` named 20261008.
- The committed note states this limit rather than confusing the two:
  `corpus/knowledge/source-recheck-round-18.md:140` — quote presence “does not show
  … that the quote supports [the teaches claim] … or that the page is the one the
  anchor names”; `:141` — receipts “say nothing about how any product behaves, and the
  51 rows are not a statement of current live product support.”
- For S005 the anchor is independently current (latest WD 20261008), so no drift and no
  superseding row is needed.

Conclusion: S005’s receipt is a valid availability/identity/anchor re-open, not a
product-freshness observation. C1’s 51-receipt count is evidence of reachability, quote
presence and receipt integrity; it is not evidence that a cited draft is the latest.
That limit is explicit in the committed note, so the committed claim is not falsified;
for spec rows “freshness” should be read as re-open/availability, not draft currency.

## 6. Receipt vs the C1 contract and the counter

All contract elements observed:

- `schema` `tabi-source-recheck-v1` (receipt line 2); `row` S005 present at
  `corpus/SOURCES.md:19` at REV, not in the superseded set.
- `rowUrl` occurs verbatim in the row’s source cell.
- `sha256` is 64-hex (line 10); `quoteWords` 15 equals the whitespace count and is ≤25
  (line 14).
- `normalize(quote)` occurs in `normalize(excerpt)`; `excerptSha256` equals the file
  bytes (line 19).
- `quoteFound` true (16); `fetchedAt` `2026-10-20T19:07:46.122Z` (6) on the required
  day; `teachesVerdict` `held` (21); `httpStatus` 200 (8).
- `producerSha256` (line 24) `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
  equals `git show REV:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum`.
- `quoteSource` `corpus/lessons/kaika-fleet-round-1.md:48` is the S005 row at REV, with
  the same `dc1077db…` digest record.

Counter (committed-input, read-only):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Exit 0: `c1_rows_rechecked` 51, `eligible_rows` 58, `held` 50, `drift_superseded` 0,
`own_work` 1, `rejected` `[]`; no rejection for S005. Boundary: `eligible_rows` is 58
because S058–S064 exist at REV (7 new rows with no receipts by design); the plan’s
target 51 is the baseline-B non-superseded set, which the 51 receipts match.

## 7. Finite limits

- I did not run `measure-c1 --live` over all 51; S005’s URL was re-fetched manually with
  the same flags and matched exactly.
- I did not run the producer’s receipt-writing path; only its `--normalize-only` probe
  on the `/tmp` body (writes nothing).
- No other receipt, knowledge entry, or C2/C3 artifact was attacked here. S029 is not
  this seat’s receipt; the counter read its pinned blob successfully (`own_work` 1).
- The 20260930 comparison is one predecessor draft: sufficient as a finite
  counterexample of quote draft-invariance, not a survey of all drafts.
- No production/lane writes, no git/jj write, no browser, no model parameter, no `ask`.
  No tools installed. Probe writes were confined to `/tmp/tabi-r18-liveS005-zXFv`.

Files written:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS005.md`
