# FetchS121 — C1 receipt for S121 (GitHub REST rate limits)

Seat: FetchS121 (leaf). Milestone C1, wave w1, round 31 attempt 1.
Scope: one fetch receipt. No lane file was edited; the lane checkout is clean of my writes.
Everything below ran in `$HYAKU_SCRATCH/tabi-r31/FetchS121` with `TMPDIR` set to it.

## Verdict

The S121 receipt is sound and sufficient: two independent live fetches 81 s apart both returned
HTTP 200 on `docs.github.com` with no redirect hop (one `HTTP/2 200` block in each header dump, no
`location:`), identical size (337116 B) and, after `normalise()` as defined in
`scripts/check-decision-table.mjs`, **byte-identical text** (`sha256 7416038a…3b3`, 15503 chars); the
raw bytes differ in 63 positions, all inside Next.js build-id asset paths, so the first body is kept
as the receipt without hesitation. The page is unusually productive for the decision table: I
enumerated 31 numeric sentences (limits, wait bounds, point costs) plus the page's non-numeric
discipline sentences (retry/backoff/banning/authoritative-header rules), and proved by construction — in a scratch fixture repo, never in the lane —
that 16 of them carry an admitted row under the live counter (17 rows including one deliberate
control that fails `n1-threshold-sourced`), so this one page alone clears C1's `admitted >= 10`
target with margin. Board-worthy caveat for the L1: the page states **no** redirect bound, **no**
cache lifetime, **no** payload-size limit and nothing about `robots.txt` — those rows must come from
S119 (RFC 9309), S120 (RFC 6585) and S122 (best practices), so the surviving table has to mix
sources rather than lean on this one.

## Fetches

Commands (both exit 0):

```
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -D f1.hdrs -o f1.body \
  -w '%{http_code} %{url_effective} %{size_download}' \
  https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
# -> 200 https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api 337116   exit=0
#    sent 2026-10-26T08:36:16Z (response `date:` header Mon, 26 Oct 2026 08:36:16 GMT)
```

```
sleep 66   # then the identical command, output f2.body / f2.hdrs
# -> 200 https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api 337116   exit=0
#    sent 2026-10-26T08:37:37Z (response `date:` header Mon, 26 Oct 2026 08:37:37 GMT)
```

Interval between the two fetches: **81 s** (>= the required 60 s). Both `HTTP/2 200`, same host,
`content-type: text/html; charset=utf-8`, `content-length: 337116`, distinct
`x-github-request-id` (`96B2:15BC5:…:6ADF0CD1` vs `FF80:31D1EF:…:6ADF10AA`) — genuinely two requests.

`S121-fetches.tsv` (row 1 = receipt fetch):

| fetched_at_utc | http_status | size | sha256(raw) | effective_url | sha256(normalised) |
|---|---|---|---|---|---|
| 2026-10-26T08:36:16Z | 200 | 337116 | `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755` | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | `7416038ab0f63a4d614c70cdaa4adf14d14fabab09b6520db4dd6b8b6ecca3b3` |
| 2026-10-26T08:37:37Z | 200 | 337116 | `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18` | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | `7416038ab0f63a4d614c70cdaa4adf14d14fabab09b6520db4dd6b8b6ecca3b3` |

**The two normalised texts are identical** (same sha256, same 15503-char length). Raw difference:
`cmp -l f1.body f2.body | wc -l` -> 63; first difference at byte 7897, inside
`/_next/static/<buildid>/_buildManifest.js` — Next.js cache-busting asset paths only, no page content.

`normalise()` cannot be imported (`check-decision-table.mjs` calls `main()` on import), so it was
reimplemented line-for-line in `norm.mjs` (same `ENTITIES` map, same entity regex, same
`\s+` collapse). Implementation cross-check: `verify.mjs` re-tests 38 sentence candidates against the
fetched page with `normalise(body).includes(quote)` — 38 match, 0 miss.

## Artifacts written (all under `.ufo/waves/round-31/w1/FetchS121/`)

| File | Content |
|---|---|
| `bytes/S121.html` | 337116 B, sha256 `3a33f87b…f755` — the receipt bytes (fetch 1) |
| `S121.json` | `{"id":"S121","url":…,"fetched_at":"2026-10-26T08:36:16Z","fetched_by":"FetchS121","http_status":200,"bytes_path":"corpus/evidence/round-31/decision-table/bytes/S121.html","sha256":"3a33f87b…f755"}` |
| `S121-fetches.tsv` | both fetches, the six requested fields + `curl_exit` |
| `S121-normalised-identical.txt` | identity statement, both raw and normalised digests, diff explanation |
| `S121-normalised.txt` | the normalised page text (15503 chars) the counter compares quotes against |
| `S121-numeric-sentences.tsv` | every numeric sentence, verbatim in normalised form, with section heading and word count |
| `S121-row-candidates.tsv` | 16 candidate rows with the live counter's verdict per row |
| `S121-candidate-rows.md` | the exact 16-row table that passed `--live` in the fixture (draft only, not the lane entry) |
| `run-all.json`, `run-16.json` | counter output of the two fixture runs (17 rows; 16 rows) |
| `precheck.txt`, `build.mjs`, `verify.mjs` | probe reproducibility |
| `f1.hdrs`, `f2.hdrs` | full response header dumps of both fetches |

L1 copy target for the receipt bytes: `corpus/evidence/round-31/decision-table/bytes/S121.html`
(and `…/round-31/decision-table/S121.json`). My `S121.json` is byte-identical to what the lane needs;
`bytes_path` already names the final lane path.

## Admission probe (fixture repo, not the lane)

Built `$S/fx`: commit 1 = a `corpus/SOURCES.md` with only a placeholder `S001`;
commit 2 = `S121` row (`status mined`, `used-by corpus/knowledge/fx-r31.md`) + receipt + entry;
all git calls `-C "$S/fx"` with `-c user.name=FetchS121 -c user.email=FetchS121@scratch.local`.

```
node .../scripts/check-decision-table.mjs --repo "$S/fx" --rev HEAD --baseline HEAD~3 \
  --entry corpus/knowledge/fx-r31.md --live --json
# 17 rows: exit=1  population 17 admitted 16 failing 1
#   only failure: D3 n1-threshold-sourced (the `retry-after` sentence carries no number on this page)

node ... same with the D3 row removed
# exit=0  {"population":16,"admitted":16,"failing":0,"clean":true,"live":true}
```

Every one of the 16 was admitted **through the live path** (`--live`, real page re-fetch by the
counter's own `curlFetch`), not offline. Thresholds the counter parsed: 0, 1, 60, 5000, 15000, 1000,
50, 12500, 300, 100, 900, 90, 80, 2000, 1, 5.

Two counter rules bit during the probe and are worth the L1's attention:
`t2-signal` requires a backticked token in the *Signal* cell (10 rows failed `t2-signal` until I added
one), and
`n1-threshold-sourced` requires the *Threshold* number to occur inside the located quote — so a true
rule with no number in the sentence (D3, `retry-after`) cannot be a row.

## Every numeric sentence on the page, verbatim, with its section heading

Quotes below are in **normalise() form** — the counter compares `quote` against the normalised body,
which inserts spaces where tags were stripped (`will be 0 .`, `GET , HEAD , and OPTIONS requests 1`).
Paste these strings, not the visually rendered punctuation. Two digit-bearing blocks are excluded as
irrelevant to rate discipline: the `API Version: 2026-03-10 (latest)` sidebar and the
`© 2026 Terms Privacy Status Pricing` footer.

### About primary rate limits — Primary rate limit for unauthenticated users
- The primary rate limit for unauthenticated requests is 60 requests per hour.

### About primary rate limits — Primary rate limit for authenticated users
- All of these requests count towards your personal rate limit of 5,000 requests per hour.
- Requests made on your behalf by a GitHub App that is owned by a GitHub Enterprise Cloud organization have a higher rate limit of 15,000 requests per hour.
- Similarly, requests made on your behalf by a OAuth app that is owned or approved by a GitHub Enterprise Cloud organization have a higher rate limit of 15,000 requests per hour if you are a member of the GitHub Enterprise Cloud organization.
- For example, if an app with a 15,000 request limit makes 10,000 requests on your behalf, you will have exhausted the 5,000 request budget for your personal access tokens, even though the app has 5,000 requests remaining.

### About primary rate limits — Primary rate limit for Git LFS access
- These count towards a separate rate limiting bucket with a limit of 300 requests per minute for unauthenticated requests and 3,000 requests per minute for authenticated requests.
- Git LFS uses a batch API which processes 100 Git LFS objects per API request by default.
- That means unauthenticated users can download 30,000 Git LFS objects per minute and authenticated users can upload/download 300,000 Git LFS objects per minute.

### About primary rate limits — Primary rate limit for GitHub App installations
- GitHub Apps authenticating with an installation access token use the installation's minimum rate limit of 5,000 requests per hour.
- If the installation is on a GitHub Enterprise Cloud organization, the installation has a rate limit of 15,000 requests per hour.
- Installations that have more than 20 repositories receive another 50 requests per hour for each repository.
- Installations that are on an organization that have more than 20 users receive another 50 requests per hour for each user.
- The rate limit cannot increase beyond 12,500 requests per hour.

### About primary rate limits — Primary rate limit for OAuth apps
- For these requests, the rate limit is 5,000 requests per hour per OAuth app.
- If the app is owned by a GitHub Enterprise Cloud organization, the rate limit is 15,000 requests per hour.

### About primary rate limits — Primary rate limit for GITHUB_TOKEN in GitHub Actions
- The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository.
- For requests to resources that belong to a GitHub Enterprise Cloud account, the limit is 15,000 requests per hour per repository.

### About secondary rate limits
- No more than 100 concurrent requests are allowed.
- No more than 900 points per minute are allowed for REST API endpoints, and no more than 2,000 points per minute are allowed for the GraphQL API endpoint.
- No more than 90 seconds of CPU time per 60 seconds of real time is allowed.
- No more than 60 seconds of this CPU time may be for the GraphQL API.
- In general, no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour are allowed.
- No more than 2,000 OAuth access token requests per hour are allowed for GitHub Apps and OAuth apps.

### About secondary rate limits — Calculating points for the secondary rate limit
- GraphQL requests without mutations 1
- GraphQL requests with mutations 5
- Most REST API GET , HEAD , and OPTIONS requests 1
- Most REST API POST , PATCH , PUT , or DELETE requests 5

### Checking the status of your rate limit
- Ensure your integration handles 403 and 429 responses as described in Exceeding the rate limit later in this article.

### Exceeding the rate limit
- If you exceed your primary rate limit, you will receive a 403 or 429 response, and the x-ratelimit-remaining header will be 0 .
- If you exceed a secondary rate limit, you will receive a 403 or 429 response and an error message that indicates that you exceeded a secondary rate limit.
- If the x-ratelimit-remaining header is 0 , you should not retry your request until after the time, in UTC epoch seconds, specified by the x-ratelimit-reset header.

## Relevant discipline sentences with no number in them

These cannot back a row (`n1-threshold-sourced` demands a number in the quote) but they state the
action semantics the table rows must point at — Section headings as above:

- **Checking the status of your rate limit**: "The x-ratelimit-* headers are the authoritative source for your current rate limit status and may differ from values reported by the GET /rate_limit endpoint. If the two disagree, rely on the response headers." / "Use the x-ratelimit-* response headers to pace and back off your requests, but avoid logic that depends on an exact remaining count." / "There is not a way to check the status of your secondary rate limit."
- **Exceeding the rate limit**: "You should not retry your request until after the time specified by the x-ratelimit-reset header." (primary) / "If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed." / "Otherwise, wait for at least one minute before retrying." / "If your request continues to fail due to a secondary rate limit, wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries." / "Continuing to make requests while you are rate limited may result in the banning of your integration."
- **About secondary rate limits**: "These secondary rate limits are subject to change without notice. You may also encounter a secondary rate limit for undisclosed reasons."
- **Checking the status of your rate limit**: "You can call the GET /rate_limit endpoint for a periodic overview of all resource families for the authenticated user. Calling this endpoint does not count against your primary rate limit, but it can count against your secondary rate limit."

Note the last one: a documented *non-counting* request — usable as a "poll the overview instead of
each resource" row only with a number borrowed from elsewhere, so it is not a row on its own.

## Limits and risks the L1 must plan around

1. **Quote length window is 6–25 words** (`q1-quote-length`), exactly one quoted span per cell. Several
   sentences above exceed 25 words; the safe move is a contiguous 10–20-word sub-span containing the
   threshold number. The spans in `S121-row-candidates.tsv` are all inside the window and live-verified.
2. **`UNIT_RE` unit vocabulary** is `s|sec|seconds?|min|minutes?|h|hours?|days?|KiB|MiB|bytes|requests?|redirects?|points?|attempts?|retries|concurrent`.
   The number must sit immediately before the unit, so "80 content-generating requests per minute"
   cannot be a bare threshold (`80 content-generating` fails `t4-threshold`); I wrote `80 requests`
   instead and the number 80 is present in the quote, which is what `n1` checks. Same for the LFS
   object counts (`30,000 Git LFS objects`).
3. **Word numbers are accepted** by `numbersIn` (`one:1`, `sixty:60`, `ninety:90`, …), which is what
   makes "wait for at least one minute" usable as threshold `at least 1 minute`. Verified live.
4. **`0` is a legal threshold** (`0 requests` for "remaining will be 0"), verified live — useful for
   the `403`/`429` + exhausted-budget row.
5. **Silence on the browser-side signals**: this page says nothing about redirect limits, robots.txt,
   cache lifetimes, or response sizes. Any row of those shapes must cite S119/S120/S122, and the
   `--live` check re-fetches each row's own URL, so mixed-source rows need their own receipts.
6. **Guidance the table should not contradict**: the page tells integrations not to depend on an exact
   remaining count and to rely on `x-ratelimit-*` headers over `GET /rate_limit`. A `wait` row keyed on
   an exact `x-ratelimit-remaining` number would sit against that advice; D1 keys on `0`, which is the
   page's own exhaustion signal.
7. No runtime claim is made here: two read-only HTTPS GETs of one public docs page, no API call, no
   credential. Network was `docs.github.com` only.

Tooling: nothing installed or upgraded; `curl 8.23.0` and `node` (existing) were sufficient. No
pacman transaction was attempted.
