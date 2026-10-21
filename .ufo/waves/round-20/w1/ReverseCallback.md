# ReverseCallback — round 20, wave 1

Seat: TabiR20.ReverseCallback (leaf; no subagents). Scope: callback clearing and synchronous re-entry ordering in the declarative WebMCP form tool, pinned source S096 only.

Source-only: no runtime, build, or test observation; no capability claim. No trigger sequences or abuse steps are given; the caveats are ordering invariants and their failure modes. QUALITY 14 applies: source-scoped inference only.

Labels: **Obs** = line-cited control flow in the pinned file. **Inf** = source-scoped deduction. **Unk** = depends on code outside the pinned file.

## 0. Identity and limits

- Source: `corpus/evidence/round-20/sources/html_form_element.cc` (S096, Chromium 154.0.8037.97), 1,740 lines. `sha256sum` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to the `design.json` pin.
- Git: lane HEAD = `c49929430d996b016dde2e3a3a5be380f3433fdb`. The source path is untracked (`??`). Under QUALITY 28 it may be cited only after it is committed, or as `<repo>@<40-hex>:<path>`. Flagged for L1; not changed here.
- Tooling: this seat has no `lsp` device. Every call-site and definition statement comes from text reads and literal grep over the pinned file. Grep is a fallback and is not semantic proof of call-graph completeness. Header declarations, callee bodies, and base/Blink internals are outside the pinned file and are labelled Unk or Inf. No tools installed or updated. No build, test, or formatter run.
- Writes: this file only.

## 1. Bottom line

1. **Obs.** `CallDoneCallback` (261–275) runs the stored callback at 266 before clearing `is_currently_running_`, `active_submit_button_`, and `invocation_id_` (267–270). For the whole callback, `CurrentlyRunning()` stays true. The only idempotence guard is `done_callback_.is_null()` (263).
2. **Obs + Inf.** The clear after 266 is unconditional. If a synchronous callee re-arms the same tool through `ExecuteTool` (174–210), the clear wipes the new invocation's running flag, button, and id, and leaves its callback set. `ExecuteTool` has no single-flight check (174–177). Whether a callee can do this is Unk.
3. **Obs.** The success completion (829, 841) does not observe whether `ScheduleFormSubmission` (882–1043, `void`) scheduled a navigation. Twelve silent or console-only returns precede the only scheduling call (1041–1042). The comment at 827–828 says a navigation was triggered. LC12's premise has this gap.
4. **Obs.** Four `PrepareForSubmission` exits (639, 647, 659, 679) return without completing an armed tool.
5. **Obs.** A completion inside the submit dispatch (776) does not stop `ScheduleFormSubmission` (818–824), because `should_submit` is not re-gated on running state.
6. **Obs + Inf.** The late-settlement guard (295) tests a boolean, not the invocation. An earlier settlement passes only after a re-arm.

## 2. Reconstructed contract

### 2.1 Per-tool state

| State | is_currently_running_ | done_callback_ | active_submit_button_, invocation_id_ | Entered at |
|---|---|---|---|---|
| S0 Idle | false | null | null, nullopt | construction (header, Unk); clear at 267–270 |
| S1 Armed | true | set | set, set | 204–210, after fill succeeds |
| S2 Completing | true | null (moved-from by Run, Inf) | still set | inside Run at 266, until 267 |
| S0′ Idle with stale id | false | null | null, set | 178, then error return 196–197, no clear |

Writers, exhaustive by grep: `is_currently_running_` at 204, 267. `active_submit_button_` at 205, 269. `invocation_id_` at 178, 270. `done_callback_` at 210 (assign) and 266 (move-from). `ExecuteTool` has no in-file caller. `CancelTool`, `submitFromJavaScript`, and `reset` are reached from outside the file (Unk for the abort wiring).

### 2.2 Completion sites

Counted by grep for `CallDoneCallback`: 12 lines, i.e. 11 call sites plus the definition at 261. One direct `Run` at 197 (error path, never armed), and one `Run` inside `CallDoneCallback` at 266.

| Site | Trigger | Guard before completion | Note |
|---|---|---|---|
| 197 | ExecuteTool fill error | none; never armed | no state change |
| 226 | CancelTool | CHECK is_currently_running_ (225), fatal | abort wiring is Unk |
| 308, 319, 324 | HandleWebMcpToolResponse | CurrentlyRunning (295) | 303 can run script before 319 |
| 391 | ScheduleDeclarative, invalid form, sync | !IsHandlingSubmit (390) | 396 re-reads active_webmcp_tool_ |
| 449 | RegisterDeclarative replacement, posted task | !IsHandlingSubmit (448) | 453 re-reads active_webmcp_tool_ |
| 756 | PrepareForSubmission validation failure | null guard only | ValidateInteractively (729) can run script |
| 808 | preventDefault without respondWith | re-check at 788 | |
| 829 | success, should_submit path | re-check at 825 | ScheduleFormSubmission result unused |
| 841 | submitFromJavaScript | CurrentlyRunning (839) | ScheduleFormSubmission result unused |
| 1102 | reset(), reset event not cancelled | null guard only (1101) | early return at 1079 when no frame |

### 2.3 Obligations and exits

- An armed tool (S1) completes only through the sites above.
- Exits that complete nothing: `PrepareForSubmission` 639 (no frame, `is_submitting_`, or `in_user_js_submit_event_`), 647 (form disconnected), 659 (sandboxed without allow-forms), 679 (unclosed control, flag enabled). Grep over 635–700 returns exactly these four.
- Entries into `PrepareForSubmission` in the file: 220 (autosubmit, armed at 210), 588 (implicit submission), 872 (requestSubmit). The user-submit entry is outside the file (Unk).

## 3. Reentrancy ordering caveat

Windows where synchronous code can run while the tool is armed or completing. All Obs unless marked.

- **W1, inside Run (266), state S2.** Readers that see "running": `MatchesToolFormActivePseudoClass` (163–165), `IsActiveToolSubmitButton` (155–161), `GetActiveWebMCPToolInvocationId` (168–172), `HandleWebMcpToolResponse` (295), `PrepareForSubmission` (722, 788, 825), `submitFromJavaScript` (839). Effects of a nested call:
  - Nested `CallDoneCallback`: returns at 263–265. No second callback.
  - Nested `CancelTool`: CHECK at 225 passes (flag still true). Completion no-ops.
  - Nested `PrepareForSubmission`: classified as tool-driven at 722. Its completions no-op on the null guard.
  - Nested `ExecuteTool` (reachability Unk): writes 178, 204–205, 210. The outer clear at 267–270 then sets running false, nulls the button and id, and leaves `done_callback_` set. Result S3: running false with a pending callback (Inf). Guards then disagree. CancelTool's CHECK fails (225). CallDoneCallback still completes (263 passes). HandleWebMcpToolResponse (295) and submitFromJavaScript (839) skip. `reset` (1101) completes.
- **W2, Focus (215), state S1.** `submit_button->Focus()` runs before `PauseExecution()` (217). That Focus dispatches synchronous script is Inf (Blink, not pinned). A completion in that window is not re-checked before 217.
- **W3, submit dispatch (776).** A completion inside dispatch removes the tool from the checks at 788 and 825. `should_submit` (775–776) still gates `ScheduleFormSubmission` (818–824). Cancel, reset, and submitFromJavaScript completions inside dispatch do not stop navigation (D3).
- **W4, ValidateInteractively (729).** `declarative_webmcp_call` is computed at 722, before 729, and not refreshed. The completion at 756 relies on the null guard.
- **W5, JSON.stringify (303).** The ECMAScript algorithm runs `toJSON` and getters (Spec, not pinned). The running check is at 295 only. The completion at 319 re-checks only the callback slot.
- **W6, ScheduleFormSubmission (824, 835).** `FormSubmission::Create` (936) presumably runs the formdata dispatch at 1069 (Inf; that call is outside the file). The comment at 945 says formdata handlers may disconnect the form. `submitFromJavaScript` (835) can run inside an outer submission (`is_submitting_`, 910–912).
- **W7, outer-frame re-read.** After `CallDoneCallback`, 391→396 and 449→453 re-read `active_webmcp_tool_`. A nested path that clears it (398) or replaces it (454) makes 396 or 453 dereference null or act on the replacement. Requires a synchronous nested unregister (Unk).
- **W8, submitter staleness.** `submit_button` is resolved at 250, then `FillData` (258), then the CEReactionsScope exit (190–194; reactions flushed at scope exit is Inf), then the error check (196), then arming (204–205). No connectedness re-check of the button. The button is still passed to `Focus` (215) and to `PrepareForSubmission` (220). The form-level check at 642 does not cover the submitter. Consequences for a detached submitter are outside the file (Unk).

Ordering note (Inf): callback-first ordering keeps `GetActiveWebMCPToolInvocationId` (168–171) answering the invocation id during the callback. The file states no rationale.

## 4. Divergences and caveats

**D1. Success completion is not gated on navigation (high, control flow).**
- 829 and 841 deliver `base::ok(String())` after `ScheduleFormSubmission` returns. The comment at 827–828 reads the null String as "navigation triggered".
- Returns before the scheduling call (1041–1042), none of which reaches a frame navigation:

| Line | Condition | Console message |
|---|---|---|
| 886 | no view, frame, or page | no |
| 898 | form disconnected | yes |
| 907 | constructing entry list | yes |
| 911 | is_submitting_ | no |
| 941 | FormSubmission::Create null | no |
| 951 | disconnected after formdata | yes |
| 956 | method=dialog; SubmitDialog closes a dialog or does nothing | no |
| 963 | empty action | no |
| 976 | sandboxed, no allow-forms | yes |
| 989 | javascript: URL refused by form-action CSP | no |
| 1004 | no target frame | no |
| 1019 | navigation not allowed | no |

- Line 1012 is a return after `Navigate()` for javascript: URLs. That path does navigate, so it is not in the table.
- In-file example, tool running at the start of the submit (722): a submit dispatch disconnects the form, with no preventDefault. The file contemplates both the dispatch case (777–778) and the formdata case (945). Path: 776, then 787–788 still running (is_handling_submit_ set at 725), then 818, then return 898, then 825, then 829 ok. The sentinel is delivered and no navigation is scheduled.

**D2. Completion obligation not discharged on PrepareForSubmission exits (high, control flow; reachability medium).**
- Exits 639, 647, 659, 679 return with no completion. Autosubmit (220) leaves an armed tool running.
- In-file example: registration (354–369) checks WebMCP enabled, frame, connectedness, name, and description. It does not check sandboxing. An autosubmit invocation then reaches 659 with no completion. Whether upstream pre-filters sandboxed forms is Unk.

**D3. Completion during dispatch does not gate navigation (high).** See W3. The running re-check (787–788) gates only the respondWith branch (789–806) and the programming-error branch (807–814). It does not gate 818–824.

**D4. Comment and code disagree at 777–780 (high for mechanics; `IsHandlingSubmit` is name-inferred, header Unk).**
- The comment says that if the form was disconnected, "there's no need to react to the Promise".
- Mechanics: 725 sets `is_handling_submit_` when the tool was running at 722. The unregister paths (390, 448) then skip `CallDoneCallback`. The tool stays running, so 788 still takes the promise path (790–806) and 825 completes ok. The code avoids a hang. The comment describes a state the code does not produce.

**D5. No single-flight at ExecuteTool entry (high, control flow; caller guarantee Unk).**
- 174–177 has no check of `is_currently_running_` or `done_callback_`.
- An entry while armed: 178 overwrites the id; 192 mutates controls under the armed tool; 210 overwrites `done_callback_`, dropping the earlier callback unrun (move-assign); 204–205 overwrite running state and the button.

**D6. Stale invocation id on the fill-error return (high).** 178 writes the id before the error return (196–197), and nothing clears it on that path. The only in-file reader (170) is guarded by `CurrentlyRunning()` (169), so the stale value is masked here. Other readers, if any, are Unk.

**D7. Late-settlement guard tests a boolean (high, control flow).**
- 295 checks `CurrentlyRunning()`. The binding (798–806) carries the tool object and a resolved flag, not the invocation id.
- A settlement for invocation N passes 295 if invocation N+1 is armed on the same object. That requires a re-arm (D5).
- Between 295 and 319, JSON.stringify (303) can run page script (W5). 319 checks only the callback slot.

**D8. Asymmetric guards (high).**
- CancelTool asserts running (225, fatal). CallDoneCallback is a silent no-op (263–265).
- submitFromJavaScript checks `CurrentlyRunning()` (839). CallDoneCallback does not.
- `reset` completes with no running check (1101) and returns early without a frame (1079).

**D9. Done-callback slot not traced (Obs).** `HTMLFormMcpTool::Trace` visits `form_` and `active_submit_button_` (285–288). Whether the callee's captures need tracing is Unk.

## 5. Cross-check against the LC rows

Read read-only: `design.json` spans and the scribe's clone draft. All twelve spans contain the branch they name, checked against the pinned bytes.

| Row | Span | Status | Suggested change |
|---|---|---|---|
| LC01 | 181–186 | ok | none |
| LC02 | 189–210 | wording gap | invocation_id_ is set at 178, outside the span, and not cleared on this path. The parenthetical covers only is_currently_running_, active button, and done_callback_. |
| LC03 | 249–258 | ok | none; its callback runs at 197, outside the span |
| LC04 | 212–218 | wording gap | The tool is armed (204–210) when Focus runs (215). PauseExecution (217) is not gated on CurrentlyRunning. Focus-handler behaviour is Inf. |
| LC05 | 218–221 | wording gap | Name the four exits at 639, 647, 659, 679 that complete nothing. "PrepareForSubmission is called" implies no completion. |
| LC06 | 224–229 | ok | optional: CHECK (225) versus silent null guard (263–265) |
| LC07 | 261–275 | understated | The source does show state during the callback. Lines 267–270 have not run, so is_currently_running_, active_submit_button_, and invocation_id_ hold pre-completion values. "Does not show state during the callback" understates this. "done_callback_ null during Run" is Inf (base semantics). |
| LC08 | 290–298 | wording gap | Guard is CurrentlyRunning() only. Invocation identity is not compared; the binding carries the tool object (798–806). |
| LC09 | 298–319 | wording gap | JSON.stringify (303) can run page script after the running check (295). 319 re-checks only done_callback_. |
| LC10 | 320–327 | ok | none |
| LC11 | 787–815 | ok | none; operative branch 807–813 as the scribe notes |
| LC12 | 818–830 | premise gap | "A navigating submit proceeds" and "scheduled navigation" are not established. Suggested condition: should_submit is true and the tool is still running at 825. Suggested outcome: ScheduleFormSubmission (void) returns, then ok(null String) is delivered. The comment says navigation was triggered, but the code does not observe whether one was scheduled; 12 silent or console-only returns at 886–1019 precede 1041. The design.json LC12 topic carries the same premise; L1 owns that file. |

Add to the scribe's "Completion paths outside the twelve rows": the PrepareForSubmission exits (D2), the ScheduleFormSubmission exits (D1), and the ExecuteTool re-arm exposure (D5).

## 6. Not established (Unk)

- The done callback's implementation (ModelContext or mojo closure): whether it can synchronously call ExecuteTool, mutate the DOM, or run script. This gates W1, W7, and D5.
- Upstream single-flight, abort-listener lifecycle, timeouts, and teardown: whether an armed tool can stay pending indefinitely.
- Header declarations: HTMLFormMcpTool members and types, `IsHandlingSubmit`, `CurrentlyRunning`, `InvocationId`, `ActiveToolSubmitButton`, `McpToolCallbackResult`.
- `FormMCPSchema::FillData` and `SubmitButton` side effects, including events.
- `PauseExecution` semantics, and whether pausing after a completed invocation is harmful.
- Whether upstream pre-filters sandboxed or frameless forms before ExecuteTool.
- Consumers of the null-String sentinel (CDP mapping) and of `ok` on non-navigating exits. Not in S096; prior-round reads not re-opened.
- Inf items to verify before any claim: base::OnceCallback moved-from on Run (base/functional/callback.h); CEReactions reactions flushed at scope exit; Focus dispatching synchronous events; the formdata dispatch reached from FormSubmission::Create.

## 7. Confidence

- Line-level control flow in the pinned file: high (read in ranges, grep-enumerated, return counts verified).
- Re-entry reachability and production liveness: low (depends on Unk callers and callees).
- Base and Blink internals: medium (labelled Inf).
- No runtime or capability claim is made.

## 8. Handoff

- L1 / ScribeLifecycle: decide the §5 wording changes. LC12's premise matters most.
- Lane: commit or pin the S096 body before any claim cites it (QUALITY 28).
- Counter (`measure-c1.mjs`): not run; main runs it after any row change.
- No peer file was edited. Peer drafts were read read-only (`w1/SourceLC06.md`, `w1/ScribeLifecycle.md`, the scribe clone's decisions.json and note).
