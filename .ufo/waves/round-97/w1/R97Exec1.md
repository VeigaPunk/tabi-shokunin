# R97Exec1 — C1 cold reproduction (round 97 w1)

## Setup / tooling
- Read `~/.omp/agent/RULES.md`; pacman PAUSED per seat spec → no pacman used.
- Install: `npm install` (npm registry) `puppeteer-core@25.16.0 playwright-core@1.65.0` → `added 26 packages`, node v24.21.0, npm 11.19.0. Dir `/fast/scratch/hyaku/tabi-r97/R97Exec1/deps` (scratch root per contract, removed after copy).
- Chromium: `Chromium 155.0.8059.84 Arch Linux` (`/usr/bin/chromium`), ports 32711,32712,32713 only. `pgrep -f remote-debugging-port=32713` empty after each run.

## Commands (exact, exit codes)
```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-client-oopif-uploadfile-round97.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb --live --deps /fast/scratch/hyaku/tabi-r97/R97Exec1/deps --scratch /fast/scratch/hyaku/tabi-r97/R97Exec1/run1 --ports 32711,32712,32713 --json > .../R97Exec1-run1.json   # rc 0
node ... same ..., --scratch .../run2 --ports 32711,32712,32713 --json > .../R97Exec1-run2.json   # rc 0
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-client-oopif-uploadfile-round97.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --receipt .../R97Exec1-run1-receipt.json --expect-nonce tabi-r97-live-a9a3caaade77 --expect-driver-sha256 09f0...9e4eb --scratch /fast/scratch/hyaku/tabi-r97/R97Exec1/bat --json > .../R97Exec1-battery.json   # rc 0
```
Artifacts: `R97Exec1-run1.json`, `R97Exec1-run2.json`, `R97Exec1-run1-receipt.json`, `R97Exec1-run2-receipt.json` (copied from `<scratch>/receipt-*/live-receipt-*.json` before cleanup), `R97Exec1-battery.json`.

## Run1 (nonce tabi-r97-live-a9a3caaade77, receiptSha256 e77c6a94…cc1)
- rc 0, verdict `clean`, checkCount 232, findings [], revision be9487f68bd6ccde08264d7d4812b010418fe14a (live HEAD), driverSha256 09f0c2fe…9e4eb, driverRun status 0, `{"legs":24,"failures":0,"launchFailures":0}`.
- outcomes: trusted [PUX-1,PUS-1,PLL-1,×3 reps], untrusted [PLX-1,PLS-1,×3], cleared [PUC-1..3], phantom [PUM-1..3], enoent [PLM-1..3].

## Run2 (nonce tabi-r97-live-b23e55bb841c, receiptSha256 9e783056…f9f)
- rc 0, verdict `clean`, checkCount 232, findings [], same outcomes, 24 legs, failures [], 0 leg errors, 24 distinct UUID browser ids, ports {32711,32712,32713}, chromium `Chromium 155.0.8059.84 Arch Linux`, crossHost localhost, reps 3, answer {tabi-r97-answer.txt,22}, missingPath `<scratch>/driver/tabi-r97-missing.txt` missingExists false.

## Libs pin (fresh npm install reproduces pinned libs — counter `libs` check passed both runs)
- puppeteer-core 25.16.0, integrity sha512-VA5Pf54N…IJw==, `lib/puppeteer/cdp/ElementHandle.js` sha256 162b7199…9b7c96, tree 927 files / 968a85e8…d1e180.
- playwright-core 1.65.0, integrity sha512-vNSKgH6Y…+lA==, `lib/coreBundle.js` sha256 4ef83305…63f7f1, tree 116 files / 24584693…f5cd641.
- All values byte-identical to `claims.json` libraries and to the scored receipt (`scored/live-receipt.json` 6c948131…).

## Battery (on run1 receipt, 70 cases)
- rc 0, `cases: 70, ok: 70, failed: []`. Positive clean; every negative killed with expected finding id (e.g. plx-trusted-claimed→child-events, pum-rejected→outcome, lib-pp-treesha→libs, pus-iframe-target→iframe-targets, leg-fabricated-label→leg-label, failures-listed-legs-clean→failures; full per-case ids in R97Exec1-battery.json). No finding ids on the live runs (empty `findings`).

## Notes
- No leaf deviated: same legs/outcomes as scored run; zero setup failures (no `setup` verdict, no port collisions; `orphansSwept: 0`).
- Scratch `/fast/scratch/hyaku/tabi-r97/R97Exec1` removed after receipt copies; `/tmp` untouched; no commits, no edits outside w1 outputs.

VERDICT C1: neutral
