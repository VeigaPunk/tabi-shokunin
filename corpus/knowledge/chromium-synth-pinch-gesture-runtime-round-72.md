source: S179 (Chromium 155.0.8059.84 components/input/touchpad_pinch_event_queue.cc, opened 2026-11-06, round 72); S176, S177, S178 (round 71); S174 (input_handler.cc); S173 (Input.pdl); runtime receipt corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json
verified-at: 2026-11-06, lane round 72, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, loopback fixture, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-synthpinch-round72.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r72-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-synthpinch-r72.mjs --receipt $S/receipt.json --expect-driver-sha256 d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 (exit 0 = still true on this host)

# Input.synthesizePinchGesture — the ctrl+wheel delta law (round 72)

Successor to `chromium-synth-pinch-gesture-runtime-round-71.md`, which stays the reference for
leg durations, the touch path, validation errors and the zero-scale wedge. This note adds the
one thing round 71 left as inference: what the `deltaY` of a pinch's ctrl+wheel events means,
and where it comes from. The capability row `chromium-synth-pinch-gesture-linux` is still
**withheld** (round-72 claim C1 stopped on its battery leg; see the round-72 lesson), so this is
knowledge, not a capability.

## Sourced: one pinch update becomes one ctrl+wheel with deltaY = −100 ln(update scale)

S179 is the browser-side queue that turns touchpad pinch updates into the wheel events a page
sees. At this tag:

- line 44: "delta_y = 100.0f * log(pinch_event.data.pinch_update.scale);" — per update, the
  natural log of that update's incremental scale, times 100;
- lines 39–40: "Note that 'wheel' event deltaY values have their sign inverted. So to convert a
  wheel deltaY back to a scale use Math.exp(-deltaY/100)." — zoom-in arrives as negative deltaY;
- line 54: the update's modifiers OR `kControlKey` — every such wheel has `ctrlKey: true`;
- line 58: `kScrollByPrecisePixel` — the page sees `deltaMode: 0`.

Because logs add, the deltas of one gesture sum to −100 ln(scaleFactor) whatever the number
of updates (S179:34, "deltas should accumulate via addition").

## Measured: the page-side sum holds only after multiplying by the page scale

Scored receipt (nonce `tabi-r72-l1-5a690aee`, sha256 `ac2245cf…60b9`), events recorded by the
page with the visual-viewport scale read in the handler:

| leg | params | wheels | Σ deltaY | Σ deltaY × scale | −100 ln(scaleFactor) | page scale |
|---|---|---|---|---|---|---|
| in | 2×, mouse | 17 | −48.992 | −69.3147 | −69.3147 | 1 → 2 |
| out | 0.5×, mouse | 17 | 51.316 | 69.3147 | 69.3147 | 2 → 1 |
| clamp | 0.5× at scale 1 | 16 | 69.315 | 69.3147 | 69.3147 | stays 1 |
| default | 1.5×, no source | 9 | −32.572 | −40.5465 | −40.5465 | 1 → 1.5 |
| zero | 0×, mouse | 282 | 0 | 0 | — (no finite end) | stays 1.5 |

The raw sums match S179 only where the page scale stays 1 (clamp). While the page zooms, each
delivered deltaY is smaller, and Σ deltaY × scale recovers −100 ln(scaleFactor) to four decimals
on all four legs. The same held on the five pre-freeze smoke receipts (the frozen counter's
`wheel-delta-law` check, ±0.5, was clean 5/5). **Inference, not sourced:** Blink delivers the
wheel's deltaY divided by the page scale it applies. S179 does not cover that step. Per event,
deltaY × scale equals −100 ln(scale ÷ previous event's scale) within 0.01 for 11 of 17 `in`,
16 of 17 `out` and 8 of 9 `default` wheels on the scored receipt; the misses sit where two
wheels record the same handler-time scale, so the handler-time reading can lag a wheel and
only the per-leg sum is exact here.

What this gives a driver or a page: summing `deltaY * visualViewport.scale` over a pinch's
ctrl+wheels recovers the requested factor, and `Math.exp(-sum/100)` is the factor itself. The
clamp leg shows the browser still sends the full zoom-out stream when the page scale cannot go
below 1.

## Measured: the anchor is not exact while zooming

Wheel `clientX/clientY` sit at the pinch anchor (400,300) when the page scale is 1 (clamp leg:
16/16 exact). In the zooming legs some sit 1 px off: on the scored receipt 12 of 17 `in`
wheels and 6 of 9 `default` wheels are at x 399 and/or y 299, and all 17 `out` wheels are off
anchor. The frozen counter allows ±1 px on in/clamp/default; the frozen battery's case that
shifts the first `in` wheel by +2 px assumed it starts at 400 and so failed to cross that
tolerance on receipts where it starts at 399 (round-72 lesson, Mistakes row 1).

## Closed since round 71: the record is closed in one synchronous call

The round-71 independent run caught a zero-scale wheel landing after the driver relabelled
the leg. The round-72 driver closes the page's event record in one `window.__closeRecord()`
evaluation and counts what arrives afterwards (`lateAfterClose`, 42 on the scored run) instead
of labelling it; the counter binds every recorded event to the window of its leg mark
(`event-leg-window`, `leg-marks`). The zero-scale stream itself is unchanged: 282 zero-delta
ctrl wheels over 4.7 s and no CDP response.

## Limits

- One host: Chromium 155.0.8059.84 headless on Arch Linux, desktop viewport, deviceScaleFactor 1.
- The page-scale division is measured, not sourced (above).
- No capability is claimed by this note.
