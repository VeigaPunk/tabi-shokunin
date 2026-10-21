# ResidualRowsA — LC01–LC03 review (round 20 residual, seat A)

Reviewed at `ac10319843f718489a10b89a8d2a568879aaf980`. Source pin re-verified locally:
`sha256sum corpus/evidence/round-20/sources/html_form_element.cc` →
`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, matching
`decisions.json.source.sha256`. Scope: canonical rows LC01–LC03 only in
`corpus/evidence/round-20/lifecycle/decisions.json`, the appended "Round-20 falsification
correction — canonical source guidance" section of
`corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, and the matching SKILL.md
section. Historical rows (note lines 29–40, SKILL lines 2217–2228) treated as superseded
history per contract, not re-reviewed. Source-only; no runtime/capability claim made or
implied. No production edits, no Git/jj mutations, no tests/counters run.

## Verdicts

### LC01 — ENTAILED (S096:181-186)
- Condition "no `toolautosubmit` attribute at ExecuteTool entry → require_submit_button true":
  source:181-182 `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);`
  — attribute absent ⇒ negation true. Exact.
- Outcome "autosubmit UseCounter::Count call is in the opposite, false branch": source:183-186
  `if (!require_submit_button) { UseCounter::Count(..., kModelContextExecuteDeclarativeAutosubmit); }`
  — the counter call sits in the `require_submit_button == false` (attribute present) arm. Exact.
- "Callsite statement, not a per-call telemetry increment claim": the row states only that the
  retained span contains the call in that branch; increment-per-call is a runtime effect and is
  not claimed. Consistent with the source-only evidence class in both documents.
- Quote `!form_->FastHasAttribute(html_names::kToolautosubmitAttr);` is source:182 verbatim, in span.

### LC02 — ENTAILED (S096:189-210)
- "After the enclosing CEReactionsScope has closed": scope block closes at source:194; the check
  `if (error.has_value())` is at source:196, outside the braces. Exact.
- "Contains a call to the incoming done_callback with the error": source:197
  `return std::move(done_callback).Run(base::unexpected(error.value()));` — runs the function
  *parameter* `done_callback`, not the member `done_callback_` (which is assigned only at
  source:210 on the success path). The incoming-vs-stored distinction is stated correctly.
- "Then returns before the assignments at lines 204-210": the return at 197 preempts
  `is_currently_running_ = true;` (204), `active_submit_button_ = submit_button;` (205), and
  `done_callback_ = std::move(done_callback);` (210). Lines 206-209 in that range are
  PseudoStateChanged calls/branches, not assignments; the claim asserts only that the
  assignments in the range are skipped, which holds for every one of them.
- "invocation_id_ was written at line 178 and is not reset on this return path": write confirmed
  at source:178; nothing between 178 and 197 resets it — `FillFormControls` (232-258) touches no
  member state, and the reset site (`invocation_id_ = std::nullopt` in `CallDoneCallback`, ~271)
  is not reached on this path. Exact.
- Span start 189 is a blank line immediately preceding `std::optional<ScriptToolError> error;`
  (190); cosmetic, everything the outcome cites is inside 189-210.

### LC03 — ENTAILED (S096:249-258)
- Condition gates: reaching 249 requires `ParseJSON` success (~238) and `JSONObject::From`
  success (~243) — "The call parsed a JSON object" accurately compresses both; non-object JSON
  fails the second gate, so the condition cannot hold for arrays/scalars.
- "require_submit_button (computed at ExecuteTool entry)": the `FillFormControls` parameter
  (source:234) is bound from the entry-time local computed at 181-182 via the call at 192-193.
  The row's entry-time-vs-use distinction is preserved.
- Outcome: source:251 `if (!*submit_button && require_submit_button) {` returns
  `kMissingRequiredSubmitButton` at 252-255, preempting `return mcp_schema.FillData(*json_obj);`
  at 258 — "before the FillData call on the same path is reached" is exact. `SubmitButton()` is
  invoked at 250; the row treats it as the schema accessor result only, per the note's own
  caveat (no DOM-absence claim).

## Cross-document consistency
- decisions.json LC01–LC03 rows, the note's corrected table (lines 112-114), and SKILL.md's
  corrected table (lines 2273-2275) are textually identical in condition, outcome, and anchor.
- Both documents label the corrected section canonical and the earlier tables (note 29-40,
  SKILL 2217-2228) superseded history retained as history; both carry the "source-only … no
  new runtime observation in round 20" evidence-class statement. No runtime/capability/scalar-
  promotion language appears in the corrected rows.

## Distinguishing checks (as assigned)
- Direct C++ callsites vs unretained-callee effects: LC01 explicitly scopes the UseCounter as a
  callsite statement; LC02/LC03 cite only statements inside the retained spans; LC03's FillData
  is described as unreached, not effect-claimed. No row converts a callee call into an outcome.
- Handler-entry vs callback-time state: LC02 separates the incoming parameter callback
  (source:197) from the member `done_callback_` (source:210) and notes the entry-time
  `invocation_id_` write (178) persists on this path. Correct on both counts.
- Method calls vs stored-callback delivery: LC02's delivery is a direct invocation of the
  incoming parameter at the callsite — not routed through `CallDoneCallback` — and the row does
  not borrow stored-delivery semantics from LC07. No conflation.

## Residual risk / gaps
- None actionable in scope. Two cosmetic notes, not defects: LC02's span starts on a blank line
  (189) and its "assignments at lines 204-210" range also contains the 206-209 pseudo-state
  calls, none of which the row claims run. No runtime witness consulted or required; nothing
  here is a runtime claim.

— TabiR20.ResidualRowsA, 2026-10-21
