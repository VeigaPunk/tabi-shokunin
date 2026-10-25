# ExecRegistryCount — independent S107 registry arithmetic (round 27 W2)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Assignment baseline: `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; tip observed: `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (`git rev-parse HEAD`). Read-only checks; no tooling installed.

## Verdict

**PASS** for the registry arithmetic and lineage requested. At the exact frozen baseline and tip, S-row count is 106→107 and S10x count 7→8. Tip S107’s used-by path resolves to an existing tracked entry whose only `source: S107` front-matter occurs in that file. Baseline-to-tip `corpus/SOURCES.md` diff is exactly one added line and zero removed/edited lines. Worktree `corpus/SOURCES.md` matched tip at measurement (`git diff --stat HEAD -- corpus/SOURCES.md` empty; matching SHA-256 below).

Wave-1 findings folded into this attack item: `RevSourcesS107.md` F1 reported an in-review row mutation (v1→v2) and asked the L1 to rerun the gate on committed bytes; this check is explicitly against current tip and worktree bytes, which match. `ExecCensusMirror.md` O2 likewise documented row evolution. `RevEntryC3.md` reported a duplicated orphan fragment in the entry and missing inline line citation; neither changes the registry-count/used-by assertions here. These are not represented as registry-arithmetic failures.

## Exact evidence

Commands were run from the lane root unless an explicit `git -C` path is shown.

- Total rows, command `git show <rev>:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S[0-9]{3,}'`: baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` → **106**; tip `HEAD` → **107**. Worktree command `grep -cE '^\\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md` → **107**.
- S10x band, command `git show <rev>:corpus/SOURCES.md | grep -cE '^\\|[[:space:]]*S10[0-9]'`: baseline → **7**; tip → **8**. Worktree same regex → **8**. Enumerated baseline IDs: S100–S106; tip/worktree: S100–S107.
- S107 used-by extraction, command `git show HEAD:corpus/SOURCES.md | awk -F'|' '/^\\|[[:space:]]*S107[[:space:]]*\\|/{gsub(/^ +| +$/,"",$12); print $12}'` → `corpus/knowledge/redirect-and-retry-after-semantics.md`.
- Existence at tip: `git ls-tree HEAD -- corpus/knowledge/redirect-and-retry-after-semantics.md` → `100644 blob 086271e2678bb7f1df653822489e6b6d139145f3 corpus/knowledge/redirect-and-retry-after-semantics.md`. Worktree `ls -la corpus/knowledge/redirect-and-retry-after-semantics.md` → file exists (3888 bytes).
- Unique citation at tip: `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge` → only `HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`; piping the same command to `wc -l` → **1**. Worktree `grep -rlE '^source: S107 ' corpus/knowledge/` → only `corpus/knowledge/redirect-and-retry-after-semantics.md`; `wc -l` → **1**. Tip front-matter read: line 3 begins `source: S107 — https://www.rfc-editor.org/rfc/rfc9110.txt`.
- Baseline-to-tip change shape: `git diff --numstat f185b4e7ab10cd9e8925e8ec614c9c111772357d..HEAD -- corpus/SOURCES.md` → `1  0  corpus/SOURCES.md`; `git diff ... -- corpus/SOURCES.md | grep -cE '^-[^-]'` → **0** removed lines. `git diff --stat ...` → `1 file changed, 1 insertion(+), 0 deletions(-)`. The sole added line is S107 at `corpus/SOURCES.md:121` in tip; diff header reports `@@ -118,6 +118,7 @@`.
- Worktree/tip consistency: `git show HEAD:corpus/SOURCES.md | sha256sum` and `sha256sum corpus/SOURCES.md` both → `e7e32abacda4e0d3bfecef1adcfd2614240df8cc5dcf74257edbb114748f9403`. `git diff --stat HEAD -- corpus/SOURCES.md` → empty. `git status --porcelain corpus/` → empty.

## Observation / inference / unknown

**Observed:** The row-count, band-count, used-by, entry-existence, unique-front-matter, and one-insertion/no-removal results above. The current tip has two commits touching `corpus/SOURCES.md` since the baseline (`git log --oneline f185b4e..HEAD -- corpus/SOURCES.md`): `6ca3b89` adds C3 and `bceb17d` integrates the round-27 work; net delta remains one inserted registry line.

**Inference:** This establishes the requested arithmetic and lineage at the measured tip; it does not establish correctness of the S107 prose, row policy, or broader census implementation.

**Unknown:** No census/validation utility was run; that is outside this assignment’s requested registry arithmetic and parent-owned gate. No assertion is made about future commits or post-measurement changes.

## Risks and blockers

No blocker to the assigned checks. Wave-1 `RevSourcesS107.md` observed row mutation during its own review interval; current snapshot is now internally consistent between tip and worktree, but future edits still warrant the parent’s post-integration gate. No tools installed or upgraded (none needed); pacman not invoked.
