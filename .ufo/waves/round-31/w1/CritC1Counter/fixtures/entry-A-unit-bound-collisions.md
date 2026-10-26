# Rate and crawl signal decision table (falsifier fixture A)

source: S119, S120, S121, S122
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | response carries `429` | cache | 429 requests | S120 | "Responses with the 429 status code MUST NOT be stored by a cache." |
| D2 | response carries `ratelimit-remaining` | retry | 60 days | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D3 | response carries `x-poll-interval` | cap | at least 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |
| D4 | `robots.txt` group header | follow | 1 redirects | S119 | "Group: One or more user-agent lines that are followed by one or more rules." |
| D5 | response carries `retry-after` | wait | 1 minutes | S122 | "Otherwise, wait for at least one minute before retrying." |
| D6 | request body size `content-length` | serialize | 1 h | S122 | "If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second between each request." |
