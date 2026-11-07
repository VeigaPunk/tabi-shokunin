# R79Exec1 — leg (b) report: two independent cold runs, scored by the frozen counter

Seat: R79Exec1 (leaf executor), Tabi round 79 wave w1. Date 2026-11-07. Base D = 80830674d421e97bb1c01c836bfbb3dc49687dbc.
Full command log with every exit code: `.ufo/waves/round-79-seats/R79Exec1/ledger.txt`.

## What ran

1. Frozen driver, cold run 1 — nonce `tabi-r79-cold1-80830674d421`, ports 18950/18951, scratch `/fast/scratch/hyaku/tabi-r79/R79Exec1`, receipt `.ufo/waves/round-79-seats/R79Exec1/cold1.json` (sha256 `e1ae059a…00ff9`, fixture sha256 `7388d6c6…c176`). **Exit 0**, 10/10 legs, `failures: []`, Chrome/155.0.8059.84.
2. Frozen driver, cold run 2 — nonce `tabi-r79-cold2-80830674d421`, ports 18952/18953, receipt `cold2.json` (sha256 `f9ba7da5…0ffb6`, fixture sha256 `a68e6558…0f414`). **Exit 0**, 10/10 legs, `failures: []`, Chrome/155.0.8059.84.
3. Counter on each cold receipt with the assigned command (committed prior set + the (a) receipt as `--prior`, no exemption flag): **exit 1** both times, verdict `findings`, 55/56 checks true, sole finding id `prior-set-complete` naming `corpus/evidence/round79/chromium-showpicker/receipt.json`.
4. Same two scorings plus the counter's own content-bound exemption (`--tree-exempt-sha256 6d243c77…1535`, the file sha256 of the (a) receipt): **exit 0**, verdict `clean`, 56/56 checks, 0 findings, both receipts.
5. Counter re-run on the (a) receipt itself with `--prior` pointing at my cold1: **exit 0**, verdict `clean`, 56/56, 0 findings, priorSet 4 — the committed prior set still accepts the (a) receipt once my cold run is added as a prior.

## The one finding id observed (reported, then fixed at the instrument)

`prior-set-complete` fired on both assigned-command scorings and named exactly one path: the (a) receipt. Mechanism (read from the then-frozen counter, not inferred): its tree walk covered `.ufo/waves/round-79` and `corpus/evidence/round79`; any receipt-schema file found there that was not the receipt under test, not exempted by sha256, and not among the 4 committed priors tripped this check. The (a) receipt lives in the walked evidence tree, so cold receipts scored with the assigned command exited 1 with this sole finding; the counter's content-bound exemption flag resolved it to exit 0 clean (path-shaped exemptions are refused, unmatched hashes are refused via `prior-set-unmatched-exempt`).

**Resolution (L1, D re-frozen as `3a1209c0d624`):** the counter was fixed at the instrument — the walk now excludes every loaded prior (`--prior` paths included) — and both seat cold receipts re-scored **exit 0 / verdict clean / 56/56 / 0 findings** with the assigned command and no exemption flag. The (a) receipt was since rewritten again (mtime/size pinned, so only content hashes identify it): against the current bytes (sha256 `708bc934…1f00d`, nonce `tabi-r79-l1-f154beeff14e`) cold1, cold2, and the (a) receipt itself (receipt-under-test with `--prior` cold1) all re-verified **exit 0 clean, 56/56, 0 findings** — evidence `score-cold{1,2}-f154beef-assigned-cmd.json`, `score-a-f154beef-prior-cold1.json`; ledger Addendum 2 records the hash used. Pre-fix exit-1 captures and exemption runs remain in the seat dir as history. No predicate, pin, prior, threshold or kill rule was amended by this seat.

## Result against my milestone

Two independent cold runs of the frozen driver: both exit 0 with 10/10 legs and identical measured laws (gesture NotAllowedError with choosers 0 on and off interception; one activation buys one picker; `Runtime.evaluate {userGesture:true}` satisfies the gesture with `isActive` false / `hasBeenActive` true; success consumes `isActive`; disabled input InvalidStateError without consuming; chooser mode `selectSingle`/`selectMultiple` matching the page-measured input; interception off auto-cancels via page `cancel`; armed `cancel:true` fires chooser AND page `cancel`; no file selection, no pointer/input/change events). `nodeReport` backendNodeIds vary per run (3/4/5) and `node-binding-law` passed in every scoring — consistent with the QUALITY 150 no-literal rule.

**Zero honest refusals**: `limit.refused` is false for every prior in every scoring and no verdict was ever `refused`.

## Evidence files (all under `.ufo/waves/round-79-seats/R79Exec1/`)

`cold1.json`, `cold2.json` (driver receipts), `ledger.txt` (every exit code and finding id), `score-cold1-assigned-cmd.json`, `score-cold2-assigned-cmd.json` (exit 1, finding captured), `score-cold1-exempt.json`, `score-cold2-exempt.json` (exit 0 clean), `score-a-receipt-prior-cold1.json` (exit 0 clean).

## Risks

- `prior-set-complete` will fire for every other seat that scores a cold receipt with the assigned command while the (a) receipt remains unexempted in the walked evidence tree. Expect the same single finding id in their ledgers; it is tree state, not receipt content.
- This report deliberately omits the r79 receipt schema literal: the counter flags any non-JSON file in the walked trees containing that string as `unparsable` and refuses. Prose in `w1/` must stay free of it.

## Bounds compliance

No tool installs (nothing needed; pacman untouched). No git/jj commands. No writes into `.ufo/waves/round-79/` besides these two sanctioned prose files, none into `corpus/evidence/round79/`. Scratch `/fast/scratch/hyaku/tabi-r79/R79Exec1` deleted before yield; all receipts and score evidence copied into the seat dir first.
