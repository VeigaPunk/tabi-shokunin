# S100 source slice: form callback lifecycle

## Observation

- **Source:** [Chromium 154 `html_form_element.cc`](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- **Access date:** 2026-10-21. The `?format=TEXT` response was base64-decoded as data before inspection.
- **Decoded SHA-256:** `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- **Retained comparison:** `corpus/evidence/round-20/sources/html_form_element.cc` has the same SHA-256; byte comparison succeeded. Its lines 787–815 match the fetched source slice exactly. This is same-source reuse, not independent corroboration.
- **Located quote** (`html_form_element.cc:795–796`, 18 words): “Wait for the provided promise to resolve or reject, and then call the active_webmcp_tool_'s callback with the result.”

## Lifecycle branch and scenario relevance

At lines 787–789 the code sets `declarative_webmcp_call` from `executing_tool && executing_tool->CurrentlyRunning()` and enters this branch only when that guard is true. If `TakeRespondWithPromise()` returns a promise, lines 798–806 attach both settlement callbacks to `HandleWebMcpToolResponse`, passing `resolved=true` for fulfillment and `resolved=false` for rejection. If there is no such promise and `should_submit` is false, lines 807–813 call the tool's done callback with `kToolInvocationFailed` and a programming-error message about `preventDefault()` without `respondWith()`.

This source branch is directly relevant to the fixed cases `na-pending`, `na-delayed`, `na-reject`, and `na-throw` only insofar as a still-running invocation reaches submit handling with a `respondWith()` promise: it describes settlement wiring, not the elapsed time or observed result. `na-click` and `na-requestsubmit` are relevant only if their action dispatches submit handling and reaches this guard. For `na-native-submit`, `na-reset`, `na-remove`, `na-invalid-submit`, `auto-positive`, and `auto-invalid`, this slice alone does not establish whether the branch is reached or what outcome follows.

## Inference limits / unresolved

These are build-scoped source branches, not runtime observations, a complete lifecycle path, or a prediction of any fixed-case outcome. The slice does not establish when an invocation settles, a universal pending timeout, status/event mapping, form validation or fill behavior, action-specific submit dispatch, autosubmit behavior, navigation or submission effects, or behavior after tool removal. In particular, “pending” remains only the harness's named finite no-matching-response interval; it cannot be equated here with an unresolved promise or eventual completion.