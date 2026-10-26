# Honest decision table (CritSourceChoice probe)

source: S119-S122
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | robots.txt answers `301` chain | follow — crawler role only (§2.3.1.2 MUST when the chain resolves within five; the SHOULD follow at least five is the crawler duty, beyond five §2.3.1.4 MAY treat as unavailable) | at most 5 redirects | S119 | "If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched" |
| D2 | cached `robots.txt` | refetch — crawler role only (§2.4 SHOULD NOT, 24 h) | no more than 24 hours | S119 | "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable" |
| D3 | `robots.txt` body | cap — the crawler's own parser (§2.5 MUST) | at least 500 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes" |
| D4 | `x-ratelimit-remaining` | cap — GitHub REST authenticated, published value | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour" |
| D5 | `x-ratelimit-limit` unauthenticated | cap — GitHub REST only | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour" |
| D6 | `429` while two requests are in flight | serialize — GitHub secondary limit | 100 concurrent requests | S121 | "No more than 100 concurrent requests are allowed" |
| D7 | `x-ratelimit-remaining` on one endpoint | limit — GitHub secondary limit | 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" |
| D8 | `x-ratelimit-remaining` after a `POST` burst | limit — GitHub secondary limit | 80 requests | S121 | "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed" |
| D9 | `POST` token endpoint | limit — GitHub OAuth token requests | 2,000 requests | S121 | "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps" |
| D10 | `429` without `retry-after` | wait — GitHub fallback default, not a web norm | at least 1 minute | S122 | "Otherwise, wait for at least one minute before retrying" |
| D11 | write burst `POST`/`PATCH`/`PUT`/`DELETE` | serialize — GitHub's own pacing rule | at least 1 second | S122 | "wait at least one second between each request" |

Probe text: every number above is one the source states as a bound.
