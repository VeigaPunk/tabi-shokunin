# S100 — `html_form_element.cc:816–842`

- **Located quote** (`HTMLFormElement::PrepareForSubmission`, lines 827–829; 12 words): “Return a null string to indicate that a navigation has been triggered.”
- **Pinned source:** [Chromium 154 `html_form_element.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), opened 2026-10-21. The `?format=TEXT` response was base64-decoded as data; decoded-file SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- **Retained comparison:** `corpus/evidence/round-20/sources/html_form_element.cc:816–842` has the same slice; SHA-256 of the extracted 27-line slice in both the decoded fetch and retained file is `34c06ae7f10a6a79a96d73ebe5cbabad89bce3cb01c14b1dc8203c4dd626fca8`.

## Source facts and scenario relevance

In `HTMLFormElement::PrepareForSubmission`, the `should_submit` guard encloses cancellation of a prior pending submission and `ScheduleFormSubmission(event, submitter)`. Only afterward, when `executing_tool` exists and `CurrentlyRunning()`, Blink checks `WebMCPEnabled` and calls `CallDoneCallback(base::ok(String()))`. Separately, `HTMLFormElement::submitFromJavaScript` schedules submission with null event/submitter, then calls the same null-`String()` success callback only if `active_webmcp_tool_` exists and is currently running; its comment describes the site calling `form.submit()` inside a submit handler.

This is relevant at source level only to a fixed12 scenario that actually reaches one of these submission paths while a tool is running—potentially the click, request-submit, native-submit, or autosubmit cases. The names of those cases do not prove which branch ran. In this slice, the effective guards are `should_submit` and a currently running tool; `String()` is the implementation's navigation-triggered callback sentinel. The slice does not show an autosubmit-selection rule.

## Unsupported inference / unknowns

This source slice does not establish per-case outcomes, callback timing bounds, emitted CDP status or `toolResponded`, a network response, or completed navigation. It does not explain reset/removal, rejection, throw, delayed, or pending behavior; nor does it prove how either invalid case reaches (or fails to reach) `should_submit`. Those remain runtime observations, not source-derived conclusions. **Confidence:** high for the pinned source, quote, branch guards/effects, and byte-for-byte slice match; low/undetermined for mapping any branch to a fixed scenario without its correlated runtime evidence.
