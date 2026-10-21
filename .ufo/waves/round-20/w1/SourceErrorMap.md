# SourceErrorMap: kToolCancelled and kToolInvocationFailed in pinned Chromium 154

Seat: TabiR20.SourceErrorMap (leaf scout). Baseline c49929430d996b016dde2e3a3a5be380f3433fdb.
Evidence class: source-scoped to Chromium 154.0.8037.97 (tag). Runtime statements are limited to lane receipts cited by path and line, labelled **observed**. Nothing here is a runtime or capability claim. No tests, builds, formatters, or tool installs were run. Labels: **source-only** = pinned code path, no lane receipt; [INFERENCE] = not directly shown in opened code.

## 0. Axes

A1 producer site · A2 probe forwarding · A3 status mapping · A4 delivery gates · A5 observation.

## 1. Pins

Fetched 2026-10-21 by tag URL (`.../+/refs/tags/154.0.8037.97/<path>?format=TEXT`), base64-decoded, sha256 of decoded bytes. Scratch copies in `/tmp/w1-SourceErrorMap-r20/` are volatile and not a durable root; re-fetch by URL and compare.

| File (pinned path) | Decoded sha256 | Lines | Registry status |
|---|---|---|---|
| third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc | 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475 | 245 | matches S097 pin |
| third_party/blink/renderer/core/script_tools/script_tool_types.h | ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d | 53 | matches S080 pin (round-19 lesson row) |
| third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff | 123 | matches S041, S079, S099 pin |
| third_party/blink/renderer/core/script_tools/model_context.cc | 474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823 | 1245 | matches S042 prefix 474083d6...8823 |
| corpus/evidence/round-20/sources/html_form_element.cc (lane copy; pinned path third_party/blink/renderer/core/html/forms/) | 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 | 1740 | matches S096 and design.json pin; tracked |
| content/browser/devtools/protocol/webmcp_handler.cc | 53793d1ebb5e2027abbb95c0f8cb909dd0d4bccae18f9309f658651d722cb1a4 | 160 | **no SOURCES.md row**; fetched this round (directory listing sha bf8c57ef...) |
| third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc | 9311613afbf96a6d5a10e87d8f78c633f3ac29948550144d2b2870f899263862 | 1555 | **no own row**; anchored only inside S079 note text; fetched this round |

Counting commands (run on the pinned copies):
`grep -c kToolCancelled inspector_web_mcp_agent.cc` = 1; `grep -c kToolInvocationFailed inspector_web_mcp_agent.cc` = 0;
`grep -c kToolCancelled model_context.cc` = 4 (lines 66, 67, 204, 640); `grep -c kToolInvocationFailed model_context.cc` = 4 (lines 64, 65, 199, 868);
`grep -c kToolCancelled html_form_element.cc` = 4 (227, 392, 450, 1103); `grep -c kToolInvocationFailed html_form_element.cc` = 4 (309, 325, 757, 809);
`grep -c kToolCancelled script_tool_types.h` = 1 (21); `grep -c kToolInvocationFailed script_tool_types.h` = 1 (20).

## 2. Source mapping (A3): what the pinned code would emit

`inspector_web_mcp_agent.cc:228-230`, one branch:
- `kToolCancelled` maps to `Canceled`. It is the only code with its own status.
- Every other code maps to `Error`: `kToolInvocationFailed`, `kInvalidToolName`, `kInvalidInputArguments`, `kMissingRequiredSubmitButton`. The last three are mapped by the same else-branch; their producers were not traced here.
- Wire fields (`:241-243`): `invocationId`; `status`; `output` is `nullptr`, so omitted; `errorText` is the raw `ScriptToolError::message`; `exception` is set only when a JS exception pair is attached (`:231-239`).
- Vocabulary: `InvocationStatus` is exactly `Completed | Canceled | Error` (`WebMCP.pdl:25-30`). `script_tool_types.h:16-22` defines the five codes; `:24-29` gives `ScriptToolError` with a default-null `message`; `:31-36` compares by code only.

## 3. Producers (A1)

### kToolCancelled: five producer sites

| # | Pinned site | Enclosing function | Message | Probe route (A2) | errorText | Status |
|---|---|---|---|---|---|---|
| C1 | html_form_element.cc:224-229 | HTMLFormMcpTool::CancelTool; in the opened files reached only from ModelContext::CancelTool declarative branch, model_context.cc:613-618 | "Tool execution cancelled by abort signal" | ExecuteDeclarativeTool lambda, model_context.cc:735-737, unchanged | same text | source-only |
| C2 | html_form_element.cc:391-394 | ScheduleDeclarativeWebMCPToolRegistration, invalid-form branch 380-400; synchronous (comment 378-379); invalid when !isConnected() at 369 | "Tool execution cancelled, since tool definition was updated" | same lambda | same text | source-only |
| C3 | html_form_element.cc:448-452 | RegisterDeclarativeWebMCPTool, replace path 430-455 | same as C2 (text at 449-451) | same lambda | same text | source-only |
| C4 | html_form_element.cc:1101-1105 | HTMLFormElement::reset(), 1077-1110 | "Tool execution cancelled by a form reset" | same lambda | same text | source-only |
| C5 | model_context.cc:620-641; producer at 639-640 | ModelContext::CancelTool imperative branch, then OnToolFailed 518-526 | none (null message) | probe at 521-522, unchanged | "" | **observed**: round-17 invoke-cancel |

### kToolInvocationFailed: five producer sites

| # | Pinned site | Enclosing function | Message | Probe route (A2) | errorText | Status |
|---|---|---|---|---|---|---|
| I1 | html_form_element.cc:729-758 (prefix at 733; producer call 756-758) | HTMLFormElement::PrepareForSubmission, 635-833, validation-failure branch | "Form validation failed: " then "<name>: <validationMessage>. " per invalid control (735-754) | lambda 735-737, unchanged | that text | **observed**: round-19 submit-time (section 5b, submit-time row) |
| I2 | html_form_element.cc:300-311 | HandleWebMcpToolResponse, resolved with non-serializable object | "respondWith promise resolved with an object that could not be serialized to JSON" | lambda | same text | source-only |
| I3 | html_form_element.cc:322-326 | HandleWebMcpToolResponse, rejected branch | "respondWith promise was rejected" (reason goes to console, 322-323) | lambda | same text | source-only |
| I4 | html_form_element.cc:807-813 | PrepareForSubmission, prevented submit with no respondWith promise | "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result" | lambda | same text | source-only |
| I5 | model_context.cc:865-870; producer at 868 | ModelContext::OnToolExecuted error arm, reached via HandleFailure 302-321 for JS throw or reject | none (null message) | probe at 869 keeps the exception pair | "" plus exception | **observed**: round-17 imperative throw and reject |

`OnToolExecuted`'s error type is the JS exception pair (`model_context.cc:858`), not a `ScriptToolError`. Line 868 is therefore the only point where a JS failure becomes `kToolInvocationFailed`.

Not producers: `model_context.cc:64-67` (static asserts) and `:199-200` (switch inside `GetToolErrorMessage`, 183-211).

## 4. Probe forwarding (A2), model_context.cc

- `OnToolFailed` (518-526) forwards the error unchanged.
- `ExecuteDeclarativeTool` lambda (721-745) forwards the error unchanged, with exception `nullopt` (737). A success with a null string is the cross-document sentinel and emits no event (728-734).
- `OnToolExecuted` (856-872) is the only rewrite: it forces `kToolInvocationFailed` with no message (868) and passes the JS exception pair (869).
- `CancelTool` also dispatches the page-level `toolcancel` DOM event (643-647), and only from that path. C2 to C4 call `CallDoneCallback` directly. A case-sensitive grep of the lane's `html_form_element.cc` finds no `toolcancel` or `kToolcancel` dispatch. So C2 to C4 produce a CDP `Canceled` event with no page `toolcancel` event.

## 5. Delivery (A4, A5): source mapping versus delivered events

### 5a. Gates (source)

1. Browser `WebMCPHandler::InvokeTool` (webmcp_handler.cc:58-116). Browser-side `enabled_` is checked (62-65). Success returns `sendSuccess(invocationId)`; failure returns -32602 "Tool not found" (104-115).
2. Renderer `LocalFrameMojoHandler::InvokeScriptToolForInspector` (local_frame_mojo_handler.cc:987-1006). It pre-checks `GetScriptToolDeclaration` (992-994) and posts `ExecuteTool(..., base::DoNothing())` (995-1000). The CDP path therefore never receives `ExecuteScriptTool`'s callback text. The only renderer-side terminal output is the probe (browser-side synthesis: D4).
3. Inspector `enabled_` (225-227). `enable()` sets it and registers the agent with `instrumenting_agents_` (115-117). `disable()` clears both (133-135). `enable()` replays `toolsAdded` only (119-129). No `toolResponded` replay code appears.
4. `cancelInvocation`. The browser handler returns `Response::FallThrough()` (webmcp_handler.cc:54-56). The renderer agent's `cancelInvocation` (inspector:139-165) calls `ModelContext::CancelTool` (152). With no pending match it returns InvalidParams "No pending execution for invocation id" (159-162) and emits no event.
5. Frontend attachment: `GetFrontend()` is not opened. [INFERENCE] events are dropped when no session is attached.

### 5b. Path table

Lane paths are relative to the lane root.

| Path | Code | CDP status | errorText | Delivered | Evidence |
|---|---|---|---|---|---|
| Imperative cancelInvocation (C5) | kToolCancelled | Canceled | "" | **observed** | round-17 corpus/evidence/round-17/webmcp-invoke/receipt.json:7997-8000 (invoke-cancel); corpus/knowledge/webmcp-invocation-round-17.md:62 |
| JS throw (I5) | kToolInvocationFailed | Error | "" plus exception | **observed** | receipt.json:1429-1450 (invoke-imperative-throws); knowledge :51 |
| JS reject (I5) | kToolInvocationFailed | Error | "" plus exception | **observed** | receipt.json:2156-2177 (invoke-imperative-rejects); knowledge :52 |
| Submit-time validation (I1) | kToolInvocationFailed | Error | "Form validation failed: ..." | **observed** | corpus/evidence/round-19/validation/probes/missing-required.json:88-95; corpus/evidence/round-19/validation/integration/receipt-1.json:1325-1338; submitCount 0 |
| Fill-time failure | kInvalidInputArguments and similar | Error | "Invalid value ..." | **observed** (shares Error status) | receipt-1.json:185-198 |
| Declarative cancelInvocation (C1) | kToolCancelled | Canceled | "Tool execution cancelled by abort signal" | source-only | none |
| Form reset during call (C4) | kToolCancelled | Canceled | "...by a form reset" | source-only | none |
| Definition change during call (C2, C3) | kToolCancelled | Canceled | "...since tool definition was updated" | source-only | none |
| Form removed from a connected parent during call | kToolCancelled | Canceled | as C2 | source-only; subtree-removal semantics not opened | RemovedFrom html_form_element.cc:518-524 schedules at 523; C2 branch 380-400 |
| respondWith rejected, non-serializable, or prevented without respondWith (I2 to I4) | kToolInvocationFailed | Error | as sited | source-only | none |
| Unknown tool name | source maps kInvalidToolName to Error (model_context.cc:549-553) | none; command error -32602 | n/a | **not delivered** | pre-check local_frame_mojo_handler.cc:992-1005; **observed** round-17 invoke-unknown-tool (knowledge :53) |
| Agent navigation, cross-origin | none (browser-synthesized) | Error | "Cannot return tool results after a cross-origin navigation" | source-only | webmcp_handler.cc:146-149 |
| Declarative autosubmit to a relative landing URL (agent-initiated navigation) | none | Completed | landing result | **observed** (control) | knowledge :63; landing origin not stated in the note |
| Non-agent navigation during a pending imperative call | none | none in 8,000 ms | n/a | **observed** | receipt.json:7062-7064 (invoke-navigation-pending); knowledge :60; webmcp_handler.cc:124-128 returns early without an agent-initiated invocation id |
| Unregistration during an imperative pending call | none | none | n/a | probe only, not a receipt | knowledge :74; SKILL.md:1957; model_context.cc:489-499 (UnregisterTool) emits no terminal event |

### 5c. Distinctions between source mapping and delivered events

- **D1. Status collapse.** `Error` is the else-branch for four codes (inspector:228-230). Round-19 shows `Error` for fill-time "Invalid value ..." (receipt-1.json:185-198) and submit-time "Form validation failed:" (:1325-1338). Only `errorText` separates them. The `status` field alone cannot identify kToolInvocationFailed. SKILL.md:2052-2056 already directs readers to status plus errorText.
- **D2. Agent text is not CDP text.** The fallback strings in `GetToolErrorMessage` ("Tool was cancelled"; "Tool was executed but the invocation failed. For example, the script function threw an error") are produced only for the `ExecuteScriptTool` callback (model_context.cc:916-917). The CDP path passes `DoNothing` (local_frame_mojo_handler.cc:1000) and forwards the raw message (inspector:242). Observed throws and cancels carry `errorText ""`. A case-sensitive corpus grep finds neither fallback string in evidence, knowledge, or lessons. WebMCP.pdl:116 says "Output or error delivered as delivered to the agent"; WebMCP.pdl:119-120 says errorText is "Error text for protocol users." The code follows the second wording.
- **D3. Unknown name.** kInvalidToolName is source-mapped to Error (model_context.cc:549-553) but never delivered over CDP. The mojo pre-check answers first (local_frame_mojo_handler.cc:992-1005), and the browser returns -32602 (webmcp_handler.cc:112). Runtime agrees (round-17 invoke-unknown-tool). [INFERENCE] A declaration removed between the synchronous check (992) and the posted task (995) would reach ExecuteTool and emit Error "Tool not found: <name>". Unobserved.
- **D4. Browser-originated Error.** webmcp_handler.cc:147-149 emits `toolResponded` with status Error and no ScriptToolError behind it. That bypasses the inspector mapping entirely. It fires only for agent-initiated navigations (124-128) that cross origin (146). Unobserved in the lane.
- **D5. Page event asymmetry.** The `toolcancel` DOM event fires only from `ModelContext::CancelTool` (643-647). C2 to C4 produce a CDP Canceled with no page event (section 4).
- **D6. Ordering (source-derived, not measured).** Declarative and imperative cancel events are emitted synchronously inside `cancelInvocation`. The probe at 521 or 736 runs before the command returns (inspector:152-164). Throw and reject events come from promise reactions after the invocation response. WebMCP.pdl:68 documents that the response precedes tool events.
- **D7. At most one terminal event per invocation (source).** On the form path, `CallDoneCallback` is a no-op after its first run (html_form_element.cc:263-265), and HandleWebMcpToolResponse returns when the tool is no longer running (295-297). On the JS path, OnToolExecuted returns when the pending entry is gone (859-862), and cancel takes the entry first (model_context.cc:626). The first terminal path wins. A cancel after completion is a command error, not an event.
- **D8. Teardown and unregistration.** In the opened files, no kToolCancelled or kToolInvocationFailed producer is reached from document teardown or from `UnregisterTool` (model_context.cc:489-499). The asynchronous pending-execution cleanup named at model_context.cc:597-603 has its receiver outside the opened files. The probe says unregistration does not cancel an imperative call. Declarative removal and definition change do cancel synchronously (C2, C3). That is source-only.

## 6. Lane text this trace bears on

- SKILL.md:1957 and corpus/knowledge/webmcp-invocation-round-17.md:74 say "only cancelInvocation gave Canceled" and "unregistration does not cancel". Both hold for the lane's observed runs. The pinned source has three site-side kToolCancelled producers (C2 to C4; C2 also covers form removal) and one agent-side declarative producer (C1). None of C1 to C4 is observed. Read as a statement about the source, the lane line is incomplete. Recommended: an append-only erratum scoping both lines to observed imperative cases and naming C1 to C4 as source-only. Historical bytes stay untouched.
- SKILL.md:2053 anchors the submit-time error to "S078 html_form_element.cc:729-751". The producing call is at 756-758, and the text assembly is 729-754. Recommended: an append-only anchor note.
- S078 (round-19 rows) and S096 (round-20 rows) pin the same bytes (decoded 8c8d6796...). Recommended: the scribe records the identity.
- webmcp_handler.cc and local_frame_mojo_handler.cc need their own SOURCES.md rows before any corpus note cites them (QUALITY criterion 12). Section 1 holds the hash inputs.

## 7. Unobserved or unresolved (not exercised)

- Runtime for C1 to C4, I2 to I4, and the cross-origin browser Error (D4). Suggested falsifier probes: a declarative form with toolautosubmit absent plus cancelInvocation; `form.reset()` during a call; removing the form node during a call; `respondWith(Promise.reject())`; a non-serializable respondWith value; preventDefault with no respondWith; a cross-origin agent navigation.
- The cleanup receiver for imperative pending calls (model_context.cc:597-603) is not opened.
- Generated protocol serialization of a null-string errorText (observed as ""). The generated web_mcp.h and .cc files are not in the lane.
- The probe glue (`probe::WebMCPToolFailed` to `InspectorWebMCPAgent::WebMCPToolFailed`) is not opened. The call-site signatures match (model_context.cc:521-522, 736-737, 869 against inspector:220-224), which is a signature match only.
- The `ExecuteScriptTool` caller, which is the agent surface, is not opened. [INFERENCE] it is the agent-facing path.
- `inspector_web_mcp_agent.h` (`GetFrontend`, instrumenting registration) is not opened.
- Ordering (D6) and frontend-drop behaviour are unmeasured.

## 8. Installs and updates

None. Used curl, base64, sha256sum, wc, grep (counts only), and git ls-files (read-only).

## 9. For the main agent after integration

- Re-fetch the seven URLs in section 1 by tag and compare decoded sha256. This seat fetched each once and did not re-run any comparison.
- Re-check the receipt rows in section 5b.
- No selftest or gate was run by this seat; none was assigned.
