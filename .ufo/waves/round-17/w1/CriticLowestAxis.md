VERDICT: ISSUES

Scope: lowest-axis rule, stagnation nudge, and C1/C2/C3 causal separability for round 17. Read-only review. Sources: `.ufo/waves/round-17/PLAN.md` (PLAN), `SCORECARD.md` (SC), `/home/vgpnk/Projects/shokunin/AXES.md` (AXES), the live worktree, and `.ufo/waves/round-17/drafts/scorecard.md` (DSC). Tools installed: none.

Bottom line: the lowest-axis rule and the no-waiver reading both hold. Four items need changes before the judge admits the claims: A5 (C1 count sensitivity), A6 (C3 contested-open provenance), A7 (scalar rubric), and A8 (separability statement).

## A1 — "C1 and C3 sit on the lowest non-retired tie" (PLAN:16, :30): HOLDS
- Current scalars come from the round-16 table (SC:742-747): depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. The closure spot-check confirms none moved (`corpus/lessons/round-16-verifier-spotcheck.md:98`).
- No axis is retired (SC:129, :444, :523, :774).
- So the lowest tie is {depth, operability, freshness, adjacency} at 8. Operability (C1) and adjacency (C3) are both in it.
- Counter-reading tested: SC:140 says "Current primary axis: freshness … score 3", from the training-era table SC:91-100. SC:460-462 supersedes that table's current-state reading ("Current baseline is the kaika row…; older training/user tables remain historical"). Rounds 12–16 all used the 8-tie (SC:463, :532, :595, :664, :735-736). The counter-reading fails.
- Second reading tested: the round-17 prompt (`/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-17.md:6`) says "Your lane axes: coverage + calibration".
  - If "lowest" ranges over the lane's own axes only, the tie is coverage/calibration at 9. C2 (coverage) then satisfies the rule.
  - The rule holds under both readings, but PLAN states only the six-axis reading.
  - Repair (optional): add one sentence to PLAN/SC saying C2 also covers the lane-axis reading.

## A2 — The stagnation nudge does not fire, so the obligation stands (DSC:11): HOLDS
- AXES:68-72 makes the waiver need both conditions. Condition (a), all axes at or above line 8, is true (8/9/8/8/9/8).
- Condition (b), no capability entered within window 3, is false. `webmcp-cdp-observation` entered in round 16 (SC:766), was admitted (spot-check :94), and SC:773 says "round 17 = position 1".
- So no waiver applies. C1 and C3 meet the obligation without one.
- Needs-change (wording only), DSC:45:
  - It states round 18's position but not round 17's.
  - It treats the window restart as if C2 were already admitted.
  - Repair: "round 17 = position 1 (SC:773). If `webmcp-cdp-invocation` is admitted, the window restarts at r17 (r18 = position 1). If it is not admitted, r18 = position 2."

## A3 — Distinct axes; two claims on one axis count as one (AXES:31-33): HOLDS
C1 is operability, C2 is coverage plus a capability, C3 is adjacency.

## A4 — Owned files and counters are disjoint (PLAN:36-40): HOLDS for seat-owned files
- The ownership table (PLAN:173-192) gives each seat disjoint paths.
- The three counters are separate files. This improves on r15/r16, where a single `measure.mjs` took `--claim`.

## A5 — C1 counts "jj-anchor-safe entry points" (PLAN:97-104): NEEDS-CHANGE (count inflation and false provenance)
**Counterexample 1 — sensitivity arm passes on a label alone.** In the witness modes, the only lane-tip dependence is the printed revision field:
- check-round-contract `--count-witness`: live `scripts/check-round-contract.mjs:1070-1072` reads the tip only for `code_revision`.
- check-user-round-contract `--witness`, `--count-witness`, `--diagnostic-witness`: `:813/:897/:978` read only codeRevision plus the `committed` flag. Their fixtures come from the explicit `rev` blob.

Arm C moves master to P, so `code_revision=P` differs from arm A's `REV`. "Arm C differs from arm A" is therefore satisfied by the very field being fixed. That is up to 4 of the 7 entries passing with no evidence that the gate reads committed state.

**Counterexample 2 — false provenance (live code).** `check-round-contract.mjs:1070-1072` prints `code_revision=<laneTip>` beside `code_sha256` of the worktree file, with no committed bit. Under jj, a snapshot or uncommitted edit makes the worktree differ from the tip, and the receipt then credits the tip with bytes it does not contain. The user gate already guards this (`:818-819`: `measuredRevision = committed ? … : 'uncommitted'`). The counter's arms all keep worktree = REV (PLAN:90-94), so they cannot catch it. I messaged TabiR17.GateRoundAnchor-2 with this.

Status update (later in the review): GateRoundAnchor-2 adopted the fix. Live `check-round-contract.mjs:1076-1077` now prints `code_committed=yes|no`, computed as `blob(defaultRoot, codeRevision, 'scripts/check-round-contract.mjs') === gitBlobId(codeBytes)`, and keeps `code_revision=<tip>` as PLAN:74 requires. The false-provenance pairing is closed at the source. Arm D (repair c below) must still assert `code_committed=no`, because no counter arm exercises it yet.

**Repair:**
- (a) Normalize every 40-hex revision field before the A-vs-C comparison, so sensitivity must come from a non-label field.
- (b) Report label-only entries separately (e.g. `entries[].kind=label`). Count only behavior-bearing entries, or state this in the claim.
- (c) Add arm D: master = REV, worktree gate file modified. In D the gate must print `committed=no` / `uncommitted`, never `code_revision=REV`.

## A6 — C3 `contested-open` rows are "verified dispositions" (PLAN:144-145): NEEDS-CHANGE (provenance)
**Counterexample.** PLAN accepts as ruling_ref any `tabi | round-17 |` "(or earlier tabi)" line in fleet `.ufo/l0-questions.md`. At fleet `ac792a76…` the only tabi lines are:
- `:25`: round-5 operator-approval request
- `:34`: round-1 namespace question

Neither mentions CDP, the-musketeer or the 9222 lease. The lane contract forbids writing the fleet repo, so no round-17 line can exist.

The musketeer-lease overlap is exactly what the PROVINCE draft marks CONTESTED (`drafts/province.md:5`). A row citing `:25` would pass the format check while the ruling citation proves nothing (false provenance), and the C3 count would rise.

**Repair:**
- Require `ruling_quote` to be a verbatim substring of the cited L0 line that names the sibling or surface. The checker and measure-c3 enforce this, with a counter probe that cites `:25` for an unrelated surface and must go red.
- Otherwise, classify the row as `contested-unfiled`, which is not counted, and route the L0 filing to the L1/operator.

Separately, count distinct `(surface, sibling)` pairs, not rows, so a scout cannot split one overlap into N rows.

## A7 — Lowest-axis work never moves a scalar: NEEDS-CHANGE (calibration risk; a tradeoff, not a rule failure)
- Operability has been worked five rounds running (r13 SC:531, r14 :594, r15 :664, r16 :735, r17). Every round closed 8→8 "improved".
- r16 withheld 9 because "USER 6/10 red, no outside execution" (SC:744). C1 does not touch USER 6/10, which was also the r16 planned item (SC:771).
- Yet DSC:17 says "9 decided by L1 from the measured count", and DSC:20 says the same for adjacency.
- Counterexample: if L1 moves operability 8→9 on the C1 count while USER is still 6/10, that contradicts the r16 basis and harms calibration. If it never moves, the 8-tie is permanent and the lowest-axis rule is met forever by sub-scalar counts.
- Repair: before measuring, fix in DSC the 9-threshold for operability ("withheld while USER 6/10 red unless operator rules it out of scope") and for adjacency (e.g. "integrator ruling cited by both lanes"; kaidoku `PROVINCE.md:53` still lacks the tabi cite, `drafts/province.md:3`). PLAN should also record why C1 deviates from the r16 planned operability item.

## A8 — "Each claim verifiable without the others" (AXES:31; PLAN:36-40): NEEDS-CHANGE (statement incomplete; coupling exists through L1-owned files)
Shared surfaces PLAN does not list:
1. **SKILL.md.** C1 lands the `--witness "$(git rev-parse --verify refs/heads/master)"` registry rule (PLAN:47-48), and its entry argv come "from the SKILL.md registry rows" (PLAN:103). C2 and C3 also append registry rows to SKILL.md. If measure-c1 parses SKILL.md at REV, the C1 count depends on C2/C3 appends.
   - Repair: hard-code the seven argv literals in measure-c1 and keep SKILL.md out of its counted inputs.
2. **measurement-binding.json and measurements.json** (L1). C2/C3 bindings are checked by `check-measurement-binding.mjs`, which C1 modifies (live diff +47/-? lines, `--at` default becomes the lane tip).
   - Repair: bind C2/C3 with an explicit `--at <40-hex>`. Also run the round-17 manifest under the baseline gate blob `1f84fb54…` from a sandbox, proving C2/C3 verify without C1 landed.
3. **C3 checker semantics.** PLAN:147 requires C3 to be "lane-tip anchored per C1 semantics". This is a copied pattern, not a runtime dependency, so it holds.
   - Repair: state that `check-adjacency.mjs` is excluded from C1's fixed entry list, so it can never be double-counted.
4. **README/PROVINCE/SOURCES appends.** The PROVINCE draft (`drafts/province.md:4`) cites only C3 files, which is fine.
   - Repair: measure-c3 refuses any `tabi_ref` under C2 paths (`corpus/knowledge/webmcp-invocation-round-17.md`, `scripts/webmcp-invoke-round17.mjs`, `corpus/evidence/round-17/webmcp-invoke/**`), so C3 cannot silently rest on C2.
5. **C1 identity chain.** The ROUND_SCRIPT constants are an L1 edit inside a C1-owned file. This is internal to C1 and fine. It must land at or before C1's measuredRevision, or binding raises `counted_input_changed`.

## Observed (not edited)
- Lane worktree at review time: `M scripts/check-measurement-binding.mjs`, `M scripts/check-user-round-contract.mjs` (`git status --porcelain`). check-round-contract was also changing mid-review: line numbers moved between reads.
- HEAD = master = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.
- S001–S019 were opened 2026-10-19 with 90d/180d/on-release cadences, so no date-based freshness decay is due today. Freshness is not harmed by omission this round.

Files written:
- .ufo/waves/round-17/w1/CriticLowestAxis.md
