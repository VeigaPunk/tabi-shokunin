HOLDS

Post-freeze repetition, seat R76Exec2, lane /home/vgpnk/Projects/shokunin/tabi-shokunin, base a69f9060cb9d239b3d6d4429e1b91177b792ebd3. Milestone: red rate and honest-pair replay margin. All commands run from scratch /fast/scratch/hyaku/tabi-r76/R76Exec2 (removed at end; cited artifacts copied to .ufo/waves/round-76/w1/R76Exec2/).

## 1. Three cold driver runs — exit 0 each

Pin verified before launch: `sha256sum scripts/chrome-cdp-dialog-round76.mjs` → 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 (exit 0); counter → 505055381ee4d4697a0f2c4fad69f661b64a0adabd44ab451a97b3cd30dddcf4 (exit 0).

| run | nonce | ports http/cdp | command | exit | wall |
|---|---|---|---|---|---|
| d1 | tabi-r76-exec2-1-33772d28 | 24901/24902 | `node scripts/chrome-cdp-dialog-round76.mjs --scratch /fast/scratch/hyaku/tabi-r76/R76Exec2/d1 --out …/d1.json --nonce tabi-r76-exec2-1-33772d28 --http-port 24901 --cdp-port 24902` | 0 | 6.8 s |
| d2 | tabi-r76-exec2-2-f45f6eb3 | 24903/24904 | same shape, d2 | 0 | 6.8 s |
| d3 | tabi-r76-exec2-3-ffb2ad67 | 24905/24906 | same shape, d3 | 0 | 6.8 s |

Receipts copied to `.ufo/waves/round-76/w1/R76Exec2/d{1,2,3}.receipt.txt`; sha256 a2bbadb0…, 2a840b42…, f1b0faa9… (`sha256sum`, exit 0). The three runs executed concurrently, each on its own free ports (pre-checked free, driver re-checks) and own scratch.

## 2. Counter on each receipt — exit 0 clean (131/131) ×3

Command shape (`check-dialog-r76.mjs`, exit 0 each, verdict clean, checkCount 131, findings 0):
`node scripts/check-dialog-r76.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --receipt <d>.json --expect-driver-sha256 152ffc…dd51 --expect-nonce <its nonce> --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --prior corpus/evidence/round76/chromium-js-dialog/receipt.json --prior <each of my other two d*.receipt.txt> --prior .ufo/waves/round-76/w1/R76Exec1/receipt.txt --json`

- prior-set.txt sha256 30f7418a6419b9676d9f335324b2a8f1099505114852e5831087c4c3c1e27e5b, 17 lines (recorded in d1.counter.json `priorSetFile`), 21 priors total per run.
- R76Exec1/receipt.txt existed at counter time (independent run (b) landed first) and was included as a prior in all three counters and all three batteries.
- Counter's own recorded timeline similarity vs its priors: maxAbs 0 (threshold 0.5), maxGap 0.333 (threshold 0.75), ownGaps 6 (d1.counter.json `timeline`).

## 3. Battery on each receipt — exit 0 allOk 251/251 ×3

`node scripts/negatives-dialog-r76.mjs --lane … --real <d>.json <same pin/nonce/prior arguments> --work /fast/scratch/hyaku/tabi-r76/R76Exec2/w<n> --laundered …/degenerate-page-stub.receipt.json --laundered …/degenerate-eval-trigger.receipt.json --laundered …/degenerate-swap-accept.receipt.json --jobs 6 --json` → exit 0, allOk true, cases 251, passed 251, failed [], coverageGap [], positiveOk true (positive exit 0), stoppedEarly false, isolatedCases 142, idsWithIsolatedCase 74, checkIds 131 (d{1,2,3}.battery.json).

## 4. Tabulation over 12 runs (my 3 + 9 pre-freeze smokes)

Inputs: my three counter/battery JSONs + `.ufo/waves/round-76/controls/c1/pf/pf-smoke{1..9}.counter.json` / `.battery.json`. Tabulator: node script, output `w1/R76Exec2/tabulation.json`.

- Per-check counter red rate: 131 checks × 12 runs; redNonzero = [] — every check 0/12 red (all 12 verdicts clean, checkCount 131, findings 0).
- Per-case battery failure rate: 251 cases × 12 runs; failNonzero = [] — every case 0/12 failures (all 12 allOk 251/251, coverageGap []).

## 5. Honest-pair replay margin (adapted timeline script, 17 receipts)

Adapted copy (committed file untouched): `w1/R76Exec2/timeline-honest-pairs-exec2.mjs`, a copy of `.ufo/waves/round-76/controls/c1/timeline-honest-pairs.mjs` extended to 17 receipts: 13 pre-freeze (probe p1–p4, smoke1–9) + L1 `corpus/evidence/round76/chromium-js-dialog/receipt.json` + my d1–d3. Same rule as the counter (tolerance 0.05 ms, abs fraction 0.5, gap fraction 0.75 over ≥ 50 ms gaps; refusal at ≥ 19 of 37 events or ≥ 5 of 6 gaps). Output `w1/R76Exec2/honest-pairs-exec2.json`.

- 17 receipts, 272 ordered pairs; every receipt 37 events / 6 gaps ≥ 50 ms.
- maxAbsMatched = 0 of 19 needed (absMatchedHistogram {"0": 272}); maxAbsFrac 0 vs 0.5.
- maxGapMatched = 2 of 5 needed (gapMatchedHistogram {"0": 170, "1": 78, "2": 24}); maxGapFrac 0.333 vs 0.75.
- refusedHonestPairs = 0. Pairs within one event or one gap of refusal: NONE (pairsWithinOneOfRefusal = []; nearest margins: 19 events on the abs axis, 3 gaps on the gap axis). Consistent with the committed 13-receipt measurement (maxAbsMatched 0, maxGapMatched 2, refused 0 — `.ufo/waves/round-76/lesson-proof/timeline-honest-pairs.json`).

## 6. Block time (dialog-return at − ts) per leg, all 17 honest receipts

n = 17 per leg (102 samples); counter's blocking-law floor is at − ts ≥ 1 ms (check-dialog-r76.mjs:367). All values in ms, on the 0.1 ms grid:

| leg | min | max | mean | < 1 ms |
|---|---|---|---|---|
| alert-accept | 19.7 | 21.3 | 20.51 | 0 |
| confirm-accept | 19.7 | 21.2 | 20.41 | 0 |
| confirm-dismiss | 19.8 | 22.3 | 20.64 | 0 |
| prompt-text | 19.5 | 21.5 | 20.28 | 0 |
| prompt-noparam | 19.4 | 24.8 | 20.63 | 0 |
| prompt-dismiss | 18.6 | 21.0 | 20.15 | 0 |

Overall range 18.6–24.8 ms — every observed block is ≥ 18× the 1 ms floor; below1ms = 0 across all legs (honest-pairs-exec2.json `blockTimes`).

## Verdict and notes

- HOLDS: post-freeze repetition shows red rate 0, battery failure rate 0, no honest pair refused or near refusal, dialog blocks firmly above the blocking-law floor. No defect found; nothing to remediate.
- Tooling: no tools installed or upgraded (none needed). Disk guard status checked pre-run: exit 0, /fast/scratch/hyaku 50% used.
- Bounds: writes confined to `.ufo/waves/round-76/w1/R76Exec2/` and scratch; no git/jj mutations; no subagents; host untouched.
- Scratch `/fast/scratch/hyaku/tabi-r76/R76Exec2` removed after artifact copy.
