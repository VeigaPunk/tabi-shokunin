# RevCase09 — `na-delayed` source trace

## Scope and axes

This is a source reconstruction for fixed case `na-delayed`, not a run result. No browser experiment was run and no production code was changed. The six axes are: **input conversion**, **entry-time `toolautosubmit` decision**, **submit dispatch**, **callback storage**, **promise settlement**, and **native navigation**.

The case definition is in `scripts/webmcp-lifecycle-round21.mjs:14-27`: `autosubmit=false`, `action=requestSubmit`, `mode=delayed`. Its fixture has no `toolautosubmit`, a required `q` input, a submit button, and `action="/landing"` (`scripts/webmcp-lifecycle-round21.mjs:59-76`). It calls `preventDefault()` in the submit listener and resolves the `respondWith` promise only when `window.release()` is called. The runner waits 250 ms before the pre-action observation, runs the requested action, waits another 250 ms and records a pre-release observation, calls `window.release()`, then observes after a further 500 ms (`scripts/webmcp-lifecycle-round21.mjs:154-178`). These are finite harness windows, not a universal timing contract.

## Evidence identity and method

Primary source: reopened S100, Chromium `154.0.8037.97`, retained at `corpus/evidence/round-20/sources/html_form_element.cc`, SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Round-20 provenance identifies S100 as the same tagged body as S096/S078, not an independent source (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:42-52,108-123`). Source line references below are to that retained file.

No LSP device/server is mounted here (`xd://lsp` returned “No such tool”; the available-device inventory has no LSP route). I used direct reads of the pinned source; literal searches only located relevant spans and are not treated as semantic proof. The retained `html_form_element.cc` source is the basis of the source claims below.

## Reconstructed path

### 1. Input conversion

`HTMLFormMcpTool::ExecuteTool` receives `String input_arguments`; it writes the invocation id, computes the submission policy, and calls `FillFormControls` inside a `CEReactionsScope` (S100:174-194). `FillFormControls` parses that string as JSON, requires a JSON object, asks `FormMCPSchema` for the submit button, and calls `FillData` (S100:231-259). Thus the renderer-side boundary is JSON text → JSON object → form-schema fill. This excerpt does **not** define `FormMCPSchema::FillData`'s per-control conversion rules; for this case the expected filled `q` value must be checked in the page observation, not inferred from this callsite alone.

The round-17 CDP probe observed an object input at `WebMCP.invokeTool` and a JSON-string `toolInvoked.input`, and its no-autosubmit case used a later `requestSubmit()` while the invocation remained active (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:42-53,71-73`). For `na-delayed`, the runner supplies `{q: nonce}` (`scripts/webmcp-lifecycle-round21.mjs:154-156`); the expected correlated input is that value, with `toolInvoked.input` represented as JSON text. This bridge representation is historical runtime evidence, not a fact established by `html_form_element.cc`.

### 2. Entry-time `toolautosubmit` decision

At `ExecuteTool` entry, `require_submit_button` is computed as the negation of the form's current `toolautosubmit` attribute (S100:178-186). Here it is true. With a successful fill and the fixture's submit button, the method sets `is_currently_running_`, records the active button, updates the tool-form/button pseudo-states, and moves the invocation's `done_callback` into `done_callback_` (S100:196-210). The non-autosubmit arm focuses the button and calls `PauseExecution()`; only the other arm immediately calls `PrepareForSubmission()` (S100:212-221). Therefore this invocation does not submit at entry, and source predicts a pending active form before the runner's action, conditional on fill success.

The absence of `toolautosubmit` is decided at entry and stored in the local boolean. This branch is not an indefinite-pending guarantee: page actions, validation, unregistration, or other paths can change the eventual result. The r17 probe's no-autosubmit control observed no submit and no response for 2500 ms before a later page `requestSubmit()` led to `Completed`; that is the last-known-good bounded precedent, not a timing assertion for round 21 (`C2ProbeDeclarative.md:42-50,71-73`).

### 3. Submit dispatch

After the pre-action interval, the runner calls `document.querySelector('#f').requestSubmit()` from page JavaScript (`scripts/webmcp-lifecycle-round21.mjs:163-175`). This is a scripted submission action, not a claim that a human physically submitted the form. In the retained source, the no-argument overload delegates to `requestSubmit(nullptr)`, which calls `PrepareForSubmission(nullptr, control)` after any supplied-submitter checks (S100:845-873).

Assuming the fixture is connected, has a frame, is not already submitting, and the filled required `q` passes interactive validation, `PrepareForSubmission` dispatches a cancelable `SubmitEvent`. It sets `agentInvoked=true` when the active WebMCP tool is currently running (S100:635-760,769-776). The fixture's handler records `agentInvoked`, `isTrusted`, `q`, active state, and `typeof respondWith`, then calls `preventDefault()` and registers the delayed promise (S100-independent page fixture: `scripts/webmcp-lifecycle-round21.mjs:66-74`). Source establishes the `agentInvoked` condition; capture `isTrusted` as an observation rather than treating it as a conclusion from this source. The r17 `requestSubmit()` probe did observe `agentInvoked=true` and `isTrusted=true` with a running invocation (`C2ProbeDeclarative.md:29-34,71-73`).

If validation fails, `PrepareForSubmission` instead calls the active tool's failure callback before dispatching `submit` (S100:729-759). This is not the intended `na-delayed` input: the runner supplies the nonce string for the fixture's required text field. The separate r19 `decl-missing-required-01` case had `toolautosubmit`, empty required input, `Error` with `Form validation failed...`, and `submitCount:0` (`corpus/evidence/round-19/validation/receipt.json:1412-1466`; fixture at `corpus/evidence/round-19/validation/fixtures/missing-required.html:8-25`). That is a validation control, not evidence about delayed settlement or this valid non-autosubmit case.

### 4. Callback storage

There are two distinct stored objects. On successful invocation fill, `ExecuteTool` stores the original tool `done_callback` in `done_callback_` before taking the non-autosubmit focus/pause branch (S100:204-221). Later, on submit dispatch, `SubmitEvent::TakeRespondWithPromise()` yields the page's response promise; when present, `PrepareForSubmission` checks `!should_submit` and attaches resolve/reject handlers with `Then()` (S100:787-806). The promise is not the invocation callback, and the runner's later `window.release()` is not itself the tool callback.

### 5. Promise settlement

The fixture's delayed promise has no resolver call until the runner explicitly evaluates `window.release()` (S100-independent fixture and runner: `scripts/webmcp-lifecycle-round21.mjs:71-74,175`). Before release, source predicts no settlement from this promise; the evidence should show the same invocation still has no `toolResponded` during the recorded delayed-before-release interval. After release resolves the object, `HandleWebMcpToolResponse` first requires the tool still be running, JSON-stringifies a resolved object, converts it to a Blink `String`, and calls `CallDoneCallback(result)` (S100:290-319). `CallDoneCallback` returns without effects if its stored callback is null; otherwise it invokes that callback and then clears running/button/invocation state (S100:261-275).

Under those conditions, source predicts the delayed resolved-object path rather than the rejection, serialization-failure, or missing-`respondWith` branches. It does not itself specify the CDP `toolResponded` status/output mapping. Round 17 observed `Completed` with the resolved result for a `Promise.resolve(object)` declarative handler, including the no-autosubmit `requestSubmit()` probe (C2ProbeDeclarative.md:35-43,71-73). That is a useful precedent for the expected result after delayed settlement, but the delayed timing, full invocation-id correlation, and wire output for this case must come from the round-21 evidence, not be asserted from the source excerpt.

### 6. Native navigation

`preventDefault()` makes the submit event's `should_submit` false. With a `respondWith` promise present, `PrepareForSubmission` takes the promise branch and checks `!should_submit`; `ScheduleFormSubmission()` is called only in the separate `if (should_submit)` branch (S100:789-830). Therefore this fixture's intended delayed-response path does not call the native form submission scheduler, despite its `/landing` action attribute. The source's null-String navigation-intent callback is also in the `should_submit` branch and is not the expected completion value here (S100:818-830).

This is a conditional source conclusion, not proof that the document could not navigate by some unrelated script or browser action. To establish the observed outcome, correlate the ordered CDP `Page.frameNavigated` frames after `actionAt`, final page URL, and the receipt's loopback `requests`; a missing navigation is bounded to the measured post-action window. The r17 no-handler navigation control used `toolautosubmit` and did not prevent submission, so it is a distinct branch, not a counterexample to this prediction (`C2ProbeDeclarative.md:40-43,78-80`).

## Concrete evidence expected for `na-delayed`

For this one fixture, a reviewer should be able to verify the following from `corpus/evidence/round-21/runtime/receipt.json` and its `na-delayed.json` evidence, without substituting status labels for raw frames:

1. **Input and entry:** fixture path/hash and nonce; `autosubmit:false`, `action:"requestSubmit"`; `WebMCP.invokeTool` request/result, `toolInvoked`, and a common `invocationId`; JSON input/value for `q`; the page observation after the finite 250 ms pre-action window should show filled `q`, active form, and the focused submit button, with zero matching responses if fill succeeded.
2. **Dispatch:** the runner's `requestSubmit` action and completion markers; one page submit observation with the submitted `q`, `agentInvoked:true`, active form, callable `respondWith`, and the actual `isTrusted` value. Do not call the scripted `requestSubmit()` human-only; `agentInvoked` means an active declarative invocation is associated with this submit, not a human actor.
3. **Delayed settlement:** the ordered frames should put the delayed-before-release observation before the runner's `release` marker; no matching response is expected before release. After release, expect a correlated response within the recorded finite after-action window if resolution, JSON serialization, and callback delivery all succeed. Preserve the raw observed status, output/error fields, and frame order; `Completed` with the fixture's `{ok:true, nonce, q}` value is source-informed from the resolution plus the round-17 mapping, but the mapping is not proven by this C++ excerpt.
4. **Navigation:** no `Page.frameNavigated` after the action and no matching `/landing?...` server request are expected on the prevented-submit path. Record observed frames/requests and final page state; absence is only within the captured interval.

## Last-known-good, divergence, and confidence

**Last-known-good invariant:** round-17's no-`toolautosubmit` probe observed a bounded pre-action interval without a submit/response, then a page `requestSubmit()` while the invocation was pending, followed by `agentInvoked:true` and `Completed` (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:42-50,71-73`). Round 21's `na-delayed` adds an intentionally unresolved `respondWith` promise to that trigger path. **No divergence is established by this source-only report.** A response before the explicit release, a native form navigation on this fixture path, or failure to correlate post-release settlement would falsify a particular expected step, but must be judged against the raw case evidence.

**High confidence:** the source branch conditions for entry-time `toolautosubmit`, callback storage, `agentInvoked`, promise attachment, resolved-object callback, and the separation from `ScheduleFormSubmission`. **Moderate confidence:** the expected finite ordering and CDP output for the delayed promise, because bridge mapping and actual timer/event order are runtime matters; r17 supplies only the synchronous-resolve precedent. **Conditional/unknown:** per-control `FillData` behavior, early-return reachability, and any unrelated page navigation must be settled from the fixture observation and captured frames, not source names or comments.

Report: `.ufo/waves/round-21/w1/RevCase09.md`
