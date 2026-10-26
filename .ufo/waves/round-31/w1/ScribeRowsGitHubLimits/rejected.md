# C1 rejected sentences — S121 (GitHub REST API rate limits)

Source: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
Normalised as the frozen counter's `normalise()` does (script/style removed, tags → space, entities decoded, whitespace collapsed). Every sentence below is quoted from that normalised text. Refusal classes: **no number** (would fail `t4-threshold` or need an author-invented number, which the `n1-threshold-sourced` control shows is refused), **not a driver decision**, **derived/arithmetic**, **example not rule**, **out of scope**. PROVINCE.md puts rate/rights discipline in this lane, so no sentence was refused for being out of province; the scope refusals below are narrower than province.

## Refused — the decision is clear but the source states no number

1. "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed." — the threshold lives in the response header, not in the source; a row would need an author-supplied number.
2. "If your request continues to fail due to a secondary rate limit, wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries." — "exponentially increasing" and "a specific number of retries" are unnamed; no bound to source.
3. "Continuing to make requests while you are rate limited may result in the banning of your integration." — a `stop` decision follows, but the consequence carries no numeric threshold.
4. "Use the x-ratelimit-* response headers to pace and back off your requests, but avoid logic that depends on an exact remaining count." — pacing/backoff guidance with no number, and it forbids the very arithmetic a table row would encode.
5. "The x-ratelimit-* headers are the authoritative source for your current rate limit status and may differ from values reported by the GET /rate_limit endpoint." — header-precedence rule, no number.
6. "If you want a higher primary rate limit, consider making authenticated requests instead of unauthenticated requests." — a recommendation to change credential class, no bound.
7. "If you are using GitHub Apps or OAuth apps, consider upgrading to GitHub Enterprise Cloud." — commercial/account decision, no number (a driver cannot act on it without a plan change).
8. "Some endpoints have lower content creation limits." — an explicit unbounded caveat; no threshold can be sourced from this page for those endpoints.
9. "Some REST API endpoints have a different point cost that is not shared publicly." — the source says the cost is not published, so no numeric row is possible.
10. "These secondary rate limits are subject to change without notice." / "You may also encounter a secondary rate limit for undisclosed reasons." — no number and no decision beyond caution; also undercuts any claim of a fixed secondary bound.
11. "x-ratelimit-limit The maximum number of requests that you can make per hour" — the header-table row names the observable but gives no number (the numbers sit in the sections above, already used by D2–D6).
12. "Make too many concurrent requests." / "Make too many requests per minute." — trigger labels; the numbers are in the following sentences, which are the ones used.

## Refused — the number is real but not a bound the driver acts on

13. "For example, if an app with a 15,000 request limit makes 10,000 requests on your behalf, you will have exhausted the 5,000 request budget for your personal access tokens, even though the app has 5,000 requests remaining." — a worked example of budget overlap; recording it as a row would present an illustration as a rule (the counter would accept the numbers, so this refusal is judgment, not mechanics). The rule it illustrates is already carried by D3.
14. "Installations that have more than 20 repositories receive another 50 requests per hour for each repository." — an allowance scaled by tenant topology; the decision needs arithmetic (repositories × 50) that the quote does not state, and a repository count is not a rate/crawl signal.
15. "Installations that are on an organization that have more than 20 users receive another 50 requests per hour for each user." — same class as 14.
16. "Git LFS uses a batch API which processes 100 Git LFS objects per API request by default." — descriptive batching behaviour, not a limit imposed on the driver.
17. "That means unauthenticated users can download 30,000 Git LFS objects per minute and authenticated users can upload/download 300,000 Git LFS objects per minute." — a ceiling derived by multiplying the batch size by the bucket (100 × 300); the actionable bound is requests per minute, carried by D12.
18. "No more than 60 seconds of this CPU time may be for the GraphQL API." — a GraphQL sub-budget of the 90-second limit; a REST journey driver does not touch it, and D9 already carries the parent bound.

## Refused — trigger value only, not a wait bound

19. "If the x-ratelimit-remaining header is 0 , you should not retry your request until after the time, in UTC epoch seconds, specified by the x-ratelimit-reset header." — the only number is the trigger (`remaining: 0`); writing a threshold of `0 requests` would misstate a remaining-budget trigger as a cap on the driver's request count, and the wait bound itself is header-supplied. Its signal is folded into D1's branch description instead.

## Note on the `retry-after` branch

The page's per-response `retry-after` rule (item 1) is the highest-value row this source *almost* supports; it is refused only because the source states no fixed number. If the lane later admits a row whose threshold is "the header's own seconds", that row cannot pass `n1-threshold-sourced` without an author-invented number — a counter limitation, recorded here, not a defect in this draft.
