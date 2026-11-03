# R61Exec3 — C2 pointer counter

Axes: coverage (assigned capability); calibration (forgery refusal); operability (reproducible CLI). C1 adjacency remains outside this seat.

## Implementation

- `.ufo/waves/round-61/counters/chromium-receipt-r61.mjs`: copy of the r60 counter, carrying all 110 path-backed cases and their exact finding sets. Added r61-schema pointer type/id/trust/button checks, shared page-stamped seq ordering against `mouselog`, complete nonce-derived typing, and focus `field`. R59-shape checks retain their original nonce rule and checks.
- `.ufo/waves/round-61/counters/chromium-receipt-r61-fixtures/`: carried fixture bytes plus 16 transformed, path-backed r61 cases: green, f1-f5, C1'-C5', duplicate/nonmonotonic seq, focus, buttons and event type. They enter the same `checkReceipt`/`evaluate` production call path, not an independent validation helper.
- `.ufo/waves/round-61/measure/f-probes-r61.py`: receipt input, optional `--out-dir`; writes frozen f1-f4 and auxiliary f5 plus source/probe SHA256 manifest. Generated files presently derive from the explicitly synthetic pointer fixture, NOT live r61 browser evidence.
- Ordering follows L1's received ruling: pointerdown.seq < matching mousedown.seq < pointerup.seq < matching mouseup.seq. Shared seq values must be positive safe integers, globally unique and increasing within each recorder array. No merged receipt array.

Counter SHA256: `f615a2f9c2b2cf438321d54f1a6ac6364c22d6d7a7e7c3b7a823e7c2f3ea027e`.
Generator SHA256: `53d5cb930f35fd5a1086c61164ae5a8dbf4d9323f5eed61269cad59efcc3f89e`.
R60 base SHA256: `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae`.
Synthetic pointer receipt SHA256: `6dd8c3e206fcabe263c7de548993f679ef4a34e8c3a8aa56af7136a6a9689da2`.
All individual pins, including carried fixtures, original r59 evidence/driver, frozen claims, probes and command outputs: `.ufo/waves/round-61/w1/R61Exec3/sha256.txt`.

## Exercised commands and exits

Exact argv and exit codes for every counter/generator invocation (including initial and final runs) are retained in `.ufo/waves/round-61/w1/R61Exec3/commands.json`. Each stdout/stderr is retained alongside it.

- r61 `--selftest`: exit 0, **126/126**, allPass `true`, full finding-ID coverage (66/66).
- r61 on original committed r59 evidence with original driver SHA and shots: exit 0; predicate `true`, findings `[]`, couldNotEvaluate `[]`.
- UNCHANGED r60 on synthetic pointer receipt with matching original driver and shots: exit 1; exact findings `['schema-wrong']`. This is schema-class cross-refusal only.
- Generator on synthetic pointer fixture: exit 0, five outputs plus manifest.
- r61 CLI on each generated f1-f5: exit 1. f1 pointer-type-wrong; f2 pointer-order-wrong; f3 pointer-id-wrong plus pointer-order-wrong; f4 pointer-trust-wrong; f5 pointer-nonce-wrong plus carried plain-trace-wrong. Frozen F forgedGreen = 0 on this fixture.

Initial shell setup/count commands: `mkdir -p /fast/scratch/hyaku/tabi-r61/R61Exec3 && ls <r61-wave> <r60-counters> <r61-counters> 2>&1; wc -l <r60-counter> <r59-receipt>` exit 0 (2582/4749 lines); `wc -l <claims> && wc -c <claims>` exit 0 (99 lines, 14390 bytes). These were read-only inspection except named scratch creation. Python file-generation/pinning and scratch-removal cells completed without exceptions. No git mutations, browser processes, loopback listeners or installs were performed. Scratch removed before handoff.

## Deviations, instrument findings, risks

- Required execution was limited to explicit seat selftest, compatibility, cross-refusal, generator and forgery CLI checks. No build/lint/formatters, live runner, mutation program or fleet gate was run. Parent owns live-data/freeze gates.
- Live r61 runner was absent during interface research. L1 supplied the seq/mouselog interface directly; counter now implements that ruling. The copied r59 fixture uses its existing r59 nonce under the new r61 schema, which accepts either r59 or r61-shaped nonce. This is synthetic contract evidence only, not a browser-delivery or teardown witness.
- Frozen claim C5' needs precision in the mutation harness: removing ONLY the additive `pointer-nonce-wrong` check cannot green f5, because the REQUIRED unchanged r60 `plain-trace-wrong` check also refuses the corrupted value. A true nonce-binding mutant must remove the relevant carried binding as well. Likewise f3 exercises both numeric-id validation and matching release-id consistency. No frozen text was amended.
- Existing r60 teardown checks survivors/postKillSweepCount only; the inherited instrument does not itself enforce portProbes or post-kill curl exit 7. Browser closure must therefore be independently checked on live data by the parent under the frozen kill rule. This seat launched no Chromium, so it has no browser closure proof to fabricate.
- Selftest labels C1'-C5' are production-path transformed forgery cases, not evidence that edited mutant implementations were executed. That attack seat remains responsible for actual mutant results.
- No supported LSP device was exposed in this session; symbol navigation used read/grep rather than treating empty LSP output as absence.
- Earlier reader calls elided the claims/counter; exact raw ranges were subsequently read, including all 99 frozen claim lines and all 2582 r60 source lines. A malformed JSON-reader query returned not-found; corrected structured queries supplied the r59 shape.
- Reports are supplied at both requested paths (the item names both). No corpus, runner scripts, fleet tracked files or frozen claims changed.

## Handoff

Before data pass, parent pins/commits instrument bytes and runs the real runner once; regenerate f-probes from that receipt, run exact frozen live/F/cross-refusal commands, and independently retain Chromium/port/curl closure proof. Do not treat synthetic results as the frozen live after-state.

Self-evaluation (advisory): accuracy 4 (no live delivery observed); completeness 4 (scoped instrument complete, live/mutant execution intentionally belongs elsewhere); clarity 4 (legacy counter header remains carried history); actionability 4 (exact command ledger and pins provided, parent integration still required); conciseness 4 (both requested report copies retained). Overall 4.0. Primary improvement is parent's live-data evidence, not widening this counter's frozen predicate.
