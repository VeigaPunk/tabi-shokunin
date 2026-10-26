# Cross-source rate-limit vocabulary → lane decision surfaces (ConnApprovalTable)

Seat: ConnApprovalTable (leaf). Sources: S116 (draft-ietf-httpapi-ratelimit-headers-11,
byte-identical independent fetch), S117 (docs.discord.com Rate Limits, independent fetch),
`redirect-and-retry-after-semantics.md` (RFC 9110 §10.2.3), `interaction-approval-table.md`
rows C2–C6 + A-gates, `external-class-fixture-v2.md` §2 stop-and-report predicate, `SKILL.md`
§Approval table (lines ~697–760). Every quote below is located in the seats' own fetched bytes
(see `fetch-receipts.md`).

## 1. Mapping table — signal → consumer → journey-record capture (shape-only)

| Signal (source bytes) | Consumer — approval row / predicate | Journey record must capture, shape-only |
|---|---|---|
| HTTP 429 status (RFC 6585 §4 via S110; Discord §Exceeding A Rate Limit; fixture-v2 instrument `429`+`Retry-After`) | fixture-v2 §2 rule 2: STOP on first response with status ∈ {429,403}; `interaction-approval-table.md` C6 gate (first measured rate datum → stop and report, never retry through); `SKILL.md` C6 row | status; UTC receipt time; request line with credentials stripped (webhook token → fixed marker); the trip cell marked `executed:false` and the server log's absence of the suppressed request; body bytes + sha256; `Content-Type`; `Retry-After` presence/value as shape only — never acted on as a schedule |
| HTTP 403 status (S148 Cloudflare 1020 access-denied class; Discord invalid-request examples) | same STOP predicate (rule 2); classification MUST NOT merge into "rate limited" (C6's vocabulary distinguishes refusal classes; S147/S148) | status; vendor-specific code/body class (e.g. 1020) kept as its own class; body bytes + sha256; never re-labelled as a quota signal |
| `robots.txt` `Disallow:` prefix match (fixture-v2 rule 1; C3 rights axis default-deny) | fixture-v2 rule 1: STOP before issuing the intended request when its path matches a `Disallow:` prefix; C3's rights evidence (ToS/robots surface) | robots status + bytes + sha256; matched prefix; the intended path; the "not issued" marker and `notExecuted[]` tail |
| Interstitial body shape (`[data-tabi-gate="interstitial"]` marker set + `document.title`) | fixture-v2 rule 3: STOP regardless of status (fixture proves a 200 interstitial) | marker set hit; status (can be 200); body bytes + sha256; `document.title` |
| `Retry-After` header (RFC 9110 §10.2.3 — HTTP-date or delay-seconds; with 3xx and 503; RFC 6585 with 429; draft `-11` §7 precedence) | fixture-v2 rule 2 records presence/value shape-only; C6 documents it as deciding evidence; S116 records precedence over `RateLimit` `t` | header name presence; raw value and its form (HTTP-date vs delay-seconds) — recorded, never converted into a wait |
| `RateLimit-Policy` field (draft §3: `q`, `qu` default `requests`, `w`, `pk`; stable half: SHOULD remain consistent over a sequence of responses) | S116 entry, class 1 "published policy"; consumed as C6 vocabulary — not a gate trigger; optional ("Quota policies can be advertised by servers, but they are not required to be") | per item: policy identifier; `q` (number); `qu` (unit, default requests); `w` (window); `pk` (byte-sequence partition key); recorded as informative ("are informative and MAY be ignored") |
| `RateLimit` field (draft §4: `r` REQUIRED available quota, `t` OPTIONAL effective window, `pk`; volatile half: MAY change on every request) | S116 entry, class 2 "per-request budget"; `r=0` alone is not proof a request was refused ("clients MUST NOT assume that a positive available quota is a guarantee that further requests will be served"); not a permission | policy id; `r` (number); `t` (delta seconds); `pk`; recorded as a prediction, never as an outcome |
| `X-RateLimit-Limit` / `X-RateLimit-Remaining` (Discord) | S117 entry; C6 vocabulary for one real host; loose analogue of policy `q`/`r` without a policy identifier | header name + numeric value, raw; absent header recorded as absent (set is optional — never imputed from status) |
| `X-RateLimit-Reset` (epoch) / `X-RateLimit-Reset-After` (delta) (Discord) | S117 entry; the reset-semantics contradiction surface — only `Reset-After` approximates draft `t`; `Reset` has no draft analogue | both raw values, kept distinct; never relabel the epoch as `t`; receipt's own UTC timestamp recorded so an absolute epoch is interpretable against a known clock |
| `X-RateLimit-Bucket` / `X-RateLimit-Global` / `X-RateLimit-Scope` (Discord; Global/Scope returned only on 429) | S117 entry; limit *scope* (user/global/shared; per-guild emoji-control routes) — first place the lane sees scope ≠ origin | bucket: opaque host-assigned string (never parsed as content); Global/Scope: presence + value string, only when the response is a 429 |
| 429 JSON body: `retry_after`, `global`, `code` (Discord §Exceeding) | S117 §3; body fields survive on the 429; page: rely on `Retry-After` header or `retry_after` field | only these three body fields; the `message` text is not evidence and need not be retained |
| Invalid-request cap (Discord: 10,000 requests per 10 minutes) | documented, not modelled (S117 §7); repeated 401/403/429 outcomes are inputs to a second limit no header declares | record the outcomes (statuses) only; no inference about when the restriction begins |
| Method-rewriting redirect + `Retry-After` on 3xx (redirect-and-retry-after-semantics.md) | C3/C2 approval gates use redirect-method semantics; `Retry-After`-on-3xx recorded by the same shape-only rule | redirect chain per-hop statuses and method rewrite outcome (301/302 POST→GET possibility, 307/308 preservation); `Retry-After` on the 3xx |

Consumers that do **not** change: C2 (operator's own sites) and C3 (third-party read-only)
gates remain operator-asleep-blocked — the vocabulary is documented, not a grant; C6 remains
asleep-blocked because the deciding axis is still unmeasured in this lane (the entries are the
vocabulary the measurement will be recorded against, not a measurement).

## 2. Contradictions between the vendor set (S117) and the draft (S116)

1. **Header names and syntax.** The draft publishes two structured-field names,
   `RateLimit` and `RateLimit-Policy`, as `List[SF]` values (e.g.
   `RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400`);
   Discord publishes a legacy, hyphenated `X-RateLimit-*` set whose values are plain
   integers/strings — not structured-field parseable. A receipt cannot parse one with the
   other's grammar.
2. **Reset semantics — delta vs epoch (the headline contradiction).** The draft has exactly
   one time member, `t`, defined as the effective window — a delay in seconds ("the time
   within which the client can use no more than the available quota", §4.1.2); `grep -in
   "epoch"` over the full `-11` bytes finds **zero** occurrences — no absolute reset member
   exists. Discord publishes **both**: `X-RateLimit-Reset` is an absolute epoch ("Epoch time
   (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets") and
   `X-RateLimit-Reset-After` is a delta ("Total time (in seconds)", decimals allowed). So
   only `Reset-After` maps onto `t`; `Reset` has no draft analogue, and a receipt that
   relabels the epoch as `t` records the wrong kind of number.
3. **Stability contract.** The draft splits the pair by volatility: the policy field
   "SHOULD remain consistent over a sequence of HTTP responses", the per-request field
   "contains information that MAY change on every request". Discord only says the headers are
   optional and describe the limit encountered during your request — and, on the emoji-control
   routes, that "the quota returned by our APIs may be inaccurate" (per-guild scope). The
   vendor's per-request numbers carry a documented trust caveat the draft's vocabulary has no
   slot for.
4. **Scope.** The draft's partition key `pk` is a Byte Sequence value dividing server
   capacity; Discord's `X-RateLimit-Bucket` is an opaque host-assigned string, and its
   `X-RateLimit-Global` / `X-RateLimit-Scope` (user/global/shared, returned only on 429)
   have no analogue at all in the draft — including the per-guild exception, the first case
   where the limit's scope is not the origin.
5. **Status coupling.** The draft decouples the fields from the status code ("A server MAY
   return RateLimit header fields independently of the response status code", FAQ: 429 is
   "just an example … that could instead use even 403 or whatever status code"). Discord ties
   `X-RateLimit-Global` and `X-RateLimit-Scope` to 429 responses only and sends its per-route
   headers with responses generally. A receipt must therefore read the headers it actually
   got, never assume a status implies them (or vice versa).

## 3. Recommended sentences for the entries (so a reader can act)

For `corpus/knowledge/rate-limit-policy-fields.md` (S116):

- "Classify a signal in this order — `RateLimit-Policy` first, then `RateLimit`, then the
  status code, then `Retry-After` — and where both `RateLimit` and `Retry-After` appear,
  `Retry-After` takes precedence and the effective window MAY be ignored."
- "The draft has no absolute-reset member: `t` is a delay in seconds, so an epoch-bearing host
  set must be recorded raw and never relabelled as `t`."
- "Record absences: servers need not emit the fields, malformed fields MUST be ignored, and a
  positive `r` is not a guarantee that further requests will be served."

For `corpus/knowledge/host-published-rate-limit-headers.md` (S117):

- "Record `X-RateLimit-Reset` as an absolute epoch and `X-RateLimit-Reset-After` as a delta,
  keep the two apart, and never map the epoch onto the draft's `t`."
- "The header set is optional: record each absent header as absent, and never impute a zero or
  a budget from the status code alone."
- "On a 429 record only `retry_after`, `global` and `code` from the JSON body — and remember
  the host itself warns its returned quota may be inaccurate on the emoji-control routes."
