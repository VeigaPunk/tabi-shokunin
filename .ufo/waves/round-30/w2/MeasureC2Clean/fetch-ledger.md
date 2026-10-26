# Fetch ledger — seat MeasureC2Clean (round 30, w2, C2 attack)

All fetches are read-only HTTPS GETs of public documentation/spec pages. No credentials,
cookies, logins or API calls. Times are UTC on 2026-10-26.

## My own GETs (curl 8.23.0, `curl -sS -L --max-time 60`)

| # | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T07:36:04Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 2 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T07:36:04Z | 200 | 408912 | c6bc80a40678569dbee4af62e80791e98a84e7929605c362e8563425b14ea7ca |

`url_effective` equalled the request URL for both (no redirect). Bytes are stored under
`live-bytes/`. Compare with the committed receipts at 072af95:
- S116 committed `corpus/evidence/round-30/frontier/bytes/S116.txt` sha256
  d6016dd0…2d1d412, 67097 bytes — **byte-identical** to my live GET #1.
- S117 committed `…/bytes/S117.html` sha256 b73dc7d1…f0583c3, 408912 bytes — differs from
  my live GET #2 in **21 bytes** (`cmp`: first at char 408144, line 1238); the two pages
  **normalise to the same 8728-character text** (checked with the counter's own exported
  `normalise`), so the committed bytes are the same document, not a different one.

## Counter-initiated live fetches (same two URLs)

Runs of `scripts/check-frontier-admission.mjs --live` at 072af95 fetched both receipts:
07:35:27Z, 07:38:28Z, 07:38:28Z, 07:38:29Z, 07:41:23Z (all exit 0), plus the fixture runs
(t1 07:37Z, t2 07:37Z, t5 07:41Z, t3 07:41Z). The namespace runs (07:37Z, 07:40:45Z) could
not fetch anything: external `curl` exits 7 with HTTP 000 there.

## Local endpoints used in the falsification fixtures (no external traffic)

- `https://www.ietf.org:443` and `https://docs.discord.com:443` mapped by a fixture
  `~/.curlrc` (`connect-to`) to a local node TLS server on 127.0.0.1:18443 / :18444, which
  serves the committed (or the tampered) bytes and logs each request
  (`config/access-local-server-*.log`). Certificate is a throwaway self-signed pair.
