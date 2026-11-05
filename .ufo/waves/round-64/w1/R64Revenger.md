# R64Revenger — independent reconstruction of the r64 pixel evidence and the r63 red-before

Seat: `R64Revenger` (revenger, wave w1, round 64, lane `tabi-shokunin`).
Assignment: reconstruct in **another language** what the r63 generation could not do and what
the r64 pixels prove — without lane code.

Frozen pins were verified before any measurement and all ten match `claims.json`
(`counter-runs/pins.txt`; e.g. driver `1ff560cc…b92db5`, counter `5cc3c8dd…4c5f01b7`,
live verifier `87a1a7c3…3561a68a`). Baseline `6c19979f` has no r64 driver and no
`corpus/evidence/round64/` (`git cat-file -e 6c19979f:scripts/chrome-cdp-loopback-round64.mjs`
→ exit 128; `git ls-tree -r --name-only 6c19979f -- corpus/evidence/round64/ | wc -l` → 0).

## Independence statement

`verify_pixels.py` (this directory) imports **only** `hashlib, json, os, struct, sys, time, zlib`.
It does not import, execute, spawn, transpile or copy any lane module; it never invokes `node`.
Everything it checks is re-derived here:

* the PNG decoder (chunk walk, CRC32, inflate, filters 0–4, colour types 0/2/6 at depth 8) is
  written from RFC 2083, not lifted from `counters/png-r64.mjs`;
* the 256-cell grid is recomputed as `sha256(nonce)` → first 32 bytes → 256 bits, MSB first;
* the band arithmetic is recomputed as `floor((scrollY + y) / 120) mod 6` over a hand-transcribed
  six-colour table;
* the witness strip and its sample point come from the fixture HTML that sits inside the pinned
  driver (`#witness { left:900px; top:600px; width:200px; height:50px }`), read as text;
* the fixture bytes are **re-rendered in Python** from the pinned driver source by string
  substitution (`__NONCE__`, `__BANDS__`, the digest line) and hashed — giving
  `7386fc4ec5ab…d07e96b`, equal to `receipt.fixture.sha256`, so the nonce→fixture binding is
  independently reproducible without running the driver;
* all 29 counter predicates are re-implemented from their documented intent
  (`predict_findings`) and compared against the Node counter's own output on eight receipts
  (`agreement.txt`): **8/8 exact matches, same ids in the same order** (0, 4, 2, 4, 0, 14, 0, 0).

The scroll derivation below is the one place where the two languages were deliberately kept
apart: the pixel-only answer is computed first, then compared with the receipt.

## Per-leg output (committed smoke shots)

`python3 verify_pixels.py --receipt .ufo/waves/round-64/controls/smoke/receipt.json --shots
.ufo/waves/round-64/controls/smoke --driver scripts/chrome-cdp-loopback-round64.mjs --predict
--json-out pixels-smoke.json` → exit 0, verdict `pass`. Full JSON in `pixels-smoke.json`.

nonce `tabi-r64-smoke-design`, `sha256 = 1431b9e2edb7431eef78e01d32286ad9f7531e76eb29b4ca98e85525a2dbc639`,
133 of 256 grid cells lit.

| leg | shot bytes | sha256 (12) | 256-cell grid | band RGB at y=60/180/300/420 (x=1000) | witness (1000,625) | scroll from pixels | pixel-identical candidates |
|---|---|---|---|---|---|---|---|
| start | 6332 | `327236cb1e76` | 256/256 | 255,0,0 · 0,128,0 · 0,0,255 · 255,255,0 | 10,20,30 | **0** | 0, 720, 1440 |
| down1 | 6300 | `9306a25be929` | 256/256 | 0,128,0 · 0,0,255 · 255,255,0 · 255,0,255 | 40,50,60 | **120** | 120, 840, 1560 |
| down2 | 6310 | `ac3ed4da4fcf` | 256/256 | 0,0,255 · 255,255,0 · 255,0,255 · 0,255,255 | 70,80,90 | **240** | 240, 960, 1680 |
| up1 | 6305 | `8de483b60694` | 256/256 | 0,128,0 · 0,0,255 · 255,255,0 · 255,0,255 | 100,110,120 | **120** | 120, 840, 1560 |
| swallowed | 6305 | `682f34316cb1` | 256/256 | 0,128,0 · 0,0,255 · 255,255,0 · 255,0,255 | 130,140,150 | **120** | 120, 840, 1560 |
| released | 6313 | `49bffc630d0a` | 256/256 | 0,0,255 · 255,255,0 · 255,0,255 · 0,255,255 | 160,170,180 | **240** | 240, 960, 1680 |

Beyond the counter's own samples, each leg was checked strictly:

* **dimensions** 1280×900 for all six; **sha256 and byte count** equal the receipt's
  `shotSha256`/`shotBytes`; **six distinct digests**, none shared.
* **grid**: not just the 4×4 cell centres — all 4096 pixels of the 128×32 grid box were verified
  against `sha256(nonce)` (white inside a lit cell, black elsewhere): 0 errors on every leg.
* **bands**: all 885 band rows of the clean column `x=700` equal one global scroll offset; the
  colour-change rows are exactly `120, 240, 360, 480, 600, 720, 840` (phase 0 mod 120) on every
  leg; 0 wrong-band rows.
* **witness**: all 10 000 pixels of the 200×50 strip equal the leg colour (not only the single
  sample point), and the pixels immediately outside the box are band colour.
* **fixture re-render**: `7386fc4e…d07e96b` matches the receipt, from Python string substitution.

### Scroll re-derived from pixels alone

Two independent pixel signals are intersected:

1. *geometry* — colour changes sit on viewport rows ≡ 0 (mod 120) ⇒ `scrollY ≡ 0 (mod 120)`;
2. *palette* — one sample row fixes a 120 px window (`floor((scrollY+y)/120) mod 6`), and the
   four rows at 60/180/300/420 narrow it to 120 of the 720 offsets in the period.

Intersection → one residue per leg, equal to the receipt on **all six legs** (0/120/240/120/120/240).
No leg disagrees.

A fresh live driver run by this seat (`--nonce tabi-r64-revenger-one`, 3.95 s) gives the same
six values with a different nonce, so the verifier is not fitted to the committed nonce
(`pixels-live-sample.json`, `live-sample/`).

## Red-before reconstruction

Both counters were run on the same inputs; nothing was rewritten.

| input | r63 counter | r64 counter |
|---|---|---|
| committed r63 receipt + its 4 shots (`corpus/evidence/round63/chromium-wheel-scroll/`) | **exit 0**, 0 findings | **exit 1**, 14 findings |
| same receipt with four 70-byte 1×1 PNGs (built here) | **exit 0**, 0 findings | **exit 1**, 14 findings |

Commands (both in `run_all.sh`, outputs in `counter-runs/`):

```
node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json \
  --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 \
  --shot corpus/evidence/round63/chromium-wheel-scroll --json          # exit 0
node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json \
  --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 \
  --shot corpus/evidence/round63/chromium-wheel-scroll --json          # exit 1
```

r64 findings on the r63 receipt (14, and my Python predictor reproduces the list exactly):
`schema, nonce-binding, driver-binding, fixture-binding, loopback-origin, launch-guards,
shot-records, shot-bytes, nonce-pixels, scroll-pixels, leg-witness, server-witness,
host-identity, survivors`.

**What the r63 counter accepted that r64 refuses.** The r63 `shot-bytes` check is
`sha(bytes) === s.sha256 && bytes.length === s.bytes && PNG signature && IHDR width>0 && height>0`
(`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs`, `main()`). It never decodes a pixel, never
compares a dimension to the fixture viewport, never requires the shots to differ, and never binds
the shot to the leg. Consequently:

* **four 1×1 PNGs, all identical, digest-consistent → exit 0.** Reproduced here from scratch
  (`counter-runs/r63-counter-on-one-by-one.json`, exit 0) with the same receipt the r64 counter
  refuses with 14 findings. This is the exact class the round's r63 spot-check recorded.
* **the committed r63 shots are 1280×813 while the r63 receipt declares `viewport 1280×900`** —
  an internal contradiction that no r63 check looked at. r64's `shot-bytes` compares both
  dimensions to `VIEWPORT`.
* **3 of the 4 committed r63 steps share one digest** `c8de4967…` (`distinct_step_digests = 2`
  over 4 steps): the shot set was already borrowed inside itself, and the r63 counter accepted
  the duplication because it compares each step only to its own recorded digest.
* **the r63 fixture has nothing to bind to**: no `#noncegrid`, no `class="band"`, no `#witness`,
  no `__nonceBits` hook (`r63_fixture_has_* = false`). Decoding `a-wheel-down.png` (1280×813) in
  Python: all 256 grid cell centres are gradient (`254,254,255`), the four band rows are
  `253/252/250/249,*,255` — a smooth `#fff→#ddf` gradient, i.e. a 1–2 unit shift per 120 px —
  and `(1000,625)` is `247,247,255`. Nothing in those pixels encodes a leg or a scroll position.
* **fields r64 requires and r63 lacks**: `legs[].shot`, `legs[].shotSha256`, `legs[].shotBytes`,
  `legs[].witness`, `legs[].witnessRgb`; `host.cdpProduct`; `fixture.deviceScaleFactor`,
  `fixture.bandHeight`; `serverLog[].run` and `serverLog[].status`; `teardown.sweepError`;
  `argv` without `--force-device-scale-factor=1`; schema `tabi-chrome-cdp-r63`.
  `pageState.scrollEvents = 4` does satisfy both generations, so the delta is not there.

The r63→r64 change is therefore not "more fields": it is that four of the r64 checks
(`nonce-pixels`, `scroll-pixels`, `leg-witness`, `shot-bytes`) read decoded pixels and compare
them to a per-leg expectation, which no field in an r63-shaped receipt can satisfy.

## What a forger must do, and the cost

To satisfy the six pixel checks without rendering:

1. `sha256(nonce)` → 256 bits; paint a 32×8 grid of 4×4 cells at (8,8) on a black 128×32 box.
2. For each leg's `scrollY`: fill 1280×900 with 120 px bands, colour
   `[(floor((scrollY+y)/120)) mod 6]` from the six-colour table.
3. Paint 900…1099 × 600…649 with the leg's witness RGB.
4. zlib-deflate with filter 0, write PNG, record `sha256`/`length`.
5. Re-render the fixture from the pinned driver by string substitution → `fixture.sha256`
   (pure text, no browser).
6. Author the remaining non-pixel fields (5-entry wheellog with the fixed deltas and
   `scrollYAtDispatch`, `serverLog` with `run = nonce`, teardown/sweeps/host strings).

All constants are in the repository (`counters/chromium-wheel-r64.mjs`, the fixture HTML in the
driver) — there is no secret. My implementation of steps 1–4 is ~40 lines of the verifier and
measured here:

| path | wall | peak RSS | needs |
|---|---|---|---|
| Python forge of six 1280×900 shots (`phase_forge`) | **0.17 s** | **37 MB** | python3 + zlib |
| one real driver run (same 6 shots, same receipt shape) | **3.95 s** (re-run 4.02 s) | **224 MB** | Chromium 155 + loopback server + CDP |

Both were then fed to the frozen counter: **python-forged shots → exit 0, 29 checks, 0 findings**
(`counter-runs/r64-counter-on-python-forged.json`); the real run → exit 0. Host load at
measurement: 20.3 on 32 cores; the driver's own comment warns Chromium startup can take minutes
under fleet load, so the real-run figure is a best case.

**Forging is cheaper — roughly 24× in wall time and 6× in memory, and it removes the browser, the
ports and the failure modes entirely.** That is the honest answer: the pixel checks raise the
price of a forgery (an r63-shaped receipt cannot pass at all) but they do not make forgery dear.
They cannot, because they are a predicate over bytes, and bytes are cheap. The round's own
`red-synthetic-rendering` control (exit 0) already discloses this; this seat reproduces the same
class with independently written bytes and prices it.

What the forger still cannot fake is *execution*: only `scripts/verify-live-r64.mjs` re-runs the
driver twice cold. That is the load-bearing part of C1, exactly as the claim's `limits` state.

## Findings

1. **[info] The committed smoke pixels pass every check independently, and the pixel-derived
   scroll equals the receipt on all six legs.** Evidence: `pixels-smoke.json`; grid 4096/4096 px
   per leg, 885/885 band rows per leg, 10 000/10 000 witness pixels per leg, fixture re-render
   `7386fc4e…` equal to the receipt. Command: `bash .ufo/waves/round-64/w1/R64Revenger/run_all.sh`.
2. **[low] `scroll-pixels` constrains scroll only modulo 720 px.** The palette period is
   6×120 = 720 and the four sample rows are exactly 120 apart, so one shot is pixel-identical for
   `scrollY`, `scrollY+720`, `scrollY+1440` (candidates listed per leg above; all ≤ max scroll
   2115). Absolute scroll is *not* a pixel fact; it is pinned only by the receipt's own wheellog
   deltas and `scrollYAtDispatch`. A receipt claiming `down1 = 840` would present the same pixels
   and would fail only `scroll-arithmetic`/`target-binding`, not `scroll-pixels`.
   Evidence: `pixels-smoke.json` → `legs[*].scroll_derived.candidates_in_doc_range`.
3. **[low] The fixture paints a horizontal scrollbar in the bottom 15 rows** (y = 885…899,
   `252,252,252` track / `139,139,139` thumb) because `#tall{width:1280px}` overflows the layout
   width left by the vertical scrollbar. All four counter sample rows are above it, so the counter
   cannot see it, and a forgery that omits the scrollbar entirely is indistinguishable to the
   counter (finding 5). Not a defect in the claim; a rendering fact worth knowing before anyone
   tightens `scroll-pixels` to a full-column check. Evidence: `pixels-smoke.json` →
   `legs[*].bands.overlay_rows = 15`, `overlay_row_range = [885, 899]`.
4. **[medium] Six Python-generated PNGs satisfy all 29 counter checks: 0.17 s, no browser.**
   `counter-runs/r64-counter-on-python-forged.json` → exit 0, 0 findings, 29 checks. This
   reproduces the disclosed limit with bytes written by this seat (not by the counter's own
   `drawShot`), and prices it. Consequence for C1: receipt acceptance is not execution evidence;
   the demonstration is entirely `verify-live-r64.mjs`. The claim says this; this finding
   confirms it is load-bearing rather than theoretical.
5. **[medium] The r63 counter accepts four identical 70-byte 1×1 PNGs (exit 0); the r64 counter
   refuses the same receipt (exit 1, 14 findings).** `counter-runs/r63-counter-on-one-by-one.json`
   and `counter-runs/r64-counter-on-one-by-one.json`. Exact commands in "Red-before
   reconstruction". This is the round's red-before, re-derived end-to-end from the frozen bytes.
6. **[low] The committed r63 shots are 1280×813 while the r63 receipt declares 1280×900**, and
   the r63 counter compared no dimension (only `IHDR width>0 && height>0`). r64's `shot-bytes`
   compares both. Evidence: `pixels-smoke.json` → `r63.steps[*].dimensions = [1280, 813]` for all
   four steps, against `corpus/evidence/round63/chromium-wheel-scroll/receipt.json` →
   `fixture.viewport = {width:1280, height:900}`. Reproduce with
   `python3 verify_pixels.py --receipt corpus/evidence/round63/chromium-wheel-scroll/receipt.json
   --shots corpus/evidence/round63/chromium-wheel-scroll --driver
   scripts/chrome-cdp-loopback-round64.mjs --r63-receipt <same receipt> --r63-shots <same dir>
   --r63-driver scripts/chrome-cdp-loopback-round63.mjs --predict`.
7. **[low] The live verifier does not pin the driver it runs.** `verify-live-r64.mjs:40-51`
   computes `driverSha = sha(fs.readFileSync(driver))` and passes that as
   `--expect-driver-sha256`, i.e. the pin is derived from the very file being executed, never
   compared to a constant. The freeze pin (`1ff560cc…`) is enforced only by `claims.json` and by
   the caller's argv. Anyone running the verifier with a modified driver gets a self-consistent
   green. This is the claim's "its own runs are the same driver it verifies" limit, stated
   precisely; the L1 should keep the pin comparison in the scored invocation.
8. **[low] The live verifier's evidence agreement does not cover shot bytes.** `pick()` compares
   only `[name, scrollY, wheellogLen, witnessRgb]`, plus wheellog shape and pageState. A committed
   evidence receipt whose six shots were forged (finding 4) but whose non-pixel fields match a
   live run passes `evidenceAgreement`, because the evidence receipt also passes the counter. So
   the committed shot bytes are unauthenticated by the demonstration instrument — again exactly
   the claim's `limits`, now with a measured cost (0.17 s).
9. **[info] My Python re-derivation of the 29 checks matches the Node counter on eight receipts**
   — 0/4/2/4/0/14/0/0 findings, identical ids in identical order (`agreement.txt`). One
   semantic trap it caught: `survivors` requires `sweepError` to be **present and exactly null**
   (`!== null` in JS), so an absent key fails while `null` passes; my first Python version
   conflated absent with null and predicted 13 findings instead of 14. The check is correct as
   written; the note is for anyone porting it.
10. **[info] A fresh live run by this seat passes both instruments** (`--nonce
    tabi-r64-revenger-one`, exit 0, counter exit 0, Python verdict `pass`, six derived scroll
    values equal to the receipt). `live-sample/` + `pixels-live-sample.json`. This is this seat's
    own design data, **not** scored evidence — the scored after-pass is the post-freeze live pass.

## Verdict

**The r64 pixel evidence is real and the reconstruction is faithful.** Every committed smoke shot
decodes in pure Python to exactly what the receipt claims: 1280×900, a 256-cell grid equal to
`sha256("tabi-r64-smoke-design")` (including all 4096 box pixels, not just the sampled centres),
band colours consistent with one global scroll offset, and a 200×50 witness strip equal to the
leg's table entry — and the scroll position re-derived from pixels alone matches the receipt on
all six legs. The nonce→fixture binding is reproducible without running the driver.

**The r63 red-before is exactly as claimed, and reproducible in both directions.** The same
committed receipt — and, more sharply, the same receipt with four identical 1×1 PNGs — is exit 0
for the r63 counter and exit 1 with 14 findings for the r64 counter. The r63 counter never
decoded a pixel, never compared a dimension, and never required the shots to differ; its own
committed shots are 1280×813 against a declared 1280×900 and 3 of 4 share one digest.

**The pixel checks raise the price of a forgery but do not make it dear.** Six shots satisfying
every pixel predicate cost 0.17 s and 37 MB in Python versus 3.95 s and 224 MB for a real driver
run, and the frozen counter accepts both with 0 findings. C1's coverage therefore rests entirely
on `verify-live-r64.mjs` re-running the driver, and two soft spots in that instrument are worth
the L1's attention: it derives the driver pin from the file it executes (finding 7) and its
evidence agreement ignores shot bytes (finding 8). Neither is a kill under the stated rules — the
scored invocation supplies the pinned driver and the receipt still has to pass the counter — but
both are the kind of gap a next-generation attack would aim at.

No frozen instrument was modified; no tool was installed (none was needed); scratch was removed.
