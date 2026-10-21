# RevCase01 — `na-pending` source reconstruction

## Contract and last-known-good invariant

**Contract (case-scoped):** For a registered declarative form tool without `toolautosubmit`, a syntactically valid object that passes that form's `FormMCPSchema::FillData` is applied to the controls; Blink marks the tool invocation active, stores its completion callback, focuses the required submit button, and pauses ModelContext execution. This entry path does **not** call form submission. With no later submit action, the callback has no source-side completion branch to run, so the expected observation is **no matching `toolResponded` within the named finite observation window**. That is a bounded observation, not a protocol status, proof of cancellation, or a claim that the invocation can never complete.

This is supported as the last-known-good behavior by the round-17 declarative probe report: its no-autosubmit case had no submit and no `toolResponded` during the 2500 ms invocation window; after a separate page-side `requestSubmit()`, it produced an agent-invoked submit and a response. This is Chromium-154 implementation evidence, not a general WebMCP/spec guarantee.

## Execution chain for `na-pending`

1. **CDP input / conversion.** The tool receives `input_arguments` as a string. `ExecuteTool` stores the invocation id, determines `require_submit_button = !toolautosubmit`, then calls `FillFormControls`. That parses JSON, requires an object, obtains the form's submit button when required, and calls `FormMCPSchema::FillData`. A parse/object/schema-fill failure calls the supplied completion callback immediately with an error and returns; it is not the pending path. The no-autosubmit fixture must therefore have a submit button, and the test input must be valid for that fixture. (`html_form_element.cc:174-198,231-259`; r19 failure/control examples below.)

2. **Entry-time autosubmit decision.** On successful fill, Blink sets the tool to currently running, marks the active submit button/form state, and stores `done_callback_`. If `toolautosubmit` is absent, it focuses the submit button and calls `ModelContextSupplement::modelContext(...)->PauseExecution()`. The sibling branch that calls `PrepareForSubmission()` is only the autosubmit branch. Thus for an inert `na-pending` fixture, no submit event is dispatched just by invoking the tool. (`html_form_element.cc:163-165,200-221,261-275`.)

3. **Submit dispatch is later and separate.** A subsequent click or call to `requestSubmit()` enters `PrepareForSubmission()`. While the tool is still running, that path tags the `SubmitEvent` with `agentInvoked=true`; it performs interactive form validation and dispatches the event. Invalid native constraints can complete with an error before a submit listener runs. If the event is canceled and `respondWith()` supplied a promise, Blink attaches resolve/reject handlers and waits for that promise; if canceled without `respondWith()`, it reports a programming-error callback. (`html_form_element.cc:696-815`.)

   **Do not describe submission as human-only.** The round-17 no-autosubmit probe explicitly performs `document.getElementById(...).requestSubmit()` from page script after its wait, and the resulting submit is still `agentInvoked=true`. Separately, `submitFromJavaScript()` schedules submission without going through the submit-event path and calls the running tool's callback with an empty string. (`html_form_element.cc:834-873`; `.ufo/waves/round-17/probes/invoke-declarative.mjs:378-427,607-621`.)

4. **Callback storage and settlement.** On successful no-autosubmit entry, `done_callback_` is retained before focus/pause. There is no page `respondWith` promise until a submit listener runs and calls it. `CallDoneCallback()` consumes the stored callback once and clears the running state. In the `respondWith` branch, `HandleWebMcpToolResponse()` settles it with the resolved value (serializing objects) or an error on rejection. Therefore a no-action `na-pending` result should not be explained as an unresolved `respondWith` promise: no submit event has created that promise path. (`html_form_element.cc:200-221,261-275,290-328,789-815`.)

5. **Native navigation.** With no autosubmit, no call reaches `PrepareForSubmission()` on entry, so the entry itself does not reach `ScheduleFormSubmission()` and cannot initiate native form navigation through this path. If a later submit event is not canceled, `PrepareForSubmission()` schedules the form submission and then calls the tool callback with an empty string to indicate a navigation-triggered result; the callback is issued after scheduling, not after an observed frame commit. `ScheduleFormSubmission()` can also return early for browser/form conditions, so source alone does not guarantee every attempted submit actually navigates. (`html_form_element.cc:818-830,882-1042`.)

## Concrete evidence expected for this case (prediction, not a new observation)

For a valid input and a fixture with a submit button, and assuming the case performs no click/script submit before the observation boundary, the source-consistent evidence is:

- the raw `WebMCP.invokeTool` send and its command result correlate to one `invocationId`, with no command error;
- any `WebMCP.toolInvoked` record is correlated by that id and preserves the supplied input (round 17 observed it as a JSON string); the command's `invocationId` is **not** itself a `toolResponded`;
- the ordered CDP evidence contains **zero matching `WebMCP.toolResponded` events during the explicitly named finite window**; retain the frames and derive this count by invocation id;
- the page snapshot shows the dummy input values filled, the tool form active, no submit-listener records, no navigation/frame change, and otherwise the same fixture state at the observation boundary;
- the recorded `preAction.windowMs`, `preAction.responseCount=0`, and `preAction.formActive=true` describe that pre-action interval. If the scenario has a later action, keep its `after` observations separate; do not use a later response to erase the pre-action no-response observation. Do not invent a `Pending` status or call the absence cancellation.

## Distinctions and uncertainty

- **Input failure versus pending:** `FillFormControls` errors settle immediately before the active/wait branch. R19's unknown-parameter fixture/cases record an error, zero submits, and unchanged values for invalid input; its valid control submits and completes. R19's missing-required cases instead show the later native-validation branch returning an error before the submit listener. These `toolautosubmit` cases illustrate different immediate error paths, not direct observations of `na-pending`.
- **Submit/response-promise pending versus no-autosubmit pending:** if `na-pending` unexpectedly has a submit record, the no-action explanation no longer fits; inspect whether the listener prevented default and supplied a still-unsettled `respondWith` promise. The source has this distinct wait path.
- **Navigation pending is not this case:** round-17 `invoke-navigation-pending` was an imperative invocation followed by a non-agent navigation; its report explicitly bounded the absence to 8000 ms and did not claim cancellation. It is not evidence that a no-autosubmit declarative form navigated or that the same callback path was used.
- **Scope of inference:** the retained source establishes the branch behavior for the pinned Chromium 154 source. A run-specific absence still requires the case's raw frames, input, fixture identity/hash, and finite window. Other page timers/actions, a missing submit button, invalid input, validation failure after a later submit, form removal/reset, or navigation can change the observation. No runtime experiment was run for `na-pending` here.

## Evidence and provenance

- `corpus/evidence/round-20/sources/html_form_element.cc:163-328,635-842,882-1042` — S100 lifecycle source. Source-opening records Chromium tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`; S100 is same-source reuse of S096/S078, not an independent source or runtime observation (`.ufo/waves/round-20/source-opening.json:1-8`; `corpus/SOURCES.md:114`).
- `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:23-53,71-80` — prior loopback probe report: no-autosubmit invocation, no response in 2500 ms, then page-script `requestSubmit()` and response; report identifies these as measured Chromium-154 results. The fixture and phase ordering are also visible in `.ufo/waves/round-17/probes/invoke-declarative.mjs:194-199,378-427,607-621`.
- `corpus/evidence/round-17/webmcp-invoke/receipt.json:4270-4355` — raw-backed autosubmit/respondWith contrast: invocation id, submit event, active state, completed response, zero navigation. `:7062-7155` is the separate imperative-navigation bounded-pending case.
- `corpus/evidence/round-19/validation/fixtures/unknown-param.html:5-18`; `corpus/evidence/round-19/validation/cases/unknown-param.json:8-36,102-124`; `corpus/evidence/round-19/validation/cases/missing-required.json:8-31` — fill/input errors versus later native validation; all are autosubmit fixtures, so they do not independently establish no-autosubmit timing.

**LSP availability:** no `lsp` device was exposed in the mounted tool inventory; reading `xd://lsp` returned “No such tool.” I used literal searches only to locate source symbols, then read the retained source ranges directly. No grep match is treated as semantic proof.

**Report:** `.ufo/waves/round-21/w1/RevCase01.md`
