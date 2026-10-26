# S117 fetch log — Discord developer docs "Rate Limits"

Seat: FetchS182. All fetches read-only HTTPS GETs, no credentials, no cookies, no API calls.
Scratch: /fast/scratch/hyaku/tabi-r30/FetchS182 (TMPDIR there). Page is a Mintlify/Next server-rendered
document: raw bytes carry per-request build ids and nonces, so raw sha256 differs per request while the
rendered text does not.

| # | URL requested | UTC | HTTP | bytes | num_redirects | url_effective | sha256 (raw) | curl exit |
|---|---|---|---|---|---|---|---|---|
| 1 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:02Z | 200 | 408912 | 0 | https://docs.discord.com/developers/topics/rate-limits | b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3 | 0 |
| 2 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:02Z | 200 | 408912 | 0 | https://docs.discord.com/developers/topics/rate-limits | d03e9e964e31168a3d7c491de87d2ede763ecc117b571e446b3cb64d3dcf2d3d | 0 |
| 3 | https://discord.com/developers/docs/topics/rate-limits | 2026-10-26T06:40:02Z | 200 | 408912 | 1 | https://docs.discord.com/developers/topics/rate-limits | 694f02b2f1e2842a95e1f5e61c79043d0d60d6323022a823f1988022f9b86a8e | 0 |

Commands (identical shape for #1/#2; #3 uses the legacy host):

    curl -sSL --max-time 60 -o discord-N.html -w '%{http_code} %{url_effective} %{size_download} %{num_redirects}\n' <URL>   # exit 0

The legacy URL `https://discord.com/developers/docs/topics/rate-limits` answers 301 and lands on the same
`https://docs.discord.com/developers/topics/rate-limits` (1 redirect, identical byte count).

## Normalisation (frozen counter's function, not a reimplementation)

`normalise()` and the `ENTITIES` table were sliced verbatim out of
`scripts/check-frontier-admission.mjs` at 061e62024c0523d3c6c7e819506a773ff2cd7d75` (snippet between
`const ENTITIES =` and `const collapse =`, `export ` stripped for `new Function`, extracted snippet
sha256 7b7d730c43904c8998ffa22480a8c683ac895bdba1e2fc720d618c35d8283108, 831 chars). The module itself
cannot be imported for this purpose: it calls `main()` at load and exits 2 on unknown argv.

| fetch | raw bytes | raw sha256 | normalised chars | normalised bytes | normalised sha256 |
|---|---|---|---|---|---|
| discord-1.html | 408912 | b73dc7d1…83c3 | 8728 | 8752 | c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007 |
| discord-2.html | 408912 | d03e9e96…2d3d | 8728 | 8752 | c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007 |
| legacy.html | 408912 | 694f02b2…6a8e | 8728 | 8752 | c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007 |

`equal_norm_fetch1_vs_fetch2: true`; `equal_norm_fetch1_vs_legacy: true` (exit 0).

## Quote

`limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.`

25 words (counter cap is 1..25, fails only on n > 25). Located (substring of normalised text) in all three
fetches: `located: true` ×3, exit 0. Independent seat check: ScribeEntryDiscordHeaders fetched the page
independently at 2026-10-26T06:40:32Z with raw sha256 c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3
and reported the same normalised length and sha256 (8728 / c719ecca…4007), i.e. a fourth independent byte set
normalises identically. Its refetch bytes are its own, never mine.
