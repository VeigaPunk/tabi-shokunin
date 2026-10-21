# ConnEvidence — Connecting Source-Only Completion Lifecycle to Runtime r17/r19 Receipts

**Seat**: `TabiR20.ConnEvidence` (UFO-FSD connector)  
**Lane Root**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Baseline**: `c49929430d996b016dde2e3a3a5be380f3433fdb`  
**Target Source**: S096 (`corpus/evidence/round-20/sources/html_form_element.cc`, Chromium 154.0.8037.97, SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`)  
**Design Reference**: `.ufo/waves/round-20/design.json` (Claim C1, axis `depth`: 0 → 12)  
**Receipt Anchors**:
- Round 17: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (producer `scripts/webmcp-invoke-round17.mjs`, SHA-256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`)
- Round 19: `corpus/evidence/round-19/validation/receipt.json` (producer `scripts/webmcp-validation-round19.mjs`, SHA-256 `2a4a5b739f28d28dcdc6569cb85693d7e4bd4ea0d6151be22ba339ed86929bdb`)

---

## 1. Declared Axes

Under the Godspeed posture and lane contract:
1. **Primary Round-20 Axis**: `depth`
   - Metric: `c1_lifecycle_decisions` (target: 12, baseline: 0).
   - Current scorecard position: tied-lowest scalar at 8 (`SCORECARD.md:888`).
   - Scope: 12 explicitly source-only Chromium 154 lifecycle decisions from Blink's `html_form_element.cc`. No scalar promotion claimed.
2. **Lane Scorecard Context**:
   - `depth`: 8 (tied-lowest; target of round 20 C1 deepening)
   - `coverage`: 9 (held; strictly protected against unverified capability inflation)
   - `operability`: 8 (held; unharmable by leaf source-reading)
   - `freshness`: 8 (held; S096 retained byte re-open)
   - `calibration`: 9 (held; strictly enforcing source vs runtime boundary)
   - `adjacency`: 8 (held; no sibling lane boundary mutation)

---

## 2. Connection Matrix: Source Decisions (LC01–LC12) vs Runtime Receipts (r17/r19)

The table below connects every source-only lifecycle decision in `design.json` (`html_form_element.cc`) to the executed runtime receipts from round 17 (`webmcp-invoke`) and round 19 (`validation`).

| ID | Topic & Source Span (`S096`) | Condition & C++ Source Outcome | Runtime Receipt Evidence (r17 / r19) | Runtime Status |
|---|---|---|---|---|
| **LC01** | `autosubmit` determines `require_submit_button`<br>`181-186` | `bool require_submit_button = !form_->FastHasAttribute(html_names::kToolautosubmitAttr);`<br>If present, counts `kModelContextExecuteDeclarativeAutosubmit` and sets flag `false`; if absent, sets `true`. | **r17**: `invoke-declarative-form` (`invoke-declarative.html:6`) and supplementary `decl-nav` (`invoke-decl-nav.html:6`) both carry `toolautosubmit`.<br>**r19**: All 66 cases across 15 families (e.g. `checkbox.html:6`, `number-type.html:6`) carry `toolautosubmit`.<br>Neither r17 nor r19 ever executed a form lacking `toolautosubmit`. | **Partially evidenced**: `toolautosubmit=true` branch observed in 68 runtime cases across r17/r19.<br>The `require_submit_button=true` branch remains **completely unobserved at runtime**. |
| **LC02** | Fill error returns before running state<br>`189-210` | `if (error.has_value()) { return std::move(done_callback).Run(base::unexpected(error.value())); }`<br>Returns callback immediately; does *not* set `is_currently_running_ = true`, does *not* set `active_submit_button_`, and does *not* fire `CSSSelector::kPseudoToolFormActive`. | **r17**: Zero fill-time errors tested on declarative forms.<br>**r19**: 39 cases tested fill errors (`kInvalidInputArguments`), observing CDP `status: "Error"` and `submitCount: 0`.<br>However, no test verified that `:tool-form-active` or `is_currently_running_` was suppressed in the DOM during/after fill failure. | **Partially evidenced**: Error return and non-submission observed over CDP in 39 r19 cases.<br>Internal C++ state suppression and CSS pseudo-class non-entry remain **unobserved C++ invariants**. |
| **LC03** | Missing required submit button error<br>`249-258` | In `FillFormControls`: `*submit_button = mcp_schema.SubmitButton();`<br>If `!*submit_button && require_submit_button`, returns `ScriptToolError(kMissingRequiredSubmitButton, "No submit button was found, but for a form without toolautosubmit, there must be a submit button")`. | **r17**: Both declarative fixtures carried `<button type="submit" id="go">Go</button>`.<br>**r19**: All 15 fixture files carried explicit submit buttons.<br>No test fixture omitted a submit button on a non-autosubmit form. | **Completely unobserved at runtime**.<br>The `kMissingRequiredSubmitButton` error code and string were never emitted in any receipt. |
| **LC04** | Non-autosubmit focus & `PauseExecution`<br>`212-218` | `if (require_submit_button)`: calls `submit_button->Focus()`, retrieves `ModelContextSupplement::modelContext()`, and calls `context->PauseExecution()`. Does *not* submit form; does *not* run `done_callback_`. | **r17**: No non-autosubmit forms tested.<br>**r19**: Explicitly scoped out: *"Not claimed: ... forms without toolautosubmit"* (`webmcp-declarative-validation-round-19.md:18-19`).<br>No harness ever observed `PauseExecution()` or button focus without tool completion. | **Completely unobserved at runtime**.<br>Non-completion pausing is an unmeasured host interaction. |
| **LC05** | Autosubmit immediately submits<br>`218-221` | `else { form_->PrepareForSubmission(/*event*/ nullptr, submit_button); }`<br>Immediately enters form submission without user interaction or pausing. | **r17**: `invoke-declarative-form` dispatches trusted `SubmitEvent` with `agentInvoked=true`.<br>**r19**: 27 passing cases observed immediate submit event dispatch (`submitCount: 1`). | **Observed at runtime** in r17 (`invoke-declarative-form`) and r19 (27 cases). Primary happy-path branch for autosubmit tools. |
| **LC06** | `CancelTool` uses tool-cancelled callback<br>`224-229` | `CHECK(is_currently_running_); CallDoneCallback(base::unexpected(ScriptToolError(kToolCancelled, "Tool execution cancelled by abort signal")));` | **r17**: `invoke-cancel` control tested `cancelInvocation` on an *imperative* tool (`round-17 receipt:62`).<br>**r19**: No tool cancellation tested.<br>Declarative form tool cancellation via AbortSignal was never executed. | **Completely unobserved at runtime** for declarative forms.<br>Imperative CDP cancellation does not exercise `HTMLFormMcpTool::CancelTool()`. |
| **LC07** | `CallDoneCallback` clears state only with callback<br>`261-275` | If `done_callback_.is_null()`, returns early.<br>Else runs callback, sets `is_currently_running_ = false`, clears `active_submit_button_`, resets `invocation_id_ = std::nullopt`, and toggles pseudo-states. | **r17**: Observed `:tool-form-active` during submit handler, but did not assert post-completion CSS state clearing.<br>**r19**: Measured only CDP response receipt.<br>Internal idempotence guard (`done_callback_.is_null()`) is not observable via protocol. | **Unobserved C++ invariant**.<br>Idempotent clearing and null-guard are internal Blink memory/lifetime invariants, unobservable across CDP. |
| **LC08** | Late response ignored when not running<br>`290-298` | In `HandleWebMcpToolResponse`: `CHECK(tool); if (!tool->CurrentlyRunning()) { return; }`<br>Ignores asynchronous promise fulfillments that arrive after tool completion, cancel, or unregistration. | **r17**: `invoke-after-unregister` tested calling `invokeTool` *after* unregistration (returned `-32602`), not a late callback arriving after unregistration while running.<br>**r19**: No delayed promises tested. | **Completely unobserved at runtime**.<br>No test ever scheduled an asynchronous promise resolving after tool termination. |
| **LC09** | Object response stringify failure<br>`298-319` | In `HandleWebMcpToolResponse`: if `v8::JSON::Stringify` fails, invokes `CallDoneCallback` with `kToolInvocationFailed`: `"respondWith promise resolved with an object that could not be serialized to JSON"`. | **r17**: `invoke-declarative-form` passed clean JSON object `{ok: true, q: nonce, via: "respondWith"}`.<br>**r19**: No `respondWith` promises evaluated (all cases used autosubmit default or validation failures). | **Completely unobserved at runtime**.<br>Cyclic or un-stringifiable objects passed to `respondWith` were never tested. |
| **LC10** | Rejected `respondWith` promise error<br>`320-327` | In `HandleWebMcpToolResponse`: if promise rejected, calls `V8ScriptRunner::ReportException` and invokes callback with `kToolInvocationFailed`: `"respondWith promise was rejected"`. | **r17**: `invoke-imperative-rejects` tested a rejected promise on an *imperative* tool. Declarative `respondWith(Promise.reject())` was never tested.<br>**r19**: No declarative promise rejections tested. | **Completely unobserved at runtime** for declarative forms.<br>The specific error string was never emitted in any receipt. |
| **LC11** | `preventDefault` without `respondWith` error<br>`787-815` | In `PrepareForSubmission`: if `declarative_webmcp_call` is true, but `TakeRespondWithPromise()` is null and `!should_submit` (because `preventDefault()` was called), returns `kToolInvocationFailed`: `"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"`. | **r17**: `invoke-declarative.html:43-44` specifically called `preventDefault()` AND `respondWith()`, avoiding this branch.<br>`invoke-decl-nav.html` called neither.<br>**r19**: No submit listeners called `preventDefault()`. | **Completely unobserved at runtime**.<br>The "programming error" diagnostic was never triggered in any receipt. |
| **LC12** | Scheduled navigation returns null String sentinel<br>`818-830` | In `PrepareForSubmission`: if `should_submit` is true, calls `ScheduleFormSubmission(...)` and invokes `CallDoneCallback(base::ok(String()))` (a Blink null `String()`, where `.IsNull()` is true). | **r17**: Supplementary case `invoke-declarative-navigation-result` observed navigation and landing document result.<br>However, the internal Blink `base::ok(String())` sentinel was translated by `inspector_web_mcp_agent.cc` and is unobservable as a null String over CDP. | **Partially evidenced**: Navigation behavior observed in r17 supplementary case.<br>The internal C++ null String sentinel vs empty string or JSON null is an **unobserved Blink internal IPC invariant**. |

---

## 3. Summary of Unobserved Outcomes

Of the 12 lifecycle decisions declared in `design.json`:
- **9 outcomes remain completely unobserved at runtime** in any tabi receipt:
  1. **LC01 (absent attribute)**: `require_submit_button = true` branch.
  2. **LC03**: `kMissingRequiredSubmitButton` error.
  3. **LC04**: `context->PauseExecution()` and submit button focus without form submission or completion.
  4. **LC06**: `CancelTool()` yielding `kToolCancelled` via AbortSignal on declarative tools.
  5. **LC07**: `CallDoneCallback` idempotence when `done_callback_.is_null()`.
  6. **LC08**: `!tool->CurrentlyRunning()` ignoring late asynchronous responses.
  7. **LC09**: `v8::JSON::Stringify` failure on objects passed to `respondWith()` yielding serialization error.
  8. **LC10**: Rejected `respondWith()` promise yielding `kToolInvocationFailed "respondWith promise was rejected"`.
  9. **LC11**: `preventDefault()` without `respondWith()` yielding the site programming error callback.
- **3 outcomes are partially evidenced at runtime**, but their internal mechanics remain source-only:
  1. **LC01 (present attribute)** / **LC05**: Autosubmit immediate submission was observed in r17 (2 cases) and r19 (27 cases), but the internal flag evaluation is a source fact.
  2. **LC02**: Fill-time error return was observed in 39 r19 cases over CDP, but the non-entry into `:tool-form-active` and `is_currently_running_` suppression were not asserted in DOM proofs.
  3. **LC12**: Scheduled navigation was observed in r17 supplementary `decl-nav`, but the Blink `base::ok(String())` null String sentinel (distinct from `""` or `null`) is an internal C++ IPC convention converted by the inspector agent.

### Technical Causes for Lack of Runtime Observation
1. **Harness Design Scope in r17 and r19**:
   - `scripts/webmcp-invoke-round17.mjs` was designed to prove protocol existence and basic invocation across imperative and declarative tools. It authored exactly one happy-path declarative form fixture (`invoke-declarative.html`) and one navigation fixture (`invoke-decl-nav.html`).
   - `scripts/webmcp-validation-round19.mjs` was explicitly designed to test *input data validation* (`form_mcp_schema.cc`), not form completion lifecycle. It added `toolautosubmit` to all 15 fixture templates so that valid inputs would immediately trigger submission without manual intervention.
2. **Exclusion of Non-Autosubmit Forms**:
   - Non-autosubmit forms require user interaction or external automation to click the submit button after `PauseExecution()`. Neither Playwright harness implemented a multi-stage pause-and-click driver for declarative tools.
3. **Absence of Negative Lifecycle Controls**:
   - Neither r17 nor r19 authored fixtures that deliberately violated lifecycle rules (e.g. throwing/rejecting in `respondWith`, passing circular JSON structures, omitting submit buttons, or calling `preventDefault()` without `respondWith()`).

---

## 4. Why No Expansion or Capability is Claimed

Claiming "runtime capability" or "frontier expansion" for these 12 decisions would directly violate core repository contracts and historical lessons:

1. **QUALITY Criterion 14 (Evidence Class Distillation)**:
   > *"Distillation preserves the evidence class of its source: a source-code reading may justify a source-scoped inference, but never an observed host behavior. Check the distilled SKILL/index claim as well as the note; a dated documentation recheck does not renew a historical runtime observation."* (`corpus/QUALITY.md:31-35`)
   - S096 is a C++ source file (`html_form_element.cc`). Reading C++ source code reveals how Blink's form element is authored, but does **not** prove that the compiled Linux x64 binary on the host executes these branches without unexpected side effects, flags, or crashes.
   - Since 9 of the 12 outcomes have never been run on a browser instance in any receipt, asserting runtime capability would repeat the fatal mistake of `kaika-fleet-round-1.md` M2 and `round-12.md` M-1 (conflating source inferences with host behavior).

2. **QUALITY Criterion 3 & 47 (Token Presence is Not Entailment)**:
   > *"Observation, inference, and unknown stay separate."* (`corpus/QUALITY.md:6`)  
   > *"Source-token presence is not entailment of the whole decision."* (`corpus/QUALITY.md:215-216`)
   - The presence of error strings (e.g. `"The site has a programming error..."` in `html_form_element.cc:810-813`) proves that the string exists in the Blink codebase, not that an agent or page can reliably receive it over CDP.
   - Without an executed receipt recording an exit code, invocation ID, and verified CDP payload, the outcome remains strictly an **inference** / **source-scoped rule**, not an observation.

3. **Frontier & Scorecard Integrity (`SCORECARD.md`)**:
   - Round 20 operates under baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`.
   - In `SCORECARD.md:888`, axis `depth` is tied-lowest at 8. Claim C1 is strictly scoped to `depth`: 0 → 12 (`c1_lifecycle_decisions`).
   - Axis `coverage` is held at 9 (`SCORECARD.md:889`). Claiming new runtime capabilities would force a fraudulent or ungrounded expansion of coverage. By explicitly stating `"source-only Chromium 154.0.8037.97; not runtime-observed"` (`design.json:130`), `depth` is legitimately improved without contaminating `coverage` or `calibration`.

---

## 5. Non-Obvious Move / Synthesis (UFO-FSD Connector Proposal)

### Evidence
1. **Registry & Anchor Pointer Defect (ScribeGate F2 / ScribeFrontier F1)**:
   `corpus/SOURCES.md:110` registers S096 with anchor ranges `html_form_element.cc:174-328,729-758,818-842`. However, decision **LC11** (`preventDefault` without `respondWith` programming error) is located at lines **787–815** (decision branch at 807–814). This span falls in an un-anchored gap (`759–817`), violating QUALITY Criterion 28 ("evidence pointers resolve as committed bytes").
2. **Superseded Row Defect (ScribeFrontier F2)**:
   `corpus/SOURCES.md:92` (S078) still claims that navigation submission returns an "empty string", which was falsified by the discovery of the null String sentinel `base::ok(String())` at lines 827–829. Under QUALITY Criterion 33, S078 requires an explicit superseded marker rather than leaving contradictory rows.
3. **False Capability Risk**:
   If the 12-row table in `SKILL.md` is rendered without a clear runtime status distinction, future agents or outside reviewers will conflate the 3 partially evidenced branches with the 9 unobserved branches, risking gate rejection under QUALITY 14.

### Affected Axes
- `depth`: **Improves** (validates all 12 lifecycle rows, ensuring LC11 resolves against an authorized source anchor).
- `calibration`: **Improves / Protects** (eliminates contradictory source claims between S078 and S096, and prevents false runtime capability inflation).
- `coverage`, `operability`, `freshness`, `adjacency`: **Harms None** (zero side effects; strictly documentation, source registry alignment, and distillation clarity).

### Proposed Move
**Synthesize a Verifiable Receipt-Boundary and Pointer-Closure Policy across Round-20 Integration**:
1. **Source Anchor Expansion (L1 Integration)**:
   In `corpus/SOURCES.md:110`, update the S096 anchor cell from `174-328,729-758,818-842` to `174-328,729-758,787-815,818-842` (or `174-328,729-842`). This closes the LC11 pointer defect before the decision manifest is verified.
2. **S078 Supersession Note**:
   In `corpus/SOURCES.md:92`, append an explicit note: `[superseded by S096 for navigation sentinel: returns null String sentinel base::ok(String()), not an empty string]`.
3. **Explicit Dual-Status Header in Distillation (`SKILL.md`)**:
   Under the declared heading `### Declarative WebMCP completion lifecycle — source-scoped (round 20)`, include an explicit scope preamble:
   ```markdown
   Source-scoped Chromium 154.0.8037.97 (S096). Not runtime-observed: 9 of 12 lifecycle outcomes (LC01-absent, LC03, LC04, LC06, LC07, LC08, LC09, LC10, LC11) have zero runtime execution receipts in rounds 17-19; 3 outcomes (LC01-present, LC02 error return, LC05 autosubmit) are partially evidenced under strict autosubmit loopback fixtures. No host capability or autonomous completion guarantee is claimed.
   ```
4. **Frontier Registry Alignment (`corpus/README.md`)**:
   Ensure the append-only frontier row for Round 20 explicitly enumerates the unobserved outcomes (as drafted in `ScribeFrontier.md:58-60`), grounding future research in what remains open.

### Risks
- *Risk*: A future reader might assume the 3 partially evidenced outcomes guarantee protocol stability.  
  *Mitigation*: The note and distillation preamble explicitly label even the partially evidenced outcomes as C++ internal invariants whose wire sentinels require protocol-level translation.
- *Risk*: Expanding S096's line anchor touches the source registry.  
  *Mitigation*: The source registry `corpus/SOURCES.md` is append/edit-permitted for source openings by L1 in the integration commit; it does not touch historical lesson bytes or protected historical notes.

### Verification
- **Pointer Closure**: Run `grep -n "787-815" corpus/SOURCES.md` to confirm LC11 is covered.
- **Decision Manifest Self-Check**: When `measure-c1.mjs` runs, assert that all 12 decisions pass with zero un-anchored spans and exit code 0.
- **Index Check**: Verify `diff <(ls corpus/knowledge | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||' | sort -u)` exits 0.

---

## 6. Execution & Hygiene

- **Tools Installed/Updated**: None (all pacman and package transactions paused; no new tools required).
- **Subagent Dispatch**: None (leaf seat).
- **Writes**: Strictly this file (`.ufo/waves/round-20/w1/ConnEvidence.md`). Shared production tree and clone trees remained untouched.
- **Tests/Gates**: No tests, builds, or formatters executed mid-flight; deferred to L1 integration owner.
