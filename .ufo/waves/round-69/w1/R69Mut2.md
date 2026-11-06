HOLD

# R69Mut2 — mutation test of the frozen C2 counter (`chromium-synth-scroll-gesture-linux`)

HOLD = the counter itself is not falsified (21/26 mutants killed, every kill for the designed
reason), but the battery's 44/44 *coverage* claim is refuted for four checks: four single-point
weakenings of `scripts/check-synthscroll-r69.mjs` survive all 44 negatives and still accept a
receipt the real counter rejects. One further survivor is a true equivalent mutant (redundant
check), not a battery defect. Nothing outside my wave dir was written.

## Instruments (pinned before and after)

| instrument | sha256 before | sha256 after |
|---|---|---|
| `scripts/check-synthscroll-r69.mjs` (counter, production) | `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795` | `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795` |
| `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json` | `587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8` | `587100d9e71ab58612abcb3659e4e52df9cf818c2d152114470f789539c667f8` |
| `scripts/negatives-synthscroll-r69.mjs` (battery) | read-only, not copied into any mutant | unchanged |

Counter bytes were copied to scratch (same sha), mutated **only in copies**, never in place.

## Baseline (positive control, pristine counter)

```
node scripts/negatives-synthscroll-r69.mjs \
  --real corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json \
  --counter <scratch>/counter-pristine.mjs --work <scratch>/work-baseline --out w1/R69Mut2/m0-baseline.json \
  --laundered .ufo/waves/round-69/controls/c2-degenerate/{js-scroll,dispatch-wheel,skip-touch}-receipt.json
→ {"negatives":44,"refusedForExpectedReason":44,"positiveOk":true,"failed":[]}  exit=0
```
44 negatives = 40 forged receipts + 1 wrong-pin probe + 3 laundered degenerate receipts.
A baseline failure would have been inconclusive; it held, so the campaign is attributable.

## Method

26 mutants, each a **separate file**, each differing from the pristine counter by exactly one
hunk (2–4 changed lines; verified: `all_single_hunk=true` in `mutants.manifest.json`).
Every mutant was run through the *unmodified* battery on the same scored receipt and the same
three laundered controls, with `--counter <mutant>`.

Two anti-credulity rules applied before any kill was credited:

1. **Instrument pin.** Each battery result records `counterSha256`; I asserted it equals
   `sha256(mutant file)` for all 26 runs, so a kill cannot come from the pristine counter
   still being the one executed.
2. **Wrong-reason refusal is not a kill.** A kill counts only if a greened negative's
   `expectId` equals the id of the check I actually mutated. All 21 kills pass this test;
   the battery's own id-specificity (`exit 1 AND reports expected finding id`) agrees.

Positive control (`positiveOk`) is `true` in **all 26** mutant runs, i.e. no kill comes from
breaking the good receipt — kills are genuine detecting negatives.

## Results — 21 killed / 4 battery gaps / 1 equivalent (score 21/26 = 80.8%, 21/25 = 84.0% equivalence-adjusted)

| # | mutant (one point) | mutated check | result | negatives that greened |
|---|---|---|---|---|
| m01 | predicate check `=== true` → `\|\| hypothesis === 'CONFIRMED'` | `producer-predicate-true` | killed | producer-predicate-false |
| m02 | `gesture-params` predicate → `true` | `gesture-params` | killed | gesture-param-source-swapped |
| m03 | `no-other-input-producer` → `true` | `no-other-input-producer` | killed | wheel-producer-injected, laundered-dispatch-wheel |
| m04 | `no-script-scroll` → `true` | `no-script-scroll` | killed | script-scroll-injected |
| m05 | wheel-sum tolerance `1e-6` → `1e9` | `leg-repeat-wheel-sum` | killed | repeat-wheel-sum-off |
| m06 | touch `scrollY===scrollYBefore` → `true` | `leg-touch-no-scroll` | killed | touch-scrolled |
| m07 | `minEnds` drops `repeatCount+1`, always 1 | `leg-repeat-scrollend` | killed | repeat-scrollend-short |
| m08 | teardown closure conjunct → `true` | `teardown-closure` | killed | teardown-survivor |
| m09 | `event-seq` monotonicity → `true` | `event-seq` | killed | event-seq-gap |
| m10 | `legs-order` equality → `true` | `legs-order` | killed | legs-reordered |
| m11 | predicate polarity: `typeof === 'boolean'` (accepts `false`) | `producer-predicate-true` | killed | producer-predicate-false |
| m12 | other-`Input.*` filter exempts `Input.dispatchMouseEvent` | `no-other-input-producer` | killed | wheel-producer-injected, laundered-dispatch-wheel |
| m13 | send-log `ids` length-only (drop `1..n` shape) | `send-log-ordered` | killed | send-log-id-gap |
| m14 | final scrollY `=== 900` → `>= 0` | `page-final-scrollY` | killed | final-scrollY-forged |
| m15 | gesture count `=== 4` → `>= 1` | `gesture-call-count` | killed | gesture-dropped, gesture-duplicated, laundered-skip-touch |
| m16 | driver sha pin check disabled (`if (false && expSha)`) | `driver-sha256-pin` | killed | driver-sha-pin-wrong |
| m17 | `all-events-trusted` `every` → `some` | `all-events-trusted` | killed | event-untrusted |
| m18 | mouse-class leg also permits `pointermove` | `leg-mouse-only-wheel-scrollend` | killed | mouse-pointer-planted |
| m19 | `degenerate === null` → `true` | `scored-run-not-degenerate` | killed | degenerate-flag-set |
| m20 | dispatch range upper bound `<= hi` dropped | `leg-mouse-dispatch-range` | killed | mouse-dispatch-outside-range |
| m26 | event-leg check loses monotonicity (keeps label-known) | `event-legs-known-monotone` | killed | event-leg-relabelled |
| **m21** | scrollYBefore check skipped for every leg but `default` | `leg-mouse-scrollY-before` | **SURVIVED — battery gap** | — (44/44 still refused) |
| **m22** | absolute scrollY check skipped for every leg but `mouse` | `leg-touch-scrollY` | **SURVIVED — battery gap** | — (44/44) |
| **m23** | wheel-present check skipped for every leg but `mouse` | `leg-repeat-wheel-present` | **SURVIVED — equivalent (redundant)** | — (44/44) |
| **m24** | wheel-direction check skipped for every leg but `default` | `leg-repeat-wheel-direction` | **SURVIVED — battery gap** | — (44/44) |
| **m25** | `nonce-shape` regex check → `true` | `nonce-shape` | **SURVIVED — battery gap** | — (44/44) |

Per-mutant battery receipts: `m01_*.json` … `m26_*.json` (each carries `counterSha256`,
`positiveOk`, `negatives`, `refusedForExpectedReason`, `failed`). Mutant sources are beside them;
the unified diff of all 26 against the pristine counter is `mutants.diff`.

## The four battery gaps (defect escapes, with discriminating receipts)

Each gap is proved by a receipt that the **pristine** counter rejects and the **mutant** accepts
with zero findings — so the survivor is not an artifact of "the battery just lacks a negative",
it is a real acceptance of a forged receipt. Recipes and outputs are in
`survivor-discriminators.json`; the receipts are `d*.json` in this directory.

### G1 — per-leg `scrollYBefore` only exercised on the `default` leg
`check('leg-'+plan.name+'-scrollY-before', …)` is generated for all five legs, but the battery's
only negative (`default-before-forged`) targets `default`.
`d21_start_scrollybefore.json` = scored receipt with `start.scrollYBefore = 5`:
```
node scripts/check-synthscroll-r69.mjs --receipt .ufo/waves/round-69/w1/R69Mut2/d21_start_scrollybefore.json --json
→ exit 1  findings=['leg-start-scrollY-before']         (pristine)
→ exit 0  findings=[]                                   (m21_scrollybefore_only_default)
```

### G2 — absolute `scrollY` expectation only exercised on the `mouse` leg
FIXED per `FROZEN` (`start:0 mouse:600 default:300 repeat:900 touch:900`); only
`mouse-scrollY-forged` exists. `d22_start_scrolly.json` = `start.scrollY=5`,
`mouse.scrollYBefore=5`, one mouse wheel `deltaY 600→595` (sum still equals the leg delta),
mouse dispatch `scrollYAtDispatch` clamped to ≥5:
```
→ exit 1  findings=['leg-start-scrollY']                (pristine)
→ exit 0  findings=[]                                   (m22_abs_scrolly_only_mouse)
```
(`default`/`repeat` absolutes are additionally pinned by the `prevY` chain and wheel-sum;
`start` is the cheap escape — one forged field plus one compensating field.)

### G3 — `wheel-direction` only exercised on the `default` leg
`d24_repeat_wheel_sign_flip.json` = repeat wheels `[6]→-100`, `[6]→112` (leg wheel sum preserved
at 600, so wheel-sum stays green while the direction of one deltaY inverts):
```
→ exit 1  findings=['leg-repeat-wheel-direction']       (pristine)
→ exit 0  findings=[]                                   (m24_wheel_direction_only_default)
```

### G4 — `nonce-shape` (regex shape) never exercised, only `nonce-on-page` binding
`d25_bad_nonce_shape.json` = `nonce` and `nonceOnPage` both `XYZ`, and every served `/` row's
`run` rewritten to `XYZ` so the binding check stays satisfied:
```
→ exit 1  findings=['nonce-shape']                      (pristine)
→ exit 0  findings=[]                                   (m25_drop_nonce_shape)
```
A laundered receipt with a malformed nonce would pass a counter that dropped the shape regex.

## The one equivalent mutant (not a battery defect)

### R1 — `leg-<leg>-wheel-present` is implied by `leg-<leg>-wheel-sum`
For every non-touch leg the scroll delta is non-zero (`mouse +600, default −300, repeat +600`)
and `wheel-sum` compares the sum of present wheel events against exactly that delta. Removing all
wheels yields a sum of `0`, so `wheel-sum` fires on any receipt that would violate
`wheel-present`. Demonstrated with `d23_default_wheels_removed.json`:
```
→ pristine exit 1  findings=['leg-default-wheel-present','leg-default-wheel-sum']
→ m23       exit 1  findings=['leg-default-wheel-sum']
```
No receipt can violate `wheel-present` in isolation within this schema, so m23 is a true
equivalent mutant. Suppressing `wheel-present` is also *safe* in the presence of `wheel-sum`,
which is why its absence from the battery is defensible — unlike G1–G4, where the escape is
demonstrable.

## Calibration notes (r66–r68 lessons)

- **Not bookkeeping.** I do not score the campaign as "48 checks vs 44 negatives = 4 gaps".
  Each survivor is adjudicated by an executed discriminating receipt; only four of five
  survivors are real escapes, and the fifth is scored as equivalent with a proof receipt.
- **Disposition meaning is countable only through escape.** `m23` "surviving" looks like a gap
  by count and is not one; `m21/m22/m24/m25` look the same by count and are.
- **Pin instrument bytes.** Counter sha asserted before, after, and per-run
  (`counterSha256 == sha256(mutant)`); kills credited only to the intended mutant.
- **Wrong-reason refusal.** Kill credit requires the greened negative's `expectId` to equal the
  mutated check's id; all 21 kills are source-location-specific. `m03/m12` and `m15` also killed
  laundered controls (`laundered-dispatch-wheel`, `laundered-skip-touch`), which is the strongest
  signal in the set.
- **No counter falsification.** The 21 kills show the counter's checks are individually load
  bearing where the battery looks; the 4 gaps are a battery-completeness defect, not a counter
  defect — the production counter still rejects every forged receipt above (each pristine run
  exits 1).

## Restoration evidence

- Production counter mutated: **never** (only copies under `/fast/scratch/.../mutants/`).
  sha256 before == after == `c1b3763c…da795`.
- Scored receipt byte-identical before and after (`587100d9…67f8`).
- Every mutant's sha256 is listed in `mutants.manifest.json` (26 entries, all `hunks=1`) and is
  reproduced inside the corresponding `m*.json` battery receipt as `counterSha256`.
- Scratch `/fast/scratch/hyaku/tabi-r69/R69Mut2` deleted after the receipts were copied here.

## Reproduce one mutant end-to-end

```bash
mkdir -p /fast/scratch/hyaku/tabi-r69/R69Mut2 && cd /fast/scratch/hyaku/tabi-r69/R69Mut2
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-synthscroll-r69.mjs \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json \
  --counter /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Mut2/m21_scrollybefore_only_default.mjs \
  --work /fast/scratch/hyaku/tabi-r69/R69Mut2/work-m21 \
  --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Mut2/m21_scrollybefore_only_default.json \
  --laundered /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/controls/c2-degenerate/js-scroll-receipt.json \
  --laundered /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/controls/c2-degenerate/dispatch-wheel-receipt.json \
  --laundered /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/controls/c2-degenerate/skip-touch-receipt.json
echo "exit=$?"   # 0 = mutant survives the battery  (killed mutants exit 1)
```

## Files

| file | contents |
|---|---|
| `verdicts.json` | 26 verdicts, pinned to counter + receipt sha, with per-mutant greened negatives |
| `mutants.diff`, `mutants.manifest.json` | unified diff and per-mutant sha/hunk accounting |
| `m01…m26_*.mjs` | the 26 single-point mutant counters |
| `m0-baseline.json` | pristine 44/44 baseline |
| `m01_*.json` … `m26_*.json` | battery receipts per mutant |
| `survivor-discriminators.json`, `d21…d25_*.json` | escape proofs for the survivors |

No git/jj mutation was performed; the "commit" of diffs and summary is the persistence of the
files above. No Chromium run, no driver re-pin, no sibling file touched.
