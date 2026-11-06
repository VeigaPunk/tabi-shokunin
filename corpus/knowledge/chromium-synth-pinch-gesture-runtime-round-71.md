source: S176 (Chromium 155.0.8059.84 content/common/input/synthetic_pinch_gesture.cc), S177 (synthetic_touchpad_pinch_gesture.cc), S178 (synthetic_touchscreen_pinch_gesture.cc), all opened 2026-11-06; S174 (input_handler.cc lines 2093-2136 and 295-305 at the same tag); S173 (Input.pdl lines 272-284 at the same tag); runtime receipt corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json
verified-at: 2026-11-06, lane round 71, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP product Chrome/155.0.8059.84, loopback fixture, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-synthpinch-round71.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r71-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-synthpinch-r71.mjs --receipt $S/receipt.json --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af (exit 0 = still true on this host)

# Input.synthesizePinchGesture — measured runtime delivery (round 71)

What a page receives when a CDP client calls `Input.synthesizePinchGesture` on this host, and
which source line explains it. Before this round the lane held the scroll (r69) and tap (r70)
synthetic gestures; the pinch command had no note, receipt or capability row.

## Measured (scored run, nonce `tabi-r71-scored-189a293f`, receipt sha256 19e3c5b6…1ab6)

Anchor (400,300) in CSS pixels. The page scale carries over from leg to leg. "Scale" is the
visual-viewport scale after the leg; the page-side `visualViewport.scale` and CDP
`Page.getLayoutMetrics` `cssVisualViewport.scale` agree on every leg.

| leg | params | page events (moves omitted) | scale | duration |
|---|---|---|---|---|
| in | `scaleFactor:2, mouse` | 16 `wheel`, all `ctrlKey:true`, `deltaMode:0`, `deltaY<0` | 1 → 2 | wheel span 242.5 ms |
| out | `scaleFactor:0.5, mouse` | 16 `wheel`, ctrl, `deltaY>0` | 2 → 1 | 242.6 ms |
| clamp | `scaleFactor:0.5, mouse` at scale 1 | 16 `wheel`, ctrl, `deltaY>0`, all at exactly (400,300) | stays 1 | 242.5 ms |
| unit | `scaleFactor:1, mouse` | none; CDP answers success `{}` | stays 1 | — |
| default | `scaleFactor:1.5`, no source | 9 `wheel`, ctrl, `deltaY<0` | 1 → 1.5 | 125.8 ms |
| touch | `scaleFactor:2, touch` | pointerdown(touch), touchstart, pointerdown(touch), touchstart, 15 two-finger `touchmove`, pointerup(touch), touchend, pointerup(touch), touchend | stays 1.5 | touch span 231.2 ms |
| slow | `touch, relativeSpeed:200` | same sequence, 57 `touchmove` | stays 1.5 | 925 ms (4.0× touch) |
| pen | `gestureSourceType:'pen'` | none; CDP error `-32602 "Unknown gestureSourceType"` | — | — |
| outside | `x:5000` | none; CDP error `-32602 "Position out of bounds"` | — | — |
| zero | `scaleFactor:0, mouse` | 282 `wheel`, ctrl, every `deltaY` 0; **no CDP response within 4 s** | stays 1.5 | wheels for the whole 4.7 s window |

All events `isTrusted: true`. A pre-freeze smoke run (`.ufo/waves/round-71/controls/c1/smoke1.receipt.json`)
and the scored run gave the same counts and spans to within 1 ms.

## What this means for a driver

1. **A mouse pinch is a ctrl+wheel stream, not a gesture event, at the page.** The touchpad
   path sends `GesturePinchBegin/Update/End` to the browser (S177:96-128); the page sees only
   trusted `wheel` events with `ctrlKey:true`. No `gesturestart/change/end` arrived. A page that
   blocks zoom by `preventDefault()` on ctrl+wheel will therefore block CDP pinches too
   (inference from the delivery path, not measured: the fixture listens passively).
2. **An omitted source is a mouse pinch on this host.** The `default` leg is the touchpad
   stream (S176:29-31 asks the target for its default source; S176:34-40 picks the touchscreen
   gesture only for touch). This is the opposite of taps, where an omitted source becomes touch
   (r70 note item 2, S175:22-26). The PDL text "queries the platform for the preferred input
   type" (S173:282-283) is true for pinch and was false for tap.
3. **Duration follows the source formula exactly.** Touchpad: `(s − 1) × 200 / speed` seconds,
   with `s` inverted below 1 (S177:160-172): 2× and 0.5× both take 0.25 s at the default speed
   800 (S174:2106, 2116-2117) — measured 242.5 and 242.6 ms — and 1.5× takes 0.125 s
   (measured 125.8 ms). Touch: the slow leg at speed 200 takes 4.0× the default leg
   (S178:169-171, distance / speed).
4. **The page scale has a floor of 1 on this desktop configuration.** The clamp leg sends the
   full zoom-out wheel stream but the scale stays 1. Its 16 deltas sum to 69.3147, i.e.
   `100 × ln 2` to four decimals: each ctrl-wheel event carries `deltaY = −100 × ln(step)` at
   page scale 1. While the page is zoomed, the page-side `deltaY` is smaller (in: −49.0 summed
   over 1 → 2), consistent with division by the current page scale (inference; R71Exec3 tests
   it per event).
5. **`scaleFactor: 1` is an immediate success with no input** (S177:88-90, S178:90-92).
6. **`scaleFactor: 0` never finishes.** The touchpad end time divides by zero (S177:162-172:
   `1/0` → infinite delta → infinite duration); the release build skips the `DCHECK_GT(scale, 0)`
   (S177:29), so the gesture runs forever, `HasReachedTarget` never holds, and Chromium never
   sends the response (S174:295-305 answers only on `GESTURE_FINISHED`). The page receives an
   endless stream of zero-delta ctrl wheels. A driver must bound this call with its own
   timeout; the frozen driver waits 4 s and kills the browser afterwards.
7. **A touch pinch delivers two touch points on one vertical line moving apart, and does not
   zoom this desktop page.** Both pointers share the anchor's x (533 CSS px at scale 1.5) and
   the span grows monotonically from 87.3 to 206.7 CSS px (S178:117-133, 153-167). The page
   scale did not change on either touch leg (mobile:false, no touch emulation); whether mobile
   emulation makes touch pinches zoom was probed by R71Exec3: it does not (below).
8. **Validation errors are synchronous** (S174:2111-2114, 2119-2125): out-of-bounds and an
   unknown source answer `-32602` at once with no input, even while an earlier gesture is
   still running.
9. **The zero-scale gesture outlives the call that started it.** Its wheels keep arriving after
   the driver has moved on: in R71Exec1's independent run one zero-delta ctrl wheel (seq 575)
   landed after the driver had relabelled the page's leg to `end`, between the label change and
   the event read (`.ufo/waves/round-71/w1/R71Exec1/receipt.json`). The scored run and the smoke
   run had none. Anything a driver does after a zero-scale pinch in the same tab can be
   interleaved with that stream until the browser is killed. The frozen counter refuses such a
   receipt (`event-leg-domain`), so round-71 claim C1 failed its independent-run leg; see the
   round-71 lesson.

## How to tell the gesture from a look-alike

`Input.dispatchMouseEvent` with `type:'mouseWheel'` and `modifiers:2` (ctrl) also zooms, and
`Emulation.setPageScaleFactor` sets the scale with no input at all. The counter
(`scripts/check-synthpinch-r71.mjs`) refuses both from the driver's CDP send log
(`no-lookalike-producer`), requires exactly the ten frozen `Input.synthesizePinchGesture`
calls, and re-derives every leg from the page's raw events. The degenerate control runs
(`.ufo/waves/round-71/controls/c1/degenerate-*`) show what each look-alike leaves behind:
`dispatch-wheel` does not reach scale 2 in 12 events and has no touch legs; `set-scale` has
no wheel events at all; `skip-touch` lacks the two touch legs.

## Probe measurements beyond the frozen legs (R71Exec3, wave w1; seat receipts, not the scored run)

Measured by a lane-dispatched seat with its own probe driver on the same host
(`.ufo/waves/round-71/w1/R71Exec3/report.md`, receipts beside it). They extend the items above;
none contradicts a frozen leg.

- **Scale range.** A 3× mouse pinch from 1 lands at 3; a second 3× from 3 stops at exactly **4**
  while its wheels keep firing. The floor is the page's **initial** scale, not the constant 1:
  1 on this desktop page, 0.4217 under `mobile:true` on the 3000 px-wide fixture. Item 4's
  "floor of 1" is the desktop case of this rule.
- **Negative scale.** `scaleFactor:-1` answers success, delivers exactly one trusted ctrl wheel
  with `deltaY` NaN, and leaves the scale unchanged (no range check in S174:2109; the release
  build skips S177:29 and :173; a negative duration finishes at the first tick, S177:140-148).
- **The zero-scale hang blocks every later synthetic gesture.** After a zero-scale pinch, a valid
  2× pinch and an `Input.synthesizeScrollGesture` both get no response and deliver no event of
  their own, while `Runtime.evaluate` still answers. One zero-scale call wedges the gesture queue
  until the browser is killed.
- **Touch pinches do not zoom under mobile or touch emulation either** (`mobile:true`, touch
  emulation on); the default source stays the mouse path there too.
- **Duration law** `(s − 1) × 200 / speed` (inverse below 1) holds at speeds 100, 800 and 1600
  px/s and scales 0.25, 2 and 3.
- **Wheel-delta law per event:** `deltaY = −100 × ln(step) / pageScale`; summed over a leg,
  `Σ(−deltaY × scale) / 100 = ln(factor)` in all seven wheel legs it measured. The page-side
  scale read can lag by one event.
- **Anchor bounds scale with zoom:** the anchor is multiplied by the page scale before the
  bounds check, so at scale 3, (426,300) is accepted and (427,299) is refused.

## Not established

- `deviceScaleFactor ≠ 1` and headed Chromium.
- How long the gesture queue stays wedged without a browser kill (the probes killed it).
