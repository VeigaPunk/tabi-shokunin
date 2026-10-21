# SemanticLC07 — round 20 final LC07 predicate/effect check

Scope: LC07 only, `CallDoneCallback` at `corpus/evidence/round-20/sources/html_form_element.cc:261-275`. Read-only except this report. No tests, builds, or formatters run. No peers contacted. Nothing here is a runtime claim.

## Identity

- Revision `4ae99816b8994fdedc159156d8d9d242dd5c4782` exists. Working tree equals the committed checkpoint for every LC07 surface (sha256 of `git show <rev>:<path>` vs working file):
  - `corpus/evidence/round-20/lifecycle/decisions.json` `da42e495…`
  - `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` `3ac83d0a…`
  - `SKILL.md` `a2653f45…`
  - `corpus/evidence/round-20/sources/html_form_element.cc` `8c8d6796…`
  - `.ufo/waves/round-20/design.json` `1c9f536e…`
  - `.ufo/waves/round-20/measure-c1.mjs` `fab3bde4…`
- Retained body `8c8d6796…` equals the tag-fetched `html_form_element.cc` at `154.0.8037.97`, and equals the r19 S078 gzip body decompressed.
- LC07 `condition`/`outcome` text is identical in `decisions.json:61-62`, note row `…:35`, and SKILL.md row `2223`.

## Verdicts (one label per claim; nothing summed)

| # | Claim (surface) | Verdict | Reason |
|---|---|---|---|
| V1 | Span `261-275` (decisions.json:63-64) | ENTAILED | 261 is the signature, 275 the closing brace. |
| V2 | Quote `std::move(done_callback_).Run(result);` | ENTAILED | Literal on line 266; one whitespace word. |
| V3 | Condition "CallDoneCallback is called." (D:61, N:35, S:2223) | REWRITE | The branch is selected by the entry test `done_callback_.is_null()` (263), which appears only in the outcome. LC05 and LC08 carry their entry predicates in the condition column. |
| V4 | "If done_callback_ is null it returns with no state change." | ENTAILED | 263-265; no write precedes the return; `result` is unused on this arm. |
| V5 | "the callback is invoked (line 266)" | ENTAILED | `Run()` is called on `done_callback_` at 266. The bound body is outside S096, as the row's last sentence says. For the only fetched caller the body does run (see Callback). |
| V6 | "before the state reset at lines 267-270" | ENTAILED | 266 precedes 267; no early exit between them. |
| V7 | "sets is_currently_running_ to false" (267) | ENTAILED | The only `= false` write in the retained file. |
| V8 | "clears active_submit_button_ and invocation_id_" (269, 270) | ENTAILED | The only clear sites in the file. |
| V9 | "is followed by PseudoStateChanged notifications (lines 271-274)" | REWRITE | 271 notifies the form unconditionally. 272-274 run only when `old_submit_button` (captured at 268, before the clear) is non-null, and they notify that captured button, not the cleared member. The plural is not entailed when no submit button was active. |
| V10 | "At the callback, the reset has not run" | ENTAILED | Ordering 266 < 267 within the same call. |
| V11a | "those fields hold pre-completion values" | ENTAILED | Follows from V10. |
| V11b | "unless the callback changes them" | UNRESOLVED | For the fetched caller the body (`model_context.cc:721-745`) names no HTMLFormMcpTool field. Re-entry through `tool_executed_cb` (`model_context.cc:741`) is not traced (lead L2). |
| V12 | "the excerpt does not show what the callback does" (D:62, N:35, S:2223) | ENTAILED | True of S096. The body is at `model_context.cc:721-745`, outside the anchor. |
| V13 | "Completion bookkeeping (LC07) runs only when a done callback exists; it is not a failure class." (note prose) | ENTAILED | The reset and notifications sit behind the guard at 263-265. "Bookkeeping" covers tool-side state only; ModelContext's pending-entry erase is inside the callback body (`model_context.cc:739-743`). |
| V14 | "The callback is invoked before the state reset and the PseudoStateChanged notifications; no assertion … beyond the ordering above." (note prose) | ENTAILED | Ordering only; same scope as V5. |
| V15 | "preserve callback-before-reset ordering and the not-running guard (LC07–10)" (SKILL.md:2233) | REWRITE | As applied to LC07 the attribution is NOT-ENTAILED. LC07's guard is the done-callback null guard (263-265). The not-running guard is `CurrentlyRunning()` at 295-297 (LC08), which LC09-10 sit behind. |
| V16a | Invariant `done_callback_` non-null ⇔ `is_currently_running_` | ENTAILED (retained file) | Set together (204, 210); cleared together (266-267). No other writer in the file. |
| V16b | Same invariant for other callers of `ExecuteTool` | UNRESOLVED | The fetched caller always passes a non-null `BindOnce` (`model_context.cc:719-721`). Other translation units were not fetched. |
| V17 | Every callsite applies the same LC07 effect | ENTAILED | Callsite table below; no caller-specific parameter reaches the effect. |
| V18 | Row does not say idle callers depend on the null arm | ENTAILED (sample gap, not a false claim) | Form reset (1101-1105) and definition updates (391, 449) call `CallDoneCallback` without a running check. The null arm makes them no-ops on idle tools. |
| V19 | design.json LC07 topic "clears running/button/invocation state only with callback" (design.json:73-80) | ENTAILED | The clears sit behind 263-265. |
| V20 | Source-only versus prior r17/r19 observations | ENTAILED (consistent, no contradiction) | r17 fixture `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html:27-28` samples `:tool-form-active` at submit time, before completion, matching the pre-reset ordering. No r17 or r19 observation samples pseudo-state after completion, so LC07's post-reset notifications stay source-only. |

## Callsite versus effect

| Line | Caller | Entry guard as read | Null arm reachable? |
|---|---|---|---|
| 226 | CancelTool | `CHECK(is_currently_running_)` (225) | no (running) |
| 308, 319, 324 | HandleWebMcpToolResponse | `CurrentlyRunning()` (295-297) | no |
| 391 | ScheduleDeclarativeWebMCPToolRegistration, form invalid | `!IsHandlingSubmit()` (390); no running check | yes, if idle |
| 449 | RegisterDeclarativeWebMCPTool, definition changed | `!IsHandlingSubmit()` (448); no running check | yes, if idle |
| 756 | PrepareForSubmission, validation failure | `declarative_webmcp_call` (722, 731) | no |
| 808 | PrepareForSubmission, `!should_submit` (LC11) | `declarative_webmcp_call` (787-789), `else if` (807) | no |
| 829 | PrepareForSubmission after ScheduleFormSubmission (LC12) | `CurrentlyRunning()` (825) | no |
| 841 | submitFromJavaScript | `CurrentlyRunning()` (839), CHECK (840) | no |
| 1102 | HTMLFormElement::reset | `if (active_webmcp_tool_)` (1101) only | yes, if idle |

## Entry-time predicates

- The only test before any effect is `done_callback_.is_null()` (263). `is_currently_running_` is not consulted at entry. ENTAILED.
- Header defaults (`html_form_element.h:334, 349-351`): `is_currently_running_ = false`, `done_callback_` null, `invocation_id_` empty, `active_submit_button_` null. A fresh tool is therefore a no-op under LC07. ENTAILED.
- Writers in the retained file: `invocation_id_` set at 178, cleared at 270; `is_currently_running_` set at 204, cleared at 267; `active_submit_button_` set at 205, cleared at 269; `done_callback_` set at 210, tested at 263 and consumed at 266.

## Callback and null guard

- `OnceCallback::Run() &&` CHECKs non-null (`base/functional/callback.h:145-146`) and moves its holder out before invoking (`:148-152`). `BindStateHolder`'s defaulted move leaves the source null (`base/functional/callback_internal.h:140, 172`). Primary-source consequences, not S096 facts:
  - `done_callback_` is null during and after `Run()`. A nested `CallDoneCallback` from inside the callback returns at 263-265, so completion is single.
  - The guard at 263 is load-bearing: without it, idle callers (1102, 391, 449) would hit the CHECK inside `Run()`.
- Cancellation for the one fetched caller: the callback is `BindOnce(<captureless lambda>, WrapWeakPersistent(document_), invocation_id)` (`model_context.cc:719-745`). The weak receiver is an argument, not a method receiver. The default `CallbackCancellationTraits` is non-cancellable (`base/functional/bind_internal.h:1980-1983`). The weak specialization requires `kIsWeakMethod`, which requires `is_method` (`:443-448`, `:1986-1991`). `blink::WeakPersistent` is a weak receiver only in that method form (`third_party/blink/renderer/platform/heap/persistent.h:136-140`). So `Run()` executes the lambda body for this caller. ENTAILED for this caller; other callers UNRESOLVED.

## Sample limits

- The row does not mention that the LC02 path (178 write; return at 196-197 without clear) leaves `invocation_id_` set. `GetActiveWebMCPToolInvocationId()` masks it through `CurrentlyRunning()` (169-171). Not a claim of the row; no defect.
- The row does not mention that LC07 is skipped on the `IsHandlingSubmit()` definition-update path (390-398, 448-454). Not claimed; sample gap only.
- The "finite sample" framing holds. LC07 makes no completeness or sum claim.

## Unverified leads (out of scope; not reproduced; no vulnerability claim)

- L1, second `ExecuteTool` while pending: `html_form_element.cc:177-178, 204-205, 210` overwrite the state and the prior `done_callback_` without running it. `model_context.cc:712-719` inserts and calls with no running check. Open: whether a second invocation can reach a pending form tool, which depends on gating outside the fetched files. If reachable, the unconditional reset at 267-270 would clear the second run's state.
- L2, re-entry from the done callback: `model_context.cc:741` runs `tool_executed_cb` synchronously. Whether that reaches `ExecuteTool` or `CancelTool` on the same tool is not traced.
- L3, cancel by name after instance replacement: `ModelContext::CancelTool` finds the tool by name (`model_context.cc:612-618`) and calls `CancelTool()`, which CHECKs `is_currently_running_` (`html_form_element.cc:225`). Definition-update paths skip `CallDoneCallback` while `IsHandlingSubmit()` and then drop the old instance (390-398, 448-454). Open: whether a pending entry can outlive its instance. Not established.
- L4, callback argument lifetime: the lambda `CHECK(document)` (`model_context.cc:724`) receives a weak document argument (`:745`). Document lifetime across a pending run is not established.

## Proposed rewrites (main applies; identical text on all three surfaces)

Targets: `decisions.json` `condition` (line 61) and `outcome` (line 62); note row line 35; SKILL.md row line 2223. design.json `skillRendering` requires the SKILL row to equal the rendered manifest row. Span and quote stay unchanged.

- condition (V3): `CallDoneCallback is called; the branch is selected by whether done_callback_ is null at entry.`
- outcome (V4, V9 clarified): `If done_callback_ is null it returns with no state change; is_currently_running_ is left as it was. If non-null, Run() is called on done_callback_ (line 266) before the state reset at lines 267-270, which sets is_currently_running_ to false, clears active_submit_button_ and invocation_id_, sends a PseudoStateChanged notification to the form (line 271), and sends one to the submit button captured at line 268 only if it was non-null (lines 272-274). At the callback, the reset has not run, so those fields hold pre-completion values unless the callback changes them; the excerpt does not show what the callback does.`
- SKILL.md line 2233 (V15): replace `preserve callback-before-reset ordering and the not-running guard (LC07–10)` with `preserve callback-before-reset ordering and the done-callback null guard (LC07), and the not-running guard (LC08–10)`.
- Do not add nested-call, idempotence, or `Run()` facts to the row. Its anchor is S096 only, and the counter pins that source. If main wants them recorded, put them in the note prose with the callback.h, callback_internal.h, and model_context.cc anchors above.
- Coupling: the counter renders each manifest row (`.ufo/waves/round-20/measure-c1.mjs:276`) and the selftest has an LC07 row-missing mutation (`corpus/evidence/round-20/selftests/expected.json:146-147`). Main runs the counter once after the three edits. Not run here.

## Tooling and provenance

- Installed or updated: none. Used existing `git` (read-only `cat-file` and `show`, no index writes), `curl`, `base64`, `sha256sum`, and `jq`.
- Primary sources at tag `154.0.8037.97`, fetched to `/tmp` (outside the repo) and deleted after hashing. sha256:
  - `base/functional/callback.h` `78970910…`
  - `base/functional/callback_internal.h` `7c32e555…`
  - `base/functional/bind_internal.h` `4c7e4f55…`
  - `third_party/blink/renderer/platform/heap/persistent.h` `65edb3ef…`
  - `third_party/blink/renderer/core/html/forms/html_form_element.h` `68d7712b…`
  - `third_party/blink/renderer/core/script_tools/model_context.cc` `474083d6…`
  - `third_party/blink/renderer/core/html/forms/html_form_element.cc` `8c8d6796…` (matches the retained anchor)
- `third_party/blink/renderer/core/script_tools/model_context_supplement.cc` (`9c04bf35…`, 54 lines) was fetched and not relied on.
