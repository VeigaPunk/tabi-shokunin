# SourceSubmitEvent: respondWith preconditions and sync/async (Chromium 154.0.8037.97, source-only)

**Seat:** TabiR20.SourceSubmitEvent (leaf; no dispatch) · **Round:** 20, wave 1 · **Date:** 2026-10-21
**Scope:** source-only. Not runtime-observed. No browser, CDP session, page, build, or test was run. No corpus row, knowledge note, decision, manifest, or SOURCES entry was written or changed. This report is the only file written.
**Baseline:** HEAD `c49929430d996b016dde2e3a3a5be380f3433fdb` (equals design.json baseline). **Tag:** `154.0.8037.97` (equals design.json S096 tag).

## Answer (source-scoped)

`SubmitEvent.respondWith(p)` succeeds only if four conditions hold at call time, checked in this order: (1) the member is exposed (IDL `RuntimeEnabled=WebMCP`); (2) the event is agent-invoked (`agentInvoked` true); (3) `preventDefault()` was already called on the event; (4) the event is currently being dispatched. Each failed check throws `InvalidStateError` synchronously. Success only stores the promise and returns `void`. The tool result is consumed asynchronously through the promise's reactions, while the form's submit/no-submit decision is taken synchronously from the dispatch return value.

## 1. Access record

| Item | Record |
|---|---|
| Opened URL (primary) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/submit_event.cc?format=TEXT` |
| Access method | `curl -fsSL` with `set -o pipefail` (exit 0), then `base64 -d` into session-local `local://` scratch, which is outside the repo. |
| Bytes | 108 lines (`wc -l`). Header: `Copyright 2020 The Chromium Authors`. |
| sha256 (full) | `74d454db950dabcf3d3e90e2ff46a8397d421de6e5dba5814622e4d207db6853` |
| Re-derive | `curl -fsSL "<URL above>" \| base64 -d \| sha256sum` must print the sha256 above. Do not put this pipe in a table cell. |
| Failed cross-check | `https://source.chromium.org/chromium/chromium/src/+/refs/tags/154.0.8037.97:third_party/blink/renderer/core/html/forms/submit_event.cc` returned a JavaScript-required navigation shell (reader method `jina`) with no code bytes. Not counted as access. |
| Lane pin check | `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to design.json `source.sha256`. |
| Tracking caveat | `corpus/evidence/round-20/sources/html_form_element.cc` (S096) is **untracked** at HEAD (`git status` `??`). Its pointers below are therefore not committed-byte roots (QUALITY 28); its root is the URL plus sha pin. The Chromium bytes are not in the repo at all. |
| Tools | None installed or updated. `curl`, `base64`, `sha256sum`, `wc`, `git` were already present. |

Supplementary files opened at the same tag by the same method. They are not admitted and have no row. Full sha256 for each:

| Path under `third_party/blink/renderer/` | Lines | sha256 |
|---|---|---|
| `core/html/forms/submit_event.h` | 98 | `5e25a9c32805098721481c41891f3bd0d63a362831bfda1cc150b547bdcf1a8a` |
| `core/html/forms/submit_event.idl` | 14 | `d994f3268e21dcde6c166e0b26bb89e96277099fa6067909fc09f448109844fd` |
| `core/html/forms/submit_event_init.idl` | 10 | `aeea8f49a851f40cc17bf584fc8406be0ac0e099f390020f75c189699dae397a` |
| `core/dom/events/event.h` | 413 | `a484b7cf7ed87a2f484009d685f2c475402b553bb2c2920d2f3408998335466f` |
| `core/dom/events/event_dispatcher.cc` | 496 | `8456e1ee3a3452d11ae30d056c07c98ec84545dc44f78f75ef0a4517cfeaf06b` |
| `bindings/core/v8/js_based_event_listener.cc` | 213 | `e2987ff0a7a43f636baba2f443280a451b57699be1a45734dedec277dfb817bb` |
| `bindings/core/v8/js_event_listener.cc` | 67 | `e54bbc15492e6d487470b24a5e2e80050094ee2327680f273a90be72e4814246` |
| `bindings/core/v8/v8_script_runner.cc` | 1009 | `280d02bc1cb806170c2637c8bcbac800c10fbe6480a07c4ef0f8a498fcf15e0b` |

`bindings/core/v8/v8_abstract_event_listener.cc` returned HTTP 404 at this tag and was not used.

Citation convention: a bare `file.cc:N` is a line in the pinned file of that basename (the table above). `S096:N` is `corpus/evidence/round-20/sources/html_form_element.cc` (sha-matched above).

## 2. respondWith preconditions (observed)

| Gate | Anchor | Failure (synchronous `InvalidStateError`) | Literal quote |
|---|---|---|---|
| G0 exposure | `submit_event.idl:12-13` | none in C++; member is `RuntimeEnabled=WebMCP` | `[CallWith=ScriptState, RaisesException, RuntimeEnabled=WebMCP] void respondWith(Promise<any> agentResponse);` |
| G1 agent flag | `submit_event.cc:70-76` | agent flag must be true | `if (!agent_invoked_) {` then "You can only call respondWith on an submit event that has agentInvoked == true." |
| G2 cancel | `submit_event.cc:77-82` | `preventDefault()` must already have been called | `if (!defaultPrevented()) {` then "To call respondWith, you must first call preventDefault." |
| G3 dispatch | `submit_event.cc:83-89` | must be inside dispatch | `if (!IsBeingDispatched()) {` then "To call respondWith, the event must be currently being dispatched." |
| Store (success) | `submit_event.cc:90-91` | no duplicate-call guard | `respond_with_promise_ = std::move(script_promise);` and `respond_with_script_state_ = script_state;` |

Gate order matters for the message: a call that fails both G1 and G3 reports the G1 text.

Definitions the gates depend on:
- `agent_invoked_` is set only in the constructor, from the init dictionary: `agent_invoked_(event_init && event_init->agentInvoked()) {}` (`submit_event.cc:22-24`). Default is false: `bool agent_invoked_ = false;` (`submit_event.h:93`), and `[RuntimeEnabled=WebMCP] boolean agentInvoked = false;` (`submit_event_init.idl:9`).
- G2 reads `bool defaultPrevented() const { return default_prevented_; }` (`event.h:262`). `preventDefault()` is declared virtual at `event.h:263`; its body was not opened.
- G3 reads `bool IsBeingDispatched() const { return eventPhase() != PhaseType::kNone; }` (`event.h:285`). `PhaseType::kNone = 0` (`event.h:66-67`).
- The G3 window: `event_dispatcher.cc:298` is the first `SetEventPhase` in the file (`kCapturingPhase`). `DispatchEventPostProcess` (`:377`, invoked from `Dispatch()` at `:269`) sets `kNone` at `:385` (`// 7. Set event's eventPhase attribute to NONE.`).
- IDL exposure: `Exposed=Window` (`submit_event.idl:8`). The IDL declares no `[SecureContext]`. The IDL's spec link (`submit_event.idl:5`) is the HTML SubmitEvent section; no respondWith spec text was opened, so no spec claim is made.

Caller side (S096, same tag):
- `S096:720-722`: `declarative_webmcp_call = active_webmcp_tool_ && active_webmcp_tool_->CurrentlyRunning();`, computed before validation.
- `S096:729-759`: validation failure takes the `CallDoneCallback` path at `:756-758`. No `SubmitEvent` is created on that path, so respondWith cannot be reached.
- `S096:769-772`: `if (declarative_webmcp_call) { CHECK(RuntimeEnabledFeatures::WebMCPEnabled(GetExecutionContext())); submit_event_init->setAgentInvoked(true); }`. This is the only setter in S096. Setters elsewhere in Blink were not searched.
- `S096:773-776`: `SubmitEvent` is created and dispatched synchronously; `should_submit = DispatchEvent(*submit_event) == DispatchEventResult::kNotCanceled;`.

## 3. Synchronous vs asynchronous

| Stage | Sync or async | Anchor |
|---|---|---|
| Gate checks G1-G3 and throw | synchronous, at call | `submit_event.cc:70-89`; `RaisesException` at `submit_event.idl:13` |
| Store promise; `respondWith` does not await | synchronous, returns `void` | `submit_event.cc:90-91` |
| Submit/no-submit decision | synchronous, from dispatch return value | `S096:775-776` |
| Take (one-shot move; `nullopt` if promise empty, no script state, or context invalid) | synchronous, immediately after dispatch | `submit_event.cc:94-106`; `S096:790` |
| Register reactions with `Then` (`PromiseResult` is `STACK_ALLOCATED`) | synchronous registration | `submit_event.h:45-46`, `:55-61`; `S096:798-806` |
| Promise settles, then `HandleWebMcpToolResponse` | asynchronous | `submit_event.h:64-70`; `S096:290-327` |
| Late response after tool stopped running | dropped on the async path | `S096:294-297` |
| Canceled, no stored promise | synchronous error completion | `S096:807-813` |
| Not canceled | synchronous navigation completion with `base::ok(String())` | `S096:818-830` (`:829`) |
| Re-entrant submit from inside a submit listener | returns early, no second event | `S096:638` (`in_user_js_submit_event_`) |
| Tool stopped running during dispatch | take and `Then` block skipped; stored promise never observed | `S096:787-789` |

Key distinction: the gate decision and the submission decision are synchronous; the tool result is asynchronous. A stored promise implies a canceled dispatch, asserted by `S096:794`: `CHECK(!should_submit);`.

Source comment on the promise getter (`submit_event.h:42-44`), quoted in part: "must be executed using the script_state also returned by the getter, and not with any other script_state." The source calls this a cross-world security leak.

## 4. Findings (source-scoped; none runtime-observed)

- **F1, last successful call wins, no error.** `submit_event.cc:90-91` has no "already called" check. A second call that passes G1-G3 overwrites the stored promise. The caller takes once (`S096:790`). Untested.
- **F2, the agent flag is settable from script.** The public constructor `constructor(DOMString type, optional SubmitEventInit eventInitDict = {});` (`submit_event.idl:10`) reads `agentInvoked` from the init dictionary (`submit_event_init.idl:9`, WebMCP-gated) into `agent_invoked_` (`submit_event.cc:24`). `submit_event.cc` has no `isTrusted` or other trust check (grep: no match). So a script-built `SubmitEvent` with `agentInvoked: true` passes G1. With `cancelable: true` (needed for `preventDefault()` to take effect; DOM semantics, `Event::preventDefault` body not opened), a listener on its own `dispatchEvent` passes G2 and G3. In S096 the stored promise is consumed only at `S096:790` (`TakeRespondWithPromise` is grep-confirmed there alone; other Blink callers not searched), which runs only for events created inside `PrepareForSubmission` (`S096:773-790`). Consequence: a successful `respondWith` on such an event is not evidence that a tool result was delivered. [INFERENCE from source. Default handling of a script-dispatched submit event was not opened. Untested.]
- **F3, one error text, two causes.** `TakeRespondWithPromise()` returns `nullopt` both when respondWith was never called and when `ContextIsValid()` is false at take time (`submit_event.cc:96-97`). The caller reports both as "it called preventDefault() ... without also calling respondWith()" (`S096:807-813`). Reachability of the invalid-context branch is not established. [INFERENCE.] This bears on the wording of LC11's condition (span 787-815), for the scribe to decide.
- **F4, async-timing boundary open.** The G3 window closes at `event_dispatcher.cc:385`. Whether a microtask continuation (an `await` on an already-resolved promise) inside a listener falls inside the window depends on when V8 microtasks are checkpointed relative to the listener's return. Sourced so far:
  - `js_based_event_listener.cc:69` `JSBasedEventListener::Invoke` calls `InvokeInternal` at `:189`.
  - `js_event_listener.cc:46` `JSEventListener::InvokeInternal` calls `event_listener_->InvokeWithoutRunnabilityCheck(...)` at `:58`. The V8EventListener body was not opened.
  - `V8RunMicrotasksScope` appears at `v8_script_runner.cc:497` (in `RunCompiledScript`, `:469`), `:789` (in `CallAsConstructor`, `:761`), and `:838`. Its definition and exit semantics were not opened.
  - **UNKNOWN in this scope.** Macrotask continuations (`setTimeout`, network callbacks) run after the synchronous dispatch and fail G3 by the window definition. [INFERENCE; assumes no nested event loop runs inside dispatch, which was not analyzed.]
- **F5, pass-through guard.** Taking the promise is skipped if the tool stopped running during dispatch (`S096:787-789`). A stored promise is then silently dropped. [Derived from `S096` control flow.]

## 5. Unknowns and not opened

- `V8RunMicrotasksScope` definition and exit semantics; `V8EventListener::InvokeWithoutRunnabilityCheck` body. Closes F4.
- Generated bindings for `respondWith`: `ScriptPromise` conversion of non-promise arguments, and how `RuntimeEnabled` installs the member.
- `Event::preventDefault()` body (cancelable gating).
- `HTMLFormElement` default handling of a script-dispatched `submit` event.
- `ScriptState::ContextIsValid()` semantics.
- Any other `setAgentInvoked` or `TakeRespondWithPromise` caller in Blink. Only S096 was searched.
- Runtime behavior of any of the above on Chromium 154 is not claimed. No browser was launched.

## 6. Cross-references (no edits made)

- LC10 (`S096:320-327`), rejected promise: text "respondWith promise was rejected" at `S096:326`. Consistent with section 3.
- LC11 (`S096:787-815`), preventDefault without respondWith: see F3 for condition wording.
- LC08 (`S096:290-298`), late response ignored: `S096:294-297`. Consistent.
- LC12 (`S096:818-830`), null String sentinel: `S096:829`. Consistent.
- No change proposed to `decisions.json`, the knowledge note, or any row. Admission is the scribe's call.

## 7. Verification and ledger

- Verified: pinned fetch (sha256 and line counts in section 1); S096 sha256 equals the design pin; HEAD equals the baseline.
- Not run: builds, tests, formatters, browsers (per contract).
- Suggested for main: re-derive the sha256 values in section 1 with the recipe; resolve the S096 untracked status before admission (QUALITY 28); decide F2 and F4 test design before any runtime claim.
- Isolation: this seat's only write is this report. Before-write snapshot: `git status --porcelain=v1 -uall` was 42 lines (stored at `local://status-before-SourceSubmitEvent.txt`). Main should diff against a fresh snapshot; the expected delta is this file alone, plus concurrent sibling writes.
