# W2Cls1 — C1 falsification, class c1-refusal-arithmetic

**Verdict:** C1's counter reproduces 6/6 classes on round-22 committed bytes and **c1's cited 23 vs derived 24 is a true positive** (13 `w2-cap-refusal-*` + 11 `w2b-cap-refusal-*`, all 24 carrying the marker), but the counter is a raw-substring scan: it misfires on a non-refusal receipt that merely quotes the cap and undercounts a reworded refusal; the item's first mutant ("cite 24 with 23 markers must clear") **fires**, which the frozen predicate requires and the item's own second clause makes unavoidable.

## Bytes read (all pinned)
- `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json` → exit 1, 6 classes, `perClass` c1..c6 = 1,1,1,1,1,2 (c6 has 2 rows); c1 `cited:"23" derived:24`. Script sha256 `6eeaeda730b32214368acd867b8c88ad49d3489ac0395948bb8fb372c9870662` (committed blob), lesson `f0f8a9c6…20893`, report `a838b5b4…9800e`, policy `b5f635af…816d`.
- `git ls-tree -r --name-only a89f1935… .ufo/waves/round-22 | grep 'cap-refusal'` → 24 files; per-wave marker counts `w2=13 w2b=11` (loop with `git cat-file -p $REV:$f | grep -q 'Background job limit reached'`) → 24/24. Citations: lesson-22.md:130 and report:180, both "23 whole-payload refusals".
- Non-author grounding already in the repo: `corpus/lessons/round-22-verifier-spotcheck.md:200-206` derives **13 + 11 = 24** by the same file listing, so the auditor's derived value matches an independent count, not its own expectation.
- Same defect at the landing commit: `node scripts/round-evidence-audit.mjs --rev fbee618b3ca313b6387192950083ef0ff47ee145 --round 22 --round-cap 128 --json` → c1 `cited:"23" derived:24`; `git log --diff-filter=A` shows the 24th receipt and the lesson landed together in `fbee618`, so the figure was wrong at the commit that published it.
- Before = 0: `git ls-tree -r --name-only a89f1935… scripts/ | grep -c round-evidence-audit` → `0`.
- Control arms: `--selftest --json` → `12 12` clean; `… --selftest --rev a89f1935… --round-cap 128` → baseline 7 findings / 6 classes, 6/6 repairs pass, each removes exactly its class (c6 removes 2 rows); `grep -nE 'round\s*===?\s*2[0-9]' scripts/round-evidence-audit.mjs` → empty; no `writeFileSync`; omitting `--round-cap` → exit 2 "fail-open".

## Mutants — `node .ufo/waves/round-23/scratch/W2Cls1/c1-mutants.mjs` (24-receipt fixture, other classes silent)
| mutant | auditor answer |
|---|---|
| baseline: 24 markers, cite 24 | `[]` clean |
| **item mutant:** 24 files / 23 markers, cite 24 | **fires** `cited 24, derived 23` — not "clears" |
| 24 files / 23 markers, cite 23 | `[]` clean (markerless receipt not counted) |
| 24 markers, lesson cites no figure | `[]` clean |
| 24 markers, cite 23 (round-22 shape) | fires `cited 23, derived 24` |
| 24 markers, stale 23 beside corrected 24 | fires on `23` (every figure checked) |
| success receipt whose `note` quotes the cap | **derived 25**, false fire |
| one refusal reworded "Background jobs limit reached" | **derived 23**, false fire |
Extra (`node …/c1-extra.mjs`): lesson correct + report cites 23 → fires; lesson adds "Round-21 saw 0 whole-payload refusals" → fires on `0`; "24 whole-payload-refusals" (hyphenated) → **no fire**.

## Findings (severity)
1. **Medium — c1 counts marker presence, not a refusal event** (`scripts/round-evidence-audit.mjs:267-273`: filename regex + `includes(REFUSAL_MARKER)` over raw bytes). A `cap-refusal-*.json` whose `result.text` is a successful spawn but whose `note` quotes the cap inflates the derived count (24→25) and fires falsely. Real round-22 receipts are `result.text`-shaped (`w2-cap-refusal-11.json`), so this is an instrument hazard, not a current miss.
2. **Medium — marker is one exact case-sensitive string.** `Background jobs limit reached` is invisible to the scan (derived 23), so an honest receipt with host wording drift produces a false "cited ≠ receipts" finding. Both 1 and 2 vanish if the count keys on `result.text` starting "Failed to start background task jobs" plus `spawnedSeats === 0`.
3. **Low — citation scope is the whole lesson and report**, not the round's Waves section: a historical "Round-21 saw 0 whole-payload refusals" inside round-22's lesson fires on `0` (mutant above).
4. **Low — hyphenated wording is a silent miss**: "24 whole-payload-refusals" does not match `\b\d{1,3}\s+whole-payload\s+refusal`, so a reworded defect escapes detection.
5. **Item/claim disagreement, not an instrument defect —** the item's "a lesson citing 24 while 23 receipts carry the marker must clear" is unsatisfiable with its own second clause ("a receipt without the capacity marker must not count") and with the frozen predicate (claims.json `revisions[5]`/`[6]`): derived must be 23, so citing 24 must fire. Measured: it fires. Either the item's expectation is inverted or the freeze is; I report the contradiction rather than resolve it.
6. **Verification gap —** the c1 green case in `--selftest` re-uses the baseline (24 markers, cite 24); the marker-vs-file distinction has no green in the shipped matrix (only my scratch fixture), and the round-21 arm is vacuous for c1 (0 refusal receipts, 0 citations), so it exercises nothing here.
7. **Integrity caveat —** the tracked script changed under me mid-audit: worktree sha256 `3fe9c326…5efdd` vs committed `6eeaeda7…70662`, `git diff` = +17/-1 inventory block in `selftest()` only; c1 logic byte-identical and all mutants reproduce. All verdicts above apply to the committed blob; the lane gate must re-run after that edit lands.

## Residual risk
- The report/policy inputs are live worktree bytes, not rev-pinned (disclosed in claims.json `revisions[1]`); only their sha256 is recorded, so a later edit silently changes c4/c6/c1's report arm until the audit is re-run.
- `extractRefusalCitations` caps at 3 digits and dedupes; a figure written as "twenty-three" or split across lines is invisible — noted, not tested.
- No tracked file, git/jj write, spawn, service, or peer message was used; all artifacts are under `.ufo/waves/round-23/scratch/W2Cls1/`. No tool installs (node v24.21.0).
