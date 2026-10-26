# FetchS182 — C2 source fetch, S117 (Discord "Rate Limits")

**Verdict.** The staged row S182 (`host-rate-limit-header-set-r16.md`) is grounded: the page it cites,
`https://docs.discord.com/developers/topics/rate-limits`, answered HTTP 200 today with 408,912 bytes twice and again
through the legacy `discord.com/developers/docs/...` URL (301 → the same final URL, 1 redirect), and all three
byte-sets — plus a fourth fetched independently by ScribeEntryDiscordHeaders — normalise to the identical text
(8,728 chars, sha256 `c719ecca…4007`) under the frozen counter's own `normalise()`. The receipt is written:
`corpus/evidence/round-30/frontier/S117.json` with committed bytes
`corpus/evidence/round-30/frontier/bytes/S117.html` (sha256 `b73dc7d1…83c3`) and a 25-word quote that is contiguous
in the normalised text and carries the row's one non-header fact (per-guild scope + the 429 caveat). The row's
*facts* hold, but its *generalisations* do not: the page scopes "the quota returned by our APIs may be inaccurate"
to **emoji-control routes only**, never says one caller of a route is throttled while another is not, documents two
more headers than the row lists (`X-RateLimit-Global`, `X-RateLimit-Scope`), and gives the 429 JSON body
(`message`/`retry_after`/`global`/`code`) that the row omits — so the row must be corrected when it is re-pointed to
S117, or the entry will assert more than the publisher says.

## 1. Fetches (read-only HTTPS GET; no credentials, cookies or API calls)

| # | URL requested | UTC | HTTP | bytes | redirects | url_effective | raw sha256 | curl exit |
|---|---|---|---|---|---|---|---|---|
| 1 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:02Z | 200 | 408912 | 0 | https://docs.discord.com/developers/topics/rate-limits | `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` | 0 |
| 2 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:02Z | 200 | 408912 | 0 | https://docs.discord.com/developers/topics/rate-limits | `d03e9e964e31168a3d7c491de87d2ede763ecc117b571e446b3cb64d3dcf2d3d` | 0 |
| 3 | https://discord.com/developers/docs/topics/rate-limits (legacy) | 2026-10-26T06:40:02Z | 200 | 408912 | 1 | https://docs.discord.com/developers/topics/rate-limits | `694f02b2f1e2842a95e1f5e61c79043d0d60d6323022a823f1988022f9b86a8e` | 0 |

```
$ curl -sSL --max-time 60 -o discord-1.html -w '%{http_code} %{url_effective} %{size_download} %{num_redirects}\n' https://docs.discord.com/developers/topics/rate-limits
200 https://docs.discord.com/developers/topics/rate-limits 408912 0          # exit 0
$ curl -sSL --max-time 60 -o discord-2.html  -w '... same -w format ...' https://docs.discord.com/developers/topics/rate-limits
200 https://docs.discord.com/developers/topics/rate-limits 408912 0          # exit 0
$ curl -sSL --max-time 60 -o legacy.html     -w '... same -w format ...' https://discord.com/developers/docs/topics/rate-limits
200 https://docs.discord.com/developers/topics/rate-limits 408912 1          # exit 0, 1 redirect
```

The page is a server-rendered Mintlify/Next document, so raw bytes carry per-request build ids and nonces: the three
raw sha256s differ, the byte count and the rendered text do not.

## 2. Normalisation — the counter's own function, not a reimplementation

`normalise()` + `ENTITIES` were sliced verbatim from
`scripts/check-frontier-admission.mjs` at `061e62024c0523d3c6c7e819506a773ff2cd7d75` (span `const ENTITIES =` …
`const collapse =`, `export ` stripped for `new Function`; extracted snippet sha256
`7b7d730c43904c8998ffa22480a8c683ac895bdba1e2fc720d618c35d8283108`, 831 chars). The module itself cannot be
imported for this: it calls `main()` at load and exits 2 on unknown argv (observed: `FRONTIER_ADMISSION
verdict=could-not-evaluate detail=unknown argument: discord-1.html`, exit 2).

```
$ node norm.mjs discord-1.html discord-2.html legacy.html          # exit 0
equal_norm_fetch1_vs_fetch2: true
equal_norm_fetch1_vs_legacy: true
```

| fetch | raw bytes | raw sha256 | normalised chars | normalised bytes | normalised sha256 |
|---|---|---|---|---|---|
| discord-1.html | 408912 | b73dc7d1…83c3 | 8728 | 8752 | `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` |
| discord-2.html | 408912 | d03e9e96…2d3d | 8728 | 8752 | `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` |
| legacy.html | 408912 | 694f02b2…6a8e | 8728 | 8752 | `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` |

ScribeEntryDiscordHeaders fetched independently at 2026-10-26T06:40:32Z (raw sha256 `c1c2d3f9…4b2f3`) and reports the
same normalised length and sha256, so four independent byte-sets normalise identically.

## 3. Receipt (deliverable)

`S117.json` — sha256 `37f09c3dec768fe7bd5ff649b606baaf2d38f5cb705a8aeb66033f0cd7087b34`:

```json
{
  "id": "S117",
  "url": "https://docs.discord.com/developers/topics/rate-limits",
  "fetched_at": "2026-10-26T06:40:02Z",
  "fetched_by": "FetchS182",
  "http_status": 200,
  "bytes_path": "corpus/evidence/round-30/frontier/bytes/S117.html",
  "sha256": "b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3",
  "quote": "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s."
}
```

Bytes: `bytes/S117.html`, 408,912 bytes, sha256 `b73dc7d1…83c3` (fetch #1, byte-exact). Quote: 25 words — at the
counter's 1..25 cap (`g4-quote-length` fails only on `n > 25`); verified contiguous in all three normalised texts
(`located: true` ×3, exit 0). The independent refetch seat is ScribeEntryDiscordHeaders (≠ `fetched_by`), which commits
its **own** bytes; agreed over IRC that neither of us points the refetch at the other's byte file.

`g2-url` holds against the staged row's source cell
(`Rate Limits — Discord Developer Documentation — https://docs.discord.com/developers/topics/rate-limits`). Its teaches
cell opens "A host discloses its budget in `X-RateLimit-Limit`" and continues "and some routes are limited per guild"
so that the row's caveat "you may encounter 429s" is the source span (three contiguous spans, 7, 8 and 4 words, all
verbatim in the row); that quoted span (17 words) is a suffix of my 25-word quote, so the lesson line and entry quote
keep matching.

## 4. The header list the page documents (verbatim glosses)

Under *Header Format*: "For most API requests made, we return optional HTTP response headers containing the rate
limit encountered during your request." Then, in order:

| Header | Meaning (page's own gloss) |
|---|---|
| `X-RateLimit-Limit` | "The number of requests that can be made" |
| `X-RateLimit-Remaining` | "The number of remaining requests that can be made" |
| `X-RateLimit-Reset` | "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets" |
| `X-RateLimit-Reset-After` | "Total time (in seconds) of when the current rate limit bucket will reset." — and "Can have decimals to match previous millisecond ratelimit precision" |
| `X-RateLimit-Bucket` | "A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)" |
| `X-RateLimit-Global` | "Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)" |
| `X-RateLimit-Scope` | "Returned only on HTTP 429 responses. Value can be user (per bot or user limit), global (per bot or user global limit), or shared" |

Seven headers, two of them 429-only. The page's own example block prints
`X-RateLimit-Limit: 5 / -Remaining: 0 / -Reset: 1470173023 / -Reset-After: 1 / -Bucket: abcd1234`. `Retry-After` is
not in that table but appears in every 429 example and in the instruction: "Your application should rely on the
Retry-After header or retry_after field to determine when to retry the request."

Bucket semantics: "In some cases, per-route limits will be shared across a set of similar endpoints, indicated in the
X-RateLimit-Bucket header." and "It’s recommended to use this header as a unique identifier for a rate limit"
(Q27). Per-route identity: "This means that an endpoint with two different top-level resources may calculate limits
independently." with "Top-level resources are currently limited to channels ( channel_id ), guilds ( guild_id ), and
webhooks ( webhook_id or webhook_id + webhook_token )."

## 5. 429 response body fields

"In the case that a rate limit is exceeded, the API will return a HTTP 429 response code with a JSON body." Fields:

| Field | Type | Meaning (page's gloss) |
|---|---|---|
| `message` | string | "A message saying you are being rate limited." |
| `retry_after` | float | "The number of seconds to wait before submitting another request." |
| `global` | boolean | "A value indicating if you are being globally rate limited or not" |
| `code` | integer, optional | "An error code for some limits" |

Plus: "Note that normal route rate-limiting headers will also be sent in this response." Three worked examples
(user 429 with `X-RateLimit-Scope: user`, resource 429 with `X-RateLimit-Scope: shared`, global 429 with
`X-RateLimit-Global: true` + `X-RateLimit-Scope: global`) show how the body and headers combine.

## 6. Global limit and invalid-request limit

- Global: "All bots can make up to 50 requests per second to our API." — "If no authorization header is provided,
  then the limit is applied to the IP address." — "This is independent of any individual rate limit on a route." —
  "Interaction endpoints are not bound to the bot’s Global Rate Limit." Bans: "If your bot gets temporarily
  Cloudflare banned from the Discord API every once in a while" it is "most likely not a global rate limit issue";
  increased limits go through https://dis.gd/rate-limit.
- Invalid request ("aka Cloudflare bans"): "IP addresses that make too many invalid HTTP requests are automatically
  and temporarily restricted from accessing the Discord API." — "Currently, this limit is 10,000 per 10 minutes" —
  "An invalid request is one that results in 401 , 403 , or 429 statuses. All applications should make reasonable
  attempts" — "429 errors returned with X-RateLimit-Scope: shared are not counted against you." — "Large
  applications, especially those that can potentially make 10,000 requests per 10 minutes (a sustained 16 to 17
  requests per second), should consider logging".

## 7. What the staged row asserts that the page does not support — or leaves out

Row: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md`
(read-only). Row quotations below are whitespace-collapsed substrings of that file; page quotations are substrings of
the normalised fetch. Every quoted span in this report is ≤25 words and was checked mechanically: 42 page spans
(`quotes.json`, `quote-check.txt`, `failures=0`) and 11 row spans (`row-check.txt`, `failures=0`).

1. **Over-generalised caveat (unsupported as written).** Row: "the host states plainly that its own budget headers
   can be inaccurate", and it draws from that the lane-wide conclusion that asserting a rate limit from a header
   alone is unsafe because "the publisher says the same". But the page scopes that caveat to emoji routes: "Routes for controlling
   emojis do not follow the normal rate limit conventions." + "These routes are specifically limited on a per-guild
   basis to prevent abuse." + "This means that the quota returned by our APIs may be inaccurate, and you may
   encounter 429s." "These routes" = emoji-control routes. The page never says ordinary `X-RateLimit-*` values are
   inaccurate. What it *does* say generally is "Because rate limits depend on a variety of factors and are subject
   to change" and "Instead, your app should parse response headers to prevent hitting the limit" — a
   don't-hard-code rule, not an accuracy disclaimer.
2. **Per-caller variance (unsupported).** Row: "some routes are limited per guild, so the same route can be throttled
   for one caller and not another". The page supports per-guild scope for emoji routes, but its independence example
   is about two *resources* for one caller: "if you exceeded a rate limit when calling one endpoint /channels/1234 ,
   you could still call another similar endpoint like /channels/9876 without a problem". No sentence says one caller
   of one route is throttled while another is not. (The page's own per-resource scope word is `shared`: "per
   resource limit".)
3. **Incomplete header set (omission).** Row: "This row adds a second real host's set, published in the same shape a
   lane would meet it on the wire: `X-RateLimit-Limit: 5`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (epoch
   seconds), `X-RateLimit-Reset-After` (a delta) and `X-RateLimit-Bucket` (the bucket identity)" — five headers. The
   page documents seven, and the two it drops — `X-RateLimit-Global` and `X-RateLimit-Scope`, both 429-only — are
   exactly the ones that tell a journey **why** the 429 happened (global vs per-route vs shared). Dropping them makes
   the row's reading of "the signal set a real host returns, as opposed to the status code alone" weaker than the
   source.
4. **No 429 body (omission).** The page's 429 JSON (`message`, `retry_after` float, `global` bool, `code`) and the
   "rely on the Retry-After header or retry_after field" instruction are absent from the row, although the row's
   subject is "the signal set a real host returns".
5. **`X-RateLimit-Reset` gloss too narrow.** Row: "`X-RateLimit-Reset` (epoch seconds)". The page says epoch time in
   seconds *since 1970*, and every one of its three 429 examples prints a fractional value
   (`X-RateLimit-Reset: 1470173023.123`); decimals are called out for `Reset-After` ("Can have decimals to match
   previous millisecond ratelimit precision"). A journey that parses "epoch seconds" as an integer truncates.
6. **Example value presented as the host's budget.** Row prints "`X-RateLimit-Limit: 5`" inside the prose about "the
   same shape a lane would meet it on the wire". `5` is the page's *illustrative* header-example line; the same page's
   429 examples use `X-RateLimit-Limit: 10`. It is not the host's quota.
7. **"Discloses its budget" is stronger than the page (omission).** The row's teaches cell says "A host discloses its
   budget in `X-RateLimit-Limit`", but the page's headers are "optional", returned "For most API requests made", and
   its only concrete budget numbers are prose (50 rps global; 10,000 invalid requests per 10 minutes) — neither
   appears in a header. The row's framing implies a guaranteed, numeric disclosure.
8. **Anchor slightly off (minor).** Row anchor: §"Rate Limits" (the header table and the per-guild exception). The
   page's section list is Header Format / Exceeding A Rate Limit / Global Rate Limit / Invalid Request Limit; the
   per-guild emoji exception is prose in the per-route introduction, before *Header Format*, not inside it. The
   header table itself is under *Header Format*, correctly cited.
9. **Recheck status.** Row: fetched 2026-10-23, "recheck: 90d (vendor documentation pages change without a version
   marker) (not run in this round)". The 2026-10-26 fetch still contains every cited sentence, so the reading holds
   today; the row's own 2026-10-23 bytes are not in the package, so the older snapshot cannot be compared
   byte-for-byte.

Everything the row *quotes* is real: the 17-word caveat and the per-guild sentence both appear verbatim, so this is
over-generalisation and omission, not fabrication.

## 8. Checks run (all in scratch; nothing run against the lane checkout)

| Command | Exit | Output |
|---|---|---|
| `curl -sSL … -w '%{http_code} %{url_effective} %{size_download} %{num_redirects}'` ×3 | 0 | 200 / 200 / 200, 408912 bytes each |
| `node norm.mjs discord-1.html discord-2.html legacy.html` | 0 | both equality flags `true`; normalised 8728 chars, sha `c719ecca…4007` ×3 |
| `node mk.mjs` (quote build + locate) | 0 | `words: 25`, `located: true` ×3, `allNormEqual: true` |
| `node quotes.mjs` (42 page quotes) | 0 | 42 × `OK`, `failures=0` |
| `python3 rowcheck.py` (11 row quotes) | 0 | 11 × `OK`, `failures=0` |
| `git clone --shared …tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 061e620…` | 0 | `rev-parse HEAD` = `061e62024c0523d3c6c7e819506a773ff2cd7d75`; toplevel = `$S/clone` |
| `git apply --check S117.patch` on the pristine clone at 061e620… (`status --porcelain` empty) | 0 | the patch applies forward to the frozen tree |
| `git -C "$S/clone" diff --src-prefix=a/ --dst-prefix=b/ 061e620… > S117.patch`; `git apply --check --reverse` | 0 | 2 file diffs, 411,146 bytes, patch sha256 `9801b522b4663068a67c2ef4f25b83f87c38546f485656bb52a614daa0e1ddc1`, reverse-check clean |

**Not run, deliberately:** `node scripts/check-frontier-admission.mjs …` — it evaluates the tagged *entry* and the
*lesson* line as well, which are other seats' deliverables this wave; running it now would measure their absence, not
my receipt. The L1 runs it after integration (predicate: population 2 / admitted 2 with `--live`).

No tools installed or upgraded (nothing needed).

## 9. Files for the L1 to land (patch `S117.patch`)

| Path (lane-relative) | sha256 | Note |
|---|---|---|
| `corpus/evidence/round-30/frontier/S117.json` | `37f09c3dec768fe7bd5ff649b606baaf2d38f5cb705a8aeb66033f0cd7087b34` | receipt, `fetched_by` FetchS182 |
| `corpus/evidence/round-30/frontier/bytes/S117.html` | `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` | 408,912 bytes, fetch #1 |

Patch: `S117.patch`, 411,146 bytes, sha256 `9801b522b4663068a67c2ef4f25b83f87c38546f485656bb52a614daa0e1ddc1`; adds only
those two files (no `corpus/SOURCES.md` row, no `corpus/knowledge` entry, no `refetch/` — those are
ScribeEntryDiscordHeaders' patch, paths disjoint) and applies forward to a pristine checkout of
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`git apply --check`, exit 0).

Wave-dir artifacts (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/FetchS182/`): `S117.json`,
`bytes/S117.html`, `bytes/S117.normalised.txt` (sha `c719ecca…4007`), `S117.patch`, `fetch-log.md`, `quotes.json`,
`quote-check.txt`, `row-check.txt`, and the scripts that produced each number (`norm.mjs`, `mk.mjs`, `quotes.mjs`,
`rowcheck.py`).

**Risks / blockers.** (a) Raw sha256 differs per fetch by design (build ids/nonces); any verifier comparing the
*raw* digest of a refetch to mine will see a mismatch — compare normalised text instead, as `l3-live-bytes` does.
(b) The 25-word quote sits exactly at the counter cap; re-count if it is ever edited (`> 25` → `g4-quote-length`).
(c) The row correction in §7 is curation for another seat: if the entry keeps the generalised caveat or the
"one caller and not another" claim, `q1-entry-quote` may still pass (both spans are on the page) while the entry
asserts more than the source — a correctness risk the counter cannot see.
