# R71Scout — source quotes receipt (independent decode, this session)

Every quote below is from MY OWN decode of the `?format=TEXT` bodies fetched this
session (digests in `fetch-ledger.json`), not from the L1-staged copies — although
for the five assigned files the decoded bytes are byte-identical to the staged ones.

Line numbers are line numbers in the DECODED (plain text) file.

---

## Q1 — default-source dispatch (assigned: `synthetic_pinch_gesture.cc`)

`synthetic_pinch_gesture.cc:29-30`
```
    if (source_type == content::mojom::GestureSourceType::kDefaultInput) {
      source_type = target->GetDefaultSyntheticGestureSourceType();
```
(same lines, quoted: "if source_type == kDefaultInput, source_type = target->GetDefaultSyntheticGestureSourceType();")

`synthetic_pinch_gesture.cc:34-39`
```
    if (source_type == content::mojom::GestureSourceType::kTouchInput) {
      lazy_gesture_ =
          std::make_unique<SyntheticTouchscreenPinchGesture>(params());
    } else {
      DCHECK_EQ(content::mojom::GestureSourceType::kMouseInput, source_type);
      lazy_gesture_ = std::make_unique<SyntheticTouchpadPinchGesture>(params());
```
(same lines, quoted: "if source_type == kTouchInput make SyntheticTouchscreenPinchGesture, else SyntheticTouchpadPinchGesture")

`synthetic_pinch_gesture.cc:33`
```
    DCHECK_NE(content::mojom::GestureSourceType::kDefaultInput, source_type);
```

**Auxiliary (NOT staged by the lane) — the platform's answer on Linux:**

`content/browser/renderer_host/input/synthetic_gesture_target_aura.cc:310-313`
```
content::mojom::GestureSourceType
SyntheticGestureTargetAura::GetDefaultSyntheticGestureSourceType() const {
  return content::mojom::GestureSourceType::kMouseInput;
}
```
(same lines, quoted: "SyntheticGestureTargetAura::GetDefaultSyntheticGestureSourceType returns kMouseInput")

---

## Q2 — touchpad early finish at scale_factor == 1.0f

`synthetic_touchpad_pinch_gesture.cc:86-91`
```
    case STARTED:
      // Check for an early finish.
      if (params().scale_factor == 1.0f) {
        state_ = DONE;
        break;
      }
```
(same lines, quoted: "if params().scale_factor == 1.0f then state_ = DONE and break")

Touchscreen twin, `synthetic_touchscreen_pinch_gesture.cc:88-93`:
```
    case STARTED:
      // Check for an early finish.
      if (params().scale_factor == 1.0f) {
        state_ = DONE;
        break;
      }
```

Guard on a non-positive scale, `synthetic_touchpad_pinch_gesture.cc:29`:
```
  DCHECK_GT(params().scale_factor, 0.0f);
```

---

## Q3 — CalculateEndTime: inverse below 1, 200 px per doubling, duration = delta / speed

`synthetic_touchpad_pinch_gesture.cc:158-175`
```
void SyntheticTouchpadPinchGesture::CalculateEndTime(
    SyntheticGestureTarget* target) {
  const int kPixelsNeededToDoubleOrHalve = 200;

  float scale_factor = params().scale_factor;
  if (scale_factor < 1.0f) {
    // If we are scaling down, calculate the time based on the inverse so that
    // halving or doubling the scale takes the same amount of time.
    scale_factor = 1.0f / scale_factor;
  }
  float scale_factor_delta =
      (scale_factor - 1.0f) * kPixelsNeededToDoubleOrHalve;

  const base::TimeDelta total_duration = base::Seconds(
      scale_factor_delta / params().relative_pointer_speed_in_pixels_s);
  DCHECK_GT(total_duration, base::TimeDelta());
  stop_time_ = start_time_ + total_duration;
}
```
Key lines: 160 (`kPixelsNeededToDoubleOrHalve = 200`), 163-167 (inverse below 1),
168-169 (delta), 171-172 (duration = delta / speed), 174 (stop_time_).

**What scale_factor 0 does to it** (the assignment's specific question):

* `synthetic_touchpad_pinch_gesture.cc:29` — `DCHECK_GT(params().scale_factor, 0.0f);`
  is a **DCHECK**, i.e. compiled out of release builds. The scored receipt's
  `zero` leg (scaleFactor 0) returned no CDP error and no crash, consistent with a
  release build. (I did not inspect the binary's build flags; this is a source-level
  statement about DCHECK, corroborated by the receipt, not a claim about the binary.)
* `synthetic_touchpad_pinch_gesture.cc:166` — with `scale_factor == 0.0f`,
  `scale_factor < 1.0f` is true, so `scale_factor = 1.0f / scale_factor` =
  `1.0f / 0.0f` = **+inf** (IEEE-754, no trap). Then
  `scale_factor_delta = (inf - 1.0f) * 200` = +inf, and
  `total_duration = base::Seconds(inf / speed)`.
  **I did not verify** whether Chromium's `Seconds`/`ClampedNumeric` conversion keeps
  that +inf or saturates it to the maximum representable `TimeDelta`
  (`base/time/time.h` downloaded but the conversion was not located; the fetches for
  `base/time.cc`, `base/time/time.cc` and `base/numerics/checked_math.h` failed at
  this tag). Under either reading the end time is unreachably far in the future.
* `synthetic_touchpad_pinch_gesture.cc:173` — `DCHECK_GT(total_duration, base::TimeDelta())`
  would fire only in a debug build; in release it is skipped.
* `synthetic_touchpad_pinch_gesture.cc:174` — `stop_time_ = start_time_ + total_duration`
  is therefore effectively never reached.
* `synthetic_touchpad_pinch_gesture.cc:144-148` — `HasReachedTarget(timestamp)` is
  `timestamp >= stop_time_` (line 184), never true, and `progress` =
  `(timestamp - start_time_) / (stop_time_ - start_time_)` ≈ 0, so
  `CalculateTargetScale` returns `Lerp(1.0f, 0.0f, ≈0)` ≈ 1.0f forever.
  (`Lerp` at line 15-16; `CalculateTargetScale` at 141-149.)
* Consequence: the gesture never reaches DONE, so
  `input_handler.cc:298` (`if (result == SyntheticGesture::Result::GESTURE_FINISHED)`)
  never fires and the CDP response is never sent — matching the receipt's
  `no-response-4000ms` on the `zero` leg, and the endless zero-delta ctrl wheel stream
  (each `BuildPinchUpdate` carries incremental_scale ≈ 1.0, lines 109-119).

---

## Q4 — touchscreen: two pointers on anchor.x moving apart

`synthetic_touchscreen_pinch_gesture.cc:114-121` (press)
```
void SyntheticTouchscreenPinchGesture::PressTouchPoints(
    SyntheticGestureTarget* target,
    const base::TimeTicks& timestamp) {
  synthetic_pointer_driver_->Press(params().anchor.x(), start_y_0_, 0);
  synthetic_pointer_driver_->DispatchEvent(target, timestamp);
  synthetic_pointer_driver_->Press(params().anchor.x(), start_y_1_, 1);
  synthetic_pointer_driver_->DispatchEvent(target, timestamp);
}
```
(same lines, quoted: "Press(params().anchor.x(), start_y_0_, 0) and Press(params().anchor.x(), start_y_1_, 1)")

`synthetic_touchscreen_pinch_gesture.cc:123-133` (move, opposite directions)
```
void SyntheticTouchscreenPinchGesture::MoveTouchPoints(
    SyntheticGestureTarget* target,
    float delta,
    const base::TimeTicks& timestamp) {
  // The two pointers move in opposite directions.
  float current_y_0 = start_y_0_ + delta;
  float current_y_1 = start_y_1_ - delta;

  synthetic_pointer_driver_->Move(params().anchor.x(), current_y_0, 0);
  synthetic_pointer_driver_->Move(params().anchor.x(), current_y_1, 1);
  synthetic_pointer_driver_->DispatchEvent(target, timestamp);
}
```
(same lines, quoted: "current_y_0 = start_y_0_ + delta; current_y_1 = start_y_1_ - delta; Move(params().anchor.x(), ...)")

`synthetic_touchscreen_pinch_gesture.cc:164-167` (the two anchor-relative start offsets)
```
  start_y_0_ = params().anchor.y() - initial_distance_to_anchor;
  start_y_1_ = params().anchor.y() + initial_distance_to_anchor;

  max_pointer_delta_0_ = initial_distance_to_anchor - final_distance_to_anchor;
```

`synthetic_touchscreen_pinch_gesture.cc:136-143` (release: pointer 1 then pointer 0)
```
void SyntheticTouchscreenPinchGesture::ReleaseTouchPoints(
    SyntheticGestureTarget* target,
    const base::TimeTicks& timestamp) {
  synthetic_pointer_driver_->Release(1);
  synthetic_pointer_driver_->DispatchEvent(target, timestamp);
  synthetic_pointer_driver_->Release(0);
  synthetic_pointer_driver_->DispatchEvent(target, timestamp);
}
```

---

## Q5 — input_handler.cc: SynthesizePinchGesture

`input_handler.cc:2093-2136` (whole handler; the four requested facts marked)

* **kDefaultRelativeSpeed 800** — `input_handler.cc:2106`
```
  const int kDefaultRelativeSpeed = 800;
```
  applied at `input_handler.cc:2116-2117`:
```
  gesture_params.relative_pointer_speed_in_pixels_s =
      relative_speed.value_or(kDefaultRelativeSpeed);
```
* **Position out of bounds** — `input_handler.cc:2110-2114`
```
  gesture_params.anchor = CssPixelsToPointF(x, y, ScaleFactor());
  if (!PointIsWithinContents(gesture_params.anchor)) {
    callback->sendFailure(Response::InvalidParams("Position out of bounds"));
    return;
  }
```
  (`PointIsWithinContents` is at `input_handler.cc:2314-2319`: it translates the view
  bounds to the origin and does `bounds.Contains(point.x(), point.y())`.)
  Note `ScaleFactor()` (1553-1578) multiplies in the **page scale factor**
  (line 1573) and browser zoom — so the anchor is scaled before the bounds check;
  that is the mechanism behind the R71Exec3 probe "anchor bounds scale with zoom".
* **Unknown gestureSourceType** — `input_handler.cc:2119-2125`
```
  if (!StringToGestureSourceType(
      std::move(gesture_source_type),
      gesture_params.gesture_source_type)) {
    callback->sendFailure(
        Response::InvalidParams("Unknown gestureSourceType"));
    return;
  }
```
  `StringToGestureSourceType` is `input_handler.cc:71-87`; it accepts only
  `default` / `touch` / `mouse` (lines 77-85) and returns false otherwise.
  The `-32602` JSON-RPC code itself lives in the DevTools protocol response layer
  (`Response::InvalidParams`), which is **not** in the five assigned files.
* **response only on GESTURE_FINISHED** — `input_handler.cc:295-304`
```
void SendSynthesizePinchGestureResponse(
    std::unique_ptr<Input::Backend::SynthesizePinchGestureCallback> callback,
    SyntheticGesture::Result result) {
  if (result == SyntheticGesture::Result::GESTURE_FINISHED) {
    callback->sendSuccess();
  } else {
    callback->sendFailure(Response::ServerError(
        base::StringPrintf("Synthetic pinch failed, result was %d", result)));
  }
}
```
  (quoted: "if result == GESTURE_FINISHED sendSuccess else sendFailure ServerError")
  Queueing, `input_handler.cc:2133-2135`:
```
  root_view->host()->QueueSyntheticGesture(
      std::make_unique<SyntheticPinchGesture>(gesture_params),
      base::BindOnce(&SendSynthesizePinchGestureResponse, std::move(callback)));
```

---

## Q6 — Input.pdl: synthesizePinchGesture parameter text

`Input.pdl:271-284`
```
  # Synthesizes a pinch gesture over a time period by issuing appropriate touch events.
  experimental command synthesizePinchGesture
    parameters
      # X coordinate of the start of the gesture in CSS pixels.
      number x
      # Y coordinate of the start of the gesture in CSS pixels.
      number y
      # Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out).
      number scaleFactor
      # Relative pointer speed in pixels per second (default: 800).
      optional integer relativeSpeed
      # Which type of input events to be generated (default: 'default', which queries the platform
      # for the preferred input type).
      optional GestureSourceType gestureSourceType
```
(quoted: "Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out)" / "Relative pointer speed in pixels per second (default: 800)")

`Input.pdl:35-40` (the enum — the whole allowed source vocabulary):
```
  experimental type GestureSourceType extends string
    enum
      default
      touch
      mouse
```
There is **no `pen`** in the protocol enum, which is why `'pen'` is refused with
"Unknown gestureSourceType" (see Q5). The internal mojom enum does have a pen value
(`content/common/input/input_injector.mojom:14-21`: `kDefaultInput, kTouchInput,
kMouseInput, kTouchpadInput = kMouseInput, kPenInput`) but the CDP string→enum mapper
never produces it — and note `kTouchpadInput = kMouseInput`, i.e. the same numeric
value, which is why `synthetic_touchpad_pinch_gesture.cc:30-36` rewrites a
non-touchpad source to `kTouchpadInput` and then the `kMouseInput` branch at line 61
runs the touchpad gesture.

---

## Reproduction commands (all read-only, no git mutation)

```bash
# tag commit (read-only)
git ls-remote --tags https://chromium.googlesource.com/chromium/src | grep 155.0.8059.84
# -> 5869fe313571d75152b77813cf0a4ee26a4e6df0 refs/tags/155.0.8059.84

# independent fetch + decode + digest (one file, repeat per path)
S=/fast/scratch/hyaku/tabi-r71/R71Scout; mkdir -p "$S"
curl -sS -o "$S/f.b64" \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/common/input/synthetic_pinch_gesture.cc?format=TEXT"
base64 -d "$S/f.b64" > "$S/f.cc"
sha256sum "$S/f.b64" "$S/f.cc" /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/sources/synthetic_pinch_gesture.cc
# -> 783666e2… (transport), 4f7fd101… (decoded), 4f7fd101… (staged): identical
wc -l "$S/f.cc"   # 54
```
