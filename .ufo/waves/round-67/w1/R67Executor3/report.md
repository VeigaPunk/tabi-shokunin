# R67Executor3: C3 counter (Chromium horizontal wheel + scrollend)

## Result
- Counter built: `counters/chromium-hscroll-r67.mjs`, 33 checks, schema `tabi-chrome-cdp-r67`, counter schema `tabi-r67-hscroll-counter`.
- Selftest: `verdict=clean cases=35 passed=35` (clean positive control, plus all 33 check ids refused by their own `forge()`), exit 0.
- Live driver run (frozen, sha256 `ac0561ac…70a0`, nonce `tabi-r67-live-exec3`, ports 19681/19682): receipt `predicate: true`, `hscrollHypothesis: CONFIRMED`. The shell exit status was not captured. By the driver's source (`process.exitCode = receipt.predicate ? 0 : 1`) it is 0.
- **Live counter: exit 1, one finding: `nonce-pixels`.** All other 32 checks pass, including `fixture-binding`, which means my `renderFixture` reproduces the driver's fixture byte-for-byte.
- **The live counter acceptance "exit 0" is NOT met.** The cause is a defect in the frozen driver, verified below. I did not weaken the counter.
- Declared negatives: 33/33 refused, `forgedGreen 0`, on the live base and on the control base.

## Blocker for the L1 (driver defect in frozen input)
The r67 fixture template dropped the nonce-grid cell rule that the r64 fixture had.
- r64 driver, `scripts/chrome-cdp-loopback-round64.mjs:186`: `#noncegrid i { position: absolute; width: 4px; height: 4px; background: #ffffff; }`
- r67 driver, template line 187: `#noncegrid { ... background: #000000; ... }`. There is **no** `#noncegrid i` rule. The `<i>` cells are unstyled inline elements with no box, so they paint nothing.
- Diagnostic (`w1/R67Executor3/control/grid-diagnostic.mjs`, read-only): for every leg, `whiteCells 0, blackCells 256`, while the nonce has `158` bits set to 1. `cellsDisagreeingWithNonceBits: 158` per leg.
- The driver's predicate never inspects the nonce grid, so the driver reports green while the fixture is wrong.
- Consequence: no live receipt from this frozen driver can pass the counter. The fix belongs in the driver (restore the `#noncegrid i` rule, new driver sha, re-run). That is an L1 decision. I did not edit the driver.

## Commands and exit codes
| Step | Command (abridged) | Exit |
|---|---|---|
| Live driver | `node scripts/chrome-cdp-loopback-round67.mjs --scratch …/run --out …/live/receipt.json --nonce tabi-r67-live-exec3 --http-port 19681 --cdp-port 19682` | not captured; receipt predicate true |
| Selftest (final) | `counters/chromium-hscroll-r67.mjs --selftest --scratch …/selftest --json > w1/R67Executor3/selftest.json` | 0 |
| Live counter | `counters/chromium-hscroll-r67.mjs live/receipt.json --driver … --expect-driver-sha256 ac0561ac…70a0 --shot live --json` | **1** (`nonce-pixels`) |
| Control counter | same, on `control/shots/receipt.json` | 0 (predicate true, 0 findings) |
| Negatives, live | `counters/make-negatives-r67.mjs --receipt live/receipt.json …` | 0 (33/33 refused, forgedGreen 0) |
| Negatives, control | `counters/make-negatives-r67.mjs --receipt control/shots/receipt.json …` | 0 (33/33 refused, forgedGreen 0) |
| Mutants, live | `counters/mutate-r67.mjs run … --negatives negatives-live …` | 1 (liveAccepted 1 of 13, see below) |
| Mutants, control | `counters/mutate-r67.mjs run … --negatives negatives-control …` | 1 (2 survivors) |

Scratch `$HYAKU_SCRATCH` was unset, so I used the default `/fast/scratch/hyaku/tabi-r67/R67Executor3`. It is deleted (`scratch-removed=0`).

## Derived control (diagnostic, NOT a live result)
`control/make-grid-control.mjs` copies the live receipt and its six PNGs and repaints ONLY the 32x8 nonce grid to the nonce bits. It rebinds each leg's sha/bytes. It exists so the other checks can be exercised on a base the counter accepts. The control counter is green (`predicate true, findings 0`). Its receipt carries `derivedControl` to label it.

## Mutation table (13 mutants, each a loosening; find strings each occur exactly once)
Control base (green), `mutants-control/matrix.json`: applied 13, liveAccepted 13, killed 11, loadBearing 11, survived 2.

| Mutant | Check | Result |
|---|---|---|
| M1 cancelation-drop | cancelation | killed |
| M2 nonce-pixels brightness-only | nonce-pixels | killed |
| M3 band-pixels sample-drop | band-pixels | killed |
| M4 scrollend-count boundary-drop | scrollend-count | killed |
| M5 scroll-arithmetic-drop | scroll-arithmetic | killed (after isolating its negative) |
| M6 producer-verdict polarity | producer-verdict | killed |
| M7 scrollY-orthogonality-drop | scrollY-orthogonality | killed |
| M8 host-identity major-drop | host-identity | killed (after isolating its negative) |
| M9 delta-mode-drop | delta-mode-pixels | killed |
| M10 scrollend-log-witness leg-drop | scrollend-log-witness | killed |
| **M11 shot-bytes dimension-drop** | shot-bytes | **SURVIVOR** |
| M12 leg-witness pixel-drop | leg-witness | killed |
| **M13 host-identity cdpProduct prefix-drop** | host-identity | **SURVIVOR** |

Live base, `mutants-live/matrix.json`: applied 13, liveAccepted 1 (M2 only), killed 1 (M2), survived 0. The live base is red for every other mutant (the real `nonce-pixels` defect), so those 12 are refused by the defect and cannot be judged on it. This is why the harness exit is 1 on live. This is not a survivor count.

## Checks I could not make fully discriminating (named honestly)
1. **shot-bytes, dimension clause (M11 survivor).** The only declared negative tests the digest lie (`shotSha256` set to a fake value, kept as is). No declared negative tests a non-1280x900 PNG. I kept the digest-lie negative because it carries the anti-forgery property. The dimension clause is live but not discriminated by any negative.
2. **host-identity, cdpProduct prefix clause (M13 survivor).** The declared negative now isolates the same-major clause (`Chrome/150` vs `Chromium 155`). The `^Chrome/1xx` prefix clause is not tested by any negative. A `HeadlessChrome/…` product would be refused by it alone, but no declared negative demands that.
3. **nonce-pixels on the live base.** Its declared negative is not independently discriminating on the live receipt, because the live base already fails it. On the control base it is discriminating (refused alone, `forgedGreen 0`).

Fixes made during the build (for transparency): the scroll-arithmetic negative was caught by band-pixels and scrollend-log-witness instead of its own check, so it is now isolated (leg, scrollend entry and drawn band pixels all agree on 180). The host-identity negative was tripping the prefix clause, so it is now isolated to the same-major clause.

## Process incidents (mine, disclosed)
- **Race in the first live mutation run.** I ran `mutate-r67.mjs` concurrently with `make-negatives-r67.mjs`. The harness read an empty negatives directory (`pristine.negatives` length 0; 1.2 s wall for 12 mutants). It produced a false survivor, M2. I re-ran sequentially after the negatives completed. Every matrix reported here is from the sequential runs.
- **Mis-edit.** One edit clobbered the counter's shebang line. I restored it; the file's line 1 is `#!/usr/bin/env node`.

## Tooling
No tools installed or upgraded. Available: node v24.21.0, `/usr/bin/chromium` 155.0.8059.84 Arch Linux, `/usr/bin/curl`. Pacman untouched.

## Files
- Counter: `counters/chromium-hscroll-r67.mjs`; `counters/make-negatives-r67.mjs`; `counters/mutate-r67.mjs`; uses `counters/png-r67.mjs`.
- Live: `w1/R67Executor3/live/receipt.json`, `live/start..boundary.png`, `live/driver` outputs; `live-counter.json`.
- Control: `w1/R67Executor3/control/{shots/, make-grid-control.mjs, grid-diagnostic.mjs}`; `control-counter.json`.
- Matrices: `negatives-live/matrix.json`, `negatives-control/matrix.json`, `mutants-live/matrix.json`, `mutants-control/matrix.json`.
- Selftest: `selftest.json`.

## Checks not run
- The driver was not re-run after the counter fixes. The live receipt is the single run; no further driver runs were done.
- Byte-level PNG determinism was not separately tested; the negatives matrices were regenerated and gave the same counts.
