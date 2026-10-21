# `na-invalid-submit` raw-trace review

Axes checked: invoke/event identity, action timing and finite windows, navigation/release accounting, receipt-to-raw agreement.

## Medium — a response before the action can still be credited to `na-invalid-submit`

**Observed trace is internally consistent.** In `corpus/evidence/round-21/runtime/na-invalid-submit.json`, `frames` has 16 entries: four `sent`, four `result`, four `event`, two `observation`, one `action`, and one `action-complete`. Frame seq 9 sends `WebMCP.invokeTool` for `lifecycle` on frame `2657728908F304346B7AB4338D6FDFA7` with `q=4bc374a5-2705-4aae-a1ae-bd295b12b0fb` (the case nonce). Seq 10 returns invocation ID `C07B3CBD3C55966BDC7CDB9BEBA364BD`; seq 11's `toolInvoked` repeats that ID, frame, tool and nonce input. The pre-action observation is seq 12. The action is `invalidRequestSubmit` at seq 13 / `1792588031596`; it completes at seq 14 / `1792588031598`; seq 15 then reports `toolResponded` for the same invocation ID with status `Error` and `Form validation failed: q: Please fill out this field.. `. Seq 16 is the after-action observation.

The receipt's `cases[9]` agrees: pre-window 1343–1596 (253 ms, zero responses, form active); after-window 1596–2098 (502 ms), one matching Error response, `submits: []`, `navigations: []`, and page state matching seq 16 (empty value, inactive form, unchanged fixture URL). Raw `Page.frameNavigated` occurs once, at initial-load seq 3, before the action; there is no navigation in the action window. There is no `release` marker for this `mode: success` case. The fixture's post-action empty value and empty submit list are consistent with the documented invalid-submit observation.

**False-credit path:** `.ufo/waves/round-21/measure-c1.mjs:85-87` identifies responses by invocation ID and rejects a response only if it is at/before the matching `toolInvoked`. Its ordering check at line 94 orders the command result, pre marker, action, action-complete and post marker, but does not order `toolResponded` after the action. Line 96 checks only that receipt response summaries mirror all matching events before the post marker; it never requires this non-autosubmit case to have zero pre-action responses or to return the validation Error after the action. Thus a matching response inserted after seq 11 but before the pre-action marker, with the receipt's `preAction.responseCount` and `after.responses` updated to match, is not excluded by those checks. It could be credited even though the invocation had already responded before `invalidRequestSubmit`, so the response does not evidence that this action caused the reported validation failure. The selftest covers `response-before-invoke` (`selftest-c1.mjs:78-84`; expected finding at `fixtures/expected.json:164`), but not this after-invoke/before-action ordering.

No gate or selftest was executed. This finding is about an acceptance-rule gap, not a mismatch in the recorded trace.

## Residual risk

The raw data supports the observed timing and same-ID association, but does not itself provide a separate native validation-event record; the `Error` attribution rests on the action ordering, fixture state, and returned error text. Claims remain limited to this finite case/window.

## Verification gaps

The `lsp` device is not mounted in this session (`read xd://lsp` returned “No such tool”); caller/definition/diagnostics checks were unavailable. Literal search and targeted source reads were used only to locate the relevant code, not as semantic proof. No tool was installed or updated.