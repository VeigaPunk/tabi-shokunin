CONDEMNED

# R71Review1 — false-green review of check-synthpinch-r71.mjs and its battery

Frozen bytes verified before any probe:
- counter `scripts/check-synthpinch-r71.mjs` sha256 `310fac05b3cb50ee97eff92197467d0f650fb9c17f898c3267c8054b7eef176c` = freeze.txt:4
- battery `scripts/negatives-synthpinch-r71.mjs` sha256 `830bbb0d33f8286dca94e0dc8003e5a8184a3ca59cf949200be0d0579fe3d14a` = freeze.txt:5
- driver `scripts/chrome-cdp-synthpinch-round71.mjs` sha256 `5318780c…` = freeze.txt:3; scored receipt driverSha256 pins the same value.

Baseline: counter exits 0 on the scored receipt (`corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`, sha256 `19e3c5b6…`). All probes below are crafted copies in `receipts/` (GREEN-*/REFUSED-*), produced by `craft.mjs`/`craft2.mjs` in this directory. Repro for any case:

```
node scripts/check-synthpinch-r71.mjs --receipt .ufo/waves/round-71/w1/R71Review1/receipts/GREEN-<case>.json --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af; echo $?
```

## Verdict scope
The battery is sound (independent rerun below). The counter carries 15 demonstrated receipt-level false greens; ~11 of them defeat the intent of declared checks (`no-lookalike-producer`, `scale-agreement`, per-leg shape laws), not merely undeclared dimensions. Claims are frozen; these are attack results, not amendment proposals.

## A. Battery verification (negatives-synthpinch-r71.mjs) — sound
Rerun in my scratch against a copy of the scored receipt, with the driver pin and all three `controls/c1` degenerate receipts as `--laundered`:
- `allOk=true`, positive case exit 0, **107/107** cases refused for the expected reason, **98 isolated**, `checkIds=87`, `coverageGap=[]`, laundered 3/3 (`dispatch-wheel`→no-lookalike-producer, `set-scale`→no-lookalike-producer, `skip-touch`→pinch-call-count). Output preserved: `battery.json`.
- alsoAllowed audit (6 scored-case groups): every allowance is mechanically necessary — removing a pinch call necessarily changes the params list (`pinch-call-count`→`pinch-call-params`); inserting an untrusted event into an empty leg necessarily changes its sequence (`start/unit/pen/outside-trusted`→`leg-*-seq`); flipping a clamp wheel's sign necessarily breaks the sum law (`clamp-wheels-sign`→`wheel-delta-law`). No undeclared extras in any run.
- Wrong-reason hunt: for every isolated case the expected id fires from the mutated field's own law (e.g. `wheel-anchor-clamp-exact` fires only via the exact-equality clause, `devtools-stderr-absent` via the stderrHead clause of `devtools-port-binding`, `slow-ratio` via the >5 bound). No case found that passes while its expected law is disabled for a different reason: the non-laundered `legshape-consistency` case is the only thing that can catch its own mutation, and the two-stage launder→rerun methodology (battery :136-141) cannot mask it.
- The event-leg-domain battery case is safe because the zero leg has 282 wheels against a min of 20; mutating one event's leg cannot trip `leg-zero-wheels`.

## B. False greens (counter exit 0 on forged receipts)

**F1 — HIGH: `no-lookalike-producer` (check-synthpinch-r71.mjs:106-109) is evadable four ways.**
- GREEN-N03-eval-bracket-push: `Runtime.evaluate` expression `window["__events"]["push"]({type:"wheel",ctrlKey:true,deltaY:-120})` — the regex only matches `__events\s*\.\s*push`; bracket access passes. Exit 0.
- GREEN-N03b-css-zoom: `Runtime.evaluate` `document.documentElement.style.zoom = "2"` — no regex alternative matches script-driven zoom. Exit 0.
- GREEN-N02-dmo-scale / GREEN-N02b-dmo-extra: `Emulation.setDeviceMetricsOverride` with a `scale` param (existing setup entry mutated / duplicate row pushed). The real driver itself sends this method for setup (receipt cdpSendLog id 4, params without `scale`), so the method can never be netted wholesale — but its `scale` param is the direct page-scale channel and is read by no check. Exit 0 both.
- GREEN-N12-case-variant: method spelled `input.dispatchMouseEvent` (lowercase i) — regex is case-sensitive, count filter is exact-match. Exit 0.

**F2 — HIGH: absolute page scale is unanchored, and the receipt's own contrary evidence is unread.**
- GREEN-N11-base-scale-7: `legs[0].scaleBefore = {page:7, cdp:7}` — the run now claims to start at page scale 7 while every event's own `scale` field reads ~1.07–1.5. `scale-agreement` (:145-146) checks only page≈cdp and the leg-to-leg chain; no check ever reads `events[*].scale`. Exit 0.
- GREEN-N05-tiny-deltas: all 16 `in`-leg wheels set to deltaY −0.01 while `scaleAfter` stays 1.999998927116394 — the Blink wheel-delta→scale conversion is enforced only at clamp (:153-155); on `in`/`out`/`default` the claimed scale change is decoupled from the wheel evidence. Exit 0. (The receipt contains enough data to bind these: per-event `scale` + per-wheel deltas; the counter reads neither.)

**F3 — MEDIUM: numeric type/domain laws applied asymmetrically.**
- GREEN-N01-deltaY-string-in: all 16 `in`-leg `deltaY` replaced by numeric strings. `wheelSign` (:119) coerces with `<`/`>`; `num()` is used only in the clamp/zero paths (:153-155). Exit 0. (`deltaY:null` on the same leg is correctly refused — REFUSED-N08c — via mixed-sign, so nulls are caught while corrupt strings are not.)
- GREEN-N08a-ts-string: `ts` as numeric strings on `in` wheels — `span()` (:113) coerces via subtraction, window passes. Exit 0.
- GREEN-N08bfix-ts-shift-neg: every event `ts` shifted by −20000 (order-preserving, all negative) — no absolute-time or sign law on event timestamps. Exit 0. (An order-reversing negation is refused, but by the window check, not by any domain law.)

**F4 — MEDIUM: the event→leg binding is producer-attested only.**
- GREEN-N17bfix-relabel-fitted: one `in` wheel relabelled `leg:"default"` with `ts` fitted to 3770.0 inside the default window. `event-leg-domain` (:100) refuses only out-of-plan labels; on the target leg the count (10 ≥ 3), sign, ctrl, anchor and span laws all still hold. The receipt now attributes a producer call's event to a different call. Exit 0. (Same-family rename attempts that don't fit the target window are refused by the span accident — e.g. `leg-default-timing` — not by any binding law.)

**F5 — LOW: tolerance shapes a forged log can occupy.**
- GREEN-N09-dup-touchmove: a verbatim duplicated `touchmove` (laundered) — `tm` is a min law. Exit 0. Contradictory duplicates (opposite-sign wheel inserted) are refused (REFUSED-N09b).
- GREEN-N14fix-clamp-flat: clamp's 16 real per-wheel deltas flattened to 16×4.3322 (same sum) — `wheel-delta-law` is a sum law by declaration. Exit 0 (designed; noted).
- GREEN-N14bfix-clamp-17: a 17th clamp wheel, sum preserved — clamp wheels are min-count (≥5), not exact. Exit 0 (designed; noted).
- REFUSED-N21/N22: zero leg amputated to its 20-wheel minimum and default leg reduced to three synthetic −10 wheels — both refused, but by the span windows, not the count floors the mutations actually defeat.

**F6 — INFO: unread receipt fields.** `events[*].target/.changed/.clientX/.clientY` (outside anchor legs), `.pointerType` on wheels, per-event `scale` (see F2), top-level `fixture`/`sweeps` are read by no check; `driver-pin` without `--expect-driver-sha256` only shape-checks the hash. The battery always runs pinned, so this only weakens ad-hoc counter invocations.

## C. Refusals that held (counter is not trivially forgeable)
Producer polarity both ways (GREEN-… no — REFUSED-N04-true-REFUTED and REFUSED-N04b-false-CONFIRMED → `producer-verdict`); whole touch log replaced by a coherent one-finger drag (REFUSED-N06 → `leg-touch-seq`,`leg-slow-seq`,`touch-geometry`); contradictory duplicate wheel (N09b); duplicate/missing leg names (N13 → `leg-order` + `scale-agreement`); uniform +0.5 shift of every leg scale (N11b → all `leg-*-scale`); reversed pinch-call rows (N20 → `pinch-call-params`, so producer-order↔leg-order binding exists); the three laundered degenerate controls.

## D. Residual risk and gaps
- I did not execute Chromium or the driver; every finding is at the receipt layer, which is the counter's declared domain. Claims about real run behavior are out of scope.
- All crafted receipts are hand-forged from the scored receipt; no claim is made that the r71 driver can produce them — the C1 threat model (producer-verdict checks exist) treats the receipt as attack surface, which is the basis for calling these in-model false greens.
- F1c (setDeviceMetricsOverride) cannot be fixed by netting the method (the producer legitimately uses it); any hardening would have to police its params — not proposed here, claims are frozen.
- Not probed: C2 verifier paths, kill-power control, sources/ corpus — outside this seat.

## E. Evidence index
- receipts/GREEN-*.json — 15 exit-0 falsifications (N01, N02, N02b, N03, N03b, N05, N07, N08a, N08bfix, N09, N11, N12, N14fix, N14bfix, N17bfix)
- receipts/REFUSED-*.json — 10 representative refusals
- receipts/round1-summary.json, receipts/round2-summary.json — per-case exit codes and finding ids
- receipts/baseline-real-copy.json — the scored receipt copy used as mutation base
- craft.mjs, craft2.mjs — exact mutators; battery.json — my independent battery run
