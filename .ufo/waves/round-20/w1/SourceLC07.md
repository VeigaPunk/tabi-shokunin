# SourceLC07 — CallDoneCallback clears state only through a held callback

- Seat: TabiR20.SourceLC07 (leaf scout; no subagents).
- Scope: source-only, Chromium 154.0.8037.97, S096. Not runtime-observed. Untested.
- Pinned file: `corpus/evidence/round-20/sources/html_form_element.cc`, 1740 lines, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, matching `design.json` `source.sha256`.
- Tools installed or updated: none.

## Verdict

LC07 holds for the pinned source. Every in-file clear of running, active submit button, invocation id, and the two tool pseudo-states sits after the null gate at 263-265. With no callback held, the function returns before touching any of them. Qualifications are in caveats 1, 3, and 5.

## Declared heading row

### Declarative WebMCP completion lifecycle — source-scoped (round 20)

| ID | condition | outcome | S096:START-END |
| LC07 | CallDoneCallback runs with done_callback_ null or held | Null: returns at 264, touching nothing. Held: runs the stored callback (266), then clears running (267), active submit button (268-269), invocation id (270), and updates form and old-submit-button pseudo-states (271-273). | S096:261-275 |

Manifest object (quote is whitespace-collapsed from lines 263-265):

```json
{"id":"LC07","condition":"CallDoneCallback runs with done_callback_ null or held","outcome":"Null: returns at 264, touching nothing. Held: runs the stored callback (266), then clears running (267), active submit button (268-269), invocation id (270), and updates form and old-submit-button pseudo-states (271-273).","startLine":261,"endLine":275,"quote":"if (done_callback_.is_null()) { return; }"}
```

## Gate and outcomes (verified)

- Gate: `if (done_callback_.is_null())` at 263. Null leads to `return` at 264.
- Held: `std::move(done_callback_).Run(result);` at 266. Then `is_currently_running_ = false;` (267), `old_submit_button = active_submit_button_; active_submit_button_ = nullptr;` (268-269), `invocation_id_ = std::nullopt;` (270), `PseudoStateChanged(kPseudoToolFormActive)` on the form (271), and `PseudoStateChanged(kPseudoToolSubmitActive)` on the old button if non-null (272-274).

## Write-site inventory (in-file, grep-verified)

| Field | Set | Clear | Clear path |
|---|---|---|---|
| `is_currently_running_` | 204 (`= true`) | 267 | gate 263-265 only |
| `active_submit_button_` | 205 | 269 | gate only |
| `invocation_id_` | 178 (ExecuteTool entry) | 270 | gate only |
| form `kPseudoToolFormActive` | 206 | 271 | gate only |
| button `kPseudoToolSubmitActive` | 208 | 273 | gate only |
| `done_callback_` | 210 | 266 (moved into Run) | is the gate |

No other write, clear, or pseudo-state change to these fields exists in the pinned file. `CallDoneCallback` has 11 in-file call sites:
- 226: CancelTool, guarded by CHECK at 225.
- 308, 319, 324: HandleWebMcpToolResponse, gated at 295.
- 391 and 449: registration, gated by `!IsHandlingSubmit()` at 390 and 448.
- 756, 808, 829: submit flow.
- 841: submitFromJavaScript, gated at 839.
- 1102: form-reset path, gated at 1101.

## Caveats

1. **Asymmetric invocation write.** `invocation_id_` is set at 178, before validation and before the callback is stored. The synchronous fill-error return at 196-198 does not clear it, and the null gate at 264 returns before 270. After a fill error the residue persists while `is_currently_running_` stays false. Reads are gated by `CurrentlyRunning()` (169-170), so the residue is masked in-file. `InvocationId()` is defined outside the pinned file and was not checked.
2. **Clear runs after the callback body.** Clears follow `Run` (266 before 267). During the callback, `CurrentlyRunning()` still reports true. Whether the callback can re-enter synchronously is outside the file. [INFERENCE] If `Run` consumes the OnceCallback, the null gate also blocks double delivery on re-entry. That is base semantics, not in the pinned file.
3. **Entry precondition unguarded in-file.** `ExecuteTool` (174-178) has no running check. Line 197 runs the parameter callback unguarded, and line 210 overwrites `done_callback_` unconditionally. A caller entering while running would drop the prior callback unrun and overwrite state with no clear. Callers are outside the file, so this is unresolved.
4. **Detached tool, form-level pointer only.** With `IsHandlingSubmit()` true, registration changes skip the callback (390, 448), then null `active_webmcp_tool_` (398, 454) with no `PseudoStateChanged` call. The tool's own running, button, and invocation fields are not written there. They clear later through the submit flow's strong `executing_tool` reference (697, 720), via 756/808/829 or the promise callbacks (801-806). LC07 is not falsified, but the form pseudo-state refresh is deferred to that later callback.
5. **Pending respondWith window.** The `is_handling_submit_` AutoReset (723-726) is a local of the synchronous submit flow and is released before any promise can settle. [INFERENCE from scope lifetime] So while a promise is pending, `IsHandlingSubmit()` is false, and registration changes can reach the callback at 391/449. The file has no timeout (grep: no matches). A promise that never settles and triggers no other callback leaves running state set.
6. **Teardown.** `RemovedFrom` (523) reschedules registration when the insertion point is connected. The invalid branch (380-391) then calls back synchronously unless `IsHandlingSubmit()`. Valid-form registration is posted (402-406). Teardown clears therefore occur only through callback paths.
7. **Scope.** Only the `.cc` is pinned. The definitions of `CurrentlyRunning`, `InvocationId`, and `IsHandlingSubmit`, and all out-of-file callers, are unobserved. Source-only; no runtime claim.

## Existing r19 note status

| Note | Status | Reason |
|---|---|---|
| `.ufo/waves/round-19/w1/SrcHtmlFormTool.md#F747` line 21 | PARTIAL | Holds the stored-callback gate, the running and invocation clears, and pseudo-state removal. Does not name the button-pointer nulling (269). It says the 196-198 bypass happens "because the tool has not yet entered running state", which omits that `invocation_id_` was already set at 178 (caveat 1). Append a correction; do not edit in place. |
| `.ufo/waves/round-19/w2/SourceS078.md#C5C2` line 70 | HOLDS | "The callback routine clears running/button/invocation state when it has a callback." S078 is the same body as S096, per `corpus/knowledge/webmcp-declarative-validation-round-19.md#3701` lines 129-131 ("same retained body as S078"). Does not state the early return explicitly. |
| `corpus/knowledge/webmcp-declarative-validation-round-19.md` | DOES NOT HOLD | No CallDoneCallback or lifecycle text (grep: no matches). The round-20 knowledge note must carry LC07 fresh. |
| `.ufo/waves/round-20/w1/ScribeChecklist.md#02A7` line 12 (in-round, not r19) | HOLDS | "only `CallDoneCallback` clears running, invocation, and pseudo-state, and it is a no-op when no callback is held (S096:261-275)." Verified in-file for those fields. Names no button pointer. |

## Method

Read S096 at 186-232, 261-275, 352-380, 380-462, 515-533, and 728-763. Ran greps over the pinned file for writes to the cleared fields, CallDoneCallback callers, ExecuteTool, and timeout and teardown terms. Ran `sha256sum` against the pinned file. No build or test run.
