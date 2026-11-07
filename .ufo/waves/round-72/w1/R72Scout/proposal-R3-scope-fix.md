# R3 proposal — scope cells for the pinch lines of `input_handler.cc` (and the pinch block of `Input.pdl`)

Seat R72Scout, round 72 attempt 2, 2026-11-06. Nothing here has been written into the lane's
`corpus/SOURCES.md`; every variant below was measured on a scratch mirror
(`/fast/scratch/hyaku/tabi-r72/R72Scout/mirror*`), never on the lane file. Evidence:
`receipt-r3-proposal.txt` in this directory.

## The defect (r71 routed defect R3)

`corpus/lessons/round-71-verifier-spotcheck.md:141`

> **R3 (sources scope)** — S173/S174 are scoped to the scroll command yet cited for pinch lines
> (R71Scout): revise the row scope or add rows.

Current scope cells (`corpus/SOURCES.md:187` S173, `:188` S174):

- S173 scope: `experimental synthesizeScrollGesture parameters at this tag only; documentation-held, runtime unmeasured`
- S174 scope: `same file as S162 (scope there: GetEventModifiers), a second scope: browser-side handling of Input.synthesizeScrollGesture at this tag: default source type, parameter defaults, the repeat loop and when the CDP response is sent; not renderer event delivery and not touch scrolling`

Yet the pinch notes cite them for pinch lines:

- `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md:1` — "S174 (input_handler.cc lines 2093-2136 and 295-305 at the same tag); S173 (Input.pdl lines 272-284 at the same tag)"
- same file `:44` "S173:282-283", `:47` "S174:2106, 2116-2117", `:60` "S174:295-305", `:68` "S174:2111-2114, 2119-2125", `:102` "S174:2109"
- `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md:1` — "S174 (input_handler.cc); S173 (Input.pdl)"

All of those line numbers are pinch lines, not scroll lines. The corpus contract
(`CORPUS.md:117`, rule 2) allows only `status`, `recheck` and `used-by` to change in place; a
scope correction is **a new row** whose `teaches` opens `supersedes S0NN —`. That rules Variant A
below out on contract grounds even though it is the smaller edit.

## The lines to be scoped (input_handler.cc, tag 155.0.8059.84, sha256 72cf0d1d…324f4, 2343 lines)

Fetched independently this session; the staged copy in `.ufo/waves/round-71/sources/input_handler.cc`
is byte-identical (`cmp` exit 0), and a second transport (GitHub raw mirror at the same tag)
agrees byte-for-byte. See `receipt-s176-178-reopen.txt`.

| line | text | quote (<= 25 words) |
|---|---|---|
| 2093 | `void InputHandler::SynthesizePinchGesture(` | `void InputHandler::SynthesizePinchGesture(` |
| 2106 | `const int kDefaultRelativeSpeed = 800;` | `const int kDefaultRelativeSpeed = 800;` |
| 2109 | `gesture_params.scale_factor = scale_factor;` | `gesture_params.scale_factor = scale_factor;` |
| 2111-2113 | anchor bounds check | `if (!PointIsWithinContents(gesture_params.anchor)) {` / `callback->sendFailure(Response::InvalidParams("Position out of bounds"));` |
| 2116-2117 | relative speed default | `gesture_params.relative_pointer_speed_in_pixels_s =` / `relative_speed.value_or(kDefaultRelativeSpeed);` |
| 2119-2123 | source-type check | `if (!StringToGestureSourceType(` / `callback->sendFailure(Response::InvalidParams("Unknown gestureSourceType"));` |
| 2133-2135 | queueing | `root_view->host()->QueueSyntheticGesture(` / `std::make_unique<SyntheticPinchGesture>(gesture_params),` |
| 295-304 | response | `void SendSynthesizePinchGestureResponse(` … `if (result == SyntheticGesture::Result::GESTURE_FINISHED) {` / `callback->sendSuccess();` |

`Input.pdl` (tag 155.0.8059.84, sha256 5bbc6e23…c66e3d, 336 lines) pinch block: line 272
`experimental command synthesizePinchGesture`, 279 `number scaleFactor`, 281
`optional integer relativeSpeed`, 284 `optional GestureSourceType gestureSourceType`.

## Variant A — widen the scope/anchor cells of S173 and S174 in place (REJECTED on contract)

Exact wording proposed (not applied):

- S173 scope → `experimental synthesizeScrollGesture and synthesizePinchGesture parameters at this tag only (scroll decoded lines 286-315; pinch decoded lines 272-284: scaleFactor, relativeSpeed, gestureSourceType); documentation-held, runtime unmeasured`
- S174 scope → `same file as S162 (scope there: GetEventModifiers), a second scope: browser-side handling of Input.synthesizeScrollGesture at this tag: default source type, parameter defaults, the repeat loop and when the CDP response is sent; a third scope: browser-side handling of Input.synthesizePinchGesture at this tag: the anchor bounds check, the gestureSourceType mapping, the default relative speed and when the CDP response is sent; not renderer event delivery and not touch scrolling`

Measured: lane gate `check-sources.mjs` findings identical to baseline (3 pre-existing E04
duplicate_url on S171/S172/S173), fleet census output byte-identical to baseline, exit 0.

Rejected because `CORPUS.md:117` (rule 2) permits only `status`, `recheck` and `used-by` to change
in place, and the scope cell is the claim's boundary. The lane's own precedent for a scope change
is a new row: S096 → S100 → S115 are three rows over the same URL, each with `teaches` opening
`supersedes S0NN —` (visible in `corpus/SOURCES.md:110,116,126`).

## Variant B4 — two new rows (RECOMMENDED)

S180 and S181 below. Three coupled edits are required; all three were measured together.

**(1) Append two rows to `corpus/SOURCES.md` after S179 (line 193).** Verbatim:

```
| S180 | Chromium 155.0.8059.84 DevTools Input handler source — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT | code | A | browser-side handling of Input.synthesizePinchGesture at this tag: the anchor bounds check, the gestureSourceType mapping, the default relative speed and when the CDP response is sent; S174 keeps the synthesizeScrollGesture scope; not renderer event delivery, not touch scrolling and not the synthetic gesture itself (S177) | decoded lines 2093-2136 (SynthesizePinchGesture: anchor bounds check 2111-2114 with "Position out of bounds", gestureSourceType mapping 2119-2125 with "Unknown gestureSourceType", default relative speed 800 at 2106 and 2116-2117, scale_factor 2109), 295-304 (SendSynthesizePinchGestureResponse answers only on GESTURE_FINISHED); .ufo/waves/round-71/sources/input_handler.cc sha256 72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4 (2,343 lines); fetched 2026-11-06, re-opened 2026-11-06 (round 72) | supersedes S174 for the pinch command only — a pinch validates its anchor and its source type before queuing SyntheticPinchGesture, defaults to 800 px/s, and answers the CDP call only when the gesture finishes; same URL, tag and decoded bytes as S162 and S174, not independent corroboration | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md, corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md |
| S181 | Chromium 155.0.8059.84 Input domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT | code | A | experimental synthesizePinchGesture parameters at this tag: scaleFactor, relativeSpeed and the gestureSourceType default; S173 keeps the synthesizeScrollGesture parameter scope; documentation-held, runtime unmeasured | decoded lines 272-284 (command, scaleFactor, relativeSpeed, gestureSourceType); .ufo/waves/round-68/sources/Input.pdl sha256 5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d; fetched 2026-11-05, re-opened 2026-11-06 (round 72) | supersedes S173 for the pinch command only — a pinch is requested as a relative scale factor with an 800 px/s default speed and an optional source type; the declaration fixes no runtime behaviour; same URL, tag and decoded bytes as S173, not independent corroboration | mined | 2026-11-06 | on-release | corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md, corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md |
```

**(2) Re-point the pinch citations in the two pinch knowledge notes** so the cited id matches the
row whose scope covers those lines (this is what makes the fix observable; the receipt check
`used_by_uncited` requires each used-by file to actually contain the row id):

- `chromium-synth-pinch-gesture-runtime-round-71.md`: `S174 (input_handler.cc lines 2093-2136 and 295-305` → `S180 (input_handler.cc lines 2093-2136 and 295-304`; `S173 (Input.pdl lines 272-284` → `S181 (Input.pdl lines 272-284`; and in the body `S173:282-283` → `S181:282-283`, `S174:2106, 2116-2117` → `S180:2106, 2116-2117`, `S174:295-305` → `S180:295-304`, `S174:2111-2114, 2119-2125` → `S180:2111-2114, 2119-2125`, `S174:2109` → `S180:2109`.
- `chromium-synth-pinch-gesture-runtime-round-72.md`: `S174 (input_handler.cc)` → `S180 (input_handler.cc)`; `S173 (Input.pdl)` → `S181 (Input.pdl)`.

**(3) Trim the used-by cells of S173 and S174** (allowed in place by `CORPUS.md:117`) so they no
longer claim the pinch notes:

- S173 used-by → `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md, corpus/lessons/round-68.md, corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`
- S174 used-by → `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md, corpus/lessons/round-69.md, corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md`

(the two pinch notes leave S173/S174's used-by and enter S180/S181's).

**Measured on the mirror:** lane gate `check-sources.mjs` → 3 findings, the same three
pre-existing E04 `duplicate_url` on S171/S172/S173 that the untouched baseline registry also
reports; **no new finding of any kind**, exit 1 unchanged. Fleet census
`sources-census.sh validate` → exit 0, `ok`, with exactly two new W04 cross-scope warnings
(S180 and S181 share their URL with S174/S173 in a different scope — the contract's W04 case,
"warnings do not affect clean lanes").

### Why the `supersedes` prefix in `teaches` is load-bearing

`check-sources.mjs:296` skips the duplicate-URL finding when the row's `teaches` cell opens
`supersedes S0NN `. Without the prefix, Variant B trips `duplicate_url` on S180 and S181
(measured: 7 findings instead of 3, see `receipt-r3-proposal.txt`, "VARIANT B2/B3"). The
`supersedes` wording also matches the lane's existing same-URL chain (S096 → S100 → S115) and
states honestly that the two rows are the same bytes, not independent corroboration.

## What the L1 must also fix, or this defect stays half-open

The same defect exists for the **tap** command and is *not* covered by the two rows above:

- `corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md:1` cites "S174 (input_handler.cc
  lines 2252-2304 at the same tag); S173 (Input.pdl lines 318-330 at the same tag)", and its body
  cites `S174 lines 2277-2282`, `S174 lines 2285-2289`, `S174 lines 2270-2273`, `S173 Input.pdl:326`,
  `S173:328-329` — all tap lines, outside both rows' declared scroll scope.

So a complete R3 close needs the same treatment for the tap command (two more rows, or one row per
command per file). Proposed wording for those two rows is in
`proposal-R3-scope-fix-tap.md`. Note that S174's used-by in the current registry already lists the
tap note, so the tap citations must be re-pointed too or the used-by cell and the note will
disagree.

## Constraint the L1 must respect

`corpus/SOURCES.md` is a lane production file. This seat did not edit it, and the frozen claim
(`C1-SYNTHPINCH-R72`) does not depend on the registry: the scoped edits above are next-round work
and must not be made inside the r72 freeze window (`8356a09e`, digests `7366d45c`).
