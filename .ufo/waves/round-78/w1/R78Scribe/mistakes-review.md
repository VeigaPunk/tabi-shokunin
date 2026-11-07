# mistakes-review — corpus/lessons/round-78.md §Mistakes (8 rows)

For each row: (i) is `captured-by` the criterion that should have caught it, and (ii) can the fix
fail? Row numbers are the table order (lesson lines 65-72). Evidence paths are lane-relative.

## Row 1 — `scope`: an instrument wrote its own JSON into the tree it walks

- **Captured-by.** `none at the time — QUALITY 151 (new)`. Correct: the first counter run redirected
  its `--json` into `.ufo/waves/round-78/` and the walk parsed its own half-written file
  (`lesson-proof/self-write-collision.json`: exit 1, finding `prior-set-unparsable` naming
  `probe/p1.counter.json`). QUALITY 151 exists (`corpus/QUALITY.md:1016`) and states the rule.
- **Can the fix fail? YES — demonstrated at HEAD.** The fix names only
  `run-prefreeze-gates.sh` (writes to `$HYAKU_SCRATCH`, copies `pf/out/pf-*.json` after the run).
  It does not cover the **selftest's own output**. At HEAD `d986c273`,
  `.ufo/waves/round-78/scored/selftest-r78-gates.out` is a tracked file inside the walked tree; it
  is a JSON object plus a trailing `clean=true cases=15 failed=none` line, so it does not parse.
  Measured: the counter on the scored receipt exits **1** with `prior-set-unparsable` naming that
  file (`.ufo/waves/round-78-seats/R78Scribe/counter-scored.json`), and
  `node scripts/selftest-r78-gates.mjs --selftest` exits **1**, 7 of 15 cases failing, all on
  `prior-set-unparsable` (`selftest-now.out`). The L1 has since moved the file out of the walked
  tree (uncommitted `D`; `git status`), after which the counter exits 0 clean 186 and the selftest
  exits 0 15/15 (`counter-scored-rerun.json`, `selftest-rerun.out`). The fix is a manual move, not
  an enforced rule: re-running the selftest with the old redirection reproduces the refusal. The
  criterion's green state (QUALITY 151) also names only `run-prefreeze-gates.sh`, so it does not
  cover this instrument. Proposed fix: the selftest's output path is a caller redirection; the
  gate registry should name a path outside the walked trees (e.g. `.ufo/waves/round-78-seats/`), and
  QUALITY 151's green state should say "every instrument whose output lands in the lane, including
  the selftest".

## Row 2 — `survivor`: the walk's exemption is a PATH, the battery keeps the source out of the prior set

- **Captured-by.** `the battery's own extra rule (QUALITY 131: every unexpected id fails the case)`.
  Correct: the battery's refusal case passes only when exit 1, the expected id present, and no other
  id except `alsoAllowed` (`scripts/negatives-filechooser-r78.mjs:552-556`); the evidence
  `lesson-proof/prior-set-path-exemption.txt` records `cases 378 passed 13 allOk false
  coverageGap 15` and "every case therefore also reported prior-set-complete".
- **Can the fix fail? YES, by misuse.** The fix is `--tree-exempt <source receipt>` plus the
  selftest case `tree-exempt-absent`. The flag is caller-declared and unconstrained: the counter
  exempts any real path passed to it (`check-filechooser-r78.mjs:293-294`), so a caller can hide an
  arbitrary schema receipt from `prior-set-complete` by passing it as `--tree-exempt`. The selftest
  only proves the no-flag refusal; it cannot prove a wrong exemption is refused (the counter has no
  way to distinguish a legitimate source receipt from one that should be a prior). The lesson's
  row says the flag is "used only by the pre-freeze harness/gates"; in fact the **battery** is its
  only user (`negatives-filechooser-r78.mjs:531`), and `run-prefreeze-gates.sh` passes none —
  QUALITY 153's green state says "`--tree-exempt` passed by the battery only". The note §5
  misattributes it to the harness (see note-review §5). Proposed limit sentence: "the exemption is
  a caller-declared path; the counter cannot tell a legitimate source receipt from a receipt that
  should be in the prior set, so the exemption is a trust boundary, not a check."

## Row 3 — `stale-premise`: 34 R77Mut1 witnesses imported by presence, not kind

- **Captured-by.** `none — QUALITY 154 (new) refuses such a set before any run`. Correct: the
  battery refuses a refusal case with no expected id at build time
  (`negatives-filechooser-r78.mjs:523`: `usage('refuse case … declares no expected finding id')`),
  and the evidence `lesson-proof/witness-import-crash.txt` has the verbatim
  `TypeError: Cannot read properties of null (reading 'startsWith')` at `lineOf`.
- **Can the fix fail? No for the stated class.** A refusal case with a *missing* expect is refused;
  a refusal case with a *wrong but non-null* expect runs and fails the case (the counter will not
  list it), which is a normal red case, not a crash. A must-accept witness misclassified as a
  refusal with a non-null expect also fails at run. The guard is sound. One stale number: the row
  says "the corrected set runs 398/398"; the final frozen battery is **397 cases**
  (`scripts/negatives-filechooser-r78.mjs` sha256 `74102f20…`, `d986c273`), and the committed
  scored battery output is still the 398-case run (see row 8). Proposed wording: "the corrected set
  ran 398/398 at the time; the frozen set is 397 cases."

## Row 4 — `number-drift`: bulk rename missed template-string ids

- **Captured-by.** `the battery's coverage rule (QUALITY 132) — it caught it before the freeze`.
  Correct: the coverage rule is `coverageGap = listed.filter(id => !covered.has(id))`
  (`negatives-filechooser-r78.mjs:579`) and `allOk` requires `coverageGap.length === 0`; QUALITY 132
  exists (`corpus/QUALITY.md:970`).
- **Evidence cell has no artifact.** The row says "first battery coverage summary `coverageGap`
  listed all 15" but names no file. The only committed artifact with `coverageGap 15` is
  `lesson-proof/prior-set-path-exemption.txt:2`, which records the **count** (15), not the 15 ids,
  and belongs to row 2. The lesson's sweep line ("`ls .ufo/waves/round-78/lesson-proof/` (every red
  state above)") is therefore false for this row: no lesson-proof file records the 15 ids. Proposed
  fix: commit the first coverage summary (or its `coverageGap` array) as
  `lesson-proof/coverage-gap-15.json`, or change the evidence cell to cite
  `prior-set-path-exemption.txt:2` and say "the count, not the ids".
- **Can the fix fail? No for the stated class.** The per-leg generator emits `opened-mode` and
  `opened-node-cross` cases for every leg (`negatives-filechooser-r78.mjs:401-404`); a new check id
  without a case is caught by the coverage rule. The final battery's `coverageGap` is `[]` on the
  receipts I checked (pf/out and the R78Exec2 batteries); the final 397-case run on the new scored
  receipt also has `coverageGap []` (`c1-negatives-a.json`), so the coverage rule still holds even
  though two cases fail (row 8).

## Row 5 — `scope`: the r78 receipt's cross-generation prior was initially absent

- **Captured-by.** `QUALITY 138/140 (prior set carries every committed receipt of the shape)`.
  Correct: QUALITY 138 (`corpus/QUALITY.md:988`) and 140 (`:994`) exist; the evidence
  `lesson-proof/c1-nowork.json` is the r77 receipt under the r78 counter with **9 findings**
  (`schema`, `nonce-shape`, `nonce-expected`, `receipt-fields`, `driver-pin`, `fixture-hash`,
  `frame-tree`, `fixture-descriptors`, `mode-law`) and a 10-line prior set — no replay source, as
  the row says.
- **Can the fix fail? Partly.** The r77 scored receipt is now in `prior-set.txt` (11 lines; the
  r77 row is the 11th). The counter's completeness walk covers only `.ufo/waves/round-78` and
  `corpus/evidence/round78`; the r77 receipt is outside both, so its presence is a property of the
  committed prior-set file, not of the walk. A caller who passes a different `--prior-set` without
  the r77 row loses the cross-generation prior and the counter cannot see it. The selftest's
  `needsOk` checks the committed set has 10 r78 receipts and 11 lines, so the committed path is
  guarded; the gap is the counter's declared limit, not a bug.
- **Stale number.** The row says "the honest p1/s1 counters stay clean with **9 priors each**". The
  committed `pf/out/pf-p1.counter.json` and `pf-s1.counter.json` have `priorSet.length 10`
  (`priorSetFile.lines 10`): 9 r78 priors + the r77 receipt. The "9" was the count before the r77
  append; after the append it is 10. Proposed wording: "10 priors each (9 r78 + the r77 receipt)".

## Row 6 — `survivor`: a carried bracket derived by small shifts over-counted

- **Captured-by.** `QUALITY 149 (the placement guard states the decisive property and fails closed)
  — it caught both`. Correct: QUALITY 149 exists (`corpus/QUALITY.md:1018`); the evidence
  `lesson-proof/bracket-accept-overshoot.json` has the verbatim
  `bracket misplaced: abs 40 (need 40) gap 4 (need 9) want 39 / <9` on p3/s2, and the second
  `witness-accept-own-gap-50.0` duplicate on p2/p3/p4.
- **Can the fix fail? No for the stated class.** `keepExactFar` moves non-kept events by
  `1000 + 7*i` ms (no coincidence on the 0.1 ms grid), and the refuse side uses
  `placed(p, 'need', …)` which throws unless `absMatched >= absNeed`
  (`negatives-filechooser-r78.mjs:276-286`). The guard fails closed. One dangling citation: the
  evidence's `fix` says "QUALITY 149/155"; QUALITY has no row 155 (the file ends at 154). Proposed
  fix: cite 149 only, or add the missing row.

## Row 7 — `stale-premise`: the driver fork carried r77's literal backendNodeIds

- **Captured-by.** `the round's own leg (b) (cold-run acceptance) caught it before any scored
  verdict; QUALITY 150 covers the rule but not the producer layer`. Correct: the evidence
  `lesson-proof/driver-shape-id-pin.json` records the first post-D cold run (nonce
  `tabi-r78-cold1-5e78b9f133d8`) with driver exit 1 and counter finding `producer-verdict`, the only
  per-leg diff `pick-multiple` `opened` want `[["selectMultiple",7]]` got `[["selectMultiple",10]]`.
  QUALITY 150 exists (`corpus/QUALITY.md:1020`).
- **Can the fix fail? Latent yes.** The driver's `LEG_SHAPE` now carries modes only and the
  predicate compares `modeShape(...)` (`scripts/chrome-cdp-filechooser-round78.mjs:441-470`), so the
  producer layer is fixed. But the **counter's** `SHAPE` still carries literal ids
  (`check-filechooser-r78.mjs:127-145`: `opened: [[mode, 5]]`, `[[mode, 7]]`, `[[mode, 14]]`,
  `[[mode, 18]]`), and the per-leg check compares only `d.opened.map(x => x[0])` (`:474`). The
  literals are dead today, but a future edit that compares `opened` wholesale would reintroduce the
  r77 pin in the counter, and the battery's `leg-*-opened-mode` case only mutates modes. Proposed
  fix: drop the id from the counter's `SHAPE` (store `opened: ['selectSingle']`) or add a comment
  that the second element is unread; the battery cannot catch a re-tightening it does not test.

## Row 8 — `survivor`: replacing a fragile accept case removed the TOL witness

- **Captured-by.** `QUALITY 143 (every tolerance bracketed on both sides) read through kill power's
  survivor list — it caught it`. Correct: QUALITY 143 exists (`corpus/QUALITY.md:1004`); the
  evidence `lesson-proof/tol-witness-loss.txt` records 76 semantic mutants, 75 killed, survivor
  `M-timeline-tol-0.06`, `holds:false`.
- **Can the fix fail? The witness itself is sound; the final-state claim is stale.** The fix
  `accept-prior-retimed-0.051-scattered` uses `keepScattered(p, absNeed, 0.051)`, which adds the
  shift **without** `q()` (`negatives-filechooser-r78.mjs:426`), so the events sit 0.051 ms out:
  below `TOL 0.05` they do not match (accept), at `0.06` they match `absNeed` (refuse). The kill
  power output `scored/c1-killpower-a.json` (15:13) has `holds true`, `semantic 76/76`, and the
  `M-timeline-tol-0.06` mutant is killed. But:
  - The row's last words "kill power holds" are **false at the final frozen bytes on the current
    scored run**. The final battery (397 cases, `74102f20…`) fails two cases on the new scored
    receipt (`replay-timeline-own-gap-49.9`, `replay-timeline-too-few-gaps`), so the unmutated
    baseline is not clean and kill power reports `holds false` with `survivors []`
    (`.ufo/waves/round-78-seats/R78Exec1/kill-power-a.json`, 15:26). The committed 15:13 output is
    from the old battery/kill-power bytes.
  - The two failing cases are the **own-gap** brackets, not the TOL witness: the new scored receipt
    has **12** `>= 50 ms` gaps (my computation over its 79 events: 54.1, 317.3, 303.3, 313, 303.1,
    302.1, 337.7, 332.9, 305.4, 315.4, 2128.3, 340.5), while the cases assume the receipt has
    exactly `MIN_OWN_GAPS = 11` gaps: shrinking one gap to 49.9 leaves 11 (still >= 11) so the
    counter accepts, and the `too-few-gaps` case leaves 11 and only fires `event-leg-window`. On the
    11-gap PRE receipts the same cases refuse. This is the receipt-dependent-guard class QUALITY 149
    warns about, and the final battery was run on a receipt with 12 gaps. Proposed fix: derive the
    own-gap brackets from the receipt's own `nGap` (e.g. shrink `nGap - MIN_OWN_GAPS + 1` gaps, or
    assert `nGap === MIN_OWN_GAPS` at build time and refuse otherwise), and re-run the battery on
    the scored receipt before claiming leg (c).

## Not captured by any row

The final-state battery failure above is a new red state not in the table. The lesson's sweep line
says `ls lesson-proof/` shows "every red state above"; it does not show this one (the failing
battery output is `scored/c1-negatives-a.json`, not a lesson-proof file). Proposed addition: a row
`survivor`/`stale-premise` — "the own-gap brackets assume the receipt has exactly 11 gaps; the
scored receipt has 12, so the final battery fails 2 cases on it and kill power's baseline is not
clean" with evidence `scored/c1-negatives-a.json` and `R78Exec1/kill-power-a.json`.

## Summary

| row | captured-by correct? | fix can fail? |
|---|---|---|
| 1 scope self-write | yes (QUALITY 151) | **yes — selftest output at HEAD; demonstrated** |
| 2 survivor path exemption | yes (QUALITY 131) | **yes — exemption is unconstrained; harness misattributed** |
| 3 stale-premise witnesses | yes (QUALITY 154) | no; stale "398/398" (final 397) |
| 4 number-drift coverage | yes (QUALITY 132) | no; **no evidence artifact for the 15 ids** |
| 5 scope cross-gen prior | yes (QUALITY 138/140) | partly (prior-set file is the only guard); "9 priors" → 10 |
| 6 survivor bracket | yes (QUALITY 149) | no; dangling "QUALITY 155" |
| 7 stale-premise driver | yes (leg b + QUALITY 150) | latent — counter SHAPE still carries literal ids |
| 8 survivor TOL witness | yes (QUALITY 143) | witness sound; **"kill power holds" false at final bytes (battery 2 failures)** |
