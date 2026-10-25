# W2Log — attack on the round-23 LOG.md entry

Verdict: `FAIL (revise)` — the entry's wave-evidence block is falsified; C1 and C2 themselves hold.
Anchor: lane HEAD `2433ed2` (entries also measured at `af00b59`, 04:35:38-03:00). The tree moved
through `03c1b4d → 7ac9fff → dfae5cd → add37e7 → af00b59 → 2433ed2` while this review ran.

## Findings

1. **High — "88 seat reports" is 84.** LOG:1692 lists "88 seat reports" as landed evidence.
   `git ls-tree -r --name-only af00b59 -- .ufo/waves/round-23/w1 | grep -c '\.md$'` → 44;
   same for `w2` → 39 (83). At `2433ed2`: 44 + 40 = 84. Never 88. A third figure exists: the
   fleet report's landed row says "44 + 23 seat reports" (`sha256 78e35050…`, line 54) = 67.
   Three counts for one set; only 83/84 re-derives from a commit.
2. **High — the dead-seat deferral points at a stale report.** LOG:1697 defers dead seats and the
   wave-2 harvest to the round report, which still says "**34/44 reports, 10 dead**" (line 159)
   while 40 wave-2 reports are committed at `2433ed2` → recorded dead count is ~6 too high.
   `git ls-tree … w2 | grep -c '\.md$'` → 40 vs `grep -c '34/44 reports'` → 1.
3. **Medium — checkpoint/re-run pointer is split, neither side holds it.** LOG:1709–1710 says the
   checkpoint and its re-run are recorded in SCORECARD's `## Round 23` block;
   `git show af00b59:SCORECARD.md | sed -n '1146p'` says they are recorded "in the report (the
   report lands last)", and the block names `03c1b4d`, not the `af00b59`/`2433ed2` checkpoint.
4. **Medium — the census before-arm is a production claim, not re-runnable.** LOG:1683–1686 asserts
   "census exit 0 both ends, the same 16 `W04`". After-arm reproduces: `bash scripts/sources-census.sh
   validate --root … --file …/corpus/SOURCES.md` → exit 0, 16 `W04`, URL set identical to the
   baseline set. Before-arm cannot be re-run from committed bytes without a checkout; a lane-scratch
   copy of `a89f193:corpus/SOURCES.md` exits **1** (`E11` on every used-by path, resolved against the
   copy's directory) with the same 16 `W04`. That half is unverified here, not false.
5. **Low — the frozen counting command refuses.** `claims[0].countingCommand` is still
   `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --json`; run verbatim it exits **2**
   ("--round-cap is required … fail-open"). The working form lives only in `claims.revisions[0]`.
6. **Low — "Tooling: none installed" is an unbounded host-wide negative.** Outside the round's
   artifact window (first wave-1 report 04:14) the host shows 11 pacman installs at 00:56/02:14 and a
   uv tool at 03:51:13 (`~/.local/bin/coverage`). None is attributable to this lane or falls inside
   the round; the sentence is bounded, not evidenced.

## Verified — the claims themselves

- **C1 met.** `node scripts/round-evidence-audit.mjs --rev a89f1935… --round 22 --round-cap 128
  --json` → exit 1, 7 findings, 6 distinct classes (1/1/1/1/1/2); the in-place script equals HEAD
  (`git diff --stat HEAD -- scripts/round-evidence-audit.mjs` → empty). Before-arm
  `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` → 128. `--selftest` → 12/12. Matrix
  `--selftest --rev a89f1935… --round 22 --round-cap 128` → 6/6, each repair removing only its own
  class. Round-21 arm → exit 1, c3 only (true positive, as `revisions[2]` states). Skip-work control
  refused (`fixtures/skipwork-receipt.json`). `--rev af00b59 --round 23 --round-cap 128` → exit 0,
  0 findings, report present.
- **C2 met.** `git grep -lE '^source: S10[23] ' a89f1935… -- corpus/knowledge | wc -l` → 0;
  `… af00b59 …` → 1 (`corpus/knowledge/csrf-defense-shape-boundary.md`). SOURCES 101 → 103,
  A88/B4/C9 → A89/B5/C9, mined 73 → 75. Quotes 20/21 words; E1 paraphrase corrected ("offer").
- **Six corrections check out.** 24 refusals = 13 `w2` (01–09, 11–14) + 11 `w2b`, attempt 10 absent;
  `w2b` maxLanes 65 > 64, round 129 > 128; spot-check on record (committed lesson:90); attempt-2 window
  2026-10-23T20:41:38-03 → 2026-10-25T03:23:44-03 = **30.70 h**, distinct from the 85.3 h
  receipt→landing gap; `w2b` 65 `"agentId": null`; `47bfb5f` → 0 LOG hunks, `fbee618` → 1.
- **Wave shape.** Both specs 44 items / `maxLanes: 44`; LOG role tallies sum to 44 + 44;
  "37/44 attack roles" = reviewer 28 + critic 6 + mutation-tester 3; 88 dispatched ≤ 128.

## Residual risk

- The committed auditor cannot be executed outside `scripts/` (root = `dirname(script)/..`); every
  run above used the in-place copy, verified equal to HEAD.
- S102/S103 source bytes are not in the tree (sha256 pins only) and no GET was authorised, so
  located quotes are checked for shape/word count only.
- Two tracked wave-2 reports were mid-edit at review end; findings 1–2 should be re-measured after
  the next commit (the count only rises 83 → 84, never to the claimed 88).
