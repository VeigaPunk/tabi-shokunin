# R79Exec1 — scoped findings (leg b)

Milestone: two independent cold runs of the frozen driver, scored by the frozen counter.
Evidence: `.ufo/waves/round-79-seats/R79Exec1/` (receipts, score outputs, ledger.txt with every exit code).

## F1 — finding id `prior-set-complete` on both assigned-command scorings (exit 1) — RESOLVED AT THE INSTRUMENT

- Field it named: `corpus/evidence/round79/chromium-showpicker/receipt.json` (the (a) receipt).
- Mechanism (pre-fix counter): tree walk (`.ufo/waves/round-79` + `corpus/evidence/round79`) found a receipt-schema file that was not the receipt under test, not sha256-exempt, and not among the 4 committed priors.
- L1 root-caused and FIXED the counter (re-frozen as D `3a1209c0d624`): the walk now excludes every loaded prior (`--prior` paths included), so a `--prior` receipt in a walked tree no longer trips the check. Re-scored under the fixed counter with the assigned command and NO exemption flag: cold1 and cold2 both **exit 0, verdict clean, 56/56, 0 findings** (evidence: `score-cold1-postD3a12-assigned-cmd.json`, `score-cold2-postD3a12-assigned-cmd.json`). The historical exit-1 captures (`score-cold{1,2}-assigned-cmd.json`) and exemption runs (`score-cold{1,2}-exempt.json`) are retained in the seat dir as the record against the pre-fix counter.
- The (a) receipt is a moving file (rewritten again after the `3a1209c0d624` re-freeze; mtime/size pinned, so only content hashes identify it). Re-verified against the current bytes (sha256 `708bc934…1f00d`, nonce `tabi-r79-l1-f154beeff14e`): cold1, cold2, and the (a) receipt itself (receipt-under-test, `--prior` cold1) all **exit 0 clean, 56/56, 0 findings** — evidence `score-cold{1,2}-f154beef-assigned-cmd.json`, `score-a-f154beef-prior-cold1.json`. Ledger Addendum 2 records the exact hash used.

## F2 — cold runs: clean, zero honest refusals

- Driver cold1 (nonce `tabi-r79-cold1-80830674d421`, ports 18950/18951): exit 0, 10/10 legs, `failures: []`.
- Driver cold2 (nonce `tabi-r79-cold2-80830674d421`, ports 18952/18953): exit 0, 10/10 legs, `failures: []`.
- No refusal verdicts anywhere; `limit.refused=false` for all five priors in all five scorings (no reuse/collision with any prior timeline).
- Prior-set stability: counter on the (a) receipt with `--prior` = my cold1 → **exit 0 clean**, 56/56, 0 findings, priorSet 4.

## F3 — measured laws reproduced in both cold runs (counter-bound)

Gesture NotAllowedError + choosers 0 (interception on and off); one activation = one picker (second call NotAllowedError); `Runtime.evaluate {userGesture:true}` passes with `isActive` false / `hasBeenActive` true; success consumes `isActive`; disabled input InvalidStateError "cannot be used on immutable controls" without consuming; mode `selectSingle`/`selectMultiple` from page-measured input; interception off → no chooser event + page `cancel`; armed `cancel:true` → chooser AND page `cancel`; never selects files, no pointer/input/change events; `nodeReport` backendNodeIds 3/4/5 (non-literals) with `node-binding-law` green — QUALITY 150 holds.

## F4 — prose hazard for other seats (avoid, not a defect)

The counter refuses (`prior-set-unparsable`) any non-JSON file in the walked trees containing the r79 receipt schema literal. Keep all `w1/` prose free of that string; JSON only in the seats tree.

Bounds: no installs, no git/jj, walked trees untouched except these two sanctioned prose files; scratch deleted after copying evidence into the seat dir.
