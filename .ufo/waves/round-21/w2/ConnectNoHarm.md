# ConnectNoHarm — one bounded synthesis

## Axes and boundary

C1 is **depth**, lowest non-retired tie8, target0→12 finite receipt-bound loopback observations, not twelve new branches or coverage percentage (`SCORECARD.md:973-984`). Calibration is an unchanged-axis constraint, and quality a no-harm trend constraint; neither becomes an additional claim. Operability, freshness, coverage and adjacency receive no new credit. This is author-side read-only review, not admission or independent closure.

**Proposed move:** attach a small, revision-bound **contrast witness** to the already-required separate semantic review: explicitly show that the structural counter's positive fixture is not a positive semantic oracle, and pair each published contrast with its existing raw distinguishing witness. Keep the counter's finite-observation meaning and target unchanged. No new browser run, runtime surface or production edit is proposed.

## Evidence and concrete attacks

### Attack 1 — substitute structural green for semantic agreement

The independent fixture already supplies the cheapest counterexample. In `.ufo/waves/round-21/fixtures/positive-ordered.json`, JSON pointer `/files/corpus~1evidence~1round-21~1runtime~1receipt.json` (parse the embedded JSON string), **every case** has `preAction.responseCount=0`, `after.responses=[]`, `after.submits=[]` and `after.navigations=[]`. This includes both autosubmit controls and the click, native-submit, reset/removal and delayed cases. Its embedded `na-delayed.json` has only seven frames, with no `delayed-before-release` or `release` marker. Yet `fixtures/expected.json:2-7` declares the structural positive expected exit0/value12.

That is not evidence of a failed actual experiment: the current acquisition records a different population. `.ufo/waves/round-21/runtime-execution-bounded.json:11-18` identifies the bounded producer and records exit0; its retained stdout reports autosubmit pre=1, completed click/requestSubmit/native-submit/delayed, canceled reset/removal and error cases. `corpus/evidence/round-21/runtime/receipt.json:59-119` concretely records click Completed, nonce-bearing output, trusted/agentInvoked submit and inactive post-state.

**Contradiction, stated rather than scored away:** calling the synthetic positive a positive oracle for the note's contrasts conflicts with its all-silent population. Calling it a structural correlation oracle does not conflict. `selftest-c1.mjs:2` describes an independent oracle, but `:110-115` compares CLI exit/value/finding IDs, not semantic agreement with note rows. No test was run here; expected and retained observed results are distinct evidence classes.

### Attack 2 — coherently erase the delayed discriminator while retaining the final response

Current raw `na-delayed.json:197-241` has observation seq15, label `delayed-before-release`, active form and one submit; release seq16; matching Completed response seq17. Its pre-action marker is seq12 (`:167-183`), action acknowledgement seq14 (`:191-196`), post marker seq18 (`:242-266`). Producer `scripts/webmcp-lifecycle-round21.mjs:222` deliberately acquires the intermediate observation and release marker. Note `corpus/knowledge/webmcp-nonautosubmit-round-21.md:40` explicitly relies on those witnesses.

Concrete unexecuted mutant: remove the intermediate observation from both `frames` and `pageObservations`, remove the release frame, renumber surviving frames and adjust post-marker mirror, then refresh the evidence digest in the receipt. Retain the same terminal Completed response and final page state. **[INFERENCE from static predicates]** `measure-c1.mjs:88-96` requires only pre/post markers plus action acknowledgement and mirrored summaries; it never requires the delayed marker/release discriminator. The synthetic delayed fixture demonstrates that those markers are outside its declared structural-positive contract. `selftest-c1.mjs:22-95` and `fixtures/expected.json:152-169` contain marker/order controls but no delayed-discriminator deletion control.

This is not a demand that C1 become a universal timing validator. The missing semantic witness belongs in the separate semantic review already required by note `:103-106`.

### Attack 3 — mirror a wrong status into both raw and summary

Concrete unexecuted mutant: change the current click matching response's `status` from Completed to Error in the raw event and receipt summary, refresh that evidence digest, leave the published Completed claim unchanged. **[INFERENCE]** `measure-c1.mjs:85-96` verifies invocation identity and summary equality, not a per-case status/output predicate; `:65` checks only that the note names the case, and `:100` counts structurally clean cases. A coherent status change therefore is not equivalent to the existing `response-mismatch` control (`selftest-c1.mjs:39`), which changes only the summary. This is the same root mismatch as attacks1–2: byte/mirror agreement does not entail the published contrast.

## Cross-surface synthesis and no-harm conditions

Use one compact contrast-witness section in the existing semantic-review output, keyed by current revision, case ID, invocation ID and raw seq/field anchors. For each already-published note row, identify only its actual discriminator: finite silence; matching status/output and submit mechanism; native navigation plus unavailable old-document submits; cancellation/error text; delayed intermediate/release ordering; or autosubmit pre-window settlement. Mark source interpretation separately from runtime observation, retaining reset/removal as S101-only. Include the structural-positive/all-silent example above as the explicit non-entailment control.

- **Runtime:** consume only retained bounded-run evidence, not history and not another execution. Preserve sequence cutoffs, finite absence wording and null-not-zero navigation state. Do not derive causation from an acknowledgement or trusted event flag.
- **Contract/depth:** C1 remains an observation counter, not a semantic conformance gate; no added claim, denominator, branch novelty or scalar promotion. The witness is the already-required separate semantic review's evidence, not another counted artifact.
- **Substrate/adjacency:** no new tool, browser version, host permission, source-to-binary equivalence or publisher-diversity claim. Requested flags remain requested flags, not effective host argv.
- **Calibration/quality:** make structural-clean/semantic-contradiction simultaneously expressible. If a published contrast disagrees with retained raw bytes, state that contradiction; do not silently force the count to express semantic judgment or rewrite the historical acquisition.
- **Operability/freshness/coverage:** leave production counter semantics and archived evidence untouched. Avoid maintaining a second independent executable checker or mutable duplicate data table; raw anchors in existing review suffice.

**Conditional benefit:** depth becomes more defensible and calibration/quality lose an identified category-confusion path without widening runtime or count scope. This is a proposed no-harm synthesis, not an observed axis improvement or an admission decision.

## Risks and verification handoff

Risk: turning the witness into a new hardcoded twelve-outcome counter would silently narrow an observation metric into expected-success conformance, making honestly different future runs uncountable. Risk: a prose mirror of expected statuses without raw anchors merely duplicates the error. Risk: treating seq15/16/17 as universal constants would misbind another acquisition; sequence numbers here identify this retained case only. Mitigation is the revision/case/invocation binding and explicit structural-versus-semantic distinction.

L1 alone can run final serial verification. For this move, its semantic review should inspect the current raw discriminator for each existing note row, retain the all-silent structural fixture as a deliberate non-entailment example, and assess the delayed-marker deletion and coherently mirrored wrong-status controls separately from summary-only corruption. Expected result: structural evidence may remain countable while the semantic contrast is explicitly unsupported/contradicted; no invented counter failure is required. These controls are proposed and **not executed** here. Check that README `corpus/README.md:466-487` and note `:9-21,45-67,98-106` continue to distinguish finite runtime, prior evidence, own-work authority, source interpretation and semantic closure. Current README already makes those scope distinctions; no README defect or edit is asserted.

Reviewed root `README.md:1-14` (domain/index only) and corpus README's current round21 block. Only this report was written. No builds, tests, linters, formatters, browser, runtime, git mutation, delegation, or production writes. No tools installed or updated. No actor-quiescence claim.

Report: .ufo/waves/round-21/w2/ConnectNoHarm.md
