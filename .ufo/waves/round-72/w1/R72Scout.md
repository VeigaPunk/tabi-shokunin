FINDINGS

# R72Scout — independent re-open of S179 and of the S176-S178 / S173-S174 rows

Seat: R72Scout (scout), wave w1, round 72 attempt 2. Lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Nothing outside
`.ufo/waves/round-72/w1/R72Scout/` was written; the lane's `corpus/SOURCES.md`, `scripts/` and
`corpus/` were read only. Scratch `/fast/scratch/hyaku/tabi-r72/R72Scout/` was removed before
this report was finalised.

## 0. Answers in one line each

| question | answer | evidence |
|---|---|---|
| S179 fetched independently — digest, size, line count? | **confirmed**, byte-identical to the L1's staged copy | `receipt-s179-fetch.txt`: HTTP 200, 12188 B transport, 239 lines, sha256 `4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73`; `cmp` exit 0 |
| Does S179 ground the r72 counter's wheel-delta-law? | **the law's shape yes, its page-scale factor no** | `receipt-law-grounding.txt`; §2 |
| Where is the content/ path version of the file at this tag? | **nowhere — it moved twice; at tag 155.0.8059.84 only `components/input/` has it** | `receipt-path-move.txt`; §3 |
| S176-S178 digests re-opened? | **all three match the round-71 staged copies byte-for-byte** | `receipt-s176-178-reopen.txt`; §4 |
| R3 (S173/S174 scope vs pinch lines) — proposal? | **four new rows, not a scope edit; the same gap also exists for the tap command** | `proposal-R3-scope-fix.md`, `proposal-R3-scope-fix-tap.md`, `receipt-r3-proposal.txt`; §5, §6 |

## 1. S179 — independent fetch (CONFIRMED)

Fetched this session, this seat, without reading the L1's staged bytes first:

```
$ curl -sS -o s179b.b64 -w 'http_code=%{http_code} size=%{size_download} time_total=%{time_total}' \
    'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/components/input/touchpad_pinch_event_queue.cc?format=TEXT'
http_code=200  size=12188  time_total=1.125660
fetch_start=2026-11-06T23:47:38Z   fetch_end=2026-11-06T23:47:39Z
$ base64 -d s179b.b64 > s179b.cc ; sha256sum s179b.cc ; wc -l s179b.cc
4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73  s179b.cc
239 s179b.cc
$ sha256sum .../.ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc
4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73   (L1 staged copy)
$ cmp s179b.cc <L1 staged copy>          → exit 0, byte-identical
```

Transport digest of the base64 body: `1d3c5e8023083222b819edd528f59cf76edb36d19a3e44a4fd413e92d44752d3`.
The L1's own record (`.ufo/waves/round-72/sources/FETCH.txt`) says "fetched
2026-11-06T20:27:07-03:00 … HTTP 200; decoded sha256 4930d517… lines 239" — same digest, same
line count, ~2h20m earlier than this re-fetch. Full transcript: `receipt-s179-fetch.txt`.

### Quotes from the live file (each ≤ 25 words, with line numbers)

`components/input/touchpad_pinch_event_queue.cc`, tag 155.0.8059.84, 239 lines:

- **scale → deltaY formula, line 44**: `delta_y = 100.0f * log(pinch_event.data.pinch_update.scale);`
- **sign-inversion note, lines 39–40**: `Note that 'wheel' event deltaY values have their sign inverted.` / `convert a wheel deltaY back to a scale use Math.exp(-deltaY/100).`
- **accumulation property, line 34**: `- deltas should accumulate via addition: f(s1*s2)==f(s1)+f(s2)`
- **ctrl modifier on the synthetic wheel, line 54**: `pinch_event.GetModifiers() | blink::WebInputEvent::kControlKey,`
  (with the intent at lines 48–51: `similar to ctrl+wheel zooming, allow content to` / `prevent the browser from zooming by sending fake wheel events with the ctrl` / `modifier set when we see trackpad pinch gestures.`)
- **wheel ticks, line 45**: `wheel_ticks_y = pinch_event.data.pinch_update.scale > 1 ? 1 : -1;`
- **units, line 58**: `wheel_event.delta_units = ui::ScrollGranularity::kScrollByPrecisePixel;` and **line 59** `wheel_event.delta_x = 0;`

## 2. Which part of the r72 counter's wheel-delta-law S179 grounds, and which it does not

The counter's law (`scripts/check-synthpinch-r72.mjs:207-211`):

```
// Each ctrl-wheel carries deltaY = -100 ln(step) / pageScale, so sum(deltaY * scale) = -100 ln(factor).
const lawSum = (n) => … reduce((a, e) => a + (num(e.deltaY) && num(e.scale) ? e.deltaY * e.scale : NaN), 0);
const lawOk  = (n) => near(lawSum(n), -100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5);
```

**Grounded by S179** (browser side, one pinch update → one ctrl+wheel):

- the **−100 ln(update scale)** shape of a single wheel's deltaY: line 44 plus the inversion note at
  lines 39–40;
- the **additivity** that lets a page sum the wheels of one gesture and recover the gesture's
  factor: line 34 (`f(s1*s2)==f(s1)+f(s2)`);
- that the wheel is **ctrl-modified** (line 54) and in **precise-pixel** units (line 58).

**Not grounded by S179 — the page-scale factor.** S179 is a browser-side queue
(`components/input/`, `input::TouchpadPinchEventQueue`); it computes `delta_y` from
`pinch_event.data.pinch_update.scale` and hands the wheel to the renderer. Every occurrence of
"scale" in the 239-line file is either the pinch update's own scale (lines 43, 44, 45, 126) or the
comment at lines 31/40 — the file contains **no page-scale, visual-viewport or zoom term at all**
(`grep -n 'scale\|Scale' s179.upstream.cc` → lines 31, 40, 43, 44, 45, 126 only). So the
`× scale` factor the counter multiplies each delivered `deltaY` by, and the identity of that
factor with the page's visual-viewport scale, is **not** in S179; it is a renderer-side fact the
round-72 note correctly marks as inference (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md:46`).

Measured on the scored receipt (`corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json`),
which is exactly what separates the two readings:

| leg | scaleFactor | wheels | Σ deltaY | Σ deltaY·scale | −100 ln(sf) | \|Δ\| weighted | \|Δ\| raw |
|---|---|---|---|---|---|---|---|
| in | 2 | 17 | −48.99226 | −69.31471 | −69.31472 | 7.4e-06 | **20.32** |
| out | 0.5 | 17 | 51.31607 | 69.31471 | 69.31472 | 9.9e-06 | **18.00** |
| clamp | 0.5 (page scale pinned at 1) | 16 | 69.31472 | 69.31472 | 69.31472 | 1.1e-06 | 0.00 |
| default | 1.5 | 9 | −32.57153 | −40.54652 | −40.54651 | 4.3e-06 | **7.98** |

Two further measurements, same receipt:

- **The weighted product closes exactly on the requested factor.** Π over the leg's wheels of
  `exp(-deltaY_i · scale_i / 100)` = 2.000000 (in), 0.500000 (out), 1.500000 (default),
  0.500000 (clamp) — the requested `scaleFactor` to six decimals.
- **The page scale, not the previous page scale, is the right multiplier.** Testing
  `deltaY_i · scale_i ?= −100 ln(scale_i / scale_{i-1})` per consecutive pair within ±0.01:
  in 11/16, out 15/16, default 7/8 agree with the **current** event's scale, and **0/16, 0/15, 0/7**
  agree with the **previous** event's scale. The residual misses are exactly the pairs where two
  wheels record the same handler-time scale (2 in `in`, 1 in `out`, 1 in `default`), i.e. the
  handler-time reading lags the zoom, as the round-72 note says (`:47`).

The independent cold run (`.ufo/waves/round-72/w1/R72Exec1/receipt.json`) reproduces the same
picture, so this is not a property of one receipt: Σ deltaY·scale = −69.31469 (in),
+69.31473 (out), +69.31473 (clamp), −40.54652 (default) against targets −69.31472 / +69.31472 /
+69.31472 / −40.54651, while the raw sums are off by 20.40 / 18.23 / 0.00 / 7.88.

**Consequence for the corpus row.** S179's current `teaches` cell
(`corpus/SOURCES.md:193`, field 8) says: "each pinch update becomes one ctrl+wheel whose deltaY is
-100 ln(update scale), so a page can sum wheel deltas to recover the gesture's scale factor; it does
not say how page scale enters the delivered deltaY". That is accurate as far as it goes, but the
"so a page can sum wheel deltas to recover the gesture's scale factor" clause holds **only when the
page scale stays at 1** (the clamp leg). On the three zooming legs the raw sum is off by 8 to 20
absolute. The clause is defensible only if read as "a page that also knows its own page scale can
sum `deltaY·scale`". This is the same distinction the round-72 lesson already draws
(`corpus/lessons/round-72.md`, Rejected: "**Σ deltaY over a pinch equals −100 ln(scaleFactor)** (the
naive reading of S179 alone)"), so the row is not wrong, but its `teaches` wording invites the
naive reading. Suggest the L1 tighten that clause next round (the claim is frozen; the registry
cell is not part of the claim, but it is in the lane's production corpus and therefore the L1's
call, not this seat's).

Full transcript: `receipt-law-grounding.txt`.

## 3. Where the content/ path version of this file lives at this tag (404 explained)

The L1's lesson (`corpus/lessons/round-72.md`, "Rejected source path") records that
`content/browser/renderer_host/input/touchpad_pinch_event_queue.cc` answered HTTP 404 "the file
moved to `components/input/`". That is right but incomplete: the file moved **twice**, and at tag
155.0.8059.84 there is **no `content/` path version at all**. Probing
`?format=TEXT` at each tag (`receipt-path-move.txt`):

| tag | `content/browser/renderer_host/input/` | `content/common/input/` | `components/input/` |
|---|---|---|---|
| 120.0.6099.109 | **200** | 404 | 404 |
| 121.0.6167.85 | **200** | 404 | 404 |
| 122.0.6261.15 | 404 | **200** | 404 |
| 124.0.6367.60 – 126.0.6478.36 | 404 | **200** | 404 |
| 127.0.6533.72 – 155.0.8059.84 | 404 | 404 | **200** |

At tag 155.0.8059.84 the `components/input/` directory listing contains exactly three
touchpad-pinch entries — `touchpad_pinch_event_queue.cc`, `touchpad_pinch_event_queue.h`,
`touchpad_pinch_event_queue_unittest.cc` — and the other candidate paths
(`content/renderer/input/…`, `content/browser/renderer_host/…`, `chrome/browser/ui/views/…`) all
answer 404; the directory listings of `content/renderer/input` and `chrome/browser/ui/views`
contain no pinch/touchpad file at all.

So the correct statement for the next round's lesson is: *the file lived under
`content/browser/renderer_host/input/` until M121, under `content/common/input/` for M122–M126, and
under `components/input/` from M127 onwards; at tag 155.0.8059.84 the only copy is the
`components/input/` one.* The current S179 row's URL is therefore the right one and the rejected
path is right to reject — the only imprecision is that the file did not move once, it moved twice.

## 4. S176-S178 re-opened; digests match (CONFIRMED)

Re-fetched upstream this session and compared against the round-71 staged copies
(`receipt-s176-178-reopen.txt`):

| row | upstream sha256 (this session) | staged sha256 (round-71) | cmp |
|---|---|---|---|
| S176 `synthetic_pinch_gesture.cc` | `4f7fd1017b17d007bdf13b55f75bc7d169a394549278bbda99a60a319bcd33e8` (54 lines) | identical | exit 0 |
| S177 `synthetic_touchpad_pinch_gesture.cc` | `67ab6a4b9baf3a6fd7ad24733d615dc8b4c3fba6c86bf60dd00162333a4df9d2` (187 lines) | identical | exit 0 |
| S178 `synthetic_touchscreen_pinch_gesture.cc` | `3b5253cebad6376dd952c0dfbdb744d0c2a82b350a1970ddd07bd18ff717e3c0` (199 lines) | identical | exit 0 |

Also re-fetched S174's document (`content/browser/devtools/protocol/input_handler.cc`, tag
155.0.8059.84): `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`, 2343 lines,
byte-identical to the round-71 staged copy **and** to a second transport (GitHub raw mirror at the
same tag) — `cmp` exit 0 on both. And `Input.pdl` (S173's document):
`5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`, 336 lines, equal to the
digest recorded in the S173 row. So the r71 spot-check's digests still hold.

## 5. R3 — the scope defect, and the proposal

R3 as routed (`corpus/lessons/round-71-verifier-spotcheck.md:141`): "S173/S174 are scoped to the
scroll command yet cited for pinch lines (R71Scout): revise the row scope or add rows."

Confirmed, with the exact lines. `input_handler.cc` (tag 155.0.8059.84, sha256 `72cf0d1d…324f4`):

| line | quote (<= 25 words) |
|---|---|
| 2093 | `void InputHandler::SynthesizePinchGesture(` |
| 2106 | `const int kDefaultRelativeSpeed = 800;` |
| 2109 | `gesture_params.scale_factor = scale_factor;` |
| 2112 | `callback->sendFailure(Response::InvalidParams("Position out of bounds"));` (guard at 2111) |
| 2116-2117 | `gesture_params.relative_pointer_speed_in_pixels_s =` / `relative_speed.value_or(kDefaultRelativeSpeed);` |
| 2122-2123 | `callback->sendFailure(Response::InvalidParams("Unknown gestureSourceType"));` (check at 2119) |
| 2133-2134 | `root_view->host()->QueueSyntheticGesture(` / `std::make_unique<SyntheticPinchGesture>(gesture_params),` |
| 295-299 | `void SendSynthesizePinchGestureResponse(` … `if (result == SyntheticGesture::Result::GESTURE_FINISHED) {` / `callback->sendSuccess();` |

`Input.pdl` (sha256 `5bbc6e23…c66e3d`): 272 `experimental command synthesizePinchGesture`,
279 `number scaleFactor`, 281 `optional integer relativeSpeed`,
284 `optional GestureSourceType gestureSourceType`.

The scope cells that miss these: `corpus/SOURCES.md:187` (S173) and `:188` (S174) name the
scroll command only, while the pinch notes cite them for exactly the lines above
(`chromium-synth-pinch-gesture-runtime-round-71.md:1,44,47,60,68,102` and
`…-round-72.md:1`).

**Proposal** (full text in `proposal-R3-scope-fix.md`, measured in `receipt-r3-proposal.txt`):

- **Two new rows, S180 and S181**, one per document, each covering the pinch command of that
  document, each with `teaches` opening `supersedes S174 —` / `supersedes S173 —` (the prefix is
  load-bearing: `check-sources.mjs:296` skips the duplicate-URL finding only for a `teaches` cell
  that opens `supersedes S0NN `, and the lane's own S096 → S100 → S115 chain uses the same
  convention).
- **Re-point the pinch citations** in the two pinch knowledge notes to S180/S181 (the registry
  gate's `used_by_uncited` finding requires each used-by file to contain the row id it claims).
- **Trim S173's and S174's used-by cells** (allowed in place by `CORPUS.md:117`) so they no longer
  list the pinch notes.

Measured on a scratch mirror of the registry:

- lane gate `node scripts/check-sources.mjs --root <mirror> --file corpus/SOURCES.md --since 2026-06-08`
  → **3 findings, the same three pre-existing E04 `duplicate_url` (S171, S172, S173) the untouched
  baseline also reports**; no new finding of any kind, exit 1 unchanged.
- fleet census `./scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin --today 2026-11-06 <mirror>`
  → **exit 0, `ok`**, with exactly two new W04 cross-scope warnings (S180/S181 share their URL
  with S174/S173 under a different scope — the contract's W04 case, "warnings do not affect clean
  lanes").

The alternative (widen the scope/anchor cells of S173/S174 in place) was measured too and is
**rejected on contract grounds**: `CORPUS.md:117` rule 2 allows only `status`, `recheck` and
`used-by` to change in place, and the scope cell is the claim's boundary. Its exact wording is
recorded in `proposal-R3-scope-fix.md` for the L1's reference.

**The same defect exists for the tap command and is not covered by the pinch pair.**
`corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` cites S174 for
`SynthesizeTapGesture` lines 2252-2304 (incl. `Position out of bounds` at 2271 and
`Unknown gestureSourceType` at 2281) and S173 for `Input.pdl` lines 318-330, while both rows'
scope cells name the scroll command. Two further rows (S182/S183) with the same shape are
proposed in `proposal-R3-scope-fix-tap.md`. **R3 is not fully closable with the pinch pair alone.**

## 6. A pre-existing red lane gate the L1 should know about (not caused by any proposal)

The lane's own registered sources gate, `scripts/check-sources.mjs`, **already exits 1 on the
untouched registry** — three `duplicate_url` (E04) findings on S171, S172 and S173, with no
proposal of mine involved (measured on a verbatim mirror of the committed
`corpus/SOURCES.md`, `receipt-r3-proposal.txt`, "baseline" block):

```
FINDING id=duplicate_url fleet=E04 row=S171 detail=duplicate_url
FINDING id=duplicate_url fleet=E04 row=S172 detail=duplicate_url
FINDING id=duplicate_url fleet=E04 row=S173 detail=duplicate_url
SOURCES_GATE verdict=failed rows=179 … findings=3
```

S173 duplicates S168's URL (`Input.pdl?format=TEXT`, same tag), S171 duplicates S157's and S172
duplicates S167's. The lane script's rule is URL-only (`scripts/check-sources.mjs:296` — a repeat
URL is E04 unless the new row's `teaches` opens `supersedes S0NN `), while the fleet census
(`scripts/sources-census.sh:644-648`) treats the same situation as **W04** (a warning, "do not
affect clean lanes") because the scopes differ. That divergence is why the round-72 census start
(`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`, exit 0, "ok") and
the lane's own gate (`check-sources.mjs`, exit 1) disagree on the same file. Both were measured
here; neither was changed. It is the same mechanism my R3 proposal has to satisfy, so the L1 should
decide which tool is the gate of record for the registry before applying any scope fix.

## 7. On the leg-(c) battery failure (context, not this seat's claim)

The L1's status note asks for the cause and the next generation's fix. Two observations from this
seat's measurements, offered as evidence for the L1's own account and not as a proposal to amend
the frozen claim:

- The failing case `in-wheel-anchor-2px` (`scripts/negatives-synthpinch-r72.mjs:159`) adds +2 to
  the **first** `in` wheel's `clientX`. On the scored receipt that first wheel sits at x=399, so
  the mutation lands at 401, and the counter's tolerance is `Math.abs(e.clientX - AT.x) <= 1` with
  `AT.x = 400` (`scripts/check-synthpinch-r72.mjs:204`) → |401−400| = 1 → inside tolerance → the
  honest counter accepts the mutated receipt and the battery case fails. Reproduced directly:
  mutating that wheel to 401 leaves the counter **clean (exit 0)**; mutating it to 403 or 405 makes
  the counter report `wheel-anchor` (**exit 1**). The failure is therefore the case's
  receipt-relative mutation against a value that jitters by 1 px, not a counter weakness — which
  is what the round-72 lesson's Mistakes row 1 already says.
- The `out` leg's wheels are at x 599–798, not near the anchor at all (the page scale is changing
  during the leg), so the anchor law is only meaningful on the `in`/`clamp`/`default` legs — which
  is why the counter's `wheel-anchor` check uses exactly those three legs
  (`scripts/check-synthpinch-r72.mjs:203`).

## 8. Limits of this seat's findings

- All source digests are for **tag 155.0.8059.84** as served by `chromium.googlesource.com`
  (and, for `input_handler.cc`, by `raw.githubusercontent.com` as a second transport). The tag's
  commit is 5869fe313571d75152b77813cf0a4ee26a4e6df0 per the S168/S169 rows.
- The page-scale factor that S179 does not ground was **measured on this host only** (Chromium
  155.0.8059.84 headless on Arch Linux, 1280x900 viewport, deviceScaleFactor 1) on two receipts
  (scored + R72Exec1 cold run). No renderer-side source for it was opened this session; the
  searches for it (`third_party/blink/renderer/core/input/mouse_wheel_event_manager.cc`,
  `gesture_manager.cc`, `gesture_event_queue.cc`, `zoom_controller.cc`, `page/zoom_controller.cc`
  — the last three answer 404 at this tag) did not locate the dividing code.
- The R3 proposals are proposals on **scratch mirrors**. The lane's `corpus/SOURCES.md` was not
  edited; the SOURCES edits must be made by the L1 (the sole integration owner), after the r72
  freeze (`8356a09e`, digests `7366d45c`) — the frozen claim `C1-SYNTHPINCH-R72` does not depend
  on the registry.
- Tooling: no package was installed or upgraded this session; no `pacman` transaction was run
  (the host-wide pacman guard is in force).

## 9. Files this seat wrote (all inside `.ufo/waves/round-72/w1/R72Scout/`)

- `report.md` (this file)
- `receipt-s179-fetch.txt` — S179 fetch: times, HTTP, sizes, digests, `cmp` against the L1 copy
- `receipt-s176-178-reopen.txt` — S176/S177/S178 + `input_handler.cc` re-fetch and digest compare
- `receipt-law-grounding.txt` — the counter law, the S179 quotes, the per-leg sums and the per-event tests
- `receipt-path-move.txt` — the file's path history across 13 tags
- `receipt-r3-proposal.txt` — the four R3 variants measured on scratch mirrors
- `proposal-R3-scope-fix.md` — exact wording for the S180/S181 rows and the coupled edits
- `proposal-R3-scope-fix-tap.md` — the same for the tap-command gap (S182/S183)
