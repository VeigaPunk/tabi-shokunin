# R82Exec1 — Leg (b): two cold runs of the frozen driver

## What ran
- Driver: `scripts/chrome-cdp-showpicker-round82.mjs` (sha256 `2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1`)
- Counter: `scripts/check-showpicker-r82.mjs` (sha256 `d0d26fe59b6f5067b6a8021d6e7e039466e6ded46bb4cd4f5eda6f07b444d62e`)
- Prior set: `.ufo/waves/round-82/controls/c1/prior-set.txt` → `probes/prior1.json`
- Scored receipt existed at run time (`corpus/evidence/round82/chromium-showpicker/receipt.json`, nonce `tabi-r82-scored1`), so it was used as `--prior` per the assignment. The fallback `probes/tabi-r82-probe2.json` does not exist and was not needed.

## Cold run 1
- nonce `tabi-r82-cold1-5204a0581de5`, ports 19260/19261/19262
- fixture.sha256 `f15a1c6a1141befbf21512cbf1e4701fcb99f90838781c3c5dd2506c52a2b4d7`
- driver exit `0`; 10 legs, `failures: []`
- Counter with assignment pin `e35e63c11052a7b48efd765541618495d8a2301dbfb36f3250b763dc3c97c669`: exit `1`, verdict `findings`, 63/64 checks pass
- Sole refusal: finding id `driver-pin` — `driverSha256 2085c2a7... expected e35e63c1...`. Every leg law, `fixture-hash`, and prior-set check passes.

## Cold run 2
- nonce `tabi-r82-cold2-5204a0581de5`, ports 19263/19264/19265
- fixture.sha256 `78ae937b5c125bfa9070c2bf3c9fd4c6d5baaca81f7654b9f48f896105bbfd87`
- driver exit `0`; 10 legs, `failures: []`
- Counter with assignment pin `e35e63c1...`: exit `1`, verdict `findings`, 63/64 checks pass
- Sole refusal: finding id `driver-pin` (same detail). All other checks pass.

## Behavior (both runs, all 10 legs)
- Cross-origin `type=date` (nonfile, disabled, month, week, time): SecurityError `showPicker() called from cross-origin iframe.`, 0 choosers
- Same-origin disabled `type=date`: InvalidStateError (origin-before-mutability order discriminator holds)
- `webkitdirectory` answered with a directory: files carry `webkitRelativePath` (`tabi-r82-dir/inner-a.txt`, `inner-b.png`), trusted `input`+`change` fire
- `.txt` answered into `accept=".png"`: accepted (`tabi-r82-a.txt`, 22 bytes, `text/plain`)
- Real click while picker open: second chooser (`clickWhileOpen: [1, 2]`)

## Scored receipt re-validation
Counter on `corpus/evidence/round82/chromium-showpicker/receipt.json` with `--expect-driver-sha256 2085c2a7...` (the actual frozen hash), `--expect-nonce tabi-r82-scored1`, `--prior .../R82Exec1/cold1.json`: exit `0`, verdict `clean`, 64/64 checks, `findings: []`. The prior set still accepts the scored receipt.

## Findings and risks
- **Honest refusal on `driver-pin` for both cold runs.** The assignment's expected hash `e35e63c1...` does not match the frozen driver file (`2085c2a7...`). The scored receipt itself stamps `driverSha256 2085c2a7...`, so the freeze pin in the assignment text appears stale/wrong. Behavior is fully correct; the refusal is pin-only, not behavioral.
- No other findings. No crashed legs, no law violations.
- Full exit codes and finding ids are recorded in `.ufo/waves/round-82-seats/R82Exec1/ledger.txt`; receipts at `cold1.json` / `cold2.json` in the same seat dir.

Report: .ufo/waves/round-82/w1/R82Exec1.md
