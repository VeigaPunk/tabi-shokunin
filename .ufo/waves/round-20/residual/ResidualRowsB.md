# ResidualRowsB — canonical rows LC04, LC05, LC06 (round 20)

Seat: TabiR20.ResidualRowsB. Scope: current canonical corrected rows LC04–LC06 only, at
fixed commit ac10319843f718489a10b89a8d2a568879aaf980, reviewed as read-only files:
`corpus/evidence/round-20/lifecycle/decisions.json`, the corrected-source section of
`corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, and the SKILL.md corrected
table, against `corpus/evidence/round-20/sources/html_form_element.cc`.

Method: read-only inspection plus targeted raw line reads of the pinned source. I
recomputed the source digest once (sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`)
— it matches the manifest, note header, and design.json. No tests, counters, gates,
builds, or formatters were run; no Git/jj or production-tree mutation; no runtime or
capability claim is made or implied. Superseded history rows (old note table, old SKILL
table at lines 2217–2228) were not re-reviewed.

## Verdicts

| Row | Verdict | Anchor |
|---|---|---|
| LC04 | ENTAILED | S096:212-218 |
| LC05 | ENTAILED | S096:218-221 |
| LC06 | ENTAILED | S096:224-229 |

## Row evidence

**LC04 — ENTAILED.** Raw read of lines 212–221 confirms: `if (require_submit_button) {`
at 212; `submit_button->Focus();` at 215; `context->PauseExecution();` at 217 (the row's
quote line, inside 212–218); `} else {` at 218. Direct-callsite reading is exact: both
calls are plain C++ callsites in-span, and no `CallDoneCallback` token appears anywhere in
`ExecuteTool` (176–222), so "no direct CallDoneCallback call in this branch" is precise
and correctly refuses to equate the callsites with callee effects ("Effects inside those
callees are not established by this span"). Handler-entry framing is right:
`require_submit_button` is computed once at entry (183–184 from
`FastHasAttribute(kToolautosubmitAttr)`), passed by value into `FillFormControls` (194),
never reassigned — the branch variable at 212 is the entry-time value. The condition
"FillFormControls returned no error" matches the `error.has_value()` guard at 196–200;
on that path `submit_button` is non-null (the 251–258 refusal otherwise fires), which the
row does not need to claim and does not.

**LC05 — ENTAILED.** Raw read confirms the quote
`form_->PrepareForSubmission(/*event*/ nullptr, submit_button);` is exactly line 220,
inside span 218–221 (else-arm opens at 218, closes at 221). "Direct … instead of the
focus/pause arm" is correct. The callee characterization holds in the retained body:
`PrepareForSubmission` (from ~637) has early returns (frame/`is_submitting_`/
`in_user_js_submit_event_` guard, `!isConnected()`, sandboxed-forms block,
unclosed-control error dispatch) plus the dispatch/respondWith and `should_submit`
schedule paths — so "submit/response paths and early returns; this call alone guarantees
neither completion nor its absence" is an accurate callsite-scoped hedge, consistent with
checklist item 4. The condition's "(toolautosubmit present at entry)" correctly restates
the negation of the entry-time computation.

**LC06 — ENTAILED.** Raw read of 224–229 confirms: `CancelTool()` at 224;
`CHECK(is_currently_running_);` at 225 (the condition correctly requires the CHECK to
pass and claims nothing about CHECK failure); `CallDoneCallback(base::unexpected(` at
226; `ScriptToolErrorCode::kToolCancelled` at 227; the literal
`"Tool execution cancelled by abort signal"` at 228 — the row's quote line, inside the
span. The row correctly distinguishes method call from stored-callback delivery
("Stored-callback delivery and cleanup are conditional as in LC07"): `CallDoneCallback`
early-returns when `done_callback_` is null (263–265) and only otherwise `Run`s (266) and
resets state (267–274). "The literal does not establish the cancellation trigger" is
correct — it is a fixed string in the source.

## Cross-rendering consistency

LC04/LC05/LC06 rows are textually identical (condition, outcome, anchor) across
decisions.json, the note's corrected table, and the SKILL.md corrected table; SKILL
checklist items 3–5 match the note's items 3–5. The SKILL append header explicitly
supersedes the old SKILL table (lines 2217–2228) and old note table as history, and the
design's `skillRendering` ("Active corrected table only … exact current rows mirror
manifest") holds for these three rows.

## Residual risk and verification gaps

- None in scope. The unestablished callee effects (Focus/PauseExecution/PrepareForSubmission
  internals, ScheduleFormSubmission body outside registered anchors) are the rows' stated
  limits, not defects; no rewrite candidate found.
- Untested by this seat: no counter, selftest, or gate was executed (main runs those once
  after integration). Findings above are inspection-only and source-only.
