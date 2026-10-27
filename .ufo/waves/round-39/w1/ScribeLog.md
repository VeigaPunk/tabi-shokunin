# ScribeLog — scoped findings (round 39, w1)

Deliverable: the round-39 `LOG.md` entry **draft**, at
`.ufo/waves/round-39/w1/ScribeLog/LOG.round-39.skeleton.md`; commands and outputs for every number
at `.ufo/waves/round-39/w1/ScribeLog/measurements.txt`; full report at
`.ufo/waves/round-39/w1/ScribeLog/report.md`.

The draft carries the frozen claims commit `9c09ebb1…`, baseline `5bc56a81…`, the three frozen
instrument paths with re-derived digests equal to `claims.frozenDigests`, the S145 source with its
verbatim quote, the before-measurement receipts, the pre-integration `d3232d5` counter output, the
C1 receipt's recorded fields, an `OWED:` block for everything the wave has not measured, candidate
mistakes with Captured-by pending, and the ten observed round-39 commits. No disposition, tally,
score or trend verdict is asserted; `LOG.md` itself was not modified.

Findings carried: (F1) the claims blob at the commit it names declares a different `frozenAt`, and
the pointer resolves to instrument digests rather than to the claims bytes; (F2) C2 D6's
receipt-at-REV requirement is self-referential (cited from `measure/c2-self-reference-probe.txt`
and two wave seats); (F3) S145 is absent from `corpus/SOURCES.md` and is cited as `proc(5)` while
the opened source is `proc_pid_net(5)`; (F4) `LOG.md` still lacks the promised round-38
landed-commit ledger; (F5) the wave is in flight (64 dispatched; 25 reports / 31 verdict lines at
measurement).

VERDICT finding — draft LOG entry delivered complete with every unmeasured field marked OWED, and five observed input defects carried (F1 freeze-pointer/claims-bytes split re-derived; F2 C2 D6 self-reference cited from the frozen probe and two seats; F3 S145 unregistered plus proc(5)/proc_pid_net(5) citation split; F4 missing round-38 ledger; F5 wave still in flight); no claim, tally or score is asserted.
