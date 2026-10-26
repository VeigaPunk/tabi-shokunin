# Refused candidates — S122 (GitHub REST API best practices)

Source: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
(fetched 2026-10-26T08:36:21Z, HTTP 200, 328088 B, sha256 fc5290503571737f64ba921e415cb8ea0bd0fcf799cf0eb295bc49e242e01714).
Normalised with the frozen counter's own `normalise()`; sentences below are quoted from that
normalised text (whitespace collapsed, so `POST , PATCH` spacing is the source's rendered spacing).

Every refusal below has one of three reasons: **no number** (the source states no numeric bound),
**not a driver decision** (the sentence does not tell a journey driver what to do), or **out of
province** (not this lane's surface). Where a candidate was forced into the row grammar anyway, the
frozen counter's reason id is recorded — the probe document is `probes/probe-table.md`, run in a
scratch fixture repo (exit 1, population 6, admitted 0, all six `n1-threshold-sourced`).

| Considered sentence | Reason refused | Counter reason when forced into a row |
|---|---|---|
| "If a response includes an x-poll-interval header, wait at least that many seconds before you poll the same endpoint again." | no number — the bound is the header's runtime value ("that many"); writing `1 s` would be the author's threshold, not the source's | `n1-threshold-sourced` |
| "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed." | no number — same "that many" deferral | not probed (same shape as above) |
| "wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries." | no number — "an exponentially increasing amount" and "a specific number of retries" are both open | `n1-threshold-sourced` |
| "To avoid exceeding secondary rate limits, you should make requests serially instead of concurrently." | no number — serialization is stated with no concurrency cap | `n1-threshold-sourced` |
| "A 301 status code indicates permanent redirection. You should repeat your request to the URL specified by the location header." | no number — `301` identifies the response class; it is not a redirect-count bound. (RFC 9309 carries the redirect-count bound this row would need; that is S119's row, not S122's) | `n1-threshold-sourced` |
| "A 302 or 307 status code indicates temporary redirection." | no number, same as 301; additionally "you should not update your code to use this URL for future requests" is a code-maintenance instruction, not a journey-driver action | not probed |
| "This makes conditional requests especially useful when you poll an endpoint, because each 304 Not Modified response is fast and does not use your rate limit." | no number — `304` is a status identifier; a threshold such as `at most 1 requests` would be invented | `n1-threshold-sourced` |
| "If you are polling and a resource repeatedly returns a 404 Not Found response, do not keep requesting it on every poll." | no number — "wait much longer before you check again" is unquantified | `n1-threshold-sourced` |
| "You should not ignore repeated 4xx and 5xx error codes." | no number, and not a driver decision: it names an obligation to read errors, not an action with a bound | not probed |
| "Continuing to make requests while you are rate limited may result in the banning of your integration." | no number — the consequence is stated, the stop bound is not | not probed |
| "You should subscribe to webhook events instead of polling the API for data." | no number; also a deployment-side decision (registering a webhook) rather than a bound a journey record can key on | not probed |
| "Poll only as often as you need to, on a fixed schedule." | no number — "as often as you need" is not a threshold | not probed |
| "You should not try to parse these URLs or to predict the structure of future URLs." / "you should not try to manually construct pagination queries." | not a driver decision for rate discipline — URL/pagination hygiene, not a rate signal; no number either | not probed |
| "If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second between each request." (as a whole span) | span shape — 26 words, over the counter's 25-word cap. Admitted as the 8-word fragment starting at "wait" (row D3) | `q1-quote-length` |
| "etag: 644b5b0155e6404a9cc4bd9d8b1ae730" / "Wed, 25 Oct 2023 19:17:59 GMT" / "issues/1347" / "HTTP/2 200" | no number — these are worked examples. Using any of them as a threshold would present an example value as a bound | not probed |

Out-of-province refusals in this source: none. Every candidate above sits in this lane's
rate/rights discipline surface (PROVINCE.md). Webhook *registration* would be a publishing action
(kake's surface), which is one reason the webhook sentence is not a row here; nothing in the refused
list was absorbed from another lane's surface.
