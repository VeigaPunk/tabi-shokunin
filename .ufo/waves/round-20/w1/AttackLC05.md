# AttackLC05: "autosubmit immediately prepares submission" (S096:218-221)

Scope: source-only (Chromium 154.0.8037.97 pinned bodies). No runtime claim, no build, no test, no production edit. Only this report is written. Tools installed or updated: none.

Identities checked this session:
- S096 `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Equals the design.json pin and the r19 S078 retained body.
- S077 `form_mcp_schema.cc`, decoded from `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`: sha256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, matching the r19 note. Scratch copy removed.
- r19 note `corpus/knowledge/webmcp-declarative-validation-round-19.md`: covers the submit-time validation path (S078 `:729-751`, note line 40), the S096 null-sentinel correction (lines 129-131), and the preconditions (lines 149-152).
- r19 lesson `corpus/lessons/round-19.md` line 34: the S078 row anchors its token on the line-219 comment, 9 words.

## Verdict

The call-level LC05 claim survives. With `toolautosubmit` present when read (S096:182) and a fill that returns no error (S096:196-198), the else arm (S096:218-221) calls `PrepareForSubmission(nullptr, submit_button)` synchronously, with no focus and no pause.

The stronger readings tested here fail. The only word "submit" in the span is a comment (S096:219). The r19 note does not state LC05; it covers only the validation path. The r19 lesson holds LC05 only through that comment token.

## Conditional branches on the LC05 path

| Gate | Source | Effect on "prepares / submits" |
|---|---|---|
| attribute presence, read once at entry | S096:181-182 | selects else arm; value ignored; read before fill |
| fill error | S096:189-198 | returns error; else arm not reached |
| page code during fill | S096:191-194; S077:941-1016, 1061 | listeners run synchronously in fill (change dispatch); CE reactions run at S096:194; both before the branch |
| submitter | S096:187, 250, 220; S077:1247-1248 | may be null; event.submitter null (S096:765) |
| PrepareForSubmission guards | S096:637-640, 642-648, 650-660, 663-680 | return with no completion |
| validation skip | S096:713-715 | form novalidate, submitter formnovalidate, or no page: no interactive validation |
| active tool check | S096:720-722 | executing_tool null after unregistration: no declarative completion or error |
| interactive validation failure | S096:729-758 | synchronous error completion; no request |
| submit event | S096:761-776 | cancel or respondWith |
| cancel without respondWith | S096:807-813 | synchronous error; no request |
| respondWith | S096:790-806 | async completion via HandleWebMcpToolResponse; no request |
| ScheduleFormSubmission returns | S096:885-1019, 954-957, 875-880 | many returns with no request; a disconnect during submit dispatch (S096:893-899) still reaches ok |
| cancel_last_submission_ | S096:821-823 | cancels this form's earlier pending navigation after that call already returned ok |
| success sentinel | S096:825-829 | ok(String()) whenever the tool is still running, regardless of the above |

## Attack 1 (primary): "submits"

**False stronger claim:** "With `toolautosubmit`, ExecuteTool immediately submits the form, and its ok result means the form was submitted."

Why source defeats it:
- S096:220 calls PrepareForSubmission. It does not submit. Its guards (S096:638-680) return with no completion.
- Interactive validation is skipped (S096:713-715) or fails synchronously, with an error and no request (S096:729-758).
- A cancelled submit event gives an error (S096:807-813). respondWith defers completion and sends no request (S096:790-806).
- ok(String()) at S096:829 follows ScheduleFormSubmission (S096:824), which is void and whose outcome the caller never checks. Returns that leave the tool running, so line 829 still reports ok, include S096:885-887, 893-899, 910-912, 935-942, 962-963, 979-991, 1003-1004, and 1018-1019.
- The most ordinary counterexample is a submit listener that removes the form and does not call preventDefault. The removal runs RemovedFrom (S096:523) and ScheduleDeclarativeWebMCPToolRegistration (S096:380-398). The invalid branch skips the cancel at S096:390, because is_handling_submit_ is set during dispatch (S096:723-727) [assuming IsHandlingSubmit() reads that flag]. The tool stays running. Back in PrepareForSubmission, should_submit is true (S096:776), so ScheduleFormSubmission (S096:824) returns at S096:893-899 without a request, and S096:829 reports ok(String()). The comment at S096:777-786 covers the disconnect for the respondWith promise only.
- A second counterexample is `method="dialog"`. S096:954-957 and SubmitDialog (S096:875-880) close an ancestor dialog and return with no navigation. The tool is still running, so line 829 reports ok. The comment at S096:827-828 ("navigation has been triggered") is contradicted by both paths.

Acceptable wording:
- Prose: "With `toolautosubmit`, after FillFormControls succeeds, ExecuteTool calls `PrepareForSubmission(nullptr, submit_button)` synchronously (S096:218-221) instead of focusing the submit button and pausing (S096:212-217). Whether validation runs, a submit event is dispatched, or a request is scheduled is decided inside PrepareForSubmission (S096:635-832) and ScheduleFormSubmission (S096:882-1043). S096 does not establish that a request is sent."
- Success: "`ok(String())` at S096:829 means ScheduleFormSubmission returned while the tool was still running. It does not show that a request or navigation was created (S096:893-899, 954-957)."

## Attack 2: the branch reflects the attribute at submission time

**False stronger claim:** "The autosubmit branch follows the form's `toolautosubmit` state when the submission runs."

Why source defeats it:
- `require_submit_button` is computed once (S096:181-182), before FillFormControls.
- Fill runs page-observable code before the branch at S096:212/218:
  - text/textarea: `SetValue(..., kDispatchInputAndChangeEvent)`, S077:941-942; number, S077:957-958;
  - checkbox: S077:969-973 and 995-999, with explicit `DispatchChangeEvent()` calls at 973 and 999; radio: S077:1012-1016;
  - custom elements enqueue reactions, S077:1061, which run at the CEReactionsScope exit, S096:194.
- A page listener can add or remove `toolautosubmit` during fill. Removal still reaches S096:220. Addition still reaches the focus-and-pause arm (the LC04 path).
- The explicit `DispatchChangeEvent()` calls are code. That the `kDispatchInputAndChangeEvent` enum dispatches synchronously is an [INFERENCE] from its name and the S077:971-972 comment; untested.

Acceptable wording: "The branch uses the `toolautosubmit` presence read at S096:182, before fill. Attribute changes made during fill are not re-read before S096:212 or S096:218."

## Attack 3: every autosubmit invocation gets a completion

**False stronger claim:** "Every autosubmit invocation ends with a result or error from this call or a later path."

Why source defeats it (orphan path):
- The done callback is stored only at S096:210, after fill.
- If, during fill, the form stops being a valid declarative tool (disconnected, or toolname/tooldescription removed), the change is synchronous: RemovedFrom (S096:523) or AttributeChanged (S096:1130-1135) calls ScheduleDeclarativeWebMCPToolRegistration (S096:353-408). That takes the invalid branch (S096:380-399).
- CallDoneCallback is a no-op there because done_callback_ is null (S096:263-265). active_webmcp_tool_ becomes null (S096:398).
- ExecuteTool then sets running (S096:204), stores the callback (S096:210), and calls PrepareForSubmission with executing_tool null (S096:720).
- Each outcome then sends nothing. Disconnected: return with no completion (S096:642-648). Invalid: no declarative branch (S096:729-731). Submit proceeds: no completion (S096:825 is gated on executing_tool). A request can still be scheduled with no reported result, if the form remains connected.
- The S096 excerpt contains no completion for these paths. Whether ModelContext::UnregisterTool (S096:396, 453) or the invocation layer cancels the invocation is outside S096 and untested.

Acceptable wording: "If the form stops being a valid declarative tool during fill, S096 sends no completion for that invocation (S096:263-265, 720, 825-829). Whether the caller receives a cancellation is outside this excerpt."

## Attack 4: validation

**False stronger claim:** "Autosubmit validates constraints before the submit event and again after it."

Why source defeats it:
- Validation is skipped under novalidate on the form, formnovalidate on the chosen submitter, or no page (S096:713-715).
- ValidateInteractively is called once (S096:729). The comment at S096:718-719 says validation is "re-perform[ed] *after* dispatching the submit event". No second call exists in S096 (grep: definition at 592, call at 729, reportValidity at 1531). The re-validation claim is comment-only in this source.

Acceptable wording: "Autosubmit runs interactive validation before dispatching the submit event, unless the form has `novalidate` or the chosen submit button has `formnovalidate` (S096:713-715, 729). S096 shows no validation after dispatch; the comment at S096:719 is not evidence of one."

## Attack 5: submitter and attribute value

- **False:** "Autosubmit submits through a submit button." The submitter can be null (S096:187, 250, 220), and then event.submitter is null (S096:765). Acceptable wording: "Submitter is the form's default submit button as recorded by FormMCPSchema (S077:1247-1248; DCHECK at S077:1258), or null when none exists (S096:220, 765)."
- **False:** "`toolautosubmit="false"` does not autosubmit." The check is presence-only (S096:182). Acceptable wording: "Any `toolautosubmit` attribute, regardless of value, selects this arm (S096:182)."

## Row for the manifest (LC05)

Markdown row, per skillRendering (no pipes in cells):

| LC05 | `toolautosubmit` present when ExecuteTool reads it (S096:182), and FillFormControls returned no error (S096:196-198) | Calls `form_->PrepareForSubmission(nullptr, submit_button)` synchronously, with no focus or pause; whether validation, a submit event, or a request follows is decided inside PrepareForSubmission (S096:635-832) | S096:218-221 |

Manifest JSON (quote is the code line, not the comment; 3 whitespace words; literal within 218-221):

```json
{"id":"LC05","condition":"toolautosubmit present when ExecuteTool reads it (S096:182) and FillFormControls returned no error (S096:196-198)","outcome":"calls PrepareForSubmission(nullptr, submit_button) synchronously with no focus or pause; any validation, submit event, or request is decided inside PrepareForSubmission (S096:635-832)","startLine":218,"endLine":221,"quote":"form_->PrepareForSubmission(/*event*/ nullptr, submit_button);"}
```

## Evidence-class traps

1. **Comment as behaviour.** S096:219 ("we immediately submit the form") is a comment. The r19 lesson's S078 row (line 34) anchors its token on it. The manifest rule (literal, at most 25 words, within span) accepts a comment because it tests presence, not what the line does. Do not quote 219 for LC05.
2. **Other comments.** S096:827-828 ("navigation has been triggered") and S096:718-719 ("re-perform ... after dispatching") are comments, contradicted or unsupported by code (Attacks 1 and 4).
3. **UseCounter.** `kModelContextExecuteDeclarativeAutosubmit` (S096:183-186) increments at entry, before fill (S096:192). It counts attempts, not submissions.
4. **Runtime evidence.** r19 validation fixtures (submit counts, autosubmit cases) must not be cited for LC05. Round 20 is source-only.
5. **TODO.** S096:201-203 (`TODO(masonf)`) marks the branch as pending. Do not describe it as settled design.
6. **Carry the r19 preconditions.** The r19 note (lines 149-152) already says novalidate bypass and intervening handler mutation are not universal guarantees. LC05 must carry them too.

## Cross-row notes

- LC04 shares Attack 2: the focus-and-pause arm at S096:212 uses the same entry-time value.
- LC06/LC07 (cancel, CallDoneCallback): Attack 3 shows state is not cleared on the orphan path. Also, the cancel protection is asymmetric. A disconnect during submit dispatch (S096:776) is suppressed at S096:390 (is_handling_submit_ set, S096:723-727) and still yields ok (S096:829). The same disconnect during ScheduleFormSubmission's formdata dispatch (S096:935-952; the comment at S096:945) cancels with kToolCancelled, because the flag is cleared at S096:817.
- LC12 (null sentinel): Attack 1 shows ok(null) does not signal a navigation.

## Verification gaps and residual risk

- Everything above is source-only. Reachability of each early return and of the orphan path is untested.
- Outside S096, and assumed rather than verified: CurrentlyRunning() and IsHandlingSubmit() (assumed to read is_currently_running_ and is_handling_submit_), the ValidateInteractively body, FormSubmission::Create and ConstructEntryList callers (S096:1069 dispatches formdata; the S096:945 comment says handlers can disconnect the form), and ModelContext::UnregisterTool and executeTool.
- The dispatch semantics of `SetValue(..., kDispatchInputAndChangeEvent)` are inferred (see Attack 2).
- The ModelContext layer may guard against nested or concurrent invocations; not in S096.
