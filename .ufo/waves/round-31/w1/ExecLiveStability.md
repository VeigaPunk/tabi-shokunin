# ExecLiveStability — C1 live-stability probe (tabi round 31, w1)

Verdict: **the hypothesis holds for all four pages.** Each of S119 `https://www.rfc-editor.org/rfc/rfc9309.txt`,
S120 `https://www.rfc-editor.org/rfc/rfc6585.txt`, S121 `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`
and S122 `https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api` returned **HTTP 200 with
byte-identical bodies on three fetches 130–131 s apart (span 261 s, 2026-10-26T08:38:05Z → 08:42:26Z)**: identical raw sha256,
identical `normalise()` sha256, identical normalised length, no redirect (effective URL = requested URL on every fetch). Because the
normalised text of fetch 1 is byte-equal to fetch 3, every quote span that a row locates at table-writing time still locates at a
later `--live` check over the same interval class; the qualification is that identity was measured over 261 s and not over the whole
gap to closure (risks 1–2 below).

## Evidence

All work ran in a scratch clone at the freeze revision, never in the lane checkout:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone            # exit 0
git -C $S/clone checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d              # exit 0
git -C $S/clone rev-parse HEAD              -> 9505a10eb80b2a0b273ebaba3f7f872ad302192d
git -C $S/clone status --porcelain | wc -l  -> 0
sha256sum $S/clone/scripts/check-decision-table.mjs
  -> d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832   (= claims.json frozenDigests)
```

### 1. `normalise()` used verbatim, not re-implemented

`analyse.mjs` slices the `const ENTITIES = …;` line and the `export function normalise(buf) { … }` block out of the frozen
counter and imports them from a generated module (`normalise-extracted.mjs`, sha256
`04189e4c5ff8f89de8a9590fbfa8e5ef6344ba83a118a9d20b5e9093814847a6`). Before measuring, it asserts the extraction on the
counter's **own** in-file fixture — `normalise(HTML)` must contain `QHTML` (the `<script>`-stripped, `&amp;`-decoded sentence):

```
node --input-type=module -e '… extraction + fixture …'      # EXIT=0
  entities_len 191   block_lines 14   fixture_ok true
```

So the texts compared below are the counter's texts, including its HTML branch (tag/script/style removal, entity decoding) for the
two `docs.github.com` pages and its whitespace-collapse-only branch for the two RFC `.txt` pages.

### 2. Fetches (the deliverable TSV)

Command per fetch, exactly the counter's `curlFetch` flags (`--proto =https --proto-redir =https -L --max-redirs 5 --max-time 60`),
with `-o`/`-w` added only to capture the body and the status line:

```
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 \
     -o raw/<page>.<n>.bin -w '%{http_code}\t%{url_effective}\t%{size_download}' <url>
bash fetch.sh          # EXIT=0, 12/12 requests curl_rc=0 http_status=200, FETCH-DONE 2026-10-26T08:42:26Z
node analyse.mjs       # EXIT=0
```

Per-page (three fetches each; `raw_eq_f1 = norm_eq_f1 = yes` on fetches 2 and 3 for all four pages):

| page | HTTP | bytes (raw / norm) | raw sha256 | norm sha256 |
|---|---|---|---|---|
| S119 | 200 ×3 | 25265 / 20888 | `f633915d…fb207` | `473fd7d6…c004e5` |
| S120 | 200 ×3 | 17164 / 14287 | `f6d55d1b…876e58` | `2e9eae28…14f4d4` |
| S121 | 200 ×3 | 337116 / 15504 | `ae5e1812…084c18` | `7416038a…cca3b3` |
| S122 | 200 ×3 | 328088 / 13477 | `b15c1c0b…dea33e` | `a4290d78…4cb1f2` |

Full rows (page, fetch, UTC, url, status, effective url, curl rc, size_download, file bytes, raw sha256, norm bytes, norm sha256,
equality flags): **`live-stability.tsv`** — this is the requested TSV. Per-page verdicts: **`stability-summary.tsv`**. Fetch metadata
(URL, UTC, status, effective URL, size for all 12): **`fetch-meta.tsv`**.

Gap check (exit 0):

```
S119 gaps_s 130.0,131.0 span_s 261.0     S120 gaps_s 131.0,130.0 span_s 261.0
S121 gaps_s 131.0,130.0 span_s 261.0     S122 gaps_s 131.0,130.0 span_s 261.0
effective==requested: true
```

### 3. Diffs when normalised texts differ

None: every pairwise comparison of fetch 1/2/3 normalised text produced `identical`, so there are no differing spans to show.
`normalised-diffs.txt` records that result per page together with the three raw/norm sha256 values and byte counts, plus the fixture
proof. (`analyse.mjs` computes the common-prefix/suffix divergence span and would have printed both spans had any pair differed.)

### 4. Does a quote drawn from these pages still locate?

Two layers:

- Mechanical: `norm(fetch1) == norm(fetch3)` byte-for-byte, so `includes(quote)` is invariant for **any** span.
- Operational probe (`quote-candidates.tsv`): sentences of fetch 1 that satisfy the counter's own windows — 6..25 words, a number
  (digits or the counter's `NUMBER_WORDS` vocabulary) and a `UNIT_RE` unit — re-tested as substrings of fetch 2 and fetch 3:

```
{"S119":[8,8],"S120":[7,7],"S121":[18,18],"S122":[5,5]} total [38,38]     # EXIT=0
```

38/38 candidate quotes survive in both later fetches (per page: 8, 7, 18, 5). Examples verified present in all three fetches:
`The crawlers SHOULD follow at least five consecutive redirects, even across authorities (for example, hosts in the case of HTTP).`
(S119); `Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable.` (S119);
`429 Too Many Requests The 429 status code indicates that the user has sent too many requests in a given amount of time ("rate limiting").`
(S120); `The primary rate limit for unauthenticated requests is 60 requests per hour.` (S121);
`No more than 100 concurrent requests are allowed.` (S121);
`If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header.`
(S122). This is a feasibility signal for C1's ≥10 rows (every page yields candidates; S122 yields the fewest at 5), not a reading of
the entry: r1–r4 and g1–g3 are the counter's business and the entry was absent at the freeze.

### 5. What the `--live` path will see

`liveOk()` requires HTTP 200, an https effective URL on the same host, and the quote inside `normalise(body)`. All three hold for all
four URLs on all three fetches (`http_status=200`, `effective_url = url`, quote located). No `api.github.com` request, no cookie,
login or credential was used; nothing was written outside this seat's scratch tree and output dir.

## Commands run (with exit codes)

| command | exit |
|---|---|
| `git clone --shared … ; git -C clone checkout -q 9505a10e…` | 0 |
| `node --input-type=module -e '<extraction + counter fixture>'` | 0 (`fixture_ok true`) |
| `bash fetch.sh` (3 rounds × 4 URLs, `sleep 130` between rounds) | 0, `FETCH-DONE 2026-10-26T08:42:26Z` |
| `node analyse.mjs` | 0 |
| `node --input-type=module -e '<gap + effective-url check>'` | 0 |
| `node --input-type=module -e '<quote-candidate probe>'` | 0 (digit-only 30/30, extended with number words 38/38) |
| `sha256sum <deliverables>` | 0 |

## Risks / limits

1. **Window measured is 261 s, not the gap to closure.** Identity is demonstrated for three fetches ~130 s apart; if closure is hours
   later, a docs.github.com redeploy or RFC file replacement could still change the text. Re-running `fetch.sh` at closure is the
   cheap mitigation; the C1 kill rule (live admitted 0 → failed) already catches a real change.
2. **Cache masking is not excluded.** The three bodies could be a CDN cache with no cache-busting. This does not weaken the finding
   for the counter's purpose: the counter's `curlFetch` sends the same request (same default `curl` User-Agent, no cookies,
   no conditional headers), so it sees the same cache tier this probe saw. A cold-edge or post-purge origin change would not be
   predicted by this probe.
3. **GitHub docs HTML is only 15.5 KiB / 13.5 KiB after normalisation** (from 337 KiB / 328 KiB raw): its prose is a small slice of
   the page, and quote spans that cross a stripped inline element collapse to single spaces. Stability holds; *availability* of a
   specific span is a separate question answered only by running `q2/n1/l1` on the real entry.
4. RFC `.txt` pages take normalise's whitespace-collapse branch only, so their stability follows from raw stability alone; no
   entity/tag transformation is involved.
5. No runtime claim about the hosts' rate limiting: this probe made 12 documentation/text GETs and nothing else.

## Files written (all under this seat's output dir and the report path)

- `.ufo/waves/round-31/w1/ExecLiveStability.md` (this report)
- `.ufo/waves/round-31/w1/ExecLiveStability/live-stability.tsv` (the requested TSV, 12 fetch rows)
- `.ufo/waves/round-31/w1/ExecLiveStability/stability-summary.tsv` (per-page verdict, candidate survival)
- `.ufo/waves/round-31/w1/ExecLiveStability/quote-candidates.tsv` (38 candidate quotes, survival flags)
- `.ufo/waves/round-31/w1/ExecLiveStability/normalised-diffs.txt` (no diffs; sha/byte record + fixture proof)
- `.ufo/waves/round-31/w1/ExecLiveStability/normalised/{S119,S120,S121,S122}.{1,2,3}.txt` (12 normalised texts)
- `.ufo/waves/round-31/w1/ExecLiveStability/raw-fetch1/{S119,S120,S121,S122}.1.bin` (first-fetch raw bodies; fetches 2–3 are
  byte-identical by sha256, so one body per page is the receipt)
- `.ufo/waves/round-31/w1/ExecLiveStability/fetch-meta.tsv`, `fetch.sh`, `analyse.mjs`,
  `normalise-extracted.mjs`, `check-decision-table.frozen.mjs` (provenance; frozen copy sha256
  `d15f3bd7…f6832` = `claims.json` `frozenDigests`)

Digests: `live-stability.tsv 3e18409bfb231451f880b800ed5177aa694db6489bf697bb1b4cf1f7e7309d32`,
`stability-summary.tsv be3a61c1f8416f4970a171cd991d00640bbdab9128a19de90a7b2f8745f4f287`,
`quote-candidates.tsv c6c98ccb97751af0b4bb1ea2d84e31e8018c46ecf3aebc03eed9628f37caf481`.

No lane tracked file, git index, jj state or sibling lane was touched; `scripts/` was read only. Throwaway scratch
(`/fast/scratch/hyaku/tabi-r31/ExecLiveStability`, TMPDIR set explicitly) was copied into the output dir before removal.

## Tooling

No install or upgrade: `curl 8.23.0` and `node v24.21.0` were already present; the pacman guard was not exercised.
