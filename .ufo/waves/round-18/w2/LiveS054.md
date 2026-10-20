VERDICT: ISSUES

# LiveS054 — C1 receipt S054, independent re-open

Receipt under test: `corpus/evidence/round-18/source-recheck/S054.json` (row S054,
`https://developer.chrome.com/docs/ai/webmcp/imperative-api`).
Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured candidate REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`refs/heads/master` = REV, verified
2026-10-20). Read-only: no lane edits, no git writes, no `jj`; all network output to
private `/tmp/tabi-r18-liveS054-3092`, removed after the run. No tool installs.

Summary: the receipt passes every C1 counter rule and is independently reproducible
from a fresh live fetch (excerpt reproduced byte-for-byte, normalized quote offset
identical). Source identity, anchor and teaches all held; no drift, no unreachable.
Three low-severity documentary defects exist in the C1 narrative and the S054 registry
cell — none changes the C1 count.

## 1. Receipt contract checks

All against REV via `git show` and the committed counter.

| Rule | Observed | Result |
|---|---|---|
| schema `tabi-source-recheck-v1` | `S054.json:2` | pass |
| row present at REV, not in superseded set | `corpus/SOURCES.md:68` at REV; superseded = S004/S039/S047/S049/S050/S053 | pass |
| `rowUrl` verbatim in row `source` cell | `S054.json:5` == URL at `corpus/SOURCES.md:68` | pass |
| `sha256` 64-hex | `S054.json:10` = `eebe1d1a07960397dc3a8ab1888f54d1e27d1c285e9a5ccdaa61d07c9e6e4d9d` | pass |
| `quoteWords` <= 25 and = word count | `S054.json:14` = 17; quote at `:13` counts 17 words | pass |
| `normalize(quote)` in `normalize(excerpt)` | index 600 of excerpt; `S054.json:16` true | pass |
| `excerptSha256` = excerpt bytes | `9f8dc9330d78c3407047ed1ab1cc7c188ef2cf0e6762d2554d25cc6de8c9eef2`, 1307 B (`S054.json:19`) | pass |
| `quoteFound` true | `S054.json:16` | pass |
| `fetchedAt` on 2026-10-20 | `S054.json:6` = `2026-10-20T19:05:53.660Z` | pass |
| `teachesVerdict` held | `S054.json:21`; body check in §3 | pass |
| `httpStatus` 200 | `S054.json:8`; my fetches both 200 | pass |
| `producerSha256` = producer blob at REV | `S054.json:24` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` = `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` | pass |
| one receipt per row | 51 `.json` + 51 `.excerpt.txt` at REV; no duplicate S054 | pass |

Counter, run read-only (exit 0):

```
$ node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
 "status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

`eligible_rows: 58` at REV is the 64 registry rows minus 6 superseded; the 7 rows
S058–S064 opened this round have no receipt (see F3). C1's declared target is
"every row not superseded at B" = 51, so the count is unaffected.

## 2. Independent live re-open

Exact fetch, run 2026-10-20T20:02:18Z from `/tmp/tabi-r18-liveS054-3092`:

```
$ curl -sSL --compressed --max-time 90 \
    -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
    -o body -w 'HTTP=%{http_code} size=%{size_download} url=%{url_effective}\n' \
    'https://developer.chrome.com/docs/ai/webmcp/imperative-api'
HTTP=200 size=28669 url=https://developer.chrome.com/docs/ai/webmcp/imperative-api
exit=0
$ sha256sum body; wc -c < body
df5fc9dff4d54fa1bcde65f817701e941cfe8ce95dcbadbc7d645126fdf01836  body
189556
```

Second fetch, same argv, five minutes later: `HTTP=200 size=28681`, body 189556 B,
`sha256 = d3f0f19f5c4cc1585b3e0ac85a78d5add686f921976df30c6b27b5824fbfcf79`.
`size_download` is the compressed transfer; the 189556 B body is the decompressed
size, equal to receipt `bytes` (`S054.json:9`). The receipt digest `eebe1d1a…`
matches neither fetch — expected for this living page; content was compared by
normalized text as the row directs.

Normalizer probe with the producer's exact exported functions (producer copied to
`/tmp`, sha256 `f2ba0033…` = REV blob; `--normalize-only` writes nothing):

```
$ node probe.mjs --normalize-only --decode html-text --body body \
    --quote 'This asynchronous method returns the result of the tool execution, or null when a navigation is triggered.'
{"found":true,"offset":11615,"normalizedLength":16089,
 "window":"ecute tool To manually execute a tool discovered in getTools() , call document.modelContext.executeTool() ... This asynchronous method returns the result of the tool execution, or null when a navigation is triggered. const result = await ..."}
exit=0
```

`offset=11615` equals `S054.json:17` (`quoteOffset`); one occurrence in 16089
normalized characters. The committed excerpt is byte-identical to the 600/600
window around that offset in my independently fetched body:

```
excerpt_bytes=1307 window_bytes=1307 exact_equal=true quote_in_excerpt=true
excerpt_quote_index=600
```

This is the strongest check in this report: the excerpt was not merely
self-hash-consistent, it is reproducible from a different response.

Identity and anchor:

- `<title>` = `Imperative API &nbsp;|&nbsp; AI in Chrome &nbsp;|&nbsp; Chrome for Developers`;
  `<link rel="canonical">` = the same URL; `<h1>` = `Imperative API`;
  `<h2>Execute tool</h2>` and `id="execute_tool"` present. Not a challenge page.
- Raw `Published: May 18, 2026, Last updated: October 16, 2026`; footer/meta
  `Last updated 2026-10-16 UTC` — matches `anchorObserved` (`S054.json:20`).
- Raw quote: `This asynchronous method` at byte 158558; the paragraph starts at
  158294 and closes at 158664 (`triggered.</p>`). The quote spans a raw newline
  (`method\nreturns`), so a raw substring search fails; the shared normalizer
  collapses it, which is why `quoteFound` is a normalized-text result, not a
  byte-offset result.
- The anchor's `(byte 158695)` is the first code block's opening markup
  (`devsite-code><pre class=` starts at 158693); it marks the paragraph/code-block
  boundary. `(byte 162526)` is exactly the first byte of
  `JSON stringified input arguments are deprecated from Chrome 155.`; the Note
  follows the second code block as stated.
- Raw and normalized `154` occurrences: 0. `Chrome 155` occurrences: 1 (the Note).
  `deprecated`: 1. No contradicting JSON-input statement (the other JSON mention is
  `serializable to a JSON string` in the same paragraph).

## 3. Does the quote support `teaches`, and is freshness conflated?

`teaches` at `corpus/SOURCES.md:68` has three parts:

1. "executeTool returns the tool result or null when a navigation triggers" —
   verbatim supported by the quoted sentence. **Held.**
2. "JSON-string inputs are deprecated from Chrome 155" — not in the quoted
   sentence; supported by the page Note at raw 162526, which the receipt's `note`
   (`S054.json:22`) records verbatim. The C1 contract requires quote presence, not
   quote coverage of every `teaches` clause; the receipt's free-text note covers the
   gap honestly. **Held.**
3. "the page says nothing about 154" — 0 `154` occurrences in raw and normalized
   text. **Held.**

No conflation of immutable availability with live product freshness is present in
the committed wording:

- The counter classes this URL `living_live` (46 such rows at REV), and the C1 claim
  is about re-verifying a row against its live source — which this fetch does
  (HTTP 200, content present).
- `corpus/knowledge/source-recheck-round-18.md:143` explicitly disclaims product
  behavior ("They say nothing about how any product behaves, and the 51 rows are not
  a statement of current live product support").
- `corpus/knowledge/webmcp-invocation-round-17.md:86` uses S054 only for the
  Chrome-155 deprecation scope and states the 154 string requirement is separate
  round-16 probe evidence, "not S047 text". That is the correct separation.

Residual limit, not a defect: the receipt can establish that the page said this on
2026-10-20; it cannot establish that Chrome 155 shipped, or that the documented
behavior applied to the 154 build. The row itself says a 154 requirement needs its
own evidence, so the limit is disclosed rather than crossed.

## 4. Findings (all documentary; none affects the C1 count)

**F1 — LOW — "CSP nonce" is not the cause of the per-response digest change.**
`corpus/SOURCES.md:68` ("raw-body sha256 differs per response (CSP nonce)"),
`corpus/knowledge/source-recheck-round-18.md:134` and `:143` ("because of a CSP
nonce"). Finite counterexample: two same-argv fetches, both 189556 B, differ in
3203 byte positions across 185 runs (`cmp -l body body2 | wc -l` = 3203; first
difference 183030, last 188199). The nonce run is 29 B at 183029–183057
(`lz03yULRSZzbRNqP1qZ48ZclliHg7` vs `YiMsi+p21y0fVXXDDdK+e9TRR1f8L`); the other
~3174 B are a per-response devsite bootstrap experiment-flag array inside the same
`<script>` (e.g. 184829–184847 `ud__enable_cloud_sh…` vs `files__enable_compl…`;
184876–184916 `…MiscFeatureFlags__enable_firebase_utm…` vs
`…DevPro__remove_eu_tax_intake…`). Everything before 183029 and after 188199 is
byte-identical, so the article, quote and both anchor bytes are stable; only the
causal wording is wrong. Repair: say "CSP nonce plus a per-response devsite
bootstrap experiment array".

**F2 — LOW — the receipt does not check "stable byte offsets".**
`corpus/knowledge/source-recheck-round-18.md:143` says "the receipt checks content
by the quote and the stable byte offsets the row names"; `:134` says S054 "checks
content by stable byte offsets". The producer records only a normalized-text
`quoteOffset` (`S054.json:17` = 11615) and the counter checks only
`normalize(quote) in normalize(excerpt)` plus the excerpt hash; neither reads
158695 or 162526, and `anchorObserved` is free text. My own check found the offsets
correct (162526 exact; 158695 at the first code block's `<pre`), so this is an
overstatement of method, not a false anchor. Repair: "checks content by the
normalized quote; the registry's byte offsets are an ad-hoc anchor and are not
machine-checked."

**F3 — LOW — stale registry row count at the note's own revision.**
`corpus/knowledge/source-recheck-round-18.md:11` says "`corpus/SOURCES.md` has 57
rows (S001–S057)". At REV the file has 64 rows (S001–S064; S058–S064 present), and
the C1 counter at REV reports `eligible_rows: 58` vs `c1_rows_rechecked: 51`
because the 7 new rows have no receipts. Finite check:
`git show REV:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3,} '` = 64. The note is
B-scoped but unqualified; repair: "at baseline B, 57 rows … 51 not superseded",
and state that the 7 rows opened this round are outside the 51 target. The
histograms at `:52-53` (mined 40/queued 6/rejected 5; A42/B4/C5) are correct for
the 51 receipts (recomputed from the 51 committed JSONs).

## 5. S029 own-work spot check (as directed: git show, no network)

`corpus/evidence/round-18/source-recheck/S029.json` was checked without fetching:

```
$ git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
$ … | wc -c
97073
```

Matches `S029.json` `sha256` and `bytes`; quote found at normalized offset 74695 =
`quoteOffset`; `excerptSha256` matches the committed excerpt; the blob at lane tip
`2bff864…` has the same digest, so `anchorObserved`'s "byte-identical at lane tip"
holds. The quoted string is a JSON fragment from the own-work receipt itself, so
this is registry hygiene, not live freshness — as the C1 note says.

## 6. Limits

- Two fetches only (20:02Z, 20:07Z on 2026-10-20); this is a point-in-time check,
  not continuous availability. The page may change after this report.
- Dynamic-page comparison is normalized-text only; raw-byte equality is
  intentionally not required and was not obtained.
- The counter's `--live` mode was not run across all 50 HTTP rows (network scope);
  the single-row live check above is the manual equivalent for S054.
- The alternative rendering/raw endpoint fallback was not needed: the quote was
  found on the primary URL, so no substitute evidence was introduced.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS054.md
- /tmp/tabi-r18-liveS054-3092 (temporary fetch sandbox; removed after the run)

Report: .ufo/waves/round-18/w2/LiveS054.md
