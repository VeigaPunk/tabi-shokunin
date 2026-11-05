# R67MutTester2 — scoped findings (C1 do-nothing control, independent re-measure)

Full report: `.ufo/waves/round-67/w1/R67MutTester2/report.md`. Flip table: `.ufo/waves/round-67/w1/R67MutTester2/flips.tsv`.

- Frozen v22 (`round-65/counters/c1-adjacency-host-v22.mjs`, sha256 4d3a6b58…2d50d5) unmodified.
- 149 r66 line rows → 298 one-row flips. Exit distribution: {0: 298}. Predicate true: 298. Refused: 0.
- Rows with both flips accepted: 149/149 (matches expected).
- Pristine r66 delta under v22: exit 0, predicate true, findingCount 0.
- Control reading: v22 reaches the target and refuses nothing; it is a do-nothing control, not a C1 pass.
- Finding for v23: all 149 base quotes contain a BG word (BG_WORDS copied from v22 line 34). A v23 rule "no-tabi-ground requires zero BG words" cannot be satisfied by any of the 95 base no-tabi-ground rows. The L1 should confirm this before freezing.
