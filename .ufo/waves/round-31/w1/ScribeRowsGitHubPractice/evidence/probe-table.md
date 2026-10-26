# probe

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `x-poll-interval` header present | wait | at least 1 s | S122 | "If a response includes an x-poll-interval header, wait at least that many seconds before you poll the same endpoint again." |
| D2 | `301` status code | follow | at least 1 redirects | S122 | "A 301 status code indicates permanent redirection." |
| D3 | `304` status code | cache | at most 1 requests | S122 | "each 304 Not Modified response is fast and does not use your rate limit." |
| D4 | `404` status code on poll | stop | at most 1 requests | S122 | "If you are polling and a resource repeatedly returns a 404 Not Found response, do not keep requesting it on every poll." |
| D5 | `secondary rate limit` | serialize | at most 1 concurrent | S122 | "To avoid exceeding secondary rate limits, you should make requests serially instead of concurrently." |
| D6 | `secondary rate limit` persists | backoff | at least 2 retries | S122 | "wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries." |
