# Chrome CDP loopback teardown, keyed to the launch — round 46

Host/build-scoped knowledge note (Windows 10.0.26200 x64; Node v24.21.0;
Chrome/156.0.8078.74; Edg/156.0.4314.50). The r45 capability runner left a
teardown residual: `child.kill('SIGKILL')` signals the MAIN browser pid only,
and the belt-and-suspenders `taskkill /PID <main> /T /F` ran after the main was
already dead, so the /T tree walk had nothing to walk. Round-close hygiene then
found three re-parented msedge orphan trees alive while every receipt recorded
`chromeTerminated: true` (lesson round-45 Mistake 5). This note records the
repaired teardown discipline demonstrated in round 46, and the observations
that ground it.

## 1. The failure mechanism, reproduced

- The legacy teardown replica on a REAL Edge launch
  (`.ufo/waves/round-46/measure/c1-legacy-edge.json`): after SIGKILL of the
  main child, `taskkill /T /F` on the dead main exits 128 with
  `ERROR: The process "…" not found.` — the tree walk is a no-op — and the
  keyed census found **16 launch processes still alive** (the r45 orphan
  class, reproduced live; helpers do not exit on their own within the
  observation window once the main is SIGKILLed).
- The same mechanism on real OS processes without a browser
  (`.ufo/waves/round-46/measure/c1-mech-redgreen.json`): a main process plus
  two token-carrying helpers; after the main is SIGKILLed, the legacy replica
  is a no-op (exit 128) and at least one helper survives. The mechanism is the
  OS's, not the browser's.

## 2. The repair: a PID-group kill keyed to the launch

Every process of a launch can be recognized without image names (the
operator's own browser shares the image, so an image-name sweep is
forbidden — r45 lesson) because the launch owns a **unique per-run profile
token**: 12 fresh hex chars in the profile directory basename
(`edge-profile-3f9a2b7c1d0e`), which the browser and every helper carry
verbatim in their command line — `--user-data-dir` for the browser and the
renderer/GPU/utility children, `--database=<profile>\Crashpad` for the
crashpad handler. The runner
(`scripts/chrome-cdp-loopback-round46.mjs`) sweeps the live process table via
PowerShell `Get-CimInstance Win32_Process` filtered by that token (S155: the
CommandLine property is the "Command line used to start a specific process,
if applicable."), own pid excluded, at three points:

| Point | Requirement | Receipt field |
|---|---|---|
| pre-launch | count 0 (the key is fresh; else refuse to start) | `preLaunchSweepCount` |
| mid-run | count >= 1 (the token group binds the live launch) | `midRunSweep{count,pids,procs}` |
| post-kill | kill each survivor BY PID (`taskkill /PID <pid> /F /T`), re-sweep until 0 (bounded 15 rounds, fail-closed) | `teardown.keyedSweep.rounds`, `teardown.postKillSweepCount` |

`receipt.ok` requires `chromeTerminated === true` AND
`postKillSweepCount === 0`. The legacy `taskkill /T` attempt is still
recorded with its output — it is the structural evidence of the no-op.

## 3. What the mid-run census showed on this host

The keyed group is nonempty and token-complete while a launch lives. Observed
mid-run censuses this round: Edge 16 / 16 / 14 processes (main msedge, ~14
helpers, one `identity_helper.exe`); Chrome 10. Every observed process carried
the launch token in its command line; no process was ever selected by image
name. Post-kill sweeps reached 0 in 1–2 rounds on every repaired run
(`corpus/evidence/round46/edge-cdp/receipt.json`,
`corpus/evidence/round46/chrome-cdp/receipt.json`).

## 4. Decision table — teardown strategies on this host

| Strategy | Verdict | Ground |
|---|---|---|
| `child.kill()` only (main pid signal) | INSUFFICIENT — signals the main only; helpers outlive it | r45 round-close orphans; c1-mech-redgreen.json |
| `taskkill /PID <main> /T /F` after the main died | NO-OP — exit 128, "process not found"; the tree walk needs a live root | c1-legacy-edge.json; c1-mech-redgreen.json |
| sweep by image name | FORBIDDEN — the operator's own browser shares the image | r45 lesson Mistake 5 fix note |
| keyed PID-group sweep + per-PID kill to 0 | ADEPT (declared residual below) | r46 runs: postKillSweepCount 0 on every run; live red 16 orphans → 0 |
| job-object kill (JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE) | NOT TAKEN this round — Node has no job-object surface; a PowerShell Add-Type wrapper would move the launch outside the instrumented process; the carry-in sanctions either mechanism | r46 claims.json C1 surface note |

## 5. Limits (declared residual, frozen before review data)

- The keyed group is the set of processes whose command line carries the
  launch token. A helper that rewrote its command line to drop the token would
  be outside the group. None was observed: every process the sweeps saw,
  including `identity_helper.exe` and the crashpad/database children, carried
  the token.
- The sweep is a live observation recorded in receipts; it is not
  re-derivable from committed bytes alone. That a browser ran is re-derived by
  re-running the committed runner, whose fixture nonce and launch token differ
  per invocation (same residual model as rounds 44–45).
- The counter (`.ufo/waves/round-46/counters/chrome-cdp-receipt-r46.mjs`)
  binds receipt shape and committed bytes (runner digest pin, loopback hosts,
  invocation binding, mid-run census nonempty, post-kill sweep 0); it cannot
  by itself prove a browser ran or that the recorded pids were real.
- PowerShell `Get-CimInstance` startup dominates the sweep cost (~0.5–1.5 s
  per round); the 15-round budget is generous but bounded, and the runner
  fails closed (receipt not ok) if 0 is not reached.

## Sources and instruments

S155 (Win32_Process class documentation, opened 2026-10-31, staged copy
`.ufo/waves/round-46/sources/win32-process.html`);
`scripts/chrome-cdp-loopback-round46.mjs`;
`.ufo/waves/round-46/counters/chrome-cdp-receipt-r46.mjs` (+ selftest, 18
cases); `.ufo/waves/round-46/controls/teardown-mechanism-fixture.mjs`;
`.ufo/waves/round-46/controls/legacy-teardown-control-r46.mjs`;
`.ufo/waves/round-46/claims.json` (frozen predicates, kill rules, residual
model); prior ground: `corpus/knowledge/chrome-cdp-loopback-round-45.md`,
`corpus/lessons/round-45.md` Mistake 5.

## Supersession (round 47, append-only)

This note is superseded by `chrome-cdp-teardown-round-46-corrected.md` (r46 closure defect V2:
the entry carried no machine-readable `source:`/`verified-at:`/`recheck:` trio; the corrected entry
opens with it and cites S156, which corrects this round's S155 anchor byte count 104,251 → 104,255 B).
The bytes above are unchanged; the corrected entry carries this body verbatim.
