# CritEntryProse — attack on the prose of the round-31 C1 entry (outside the table)

Seat: `CritEntryProse` · round 31 attempt 2, wave a2w1 (falsify) · milestone C1
Target: `corpus/knowledge/rate-signal-decision-table.md` at `486048356f0712e4396588c9dab58cd419243120`
Baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`, claims frozen in `9505a10eb80b2a0b273ebaba3f7f872ad302192d`.
Attack seat: findings only, no repair.

## Verdict

The prose is **mostly sourced and mostly honest, with one real factual error and a cluster of
small modality/absence overclaims**. Every factual sentence attributed to S119, S120, S121 and
S122 that I could locate is present in the committed receipt bytes *and* in the live page
(S121/S122 body text is byte-identical after normalisation; S119/S120 live bytes are
sha256-identical to the receipts), and there is **no unsourced number and no 4+-word quotation
outside the table** — the prose contains no double-quoted span at all outside the table. The one
sentence that is **false against the lane's own files** is the portability claim at
`rate-signal-decision-table.md:132-133`: it says GitHub's header names overlap the held S117
(Discord) set "only on the remaining and reset fields", but S117 records `X-RateLimit-Limit`
(`host-published-rate-limit-headers.md:27`) and GitHub publishes `x-ratelimit-limit`
(`S121.html:134`) — the overlap is three, and the omitted one is precisely the header rows **D7
and D8 key on**, so the caveat fails in the direction that matters. Next is
`:89-90` "a stop after **a stated number of retries**": neither S121 nor S122 states a number;
both say "throw an error after **a specific** number of retries", so the prose attributes to the
vendor a threshold the vendor explicitly leaves to the implementer — the exact failure mode this
round's axis is built to punish, in prose instead of a row. The rest (`:8` "no revision marker or
dated revision in the fetched bytes", `:24-26` "exactly one action drawn from a closed verb set",
`:105` "with a queue in between", `:123` "429, 403 or robots disallow") are low-severity: each is
a real overclaim of absence, exclusivity, obligation or completeness, each fixable in one clause,
none of which touches the counter. **No prose sentence misstates an RFC 2119 force in the
direction of a decision the table then takes** — the force flattening that exists (`:71`
"redirect budget is five") is contradicted by D1's own correct "SHOULD", so the table is not
misled. Verdict on the prose as a whole: **defect, moderate — one false sentence about the lane's
own held sources plus one false attribution of a stated retry count; the remaining sentences hold
or carry low-severity overclaims.**

Axes attacked: **C1 depth** (a row's prose justification is the only place the force/scope/derived
distinction is kept — `:41-44` says so itself), **calibration** (prose that claims a source states
a number the source leaves open is the same oracle drift C2 measures in SKILL.md/README tallies),
**adjacency** (the S117 overlap sentence is the only cross-entry portability claim in the round).

## Findings

### F1 — DEFECT, moderate. The S117 header-overlap sentence is false, and false on the header the entry's own cap rows use.

Line evidence (`corpus/knowledge/rate-signal-decision-table.md:132-133`):

```
  exact count. Its header names overlap the vendor set already held (S117) only on the
  remaining and reset fields; the rest differ, so a row keyed on a header name is not
```

The held set, `corpus/knowledge/host-published-rate-limit-headers.md:27-29`:

```
| `X-RateLimit-Limit` | "The number of requests that can be made" |
| `X-RateLimit-Remaining` | "The number of remaining requests that can be made" |
| `X-RateLimit-Reset` | "Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets" |
```

The vendor set, `corpus/evidence/round-31/decision-table/bytes/S121.html:134` (tags stripped):

```
x-ratelimit-limit  x-ratelimit-remaining  x-ratelimit-used  x-ratelimit-reset  x-ratelimit-resource
```

The name intersection is **{limit, remaining, reset} — three, not two**. `limit` is omitted from
the sentence, and `limit` is the header rows D7 (`:55`) and D8 (`:56`) are keyed on. So the
sentence's own conclusion ("the rest differ") is wrong for the two rows whose portability the
caveat is supposed to govern: `x-ratelimit-limit` **is** portable by name to the one host the lane
already holds, while `x-ratelimit-used` and `x-ratelimit-resource` are the ones that differ.

Smallest safe correction: change "only on the remaining and reset fields" to "only on the limit,
remaining and reset fields" (one word, no other edit). If the author's intent was that only
remaining and reset carry the same *semantics*, `limit` carries the same semantics too (a per-hour
request maximum in both), so the correction is the same.

Impact: prose only — the counter reads no prose (`scripts/check-decision-table.mjs` has no
check that touches this line), so C1's `admitted`/`failing` numbers are unaffected. The damage is
to the entry's adjacency claim and to a reader who concludes D7/D8's key header is GitHub-specific.

### F2 — DEFECT, low-moderate. "a stated number of retries" — neither cited page states a number.

Line evidence (`:88-90`):

```
fallback apply — a wait of at least one minute (S121 §exceeding-the-rate-limit) — and for a
secondary limit that keeps refusing, an exponentially increasing interval with a stop after
a stated number of retries.
```

S121 `§exceeding-the-rate-limit` (`S121.html:144`, live-identical):

```
If your request continues to fail due to a secondary rate limit, wait for an exponentially
increasing amount of time between retries, and throw an error after a specific number of retries.
```

S122 `§handle-rate-limit-errors-appropriately` (`S122.html:51`) says the same words: "throw an
error after a specific number of retries". "Specific" is the implementer's number, not the
vendor's. `grep -c '[0-9]'` over the retries clause finds no digit, and neither page offers a
recommended count anywhere else.

Smallest safe correction: replace "a stated number of retries" with "a number of retries the
implementer fixes" (or "a specific number of retries", the vendor's own words).

Impact: this is the round's own failure mode — attributing a threshold to a source that does not
state one — appearing in prose after the counter was built to reject it in a row. It is not a row,
so C1 is unaffected; it is exactly the kind of sentence a future round would quote as "the lane
says the page states a retry cap".

### F3 — DEFECT, low. "no revision marker or dated revision in the fetched bytes" is contradicted by the fetched bytes, in the lane's own S117 vocabulary.

Line evidence (`:8`):

```
recheck: 180d for S119 and S120 (...); 90d for S121 and S122 (vendor pages, with no revision
marker or dated revision in the fetched bytes, so the cadence is the only guard)
```

The bytes (`S121.html`, rendered and JSON, live-identical):

```
API Version: </span><span class="fundefined color-fg-muted text-normal" data-testid="version">2026-03-10 (latest)
"apiVersions":["2026-03-10","2022-11-28"],"latestApiVersion":"2026-03-10"
```

So the fetched bytes carry a **dated version marker** (`2026-03-10`, labelled `latest`, with a
prior `2022-11-28`). There is no *page* revision date (`grep -o 'dateModified\|lastUpdated\|<time'`
→ 0 hits in both files), which is the defensible reading — but the lane's own S117 registry row
uses the phrase "**no version marker**, page dateModified 2026-02-06T17:38:32.017Z"
(`corpus/SOURCES.md:131`), i.e. the lane distinguishes *version marker* from *page date*. Under
that vocabulary the S121/S122 sentence asserts the absence of a marker that is present, and "the
cadence is the only guard" is overstated: a change in the `API Version` string is a detectable
signal that the documented surface moved.

Smallest safe correction: "with no page-revision date in the fetched bytes (the bytes carry only
the dated API-version selector, `2026-03-10`), so the cadence is the guard".

Impact: prose only; it is the justification for the 90d recheck, and the 90d value itself is not
challenged.

### F4 — DEFECT, low. "exactly one action drawn from a closed verb set" is not what the table does, and the set is two-thirds unused.

Line evidence (`:24-26`):

```
header, a published quota, a vendor pacing instruction — with exactly one action drawn
from a closed verb set (wait, stop, retry, allow, disallow, cap, follow, refetch, backoff,
cache, limit, pause, serialize), and a threshold carrying the number the source states.
```

Two problems, both prose-side:

1. **D3 (`:51`) carries two actions.** Its Decision cell reads "allow — MAY treat the file as
   unavailable after the example period (or keep a cached copy); **before that, complete disallow
   applies**". That is a second action, in the set's own second verb `disallow`, inside a cell the
   counter admits because `t3-decision` reads only the leading word
   (`scripts/check-decision-table.mjs:275`: `const verb = (decision.toLowerCase().match(/^[a-z]+/) || [""])[0];`).
   "Exactly one action" is therefore false for D3, and the counter cannot see it.
2. **Five of the thirteen declared verbs never appear in any Decision cell** — `retry`,
   `disallow`, `backoff`, `cache`, `serialize` (rows D1–D13 use follow, stop, allow, refetch,
   limit, wait, cap, pause). A "closed verb set" two-thirds unused is a vocabulary claim the table
   does not exercise, and `disallow` appears only inside D3's trailing clause, i.e. exactly where
   the counter does not look.

Smallest safe correction: "with one leading action drawn from a closed verb set (...)" — one word;
and, if the unused verbs stay, say "the set is the vocabulary a row may draw on, not one it does".

Impact: prose only. It does not change `admitted`, but it is the sentence a reader would use to
argue the table is a normalised decision algebra, which it is not.

### F5 — DEFECT, low. "with a queue in between" turns an offered option into the described practice.

Line evidence (`:104-105`):

```
**Request-time caps are applied before a request, not after a response.** Requests are
made serially rather than concurrently, with a queue in between (S122
```

S122 `§avoid-concurrent-requests` (`S122.html:43`, live-identical):

```
To avoid exceeding secondary rate limits, you should make requests serially instead of
concurrently. To achieve this, you can implement a queue system for requests.
```

The page recommends serialisation (SHOULD, lower-case "should") and offers a queue as **one way**
("you can implement"), not as the practice. The entry states both flatly, and the queue as part of
what is done.

Smallest safe correction: "made serially rather than concurrently, a queue being the page's
suggested means (S122 §avoid-concurrent-requests)".

### F6 — DEFECT, low. The fixture stop rule is under-enumerated against the lane's own §5.

Line evidence (`:122-124`):

```
- **The lane's measured stop rule is unchanged.** The pinned fixture driver stops at the
  first 429, 403 or robots disallow and never waits the delay it was handed: the 429 cell
  carried `Retry-After: 7` and the run ended without a re-request
```

`corpus/knowledge/external-class-fixture-v2.md:410` heads the section "**§5. E2 measured — the
four trip classes**" and the table at `:418-421` lists four: `robots-disallow`, `http-429`,
`http-403`, **`interstitial-shape` (marker at status 200)**. The entry's three-item list drops the
fourth class — the one that fires at a 200, i.e. the class that shows the stop predicate is not a
status-code test. Everything else in the sentence is exact: `Retry-After: 7` is the `probe-429`
cell (`:419`, and the fixture source at `:338`), and "never waits the delay it was handed" is
`:451-452` verbatim in substance ("does not wait 7 s, does not re-request, does not retry
through").

Smallest safe correction: "stops at the first 429, 403, robots disallow or interstitial shape"
(four words).

Impact: prose only; it weakens the entry's own best argument (the stop predicate is not
status-class-shaped), which the surrounding paragraph is trying to make.

## Holds (sentence groups I attacked and could not falsify)

**S119 group (`:68-79`)** — holds, all six sub-claims located verbatim in `bytes/S119.txt` and in
live bytes (sha256-identical):

| claim | receipt line | source text |
|---|---|---|
| 400–499 leaves access open, crawler may access any resource | `S119.txt:391-396` | "the crawler MAY access any resources on the server" |
| 500–599 example range, unreachable obliges complete disallow | `S119.txt:398-404` | "the crawler MUST assume complete disallow … 500-599 range" |
| five consecutive redirects, across authorities | `S119.txt:377-379` | "SHOULD follow at least five consecutive redirects, even across authorities" |
| inside five: fetched, parsed, rules followed in the context of the initial authority | `S119.txt:381-384` | MUST, word for word |
| beyond five: may treat as unavailable | `S119.txt:385-386` | MAY |
| 24 hours unless unreachable | `S119.txt:418-420` | "SHOULD NOT use the cached version for more than 24 hours" |
| parsing limit at least 500 KiB | `S119.txt:425` | "MUST be at least 500 kibibytes [KiB]" |
| 30 days is an example, not a deadline | `S119.txt:405-408` | "(for example, 30 days)" |

**S120 group (`:95-99`, `:139-142`)** — holds. §4: 429 defined, `Retry-After` MAY
(`S120.txt:134-138`); §7.2: "servers are not required to use the 429 status code"
(`S120.txt:300`) — the entry's "a server need not use 429 at all" is the source's own force, not
an upgrade. The specimen reading is right: `Retry-After: 3600` (`:145`) and "I only allow 50
requests per hour" (`:152-153`) are inside the example response block, and no D-row cites S120 —
`corpus/SOURCES.md:134` registers S120's used-by as this entry, so the prose-only citation is
registered, not orphaned.

**S121 group** — holds on every clause I tested:
- 403/429 as one outcome, no discriminator between the two codes: `:143` gives "a `403` or `429`
  response" for primary and `:144` "a `403` or `429` response and an error message" for secondary;
  no sentence assigns different meanings to the two codes. "publishes no field that separates the
  two codes from each other" survives.
- region variance and "avoid logic that depends on an exact remaining count": `:138` and `:140`,
  both live-identical.
- ban: `:145` "Continuing to make requests while you are rate limited **may** result in the banning
  of your integration" — entry's "can end in a ban" keeps the possibility modal. Holds.
- change without notice / undisclosed reasons: `:148`-region text, found verbatim in both receipt
  and live.
- `x-ratelimit-reset` in UTC epoch seconds: header table `:134` and `:144`. Holds.
- three-step precedence (`retry-after` → `x-ratelimit-remaining` 0 → otherwise one minute) and "the
  same three-step order in S122": S122 `:47-51` is the same three bullets in the same order. Holds.

**S122 group (`:111-114`)** — holds. `:55-58`: "Receiving an HTTP redirection is not an error";
"301 … permanent … you should update your code to use this URL for future requests"; "302 or 307 …
temporary … you should not update your code to use this URL". The entry's "the new URL replaces the
stored one / the original stays" is a faithful rendering of *update your code*, and 307 is named by
the page (not imported from S107). `:45` "wait at least one second between each request" — the
entry's "at least one second" is the page's own bound.

**`(derived)` paragraph (`:41-52`)** — holds, and I checked it against the counter rather than
taking it on trust: `scripts/check-decision-table.mjs` (sha256 `d15f3bd7…f6832`, equal to
`frozenDigests`) has **no force/strength check** — the reason-code contract at `:33-58` lists
`t1..t4, r1..r4, g1..g3, q1, q2, n1, l1` and nothing that reads MUST/SHOULD/MAY — so "the admitting
counter treats both forms alike, so this marker and this sentence are the only place the
distinction is kept" is true. The marker discipline itself is also applied correctly: every
`(derived)` row (D7–D11) quotes a declarative sentence, and no row whose quote carries a capital
2119 keyword or a lower-case directive (D1, D2, D4, D5, D6, D12, D13) is marked derived.

**"Counting belongs to the counter" (`:150-152`)** — holds: `admitted`/`failing`/`population` are
the counter's fields (`result(out, true, true)`), and the entry states no row count of its own
anywhere in the prose (`grep -o '[0-9][0-9,.]*'` over the prose finds no row tally).

**Approval-table bullet (`:143-149`)** — holds against the file it names.
`corpus/knowledge/interaction-approval-table.md:59` C3 = "operator-asleep-blocked (durable:
operator-approval-required)"; `:62` C6 = the same; `:191` "Real third-party rate/ToS surface —
C6's deciding evidence is an absence". The three-item list of what the table adds is the one place
I considered a defect and did not press: the redirect stored-URL paragraph (`:111-114`) also changes
what a C3 journey record keeps, so "exactly three things" is arguably a fourth; I rate it a
boundary case rather than a defect because the three items are scoped to *rate disposition and
pacing*, and a reader who reads "those two rows" as C3/C6-rate will not be misled. Flagged for the
author's judgement, not counted in the verdict.

**Fetch provenance in the header (`:3-7`)** — holds. Four receipts exist for four declared pages;
`http_status` 200 on all four; S119/S120 live bytes are **sha256-identical** to the receipts
(`f633915d…fb207`, `f6d55d1b…76e58`), and S121/S122 live bytes differ only in the trailing
Next.js props line (normalised body text identical: 106523 B vs 106523 B, 96385 B vs 96385 B), which
is what `corpus/SOURCES.md:135` predicts ("raw bytes vary per response; normalised text identical").
The 180d/90d split and the "standards-track" label also hold: both RFCs report
`"status":"ps","proposed standard"` on their RFC Editor info pages and both have an **empty**
`"updated_by"` array, so neither has been updated or obsoleted by a later RFC.

## Notes (not counted as defects)

- `:71` "The redirect budget is five consecutive hops" flattens SHOULD to a flat bound, and
  collides with the document's own use of *budget* for an operator grant (`:146-147` "It supplies
  no budget"). D1 (`:48`) states the SHOULD correctly, so no row is misled; the word is the
  problem, not the number.
- `:99-100` "a 403 alone does not identify a rate signal" is a correct inference but is not on the
  cited page (the page never says 403 has non-rate meanings). The `(derived)` convention is scoped
  to Decision cells at `:41`, so prose is not obliged to carry it — noted, not a defect.
- The known wave-1 counter holes (quote repetition across rows, non-threshold numbers inside a
  quote, proxy/CA env satisfying `--live`) are frozen and out of scope for this seat; nothing in
  the prose depends on them.

## Commands run (with exit codes)

All lane work in one scratch clone, `porcelain` empty at start:

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # 0
$ git -C "$S/clone" checkout -q 486048356f0712e4396588c9dab58cd419243120        # 0
$ git -C "$S/clone" rev-parse HEAD            -> 486048356f0712e4396588c9dab58cd419243120
$ git -C "$S/clone" status --porcelain        -> (empty)
$ sha256sum scripts/check-decision-table.mjs  -> d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832
                                                  (= frozenDigests, so the prose's counter claims are read at frozen bytes)
$ sed -n '30,75p' scripts/check-decision-table.mjs        # reason-code contract: no force check
$ sed -n '250,300p' scripts/check-decision-table.mjs      # t3 first-word verb, n1, l1
$ sed -n '370,430p' corpus/evidence/round-31/decision-table/bytes/S119.txt
$ sed -n '290,312p;132,166p' corpus/evidence/round-31/decision-table/bytes/S120.txt
$ grep -n -i 'ban|abuse|vary|region|exceeding|retry|concurrent|points|CPU' .../bytes/S121.html
$ sed -n '42,52p' .../bytes/S122.html ; sed -n '54,60p' .../bytes/S122.html   # redirect + pacing
$ diff rec-S121.txt live-S121.txt   -> exit 1 (only the Next.js props line differs)
$ diff rec-S122.txt live-S122.txt   -> exit 1 (same)
$ grep -n 'X-RateLimit-Limit|X-RateLimit-Remaining|X-RateLimit-Reset' corpus/knowledge/host-published-rate-limit-headers.md  # 27,28,29
$ grep -n 'x-ratelimit-limit' .../bytes/S121.html   -> 134
$ grep -n 'header names overlap|remaining and reset fields|stated number of retries|with a queue in between|429, 403 or robots disallow|no revision marker|exactly one action' corpus/knowledge/rate-signal-decision-table.md
$ sed -n '410,455p' corpus/knowledge/external-class-fixture-v2.md    # §5 four trip classes
$ grep -n 'C3|C6' corpus/knowledge/interaction-approval-table.md     # 59, 62, 191
$ sed -n '134p' corpus/SOURCES.md | awk -F'|' '{print $12}'  -> corpus/knowledge/rate-signal-decision-table.md (S120 used-by)
$ grep -c 'API Version' .../bytes/S121.html .../bytes/S122.html      -> 2, 2
$ grep -o 'dateModified|lastUpdated|<time' .../bytes/S12[12].html    -> 0 hits
```

No counter was re-run: this seat's item is the prose, and the C1/C2 measurements belong to the
measure seat. No build, lint or formatter was run. No tool was installed (nothing was needed).

## Fetch log (read-only HTTPS GET, `curl -q -sS --proto =https`)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| https://www.rfc-editor.org/rfc/rfc6585.txt | 2026-10-26T12:28:25Z | 200 | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 |
| https://www.rfc-editor.org/rfc/rfc9309.txt | 2026-10-26T12:28:25Z | 200 | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 |
| https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 2026-10-26T12:28:30Z | 200 | 337116 | 47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9 |
| https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-the-rest-api | 2026-10-26T12:28:30Z | 200 | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 |
| https://www.rfc-editor.org/info/rfc9309 → /info/rfc9309/ | 2026-10-26T12:29:33Z | 301 → 200 | 100 → 322426 | d44881fa803fafb292f5ff26cf31399976fbaeae6dab191c48d8da4946e37445 |
| https://www.rfc-editor.org/info/rfc6585 → /info/rfc6585/ | 2026-10-26T12:29:34Z | 301 → 200 | 100 → 171482 | cc0123160b49d4abce57f51a1d56c02745afc61d29dd20c0e51fc42bb5f5d968 |

The two S121/S122 sha256 differ from the receipts (`3a33f87b…`, `b15c1c0b…`) with the byte count
unchanged; the difference is the trailing Next.js props line only, and the normalised body text is
identical, so every prose claim I attribute to "live" is located in text that is byte-for-byte the
receipt's after normalisation. Fetched bytes are preserved under
`.ufo/waves/round-31/a2w1/CritEntryProse/live/`.
