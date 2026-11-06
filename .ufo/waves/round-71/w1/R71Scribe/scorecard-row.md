# Proposed SCORECARD.md capability row — round 71

Drafted by seat R71Scribe from `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`
(nonce `tabi-r71-scored-189a293f`, predicate true, `synthPinchHypothesis` CONFIRMED, driverSha256
5318780c…922af, startedAt 2026-11-06T21:30:58.863Z / finishedAt 21:31:13.163Z) and the L1 scored
outputs under `.ufo/waves/round-71/scored/`. Format is the round-70 row's
(`SCORECARD.md`, `## Round 70` capabilities table). No seat run is cited here; the independent
cold-run leg is discussed in `report.md` (finding S-2) and is L1's to resolve.

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-synth-pinch-gesture-linux` | Drive `Input.synthesizePinchGesture` over raw CDP on Chromium 155.0.8059.84/Linux headless in a 1280×900 desktop viewport (`mobile:false`) and prove the producer: mouse `in` raises the page scale 1→2 and `out` returns it 2→1 through trusted ctrl+wheel events of one deltaY sign (16 wheels each, 242.5/242.6 ms), with the page-side and CDP scale readings in agreement and the scale carrying over between legs; the `clamp` leg keeps firing 16 out-wheels at the floor and the scale stays 1; `scaleFactor:1` emits no input event; an omitted source behaves as mouse (1→1.5 via 9 in-wheels in 125.8 ms); touch-class pinches deliver a two-finger pointer/touch sequence (2×pointerdown/touchstart, 15 touchmoves, 2×pointerup/touchend) and leave the scale unchanged on this desktop configuration; `relativeSpeed:200` stretches the touch leg 231.2→925.0 ms (span ratio 4); `pen` fails -32602 `Unknown gestureSourceType` and x=5000 fails -32602 `Position out of bounds` with no events; `scaleFactor:0` never answers (4 s no-response) while zero-delta ctrl wheels keep firing (282 wheels over 4674.1 ms); all 74 CDP sends are logged, so look-alike producers (`Input.dispatchMouseEvent` mouseWheel, `Input.dispatchTouchEvent`, `Emulation.setPageScaleFactor`, script `WheelEvent`) are refused — re-derivable from the 87-check counter (verdict clean, `scored/c1-counter-a.json`), its 107-case battery (107/107, 98 isolated, coverageGap []) and its kill-power control (87/87 single-check mutants killed) | `scripts/chrome-cdp-synthpinch-round71.mjs`; `scripts/check-synthpinch-r71.mjs`; `corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`; `.ufo/waves/round-71/scored/c1-counter-a.json`; `.ufo/waves/round-71/scored/c1-negatives-a.json`; `.ufo/waves/round-71/scored/c1-kill-power-a.json` | round 71 |
