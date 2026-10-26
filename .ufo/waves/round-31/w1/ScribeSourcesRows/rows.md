# Round 31 w1 — registry rows S119–S122 (drafts for the L1 to integrate)

Seat: ScribeSourcesRows. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Target: `corpus/SOURCES.md`, appended after S118 (currently the last registry row, file line
132), inside `## Registry`, before `## Paths` (file line 133). Contract: SOURCES contract v1,
`/home/vgpnk/Projects/shokunin/CORPUS.md:64-152`; 11 cells, NF=13, no `|` inside any cell.

All four rows: status `mined`, opened `2026-10-26`, `used-by corpus/knowledge/rate-signal-decision-table.md`
(the C1 entry), kind/tier per the contract (spec or official docs at tier A, scoped to `scope`).
Fetches were read-only HTTPS GETs with `curl -q -sS --proto =https`; receipt lines are in
`fetch-receipts.tsv` beside this file and repeated in the report.

## Rows

| S119 | Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.txt | spec | A | The robots.txt fetch-result semantics a journey driver acts on: redirect, unavailable and unreachable outcomes, cache lifetime and parse size, each with the RFC's own numeric limit | RFC 9309 (June 2022), §2.3.1.2 "Redirects" lines 373-385 (five consecutive redirects at 377-384), §2.3.1.3 "Unavailable" Status lines 387-396 (400-499 at 392), §2.3.1.4 "Unreachable" Status lines 398-408 (500-599 at 403, 30 days at 406), §2.4 "Caching" lines 415-420 (24 hours at 419), §2.5 "Limits" lines 422-425 (500 kibibytes at 425); fetched 2026-10-26T08:36:21Z, 25265 B, sha256 f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 | The RFC states the fetch-result thresholds a driver can decide from: follow at least five consecutive robots.txt redirects, read a 400-499 outcome as unavailable (access MAY proceed), a 500-599 outcome as undefined (complete disallow, 30 days before softening), cache no longer than 24 hours and parse at least 500 KiB | mined | 2026-10-26 | 365d | corpus/knowledge/rate-signal-decision-table.md |
| S120 | Additional HTTP Status Codes — https://www.rfc-editor.org/rfc/rfc6585.txt | spec | A | The 429 Too Many Requests status semantics a journey records, including its optional Retry-After signal and cache prohibition; not how an origin counts or identifies clients | RFC 6585 (April 2012), §4 "429 Too Many Requests" lines 132-166 (Retry-After MAY at 138, example "Retry-After: 3600" at 145, "MUST NOT be stored by a cache" at 165), §3 428 at 95-130, §5 431 at 175-201, §6 511 at 203-220; fetched 2026-10-26T08:36:21Z, 17164 B, sha256 f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 | A 429 response means the client was rate-limited and MAY carry Retry-After seconds saying how long to wait, and a 429 MUST NOT be stored by a cache, so a driver that sees 429 has a protocol signal to back off on rather than a guess | mined | 2026-10-26 | 365d | corpus/knowledge/rate-signal-decision-table.md |
| S121 | Rate limits for the REST API — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | docs | A | GitHub's own published REST API primary and secondary rate-limit ceilings and the response headers that report them; documentation only, not a measured response and no API calls | article body opens at the end of HTML line 32 (§About primary rate limits): unauthenticated 60 requests per hour at line 38, authenticated 5,000 requests per hour at line 41, GITHUB_TOKEN 1,000 requests per hour per repository at line 61; §About secondary rate limits at line 62: 100 concurrent requests at line 66, 900 points per minute for REST at line 67, 80 content-generating requests per minute and 500 per hour at line 70; §Checking the status of your rate limit at line 103 (x-ratelimit-* table at line 134); §Exceeding the rate limit at line 142 (403 or 429 with x-ratelimit-remaining 0 at line 143, retry-after at line 144); fetched 2026-10-26T08:36:21Z, 337116 B, sha256 ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18 | GitHub publishes its own numeric ceilings, so a journey can name the budget it paces against: 60 requests per hour unauthenticated, 5,000 authenticated, 100 concurrent requests, 900 points per minute for REST endpoints, 80 content-generating per minute and 500 per hour | mined | 2026-10-26 | 90d | corpus/knowledge/rate-signal-decision-table.md |
| S122 | Best practices for using the REST API — https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | docs | A | GitHub's own published pacing and back-off guidance for its REST API: retry waits, serialisation, conditional polling and redirect handling; documentation only, no API calls | article body opens at the end of HTML line 32 (§Avoid polling): x-poll-interval at line 36; §Avoid concurrent requests at line 42 (serial requests at line 43); §Pause between mutative requests at line 44 (one second at line 45); §Handle rate limit errors appropriately at line 46 (retry-after at line 49, x-ratelimit-reset at line 50, otherwise one minute and exponentially increasing waits at line 51); §Follow redirects at line 54 (301 permanent at line 57, 302 or 307 temporary at line 58); §Use conditional requests at line 63 (304 Not Modified not counted at line 64); fetched 2026-10-26T08:36:21Z, 328088 B, sha256 b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e | GitHub orders its own back-off thresholds numerically: honour Retry-After first, then x-ratelimit-reset, otherwise wait at least one minute and increase exponentially, keep mutative requests one second apart and serialise rather than run concurrently | mined | 2026-10-26 | 90d | corpus/knowledge/rate-signal-decision-table.md |

## Cell notes

- `source` cells carry `<title> — <url>` with the exact URLs the round names. None of the four
  URLs occurs in the registry at the freeze tree (`grep -c` over `corpus/SOURCES.md` gives 0
  each), so no E04 duplicate-URL+scope collision and the C1 counter's r4-new-row control is
  satisfied by construction.
- `anchor` cells cite heading plus fetched-text line numbers. The RFC line numbers are line
  numbers of the plain-text response. The GitHub Docs pages are HTML with a preload line 32
  that also carries the first article heading at its tail; threshold lines 33 onward are
  ordinary one-element-per-line HTML. The fetch time and sha256 pin the exact byte revision,
  because line numbering alone would not survive a documentation edit.
- Tier A is scoped: the RFCs are primary for their own normative text; the GitHub pages are
  first-party documentation of GitHub's own ceilings and guidance. Neither GitHub row claims a
  measured response, and no request went to api.github.com.
- `recheck`: `365d` for the two published RFCs (stable text); `90d` for the two rolling GitHub
  Docs pages (no revision marker in the served HTML).
- `used-by` names the C1 entry `corpus/knowledge/rate-signal-decision-table.md`. E11 requires
  that path to exist on disk at validation time, so the scratch-mirror validation used a
  placeholder at that path; the lane tree has no such file at the freeze commit.

## Registry append point

Append the four rows directly after S118 (lane file line 132, last row of `## Registry`) and
before `## Paths` (line 133). Do not edit any existing row.
