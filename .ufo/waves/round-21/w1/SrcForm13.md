# SrcForm13 — S100 html_form_element.cc lines 740-786 (round 21, w1)

Seat: TabiR21.SrcForm13 (scout, leaf). Slice owner: lines 740-786 only.
Baseline e7cf11a810003d4a65cc85bd265f2c17dd65b738. No registry rows written; no
source downloaded into production (fetch went to /tmp, removed after digesting).

## Located source (observed facts)

- URL (exact S100 entry, `corpus/SOURCES.md`): https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- Access date: 2026-10-21. Fetched `?format=TEXT`, base64-decoded to 1740 lines / 68278 B.
- Decoded sha256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
  — equals the digest recorded in the S100 registry row.

### Comparison vs retained round-20 copy

`corpus/evidence/round-20/sources/html_form_element.cc`: same sha256
`8c8d6796…36916`, same 1740 lines / 68278 B — byte-identical to the fresh fetch.
Lines 740-786 therefore have **zero drift**; whole-file digest equality makes the
slice comparison exact. Slice content re-read raw from the fetched copy (line
`read` display elides some lines; awk-numbered dump used as ground truth).

## The quote (≤25 words, located)

Lines 777-780, inside `HTMLFormElement::PrepareForSubmission` (starts line 635):

> "DispatchEvent() above could have disconnected this from the DOM. In that
> case, the form would have been unregistered as a tool"

(21 words.) Key code at the slice, cited by line: 756-758
`executing_tool->CallDoneCallback(base::unexpected(ScriptToolError(
ScriptToolErrorCode::kToolInvocationFailed, error_message.ToString())));`
and 775-776 `should_submit = DispatchEvent(*submit_event) ==
DispatchEventResult::kNotCanceled;`

## Lifecycle guard / callback / effect relevant to fixed12 (source-derived, build-scoped to 154.0.8037.97)

- Guard chain (729, 731): `!skip_validation && !ValidateInteractively()` inside
  the `declarative_webmcp_call` branch (guard set at 720-722 from
  `active_webmcp_tool_->CurrentlyRunning()`; scope flag `is_handling_submit_`
  at 723-727).
- na-invalid-submit: an invoked form-tool on a constraint-invalid form never
  dispatches `submit` and cannot navigate from this path; per invalid control
  the message appends `name: validationMessage(). ` where name is
  `GetWebMCPParameterName()` (742), `ElementInternals::GetName()` (745), else
  `"{unknown}"` (747); the invocation ends via the done callback at 756-758
  with `kToolInvocationFailed`.
- na-click / na-requestsubmit / na-native-submit: the validation-passed/skipped
  else branch (760-776) dispatches a cancelable `submit` event
  (`DispatchWillSendSubmitEvent` at 761; bubbles+cancelable at 763-764);
  `declarative_webmcp_call` forces `CHECK(WebMCPEnabled)` (769-770) and
  `setAgentInvoked(true)` (771). A page `preventDefault()` flips
  `should_submit` false (775-776) → no navigation.
- na-remove: 777-786 — a dispatched submit can disconnect the form; it is then
  unregistered (`active_webmcp_tool_` null) and the `respondWith()` promise is
  not reacted to; async unregister before fulfillment is handled by
  `HandleWebMcpToolResponse()` (named at 784, defined elsewhere in file).
- na-pending / na-delayed / na-reject / na-throw: the promise settle handling
  begins just past the slice (790-800: `TakeRespondWithPromise`, `CHECK(!
  should_submit)` when respondWith was used, `Then(...HandleWebMcpToolResponse)`)
  — adjacent context only; not my lines.
- na-reset: no reset path anywhere in 740-786. auto-positive / auto-invalid:
  governed by the declarative submit path at 174-328 (S078/S100 anchor), not
  this slice.

## Unsupported inference (kept out of observations)

That any of the above branches maps to a specific observed CDP
`toolResponded` status (Completed / Error / Canceled) or error text is **not in
this slice**: no CDP emission exists here — the emitter is
`inspector_web_mcp_agent.cc` (S079) and status vocabulary S080. Whether
`GetWebMCPParameterName()` naming matches a fixture's expected schema keys is
defined in `form_mcp_schema.cc` (S071/S077), not here. Runtime outcomes for the
fixed12 must be observed, not derived from these lines.

## Interface notes sent to peers

Messaged TabiR21.BuildCounter: no receipt-shape or counter-derivation change
arises from this slice; source finding is behavior context for na-invalid-submit
(no submit dispatch on validation failure) and na-click/na-requestsubmit/
na-native-submit (cancelable submit, `agentInvoked`). BuildRuntime was not in
the visible roster, so it was not messaged.
