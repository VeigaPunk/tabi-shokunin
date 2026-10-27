# CritC2Semantics — round 39 C2 falsification

Axes: coverage, calibration.

## Findings

1. **Red control executed:** the stored mutant receipt is not sufficient by itself, but independent replay was observed in `RevC2Receipt/report.md`: v2 was run with the mutant claims fixture against frozen REV `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; output included `d7-sentence-mismatch`, exit 1. Receipt SHA values were compared to source hashes, and the mutant changed the intended count token. So the round-38 defect “merely asserted, not executed” is closed for the sentence refusal. Caveat: the replay also naturally found missing D5/D6 at the frozen revision; it does not establish a green true-predicate run.

2. **Numstat window requires baseline..REV but cannot be realized as specified:** D6 derives filename from the full measured REV prefix, reads that receipt from the same REV tree, requires the receipt name the full REV, then compares its body to `git diff --numstat BASELINE..REV` excluding itself. The receipt is part of that commit tree; adding it changes REV. Scratch counterexample recorded in `measure/c2-self-reference-probe.txt`: candidate `03322e9d...` without receipt failed d5/d6; adding candidate-named receipt made carrier `5c13c846...`; counter then looked for carrier-named receipt and failed d5/d6. This prevents an ordinary committed receipt naming the exact tree revision. The desired baseline..REV body check exists, but the full measured-REV protocol is incoherent, not closed.

3. **Post-hoc/fabricated receipt path:** D4 only parses JSON fields (`observedExit`, differing sentence and distinct syntactically valid SHA strings); it does not rerun the command or cryptographically bind output to execution. Thus a hand-authored receipt can claim nonzero execution. Independent replay in the above review is stronger evidence of actual execution for this observed case, but is not enforced by the frozen counter. Also, D7 indexes `claims[1]` and checks only its predicate, not `id === C2`; a second claim with frozen sentence can satisfy D7 (demonstrated by `RevC2Counter/report.md` probe). D1–D3 were reported byte-identical in semantics to v1 by that review.

## Evidence / commands

- Read frozen claims, whose C2 predicate explicitly requires red-control receipt and baseline..REV body equality; read frozen counter D4/D6/D7 implementation (lines 162–175, 211–250).
- `cat /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/measure/c2-self-reference-probe.txt` — observed scratch carrier/revision counterexample above.
- Read `.ufo/waves/round-39/w1/RevC2Receipt/report.md` — replay command and output show `d7-sentence-mismatch`, `OBSERVED_EXIT=1`.
- Read `.ufo/waves/round-39/w1/RevC2Counter/report.md` — reported D7 non-C2 identity probe passes sentence match.
- No tools installed; no fixture run by this seat; no production files changed.

Smallest safe correction for a future freeze: make the receipt live in a distinct evidence-carrier revision while explicitly pinning the measured source REV and its tree, and make the counter execute the mutant control (or validate a captured, authenticated execution artifact); bind D7 to claim id/schema/round as well as sentence. Do not retrofit the frozen counter/claim after dispatch.

VERDICT finding — executed refusal is independently evidenced, but D6's same-REV receipt is self-referential and D4 permits post-hoc fabricated execution fields.
