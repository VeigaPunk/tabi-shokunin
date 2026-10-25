# Exec04 — adversarial C2 fixture design

## Axes
- Calibration: enforce exact citation-to-stale-line association, rather than paragraph-level citation presence.
- Depth: make the regression discriminate two stale tallies in the same LOG section.

## Finding
Frozen C2 in `.ufo/waves/round-28/claims.json` requires that only a correction citing the exact stale tally can supersede it; prior defect evidence is `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`. Current matcher associates correction paragraphs to all stale findings for the same script whenever the paragraph contains any `:<digits>` citation and the observed count. That admits cross-line citation leakage.

## Fixture proposal
Extend the selfassessment fixture LOG with two stale tally lines in the same section, both associated with `scripts/check-fixture.mjs` and both claiming `12/12`; the oracle fixture gate reports 13 cases. Ensure their physical lines are distinct, e.g. line 6 and line 7. Add a later separated correction paragraph naming the same script and reporting `cases: 13`, but citing only `LOG.md:6` (or only `LOG.md:7`). Expected behavior: the cited finding is superseded; the other remains an `m1-selftest-tally` mismatch. This is the adversarial case: a valid correction for one stale tally must not clear its neighbor merely because both have the same script and stale/observed values.

Add controls:
1. Negative: correction cites a different stale line number and only one of the two mismatches clears; assert exact remaining finding line and `superseded=false`.
2. Positive: separate exact-citation correction paragraphs cite each stale line; both clear and evaluation is clean.
3. Wrong script or wrong oracle tally should not clear either, consistent with frozen C2.

Implementation note for whoever owns the gate: parse citation references into an exact line-number set within each later correction paragraph and require `f.line` membership. Avoid merely checking `/:\\d+/`, which validates syntax but not identity. Keep the correction paragraph unit and existing same-script/oracle-tally constraints.

## Evidence and scope
Observed via source read: `scripts/check-selfassessment.mjs:309-327` currently uses paragraph-level `/:\\d+/` and has no comparison to `f.line`; test infrastructure/helpers and cases are at `scripts/check-selfassessment.mjs:430-441,443-523,599-695`. No tests or builds were run and no lane code was changed. No tools installed. No scratch fixtures created.

Observation: previous negative test only covers wrong-number correction (`m1-log-wrong-number-correction`); existing positive covers a single stale line. Inference: neither discriminates a correction citing one of multiple stale lines from clearing the uncited neighbor. Unknown: final integrated test outcomes.
