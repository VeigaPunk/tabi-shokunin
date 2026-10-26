# ConnApprovalTable — independent fetch receipts (2026-10-26)

Seat: ConnApprovalTable (leaf). Independent read-only HTTPS GETs, made to ground the
cross-source mapping. No logins, cookies, credentials, or API calls; no consequential
actions. Bytes copied verbatim under `bytes/`.

| # | URL | UTC fetched | HTTP status | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T07:04:10Z | 200 (HTTP/2) | 67097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| 2 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T07:04:10Z | 200 (HTTP/2) | 408912 | `015d1f5e5131397bd43153ca0291c64efd7f83ea132a103227590c5d2b8fe971` |

Commands:

```
date -u +%Y-%m-%dT%H:%M:%SZ > fetch1.time
curl -sS -L -D fetch1.headers -o fetch1.txt \
  -w 'http %{http_code} bytes %{size_download} url %{url_effective}\n' \
  https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
# exit 0 → http 200 bytes 67097 url https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
sha256sum fetch1.txt   # d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412

date -u +%Y-%m-%dT%H:%M:%SZ > fetch2.time
curl -sS -L -D fetch2.headers -o fetch2.html \
  -w 'http %{http_code} bytes %{size_download} url %{url_effective}\n' \
  https://docs.discord.com/developers/topics/rate-limits
# exit 0 → http 200 bytes 408912 url https://docs.discord.com/developers/topics/rate-limits
sha256sum fetch2.html   # 015d1f5e5131397bd43153ca0291c64efd7f83ea132a103227590c5d2b8fe971
```

Relationship to committed frontier bytes:

- Fetch 1 is **byte-identical** to the committed `corpus/evidence/round-30/frontier/bytes/S116.txt`
  (same sha256 `d6016dd0…d412`), which is the `-11` revision the S116 entry re-pinned to.
- Fetch 2 differs byte-wise from the committed `S117.html` (`b73dc7d1…3c3` — dynamic page,
  same 408912 byte size) but the quoted spans below are present verbatim in **both** byte sets
  (normalised-text identical, consistent with the lesson's "raw bytes differ per response,
  normalised text identical") and in the fetch-2 bytes.

Quote-location proof on fetch-1 bytes (line refs are `-11` numbering):

- `:308-311` — "The field value SHOULD remain consistent over a sequence of HTTP responses.
  It is this characteristic that differentiates it from the RateLimit (Section 4) field that
  contains information that MAY change on every request."
- `:323` — `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400`
- `:341-352` — `q` REQUIRED (quota allocated, in quota units), `qu` OPTIONAL (quota units,
  default "requests"), `w` OPTIONAL (time window), `pk` OPTIONAL (partition key, MUST be a Byte
  Sequence).
- `:461-471` — `r` REQUIRED ("conveys the available quota under the identified policy"),
  `t` OPTIONAL ("conveys the effective window … the time within which the client can use no
  more than the available quota"), `pk` OPTIONAL.
- `:483-484` — "clients MUST NOT assume that a positive available quota is a guarantee that
  further requests will be served."
- `:488` — section head "4.1.2. Effective Window Parameter" (i.e. `t` is the effective window in
  `-11`, not the Reset Parameter of `-10`).
- `:679-682` — "Servers are not required to return RateLimit header fields in every response".
- `:712` — "Malformed RateLimit header fields MUST be ignored."
- `:732-734` — "If a response contains both the RateLimit and Retry-After fields, the
  Retry-After field MUST take precedence and the effective window MAY be ignored."
- `grep -in "epoch" fetch1.txt` → no matches: the draft `-11` has no absolute/epoch reset
  member anywhere.

Quote-location proof on fetch-2 bytes (HTML; spans quoted with markup stripped, normalised):

- "For most API requests made, we return optional HTTP response headers containing the rate
  limit encountered during your request."
- `X-RateLimit-Limit` — "The number of requests that can be made"
- `X-RateLimit-Remaining` — "The number of remaining requests that can be made"
- `X-RateLimit-Reset` — "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which
  the rate limit resets"
- `X-RateLimit-Reset-After` — "Total time (in seconds) of when the current rate limit bucket
  will reset. Can have decimals to match previous millisecond ratelimit precision"
- `X-RateLimit-Bucket` — "A unique string denoting the rate limit being encountered
  (non-inclusive of top-level resources in the path)"
- `X-RateLimit-Global` — "Returned only on HTTP 429 responses if the rate limit encountered is
  the global rate limit (not per-route)"
- `X-RateLimit-Scope` — "Returned only on HTTP 429 responses. Value can be user (per bot or
  user limit), global (per bot or user global limit), or shared (per resource limit)"
- Per-guild exception — "limited on a per-guild basis to prevent abuse. This means that the
  quota returned by our APIs may be inaccurate, and you may encounter 429s."
- Failure shape — "In the case that a rate limit is exceeded, the API will return a HTTP 429
  response code with a JSON body. Your application should rely on the Retry-After header or
  retry_after field to determine when to retry the request."
- Global limit — "All bots can make up to 50 requests per second to our API."
- Invalid request limit — "10,000 requests per 10 minutes (a sustained 16 to 17 requests per
  second)"

Header example block present in both byte sets: `X-RateLimit-Limit: 5` / `-Remaining: 0` /
`-Reset: 1470173023` / `-Reset-After: 1` / `-Bucket: abcd1234`.
