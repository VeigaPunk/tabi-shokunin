# W1-30 — C2 egress sampler mutation probe

## Scope / verdict

Attacked C2's observed-socket egress invariant in `scripts/playwright-firefox-loopback-round38.mjs` (the assigned #6 focus). No counterexample to this egress check under the tested case; the plausible mutant was **killed**. This is a bounded mutation result, not an independent revalidation of the entire two-run claim. C1 D1–D6 were not probed in this assigned mutation run.

## Mutant and detector

- **Mutant:** broadened the line test at driver line 81 from `!/127\\.0\\.0\\.1|::1/` to `!/127\\.|::1/`. This models a plausible instrumentation defect that treats any `127/8` endpoint as sufficient proof a socket is loopback, even when neither endpoint is `127.0.0.1` nor `::1`.
- **Bounded detector:** ran each driver copy with `--runs 1`; while it sampled, planted an established TCP connection exclusively between `127.1.2.3` and `127.1.2.4`, with both endpoint processes carrying the driver's Firefox argv marker so the driver's PID filter included them. Detector passed iff the run completed, sampled at least once, and reported at least one non-loopback line. The fixture used only 127/8 loopback addresses; no external endpoint was contacted.

## Outputs

- **Pristine:** exit 0; receipt summary `runs=1 binding=true egress=4 survivors=2`; detector JSON `samples=2 lines=3 nonLoopback=4 driverRc=0`; detector passed.
- **Mutated:** exit 0; receipt summary `runs=1 binding=true egress=0 survivors=2`; detector JSON `samples=2 lines=3 nonLoopback=0 driverRc=0`; detector exited 1. **Verdict: killed.**
- **Restored:** exit 0; receipt summary `runs=1 binding=true egress=4 survivors=2`; detector JSON `samples=2 lines=3 nonLoopback=4 driverRc=0`; detector passed.
- A first harness attempt had malformed Python quoting (connector syntax error) and timed out waiting for its listener; it was discarded. The corrected three runs above completed successfully.

`survivors=2` is expected contamination from the two deliberately planted marker-matching endpoint processes, which were still alive at the driver's survivor snapshot and exited before the harness ended. The detector tests only egress attribution and does not claim a cleanup verdict. The committed receipt observed earlier reports `binding=true`, `egressNonLoopback=0`, and `survivors=0`; its two first-shot hashes are equal (`3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`).

## Hash / restoration evidence

- Frozen driver / scratch pristine SHA-256: `4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1`.
- Mutated scratch SHA-256: `25dcd2c5d9006d750142b35e40a854b73fbe026aef1f7b76a40d3cae704fc525`.
- Restored scratch SHA-256: `4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1` (exact match to pristine).
- Production driver SHA-256 remained `4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1`; production was never edited.
- No tool installed or updated.