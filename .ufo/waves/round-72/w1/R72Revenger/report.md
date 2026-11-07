CONFIRMED

H — "the 1 px wheel-anchor jitter comes from the page scale at dispatch (non-integer visual-viewport offset/scale rounding), so wheels at page scale exactly 1 sit at (400,300) and the jitter appears only when the recorded scale is != 1" — survives both falsifiers the seat names, on the committed receipts alone: no wheel at scale 1.000 is off-anchor (99/99 in the six receipts; 147/147 including the degenerate control), and the off-anchor rate does depend on scale (0/99 = 0% at scale 1 vs 102/150 = 68% at scale != 1, Fisher p = 9.2e-13; graded chi2 = 24.04, df 9, p = 0.0042). The causal wording needs one refinement the same receipts force: a non-1 but *static* transform produces no jitter at all (the zero leg: 1691/1691 wheels at exactly (533,400), scale 1.5), and every off-anchor wheel is exactly -1 in one axis, never +1 — the observable is integer truncation of a fractional, *moving* visual-viewport position; "scale != 1" is a proxy for "transform in flight".

The honest stop on leg (c) is **not** caused by the jitter. It is a battery-arithmetic defect: `scripts/negatives-synthpinch-r72.mjs:159` mutates the first `in` wheel *by +2 from its observed value* while the counter's law is anchor-relative (|clientX-400| <= 1, `scripts/check-synthpinch-r72.mjs:204`). On the (a) receipt that base is 399, so the mutation lands on 401 — 1 px from the anchor, correctly accepted. The counter is right; the case's premise ("the mutated wheel is 2 px off the anchor") is false on this receipt. A one-line anchor-relative replacement (`[0].clientX = 402;` on a scratch copy) makes the predicate's exact battery command pass **218/218 with coverageGap empty on the frozen (a) receipt**; details and receipts in sections 5-6.

## 1. Evidence base (read-only)

No new browser run was made; every number below is extracted from committed receipts. All wheel events, all six scored/smoke receipts plus the committed degenerate control:

| receipt | sha256 | wheels |
|---|---|---|
| `corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json` (the (a) scored receipt, nonce `tabi-r72-l1-5a690aee`) | `ac2245cfe23696b1d6c8904b40f6e780bf41b95e6232509490a2613e619260b9` | 341 |
| `.ufo/waves/round-72/controls/c1/smoke1.receipt.json` | `48f1b739309de2f590383de5b7a5921f38a6c506aa3f8740fc51b875c4b036fe` | 338 |
| `.ufo/waves/round-72/controls/c1/smoke2.receipt.json` | `bcfb9271eb90be0bb62d41ab9e824d8ee944e6f12da902d82fd37c929e9fdadc` | 339 |
| `.ufo/waves/round-72/controls/c1/smoke3.receipt.json` | `f81f277a96b2419b9b1ff6348a306f93a809cdce31bf40456b214cfb28d661c1` | 341 |
| `.ufo/waves/round-72/controls/c1/smoke5.receipt.json` | `f68a7379b1fccc1d01051e7797423b7bdc0fb52b3be3b36a4ff645ff5b3bfc32` | 340 |
| `.ufo/waves/round-72/controls/c1/smoke6.receipt.json` | `6480ddb375d9742a3116dd25d22ee8c2d1753960df22e03095b407a56cb42817` | 340 |
| `.ufo/waves/round-72/controls/c1/degenerate-dispatch-wheel.receipt.json` (control, `degenerate: "dispatch-wheel"`) | `8b4f73b0e39df5df6dd5690d58160262919aa3c492ef8df817ef81e31bd9dc4c` | 48 |

2087 wheel events total; 2039 in the six receipts. Per-event table: `wheel-table.csv` / `wheel-table.json` (2087 rows, columns receipt, leg, seq, scale, scale3, clientX, clientY, deltaY, ts). Aggregates: `analysis.json`.

Definitions used: the *anchor legs* are `in`, `clamp`, `default` — the only legs whose pinch centre is the fixture anchor (400,300) (`receipt.json` `fixture.anchor`; `scripts/check-synthpinch-r72.mjs:33`). A wheel is *off-anchor* iff `clientX != 400 or clientY != 300`. The recorded `scale` is `window.visualViewport.scale` sampled in the page handler at delivery (`scripts/chrome-cdp-synthpinch-round72.mjs:173`); `clientX/clientY` are recorded raw, un-rounded by the page (`scripts/chrome-cdp-synthpinch-round72.mjs:171`), so every integer below is the browser's, not the harness's.

## 2. The assignment's table: every wheel of the (a) receipt, legs in/out/clamp/default/zero

Grouped by (leg, scale at 3 dp, clientX, clientY) with counts; the ungrouped 341 rows are in `wheel-table.csv` (receipt = `a`).

| leg | scale | clientX | clientY | n |
|---|---|---|---|---|
| in | 1.064 | 399 | 299 | 2 |
| in | 1.132 | 400 | 299 | 1 |
| in | 1.199 | 399 | 300 | 1 |
| in | 1.266 | 399 | 299 | 1 |
| in | 1.332 | 400 | 300 | 1 |
| in | 1.399 | 399 | 300 | 1 |
| in | 1.464 | 400 | 299 | 1 |
| in | 1.532 | 400 | 299 | 1 |
| in | 1.598 | 400 | 299 | 1 |
| in | 1.665 | 400 | 300 | 1 |
| in | 1.732 | 399 | 300 | 1 |
| in | 1.798 | 399 | 299 | 1 |
| in | 1.865 | 400 | 299 | 1 |
| in | 1.931 | 400 | 300 | 1 |
| in | 1.998 | 400 | 300 | 2 |
| out | 1.001 | 798 | 599 | 2 |
| out | 1.036 | 772 | 579 | 1 |
| out | 1.135 | 704 | 528 | 1 |
| out | 1.201 | 666 | 499 | 1 |
| out | 1.268 | 630 | 473 | 1 |
| out | 1.335 | 600 | 450 | 1 |
| out | 1.401 | 599 | 450 | 1 |
| out | 1.468 | 599 | 449 | 1 |
| out | 1.535 | 600 | 449 | 1 |
| out | 1.601 | 599 | 449 | 1 |
| out | 1.668 | 599 | 449 | 1 |
| out | 1.735 | 600 | 449 | 1 |
| out | 1.801 | 600 | 450 | 1 |
| out | 1.868 | 600 | 450 | 1 |
| out | 1.934 | 599 | 450 | 1 |
| out | 1.969 | 600 | 449 | 1 |
| clamp | 1.000 | 400 | 300 | 16 |
| default | 1.031 | 400 | 300 | 1 |
| default | 1.066 | 400 | 299 | 1 |
| default | 1.131 | 399 | 300 | 1 |
| default | 1.198 | 399 | 300 | 1 |
| default | 1.265 | 400 | 300 | 1 |
| default | 1.332 | 400 | 300 | 1 |
| default | 1.398 | 400 | 299 | 1 |
| default | 1.465 | 400 | 299 | 2 |
| zero | 1.500 | 533 | 400 | 282 |

Same table for the other five receipts (per-leg coordinate sets with counts, `analysis.json.perReceipt`):

| receipt | in | out | clamp | default | zero |
|---|---|---|---|---|---|
| smoke1 | 399,299x5, 399,300x4, 400,299x2, 400,300x5 | 599,449x3, 599,450x4, 600,450x4, 645,484x1, 663,497x1, 722,542x1, 752,564x2 | 400,300x16 | 400,299x5, 400,300x4 | 533,400x281 |
| smoke2 | 399,299x3, 399,300x4, 400,299x3, 400,300x7 | 599,449x2, 599,450x5, 600,449x2, 600,450x1, 615,461x1, 648,486x1, 686,515x1, 728,546x1, 774,581x2 | 400,300x16 | 399,299x2, 399,300x2, 400,299x2, 400,300x2 | 533,400x282 |
| smoke3 | 399,299x5, 399,300x6, 400,299x2, 400,300x4 | 599,449x2, 599,450x2, 600,449x5, 600,450x2, 630,473x1, 665,499x1, 704,528x1, 748,561x1, 798,598x2 | 400,300x16 | 399,299x5, 400,299x1, 400,300x3 | 533,400x282 |
| smoke5 | 399,299x4, 399,300x2, 400,299x3, 400,300x8 | 599,449x1, 599,450x6, 600,449x2, 600,450x2, 615,461x1, 648,486x1, 685,514x1, 727,545x1, 774,580x2 | 400,300x16 | 399,299x4, 399,300x1, 400,299x1, 400,300x2 | 533,400x282 |
| smoke6 | 399,299x4, 399,300x5, 400,299x3, 400,300x4 | 599,450x3, 600,449x4, 600,450x3, 616,462x1, 649,487x1, 686,514x1, 727,545x1, 774,581x2 | 400,300x17 | 399,299x1, 399,300x4, 400,299x1, 400,300x3 | 533,400x282 |

(`out` wheels are not near 400/300 by construction: the pinch-out starts at page scale 2 and the client position carries the scale-dependent visual offset; see section 3.3. The counter applies the anchor law only to `in`/`clamp`/`default` — `check-synthpinch-r72.mjs:203-205` — which is correct.)

## 3. Counts, contingency, one-sidedness

### 3.1 Per receipt (six receipts; anchor legs only for the off counts)

| receipt | wheels | anchor-leg wheels | off-anchor | scale==1 wheels | first `in` wheel | out clientX / clientY range | zero leg |
|---|---|---|---|---|---|---|---|
| a | 341 | 42 | 18 | 16 | 399,299 @ 1.064 | 599..798 / 449..599 | 282x (533,400) |
| smoke1 | 338 | 41 | 16 | 16 | 400,300 @ 1.031 | 599..752 / 449..564 | 281x (533,400) |
| smoke2 | 339 | 41 | 16 | 17 | 400,300 @ 1.066 | 599..774 / 449..581 | 282x (533,400) |
| smoke3 | 341 | 42 | 19 | 16 | 399,300 @ 1.068 | 599..798 / 449..598 | 282x (533,400) |
| smoke5 | 340 | 41 | 15 | 17 | 400,300 @ 1.030 | 599..774 / 449..580 | 282x (533,400) |
| smoke6 | 340 | 42 | 18 | 17 | 399,300 @ 1.070 | 599..774 / 449..581 | 282x (533,400) |

### 3.2 Pooled contingency (six receipts, 249 anchor-leg wheels)

| scale | on-anchor | off-anchor | n | rate off |
|---|---|---|---|---|
| exactly 1.000 | 99 | 0 | 99 | 0.0% |
| != 1.000 | 48 | 102 | 150 | 68% |

Fisher exact (two-sided) on that 2x2: **p = 9.23e-13**.

Graded dependence, bins over the 150 wheels at scale != 1 (anchor legs):

| scale bin | n | off | rate |
|---|---|---|---|
| (1.0, 1.1] | 20 | 11 | 55% |
| (1.1, 1.2] | 19 | 13 | 68% |
| (1.2, 1.3] | 17 | 10 | 59% |
| (1.3, 1.4] | 17 | 11 | 65% |
| (1.4, 1.5] | 25 | 21 | 84% |
| (1.5, 1.6] | 9 | 7 | 78% |
| (1.6, 1.7] | 9 | 6 | 67% |
| (1.7, 1.8] | 9 | 9 | 100% |
| (1.8, 1.9] | 9 | 9 | 100% |
| (1.9, 2.0] | 16 | 5 | 31% |

chi2 = 24.04, df = 9, p = 0.0042: the rate is not constant across the scale range, but it is not monotone either, and the bins are confounded with the leg that produced them (the `in` leg supplies almost all wheels above 1.3; `default` the 1.0-1.5 range). Two real pinch wheels sit at *exactly* scale 1.0 and precisely on the anchor: `smoke2` default seq 50 and `smoke5` default seq 51, both (400,300). Every scale-1 wheel in the six receipts: 99, of which 97 are `clamp` (the no-op pinch at min scale) and 2 are `default` wheels delivered before that leg's zoom applied; including the degenerate `dispatch-wheel` control there are 147, all at (400,300).

### 3.3 One-sidedness: can clientX exceed 400?

Anchor legs, six receipts: `clientX` takes only {399, 400} and `clientY` only {299, 300}.

| deviation (dx,dy) | count |
|---|---|
| (-1,-1) | 37 |
| (-1,0) | 33 |
| (0,-1) | 32 |
| (0,0) | 147 |

So: clientX > 400 occurs **0 times** (max 400, min 399); clientY > 300 occurs **0 times** (max 300, min 299); clientX < 400 in 70 wheels, clientY < 300 in 69. The counter's +/-1 band is two-sided in code but **one-sided in practice**: the browser only ever produces the lower side in this configuration, so the upper side of the tolerance is exercised only by the battery's own mutations. Every `in`-leg value in the table above is 399/400 or 299/300, and the same holds in every smoke.

`out` (99 wheels in the six receipts): clientX 599..798, clientY 449..599 — these are *not* anchor deviations. The client position follows `800/scale + offset` (offset = the visual viewport's offset term, which clamps to 0 at scale <= 1.335): for the six receipts' 37 wheels at scale <= 1.335 the residual `clientX - 800/scale` lies in [-0.94, +0.63] (35/37 negative; the 2 positives are the transition events at scale ~1.3347 where the recorded scale lags dispatch by ~0.001). Over the whole leg the residual spans -0.94 .. +193.65 (the offset term, which clamps to 0 at scale <= 1.335); the 62 wheels at scale > 1.335 sit at clientX 599/600. The counter does not anchor-check `out`, correctly.

`zero` leg: 1691 wheels across the six receipts, **all** at (533,400), all deltaY 0, scale 1.5 (1691/1691; `analysis.json.zeroLeg`). 533 = floor(800/1.5), 400 = floor(600/1.5): a non-1 scale with a *static* transform gives a constant integer, zero jitter.

## 4. Hypothesis adjudication

Falsifier 1 — "any wheel at scale 1.000 is off-anchor": **not triggered**. 99/99 anchor-leg wheels in the six receipts (147/147 including the control), all at (400,300).

Falsifier 2 — "the off-anchor rate does not depend on scale": **not triggered** under the scale-1-vs-not reading the hypothesis states: 0/99 vs 102/150 (Fisher p = 9.2e-13), and the graded bins reject a constant rate (p = 0.0042). (A stricter "depend on the scale *value*" reading would be awkward: a static 1.5 transform has a 0% rate — see the refinement — so the rate tracks "transform in flight", not the number.)

H is therefore **CONFIRMED** on its observable claim, with this refinement forced by the receipts:

- The jitter is not caused by the scale being non-integer as such; it is the integer conversion of a fractional client position that *moves* while the pinch updates the visual viewport. Evidence: (i) `clamp` (scale fixed at 1, no zoom) 0/97 off, exact (400,300); (ii) `zero` (scale fixed at 1.5, no zoom) 0/1691 off, constant (533,400); (iii) `in`/`default`/`out` (transform in flight) carry the -1 deviations; (iv) across all 249 anchor wheels every deviation is 0 or -1 — never +1 — and the 37 late `out` residuals are mostly in [-0.94,-0.5], which is the signature of truncation (floor), not round(); a round() would put them in [-0.5,+0.5].
- The hypothesis's phrase "page scale at dispatch" is as close as the receipt can get: the receipt records `visualViewport.scale` at handler time (`driver:173`), not the offset that actually produces the fraction; the offset is not recorded. The exact rounding site in Blink is **[INFERENCE]** from the distribution, not observed.

The precise trigger the next generation should assume: any leg in which the visual-viewport transform is changing while wheels are delivered can place a synthesized wheel at anchor-1 px; legs with a static transform land exactly on the floor of their (possibly fractional) position.

## 5. Cause of the honest stop (leg (c)) — deterministic, and not the jitter's fault

The counter's law (`scripts/check-synthpinch-r72.mjs:204`):

```
check('wheel-anchor', ... Math.abs(e.clientX - AT.x) <= 1 && Math.abs(e.clientY - AT.y) <= 1)   // AT = {400,300}
... and clamp wheels must be exactly (400,300)                                                   // line 205
```

The failing battery case (`scripts/negatives-synthpinch-r72.mjs:159`):

```
add('in-wheel-anchor-2px', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX += 2; });
```

It adds 2 to *whatever the receipt's first `in` wheel contains*. With the observed one-sided jitter, that base is 399 on three of the six receipts:

| receipt | first `in` clientX | mutated (+2) | distance from 400 | case |
|---|---|---|---|---|
| a | 399 | 401 | 1 | FAIL (accepted) |
| smoke1 | 400 | 402 | 2 | PASS (refused) |
| smoke2 | 400 | 402 | 2 | PASS (refused) |
| smoke3 | 399 | 401 | 1 | FAIL (accepted) |
| smoke5 | 400 | 402 | 2 | PASS (refused) |
| smoke6 | 399 | 401 | 1 | FAIL (accepted) |

The counter cannot refuse 401 — |401-400| = 1 is inside the law — and it does not: on a scratch copy of the frozen (a) receipt with the first `in` wheel set to 401, `node scripts/check-synthpinch-r72.mjs --receipt <copy> --expect-driver-sha256 d007... --json` exits **0**, verdict **clean**, 94/94 checks, findings **[]** (`exp-counter-a-plus2-401.json`). The committed battery therefore reports exactly what it should: exit 0 for that case, i.e. `in-wheel-anchor-2px` **failed** — the committed `scored/c1-negatives-a.json` shows `"case":"in-wheel-anchor-2px","exit":0,"findingIds":[],"counterLine":204`, 217/218, `allOk:false`. The same mutation anchored properly (clientX = 402) is refused: exit **1**, verdict `findings`, findings `["wheel-anchor"]` (`exp-counter-a-anchor402.json`).

Receipt dependence is real and new: the unmodified battery has never been run on `smoke6` before. It fails there too, with the same single case: `node scripts/negatives-synthpinch-r72.mjs --real .ufo/waves/round-72/controls/c1/smoke6.receipt.json ... --json` exits **1**, 214/215, `failed: ["in-wheel-anchor-2px"]` (`exp-unmodified-battery-smoke6-215.json`). `smoke3` was already reported red for the same reason; `smoke1`, `smoke2`, `smoke5` have first `in` wheels of 400 and pass. The case is a function of the receipt's first wheel, not of the counter.

Kill power is intact: the committed `scored/c1-kill-power-a.json` reports `unmutatedExit: 1`, force-true **94/94 killed**, semantic **12/12 killed**, `survivors: []`, `holds: false`. `holds:false` is caused solely by the unmutated battery's exit 1 (its `failedCases` list is exactly `["in-wheel-anchor-2px"]`); no mutant survives. The predicate's kill-power conjunction therefore fails on its "unmutated battery exit 0" precondition, not on kill power.

## 6. Next generation's fix — one line, validated on the frozen (a) receipt

Change `scripts/negatives-synthpinch-r72.mjs:159` to an **anchor-relative** mutation, preserving the case's name and meaning ("a wheel 2 px off the anchor must be refused"):

```
add('in-wheel-anchor-2px', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 402; });
```

Validation (scratch copy, `negatives-fixed.mjs`, sha256 `17c2403d55fbaae7f14e4a232d3eda6ed8e92f6b32f55702674115c34d911483`; the diff against the frozen battery `414e04a6...` is exactly line 159; the scratch counter is byte-identical to the frozen counter `142062ef...`):

- The predicate's exact command, including the three `--laundered` degenerate receipts, on the frozen (a) receipt: `node negatives-fixed.mjs --real <(a) receipt> --expect-driver-sha256 d007... --work <ABS> --laundered <3 receipts> --json` exits **0**, 218/218 cases, `allOk:true`, `coverageGap:[]`, 165 isolated, 84 ids with an isolated case (`exp-fixed-battery-a-218.json`).
- Same fixed battery on `smoke6` (215 cases, no laundered): exit **0**, 215/215, `allOk:true` (`exp-fixed-battery-smoke6-215.json`). On the (a) receipt without laundered: exit 0, 215/215 (`exp-fixed-battery-a-215.json`).

Why this is the right layer: the counter's law is anchor-relative and already correct; the must-accept case `accept-in-anchor-1px` (`battery:223`) mutates by +1 and stays inside the band on every receipt, so it is insensitive to the base; the `+5` case (`battery:158`) is always >= 4 px off and insensitive; only the `+2` case straddles the boundary when the base is the lower jitter extreme. The upper boundary is already pinned by `wheel-anchor-clamp-exact` (`battery:160`): clamp wheels are exact by law, +1 = 401, refused.

Do not "fix" this by tightening the counter (e.g. a one-sided 399..400 band): that would encode a host measurement as a law and reject a legitimate 401 on a future host/driver. Do not change the driver: the page already records raw `clientX` (`driver:171`), and the truncation happens inside Blink's client-coordinate conversion, below anything the driver can influence.

Optional coverage additions for the next generation (not required to unblock):
- a must-accept case setting the first `in` wheel to 399 (the observed down-jitter extreme), so the accepted band is pinned at both ends rather than only at 400/401;
- run the battery on *two* smoke receipts with first-`in` values 399 and 400 pre-freeze (the pre-freeze control ran it only on `smoke1`, the one receipt where the case passes; `smoke3` and `smoke6` would have exposed it).

## 7. Limits / inferences

- [INFERENCE] The integer conversion is truncation (floor), not round(): supported by 35/37 negative residuals clustering at -0.9 in `out`, by the complete absence of +1 deviations in 249 anchor wheels, and by the one-sided distribution; not directly observable from the receipt. The recorded `scale` is sampled at handler time, not the offset used at dispatch (scale lag ~0.001-0.002 explains the two positive `out` residuals).
- [INFERENCE] The `out` mapping `800/scale + clamped-offset` is fitted from the 37 late events; the exact Blink conversion (screen/offset/scale order) is not in the receipt and is not needed for the verdict.
- The 1-vs-not-1 contrast is confounded with "gesture in flight" because only a no-op pinch holds scale at exactly 1 in this fixture; this is why the refinement (moving fractional transform) is stated as the mechanism rather than "non-integer scale".
- No browser run, no production/lane edit, no tool install. Scratch `/fast/scratch/hyaku/tabi-r72/R72Revenger` removed after the artifacts were copied here.

## 8. Evidence chain (commands, exit codes, paths:lines)

1. Extraction over the 6 receipts + the dispatched control: `python3 ...` exit 0 -> `wheel-table.csv` (2087 rows), `wheel-table.json`, `analysis.json`.
2. Counter on a scratch copy of the (a) receipt with first `in` wheel = 401: `node scripts/check-synthpinch-r72.mjs --receipt <copy> --expect-driver-sha256 d007adec... --json` exit **0**, clean, 94 checks, no findings (`exp-counter-a-plus2-401.json`; the same 401 that the committed battery construct produces from 399+2).
3. Counter with first `in` wheel = 402: exit **1**, findings `["wheel-anchor"]`, 94 checks (`exp-counter-a-anchor402.json`).
4. Unmodified battery on smoke6: exit **1**, 214/215, failed `["in-wheel-anchor-2px"]` (`exp-unmodified-battery-smoke6-215.json`).
5. Fixed battery on the (a) receipt with the three laundered receipts: exit **0**, 218/218, `allOk:true`, `coverageGap:[]` (`exp-fixed-battery-a-218.json`).
6. Fixed battery on smoke6: exit **0**, 215/215 (`exp-fixed-battery-smoke6-215.json`).
7. Committed (read-only): `scored/c1-counter-a.json` clean 94; `scored/c1-negatives-a.exit` = 1 with `failed:["in-wheel-anchor-2px"]`, `counterLine:204`; `scored/c1-kill-power-a.json` `unmutatedExit:1`, 94/94 + 12/12 killed, `survivors:[]`, `holds:false`.
8. Source lines: `scripts/check-synthpinch-r72.mjs:33` (AT), `:203-205` (anchor law, clamp-exact); `scripts/negatives-synthpinch-r72.mjs:158-160` (anchor cases), `:223` (must-accept +1); `scripts/chrome-cdp-synthpinch-round72.mjs:171` (raw clientX), `:173` (scale); `.ufo/waves/round-72/sources/touchpad_pinch_event_queue.cc:41-44` (delta_y = 100 log(scale), sign inversion note); `.ufo/waves/round-72/claims.json` C1 predicate (c) and kill rule.

## 9. Assessment against the frozen claim

Leg (c) is false on the frozen (a) receipt (battery exit 1), so the L1's honest stop stands and no amendment is proposed: the predicate, counter, pins and kill rule are untouched. The stop is caused by a battery case whose mutation is value-relative and therefore receipt-state-dependent; the jitter is the *base*, not the cause. Correcting the battery line makes the frozen (a) receipt pass the predicate's battery command 218/218 with full coverage, and the counter and driver need no change. If the next generation keeps this receipt and instrument set, it can re-enter leg (c) with the corrected battery after a fresh freeze (the battery bytes are pinned; a corrected battery is a new instrument).
