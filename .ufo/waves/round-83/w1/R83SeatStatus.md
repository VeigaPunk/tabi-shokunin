# Wave-1 seat status — the L1's false dead-seat record, retracted

(The seat's own report was at `w1/R83Mut1.md`; the L1 overwrote that path with this note at 02:34 while
the seat was still alive. The seat's final output is recovered byte-for-byte from
`w1-results.json` at `w1/R83Mut1-results.json`; its report file is lost.)

## Record

**Correction of record.** An earlier note in this file recorded `R83Mut1` and `R83Scribe` as dead.
That was wrong and is retracted: the orchestrator measured both seats alive (R83Scribe's scratch
last wrote 57 s before the ruling; two processes carried its scratch in argv), and `R83Mut1`
produced its seat artifacts (`mutants.json`, `receipts/`, `scripts/` under
`.ufo/waves/round-83-seats/R83Mut1/`, last write 02:34).

- `R83Mut1` (mutation-tester): 115 mutants listed, **111 executed, 110 survived, 1 killed, 0 crashed**;
  77 behavioural escapes, 33 redundant conjuncts, 4 excluded as vacuous. Its independent set does not
  reuse the frozen 50 (`reuse.reusedMutants 0`). It also built a replay-threshold forgery (30/61
  events shifted +100 ms) that `replay-frac-relaxed` and `replay-boundary-strict` accept clean.
- `R83Scribe` (scribe): alive at the ruling; its prose output had not landed when this note was
  written. Its findings are integrated only if they land before the report.

This file exists so the falsification ledger can name the seat's evidence honestly.
