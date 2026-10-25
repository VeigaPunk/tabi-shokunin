# W1 · RevClaimsSeparability — C1/C2 separability and trend honesty

**Verdict:** the two claims are artifact-disjoint and neither can launder the other — but C1 does **not**
verify today (the frozen round-21 control trips `c3-gate-spotcheck`), and three frozen wordings (`classes:6`,
C1 `before: 0`, C2's `git grep -l` counter) let the report claim credit no measurement earned. Fix the c3
matcher, add a new-file/row-content check to C2, and write the matrix below.

## Axes

| Axis | Moved by | Condition |
|---|---|---|
| operability (scalar 8) | C1 only | 6 distinct classes **with** red/green per class **and** the round-21 arm clean; scalar 8→8 |
| coverage (scalar 9) | C2 only | 1 admitted entry; scalar stays 9 (`notClaimed`: no scalar promotion) |
| expansion (trend) | C2 only | LEARNING.md:33 — *admitted entry on ground the coverage map did not hold, citing a `mined` row*. C1 is a capability, not ground |
| quality (trend) | neither alone | only if the auditor is failure-capable on committed bytes **and** the entry's quotes locate |
| discernment (trend) | no one this round | every seat is lane-dispatched; non-author spot-check owed to closure |

## Separability (measured)

1. **No shared input.** `grep -cE 'corpus/knowledge|SOURCES' scripts/round-evidence-audit.mjs` → `0`. C2 refused
   ⇒ C1's six classes are untouched; C1 short ⇒ C2's counter is untouched (different command, different tree).
2. **Only the report is shared.** C1's classes read lane wave bytes at `--rev`; C2 reads `corpus/knowledge`
   and `corpus/SOURCES.md`. Separate files, separate commands, separate failure causes.

## Live counterexample — C1's declared control fails

`node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 21 --json`
→ exit `1`, `findings: 1`, `findingClasses: ["c3-gate-spotcheck"]`. claims.json's control says round-21 "must
not yield the round-22 classes at all". Cause: the matcher wants the literal `owed to closure`, but round-21
already discharges the duty in other words inside `## Gate` —
`git show HEAD:corpus/lessons/round-21.md | sed -n '/^## Gate/,/^## Mistakes/p' | grep -ciE 'non-author|verifier|closure|spot'` → `3`
("No non-author admit/reject agreement is asserted … belong to the parent/non-author verifier"), while
`… round-22.md … | grep -ciE 'non-author|verifier|closure|spot'` → `0` (round-22's deferral sits in
`## Honest bounds`, not `## Gate`). **Smallest safe correction:** match the deferral semantically inside
`## Gate` (`spot-check|non-author|verifier|closure|owed`) — round-21 clears, round-22 still trips, and the
defect is not weakened to a string test. Also: `classes: 6` is a constant (`scripts/round-evidence-audit.mjs:337-338`)
— only `findingClasses`/`findings` is a measurement.

## Verdict matrix the report must be able to write

| # | C1 (6/6 + controls) | C2 (entry admitted) | operability | coverage | expansion | quality | discernment |
|---|---|---|---|---|---|---|---|
| A | pass | pass | **improved** (capability, scalar 8→8) | 9→9, +1 admitted entry | **improved (bounded)** documented-upstream, no measured observation | improved only if auditor + quotes are failure-capable | unchanged, owed to closure |
| B | pass | fail | **improved** | unchanged (0 admitted) | **unchanged** — name the refusal class (absent quote vs unreachable), never "fabricated" | improved (auditor only) | unchanged |
| C | fail | pass | **unchanged / honest stop**, scalar 8; the removed class named; no 5-of-6 credit | 9→9, +1 admitted entry | **improved (bounded)** | unchanged (partial auditor is not a capability) | unchanged |
| D | fail | fail | **unchanged** | unchanged | **unchanged** | unchanged | unchanged |

Required sentences: (B) "C1 verifies independently of C2; expansion is unchanged because no entry citing a
row first opened this round exists." (C) "C2 admitted one documented-upstream entry; operability is unchanged
because class X missed its target and was removed per the kill rule." (D) "No axis moved; both claims
honest-stop." A fourth sub-case must be named: C1 at 6/6 **with the control tripping** is case C.

## claims.json wording that would let the lane claim unearned credit

- **W1 — `before: 0`.** Now that the script exists, the counter at the baseline rev already answers 6:
  `node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --json`
  → 6 classes, exit 1. So "before" is *capability absent*, not a measured 0; and `node` on the absent path
  exits `1` (MODULE_NOT_FOUND), colliding with the API's "1 = any finding".
- **W2 — vacuous control.** `git ls-tree -r --name-only HEAD -- .ufo/waves/round-21 | grep -cE 'cap-refusal|attempt'`
  → `0`, so the round-21 arm is *not-applicable* for c1/c4 and real only for c2/c5/c6. Writing "round-21
  clean" without the per-class applicability is a false green.
- **W3 — `classes: 6` is a constant** (`:337-338`), not a result. Quote `findingClasses`, not `classes`.
- **W4 — C2 counts files, not admissions.** `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge | wc -l`
  → `0` today; appending one `source:` line to an **existing** note also yields `1`, and one of the two rows
  suffices. Add `git diff --diff-filter=A --name-only <baseline> <tip> -- corpus/knowledge` (new entry) and a
  row test (document URL, `opened 2026-10-25`, ≤25-word quote located in retained bytes).
- **W5 — id identity.** `merge/tabi/SOURCES.append.md` already names `S102` = CDP contribution README and
  `S103` = `chrome.debugger` reference, both `opened 2026-10-23`
  (`grep -c '2026-10-23' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` → `84`). "Re-pointed by
  document" must be recorded as an explicit map (S102 := rfc6265bis-13 §8.8.1, S103 := OWASP CSRF sheet,
  both opened 2026-10-25) or the ledger will join S102 to the wrong document and the counter still says 1.
- **W6 — C2 has no `failureCapable`.** Its control has no command, and "refused by the scratch census gate"
  names a different instrument. Do not call C2 failure-capable; file the quote-location receipt instead.
- **W7 — "PROVINCE/corpus frontier item".** `grep -rn 'csrf-checked submits' PROVINCE.md` → no hit; the phrase
  is `corpus/knowledge/packet-readiness-r7.md:64`. Claim corpus, not PROVINCE.
- **W8 — trend laundering.** `notClaimed`'s "every axis score is unchanged" is about scalars, never verdicts;
  and LEARNING.md:33 lists "a capability admitted to `SCORECARD.md`" under expansion — C1 must not be moved
  into expansion on that clause. C1 is operability; expansion's only round-23 mover is C2.
