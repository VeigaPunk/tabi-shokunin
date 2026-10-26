# Rate and crawl signals, and the action each licenses: a decision table with sourced thresholds

source: S119 — https://www.rfc-editor.org/rfc/rfc9309.txt — §2.3.1.2-§2.3.1.4, §2.4, §2.5 — fetched 2026-10-26
source: S120 — https://www.rfc-editor.org/rfc/rfc6585.txt — §4, §7.2 — fetched 2026-10-26
source: S121 — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api — §about-primary-rate-limits, §about-secondary-rate-limits, §checking-the-status-of-your-rate-limit, §exceeding-the-rate-limit — fetched 2026-10-26
source: S122 — https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api — §avoid-concurrent-requests, §pause-between-mutative-requests, §handle-rate-limit-errors-appropriately, §follow-redirects — fetched 2026-10-26
verified-at: 2026-10-26
recheck: 180d for S119 and S120 (standards-track RFC text, which changes by errata only — re-open and re-locate every span); 90d for S121 and S122 (vendor pages, with no revision marker or dated revision in the fetched bytes, so the cadence is the only guard)
ground: site-interaction records — the rate and crawl surface: which action a journey driver takes after a signal it has already observed, and which number the record stores as the wait or the bound, each traceable to the source's own sentence
tier: documented upstream, not measured in this lane

**Documented upstream, nothing executed.** Four public pages were fetched read-only on
2026-10-26 and re-read for their own numbers. No request reached any host's API, no
credential exists in this lane, and no response was observed. Every threshold below is a
sentence in one of those four documents; none is a measurement of a host's behaviour and
none is a budget this lane may spend.

## What this table decides

A journey driver that already holds a response faces two questions at once: may it send
another request, and what does the receipt store as the wait if it does? The table answers
both, and only from the sources' own figures. Each row pairs one observable signal — a
robots.txt fetch outcome, a redirect count, a cache age, a status code, a named response
header, a published quota, a vendor pacing instruction — with exactly one action drawn
from a closed verb set (wait, stop, retry, allow, disallow, cap, follow, refetch, backoff,
cache, limit, pause, serialize), and a threshold carrying the number the source states.
Rows are identified `D1` onward. Each row cites exactly one registry row opened in this
round (S119–S122) and one quote that the admitting counter re-locates both in committed
receipt bytes under `corpus/evidence/round-31/decision-table/` and in the live page, and
then requires the threshold's number to occur inside that same quote. A number the lane
calculated, or a quote the counter cannot find, is not a row.

The table is a lookup over evidence already in hand. It is not a budget, not a permission,
and not a claim that any host behaves as its documentation says.

**A decision the quote does not instruct carries `(derived)`.** Some of the strongest
numbers in these documents are declarations of a limit rather than instructions to a
reader: a published quota, a concurrency ceiling. Where a row's located quote only declares
such a limit — no RFC 2119 keyword in capitals, no lower-case directive addressed to the
caller — its Decision cell ends with `(derived)`, and the action recorded is the one the
declared limit implies. The admitting counter treats both forms alike, so this marker and
this sentence are the only place the distinction is kept; a derived cap must not be read as
a rule the page states. A specimen response block is a different case again: it is an
instance, not a statement, so it sources no row at all — RFC 6585's `Retry-After: 3600` and
its 50-requests-per-hour body are illustrations, and they stay in prose only.

| Row | Signal | Decision | Threshold | Source | Located quote |
|---|---|---|---|---|---|
| D1 | `robots.txt` fetch answered with `301` or `302` | follow — SHOULD: keep following the redirect chain, across authorities included (RFC 9309 §2.3.1.2) | at least 5 redirects | S119 | "The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP)." |
| D2 | `robots.txt` redirect chain longer than the bound (another `301`) | stop — stop following the chain; MAY treat robots.txt as unavailable, which re-enters the 400–499 outcome (RFC 9309 §2.3.1.2) | more than 5 redirects | S119 | "If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable." |
| D3 | `robots.txt` unreachable (`500`–`599` or network errors) for a long period — the period is the RFC's example value | allow — MAY treat the file as unavailable after the example period (or keep a cached copy); before that, complete disallow applies (RFC 9309 §2.3.1.4) | 30 days | S119 | "If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume" |
| D4 | cached `robots.txt` copy | refetch — SHOULD NOT use the cached copy past the bound, except while robots.txt is unreachable (RFC 9309 §2.4) | more than 24 hours | S119 | "Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." |
| D5 | `robots.txt` body size | limit — MUST keep the parsing limit at least this high; a floor, not a ceiling (RFC 9309 §2.5) | at least 500 KiB | S119 | "The parsing limit MUST be at least 500 kibibytes [KiB]." |
| D6 | rate-limited `403` or `429` with no `retry-after` and `x-ratelimit-remaining` not `0` | wait — at least this long before retrying; the vendor's last-resort branch after `retry-after` and `x-ratelimit-reset` (GitHub REST API policy) | at least 1 minute | S121 | "Otherwise, wait for at least one minute before retrying." |
| D7 | `x-ratelimit-limit` on an unauthenticated request | cap — plan at most this many requests per hour (GitHub REST API policy, unauthenticated) (derived) | 60 requests | S121 | "The primary rate limit for unauthenticated requests is 60 requests per hour." |
| D8 | `x-ratelimit-limit` with a personal access token | cap — plan at most this many requests per hour (GitHub REST API policy, user token; this lane holds no token) (derived) | 5,000 requests | S121 | "All of these requests count towards your personal rate limit of 5,000 requests per hour." |
| D9 | parallel fan-out to the host (`concurrent requests`) | cap — keep in-flight requests at or below the ceiling (GitHub secondary limit, shared across REST and GraphQL) (derived) | no more than 100 concurrent | S121 | "No more than 100 concurrent requests are allowed." |
| D10 | weighted `points` per minute on REST endpoints | cap — keep weighted points per minute at or below the ceiling (GitHub secondary limit; GraphQL has its own) (derived) | no more than 900 points | S121 | "No more than 900 points per minute are allowed for REST API endpoints" |
| D11 | summed response time as the `CPU time` proxy per 60 s of wall clock | cap — keep estimated CPU time at or below the ceiling (GitHub secondary compute limit) (derived) | no more than 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |
| D12 | `x-ratelimit-remaining` header is `0` | stop — make no further request until the instant in `x-ratelimit-reset` (UTC epoch seconds); SHOULD strength (GitHub REST API policy) | 0 requests | S122 | "If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header." |
| D13 | `POST`/`PATCH`/`PUT`/`DELETE` mutative requests in a series | pause — at least this long between mutative requests (GitHub REST API policy; this lane sends none — observation-only province) | at least 1 second | S122 | "wait at least one second between each request." |

## How a journey driver uses it

Two orderings apply in sequence: the site's permission surface first, the response's
quota surface second. Both orders are the sources' own, not a preference of this lane.

**Robots.txt outcomes come before any page fetch.** A robots fetch that answers in the
400–499 range leaves access open, and the crawler may access any resource on the server
(S119 §2.3.1.3). A fetch that is unreachable through server or network errors — the RFC's
example range is 500–599 — obliges complete disallow (S119 §2.3.1.4). The redirect budget
is five consecutive hops, across authorities included; inside five the file must be
fetched, parsed and followed in the context of the initial authority, and beyond five the
crawler may treat it as unavailable (S119 §2.3.1.2), which re-enters the 400–499 outcome.
A cached copy should not be used for more than 24 hours unless the file is unreachable
(S119 §2.4), and a crawler's parsing limit must be at least 500 KiB (S119 §2.5).
The 30-day clause is the one documented way out of complete disallow: after a reasonably
long undefined period a crawler may treat the file as unavailable or keep using its cached
copy (S119 §2.3.1.4), and the RFC offers 30 days as an example of that period, not as a
deadline.

**Rate signals follow, in the precedence the vendor states for itself.** `Retry-After`
first: when present, no retry until that many seconds have elapsed (S121
§exceeding-the-rate-limit; the same three-step order in S122
§handle-rate-limit-errors-appropriately). Then the published budget: with
`x-ratelimit-remaining` at 0, no further request before the instant in `x-ratelimit-reset`,
which the page states is UTC epoch seconds. Only when neither field is present does the
fallback apply — a wait of at least one minute (S121 §exceeding-the-rate-limit) — and for a
secondary limit that keeps refusing, an exponentially increasing interval with a stop after
a stated number of retries.
The same page adds that continued requests while rate limited can end in a ban of the
integration, which is the reason the table's `stop` and `cap` verbs exist rather than a
retry loop with no ceiling. A record therefore names the step it used; a single aggregate
wait cannot say which field produced it.

**Status class is not a substitute for a signal.** RFC 6585 defines 429 and says the
response may carry `Retry-After` indicating how long to wait (S120 §4), while the same RFC
says a server need not use 429 at all (S120 §7.2) — so an absent 429 is not an absent
limit. The vendor treats 403 and 429 as the same exceeded-limit outcome and publishes no
field that separates the two codes from each other (S121 §exceeding-the-rate-limit), which
means a 403 alone does not identify a rate signal: the record has to carry the header or
body evidence beside it.

**Request-time caps are applied before a request, not after a response.** Requests are
made serially rather than concurrently, with a queue in between (S122
§avoid-concurrent-requests); between mutative requests the documented pause is at least one
second (S122 §pause-between-mutative-requests); the vendor's concurrency ceiling and its
per-minute point ceilings bound the queue itself (S121 §about-secondary-rate-limits). These
rows exist so a pacing rule cites a number instead of a habit.

**Redirects are followed, and the stored URL depends on the code.** A redirect is not an
error; a 301 is permanent and the new URL replaces the stored one, while 302 and 307 are
temporary and the original stays (S122 §follow-redirects). This is the same distinction the
lane already holds from S107, now with the vendor's own instruction for which URL a
journey record keeps.

## Limits

- **Documentation only.** Four public documentation and RFC pages, fetched read-only on
  2026-10-26, no login, no cookie, no API endpoint, no consequential action. Nothing here
  describes an observed response, and the vendor figures were not exercised.
- **The lane's measured stop rule is unchanged.** The pinned fixture driver stops at the
  first 429, 403 or robots disallow and never waits the delay it was handed: the 429 cell
  carried `Retry-After: 7` and the run ended without a re-request
  (`corpus/knowledge/external-class-fixture-v2.md` §5). The table records what a host asked
  for and how a receipt classifies it; it does not describe what this lane did, and it
  authorizes no wait.
- **One vendor, at one access date.** S121 and S122 are GitHub's published policy on
  2026-10-26. That page states its secondary limits are subject to change without notice and
  can be hit for undisclosed reasons, and that its own remaining-count value varies between
  responses depending on the region handling the request, so logic must not depend on an
  exact count. Its header names overlap the vendor set already held (S117) only on the
  remaining and reset fields; the rest differ, so a row keyed on a header name is not
  portable to a host that spells its set differently, and no vendor number transfers to
  another host.
- **The RFC example values are examples.** `Retry-After: 3600` and the 50-requests-per-hour
  sentence inside RFC 6585's sample 429 body illustrate the response, not a limit any server
  enforces (S120 §4); RFC 9309's 30 days is likewise an example of a reasonably long period
  (S119 §2.3.1.4). Rows resting on either say so in their signal cell.
- **Approval-table outcomes are untouched.** C3 (third-party read-only) and C6
  (rate-limited) in `corpus/knowledge/interaction-approval-table.md` keep their
  dispositions — operator-asleep-blocked, durable operator-approval-required — and C6 still
  decides from an absence, because no measured third-party rate surface exists in this
  lane. The table adds exactly three things to those two rows: which action follows a given
  observed signal; which number a receipt stores as the wait, and from which field; and which
  numbers bound pacing before a request is sent. It supplies no budget, does not convert an
  unmeasured surface into a measured one, and a row's permission to wait is never a
  permission to send. A go-ahead naming the site and a budget remains the only thing that
  moves C3 or C6.
- **Counting belongs to the counter.** The row count in this entry is the admitting
  counter's `admitted` field, not the author's tally; a row that fails any of its checks is
  not in the table whatever the prose says.

## Unknowns

- **U1 — nothing measured.** The lane has never observed a rate-limit response from a real
  host; the approval table's U1 records the same gap. Every threshold here is documentary,
  and the first captured response carrying `Retry-After` or a published quota field
  re-anchors the rows it touches.
- **U2 — silence is not a limit.** Because a server need not use 429 (S120 §7.2) and need
  not publish quota fields at all, a journey that observes neither has not shown the host
  has no limit. Whether any host this lane might later visit publishes any of these signals
  is unmeasured.
- **U3 — enforcement versus publication.** Whether a host enforces the figures it publishes
  is untested here. The vendor warns its own numbers move by region and that secondary
  limits may change without notice, so a page reading is a policy statement with an
  expiry, not a property of the wire.
- **U4 — the robots.txt apply rule is a crawler rule.** RFC 9309 addresses crawlers and
  their fetching of `robots.txt`. The lane's journeys are browser sessions driven over CDP,
  and a browser does not fetch `robots.txt` on its own; a row in that group applies only
  where a driver chooses to fetch the file, and treating an operator's browser journey as
  bound by those outcomes is an interpretation this entry does not make.
