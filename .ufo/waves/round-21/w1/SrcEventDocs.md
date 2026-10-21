# Chrome WebMCP declarative API — round21 finite-lifecycle scope

## Source opened

- **Observed source:** Chrome for Developers, [Declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api), accessed **2026-10-21**. Location: **“Submit the form”**, paragraph introducing `SubmitEvent.agentInvoked`.
- **Located quote (15 words):** “This attribute is set to true whenever a form is triggered by an AI agent.”
- The page says it was last updated 2026-09-25 and describes WebMCP as under active discussion; this is documentation, not evidence of Chromium 154 runtime behavior.

## Observed documentation facts

- The declarative API maps annotated HTML forms to tools. The page describes manual Submit as one submission choice and `toolautosubmit` as triggering submission and navigation when the model invokes the tool.
- `SubmitEvent.agentInvoked` is documented as true whenever a form is triggered by an AI agent. The page does **not** define an if-and-only-if provenance test for the immediate cause of every later submit event.
- `SubmitEvent.respondWith(Promise)` passes a promise whose resulting value is serialized and returned as tool output. The page says to call `preventDefault()` first to stop standard form submission. Its example uses `toolautosubmit`, calls `preventDefault()`, and responds with a promise.
- The page documents `toolactivated` after form fields are pre-filled, and `toolcancel` when the user cancels the agentic operation or `reset()` is invoked. These events are non-cancelable and carry `toolName`. The documented active-form/button pseudo-states end on submit, cancellation, or reset.

## Constraints on the round21 finite experiment [inference]

- These statements help distinguish the manual-submit and autosubmit paths and identify page-visible lifecycle fields to record. They do not prescribe a response deadline or guarantee that any matching response arrives during a finite window. For `na-pending`, retain the round contract's bounded wording: **no matching response was observed within the named interval**—not “permanently pending,” canceled, or never completing.
- The `toolautosubmit` description is not a per-case prediction of navigation: the page's own example cancels standard submission with `preventDefault()` and uses `respondWith()`. For `auto-positive` and `auto-invalid`, derive response and navigation claims from each case's correlated CDP/page evidence, not the mode name or the general description.
- The docs give a resolving-promise example but do not specify round21's exact status/error/timing for a rejected promise, synchronous handler throw, delayed settlement, or a form-removal action. Record `agentInvoked`, `toolactivated`/`toolcancel` (if observed), submits, responses, and navigation as case evidence; do not promote documentation into observed runtime outcomes.

## One unsupported overclaim

**Overclaim to reject:** “`na-pending` had no matching response during its pre-action window, therefore it will never respond (or was canceled).” The page documents promise-based results but gives no timeout, terminal-pending definition, or bound on settlement time. Only the finite observation is supported; no round21 case outcome is asserted here.

## Confidence and remaining unknowns

High confidence in the wording and boundaries above as statements of this opened Chrome documentation. The documentation alone does not establish Chromium 154's implementation or the outcome of any of the 12 cases. Actual response status/timing, navigation, action/event provenance, promise rejection/throw handling, and reset/removal effects remain runtime-evidence questions. No browser experiment was run and no corpus rows were added.

No tools installed or updated.

Report: `.ufo/waves/round-21/w1/SrcEventDocs.md`