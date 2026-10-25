# Round 27 — Wave 2 final record draft

## Scope and provenance

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; measured tip in wave-1 reports `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`. This is a synthesis of the landed round-27 record and wave-1 reports, not an independent re-run of gates. Verdict slots needing L1 confirmation remain `[FILL]`. No tracked file was edited by this report author; no tool installed.

## Claims and dispositions

| Claim | Axis | Measurement / disposition |
|---|---|---|
| C1 calibration | baseline extended assessment `4ad4c77`: 6 mismatches (5 LOG-window findings + live-tree m3); selftest 13→17. Apparent tip zero rejected: supersession matcher clears actual `LOG.md:221` without citing that line; m3 reads live status, not pinned revision. **Failed frozen fit; do not repair counter after data.** Evidence: `claims.json`, `measure-c1-fd722a7.json`, `w1/CritC1Supersession.md`, `w1/ExecC1Attacks.md`. |
| C2 depth | corrected gate at `5ed6484`: `valid=true`, selftest 5/5; absent receipt now Refusal/CNE exit 2. **Met after correction.** Wave-1 notes the original recorded measurement is at `5577d1b`, and no tip-revision counter receipt is evidenced; its tip derivation is partly inference. `[FILL: L1 verdict / whether tip remeasurement was executed]`. |
| C3 coverage | Entry citing S107 count 0→1 at `6ca3b89`; census exit 0 and row count 106→107. **Met on the named counter.** Wave-1 reports the counter and census both admit a junk entry at the registered path, so content discrimination relies on reviewer judgment; tip `ground:` overstates novelty against existing measured redirect ground. `[FILL: L1 final disposition after worktree correction/landing status]`. |

## Landed commit sequence

Per `w1/ExecC2Reopen.md` §7, recorded sequence: `fd722a7` C1; `5577d1b` C2 gate introduced; `6ca3b89` C3; `ef7a274`, `024d60c`, `5a0178c` registry/documentation rows and verdict wording; `8e07f0b` measurement receipts; `336d5d1` lesson/QUALITY/SCORECARD; then gate repair `5198e28` and fixture repair `5ed6484`. The requested registry/evidence commits are listed above; the later two are relevant C2 corrections. `[FILL: L1 canonical commit interpretation]`.

## Wave ledger

W1 registry is `.ufo/waves/round-27/w1/swarm-registry.json`; its declared roster is 32 seats. SCORECARD's recorded role mix: 3 scout, 9 executor, 5 scribe, 2 simplifier, 4 reviewer, 3 critic, 2 mutation-tester, 2 connector, 1 sentinel, 1 revenger. W1 report-file count/dead-seat settlement: `[FILL: exact count and command]`.

W2: 36 seats, mix per SCORECARD: 13 executor, 4 scribe, 1 simplifier, 3 mutation-tester, 2 reviewer, 5 critic, 4 scout, 2 sentinel, 2 connector. Report settlement/dead-seat count: `[FILL: exact count and command]`.

## Census

Recorded by the lesson and census receipts: before exit 0, 106 rows; after C3 exit 0, 107 rows. Exact source command in claim record is `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l` (0 baseline, 1 at C3). Registry row count command recorded by wave-1: `git show <REV>:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` (106 baseline, 107 after). `[FILL: L1 confirm both census receipt statuses]`.

## Mistakes and corrections

1. M1: staged C3 entry conflated 307 and 308 method-preservation normative wording; fresh RFC distinguishes the 307 MUST-NOT, with 308 preservation represented as inference. Correction landed in entry.
2. M2: scratch mirror used `grep -n` output rather than a valid registry row, making an apparent pass vacuous; corrected mirrors inserted actual row text and reproduced the expected findings.
3. M3: original S106 gate classified absent receipt invalid/exit 1 instead of CNE/exit 2; corrected by Refusal branch and fifth selftest.
4. M4: novelty framing erased existing loopback redirect ground; wave-1 found R3/L1b measured evidence. Corrected framing described extension, but wave-1 C3 attack reports the tip still had a false `ground:` sentence and README overstatement; worktree correction/landing status is `[FILL]`.
5. C1 falsification: apparent zero invalid because the supersession matcher clears LOG.md:221 without citing it; baseline count is 6 and live-tree m3 is not revision-pinned. Frozen claim fails; counter not repaired after data.
6. C3 mechanical controls: the `source: S107` counter and lane census are junk-blind when a junk file is placed at the registered path; quote normalization is underspecified for wrapped/table text. These are report findings, not a claim that the actual entry is junk.

## SHONEN boxes (verbatim)

`SHONEN.md` verbatim:

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources
  `SKILL.md` §Approval table (`:697`), §Evidence ladder, §Runbook, `:1598-1617` kaika decision rows; prior `[x]` named lane-dispatched TABI-B4/TABI-R3-4 — not non-author (orchestrator ruling, kaika round 1)
- [~] At least one end-to-end domain task executed and logged in LOG.md
  `corpus/knowledge/multi-step-journey.md` §1–§2, §7 (4-page loopback journey, 2 cold runs byte-identical); logged in `LOG.md` round-3 entry
- [~] Instructions executable by an agent without oral context
  `corpus/knowledge/executor-test-sufficiency.md` §0, §4 (verdict SUFFICIENT; the executor was a lane-dispatched seat)
- [~] No cross-domain bleed (PROVINCE.md still accurate)
  `PROVINCE.md:3-19`; refusal routes revenger/kaidoku/kake/kagi held (`corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt`)

## Wave-2 finding / final verdict slots

C1: `[FILL: L1 verdict]`  C2: `[FILL: L1 verdict]`  C3: `[FILL: L1 verdict]`.

Out of scope: no tracked edits, gate/build/lint/formatter runs, fleet/sibling lane access, or further external fetches by this report author. Findings and source reports: `.ufo/waves/round-27/w1/`; wave-2 final report path: `.ufo/waves/round-27/w2/ScribeFinalReport.md`.
