# Proposed `corpus/SOURCES.md` registry row for S116 — for the registry/connector seat to apply

Idiomatic to the S104-S107 rows (11 cells; `g2-url` requires the receipt url to appear
verbatim in the `source` cell, so the url is plain, not a markdown link):

| S116 | IETF HTTPAPI — RateLimit header fields for HTTP, draft-ietf-httpapi-ratelimit-headers-11 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | spec | A | The two quota response fields a journey record classifies a rate-limit signal against: the published policy (`RateLimit-Policy`: `q`/`qu`/`w`/`pk`) and the per-request service limit (`RateLimit`: `r`/`t`/`pk`); scope bound to the sections cited, not the whole draft | draft-11 fetched 2026-10-26, 67097 bytes, sha256 d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412; §3 stability sentence at lines 308-309; §3 contrast sentence at 309-311; §4.1 `r`/`t` at 461-465; §6 status-independence at 623-624; §7 `Retry-After` precedence at 733-735; §6.2 absent-by-default at 679-680; FAQ item 3 (429 is an example) at 1633-1635; same payload syntax with a changed `t` semantic in draft-10 (67803 bytes, sha256 f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5) and the package's draft-09 anchor (67876 bytes, sha256 e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee) still served | A receipt can say which kind of quota signal it saw — published policy, per-request budget, status code, or `Retry-After` — instead of lumping every refusal under rate limited; neither field is a throttle verdict and neither is guaranteed to be present | mined | 2026-10-26 | 180d | corpus/knowledge/rate-limit-policy-fields.md |

## Placement note for the receipt

`corpus/evidence/round-30/frontier/S116.json` as delivered (`receipt-s116.json`) has
`bytes_path` = `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/bytes/ratelimit-headers-11.txt`.
If the bytes are relocated to `corpus/evidence/round-30/frontier/bytes/S116.txt`, update
`bytes_path` to match — the sha256 does not change (d6016dd0…).

`g7-refetch` needs `corpus/evidence/round-30/frontier/refetch/S116.json` written by a
**different seat** (`refetch/<id>.json` `seat` must differ from the receipt's
`fetched_by`), with its own committed bytes and the same quote. This seat cannot supply it.

`g6-gate` needs the receipt quote to appear in `corpus/lessons/round-30.md`; the delivered
quote is `The field value SHOULD remain consistent over a sequence of HTTP responses.`
