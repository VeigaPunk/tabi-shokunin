# S117 quote table — Discord Rate Limits page

Entry: `corpus/knowledge/host-published-rate-limit-headers.md` (proposed patch `patch-S117.diff`)
Row: S117 in `corpus/SOURCES.md`
Page: https://docs.discord.com/developers/topics/rate-limits
Normalisation: `normalise()` copied verbatim from the frozen counter
`scripts/check-frontier-admission.mjs` (sha256 `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`,
matching `claims.json` `frozenDigests`). HTML is stripped of script/style and tags, entities decoded,
whitespace collapsed; no other transformation.

Three independent byte sets, all normalising to the same 8728-character body with
sha256 `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007`:

| set | who fetched | UTC | HTTP | raw bytes | raw sha256 |
|---|---|---|---|---|---|
| receipt | FetchS182 | 2026-10-26T06:40:02Z | 200 | 408912 | `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` |
| refetch | ScribeEntryDiscordHeaders | 2026-10-26T06:40:32Z | 200 | 408912 | `c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3` |
| live verify | ScribeEntryDiscordHeaders | 2026-10-26T06:46:37Z | 200 | 408912 | `da0720c1c2b8ed367e939fab78793e2b0a7929ec69d16fde9315799b47390ba9` |

Raw bytes differ per response (Cloudflare nonce and build ids inside `<script>`); the normalised
body is byte-identical across all three, which is what `l3-live-bytes` compares. Two further
fetches by ScribeQuoteGrounding (`213fb2fa…` at 06:41:18Z, `0d9aea2c…` at 06:42:50Z, 408912 bytes
each) normalise identically and live only in that seat's output dir as corroboration.

Every double-quoted span of 4+ words in the entry body was extracted with the counter's own
`entryQuotes()` and tested with `String.includes` against each normalised set. All 15 locate in all
three; the receipt quote is row 15 and is 25 words (the counter's cap is 1..25, and it fails only on
`n > 25`).

| # | quote | words | location on page | receipt bytes | refetch bytes | live verify |
|---|---|---|---|---|---|---|
| 1 | "For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request." | 19 | §Header Format, first paragraph | yes | yes | yes |
| 2 | "The number of requests that can be made" | 8 | §Header Format, per-header list (`X-RateLimit-Limit`) | yes | yes | yes |
| 3 | "The number of remaining requests that can be made" | 9 | §Header Format, per-header list (`X-RateLimit-Remaining`) | yes | yes | yes |
| 4 | "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets" | 16 | §Header Format, per-header list (`X-RateLimit-Reset`) | yes | yes | yes |
| 5 | "Total time (in seconds) of when the current rate limit bucket will reset." | 13 | §Header Format, per-header list (`X-RateLimit-Reset-After`) | yes | yes | yes |
| 6 | "A unique string denoting the rate limit being encountered (non-inclusive of top-level resources in the path)" | 16 | §Header Format, per-header list (`X-RateLimit-Bucket`) | yes | yes | yes |
| 7 | "Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)" | 18 | §Header Format, per-header list (`X-RateLimit-Global`) | yes | yes | yes |
| 8 | "Value can be user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)" | 21 | §Header Format, per-header list (`X-RateLimit-Scope`) | yes | yes | yes |
| 9 | "Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s." | 41 | paragraph before §Header Format (per-guild exception) | yes | yes | yes |
| 10 | "In the case that a rate limit is exceeded, the API will return a HTTP 429 response code with a JSON body." | 22 | §Exceeding A Rate Limit, first paragraph | yes | yes | yes |
| 11 | "Your application should rely on the Retry-After header or retry_after field to determine when to retry the request." | 18 | §Exceeding A Rate Limit, retry guidance | yes | yes | yes |
| 12 | "Note that normal route rate-limiting headers will also be sent in this response." | 13 | §Exceeding A Rate Limit, after the body table | yes | yes | yes |
| 13 | "All bots can make up to 50 requests per second to our API." | 13 | §Global Rate Limit, first paragraph | yes | yes | yes |
| 14 | "Interaction endpoints are not bound to the bot’s Global Rate Limit." | 11 | §Global Rate Limit, last paragraph | yes | yes | yes |
| 15 | "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s." | 25 | receipt/refetch/lesson quote; substring of row 9 | yes | yes | yes |

Reproduce:

```sh
S=/fast/scratch/hyaku/tabi-r30/ScribeEntryDiscordHeaders
cd "$S" && node quotetable.mjs        # prints this table and "bad 0"
node q1.mjs out/host-published-rate-limit-headers.md out/bytes/S117-refetch.html
```

`quotetable.mjs` exits 0 with `rows 15 bad 0`; `q1.mjs` prints every quote with `OK` and
`MISSING 0`. Neither script writes to the lane.
