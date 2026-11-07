source: S179 (NEW: Chromium 155.0.8059.84 components/input/touchpad_pinch_event_queue.cc, staged .ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc, 239 lines, sha256 4930d51770c81cf1b6195f111f67cd65b6f46efc59328d276aed973c7ff38f73); S176 (content/common/input/synthetic_pinch_gesture.cc), S177 (synthetic_touchpad_pinch_gesture.cc), S178 (synthetic_touchscreen_pinch_gesture.cc), S174 (input_handler.cc:2093-2136 and 295-305), S173 (Input.pdl:272-284), all at Chromium 155.0.8059.84; runtime receipt corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json (sha256 ac2245cfe23696b1d6c8904b40f6e780bf41b95e6232509490a2613e619260b9), compared against .ufo/waves/round-72/controls/c1/smoke{1,2,3,5,6}.receipt.json and .ufo/waves/round-72/w1/R72Exec1/receipt.json (sha256 41975cb3ca6f4ee4a302c919dcbc57637c5165652732eb9f630e9b204a8d349c)
verified-at: 2026-11-06, lane round 72, /usr/bin/chromium 155.0.8059.84 (Arch Linux), --headless=new, CDP product Chrome/155.0.8059.84, loopback fixture, viewport 1280x900, deviceScaleFactor 1, mobile false
recheck: S=<short ABS dir>; node scripts/chrome-cdp-synthpinch-round72.mjs --scratch $S/d --out $S/receipt.json --nonce tabi-r72-recheck-<hex> --http-port <p1> --cdp-port <p2> && node scripts/check-synthpinch-r72.mjs --receipt $S/receipt.json --expect-driver-sha256 d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 (exit 0 = still true on this host)

# Input.synthesizePinchGesture — the ctrl+wheel conversion, sourced and measured (round 72)

Round 71 recorded what a page receives from a mouse pinch and inferred the wheel-delta law from
the page side (`deltaY = −100 ln(step) / pageScale`). Round 72 opened **S179**, the queue that
turns a trackpad pinch into a ctrl-modified wheel before Blink sees it, so the per-update
magnitude and its sign now have a source. The lane re-ran the whole gesture as generation r72
(driver `scripts/chrome-cdp-synthpinch-round72.mjs`, sha256 `d007adec…f7877`; counter
`scripts/check-synthpinch-r72.mjs`, sha256 `142062ef…53e4b`, 94 checks) against the same
loopback fixture. The capability row is still **withheld**: leg (c) of the frozen predicate
honest-stopped on a battery case that this receipt's own ±1 px anchor jitter makes invisible
(§Anchor). The measured surface below is the same surface as r71; what is new is the source for
the per-update delta and three behaviours r71 did not name: a wheel count that varies run to run
while the summed law does not, `out`-leg wheels that are not at the anchor at all, and a running
sum that lags the page's own scale reading.

## Measured (scored run, nonce `tabi-r72-l1-5a690aee`, receipt sha256 `ac2245cf…60b9`)

Anchor (400,300) in CSS pixels. Page scale carries over from leg to leg; `visualViewport.scale`
and CDP `Page.getLayoutMetrics` `cssVisualViewport.scale` agree on every leg. All events
`isTrusted: true`. Counter on this receipt: `verdict: clean`, `checkCount: 94`, `findings: 0`.

| leg | params | page events | wheels | Σ(deltaY × pageScale) | scale | span |
|---|---|---|---|---|---|---|
| in | `scaleFactor:2, mouse` | 17 | 17, ctrl, `deltaMode:0`, `deltaY −5.8510…−0.0507` | −69.314710658 | 1 → 1.9999995 | 249.9 ms |
| out | `scaleFactor:0.5, mouse` | 17 | 17, ctrl, `deltaY 0.1385…8.8390` | 69.314708131 | 1.9999995 → 1 | 249.9 ms |
| clamp | `scaleFactor:0.5, mouse` at scale 1 | 16 | 16, ctrl, `deltaY 1.8520…6.2957`, all at (400,300) | 69.314719200 | stays 1 | 249.9 ms |
| unit | `scaleFactor:1, mouse` | 0 | none; CDP answers success | — | stays 1 | 716 ms |
| default | `scaleFactor:1.5`, no source | 9 | 9, ctrl, `deltaY −5.2857…−1.6049` | −40.546515115 | 1 → 1.5 | 125.2 ms |
| touch | `scaleFactor:2, touch` | 53 (15 `touchmove`) | none | — | stays 1.5 | touch span 231.2 ms |
| slow | `touch, relativeSpeed:200` | 179 (57 `touchmove`) | none | — | stays 1.5 | touch span 925.0 ms (4.00×) |
| pen | `gestureSourceType:'pen'` | 0 | none; CDP `-32602 "Unknown gestureSourceType"` | — | — | 702 ms |
| outside | `x:5000` | 0 | none; CDP `-32602 "Position out of bounds"` | — | — | 702 ms |
| zero | `scaleFactor:0, mouse` | 282 | 282, ctrl, **every `deltaY` 0**; no CDP response in 4 s | 0 | stays 1.5 | 4675.7 ms |

Touch legs unchanged in shape from r71: both pointers share x = 533 CSS px, the two-point span
grows 87.8 → 206.7 px (touch) and 84.4 → 206.7 px (slow), and the page scale does not move.

## The per-update conversion S179 sources

S179:39-40, quoted (22 words): "Note that 'wheel' event deltaY values have their sign inverted.
So to convert a wheel deltaY back to a scale use Math.exp(-deltaY/100)."

S179:44 (code, not prose): `delta_y = 100.0f * log(pinch_event.data.pinch_update.scale);`

The five design constraints the file states for itself (S179:34-38) are the shape of every law
below: deltas accumulate by addition `f(s1*s2)==f(s1)+f(s2)` (:34), invert by negation
`f(1/s)==-f(s)` (:35), zoom-in is positive `f(s)>0 iff s>1` (:36), and `25 < f(2) < 100`
(:37). The measured `f(2)` is 69.3147, inside that bracket, and it is exactly the `in` leg's
total. The wheel the queue builds is ctrl-modified unconditionally
(`pinch_event.GetModifiers() | kControlKey`, S179:54), carries the gesture's own position
(`SetPositionInWidget(pinch_event.PositionInWidget())`, :56), has `delta_x = 0` (:59) and units
`kScrollByPrecisePixel` (:58) — which is `deltaMode:0` at the page.

Two dispatch facts of the same file matter to a driver, and r71 could not see them:
`kGesturePinchBegin` is **never** converted to a wheel — the queue acks it `kIgnored` and calls
its dispatch callback `kNotDispatched` (S179:172-193) — and `kGesturePinchEnd` is converted with
phase `kPhaseEnded` and `cancelable = false` (S179:199-203), leaving `delta_y` at its initial
0.0 because only `kGesturePinchUpdate` enters the conversion branch (S179:41-46).

## The per-leg law (measured, and what it is measured against)

Per event the page gets `deltaY = −100 ln(step) / pageScale`; summed over a leg, multiplying
each event's `deltaY` by the page scale it was reported at must recover the leg's total step.

| leg | requested factor | Σ(deltaY × scale) | −100 ln(requested) | \|deviation\| |
|---|---|---|---|---|
| in | 2 | −69.314710658 | −69.314718056 | 7.4e-6 |
| out | 0.5 | 69.314708131 | 69.314718056 | 9.9e-6 |
| clamp | 0.5 | 69.314719200 | 69.314718056 | 1.1e-6 |
| default | 1.5 | −40.546515115 | −40.546510811 | 4.3e-6 |

The law holds to ≤ 9.9e-6 across all four wheel legs; the frozen counter allows 0.5
(`check-synthpinch-r72.mjs:209`). Three consequences:

1. **The law is stated against the requested `scaleFactor`, never the realized page scale.**
   The clamp leg's sum is 69.314719200 — `−100 ln(0.5)` — while its realized factor is 1
   (`−100 ln 1 = 0`, deviation 69.31). A page cannot zoom out past its floor, but the wheel
   stream still carries the full requested magnitude. A counter that compared against the
   realized factor would reject a perfectly correct clamped receipt.
2. **The sum is invariant while the event count is not.** Across the seven runs that exist for
   this generation (this scored run, the five pre-freeze smokes, and R72Exec1's independent
   `tabi-r72-exec1-3f9a1c7b` run) the `in` leg had 16, 17, 17, 17, 16, 17, 17 wheels, the
   `out` leg 16, 16, 17, 17, 16, 17, 16, the `clamp` leg 16, 16, 16, 16, 17, 16, 16, the
   `default` leg 9, 8, 9, 8, 9, 9, 8 and the `zero` leg 281, 282, 282, 282, 282, 282, 282; the
   sums stayed within −69.31467…−69.314739 for `in` and −40.546506…−40.546524 for `default`.
   The source explains it: `QueueEvent` coalesces a new update onto the
   last queued one (S179:113-128) and dispatches one wheel at a time awaiting its ack
   (S179:166-170). Because `f(s1*s2) = f(s1)+f(s2)` (:34), merging two updates into one wheel
   changes the count and preserves the sum. A counter that pins an exact count would be pinning
   a scheduling accident; the r72 counter declares `[min, sign]` instead
   (`check-synthpinch-r72.mjs:51-63`).
3. **Both the sign and the magnitude are sourced, and they compose.** The page's sign flip
   (S179:39-40) and the positive zoom-in convention (S179:36) together give the observed
   `deltaY < 0` on every `in`/`default` wheel and `deltaY > 0` on every `out`/`clamp` wheel.

## Where the running sum sits per event

The per-leg law is exact because it is a closed sum; the *running* sum is not. Comparing the
running Σ(deltaY × scale) after wheel *i* against −100 ln(recorded scale_i ÷ leg-start scale):

| leg | wheels | wheels within 0.01 | first matching wheel | last wheel's gap |
|---|---|---|---|---|
| in | 17 | 13 | 3 | 0.101 |
| out | 17 | 16 | 1 | 0.139 |
| default | 9 | 8 | 1 | 2.351 |
| clamp | 16 | 0 | never | 69.315 |

On a zooming leg the running sum tracks the page's own scale reading to < 1e-4 once that
reading starts to move — `in` from wheel 3, because the first two wheels' deltas arrive before
`visualViewport.scale` rises above 1 — and the leg's **last** wheel carries the remainder after
the scale has settled (0.101, 0.139, 2.351). The clamp leg never tracks it at all: its scale
never moves while its sum accumulates the whole requested 69.3147. So the recorded scale is a
handler-time reading, not the scale the browser divided by, and only the leg sum is exact —
which is why the frozen check is one comparison per leg (`wheel-delta-law`), not one per event.

## Anchor behaviour: ±1 px jitter on in and default, exact on clamp, and not the anchor on out

| leg | wheels | distinct (clientX, clientY) | off-anchor | max \|dx\| | max \|dy\| |
|---|---|---|---|---|---|
| in | 17 | (399,299)×4, (400,299)×5, (399,300)×3, (400,300)×5 | 12 | 1 | 1 |
| default | 9 | (400,300)×3, (400,299)×4, (399,300)×2 | 6 | 1 | 1 |
| clamp | 16 | (400,300)×16 | 0 | 0 | 0 |
| out | 17 | (599,449)…(600,450) then (630,473)…(798,599) | 17 | 199 | 150 |

So on a correct run the wheels land on or within **1 px** of the anchor on both axes and never
further, while a clamped stream is exact. That ±1 px is the host's own rounding, not slack, and
the frozen counter encodes exactly it: `Math.abs(clientX − 400) <= 1` and `<= 1` on the y axis
for `in`/`clamp`/`default`, and strict equality for every clamp wheel
(`check-synthpinch-r72.mjs:204-205`).

This is also the whole of leg (c). The battery's refusal case `in-wheel-anchor-2px` adds **+2**
to the first `in` wheel's `clientX` (`negatives-synthpinch-r72.mjs:159`). On smoke1 that wheel
sits at 400, so the mutant reads 402, |402 − 400| = 2, `wheel-anchor` fires and the case passes.
On the scored receipt the wheel sits at **399**, so the mutant reads 401, |401 − 400| = 1, the
counter is silent and the case fails (`exit 0`, `findingIds: []`). smoke3, smoke6 and R72Exec1's
independent run all have the same first coordinate (399,300) and fail identically; smoke1,
smoke2 and smoke5 start at (400,300) and pass. On the seven runs the case therefore passes on
three and fails on four — the split follows the receipt's first wheel, nothing else.
The counter is not wrong: the mutation's *effect* depends on the receipt's own jitter, so a +2
delta can collapse into a ±1 tolerance. A next-generation battery must either mutate to an
absolute out-of-tolerance coordinate (`clientX = AT.x + 2`) or assert the mutated value is
still outside tolerance before declaring a refusal case — adding a constant to whatever the
receipt happens to hold cannot express "2 px off".

**The `out` leg's coordinates are not the anchor at all**, in two regimes: wheels 1-11 sit at
(599-600, 449-450), i.e. anchor × 1.5 ± 1 px, while the page scale falls 1.9688 → 1.3347; wheels
12-17 ride (630,473) → (798,599) while `clientX × pageScale` stays 799.06-799.63 ≈ 800 =
anchor.x × 2, the scale at which the leg started. Nothing in the receipt identifies the
transform, and S179:56 only forwards the gesture's own position. The counter scopes
`wheel-anchor` to `in`/`clamp`/`default` for this reason (`check-synthpinch-r72.mjs:203`); an
out-leg anchor check would fail on a correct run.

## The zero-scale leg

282 wheels in the scored run (281 in smoke1 and 282 in each of the other five runs that exist),
every one with `deltaY`
**exactly 0** (`deltaYValues: [0]`), `deltaMode:0`, `ctrlKey:true`, all 282 at (533,400) —
anchor × 4/3 — at a 16.64 ms mean cadence (60 Hz), spanning 4675.7 ms; the leg itself waited
4706 ms and ended with no CDP response (`no-response-4000ms Input.synthesizePinchGesture`), page
scale unchanged at 1.5.

What the source fixes: the delta is computed only for `kGesturePinchUpdate` (S179:41-46); a
begin never becomes a wheel (S179:172-193); an end becomes one zero-delta wheel at most
(S179:41-46, 199-203). A 282-wheel stream at 60 Hz therefore cannot be a begin or a single end:
it is the update path converting a gesture that never reaches its target — consistent with the
infinite touchpad end time r71 already recorded (S177:162-174). *Not* sourced, and stated as
inference: at a scale of 0, S179:44 evaluates `100 log(0)` → −∞, yet the page reads 0; where a
non-finite delta is neutralised before the page sees it is outside this file. A counter can
assert only what it reads, which is why the frozen check is "every zero-leg `deltaY` is 0"
(`check-synthpinch-r72.mjs:210`), not "the delta is infinite".

## What a driver must still respect (re-observed this round)

- `scaleFactor:1` is an immediate success with no input: 0 events, 716 ms (S177:87-90).
- Validation is still synchronous and refusal-shaped: `pen` → `-32602 "Unknown
  gestureSourceType"` and `x:5000` → `-32602 "Position out of bounds"`, each with 0 events.
- An omitted source is still the mouse path: `default` zoomed 1 → 1.5 in 9 wheels over 125.2 ms.
- A touch pinch still delivers two touch points on one vertical line and still does not change
  the page scale on this desktop viewport.
- A zero-scale call still hangs and still needs the caller's own timeout and a browser kill; its
  wheels outlive the call (r71 item 9), which is why the r72 counter binds every event's handler
  time to its leg's mark window instead of trusting the driver's label.

## Limits — what this generation does not establish

- **The pageScale multiplication is a host measurement, not source.** The staged 239 lines of
  S179 contain no page-scale reference at all (`grep -ci 'page[_. ]*scale'` = 0 on
  `.ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc`): the file emits `delta_y` in
  precise-pixel units and Blink's page-scale handling happens downstream, outside this row.
  So `Σ(deltaY × pageScale) = −100 ln(scaleFactor)` is *measured on this host*, and the
  per-event division by the current scale must be re-derived per build. S179 sources only
  `delta_y = 100 log(scale)` per pinch update and its sign inversion.
- **The capability is withheld this round.** The frozen predicate's leg (c) fails: the battery
  ran 217/218 (`in-wheel-anchor-2px`, above), and kill power killed all 106 mutants (94
  force-true + 12 semantic) but reports `holds: false` because the unmutated baseline already
  exits 1 — a kill-power control cannot vouch for a red baseline. `SCORECARD.md` still has zero
  rows for `chromium-synth-pinch-gesture-linux`. This note records the surface; it does not
  admit the capability.
- **No phase is observable at the page.** S179:195-220 makes `kPhaseBegan` / `kPhaseChanged` /
  `kPhaseEnded` well defined, but the DOM `wheel` event a receipt records carries no phase, so
  a counter cannot tell the single end wheel from an update wheel except by `deltaY`.
- **The out-leg coordinate transform is unexplained** (two regimes, above), and the first 11
  out wheels sit at exactly 1.5× the anchor rather than at the leg's starting scale of 2.
- Carried, still open: `deviceScaleFactor ≠ 1`, headed Chromium, and how long a zero-scale
  gesture wedges the queue without a browser kill.

## Integration note (not knowledge; delete when the L1 admits this draft)

This draft supersedes the round-72 note committed at
`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md` in commit `cfa92fa2`. The
sections it adds over that committed text: the per-leg deviation table against the *requested*
factor and the clamp leg's 69.31 gap against the realized one; the seven-run wheel-count spread
(16/17, 8/9, 281/282) with the coalescing explanation at S179:113-128; the running-sum tracking
table; the `out` leg's two coordinate regimes; S179's Begin-never-converts and End-phase facts
(S179:172-193, 199-203); and the "no page-scale term in S179" limit stated with the grep that
shows it. No measured value in it contradicts the committed note.
