# RevLedgerSample — round 36 w2

VERDICT ok — no three-way disagreement found in the deterministic blind sample; ledger and w1 receipt statuses agree with independent derivation.

## Procedure

Read the round-36 claims first. The frozen C1 counter bytes were extracted from freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; SHA-256 matched the claims-pinned digest `8a223faf5e109fc05dac1373a4a4979b65f9ec2ffef40f86ae9bf40ba1aad385`. Its observed-status logic uses the pinned line trimmed as cited text; compares the trimmed line at the same line number in `deltaPins[lane]`; otherwise searches all head lines for trimmed equality and classifies moved if found, stale if absent. I independently applied that logic using only `git show` objects for the freeze ledger, frozen delta-pins file, and each row's pin/head blobs. The ledger's bytes are unchanged between freeze and current `HEAD`.

Reproducible draw rule: number the 307 data rows 1-based, excluding the TSV header. Select row `1 + 11k` for integer `k >= 0` while the row is `<=307`. This yields 28 rows: 1, 12, ..., 298. The assignment says “30 rows” but its every-11th rule over 307 rows yields 28; I followed the explicit draw rule and disclose this discrepancy. No w1 receipt was opened until the independent derivation had been saved.

## Results

All 28 drawn rows independently derive as `unchanged`; all 28 match the committed ledger and the unique corresponding AdjDrift receipt. Receipt comparisons: 28 matched, 0 missing, 0 duplicate, 0 status mismatches, 0 three-way disagreements. Detailed row/ref/status/receipt evidence is in `blind-derived.json` and `comparison.json`.

The deterministic spread does not sample any `moved` rows. As a supplementary targeted check (not part of the blind sample), all three moved rows independently derive `moved` at lines 748, 784, and 815 respectively; their committed ledger notes and AdjDrift01 receipts match exactly. See `moved-checks.json`.

## Scope and residual risk

No actionable finding from this cross-seat sample. This is not a census of all 307 rows: 28 rows were sampled by the prescribed spacing, and moved-row checks were targeted after the blind sample; the sample does not independently validate all unchanged rows or stale behavior. The contradictory “30 rows” count is a reproducibility caveat, not a three-way disagreement.
