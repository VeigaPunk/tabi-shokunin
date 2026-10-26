# Counterexample decision table (CritSourceChoice probe)

source: S119-S122
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | robots.txt answers `500` | stop | 30 days | S119 | "the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume that the robots.txt file is unavailable" |
| D2 | `429` body | wait | 3600 seconds | S120 | "HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600" |
| D3 | `x-ratelimit-remaining` | cap | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour" |
| D4 | `retry-after` absent | backoff | 1 minute | S122 | "Otherwise, wait for at least one minute before retrying" |
| D5 | `x-ratelimit-remaining` | wait | 6 hours | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour" |
| D6 | robots.txt answers `500` | stop | 30 days | S119 | "30 days), crawlers MAY assume that the robots.txt file is unavailable as defined in Section 2.3.1.3" |
| D7 | `x-ratelimit-remaining` | backoff | 60 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed" |
| D8 | `429` response body | cap | 50 requests | S120 | "I only allow 50 requests per hour to this Web site per logged in user" |

Probe text: D1 reads the parenthetical example as a threshold; D2 reads an
example response body as a rule; D3/D4 apply one vendor's policy as a web norm.
