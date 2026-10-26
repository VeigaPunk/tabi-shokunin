# Rate and crawl signal decision table (falsifier fixture B: one quote, ten rows)

source: S121
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | response carries `429` | wait | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D2 | response carries `403` | stop | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D3 | response carries `503` | retry | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D4 | response carries `retry-after` | allow | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D5 | response carries `x-ratelimit-remaining` | disallow | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D6 | response carries `x-poll-interval` | cap | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D7 | `robots.txt` fetch answers `404` | follow | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D8 | response carries `link` | refetch | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D9 | response carries `content-length` | backoff | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
| D10 | response carries `etag` | cache | 1 minutes | S121 | "Otherwise, wait for at least one minute before retrying." |
