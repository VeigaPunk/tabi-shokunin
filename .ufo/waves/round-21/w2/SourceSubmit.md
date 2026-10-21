# SourceSubmit — native submit interpretation

## Scope and axes
Attack: try to derive the protocol output directly from S100's `base::ok(String())`, then compare against the current retained raw event. Axes: source-claim containment, invocation/nonce correlation, and preservation of observational uncertainty. Read-only inspection; no browser, gates, selftest, counter execution, production edits, or delegation.

## Finding: scoped agreement; String-to-output inference is contradicted
**High confidence, retained evidence.** The current note correctly separates S100 interpretation from S101 output observation (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:15-21,35`). The native-submit raw protocol output is an array `[{"dummy":"landing"}]`, not null, an empty string, or the submit handler's `{ok,nonce,q}` result. Therefore the C++ default `String()` must not be treated as the final WebMCP output value. No contradiction found in this narrowly stated note row.

### S100 source interpretation
- `.ufo/waves/round-21/sources/html_form_element.cc:834-842`, `HTMLFormElement::submitFromJavaScript`, calls `ScheduleFormSubmission(nullptr, nullptr)` and conditionally calls `active_webmcp_tool_->CallDoneCallback(base::ok(String()))` when a tool exists and is currently running.
- The explanatory comment at 837-838 mentions manual `form.submit()` inside a submit handler, but the actual condition at 839 does **not** require being inside that handler. Treating the comment as an exclusive eligibility condition would overread this source.
- Adjacent source 824-829 explicitly describes a null string as indicating triggered navigation; it does not specify the final protocol JSON output or guarantee successful landing.
- Literal callback definition at 261-274 forwards the result, clears running state and invocation identity, and updates pseudo-state. This supporting definition is outside the registered 635-842 native-path anchor; it is not needed to infer the observed output and should not be promoted as a new S100 registered anchor.
- None of these lines establishes JSON-LD extraction/array conversion. The downstream callback consumer and browser protocol mapping are not established by this inspection.

External provenance (retained opening, not a new network fetch): URL https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; recorded access **2026-10-21T12:37:47.692898+00:00** in `.ufo/waves/round-21/source-opening.json:2-6`; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Located quote (4 whitespace-delimited words), source line 841: `active_webmcp_tool_->CallDoneCallback(base::ok(String()));`. Source-to-installed-binary equivalence is unresolved, not asserted.

### S101 current raw correlation
Own-work paths are relative to the lane root:
- Current acquisition selector: `.ufo/waves/round-21/runtime-execution-bounded.json:5-14` identifies producer `scripts/webmcp-lifecycle-round21.mjs`, bounded-candidate output, and producer SHA `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`. No historical acquisition was substituted.
- `corpus/evidence/round-21/runtime/na-native-submit.json:138-165`: invoke input q is `de22b3e0-4e2d-4e2b-a4de-00680a4a0630`; command result and `toolInvoked` agree on invocation `F38D811156543B28407621D0AA231CA7` and frame `874DCBB19943AB5C6C788D9A9EC22218`.
- Raw seq12 (168-182): same nonce filled, active form, initial URL, and `submits: []`. Seq13-14 (184-196): submit action dispatch and acknowledgement. The actual action is page-script `document.querySelector('#f').submit()` in `scripts/webmcp-lifecycle-round21.mjs:214`, not requestSubmit or a click.
- Raw seq15 (197-222): same frame navigates to `/landing?q=de22b3e0-4e2d-4e2b-a4de-00680a4a0630`. Seq16 (223-237): matching invocation responds `Completed` with `output: [{"dummy":"landing"}]`. Seq17 (238-250): landing URL and no form. These events precede the post observation boundary.
- `corpus/evidence/round-21/runtime/receipt.json:187-249` agrees: pre window 252 ms, zero matching responses; after window 503 ms, one Completed output array, landing navigation, and **submits null**. Post-navigation old-document submit count is unavailable, not observed zero.
- `corpus/evidence/round-21/runtime/na-native-submit.html:2,5-15` has no toolautosubmit, contains the matching nonce, and its submit handler would prevent default and return `{ok:true,nonce,q}`. The distinct raw landing output does not come from that handler's declared value.
- Own-work landing response construction is `scripts/webmcp-lifecycle-round21.mjs:135-137`: HTML contains one `application/ld+json` object `{"dummy":"landing"}`. The raw result matches that content. **Inference:** landing JSON-LD explains the observed array content; this is not a traced Chromium downstream implementation contract, nor an independently retained HTTP response-body capture.

## Remaining limits and tooling
`read xd://lsp` returned “No such tool” with the mounted-device inventory; semantic definition/references/hover operations are unavailable in this seat. Source definitions and callsites above are literal text evidence, not LSP-resolved semantic proof. No universal no-submit-event assertion, arbitrary-navigation result rule, binary/source equivalence, novel-branch count, coverage percentage, or actor-quiescence claim follows. No tools installed or updated. No verification commands were run.
