# C1 source dossier — JSON Schema 2020-12 versus Chromium declarative `inputSchema`

## Finding

**Observed:** Chromium 154's declarative form path serializes a form-derived schema into `inputSchema`, then validates invocation data through `FormMCPSchema::FillData` and native HTML form validation. It is not a general JSON Schema evaluator. The five requested keywords are carried in supported control schemas, but their runtime treatment differs:

| Keyword | What the derived declarative schema carries | What Chromium enforces on invocation |
|---|---|---|
| `type` | Root `type: object`; per-control values include `string`, `number`, `boolean`, and `array`. Array schemas may include `items.type`. | `ValidateParameterData` dispatches by associated control kind. Text/numeric fields require convertible values and run HTML `SanitizeValue`; single checkboxes require a boolean; select/radio/grouped checkbox branches require their respective string/array shapes. This is control-specific logic, not evaluation of the JSON Schema `type` keyword. Custom-element controls are an explicit exception: their validator returns `true` (see map). |
| `enum` | Select, radio, and grouped-checkbox schemas carry `enum` values; select/radio also emit `anyOf` with per-option `const`. For multiple select/checkbox controls, `enum` is nested under `items`. | Select/radio validators compare input against the form's allowed option values; grouped checkboxes require allowed, unique strings. Enforcement is implemented from the controls, not by interpreting `enum`/`const`/`anyOf`. |
| `required` | `ComputeJSON` collects names into the root `required` array when a control-derived `required` flag is true. | `FillData` loops only over keys present in the supplied object, so it does not reject an omitted required property itself. A later normal form submit runs `ValidateInteractively` unless validation is skipped (`novalidate`, `formnovalidate`, etc.); that is a separate HTML constraint-validation gate. A non-autosubmit invocation first fills fields and pauses for user submission. |
| `minimum`, `maximum` | Number inputs emit each available inclusive bound; range inputs emit both bounds, using the range defaults when no attributes override them. Step may also produce `multipleOf`. | `ValidateNumberData` converts and sanitizes the value; it contains no direct bound comparison. On submit, Chromium's HTML form validation gate runs; `HTMLInputElement` exposes `RangeUnderflow`/`RangeOverflow` and `ValueMissing`, which are the HTML-side control checks, not JSON Schema keyword evaluation. The submit gate can be bypassed by the listed form/submitter conditions. |
| `format` | Date emits `format: "date"`. Date-time-local, time, month, week, and color emit regex-like strings in `format` (for example `^...$`); these strings are constructed as control hints. | `FillData` does not read or evaluate the schema's `format`. Date/time-like values go through `ValidateTextData` and the control's `SanitizeValue`; actual form submit separately uses native HTML validity. Neither is JSON Schema `format` assertion evaluation. Under JSON Schema 2020-12, `format` is collected as an annotation by the Format-Annotation vocabulary; assertion support is optional and assertion evaluation is disabled by default. |

Other emitted schema keywords include `pattern`, conditional `multipleOf`, `anyOf`, `const`, `items`, and `uniqueItems`, plus UI metadata such as `title`/`description`. Built-in numeric schemas use inclusive `minimum`/`maximum`, not `exclusiveMinimum`/`exclusiveMaximum`. A custom element can supply its own parsed parameter schema; its `ValidateParameterData` branch currently returns true, so schema keywords in that custom schema are not thereby enforced by this validator.

**Inference:** The native submission gate can enforce the form controls' HTML constraints (including required and numeric range validity), but that must not be described as Chromium evaluating JSON Schema `required`, `minimum`, `maximum`, or `format`. `FillData` and the submit gate are separate mechanisms.

**Unresolved:** This is source analysis only; no Chromium runtime/CDP probe was run by this seat. Actual behavior also depends on the selected control type, submit path, form/submitter validation flags, and page event handling. Whether an external consumer treats the regex-like `format` strings as meaningful is consumer-specific. No LSP device was mounted (`read xd://lsp` returned “No such tool”); literal source search/read was used as fallback, not presented as semantic LSP proof.

## Source provenance

- Requested source: <https://json-schema.org/draft/2020-12/json-schema-validation>
- Access date: **2026-10-21**. Retrieved as the HTTP content-decoded body (`curl --compressed`).
- Decoded body: **169,423 bytes**, **3,184 lines**, SHA-256 `bc982a03be9ba4e7da597a0f10dc00614aa28dc413e6981186405473981fd267`.
- Retained body: `.ufo/waves/round-19/w1/SrcJsonSchemaValidation.body.gz` (gzip artifact, 33,328 bytes).
- Versioned source anchor: JSON Schema source tag `draft-bhutton-json-schema-validation-01`, commit `add836e705c9a07434c467b6b90946ba45258a73`, file `jsonschema-validation.xml`. Retrieved decoded XML: 82,430 bytes, SHA-256 `dcba094c316c17922cb95cc36affc53b9d9521139bfd5a3afdd1cc810ab39773`. The source text at this pinned snapshot matches the quoted clauses; the requested page remains the quote/body authority.
- Chromium files were fetched from Gitiles `?format=TEXT` at tag `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`) and base64-decoded before hashing:
  - `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`: 51,703 bytes; SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
  - `third_party/blink/renderer/core/html/forms/html_form_element.cc`: 68,278 bytes; SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
  - `third_party/blink/renderer/core/html/forms/html_input_element.cc`: 101,127 bytes; SHA-256 `ea5fab7a8e73ed6c978e95e57ffa59742c33eb1126f4d8e08d2f6ffd1714805c`.
  - `third_party/blink/renderer/core/script_tools/model_context.cc`: 50,117 bytes; SHA-256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`.

## Line-numbered map

### JSON Schema page and pinned source

The HTML line numbers below refer to the retained decoded page body; the XML numbers are the pinned source snapshot above.

- **Validation vocabulary class:** HTML §6, lines 1668–1672; XML lines 208–215. This identifies validation-vocabulary keywords as assertions (not annotations).
- **`type`:** HTML §6.1.1, lines 1685–1701; XML lines 217–235. Values are a primitive type string or type array; matching type is the assertion condition.
- **`enum`:** HTML §6.1.2, lines 1703–1715; XML lines 237–249. The value is an array and the instance must equal one of its elements.
- **`maximum` / `minimum`:** HTML §6.2.2, lines 1748–1758, and §6.2.4, lines 1770–1780; XML lines 278–287 and 300–308. These are inclusive numeric bounds. `exclusiveMaximum`/`exclusiveMinimum` are separate numeric keywords in HTML §§6.2.3/6.2.5, lines 1759–1769 and 1781–1791; XML lines 289–298 and 311–320.
- **`required`:** HTML §6.5.3, lines 1955–1966; XML lines 482–494. A listed property name must occur in the instance.
- **`format` vocabulary and default:** HTML §7.1, lines 1995–2038; XML lines 520–570. Format-Annotation support is REQUIRED (HTML 2022–2026; XML 549–555); Format-Assertion support is OPTIONAL (HTML 2027–2034; XML 556–564).
- **Annotation versus assertion:** HTML §7.2.1, lines 2046–2066; XML lines 577–617. The value is collected as an annotation when supported; treating it as an assertion is optional and disabled by default. The separate Format-Assertion requirements are HTML §7.2.2, lines 2088–2141; XML lines 619–673.
- **Unknown/custom format values:** HTML §7.2.3, lines 2143–2152; XML lines 674 onward. Unknown formats must still be collected as annotations; under Format-Assertion, unknown formats fail. This matters because Chromium stores regex-like text under `format` for several controls.

### Chromium 154 schema production and invocation

URLs use the pinned tag above. Line numbers are the decoded C++ source, not the base64 Gitiles carrier.

- `html_form_element.cc:277–282`: `HTMLFormMcpTool::ComputeInputSchema` constructs `FormMCPSchema`, calls `ComputeJSON`, and serializes it. `model_context.cc:841` attaches that result as `ScriptTool.input_schema`; `model_context.cc:1043–1044` exposes it as `inputSchema`.
- `form_mcp_schema.cc:121–151`: `ComputeJSON` creates root `type: object`, `properties`, and `required`; walks names once, emits supported parameter schemas, and pushes names whose `required` output flag is true.
- `form_mcp_schema.cc:491–539`: dispatch from control group to per-control schema generator; unsupported controls return null.
- `form_mcp_schema.cc:556–568`: text/textarea emit `type: string`, optional HTML `pattern`, and required state.
- `form_mcp_schema.cc:571–701`: date emits `type: string` and `format: date`; date-time-local/time/month/week emit `type: string` and regex-like `format` values; required state comes from `IsRequired`. The date-time-local/time comments explain the regex and why standard `date-time`/`time` formats are not used.
- `form_mcp_schema.cc:703–730`: number emits `type: number`, conditional `minimum`/`maximum`, conditional `multipleOf`, optional `pattern`, and required state.
- `form_mcp_schema.cc:733–770`: select emits `enum` plus per-option `anyOf`/`const`; multiple select puts `enum` under `items` and emits `uniqueItems`.
- `form_mcp_schema.cc:773–795`: range emits `type: number`, inclusive min/max, sometimes `multipleOf`, and required state.
- `form_mcp_schema.cc:798–873`: single checkbox is boolean; grouped checkboxes and radio use `enum` plus `anyOf`/`const`; grouped checkbox enum is nested under `items` with `uniqueItems`.
- `form_mcp_schema.cc:875–891`: color emits `type: string` and a regex-like `format`. `form_mcp_schema.cc:893–907`: custom-element schema is parsed from `ToolParamSchema`; required is set false. `form_mcp_schema.cc:909–928`: file controls emit string or array-of-string schema.
- `form_mcp_schema.cc:208–243`: `FillData` iterates supplied keys, rejects an unknown name at 214–220, rejects an invalid provided value at 221–231, and only after all supplied values validate applies them at 234–241. There is no loop over omitted schema `required` names.
- `form_mcp_schema.cc:246–299`: dispatches to type-specific validators. Text/date/time/month/week/color go to `ValidateTextData`; number/range to `ValidateNumberData`; select/checkbox/radio/file each have their own validator. Custom-element validation returns true at 289–292 (with a TODO comment).
- `form_mcp_schema.cc:302–319`: text validation checks string conversion; empty string passes; an input's `SanitizeValue` must be nonempty for a nonempty value; textarea accepts strings. `form_mcp_schema.cc:321–334`: numeric validation checks conversion and nonempty sanitized value only—no explicit minimum/maximum/step comparison here.
- `form_mcp_schema.cc:337–388` and `390–427`: checkbox, radio, and select validators compare against allowed values; grouped controls require unique allowed strings.
- `form_mcp_schema.cc:1111–1145`: HTML `pattern` attribute is copied into the schema's `pattern` keyword only if it compiles as a regular expression.
- `html_form_element.cc:174–221`: declarative invocation fills controls; without `toolautosubmit`, it focuses the submit button and pauses; with it, it immediately calls `PrepareForSubmission`.
- `html_form_element.cc:713–759`: `PrepareForSubmission` skips interactive validation only for no page, `novalidate`, or a form-/submitter-level no-validate flag. Otherwise it calls `ValidateInteractively`; invalid declarative submissions fail with a form-validation error. `html_input_element.cc:251–278, 296–305` exposes native `ValueMissing`, `RangeUnderflow`, `RangeOverflow`, `Minimum`, `Maximum`, and `StepMismatch` predicates for the HTML controls. This is HTML form validation, separate from evaluating JSON Schema keywords.
- `model_context.cc:752–811`: imperative JS tools parse JSON and invoke the registered callback; this function does not apply the tool's `inputSchema` to invocation arguments. Declarative dispatch is separate at `model_context.cc:562–565`, and `ExecuteDeclarativeTool` calls the form tool at 695–745.

## Verbatim quotations

All three quotes below are from the requested JSON Schema page, accessed 2026-10-21; decoded body SHA-256 `bc982a03be9ba4e7da597a0f10dc00614aa28dc413e6981186405473981fd267`.

1. **HTML §6, lines 1669–1670** — <https://json-schema.org/draft/2020-12/json-schema-validation>: “Validation keywords in a schema impose requirements for successful validation of an instance. These keywords are all assertions without any annotation behavior.” (22 words.)
2. **HTML §7.2.1, lines 2051–2053** — same URL: “The value of format MUST be collected as an annotation, if the implementation supports annotation collection.” (16 words.)
3. **HTML §7.2.1, lines 2055–2059** — same URL: “The implementation MUST provide options to enable and disable such evaluation and MUST be disabled by default.” (17 words.)

Together, quotes 2–3 state the requested format default precisely: annotation collection, with optional assertion evaluation disabled by default. Format-Assertion is a separate OPTIONAL vocabulary.

## Proposed SOURCES row (11-column contract; not written to SOURCES.md)

| id | title — URL | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | JSON Schema Validation (2020-12) — https://json-schema.org/draft/2020-12/json-schema-validation | spec | A | 2020-12 Validation and format-vocabulary semantics only; not implementation conformance | Draft 2020-12 versioned URL; source tag `draft-bhutton-json-schema-validation-01` at commit `add836e705c9a07434c467b6b90946ba45258a73`, `jsonschema-validation.xml` §§type, enum, maximum, minimum, required, format; fetched 2026-10-21; served decoded SHA-256 `bc982a03be9ba4e7da597a0f10dc00614aa28dc413e6981186405473981fd267` | `type`, `enum`, `required`, `minimum`, and `maximum` are validation assertions; `format` is annotation by default, with assertion support in a separate optional vocabulary | mined | 2026-10-21 | on-release | — |

## Isolation

- Production clone/branch/commit: not applicable; no production file or clone was created.
- Clone changed paths: none.
- Only lane writes: this seat-owned report and `.ufo/waves/round-19/w1/SrcJsonSchemaValidation.body.gz`, both permitted W1 artifacts. No source tree, shared registry, cases, fixtures, counters, or production evidence was modified.