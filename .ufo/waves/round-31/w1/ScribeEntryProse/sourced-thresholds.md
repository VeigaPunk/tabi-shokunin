# Sourced thresholds — hand-off for the decision-table rows

Generated from the four round-31 fetches (2026-10-26) in seat scratch and verified against the same
normalisation the counter uses (HTML tags stripped, entities decoded, whitespace collapsed). Not part of the
entry: `corpus/knowledge/rate-signal-decision-table.md` keeps only the prose and the table.

| Row | Signal | Decision | Threshold | Source | Located quote | words | present | n1 |
|---|---|---|---|---|---|---|---|---|
| D1 | robots.txt fetch answers `301`/`302` on its own URL | follow | at least 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP)." | 20 | true | true |
| D2 | robots.txt redirect chain longer than 5 hops | allow | more than 5 redirects | S119 | "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable." | 17 | true | true |
| D3 | cached `robots.txt` copy | refetch | 24 hours | S119 | "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." | 18 | true | true |
| D4 | robots.txt fetch stays unreachable | allow (derived) | 30 days | S119 | "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days)" | 17 | true | true |
| D5 | robots.txt body size | cap | at least 500 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." | 10 | true | true |
| D6 | `429` carrying `Retry-After` (the spec's own example response) | wait (derived) | 3600 seconds | S120 | "HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600" | 9 | true | true |
| D7 | `429` after an unauthenticated request | cap (derived) | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." | 12 | true | true |
| D8 | `429` after an authenticated request | cap (derived) | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." | 15 | true | true |
| D9 | concurrent in-flight requests | serialize (derived) | no more than 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." | 8 | true | true |
| D10 | request points spent on REST endpoints in a minute | cap (derived) | no more than 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" | 13 | true | true |
| D11 | server CPU spent per minute of wall time | cap (derived) | no more than 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." | 16 | true | true |
| D12 | OAuth access-token requests | cap (derived) | no more than 2,000 requests | S121 | "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps." | 18 | true | true |
| D13 | `Retry-After` absent, `x-ratelimit-remaining` absent | wait | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." | 9 | true | true |
| D14 | `x-ratelimit-remaining` reads `0` | wait (derived) | 0 requests | S122 | "If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header." | 22 | true | true |
| D15 | `POST`/`PATCH`/`PUT`/`DELETE` requests in sequence | pause | at least 1 second | S122 | "If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second between each request." | 25 | true | true |

Counted rows available: 15 (counter target: at least 10, failing 0).

Notes for the rows seat:

- HTML-sourced quotes keep the spaces that tag-stripping leaves (`POST , PATCH , PUT , or DELETE`, `0 , you should`).
  The counter compares against the normalised bytes, so those spaces are part of the quote; a tidied quote fails q2.
- Each quote is a single double-quoted span of 6..25 words and contains its threshold's number, as the counter's
  q1 and n1 checks require.
- Threads left without a countable row because their passages carry no number with a unit: robots.txt 400-499
  (access open), 500-599 (complete disallow), RFC 6585 §7.2 (a server need not use 429), and the vendor's
  Retry-After sentence itself (no digit). They belong in prose, not as counted rows.
- D6 quotes the spec's own example response block; its signal cell must keep saying so, since 3600 is an example.
- D2 chains two clauses: more than five redirects lets a crawler assume the file is unavailable (S119 §2.3.1.2),
  and an unavailable file lets it access any resource (S119 §2.3.1.3). The row must say so rather than present
  `allow` as the §2.3.1.2 sentence alone.
- D4's 30 days and D2's five hops are the RFC's examples of a long period and of a redirect budget; both are normative
  wording, and neither is a measured site behaviour.

## `(derived)` markers (draft bar alignment, ScribeQuality-2 criterion-80 draft)

Nine of the fifteen quotes are declarations of a limit or an example response, not instructions to a reader: D4, D6,
D7, D8, D9, D10, D11, D12, D14. Their Decision cells now read `<verb> (derived)`, and the entry carries the matching
prose sentence (`entry-prose.md` §What this table decides, the paragraph above `<!-- TABLE -->`). D13 and D15 keep an
unmarked verb because their quotes are imperative (`wait for at least one minute`, `wait at least one second`); D1, D2,
D3 and D5 keep one because their quotes carry a normative keyword (SHOULD, SHOULD NOT, MAY, MUST).

Mechanical test used, applied to each quote as the counter normalises it: uppercase `MUST|SHOULD|MAY|REQUIRED|
RECOMMENDED`, or an imperative verb heading a clause (`wait`, `follow`, `cap`, `refetch`, `pause`, …). The counter
admits both kinds of row, so the marker is prose-only — it cannot be caught by an admission check.

**Boundary case for that criterion:** D14's quote says `you should not make another request` in lower case. It is a
directive in ordinary prose but carries no normative keyword token, so it is marked `(derived)` here. If the criterion
means to count lower-case `should` as the SHOULD token, D14's marker comes off; the seat that wrote the criterion should
rule rather than have the rows seat guess.

