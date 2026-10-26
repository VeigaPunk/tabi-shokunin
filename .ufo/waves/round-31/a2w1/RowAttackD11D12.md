# RowAttackD11D12 — C1 rows D11–D12 (GitHub 90 s CPU / 60 s derived; x-ratelimit-remaining 0 stop), round 31 a2w1

**Verdict (one paragraph).** Both attacked rows **hold**. I re-opened both source pages live myself (read-only GETs, 2026-10-26T12:29:10Z, HTTP 200) and normalised them with the frozen counter's own `normalise()` (extracted byte-for-byte from `scripts/check-decision-table.mjs`, sha256 `d15f3bd7…` = `claims.json.frozenDigests`): D11's and D12's quotes are verbatim and located in the committed receipt bytes **and** in my independent live fetch, and the normalised receipt body equals the normalised live body for both pages (S121 15,503 chars, S122 13,476 chars). D11's threshold number 90 is the quantity the quote bounds (CPU time, not response time, status code or year), the bound word "no more than" and the 60 s denominator match, and the row's response-time proxy is **the source's own next sentence** ("You can roughly estimate the CPU time by measuring the total response time for your API requests."), so the `(derived)` cap is honest. D12's 0 is the quoted header value with the right unit, SHOULD force matches, and the stop verb is the page's own ("you should stop making requests temporarily according to these guidelines"). I found **two low-severity wording imprecisions and two low-severity omission notes, no defect that flips any letter**: (1) D12's Decision paraphrase "until the instant in `x-ratelimit-reset`" drops the source's "until **after** the time specified by" — the row licenses a request at the reset instant that the source permits only after it (bounded by the header's 1-second epoch resolution); (2) D11's Signal drops the source's hedge "roughly"; (3) D11 omits the passage's second bound "No more than 60 seconds of this CPU time may be for the GraphQL API." (no effect on D11's signal); (4) D11's row cell names the vendor and the limit but not the client class (GitHub REST API client vs browser journey) — this is the frozen w1 adjacency caveat (w1/CritC1Axis.md Q4), disclosed, not repairable this round. The frozen counter, run offline in my scratch clone at REV (bytes identical to frozenDigests), reports population 13, admitted 13, failing 0, clean, with D11 (threshold 90, entry line 59) and D12 (threshold 0, line 60) admitted, reason null — matching the L1 reading. Neither row leans on the frozen known holes (no quote repetition, no non-threshold number as threshold); the --live proxy hole is bypassed for this reading because I fetched and normalised the pages myself.

---

## Row D11 — entry line 59

`| D11 | summed response time as the \`CPU time\` proxy per 60 s of wall clock | cap — keep estimated CPU time at or below the ceiling (GitHub secondary compute limit) (derived) | no more than 90 seconds | S121 | "No more than 90 seconds of CPU time per 60 seconds of real time is allowed." |`

Source: S121 — https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api (receipt `corpus/evidence/round-31/decision-table/bytes/S121.html`, sha256 `3a33f87b965a4af17078523dad091e35c41c69d7c9e6941140f91f4feefef755` = `S121.json`; verified).

Per letter:

- **(a) quote verbatim and located — holds.** Normalised receipt text: FOUND at char 9938 (1 occurrence). My live fetch: FOUND at char 9938, normalised receipt == normalised live (`true`, 15,503 chars). Raw byte offset in receipt: 232757 (first of 3 raw embeddings; normalise keeps the one visible instance).
- **(b) threshold number is the quote's quantity — holds.** 90 is the CPU-time ceiling the sentence states ("90 seconds of CPU time"); not a status code, section number, year or pronoun. The 60 in the same quote ("per 60 seconds of real time") is the denominator window, and the row carries it in the Signal ("per 60 s of wall clock"), not as the threshold — the correct role.
- **(c) unit and bound word — holds.** Threshold "no more than 90 seconds": bound word "no more than" is the quote's own ("No more than"); unit "seconds" is CPU-time seconds; denominator "per 60 s of wall clock" = "per 60 seconds of real time".
- **(d) Decision verb and force — holds.** The quote declares a limit with no RFC 2119 keyword and no directive to the caller ("is allowed"), so per the entry's own legend (§"A decision the quote does not instruct carries `(derived)`") the Decision correctly ends `(derived)`, and "cap" is in the closed verb set (entry §"What this table decides"). The legend explicitly says a derived cap "must not be read as a rule the page states", so the derivation is disclosed.
- **(e) Signal observable — holds, low note.** "Summed response time" per 60 s wall clock is client-observable, and the proxy is not the lane's invention: the source's next sentence grounds it — "You can roughly estimate the CPU time by measuring the total response time for your API requests." (receipt raw byte 232902; present once in normalised receipt). Low note: the Signal drops the source's hedge "roughly"; a reader of the row alone sees "proxy", not "rough estimate".
- **(f) scope stated — holds, low note (frozen w1 caveat).** The Decision cell names the vendor and which limit ("GitHub secondary compute limit"), and the entry's Limits section states "One vendor, at one access date" with the page's own "subject to change without notice / undisclosed reasons" disclosure. The row cell does not name the client class — these limits are documented for REST API clients, not browser journeys — which is exactly w1's frozen adjacency caveat (w1/CritC1Axis.md Q4, "Each row must name its client class"); disclosed and not repairable this round.
- **(g) distinct from every other row — holds.** The CPU-time bullet is a distinct rule from D9 (100 concurrent), D10 (900 points/min REST) and D7/D8 (primary hourly quotas): different bullets, different quantities. The quote occurs once in S121, is absent from S122 (count 0), and no other row quotes it.

Context around the quote (±500 normalised chars, receipt and live identical): the sentence sits in the secondary-rate-limit bullet list ("Make too many requests per minute." → the quote), followed by "No more than 60 seconds of this CPU time may be for the GraphQL API." then the estimation sentence, then the next bullet. **Omissions:** (i) the GraphQL sub-ceiling (60 of the 90 s) is a second numeric bound in the same passage the row omits — no effect on D11's signal (the lane's journey requests are not GraphQL API calls), low; (ii) the estimation sentence licensing the Signal sits outside the located quote, so the counter does not enforce it — the entry prose does not restate it either. Low; the row is still faithful because the Signal names the proxy explicitly.

## Row D12 — entry line 60

`| D12 | \`x-ratelimit-remaining\` header is \`0\` | stop — make no further request until the instant in \`x-ratelimit-reset\` (UTC epoch seconds); SHOULD strength (GitHub REST API policy) | 0 requests | S122 | "If the x-ratelimit-remaining header is 0 , you should not make another request until after the time specified by the x-ratelimit-reset header." |`

Source: S122 — https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api (receipt `corpus/evidence/round-31/decision-table/bytes/S122.html`, sha256 `b15c1c0ba8ca15fef43a89fa936a916e79717d7e4c1d85f170812d53c0dea33e` = `S122.json`; verified).

Per letter:

- **(a) quote verbatim and located — holds.** Normalised receipt: FOUND at char 5960 (1 occurrence); live: FOUND at 5960, normalised receipt == live (`true`, 13,476 chars). Raw byte offset in receipt: 230172 (first of 3 raw embeddings).
- **(b) threshold number is the quote's quantity — holds.** 0 is the value the quote predicates of `x-ratelimit-remaining` ("header is 0"); it is a header value, not a status/section/year.
- **(c) unit and bound word — holds.** Threshold "0 requests": the header counts remaining requests, so "requests" is the right unit; the trigger is an equality ("header is 0"), and the threshold cell claims no at-least/more-than wording that the quote does not make.
- **(d) Decision verb and force — defect (low).** Force holds: "SHOULD strength" matches the quote's lower-case directive "you should not make another request", and per the entry's legend a directed row is correctly *not* marked `(derived)`. The verb "stop" is the page's own governing sentence ("If you receive a rate limit error, you should stop making requests temporarily according to these guidelines:", normalised receipt context). The "(UTC epoch seconds)" parenthetical is grounded by S122's own next sentence ("The x-ratelimit-reset header is in UTC epoch seconds.", present once in receipt). **The imprecision:** the source forbids requests "until **after** the time specified by the x-ratelimit-reset header"; the row says "until the instant in `x-ratelimit-reset`" (the entry prose repeats this as "no further request **before** the instant"). "Until the instant" licenses resuming exactly at T, which the source's letter permits only after T. Severity low: `x-ratelimit-reset` is the instant the current window resets (S121 header table: "The time at which the current rate limit window resets, in UTC epoch seconds."), so the gap is at most one request inside the boundary second of a 1-second-resolution epoch value; the threshold, unit, force and located quote are all faithful.
- **(e) Signal observable — holds.** A response header value is exactly what a journey driver has in hand.
- **(f) scope stated — holds.** "(GitHub REST API policy)" names vendor and instrument class; entry Limits adds one-vendor/one-access-date.
- **(g) distinct from every other row — holds.** D12 is the complementary branch of D6 (S121's fallback "wait for at least one minute" applies when neither `retry-after` nor a 0 `x-ratelimit-remaining` is present) — different signal, different action, different source row. The quote occurs once in S122, is absent from S121 (count 0), and no other row quotes it.

Cross-page near-twin (attribution check): S121 carries a differently-worded twin — "If the x-ratelimit-remaining header is 0 , you should not **retry your request** until after the time, **in UTC epoch seconds**, specified by the x-ratelimit-reset header." (receipt raw byte 238994). The row cites S122 and quotes S122's wording verbatim; the twin's inline "in UTC epoch seconds" is replaced in the row by the parenthetical grounded in S122's next sentence. Attribution correct.

## Counter cross-check (receipts under output dir `live/` and `c1-offline.json`)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # ok
git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120         # ok, porcelain 0 lines
sha256sum "$S/clone/scripts/check-decision-table.mjs"
# d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  == claims.json.frozenDigests
TMPDIR=$S node scripts/check-decision-table.mjs --rev 4860483… \
  --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --json > c1-offline.json
# exit=0  {"population":13,"admitted":13,"failing":0,"clean":true}
# {"row":"D11","line":59,"source":"S121","admitted":true,"reason":null,"threshold":90}
# {"row":"D12","line":60,"source":"S122","admitted":true,"reason":null,"threshold":0}
```

Also verified: entry bytes at REV are identical to the working tree I read (`diff -q` clean); receipt digests re-computed and equal to the `.json` receipts (sha256sum, exit 0); `normalise()` extracted verbatim from the counter (`sed -n '/^const ENTITIES/,/^}$/p'`, 16 lines, module sha256 `c7687419…` — extraction only, no edits).

## Live fetch log (read-only HTTPS GETs, curl -q -sS --proto =https)

| Source | URL | UTC | Status | Bytes | sha256 |
|---|---|---|---|---|---|
| S121 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T12:29:10Z | 200 | 337116 | 47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9 |
| S122 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api | 2026-10-26T12:29:10Z | 200 | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 |

Raw bytes differ from the receipts (page churn since 08:36Z); the normalised bodies are byte-identical to the receipts' normalised bodies for both pages, which is what the counter's `--live` check reads. No logins, cookies, credentials or API calls; no redirects left the host.

## Severity summary

1. **Low — D12 Decision paraphrase tightens "until after the time" to "until the instant".** Entry line 60 vs S122 quote (receipt normalised char 5960, raw byte 230172). Smallest fix next round: "until after the instant in `x-ratelimit-reset`".
2. **Low — D11 Signal drops the source's "roughly"** (entry line 59 vs receipt raw byte 232902). The Decision cell's "estimated CPU time" partially carries the hedge; the proxy is nonetheless the source's own.
3. **Low — D11 omits the passage's GraphQL sub-ceiling** ("No more than 60 seconds of this CPU time may be for the GraphQL API.", same bullet, once in receipt). No effect on D11's signal; note for any future GraphQL row.
4. **Low, frozen/disclosed — D11's row cell does not name the client class** (REST API client vs browser journey); the frozen w1 adjacency caveat applies verbatim to this row (w1/CritC1Axis.md Q4). Not repairable this round.

Residual risk: none of the four changes the row's decision for the lane's stated province (observation-only, no API calls, no token); the C1 predicate itself (admitted ≥ 10, failing 0) is not affected by any of them. Verification gaps: I verified the quotes, thresholds, force markers and context against receipt bytes and one live fetch per source at 12:29:10Z; I did not re-run the counter with `--live` (L1's frozen live reading stands, and my direct fetch independently confirms the live text).

Tooling authorization: no tool installed or upgraded this seat (nothing needed beyond curl/node/git already present).
