# FetchS120 — C1 build, S120 receipt (RFC 6585)

## Verdict

S120 is fetched and receipted, and it is a **thin but honest** source for a rate-signal decision table. Two
independent fetches of `https://www.rfc-editor.org/rfc/rfc6585.txt` returned HTTP 200 on the same host,
79 s apart, byte-identical (17 164 B, sha256 `f6d55d1b…876e58`) and identical after the counter's
`normalise()` (sha256 `2e9eae28…14f4d4`, 14 287 chars); the first body is the receipt bytes at
`bytes/S120.txt`. The page yields exactly **one** cleanly quotable numeric rate sentence ("I only allow 50
requests per hour to this Web site per logged in user.") and **one** numeric wait that exists only as an
example message body (`Retry-After: 3600`), whose unit word ("seconds") never occurs in this document —
grep for `second|minute|hour|day|byte|KiB|concurrent|crawl|backoff|throttl` matches only three lines
(138, 145, 153). The four normative cache rules ("MUST NOT be stored by a cache") carry **no number**, so
they cannot be turned into `t4`/`n1`-passing rows at all (see §3). RFC 6585 therefore cannot carry the
C1 threshold population by itself; it can contribute at most two rows, one of them example-derived.

## 1. Fetch evidence

Toolchain: `curl 8.23.0` (OpenSSL 3.6.5), `node v24.21.0`, `git 2.56.0`. Scratch:
`/fast/scratch/hyaku/tabi-r31/FetchS120` (`HYAKU_SCRATCH=/fast/scratch/hyaku`). No tool installs or
upgrades were needed or made.

```sh
mkdir -p /fast/scratch/hyaku/tabi-r31/FetchS120
cd /fast/scratch/hyaku/tabi-r31/FetchS120
# fetch 1
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -D h1.txt -o b1.txt \
     -w '%{http_code} %{url_effective} %{size_download}' https://www.rfc-editor.org/rfc/rfc6585.txt
#  -> 200 https://www.rfc-editor.org/rfc/rfc6585.txt 17164     exit=0
sha256sum b1.txt                                              # exit=0
#  -> f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58
# fetch 2 (after `sleep 62`)
curl -q -sS --proto =https --proto-redir =https -L --max-redirs 5 -D h2.txt -o b2.txt \
     -w '%{http_code} %{url_effective} %{size_download}' https://www.rfc-editor.org/rfc/rfc6585.txt
#  -> 200 https://www.rfc-editor.org/rfc/rfc6585.txt 17164     exit=0
sha256sum b2.txt                                              # exit=0
#  -> f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58
node norm.mjs b1.txt                                          # exit=0
#  -> 2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4 14287
node norm.mjs b2.txt                                          # exit=0
#  -> 2e9eae28d25831e5bba47c1f653ab36e959abf7e85d2d85d2ae4fe20fd14f4d4 14287
```

| fetch | UTC (response `date:` header) | status | host | bytes | sha256 | normalised sha256 | normalised len |
|---|---|---|---|---|---|---|---|
| 1 | 2026-10-26T08:36:10Z | 200 | www.rfc-editor.org | 17164 | f6d55d1b…876e58 | 2e9eae28…14f4d4 | 14287 |
| 2 | 2026-10-26T08:37:29Z | 200 | www.rfc-editor.org | 17164 | f6d55d1b…876e58 | 2e9eae28…14f4d4 | 14287 |

**The two normalised texts are identical** (`normalised_identical yes`), as are the raw bytes. No redirect
was followed (effective URL == requested URL in both fetches). Response headers show
`content-type: text/plain;charset=utf-8`, `cache-control: public, max-age=86400`, `link:
<https://www.rfc-editor.org/info/rfc6585/>; rel="canonical"`, `HTTP/2 200`. Headers are kept verbatim as
`S120-fetch1.hdrs` / `S120-fetch2.hdrs` (a `set-cookie` is present in them — that is server-side session
material, recorded as shape only, never used or replayed).

`normalise()` was **reimplemented**, not imported: importing
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-decision-table.mjs` runs `main()`. The
reimplementation is copied verbatim from lines 134–152 of that file (HTML branch, entity table, final
`\s+` collapse), retained as `normlib.mjs`.

Every quote in §3 was then checked for `q2`-style location and `q1`-style word count against the
normalised bytes:

```sh
node verify-report-quotes.mjs        # retained in the output dir; exit=0
# 1-428-cache located=true words=13      8-431-cache   located=true words=13
# 2-429-def located=true words=21        9-511-cache   located=true words=13
# 3-retry-prose located=true words=25   10-port80      located=true words=39
# 4-example-429 located=true words=9    11-meta        located=false words=4
# 5-50-req located=true words=18        12-port443     located=true words=32
# 6-429-cache located=true words=13     13-class       located=true words=35
# note-counting located=true words=19   note-notrequired located=true words=10
# note-optional located=true words=13
```

Full output kept as `quote-verify.txt`. The single `located=false` is the `meta refresh` element of §6.1 —
the HTML-stripping consequence documented in §3 item 11 and §4.

## 2. Files written (output dir `.ufo/waves/round-31/w1/FetchS120/`)

| Path | Content |
|---|---|
| `bytes/S120.txt` | 17 164 B, sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` (first fetch body) |
| `S120.json` | `{"id":"S120","url":"https://www.rfc-editor.org/rfc/rfc6585.txt","fetched_at":"2026-10-26T08:36:10Z","fetched_by":"FetchS120","http_status":200,"bytes_path":"corpus/evidence/round-31/decision-table/bytes/S120.txt","sha256":"f6d55d1b…876e58"}` |
| `S120-fetches.tsv` | both fetches (utc, status, bytes, sha256, normalised sha256/len, effective url, host) + `normalised_identical yes` / `bytes_identical yes` |
| `S120-fetch1.hdrs`, `S120-fetch2.hdrs` | verbatim response headers |
| `normlib.mjs` | verbatim `normalise()` reimplementation (counter lines 134–152) used for the normalised digests |
| `verify-report-quotes.mjs`, `quote-verify.txt` | every §3 quote checked for location + word count against the normalised bytes |

Receipt self-check (js): `json_ok S120 200 corpus/evidence/round-31/decision-table/bytes/S120.txt`,
`sha_match true bytes 17164` — exit 0. **L1 must copy `bytes/S120.txt` to
`corpus/evidence/round-31/decision-table/bytes/S120.txt`**; `g3-bytes` compares that committed file's
sha256 with the receipt's.

## 3. Every sentence on the page with a numeric limit, wait, cache lifetime, size, count or redirect bound

Line numbers are raw-text lines in `bytes/S120.txt`; wrapped lines are joined with one space, exactly as
`normalise()` collapses them. Exhaustive basis: `grep -n -i -E 'second|minute|hour|day|byte|KiB|concurrent|retry|throttl|backoff|delay|crawl'` matches **only** lines 138, 145, 153, and a digit sweep of the
whole file leaves only status codes, section/page/date/reference numbers below.

### §3. 428 Precondition Required
1. **"Responses with the 428 status code MUST NOT be stored by a cache."** (line 130) — cache lifetime 0;
   the only number is the status code 428, so `t4` (needs a unit) + `n1` (number must be in quote) cannot
   both hold.

### §4. 429 Too Many Requests
2. **"The 429 status code indicates that the user has sent too many requests in a given amount of time
   ("rate limiting")."** (lines 134–135) — defines the signal, no number. Warning: the straight double
   quotes around `rate limiting` make this unusable as a `"…"`-wrapped `Located quote` cell unless wrapped
   in curly quotes (`q1` counts spans).
3. **"The response representations SHOULD include details explaining the condition, and MAY include a
   Retry-After header indicating how long to wait before making a new request."** (lines 137–139) —
   wait, no number (25 words: exactly the `q1` upper bound).
4. **"Retry-After: 3600"** (line 145, inside the example 429 response) — numeric wait **3600**; the
   document never names the unit (§ `second` occurs nowhere), so a `t4` cell must supply the unit
   (`3600 s`) from RFC 2616/9110 (`Updates: 2616`), not from this page's words. Minimum usable quote is
   the 9-word block **"HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600"**
   (line 143–145); `"Retry-After: 3600"` alone is 2 words and fails `q1` (6..25 words), and the span from
   line 137 to line 145 is 36 words, also failing `q1`.
5. **"I only allow 50 requests per hour to this Web site per logged in user.  Try again soon."**
   (lines 153–154, example response body) — **50 requests per hour**; the cleanest numeric rate on the
   page (18 words as quoted above; the first sentence alone is 15 words — both inside `q1`'s 6..25
   ceiling, unit words "requests … per hour" present, number 50 in-quote). It is example text, not
   normative.
6. **"Responses with the 429 status code MUST NOT be stored by a cache."** (line 165) — cache lifetime 0,
   no number.

### §5. 431 Request Header Fields Too Large
7. **"The 431 status code indicates that the server is unwilling to process the request because its
   header fields are too large.  The request MAY be resubmitted after reducing the size of the request
   header fields."** (lines 177–179) — size bound with **no** number (the RFC gives no header-size limit;
   Cf. RFC 9110 for a numeric hint, and the counter's own `inventedThresholdJunk` control rejects numbers
   the source does not state).
8. **"Responses with the 431 status code MUST NOT be stored by a cache."** (line 201) — cache lifetime 0,
   no number.

### §6. 511 Network Authentication Required
9. **"Responses with the 511 status code MUST NOT be stored by a cache."** (line 220) — cache lifetime 0,
   no number.

### §6.1. The 511 Status Code and Captive Portals
10. **"Unknown clients then have all traffic blocked, except for that on TCP port 80, which is sent to an
    HTTP server (the "login server") dedicated to "logging in" unknown clients, and of course traffic to
    the login server itself."** (lines 245–248) — a channel/port bound (80), not a rate; the embedded
    straight quotes also break `q1` unless wrapped in curly quotes.
11. `<meta http-equiv="refresh" content="0; url=https://login.example.net/">` (lines 265–266) — redirect
    delay **0** s. **Not quotable**: because the page's own examples contain `<html>`, `normalise()`
    takes the HTML branch and strips every `<…>` tag, so the normalised text has **0** `<` characters and
    the whole `meta` element (the only `0` on the page) is gone (`located:false` for both the element and
    its `content=` attribute; `"refresh"` absent from the normalised text).

### §7.4. 511 Network Authentication Required (Security Considerations)
12. **"Also, note that captive portals using this status code on a Secure Socket Layer (SSL) or Transport
    Layer Security (TLS) connection (commonly, port 443) will generate a certificate error on the
    client."** (lines 323–325) — port number only; a driver consequence (cert error on TLS captive
    portal), not a numeric limit.

### §1. Introduction (class handling, for completeness)
13. **"However, because clients will treat unknown status codes as a generic error of the same class
    (e.g., 499 is treated as 400 if it is not recognized), they can be safely deployed by existing
    servers"** (lines 84–87) — numbers 499/400 are example code values, no unit; not a threshold.

Non-numeric rate/crawl material on the page, for row design: §4's "Note that this specification does not
define how the origin server identifies the user, nor how it counts requests." (158–159) and the
per-resource / whole-server / server-set counting sentence (159–162); §7.2's "servers are not required to
use the 429 status code" (300–301); §7.1's 428 is optional (291–292). §8 IANA registry values
(428/429/431/511) are code assignments, not thresholds.

Quotes marked 7 (35 words), 10 (39), 12 (32) and 13 (35) are cited for completeness, **not** offered as
`q1` spans: they exceed the counter's 25-word ceiling. The only two spans on this page that can be a
`Located quote` cell *and* carry a number are items 4 (9 words) and 5 (15 or 18 words).

### Received-header number (not part of the document)
The fetch response carries `cache-control: public, max-age=86400` — an 86 400 s cache lifetime for this
very page. It lives in the headers (`S120-fetch1.hdrs`), not in the receipt bytes, so it can never be a
`q2`-located quote. Do not build a row on it.

## 4. What this means for C1's table (constraints, verified against the frozen counter's rules)

Read from `scripts/check-decision-table.mjs` (lines 26–60 rule list, 84 `HEADER`, 90 `UNIT_RE`, 134–152
`normalise`, 176–193 `quoteSpans`/`numbersIn`), not from a counter run:

- `q1` needs **exactly one** quoted span, 6..25 words → quotes containing internal straight quotes must
  be wrapped in curly quotes, and short example fragments must be extended to their block.
- `q2` compares against `normalise(bytes)`; HTML-mode stripping (triggered here by example `<html>`)
  deletes all angle-bracket text — so every `<…>` example on this page (428/429/431/511 bodies, the
  `meta refresh`) is unquotable.
- `t4` accepts only units `s|sec|seconds|min|minutes|h|hours|days|KiB|MiB|bytes|requests|redirects|points|attempts|retries|concurrent` (with optional bound words) → "50 requests" and "3600 s" are the only shapes
  available here; "MUST NOT be stored by a cache" has no expressible unit+number pair.
- `n1` requires the threshold number to appear in the quote (digits, thousands separators ignored, or a
  number word) → the zero-cache rules are excluded twice over: no `0` in the sentence and no `0` anywhere
  in the locatable text.

Usable S120 rows for the L1 (both need the row's own registry row and `used-by`, which is not my seat):
`D<n> | `429` | … | 50 requests | S120 | "I only allow 50 requests per hour to this Web site per logged
in user. Try again soon."` (example-derived rate) and `D<n> | `Retry-After` | wait | 3600 s | S120 |
"HTTP/1.1 429 Too Many Requests Content-Type: text/html Retry-After: 3600"` (example-derived wait; the unit
is imported, since the page says no unit word). Both quotes were verified as located substrings of the
normalised bytes (`located:true`, numbers `[50]` and `[1.1,429,3600]`, word counts 15 and 9).

## 5. Risks / blockers

- **Population risk (C1, not mine to fix):** RFC 6585 can supply at most two admitted rows and both are
  example-body numbers, not normative thresholds. The `admitted >= 10` target has to come from S119, S121
  and S122 (and any further rows the L1 opens). S120 should be weighted accordingly — do not stretch it
  with a cache-lifetime row it cannot source.
- **Unit provenance for `Retry-After: 3600`:** the number is the page's, the unit is not. If the L1 wants
  an unambiguously unit-bearing wait row, it needs a source that spells the unit (RFC 9110 §10.2.3 is
  S107, already in the registry at baseline → `r4-new-row` would reject it).
- **HTML-mode stripping is content-dependent:** `normalise()` decides HTML by regex on example text, so
  quotes near `<…>` in *any* fetched RFC can silently fail `q2`. This bit twice here (meta refresh, and it
  is why the example bodies only survive their inner text). Worth a line in the round-31 lesson.
- Nothing was committed, nothing under the lane checkout was touched, no lane script was run, no counter
  was run (the predicate run belongs to the L1 post-integration). No subagent was spawned.
