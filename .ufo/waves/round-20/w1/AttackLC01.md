# AttackLC01: LC01 `toolautosubmit` presence sets `require_submit_button`

Seat: `TabiR20.AttackLC01` (leaf reviewer, source-only). No subagents. No clone assigned, so no commit. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

Pin: `corpus/evidence/round-20/sources/html_form_element.cc`, sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines. Matches `design.json` `source.sha256` (checked with `sha256sum`/`wc`). Span attacked: `S096:181-186`.

Axes attacked: (A) outcome overreach, (B) timing of the presence sample, (C) evidence class (comment, identifier, counter, runtime scope), (D) quote and row precision.

## 1. Verdict

The narrow claim holds, and I agree with `SourceLC01.md` on it. `S096:181-182` is the only write to the flag: `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);`. Nothing else in the file assigns it, and `FillFormControls` takes it by value (`S096:234`). ConnPlanner's wording "toggles submit button requirement and controls use counter" (`ConnPlanner.md:43`) is acceptable as a derivation.

The claim breaks when its wording moves from "sets the flag" to "decides the path, the submission, or the completion." Two corrections to `SourceLC01.md`: its two-line quote is not a literal substring of the file (section 6.3), and its caveat 1 relies on an unregistered header (section 6.2).

## 2. Branches that consume the flag

| Site | Test | Effect | Notes |
|---|---|---|---|
| `S096:183-185` | `!require_submit_button` | `UseCounter` `kModelContextExecuteDeclarativeAutosubmit` | recorded before fill (`192`) |
| `S096:192`, `234` | passed by value | none | never reassigned |
| `S096:251-256` | `!*submit_button && require_submit_button` | returns `kMissingRequiredSubmitButton` | returns before running state (LC03) |
| `S096:212-217` | `if (require_submit_button)` | `submit_button->Focus()`, `PauseExecution()` | non-null only because `251-256` returned first; no completion signalled (LC04) |
| `S096:218-221` | else | `PrepareForSubmission(nullptr, submit_button)` | immediate (LC05) |

Outside `ExecuteTool`, presence has one more effect. `AttributeChanged` re-registers the tool (`S096:1130-1135`, posted at `402-406`). The cached copy is compared at `S096:437`, and a change cancels an in-flight call at `448-452`.

## 3. Primary false stronger claim: "human-gated"

Claim (already circulating): "Without `toolautosubmit`, declarative WebMCP requires human UI interaction, and only a user submit completes the call." Source: `ConnPlanner.md:102` ("pauses the agent and requires human UI interaction") and `:46` ("do not complete autonomously").

Why the source defeats it:

- A paused call completes by script. `submitFromJavaScript` (`S096:834-841`) calls `CallDoneCallback(base::ok(String()))` on any running tool. It runs no validation and dispatches no submit event. A formdata handler may still run (`S096:945`). The comment at `837-838` says "from inside a submit handler," but the code has no such guard. `requestSubmit` (`S096:850-872`) reaches `PrepareForSubmission` from script as well. That `form.submit()` binds to `submitFromJavaScript` is inferred from the name and the comment [INFERENCE: binding is outside S096].
- A paused call also ends by `CancelTool` (`224-229`, invoked outside S096), by `reset()` (`1084-1104`, unless the reset event is cancelled), and by invalid-form or definition-change cancellation (`380-396`, `448-452`). Toggling `toolautosubmit` while paused triggers the last one through `1130-1135`.
- `PauseExecution` is called at `216-217` but not defined in S096. The source shows no user-confirmation UI. "Pauses the agent" is a reading of the method name [INFERENCE].
- No runtime covers this branch. The r19 note excludes it (`corpus/knowledge/webmcp-declarative-validation-round-19.md:17-20`, "Not claimed: ... forms without `toolautosubmit`"). `ScribeFrontier.md` F3 finds no r17-r19 harness that invokes a declarative tool without it.

Acceptable wording: "Without `toolautosubmit`, ExecuteTool focuses the submit button and calls `PauseExecution` without signalling completion (S096:212-217). Within S096, the call then ends only through a later event: a submit through `PrepareForSubmission`, a script `form.submit()` or `requestSubmit()`, cancel, reset, or a definition change (S096:834-873, 224-229, 1084-1104, 448-452). S096 does not establish that a human acts."

## 4. Secondary false stronger claim: "autosubmit means submitted and succeeded"

Claim: "With `toolautosubmit` the form is submitted and the call succeeds." Basis a reader would reach for: the comment at `S096:219` ("we immediately submit the form") and the r17/r19 runtime completions.

Why the source defeats it:

- Some paths send no callback. `PrepareForSubmission` returns silently when there is no frame, `is_submitting_`, or `in_user_js_submit_event_` (`637-640`). It returns when the form is not connected (`642-648`) and when the frame is sandboxed without `allow-forms` (`650-660`). It also returns, flag-gated, on an unclosed form control (`663-682`). In each case the call stays running and no callback fires on this path. Cancel, reset, definition change, or a script submit can still end it (`224-229`, `1084-1104`, `448-452`, `834-841`).
- Validation can fail, which yields `kToolInvocationFailed` (`729-758`). `novalidate` skips validation (`713`, `1457-1458`), and so does `formnovalidate` on the submitter (`715`).
- A submit event cancelled without `respondWith` yields an error (`807-813`). A `respondWith` promise that rejects or fails to stringify also yields an error (`298-327`).
- The success callback (`829`) follows `ScheduleFormSubmission` unconditionally. `ScheduleFormSubmission` returns without navigating at `885-887`, `893-899`, `901-908`, `910-912`, `937-942`, `946-952`, `962-963`, `964-977` (sandbox), `979-991` (CSP on a javascript: action), `1003-1004`, and `1018-1019`. So `ok(String())` can be reported with no navigation. The r19 note already says "a source return is not evidence of completed navigation" (`webmcp-declarative-validation-round-19.md:129-131`).
- Within S096, a script `form.submit()` (`834-841`) reports `ok` even when the sandbox return at `964-977` stops the navigation. This is a call-chain reading and is untested.

Acceptable wording: "With `toolautosubmit`, ExecuteTool calls `PrepareForSubmission` immediately (S096:218-221). The result depends on validation, the submit event, and `ScheduleFormSubmission` (S096:729-829). Some early returns send no callback (S096:637-682). A success callback means validation passed or was skipped, the submit event was not cancelled, and scheduling was attempted (S096:729, 761-776, 818-829). It is not evidence that navigation happened."

## 5. Other false claims

| # | False stronger claim | Source defeat | Acceptable wording |
|---|---|---|---|
| S1 | Presence makes the submit button irrelevant | the button is tracked and its pseudo-state set on both paths (`205-209`), passed as submitter (`220`, `765`), and its `formnovalidate` skips validation (`715`) | `toolautosubmit` disables the missing-button error (`251-256`). A found button is still the submitter (`220`). |
| S2 | The flag follows the registered copy, or follows later attribute changes | read once at entry (`182`). The cached copy is read only at `437` (set at `416-417`, `458`). Changes re-register by posted task (`1130-1135`, `402-406`) and cancel an in-flight call outside submit handling (`448-452`) | The flag is read from the form at ExecuteTool entry (S096:181-182). A later change re-registers the tool and can cancel the in-flight call (S096:1130-1135, 402-406, 448-452). It does not re-decide that call's branch. |
| S3 | The autosubmit use counter counts autosubmit submissions | the counter at `183-186` precedes fill (`192`). It is counted when fill errs (`196-198`), when validation fails (`756-758`), and when preventDefault errs (`807-813`) | Records that ExecuteTool started on a form with `toolautosubmit` (S096:183-186). Does not record submission or success. |
| S4 | The value matters, for example `toolautosubmit="false"` disables autosubmit | presence test only; the value is not read at `182` | Presence of `toolautosubmit`, any value, selects the autosubmit branch (S096:182). FastHasAttribute semantics are outside S096. |
| S5 | The TODO shows autosubmit gating is unfinished, or keyed on `autosubmit` | the TODO (`201-203`) describes what `212-221` already do. It spells `autosubmit`, while the test is `kToolautosubmitAttr` (`182`) | S096:201-203 is a comment naming `autosubmit`. The executed gate is `kToolautosubmitAttr` (S096:182). |
| S6 | Validation failure is autosubmit-specific (r19:40-42) | `729-759` runs for any running declarative call, including a user submit after pause | The r19 fixtures observed this error on autosubmit forms only (`ScribeFrontier.md` F3). S096:729-759 applies the same branch to any running call. The non-autosubmit path is untested. |
| S7 | The comment at `219` proves submission | `220` calls `PrepareForSubmission`. The outcome is decided at `637-829` | ExecuteTool calls `PrepareForSubmission` immediately (S096:220). The comment at `219` is not evidence of submission. |

## 6. Evidence-class traps

1. **Name.** The design topic and `ConnEvidence.md:37` say "autosubmit." The attribute is `toolautosubmit`. In-body spellings are comments (`213`, `219`) and one string literal (`254`, "for a form without `toolautosubmit`"). `html_names::kToolautosubmitAttr` is a generated identifier. Its mapping to the literal is outside S096. `SourceLC01.md` caveat 2 reasons from the generated-name convention [INFERENCE]. Use `S096:254` as the in-body anchor.
2. **Out-of-body semantics.** FastHasAttribute's presence semantics are outside S096. `SourceLC01.md` caveat 1 cites `element.h:2822-2837`, which its own text says is not registered in `corpus/SOURCES.md`. Keep it out of the row. If the note cites it, register it first (evidence-pointer rule, `ScribeGate.md` F1) or mark it [INFERENCE]. UseCounter aggregation (per call or per page) is outside S096, so the row claims only that the call site runs. `PauseExecution`, `FormMCPSchema::SubmitButton()`, `HasToolautosubmit()`, and the `HTMLFormMcpTool` constructor are also outside S096.
3. **Quote form.** `SourceLC01.md`'s two-line quote (`bool require_submit_button = !form_->FastHasAttribute(...)`) is not a literal substring of the file. Line 181 ends at `=`, so a regex or `grep -F` over the joined text finds nothing. The one-line string at line 182 occurs exactly once. Use it as the manifest quote, so byte-literal and whitespace-normalised checks both pass. An optional second quote is `bool require_submit_button =` (`S096:181`).
4. **Comments versus code.** The TODO (`201-203`), `213-214` ("tell the agent to allow user input"), `219` ("we immediately submit the form"), `827-828` ("indicate that a navigation has been triggered"), and `837-838` ("from inside a submit handler") each say more or less than the code at those lines does. Cite code, not comments.
5. **Runtime scope.** The r17 and r19 fixtures are autosubmit only (`webmcp-declarative-validation-round-19.md:16`, `:19-20`; `ScribeFrontier.md` F3). `ConnEvidence.md:66-67` credits runtime to "LC01 (present)." Those receipts observe submission outcomes, which belong to LC05. The flag itself has no runtime observation.
6. **Timing word.** `ScribeFrontier.md:43` says "becomes true." The flag is set at entry, not by a transition. Use "is true when ExecuteTool starts."
7. **Window.** The flag is sampled at `182`. `FillFormControls` then runs inside a `CEReactionsScope` (`191-194`), whose reactions drain at scope exit, before the branch at `212`. Script in that window could change the attribute, but the branch uses the captured value. Whether any fill path runs script is outside S096: `FillData` is in `form_mcp_schema.cc` (S077), not S096. The CEReactions drain timing is also outside S096 [INFERENCE].

## 7. Recommended LC01 wording (exact)

Skill row (no pipe inside cells):

`| LC01 | toolautosubmit present on the form when ExecuteTool starts, any value; read once | require_submit_button false and autosubmit use counter recorded; absent gives true | S096:181-186 |`

Manifest object (for `corpus/evidence/round-20/lifecycle/decisions.json`, not yet present):

```json
{"id":"LC01","condition":"toolautosubmit present on the form when ExecuteTool starts, any value; read once","outcome":"require_submit_button false and autosubmit use counter recorded; absent gives require_submit_button true","startLine":181,"endLine":186,"quote":"!form_->FastHasAttribute(html_names::kToolautosubmitAttr);"}
```

Design topic (`design.json:27`), replacement: `toolautosubmit presence sets require_submit_button false at ExecuteTool entry`.

Note sentence (knowledge note):

"`require_submit_button` is `!form_->FastHasAttribute(html_names::kToolautosubmitAttr)`, evaluated once when ExecuteTool starts (S096:181-182). Presence on the form element selects false, whatever its value; the value is not read at this site (FastHasAttribute semantics are outside S096). The flag then selects the missing-button error (S096:251-256), the focus-and-pause branch (S096:212-217), or the immediate PrepareForSubmission call (S096:218-221). The flag does not by itself decide the call's result. The result comes from later events (S096:224-229, 729-829, 834-873, 1084-1104, 448-452). Source-only: the non-autosubmit branch has no runtime observation."

## 8. Cross-lane items (for integration; not LC01 claims)

- LC05 and LC02 rows: the silent returns at `637-682` leave the call pending. Do not write "submits" for LC05 without them.
- LC12: `ok(String())` at `829` and `841` is not navigation evidence (see section 4).
- ConnPlanner Branch A and B (`ConnPlanner.md:102-103`): "requires human UI interaction" and "do not complete autonomously" (`:46`) are contradicted by `834-841` and `872`. Branch B also puts cancel and reset (LC06, LC07) under "autonomous completion."
- Round-19 lesson row S078 (`corpus/lessons/round-19.md:34`) uses the `219` comment as its quote. A comment is not a behavior quote.
- `S096:216-217` and `S096:427-428, 462` call `ModelContextSupplement::modelContext(...)` with no null check in S096. Whether it can return null is outside S096. Flagged for the LC04 owner.
- `ScribeGate.md` F1: the retained body is untracked. Commit it before citing (QUALITY 28). I did not re-check this with git.

## 9. Limits

- Source-only. No build, browser, CDP, or fixture run. Nothing here is a Chromium 154 runtime claim.
- Early-return and sandbox reachability are source-level. Any browser-side refusal of sandboxed declarative tools is outside S096 and untested.
- The `form.submit()` to `submitFromJavaScript` binding is inferred [INFERENCE].
- I verified the round-20 pin hash only. The Gitiles base64 decoding and the round-19 gzip identity (reported by `SourceLC01.md`) are not re-verified here.

## 10. Changes

- Wrote this file only. No production edits. No tests, builds, or formatters. No tool installs or updates.
- Checks run: `sha256sum` and `wc -l` on the pinned body, `ls` on the w1 directory, `grep` over S096 and the w1 reports, and reads.

Report: `.ufo/waves/round-20/w1/AttackLC01.md`
