FINDINGS

# R72Exec2 — repetition red rate and a next-generation anchor case

Seat: fleet executor R72Exec2, round 72 attempt 2, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(base 4e4ac080, freeze 8356a09e / commit 7366d45c). The claim and all pinned instruments were
read-only for this seat; nothing under `scripts/`, `corpus/`, `controls/` or `scored/` was written.
All writes are under `.ufo/waves/round-72/w1/R72Exec2/` (this file's directory) plus scratch
`/fast/scratch/hyaku/tabi-r72/R72Exec2/` (deleted after the receipts were copied here).

Two results:

1. **Repetition.** Three fresh cold runs (own nonces, own ports, own scratch) reproduce the
   instrument: driver exit 0 and counter exit 0 clean, 94/94 checks, on all three; the battery is
   215/215 on all three. Over the 9 receipts now available (3 new + 6 committed) the counter has
   **0 red checks out of 94**, and the battery has **one** receipt-dependent case out of 215:
   `in-wheel-anchor-2px`, red on **3 of 9** receipts (33.3%) — exactly the three whose first in-leg
   wheel records `clientX = 399`.
2. **Next generation.** Pinning that case's mutation to `AT.x + 2 = 402` makes it receipt-
   independent: the frozen case fails on 3/9, the fixed case is refused (isolated id `wheel-anchor`,
   no co-firing) on **9/9**, and the fixed case still has kill power — against a counter copy whose
   `wheel-anchor` tolerance is widened 1→3 the battery goes red on **9/9** with
   `failed=[in-wheel-anchor-2px]`. Proposed file and diff are beside this report.

Nothing here reopens leg (c): C1-SYNTHPINCH-R72 remains an honest stop on the frozen kill rule, and
this seat did not amend, re-pin or re-run the predicate.

---

## 1. Repetition — three cold runs

Driver `scripts/chrome-cdp-synthpinch-round72.mjs` (sha256 `d007adec…f7877`, re-checked by the
counter via `--expect-driver-sha256`), counter `scripts/check-synthpinch-r72.mjs`
(`142062ef…593e4b`), battery `scripts/negatives-synthpinch-r72.mjs` (`414e04a6…825602`).
Run with `/fast/scratch/hyaku/tabi-r72/R72Exec2/run3.sh` (copied here), sequentially, one Chromium
at a time, ports discovered by binding port 0 and passed explicitly.

| run | nonce | http/cdp ports | driver | counter | battery |
|---|---|---|---|---|---|
| d1 | `tabi-r72-exec2-1-e3d888fc` | 42277 / 32775 | exit 0 | exit 0, clean, 94 checks | exit 0, 215/215 |
| d2 | `tabi-r72-exec2-2-4ce4c516` | 39921 / 37999 | exit 0 | exit 0, clean, 94 checks | exit 0, 215/215 |
| d3 | `tabi-r72-exec2-3-9fe3893b` | 40961 / 45887 | exit 0 | exit 0, clean, 94 checks | exit 0, 215/215 |

Evidence beside this report: `d1.receipt.json` (`fc4783af…8002c`), `d2.receipt.json`
(`97aa313b…8cd11`), `d3.receipt.json` (`9d40d48f…17fd0`), each with `.driver.exit`, `.driver.out`,
`.driver.err`, `.counter.exit`, `.counter.json`, `.battery.exit`, `.battery.json`, `.nonce.txt`,
`.ports.txt`. Receipts carry `schema tabi-chrome-cdp-synthpinch-r72`, the frozen `driverSha256`,
`nonce = nonceOnPage`, 575/570/571 events, 11 legs; driver stdout `predicate true /
CONFIRMED`, `slowToTouchSpanRatio 4`, `failures []`, `teardown.postKillSweepCount 0`, and
`devtools.port` equal to the argv port (32775 / 37999 / 45887).

Commands (exact):

```
node scripts/chrome-cdp-synthpinch-round72.mjs --scratch <dN/run> --out <w1/R72Exec2/dN.receipt.json> \
     --nonce tabi-r72-exec2-N-<hex> --http-port <p> --cdp-port <q>            # exit 0
node scripts/check-synthpinch-r72.mjs --receipt <dN.receipt.json> \
     --expect-driver-sha256 d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 --json  # exit 0
node scripts/negatives-synthpinch-r72.mjs --real <dN.receipt.json> \
     --expect-driver-sha256 d007adec…f7877 --work <scratch>/dN --json        # exit 0 (215/215, no --laundered)
```

### 1.1 Per-check counter red rate, 9 receipts

Table `per-check.json` (every check id × every receipt, booleans). Result: for all **94** declared
check ids the red rate is **0/9**; every one of the 9 runs is `verdict clean`, `checkCount 94`,
`findings []`. The 9 receipts are `scored` (`corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json`,
counter `scored/c1-counter-a.json`), `smoke1/2/3/5/6` (`controls/c1/smokeN.counter.json`) and
`d1/d2/d3` (`d1.counter.json` … here).

### 1.2 Per-case battery failure rate, 9 receipts (215 cases each, 207 refuse + 8 must-accept)

`red-rate.json` (per-case pass/fail matrix) and `battery-frozen-<receipt>.json` (raw). Only one case
moves:

| case | class | expect | pass | fail | failed on |
|---|---|---|---|---|---|
| `in-wheel-anchor-2px` | refuse | `wheel-anchor` | 6/9 | **3/9** | `scored`, `smoke3`, `smoke6` |
| all other 214 cases | refuse/must-accept | — | 9/9 | 0/9 | — |

Battery receipt-level red rate: 3/9 (scored, smoke3, smoke6 → `battery-frozen-*.exit` = `exit=1`;
the other six → `exit=0`). This matches the L1's measurement on the scored receipt
(217/218 with the three `--laundered` degenerate receipts; the same single case without them,
214/215 — see §1.4).

### 1.3 Wheel coordinates per receipt, legs `in` / `clamp` / `default`

Full per-wheel list (index, clientX, clientY, deltaY, scale, ts) for every wheel of those three legs
on all 9 receipts: `wheel-coords.json`. Summary (counts + X/Y histogram):

| receipt | `in` n | `in` X hist | `in[0]` (x,y) | `clamp` n | `clamp` unique (x,y) | `default` n | `default` X hist | `default` unique (x,y) |
|---|---|---|---|---|---|---|---|---|
| scored | 17 | 399×7, 400×10 | (399,299) | 16 | (400,300) | 9 | 399×2, 400×7 | (400,300) (400,299) (399,300) |
| smoke1 | 16 | 399×9, 400×7 | (400,300) | 16 | (400,300) | 9 | 400×9 | (400,300) (400,299) |
| smoke2 | 17 | 399×7, 400×10 | (400,300) | 16 | (400,300) | 8 | 399×4, 400×4 | (400,300) (400,299) (399,299) (399,300) |
| smoke3 | 17 | 399×11, 400×6 | (399,300) | 16 | (400,300) | 9 | 399×5, 400×4 | (399,299) (400,300) (400,299) |
| smoke5 | 17 | 399×6, 400×11 | (400,300) | 16 | (400,300) | 8 | 399×5, 400×3 | (400,300) (399,300) (399,299) (400,299) |
| smoke6 | 16 | 399×9, 400×7 | (399,300) | 17 | (400,300) | 9 | 399×5, 400×4 | (399,299) (400,300) (399,300) (400,299) |
| d1 | 16 | 399×9, 400×7 | (400,300) | 17 | (400,300) | 9 | 399×1, 400×8 | (400,300) (400,299) (399,300) |
| d2 | 16 | 399×8, 400×8 | (400,300) | 17 | (400,300) | 8 | 399×3, 400×5 | (400,300) (400,299) (399,299) (399,300) |
| d3 | 16 | 399×7, 400×9 | (400,300) | 16 | (400,300) | 9 | 399×2, 400×7 | (400,300) (399,299) (400,299) |

Readings that matter downstream:

* the in-leg anchor jitters over **{399, 400}** in X and **{299, 300}** in Y; every one of the 9
  receipts contains at least one 399 wheel in the anchor set (`in`+`clamp`+`default`);
* the clamp leg is **exactly** (400,300) on all 9 receipts, every wheel;
* the first in-leg wheel is 399 on `scored`, `smoke3`, `smoke6` and 400 on the other six — the same
  partition as §1.2;
* the counter's `wheel-anchor` law is `|clientX-400| <= 1 && |clientY-300| <= 1`
  (`scripts/check-synthpinch-r72.mjs:204`) plus exact equality on the clamp leg (`:205`).

### 1.4 Battery case count

`215` cases per run is 207 refuse + 8 must-accept; the claim's `218` counts the three `--laundered`
degenerate receipts (`dispatch-wheel`, `set-scale`, `skip-touch`), which the assignment told this
seat to omit. Adding them back on the scored receipt gives exactly the L1's 217/218.

---

## 2. Cause of the leg-(c) red, measured

`scripts/negatives-synthpinch-r72.mjs:159`

```js
add('in-wheel-anchor-2px', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX += 2; });
```

The mutation is **relative to the honest first event**, whose X is 399 or 400 depending on the run
(§1.3). The counter accepts anything within ±1 of 400 (`check-synthpinch-r72.mjs:204`):

* honest 400 → mutant 402 → off by 2 → refused → case passes;
* honest 399 → mutant **401** → off by 1 → **inside tolerance** → counter correctly accepts → the
  case fails.

So the red is not a counter defect on the observed receipt: the counter is behaving as frozen, and
the case's mutant is no longer 2 px off the anchor when the receipt starts 1 px off. The honest
value already consumes the whole ±1 tolerance (all 9 receipts hold both 399 and 400 wheels), so a
`+= 2` mutant lands inside tolerance exactly when the receipt is at the low end — 3/9 here.
`sweep.sh` reproduces this independently of §1.2 arithmetic: `battery-frozen-scored|smoke3|smoke6`
show `failed=[in-wheel-anchor-2px]`, `battery-frozen-smoke1|smoke2|smoke5|d1|d2|d3` show none.

---

## 3. Next-generation fix (proposal for round 73)

Proposed battery: `negatives-synthpinch-proposed.mjs` (sha256
`65a5118e94bcb25ce3153ad9924314898cc4593e9d7350730d01ed963ad223b6`), unified diff:
`negatives-synthpinch-proposed.diff` (sha256 `d6e91f1e…25d06`). It changes **only** case
`in-wheel-anchor-2px` — no other byte of the battery, and no counter change:

```diff
-add('in-wheel-anchor-2px', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX += 2; });
+add('in-wheel-anchor-2px', 'wheel-anchor', (r) => { evsOf(r, 'in', (e) => e.type === 'wheel')[0].clientX = 400 + 2; });
```

(`400 + 2` is the counter's frozen `AT.x + 2`; the comment block added above it records why.)
To run it, place the file beside the counter it scores (the battery resolves
`check-synthpinch-r72.mjs` from its own directory) — that is exactly how the sweep below ran it.

Run matrix, `sweep.sh` (copied here), 27 battery runs = 3 variants × 9 receipts. Each variant is
`<battery copy> --real <receipt> --expect-driver-sha256 d007adec…f7877 --work <scratch> --json`;
`variant-summary.json` holds the table, `battery-{frozen,proposed,widened}-<receipt>.json/.exit` the
raw output. Variants:

* `frozen` — the frozen battery against the frozen counter (control);
* `proposed` — proposed battery beside a **byte-identical copy of the frozen counter**
  (`copies/frozen/check-synthpinch-r72.mjs`, sha256 `142062ef…593e4b`, i.e. unchanged pin);
* `widened` — proposed battery beside a counter copy with the `wheel-anchor` tolerance widened
  1→3 (`check-synthpinch-widened-tol3.mjs`, sha256 `84b9b011…bae61`, one line changed at
  `check-synthpinch-r72.mjs:204`), to prove the fixed case can still fail.

| receipt | in[0].X | frozen battery | proposed battery | widened-counter battery |
|---|---|---|---|---|
| scored | 399 | exit 1, 214/215, failed `in-wheel-anchor-2px` (mutant 401, accepted) | exit 0, **215/215** (mutant 402 → `wheel-anchor` alone) | exit 1, failed `in-wheel-anchor-2px` (402 accepted under ≤3) |
| smoke1 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |
| smoke2 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |
| smoke3 | 399 | exit 1, 214/215, same case | exit 0, 215/215 | exit 1, same case |
| smoke5 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |
| smoke6 | 399 | exit 1, 214/215, same case | exit 0, 215/215 | exit 1, same case |
| d1 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |
| d2 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |
| d3 | 400 | exit 0, 215/215 | exit 0, 215/215 | exit 1, same case |

* **Original case fails on the 399 receipts** (`scored`, `smoke3`, `smoke6`) and passes on the other
  six — reproduced twice (frozen battery runs here, and the static re-derivation in §4).
* **Fixed case passes on all 9** receipts: `allOk true`, `passed 215/cases 215`,
  `failed []`, and its own result is `exit 1`, `findingIds ["wheel-anchor"]`, `extra []` (isolated,
  no undeclared co-firing) in every one of the 9.
* **Fixed case retains kill power**: with the tolerance widened to 3, the same fixed case is
  accepted (`exit 0`, `findingIds []`) on all 9 receipts, and each battery run is `allOk false`,
  `214/215`, `failed=["in-wheel-anchor-2px"]`, process exit 1 — i.e. the fixed case is still
  sensitive to the law it pins, not tautologically green.

---

## 4. Scan: other relative mutations that could cross a counter tolerance

`grep -n '\(+=\|-=\|\*=\)' scripts/negatives-synthpinch-r72.mjs` → 28 matching lines. The 15
mutations that touch a receipt-dependent quantity (line 200 counted once per generated leg) were
re-applied in memory to all 9 receipts and evaluated against the counter's own law formula, plus the
proposed variant as a control: `scan.mjs` → `relative-mutation-scan.json` (144 rows = 16 cases × 9
receipts), `relative-mutation-scan.txt`. The remaining writes only touch receipt-stable fields
(ports, send-log ids, scale targets, the producer's own summaries). Exactly **one** frozen case is
receipt-dependent: line 159 (the §2 defect). All others are receipt-independent, with these measured
margins:

| line | case | class | law + tolerance | effect measured on all 9 | margin |
|---|---|---|---|---|---|
| 158 | `wheel-anchor` (+=5 on `in[0].X`) | refuse | `wheel-anchor`, ±1 | max off 4 (399 receipts) … 5 | 3 px |
| 160 | `wheel-anchor-clamp-exact` (+=1 on `clamp[2].Y`) | refuse | clamp exact equality | off 1, clamp honest always (400,300) | equality |
| 162 | `clamp-delta-off-0.8` | refuse | `sum(deltaY*scale)` vs law, ±0.5 | dev **+0.8000** on all 9 | 0.30 |
| 164 | `out-delta-off-0.8` | refuse | same, ±0.5 | dev **+0.8000** | 0.30 |
| 165 | `default-delta-off-0.8` | refuse | same, ±0.5 | dev **−0.8000** | 0.30 |
| 166 | `wheel-delta-law` (`clamp[0].deltaY *= 2`) | refuse | same, ±0.5 | dev 1.5642–1.8545 (scales with the honest 1st deltaY) | ≥1.06 |
| 167 | `touch-geometry-x` (+=3 on one touch X) | refuse | one X column | X set size 2 | — |
| 172 | `slow-ratio` (+3000 ms on slow touchend) | refuse | ratio ∈ [3,5] | ratio 4.000 → ~17 | ~12 |
| 200 | `in-timing` / `default-timing` (+1000 ms on last wheel) | refuse | span ≤ 450 / ≤ 300 | span 242–250 / 116–126 → +1000 | ≥700 |
| 187–195 | `${leg}-scale`, `-scale-off-tolerance`, `-scale-page-only` (±0.05, ±0.5) | refuse | `near(…, 0.01)` | honest deviation **0.0000** on all 9 | 0.04 / 0.49 |
| 222 | `accept-clamp-delta-edge-0.4` | must-accept | `sum` within ±0.5 | dev **+0.4000** on all 9 | **0.10** |
| 223 | `accept-in-anchor-1px` | must-accept | `wheel-anchor`, ±1 | off 1 when honest 400, 0 when honest 399 | 0 |
| 224 | `accept-zero-scale-edge` (+0.009) | must-accept | `near(…, 0.01)` | 0.009 | 0.001 |
| 208/210 | `in-wheels-count-3` / `default-wheels-count-2` | refuse | wheel count | sum preserved exactly by folding into `w[1]`/`w[0]` | exact |

Notes for r73, in order of how close they are to biting:

1. **line 222 (`accept-clamp-delta-edge-0.4`)** is the mirror image of line 159 on the delta law:
   it holds only because the honest law deviation measured **exactly 0.0000** on all 9 receipts. A
   future receipt whose clean-but-nonzero deviation exceeded 0.1 would push 0.4 to >0.5 and turn
   this must-accept case red — a false red on an honest receipt. The robust form is to place the
   mutant at a fixed distance **from the law** (`deltaY += (0.45 - (lawSum - law)) / scale`) rather
   than a fixed offset from the honest value.
2. **lines 162/164/165** have the same shape with a 0.3 margin (0.8 offset vs 0.5 tolerance); also
   robust only while the honest deviation stays under 0.3.
3. **lines 158 and 223** are relative to a value that jitters ±1. 158 survives because 5−1−1=3 px
   remain; 223 survives only because the honest X set is {399,400} — pinning it to `AT.x + 1 = 401`
   would make it explicit and also remove any dependence on the receipt.
4. The same jitter is the counter's **own** margin problem: `wheel-anchor` tolerance is ±1 and the
   honest anchor set already contains a 399 in every receipt, so the check has zero headroom. A run
   recording 398 or 402 on an honest event would make the positive run red. Not amendable this
   round (frozen); recorded for the r73 counter/case design, not as an amendment proposal.

---

## 5. Risks and blockers

* **No blocker for this seat.** Every assigned measurement ran; scratch was removed after the
  receipts were copied into this directory.
* The C1 leg-(c) red is reproduced, explained (§2) and is **not** a counter or driver defect on the
  observed receipts: counter 0 red checks over 9 receipts × 94 checks; driver 9/9 exit 0 with
  `predicate true`. The frozen claim stays an honest stop; this seat did not touch it.
* Repetition scope: 3 new cold runs, sequential, single-Chromium. They add 3 receipts to the 6
  committed; they do not exhaust the jitter distribution — the case red rate estimate (3/9 = 33%)
  is driven by the 399/400 split of the first in-leg wheel, which is 3/9 here.
* `--work` / `--scratch` / `--out` all absolute; loopback ports free-picked and passed explicitly;
  no `/tmp` path appears in any receipt or command captured here.

## 6. Tooling

No installs and no upgrades. Used system `node v24.21.0` and `/usr/bin/chromium`
(Chromium 155.0.8059.84 Arch Linux), both already present.

## 7. Evidence index (this directory)

| file | what it is |
|---|---|
| `d1..d3.receipt.json`, `.driver.{out,err,exit}`, `.counter.{json,exit}`, `.battery.{json,exit}`, `.nonce.txt`, `.ports.txt` | the 3 cold runs and their scoring |
| `battery-frozen-<r>.json/.exit`, `battery-proposed-<r>.json/.exit`, `battery-widened-<r>.json/.exit` | 27 battery runs (3 variants × 9 receipts) |
| `red-rate.json` | per-case pass/fail matrix over 9 receipts |
| `per-check.json` | per-check boolean matrix over 9 receipts (94 ids, 0 red) |
| `wheel-coords.json` | every wheel of legs `in`/`clamp`/`default` per receipt (x, y, deltaY, scale, ts) |
| `variant-summary.json` | frozen/proposed/widened per receipt, case-level |
| `relative-mutation-scan.json` / `.txt` | 16 relative mutations × 9 receipts, static re-derivation |
| `negatives-synthpinch-proposed.mjs` | proposed r73 battery (only `in-wheel-anchor-2px` changed) |
| `negatives-synthpinch-proposed.diff` | unified diff against the frozen battery |
| `check-synthpinch-widened-tol3.mjs` | counter copy, `wheel-anchor` tolerance 1→3 (kill-power proof) |
| `run3.sh`, `sweep.sh`, `scan.mjs`, `coords.mjs`, `measure.mjs` | the exact method scripts that produced the above |
