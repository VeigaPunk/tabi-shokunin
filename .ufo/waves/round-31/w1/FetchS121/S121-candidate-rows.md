# Rate-signal decision table (fixture probe for FetchS121)

source: S121
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `403`/`429` with `x-ratelimit-remaining: 0` | wait | 0 requests | S121 | "If you exceed your primary rate limit, you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0 ." |
| D2 | `retry-after` absent, `x-ratelimit-remaining` not 0 | backoff | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
| D4 | `unauthenticated` request budget | cap | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D5 | `x-ratelimit-remaining` under a personal token | cap | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." |
| D6 | GhEC-owned `GitHub App` acting on the user's behalf | cap | 15,000 requests | S121 | "have a higher rate limit of 15,000 requests per hour." |
| D7 | `GITHUB_TOKEN` in a `workflow` | cap | 1,000 requests | S121 | "The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository." |
| D8 | `installation access token` on a large installation | cap | 50 requests | S121 | "Installations that have more than 20 repositories receive another 50 requests per hour for each repository." |
| D9 | `installation access token` ceiling | cap | 12,500 requests | S121 | "The rate limit cannot increase beyond 12,500 requests per hour." |
| D10 | `Git LFS` batch request, unauthenticated | cap | 300 requests | S121 | "a limit of 300 requests per minute for unauthenticated requests" |
| D11 | `concurrent` requests in flight | serialize | 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." |
| D12 | `points` spent per minute, `REST` | limit | 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" |
| D13 | `CPU` seconds per real second | pause | 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |
| D14 | `content-generating` requests | limit | 80 requests | S121 | "no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed." |
| D15 | `OAuth` access token requests | limit | 2,000 requests | S121 | "No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps." |
| D16 | cost of a `GET`/`HEAD`/`OPTIONS` request | cap | 1 point | S121 | "Most REST API GET , HEAD , and OPTIONS requests 1" |
| D17 | cost of a `POST`/`PATCH`/`PUT`/`DELETE` request | cap | 5 points | S121 | "Most REST API POST , PATCH , PUT , or DELETE requests 5" |

Trailing prose.
