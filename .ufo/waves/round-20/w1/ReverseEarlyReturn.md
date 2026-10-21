# ReverseEarlyReturn: PrepareForSubmission early returns and done-callback completion

Seat: `TabiR20.ReverseEarlyReturn` (leaf revenger, round 20, wave w1). Lane baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` (equals lane HEAD). Scope: source-only, Chromium 154.0.8037.97. No runtime, build, or test run. No tools installed or updated. This report is the only file written.

Labels: **[observed]** = read in bytes; **[inference]** = derived from observed bytes, not runtime-observed; **[unknown]** = not in any bytes read.

## 0. Provenance and limits

- Pinned source `corpus/evidence/round-20/sources/html_form_element.cc`: 1740 lines, sha256 `8c8d6796…6916`. This equals `design.json` `source.sha256` and the S096 decoded sha. An upstream fetch (googlesource, tag 154.0.8037.97, `?format=TEXT`, base64-decoded, 2026-10-21) gives the same sha256 and 68278 bytes. **[observed]**
- **Evidence-pointer gap (QUALITY 28).** The pinned path is untracked (`git status --porcelain=v1 -- <path>` gives `??`) and absent at the baseline (`git cat-file -e <baseline>:<path>` fails). The findings below cite on-disk bytes that match the upstream hash. They are not committed-byte evidence until the file is committed. **[observed]**
- Scope extension, limited to the callees the completion verdict depends on: ScheduleFormSubmission (`:882–1043`), ScheduleDeclarativeWebMCPToolRegistration and RemovedFrom (`:353–408`, `:486–525`), and upstream `ModelContext` CancelTool/ExecuteTool and `ContainerNode::NotifyNodeRemoved`.
- Unpinned upstream reads, used only for definitions and gates (decoded sha256 recorded, not lane evidence): `html_form_element.h` `68d7712b…adec6`; `script_tools/model_context.cc` `474083d6…8823`; `platform/runtime_enabled_features.json5` (grep); `dom/container_node.cc` (grep and context). Cited as `up:`.
- `lsp` device: not mounted on this seat. Call-site mapping is literal grep over the whole pinned file. Grep output is not semantic proof.
- Lane tree holds other seats' untracked round-20 files (`git status`). Not touched.

## 1. Answer

1. **[observed]** PrepareForSubmission (`:635–832`) has exactly four `return` statements: `:639`, `:647`, `:659`, `:679`. None calls a done callback, and none reads tool state.
2. **[observed in-file]** No universal completion. The early return itself never completes a running tool: a tool running when a submission hits `:638–679` stays running with its done callback pending. Completion then needs a later, unrelated event: form reset (`:1101–1105`; not for E1, since reset returns at `:1079` when `!frame`), schema or attribute re-registration (queued at `:402–407`; cancel at `:441–452` when the schema changes, outside the submit window), form removal (`:380–400`), or browser-initiated `CancelScriptTool` → `ModelContext::CancelTool` → `HTMLFormMcpTool::CancelTool` (`:224–228`; `up:` model_context.cc:582–618, 923–925). The browser trigger is **[unknown]**; in-file triggers are conditional on later events.
3. **[observed]** Exits that do complete: validation failure (`:756–758`), preventDefault without respondWith (`:807–813`, LC11), and should_submit (`:825–829`, LC12). The respondWith branch defers to HandleWebMcpToolResponse (`:798–806`), which completes on every running branch (`:308`, `:319`, `:324`).
4. **[observed code path; consequence inference]** D1: the success sentinel at `:825–829` (and `:839–841`) depends on the tool still running, not on a navigation having been scheduled. ScheduleFormSubmission is `void` (`:882`) and has eleven non-scheduling exits.
5. **[inference]** D2: a submit handler that removes the form yields `ok(String())` for a submission that was never scheduled.

## 2. Early returns in PrepareForSubmission

| ID | Lines | Condition | Diagnostic | Done? | Reads tool? | Skips |
|---|---|---|---|---|---|---|
| E1 | 638–640 | `!frame` OR `is_submitting_` OR `in_user_js_submit_event_` | none (silent) | no | no | 684–694 ForceUserValid and all later steps |
| E2 | 642–647 | `!isConnected()` | warning, 643–646 | no | no | same |
| E3 | 650–659 | `IsSandboxed(kForms)` | error, 652–658 | no | no | same |
| E4 | 663–679 | a listed control `BlocksFormSubmission()` AND `UnclosedFormControlIsInvalidEnabled()` (`:668`) | error, 670–677; DispatchEvent(error) on form, `:678` | no | no | same |

Notes:

- **E1** has three sub-conditions that differ in kind. `!frame` is a dead end for this call. `is_submitting_` (set `:916`) and `in_user_js_submit_event_` (set `:700–701`) are re-entrancy guards. The outer call completes the tool (`:807–808`, `:825–829`, or the promise path). All three are silent.
- **E4** flag: `up:` runtime_enabled_features.json5:6519–6520 reads `status: "experimental"` with no default-enabled line. **[inference]** off in default builds. Not checked against the flag parser.
- **E2** with a running tool is closed by removal. **[observed up:]** `ContainerNode::NotifyNodeRemoved` (container_node.cc:1429–1443) calls `RemovedFrom` on every inclusive descendant except leaf nodes outside a tree scope (forms are containers, so they are not skipped), from three removal call sites (`up:` 1040–1041, 1110–1111, 1160–1161). With a connected insertion point, RemovedFrom (`:518–523`) runs the sync cancel (`:380–400`). That cancel calls done(cancelled) unless `IsHandlingSubmit()` (`:390–395`). The exception is the submit window (D2), where E2 is not evaluated.
- **E1** (`!frame`) is not closed by removal: ScheduleDeclarativeWebMCPToolRegistration returns at `:359–361` before any cancel. **[observed up:]** `ModelContext::ExecuteTool` CHECKs a frame at entry (model_context.cc:532), so E1 is not reached on the synchronous autosubmit path. It needs a frame detach while a tool is pending. **[unknown]** whether that occurs.
- **E3** is reachable with a running tool in principle. The pinned file has no sandbox gate in registration (`:353–463`) or in HTMLFormMcpTool::ExecuteTool (`:174–222`). Sandbox tokens appear only at `:650–660`, `:891`, `:964–977`. `up:` model_context.cc has no sandbox token.

## 3. Callers while a tool runs

- **Autosubmit.** ExecuteTool sets running state before the call (`:204–206`, including `PseudoStateChanged(kPseudoToolFormActive)`), stores done (`:210`), calls PrepareForSubmission (`:220`), and returns with no post-call check (`:221–222`). E1–E4 leave the invocation running with done pending.
- **Manual.** ExecuteTool focuses the submit button and calls PauseExecution (`:212–217`). Completion waits for a later user-initiated submission. In-file callers are SubmitImplicitly (`:587–588`) and requestSubmit (`:872`). The button-click caller is **[unknown]**: not in pinned bytes. If that call hits E1–E4, nothing in the pinned file completes the paused invocation.
- **submitFromJavaScript** (`:834–843`) does not enter PrepareForSubmission. It calls ScheduleFormSubmission (`:835`) and completes `ok(String())` if the tool is running (`:839–841`).

## 4. Non-early exits of PrepareForSubmission (tool running)

| Exit | Lines | Done | Note |
|---|---|---|---|
| validation fails | 729–731, 756–758 | error (`kToolInvocationFailed`) | `declarative_webmcp_call` captured at `:720–722` |
| respondWith promise | 789–806 | deferred | HandleWebMcpToolResponse `:290–328`; returns silently only when not running (`:295–297`) |
| preventDefault, no respondWith | 807–813 | error | = LC11 |
| should_submit | 818–829 | `ok(String())` | = LC12; not gated on scheduling (D1) |

## 5. Divergences

**D1. [observed code path; consequence inference].** ScheduleFormSubmission (`:882–1043`) exits without scheduling at: `:885–887` (no view/frame/page; silent), `:893–899` (not connected; console), `:901–908` (constructing entry list; console), `:910–912` (`is_submitting_`; silent), `:937–942` (no FormSubmission; silent), `:946–952` (formdata handler disconnected; console), `:962–963` (empty action; silent), `:964–976` (sandbox; console), `:989` (CSP form-action for javascript:; silent), `:1003–1004` (no target frame; silent), `:1018–1019` (navigation not allowed; silent). The callee returns void, so PrepareForSubmission cannot see these. `:827–828` says the sentinel means "a navigation has been triggered". `:825–829` only checks CurrentlyRunning. Upstream `ExecuteScriptTool` maps `has_value()` to success (`up:` model_context.cc:914). The LC12 topic ("scheduled navigation returns null String sentinel") is therefore not enforced by the code.

**D2. [inference; not runtime-observed].** A submit-handler disconnect gives a false-success candidate:

1. `:776` DispatchEvent(submit) runs script; the handler removes the form.
2. Removal reaches RemovedFrom (`:486`, insertion point connected per `:518`) → `:523` ScheduleDeclarativeWebMCPToolRegistration → `!is_valid_mcp_form` → sync branch (`:380`).
3. `:390–395` skip done because `IsHandlingSubmit()` is true. `is_handling_submit_` is set at `:725–726`, inside the block ending at `:817`.
4. `:396–398` unregister; `active_webmcp_tool_ = nullptr`. The tool keeps `is_currently_running_` (`up:` header `:335`; cleared only in CallDoneCallback, `:267`).
5. `:787–788` recompute `declarative_webmcp_call` from the still-running `executing_tool` (`:720`). No respondWith (`:790` false). should_submit stays true (`:775–776`), so `:807` is skipped.
6. `:824` ScheduleFormSubmission → `:893–899` exit (not connected). No navigation.
7. `:825–829` CurrentlyRunning() is true, so CallDoneCallback(`ok(String())`) runs. Success is reported for a refused submission.

Control: a formdata disconnect (`:946–952`) runs after the block, when `IsHandlingSubmit()` is false. The sync cancel then completes with error, and `:825` sees CurrentlyRunning() false. No false success.
Confidence: medium-high from code and `up:` header semantics; ordering not runtime-observed.

**D3. [inference].** `form.submit()` on a sandboxed form with a running tool: `:835` → ScheduleFormSubmission sandbox refusal (`:964–976`) → `:839–841` completes `ok(String())`. Navigation is refused either way; only the tool outcome differs. Reachability of a running tool on a sandboxed frame is **[unknown]**.

**D4. [observed; keeper].** CallDoneCallback is idempotent: a null done returns early (`:263–265`). Double completion (for example `:839–841` followed by `:807–813`) is a no-op.

**D5. [observed; keeper].** The sync-cancel and register paths skip done inside the IsHandlingSubmit window (`:390–395`, `:448–452`) and leave completion to PrepareForSubmission. The completing branches are `:756`, `:808`, `:829`, and the promise path (`:798–806`). D2 is the case where completion happens with the wrong outcome.

**D6. [observed; comment vs code].** `up:` model_context.cc:607–609 says unregistration of a declarative tool "immediately invokes its `done_callback_`". The pinned code skips that call inside the IsHandlingSubmit window (`:390–395`, `:448–452`). The upstream comment is a claim, not evidence, and it is contradicted in that window.

## 6. Rejected or not supported

- "Every PrepareForSubmission exit completes a running tool." **Rejected**: E1–E4 (`:638–679`) contain no done call.
- "Nothing in the pinned file can complete a stalled tool." **Rejected**: form reset (`:1101–1105`), re-registration (`:441–452`), and removal (`:380–400`) each complete a running tool, but only on their own later events.
- "E2 with a running tool is a leak." **Not supported**: removal closes it (section 2).
- "A frame-less document cancels tools on removal." **Rejected**: `:359–361` return first. reset() also returns on `!frame` (`:1079`).
- "E1–E4 are covered by LC01–LC12." **Rejected**: no LC span in `design.json` lies in 635–679. Spans are 181–186, 189–210, 249–258, 212–218, 218–221, 224–229, 261–275, 290–298, 298–319, 320–327, 787–815, 818–830.

## 7. Scribe-facing gaps (not edited)

- No decision row covers PrepareForSubmission's early returns (`:638–679`) or the ScheduleFormSubmission exits. Candidate rows: E1–E4 (condition, no done, scope), and D1 (sentinel not gated on scheduling).
- The LC12 topic wording overstates the code (D1).
- The cited source path is untracked (section 0). It must be committed before any claim here is admitted under QUALITY 28.

## 8. Unknowns (not asserted)

- Browser-side trigger for CancelScriptTool. The renderer-side ModelContext has no Timer or timeout token (`up:` grep, zero matches).
- The button-click caller of PrepareForSubmission (`html_form_control_element` not pinned).
- Whether E1 (frame detach with a tool pending) is reachable.
- All runtime behavior. Scope is source-only.
- Blink removal coverage is verified only by upstream `container_node.cc`, not at runtime.

## 9. Confidence

- E1–E4 carry no done call: **high**.
- No in-file completion for E1–E4 with a running tool: **high**. System-level completion via CancelScriptTool: **medium** (trigger unknown).
- D1 code path: **high**. D1 consequence: **medium**.
- D2: **medium-high**.
- D3: **low-medium** (reachability unverified).

## 10. Commands run (this seat)

- `sha256sum` and `wc -l` on the pinned file: `8c8d…6916`, 1740 lines.
- `git cat-file -e <baseline>:<path>`: absent. `git status --porcelain=v1 -- <path>`: `??`.
- Upstream fetch (`curl` → `base64 -d` → `sha256sum` or `grep`) for `html_form_element.cc` (`8c8d…6916`, 68278 B), `html_form_element.h` (`68d7…adec6`), `model_context.cc` (`4740…8823`), `runtime_enabled_features.json5` (grep), `container_node.cc` (grep and context). Read-only. Nothing written except this report.
- Literal grep over the pinned file for done, tool-state, return, sandbox, and feature-gate tokens.
- Installs: none. pacman not used (host-wide pause).
