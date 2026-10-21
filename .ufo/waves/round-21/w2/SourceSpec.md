# SourceSpec — official HTML submission semantics

Axes: normative precision; current-run correlation; provenance separation; read-only scope.

## Concrete attack and result

Attack: interpret non-autosubmit completion, or a trusted submit event, as requiring a human, and use generic HTML semantics as if they guaranteed Chromium WebMCP results.

**Finding (high confidence): reject the human-only interpretation, but do not promote WHATWG HTML into proof of WebMCP completion behavior.** The official method definitions expose script-callable submission routes. The current retained requestSubmit case independently records completion after a page-script action, including a trusted event. The inspected knowledge note already makes this distinction correctly; no correction is required for this scoped attack.

## Opened external sources

Access date for both: **2026-10-21**. Opened via static `read`; no browser or production download. Quotes below are at most 25 words per opened source.

1. https://html.spec.whatwg.org/multipage/forms.html#dom-form-requestsubmit
   - Location: §4.10.3, `HTMLFormElement`, normative `requestSubmit(submitter)` algorithm, step 3.
   - Located quote (8 words): “Submit this form element, from submitter.”
   - Method steps immediately above distinguish `submit()` by setting the submitted-from-submit-method flag true. `requestSubmit` checks a supplied submitter's button type and form ownership, defaults a null submitter to the form, then invokes submission. No human-activation prerequisite is specified in these method steps.
   - Exact opened extraction: `artifact://53022:1151-1166` (session-local locator, not a repository source row).
2. https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm
   - Location: §4.10.22.3, form submission algorithm, step 5 and substeps 4–8.
   - Located quote (9 words): “If submitted from submit() method is false:”
   - Validation (unless no-validate applies) and cancelable SubmitEvent dispatch occur inside that conditional. Thus ordinary `requestSubmit()` follows that path, whereas `submit()` bypasses this validation/event block. The algorithm also has navigation/sandbox/reentrancy guards; neither method implies guaranteed successful navigation or completion.
   - The algorithm signature defaults user navigation involvement to none; it does not impose human involvement at entry.
   - Exact opened extraction: `artifact://53023:3090-3129`.

These are HTML normative algorithms, not the non-normative introduction, MDN compatibility blurbs, or WebMCP implementation source. They do not establish `agentInvoked`, `respondWith`, WebMCP.toolResponded status, output mapping, cancellation text, or correspondence between an installed binary and upstream source.

## Own-work evidence and call chain

All following paths are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

- `scripts/webmcp-lifecycle-round21.mjs:16-18` configures `na-requestsubmit` and `na-native-submit` with autosubmit false; `:212-214` selects input-pipeline click separately from `page.evaluate(...requestSubmit())` and `page.evaluate(...submit())`. These are distinct mechanisms, not three witnesses of human action.
- `corpus/evidence/round-21/runtime/na-requestsubmit.html:2-3` has no toolautosubmit attribute; `:7-15` observes the submit event, prevents default navigation, and supplies a resolved response promise in success mode.
- `corpus/evidence/round-21/runtime/na-requestsubmit.json:147-164` records invocation ID `DE3108EE3368EA4B38BE5A3FE48F7178`; `:168-195` records active pre-state, empty submits and requestSubmit action/acknowledgement (seq 12–14); `:198-209` records matching Completed response (seq 15); `:213-234` records `isTrusted:true`, `agentInvoked:true`, matching dummy nonce/value and inactive post-state (seq 16).
- `corpus/evidence/round-21/runtime/receipt.json:123-150` correlates the same case, invocation and Completed response after a 254 ms pre-action window with zero responses. `:181-183` points to its raw JSON. This is a finite observation, not indefinite pending or general success proof.
- `corpus/evidence/round-21/runtime/na-native-submit.json:185-235` records submit action/acknowledgement, landing navigation and matching Completed response with `[{dummy:"landing"}]`; `:239-249` observes the replacement document without the old form. `corpus/evidence/round-21/runtime/receipt.json:187-215` records the corresponding case and **submits:null**. The standard's bypassed submit-event block does not turn unavailable post-navigation telemetry into observed zero events. The landing output remains runtime evidence, not an HTML-standard guarantee.
- `.ufo/waves/round-21/runtime-execution-bounded.json:7-18` identifies the current producer, bounded-candidate output directory, producer digest, reason and retained exit/stdout. These are inspected acquisition records; I did not execute the producer or reverify hashes.
- `corpus/knowledge/webmcp-nonautosubmit-round-21.md:9-21,33-35,81-95` already separates finite own-work observations, source interpretation and binary equivalence; explicitly rejects human-only completion and treats trusted events as non-human witnesses. This scoped attack finds those boundaries intact.

## Observation versus inference and remaining gaps

Observed: the opened official algorithms and current retained script/action/raw-response records above. Textual callsite inspection supports the explicit producer-to-case route; it is not semantic-server proof.

Inference: the generic HTML script routes undermine treating submission itself as human-exclusive; the current Chromium fixture supplies the narrower WebMCP counterexample. Neither layer alone proves all non-autosubmit invocations can complete without intervention or that these paths behave identically across versions.

Unresolved/out of scope: normative WebMCP standardization; complete browser implementation conformance; DOM-standard derivation of isTrusted; upstream-tag/binary equivalence; all 12-case count admission and mutation-control completeness. No branch count, coverage percentage, actor-quiescence or indefinite lifecycle claim is made.

Semantic tooling: attempted `read xd://lsp`; device returned “No such tool” and listed mounted devices without LSP. No server was available to start/check/warm up, so definition/reference/hover tracing could not be performed. Literal search and bounded reads are explicitly the fallback, not semantic proof. No exported production contract was changed.

No tools installed or updated. No production, registry, source-row, sibling, or index writes. No builds/tests/linters/formatters, counter/selftest runs, browser actions, or new runtime execution. Only this report was written.

Report: .ufo/waves/round-21/w2/SourceSpec.md
