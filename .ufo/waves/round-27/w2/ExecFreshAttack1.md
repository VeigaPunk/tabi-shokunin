# ExecFreshAttack1 — C1 subsection/section association attack (round 27, wave 2)

Scope: read-only falsification of `scripts/check-selfassessment.mjs`'s LOG association rule. No tracked files were changed. Git fixtures and disposable provenance notes are confined to `.ufo/waves/round-27/scratch/ExecFreshAttack1/`. No tools installed; no builds, tests, linters, formatters, external requests, git/jj writes, or dispatches.

## Question and result

Does a `###` subsection split a `##` parent section for tally association? **No.** `sections()` splits only on lines matching `/^##\s/` (`scripts/check-selfassessment.mjs:128-142`); a `### Sub` line is ordinary content and remains in the parent section. Both heading depths are source-observed, not inferred from Markdown semantics.

The per-line association code uses scripts named on the tally line, else the `##` section's single-script set, else reports `ambiguous script association` (`scripts/check-selfassessment.mjs:184-224`; LOG arm `:267-307`). Therefore a nested subsection's own script mention does not isolate its following tally from two scripts named elsewhere in the parent section. If the tally line itself names one script, that line-local name wins, even inside the multi-script parent.

## Fixture setup and measurements

Created three independent temporary Git repositories under the assigned scratch directory. For each, ran `git -C "$D" init -q`, verified `git -C "$D" rev-parse --show-toplevel` equalled exactly `$D` before the first fixture commit, configured only local fixture author identity, wrote two harmless gate scripts and LOG/SCORECARD fixture files, then committed. Gate A prints `FIXTURE_SELFTEST verdict=clean cases=13 passed=13`; gate B prints `OTHER_SELFTEST verdict=clean cases=15 passed=15`. The production checker was invoked against each immutable `HEAD` as `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --repo "$D" --rev "$REV" --json`.

| Fixture | LOG structure | Observed tally result |
|---|---|---|
| A | `## Two-script section` names both gates; `### Sub` contains no script names; following line is `` `--selftest` 12/12 ... `` | Exit 0; finding at `LOG.md:8`, `script:null`, `observed:null`, `couldNotEvaluate="ambiguous script association"`; `mismatches=0`, `couldNotEvaluate=1`. |
| B | Same two-script parent; `### Sub` names only `scripts/check-fixture.mjs`; following tally line names no script | Same as A: ambiguous/CNE, not associated with the subsection's one script. |
| C (control) | Single-script `##` section names only `scripts/check-fixture.mjs`; tally follows beneath it | Exit 1; finding at `LOG.md:6`, script `scripts/check-fixture.mjs`, claimed 12, observed 13; `mismatches=1`. |

The fixture outputs directly distinguish the hypotheses: if `###` were a split, B would bind to fixture A's one gate and report a 12-vs-13 mismatch; actual output is ambiguous. C shows that a true single-script `##` section still binds and detects the discrepancy. Each fixture LOG SHA-256 and full commit id were emitted by the runner; all repository paths and results remain in the output transcript for this run (fixture roots under the named scratch directory). No claims about Markdown's normative heading semantics are needed.

## Reopening the frozen C1 counter and commands

The frozen round-26 claim (`.ufo/waves/round-26/claims.json:27-36`) says the extension must report at least one baseline LOG finding and explicitly treats multi-script ambiguity as CNE. The resumed round-27 claim (`.ufo/waves/round-27/claims.json:21-32`) specifies the actual baseline `4ad4c77...`, says the baseline has five LOG findings plus live m3, and requires tip mismatches zero. It is important not to conflate the frozen baseline (`4ad4c77...`) with the round-27 lane baseline (`f185b4e...`).

Executed exactly the declared counter command with the lane absolute path substituted:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 4ad4c77eed78bca1a149e65a7ec6a84b5f71c925 --json
```

Observed exit 1; `mismatches=6`, `couldNotEvaluate=89`, `superseded=5`. The five counted LOG mismatches are lines 335 (4→12), 391 (4→12), 1090 (66→26), 1103 (66→26), 1664 (12→13); the sixth is the live-tree m3 finding. This is consistent with the frozen baseline claim.

For the re-dispatched round-27 counting revision, executed:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev f185b4e7ab10cd9e8925e8ec614c9c111772357d --json
```

Observed exit 1; `mismatches=5`, `couldNotEvaluate=92`, `superseded=6`; counted findings are four LOG tallies at 335 (4→12), 391 (4→12), 1090 (66→26), 1103 (66→26), plus live m3. The frozen baseline `4ad4c77...` result is the relevant C1 before-arm; `f185b4e...` is the round-27 lane tip baseline, not the frozen baseline.

Re-ran the same counter at the C2 revision named by wave-1 evidence:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-selfassessment.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json
```

Observed exit 1; `mismatches=1`, `couldNotEvaluate=92`, `superseded=10`. The sole counted finding is live m3 (observed 25 paths in the run's live tree); the LOG tally at 221 (claimed 8, observed 12) is marked superseded. This reproduced the claimed current symptom but does **not** validate the frozen C1 fit: the actual relevant baseline is the `4ad4c77...` result above, where the counter reports six total mismatches and five LOG findings. I did not “repair” the counter or alter data.

The `m3` result is live working-tree state, not revision-tree content (`m3Findings`, source `:379-389`); the observed count is volatile. Do not compare it as if it were pinned to a `--rev`.

## Evidence boundaries and unknowns

- **Observed:** `sections()` checks only `^##\s`; `### Sub` is included in parent data; A and B produce ambiguity; C produces a single-script mismatch. The runner and output were captured in this session.
- **Observed:** baseline `4ad4c77...` yields five counted LOG findings plus one m3, per the exact counter run above.
- **Observed:** `f185b4e...` and `5ed6484...` results are as reported above. Wave-1 `ExecC1Attacks.md:6-17` independently names `5ed6484...` as its measured revision and notes lane drift; the exact repo tree remained concurrently mutable for live m3.
- **Inference:** fixture B establishes that an inner subsection mention cannot serve as a local association boundary; that follows from the source splitter and measured output. It is not a recommendation to change association policy.
- **Unknown:** No broader Markdown parser behavior is tested, and no claim is made about headings inside fenced code (the source splitter itself does not mask fences before matching).

No code change is proposed: this item's requested artifact is the observed subsection-splitter behavior and C1 counter attack only.
