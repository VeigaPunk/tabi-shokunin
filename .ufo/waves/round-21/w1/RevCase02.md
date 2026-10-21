# RevCase02 — `na-click` source trace

## Scope and axes

This is a source reconstruction for the fixed `na-click` case, not a run result. No browser experiment or code change was made. The four axes are: **input/state**, **trigger-to-submit path**, **completion channel**, and **native-navigation evidence**.

Assumption for the conditional trace below: the fixture has no `toolautosubmit`, has a submit button, and receives valid input. Where the fixture's submit listener or the click implementation matters, the report says so rather than supplying an unobserved result.

## Evidence identity

Primary source is reopened S100, Chromium `154.0.8037.97` `html_form_element.cc`, retained at `corpus/evidence/round-20/sources/html_form_element.cc` (SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`). The round-20 lifecycle note identifies S100 as the same tagged source/body as S096/S078, with S100 used for the wider submit-path rendering; it is not an independent source (`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:42-52,108-123`). Line anchors below refer to this retained body.

No `lsp` device/server is mounted: an attempt to read `xd://lsp` returned “No such tool,” and the available-device inventory contained no LSP route. I used direct reads of the pinned source and literal searches only to locate probe text; search output is not semantic proof. No tool was installed.

## Reconstructed path

### 1. Input conversion and fill

The CDP invocation boundary and the renderer's form fill are distinct. Round-17 documents `WebMCP.invokeTool` input as an object while `toolInvoked.input` is observed as a JSON string; the retained S100 method receives `String input_arguments` (`corpus/knowledge/webmcp-invocation-round-17.md:50-55,86`; S100:174-177).

`ExecuteTool` writes the invocation id, computes `require_submit_button` once from the form's entry-time `toolautosubmit` attribute, and calls `FillFormControls` inside a CE-reactions scope (S100:178-194). `FillFormControls` parses the string as JSON, requires a JSON object, asks `FormMCPSchema` for a submit button, and calls `FillData` (S100:231-259). Thus `na-click` must not conflate JSON-to-control filling with later native `FormData`/request serialization. With no `toolautosubmit`, a missing schema submit-button result returns `kMissingRequiredSubmitButton` before `FillData`; a fill error takes the immediate error-callback branch (S100:196-198,249-259). Those error paths would not establish the expected active pre-action state.

The retained `html_form_element.cc` delegates per-control acceptance/application to `FormMCPSchema::FillData`; it does not define that conversion. Round-19 S077 material separately documents fill-time errors versus later interactive submit validation and the constraints of the measured control cases (`corpus/knowledge/webmcp-declarative-validation-round-19.md:33-42,66-75`). The relevant r17 no-autosubmit probe fixture has a required text parameter and a submit button (`.ufo/waves/round-17/probes/invoke-declarative.mjs:194-199`).

### 2. Entry-time non-autosubmit branch and pre-action state

When `toolautosubmit` is absent at invocation entry, `require_submit_button` is true. After a successful fill, S100 sets the tool running, records the active submit button, changes the form/button pseudo-state, and stores `done_callback_` (S100:181-210). It then focuses the button and calls `ModelContext::PauseExecution()`; the `PrepareForSubmission()` call is in the *other* branch, when `toolautosubmit` was present at entry (S100:212-221).

So the source-informed pre-action expectation, conditional on fill success, is: the form is active and no submit has yet been dispatched by `ExecuteTool`; the completion callback has been retained. This is not an indefinite-pending claim. Round-21 defines pending only as no matching response within that receipt's named finite interval. The r17 probe observed no submit/`toolResponded` for 2500 ms before a later page `requestSubmit()` completed the call; that is a historical bounded probe, not the round-21 interval or a guarantee (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:42-49,71-73`).

### 3. Click-to-submit dispatch

The retained form source does **not** contain the submit button's click default-event handler. It does show `SubmitImplicitly()` dispatching a simulated click for implicit submission and a separate direct call to `PrepareForSubmission()` for one implicit case (S100:552-590); this is not proof of the actual button-click caller. Therefore **click → `PrepareForSubmission(event, button)` is an inference from the intended native submit-button activation**, not a call edge established by this retained file. The r17 no-autosubmit probe uses `form.requestSubmit()` after its wait, not a button click; r19 validation fixtures are autosubmit fixtures (for example `checkbox.html:5-10`), so neither is a runtime click witness.

If the click does reach `PrepareForSubmission()` while the tool remains active, S100 identifies an executing declarative tool, performs interactive validation before dispatch, and creates a cancelable `SubmitEvent` whose `submitter` is the supplied element; it sets `agentInvoked=true` for that active tool (S100:713-776). A validation failure instead calls the tool callback with `kToolInvocationFailed` and the validation message before any submit event (S100:729-759). For a valid fixture, capture the actual submit event and its submitter rather than assuming the click bridge or `isTrusted` value from this source.

`agentInvoked` is not evidence that a human physically submitted the form. The r17 probe observed `agentInvoked=true` for page-initiated `requestSubmit()` while a declarative invocation was pending (C2ProbeDeclarative.md:47-50,71-73). Do not characterize script submission as human-only; in this source the flag follows the active declarative invocation state.

### 4. Callback storage and promise settlement

There are two separate stored objects: S100 stores the invocation's `done_callback_` at entry (line 210); after submit dispatch, `TakeRespondWithPromise()` can yield the page's `SubmitEvent.respondWith()` promise. If a promise is present, the source requires that default submission was canceled, then attaches resolve/reject handlers (S100:789-806). A resolved object is JSON-stringified before `CallDoneCallback`; a resolved non-object follows `ToString`; rejection reports the exception and calls back with `kToolInvocationFailed` (S100:290-328). `CallDoneCallback()` runs a non-null stored callback first and clears running/button/invocation state afterward (S100:261-275).

For the existing r17 inline `f-nosubmit` fixture, the submit handler calls `preventDefault()` and `respondWith(Promise.resolve(...))` (probe source `invoke-declarative.mjs:169-176,194-199`). Reusing that handler, the source-informed expectation after a successful click is a canceled default submission followed by the resolved-promise callback path; r17 previously observed a `Completed` response with its object after `requestSubmit()`, but that is not a measured click outcome (C2ProbeDeclarative.md:71-73). The source alone does not establish the eventual CDP status/output mapping. Also retain actual unknown/error statuses; do not replace them with an expected result.

If a listener prevents default but supplies no usable `respondWith` promise, the source has a programming-error callback branch; if it supplies a rejected promise, the rejection branch applies (S100:807-814,320-327). Those are alternatives, not predictions for the `f-nosubmit` resolved-promise fixture.

### 5. Native navigation is a separate branch and needs separate evidence

Only if submit dispatch leaves `should_submit` true does `PrepareForSubmission()` call `ScheduleFormSubmission(event, submitter)` (S100:775-776,818-829). The scheduler can return early; otherwise it creates `FormSubmission`, checks connection/method/action/sandbox/target-frame navigation permission, and eventually asks the target frame to schedule the form submission (S100:882-1042). A listener that calls `preventDefault()` and successfully uses `respondWith()` takes the promise path, for which the source has `CHECK(!should_submit)`; it is not the native-default-navigation path (S100:790-806).

After `ScheduleFormSubmission()` returns, the active tool's callback receives `base::ok(String())`, which the source comment describes as a navigation-intent sentinel. This call is not conditioned on a successful frame-scheduling return value; the C++ sentinel is not proof that a navigation occurred or that any particular CDP output was emitted (`S100:818-830`; round-20 correction, `webmcp-completion-lifecycle-round-20.md:40,44,123-145`). Native navigation therefore requires independent observations—ordered navigation CDP frames and a matching loopback server request—not merely the callback or `toolResponded`.

The r17 no-handler navigation control is not transferable as a `na-click` result: it used `toolautosubmit` and observed navigation plus `Completed`/empty-array output (C2ProbeDeclarative.md:40-41,78-80). Conversely, with the r17 `f-nosubmit` response handler, the relevant expected path is `respondWith`, not navigation. The actual r21 fixture/listener determines which applies.

## Concrete evidence to retain for this case

For one fresh case, the round-21 receipt/evidence should allow a reviewer to correlate, not infer, each stage:

1. Served fixture identity/hash and nonce; verify no `toolautosubmit`, a valid dummy input, and the submit button.
2. `invokeTool` request/result and `toolInvoked` frame, joining the same `invocationId`; retain the JSON-string input and page-side filled value.
3. The actual finite `preAction.windowMs`, matching-response count (expected zero for a successful no-autosubmit fill before the action), and `formActive` observation. Do not reuse r17's 2500 ms as this run's interval.
4. The recorded click action and page submit observation: event count/order, `agentInvoked`, actual `submitter`, current dummy value/FormData, `defaultPrevented`, and whether/how `respondWith` was called. Capture `isTrusted` as observed, not predicted.
5. Raw correlated `toolResponded` status/output/error fields and the receipt's post-action counters. If a navigation branch is reached, include matching CDP navigation frames and loopback request; if the responder prevents default, report the absence of native navigation only within the measured window.

The shared round-21 contract requires per-case ordered CDP frames, page observation, fixture/hash and nonce in the evidence file; the receipt summarizes finite windows, not universal lifecycle behavior (`.ufo/waves/round-21/w1-dispatch.json`, taskCall runtime contract).

## Last-known-good, divergence, confidence

**Last-known-good invariant:** the r17 no-autosubmit probe established a bounded no-submit/no-response interval after invocation, followed by a completion after explicit `requestSubmit()`; S100's no-autosubmit entry branch explains why it focuses/pauses rather than submitting at entry. `na-click` changes the post-invocation trigger from that prior `requestSubmit()` to a button click. **No divergence is demonstrated yet:** no cited prior runtime observation exercises this click case.

**High confidence:** S100's input parse/object requirement, entry-time attribute split, callback storage, submit-event/`agentInvoked` condition, promise branches, and native scheduling callsites, under their stated conditions. **Moderate confidence:** a valid click on the r17 `f-nosubmit`-style fixture should submit once and reach its resolved `respondWith` path; the activation call edge is outside retained S100 and r17 tested `requestSubmit`, not click. **Unresolved until case evidence:** whether the actual click action reaches the expected button activation under `PauseExecution`, its trusted/submitter observations, whether the chosen page listener responds or permits navigation, and the browser-to-CDP mapping of the native-navigation sentinel.

Report: `.ufo/waves/round-21/w1/RevCase02.md`
