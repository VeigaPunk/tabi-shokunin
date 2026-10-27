# RevC2Counter — scoped findings

**Axes:** coverage, calibration.

Finding: D7 in `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs:247-250` checks only `claims[1].predicate`, not `claims[1].id`. A runtime probe changed the second entry's id to `NOT-C2` while retaining the frozen predicate; D7 still returned `sentenceMatch: true`. The check therefore does not establish that C2 itself has the byte-identical predicate.

No D1–D3 drift: the D1, D2, D3 evaluator blocks matched byte-for-byte between frozen round-38 and round-39 counters; differences in this area are comments only. D4 uses the expected round-39 mutant receipt, D5 the round-39 census receipt, and D6 the REV-named round-39 numstat receipt with full body comparison.

Evidence details and exact commands are in `.ufo/waves/round-39/w1/RevC2Counter/report.md`.

VERDICT finding — D7 accepts the frozen sentence on a non-C2 claim.
