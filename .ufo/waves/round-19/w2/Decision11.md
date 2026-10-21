# Decision11 — C1 DV-11 semantic falsification

Date: 2026-10-21. Seat: `TabiR19.Decision11`. Advisory review only; this is not C1 admission or a runtime verdict.

## Recommendation

**Disagree with the unqualified proposition; agree with the four recorded fixture observations.** The source digest and exact token are authentic within the retained body, the three negative cases isolate underflow/overflow/step mismatch, and the success control is non-vacuous. However, the generic bounds-enforcement principle is contradicted by the same receipt's range control, the stated source window omits important guards and the error callback, and the counter does not independently check the retained-field part of this decision.

Axes: **depth** (source entailment, effective thresholds and timing), **calibration** (observed fixture behavior versus general guarantee), **evidence integrity** (unique identities and complete counter coverage). No claim about other round axes or overall admission.

## Findings, by severity

### P2 / F1 — Narrow the bounds rule to number controls with submission validation enabled; the generic principle is false even within the retained population

Affected locations:

- `corpus/evidence/round-19/validation/decisions.json:265-288`: condition says “A number violates min, max or step”; answer promises retained value, Error and no submit.
- `SKILL.md:2070`: repeats that condition and answer.
- `corpus/knowledge/webmcp-declarative-validation-round-19.md:51-53`: generalizes number violations to fill-then-submit rejection.
- **Concrete overreach:** the knowledge note `:73-75` says schema `minimum`/`maximum` are enforced only at submit, without distinguishing number from range controls. Its own `:49-51` and `SKILL.md:2082` describe fill-time range sanitization.

The committed counterexample is `receipt.json` case `decl-range-color-01`: input `range: 99`, schema type `number`, minimum `0`, maximum `10`; actual field `"10"`, `Completed`, one submit event. Thus a JSON-number property with schema bounds is not enough to infer DV-11's retained-invalid/Error behavior. The number-range fixture instead uses specifically `<input type="number" min="2" max="10" step="3">` (`validation/fixtures/number-range.html:5-7`).

There is also an explicit source guard, not an unconditional native enforcement promise. In retained S078, `html_form_element.cc:713-715` skips interactive validation for form `novalidate` or submitter `formnovalidate`; `:729` enters the error branch only if validation is not skipped and interactive validation fails. `NoValidate()` reads the form attribute at `:1457-1459`. [INFERENCE, not browser-reproduced] adding either applicable bypass to this otherwise identical fixture routes execution away from the claimed constraint-error branch. Existing global fixture/build scope is acknowledged; these are not failures observed in the fixed fixture. They are missing qualifications when the row and principles are used as general decision rules.

The retained-value guarantee also needs its inert-fixture qualification. S077 `form_mcp_schema.cc:950-958` fills through a setter that dispatches input/change events. S078 `:1501-1527` explicitly allows validity-check event handlers to alter the listed controls, and its error construction `:734-752` reads their current validity/messages afterward. [INFERENCE] page callbacks can change a value or constraints between filling and the error observation. The prefix alone is therefore not a promise that every submitted value remains literally unchanged. The present fixture has no input/change/invalid handlers; its sole submit handler is `number-range.html:13-22`.

**Exact correction, without adding runtime claims:**

1. Replace the DV-11 condition in the manifest and SKILL row with:

   > In the number-range fixture, an enabled input[type=number] with min=2, max=10 and step=3 receives JSON amount=-1, 11 or 4; toolautosubmit has native constraint validation enabled and no field-mutating handlers.

2. Replace its answer with:

   > Successful fill leaves amount as "-1", "11" or "4" respectively. Autosubmit then fails its pre-submit constraint check: toolResponded Error with the native validation message prefixed "Form validation failed: amount: "; zero submit events. amount=5 is the Completed, one-submit control.

3. Replace knowledge-note `:51-53`'s number sentence with the same fixture-qualified claim. Replace the bounds clause at `:73-75` with:

   > Schema bounds do not imply universal fill-time rejection: these input[type=number] violations survive fill and fail native submission validation when enabled; range inputs can clamp or snap during sanitization instead.

4. Qualify the shared retention rule in `SKILL.md:2053-2055,2088-2092` and knowledge note `:40-42,71-72`:

   > A native form-validation error is post-fill, not an atomic rollback. The tested inert fixtures retained the rejected values; re-read current form state rather than infer literal retention from the error prefix alone.

5. Extend the S078 window to `713-760`, using the exact guard at `:729` as its token, so the cited window includes the bypass condition, message construction and error callback. Cite S077 `:321-335,950-958` alongside it in the source/prose explanation for the separate fill proposition. Token occurrence alone must not be described as whole-proposition entailment.

### P2 / F2 — The counter can credit DV-11 without checking its committed retained-field observations

Affected definition: `.ufo/waves/round-19/measure-c1.mjs:484-507,635-712`.

`receiptObservation()` reduces an observation to status, errorText and submitCount (`:484-494`). `comparableReceiptRecord()` uses only that reduction (`:497-507`). Fresh-versus-committed equality at `:680-686` therefore drops `observed.fields`, `observed.schema` and raw `toolResponded` evidence. The remaining probe predicate checks only the three reduced outcome properties (`:690-702`), while `pass: true` is trusted at `:687`.

For this exact decision, retaining the bad value is an explicit part of the answer, and field expectations are present in all four case definitions. The producer **does** check fresh fields and schema (`scripts/webmcp-validation-round19.mjs:1043-1061`); this finding is not an assertion that the current fresh harness ignores retention.

**Static counterexample, not executed:** [INFERENCE] changing only committed `decl-number-range-01.observed.fields.amount` from `"-1"` to `""`, while leaving its expected data, outcome triple and `pass` flag unchanged, is invisible to the cited counter predicates. The decision could retain credit despite a contradictory retained-field record. No files were mutated and no counter was run to claim a measured acceptance.

**Exact correction:** validate the expected field values and schema paths against **both** committed and fresh observations, rather than rely only on each receipt's `pass` flag; include these decision-relevant observations in the fresh/committed comparison. Bind normalized status/errorText to the retained `toolResponded` event when claiming raw CDP evidence. Keep changing invocation IDs out of semantic equality, but validate their internal correlations. Add a focused negative counter case for the changed retained-field value; the L1 owns running it.

## Source proposition re-derived from the retained bodies

The assigned source is S078, not a number-specific validator. Both files were decoded with `zcat`; their decoded SHA-256 values were independently computed with `zcat <absolute path> | sha256sum`.

| Source | URL and exact location | Retained-body access | Decoded SHA-256 |
|---|---|---|---|
| S078 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT — assigned window `729-751`; token at `751`; relevant context `174-220,592-632,713-760,1457-1459,1501-1527` | 2026-10-21, retained copy; no live HTTP fetch | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| S077 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT — `49-69,208-241,321-335,703-729,950-958` | 2026-10-21, retained copy; no live HTTP fetch | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |

Short exact source quotes, with the URL/date/hash binding above:

- S078 `:729`: `if (!skip_validation && !ValidateInteractively()) {`
- S078 `:751`: `error_message.Append(control->validationMessage());`
- S077 `:957-958`: `input->SetValue(number_string,` followed by `TextFieldEventBehavior::kDispatchInputAndChangeEvent);`

The assigned token `control->validationMessage()` occurs exactly at S078 line 751, within `[729,751]`, and its decoded digest exactly equals the manifest's `bodySha256` (`decisions.json:280-288`) and S078's registry anchor (`corpus/SOURCES.md:92`). There is no digest/token/line mismatch.

What that window entails: after a failed, non-skipped interactive constraint check, the native form code constructs a message from currently invalid candidate controls, their WebMCP parameter names and native validation messages. It does **not**, by itself, establish which number values pass filling, min/max/step semantics, literal state retention, or CDP's `Error` mapping. The `kToolInvocationFailed` callback is at S078 `:756-759`, outside the assigned window. Status `Error` and actual values are directly supported here by the retained runtime observations, not by pretending that the token proves all those claims.

The surrounding source chain is consistent with the measured fixture: S078 `:174-220` fills first, returns fill errors immediately and attempts autosubmission only after successful fill; S077 `:208-241` validates all supplied keys before applying any; its number validator `:321-335` checks conversion and nonempty sanitization, not an explicit min/max/step predicate. S077 `:950-958` then applies the number string with event dispatch. S078 `:729-760` is the later native constraint-error path.

## Runtime proposition re-derived from raw retained observations

Runtime identity is recorded, not re-executed: Chromium `154.0.8037.97` / Playwright `1.64.0` / Node `24.21.0` (`receipt.json:4-18`). Each of the four cases has a non-null invocation ID, matching `toolInvoked`/`toolResponded` IDs, no command error, and `pass: true` in the committed receipt.

| Case | JSON amount | Raw toolResponded result | Post-invoke amount | Submit events | Evidence |
|---|---:|---|---|---:|---|
| `decl-number-range-01` | -1 | Error; `Form validation failed: amount: Value must be greater than or equal to 2.. ` | `"-1"` | 0 | `receipt.json:2131-2185`, especially `2159-2178` |
| `decl-number-range-02` | 11 | Error; `Form validation failed: amount: Value must be less than or equal to 10.. ` | `"11"` | 0 | `receipt.json:2188-2242`, especially `2216-2235` |
| `decl-number-range-03` | 4 | Error; `Form validation failed: amount: Please enter a valid value. The two nearest valid values are 2 and 5.. ` | `"4"` | 0 | `receipt.json:2245-2299`, especially `2273-2292` |
| `decl-number-range-04` | 5 | Completed; output `{ok:true, fields:{amount:"5"}}` | `"5"` | 1 | `receipt.json:2302-2361`, especially `2330-2354` |

The doubled final period and trailing space are genuinely recorded; case expectations preserve them. DV-11's shorter prefix is not a precise full-message assertion. These are native, locale-dependent messages for a field named `amount`, not general messages for every numeric control.

The family probe contains two retained runs with matching propositions (`validation/probes/number-range.json:17-23` and `.runs[0..1].cases`). Its first run further separates the failure causes:

- `:200-228`: only `rangeUnderflow` true for -1.
- `:351-379`: only `rangeOverflow` true for 11.
- `:502-530`: only `stepMismatch` true for 4.
- `:658-694`: 5 valid, with an agentInvoked/trusted submit in `:667-675`.

The step base is 2, not zero: -1 and 11 are step-aligned (`2 + 3k`) but out of bounds, while 4 is in bounds and off step. Control 5 is both in bounds and aligned. The observed schema includes minimum/maximum but no `multipleOf`; S077 `:703-729` emits `multipleOf` only when the step base is itself a multiple of the step. This fixture therefore isolates all three checks rather than confusing bounds with a zero-based modulo rule. The common receipt does not retain validity flags, so those flags are probe evidence, not assertions freshly checked by C1.

## Null, type, coercion and submit timing challenges

- **Null is not numeric zero.** S077 `:49-69` only converts strings, numbers and booleans; null/array/object fail conversion. Combined with `:321-335` and `:208-231`, [INFERENCE] `amount:null` is a fill-time rejection, not DV-11's post-fill constraint path. No number-range null case was run by this seat or present among its four cases.
- **Numeric strings are not covered by these four cases.** S077 predicts that a numeric string surviving number sanitization can reach native constraints, but this row's actual inputs are JSON numbers. Do not turn that source inference into a reproduced range/step claim. Booleans can stringify but are not valid number strings; the number-type family is separately scoped in DV-09/10.
- **Other keys can change the stage.** S077 validates every supplied key before any application. [INFERENCE] an additional invalid/unknown key can reject the entire call before the amount is filled, even when amount itself violates a bound. The existing DV-11 cases supply only amount.
- **A submit attempt is not a submit event.** S078 reaches `PrepareForSubmission` after fill; native validation precedes the submit-event branch. “Zero submit events” is the supported claim, not “autosubmit was never attempted.”
- **Observation time is explicit.** The harness waits for the matching response then reads page state (`webmcp-validation-round19.mjs:1115-1133`). `submitCount` is the fixture log length (`:856-891`), not a direct count of server-side submissions. The fixture records the submit before settling its response and prevents navigation (`number-range.html:13-22`), so the control's one event is a useful witness. The inert fixture and source ordering support the negative cases' zero count; they do not prove lifetime absence of future page-driven actions.
- **No novalidate/handler/timing browser probe was performed.** Those boundary conclusions are explicitly source-derived, not fabricated runtime observations.

## Identity, binding and counter strengths/limits

Observed through JSON queries and the literal case-definition sweep:

- All 27 decision IDs are unique; no probe case ID is shared across decisions.
- DV-11 owns exactly its three listed probe IDs; its control is `decl-number-range-04`, same family, distinct from every DV-11 probe.
- Each of these four IDs occurs exactly once in the case definitions; all 66 committed receipt case IDs are unique. The duplicate check is a data-identity check, not LSP semantic analysis.
- All four DV-11 receipt entries record `pass: true`. This is not a claim of four newly executed passes.
- Independent SHA-256 checks matched the committed receipt's bindings:
  - Producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` (`receipt.json:20`).
  - `cases/number-range.json`: `17b8f5264470891c0b1f7b1f9696f91f6e96de467e718e76662ce54e37e79752` (`:28`).
  - `fixtures/number-range.html`: `b09373ee6560fffb1ac92a3d2e1545409dbba8c340b3d8367f4c215eca5cb1d6` (`:45`).

Static strengths of the counter: duplicate probes are rejected for all owners (`measure-c1.mjs:564-576,823`); duplicate case definitions and receipt IDs are rejected (`:383-400,469-481,621-629`); a control must be in-family and observed Completed (`:659-665,706-712`); source opened date, mined status, body digest and in-window token are checked (`:579-610`); producer/runtime and case/fixture digest maps are checked for both receipts (`:855-865`); the production path reproduces the pinned harness in an isolated exact-revision checkout (`:748-801`). None of that code was executed by this seat.

Additional limitation, not a claim that the present row's text mismatches: SKILL row checks require the decision ID, probe IDs, control ID and source ID, but do not compare its condition or outcome prose with the manifest (`:522-560`). Source rejection checks occurrence, not semantic entailment (`:597-601`). Thus correct IDs/hashes and a counted row cannot substitute for the human source/prose check performed here. The current manifest/SKILL row do agree textually; the overreach is in their scope and the shared principles.

## Residual risk and verification gaps

- Recommendation is scoped to DV-11 and its directly related prose/counter obligations. No browser, full C1 counter, self-test suite, build, lint or formatter was run. No mutated receipt or mutated fixture was tested.
- No fresh network source retrieval occurred. The reviewed source evidence is the retained decoded body, with exact digest/line binding above; URL authority beyond those retained bytes was not newly exercised.
- The canonical lane tip query returned attacked checkpoint `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. Read-only B→R diff inspection showed the scoped case/fixture/decision/receipt/note/harness/counter files newly added and SKILL appended by 67 lines. This review did not inspect unrelated C2/C3 behavior.
- LSP was unavailable: reading `xd://lsp` returned “No such tool” and the mounted-device inventory contains no LSP device. Consequently status/references/definition/diagnostics could not be requested; text searches and direct source reading are the disclosed fallback, not semantic LSP proof.
- Compressed-stream ranged `read` returned “empty archive directory” for the valid retained `.gz`; this tool mismatch was reported through `xd://report_issue`. Source reasoning instead used successful `zcat` output and its retained output artifacts.
- Routing, resume preflights and saturation declarations are outside this assigned decision diff. No second orchestrator/judge/runtime was invoked, and no continuity/routing/saturation pass is claimed.
- Tools installed or updated: none. All invoked commands were finite and completed; no browser, service or background job was started.

## Isolation

- Clone path: none created; no runtime or mutation probe was performed, so the required private-sandbox condition was never entered.
- Branch: none created.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit reviewed (not authored by this seat): `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit.
- Production changed paths: none.
- Sole direct LANE write: `.ufo/waves/round-19/w2/Decision11.md`.
- No git write, production edit, delegation, fleet write, private-profile read, browser launch or live-site action.
