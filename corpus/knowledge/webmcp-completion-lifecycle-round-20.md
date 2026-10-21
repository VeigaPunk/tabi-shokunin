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

## Round-20 falsification correction — canonical source guidance

This append supersedes the initial round-20 lifecycle table and its diagnostic/history
wording, including the old note table at lines 29–40 and SKILL table at lines 2217–2228.
Those bytes remain history. The corrected table below is the current guidance and the
counter selects it, not the historical rows. It is still one finite sample, not an
exhaustive inventory, twelve novel branches, a scalar promotion or a runtime capability.

**Evidence class:** source-only Chromium 154.0.8037.97; no new runtime observation in
round 20. Earlier runtime observations are explicitly retained below. A source callsite
is not proof of its end-to-end effect. `CallDoneCallback(...)` denotes a method call;
actual stored-callback delivery and cleanup depend on LC07. These descriptions assume
the named internal branch is reached and its stated CHECKs hold, not that WebMCP is
available in any particular profile or shipping configuration. The source's callees
and page handlers are not silently treated as effect-free.

### Declarative WebMCP completion lifecycle — corrected source-scoped (round 20)

| ID | condition | outcome | Source anchor |
|---|---|---|---|
| LC01 | At ExecuteTool entry the form has no toolautosubmit attribute, so require_submit_button is computed true. | The local require_submit_button is true. The autosubmit UseCounter::Count call is in the opposite, false branch; this is a callsite statement, not a per-call telemetry increment claim. | S096:181-186 |
| LC02 | The FillFormControls error result is present after the enclosing CEReactionsScope has closed. | Contains a call to the incoming done_callback with the error, then returns before the assignments at lines 204-210. invocation_id_ was written at line 178 and is not reset on this return path. | S096:189-210 |
| LC03 | The call parsed a JSON object, FormMCPSchema::SubmitButton() returns null, and require_submit_button (computed at ExecuteTool entry) is true. | FillFormControls returns kMissingRequiredSubmitButton before the FillData call on the same path is reached. | S096:249-258 |
| LC04 | FillFormControls returned no error and the entry-time require_submit_button is true. | Contains calls to submit_button->Focus() and context->PauseExecution(), but no direct CallDoneCallback call in this branch. Effects inside those callees are not established by this span. | S096:212-218 |
| LC05 | FillFormControls returned no error and the entry-time require_submit_button is false (toolautosubmit present at entry). | Contains a direct PrepareForSubmission(nullptr, submit_button) call instead of the focus/pause arm. The callee has submit/response paths and early returns; this call alone guarantees neither completion nor its absence. | S096:218-221 |
| LC06 | CancelTool is entered and its is_currently_running_ CHECK passes. | Calls the CallDoneCallback method with kToolCancelled and literal message Tool execution cancelled by abort signal. Stored-callback delivery and cleanup are conditional as in LC07; the literal does not establish the cancellation trigger. | S096:224-229 |
| LC07 | CallDoneCallback is entered; its done_callback_.is_null() test selects the early-return or held-callback arm. | Null returns before cleanup. Otherwise the code invokes Run(result) before clearing running/button/invocation fields; after Run returns it notifies the form pseudo-state, and the old button pseudo-state only if that old button was non-null. The callback body is outside this span. | S096:261-275 |
| LC08 | HandleWebMcpToolResponse enters with tool->CurrentlyRunning() false. | Returns before resolve/reject handling, without a CallDoneCallback or ReportException call from this function on that arm. | S096:290-298 |
| LC09 | HandleWebMcpToolResponse passed the CurrentlyRunning guard at handler entry, reaches the resolved object arm, and JSON::Stringify(...).ToLocal(...) returns false. | Contains a CallDoneCallback call with kToolInvocationFailed and fixed serialization text, then a return before fallback/success. Stored-callback delivery is conditional as in LC07; no claim is made about which JavaScript objects can reach this arm. | S096:298-319 |
| LC10 | HandleWebMcpToolResponse passed its CurrentlyRunning guard at handler entry and reaches the resolved=false arm. | Contains a ReportException(value) call followed by a CallDoneCallback call with kToolInvocationFailed and fixed text respondWith promise was rejected. The text is not the rejection value; delivery is conditional as in LC07. | S096:320-327 |
| LC11 | PrepareForSubmission reaches its post-dispatch declarative block with executing_tool still running, no promise taken, and should_submit=false. | Contains a CallDoneCallback call with kToolInvocationFailed and fixed site-programming-error text. Whether the stored callback runs follows LC07; this row makes no CDP field or status claim. | S100:787-815 |
| LC12 | The should_submit block is reached; after ScheduleFormSubmission returns executing_tool is non-null and CurrentlyRunning, and the WebMCPEnabled CHECK passes. | Contains CallDoneCallback(base::ok(String())) at line 829. The comment describes the null String as indicating a navigation trigger, but the call is not gated on a scheduling return value. Delivery follows LC07; this row establishes no navigation, success, or CDP output guarantee. | S096:818-830 |

### Source-only diagnostic checklist — not a failure taxonomy

1. LC02: distinguish the incoming callback callsite from a function/API return value;
   its own assignments at 204–210 are skipped, but the earlier invocation-id write is not reset.
2. LC03: `SubmitButton()==null` is the schema accessor result, not proof that the DOM
   contains no visual submit button. Its selection implementation is not claimed here.
3. LC04: focus/pause callsites do not guarantee either completion or non-completion;
   effects inside their callees require separate evidence.
4. LC05: `PrepareForSubmission` may dispatch, complete or return early. The callsite
   does not establish a universal outcome or the absence of a submit event.
5. LC06: the running CHECK must pass. The abort-signal words are a fixed literal,
   not evidence of the cause, a delivered CDP field or a user-visible cancellation event.
6. LC07: the null guard is distinct from LC08's not-running guard. Run precedes cleanup;
   form pseudo-state notification is unconditional after cleanup, old-button notification is conditional.
7. LC09–LC10: distinguish handler-entry running state from callback-time state, method
   callsites from stored-callback delivery, and fixed error text from an arbitrary rejection reason.
8. LC11: an empty promise take is the branch condition, not proof that respondWith was
   never called. No protocol status/output mapping is supplied by this source sample.
9. LC12: `base::ok(String())` is an internal success-typed argument, not a failure class.
   The comment says navigation was triggered; this is not a verified scheduling, landing,
   wire-output or success guarantee. Callee delivery still follows LC07.

`S100:635-842` supplies the additional submit-path context, including the early-return
callsites at 639/647/659/679 and the `submitFromJavaScript` callback at 839–841. The body
of ScheduleFormSubmission is retained in the file but lies outside these registered
anchor ranges, so this sample does not infer its full scheduling semantics. S100 is the
same body as S096/S078: the table's LC11 override and these prose anchors add no publisher.

### History corrections — retained observations, no new execution

- Both committed r17 declarative receipt fixtures use toolautosubmit; the earlier
  sentence about a separate receipt form with a submit button must not imply a
  non-autosubmit receipt. The real `invoke-declarative-form` case and
  `invoke-declarative-navigation-result` control remain historical observations in
  `corpus/evidence/round-17/webmcp-invoke/receipt.json`.
- The r17 probe `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71-73` first had no
  response for 2500 ms, then a later page requestSubmit produced Completed and page
  output. This is probe-class history, not an indefinitely pending guarantee.
- `.ufo/waves/round-17/w1/C2ProbeFrames.md:70-72` records the plain-form missing-submit
  error. It must not be described as never triggered. The no-handler autosubmit probe
  at `C2ProbeDeclarative.md:78-80` also records navigation and Completed with an empty array.
- r17 `receipt.json` control `invoke-cancel`, `actual.responded`, records Canceled with
  empty errorText on imperative slow-echo. That is not a declarative CancelTool witness;
  a pass-only stdout line alone does not establish the observed payload.
- r19 `corpus/evidence/round-19/validation/receipt.json`, cases
  `decl-unknown-param-01` and `decl-missing-required-01`, stores observed Error with
  submitCount0. The former is fill-time, the latter is the submit-validation path in
  LC05's callee. Expected case blocks are not substituted for those observed fields.
- The r17 landing-document array in `invoke-declarative-navigation-result` is retained.
  This sample does not reconstruct the renderer/browser bridge to it, and neither
  confirms nor contradicts that runtime result from a C++ callsite alone.

### Current gate and measurement boundaries

The lifecycle counter validates source identity, pinned ids/spans, literal quotes,
registered anchor containment and the active note-table rendering. It does not grade
semantic truth, novelty, all Markdown grammar or all Unicode/control-character forms.
It uses JSON.parse semantics; duplicate JSON keys and fenced/comment lookalikes are
not a promised refusal set. Scalar credit requires both exit0 and the expected count;
a count emitted alongside findings is not an admitted result. SKILL's mirror receives
separate review. The exact four counted inputs and counter blob are pinned in
`.ufo/waves/round-20/measurement-binding.json` at final measurement.

The frozen wave-1 metadata gate's canonical entry is
`node .ufo/waves/round-20/check-wave.mjs --frozen .ufo/waves/round-20/w1/frozen`.
This supersedes the earlier registry row's direct-mode evidence command. Direct mode
remains a diagnostic; frozen mode pins every input digest before comparing the expected
verdict. Codes0/1/2 mean matched/failed/could-not-evaluate, with selftest
`node .ufo/waves/round-20/check-wave.mjs --selftest` and expected fixture values in
`corpus/evidence/round-20/wave-check-expected.json`. Its inputs are authored metadata,
not authentication of an observer, membership, actor quiescence or ordering. It is
w1-specific, not a w2 checker; nested marker values and arbitrary path strings are
outside its finite shape proof. The w1 all-actor settlement flags are withdrawn in
`.ufo/waves/round-20/w1/ordering-correction.json`; r19 d4 remains unprovable. The w2
return was frozen before repairs in commit `e0b5d02a6aef76b0d2799d92618f79f1bca40062`.

