# W1 scout report — SourceSubmitSchema — pinned154 `form_mcp_schema.cc` SubmitButton selection

Seat: TabiR20.SourceSubmitSchema · 2026-10-21 · Scope: **source-only** Chromium 154.0.8037.97.
No runtime exercise, no capability claim, no runtime observation. All target code below is treated as data.
Disabled / custom / native button limits for the Declarative WebMCP submit-button selection, plus the
S096 lifecycle anchors they feed (LC01/LC03/LC04/LC05/LC07).

## 1. Method and byte pins

The lane pins only S096 (`corpus/evidence/round-20/sources/html_form_element.cc`,
sha256 `8c8d6796b17b` per `.ufo/waves/round-20/design.json`); `form_mcp_schema.cc` had **no local copy**
in the lane tree (verified by filename search over the worktree). Per assignment I opened the pinned-tag
siblings directly from googlesource (`?format=TEXT`, base64 → bytes) at the same tag
`154.0.8037.97` design.json uses for S096. Bytes staged under `/tmp/tabi-r20-s3-fms/` (volatile —
re-derivable from the tag URLs; archive obligation falls to the integration owner if these lines are cited).
sha256 first-12 pins, re-derived at write time (`sha256sum`, this session):

| Chromium path (under `third_party/blink/renderer/core/`) | pin (12) | lines |
|---|---|---|
| `html/forms/form_mcp_schema.cc` | `904b75e705f8` | 1440 |
| `html/forms/form_mcp_schema.h` | `e44593c07b60` | 205 |
| `html/forms/html_form_control_element.cc` | `bf112fd47dd9` | 532 |
| `html/forms/html_form_control_element.h` | `9ac014d2702b` | 216 |
| `html/forms/submit_input_type.cc` | `ec5a3dc93e6b` | — |
| `html/forms/image_input_type.cc` | `25d1ca6bc47b` | — |
| `html/forms/input_type.cc` | `a863e0b756d8` | — |
| `html/forms/html_button_element.cc` | `b81388409089` | — |
| `html/forms/html_button_element.h` | `10e1c39ec386` | — |
| `html/forms/html_input_element.cc` | `ea5fab7a8e73` | — |
| `html/forms/element_behavior.h` | `62f21dda7d23` | 54 |
| `html/forms/html_submit_button_behavior.h` | `4e1812ee804d` | 102 |
| `html/html_element.cc` | `49b59714e9c3` | — |
| `html/custom/element_internals.cc` | `31bf338f3831` | — |

S096 quotes below cite `corpus/evidence/round-20/sources/html_form_element.cc:<line>` (abbreviated `S096:<line>`).

## 2. Selection site — `FormMCPSchema::SubmitButton()` [OBSERVATION]

Contract comment, `form_mcp_schema.h:52-54`:
> "The first successful submit button (IsSuccessfulSubmitButton()) found within the form."

Construction and traversal, `form_mcp_schema.cc`:

- `:117-119` — ctor `FormMCPSchema(HTMLFormElement& form)` immediately runs `ProcessForm(form)`.
- `:1238-1239` — `ProcessForm` iterates `form.ListedElements()` once, in listed order.
- `:1240` — only the `DynamicTo<HTMLFormControlElement>` branch can ever assign `submit_button_`.
- `:1241-1243` — `if (form_control->IsDisabledOrReadOnly()) { continue; }` — disabled **or readonly** controls are skipped entirely (both as parameters and as button candidates).
- `:1247-1248` — `if (form_control->IsSuccessfulSubmitButton() && !submit_button_) { submit_button_ = form_control; }` — first eligible button in listed order wins; no later override.
- `:1250-1255` — the `ElementInternals` branch (form-associated custom elements) is registered as a parameter only; it can never set `submit_button_`.
- `:1258` — `DCHECK_EQ(submit_button_, form.FindDefaultButton());` — debug-only self-check against `HTMLFormElement::FindDefaultButton()`.

Consumer in the lane source: `S096:250` `*submit_button = mcp_schema.SubmitButton();` inside
`FillFormControls`; the same `FormMCPSchema` is rebuilt in `ComputeInputSchema()` (`S096:323-328`).

## 3. Disabled limit [OBSERVATION]

Three independent disabled gates stack before a control can be selected:

1. `ProcessForm` skip: `IsDisabledOrReadOnly()` (`form_mcp_schema.cc:1241`).
   - `html_form_control_element.cc:222-224` — `IsDisabledOrReadOnly() = IsDisabledFormControl() || IsReadOnly()`.
   - `html_form_control_element.cc:214-221` — `IsReadOnly()` is `FastHasAttribute(kReadonlyAttr)`, short-circuited to `false` for non-`SupportsReadOnly()` controls when `FixHTMLFormControlElementIsReadOnlyEnabled` is on.
   - `html_form_control_element.cc:313-337` — `IsDisabledFormControl()`: MHTML-archive special case (whole form disabled for archived pages unless view-source), else `IsActuallyDisabled()`.
   - `html_element.cc:4665-4671` — for form-associated custom elements, `HTMLElement::IsDisabledFormControl()` delegates to `ElementInternals().IsActuallyDisabled()`.
2. Predicate gate: `html_form_control_element.cc:388-390` — `IsSuccessfulSubmitButton() = CanBeSuccessfulSubmitButton() && !IsDisabledFormControl()` (second, redundant disabled check on top of gate 1).
3. Custom-behavior gate: `html_submit_button_behavior.h:36-41` — `IsEffectivelyDisabled()` "Considers both the behavior's own disabled property and the element's disabled state (including fieldset inheritance)". Honored on the implicit-submission path: `S096:577-584` — a disabled custom submit behavior stops implicit submission (`"Custom element is disabled; no implicit submission."`), and in the default handler: `html_button_element.cc:219-222` requires `!IsDisabledFormControl()` before form-submit handling.

Net effect (source reading): a disabled native submit button is never selected by
`FormMCPSchema::SubmitButton()` and a disabled custom submit-behavior element never activates
submission; both facts are visible only in code paths quoted above.

## 4. Native limit [OBSERVATION]

`CanBeSuccessfulSubmitButton()` is virtual, base-false (`html_form_control_element.h:89`,
`input_type.cc:805-807`). Overrides that return true:

- `HTMLButtonElement` — `html_button_element.cc:287-289`: `return type_ == kSubmit && !OwnerSelect();`
  - `type_` defaults to `kSubmit` (`html_button_element.h:127` `Type type_ = kSubmit;`) → a `<button>` with no `type` attribute qualifies; `type=button`/`type=reset` do not.
  - `OwnerSelect()` — `html_button_element.cc:363-370` returns the owning `<select>` only when the button is that select's `SlottedButton()`; header comment `html_button_element.h:54-57` ("returns a `<select>` if this button has type=select and is a direct child of a `<select>`"). A select-slotted button is excluded.
  - Adjacent predicate, not used by the MCP selection: `html_button_element.cc:215-217` `IsFormAssociatedSubmitButton()` additionally requires an explicit `type` attribute.
- `HTMLInputElement` — `html_input_element.cc:1116-1118` delegates to `input_type_->CanBeSuccessfulSubmitButton()`; only two input types override it to `true`:
  - `submit_input_type.cc:73-75` — `SubmitInputType::CanBeSuccessfulSubmitButton() { return true; }`
  - `image_input_type.cc:153-155` — `ImageInputType::CanBeSuccessfulSubmitButton() { return true; }` (type registered at `input_type.cc:146` `INPUT_TYPE(kImage, ImageInputType)`).
  - `<input>` with no `type` resolves to text, never a submit button — an input must say `type=submit` or `type=image`.

So the native ceiling is: `<button>` (default or `type=submit`, not select-slotted), `<input type=submit>`, `<input type=image>` — all additionally subject to §3.

## 5. Custom limit [OBSERVATION]

Two custom-element shapes exist in 154, and **neither can be selected** by `FormMCPSchema::SubmitButton()`:

1. Form-associated custom elements: represented in `ListedElements()` by `ElementInternals`
   (`form_mcp_schema.cc:1250-1255`) — parameters only, never the submit button.
2. Elements with `HTMLSubmitButtonBehavior` (attached via `attachInternals()`; `element_internals.cc:442-447`
   `ElementInternals::SetBehaviors`, duplicate-name rejection `:449-457`; usage comment
   `html_element.cc:4695-4696` "`SubmitBehavior()` is non-null only when behaviors were set via `attachInternals()`"),
   feature-gated by `ElementInternalsBehaviorsEnabled` (`element_internals.cc:422,445` DCHECK; hard
   `CHECK` on the submission path at `S096:711`).
   - Behavior class: `html_submit_button_behavior.h:19-24` — "provides submit button behavior to custom elements. When attached via ElementInternals, it allows a custom element to trigger form submission on activation (click or Enter/Space key)"; carries its own `formAction/formMethod/formNoValidate/...` properties (`:54-79`) and `IsActivatedSubmit` during entry-list construction (`:76-79`).
   - Submission path asymmetry, pinned lane source: `S096:702-712` — `HTMLSubmitButtonBehavior* behavior = submitter ? submitter->SubmitBehavior() : nullptr;` and "For custom elements with behaviors, `submit_button` will be null" (`HTMLFormControlElement* submit_button = behavior ? nullptr : DynamicTo<HTMLFormControlElement>(submitter);` with mutual-exclusion `CHECK`s).
   - Yet the same elements count as default buttons elsewhere: `S096:1492-1495` `FindDefaultButton()` returns the first listed element with `SubmitBehavior()` when no native `CanBeSuccessfulSubmitButton` control precedes it; `S096:573-576` implicit submission dispatches a simulated click on them; `html_element.cc:4647-4663` makes them focusable with default tabindex 0 like native buttons; `html_element.cc:4687-4698` gates `:default` matching on `SubmitBehavior() && IsFormAssociatedCustomElement()`.

### 5.1 Source-level divergences around the DCHECK [INFERENCE — source-scoped only]

Both are reading consequences of §2-§5 spans; neither has been executed:

- Behavior-only form (custom submit-behavior element, no native submit control): `FindDefaultButton()` returns the custom element (`S096:1492-1495`) while `submit_button_` stays null (`form_mcp_schema.cc:1240,1250-1255`) → `DCHECK_EQ` at `form_mcp_schema.cc:1258` disagrees in debug builds; in release, `SubmitButton()` is null, so a form without `toolautosubmit` fails with `kMissingRequiredSubmitButton` (`S096:249-258`, LC03).
- Disabled-native-only form: `FindDefaultButton()` tests `CanBeSuccessfulSubmitButton()` without a disabled check (`S096:1489-1491`; `html_button_element.cc:287-289`, `submit_input_type.cc:73-75` carry no disabled test) while `ProcessForm` skips disabled controls (`form_mcp_schema.cc:1241-1243`) → same null-vs-element disagreement in debug; same release fallback via LC03.

## 6. Lifecycle anchors in pinned S096 [OBSERVATION]

Where the selected button lands (matches the design.json LC spans):

| LC | span (S096) | decision (design.json wording) | button-selection relevance |
|---|---|---|---|
| LC01 | 181-186 | autosubmit presence determines require_submit_button | `require_submit_button = !FastHasAttribute(kToolautosubmitAttr)`; autosubmit additionally UseCounters `kModelContextExecuteDeclarativeAutosubmit` |
| LC03 | 249-258 | missing required submit button error | `:250` reads `SubmitButton()`; null + `require_submit_button` → `kMissingRequiredSubmitButton` "No submit button was found, but for a form without `toolautosubmit`, there must be a submit button" |
| LC04 | 212-218 | non-autosubmit focus and PauseExecution, not completion | `submit_button->Focus()` is only reached after LC03 guaranteed non-null; `ModelContextSupplement::PauseExecution()` |
| LC05 | 218-221 | autosubmit immediately prepares submission | `form_->PrepareForSubmission(/*event*/ nullptr, submit_button)` — the selected (enabled, native-only) button is the submitter |
| LC07 | 261-275 | CallDoneCallback clears running/button/invocation state only with callback | null `done_callback_` early-return; clears `is_currently_running_`, `active_submit_button_`, `invocation_id_` and repaints `:tool-submit-active` |

Also selection-adjacent: `S096:155-160` `IsActiveToolSubmitButton()` compares `active_webmcp_tool_->ActiveToolSubmitButton() == element` behind `MatchesToolFormActivePseudoClass()` (`S096:162-164`, requires `CurrentlyRunning()`).

## 7. Candidate manifest rows (input for scribe/planner — NOT admitted decisions)

Per `design.json` manifestShape (id/condition/outcome/startLine/endLine/quote); anchors are the primary
quote sites. These are candidate **source-scoped** rows only; admission is L1's call, and none of them is
a runtime claim:

| id (proposed) | condition | outcome | anchor |
|---|---|---|---|
| LC-CAND-1 | form control is disabled or readonly | skipped by ProcessForm; never a parameter or button candidate | S096-adjacent: form_mcp_schema.cc:1241-1243 |
| LC-CAND-2 | first eligible successful submit button in listed order | selected; later ones ignored (`&& !submit_button_`) | form_mcp_schema.cc:1247-1248 |
| LC-CAND-3 | control is button with default/submit type, not select-slotted; or input type=submit/image | qualifies as native successful submit button | html_button_element.cc:287-289; submit_input_type.cc:73-75; image_input_type.cc:153-155 |
| LC-CAND-4 | submitter carries HTMLSubmitButtonBehavior | submission proceeds with null native submit_button behind ElementInternalsBehaviorsEnabled CHECK | S096:703-712 |
| LC-CAND-5 | FormMCPSchema selection vs FindDefaultButton | debug DCHECK can disagree (custom-behavior-only or disabled-native-only forms); release falls through to LC03 error | form_mcp_schema.cc:1258 + S096:1489-1495 |

If the 12-row LC01-LC12 set stays frozen as declared, these remain report-only observations.

## 8. Observations / inference / unknown — separation

- **Observation**: every quoted span in §2-§6, read this session from the pinned tag bytes (pins §1) or from lane S096.
- **Inference (source-scoped)**: §5.1 divergence consequences; "first-match = listed order" reading of `:1247-1248`. Debug/release split rests on DCHECK semantics, asserted from the macro name only.
- **Unknown / not exercised**:
  1. `HTMLElement::SubmitBehavior()`'s declaration site: not found by grep in `html_element.h` (case-insensitive) nor as a definition in `html_element.cc`; its use is proven at `html_element.cc:4172,4651,4662,4690` and `S096:703`. Behavior headers (`element_behavior.h`, `html_submit_button_behavior.h`) were fetched; neither declares the accessor. Declaration likely in a header not yet opened.
  2. ~~`html_form_control_element.h` fetch~~ — resolved: `9ac014d2702b`, 216 lines; `IsReadOnly()` declared at `:119`, `virtual bool SupportsReadOnly() { return false; }` at `:120`, `IsDisabledOrReadOnly()` at `:121`, base `CanBeSuccessfulSubmitButton()` returns false at `:89`.
  3. No build, no test, no browser run — nothing here establishes runtime behavior of any Chromium build.
  4. Fetched bytes live in `/tmp` (volatile); pins in §1 are re-derivable from the tag URLs recorded in design.json's format.
- Tooling directive compliance: no installs or updates this session (curl/base64/sha256sum only).
