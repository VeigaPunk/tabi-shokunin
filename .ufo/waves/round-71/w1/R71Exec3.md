HOLDS

# tabi round 71 — w1 R71Exec3: falsification probe of the pinch knowledge

Seat R71Exec3 (leaf, wave w1). Lane `tabi-shokunin`, base `11b00f644f5af1a4f7827da6956732e0b91023a5`,
freeze `04f4330f` (claims `.ufo/waves/round-71/claims.json`, digests `freeze.txt`). I did not author
the round, changed no lane file, ran no lane gate, and did not touch the pinned instruments. Host:
Chromium 155.0.8059.84 Arch Linux, CDP 1.3, `--headless=new`, loopback fixture in a 1280x900
viewport (`mobile:false` unless a leg overrides it), fresh profile and XDG home under scratch.

**Verdict: HOLDS.** No frozen leg statement in `claims.json` or in the pinned driver's `LEG_SHAPE`
is contradicted. The probe measures seven boundaries the frozen legs do not cover and qualifies one
parenthetical explanation ("minimum page scale"). Nothing was re-run to fish for green: the two
second runs below are a plan fix (an anchor the scale-3 viewport refuses) and an added leg; both
first runs are retained and reported.

## Method

Own driver `chrome-cdp-pinchprobe-r71.mjs` (patterns copied from the pinned
`scripts/chrome-cdp-synthpinch-round71.mjs`, which was never edited), one Chromium run per variant,
plus `analyze-pinchprobe-r71.mjs`, which derives every number below from the receipts. The fixture
records every wheel/pointer/touch event with leg, `ctrlKey`, `deltaY` as a number *and* as a string
(NaN survives JSON), coordinates, `isTrusted`, and `visualViewport.scale` at dispatch; each leg
records the page scale twice (page `visualViewport.scale` and
`Page.getLayoutMetrics.cssVisualViewport.scale`), the CDP result/error, elapsed ms, and the full
`cdpSendLog`. Every run closed: `postKillSweepCount 0`, both ports `closed`, `curl` exit 7, no
survivors, `failures []`.

Reproduce any receipt with the driver revision named in its `driverSha256` (all four revisions are
in this directory as `chrome-cdp-pinchprobe-r71.rev-<digest8>.mjs`):

    node chrome-cdp-pinchprobe-r71.mjs --variant <v> --scratch <ABS short> --out <ABS .json> \
      --nonce tabi-r71-<...> --http-port <41000-48999> --cdp-port <41000-48999>
    node analyze-pinchprobe-r71.mjs --receipts receipts --out analysis.json

Twelve receipts, ten variants (unit tests are legs inside a variant): `scale3` (two runs),
`scale025`, `negative`, `queue`, `touchmobile` (two runs), `speed1600`, `speed100`, `law`, `edge`,
`bounds`.

## 1. scaleFactor 3 and 0.25 — final scale, max clamp

| leg | gesture | wheels | span | scale before → after | result |
|---|---|---|---|---|---|
| `scale3` p3 | 3x mouse from 1 | 31 | 492.5 ms (nominal 500) | 1 → 2.99999976 | success |
| `scale3` p3b | 3x mouse from 3 (target 9) | 32 | 490.8 ms | 2.99999976 → **4** | success |
| `scale3-run1` p3 | 3x mouse from 1 | 32 | 500.0 ms | 1 → 3 | success |
| `scale3-run1` p3b | 3x mouse from 3 at (400,300) | 0 | — | 3 → 3 | **-32602 Position out of bounds** |
| `scale025` q | 0.25x mouse from 1 | 47 | 749.9 ms (nominal 750) | 1 → **1** | success |

- **No clamp at 3**: a 3x pinch from 1 lands at 3 (page and CDP agree). The gesture runs its full
  nominal duration: `(3-1)*200/800 = 0.5 s` (`synthetic_touchpad_pinch_gesture.cc:160-174`).
- **Maximum page scale is 4.0**: a second 3x pinch from 3 (target 9) moves the page scale only to
  exactly 4 and holds there for the remaining wheels (32 wheels over 490.8 ms). The wheels keep
  firing; the page scale clamps per event.
- **Minimum page scale is 1.0 on the desktop page**: 0.25x from 1 fires 47 wheels over 749.9 ms
  (`(1/0.25-1)*200/800 = 0.75 s`) and the scale never leaves 1. This is the frozen `clamp` leg
  (0.5x at 1 → 1) one factor further out; see §4 for the mobile qualification.
- The `scale3-run1` p3b refusal is the anchor bounds law, not a pinch law: the anchor is multiplied
  by the page scale (`input_handler.cc:1553-1574` `ScaleFactor()` includes
  `GetPageScaleFactor()`, then `:2110` `CssPixelsToPointF(x, y, ScaleFactor())`), so at scale 3 the
  anchor (400,300) becomes (1200,900) DIPs and (400,300) sits on the exclusive bottom edge of the
  1280x900 view (`input_handler.cc:2314-2318` `PointIsWithinContents`). §7 measures the boundary.

Repro: `--variant scale3` (receipts `scale3.json`, `scale3-run1-badanchor.json`), `--variant scale025`.

## 2. Negative scaleFactor -1

| measure | observed |
|---|---|
| CDP result | success (`{}`), no error, no hang (the 791 ms is the 700 ms settle) |
| page events | exactly **one** wheel: `isTrusted true`, `ctrlKey true`, `deltaY` **NaN** (`deltaYRaw "NaN"`), at (400,300), target `#pad` |
| page scale | 1 → 1 (unchanged; no NaN scale, no renderer crash, no child exit) |
| `wsClosed` | clean, `pending []`; Chromium killed by teardown as usual |

Mechanism, source-grounded: the handler never range-checks `scale_factor`
(`input_handler.cc:2109`), the constructor's `DCHECK_GT(params().scale_factor, 0.0f)`
(`synthetic_touchpad_pinch_gesture.cc:29`) is compiled out in release, and `CalculateEndTime`
inverts a value < 1 (`:161-162`) so -1 gives `scale_factor_delta = -400` and a **negative**
duration (`:168-174`; the `DCHECK_GT(total_duration, ...)` at `:173` is also compiled out). The
first `IN_PROGRESS` tick therefore sees `HasReachedTarget` true, returns `params().scale_factor`
= -1 as the target (`:140-148`), and dispatches `BuildPinchUpdate(-1, ...)` (`:108-115`). Blink
turns that into `-100*ln(-1)/S` = NaN, and the page receives one trusted ctrl+wheel with a NaN
deltaY and the page scale does not move [INFERENCE: the zoom path does not apply a non-finite
delta]. No failure is
reported to the client: `SendSynthesizePinchGestureResponse` only fails on a non-FINISHED result
(`input_handler.cc:295-305`).

Repro: `--variant negative` (receipt `negative.json`).

## 3. After the scaleFactor-0 hang: the gesture queue is blocked, globally

| leg | command | CDP response | page events during the leg | scale |
|---|---|---|---|---|
| `zero` | pinch 0x mouse, 3 s bound | **no-response-3000ms** | 220 wheels, all `deltaY 0`, ctrl, trusted | 1 → 1 |
| `afterzero` | pinch 2x mouse (valid), 6 s bound | **no-response-6000ms** | 403 wheels, all `deltaY 0` (zero nonzero) | 1 → 1 |
| `afterzero` liveness | `Runtime.evaluate 1+1` while the pinch is pending | **ok, value 2** | — | — |
| `scroll` | `Input.synthesizeScrollGesture` (finite), 3 s bound | **no-response-3000ms** | 222 wheels, all `deltaY 0` | 1 → 1 |

Answer: **queue forever**, and the block is not pinch-specific. The scaleFactor-0 gesture keeps
running (zero-delta wheels at ~60/s through all three legs, 845 wheels total over ~12 s), the CDP
connection and renderer stay alive (the in-flight `Runtime.evaluate` answers), and a later valid
pinch and a later scroll gesture both never respond and never dispatch a single event. Both commands
enter through the same `QueueSyntheticGesture` call (`input_handler.cc:2133-2135`); the controller
itself is not in the staged sources, so the queue semantics are measured, not read. This is
consistent with the frozen "scaleFactor 0 never finishes" and adds that the queue is a single global
lane: one zero-scale pinch wedges every later synthetic gesture on the host, with no timeout and no
error surfaced to the client.

Repro: `--variant queue` (receipt `queue.json`; 305 KB of raw events).

## 4. Touch pinch under mobile emulation and touch emulation

Run 2 (receipt `touchmobile.json`); run 1 without `m_out` is retained as `touchmobile-run1.json`.

| leg | pre-action | source | events | scale before → after |
|---|---|---|---|---|
| `m_mobile` | `Emulation.setDeviceMetricsOverride {1280x900, dsf 1, mobile:true}` | touch | 2-pointer touch sequence, 14 touchmoves | 0.4216667 → 0.4216667 |
| `m_touch` | + `Emulation.setTouchEmulationEnabled {enabled:true, maxTouchPoints:5}` | touch | 2-pointer touch sequence, 16 touchmoves | 0.4216667 → 0.4216667 |
| `m_default` | same config | **default** (no `gestureSourceType`) | 16 ctrl wheels, sign in, span 240.9 ms | 0.4216667 → 0.8433332 |
| `m_out` | same config | mouse 0.25x | 46 wheels, sign out, span 750.4 ms | 0.8433332 → **0.4216667** |
| `m_narrow` | `setDeviceMetricsOverride {390x844, dsf 3, mobile:true}` | touch | 2-pointer touch sequence, 29 touchmoves | 0.25 → 0.25 |

- **A touch pinch does not change page scale under mobile emulation either.** `mobile:true` alone,
  `mobile:true` + touch emulation, and a realistic 390x844@3 mobile viewport all deliver complete
  two-finger touch sequences (both points present) and leave `visualViewport.scale` untouched. The
  frozen C1 `limit` hedges that the no-scale-change is "a host observation, not a claim about mobile
  emulation"; the hedge is now measured and the observation is *stronger* than the limit states.
- **The default source stays mouse**: with `mobile:true` and touch emulation enabled, a pinch with no
  `gestureSourceType` is still a ctrl+wheel pinch and doubles the page scale (0.4217 → 0.8433).
  Default dispatch is `GetDefaultSyntheticGestureSourceType()` (`synthetic_pinch_gesture.cc:24-40`),
  not the touch emulation state.
- **The minimum page scale equals the page's initial scale, not the constant 1**: `m_out` (0.25x from
  0.8433, target 0.2108) stops at exactly 0.4216667, the page's initial mobile scale. On the desktop
  page the initial scale is 1, which is why the frozen `clamp` leg reads "1 → 1". This qualifies the
  driver's parenthetical "minimum page scale"; the measured leg statement itself is unchanged.
- Mechanism for the touch no-zoom [INFERENCE]: the synthetic touchscreen pinch presses/moves/releases
  two pointers through `SyntheticPointerDriver` (`synthetic_touchscreen_pinch_gesture.cc:117-141`),
  i.e. it injects touch events into the renderer's input pipeline; the browser-side recognizer that
  turns real OS touch sequences into pinch-zoom never sees them. That is why settings that change
  the renderer (mobile emulation, touch emulation, viewport meta) do not change the result.

Repro: `--variant touchmobile` (receipts `touchmobile.json`, `touchmobile-run1.json`).

## 5. relativeSpeed 1600 and 100 — the wheel span law

| variant | scaleFactor | relativeSpeed | predicted `(s-1)*200/speed` | observed wheel span | ratio | wheels | final scale |
|---|---|---|---|---|---|---|---|
| `speed1600` | 2 | 1600 | 125 ms | 125.2 ms | 1.0016 | 9 | 1.99999964 |
| `speed100` | 2 | 100 | 2000 ms | 1999.9 ms | 1.0000 | 122 | 1.99999952 |
| (my `law:in`, default speed) | 2 | 800 | 250 ms | 249.7 ms | 0.9988 | 17 | 2 |

Yes: the wheel span scales exactly as `(s-1)*200/speed` for `s > 1` (and `(1/s-1)*200/speed` for
`s < 1`: `scale025` 750 ms nominal / 749.9 ms observed; `scale3` 500 / 492.5). The source is
`kPixelsNeededToDoubleOrHalve = 200` and `total_duration = Seconds(scale_factor_delta /
relative_pointer_speed_in_pixels_s)` (`synthetic_touchpad_pinch_gesture.cc:160-174`). The final
scale is the target in both runs, so speed changes duration only, not the endpoint. The frozen
`slow` leg is a *touch* pinch (different duration formula, `synthetic_touchscreen_pinch_gesture.cc:169-171`)
and is not re-tested here.

Repro: `--variant speed1600`, `--variant speed100`.

## 6. The deltaY law on the in leg (and at two other page-scale regimes)

Law under test: `deltaY_i = -100*ln(k_i)/S_i`, `k_i` the gesture's incremental scale, `S_i` the page
scale at dispatch. The alignment-free integral form is
`sum_i(-deltaY_i * S_i)/100 = ln(gesture scale factor)`, independent of clamping.

| leg | regime | n | `sum(-dY)/100` (no divisor) | `sum(-dY*S)/100` | `ln(scaleFactor)` | ratio |
|---|---|---|---|---|---|---|
| `law:in` | 1 → 2 | 17 | 0.48929 | **0.69315** | 0.69315 | 1.00000 |
| `law:out` | 2 → 1 | 16 | -0.51084 | **-0.69315** | -0.69315 | 1.00000 |
| `scale3:p3` | 1 → 3 | 31 | 0.65536 | **1.09861** | 1.09861 | 1.00000 |
| `scale3:p3b` | 3 → 9 (page clamps at 4) | 32 | 0.28515 | **1.09861** | 1.09861 | 1.00000 |
| `scale025:q` | 1 → 0.25 (page clamps at 1) | 47 | -1.38629 | **-1.38629** | -1.38629 | 1.00000 |
| `touchmobile:m_default` | 0.4217 → 0.8433 | 16 | 1.16314 | **0.69315** | 0.69315 | 1.00000 |
| `touchmobile:m_out` | 0.8433 → 0.4217 | 46 | -2.84402 | **-1.38629** | -1.38629 | 1.00000 |

The `/pageScale` divisor is real and decisive: dropping it is 29% low on the 1→2 leg, 68% high on
the 0.42→0.84 leg, and 105% high on the 0.84→0.42 leg — the error changes sign with `S` across 1,
which no constant-factor variant reproduces. The sum identity holds to 5 decimals in all seven wheel
legs, including the two clamped legs (where the page scale stops but the deltas keep carrying the
gesture's full factor).

Per event (`analysis.json` → `law["law:in"].rows`): for every event whose recorded page scale
differs from the previous event's, `exp(-dY_i*S_i/100)` equals `S_i/S_{i-1}` to 6 decimals
(residual 0.000%). The first 2-3 events and the final event show a one-event commit lag — the
main-thread `visualViewport.scale` read inside the wheel listener lags the compositor's page scale —
and in those windows adjacent events swap their `k` values while the **window product stays exact**
(`law:in` events 1-3: 1.030436*1.064272*1.060219 = 1.16270 = S_3/S_0; `scale3:p3` events 1-4:
1.19917 = S_4/S_0). The integral form needs no alignment and is exact.

Repro: `--variant law` (receipt `law.json`), `--variant scale3`, `--variant touchmobile`.

## 7. Anchor at (5,5) and the anchor-bounds law

| leg | anchor | source | observed |
|---|---|---|---|
| `edge_mouse` | (5,5) | mouse 2x | 17 ctrl wheels, span 250.1 ms, wheel positions (4,4),(3,3),(2,2), scale 1 → 2.0000005 |
| `edge_touch` | (5,5) | touch 2x | **one** pointer only: `pointerdown(touch)` at (5, 36.25), 14 moves down to (5, 82.5), `pointerup`; no second point, no scale change (2.0000005 → 2.0000005) |

- The mouse pinch at the corner is unaffected: the wheel is clamped to the viewport edge by
  coordinate rounding and the zoom still lands.
- The touch pinch at the top edge **loses its upper pointer**: the geometry puts the two points at
  `anchor.y ± initial_distance` (`synthetic_touchscreen_pinch_gesture.cc:164-165`), and with
  `initial_distance = 31.25` CSS at scale 2 the upper point is at y = -26.25, which is never
  delivered. The page sees a single-finger drag, not a two-finger pinch. The same anchor with a
  mouse source is fine, so the failure is the touchscreen geometry at the boundary, not the anchor
  check.

Precise bounds (`bounds` variant), page scale 2.999998 after a 3x pinch:

| anchor | DIPs = anchor × S | result |
|---|---|---|
| (427,299) at scale 1 | (427,299) | **ok** (scaleFactor 1, no events) |
| (426,299) at scale 3 | (1277.999, 896.999) | **ok** |
| (427,299) at scale 3 | (1280.999, 896.999) | **-32602 Position out of bounds** |
| (426,300) at scale 3 | (1277.999, 899.9994) | **ok** |
| (500,100) at scale 3 | (1499.999, 299.9998) | **-32602 Position out of bounds** |

So the valid CSS anchor box is `x < 1280/S`, `y < 900/S` with the right/bottom edges exclusive:
the anchor is multiplied by the page scale (`input_handler.cc:1553-1574`, `:2110`, `:63-65`) and
compared with the view bounds (`:2314-2318`). The frozen `outside` leg (x=5000 → -32602) is the
same check at scale 1.5; the bound is not a constant, it shrinks as the page is zoomed in. This is
also why the `scale3-run1` p3b at (400,300) was refused: at scale 3 the anchor sat exactly on the
exclusive bottom edge.

Repro: `--variant edge`, `--variant bounds` (receipts `edge.json`, `bounds.json`).

## Frozen-claims contradiction audit

Frozen statements are the `claims.json` C1 surface/limit plus the pinned driver's `LEG_SHAPE`
comments. My measurements:

| frozen statement | my measurement | verdict |
|---|---|---|
| mouse/default pinches become trusted ctrl+wheel events that change page scale | every mouse/default leg: ctrl wheels, `isTrusted true`, scale moved | holds |
| `in` 1→2, ≥5 wheels, span 150-450 ms | `law:in` 17 wheels, 249.7 ms, 1→2 | holds |
| `out` 2→1 | `law:out` 16 wheels, 241.5 ms, 2→1 | holds |
| `clamp` 0.5x at scale 1 → scale 1 | `scale025` 0.25x at 1 → 1 (47 wheels, 749.9 ms) | holds, one factor further out |
| `unit` scaleFactor 1 is a no-op | `bounds` b_scale1/b_in/b_out_y: 0 wheels, no scale change | holds |
| `default` pinch is a mouse ctrl+wheel | `m_default` (default source under mobile+touch emulation): 16 ctrl wheels, scale doubled | holds |
| touch pinches deliver two-finger sequences without changing page scale | `m_mobile`/`m_touch`/`m_narrow`: both points delivered, no scale change | holds, extended to mobile emulation |
| `pen` → -32602 Unknown gestureSourceType | not run (not assigned) | untested |
| `outside` x=5000 → -32602 Position out of bounds | `bounds` (427,299)@3x and (500,100)@3x → same error | holds; the bound is `x<1280/S, y<900/S` |
| `zero` scaleFactor 0 never finishes, no CDP response | `queue` 3 s bound, no response, 220 zero-delta wheels | holds; the queue stays blocked ≥12 s |
| driver comment: `clamp` 1→1 is the "minimum page scale" | desktop min 1; mobile min 0.4216667 = initial scale | **qualified**: the minimum is the initial page scale, not a constant 1 |
| C1 `limit`: touch no-scale-change is a host observation, not a claim about mobile emulation | mobile emulation also shows no scale change | holds, strengthened (the observation now covers mobile emulation) |

No frozen leg statement is contradicted. The only correction is the parenthetical explanation of the
clamp: the minimum page scale is the page's initial scale (1 on the desktop page, 0.4216667 on the
mobile-emulated page), which the frozen leg's 1→1 measurement is consistent with.

## What the knowledge should record (proposed; not applied — L1 owns the note)

1. Max page scale from a pinch update is **4.0**; min is the **initial page scale** (1 desktop,
   0.4216667 under `mobile:true` on a 3000 px-wide page). Clamps act per event; the wheels keep
   firing and the deltas still sum to the gesture's full factor.
2. `scaleFactor < 0` is accepted (no range check, release DCHECKs compiled out) and injects exactly
   one trusted ctrl+wheel with **deltaY NaN**; the command reports success and the page scale does
   not move.
3. The synthetic gesture queue is a **single global lane**: a scaleFactor-0 pinch wedges every later
   pinch *and* scroll gesture with no CDP response and no timeout; the renderer and CDP stay alive.
4. Touchscreen pinches never change page scale on this host, **including under mobile emulation**
   (`mobile:true`, touch emulation, 390x844@3); the default source stays mouse.
5. Wheel span = `(s-1)*200/speed` s (inverse for s<1), verified at 100/800/1600 px/s and s =
   0.25/2/3; final scale is the target.
6. `deltaY_i = -100*ln(k_i)/S_i`; the integral `sum(-dY*S)/100 = ln(gesture factor)` is exact in all
   seven wheel legs; the page-side `visualViewport.scale` read lags by up to one event (window
   products stay exact).
7. The anchor is multiplied by the page scale before the bounds check: valid CSS box is
   `x < 1280/S`, `y < 900/S`, right/bottom exclusive. At scale 3, (426,300) is accepted and
   (427,299) refused. A touch pinch whose anchor is within one half-span of the top edge loses its
   upper pointer and degenerates to a single-finger drag.

## Risks and limits

- One attempt per variant; the two second runs are a plan fix (scale-3 anchor) and an added leg
  (`m_out`), with the first runs retained. The `scale3-run1` p3b refusal is a plan error, reported
  as the bounds evidence it turned out to be.
- Same host, one Chromium build (155.0.8059.84), headless only; page-scale clamps are Blink
  `PageScaleConstraints` behaviour and may differ on other builds or with a viewport meta tag.
- The touch no-zoom mechanism is [INFERENCE] from the staged sources plus the four-config
  measurement; the browser-side gesture recognizer is not in the staged sources.
- The queue internals (`SyntheticGestureController`) are not staged; the block is measured, not read.
- The per-event deltaY law is exact only up to the one-event `visualViewport` commit lag; the
  integral form is the alignment-free statement.
- Scratch `/fast/scratch/hyaku/tabi-r71/R71Exec3` was deleted after the receipts were copied here;
  no `/tmp` path was used as evidence.

## Evidence

Directory `.ufo/waves/round-71/w1/R71Exec3/`:

| file | sha256 |
|---|---|
| `chrome-cdp-pinchprobe-r71.mjs` (v4) | `d7526381f9265cc9efd37cb4fd518335439c98dfe7bad9a53f348382a7e9adc7` |
| `chrome-cdp-pinchprobe-r71.rev-954e35fd.mjs` (v1) | `954e35fd45cf5dbbd661d4bec4f6085d955e98996211aab8ea065fbfd19df4ba` |
| `chrome-cdp-pinchprobe-r71.rev-b24869eb.mjs` (v2) | `b24869eb6a6a313e3f3fb45610929db01155e6ec1c996a693ea5606105b625d1` |
| `chrome-cdp-pinchprobe-r71.rev-8c04d9ed.mjs` (v3) | `8c04d9edce4b26adb3875cdbd0bcfc20772efea62326a9fef93266a203ee458b` |
| `analyze-pinchprobe-r71.mjs` | `50be4504a149eaca5ce38863e87c20bde4ef575ff2301cdfce4962125183d18e` |
| `analysis.json` | `4a6695ce63d4b0d797a9776f111c25a1ce02f29f0370767b409bd4e1b6380abb` |
| `receipts/bounds.json` | `227b754498f071faa42c2c8c820b52174d6b3475350eabbbb40aedfc889cc3a8` |
| `receipts/edge.json` | `363ea857958849141bf2a5848a3d4f55db286399281744c02e3fcfe7960e8b60` |
| `receipts/law.json` | `758da808908204f23b25437fc4c855fb70d703a0751b707a1c58bab26a9cda1c` |
| `receipts/negative.json` | `f70a4bf02a5e85212efb1a77b84c85e4a932d6d45974e15b9b48fcb6634d18a9` |
| `receipts/queue.json` | `c733c4a0b6a624cd57ca4c43de6dbff038ac349fc4541a193bef354f2d4da38a` |
| `receipts/scale025.json` | `caf675ea82c44150b69759f63a1c778de102a6e4f3bc65ee7002a72857576e7a` |
| `receipts/scale3-run1-badanchor.json` | `0782007cb7cb6fcca51b4bb24ec3acb4d34aa246160494878c69b9495212e8e3` |
| `receipts/scale3.json` | `7a2a12f409d3904cbd5e7ec2f682bf9be5b4e56e4c34552877644b205d702c13` |
| `receipts/speed100.json` | `7640d507b3306b0a66f3d2695d2b521555d711993bfdde9fda526c26f622b2b7` |
| `receipts/speed1600.json` | `6611b621a91cc536df09784e94edcebdd7f4a7e168a01e50ee57973b695d094e` |
| `receipts/touchmobile-run1.json` | `5843a37d50f73beebd6cef5f7f2059285dfe070f099f11985b59dd518690629f` |
| `receipts/touchmobile.json` | `fd2506b474d5002032c932129fa1bb469f13639dbd56b242b3deabf53f3af917` |

Each receipt is self-describing: `variant`, `nonce`, `driverSha256`, `plan` (every leg and its
params), `legs` (CDP result/error, elapsed, both scale reads), `events` (raw), `cdpSendLog`,
`teardown`. `summaries/` holds the driver stdout for each run.
