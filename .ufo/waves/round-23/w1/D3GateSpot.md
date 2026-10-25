# D3 — ground truth for `c3-gate-spotcheck`

**Verdict:** CONFIRMED. At baseline `a89f1935f523a64b00991d792fca6a8c0d321948` the round-22
lesson's `## Gate` is lines 13–69 (57 lines, LF only) and contains zero spot-check rows and zero
owed-to-closure lines; the only deferral text sits at `## Honest bounds` :150. Rule R3S below
trips round-22 and clears round-21 plus every committed green control.

## 1. Derived facts (command → observation)
1. **Section bounds.** `grep -n '^## ' corpus/lessons/round-22.md` → `13:## Gate`, `70:## Mistakes`,
   `121:## Waves`, `146:## Honest bounds`; so Gate = `13..69`. Same at the rev:
   `git show a89f193:corpus/lessons/round-22.md | grep -n '^## '` → identical `13/70/121/146`.
2. **Absence inside Gate.** `sed -n '13,69p' corpus/lessons/round-22.md | grep -ci spot` → `0`;
   `... | grep -ci owed` → `0`. File-wide the same: `grep -ci spot` → `0`, `grep -ni owed` → no match.
3. **Deferral is outside the section** (why section-bounding is mandatory):
   `sed -n '13,69p' ... | grep -ci closure` → `0`, but `grep -ni closure` file-wide → `:88` and `:150`
   ("non-author closure and any SHONEN promotion remain with the round's verifier"). A file-global
   `closure` test would falsely clear round-22.
4. **The bytes are committed.** `git cat-file -e a89f193:corpus/lessons/round-22.md` → exit 0.
5. **Requirement and route.** `corpus/lessons/round-22-verifier-spotcheck.md:212-214` (routed defect 3,
   status-neutral): `LEARNING.md` §Files requires the Gate section to carry "the spot-check result";
   next round must append the result "or an explicit 'owed to closure' line naming it".
6. **Green shapes exist in history.** `awk -f rule3.awk corpus/lessons/*.md` → 48 files, 32 CLEAR,
   16 FINDING; round lessons clearing inside Gate: 1:46, 2:52, 3:60, 4:76, 5:108, 6:123, 7:139,
   8:206, 9:212, 10:216, 12:36, 13:17, 14:15, 15:14, 20:29.
7. **Prior instances.** Same run: R3S finds rounds 16, 17, 18 as well as 22 (each has a committed
   `round-N-verifier-spotcheck.md` at the rev and no Gate mention) — c3 is not a round-22 special case.
8. **Round-21 clears only by scope.** `git cat-file -e a89f193:corpus/lessons/round-21-verifier-spotcheck.md`
   → absent, and `grep -niE 'spot|owed' corpus/lessons/round-21.md` → empty; unscoped R3 flags
   round-21 (`## Gate` 10..103). So the C1 control "round-21 yields 0" holds only under R3S.

## 2. Minimal deterministic rule (committed bytes only)

```
lesson   = git cat-file blob <rev>:corpus/lessons/round-<N>.md          # missing -> FINDING, cited=null
verifier = git cat-file -e  <rev>:corpus/lessons/round-<N>-verifier-spotcheck.md
inGate=false; hit=null
for (nr, line) in lesson.lines:                       # ^##[ \t]+Gate([ \t-]|$) opens
  if line ~ /^##[[:space:]]+gate([[:space:]-]|$)/i: inGate=true;  continue
  if line ~ /^##[[:space:]]/            : inGate=false; continue   # only H2 closes Gate
  if inGate and disclosure(stripInlineCode(line)): hit ||= nr      # first hit wins
disclosure(t) = t ~ /spot[- ]?check/i  or  t ~ /owed[- ]to[- ]closure/i
finding c3  iff  verifier exists  and  hit == null      # fail-closed: absent Gate heading = no hit
evidence = {cited:"corpus/lessons/round-22.md:13-69", derived:{gateBounds:[13,69],
            spotCheckLines:[], owedLines:[], nearestDeferral:"…:150", scopedBy:verifier}}
```
Determinism: pure line scan of one blob plus one existence probe; no clock, no network, no env.

## 3. Fixtures (all executed with `awk -f rule3.awk <fixture>`)

- **RED-1** `scratch/D3GateSpot/red-no-line.md` (Gate with counts only) → `FINDING`.
- **RED-2** `red-line-outside-gate.md` (line moved into `## Honest bounds`) → `FINDING`.
- **RED-3** `red-filename-only.md` (Gate cites `` `round-22-verifier-spotcheck.md` ``) → `FINDING`.
- **RED-4** `r12-noline36.md` (real round-12 with `:36` deleted) → `FINDING`, while the naive
  `grep -qiE 'spot.?check' r12-noline36.md` → `CLEAR` (false clear at the backticked `:84` path).
- **GREEN-1** `green-line.md` (line-initial `- Spot-check (non-author — verifier): …`) → `CLEAR :7`.
- **GREEN-2** `green-owed.md` (`- Owed to closure: …`) → `CLEAR :7`; **GREEN-3** `green-bold.md`
  (`**Spot-check**: …`) → `CLEAR :5`. Committed green: `round-8.md:206`, `round-15.md:14`.
- Auditor selftest mapping: red = round-22-shaped blob, green = same blob plus one disclosure line,
  plus RED-3 (backticked path only) so the code-span strip is itself mutant-covered.

## 4. Brittleness (named, not hidden)

- **Scope dependency (B1).** Without the verifier-file probe, round-21 trips; the probe is a policy
  choice (a spot-check can only be "owed" to a verifier that exists), not a property of the text.
- **File-global matching (B2).** `:150` deferral and `:88` "closure" prose lie outside Gate; proven.
- **Backticked paths (B3).** Without `stripInlineCode`, a Gate citing a verifier filename clears.
- **Line-initial variant R0 is stricter and false-positives** `round-15.md:14` ("Current independent
  admit/reject spot-check …" mid-line); mid-line "Spot-check:" pointers exist (`round-18.md:84`, in
  `## Corrections`, so not a false positive there). R3 (strip, then match anywhere) is preferred; its
  error direction is over-flagging only when the token survives code-stripping but names no verdict.
- **Heading literalness (B4).** `## The gate — how the branch was read (measured)` (`round-8.md:24`,
  `round-10.md:36`) does not open the section; `###` subsections do not close it, so a disclosure in a
  `### Routed defects` block counts as inside Gate.
- **Shape, not content (B5).** `round-12.md:36` ("pending orchestrator closure") clears the rule; the
  rule cannot tell a verdict from a pending notice, and grading that is not a mechanical property.
- **Code fences are not stripped (B6).** A disclosure-shaped line inside a fenced example counts.
- **Fail-closed choices to fix in the API (B7).** Missing lesson blob and missing Gate heading must be
  `finding` with `cited:null`, not exit 2 (exit 2 stays for git/IO failure). A first draft using `\b`
  matched nothing under gawk 5.4.1 (`\b` = backspace); the shipped rule uses `[[:space:]]`/`([^A-Za-z]|$)`.
- No tool installs were needed; all figures come from `git cat-file`/`git show`, `sed`, `grep`, `awk`.
