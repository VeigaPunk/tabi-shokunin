# SrcForm10 — S100 lines 635–664

## Source and comparison

- **S100 URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- **Accessed:** 2026-10-21. The Gitiles `?format=TEXT` payload was base64-decoded as data.
- **Pin:** Chromium tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- **Decoded source SHA-256:** `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- Compared with retained `corpus/evidence/round-20/sources/html_form_element.cc:635–664`; the inspected lines match exactly. This is same-source reuse, not independent corroboration.

## Located quote

> `if (!frame || is_submitting_ || in_user_js_submit_event_) { return; }`

`html_form_element.cc:637–639` (under 25 words).

## Lifecycle guard and scenario relevance

`PrepareForSubmission` returns when there is no frame, submission is already in progress, or execution is inside the user-JS submit-event guard. It also returns for a disconnected form (with a warning) and a form-sandboxed execution context (with a security error). At line 663 it begins iterating listed elements; line 664 only starts casting each item to a form-control element. These are source-level entry guards, not runtime outcomes.

For the fixed 12 cases, this slice is relevant only conditionally: any path that reaches this function can be stopped by those guards; in particular, a removed/disconnected form would not proceed through this entry point. It does not distinguish non-auto actions from `toolautosubmit`, and does not establish that any named case reaches this function. No callback, completion, or promise-settlement path is shown in these lines.

## Unsupported inference / remaining gap

This slice cannot predict a case's response count/status, pending interval, callback or promise outcome, navigation/network effect, reset behavior, or auto-submit result. It supplies no basis for calling script submission human-only, nor for universal lifecycle certification. Those remain runtime observations or require evidence from other source locations; this report covers only lines 635–664.
