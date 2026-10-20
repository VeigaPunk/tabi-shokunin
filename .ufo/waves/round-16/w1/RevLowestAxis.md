# RevLowestAxis — round-16 scoped review (author-side advice, not certification)

Seat: `TabiR16.RevLowestAxis-5` · lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Scope: only the scorecard facts in the assignment — lowest non-retired axes, saturation
line/window, stagnation-window position, and whether the nudge waives the lowest-axis rule
in round 16. No code, no gates, no counters, no browser. Nothing edited except this report.

## Verdict

The four propositions the round-16 plan relies on are **true as of the round-15 end state**,
with one precision fix and one genuine ambiguity:

1. Lowest non-retired axes = depth, operability, freshness, adjacency at **8**; coverage and
   calibration at **9**. Confirmed (`SCORECARD.md:671-676`, corroborated `:463`).
2. Saturation line **8**, stagnation window **N = 3**. Confirmed (`SCORECARD.md:430-433`,
   retained `:523`, `:588-589`, `:658-659`, `:729`).
3. Position after round13's capability: **round14 = position1** (`SCORECARD.md:658`; `LOG.md:817`),
   **round15 = position2** (`SCORECARD.md:729`), so **round16 = position3 = N**.
4. Whether the nudge waives the lowest-axis rule in round16: **the nudge's precondition is met at
   round16 under the lane's own position convention, so the lowest-axis obligation is waived for
   that round** — but round16 does not rely on it: C1 works operability (a lowest tie) anyway.
   Round16's own capability entry (C2) resets the window, so round17 is position1 if C2 holds.
   A strict reading of `SCORECARD.md:432` would instead place the waiver at round17; the record
   must state which convention it uses (see "Ambiguity" below). Under **either** reading round16
   is admissible, because the lowest-axis rule is independently satisfied.

No defect was found in the round-16 plan on these points. The plan nowhere claims a nudge waiver
(`grep -n "waiv\|nudge\|stagnation" .ufo/waves/round-16/PLAN.md` → no matches, exit 1), and it
correctly labels operability 8 a lowest non-retired tie (`PLAN.md:9`).

## Checked facts, with anchors

| # | Fact | Anchor (path:line) | Exact text / observed value |
|---|---|---|---|
| F1 | Current axis scalars | `SCORECARD.md:671-676` | depth `8→8`, coverage `9→9`, operability `8→8`, freshness `8→8`, calibration `9→9`, adjacency `8→8` (round-15 table; after = end state) |
| F2 | Lowest non-retired tie named | `SCORECARD.md:463` | "Lowest non-retired tied axes: depth, operability, freshness, adjacency (8)." (round-12 block; values unmoved since — F1) |
| F3 | No axis retired | `SCORECARD.md:129, :444, :523, :589, :659, :729` | training `:129` "retired: none"; kaika `:444` "retired: none"; round12 `:523` "retired: none"; round13 `:589` "No axis retired"; round14 `:659` "No axis retired"; round15 `:729` "no retirement" |
| F4 | Saturation declared | `SCORECARD.md:430-433` | "Saturation line **8**; stagnation window **N = 3** rounds. … at line 8 the nudge fires only after all six axes reach 8 and three consecutive rounds pass with no new capability row." |
| F5 | Saturation retained unchanged | `SCORECARD.md:523, :588, :658, :729` | "Saturation line8 and window3 retained" (r12) · "saturation line8 and window3 retained" (r13) · "saturation8/window3 unchanged" (r14) · "saturation8/window3" (r15) |
| F6 | Last capability entry | `SCORECARD.md:574` (table `:570-580`) | `aria-locator-template-loopback` … "First-working round" = `13` |
| F7 | Window restarted at round13 | `SCORECARD.md:588-589` | "the demonstrated capability restarts the stagnation window at round13. No axis retired or silently waived." |
| F8 | Round14 position | `SCORECARD.md:658-659`; `LOG.md:817-818` | "round14 is position1 since that round13 capability, not a restarted window"; LOG: "Round14 is stagnation-window position1 after round13's capability, not a restart." |
| F9 | Round15 position, no new capability | `SCORECARD.md:729`; `:728`; `:657` | "saturation8/window3; position2 after round13, no retirement or hidden waiver"; "capabilities unchanged; first-working aria capability stays round13" (r14 `:657`: "capabilities: unchanged") |
| F10 | Round16 claims | `PLAN.md:9`, `:15`, `:29` | C1 "operability 8 (lowest non-retired tie…)"; C2 "coverage 9 (lane axis) + capability `webmcp-cdp-observation`"; count `0→1` native-WebMCP held entries |
| F11 | Rule that the nudge waives | `AXES.md:33-34` | "At least one claim works the lane's **lowest-scoring non-retired axis**, except when the stagnation nudge (below) waives it." |
| F12 | Nudge definition | `AXES.md:66-73` | "When every axis the lane owns sits at or above the lane's saturation line and no capability has entered the table within the lane's stagnation window (both recorded in `SCORECARD.md`), the lowest-axis obligation is waived: the round should be a frontier/capability move…" |
| F13 | Capability rows need a demonstrated run | `AXES.md:62-64` | "Rows enter only through a round that demonstrates the capability running; a capability without a passing demonstration in the round report is pre-claiming and does not enter the table." |

Corroborating admitted baseline: `SCORECARD.md:405-406` (`user-20261015-r06` 8/8/7/8/8/8 →
`kaika-fleet-round-1` 8/9/8/8/9/8) and the kaika claim rows `:410-412` (operability 7→8,
coverage 8→9, calibration 8→9). Scalars have not moved since (F1), and the lane's own convention
that verdicts do not re-pin numbers is stated at `SCORECARD.md:8-11` ("no round after 3 re-pinned a
numeric score … the axes table's score column keeps each axis's **last explicitly measured** value").

## Predicates read from stale in-file text — do not use as current

Three places in `SCORECARD.md` contradict the live state if read without their supersession notes:

- `SCORECARD.md:140` — "**Current primary axis: freshness**, unique lowest last-measured score 3."
  Historical (2026-10-15 interactive-continuation block). Superseded by the round-12 block's
  "This block supersedes their current-state interpretation, not their bytes" (`:460-462`) and by
  F1/F2. Freshness is currently 8, tied-lowest, not 3.
- `SCORECARD.md:93-100` — the training-era axes table (depth 7, coverage 5, operability 5,
  freshness 3, calibration 6, adjacency 5). Historical; superseded by the kaika row (`:405-406`)
  and rounds 12-15.
- `SCORECARD.md:391` — "The lane's saturation line + stagnation window N are to be declared by the
  lane on its next round … not asserted by this conformance change." That deferral was discharged
  at `:428-433`; the declaration is live and retained (F5).

Round16 itself has **no** SCORECARD section yet: the file is 730 lines and ends with the round15
wrap (`SCORECARD.md:729-730`; `wc -l SCORECARD.md` → `730`). `git log --oneline -3` → HEAD
`e38d259`, with `.ufo/waves/round-16/` and `corpus/evidence/round-16/` untracked. So "current" in
this report means the round15 end state.

## Saturation and position

- Line 8 is a *floor* for the nudge, not a cap: all six axes (8,9,8,8,9,8) sit at or above it,
  so AXES.md's first precondition is satisfied (`SCORECARD.md:671-676` vs `:430`).
- The window counter is the lane's operative measure of "rounds since the last capability row":
  `sources-registry` restarted it at kaika round-1 (`:433`), and `aria-locator-template-loopback`
  restarted it again at round13 (`:588-589`; entry `:574`). The lane then recorded round14 = 1
  (`:658`, `LOG.md:817`) and round15 = 2 (`:729`).
- Therefore **round16 = position3**, i.e. the third and final position of the N=3 window.
  No capability row entered in rounds 14 or 15 (`:657`, `:728`), so the two completed positions
  are genuinely capability-free.

## Does the nudge waive the lowest-axis rule in round 16?

Applying `AXES.md:66-73` to the recorded state:

- "every axis … at or above the lane's saturation line" → **true**: 8/9/8/8/9/8 ≥ 8 (F1, F4).
- "no capability has entered the table within the lane's stagnation window" → **true at round16's
  decision point**: the last entry is round13 (F6); positions 1 and 2 (rounds 14, 15) recorded no
  entry (F9); round16 is the third position, and its own C2 entry has not landed yet (F10, F13).

So the nudge's precondition **is met for round16**, and per `AXES.md:70-73` "the lowest-axis
obligation is waived: the round should be a frontier/capability move." Round16's C2
(`webmcp-cdp-observation`, `PLAN.md:15`) is exactly that move.

Consequences that matter for the record:

1. **The waiver is not load-bearing.** PLAN's C1 also works operability 8, a lowest non-retired
   tie (`PLAN.md:9`, F1/F2), so the lowest-axis rule is discharged on its own terms even if one
   holds the strict reading that the waiver is unavailable until round17. The round is admissible
   under either reading; no axis is harmed (`AXES.md:34-36`).
2. **The waiver is permissive, not prohibitive.** `AXES.md:70-73` waives the *obligation* and
   directs the round's character; it does not forbid also working a lowest axis. C1 is legitimate
   alongside C2.
3. **The window resets at round16 only if C2 actually enters the table.** Capability rows enter
   only through a demonstrated run (`AXES.md:62-64`); the plan's claim (`PLAN.md:15`, count at
   `:29`) is not an entry. If the WebMCP harness receipt holds, the window restarts here
   (`SCORECARD.md:430-433` rule; round13 precedent `:588-589`) and **round17 is position1**. If C2
   does not hold, position3 completes as a capability-free round and the waiver is available for
   round17.

### Ambiguity the lane must resolve explicitly (already flagged by a sibling)

`SCORECARD.md:432` says the nudge fires after "three consecutive rounds **pass** with no new
capability row", while the lane's position labels (`:658`, `:729`) count the current round and put
the window's third position at round16. Two readings:

- **Position reading (recommended, matches the assignment's own arithmetic — "round16 is
  position3 since r13 capability — a capability entering resets it", quoted at
  `.ufo/waves/round-16/w1/DraftScorecard.md:24`):** round16 is position3 = N, the nudge applies
  to round16, C2 resets the window, round17 = position1.
- **Strict reading of `:432`:** only two no-capability rounds have completed; the waiver would
  become available at round17 if round16 also landed nothing.

Recommendation for L1's round-16 SCORECARD section: state the convention, not just the number —
e.g. "position3 of 3 at round16; `webmcp-cdp-observation` entered and restarts the window
(round17 = position1); C1 also discharges the lowest-axis obligation, so no waiver was relied
on." Do **not** copy rounds 12-15's bare "no stagnation waiver" phrase (`:523`, `:532`, `:595`,
`:664`) while also asserting position3, because those two statements together read as "the nudge
condition was met and quietly ignored". Say instead that the window was full and the round met it
with a capability move; that is the honest form.

## Commands run (observed)

- `wc -l SCORECARD.md` → `730`.
- `grep -n "^| depth | 8→8\|^| coverage | 9→9\|^| operability | 8→8\|^| freshness | 8→8\|^| calibration | 9→9\|^| adjacency | 8→8" SCORECARD.md`
  → round14 rows `:601-606` and round15 rows `:671-676`.
- `sed -n '426,434p' SCORECARD.md` → saturation declaration at `:428-433`.
- `sed -n '725,730p' SCORECARD.md` → file ends at round15 "position2" line (`:729`) + wrap (`:730`).
- `grep -n "retired" SCORECARD.md | sed -n '1,30p'` → retirements at `:129, :444, :523, :589, :659, :729`, all none.
- `grep -rn "position\|nudge\|stagnation" LOG.md | tail -20` → `LOG.md:817` "Round14 is stagnation-window
  position1"; no position2/position3 line in LOG (round15's is only in SCORECARD `:729`).
- `grep -n "waiv\|nudge\|stagnation" .ufo/waves/round-16/PLAN.md` → no matches, exit 1.
- `sed -n '30,42p;57,73p' /home/vgpnk/Projects/shokunin/AXES.md` → lowest-axis rule `:33-34`,
  capability-entry rule `:62-64`, nudge `:66-73`.
- `git log --oneline -3` → `e38d259`, `36240c7`, `9fd8bca`; `git status --porcelain` →
  `?? .ufo/waves/round-16/`, `?? corpus/evidence/round-16/`.

Not run (out of this seat's bounds): any gate, selftest, counter, browser, harness, manifest
edit, or commit. No tool was installed or updated (nothing needed).

## Residual risk / verification gaps

- SCORECARD records positions only through round15; round16's position and any window reset are
  L1's to record. Nothing in the repo currently asserts "round16 = position3" in the scorecard
  itself — it is derived from `:658` + `:729` and is only as sound as those two labels.
- The nudge has never been invoked in this lane (`:463-464`, `:531-532`, `:594-595`, `:663-664`
  all record no waiver), so no in-lane precedent settles the position-vs-"pass" ambiguity; the
  recommendation above is the reading consistent with the lane's own counter and with the round-16
  assignment text.
- Whether `webmcp-cdp-observation` actually enters the capabilities table depends on the WebMCP
  harness receipt (F13); this seat did not inspect or run it.
