# ConnPattern — scoped findings

Axes: coverage, calibration. Full evidence: [report](ConnPattern/report.md).

- Shared class A: C1 and C2 verdicts trust committed self-written receipt fields (C1 `coverageMs`, `fixture.sha256` shape-only, driver digest unchecked; C2 D4 shape-only sha/exit, D7 `claims[1]` positional).
- Shared class B: C2 D6 requires a receipt at REV naming full REV, which is unsatisfiable at any single commit; the claims `frozenAt` names a different commit than its own freeze blob.
- Causal: predicate inputs and failure mechanisms are disjoint; coupled only because C2's numstat body (baseline..HEAD, 113 entries) includes C1's counters, driver, and receipt.
- Observed at HEAD 1ace2fde: C1 counter exit 0 predicate true; C2 counter exit 1 findings d5-receipt, d6-file; mutant control exit 1 with d7-sentence-mismatch.
- Measured: C1 receipt sample spans 799 ms and 701 ms against `coverageMs` 1560/1461 (driver tail sleep 600 ms counted).

VERDICT finding — one shared self-attestation class (C1 receipt, C2 D4/D5/D7) plus a containment defect in C2 D6; the claims are causally separable except for the numstat window coupling.
