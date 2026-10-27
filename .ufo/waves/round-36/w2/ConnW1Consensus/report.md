# ConnW1Consensus — w1 cross-seat disagreement scan

## Evidence / scope

Read the canonical frozen claims first (`.ufo/waves/round-36/claims.json`, C1/C2 clauses), the 33 w1 report paths enumerated under `w1/`, and detailed reports for MutC2, CritC1, RevC1, ExecSelftest, ScribeQuarantine, CritC2, AdjDrift03, AdjDrift15, AdjDrift01, and AdjDriftKaidoku. Evidence below is limited to these report texts and their explicitly cited frozen receipts; no counters were rerun. I cannot substantiate an exhaustive semantic comparison of all 33 report bodies from the read receipts captured in this session.

## Candidate ledger

1. **MutC2 B5 count 6 vs frozen c2-J6 receipt count 8 — RECONCILED, not a real disagreement.** MutC2 explicitly reports its pristine B5 run saw 6 non-loopback sockets versus the frozen receipt's 8, and says both satisfy the contract's `>=1` observation; count varies with timing/environment. Claims C2 feasibility disclosure describes 8 across 3 samples as its receipt, not a constant required count. Same predicate-level fact, different live sample count.

2. **CritC1 F1 vs ExecSelftest deterministic predicate — RECONCILED (different trees).** ExecSelftest reports two byte-identical runs on the honest freeze tree, predicate true, and explicitly scopes its run to that tree. CritC1 agrees the honest freeze is true; its F1 is predicate true on *substituted delta-pin trees* where regenerated ledgers follow substituted heads and therefore mis-audit against frozen heads. Determinism on a fixed input does not imply integrity of an input that the counter fails to digest-bind. The two reports are compatible; F1 attacks binding, not repeatability.

3. **ScribeQuarantine “19/38 accidental id collisions” vs round-22/23 refusal — RECONCILED.** ScribeQuarantine states count/class split 38 = 37 absent-refused + 1 unreachable, matching round-22/23 verdicts, and explicitly says this does not weaken those verdicts or license renumbering. The 19/38 finding is a separate cross-registry membership observation (no same-source identity for IDs present in the lane registry), not a contradiction of refusal status. No w1 contradiction established in the reports examined.

4. **AdjDrift chunks vs RevC1 sample — RECONCILED in examined reports.** RevC1 reports 11 unchanged and 3 moved in its 14-row sample, with moved lines :748/:784/:815. AdjDrift03/15 report unchanged chunks; AdjDrift01 includes all three moved rows and reports those same destinations; AdjDriftKaidoku independently reports byte-identical unique relocations at those three lines. Thus apparent class-count differences are disjoint samples/chunks, not incompatible assertions. AdjDrift03 explicitly limits its scope to 20 unchanged rows. The w1 consensus also reports all 16 chunks 20/20 and 307/307 collectively.

## Proposed bounded move

No finding is supported by these candidate comparisons: record the four as reconciled, preserving the scope distinction between honest-tree repeatability and substituted-input binding (CritC1's F1 remains a separate instrument finding, not a w1 cross-seat disagreement). This improves calibration without altering any frozen claim or counter. No smallest corrective code change is warranted by the comparisons themselves.

## Risks and verification

Risk: report-level exhaustive comparison remains incomplete here; the known candidate set is adjudicated from primary w1 report text, but I do not claim that no other pairwise contradiction exists among all 33. Verification was read-only; no tests/counters run. Main integration should compare the remaining reports if exhaustive closure is required.

VERDICT ok — the four named candidate discrepancies reconcile as different observation counts, different input trees, distinct membership-versus-verdict questions, and disjoint C1 samples; no real disagreement established in the examined evidence.
