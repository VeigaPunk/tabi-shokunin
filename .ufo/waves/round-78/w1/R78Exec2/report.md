FINDINGS

Seat R78Exec2, tabi round 78 w1, lane /home/vgpnk/Projects/shokunin/tabi-shokunin @ base ae2dc25. Axes: coverage (fresh cold runs under the pinned driver + counter + battery) and calibration (counter limit brackets). No tool installs. No git mutations. All JSON outputs under .ufo/waves/round-78-seats/R78Exec2/ only.

## What I ran

Driver `scripts/chrome-cdp-filechooser-round78.mjs`, sha256 verified `0ae89d9…523f` (sha256sum, matches the pinned `--expect-driver-sha256`). Three cold runs, parallel, free ports 37121/37122, 37131/37132, 37141/37142 (`ss -ltn` probe before each), scratch `/fast/scratch/hyaku/tabi-r78/R78Exec2/d<n>`:

- d1 nonce `tabi-r78-exec2-d1-fc16cf38`, exit 0
- d2 nonce `tabi-r78-exec2-d2-d8d246e9`, exit 0
- d3 nonce `tabi-r78-exec2-d3-4a2cd214`, exit 0

Receipts: `.ufo/waves/round-78-seats/R78Exec2/d{1,2,3}.receipt.json` (15 legs, 79 events each).

## F1 — post-D artifact in the walked tree refused every honest run for ~10 minutes (environmental, receipts exonerated)

First-pass counters on d1/d2/d3 (claimed counting command, priors = scored receipt + my other two + R78Exec1 if present) all exited **1** with exactly one finding:

```
prior-set-unparsable: .ufo/waves/round-78/scored/selftest-r78-gates.out
```

Evidence chain: the file (7661 B, mtime Nov 7 15:14 — after D and after the 15:07 scored run) starts with `{` (`od -c` first bytes ` { \n " s c h e m a " …`) and `JSON.parse` fails at position 7629 ("Unexpected non-whitespace character after JSON"); counter line `check-filechooser-r78.mjs:307` refuses any walked-tree file whose first non-blank byte is `{`/`[` or name ends `.json` and which does not parse. The walked trees are `.ufo/waves/round-78` and `corpus/evidence/round78` (counter line 605); `scored/` is inside the first. The authoring process was the L1's own selftest (`selftest-r78-gates.out` in `.ufo/waves/round-78/scored/`, listing of 15:14). Cascade: batteries d1/d2 on the polluted tree returned `positiveOk=false` (positive exit 1, same finding) and `passed=5/398, allOk=false` — one polluted file fails the positive and taints every refusal case with an extra finding (archived as `d1.battery.polluted.json`, `d2.battery.polluted.json`; `--tree-exempt` exempts only the receipt under test from `prior-set-complete`, not unparsable files — counter line 308 vs 313). L1 (TabiR78) confirmed ownership and moved the file to `.ufo/waves/round-78-seats/L1-selftest/selftest-r78-gates.out`; I verified `test -f .ufo/waves/round-78/scored/selftest-r78-gates.out` → absent.

Re-run on the cleaned tree, same receipts, no edits (polluted outputs preserved as `d<n>.counter.polluted.json`):

- counters d1/d2/d3: exit **0**, `verdict=clean`, `checks=186`, findings 0 (`d<n>.counter.json`)
- cold1 recheck (`L1-cold1/receipt.json`, nonce `tabi-r78-cold1-d59ca0270c2a`): exit 0, clean 186 (`cold1.recheck.counter.json`); its own 15:07 pre-pollution counter was also clean 186 (`L1-cold1/counter.json`)
- R78Exec1 recheck (`R78Exec1/receipt.json`, nonce `tabi-r78-exec1-d59ca0270c2a`, driver sha `0ae89d923f0b…`): exit 0, clean 186 (`exec1.recheck.counter.json`)
- batteries d1/d2/d3: exit 0, `allOk=true`, 398/398 passed, positiveOk, coverageGap 0, refuse 372 + must-accept 23 + laundered 3, checkIds 186 (`d<n>.battery.json`)

**Milestone answer (leg b): the r77 honest-refusal class is gone.** Zero content-driven refusals in 5 fresh cold runs post-cleanup (d1, d2, d3, cold1, exec1-recheck), each 186/186. The three refusals observed during the 15:14–15:2x window were caused solely by the walked-tree artifact, not by receipt content — same receipts exit clean once it is removed. If the L1 counts strictly by exit code, the window contributed 3 refused honest runs; root cause and exoneration are above.

Risk worth closing: any post-D artifact inside the two walked trees that begins with `{`/`[` and is not one JSON document refuses **every** cold run and cascades through the whole battery. The wave's own gate outputs did this once already. Keeping selftest/negative summaries in seats dirs (as now) avoids it; the counter deliberately cannot be told to skip such files (`prior-set-unparsable` is the designed fail-closed behavior).

## Per-leg opened-mode and nodeReport (identical in d1/d2/d3, and cold1/exec1)

| leg | opened | mode | backendNodeId |
|---|---|---|---|
| pick-single, pick-same, pick-first-only, pick-missing, pick-empty, forward-click, intercept-cancel | true | selectSingle | 5 |
| pick-multiple | true | selectMultiple | 7 |
| dir-mode | true | selectSingle | 14 |
| accept-ignored | true | selectSingle | 18 |
| script-click | false | — | — |
| not-file-input | n/a (set refused −32000) | — | — |
| intercept-off | false (no event) | — | — |

nodeReport per run: `pick-single:5 pick-multiple:7 pick-same:5 pick-first-only:5 pick-missing:5 pick-empty:5 dir-mode:14 accept-ignored:18 forward-click:5 intercept-cancel:5` — one id per input, distinct where inputs differ, never pinned to a literal; modes bound only (E1 working as designed). `fixtureInputs` matches the page-measured descriptors (s/m/d/k rects 100/300/500/700 × y=100 120×40, f button at 100,300; m multiple=true, d webkitdirectory=true, k accept=.png).

## Calibration — limit blocks, honest ordered pairs

Needs printed by the counter from prior counts: absNeed/gapNeed = 40/9 (N_p=79, G_p=11), 19/9 (N_p=37, deg-page-stub), 18/9 (N_p=35, deg-eval-trigger).

- max absMatched over all pairs of all five clean counters: **0** (need 40) — d1 vs probe/p1 shows the global max; all runs abs 0
- max gapMatched: **5** (need 9) — cold1-recheck vs `c1/deg-swap-files.receipt.json`; my runs: d1 max 1, d2 max 2 (vs d3), d3 max 2 (vs p1 and vs d2)
- no pair refused (`refused:false` everywhere; cold1's own 15:07 counter also max gap 5 vs deg-swap-files, need 9)

## Housekeeping

- cold1 path note: `.ufo/waves/round-78/scored/cold1.receipt.json` (assignment path) does not exist; the cold1 receipt is at `.ufo/waves/round-78-seats/L1-cold1/receipt.json` and is the one counted above.
- R78Exec1 landed its receipt mid-flight (absent at seat start, present by my counter runs at ~15:21); included as prior and rechecked.
- Scratch `/fast/scratch/hyaku/tabi-r78/R78Exec2` removed (receipts live in the seat dir). Polluted first-pass outputs retained: `d{1,2,3}.counter.polluted.json`, `d{1,2}.battery.polluted.json`, `d{1,2,3}.driver.{out,err}`.
