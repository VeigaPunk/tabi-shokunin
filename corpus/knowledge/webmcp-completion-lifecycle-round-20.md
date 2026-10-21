source:S096+S100 — Chromium 154.0.8037.97 `html_form_element.cc` (HTMLFormMcpTool ExecuteTool/CancelTool/CallDoneCallback, HandleWebMcpToolResponse, PrepareForSubmission submit branches) — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT ; anchor: retained body `corpus/evidence/round-20/sources/html_form_element.cc` (sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916; same bytes as the r19 S078 body); decision spans 181-830 as pinned in `corpus/evidence/round-20/lifecycle/decisions.json`; top source S096 for LC01–LC10 and LC12; S100 supersedes S096 for the LC11 rendering only (same URL, tag and digest; lines 174-328 and 635-842 of the same body), with LC11 rendered S100:787-815 (operative branch 807-813). Same-file reuse: a bounded anchor extension, not a new publisher, source diversity, or expansion.
verified-at: 2026-10-21 (round 20; re-fetched the URL, base64-decoded it, and reproduced sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916)
recheck: `curl -fsSL 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT' | base64 -d | sha256sum` must print 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916; and `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` must print the same. Re-run on any Chromium tag change (on-release).

# Declarative WebMCP completion lifecycle — source-scoped (round 20)

## Scope

Source-only reading of one pinned build (Chromium 154.0.8037.97) for the declarative `<form toolname>` path. Twelve rows (LC01–LC12) state which source branch runs for a stated condition and what that branch does to the tool's running state and done callback. **This is not a runtime claim.** No row says a browser did this; no row says a page, agent or site completes, responds, or is cancelled in any observed run. Preconditions are the stated conditions only; no other form shape, build, or mutation is covered.

**Documented sourced rows, not new facts.** The twelve rows are documented sourced rows read from this source body, not twelve novel independent predicates. Prior wave dossiers already held some of these facts. They were not admitted here as a playbook, and this note does not claim them as new discoveries. Prior comparisons are labelled as history below.

**No universal guarantee.** Nothing here guarantees that a declarative call eventually completes, that a response ever arrives, or that any listed branch is reached in a given run. Some branches leave the call pending or undetermined (LC04); the excerpt shows no timer on that path. Absence of a row is not a claim.

**Reuse, not diversity.** The source is the same S096 body already retained for round 19 (S078). S100 is the same file, read at more line ranges and used only for the LC11 rendering. Neither adds an independent source or a second publisher.

**Finite sample, not exhaustive coverage.** The table is a finite sample of documented decisions. It does not enumerate every completion or cancellation path; other paths remain outside these twelve decisions. See "Finite sample and caveat" below.

## Method

- The twelve spans and initial topics were selected before drafting in `.ufo/waves/round-20/design-declared.json`. Current `design.json` records the in-wave LC11 citation amendment and LC12 topic correction; the spans did not change.
- Each `quote` must be a literal substring of one source line inside its span, at most 25 whitespace words.
- `condition` and `outcome` describe only the branch the source shows. Where a later stage (the submit event, the navigated document, the CDP output) is outside the excerpt, the row says so.

### Declarative WebMCP completion lifecycle — source-scoped (round 20)

| ID | condition | outcome | Source anchor |
|---|---|---|---|
| LC01 | At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. | require_submit_button is true; the autosubmit use counter is incremented only when the attribute is present at entry. | S096:181-186 |
| LC02 | FillFormControls returns a ScriptToolError. | done_callback is run with the error immediately; the running state (is_currently_running_, active submit button, done_callback_) is not set by that call. invocation_id_ is written earlier, at line 178, outside this span. | S096:189-210 |
| LC03 | The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. | FillFormControls returns kMissingRequiredSubmitButton before the FillData call on the same path is reached. | S096:249-258 |
| LC04 | FillFormControls returned no error and the entry-time require_submit_button is true. | submit_button->Focus() and context->PauseExecution() are called; this branch does not run the done callback. The pending outcome is not established here: focus handlers and PauseExecution effects are outside the excerpt. | S096:212-218 |
| LC05 | FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). | form_->PrepareForSubmission(/*event*/ nullptr, submit_button) is called immediately; this callsite alone establishes no submit event, navigation, or completion. | S096:218-221 |
| LC06 | CancelTool is called (it CHECKs is_currently_running_). | CallDoneCallback runs with kToolCancelled and the message Tool execution cancelled by abort signal. | S096:224-229 |
| LC07 | CallDoneCallback is called. | If done_callback_ is null it returns with no state change. If non-null, the callback is invoked (line 266) before the state reset at lines 267-270, which sets is_currently_running_ to false, clears active_submit_button_ and invocation_id_, and is followed by PseudoStateChanged notifications (lines 271-274). At the callback, the reset has not run, so those fields hold pre-completion values unless the callback changes them; the excerpt does not show what the callback does. | S096:261-275 |
| LC08 | HandleWebMcpToolResponse receives a settlement for a tool that is not CurrentlyRunning. | The settlement is ignored: the function returns without calling the done callback. | S096:290-298 |
| LC09 | The tool is still CurrentlyRunning, the respondWith promise resolves with an object, and v8::JSON::Stringify(...).ToLocal(...) returns false. | CallDoneCallback is called with kToolInvocationFailed and the fixed serialization message; this arm returns before the fallback and success callback. It does not classify every non-serializable JavaScript value. | S096:298-319 |
| LC10 | The tool is still CurrentlyRunning and the respondWith promise rejects. | The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with kToolInvocationFailed and the text respondWith promise was rejected. | S096:320-327 |
| LC11 | The tool is still running after submit dispatch; should_submit is false; TakeRespondWithPromise() returns no promise. | CallDoneCallback runs with kToolInvocationFailed and the programming-error message; no output value is set on that path. | S100:787-815 |
| LC12 | PrepareForSubmission reaches the should_submit branch and executing_tool remains CurrentlyRunning after ScheduleFormSubmission returns. | CallDoneCallback runs with base::ok of a null String, which the source comment describes as a navigation-intent sentinel: internal, and not proof of navigation, success, or any CDP output value. The ok call follows the ScheduleFormSubmission call in the same block and is guarded only by executing_tool remaining CurrentlyRunning; it is not conditioned on navigation being scheduled. The body of ScheduleFormSubmission is outside the retained anchor. | S096:818-830 |

**LC11 operative branch and authority.** LC11 is rendered from S100 at S100:787-815. The operative text is the programming-error message at line 810 (`The site has a programming error: it called`), reached when the running tool has no respondWith promise and should_submit is false. An empty `TakeRespondWithPromise()` result is not equated here with respondWith never having been called: the excerpt does not separate those cases. The declared span 787-815 is kept in the manifest and table unchanged for counter integration. S100 is the same body as S096 (same URL, tag and digest), supersedes S096 for this row only, and does not widen the claim beyond the programming-error branch.

**LC12 sentinel scope (C++ source only).** The `base::ok(String())` in LC12 is a C++ value: a `base::Result`-style success carrying a null Blink `String`, passed to the tool's done callback inside the renderer. The source comment calls it a navigation-intent sentinel. This note does not establish how that C++ value is or is not converted into any JSON, CDP, or wire field; that conversion is outside the retained excerpt. The sentinel must not be read as JSON `null`, as an ordinary empty string, as proof that navigation happened, or as a success observation.

## Finite sample and caveat

The twelve rows are a finite sample of documented decisions from the S096/S100 anchor (lines 174-328 and 635-842). They are not exhaustive completion or cancellation coverage, and other paths remain outside these twelve decisions. No outcome, ordering, or completeness claim is made beyond the rows.

Caveat only, not a row: within the S100 anchor, `submitFromJavaScript` also calls the done callback with a null String when a tool is running (`S100:834-842`). This table is not a complete inventory of sentinel producers.

`PrepareForSubmission` has early-return branches without a direct done-callback call at lines 639, 647, 659 and 679 (`S100:635-682`). These source callsites prevent treating LC05's call as a universal completion guarantee; their runtime reachability is not established here.

## Finite failure checklist

Each item names one class of non-success or undetermined outcome in the twelve rows. Anything not on this list has no claim from this note.

1. **Fill error** (LC02): the call returns an error at once; the running state is not set.
2. **Missing required submit button** (LC03): the fill is refused before FillData runs.
3. **Focus and pause branch** (LC04): no done callback on this branch; the pending outcome is not established by the excerpt.
4. **Cancel** (LC06): kToolCancelled with the abort-signal message.
5. **Serialization failure of a resolved object** (LC09): kToolInvocationFailed with the serialization message.
6. **Rejected respondWith promise** (LC10): kToolInvocationFailed with the rejection message.
7. **Programming-error path without a respondWith promise** (LC11): kToolInvocationFailed with the programming-error message; no output value.
8. **Settlement after the tool stopped running** (LC08): ignored; no second callback.
9. **Null-String sentinel on the navigating submit path** (LC12): internal navigation-intent sentinel per the source comment; not proof of navigation, success, or any CDP output value.

Completion bookkeeping (LC07) runs only when a done callback exists; it is not a failure class. The callback is invoked before the state reset and the PseudoStateChanged notifications; no assertion is made about state observed during the callback beyond the ordering above.

## History: prior wave comparisons (not source rows)

This section labels earlier wave observations. They are not part of the twelve source rows, were not re-run in round 20, and are cited from their own receipts or probe notes. None of them is a source claim. No exhaustive sweep of the retained round-17/19 receipts was recorded; the items below are the reviewed references only.

- **Runtime autosubmit success and navigation are already observed in round 17.** Receipt case `invoke-declarative-form` (trusted SubmitEvent, `agentInvoked` true, respondWith value returned as `Completed`, no navigation) and control `invoke-declarative-navigation-result` (`corpus/evidence/round-17/webmcp-invoke/receipt.stdout.txt:14`, pass) are receipt-level. This note does not treat declarative completion as untested.
- **LC01 / LC05 (autosubmit present or absent).** Round 17 receipt cases used a `toolautosubmit` form and a form with a submit button; the declarative-form receipt case observed `:tool-form-active` true during the call. Round 17 probe notes record a button-less autosubmit form and a no-toolautosubmit form. Consistent with the LC01 branch and the LC05 PrepareForSubmission call; no receipt covers LC01's counter.
- **LC04 (no toolautosubmit, pending or undetermined).** The round-17 wave-1 probe note `.ufo/waves/round-17/w1/C2ProbeDeclarative.md` records: no toolautosubmit with `WebMCP.invokeTool` → no `toolResponded` for 2500 ms. That is consistent with no done callback on this branch, but it is one probe window, not a bound, and it does not show Focus or PauseExecution directly.
- **LC06 (cancel).** Round-17 receipt control `invoke-cancel` (`corpus/evidence/round-17/webmcp-invoke/receipt.stdout.txt:13`) observed `cancelInvocation` on a pending **imperative** slow-echo call → `Canceled`, `errorText` empty. That is not the declarative CancelTool path; no runtime witness is supplied here for the declarative CancelTool path of LC06.
- **LC11 (preventDefault without respondWith).** The round-17 wave-1 probe note `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:37-39` recorded `Error` with the programming-error `errorText` and no `output` property. This is history: a probe, not a receipt, on one build. It is not part of the LC11 source row.
- **LC12 (navigating declarative submit).** Round-17 control `invoke-declarative-navigation-result` observed `Completed` whose output was the **landing document's** JSON-LD result. The source shows the C++ null-String sentinel from this function; the excerpt does not show how that sentinel relates to the landing-document output. **Open gap**: the bridge is outside the retained excerpt, so the two are not reconciled here, and this note does not map the sentinel to any wire value.
- **Pending across navigation.** Round-17 `invoke-navigation-pending` (imperative slow-echo) observed no `toolResponded` within an 8,000 ms window (`corpus/knowledge/webmcp-invocation-round-17.md`). It supports the no-universal-response limit, not any declarative branch.
- **Submit-time validation (adjacent, not one of the twelve rows).** Round-19 `corpus/evidence/round-19/validation/cases/missing-required.json:12-13` records `Error` with `Form validation failed: required: ...` and `submitCount` 0. That text is the interactive-validation path at S096:729-751 (named in the r19 note), not LC03's missing-submit-button path. The round-17 probe comment expects the LC03 message; no receipt reviewed for this note shows it.
- **No new runtime witness is supplied here for LC03, LC07, LC08, LC09, LC10, or the declarative CancelTool path of LC06.** This is a statement about the references reviewed for this note, not a sweep of all retained receipts. It does not claim that all declarative completion paths are untested.

## Limits

- One build (Chromium 154.0.8037.97), one source body (S096 = S078 bytes; S100 = same bytes), no runtime claim.
- Conditions are the source conditions; rows make no claim about other form shapes, custom controls, cross-origin frames, or builds.
- The twelve rows are a finite sample of documented decisions, not exhaustive completion or cancellation coverage; other paths remain outside these twelve decisions.
- The LC12 sentinel is a C++ value in retained source; no wire or CDP mapping is claimed (see the LC12 sentinel scope above).
- S100 is a bounded same-file anchor extension for the LC11 rendering only, not an independent source.
