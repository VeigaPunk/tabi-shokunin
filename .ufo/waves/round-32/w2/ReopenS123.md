# ReopenS123 — independent re-open of registry row S123 (round-32 w2, falsify)

**Verdict: holds — no defect in any of the eleven cells, and no defect in the lesson Gate row for S123.**
I re-opened the source myself at 2026-10-26T17:05:18Z (HTTP 200, 25,265 B, sha256
`f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`) and it is byte-identical to both the
round-32 w1 seat's bytes and the round-31 receipt bytes, so the row is judged on exactly the bytes it names.
Every section heading and every numeric pinpoint in the `anchor` cell resolves to the claimed line
(21/21 assertions PASS, `FAIL_COUNT=0`); `teaches` is grounded span by span; `kind`/`tier`/`scope` are honest
(Standards Track RFC, tier scoped to the RFC's own text, no implementation claim); `recheck: 365d` is a valid
cadence and apt — the four RFC Editor errata, whose texts I located in the fetched bytes, touch RFC lines
149, 273-275, 412-413 and 508-510 and **none** of the spans S123 cites (373-385, 387-396, 398-408, 415-420,
422-425) or the header month at line 11; `used-by` names `corpus/knowledge/rate-signal-decision-table.md`,
which cites S123 at line 227 under `## Errata — round 32` (line 214). The Gate quote is verbatim at the lines it
names (`"Request for Comments: 9309"` at line 6, `"September 2022"` at line 11) and is 6 quoted words, 25 words
even if the whole cell body is counted, against the ≤25-word rule. Four non-defect observations follow the table.
Axes borne on: **coverage** (a registry row for crawl/robots decisions), **freshness** (byte stability and the
recheck cadence), **adjacency** (the used-by wire into the decision table). No axis harmed.

## What I attacked

`corpus/SOURCES.md:137` (row S123, `supersedes S119 —`) and `corpus/lessons/round-32.md:16` (the §Gate row),
at REV `b234a58920134424e0d104f137311ff54a16d26b`. The attack is a full cell re-derivation from my own fetch,
not a re-read of the seat's receipt: the seat's claim that the row is grounded is only accepted where my bytes
show the same thing.

## Fetch record (my own GETs; only www.rfc-editor.org)

| # | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| F1 | https://www.rfc-editor.org/rfc/rfc9309.txt (no redirect, `url_effective` identical) | 2026-10-26T17:05:18Z | 200 | 25,265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` |
| F2 | https://www.rfc-editor.org/info/rfc9309/ (reached through a same-host 301 from `/info/rfc9309`) | 2026-10-26T17:09:39Z | 200 | 322,426 | `d44881fa803fafb292f5ff26cf31399976fbaeae6dab191c48d8da4946e37445` |

F1 identity: `cmp` against `.ufo/waves/round-32/w1/ScribeS119/bytes/rfc9309.txt` → IDENTICAL;
`sha256sum corpus/evidence/round-31/decision-table/bytes/S119.txt` → `f633915d…b207` (same). Three GETs nine
hours apart (round-31 08:36:13Z, w1 16:02:28Z, mine 17:05:18Z) returned the same 25,265 B, so the row's
"byte-identical to the S119 receipt" and the Gate's "(byte-identical to the round-31 S119 receipt)" are true,
not merely asserted. F2 is corroboration only: its own metadata reads
`<dt class="font-bold mt-2">Date published</dt><dd>September 2022</dd>` and
`<meta property="article:modified_time" content="2022-09-09">`, i.e. the RFC Editor's date agrees with the
`.txt` header independently of the header.

## Cell verdicts (`corpus/SOURCES.md:137`, eleven columns)

| cell | value (abridged) | verdict | byte evidence in F1 |
|---|---|---|---|
| `id` | S123 | **holds** | unique: contract census `duplicate-ids=[]`; `rows=126` matches LOG.md's "registry 122 → 126" |
| `source` | Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.txt | **holds** | title matches line 14 `Robots Exclusion Protocol`; URL served 200 with no redirect |
| `kind` | spec | **holds** | line 7 `Category: Standards Track` — an IETF Standards Track RFC is `spec`, not `docs` |
| `tier` | A | **holds** | primary/authoritative for the scoped text; tier is scoped to `scope`, and `scope` is the RFC's own spans, not crawler behaviour (S005/S119 precedent) |
| `scope` | "The RFC's own publication month and the fetch-result spans a journey driver's robots.txt decisions rest on: redirect bound, unavailable and unreachable outcomes, cache lifetime and parse size" | **holds** | all five spans exist as claimed (below); "journey driver" is the lane's own construct, grounded in the citing entry (`rate-signal-decision-table.md:9,20,63`), and the entry's own `tier:` line says "documented upstream, not measured in this lane" — so no implementation claim rides on tier A |
| `anchor` | month + §2.3.1.2/§2.3.1.3/§2.3.1.4/§2.4/§2.5 line spans + pinpoints + re-fetch record | **holds** | 21/21 line assertions PASS (§ below) |
| `teaches` | `supersedes S119 —` the bytes say September 2022, June 2022 only at 554/559; every S119 span re-locates unchanged; moves the month and no threshold | **holds** | opens with the mandated `supersedes S0NN —` form (contract rule 2); `grep -n "September 2022"` → `[11]` only; `grep -n "June 2022"` → `[554, 559]` only, both inside `[RFC9110]` (552-555) and `[RFC9111]` (557-560); "no threshold" is guaranteed by sha equality with the S119 bytes |
| `status` | mined | **holds** | cited by ≥1 `used-by` path (below) |
| `opened` | 2026-10-26 | **holds** | ISO date; equals the Gate access date `2026-10-26T16:02:28Z` (UTC day) |
| `recheck` | 365d | **holds** | `check-sources.mjs:322` accepts `^[0-9]+d$`; `365d` used by S022/S025/S029; apt for frozen Standards Track text (errata probe below shows the cited spans carry none) |
| `used-by` | corpus/knowledge/rate-signal-decision-table.md | **holds** | file exists (census: no missing used-by path) and cites S123 at `:227`, inside `## Errata — round 32` at `:214` |

### Anchor resolution — every claimed line, checked against my bytes

```
PASS line 6    header: Request for Comments: 9309      PASS line 392  400-499
PASS line 11   header: September 2022                  PASS line 396  §2.3.1.3 last line ("on the server.")
PASS line 373  2.3.1.2.  Redirects                     PASS line 398  2.3.1.4.  "Unreachable" Status
PASS line 377  five consecutive redirects              PASS line 403  500-599
PASS line 385  §2.3.1.2 last line ("…assume that the robots.txt file is unavailable")   PASS line 406  30 days
PASS line 387  2.3.1.3.  "Unavailable" Status          PASS line 408  §2.3.1.4 last line ("a cached copy.")
PASS line 415  2.4.  Caching                           PASS line 420  §2.4 last line ("…robots.txt file is unreachable.")
PASS line 419  24 hours                                PASS line 422  2.5.  Limits
PASS line 425  500 kibibytes                           PASS line 554  DOI 10.17487/RFC9110, June 2022,
PASS line 7    Category: Standards Track               PASS line 559  DOI 10.17487/RFC9111, June 2022,
PASS line 14   Robots Exclusion Protocol               FAIL_COUNT=0
```

Sweeps: `June 2022 → [554, 559]`, `September 2022 → [11]`, `June → [554, 559]` (the file has no other June).
All month-year strings in the document: April 2020, January 2005, January 2008, June 2022 ×2, May 2017,
October 2017, September 2020, September 2022 — so "September 2022" is the RFC's own date and the only
occurrence is the header. F1 begins with a UTF-8 BOM on line 1 (`efbbbf 0a`); that does not shift numbering, so
"header line 11" holds whichever way the file is read (607 lines total).

## Lesson Gate row (`corpus/lessons/round-32.md:16`)

Cell body under test: `header lines 6-11: "Request for Comments: 9309" and "September 2022"; `June 2022`
occurs only at lines 554 and 559, inside the RFC 9110/9111 reference entries`.

| requirement | verdict |
|---|---|
| quote verbatim | **holds** — line 6 is exactly `Request for Comments: 9309` (repr-verified, column 1), line 11 is `September 2022`; both inside the stated 6-11 block |
| ≤25 words | **holds** — 6 quoted words; the entire cell body is 25 words, i.e. at the ceiling but inside the rule under the strictest reading |
| located where it says | **holds** — 6 and 11 for the fragments; the negative claim `June 2022 only at 554 and 559` is true, and both lines sit inside the `[RFC9110]`/`[RFC9111]` reference entries (552-555, 557-560) |
| grounds `teaches` | **holds** — the quote is precisely the month evidence plus the June-2022 demotion that `teaches` rests on; the five span claims are grounded by the row's `anchor` cell |
| access date / URL / sha / byte count | **holds** — `2026-10-26T16:02:28Z`, HTTP 200, 25,265 B, `f633915d…b207` all match `.ufo/waves/round-32/w1/ScribeS119/receipt.md`, and my own GET reproduces the sha |

The Gate row is also a *narrowing* of the seat's draft (`.ufo/waves/round-32/w1/ScribeS119/gate-line.md` said
`header block lines 6-11` and quoted the whole `DOI 10.17487/RFC9110, June 2022,` string); the landed cell keeps
the two facts and drops the long quote. No fact was lost.

## Supporting test — do RFC 9309 errata undercut the spans?

I extracted the four errata `orig_text` strings from F2 and located each in F1 (whitespace-flexible match):

| erratum | F1 lines | inside a cited span? |
|---|---|---|
| 7124 (Reported, Technical) "disallowed.gif … disallow.gif" | 508-510 | no (§5.2 example) |
| 7128 example path table | 273-275 | no (§2.2 example) |
| 7995 `path-pattern = "/" *UTF8-char-noctl` | 149 | no (§2.2.2 ABNF) |
| 8895 "Crawlers MUST try to parse each line…" | 412-413 | no (§2.3.1.5) |

So no erratum touches §2.3.1.2-§2.3.1.4, §2.4, §2.5 or the header: the row's `365d` guard and the citing entry's
"changes by erratum or a successor RFC" rationale are sound, and the row is not stale at the freeze.

## Observations (deliberately **not** reported as defects)

1. **Span wording narrowed without a note.** `teaches` says every S119 span "re-locates unchanged", while the
   `anchor` narrows S119's `(five consecutive redirects at 377-384)` to `(… at 377-378)`. Both are exact — 377-378
   is where the phrase sits, and the section span 373-385 still covers the MUST-follow consequence at 379-385 —
   and the bytes are identical, so no fact moves. Wording only; nothing to fix.
2. **Gate cell at the word ceiling.** 25 words if the framing is counted, 6 if only the quoted fragments are. The
   rule caps the quote, so this passes, but a one-word addition in this style would breach the strictest reading.
3. **`opened` records a seat's GET, not the row author's.** The Gate names the seat (`ScribeS119`) in the accessed
   cell and `SOURCES.md:3-5` establishes that convention ("opened … by the seat named in … §Gate"), so the cell is
   traceable and I reproduced the fetch. Consistent with S124-S126 and round 31.
4. **`used-by` does not list the lesson.** `corpus/lessons/round-32.md` names S123 twice (Gate `:16`, admission
   `:21`). This is the lane's current reading, stated in prose one round earlier: `corpus/lessons/round-31.md:10-11`
   fixes used-by to `corpus/knowledge/rate-signal-decision-table.md` for S119-S122 even though `round-31.md` names
   them 21 times, and `corpus/lessons/round-15.md:20` records the governing convention ("`used-by` stays
   lessons/knowledge paths under frozen v1") together with a logged old→new edit — so listing a lesson is a
   deliberate act for substantive use, not automatic. 123 of 126 rows list no lesson; the three that do
   (S028 → round-1, S029 → rounds 14/15, S094 → round 19) are cases where the lesson uses the row or records its
   rejection. The assignment's criterion — "used-by names files that cite S123" — is satisfied. If the L1 wants the
   contract's "or lessons" read literally, `used-by` is one of the three rule-2 editable cells, so the fix is a
   logged old→new edit on S123-S126 *together* (a single-row edit would make S123 asymmetric with the rows admitted
   beside it). I recommend leaving it.

## Commands run (all exit codes as printed)

```sh
# fetch (F1)
curl -q -sS --proto =https -o rfc9309.txt https://www.rfc-editor.org/rfc/rfc9309.txt   # EXIT=0  HTTP=200 BYTES=25265
sha256sum rfc9309.txt                                                                  # f633915d…b207
# identity
cmp w1/bytes/rfc9309.txt rfc9309.txt && echo IDENTICAL                                # IDENTICAL
sha256sum corpus/evidence/round-31/decision-table/bytes/S119.txt                       # f633915d…b207
# corroboration (F2)
curl -q -sS --proto =https -D - -o /dev/null https://www.rfc-editor.org/info/rfc9309   # HTTP/2 301 -> /info/rfc9309/
curl -q -sSL --proto =https -o rfc9309-info2.html https://www.rfc-editor.org/info/rfc9309/  # EXIT=0 HTTP=200 BYTES=322426
# cell checks
/usr/bin/python3 verify.py                                                             # EXIT=0 FAIL_COUNT=0
# structural gate + census in the clean clone at REV
/usr/bin/git clone --shared …/tabi-shokunin "$S/clone" && /usr/bin/git -C "$S/clone" checkout -q --detach b234a58
node scripts/check-sources.mjs   # 'SOURCES_GATE verdict=clean rows=126 … findings=0'  EXIT=0
# contract census: rows=126 malformed=0 dupes=[] enum=(none) missing-used-by=(none)
# bytes under judgement equal REV
diff -q corpus/SOURCES.md corpus/lessons/round-32.md corpus/knowledge/rate-signal-decision-table.md  (vs clone) ; echo ALL-SAME-AS-REV
```

The lane checkout is at `b234a58` with 9 untracked wave artifacts under `.ufo/waves/round-32/`
(`w2-spec.json`, `w2-dispatch.json`, ready markers, `w1-results.json`, `MutC2*`, `w2/`); no tracked file is
modified, and the three files I judge are byte-identical to my checkout of REV (`ALL-SAME-AS-REV`), so no
uncommitted byte influenced this review.

Honesty note: the errata **statuses** (beyond 7124 = `Reported`) are not resolved by my extraction; the claim I
make is only about which RFC lines each `orig_text` covers, which is what bears on the cited spans.

## Hygiene

- No browser: no chromium/chromedriver started, so nothing of mine to kill. `pgrep -fa 'chromedriver|chromium'`
  returned one line only — PID 1371 `/usr/bin/earlyoom … --prefer (…|chromium|…)`, an earlyoom argument string,
  not a browser.
- Scratch `$HYAKU_SCRATCH/tabi-r32/ReopenS123` (clone + fetch + receipts) deleted after copying receipts into
  `.ufo/waves/round-32/w2/ReopenS123/`.
- Wrote only: this report and `.ufo/waves/round-32/w2/ReopenS123/` (`fetch-receipts.md`, `cell-checks.txt`,
  `errata-probe.txt`, `registry-gate.txt`, `citation-and-gate.txt`). No lane tracked file, index, jj state, or
  sibling repo touched.
- No tools installed; nothing upgraded.
