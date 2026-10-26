# ConnFrontier — round 31 a2w1: L2 cross-file consistency of the landing at 4860483

Seat: ConnFrontier-3 (connector, leaf). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scope: entry ↔ README round-31 row ↔ SOURCES rows S119–S122 ↔ lesson Gate ↔ SKILL.md round-31
registry rows ↔ claims.json, plus recurrence of the rounds 27–30 drift patterns (frontier-label
drift, used-by reciprocity, quote attribution, recheck cadence). Read-only; no lane file touched.
Evidence receipts in this seat's output dir `.ufo/waves/round-31/a2w1/ConnFrontier/`; scratch under
`/fast/scratch/hyaku/tabi-r31/ConnFrontier-3` (no clone was needed — every check ran against
committed blobs in the lane checkout via read-only git/grep; no lane scripts executed, no network
fetches, no tools installed).

## Verdict

The landing is cross-file **consistent on every counted identifier**: the row count is 13 in all
three places it appears, S120's prose-only role is stated identically in the entry, README and
lesson, all four receipt sha256s match the committed bytes files and the byte counts/fetch
timestamps match the lesson's Gate table and the SOURCES anchors, the S121 "raw vs receipt" hash
pair is an explicitly documented distinction rather than a contradiction, the frozen counter
digests at REV equal `claims.json.frozenDigests`, and the measured C1/C2 receipts match the claims'
targets with an added-only numstat. I found **one true defect**: the entry's header recheck line
says `180d` for S119/S120 while the registry rows it cites and the lesson's own status section both
say `365d` — a cadence drift no wave-1 seat flagged, recurring the round-30 recheck-drift pattern.
Two minor items ride with it: the new README calibration frontier row cites "QUALITY criteria
80–81" though criterion 80 is the decision-table rule, not calibration; and the lesson's wave
pointer still names `w2`, which was abandoned unspawned (the falsify wave is this one, `a2w1`).
The rounds 27–30 frontier-label drift pattern recurs at REV in exactly the three places round-31
lesson M9 records as not landed (still drifted, already routed — no new instances introduced by
this landing).

## Discrepancy table

| # | Surfaces | Field | Value A | Value B | Severity | Verdict |
|---|---|---|---|---|---|---|
| 1 | `corpus/knowledge/rate-signal-decision-table.md:8` vs `corpus/SOURCES.md:133-134` and `corpus/lessons/round-31.md:60` | recheck cadence for S119/S120 | entry header: "recheck: 180d for S119 and S120 (standards-track RFC text, which changes by errata only…)" | registry recheck column: `365d` (both rows); lesson status section: "New rows only (S119–S122, recheck `365d` for the RFCs, `90d` for the GitHub pages)"; S121/S122 agree everywhere at `90d` | **defect — minor** | The entry contradicts the registry it cites and the lesson's record of the same round on the same fact. No lane instrument reads the entry's recheck line (the registry column is operative, and it is internally consistent with the lesson), so nothing counted is wrong; but a reader re-deriving cadence from the entry gets 180d. Origin: the w1 prose draft carried 180d (`.ufo/waves/round-31/w1/ScribeEntryProse/entry-prose.md:8`); the landed registry rows were written at 365d and the entry prose kept the draft number. Pattern: recurrence of recheck-cadence drift — round 30 already logged one ("S116 `recheck` changed 180d → 2026-11-24", `w1/ScribeLessonMistakes/mistakes.md:224`). No w1 report flagged it (grep of `w1/**` for `180d` hits only the drafts and that round-30 note). |
| 2 | `corpus/README.md:686` vs `corpus/QUALITY.md:457-486` | pointer span on the new calibration frontier row | row "Self-assessment calibration" … pointer cell: "`scripts/check-selfassessment.mjs` (v2, round 31); QUALITY criteria 80–81" | criterion 80 (`QUALITY.md:457`) is the C1 decision-table row-admission rule ("A decision-table row counts only when its threshold is the source's own number…"); only criterion 81 (`:472`) is the calibration-oracle rule this row's text traces to | **defect — minor (pointer overreach)** | The span "80–81" attaches a decision-table criterion to a calibration row. Both criteria are round-31 additions and both are real; the row's own words ("gate tallies compared with each gate's own summary line; a gate whose summary spells its count otherwise (`cli_cases=`)…") rest solely on 81. The decision-table README row (`:676`) does not cite criterion 80 either, so 80 is pointed at only from the wrong row. |
| 3 | `corpus/lessons/round-31.md:5` vs `.ufo/waves/round-31/{w2,a2w1}/` | wave pointer | lesson header: "Waves: w1 build + first falsifiers (`.ufo/waves/round-31/w1/`), w2 falsify (`.ufo/waves/round-31/w2/`)" | `w2/` holds only `swarm-registry.json` (abandoned unspawned after the 2026-10-26 ~08:50 host crash); the falsify wave landed as `a2w1/` | **observation — info** | Process-level pointer only; no counted identifier affected. The lesson was written during w1, before the redispatch existed. A reader following the pointer finds an empty wave dir. |
| 4 | `corpus/README.md:37` vs `:644`/`:651`; `:216`; `:182`/`:646` | rounds 27–30 frontier drift recurrence | README:37 "(C2–C6) with gates, but the deciding evidence is still an absence" and :182/:651 canonical "C3 and C6"; :216 "rate/rights real-site records" vs canonical label "Rate/ToS surface for site-interaction records" (:182, :651); :182 and :646 cite "`knowledge/external-class-fixture-v2.md` §4–§5" where the 429-rule sentence lives at `:510` (§8) | unchanged at REV | **defect — minor, already routed (lesson M9, "not landed")** | The frontier-label / class-pointer / fixture-pointer drift pattern from rounds 27–30 recurs in the landing tree precisely as `corpus/lessons/round-31.md` M9 records; round 31's landing introduced no new drifted pointer (the entry's own fixture pointer "§5" is correct — the `probe-429` row carrying `Retry-After: 7` sits at `external-class-fixture-v2.md:419`, inside §5 at lines 410–453). Verified state at REV so the recurrence claim is current, not inherited from the round-30 report: of the four label-drift instances M9 cited, only `:216` still carries "rate/rights real-site records" (`:282-285`, `:302-305`, `:331-332` have since healed; `PROVINCE.md:10` now reads "rate/rights discipline"). |

No other label, count, id, date, sha256 or pointer differs between the surfaces in scope.

## Verified consistent (the "holds" evidence)

| Check | Surfaces | Evidence | Result |
|---|---|---|---|
| Row count 13 | entry table (`rate-signal-decision-table.md:49-61`, D1–D13) ↔ lesson `:30` ↔ README `:676` | `grep -c '^| D[0-9]' entry` = 13; lesson "Decision-table rows: 13 (D1–D13; five from S119, six from S121, two from S122)" matches the per-row Source cells (D1–D5 S119, D6–D11 S121, D12–D13 S122) | holds |
| S120 role | entry prose + Limits ↔ README `:676` ↔ lesson `:30` ↔ SOURCES `:134` used-by | "sources no row … specimen values" identical in all three documents; used-by names the entry (prose citation), reciprocated by the entry citing S120 in prose only | holds |
| Receipt ↔ bytes, all four | `corpus/evidence/round-31/decision-table/{S119,S120,S121,S122}.json` ↔ `bytes/*` ↔ lesson Gate table ↔ SOURCES anchors | `sha256sum` of the four bytes files = receipt sha256 values `f633915d…b207`, `f6d55d1b…6e58`, `3a33f87b…f755`, `b15c1c0b…a33e` (receipt copied: `ConnFrontier/sha256-verification.txt`); byte counts 25265 / 17164 / 337116 / 328088 match receipts, lesson and SOURCES | holds |
| S121 raw vs receipt sha | lesson Gate table `:20` ↔ SOURCES `:135` anchor parenthetical ↔ w1 receipts | lesson distinguishes "ScribeSourcesRows, raw sha256 `ae5e1812…4c18`" from "receipt FetchS121 08:36:16Z, 337,116 B, sha256 `3a33f87b…f755`"; SOURCES records the receipt hash with "(raw bytes vary per response; normalised text identical across same-day fetches, line numbers unchanged)"; the raw hash is anchored in `w1/ScribeSourcesRows/{rows.md,gate.md,newrows.txt,appended-rows.md}` | holds — documented distinction, not a contradiction |
| Fetched timestamps | receipts ↔ lesson Gate table ↔ SOURCES anchors ↔ ScribeSourcesRows `rows.md:15-18` | S119 08:36:13Z, S120 08:36:10Z, S121 08:36:16Z, S122 08:36:21Z; ScribeSourcesRows' own access time 08:36:21Z for all four, consistently labelled "accessed" vs "receipt" in the lesson | holds |
| Frozen counter digests | `scripts/` at REV ↔ `claims.json.frozenDigests` | `sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs` = `d15f3bd7…f6832` / `143d66ff…db2fce` — both equal the frozen values | holds |
| C1/C2 measure receipts | `.ufo/waves/round-31/measure/` ↔ claims targets | `c1-live-at-4860483.json` population 13, admitted 13, failing 0 (offline identical); freeze readings population 0; `c2-at-4860483.json` mismatches 0, couldNotEvaluate 103, superseded 29 (freeze: 9 / 103 / 20 — matches the claims' "before"); `c2-numstat-freeze-to-4860483.txt` = SCORECARD +4/−0, SKILL +22/−0, README +25/−0, LOG unchanged | holds |
| SCORECARD `:1523` correction content | SCORECARD tail ↔ `.ufo/waves/round-30/measure/` | cites `noharm-at-0ffc6ea.txt` line 130 (verified: `SELFASSESSMENT … mismatches=3`) and `noharm-at-d3cd62a.txt` line 1 (verified: `{"mismatches":1,…"doc":"SCORECARD.md","line":1527,"claimed":12,"observed":2}`); short revs `0ffc6ea0`/`d3cd62a1` match the files' full revs | holds |
| Freeze-time corrections location | `claims.json.freezeTimeCorrections` ↔ `9505a10` tree | `git show 9505a10:SCORECARD.md` already contains "## Round 31 — corrections" superseding `:1439/:1465/:1486`; the `:1523` correction is absent there and landed only at integration — exactly as claims and lesson M3 state | holds |
| QUALITY criteria | QUALITY ↔ lesson M4 ↔ README ↔ claims "QUALITY criteria 80–81" | 79 numbered criteria at `9505a10`, 81 at REV; criteria 80–81 landed under "Round 31 additions"; criterion 80 embeds the frozen C1 command verbatim (`--baseline 96a2d1a3… --live --json`); criterion 81's m8-proof receipt `baseline/m8-proof/old-oracle-selftest.txt` ends `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`, `exit=3` as cited | holds (except item #2's span) |
| Lesson script pointers | lesson M1/M4/M7/M10 ↔ `scripts/` | `check-selfassessment.mjs:172-179` summary-line oracle, `:122-127` `TALLY_PATTERNS`, `:167` env forward, `:422-425` SKILL/README windows; `check-decision-table.mjs:194` `curlFetch` (`curl -q … --proto =https --proto-redir =https -L`), `:360` `live-offhost-redirect` case — all at the cited lines | holds |
| Round-30 lesson reference | SKILL round-31 intro + lesson M1 ↔ `corpus/lessons/round-30.md` | `sed -n '344p' round-30.md` = the M8 row, so "(round-30 lesson M8)" is the right pointer | holds |
| Byte-level line anchors | SOURCES anchors + lesson spans ↔ bytes files | S119: 377-378 redirect quote, 384-385 "more than five", :392 400-499, :403 500-599, :406 30 days, :419 24 hours, :425 500 kibibytes; S120: :138 Retry-After MAY, :145 `Retry-After: 3600`, :165 MUST NOT cache; S121: :38 60/h, :41 5,000/h, :61 1,000/h, :66 100 concurrent, :67 900 points, :70 80/500 content, :143 403/429 remaining 0, :144 one-minute sentence; S122: :43 serial, :45 one second, :49 retry-after, :50 x-ratelimit-reset, :51 one-minute + exponential — all verified by `awk NR==…` against committed bytes | holds |
| Entry section cites ↔ page anchors | entry header ↔ S121/S122 HTML | `grep -o 'id="[a-z-]*"'`: S121 has `about-primary-rate-limits`, `about-secondary-rate-limits`, `checking-the-status-of-your-rate-limit`, `exceeding-the-rate-limit`; S122 has `avoid-concurrent-requests`, `pause-between-mutative-requests`, `handle-rate-limit-errors-appropriately`, `follow-redirects` | holds |
| Entry fixture pointer | entry Limits ↔ `external-class-fixture-v2.md` | `Retry-After: 7` 429 cell at line 419, inside §5 (header at :410); entry cites "§5" — correct (contrast item #4's §4–§5 drift, where the quoted sentence is at :510/§8) | holds |
| D6 one-minute quote attribution | entry D6 (S121) ↔ lesson selection note ↔ bytes | quote located in S121.html:144 and also S122.html:51 (same sentence, both pages); lesson records ScribeRowsGitHubPractice D2 dropped "kept once under S121" — attribution consistent, no double-count | holds |
| used-by reciprocity | SOURCES `:133-136` ↔ entry ↔ README `:676` | all four used-by cells name the entry; the entry cites all four; README Sources cell lists "S119 RFC 9309, S120 RFC 6585, S121/S122 GitHub REST docs; opened 2026-10-26; receipts `evidence/round-31/decision-table/`" | holds |
| SKILL registry tallies | SKILL `:2575-2576` ↔ lesson M4 ↔ C2 coupling note | decision-table row `(cases=34, passed=34)` and selfassessment-counter `(cases=30, passed=30)` — the only tally statements C1 added to a C2 window document, both oracle-true; claims.json separability note (cases=34) matches | holds |

## Commands run (key set) and exit codes

All commands ran in `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only). No command below
reported a non-zero exit unless noted; none wrote to the lane (the only writes were the receipts
copied into this seat's `.ufo` output dir and scratch under `/fast/scratch/hyaku/tabi-r31/ConnFrontier-3`).

```
grep -n "S119\|S120\|S121\|S122" corpus/SOURCES.md | head -40          # row locations :133-136
awk -F' \| ' '/^\| S11[9]|^\| S12[012] /{…}' corpus/SOURCES.md         # status/opened/recheck/used-by
sed -n '373,385p' corpus/evidence/round-31/decision-table/bytes/S119.txt
awk 'NR==377||NR==378 …' …/bytes/S119.txt                              # 377-378 quote verified
awk 'NR>=405&&NR<=407 || NR>=418&&NR<=420 || NR>=424&&NR<=426 …' S119.txt
awk 'NR>=137&&NR<=139 || NR>=144&&NR<=146 || NR>=164&&NR<=166 …' S120.txt
awk 'NR==38||NR==41||NR==61||NR==66||NR==67||NR==70||NR==143' S121.html
grep -n "at least one minute" S121.html                                # :144
awk 'NR>=43&&NR<=51{…}' S122.html                                      # :43,:45,:49,:50,:51 verified
grep -o 'id="[a-z-]*"' S121.html | sort -u                             # section ids
grep -o 'id="[a-z-]*"' S122.html | grep -E "avoid|pause|handle|follow"
sha256sum corpus/evidence/round-31/decision-table/bytes/* scripts/check-decision-table.mjs scripts/check-selfassessment.mjs
                                                                       # all 6 digests, copied to ConnFrontier/sha256-verification.txt
git log --stat 9505a10eb80b2a0b273ebaba3f7f872ad302192d..486048356f0712e4396588c9dab58cd419243120
git show 9505a10eb80b2a0b273ebaba3f7f872ad302192d:SCORECARD.md | grep -n "Round 31"   # 1 hit (freeze corrections)
git show 9505a10eb80b2a0b273ebaba3f7f872ad302192d:SKILL.md | grep -n "Round 31"        # 2 hits (section header+intro)
git show 9505a10…:corpus/QUALITY.md | grep -cE '^[0-9]+\. '                            # 79; at REV: 81
git diff 9505a10… 4860483… -- SCORECARD.md | head -30                  # +4 = :1523 disposition correction only
git diff 9505a10… 4860483… -- SKILL.md                                 # +22 = 2 gate rows + corrections block
sed -n '130p' .ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt        # mismatches=3
sed -n '1p'  .ufo/waves/round-30/measure/noharm-at-d3cd62a.txt         # mismatches=1, SCORECARD.md:1527 12v2
python3 -c "…json…" .ufo/waves/round-31/measure/c{1,2}-*.json          # readings table above
cat .ufo/waves/round-31/measure/c2-numstat-freeze-to-4860483.txt       # +4/+22/+25, 0 deleted
tail -4 .ufo/waves/round-31/baseline/m8-proof/old-oracle-selftest.txt  # cases=29 passed=28 exit=3
grep -n "live-offhost-redirect" scripts/check-decision-table.mjs       # :360
sed -n '172,179p;122,127p;167p;422,425p' scripts/check-selfassessment.mjs
sed -n '194,213p;355,365p' scripts/check-decision-table.mjs
sed -n '344p' corpus/lessons/round-30.md                               # M8 row — reference correct
grep -c '^| D[0-9]' corpus/knowledge/rate-signal-decision-table.md     # 13
grep -n "180d\|365d\|90d" corpus/knowledge/rate-signal-decision-table.md  # :8 = 180d (defect 1)
grep -n "365d\|recheck" corpus/lessons/round-31.md                     # :60 = 365d
grep -rn "180d" .ufo/waves/round-31/w1/**                              # only w1 drafts + round-30 note
grep -n "rate/rights real-site records\|C2–C6\|§4–§5" corpus/README.md PROVINCE.md
awk '/^## /{print NR": "$0}' corpus/knowledge/external-class-fixture-v2.md   # §5 at :410; 429 cell :419 inside §5
```

The one command that exited non-zero by design: `ls -la .ufo/waves/round-31/a2w1/ConnFrontier.md`
(exit 1 — no pre-existing report file; this report is the first write at that path).

## Notes for the L1

- Item 1 is the only finding that touches a *counted-adjacent* field: the registry recheck column is
  the value instruments and future rounds consume, and it is consistent — the drift is confined to
  the entry's prose header. An append-only erratum in the entry (or a round-32 correction) citing
  `rate-signal-decision-table.md:8` is the natural fix; this seat repairs nothing.
- Item 4 is verification that M9's recorded drift is *current* at REV — useful at closure so the
  "still open" enumeration does not silently drop it the way rounds 18/20/21/22 did in round 30.
- No tools were installed or upgraded (nothing was needed); no network fetches were made; no lane
  script was executed (all readings were taken from committed `measure/` receipts and blobs).
