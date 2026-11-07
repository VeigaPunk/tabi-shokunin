source: S180, S181, S182, S183 (Chromium 155.0.8059.84 Blink wheel delta path, opened 2026-11-06, round 73); S179 (touchpad_pinch_event_queue.cc, round 72); S176, S177, S178 (round 71); S174 (input_handler.cc); S173 (Input.pdl); pre-freeze repetition receipts .ufo/waves/round-73/controls/c1/smoke1..9.receipt.json
verified-at: 2026-11-06, lane round 73, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, loopback fixture, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-synthpinch-round73.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r73-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-synthpinch-r73.mjs --receipt $S/receipt.json --expect-driver-sha256 <freeze.txt driver digest> --expect-nonce tabi-r73-recheck-<hex> --prior .ufo/waves/round-73/controls/c1/smoke1.receipt.json (exit 0 = still true on this host)

# Input.synthesizePinchGesture — why Σ deltaY × page scale is the law (round 73)

Successor to `chromium-synth-pinch-gesture-runtime-round-72.md`. Round 72 sourced the browser
half of a pinch's ctrl+wheel stream (S179: one pinch update becomes one wheel with
`delta_y = 100 log(update scale)`, sign inverted for the page) and measured that the page-side
sum only matches after multiplying each `deltaY` by the page scale. It marked that division
**inference**. This note sources it: the Blink path from the native wheel to the DOM `deltaY`
divides by the page scale, and nothing else at deviceScaleFactor 1 and no emulation scale.

## Sourced: the page sees −delta_y ÷ (page scale × emulation scale) ÷ devicePixelRatio

Four files at tag 155.0.8059.84, read in the order a wheel takes:

1. S182 `web_input_event_conversion.cc:127-134` — a wheel entering a frame is stamped with
   `SetFrameScale(FrameScale(frame_view))`; `FrameScale` (lines 56-65) is
   "scale = root_view->InputEventsScaleFactor();" (default 1).
2. S183 `local_frame_view.cc:1994-1998` — `InputEventsScaleFactor` is the visual viewport's
   page scale times the emulation input scale: "float page_scale = frame_->GetPage()->GetVisualViewport().Scale();".
3. S180 `web_mouse_wheel_event.cc:103-105` — the root-frame delta divides by that stamp:
   "return delta_y / frame_scale_;".
4. S181 `wheel_event.cc:110-111` — the DOM event negates it and divides by devicePixelRatio:
   "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio())".

With S179 (`delta_y = 100 ln(update scale)`), a page at devicePixelRatio 1 with no emulation
input scale reads, per update, `deltaY = −100 ln(update scale) ÷ pageScale`, where `pageScale`
is the visual-viewport scale at the moment Blink converts the wheel. So
`deltaY × pageScale = −100 ln(update scale)`, and because logs add, the sum over a gesture is
`−100 ln(scaleFactor)`.

**Still inference:** that `InputEventsScaleForEmulation()` is 1 on this host. The driver sets
`Emulation.setDeviceMetricsOverride` without a `scale` parameter and the measured law below holds
to 4×10⁻⁵, which is what a factor of 1 predicts; the ChromeClient implementation was not opened.

## Measured: the law on nine cold runs of the r73 driver

Pre-freeze repetitions smoke1..9 (`.ufo/waves/round-73/controls/c1/`), each a cold Chromium
launch. Per leg, Σ deltaY × scale versus −100 ln(scaleFactor):

| leg | factor | wheels per run | Σ deltaY × scale (all 9 runs) | raw Σ deltaY range |
|---|---|---|---|---|
| in | 2 | 16–17 | −69.3147 | −49.960 … −48.888 |
| out | 0.5 | 16–17 | +69.3147 | +50.739 … +51.376 |
| clamp | 0.5 at scale 1 | 16–17 | +69.3147 | +69.315 (page scale stays 1) |
| default | 1.5 | 8–9 | −40.5465 | −32.814 … −32.569 |

Largest deviation from −100 ln(factor) over 36 leg sums: 4.2×10⁻⁵. The raw sums vary run to
run (the number of updates and the scale each lands at vary); the scale-weighted sums do not.
That is the sourced chain's prediction: the page scale is divided out per event and multiplied
back per event.

## Measured: the anchor jitter is in the first `in` wheel's x

First `in` wheel clientX over the nine runs: 400 six times, 399 three times; first `default`
wheel: 400 seven times, 399 twice. A battery case that shifts that x by a fixed amount
crosses the ±1 tolerance only on some runs (round-72 lesson, Mistakes row 1); the r73 battery
sets it absolutely (`in-wheel-anchor-abs-402`, `-398`).

## Limits

- One host: Chromium 155.0.8059.84 headless on Arch Linux, desktop viewport, deviceScaleFactor 1.
- Sourced only at this tag; the emulation factor is measured as 1, not sourced.
- Whether a capability row is admitted is the round-73 claim's business (round-73 lesson), not
  this note's.
