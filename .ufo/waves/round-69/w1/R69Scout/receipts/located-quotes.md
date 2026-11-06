# R69Scout — located quotes (S174 body, Chromium 155.0.8059.84 input_handler.cc)

Source of truth for every line number below: the file this seat fetched independently this
session (sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`, 2,343 lines,
89,463 bytes), staged at `.ufo/waves/round-69/w1/R69Scout/sources/input_handler.cc`.
Every quote below was checked as a **contiguous verbatim substring** of that file
(`seg in txt` → True for all five).

Line numbers are 1-indexed lines of the decoded body, as `awk 'NR==n'` reports them.

---

## Q1 — absent `gestureSourceType` → `kDefaultInput` (lines 71–79)

```
71|bool StringToGestureSourceType(std::optional<std::string> in,
72|                               content::mojom::GestureSourceType& out) {
73|  if (!in.has_value()) {
74|    out = content::mojom::GestureSourceType::kDefaultInput;
75|    return true;
76|  }
77|  if (in.value() == Input::GestureSourceTypeEnum::Default) {
78|    out = content::mojom::GestureSourceType::kDefaultInput;
79|    return true;
```

Verbatim (lines 71–79, 25 words):
> `bool StringToGestureSourceType(std::optional<std::string> in, content::mojom::GestureSourceType& out) { if (!in.has_value()) { out = content::mojom::GestureSourceType::kDefaultInput; return true; } if (in.value() == Input::GestureSourceTypeEnum::Default) { out = content::mojom::GestureSourceType::kDefaultInput; return true; }`

Tighter quote (lines 73–76, 9 words) if a single ≤25-word excerpt is preferred:
> `if (!in.has_value()) { out = content::mojom::GestureSourceType::kDefaultInput; return true; }`

Note: the function spans lines 71–90. The two branches that produce `kDefaultInput` are
73–76 (absent) and 77–79 (explicit `"default"`). The remaining branches are
81–83 (`kTouchInput`), 85–87 (`kMouseInput`), and `return false;` at line 89.

## Q2 — out-of-bounds anchor → `InvalidParams` (line 2163)

```
2163|    callback->sendFailure(Response::InvalidParams("Position out of bounds"));
```

Verbatim (line 2163, 4 words):
> `callback->sendFailure(Response::InvalidParams("Position out of bounds"));`

Context: guarded by `if (!PointIsWithinContents(gesture_params.anchor))` at line 2162,
after the anchor is computed at 2161. The same guard appears at 2111 and 2270 for the
sibling commands; `PointIsWithinContents` is defined at line 2314.

## Q3 — `preventFling` / `speed` defaults (lines 2167–2170)

```
2167|  const bool kDefaultPreventFling = true;
2168|  const int kDefaultSpeed = 800;
2169|  gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling);
2170|  gesture_params.speed_in_pixels_s = speed.value_or(kDefaultSpeed);
```

Verbatim (lines 2167–2170, 16 words):
> `const bool kDefaultPreventFling = true; const int kDefaultSpeed = 800; gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling); gesture_params.speed_in_pixels_s = speed.value_or(kDefaultSpeed);`

## Q4 — `repeatCount` / `repeatDelayMs` defaults (lines 2190–2192)

```
2190|  SynthesizeRepeatingScroll(gesture_params, repeat_count.value_or(0),
2191|                            base::Milliseconds(repeat_delay_ms.value_or(250)),
2192|                            interaction_marker_name.value_or(""), ++last_id_,
```

Verbatim (lines 2190–2192, 5 words):
> `SynthesizeRepeatingScroll(gesture_params, repeat_count.value_or(0), base::Milliseconds(repeat_delay_ms.value_or(250)), interaction_marker_name.value_or(""), ++last_id_,`

Note: `repeat_count` and `repeat_delay_ms` are both on lines 2190–2191; line 2192 carries
`interaction_marker_name` and `++last_id_` only.

## Q5 — the repeat loop, and the response sent only after the last gesture (lines 2239–2249)

```
2239|  if (repeat_count > 0) {
2240|    base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask(
2241|        FROM_HERE,
2242|        base::BindOnce(&InputHandler::SynthesizeRepeatingScroll,
2243|                       weak_factory_.GetWeakPtr(), gesture_params,
2244|                       repeat_count - 1, repeat_delay, interaction_marker_name,
2245|                       id, std::move(callback)),
2246|        repeat_delay);
2247|  } else {
2248|    SendSynthesizeScrollGestureResponse(std::move(callback), result);
2249|  }
```

Verbatim (lines 2239–2249, 24 words):
> `if (repeat_count > 0) { base::SingleThreadTaskRunner::GetCurrentDefault()->PostDelayedTask( FROM_HERE, base::BindOnce(&InputHandler::SynthesizeRepeatingScroll, weak_factory_.GetWeakPtr(), gesture_params, repeat_count - 1, repeat_delay, interaction_marker_name, id, std::move(callback)), repeat_delay); } else { SendSynthesizeScrollGestureResponse(std::move(callback), result); }`

Tighter quote (line 2239, 4 words) for the branch itself:
> `if (repeat_count > 0) {`

Note: `InputHandler::OnScrollFinished` is **defined** at line 2225; lines 2239–2249 are the
repeat/response tail of that function. The gesture is queued at 2217–2222
(`QueueSyntheticGesture(... base::BindOnce(&InputHandler::OnScrollFinished, ... repeat_count ...))`),
and `SynthesizeRepeatingScroll` is defined at 2196.

## Supporting detail — where the `1 + N` gesture count comes from

`SynthesizeRepeatingScroll` (2196–2223) queues exactly one gesture per call and binds
`repeat_count` into the completion callback (2217–2222). `OnScrollFinished` (2225–2250)
reschedules itself with `repeat_count - 1` while `repeat_count > 0` (2239–2246) and only
takes the `else` branch — the single `SendSynthesizeScrollGestureResponse` call at 2248 —
when `repeat_count == 0`. So a caller-supplied `repeatCount = N` yields `N + 1` gestures and
one response, sent after the last gesture finishes.

Runtime corroboration (independent of the source, from the lane's own scored receipt
`corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`, sha256
`587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8`): the `repeat` leg sent
`repeatCount: 2, yDistance: -200` and moved `scrollY` 300 → 900, i.e. 600 px = 3 × 200 px,
with **3** `scrollend` events in that leg — 1 + N = 3 gestures, one `scrollend` each.

## Supporting detail — granularity and the other anchors the knowledge note cites

- line 2159: `gesture_params.granularity = ui::ScrollGranularity::kScrollByPrecisePixel;`
- line 2157: `SyntheticSmoothScrollGestureParams gesture_params;`
- line 2158: `gesture_params.from_devtools_debugger = true;`
- line 2161: `gesture_params.anchor = CssPixelsToPointF(x, y, ScaleFactor());`
