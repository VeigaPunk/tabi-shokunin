# R67Executor1 — scoped findings (C1)

Full report: `.ufo/waves/round-67/w1/R67Executor1/report.md`.

- v23 meter (`.ufo/waves/round-67/counters/c1-adjacency-host-v23.mjs`) = v22 byte copy + `delta-disposition-evidence`.
- v23 selftest: exit 1, 52 cases, 45 pass, 7 fail (v22 fixtures contradicted by the new conjunct; not edited).
- v22 selftest control: exit 0, 47/47.
- Unmutated r66 ledger under v23: exit 1, predicate false, findingCount 95 (all no-tabi-ground rows quote BG words).
- Unmutated r66 ledger under v22: exit 0, predicate true, findingCount 0.
- Flip sweep v23: 54 row-local kills, 95 survivors (all no-tabi-ground). Literal kill vacuous (base red).
- Flip sweep v22 control: 0 kills, 149 survivors.
- Sweep tool: `.ufo/waves/round-67/counters/c1-flip-sweep-r67.mjs`; matrices in `w1/R67Executor1/sweep-v23/` and `sweep-v22/`.
- Scratch removed.
