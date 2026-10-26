# Fetch receipts — CritC2Counter, round 30 w1

Read-only HTTPS GETs of public documentation/spec pages performed by this seat.
No logins, cookies, credentials or session material; no rate-limited API calls.
`curl -sS -L --max-time 60`; byte count `wc -c`; sha256 of the saved file.

| # | URL | UTC time | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:41:36Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 2 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | 2026-10-26T06:41:36Z | 200 | 67803 | f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5 |
| 3 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:41:36Z | 200 | 408912 | 53e3601825d5c13aaaa0973402543102a691845d97baa211e21da7de168e2e9e |
| 4 | https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T06:41:36Z | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |

Extra probes (no body retained):

- `curl -sSI https://www.ietf.org/rfc/rfc6585.txt` → `HTTP/2 301`, `location: https://www.rfc-editor.org/rfc/rfc6585.txt`
  (cross-host redirect used by attack A12).
- `curl -sS -L -o /dev/null -w '%{http_code}' file:///…/fx/S116.txt` → `000`
  (the code path `fetchLive` accepts for `file://` urls).

The counter's own `--live` fetches (inside `evaluate`) are not separately recorded here;
their outcome is visible in the committed raw JSON under `evidence/raw/` (`l1-live` /
`l3-live-bytes` / clean) and in the `honest` netns control in `evidence/commands.log`.

Quotes used in the fixtures were copied from the bytes above:

- `The field value SHOULD remain consistent over a sequence of HTTP responses`
  (draft-ietf-httpapi-ratelimit-headers-11.txt, §3, lines 308-309 re-wrapped).
- `Total time (in seconds) of when the current rate limit bucket will reset`
  (docs.discord.com rate-limits page, normalised text, `X-RateLimit-Reset-After` definition).
- `The 429 status code indicates that the user has sent too many requests in a given amount of time`
  (rfc6585.txt §4, lines 134-135 re-wrapped).
