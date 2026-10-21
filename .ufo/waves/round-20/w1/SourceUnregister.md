# SourceUnregister — round 20, wave 1 (source-only)

Lane: tabi-shokunin. Baseline c49929430d996b016dde2e3a3a5be380f3433fdb. Source S096 = `corpus/evidence/round-20/sources/html_form_element.cc`, Chromium 154.0.8037.97. Source-only: nothing here is runtime-observed.

Scope: the unregister/removal path of declarative WebMCP tools on `HTMLFormElement`, and how active-tool done-callbacks are cancelled. Read from the one pinned source file.

Measured identity: `sha256sum` = `8c8d6796…6916`, matching `.ufo/waves/round-20/design.json` `source.sha256`. `wc -l` = 1740.
Reads: bounded ranges 147–1220 and 1614–1731 with greps for tool-pointer, cancel, unregister, and callback identifiers.
Not run: build, tests, Chromium, git, tool installs. Only this report is written. No manifest edits.

Anchors are `html_form_element.cc` line numbers.

## 1. Summary

- Unregister funnel: `ScheduleDeclarativeWebMCPToolRegistration()` (353–408). Its invalid branch (380–399) is synchronous. Its registration branch (402–407) posts `RegisterDeclarativeWebMCPTool` (410–463), which replaces the tool on a tool-attribute or schema change.
- Cancel funnel: `CallDoneCallback` (261–275). A null `done_callback_` makes it a no-op (263–265).
- The only guard against cancelling a running call on removal or replacement is `IsHandlingSubmit()` (390, 448). Its flag is set only inside the synchronous submit block (725–726, block 699–817). Its accessor is not in this file (U1).
- Source-internal discrepancy: the comment at 777–786 expects a dispatch-time disconnect to leave the tool not running, so the boolean recomputed at 787–788 is false. The sync guard keeps the tool running, so the code reacts instead (I2, O9).

## 2. Every cancel and resolve site in the file

| # | Anchor | Trigger | Error code and text | Guarded by IsHandlingSubmit |
|---|---|---|---|---|
| 1 | 224–229 CancelTool | abort signal; caller not in file | kToolCancelled, "…by abort signal" | no; `CHECK(is_currently_running_)` at 225 |
| 2 | 391–394, invalid branch | removal, disconnect, invalid name or description, tool attribute removed | kToolCancelled, "…since tool definition was updated" | yes, 390 |
| 3 | 449–451, replacement | tool attribute or computed schema changed; posted task | same text as row 2 | yes, 448 |
| 4 | 1101–1104, reset() | form reset not prevented | kToolCancelled, "…by a form reset" | **no** |
| 5 | 308–311 | respondWith resolved with non-serializable object | kToolInvocationFailed | n/a |
| 6 | 324–326 | respondWith rejected | kToolInvocationFailed | n/a |
| 7 | 756–758 | sync validation failed | kToolInvocationFailed | n/a |
| 8 | 808–813 | submit prevented without respondWith | kToolInvocationFailed | n/a |
| 9 | 825–829 | after ScheduleFormSubmission, if still running | ok(null String) | n/a |
| 10 | 839–841, submitFromJavaScript | any running tool on form.submit() | ok(null String) | n/a |

Also, the fill-error return at 196–197 calls the callback directly. It never sets running state, and the error codes are at 239 and 252–255.

## 3. Observed in source

- **O1. Removal and insertion gates.** `RemovedFrom` schedules only if the insertion point is still connected (518–523). `InsertedInto` has the same gate (470–475). `RemovedFrom` first runs listed-element and image notifications and `WillDeleteForm`, then `HTMLElement::RemovedFrom` (489–516). `DidChangeFormRelatedElementDynamically` precedes the schedule call in both (473–475, 521–523).
- **O2. Invalid-branch order (380–399).** Cancel the pending registration task (383). Return if there is no active tool (384–386). Cancel the callback unless `IsHandlingSubmit()` (390–395). Call `UnregisterTool(ToolName())` (396). Null the pointer (398). The comment at 378–379 says this is synchronous for "DOM safety and correct event sequence".
- **O3. Frame gate.** `GetDocument().GetFrame()` is checked at 359–361, before the whole unregister branch. The comment at 357–358 says "there is nothing to schedule" with no frame. In a frameless document this function cancels and unregisters nothing. `UnregisterTool` appears only at 396 and 453. `DidMoveToNewDocument` and `ContextDestroyed` do not appear in the file.
- **O4. Guard window.** `is_handling_submit_` is written only at 723–727, through `mcp_tool_submit_scope`, which lives in block 699–817. The block covers validation (729–759), submit dispatch (776), respondWith setup (790–806), and the prevented-without-respondWith path (807–814). The flag is restored at 817.
- **O5. Pending respondWith.** After 817 the guard is off. A later sync invalidation (390) or async replacement (448) therefore cancels the running call. A late promise settlement is dropped at 295–297 because the tool is no longer running.
- **O6. reset() has no guard.** The cancel at 1101–1104 runs whenever the reset event is not canceled (1084–1088). It does not check `IsHandlingSubmit()`, unlike rows 2 and 3.
- **O7. Trigger breadth.** `AttributeChanged` schedules when one of four tool attributes changes value (1130–1135). `ChildrenChanged` schedules unconditionally (1622–1624). `Associate` and `Disassociate` call `ScheduleWebMCPSchemaUpdateIfActive` (1194, 1211), which returns early with no active tool (1719–1726). Replacement fires when a tool attribute differs (433–437) or the computed schema differs (438–439). A non-autosubmit call waits in `PauseExecution` (212–217), so a schema-changing mutation during that wait cancels it.
- **O8. Success is unconditional.** `ScheduleFormSubmission` is `void` (882–883). After it returns, the caller resolves ok(null) whenever `executing_tool->CurrentlyRunning()` (825–829). `ScheduleFormSubmission` can return without scheduling at 885–887 (no view, frame, or page), 893–898 (not connected), 901–908 (constructing entry list), 910–912 (`is_submitting_`), 941 (no FormSubmission), and 946–951 (disconnected by a formdata handler). The comment at 827–828 says the null String means "a navigation has been triggered".
- **O9. Disconnect during submit dispatch.** A disconnect during dispatch (776) runs the sync invalid branch with the guard on. No callback runs (390), so the tool stays running. Lines 787–788 recompute `declarative_webmcp_call` as true. With no respondWith and no prevention, 818–829 resolve ok(null) even though 893–898 returned without scheduling.
- **O10. Disconnect after the window.** A disconnect during `ScheduleFormSubmission` (824) happens after the guard is off. The invalid branch then cancels the callback with "…since tool definition was updated" (391–394). Line 825 sees a non-running tool and does not resolve ok. The same disconnect therefore produces ok(null) in O9 and a cancel here.
- **O11. submitFromJavaScript.** It calls `ScheduleFormSubmission(nullptr, nullptr)` (835), then resolves any running tool with ok(null) (839–841). The comment at 837–838 scopes this to calls made from a submit handler. The check at 839 does not test `in_user_js_submit_event_`.
- **O12. Early returns without resolution.** `PrepareForSubmission` returns at 638–640 (no frame, `is_submitting_`, `in_user_js_submit_event_`), 642–648 (not connected), 650–659 (sandboxed forms), and 679 (unclosed control, flag-gated). None of these calls `CallDoneCallback`. The autosubmit path reaches `PrepareForSubmission` after running state is set (204–210, then 218–220). The file contains no timeout.
- **O13. Getters read only the live pointer.** `IsActiveToolSubmitButton` (155–161), `MatchesToolFormActivePseudoClass` (163–165), and `GetActiveWebMCPToolInvocationId` (167–172) read `active_webmcp_tool_`. After the sync invalid branch nulls it, they report inactive. The detached tool can still be running, as in O9 while a respondWith promise is pending.
- **O14. Re-entrancy.** `CallDoneCallback` moves `done_callback_` out, runs it, and only then clears `is_currently_running_` (266–267). A re-entrant call returns at 263–265 while `CurrentlyRunning()` still reads true. The `CHECK` in CancelTool (225) passes in that window.
- **O15. No audit issue on removal.** `ReportInvalidMCPFormIssueIfNeeded` returns at 333–335 for a disconnected form. The removal path therefore never emits the audit issue (reached from 374–376).
- **O16. Message text.** The invalid branch covers removal and disconnect, but its text at 393–394 is identical to the replacement text at 450–451: "…since tool definition was updated".

## 4. Inference (source-scoped, labelled)

- **I1.** `IsHandlingSubmit()` returns `is_handling_submit_`. Basis: the accessor name and the AutoReset target at 725–726. The header is not in the lane. Falsifier: if the header shows a different body, O4, O5, O9, and O10 change.
- **I2.** Under I1, the expectation at 777–786 fails. The sync guard keeps `executing_tool` running, so 787–788 recompute true and the code reacts: a promise at 790–806, or ok at 825–829. The comment says no reaction is needed.
- **I3.** `isConnected()` is already false when the invalid branch runs inside `RemovedFrom` or `InsertedInto`. Basis: the file's design at 369 and 418–420. Blink node code is not in the lane.
- **I4.** Validity (365–369, 421) uses String truthiness, so a present but empty `toolname=""` passes and an absent attribute fails. Basis: WTF::String and FastGetAttribute null-for-absent semantics. Not in the lane.
- **I5.** The formdata dispatch is inside `FormSubmission::Create` (936), before the check at 946. Basis: the comment at 945, and the dispatch in `ConstructEntryList` (1045–1069), whose caller is not in the lane.

## 5. Unknown (needs sources outside the lane)

- **U1. Declaring header of `HTMLFormMcpTool`.** Needed for `IsHandlingSubmit`, `is_handling_submit_`, `CurrentlyRunning`, `ToolName`, and `InvocationId`. Blocks I1, I2, O4, O5, O9, and O10. Likely `third_party/blink/renderer/core/html/forms/html_form_element.h` at tag 154.0.8037.97; this path is unverified. Top verification item for main.
- **U2.** Callers of `CancelTool()`, and whether the abort path can reach a detached running tool (O9).
- **U3.** `ModelContext::UnregisterTool(name)` and `RegisterDeclarativeTool`: are they keyed by name or by identity? The calls at 396 and 453 pass only the name. Does frame detach remove registrations (O3)?
- **U4.** How Blink dispatches `RemovedFrom` and `InsertedInto` to descendants, and what `insertion_point` means for them (470, 518). If a descendant gets a disconnected insertion point, the unregister at 523 never runs for it.
- **U5.** `FormMCPSchema` (`ComputeJSON`, `FillData`, `SubmitButton`; 249–258, 277–283) decides which mutations change the schema (O7).
- **U6.** How the agent layer reads ok(null) (comment at 827–828).
- **U7.** Whether pending respondWith promises or the O12 early returns ever resolve. None are resolved in this file.
- **U8.** Non-null `model_context` at 388–389 and 427–428 is assumed, not checked.

## 6. Candidate rows (not admitted)

The design fixes 12 rows, LC01–LC12. The manifest is untouched. These are candidates for main or scribe to decide.

- **R1.** The invalid branch cancels synchronously unless inside the sync submit window (353–399; O2, O4).
- **R2.** Replacement is posted and cancels on a tool-attribute or schema change (402–407, 430–462; O7).
- **R3.** Respondwith-pending calls can be cancelled by invalidation, replacement, or reset (O5, O6). Conditional on I1.
- **R4.** reset() cancels without the window guard (1101–1105; O6).
- **R5.** Frameless documents skip the unregister branch (359–361; O3).
- **R6.** A disconnect during dispatch and a disconnect during ScheduleFormSubmission produce different outcomes (O9, O10).
- **R7.** Success is unconditional on the ScheduleFormSubmission outcome (824–829, 882–899; O8).
- **R8.** submitFromJavaScript resolves any running tool (834–841; O11).
- **R9.** PrepareForSubmission early returns resolve nothing (637–682; O12).

Suggested wording edits to existing rows (for scribe; not applied):

- **LC05** (span 218–221): add that the early returns at 637–682 resolve nothing (O12).
- **LC06** (span 224–229): add the `CHECK` at 225, which differs from the tolerant CallDoneCallback at 263–265 (O14).
- **LC12** (span 818–830): "scheduled navigation" overstates. The success is resolved after a void call and does not depend on whether it scheduled anything (O8, R7).

## 7. Checks

- Performed: sha256 and line-count identity check; bounded reads and greps listed in the header.
- Not performed: build, tests, Chromium or any runtime, git, tool installs. Every claim here is source-only and carries no runtime claim.
- Recommended for main: read the header in U1 before accepting I1, I2, R3, or R6 as stated.
