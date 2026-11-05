# R67Executor3 (C3 counter) findings

Full report with commands, exit codes and matrices: `w1/R67Executor3/report.md`.

- Counter: `counters/chromium-hscroll-r67.mjs` (33 checks). Selftest `clean 35/35`, exit 0.
- Live driver run (frozen sha `ac0561ac…70a0`): receipt `predicate true`, `CONFIRMED`.
- Live counter: exit 1, sole finding `nonce-pixels`. Cause: the frozen r67 driver's fixture dropped the `#noncegrid i` cell rule present in r64, so all 256 nonce-grid cells render black (158 bits should be white). Driver defect, not a counter defect. Acceptance "live counter exit 0" is not met; needs an L1 decision (amend the driver, new sha, re-run).
- Declared negatives: 33/33 refused, forgedGreen 0 (live and derived control).
- Mutants on the green derived control: 13 applied, 11 killed, survivors M11 (shot-bytes dimension clause) and M13 (host-identity cdpProduct prefix clause), both undiscriminated by any declared negative.
- Derived control (grid repainted to nonce bits, labelled not live) is green; used only to exercise the other checks.
