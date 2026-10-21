# Decision05 — C1 DV-05 semantic falsification

**Recommendation: disagree with DV-05 as written; agree with its narrower, actually observed case.** This is an advisory finding, not a round verdict or admission. The retained source explicitly supports some hidden inputs as text parameters, whereas the decision, SKILL row, derived agent rule, and knowledge note describe hidden inputs categorically.

## Scope and axes

- Primary axis: **depth**, through source-to-decision entailment.
- Supporting axes: scope/calibration, receipt and runtime-identity integrity, and counter falsifiability.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`. The read-only lane-tip command returned R. The B→R diff adds the relevant SKILL section and knowledge note; this review concerns those additions and DV-05's evidence chain.
- Read PLAN through its final revision, especially lines 139–146: the current claim is decisions, with unique probe ids, an in-family success control, retained-body binding, and fresh reproduction. I did not substitute the superseded row-count predicate.
- No browser, validation harness, full C1 counter, test suite, or runtime/mutation probe was run by this seat.

## Findings, by severity

### P2 — Hidden-input rejection is missing its decisive `toolparamdescription` guard

**Affected locations:** `corpus/evidence/round-19/validation/decisions.json:110-132`; `SKILL.md:2064,2088-2090`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:43-47`.

The condition covers any targeted hidden input, the answer says it is absent from the schema and has no validator branch, and the derived SKILL rule calls hidden controls unsettable. The fixture only establishes that result for a hidden input **without** `toolparamdescription` (`validation/fixtures/disabled-hidden.html:9`). The original case question already preserves that narrower condition (`validation/cases/disabled-hidden.json:121`), but the decision and prose drop it.

The retained S077 body contradicts the categorical wording. In `form_mcp_schema.cc:1280-1281`, the hidden case of `IsText(ListedElement&)` returns the result of this exact expression:

> `return !ToolParamDescriptionAttribute(control).empty();`

Source location: [Chromium tag 154.0.8037.97, form_mcp_schema.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), lines 1280–1281; retained-body access date **2026-10-21**; decoded-body SHA-256 **`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`**.

The same body supplies the rest of the control-flow proof:

1. `:1213-1217` reads the actual `toolparamdescription` attribute; this is not a general label/ARIA-description test.
2. `:1365-1366` recognizes a text parameter only when its control vector contains exactly one control.
3. `:493-496,556-569` sends a recognized text parameter to text-schema construction.
4. `:254-255,302-318` sends it to text validation; `:460-461,933-942` supplies the corresponding fill path.

**[INFERENCE — source-derived, not browser-reproduced here]:** an otherwise eligible single hidden control with a nonempty `toolparamdescription` takes that text path, rather than the unsupported-type rejection described by DV-05. Nonempty is the exact source guard: a whitespace-only attribute is not tested for being nonblank in this helper. Missing or zero-length descriptions remain in the observed rejection class.

Eligibility also matters: `ProcessForm` filters controls through `IsDisabledOrReadOnly()` before inserting them (`:1238-1246`). A condition that includes filtered controls cannot universally promise “NOT unknown.” The actual hidden probe is enabled and non-readonly (`probes/disabled-hidden.json:751-757`).

**Correction:** narrow the condition to the unique, eligible hidden parameter without a nonempty `toolparamdescription`; do not describe all hidden inputs as unsettable. The existing probe and control can remain unchanged. See the exact replacement below.

### P2 — The generic DV-05 diagnostic assumes a scalar value although its condition imposes no type restriction

**Affected locations:** `decisions.json:112-113`; `SKILL.md:2064`. The knowledge note correctly distinguishes the two diagnostic templates at `:35-39`, making the decision's unqualified quoted-value template inconsistent with its own explanation.

S077 `form_mcp_schema.cc:222-231` chooses the quoted-value diagnostic only if `ToString` succeeds. `ToString` at `:49-68` supports strings, integers/doubles, and booleans; null, arrays, and objects reach its failure result. For the unrecognized hidden type, rejection happens before this diagnostic-formatting step, independent of value coercion.

**[INFERENCE — source-derived, not new runtime observations]:** nested input such as `{"hiddenField":null}`, `{"hiddenField":[]}`, or `{"hiddenField":{}}` still reaches fill-time rejection for the probed kind of hidden control, but the message is `Invalid value for parameter hiddenField`, not `Invalid value "<v>" for parameter hiddenField`. This is distinct from a top-level null input, which encounters the CDP object-input boundary. Empty-string, number, and boolean values do not escape the unsupported-type fallthrough merely because they stringify; stringification here formats the error.

**Correction:** qualify the existing observed decision as a **string-valued** input. Alternatively document both templates, explicitly marking the unmeasured types as source-derived rather than additional runtime-verified cases. The minimal correction below uses the former and fixes both findings without inventing evidence.

## Re-derived source proposition and binding

The required `zcat` decoding was performed on the retained `sources/form_mcp_schema.cc.gz`; piping the decoded bytes to `sha256sum` returned:

`904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`

This equals DV-05's `source.bodySha256`, the knowledge note's source header, and the S077 registry anchor (`corpus/SOURCES.md:91`, opened 2026-10-21).

The current token **`return false;`** is genuinely present at decoded line **299**, inside the declared **246–300** range. Its byte/line binding is therefore correct. Its semantic adequacy is not: that range delegates to `IsText` without showing how hidden controls become text controls. The decisive guard is at **1280–1281**, outside the current range. The original case's source range, **1270–1287**, already points to the more informative classifier.

For the actual fixture, the supported proposition is conditional:

- The constructor processes listed controls (`:117-119`); `ProcessForm` retains this enabled/non-readonly hidden control in the name map (`:1238-1246`).
- With the description attribute absent and no same-name companion, its text classifier is false (`:1270-1287,1365-1366`); the other built-in classifiers do not recognize hidden as their type.
- Schema dispatch reaches its unsupported-type result (`:493-542`), so the property is not emitted by `ComputeJSON` (`:132-147`).
- A fill invocation builds a **new** `FormMCPSchema` in S078 `html_form_element.cc:246-259`. Schema computation's name-map erasure does not make the invocation's fresh lookup map empty.
- Consequently the key is known, but validation reaches the unsupported-type false result (`S077 :246-300`). `FillData` then returns a fill-time error before its application loop (`:208-241`).

This entails the recorded **undescribed-hidden/string-input** case, not categorical hidden-input behavior.

## Re-derived runtime proposition from retained observations

The following are observations in existing artifacts, **not checks executed by this reviewer**.

| Evidence | Input and actual observations |
|---|---|
| Canonical probe case, `receipt.json:951-1024` | `decl-disabled-hidden-03`, input `{"hiddenField":"hidden-after"}`; `commandError:null`; matching invocation / toolInvoked / toolResponded id `BC5CFDA624FFEFEDB6E19677D89DCFE6`; actual CDP status `Error`; actual error `Invalid value "hidden-after" for parameter hiddenField`; submitCount **0**; hidden remains `hidden-before`; all five inspected fields retain defaults; schema contains only `baseline` and empty-name properties; `pass:true`. |
| In-family success control, `receipt.json:1027-1107` | `decl-disabled-hidden-04`, input `{"":"unnamed-after"}`; matching invocation / response id `4B40BC5C16A7FF9A966AFD65D5700170`; status `Completed`, null error, submitCount **1**, unnamed field changes, hidden remains `hidden-before`; `pass:true`. |
| Original family raw probe, `probes/disabled-hidden.json:579-768` | Raw invoke/response id `F919ECF8F3F41E6F50C01ADC3E2B867F`; same string input, actual error, schema omission, `calls:[]`, submitCount 0, and unchanged controls. |
| Original second hidden run, `.runs[]` with `id:"hidden",repeat:2` | Raw invoke/response id `9D226AD9ABEEF907FE0F5C837F233E0C`; same observations. Retained stability metadata at `:2220-2234` reports two repetitions and no nondeterminism. These repetitions are not additional decision ids. |

The successful control establishes an operational form/submit/respondWith path in the same family. It does **not** establish a description-bearing hidden control as either rejected or accepted. Its returned FormData includes `hiddenField:"hidden-before"` (`receipt.json:1071-1077`): absence from inputSchema must not be confused with exclusion from submitted form data.

### Submit timing and zero field application

No timing defect was found for this fixed fixture and recorded case. The canonical source path is stronger than an immediate DOM snapshot alone:

- S077 `FillData :208-241` returns the invalid-input error before reaching any fill application.
- S078 `HTMLFormMcpTool::ExecuteTool :174-220` returns through the error callback before entering the success path or calling submission preparation. `FillFormControls :232-259` propagates the schema fill result.
- The harness waits for the matching invocation's `toolResponded` before calling `pageObservation` (`scripts/webmcp-validation-round19.mjs:1115-1133`). The fixture records submit calls synchronously in its listener, before its resolved `respondWith` completion (`fixtures/disabled-hidden.html:18-26`).

S078 was also decoded with `zcat`. Its observed decoded SHA-256 is **`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`**, matching the retained source header. Source: [Chromium tag 154.0.8037.97, html_form_element.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), retained-body access date **2026-10-21**. No new claim is made about arbitrary page scripts scheduling later independent submissions.

## IDs, identity, and counter strength

### Checks with concrete supporting evidence

- JSON extraction found **27 decision ids, all unique; 46 probe-id uses, all unique; 66 canonical receipt case ids, all unique**. DV-05's probe belongs only to DV-05. `decl-disabled-hidden-04` is reused as a **control** by DV-04 and DV-05, which is permitted by the declared unique-probe contract.
- The family definition contains four distinct ids (`cases/disabled-hidden.json:8,47,86,125`), with probe and control different. Both have the expected family.
- Duplicate definitions/receipt records/probe ownership are explicitly rejected by the canonical counter (`measure-c1.mjs:383-411,470-481,564-576,621-639`); the harness independently refuses duplicate case definitions (`webmcp-validation-round19.mjs:1008-1012`).
- The canonical receipt names Chromium **154.0.8037.97**, Playwright **1.64.0**, Node **24.21.0**. I did not launch a second runtime or reroute it. The counter's canonical reproduction uses the absolute pinned Node binary and checks out the requested revision into its sandbox (`measure-c1.mjs:748-786`), then checks both receipts' identity and producer/file bindings (`:829-865`). This is a source audit of the run logic, not a fresh reproduction result.
- The scoped `sha256sum` results equal the canonical receipt's bindings:
  - producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`;
  - `disabled-hidden.json`: `cf85f0a96b9e05a33380451ee20bf20510d6ea0bcc17877fb9b3c6bec6eb6d71`;
  - `disabled-hidden.html`: `15b6233e1d4a0529f4790b4177820f2292ed00b8ac22b992c1b4210e0fd4e3f9`.
- For this case, the harness's actual comparison checks the full expected `properties` object as well as the listed field values (`webmcp-validation-round19.mjs:1043-1062`), so an extra hidden schema property would fail the fresh case expectation.

### What the counter does not establish

These are **static verification gaps**, not executed mutant results or additional claimed runtime failures:

1. `sourceRejection` checks digest, line bounds, token occurrence, and a source reference (`measure-c1.mjs:579-610`); it does not establish semantic entailment. A generic false-return token can bind while omitting the decisive discriminator, as DV-05 does.
2. The SKILL-row check verifies row presence and probe/control/source identifiers, not equality or correctness of its condition, answer, or source-line text (`:522-560`). A green counter therefore cannot settle either finding above or prevent prose drifting from the manifest. The knowledge note is not checked by that row-binding logic.
3. `receiptObservation`/`comparableReceiptRecord` normalize to status, errorText and submitCount, plus input/expectation/pass (`:484-507`); `validateDecisionCases :667-701` compares that normalization. **Committed** `observed.schema`, `observed.fields`, and raw `toolResponded` are not themselves compared with the fresh receipt or independently revalidated. The producer does check fresh schema/fields, but the counter does not independently authenticate all corresponding committed raw-observation claims. Do not describe this as complete raw-receipt equivalence.

The finite evidence supports one hidden-rejection decision and its in-family positive control. It is not saturation over hidden control descriptions, value types, duplicate parameter names, or filtered-control states. Resume continuity, planner identity rerouting, and admission mechanisms are outside this decision's changed behavior; no result is asserted for them.

## Exact correction for the integrator

Apply the same scoped condition/answer to `decisions.json` DV-05 and `SKILL.md:2064`:

- **Condition:** `A key uniquely names an enabled, non-readonly <input type=hidden> with absent/empty toolparamdescription, and supplies a JSON string`.
- **Answer:** `Absent from inputSchema but present in the control map: fill-time Error Invalid value "<v>" for parameter <name>; no field values are applied and no submit occurs`.
- Keep probe `decl-disabled-hidden-03`, control `decl-disabled-hidden-04`, and the current observed outcome unchanged.
- Keep S077 and the current body hash. Replace the weak source selection with **lines `[1270,1287]`**, token **`return !ToolParamDescriptionAttribute(control).empty();`**; the SKILL source cell should also identify `:208-241,493-542` as the diagnostic/application/schema context.

Replace the categorical hidden sentence in the knowledge note (`:45-46`) with:

> The probed hidden input has no nonempty `toolparamdescription`: it is absent from the schema but retained in the control map, so its supplied string fails at fill time rather than as unknown. The retained source treats an otherwise eligible single hidden control with nonempty `toolparamdescription` as text; that alternative was not runtime-probed by this decision.

Change the derived SKILL rule (`:2088-2090`) so that disabled/readonly controls remain described separately, and only **the undescribed hidden control in this decision** is called unsettable. Do not label description-bearing or null-valued variants runtime-verified without a corresponding observed case. Narrowing these statements requires no new case ids or fabricated receipt changes.

## Residual risk and verification gaps

- **LSP unavailable:** `read xd://lsp` returned “No such tool” and listed no mounted lsp device. Consequently status, references, definition and diagnostics could not be requested; there was no server/indexing result to treat as absence. Literal grep was used only to locate prose/call sites. The findings rest on the inspected source bodies, JSON, and canonical control flow, not semantic claims about grep output.
- Retained bodies were decoded and hashed locally; no external source URL was fetched by this seat. Remote/tag authenticity is not independently re-established here.
- The description-bearing, empty-description, whitespace-description, nested-null/array/object, and scalar-coercion variations are source-derived boundaries, not new runtime receipts. Source evidence is enough to require the scope correction; browser confirmation belongs to a separately authorized runtime seat.
- No full-counter result, fresh browser pass, mutation rejection, build, lint, or suite result is claimed. Tooling installs/updates: **none**.
- The gzip ranged-read attempt for S078 returned “empty archive directory”; the source was instead read through `zcat`, and the read-tool anomaly was reported through `xd://report_issue`.

## Isolation

- Clone path: **none**; this was a read-only semantic review, with no runtime/mutation probe or production-file creation.
- Branch: **none**.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`; reviewed checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Clone commit: **none**; no Git write or commit was performed.
- Changed paths: **only** `.ufo/waves/round-19/w2/Decision05.md` (this seat-owned report).
- Processes/services started: only finite read-only Git, zcat, and sha256sum commands, all returned; no browser, persistent process, background job, or service was started.
