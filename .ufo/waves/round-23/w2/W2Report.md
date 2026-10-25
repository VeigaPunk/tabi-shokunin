# W2Report — tabi round 23, attempt 1 (falsify)

**Verdict: FAIL (blocker).** The round report does not exist, so the marker rule trips, all six
required sections are missing, and the round's own auditor refuses to decide the round (exit 2).
Two counting arms also do not reproduce on any revision present in the repo.

## Blockers

1. **Report absent — every required section.** `/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` does not exist;
   `ls .ufo/reports/round-23/` → `kagi.md kaidoku.md kake.md kama.md kasegi.md kotodama.md mado.md mori.md tameshi.md tsukuroi.md`.
   Prompt §4 (*Report contract*) requires, in order: Work performed, Landed changes,
   Before → after measurements, Sources & frontier, Trend verdicts, SHONEN. None exists; no bullet
   can carry an evidence pointer; `Stale-lane` (addendum item 6) has no line to grade attempt 1.
   Under the **Marker rule** a contentless report fails the round.
2. **The round cannot audit itself.** `node scripts/round-evidence-audit.mjs --rev a89f1935… --round 23 --round-cap 128 --json`
   → exit **2**: `refused: cannot read the round report at …/reports/round-23/tabi.md; c4/c6 cannot
   be decided without it and a clean verdict would be a false green`. Closure is mechanically
   blocked by finding 1, not merely stylistically deficient.
3. **C2's after-arm is unreproducible as printed.** `corpus/lessons/round-23.md:26` prints the counter with
   `a89f1935…` as `<REV>` and `:38-40` asserts it lists `corpus/knowledge/csrf-defense-shape-boundary.md`.
   `git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l` → **0**;
   at `HEAD` → **0**; `git grep --untracked -lE '^source: S10[23] ' -- corpus/knowledge | wc -l` → **1**.
   The cause is untrackedness (`git ls-files --error-unmatch` → *did not match any file(s) known to
   git*), so `0 → 1` holds only after a commit that does not exist.
4. **No measured commit exists.** `git rev-list --count a89f1935f523a64b00991d792fca6a8c0d321948..HEAD` → **0**;
   `git log --oneline -1` → `a89f193 round-22 verifier spot-check`. Prompt §2.5 requires each claim's
   *measured commit*; `SCORECARD.md:1145-1146` instead asserts measurement "against the tree of the
   checkpoint commit that carries the auditor" and defers the hash and post-commit re-run to the
   absent report. That commit does not exist.
5. **Lesson Gate misstates the round-21 control.** `corpus/lessons/round-23.md:32`: "round-21 evidence →
   exit **0, clean, 0 classes** (zero-control)".
   `node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --round-cap 128 --json`
   → exit **1**, 1 finding, `c3-gate-spotcheck`. `claims.json` revisions[2] and
   `c1-measurements.json.controls.round21` both record the corrected reading; the Gate — the section
   `SCORECARD.md:1157` cites as evidence — keeps the superseded one.

## Major

6. **`corpus/evidence/round-23/c1-measurements.json:11` misstates an exit code**: before-arm
   `"command": "git cat-file -e a89f1935:scripts/round-evidence-audit.mjs"`, `"exit": 1`. Re-run →
   `fatal: path … exists on disk, but not in 'a89f1935…'`, exit **128** (as `corpus/lessons/round-23.md:31` says).
7. **`corpus/lessons/round-23.md:39`**: "`git diff --diff-filter=A` over the same range names exactly
   that one added file" — the range holds no commit (`rev-list --count` → 0); the sentence is unanchored.
8. **`SCORECARD.md:1129-1130` (C2 row)** states Before → after `0 → 1` keyed to `<REV>`; no revision in
   the repo yields 1 (findings 3, 4). A declared value is presented as measured.
9. **Universal clauses the counting command does not enumerate.** `SCORECARD.md:1165` "No axis harmed"
   and `:1153` "exercised scope shows no harm … auditor writes nothing" carry no counting command.
   `claims.json` *notClaimed* "every seat is lane-dispatched" is enumerable only through
   `w1-record.json` / `w2-record.json` (44 + 44 members, 0 `agentId: null`), yet the per-attempt
   `Stale-lane` grading the policy requires is absent with the report.

## Verified — not defects (re-run, exact bytes)

- **C1, corrected arm**: `--rev a89f1935… --round 22 --round-cap 128 --json` → exit **1**, 7 findings,
  **6** distinct classes `c1…c6`, each with 1–4 `evidence` entries. The frozen command without
  `--round-cap` exits **2** (refusal), which `claims.json` revisions[0] discloses.
- **`--selftest`** → `cases: 12`, `passed: 12`, exit 0; six green cases 0 findings.
- **Skip-work control**: `.ufo/waves/round-23/fixtures/skipwork-control.mjs` reports 6 on defective and
  6 on clean input, `reads: nothing` → correctly refused (`skipwork-receipt.json`).
- **S102/S103 bytes match the rows**: `sha256sum` `06223931…` / 146976 B (line 2815 carries the quoted
  sentence) and `6f32bfbf…` / 157809 B (quoted header sentence present). `SOURCES.md` rows 101 → 103,
  two appended; `corpus/knowledge/…-boundary.md:3-4` carries both `^source:` lines.
- **Residual risk / gaps**: the two fetched sources live only in untracked `.ufo/waves/round-23/scratch/SrcS102/`
  and `SrcS103/`, so the located-quote control rests on uncommitted bytes until a report cites a
  committed pointer. I did not run `sources-census.sh validate` (it can write under `corpus/`), so the
  101 → 103 census pair is unverified here. Tool installs this lane: none.
