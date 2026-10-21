# AttackLC11 — "preventDefault without respondWith" (S096:787-815)

Scope: source-only attack on design row LC11 (`.ufo/waves/round-20/design.json`, decisions LC11, span 787-815). Target: `corpus/evidence/round-20/sources/html_form_element.cc` (S096, Chromium 154.0.8037.97). Read-only. No production edits, no build, no test, no browser, no CDP run. Leaf member: no subagents.

## Verdict

- The branch is real but narrow. After the submit dispatch, if a declarative invocation is still running, the submit event was canceled, and no respondWith promise was taken, `PrepareForSubmission` completes the invocation with `kToolInvocationFailed` and the programming-error text (S096:787-788, 790, 807-813).
- The row as a general statement ("preventDefault without respondWith yields the programming-error text") is unsafe. In-handler `form.submit()` and `form.reset()` finish or cancel the invocation before the branch runs. The branch never checks who initiated the submit. Protocol status and errorText are not in S096.
- A narrowed row is supportable from S096 alone (section 4).

## 0. Pins and provenance (read-only)

- `sha256sum` S096 = `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. 1740 lines, 68278 bytes. Matches `design.json` source.sha256 and `.ufo/waves/round-20/source-opening.json`.
- `corpus/evidence/round-19/sources/html_form_element.cc.gz` decodes byte-identical to S096 (`cmp`). The round-19 note's claim that S078 and S096 share one body holds.
- Not present at read time: `corpus/evidence/round-20/lifecycle/decisions.json`, `.ufo/waves/round-20/measure-c1.mjs`, `.ufo/waves/round-20/check-wave.mjs` (the last two are named in `run-checks.py:62-63`). LC11 was attacked against design.json span and topic only.

## 1. Branch map (S096, PrepareForSubmission 635-832 unless noted)

| Lines | What decides | Effect on LC11 |
|---|---|---|
| 638-640 | returns if `!frame`, `is_submitting_`, or `in_user_js_submit_event_` | a nested `requestSubmit()` inside a handler is a silent no-op |
| 650-680 | returns before dispatch: sandboxed forms (650-660); unclosed control (663-680) | no dispatch, so no LC11; S096 shows no `CallDoneCallback` on these returns |
| 720-722 | snapshot: `executing_tool`; `declarative_webmcp_call` = tool running now | decides `agentInvoked` and the handling-submit guard; this is the only input |
| 724-727 | `is_handling_submit_` set for the dispatch when the snapshot is true | blocks the synchronous unregistration cancel (390, 448) |
| 729-759 | interactive validation fails: no event dispatched; "Form validation failed" error | LC11 unreachable |
| 769-771 | `setAgentInvoked(true)` iff snapshot is true | the initiator is not checked |
| 776 | `should_submit = DispatchEvent(...) == kNotCanceled` | LC11 needs a non-`kNotCanceled` result |
| 787-788 | re-evaluate `executing_tool && CurrentlyRunning()` after dispatch | the LC11 precondition; false if anything completed the tool during dispatch |
| 790 | `TakeRespondWithPromise()` | promise path (LC10 family), not LC11 |
| 807-813 | `else if (!should_submit)` → `CallDoneCallback(kToolInvocationFailed, text)` | the LC11 outcome |
| 818-830 | if `should_submit`: `ScheduleFormSubmission`, then `ok(String())` | LC12; not LC11 |
| 834-843 | `submitFromJavaScript`: `ScheduleFormSubmission(nullptr, nullptr)` (835); if running, `ok(String())` (839-841) | in-handler `form.submit()` bypasses LC11 (in-file comment 837-838) |
| 1077-1105 | `reset()`: if reset event not canceled (1084-1088), reset controls, then `CallDoneCallback(kToolCancelled, "Tool execution cancelled by a form reset")` (1101-1104) | in-handler `form.reset()` bypasses LC11; no handling-submit guard |
| 380-400 | sync removal path: `CallDoneCallback` only if `!IsHandlingSubmit()` (390-395); then unregister (396) and null (398) | removal or toolname change in a handler does not bypass LC11 |
| 552-590, 845-872 | `SubmitImplicitly` → simulated click (560, 577) or `PrepareForSubmission(&event)` (588); `requestSubmit` → `PrepareForSubmission(nullptr, ...)` (872) | a user or page submit reaches the same branch |
| 174-222 | `ExecuteTool`: running set (204); no-autosubmit pauses without completion (212-217); autosubmit calls `PrepareForSubmission` (220) | a paused invocation stays running, so a later submit is treated as agent-invoked |

## 2. Attacks run and results

| # | Attack on the row | Result | Source |
|---|---|---|---|
| A1 | form removed or toolname removed inside the handler suppresses the text | holds: no suppression (sync path skips cancel while handling submit) | 380-400, 720-727, 787-788 |
| A2 | in-handler `form.submit()` | breaks: tool completed `ok(String())` and navigation scheduled before the branch | 834-842 |
| A3 | in-handler `form.reset()` (reset event not canceled) | breaks: tool cancelled with `kToolCancelled`; the branch is skipped; no handling-submit guard | 1084-1104 |
| A4 | `requestSubmit()` after the handler returns | breaks "no navigation": tool no longer running; normal submission proceeds [INFERENCE, untested at runtime] | 638, 722, 788, 818-824 |
| A5 | user click or page `requestSubmit()` while a no-autosubmit invocation is paused | breaks "agent-initiated": `agentInvoked` true, same branch | 204, 212-217, 552-590, 722, 769-771, 845-872 |
| A6 | `respondWith` called before `preventDefault` (throws) | holds only with rewording: the branch keys on "no promise taken", not "respondWith never called" | 790, 807 (SubmitEvent unpinned) |
| A7 | validation-failed form reaches the branch | breaks reachability: no dispatch | 729-759 |
| A8 | the full message as a single literal quote | breaks: the message is split across C++ literals at 810-813 | 810-813 |
| A9 | span 787-815 is LC11-only | loose: includes the promise branch 789-806 and CHECK at 794 (ScribeChecklist agrees) | 787-815 |
| A10 | the programming-error text is runtime-observed in this row | breaks scope: source-only; the only runtime sighting is a round-17 probe, not a receipt case | `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:37-39,77`; `.ufo/waves/round-17/probes/invoke-declarative.mjs:164-168,613-614`; `corpus/knowledge/webmcp-invocation-round-17.md:48-64` |
| A11 | the message string in the binary proves the branch | breaks: presence is not reachability | `.ufo/waves/round-16/w1/RevengeBinary.md:259`; `.ufo/waves/round-17/w1/RevBinaryInvoke.md:133-135` |
| A12 | S096 gives the wire status `Error` and errorText | breaks: outside S096 (see G-6) | `corpus/SOURCES.md:93`; `webmcp-invocation-round-17.md:62` |
| A13 | pre-dispatch returns produce the LC11 text | breaks: no dispatch; S096 shows no completion on those returns | 637-680 |

## 3. False stronger claims, why source defeats them, acceptable wording

### FC-1 — outcome is universal (the most likely wording)

False claim: "On Chromium 154, a declarative form invocation whose submit listener calls `preventDefault()` without `respondWith()` always fails with the programming-error text, and the form is never submitted."

Defeated by:
1. In-handler `form.submit()`: S096:835 schedules navigation (ScheduleFormSubmission guards 884-912 still apply). S096:839-841 completes the running tool with `ok(String())` before line 787. The agent gets a Completed result with the navigation sentinel, not the error text. The round-19 note (`corpus/knowledge/webmcp-declarative-validation-round-19.md:129-131`) says a sentinel is not evidence of completed navigation.
2. In-handler `form.reset()`: with an uncancelled reset event (1084-1088), S096:1101-1104 cancels the invocation with `kToolCancelled`. The branch then sees `CurrentlyRunning()` false (788). This cancel is not guarded by `IsHandlingSubmit()`, unlike 390 and 448.
3. A later `requestSubmit()` after the handler returns: the invocation has already ended. 722 and 788 are false, 638 blocks only nested calls, and the submit proceeds to 818-824. [INFERENCE; untested at runtime.]
4. Validation failure (729-759) and pre-dispatch returns (637-680): no dispatch, so `preventDefault()` never runs.

Acceptable wording: "In a declarative invocation, a canceled submit event with no respondWith promise completes the invocation with the programming-error text only if the invocation is still running after dispatch (S096:787-788, 807-813). In-handler form.submit() and form.reset() complete or cancel the invocation earlier (S096:834-842, 1084-1104). A later requestSubmit() is not gated by the invocation (S096:722, 788, 818-824; runtime untested)."

### FC-2 — attribution to the agent and to the site's contract

False claim: "The programming-error text means the site called `preventDefault()` on a submit the agent triggered, so the site broke the tool contract."

Defeated by:
- The branch never tests the initiator. `PrepareForSubmission` never reads `event` to set `agentInvoked` or gate the branch; `event` is passed only to `ScheduleFormSubmission` (824). The flag comes from the dispatch-start snapshot (720-722, 769-771).
- A no-autosubmit invocation stays running through the pause (204, 212-217). A user click (552-590) or a page `requestSubmit()` (845-872) during the pause reaches the same branch with `agentInvoked` true. The page-side case is probe-level corroborated: `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:41-43, 72-73` (a page `requestSubmit()` gave `agentInvoked:true` and Completed). The click case is [INFERENCE] from the same code path.
- The submit event bubbles (763), so listeners on the propagation path can cancel it, not only the form's own handler [DOM propagation; not pinned].

Acceptable wording: "The text is the source-fixed message for this branch. The branch fires for any canceled submit dispatch that began while a declarative invocation was running and that has no respondWith promise, whichever listener canceled it and whatever initiated the submit (S096:720-722, 769-771, 787-788, 807-813)."

### FC-3 — evidence class (source-only row presented as runtime)

False claim: "Chromium 154 emits this error for `preventDefault()` without `respondWith()` (observed)."

Defeated by: the C1 scope is source-only ("No new runtime"). The only runtime sighting is the round-17 probe `decl_preventonly` (`.ufo/waves/round-17/w1/C2ProbeDeclarative.md:37-39,77`; `.ufo/waves/round-17/probes/invoke-declarative.mjs:164-168,613-614`). It is not one of the 11 receipt cases (`corpus/knowledge/webmcp-invocation-round-17.md:48-64`). Citing it inside the LC11 row turns a source row into a runtime claim.

Acceptable wording: "Source-only: S096:787-815, Chromium 154.0.8037.97. This row makes no runtime claim." Leave the round-17 probe out of the LC11 row.

### FC-4 — quote and span

False claim: "The decision quote `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` is a literal within S096:787-815."

Defeated by: the message is built from C++ string literals across 810-813. No contiguous literal in the file matches it, and a checker that matches literals will fail. The span also includes the promise branch (789-806) and CHECK at 794.

Acceptable quote: `The site has a programming error: it called` (S096:810; one line; 8 words). The row condition must name 787-788 (re-evaluation) and 807 (branch). The frozen span 787-815 stays.

### FC-5 — binary strings as behaviour evidence

False claim: "The message is in the Chromium 154 binary, so the build reports it."

Defeated by: presence is not reachability. `.ufo/waves/round-17/w1/RevBinaryInvoke.md:133-135` says the `respondWith` behaviour in this build is unproven and must not be cited as observed. Do not cite strings in LC11.

### FC-6 — reverse claim: removal suppresses the text

False claim: "Removing the form, or changing its toolname, inside the submit handler suppresses the programming-error text."

Defeated by: the synchronous path (380-400) skips `CallDoneCallback` while `IsHandlingSubmit()` (390-395) and only unregisters (396-398). The invocation stays running. The branch tests `executing_tool` (787-788), which still runs. The comment at 777-784 says there is "no need to react to the Promise" in that case, but the code still binds `HandleWebMcpToolResponse` (798-806). Do not restate the comment as behaviour. The comment describes `active_webmcp_tool_`; the test uses `executing_tool`. A page-side `unregisterTool` is outside S096 (G-7).

Acceptable wording: "Removing the form or changing its toolname during the handler does not cancel the invocation in S096 (390-398); the branch still applies. Whether the page-side model-context API cancels it is not established by S096."

## 4. Exact acceptable wording

### 4a. Knowledge-note row (exact text; no pipes inside cells)

```
| LC11 | submit event canceled by a listener while a declarative invocation was running at dispatch start; invocation still running after dispatch (S096 shows no other completion in that dispatch; in-handler form.submit() or form.reset() would complete or cancel it first); no respondWith promise taken | CallDoneCallback with kToolInvocationFailed and text "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"; PrepareForSubmission calls no ScheduleFormSubmission on this branch (S096:818); protocol status and errorText are not in S096 | S096:787-815 |
```

### 4b. Manifest quote

`The site has a programming error: it called` (S096:810; one line; 8 words; literal within span).

### 4c. Prose sentence for the note body

"Source-only (S096:787-815, Chromium 154.0.8037.97). If a declarative invocation is still running after its submit dispatch, the submit event was canceled, and no respondWith promise was taken, PrepareForSubmission completes the invocation with kToolInvocationFailed and the programming-error text. The branch does not test who initiated the submit. In-handler form.submit() (S096:834-842) and form.reset() (S096:1084-1104) complete or cancel the invocation first, so the text does not apply to them. S096 does not contain the protocol status or errorText."

### 4d. Not-claimed sentence

"Not claimed: that the text reflects site intent; that the page cannot navigate after receiving it; that every canceled submit on a declarative invocation reaches this text; any runtime behaviour on Chromium 154."

### 4e. Replacement for the scribe checklist line

ScribeChecklist.md line 11 currently reads "`preventDefault` without `respondWith` yields a programming-error callback (S096:807-813)". Replace with: "a canceled submit dispatch with no respondWith promise, while the invocation is still running after dispatch, yields the kToolInvocationFailed callback with the programming-error text (S096:787-788, 807-813)."

## 5. Adjacent findings (outside LC11; qualifiers only, no new rows)

- A-1. Pre-dispatch returns leave an autosubmit invocation without a completion in S096. `ExecuteTool` sets running (204) and calls `PrepareForSubmission` (220). The returns at 637-640, 642-648, 650-660 and 663-680 do not call `CallDoneCallback`. Whether anything else completes the invocation is outside S096. [Untested.]
- A-2. Guard asymmetry: `IsHandlingSubmit()` protects the synchronous unregistration cancel (390, 448), but `reset()` cancels without it (1101-1104). S096 does not document intent; do not infer it.
- A-3. A respondWith result is dropped if `reset()` runs during dispatch: 788 is false, so the promise is never taken (790 not reached). The invocation already ended with the reset cancel.
- A-4. Counter discipline: adding rows for reset or submit-from-JS would change C1 from 12. Use qualifiers inside LC07, LC11 and LC12 instead. ScribeChecklist:25 names them as later-round candidates.

## 6. Evidence gaps (unpinned or unresolved)

- G-1. `CurrentlyRunning()`, `IsHandlingSubmit()` and `is_handling_submit_` are defined in a header not in the corpus. A grep of the corpus finds uses only. Reading them as the obvious flags is [INFERENCE].
- G-2. `DispatchEventResult` semantics (what counts as canceled) live in the event dispatcher, not pinned. The branch assumes `kNotCanceled` means not canceled.
- G-3. SubmitEvent `respondWith` and `TakeRespondWithPromise` (must call preventDefault first; agentInvoked required; whether a throwing call stores no promise) are not pinned. The round-17 probe observed a throw followed by a successful second call, not a throw alone.
- G-4. `form.submit()` to `submitFromJavaScript` binding: the IDL is not pinned. Only the in-file comment (837-838) states it.
- G-5. The submit-button default handler calling `PrepareForSubmission` is not pinned. `SubmitImplicitly` (552-590) and `requestSubmit` (850-872) are.
- G-6. Wire status and errorText. `corpus/SOURCES.md:93` (S079) says `kToolCancelled` maps to `Canceled`, other `ScriptToolError`s to `Error`, and failures forward `error.message`. Its source is S097 (`inspector_web_mcp_agent.cc:208-243`), whose body is not retained (only a sha is recorded). The round-17 receipt shows `cancelInvocation` → `Canceled` with `errorText ""` (`webmcp-invocation-round-17.md:62`). If that is the same path, it contradicts "forwards error.message". Unresolved. Do not state status or errorText for LC11 or for reset.
- G-7. Page-side `unregisterTool` or abort during dispatch. `model_context.cc` (S042) is retained only as `corpus/evidence/round-18/source-recheck/S042.body.gz`, which the range reader could not page, plus an excerpt (`S042.excerpt.txt`: CancelTool at 640; OnToolExecuted 856-872). S096 does not decide whether such a call cancels a running declarative invocation.

## 7. Verification performed (read-only)

- Reads: design.json; S096 174-276, 353-410, 486-526, 552-591, 635-920, 1077-1111; round-19 knowledge note `corpus/knowledge/webmcp-declarative-validation-round-19.md` (lines 11-20, 129-151); `corpus/lessons/round-19.md` (no LC11 or preventDefault content); round-17 knowledge note (32-64, 74) and w1 probe report (25-43); `corpus/SOURCES.md` 92-113; `.ufo/waves/round-20/w1/ScribeChecklist.md`; `.ufo/waves/round-20/run-checks.py` 40-89.
- Checks: sha256, byte count and line count of S096; `cmp` of S096 against the round-19 gz body.
- Not run: build, tests, browser, CDP, formatters, installs. Tools installed or updated: none.

## Residual risk

- Every conclusion is a reading of S096 plus named pinned notes. A4, A5, A-1 and A-3 depend on runtime timing or on unpinned headers and are labelled [INFERENCE] or untested.

Report: .ufo/waves/round-20/w1/AttackLC11.md
