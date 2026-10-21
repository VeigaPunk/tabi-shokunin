# S100 — `html_form_element.cc:665–700`

## Source and byte comparison

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- Accessed: 2026-10-21. The first request returned HTTP 503; a retry succeeded. Decoded the Gitiles `TEXT` response as base64.
- Base64 response body: 91,040 bytes, SHA-256 `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`. Decoded source: 68,278 bytes, SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- The decoded source is byte-identical (`cmp`) to `corpus/evidence/round-20/sources/html_form_element.cc`; both have 1,740 newline-delimited lines. The displayed lines 665–700 match. The S100 registry row records that same decoded digest and explicitly identifies this as same-source reuse, not independent corroboration.

## Located quote

At lines 687–688 (13 words): “After attempting form submission we have to make the controls start matching :user-valid/:user-invalid.”

## Observed source behavior

The enclosing routine is `HTMLFormElement::PrepareForSubmission`. Within the requested span:

- For a listed HTML form control whose `BlocksFormSubmission()` is true, Blink counts `kFormSubmittedWithUnclosedFormControl`. If `UnclosedFormControlIsInvalidEnabled()` is also true, it logs an error, dispatches an `error` event on the form, and returns from the routine. This is a specific unclosed-control guard, not a general form-validity result.
- Otherwise the routine proceeds to call `ForceUserValid()` for each listed `HTMLFormControlElementWithState`. The adjacent comment explains the intended `:user-valid`/`:user-invalid` matching effect and why it avoids simulating user editing that would have autofill side effects.
- The span then initializes `should_submit`, `executing_tool`, and `declarative_webmcp_call`, and begins a scoped `base::AutoReset<bool>` for `in_user_js_submit_event_`. The assignment value `true` is on line 701, just beyond the requested span. No WebMCP callback or completion handling appears in lines 665–700.

## Relevance and limits for the fixed12 observations

This is source evidence for a conditional pre-submission error/early-return path and a control pseudo-state effect if a fixed12 action reaches `PrepareForSubmission`. It does not establish which scenario reaches that routine or the observed outcome. In particular, the unclosed-control check does not define the generic `na-invalid-submit` or `auto-invalid` result. The span provides no basis to predict pending versus response, callback resolve/reject/throw or delay, navigation, reset/remove effects, or any individual scenario’s CDP outcome. Those remain runtime observations; no expected statuses are inferred here.

No registry rows or production source files were changed. No tools were installed or updated.