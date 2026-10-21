# Chromium 154 declarative form tool: execution, submission, response

## Source identity and retention

- **Primary URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- **Access date:** 2026-10-21; fetched from Gitiles as its base64 `?format=TEXT` body and decoded to UTF-8 source.
- **Tag identity:** `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (as recorded by the existing S071 source dossier).
- **Decoded body:** 68,278 bytes; 1,740 lines; SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- **Retained decoded body:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SrcHtmlFormTool.body.gz` (gzip, 15,885 bytes).
- The related S071 source `form_mcp_schema.cc` was fetched from the same tag to resolve FillData's mutation order: decoded body 51,703 bytes, SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`; its exact source is already represented by S071 and was not retained as a second lane artifact.

## Observed source map

The sole `FillData` call in the target file is `form_mcp_schema.cc` through `mcp_schema.FillData(*json_obj)` at `html_form_element.cc:258`.

- **174-198 — `HTMLFormMcpTool::ExecuteTool`:** stores the invocation id; computes `require_submit_button` as the inverse of `toolautosubmit` (`181-185`); calls `FillFormControls` inside `CEReactionsScope` (`189-194`). If it returns an error, runs the supplied callback with `base::unexpected(error.value())` and immediately returns (`196-198`). At this point the code has not set `is_currently_running_`, stored `done_callback_`, or called `PrepareForSubmission`.
- **200-220 — successful fill fork:** marks the tool running, sets active form/button pseudo-state and saves the callback (`204-210`). Without `toolautosubmit`, focuses the required submit button and calls `ModelContext::PauseExecution()` (`212-217`); with `toolautosubmit`, immediately calls `PrepareForSubmission(nullptr, submit_button)` (`218-220`). Thus no-autosubmit is user-gated after fill; autosubmit is not.
- **224-229 — cancellation:** `CancelTool()` returns `kToolCancelled` / “Tool execution cancelled by abort signal” through `CallDoneCallback`.
- **232-259 — `FillFormControls`:** initializes the submit-button output to null; rejects malformed JSON (`237-241`) and a non-object (`243-247`); builds `FormMCPSchema`, obtains its submit button, and rejects a missing button only when `require_submit_button` is true (`249-256`). Only then calls `FillData` (`258`). These early input/button errors precede form filling.
- **208-243 in S071's `form_mcp_schema.cc` — `FormMCPSchema::FillData`:** first loops through every JSON entry and returns `kInvalidInputArguments` for an unknown name (`211-220`) or a value rejected by `ValidateParameterData` (`221-231`). Only after that validation loop completes does a separate loop call `FillParameterData` for every entry (`234-241`). Its line-210 comment says invalid data leaves control state unchanged. So a `FillData` validation error does **not** leave an earlier valid input parameter partially applied. The value application pass itself dispatches input/change events for text and number controls (`form_mcp_schema.cc:930-959`); this is not a transaction over arbitrary page-script side effects during a successful fill.
- **261-275 — `CallDoneCallback`:** if there is a stored callback, runs it, clears the running flag and invocation id, and removes active pseudo-state. A direct fill error at `196-198` bypasses this stored-callback cleanup path because the tool has not yet entered running state.
- **290-328 — `HandleWebMcpToolResponse`:** ignores settlement if the tool is no longer running (`294-297`). On resolve, serializes object results with `JSON.stringify`; serialization failure becomes `kToolInvocationFailed` (`299-313`). If no JSON result string was produced, it converts the original value to a string, then calls back successfully (`316-319`). On rejection, reports the exception and returns `kToolInvocationFailed` with the generic message “respondWith promise was rejected” (`320-327`); the rejection value is not passed as this callback's error text.
- **353-408 and 410-463 — registration changes:** unregistering an invalid/disconnected tool or replacing it after attributes/schema change cancels a running invocation with `kToolCancelled` unless it is already handling submit (`390-396`, `447-455`); new registration carries the current `toolautosubmit` value (`415-417`, `457-462`). An attribute change schedules registration (`1132-1136`).
- **635-660 and 662-680 — submission guards:** `PrepareForSubmission` returns early if there is no frame, a submission is already active, the call is from inside a JS submit handler, the form is disconnected, or forms are sandbox-blocked. With `UnclosedFormControlIsInvalidEnabled()`, an implicitly closed form control similarly logs an error, dispatches an `error` event, then returns (`663-680`). These branches follow a successful fill but do not themselves invoke the tool callback.
- **684-760 — constraint validation:** forces user-valid state (`684-694`), then runs interactive validation unless the page/form/submitter bypasses it (`713-729`). For a declarative tool call, invalid controls make `should_submit = false` and the tool callback receives `kToolInvocationFailed` with “Form validation failed: ” plus each invalid parameter name and validation message (`731-759`). This is **after** successful `FillData`; this branch contains no rollback of values applied during fill.
- **761-815 — submit event and `respondWith`:** dispatches a `SubmitEvent`; a declarative call marks `agentInvoked` (`769-774`), and `should_submit` reflects whether the event was canceled (`775-776`). If the tool is still active and the event supplies a `respondWith` promise, Blink checks `!should_submit` and waits for resolve/reject using `HandleWebMcpToolResponse` (`789-806`). If the event was canceled but no promise was supplied, it returns `kToolInvocationFailed` with the site-programming-error message (`807-814`).
- **818-842 — ordinary submission completion:** when `should_submit` is true, schedules form submission (`818-824`) and, if the tool remains active, returns `base::ok(String())` to mean navigation was triggered (`825-830`). A page's `form.submit()` path also schedules submission and resolves an active tool with an empty string (`834-842`).
- **1084-1109 — reset:** after a successful reset event, resets controls, then cancels an active tool with `kToolCancelled` / “Tool execution cancelled by a form reset” (`1101-1105`). If this or another cancellation happens before a pending promise settles, the response handler's `CurrentlyRunning()` check drops the later settlement (`294-297`).

## Answers, with scope

- **Fill error:** malformed/non-object input, a missing required submit button, an unknown parameter, or a rejected supported parameter value goes to an error callback before `PrepareForSubmission` and before submit-event dispatch. For `FillData` validation errors, all entries are checked before any `FillParameterData` call, so no earlier valid entry from that invocation is left partially written. This is a source-level conclusion; successful value application dispatches events, and the source does not promise isolation from side effects of page listeners.
- **Autosubmit:** the form is submitted immediately after a successful fill, subject to the submission guards and normal form validation.
- **No autosubmit:** the submit button is required; after successful fill Blink focuses it and pauses execution, awaiting the user to submit. Once submitted, the same validation, `submit` event, `respondWith`, and completion paths apply.
- **Response/error:** a fulfilled `respondWith` result is serialized/string-converted and returned as success; object serialization failure, rejected promises, invalid form constraints, and canceled-submit-without-`respondWith` are explicit tool errors in this file. A non-canceled submission returns success with an empty string for navigation. The exact conversion of these `McpToolCallbackResult` values into the final CDP `toolResponded` status/error payload is upstream of this source file and is not asserted here.

## Quotes

1. > If the data isn't valid, form control states remain unchanged.
   — `form_mcp_schema.cc:210`, `FormMCPSchema::FillData` (10 words); URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`; accessed 2026-10-21; decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
2. > Without `toolautosubmit`, we focus the submit button, tell the agent to allow user input, and wait for the user to submit it.
   — `html_form_element.cc:213-214`, `HTMLFormMcpTool::ExecuteTool` (22 words); URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`; accessed 2026-10-21; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
3. > With the `toolautosubmit` attribute, we immediately submit the form.
   — `html_form_element.cc:219`, `HTMLFormMcpTool::ExecuteTool` (10 words); URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`; accessed 2026-10-21; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
4. > respondWith promise was rejected
   — `html_form_element.cc:326`, `HandleWebMcpToolResponse` (4 words; literal error text); URL `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`; accessed 2026-10-21; decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.

## Proposed SOURCES row (not written to the registry)

S071 already scopes declarative input validation and includes `html_form_element.cc:192-258`. This proposal is distinct: it covers the post-fill submit/respondWith lifecycle and callback result mapping.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 HTMLFormElement declarative form execution — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | code | A | Chromium 154 declarative form tool after input validation: toolautosubmit versus user-gated submission, submit/respondWith completion and callback errors; source-level only | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d); html_form_element.cc:174-328, 635-842; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 | After successful fill, toolautosubmit submits immediately while the default path waits for user submission; constraint/handler errors and respondWith settlement are returned through the tool callback, while navigation submission returns an empty string. | queued | 2026-10-21 | on-release | — |

## Unresolved gaps and method

- Static source inspection only; no browser/runtime probe was run, so no observed Chromium behavior is claimed.
- `xd://lsp` was unavailable: the mounted-device inventory returned “No such tool: xd://lsp.” Literal grep located definitions/calls and the relevant source was read directly; no LSP semantic result is claimed.
- The callback-to-CDP status/error conversion is outside this source file (see the existing S042/S071 source lineage); it is left unresolved here rather than inferred.

## Isolation

- Clone/branch/base/commit: not applicable; source-only scout assignment, no production file or repository history changes.
- Lane artifacts written: `.ufo/waves/round-19/w1/SrcHtmlFormTool.md` and `.ufo/waves/round-19/w1/SrcHtmlFormTool.body.gz` (the assigned report and retained source-body exceptions only).
- Temporary fetched source bodies: `/fast/scratch/tabi-r19/`; no other LANE paths were written.
