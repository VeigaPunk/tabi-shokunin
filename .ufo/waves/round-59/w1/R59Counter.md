# R59Counter — the r59 Chromium receipt counter generation (C2, counter side)

Seat: `R59Counter` (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane base revision: `4e7fb89d7b71a6fdf661680891440be6577759e8`.
Claims read first and never amended: `.ufo/waves/round-59/claims.json` (frozen at
`dd337bb3`, pre-data corrections `8e740a08`, `a40822d9`, `e7cc1331` — C2 restated as
the KEY-EVENT DELIVERY-BOUNDARY measurement with the latch as a MEASURED NEGATIVE).
No git/jj mutation was made by this seat. No live browser was launched by this seat.

## FREEZE PIN

**`chromium-receipt-r59.mjs` sha256 = `b287cfa21bfb9193a445c293d52aceebae99412191fd588c184c82078bee5136`**
(`--self-check` prints the same digest from the committed path).

Two writes, both disclosed: the first complete build was
`35461bbeb9e26981941d5b597b16c8138181ebdb919c06d53dbdc44f81bf9332` (90/90, green on
the runner's smoke1/smoke2). The L1 then requested a **pre-freeze D1 strengthening**
after R59Probes' `probes/d6-six-entries.json` proved the existence-by-value rule
maskable on non-unique control entries (a forged page flag on control digit 7/5 or the
chord's Control stayed green behind equal-valued twins). The strengthening is the
committed bytes above (91/91) and is **not a claim change** — it is the same f4/D1
check, made positional + occurrence-counted.

## What the counter is

The r58 counter (`round-58/counters/chromium-receipt-r58.mjs`, read in full, never
edited) copied and extended with EXACTLY the declared C2 change set:

1. **Generation relabel** to `tabi-chrome-cdp-r59` / `^tabi-r59-[0-9a-f]{12}$`, and the
   embedded **18-step declared plan**, pinned from R59Runner's frozen driver
   (`scripts/chrome-cdp-loopback-round59.mjs`, sha256
   `b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86`):
   `a-start .. l-swallow-enter` (12 carried) + `m-capslock-press1`,
   `n-capslock-letters1`, `o-capslock-press2`, `p-capslock-letters2`, `q-form2-chord`,
   `r-form2-echo`.
2. **D1 / f4 — `keylog-flag-mismatch`**, positional and occurrence-counted:
   every swallow-block keyDown entry's `(key, cancelable, defaultPrevented)` must match
   the page occurrence **that the block describes**. The counter locates the contiguous
   swallow run (the six block identities `key/code/keyCode` in derived step order,
   searched from the record's tail — no nonce needed, so it also works on a
   nonce-unusable receipt) and pairs the j-th block entry with the j-th run keydown,
   comparing the exact flags. This closes the d6 maskability class: a forged flag on
   the control digit/letter or the chord's Control, whose equal-valued twins sit in the
   carried legs, is refused. When the run is not recorded the fallback is **distinct
   occurrence matching** (each block entry consumes a distinct page occurrence of its
   triple — stronger than existence, order-independent).
3. **D2 / f2, f8 — `step-plan-mismatch`**: `steps[].name` AND `declaredStepNames` must
   each equal the embedded 18-step plan exactly (missing/extra/reordered), and each
   step's `png` basename must be `<name>.png` (the shot set is the plan).
4. **The CapsLock delivery boundary** (the restated claim's measured negative):
   - `caps-flag-true` (f5): the receipt must NAME `capsLatchExpected: false`; every
     page keydown/keyup must read `getModifierState('CapsLock') === false`; any true
     ANYWHERE (entry, structured leg, or the declared latch mirror `anyTrue` /
     `allFalse` / raw booleans / `sequence`) is refused. Polarity for the derived
     `acrossLetters*` booleans is "true = the negative holds" (the raw press booleans
     keep "true = violation").
   - `missing-delivered-shape-field` (f6): every CapsLock/letter page event must carry
     `type` (keydown/keyup), `key`, `code`, `keyCode` (or `windowsVirtualKeyCode` on
     the structured leg) and `cancelable`, with the required values (`keyCode 20`,
     `cancelable true`, `defaultPrevented false`; letters' derived identity).
   - `missing-getModifierState-record`: every page keydown/keyup must carry the
     recorder's boolean `capsLock` field.
   - `capslock-readback-missing`: the DOM value is read back after EVERY caps-leg
     keystroke — press1 = the pre-leg value, letters = prefix + accumulation,
     press2 = prefix + letters1.
   - `shift-detector-negative` (f9/R1): every page event whose DOM `shiftKey` is true
     must read a DEDICATED `getModifierState('Shift')` boolean (`shift`; aliases
     `shiftState`, `shiftModifier`, `getModifierStateShift`) true. The DOM `shiftKey`
     boolean is never accepted as the detector. A constant-false recorder therefore
     FAILS — that is what makes the CapsLock all-false record a measured boundary.
   - The caps leg's page keydown tail after the swallow chord is exactly
     `[CapsLock, l0, l1, CapsLock, l2, l3]`, letters derived from the nonce hex tail's
     `[a-f]` characters in order, cycled to four.
5. **form2 / D4** — `form2-missing`: `journey.form2` present, `chord` the derived
   Control (bit 2) + Enter pair with its `letterKeydown`, and a client-side
   `submitted: true` witness. **`echo2-count-wrong`** (f7): every log view
   (`journey.form2.newRequests`, `journey.form2.serverRequests`,
   `echo2Witness.serverRequests`, `journey.form.serverRequests`, `receipt.serverLog`)
   must carry exactly ONE `/echo2` whose query carries the nonce and no `field3`;
   form1 keeps exactly one `/echo` (the top-level count is EXACT-path `/echo`, so
   `/echo2` is not miscounted as a second submission).
6. **Selftest**: **91 path-backed cases** (r58's 78 carried + 13 new, one per new id,
   the f1–f9 probe shapes and the d6 masked-flag case), exact-findings assertions,
   full id coverage (58 ids), `--selftest` and `--path-selftest` (the latter refuses
   inline-only case sets).
7. **Cross-refusals**: the counter on the committed r57 and r58 receipts refuses with
   `schema-wrong` FIRST (receipts below).

New finding ids (9): `keylog-flag-mismatch`, `step-plan-mismatch`, `caps-flag-true`,
`missing-delivered-shape-field`, `missing-getModifierState-record`,
`capslock-readback-missing`, `shift-detector-negative`, `form2-missing`,
`echo2-count-wrong`.

## Artifacts (all under `.ufo/waves/round-59/counters/` unless noted)

| artifact | sha256 | what |
|---|---|---|
| `chromium-receipt-r59.mjs` | `b287cfa21bfb9193a445c293d52aceebae99412191fd588c184c82078bee5136` | THE counter (freeze pin) |
| `chromium-receipt-r59-fixtures/` (208 files, 6.6 MB) | manifest `fixtures-sha256.txt` `9f1b5447647dc653c5ffdf4fa089993a85109cc41548d201c22a78b4a2cfd12c` | 91 case specs + receipts + 18 plan PNGs + `driver-stub.mjs` + the non-PNG asset |
| `fixtures-sha256.txt` | `9f1b5447647dc653c5ffdf4fa089993a85109cc41548d201c22a78b4a2cfd12c` | sorted per-file sha256 of every fixture file |
| `selftest-final.json` | `cb990063465ad6f8347e5ba1e9a98371e6a433ca9e6f86576617f70d57a927f7` | `--selftest` 91/91 `allPass true`, id coverage 58/58 |
| `path-selftest-final.json` | `cb990063465ad6f8347e5ba1e9a98371e6a433ca9e6f86576617f70d57a927f7` | `--path-selftest` 91/91 (byte-identical output) |
| `cross-refusal-r57.json` | `05198c0fa14b3d6a61f33ccd404658ec5946fa86dcc62f1a8610f3dbaf94917a` | committed r57 receipt → exit 1, `schema-wrong` FIRST |
| `cross-refusal-r58.json` | `ff6e9730886f61764528b2d58d53add88e92e0ed026f1fe7154ae1e54d161e86` | committed r58 receipt → exit 1, `schema-wrong` FIRST |
| `d1-forged-fail.json` | `06edacdbb1c7fb3860c7e0e60844d5dde955db58f391263bd4453d7771f483ef` | the D1 proof at FOUR page occurrences: swallowed Backspace (unique), control digit 7, control digit 5, chord Control (the masked ones) — each single-flag flip adds exactly `keylog-flag-mismatch`, removes none |
| `f-probes-map.json` | `632fc872b9ec1afc96eaf3cd057084904cd8ebc135b9f6f5b09a8fa05488040c` | f1–f9 (+ the d6 masked case and the `/echo` count leg) → fixture + observed finding, all REFUSED |
| `smoke1-verdict.json` | `76e3671829aa79c207463c3f540a3191217b35e65374bbf89c6e81d08d04b49c` | counter on runner smoke1 → predicate true, findings [], cne [] |
| `smoke2-verdict.json` | `e3429e9c6d8d174d6f49e5c84e0a80e98831fe5663ab9a6e3548011ad3b927b0` | counter on runner smoke2 → predicate true, findings [], cne [] |
| `pin-ok-verdict.json` | `e3429e9c6d8d174d6f49e5c84e0a80e98831fe5663ab9a6e3548011ad3b927b0` | with `--expect-driver-sha256 b16ddb44…` → exit 0 |
| `pin-bad-verdict.json` | `905d7617be94adc30fb41ea0f7581725948e5a08a07a51a292c921ab3929a7cb` | with an all-zero pin → exit 1, `driver-sha-mismatch` (f3) |
| report | this file | `.ufo/waves/round-59/w1/R59Counter.md` |

The 91 fixture cases: 78 carried r58 case ids (one renamed, disclosed below) + 13 new:
`keylog-flag-mismatch`, `keylog-flag-mismatch-masked-control` (the d6 masked case),
`step-plan-reordered`, `step-plan-shot-set`, `step-plan-extra-step` (the renamed carry),
`caps-flag-true`, `missing-delivered-shape-field`, `missing-getmodifierstate-record`,
`capslock-readback-missing`, `capslock-readback-press`, `shift-detector-negative`,
`form2-missing`, `echo2-double`, `echo2-unbound`.

## D1 forgery proof — the four page occurrences

Base: a scratch copy of the committed r58 receipt (`1d0c1389…`), four separate
single-flag forgeries in `journey.form.pageKeylog` (block records untouched), run with
the committed counter and the r58 driver. Each forged copy exits 1 and adds **exactly
`keylog-flag-mismatch`** and nothing else:

| page occurrence | class | added | removed |
|---|---|---|---|
| swallowed Backspace (run position 2) | unique entry | `keylog-flag-mismatch` | — |
| control digit 7 (run position 0) | masked by plain/shift twins | `keylog-flag-mismatch` | — |
| control digit 5 (run position 1) | masked by plain/shift twins | `keylog-flag-mismatch` | — |
| chord Control (run position 4) | masked by the three chord Controls | `keylog-flag-mismatch` | — |

The unflipped copy's findings are recorded in `d1-forged-fail.json`
(`findings_unflipped`); the forged copies' digests are recorded there too (paths,
digests and findings only — no corpus bytes copied).

## Commands run (lane root) and outcomes

1. `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs --selftest` → exit 0,
   **91/91**, `allPass true`, `idCoverage {required 58, covered 58, uncovered [],
   stray []}`.
2. `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs --path-selftest` →
   exit 0, 91/91 (all cases path-backed).
3. `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs --self-check` → exit 0,
   sha256 `b287cfa2…`, 91 fixtures, status ok.
4. `node …/chromium-receipt-r59.mjs .ufo/waves/round-59/runner/smoke1/receipt.json
   --driver scripts/chrome-cdp-loopback-round59.mjs --json` → exit 0, predicate true,
   findings [], couldNotEvaluate [].
5. Same for `runner/smoke2/receipt.json` → exit 0, predicate true, findings [],
   couldNotEvaluate [].
6. Same plus `--expect-driver-sha256 b16ddb44…` → exit 0 (pin-ok).
7. Same plus `--expect-driver-sha256 000…0` → exit 1, `driver-sha-mismatch`.
8. `node …/chromium-receipt-r59.mjs <scratch>/r58-receipt.json --driver
   scripts/chrome-cdp-loopback-round58.mjs --shot
   corpus/evidence/round58/chromium-preventdefault-swallow --json` → exit 1; first
   finding `schema-wrong`, then `nonce-shape`; `couldNotEvaluate [nonce-unusable]`
   (cross-refusal r58).
9. Same on the committed r57 receipt with the r57 driver → exit 1, `schema-wrong`
   first (cross-refusal r57).
10. Four D1 forgeries (table above) → each exit 1, exactly one added id.
11. Authoring-time probes against the r58 corpus and smoke receipts were run on the
    working copy in `/fast/scratch/hyaku/tabi-r59/R59Counter/`; every result above was
    re-run with the committed bytes at the committed path.

## Disclosed carry-set moves (exact-finding sets that changed, with reasons)

- `green-extra-step` → **`step-plan-extra-step`**: r58 admitted extra steps after the
  six; the declared D2 change requires the recorded steps to EQUAL the 18-step plan,
  so an extra step is `step-plan-mismatch` (was GREEN, now that one id).
- `crossgen-r56-receipt`, `crossgen-r56-shaped`, `crossgen-r57-receipt-to-r56-counter`:
  foreign-shaped receipts keep every r57/r58 refusal they named and now ALSO fail the
  r59 surface (no declared plan, no named caps expectation, no Shift detector, no
  form2/`/echo2`). Sets recorded exactly in the fixture specs.
- `do-nothing-empty-object`: an empty receipt gains `step-plan-mismatch`,
  `caps-flag-true` (no named `capsLatchExpected`), `form2-missing`,
  `echo2-count-wrong`.
- `nonce-not-invocation-bound`: gains `echo2-count-wrong` — a nonce stripped
  everywhere cannot bind the `/echo2` submission either.
- `swallow-pagekeylog-continuation`: gains `keylog-flag-mismatch` — the same page-side
  tamper removes the block entry's positional match (that is D1's purpose).

## Fixes and pre-freeze strengthening (recorded because the sentinel measured the working copy)

- **Crash (HIGH, blocking)**: `checkCapsLock` declared 7 parameters but the call passed
  6, so `add` was `undefined` and every receipt threw `TypeError: add is not a
  function` with empty stdout. The sentinel captured this on the working copy
  (`bf609392…`); the fix (`klEntries !== null` passed as `pageAdmitted`) is in both
  final builds and every run above is with final bytes.
- **Latch polarity**: `latch.acrossLetters1 === true` means "every letter read
  CapsLock false" (the negative holds); the working copy treated it as a violation.
  Final: raw press booleans keep "true = violation", `acrossLetters*` reads
  "false = violation", `anyTrue`/`allFalse` are read directly.
- **press2 read-back**: press2 is read AFTER letters1, so it must equal
  prefix + letters1 (the working copy compared it to the pre-leg prefix → false
  positive on genuine receipts; fixed and re-verified on smoke2).
- **Pre-freeze D1 strengthening (L1 request)**: the working copy's existence-by-value
  match was maskable (R59Probes `d6-six-entries.json`: control digit 7 at page index
  126, digit 5 at 128, Control at 134 all stayed green behind twins). Final bytes
  locate the contiguous swallow run and compare the flags at the POSITIONAL
  occurrence, with distinct-occurrence matching as the fallback; a new fixture
  (`keylog-flag-mismatch-masked-control`) pins the class. The four-position proof is
  in `d1-forged-fail.json`.

## Risks, disclosures, blockers

1. **Measured-negative risk is the claim's, not the counter's.** The counter refuses
   any CapsLock true and any Shift-detector false; it does not weaken them.
2. **The live receipt must carry `shift` on every page entry** (R59Runner confirmed;
   smoke1/smoke2 carry it). Without it the counter refuses with
   `shift-detector-negative`.
3. **The counter refuses any receipt whose steps differ from the 18-name plan**
   (that is D2/f8 by design). The plan is embedded verbatim from the driver's own
   `declaredStepNames`; a future driver change is a new claim, not a counter edit.
4. **F-probe kill receipts are the mutation seat's artifacts.** This seat supplies the
   exact-findings fixtures and the four-position D1 forged-fail receipt; the mutation
   seat (R59MutCounter) was sent the FINAL sha and the fixture map.
5. **Residual (disclosed in the claims):** a byte-perfect replica of a genuine receipt
   is indistinguishable by construction; the counter's enforceable surface is the
   enumerated forgery classes.
6. **No live browser was run by this seat**; the green smoke verdicts are
   counter-vs-receipt checks, not the round's data pass.
7. Nothing in this seat touched `.ufo/state/`, `.ufo/watchdog.log`, `MANIFEST.json`,
   `corpus/`, another seat's files, or any VCS state. The committed r58/r57 receipts
   were only READ; their scratch copies were deleted, and the D1 artifact records
   paths, digests and findings only.
8. **Tooling:** no tool was installed or updated (pacman is paused host-wide; nothing
   was needed).

## Scratch

All working copies lived under `/fast/scratch/hyaku/tabi-r59/R59Counter/` (counter
working copy, fixture edit scripts, r57/r58 receipt copies, the four forged copies,
cross-run verdicts). The tree is deleted before this seat yields; nothing citable
depends on it (every citable byte is above, in the wave dir).

## Hand-off checks for the L1

- `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs --selftest` → 91/91.
- `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs --path-selftest` → 91/91.
- Live pass: `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs
  corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver
  scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256
  b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 --shot
  corpus/evidence/round59/chromium-capslock-boundary --json` (the claim's command).
- Freeze pin recorded above (`b287cfa2…`); re-run `--self-check` after the freeze
  commit to confirm the committed digest.
