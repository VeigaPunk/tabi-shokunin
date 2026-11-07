# R75Exec2 — post-freeze repetition red rate and honest-pair replay margin

HOLDS

- 3 cold pinned-driver runs (nonces `tabi-r75-exec2-{1-7c4a19e2,2-b3d80f51,3-e91c4a6d}`, own ports 31201/31202, 31211/31212, 31221/31222, scratch under `/fast/scratch/hyaku/tabi-r75/R75Exec2/d<n>`): exit 0 each, `predicate:true` / `dragHypothesis:CONFIRMED`, clean teardowns, receipts `.ufo/waves/round-75/w1/R75Exec2/d{1,2,3}.receipt.json` (sha256 aa9e2fc2…802368, 3096c14d…fd2822, 12eb05f7…2cd75831).
- Counter per receipt (17 priors = 16 PRE + scored receipt `corpus/evidence/round75/chromium-drag-intercept/receipt.json`, sha256 re-measured `6ecc2560…72f1761` = dispatch pin): exit 0, `clean`, 146 checks, 0 findings, priorSet 17. Results `d{1,2,3}.counter.json`.
- Battery per receipt (same pin/nonce/priors, 3 laundered degenerates, `--jobs 6`): exit 0, `allOk:true`, 254/254, `positiveOk:true`, `coverageGap:[]`. Results `d{1,2,3}.battery.json`.
- Tabulation over these 3 + the 9 pre-freeze smokes (`.ufo/waves/round-75/controls/c1/pf-smoke<n>.{counter,battery}.json`, priorSet 15 each): 146 checks × 12 runs — **0 checks ever red** (max red rate 0.00); 254 cases × 12 runs — **0 cases ever failed**. Table: `.ufo/waves/round-75/w1/R75Exec2/repetition-tabulation.json`.
- `timeline-honest-pairs.mjs` over all 17 honest receipts (p1–p4, smoke1–9, d1–d3, scored): exit 0; maxAbs **0** (thr 0.5), maxGap **0.375** (thr 0.75), honestPairsRefused **0**, minOwnGaps **8** (need ≥ 6). Output: `honest-pairs.json`.
- Margin: every honest receipt has 17 events / 8 own gaps → refusal needs ≥ 6 gap matches; nearest pairs d1↔d3 and d2↔d3 sit at 3/8 gap matches = **3 matches from refusal** (2× headroom; abs axis at 0 vs 9 needed). **No honest pair within one gap match of refusal.** Per-pair analysis: `refusal-margin.json`.
- No tool installs; no git mutations; no writes outside this seat's wave dir + scratch (scratch deleted).
- Risk note: the 0.75 gap threshold margin is calibrated on this fixture's fixed 15-leg/8-gap shape; other shapes would need recalibration (same caveat as the frozen counter).
