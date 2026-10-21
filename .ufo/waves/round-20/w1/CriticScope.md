# CriticScope: round-20 C1 lifecycle source reading

- Seat: TabiR20.CriticScope (leaf critic, author-side; no subagents).
- Baseline: HEAD `c49929430d996b016dde2e3a3a5be380f3433fdb` (matches design baseline). Round-20 inputs are untracked at this HEAD.
- Scope: `design.json` rows LC01–LC12 against S096 (`corpus/evidence/round-20/sources/html_form_element.cc`, Chromium 154.0.8037.97), plus the callees needed to test implicit runtime, eventual-completion and shipping claims. Target code treated as data.
- Writes: this report only. No tests, builds or formatters. No installs or updates.

## Verdict

Do not admit the 12-row set as written. The 12 spans are line-accurate. Four outcome cells (LC02, LC05, LC06, LC12) state a result without the limits the pinned code imposes; LC12 and the navigation and shipping framing also overclaim. The registered S096 scope (`SOURCES.md:110`) names completion paths the rows omit. "Eventual completion" has no source basis as stated. Each finding below has a counterexample at pinned lines.

## Checks run (read-only)

- `sha256sum` of S096 = `8c8d6796…6916`, the design pin. The raw HTTP body of the design URL (`?format=TEXT`) hashes to `ff55d511…19ed`. The pin binds the base64-decoded body (`base64 -d | sha256sum` gives `8c8d6796…`). [P1]
- Tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles JSON), matching the S093/S096/S097 rows. [P2]
- `git ls-files` is empty for `.ufo/waves/round-20` and `corpus/evidence/round-20`. S096 and all round-20 inputs are `??`. [P3]
- Absent at this snapshot: `.ufo/waves/round-20/measure-c1.mjs` (design.json:23), `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. [P4]
- Fetched in memory, decoded, not written: 154 `runtime_enabled_features.json5`, `form_mcp_schema.cc`, `inspector_web_mcp_agent.cc`.

Severity: B = blocks admission of the affected row; H/M/L = risk; P = provenance precondition.

## B1. LC12 and S096 read the navigation sentinel as "navigation triggered"; control flow does not guarantee that

- Code: `PrepareForSubmission` calls `ScheduleFormSubmission(event, submitter)` (824), then if the tool still runs calls `CallDoneCallback(base::ok(String()))` (829). `ScheduleFormSubmission` is `void` (882) and returns at 885–887 (no view/frame/page), 893–899 (`!isConnected()`, console only), 901–908 (console), and 910–912 (`is_submitting_`, silent).
- Counterexample (source-derived, untested at runtime): a page `submit` listener, without `preventDefault`, removes the form.
  - `RemovedFrom` (486–523) reaches `ScheduleDeclarativeWebMCPToolRegistration` (523).
  - The invalid branch (380–400) skips the cancel because `IsHandlingSubmit()` is true (390). It unregisters (396) and nulls `active_webmcp_tool_` (398).
  - Back in `PrepareForSubmission`, 787–788 recompute `declarative_webmcp_call = executing_tool->CurrentlyRunning()`, which is still true. `should_submit` is true (776). `ScheduleFormSubmission` returns at 893–899. Line 829 then reports success.
- The comment at 777–786 assumes disconnection leaves nothing to resolve. The guard at 390 is what keeps the tool running.
- Same shape: `submitFromJavaScript` (834–843) calls `ScheduleFormSubmission(nullptr, nullptr)` then `CallDoneCallback(ok(String()))` (841), with no validation and no submit event. The comment at 837–838 says "from inside a submit handler", but there is no such check, so any page script resolves a running tool.
- Fix: LC12 outcome becomes "After `ScheduleFormSubmission` returns (824), the null String goes to the callback (829) whether or not that call scheduled a submission (early returns 885–912). It is not evidence that a navigation was scheduled." Add a row for `submitFromJavaScript` 834–843. Do not copy the comment at 826–828.

## B2. Observable navigation output is unreconciled with the measured round-17 record, and the S096 registry row's CDP claim is contradicted by S097

- Predicted from pins: S096 829 → S097 `WebMCPToolResponded` emits `Completed` with `ParseJSON(result)` (215–217). `ParseJSON(null)` returns an empty dictionary (47–50). So the predicted observable is `Completed` with `{}` at scheduling time.
- Measured (round-17 receipt 8357–8409; 154, loopback, flags on, supplementary pass): a declarative `toolautosubmit` form with submit not prevented navigates. The single recorded `responded` is `Completed` with the landing document's ld+json array as output. The case predicate (receipt 8364) states the invocation does not remain pending across the agent-initiated navigation; the note's row 63 (`webmcp-invocation-round-17.md:63`) records completion with the new document's result. That case's record holds no `{}` response.
- Either an unpinned layer defers or replaces the null sentinel, or the record is incomplete. The pins cannot decide. Until reconciled, LC12 may not state an observable payload, timing, or "not JSON null" for the CDP surface.
- `SOURCES.md:110` says the sentinel is "not an ordinary empty successful CDP payload". Under S097:47–50 and 215–217 the null sentinel becomes `Completed` with an empty dictionary, so that clause is wrong or unsupported. Correct it with a superseding row (QUALITY 33), not by editing history.
- [INFERENCE] `ParseJSON("{}")` also yields an empty dictionary (parse path 51+ not printed). A page tool returning `{}` would then be indistinguishable at the CDP output.

## H1. Silent exits leave calls running with no completion (eventual completion)

- `PrepareForSubmission` returns before any callback on: 637–640 (`!frame || is_submitting_ || in_user_js_submit_event_`), 642–648 (`!isConnected()`), 650–660 (sandboxed without `allow-forms`), and 668–679 (unclosed form control, gated by `UnclosedFormControlIsInvalid`, experimental at json5:6519–6520).
- Autosubmit reaches this directly. `ExecuteTool` sets `is_currently_running_` (204), stores the callback (210), sets `:tool-form-active` (206), then calls `PrepareForSubmission` (220). Only `CallDoneCallback` clears running state and the pseudo-class (263–275). `CurrentlyRunning()` drives `:tool-form-active` (163–165), so a page can observe the stuck state.
- S096 sets no deadline anywhere.
- Reachability: the `!isConnected()` exit on this path needs the H2 trigger. The sandbox exit is gated only by WebMCP, and its reachability depends on whether the upstream registration gate (not pinned) blocks sandboxed forms. `is_submitting_` and `in_user_js_submit_event_` are re-entrancy guards; a re-entrant call returning is benign because the outer call completes.
- Fix: LC05 outcome becomes "`PrepareForSubmission(nullptr, button)` (220) can return with no callback (637–680); the call is not a completion." Add a row for the exits.

## H2. Cancellation during fill is a no-op, and the callback is stored only after fill (eventual completion)

- `ExecuteTool` runs `FillFormControls` inside `CEReactionsScope` (189–194). `done_callback_` is stored only at 210. `CallDoneCallback` returns at 263–265 when no callback is stored. So a cancel during fill does nothing. It is reached from unregistration (388–398) and reset (1101–1105).
- Trigger, verified in source: `FillData` validates first (form_mcp_schema.cc:210–232, "form control states remain unchanged"), then applies (235–241). The apply step goes to `FillParameterData` (451–489), then `FillTextData` (933–942), which calls `input->SetValue(..., kDispatchInputAndChangeEvent)`. Number, select, checkbox and radio paths also dispatch change events (957–1016). Those dispatches run page script synchronously.
- Counterexample: a page `input` or `change` listener removes the form. The tool is unregistered and detached (388–398) with no completion. `ExecuteTool` then stores the callback on the detached tool (204–210) and continues.
  - Autosubmit: `PrepareForSubmission` returns at 642–648. Nothing completes.
  - Non-autosubmit: `PauseExecution` (217) runs on an unregistered tool. Nothing completes.
  - A reset during fill is silently lost.
- Holds: validation errors leave state unchanged. LC02's "error returns before running state" (196–198) is true for those errors.
- Fix: LC02 adds "the callback is stored after the fill scope (210); a cancel or reset during fill is a no-op (263–265); the apply step dispatches input and change (form_mcp_schema.cc:941–942) before 210." Add a row: `ExecuteTool` does not recheck registration or connection after fill.

## H3. Shipping: every gate on this path is experimental or test, and WebMCP also has an origin-trial name

- 154 `runtime_enabled_features.json5`:
  - `WebMCP` 7023–7035: `status: "experimental"`, `origin_trial_feature_name: "WebMCP"`, `origin_trial_allows_third_party: true`, `implied_by: [WebMCPDeclarativeFileInput, WebMCPFormAssociatedCustomElements, WebMCPTesting]`.
  - `WebMCPTesting` 7048–7049: experimental.
  - `WebMCPFormAssociatedCustomElements` 7044–7045: experimental.
  - `WebMCPDeclarativeFileInput` 7038–7039: test.
  - `UnclosedFormControlIsInvalid` 6519–6520: experimental.
- Every row presupposes a registered declarative tool, which requires `WebMCPEnabled(context)` (354–355, 411). Round-16 says "flag-gated on 154.0.8037.97" (`webmcp-chromium-loopback-round-16.md:96`). The source also admits origin-trial enablement. Default-off is measured for the flags-off profile (round-16 note:57; round-17 `invoke-flags-off-control`). Whether any shipped channel activates the origin trial is not pinned.
- CHECKs at 411, 770, 826 and 840 assert the gate as a crash-level invariant. Their enforcement is outside S096.
- Fix: heading and manifest scope gain "every row is given `WebMCPEnabled(context)`; the gate is experimental with an origin-trial name (json5 7023–7036); no shipping or default-state claim." Round-16 wording becomes "flag- or origin-trial-gated in source; default-off measured on the flags-off profile."

## H4. Missing trigger family: DOM mutation and reset cancel running and pending calls; registration is deferred

- Cancellation: `RegisterDeclarativeWebMCPTool` cancels a running or pending call with `kToolCancelled` when name, description, title, `toolautosubmit`, or the computed schema changes (433–455; cancel at 448–452 unless handling submit). Triggers: `AttributeChanged` (1126–1136, 1135), listed-control insert and remove (1194, 1211 → 1719–1727), `ChildrenChanged` (1623–1624), and reset (1101–1105).
- After the submit block closes (817), `is_handling_submit_` is reset. A pending `respondWith` promise is therefore cancellable too (scope 723–727; `Then` 798–806; late response ignored once cancelled, 295–297).
- Registration is deferred: `PostCancellableTask` on DOM manipulation (402–407). Invalidation is synchronous (380–400). No row says when a tool becomes callable.
- Fix: add three rows. (a) Deferred registration versus synchronous invalidation. (b) A schema or attribute change cancels running or pending calls unless handling submit. (c) Reset cancels only when a callback is stored.

## M1. `agentInvoked` and completion are not agent-only

- `declarative_webmcp_call` means "tool running at dispatch" (721–722). `setAgentInvoked(true)` is set whenever that holds (769–771). User clicks during the non-autosubmit wait (212–217), page-initiated `requestSubmit()` (850–872), and `form.submit()` (834–843) all qualify.
- Fix: rows say "running at dispatch", never "agent-invoked", and name the page-script completers.

## M2. Re-entry overwrites the earlier callback

- `ExecuteTool` (174–210) has no running-state guard. `invocation_id_` (178) and `done_callback_` (210) are overwritten, and the earlier callback is destroyed unrun. Nothing in S096 shows the caller serializes calls.
- Round-17 `invoke-concurrent-ids` (receipt 5564–5642) used imperative `echo`, not a declarative tool. Declarative concurrency is unmeasured.
- Fix: no row may claim "exactly one completion per invocation" for declarative tools.

## M3. Crash-level invariants and CancelTool ordering

- `CancelTool` has `CHECK(is_currently_running_)` (224–225). H2 shows synchronous page code can run before 204. If the abort wiring (outside S096) is synchronous, the CHECK can fire. The pins show neither way.
- `CHECK(!should_submit)` (794) relies on `SubmitEvent::respondWith` rejecting calls without `preventDefault`. That enforcement is not pinned, so no row may claim the rejection.

## M4. Eventual completion needs triggers; S096 has no deadline

- Completion in S096 comes only from: promise settle (290–328, 798–806), user submit on the non-autosubmit path, abort (224–229), reset (1101–1105), DOM invalidation (380–400, 433–455), validation failure (756–758), and the submission sentinel (829, 841). There is no timer.
- Imperative non-completion across navigation is measured: round-17 `invoke-navigation-pending` saw no response within 8,000 ms (`webmcp-invocation-round-17.md:60`).
- Fix: replace "eventual" with "completion requires one of these triggers; S096 sets no deadline."

## M5. Duplicate authority and scope

- `webmcp-invocation-round-17.md:87` says "Unregistration mid-call does not cancel in-flight work — agree", citing the spec (S043). Chromium 154 declarative invalidation cancels in-flight calls (390–395, 448–452) unless handling submit. Do not restate "agree" for declarative tools.
- `webmcp-invocation-round-17.md:63` and receipt 8357–8409 already hold the navigation outcome. Cross-reference them; do not restate the sentinel as the observable.
- `SOURCES.md:110` registers S096 at 174–328, 729–758, 818–842. The 12 spans omit 729–758 (validation failure completes with per-control messages, 756–758), 834–842 (`form.submit`), and every cancellation trigger in H4.
- Manifest scope "source-only ... not runtime-observed" (design.json:130) is inaccurate for this build. Round-17 `invoke-declarative-form` and `invoke-declarative-navigation-result`, and the round-19 validation note (`webmcp-declarative-validation-round-19.md:15–16`), exercised these paths on 154 with flags on. Replace it with "source-read at 154; overlapping flag-on loopback records: …".

## M6. The depth count is a sample, and 2 of 12 rows are not completion rows

- LC01 is mode selection. LC04's own text says "not completion". The heading says completion, so 10 rows are completion rows.
- LC02 and LC03 are both FillFormControls errors. LC07–LC10 share one callback path. The rows have no independence criterion.
- At least 10 completion-relevant decisions sit outside the 12: 637–680; 210 and 263–265; 174–210; 834–843; 729–758; 1101–1105; 433–455; 1126–1137; 1623–1624; 1719–1727; 353–408; 721–722 and 769–771; 885–912.
- Fix: keep C1 non-scalar and state the rule: "12 rows sample S096's completion-relevant spans; no coverage claim."

## L1. Small claims to keep out of rows

- LC09: the `TryCatch` at 301 is never reported. A toJSON error becomes the generic message with no console report (307–313). Do not say "reported".
- 316–318: non-object responses go through `ScriptValue::ToString` (not pinned). [INFERENCE] `undefined` becomes the string "undefined". Do not claim null.
- 369 and 421: validity tests `name && description`. [INFERENCE] That is a non-null test (WTF String bool, not pinned), while 336 tests `name.empty()`. Do not claim that an empty `toolname` is rejected.
- 330–348: issues go to DevTools `AuditsIssue` only, with no page or agent effect.
- 201–203: `TODO(masonf)` states an intended refactor. Cite the code branch (212–221), not the TODO.

## P. Provenance (admission preconditions)

- P1: record the decode step and both digests (raw `ff55d511…`, decoded `8c8d6796…`). QUALITY 38 and 39.
- P2: tag→commit checked (above).
- P3: commit S096, and any 154 file cited (json5, form_mcp_schema.cc, inspector_web_mcp_agent.cc), before admission. QUALITY 28.
- P4: the counter is absent. Commit `measure-c1.mjs`, bind its blob sha, and re-run at delivered HEAD. QUALITY 22 and 26.
- Index row (QUALITY 11) and LOG entry (QUALITY 7) land in the same commit.

## What holds

- All 12 spans correspond to the stated code at 154 (LC01–LC12 read).
- LC02's error branch: validation errors leave state unchanged (form_mcp_schema.cc:210–232; 196–198 before 204).
- LC07 (263–265) holds. LC10 (320–327: `ReportException` plus `kToolInvocationFailed`) holds. LC08 (295–297) holds.
- `:tool-form-active` is tied to `CurrentlyRunning()` (163–165), so the state claims are checkable.

## Smallest safe correction (ordered)

1. Heading and manifest: add the `WebMCPEnabled` precondition and gate status (H3). Replace "not runtime-observed" with the overlap list (M5).
2. Amend outcome text: LC02 (H2), LC05 (H1), LC06 (M3, CHECK), LC12 (B1, B2; hold LC12 out of any observable claim until reconciled).
3. Add rows: H1 exits; `submitFromJavaScript` and page-script completion (B1, M1); H4 cancellation triggers, deferred registration, reset.
4. Keep C1 non-scalar and state the sample rule (M6).
5. `SOURCES.md:110`: a superseding row removes "not an ordinary empty successful CDP payload" (B2; QUALITY 33).
6. Provenance: decode note, commit, counter with bound sha, index and LOG (P).
7. Until 1–6 land, do not admit: "eventual completion", "exactly once", "navigation triggered", "agent-invoked", "shipped", or "not JSON null on the CDP surface".

## Untested and limits

- No runtime execution. B1, H1, H2 and M2 are source-derived counterexamples. Reachability of the page-script triggers is inferred from pinned code and not exercised.
- Not read: `model_context.cc`, `ModelContextSupplement`, `SubmitEvent`, `ScriptValue::ToString`, WTF `String` bool conversion, `CEReactionsScope` semantics, the origin-trial registry, `FillCustomElementData`, `FillFileData`, and the rest of `ParseJSON`.
- Tools: none installed or updated. Used system `curl`, `base64`, `sha256sum`, `git` (read-only) and python3 stdlib for in-memory HTTPS fetch and decode. No writes outside this report.
