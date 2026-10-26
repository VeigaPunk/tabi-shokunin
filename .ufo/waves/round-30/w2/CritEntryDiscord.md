# CritEntryDiscord — round 30, wave 2 — S117 knowledge entry, sentence by sentence

**Verdict.** I attacked `corpus/knowledge/host-published-rate-limit-headers.md` (row S117) against the
committed normalised bytes of its cited page, the independent refetch bytes, and a fresh read-only
fetch of my own, plus the committed draft-11 bytes behind its mapping table (§6) and the staged
package row it says it adopted. The entry **holds** on everything the counter can see: all 14 quoted
spans of ≥4 words are substrings of the committed normalised body, each exactly once; the three byte
sets committed (`b73dc7d1…`), refetched (`c1c2d3f9…`) and fetched by me (`503ab72b…`) all normalise to
the same 8 728 chars / `c719ecca…4007`; the seven headers with their quoted meanings, the epoch-vs-delta
reading, the fractional `Reset`, the 429 body fields (`message`, `retry_after`, `global`, `code?`),
the 50/s global figure, the interaction-endpoint exemption and the 10 000-per-10-minutes figure are
all supported verbatim (the one header row with a caveat is `Scope`, which truncates its 429-only
condition — S3). It has **two sentence-level defects (D1, D2) and five low-severity gaps (S1-S5, of
which S5 corrects only a citation pointer inside an otherwise supported row)**, none of
which the admission counter is built to see, because none of them is a quoted span:
**D1 (medium)** — §4 tells a receipt that "repeated 401/403/429 outcomes" are inputs to the invalid
request cap, but the same page one sentence later excludes exactly one 429 class
("429 errors returned with `X-RateLimit-Scope: shared` are not counted against you") and asks clients
to account for other invalid statuses, naming a repeated webhook 404; the entry already tells the
journey to capture `Scope`, so this is a documented exclusion the entry drops inside its own
vocabulary. **D2 (medium)** — the "Adopted from" ledger claims the staged package row carried "the 429
body shape, the global-limit figure"; the package row (1 679 B, staged S182) carries neither, nor the
`Global`/`Scope` headers, so the ledger over-credits the source and under-lists what was added. The
two mapping questions asked of me both resolve the same way: **`Bucket`↔`pk` is fair as an "analogue
only"** (the draft's `pk` MUST be a Byte Sequence, the host's bucket is a returned string), and
**`Reset-After`↔`t` survives only because it is hedged** — under draft -11 `t` is the *effective
window*, whose §8.4 disclaims any statement about when quota increases, while the host's `Reset-After`
is a reset delta, i.e. the −10 reading that S116 itself records; the row should name that shift and
the draft's `Retry-After`-takes-precedence rule, since every Discord 429 example carries both. (The
lane moved during this seat: at tip `e8720bc` a sibling errata has already recorded the shared-scope
exclusion, but the second half of D1 — "other invalid statuses", repeated webhook 404 — and D2/S1-S5
remain unrecorded; see "State at hand-off" in §2.)

---

## 1. Axes named

| axis | what it measures here | this seat's move |
|---|---|---|
| **calibration** | does an entry's sentence match the bytes it cites? | D1, D2, and the six changed rows of the sentence table below move it down at tip; a correction moves it up without touching any other axis |
| **depth** | does the entry carry the distinction a journey needs at the point of use? | S1/S2: the mapping table names analogues without the revision shift (`t` −10→−11) or the precedence rule |
| **operability** | can a receipt follow the capture list literally? | S4: the §5 taxonomy omits the seventh header's type |
| **adjacency** | provenance ledger integrity | D2: the adoption ledger credits the package with facts it does not carry |

No move here changes the frontier population or any counter reading; all findings are inside one
knowledge entry and its ledger paragraph.

## 2. Method and byte equality

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. One live clone at the named tip; every
measurement below was made there or in `$HYAKU_SCRATCH/tabi-r30/CritEntryDiscord`
(`HYAKU_SCRATCH=/fast/scratch/hyaku`). Clone porcelain empty before and after (`porcelain_lines=0`).

I re-implemented the frozen counter's own `normalise()` (copied verbatim from
`scripts/check-frontier-admission.mjs` at 072af95, sha256 `cadef57e…9eca`) and applied it to the three
byte sets:

| bytes | size | raw sha256 | normalised chars | normalised sha256 |
|---|---|---|---|---|
| `corpus/evidence/round-30/frontier/bytes/S117.html` (committed) | 408 912 | `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` | 8 728 | `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` |
| `corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html` | 408 912 | `c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3` | 8 728 | `c719ecca…4007` |
| fresh fetch, this seat, 2026-10-26T07:36:04Z | 408 912 | `503ab72b6c362fc2e89ff9bbe64f2f374c80dbfff70a0cd7a99d87bf2264cf08` | 8 728 | `c719ecca…4007` |
| `corpus/evidence/round-30/frontier/bytes/S116.txt` (draft-11) | 67 097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` | — | — (my fresh draft fetch is byte-identical) |

`committed_norm_equals_refetch_norm = true`, `committed_norm_equals_fresh_norm = true`. The SOURCES
row's stability claim ("raw bytes vary per response … normalised body identical, 8 728 chars") is
therefore supported by three distinct raw byte sets, two of them committed. Note for readers: the row
cites `c719ecca…` as the *normalised* digest while the receipt's `sha256` field is the *raw* digest
(`b73dc7d1…`); both are correct, they are different objects. Recorded in
`w2/CritEntryDiscord/receipts.json`.

Mechanical quote test (`qcheck.mjs`, the counter's own `entryQuotes()` rules, run over the entry):
14 spans of ≥4 words, 0 missing, 0 occurring more than once, in all three normalisations. Output in
`w2/CritEntryDiscord/quote-check.txt`. This reproduces the counter's `q1`/`g5` view independently and
is *not* the counter — I did not run the frozen counters; that is C2's operator seat, not mine.

Read-only package read: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md`
(1 679 B, staged S182) — used only to test the entry's own ledger sentences (D2, table rows 13 and 47-50).

**State at hand-off (lane moved during this seat).** I attacked the assignment's named tip 072af95; my
clone is at that revision. The lane advanced to `af0664e` and then `e8720bc` while I worked, and
`git diff 072af95fe2822f0785a6ff88a578e2142dd258e5 HEAD -- corpus/knowledge/host-published-rate-limit-headers.md`
is a **pure append** of nine lines (an "Errata — round 30 wave 2" block citing
`.ufo/waves/round-30/w2/RefetchLiveS117.md` F1-F2) after line 178. Every line reference in my table is
≤180 and therefore identical at both revisions; the entry body I attacked is unchanged. Consequences:
D1 is independently corroborated — the errata's F1 (sibling seat `RefetchLiveS117`) states the
shared-scope exclusion — but F1 closes only the exclusion half; the "other invalid statuses" /
repeated-webhook-404 half of D1 is still unrecorded. D2, S1-S5 and all observations are untouched by the
errata. The errata adds no new ≥4-word double-quoted span (it uses inline code), so `q1-entry-quote` is
unaffected by it.

## 3. Findings

### D1 (medium) — §4 counts shared-scope 429s against the invalid-request cap, which the page excludes

Entry lines 105-108:

> "A receipt that records repeated 401/403/429 outcomes is therefore recording inputs to a second
> limit that no response header declares; the page calls it an invalid request limit and states the
> current figure."

Normalised committed bytes, char offset **8 092** (page §"Invalid Request Limit aka Cloudflare bans",
which the entry cites by name at line 3):

> "429 errors returned with X-RateLimit-Scope: shared are not counted against you."

and offset **8 432 / 8 491**:

> "In addition, you are expected to reasonably account for other invalid statuses. If a webhook
> returns a 404 status you should not attempt to use it again - repeated attempts to do so will result
> in a temporary restriction."

So the set is neither closed nor uniform: one of the three named statuses is conditionally excluded,
and the page extends the class past 401/403/429. The entry's own §3/§6 hand the journey `Scope` as a
429-only qualifier and §5 tells it to capture `Scope`; the one place in the page where `Scope` changes
what a receipt must count is skipped. A receipt that followed §4 literally would over-count, and the
entry's stated purpose (lines 12-14: "the vocabulary a journey receipt uses to *classify* a response")
is exactly what the omission degrades.

Severity: medium — one sentence instructs a journey, the source excludes a case that the entry's own
vocabulary can express, and the correction is one sentence. **Smallest safe correction:** append to
the paragraph, using the page's own bytes: "One exclusion and one extension matter at the record: a
429 counts against this cap only when the response does **not** carry `X-RateLimit-Scope: shared`
('429 errors returned with X-RateLimit-Scope: shared are not counted against you'), and the page asks
clients to 'reasonably account for other invalid statuses', naming a repeated webhook 404 as drawing a
temporary restriction." (Or move the exclusion into §5's capture list as "on 429: record `Scope`,
because a shared-scope 429 is not an invalid request".) Nothing else changes; lines 103-105 stand as
the page's definition.

### D2 (medium) — the adoption ledger credits staged S182 with two facts the package row does not carry

Entry lines 172-177:

> "Kept: the header set and meanings, the 429 body shape, the global-limit figure, and the judgement
> that the host's budget headers can be inaccurate."

The staged package row is 1 679 B and contains: five headers (`X-RateLimit-Limit: 5`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset` (epoch seconds), `X-RateLimit-Reset-After` (a delta),
`X-RateLimit-Bucket` (the bucket identity)); the final per-guild sentence quoted alone; and the
unscoped summary "the host states plainly that its own budget headers can be inaccurate". A full-text
grep for every term the "Kept" items would need:

```
$ grep -in "retry_after\|50 requests\|global\|scope\|code\|message\|10,000" \
    /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-header-set-r16.md
7:… as opposed to the status code alone …
21:where the rate-limit *scope* is not the origin.
24:than a status code to record — the remaining budget, the reset (absolute or
25:delta), the bucket, and the scope. And the host states plainly that its own
grep_exit=0
```

That is the whole inventory: no `retry_after`, no body-field table, no `X-RateLimit-Global`, no
`X-RateLimit-Scope`, no `50 requests`, no `10,000`. The same grep over the **entire** package
knowledge directory (`/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/`)
returns no file at all for `retry_after`, `50 requests per second`, `X-RateLimit-Global` or
`10,000 per 10 minutes`, so the two facts are not merely absent from the named row — the theme never
carried them. So of the four "Kept" items: "the header set and
meanings" is true for **five of seven** headers; "the 429 body shape" and "the global-limit figure"
are not in the package at all; only the inaccurate-budget judgement is genuinely kept (the per-guild
caveat is separately and correctly described as *corrected*). The "Added here" list (lines 177-179)
names §5, §6 and §7 — the two extra headers, the 429 body shape, the global figure and the invalid
request cap are added facts that appear in neither list, so the ledger both over-credits the source and
under-reports the addition.

Severity: medium — this is the lane's provenance record for an adopted row, checkable against a
read-only path, and it is false on two named items. **Smallest safe correction:** "Kept: the five
budget headers and their short meanings, the per-guild caveat sentence as quoted, and the judgement
that the host's budget headers can be inaccurate. Added: the `Global` and `Scope` headers, the 429
body shape, the global-limit figure, the invalid-request cap, the shape-only capture rules (§5), the
mapping and its non-equivalences (§6), and the explicit limits (§7)."

### S1 (low) — §6 line 140: `w` has no source in this host's set

Row: "`X-RateLimit-Limit` | policy `q`, with `w` for the window | analogue: the host publishes no
policy identifier, so the policy must be grouped by the bucket rather than named". The status column
accounts for the missing *policy identifier* but not for the missing **window**: no Discord header on
the page declares a window length (the header list at offsets 3 583-4 400 has no duration but
`Reset`/`Reset-After`), and the draft's `w` is OPTIONAL (S116.txt 348-349, 397-402). As worded, `q`
plus "`w` for the window" reads as if the host's set yields a window; it does not. Smallest correction:
drop ", with `w` for the window" or add "the host publishes no window either, so `w` (OPTIONAL in the
draft) has to be left out or synthesised, and the entry must say which".

### S2 (low, borderline medium for a receipt) — §6 line 142: `Reset-After`↔`t` is hedged but does not name what changed

Row: "closest analogue: a delay in seconds, as the draft's `t` is; the host's value may carry
decimals". Every clause in it is true, and "closest analogue" is the right label, so the *claim*
holds. What the row does not say, and what a receipt mapping needs:

- Under **-11**, `t` is the **effective window** — "the number of seconds within which the client can
  use no more than the available quota … a non-negative Integer compatible with the delay-seconds
  rule" (S116.txt 490-497) — and §8.4 disclaims the reset reading explicitly: "The effective window
  parameter does not imply anything about when the server will increase the available quota. The
  effective window does not necessarily end at a fixed point in time" (864-866). The host's
  `Reset-After` is "Total time (in seconds) of when the current rate limit bucket will reset" — a
  *reset* delta, i.e. the **-10** reading, which S116's own addendum records ("in `-10` §4.1.2 the
  parameter was the Reset Parameter — seconds until further quota is made available; in `-11` … it is
  the effective window", `corpus/knowledge/rate-limit-policy-fields.md` lines 81-88).
- The draft's precedence rule is load-bearing here and absent from S117: "If a response contains both
  the RateLimit and Retry-After fields, the Retry-After field MUST take precedence and the effective
  window MAY be ignored" (734-735). Every Discord 429 example carries `Retry-After` alongside
  `Reset-After`.
- The host's own shared example is the counterexample that shows why: `< Retry-After: 1337 …
  X-RateLimit-Remaining: 9 … X-RateLimit-Reset-After: 64.57 … X-RateLimit-Scope: shared` with
  `"retry_after": 1336.57`. `t` is only an upper bound on use ("no more than the available quota"), not
  a permission; a receipt that read `Reset-After` as the effective window here would think it may
  spend 9 requests within ~65 s while the host says the resource is throttled for 1 336.57 s.

Severity: low — S116 carries the precedence rule, and S117's hedge keeps the row literally true; but
the mapping table is the receipt-facing artifact, so the revision shift belongs in the status column.
Smallest correction: "closest analogue, and exact only under the draft's −10 reading, where `t` was the
reset parameter; under −11 `t` is the effective window ('the number of seconds within which the client
can use no more than the available quota', §8.4: it implies nothing about when quota increases). When
`Retry-After` is on the response — as on all three of this host's 429 examples — the draft gives it
precedence and the effective window MAY be ignored, so a receipt must not record `Reset-After` as `t`
while the response carries `Retry-After`."

**Counter constraint on this correction** (read from the frozen counter, `check-frontier-admission.mjs`
lines 56-58 and 259-261): `q1-entry-quote` requires every ≥4-word double-quoted span of the entry body
to be a substring of the normalised bytes of **one of the entry's cited rows**, and S117 cites only the
Discord page. A correction that adds a new double-quoted draft phrase would therefore fail admission
even though the phrase is true and located in S116's bytes. Word it as a citation ("S116, draft −11
§4.1.2") or paraphrase without double quotes; the two Discord spans D1 needs, by contrast, are already
in S117's own bytes (offsets 8 092 and 8 432) and can be quoted directly.

### S3 (low) — §1 line 33: the `Scope` row truncates the condition, where the `Global` row keeps it

Entry row 33 quotes `"Value can be user (per bot or user limit), global (per bot or user global
limit), or shared (per resource limit)"`. The page's row is
`X-RateLimit-Scope - Returned only on HTTP 429 responses. Value can be user (…)` (offset 4 253). The
`Global` row immediately above (entry line 32) retains "Returned only on HTTP 429 responses if …", so
the table is asymmetric in a way that reads `Scope` as an unconditional header. Mitigation: §6 line
145 does call both "429-only qualifiers", and §3 only shows `Scope` on 429s — so no journey is
actually misled by the document as a whole, which is why this is low. Smallest correction: extend the
quoted span to start at "Returned only on HTTP 429 responses." (it is a single contiguous span in the
bytes, so the counter still locates it once).

### S4 (low) — §5 lines 117-119: the capture taxonomy skips the seventh header and mis-types `Scope`

"rate-limit signal: each header name present, and its value as a number (`Limit`, `Remaining`,
`Reset`, `Reset-After`) or as an opaque string (`Bucket`, `Scope`), plus `Retry-After` when present".
`X-RateLimit-Global` — one of the seven headers in the entry's own §1 table — is the only header whose
documented value is a boolean (`X-RateLimit-Global: true`), and it is the sole header-bearer of "you
are being globally rate limited" in §3's global example; it is named nowhere in this bullet. `Scope`'s
value is an enumerated token (`user` | `global` | `shared`), not "an opaque string" in the sense
`Bucket` is. "each header name present" rescues the capture, but the type list is what a receipt
implements. Smallest correction: "…or as a boolean (`Global`) or an enumerated token (`Scope`:
`user`, `global`, `shared`), plus `Retry-After` when present."

### S5 (low) — §6 line 144: the `(S116)` pointer does not carry the fact it is cited for

"the draft's `pk` is a byte-sequence value (S116)". True of the draft: "The `pk` parameter value
conveys the partition key associated to the request. The value MUST be a Byte Sequence"
(S116.txt 407-409 and 520-521). But S116's *entry text* never states the Byte Sequence rule
(`grep -in "byte\|sequence" corpus/knowledge/rate-limit-policy-fields.md` → only "a sequence of HTTP
responses", line 20, and the byte-count prose, lines 3 and 86-88). The pointer is to the entry, not to
the draft section; a reader checking S116 alone cannot confirm it. Smallest correction: cite "draft §3.1.4/§4.1.3" (or add the rule to
S116, which is the entry that holds the draft). The mapping itself is fair: a partition key and an
opaque bucket both identify the quota partition, and the entry's "analogue only … host-assigned
string" is the honest label; the deeper asymmetry it could add is draft §6.1's expectation that the
server "SHOULD document how the partition key is generated so that clients can predict the key value
for a future request", which the host's returned identifier does not support.

### Observations that are not defects

- **§3 lines 85-87**: "a shared-resource throttle (… whose `retry_after` in the example differs from
  the numeric `Retry-After` …)". True (1336.57 vs 1337), but non-distinguishing: the user and global
  examples differ by the same 0.43 (64.57 vs 65). The genuinely distinctive fact in the shared example
  is that its `retry_after` (1 336.57) is twenty times its own `X-RateLimit-Reset-After` (64.57) while
  `Remaining` reads 9 — the sharpest thing this page shows a receipt. No false statement, so not a
  defect; folded into S2 where it matters.
- **§3 line 82 vs lines 87-89**: the entry records both "normal route rate-limiting headers will also
  be sent in this response" and a global example that omits every per-route header. That is a tension
  on the page, not in the entry; the entry's §5 rule (absent recorded as absent, reason stated) handles
  it, so I do not ask for a change beyond noting that the entry could name the tension.
- **§4 line 96**: the 50/s figure is presented without the page's increase path ("you can reach out to
  support to see if you qualify for increased global rate limits", offset 7 087). The entry elsewhere
  warns against hard-coding limits, so this sits consistently; a one-clause addition would close it.
- **§1 lines 54-55**: "opaque and host-assigned" is an inference beyond the page's "A unique string
  denoting the rate limit being encountered"; it is consistent with the page's recommended use, so I
  mark it supported-as-inference rather than changed.
- **§5 line 120**: dropping the body `message` is a lane rule, not a page claim; the page's `message`
  is required and differs by scope ("The resource is being rate limited." in the shared example), so
  the discarded field is a redundant scope cue, not evidence lost.

## 4. Sentence table (entry line → verdict)

Verdicts: **S** = supported by the committed normalised bytes (and the refetch and my fresh fetch);
**C** = changed (a claim inside the sentence is not what the bytes say, or needs a qualification the
entry does not carry); **U** = unsupported. No sentence was wholly unsupported.

| # | entry line(s) | claim (abridged) | verdict | evidence |
|---|---|---|---|---|
| 1 | 3 | cites §Header Format, §Exceeding A Rate Limit, §Global Rate Limit, §Invalid Request Limit aka Cloudflare bans; fetched 2026-10-26 | S | all four headings present (offsets 1 101-1 156 in the page nav, repeated as sections); fetch 200 / 408 912 B / `503ab72b…` at 2026-10-26T07:36:04Z |
| 2 | 10-16 | not measured in this lane; docs only | S | the S117 receipts are documentation fetches (`bytes/S117.html`, `fetched_at` 06:40:02Z) with no API-call receipt beside them (process claim, not byte-testable) |
| 3 | 20-21 | the page states the surface before the header table: headers optional, describe the limit encountered | S | sentence at 3 296, header table starts 3 424 |
| 4 | 23 | quote "For most API requests made …" | S | 1 occurrence |
| 5 | 27-32 | six header rows: Limit, Remaining, Reset, Reset-After, Bucket, Global with quoted meanings | S | each quoted span 1 occurrence; header list runs 3 583-4 400 |
| 6 | 33 | `Scope` row quoted as "Value can be user …, or shared (per resource limit)" | **C** (S3) | page row at 4 253 begins "Returned only on HTTP 429 responses." — condition dropped while row 32 keeps the same condition |
| 7 | 35-46 | the page's own header example, values illustrative | S | five header lines present verbatim (`X-RateLimit-Limit: 5`, `…Reset-After: 1`, `…Bucket: abcd1234`) |
| 8 | 48-49 | the set is optional; absent is not zero, record as absent | S | "optional HTTP response headers" at 3 296; lane rule follows from it |
| 9 | 50-53 | `Reset` is absolute epoch; the 429 example is fractional (1470173023.123), the plain example integer; `Reset-After` is a delta the page says can carry decimals | S | epoch meaning at 3 717; `1470173023.123` in both 429 examples (5 337, twice) vs `X-RateLimit-Reset: 1470173023` in the plain example (3 497); "Can have decimals to match previous millisecond ratelimit precision" at 3 927 |
| 10 | 54-55 | `Bucket` is the recommended identifier for a shared per-route limit; a bucket covers similar endpoints; opaque, host-assigned | S | "In some cases, per-route limits will be shared across a set of similar endpoints" (1 992) + "It's recommended to use this header as a unique identifier" (2 118); "opaque/host-assigned" is inference (observation) |
| 11 | 59 | one class of routes is limited by a different scope than the origin | S | per-guild passage at 3 030 |
| 12 | 62 | per-guild quote (25 words) | S | 1 occurrence; also in the refetch and my fetch |
| 13 | 65-67 | the staged package quoted only the final sentence and read the caveat generally | S | package row quotes that sentence alone, then says "the host states plainly that its own budget headers can be inaccurate" unscoped |
| 14 | 64, 67 | the scope is emoji-control routes, not the API as a whole; scoped by the two preceding sentences | S | 3 030-3 150 |
| 15 | 67-69 | an inaccurate `Remaining` on an unrelated route does not confirm the exception | S | follows from 14 |
| 16 | 73 | failure shape is a 429 with headers and a JSON body | S | "In the case that a rate limit is exceeded … will return a HTTP 429 response code with a JSON body" (4 448-4 499) |
| 17 | 75-76 | the two 429 quotes | S | 1 occurrence each |
| 18 | 78-79 | body fields `message` (string), `retry_after` (float seconds), `global` (boolean), optional integer `code` | S | "Rate Limit Response Structure" at 4 670; `code? integer` at 4 946 |
| 19 | 79-82 | "normal route rate-limiting headers will also be sent in this response" | S | 1 occurrence; tension with the global example noted (observation) |
| 20 | 84-90 | the three 429 examples separate user / shared / global; global is the only one with `X-RateLimit-Global: true` and no per-route headers; distinction never the status code, 429 in all three | S | examples at 5 139 / 5 526 / 5 931; `X-RateLimit-Global: true` occurs once; parenthetical non-distinguishing (observation) |
| 21 | 94 | two limits documented outside the per-route headers | S | 6 217, 7 475 |
| 22 | 96-97 | 50/s global quote; interaction-endpoint quote | S | 6 217 and 7 183, 1 occurrence each |
| 23 | 99-101 | first limit independent of any route; without `Authorization` it applies to the IP; the second is the interaction-endpoint exemption | S | "If no authorization header is provided" at 6 276 |
| 24 | 103-105 | a request-validity cap; 401, 403 or 429; 10 000 per 10 minutes at fetch time | S | 7 451 and 7 475 match the page's definition |
| 25 | 105-108 | a receipt recording repeated 401/403/429 outcomes is recording inputs to a second limit no response header declares | **C (D1)** | 8 092 excludes `Scope: shared` 429s; 8 432/8 491 extend the class ("other invalid statuses", repeated webhook 404) |
| 26 | 107-108 | the page calls it an invalid request limit and states the current figure | S | "Invalid Request Limit aka Cloudflare bans" (heading) + 7 451 |
| 27 | 117-119 | capture taxonomy: numbers (Limit, Remaining, Reset, Reset-After) or opaque strings (Bucket, Scope), plus `Retry-After` | **C** (S4) | `Global` (boolean `true`) is one of the seven headers and is unlisted; `Scope` is enumerated (`user`/`global`/`shared`) |
| 28 | 120-121 | on 429 record only `retry_after`, `global`, `code`; `message` not evidence | S | body table 4 670-4 990 (lane rule on top of a supported shape) |
| 29 | 122 | absent headers recorded as absent, reason stated | S | optional at 3 296 |
| 30 | 123-124 | receipt's own UTC clock for interpreting an absolute `Reset` | S | follows from `Reset` = epoch (4 279) |
| 31 | 129-130 | the page warns against pinning behaviour to a fixed limit; parse at run time | S | "rate limits should not be hard coded into your app … parse response headers" (1 693) |
| 32 | 134-136 | S116 defines the two fields: policy `q`,`qu`,`w`,`pk`; RateLimit `r`,`t`,`pk` | S | S116.txt 340-350, 460-470 |
| 33 | 140 | `Limit` → policy `q`, "with `w` for the window" | **C** (S1) | no Discord header declares a window; draft `w` is OPTIONAL (348-349, 397-402) |
| 34 | 141 | `Remaining` → `r`, direct analogue | S | S116.txt 461-462 ("This REQUIRED parameter value conveys the available quota") |
| 35 | 142 | `Reset-After` → `t`, "closest analogue: a delay in seconds … may carry decimals" | **C** (S2) | -11 `t` = effective window (490-497, 864-866); host value = reset delta = -10 reading; precedence rule 734-735; shared example 5 526 |
| 36 | 143 | `Reset` has no analogue among `r`,`t`,`pk`; an absolute epoch is not `t` | S | 490-497; S116 entry records "No absolute reset member" |
| 37 | 144 | `Bucket` → `pk`, analogue only: partition key vs host-assigned string; byte sequence (S116) | S | "The value MUST be a Byte Sequence" (408, 521); citation precision (S5) |
| 38 | 145 | `Global`/`Scope` → none; 429-only qualifiers; draft has no global/shared field | S | draft policy item is name + `q`,`qu`,`w`,`pk` (330-355) |
| 39 | 146 | `Retry-After`/`retry_after` → none in the two fields; page says read either | S | 4 554 ("rely on the Retry-After header or retry_after field"); gap: draft precedence 734-735 (folded into S2) |
| 40 | 148-150 | neither field vocabulary nor header set substitutes for the other; never relabel absolute `Reset` as `t` | S | follows from 36 |
| 41 | 154-156 | documented, not measured; example values are the page's | S | no Discord response in evidence; example block matches 3 424-3 600 |
| 42 | 157-158 | one host, one page | S | single source line |
| 43 | 159-160 | the page is rolling; no version marker or commit; 90-day recheck | S | normalised body carries no version; SOURCES row records only `dateModified` |
| 44 | 161-162 | a missing header is absence of signal; the page says the headers are optional | S | 3 296 |
| 45 | 163-165 | emoji-control routes may return an inaccurate quota, so a header is never proof | S | 3 030-3 150 |
| 46 | 166-168 | the cap is documented, not modelled; the figure is page-time | S | 7 451 |
| 47 | 173-175 | Kept: header set and meanings, the 429 body shape, the global-limit figure, the inaccurate-budget judgement | **C (D2)** | package (1 679 B) lacks the 429 body shape, the 50/s figure and `Global`/`Scope`; has five headers + caveat + judgement |
| 48 | 175-176 | Corrected: the per-guild caveat is scoped to emoji-control routes | S | package states it unscoped; 3 030-3 150 supports the correction |
| 49 | 177-179 | Added: §5 capture rules, §6 mapping, §7 limits | S | absent from the package (extends to the two extra headers, body shape, global figure, cap — see D2) |
| 50 | 179-180 | Dropped: the package's round provenance and wave-1/wave-3 framing | S | package lines 1-6 and its "Wave 1 and wave 3 …" paragraph are gone from S117 |

Counts: 44 supported, 6 changed, 0 unsupported.

## 5. Mapping questions asked of this seat, answered directly

**Is `X-RateLimit-Bucket`↔`pk` fair?** Yes, as "analogue only", which is how the row states it. The
draft's `pk` is constrained more tightly than a name: "The value MUST be a Byte Sequence"
(draft §3.1.4 / §4.1.3, S116.txt 407-409, 520-521) and §6.1 expects it to be derivable in advance
("The server SHOULD document how the partition key is generated so that clients can predict the key
value for a future request"), while the host returns "A unique string denoting the rate limit being
encountered (non-inclusive of top-level resources in the path)" and recommends it "to group shared
limits as you encounter them". Both identify a quota partition; the type and predictability gaps are
real and the row's "host-assigned string" is the right description. Only the citation is loose (S5).

**Is `X-RateLimit-Reset-After`↔`t` fair given -11's "effective window"?** Fair only as a hedged
analogue, and the entry's hedge is what keeps the claim true. Under -11, `t` is the effective window —
a delay-seconds-shaped integer ("the number of seconds within which the client can use no more than
the available quota") whose §8.4 explicitly says it "does not imply anything about when the server will
increase the available quota". The host's `Reset-After` is a reset delta — precisely the **-10**
definition of `t`, as S116's addendum records. The two readings diverge exactly on 429s, which is where
this host always sends `Retry-After` alongside, and where the draft says `Retry-After` takes precedence
and the effective window may be ignored. The host's own shared example makes the risk concrete
(`Remaining: 9`, `Reset-After: 64.57`, `retry_after: 1336.57`). The row is not false, but it should
name the revision shift and the precedence rule (S2).

## 6. Commands and exit codes

All run 2026-10-26; `$S=/fast/scratch/hyaku/tabi-r30/CritEntryDiscord`,
`$O=…/tabi-shokunin/.ufo/waves/round-30/w2/CritEntryDiscord`.

| command | exit | output |
|---|---|---|
| `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` | 0 | clone |
| `git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5` | 0 | |
| `git -C "$S/clone" rev-parse HEAD` | 0 | `072af95fe2822f0785a6ff88a578e2142dd258e5` |
| `git -C "$S/clone" status --porcelain \| wc -l` | 0 | `0` (before and after) |
| `curl -sS -o fresh.html -w 'http_status=%{http_code} bytes=%{size_download} …' https://docs.discord.com/developers/topics/rate-limits` | 0 | `http_status=200 bytes=408912 redirects=0` |
| `sha256sum fresh.html` | 0 | `503ab72b…cf08` |
| `curl -sS -o rl11.txt https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt` | 0 | `http_status=200 bytes=67097 redirects=0` |
| `sha256sum rl11.txt corpus/evidence/round-30/frontier/bytes/S116.txt` | 0 | both `d6016dd0…d412` |
| `sha256sum corpus/evidence/round-30/frontier/bytes/S117.html refetch/bytes/S117-refetch.html` | 0 | `b73dc7d1…83c3`, `c1c2d3f9…b2f3` |
| `node norm.mjs <each of the three S117 byte sets>` | 0 | each 8 728 chars, `c719ecca…4007` |
| `node -e 'compare the three normalisations'` | 0 | `committed==refetch true`, `committed==fresh true`, quote count 1 in each |
| `node qcheck.mjs` (counter's `entryQuotes()` over the entry) | 0 | 14 spans ≥4 words, `missing: 0`, `count>1: 0` → `$O/quote-check.txt` |
| `python3 - <<'EOF' …` (offset/count dump over the normalised body) | 0 | → `$O/anchors.txt` |
| `grep -in "retry_after\|50 requests\|global\|scope\|code\|message\|10,000" <package row>` | 0 | 5 prose hits, no field/figure → D2 |
| `node scripts/check-frontier-admission.mjs …` | — | **not run by this seat** (C2 operator reading; my equality result above is my own normalisation, not the counter's) |

Receipts: `$O/receipts.json`, `$O/normalised-S117-fresh.txt`, `$O/quote-check.txt`,
`$O/anchors.txt`. Tooling: nothing installed or upgraded this seat.

## 7. Axes impacted and the smallest safe corrections

- **calibration** — D1 and D2: two sentences assert something the cited bytes (page / package) do not
  say. Corrections are one sentence each and use the source's own wording; no counter, row id, or
  receipt changes.
- **depth** — S1 and S2: the mapping table names analogues but withholds the -11 effective-window
  shift and the `Retry-After` precedence rule, which is what a receipt mapping needs at the point of
  use.
- **operability** — S4: the capture taxonomy must be implementable from the bullet alone; it should
  name `Global` and type `Scope`.
- **adjacency** — D2: the adoption ledger is the lane's provenance record; it must not credit the
  package with the 429 body shape or the global figure.

Every correction above is quotable from S117's own normalised bytes, with one exception: the draft
§4.1.2 clause in S2 must be cited (S116, draft −11 §4.1.2), not double-quoted, or `q1-entry-quote`
would fail because S117's only cited row is the Discord page.

Nothing I found changes C2's population/admitted counts: all 14 quoted spans are located once, the
receipts are byte-consistent with a live refetch by a third seat, and the entry's non-quoted defects do
not touch any row id, used-by line, or Gate quote. The counter cannot see D1, D2 or S1-S5 — they are
paraphrase and ledger defects, not quote defects — which is the boundary of what an admission counter
can verify for this entry.
