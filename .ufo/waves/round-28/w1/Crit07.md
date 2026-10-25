# Crit07 — C2 falsification review (round 28, attempt 1)

Seat: Crit07 / item 39. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Frozen claims: `.ufo/waves/round-28/claims.json` (C2 = `claims.json:12`).
Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (HEAD, clean tracked tree; only
untracked `.ufo/waves/round-28/`). No tools installed. Read-only on lane tracked files;
fixtures in `mktemp` repos, committed with `git -C`, root verified before commit.
`/home/vgpnk/.omp/agent/RULES.md` read; no installs needed. PACMAN untouched.

## Axis and premise
C2 claims calibration: "repair m1 supersession so a correction only clears the exact stale
tally it cites, not an unrelated later line/paragraph" (`claims.json:12`), metric
`selfassessment_mismatches_and_cases`, counting command `node scripts/check-selfassessment.mjs
--rev <REV> --json`; kill rule: "If any unrelated correction still clears LOG.md:221, claim
misses."

Premise verified at tip:

- `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json`
  → `mismatches=1` (counted = m3-unlanded-paths only) and the known finding
  `LOG.md:221 claimed=8 observed=12 superseded=true` — the false-clear is live.
- The clearing paragraph is LOG.md lines 265-447 (183 lines). Sweep:
  `git show eb23c0b:LOG.md | sed -n '265,447p' | grep -oE ':[0-9]+'` → only `:16`, `:28`,
  `:18751`; `grep -c ':221'` → `0`. The paragraph never cites line 221; the colon-digit
  tokens are clock-time fragments. Matcher fires on any `:\d+`, so a timestamp clears.
- Baseline selftest: `node scripts/check-selfassessment.mjs --selftest --json` → `cases=17,
  passed=17, ok=true` (no red unrelated-citation case; the C2 "after" needs ≥19).

## Falsification fixtures (all run against the lane script with `--repo <mktemp> --rev HEAD`)
Gate fixture prints `cases=13`; scorecard clean (13/13); stale LOG tally `12/12` at line 6.

| # | control | fixture | result (exit) | verdict |
|---|---------|---------|---------------|---------|
| A | unrelated citation | correction cites `LOG.md:999`, states `cases=13` | `superseded=1, mismatches=0, clean` (0) | **red control FAILS** — unrelated citation clears |
| B | wrong script | correction names `scripts/check-other.mjs` | mismatch retained line 6 (1) | guard holds |
| C | wrong tally | correction cites `:6`, states `cases=12` | retained; correction line itself counted (1) | guard holds |
| D | earlier paragraph | correction before stale mention | retained line 9 (1) | guard holds |
| E | exact citation green | `supersedes LOG.md:6` + `cases=13` | `superseded=1, clean` (0) | positive control passes |
| F | denial-gaming | "Correction — the twelve figure quoted at LOG.md:6 is accurate; … `cases=13`" | `superseded=1, clean` (0) | **clears even when denying** |
| G | scorecard window | later row `(13/13) corrected at `:999`` | `superseded=1, clean` (0) | **scorecard window same flaw** |

## Counterexample (strongest)
Fixture F: a paragraph that denies the twelve-figure tally while containing the token
`LOG.md:6` and the oracle number is treated as a supersession. This defeats the current
presence matcher and would still defeat any fix that only requires the `:LINE` token to appear
in the paragraph. A safe repair must bind the cited number to a supersession verb
(e.g. `/(?:supersed|superseding|corrects?)\s+(?:LOG\.md:)?(\d+)/` with capture == the stale
line) and apply the same rule in the SCORECARD window (fixture G), which is otherwise a
remaining bypass. `:221` appears nowhere in the real clearing paragraph; the defect fires on
accidental `:\d+` tokens.

## Impacted axes
- Calibration (C2): current matcher false-clears; the claim's premise and target are correct,
  but the "exact-line" fix is underspecified against denial prose and the scorecard window.
- Operability of the gate: exit 0/clean on a false-clear masks the mismatch.

## Smallest safe correction
1. In `scripts/check-selfassessment.mjs`, replace presence checks at LOG paragraph matcher
   (`:319-327`) and SCORECARD finding matcher (`:233-239`) with a marker-bound exact citation:
   supersession verb immediately followed by the cited line number equal to `f.line`
   (support range citations by matching each bound).
2. Keep same-script and oracle-tally requirements.
3. Add red selftest cases: unrelated citation (`:999`) and denial sentence citing `:6`; keep
   green exact-citation case (existing `m1-log-stale-then-corrected`).
4. Do not alter historical LOG prose and do not weaken tally-oracle checks (kill rule).

Evidence commands: checker runs above; fixture roots created via `mktemp -d`, `git -C` init/
commit, `git rev-parse HEAD` before evaluation; scratch at
`.ufo/waves/round-28/scratch/Crit07/` (replicate.mjs). Observations vs inference: all
fixture results are direct runs; the ":221 lacking" sweep is a full-para count (negative claim
swept).
