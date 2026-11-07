AGREE, with one clarification, one epistemic-label correction and three citation-precision nits; zero numeric mismatches.

# Review of `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md`

Seat `R73Scribe`, round 73 w1. Target note is tracked at `ae2628af` (`git log --oneline -1 -- corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` → `ae2628af round-73: pre-freeze r73 pinch instruments …`). Everything below is derived from committed bytes only: the nine PRE smoke receipts, the (a) scored receipt, and the four staged `.cc` files. No Chromium was launched for this review, so nothing here is a re-execution claim.

## 1. Method (the command that produces every number in this file)

```
python3 .ufo/waves/round-73/w1/R73Scribe/rederive.py --json rederive.json    # exit 0
```

It reads `controls/c1/smoke1..9.receipt.json` and
`corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json`, groups `events` by
`type=='wheel'` and `leg`, and prints, per leg: wheel count, raw `Σ deltaY`,
`Σ deltaY × scale`, `−100 ln(scaleFactor)` with `scaleFactor` taken from the receipt's own
`plan[].params.scaleFactor`, the deviation, the leg's `scaleBefore/scaleAfter.page`, and two
alternative divisor hypotheses (`previous event's scale`, `leg-end scale`). Raw output:
`rederive.out.txt`; machine copy: `rederive.json` (40 leg rows + summary + citation check).
Citation check re-hashes each staged source and compares each quoted fragment to the exact
source line (`rederive.json:.citations`).

## 2. Statement-by-statement

| # | note statement (location) | verdict | evidence |
|---|---|---|---|
| 1 | Header: S180–S183 opened 2026-11-06, round 73 | agree | `FETCH.txt:1` (fetched 21:23:18–21:23:35 -03:00); `ls .ufo/waves/round-73/sources/` |
| 2 | `verified-at`: Chromium 155.0.8059.84, `--headless=new`, 1280x900, dSF 1, mobile false | agree | receipt `host.chromium` = `Chromium 155.0.8059.84 Arch Linux`; `fixture.viewport` `{1280,900}`; driver `:228,:233,:296` |
| 3 | `recheck`: driver flags `--scratch/--out/--nonce/--http-port/--cdp-port`, counter `--expect-driver-sha256/--expect-nonce/--prior` | agree (flags exist) | driver `:74-88` parses exactly those; nonce regex `:83` `^tabi-r73-[a-z0-9-]+$` accepts `tabi-r73-recheck-<hex>`. **Not executed** — see §6 |
| 4 | "Round 72 … marked that division inference" | agree | `chromium-synth-pinch-gesture-runtime-round-72.md:45` "**Inference, not sourced:** Blink delivers the …" |
| 5 | "the Blink path … divides by the page scale, and nothing else at deviceScaleFactor 1 and no emulation scale" | agree | §3 chain; and the measurement is inconsistent with a *second* division: an extra `1/s` factor would scale the `in` sum by ≈ mean(1/s) = 0.682 (`rederive` over the (a) receipt), i.e. ≈ −47.3 instead of the measured −69.3147 |
| 6 | S182 `:127-134` stamps `SetFrameScale(FrameScale(frame_view))`; `FrameScale` "lines 56-65", default 1 | agree on content, **range off by one at both ends** | `web_input_event_conversion.cc:132` `result.SetFrameScale(FrameScale(frame_view));`; function spans **128-135** (127 is blank, 135 is `}`); `FrameScale` spans **57-65** (56 is `namespace {`) |
| 7 | S183 `:1994-1998`, factor = page scale × emulation input scale | agree, span exact | `local_frame_view.cc:1994-1998`; quote verified at `:1995` |
| 8 | S180 `:103-105`, "return delta_y / frame_scale_;" | agree, span exact | `web_mouse_wheel_event.cc:103-105`; quote at `:104` |
| 9 | S181 `:110-111`, "delta_y_(-event.DeltaYInRootFrame() / window.devicePixelRatio())" | agree, span exact | `wheel_event.cc:111` (fragment verbatim; the source line carries a trailing comma) |
| 10 | Composition: `deltaY = −delta_y ÷ (pageScale × emu) ÷ dpr`; `deltaY × pageScale = −100 ln(update scale)`; sum = `−100 ln(scaleFactor)` | agree algebraically; **one clarification** | §3 |
| 11 | "Still inference: `InputEventsScaleForEmulation()` is 1"; driver sets `Emulation.setDeviceMetricsOverride` without `scale`; law holds to 4×10⁻⁵ | agree, and stronger than stated | driver `:296` has `width/height/deviceScaleFactor/mobile` and **no** `scale`; residual analysis in §4 |
| 12 | Table row `in`: factor 2, 16–17 wheels, −69.3147, raw −49.960 … −48.888 | agree, exact at printed precision | `rederive.out.txt`: n 16..17; weighted −69.3147614..−69.3146760 (all nine print `-69.3147`); raw −49.960071..−48.888261 |
| 13 | Table row `out`: 0.5, 16–17, +69.3147, +50.739 … +51.376 | agree | weighted 69.3147071..69.3147260; raw 50.738701..51.375694 → 50.739/51.376 |
| 14 | Table row `clamp`: 0.5 at scale 1, 16–17, +69.3147, "+69.315 (page scale stays 1)" | agree on numbers; **clarification below** | weighted 69.3147122..69.3147379; raw 69.314712..69.314738; `scaleBefore=after=1` on all ten receipts |
| 15 | Table row `default`: 1.5, 8–9, −40.5465, −32.814 … −32.569 | agree | n 8..9; weighted −40.5465219..−40.5464789; raw −32.814266..−32.568925 |
| 16 | "Largest deviation … over 36 leg sums: 4.2×10⁻⁵" | agree | max \|dev\| over the 36 smoke leg sums = **4.207024e-05** (`smoke7/in`). Including the (a) receipt (40 sums) it is 4.332306e-05 (`A/in`) — the note predates (a), so 4.2e-5 stands for its population |
| 17 | "The raw sums vary run to run …; the scale-weighted sums do not" | agree in substance; the spread should be stated | weighted spread: `in` 8.54e-5 (1.2e-6 relative), `out` 1.89e-5, `clamp` 2.58e-5, `default` 4.30e-5 — against raw spreads of 1.072 / 0.637 / 2.6e-5 / 0.245. "Do not vary" is true at 1e-6 relative, not exactly; one clause would close it |
| 18 | First `in` wheel clientX 400×6 / 399×3; first `default` 400×7 / 399×2 | agree, exact | `rederive.json:.summary.first_wheel_clientX_counts_9_smokes` |
| 19 | A fixed-shift anchor case crosses ±1 only on some runs (r72 lesson, Mistakes row 1) | agree | r72 lesson Mistakes row 1 (`corpus/lessons/round-72.md:82`); counter tolerance `check-synthpinch-r73.mjs:240` `Math.abs(e.clientX - AT.x) <= 1`; honest r73 x ∈ {399,400} only, so +2 → {401 (accepted), 402 (refused)} — 6 of 9 runs |
| 20 | r73 battery sets it absolutely (`in-wheel-anchor-abs-402`, `-398`) | agree | `scripts/negatives-synthpinch-r73.mjs:169-170` assign absolute values; `:251` the must-accept twin `accept-in-anchor-abs-401` |
| 21 | Limits: one host; "sourced only at this tag"; "the emulation factor is measured as 1, not sourced"; capability admission is the claim's business | agree except one word | §5 |

## 2b. The (a) receipt — outside the note's population, same law

`corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json` (nonce
`tabi-r73-l1-3409ab53b905`, sha256 `a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8`):

| leg | n | raw Σ deltaY | Σ deltaY × scale | −100 ln(scaleFactor) | dev | page scale |
|---|---|---|---|---|---|---|
| in | 17 | −48.917832 | −69.3147613791 | −69.3147180560 | −4.332e-05 | 1 → 2.0000007 |
| out | 17 | 51.241269 | 69.3147227226 | 69.3147180560 | +4.667e-06 | 2.0000007 → 1 |
| clamp | 16 | 69.314715 | 69.3147145510 | 69.3147180560 | −3.505e-06 | 1 → 1 |
| default | 9 | −32.573607 | −40.5464788954 | −40.5465108108 | +3.192e-05 | 1 → 1.4999995 |

Same conclusion, marginally wider worst case (4.33e-05 vs the note's 4.21e-05 over its 36 sums);
first `in` wheel clientX 399, first `default` 399 — both inside the note's observed {399,400}.

## 3. The clarification: the law is against the **commanded** factor, not the achieved zoom

The note's prose is in mild tension with its own clamp row. The
clamp leg changes the page scale **not at all** (`scaleBefore.page = 1`, `scaleAfter.page = 1`, all
ten receipts) yet emits `Σ deltaY × scale = +69.3147 = −100 ln 0.5`. Measured against the achieved
ratio, the same leg deviates by the **full 69.3147** — i.e. the identity holds only when
`scaleFactor` means the CDP command parameter (what S179 turned into per-update deltas), never the
visual-viewport change.

That is exactly what the sourced chain predicts, so the note is not wrong; it is under-labelled.
The two sentences to adjust are:

- "because logs add, the sum over a gesture is `−100 ln(scaleFactor)`" → "…is `−100 ln` of the
  **commanded** `scaleFactor`, whether or not the visual viewport applies it".
- "the page scale is divided out per event and multiplied back per event" → true for `in/out/default`;
  for `clamp` the divisor is the constant 1 and the multiplication is the identity, so the sentence
  does not describe that row.

Why it matters beyond pedantry: `wheel-delta-law` in the counter
(`check-synthpinch-r73.mjs:246`) uses `FROZEN.params.scaleFactor`, and `leg-*-scale` /
`scale-agreement` (`:224,:234`) are what actually check the zoom. A capability row that read the
delta law as proof of zoom would be wrong on the clamp leg, and the note is the place that should
say so.

Supporting discriminating test (in `rederive.json:.rows`), over the (a) receipt's `in` leg:

| hypothesis for the per-event divisor | Σ deltaY × divisor | rel. deviation from −69.314718 |
|---|---|---|
| the event's own recorded `visualViewport.scale` (note's claim) | −69.314761 | −6.2e-07 |
| the previous event's scale | −66.454515 | +4.13% |
| the leg-end scale | −97.835699 | −41.1% |
| 1 (no division) | −48.917832 | +29.4% |

Only the per-event recorded scale survives; the run-to-run scatter of the raw sums (2.17% of the mean for `in`)
collapses by four orders of magnitude in the weighted column, which no fixed divisor reproduces.
This also bounds "the page's own `visualViewport.scale` reading equals the divisor Blink stamped",
per gesture, to ≈1e-6 — the note asserts the identity but does not say the page-side reading and
the Blink stamp were shown to agree.

## 4. On `InputEventsScaleForEmulation() == 1`

The note calls this inference in the body and "measured as 1" in Limits. The measurement licenses
the weaker, precise statement, and I recommend it: an unmodelled **constant** divisor `f` would make
every relative deviation share a sign and scale with \|target\|. Observed per-leg relative
deviations (n=10 each) are:

| leg | mean rel. dev | s.e. | signs |
|---|---|---|---|
| in | +4.55e-09 | 1.1e-07 | both |
| out | −3.43e-08 | 2.7e-08 | both |
| clamp | +7.23e-08 | 4.1e-08 | both |
| default | −2.07e-07 | 8.0e-08 | both |

Sign-splitting plus zero mean excludes a constant unmodelled factor beyond ≈1e-7 relative; it does
not read `InputEventsScaleForEmulation()` in source, so "inference, bounded to 1 within 1e-7 by the
measurement" is the defensible phrasing, not "measured as 1".

## 5. Citation precision nits (no content error)

1. `S182 web_input_event_conversion.cc:127-134` — the function is **128-135**; 127 is blank. The
   quoted stamp (`:132`) is inside the cited range, so the pointer resolves.
2. `FrameScale (lines 56-65)` — the function is **57-65**; 56 is `namespace {`. The same off-by-one
   is copied into the SOURCES row anchor (`corpus/SOURCES.md:196` "decoded lines 56-65").
3. Clamp row prints a single value ("+69.315") in a column whose other rows print a range; the
   measured raw range is 69.314712..69.314738.

All four quotes are byte-verbatim against the staged files (`rederive.json:.citations`,
`stripped_equal: true` for all), and the four staged files hash to the `FETCH.txt` digests:
`c00b3bf7…`, `5f43b8a5…`, `31a6868e…`, `146aa4c1…`.

## 6. Not checked (and why)

- **S179** (`touchpad_pinch_event_queue.cc`, the `delta_y = 100 ln(update scale)` half) is not in
  `.ufo/waves/round-73/sources/`; I re-read its r72 quote
  (`chromium-synth-pinch-gesture-runtime-round-72.md:22`) but did not re-fetch the file. The r73
  note inherits that premise; my review covers the Blink half only.
- **The live `recheck` command** was not executed: this seat re-derives from committed receipts and
  does not run a browser (and widening the review to a tenth cold Chromium run would not test the
  note's claims, only the host's stability, which the nine smokes already do).
- The note's claim that the four sources were "read in the order a wheel takes" is a reading-order
  statement, not checkable from bytes.
