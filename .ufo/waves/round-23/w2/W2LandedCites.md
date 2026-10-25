# W2LandedCites — round-23 landed-changes trail

**Verdict: HOLD.** Landing commit `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3` (=`refs/heads/master`)
binds `LOG.md` §Round23 to the doc edits and new files in one commit, so defect 6 is satisfied for
what it carries — but it carries **0** W2 evidence files while its LOG writes "88 seat reports",
lands a lesson control line its co-committed LOG/SCORECARD refute, and the fix for that line is
uncommitted drift. The cited checkpoint hash is in no committed byte; the report the SCORECARD
defers to does not exist. Method: read-only git on `03c1b4d`; every control re-run as quoted.

## Findings

1. **HIGH — W2 landed no evidence; LOG claims 88 seat reports.** `git ls-tree -r --name-only 03c1b4d -- .ufo/waves/round-23/w2 | wc -l` → **0**; w1 → **45** (44 `.md` + `swarm-registry.json`). `git show 03c1b4d:LOG.md` ("Landed paths") still says "88 seat reports". Uncommitted w2 `*.md` in worktree: 34.
2. **HIGH — committed lesson's round-21 zero-control is false.** `git show 03c1b4d:corpus/lessons/round-23.md` §Gate: "round-21 evidence → exit **0, clean, 0 classes** (zero-control)". Quoted command: `node scripts/round-evidence-audit.mjs --rev 5f585773258b33d2d514b00cd0b0775333578db6 --round 21 --round-cap 128 --json` → **exit 1, 1 finding** (`c3-gate-spotcheck`, `""no-spotcheck-line"`). Round-21's `## Gate` is a bare heading (`awk '/^## Gate/,/^## /' corpus/lessons/round-21.md`), so the finding is a true positive and round-21 is no clean fixture.
3. **HIGH — same commit contradicts itself on that control.** `git show 03c1b4d:LOG.md`: round-21 "trips only c3 … is not claimed as a zero-control"; `git show 03c1b4d:SCORECARD.md | sed -n '1149p'` says the same. Only the lesson asserts exit 0 (`…:corpus/lessons/round-23.md | sed -n '33p'`).
4. **HIGH — the repair of finding 2 is uncommitted.** `git diff 03c1b4d -- corpus/lessons/round-23.md | grep -E '^-.*round-21|^\+.*c3'` → `-…exit **0, clean, 0 classes** (zero-control)` / `+…not a zero-control: it trips c3-gate-spotcheck — exit 1, 1 finding`. `git rev-parse refs/heads/master` → `03c1b4d…`; no LOG entry names the follow-up — defect 6 reproduced on its own fix.
5. **HIGH — SCORECARD defers to a report and hash that do not exist.** `git show 03c1b4d:SCORECARD.md | sed -n '1145,1146p'`: "checkpoint hash and post-commit re-run are recorded in the report (the report lands last)". `git grep -n 03c1b4d 03c1b4d -- .` → empty. `/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` is absent: `node scripts/round-evidence-audit.mjs --rev a89f1935… --round 23 --round-cap 128 --json` → exit 2, "refused: cannot read the round report at …round-23/tabi.md".
6. **MEDIUM — cited C1 evidence differs from committed.** Committed keys `schema,at,metric,counter,before,after,controls`; worktree adds `failureCapable`,`c2` and rewrites three fields (`git diff 03c1b4d -- corpus/evidence/round-23/c1-measurements.json` → 215 lines). Uncommitted, no LOG entry.
7. **MEDIUM — round 23 has no landed-changes rows, so c6 cannot audit it.** c6 reads the fleet report table, absent per finding 5; `grep -niE 'landed|carries each|commit' corpus/lessons/round-23.md` finds only prose, while `:120` claims "This round's rows name the commit that carries each LOG entry". LOG's list names paths, never a hash.
8. **LOW — lesson's w2 registry citation is not at the commit.** `git cat-file -e 03c1b4d:.ufo/waves/round-23/w2/swarm-registry.json` → 128. agentIds survive only in the receipt: `git show 03c1b4d:.ufo/waves/round-23/w2-record.json` → 44 members, 44 non-null `agentId` (w1 registry 44/44).
9. **LOW — C2 after-arm names no revision.** Gate quotes `git grep -lE '^source: S10[23] ' a89f1935… -- corpus/knowledge | wc -l` → 0; rev-less `git grep` also 0 (untracked). At the landing rev: `git grep -lE '^source: S10[23] ' 03c1b4d -- corpus/knowledge` → the one file; rows `grep -cE '^\| S[0-9]+ \|'` = 101/103 at `a89f1935`/`03c1b4d`; `git diff-tree -r --diff-filter=A a89f1935 03c1b4d -- corpus/knowledge` → exactly that file.

## Verified clean

- **All 7 cited commits exist and are ancestors of master**: `a89f1935…`, `5f58577…`, `47bfb5f`, `fbee618`, `be271a2`, `0f24164`, `e3cf4e0` (`git rev-parse --verify <h>^{commit}`; `git merge-base --is-ancestor <h> refs/heads/master`). `a89f1935`'s parent is `be271a2`. The ref moved mid-review (`refs/heads/master` = `a89f1935…` first call, `03c1b4d…` after); all cited commits are ancestors under the final state, HEAD = master.
- **Round-22 defect-6 example accurate**: `git show --name-only --format='' 47bfb5f | grep -c '^LOG.md$'` → 0; `fbee618` → 1 with `+## Round22 landing…` (`git show fbee618 -- LOG.md | grep '^+## '`); `be271a2` → 0 while fleet `round-22/tabi.md:89` binds it to `LOG.md §Round22 landing` — c6's 2 findings are true positives from real rows.
- **C1 reproduces from committed bytes**: committed auditor has no `--root` (line 864 derives root from `..`), so one scratch copy differed only at line 864 (root pinned to lane root); then `--rev a89f1935… --round 22 --round-cap 128 --json` = **exit 1, 7 findings, 6 classes, 1/1/1/1/1/2** (identical to worktree); `--selftest` 12/12 exit 0; `--selftest --rev … --round 22 --round-cap 128` 6/6 clean exit 0; `git cat-file -e a89f1935:scripts/round-evidence-audit.mjs` → 128; no `--round-cap` → exit 2.
- **The commit binds what it carries**: `git show --name-status --format='' 03c1b4d` → `M LOG.md SCORECARD.md corpus/{QUALITY,README}.md corpus/SOURCES.md`, `A scripts/round-evidence-audit.mjs corpus/{lessons/round-23.md,knowledge/csrf-defense-shape-boundary.md,evidence/round-23/c1-measurements.json}` plus w1/w2 spec·dispatch·record·spawn-result; LOG section `## Round23` at `LOG.md:1649` in the same commit.

## Residual risk / gaps

- Worktree moved under review (`git diff --name-only 03c1b4d` went 3 → 10 paths); numbers above are pinned to `03c1b4d` at a stated moment. Findings 2–6 clear only if a later commit lands the drift.
- Off-master jj working-copy `1dfff43` (child of `03c1b4d`) holds a different tree (lesson/README/SOURCES/knowledge differ; includes `scratch/W2Prune/manifest.tsv`). Nothing graded from it; lane branch authoritative.
- Disclosed adaptation: committed `scriptSha256` in my run is the patched copy's; only line 864 differed (`diff <(git show 03c1b4d:scripts/round-evidence-audit.mjs) <copy>`).
- All findings author-side; every seat is lane-dispatched, no non-author judgment asserted.
