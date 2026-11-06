CONFIRMED

# R69Exec4 — falsification attempt: touch-source `Input.synthesizeScrollGesture` on Linux headless Chromium 155

**Verdict: H stands (CONFIRMED).** Thirteen `Input.synthesizeScrollGesture` touch-source
variants — `Emulation.setTouchEmulationEnabled`, mobile device metrics alone, mobile
metrics plus touch emulation, a `width=device-width` viewport meta,
`Emulation.setEmitTouchEventsForMouse`, a scrollable div, a larger/slower gesture,
`preventFling:false`, `--touch-events=enabled` (alone and combined), and non-passive touch
listeners — every one delivered `touchstart` + touch pointer events and left the scroll
position unchanged. **No variation made touch scroll.** `touchmove` was delivered in
**0 of 13** synthesize-gesture touch legs. A same-page raw `Input.dispatchTouchEvent` swipe
(attribution control, *not* `synthesizeScrollGesture`) scrolled the document by **+525 px**
and delivered **24 `touchmove`** events, so headless touch scrolling itself works; the
negative is specific to the `synthesizeScrollGesture` touch path.

- Driver: `.ufo/waves/round-69/w1/R69Exec4/driver.mjs`
  sha256 `cd877ec050c81e6c39bfc0f8f758dd4f2db76dd0eb134e13633d68af06353d3a`.
- All 14 receipts in this directory. All pin the same driver bytes; every run used a fresh
  Chromium profile under `/fast/scratch/hyaku/tabi-r69/R69Exec4/<short>/`, a unique
  loopback port pair and a fresh nonce; every receipt shows `nonceOnPage == nonce`, both
  ports closed after teardown, zero surviving launch-token processes and zero failures.
- Frozen round material (`.ufo/waves/round-69/claims.json`, `freeze.txt`, scripts, corpus)
  was not touched. These are advisory exploratory receipts, not scored runs.

## Assignment

Hypothesis H: on `/usr/bin/chromium 155.0.8059.84 --headless=new`,
`Input.synthesizeScrollGesture` with `gestureSourceType:'touch'` delivers
pointer(touch)+touchstart/touchend but does not scroll the document (measured in
`corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json` touch leg). Try to
falsify H with minimal variations, each a separate receipt. Report which variation (if any)
makes touch scroll, and whether `touchmove` is delivered.

## Method

`driver.mjs` serves one loopback fixture and drives one Chromium 155.0.8059.84 headless
instance over CDP per receipt. Each run has two legs:

- `control`: `Input.synthesizeScrollGesture {x:400,y:400,yDistance:-300,gestureSourceType:'mouse'}`.
  This proves the page/document (or div) scrolls at all in that run. It moved `+300 px` in
  every receipt.
- `touch`: the variant's `Input.synthesizeScrollGesture` touch leg
  (`{x:400,y:400,yDistance:-500,gestureSourceType:'touch',preventFling:true}` unless the
  variant changes it).

The page records trusted `wheel`/`pointer*`/`touch*` events with leg, sequence, `isTrusted`,
client coordinates and scroll position at dispatch; a nonce is served in the page and read
back over CDP. `cdpSendLog` records every command sent, so a receipt shows the gesture came
from `Input.synthesizeScrollGesture` (every synth variant: exactly 2 synth calls, no
`Input.dispatchTouchEvent`) or from the explicit dispatch control (1 synth call + 26
`Input.dispatchTouchEvent` calls). Scroll deltas are read after settling (`window.scrollY`,
`document.scrollingElement.scrollTop`, and for the div variant the div's `scrollTop`); the
`scroll` event count is recorded per leg.

Fixture: 6000 px document (or a fixed `overflow:auto` div with a 6000 px child, touch point
inside it). Emulation, viewport meta and launch flags differ only where the table says so.

## Results (one receipt per variation)

All values are from the receipts in this directory; `Δscroll` is the `touch` leg
after-minus-before (document scroll, or div `scrollTop` for `div-scroller`). Control
Δscroll is +300 in every row.

| # | variant / receipt | emulation / flags / fixture | Δscroll control | Δscroll touch | touchstart | touchmove | pointermove(touch) | wheel | scroll events |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `receipt-baseline-doc.json` | plain document | +300 | **0** | 1 | **0** | 39 | 0 | 0 |
| 2 | `receipt-touch-emulation.json` | `Emulation.setTouchEmulationEnabled{enabled:true,maxTouchPoints:5}` | +300 | **0** | 1 | **0** | 39 | 0 | 0 |
| 3 | `receipt-mobile-metrics-only.json` | `Emulation.setDeviceMetricsOverride{mobile:true,1280x900}` alone | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 4 | `receipt-mobile+touch-emulation.json` | as #3 + touch emulation | +300 | **0** | 1 | **0** | 39 | 0 | 0 |
| 5 | `receipt-mobile+meta+touch-emulation.json` | as #4 + `<meta name="viewport" content="width=device-width, initial-scale=1">` | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 6 | `receipt-emit-touch-mouse.json` | `Emulation.setEmitTouchEventsForMouse{enabled:true,configuration:'mobile'}` | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 7 | `receipt-div-scroller.json` | scrollable div instead of document (control Δ is div `scrollTop`) | +300 (div) | **0** (div) | 1 | **0** | 40 | 0 | 0 |
| 8 | `receipt-large-slow.json` | `yDistance:-1200, speed:400` (3.33 s gesture) | +300 | **0** | 1 | **0** | 183 | 0 | 0 |
| 9 | `receipt-no-prevent-fling.json` | `preventFling:false` | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 10 | `receipt-touch-events-flag.json` | launch flag `--touch-events=enabled` | +300 | **0** | 1 | **0** | 39 | 0 | 0 |
| 11 | `receipt-touch-emulation+flag.json` | touch emulation + `--touch-events=enabled` | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 12 | `receipt-mobile+meta+touch-emulation+flag.json` | metrics + touch emulation + meta + flag | +300 | **0** | 1 | **0** | 40 | 0 | 0 |
| 13 | `receipt-nonpassive-touch.json` | page registers `touchstart/touchmove/touchend` with `{passive:false}` | +300 | **0** | 1 | **0** | 39 | 0 | 0 |
| 14 | `receipt-dispatch-touch-control.json` | **attribution control**: raw `Input.dispatchTouchEvent` touchStart/24×touchMove/touchEnd, no synth gesture | +300 | **+525** | 1 | **24** | 1 | 0 | 76 |

Environmental evidence that the emulation/flag variants really applied:

- #2, #11, #4, #5, #12: `ontouchstart in window` true and `navigator.maxTouchPoints` 5
  where `setTouchEmulationEnabled` is present; `navigator.maxTouchPoints` is 0 in baseline.
- #3, #4, #5, #12: `innerWidth/innerHeight` 1280×900 and `clientHeight` 900
  (baseline 1280×813); #3 has `hasTouch:false`/maxTouchPoints 0 because touch emulation was
  deliberately not enabled there.
- #10: `ontouchstart in window` true (maxTouchPoints 0).
- #6: the CDP call is in `cdpSendLog`; page-side touch feature flags stay at baseline
  values (the command only enables the browser-side mouse→touch emulator).

Every synth-gesture touch leg across #1–#13: `touchstart` 1, `touchend` 1,
`pointerdown(touch)` 1, `pointerup(touch)` 1, `pointermove(touch)` 39–183, `wheel` 0,
`scroll` events 0, all events `isTrusted:true`. `touchmove` is 0 in every one, including
the non-passive-listener fixture (#13, where `touchstart` is `cancelable:true`).

## Findings

1. **No tested variation makes touch-source `synthesizeScrollGesture` scroll.** Thirteen
   separate receipts, each with a positive mouse-control leg, all show Δscroll = 0 and
   zero `touch`-leg wheel/scroll events. The baseline (#1) reproduces the lane's scored
   receipt touch leg (pointermove 39–40, `touchmove` 0, scroll 900→900 there; 300→300
   here after the control leg): same invariant on a plain document with the same gesture
   parameters.
2. **`touchmove` is never delivered by that path.** 0 events in 13/13 synth touch legs.
   It is not listener passivity: with non-passive `touchstart/touchmove/touchend` listeners
   (#13) the events remain absent while `touchstart` is cancelable. Raw injected touch
   (#14) delivers 24 `touchmove` events, so the event type is deliverable on this page and
   build.
3. **Pointer motion is delivered, scroll is not.** `pointerdown`/`touchstart` occurs at
   y=400 and the last `pointermove(touch)` has clientY −115 (a ~500 px upward finger drag,
   matching −500 px plus touch slop), with 39 move samples; the larger/slower variant emits
   183 samples over 3.33 s. The page sees the finger move but the scroll position and
   scroll event count never change.
4. **It is not a document-vs-element problem.** In the scrollable-div fixture (#7) the
   mouse control scrolled the div +300 (window scroll 0), and the synth touch leg moved
   neither the div nor the window; zero scroll events.
5. **It is not distance, speed, or fling suppression.** `yDistance:-1200, speed:400` (#8)
   still 0; `preventFling:false` (#9) still 0.
6. **It is not the absence of a touchscreen/touch feature flag.** `--touch-events=enabled`
   (#10), renderer touch emulation (#2), mobile device metrics alone (#3), mobile metrics
   plus touch emulation (#4), and the mobile viewport meta (#5) each change the page-side
   environment (`ontouchstart` true, `maxTouchPoints` 5, mobile inner size 1280×900)
   without changing the outcome. Mobile emulation leaves the pointer/scroll behaviour the
   same (39–40 pointermoves, 0 scroll, 0 `touchmove`).
7. **The touch pipeline itself can scroll on this exact binary.** The attribution control
   (#14) uses `Input.dispatchTouchEvent` on the same fixture and scrolls +525 px with 24
   `touchmove` and 76 `scroll` events. This isolates the failure to the
   `Input.synthesizeScrollGesture` touch path, not to headless Chromium's touch support.
8. **The protocol surface has no knob that reaches the divergent dispatch branch** (source
   reading; see `source-notes.txt`): `InputHandler::SynthesizeScrollGesture` hardcodes
   `from_devtools_debugger = true` (`content/browser/devtools/protocol/input_handler.cc:2108`);
   the touch driver stamps `blink::WebInputEvent::kFromDebugger`
   (`content/common/input/synthetic_touch_driver.cc:57,79`); and the Aura gesture target
   routes debugger-flagged touch events to `window->delegate()->OnEvent(event)` instead of
   `event_injector_.Inject(host, event)`
   (`content/browser/renderer_host/input/synthetic_gesture_target_aura.cc:167-176`). By
   contrast, `Input.dispatchTouchEvent` enables `TouchEmulator::Mode::kInjectingTouchEvents`
   and uses `InjectTouchEvent` (`input_handler.cc:800-819`), the path that scrolls in #14.
   This is a code-path correlate of the measured invariance; the exact renderer-side reason
   the delegate route does not produce a scroll is not traced here (`[INFERENCE]`: the
   causal chain from the branch to the missing scroll is inferred from the branch difference
   plus the empirical invariance, not proven by patching Chromium). The fetched
   `input_handler.cc` at tag `155.0.8059.84` hashes to `72cf0d1d…24f4`, byte-identical to
   the round's pinned S174 staged file, which anchors the referenced source tree to the
   pinned handler bytes.

## Answer to the two questions

- **Which variation (if any) makes touch scroll?** None of the thirteen
  `synthesizeScrollGesture` variations. The only scrolling touch input in the set is the
  different command `Input.dispatchTouchEvent` (attribution control, +525 px). For the
  frozen C2 claim this means the touch leg's "no scroll" is stable across the tested
  emulation/parameter space on 155.0.8059.84.
- **Is `touchmove` delivered?** No for any `synthesizeScrollGesture` touch leg (0/13),
  whether listeners are passive or non-passive, with or without touch emulation/mobile
  metrics. Yes for raw `Input.dispatchTouchEvent` (24 events).

## Limits and honest scope

- One host, one installed build (`Chromium 155.0.8059.84 Arch Linux`), `--headless=new`
  only. Headless-only is the hypothesis's scope; no real touchscreen and no non-headless
  run was tested.
- H is a "never" statement; a finite variation set cannot exhaust it. The honest measured
  claim is: not falsified across 13 variations, and no exposed CDP parameter changes the
  hardcoded debugger-flag dispatch path identified above.
- The exact intra-renderer mechanism (why the delegate-dispatched touch sequence produces
  pointer/touchstart/touchend but no touchmove and no scroll) is not proven; this report
  separates the measured invariant from the `[INFERENCE]` causal reading.
- The `dispatch-touch-control` is not a variation of `Input.synthesizeScrollGesture` and
  must not be substituted into the C2 claim or its frozen counter.
- No frozen predicate, counter, kill rule or scored receipt was modified. The lane's C2
  counter condition `leg-touch-no-scroll` remains true on this build; these receipts are
  advisory evidence for L1, not new scored evidence.
- One operational note: two early mobile runs died before any CDP command with
  `FATAL ... Socket path too long` because the scratch directory name made Chromium's Unix
  singleton socket path exceed the limit; they produced no measurements. All receipts in
  this directory were produced with short scratch paths and clean teardown.

## Reproduction

Driver bytes are pinned by every receipt (`driverSha256`); per-variant ports/nonces and
receipt hashes are in `repro.tsv`. General form:

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Exec4
node driver.mjs --variant baseline-doc \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec4/d01 \
  --out receipt-baseline-doc.json \
  --nonce tabi-r69-exec4-baseline-doc --http-port 41801 --cdp-port 41802
# exit 0 = receipt written with clean teardown; JSON at --out
```

Repeat with the `variant`, `nonce`, ports and short `--scratch` dir from `repro.tsv`.
Chromium is launched by the driver as `/usr/bin/chromium --headless=new` with a fresh
profile under the given scratch; each receipt's `host.argv`, `host.product`, `launchToken`,
`host.stderrHead`, `cdpSendLog` and `teardown` record the launch and closure proof.
Expected result for every synth variant: control leg +300, touch leg 0, `touchstart` 1,
`touchmove` 0, `pointermove(touch)` 39–183, `wheel` 0, `scroll` events 0. Control variant
`dispatch-touch-control`: control +300, touch leg +525, `touchmove` 24, `scroll` events 76.

Driver hash: `cd877ec050c81e6c39bfc0f8f758dd4f2db76dd0eb134e13633d68af06353d3a`
(`driver.sha256`, `receipts.sha256`, `artifacts.sha256`, `repro.tsv` in this directory).

## Files

- `report.md` — this report (first line: verdict word).
- `driver.mjs` — the pinned instrument; `driver.sha256`.
- `summarize.mjs`, `summary.json` — aggregation used for the table.
- `receipt-<variant>.json` ×14 — one separate receipt per variation.
- `receipts.sha256` — sha256 of every receipt.
- `repro.tsv` — variant → nonce, ports, receipt hash, driver hash.
- `source-notes.txt` — fetched Chromium source URLs, hashes, and line references for the
  `kFromDebugger`/dispatch-path attribution.
