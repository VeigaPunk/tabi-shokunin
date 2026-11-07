HOLDS

Seat R73Exec2 (Tabi round 73 w1) — post-freeze repetition over 3 fresh cold runs of the
pinned driver, counter and battery, calibrated against the 9 pre-freeze smokes. Every
fresh run is green on its own terms; the observed honest spread is essentially zero on
the law the battery probes, so no relative mutation sits anywhere near the counter's
tolerance. Nothing in this wave moves the counter, the battery or the driver bytes.

Method (commands, exit codes)
------------------------------
Pins verified before any run (all sha256 match freeze.txt
.ufo/waves/round-73/freeze.txt:3-6 — driver 3f0ffe24…, counter 3104101a…,
battery 0a738780…, exit 0 on `sha256sum`).

1. Driver, 3 cold runs, own free ports, scratch /fast/scratch/hyaku/tabi-r73/R73Exec2/d<n>,
   receipts written to .ufo/waves/round-73/w1/R73Exec2/d<n>.receipt.json:
   - d1: node scripts/chrome-cdp-synthpinch-round73.mjs --scratch …/d1 --out …/d1.receipt.json
     --nonce tabi-r73-exec2-1-54725fb9 --http-port 46101 --cdp-port 46201 → exit 0
     (d1.driver.out ends in `"failures": []`; d1.driver.exit=0)
   - d2: --nonce tabi-r73-exec2-2-cdd5c4f6 --http-port 46301 --cdp-port 46401 → exit 0
     (d2.driver.exit=0)
   - d3: --nonce tabi-r73-exec2-3-c17cad20 --http-port 46501 --cdp-port 46601 → exit 0
     (d3.driver.exit=0)
   Receipt sha256: d1 6df1f1f7…, d2 991c54dd…, d3 8e5c66b5… (sha256sum, exit 0).

2. Counter on each receipt with --expect-driver-sha256 3f0ffe24…, the run's own
   --expect-nonce, and 13 --prior (smoke1..9 + degenerate-{dispatch-wheel,set-scale,
   skip-touch} + corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json):
   - d1 counter exit 0, d2 counter exit 0, d3 counter exit 0; each `--json` verdict
     `clean`, checkCount 98, findings [] (d1.counter.json / d2.counter.json /
     d3.counter.json beside the receipts, exit 0).

3. Battery on each receipt with the same pin/nonce/priors, --work …/w<n>,
   --laundered degenerate-dispatch-wheel / degenerate-set-scale / degenerate-skip-touch:
   - d1 battery exit 0 allOk true passed 228 failed [] coverageGap [] (d1.battery.json)
   - d2 battery exit 0 allOk true passed 228 failed [] coverageGap [] (d2.battery.json)
   - d3 battery exit 0 allOk true passed 228 failed [] coverageGap [] (d3.battery.json)
   Decomposition each run: 216 refuse + 9 must-accept + 3 laundered = 228.

Red rates (12 receipts: smoke1..9 pre-freeze + d1..d3 post-freeze)
------------------------------------------------------------------
- Counter per-check red rate: 0/98 ids red, 0/(12×98)=0 cell-red. All 98 checks true
  on all 12 receipts (pre-freeze pf-smoke<n>.counter.json exit 0 ×9, all `clean`;
  d<n>.counter.json exit 0 ×3). The L1 scored receipt (scored/c1-counter-a.json,
  98 checks clean, exit 0 in scored/c1-counter-a.exit) is the 13th, included in the
  per-run --prior set but excluded from the 12-receipt rate so the rate stays
  pre/post-freeze symmetric; it is also 98/98 clean.
- Battery per-case failure rate: 0/228 cases fail on any of the 12 receipts;
  every case is 0/12. (pf-smoke<n>.battery.json: allOk true, passed 228, failed []
  ×9; d<n>.battery.json ×3 likewise. The L1 scored battery
  scored/c1-negatives-a.json is allOk true 228/228 as well.)
- Kill-power pre-freeze (controls/c1/pf-smoke<n>.killpower.json) and L1 scored
  (scored/c1-kill-power-a.json: force-true 98/98, semantic 19/19 killed, exit 0) are
  unchanged and outside this seat's re-run scope; this report does not re-claim them.

First in/default wheel clientX/clientY per receipt
--------------------------------------------------
Format: receipt → in-wheel (x,y) | default-wheel (x,y). Source: each receipt's
events[], first type==wheel with leg==in / leg==default (script over the 13 receipts,
exit 0). First-wheel scale/deltaY included because they carry the calibration story.
- smoke1: in (399,299) s=1.0642 dY=-2.911 | default (400,299) s=1.0325 dY=-3.095
- smoke2: in (400,300) s=1.0666 dY=-2.789 | default (400,300) s=1.0000 dY=-3.609
- smoke3: in (400,300) s=1.0629 dY=-2.765 | default (400,299) s=1.0326 dY=-3.106
- smoke4: in (400,300) s=1.0662 dY=-2.809 | default (400,300) s=1.0297 dY=-2.843
- smoke5: in (400,300) s=1.0000 dY=-3.046 | default (399,299) s=1.0322 dY=-3.071
- smoke6: in (399,299) s=1.0640 dY=-2.793 | default (400,300) s=1.0309 dY=-2.953
- smoke7: in (400,299) s=1.0656 dY=-2.764 | default (400,300) s=1.0000 dY=-3.611
- smoke8: in (399,299) s=1.0678 dY=-2.991 | default (399,299) s=1.0315 dY=-3.003
- smoke9: in (400,300) s=1.0000 dY=-2.884 | default (400,300) s=1.0000 dY=-3.609
- L1:      in (399,299) s=1.0678 dY=-2.906 | default (399,299) s=1.0311 dY=-2.972
- d1:      in (400,299) s=1.0326 dY=-3.107 | default (400,299) s=1.0351 dY=-3.334
- d2:      in (400,300) s=1.0000 dY=-3.014 | default (400,300) s=1.0000 dY=-3.379
- d3:      in (400,300) s=1.0000 dY=-2.986 | default (399,299) s=1.0318 dY=-3.037
Anchor interpretation: all 13 receipts sit in (400±1, 300±1) — distinct (x,y) =
{(399,299),(399,300),(400,299),(400,300)}, one-pixel jitter only (counter
scripts/check-synthpinch-r73.mjs:240 `Math.abs(e.clientX - AT.x) <= 1`,
AT=(400,300) at line 49). The d1..d3 cold runs add no new anchor value. This is
why the r73 absolute anchor cases (`in-wheel-anchor-2px` replacement, battery
scripts/negatives-synthpinch-r73.mjs:251 `accept-in-anchor-abs-401`) hold: the
jitter is bounded at 1px, so any absolute 2px probe stays off the honest cloud.

Relative battery mutations vs counter tolerances, per receipt
--------------------------------------------------------------
Counter tolerances (scripts/check-synthpinch-r73.mjs): scale law `near()` default
0.01 (line 121); wheel-delta-law 0.5 on sum(deltaY·scale) (lines 243-246);
wheel-anchor 1px + clamp exact (lines 240-241); event-scale ±0.01 around the leg
range (lines 237-238); leg spans in/out/clamp [150,450], default [60,300], zero
[3000,6000] (lines 69-78 SHAPE); slow-ratio [3,5] (line 258); touch-geometry
single-x + span ratio ≥2 (lines 248-256).

Honest baseline per receipt (measured, exit 0): wheel-delta-law error is 0.0000 to
4dp on all 13 receipts (max |err| < 5e-5); scaleAfter reads are exact targets
1/2/1.5/1.5… to <1e-6; wheel spans in/out/clamp 238.7–251.2ms, default 116.1–125.6ms,
zero 4666.4–4690.8ms. Observed honest spread is therefore ~0 on the delta law and
<2e-6 on scales — the 2×-spread flag fires nowhere below because the honest spread
itself is ~0.

| battery relative case (mutation) | counter tol | crossing on all 12 receipts | margin over tol | <2× honest spread? |
|---|---|---|---|---|
| `clamp-delta-off-0.8` (last clamp wheel deltaY += 0.8) | law 0.5 | \|mut−want\|=0.8000 on 12/12 | +0.3000 (1.60× tol) | No (honest |err|≤5e-5; 2× spread ≈ 1e-4) |
| `out-delta-off-0.8` (first out wheel deltaY += 0.8/scale) | law 0.5 | 0.8000 on 12/12 | +0.3000 (1.60×) | No |
| `default-delta-off-0.8` (first default wheel deltaY −= 0.8/scale) | law 0.5 | 0.8000 on 12/12 | +0.3000 (1.60×) | No |
| `wheel-delta-law` (first clamp wheel deltaY *= 2) | law 0.5 | 1.5171–2.2896, worst d2 2.2896 (4.58× tol), best smoke1 1.5171 (3.03×) | +1.0171…+1.7896 | No |
| `leg-*-scale-off-tolerance` (scaleAfter.page/cdp += 0.05 each leg) | near 0.01 | 0.05 dev on 12/12 | +0.04 (5× tol) | No |
| `leg-*-scale-page-only`, `scale-agreement-*` (one side += 0.5) | near 0.01 | 0.5 dev | +0.49 (50×) | No |
| `event-scale-touch` (touchmove scale = 1.7) | range ±0.01 | 1.7 is ≥0.15 outside any honest [before,after] band | ≥0.14 (≥14×) | No |
| `wheel-anchor-clamp-exact` (clamp wheel[2] clientY += 1) | clamp exact | fires on 12/12 — clamp exactness is boolean, not a tolerance | 1px past exact (0 tolerance) | N/A (exact) |
| `devtools-port-binding` (dl.port += 1) | integer equality | fires 12/12 | 1 (exact) | N/A |
| `touch-geometry-x` (touches[0][0] += 3) | single-x exact | fires 12/12 | 3px | N/A |
| `allowlist-id-gap` (cdpSendLog[5].id += 100) | id===i+1 exact | fires 12/12 | 100 | N/A |
| `legshape-consistency` (legShape.in.total += 1) | integer equality vs rederived | fires 12/12 | 1 | N/A |
| `leg-*-timing` (last wheel ts += 1000) | span [150,450]/[60,300] | pushes span ≥1000ms over every honest 238.7–251.2 / 116.1–125.6 band | ≥550ms | No |
| `zero-timing` (zero wheels rewritten to ~100ms spacing) | span [3000,6000] | ~100ms vs honest 4666.4–4690.8 | ≥2900ms under | No |
| `slow-ratio` (last slow touchend ts += 3000) | ratio [3,5] | ratio pushed to ≈8–12 vs honest ≈4 | ≥3 over bound 5 | No |

The 1.60× law cases (`clamp/out/default-delta-off-0.8`) are the tightest relative
mutants: they cross by only 0.30 beyond the 0.5 tolerance. They are still ~8000×
the observed honest law error (≤5e-5), so the margin is calibration-honest — a
future tight-ening of the 0.5 law tolerance would have to move ≥0.3 before these
cases stopped isolating, and the 5e-5 honest floor leaves that door wide open.
No case flags under 2× observed honest spread on any receipt.

Zero findings, zero reds
-------------------------
Post-freeze repetition red rate: 0/3 cold runs red at driver, counter, or battery
(all exit 0); over the full 12-receipt set, counter red 0/98 ids and battery case
failure 0/228 cases. The predicate's honest-stop kill ("any pinned instrument byte
changes"; "the (a) scored run is red"; "R73Exec1's receipt is red") did not trigger
on this seat's runs, and the declared battery/counter guarantees (754 case-runs
across 13 receipts incl. the L1 scored one: 228 cases × 13 receipts = 2964 case
evaluations, all `ok: true`) reproduce exactly as frozen.

Files (all inside .ufo/waves/round-73/w1/R73Exec2/)
----------------------------------------------------
report.md (this file) plus beside it: d1.receipt.json, d2.receipt.json,
d3.receipt.json, d1.counter.json, d2.counter.json, d3.counter.json,
d1.battery.json, d2.battery.json, d3.battery.json, d1.driver.out, d2.driver.out,
d3.driver.out, d1.exit, d2.exit, d3.exit (each `driver=0 counter=0 battery=0`).
Scratch /fast/scratch/hyaku/tabi-r73/R73Exec2/ (d<n>, w<n>, *.err, *.exit,
tabulate/margins scripts) removed before yield. No tool was installed or upgraded
(pacman guard acknowledged; nothing needed beyond node/python already on host).
No git/jj mutation was performed anywhere; `sha256sum`/`node`/`python3` are the
only executables used, outside the pinned scripts.

Report: .ufo/waves/round-73/w1/R73Exec2.md
