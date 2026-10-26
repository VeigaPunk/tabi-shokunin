# RerunNoHarm — commands and exit codes

Seat: RerunNoHarm (round 34, wave 2, tabi lane). Scratch root
`S=/fast/scratch/hyaku/tabi-r34/RerunNoHarm`; output dir `O=<lane>/.ufo/waves/round-34/w2/RerunNoHarm`.
Lane = `/home/vgpnk/Projects/shokunin/tabi-shokunin`. BASE = 15dfaccb34601c2d221c78501e2befd8998d600c,
REV = 04f9623dde8ad35d470cecf766e421eafbcb47fa, FREEZE = 59f1b47aae277e1670e4a824173da8cde7e388ee.

| # | command | exit |
|---|---|---|
| 1 | `mkdir -p $S` then `HYAKU_SCRATCH=$S/hs .ufo/waves/round-34/measure.sh 04f9623dde8ad35d470cecf766e421eafbcb47fa $S/out 59f1b47aae277e1670e4a824173da8cde7e388ee` (cwd `$S`) | 0 (`measured 04f9623`) |
| 2 | `sha256sum .ufo/waves/round-34/measure.sh .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs .ufo/waves/round-34/counters/c2-gate-mutants.mjs` (lane worktree) | 0 |
| 3 | `git -C <lane> rev-parse HEAD` | 0 (`04f9623…`) |
| 4 | `git -C <lane> status --porcelain \| wc -l` | 0 (`10`, pre-existing seat artifacts) |
| 5 | `git -C <lane> diff --numstat BASE REV -- SKILL.md SCORECARD.md LOG.md corpus/README.md corpus/QUALITY.md corpus/SOURCES.md corpus/adjacency.tsv` | 0 (deleted column 0 in all 7) |
| 6 | `git -C <lane> diff --numstat BASE REV` (all paths) | 0 |
| 7 | `awk -F'\t' '$2!=0' numstat-all.tsv` | 0 (only `adjacency-screen.tsv` 4/4, `check-bidi-runtime.mjs` 62/7) |
| 8 | `git -C <lane> show REV:<path> \| sha256sum` for 6 gate/counter paths | 0 |
| 9 | `node $S/cmp/compare.mjs <baseline>/measure-at-baseline/noharm-at-15dfacc.txt $S/out/noharm-at-04f9623.txt` | 0 (`regressions=0 non_identical=0`, 28 vs 28 lines) |
| 10 | `diff <(sed -E normalise-REV-and-scratch baseline) <(same rerun)` | 1 (differences enumerated: rev hash, rows/sources counts, bidi case count) |
| 11 | `node -e` selfassessment fields (baseline vs REV) | 0 (`clean=true mismatches=0` both; findings 220→231; couldNotEvaluate 115→116; superseded 42→48) |
| 12 | `node -e` counter fields (c1/c2/r33c1 at REV) | 0 |
| 13 | `node -e` frozen mutant find-text presence at REV | 0 (20/20 exactly once, `not_exactly_once=0`) |
| 14 | `node -e` `corpus/adjacency-screen.tsv` column deltas BASE→REV | 0 (4 rows: 31/35/39/42; note-only for :411) |
| 15 | `head -n <'// ---- self-test' line>` of the gate at BASE and REV, `sha256sum` | 0 (production half identical, `ecfccb73…`) |
| 16 | `git -C <lane> diff -U0 BASE REV -- scripts/check-bidi-runtime.mjs \| grep '^@@'` | 0 (8 hunks, all in goldenLines/lessonsDoc/CASES/runSelftest) |
| 17 | `grep -n '396\|411\|422\|440\|relabel' corpus/lessons/round-34.md` | 0 (lines 133-135 list rows 31,35,39,42) |
| 18 | `grep -n -A14 'Routed defects' corpus/lessons/round-33-verifier-spotcheck.md` | 0 (defect 5: 396/422/440 relabel + kake:411 note, lines 166-167) |

No tools installed (no uv/npx/official binary; pacman untouched). No network fetches. No browser started.
Scratch deleted after receipts were copied (`rm -rf /fast/scratch/hyaku/tabi-r34/RerunNoHarm`).
