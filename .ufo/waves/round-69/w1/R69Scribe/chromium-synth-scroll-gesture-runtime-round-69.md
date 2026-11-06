source: S173 — Chromium 155.0.8059.84 Input.pdl lines 286–315, https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT, staged .ufo/waves/round-68/sources/Input.pdl; S174 — same tag content/browser/devtools/protocol/input_handler.cc lines 71–79, 2167–2170, 2190–2191, 2239–2249, https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT, staged .ufo/waves/round-69/sources/input_handler.cc; scored receipt corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json
verified-at: 2026-11-06, Chromium 155.0.8059.84 (CDP Chrome/155.0.8059.84, protocol 1.3), Arch Linux x86_64, `--headless=new`, 1280×900, deviceScaleFactor 1; receipt sha256 587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8; driver sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3
recheck: sha256sum .ufo/waves/round-69/sources/input_handler.cc .ufo/waves/round-68/sources/Input.pdl corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json; node scripts/check-synthscroll-r69.mjs --receipt corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json --expect-driver-sha256 13ea3f8a… --json; repeat the live run on a second host/build before applying there

# Synth-scroll runtime ground — round 69

## Evidence class

Live runtime measured on one host, one Chromium build, headless, desktop metrics. The scored receipt was produced after freeze a033979c by the pinned driver (SHA-256 `13ea3f8a…`); the counter exits 0 clean with 63 checks, and the forgery battery exits 0 with 44/44 refused for their expected ids and the positive clean. Page close state: scrollY 900, 120 `scroll` events, 171 recorded events, `failures: []`, `degenerate: null`, `synthScrollHypothesis: CONFIRMED`, `predicate: true`. This note records delivery, not cause.

## Measured legs

Fixture: 6000 px document, viewport 1280×900, all events `isTrusted: true`.

| Leg (parameters) | scrollY | wheel: n / Σ deltaY | scrollend | other page events | elapsedMs |
|---|---|---|---|---|---|
| start — no input | 0 → 0 | 0 / 0 | 0 | none | 124 |
| mouse — `yDistance:-600`, source `mouse` | 0 → 600 | 46 / +600 | 1 @ 600 | none | 1846 |
| default — `yDistance:300`, no source | 600 → 300 | 25 / −300 | 1 @ 300 | none | 1465 |
| repeat — `yDistance:-200`, source `mouse`, `repeatCount:2`, `repeatDelayMs:100` | 300 → 900 | 51 / +600 | 3 @ 500, 700, 900 | none | 2165 |
| touch — `yDistance:-500`, source `touch`, `preventFling:true` | 900 → 900 | 0 / 0 | 0 | pointerdown 1, pointermove 40, pointerup 1, touchstart 1, touchend 1, touchmove 0 | 1801 |

For every scrolling leg the wheel Σ deltaY equals ΔscrollY exactly; wheel `deltaMode` is 0 throughout. Repeat scrollends are 416.6 ms and 416.7 ms apart.

## Line-by-line tie

- S173 289–296: `x`/`y` are CSS pixels and `yDistance` is positive to scroll up. The default leg (`+300`) moved scrollY 600 → 300; the mouse leg (`−600`) moved 0 → 600. Sign and magnitude match.
- S173 286–288: the command “Synthesizes a scroll gesture over a time period by issuing appropriate touch events.” Under source `touch` the page saw one pointerdown/pointerup with `pointerType: "touch"`, one touchstart, one touchend, and 40 pointermoves; zero touchmove reached the page.
- S174 71–79: absent `gestureSourceType` maps to `kDefaultInput`; S173 307–309 says the default queries platform preference. The default leg produced 25 wheel events and no pointer/touch events; the run shows wheel-shaped delivery, not which platform source was selected.
- S174 2167–2170 with S173 303–306: `preventFling` defaults true and `speed` defaults 800 px/s. No fling or speed contrast was run; these defaults are cited, not measured here.
- S174 2190–2191 with S173 310–313: `repeatCount` defaults 0 and `repeatDelayMs` defaults 250, forwarded to `SynthesizeRepeatingScroll`. The repeat leg sent one CDP command (`cdpSendLog` id 30) and produced three gestures: 51 wheel events, Σ +600, three scrollends at 500/700/900. The wire saw one command; the extra gestures were internal.
- S174 2239–2249: if `repeat_count > 0` the handler posts the next repeat with `repeat_count - 1`; only the final call sends the CDP response. The four gesture commands each returned one `{}` response, while the repeat leg emitted three page scrollends, consistent with a response deferred past all repeats.
- `elapsedMs` bounds latency; it is not measured latency. `t0` precedes the send, and gesture legs add a fixed 900 ms settle sleep plus scrollY polling: response ≤ `elapsedMs − 900` (mouse ≤ 946, default ≤ 565, repeat ≤ 1265, touch ≤ 901 ms). The start leg (no send) took 124 ms, the settle-only baseline.

## Recorded divergence

The blanket S173 286 phrase “issuing appropriate touch events” did not describe the mouse-source legs: they emitted wheel events only, with zero pointer/touch events. S173 307–309 separately says `gestureSourceType` selects the generated event type, so this is recorded as a literal-reading divergence, not a protocol fault. The touch-source leg emitted touch-family events but did not scroll.

## Limits

- One host, one build (155.0.8059.84), `--headless=new`, 1280×900, deviceScaleFactor 1, `--disable-smooth-scrolling`; no second host/build, real trackpad, or mobile metrics.
- Touch-source non-scroll is measured, not explained. At scrollY 900 of a 6000 px document (900 px viewport, max scrollY 5100) 4200 px of downward room remained, so the boundary did not prevent a scroll; yet zero wheel, zero scrollend, zero touchmove, ΔscrollY 0.
- Counts are not invariants: the cold seat run (`.ufo/waves/round-69/w1/R69Exec1/receipt.json`) recorded 24 default-leg wheels against this run's 25, with identical scrollY, Σ deltaY, and scrollend count. Treat Σ deltaY and ΔscrollY as the measured quantities.
- Publisher authenticity is not claimed. The staged digests match the recorded bytes (S173 `5bbc6e23…`, S174 `72cf0d1d…`), but the fetch is not signature-verified.
- Not measured: fling on/off, speed variation, overscroll, horizontal (`xDistance`), interaction markers, momentum/phase streams, smooth rendering, repeat counts above 2, a second host or build.

## Frontier

Still open: why touch-source delivery did not scroll; fling and speed contrasts; overscroll and horizontal behaviour; repeat counts above 2 and delay effects; markers, phase/momentum streams, smooth rendering; a second host or build. This note does not close those.

## Gate
- ADMIT `chromium-synth-scroll-gesture-linux`: the pinned driver's scored run after freeze a033979c has `predicate: true`, `synthScrollHypothesis: CONFIRMED`; `.ufo/waves/round-69/scored/c2-counter-a.json` is clean (63 checks) and `.ufo/waves/round-69/scored/c2-negatives-a.json` is 44/44 refused for expected ids with the positive clean.
  Reason: mouse/default/repeat legs moved scrollY by exactly the signed `yDistance` with trusted wheel events whose Σ deltaY equals each scroll delta; the r68 reject's flip condition (a live run with a measured receipt) is met.
- REJECT `touch-source-synthscroll-scrolls`: the touch leg held scrollY at 900 with zero wheel events and zero scrollends over 1801 ms.
  Reason: only pointer/touch input events were emitted, and 4200 px of scroll room existed below the anchor.
  Flip: a scored receipt from the pinned driver where `gestureSourceType: "touch"` changes scrollY by `yDistance` and the same counter stays clean.
