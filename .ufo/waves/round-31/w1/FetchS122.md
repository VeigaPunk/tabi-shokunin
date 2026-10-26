# FetchS122 — C1 build, receipt for S122 (GitHub REST API best practices)

## Verdict

S122 is fetched and receipted cleanly: two independent HTTPS GETs 89 s apart both returned HTTP 200 on
`docs.github.com` with no redirect, identical 328,088-byte bodies (sha256
`b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e`) and identical normalised texts
(sha256 `a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2`, `cmp` exit 0), so the receipt
is stable and re-fetchable. The page's contribution to the C1 decision table is **small but exact**: it
states only **two literal numeric thresholds** relevant to a journey driver's rate/crawl discipline —
`wait at least one second between each request` for mutative requests (§Pause between mutative requests)
and `wait for at least one minute before retrying` otherwise (§Handle rate limit errors appropriately).
Every other threshold on the page is either deferred to a response header (`x-poll-interval`,
`retry-after`, `x-ratelimit-reset`), unquantified ("exponentially increasing", "much longer", "a specific
number of retries"), or a status-code signal with no bound (`301`, `302`/`307`, `304`, `404`, `4xx`/`5xx`).
The page states **no cache lifetime, no redirect-count bound, no page-size cap and no concurrency count**;
those must not be attributed to S122. All 30 relevant sentences below were machine-verified as substrings
of the normalised receipt bytes (30/30 present, 0 missing).

## Evidence

Scratch: `$HYAKU_SCRATCH/tabi-r31/FetchS122` with `/fast/scratch/hyaku/tabi-r31/FetchS122`. No clone was
needed (no lane script was run; the counter was not invoked — that is the L1's measurement, and my
assignment is the receipt). No lane file was read-write touched; bytes were copied into my output dir only.

### Fetch commands (verbatim)

```
$ curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -D f1.hdr -o f1.html \
    -w '%{http_code} %{url_effective} %{size_download}\n' \
    https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
200 https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api 328088
curl_exit=0

$ curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -D f2.hdr -o f2.html \
    -w '%{http_code} %{url_effective} %{size_download}\n' \
    https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
200 https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api 328088
curl_exit=0
```

Fetch 1: `2026-10-26T08:36:21Z` → HTTP 200, 328,088 bytes, effective URL unchanged, one `HTTP/2 200`
header block and **no `Location`** (no redirect), `content-type: text/html; charset=utf-8`, server clock
`date: Mon, 26 Oct 2026 08:37:50 GMT` in fetch 2's headers.
Fetch 2: `2026-10-26T08:37:50Z` → same status, same bytes, same effective URL.
Gap: 89 s (≥ 60 s required). Same host both times (`docs.github.com`).

### Digests and identity (`sha256sum`, `cmp`, `node`)

```
b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e  f1.html
b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e  f2.html
cmp -s f1.html f2.html    -> bytes_cmp_exit=0
a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2  f1.txt   (normalised)
a4290d789e1dd3e31b5fd7b80ddffdd195687d25c4eeb7165d625203544cb1f2  f2.txt   (normalised)
cmp -s f1.txt f2.txt      -> normalised_cmp_exit=0
```

**The two normalised texts are identical.** Normalisation mirrors `normalise()` at
`tabi-shokunin/scripts/check-decision-table.mjs:134-146` exactly (script-style/detect-HTML, strip
`<script>`/`<style>`, strip tags, decode the counter's `ENTITIES` table incl. `#39` special case, then
`\s+`→single space + trim). The counter module was **not** imported — it calls `main()` at load — so the
function was reimplemented verbatim at `normalise-reimplementation.mjs` (copied into my output dir).

### Quote presence check (exit 0, `node`)

30 candidate sentences, `PRESENT 30 / MISSING 0`; per-quote `words=` and `literal_number_unit=`
flags recorded in `S122-quote-check.txt`.

## Deliverables written

| Path (under `.ufo/waves/round-31/w1/FetchS122/`) | Content |
|---|---|
| `bytes/S122.html` | first-body receipt bytes, 328,088 bytes, sha256 `b15c1c0b…dea33e` |
| `S122.json` | receipt object as specified (id, url, `fetched_at` 2026-10-26T08:36:21Z, fetched_by FetchS122, 200, lane `bytes_path`, sha256) |
| `S122-fetches.tsv` | both fetches: start/end UTC, status, bytes, sha256(bytes), sha256(normalised), effective URL |
| `S122-fetch1.headers`, `S122-fetch2.headers` | raw `-D` header blocks |
| `S122-candidate-quotes.txt`, `S122-quote-check.txt` | the 30 sentences and the substring/word-count/number check |
| `S122-article-body-normalised.txt` | normalised article body (§Avoid polling → §Further reading) |
| `normalise-reimplementation.mjs` | the exact `normalise()` reimplementation used |

L1 copies `bytes/S122.html` to `corpus/evidence/round-31/decision-table/bytes/S122.html` and `S122.json`
to `corpus/evidence/round-31/decision-table/S122.json`; the `sha256` above is the digest of the copied
file, verified after `cp`.

## Sentence inventory (verbatim, with section heading)

Quotes are copied from the normalised bytes, so the counter's q2 substring test holds as written —
note the space-collapsed punctuation (`POST , PATCH`, `0 ,`, `304 Not Modified .`).

### A. Sentences carrying a LITERAL numeric threshold (usable table rows)

**§Pause between mutative requests**

1. > If you are making a large number of POST , PATCH , PUT , or DELETE requests, wait at least one second between each request.
   — 25 tokens (at q1's upper bound exactly), contains `one second`; the page's follow-on sentence is
   "This will help you avoid secondary rate limits." Signal: >1 mutative request in flight; decision:
   `pause`/`wait`; threshold: `at least 1 second`.
2. **§Handle rate limit errors appropriately**
   > Otherwise, wait for at least one minute before retrying.
   — 9 tokens, contains `one minute`; decision: `wait`/`backoff`; threshold: `at least 1 minute`.

Both quotes carry the number as an English word (`one`), so the Threshold cell must use digits
(`at least 1 second` / `at least 1 minute`) to satisfy t4, and n1 passes through the counter's
`NUMBER_WORDS` map (`numbersIn()` at `check-decision-table.mjs:182-190`). Do **not** rewrite the quote
with digits — it must stay a substring of the bytes.

### B. Sentences whose threshold is deferred to a response header (signal without a page-side number)

**§Avoid polling**

3. > If a response includes an x-poll-interval header, wait at least that many seconds before you poll the same endpoint again.
   — 20 tokens; the wait is header-supplied, so no row threshold may be invented for it.
4. **§Handle rate limit errors appropriately**
   > If the retry-after response header is present, you should not retry your request until after that many seconds has elapsed.
   — 20 tokens; header-supplied seconds.
5. > If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header.
   — 22 tokens; `0` is a state value with no unit. A row may use it as a **signal** (`x-ratelimit-remaining: 0`),
   but attaching an invented unit ("0 requests") to make t4 pass would be exactly the J4 invented-threshold
   failure mode — leave it out, or use the paired reset-header sentence below.
6. > The x-ratelimit-reset header is in UTC epoch seconds.
   — 8 tokens; a unit statement, no number.
7. > If your request continues to fail due to a secondary rate limit, wait for an exponentially increasing amount of time between retries, and throw an error after a specific number of retries.
   — 32 tokens (over q1's 25); "exponentially increasing" and "a specific number" are unquantified.

### C. Sentences stating a signal/count/code but no bound

**§Avoid polling**

8. > You should subscribe to webhook events instead of polling the API for data.
9. > Make authenticated conditional requests, so that unchanged data does not count against your primary rate limit.
10. > Request only the data that you need, and keep responses stable, so that more of your polls return 304 Not Modified .
11. **§Make authenticated requests**
    > Authenticated requests have a higher primary rate limit than unauthenticated requests.
    — comparative only, no number.
12. **§Avoid concurrent requests**
    > To avoid exceeding secondary rate limits, you should make requests serially instead of concurrently.
    — no concurrency count stated.

**§Follow redirects**

13. > You should assume that any request may result in a redirection.
14. > Receiving an HTTP redirection is not an error, and you should follow the redirect.
15. > A 301 status code indicates permanent redirection.
16. > A 302 or 307 status code indicates temporary redirection.
17. > Other redirection status codes may be used in accordance with HTTP specifications.
    — **no redirect-count bound appears on this page** (contrast RFC 9309's five-hop crawl bound); only the
    301/302/307 actions are given. A row may cite 301/302/307 as a signal with the "update your code" /
    "do not update your code" decision, but its Threshold cell needs a real number+unit and S122 does not
    supply one for redirection.

**§Use conditional requests**

18. > Making a conditional request does not count against your primary rate limit if a 304 response is returned and the request was made while correctly authorized with an Authorization header.
    — 30 tokens.
19. > This makes conditional requests especially useful when you poll an endpoint, because each 304 Not Modified response is fast and does not use your rate limit.
    — 26 tokens.
20. > Conditional requests for unsafe methods, such as POST , PUT , PATCH , and DELETE are not supported unless otherwise noted in the documentation for a specific endpoint.

**§Make requests that can be cached**

21. > A conditional request only saves you time and rate limit if the endpoint returns 304 Not Modified .
22. > The endpoint returns 304 when the representation that you requested has not changed since you saved its etag or last-modified value; unrelated response headers, such as the date, can still differ.
    — 31 tokens.
23. > A different page size, page number, or filter produces a different response with a different etag .
24. > If you page through a list, use a stable sort order.

**§Do not ignore errors**

25. > You should not ignore repeated 4xx and 5xx error codes.
26. > If you are polling and a resource repeatedly returns a 404 Not Found response, do not keep requesting it on every poll.
27. > GitHub returns a 404 Not Found response instead of a 403 Forbidden response for some private resources when your credentials do not grant access, so a 404 does not always mean that the resource is absent.
    — 36 tokens.
28. > Once you have confirmed that your credentials are correct, wait much longer before you check again, or check again only when you have a reason to believe that the resource now exists.
    — "much longer", unquantified.
29. > Repeatedly requesting a missing resource wastes your rate limit and can trigger a secondary rate limit.
30. > Intentionally ignoring repeated validation errors may result in the suspension of your app for abuse.

### D. Explicit negative findings (do not cite S122 for these)

- **No cache lifetime** appears anywhere: no `max-age`, no seconds-until-stale, no `Cache-Control` number.
  Sentence 22 is the closest and gives none. Cache-lifetime rows must come from another source.
- **No redirect-count bound** (§Follow redirects gives codes and actions only).
- **No page-size cap** (§Make requests that can be cached mentions "page size" as an etag input, no count).
- **No concurrency number** (§Avoid concurrent requests says "serially", no count).
- **No rate-limit count** appears in this article itself; it defers to the Rate limits page
  (§Make authenticated requests: "For more information, see Rate limits for the REST API ."). Those counts
  belong to S121 (`/rate-limits-for-the-rest-api`), not S122 — do not duplicate them onto this row.
- The page banner states `API Version: 2026-03-10 (latest)`; it is a document version, not a limit.

## Notes / risks for the L1

1. **S122 supports at most 2 literal-threshold rows** (sentences 1 and 2). Reaching `admitted >= 10` needs
   the other three registry rows (S119 RFC 9309, S120 RFC 6585, S121 GitHub rate limits) to carry the rest;
   if the table is padded with header-deferred or invented thresholds from S122 it will trip n1/J4.
2. Sentence 1 is **exactly 25 words**, q1's inclusive upper bound (`words()` = whitespace tokens incl.
   standalone punctuation tokens `,`). A longer quote from the same passage fails q1; a shorter one must
   still contain "one second" for n1. Suggested exact span: `wait at least one second between each request.`
   (8 tokens, substring-verified, contains `one second`).
3. Sentence 2's suggested span: `Otherwise, wait for at least one minute before retrying.` (9 tokens).
4. Both thresholds are numerically `1` with different units; that is the source's wording, not a typo.
5. `--live` still re-fetches on the counter's own curl (`--max-time 60`); GitHub Docs serves a stable
   static page (two byte-identical fetches 89 s apart), so l1-live should hold. CDN variation remains
   possible in principle — if l1-live fails later, re-run rather than editing the quote, and re-file the
   receipt if the bytes digest changed.
6. No tool was installed or upgraded for this fetch.

## Commands and exit codes

| Command | Exit |
|---|---|
| `curl` fetch 1 (`-q -sS --proto =https --proto-redir =https -L --max-redirs 5`) | 0, `200 … 328088` |
| `curl` fetch 2 (same form, 89 s later) | 0, `200 … 328088` |
| `node norm.mjs f1.html > f1.txt` | 0 |
| `node norm.mjs f2.html > f2.txt` | 0 |
| `sha256sum f1.html f2.html` / `f1.txt f2.txt` | 0 |
| `cmp -s f1.html f2.html` | 0 |
| `cmp -s f1.txt f2.txt` | 0 |
| `node` quote-presence check over 30 sentences | 0 (30 present, 0 missing) |
| `cp` bytes into output dir + `sha256sum` verify | 0 |

No lane script, build, linter or test was run (lane bounds: the L1 owns the post-integration gate).
