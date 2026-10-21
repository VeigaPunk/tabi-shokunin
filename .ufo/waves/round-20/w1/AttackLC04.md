# AttackLC04 — LC04 "non-autosubmit focus and PauseExecution, not completion"

Seat: TabiR20.AttackLC04 (reviewer, leaf; no subagent dispatch). Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Baseline c49929430d996b016dde2e3a3a5be380f3433fdb. Source-only attack: no runtime claim, no production edits, no tools installed or updated.

Span attacked: S096 `corpus/evidence/round-20/sources/html_form_element.cc:212-218` (design.json LC04). Body is 212-217; line 218 is the shared `} else {`.

## Verdict

S096:212-217 supports one statement: when `toolautosubmit` is absent and the fill succeeds, the source calls `submit_button->Focus()`, then `PauseExecution()`, and the branch itself calls no `CallDoneCallback`. The current topic text ("not completion") is defensible only at that level. Read as written, it invites a false stronger claim, "user-gated": the invocation waits for a user and completes only when the user submits. S096 defeats that claim (F1). A second conditional trap is that the branch decides from state captured before the fill, while page-reachable code can run during the fill (F2).

## Binding checks (before reading)

| Artifact | Check | Result |
|---|---|---|
| S096 `corpus/evidence/round-20/sources/html_form_element.cc` | sha256 | `8c8d6796…6916` equals design.json `source.sha256`; 1,740 lines |
| `corpus/evidence/round-19/sources/html_form_element.cc.gz` | decoded, `cmp` against S096 | byte-identical (same S078 body) |
| `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz` (S077) | decoded sha256 | `904b75e7…2152f`, equal to r19 knowledge line 1; read via spilled artifact, not written to the repo |
| `corpus/evidence/round-19/sources/WebMCP.pdl.gz` (S079) | decoded sha256 | `26e62f29…37ff`, equal to the S079 pin |
| `corpus/evidence/round-17..19` | negative lookahead `<form` with `toolname` and no `toolautosubmit` | 0 matches; positive control `<form[^>]*toolname` matches in the same paths |

## Branch map — ExecuteTool and bound paths (S096)

| Lines | Code | Consequence for LC04 |
|---|---|---|
| 181-182 | `require_submit_button = !FastHasAttribute(toolautosubmit)` | presence-only; read at entry, before the fill |
| 183-186 | autosubmit-only use counter | the pause path has no counter |
| 189-194 | `FillFormControls` inside `CEReactionsScope` | page-reachable code can run here (F2) |
| 196-198 | fill error returns; no running state | LC02, not LC04 |
| 204-210 | `is_currently_running_ = true`; active button; `:tool-form-active` and `:tool-submit-active`; `done_callback_` stored | set before the fork, for both branches |
| 212-217 | `Focus()`; `PauseExecution()` | LC04 body; no `CallDoneCallback` in this branch |
| 218 | `} else {` | shared with LC05 (218-221) |
| 220 | autosubmit: `PrepareForSubmission(nullptr, submit_button)` | LC05 |
| 249-258 | `FormMCPSchema` built (249); button chosen (250); missing-button error (251-256); `FillData` (258) | supplies the non-null invariant for 215 |
| 261-275 | `CallDoneCallback`: consumes `done_callback_` (263-266); only clearer of `is_currently_running_` (267) | every completion of a running invocation passes here; the fill-error return (197) runs the parameter callback before running state |

## F1 — BLOCKER: false stronger claim, "user-gated completion"

Claim to block: "Without `toolautosubmit` the invocation waits for the user. S096 focuses the submit button and pauses for user input, and the tool completes only when the user submits it."

Where this wording already exists in r19 material: `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:17` ("Thus no-autosubmit is user-gated after fill; autosubmit is not."); `.ufo/waves/round-19/w1/SrcChromeDeclDocs.md:81` ("pauses for user action"); `.ufo/waves/round-19/w2/Decision06.md:36` ("focuses/waits for user submission"); `.ufo/waves/round-19/w2/SourceS078.md:73` ("default-user-gated", labelled inference); `corpus/SOURCES.md:92` (S078 label "user-gated submission").

Why S096 defeats it:

1. **No user check exists.** S096 contains no user-activation, gesture, transient-activation, `IsTrusted`, or user-action test (zero grep hits). The only `activat*` token is `SetActivatedSubmit` at 1054, a submitter flag. `in_user_js_submit_event_` (638, 700) means "inside a page submit handler", not "a user".
2. **No wait exists.** Lines 213-214 are a comment. Lines 200-203 are a `TODO(masonf)` saying the fork "should" key off the attribute and "signal the agent to allow user input again". The code at 215-217 is two calls. Nothing in the branch waits, polls, or resumes.
3. **Completion is not user-gated.** Each of these ends the stored callback with no user action:
   - `form.submit()` → `submitFromJavaScript` (834-841): schedules a submission at 835, then `CallDoneCallback(base::ok(String()))` at 841 when the tool is running.
   - `requestSubmit()` (845-872) → `PrepareForSubmission` → success path (825-829).
   - `reset()` (1077-1104): if the reset event is not canceled (1084-1088), `CallDoneCallback(kToolCancelled)` at 1101-1104.
   - Form removed from a connected tree (`RemovedFrom` 518-523 → 380-396): synchronous `kToolCancelled` when not handling submit.
   - Attribute change to `toolname`, `tooldescription`, `tooltitle`, or `toolautosubmit` (1126-1136 → posted registration 402-407 → 433-437, 448-451): `kToolCancelled` "tool definition was updated" when not handling submit. Toggling `toolautosubmit` during the pause cancels it.
   - Agent-side abort: `CancelTool` (224-229; caller not retained).
4. **A user submit is not a clean completion.** Early returns with no callback: 638-640 (no frame, submitting, or inside a page submit handler), 642-648 (not connected), 650-660 (sandboxed), 663-682 (unclosed control, feature-gated). Error completions: validation failure (756-758) and `preventDefault()` without `respondWith()` (807-813). A `respondWith` promise settles later through `HandleWebMcpToolResponse` and is dropped if the tool is no longer running (290-297, 789-806). Only the uncancelled success path reaches 825-829.
5. **A user submit is labelled agent-invoked.** `declarative_webmcp_call = ... CurrentlyRunning()` (722) drives `setAgentInvoked(true)` (769-771) for any submit while the tool runs. S096 cannot tell a human submit from a script submit.
6. **The pause's effect is not in S096.** `PauseExecution()` is called on `ModelContextSupplement::modelContext(...)` (216-217); the method body is not retained. The retained CDP vocabulary has no paused state: `InvocationStatus` is `Completed | Canceled | Error` (WebMCP.pdl:25-30), and `toolResponded` is the only completion event.

Acceptable wording (replaces the LC04 outcome and narrative; source-only):

> When `toolautosubmit` is absent and the fill succeeds, S096 calls `submit_button->Focus()` and then `PauseExecution()` (lines 215-217). The branch does not call `CallDoneCallback`, so the callback stored at line 210 is not consumed there. S096 does not show what `PauseExecution()` does, whether focus moved, or that any user action follows. Other S096 paths end the stored callback: `CancelTool` (224-229), `reset()` (1101-1104), registration changes (388-396, 448-451), `PrepareForSubmission` outcomes (756-829), and `submitFromJavaScript` (839-841).

## F2 — HIGH: the branch decides from pre-fill state; page code can run during the fill

Claim to block: "The branch reflects the `toolautosubmit` attribute and the submit button as they are when focus and pause happen."

Facts:

- `require_submit_button` is evaluated at 181-182, before the fill (189-194), and is not re-read at 212.
- The submit button is selected at 249-250, before `FillData` (258). `ProcessForm` (S077:117-118, 1238-1248) chooses it and skips disabled and read-only controls (S077:1241) at selection time only.
- The fill can run page-reachable code before line 196. S077 call sites: `FillTextData` dispatches input and change (942, 946); number (958); checkbox (970, 973, 996, 999); radio (1013, 1016); select sends events (1029); custom-element fill enqueues a callback (1061), which the `CEReactionsScope` at S096:191-194 queues and flushes at scope exit. [INFERENCE: listener and flush semantics are callee behavior, not retained; standard DOM dispatch is synchronous.]
- During the fill, `done_callback_` is not yet stored (210), so `CallDoneCallback` returns at 263-265. Page code run during the fill can change the DOM and schedule submission, but it cannot complete the invocation.
- `submitFromJavaScript` calls `ScheduleFormSubmission` (835) before its running-state check (839). `ScheduleFormSubmission` (882-1042) guards on view, frame, connection, and entry-list construction (884-912), not on the tool's running state; no `CurrentlyRunning` appears in 882-1043. Since `is_currently_running_` is set only at 204, a submission scheduled during the fill is not tied to the tool, and the pause can begin with a submission already scheduled.
- Between 204 and 217 nothing re-checks connection, disabled state, the attribute, or running state. There is no check after `Focus()` (215) and before `PauseExecution()` (217).

Consequences to block:

- "The attribute at focus time decides": false. The decision is entry-time.
- "The focused button is the one now in the form": not shown.
- "The form is unsubmitted when the pause starts": not shown; a submission can be scheduled during the fill (above).

Acceptable wording: "`require_submit_button` is `!FastHasAttribute(toolautosubmit)` evaluated at entry (S096:181-182); the submit button is the one selected before the fill (S096:249-250); S096 does not re-read either after the fill (S096:189-217)."

## F3 — MEDIUM: the focus outcome is not evidenced

- `submit_button->Focus()` (215) has no return check and no focusability check. The same file says focusability needs fresh layout: "Needs to update layout now because we'd like to call isFocusable()" followed by `UpdateStyleAndLayout` (605-607, `ValidateInteractively`). The pause branch has no equivalent step. Whether `Element::focus()` does this internally is not retained.
- The file has focus-loss hooks at layout attach and detach (1112-1124, `FocusabilityLost()`), so focus can be lost independently of this branch.
- The non-null button at 215 holds only because `FillFormControls` returns `kMissingRequiredSubmitButton` before the fill when a required button is missing (251-256). Any LC04 wording that relies on the button must cite LC03 (249-256).
- Acceptable: "calls `submit_button->Focus()`; S096 does not show whether focus moved."
- Forbidden: "focuses the button for the user", "moves focus to", "the user sees the button focused".

## F4 — MEDIUM: comments and the TODO are intent, not behavior

- 200-203, `TODO(masonf)`: the fork "should" key off the attribute and "signal the agent to allow user input again". This marks the fork as provisional.
- 213-214: "tell the agent to allow user input, and wait for the user to submit it." This is a comment.
- The 22-word comment is the strongest literal quote in the span and must not be the LC04 outcome quote. Use the code, lines 215-217, which normalize to six whitespace-separated words.
- Line 216 dereferences `ModelContextSupplement::modelContext(...)` with no null check. Its results at 389 and 428 are dereferenced at 396, 453, and 462 without a null check. The non-null contract is not in S096.

## F5 — LOW: span boundary

LC04's span 212-218 ends on `} else {` (218), which is also LC05's first line (LC05 218-221). Recommend 212-217 for the body, or state the shared line explicitly.

## F6 — LOW: running and pseudo-state are set before the fork

Lines 204-209 set the running flag, the active button, `:tool-form-active`, and `:tool-submit-active` before the fork. `MatchesToolFormActivePseudoClass` (163-164) and `GetActiveWebMCPToolInvocationId` (167-171) expose running state while paused. "Not running", "not active", or "no active state" for the non-autosubmit path is therefore false.

## F7 — EVIDENCE CLASS: no runtime evidence for this branch

- Round-17, -18, and -19 invocation-era evidence contains 0 declarative forms without `toolautosubmit` (negative lookahead; positive control matched).
- Round-16 has non-autosubmit forms (`declarative-form.html`, `lifecycle.html`; probe form `f-nosubmit`, `.ufo/waves/round-16/probes/WebmcpProbeDeclarative.mjs:133-135`). They cover registration, schema, and removal events only (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-62`). None observes a paused invocation or its cancellation.
- r19 statements of record: `corpus/knowledge/webmcp-declarative-validation-round-19.md:17-20` ("Not claimed: … forms without `toolautosubmit`"); `corpus/README.md:409-410`; `.ufo/waves/round-19/w1/ScribeReadme.md:57, 63-64` ("non-autosubmit submission is untested"; "no non-autosubmit sample was measured").
- LC04 stays source-only. Do not describe it as runtime-held, measured, or observed.
- The only use counter on this path is `kModelContextExecuteDeclarativeAutosubmit` (183-186). Counter data cannot show non-autosubmit usage.

## F8 — INFO: conflicting r19 phrasing

`.ufo/waves/round-19/w1/SrcHtmlFormTool.md:27` says `form.submit()` "resolves an active tool with an empty string." S096:841 passes `base::ok(String())`, which S096:827-828 documents as the null-String navigation sentinel. The r19 knowledge note (lines 129-131) supersedes the empty-string reading. Use "null String sentinel" (LC12 domain).

## Exact wording for the LC04 row

Row (SKILL rendering; no pipes in cells):

```
| LC04 | toolautosubmit absent and fill succeeded | calls submit_button->Focus() then PauseExecution(); this branch calls no CallDoneCallback | S096:212-217 |
```

Manifest entry: startLine 212, endLine 217; quote, whitespace-normalized literal, six words: `submit_button->Focus(); auto* context = ModelContextSupplement::modelContext(form_->GetDocument()); context->PauseExecution();`

Do not use the bare phrase "not completion". It reads as "never completes", which F1 defeats. Use "does not itself complete the invocation (no CallDoneCallback in this branch)".

## Forbidden phrasings

- "user-gated", "waits for the user", "pauses for user input or action", "completes only when the user submits".
- "focuses the submit button for the user", "moves focus", "the user can see it focused".
- "PauseExecution pauses the agent or page", "the agent is told to allow input".
- "the attribute or button at focus time".
- "`toolautosubmit=false` disables autosubmit" (presence-only; LC01 owns this, but LC04 depends on it).
- "measured", "observed", "runtime", or "Chromium behaves" for this branch.
- "not running" or "no active state" for the pause.
- "empty string" for completion results.

## Verification gaps (not retained, not verified)

1. Blink `Element::focus()`: whether focus events dispatch synchronously, and the behavior for disconnected, hidden, or disabled elements. This gates the F2 and F3 ordering claims. Suggested source for the next wave: `third_party/blink/renderer/core/dom/element.cc` at tag 154.0.8037.97. Not fetched; outside the assigned scope.
2. `ModelContext::PauseExecution()` body and the non-null contract of `ModelContextSupplement::modelContext`.
3. `CEReactionsScope` flush timing when `ExecuteTool` is nested in another CE scope. Its caller, `ModelContext::ExecuteDeclarativeTool`, is not retained.
4. `FormMCPSchema::SubmitButton()`, `IsSuccessfulSubmitButton()`, and `CurrentlyRunning()` / `IsHandlingSubmit()`. These are used but not defined in retained material.
5. `frame->ScheduleFormSubmission` (S096:1042): whether the navigation is deferred.
6. Runtime: none. Everything here is source-only.

## Residual risk

Low for the 215-217 wording as proposed. High for any "user-gated", "pending until user", or "focused for the user" phrasing; S096 defeats each. F2 remains open until the Blink focus and dispatch semantics are retained.

Report: .ufo/waves/round-20/w1/AttackLC04.md
