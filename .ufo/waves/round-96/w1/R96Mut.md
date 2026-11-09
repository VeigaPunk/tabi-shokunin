# R96Mut — Counter mutation sweep (round-96 w1, C1)

Seat: R96Mut. Scratch mirror `/fast/scratch/hyaku/tabi-r96/R96Mut`, lane mirror `$S/lane`
(3 scripts + r95 receipt copied verbatim; counter sha256 `778d429f…` = lane bytes).
Battery receipt: `.ufo/waves/round-96/controls/receipt-positive.json`, nonce `tabi-r96-ctl-positive`,
driver pin `4020e57e…ce63b91`. Runner: `R96Mut-run_mutants.py`, verifier: `R96Mut-run_killers.py`.

## Axes
1. Battery sensitivity (does the 63-case battery catch each counter weakening?).
2. Predicate fidelity (does a surviving counter let a receipt violate a frozen sentence while saying clean?).

## Question
Does the frozen counter (the instrument carrying predicate `C1-CLIENT-OOPIF-CHOOSER-R96`) detect
plausible single-token weakenings of its own checks, or do survivors exist?

## Result — PRISTINE counter against frozen battery
`node negatives… --lane $S/lane --receipt …/receipt-positive.json --expect-nonce tabi-r96-ctl-positive
--expect-driver-sha256 4020e57e… --scratch $S/battery/base --json` → exit (battery) 0, cases 63, ok 63, failed [].
`node check… --receipt …/receipt-positive.json --expect-nonce tabi-r96-ctl-positive` → exit 0 (positive clean).
Baseline failure: none. Conclusive by the seat rule.

## Result — 70 mutants
Verdicts per mutant (mutant, verdict, battery rc, failed cases / positive_clean):
- M01 `TIMEOUT_MS 3000→30000`: POSITIVE-BREAK rc1 failed[positive, timeout-other] pos False.
- M02 PP message gains trailing `.`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M03 `CHROMIUM_TAG …84→…85`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M04 `BROWSER …84→…85`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M05 `ANSWER size 22→23`: POSITIVE-BREAK rc1 failed[positive, answer-size] pos False.
- M06 PP version `25.16.0→25.15.0`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M07 PW integrity one-char change: POSITIVE-BREAK rc1 failed[positive] pos False.
- M08 PP file-sha one-char change: POSITIVE-BREAK rc1 failed[positive] pos False.
- M09 `SCHEMA …r96→…r97`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M10 `ARM.PPX.chooser false→true`: POSITIVE-BREAK rc1 failed[positive + 5 pp cases] pos False.
- M11 `ARM.PPW.witness true→false`: POSITIVE-BREAK rc1 failed[positive + 7 witness cases] pos False.
- M12 `ARM.PPS.chooser true→false`: POSITIVE-BREAK rc1 failed[positive, pps-timeout, pps-element-claimed] pos False.
- M13 `ARM.PWX.cross true→false`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M14 `ARM.PWS.lib playwright→puppeteer`: POSITIVE-BREAK rc1 failed[positive] pos False.
- M15 drop check `schema` → KILLED by do-nothing-r95-receipt. M16 `nonce` → nonce-other.
- M17 `driver-pin` → driver-pin-other. M18 `chromium` → chromium-string. M19 `cross-host` → cross-host-same.
- M20 drop check `reps` → SURVIVED (battery 63/63, positive clean).
- M21 `timeout` → timeout-other. M22 `libs` → 4 lib cases. M23 `answer` → answer-size.
- M24 `ports` → port-below-1024 + port-duplicate. M25 `leg-set` → duplicate/dropped/reordered.
- M26 `failures` → 2 polarity cases. M27 `fresh-browser` → reused + not-uuid.
- M28 drop check `driver-exit` (inside `if (live)`, line 173) → SURVIVED structurally (§below).
- M29 drop check `ports-bound` (inside `if (live)`, line 174) → SURVIVED structurally (§below).
- M30 `leg-arm` → 3 leg-arm cases. M31 `browser` → 2 version cases. M32 `frames` → 2 frames cases.
- M33 `iframe-targets` → 4 isolation cases. M34 `click` → 3 click cases. M35 `parent-files` → 2 cases.
- M36 `pp-timeout` → 6 PP-law cases. M37 `chooser` → 6 resolve cases.
- M38 `child-files(empty)` → ppx-child-filled. M39 `child-files([ANSWER])` → 3 child cases.
- M40 `witness` → 7 witness cases. M41 `no-witness` → ppx-witness-added. M42 `leg-label` → 2 label cases.
- M43 `eq` → loose `a == b`: POSITIVE-BREAK rc1 failed[positive] (loose compare turns `libs` objects to false via NaN coercion even on the unmodified receipt).

Wait — M43's positive break deserves a caveat: `eq` on `{}` objects compares by reference so the positive
receipt fails `libs`. That is a false-positive on the positive, i.e. the battery DOES discriminate it.
Recorded as POSITIVE-BREAK (conservative), not KILLED-by-a-negative.

- M44 `eq` → always true: KILLED, 19 cases failed (all eq-gated checks). M45 `isPosInt n>0 → n>=0`:
  KILLED by ppw-backend-absent. M46 witness frameId → true: ppw-wrong-frame. M47 `ev.length===1 → >=1`:
  ppw-two-choosers. M48 witness mode → true: ppw-mode-multiple. M49 intercept targetId → true:
  ppw-intercept-other-target. M50 witness backend → true: ppw-backend-absent.
- M51 `pp-timeout` accepts `outcome==='error'` too → SURVIVED (killer receipt below).
- M52 `pp-timeout` drops `errName==='TimeoutError'` → SURVIVED (killer below).
- M53 `pp-timeout` drops `errMessage===PP_TIMEOUT_MSG` → KILLED by ppx-timeout-other-ms.
- M54 `chooser` drops the `errName/errMessage === null` conjuncts → SURVIVED (killer below).
- M55 `chooser` drops element-id binding → KILLED (pwx-element-other, pps-element-claimed).
- M56 `ports` range `1024→0` → KILLED by port-below-1024. M57 ports distinctness → port-duplicate.
- M58 `failures` drops `errLegs.length===0` → leg-error-failures-empty. M59 browser-id uniqueness →
  browser-reused. M60 `iframe-targets` count `===1 → >=1` → pwx-two-iframe-targets.
- M61 `click` checks only first entry → click-double. M62 `leg-set` sorted compare → leg-reordered.
- M63 leg-label regex gains `|PWZ` → leg-fabricated-label. M64 browser ternary swap:
  POSITIVE-BREAK (inverts Playwright `clientBrowserVersion` expectation on the positive).
- M65 `chooser` accepts `outcome==='error'` → SURVIVED (killer below).
- M66 `child-files` checks length only → pwx-child-wrong-file.
- M67 `pp-timeout` drops `chooserMultiple/chooserElementId === null` → SURVIVED (killer below).
- M68 flip `schema ===` → `!==`: POSITIVE-BREAK (inverts). M69 flip `nonce ===` → `!==`: POSITIVE-BREAK.
- M70 `want` loop `r <= reps → r <= reps+1` (off-by-one): POSITIVE-BREAK (expects 20 legs, positive has 15).

Totals: 70 mutants — 43 KILLED, 19 POSITIVE-BREAK, 8 SURVIVED. Full per-case table: `R96Mut-results.json`.

## Killer receipts for the survivors (receipt-mode, 6 of 8)
Each: positive receipt + one frozen-sentence violation; pristine counter gives the finding (rc1),
the mutant counter says clean (rc0). Verified by `R96Mut-run_killers.py`, table in
`R96Mut-killer-verification.json`, receipts `R96Mut-killer-*.json`:
- M20 (`reps` dropped): `reps: 99` → pristine [reps] rc1, mutant clean rc0. KILLER-VERIFIED.
- M51 (pp-timeout accepts `error`): PPX-1 `outcome:'error'` (errName/errMessage kept) → pristine
  [pp-timeout] rc1, mutant clean. KILLER-VERIFIED. A receipt claiming the Puppeteer cross-site wait
  ended `error` rather than with the frozen `TimeoutError`/3000 ms message would pass the mutant.
- M52 (errName not checked): PPX-1 `errName:'Error'` → pristine [pp-timeout] rc1, mutant clean.
  KILLER-VERIFIED. Wrong error name passes the mutant.
- M54 (chooser error fields unchecked): PWX-1 `errName:'Error', errMessage:'boom'` with `outcome:'chooser'` →
  pristine [chooser] rc1, mutant clean. KILLER-VERIFIED. A "resolved" chooser carrying a protocol error passes.
- M65 (chooser accepts `error`): PWX-1 `outcome:'error'` → pristine [chooser] rc1, mutant clean. KILLER-VERIFIED.
- M67 (pp-timeout multiple/element unchecked): PPX-1 `chooserMultiple:false, chooserElementId:'s'` →
  pristine [pp-timeout] rc1, mutant clean. KILLER-VERIFIED. A "timeout" leg claiming a resolved chooser's
  element id passes the mutant.

## The two structural survivors (cannot be killed in --receipt mode)
M28 (`driver-exit`, counter line 173) and M29 (`ports-bound`, line 174) live inside `if (live) { … }`
(lines 172–175) and are simply never evaluated in `--receipt` mode (`driverRun`/`livePorts` are null).
No --receipt receipt, however forged, can discriminate them: both pristine and mutant return rc0 on the
positive receipt and on every mutation of it. By construction they are reachability-dead in this detector,
not coverage holes in receipt checking.
Live-mode killers (NOT run — this seat executed no --live leg, no deps/chromium run):
- M28 killer: a driver exiting nonzero (e.g. status 1, no signal) yet writing a fully predicate-satisfying
  receipt → pristine prints `driver-exit` finding, rc1; M28-mutant counter prints clean, rc0.
- M29 killer: driver exits 0, receipt ports each distinct in 1024..65535 but ≠ `--ports` →
  pristine prints `ports-bound` finding, rc1; M29-mutant prints clean, rc0.
Both are one-line conditional deletions whose harm is confined to `--live` (the claim's counting command).

All six receipt-mode survivors let a receipt violate a stated predicate sentence while the (mutated)
counter says clean — they are of the `falsifies-wording`-relevant class for the `--receipt` mode only.
They are NOT findings against the frozen instrument: the pristine counter catches every one of them,
and the frozen battery kills 43/43 check-deletions it covers. They document battery coverage gaps, routed to L1:
killers proven above (M20, M51, M52, M54, M65, M67) plus the two --live-only deletions above (M28, M29).

## Restoration evidence
Mirror `check-…-round96.mjs` sha256 before = after = `778d429fe090521ae751ae15f6cd9835d6dd253ad07485452033412fdf723f5d`
(= lane bytes; `run_mutants.py`/`run_killers.py` restore from pristine bytes after every mutant and re-hash).
Lane files outside `w1/` untouched; no git/jj mutation anywhere; no installs (node v24.21.0 only);
no chromium processes (`pgrep -f remote-debugging-port` empty — this seat ran no --live leg).

VERDICT C1: neutral
