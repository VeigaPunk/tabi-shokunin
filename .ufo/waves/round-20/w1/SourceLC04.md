# SourceLC04: non-autosubmit focus and PauseExecution (S096:212-218)

Scope: source-only, pinned Chromium 154.0.8037.97 body (S096). Not runtime. Not completion. Runtime status: untested.

## Verdict

The span supports a call sequence. For a form without `toolautosubmit`, after a successful fill, the code focuses the submit button and calls `PauseExecution()`. It does not submit, does not run the stored callback, and does not clear the running flag. "User-gated" rests on a comment and on code outside the span.

## Identity

- `corpus/evidence/round-20/sources/html_form_element.cc`: 1,740 lines; sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- This equals the pin at `.ufo/waves/round-20/design.json:19` and the r19 S078 body. The Gitiles URL was not fetched, since the checksum match made it unnecessary.

## Condition

- `S096:181-182`: `bool require_submit_button =` / `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);`
- `S096:212`: `if (require_submit_button) {`. Taken when the `toolautosubmit` attribute is absent. This is a presence check, evaluated at invocation time.
- Also required: `FillFormControls` returned no error. Errors return early at `S096:196-198`, before the running state is set (`S096:204`).
- Complement: `S096:218` `} else {`, then `S096:220` `form_->PrepareForSubmission(...)` (LC05 scope).

## Outcome (in span)

1. `S096:215` `submit_button->Focus();`: focus requested. The return value is unused.
2. `S096:216` `auto* context = ModelContextSupplement::modelContext(form_->GetDocument());`: no null check.
3. `S096:217` `context->PauseExecution();`: pause requested. Body not in S096.
4. Absent from the branch:
   - `PrepareForSubmission`: only at `S096:220`, in the else branch.
   - Stored member `done_callback_`: set at `S096:210`; run only at `S096:266`, inside `CallDoneCallback`.
   - Running flag: `is_currently_running_` set true at `S096:204`; set false only at `S096:267`.
5. Net: button focused, pause requested, tool still running with its callback stored. This branch does not complete the tool.

## Strongest quote (<=25 words)

- Outcome, `S096:215-217` (three lines joined with single spaces; 6 tokens): `submit_button->Focus(); auto* context = ModelContextSupplement::modelContext(form_->GetDocument()); context->PauseExecution();`
- Intent only, `S096:213-214` (22 words; comment): "Without `toolautosubmit`, we focus the submit button, tell the agent to allow user input, and wait for the user to submit it." Not an observed outcome.

## Caveats

1. Source-only; untested at runtime; one build (154.0.8037.97).
2. The `PauseExecution()` body, its resume path, and whether `modelContext()` can return null are outside S096. S096 has exactly one `PauseExecution` call (`:217`) and no `ResumeExecution` call. "User-gated" is therefore not established in-span. The body is assigned to a different seat (model_context.cc).
3. `Focus()` success is not checked. The non-null guarantee for `submit_button` comes from the check at `S096:251-256`, which runs before `FillData` (`S096:258`) and after the CE-reactions scope closes at `S096:194`. Nothing re-checks the button before `S096:215`.
4. `S096:213-214` is developer intent. The TODO at `S096:201-203` ("This should key off of the `autosubmit` attribute, and only submit here if the attribute is present.") marks this placement as provisional.
5. `:tool-form-active` and `:tool-submit-active` are set at `S096:206-209`, before the branch. Both branches share that pseudo-state; it is not caused by the pause.
6. Evidence class: `kModelContextExecuteDeclarativeTool` (`S096:179-180`) counts before fill errors. The only branch-specific counter is the autosubmit one (`S096:183-186`). No counter isolates the pause branch.
7. Completion sites outside LC04 (not read here): `CallDoneCallback` at `S096:226, 308, 319, 324, 391, 449, 756, 808, 829, 841, 1102`. `CancelTool` (`S096:224-229`) can end the pending state. `PrepareForSubmission` call sites outside LC04: `S096:588, 872`.

## Existing r19 coverage

- `corpus/knowledge/webmcp-declarative-validation-round-19.md`: does not hold LC04. Its scope excludes the case: "Not claimed: real sites, other builds, agent-side clients, forms without `toolautosubmit`" (lines 18-19). The note has no focus, pause, running, or pending claim. Its S096 row (lines 129-131) covers only the navigation null sentinel.
- `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:17`: holds the line-range outcome (212-217 focus and pause; 218-220 autosubmit). Two glosses should be dropped: "user-gated" (not an in-span outcome) and "`ModelContext::PauseExecution()`" (the receiver type is not in S096; the call is on `context`).
- `.ufo/waves/round-19/w1/FamCheckbox.md:38`: anchor drift. It cites `:204-205` for the fill-error return and `:227-228` for `PrepareForSubmission`. In this body those are `:196-198` and `:220`. Do not copy.
- `.ufo/waves/round-20/w1/ScribeChecklist.md:10` matches this reading. It was not used as evidence.

## Proposed decision row (design format; no pipes in cells)

| LC04 | `toolautosubmit` absent (`require_submit_button` true), fill succeeded | focus submit button and call `PauseExecution()`; no submit, stored callback not run, running flag stays set | S096:212-218 |

## Checks run

- `sha256sum` and line count on the S096 file; sha256 pin lookup in design.json.
- Read S096 `150-262`; grep of S096 for `CallDoneCallback`, `done_callback_`, `PauseExecution`, `ResumeExecution`, `is_currently_running_`, `PrepareForSubmission`.
- Read and grep of the r19 knowledge note; read `SrcHtmlFormTool.md:1-20`; grep of r19 notes.
- No tests, builds, installs, or network fetches. No tool installs to record.
