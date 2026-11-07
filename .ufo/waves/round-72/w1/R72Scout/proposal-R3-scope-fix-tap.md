# R3 (continued) — the tap-command scope gap, same shape as the pinch gap

Seat R72Scout, round 72 attempt 2, 2026-11-06. Companion to `proposal-R3-scope-fix.md`. Nothing
here is applied to the lane's `corpus/SOURCES.md`; the rows below were measured on a scratch
mirror only.

## The gap

`corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` cites S174 and S173 for tap
lines, while both rows' scope cells name the scroll command only:

- `:1` — "S174 (input_handler.cc lines 2252-2304 at the same tag); S173 (Input.pdl lines 318-330 at the same tag)"
- `:31` — "S174 input_handler.cc sets" (the `kDefaultDuration = 50` / `kDefaultTapCount = 1` block)
- `:37` — "S173 Input.pdl:326" (`tapCount` parameter)
- `:38` — "S174 lines 2297-2304" (the gesture is queued)
- `:50` — "S173:328-329" (`gestureSourceType` default comment)
- `:64` — "S174 lines 2277-2282" (the `Unknown gestureSourceType` failure)
- `:65` — "S174 lines 2285-2289" (`tapCount:0` succeeds with no input)
- `:69` — "S174 lines 2270-2273" (`Position out of bounds`)

Lines quoted from `input_handler.cc` (tag 155.0.8059.84, sha256 72cf0d1d…324f4):

| line | quote (<= 25 words) |
|---|---|
| 2252 | `void InputHandler::SynthesizeTapGesture(` |
| 2265-2266 | `const int kDefaultDuration = 50;` / `const int kDefaultTapCount = 1;` |
| 2270-2271 | `if (!PointIsWithinContents(gesture_params.position)) {` / `callback->sendFailure(Response::InvalidParams("Position out of bounds"));` |
| 2277-2281 | `if (!StringToGestureSourceType(` / `callback->sendFailure(Response::InvalidParams("Unknown gestureSourceType"));` |
| 2285-2289 | `int count = tap_count.value_or(kDefaultTapCount);` / `if (!count) {` / `callback->sendSuccess();` |
| 2297-2304 | the `SyntheticTapGesture` is queued on the root view's host |

`Input.pdl` tap block: line 318 `experimental command synthesizeTapGesture`, 326 `optional integer tapCount`,
328-329 the `gestureSourceType` default comment.

## Proposed rows (same shape as S180/S181)

```
| S182 | Chromium 155.0.8059.84 DevTools Input handler source — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT | code | A | browser-side handling of Input.synthesizeTapGesture at this tag: the position bounds check, the gestureSourceType mapping, the duration and tapCount defaults, the tapCount:0 early success and when the CDP response is sent; S174 keeps the synthesizeScrollGesture scope and S180 the synthesizePinchGesture scope; not renderer event delivery and not the synthetic gesture itself (S175) | decoded lines 2252-2304 (SynthesizeTapGesture: position bounds check 2270-2273 with "Position out of bounds", gestureSourceType mapping 2277-2282 with "Unknown gestureSourceType", defaults 2265-2266 and 2285-2289, queueing 2297-2304); .ufo/waves/round-71/sources/input_handler.cc sha256 72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4 (2,343 lines); fetched 2026-11-06, re-opened 2026-11-06 (round 72) | supersedes S174 for the tap command only — a tap validates its position and its source type, defaults to 50 ms and one tap, sends nothing for tapCount 0 and answers the CDP call only when the gesture finishes; same URL, tag and decoded bytes as S162, S174 and S180, not independent corroboration | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md |
| S183 | Chromium 155.0.8059.84 Input domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT | code | A | experimental synthesizeTapGesture parameters at this tag: duration, tapCount and the gestureSourceType default; S173 keeps the synthesizeScrollGesture parameter scope and S181 the synthesizePinchGesture parameter scope; documentation-held, runtime unmeasured | decoded lines 318-330 (command, duration, tapCount, gestureSourceType); .ufo/waves/round-68/sources/Input.pdl sha256 5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d; fetched 2026-11-05, re-opened 2026-11-06 (round 72) | supersedes S173 for the tap command only — a tap is requested with a duration, a tap count and an optional source type; the declaration fixes no runtime behaviour; same URL, tag and decoded bytes as S173 and S181, not independent corroboration | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md |
```

Coupled edits, same as the pinch pair:

1. Append the two rows after S181.
2. Re-point the tap note's citations: `S174 (input_handler.cc lines 2252-2304` → `S182 (input_handler.cc lines 2252-2304`;
   `S173 (Input.pdl lines 318-330` → `S183 (Input.pdl lines 318-330`; body `S174 input_handler.cc sets` → `S182 …`,
   `S173 Input.pdl:326` → `S183 Input.pdl:326`, `S174 lines 2297-2304` → `S182 lines 2297-2304`,
   `S173:328-329` → `S183:328-329`, `S174 lines 2277-2282` → `S182 lines 2277-2282`,
   `S174 lines 2285-2289` → `S182 lines 2285-2289`, `S174 lines 2270-2273` → `S182 lines 2270-2273`.
3. S174's used-by loses `corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`; S173's
   used-by loses it too. S182/S183's used-by lists it.

## Recommendation

Do the pinch pair (S180/S181) and the tap pair (S182/S183) in one next-round commit. Splitting them
leaves the same defect half-open on the tap side, and the tap citations are the ones already
inside a used-by cell, so the registry would keep pointing at rows whose scope does not cover the
cited lines.
