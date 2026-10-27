# CritW1Dead — w1 evidence-chain completeness attack

Scope: verify the orchestrator's w1 results record against the w1 role specification and on-disk reports. Frozen claims were read first (`claims.json`, freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`).

## Evidence

- `w1-results.json` declares 33 seats and contains 33 result entries; all 33 names are unique.
- All 33 outputs are non-empty JSON strings.
- All 33 named seats have either `w1/<name>/report.md` or `w1/<name>.md`; none is missing both.
- The w1 spec's `items[].role` tally is: executor 21, scribe 3, reviewer 2, critic 2, mutation-tester 2, connector 1, scout 1, sentinel 1 (33 total). Result `agent` tally matches exactly.
- Verdicts were parsed from each output's `verdict` field; accepted forms include plain labels and `VERDICT <label> ...`. Counts: ok 25, finding 6, could-not-evaluate 0, missing/unrecognized 2. Missing verdicts: AdjDrift08 and MutC2.

## Finding

FINDING: two seats have non-empty outputs and reports but no parseable final verdict. This is a dead-seat evidence-chain defect under the specified rule (could-not-evaluate or missing report; additionally these seats lack the required verdict label). Reports substantiate the distinction: AdjDrift08's report ends `VERDICT ok ...`, while MutC2's output embeds a report/evidence summary but its top-level verdict is absent (its output mentions findings/residuals). Thus the report directory is not missing; the orchestrator result's final-verdict encoding is incomplete for those two entries. Do not infer their verdict from narrative or subordinate fields.

Smallest safe correction: have the orchestrator record a top-level final `verdict` with one of `VERDICT ok`, `VERDICT finding`, or `VERDICT could-not-evaluate` for AdjDrift08 and MutC2, sourced from each report's final verdict (or explicit inability to evaluate). No claim or evidence content needs changing.

Impacted axis: calibration (w1 evidence-chain completeness / attributable disposition). The requested criteria (seat count, outputs, report presence, role mix) pass; the verdict-label criterion exposes the finding.

VERDICT finding — 33/33 outputs, reports, and role assignments are complete, but AdjDrift08 and MutC2 lack parseable final verdict labels in results.json (25 ok, 6 finding, 0 could-not-evaluate, 2 missing); add explicit top-level verdict labels.