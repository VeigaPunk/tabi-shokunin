# ReverseState: declarative WebMCP completion lifecycle (round 20, source-only)

Seat: TabiR20.ReverseState (leaf revenger, no dispatch). Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Baseline c49929430d996b016dde2e3a3a5be380f3433fdb.
Object: S096 `corpus/evidence/round-20/sources/html_form_element.cc` (Chromium 154.0.8037.97 body). Source-scoped inference only (QUALITY 14). Not built, not run, not browser-observed. Installs or updates: none. Writes: this report only. Commit: none (no clone assigned).

## 0. Pins, method, limits

- Body sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines. Equals design.json `source.sha256`. Upstream bytes were not re-fetched by this seat.
- Read S096 lines 1-1740 in full. Token greps for call sites and members. Anchors are `S096:line`.
- design.json read verbatim (140 lines): claim C1 (target 12) and decisions LC01-LC12. Absent from the tree at read time: `corpus/evidence/round-20/lifecycle/decisions.json`, `.ufo/waves/round-20/measure-c1.mjs`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- Cross-read: `corpus/SOURCES.md:110` (S096 row); WebMCP notes of rounds 16, 17, 19 (`corpus/knowledge/webmcp-*-round-*.md`); round-17 probe `.ufo/waves/round-17/probes/invoke-lifecycle.mjs`; round-18 seat-reads `.ufo/waves/round-18/sources/DeclarativeValidation.md`, `.ufo/waves/round-18/w2/LiveS036.md`, `.ufo/waves/round-18/w2/LiveS042.md`.
- Tooling: no `lsp` device is mounted in this seat. `/usr/bin/clangd` exists but was not run: there is no compile database, and the headers declaring HTMLFormMcpTool, FormMCPSchema, ModelContextSupplement, SubmitEvent and ScriptValue are absent. Call-site and member claims below are literal over the excerpt, not semantic proof.
- Accessors declared in the absent header (CurrentlyRunning, IsHandlingSubmit, InvocationId, ToolName) are inferred from name and use. Tagged [INF].

## 1. Axes

- cov: transitions in lifecycle functions (ExecuteTool, CancelTool, CallDoneCallback, HandleWebMcpToolResponse, registration, PrepareForSubmission, ScheduleFormSubmission, submitFromJavaScript, requestSubmit, reset, association and attribute triggers). See section 3.
- cancel: every path that ends or cancels a running invocation. See section 5.
- retry: every path that re-runs or re-tries. See section 4.
- design: LC01-LC12 fidelity to span and wording. See section 7.
- class: evidence class per claim. See section 8.

## 2. Reconstructed state and invariant

Per tool object (HTMLFormMcpTool, S096:174-288):
- R `is_currently_running_`: set true at 204, false at 267. Read directly at 225 (CHECK) and via CurrentlyRunning() at 164, 169, 295, 722, 788, 825, 839 [INF].
- D `done_callback_`: set at 210; moved out and run at 266. Null means nothing pending (263-265).
- B `active_submit_button_`: set at 205, cleared at 269. Never compared with the submitter.
- I `invocation_id_`: set at 178, the first statement of ExecuteTool, before any error return; cleared at 270.
- H `is_handling_submit_`: set through AutoReset at 725-726 only when R is true on entry to PrepareForSubmission (722); scope ends at 817.

Per form: `active_webmcp_tool_` (nullable; set 457, cleared 398 and 454); `mcp_registration_task_` (posted cancellable task; 383, 402-407); `is_submitting_` (916); `in_user_js_submit_event_` (700); `cancel_last_submission_` (set 1041-1042, consumed 821-823); `is_in_reset_function_` (1082, 1107).

Invariant the code implements (I1): each accepted invocation's D runs exactly once, with ok or with a kToolCancelled / kToolInvocationFailed error, and R clears with it. CallDoneCallback enforces at most once per D (263-265). Nothing enforces at least once. Divergences against I1 are A11, A13, A14, A18.

## 3. Condition to transition (source-only)

| ID | Condition as the code tests it | Transition / outcome | Anchors | LC |
|---|---|---|---|---|
| T01 | toolautosubmit absent | require = true | 181-182 | LC01 |
| T02 | JSON parse fails (238-241), value not an object (243-247), or FillData returns an error (258) | done(err) at 196-198; R and D unchanged; I already overwritten at 178 | 178, 189-198, 231-258 | LC02 |
| T03 | require = true and no submit button (250-256) | done(kMissingRequiredSubmitButton) before FillData; no field written | 249-256 | LC03 |
| T04 | fill OK and require = true | R = true; B set; D stored; focus button; PauseExecution; no completion | 204-217 | LC04 |
| T05 | fill OK and require = false | R = true; D stored; PrepareForSubmission(nullptr, button) | 204-210, 218-220 | LC05 |
| T06 | ExecuteTool called while R is true | no check; I and D overwritten; previous D dropped unrun | 178, 204, 210 | none |
| T07 | CallDoneCallback with D set | run D (266); then R = false; B and I cleared; pseudo-states updated | 263-274 | LC07 |
| T08 | CallDoneCallback with D null | no-op | 263-265 | LC07 |
| T09 | CancelTool() | CHECK(R), fatal if false; done(kToolCancelled, "...abort signal") | 224-228 | LC06 |
| T10 | PrepareForSubmission with frame null, or is_submitting_, or in_user_js_submit_event_ | return; D not run; R unchanged | 637-640 | none |
| T11 | PrepareForSubmission with form disconnected | console warning; return; D not run | 642-648 | none |
| T12 | PrepareForSubmission with forms sandboxed (no allow-forms) | console error; return; D not run | 650-660 | none |
| T13 | PrepareForSubmission with an unclosed form control and UnclosedFormControlIsInvalidEnabled | error event; return; D not run | 663-682 | none |
| T14 | PrepareForSubmission with R true on entry | H = true for the scope | 722-727 | none |
| T15 | interactive validation fails (skip_validation false) | should_submit = false; if R on entry: done(kToolInvocationFailed, "Form validation failed: ...") | 729-758 | none |
| T16 | submit event dispatched | agentInvoked = R on entry (769-772); should_submit = not canceled; R re-read (787-788) | 760-788 | none |
| T17 | R and respondWith promise taken | promise.Then(HandleWebMcpToolResponse, tool); D stays pending; CHECK(!should_submit) at 794 | 789-806 | LC08-LC10 in part |
| T18 | R, no promise, and !should_submit | done(kToolInvocationFailed, "...programming error...") | 807-814 | LC11 |
| T19 | should_submit (any R) | cancel earlier pending navigation; ScheduleFormSubmission; if R still true: CHECK(WebMCP) and done(ok(String())) | 818-829 | LC12 |
| T20 | form.submit() (submitFromJavaScript) | ScheduleFormSubmission(null, null); if R: CHECK and done(ok(String())); no validation, no submit event | 834-843 | none |
| T21 | requestSubmit(submitter) | submitter must be a submit-capable control owned by this form (854-870); then PrepareForSubmission(nullptr, control) | 850-872 | none |
| T22 | implicit submission with one trigger control | PrepareForSubmission(&event, nullptr) | 587-588 | none |
| T23 | HandleWebMcpToolResponse with R false | ignored | 295-297 | LC08 |
| T24 | respondWith resolves with an object whose JSON.stringify fails | done(kToolInvocationFailed, "...could not be serialized..."); return | 300-312 | LC09 |
| T25 | respondWith resolves with a non-object | result = value.ToString (no JSON); done(ok(result)) | 316-319 | none |
| T26 | respondWith rejects | ReportException; done(kToolInvocationFailed, "...promise was rejected") | 320-327 | LC10 |
| T27 | form.reset(), reset event not canceled | controls reset; if a tool is registered: done(kToolCancelled, "...by a form reset") whatever H is | 1084-1105 | none |
| T28 | registration with frame present and form invalid (null name or description, or disconnected) | cancel posted task; if tool and !H: done(kToolCancelled, "...definition was updated"); UnregisterTool; tool = null | 359-361, 369, 380-398 | none |
| T29 | registration task, form valid, tool attributes or schema changed, !H | done(kToolCancelled, "...definition was updated"); unregister; new tool object registered, not running | 421-462 | none |
| T30 | registration task, attributes and schema unchanged | no-op | 441-445 | none |
| T31 | insert, remove, child change, value change of a tool attribute, associate or disassociate with an active tool | invalid form: synchronous (380-398); valid form: posted task (402-407) | 465-478, 486-525, 1622-1625, 1126-1137, 1187-1220, 1719-1727 | none |

## 4. Retry claims

- R1: No retry mechanism exists in the excerpt. No loop re-enters ExecuteTool, nothing re-posts after failure, and there are no timers. The only posted task is the registration at 403. Token grep for retry, retries, again, attempt, timeout returns comments only (203, 687, 921, 1035).
- R2: No retry claim appears in the design (one claim, C1), in the S096 registry row (SOURCES.md:110), or in the round-16, 17 and 19 WebMCP notes (literal grep).
- R3: Re-invocation after error is the only retry-shaped path. After T02 and T03 (no state change) and after T15, T18, T24, T26 (R false), the agent can call ExecuteTool again with a new I, and the form is refilled. The design does not describe this. The round-19 note records that rejected values stay in the form after T15 (`corpus/knowledge/webmcp-declarative-validation-round-19.md:40-42`).
- R4: Re-invocation while R is true is an implicit replacement with no defined semantics (A14, A15).
- R5: A nested PrepareForSubmission (638) is dropped without retry and without completion (A11).

## 5. Cancellation and termination claims absent from the design

The design's only cancel-related row is LC06 (CancelTool text). Every row below is absent from LC01-LC12 unless marked partial.

| ID | Claim or behavior | Anchors | Design status | Class |
|---|---|---|---|---|
| A1 | CancelTool() is valid only while running. Calling it with R false is a fatal CHECK, not a no-op. | 224-228 | LC06 omits | H |
| A2 | Definition update cancels a running invocation with kToolCancelled "...definition was updated", unless H. | 441-455, 448-452 | absent | H |
| A3 | Removal or invalidation (null name or description, disconnected) cancels with the same "...definition was updated" text, unless H. Removal and update are indistinguishable from the error string (D9). | 380-396, 390-393 | absent | H |
| A4 | Schema-affecting control association or disassociation, or any child-tree change, cancels a running invocation when the recomputed schema differs. Non-schema changes are no-ops; the comment at 442-443 names association as a trigger. | 1187-1220 via 1194, 1211, 1719-1727; 1622-1625; 438-445; 277-283 | absent | H |
| A5 | Change of toolname, tooldescription, tooltitle or toolautosubmit values cancels a running invocation unless H. | 1126-1137; 433-437 | absent | H |
| A6 | form.reset() cancels a running invocation whatever H is. | 1101-1105 | absent | H |
| A7 | While H is true, the cancel at 390 and 448 is suppressed. The invocation survives definition or removal changes made inside a submit handler and is decided by the tail of PrepareForSubmission. | 390, 448, 722-727, 787-830 | absent | H |
| A8 | No timeout, no navigation cancel, and no document-teardown hook in the excerpt. A paused invocation (T04) completes only if a submit reaches PrepareForSubmission, CancelTool is called (caller outside the excerpt, U2), reset occurs (A6), or registration changes (A2-A5). PauseExecution has no resume in this file (U3). | 217; token grep finds no Delayed, Timer, Interval or setTimeout | absent | H (absence); U2, U3 |
| A9 | A newer scheduled submission cancels the earlier pending navigation. The earlier invocation was already completed ok at 829 and is never told. | 821-823, 829, 1035-1042 | absent | H |
| A10 | Reset during submit dispatch cancels the invocation (T27), yet should_submit is unchanged, so ScheduleFormSubmission still runs (824), and no completion is sent because R is false at 825. | 1101-1105; 818-825 | absent | H |
| A11 | Early returns in PrepareForSubmission leave R true and D unrun: frame null, is_submitting_, in_user_js_submit_event_ (637-640), disconnected (642-648), sandboxed forms (650-660), unclosed-control flag (663-682). The autosubmit path (T05) reaches them with R set at 204. `:tool-form-active` keeps matching (163-165, 206). A nested submit inside a submit handler (638) is dropped the same way. Reachability: a same-origin sandbox without allow-forms (U11); the disconnected path was not analysed for reachability. | 637-682; 204-220 | absent | H (path); U11 (reach) |
| A12 | Interactive validation failure on a user submit ends the invocation (756-758; R false). A later correction is not reported to the agent; a retry needs a new ExecuteTool. The round-19 note records the error text (`corpus/knowledge/webmcp-declarative-validation-round-19.md:39-42`); the design has no row. | 729-758 | absent | H |
| A13 | Stale promise: HandleWebMcpToolResponse binds the tool object and the resolved flag only (800-806) and checks R (295), not I. A promise from invocation #1 can complete invocation #2 on the same tool object if #2 starts while #1's promise is pending. LC08 does not cover this. Requires the caller to permit overlapping calls (U2). | 295, 800-806 | absent | H (path); U2 |
| A14 | ExecuteTool overwrites I and D without checking R. The previous D is dropped unrun, and I names the new call. | 178, 204, 210 | absent | H |
| A15 | A rejected second call still overwrites I before its fill error (178 before 196-198). GetActiveWebMCPToolInvocationId (167-172) then returns the rejected id while the first invocation runs. | 167-172, 178, 196-198 | absent | H |
| A16 | Any submit of the form while R is true completes the invocation. The submitter is never compared with B. This covers button activation, requestSubmit (850-872), implicit submission (587-588) and script-initiated submit. agentInvoked is true for all of them (769-772). | 721-722, 760-829, 587-588, 850-872 | absent | H |
| A17 | form.submit() (submitFromJavaScript) completes a running invocation with ok, with no validation and no submit event. If called inside a submit handler, completion precedes the handler's return. The tail then re-reads R (787-788) and may schedule a second submission (824), which cancels the first (821-823). | 834-843; 787-788; 821-824 | absent | H |
| A18 | Success is unconditional: done(ok(String())) follows ScheduleFormSubmission (824-829), which can return silently or with a console message at 885-887, 893-899, 901-908, 910-912, 937-942, 946-952, 962-963, 964-977, 987-990, 1003-1004, 1018-1019. The dialog method (954-957) calls SubmitDialog, which closes an ancestor dialog if one exists (875-880), and schedules no navigation. The comment at 827-828 says navigation was triggered; the code cannot observe that. | 824-829; 882-1043 | partial (LC12) | H |
| A19 | Disconnect during submit dispatch: the comment at 777-786 says the tool is unregistered and no reaction is needed. The code keeps R (A7), ScheduleFormSubmission refuses at 893-899, and ok is reported at 829. | 777-788; 893-899; 829 | absent | H |
| A20 | Non-object resolved values are not JSON-encoded; the result is value.ToString (316-318). The IsNull() test at 316 also falls through when JSON.stringify produced a null String. | 298-319 | absent (LC09 covers the object path only) | H; U8, U9 |
| A21 | Registration timing: removal of an invalid form is synchronous (378-379, 380-398); add or update is posted (402-407) and re-validated at run time (421-425). A form invalid at run time is silently not registered (423-425), with no issue report. | 378-407, 421-425 | absent | H |
| A22 | Frame-less document: the whole scheduling function returns early (359-361), before the invalid-form unregistration (380-398). Whether teardown unregisters declarative tools is outside the excerpt (U10); whether RemovedFrom reaches a connected insertion_point for removed ancestors (518) is outside it (U7). | 359-361, 380-398, 518 | absent | H (path); U7, U10 |
| A23 | CallDoneCallback runs the callback before clearing R, B and I (266, then 267-270). A re-entrant CurrentlyRunning() sees true. LC07 says "only with callback" and does not state ordering. | 263-270 | partial (LC07) | H |
| A24 | Registration validity is a non-null test (369, 421). An empty but present toolname or tooldescription passes, so a tool with an empty name can register. Inference: FastGetAttribute returns null only for absent attributes. Downstream effect unknown. | 365-369, 413-421 | absent | INF; U12 |
| A25 | TODO at 201-203 says the autosubmit attribute should decide submission. The executed branch already keys on it (181-182, 212, 218). The TODO is stale; LC05 must cite code, not the TODO. | 201-203 | note only | H |
| A26 | CHECK(!should_submit) at 794 rests on a SubmitEvent precondition (respondWith implies preventDefault) that lives outside the excerpt. If respondWith can be called without preventDefault, the CHECK is reachable from page script and crashes the renderer. Inference, untested. | 789-794 | absent (inside LC11 span) | INF; U4 |

Fatal CHECK inventory in the excerpt (none is a design claim): 225 (CancelTool requires R), 294 (tool non-null), 411 (WebMCP enabled at registration), 709-711 (submitter behavior invariants), 770 (WebMCP enabled when agentInvoked), 794 (see A26), 826 and 840 (WebMCP enabled at completion).

## 6. Divergences (source against comment, design, or another round)

- D1, LC12 condition. The code gate is should_submit and R still true after ScheduleFormSubmission (818, 825). No navigation predicate exists, and ScheduleFormSubmission returns void (882). The registry row says the sentinel is "not ... proof that navigation completed" (SOURCES.md:110). That understates the gap: the caller cannot tell whether a navigation was scheduled (A18).
- D2, comment against code. The comment at 777-786 says a disconnected form needs no reaction. The code reacts: it keeps R (A7), and ok is reported at 829 after the schedule refused at 893-899 (A19).
- D3, LC08 against A13. "Ignored when the tool no longer runs" holds only while R is false. A later invocation on the same tool object makes a stale response acceptable.
- D4, LC05 against T10-T13. "Prepares submission" is true, but preparation may return without any completion (A11).
- D5, LC06 against A1. The design text omits the CHECK precondition at 225.
- D6, round-17 wording against source scope. `webmcp-invocation-round-17.md:74` says unregistration mid-call does not cancel, and `:87` says it does not cancel in-flight work. The probe behind that claim, `invoke-unregister-while-pending`, uses the imperative `slow` tool registered by `mc.registerTool(def, {signal})` (`.ufo/waves/round-17/probes/invoke-lifecycle.mjs:182`, case at 540-564), aborted through UnregisterTool (`.ufo/waves/round-18/w2/LiveS036.md:92`, model_context.cc:228). The declarative removal path (390-395, 448-452) cancels and has no probe. The note must keep the two scopes separate. This is a scope gap, not a contradiction of S096.
- D7, round-17 control against LC12. `webmcp-invocation-round-17.md:63` (and `.ufo/waves/round-17/w1/C2Harness.md:67-68`) reports that a navigating toolautosubmit form completes with the landing document's result. S096 gives the renderer only a null-String success at 829. The bridge between them is outside this excerpt (U6). Do not cite the S096 sentinel as the CDP result.
- D8, internal inconsistency. Reset (A6, A10) tells the agent the tool was cancelled while the submission still proceeds. No comment addresses it.
- D9, error text. Removal and update share one error string (392-393 and 449-451).

## 7. Design row audit (LC01-LC12)

| LC | Design span | Verified against source | Needed change |
|---|---|---|---|
| LC01 | 181-186 | Correct. | none |
| LC02 | 189-210 | Correct. Span includes CEReactions (189-194). Parse errors (238-247) are also in the error set. | add parse detail (optional) |
| LC03 | 249-258 | Correct. | none |
| LC04 | 212-218 | Correct. "Not completion" holds: R stays true. | none |
| LC05 | 218-221 | "Prepares" is correct. Completion does not follow when PrepareForSubmission returns early (A11). | qualify |
| LC06 | 224-229 | Text correct. Omits the CHECK at 225 (A1). Caller unknown (U2). | qualify |
| LC07 | 261-275 | Correct. Omits ordering (A23). | qualify |
| LC08 | 290-298 | Correct while R is false. Cannot reject late responses for a re-run tool (A13). | qualify |
| LC09 | 298-319 | Correct. Span also includes the success branch 316-319. | none |
| LC10 | 320-327 | Correct. Omits ReportException (322-323). | minor |
| LC11 | 787-815 | Loose. Decision is 807-814; 787-788 is the R re-read; CHECK at 794 is inside the span (A26). | restate span to 807-814 with 787-788 named |
| LC12 | 818-830 | Span loose (gate 818-824, decision 825-829). Condition wrong (D1). | rewrite condition as "should_submit and R still true after ScheduleFormSubmission" |

Agreement: `.ufo/waves/round-20/w1/ScribeChecklist.md` lines 16-18 make the same LC11 and LC12 span observations and the same stale-TODO note. This is a second reading of the same bytes, not independent evidence.

## 8. Confidence and evidence class

- High (literal control flow inside the excerpt): T01-T31; A2-A10, A13-A16, A18, A19, A21, A23.
- Medium (force depends on the absent header or a contract outside the excerpt): A1 caller, A8, A11 reachability, A13 caller, A22, A24, A26.
- Low or unknown: see section 9.
- Nothing here is a runtime, capability or page-behavior claim. Every item is source-scoped (QUALITY 14). The inference tags mark accessor semantics and string truthiness.

## 9. Unknowns (outside this excerpt)

- U1: Member declarations and accessor bodies (html_form_element.h, absent). Assumed: CurrentlyRunning() = R, IsHandlingSubmit() = H, InvocationId() = I [INF].
- U2: Callers and dispatch. model_context.cc:528-580 (ExecuteTool), 562-565, 695 (ExecuteDeclarativeTool), 719, 582-647 (ModelContext::CancelTool, kToolCancelled at 640), webmcp_handler.cc:58-116 and local_frame_mojo_handler.cc:987-1000. Seat-read in `.ufo/waves/round-18/sources/DeclarativeValidation.md:28` and `.ufo/waves/round-18/w2/LiveS042.md:82-87`; not in the tree. Open: does any caller serialize ExecuteTool per tool (A13-A15)? Which path reaches HTMLFormMcpTool::CancelTool for a declarative invocation (A1, A8)?
- U3: What resumes a PauseExecution-ed agent (model_context_supplement.cc, not in the tree). No ResumeExecution appears in the excerpt.
- U4: SubmitEvent respondWith and preventDefault contract (submit_event.cc, absent). Decides whether CHECK at 794 is page-reachable (A26).
- U5: FormMCPSchema::FillData atomicity. The round-19 note states all keys are validated before any is applied (form_mcp_schema.cc:208-231, quote at :210). Not verified here. If false, T02 leaves partial fills.
- U6: Inspector and browser mapping of ok(String()) and kToolCancelled to CDP status (inspector_web_mcp_agent.cc:47-64, 208-243; webmcp_handler.cc:119-156 per round-17 seat-reads; absent). Open: does a sentinel success with no navigation yield a toolResponded at all?
- U7: Blink delivery of RemovedFrom for descendants of a removed ancestor, and whether insertion_point.isConnected() (518) is true there. If false, ancestor removal does not unregister (A22).
- U8: V8 JSON::Stringify result for an object whose JSON is undefined (for example a function) (301-312): error branch or fall-through.
- U9: ScriptValue::ToString for undefined, null, number and boolean (316-318).
- U10: Document teardown for declarative registrations. A round-18 seat-read says model_context_supplement.cc (1665 B) has no document-teardown hook (`.ufo/waves/round-18/w2/LiveS036.md:93`). Not verified here.
- U11: Permissions policy `tools` for same-origin sandboxed frames. The round-16 note covers opaque sandboxed iframes only (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:88`). Decides A11 reachability.
- U12: String truthiness and FastGetAttribute null semantics (A24).

## 10. Checks for the main agent (not run by me)

1. Registry anchor. SOURCES.md:110 anchors `174-328,729-758,818-842`. Lines cited here outside that anchor: 353-463, 637-682, 787-817, 845-873, 1077-1110, 1126-1220, 1622-1625, 1719-1727. Extend the anchor before any note cites those lines. ScribeGate F2 flagged LC11 only.
2. Spans. Apply the LC11 and LC12 corrections in section 7 before the manifest is written.
3. Absent artifacts. The manifest, counter and knowledge note were absent at my read (2026-10-21). The counter must bind the source sha and the corrected spans (QUALITY 22, 30).
4. Committed bytes. ScribeGate F1 reports the body is untracked (`git status` shows `??`). I did not re-check git. QUALITY 28 requires committed bytes before citation.
5. Scope. A-rows are not proposed as additions to the fixed 12-row C1 target. L1 decides. None may be phrased as a runtime claim (QUALITY 14, 23).
