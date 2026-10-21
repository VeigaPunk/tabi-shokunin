# DV-04 — semantic falsification (Decision04, W2)

## Verdict

**Disagree with DV-04 as worded; agree with the two observed cases only.** The retained Chromium source supports filtering disabled/readonly `HTMLFormControlElement`s from the name-registration pass. It does not support the unconditional claim that a key for such a control is always absent from `inputSchema` and rejected as unknown: the API is keyed by name, and another listed control with the same name can register that parameter. The evidence cleanly supports the narrower fixture claim for its unique `disabledField` and `readonlyField` names.

Severity: **moderate documentary/measurement-scope defect**, not a defect in the observed two-case runtime result.

## Source proposition, exact binding, and scope

`decisions.json` DV-04 binds `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`, decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, lines `[1238,1243]`, token `IsDisabledOrReadOnly`. I decompressed the retained body and recomputed that exact decoded hash; it matches. The gzip container hash is different, as expected. S077 is marked mined/opened 2026-10-21 in `corpus/SOURCES.md:91`.

S077, Chromium 154.0.8037.97 `form_mcp_schema.cc`, lines 1238-1243, says: `if (form_control->IsDisabledOrReadOnly()) { continue; }` — <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT> (opened 2026-10-21; decoded-body SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`). This token and line range are exact. **That cited span proves the skip, not the full outcome.** The wider S077 body supplies the rest of the mechanism:

- `ProcessForm` skips the disabled/readonly control before `GetWebMCPParameterName`/`EnsureControlVector`/`ordered_names_` (S077:1238-1246). `ComputeJSON` emits schema properties by walking `ordered_names_` (S077:121-152).
- `FillData` looks up each input key in `name_to_controls_` and returns the unknown-parameter `kInvalidInputArguments` before per-type validation when no mapping exists (S077:208-231). Its comment is `form control states remain unchanged` (S077:210), and the apply loop is later (S077:234-241). The error template contains `but there is no such parameter for the tool` (S077:218-219). Same URL, access date, and decoded SHA-256 as above.
- The name map is not a per-element target map. `EnsureControlVector(name).push_back(...)` groups controls by name (S077:1244-1246). Thus a non-filtered control sharing the name can register it. A supported enabled sibling makes the parameter available; a same-name un-described hidden control is also registered for filling even though it lacks a schema branch (S077:1270-1286, 246-300), so its own validation path can return `Invalid value`, not “unknown.” These are source-derived counterexamples, **not** new runtime probes.
- The separate `ElementInternals` branch registers nonempty names (S077:1250-1256). The table's surrounding SKILL scope excludes custom elements (SKILL.md:2047), so the decisive counterexample does not depend on custom elements; ordinary same-name HTML controls suffice.

Submit timing is supported by S078, not by the DV-04 token span. In S078 `HTMLFormElement::HTMLFormMcpTool::ExecuteTool`, `FillFormControls` runs first; if it returns an error, `done_callback` receives that error and control returns before the success/autosubmit block (S078:174-222). `FillFormControls` calls `FillData` (S078:231-259). Quote: `if (error.has_value())` (S078:196-198) — <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT> (opened 2026-10-21; decoded-body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`). This justifies no submit after this fill error; the receipt supplies the observed CDP status and event count.

## Runtime proposition from retained observations

`fixtures/disabled-hidden.html:7-8` has a disabled text input `name="disabledField"` and a readonly text input `name="readonlyField"`, each with a unique name. The corresponding case inputs are nonempty strings (`cases/disabled-hidden.json:8-16,47-55`), not nulls or other JSON types.

For `decl-disabled-hidden-01`, `receipt.json` records `toolResponded.status=Error`, the full unknown-parameter error for `disabledField`, `commandError=null`, `submitCount=0`, the schema properties only `baseline` and `""`, and all five recorded control values unchanged; `pass=true`. `decl-disabled-hidden-02` records the same observations for `readonlyField`. The in-family control `decl-disabled-hidden-04` completes and submits once, so it is a valid success control; it is intentionally reused by DV-05. Its success proves harness/tool operability, not a duplicate-name variant. The current observations therefore strongly establish the reported result **for these two unique-name text inputs on the pinned runtime**.

Null/type/coercion boundary: within a valid top-level JSON object, S077 checks whether the parameter name exists before it looks at the property's value. For a name genuinely absent from the map, a string, number, boolean, null, array, or object value does not reach coercion/validation; source predicts the same unknown-key return. DV-04's receipt tests only strings, so the non-string behavior is source-derived, not observed. Do not conflate it with top-level null/array input: S078:237-247 rejects non-object JSON before `FillData`.

## Prose comparison and exact correction

- `SKILL.md:2063` and knowledge note `webmcp-declarative-validation-round-19.md:43-47` repeat DV-04's broad absent-schema/unknown claim without the same-name qualification. The note's `:76-77` claim that the disabled/readonly element itself is unsettable remains compatible, but should not be read to mean every key bearing its name is unknown. Its hidden-input correction at `:95-97` does not fix this separate name-collision scope issue.
- Adjacent mentions are distinct: SKILL `:2072` / knowledge note `:59-60` concern a disabled **option**, which is accepted; SKILL `:2076` concerns a disabled radio. A radio's name normally groups enabled members too, so the disabled radio can be excluded while its key remains registered and the disabled value is rejected by group validation (`Invalid value`, not an unknown key). That does not support universal DV-04 behavior.
- Probe IDs `decl-disabled-hidden-01` and `-02` are distinct and are not reused as another decision's probes. Control `decl-disabled-hidden-04` is shared with DV-05; this is allowed by the stated rule (probe IDs must be unique; controls are in-family Completed cases). The C1 counter's `duplicateProbeCases` scans probe references only (`measure-c1.mjs:564-576`), and its case validation checks control family/receipt and Completed status (`:659-713`).

**Suggested exact `condition` replacement** (for `decisions.json` and the SKILL row):

> A key names a disabled or readonly listed form control, and no other listed control registers that WebMCP parameter name.

**Suggested exact `answer` replacement**:

> In the observed Chromium 154 fixture, the unique names `disabledField` and `readonlyField` are absent from `inputSchema`; targeting either with the tested string returns `toolResponded` Error for an unknown parameter, leaves all controls unchanged, and records no submit. The unknown-key result depends on no other listed control registering the same name.

The corresponding knowledge-note key paragraph should say that disabled/readonly controls are skipped before name registration, then qualify absent-schema/unknown behavior to names with no other registered control; a same-name sibling's own schema/validator determines the outcome.

## Counter strength, residual risk, and verification gaps

The C1 counter is strong on identity/provenance and reproducibility: it checks the source body digest and token-in-lines (`measure-c1.mjs:579-610`), case/fixture digest bindings, producer/runtime identity, unique probe references, and a fresh harness run (`:748-801,804-876`). The harness compares the expected schema and each listed field as well as status, error substring, and submit count (`scripts/webmcp-validation-round19.mjs:1043-1062`); the retained receipt shows both DV-04 cases pass.

There is one relevant integrity limit: the counter's fresh-versus-committed comparison projects `observed` down to status, errorText, and submitCount (`measure-c1.mjs:484-508,680-687`). It checks `pass=true`, but does not compare committed raw `observed.schema`/`observed.fields` with the fresh record or independently recompute committed `pass`. Thus the fresh harness validates its own actual field/schema observations, but a committed raw-state mismatch can escape the receipt-equality check if its pass flag and the compared top-level outcome remain unchanged. If the archived receipt's unchanged-control assertion is intended to be counter-authenticated, include schema/fields (or validate committed observations against the case expectation) in that comparison.

No browser, supplemental duplicate-name probe, or full C1 counter was run, per assignment. The retained receipt's runtime identity is the single declared Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 identity. No resume path or saturation claim is implicated. The LSP device is not mounted in this session (`read xd://lsp` returned “No such tool”); literal search was used only to locate prose, with conclusions based on the actual source, manifest, fixture, cases, receipt, harness, and counter text.

## Isolation

Report-only seat. No production files, tests, counters, browser processes, or lane git refs were changed; no clone/branch/commit was created. The only direct lane write is this report: `.ufo/waves/round-19/w2/Decision04.md`.