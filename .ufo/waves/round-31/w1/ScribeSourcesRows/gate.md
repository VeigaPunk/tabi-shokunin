# Round 31 w1 — Gate lines for S119–S122

Drafts of the `## Gate` lines for `corpus/lessons/round-31.md` (the L1 writes the lesson).
Each row carries URL, access date/time in UTC, HTTP status, byte count, sha256, and a
located verbatim quote of ≤25 words. Line numbers are line numbers of the fetched bytes;
RFC text is plain text, GitHub Docs is HTML whose first article heading sits at the tail of
the preload line 32.

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S119 | https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T08:36:21Z (HTTP 200, 25,265 B, sha256 `f633915d…b207`) | §2.3.1.2 "Redirects" lines 377-378: "The crawlers SHOULD follow at least five consecutive redirects, even across authorities" (12 words) |
| S120 | https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T08:36:21Z (HTTP 200, 17,164 B, sha256 `f6d55d1b…6e58`) | §4 "429 Too Many Requests" lines 137-139: "The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header indicating how long to wait before making a new request." (25 words) |
| S121 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T08:36:21Z (HTTP 200, 337,116 B, sha256 `ae5e1812…4c18`) | §About secondary rate limits, HTML line 67: "No more than 900 points per minute are allowed for REST API endpoints" (13 words) |
| S122 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T08:36:21Z (HTTP 200, 328,088 B, sha256 `b15c1c0b…a33e`) | §Handle rate limit errors appropriately, HTML line 51: "Otherwise, wait for at least one minute before retrying." (9 words) |

## Further located spans (same fetched bytes)

- S119 `rfc9309.txt:384-385` "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable." (17 words). `:425` "The parsing limit MUST be at least 500 kibibytes [KiB]." (10 words). `:419` "SHOULD NOT use the cached version for more than 24 hours" (11 words). `:392` "such status codes are in the 400-499 range"; `:403` "server errors are identified by status codes in the 500-599 range"; `:406` "for example, 30 days".
- S120 `rfc6585.txt:145` "Retry-After: 3600" (2 words). `:165` "Responses with the 429 status code MUST NOT be stored by a cache." (13 words).
- S121 `gh-rate-limits.html:38` "The primary rate limit for unauthenticated requests is 60 requests per hour." (12 words). `:66` "No more than 100 concurrent requests are allowed." (8 words). `:70` "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed" (19 words). `:41` "your personal rate limit of 5,000 requests per hour"; `:61` "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository."; `:143` "you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0".
- S122 `gh-best-practices.html:43` "you should make requests serially instead of concurrently" (8 words). `:45` "wait at least one second between each request" (8 words). `:49` "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed." (20 words). `:51` "wait for an exponentially increasing amount of time between retries" (10 words).

## Quote proof

Method: for the RFC plain text, quotes are matched against the fetched bytes with runs of
whitespace collapsed (they span wrapped lines). For the GitHub HTML, tags are removed, HTML
entities unescaped and runs of whitespace collapsed before matching; quoted text is the page's
own rendered text and does not include markup. Every quote above was located in the bytes it
cites, and the located line spans are in `quote-check.txt` beside this file. Word counts are
whitespace-split counts, all ≤25.

Fetch receipts (also `fetch-receipts.tsv`): `curl -q -sS --proto =https`, one GET per URL,
no cookies, no -L (curl default: redirects not followed), no API host contacted.

| id | UTC time | HTTP | bytes | sha256 |
|---|---|---|---|---|
| S119 | 2026-10-26T08:36:21Z | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| S120 | 2026-10-26T08:36:21Z | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| S121 | 2026-10-26T08:36:21Z | 200 | 337116 | ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18 |
| S122 | 2026-10-26T08:36:21Z | 200 | 328088 | b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e |
