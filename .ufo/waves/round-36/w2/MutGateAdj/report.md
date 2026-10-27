# MutGateAdj — round 36 w2

Mutant: requested four mutations to `scripts/check-adjacency.mjs`: force clean verdict; redirect screen-ledger read to drift ledger; drop candidate-count check; remove `newMapped` accounting.

Expected detector: direct execution of the pristine or one-point-mutated gate against lane revision `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`, comparing gate reading and exit status.

Pristine gate evidence: SHA-256 `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (matches claims pin). Actual command exit 2; stdout: `ADJACENCY verdict=could_not_evaluate rows=0 verified=0` and `finding row=- reason=revision_unresolved detail=--at f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7 does not resolve to a commit`.

Mutation applicability: the inspected pinned gate is `scripts/check-adjacency.mjs`, which evaluates `corpus/adjacency.tsv`. Its verdict derives from `evaluated.findings.length` (lines 1713-1714); the file has no screen-ledger/drift-ledger reads, candidate-count check, or `newMapped` accounting. Those named behaviors belong to another instrument, so the specified m2–m4 edits have no corresponding behavior-bearing point in this gate. m1 can be mechanically applied, but baseline is an unevaluated revision (exit 2), not an honest-tree dirty reading, so it cannot yield the prescribed killed/live result.

Mutant outputs: m1–m4 not run; baseline detector failed to evaluate the requested revision, so all four verdicts are inconclusive. No mutant bytes were created. Before/after gate hash: `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (unchanged). Scratch root was removed by EXIT trap.

VERDICT could-not-evaluate — requested revision does not resolve in lane repository; additionally, m2–m4 target behavior absent from the pinned gate script.
