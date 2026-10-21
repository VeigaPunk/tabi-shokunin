# SemanticLC12 — round 20 LC12 predicate/effect check (w2)

Target: LC12 only. Anchor `corpus/evidence/round-20/sources/html_form_element.cc:818-830` (S096), revision `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Source-only; no runtime claim; no tests; no exploit reproduction. Read-only except this file. Installs or updates: none.

Artifacts checked: `corpus/evidence/round-20/lifecycle/decisions.json` (LC12); `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (row line 40, sentinel scope line 44, checklist item 9 line 66, LC12 history line 79); `SKILL.md` lines 2228 and 2234.

Axes: A1 predicate · A2 callsite/effect · A3 callback/null guard · A4 attribution (comment/label) · A5 anchor/provenance · A6 sample limits. Verdicts are per field; nothing is summed.

## 1. Identity (exercised)

- Retained file sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- `git show 4ae99816…:corpus/evidence/round-20/sources/html_form_element.cc | sha256sum` gives the same value. `git diff --stat 4ae99816… --` over the source, decisions.json, the note and SKILL.md is empty.
- Upstream `…/refs/tags/154.0.8037.97/…/html_form_element.cc?format=TEXT`, base64-decoded, gives the same sha256.
- `grep -nF` for the LC12 quote: one match, line 829.
- Opened as primary source, not retained, not counted, used only for accessor definitions: upstream `html_form_element.h`, sha256 `68d7712b6d8fc0637e3fc434d666624e3c955d51e7448b0039bec080a43adec6`. It defines `McpToolCallbackResult = base::expected<blink::String, blink::ScriptToolError>` (271-272), `CurrentlyRunning()` returning `is_currently_running_` (319), and `IsHandlingSubmit()` returning `is_handling_submit_` (325).

## 2. Field verdicts

| # | Axis | Field | Verdict | Basis (S096 unless noted) |
|---|---|---|---|---|
| F1 | A5 | Span 818-830; quote at 829 | ENTAILED | 818 `if (should_submit) {`; 829 holds the quote; 830 closes the inner `if`. |
| F2 | A1 | "PrepareForSubmission reaches the should_submit branch" | ENTAILED | `should_submit` (696) is assigned on both arms (730; 775-776) before 818. Early returns at 638-639, 647, 659 and 679 never reach 818. |
| F3 | A1 | "executing_tool remains CurrentlyRunning after ScheduleFormSubmission returns" | ENTAILED ("remains" is a gloss) | The gate is 825 `executing_tool && executing_tool->CurrentlyRunning()`, read only after the call at 824. `executing_tool` is the pointer captured at 720, not `active_webmcp_tool_`, which teardown nulls at 398. The pre-call flag `declarative_webmcp_call` (787-788) is not read at 825. |
| F4 | A2 | "CallDoneCallback runs with base::ok …" | REWRITE | The call at 829 is ENTAILED. The stored callback is invoked only when `done_callback_` is non-null (263-266); otherwise the call has no effect. The row's condition does not say this. The running-state reset (267-274) belongs to LC07 and is not stated here. |
| F5 | A2 | "base::ok of a null String" | ENTAILED | Argument `base::ok(String())` (829); result type per upstream header 271-272. Null: the file's own pattern `String result;` (299) then `if (result.IsNull())` (316) treats a default-constructed String as null. |
| F6 | A4 | "which the source comment describes as a navigation-intent sentinel" | NOT-ENTAILED | The comment at 827-828, wrapped across two lines, says "Return a null string to indicate that a navigation has been triggered." The words "intent" and "sentinel" do not occur in S096 (case-insensitive grep: 0 each). The label is the note's gloss. It also softens a factual claim that the callsite does not enforce (F12). |
| F7 | A2 | "internal" | ENTAILED as "a C++ value passed to a done callback"; UNRESOLVED as "never reaches the wire" | Only the stored callback is visible here. Its consumer is outside the retained file. |
| F8 | A6 | "not proof of navigation" | ENTAILED | `ScheduleFormSubmission` is `void` (882-883) and returns before the scheduling call (1041-1042) on the paths in §3. |
| F9 | A6 | "not proof of success" | ENTAILED | Same paths. The success arm is passed whether or not anything was scheduled. |
| F10 | A6 | "not proof of … any CDP output value" | ENTAILED as a disclaimer | The retained source has no CDP mapping. §5 shows a different output on the same path type. |
| F11 | A3 | "guarded only by executing_tool remaining CurrentlyRunning" | ENTAILED for the caller-side guard; REWRITE for "only" | Caller guard 825 (`executing_tool &&`). Line 826 is an assertion (CHECK WebMCPEnabled), not a guard. The callee guard at 263-265 also applies. In the callback window 266-267, `is_currently_running_` is still true while `done_callback_` is null, so `CurrentlyRunning()` is not equivalent to "callback still pending". |
| F12 | A2/A6 | "it is not conditioned on navigation being scheduled" | ENTAILED (the strongest claim in the row) | 824 returns nothing. 825 tests no navigation state. §3 lists the early returns. |
| F13 | A5 | "The body of ScheduleFormSubmission is outside the retained anchor." | REWRITE | True of 818-830 only. The body is in the same retained file at 882-1043, read here. The row should cite it. |
| F14 | A1 | Entry-time predicate (`require_submit_button`, ExecuteTool 181-186) | ENTAILED (not a condition of LC12) | 818-830 does not read it. Tool identity is captured at 720, after the early returns at 638-682. |
| F15 | A3 | `CHECK(WebMCPEnabled)` at 826 | REWRITE (omitted precondition) | Not stated in the row. No contradiction. |
| F16 | A6 | Other sentinel producer, `submitFromJavaScript` (834-843) | ENTAILED | 835 `ScheduleFormSubmission(nullptr, nullptr)`; 839-841 use the same `ok` pattern. Note caveat line 50 is accurate. |
| F17 | A6 | Early returns without a done callback (639, 647, 659, 679) | ENTAILED | Lines checked. Note line 52 is accurate. |
| F18 | A5 | Cross-artifact text | ENTAILED identical in decisions.json, SKILL.md:2228 and note :40 | The same attribution problems recur in note :44 and :66 (see §6). |

## 3. Early returns in ScheduleFormSubmission before the scheduling call (S096 882-1043)

885-887 no View/frame/page · 893-899 not connected · 901-908 constructing entry list · 910-912 `is_submitting_` · 937-942 no FormSubmission · 946-952 formdata handler disconnected the form · 954-957 dialog method · 962-963 empty action · 964-977 sandboxed · 987-989 CSP form-action refusal · 1003-1004 no target frame · 1018-1019 navigation not allowed. The scheduling call is at 1041-1042. Each early return goes back to 825-829 unchanged.

## 4. Side path: disconnect during the submit event (source-derived; not reproduced)

1. 720-722 capture `executing_tool` and set `declarative_webmcp_call`. 725-726 set `is_handling_submit_` for the dispatch block, whose scope ends at 817.
2. 776 `DispatchEvent(submit)`. A handler that removes the form from a connected parent reaches `RemovedFrom` (486, 518, 523) and then `ScheduleDeclarativeWebMCPToolRegistration` (353). Attribute changes (1135) and child changes (1624) reach the same function.
3. 380-398: `!is_valid_mcp_form` → 390 `IsHandlingSubmit()` is true → no `CallDoneCallback` → 396 `UnregisterTool` (ModelContext, not retained) → 398 `active_webmcp_tool_ = nullptr`.
4. 787-788: `executing_tool->CurrentlyRunning()` is still true. With no respondWith (789-807 do nothing) and should_submit true, the block ends at 817.
5. 824 `ScheduleFormSubmission` → 893-899 `!isConnected()` return → 825-829 still running → `CallDoneCallback(base::ok(String()))`.

UNRESOLVED dependencies: whether `UnregisterTool` completes or cancels the in-flight invocation (if it does, 825 is false), and the consumer of the ok value. The comment at 777-784 says there is "no need to react" when `active_webmcp_tool_` is null. Lines 787-788 test `executing_tool`, which teardown does not clear, so the code does react. The author's intent is [INFERENCE].
Also, 769-771 set `agentInvoked` on any dispatch while a tool is running. The flag follows tool state, not the invoker. A user-activated submit during an LC04 pause would take the same path. The caller is not retained, so this is [INFERENCE].

## 5. Prior observations: not erased

- r17 `invoke-declarative-navigation-result` (`corpus/evidence/round-17/webmcp-invoke/receipt.json:8358`; `receipt.stdout.txt:14` pass): `responded.status` is Completed with a two-element output array (8397-8408), and `navigationEvents` is 1 (8411). Fixture `invoke-decl-nav.html:6` (toolautosubmit) and 39-41 (submit not prevented) give the source path LC05 → LC12. The observed output is not a null string. Source-only LC12 neither confirms nor contradicts it. The note's open gap (line 79) is accurate.
- r19: the note's reference (line 81) is the validation path (S096:729-759), not LC12. No r19 receipt is cited for LC12.

## 6. Suggested corrections (not applied; for the integration owner)

decisions.json LC12, and the rendered SKILL.md:2228 row regenerated from it per skillRendering (note :40 must match):
- condition: "PrepareForSubmission reaches the should_submit branch (S096:818), and executing_tool (captured at 720) is CurrentlyRunning() after ScheduleFormSubmission returns (824-825)."
- outcome: "CallDoneCallback is called with base::ok(String()), a null-String success value; the stored done callback runs only when done_callback_ is non-null (263-266). The source comment at 827-828 says the null string indicates that a navigation has been triggered. This row does not verify that: ScheduleFormSubmission (void; S096:882-1043) returns before scheduling on several paths, and the call is not conditioned on navigation. The value is a C++ value passed to the done callback, whose consumer is outside the retained source; it is not proof of navigation, success, or any CDP output value."
- anchor and quote: unchanged. Span: unchanged.

Also:
- note line 44: drop "The source comment calls it a navigation-intent sentinel"; quote the 827-828 wording instead.
- note line 66: drop "navigation-intent sentinel per the source comment"; change "on the navigating submit path" to "on the should_submit path (navigation not guaranteed, S096:882-1043)".
- SKILL.md:2228 must match the corrected manifest text exactly.
- The counter checks quote and span, which are unchanged, so it should still pass [INFERENCE; not run].

## 7. Not verified / untested

- No test, selftest, counter or runtime run. The §4 side path is not reproduced.
- Not retained: `ModelContext::UnregisterTool`; the consumer of the ok value; callers of PrepareForSubmission for user submits; the ExecuteTool caller contract that the callback is non-null.
- Out of scope, not pursued: whether `CurrentlyRunning()` distinguishes invocations if ExecuteTool re-enters during ScheduleFormSubmission. This is a race lead and remains unverified.

Report: .ufo/waves/round-20/w2/SemanticLC12.md
