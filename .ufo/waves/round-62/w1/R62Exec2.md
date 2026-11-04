# R62Exec2 — frozen C2 wave smoke

## Scope and outcome
Axes: coverage, evidence fidelity, closure, frozen-instrument integrity.
One frozen driver invocation on Chromium 155.0.8059.84 Arch Linux exited **0**. The unmodified frozen counter exited **0**, predicate true, findingCount 0. Selftest exited **0**, allPass true, **16/16**. All eight exported live-receipt forgeries exited **1**, never 0 or 2. This is lane-authored wave smoke evidence, **not** the L1 post-wave scored pass or outside admission review.

## Pins and inputs
- Supplied baseline: `57b29bade4b05b03cdb8fa151daec90ac9b1a29c`; supplied freeze: `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`.
- Observed driver SHA256: `8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0`.
- Observed counter SHA256: `971c84f602f6d79b9aa12f9872eba57463a938b425546f793c4b5df72bd5a006`.
- Observed claims SHA256: `4c448764959c8dea1695d9cdbfb01779ebb607835526f0984d846a189b6ab22f`.
- Observed instrument-pins SHA256: `1ec173565b32fb871ef4f601a11d67f69336382246908355282a3d900e88729e`.
- Nonce: `tabi-r62-exec2-97f4ac9f129428dd6091`; HTTP/CDP ports: **19511/19512**.
- Fixture SHA256: `7c80e47fa7b4c76395c07febacf88da21486acc875742457976ec72a298cef41`.
- Node: v24.21.0. No tools installed or updated. No LSP tool available; no symbol refactor attempted.

## Actual page-side sequence
All 11 entries were trusted. Every pointer entry used pointerType mouse and pointerId **1**. The contextmenu events occurred at press, not release, and were canceled. Legacy mouse entries do not fabricate pointer identity fields. Clicklog was empty.

| seq | event | target | button | buttons | defaultPrevented |
|---:|---|---|---:|---:|---|
| 1 | pointermove | target | -1 | 0 | — |
| 2 | pointerdown | target | 2 | 2 | — |
| 3 | mousedown | target | 2 | 2 | false |
| 4 | contextmenu | target | 2 | 2 | true |
| 5 | pointerup | target | 2 | 0 | — |
| 6 | mouseup | target | 2 | 0 | false |
| 7 | pointerdown | target2 | 2 | 2 | — |
| 8 | mousedown | target2 | 2 | 2 | false |
| 9 | contextmenu | target2 | 2 | 2 | true |
| 10 | pointerup | target2 | 2 | 0 | — |
| 11 | mouseup | target2 | 2 | 0 | false |

The frozen CDP sequence was move to first target; right press/buttons 2; right release/buttons 0; right press/buttons 2 on second target; right release/buttons 0. The retained receipt contains measured timestamps and after-press/release snapshots. All three PNGs were 15,812 bytes, each SHA256 `61022bc4e720c2a29d4370bc98b0634465b5c87705f3532ce98a1d7789d33367`; the counter checked actual PNG bytes.

## Closure
The frozen driver bind-prechecked both ports before browser launch. It used its own token-keyed profile, throwaway HOME/XDG_CONFIG_HOME under this seat's scratch, disabled extensions, and bound HTTP/CDP to 127.0.0.1. Prelaunch/midrun/postkill sweep counts were **0/13/0**. Teardown retained **zero survivors**, fixture/devtools ports **closed/closed**, curl exits **7/7**, postKillSweepCount **0**, and failures **[]**. Only the driver's discovered process group/token-keyed PIDs were killed; no broad process kill was used.

The seat scratch `/fast/scratch/hyaku/tabi-r62/R62Exec2` was removed after copying fixture, server log, generator source and durable receipts. `rm -rf -- /fast/scratch/hyaku/tabi-r62/R62Exec2` exited **0**. No other seat scratch was touched.

## Forgery results
Each probe is a structured clone of this live receipt, mutated by the frozen counter's exported `forgeries` function. Original screenshot bytes were reused, preserving semantic rather than usage refusal.

| Probe | exit | findings |
|---|---:|---|
| f1 | 1 | 1: pointer-buttons-0 |
| f2 | 1 | 12: pointer-types, pointer-identity, trusted-fields, shared-sequence, pointer-buttons-0, target-binding-0, cycle-order-0, cycle-time-0, pointer-buttons-1, target-binding-1, cycle-order-1, cycle-time-1 |
| f3 | 1 | 1: trusted-fields |
| f4 | 1 | 12: mouse-types, trusted-fields, shared-sequence, mouse-buttons-0, menu-cancelation-0, target-binding-0, cycle-order-0, mouse-buttons-1, menu-cancelation-1, target-binding-1, cycle-order-1, cycle-time-1 |
| f5 | 1 | 1: pointer-buttons-1 |
| f6 | 1 | 1: pointer-identity |
| f7 | 1 | 1: menu-cancelation-1 |
| f8 | 1 | 1: survivors |

## Retained evidence
All paths below are relative to the lane root:
- `.ufo/waves/round-62/w1/R62Exec2/smoke/receipt.json` and its three PNGs: live evidence.
- `.ufo/waves/round-62/w1/R62Exec2/runs.json`: exact argv, cwd, timestamp, exit code, stdout and stderr for every substantive execution.
- `.ufo/waves/round-62/w1/R62Exec2/driver.command.json`, `counter-live.command.json`, `selftest16.command.json`: individual command receipts.
- `.ufo/waves/round-62/w1/R62Exec2/probes/f1.json` through `f8.json` and corresponding `.command.json`: all forged inputs and semantic refusals.
- `.ufo/waves/round-62/w1/R62Exec2/generate-forgeries.mjs`, `fixture.html`, `server-log.json`: reproduction source and loopback fixture evidence.
- `.ufo/waves/round-62/w1/R62Exec2/pins-and-results.json`, `instrument-hashes.command.json`: pins and result summary.

## Exact commands and exit codes
All commands below ran with cwd `/fast/scratch/hyaku/tabi-r62/R62Exec2`. The output directories were created before launch. No instrument was edited and no VCS mutation or production edit occurred.

### driver — exit 0
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --scratch /fast/scratch/hyaku/tabi-r62/R62Exec2 --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke/receipt.json --nonce tabi-r62-exec2-97f4ac9f129428dd6091 --http-port 19511 --cdp-port 19512
```

### counter-live — exit 0
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke/receipt.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### selftest16 — exit 0
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs --selftest
```

### generate-forgeries — exit 0
```sh
node /fast/scratch/hyaku/tabi-r62/R62Exec2/generate-forgeries.mjs
```

### probes/f1 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f1.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f2 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f2.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f3 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f3.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f4 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f4.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f5 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f5.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f6 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f6.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f7 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f7.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### probes/f8 — exit 1
```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/probes/f8.json --driver /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0 --shot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec2/smoke --json
```

### instrument-hashes — exit 0
```sh
sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/claims.json /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/instrument-pins.json
```

## Risks and boundaries
No blocker or frozen-instrument defect observed in this smoke. Scope is two secondary-button cycles on this one Chromium/Linux build; this is not hardware synthesis, cross-browser, auxclick, pointer capture or keyup-value evidence. No claim is made about C1, contested kaidoku overlap, source admission, mutation coverage or the supplied old-r61 control; those were not rerun by this seat. The integration owner still owns its fresh post-wave scored run. No build, lint, formatter or unrelated checks ran.

Report: `.ufo/waves/round-62/w1/R62Exec2.md`
