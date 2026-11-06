AMBER

Reviewer R69Review2 — C2 false-green review (driver `scripts/chrome-cdp-synthscroll-round69.mjs` sha256 13ea3f8a…bce3, counter `scripts/check-synthscroll-r69.mjs` c1b3763c…a795, battery `scripts/negatives-synthscroll-r69.mjs` 37e8f962…7f97, scored receipt `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`). Verdict meaning: the driver itself is honest and the scored artifacts reproduce, but the counter demonstrably green-lights forged receipts — including a live run whose scroll producer was not the gesture — so "counter clean" establishes internal consistency only, never that the logged gestures caused the recorded events. No frozen predicate is amended here; these are attacks, as instructed.

## Findings by severity

**F1 — HIGH (false green, proven live). The receipt cannot attribute causality: `cdpSendLog` is self-attested by the very process under test.**
I wrote a rogue driver (`rogue.mjs`, beside this report) that loads the same fixture, records the same trusted page events, scrolls all three mouse-class legs with **unlogged** `Input.dispatchMouseEvent` mouseWheel sends, fabricates three `Input.synthesizeScrollGesture` log rows that are never sent (params copied from the receipt's own frozen plan), and sends only the touch-leg gesture for real. Result: real Chromium 155.0.8059.84, real `isTrusted` wheel/pointer events, `synthScrollHypothesis CONFIRMED`, and the counter exits **0** — without the pin (62 checks) and with `--expect-driver-sha256 13ea3f8a…` (63 checks). Receipt: `rogue4-live-hidden-producer-receipt.json` (nonce `tabi-r69-review2-rogue4`). The driver's log choke point (`chrome-cdp-synthscroll-round69.mjs:289`) logs only what it pushes; the counter has no external anchor on the log, so the logged four gestures are a claim, not a proof.

**F2 — HIGH (false green, proven). The driver pin is opt-in and authenticates nothing even when passed.**
- Enforcement is conditional: `check-synthscroll-r69.mjs:41-42` — `if (expSha)`. Omitted → no check references `driverSha256` at all; any receipt passes unbound (my no-pin runs: exit 0, checkCount 62).
- Calibration: scored artifact `.ufo/waves/round-69/scored/c2-counter-a.json` records `checkCount: 63`, equal to my with-pin run (63) and one above my no-pin run (62) — so the scored invocation **did** pass the pin. Good discipline; but the pin compares `r.driverSha256`, a field inside the same forgeable JSON (set by the driver at `chrome-cdp-synthscroll-round69.mjs:225`). FG1, FG4 and rogue4 all carry `driverSha256 = 13ea3f8a…` and all exit **0** with the pin. What the pin buys: version-drift detection (counter-on-old-receipt accidents) and a procedural invocation-time binding when the invocation is logged. It is not provenance authentication.

**F3 — HIGH (false green, proven). Wheel-sum and dispatch-range are intra-JSON consistency checks; a fabricated-but-consistent receipt passes without any Chromium.**
`leg-*-wheel-sum` (`check-synthscroll-r69.mjs:94`) and `leg-*-dispatch-range` (:99) compare fields of the same attacker-writable document. `forged-FG4-fabricated-from-scratch.json` was authored by hand (6+3+3 wheels, scrollends, touch pointers, 45-row log, green teardown, nonce `tabi-r69-forged-review2`) with **zero** browser launches: counter exit **0** without pin (62) and with pin (63). They catch naive tampering only — which is exactly what the battery's 40 targeted mutations exercise (reproduced today: `negatives 44, refusedForExpectedReason 44, positiveOk true, failed []`, exit 0; `battery-rerun.json`).

**F4 — MEDIUM (false green, proven). Send-log completeness is unverifiable; `send-log-ordered` (ids 1..n, :61) is satisfied by renumbering.**
`forged-FG2-omit-evaluate.json` = scored receipt with all 34 `Runtime.evaluate` rows deleted and ids renumbered: exit **0**, clean. A driver variant can scroll by script or dispatch input and simply not push log rows; the counter cannot see omissions. (In the shipped driver, coverage is in fact complete — see answer 2 below — but the receipt cannot prove which driver ran; only the pin, per F2.)

**F5 — MEDIUM (battery gap). The battery's laundering is weaker than a real launderer.**
`negatives-synthscroll-r69.mjs:89-96` flips only four fields (:92) and leaves the degenerate run's `Input.dispatchMouseEvent` rows in the log, so `no-other-input-producer` (:57) fires. A launderer strips those rows and inserts frozen-param gesture rows — `forged-FG1-stronglaunder-dispatch-wheel.json` from the real control `.ufo/waves/round-69/controls/c2-degenerate/dispatch-wheel-receipt.json` exits **0** (62), with pin **0** (63). The expectId discipline (wrong-reason refusal ≠ pass) is good and kept; the mutation set just does not include the strongest forgery.

**F6 — LOW (calibration — what IS caught).**
- The assignment's literal scenario, in-log `yDistance 0` gestures: `forged-FG5-ydistance0-in-log.json` → exit **1**, finding `gesture-params` (:55). Frozen-param equality in-log is enforced; only log lies of omission/commission outside those fields slip through.
- Genuine closure failure: my rogue3 run left the fixture port open (probe bug, since fixed) → counter exit **1**, `teardown-closure` (:110-111). The check reacts to a real open port, not just to edited constants.

**F7 — INFO. Teardown closure evidence in the scored receipt is complete and green** — `postKillSweepCount 0`, `survivors []`, `sweepError null`, `portProbes {fixture: closed, devtools: closed}`, `postKillCurl {fixture: 7, devtools: 7}` (curl 7 = connection refused; receipt.json:2763-2780). For the live scored run this is real process-level evidence. As receipt fields they are constants; FG4 fabricates them from nothing and passes (F3).

**F8 — LOW (latent flake, no scored impact).** The driver sets leg `end` after the touch leg; any straggler trusted event labeled `end` makes `event-legs-known-monotone` fail (`legIdx('end') = -1`). The scored run has zero `end`-leg events (touch gesture with `preventFling` produces none). Slow-machine flakiness risk only.

## Answers to the assigned questions

1. **Non-gesture producer that also logs a synthesizeScrollGesture call?** In-log `yDistance 0` + hidden scroll: refused (exit 1, `gesture-params`). The working variant is log omission: frozen gestures logged (or fabricated as log rows) while unlogged `Input.dispatchMouseEvent` wheels do the scrolling — **exit 0, proven live** (F1/rogue4). The page-side trusted wheel events of both producers are indistinguishable, so no counter check can separate them.
2. **Does `cdpSendLog` cover every CDP send path?** In the shipped driver, yes: the single `send()` at `chrome-cdp-synthscroll-round69.mjs:289` is the only `ws.send` in the file; `Browser.getVersion`, `Page.enable`, `Runtime.enable`, `Emulation.setDeviceMetricsOverride`, `Page.navigate`, `Runtime.evaluate` (via `evalValue`), `Input.*` all flow through it, and pushes precede the wire send (timeouts stay logged). Scored receipt: 45 rows, ids 1..45. But coverage is a property of the code, not of the receipt — unverifiable per F4/F1.
3. **Pin binding only when the flag is passed?** Yes (:41-42); omitted → zero binding, exit 0. The scored run passed it (checkCount 63 = with-pin count). With it, the check compares a receipt-declared field → passes on all four forged receipts. Buys drift detection + procedural binding; not authentication (F2).
4. **Wheel-sum / dispatch-range vs fabricated-consistent JSON?** Not meaningful as production evidence — proven by FG4 (exit 0, no browser ever launched). They are tamper-evidence for naive edits, which the battery covers well (44/44 reproduced). The live re-run (b) buys reproducibility of the pinned pipeline on this host today (capability), not provenance of receipt (a); the pin buys the F2 drift/procedural binding. The causal claim "the gesture is the producer" is establishable only by a witnessed live run, never by the receipt JSON.
5. **Teardown closure in the scored receipt?** Complete, green, and consistent with a real kill+probe sequence (F7); the counter refuses when closure genuinely fails (F6, rogue3) but accepts fabricated constants (FG4).

## What the C2 evidence actually establishes
- The capability is real: pinned driver 13ea3f8a… ran live on Chromium 155.0.8059.84, produced the exact frozen leg shapes (mouse 0→600 wheel-sum +600; default 600→300 −300; repeat 300→900 +600 with 3 scrollends; touch 0 wheel, 1/1 touch pointer pair, 40 pointermove), closed both ports, and the three degenerate controls (same driver pin, honest `REFUTED`/`predicate:false`) behave as the battery expects — all re-verified today.
- The scored receipt itself shows no forgery indicators: its 45-row log matches the honest driver's send rhythm exactly (setLeg/scrollY/settleY evaluate cadence), and the wheel cadence (46/25/51 wheels at pixel-mode deltas) is Chromium-shaped, not hand-written. That is soft evidence; per F1-F4 it is not proof.
- Residual risk: any driver variant with a different sha (or any JSON author) can produce a counter-clean receipt indistinguishable from (a) by construction. Counter-clean must be read as internal consistency + invocation-time pin binding, nothing more.

## Reproduction
```
node scripts/check-synthscroll-r69.mjs --receipt <forged json> --json            # exits above
node scripts/check-synthscroll-r69.mjs --receipt <forged json> --json \
  --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3
node forge.js    # rebuilds FG1/FG2/FG4/FG5 and runs all counter invocations, prints the exit matrix
node rogue.mjs   # live hidden-producer run (loopback 45231/45232, fresh profile in scratch)
```

## Exit-code matrix (all recorded today, 2026-11-06)
| Receipt | Counter invocation | exit | verdict / findings |
|---|---|---|---|
| scored (a) `receipt.json` | no pin | 0 | clean, 62 checks |
| scored (a) | with pin | 0 | clean, 63 checks (scored artifact records 63 → pin was passed by scorer) |
| FG1 stronglaunder-dispatch-wheel | no pin / with pin | 0 / 0 | clean, 62 / 63 |
| FG2 omit-evaluate | no pin | 0 | clean, 62 |
| FG4 fabricated-from-scratch | no pin / with pin | 0 / 0 | clean, 62 / 63 |
| FG5 yDistance0-in-log | no pin | 1 | red — `gesture-params` |
| rogue4 live hidden-producer | no pin / with pin | 0 / 0 | clean, 62 / 63 |
| rogue3 live, fixture port left open | no pin | 1 | red — `teardown-closure` |
| battery re-run (scored real + 3 controls) | — | 0 | negatives 44, refusedForExpectedReason 44, positiveOk true |

Artifacts beside this report: `forged-FG1-stronglaunder-dispatch-wheel.json`, `forged-FG2-omit-evaluate.json`, `forged-FG4-fabricated-from-scratch.json`, `forged-FG5-ydistance0-in-log.json`, `rogue4-live-hidden-producer-receipt.json`, `rogue4-nopin.json`, `rogue4-pin.json`, `rogue3-counter.json`, `nopin.json`, `withpin.json`, `battery-rerun.json`, `forge.js`, `rogue.mjs`. Probe scratch `/fast/scratch/hyaku/tabi-r69/R69Review2` deleted before submission; no git/jj mutations; no writes outside this seat dir and scratch.
