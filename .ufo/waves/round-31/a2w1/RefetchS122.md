# RefetchS122 — independent refetch of S122 (C1, round 31 a2w1 falsify)

Seat: RefetchS122 (not `FetchS122`, who made the receipt). Milestone C1. Lane tip examined:
`486048356f0712e4396588c9dab58cd419243120`. Fetch window 2026-10-26T12:26Z–12:27Z.

## Verdict

**The two S122-citing rows survive an independent refetch: holds**, with two low-severity defects that are
about evidence robustness, not about the quotes. Two probes 2 s apart returned byte-identical 328088-byte
pages (raw sha256 `e4050f6b…`), and the counter's own normaliser turns my fresh bytes, my second fetch and
the committed receipt `corpus/evidence/round-31/decision-table/bytes/S122.html` into the **same 13477-byte
text, sha256 `a4290d78…`, byte for byte identical**. In those fresh normalised bytes both Located quotes of
the rows citing S122 are found exactly once, at distinct offsets — D12 (22 words) at 5960, D13 (8 words) at
5592 — and each carries the row's own number (`0`; `one second` = 1 s) inside the quote. The registry row's
anchor cell is accurate: all sixteen cited HTML line numbers land on the sentences they name in the
committed bytes, and fifteen of those sixteen lines are byte-identical in my fresh bytes. What is **not**
reproducible is the recorded raw digest: 63 of 328088 bytes differ, all three sites being the Next.js
deployment `buildId` (`xU-2nvoRQaQJjVgNhAf2O` now vs `fLcjPgBz_YHwhrus9wIPY` in the receipt), so the
anchor's and receipt's `sha256` cannot be re-derived by any future refetch even when the article text is
untouched. A second, narrower defect: D12's threshold cell reads `0 requests`, and the unit "requests" is
the author's gloss — the source states a bare header value `0`, no unit.

## What was attacked

1. Reproducibility of the S122 receipt by a seat that is not its `fetched_by`.
2. Parity of my normalisation with the frozen counter's, and normalised-digest equality with the committed bytes.
3. Per-row quote location in **my** fresh bytes for every row citing S122 in the entry at REV.
4. The registry row's anchor cell: do the cited line numbers point at the cited sentences in the committed bytes (and still in fresh bytes)?

## Commands and exit codes

```bash
# scratch clone (shared, read-only target)
git clone --shared …/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q 486048356f…  # exit 0; porcelain 0 lines
# the counter bytes I borrowed normalise() from, digest must equal claims.json frozenDigests
sha256sum clone/scripts/check-decision-table.mjs
#   d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832   == frozenDigests[C1]   exit 0
# probes 1 and 2 (identical flag set to the counter's curlFetch, 2 s apart)
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o f1.html -w '…' <url>   # exit 0
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o f2.html -w '…' <url>   # exit 0
sha256sum f1.html f2.html S122.html(receipt)   # exit 0 — e4050f6b… / e4050f6b… / b15c1c0b…
cmp -l f1.html f2.html                          # exit 0 (identical)
node -e '…normalise parity…'                    # exit 0 — three files -> one normalised digest
cmp -s fresh1.txt committed.txt                 # exit 0 (byte identical)
node -e '…indexOf the two quotes…'              # exit 0 — found=true, offsets 5960 / 5592, occurrences=1 each
git -C clone show <REV>:…/S122.html | sha256sum # exit 0 — b15c1c0b… == receipt sha256 (committed blob, not worktree)
git -C clone show <REV>:…/S122.json | sha256sum # exit 0 — 62a025c2… == worktree copy
node -e '…parseTable from counter…'             # exit 0 — headerLine 47, rows 13, sources S119,S121,S122
```

Network record (all read-only HTTPS GETs, no login/cookie/API):

| probe | UTC | URL | status | bytes | raw sha256 | effective URL |
|---|---|---|---|---|---|---|
| 1 | 2026-10-26T12:26:32Z | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 200 | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 | same as requested |
| 2 | 2026-10-26T12:26:34Z | same | 200 | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 | same as requested |
| 3 (headers) | 2026-10-26T12:27:32Z | same | 200 | header trace only (content-length 328088) | n/a | same as requested |

No redirect was followed on any probe (`%{url_effective}` == requested URL; the header trace shows a single
`HTTP/2 200`). Machine-readable form: `fetch-record.tsv` in this directory.

## Comparison

```
RAW
 fresh1 == fresh2                             yes (cmp exit 0)
 fresh raw sha256                             e4050f6b…8147b0   (328088 B)
 receipt raw sha256 (also g3's value)         b15c1c0b…dea33e   (328088 B)
 raw identical to receipt                     NO — 63 differing bytes of 328088 (0.019%)
 differing ranges (1-based)                   7956–7976, 8042–8062, 327858–327878 (21 B each)
 what differs                                 Next.js deployment buildId, at all three sites
   fresh     "xU-2nvoRQaQJjVgNhAf2O"  in /_next/static/<id>/_buildManifest.js,
                                      /_next/static/<id>/_ssgManifest.js, "buildId":…
   receipt   "fLcjPgBz_YHwhrus9wIPY"  same three sites
 (equal file length because the buildId is 22 chars in both deployments)

NORMALISED (counter's own normalise(): ENTITIES table + function body lifted verbatim from the frozen bytes)
 fresh1 norm sha256   a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2  (13477 B)
 fresh2 norm sha256   a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2  (13477 B)
 receipt norm sha256  a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2  (13477 B)
 fresh vs receipt     IDENTICAL byte for byte (cmp exit 0)
```

The three `buildId` sites all sit inside `<script>` (two `<script src>` tags and the
`<script id="__NEXT_DATA__">` block); `normalise()` drops script blocks and turns tags into a space, so the
rotating token never reaches the compared text. Freshness markers: `cache-control: public, max-age=60`,
`x-github-request-id`, `date`, **no `ETag`, no `Last-Modified`**, and no "last updated"/"revision" string in
the normalised text — so the entry's S122 recheck rationale ("no revision marker or dated revision in the
fetched bytes", entry:8) is borne out, and page identity can only be checked on normalised content.

## Per-row table — rows citing S122 in the entry at 4860483

Enumerated with the counter's own `parseTable()`: header line 47, 13 rows, source set `S119,S121,S122`
(S120 is prose-only, as the claim states). Two rows cite S122.

| row | entry line | signal (cell) | threshold (cell) | quote words | found in fresh norm | occurrences | offset | number in quote | unit in quote | force | scope |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D12 | 60 | `x-ratelimit-remaining` is `0` | `0 requests` | 22 | **yes** | 1 | 5960 | `0` yes | **no** — source gives bare `0` | "you should not make another request" → SHOULD, stated in cell | GitHub REST primary limit, §handle-rate-limit-errors-appropriately (HTML line 50) |
| D13 | 61 | `POST`/`PATCH`/`PUT`/`DELETE` series | `at least 1 second` | 8 | **yes** | 1 | 5592 | `one second` = 1 yes | `second` yes | imperative "wait at least one second" → directive, stated | mutative requests, §pause-between-mutative-requests (HTML line 45) |

Both quotes are distinct sentences from distinct sections; no quote repetition across the two S122 rows.
Offsets are 0-based UTF-16 indices into `S122-fresh1.norm.txt` (single collapsed line). D12's quote carries
the normalisation artefact `" 0 ,"` because `<code>0</code>` becomes ` 0 ` when tags are replaced by spaces;
it matches fresh and committed normalised text identically. Context as located in the fresh text:

```
… If the x-ratelimit-remaining header is 0 , you should not make another request until after the time
specified by the x-ratelimit-reset header. The x-ratelimit-reset header is in UTC …
… If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second
between each request. This will help you avoid secondary rate …
```

`(derived)` is correctly absent from both cells: neither decision restates a published plan figure, unlike
D7–D11, whose caps are the page's declared limits re-expressed as planning rules.

## Registry anchor cell (`corpus/SOURCES.md:136`) vs the committed bytes

Anchor text (cell 7) cites: article body opens at the end of HTML line 32 (§Avoid polling); x-poll-interval
36; §Avoid concurrent requests 42 (serial 43); §Pause between mutative requests 44 (one second 45);
§Handle rate limit errors appropriately 46 (retry-after 49, x-ratelimit-reset 50, otherwise one minute and
exponentially increasing waits 51); §Follow redirects 54 (301 permanent 57, 302/307 temporary 58);
§Use conditional requests 63 (304 not counted 64); fetched 2026-10-26T08:36:21Z, 328088 B, sha256 b15c1c0b….

| cited | cited token | on that line, committed | on that line, fresh | line byte-identical fresh/receipt |
|---|---|---|---|---|
| 32 | body opens; ends with `<h2 id="avoid-polling" …>Avoid polling…</h2>` (line is 220959 B) | yes | yes | differs only in the two buildId occurrences, same line index |
| 36 | `<code>x-poll-interval</code>` + "wait at least that many seconds" | yes | yes | yes |
| 42 | `h2 id="avoid-concurrent-requests"` | yes | yes | yes |
| 43 | "make requests serially instead of concurrently … queue system" | yes | yes | yes |
| 44 | `h2 id="pause-between-mutative-requests"` | yes | yes | yes |
| 45 | "wait at least one second between each request" | yes | yes | yes |
| 46 | `h2 id="handle-rate-limit-errors-appropriately"` | yes | yes | yes |
| 49 | `retry-after` … "until after that many seconds has elapsed" | yes | yes | yes |
| 50 | `x-ratelimit-remaining` … `0` … `x-ratelimit-reset`; "UTC epoch seconds" | yes | yes | yes |
| 51 | "at least one minute" + "exponentially increasing amount of time" | yes | yes | yes |
| 54 | `h2 id="follow-redirects"` | yes | yes | yes |
| 57 | "`301` … permanent redirection … update your code" | yes | yes | yes |
| 58 | "`302` or `307` … temporary redirection … should not update" | yes | yes | yes |
| 63 | `h2 id="use-conditional-requests"` | yes | yes | yes |
| 64 | "does not count against your primary rate limit if a `304` response is returned" | yes | yes | yes |

Verdict: **holds** — every cited number points at the cited sentence, and the numbering survives a refetch
(line indexes are stable because the buildId is fixed-length; a buildId of a different length would shift
every citation below line 32). The registry's recorded size (328088 B) and `fetched_at` (08:36:21Z) also
match a real 200 response of exactly this page.

## Findings

**F1 — holds. Quotes locate in independently fetched bytes.** D12 at 5960, D13 at 5592, one occurrence
each, in text byte-identical to the committed receipt. Severity: none.

**F2 — holds. Anchor cell line numbers are accurate.** 16/16 cited lines carry the cited sentence; 15/16
byte-identical in fresh bytes; line 32 identical except its two `buildId` script `src`s. Severity: none.

**F3 — defect, low: the recorded raw `sha256` is not reproducible, for the receipt and for the anchor cell.**
`corpus/evidence/round-31/decision-table/S122.json:8` and `corpus/SOURCES.md:136` (cell 7) both record
`b15c1c0b…`; a refetch of the same article text yields `e4050f6b…`. 63 bytes at three `buildId` sites.
Consequence: any future recheck that reads "same sha256 ⇒ unchanged" fails on every redeploy regardless of
content; and the normalisation channel is the only sound identity test for this vendor page. Does not affect
the counter (g3 compares the receipt digest to the committed bytes it shipped with; q2/l1-live compare
normalised text), and does not weaken the two quotes. Line evidence: `S122.json:8`, `SOURCES.md:136`,
`bytes/S122.html` byte offsets 7956–7976, 8042–8062, 327858–327878.

**F4 — defect, low: D12's threshold unit is the author's, not the quote's.**
`corpus/knowledge/rate-signal-decision-table.md:60` threshold cell `0 requests`; the located quote says "If
the x-ratelimit-remaining header is 0 , you should not make another request …" — a bare header value, no
unit. The number (`0`) and the bound (exact value) are the source's; "requests" is a gloss of what the header
counts. The counter's `n1-threshold-sourced` checks only the number, so the row is admitted; under the
L1's own row-reading criterion ("the source's own number with the unit and bound the quote states") the unit
fails while number and bound pass. Severity low: it changes no decision (stop until `x-ratelimit-reset`).

**F5 — info.** D13's quote begins mid-sentence ("wait at least one second …"), a legitimate substring; the
known repetition hole is not exercised here — the two S122 rows use two different sentences from two
different sections.

**F6 — info.** The prose passages attributed to S122 in the entry are accurate against the fresh bytes:
:105 serial-not-concurrent with a queue (HTML line 43), :107 one-second pause (45), :113 301 replaces /
302,307 keeps the stored URL (57–58). No S120 decision row exists, consistent with the claim's "prose only".

## Scope and limits of this report

- Read-only: no lane file, index or jj state touched; all work in `$HYAKU_SCRATCH/tabi-r31/RefetchS122`
  and this output directory; the lane checkout was never used to run a script.
- Three HTTPS GETs of one public docs page; no login, cookie, API call or consequential action.
- I did **not** run `check-decision-table.mjs` (with or without `--live`): population/admitted is the L1's
  reading and the counter seats' subject, not this seat's. My normalisation borrowed that file's function
  verbatim and I verified its digest equals the frozen value before trusting it.
- No tool was installed or upgraded.
- Receipts in this directory: `S122-fresh1.html`, `S122-fresh2.html`, `S122-fresh1.norm.txt`,
  `headers-probe.txt`, `fetch-record.tsv`, `rows-S122.tsv`, `anchor-S122.tsv`, `compare.txt`,
  `normalise-parity.cjs`.
