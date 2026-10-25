# ExecCorpusInvariants — C1–C3 corpus invariants (round 27)

## Scope and source

Read-only check against baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` and current `master`. Wave-1 finding folded in: `w1/ScoutStagedGround.md` §2–3 reports staged S125/S142 duplicate-document and scope overlap; §4 reports a staged 307/308 over-assertion corrected in landed knowledge. `w1/ExecReportContract.md` reports its utility and fixtures remained scratch-only, with no tracked writes. No tracked files modified; no tool installed.

Commands below ran from `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```sh
base=f185b4e7ab10cd9e8925e8ec614c9c111772357d
git rev-parse master
git ls-tree -r --name-only "$base" -- corpus/knowledge | wc -l
git ls-tree -r --name-only master -- corpus/knowledge | wc -l
git diff --name-only "$base" master -- corpus/knowledge
```
Observed master `bceb17dd82446a3b7514dd9759ec733673b4ba0d`; knowledge files **45 → 46**. The command's only name difference is `corpus/knowledge/redirect-and-retry-after-semantics.md`. (The displayed command's label `base-only` was misleading: `git diff --name-only` lists all differing paths, not base-only.)

```sh
git show master:corpus/QUALITY.md | grep -cE '^[0-9]+\.'
git show master:corpus/QUALITY.md | grep -E '^[0-9]+\.' | tail -1
```
Observed count **68**; last numbered line begins `68.`. This establishes terminal id and count, not by itself that every intermediate identifier is unique or monotone; exact count/prefix sweep found no contrary evidence beyond the command output.

```sh
for rev in "$base" master; do git show "$rev":corpus/README.md | grep -Ec '^\| `knowledge/'; done
```
Observed coverage-table knowledge rows **49 → 50**, delta **+1**. This counts matching rows, not unique paths or completeness.

```sh
git diff --stat "$base" master -- corpus
git diff --stat "$base" master -- corpus | grep -c deletion
```
Full stat: `corpus/QUALITY.md | 15 +++`; `corpus/README.md | 26 ++++++`; `corpus/SOURCES.md | 1 +`; new redirect entry `57 +++++++++++`; `corpus/lessons/round-27.md | 102 +++++++++++++++++++++`; total **5 files changed, 201 insertions(+)**. The `grep -c deletion` output was **0**. This stat shows no deletion entries and only additions; it is not a byte-by-byte proof against modifications within a file, but each displayed stat line is insertion-only.

```sh
git diff "$base" master -- SCORECARD.md
git diff "$base" master -- SCORECARD.md | grep -c '^-' 
```
Observed one minus-prefixed diff line (the unified-diff hunk context marker `--- a/SCORECARD.md`, not a removed content line). Diff shows round-27 sections appended after prior content; no removed content lines. Thus SCORECARD is append-only in this diff. The minus-line regex includes diff metadata; interpreting it as content-removal count would be erroneous.

## Result

All requested corpus invariants hold at observed master under the above counting conventions: one new knowledge file, QUALITY terminal number 68/count 68, one additional README knowledge row, corpus diff stat insertion-only, and SCORECARD diff appended-only. The only baseline-to-master difference in the knowledge path set is the C3 entry. Wave-1's S125/S142 refusal and staged quote correction findings do not show extra knowledge additions or corpus deletions; README row increase is exactly one, consistent with the landed S107 entry.

## Evidence limits / risks

- README command counts rows matching a path-shaped prefix, not semantic coverage or duplicate-free paths.
- The requested `grep -c deletion` is a text search of diff-stat output, not a Git deletion detector; full stat and name differences were also inspected.
- `grep -c '^-'` includes the unified diff header; the actual patch was inspected and contains only appended content.
- No builds, tests, linters or formatters run (not applicable to this read-only measurement assignment).
