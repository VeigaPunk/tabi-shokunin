DRAFT — a `## Gate` block for S180–S183, written to be pasted by the integration owner (L1 `TabiR73`) and spot-checked by someone who did not open the files. Every quote below was re-verified against the staged bytes by `rederive.py` (`rederive.json:.citations[*].stripped_equal` = true for all four); every digest was recomputed (`sha256sum … exit 0`).

# Gate draft — S180–S183 (round 73)

## Gate

### Sources — new rows

All four fetched by the L1 on **2026-11-06** between 21:23:18 and 21:23:35 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(HTTP 200, base64 decoded; decoded copies and digests in `.ufo/waves/round-73/sources/FETCH.txt`).
Token counts below are `str.split()` on the quote; the gate limit is 25.

Each row: kind `code`, tier A, status `mined`, recheck `on-release`, used-by
`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` and this lesson.

- **S180** `third_party/blink/common/input/web_mouse_wheel_event.cc` — access 2026-11-06 — 143
  lines, decoded sha256 `c00b3bf7ce4a1c98fe8831a65ab0575404b9ecd597199a5613b94cb2e19a70ad`.
  - Located quote (line 104, **4 tokens**): "return delta_y / frame_scale_;"
  - Scope: the root-frame delta divides by the event's frame scale; says nothing about where the
    frame scale comes from (S182, S183) and nothing about flattening (`:107-113`).
- **S181** `third_party/blink/renderer/core/events/wheel_event.cc` — access 2026-11-06 — 187 lines,
  decoded sha256 `5f43b8a50b309326591a50dfd0082bfb6abdff3ef28c15ebb598c14ca55f9ec1`.
  - Located quote (line 111, **3 tokens**): "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio()),"
  - Scope: the DOM `deltaY` is the negated root-frame delta over `devicePixelRatio`; not page-zoom
    policy.
- **S182** `third_party/blink/renderer/core/events/web_input_event_conversion.cc` — access
  2026-11-06 — 318 lines, decoded sha256
  `31a6868e310628d19ef056e9d4d491fe673b1e866817b4e8f88cfe9f3ca0ff3b`.
  - Located quote (line 62, **3 tokens**): "scale = root_view->InputEventsScaleFactor();"
  - Located quote (line 132, **1 token**): "result.SetFrameScale(FrameScale(frame_view));"
  - Scope: which scale is stamped on an incoming wheel (`FrameScale`, function spans **57-65**;
    default 1) and where it is stamped (`TransformWebMouseWheelEvent`, function spans **128-135**);
    not how the factor is computed (S183).
- **S183** `third_party/blink/renderer/core/frame/local_frame_view.cc` — access 2026-11-06 —
  5,822 lines, decoded sha256
  `146aa4c1f6224462e73b5ccebbb29927481f68cf74ceabdff98fb42f3ce74809`.
  - Located quote (line 1995, **4 tokens**): "float page_scale = frame_->GetPage()->GetVisualViewport().Scale();"
  - Second located quote (lines 1996-1997, **4 tokens**, whitespace-normalised across the line
    break): "return page_scale * frame_->GetPage()->GetChromeClient().InputEventsScaleForEmulation();"
  - Scope: `InputEventsScaleFactor` is the visual-viewport page scale times the emulation input
    scale; only lines 1994-1998 are mined from this file.

Rehash (the gate checks the committed bytes, never the live URL):

```
sha256sum .ufo/waves/round-73/sources/*.cc     # exit 0, four digests equal to the four above
```

### Admitted

- **The note's §Sourced chain, at tag 155.0.8059.84.** A wheel is stamped with
  `FrameScale = InputEventsScaleFactor = visualViewport.Scale() × InputEventsScaleForEmulation()`
  (S182:62,132 → S183:1995-1997), its root-frame delta is `delta_y / frame_scale_` (S180:104), and
  the DOM event is `−DeltaYInRootFrame() / devicePixelRatio` (S181:111). At `devicePixelRatio` 1 and
  emulation factor 1 the page therefore reads `deltaY = −delta_y ÷ pageScale`. The emulation factor
  stays **inference**, not sourced (see the reject below).

  Spot-check by a non-author (no browser run, exit 0 expected):

  ```
  sha256sum .ufo/waves/round-73/sources/*.cc
  node -e 'const r=require("./corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json");for(const l of ["in","out","clamp","default"]){const w=r.events.filter(e=>e.leg===l&&e.type==="wheel");const L=r.legs.find(x=>x.name===l);console.log(l,w.length,w.reduce((a,e)=>a+e.deltaY*e.scale,0).toFixed(6),(-100*Math.log(r.plan.find(p=>p.name===l).params.scaleFactor)).toFixed(6),L.scaleBefore.page+"->"+L.scaleAfter.page)}'
  ```

  Observed (this seat, 2026-11-06, exit 0):
  `in 17 -69.314761 -69.314718 1->2.0000007152557373` ·
  `out 17 69.314723 69.314718 2.0000007152557373->1` ·
  `clamp 16 69.314715 69.314718 1->1` · `default 9 -40.546479 -40.546511 1->1.4999995231628418`
  (the last column prints the receipt's float32 page scale verbatim).
  Withdraw if any of the four legs deviates from `−100 ln(scaleFactor)` by more than 0.5, or if a
  later tag removes the division at S180:104.

### Rejected (with flip condition)

- **"`Σ deltaY × pageScale = −100 ln(scaleFactor)` measures the achieved page-scale change."**
  Reject: the clamp leg of the committed (a) receipt has `scaleBefore.page = scaleAfter.page = 1`
  and still emits `Σ deltaY × scale = +69.314715 = −100 ln 0.5`; measured against the achieved
  ratio the same leg deviates by the full 69.3147. The identity holds against the **commanded**
  `scaleFactor` (the CDP parameter S179 turns into per-update deltas), and only coincides with the
  achieved ratio on legs that are not clamped. The zoom itself is checked by `leg-*-scale`,
  `scale-agreement` and `event-scale` (`scripts/check-synthpinch-r73.mjs:224,233,234,238`), not by
  `wheel-delta-law`.
  Spot-check: the one-liner above prints `clamp 16 69.314715 69.314718 1->1`.
  Flip: a receipt in which the clamp leg's scale-weighted sum is within 0.5 of 0 (i.e. the browser
  stops emitting deltas when the visual viewport cannot move).

## Two gate defects for the integration owner (not decisions)

1. **Line span in the note and in the S182 row.** `corpus/SOURCES.md:196` anchors "decoded lines
   56-65"; the function `FrameScale` spans **57-65** (line 56 is `namespace {`). The r73 note's
   `S182 …:127-134` likewise covers a blank line 127 and stops one line before the closing brace
   (function spans 128-135). The quoted lines themselves are correct (`:62`, `:132`), so the pointer
   resolves; only the span is imprecise.
2. **QUALITY 67's encoded-transfer half is not recorded for these four rows.** Criterion 67
   requires a receipt carrying `bytes_path`, `decoded_sha256` **and** the transfer's
   `encoded_sha256`. The decoded half is satisfied (four `.cc` files committed, digests in
   `FETCH.txt` and in the four rows, anchor checked against those bytes). The encoded half is not:
   `find .ufo/waves/round-73 -name '*.b64' | wc -l` → `0`, `grep -c encoded_sha256
   .ufo/waves/round-73/sources/FETCH.txt corpus/SOURCES.md` → `0 0`, whereas round 72 kept
   `touchpad_pinch_event_queue.cc.b64` beside its decoded copy. This does not touch the note's
   claims (the decoded bytes carry them); it does mean the transfer's provenance digest cannot be
   recorded for S180–S183 unless the `.b64` files are still recoverable and committed.
