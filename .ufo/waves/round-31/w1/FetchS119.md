# FetchS119 — C1 build, receipt for S119 (RFC 9309, robots.txt)

**Verdict.** S119 is captured cleanly and is reusable by the decision table. Two HTTPS GETs of
`https://www.rfc-editor.org/rfc/rfc9309.txt`, 63 s apart, both returned HTTP 200 on the same host
(`www.rfc-editor.org`, no redirect hop) with byte-identical bodies: 25,265 bytes, sha256
`f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`; the two bodies also normalise
(the frozen counter's `normalise()`, reimplemented in `normalise-reimpl.mjs`) to the identical
sha256 `473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5`, 20,886 characters.
RFC 9309 carries exactly **eight** numeric rate/crawl statements (three on the five-redirect floor,
two status-code ranges, a 30-day undefined window, a 24-hour cache lifetime and a 500 KiB parse
floor) and **no** `crawl-delay` / request-rate vocabulary at all (`grep -niE 'crawl-delay|request-rate|delay'`
exits 1), so this source cannot feed the `wait`/`backoff`/rate rows of the table — those must come
from S120/S121/S122. Five of the eight statements pass the frozen counter's row predicates as
verbatim spans (`S119-recommended-rows.json`, 5/5 PASS); the two status-range statements cannot,
because `UNIT_RE` needs a digit **with a count/time/size unit**, and a status range is neither —
an author-chosen unit such as “500 attempts” would pass the mechanical predicate while being the
author's own threshold, which is exactly what `n1-threshold-sourced` is meant to block.

No lane file was written or edited. Nothing here is a claim measurement; the L1 still owns the
entry, the registry row and the `--live` counter run.

## Evidence — fetches

```
$ S=/fast/scratch/hyaku/tabi-r31/FetchS119; curl -q -sS --proto =https --proto-redir =https \
    -L --max-redirs 5 -D f1.hdrs -o f1.txt \
    -w '%{http_code} %{url_effective} %{size_download}' https://www.rfc-editor.org/rfc/rfc9309.txt
200 https://www.rfc-editor.org/rfc/rfc9309.txt 25265      # exit 0, 2026-10-26T08:36:13Z
$ ... same command, -o f2.txt ...
200 https://www.rfc-editor.org/rfc/rfc9309.txt 25265      # exit 0, 2026-10-26T08:37:16Z
$ sha256sum f1.txt f2.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  f1.txt
f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207  f2.txt
$ node norm.mjs f1.txt ; node norm.mjs f2.txt
473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5 20886
473fd7d6e946037b43ba27b88ba25796d645057507eb80b81f332785e1c004e5 20886   # exit 0 both
$ cmp -s bytes/S119.txt f1.txt   # receipt bytes == first body, unmodified
$ echo $?
0
```

| fetch | UTC | status | bytes | sha256 (raw) | sha256 (normalised) | effective URL |
|---|---|---|---|---|---|---|
| 1 | 2026-10-26T08:36:13Z | 200 | 25265 | f633915d…fb207 | 473fd7d6…c004e5 | https://www.rfc-editor.org/rfc/rfc9309.txt |
| 2 | 2026-10-26T08:37:16Z | 200 | 25265 | f633915d…fb207 | 473fd7d6…c004e5 | https://www.rfc-editor.org/rfc/rfc9309.txt |

Gap between the two GETs: 63 s (≥ 60 s). **The two normalised texts are identical** (same sha256,
same 20,886-character length). Machine-readable: `S119-fetches.tsv`.

Response headers (`S119-fetch1.hdrs`, `S119-fetch2.hdrs`): `HTTP/2 200`,
`content-type: text/plain;charset=utf-8`, `etag: W/"25cf63a95f77e90b5d9b4e9f878e9951"` (identical
across both fetches), `link: <https://www.rfc-editor.org/info/rfc9309/>; rel="canonical"`,
`cache-control: public, max-age=86400`, `server: cloudflare`. The server also set an unrelated
Cloudflare bot-management cookie (`__cf_bm`); it was never stored, sent back or recorded here
(the `-D` capture is the only trace, and it contains the header line as received).

Note for the counter's `g3-bytes`: the body starts with a UTF-8 BOM (`ef bb bf`), preserved
verbatim. Copy `bytes/S119.txt` byte-for-byte to `corpus/evidence/round-31/decision-table/bytes/S119.txt`;
the receipt sha256 above is of these raw bytes and any BOM strip will fail `g3-bytes`. The BOM does
not affect quote location — JS `\s` includes U+FEFF, so `normalise()` drops it.

`S119.json` (as requested, keys exactly as assigned):

```json
{"id":"S119","url":"https://www.rfc-editor.org/rfc/rfc9309.txt","fetched_at":"2026-10-26T08:36:13Z",
 "fetched_by":"FetchS119","http_status":200,
 "bytes_path":"corpus/evidence/round-31/decision-table/bytes/S119.txt",
 "sha256":"f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207"}
```

## Evidence — every numeric rate/crawl statement on the page, verbatim

Line numbers are in `bytes/S119.txt`; each quote was verified as a substring of
`normalise(bytes)` by `quote-presence-check.mjs` (9/9 PRESENT, exit 0, log `S119-quote-presence.txt`).

1. **§2.3.1.2 Redirects** (line 377) — redirect floor, count 5:
   “The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP).”
2. **§2.3.1.2 Redirects** (line 380) — redirect floor, count 5:
   “If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched, parsed, and its rules followed in the context of the initial authority.”
3. **§2.3.1.2 Redirects** (line 384) — redirect bound, count 5:
   “If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable.”
4. **§2.3.1.3 “Unavailable” Status** (line 392) — status range 400-499:
   “For example, in the context of HTTP, such status codes are in the 400-499 range.”
5. **§2.3.1.4 “Unreachable” Status** (line 403) — status range 500-599:
   “For example, in the context of HTTP, server errors are identified by status codes in the 500-599 range.”
6. **§2.3.1.4 “Unreachable” Status** (line 405) — undefined window, 30 days:
   “If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume that the robots.txt file is unavailable as defined in Section 2.3.1.3 or continue to use a cached copy.”
7. **§2.4 Caching** (line 419) — cache lifetime, 24 hours:
   “Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable.”
8. **§2.5 Limits** (line 425) — parsing size floor, 500 KiB:
   “The parsing limit MUST be at least 500 kibibytes [KiB].”

Adjacent sentences that carry **no number of their own** and would not satisfy
`n1-threshold-sourced` on their own (listed so no row is built on them by mistake):

- **§2.3.1.2** (line 376): “It's possible that a server responds to a robots.txt fetch request with a redirect, such as HTTP 301 or HTTP 302 in the case of HTTP.” — status identifiers, not a bound.
- **§2.3.1.3** (lines 395-396): “If a server status code indicates that the robots.txt file is unavailable to the crawler, then the crawler MAY access any resources on the server.” — the action for the 400-499 range; no number.
- **§2.3.1.4** (lines 400-403, first sentence): “If the robots.txt file is unreachable due to server or network errors, this means the robots.txt file is undefined and the crawler MUST assume complete disallow.” — the 5xx action; the numbers arrive in the following sentence.
- **§2.5** (line 424): “Crawlers SHOULD impose a parsing limit to protect their systems; see Section 3.” — the SHOULD behind the 500 KiB floor.
- **§3 Security Considerations** (lines 441-443): “Section 2.5 defines the lower limit of bytes that must be processed, which inherently also protects the parser from out-of-memory scenarios.” — restates 2.5, adds no number.

Negative finding, deliberately checked: `grep -niE 'crawl-delay|request-rate|delay' bytes/S119.txt`
exits **1** (no match). RFC 9309 defines redirect, status, cache and parse-size discipline only;
there is no per-request rate, no crawl delay, no `Retry-After` and no concurrency rule in it.

## Rows this receipt can support

Counters' predicates were mirrored from the frozen `scripts/check-decision-table.mjs` constants
(`HEADER`, `DECISIONS`, `UNIT_RE`, `NUMBER_WORDS`) into `row-precheck.mjs`, run over
`bytes/S119.txt`; log `S119-row-precheck.txt`, all runs exit 0.

`S119-recommended-rows.json` (5 rows, **5/5 PASS**, `node row-precheck.mjs bytes/S119.txt S119-recommended-rows.json`):

| Row | Signal | Decision | Threshold | Quote words | Section |
|---|---|---|---|---|---|
| D1 | `robots.txt` fetch answered by a redirect chain | follow | at least 5 redirects | 20 | §2.3.1.2 |
| D2 | `robots.txt` still redirecting past the floor | stop | more than 5 redirects | 17 | §2.3.1.2 |
| D3 | `robots.txt` cached copy age | refetch | 24 hours | 18 | §2.4 |
| D4 | `robots.txt` unreachable duration | cache | 30 days | 25 | §2.3.1.4 |
| D5 | `robots.txt` response body size | cap | at least 500 KiB | 10 | §2.5 |

The D4 span is the longest `q1`-legal (≤25-word) verbatim span that still carries “30 days”; the
whole sentence is 33 words and the 26-word variant fails `q1-quote-length` (recorded in
`S119-row-precheck.txt`). A sixth candidate, the line-380 sentence (“…MUST be fetched, parsed, and
its rules followed”), is 21 words and passes, but it repeats D1's “five” threshold — **do not
double-count it towards the ≥10 admitted rows**; one redirect-flavour row pair (D1 follow / D2 stop)
is the honest count for a single bound.

**Two traps I verified rather than assumed.** (a) The status-range statements 4 and 5 cannot become
threshold cells: `UNIT_RE` requires `number + (s|sec|min|h|hours|days|KiB|MiB|bytes|requests|
redirects|points|attempts|retries|concurrent)`, and “400-499” has no such unit. (b) If you slot a
unit by hand — “500 attempts”, “400 requests” — the row **passes** `t4-threshold` and
`n1-threshold-sourced` (the number 500/400 does occur in the quote) while the threshold is the
author's, not the source's. `/tmp`-grade rows D6/D7 in `rows-pass1.json` show exactly that PASS
result; they are evidence of the gap, not recommendations. The source states a status *range* and a
*disposition*, so any row built on 4xx/5xx here needs a different, sourced unit — take it from
another registry row, not from this page.

Two other mechanical requirements from the frozen counter that this receipt interacts with:

- `g2-url` requires the SOURCES row's source cell to **contain** `rc.url` verbatim, i.e. the string
  `https://www.rfc-editor.org/rfc/rfc9309.txt` — no trailing slash, no `<…>` angle brackets around
  it, no `info/` form.
- `r2-status`/`r3-used-by` require the S119 registry row to be `mined` and its used-by cell to name
  `corpus/knowledge/rate-signal-decision-table.md`.

## Files written

Output dir `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/FetchS119/`:

- `bytes/S119.txt` — 25,265 bytes, sha256 `f633915d…fb207` (first body, unmodified; copy byte-for-byte)
- `S119.json` — receipt, keys exactly as assigned
- `S119-fetches.tsv` — both fetches: UTC, status, bytes, raw sha256, normalised sha256, normalised
  length, effective URL, host, plus `normalised_identical yes` / `bytes_identical yes`
- `S119-fetch1.hdrs`, `S119-fetch2.hdrs` — response headers as received
- `normalise-reimpl.mjs` — the 6-line-function reimplementation and its sha256 driver
- `quote-presence-check.mjs`, `S119-quote-candidates.json`, `S119-quote-presence.txt` — 9/9 PRESENT, exit 0
- `row-precheck.mjs`, `rows-pass1.json`, `rows-pass2.json`, `rows-pass3.json`, `S119-row-precheck.txt` — counter-predicate mirror and all candidate runs
- `S119-recommended-rows.json` — the 5 verified rows above

Scratch (`/fast/scratch/hyaku/tabi-r31/FetchS119`, `TMPDIR` passed explicitly) was used for the
live clone-free work and deleted after copying; no git operation was run in this seat, so no
`rev-parse` guard was needed. No tool was installed or upgraded (nothing needed). No lane file, lane
index, jj state or sibling repo was touched; no `api.github.com` call, no credential or cookie use.

## Risks and blockers

- No blocker. The receipt is complete and self-consistent.
- Risk 1 (advisory): if the L1 counts D1, the line-380 variant and a “past the bound” row as three
  separate admitted rows, the counter will admit them but the table over-counts one bound. Keep the
  redirect contribution to two rows.
- Risk 2 (advisory): any hand-slotted unit on the 4xx/5xx statements passes the counter's numeric
  check; the frozen predicate does not compare units, so this must be caught by review, not by the
  gate.
- Risk 3: the raw body's BOM must survive the copy into `corpus/evidence/…/bytes/S119.txt` or
  `g3-bytes` fails.
