# Round 21 navigation first-falsification review

Axes reviewed: invocation/navigation/output correlation; fidelity of the submit-event observation; artifact provenance and scope.

## P2 — `after.submits` turns missing post-navigation state into an observed empty list

**Failure shape:** when the action navigates away from the form, the final observation is made in the landing document, which has no `window.observations`. If the old document had recorded a submit event before navigation, its array is no longer available to that final observation; the summary still emits `submits: []`.

**Evidence:** in the current `scripts/webmcp-lifecycle-round21.mjs`, `observe()` spreads the current document's `window.observations` at lines 140–146, while the landing response at lines 89–92 contains only a title and JSON-LD. The post-action path observes the current page at line 177 and sets `after.submits` to `post.value.submits || []` at line 178. Thus absence of the old-document field is collapsed to the same value as a captured zero. The round-21 note says “no submit event recorded” for `na-native-submit` (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:35`); that wording is only defensible as “no event appears in the retained record,” not as evidence that the old document's event listener observed zero.

**Minimum acceptance:** keep the required `submits` field but distinguish unavailable post-navigation state from an observed empty list (for example, an explicit observation-presence marker), or retain the old document's submit-event observation before navigation. Do not use the landing page's missing property as proof of zero events. This finding does **not** claim that an event fired in this fixed `form.submit()` case; it identifies that the summary cannot establish the contrary.

## Navigation/output result observed in the transient evidence snapshot

The evidence snapshot read earlier in this review was internally consistent for the requested result: `na-native-submit` recorded invocation `242BF867A565CCFAF46B3EA72A4D2C29`; raw frames paired the `invokeTool` result and `toolInvoked` with that ID, then ordered action (seq 12), `Page.frameNavigated` to `/landing?q=<nonce>` (seq 13), and `toolResponded` for the same ID with `Completed` and `[ {"dummy":"landing"} ]` (seq 14) (`corpus/evidence/round-21/runtime/na-native-submit.json:133–213`, previously present). The corresponding receipt had a 252 ms pre-action window with zero matching responses and an active form, followed by a 504 ms window, the correlated result, landing URL, and `formExists:false` (`corpus/evidence/round-21/runtime/receipt.json:186–250`, previously present). The server's landing body in the runtime source contains that JSON-LD value (`scripts/webmcp-lifecycle-round21.mjs:89–92`). This is one finite runtime observation, not a general guarantee.

The source note correctly keeps the C++ `base::ok(String())` navigation-intent sentinel separate from any CDP result or landing behavior (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:123,143–150`). Round-20 history also says the retained round-17 landing-document result is not reconciled from that source callsite alone (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:173–175`). The current observed CDP result is the relevant runtime evidence, not a source-derived prediction.

## Residual risk and verification gaps

- On rechecking during this review, `corpus/evidence/round-21/runtime/` was no longer present; the BuildRuntime clone also had no `webmcp-lifecycle-round21.mjs` or round-21 runtime evidence, and the BuildCounter clone had no round-21 counter file. The preceding result above is therefore explicitly a previously read snapshot, not a claim about a currently retained artifact or integrated commit.
- The lane-root runtime source was untracked (`git status --short` showed `??` for the script and the then-present receipt/evidence paths); `git diff` against baseline showed no tracked diff for those paths. Review is limited to the current source plus the snapshot above; final writer-blob provenance/integration remains unverified.
- No LSP device was mounted (`read xd://lsp` returned “No such tool”), so status/references/definition/diagnostics were unavailable. Direct source/evidence reads ground the findings; grep was only a locator.
- No tests, builds, linters, or browser run were performed, per assignment.

Report: .ufo/waves/round-21/w1/ReviewNavigation.md
