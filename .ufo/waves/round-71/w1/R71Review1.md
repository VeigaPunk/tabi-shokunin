# R71Review1 — scoped findings (C1 counter false-green review)

Verdict: CONDEMNED. Frozen bytes verified (counter `310fac05…`, battery `830bbb0d…`, driver `5318780c…`). Battery independently rerun: sound (`allOk=true`, 107/107, 98 isolated, coverage 87/87, laundered 3/3, positive green). The counter carries 15 crafted receipt-level false greens; ~11 defeat the intent of declared checks. Full detail: `.ufo/waves/round-71/w1/R71Review1/report.md`; all falsification receipts reproducible beside it.

HIGH
- F1 `no-lookalike-producer` evadable (check-synthpinch-r71.mjs:106-109): bracket-access log write `window["__events"]["push"]` (GREEN-N03); CSS zoom via Runtime.evaluate (GREEN-N03b); `Emulation.setDeviceMetricsOverride` with `scale` — method is the driver's own legit setup call, its scale param unread (GREEN-N02/N02b); case-variant method `input.dispatchMouseEvent` (GREEN-N12). All exit 0.
- F2 absolute scale unanchored, receipt's own evidence unread: `legs[0].scaleBefore={page:7,cdp:7}` greens while events[*].scale reads ~1.07 (GREEN-N11); `in`-leg deltas −0.01 with scaleAfter 2 greens — wheel↔scale law enforced only at clamp (GREEN-N05; scale-agreement :145-146, clamp law :153-155).

MEDIUM
- F3 type coercion: string `deltaY` on in/out/default legs greens (`wheelSign` :119 coerces; `num()` only on clamp/zero) — GREEN-N01; string `ts` greens via `span()` :113 — GREEN-N08a; order-preserving negative timestamps green — GREEN-N08bfix. (`deltaY:null` is refused, REFUSED-N08c — asymmetric.)
- F4 event→leg binding producer-attested: in-wheel relabelled `default` with fitted ts greens (GREEN-N17bfix; `event-leg-domain` :100 refuses only out-of-plan labels).

LOW / INFO
- F5 tolerance shapes: benign duplicated touchmove green after laundering (GREEN-N09; contradictory duplicates refused); clamp sum-only (GREEN-N14fix, declared) and min-count 17-wheel clamp (GREEN-N14bfix, declared); zero/default amputations caught by span windows, not the count floors they defeat (REFUSED-N21/N22).
- F6 unread fields: events[*].target/.changed/.scale, non-anchor clientX/Y, wheel pointerType, top-level fixture/sweeps; unpinned runs only shape-check driverSha256.

Held refusals: both producer polarities, one-finger forged log, contradictory duplicate wheel, duplicate/missing leg names, uniform scale shift, reversed pinch rows, all 3 laundered degenerates. alsoAllowed audit: all 6 allowance groups mechanically necessary; no wrong-reason isolated passes found; laundering methodology cannot mask the `legshape-consistency` case (it is the only non-laundered one).

Residual: receipt-layer only (counter's declared domain); Chromium/driver not executed; no amendment proposed — claims frozen.
