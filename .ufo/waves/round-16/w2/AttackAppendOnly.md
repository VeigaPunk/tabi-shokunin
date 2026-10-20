# AttackAppendOnly — append-only discipline across `e38d259` → `b444ca8`

Lane: tabi-shokunin, round-16 wave 2 (falsify), reviewer seat `TabiR16.AttackAppendOnly`.
Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` ("counter repair"),
parent `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` ("gate + WebMCP"), parent `e38d2599a922cb729186353830fff8e159b4fef0`
(round-15 verifier spot-check). All commands below were run at lane root; nothing under the lane was
modified except this report. No tools installed or upgraded.

## Item — append-only discipline (one item)

Claim attacked: the six living/history documents are append-only over the measured range —
`LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`
(with `SOURCES.md` permitting exactly one in-place line: S020, restricted to `status` and `used-by`) —
and no historical evidence/lesson file changed.

### Verdict: HOLDS

Every pre-existing byte of the five text documents is preserved as an ordered subsequence; four of the
five are literal byte prefixes. `LOG.md` and `SCORECARD.md` are byte-identical across the range (no
append has happened yet — draft only). `corpus/SOURCES.md` has exactly one replaced pre-existing line,
the S020 row, and exactly its `status` and `used-by` cells differ. No deletion, rename, copy or
mode-change exists anywhere in the range; no historical evidence or lesson file is modified or added.

## Command / observed evidence

### 1. Change set and change types

```
$ git rev-parse e38d2599a922cb729186353830fff8e159b4fef0 b444ca8e024f386124418169e8e400221524bba3
e38d2599a922cb729186353830fff8e159b4fef0
b444ca8e024f386124418169e8e400221524bba3

$ git log --format='%h parents=[%p]' -3 b444ca8
b444ca8 parents=[8f7feb3]
8f7feb3 parents=[e38d259]
e38d259 parents=[36240c7]
```
Linear two-commit range, no merges.

```
$ git diff --stat e38d259 b444ca8
144 files +46977 -2
```

```
$ git diff --name-status e38d259 b444ca8 | grep -v '^A'
M	SKILL.md
M	corpus/QUALITY.md
M	corpus/README.md
M	corpus/SOURCES.md
```

140 additions, 4 modifications, 0 others. The only two deleted lines in the whole range are the two
`-1` entries in `SKILL.md` and `corpus/SOURCES.md` analysed below.

```
$ git diff --name-status --diff-filter=DRC e38d259 b444ca8 | wc -l
0
$ git diff --summary e38d259 b444ca8 | grep -v 'create mode'
NONE
```
No deletions, renames, copies, or file-mode changes.

### 2. Named files, exact deltas

```
$ git diff --numstat e38d259 b444ca8 -- SKILL.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md LOG.md SCORECARD.md
50	1	SKILL.md
13	0	corpus/QUALITY.md
20	0	corpus/README.md
13	1	corpus/SOURCES.md
```
(no rows for `LOG.md` / `SCORECARD.md` — no diff)

Byte-identity / prefix proof (blob bytes, not diff heuristic):

```
$ python3  # git show <rev>:<path> byte comparison
SKILL.md:            identical=False prefix=True  len=147204->151055
corpus/QUALITY.md:   identical=False prefix=True  len=5956->6957
corpus/README.md:    identical=False prefix=True  len=32121->33534
LOG.md:              identical=True               len=76480->76480
SCORECARD.md:        identical=True               len=59896->59896
```

Appended suffixes, start and end:

```
SKILL.md          appended 3851 bytes: b'\n\n## Round 16 \xe2\x80\x94 measurement binding and native WebMCP observation (2' ... b'ternal site without operator approval |\n'
corpus/QUALITY.md appended 1001 bytes: b"22. A claim's count binds the counter blob sha256 at its measured revi" ... b'nsus U3 `navigator.modelContext` guess)\n'
corpus/README.md  appended 1413 bytes: b'\n## Round 16 \xe2\x80\x94 native WebMCP held on Chromium 154 loopback (2026-10-' ... b'rate/rights and real-site\njourney rows.\n'
```

`SKILL.md`'s single `-` line is a line-terminator artifact, not an edit: the pre-existing file had
**no trailing newline** (old EOF bytes end `...policy.` with no `0a`; `new.startswith(old)` is `True`
and the appended suffix begins `\n\n## Round 16`). The old byte stream is a strict prefix of the new
one; git therefore re-renders the last line as `-`/`+`.

Ordered-subsequence check (old lines must appear, in order, in the new file):

```
SKILL.md: ordered-subsequence violations=0  new_lines=49
corpus/QUALITY.md: ordered-subsequence violations=0  new_lines=13
corpus/README.md: ordered-subsequence violations=0  new_lines=20
```

```
$ git rev-parse e38d259:LOG.md b444ca8:LOG.md e38d259:SCORECARD.md b444ca8:SCORECARD.md
ec2798b3d4c5923e709b4726d264e340653282a6   (LOG.md @ e38d259)
ec2798b3d4c5923e709b4726d264e340653282a6   (LOG.md @ b444ca8)
1f584ef3f17151247686fe350892d0096da827a9   (SCORECARD.md @ e38d259)
1f584ef3f17151247686fe350892d0096da827a9   (SCORECARD.md @ b444ca8)
```

### 3. `corpus/SOURCES.md` — the one sanctioned in-place line

Hunks:

```
@@ -34 +34 @@      (S020 replaced)
@@ -43,0 +44,10 @@  (S030..S039 added)
@@ -50,0 +61 @@
@@ -64,0 +76 @@
```

Cell-by-cell comparison of old vs new S020 row (13 pipe-separated cells incl. empty borders; header
`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`):

```
cell0..7  : SAME
cell8     : CHANGED   status     queued -> mined
cell9,10  : SAME      opened 2026-10-19, recheck on-release
cell11    : CHANGED   used-by    — -> corpus/knowledge/webmcp-chromium-loopback-round-16.md
cell12    : SAME
```
Exactly `status` and `used-by`, no other cell. The `anchor` cell keeps `CG-DRAFT 2026-10-16, revision f14762e6`.

Every other pre-existing `SOURCES.md` line is present and ordered:

```
$ SOURCES non-S020 old lines missing: 0
$ SOURCES order violations: 0
```

Rows S030–S039 land after S029 (new lines 44–53); 39 registry rows, zero duplicate ids:
```
$ git show b444ca8:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3}'
39
$ ... | grep -oE '^\| S[0-9]{3}' | sort | uniq -c | awk '$1>1'
(empty)
```
The 2026-10-20 S020 re-open is recorded in an **appended** log bullet (new line 76), not by editing
line 34's `opened` cell.

### 4. No historical evidence / lesson file changed

```
$ git diff --name-status e38d259 b444ca8 -- corpus/lessons corpus/knowledge
A	corpus/knowledge/webmcp-chromium-loopback-round-16.md

$ git diff --name-status e38d259 b444ca8 -- corpus/evidence | grep -v 'round-16'
NONE

$ git diff --name-only e38d259 b444ca8 -- .ufo | grep -v 'waves/round-16/'
NONE

$ git diff --name-only --diff-filter=A e38d259 b444ca8 | grep -E 'round-([0-9]|1[0-5])[/-]|lessons/'
NONE
```

Historical counter pins are byte-identical at both revisions:

```
corpus/evidence/round-12/measurements.json  d447e951da939d2fb32c9ed3bac9002aed267418  (both revs)
corpus/evidence/round-13/measurements.json  0f1df4e49dbd836c24191a41432b8c5b35306fc7  (both revs)
corpus/evidence/round-14/measurements.json  b1d49395d9e4bc027234e40d421b764ec1cfd56f  (both revs)
corpus/evidence/round-15/measurements.json  e45d4a2a23bde7a2b2dcdc1c723172990af27f42  (both revs)
```

Touched-path census (everything is round-16 or the named living docs):
```
    18 corpus/evidence        (all corpus/evidence/round-16/**)
     1 corpus/knowledge       (new round-16 note only)
     1 corpus/QUALITY.md
     1 corpus/README.md
     1 corpus/SOURCES.md
     1 scripts/check-measurement-binding.mjs       (new)
     1 scripts/selftest-measurement-binding.mjs    (new)
     1 scripts/webmcp-loopback-round16.mjs         (new)
     1 SKILL.md
   118 .ufo/waves                                   (all .ufo/waves/round-16/**)
```

Per-commit isolation (no modify-and-revert of history inside range):

```
$ git diff --name-status e38d259 8f7feb3 | grep -v '^A'
M	SKILL.md
M	corpus/QUALITY.md
M	corpus/README.md
M	corpus/SOURCES.md
$ git diff --name-status 8f7feb3 b444ca8 | grep -v '^A'
M	.ufo/waves/round-16/measure.mjs
```

## Findings

**No BREAK.** No violation of the stated append-only contract was found in the committed range.

Observations (not breaks of this item, handed forward):

1. **`LOG.md` and `SCORECARD.md` were not touched at all** (`ec2798b3…` / `1f584ef3…` identical at both
   revs). Append-only holds vacuously. The round-16 entries exist only as
   `.ufo/waves/round-16/drafts/DraftLog.md` and `DraftScorecard.md` ("L1 integrates"), so the snapshot
   `b444ca8` carries **no** committed journal/scorecard record of the C1/C2 flips. That is a
   completeness/integration question for the L1 seat, not an append violation — and any future append
   must respect the same discipline verified here.
2. **`SKILL.md` is a byte-prefix append** despite `git diff --stat` reporting `50 +, 1 -`: the old file
   lacked an EOF newline, which the append added. No pre-existing text changed; the "deletion" is a
   diff rendering of the terminator, verified at byte level above.
3. **`corpus/SOURCES.md` line 34 is the sole in-place replacement**, and its changed cells are exactly
   `status` (`queued`→`mined`) and `used-by` (`—`→knowledge note) — the sanctioned exception. The
   `opened` cell remains `2026-10-19`; the 2026-10-20 re-open is recorded in an appended bullet, which
   keeps the row invariant intact.
4. **Working tree is not identical to the measured commit**: `git status --porcelain` at HEAD=`b444ca8`
   shows untracked `corpus/evidence/round-16/measurement-binding.json` and `??
   .ufo/waves/round-16/w2/` (this wave's reviewer/assignment area, incl. this report). The untracked
   receipt is outside the commit and is not part of the range verified here; anyone re-measuring must
   bind to the commit/tree, not the dirty worktree.
5. `b444ca8` modifies `.ufo/waves/round-16/measure.mjs`, a round-16 instrument added in `8f7feb3`. It is
   not historical evidence and does not violate this item, but it is the instrument edited in the same
   commit that flips the counters — cross-referenced to the counter lanes (MutCounterFailed,
   MutCountNotReproduced); the retained first-run-0 receipt is what makes that auditable.

## Residual risk / verification gaps

- Proof is over committed state only: `git diff` + blob byte comparison. Untracked or ignored files
  (see observation 4) are outside its coverage; the lane was not modified to probe them.
- I verified *structure* (nothing pre-existing was rewritten) and not the *truth* of appended prose
  (e.g. that S030–S039 were actually opened on 2026-10-20, or that the WebMCP note's claims hold) —
  those belong to the source-scope and C2 receipt lanes.
- S020's `anchor` cell still says revision `f14762e6` (2026-10-16) while `status` is now `mined`. This is
  contract-compliant (the invariant forbids other in-place cell changes) but means any newer revision
  observed at the 2026-10-20 re-open is not in the row; flagged as a source-accuracy residual, not an
  append violation.
- No mutation probe was run against `check-sources.mjs`/append checkers; this item is a direct
  repository-state verification, not a gate-behaviour test.
