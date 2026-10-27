# CritWaveIndependence — round 39 attempt 1

## Axes
Coverage (C1) and calibration (C2).

## Commands and observed output

Read-only evidence review; no commands were run. The frozen claims identify C1 as the Firefox session-bound egress capability and C2 as the routed-residual instrument repair. Both counters accept a shared `--rev` and resolve Git objects there.

Observed frozen baseline receipts:

```text
measure/c1-before.txt:
FINDING receipt-absent corpus/evidence/round-39/playwright-egress/receipt.json absent at REV
C1_EGRESS_SESSION_BOUND predicate=not-met rev=5bc56a81d196caeb8d24551928b883802697aabb findings=1 controlRefused=true

measure/c2-before.txt:
FINDING d4-receipt m3-sentence-mutant.json absent
FINDING d6-file no numstat receipt under .ufo/waves/round-38/measure
C1_ROUTED_DEFECTS predicate=not-met rev=5bc56a81d196caeb8d24551928b883802697aabb findings=2 seats=34 tally=23/11 census=144
```

Observed pre-integration run at `d3232d56a909576aef6370243c5d457fbf42b1d2` (`measure/pre-integration-counters.txt`): C1 exits 0 with predicate true while C2 exits 1. C2 reports D4/D5/D6 receipts missing in the frozen counter implementation (D5 census and D6 numstat absent at that REV); C1 success therefore does not establish C2 success. `w1/RevC1Receipt/report.md` further records a C1-only run at `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`, exit 0, predicate true, and v1 control refused. `w1/RevC2Receipt/report.md` records exercising C2's sentence-mutant control with `--claims`, exit 1 and `d7-sentence-mismatch`; it does not invoke a C1 receipt.

## Counterexample / coupling

C1 is testable without C2-specific receipts: its source reads its own round-39 browser receipt plus the round-38 v1 receipt, and does not read C2's sentence-mutant, census, or numstat receipts. However, the counter deliberately requires the old v1 control to be present and refused. That is a shared historical control prerequisite, not C2's round-39 red-control evidence.

C2 is testable without the C1 Firefox receipt: its D1–D7 inputs cover routed-defect history, round-39 sentence-mutant, census and numstat evidence, and claims predicate; the C1 receipt path/browser session is not among its inputs. Its own round-39 receipts remain necessary to meet its target predicate.

The shared artifact coupling the verdicts is the measured integration REV / Git snapshot: each counter reads evidence at its supplied revision. `claims.json` is also shared as the frozen registry, but actual dependency is asymmetric: C1 does not parse it, while C2 checks the C2 predicate sentence at `claims[1].predicate`. A combined aggregate verdict would couple independent failure modes; keep per-claim counters and evidence separate at the same explicitly named REV. No source-code correction is indicated by this separability review.

Evidence paths: `.ufo/waves/round-39/claims.json`; `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`; `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`; `.ufo/waves/round-39/measure/c1-before.txt`; `.ufo/waves/round-39/measure/c2-before.txt`; `.ufo/waves/round-39/measure/pre-integration-counters.txt`; `.ufo/waves/round-39/w1/RevC1Receipt/report.md`; `.ufo/waves/round-39/w1/RevC2Receipt/report.md`.

No browser used, tools installed, or scratch created. No runtime/counter was invoked.

VERDICT finding — separable predicates with asymmetric receipt dependencies; shared measured REV and C1's round-38 v1 control are the coupling points.
