# R67Executor4 — scoped findings (C3 live verifier)

- Built `scripts/verify-live-r67.mjs`, modelled on `scripts/verify-live-r64.mjs`. Counter called by path; pin checked before any browser run; `--no-run` → finding `no-run`, exit 1; two cold live runs on fresh ports; cross-run and evidence agreement on scrollLeft, scrollY, scrollendsInLeg, wheel deltaX, scrollEvents, scrollendEvents.
- `node --check scripts/verify-live-r67.mjs` → exit 0.
- Control (a) wrong pin (64 zeros): exit **2**, finding `driver-pin`. No browser.
- Control (b) `--no-run` (real pin): exit **1**, finding `no-run`. No browser.
- Control (c) substitute driver (frozen copy + one appended line, sha `9d3ae4fbe287ac06de8f4d51ea7142594e8fadfddac87a956fa97c781c633386`), real pin: exit **2**, finding `driver-pin`. No browser.
- No run directories or browser processes under the seat scratch after the controls; frozen driver sha unchanged (`ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0`).
- Deliberate deviation from r64: no second attempt on a failed run (r64 would re-run a retained red receipt).
- Not run: the live path (by instruction). The counter `counters/chromium-hscroll-r67.mjs` and `w1/R67Executor3/live/` did not exist at run time, so the L1 integrated run is the first end-to-end test.
- Full details, commands and exit codes: `.ufo/waves/round-67/w1/R67Executor4/report.md`. Control outputs: `.ufo/waves/round-67/w1/R67Executor4/controls/`.
