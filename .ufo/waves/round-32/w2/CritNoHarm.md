# CritNoHarm — no-harm review of b234a58920134424e0d104f137311ff54a16d26b vs 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6

Date: 2026-10-26. Seat: CritNoHarm (leaf, no dispatch, no lane edits). Attack surface: the wave-1 build
delta against the frozen claims — five axes asked to show *harm*, not to re-verify the claims.

## Verdict

**No axis is harmed; two low-severity depth imprecisions were introduced inside the new append-only text.**
Freshness holds: `corpus/SOURCES.md` gains exactly six lines and none of them rewrites S119, so the S123
supersession changes only the RFC's publication month (verified against fresh bytes I fetched myself: HTTP
200, 25,265 B, sha256 `f633915…` identical to the row) and admits no new number; rows D1–D13 of
`corpus/knowledge/rate-signal-decision-table.md` still admit 13/13 with 0 failing under the table's own
admission baseline, and the appended errata touches no table row. The strongest counterexample I could build
against the errata's key sentence ("the header … no gate reads") fails: `scripts/check-frontier-admission.mjs:244`
does read a `recheck:` head line, but only for entries carrying a `frontier:` tag line (`:193`, `:236`), and
the decision table carries none — so the sentence is true as scoped, not a false provenance claim.
Operability holds (gate registry 0 nonconformant at 22 gates, C1 self-test 27/27, C2 counter 0 mismatches,
sources/freshness/adjacency/decision-table gates all clean at REV). Adjacency holds (`PROVINCE.md` diff empty;
zero added `Playwright` mentions; kaidoku's Playwright-over-CDP forensic ground is untouched by a
chromedriver-BiDi transport; adjacency gate 10/10). Coverage/calibration hold: the C1 receipt binds two
distinct transcripts with distinct digests and a driver whose digest differs from the gate's, and the C2
corrections are append-only with zero deleted lines. The two defects are in the *new* prose: one admitted
row in `SKILL.md` reports its own witness as "pending" although the receipt records it, and one "byte truth"
quote in the matrix correction drops the fixture body's trailing newline.

| Axis | Verdict | Evidence |
|---|---|---|
| depth | **defect (low, ×2)** | `SKILL.md:2659` "(pending below)" vs receipt; `webdriver-bidi-capability-matrix.md:209` body without `\n` |
| freshness | holds | S119 row unchanged; D1–D13 13/13 admitted; RFC bytes re-verified; freshness gate clean |
| operability | holds | gate registry 0/22; C1 selftest 27/27; C2 0 mismatches; 4 other gates clean |
| adjacency | holds | `PROVINCE.md` unchanged; 0 added Playwright mentions; adjacency gate 10/10 |
| coverage / calibration | holds | C1 16/16 offline + distinct-count `ok:true`; C2 mismatches 0, 0 deletions; control receipts reproduce 18 = 3 m4 + 15 m1 |

## Evidence — commands and exit codes

All lane scripts ran in one clean shared clone: `git clone --shared …/tabi-shokunin $S/clone`,
`git -C "$S/clone" checkout -q --detach b234a589…`, `git status --porcelain` empty. `TMPDIR=$S/tmp`.

```
$ git diff --numstat 4181fffb… b234a58… | grep -v '\.ufo/waves/'
106 0 LOG.md ; 62 0 SCORECARD.md ; 135 0 SKILL.md ; 37 0 corpus/QUALITY.md ; 41 0 corpus/README.md
6 0 corpus/SOURCES.md ; 314 0 corpus/evidence/round-32/bidi/receipt.json ; 71 0 run1/transcript.jsonl
71 0 run2/transcript.jsonl ; 20 0 corpus/knowledge/rate-signal-decision-table.md
95 0 corpus/knowledge/webdriver-bidi-capability-matrix.md ; 192 0 corpus/knowledge/webdriver-bidi-runtime-round-32.md
136 0 corpus/lessons/round-32.md ; 317 0 scripts/bidi-loopback-round32.mjs          EXIT 0
$ git diff --stat 4181fffb… b234a58… -- PROVINCE.md AXES.md corpus/PROVINCE.md     EXIT 0, no output
```
Every non-wave file is additions only — no earlier byte in any lane document was edited. `AXES.md` is the
fleet file `/home/vgpnk/Projects/shokunin/AXES.md`, not a lane file (the lane cites it by that name).

```
$ node scripts/check-gate-registry.mjs --rev b234a58… --json     EXIT 0  (22 gates, 40 rows, nonconformant 0)
$ node scripts/check-bidi-runtime.mjs --selftest                EXIT 0  (BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27)
$ node scripts/check-bidi-runtime.mjs --rev b234a58… --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json
                                                                EXIT 0  (population 16, admitted 16, failing 0, live false)
$ node scripts/check-selfassessment.mjs --rev b234a58… --json    EXIT 0  (mismatches 0, counted 0)
$ node scripts/check-sources.mjs --root . --file corpus/SOURCES.md
                                                                EXIT 0  (verdict=clean rows=126 findings=0)
$ node scripts/check-decision-table.mjs --rev b234a58… --baseline 96a2d1a3… --entry corpus/knowledge/rate-signal-decision-table.md --json
                                                                EXIT 0  (population 13, admitted 13, failing 0)
$ node scripts/check-freshness.mjs --witness b234a58…           EXIT 0  (verdict=clean matched=34 unique=34)
$ node scripts/check-adjacency.mjs --at b234a58… --fleet /home/vgpnk/Projects/shokunin --json
                                                                EXIT 0  ({verdict: clean, rows 10, verified 10})
$ node .ufo/waves/round-32/measure/c1-distinct.mjs . corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json
                                                                EXIT 0  (ok true: 16 rows/16 distinct ids, 2 distinct transcript paths + digests,
                                                                        driverSha256 55dbef88… ≠ gate 2f25af5a…, driverNames [], imports only
                                                                        FIXTURE_SHA256, VIEWPORT, serveFixture)
$ git diff --numstat 4181fffb… b234a58… -- SKILL.md corpus/README.md SCORECARD.md LOG.md
                                                                    106 0 / 62 0 / 135 0 / 41 0  EXIT 0  (0 deleted lines)
```

Control receipts reproduce as declared: `.ufo/waves/round-32/baseline/c2-J1-do-nothing.json` → mismatches 18,
`Counter({'m1-selftest-tally': 15, 'm4-nudge-state': 3})`; `c1-J1-do-nothing.json` → population 0, admitted 0.
`judge` not used; no lane file, index or jj state touched. No tool was installed or upgraded.

### Freshness — the S123 errata changed no admitted decision-table row

My own read-only fetch, `curl -q -sS --proto =https https://www.rfc-editor.org/rfc/rfc9309.txt`:
`t0 2026-10-26T17:15:05Z`, HTTP 200, 25,265 B, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`
(byte-identical to S119's and S123's anchor), `t1 17:15:06Z`. Line 11 = `September 2022`; lines 554 and 559 are
the RFC 9110/9111 `June 2022` reference entries. Spans re-locate: 377-378 "SHOULD follow at least five
consecutive redirects", 405-406 "for example, 30 days", 419 "more than 24 hours", 425 "at least 500 kibibytes" —
so the errata's claim that S123 "admits no new number" holds.

Registry cadence cells (`awk -F'|'` over `corpus/SOURCES.md:133-140`): S119 `365d`, S120 `365d`, S123 `365d`,
S124 `90d`, S125 `on-release`, S126 `90d` — the errata's "read 365d" matches the registry, and the header's
`180d` (`rate-signal-decision-table.md:8`) stays as an explicitly superseded restatement (`:214-226`).

Counterexample tried and failed: the errata's "no gate reads" (`:221-222`). `scripts/check-frontier-admission.mjs:244`
does read a `recheck:` head line, but its population is gated on `frontier: <slug>` (`:193`, `:236`), which the
decision table does not carry; no other gate parses that line (`grep -rn recheck scripts/*.mjs`: only schema
wide-reads and the release-pins `recheck` *column*). Verdict: sentence true, no defect.

### Depth — two imprecisions inside the new prose

**D1 (low). `SKILL.md:2659`** — R7's cell ends "the `innerWidth` read itself is the driver run's to record
(pending below)". There is no "below" item: `grep -n 'pending below' SKILL.md` returns that line only, while the
same block's recipe step 9 (`SKILL.md:2698`) states `script.evaluate "window.innerWidth"` → 640 and both committed
runs record it — `receipt.json` `runs[0].observed`/`runs[1].observed` step `window.innerWidth` value `640`
(also the entry's R7 evidence cell, `webdriver-bidi-runtime-round-32.md:73`). An admitted row therefore reads as
unmeasured. Smallest append-only fix: one bullet in the existing block at `SKILL.md:2756` — "Correction —
supersedes the `(pending below)` clause at `SKILL.md:2659`: the receipt records `window.innerWidth` 640 in both
runs (`corpus/evidence/round-32/bidi/receipt.json`, `runs[].observed` step `window.innerWidth`), and recipe step 9
(`:2698`) states it; the row is not pending."

**D2 (low). `corpus/knowledge/webdriver-bidi-capability-matrix.md:209`** — the block's R12 cell says `getData`
"returns the fixture body `tabi-bidi-body-0123456789`". The served body is 26 bytes ending in `\n`:
`scripts/check-bidi-runtime.mjs:101` `DATA_TEXT = "tabi-bidi-body-0123456789\n"`, the entry states
"`tabi-bidi-body-0123456789` followed by a newline" (`webdriver-bidi-runtime-round-32.md:39`), and the receipt
records `getData /data.txt {"bytes": 26, "matches": true}`. A reader implementing "body equals this quote" from
the matrix alone compares a 25-byte prefix and fails the gate's own equality. Smallest append-only fix: one
sentence inside the same dated-correction block at `matrix:168+` — "R12's quoted body omits the trailing newline:
the fixture body is 26 B, `tabi-bidi-body-0123456789\n` (`scripts/check-bidi-runtime.mjs:101` `DATA_TEXT`; entry
`:39`); the quote at `:209` is that text without its final byte."

Nothing else in the delta makes an existing entry less actionable: no pre-existing instruction or gate recipe was
edited (all files are additions), and the new matrix block leaves `:10`, `:56` and every row's `no` byte in place
while pointing at the runtime entry.

### Adjacency — PROVINCE unchanged, no sibling ground absorbed

`git diff --stat 4181fffb… b234a58… -- PROVINCE.md` prints nothing. The only browser-automation ground a sibling
owns is kaidoku's Playwright-over-CDP forensic capture (`w1/ConnSiblings.md`, kaidoku `PROVINCE.md:137`,
`SKILL.md:188-192`): different protocol (chromedriver BiDi vs CDP attach), different tool (no Playwright), different
province (tabi's PROVINCE refuses forensics). `grep -c '^+.*[Pp]laywright'` over the whole non-wave diff = 0. The
new blocks reinforce the boundary instead of crossing it ("CDP remains the substrate the lane's shipped capture
recipe is built on", `matrix:224-226`). Adjacency gate clean, 10 rows verified against the real fleet dir.

### Operability — registry and self-tests

`check-gate-registry` derives the gate set from bytes and finds 22 gates / 40 rows / 0 nonconformant at REV; the
new gate's row is `SKILL.md:2626` (`bidi-runtime | gate | … | cases=27, passed=27`), matching my run. Note, not a
defect: `scripts/gate-mutants.json` (frozen round 30, two gates) does not cover `check-bidi-runtime.mjs`, so the
new gate's mutation evidence is w1's four admitted constructions (`lesson round-32` M2, QUALITY criterion 86,
`measure/c1-distinct.mjs` red/green) — an addition gap, never a weakened prior artifact. `check-sources`,
`check-freshness`, `check-adjacency` and the decision-table gate all exit 0 at REV; the C2 counter exits 0 with
`mismatches 0` and the four corrected documents show `0` deleted lines.

### Coverage / calibration — statements not contradicted

The prior statements that the round had to supersede are all superseded by append, not by silent edit:
`corpus/README.md:191` (`docs-held — spec map only; no BiDi session measured`, byte-kept, referenced by the new
block at `:707+`), `matrix:82-83` (`CDP remains the lane's measured evidence substrate`, amended at `:196`), and
`SCORECARD.md:1473/:1515/:1576` plus `LOG.md:2072` (nudge state, corrected at `SCORECARD.md:1605+` and `LOG.md:2170`).
The five-axis capability row (`SCORECARD.md:1663`) names an operation, not the gate (QUALITY 84), with
first-working round 32. Summary wording "loopback fixture only" (claims, `LOG.md`, `SKILL.md`) refers to the
fixture and does not contradict the entry's own perimeter disclosure (entry §1, background Google-host requests
from the browser): the lane already holds "loopback ≠ no-egress" (`corpus/README.md:16`, round 2), so no new
contradiction arises. Uncorrected "nudge inactive" statements remain only where the rule then derived inactive
(`SCORECARD.md:1382`, `:1456`; `lessons/round-26.md:9`, `round-27.md:12`) — correct at those rounds because the
round-25 capability entries were still inside their windows.

## Behaviour

No browser, chromedriver, network write, install, login or credential use. One read-only HTTPS GET (RFC 9309,
recorded above). `pgrep -fa 'chromedriver|chromium' | grep -i critnoharm` → exit 1 (no owned processes). Scratch
`/fast/scratch/hyaku/tabi-r32/CritNoHarm` deleted after receipts were copied here; outputs in this directory:
`registry.json`, `c1.json`, `c1st.out`, `c2.json`, `dt31.json`, `src.out`, `distinct.out`, `adj.json`,
`fresh.out`, `numstat.txt`, `fetch-receipt.txt`.
