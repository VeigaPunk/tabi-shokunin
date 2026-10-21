# SourcePauseContext: what `PauseExecution` does and does not prove

Lane: tabi-shokunin, round 20, wave 1. Seat: TabiR20.SourcePauseContext (leaf; no dispatch).
Scope: Chromium 154.0.8037.97, source-only. No browser, page, or runtime observation was made. Nothing here is a runtime or host-behavior claim.
Writes: this report only. Fetched bytes are scratch copies in `/tmp/tabi-r20-SourcePauseContext/` (volatile, not a root; re-fetch from the URLs and hashes in section 2).
Installs or updates: none. Used pre-existing `curl`, `base64`, `sha256sum`, `cmp`, `git hash-object`.

## 1. Verdict

- The no-autosubmit branch is not completion. It sets `is_currently_running_ = true` and stores `done_callback_` (S096:204, :210), then calls a void, argument-less pause (S096:215-217) and returns (S096:222). No `CallDoneCallback` runs on this path. Full completion-site list in section 5.
- The pause proves nothing about a user. In the fetched source, completion is not gated on a user. Script `form.submit()` and `requestSubmit()` complete the held tool with success, and no trust or user-activation check exists in S096 (S096:834-843, :845-873).
- The browser effect at this tag is not the `Pause(true)` the commit message describes. Because `kActorFormScriptToolInterrupt` is enabled by default, the receiver calls `Interrupt(retain_user_control=true)`. Neither effect is a completion, and no fetched file ties its release to the form submit.
- The round-19 dossier phrase "no-autosubmit is user-gated" overstates. The round-19 note does not hold LC04 at all (section 6).

## 2. Pinned sources (fetched and hashed this session)

Base: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/`, each with `?format=TEXT` (base64, decoded before hashing).

| ID | Path at tag | sha256 of decoded bytes | Notes |
|---|---|---|---|
| S096 | `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | 1740 lines; `cmp`-identical to lane copy `corpus/evidence/round-20/sources/html_form_element.cc` |
| S042 | `third_party/blink/renderer/core/script_tools/model_context.cc` | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | 50117 B; as-served base64 sha `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` (66824 B); blob `c5ef637f8e676ecc56050982a07f1c8e9056218c` (`git hash-object`) |
| - | `third_party/blink/renderer/core/script_tools/model_context.h` | `5c9fb96d362b61c8477bb891e39c3fdb233f6176bf15c72b142c0b0cf93adbfe` | 9608 B; blob `e2f9fdbd82255661a086f7bac05b553fc9955af2` |
| - | `third_party/blink/public/mojom/content_extraction/script_tools.mojom` | `1e8995ab64ee51c0c51e78cf3dd136ceb530d290a1a6970f5b753e33f6398c27` | 5392 B; `ScriptToolHost` interface |
| - | `third_party/blink/renderer/core/html/forms/html_form_element.idl` | `af49dfe408192f26e77a3ccbb95478459313a3cf346bbcbc68eebfd2ffcc78fd` | 2323 B; `submit()` and `requestSubmit()` bindings |
| - | `third_party/blink/renderer/core/html/forms/html_button_element.cc` | `b81388409089a4d65ac25b67e5ce981d8b1e91316fcdec503cdbb69965bdd44e` | 13650 B; submit-button `DOMActivate` path |
| - | `third_party/blink/renderer/core/html/forms/html_input_element.cc` | `ea5fab8a7e73ed6c978e95e57ffa59742c33eb1126f4d8e08d2f6ffd1714805c` | 101127 B; implicit-submit call site |
| - | `third_party/blink/renderer/core/html/forms/html_form_control_element.cc` | `bf112fd47ddaa24667d22faebb22a8bb11315690ce2fe68b61b05ce67ef0cedb` | 20216 B; no submit call (negative check) |
| - | `chrome/browser/actor/actor_script_tool_receiver.cc` | `23e730800b4e1b36901d8b88e27d0c356888fa3b6f59042a8bf831b07c6a2a6d` | 1819 B; browser receiver |
| - | `chrome/browser/actor/actor_task.cc` | `10832c7b89adbbe1e5a03616c75ff425856bfb18cb471e7dc6632aeaaaadaa94` | 37478 B; Pause, Resume, Interrupt, Uninterrupt |
| - | `chrome/browser/actor/actor_task.h` | `a55afbb125e9063fd699ddd93f6b92e99df140a7a9efed2bce5ab43513438737` | 19415 B; contracts |
| - | `chrome/browser/chrome_browser_interface_binders.cc` | `8ebb704665bba33c33424ccb80dff12f91e10fe21fa368f4dc9b619cf806a631` | 26525 B; binder registration |
| - | `components/actor/core/actor_features.cc` | `b70dfc015bdd2e454d3537d4cb0e47ca4a7ca4d8245585f68cf7ddec17b1a9bd` | 8020 B; feature defaults |

- Tag to commit: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON` gives commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- Lead, not the 154 behavior: commit `e5a1c0cc5874e52162698226c47d804ec2061697` (`refs/heads/main@{#1580338}`, author 2026-02-05). Commit object sha `79d529637ad1e591bc05ff89f41f96189374288b30003a92fe4a2ef0ad82516a`; diff at `…/+/e5a1c0cc5874e52162698226c47d804ec2061697%5E!/?format=TEXT`, sha `1429d53dc15dd37730f0413e00e5088381ea8d5fbac3548d5e7ac68da8e47509`.
- Registry: S042 (model_context.cc) is `.ufo/waves/round-18/drafts/SOURCES.final.md:56`. Its digest (`474083d6…8823`) matches the one re-derived here.

## 3. Trace

Renderer, pinned 154:

```
html_form_element.cc:204,210   is_currently_running_ = true;  done_callback_ = std::move(done_callback);   // set BEFORE the pause
html_form_element.cc:212-217   if (require_submit_button) {                    // require_submit_button = no toolautosubmit (:181-182)
                                 submit_button->Focus();                        // :215  no result is read
                                 auto* context = ModelContextSupplement::modelContext(form_->GetDocument());  // :216  no null check
                                 context->PauseExecution();                     // :217
html_form_element.cc:222       }                                               // no CallDoneCallback on this path
model_context.cc:892-898       void ModelContext::PauseExecution() {
                                 if (!script_tool_host_remote_.is_bound()) { ...GetInterface(...BindNewPipeAndPassReceiver(task_runner_)); }
                                 script_tool_host_remote_->PauseExecution();    // :897  one message, no callback, void
                               }
model_context.h:166,243        void PauseExecution();   HeapMojoRemote<mojom::blink::ScriptToolHost> script_tool_host_remote_;
script_tools.mojom:46-48       interface ScriptToolHost { // Pauses the execution of the agent.  PauseExecution(); };  // no reply, no invocation id
```

Browser, pinned 154:

```
chrome_browser_interface_binders.cc:471-472  ScriptToolHost -> actor::ActorScriptToolReceiver::Create
actor_script_tool_receiver.cc:27-52          PauseExecution():
  :30-41   silent return if no WebContents, no ActorKeyedService, or no acting task for this WebContents
  :44-45   if (IsEnabled(kActorFormScriptToolInterrupt)) task->Interrupt(/*retain_user_control*/ true);
  :46-49   else task->Pause(/*from_actor=*/true, /*cancel_existing_action=*/false);
actor_features.cc:178                        BASE_FEATURE(kActorFormScriptToolInterrupt, base::FEATURE_ENABLED_BY_DEFAULT);
actor_task.cc:541-550                        Interrupt(): no-op unless state is kReflecting or kActing; sets interrupted_task_needs_user_control_; SetState(kWaitingOnUser)
actor_task.cc:318-320                        UI-facing state: kWaitingOnUser with the retain flag is reported as kPausedByActor
actor_task.cc:503-530                        Pause(from_actor=true, cancel=false): PauseOngoingActions(); SetState(kPausedByActor)
Release paths in fetched files:
  actor_task.cc:532-539                      Resume(): only if IsUnderUserControl(); SetState(kReflecting)
  actor_task.cc:552-560                      Uninterrupt(resumed_state): only from kWaitingOnUser
  actor_task.cc:458-461                      OnFinishedAct: kActing, or kPausedByActor with a non-paused result (not kWaitingOnUser) -> kReflecting
  No call site for Resume(), Uninterrupt(), or Interrupt() appears in the fetched ActorTask files.
```

Commit versus tag. The commit message (`e5a1c0cc`, lines 6-11) says the change pauses "when a declarative WebMCP form tool requires user interaction", and that "the renderer is waiting for the user to click the submit button". Its receiver calls `Pause(/*from_actor=*/true)` (diff, new `actor_script_tool_receiver.cc`, +lines 45-62). Its renderer call site (diff `html_form_element.cc` +158-164) used `window->navigator()` with null checks. At the tag, the renderer has no null check (S096:216-217), and the receiver branches on the feature flag. The tag supersedes the commit, so the commit is intent only.

## 4. What `PauseExecution` does NOT prove

1. **A user acted or intended to act.** The call is unconditional on the no-autosubmit branch after a successful fill (S096:181-182, :189-198, :212-217). It takes no event or input (`model_context.h:166`). "wait for the user to submit it" (S096:213-214) is a comment of intent.
2. **The submit button received focus.** The result of `Focus()` is never read (S096:215). A null button is excluded earlier (S096:251-256 returns an error; :196-197 returns before this branch), so the call never runs with null.
3. **The browser received or applied the pause.** The mojom method has no reply (`script_tools.mojom:48`). Compare `ExecuteRemoteScriptTool(...) => (string? result, bool success)` (:91-95) and `ExecuteScriptTool(...) => (...)` (:114-116). The renderer passes no callback (`model_context.cc:897`). The browser returns silently when there is no WebContents, service, or acting task (receiver:30-41), and `Interrupt` is a no-op unless the task is kReflecting or kActing (`actor_task.cc:543-545`). The page cannot observe any of this.
4. **Tool completion.** `done_callback_` stays held (S096:210) and `is_currently_running_` stays true (S096:204). The only writer of `is_currently_running_ = false` is `CallDoneCallback` (S096:267).
5. **Which invocation is paused.** The message has no invocation id (`script_tools.mojom:48`, `model_context.h:166`). The browser acts on the acting task found for the WebContents (receiver:39-41). Compare `ExecuteScriptTool(invocation_id, …)` (mojom:114) and `CancelScriptTool(invocation_id)` (mojom:119).
6. **What releases the pause.** In the fetched files, release is `Resume()` (`actor_task.cc:532-539`), `Uninterrupt()` (`:552-560`), or, on the Pause branch only, completion of an existing action (`OnFinishedAct`, `:458-461`; `actor_task.h:217-218`: "its completion will resume the task"). No caller of `Resume()` or `Uninterrupt()` is in the fetched files. The header records the interrupt-state contract as unfinished: "TODO(crbug.com/484367299): Implement a proper actor task state for interrupt-with-user-control." (`actor_task.h:228-229`; receiver:42-43).
7. **That completion requires a user.** Completion sites with no trust or activation gate:
   - `form.submit()`: the IDL maps `submit()` to `submitFromJavaScript` (`html_form_element.idl:46`). S096:834-843 calls `ScheduleFormSubmission(nullptr, nullptr)`, then `CallDoneCallback(base::ok(String()))` (:839-841). There is no validation and no submit event. The comment at :837-838 says "from inside a submit handler", but the code has no such condition.
   - `requestSubmit()`: IDL:47. S096:845-873 calls `PrepareForSubmission(nullptr, control)` (:872), which reaches success at :829 if not cancelled.
   - Implicit submission: S096:552-590, with the call at :588.
   - Submit-button `DOMActivate`: `html_button_element.cc:219-248`, with the call at :246. A grep of that file finds no `isTrusted`, `IsTrusted`, or transient-user-activation check.
   - Whole-file grep of S096 for `[Tt]rusted|[Aa]ctivation|[Gg]esture|[Uu]ser[ _]?[Ii]nput|UserInteraction` matches only comment lines :203 and :214.
8. **That the eventual submit succeeded.** Interactive validation failure completes the tool with an error (S096:729-758), unless validation is skipped (:713-715). `preventDefault()` without `respondWith` yields an error (:807-813). Success is recorded at scheduling time: `CallDoneCallback(base::ok(String()))` runs right after `ScheduleFormSubmission` returns (:824, :829). `ScheduleFormSubmission` is `void` and returns early without signalling the tool (:885-887, :893-899). The later navigation outcome is not observed here.
9. **That a submit attempt reaches the tool.** `PrepareForSubmission` returns before any tool logic when `!frame || is_submitting_ || in_user_js_submit_event_` (:638-640), when disconnected (:642-648), when sandboxed (:650-660), or on an unclosed-control error when that feature is enabled (:666-680). In each case the tool stays running.
10. **That the submitter is the focused button.** The tool's `active_submit_button_` is set at :205 and used only for pseudo-class state (:155-161) and cleared at :268-269. `PrepareForSubmission` never compares `submitter` with it (:635-832). `requestSubmit(submitter)` accepts any submit button owned by the form (:854-870).
11. **That the pause is time-bounded.** S096 has no match for `Timer|imeout|PostDelayedTask|setTimeout`. `model_context.cc`'s only delayed task is a 10 s UMA counter (:877-888). Browser side: `kActorScriptToolExecutionTimeout` (`actor_features.cc:166-167`) and `StoppedReason::kTimeout` (`actor_task.h:167`) exist, but no fetched file consumes them on this path.
12. **Anything at runtime.** Source-only. No browser or page run. Nothing here describes host behavior (QUALITY rule 14).

## 5. Completion sites in S096 (every `CallDoneCallback` call)

| S096 line | Trigger | Result to tool | Source gate on who acted |
|---|---|---|---|
| 226 | `CancelTool` (abort signal) | kToolCancelled | none (abort path) |
| 308, 319, 324 | respondWith promise settles (`HandleWebMcpToolResponse`) | error or ok(value) | needs a submit event with respondWith |
| 391, 449 | tool definition updated | kToolCancelled | none |
| 756 | interactive validation fails | kToolInvocationFailed | any `PrepareForSubmission` while running (:720-722) |
| 808 | submit event preventDefault without respondWith | kToolInvocationFailed | same as above |
| 829 | submission scheduled (`should_submit`) | ok(String()) | same as above; no check that scheduling happened |
| 841 | `form.submit()` (`submitFromJavaScript`) | ok(String()) | none; script-only, no validation or submit event |
| 1102 | form reset | kToolCancelled | none |

"Same as above" means any caller of `PrepareForSubmission`. Callers are implicit submission (:588), the submit button's `DOMActivate` (`html_button_element.cc:246`), `requestSubmit` (:872), and autosubmit (:220). `ExecuteTool` (:174-222) contains no `CallDoneCallback` call.

## 6. Round-19 and round-20 wording checks

- `corpus/knowledge/webmcp-declarative-validation-round-19.md` does not hold LC04. A case-insensitive grep for `pause` and `focus` returns no matches. Its scope excludes "forms without `toolautosubmit`" (`:18-19`).
- `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:17` says "Thus no-autosubmit is user-gated after fill; autosubmit is not." This is overstated. The same branch is completed by `form.submit()` and `requestSubmit()` (S096:834-843, :845-873). Suggested replacement: "pending a submit-class call".
- `.ufo/waves/round-20/w1/ScribeChecklist.md:10` says "stay running, which is not completion (S096:212-217)". This matches section 1.

## 7. Suggested LC04 handling (for the scribe; source-only)

- Outcome: "Focus the submit button and send a fire-and-forget `ScriptToolHost::PauseExecution()`; the tool stays running with its callback held. Not completion."
- Caveat: "The pause is not a user-completion gate: `form.submit()` and `requestSubmit()` complete the held callback (S096:834-843, :845-873)."
- Quote inside the S096:212-218 span (22 words; the source's stated intent, not behavior): "Without `toolautosubmit`, we focus the submit button, tell the agent to allow user input, and wait for the user to submit it."
- Mechanism quote, outside that span and therefore needing its own registry row: "Pauses the execution of the agent." (`script_tools.mojom:47`).
- Row draft: `| LC04 | toolautosubmit absent and fill succeeded | Focus submit button and send a fire-and-forget pause; tool stays running with its callback held; not completion and not user-gated | S096:212-218 |`
- Registry: the browser, mojom, IDL, button, input, and control-element files have no `corpus/SOURCES.md` rows. If the note cites them, they need rows (QUALITY rules 12 and 28).

## 8. Untested or unobserved shapes (QUALITY rule 27)

- Script `element.click()` reaching `DOMActivate`: `HTMLElement::click` was not fetched. Not traced.
- Other `PauseExecution` callers: none in S096 except :217. No Chromium-wide search beyond the fetched files.
- Callers of `Resume()`, `Uninterrupt()`, and consumers of `kActorScriptToolExecutionTimeout` or `kTimeout`: not in the fetched files.
- The lane build's feature state (`kActorFormScriptToolInterrupt`, Actor availability, WebMCP flags, field trials): not observed.
- Runtime behavior of any branch: not observed.

## 9. Leads (unverified; not relied on)

- Search snippets for `issues.chromium.org/issues/502914434` and `/503127470` describe cross-origin reachability of `PauseExecution` and an `ActorTask` paused state. The reader could not render 502914434, so neither was opened or evaluated.
