DIVERGENT

# R71Exec1 — independent cold re-derivation of C1 (legs b and c)

Seat: R71Exec1, v1 wave w1, round 71. Lane tabi-shokunin, base 11b00f64, FREEZE 04f4330f (749a1ab5).
Everything below is one attempt per scored step; no reruns. Raw receipts sit beside this file.

## 0. Pin check (read-only)

`sha256sum` over the four pinned artifacts equals `freeze.txt` byte for byte:

| file | sha256 | freeze |
|---|---|---|
| scripts/chrome-cdp-synthpinch-round71.mjs | 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af | match |
| scripts/check-synthpinch-r71.mjs | 310fac05b3cb50ee97eff92197467d0f650fb9c17f898c3267c8054b7eef176c | match |
| scripts/negatives-synthpinch-r71.mjs | 830bbb0d33f8286dca94e0dc8003e5a8184a3ca59cf949200be0d0579fe3d14a | match |
| .ufo/waves/round-71/controls/c1/kill-power.mjs | b86fc3d79f9f974e065238cd56d2ae6427aa4359f864b0f1ecd233e22a557b1e | match |

## 1. Leg (b) — cold driver run: PASS (producer), counter: RED (1 finding)

Command (scratch shortened for Chromium's socket limit; nonce drawn from /dev/urandom):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round71.mjs \
  --scratch /fast/scratch/hyaku/tabi-r71/R71Exec1/d \
  --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Exec1/receipt.json \
  --nonce tabi-r71-exec1-7f6bc402 --http-port 41233 --cdp-port 41234
```

- driver exit `0`; 14.381 s wall; 575 events; Chromium 155.0.8059.84 headless=new; fixture/DevTools ports closed after teardown; `failures: []`; `predicate: true`, `synthPinchHypothesis: "CONFIRMED"`.
- Every leg behaves as frozen: in 1->~2, out ->1, clamp stays 1, unit no events, default ->1.5, touch 15 touchmoves no scale change, slow 57 touchmoves (ratio 4.0), pen -32602 Unknown gestureSourceType, outside -32602 Position out of bounds, zero 282 zero-delta ctrl wheels over 4666.4 ms then `no-response-4000ms Input.synthesizePinchGesture`.

Counter:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-synthpinch-r71.mjs \
  --receipt /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Exec1/receipt.json \
  --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af --json \
  > /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Exec1/counter.json
```

- exit `1`; `checkCount: 87`; `verdict: "findings"`; exactly one false check: **`event-leg-domain`** — "events outside the frozen legs: 1". The other 86 checks, including `legshape-consistency`, `scale-agreement`, `wheel-delta-law`, `slow-ratio`, `teardown-closure`, `seq-monotonic`, all pass.

### Finding F1 (driver-side boundary race, real cold-run divergence)

`receipt.json` events seq 575 is `{"type":"wheel","seq":575,"leg":"end","ts":13449.4,"ctrlKey":true,"deltaY":0,"deltaMode":0,"clientX":533,"clientY":400,"scale":1.4999998807907104,"target":"pad","isTrusted":true}`.

- It is the continuation of the zero leg's wheel stream: the zero leg's 282 wheels are all at `(533,400)`, `deltaY 0`, `ctrlKey true`; the stray sits 16.7 ms after the last zero wheel (13432.7), one ~60 Hz frame later, at the same coordinates/values.
- Cause: scripts/chrome-cdp-synthpinch-round71.mjs:183-185 documents that scaleFactor 0's touchpad gesture end time is infinite, so the gesture is still running when the zero leg closes; :330 sets the page-side label to the sentinel `"end"` (`await evalValue('window.__setLeg("end")');`) and :331 snapshots `window.__events` on the next CDP round-trip. Any wheel that lands in that window is tagged `leg:"end"`.
- scripts/check-synthpinch-r71.mjs:100 (`event-leg-domain`, frozen id) requires every event leg to be in `LEG_ORDER`, which excludes `"end"`; the stray therefore counts as an out-of-domain event.
- Consequence: `event-leg-domain` is a race on the driver's collection boundary, so a clean 87/87 verdict is not stable across cold runs of the pinned bytes. The L1 scored receipt (corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json) has no such stray and scores clean: its last event is its last zero wheel (ts 13368.6, 571 events), i.e. the snapshot closed before the next 60 Hz frame; my run has 575 events and caught one at 13449.4. Recorded, not re-run. The underlying capability legs all re-derive; this is a receipt-shape defect at the last leg, not a failure of any pinch leg.
- Reproduction (exact, one attempt): the two commands above; inspect `events[-1]` and `counter.json.findings`.

### Per-leg comparison, my cold receipt vs the scored receipt

| leg | mine wheels / touchmoves | mine scaleAfter (page) | scored wheels / touchmoves | scored scaleAfter (page) |
|---|---|---|---|---|
| start | 0 | 1 | 0 | 1 |
| in | 17 wheels, span 249.9 ms | 1.9999996423721313 | 16 wheels, span 242.5 ms | 1.999998927116394 |
| out | 17 wheels, span 250.0 ms | 1 | 16 wheels, span 242.6 ms | 1 |
| clamp | 17 wheels, span 241.6 ms | 1 | 16 wheels, span 242.5 ms | 1 |
| unit | 0 | 1 | 0 | 1 |
| default | 9 wheels, span 125.2 ms | 1.4999998807907104 | 9 wheels, span 125.8 ms | 1.499999761581421 |
| touch | 15 touchmoves, span 231.3 ms | 1.4999998807907104 | 15 touchmoves, span 223.8 ms | 1.499999761581421 |
| slow | 57 touchmoves, span 924.9 ms | 1.4999998807907104 | 57 touchmoves, span 917.6 ms | 1.499999761581421 |
| pen | 0, cdpError -32602 Unknown gestureSourceType | unchanged | same | same |
| outside | 0, cdpError -32602 Position out of bounds | unchanged | same | same |
| zero | 282 zero-delta wheels, span 4666.4 ms, no-response-4000ms | unchanged | 282, span 4674.1 ms | unchanged |
| end (sentinel) | 1 stray zero-delta wheel | - | 0 | - |

The 17-vs-16 wheel counts are within the frozen `[5, sign]` shape and the 150-450 ms span band; they are frame-alignment variation, not a finding. Scale deltas are within 1e-6. `slowToTouchSpanRatio` 4.0 in both.

## 2. Leg (c) — negatives battery: PASS

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-synthpinch-r71.mjs \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json \
  --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af \
  --work /fast/scratch/hyaku/tabi-r71/R71Exec1/n \
  --laundered .../controls/c1/degenerate-dispatch-wheel.receipt.json \
  --laundered .../controls/c1/degenerate-set-scale.receipt.json \
  --laundered .../controls/c1/degenerate-skip-touch.receipt.json --json \
  > /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/w1/R71Exec1/negatives.json
```

- exit `0`; `positiveOk true`; `cases 107`; `refusedForExpectedReason 107` (every case fires its expected id with no undeclared co-fire); `isolatedCases 98`; `failed []`; `checkIds 87`; `coverageGap []`; `allOk true`.
- The 9 non-isolated cases are the ones the battery itself declares as multi-id: `pinch-call-count` (+`pinch-call-params`), `start-trusted`/`unit-trusted`/`pen-trusted`/`outside-trusted` (+ their `-seq`), `clamp-wheels-sign` (+`wheel-delta-law`), and the three `laundered-*` cases (`alsoAllowed ["*"]`). No `extra` ids in any case.

## 3. Leg (c) — kill-power: PASS

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-71/controls/c1/kill-power.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json \
  --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af \
  --work /fast/scratch/hyaku/tabi-r71/R71Exec1/k \
  --out .../w1/R71Exec1/kill-power.json --jobs 4
```

- exit `0`; `{"unmutatedExit":0,"mutants":87,"killed":87,"survivors":[],"holds":true}` — killed 87/87, one mutant per check id forced true; the unmutated battery stays green.

## 4. Comparison against the L1 scored outputs (read-only)

- `.ufo/waves/round-71/scored/c1-counter-a.json`: `clean`, checkCount 87, findings 0.
- `.ufo/waves/round-71/scored/c1-negatives-a.json`: allOk true, 107 cases, 98 isolated, coverageGap 0.
- `.ufo/waves/round-71/scored/c1-kill-power-a.json` / `.stdout`: 87 mutants, 87 killed, survivors [].
- My independent legs (c) reproduce those numbers exactly. My leg (b) reproduces all 86 substantive checks but adds the F1 stray at the zero-leg boundary.

## 5. Artifacts and hashes (in this directory)

| file | sha256 |
|---|---|
| receipt.json | 2119a26525b21f65f6e29b81c5fa3ff814c286d3cd6281e71c516ef415736abf |
| counter.json | 9d2c465109defcd655839d4d401a3ab2ae07f6a686f0ea23199ae96e24ae3c95 |
| negatives.json | 08e1969e59f8c1e7fb793f8743344152070f16f682ae06c13ba962f4b47cf35f |
| kill-power.json | 57a8f9f9a5c5de53569322597f4245d6eaae82698eec79f238d651f68e7c5522 |
| driver.stdout.txt | 50525b5756e64a68580a9e81ca23ba1335f2f0823e4ec8831f1c5a41b6a326f9 |
| driver.stderr.txt | empty (e3b0c442...b855) |

Nonce `tabi-r71-exec1-7f6bc402`; launch token `eb99e7378d4c`; ports 41233/41234; scratch `/fast/scratch/hyaku/tabi-r71/R71Exec1` deleted after copying receipts.

## 6. Risks / notes

- F1 is a real, timed boundary race: the zero leg deliberately leaves an endless zero-delta wheel stream (driver :183-185, :322) and the driver labels everything after :330 as `"end"`, which the frozen counter (:100) rejects. Clean C1 verdicts are therefore not reproducible cold with certainty; the scored receipt happened to miss the window. Frozen claims are untouched — this is an attack observation, not an amendment proposal.
- No files outside this wave directory were written; no git mutations; no host/service changes; no tool installs were needed.
