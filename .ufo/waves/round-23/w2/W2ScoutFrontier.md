# W2ScoutFrontier — round-23 corpus/README.md block 539–565

Scope: the new `## Round 23` block (`corpus/README.md:539-565`) plus the "revisions"
block of `.ufo/waves/round-23/claims.json` where it names this block. Baseline
`a89f1935f523a64b00991d792fca6a8c0d321948`. Read-only git; no writes outside this
file; no tool installs.

**Verdict:** append-only holds byte-exactly and the restatement does not narrow, and
both stated counts reproduce — but two evidentiary sentences do not reproduce: the
"ground was not held" grep is unpinned and now returns the opposite result, and its
"only CSRF/SameSite mentions" census under-reports the baseline.

## F1 — append-only: VERIFIED (bytes)
`cmp` reports EOF on the baseline after 52500 bytes → the current file is a strict
extension, 0 baseline bytes rewritten; both cited earlier lines hash identical.
- `cmp <(git show a89f1935…:corpus/README.md) <(git show 03c1b4d…:corpus/README.md)` → `EOF on /dev/fd/63 after byte 52500`, exit 1 (extension, not divergence); `git show 03c1b4d:corpus/README.md | wc -l` → 565 vs baseline 537
- `git diff --numstat a89f1935 03c1b4d -- corpus/README.md` → `28	0` (28 added, 0 deleted), single hunk `@@ -535,3 +535,31 @@`
- `git show {a89f1935,03c1b4d}:corpus/README.md | sed -n '42,47p' | sha256sum` → both `4f227356…da3bb5`; same for `'183p'` → both `a6129d86…04b15b`

## F2 — counts: REPRODUCE from committed bytes at the landed rev
The round landed mid-witness as `03c1b4d` (`round-23: six routed defects as mechanical
classes; re-grounded CSRF frontier entry`); the committed README is byte-identical to
the working tree I measured (`sha256 cbedddc8…741d` both). At the landed rev both
stated counts and C2's declared counter reproduce. (Before the commit, while the note
was untracked, the working tree already gave 42/2 but `git grep … HEAD` gave 0 — the
counts were working-tree-only for that interval.)
- `ls corpus/knowledge/*.md | wc -l` → **42** and `git ls-tree --name-only 03c1b4d corpus/knowledge/ | wc -l` → **42** (README: `→ 42`)
- `git grep -cE '^\| S10[23] ' 03c1b4d -- corpus/SOURCES.md` → **2** (README: `→ 2`); rows `:116`,`:117`, both used-by → `corpus/knowledge/csrf-defense-shape-boundary.md`
- `git grep -lE '^source: S10[23] ' 03c1b4d -- corpus/knowledge | wc -l` → **1** (C2 after:1), matching the note's `source: S102`/`source: S103` lines 3-4
- `git diff a89f1935 03c1b4d -- corpus/README.md | grep -cE '^\+\| '` → 2 (header + one data row) matches "One coverage row"; `grep -c '^## Round 23' corpus/README.md` → 1

## F3 — DEFECT: the "ground was not held" command is unpinned and self-falsifying
README:556-557 prints `grep -rniE 'synchroni[sz]er token|double-submit|custom request
header' corpus/knowledge/*.md SKILL.md corpus/*.md` → `exit 1, no hits`. Rerun literally
today it exits 0 on 9 lines, every one introduced by this round's own append
(`README:546/556`, `SOURCES:117`, `csrf-defense-shape-boundary.md:4,49,50,51,55,105`).
The claim survives only pinned to the baseline revision. As written it is a receipt a
reader can run and get the opposite of; no other README block states an `exit 1`
observation, so this is new to round 23, not house style.
- `grep -rniE 'synchroni[sz]er token|double-submit|custom request header' corpus/knowledge/*.md SKILL.md corpus/*.md | wc -l` → **9**, exit **0**
- `git grep -niE 'synchroni[sz]er token|double-submit|custom request header' a89f1935 -- corpus/knowledge SKILL.md 'corpus/*.md'` → no output, exit **1** (claim true only here)
- `grep -n 'exit 1' corpus/README.md` → single hit `:557` (the sentence under test)

## F4 — DEFECT: the "only … mentions" census under-reports baseline
README:558-561 says the only CSRF/SameSite mentions are "an anti-claim, a fixture
disclaimer … and two unexercised unknowns". At baseline the stated paths carry 30
`csrf|samesite` lines over 15 files, including **7 literal `SameSite=Lax` / `sameSite
Lax` occurrences** in captured fixture bytes and a CDP record — an observed attribute,
not an anti-claim, disclaimer, or unknown. The taxonomy absence (F3's pinned arm) is
true; the census sentence is not.
- `git grep -ciE 'csrf|samesite' a89f1935 -- corpus/knowledge SKILL.md 'corpus/*.md'` → 15 files, 30 lines (largest `stateful-fixture-evidence.md:9`)
- `git grep -nE 'SameSite' a89f1935 -- corpus/knowledge` → `state-changing-matrix-r9.md:374`; `stateful-fixture-evidence.md:60,260,274,288,487,763` (+`:814` `sameSite Lax`)

## F5 — restatement: does NOT narrow (holds)
No exclusivity language ("only", "leaving", "resolved"); one item named; "the `untested
by rule` half of the round-3 anti-claim stands"; siblings (third-party JS, redirects,
POST forms) neither removed nor re-scoped. Widening-only, as claimed.
- `sed -n '548,555p' corpus/README.md`; `git diff --numstat a89f1935 03c1b4d -- corpus/README.md` → 0 deletions

## F6 — MINOR: two locators for one bullet inside the same block
README:542 calls it "the round-3 bullet at `:42-47`"; README:548 calls the same thing
"the `:42-43` bullet". The bullet spans 42–47, so the short range drops 44–47 (the
evidence-archival half) from any reader's check of "not rewritten". `claims.json`
revisions (`C2.declared wording`) says "lines 43 and 183", matching the short form.
- `sed -n '42,47p' corpus/README.md` → 6-line bullet; `sed -n '44,47p'` lies outside `:42-43`

## Remaining unknown
S102 §8.8.1 lines 2815-2824 / sha256 and S103 headings / sha256 are not checkable from
`corpus/evidence/round-23/` (holds only `c1-measurements.json`; no fetched text
committed, no URL fetch permitted this seat). Not assessed here.
