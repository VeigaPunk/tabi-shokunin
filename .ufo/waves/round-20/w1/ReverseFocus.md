# ReverseFocus — S096 focus/PauseExecution branch (round 20, wave 1)

Seat: TabiR20.ReverseFocus (revenger). Date: 2026-10-21.
Scope: SOURCE-ONLY reading of S096 `corpus/evidence/round-20/sources/html_form_element.cc`
(Chromium 154.0.8037.97, `third_party/blink/renderer/core/html/forms/html_form_element.cc`).
No runtime, capability, or host-behavior claim. Untested by construction (no execution).

Pin re-derived at write time:
`sha256sum` → `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
(matches `design.json` `source.sha256`); `wc -l` → 1740. All cites `S096:<line>`.
All findings below are OBSERVATION unless marked [INFERENCE] or UNKNOWN.

## 1. Reconstructed contract — `HTMLFormElement::HTMLFormMcpTool::ExecuteTool` (S096:174-222)

Declarative WebMCP form tool invocation; the branch under study is decision LC04 (S096:212-218).

1. S096:181-182 — `require_submit_button = !FastHasAttribute(kToolautosubmitAttr)` (LC01).
2. S096:189-194 — `FillFormControls(input_arguments, require_submit_button, &submit_button)`
   inside `CEReactionsScope`; local `submit_button` initialized `nullptr` (S096:187).
3. S096:196-198 (LC02) — any fill error returns the error through the **local**
   `done_callback` and returns **before** any running state is set.
4. S096:204-210 — only on success: `is_currently_running_ = true` (204),
   `active_submit_button_ = submit_button` (205), `:tool-form-active`/`:tool-submit-active`
   pseudo-state notifications (206-209), `done_callback_ = std::move(done_callback)` (210).
5. S096:212-218 (LC04, this assignment) — non-autosubmit branch:
   - S096:215 `submit_button->Focus();`
   - S096:216-217 `ModelContextSupplement::modelContext(...)->PauseExecution();`
   - The branch does **not** complete the tool: no `CallDoneCallback`, the callback stays
     stashed (210). "not completion" in LC04 is accurate.
6. S096:218-220 (LC05) — autosubmit branch: `PrepareForSubmission(/*event*/ nullptr, submit_button)`.

## 2. The missing-submit-button invariant — holds, intra-procedurally

**Claim:** the unchecked dereference at S096:215 (`submit_button->Focus()`) is sound, and its
soundness rests entirely on an earlier error return in a different function.

Proof chain, all observable in S096:
- S096:250 — `*submit_button = mcp_schema.SubmitButton();` (sole resolution of the out-param).
- S096:251-256 (LC03) — `if (!*submit_button && require_submit_button)` returns
  `kMissingRequiredSubmitButton`: *"No submit button was found, but for a form without
  `toolautosubmit`, there must be a submit button"*.
- S096:196-198 — that error is returned to the agent before `is_currently_running_ = true`
  (204), before the pseudo-states (206-209), before `done_callback_` capture (210), and
  before `Focus()`/`PauseExecution()`. Error path runs `FillData` never.
- `require_submit_button` is a function-local fixed at S096:181-182, passed **by value** at
  S096:192, and the same local is tested at S096:212. `SubmitButton()` is called once (250).
  No mutation of either between check and use.

Therefore: reaching S096:215 with `require_submit_button == true` implies
`submit_button != nullptr`. **Intent and outcome agree on button existence** — the branch's
assumption ("we focus the submit button") is discharged by the LC03 error, not by any check
at the branch itself. Confidence: high (single-file, closed chain).

Scope limits of the invariant:
- It is intra-procedural to `ExecuteTool`+`FillFormControls`. Nothing outside S096 is relied on.
- It guarantees **existence**, not **focusability** (§3).
- Null-guard asymmetry (S096:207-209): the pseudo-state update guards `if (submit_button)`,
  because in the autosubmit branch a null button is legal and un-errored (251 errors only
  under `require_submit_button`); S096:220 then calls `PrepareForSubmission(nullptr, nullptr)`
  is reachable with a null submitter. This guard is absent at 215 — correctly, per the
  invariant, but the asymmetry is real and load-bearing.

## 3. UI focus failure — intent vs outcome divergence

**Intent** (author's words, S096:213-214): *"we focus the submit button, tell the agent to
allow user input, and wait for the user to submit it."*

**Outcome** (code shape, S096:212-218):
- S096:215 is a fire-and-forget void-context call. No result is consumed, no fallback branch,
  no state records whether focus moved. S096 does not define `Element::Focus()`; that
  [INFERENCE] focus requests can silently no-op (unfocusable button — hidden, disabled,
  not rendered; page not focused) is external semantics, but the **unchecked shape** is
  directly observed here.
- S096:216-217 run **unconditionally** on the next lines. `PauseExecution()` executes
  whether or not the focus intent was realized.
- The full waiting state was already entered **before** the focus attempt: running flag
  (204), active button (205), pseudo-states (206-209), callback stash (210). A failed focus
  leaves the tool fully in its running/waiting lifecycle state.

**Divergences (intent ≠ outcome):**

| # | Intent (comment) | Outcome (code) | Class |
|---|---|---|---|
| D1 | "we focus the submit button" — stated as an effect | only a focus **request**; no success channel; no completion path anywhere in S096 is keyed on focus state (every `CallDoneCallback` site is cancel 226, respondWith 308/319/324, definition-update 391/449, validation 756, submission 829/841, reset 1102) | OBSERVATION (shape) + [INFERENCE] (Focus no-op semantics) |
| D2 | ordering "focus … and **then** signal the agent" implies a meaningful sequence | 215→216→217 are consecutive with no state re-check between; PauseExecution is not conditioned on focus outcome; a cancel completed during the window would not be re-detected before pausing — event/mutation timing inside `Focus()` is external to S096, so the hazard is [INFERENCE] from ordering, timing itself UNKNOWN | [INFERENCE] |
| D3 | "wait for the user to submit it" implies the wait is bounded by the affordance | no timeout or focus-state poll exists in S096; if the user never submits and nothing cancels, the paused/running state has no in-file bound. Resume counterpart to `PauseExecution` appears nowhere in S096 (grep: no `ResumeExecution`) — UNKNOWN, external to this source | OBSERVATION (absence in-file) + UNKNOWN |
| D4 | comment S096:201-203 (TODO(masonf)) says key off the "`autosubmit`" attribute | code keys off `toolautosubmit` (S096:182; also 417, 1133). Literal token drift between comment and attribute name; whether `autosubmit` ever named a distinct attribute is UNKNOWN from S096 | OBSERVATION (token mismatch) + UNKNOWN |

**In-file contrast** — the same file treats focusability as fallible elsewhere: the
interactive-validation abort path updates layout "because we'd like to call isFocusable()"
(S096:605-607), focuses only controls passing `ValidationAnchorOrHostIsFocusable()`
(610-617), and console-warns *"An invalid form control with name='%name' is not focusable"*
for the rest (618-627). The WebMCP focus branch (212-218) performs no analogous check —
the lane's §3 outcome is a deliberate narrowing vs the file's own convention elsewhere.

## 4. What actually ends the wait (post-PauseExecution completion surface)

All in S096; these are the only exits from the state entered at 204-217:
- User submit → `PrepareForSubmission` → after `ScheduleFormSubmission`,
  `CallDoneCallback(base::ok(String()))` — a **null String sentinel meaning "navigation
  triggered"**, not JSON null (S096:824-830, LC12).
- Manual `form.submit()` from a submit handler → same `ok(String())` (S096:838-842).
- Implicit submission (Enter) → `PrepareForSubmission(&event, nullptr)` (S096:587-589).
- Interactive-validation failure → `CallDoneCallback(kToolInvocationFailed, "Form
  validation failed: …")` (S096:756-758); separately the browser focuses the first focusable
  invalid control and shows its message (S096:610-617) — the only path where the file itself
  moves focus with a focusability precondition.
- Cancellation: abort signal (S096:224-229, LC06), tool-definition update/unregister unless
  `IsHandlingSubmit()` (S096:390-396, 448-454; submit in-flight guard set at 725-727), form
  reset (S096:1101-1104).
- `respondWith` promise settle → success/serialization-failure/rejection handling
  (S096:295-327; late response ignored when no longer running, 295-297, LC08).

## 5. Unknowns (not answerable from S096)

1. `Element::Focus()` success semantics (S096 neither defines nor checks it).
2. `ModelContextSupplement::PauseExecution()` behavior and its resume counterpart.
3. `FormMCPSchema::SubmitButton()` selection criteria — whether a hidden/disabled button can
   be returned (would make D1's focus no-op reachable even with a "found" button).
4. Whether the TODO's `autosubmit` (D4) ever named a different attribute than `toolautosubmit`.

## 6. Verdict for the round

- LC04 span (S096:212-218) and its gloss "focus and PauseExecution, not completion":
  **reconstructed as written**; the branch neither completes the tool nor surfaces focus
  failure. Supports C1's source-only scope.
- Missing-submit-button invariant: **sound**, by LC03's early error return (250-256 →
  196-198); guaranteed only intra-procedurally and only for existence.
- UI focus failure: **real intent/outcome divergence** — the lifecycle enters its paused
  waiting state unconditionally; focus is best-effort UI affordance with no detection,
  compensation, or agent-visible outcome on failure.

Untested: source-only reading; no command beyond `sha256sum`/`wc -l`/`grep -n` line anchors
over the pinned file. Tools installed/updated: none.

— TabiR20.ReverseFocus · trailer relative to lane root:
`.ufo/waves/round-20/w1/ReverseFocus.md`
