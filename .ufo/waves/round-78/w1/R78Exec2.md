FINDINGS

Seat R78Exec2 scoped findings (full report: .ufo/waves/round-78/w1/R78Exec2/report.md).

1. Post-freeze repetition, leg (b): the r77 honest-refusal class is gone. Five fresh cold runs — my d1 `tabi-r78-exec2-d1-fc16cf38`, d2 `tabi-r78-exec2-d2-d8d246e9`, d3 `tabi-r78-exec2-d3-4a2cd214` (driver exit 0 ×3, sha256 `0ae89d9…523f` verified), cold1 `tabi-r78-cold1-d59ca0270c2a`, and R78Exec1 `tabi-r78-exec1-d59ca0270c2a` — all counter exit 0 clean, 186/186 checks, after the L1 removed a polluting artifact from the walked tree. Batteries on d1/d2/d3: exit 0, allOk=true, 398/398 (372 refuse + 23 must-accept + 3 laundered), coverageGap 0, positiveOk. Red count: 0 content-driven refusals in 5 runs.

2. Finding (environmental, receipts exonerated): for ~10 min after 15:14, `.ufo/waves/round-78/scored/selftest-r78-gates.out` — the L1's own selftest output, first byte `{`, JSON.parse fails at position 7629 — sat inside the walked tree and made every counter of an honest receipt exit 1 (`prior-set-unparsable`), my first-pass d1/d2/d3 included, and cascaded batteries to 5/398 (positive included; `--tree-exempt` does not exempt unparsable files). Same receipts exit 0 clean after removal; polluted outputs archived in my seat as `*.polluted.json`. Risk: any post-D `{`/`[`-leading non-JSON artifact inside `.ufo/waves/round-78` or `corpus/evidence/round78` refuses every cold run and the whole battery; keep gate/selftest outputs in seats dirs.

3. E1 confirmation: per-leg chooser MODE only is bound; nodeReport identical across all five runs — pick-single:5, pick-multiple:7, pick-same:5, pick-first-only:5, pick-missing:5, pick-empty:5, dir-mode:14, accept-ignored:18, forward-click:5, intercept-cancel:5; modes 9× selectSingle + 1× selectMultiple (pick-multiple), script-click opened=false, intercept-off no event, not-file-input refused −32000.

4. Calibration: needs from the counter's own denominators — 40/9 (N_p=79, G_p=11), 19/9 (N_p=37), 18/9 (N_p=35). Max absMatched over all honest ordered pairs = 0 (need 40); max gapMatched = 5 (need 9, cold1-recheck vs c1/deg-swap-files.receipt.json); no pair refused.

5. Housekeeping: assignment's cold1 path `.ufo/waves/round-78/scored/cold1.receipt.json` does not exist; the counted cold1 receipt is `.ufo/waves/round-78-seats/L1-cold1/receipt.json`. No tool installs, no git mutations, scratch `/fast/scratch/hyaku/tabi-r78/R78Exec2` removed, all JSON confined to `.ufo/waves/round-78-seats/R78Exec2/`.
