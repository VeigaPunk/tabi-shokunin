# R66Executor2 — C2 v3 receipt-provenance gate (summary)

Full report: `.ufo/waves/round-66/w1/R66Executor2/report.md`

- v3 gate: `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` — v2 copied byte-for-byte (sha256 `81c8a5ec…`), then two relative-input cases added inside `selftest()` only.
- `c2/v2-v3.diff`: 3 lines (`161a162,163` + 2 added case lines), all inside the selftest array.
- `c2/v3-selftest.txt`: `TABI_R64_PROVENANCE_SELFTEST verdict=clean cases=14 passed=14`, exit 0.
- `c2/mutants-under-v3-cases.txt`:
  - Mutant files run directly with their own selftest: M5a exit 0 (12/12), M5b exit 0 (12/12). Not red, because they embed the old 12 cases.
  - v3 with each mutant's line-90 predicate spliced into a scratch copy: both exit 1, red (13/14), each on its own new case (`matrix-input-relative-repo-base` for M5a, `matrix-input-relative-dir-base` for M5b).
