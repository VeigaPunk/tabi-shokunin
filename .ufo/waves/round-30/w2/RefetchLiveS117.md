# RefetchLiveS117 — independent live re-open of row S117 (round 30, w2, C2)

**Verdict: HOLDS at the claim surface, with two low-severity content defects and one informational
limit.** I re-opened `https://docs.discord.com/developers/topics/rate-limits` myself from a third
seat (neither `fetched_by: FetchS182` nor the refetch seat `ScribeEntryDiscordHeaders`), 56 minutes
after both committed fetches: HTTP 200, `num_redirects=0`, 408912 bytes, sha256
`6a837b8d…17b7c3`. Normalised with **the exact code** of `normalise()` in the frozen
`scripts/check-frontier-admission.mjs` (sha256 `cadef57e…9eca`, equal to `frozenDigests`), my live
text is **byte-identical to the committed
`corpus/evidence/round-30/frontier/bytes/S117.html`**: 8728 chars, sha256
`c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` on all three bodies (committed,
refetch, live) — exactly the figure the S117 registry row advertises. Raw bytes differ across the
three fetches in **3 runs totalling 17 bytes**, all inside Cloudflare's injected
`window.__CF$cv$params` script (offsets 408143–408171); the embedded beacon timestamps decode to
`06:40:02Z`, `06:40:32Z` and `07:34:42Z`, matching the two receipts and my own recorded UTC time to
the second, with three distinct `cf_ray` values — independent corroboration that the committed bytes
are a genuine wire capture and not a local re-expression. All 14 double-quoted spans of ≥4 words in
the entry locate in the live bytes (0 misses, 0 non-unique), as does the 25-word receipt quote; the
emoji-route caveat is **not** out of context in the entry (§2 quotes the full three-sentence passage
and scopes it correctly). The two defects: the entry's §4 invalid-request rule omits the page's own
`X-RateLimit-Scope: shared` carve-out, and the *receipt* (not the entry) carries the context-stripped
emoji fragment. The frozen counter at the tip agrees: exit 0, `population 2, admitted 2, failing 0,
clean true`.

## What I attacked

1. Whether the committed S117 bytes still equal the live document after normalisation (C2's `l3`,
   `--live`), from a seat outside both recorded fetches.
2. Whether every quote the entry rests on is actually in *those* bytes, is unique there, and is
   quoted in a context that agrees with the page (in particular the emoji-route per-guild caveat).
3. The provenance of the committed bytes (does the raw body corroborate the receipt's `fetched_at`
   and not merely its sha?).
4. The S117 registry row's own factual cells (normalised length/sha, `dateModified`, "no version
   marker", "raw bytes vary per response").
5. The cross-entry claims S117 §6 makes about S116's draft vocabulary (duplicate-authority risk).

Everything ran in a `git clone --shared` of the lane at
`072af95fe2822f0785a6ff88a578e2142dd258e5` (`git status --porcelain` empty), scratch
`/fast/scratch/hyaku/tabi-r30/RefetchLiveS117`. No installs, no pacman, no builds; the only network
was the read-only HTTPS GETs recorded below plus the two GETs the frozen counter makes itself under
`--live`.

## Evidence

### Fetch record (my two GETs)

| # | URL | UTC start | HTTP | final URL | redirects | bytes | sha256 |
|---|---|---|---|---|---|---|---|
| 1 | `https://docs.discord.com/developers/topics/rate-limits` | 2026-10-26T07:34:42Z | 200 | same (no redirect) | 0 | 408912 | `6a837b8dd744e4e4c7f7a3144d5c1561f321718ba3588be694b29fa8e417b7c3` |
| 2 | same | 2026-10-26T07:36:50Z | 200 | same | 0 | 408912 | not kept (`-o /dev/null`; status/size/redirect probe only) |

Body of #1 kept at `RefetchLiveS117/live.S117.html` (408912 B, sha as above); metadata in
`RefetchLiveS117/live.meta`, `live.time`, `fetch-receipt.json`. Both GETs used
`curl -sS -L --max-time 60` (curl 8.23.0, node v24.21.0).

### Equality after `normalise()` (C2 `l3-live-bytes` for S117)

`normalise` was extracted verbatim (lines 136–152 of the frozen counter: `ENTITIES` +
`normalise`) into `norm.mjs` (sha256 `6223e531…8220`) and imported — not re-implemented.
The counter's own `entryQuotes`/`headerOf` logic (`lines.slice(15)`) was copied the same way for
the quote audit.

```
$ node normcmp.mjs ; echo exit=$?
{
  "live_len": 8728, "committed_len": 8728, "refetch_len": 8728,
  "live_eq_committed": true, "live_eq_refetch": true, "refetch_eq_committed": true,
  "live_norm_sha256": "c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007",
  "committed_norm_sha256": "c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007",
  "refetch_norm_sha256": "c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007"
}
exit=0
```

So `l3` for S117 holds at 07:34Z, ~56 min after the committed pair, from a third seat. w1's
`CritC2Counter` was right that `l3` is text-only; for *this row* I closed that gap at the raw level
(see below): the two bodies differ in nothing but the CF beacon.

### Raw-byte divergence is exactly the CF beacon

```
$ cmp -l live.S117.html clone/corpus/evidence/round-30/frontier/bytes/S117.html | wc -l
17
```

Run-length diff of the two 408912-byte bodies: **3 runs, 17 bytes total**, offsets 408143 (1 B),
408145 (9 B), 408165 (7 B) — the `r:`/`t:` nonce pair inside
`window.__CF$cv$params={r:'…',t:'…'}`. Every other byte, scripts included, is identical.

| body | bytes | cf_ray | cf token (base64 decode) | embedded UTC | receipt `fetched_at` |
|---|---|---|---|---|---|
| committed `bytes/S117.html` | 408912 | `a507779d197145a6` | `1792996802` | 2026-10-26T06:40:02Z | 06:40:02Z ✓ |
| refetch `refetch/bytes/S117-refetch.html` | 408912 | `a507785b992f772a` | `1792996832` | 2026-10-26T06:40:32Z | 06:40:32Z ✓ |
| live (this seat) | 408912 | `a507c7b1da8ce126` | `1793000082` | 2026-10-26T07:34:42Z | — (my `live.time` = 07:34:42Z ✓) |

Receipt `sha256` fields re-derived: committed = `b73dc7d1…83c3` ✓, refetch = `c1c2d3f9…b2f3` ✓,
refetch `byte_count` 408912 ✓, `seat` (`ScribeEntryDiscordHeaders`) ≠ `fetched_by` (`FetchS182`) ✓.
This also explains the row's "raw bytes vary per response (three fetches, 408912 B each)": the beacon
is fixed-width, so the length is stable while the sha is not. Confirmed over 4 fetches (both records
plus my two).

### Quote audit — every ≥4-word double-quoted span, and the receipt quote

`node quotes.mjs` (exit 0; full output `RefetchLiveS117/quotes.txt`): **14 spans, 0 misses against
the live bytes, 0 against the committed bytes**; receipt quote 25 words (inside `g4`'s ≤25), located
once in both. `node uniq.mjs` (exit 0): 0 spans non-unique, receipt quote unique — no span is
satisfied by an incidental duplicate (e.g. the doubled "Copy page" text). `node slicecheck.mjs`
(exit 0): the first 15 lines the counter skips contain no ≥4-word quoted span, so `q1`'s body-slice
hides nothing in this entry.

| # | words | span (abridged where long) | live | committed |
|---|---|---|---|---|
| 1 | 19 | For most API requests made, we return optional HTTP response headers … | ✓ | ✓ |
| 2 | 8 | The number of requests that can be made | ✓ | ✓ |
| 3 | 9 | The number of remaining requests that can be made | ✓ | ✓ |
| 4 | 16 | Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which … | ✓ | ✓ |
| 5 | 13 | Total time (in seconds) of when the current rate limit bucket will reset. | ✓ | ✓ |
| 6 | 16 | A unique string denoting the rate limit being encountered (non-inclusive …) | ✓ | ✓ |
| 7 | 18 | Returned only on HTTP 429 responses if the rate limit encountered is the global … | ✓ | ✓ |
| 8 | 21 | Value can be user (per bot or user limit), global …, or shared … | ✓ | ✓ |
| 9 | 41 | Routes for controlling emojis do not follow the normal rate limit conventions. … | ✓ | ✓ |
| 10 | 22 | In the case that a rate limit is exceeded, the API will return a HTTP 429 … | ✓ | ✓ |
| 11 | 18 | Your application should rely on the Retry-After header or retry_after field … | ✓ | ✓ |
| 12 | 13 | Note that normal route rate-limiting headers will also be sent in this response. | ✓ | ✓ |
| 13 | 13 | All bots can make up to 50 requests per second to our API. | ✓ | ✓ |
| 14 | 11 | Interaction endpoints are not bound to the bot’s Global Rate Limit. | ✓ | ✓ |

Context check on the tricky ones, against the page text (normalised offsets in `live.norm.txt`):

- **Emoji-route caveat — in context in the entry.** Entry line 62 quotes the passage whole (41
  words), and §2 (entry lines 59–69) states the scope correctly: "One class of routes is limited by a
  different scope than the origin … The scope is the emoji-control routes, not the API as a whole.",
  resting on the page's own two preceding sentences. Verified against the bytes: the three sentences
  are contiguous (`…Routes for controlling emojis… per-guild basis to prevent abuse. This means that
  the quota returned by our APIs may be inaccurate…`). The entry's provenance claim about the package
  is also true, not invented: staged `host-rate-limit-header-set-r16.md` quotes **only** "This means
  that the quota returned by our APIs may be inaccurate, and you may encounter 429s." and reads it as
  "the host's own caveat about its budget" generally.
- **Scope table row (entry line 33)** quotes only the value list, dropping the cell's leading
  "Returned only on HTTP 429 responses."; the 429-only qualifier is stated in prose (line 85, line
  145) and the row's `teaches` cell — not a context inversion, but the cell alone is weaker than the
  page.
- **`Reset-After` cell (span 5)** ends at the period; the page continues "Can have decimals to match
  previous millisecond ratelimit precision". The entry's prose carries that fact ("may carry
  decimals"), so no loss.
- **`Scope`/`Global` mapping (§6 line 145, "429-only qualifiers")** matches the page's "Returned only
  on HTTP 429 responses." for both cells.

### S117 registry row's factual cells

- normalised `8728 chars`, sha256 `c719ecca…4007` → reproduced exactly (above).
- `dateModified 2026-02-06T17:38:32.017Z` → present in the raw live body as
  `"dateModified":"2026-02-06T17:38:32.017Z"` (and identically in the committed body). It is absent
  from normalised text because it sits inside a `<script>` blob that `normalise` strips — so the
  row's metadata is grounded in the raw fetch, not the normalised one.
- "no version marker" → 0 occurrences of `version` in the page's normalised text; the raw body carries
  only site-build fields (`buildId 6adb90d9e6de455b2093f90a`, `clientVersion 0.0.3966`,
  `schemaVersion v3`), i.e. build metadata, not a documentation version. The row is right to rely on
  a 90-day recheck. (The buildId is identical in the committed and live bodies, consistent with the
  17-byte diff.)
- H1 `Rate Limits`, `§Header Format` / `§Exceeding A Rate Limit` / `§Global Rate Limit` /
  `§Invalid Request Limit aka Cloudflare bans` all present; the per-guild paragraph does precede
  `Header Format`, as the row states.

### Cross-entry (S117 §6 → S116)

Checked S117's restatement of the draft vocabulary against S116's committed bytes: `q` REQUIRED
("indicates the quota allocated by this policy measured in quota units"), `qu`/`w`/`pk` OPTIONAL,
`r` REQUIRED, `t` OPTIONAL ("the time within which the client can use no more than the available
quota"), `pk` "value MUST be a Byte Sequence" (both §3.1.4 and §4.1.3). S117 §6 and line 144 match
this exactly, including "the draft's `pk` is a byte-sequence value (S116)". **No conflict** — the two
entries carve the domain correctly (S116 owns the normative draft, S117 the host's wire set).

### Frozen counter at the tip (context, not my operand)

```
$ sha256sum scripts/check-frontier-admission.mjs
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca   (= frozenDigests)

$ node scripts/check-frontier-admission.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 \
    --frontier rate-tos-signal --since 2026-10-26 --live --json
{ "live": true, "population": 2, "admitted": 2, "failing": 0,
  "entries": [ {"ids":["S117"],"admitted":true}, {"ids":["S116"],"admitted":true} ],
  "clean": true }
exit=0
```

(That run performs its own live GETs of the S116 and S117 URLs; I did not log their individual
status/byte counts, only the aggregate verdict.)

## Findings

**F1 (defect, LOW — completeness/context). The entry's invalid-request rule omits the page's
`X-RateLimit-Scope: shared` carve-out.** Entry lines 104–107: "IP addresses making too many invalid
requests — 401, 403 or 429 responses — are temporarily restricted, at a documented 10,000 per 10
minutes … A receipt that records repeated 401/403/429 outcomes is therefore recording inputs to a
second limit that no response header declares". The page, two sentences further into the same
passage, says: *"429 errors returned with `X-RateLimit-Scope: shared` are not counted against you."*
(normalised offset 8147; the sentence occurs once in the page and in **neither** entry). The entry
spends §3 distinguishing shared-scope 429s, so the omission is not a scope choice but a gap: a
journey following §4 would treat a shared-scope 429 as an input to the invalidity cap when the
publisher says it is not. The quoted span used is accurate; the *inference* is over-broad.
*Smallest safe correction:* append one sentence to §4 recording the carve-out (no quote needed; it
is a rule, not a claim), or add "except 429s carrying `X-RateLimit-Scope: shared`" to the
"401/403/429 outcomes" phrase — a ≤25-word quoted span already exists to ground it if preferred.

**F2 (defect, LOW — provenance hygiene). The receipt/Gate quote is the context-stripped fragment,
not the passage.** `S117.json`'s and `corpus/lessons/round-30.md:16`'s quote begins mid-sentence:
`limited on a per-guild basis to prevent abuse. …` — dropping "Routes for controlling emojis do not
follow the normal rate limit conventions. These routes are specifically", i.e. the subject and the
scope. It is verbatim (unique, 25 words, the exact fragment the staged S182 row used to generalise
the caveat). Not a claim violation — the entry's §2 quote is the full passage and the lesson labels
the row "the per-guild exception paragraph" — but the receipt JSON carries no label, so a reader of
the receipt alone gets the same subjectless text that caused the round's correction. A 25-word budget
cannot hold the subject *and* the caveat (the 41-word passage does not fit), so the smallest safe
correction is a `"context"` field on `S117.json` naming the preceding two sentences (harmless to the
counter, which reads only `url/quote/fetched_at/fetched_by/http_status/sha256`).

**F3 (informational — limit of `l3`, bounded here).** `l3-live-bytes` compares normalised text, so a
change confined to tags/scripts would be invisible (w1 `CritC2Counter` F2). For S117 that blindness
is measurably empty: the committed and live bodies differ in 17 bytes and nothing else, all of them
the CF beacon. Raw sha can never be the stability check for this URL; the row already says so.

**F4 (informational — duplicate authority, latent).** S117 §6 restates S116's draft parameters
(`q/qu/w/pk`, `r/t/pk`, `pk` MUST be Byte Sequence). It is correct today and cited "(S116)", but it
is a second statement of vocabulary S116 owns; if the draft entry is re-derived, §6 can drift
silently. No conflict now; the map table is the place a drift would appear.

**F5 (informational — independence is now stronger than the claim needed).** The two recorded fetches
are 30 s apart (06:40:02Z / 06:40:32Z), so in-round independence is temporal-thin; my 07:34:42Z
third-seat fetch with identical normalised text and identical non-beacon bytes closes that particular
gap. `g7`'s seat-label test is still a label test (w1 F7); nothing here changes that.

## Axes

- **coverage (C2's axis): holds; no movement claimed by me.** The entry is grounded in bytes that a
  third seat reproduces, and its quotes are all in-document. F1 costs a little vocabulary
  completeness for the invalidity-cap class, not the rate-limit class itself.
- **calibration: untouched.** I contradict no tally.
- **operability: untouched.** I changed no script; F3 is a property of the frozen `l3`, already named
  by w1, not a new counter defect.
- **freshness: holds at observation time** (live body equals the 06:40 commit at 07:34; same
  `buildId`), with the 90-day recheck the only guard, as the row says.

## Commands run and exit codes

All in `/fast/scratch/hyaku/tabi-r30/RefetchLiveS117` (receipts copied to
`.ufo/waves/round-30/w2/RefetchLiveS117/` before cleanup):

```
git clone --shared …/tabi-shokunin "$S/clone" ; git -C "$S/clone" checkout -q 072af95f…
   -> HEAD 072af95fe2822f0785a6ff88a578e2142dd258e5 ; git status --porcelain | wc -l = 0      exit 0
sha256sum clone/scripts/check-frontier-admission.mjs                                            exit 0  (cadef57e…9eca)
curl -sS -L --max-time 60 -o live.S117.html -w … https://docs.discord.com/developers/topics/rate-limits
   -> http_code=200 url_effective=same size_download=408912                                      exit 0
sha256sum live.S117.html                      -> 6a837b8d…17b7c3                                exit 0
sha256sum bytes/S117.html                     -> b73dc7d1…83c3    (receipt match)               exit 0
sha256sum refetch/bytes/S117-refetch.html     -> c1c2d3f9…b2f3    (refetch record match)         exit 0
node normcmp.mjs                              -> all three normalised bodies equal              exit 0
node quotes.mjs                               -> 14 spans, 0 misses; receipt quote 25 w, found  exit 0
node uniq.mjs                                 -> 0 non-unique spans; receipt quote unique        exit 0
node slicecheck.mjs                           -> front matter has no ≥4-word span               exit 0
cmp -l live.S117.html bytes/S117.html | wc -l -> 17 (3 runs, CF beacon only)                     exit 0
node scripts/check-frontier-admission.mjs --rev 072af95f… --frontier rate-tos-signal \
     --since 2026-10-26 --live --json          -> population 2 / admitted 2 / clean true        exit 0
```

Scratch (`$HYAKU_SCRATCH/tabi-r30/RefetchLiveS117`) removed after the receipts were copied; the
lane checkout was only read (`git rev-parse`, `git status`, `git log`-free reads via the clone).

## Report directory contents

`.ufo/waves/round-30/w2/RefetchLiveS117/`: `live.S117.html` (my 408912 B body), `fetch-receipt.json`,
`live.meta`, `live.time`, `cf-token-provenance.txt`, `normcmp.json`, `quotes.txt`, `uniq.txt`,
`slice.txt`, `c2-live.json`, and the exact scripts run (`norm.mjs`, `normcmp.mjs`, `quotes.mjs`,
`uniq.mjs`, `slicecheck.mjs`).
