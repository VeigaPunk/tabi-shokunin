# CritC2Axis — C2 admissibility attack (tabi round 31, wave w1)

**Verdict.** C2's admissibility **holds on all four questions**, with one medium axis-label risk, four low findings and one informational note. Correcting the nine stale tallies is a **calibration** move, not the §9 "quality work": the claim counts a real mismatch set (9 → 0) between the lane's written self-description and observed repo state, which is the calibration definition sentence at `AXES.md:15`, and the same mismatch-count shape is how the lane's admitted calibration claims landed at held score (`SCORECARD.md:1233`, `:1480`); the §9 anti-pattern sentence (`/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-31.md:458`) is scoped “never coverage or depth” and does not bar a calibration move. Extending the held m1 rule to `SKILL.md` / `corpus/README.md` is mechanically new inputs, but v2 also **changes the oracle** (per-case first `cases=` token → summary line) after round-30 M8, and the old oracle is shown able to fail (`m8-proof`: `cases=29 passed=28`, exit 3; v1 at the baseline falsely counts `SCORECARD.md:1527` as 12 vs 2) — so the round lands measurement discrimination plus a mismatch count, not a pure re-score. The four freeze-time corrections are **disclosed instrument fallout, not a disguised partial landing**: with them reverted, v2 at the same documents reads **13 = the nine + exactly those four**; with them, **9**. “Before 9” is honest line-by-line: at `96a2d1a3` the gates run 26 / 10 / 29 / 22 and the nine state 25 / 13 / 5 / 17 / 7 / 20 / 20 / 7 / 17 — all stale — while the tenth line (`SKILL.md:2545`, 22) is correct then. The risk the closure must record is the axis wording: `AXES.md:15`'s signal and prompt `:444`'s parenthetical name `SHONEN.md`/`SCORECARD.md`, the nine live in `SKILL.md`/`corpus/README.md`, and the lane's admitted calibration deltas were SCORECARD-bound while the LOG-window attempts failed (:1397) or landed unprovable (:1439).

Seat bounds observed: leaf, no dispatch, no lane edits, read-only git in the lane; one `--shared` clone at the freeze commit; `TMPDIR=/fast/scratch/hyaku/tabi-r31/CritC2Axis/tmp`; no network fetch; no tool install/upgrade.

---

## Q1 — Is correcting stale tallies in SKILL.md / README.md calibration, or quality work?

**Verdict: calibration — holds, with a medium axis-label risk (F1).**

- **The attack.** `AXES.md:15` defines the axis as “Self-assessment quality: gaps named honestly, confidence graded, overreach caught” but gives the signal as “**SHONEN.md/SCORECARD entries** match observed repo state”. Prompt `:444` says “A calibration claim must count mismatches between the lane's self-assessment **(SCORECARD/SHONEN)** and observed repo state.” All nine counted lines are outside those two files; the claim's delta therefore sits outside the literal signal.
- **The defence.** The definition sentence, not the signal column, is the definition: a gate-registry row that states a self-test tally is the lane's confidence claim about its own instrument, and a tally that disagrees with the gate's own summary is exactly “gaps named honestly / overreach caught”. The claim counts mismatches, which is the §9 calibration form (“It cannot be an assertion”); the predicate is the instrument's whole `mismatches` field, which includes the SCORECARD window (my freeze run counts nine, none in SCORECARD — the window is evaluated, just clean).
- **Precedent, both directions.** Admitted calibration claims with recorded corrections land their delta on SCORECARD lines: round 24 C2 “5 → 0” over `SCORECARD.md:410`, `:1138`, `:1139`, `:1151` (`SCORECARD.md:1233`), round 29 C2 “6 → 0” (`SCORECARD.md:1480`). The one attempt to extend the m1 window outside SCORECARD (LOG.md, round 27) failed on the instrument (`SCORECARD.md:1397`) and round 28 called the repaired matcher “unprovable” (`:1439`). So no *admitted* calibration delta has yet been outside SCORECARD; this round is the first to claim one.
- **Why it is still not “quality work” in the §9 sense.** The §9 phrase “quality work” is assigned to “re-scoring a rule … on new inputs” and “counting rows a sourceless fixture also counts”, with the explicit consequence “never coverage or depth”. C2 is neither a coverage nor a depth claim, and the number it produces is a mismatch count, which the prompt says a calibration claim must be.

**Severity: medium (axis-label, fixable by documentation, not by a counter change).** No claim-predicate defect.

## Q2 — Is extending a held rule to new documents “re-scoring a rule the lane already holds on new inputs”?

**Verdict: mechanically yes; not the §9 anti-pattern as charged — holds (with the window/oracle split disclosed).**

- The m1 rule (a document tally must equal the gate's own self-test) is held for `SCORECARD.md`/`LOG.md`; `SKILL.md` and `corpus/README.md` are new inputs. By the letter of prompt `:458`, applying a held rule to new inputs is quality work — but that sentence's predicate is “**never coverage or depth**”, and C2 is calibration. The sentence does not say “never any axis”.
- More importantly, v2 is **not only** a window extension: it replaces the oracle. Round-30 M8 showed the old reader took the first `cases=` token in per-case output. Evidence that the change is discriminating and able to fail: `baseline/m8-proof/old-oracle.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28`, **exit 3**, the regression case `v2-oracle-reads-summary-line-not-first-cases-token` FAIL; and my v1-counter run at the baseline tree returns **mismatches 1**, the single finding being `SCORECARD.md:1527` claimed 12 observed 2 — the M8 false positive that v2 clears. The fleet's round-38 calibration verdict treats measurement discrimination as the calibration move (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-38/mori.md:67`), and M8 is the routed defect this repairs.
- **Caveat the closure should record.** The window extension itself (+8 self-test cases, two new documents) is **operability**-shaped, not calibration credit. The calibration credit is the mismatch count (9 → 0); operability improves unclaimed and is not harmed. The SCORECARD row should name the oracle repair as the discriminating move and the window as the input set.
- **Residual.** If the canonical judge applies the anti-pattern across all axes rather than only coverage/depth, the claim type “counter window extension” would be misdeclared even though the measured quantity is mismatches. Smallest safe fix is wording (below), not a new run.

## Q3 — Are the four freeze-time corrections a disguised partial landing of the claim?

**Verdict: no — disclosed instrument fallout; holds.**

- `claims.json` §C2 `freezeTimeCorrections` names the four verbatim: `SCORECARD.md:1439`, `:1465`, `:1486`, `SKILL.md:2545`. The freeze diff is exactly `6/0 SCORECARD.md`, `19/0 SKILL.md` (numstat; the 19 include two new registry rows plus one correction paragraph), with `0` deletions and hunks at EOF; `SKILL.md` lines 1–2545 and all of `corpus/README.md` are byte-identical between `96a2d1a3` and `9505a10` (diff exit 0). Nothing else is corrected at freeze (non-`.ufo` diff: also `482/0 scripts/check-decision-table.mjs` new, `104/15 scripts/check-selfassessment.mjs` v2).
- **They were true at the round-30 tip.** The baseline v1 counter at `96a2d1a3` reads `mismatches 1` and that finding is `SCORECARD.md:1527` (M8), not any of the four; with v1's 22-case oracle, `:1465` (22/22), `:1486` (22), `SKILL.md:2545` (22) match, and `:1439`'s stale 17 is superseded by `:1465`'s 22/22 correction. They become mismatches only because v2 measures `check-selfassessment` at 30.
- **The probe.** I reverted exactly the freeze additions (`git apply -R` of the freeze diff for the two documents), committed inside my clone (`a51d5f08049391ff6008ebca5d7e635860b33335`, clean tree), and ran the frozen v2 counter at that commit: **mismatches 13, exit 1**, counted = the nine + `SCORECARD.md:1439` (17/30), `:1465` (22/30), `:1486` (22/30), `SKILL.md:2545` (22/30). With the corrections, `mismatches 9`. So the four are exactly the oracle-induced churn, and the “before 9” is the pre-existing stale set.
- **Not disguised, not target-narrowing.** The field is in the frozen claims (disclosed), the frozen target stays `mismatches = 0`, and the kill rule measures `freeze → REV`, so the four are outside the measured delta either way. What they do is remove 4 of the round's 13 corrections from the claim's path (13 total, 9 claimed + 4 freeze). **Disclosure obligation:** the SCORECARD C2 row / lesson should say “9 pre-existing stale tallies corrected; 4 further statements corrected at freeze as v2-oracle fallout (13 across the round)” so “9” is not read as the round's total.

## Q4 — Is “before 9” honest: were all nine stale at the baseline against the then-current tallies?

**Verdict: yes — verified line-by-line; one low provenance defect (F2).**

Baseline gate self-tests at `96a2d1a3` (run from a baseline checkout; `--self-test` is the declared flag for `check-sources`, `--selftest` for the others):

| Line (identical at both revs) | Script | Stated | Baseline tally | Freeze tally | Stale at baseline? |
|---|---|---|---|---|---|
| `SKILL.md:1614` | check-sources | 25 | **26** (`SOURCES_SELFTEST … cases=26`, exit 0) | 26 | yes |
| `SKILL.md:2479` | check-selfassessment | 13 | **22** (`cases=22 passed=22`, exit 0) | 30 | yes |
| `SKILL.md:2514` | check-s106-evidence | 5 | **10** (`cases=10 passed=10`, exit 0) | 10 | yes |
| `SKILL.md:2515` | check-selfassessment | 17 | **22** | 30 | yes |
| `SKILL.md:2529` | check-s106-evidence | 7 | **10** | 10 | yes |
| `SKILL.md:2530` | check-selfassessment | 20 | **22** | 30 | yes |
| `SKILL.md:2543` | check-release-pins | 20 | **29** (`cases=29 passed=29`, exit 0) | 29 | yes |
| `SKILL.md:2544` | check-s106-evidence | 7 | **10** | 10 | yes |
| `corpus/README.md:613` | check-selfassessment | 17 | **22** | 30 | yes |
| `SKILL.md:2545` (control, not in the nine) | check-selfassessment | 22 | **22** | 30 | **no** — correct at the tip |

- The frozen v2 counter at the freeze revision reproduces the declared before: `node scripts/check-selfassessment.mjs --rev 9505a10… --json` → **exit 1, mismatches 9**, counted exactly the nine above (also `findings 174`, `superseded 20`, `couldNotEvaluate 103`, `clean false`).
- The claim's parenthetical is accurate in both revisions: at the baseline the selfassessment oracle was 22, at the freeze tree it is 30; the nine are stale under both.
- **F2 (low, provenance):** `baseline/c2-J1-do-nothing.json` carries `.rev = befe2a3f96f451e1fe797c3cab5f4c8dcf670f99`, which is **not an object in the lane** (`git cat-file -t` → exit 128, “could not get object info”). The value is reproducible at `9505a10` (my run, same counted set), so the count is honest; the receipt's rev field points at a deleted scratch commit. The closure/lesson should cite `9505a10` (the README already gives the T0 tree relation) or regenerate the receipt at the freeze commit.
- **F4 (low, disclosure):** “mismatches 9” is what the counter counts, not “exactly nine stale statements exist”. The same reading has 103 unreadable findings, 27 of them m1 (`24` ambiguous script association + `3` scripts outside the runnable set); 9 of the 27 are in the claimed surface (6 `SKILL.md`, 3 `corpus/README.md`; `SKILL.md:2579` is created by the freeze correction paragraph's own “22-case” line). I read those nine: they name scripts outside the runnable set or state historic/quoted counts, not present-tense gate tallies (ExecC2Oracle inspected the full set to the same effect), but the SCORECARD row should state the CNE residual so “0” is not read as “all statements verified”.

---

## Findings by severity

| # | Sev. | Finding | Evidence |
|---|---|---|---|
| F1 | **medium** | Axis-label: the nine live in `SKILL.md`/`corpus/README.md`; `AXES.md:15`'s signal and prompt `:444` name `SHONEN.md`/`SCORECARD.md`, and no admitted calibration delta has yet been outside SCORECARD (`SCORECARD.md:1233`, `:1480`; LOG attempt failed at `:1397`, unprovable at `:1439`). The definition sentence and the mismatch count support calibration; the wording does not. | c2-J1 counted list; AXES.md:15; prompt:444; SCORECARD lines above |
| F2 | low | `baseline/c2-J1-do-nothing.json` `.rev` is an unreachable scratch commit; value reproducible at `9505a10`. | `git cat-file -t befe2a3…` exit 128; my `--rev 9505a10` run = 9 |
| F3 | low | Residual C1→C2 coupling: C1's new `SKILL.md`/`corpus/README.md` rows are read by C2's window. At freeze the new decision-table row is a match (`SKILL.md:2575`, claimed 34, observed 34, not superseded); a C1 row carrying a wrong tally shape would make C2's after-target fail at the integrated REV. | freeze-run finding at `SKILL.md:2575`; claims.json separability/coupling |
| F4 | low | “mismatches 0” ≠ all statements verified: 103 CNE at the freeze reading, 27 m1 (one, `SKILL.md:2579`, created by the freeze correction paragraph itself). State the CNE residual in the SCORECARD row/lesson. | v2-at-freeze.json; CNE reason breakdown |
| F5 | low | `baseline/README-receipts.md` says the m8 proof fails “28/30, exit 3”; the committed receipt and my diff show `cases=29 passed=28` (old oracle lacks `v2-readme-no-section-fallback`). Corroborates RevFreeze; curate the row. | `m8-proof/old-oracle-selftest.txt`; diff old-oracle vs v2 |
| F6 | info | Round total corrections are 13 (9 claimed + 4 freeze), not 9; freeze diff is +6/+19 with 0 deletions. Not a partial landing of the target, but the SCORECARD row should say 13. | probe 13; numstat 6/0, 19/0 |

**Fixable defect vs tradeoff the judge must reject.** F1 is a fixable documentation defect, not a tradeoff: the measured quantity is a mismatch count and the definition sentence supports the axis; only the signal column is narrower. If the canonical judge reads `AXES.md:15` as exhaustive and refuses the surface, the round should *not* re-run anything — it should record the claim as calibration-on-self-description with the precedent, or (worse) re-label the nine as quality/freshness, which contradicts the freshness definition (external surfaces, not the lane's own instrument). F2–F5 are curation/disclosure; none falsifies the predicate.

## Smallest safe correction

1. In the round-31 SCORECARD C2 row and `corpus/lessons/round-31.md`, one sentence: *“Calibration surface this round: the lane's gate self-description (`SKILL.md` registry rows, `corpus/README.md` frontier rows), counted by the same mismatch rule the counter applies to `SCORECARD.md`/`LOG.md`; precedent: the LOG-window extension (rounds 26–29) and the doc-bound corrections (round 29 C2). The oracle repair (M8) is the discriminating move; the window is the input set.”* This closes F1/F3's wording without touching the frozen counter or predicate.
2. State the residual in the same row: *“mismatches 0 at REV; `couldNotEvaluate` remains 103 (27 m1: 24 ambiguous association, 3 outside the runnable gate set) — 0 means no counted mismatch, not that every stated tally is verified.”* This closes F4.
3. Cite `9505a10` (not `befe2a3`) in the baseline receipt's rev/README, or regenerate `c2-J1` at the freeze commit. This closes F2.
4. Curate F5's “28/30” → “`cases=29 passed=28`, exit 3”; no claim bytes change.

No repair was performed by this seat.

## Commands and exit codes (full log in `receipts/commands.txt`)

```
$ git -C "$S/clone" checkout -q 9505a10…                           # 0
$ git -C "$S/clone" status --porcelain | wc -l                     # 0
$ git show 9505a10:scripts/check-selfassessment.mjs | sha256sum    # 143d66ff…db2fce (0)
$ node scripts/check-selfassessment.mjs --rev 9505a10… --json      # 1; mismatches 9
$ git checkout -q 96a2d1a3…                                        # 0
$ node scripts/check-sources.mjs --selftest                        # 2 (bad_arguments, wrong flag)
$ node scripts/check-sources.mjs --self-test                       # 0; SOURCES_SELFTEST … cases=26
$ node scripts/check-s106-evidence.mjs --selftest                  # 0; cases=10 passed=10
$ node scripts/check-release-pins.mjs --selftest                   # 0; cases=29 passed=29
$ node scripts/check-selfassessment.mjs --selftest                 # 0; cases=22 passed=22
$ node scripts/check-selfassessment.mjs --rev 96a2d1a3… --json     # 1; mismatches 1 (SCORECARD:1527 12/2)
$ node scripts/check-selfassessment.mjs --selftest   (at freeze)   # 0; cases=30 passed=30
$ git apply -R freeze-additions.patch && git commit -qam probe     # 0; HEAD a51d5f0…, porcelain 0
$ node scripts/check-selfassessment.mjs --rev a51d5f0… --json      # 1; mismatches 13 (nine + four)
$ git cat-file -t befe2a3f96f451e1fe797c3cab5f4c8dcf670f99         # 128 (no object)
$ git diff --numstat 96a2d1a3 9505a10 -- SKILL.md corpus/README.md SCORECARD.md LOG.md
                                                                   # 6/0 SCORECARD; 19/0 SKILL; README/LOG 0/0
$ diff <(git show 96a2d1a3:SKILL.md|sed -n '1,2545p') \
       <(git show 9505a10:SKILL.md|sed -n '1,2545p')               # 0 (cited lines byte-identical)
$ diff <(git show 96a2d1a3:corpus/README.md) \
       <(git show 9505a10:corpus/README.md)                        # 0
$ git diff --numstat 96a2d1a3 9505a10 -- . ':!.ufo'                # 6/0, 19/0, 482/0, 104/15
```

## Receipts

`receipts/`: `v2-at-freeze.json` (before, 9), `v1-at-baseline.json` (v1, 1 = SCORECARD:1527), `v2-nocorr.json` (probe without freeze corrections, 13), `base-check-{sources,s106-evidence,release-pins,selfassessment}.txt` (baseline tallies), `freeze-selftest.txt` (30/30), `baseline-lines.txt` (the ten lines at `96a2d1a3`), `freeze-additions.patch`, `commands.txt`.

## Environment

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` read-only (no tracked edit, index or jj state touched); one `git clone --shared` at `9505a10` under `S=/fast/scratch/hyaku/tabi-r31/CritC2Axis` (removed after receipts were copied); `TMPDIR=$S/tmp` explicit; probe commits only inside the clone with `-c user.name=CritC2Axis -c user.email=CritC2Axis@scratch.local`; toplevel verified; no network; no tool installs/upgrades; no subagent dispatch.
