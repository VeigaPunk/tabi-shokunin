# R96Exec2 — C1 scale & stability (w1)

## Setup (verbatim)
Deps installed via npm registry (official channel) per seat spec:
`mkdir -p /fast/scratch/hyaku/tabi-r96/R96Exec2/deps && cd /fast/scratch/hyaku/tabi-r96/R96Exec2/deps && npm init -y >/dev/null && npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0`
→ exit 0; installed versions confirmed `25.16.0` / `1.65.0`. No pacman used (paused host-wide per spec); no other tool installs.
Ports: 32621,32622,32623. Chromium: host `/usr/bin/chromium` 155.0.8059.84 (per receipt).

## Commands run
1. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-chooser-round96.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --live --deps /fast/scratch/hyaku/tabi-r96/R96Exec2/deps --scratch /fast/scratch/hyaku/tabi-r96/R96Exec2/reps10 --ports 32621,32622,32623 --json --reps 10` → EXIT 0
2. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-chooser-round96.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --live --deps /fast/scratch/hyaku/tabi-r96/R96Exec2/deps --scratch /fast/scratch/hyaku/tabi-r96/R96Exec2/def --ports 32621,32622,32623 --json` → EXIT 0

## Results
| run | verdict | checks | legs | findings | nonce | receipt sha256 |
|---|---|---|---|---|---|---|
| reps10 (`--reps 10`, 50 legs) | clean | 515 | 50 | [] | tabi-r96-live-050c0b2ff148 | 228fe68c425713c56e56ce0db8294f10d97bdc9e44dcc8585d0e03bb89910d13 |
| default (3 reps, 15 legs) | clean | 165 | 15 | [] | tabi-r96-live-d5544ddbfca4 | ef32e43f33593deb43fbeaeb6fe7bbf97583950f9ad5ab3d6efd7f071546d791 |

Per-arm outcome counts (derived from receipts, `outcome` field):
- reps10: PPX timeout 10/10, PPW timeout 10/10, PPS chooser 10/10, PWX chooser 10/10, PWS chooser 10/10.
- default: PPX timeout 3/3, PPW timeout 3/3, PPS/PWX/PWS chooser 3/3 each.
- PPX/PPW `errMessage` on every leg: exactly `Waiting for \`FileChooser\` failed: 3000ms exceeded` with `errName TimeoutError`, child `#s` `[]`.
- All PPW legs: witness saw exactly one `fileChooserOpened` (`mode selectSingle`, `backendNodeId 2`, `frameId` = iframe target) — no exceptions in 13 PPW legs total.
- All chooser legs (PPS/PWX/PWS, 39 legs total across both runs): child `#s` exactly `[["tabi-r96-answer.txt", 22]]`.
- Findings verbatim: `[]` on both counters; `failures: []`, `driverRun.status: 0`, `timedOut: false`, `orphansSwept: 0`.

## Kill-rule check
- No PPX/PPW leg ever resolved a chooser; no PPS/PWX/PWS leg ever timed out. No falsifying leg observed in 65 legs.
- No `setup` verdict on either run (both exit 0, driver status 0).

## Artifacts (in `.ufo/waves/round-96/w1/`)
- `R96Exec2-reps10.json` + `R96Exec2-reps10-receipt.json` (copies of live receipt live-receipt-937d433fd925.json)
- `R96Exec2-default.json` + `R96Exec2-default-receipt.json` (live-receipt-e50a2d50d8c6.json)

## Risks / notes
- Counts are counter `checkCount` (165 @15 legs, 515 @50 legs); re-derivation matches arm leg counts exactly.
- Teardown: `pgrep -f remote-debugging-port=32623` empty before yield; only assigned ports used.
- Scratch `/fast/scratch/hyaku/tabi-r96/R96Exec2/` removed before yield (receipts copied first).

VERDICT C1: neutral
