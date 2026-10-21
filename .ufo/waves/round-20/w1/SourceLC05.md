# SourceLC05 — autosubmit branch and `PrepareForSubmission`

Scope: LC05 only, `corpus/evidence/round-20/sources/html_form_element.cc:218-221` (S096, Chromium 154.0.8037.97). Source-only. No runtime claim.

## Pin and method
- `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to the `design.json` S096 pin. 1740 lines.
- Read L150-260, L199-275, L635-832, L882-900. Grepped every `CallDoneCallback`, `done_callback_`, `DispatchEvent`, `ScheduleFormSubmission` site in the file. Source URL not fetched.
- Tools installed or updated: none. No build, test, formatter, commit, or subagent.

## Verdict
LC05 holds at source level, with three limits:
1. The verb is "prepares", not "submits". The span calls `PrepareForSubmission`. Navigation is scheduled later (L824), and only if the submit event is not canceled (L775-776, L818).
2. The span does not complete the tool. `done_callback_` (stored L210) is not run in L218-221.
3. On the navigation path, completion means "scheduling call returned", not "navigation happened" (caveat 2).

## Proposed decision row
- Condition: fill succeeded (L196-198 not taken) and `toolautosubmit` is present at execution, so `require_submit_button` is false (L181-182) and the `else` of the L212 test runs.
- Outcome: calls `form_->PrepareForSubmission(/*event*/ nullptr, submit_button)` synchronously (L220). No `Focus()` (L215), no `PauseExecution()` (L217). The stored done callback is not run in the span.
- Span: `S096:218-221`.
- Strongest quote, operative (L220): `form_->PrepareForSubmission(/*event*/ nullptr, submit_button);` — 3 whitespace-separated tokens.
- Supporting, non-operative comment (L219): `// With the `toolautosubmit` attribute, we immediately submit the form.` — 10 tokens with `//`, 9 without. Says "submit", not "prepare".

Row (design format, no pipes inside cells):

| LC05 | Fill succeeded and toolautosubmit is present at execution, so require_submit_button is false and the else of L212 runs | Calls PrepareForSubmission synchronously with the submit button, which may be null (L220); no focus or pause; done callback not run in span | S096:218-221 |

Manifest object:

```json
{"id":"LC05","condition":"Fill succeeded and toolautosubmit present at execution (require_submit_button false; else of L212)","outcome":"Calls PrepareForSubmission synchronously with the submit button, which may be null; no focus or pause; done callback not run in span","startLine":218,"endLine":221,"quote":"form_->PrepareForSubmission(/*event*/ nullptr, submit_button);"}
```

## Source trace (pinned file)
- L181-182: `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);`
- L196-198: fill error → callback and return. Branch not reached.
- L204-210: success state set before the call: `is_currently_running_ = true;`, active button, pseudo-state, `done_callback_ = std::move(done_callback);`.
- L212-217: `if (require_submit_button)` → `Focus()` and `PauseExecution()`.
- L218-221: `else` → L220 call.
- L261-267 `CallDoneCallback`: `std::move(done_callback_).Run(result);` (L266), `is_currently_running_ = false;` (L267).
- `PrepareForSubmission` (L635):
  - Guard returns with no callback: L639 (no frame / `is_submitting_` / `in_user_js_submit_event_`), L647 (not connected), L659 (sandboxed without `allow-forms`), L679 (unclosed form control). No `CallDoneCallback` appears in L635-682.
  - Submitter null-safe: L704, L708, L765.
  - L720-722: `declarative_webmcp_call = active_webmcp_tool_ && active_webmcp_tool_->CurrentlyRunning();`
  - L729-759: validation failure → callback error (L756-758).
  - L769-772: `setAgentInvoked(true)` for the declarative call.
  - L775-776: synchronous `DispatchEvent(*submit_event)`; `should_submit` = not canceled.
  - L790-806: `respondWith` promise → `HandleWebMcpToolResponse` (L290-327).
  - L807-813: canceled with no promise → callback error.
  - L818-829: `should_submit` → `ScheduleFormSubmission` (L824), then `CallDoneCallback(base::ok(String()))` (L829). Comment L827-828: "Return a null string to indicate that a navigation has been triggered."
- L882-887 and L893-899: `ScheduleFormSubmission` early returns, with no failure signal to the caller. L901-908 not read in full.

## Caveats
1. **Guard returns settle nothing.** The returns at L639, L647, L659, and L679 run no done callback and leave `is_currently_running_` true. The tool stays pending until another path settles it: `CancelTool` (L224-228, abort), registration change (L390-396, L447-455), form reset (L1101-1104), or `submitFromJavaScript` (L841). Whether any of these settle those returns was not traced beyond this file.
2. **Success completion does not depend on scheduling.** L829 reports `ok` after L824 even if `ScheduleFormSubmission` returned early at L886 or L898 without scheduling anything. So `ok("")` means "the scheduling call returned", not "navigation happened". The L827-828 comment overstates it.
3. **Page code runs inside the call.** State and callback are set before L220 (L204-210). In this file there is no deferred task between L220 and the synchronous `DispatchEvent` at L776, so a submit listener runs inside `ExecuteTool` and sees a running tool. On the navigation path, `Run` at L829 also happens inside the L220 call, before `ExecuteTool` returns. Downstream delivery of the result is outside this file.
4. **Null submit button is reachable.** [INFERENCE] L250 may assign null. L251 errors on null only when `require_submit_button` is true, so L220 may pass null. `PrepareForSubmission` accepts null (L704, L708, L765; nullptr call site L588). The `SubmitButton()` body is not in the round-20 source set, so when it returns null was not traced. Consequence: a `toolautosubmit` form with no submit control dispatches `submit` with a null `submitter` (L765). [INFERENCE]
5. **Live attribute, not the cached flag.** [INFERENCE] The branch reads `toolautosubmit` live (L182). Registration caches it as `has_toolautosubmit` (L416-417, passed at L458) and uses it for change detection (L437). An attribute change schedules re-registration (L1132-1136). Whether a stale tool can run in that window was not traced.
6. **Attribute name.** The condition is the `toolautosubmit` content attribute (`kToolautosubmitAttr`). The CDP `Annotation.autosubmit` field is a different surface. Rows should say `toolautosubmit`; "autosubmit" in the design topic is shorthand.
7. **TODO at L201-203** (masonf): "This should key off of the `autosubmit` attribute." The attribute already gates this branch (L181-182, L212). It is a comment, not a behavior claim, and does not change the row.

## Existing r19 coverage
- `corpus/knowledge/webmcp-declarative-validation-round-19.md`: **does not** hold LC05. It has no `PrepareForSubmission`, no "immediately", and no 218-221 cite. Its autosubmit mentions (for example lines 40-42 and 109) concern validation failure at autosubmit, which matches L729-759 but is a different claim.
- The r19 wave source map **does** hold the source-level substance: `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:17` ("with `toolautosubmit`, immediately calls `PrepareForSubmission(nullptr, submit_button)` (`218-220`)"), `:33` ("the form is submitted immediately after a successful fill"), and `SrcHtmlFormTool.gate.json:6-8` (quote at `html_form_element.cc:219`; decoded SHA-256 matches). Also `FamRange.md:37`, `FamUnknownParam.md:28`, `SrcJsonSchemaValidation.md:68`, `ScribeSkillTable.md:81`.
- Do not reuse `.ufo/waves/round-19/w1/FamCheckbox.md:38`: it cites `:227-228` for the same call. The pinned call is at `:220`.
- Do not carry "submitted immediately" (`SrcHtmlFormTool.md:33`) into the r20 row. Use "prepares" (verdict 1).

## Not verified
- No runtime. Chromium 154 was not exercised.
- `FormMCPSchema::SubmitButton()` body and `ScheduleFormSubmission` L901-908 were not read.
- Downstream of `done_callback_.Run`, and whether any other path settles the guard returns, beyond this file.

## Check for integrator
- `grep -n 'PrepareForSubmission(/\*event\*/ nullptr, submit_button)' corpus/evidence/round-20/sources/html_form_element.cc` should return line 220. `sha256sum` should match the S096 pin.
