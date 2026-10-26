# CritPackageStaleClaims — falsification of the two package entries C2 plans to admit

Seat: critic (attack seat; findings only, no repair, no patch produced).
Round 30 w1, milestone C2. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Live fetches: 2026-10-26T06:40:40Z – 06:41:04Z. Lane tip read-only: `061e62024c0523d3c6c7e819506a773ff2cd7d75`.
Output dir: `.ufo/waves/round-30/w1/CritPackageStaleClaims/` (fetched bytes, fetch logs, SHA256SUMS, quote-location JSON).

## Verdict

**r14 must not be admitted as written, and r16 must not be admitted as written; both are repairable in-place, neither needs rejecting.** r14's second-order claim about its own source is false and was false on the day it was written: the IETF archive serves `draft-ietf-httpapi-ratelimit-headers-10` (HTTP 200, 67 803 B) and `-11` (HTTP 200, 67 097 B) today, and datatracker lists `-11` as the Active Internet-Draft last updated 2026-05-23 — so the entry's `recheck: … -10 and later currently return 404` and staged S159's `-10 and later return 404` / `newest revision in the IETF archive` are unsupported. Every one of r14's substantive sentences, however, locates byte-identically in `-11`: §3's four quoted spans and the example header line all still exist (line drift only: §3 heading 301→302, example 322→323, §3.2 examples 409→417/413→421). One characterisation is not in the draft at all: "policy types such as burst, permin, perhr and daily" — the draft defines an *identifier for the policy* (`-11`:327) and no policy-name vocabulary or registry (the only registry is quota units, `-11`:§10.3), so those are example identifiers, not types. r16 is the sharper defect: its one quoted sentence locates verbatim (17 words), but the antecedent of "This means" is the emoji-route deviation, not the host's budget in general — the entry uses a route-scoped caveat as a blanket statement about `X-RateLimit-*` headers, and then draws the lane rule from it. r16 also understates the documented header set (7 headers are documented, the entry names 5, omitting `X-RateLimit-Global` and `X-RateLimit-Scope`, the latter being precisely the "scope" concept the entry claims to discover), and one inference ("the same route … for one caller and not another") is the wrong shape: the doc keys independence on the path's top-level resource, not on caller identity. Neither entry carries committed fetch bytes anywhere in the package — `/home/vgpnk/Projects/shokuknow/merge/tabi/` holds only `SOURCES.append.md`, `MERGE-REPORT.*` and 86 `knowledge/*.md` files, no evidence directory — so the entries' "fetched 2026-10-23" is unbacked provenance; the round's own receipt requirement is the fix, and my bytes below can seed it but a second seat must refetch for C2's `--live` leg.

## Evidence: fetches (all read-only HTTPS GET, no credentials, no cookies)

Commands and exit codes:

```
$ for r in 09 10 11 12; do curl -sS --max-time 40 -o draft-$r.txt -w '%{http_code}' \
    https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-$r.txt; done   # exit 0
$ curl -sS --max-time 40 -H 'User-Agent: Mozilla/5.0 …' -o discord-rate-limits.html \
    https://docs.discord.com/developers/topics/rate-limits                                # exit 0
$ curl -sS --max-time 40 -H 'User-Agent: Mozilla/5.0' -o dt-doc.html \
    https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/               # exit 0
$ sha256sum *                                                                             # exit 0
```

| UTC | URL | HTTP | bytes | sha256 |
|---|---|---|---|---|
| 06:40:40Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-09.txt | **200** | 67 876 | `e088940d98218985c88a0693d71e9d979cc4b4aff58a353b558b1cf5d58173ee` |
| 06:40:40Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-10.txt | **200** | 67 803 | `f40a241153d69329e2cbfee86cb39512d42007a2355769b35b1ce68cd16b7aa5` |
| 06:40:40Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | **200** | 67 097 | `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` |
| 06:40:40Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-12.txt | 404 | 77 297 (error page) | `db9919c05eddf8565b54deab5c54e4a49e4ad835ad075652f27d83e5faa6c898` |
| 06:40:40Z | https://docs.discord.com/developers/topics/rate-limits | **200** | 408 912 | `a70be7bb615777e5a6fea4ca51f4480dab4e1f8a13fde307baa80797b2b3b0d0` |
| 06:41:04Z | https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/ | **200** | 114 084 | `e819780c335964a9d605a4dae264a34c7179f70bf9cfb439438779f216637469` |

Datatracker text (normalised): `Versions: 00 01 02 03 04 05 06 07 08 09 10 11` … `Document Type Active Internet-Draft ( httpapi WG )` … `Last updated 2026-05-23` … `Intended RFC status (None)`. No "Replaced by", no "Expired" string on the page. Title line: `draft-ietf-httpapi-ratelimit-headers-11 - RateLimit header fields for HTTP`.

Revision self-description: `-09` = `Expires: 19 September 2025` / running head `March 2025` (expired before the entry's own fetch date); `-10` = `Expires: 31 March 2026` / `September 2025`; `-11` = `Expires: 24 November 2026` / `May 2026`.

## Claim table — `host-rate-limit-signal-classes-r14.md` (staged S159)

Quote-location method: whitespace-normalised substring search of the fetched bytes (`quote-check.json`, `proposed-quotes.json` in the output dir). Supported = located in the *newest* revision (`-11`).

| # | entry clause (verbatim) | verdict | located text (rev:line) |
|---|---|---|---|
| A | `source: S159 — …ratelimit-headers-09.txt — §3 "RateLimit-Policy Field" (line 301) and the examples at lines 322 and 409` | **supported for `-09` only** | `-09`:301 `3.  RateLimit-Policy Field`; `-09`:322 the burst/daily line; `-09`:409 `RateLimit-Policy: "default";q=100;w=10`. All three line numbers are exact for `-09`. |
| B | `recheck: 180d — the draft revision moves; -10 and later currently return 404 (not run in this round)` | **unsupported / false** | `-10` 200 (67 803 B), `-11` 200 (67 097 B); only `-12` is 404. `-10` is dated September 2025 and `-11` May 2026 — both predate the entry's own 2026-10-23 fetch, so the archive could not have "started" serving them later: the assertion was false when written, and the parenthetical admits it was not run. |
| C | staged/anchor twin: `draft-09 (newest revision in the IETF archive; -10 and later return 404)` | **unsupported / false** | datatracker: latest is `-11`, last updated 2026-05-23. |
| D | `The draft defines a RateLimit-Policy response header field as a structured list of quota-policy items` | **supported** (entry drops the draft's `non-empty`) | `-11`:304 `The "RateLimit-Policy" response header field is a non-empty List[SF] of Quota Policy Items (Section 3.1).` |
| E | `the policy field "SHOULD remain consistent over a sequence of HTTP responses"` | **supported** | `-11`:308 `The field value SHOULD remain consistent over a sequence of HTTP responses.` |
| F | `while the other field "contains information that MAY change on every request"` | **supported** | `-11`:310 `RateLimit (Section 4) field that contains information that MAY change on every request.` |
| G | `The policy field "enables clients to control their own flow of requests based on policy information provided by the server"` | **supported** | `-11`:311 `The "RateLimit-Policy" field enables clients to control their own flow of requests based on policy information provided by the server.` |
| H | `where throttling is highly dynamic, the per-request field is the one to use` | **supported** (paraphrase) | `-11`:313 `Situations where throttling constraints are highly dynamic are better served using the RateLimit field (Section 4) …` |
| I | `An example names the policy types and windows a server can publish: RateLimit-Policy: "burst";q=100;w=60,"daily";q=1000;w=86400` | **changed** — the example line is byte-identical, the word *types* is not in the draft | `-11`:323 the example line verbatim. But `-11`:327 `A quota policy Item contains an identifier for the policy` and §3.1 defines only `q`, `qu`, `w`, `pk` plus `Other parameters are allowed`; the only IANA registry the draft creates is §10.3 "RateLimit quota unit registry". `burst`/`daily` (and `permin`/`perhr` at `-11`:421) are example identifiers, not a defined type vocabulary. |
| J | lane-internal sentences (`Why this matters`, class list 429 / 1015 / 403) | out of scope for source falsification; no support defect found in the draft | — |
| K | recheck horizon `180d` | **adequate but wrong rationale** | `-11` expires 2026-11-24 and the doc's own Changes appendix has no `Since …-09` or `Since …-10` bullet (`-11`:1839 starts at `Since draft-ietf-httpapi-ratelimit-headers-08`), so the recheck cannot lean on the changelog — it must diff bytes. `-09` has been expired since 2025-09-19. |

Net for r14: **0 substantive sentences are falsified; 2 provenance sentences (B, C) are false; 1 characterisation (I) is over-strong.** The entry is admissible after re-grounding on `-11` and correcting B/C/I.

## Claim table — `host-rate-limit-header-set-r16.md` (staged S182)

| # | entry clause (verbatim) | verdict | located text (discord doc, normalised) |
|---|---|---|---|
| A | `source: S182 — https://docs.discord.com/developers/topics/rate-limits — §"Rate Limits" (the header table and the per-guild exception)` | **changed (attribution)** | `Rate Limits` is the page H1, not a section; the page's own contents nav lists `Header Format`, `Exceeding A Rate Limit`, `Global Rate Limit`, `Invalid Request Limit aka Cloudflare bans`. The header descriptions sit under `Header Format`; the per-guild sentence sits in the unlabelled intro paragraph that follows `Global rate limits apply to the total number of requests a bot or user makes, independent of any per-route limits.` Nothing on the page is a table — the headers are a `<ul>` of seven items. |
| B | `adds a second real host's set …: X-RateLimit-Limit: 5, X-RateLimit-Remaining, X-RateLimit-Reset (epoch seconds), X-RateLimit-Reset-After (a delta) and X-RateLimit-Bucket (the bucket identity)` | **changed (incomplete: 5 of 7)** | The documented set also contains `X-RateLimit-Global` — `Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit` (16 words) — and `X-RateLimit-Scope` — `Returned only on HTTP 429 responses. Value can be user (per bot or user limit)` (15 words), full clause: `… user (per bot or user limit), global (per bot or user global limit), or shared (per resource limit)`. Omitting `-Scope` is material: the entry's headline claim is about *scope*. |
| C | `X-RateLimit-Limit: 5` | **supported** | example block: `X-RateLimit-Limit: 5` / `X-RateLimit-Remaining: 0` / `X-RateLimit-Reset: 1470173023` / `X-RateLimit-Reset-After: 1` / `X-RateLimit-Bucket: abcd1234`. |
| D | `X-RateLimit-Reset (epoch seconds)` | **supported** | `Epoch time (seconds since 00:00:00 UTC on January 1, 1970) at which the rate limit resets` (16 words). |
| E | `X-RateLimit-Reset-After (a delta)` | **supported with gloss** | `Total time (in seconds) of when the current rate limit bucket will reset` (13 words) + `Can have decimals to match previous millisecond ratelimit precision`. It is a duration until reset, not a difference of two timestamps; "delta" is defensible but should say *seconds remaining*. |
| F | `X-RateLimit-Bucket (the bucket identity)` | **supported** | `A unique string denoting the rate limit being encountered` (9 words), `(non-inclusive of top-level resources in the path)`. |
| G | quote: `This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.` | **located verbatim (17 words) — but context changed** | Antecedent, contiguous: `Routes for controlling emojis do not follow the normal rate limit conventions. These routes are specifically limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s.` The caveat is scoped to emoji-control routes, not to the five/seven headers. |
| H | `The row also carries the host's own caveat about its budget` / `the host states plainly that its own budget headers can be inaccurate` | **unsupported as generalised** | Only the emoji sentence licenses inaccuracy. What the doc does say about the header set is weaker and different in kind: `For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request.` (19 words) — i.e. the headers are *optional*, not inaccurate. The lane's rule is supported by "optional", not by the emoji caveat. |
| I | `it notes that some routes are limited per guild` | **supported** | `These routes are specifically limited on a per-guild basis to prevent abuse.` (12 words). |
| J | `so the same route can be throttled for one caller and not another` | **changed (wrong axis)** | The doc's independence statement is resource-keyed, not caller-keyed: `an endpoint with two different top-level resources may calculate limits independently` (11 words), with `Top-level resources are currently limited to channels ( channel_id ), guilds ( guild_id ), and webhooks ( webhook_id or webhook_id + webhook_token )`. Caller identity appears only through global limits (`Global rate limits apply to the total number of requests a bot or user makes, independent of any per-route limits.`, 20 words) and through `X-RateLimit-Scope` values `user`/`global`/`shared`. |
| K | `the first case the lane has seen where the rate-limit scope is not the origin` | lane-internal, but **weakened by the omission in B**: the host publishes scope as a header field, so "first case" should be stated as "first host in the lane that names scope in a header" — which requires citing `X-RateLimit-Scope`. | — |
| L | `recheck: 90d (vendor documentation pages change without a version marker)` | **sound**; verified there is no version marker on the page | — |

Net for r16: **5 of 12 clauses are exact; 3 need correction (B, J, H/G scoping); 1 attribution fix (A).** Nothing here is unfetchable — the same URL answers 200 today.

## Staged-row table (package `SOURCES.append.md`, read-only)

| row | field | current text (abridged) | verdict |
|---|---|---|---|
| S159 | anchor quote/summary | `draft-09 (newest revision in the IETF archive; -10 and later return 404)` | **false** — `-10` and `-11` return 200 today and were published 2025-09 / 2026-05. Must be replaced before the row can carry a 2026-10-26 receipt. |
| S159 | anchor summary | `policy types such as burst, permin, perhr and daily` | **over-strong** — example identifiers, no type vocabulary; `permin`/`perhr` are at `-09`:413 / `-11`:421, not at the cited line 409. |
| S159 | line references | `§3 … (line 301) and the examples at lines 322 and 409` | **exact for `-09`**; becomes `302` / `323` / `417` on `-11`. |
| S182 | anchor quote/summary | `§"Rate Limits" (the header table and the per-guild exception)` | **imprecise** — H1 title, not a section; descriptions are under `Header Format`, per-guild sentence is in the intro paragraph; bullet list, not a table. |
| S182 | summary | `A host discloses its budget in X-RateLimit-Limit / -Remaining / -Reset / -Reset-After / -Bucket, and some routes are limited per guild so "you may encounter 429s"` | **incomplete + mis-scoped** — 7 documented headers (`-Global`, `-Scope` omitted); the 429 clause belongs to the emoji-route exception. |
| both | provenance | `fetched 2026-10-23` | **unbacked** — no evidence/receipt tree exists in `/home/vgpnk/Projects/shokuknow/merge/tabi/` (89 files: 86 knowledge entries + `SOURCES.append.md` + `MERGE-REPORT.json`/`.md`). Nothing to digest-check against. |

## Impacted axes and predicate elements (C2)

- **coverage** — C2's `admitted = 2` cannot be reached by the package-as-is control (J2 must keep failing). Correct outcome is: both entries admitted *after* correction, still 2/2, and the J2 control stays a true negative because it copies the uncorrected entries.
- **freshness** — r14's `-09` is an expired revision (expired 2025-09-19) and its "newest" claim is false; a 2026-10-26 `opened` date on an entry whose anchor says the newest revision is `-09` would be a fresh date over stale provenance. r16's page is current but its quote is scoped wrongly.
- **calibration** — the two known defect classes this falsification hits are: (a) *negative fetch claims asserted instead of run* (B/C: "return 404", with `(not run in this round)` on the same line — the parenthetical should have blocked the assertion), and (b) *quote located but antecedent dropped* (G/H). Both are checkable mechanically: a negative-claim guard that re-runs any `404`/`absent` assertion, and an antecedent window (the sentence before the quote) recorded with every quote.
- **operability** — not touched by this review; no lane script executed.

## Smallest safe correction (text only — I am an attack seat and did not edit)

r14 (replace the two provenance lines, soften one characterisation; body sentences stay):

```
source: S159 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt — §3 "RateLimit-Policy Field" (line 302) and the examples at lines 323 and 417 — draft-11 fetched 2026-10-26 (archive also serves -09 and -10; -12 is 404)
verified-at: 2026-10-26
recheck: 90d — newest is -11 (datatracker: Active Internet-Draft, last updated 2026-05-23; its Changes appendix has no -09/-10 bullet, so diff bytes rather than trust the changelog)
```

and in the body, `An example names the policy types and windows` → `An example names two policy identifiers and windows (the draft defines no policy-name vocabulary; §3.1 defines only "an identifier for the policy", and the sole registry is the quota-unit one in §10.3)`.

r16 (replace attribution, complete the set, re-scope the quote, fix the axis):

```
source: S182 — https://docs.discord.com/developers/topics/rate-limits — §"Header Format" (the seven-header list and its example block) plus the intro paragraph before it (per-route / per-guild limits) — fetched 2026-10-26
```

Body: name all seven headers, adding `X-RateLimit-Global` (429-only, global limit) and `X-RateLimit-Scope` (429-only; `user` / `global` / `shared`); keep the emoji-route sentence attached to the "quota … may be inaccurate" quote as its antecedent and stop calling it a caveat about the header set; support the lane rule with `For most API requests made, we return optional HTTP response headers …` instead; restate J as resource-keyed (`an endpoint with two different top-level resources may calculate limits independently`), not caller-keyed.

## Addendum — cross-check of the successor entry `rate-limit-policy-fields.md` (S116)

ScribeEntryRateLimitFields reported independent agreement on the same shas (`-09` e088940d…, `-10` f40a2411…, `-11` d6016dd0…), then disputed one line number: it placed the burst/daily example at raw lines 321-322. Verified against the identical sha with two methods — `grep -n 'RateLimit-Policy: "burst"' draft-11.txt` → `323:` (unique) and `awk 'NR>=318 && NR<=326'` (321 = `Section 3.1 of [SF].`, 322 blank, **323** = the example). 321-322 is the `-09`/`-10` numbering (both carry it at 322), i.e. a mixed-revision read. No citation of theirs depends on it, so nothing changes in my tables above.

Their draft is the entry that will actually be admitted, so I re-ran the admission quote rule over it mechanically (replicating `entryQuotes()` at `scripts/check-frontier-admission.mjs:155`: strip fenced blocks and inline code, then every `"…"`/`“…”` span of ≥4 words in the body = lines 16+):

- 21 double-quoted body spans of ≥4 words, **0 unlocated** in `draft-11.txt` (their own bytes, same sha as mine).
- head: exact `frontier: rate-tos-signal` line present; one `source:` line whose only `S\d{3,}` id is `S116`; `verified-at:` and `recheck:` present.
- The stale-404 sentence sits in the body inside backticks → stripped before extraction, so it cannot trip `q1-entry-quote`. It would trip it if double-quoted (that phrase is in no cited source; cf. self-test `entry-quote-in-code-span-ignored` at `:338`, exit 0 admitted 1).
- Hazard for the integrator: a head line beginning `source:` has every `S\d{3,}` in it treated as a required row (`:240-247`), so naming the package row `S159` on such a line would force `r1`/`r3`/`r4` against the package row and fail admission. Their "Adopted from" section is body text and does not do this.

Independent re-verification of their strongest new factual claims against `-11` (all supported): `-10`:479 `4.1.2.  Reset Parameter` with `-10`:481 "the number of seconds until additional quota … is made available" versus `-11`:507 `4.1.2.  Effective Window Parameter` — the `t`-semantics change is real, and `grep -n epoch draft-11.txt` returns nothing, so "no absolute reset member" holds; `§5.2` 503 example at `-11`:586; FAQ item 3 at `-11`:1631-1635; `§6.2` at `-11`:679-680.

One successor claim was initially unbacked and is now resolved in its favour. It read "the status memo forbids citing an Internet-Draft as reference material"; `grep -rn "Internet-Draft"` over the lane at tip (corpus, `AGENTS.md`, `SKILL.md`, `PROVINCE.md`, `MINT.md`) returns no hits, and neither `.ufo/waves/round-30/w1-spec.json` nor `w1-dispatch.json` contains it — so no *lane* memo says this. The scribe then reworded it to "the fetched document's own Status of This Memo", which the bytes do support: `-11`:41 `Status of This Memo`, `-11`:63-64 `It is inappropriate to use Internet-Drafts as reference material or to cite them other than as "work in progress."`. Caveat for the admitted text: that boilerplate is conditioned on "other than as work in progress", so an unqualified "forbids citing" overstates it, and the sentence is generic to every I-D — it says nothing about this draft's own authority. Their `-12` probe (06:47:39Z, HTTP 404, 77 297-byte error page, sha `db9919c0…`) reproduces my 06:40:40Z fetch byte-for-byte, so the archive-status basis for the newest-revision claim is now double-attested. Also note the datatracker page is dynamically rendered: their copy and mine are both 114 084 B but differ in sha (`00871dc8…` vs `e819780c…`), so it must stay out of any citation-bearing receipt — which their reworded entry now does.

## Limits of this review

- I did not run any lane script, counter, build or linter; C1 (`check-gate-mutants`) is out of scope for this seat.
- The entries' `verified-at: 2026-10-23` bytes are gone; I cannot say what the network served that day, only that the archive holds immutable `-10`/`-11` files dated before it.
- My Discord text is a normalised extraction of the server-rendered HTML (tags → spaces); the quote spans above were located in that normalised text, and the C2 receipt should record the raw HTML sha256 plus the same normalisation rule.
- A second, independent seat must refetch for C2's `--live` leg; my digests are in `.ufo/waves/round-30/w1/CritPackageStaleClaims/bytes/SHA256SUMS.txt`.
- No tools installed or upgraded.
