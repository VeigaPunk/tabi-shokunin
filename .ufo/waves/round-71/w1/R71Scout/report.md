PARTIAL

# R71Scout — round 71 source-coverage scout (axis: coverage)

Seat: `R71Scout` (leaf; no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Base `11b00f644f5af1a4f7827da6956732e0b91023a5`, pre-freeze instruments `711a38c2`,
claims freeze `04f4330f`, digest freeze `749a1ab5`. Claims are FROZEN; nothing in
`claims.json`, `scripts/`, `corpus/` or `.ufo/waves/round-71/controls/` was read-modified
or written by this seat. All writes are under
`.ufo/waves/round-71/w1/R71Scout/`. Read-only git only (`git log/show/rev-parse/ls-remote`).

## 0. Verdict in one paragraph

All five assigned documents were fetched **independently in this session** (base64
`?format=TEXT` → `base64 -d`) and are **byte-identical** to the lane's staged copies —
both the decoded bodies and the raw base64 transports. The source predicts the
gesture-layer legs of C1 exactly (unit-1 no-op, zero-scale never finishing, the two
magnitude/duration formulas, both validation-error messages, the default→mouse
routing) but it does **not** predict the page-visible half of the C1 surface
statement: the ctrl+wheel delivery, the page-scale change 1→2 / 2→1 / 1→1.5, the
scale floor of 1, and "touch pinches do not zoom here" are Blink/zoom-policy facts
that live in files the round never staged. Separately, the corpus has a **scope gap**:
the CDP-facing half of the capability (`input_handler.cc:2093-2136, 295-305` and
`Input.pdl:272-284`) is attributed by the claim's `sourced` field to S173/S174, whose
registered row scope is *scroll-only*. Digests and line ranges are correct; the
attribution string is what does not line up.

## 1. Independent fetch — receipts

Full ledger: `receipts/fetch-ledger.json`. Quotes with line numbers:
`receipts/source-quotes.md`. Decoded copies: `sources/`.

Tag commit confirmed read-only: `git ls-remote --tags https://chromium.googlesource.com/chromium/src`
→ `5869fe313571d75152b77813cf0a4ee26a4e6df0  refs/tags/155.0.8059.84` (same commit the
lane's S168/S169 rows cite).

| file | accessed (UTC) | transport B / sha256 | decoded B / sha256 | lines | staged copy | identical? |
|---|---|---|---|---|---|---|
| synthetic_pinch_gesture.cc | 21:35:26 | 2564 / `783666e2…7727` | 1923 / `4f7fd101…33e8` | 54 | r71/sources/ | **yes** (decoded + transport) |
| synthetic_touchpad_pinch_gesture.cc | 21:35:28 | 9352 / `9442cb8a…7add` | 7013 / `67ab6a4b…9d2` | 187 | r71/sources/ | **yes** (decoded + transport) |
| synthetic_touchscreen_pinch_gesture.cc | 21:35:30 | 9952 / `585a4187…192b` | 7463 / `3b5253ce…e3c0` | 199 | r71/sources/ | **yes** (decoded + transport) |
| input_handler.cc | 21:35:33 | 119284 / `847c531e…46a0` | 89463 / `72cf0d1d…4f4` | 2343 | r71/sources/ | **yes** (decoded + transport) |
| Input.pdl | 21:35:35 | 19244 / `20257c65…df9d7` | 14431 / `5bbc6e23…6e3d` | 336 | **r68**/sources/ | **yes** (decoded + transport) |

Cross-round lineage also reproduces: `input_handler.cc` sha256 `72cf0d1d…` is the same
file staged at r59 (S162) and r69 (S174); `Input.pdl` sha256 `5bbc6e23…` is the same
file staged at r64 (`s170-chromium155-Input.pdl`, transport `20257c65…` identical too)
and r68 (S173/S168). **Input.pdl is not staged in `.ufo/waves/round-71/sources/` at all**;
the r68 copy is the comparison copy the lane itself used, and it matches.

Auxiliary fetches (NOT assigned, NOT staged by the lane, kept in `sources/` and the
ledger): `content/common/input/input_injector.mojom` (`f13a768f…dc03`, 127 lines) and
`content/browser/renderer_host/input/synthetic_gesture_target_aura.cc`
(`6adcbbcb…59c6`, 363 lines). I also re-fetched `synthetic_tap_gesture.cc`
(`ac27658f…d331`, identical to r70's S175 staging) for the tap-vs-pinch contrast.

## 2. The requested quotes (line numbers in my own decode; full text in `receipts/source-quotes.md`)

**Default-source dispatch** — `synthetic_pinch_gesture.cc:29-30`
> "if source_type == kDefaultInput, source_type = target->GetDefaultSyntheticGestureSourceType();"

`:34-39`
> "if source_type == kTouchInput make SyntheticTouchscreenPinchGesture, else SyntheticTouchpadPinchGesture"

`:33` `DCHECK_NE(kDefaultInput, source_type);` — a debug-only assertion, so a target
answering `kDefaultInput` would be a DCHECK failure, not a silent third path.

**Touchpad early finish at scale 1** — `synthetic_touchpad_pinch_gesture.cc:88-90`
> "if params().scale_factor == 1.0f then state_ = DONE and break"

Twin at `synthetic_touchscreen_pinch_gesture.cc:90-92`. Guard `DCHECK_GT(params().scale_factor, 0.0f);`
at `synthetic_touchpad_pinch_gesture.cc:29`.

**CalculateEndTime** — `synthetic_touchpad_pinch_gesture.cc:158-175`
> "`kPixelsNeededToDoubleOrHalve = 200`; below 1 the scale is inverted; `total_duration = base::Seconds(scale_factor_delta / relative_pointer_speed_in_pixels_s)`"

Exact lines: 160 (200 px), 163-167 (inverse below 1), 168-169 (delta), 171-172
(duration = delta / speed), 174 (`stop_time_ = start_time_ + total_duration`).

**What scale_factor 0 does to it** (the assignment's specific question):
`0.0f < 1.0f` → `:166` computes `1.0f / 0.0f` = **+inf** (IEEE-754, no trap) →
`:168-169` delta = +inf → `:171-172` `base::Seconds(inf / speed)` → `:174`
`stop_time_` = start + that duration. (I did not open `base/time/time.h` /
`base/numerics/checked_math.h` successfully at this tag — `base/time/time.h`
downloaded but I did not locate the `Seconds`/`ClampedNumeric` conversion — so I do
**not** assert whether Chromium leaves the duration +inf or saturates it to the
maximum representable `TimeDelta`; under either reading the end time is
unreachably far in the future, which is what the receipt shows.)
`:173`'s `DCHECK_GT(total_duration, TimeDelta())` would only bite in a debug build;
`:29`'s `DCHECK_GT(scale_factor, 0.0f)` is likewise debug-only. Then
`:144-145` `HasReachedTarget` (`:184`, `timestamp >= stop_time_`) is never true and
`:147-148` `progress` = (ts−start)/(stop−start) ≈ 0 → `Lerp(1.0f, 0.0f, ≈0)` ≈ 1.0f, so
`:109-119` keeps emitting `BuildPinchUpdate` with incremental scale ≈ 1.0 forever and
the gesture never reaches DONE → `input_handler.cc:298` never fires → **no CDP
response**. The receipt's `zero` leg (`no-response-4000ms`, 282 ctrl wheels all
`deltaY 0`) is exactly what this predicts, including the zero deltas.

**Touchscreen two pointers** — `synthetic_touchscreen_pinch_gesture.cc:117` and `:119`
> "Press(params().anchor.x(), start_y_0_, 0) and Press(params().anchor.x(), start_y_1_, 1)"

`:128-129`, `:131-132`
> "current_y_0 = start_y_0_ + delta; current_y_1 = start_y_1_ - delta; Move(params().anchor.x(), …)"

So both pointers share the anchor's **x** and separate along **y**; `:164-167` sets the
two anchor-relative start offsets; `:136-143` releases pointer 1 then pointer 0.

**input_handler SynthesizePinchGesture** (`input_handler.cc:2093-2136`)
* `kDefaultRelativeSpeed` — `:2106` = 800, applied `:2116-2117`
  (`relative_speed.value_or(kDefaultRelativeSpeed)`) — for **every** source type,
  including touch.
* "Position out of bounds" — `:2110-2114`, with `PointIsWithinContents` at `:2314-2319`
  (view bounds translated to the origin, then `bounds.Contains`). The anchor is
  `CssPixelsToPointF(x, y, ScaleFactor())` and `ScaleFactor()` (`:1553-1578`) multiplies
  in the **page scale factor** (`:1573`) and browser zoom — the source mechanism behind
  the R71Exec3 "anchor bounds scale with zoom" probe.
* "Unknown gestureSourceType" — `:2119-2125`, with `StringToGestureSourceType` at
  `:71-87` accepting only `default` / `touch` / `mouse`.
* Response only on `GESTURE_FINISHED` — `:295-304`
  > "if result == GESTURE_FINISHED sendSuccess else sendFailure ServerError"
  queued at `:2133-2135`.

**Input.pdl** — `:272-284`
> "Relative scale factor after zooming (>1.0 zooms in, <1.0 zooms out)" / "Relative pointer speed in pixels per second (default: 800)"

`:35-40` — the whole `GestureSourceType` string enum is `default | touch | mouse`.
There is **no `pen`** in the protocol enum (the internal mojom enum
`input_injector.mojom:14-21` does have `kPenInput`, and `kTouchpadInput = kMouseInput`
is the same numeric value) — that is why `'pen'` can only be refused.

## 3. Does the source predict every frozen leg?

Ten frozen legs (names from the scored receipt). "Source-predicted" = derivable from
the five assigned documents alone.

| leg | source-predicted? | what the source says | what it does **not** say |
|---|---|---|---|
| `in` 2× mouse → ctrl+wheel, scale 1→2 | **partly** | mouse → touchpad pinch (S176:37-39); duration `(2−1)·200/800` = 0.25 s (S177:160-172); PinchBegin/Update/End stream (S177:96-131) | that the page sees **ctrl+wheel**, and the **page-scale** change — Blink-side conversion, not in the five files |
| `out` 0.5× → 2→1 | **partly** | inverse below 1 (S177:163-167) → same 0.25 s; scale-0.5 stream | the ctrl+wheel delivery and the page-scale 2→1 |
| `clamp` 0.5× at scale 1 → wheels, scale stays 1 | **no** (for the clamp) | the gesture still runs (same 0.25 s, 16 wheels) | the **floor of 1** on page scale — zoom policy, not in the five files |
| `unit` 1× → no events, success `{}` | **yes** | S177:88-90 early finish → DONE → `GESTURE_FINISHED` → `sendSuccess` (input_handler.cc:298) | — |
| `default` 1.5×, no source → ctrl+wheel, 1→1.5 | **partly** | default → target query (S176:29-30) → (on Linux/Aura) `kMouseInput` → touchpad path; duration `(1.5−1)·200/800` = 0.125 s | the ctrl+wheel delivery and the page-scale 1→1.5; also the *value* the platform returns needs a file the lane never staged (see §4) |
| `touch` 2× → two-finger sequence, no scale change | **partly** | two pointers on the anchor's x moving apart in y, press/move/release order, span and duration formulas (S178:114-173) | that the page **does not zoom** — S178's own scope says "not page zoom policy" |
| `slow` touch, relativeSpeed 200 → ~4× longer | **yes** | duration ∝ 1/speed: `\|2·max_pointer_delta_0_\| / relative_pointer_speed_in_pixels_s` (S178:169-171) with `relative_speed` plumbed at input_handler.cc:2116-2117 → exactly 800/200 = 4× | the exact event count (57 vs 15) and the 925 ms/231 ms figures — frame timing |
| `pen` → `-32602 "Unknown gestureSourceType"` | **message yes, code no** | message at input_handler.cc:2122-2123; only default/touch/mouse accepted (:71-87); PDL enum has no `pen` (:35-40) | the numeric **−32602** — that constant is in the DevTools protocol response layer, not in the five files |
| `outside` x=5000 → `-32602 "Position out of bounds"` | **message yes, code no** | message at :2112; `PointIsWithinContents` :2314-2319; anchor pre-scaled by `ScaleFactor()` :2110 | the numeric **−32602** (same layer) |
| `zero` 0 → no response within 4 s, endless zero-delta wheels | **yes** | 1/0 → +inf duration (S177:166-174), never DONE (:144-148), response only on `GESTURE_FINISHED` (input_handler.cc:295-304), incremental scale ≈ 1.0 → zero-delta updates (:109-119) | the 4 s bound (driver's), the wheel form (Blink-side) |

C1's surface sentence has four clauses; the five assigned files cover three of them
("touch pinches become two-finger touch sequences", "scaleFactor 1 is a no-op",
"scaleFactor 0 never finishes") but **not** the first clause's page-visible half
("mouse/default pinches become trusted ctrl+wheel events that change the
visual-viewport page scale"). The lane's own note already flags this boundary
(corpus note item 1: "inference from the delivery path, not measured"), and S177/S178
rows scope themselves "not renderer-side wheel conversion" / "not page zoom policy" —
so the corpus is honest; the C1 `surface` string is the place that over-reaches
relative to the cited sources.

## 4. Corpus row check (`corpus/SOURCES.md`) and the scope gap

`grep` of the five file names over `corpus/SOURCES.md` (252 lines) — every document
has a row, and I re-opened each against my own decode:

| doc | rows | re-opened: does the row's cited range match my decode? |
|---|---|---|
| synthetic_pinch_gesture.cc | S176 (line 190, added in `64e389f2`) | cites "decoded lines 26-41" — my 26-41 is exactly the `if (!lazy_gesture_)` block incl. :29-30 default query, :34-40 branch, :41 `DidQueue` ✓ |
| synthetic_touchpad_pinch_gesture.cc | S177 (191) | cites :29, :86-131, :158-175 — my :29 is the `DCHECK_GT`, :86-131 the early-finish/begin/update/end block, :158-175 CalculateEndTime ✓ |
| synthetic_touchscreen_pinch_gesture.cc | S178 (192) | cites :88-106, :114-143, :145-173 — my :88-106 the early-finish + press/move/release block, :114-143 the three pointer methods, :145-173 `SetupCoordinatesAndStopTime` ✓ |
| input_handler.cc | S162 (176), S174 (188) | S162 cites 92-110 (GetEventModifiers) — present; S174 cites :71-79, :2167-2170, :2190-2191, :2239-2249 (scroll) — all present and as described ✓ |
| Input.pdl | S168 (182), S173 (187) | S168 (mouseWheel delta units), S173 cites :286-315 (scroll command) — present ✓ |

**Gap 1 — the claim's `sourced` string over-attributes the CDP-facing half.**
`claims.json` C1 `sourced` says "plus S173 Input.pdl:272-284 and S174
input_handler.cc:2093-2136, 295-305 (re-opened this round, digests unchanged)". The
**line ranges are right** (I verified all three ranges in my own decode) and the
**digests are unchanged** (`5bbc6e23…`, `72cf0d1d…`). But the *registered scope* of
those rows is scroll-only:

* S173 scope: "experimental synthesizeScrollGesture parameters at this tag only;
  documentation-held, runtime unmeasured", cited "decoded lines 286–315".
* S174 scope: "browser-side handling of Input.synthesizeScrollGesture at this tag:
  default source type, parameter defaults, the repeat loop and when the CDP response
  is sent", cited "decoded lines 71-79, 2167-2170, 2190-2191, 2239-2249".

So the corpus has **no row whose scope covers the pinch half of either file**; both
rows' `used-by` columns do list `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md`,
and the round-71 knowledge note's header line cites "S174 (input_handler.cc lines
2093-2136 and 295-305 …); S173 (Input.pdl lines 272-284 …)" — a scope-plus-explicit-line
re-use rather than a scope-consistent citation. Nothing here falsifies the bytes; it
is an attribution/registry gap that a future round should close with a pinch-scoped
row for `input_handler.cc` and one for `Input.pdl`. I am not proposing an amendment
to the frozen claim; this is a coverage observation for L1.

**Gap 2 — the "default = mouse on this host" assertion rests on an unstaged file.**
S176's *why* column says "an omitted pinch source is whatever the platform target
reports, and on this Linux host that is the mouse/touchpad path, unlike taps". The
five staged files only show that the target is *asked* (S176:29-30); the **answer** on
Linux comes from `content/browser/renderer_host/input/synthetic_gesture_target_aura.cc:310-313`
> "SyntheticGestureTargetAura::GetDefaultSyntheticGestureSourceType returns kMouseInput"

which is **not** in `.ufo/waves/round-71/sources/` and has **no** `SOURCES.md` row
(`grep -i "synthetic_gesture_target\|GetDefaultSyntheticGestureSourceType\|aura"` over
SOURCES.md returns only the S176 row's incidental mention). I fetched it independently
this session (sha256 `6adcbbcbddcf981621654184a44d3eb885e21594ce8b7bd17b33d6d7634e59c6`,
363 lines) and staged the copy under `sources/`. Same for the enum aliasing that makes
S177/S178 readable (`input_injector.mojom:14-21`, `kTouchpadInput = kMouseInput`) —
also unstaged and unsourced. The tap contrast the note asserts (S175:22-26) does
reproduce: my independent `synthetic_tap_gesture.cc` decode shows
`if (params().gesture_source_type == kDefaultInput) params().gesture_source_type = kTouchInput;`
— the opposite of pinch's platform query.

## 5. What I did not establish

* I did not run Chromium, the driver, the counter, the battery or the kill-power
  control; every runtime number quoted here comes from the committed scored receipt
  `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json` (nonce
  `tabi-r71-scored-189a293f`) or the corpus note, and is marked as such.
* I did not open the Blink/browser files that actually turn a pinch gesture into
  ctrl+wheel and into page scale, nor the zoom-policy file that floors the page
  scale at 1 (several candidate paths under
  `content/browser/renderer_host/input/` and `content/browser/devtools/protocol/`
  returned 404 at this tag — e.g. `gesture_event_provider.cc`, `response.h`,
  `protocol.h` — so the exact file names behind the ctrl+wheel conversion remain
  unverified by me).
* I did not locate the DevTools protocol `Response::InvalidParams` definition at
  this tag, so I assert the *message* strings from `input_handler.cc` and the −32602
  code from the runtime receipts only, never from source.
* I did not evaluate the C2 leg of this round (out of this seat's scope).
* Debug-vs-release: my statements that the two `DCHECK`s at S177:29 and S177:173 do
  not fire are source-level statements about `DCHECK` semantics; I did not inspect
  `/usr/bin/chromium`'s build flags. The receipt's non-crashing `zero` leg is
  consistent with a release build but is not proof of it.

## 6. Files this seat wrote (nothing else)

```
.ufo/waves/round-71/w1/R71Scout/report.md          (this file)
.ufo/waves/round-71/w1/R71Scout/receipts/fetch-ledger.json
.ufo/waves/round-71/w1/R71Scout/receipts/source-quotes.md
.ufo/waves/round-71/w1/R71Scout/sources/…           (16 files: 5 assigned decoded + their 5 base64 transports
                                                     + 4 auxiliary decoded + their 3 base64 transports)
```
Scratch `/fast/scratch/hyaku/tabi-r71/R71Scout/` was deleted after the copies were made.
No git/jj mutation anywhere; `git status` shows only the lane's own pre-existing
modification to `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md`
(working-tree edit by another seat, untouched by me).
