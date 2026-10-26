# ScribeLogEntry — round 31 / a2w1 — LOG.md round-31 entry drafted, with its measurements traced

**Verdict.** The round-31 LOG entry is drafted at
`.ufo/waves/round-31/a2w1/ScribeLogEntry/log-entry.md` (111 lines, no trailing conversation) and is ready for the L1 to
append to `LOG.md` with one substitution: its two after-readings stand at
`486048356f0712e4396588c9dab58cd419243120` and its two counting commands carry `<MEASURED>`, which the L1 replaces with
its final measured revision. It records the claims and the axis frame, both counting commands with before → after
readings, the wave shapes (w1 32 seats, a2w1 32 seats as the attempt-2 redispatch of the abandoned attempt-1 w2), the
counter holes the w1 falsifiers disclosed, the routed defects handled and those carried, the frontier step, assimilation
none, the re-verification result, and the commit ledger with full hashes — and it asserts no closure verdict: C1's
row-by-row reading and the a2w1 attacks are the L1's to settle. Two properties of the draft were machine-checked rather
than assumed: it introduces **zero** self-test-tally shapes under the frozen C2 counter's own claim grammar, so appending
it cannot disturb the C2 document window it lands in; and every number it quotes is either a committed receipt field or
a count re-derived here and labelled as such.

## Deliverable and its audit artifacts

| File | What |
|---|---|
| `.ufo/waves/round-31/a2w1/ScribeLogEntry/log-entry.md` | the LOG.md text to append (append-only; nothing above a cited line moves) |
| `.ufo/waves/round-31/a2w1/ScribeLogEntry/scan-window.mjs` | line-level re-implementation of the frozen counter's claim grammar (`m1LogFindings`, `lineOnly=true`) |
| `.ufo/waves/round-31/a2w1/ScribeLogEntry/window-scan.txt` | its output on the draft: `lines=112 scanned=1 claims=0`, exit 0 |

## Evidence (commands and exit codes)

All git calls are read-only in the lane checkout; no lane file, index or jj state was written, no clone was needed (this
seat ran no lane script), no network fetch was made, no tool was installed or upgraded.

```
# A  the round's own commits between baseline and landed work
git log --format='%H %s' 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc..486048356f0712e4396588c9dab58cd419243120
  -> exit 0; two commits: 9505a10e… (freeze), 4860483… (landed work)
#    (lane HEAD is ae15a37…, the orchestrator salvage adding only .ufo/waves/round-31/ state
#     above 4860483; git status --porcelain lists 6 untracked a2w1 dispatch files, 0 modified)

# B  frozen counter bytes at the landed revision
git show 486048356f0712e4396588c9dab58cd419243120:scripts/check-decision-table.mjs | sha256sum
  d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832   -> exit 0 (= claims.json frozenDigests)
git show 486048356f0712e4396588c9dab58cd419243120:scripts/check-selfassessment.mjs | sha256sum
  143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce   -> exit 0 (= claims.json frozenDigests)

# C  zero deleted lines in the four C2 documents; zero scripts/ change
git diff --numstat 9505a10e… 4860483… -- SKILL.md corpus/README.md SCORECARD.md LOG.md
  4 0 SCORECARD.md / 22 0 SKILL.md / 25 0 corpus/README.md / (LOG.md absent)   -> exit 0
git diff --name-only 9505a10e… 4860483… -- scripts/ | wc -l
  0                                                                            -> exit 0

# D  registry row population (11 cells on each of the four new rows, verified by cell split)
git show 4860483:corpus/SOURCES.md | grep -c '^ \{0,3\}| S[0-9]'   -> 122, exit 0
git show 9505a10:corpus/SOURCES.md | grep -c '^ \{0,3\}| S[0-9]'   -> 118, exit 0
  S119/S120/S121/S122 each split to 11 cells

# E  the readings themselves (committed receipts, re-read field by field with node -e over require())
node -e 'const d=require("./.ufo/waves/round-31/measure/c1-live-at-4860483.json");
         console.log(d.population,d.admitted,d.failing,d.live,d.clean)'
  population 13, admitted 13, failing 0, live true, clean true                -> exit 0
c1-offline-at-4860483.json: population 13, admitted 13, failing 0 (live false)
c1-live-at-9505a10.json:    population 0, admitted 0, entryPresent false
c2-at-4860483.json: mismatches 0, superseded 29, couldNotEvaluate 103, counted []
c2-at-9505a10.json: mismatches 9, superseded 20, couldNotEvaluate 103, counted 9
measure/measured-provenance.txt: c1 live/offline and c2 exit=0 at 4860483; all exit=1 at 9505a10;
  porcelain=0 at both; scripts-diff-files=0

# F  the nine stale statements are superseded (not merely uncounted) at the landed revision
node -e '<look up each of the nine doc:line findings in c2-at-4860483.json>'
  SKILL.md:1614/2479/2514/2515/2529/2530/2543/2544, corpus/README.md:613 -> superseded true, claimed≠observed

# G  the draft is clean for the window it lands in
node scan-window.mjs log-entry.md    -> lines=112 scanned=1 claims=0, exit 0

# H  LOG.md carries no round-31 entry yet
grep -c '^## Round 31' LOG.md        -> 0, exit 1
```

## Two figures in the draft are derived here, not printed by a counter

- **51 statements compared and agreeing** = 183 findings − 29 superseded − 103 could-not-evaluate in
  `measure/c2-at-4860483.json`; the same arithmetic on the freeze receipt gives 174 − 20 − 103 − 9 mismatches = 42. The
  delta of nine is exactly the nine correction paragraphs the landed commit appended, which is the check that the zero
  is a compared zero rather than a silent one. The counter prints `mismatches`, `superseded` and `couldNotEvaluate`;
  it does not print `51`.
- **Row population 118 → 122** is a grep count on the committed `corpus/SOURCES.md` blobs (command D), not a gate
  reading. The round-start census receipt (`baseline/census-start.txt`) agrees at 118 for the freeze side.

## Findings

1. **A stale-word-numeral tally sits inside C2's own declared window and no counter can see it** (`SKILL.md:1559`,
   "eight isolated CLI cases" against the gate's own figure; `w1/CritC2Counter.md` FN-1). The draft does not repeat it,
   does not cite it as corrected, and does not claim the window is complete. Severity: medium, carried.
2. **The draft must stay tally-free to preserve the C2 reading.** `LOG.md` is scanned line by line by the same frozen
   counter that C2 measures, so a careless figure in this very entry would create a finding in the document the round is
   closing. The scan (command G) shows zero claims and one guard-matched line, which carries no digit after a tally
   token. Anyone editing the entry must keep one script per line and state only a gate's own figure. Severity: low for
   this draft, high for a future edit.
3. **S121 carries two legitimate digests.** The committed receipt binds `bytes/S121.html`
   (`sha256 3a33f87b…f755`, 337,116 B, 2026-10-26T08:36:16Z); the w1 live re-fetch 81 s later has raw
   `ae5e1812…4c18` with the identical normalised text (`w1/FetchS121.md`). The entry states both roles instead of
   presenting either digest as "the page". Not a defect; a conflation hazard for a later reader.
4. **No post-landing no-harm reading exists.** `measure/` holds only the two claim readings at `4860483`; the six
   no-harm checks were measured at the freeze tree only (`w1/ExecNoHarmBaseline.md`). The draft therefore makes no
   no-harm claim at the landed revision — the L1 must measure them at `<MEASURED>` before closure.
5. **`w2/` holds only `swarm-registry.json`.** No w2 seat artifact exists anywhere, which corroborates
   `w2.ready.dispatched` ("no seat was spawned"). The draft records the abandonment and does not describe w2 as a wave
   that ran.
6. **Draft-level judgement left open on purpose.** The draft does not say whether C1 is admitted. The frozen counter's
   target is met at `4860483` (admitted 13, failing 0, live) while the w1 falsifiers showed the counter admits a
   one-quote repetition and numbers that are not thresholds (`w1/CritC1Axis.md`, `w1/CritC1Counter.md`), and QUALITY 80
   now requires the row-by-row reading. That reading is a2w1's (`RowAttackD1D2` … `RowAttackD13`, `CritC1Verdict`) and
   the L1's; asserting it here would be the scribe upgrading a contract-only position into execution evidence.

## Out of scope / not done

No repair, no counter run by this seat (both counters were only re-hashed, never executed here), no edit to `LOG.md` or
any other lane file, no commit, no a2w1 verdict, no network fetch, no tool install or upgrade. The final measured
revision, the row-by-row C1 reading and every a2w1 finding stay with the L1.
