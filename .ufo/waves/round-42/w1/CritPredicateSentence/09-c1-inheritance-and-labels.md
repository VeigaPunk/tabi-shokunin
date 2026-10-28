# C1 inheritance map + receipt-label schema (evidence 09)

## Where the three predicate sites actually live in round 42

| site | C2 (calibration) | C1 (coverage) |
|---|---|---|
| claims | `.ufo/waves/round-42/claims.json` `claims[C2].predicate` (1070 chars) | `claims[C1].predicate` (716 chars) |
| counter code | header comment of `counters/check-routed-defects-round42.mjs` lines 9-25 (paraphrase, not byte-identical) | `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs` `const PREDICATE` (1221 chars) = **byte-identical** to the r41 claims predicate, and **not** the r42 claims sentence |
| receipt label | checker stdout JSON: `{"schema":"tabi-r42-routed-defects","rev","predicate","findingCount","findings"}` — **no predicate sentence echoed** | counter stdout JSON carries `"predicateSentence": PREDICATE` (r41 sentence) |

Measured byte facts:
- `v4 PREDICATE byte-equal to r41 claims predicate: True` (both 1221 chars)
- `r42 C1 === r41 C1: False`; longest common substring between the two C1 predicates = `'measure-c1-round41'` (18 chars)
- checker header contains the claims' r1a phrase `is a committed blob of at least 1000`: **False**; header drops the word `blob` for r1a while the word is load-bearing (see F1)

## C1: clauses inherited verbatim vs new

Inherited verbatim: **none**. The r42 C1 sentence inherits the technical chain only by reference (`predicate true and empty findings` from a counter-v4 run), because counter v4's own PREDICATE constant is byte-identical to the frozen r41 sentence.

New in the r42 sentence (absent from the r41 sentence):
1. counting-command exit 0 on a fresh nonce, driver exit 0, counter exit 0, predicate true, empty findings;
2. produced `receipt.json` and `receipt.witness.json` committed at the measured revision;
3. `--battery` all six cases pass, with the five contamination vectors exiting 2 with `environment-loader-contamination` and the clean probe exiting 0;
4. direct counter-v4 replay of the committed **r39, r40 and r41** receipts each refuses (the r41 sentence required only r39/r40);
5. the wave settled with `WAVE-DONE` over >=64 seats and no settled seat demonstrates a do-nothing reach.

## C1: r41 sentence clauses vs counter v4 enforcement (inherited by reference)

| # | r41 predicate clause | counter v4 | evidence |
|---|---|---|---|
| 1 | exactly two runs, loader-clean env (exec-time environ, execArgv) | enforced (`run-set`; `envCheck.*`; `gate` when `--measure`) | code |
| 2 | producer digests equal the frozen pins | **partial**: only 3 of 7 `frozenDigests` keys checked; absent keys skipped (`if (digests[k])`); whole block skipped without `--pins` | M4 predicate=true without `--pins` |
| 3 | fresh 64-hex nonce in receipt and both runs | 64-hex + match enforced; "fresh" is the wrapper's `crypto.randomBytes(32)` | code |
| 4 | >=8 strictly increasing samples, span >=1000ms | enforced | code |
| 5 | ss+proc available, positive ticks every sample and final sweep | enforced | code |
| 6 | >=1 owned socket observation per surface, per run | enforced (sample sums only; finalSweep observations excluded) | code |
| 7 | all nonLoopback counts zero | enforced | code |
| 8 | every sample a **refreshed** identity-bound tree, firefox exe, every pid startTicks inside the run window | **NOT enforced as written**: no cross-sample refresh comparison; window checks are guarded by `Number.isFinite(runStartTicks)` / `Number.isFinite(x.tTicks)` | M1 (identical tree every sample -> predicate true); M2 (`runStartTicks` omitted, `startTicks:-999999` -> predicate true) |
| 9 | witness saw driver pid + firefox descendant on >=10 samples | enforced | M3 (nodePid removed -> `witness-driver-unseen`+`witness-no-owned-firefox`) |
| 10 | identical firstShotSha256 | enforced | code |
| 11 | zero survivors, closed fixture port | enforced | code |
| 12 | browserVersion bound | enforced | code |
| 13 | socket summaries agree with per-sample counts | enforced | code |
| 14 | wall-clock covers both sample spans | enforced only with `--measure` (wrapper always passes `-`) | code |
| 15 | the r39 and r40 receipts are refused | **not implemented in `evaluate()` at all**; done out-of-band by the two separate replay controls | `grep -niE 'round-39|round40|replay' c1-session-bound-v4.mjs` -> only the PREDICATE string |

## C1: composed r42 clauses vs available instruments

| r42 clause | instrument | status |
|---|---|---|
| counting command exits 0 (driver 0, counter 0, predicate true) | `scripts/measure-c1-round41.mjs` exit expression `run.status === 0 && cRun.status === 0 && counter.predicate === true` | enforced |
| empty findings | implicit in `predicate = findings.length === 0` | enforced |
| receipt+witness committed at the measured revision | none (no counter reads a revision) | **currently FALSE**: `git status` -> `?? corpus/evidence/round42/`; `git cat-file -e 0081bfd:...receipt.json` -> fatal, exit 128 |
| battery six cases | `.ufo/waves/round-42/controls/c1-battery-r42.json` | 6 cases, allPass true, five exit 2 `environment-loader-contamination`, clean exit 0 - matches the sentence exactly (control committed 236c4f4, after the 9b6de3a freeze) |
| r39/r40/r41 replay each refuses | `.ufo/waves/round-42/controls/c1-r39-replay-r42.exit`=1, `c1-r40-replay-r42.exit`=1, `c1-r41-replay-refused.exit`=1 | matches "nonzero exit" |
| WAVE-DONE over >=64 seats, no do-nothing reach | none named | `w1-spec.json` has 64 items; `w1-results.json` absent; `parse-w1-results.mjs` neither emits nor checks `WAVE-DONE` and contains no `64` |

## Receipt label schema (task item 3)

| artifact | claims path | committed at HEAD | internal schema |
|---|---|---|---|
| C2 checker usage | `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev --repo --json` | yes (in 9b6de3a) | output `tabi-r42-routed-defects` |
| C2 red control | `.ufo/waves/round-42/controls/c2-baseline-red.json` | yes (9b6de3a) | `tabi-r42-routed-defects` |
| C1 counting command | `scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run` | wrapper in 9b6de3a | wrapper prints `tabi-r41-c1-measure` |
| C1 receipt | `corpus/evidence/round42/playwright-egress/receipt.json` | **no (untracked)** | `tabi-pw-firefox-egress-receipt-r41` |
| C1 witness | `corpus/evidence/round42/playwright-egress/receipt.witness.json` | **no (untracked)** | `tabi-r41-witness` |
| C1 counter output | printed by wrapper / recorded in `measure/c1-measure.json` | measure record yes | `tabi-r41-c1-measured-v4` |
| C1 battery | `.ufo/waves/round-42/controls/c1-battery-r42.json` | yes (236c4f4) | `tabi-r41-battery` |
| C1 r41 replay refusal | `.ufo/waves/round-42/controls/c1-r41-replay-refused.json` | yes (236c4f4) | `tabi-r41-c1-measured-v4` |

Path-level identity: every `tabi-r42` path in the claims resolves today and the C2 label family matches. Label-level identity: C1 artifacts all carry **r41** schema labels and the claims declare **no receipt schema string**, so there is no third-site label to compare for C1.
