# The published quota fields a journey record classifies a rate-limit signal against

source: S116 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt — §3–§3.2, §4–§4.2, §5.1–§5.3, §6, §7, Appendix A, FAQ — fetched 2026-10-26, 67097 bytes, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412`
verified-at: 2026-10-26 — round 30
recheck: 180d — the draft revision moves; on a new revision re-open and re-locate every quote
frontier: rate-tos-signal
ground: documented-upstream rate/ToS signal vocabulary — the two quota fields a site-interaction record classifies a rate-limit signal against, on top of the 429/403 status class and RFC 9110 `Retry-After` already held in `corpus/knowledge/redirect-and-retry-after-semantics.md`

**Documented upstream, not measured here.** No host was queried for these fields
this round and no browser ran. What follows is the vocabulary a journey record
needs in order to say *which kind* of quota signal it saw — not a measurement
that any site returned one.

## The two fields

`RateLimit-Policy` (§3) is the server's statement of what its limit *is*: a
list of quota-policy items, each an identifier plus parameters — `q` (the
required quota, in quota units), `qu` (the unit; `requests` by default), `w` (a
time window) and `pk` (a partition key). It is the stable half of the pair:
"The field value SHOULD remain consistent over a sequence of HTTP responses."
The draft draws that contrast itself: "It is this characteristic that
differentiates it from the RateLimit (Section 4) field that contains information
that MAY change on every request." The policy field "enables clients to control
their own flow of requests based on policy information provided by the server".

`RateLimit` (§4) is the per-response half: "The field is expressed as a
List[SF] of Service Limit Items", each naming a policy and carrying `r`
(available quota), `t` (effective window) and optionally `pk`. "This REQUIRED
parameter value conveys the available quota under the identified policy";
"This OPTIONAL parameter value conveys the effective window under the
identified policy" — the time within which the client can use what is left.

A service limit is therefore a quantity, not an outcome: "A service limit is
the currently available quota under a specific quota policy". Neither field is
a promise. "Clients MUST NOT assume that a positive available quota is a
guarantee that further requests will be served", and "it indicates that the
server may soon throttle the client" when the number is low. The server can
clamp at will: "The client MUST NOT assume that all its service limit will be
fully restored after the time indicated by the effective window parameter."

## How a journey record classifies a quota signal

Four classes, in the order a receipt should test them:

1. **Published policy** — a `RateLimit-Policy` field is present. That states the
   server's quota (units, window, partition), not this request's outcome. Its
   details "are informative and MAY be ignored", and a server need not publish
   one at all: "Quota policies can be advertised by servers, but they are not
   required to be".
2. **Per-request budget** — a `RateLimit` field names what is left and for how
   long (`r`, `t`). A small `r` predicts throttling; it does not report that
   this request was throttled.
3. **Status code** — 429, or 403, or 503. The fields do not imply a status:
   "A server MAY return RateLimit header fields independently of the response
   status code. This includes throttled responses." Nor does a 429 imply the
   fields. The appendix describes quota refusals "replying instead with a 4xx
   HTTP status code (e.g. 429 or 403)", §5.2 pairs a temporary capacity
   reduction with 503, and the FAQ treats 429 as one example among several:
   "we use it just as an example of a throttled request, that could instead use
   even 403 or whatever status code".
4. **`Retry-After`** — the RFC 9110 field the lane already holds. Where both
   appear, the older field wins: "If a response contains both the RateLimit and
   Retry-After fields, the Retry-After field MUST take precedence and the
   effective window MAY be ignored." A receipt that records `t` as the wait
   when `Retry-After` is present records the wrong number.

Three absences belong in the record rather than in an inference: the fields
need not appear on every response ("Servers are not required to return RateLimit
header fields in every response", §6.2); one response's set does not predict the
next ("A client receiving RateLimit header fields MUST NOT assume that future
responses will contain the same RateLimit header fields"); and an unparsable
field is not a signal ("Malformed RateLimit header fields MUST be ignored.").

## Limits

- **No measurement, and no known publisher in this lane.** No host was fetched
  for these fields this round; the sibling S117 entry covers one vendor's
  `X-RateLimit-*` wire set, which is not this draft's syntax. The draft also
  does not require servers to emit the fields, so their absence in a capture is
  not evidence that no quota exists.
- **`t` changed meaning while the syntax did not.** In `-10` §4.1.2 the
  parameter was the Reset Parameter — seconds until further quota is made
  available; in `-11` §4.1.2 it is the effective window ("the number of seconds
  within which the client can use no more than the available quota"). `t=30`
  parses identically under both. A receipt that stored `t` as a reset instant
  under the older reading would misread the same bytes. All three revisions
  were fetched this round (`-09` 67876 bytes, `-10` 67803, `-11` 67097) and the
  bytes are kept beside this draft; this is why the recheck is not longer than
  180d.
- **A draft, not a standard.** The `-11` fetch carries an expiry of 24 November
  2026. Its Status of This Memo says "It is inappropriate to use Internet-Drafts
  as reference material", a generic I-D boilerplate qualified by `as work in
  progress` and saying nothing about this draft's own authority. Treat every
  statement above as the current draft's wording, re-locatable only in the
  fetched revision.
- **No absolute reset member.** `t` is a delay-seconds-shaped integer; the draft
  has no epoch-reset field. A host set publishing an absolute epoch cannot be
  mapped onto `t` without a translation the receipt must name.
- **Not a permission and not a throttle detector.** "This specification does not
  prevent clients from making requests." The approval table's C6 gate still
  decides whether a journey may issue a request, and `r=0` alone does not show
  that any request was refused.

## Adopted from

Package `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md`
(staged S159, anchored `draft-ietf-httpapi-ratelimit-headers-09`, fetched
2026-10-23). Its header claimed `-10 and later currently return 404 (not run in
this round)`. That is stale: on 2026-10-26 the package's own premise failed —
its `-09` anchor still returns HTTP 200 (67876 bytes), `-10` returned HTTP 200
(67803 bytes) and `-11` returned HTTP 200 (67097 bytes), while `-12` returns
HTTP 404. The datatracker document page (fetched 2026-10-26T06:40:06Z, a
dynamic render whose sha256 differs between two same-day fetches) links only
`-11`'s `.txt`. This entry is re-grounded against `-11`, renumbered S159 → S116,
and its line anchors (301, 322, 409) are dropped: they are `-09`'s numbering,
and the two examples they point at sit at 323 and 417 in `-11`. The two package
sentences that survived re-location are at lines 308-309 and 309-311 of the
fetched bytes; every other sentence was rewritten against `-11`. Quote-to-line
table and all three revisions' bytes:
`.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/`. S118 stays reserved for
the S044 superseding row.

---

## Errata — round 30 wave 2 (2026-10-26; append-only; `.ufo/waves/round-30/w2/CritEntryPolicyFields.md` D1–D7, `RefetchLiveS116.md` F1–F2)

- **Ground attribution (D1).** The `ground:` line above says the 429/403 status class is held in
  `corpus/knowledge/redirect-and-retry-after-semantics.md`; that note holds RFC 9110 `Retry-After` and the 3xx codes
  only. The lane holds the 429/403 stop class at `SKILL.md:329` and `corpus/knowledge/external-class-fixture-v2.md`
  §4–§5 (`STATUS_TRIP` 429/403).
- **Service-limit definition (D2).** The §2 span quoted in §The two fields stops at `a specific quota policy`; the
  draft's sentence continues with the effective time window within which the client can use no more than the
  available quota (`-11` lines 293–296). The service limit is quota plus, if defined, that window.
- **Sections read (D3, F2).** Besides the sections named on the `source:` line, spans are quoted from §2 Terminology,
  §8.1 and the Status of This Memo boilerplate.
- **Recheck (D4).** The `-11` draft expires 2026-11-24 (Internet-Drafts are valid for at most six months); 180d runs
  past that. The recheck is due on publication of `-12` or later, and in any case by 2026-11-24; registry row S116's
  recheck cell moved `180d` → `2026-11-24` (logged in `corpus/lessons/round-30.md`).
- **Parameters (F1).** In §4.1 `r` is REQUIRED, `t` is OPTIONAL and `pk` is OPTIONAL; a record must accept a
  `RateLimit` item without `t`.
- **Package accounting (D5).** Three package clauses survive in `-11`, not two (lines 308–309, 309–311, 311–313); the
  first two were widened to their full sentences.
- **Retry-After precedence (D6).** The draft says the effective window MAY be ignored when `Retry-After` is present;
  a record that stores `t` as the wait records the non-authoritative field, not necessarily a different number; `t`
  under `-10` was a delay (seconds until more quota), never an instant.
- **Evidence path (D7).** The `-09`/`-10` bytes named in §Limits and §Adopted from land in commit `af0664ed` under
  `.ufo/waves/round-30/w1/ScribeEntryRateLimitFields/bytes/`, one commit after this entry.
