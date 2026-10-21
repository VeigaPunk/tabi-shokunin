# Round 19 W1 — round-18 signal operability baseline

## Result

Ran `scripts/webmcp-invoke-round18.mjs` three times from the isolated baseline clone, sending the selected signal immediately after the first case stdout line and after recording a non-empty run-owned Chromium PID set. Each signal was delivered; each process exited **2**, printed `verdict=could_not_evaluate finding=run_aborted signal=<signal>`, wrote no receipt, and left no owned Chromium PID or harness TMPDIR/run-temp residue.

| Signal | First case stdout | Exit / stdout verdict | Receipt | Owned Chromium PIDs before → after harness exit | TMPDIR residue |
|---|---|---|---|---|---|
| SIGINT | `invoke-imperative-success status=pass` | `2 / could_not_evaluate (run_aborted)` | absent | 11 → 0: `691240 691272 691274 691305 691325 691327 691386 691408 691422 691747 691831` → none | none; run temp directory absent |
| SIGHUP | `invoke-imperative-success status=pass` | `2 / could_not_evaluate (run_aborted)` | absent | 11 → 0: `692217 692229 692230 692234 692256 692278 692304 692375 692401 692708 692793` → none | none; run temp directory absent |
| SIGTERM | `invoke-imperative-success status=pass` | `2 / could_not_evaluate (run_aborted)` | absent | 11 → 0: `693124 693136 693137 693162 693198 693229 693310 693355 693379 693646 693861` → none | none; run temp directory absent |

The full stdout/stderr, exact PIDs and PPID edges, per-run profile/TMPDIR paths, and signal timestamps are retained in `ProbeR18Signals.json`. In each pre-signal snapshot the Chromium main process was an observed PPID child of that run's harness PID, carried the run-specific `--user-data-dir`, and all 11 owned processes had `/proc/<pid>/exe` equal to `/usr/lib/chromium/chromium` (the requested launcher was `/usr/bin/chromium`). Post-exit snapshots contained no such process. No forced browser cleanup was needed. All three stdout verdicts were followed by empty stderr.

## Probe conditions

- Clone: `/fast/scratch/tabi-r19/ProbeR18Signals`, branch `r19/ProbeR18Signals`, based at `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Observed runtime: Node `v24.21.0`; Chromium `154.0.8037.97` (Arch Linux). The harness requires Playwright `1.64.0`; the first case passed in every run.
- Process membership was sampled with `ps -eo pid=,ppid=,args=`, checked against `/proc/<pid>/exe`, and bounded to the harness-owned PPID tree/run profile. Each private TMPDIR was isolated per run; the harness-owned TMPDIR children were empty at exit and each run-temp directory was already absent at exit.
- No tools were installed or updated. No production files were changed; the temporary controller and isolated per-run temp roots were removed. Only this seat's report and raw-results artifact were written directly in the lane.

## Scope and limitation

This is the requested three-signal baseline probe of the round-18 harness, not a round-19 counter run or a judgment of the full C2 claim. The observations show round-18's signal abort path for SIGINT, SIGHUP, and SIGTERM under these fixture-only runs.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ProbeR18Signals`
- Branch: `r19/ProbeR18Signals`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `66251bfc1aef393e4aec599e950a8deb867736bb` (unchanged; no production commit)
- Changed paths: none
