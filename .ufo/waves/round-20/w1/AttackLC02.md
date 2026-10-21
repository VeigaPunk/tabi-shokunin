# AttackLC02: round 20, "fill error returns before running state"

Target: `corpus/evidence/round-20/sources/html_form_element.cc` (S096), span 189-210.
Scope: source-only, C1 depth. Read-only. No production edits. No build, test, or runtime run. No tools installed or updated. No subagents.

## Verdict

- The intended control-flow claim holds. A `FillFormControls` error returns at S096:196-198 and never reaches the running-state writes at S096:204-210.
- The claim fails when stretched. The round-19 principle "a fill-time error means nothing changed" (r19 note, Decision principles, lines 71-72) must not enter LC02 unscoped. It is true for control values under S077 and false for invocation state in S096.
- Severity: High but OPEN for A4 and A7 (they depend on unretained caller code). Medium for A2, A8, A9. Low for A1, A3, A5, A6.

## Evidence checked

- S096 sha256 recomputed: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Matches the design pin.
- `cmp`: S096 is byte-identical to the decoded `corpus/evidence/round-19/sources/html_form_element.cc.gz` (S078).
- S077 decoded `form_mcp_schema.cc.gz` sha256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`. Matches the r19 note.
- S096 read for ExecuteTool, FillFormControls, CallDoneCallback, CancelTool, HandleWebMcpToolResponse, submit classification (716-762), reset (1077-1111), and registration cancel (374-407).
- S077 read for FillData, FillParameterData, FillTextData, FillNumberData, the Validate* functions, ReportParameterIssueIfNeeded, and IsAccessibleFile.
- r19 note read (`corpus/knowledge/webmcp-declarative-validation-round-19.md`), including the wave-2 correction block.
- Line numbers: S096 as numbered by the retained body. S077 counted from raw reads of the decoded body: FillData header :208, comment :210, validation loop :211-232, apply loop :234-241, FillTextData dispatch :941-942 and :945-946, FillNumberData dispatch :957-958.

## Control-flow map (S096)

- :178 `invocation_id_ = invocation_id;`, before any check.
- :179-186 UseCounter increments, before the fill. The autosubmit counter fires only when the attribute is present.
- :191-194 CEReactionsScope wraps `FillFormControls` (:192-193).
- :196-198 error branch: `return std::move(done_callback).Run(base::unexpected(error.value()));`
- :204-210 running state: `is_currently_running_` (204), `active_submit_button_` (205), `:tool-form-active` (206), submit pseudo-state only `if (submit_button)` (207-209), `done_callback_` (210). No guard precedes these writes.
- :215-221 Focus and PauseExecution, or PrepareForSubmission (220). Unreached on the error path.
- :224-228 CancelTool: `CHECK(is_currently_running_)` at :225.
- :238-258 FillFormControls returns:
  - parse error, :239-240, kInvalidInputArguments
  - non-object, :245-246, kInvalidInputArguments
  - missing submit, :251-256, kMissingRequiredSubmitButton at :253, only when `toolautosubmit` is absent
  - `FillData`, :258
- :263-270 CallDoneCallback returns early when `done_callback_` is null (:263-265). It clears `is_currently_running_`, `active_submit_button_`, and `invocation_id_` (:267-270) only after a stored callback.
- :720-722 submit: `declarative_webmcp_call = ... CurrentlyRunning()`.
- :1101-1104 form reset: `CallDoneCallback(kToolCancelled, "Tool execution cancelled by a form reset")`.

## Attacks (false stronger claims)

### A1 (headline): "A fill error changes nothing."

- Where it leaks: r19 note Decision principles ("a fill-time error means nothing changed") and r19 note item 1 (lines 35-42, "changes nothing").
- Why the source defeats it: `invocation_id_` is set at :178 and UseCounters fire at :179-186, both before the fill. The error return at :196-198 undoes neither. The reset at :270 is skipped because `done_callback_` is null (:263-265). "Changes nothing" holds only for control values, via the S077 validate-before-apply property.
- Acceptable wording (LC02 outcome):
  > A fill error returns before the running state is entered: `is_currently_running_`, `active_submit_button_`, `done_callback_`, and both tool-active pseudo-states are not set (S096:204-210 not reached). `invocation_id_` (S096:178) and the use counters (S096:179-186) were set earlier and are not reset on that return.

### A2: "A form reset or abort during the fill cancels the invocation with kToolCancelled."

- Why the source defeats it: the running state begins at :204, after `FillFormControls` returns (:192). S077's apply loop calls `SetValue(..., kDispatchInputAndChangeEvent)` on each applied text, textarea, and number control (S077 :941-946, :957-958). Page `input` and `change` listeners can therefore run before :204. [INFERENCE: synchronous dispatch is Blink-internal and not in the retained bodies.] A `form.reset()` from such a listener reaches `CallDoneCallback` (S096:1101-1104), which returns at :263-265 because `done_callback_` is stored only at :210. The invocation then enters the running state (:204-210) and, for autosubmit, reaches `PrepareForSubmission` (:220). The cancellation is dropped.
- Acceptable wording:
  > Cancellation is recorded only after the done callback is stored (S096:210). A reset or abort raised earlier is dropped by `CallDoneCallback` (S096:263-265), and the invocation continues into the running state (S096:204-220). Whether page script can run during the fill is untested; S077 requests input and change dispatch during the apply loop.

### A3: "Every fill error is kInvalidInputArguments."

- Why the source defeats it: :251-256 returns kMissingRequiredSubmitButton before `FillData`. LC03's branch sits inside LC02's error path.
- Acceptable wording:
  > FillFormControls errors are kInvalidInputArguments for unparseable or non-object input (S096:239-240, :245-246) and for FillData validation failures (S077 validation loop). A missing submit button, when `toolautosubmit` is absent, returns kMissingRequiredSubmitButton (S096:253).

### A4: "Cancelling a tool whose fill failed is a no-op." [OPEN, High if reachable]

- Why the source defeats it: `CancelTool` begins with `CHECK(is_currently_running_)` (S096:225). A fill-error invocation never sets that flag (:204 unreached). CHECK is fatal under Chromium semantics [external]. The caller that delivers aborts is not in the lane.
- Acceptable wording:
  > `CancelTool` requires a running invocation (S096:225). A fill-error invocation never enters that state, so the caller must not deliver an abort to it. The retained source does not show that guarantee.

### A5: "No invocation state survives a fill error."

- Why the source defeats it: `CallDoneCallback` clears `invocation_id_` (:270) only after a stored callback. The fill-error path stores none, so the rejected id remains. `GetActiveWebMCPToolInvocationId` hides it (:167-172, guarded by `CurrentlyRunning()`). The `InvocationId()` accessor is in the unretained header.
- Acceptable wording:
  > After a fill error, `invocation_id_` still holds the rejected id until the next `ExecuteTool` overwrites it (S096:178). `GetActiveWebMCPToolInvocationId` reports nothing because the tool is not running (S096:167-172).

### A6: "A successful fill marks the submit button tool-submit-active."

- Why the source defeats it: :207-209 are guarded by `if (submit_button)`. On the autosubmit path the fill may find no submit button.
- Acceptable wording:
  > A successful fill marks a submit button tool-submit-active only when the fill found one (S096:207-209).

### A7: "ExecuteTool is safe to re-enter, and a fill error cannot disturb an in-flight invocation." [OPEN]

- Why the source defeats it: `ExecuteTool` has no `is_currently_running_` check (:174-204). `invocation_id_` is overwritten at :178 unconditionally. `done_callback_` is a single slot assigned at :210 without a check. During the apply loop the flag is still false (see A2), so an in-flight invocation is invisible to any guard. If the caller admits a nested `ExecuteTool` from page script during the outer fill, the outer success path (:204-210) overwrites the inner callback, which is never run, and `invocation_id_` keeps the inner id. Caller admission is not retained.
- Acceptable wording:
  > `ExecuteTool` does not check for an in-flight invocation (S096:174-210). The retained source does not show that the caller prevents one.

### A8: "A submit requested while the tool is filling is handled as a tool submission."

- Why the source defeats it: `declarative_webmcp_call` is `CurrentlyRunning()` (S096:720-722), which is false until :204. The `is_handling_submit_` scope (:724-727) and the tool-specific failure callback (:756-758) are skipped for such a submit.
- Acceptable wording:
  > A submit started before the running state (S096:204) is not classified as a declarative tool submission (S096:720-722).

### A9: evidence-class traps

- "S096 corroborates LC02," or "S078 and S096 corroborate each other." Defeated: the bytes are identical (`cmp`, same pin). Acceptable: "S096 is the same retained bytes as S078 (sha 8c8d6796...). This row adds no independent corroboration."
- Anchor drift: some round-19 wave notes (FamCheckbox.md and Decision14.md, as copied in the ExecCounter clone) cite S078 at `:192-201`, `:204-205`, `:223-224`, and `:227-228`. These do not match the retained body. The error return is at :196-198, the running state at :204-210, and PrepareForSubmission at :220. Use retained-body anchors only.
- Runtime import: r19 measured statuses, messages, and submit-event counts are runtime-scope. Do not cite them for LC02, since the design is source-only with no runtime claim.
- Comment as evidence: the TODO at :201-203 says autosubmit gating "should key off" the attribute. The code already gates on it (:182, :212-221). Cite the code, not the TODO.
- Submit-time versus fill-time: "Form validation failed" (:733) and kToolInvocationFailed (:756-758) are submit-time errors inside PrepareForSubmission. They are not LC02 fill errors.
- Counting: S077 claims have no S096 decision row. Keep S077 out of the LC02 row, whose source column is S096:189-210 only. If the note mentions S077, cite it in the note body and do not count it as one of the twelve decisions.

## Claims that survive (acceptable as written, within the scope above)

- P1: the error branch skips :204-210 (S096 control flow).
- P2: the parse, non-object, and missing-submit returns occur before the `FillData` call at :258. They write no control value.
- P3: for `FillData` errors, the validation loop completes before the apply loop (S077: validation, then the apply loop documented as "must not fail"). The validators read control state only: ValidateTextData, ValidateNumberData, ValidateCheckboxData, ValidateRadioData, ValidateSelectData. `SanitizeValue` is assumed pure [INFERENCE]. Not fully read: the `IsAccessibleFile` helper (file-input runtime flag, a filesystem metadata query and not a DOM write) and the custom-element branch, which returns true without validation.
- P4: on the error path, PrepareForSubmission (:220), Focus (:215), and PauseExecution (:217) are not reached. A fill-failed invocation produces no submit, focus, or pause, and no respondWith for the response path (:290-297) to settle.
- P5: the error branch returns immediately after `Run` (:197), and nothing touches a member after the callback.

## Exact LC02 row and manifest entry

Row (no pipes inside cells):

```
| LC02 | `FillFormControls` returns an error (:192-193) | Error passed synchronously to the done callback at :197; ExecuteTool returns. :204-210 not reached, so the running flag, active submit button, done callback, and tool-active pseudo-states stay unset. `invocation_id_` (:178) and use counters (:179-186) were set before the fill and are not reset. Source-only; not runtime-observed. | S096:189-210 |
```

Manifest decision:

```json
{"id":"LC02","condition":"FillFormControls returns an error","outcome":"done callback receives the error at :197 and ExecuteTool returns; running-state writes at :204-210 are not reached; invocation_id_ (:178) and use counters (:179-186) were set before the fill and are not reset","startLine":189,"endLine":210,"quote":"return std::move(done_callback).Run(base::unexpected(error.value()));"}
```

The quote is a literal from S096:197 and has two whitespace-separated words.

Note sentence, placed after the row in the note body:

> This row claims control flow only. Control values are unchanged on the parse, non-object, and missing-submit returns because FillData is not called. Control values are unchanged on FillData errors by the S077 validate-before-apply property, which is cited separately and is not one of the twelve decisions. Nothing here claims a runtime status, message, or event count.

Correction wording, appended to the r20 note (round-19 bytes are not edited):

> Fill-time errors leave control values unchanged (S077 FillData validates before applying). They do not undo the invocation id (S096:178) or the use counters (S096:179-186), which are set before the fill.

## Not claimed or unverified

- Caller admission of `ExecuteTool`, abort wiring to `CancelTool`, and delivery of reset or abort. `model_context.cc` is not retained. A2, A4, and A7 are conditional on it.
- `CurrentlyRunning()` and `InvocationId()` definitions. `html_form_element.h` is not retained. The "not running" reading of `CurrentlyRunning` is name-based [INFERENCE].
- Synchronous dispatch of `SetValue(kDispatchInputAndChangeEvent)`, and what CEReactionsScope flushes at :194. These are Blink internals, not claimed.
- Audit reporting during `FormMCPSchema` construction (:249) or `SubmitButton()`. The audit helper's call site is not in the retained lines. Side-effect claims for the error path are limited to A1's items.
- No runtime or CDP observation. No build or test run.

## Checks for the main agent (not run by me)

- Confirm the LC02 quote is a literal within S096:189-210 (line 197).
- Grep the r20 note for "nothing changed", "no residue", "cancellable", and "every fill error is kInvalidInputArguments" in the LC02 context. None should appear.
- Confirm S077 is cited outside the LC02 row and is not counted among the twelve decisions.

Report: .ufo/waves/round-20/w1/AttackLC02.md
