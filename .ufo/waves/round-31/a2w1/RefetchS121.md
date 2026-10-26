# RefetchS121 — independent refetch of S121 (GitHub REST rate-limits page) for C1

Seat: RefetchS121 (wave a2w1, round 31, attack seat). Lane tip read: `486048356f0712e4396588c9dab58cd419243120`. I am not the receipt's `fetched_by` (`FetchS121`).

## Verdict

**Holds — no defect in any counted S121 row or in the S121 anchor cell.** Three independent HTTPS GETs of `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` (12:26:33Z, 12:26:40Z, 12:28:11Z) each returned HTTP 200, 337,116 bytes, and *the same normalised text as the committed receipt*: normalised sha256 `7416038a…cca3b3` for all four copies (fresh ×3 + `bytes/S121.html` at REV), 15,504 normalised bytes / 2,425 words each. Raw bytes differ from the receipt by exactly **63 bytes, all inside the Next.js `buildId`** (HTML line 32 chunk URL and line 151 `__NEXT_DATA__`); the article body is byte-identical after normalisation and the file is 151 lines in every copy, so the registry row's disclosure "raw bytes vary per response; normalised text identical across same-day fetches, line numbers unchanged" is **verified, not merely asserted**. All six `Located` quotes of the rows citing S121 (D6–D11) are present exactly once in my fresh normalised bytes at the same character offsets as in the committed bytes, each threshold is the page's own number with the bound and unit the quote states, the force marking is right (five declared limits marked `(derived)`, one bare directive not marked), and the six signals are distinct. All 13 cited anchor line numbers in `corpus/SOURCES.md:135` (lines 32, 38, 41, 61, 62, 66, 67, 70, 103, 134, 142, 143, 144) point at the cited sentences in **both** the committed bytes and my fresh bytes. Two low-severity, non-counted annotation/prose imprecisions are listed at the end; neither touches a row's threshold, force, scope or distinctness.

## 1. Fetch record

All fetches: `curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5`; `TMPDIR=/fast/scratch/hyaku/tabi-r31/RefetchS121`. Exit code 0 on all three. No proxy/CA environment variables set (`env | grep -iE '^(http|https|all|no)_proxy='` empty), no `/etc/hosts` entry for the host; fetch 3 resolved to `2606:50c0:8000::154` (GitHub/Fastly IPv6) with TLS 0.0116 s, TTFB 0.0153 s, total 0.0255 s, HTTP/2. The page is served from the CDN edge, which explains the ~20 ms total on a 337 KB document.

| fetch | UTC start | HTTP | bytes | raw sha256 | effective URL | exit |
|---|---|---|---|---|---|---|
| 1 | 2026-10-26T12:26:33Z | 200 | 337116 | `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9` | `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` (unchanged by `-L`) | 0 |
| 2 | 2026-10-26T12:26:40Z | 200 | 337116 | `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9` | same | 0 |
| 3 | 2026-10-26T12:28:11Z | 200 | 337116 | `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9` | same | 0 |

Machine-readable: `RefetchS121/fetch-record.tsv`. Raw fresh receipt kept as `RefetchS121/S121.fresh.html.gz` (33,116 B compressed; sha256 of the uncompressed bytes `47031376…73d9`).

Receipt identity at REV, re-derived rather than trusted:
`git -C clone show 4860483…:corpus/evidence/round-31/decision-table/bytes/S121.html | sha256sum` → `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755`, equal to `S121.json.sha256`; `http_status` 200; `fetched_at` 2026-10-26T08:36:16Z; `fetched_by` FetchS121 (not me); `bytes_path` present, 337,116 B. The counter at REV is `d15f3bd7…f6832`, equal to `claims.json frozenDigests`.

## 2. Normalised comparison

Normalisation is the counter's own `normalise()` (HTML bytes lose script/style blocks and tags, entities decoded, whitespace collapsed); I byte-copied the function out of `scripts/check-decision-table.mjs` at REV (`sed 's/^main();$//' … > counter-lib.mjs`, `grep -c '^main();' counter-lib.mjs` → 0) so the comparison cannot drift from the oracle.

| copy | raw bytes | raw sha256 | norm bytes | norm sha256 |
|---|---|---|---|---|
| committed `bytes/S121.html` @4860483 | 337116 | `3a33f87b…efef755` | 15504 | `7416038ab0f63a4d614c70cdaa4adf14d14fabab09b6520db4dd6b8b6ecca3b3` |
| fresh 1 | 337116 | `47031376…173d9` | 15504 | `7416038a…cca3b3` |
| fresh 2 | 337116 | `47031376…173d9` | 15504 | `7416038a…cca3b3` |
| fresh 3 | 337116 | `47031376…173d9` | 15504 | `7416038a…cca3b3` |

Line-by-line diff of committed vs fresh raw bytes (python, exit 0): exactly two differing lines, both carrying the rotating Next.js build id —
`committed: /_next/static/ltuTboUIVptrdqXZZauaN/_buildManifest.js`
`fresh: /_next/static/xU-2nvoRQaQJjVgNhAf2O/_buildManifest.js`
and the matching `"buildId":"…"` in the `__NEXT_DATA__` JSON on line 151. No article-body line differs. Machine-readable: `RefetchS121/normalised-compare.tsv`; fresh normalised text: `RefetchS121/S121.fresh.normalised.txt`.

Independent corroboration with the frozen counter, run in the clean scratch clone (`git status --porcelain` = 0) at REV:

- offline: `node scripts/check-decision-table.mjs --rev 4860483… --baseline 96a2d1a… --entry corpus/knowledge/rate-signal-decision-table.md --json` → exit 0, `{"population":13,"admitted":13,"failing":0,"live":false}`
- live, 12:28:43Z: same command with `--live` → exit 0, `{"population":13,"admitted":13,"failing":0,"live":true}`, rows D6–D11 each `admitted=true, reason=null`

Outputs kept: `RefetchS121/c1-offline.json`, `RefetchS121/c1-live.json`. (The L1's known `--live` hole — a proxy/CA environment can satisfy the live leg — does not apply to *this* run: no proxy env, direct CDN address, and the quotes were located independently by me in bytes I fetched myself, not by the counter's live leg.)

## 3. Per-row location, force, scope, distinctness (rows citing S121 in `corpus/knowledge/rate-signal-decision-table.md` @4860483)

Quotes are those parsed out of the entry's `Located quote` cell at REV (`rows.mjs`), not retyped. Offsets are character offsets in the normalised text; fresh and committed offsets are identical because the normalised strings are identical. "occ" = occurrences in the fresh normalised text.

| row | signal (abridged) | words | found fresh | offset | found committed | occ | threshold cell | number in quote | force marking | row verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| D6 | rate-limited `403`/`429`, no `retry-after`, `x-ratelimit-remaining` ≠ `0` | 9 | yes | 13955 | yes | 1 | at least 1 minute | yes, "at least one minute" | bare directive (page: "Otherwise, wait for at least one minute before retrying.") — correctly **not** marked `(derived)` | holds |
| D7 | `x-ratelimit-limit`, unauthenticated request | 12 | yes | 5015 | yes | 1 | 60 requests | yes, "60 requests per hour" | declared limit, `(derived)` | holds |
| D8 | `x-ratelimit-limit`, personal access token | 15 | yes | 5301 | yes | 1 | 5,000 requests | yes, "5,000 requests per hour" | declared limit, `(derived)` | holds |
| D9 | parallel fan-out (`concurrent requests`) | 8 | yes | 9496 | yes | 1 | no more than 100 concurrent | yes | declared limit, `(derived)` | holds |
| D10 | weighted `points` per minute, REST endpoints | 13 | yes | 9660 | yes | 1 | no more than 900 points | yes | declared limit, `(derived)` | holds; see observation O1 |
| D11 | summed response time as `CPU time` proxy per 60 s wall clock | 16 | yes | 9938 | yes | 1 | no more than 90 seconds | yes | declared limit, `(derived)` | holds; see observation O2 |

Scope checks against the page text in my fresh bytes:

- **D7** — page §Primary rate limit for unauthenticated users: "The primary rate limit for unauthenticated requests is 60 requests per hour." (raw line 38). The header's meaning ("The maximum number of requests that you can make per hour", table on raw line 134) makes the row's `x-ratelimit-limit` signal faithful.
- **D8** — the quote sits under §Primary rate limit for authenticated users after "You can use a personal access token to make API requests" (raw lines 39–41); the row restricts scope to the user token and discloses the lane holds none. The page's higher 15,000/hour figures for GitHub App / OAuth app requests are outside the row's stated scope and are not claimed.
- **D9** — the decision cell's "shared across REST and GraphQL" is the page's next sentence verbatim ("This limit is shared across the REST API and GraphQL API.", raw line 66).
- **D10** — the page sentence continues ", and no more than 2,000 points per minute are allowed for the GraphQL API endpoint." (raw line 67); the row's decision cell discloses "GraphQL has its own", so the truncation misstates nothing (observation O1 is about the missing ellipsis only).
- **D11** — signal matches "You can roughly estimate the CPU time by measuring the total response time for your API requests" (same bullet, raw line 68); the page's extra sub-bound "No more than 60 seconds of this CPU time may be for the GraphQL API" is neither stated nor contradicted by the row (observation O2).
- **D6** — the quote occurs once, inside the §Exceeding the rate limit paragraph that begins "If you exceed a secondary rate limit, you will receive a `403` or `429` response…" (raw line 144), and it follows the `retry-after` and `x-ratelimit-remaining`-is-`0` branches exactly as the decision cell's "last-resort branch after `retry-after` and `x-ratelimit-reset`" says. The row's own signal excludes `x-ratelimit-remaining = 0`, so it does not overlap D12 (S122), and the primary-limit paragraph (raw line 143) also sets `x-ratelimit-remaining` to 0, so the row's condition can only be the secondary case — consistent, not contradictory.

Distinctness: six rows, six distinct signals, six distinct quotes (each occurring exactly once), thresholds 1 minute / 60 / 5,000 / 100 / 900 / 90 — no repeated quote across rows (the wave-1 counter hole "one quote reused across rows" is not exercised here), and no two rows share a threshold unit-dimension pair (per-hour, per-hour, concurrency, points/minute, seconds-CPU/60 s).

## 4. Registry anchor cell (`corpus/SOURCES.md:135`)

Anchor cell as landed: "article body opens at the end of HTML line 32 (§About primary rate limits): unauthenticated 60 requests per hour at line 38, authenticated 5,000 requests per hour at line 41, GITHUB_TOKEN 1,000 requests per hour per repository at line 61; §About secondary rate limits at line 62: 100 concurrent requests at line 66, 900 points per minute for REST at line 67, 80 content-generating requests per minute and 500 per hour at line 70; §Checking the status of your rate limit at line 103 (x-ratelimit-* table at line 134); §Exceeding the rate limit at line 142 (403 or 429 with x-ratelimit-remaining 0 at line 143, retry-after at line 144); fetched 2026-10-26T08:36:16Z, 337116 B, sha256 3a33…efef755".

Every cited line number was checked by substring, in both byte copies (`anchor.mjs`, exit 0):

| line | anchor says | verified substring | committed | fresh |
|---|---|---|---|---|
| 32 | article body opens at end of line 32, §About primary rate limits | `id="about-primary-rate-limits"` — and line 32 genuinely *ends* with that `<h2>` | yes | yes |
| 38 | unauthenticated 60 requests per hour | `The primary rate limit for unauthenticated requests is 60 requests per hour.` | yes | yes |
| 41 | authenticated 5,000 requests per hour | `personal rate limit of 5,000 requests per hour` | yes | yes |
| 61 | GITHUB_TOKEN 1,000 per hour per repository | `1,000 requests per hour per repository` | yes | yes |
| 62 | §About secondary rate limits | `id="about-secondary-rate-limits"` | yes | yes |
| 66 | 100 concurrent requests | `No more than 100 concurrent requests are allowed` | yes | yes |
| 67 | 900 points per minute for REST | `No more than 900 points per minute are allowed for REST API endpoints` | yes | yes |
| 70 | 80 content-generating per minute, 500 per hour | `no more than 80 content-generating requests per minute and no more than 500 content-generating requests per hour` | yes | yes |
| 103 | §Checking the status of your rate limit | `id="checking-the-status-of-your-rate-limit"` | yes | yes |
| 134 | x-ratelimit-* table | `x-ratelimit-limit` on the `<table aria-labelledby="checking-the-status-of-your-rate-limit">` line | yes | yes |
| 142 | §Exceeding the rate limit | `id="exceeding-the-rate-limit"` | yes | yes |
| 143 | 403 or 429 with x-ratelimit-remaining 0 | `x-ratelimit-remaining` (paragraph: "…you will receive a `403` or `429` response, and the `x-ratelimit-remaining` header will be `0`") | yes | yes |
| 144 | retry-after | `retry-after` (the paragraph that also carries the D6 "Otherwise…" sentence) | yes | yes |

All four section anchors the entry's `source:` line cites (`§about-primary-rate-limits`, `§about-secondary-rate-limits`, `§checking-the-status-of-your-rate-limit`, `§exceeding-the-rate-limit`) exist as `id=` targets in my fresh bytes. Machine-readable: `RefetchS121/anchors-S121.tsv`.

## 5. Observations — no severity that touches a counted row

- **O1 (low, annotation style).** D10's quote stops mid-sentence at "…for REST API endpoints" with no trailing period or ellipsis, whereas D7/D8/D9/D11 quote complete sentences. The quoted string is a verbatim substring and the omitted continuation (GraphQL 2,000 points/minute) is disclosed in the decision cell, so nothing false is claimed; it is an unmarked truncation. Note the same convention already exists at D3 (S119), so this is a table-wide style choice rather than a new defect.
- **O2 (low, completeness not correctness).** D11 omits the page's second bound, "No more than 60 seconds of this CPU time may be for the GraphQL API" (raw line 68). The row is REST-scoped and does not contradict it.
- **O3 (low, front-matter rationale).** The entry's recheck line says S121/S122 have "no revision marker or dated revision in the fetched bytes, so the cadence is the only guard". The bytes carry dated *API-version* strings — "2026-03-10 (latest)" in the article's version picker on raw line 32 and `"apiVersions":["2026-03-10","2022-11-28"],"latestApiVersion":"2026-03-10"` in `__NEXT_DATA__` — and a per-deployment Next.js `buildId` that in fact changed between the receipt fetch (08:36:16Z, `ltuTboUI…`) and mine (12:26Z, `xU-2nvoR…`). There is still no page "last updated"/revision date (`grep` for `Last updated`, `lastUpdated`, `datestamp`, `revised` over the article body: no hits), so the substantive claim holds; the wording "no revision marker … in the fetched bytes" is over-strong, since the buildId is exactly a revision-ish marker present in the bytes. The registry row itself already discloses the buildId-level variance correctly.
- **O4 (low, prose section, not a counted row).** The entry's "How a journey driver uses it" says a persistent secondary limit gets "an exponentially increasing interval with a stop after a stated number of retries". The page says only "throw an error after a specific number of retries" and **states no number**; "a stated number" reads as if the page gives one. No table row depends on it.
- Positive checks on prose that could have failed and did not: the region caveat is in the page ("Because GitHub processes API requests in multiple regions, rate limit values can vary from one response to the next based on the location handling the request. For example, `x-ratelimit-remaining` may be higher on a later response…"), and so are "These secondary rate limits are subject to change without notice" and "You may also encounter a secondary rate limit for undisclosed reasons" (normalised offsets 10842 / 10860 / 10926).

## 6. Commands and exit codes

See `RefetchS121/commands.txt` for the full log. Summary of exit codes: clone/checkout 0 (porcelain 0 lines); `sha256sum scripts/check-decision-table.mjs` 0; `git show …:bytes/S121.html | sha256sum` 0; three `curl` calls 0; `node norm.mjs` 0; `node locate.mjs` 0; `node rows.mjs` 0; `node anchor.mjs` 0; counter offline 0; counter `--live` 0; line-diff python 0. No pacman/uv/npx installs were needed, so nothing to record under the tooling directive.

## 7. Files written

- `RefetchS121.md` (this report)
- `.ufo/waves/round-31/a2w1/RefetchS121/fetch-record.tsv`, `normalised-compare.tsv`, `rows-S121.tsv`, `anchors-S121.tsv`, `commands.txt`
- `.ufo/waves/round-31/a2w1/RefetchS121/S121.fresh.html.gz`, `S121.fresh.normalised.txt`, `c1-offline.json`, `c1-live.json`

No lane tracked file, lane index, lane jj state, fleet file or sibling repo was modified. Scratch (`/fast/scratch/hyaku/tabi-r31/RefetchS121`) is disposable.
