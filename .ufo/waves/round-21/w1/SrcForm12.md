# SrcForm12 — S100 form-submission slice

## Axes and scope

- **Source fidelity:** confirm the pinned Chromium source and retained copy are the same bytes.
- **Slice fidelity:** inspect only the requested lines 701–739, with surrounding lines used to interpret their control flow.
- **Interpretation discipline:** distinguish implementation branches from the twelve runtime observations; no behavior is asserted as observed here.

## Source identity and comparison (observed)

- **Exact URL:** <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT>
- **Access date:** 2026-10-21. The response's `Date` header was `Wed, 21 Oct 2026 12:44:55 GMT`.
- Retrieved the Gitiles `?format=TEXT` body and base64-decoded it as data outside the production tree. Decoded file: 1,740 lines; SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- The decoded file and `corpus/evidence/round-20/sources/html_form_element.cc` have the same SHA-256 and line count; a direct comparison of lines 701–739 found the slices identical. Thus the retained copy matches the reopened tagged source, not an independent source.
- The located quote (20 words; source line 719): “Interactive validation must be done before dispatching the submit event. We also re-perform this validation *after* dispatching the submit event.”

## Lifecycle guard, callback, and effect (source facts)

The requested slice is inside `HTMLFormElement::PrepareForSubmission` (registered S100 anchor 635–842). The immediately preceding entry guards at lines 638–648 return if there is no frame, submission is already in progress, the submit event is being handled by user JS, or the form is disconnected. At lines 720–727, Blink snapshots `active_webmcp_tool_`, checks `CurrentlyRunning()`, and, for an active declarative invocation, uses an `AutoReset` scope for `is_handling_submit_`.

At lines 729–759, interactive validation runs unless the page/submitter/form conditions set `skip_validation`. A validation failure prevents submission; for an active declarative invocation, Blink builds a validation message and calls the tool completion callback with `kToolInvocationFailed`. Otherwise lines 760–816 dispatch a cancelable submit event and mark it agent-invoked for a declarative call. After dispatch:

- If a `respondWith()` promise exists, the code requires `preventDefault()` (and checks that submission will not proceed), then attaches resolve/reject callbacks to `HandleWebMcpToolResponse` (lines 790–806). The handler returns the resolved value, JSON-serializing objects, or calls the completion callback with an invocation error on rejection (lines 290–328).
- If submission was canceled without a `respondWith()` promise, the completion callback receives a programming-error failure (lines 807–814).
- If submission proceeds, Blink schedules form submission and calls the active tool's completion callback with an empty string described as indicating navigation was triggered (lines 818–830). The separate `submitFromJavaScript()` path schedules submission and reports the same success form when a tool is running (lines 834–842).

These are conditional source branches, not evidence that any round-21 case actually entered one. For the fixed12 set, the validation and callback branches are relevant to `na-invalid-submit` and `auto-invalid` only if the invocation is active and validation is not skipped; the dispatch, cancellation, and `respondWith()` branches can inform interpretation of submit-action and delayed/rejected-response cases. They do not establish which action was delivered, whether a promise was supplied, or any case's observed result. In particular, the source does not define the receipt's finite pending interval or prove a response was absent during it.

## Unsupported inference and remaining limits

- Do not infer twelve outcomes, a universal WebMCP lifecycle, or an expected status from this source. The receipt's CDP frames and bounded observations must establish each case's outcome.
- This slice does not support `na-reset` semantics; reset handling is outside the inspected range and S100's registered 635–842 anchor. Removal handling is only discussed here for a form disconnected during submit-event dispatch (lines 777–784); that does not establish the separate `na-remove` action's outcome.
- A synchronous handler throw, an action's actual effect, timing, navigation, and whether the callback was reached are not established by the inspected slice. In particular, do not equate `na-throw` with the promise-rejection branch without runtime evidence.
- S100 is expressly recorded in `corpus/SOURCES.md` as same-source reuse of S096, not independent publisher/source diversity.

No registry row was added. No tool was installed or updated. No browser/runtime experiment, tests, build, or general verification was performed; work was limited to source retrieval, digest comparison, and the requested-slice comparison.