# S117 fetch log

URL for every fetch below: `https://docs.discord.com/developers/topics/rate-limits`
(effective URL; the legacy `https://discord.com/developers/docs/topics/rate-limits` 301s to it —
recorded by FetchS182, not re-tested here).

Fetches performed by this seat:

| UTC | channel | HTTP | bytes | sha256 | stored at |
|---|---|---|---|---|---|
| 2026-10-26T06:40:32Z | curl -sS -L --max-time 90 | 200 | 408912 | `c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3` | `bytes/S117-refetch.html` (proposed lane path `corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html`) |
| 2026-10-26T06:46:37Z | curl -sS -L --max-time 90 | 200 | 408912 | `da0720c1c2b8ed367e939fab78793e2b0a7929ec69d16fde9315799b47390ba9` | `fetch/live-verify.html` (local only; used for the live column of the quote table) |

Command actually run for each: `curl -sS -L --max-time 90 -o <path> -w 'HTTP %{http_code} bytes %{size_download}\n' <url>`
with `date -u` printed immediately before and after; exit 0, HTTP 200, 408912 bytes both times.

Fetches by other seats, recorded from their receipts/artifacts (not performed by me):

| seat | UTC | HTTP | bytes | sha256 | where |
|---|---|---|---|---|---|
| FetchS182 | 2026-10-26T06:40:02Z | 200 | 408912 | `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` | `corpus/evidence/round-30/frontier/bytes/S117.html` (their patch `S117.patch`) |
| FetchS182 (second, not committed) | 2026-10-26T06:40:02Z | 200 | 408912 | `d03e9e964e31168a3d7c491de87d2ede763ecc117b571e446b3cb64d3dcf2d3d` | reported by them; per-response nonces only |
| ScribeQuoteGrounding | 2026-10-26T06:41:18Z | 200 | 408912 | `213fb2fa87f26de7bcd21980d445e193899337c26cf87053c386566954184aa9` | their output dir `.ufo/waves/round-30/w1/ScribeQuoteGrounding/refetch-discord/rate-limits.fetchA.html` |
| ScribeQuoteGrounding | 2026-10-26T06:42:50Z | 200 | 408912 | `0d9aea2c49de3959d2ac66bdbb0b484f2da9de7b63e6dea1e9c6c289917352f6` | their output dir `…/refetch-discord/rate-limits.html` |

Normalisation result for every set above: 8728 characters, sha256
`c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007`. Raw-byte differences are
inside `<script>` (Cloudflare `window.__CF$cv$params` and build ids) and are removed by
`normalise()`; no text difference was found.

Network scope: read-only HTTPS GET of a public documentation page. No login, cookie, credential,
API call or session material was sent; no consequential action on the site. Header-only default
User-Agent from curl.
