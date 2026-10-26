# CritSourceChoice — C1 first falsifier: source choice and normative reading (tabi round 31, w1)

Seat: attack. Scope: the four registry rows C1 must open (S119 RFC 9309, S120 RFC 6585, S121 GitHub
rate limits, S122 GitHub best practices) — whether each is the authoritative source for the rule a
decision row will state, and whether a row built on it misleads a journey driver when the row text
does not carry the source's scope. Nothing here is a repair; the lane's entry is not edited.

## Verdict

**Defect, severity high, in the claim's prose—not in the counter.** Three of the four sources carry a
real, locatable numeric bound: RFC 9309 states `MUST` at five redirects (§2.3.1.2), `SHOULD NOT` past
24 hours (§2.4) and `MUST` at 500 KiB (§2.5), and every GitHub number the table will want is phrased as
a rule ("No more than *N* … are allowed", plus explicit per-hour quotas). **RFC 6585 supplies no
numeric threshold at all**: its only two numbers, `Retry-After: 3600` (line 145) and "50 requests per
hour" (line 153), sit inside a single `For example:` illustration, and its only normative sentence is
numberless (line 165, `MUST NOT be stored by a cache`). So an S120 row that passes the counter is
necessarily an **example value presented as a threshold** — literally the failure mode control J4
claims to exclude, which J4 does not catch because `n1-threshold-sourced` only tests that the number
occurs *somewhere* in a located quote. I proved that gap end to end: a fixture with seven
scope-misread rows (RFC 9309's parenthetical "for example, 30 days" as a threshold, including one
variant whose truncation drops "for example" entirely; RFC 6585's example `3600` and its example
body's "50 requests per hour"; GitHub's 5,000/hr and "one minute" applied as web norms; and a number
taken from a different semantic role in its own quote) is **admitted 7, failing 1 under `--live`**,
the single failure being a fabricated number absent from its quote. The count a row produces today
certifies "the source contains this digit", not "the source states this bound". The correction is
textual and cheap: 11 rows built only from genuinely stated bounds reach **admitted 11, failing 0,
exit 0 under `--live`** (verified below), so the target of 10 is reachable without leaning on any
example value — at the cost of acknowledging that S120 cannot contribute a counted row.

## Evidence

### 1. Fetch ledger (read-only HTTPS GETs; every fetch this round)

| UTC | URL (final) | status | bytes | sha256 |
|---|---|---|---|---|
| 08:36:57Z | https://www.rfc-editor.org/rfc/rfc9309.txt | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| 08:36:58Z | https://www.rfc-editor.org/rfc/rfc6585.txt | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| 08:37:02Z | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 200 | 337116 | ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18 |
| 08:37:02Z | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 200 | 328088 | b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e |
| 08:37:10Z | https://www.rfc-editor.org/info/rfc9309 → …/info/rfc9309/ (301 first hop, 100 B) | 200 | 322426 | d44881fa803fafb292f5ff26cf31399976fbaeae6dab191c48d8da4946e37445 |
| 08:37:10Z | https://www.rfc-editor.org/info/rfc6585 → …/info/rfc6585/ (301 first hop, 100 B) | 200 | 171482 | cc0123160b49d4abce57f51a1d56c02745afc61d29dd20c0e51fc42bb5f5d968 |
| 08:37:11Z | https://www.rfc-editor.org/info/rfc9110 → …/info/rfc9110/ (301 first hop, 100 B) | 200 | 4793037 | b350f208571ce44ea831403604d9de951f56c284b26b668fed07c33da5305a40 |
| 08:38:04Z | https://www.rfc-editor.org/errata/rfc9309 → errata.rfc-editor.org/search/?rfc_number=9309&presentation=records | 200 | 29336 | 267361137d35282903f423974947b0008177a29c57bc8d90b13222df7d5a627a |
| 08:38:04Z | https://www.rfc-editor.org/errata/rfc6585 → errata.rfc-editor.org/search/?rfc_number=6585&presentation=records | 200 | 11818 | 5215260b5d75ca16b2fdb4a6ff480b7208966433d72c62765bb7a055760e1410 |
| 08:41:34Z | https://www.rfc-editor.org/rfc/rfc9110.txt (supersession test) | 200 | 502941 | 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a |

The RFC 9110 re-fetch is byte-identical to the lane's existing S107 receipt
(`corpus/knowledge/redirect-and-retry-after-semantics.md`, 502941 B, sha256 `21c1cdce…`), so the
comparison below is against the same bytes the lane already holds. RFC 9309's plain text begins with a
UTF-8 BOM (3 bytes) — harmless for quote location, relevant only if a digest is recomputed after any
re-encode.

### 2. S119 — RFC 9309 (robots.txt): **holds as the authoritative source; defect only if a row reads the parenthetical as a threshold**

- Status on the info page: `Proposed Standard`, Standards Track, IETF Non-Working-Group, September
  2022. No `Obsoletes:`/`Updates:` field in the text; the info page displays no "Obsoleted by" /
  "Updated by" successor.
- Errata: 4 records, **all in state `Reported`, none `Verified`** — 7124 (§5.2), 7128 (§2.2.2), 7995
  (§2.2), 8895 (§2.3.1.5). **None touches §2.3.1.2, §2.3.1.3, §2.3.1.4, §2.4 or §2.5**, i.e. every
  numeric statement in the document is errata-free. No "a newer document supersedes" finding.
- The numbers, in the document's own words:
  - line 377: `The crawlers SHOULD follow at least five consecutive redirects, even across authorities.`
  - lines 380-382: `If a robots.txt file is reached within five consecutive redirects, the robots.txt file MUST be fetched, parsed, and its rules followed in the context of the initial authority.` → **a genuine bound**.
  - lines 384-386: `If there are more than five consecutive redirects, crawlers MAY assume that the robots.txt file is unavailable.`
  - lines 419-420: `Crawlers SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable.` → **a genuine bound**.
  - line 425: `The parsing limit MUST be at least 500 kibibytes [KiB].` → **a genuine bound** (on the crawler's parser).
  - lines 406-408: `If the robots.txt file is undefined for a reasonably long period of time (for example, 30 days), crawlers MAY assume that the robots.txt file is unavailable as defined in Section 2.3.1.3 or continue to use a cached copy.` → **"30 days" is a parenthetical example inside a MAY**. The binding rule next door is the opposite direction: `this means the robots.txt file is undefined and the crawler MUST assume complete disallow` (lines 400-402).
- Scope the row must carry: the document binds **crawlers** and obliges **the crawler**, not the
  server; and it says of itself (line 429) `The Robots Exclusion Protocol is not a substitute for
  valid content security measures.` A journey driver reading "disallow" as "the server will refuse"
  is reading a duty on itself as a promise by the site.
- **Mislead risk:** high for the 30-day row, nil for the five/24-hour/500 KiB rows. A row
  `robots.txt unreachable | stop | 30 days` reads a MAY-example as the sanction that *ends* the
  obligation; the spec's actual force runs the other way (MUST assume complete disallow while
  undefined, MAY change only after "a reasonably long period" of which 30 days is one illustration).
  The counter admits it (probe D1, and D6 with "for example" truncated away).

### 3. S120 — RFC 6585 (429): **holds as the definition of 429; defect as a threshold source — it has none**

- Supersession test, run not assumed: `grep -c "429" rfc9110.txt` → **0**. RFC 9110 never defines 429,
  so RFC 6585 §4 remains the only standards-track definition and is **not** obsoleted for this use.
- RFC 6585's own header says `Updates: 2616`. Erratum **8181** (Reported 2024-11-19, still `Reported`)
  proposes changing that metadata to `Updates: 9110`; it edits the header line only, not §4's text —
  no consequence for a 429 row beyond not citing "updates 2616" as if it were current.
- §4's normative content (lines 134-165): the representation `SHOULD` include details and `MAY` include
  `Retry-After` (line 138); `Retry-After: 3600` (line 145) and `I only allow 50 requests per hour…`
  (line 153) are **inside the single `For example:` block**; `Responses with the 429 status code MUST
  NOT be stored by a cache` (line 165) is the section's only MUST, **and it carries no number**. A
  numeric census of the whole document leaves exactly two non-status, non-reference numbers — 3600
  and 50 — both example values.
- The header this table will want to reason about is *not* RFC 6585's subject: `Retry-After`'s
  semantics are RFC 9110 §10.2.3 (lane row S107, lines 4799-4825): the value is an HTTP-date or
  delay-seconds; the two examples there (`Retry-After: 120`, "2 minutes") are also examples, and the
  spec states no default and no lower bound.
- Scope the row must carry: RFC 6585 defines the status, not a wait; and it explicitly refuses the
  counting model (line 158: `this specification does not define how the origin server identifies the
  user, nor how it counts requests`). So no per-request budget can be derived from it.
- **Mislead risk: structural.** A row `429 | wait | 3600 seconds | S120 | "HTTP/1.1 429 Too Many
  Requests … Retry-After: 3600"` is admitted under `--live` (probe D2) and asserts false provenance in
  the claim's own words ("the SOURCE's own numeric thresholds"). Worse, the example body's "50
  requests per hour" is admitted as a *quota* (probe D8) when it is the text of an illustrative
  error page. And the vendor divergence matters: GitHub answers throttling with **403 or 429** (S121,
  extracted-text lines 48, 51, 52), so a driver keyed on RFC 6585's single 429 misses half the
  signals — S118/S116 already say 403 is possible; S120 alone would not.

### 4. S121 / S122 — GitHub docs: **hold as one vendor's policy at a dated fetch; defect if rows present them as web norms**

- Self-declared scope: both pages are titled for GitHub's own REST API ("GitHub limits the number of
  REST API requests that you can make within a specific amount of time", 08:37:02Z receipt).
- There is **no revision or "last updated" marker in either page's text** (grep for `Last updated`,
  `updated on`, `as of` → no match), so the receipt date plus sha256 is the only temporal anchor a row
  can honestly cite; the URL itself is unversioned, so the bytes can change silently.
- The page states its own instability, for the secondary class: `These secondary rate limits are
  subject to change without notice. You may also encounter a secondary rate limit for undisclosed
  reasons.` (extracted-text line 37).
- Numbers that are genuine rules in the source's own phrasing (extracted-text lines): 60/hr
  unauthenticated (:7), 5,000/hr authenticated (:10), 15,000/hr Enterprise Cloud (:10), 1,000/hr
  `GITHUB_TOKEN` per repo (:27), `No more than 100 concurrent requests are allowed` (:31), `No more
  than 900 points per minute … REST` (:32), 90 s CPU per 60 s real time (:32), `no more than 80
  content-generating requests per minute and no more than 500 … per hour` (:35), 2,000 OAuth token
  requests/hour (:36), LFS 300/min and 3,000/min (:12), `wait for at least one minute` fallback (:52).
  S122: `x-poll-interval` seconds (:4), `wait at least one second between each request` (:12), one
  minute default (:17), and two *unquantified* instructions — "exponentially increasing" and "after a
  specific number of retries" (:17) — which yield no threshold and must not be given one.
- Warn-the-driver statements that carry no number (so belong in prose, not a counted row): `avoid
  logic that depends on an exact remaining count` (:48), `The x-ratelimit-* headers are the
  authoritative source … If the two disagree, rely on the response headers` (:47).
- **Mislead risk:** high if the row text omits "GitHub's own API". `cap | 5,000 requests` reads as a
  web-wide pacing rule; `wait | 1 minute` reads as the default when a site sends no `Retry-After`,
  which no standards document says. Both are admitted live (probes D3, D4).

### 5. The counter cannot see any of this — proved, not argued

Frozen counter at 9505a10e (`scripts/check-decision-table.mjs`, sha256 must equal
`d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832`; read at lines 20-50, 220-260). Its
provenance oracle is `q2-quote-located` (substring of the receipt bytes) plus
`n1-threshold-sourced` (`numbersIn(quote).has(thresholdNumber)`), where `numbersIn` harvests **every**
number and English number word in the quote. There is no predicate over normative force (`MUST` vs
`MAY` vs "for example"), none over which document owns the rule, none over vendor vs web scope, and
`q1`'s 25-word ceiling actively encourages truncation — the truncation is where "for example,"
disappears.

Fixture (scratch clone of the lane, four genuine receipts, genuine bytes, rows written to misread
scope; builder `build-fx.mjs`, entry `probe-misread-table.md`):

| row | claim the row makes | why it is wrong | verdict |
|---|---|---|---|
| D1 | robots.txt `500` → **stop**, 30 days | parenthetical example under MAY, quoted with "(for example," intact | ADMITTED |
| D6 | same, threshold 30 days | quote rewritten to `30 days), crawlers MAY assume…` — **"for example" truncated away** | ADMITTED |
| D2 | `429` → **wait** 3600 seconds | RFC 6585's example response body, header is MAY | ADMITTED |
| D8 | `429` → **cap** 50 requests | the illustration's *error-page prose* taken as a quota | ADMITTED |
| D3 | `x-ratelimit-remaining` → **cap** 5,000 requests | one vendor's hourly quota used as a generic pacing bound | ADMITTED |
| D4 | `retry-after` absent → **backoff** 1 minute | GitHub's default fallback asserted as the norm | ADMITTED |
| D7 | backoff 60 seconds, quote "90 seconds of CPU time per **60 seconds** of real time" | number lifted from the denominator of a different rule | ADMITTED |
| D5 | wait 6 hours | number not in the quote | NOT-ADMITTED `n1-threshold-sourced` |

Readings (both runs on the same fixture revision `1e384130260207aed80695727cf79cf5e3712576`,
baseline `96d19058641a32a612e0a42749621271d72477e1`):
- offline: `population 8, admitted 7, failing 1`, **exit 1** (`offline2.json`)
- `--live`: `population 8, admitted 7, failing 1`, **exit 1** (`live3.json`) — the four real URLs were
  re-fetched by the counter at 08:39:56Z and every misread row still passed `l1-live`.

So control **J4** ("inventedThresholdJunk → n1-threshold-sourced") covers *fabricated* numbers only.
It gives no coverage of the failure this seat was asked to test, and a green C1 would not distinguish
the honest table from the misreading one.

## Impacted axes

- **depth (C1's axis)**: at risk. The claimed gain is "a sourced numeric threshold for any decision".
  With example values counted, the entry would be depth-neutral in substance while the count says
  otherwise — a measurement-valid, claim-invalid outcome.
- **freshness**: unaffected (no new dependency on a moving document beyond the two vendor pages,
  which already carry `recheck` conventions).
- **calibration**: unaffected; C2's window reads no knowledge entry, and the coupling disclosed in
  `claims.json` (a gate-registry tally) is untouched by this finding.
- **adjacency**: mildly positive if the S120 finding is written down — it is a reusable rule ("a
  status-code RFC need not contain a threshold").

## Smallest safe correction (text-only; no counter change, no claim change)

1. **Build the counted rows from bounds the sources actually state** — 11 are available: RFC 9309
   §2.3.1.2 (five redirects), §2.4 (24 hours), §2.5 (500 KiB); S121's six explicit "No more than N …
   are allowed" quotas plus the two hourly primary quotas; S122's one-second write spacing and
   one-minute fallback. I verified this set end to end: `admitted 11, failing 0, exit 0` under
   `--live` (`honest-live2.json`, entry `probe-honest-table.md`).
2. **Do not count an S120 row.** It cannot be honest under C1's schema: `t4` needs a time/count/size
   threshold, `n1` needs that number inside the quote, and RFC 6585 contains no normative number. Carry
   RFC 6585 in the entry's prose and in its registry `used-by` (429's definition, the numberless cache
   MUST, the "does not define how the origin counts requests" refusal), and record the finding in the
   lesson's `## Mistakes`. If the L1 insists on a fourth cited source *in the table*, the only honest
   shape is a row whose Threshold cell is explicitly marked as the source's illustration and excluded
   from the 10 — which the counter cannot express, so it should be prose.
3. **Give every row the scope sentence in the Decision cell** (the counter only requires the cell to
   start with a closed-set verb, so a tail is free). Suggested exact tails:
   - S119 rows: `— crawler role only (§2.3.1.2 MUST, cap is the spec's own)` / `— crawler role only (§2.4 SHOULD NOT, 24 h)` / `— the crawler's own parser (§2.5 MUST)`.
     If a 30-day row is kept anyway: `— §2.3.1.4: 30 days is the source's parenthetical EXAMPLE, sanction is MAY; while undefined the MUST is complete disallow`.
   - S120, prose only: `RFC 6585 §4 defines 429 and makes Retry-After optional (MAY); the wait value is the response's, and 3600 in §4 is an example. The header's semantics are RFC 9110 §10.2.3 (S107).`
   - S121 rows: `— GitHub REST only, published value as fetched 2026-10-26 (sha256 …); secondary limits are "subject to change without notice"`.
   - S122 rows: `— GitHub's own pacing default, not a web norm`.
4. **Entry-level scope block, one line per source** (above the table, where the other knowledge entries
   put `tier:`/`ground:`): authority (which document owns the rule), force (`MUST`/`SHOULD`/`MAY`),
   domain (crawler / HTTP status / GitHub API), and the errata state read this round (RFC 9309:
   4 Reported, none in the cited sections; RFC 6585: 8181 Reported, metadata only).
5. **Lesson `## Mistakes` lines** (so the rule survives the round): "a status-code RFC can contain no
   threshold; `n1` proves a digit is present, not that it is a bound"; "a 25-word quote cap can delete
   the `for example` that marks an example — check the marker survived the truncation".

## Honest limitations

- I did not fetch `iana.org`, so I cannot state what the IANA HTTP Status Code Registry currently lists
  as 429's reference; supersession was tested only by grepping RFC 9110 (0 occurrences of "429") and by
  the RFC Editor info pages (no successor). That host is outside this round's permitted list.
- The GitHub pages carry no date marker in their text; "as of 2026-10-26 (sha256 …)" is the strongest
  claim available, and it is the receipt's, not the page's.
- I ran the frozen counter read-only against **fixture repositories of my own**, never against the lane
  and never with lane edits; the fixture's registry rows are mine, not S119-S122's real rows (which do
  not exist at the freeze commit — verified: `grep -n "S119\|S120\|S121\|S122" corpus/SOURCES.md` in the
  freeze clone returns nothing).
- No tool was installed or upgraded this round (nothing needed).

## Commands run (with exit codes)

```
git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q 9505a10e…          # 0
curl -q -sS --proto =https -o rfc9309.txt https://www.rfc-editor.org/rfc/rfc9309.txt           # 0 (200, 25265 B)
curl -q -sS --proto =https -o rfc6585.txt …/rfc6585.txt                                        # 0 (200, 17164 B)
curl -q -sS --proto =https -o <page>.html https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api      # 0
curl -q -sS --proto =https -o <page>.html https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api # 0
curl -q -sS -L --proto =https --max-redirs 3 …/info/rfc9309 …/info/rfc6585 …/info/rfc9110      # 0 (301 → 200 each)
curl -q -sS -L --proto =https --max-redirs 3 …/errata/rfc9309 …/errata/rfc6585                 # 0 (302→200; 4 and 1 records, all Reported)
curl -q -sS --proto =https -o rfc9110.txt …/rfc9110.txt                                        # 0 (200, 502941 B)
grep -c "429" rfc9110.txt                                                                      # 1 — prints 0 (no match)
node build-fx.mjs                                                                              # 0 — fixture BASE 96d19058… HEAD 1e384130…
node clone/scripts/check-decision-table.mjs --repo fx --rev 1e384130… --baseline 96d19058… --entry … --json        # 1 — admitted 7/8
node clone/scripts/check-decision-table.mjs … --live --json                                    # 1 — admitted 7/8 (l1-live passed for all 7)
node build-honest.mjs && node clone/scripts/check-decision-table.mjs --repo fx-honest … --live --json # 0 — admitted 11/11
```

Artifacts in this directory: `probe-misread-table.md` (sha256 `c601d65e…`), `probe-honest-table.md`
(`9d5fb86c…`), `offline2.json` (`de7b5fe6…`), `live3.json` (`6e9a6845…`), `honest-live2.json`
(`8a8fee9a…`), builders `build-fx.mjs` (`7b7f92d1…`) and `build-honest.mjs` (`418e605f…`), plus the two
RFC texts as fetched (`f633915d…`, `f6d55d1b…`). Scratch clone and fixtures were under
`$HYAKU_SCRATCH/tabi-r31/CritSourceChoice` with `TMPDIR` set there.
