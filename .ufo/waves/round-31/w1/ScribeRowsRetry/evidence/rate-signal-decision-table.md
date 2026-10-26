# Rate and crawl signal decision table

source: S120
verified-at: 2026-10-26
recheck: 180d

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `429` response | wait the Retry-After delay this example response carries (3600 s) before a new request — RFC 6585 §4 example, the section's normative sentence states MAY, not a norm | 3600 s | S120 | "For example: HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600" |
| D2 | `429` response body stating a request budget | cap the journey's request rate at the budget the example body states (50 per hour) — RFC example body, the server's illustrative policy, not a norm | 50 requests | S120 | "I only allow 50 requests per hour to this Web site per logged in user." |
