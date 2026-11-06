CONFIRMED

# R69Exec3 — Input.synthesizeScrollGesture parameter edges (unscored exploratory probe)

Seat: R69Exec3, Tabi round 69 w1. Scope: measure the parameter edges of
`Input.synthesizeScrollGesture` on `/usr/bin/chromium` headless 155.0.8059.84 and check each
measurement against the staged S174 handler (`content/browser/devtools/protocol/input_handler.cc`)
and the staged S173 protocol (`Input.pdl`). No production, lane, fleet or sibling file was
touched; the lane driver at `scripts/chrome-cdp-synthscroll-round69.mjs` was copied to scratch
and never edited.

## Instruments (pinned)

| item | value |
|---|---|
| chromium binary | `/usr/bin/chromium`, `Chromium 155.0.8059.84 Arch Linux`, sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` |
| staged source | `.ufo/waves/round-69/sources/input_handler.cc`, sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4` |
| staged protocol | `.ufo/waves/round-68/sources/Input.pdl` (336 lines, `synthesizeScrollGesture` at :287) |
| probe base | lane driver copy, sha256 `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3` (matches the r69 C2 pin) |
| probes | `probe.mjs` (`10b17e1a…`), `probe2.mjs` (`7ecf3ea4…`), `probe3.mjs` (`3eb9f665…`) — self-sha recorded inside each receipt |

Full `sha256sum` output for these plus the receipt files is in `instruments.txt`.

Fixture: 2280×6800 CSS px content inside a 1280×900 device viewport. Measured scrollport
(`receipt-set3.json` → `geometry`): `innerWidth/Height` 1280/900, `clientWidth/Height` 1265/885
(15 px classic scrollbars), `scrollWidth/Height` 2280/6800, so usable max scroll is
(1015, 5915) — the fixture is both wider and taller than the viewport, as required.

Three passes, 39 legs total, every leg executed (no leg was skipped or inferred):
`receipt.json` (21 legs), `receipt-set2.json` (14), `receipt-set3.json` (4);
`summary.md` is the generated per-leg table, `rows.json` the derived per-leg distance/speed/latency
rows, `fit.json` the latency fit, `cadence.json` the wheel cadence rows.

Provenance control: each pass's CDP census contains **only** `Input.synthesizeScrollGesture`
(21 / 14 / 4 calls) and **zero** `Input.dispatchMouseEvent` / `Input.dispatchTouchEvent`; every
page event in every leg has `isTrusted: true`. The wheel/touch streams therefore cannot be a
dispatch look-alike or a script scroll.

## Expectations vs measurement

Every expectation below is derived from a cited line, not from the observed result.

### (a) `xDistance` — sign, magnitude, clamp

Source: `input_handler.cc:2172-2175` pushes `(xDistance, yDistance)` as one vector;
`Input.pdl:293-294` documents "positive to scroll left".

| leg | expected from source | measured | verdict |
|---|---|---|---|
| `a1_xDistance_minus300` (`xDistance:-300`, mouse) | negative x → scroll right, +300 | ΔscrollX **+300**, wheel ΔX sum **+300**, 24 wheel, 1 scrollend, 450.3 ms | **agree** |
| `a2_xDistance_plus300` at scrollX 0 | positive x → scroll left, clamped at 0 | ΔscrollX **0**, wheel ΔX sum **−300** | **agree** (deltas still delivered while clamped) |
| `g1`/`j3` `xDistance:-5000` from 0 | clamp at document extent | ΔscrollX **1015** = `maxScrollLeft` exactly, wheel ΔX sum **+5000** | **agree** |
| `j4` `xDistance:-5000` already at right edge | clamp, movement 0 | ΔscrollX **0**, wheel ΔX sum **+5000**, latency **6303.1 ms** | **agree**, plus finding (a2) |

Timing check: 300 px at the default 800 px/s → 375 ms predicted, 450.3 ms measured, i.e. the
~52 ms overhead quantified in (b). 5000 px → 6250 + 52 ≈ 6302, measured 6302.9–6305.5 ms.

### (b) `speed` 400 vs 1600 for `yDistance:-600` — CDP response latency

Source: `input_handler.cc:2167-2170` (`kDefaultSpeed = 800`, `speed.value_or(kDefaultSpeed)`);
`Input.pdl:305` "Swipe speed in pixels per second (default: 800)". The response is sent only after
the gesture completes (`:2190-2193` → `QueueSyntheticGesture` with the callback), so CDP latency
should track the gesture duration.

| speed | predicted (600/speed) | measured (3 runs) | overhead |
|---|---|---|---|
| 400 | 1500 ms | **1547.9 / 1548.4 / 1549.1** | +47.9…49.1 |
| 1600 | 375 ms | **430.7 / 432.7 / 433.4** | +55.7…58.4 |
| absent (default) | 750 ms (800 px/s) | **799.1** | +49.1 |

Extending the curve (pass 2): speed 200/600 px → 3064.3 ms (pred 3000); speed 3200/600 px →
243.2 ms (pred 187.5); 800/1200 px → 1562.7 (pred 1500); 400/1200 px → 3063.1 (pred 3000).

Least squares over the 30 mouse-path legs with a distance (`fit.json`):

```
latency_ms = 52.08 + 1.0007 * (distance_px / speed_px_s * 1000)     R² = 0.99997
```

**Yes, latency scales ~distance/speed**: unit slope (1.0007, i.e. 0.07 % high) with a constant
~52 ms start/finish overhead; worst residual 22.9 ms. `kDefaultSpeed = 800` is confirmed measured
(799.1 ms for 600 px with `speed` absent). Distance and speed separate cleanly: doubling distance
at fixed speed doubles latency (1200/800 = 1562.7 vs 600/800 = 799.1), and doubling speed at fixed
distance halves it.

Secondary measured structure (`cadence.json`): wheel delivery is ~60 Hz — 91 events in 1500 ms at
speed 400, 24 in 383 ms at 1600, 46 in ~750 ms at default — and the per-event delta equals
`speed × ~16.6 ms` (6.59 px at 400, 12.5 at 800, 25 at 1600). The fractional per-event deltas
summing exactly to the requested integer distance are consistent with
`granularity = kScrollByPrecisePixel` (`input_handler.cc:2159`).

### (c) `gestureSourceType:'default'` explicit vs absent

Source: `input_handler.cc:71-79` maps both an absent value and the literal `default` to
`kDefaultInput`; `Input.pdl:307-309` says default "queries the platform for the preferred input
type".

| leg | events | ΔscrollY | latency |
|---|---|---|---|
| `c_source_default_explicit` | 24 wheel + 1 scrollend, all trusted | 300 | 434.0 ms |
| `c_source_absent` | 24 wheel + 1 scrollend, all trusted | 300 | 432.9 ms |
| `g7_source_mouse_explicit` | 23 wheel + 1 scrollend | 300 | 427.0 ms |
| `c_source_touch_contrast` | 1 pointerdown:touch, 25 pointermove:touch, 1 pointerup:touch, 1 touchstart, 1 touchend, **0 wheel** | **0** | 531.8 ms |

Explicit `default` and absent are **behaviourally indistinguishable** (same event multiset, same
delta, 1.1 ms apart) and both match the explicit `mouse` path — consistent with `kDefaultInput`
resolving to the wheel/mouse producer on Linux. **agree**.

Divergence worth recording: the explicit `touch` source delivered the full trusted touch/pointer
sequence but produced **no wheel events and no scroll** (ΔscrollY 0) and cost ~100 ms more
(531.8 vs ~430). This matches the frozen lane driver's own touch leg ("scrollY stays 900",
`scripts/chrome-cdp-synthscroll-round69.mjs` header, legs block), so it is a reproducible property
of this host/build, not a probe defect. The staged `input_handler.cc` resolves the enum and queues
the gesture (`:2182-2188`) but does not explain why the compositor does not scroll for synthetic
touch — **[INFERENCE]**: the synthetic touch stream is acknowledged as events without a touch
scroll consumer in this headless configuration. Not asserted as source behaviour; it is measured
behaviour only.

### (d) Anchor outside the viewport

Source: `input_handler.cc:2161-2165` → `PointIsWithinContents` → `:2314-2318`
(`host_->GetView()->GetViewBounds()`, translated to origin): a half-open view rect, **not** the
content rect.

| leg | result |
|---|---|
| `d_x_out_of_bounds_5000` (x=5000) | CDP error `-32602 "Position out of bounds"`, 0.5 ms, no events, no scroll |
| `d_x_negative` (x=−1) | same error, 0.5 ms |
| `d_y_out_of_bounds_5000` (y=5000) | same error, 0.4 ms |
| `d_x_inside_wide_content_1200` (x=1200) | accepted, ΔscrollY 100, 177.5 ms |
| `g2_x_1279_9` / `g3_x_1280` | **1279.9 accepted** (Δ 60) / **1280 rejected** "Position out of bounds" |
| `g4_y_899_9` / `g5_y_900` | **899.9 accepted** (Δ 60) / **900 rejected** "Position out of bounds" |

**agree** with the half-open 1280×900 view bound, to sub-pixel resolution. Two consequences the
probe makes explicit: the bound is the *view*, not the 2280 px content (x=5000 fails while x=1200
succeeds); and because the view is 1280×900 while the scrollport is 1265×885, an anchor in the
15 px scrollbar gutter (x=1279.9) is accepted and still scrolls the page.

### (e) Invalid / unsupported `gestureSourceType`

Source: `input_handler.cc:71-90` accepts only absent / `default` / `touch` / `mouse` and returns
false otherwise; `:2182-2188` turns that into `InvalidParams("Unknown gestureSourceType")`.

| leg | measured |
|---|---|
| `e_source_pen` (`'pen'`) | `-32602 "Unknown gestureSourceType"`, 0.5 ms, no events |
| `e_source_bogus` (`'bogus'`) | `-32602 "Unknown gestureSourceType"`, 0.3 ms |
| `g6_source_Mouse_uppercase` (`'Mouse'`) | `-32602 "Unknown gestureSourceType"`, 0.3 ms |

**agree**, with one added detail worth keeping: the error text is the handler's string at
`input_handler.cc:2186`, not a protocol-bindings deserialization failure, so an out-of-enum string
passes the CDP layer and is rejected inside the handler. The error is also *not* the same code path
as out-of-bounds (both are `InvalidParams`, distinguished only by message), which is why a counter
must match on message text, not code alone.

### (f) `yOverscroll` — sign inversion, additivity, behaviour at the edge

Source: `input_handler.cc:2177-2180` pushes `(-xOverscroll, -yOverscroll)` as a **second** distance
vector, in addition to the `(xDistance, yDistance)` vector pushed at `:2172-2175`.

| leg | expected from source | measured | verdict |
|---|---|---|---|
| `f1_bottom_yOverscroll100` — at bottom (`scrollY` 5915 = max), `yOverscroll:100` only | one distance `(0,-100)` → attempt further down, clamped: movement 0, wheel ΔY +100 | ΔscrollY **0**, wheel ΔY sum **+100** (9 events), 157.2 ms | **agree** |
| `f4_bottom_yOverscroll500` — same edge, 500 px | wheel ΔY +500, movement 0; duration follows the *requested* 500 px (625 ms) | Δ 0, wheel ΔY **+500**, **666.0 ms** | **agree** + finding |
| `f2_mid_yDistance_minus300_yOverscroll100` | two vectors `(0,-300)` + `(0,-100)` → total 400 | ΔscrollY **400**, wheel ΔY **+400**, 547.4 ms (pred 500+52) | **agree** |
| `i1_right_xOverscroll100` — at right edge (1015), `xOverscroll:100` | `(-100,0)` → further right, clamped | ΔscrollX **0**, wheel ΔX **+100**, 163.6 ms | **agree** |
| `i2_mid_xDistance_minus200_xOverscroll100` | total −300 | ΔscrollX **300**, wheel ΔX **+300** | **agree** |
| `f3_top_yOverscroll_minus100` — at top | `+100` → upwards past the top, clamped | Δ 0, wheel ΔY **−100**, 155.4 ms | **agree** |

So the documented "number of additional pixels to scroll back" budget is realised as a *negated
second distance vector appended after the primary one*: it adds to the same-direction travel when
unclamped, and it is the only way to attempt travel past an edge. Two measured consequences:
the overscroll vector is appended even when `xDistance`/`yDistance` are absent (f1, f3, i1 still
produce wheel deltas); and gesture duration is computed from the requested distance, so a fully
clamped gesture still spends 625 ms at 500 px / 6303 ms at 5000 px (f4, j4).

### Extra finding — diagonal distance is one vector

`j2_diagonal_minus300_minus300` (`xDistance:-300, yDistance:-300`, mouse): ΔscrollX **300** and
ΔscrollY **300** from a single call, wheel sums +300/+300, latency **586.6 ms**. Predicted from one
push of the 2-D vector (`:2172-2175`): magnitude 424.26 px at 800 px/s = 530.3 ms + 52 ms overhead
= 582 ms. **agree** — the duration follows the Euclidean magnitude, not the sum of components
(which would predict 750 ms).

## Measured-vs-source summary

| expectation | source | measured | agree? |
|---|---|---|---|
| negative `xDistance` scrolls right | `:2172-2175`, `Input.pdl:293-294` | +300 scrollX, +300 wheel ΔX | **agree** |
| requested deltas are emitted even when clamped | not stated in source | wheel sums reach the requested 300/500/5000 while movement clamps | measured-only |
| `speed` sets wall duration; default 800 | `:2167-2170`, `Input.pdl:305` | latency = 52.08 + 1.0007·d/s, R² 0.99997; default 799.1 ms | **agree** |
| explicit `default` ≡ absent | `:71-79` | identical event multiset and delta | **agree** |
| `touch` produces touch/pointer, no wheel | `:81-84` | yes, and no scroll at all | agree on events; scroll refusal is measured-only |
| anchor bound is the view rect, half-open | `:2161-2165`, `:2314-2318` | 1279.9/899.9 in, 1280/900 out; 5000/−1 out; 1200 in | **agree** |
| unknown `gestureSourceType` → handler error | `:71-90`, `:2182-2188` | `-32602 "Unknown gestureSourceType"` for pen/bogus/Mouse | **agree** |
| overscroll = negated appended second vector | `:2177-2180` | additive (300+100=400), sign-inverted at both edges | **agree** |
| precise-pixel granularity | `:2159` | fractional per-event deltas summing exactly to the request | **agree** |

No expectation from the staged source was contradicted by measurement.

## Limits / risks

- One host, one Chromium build (155.0.8059.84), headless only. Latency numbers are wall clock on
  this machine; the *slope* (1.0007) and the ~52 ms intercept are the portable part, the absolute
  intercept is not.
- `speed` sampled at 200/400/800/1600/3200 px/s with 1–3 runs each; the two assigned speeds have 3
  runs, the rest 1. Run-to-run spread at fixed speed is small (1.2 ms at 400 px/s, 2.7 ms at
  1600 px/s), so the fit residual is dominated by the fixed-overhead term, not by jitter.
- The `touch`-source no-scroll result is measured on this host/build; it is consistent with the
  lane driver's frozen touch leg but is not derived from the staged source.
- The 15 px gutter/scrollport difference is a property of this headless configuration (classic
  scrollbars under `Emulation.setDeviceMetricsOverride`); it must not be carried into a scored claim
  as a general Chromium property.
- Untested here (out of the assigned edge set): `repeatCount`/`repeatDelayMs`,
  `interactionMarkerName`, `preventFling:false` fling behaviour, `xOverscroll` with a diagonal
  overscroll, and negative `speed`. Unrun = not passed.
- Teardown: each pass SIGKILLs the chromium process group and closes the fixture server on exit;
  this probe does not include a post-kill port/survivor sweep (the lane counter does). Scratch was
  removed after the receipts were copied out.

## Reproduction

```bash
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Exec3
mkdir -p /fast/scratch/hyaku/tabi-r69/R69Exec3
TMPDIR=/fast/scratch/hyaku/tabi-r69/R69Exec3 node probe.mjs \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec3 --out "$PWD" --http-port 41711 --cdp-port 41712
TMPDIR=/fast/scratch/hyaku/tabi-r69/R69Exec3 node probe2.mjs \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec3 --out "$PWD" --http-port 41721 --cdp-port 41722
TMPDIR=/fast/scratch/hyaku/tabi-r69/R69Exec3 node probe3.mjs \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec3 --out "$PWD" --http-port 41731 --cdp-port 41732
```

Line citations: `input_handler.cc` line numbers refer to
`.ufo/waves/round-69/sources/input_handler.cc` (sha256 `72cf0d1d…`), e.g.
`sed -n '2157,2194p' .ufo/waves/round-69/sources/input_handler.cc`. Protocol citations refer to
`.ufo/waves/round-68/sources/Input.pdl:287-315`.

## Files

- `probe.mjs`, `probe2.mjs`, `probe3.mjs` — probes (self-sha inside each receipt)
- `receipt.json` (21 legs), `receipt-set2.json` (14), `receipt-set3.json` (4) — raw receipts incl.
  full per-leg event logs and CDP method census
- `summary.md` — generated per-leg table
- `rows.json` — derived per-leg distance/speed/latency rows; `fit.json` — latency fit;
  `cadence.json` — wheel cadence rows
