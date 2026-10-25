# Crit05 — round-28 w1: C2 falsification (baseline)

Seat Crit05, leaf critic; no production changes. Scope: attack frozen C2's m1 paragraph-citation matcher with unrelated citations, a wrong script/tally, a later paragraph, and exact-line controls. Baseline is `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` per frozen claims. Report path `.ufo/waves/round-28/w1/Crit05.md` (relative to lane root).

## Axes and contract

C2 targets calibration: at tip, `LOG.md:221` must count as mismatch unless a correction cites that exact stale line. Frozen claim also requires red unrelated-citation case and positive exact-citation control. Impacted axis: calibration; defect is in supersession identity/citation binding, not tally measurement.

## Evidence and commands

1. **Baseline identity.** `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` returned `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`. `git -C ... status --porcelain` showed only untracked `.ufo/waves/round-28/`; no tracked modifications observed. Frozen claims read from `.ufo/waves/round-28/claims.json:12`.

2. **Prior independent report.** `corpus/lessons/round-27-verifier-spotcheck.md:15-16` records baseline 27 gate output `mismatches=0`, `clean=true`, with `LOG.md:221` (claimed 8, observed 12) incorrectly `superseded=true`; it attributes this to a later paragraph that does not cite the stale line. Lines 46-47 route both supersession-citation and S106 revision-binding defects to next round. This is prior committed evidence, not my result.

3. **Live gate at baseline.** From lane root, `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` returned a finding for LOG.md line 221 with `script=scripts/check-freshness.mjs`, `claimed=8`, `observed=12`, `superseded=true`; `mismatches=1` overall because unrelated finding SCORECARD.md:197 is stale. Thus observed false-clear persists in the finding despite the overall nonzero count. The same JSON records LOG lines 335, 391, 1090, 1103, 1664 superseded (not all are the target). Command is the C2 counting command with frozen baseline revision.

4. **Selftest baseline.** `node scripts/check-selfassessment.mjs --selftest --json` returned `cases=17`, `passed=17`, `ok=true`. Source `scripts/check-selfassessment.mjs:443-597` shows no C2 adversarial cases: current LOG tests include stale, corrected, wrong-number, ambiguous-association, but no unrelated-citation case. The 17/17 is a live observation; source review is a finding about test inventory.

5. **Counterexample under isolated git fixtures.** I built scratch harness `.ufo/waves/round-28/scratch/Crit05/falsify-c2.mjs`, creating each fixture as an OS-temp git repo and invoking production gate as `node scripts/check-selfassessment.mjs --repo <fixture> --rev <fixture HEAD> --json`. Result: exact citation positive passed (superseded); wrong-script, wrong-tally, no-citation, plain-later-claim, and earlier-paragraph controls all remained mismatches. But unrelated citation `:999` incorrectly superseded stale line 6; a date/time colon token (`05:13:11Z`) also incorrectly superseded it. These two are direct false-clear counterexamples. The multi-script correction paragraph and a suffix path mention are currently accepted too; see below. Earlier-paragraph red result is relevant: it did not supersede.

6. **Real-document matcher simulation.** Scratch `sim-exact-line-fix.mjs` applies the production paragraph matching predicates to committed LOG.md at baseline and compares current `/:\\d+/` with exact citation identity (`citedLines.includes(f.line)`). Real stale finding at line 221: baseline matcher true, exact-line matcher false. Exact-rule simulation preserves supersession for lines 335, 391, 1090, 1103, 1664, since their recorded corrections cite those exact lines; it thus isolates the smallest proposed correction without fabricating lane outputs. Scratch `find-matching-paragraph.mjs` found the concrete paragraph that clears 221: lines 265-447 (183 lines), containing unrelated citation tokens `:16`, `:28`, `:18751`; another matching correction paragraph 1904-1925 cites 335/391/1090/1103/1863 and not 221. `grep -n ':\\s*221\\b' LOG.md` found only later discussion at lines 1931-1932, not a correction paragraph satisfying the matcher. These are observations from stated commands.

7. **Production logic.** `scripts/check-selfassessment.mjs:309-327` checks later paragraph, same script, correction marker, *any* `/:\\d+/`, and presence of oracle tally. It never compares the number after colon against `f.line`; broad `SCRIPT_IN_TEXT` also matches `.mjs.old`. Thus line-number identity is missing. Additional concern: merely tightening line equality leaves potential false clears from an unrelated colon token that happens numerically to equal `f.line`; citation syntax should be recognized as a citation to the target document/line, not any colon-number occurrence. The fixture simulation's unrelated `:999` is the strongest direct counterexample.

## Counterexample, impacted axis, smallest safe correction

**Counterexample:** baseline `LOG.md:221` stale freshness tally is cleared by 183-line paragraph 265-447, despite it not citing 221; isolated fixture proves unrelated `LOG.md:999` and timestamp `05:13:11` both clear the stale finding. Evidence above; confirmed prior by round-27 verifier spot-check at lines 15 and 46.

**Impacted axis:** calibration. This is a fixable matcher defect, not a tradeoff for the canonical judge: the frozen rule already demands exact stale-line citation and expressly bars weakening matching rules (`claims.json:12`).

**Smallest safe correction:** require an explicit `LOG.md:<line>` citation token within a later correction paragraph and compare captured line exactly to the stale finding's `f.line`; retain same-script, correction-marker, correct-oracle-tally, and later-paragraph checks. Add an unrelated `LOG.md:other-line` red fixture and retain exact-line green fixture. Consider a script-path boundary so `check-fixture.mjs.old` cannot name the target script. With exact citation rule simulated against real LOG, `LOG.md:221` remains stale; the other presently valid exact corrections remain superseded.

## Evidence limits

- The 10-case harness measures current baseline matcher on scratch fixture repos; it is not the lane's committed selftest or a proposed implementation test.
- Exact-line behavior on the production LOG is a local simulation of a narrowly defined predicate change, not an observed gate run after a code change; no production code changed.
- The raw baseline gate already reports mismatches=1 due to SCORECARD.md:197; therefore it does not independently establish C2's final tip target. The target-specific finding still establishes the false-clear.
- No tools installed or updated. No real-site or consequential action. Only report and scratch files written under authorized round-28 paths; no tracked lane files changed.
