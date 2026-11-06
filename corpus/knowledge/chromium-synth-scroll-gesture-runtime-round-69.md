source: S174 (Chromium 155.0.8059.84 content/browser/devtools/protocol/input_handler.cc, opened 2026-11-06), S173 (Input.pdl lines 286-315 at the same tag); runtime receipt corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json
verified-at: 2026-11-06, lane round 69, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP protocol 1.3, loopback fixture, viewport 1280x900, deviceScaleFactor 1, --disable-smooth-scrolling
recheck: node scripts/chrome-cdp-synthscroll-round69.mjs --scratch <ABS dir> --out <ABS receipt.json> --nonce tabi-r69-<x> --http-port <p> --cdp-port <q> && node scripts/check-synthscroll-r69.mjs --receipt <receipt.json> --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3

# Input.synthesizeScrollGesture — measured runtime delivery (round 69)

Round 68 held this command as documentation only (S173) and rejected a runtime claim until a
live run with a measured receipt existed. This note is that run: what the page receives when a
CDP client calls `Input.synthesizeScrollGesture` on this host, and what the browser-side source
(S174) says about why.

## Measured (scored run, nonce `tabi-r69-scored-81ac744e`, receipt sha256 587100d9…667f8)

| leg | params | scrollY | page events in leg |
|---|---|---|---|
| mouse | `yDistance:-600, gestureSourceType:'mouse'` | 0 → 600 | 46 trusted `wheel` (deltaY sum +600, each ≤ 20 px, deltaMode 0), 1 `scrollend` |
| default | `yDistance:300` (no source type) | 600 → 300 | 25 trusted `wheel` (sum −300), 1 `scrollend` |
| repeat | `yDistance:-200, mouse, repeatCount:2, repeatDelayMs:100` | 300 → 900 | 51 `wheel` (sum +600), 3 `scrollend` |
| touch | `yDistance:-500, gestureSourceType:'touch', preventFling:true` | 900 → 900 | 1 `pointerdown`/touch, 40 `pointermove`/touch, 1 `pointerup`/touch, 1 `touchstart`, 1 `touchend`; 0 `wheel`, 0 `touchmove` |

Three pre-freeze smoke runs (`.ufo/waves/round-69/controls/c2-smoke/`) gave the same scroll
positions and event classes.

## What this means for a driver

1. **Sign.** Negative `yDistance` scrolls the document DOWN (scrollY grows). The PDL says
   positive scrolls up/left (S173 Input.pdl:293-296); the run agrees.
2. **Mouse-class gestures arrive as many small precise wheel events**, not one wheel event:
   600 px became 46 events. The deltas add up exactly to the scroll distance, so a counter can
   check `sum(deltaY) == Δscroll`. The source sets granularity to precise pixels
   (`kScrollByPrecisePixel`, S174 input_handler.cc:2159).
3. **No source type means the platform default.** An absent `gestureSourceType` maps to
   `kDefaultInput` (S174 input_handler.cc:71-79); on this Linux desktop that delivered wheel
   events, the same class as `'mouse'`.
4. **repeatCount N means 1 + N gestures**, each ending in its own `scrollend`: `OnScrollFinished`
   queues another gesture while `repeat_count > 0` and sends the CDP response only after the last
   one (S174 input_handler.cc:2239-2249). The CDP call therefore blocks for the whole sequence.
   The default repeat delay is 250 ms (input_handler.cc:2191).
5. **Defaults.** `preventFling` defaults to true and `speed` to 800 px/s
   (S174 input_handler.cc:2167-2170).
6. **Touch-source gestures did not scroll the document here.** The page got a full pointer(touch)
   sequence plus `touchstart`/`touchend`, but no `touchmove` and no scroll, on desktop (non-mobile)
   device metrics. This is measured on one host and build, not explained. The probes that try to
   make touch scroll are in the round-69 wave evidence (`.ufo/waves/round-69/w1/`).

## Producer discrimination

A page-side scroll can be faked. The driver logs every CDP send (`cdpSendLog`), and the counter
requires exactly four `Input.synthesizeScrollGesture` calls with the frozen parameters, no other
`Input.*` producer and no script scroll. Three degenerate drivers (script `scrollBy`,
`Input.dispatchMouseEvent` wheel, skipped touch leg) are refused even when their receipts are
relabelled green (`.ufo/waves/round-69/controls/c2/`, `.ufo/waves/round-69/scored/c2-negatives-a.json`).

## Parameter edges (unscored wave evidence, R69Exec3, 39 legs, `.ufo/waves/round-69/w1/R69Exec3/`)

Measured by a wave seat on the same host and build, every CDP call `Input.synthesizeScrollGesture`
only; not part of the scored predicate.

| question | source line (S174 / S173) | measured |
|---|---|---|
| CDP latency vs speed | `kDefaultSpeed = 800` (input_handler.cc:2168); response after the gesture | latency ≈ 52 ms + distance/speed (fit slope 1.0007, R² 0.99997 over 30 legs; speed 400/600 px → ~1548 ms, 1600 → ~432 ms) |
| `xDistance` sign | Input.pdl:293 "positive to scroll left" | −300 → scrollX +300; at an edge the wheel deltas are still delivered and nothing moves |
| explicit `'default'` vs absent | input_handler.cc:71-79 both → `kDefaultInput` | identical event multisets and deltas; both match `'mouse'` |
| anchor outside the view | `Position out of bounds` (input_handler.cc:2163) | half-open view bound 1280×900: x 1279.9 accepted, 1280 rejected; the bound is the view, not the document |
| unknown source type | `Unknown gestureSourceType` (input_handler.cc:2186) | `'pen'`, `'bogus'`, `'Mouse'` all rejected with code −32602 and that message |
| overscroll | pushed as a second, sign-inverted vector (input_handler.cc:2177-2180) | `yDistance:-300` + `yOverscroll:100` scrolls 400; at the bottom edge `yOverscroll:100` delivers +100 wheel delta and moves nothing |

Out-of-bounds and unknown-source errors share code −32602; only the message tells them apart.

## Limits

One host, one Chromium build, headless, desktop metrics, one fixture document. The digest of the
staged source proves byte identity with what was fetched, not publisher authenticity. Smooth
rendering, trackpad phase and fling behaviour are not measured.
