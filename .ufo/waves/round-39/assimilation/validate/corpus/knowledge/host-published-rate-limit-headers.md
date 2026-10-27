# The rate-limit headers one real host publishes, and what a journey may record

source: S117 — https://docs.discord.com/developers/topics/rate-limits — §Header Format, §Exceeding A Rate Limit, §Global Rate Limit, §Invalid Request Limit aka Cloudflare bans (page H1: Rate Limits) — fetched 2026-10-26
verified-at: 2026-10-26 — round 30
recheck: 90d — vendor docs change without a version marker
frontier: rate-tos-signal
ground: site-interaction records — the rate/ToS surface: the published signal set a host returns with a response, not the status code alone
tier: documented upstream, not measured in this lane

**Nothing in this entry was measured in this lane.** The lane has never called the Discord
API and does not do so in this round: no token exists here, and the bounded-runs rule forbids
consequential actions on a real site. Everything below is what one host publishes in its
developer documentation, restated as the vocabulary a journey receipt uses to *classify* a
response it later observes. The sibling entry `corpus/knowledge/rate-limit-policy-fields.md`
(S116) holds the normative draft and its field definitions; this entry holds one host's wire
set and says where the two do not line up.

## 1. The published set

The page describes its own surface before the header table — that the headers are optional
and describe the limit encountered during the request:

> "For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request."

| header | documented meaning |
|---|---|
| `X-RateLimit-Limit` | "The number of requests that can be made" |
| `X-RateLimit-Remaining` | "The number of remaining requests that can be made" |
| `X-RateLimit-Reset` | "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets" |
| `X-RateLimit-Reset-After` | "Total time (in seconds) of when the current rate limit bucket will reset." |
| `X-RateLimit-Bucket` | "A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)" |
| `X-RateLimit-Global` | "Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)" |
| `X-RateLimit-Scope` | "Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)" |

The page's own header example, which is the shape a receipt should expect (values are
illustrative, not a measurement):

```text
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1470173023
X-RateLimit-Reset-After: 1
X-RateLimit-Bucket: abcd1234
```

Three qualifications the page attaches to that table matter for a receipt:

- The set is **optional**: a response may carry none of it, so an absent header is not a zero
  and must be recorded as absent, never imputed from the status code.
- `X-RateLimit-Reset` is an absolute epoch value; the 429 example carries a fractional value
  (`1470173023.123`), while the plain example carries an integer. `X-RateLimit-Reset-After` is
  a delta that the page says can carry decimals. A receipt therefore records both raw values
  and does not silently treat one as the other.
- `X-RateLimit-Bucket` is the page's recommended identifier for a shared per-route limit; the
  same bucket can cover a set of similar endpoints. It is opaque and host-assigned.

## 2. The per-guild exception, and its scope

One class of routes is limited by a different scope than the origin. The page states it in
full, including its own admission that the returned quota can then be wrong:

> "Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s."

The scope is the emoji-control routes, not the API as a whole. That matters for reading an
old distillation: the package row behind this entry (staged S182) quoted only the final
sentence of that passage and read the caveat as a general statement about the host's quota
headers. It is scoped by the two sentences before it. A journey that sees an inaccurate `X-RateLimit-Remaining`
on an unrelated route has not confirmed this exception; a journey on an emoji-control route
has a documented reason to distrust the number.

## 3. Exceeding a limit: status, headers and body

The page's failure shape is a 429 with both headers and a JSON body:

> "In the case that a rate limit is exceeded, the API will return a HTTP 429 response code with a JSON body."
> "Your application should rely on the Retry-After header or retry_after field to determine when to retry the request."

The documented body fields are `message` (string), `retry_after` (float seconds), `global`
(boolean) and an optional integer `code`. The page adds that the ordinary route headers also
ride on this response:

> "Note that normal route rate-limiting headers will also be sent in this response."

Its 429 examples differentiate the three cases a receipt must keep apart — a user-scope
throttle (`X-RateLimit-Scope: user`), a shared-resource throttle (`X-RateLimit-Scope: shared`,
whose `retry_after` in the example differs from the numeric `Retry-After`; the page tells the
client to rely on either, without equating the two example values), and a global throttle,
which is the only example carrying `X-RateLimit-Global: true` and omitting the per-route
headers. The distinction is carried by headers and body fields, never by the status code,
which is 429 in all three.

## 4. The global limit and the invalid-request limit

Two limits are documented outside the per-route headers:

> "All bots can make up to 50 requests per second to our API."
> "Interaction endpoints are not bound to the bot’s Global Rate Limit."

The first is independent of any route; the page adds that without an authorization header
the limit applies to the IP address. The second is the documented exemption a journey on an
interaction endpoint must not read as a breach of the global budget.

Separately, the page documents a request-validity cap (not a rate-limit header): IP addresses
making too many invalid requests — 401, 403 or 429 responses — are temporarily restricted,
at a documented 10,000 per 10 minutes at the time of the fetch. A receipt that records
repeated 401/403/429 outcomes is therefore recording inputs to a second limit that no
response header declares; the page calls it an invalid request limit and states the current
figure.

## 5. What a journey record captures, shape-only

A record of a response to a real host captures the *shape* of the signal, never the
credential that produced it:

- request: method, a URL with every credential removed from the path (a webhook token
  segment is replaced by a fixed marker), and the response status;
- rate-limit signal: each header name present, and its value as a number (`Limit`,
  `Remaining`, `Reset`, `Reset-After`) or as an opaque string (`Bucket`, `Scope`), plus
  `Retry-After` when present;
- on 429: only `retry_after`, `global` and `code` from the body; the `message` text is not
  evidence and need not be retained;
- absent headers: recorded as absent, with the reason stated (the set is optional);
- clock: the receipt's own UTC timestamp, so an absolute `Reset` can be interpreted only
  against the same receipt's clock and never against an unstated one.

Never captured: the `Authorization` header or any bot token, a webhook token or a full
webhook URL, cookies, session material, or any other request or response content. The
bucket value is an identifier; it is recorded as an opaque string and not interpreted as
content. The page itself warns against pinning behaviour to a fixed limit — its header set
is the thing to parse at run time, not a constant to hard-code.

## 6. Mapping onto the RateLimit fields draft

The sibling entry `corpus/knowledge/rate-limit-policy-fields.md` (S116) defines the draft's
two fields and their parameters: `RateLimit-Policy` with `q`, `qu`, `w`, `pk`, and
`RateLimit` with `r`, `t`, `pk`. Mapping this host's set onto them, honestly:

| this host | draft analogue | status |
|---|---|---|
| `X-RateLimit-Limit` | policy `q`, with `w` for the window | analogue: the host publishes no policy identifier, so the policy must be grouped by the bucket rather than named |
| `X-RateLimit-Remaining` | `r` | direct analogue: both are the remaining quota |
| `X-RateLimit-Reset-After` | `t` | closest analogue: a delay in seconds, as the draft's `t` is; the host's value may carry decimals |
| `X-RateLimit-Reset` | none among `r`, `t`, `pk` | no equivalence: an absolute epoch is not a delay, so it is not `t` |
| `X-RateLimit-Bucket` | `pk` | analogue only: a partition key names the shared limit, but the draft's `pk` is a byte-sequence value (S116) and this host's value is a host-assigned string |
| `X-RateLimit-Global`, `X-RateLimit-Scope` | none | 429-only qualifiers; the draft has no field that carries "global" or "shared" |
| `Retry-After`, body `retry_after` | none in these two fields | the retry delay is not one of the draft's rate-limit fields; the page tells the client to read it from either place |

So the draft gives a journey the field vocabulary, and this host gives it the concrete header
names; neither is a substitute for the other, and an entry or receipt must not relabel the
host's absolute `Reset` as the draft's `t`.

## 7. Limits of this entry

- **Documented, not measured.** No Discord API response was produced, captured or observed by
  this lane. The header values in the example block are the page's illustrations, not this
  lane's observations.
- **One host, one page.** This says nothing about how any other host spells its rate-limit
  signal, and nothing about a host that publishes none.
- **The page is rolling.** It carries no version marker or commit; the 90-day recheck is the
  only guard, and a recheck must re-derive both the quote and the normalised bytes.
- **Optional headers.** A missing header is absence of a signal, not evidence of a generous
  budget; the page says the headers are optional.
- **The host's own caveat.** For the emoji-control routes the host states its returned quota
  may be inaccurate, so a header reading is never proof of the true remaining budget, even
  where the header is present.
- **The invalidity cap is documented, not modelled.** The 10,000 per 10 minutes figure is a
  statement on the page at fetch time; this lane does not measure it and does not claim when
  the restriction begins.

---

**Adopted from** `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md`,
staged source id S182, adopted as lane row S117. Kept: the header set and meanings, the 429
body shape, the global-limit figure, and the judgement that the host's budget headers can be
inaccurate. Corrected: the per-guild caveat is scoped to the emoji-control routes, as §2
records. Added here: the shape-only capture rules (§5), the mapping and its non-equivalences
(§6), and the explicit limits (§7). Dropped: the package row's round provenance and its
wave-1/wave-3 framing.

## Errata — round 30 wave 2 (2026-10-26; append-only; `.ufo/waves/round-30/w2/RefetchLiveS117.md` F1–F2)

- **Invalid-request limit carve-out (F1).** The same passage of the page states that 429 responses carrying
  `X-RateLimit-Scope: shared` are not counted against the invalid-request limit; a receipt that tallies 401/403/429
  outcomes toward that limit must exclude shared-scope 429s.
- **Receipt quote scope (F2).** The S117 receipt and Gate quote begin mid-sentence (`limited on a per-guild basis …`);
  the subject and scope — the emoji-control routes — are in the full passage quoted in §2, which is the reading this
  entry uses.
