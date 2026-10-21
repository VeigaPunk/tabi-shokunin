# SemanticLC02: LC02 predicate and effect check (round 20, wave 2)

Author-side finding; not external closure. Source-only (Chromium 154.0.8037.97); no runtime claim. Read-only: no tests, no counter run, no builds, no installs, no production edits, no subagents.

## Pins and inputs

- Revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
- `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796…6916`. Equals the checkpoint blob and the primary fetch of the tag-154.0.8037.97 URL (base64-decoded).
- Working copy equals checkpoint blob for `corpus/evidence/round-20/lifecycle/decisions.json` (`da42e495…`), `SKILL.md` (`a2653f45…`), `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (`3ac83d0a…`), and `.ufo/waves/round-20/measure-c1.mjs` (`fab3bde4…`).
- Primary sources opened at tag 154.0.8037.97 (read-only, not retained in corpus): `html_form_element.h` (`68d7712b…`), `core/html/custom/ce_reactions_scope.h` (`0c46d231…`) and `.cc` (`7ad1c350…`), `core/script_tools/model_context.cc` (`474083d6…`, equals the S042 decoded pin), `core/html/forms/html_form_mcp_tool_test.cc` (`944ee9e4…`).
- Scratch copies were written to `/tmp/tabi-r20-lc02/` (outside the lane) and removed after this report.

## LC02 as written

- Condition: `FillFormControls returns a ScriptToolError.`
- Outcome: `done_callback is run with the error immediately; the running state (is_currently_running_, active submit button, done_callback_) is not set by that call. invocation_id_ is written earlier, at line 178, outside this span.`
- Span 189-210. Quote: `return std::move(done_callback).Run(base::unexpected(error.value()));` (line 197).
- Identical text in `decisions.json:21-25`, `SKILL.md:2218`, and the note at line 30.

## 1. Verdicts by semantic field

Line numbers `cc:` are `html_form_element.cc`, `h:` is `html_form_element.h`, `mc:` is `model_context.cc`.

| # | Field | Verdict | Reason and evidence |
|---|---|---|---|
| F1 | Condition: FillFormControls returns a ScriptToolError | ENTAILED | cc:192-193 assigns the `std::optional<ScriptToolError>` return. The branch is `error.has_value()` at cc:196. Declared at h:307-310. |
| F2 | done_callback is run with the error | ENTAILED | cc:197 runs the by-value parameter (cc:177) with `base::unexpected(error.value())`. |
| F3 | "immediately" | REWRITE | Before the branch at cc:196, the CEReactionsScope (cc:190-194) is destroyed. Its destructor calls `PopInvokingReactions()` when any reaction was enqueued (ce_reactions_scope.cc:33-35; the implementation is not opened), then rethrows a caught exception (ce_reactions_scope.cc:36-38). "Immediately" hides both steps. |
| F4 | is_currently_running_ is not set on this path | ENTAILED | The only set is cc:204, skipped by the return at cc:197. The other write is cc:267 in CallDoneCallback, not reached. Default false at h:334. |
| F5 | active submit button is not set | ENTAILED | Member `active_submit_button_` is written only at cc:205 (skipped) and cc:269 (reset). Naming nit: the local `submit_button` is written through the out-parameter at cc:236 and cc:250 on this path. Name the member `active_submit_button_` in the text. |
| F6 | done_callback_ is not set | ENTAILED | Set only at cc:210 (skipped). The Run at cc:266 sits in CallDoneCallback, not reached. |
| F7 | "by that call" | REWRITE (wording) | No clear antecedent after "done_callback is run". Every reading is true, but the intended scope is this error path (cc:196-198). |
| F8 | invocation_id_ written at line 178, outside span | ENTAILED | cc:178 `invocation_id_ = invocation_id;`. Span is 189-210. |
| F9 | (unstated) invocation_id_ is not reset on this path | ENTAILED, unstated: REWRITE (add) | Writes are only cc:178 and cc:270 (CallDoneCallback reset, not reached). `GetActiveWebMCPToolInvocationId` guards with CurrentlyRunning (cc:168-171). The public `InvocationId()` (h:316-317) is unguarded; its external callers were not opened. |
| F10 | Quote is a literal inside the span, at most 25 words | ENTAILED | cc:197 matches verbatim. Two words. Inside 189-210. |
| F11 | Span 189-210 | ENTAILED | Contains the quote and the skipped writes at cc:204-210. No overlap with LC04 (212-218). Wider than the branch, which is a counter-span choice, not an error. |
| F12 | (unstated) Outcome is independent of entry flags | ENTAILED | cc:196-198 do not read `require_submit_button` (cc:181-182) or the toolautosubmit attribute. LC03 is one error source, gated at cc:251. |
| F13 | (unstated) Tool not already running at entry | UNRESOLVED | ExecuteTool has no is_currently_running_ check before cc:196 (cc:174-198). Opened callers do not check either: `ModelContext::ExecuteTool` checks only `tool_map_` (mc:548-566), and `ExecuteDeclarativeTool` inserts the pending entry (mc:712-717) and calls `tool->ExecuteTool` (mc:719). If entered while running, cc:178 would overwrite `invocation_id_`, and the success path (cc:210) would replace `done_callback_`. Reachability depends on browser-side gating, which was not opened. Out-of-scope race lead; not reproduced. |
| F14 | Checklist (note:58): "the running state is not set" | REWRITE | As a write-absence on this path: ENTAILED. As an unconditional post-state ("not running afterwards"): NOT-ENTAILED, because it depends on F13. |
| F15 | Checklist (note:58): "the call returns an error at once" | REWRITE | `HTMLFormMcpTool::ExecuteTool` returns void (h:297-300). The error is delivered synchronously through done_callback. The enclosing `ModelContext::ExecuteTool` returns `success`, which stays true on the declarative branch (mc:556, 562-566, 579). |
| F16 | (presupposed) done_callback is non-null | ENTAILED at the opened callsite | mc:719-745 passes a BindOnce lambda, always non-null. cc:196-197 has no null guard. LC02 does not call CallDoneCallback, so LC07's null guard (cc:263-265) does not apply, and the note does not conflate them. Other callers of the virtual ExecuteTool were not exhaustively searched. |
| F17 | (unstated) Actual effect of the Run | ENTAILED, unstated (optional add) | The lambda (mc:721-745) runs `probe::WebMCPToolFailed` (mc:736-737), then runs the ModelContext-level callback and erases the pending entry synchronously (mc:739-742). `ModelContext::ExecuteTool` then dispatches `toolactivated` unconditionally for the declarative branch (mc:568-577) and returns true (mc:579). |
| F18 | Manifest scope "source-only ...; not runtime-observed" applied to LC02 | NOT-ENTAILED as a blanket statement: REWRITE (narrow) | The branch outcome has prior r19 runtime receipts (F19). The scope string is pinned at measure-c1.mjs:76 and checked at :298. Changing it needs a coordinated counter edit, which was not made here. |
| F19 | (history) Prior observations of this branch | REWRITE (add history) | The note has no LC02 history and omits LC02 from the "no new runtime witness" list (note:82). r19 `validation/receipt.json:4641-4678` (case `decl-unknown-param-01`): CDP `Error`, errorText "Input contains a parameter \"unknown\" but there is no such parameter for the tool", `submitCount` 0, fields `query` still `initial-query` (line 4652). Also `receipt.json:2524-2548`: `Invalid value "not-a-number" for parameter n`, `Error`, `submitCount` 0. These observe the outcome only, not the internal state fields. The h:302-306 contract says controls are left unchanged on error; that is not part of the S096 span. |
| F20 | (history, adjacent LC03) note:81 | REWRITE (cite probe) | The note cites only the probe comment ("expects the LC03 message"). The probe note `.ufo/waves/round-17/w1/C2ProbeFrames.md:70-72` records `toolResponded {"status":"Error","errorText":"No submit button was found ..."}` for a plain form. That is the LC03 instance of this branch, recorded as a probe, not a receipt. Route to the LC03 row owner. |
| F21 | Sample limits: are the callback and state effects test-pinned? | ENTAILED (no test support) | html_form_mcp_tool_test.cc:382-417 exercises FillFormControls error returns only. The file has zero references to ExecuteTool, CurrentlyRunning, done_callback, or CancelTool. The callback and state effects rest on source reading alone. |
| F22 | Revision pins (retained body, decisions, SKILL, note) | ENTAILED | See Pins. |
| F23 | Text parity: manifest, SKILL row, note row | ENTAILED | Strings are identical. measure-c1.mjs:276 renders rows from the manifest, so any outcome change must land byte-identically in all three. |
| F24 | SKILL.md:2231 "separate fill-time refusal from running-state entry (LC02-03)" | ENTAILED | LC02 writes no running state (F4, F6). LC03 is an LC02-branch error. Neither reaches cc:204. |

## 2. Callsite versus actual effect (LC02, source-level)

1. cc:189-194: FillFormControls runs inside the CEReactionsScope and returns an error.
2. cc:196-197: `Run` on done_callback. The done_callback is the ModelContext lambda (mc:721-745), not the ModelContext-level callback.
3. Lambda: `probe::WebMCPToolFailed` (mc:736-737); look up the pending entry (mc:739); run the ModelContext-level callback (mc:741); erase the entry (mc:742). The entry is always found on this synchronous path, because mc:712-717 inserts it before the call.
4. Return to `ModelContext::ExecuteTool`: dispatch `toolactivated` (mc:575-576); return true (mc:579).
5. Not opened: callers that consume that bool or the `toolactivated` event.

## 3. Entry-time predicates

- Entry reads are `invocation_id` (cc:178) and `require_submit_button` (cc:181-182). Neither gates the LC02 branch (F12).
- Pre-entry `is_currently_running_` is not read and is not excluded by the opened callers (F13, UNRESOLVED).

## 4. Callback and null guard

- ExecuteTool has no null check. The precondition is met at the opened callsite (F16).
- LC07's null guard does not apply to LC02.
- A pending rethrow could exist at cc:197 if the CE scope caught an exception (ce_reactions_scope.cc:36-38). Reachability is not established (U-b).

## 5. Rewrite proposals (for planner; not applied)

Apply each replacement byte-identically to `decisions.json` LC02 outcome, `SKILL.md:2218`, and note line 30. The counter renders the table from the manifest (measure-c1.mjs:276). The text below contains no pipe characters.

Proposed LC02 outcome:

> done_callback runs with the error synchronously at line 197, after the CEReactionsScope at lines 190-194 closes. This path skips lines 204-210, so it writes none of is_currently_running_, active_submit_button_ or done_callback_. invocation_id_, written at line 178 outside this span, is not reset on this path.

Proposed checklist item 1 (note line 58):

> 1. **Fill error** (LC02): the error is delivered through done_callback synchronously at line 197. This path writes no running state, so a tool that was not already running is not running afterwards.

Proposed LC02 history bullet (note, after line 81):

> - **LC02 (fill error).** Round-19 validation receipts record CDP `Error` with the fill-time errorText and `submitCount` 0 for declarative fill errors (`corpus/evidence/round-19/validation/receipt.json:4641-4678`, case `decl-unknown-param-01`; also `:2524-2548`). They observe the error outcome only, not is_currently_running_, invocation_id_ or done_callback_. The round-17 probe note `.ufo/waves/round-17/w1/C2ProbeFrames.md:70-72` records a plain-form fill error (the LC03 message) as a probe, not a receipt.

Proposed scope narrowing (SKILL.md line 2209 and note line 9): row claims about internal state are source-only; branch outcomes have prior runtime receipts cited as history. Change the manifest scope string only together with a measure-c1.mjs update.

## 6. Unresolved and out of scope (not verified, not reproduced)

- U-a (F13): re-entry into HTMLFormMcpTool::ExecuteTool while running. Reachability not established. Browser-side gating (`content/browser/devtools/protocol/webmcp_handler.cc:58-116`, `local_frame_mojo_handler.cc:987-1000`, as cited in the r18/r19 notes) was not opened.
- U-b: CEReactionsScope pending rethrow at cc:197. Reachability not established. The `PopInvokingReactions` body was not opened.
- U-c: external consumers of the unguarded `InvocationId()` (h:316-317) and of the bool returned by `ModelContext::ExecuteTool` (mc:579).
- U-d: callers of `HTMLFormMcpTool::ExecuteTool` beyond mc:719. Only that callsite was opened.
- U-e: a web search surfaced Chromium issue pages (issues.chromium.org/issues/493298112 and /483853103). Not opened, not verified, out of scope.
- Not exercised: any runtime behavior, `FillData` internals, the browser side, and reaction bodies.

## 7. Tooling

No tools were installed or updated. Read-only primary fetches and pin checks used curl, base64, and sha256sum, which were already present. Scratch copies in `/tmp/tabi-r20-lc02/` were removed.

## 8. For main

- Run `measure-c1.mjs` and the gate once after integration if any row text changes. Not run here.
- F18 needs a coordinated counter change if the scope string moves.
- F20 belongs to the LC03 row owner.
- This report is uncommitted; main integrates it.

Report: .ufo/waves/round-20/w2/SemanticLC02.md
