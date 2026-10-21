# ReviewSampleClaim — round 20

## Axes reviewed
- **Claim/metric validity:** what the 0→12 count establishes versus depth 8→8.
- **Operational utility:** whether the new SKILL table helps diagnose completion behavior.
- **Scope/calibration:** whether source-only branch facts are kept separate from runtime outcomes and coverage.

## Verdict
Keep the declared finite target of **12 documented source rows**. It is a bounded increase in technical detail on a lowest-axis tie, not a scalar depth increase: state `depth 8→8`, with no runtime, capability, completion-coverage, or twelve-independent-discoveries claim. This matches the prior SCORECARD distinction between detail improvement and no scalar promotion (`SCORECARD.md:888`). Do not replace the target with exhaustive completion coverage.

This is **not an arbitrary 12-row acceptance at the structural level**: the original design fixes LC01–LC12 and their spans (`.ufo/waves/round-20/design-declared.json:24-120`); the counter pins those IDs/spans and checks literal source quotes, source-row anchor coverage, and rendered-table agreement (`.ufo/waves/round-20/measure-c1.mjs:80-94,322-453`). The committed checkpoint manifest contains those 12 rows (`4ae99816b8994fdedc159156d8d9d242dd5c4782:corpus/evidence/round-20/lifecycle/decisions.json`). But the counter explicitly measures documentation shape, not semantic truth (`measure-c1.mjs:2-8,29-32`), and the chosen sample has no denominator. For example, LC04 and LC05 are the two arms of one entry-time `require_submit_button` test (`html_form_element.cc:212-221`); LC08–LC10 are distinct response-handler cases in one function (`:290-327`). S100 is the same URL, tag, and bytes as S096, explicitly not source diversity (`corpus/SOURCES.md:114`). Thus 12 is a reproducible count of the selected rows, not 12 units of independent semantic novelty.

**Dissent:** reject any wording that says the scalar depth axis moved or treats the row count alone as proof of new facts. The defensible claim is only the selected, source-anchored documentation delta; source review, not the counter, supports the individual branch descriptions.

## Operational value and counterexample
The SKILL table has modest, real lookup value for a reader diagnosing this exact Chromium 154 internal path: it separates fill-time refusal from running-state entry (LC02–03), the user-gated focus/pause path from the autosubmit callsite (LC04–05), cancellation and callback ordering, stale settlement, and `respondWith` rejection/serialization failures. Its repeated warnings not to infer a completed submission, navigation, or wire output are valuable calibration. It is not a runnable troubleshooting procedure: it provides no symptom-to-probe instructions, does not establish that a runtime reached a row, and is explicitly limited to one source/build and a finite sample (`SKILL.md:2207-2237`). Count it as playbook interpretation aid, not a new operational capability.

A concrete classification trap is in the companion note's **“Finite failure checklist”**: item 9 includes LC12, although LC12 calls `CallDoneCallback(base::ok(String()))` after `ScheduleFormSubmission` returns; the note itself says this is an internal sentinel, not proof of navigation, success, or CDP output (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:40,54-68`; source `html_form_element.cc:818-830`). The SKILL row is properly qualified, but calling this a *failure* can make a reader misdiagnose a success-valued internal result as an error. This is a limited editorial defect, not a reason to discard the table.

## Impacted axes
- **Depth:** bounded detail-submetric only; scalar remains 8. Do not equate count with novelty or semantic depth.
- **Coverage:** no change; the source-only/no-runtime boundary is correctly stated.
- **Calibration:** generally strong; the companion checklist's LC12 category is the one exception.
- **Operational utility:** positive as a source-specific branch reference, limited as troubleshooting because no runtime observation or probe recipe is supplied.

## Smallest safe correction
Keep C1's 12-row target and all scope limits. Report it as “12 fixed, source-anchored documentation rows; depth scalar 8→8,” not as twelve independent discoveries or a score increase. In the companion note, move LC12 out of “Finite failure checklist” into a short “Output-boundary caveat (not a failure)” item; retain the existing statement that the sentinel does not prove navigation or wire output. No demand for exhaustive path coverage.

**Verification:** source/manifest/SKILL text inspection only; no counter, self-test, gate, build, or runtime probe run.
Report: .ufo/waves/round-20/w2/ReviewSampleClaim.md