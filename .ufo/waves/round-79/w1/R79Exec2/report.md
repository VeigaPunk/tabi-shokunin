# R79Exec2 — leg (b) cold runs 3 & 4 + space-scratch absolute-path run

(Prose copy of `.ufo/waves/round-79/w1/R79Exec2.md`, placed here per the seat-output rule.)

## Final per-run results (receipts L1 may commit — both counter-clean)

| run | nonce | driver exit | counter | checkCount | findings | fixture sha256 | receipt |
|---|---|---|---|---|---|---|---|
| cold3 (attempt 3) | `tabi-r79-cold3-80830674d421` | 0 | exit 0, verdict clean | 56 | none | `dcce513fcc497379bae1d1ba14894c47ee96646343d2c212dfd1f7c44b596f6e` | `.ufo/waves/round-79-seats/R79Exec2/cold3-receipt.json` |
| cold4 (attempt 2, scratch = `/fast/scratch/hyaku/tabi-r79/R79Exec2/scratch with space`, TMPDIR/HOME unchanged) | `tabi-r79-cold4-80830674d421` | 0 (0 recorded leg failures) | exit 0, verdict clean | 56 | none | `90afbe00077ce534c7a42f255ec45fb65e7d01c4a988b781bac897a43df98fd7` | `.ufo/waves/round-79-seats/R79Exec2/cold4-receipt.json` |

Both receipts: 10/10 legs, zero recorded failures, viewport 1280×900, host Chromium 155.0.8059.84 Arch Linux, fresh launch tokens/browser ids (replay checks against the committed prior and the prior-set probes all passed). Driver pin `e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933` verified before every run. Counter invocation for both finals used the committed prior set + `--prior <committed receipt>` + `--tree-exempt-sha256 <sha256 of the committed receipt bytes>` (required; see A2).

**Space-path run verdict: PASS** — driver exit 0, counter clean 56/56 with scratch under a path containing a space; TMPDIR and HOME unchanged; profile dirs observed created under the space path.

## Honest refusals during this seat (leg (b) failure material)

5 driver executions total; 3 honest refusals (driver exit 1, failures recorded, receipt still written):

| attempt | nonce | exit | recorded drive errors | receipt (preserved) |
|---|---|---|---|---|
| cold3 attempt 1 (parallel launch) | cold3 | 1 | `no-response-30000ms Runtime.evaluate` on `sp-cdp-gesture`, `sp-disabled` | `cold3-receipt.attempt1.json` |
| cold4 attempt 1 (parallel launch, space scratch) | cold4 | 1 | same on `sp-cdp-gesture`, `sp-multiple-show` | `cold4-receipt.attempt1.json` |
| cold3 attempt 2 (serial) | cold3 | 1 | same on `sp-cdp-gesture`, `sp-intercept-off-click-then-show` | `cold3-receipt.attempt2.json` |

Counter findings on refused receipts cascade from the truncated leg records: `leg-records`, `leg-marks`, `plan-calls`, `leg-sp-cdp-gesture`, `leg-sp-disabled` / `leg-sp-multiple-show` / `leg-sp-intercept-off-click-then-show`, `activation-law`, `immutable-law` (attempt 1 cold3 only), `no-selection-law`, `cancel-law` (attempt 2 cold3 only), `host-argv`, `devtools-port-binding`, `replay-devtools-url`, plus the A2/A3 prior-set artifacts.

## Driver flake characterization (A1 — the one real leg-(b) risk)

- Trigger: a per-leg `Runtime.evaluate` gets no CDP response for 30 s. In every hang the leg's showPicker call had already succeeded and the chooser fired; the hang lands on the post-picker activation/state evaluates.
- `sp-cdp-gesture` hung in 3 of 4 runs that included it (attempt 3 passed). Every hung run had exactly 2 hung legs; every run where `sp-cdp-gesture` passed was fully clean.
- Not explained by parallel launch alone (serial cold3 attempt 2 still hung); not explained by the space scratch (the space-scratch run passed clean).
- Intermittent, roughly 50–75% per run in this window; a rerun clears it. L1 should expect leg-(b) refusals until root-caused. R79Exec1 warned via peer message.

## Post-fix re-scoring (counter fixed at the instrument, D 3a1209c0d624)

The planner seat fixed the counter mid-wave (new digest `0dc76277…`, pinned in freeze.txt; digest commit `3a1209c0d624…`; driver pin unchanged). Both final receipts re-scored with the assigned command **alone** (no exemption flag): cold3 exit 0 verdict clean 56/0 findings; cold4 exit 0 verdict clean 56/0 findings. Outputs: `cold{3,4}-counter-postD3a12.json` — the authoritative verdicts for my finals. My final nonces embed the original D (`…-80830674d421`); whether leg (b) wants fresh nonces under the new D is the planner's call.

Addendum: the (a) receipt regenerated again (18:29:08, 110208 B, sha256 `708bc934…`, nonce `tabi-r79-l1-f154beeff14e`, fixture `69de1a78…`; counter/driver digests unchanged). Both finals re-scored with the assigned command alone against these bytes: exit 0, verdict clean, 56 checks, 0 findings (`cold{3,4}-counter-f154beef.json`).

## Attack findings on the frozen instruments (no amendments proposed)

- **A2 — counter gap vs its own header sentence (FIXED at the instrument mid-wave).** Against the pre-fix counter (`4072031b…`), `--prior` receipts were not in the walk-completeness set, so scoring a seats-dir receipt tripped `prior-set-complete` naming the committed receipt. Fixed counter (`0dc76277…`, line 460) includes `extraPriors`; the exemption workaround is no longer needed; both finals score clean 56/56 under the assigned command alone.
- **A3 — mid-wave receipt rewind; mtime is not a change signal.** Committed (a) receipt bytes changed three times in my window: 18:08 `6d243c77…` (110071 B, nonce `…-80830674d421`, fixture `2e80efa0…`) → 18:19 `bda38512…` (108106 B) → later `f5c17f66…` (current, nonce `…-3a1209c0d624`, fixture `32751f03…`) with mtime pinned at 18:19:38.795630086 and size pinned at 108106 across the last two states. Stale exemption hashes trip `prior-set-unmatched-exempt` (observed). Hash at scoring time.
- Fixture sha256 differs per run (origin contains the run's port); each counter scoring must pass the receipt's own fixture sha256 as `--expect-fixture-sha256`.

## Bounds compliance

All JSON/receipt outputs under `.ufo/waves/round-79-seats/R79Exec2/` only; nothing written into the walked trees except this prose report at the two seat-named paths. No git/jj mutations, no subagents, no installs (pacman guard respected), scratch root deleted before yield.
