# SemanticLC03 — LC03 predicate/effect attack (round 20, source-only)

Seat: `TabiR20.SemanticLC03` (leaf; no dispatch). Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (HEAD matches). Targets: LC03 in `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `SKILL.md`, against `corpus/evidence/round-20/sources/html_form_element.cc:249-258`. Read-only; this file is the only write. No tests, builds, or formatters. No tool installed or updated.

**Axes.** P predicate fidelity · E callsite-to-effect fidelity · T entry-time binding · G callback and null-guard path · L sample and scope limits · H prior-observation continuity · X cross-artifact identity.

**Inputs verified (read-only).**
- Retained body: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 1740 lines, `git ls-files` tracked, clean in `git status -- corpus/evidence/round-20`. `cmp` against `zcat corpus/evidence/round-19/sources/html_form_element.cc.gz` is identical.
- S077 `form_mcp_schema.cc` (registry S077 and S098, same bytes): r19 gzip sha256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, 1440 lines. Read through the member path `form_mcp_schema.cc.gz:form_mcp_schema.cc`.
- Literal counts by shell `grep -F` (read-only). Searches by the grep tool.

## 1. Per-field verdicts

Each row stands alone. No totals.

| # | Axis | Field under test | Verdict | Reason |
|---|---|---|---|---|
| 1 | P | Span S096:249-258 (decisions.json:31-32; design.json:41-48; measure-c1.mjs:84) | ENTAILED | Span holds 249 (constructor), 250 (`SubmitButton()`), 251 (predicate), 252-256 (return), 258 (`FillData`). |
| 2 | P | Quote `if (!*submit_button && require_submit_button) {` (decisions.json:33) | ENTAILED | `grep -F` count 1; line 251; inside span; 5 words (cap 25). |
| 3 | P | Condition: "parsed a JSON object" | ENTAILED (branch gate) | Parse failure returns at 238-240; non-object returns at 244-246; both precede 249. What "object" means inside `JSONObject::From` is outside the retained text (U2). |
| 4 | P | Condition: "FormMCPSchema::SubmitButton() returns null", as predicate | ENTAILED | 250 assigns `*submit_button`; 251 tests `!*submit_button`. |
| 5 | P | Same clause, meaning of null | UNRESOLVED | Accessor body not retained (U1). What writes `submit_button_` is in §4. |
| 6 | T | Condition: "require_submit_button (computed at ExecuteTool entry) is true" | ENTAILED | 181-182 `!form_->FastHasAttribute(toolautosubmit)`; passed by value at 192 (param at 234); never re-read in FillFormControls. Presence-based: `toolautosubmit="false"` counts as present. |
| 7 | P | Conjunction exactness | ENTAILED (necessary and sufficient, within retained text) | Only producer of `kMissingRequiredSubmitButton` is 253 (none in S077). Reaching 251 needs clause 3. Line 251 true needs clauses 4 and 6. |
| 8 | E | Outcome: "FillFormControls returns kMissingRequiredSubmitButton" | ENTAILED | 252-255 `return ScriptToolError(kMissingRequiredSubmitButton, "No submit button was found…")` from a `std::optional<ScriptToolError>` function. |
| 9 | E | Outcome: "before the FillData call on the same path is reached" | ENTAILED | 252 returns; 258 is not reached on that path. |
| 10 | E | Callsite to effect (ExecuteTool 192 to 196-197) | ENTAILED for delivery; not stated in LC03 row | 196-197 run the ExecuteTool parameter `done_callback` with `base::unexpected(error)` at once. LC02 states this; LC03 is silent. |
| 11 | E | Running state after LC03 | ENTAILED | 204-210 unreached (`is_currently_running_`, `active_submit_button_`, `done_callback_`); PseudoStateChanged 206-209 unreached; `CallDoneCallback` not called. `invocation_id_` written at 178 stays set (LC02 notes this write; LC03 does not). |
| 12 | G | `CallDoneCallback` null guard (263-265) on the LC03 path | ENTAILED (does not apply) | The guard tests member `done_callback_`. LC03 never reaches `CallDoneCallback`. |
| 13 | G | Non-null contract of ExecuteTool parameter `done_callback` | UNRESOLVED | No null test at 196-197 in the excerpt. Caller contract is outside the excerpt (U3). The row makes no callback claim. |
| 14 | T | Entry-time binding (read at 182, predicate at 251) | ENTAILED | No script-capable call between 182 and 251 in retained code (UseCounter, ParseJSON, JSONObject::From, FormMCPSchema ctor and ProcessForm, SubmitButton). Helper bodies outside the excerpt are unchecked for script (U7). The branch at 212 reads the same local snapshot. |
| 15 | L | Checklist label, note:59: "Missing required submit button (LC03)" | REWRITE | "Missing" overreads a null `SubmitButton()`. ProcessForm skips disabled and read-only controls, and only HTMLFormControlElement submitters are candidates (§4). The predicate itself is unaffected. |
| 16 | E/L | Note:9 scope sentence: every row "state[s] … what that branch does to the tool's running state and done callback" | NOT-ENTAILED (LC03; also LC01, LC05) | LC03 outcome states only the FillFormControls return. LC01 and LC05 outcomes also name neither running state nor done callback. |
| 17 | H | Manifest scope "source-only Chromium 154.0.8037.97; not runtime-observed" (decisions.json:9), as a status claim about LC03 | NOT-ENTAILED (as applied to LC03); string kept | Same-build r17 probe observed the LC03 errorText (C2ProbeFrames.md:70-72, Chrome 154.0.8037.97). The string is counter-pinned (measure-c1.mjs:76 and :298 `scope_mismatch`; selftest-c1.mjs:323 `wrong_scope`). Caveat in the note (M2), not an edit to the string. |
| 18 | H | Note:81 "no receipt reviewed for this note shows it" | ENTAILED for receipts; REWRITE for completeness | Corpus grep finds the LC03 text only in the round-20 manifest and source. The note omits the probe-class observation at C2ProbeFrames.md:70-72, which the same note cites for LC01 at line 75. |
| 19 | H | Note:82 "No new runtime witness is supplied here for LC03" | ENTAILED | This note adds none. Keep. |
| 20 | X | Condition and outcome (decisions.json:29-30; note:31; SKILL.md:2219) | ENTAILED | `grep -F` count 1 per file for condition and for outcome. Anchor `S096:249-258` identical at note:31 and SKILL.md:2219. Cell shape matches design.json `skillRendering`. |
| 21 | X | Source pin (decisions.json:7; note:1-3; design.json:15-20; SKILL.md:2210-2211) | ENTAILED | Hash, line count, tracking, and clean status verified (Inputs). |
| 22 | E | Cross-row dependency: LC04 `submit_button->Focus()` at 215 | ENTAILED | The only write to `*submit_button` after 236 is 250. Reaching 212 with require=true needs 251 false, so the button is non-null. Neither LC03 nor LC04 states this; AttackLC04.md notes it. |

## 2. Callsite to effect and callback path (E, G)

- ExecuteTool 190-194 wraps the call in a `CEReactionsScope` (191). Error path: 196-197 `return std::move(done_callback).Run(base::unexpected(error.value()));`. This is the ExecuteTool parameter, not member `done_callback_`.
- Unreached on the LC03 path: 204 (`is_currently_running_ = true`), 205 (`active_submit_button_`), 206-209 (PseudoStateChanged), 210 (`done_callback_ = …`), and 212-221 (Focus, PauseExecution, PrepareForSubmission).
- `invocation_id_ = invocation_id` at 178 is the only write to it before this return. The only reset in the retained text is 270, inside `CallDoneCallback` after a stored callback. LC03 reaches neither.
- Verdict on the LC03 row's silence: the row is accurate as scoped. The note's scope sentence is not (row 16).

## 3. Entry-time binding (T)

- Order inside ExecuteTool: 178 `invocation_id_` write, 179-180 use counter, 181-182 `require_submit_button`, 183-186 use counter, 187 `submit_button` init, 190-194 FillFormControls, 196 error test.
- Inside FillFormControls the predicate reads the bool parameter. Nothing recomputes it.
- `has_toolautosubmit` (html_form_element.cc:416-417, 437, 458) is a registration-time snapshot. ExecuteTool does not read it. LC03 reads the live attribute at 182.

## 4. What "SubmitButton() returns null" covers (P, L)

- S077:117-119 constructor calls `ProcessForm(form)`. The selection therefore exists before 250 reads it.
- S077:1238-1258 ProcessForm:
  - 1241-1242: `IsDisabledOrReadOnly()` controls are skipped.
  - 1247-1248: the first `IsSuccessfulSubmitButton()` HTMLFormControlElement becomes `submit_button_`.
  - 1250-1255: the ElementInternals branch never sets it.
  - 1258: `DCHECK_EQ(submit_button_, form.FindDefaultButton())` (debug builds only).
- Within S077, `submit_button_` is written only at 1248 (grep over the member). `SubmitButton()` is not defined in S077 and no header is retained. [INFERENCE] It returns `submit_button_`.
- html_form_element.cc:1485-1493 `FindDefaultButton()` iterates `ListedElements()`. It accepts HTMLFormControlElements and also HTMLElements with `SubmitBehavior()` (1490-1491). The page's submit path has the same two-kind notion (573-576, 703-707). [INFERENCE] The loop's HTMLElement arm implies such entries can appear in `ListedElements()`. Reachability on this path is not established (U4).
- Consequences, both literal matches of the row's condition:
  - (a) a form whose only submit control is disabled or read-only gets a null `SubmitButton()`, so LC03 fires;
  - (b) a SubmitBehavior element that FindDefaultButton would pick is not a candidate on this path, so LC03 fires and the text "No submit button was found" may not match the page-level notion [INFERENCE].
- Only the label "Missing required submit button" overreads. The row does not say "no submit button exists."

## 5. Prior observations kept as history (H)

Source-only scope does not erase these. Class stated for each.

| Ref | Class | Content for LC03 | Effect on verdicts |
|---|---|---|---|
| `.ufo/waves/round-17/w1/C2ProbeFrames.md:70-72` (identity 11-14; payload heading 25; repeat runs 11-12) | Discovery probe, not a receipt. Chrome/154.0.8037.97, the pinned build. | Plain form (no submit control, no toolautosubmit; fixtures in `probes/invoke-frames.mjs:124-132`) gives `toolResponded {"status":"Error","errorText":"No submit button was found, but for a form without toolautosubmit, there must be a submit button"}`. Text equals S096:254-255. Only 253-255 emit this text, so the object gate at 237-247 was passed. | The only runtime-level occurrence of the LC03 text in the tree. Carried as history (M2). It does not observe the internal return, `invocation_id_`, or running state. |
| same, `:73-79` | Probe | toolautosubmit form gives navigation and Completed (73-76). Button-only form gives no response for 12 s and 30 s (77-79). | Consistent with LC05 and LC04. Consistent with LC03 not firing when the button is non-null. No new LC03 claim. |
| `.ufo/waves/round-17/probes/invoke-frames.mjs:120-121` | Code comment | "expected to fail with the 154 'No submit button was found' error" | Prediction, not observation. |
| `corpus/evidence/round-17/webmcp-invoke/receipt.json`, `receipt.stdout.txt` | Receipts | No LC03 text (corpus grep). | No receipt-level witness. |
| `.ufo/waves/round-19/w1/SrcScriptToolError.md:31-33` | Source reading, r19 | Reads :249-256 as the same branch. S078 bytes equal the retained body (Inputs). | Agrees with the row (source-only). |
| `corpus/evidence/round-19/validation/cases/missing-required.json:12-14` | r19 receipt case | `Form validation failed: required` is S096:733, inside 729-751. | Different path (interactive validation). Not LC03. |
| `.ufo/waves/round-16/w1/WebmcpProbeIssues.md:97-99` | Probe note, round 16 | "not exercised here — candidate for a later probe" | Pre-r17. Superseded for the r17 build by row 1. |
| `.ufo/waves/round-16/w1/RevengeBinary.md:258`; `.ufo/waves/round-17/w1/RevBinaryInvoke.md:76`; `.ufo/waves/round-18/w1/Recheck20.md:90-91` | Binary strings; enum static assert | The text and enum member are present in the build or source. | Static only. |
| `.ufo/waves/round-20/w1/ConnEvidence.md:39`; `.ufo/waves/round-20/w1/ConnPlanner.md:45` | Round-20 seat notes (not corpus) | Say the LC03 text was "never triggered or received" in r17/r19. | Contradicted by the r17 probe (row above). Must be corrected before reuse. |

## 6. Cross-check against round-20 w1 AttackLC03.md (sibling)

- Sibling A3 (precedence) and A5 (cleanup not run; `invocation_id_` stays set) are confirmed (196-197, 178, 263-270).
- Sibling A9 ("the S096 retained body is untracked") is stale. `git ls-files` tracks it and `git status` is clean for `corpus/evidence/round-20`. The round-19 gzip fallback is unnecessary.
- Sibling A7 (the word "required" means `require_submit_button`, not the HTML attribute) is confirmed.

## 7. Recommended moves (each names the axis it improves and its harm check)

- **M1** (note:59). Replace "Missing required submit button (LC03)" with "No submit control selected by `FormMCPSchema::SubmitButton()` (LC03)". Improves L, P. Harm: none. `measure-c1.mjs` parses `| LCnn |` rows and manifest decision text, not checklist items. SKILL.md has no checklist.
- **M2** (note, History section, appended bullet, not a rewrite). Add: round-17 probe C2ProbeFrames.md:70-72 observed the LC03 errorText on Chrome 154.0.8037.97 for a plain form. Probe-class, not a receipt. It does not observe the internal return or running state. `:73-79` triangulate LC05 and LC04. Improves H, L. Harm: none. `RUNTIME_WORDING` (measure-c1.mjs:108, 349-350) applies only to manifest condition and outcome text, so keep the bullet out of those fields.
- **M3** (note:9). Narrow to: "Rows state the branch and its immediate call. LC02, LC04, LC06–LC12 also state the effect on running state or done callback; LC01, LC03, LC05 do not." Optional addition to the LC03 discussion: `invocation_id_` is written at 178 and not reset on this path, as in LC02. Improves E, X. Harm: none. Note-only. SKILL.md 2207-2237 has no such sentence. Rejected alternative: extending the LC03 outcome. That changes a counted, SKILL-rendered row, needs exact re-render in two files, and adds no new source fact.
- **M4** (note; History or checklist prose, outside the table block). Cite S077:117-119 and 1238-1248 for what "SubmitButton() null" means, and state the page-level FindDefaultButton difference as [INFERENCE]. Improves P, L. Harm: none. The row's source column stays S096, since `measure-c1.mjs:20-22` and :275 render `decision.sourceId ?? manifest.source.id`.
- **M5** (decisions.json:9). Do not edit the scope string. It is counter-pinned; any change is `scope_mismatch` and forces a selftest re-pin. The caveat goes in M2 instead. Harm avoided: this is a deliberate non-move.

## 8. Unresolved and out-of-scope leads (no reproduction; no exploit or race work)

- **U1** `SubmitButton()` accessor body. Header not retained. [INFERENCE] returns `submit_button_`.
- **U2** `ParseJSON` and `JSONObject::From` semantics. Platform code not retained.
- **U3** Caller contract that ExecuteTool's `done_callback` is non-null (row 13).
- **U4** Whether a SubmitBehavior HTMLElement can sit in `ListedElements()` while `SubmitButton()` is null. Reachability not established.
- **U5** Race lead, out of scope. ExecuteTool checks no `CurrentlyRunning()` before `invocation_id_ = invocation_id` (178). The LC03 early return leaves that write in place. If a prior invocation is still pending, its id is overwritten. Whether the caller forbids re-entry is outside the excerpt. Not verified; not reproduced.
- **U6** Debug-only `DCHECK_EQ(submit_button_, FindDefaultButton())` (S077:1258) against the SubmitBehavior arm of FindDefaultButton (html_form_element.cc:1490-1491). Adjacent; debug builds only; not verified.
- **U7** Bodies of `IsDisabledOrReadOnly`, `IsSuccessfulSubmitButton`, `GetWebMCPParameterName`, and `CEReactionsScope` are not retained. [INFERENCE] None runs author script before line 251. CE reactions drain at 194, after the predicate.

## 9. Checks for main

- If M1–M4 are adopted, main runs `node .ufo/waves/round-20/measure-c1.mjs REV` once and its selftest. Expected: unchanged row count, since only note prose changes. I did not run either.
- Do not edit decisions.json:9 (M5).
- Tools installed or updated: none.
