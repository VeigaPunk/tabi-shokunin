# AttackLC07: `CallDoneCallback` state clearing (round 20, source-only)

Seat: `TabiR20.AttackLC07` (reviewer, leaf, no dispatch). Target: LC07, `corpus/evidence/round-20/sources/html_form_element.cc:261-275` (S096). Source-only; no runtime or capability claim. No production edits, no builds, tests, or formatters. Tooling: none installed or updated. Read-only checks: `sha256sum`, `zcat | sha256sum`, `git --no-optional-locks ls-files|log`.

## Verdict

- LC07's topic is accurate under one reading: the clears at S096:267-270 run only past the gate at S096:263-265, so only while `done_callback_` holds a callback. S096 supports that reading exactly.
- The overreach is "every completion clears" (FSC-1). `ScribeChecklist.md:12` heads the gate as "Completion:", which invites it. `ScribeFrontier.md:49` ("CallDoneCallback called") is acceptable as written.
- FSC-1 is defeated by a direct source branch (the fill-error return) and by guard exits on the autosubmit path that never call `CallDoneCallback`. Acceptable wording is in §5.

## 1. Pins and evidence class

| Check | Result |
|---|---|
| S096 sha256, lines | `8c8d6796...6916`, 1740; matches `design.json` `source.sha256` |
| S096 tracked in git | **No.** `git ls-files --error-unmatch` fails. The bytes are untracked |
| Identical committed bytes | `corpus/evidence/round-19/sources/html_form_element.cc.gz`, tracked (last commit `08e8173`); decoded sha `8c8d...6916`, 1740 lines |
| Lane HEAD | `c49929430d996b016dde2e3a3a5be380f3433fdb` = baseline |
| r19 note on this span | `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:16,21,24,28`. The pointer SourceLC06 cites (`corpus/evidence/round-19/w1/SrcHtmlFormTool.md`) does not exist |
| r19 knowledge note | `corpus/knowledge/webmcp-declarative-validation-round-19.md:129-131` covers S096 only for the navigation null sentinel. It does not hold LC07 |
| Absent | `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`; `corpus/evidence/round-20/lifecycle/decisions.json` |

## 2. State surface (complete S096 grep)

| Field | Set | Cleared |
|---|---|---|
| `is_currently_running_` | 204 (`true`) | 267 (`false`), only in `CallDoneCallback` |
| `active_submit_button_` | 205 | 268 (captured), 269 (`nullptr`) |
| `invocation_id_` | 178, **before** the fill-error return | 270 (`nullopt`) |
| `done_callback_` | 210 | 266 (moved out by `Run`) |

No other write in S096 clears these fields. "Only `CallDoneCallback` clears them" holds for S096.

## 3. Conditional branches and completion exits

| # | Site | Branch | Effect on state |
|---|---|---|---|
| B1 | 263-265 | `done_callback_` null: return | Skips 267-271 entirely, including form invalidation. Conflates "already completed" (correct no-op) with "never had a callback" (state stays set) |
| B2 | 266 before 267-270 | callback runs first, clears unconditional after | A callback sees `is_currently_running_` still true (`CurrentlyRunning()` true), button and invocation id still set. Clears have no identity check |
| B3 | 272-274 | `old_submit_button` non-null | Button pseudo cleared only when captured |
| E1 | 196-197 | fill error (`FillFormControls` 237-256; FillData errors in `form_mcp_schema.cc`) | Runs the callback directly; `CallDoneCallback` never called; `done_callback_` never set. `invocation_id_` from 178 survives |
| E2 | 212-217 | no `toolautosubmit` | Running; focus and `PauseExecution`. Not completion (LC04) |
| E3 | 218-220, then 638-679 | autosubmit calls `PrepareForSubmission` after running (204) and callback (210) are set. Guards return before the tool is captured (720) | **No completion.** Running, pseudo, button, invocation id, and callback all persist (see E3 detail below) |
| E4 | 756, 808, 829 | validation fail; preventDefault without respondWith; navigation | `CallDoneCallback` (clears via gate) |
| E5 | 391, 449 | tool replaced or unregistered | Cancel only when `!IsHandlingSubmit()` (390, 448). Otherwise the submit path completes it through `executing_tool` (720) |
| E6 | 841 | `form.submit()` from JS while running | `ok(String())` after guard 839 |
| E7 | 1101-1105 | form reset | Cancel after guard 1101 |
| E8 | 174-178, 204-210 | `ExecuteTool` entry | No `CurrentlyRunning()` check. Re-entry overwrites `invocation_id_` (178), `active_submit_button_` (205; previous button's pseudo not cleared), and `done_callback_` (210; previous callback destroyed without `Run`) |

E3 guard detail. None of these calls `CallDoneCallback`:
- 638-640: `!frame || is_submitting_ || in_user_js_submit_event_` returns.
- 642-648: not connected, return at 647. Likely unreachable from `ExecuteTool`: disconnect unregisters synchronously (523 to 353-398) [INFERENCE].
- 650-660: sandboxed without allow-forms, return at 659. The only `IsSandboxed` checks in S096 are 650 and 964. None sits on the registration path (353-463), so a sandboxed form's tool is registered in S096 terms.
- 663-682: unclosed form control under `UnclosedFormControlIsInvalidEnabled()` (flag at 668), return at 679. Flag default not retained.

## 4. Attacks

### FSC-1, primary: the overreach to forbid

Claim: "Every started form-tool invocation ends through `CallDoneCallback`, so completion clears its running, submit-button, and invocation state."

Defeated by:
- **E1 (direct, reachable on any bad argument).** S096:196-197 completes without `CallDoneCallback`. S096:178 stored `invocation_id_` first, and nothing clears it on that path. Running and button are not set there (204-205 come later), so only the invocation id survives. Impact is latent: `GetActiveWebMCPToolInvocationId` gates on `CurrentlyRunning()` (168-171). Whether `HTMLFormMcpTool::InvocationId()` (header, not retained) is ungated is **UNVERIFIED**.
- **E3 (source-complete; reachability UNVERIFIED).** An autosubmit invocation exits at 650-659 or 663-679 and never completes. It stays running, with pseudo-state, button, and callback held, until CancelTool (abort), form reset (1101), or tool replacement (390/448) runs. The dispatch layer that would filter sandboxed forms is not retained.
- **B1 (caller-dependent).** A null callback passed to `ExecuteTool` (210) makes B1 skip every clear. `CancelTool` still passes its CHECK (225) and cannot clear it. Caller not retained.

Why the r19 note does not cover this: `SrcHtmlFormTool.md:21` says the fill-error path skips cleanup "because the tool has not yet entered running state." That is true for running, button, and pseudo-state, but not for `invocation_id_`, which line 16 of the same note says is stored first. Line 24 says the 635-680 guards "do not themselves invoke the tool callback." The defeater is already in the r19 note but was not carried into the LC07 claim.

### FSC-2: callback observes idle state

Claim: "When the done callback runs, the tool is already reported idle."

Defeated by B2. `Run` (266) precedes the clears (267-270). While the callback runs, `is_currently_running_` is still true, the active button is still `ActiveToolSubmitButton()` (160), and the invocation id is still set (170). Source-direct.

### FSC-3: clears cannot touch a newer invocation

Claim: "State cleared after the callback belongs to the completing invocation."

Defeated by E8 and B2. Clears at 267-270 run unconditionally after `Run`, with no check that a new invocation has started. A callback that starts `ExecuteTool` on the same object would lose its running flag, invocation id, and button, and 268-269 would clear whichever button is current. The callback body (S097, `inspector_web_mcp_agent.cc`) is not retained: **UNVERIFIED**. What holds: the `std::move` at 266 makes a nested `CallDoneCallback` a no-op (B1), so one-shot delivery is safe under re-entry.

### FSC-4: runtime or evidence-class overreach

Claim: "Chromium 154 releases running, button, and invocation state when an invocation completes," stated as observed.

Defeated by evidence class. S096 is source-only (design scope). The corpus has no clear-side observation:
- r17 `invoke-declarative-form` (`webmcp-invocation-round-17.md:55`) observes `:tool-form-active` matching during an invocation. That is the set side only.
- r19 validation records invocation ids and control values. The `scripts/webmcp-*round*.mjs` grep found no pseudo-state or post-completion invocation-id observation.
- r17 row 74 says "unregistration mid-call does not cancel," from a lifecycle probe (not a receipt, probe type unstated). It conflicts with S096:390-398 and 447-455, which cancel on unregistration unless handling submit. Neither can support or refute LC07 at runtime. Do not cite either.

### FSC-5: "only" overreach

"Only `CallDoneCallback` clears these fields" holds for every S096 write (§2). State the caveat: `active_webmcp_tool_ = nullptr` (398, 454) detaches the object without a clear when `IsHandlingSubmit()` (390, 448). The clear happens later, in the submit path that holds `executing_tool` (720; completions at 756, 808, 829). Scope "only" to S096.

### ABA: the clear makes the late-response guard unsound (adjacent, LC08 owner)

Sequence (source-derivable; reachability **UNVERIFIED**):
1. A submit event carries `respondWith(pending)`. The promise block (S096:790-806) binds `HandleWebMcpToolResponse` to the tool object only, with no invocation id.
2. Reset (1101-1105) cancels A.
3. The agent calls `ExecuteTool` (B) on the same object. The tool is running again.
4. A's promise settles. The guard at 295-297 tests only `CurrentlyRunning()`, which is now true, so it accepts. B completes with A's value.

The r19 note at `SrcHtmlFormTool.md:28` says the guard "drops the later settlement." That holds only while nothing is running. Do not repeat it for LC08.

### Coverage (set level)

The twelve spans cover 181-830, but none covers 391, 449, 635-680, 756, 841, or 1102. Any statement that the twelve rows enumerate the completion paths is false.

### Citation and pointer

- S096 is untracked. Until it is committed, cite the tracked gz (decoded sha `8c8d...6916`, 1740 lines) or commit S096 first.
- SourceLC06's pointer to `corpus/evidence/round-19/w1/SrcHtmlFormTool.md` is wrong. The file is `.ufo/waves/round-19/w1/SrcHtmlFormTool.md`.

## 5. Acceptable wording

Replacement topic (`design.json` LC07.topic):
`CallDoneCallback clears running, button and invocation state only while done_callback_ holds a callback`

Row (skillRendering form, no pipes in cells):
```
| LC07 | CallDoneCallback runs while done_callback_ holds a callback | runs that callback first, then clears is_currently_running_, active_submit_button_ and invocation_id_, and invalidates the form's and the previous submit button's pseudo-state; with no held callback it returns and clears none of them; source-only | S096:261-275 |
```

Manifest entry:
- condition: `CallDoneCallback is called while done_callback_ holds a callback`
- outcome: as the row's outcome cell
- startLine 261, endLine 275
- quote: `if (done_callback_.is_null()) { return; } std::move(done_callback_).Run(result);` (lines 263-266; 6 words, literal after whitespace join)

Caveat for the round-20 note (append; do not edit r19 bytes):
> S096 shows what `CallDoneCallback` does when a callback is held. It does not show that every started invocation reaches it: the fill-error return (S096:196-197) completes without it and leaves `invocation_id_` set from S096:178; the `PrepareForSubmission` guards (S096:638-679) return from the autosubmit path (S096:218-220) without it. Source-only; not runtime-observed.

Rejected wording:
- "Completion clears running, button, and invocation state." (FSC-1)
- "The done callback sees the tool idle." (FSC-2)
- "Chromium 154 never leaves a form tool running after an invocation." (FSC-4, E3)
- "Unregistration cancels a running declarative tool." (conflicting unreceipted probe; source conditional on `IsHandlingSubmit`)
- "A late settlement is dropped once the tool stops running." (ABA; r19 `:28` overclaim)
- Any "r17/r19 runtime observation confirms the LC07 clear." (set side only)

## 6. Adjacent findings for other owners (not LC07 defects)

- **LC02:** "before running state" is accurate for running. `invocation_id_` is written at 178, before the return at 197.
- **LC12:** S096:829 `ok(String())` fires whenever `CallDoneCallback` runs while the tool is still running, even if `ScheduleFormSubmission` (void, header 882) returned early at 886, 898, 907, 911, 941, 951, 963, or 976. The null sentinel does not prove navigation.
- **LC08:** the ABA sequence above.

## 7. Gaps and untested

- No runtime, build, or browser run. All findings are from S096 plus the retained round-19 notes and records.
- Not retained: `html_form_element.h` (`InvocationId()`, `IsHandlingSubmit()`, `CurrentlyRunning()`, destructor if any); ModelContext dispatch, filtering, and caller null-check; S097 callback body; the `UnclosedFormControlIsInvalidEnabled` default. Claims depending on these are marked UNVERIFIED.
- The decision manifest and the counter are absent, so no row-level check was possible.

## 8. For main (checks to run; not run by this seat)

1. Commit S096, or cite `corpus/evidence/round-19/sources/html_form_element.cc.gz` as the committed bytes.
2. Literal-match the §5 quote against S096 lines 263-266.
3. Decide whether the twelve-row set carries the coverage disclaimer in §4.
4. Keep r19 bytes unchanged; append corrections to the round-20 note.
