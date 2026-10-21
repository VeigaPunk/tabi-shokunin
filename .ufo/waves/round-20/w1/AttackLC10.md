# AttackLC10: rejected respondWith promise (S096:320-327)

Seat: `TabiR20.AttackLC10`. Leaf reviewer. Read-only. No production edits. No subagents. No tools installed or updated.
Pinned body: `corpus/evidence/round-20/sources/html_form_element.cc`, sha256 `8c8d6796…6916`, 1740 lines. Matches `design.json` `source.sha256`.

Axes attacked: **calibration** (claim strength against the pinned lines), **branch coverage** (guards that decide whether the arm runs at all), **evidence independence** (distinct bodies versus re-registrations), **boundary** (runtime or cross-path transfer).

## Verdict

The drafted LC10 row is accurate at the call level. Its condition is stronger than the source supports. "The respondWith promise rejects." is not sufficient. The arm runs only if the tool is still running at settlement, and the promise is observed only if the tool was running when the submit event returned. Two outcome phrases overstate delivery and sink: "reported through V8ScriptRunner::ReportException" (sink not pinned) and "CallDoneCallback runs with …" (a no-op once the callback is consumed). Separately, S078 and S096 are one body, not two sources. Replacement wording is in §5.

## 1. Drafted claim under attack

- LC10 row (clone `ScribeLifecycle`, `corpus/evidence/round-20/lifecycle/decisions.json:84-90`; note row line 36; skill row `.ufo/waves/round-20/lifecycle-skill-section.txt` line 16; frontier draft `.ufo/waves/round-20/w1/ScribeFrontier.md:52`):
  - condition: "The respondWith promise rejects."
  - outcome: "The rejection value is reported through V8ScriptRunner::ReportException, then CallDoneCallback runs with kToolInvocationFailed and the text respondWith promise was rejected."
  - quote: "respondWith promise was rejected". Literal at S096:326, inside the span.
- Note completion item 6 (clone note, Findings): "Rejected respondWith promise (LC10): kToolInvocationFailed with the rejection message." "The rejection message" reads as the reason's own message. The source uses a fixed literal.

## 2. False stronger claim (primary)

**FSC-1.** "Every rejection of a declarative `respondWith` promise is passed to `ReportException`, and then completes the tool with `kToolInvocationFailed` and the text `respondWith promise was rejected`."

The source defeats FSC-1 through five branches:

| # | Branch (S096) | What happens | Consequence for "every" |
|---|---|---|---|
| B1 | 787-790: `declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning();` gates `TakeRespondWithPromise()` | The promise is taken and bound only if the tool is still running when `DispatchEvent` returns. | A synchronous cancel inside the submit listener means 790 is never reached, so the arm never runs. Routes: `form.reset()` reaches the cancel at 1101-1105 (reset's only guards are 1079-1080; a cancelled reset event returns at 1085-1087). `form.submit()` reaches 839-841; the comment at 837-838 names this case. |
| B2 | 295-297: `if (!tool->CurrentlyRunning()) return;` | Bound but already stopped at settlement: no `ReportException`, no completion. | Post-bind pre-emptions: form disconnected or `toolname`/`tooldescription` removed (369, 380-394; cancel at 390-394 is guarded by `!IsHandlingSubmit()`, which is false after the block closes at 817); definition replaced (448-451); `reset` (1101-1105); `form.submit()` (839-841); `CancelTool` (224-229; its abort-signal caller is outside S096). |
| B3 | 263-265: `if (done_callback_.is_null()) return;` | `CallDoneCallback` is a no-op once the callback is consumed. | At 324 the error is delivered only if the callback is still held. |
| B4 | 322-324: no re-check between `ReportException` and `CallDoneCallback` | In the window 295-324, the only call S096 shows reaching page script is `ReportException`. | If `ReportException` runs page code that completes the tool (for example a form reset), the rejection text is discarded. Whether it can is not pinned in S096 [UNVERIFIED]. |
| B5 | 322-323: the call names no sink | "Reported" has no pinned destination. | Console, error event, or nothing: outside this source. |

Prior dossiers already lean on unpinned sinks. `.ufo/waves/round-19/w1/SrcScriptToolError.md:45` says "reported separately to the console", which S096 does not show. `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:22` states it correctly: it reports the exception, and "the rejection value is not passed as this callback's error text". Copy the second, not the first.

## 3. Secondary false claims

- **FSC-2 (independence).** "LC10 is corroborated by S078 and S096." False. Same body. `gzip -dc corpus/evidence/round-19/sources/html_form_element.cc.gz | sha256sum` gives `8c8d6796…6916`, 1740 lines, equal to the round-20 file. The lane `ScribeLifecycle.md` says the same. S100 is same-file reuse and adds no source diversity. The r19 note says the same at `corpus/knowledge/webmcp-declarative-validation-round-19.md:129-131`.
- **FSC-3 (reason transport).** "The rejection reason reaches the tool caller" or "is serialized like the resolved value." False. The reject arm (322-326) passes the reason only to `ReportException`. `ScriptToolError` is built from the code and the fixed literal. The reject arm has no `IsObject`/JSON/`ToString` branch, in contrast to the resolved arm (300-318).
- **FSC-4 (code identity).** "`kToolInvocationFailed` identifies a rejected respondWith." False. The code appears at 309 (LC09), 325 (LC10), 757 (form validation), and 809 (LC11). Only the literal identifies LC10.
- **FSC-5 (runtime or cross-path).** "LC10 has runtime support." False on both candidates. Round-17 `invoke-declarative-form` covers the resolved path only (`corpus/knowledge/webmcp-invocation-round-17.md:55`). `invoke-imperative-rejects` is an imperative path with no message (`.ufo/waves/round-17/w1/RevPlanC2.md` row 20). A grep of `scripts/`, `corpus/evidence/round-17`, `corpus/evidence/round-19` and `corpus/knowledge` for declarative rejecting `respondWith` found no receipt.
- **FSC-6 (composite wire claim).** "The agent sees status Error, errorText 'respondWith promise was rejected', and no exception." Not in S096. It is a composition over the S097/S079 emitters and `model_context.cc`. The round-19 dossier (`SrcScriptToolError.md:39`) cites `model_context.cc:735-738` passing `exception=nullopt`; I did not re-open that file. An S096 row cannot carry this alone.

## 4. What holds (not attacked)

- The quote is a valid literal inside the span (line 326, 4 words). The span 320-327 covers the arm exactly.
- The arm does call `CallDoneCallback` unconditionally after `ReportException`. "The arm calls CallDoneCallback" is true. The overclaims are "always delivers" and "reported" as a sink.

## 5. Acceptable wording (exact)

**5a. decisions.json LC10.** Replace condition and outcome. Keep startLine 320, endLine 327, and the quote.
- condition: `The respondWith promise rejects while the tool is still running (the LC08 running check passes).`
- outcome: `The rejection value is passed to V8ScriptRunner::ReportException and is not part of the tool error. Then CallDoneCallback is called with kToolInvocationFailed and the fixed text respondWith promise was rejected; it delivers only if the tool's callback is still held (LC07).`
- quote: `respondWith promise was rejected`

**5b. Note row and skill row.** Identical to 5a, rendered as `| LC10 | condition | outcome | S096:320-327 |`. No pipes inside the cells.

**5c. Note Findings item 6 (replace).** `Rejected respondWith promise while the tool still runs (LC10): kToolInvocationFailed with the fixed text respondWith promise was rejected. The reason is not that text; it goes only to V8ScriptRunner::ReportException.`

**5d. Note limits paragraph (add).** `LC10 is observed only if the tool was running when the submit event returned (S096:787-790). A rejection that settles after the tool stopped is covered by LC08. A promise never observed because the tool stopped during the submit event (form reset at S096:1101-1105; form.submit() at S096:839-841) is outside these rows. LC10 claims nothing about what ReportException does with the reason, and the completion is not re-checked after ReportException returns (S096:322-324). No runtime case exercises a rejecting declarative respondWith.`

**5e. Note source header (add).** `S096 is the same body as S078 (sha256 8c8d6796…6916, 1740 lines); count it once.`

## 6. Checks run (read-only)

- `sha256sum` of the lane file: `8c8d6796…6916`, 1740 lines. Matches the `design.json` pin.
- `gzip -dc` of the round-19 retained body: same sha and line count. S078 and S096 are the same bytes.
- Pattern grep over the pinned file: `ReportException` occurs once (322). `kToolInvocationFailed` occurs at 309, 325, 757, 809.
- Read: S096 224-229, 261-275, 290-328, 369-408, 699-843, 1077-1117; the full r19 note (157 lines); the round-19 and round-17 dossiers cited above.
- No tests, builds, counters, or formatters were run. `measure-c1.mjs` and the lane `decisions.json` do not exist yet. The scribe's clone copy was read, not verified.

## 7. Unverified (labelled)

- [UNVERIFIED] Whether `V8ScriptRunner::ReportException` runs page script synchronously, and what sink it uses. Outside S096.
- [INFERENCE] `CurrentlyRunning()`, `IsHandlingSubmit()`, and `TakeRespondWithPromise()` are declared outside S096. Their semantics here are read from the S096 writers: `is_currently_running_` is set at 204 and cleared at 267; `is_handling_submit_` is set inside the block that closes at 817.
- [UNVERIFIED] Engine reporting of a rejected `respondWith` promise that is never observed (B1 route).
- [UNVERIFIED] A reset listener that cancels the reset event (1085-1087) blocks the B1 reset route. A page can do this.

## 8. Gate preconditions for L1 (not attack findings)

- The S096 body is untracked in the lane (`ScribeGate.md` F1). Cite it only after commit.
- The manifest is absent in the lane (`ScribeGate.md` F4). Run the literal-quote check when it lands.
- S100 must not count as a source for LC10.
