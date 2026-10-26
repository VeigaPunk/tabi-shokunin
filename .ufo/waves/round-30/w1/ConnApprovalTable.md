# ConnApprovalTable — round 30 w1 scoped findings (cross-source rate-limit vocabulary)

## Verdict

The documented rate-limit vocabulary plugs into the lane's decision surfaces at exactly one
execution point and three evidence points: the stop-and-report predicate of
`external-class-fixture-v2.md` §2 (which already fires on the first 429/403, a robots
`Disallow:` prefix, or an interstitial body shape, before any request is issued past the stop)
is the *only* consumer that acts on a signal, while the C6 rate-limited approval row
(`interaction-approval-table.md` §2 C6; `SKILL.md` §Approval table C6) is the evidence ledger
that row feeds — and the two new S116/S117 entries supply the classification vocabulary C6 was
missing (published policy vs per-request budget vs status vs `Retry-After`), not a measurement
and not a grant: C3/C6 remain operator-asleep-blocked. The headline contradiction between the
vendor set and the draft is reset semantics: the draft `-11` has no absolute-reset member at
all (`t` is a delay in seconds; zero occurrences of "epoch" in the fetched bytes), while
Discord publishes both an absolute epoch (`X-RateLimit-Reset`) and a delta
(`X-RateLimit-Reset-After`), so only the delta maps onto `t` and a receipt must never relabel
the epoch as `t`; secondary contradictions are syntax (structured-field `List[SF]` names vs
hyphenated `X-RateLimit-*` plain values), stability contract (SHOULD-remain-consistent vs
optional "encountered during your request", plus the host's own per-guild inaccuracy caveat),
scope (draft `pk` byte-sequence vs opaque bucket + 429-only Global/Scope qualifiers), and
status coupling (draft fields decoupled from status; vendor ties Global/Scope to 429). The
deliverables are the mapping table (12 signal rows → consumer → shape-only capture), the five
contradiction statements, and three actionable sentences per entry, all in
`.ufo/waves/round-30/w1/ConnApprovalTable/`; every quoted span was re-verified in the seat's
own independent fetches (byte-identical to committed S116 bytes; normalised-identical to
committed S117 bytes).

## Evidence

### Sources read (lane corpus, read-only)

- `corpus/knowledge/interaction-approval-table.md` — rows C2–C6 (`:57-62`), §3 evidence
  (`:78-129`), C6 falsifier incl. "A measured 429/`Retry-After` shape is [U1]" (`:129`).
- `corpus/knowledge/external-class-fixture-v2.md` — §2 stop-and-report predicate: rule 1
  robots `Disallow:` match → STOP before issuing (`:61-63`); rule 2 first status ∈ {429,403}
  → STOP, record status, `Retry-After` presence/value as shape only, never acted on as a
  schedule (`:64-67`); rule 3 interstitial body shape → STOP regardless of status (`:68-71`);
  trip-record shape `{mode, cell, class, matchedOn, observed{status, retryAfter, ct,
  bodyBytes, bodySha, responseBody}, action, atUTC, atRelMs, issuedRequestsAtTrip,
  notExecuted[]}` (`:137-140`).
- `corpus/knowledge/redirect-and-retry-after-semantics.md` — RFC 9110 §10.2.3: `Retry-After`
  with any 3xx and with 503; value = HTTP-date or delay-seconds (`:41-45`); 301/302
  POST→GET possibility, 307/308 preservation (`:19-40`).
- `SKILL.md` §Approval table (`:697-760`) — C6 row: "Deciding axis unmeasured → never
  self-assign a budget; stop-and-report on the first measured rate datum" (`:729`); C2/C3
  asleep-blocked rows (`:725-726`); `:694-695` "No measured live-site rate limit or ToS
  surface exists … record it when measured".
- Corpus entries written this round (S116/S117): `corpus/knowledge/rate-limit-policy-fields.md`,
  `corpus/knowledge/host-published-rate-limit-headers.md`; registry rows
  `corpus/evidence/round-30/frontier/S116.json`, `S117.json`; lesson
  `corpus/lessons/round-30.md` Gate (rows opened 2026-10-26, refetch records under
  `refetch/`).

### Independent fetches (the seat's own bytes; see fetch-receipts.md)

```
$ date -u +%Y-%m-%dT%H:%M:%SZ > fetch1.time
$ curl -sS -L -D fetch1.headers -o fetch1.txt \
    -w 'http %{http_code} bytes %{size_download} url %{url_effective}\n' \
    https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
http 200 bytes 67097 url https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt   # exit 0
$ sha256sum fetch1.txt
d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412  fetch1.txt   # == committed S116.txt sha256

$ curl -sS -L -D fetch2.headers -o fetch2.html \
    -w 'http %{http_code} bytes %{size_download} url %{url_effective}\n' \
    https://docs.discord.com/developers/topics/rate-limits
http 200 bytes 408912 url https://docs.discord.com/developers/topics/rate-limits   # exit 0
$ sha256sum fetch2.html
015d1f5e5131397bd43153ca0291c64efd7f83ea132a103227590c5d2b8fe971  fetch2.html   # raw differs from committed S117.html; normalised text identical
```

Both fetches at 2026-10-26T07:04:10Z, HTTP/2 200, no credentials, no cookies.

### Quote location checks (exit codes all 0)

Draft `-11` (fetch1.txt), `grep -n`/`sed -n` verified:

- `:308-311` "The field value SHOULD remain consistent over a sequence of HTTP responses. It
  is this characteristic that differentiates it from the RateLimit (Section 4) field that
  contains information that MAY change on every request."
- `:323` `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400`
- `:461-471` `r` REQUIRED available quota; `t` OPTIONAL effective window ("the time within
  which the client can use no more than the available quota"); `pk` OPTIONAL.
- `:488` §4.1.2 head "Effective Window Parameter" (i.e. `-11` has no Reset Parameter — the
  S116 entry records `-10`'s §4.1.2 as "Reset Parameter", confirming the renamed member).
- `:732-734` "If a response contains both the RateLimit and Retry-After fields, the
  Retry-After field MUST take precedence and the effective window MAY be ignored."
- `grep -in "epoch" fetch1.txt` → no output (exit 1, zero matches): no absolute-reset member
  in the draft.

Discord page (fetch2.html): all eight header definitions (`X-RateLimit-Limit/Remaining/Reset/
Reset-After/Bucket/Global/Scope`), the per-guild caveat, the 429 failure shape, "All bots can
make up to 50 requests per second", and "10,000 requests per 10 minutes" located verbatim
(see fetch-receipts.md for the extracted spans).

### Deliverables

- `.ufo/waves/round-30/w1/ConnApprovalTable/fetch-receipts.md` — URL, UTC time, HTTP status,
  byte count, sha256 per fetch; quote-location proof per source.
- `.ufo/waves/round-30/w1/ConnApprovalTable/mapping-table.md` — 12-row mapping table (signal →
  consumer → shape-only capture), five contradictions, recommended sentences per entry.
- `.ufo/waves/round-30/w1/ConnApprovalTable/bytes/` — the two fetched byte sets verbatim.
- This report.

No lane tracked file was edited; no git operation beyond the read-only clone at
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`git clone --shared` + `git checkout -q
061e620…`; `git rev-parse --short HEAD` → `061e620`). No tool was installed this session.
The C2 admission/`--live` count itself is the integrator's verification (milestone C2), run
against the clean tip checkout; this seat supplies the vocabulary analysis it feeds.
