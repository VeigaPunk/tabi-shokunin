# SemanticLC10: LC10 predicate and effect check (round 20, source-only)

Author-side finding, not external closure. Source-only, Chromium 154.0.8037.97. No runtime, capability, or domain-coverage claim. No tests, builds, or edits were run, and no tools were installed or updated.

## Bottom line (per-field verdicts below; nothing is rolled up)

- The LC10 span, status code, fixed text, quote, and callsite order are ENTAILED.
- The outcome wording "CallDoneCallback runs" is REWRITE: the call is certain, but the done callback runs only if `done_callback_` is non-null, and the row does not condition on that.
- Knowledge checklist item 6 ("with the rejection message") is NOT-ENTAILED as worded: the error text is a fixed literal, and the rejection value never enters the tool error.
- The condition states the reaction-time running gate but omits the submit-time gate and the binding preconditions, and it cites no anchor for the rejection binding.
- Re-entrancy during `ReportException` and invocation identity are UNRESOLVED and out of scope.

## Pins and what was opened

- Retained body `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Identical to `git show 4ae99816b8994fdedc159156d8d9d242dd5c4782:corpus/evidence/round-20/sources/html_form_element.cc` (same sha256), to `decisions.json` `source.sha256`, and to the decoded upstream `html_form_element.cc?format=TEXT` at tag 154.0.8037.97. Checkpoint 4ae99816 is "round-20: distill source-scoped WebMCP lifecycle decisions".
- Upstream files opened read-only at the same tag, not retained or pinned; digests observed: `core/html/forms/html_form_element.h` 68d7712b6d8fc0637e3fc434d666624e3c955d51e7448b0039bec080a43adec6; `bindings/core/v8/v8_script_runner.cc` 280d02bc1cb806170c2637c8bcbac800c10fbe6480a07c4ef0f8a498fcf15e0b; `bindings/core/v8/v8_initializer.cc` 8a2ee363d5cd1772a35655b9c781c8bb11cec291ea942eacea6344a88a8d16d4; `core/execution_context/execution_context.cc` fcfa595c77fadaf5be191a7152e8ea7e7cb34eb6a55dba9a411c9093d5c7fe11.
- Subjects: `decisions.json` lines 83-90 (LC10); knowledge note line 38 (row), line 63 (checklist item 6), lines 70-82 (History); `SKILL.md` line 2226 (row) and lines 2212-2213 (counter scope).

## Retained-source facts used (same bytes as S096)

- 294-297: `CHECK(tool); if (!tool->CurrentlyRunning()) { return; }`. This is the reaction-time guard and runs before any `resolved` branch.
- 298 `if (resolved) {`. 320 `} else {`. 322-323 `V8ScriptRunner::ReportException(script_state->GetIsolate(), value.V8Value());`. 324-326 `tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise was rejected")));`. 327 `}`. No `CurrentlyRunning()` read occurs in 296-324.
- 263-266: `if (done_callback_.is_null()) { return; }` then `std::move(done_callback_).Run(result);`. 267-274: `is_currently_running_ = false`, clears `active_submit_button_` and `invocation_id_`, then PseudoStateChanged.
- 720: `executing_tool = active_webmcp_tool_;`. 722 and 788: `CurrentlyRunning()` gates. 775-776: `should_submit` from `DispatchEvent`. 790: `if (auto promise = submit_event->TakeRespondWithPromise())`. 794: `CHECK(!should_submit);`.
- 798-806: `std::move(*promise).Then(BindOnce(&HTMLFormElement::HandleWebMcpToolResponse, WrapPersistent(this), WrapPersistent(executing_tool.Get()), /*resolved=*/true), BindOnce(..., /*resolved=*/false));`. The rejection arm is the `resolved=false` binding at 803-806.
- 795-796 comment says "the active_webmcp_tool_'s callback", but the bound pointer is the captured `executing_tool` (801, 805).
- Within the retained file: `ReportException` has exactly one call site (322). `HandleWebMcpToolResponse` is bound only at 799 and 803. `ExecuteTool` appears only as its definition (174-210), which has no running-state check at entry. Its callers are outside this file.
- Upstream, not retained: the header defines `bool CurrentlyRunning() const { return is_currently_running_; }` inline, with `done_callback_` typed `base::OnceCallback<void(McpToolCallbackResult)>`. `V8ScriptRunner::ReportException` does `CHECK(!exception.IsEmpty())`, builds a `v8::Message`, and calls `V8Initializer::MessageHandlerInMainThread`. That handler returns early with no entered context or an invalid ScriptState. For error-level messages (level of an exception-created message: [INFERENCE] error), it builds an `ErrorEvent` carrying the value and calls `ExecutionContext::DispatchErrorEvent`. `DispatchErrorEventInternal` sanitizes when the message is not shared-cross-origin, then calls `target->DispatchEvent(*error_event)` synchronously. `ExceptionThrown` is called when dispatch returns false (not default-prevented, or no target). The `ExceptionThrown` body was not opened.

## Per-field verdicts

| # | Field | Claim | Verdict | Reason |
|---|---|---|---|---|
| 1 | span and quote | 320-327; "respondWith promise was rejected" | ENTAILED | 320 is `} else {`, 327 closes it. Literal at 326, 4 words, inside span. |
| 2 | condition, reaction-time running | "still CurrentlyRunning" | ENTAILED, entry only | Guard at 295-297. `CurrentlyRunning()` is `is_currently_running_`. Not re-checked at 324 (see U1). |
| 3 | condition, rejection arm | "respondWith promise rejects" | ENTAILED; anchor incomplete (REWRITE) | `resolved=false` is bound to the rejection callback at 803-806. Cited span 320-327 does not show that binding. |
| 4 | condition, submit-time preconditions | not stated | REWRITE (add) | 788: tool must be CurrentlyRunning after dispatch. 790: a promise must be taken. 794: `CHECK(!should_submit)`. The row states none of these. |
| 5 | outcome, ReportException | "reported through V8ScriptRunner::ReportException" | ENTAILED | 322-323 is the only call site in the retained file. Upstream effect is error-event dispatch (see facts). "console" is not claimed and should stay out (U4). |
| 6 | outcome, ordering | "then CallDoneCallback" | ENTAILED | Straight-line 322 to 324, no early exit. |
| 7 | outcome, "CallDoneCallback runs" | stored done callback runs | REWRITE | The call is ENTAILED (324). The done callback runs only if `done_callback_` is non-null (263-265). The row does not condition on this. |
| 8 | outcome, error kind | kToolInvocationFailed | ENTAILED | 325. |
| 9 | outcome, error text | "the text respondWith promise was rejected" | ENTAILED | 326 is a fixed literal. |
| 10 | outcome, reason in error | implied by checklist item 6 ("with the rejection message") | NOT-ENTAILED as worded | 324-326 never read `value`. The reason reaches only `ReportException`. |
| 11 | null guard | row silent on `done_callback_` | REWRITE (add) | 263-265 is the only guard at the callsite. |
| 12 | entry predicate vs callsite | outcome implies tool state holds at 324 | UNRESOLVED, out of scope | Synchronous error-event dispatch sits between 322 and 324. Whether any listener can change tool state is not verified. |
| 13 | tool identity | "the tool" | REWRITE (wording) | Bound pointer is the captured `executing_tool` (720; 801, 805), not `active_webmcp_tool_`. The 795-796 comment says otherwise. |
| 14 | invocation identity | CurrentlyRunning as proof of this invocation | UNRESOLVED, out of scope | Per-tool boolean. Binding at 799-806 carries no invocation id. `ExecuteTool` has no entry running check; callers not in excerpt. |
| 15 | sample: non-running tool | rejection after the tool stopped | ENTAILED (boundary) | Guard at 295-297 returns before 322, so `ReportException` is not reached on that path. LC08 covers it. |
| 16 | sample: rejection value | any value | ENTAILED | `value` is not inspected in 320-326. Every rejection yields the same tool error. |
| 17 | `CHECK(!should_submit)` | invariant at 794 | UNRESOLVED, not claimed | Reachability not established. Out of scope. |
| 18 | History: "no new runtime witness ... LC10" | knowledge note line 82 | ENTAILED | r17 declarative fixture (`invoke-declarative.html:44`) and every r19 validation fixture covered by grep use `respondWith(Promise.resolve(...))`. No declarative `Promise.reject` in those trees or the probes. |
| 19 | prior observations not erased | r17/r19 | ENTAILED: nothing erased; History omits them | See prior-observation section. Optional append (F5). |
| 20 | r19 "reported separately to the console" | `SrcScriptToolError.md:45` (round-19 note) | UNRESOLVED | Console destination depends on `ExceptionThrown`, not opened. |
| 21 | rendering identity | decisions.json = SKILL row = knowledge row | ENTAILED | Condition, outcome, and anchor strings compared: decisions.json 85-86, SKILL.md 2226, knowledge note 38. |

## Findings by severity

- F1 (medium), REWRITE. Outcome overstates completion (fields 7, 11, 12). The row must condition on `done_callback_` (263-266) and say that no `CurrentlyRunning` re-check occurs between 295 and 324.
- F2 (medium), NOT-ENTAILED. Knowledge checklist item 6 (knowledge note line 63) says "kToolInvocationFailed with the rejection message". The source delivers a fixed literal. The reason goes only to `ReportException`.
- F3 (low to medium), REWRITE. Condition omits the submit-time gate (788), the taken promise (790), and `CHECK(!should_submit)` (794). The running gate (295-297) and the binding (803-806) sit outside the declared span. Keep span 320-327, which the counter owns, and cite the other ranges inside the condition text.
- F4 (low), REWRITE. Name the captured `executing_tool` (720; 801, 805). Do not inherit the 795-796 comment's `active_webmcp_tool_`.
- F5 (low), optional append. The knowledge History omits the r17 imperative-rejection observation and the r17 static-string observation. Both remain valid as their own evidence. Append a clarifying bullet; do not edit existing bytes.
- F6 (info). UNRESOLVED leads U1-U3 below are recorded, not verified.
- F7 (info). The "console" claim is unverified (U4). Keep it out of LC10.

## Proposed text (for main to apply; nothing edited)

decisions.json LC10, lines 85-86. startLine, endLine, and quote are unchanged.

condition: "The captured executing tool is CurrentlyRunning after submit dispatch (S096:788), a respondWith promise was taken (S096:790), and that promise rejects while the tool is still CurrentlyRunning at HandleWebMcpToolResponse entry (S096:295-297); the rejection callback is bound with resolved=false (S096:803-806)."

outcome: "The rejection value is passed to V8ScriptRunner::ReportException (S096:322-323) and is not placed in the tool error. Then CallDoneCallback is called with kToolInvocationFailed and the fixed text respondWith promise was rejected (S096:324-326); the stored done callback runs only if done_callback_ is non-null (S096:263-266, LC07). No CurrentlyRunning re-check occurs between S096:295 and S096:324."

Knowledge note line 63 (checklist item 6):
"6. **Rejected respondWith promise** (LC10): kToolInvocationFailed with the fixed text `respondWith promise was rejected`; the rejection value is not in the tool error (it goes to V8ScriptRunner::ReportException)."

Knowledge note line 38 and SKILL.md line 2226: render the same condition and outcome strings above, keep anchor `S096:320-327`, and keep the cells free of pipes.

Optional knowledge History append (new bullet after line 82; append only):
"- **LC10 prior observations (not LC10 witnesses).** Round-17 `invoke-imperative-rejects` is the imperative path: `Error`, no `output`, empty `errorText` (`webmcp-invocation-round-17.md:51-52`; `.ufo/waves/round-17/w1/RevPlanC2.md:20`). `.ufo/waves/round-17/w1/RevBinaryInvoke.md:73` records `respondWith promise was rejected` as a static binary string with the dispatch path unobserved (`:67`). No round-17 or round-19 fixture exercises a declarative `respondWith(Promise.reject(...))`."

Cross-row note: the wording "CallDoneCallback runs with" also appears in LC06, LC11, and LC12 (knowledge note lines 35, 39, 40; SKILL.md 2222, 2227, 2228). The same guard applies there. Not adjudicated here.

## Prior-observation check (r17/r19; not erased by source-only framing)

- r17 `invoke-imperative-rejects` is imperative: `Error`, no output, empty `errorText` (`corpus/knowledge/webmcp-invocation-round-17.md:51-52`; `.ufo/waves/round-17/w1/RevPlanC2.md:20`). Not LC10's path.
- r17 `.ufo/waves/round-17/probes/invoke-errorpaths.mjs:90` rejects an imperative `execute`. Not LC10's path.
- r17 declarative probe (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:35-43, 71-80`) covers the resolved path, LC11 (preventDefault without respondWith), and navigation. It has no declarative rejection case.
- r17 `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html:44` uses `respondWith(Promise.resolve(...))`.
- r17 `.ufo/waves/round-17/w1/RevBinaryInvoke.md:67, 73`: the literal is a static binary string; dispatch path unobserved.
- r19 validation fixtures covered by grep all use `respondWith(Promise.resolve(...))`. The `Promise.reject` hits in round-18/19 harnesses are internal abort helpers (`scripts/webmcp-invoke-round18.mjs`, `scripts/webmcp-invoke-round19.mjs`, `scripts/webmcp-validation-round19.mjs`).
- r19 source notes (`.ufo/waves/round-19/w1/SrcHtmlFormTool.md:22, 26, 45`) agree with the callsite. Their console wording is UNRESOLVED here (U4).
- `SrcScriptToolError.md:5` (r19) gives `errorText = error.message` for a different error code. For LC10 that CDP mapping is [INFERENCE] and must not be added without a receipt.

Conclusion: no r17/r19 observation is erased. No LC10 runtime witness exists in r17 or r19. The LC10 row makes no runtime claim.

## Unresolved leads (out of scope; not verified; no reproduction)

- U1, re-entrancy during `ReportException`. Synchronous error-event dispatch sits between 322 and 324 (upstream). Whether a listener run there can change tool running or done-callback state is not verified. At 324 the only guard is the null check at 263-265. The proposed outcome text avoids claiming state at 324.
- U2, invocation identity. `CurrentlyRunning()` is per tool. The bind carries no invocation id (799-806). `ExecuteTool` (174-210) has no entry check, and its callers are outside this file. Whether a settlement from an earlier invocation can meet a later running one is unverified.
- U3, `CHECK(!should_submit)` at 794. Invariant only; reachability not established.
- U4, console destination. Requires opening `ExceptionThrown`. Not done.

## Verification gaps and residual risk

- Not run: the counter `.ufo/waves/round-20/measure-c1.mjs`, selftests, and tests. The counter checks mechanical validity only (SKILL.md 2212-2213).
- Not opened: `ExceptionThrown` body; `ScriptPromise::Then` callback signature (`script_promise.h`); `SubmitEvent::TakeRespondWithPromise`; the ModelContext caller of `ExecuteTool` (non-null callback assumption behind the LC07 guard reading).
- Residual risk: the row maps nothing to CDP wire fields. Keep it that way; no errorText or exception mapping is established for LC10.
- Wave-internal drafts surfaced by grep were not cited as evidence. Every claim above traces to the retained bytes, the upstream reads listed, or the round-17/19 files named.

## Tooling

No installs or updates. Read-only commands only: `curl`, `base64 -d`, `sha256sum`, and `git show`, `git rev-parse`, `git log -1` on the checkpoint. The only file written is this report.
