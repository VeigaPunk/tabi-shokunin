HOLDS
Post-freeze repetition, lane tabi-shokunin, seat R75Exec2 (2026-11-07). Axes (godspeed): (1) repetition stability — per-check counter red rate and per-case battery failure rate; (2) replay-margin calibration — honest-pair distance to the counter's replay-event-timeline refusal.

## 0. Environment / pins
- `sha256sum scripts/chrome-cdp-dragdrop-round75.mjs scripts/check-dragdrop-r75.mjs` → `d604552e…28105` / `9b370790…c9270` — both match the frozen pins; exit 0.
- `/usr/bin/chromium --version` → `Chromium 155.0.8059.84 Arch Linux`; `node --version` → `v24.21.0`; exit 0.
- Tool installs: none. No pacman transactions. No git mutations (read-only inspection only).

## 1. Three cold driver runs (exit 0 each)
| n | nonce | http/cdp port | scratch | exit | predicate / hypothesis | receipt sha256 |
|---|---|---|---|---|---|---|
| 1 | tabi-r75-exec2-1-7c4a19e2 | 31201/31202 | /fast/scratch/hyaku/tabi-r75/R75Exec2/d1 | 0 | true / CONFIRMED | aa9e2fc2…802368 |
| 2 | tabi-r75-exec2-2-b3d80f51 | 31211/31212 | …/d2 | 0 | true / CONFIRMED | 3096c14d…fd2822 |
| 3 | tabi-r75-exec2-3-e91c4a6d | 31221/31222 | …/d3 | 0 | true / CONFIRMED | 12eb05f7…2cd75831 |

Command: `node scripts/chrome-cdp-dragdrop-round75.mjs --scratch /fast/scratch/hyaku/tabi-r75/R75Exec2/d<n> --out .ufo/waves/round-75/w1/R75Exec2/d<n>.receipt.json --nonce <nonce> --http-port <p> --cdp-port <p+1>` (exit 0, 0). Each receipt: `predicate:true`, `dragHypothesis:"CONFIRMED"`, 15 legs, `bad-type` cdpError `-32602 Unexpected event type 'dragLeave'`, one `Input.dragIntercepted` (2 items, dragOperationsMask 17), teardown `postKillSweepCount:0`, both ports `closed`, `failures:[]`. Browser ids pairwise distinct (227cab78…, 55c57ad1…, 70a731c8…). Receipts: `.ufo/waves/round-75/w1/R75Exec2/d{1,2,3}.receipt.json`.

## 2. Counter on each (exit 0 clean each)
`node scripts/check-dragdrop-r75.mjs --receipt d<n>.receipt.json --expect-driver-sha256 d604552e… --expect-nonce <its nonce> --prior <16 PRE paths> --prior corpus/evidence/round75/chromium-drag-intercept/receipt.json --json` → exit 0, 0, 0. Each output: `verdict:"clean"`, `checkCount:146`, `findings:0`, `priorSet:17` (16 PRE + the scored (a) receipt). Results: `.ufo/waves/round-75/w1/R75Exec2/d{1,2,3}.counter.json`.

## 3. Battery on each (exit 0 each)
`node scripts/negatives-dragdrop-r75.mjs --real d<n>.receipt.json --expect-driver-sha256 d604552e… --expect-nonce <its nonce> --prior <same 17> --work /fast/scratch/hyaku/tabi-r75/R75Exec2/w<n> --laundered <3 degenerate receipts> --jobs 6 --json` → exit 0, 0, 0. Each: `cases:254, passed:254, failed:[], allOk:true, positiveOk:true, coverageGap:[], stoppedEarly:false, isolatedCases:154, idsWithIsolatedCase:89`. Results: `.ufo/waves/round-75/w1/R75Exec2/d{1,2,3}.battery.json`.

## 4. Red-rate / failure-rate tabulation (12 runs = d1..d3 + pf-smoke1..9)
Script: scratch `tabulate.mjs` (union of check ids and case names; red = `checks[id]!==true`, failure = `result.ok!==true`). Output: `.ufo/waves/round-75/w1/R75Exec2/repetition-tabulation.json`.
- Counter: 146 check ids × 12 runs = 1752 observations; checksEverRed `[]` → **per-check red rate 0.00 for every check** (max 0/12).
- Battery: 254 cases × 12 runs = 3048 observations; casesEverFailed `[]` → **per-case failure rate 0.00 for every case**.
- Per-run detail: d1..d3 `clean/146/0 findings/priorSet 17/allOk 254 passed`; pf-smoke1..9 `clean/146/0 findings/priorSet 15 (pre-freeze set excludes the run's own receipt)/allOk 254 passed`. All `stoppedEarly:false`, `coverageGap:0`.

## 5. Honest-pair replay margin (17 honest receipts, 272 ordered pairs)
`node .ufo/waves/round-75/lesson-proof/timeline-honest-pairs.mjs <d1> <d2> <d3> corpus/evidence/round75/chromium-drag-intercept/receipt.json` → exit 0; output `.ufo/waves/round-75/w1/R75Exec2/honest-pairs.json`:
- receipts 17 (p1..p4, smoke1..9, d1..d3, scored receipt), orderedPairs 272;
- **maxAbs = 0** (threshold 0.5), **maxGap = 0.375** (threshold 0.75), **honestPairsRefused = 0**, **minOwnGaps = 8** (needs ≥ 6), refusedAtFirstChosenGapThreshold(0.5) = 0; gap histogram eighths: 0→212, 1→48, 2→8, 3→4.
Margin analysis (scratch `margin.mjs`, same copied match functions; output `.ufo/waves/round-75/w1/R75Exec2/refusal-margin.json`): every receipt has 17 events and 8 own ≥50 ms gaps, so refusal needs ≥ ⌈0.75·8⌉ = 6 gap matches (or ≥ ⌈0.5·17⌉ = 9 event matches). Nearest non-refused pairs are d1↔d3 and d2↔d3 at gapMatches 3/8 (0.375): **3 gap matches from refusal** (abs distance 9). Answer to the wave question: **no honest pair is within one gap match of refusal** — the closest is 3 matches away; there is ~2× headroom on the gap axis and the abs axis never moves off 0.

## 6. Cross-checks
- Scored receipt digest re-measured: `sha256sum corpus/evidence/round75/chromium-drag-intercept/receipt.json` → `6ecc2560…72f1761` — matches the status-at-dispatch pin (`6ecc2560…1761`); exit 0.
- No check was red in any of the 12 runs and no battery case failed, so there are no per-check/per-case exceptions to list; the full per-run table is in `repetition-tabulation.json`.

## 7. Files written (all inside this seat's dirs)
- `.ufo/waves/round-75/w1/R75Exec2/`: `report.md`, `d1.receipt.json`, `d2.receipt.json`, `d3.receipt.json`, `d1.counter.json`, `d2.counter.json`, `d3.counter.json`, `d1.battery.json`, `d2.battery.json`, `d3.battery.json`, `repetition-tabulation.json`, `honest-pairs.json`, `refusal-margin.json`.
- Trailer: `.ufo/waves/round-75/w1/R75Exec2.md`.
- Scratch `/fast/scratch/hyaku/tabi-r75/R75Exec2/` deleted before yield.

## 8. Risks
- Honest-pair maxGap 0.375 is measured over this driver's fixed 15-leg shape with 8 gaps/receipt; a mutated or re-timed receipt shape with fewer/denser gaps would shift the margin — threshold calibration holds only for this fixture shape (same caveat as the frozen counter).
- The host was heavily loaded; three drivers ran concurrently with distinct ports and produced clean teardowns (0 sweep kills), so no port/profiling contention was observed, but this is a single-sample observation, not a guarantee.
