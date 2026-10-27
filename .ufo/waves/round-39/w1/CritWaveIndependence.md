# CritWaveIndependence — round 39 causal separability

Axes: coverage (C1) and calibration (C2).

## Counterexample and evidence

C1 is not independent of all non-C1 evidence: its frozen predicate explicitly requires the round-38 v1 receipt to be present and refused. Its counter reads that control at `corpus/evidence/round-38/playwright-firefox/receipt.json` (C1 counter lines 55–77), plus the C1 round-39 receipt. But it has no dependency on C2's mutant/census/numstat receipts or routed-defect material. The C1 counter run recorded at `w1/RevC1Receipt/report.md` reports predicate true and `control.v1Present=true`, `control.refused=true`; the frozen baseline C1 run in `measure/c1-before.txt` reports only the C1 receipt absent and the same control refused. Thus C1 can be tested without C2 receipts, provided its own receipt and required v1 control remain available.

C2 does not require a C1 Firefox/browser receipt: its frozen checks are D1–D7 in `c2-routed-defects-v2.mjs` and neither the C1 receipt path nor a browser session is read. The frozen pre-integration run in `measure/pre-integration-counters.txt` reports C2 exit 1 because D4/D5/D6 round-39 inputs are absent, while C1 exit 0 at that same REV. This is direct evidence that C1 success does not imply C2 success and the C2 counter can be exercised without a C1 receipt. C2's own target does require C2-specific receipts and a successful D1–D7 evaluation.

The strongest cross-claim coupling is the shared committed revision / integration snapshot: both counters resolve and read Git blobs at the supplied REV; C2 additionally reads the worktree measurement receipts (D5/D6) and claims predicate. Consequently receipts and claims must be available in the same measured integration state for each counter; a missing/changed shared claims blob can alter C2 D7 without affecting C1's byte-evidence checks. The `claims.json` document is also the common frozen claim registry and binds both claim predicates, but the counters' actual inputs are asymmetric: C1 does not inspect claims.json; C2 checks only claims[1].predicate. There is no evidence that C1's browser receipt is a C2 dependency.

A further independence caveat: C1's control is a deliberate C2-independent shared prerequisite, not the C2 round-39 red-control receipt. Do not treat C1's `control.refused=true` as evidence for C2 D4/D7. Conversely, C2's sentence-mutant receipt is not needed to judge C1.

## Smallest safe correction

Keep the claims separately judged and report counters independently against one explicitly named REV. Preserve the round-38 v1 control as a documented C1 prerequisite, and do not let C1's result satisfy C2's mutant/census/numstat conditions. If strict claim isolation is desired, avoid combining both claims into a single all-or-nothing aggregate verdict; no production change is needed for the observed separation.

Evidence read: frozen `claims.json`; frozen C1/C2 counter source; `measure/c1-before.txt`; `measure/c2-before.txt`; `measure/pre-integration-counters.txt`; `w1/RevC1Receipt/report.md`; `w1/RevC2Receipt/report.md`. No browser or tools run; no tool installs.

VERDICT finding — claims are separately testable, but C1 has a required round-38 control dependency and both verdicts share the measured REV; keep their predicates/evidence distinct.
