# SemanticLC04: round 20 LC04 predicate and effect (source-scoped)

Scope: LC04 in `corpus/evidence/round-20/lifecycle/decisions.json` (lines 35-42), `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (row line 32; limits line 13; checklist line 60; history line 76), and `SKILL.md` (row line 2220; usage rule line 2232; limits lines 2236-2237).
Anchor: `corpus/evidence/round-20/sources/html_form_element.cc:212-218` (S096), revision 4ae99816b8994fdedc159156d8d9d242dd5c4782. Source-only. No runtime claim is made or checked.

## Anchor checks (read-only)

- Retained body sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` equals `decisions.json` `source.sha256`.
- `git show 4ae99816…:corpus/evidence/round-20/sources/html_form_element.cc | sha256sum` gives the same digest. HEAD is 4ae99816…. The three target files have no working-tree changes.
- `corpus/evidence/round-19/sources/html_form_element.cc.gz` decompresses to the same digest, so S078 bytes equal S096 bytes.
- Not re-fetched here: the tag-to-bytes binding for Chromium 154.0.8037.97. It is carried from the note's own verified-at line.
- File length: 1740 lines.

## Source facts used

- **181-182:** `require_submit_button = !FastHasAttribute(toolautosubmit)`. This is a local computed once at entry. It is not reassigned in 174-222, and it reaches FillFormControls by value (call at 192, parameter at 234).
- **187:** `submit_button = nullptr`. It is written only through the out-parameter (192-193) and inside FillFormControls at 236 and 250.
- **196-198:** on error the callback runs and the function returns. Lines 204 onward are reachable only when there is no error.
- **204-210 (before the branch):** `is_currently_running_ = true`, `active_submit_button_ = submit_button`, form and submit pseudo-state notifications, and `done_callback_ = std::move(done_callback)`.
- **212-217 (the branch):** 215 `submit_button->Focus()`; 216 `modelContext(...)`; 217 `context->PauseExecution()`. Lines 212-218 contain no member write and no reference to the done callback.
- **251-256:** `!*submit_button && require_submit_button` returns kMissingRequiredSubmitButton before `FillData` (258). So a no-error return with require=true implies a non-null `submit_button`.
- **261-266:** CallDoneCallback checks only `done_callback_.is_null()`, not CurrentlyRunning. `is_currently_running_` is written only at 204 and 267.
- **163-165:** `:tool-form-active` matches when `CurrentlyRunning()` is true. The body of CurrentlyRunning() is outside the file.
- The file has no timer, timeout, or delay construct; the only "Delay" is a comment at 914. The registration path posts a task (403-406), which is not on the LC04 branch. `ExecuteTool` has no caller inside this file.

## Verdicts

Each row is one claim part. No fields are summed.

| # | Claim (locus) | Verdict | Reason |
|---|---|---|---|
| 1 | "FillFormControls returned no error" (decisions LC04; knowledge row 32; SKILL 2220) | ENTAILED | 196-198 return on `error.has_value()`; 204-221 are reachable only without error. |
| 2 | "the entry-time require_submit_button is true" | ENTAILED | 181-182 is computed from the live attribute at ExecuteTool entry, and the branch reads that local at 212. "Entry-time" is load-bearing: a later attribute change cannot alter the branch. It is not the registration-time cache `HasToolautosubmit()` (416-417, 437, 458), which is a different predicate. |
| 3 | Outcome: `submit_button->Focus()` is called (callsite) | ENTAILED | Line 215, inside the `if` at 212, with no intervening branch. |
| 4 | Outcome: `context->PauseExecution()` is called (callsite) | ENTAILED | Lines 216-217, unconditional on this path; no check between 215 and 217. |
| 5 | Effect of Focus(): focus state, focus events, page listeners | UNRESOLVED | Body is outside the anchor. The row correctly says "outside the excerpt". [INFERENCE: Blink dispatches focus events synchronously on successful focus; not verified in this lane.] |
| 6 | Effect of PauseExecution(); non-null `modelContext()` at 216 | UNRESOLVED | Outside the anchor. No guard at 216-217. The file dereferences `modelContext()` without a check elsewhere (389-396, 428-462), which is a file convention, not a shown guarantee. |
| 7 | "this branch does not run the done callback", lexical reading (no direct call in 212-218) | ENTAILED | No `done_callback`, `done_callback_`, or `CallDoneCallback` reference in 212-218. The callback was moved into the member at 210, before the branch. |
| 8 | Same sentence, execution reading (the callback is not run while Focus() or PauseExecution() executes) | NOT-ENTAILED | Focus() can run code outside the anchor (see 5). Completion sites in this file are reachable from such code: `submitFromJavaScript` (834-843) calls CallDoneCallback(ok(null)) whenever the tool is CurrentlyRunning; the form-reset path (1101-1104) calls CallDoneCallback with cancelled; the invalid-form and definition-update paths (380-399, 448-452) call it with cancelled when `!IsHandlingSubmit()`. PauseExecution at 217 would then run after completion, because nothing re-checks state between 215 and 217. Whether Focus() dispatches synchronously is UNRESOLVED. |
| 9 | Row text "this branch does not run the done callback" (decisions LC04 outcome; knowledge row 32; SKILL row 2220) | REWRITE | Row 7 and row 8 are different claims and the text does not separate them. Proposed text is in section A. |
| 10 | "The pending outcome is not established here: focus handlers and PauseExecution effects are outside the excerpt." | ENTAILED | The file contains no focus-handler or PauseExecution body. The sentence is a limitation statement, not a claim. |
| 11 | Span startLine 212, endLine 218 (decisions; `design-declared.json` 49-56) | ENTAILED | Covers 212-217. Line 218 is `} else {`, which LC05 (218-221) also starts at. The overlap is harmless. Spans are pinned, so do not change them mid-wave. |
| 12 | Quote `context->PauseExecution();` | ENTAILED | Literal at line 217, inside the span. |
| 13 | Source pin: S096, sha 8c8d6796…, anchor "S096:212-218" | ENTAILED | See anchor checks. |
| 14 | Implicit: `submit_button` is non-null at 215 (not stated in the row) | ENTAILED | The guard at 251-256 (LC03) precedes FillData. The local is written only at 187 and through the out-parameter. FillData does not receive the pointer. Recommend citing LC03 from the LC04 row. |
| 15 | Implicit: the state entering the branch (not stated in the row): running flag, active button, form and submit pseudo-states, `done_callback_` stored | ENTAILED | All set at 204-210, before 212. The branch itself writes no member. The "pending" reading depends on this state, so the row should state it as entering the branch. |
| 16 | Pending state is page-observable as `:tool-form-active` (optional addition) | ENTAILED | 163-165. Consistent with the round-17 receipt note (knowledge line 75). |
| 17 | Knowledge line 13: "Some branches leave the call pending or undetermined (LC04)" | ENTAILED | Source-state reading only: with no re-entry, the tool stays CurrentlyRunning with `done_callback_` set. "Undetermined" covers any later or re-entrant completion (row 8). No runtime reading is claimed. |
| 18 | Knowledge line 13: "the excerpt shows no timer on that path" | ENTAILED | The 1740-line file has no timeout, timer, delay, or posted-task construct on the LC04 path. Callee timers are UNRESOLVED (rows 5-6). |
| 19 | Knowledge checklist item 3, line 60 | REWRITE | Same defect as row 9. |
| 20 | Knowledge history line 76: the 2500 ms no-response window; "one probe window, not a bound"; "does not show Focus or PauseExecution directly" | ENTAILED | `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71` matches. The probe contains no focus or pause text. |
| 21 | Knowledge history line 76: omits later steps in the same probe note | REWRITE | Lines 72-73: after a page `requestSubmit()` during the pending call, a submit with `agentInvoked:true` and `toolFormActive:true` was followed by `toolResponded` Completed with the page output (`f-nosubmit`). Lines 103-104: "do not wait for toolResponded without a page submit when the form lacks toolautosubmit". Omitting these makes the history read as "no completion observed". Keep it at probe level, one build. The completion came through a later page submit, not through the Focus/PauseExecution branch. [INFERENCE: via the page's respondWith on that submit.] |
| 22 | SKILL 2232: "do not interpret focus/pause or PrepareForSubmission as completion (LC04–05)" | ENTAILED | Usage rule. Consistent with row 7. Read with row 8 it conflicts with the unqualified row text (row 9). |
| 23 | SKILL 2236-2237: "Reset/removal/re-registration ... remain outside the sample" | ENTAILED | Sites exist at 1101-1104, 380-399, and 448-452. The disclosure is in SKILL only; the LC04 row and knowledge text do not cross-reference them (optional addition). |
| 24 | Knowledge line 50 caveat: `submitFromJavaScript` as a null-String producer (S100:834-842) | ENTAILED | Lines 834-843 confirm it: CurrentlyRunning check, CHECK, and CallDoneCallback(base::ok(String())) at 841. The caveat is correct but is not linked to LC04. It is also the route in row 8. |
| 25 | Source comment 213-214 ("tell the agent to allow user input, and wait for the user to submit it") read as an effect | NOT-ENTAILED if adopted; currently not adopted | The comment is author intent. The LC04 row, knowledge note, and SKILL row do not adopt it. The round-19 notes do: `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:17,34` ("user-gated", "awaiting the user") and `.ufo/waves/round-19/w2/Decision06.md:36`. Those are source interpretations, not observations. Do not copy them into round 20. |
| 26 | TODO 200-203: "should key off of the autosubmit attribute" | ENTAILED (no conflict) | Live code keys off the entry snapshot. The round-19 note (`.ufo/waves/round-19/w2/SourceS078.md:67`) calls the TODO stale. If keying changes, the "entry-time" wording and LC04/LC05 must be re-pinned. |
| 27 | Null guard: the done callback supplied by the caller | UNRESOLVED | No caller in the file. If the callback were null, CallDoneCallback returns at 263-265 before the reset at 266-270, so the running state would persist. Not in the row; not reproduced. |
| 28 | Sample limits: "finite sample"; LC04 covers only the required-button success branch | ENTAILED | Knowledge lines 9-17; SKILL 2202-2205. Excludes LC02, LC03, LC05, CancelTool, and the page-submit completion in row 21. |
| 29 | Prior round-19 runtime observations and LC04 | ENTAILED | `webmcp-declarative-validation-round-19.md:18-19` excludes forms without toolautosubmit, so round 19 adds no LC04 observation. Nothing in round 20 erases round 19. |

Headline, not an aggregate: the LC04 row needs a rewrite in its done-callback clause (rows 9 and 19), and the round-17 history needs one addition (row 21). The callsites, the entry-time predicate, the null guard for `submit_button`, and the quote are ENTAILED. The effects of the callees are UNRESOLVED by scope.

## Proposed rewrites (text only; no edits applied)

**A. Outcome cell** (decisions LC04 `outcome`; knowledge row 32; SKILL row 2220; keep the quote field unchanged):
"submit_button->Focus() (line 215) and context->PauseExecution() (line 217) are called on this branch. Lines 212-218 contain no direct done-callback call and no member write. is_currently_running_, active_submit_button_, and done_callback_ are set before the branch (lines 204-210). Focus() and PauseExecution() are outside the excerpt and may run code, so this branch does not establish completion either way, and no claim is made that the callback is not run while they execute. The pending outcome is not established here."
(Avoid runtime wording here. `selftests/expected.json:132-133` expects a `runtime_wording` finding for LC04 outcome text.)

**B. Condition cell** (optional tightening):
"FillFormControls returned no error (line 196 not taken) and the entry-time require_submit_button is true (lines 181-182: computed from the toolautosubmit attribute at ExecuteTool entry; a local that FillFormControls does not change). submit_button is non-null on this path (guard at lines 251-256, LC03)."

**C. Checklist item 3, line 60:**
"3. **Focus and pause branch** (LC04): no direct done callback in lines 212-218. The pending outcome is not established, and Focus() and PauseExecution() may run code outside the excerpt."

**D. History line 76, append:**
"The same probe note also records (lines 72-73) that after a page `requestSubmit()` during that pending call, a submit with `agentInvoked:true` and `toolFormActive:true` was followed by `toolResponded` Completed with the page output (`f-nosubmit`). It advises (lines 103-104) not waiting for toolResponded without a page submit when the form lacks toolautosubmit. This is probe-level, one build. The completion came through a later page submit, not through the Focus/PauseExecution branch."

**E. Optional sample-limit cross-reference (LC04 text or limits):**
"Other exits from a pending tool in the same file, none inside the LC04 span: CancelTool (LC06); form reset (1101-1104); invalid-form or definition update (380-399, 448-452); `submitFromJavaScript` (834-843)."

Keep SKILL row 2220 byte-identical to the knowledge row 32 after any change.

## Prior observations (round 17 and round 19)

- Round-17 probe 2500 ms window (`C2ProbeDeclarative.md:71`): preserved (knowledge line 76). ENTAILED.
- Round-17 later page-submit completion and guidance (lines 72-73, 103-104): omitted. REWRITE (D).
- Round-17 `:tool-form-active` receipt (autosubmit form): preserved (knowledge line 75).
- Round-19: scoped to toolautosubmit forms (`webmcp-declarative-validation-round-19.md:18-19`), so no LC04 runtime observation exists. Round-19 source readings ("user-gated", "awaiting the user") are not adopted in round 20. Nothing is erased.

## Unverified leads (not reproduced; no exploit or vulnerability claim; out of LC04 scope)

- **L1, re-entrant completion inside the branch.** Reachable only if Focus() dispatches script synchronously (UNRESOLVED) and page script reaches 834-843, 1101-1104, or 380-399 / 448-452. PauseExecution at 217 would still run afterward. This affects the row wording (row 9), not the sample.
- **L2, detachment window.** The non-null guard (251-256) holds, but between FillFormControls and Focus() the element may be disconnected. Custom-element reactions flush at line 194. FillData's body (`form_mcp_schema.cc`, retained in round 19 as `.gz`, sha 904b75e7…) was not read. The effect of Focus() on a disconnected element is UNRESOLVED.
- **L3, live attribute versus cached flag.** ExecuteTool reads the live `toolautosubmit` (181-182). The tool's cached `HasToolautosubmit()` (416-417, 437, 458) is refreshed only when the posted registration task (402-407) runs. A divergence window exists in source. No effect is claimed.
- **L4, null caller callback.** See row 27.

## Verification gaps

- All verdicts are source-scoped. There is no runtime observation.
- Outside the retained file and not opened: Focus(), PauseExecution(), `modelContext()`, `IsHandlingSubmit()`, `CurrentlyRunning()`, and FillData. Opening them would add uncounted sources and is out of the anchor.
- No tests, selftests, or counter runs were executed (lane rule). Main should run the counter once after integration if rewrites A to E change the row text, because the expected pins are sensitive to LC04 quote and wording (`selftests/expected.json:98` and `:133`).

## Tooling

No installs or updates. Read-only commands only: `sha256sum`, `git rev-parse` and `git show` on the committed blob, `git status` on the target paths, `gzip -dc | sha256sum`, `wc -l`, plus reads and greps.

Report: .ufo/waves/round-20/w2/SemanticLC04.md
