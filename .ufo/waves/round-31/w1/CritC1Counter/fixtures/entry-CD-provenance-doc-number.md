# Rate and crawl signal decision table (falsifier fixture C/D: receipt provenance and document-number threshold)

source: S120, S122
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | response carries `retry-after` | wait | 1 minutes | S122 | "Otherwise, wait for at least one minute before retrying." |
| D2 | response carries `retry-after` | wait | 6585 requests | S120 | "RFC 6585 Additional HTTP Status Codes April 2012" |
