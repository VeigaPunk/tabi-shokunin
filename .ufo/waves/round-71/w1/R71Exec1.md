DIVERGENT

# R71Exec1 — C1 cold re-derivation (legs b, c)

Full detail + raw receipts: `.ufo/waves/round-71/w1/R71Exec1/report.md` and the files beside it.

## Pins
All four frozen artifacts match `freeze.txt`: driver 5318780c…22af, counter 310fac05…176c, negatives 830bbb0d…d14a, kill-power b86fc3d7…b1e.

## Leg (b) — cold driver run
`node scripts/chrome-cdp-synthpinch-round71.mjs --scratch /fast/scratch/hyaku/tabi-r71/R71Exec1/d --out .../w1/R71Exec1/receipt.json --nonce tabi-r71-exec1-7f6bc402 --http-port 41233 --cdp-port 41234` → exit 0, 14.38 s, 575 events, predicate true, hypothesis CONFIRMED, all 11 legs behave as frozen (in 1→2, out→1, clamp 1, unit no events, default 1.5, touch/slow no scale change 15/57 touchmoves ratio 4.0, pen/outside -32602, zero 282 zero-delta wheels then no-response-4000ms).

`node scripts/check-synthpinch-r71.mjs --receipt .../w1/R71Exec1/receipt.json --expect-driver-sha256 5318780c…22af --json` → **exit 1**, `checkCount 87`, one finding: **`event-leg-domain` — "events outside the frozen legs: 1"** (86/87 pass, incl. legshape-consistency, scale-agreement, wheel-delta-law, slow-ratio, teardown-closure).

### F1 — driver boundary race (real cold-run divergence)
Event seq 575 (`leg:"end"`, wheel, ctrlKey true, deltaY 0, clientX/Y 533/400, ts 13449.4) is the zero gesture's next frame, 16.7 ms after its last wheel at 13432.7, with the same coords/values. `scripts/chrome-cdp-synthpinch-round71.mjs:183-185` documents that scaleFactor 0's gesture end time is infinite; `:322` leaves it running; `:330` sets `window.__setLeg("end")` and `:331` snapshots events on the next CDP round-trip, so a late zero-delta wheel is tagged with a label outside `LEG_ORDER`. `scripts/check-synthpinch-r71.mjs:100` rejects any such event. The scored receipt missed the window and is clean; this cold run did not. Not re-run (one attempt per scored step).

Per-leg vs scored: in/out/clamp 17 vs 16 wheels (both inside frozen `[5,sign]`, spans 241.6-250.0 vs 242.5-242.6 ms); default 9/9; zero 282/282 (4666.4 vs 4674.1 ms); touch 15/15; slow 57/57; scales equal within 1e-6.

## Leg (c) — negatives
`node scripts/negatives-synthpinch-r71.mjs --real .../corpus/evidence/round71/.../receipt.json --work /fast/scratch/hyaku/tabi-r71/R71Exec1/n --laundered ...(3 degenerate receipts) --json` → exit 0; positiveOk true; cases 107/107 fired expected ids; isolatedCases **98**; failed []; checkIds 87; coverageGap []; allOk true. The 9 non-isolated cases are the battery's own declared multi-id cases.

## Leg (c) — kill-power
`node .ufo/waves/round-71/controls/c1/kill-power.mjs --lane tabi-shokunin --real ... --work .../k --out .../w1/R71Exec1/kill-power.json --jobs 4` → exit 0; `mutants 87, killed 87` (**87/87**), survivors [], holds true, unmutatedExit 0.

## Verdict
Legs (c) reproduce the scored numbers exactly (98 isolated, 87/87 killed). Leg (b) reproduces every substantive pinch leg and the producer verdict but trips the frozen `event-leg-domain` domain check through a genuine timed race at the zero-leg sentinel boundary — so a clean 87/87 C1 verdict is not cold-reproducible on the pinned bytes.
