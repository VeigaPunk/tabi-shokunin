# R65MutTester2 — mutation report, C2 v2 matrix binding

Seat: R65MutTester2 (mutation-tester). Scope: exact-line mutants of checkMatrix in w1/R65Executor2/check-receipt-provenance-v2.mjs only. Mutated scratch copies only; the target file was not modified (sha256 before and after: 49a7ec8a63f573aa0acf7b39852e22c8d346d6dad5bdc5a1bb7566802a3905ae, identical). Lane tree not edited; no git mutation; no tools installed.

## Baseline and restoration
- Pristine v2 controls: (a) selftest 12/12 clean; (b) forgery matrix-input = 2 (exit 1, matrices 2); (c) honest exit 0; (d) scored exit 0 (matrices 0, see defect).
- Restored (pristine copy re-run after all mutants): identical results. Killed-by list empty.

## Results
| mutant | line | change | verdict | killed by |
|---|---|---|---|---|
| M1 | 91 | drop absent-input push | KILLED | a, b |
| M2 | 92 | drop digest-mismatch push | KILLED | a, b |
| M3 | 92 | hash path string instead of bytes | KILLED | a, c |
| M4 | 82 | format accepts uppercase/empty sha | SURVIVED | none |
| M5 | 89 | relative path against matrix dir only | SURVIVED | none |
| M6 | 86 | skip binding for absolute path | KILLED | a, b |
| M7 | 91 | absent detail gains suffix | SURVIVED | none |
| M8 | 94 | matrix result always clean | KILLED | a, b |

## Survivors
See survivors.md (M4, M5, M7 with missing cases). M5 is the material one: a valid, correctly pinned relative matrix is falsely rejected, and no control catches it.

## Calibration defect
Check (d) (scored r64 population) reports matrices=0 for every mutant and for the pristine file, because the inherited matrix selector misses the population's `*-matrix.json` files. (d) therefore cannot discriminate the binding. Both files bind under pristine, so the fix is to widen the selector and re-check (d) before the freeze.

## Reproduction
Apply the single line from mutants.json (`mutants[].line`, `changed_line_after`) to a copy of the target, then run the four checks: selftest, forgery (`--dir controls/c1-fab`), honest (`--dir w1/R65Executor2/c1-honest`), scored (`--dir round-64/controls/scored --rev e3f5215615f68490230bd0c6db94f7d84f0fc084`), each with `--repo` at a clone of 58ed8c7.

Deliverables: mutants.json, survivors.md (this directory). Scratch deleted after deliverables were written.
