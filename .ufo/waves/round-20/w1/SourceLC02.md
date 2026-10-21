# LC02 — fill error returns before running state (source-only assessment)

Seat: TabiR20.SourceLC02 · 2026-10-21 · Source S096 `corpus/evidence/round-20/sources/html_form_element.cc` (tag 154.0.8037.97; 1740 lines; sha256 `8c8d6796…6916` recomputed, equals design.json). Source-only; the URL was not fetched because the local blob is the pinned body.

Verdict: the LC02 topic and span 189-210 hold as written. Strongest line is 197.

## Independent read (html_form_element.cc:174-222, 231-259)

```cc
196  if (error.has_value()) {
197    return std::move(done_callback).Run(base::unexpected(error.value()));
198  }
204  is_currently_running_ = true;
205  active_submit_button_ = submit_button;
210  done_callback_ = std::move(done_callback);
```

## Condition and outcome

- **Condition:** `FillFormControls(...)` returns a value, so `error.has_value()` is true (L196). Producers in S096:
  - L239-240: `ParseJSON` fails. `kInvalidInputArguments`, "Failed to parse input string as JSON".
  - L245-246: parsed value is not an object. `kInvalidInputArguments`.
  - L252-255: no submit button while `require_submit_button` is true (no `toolautosubmit`, L181-182). `kMissingRequiredSubmitButton`.
  - L258: `return mcp_schema.FillData(*json_obj);`. The error payload is defined outside S096.
- **Outcome:** `done_callback` is consumed synchronously with `base::unexpected(error.value())`, and ExecuteTool returns. Any deferral happens inside the callback owner, outside S096. Skipped on this path:
  - L204 `is_currently_running_ = true`
  - L205 `active_submit_button_`
  - L206 and L208 `kPseudoToolFormActive` and `kPseudoToolSubmitActive` pseudo-state
  - L210 `done_callback_` store
  - L215-217 submit-button focus and `PauseExecution()`
  - L220 `PrepareForSubmission`

  So this call enters no running state, stores no callback, focuses nothing, pauses nothing, and submits nothing.
- **Already executed before the check and not undone:** L178 `invocation_id_ = invocation_id;`, and the UseCounter calls at L179-180 and L184-185.

## Strongest quote (≤25 words)

S096 L197: `return std::move(done_callback).Run(base::unexpected(error.value()));` (2 whitespace tokens; the error return itself)

## Caveats

1. Source-only. No runtime, CDP, or build claim.
2. `FillData` (L258) is the only fill call in S096 (grep verified). Its error payload and any no-mutation behaviour come from `form_mcp_schema.cc`, which is not in S096. No fill call precedes L239, L245 or L252. The FormMCPSchema constructor and `SubmitButton()` bodies are outside S096, so "no control changed" for those three is an inference from call order.
3. The `is_currently_running_` initializer and the `CurrentlyRunning()` and `InvocationId()` definitions are in the header, which is not in the corpus. "Not running after error" assumes the default is false [INFERENCE].
4. Stale id: `invocation_id_` stays set after the error path. Its only reset (L270) lives in `CallDoneCallback`, which returns early at L263-265 because `done_callback_` stays null. The S096 readers are gated by `CurrentlyRunning()` (L164, L169), so exposure is masked if that reads `is_currently_running_` [INFERENCE].
5. S096 has no ExecuteTool call site and no re-entry guard. If a caller re-entered while a run was active, the error branch would still complete the new callback and overwrite `invocation_id_` (L178), leaving `is_currently_running_` and `done_callback_` untouched. Untested; depends on the caller.
6. `CancelTool` (L225) CHECKs `is_currently_running_`. A cancel reaching a fill-error invocation would fail that CHECK. Reachability is caller-side (LC06 scope).
7. Span coverage: the LC02 span 189-210 does not include producers L239-240 or L245-246. No decision span covers L238-247 (LC01 181-186, LC03 249-258). Either cite them in the condition text, as this report does, or widen a span. This is an integrator decision.

## Does an existing r19 note already hold it?

- **Round-19 source report: yes, at source level.** `.ufo/waves/round-19/w1/SrcHtmlFormTool.md` states it:
  - L16: ExecuteTool 174-198 runs the callback with the error at 196-198, and "the code has not set `is_currently_running_`, stored `done_callback_`, or called `PrepareForSubmission`."
  - L19: early input and button errors precede FillData.
  - L21: the direct fill error at 196-198 bypasses stored-callback cleanup.
  - L32: the fill-error answer.
  - Gaps: no stale `invocation_id_` consequence (caveat 4), and no LC02-specific quote. Its quotes are for 213-214, 219, 326 and form_mcp_schema:210.
- **Round-19 knowledge note: no, not for the lifecycle.** `corpus/knowledge/webmcp-declarative-validation-round-19.md` holds the FillData error class (L35-37, S077 `:208-231`, "form control states remain unchanged") and "a fill-time error means nothing changed" (L71-72). It does not mention the running state, the stored callback, or the S096 parse, object or submit-button returns. Its validation manifest (`corpus/evidence/round-19/validation/decisions.json`) cites S096 only at 729-758.
- **Verdict:** LC02 is a carry-forward from r19 w1 L16, L21 and L32, re-pinned to S096:189-210. Do not import r19 runtime claims into r20.

## Proposed row and manifest entry (no pipes inside cells)

`| LC02 | FillFormControls returns an error (error.has_value at L196) | done callback runs synchronously with unexpected error; running state, stored callback, focus, pause and submit skipped | S096:189-210 |`

`{"id":"LC02","condition":"FillFormControls returns a ScriptToolError (error.has_value() at L196); producers L239-240, L245-246, L252-255, FillData at L258","outcome":"done_callback runs synchronously with base::unexpected(error); is_currently_running_, active_submit_button_, done_callback_, focus/PauseExecution and PrepareForSubmission are skipped","startLine":189,"endLine":210,"quote":"return std::move(done_callback).Run(base::unexpected(error.value()));"}`

## Coordination

- SourceLC06's report cited `corpus/evidence/round-19/w1/SrcHtmlFormTool.md`, which does not exist. Resolved: SourceLC06 corrected it to `.ufo/waves/round-19/w1/SrcHtmlFormTool.md`, verified by grep (no old path remains).
- Source IDs for the same bodies differ across r19 artifacts. `form_mcp_schema.cc` is S071 in the r19 w1 report and S077 in the r19 knowledge note. html_form_element.cc is S078 in the knowledge note. Pin r20 citations to S096.

## Method and untested

- Read S096 raw at 170-180, 189-222 and 228-290. Grepped S096 for running-state, invocation, FillData, ParseJSON and SubmitButton symbols. Read both r19 artifacts and the r19 validation manifest's S096 spans.
- Untested: no runtime, browser, build or test. Not assigned, and the lane is source-only.
- Installs or updates: none.
