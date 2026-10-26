# ExecC2Oracle — commands, exit codes, environment (round 31 w1, C2 build)

Scratch: S=/fast/scratch/hyaku/tabi-r31/ExecC2Oracle (HYAKU_SCRATCH=/fast/scratch/hyaku)
Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then
`git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d`
→ `git -C "$S/clone" rev-parse HEAD` = 9505a10eb80b2a0b273ebaba3f7f872ad302192d (exit 0)
→ `git -C "$S/clone" status --porcelain | wc -l` = 0 (exit 0; clean before and after every run)
node v24.21.0. All runs TMPDIR=$S/tmp (per-gate self-tests create and remove their own trees there).

Frozen counter bytes at REV (must equal claims.json frozenDigests):
  sha256 scripts/check-selfassessment.mjs = 143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce  (exit 0)
  sha256 scripts/check-decision-table.mjs = d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  (exit 0)

Gate set = the oracle's own RUNNABLE_GATE regex
  scripts/check-selfassessment.mjs:80  /^scripts\/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$/
Size 17 = 16 × scripts/check-*.mjs + scripts/round-evidence-audit.mjs; all 16 names match the regex
(unmatched: none). SELF_TEST_FLAG = /--self-?test\b/ (line 81); each gate declared its own flag in its
usage text — recorded verbatim in oracle.tsv column `flag`.

## Self-tests (round 1, combined streams; round 2, split streams used for oracle.tsv)
  (cd "$S/clone" && TMPDIR="$S/tmp" timeout 900 node <script> <flag>) >out 2>err ; echo $? >exit
  run window 2026-10-26T08:38:26Z .. 2026-10-26T08:38:31Z (parallel, 3 at a time, xargs -P 3)
  exit codes: all 17 = 0   (logs/<gate>.exit, logs/<gate>.out, logs/<gate>.err)

## Calibration counter at REV
  node scripts/check-selfassessment.mjs --rev 9505a10eb80b2a0b273ebaba3f7f872ad302192d --json
  run 1: 2026-10-26T08:38:05Z exit 1   (counter-selfassessment-rev.json, 77238 bytes)
  run 2: 2026-10-26T08:40:25Z exit 1   (counter-selfassessment-rev-run2.json, 77238 bytes)
  byte-identical (sha256 b5ec0f19…dcf84 both), `counted` arrays identical -> reading is stable, not flaky.
  reported: mismatches 9, counted 9, superseded 20, couldNotEvaluate 103, findings 174, clean false.

## Derived tables
  oracle.tsv           17 rows, one per gate: exit, verbatim summary line, N, oracle branch/tally,
                       every other `cases=` token in the same output, first cases-shaped token.
  counted-mismatches.tsv  the 9 findings whose observed != claimed and not superseded.
  ambiguous-claims.tsv   all 24 findings the counter reports could-not-evaluate ("ambiguous script
                       association"): doc, line, claimed, section, section's scripts and their tallies,
                       whether claimed matches any named gate.
  SHA256SUMS            every delivered file.

## Counter-JSON totals used in the report
  python3 -c 'import json;d=json.load(open("counter-selfassessment-rev.json"));print(d["mismatches"],len(d["counted"]),d["superseded"],d["couldNotEvaluate"])'
  -> 9 9 20 103
  couldNotEvaluate by reason: "command outside the closed re-run grammar" 76, "ambiguous script
  association" 24, "script outside the runnable gate set" 3  (= 103).
