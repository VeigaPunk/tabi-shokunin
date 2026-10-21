# SourceLC08: late response ignored when tool no longer running

Seat: TabiR20.SourceLC08 · Round 20 · w1 · source-only (no runtime; nothing executed; no builds or tests)
Source: `corpus/evidence/round-20/sources/html_form_element.cc:290-298`, Chromium 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, per SOURCES.md S096).

## Provenance

- Copy sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` equals the decoded r19 retained body `corpus/evidence/round-19/sources/html_form_element.cc.gz` (sha256sum and zcat). Line numbers are the tag's.
- Read-only fetches at the same tag (Gitiles `?format=TEXT`, base64-decoded in memory, nothing written): `third_party/blink/renderer/core/html/forms/html_form_element.h` (cited `h:N`); `third_party/blink/renderer/core/script_tools/model_context.cc` and `model_context.h`; `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc`.

## Exact condition

1. `HandleWebMcpToolResponse` runs as a `.Then` reaction on a `respondWith()` promise bound at 798-806: `resolved=true` (802) for fulfilment, `resolved=false` (806) for rejection. Both take the same guard.
2. The promise is bound only if `executing_tool->CurrentlyRunning()` holds at 787-789. The guard can therefore see "not running" only if the invocation was cleared after binding.
3. Guard, 295-297: `if (!tool->CurrentlyRunning()) { return; }`. `CurrentlyRunning()` is `return is_currently_running_;` (h:319; initialised false, h:334). The flag is set true only at 204 (ExecuteTool) and cleared only at 267 (CallDoneCallback). CallDoneCallback returns early when `done_callback_` is null (263-265), so "not running" also means no callback is held.

## Exact outcome

- Returns at 296. Nothing else runs: no `JSON::Stringify` (303-306), no `CallDoneCallback` (319, 324-326), no `V8ScriptRunner::ReportException` (322), no `PseudoStateChanged`, no probe, log or UseCounter. `resolved` and `value` are dropped.
- The invocation's result is whatever the earlier completion delivered. Clearing paths in this file:
  - `CancelTool` 224-229: kToolCancelled. Reached from `ModelContext::CancelTool` (model_context.cc:618) and CDP `cancelInvocation` (inspector_web_mcp_agent.cc:152).
  - Form reset 1101-1105: kToolCancelled, "by a form reset".
  - Definition change 390-396 (unregister) and 447-455 (replace; new object at 457): kToolCancelled, unless `IsHandlingSubmit()`, which is false once the dispatch scope closes (817).
  - Navigation 825-829 (second submit) and `submitFromJavaScript` 839-841: `ok(String())`, the null-String sentinel.

## Quote (≤25 words)

- L295-296: `if (!tool->CurrentlyRunning()) {` / `return;` (guard; primary).
- L782-784 (caller intent, 23 words): "If `active_webmcp_tool_` is non-null here, but the form gets unregistered as a tool asynchronously before `promise` fulfills, then `HandleWebMcpToolResponse()` will handle this appropriately."

## Caveats

1. **Identity (material).** The guard tests the object, not the invocation. The bind captures only `tool` (801, 805). `ExecuteTool` has no running check on entry and overwrites `invocation_id_` (178) and `done_callback_` (210). ModelContext calls `ExecuteTool` on the same registered object: it finds the tool by name (model_context.cc:548-566), calls `tool->ExecuteTool` with no pending-state check (695-720), and `RegisterDeclarativeTool` returns early for an existing name (828-830).
   - Sequence, no overlap needed: invocation A is bound → A cleared by cancel, reset or navigation → agent invokes the same tool again (B) → A's promise settles while B is running → guard passes → 263-267 runs B's callback with A's value.
   - Source-level only. Whether the browser-side invoker allows re-invocation is not in the corpus → UNVERIFIED.
   - "Ignored" therefore holds only while the tool object is idle. The LC08 wording (`ScribeChecklist.md:11`, design topic at `design.json:83`) should be qualified accordingly.
2. **Overlap variant (adjacent; same root cause; outside LC08 span).** If B starts while A still runs, line 210 destroys A's callback unrun, orphaning A's ModelContext pending entry. A later `ModelContext::CancelTool(idA)` calls the id-less `tool->CancelTool()` (model_context.cc:618), which cancels B. The CHECK at model_context.cc:619 (`!pending_executions_.Contains(invocation_id)`) then fails for idA. Reachability requires the browser to permit two concurrent invocations of one tool; not in corpus → UNVERIFIED. Lead for AttackLC08.
3. **Silent drop.** A late rejection never reaches `ReportException` (322), and the branch emits nothing. The r19 dossier `w1/SrcHtmlFormTool.md:22` describes rejection reporting without this exception.
4. Scope: header, ModelContext and inspector sources were read at the tag. Other translation units and the browser-side invoker were not reviewed. Nothing executed.

## Round-19 coverage

- **Promoted note: not held.** `corpus/knowledge/webmcp-declarative-validation-round-19.md:129-131` (S096) cites only the navigation null-String sentinel. `corpus/lessons/round-19.md:131` cites "comment at 827". `corpus/evidence/round-19/validation/decisions.json` cites S096 only at 729-758 (five entries). No mention of `HandleWebMcpToolResponse`, `CurrentlyRunning`, or settlement after cancel.
- **r19 scout dossiers: base behaviour held.** `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:22` ("ignores settlement if the tool is no longer running (294-297)"); `:28` (cancel or reset before a pending promise settles drops it, 294-297); `.ufo/waves/round-19/w2/SourceS078.md:70` ("Settlement is ignored when the tool is no longer running").
- **Not held anywhere in r19:** the identity hazard (caveats 1-2) and the silent late rejection (caveat 3).

## Verdict

- Narrow claim, confirmed from source: with the tool idle at settlement, the response is discarded with no result and no report (295-297).
- Qualifier required: a re-armed tool object lets a stale settlement complete the new invocation (caveat 1; caller gate UNVERIFIED).

## Tooling

- No installs or updates.

Report: .ufo/waves/round-20/w1/SourceLC08.md
