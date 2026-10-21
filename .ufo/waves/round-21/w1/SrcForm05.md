# S100 source slice: `html_form_element.cc:240–260`

- **Source:** [Chromium tag 154.0.8037.97 `html_form_element.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), accessed 2026-10-21. Gitiles `?format=TEXT` response was base64-decoded as data. Decoded-body SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (matches S100's registry digest).
- **Retained-copy comparison:** `corpus/evidence/round-20/sources/html_form_element.cc` has the same decoded-body SHA-256. The requested lines 240–260 match the fetched source exactly.
- **Located quote (17 words):** “No submit button was found, but for a form without `toolautosubmit`, there must be a submit button” (lines 254–255).

## Control flow relevant to round-21 cases

Observed in the requested slice: `FillFormControls` obtains `mcp_schema.SubmitButton()` (line 250). If it is absent while `require_submit_button` is true, it returns `kMissingRequiredSubmitButton` (251–256); otherwise it returns `mcp_schema.FillData(*json_obj)` (258). In the narrow caller context, `ExecuteTool` derives `require_submit_button` as the absence of `toolautosubmit` (181–182). An error is passed immediately to `done_callback` before active-tool state is set (192–206). On successful fill, the callback is retained; the non-autosubmit branch focuses the button and pauses execution, while the autosubmit branch calls `PrepareForSubmission` (212–221).

Thus this slice describes an initial fill/readiness gate relevant to the ten `na-*` cases versus the two `auto-*` controls: non-autosubmit execution requires a discovered submit button to reach the user-gated path; the autosubmit flag bypasses that particular requirement. It does not explain later submit/respondWith settlement. In particular, `na-invalid-submit` is a later action after fill, so this slice does not establish its submit-time validation result. The recorded fixed-12 outcomes remain runtime observations, not consequences proven by this source excerpt.

## Limits

The source does not establish a human-only submission rule, eventual completion, or any result for finite pending windows, `requestSubmit()`, native `form.submit()`, reset/removal, promise rejection, or script exceptions. Nor does this upstream source by itself prove source-to-binary equivalence for the tested Chromium build. The mounted tool inventory exposed no LSP device; caller/declaration context above is direct source reading, not language-server-verified references. No tool was installed or updated.