# ScoutProvince — C1 reconnaissance (round 31 w1)

**Verdict.** The corpus holds **no sourced numeric threshold for any rate/crawl decision**. Every one of the C1 candidate thresholds (RFC 9309 five-redirect / 24 h / 500 KiB / 30 days; RFC 6585 `Retry-After: 3600`; GitHub 60 and 5,000 requests/hour, "one second", "at least one minute", `x-ratelimit-remaining: 0` → wait for `x-ratelimit-reset`, `retry-after` seconds) is **new ground**, so the table is not a restatement. Two numbers adjacent to the ground are already held and the table MUST NOT re-present them as new: Discord's invalid-request cap 10,000 per 10 minutes (`corpus/knowledge/host-published-rate-limit-headers.md:105`, `:166`) and the lane's own self-assigned method bounds (≤20 HTTP requests · ≤60 s · ≥1 s between navigations, `corpus/knowledge/arc-synthesis.md:73`; probe `Retry-After: 7`, `external-class-fixture-v2.md:338`) — those are lane-authored, not source thresholds (control J4 "invented thresholds" is exactly this class). The frontier row the table can advance is **"Rate/ToS surface for site-interaction records"** (corpus/README.md:182 / :651), and only on the docs-held, rate half; it must not move runtime, ToS, or approval C3/C6.

Nothing was edited. Scratch fetches were deleted on exit (trap). I did not fetch with the lane counter; the live-page reading below is scouting, not a receipt.

## 1. What the corpus already holds (file:line)

| Ground | Where | Numeric? |
|---|---|---|
| 429/403 stop class `STATUS_TRIP = [429, 403]`; `/robots.txt` probed first, `Disallow:` prefix → never issue; `Retry-After` "shape only, never acted on as a schedule" | `corpus/knowledge/external-class-fixture-v2.md:61-66`, `:85`, `:451`, `:508-518`; `SKILL.md:327,329` | no (loopback instrument; `Retry-After: 7` at `:338` is lane-authored) |
| Lane method bounds: budget 1 page · 1 cold run · ≤20 HTTP requests · ≤60 s · ≥1 s between navigations | `corpus/knowledge/arc-synthesis.md:73` | yes, but the lane's own — interaction-approval-table.md:121-124 states "the only rate numbers in the corpus are the lane's own method bounds … not a site rate" |
| C6 "decide from an absence"; U1 "first measured datum (status-code family, `Retry-After`, robots/ToS text) re-anchors C6" | `corpus/knowledge/interaction-approval-table.md:92`, `:121-129`, `:191-193` | no |
| `Retry-After` on 3xx / 503; value = HTTP-date or delay-seconds (RFC 9110 §10.2.3) | `corpus/knowledge/redirect-and-retry-after-semantics.md:41-45` | no number |
| Status is not implied by RateLimit fields; 429/403/503 all possible; `Retry-After` takes precedence | `corpus/knowledge/rate-limit-policy-fields.md:53-65`, `:143` | no threshold |
| Discord `X-RateLimit-*` set, 429 body, "rely on the Retry-After header or retry_after" | `corpus/knowledge/host-published-rate-limit-headers.md:27-33`, `:73-76` | example values only (`Limit: 5`, `Reset-After: 1`, `:39-43`) |
| Discord invalid-request cap: 401/403/429 → "10,000 per 10 minutes" | `host-published-rate-limit-headers.md:102-107`, `:166`, `:182-183` | **the only sourced rate threshold held** (one host, S117) |
| Registry rows near the ground: S107 RFC 9110, S116 draft-11, S117 Discord | `corpus/SOURCES.md:121`, `:130`, `:131` | rows only; no S119–S126 row exists at baseline (highest is S118, `:132`) |

Grep of the requested terms across `corpus/knowledge/`, `SKILL.md`, `corpus/README.md`, `corpus/SOURCES.md` (exit 0, 127 raw lines): **zero** hits for `five consecutive`, `24 hours`, `500 kibibytes`, `60 requests`, `one minute`, `Retry-After: 3600`, `unauthenticated`, `unreachable`/`5xx` as a robots rule, or `robots` + `cache`. `5,000` appears only in unrelated WebMCP number-coercion lines (`SKILL.md:2069`, `:2164`); `900` only as a timeout (`SKILL.md:487`).

## 2. Candidate thresholds vs held ground (live bytes read this run, scouting only)

Fetches (curl -q -sS --proto =https, all exit 0, UTC 2026-10-26T08:36:56Z): rfc9309.txt 200 / 25265 B / sha256 `f633915d…`; rfc6585.txt 200 / 17164 B / `f6d55d1b…`; GitHub rate-limits page 200 / 337116 B / `ae5e1812…`; GitHub best-practices page 200 / 328088 B / `b15c1c0b…` (16-hex prefixes; full receipts are the executors' job).

| Candidate (source location) | Held before? | Status |
|---|---|---|
| RFC 9309 §2.3.1.2: "SHOULD follow at least five consecutive redirects"; "more than five consecutive redirects, crawlers MAY assume … unavailable" (rfc9309.txt:377-385) | no (`five` hits are unrelated: `external-class-fixture-v2.md:59`, `:412`) | **new** |
| RFC 9309 §2.3.1.3: 400-499 → "unavailable", crawler MAY access any resources (:386-396) | no | **new** (signal → action) |
| RFC 9309 §2.3.1.4: 500-599 / network error → "unreachable", MUST assume complete disallow; after "a reasonably long period of time (for example, 30 days)" MAY treat as unavailable (:400-409) | no | **new**; "30 days" is an *example*, not a normative threshold — row must say so |
| RFC 9309 §2.4: "SHOULD NOT use the cached version for more than 24 hours, unless … unreachable" (:419-420) | no | **new** |
| RFC 9309 §2.5: parsing limit "MUST be at least 500 kibibytes" (:425) | no | **new** |
| RFC 6585 §4: 429 "MAY include a Retry-After header"; example `Retry-After: 3600` (rfc6585.txt:137-145); "MUST NOT be stored by a cache" (:165) | no (`Retry-After: 3600` absent; RFC 6585 is not a registry row at baseline) | **new**; 3600 is an *example value in the RFC's sample*, not a threshold — do not count it as the source's rule |
| GitHub rate-limits: unauthenticated "60 requests per hour"; personal "5,000 requests per hour"; GHEC "15,000 per hour" | no | **new** (note: the candidate string "60 requests" is "60 requests **per hour**") |
| GitHub rate-limits: exhausted primary limit → 403 or 429 with `x-ratelimit-remaining` 0; do not retry until `x-ratelimit-reset` (UTC epoch s) | status class held for Discord only; GitHub header set not held | **new** for this host (S126 staged/refused — do not use package bytes) |
| GitHub rate-limits/secondary: no more than 100 concurrent requests; 900 points/minute for REST endpoints; 90 s CPU per 60 s real | no | **new** (counted only if row quotes them) |
| GitHub best-practices: wait "at least one second" between mutating (POST/PATCH/PUT/DELETE) requests; `retry-after` present → not before that many seconds; remaining 0 → until reset; "Otherwise, wait for at least one minute", then exponential backoff | no (the lane's own "≥1 s between navigations" is a different, self-set number) | **new**; note it is the mutation-pacing rule — a read-only journey must not cite it as a read budget |

Not new / do not count as C1 depth: Discord 10,000 per 10 minutes (held at host-published-rate-limit-headers.md:105; S117 is a baseline row, so a row citing it fails `r4-new-row`).

## 3. Frontier rows the table could advance (and the overclaim line)

- `corpus/README.md:182` (kaika round-1 table) "Rate/ToS surface for site-interaction records" — open; its own text restricts to loopback instruments.
- `corpus/README.md:216` "Other open frontier ground … rate/rights real-site records" (points to :180-183, :194).
- `corpus/README.md:35-40` round-3 `## Frontier` bullet "Site-interaction records … no measured rate limit or ToS surface exists" (historical; stays unedited).
- `corpus/README.md:651` current row: docs-held for the rate half (`RateLimit` draft + Discord `X-RateLimit-*`); runtime open; ToS half open (correction `:654-656`). **This is the row a round-31 restatement would extend.**
- `corpus/README.md:641-647` frontier restatement (round 30): states approval table C3/C6 unchanged, loopback 429 = instrument. The table must keep this.
- `corpus/knowledge/interaction-approval-table.md:192` U1 and C6 `:121-129`: the table supplies a *documented* threshold, not "the first measured datum" — U1 stays open.

Overclaim limits: (a) documentation-only, no request sent to any host, no `api.github.com`; (b) RFC 9309 is a crawler spec — it governs robots.txt handling, not site rate budgets; do not present it as ToS evidence (ToS half still open); (c) the table is not a measured rate or a C6 grant — C3/C6 decisions are unchanged; (d) "30 days" and `Retry-After: 3600` are examples/illustrations in their sources; (e) GitHub limits are per-host, per-auth-class and the page says they can change; (f) frontier counter `check-frontier-admission.mjs --frontier rate-tos-signal` reads round-30 rows (claims.json noHarmChecks: population 2, admitted 2) — a README row must not alter that reading; (g) any README tally in the new row must be oracle-correct (claims.json `separability`: gate self-test cases=34).

## 4. Commands (exit codes)

- `grep -rniE "robots\.txt|Retry-After|429|x-ratelimit|crawl|backoff|five consecutive|24 hours|500 kibibytes|60 requests|5,000|one minute|Retry-After: 3600" corpus/knowledge SKILL.md corpus/README.md corpus/SOURCES.md` — exit 0, 127 lines.
- Targeted per-term loops over the rate-adjacent notes, `SKILL.md`, `SOURCES.md` — exit 0 (empty results for terms listed in §1).
- `curl -q -sS --proto =https` ×4 (RFC 9309, RFC 6585, two GitHub pages) — each exit 0, HTTP 200; one repeat read of rfc9309.txt lines 374-426 — exit 0.
- Read: claims.json, baseline/README-receipts.md. No tool installs.
