PARTIAL

# R71Scout — round 71, wave w1: source-coverage findings (axis: coverage)

Full report: `.ufo/waves/round-71/w1/R71Scout/report.md`.
Receipts: `.ufo/waves/round-71/w1/R71Scout/receipts/{fetch-ledger.json,source-quotes.md}`.
Decoded copies: `.ufo/waves/round-71/w1/R71Scout/sources/`.

## Fetch (independent, this session, base64 `?format=TEXT` → `base64 -d`)

Tag `155.0.8059.84` = commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`
(`git ls-remote --tags`, read-only). All five assigned documents fetched and decoded
here are **byte-identical to the lane's staged copies**, decoded bodies *and* raw
base64 transports:

| file | accessed UTC | transport B/sha256 | decoded B/sha256 | lines | staged |
|---|---|---|---|---|---|
| synthetic_pinch_gesture.cc | 21:35:26 | 2564 / `783666e2…` | 1923 / `4f7fd101…` | 54 | r71/sources |
| synthetic_touchpad_pinch_gesture.cc | 21:35:28 | 9352 / `9442cb8a…` | 7013 / `67ab6a4b…` | 187 | r71/sources |
| synthetic_touchscreen_pinch_gesture.cc | 21:35:30 | 9952 / `585a4187…` | 7463 / `3b5253ce…` | 199 | r71/sources |
| input_handler.cc | 21:35:33 | 119284 / `847c531e…` | 89463 / `72cf0d1d…` | 2343 | r71/sources |
| Input.pdl | 21:35:35 | 19244 / `20257c65…` | 14431 / `5bbc6e23…` | 336 | **r68**/sources |

Lineage reproduces: `72cf0d1d…` is also r59/r69's `input_handler.cc`; `5bbc6e23…` is
also r64/r68's `Input.pdl` (r64's transport `20257c65…` identical too). **Input.pdl is
not staged in r71/sources at all** — r68's copy is the lane's own comparison copy and
it matches. Aux fetches (unstaged by the lane): `input_injector.mojom` `f13a768f…`,
`synthetic_gesture_target_aura.cc` `6adcbbcb…`, plus `synthetic_tap_gesture.cc`
`ac27658f…` (identical to r70's).

## Quotes (line numbers in my own decode; full text in receipts/source-quotes.md)

* `synthetic_pinch_gesture.cc:29-30` — "if source_type == kDefaultInput, source_type =
  target->GetDefaultSyntheticGestureSourceType();"; `:34-39` — "if source_type ==
  kTouchInput make SyntheticTouchscreenPinchGesture, else SyntheticTouchpadPinchGesture";
  `:33` `DCHECK_NE(kDefaultInput, source_type)`.
* `synthetic_touchpad_pinch_gesture.cc:88-90` — "if params().scale_factor == 1.0f then
  state_ = DONE and break" (touchscreen twin `:90-92`); `:29` `DCHECK_GT(scale_factor, 0.0f)`.
* `:158-175` CalculateEndTime — "`kPixelsNeededToDoubleOrHalve = 200`; below 1 the scale
  is inverted; duration = base::Seconds(delta / relative_pointer_speed_in_pixels_s)"
  (160 / 163-167 / 168-169 / 171-172 / 174).
* **scale_factor 0** → `:166` `1.0f/0.0f` = +inf (no trap) → delta +inf → duration +inf →
  `stop_time_` = start+inf → `:144-145` never reached, `:147-148` progress 0 →
  `Lerp(1.0f,0.0f,0)`=1.0f → endless incremental-scale-1.0 updates `:109-119`; gesture
  never DONE → `input_handler.cc:298` never fires → no CDP response. Matches the
  receipt's `zero` leg exactly, zero deltas included.
* `synthetic_touchscreen_pinch_gesture.cc:117,119` — "Press(params().anchor.x(),
  start_y_0_, 0) and Press(params().anchor.x(), start_y_1_, 1)"; `:128-129,131-132` —
  "current_y_0 = start_y_0_ + delta; current_y_1 = start_y_1_ - delta" (shared x, split y);
  `:136-143` release order 1 then 0.
* `input_handler.cc:2106` kDefaultRelativeSpeed 800 (applied `:2116-2117`, all source
  types); `:2110-2114` "Position out of bounds" (+ `PointIsWithinContents` `:2314-2319`,
  anchor pre-scaled by `ScaleFactor()` `:2110`, which multiplies page scale `:1573`);
  `:2119-2125` "Unknown gestureSourceType" (`StringToGestureSourceType` `:71-87` accepts
  only default/touch/mouse); `:295-304` "if result == GESTURE_FINISHED sendSuccess else
  sendFailure ServerError".
* `Input.pdl:272-284` — "Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms
  out)" / "Relative pointer speed in pixels per second (default: 800)"; `:35-40` the enum
  is only default|touch|mouse (no `pen`).

## Does the source predict every frozen leg?

Source-predicted in full: `unit` (1× no-op), `zero` (never finishes; endless zero-delta
updates), `slow` (duration ∝ 1/speed → exactly 4×, incl. touch since relative_speed is
plumbed for all source types). Message-only (the −32602 constant is in the DevTools
response layer, not these files): `pen`, `outside`. Partly: `in`, `out`, `default`
(the gesture, its duration and the default→mouse routing are predicted; the **ctrl+wheel
delivery and the page-scale change are not**), `touch` (two-pointer geometry predicted;
"does not zoom here" is zoom policy). Not predicted: the **`clamp` floor of 1** on page
scale. C1's surface sentence's first clause ("mouse/default pinches become trusted
ctrl+wheel events that change the visual-viewport page scale") is the part the cited
sources do not cover — the lane's own note marks it as inference and S177/S178 scope
themselves "not renderer-side wheel conversion" / "not page zoom policy".

## Corpus (SOURCES.md) — every doc has a row; re-opened all of them

S176 (`:190`, added `64e389f2`) cites :26-41 ✓; S177 (`:191`) cites :29, :86-131,
:158-175 ✓; S178 (`:192`) cites :88-106, :114-143, :145-173 ✓; S162/S174 and S168/S173
ranges also present as described ✓.

**Gap 1 (attribution).** The frozen claim's `sourced` field leans on "S173
Input.pdl:272-284 and S174 input_handler.cc:2093-2136, 295-305"; the line ranges and
digests are right, but S173's registered scope is "experimental synthesizeScrollGesture
parameters at this tag only" (cited :286-315) and S174's is "browser-side handling of
Input.synthesizeScrollGesture" (cited :71-79, 2167-2170, 2190-2191, 2239-2249). **No row
scope covers the pinch half of either file** (both rows' used-by list the round-71 pinch
note, and that note cites the pinch lines explicitly). Bytes unaffected; the registry
should carry a pinch-scoped row per file. I am not proposing an amendment to the frozen
claim — this is a coverage observation for L1.

**Gap 2 (unstaged dependency).** S176's assertion "on this Linux host that is the
mouse/touchpad path" needs the target's answer, which lives in
`content/browser/renderer_host/input/synthetic_gesture_target_aura.cc:310-313`
("SyntheticGestureTargetAura::GetDefaultSyntheticGestureSourceType returns kMouseInput")
— **not** in r71/sources and **no** SOURCES row (`grep -i "synthetic_gesture_target|
GetDefaultSyntheticGestureSourceType|aura"` → only the incidental S176 mention). Same for
the enum aliasing that makes S177/S178 readable (`input_injector.mojom:14-21`,
`kTouchpadInput = kMouseInput`). The tap contrast reproduces from my own
`synthetic_tap_gesture.cc` decode (kDefaultInput → kTouchInput, S175:22-26).

## Not established

No Chromium/driver/counter/battery/kill-power was run (out of seat scope; all runtime
numbers quoted come from the committed scored receipt or the corpus note, and are marked
as such). The Blink/browser files that convert a pinch into ctrl+wheel and into page
scale, the zoom-policy file that floors page scale at 1, and the DevTools
`Response::InvalidParams` definition were **not** located at this tag (candidate paths
`gesture_event_provider.cc`, `response.h`, `protocol.h` under
`content/browser/{renderer_host/input,devtools/protocol}` all 404) — so those remain
open. Debug-vs-release for the two `DCHECK`s is a source-level statement about
`DCHECK` semantics; the binary's build flags were not inspected.

## Writes (only these)

`.ufo/waves/round-71/w1/R71Scout/{report.md,receipts/,sources/}` and this file.
Scratch `/fast/scratch/hyaku/tabi-r71/R71Scout/` deleted after copying. No git/jj
mutation; no file under `scripts/`, `corpus/`, or `.ufo/waves/round-71/controls/` was
modified.
