# Chromium 154 declarative form-schema construction (C1 source scout)

Axes covered: source provenance; form-control eligibility and grouping; JSON Schema type/choice/required/metadata construction; omission and empty-name behavior.

## Provenance and retained source

Opened 2026-10-21 from Chromium Gitiles at tag `154.0.8037.97` (tag commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`). Gitiles `?format=TEXT` returns a base64 carrier; the retained files below are its decoded source bytes, gzip-compressed with deterministic gzip metadata.

| Source | URL | Decoded source bytes | Decoded SHA-256 | Retained body |
|---|---|---:|---|---|
| `form_mcp_schema.cc` | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 51,703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `.ufo/waves/round-19/w1/SrcFormSchemaBuild.body.gz` |
| `form_mcp_schema.h` | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.h?format=TEXT | 9,243 | `e44593c07b6048aec70404aa000e354157f38838d6065984de684629159340f7` | `.ufo/waves/round-19/w1/SrcFormSchemaBuild.h.body.gz` |

These are source-derived findings, not a Chromium runtime probe. The header describes `ComputeJSON()` as the input-schema computation entry point and declares the per-control builders and `ComputeAnyOfArray` (`form_mcp_schema.h:41-43, 56-121, 148-158`).

## Line-numbered construction map

### Overall object and control selection

- `form_mcp_schema.cc:117-119`: constructor immediately calls `ProcessForm(form)`.
- `:121-151`: `ComputeJSON()` always starts with top-level `{"type":"object"}`; initializes `required` and `properties`; iterates `ordered_names_` in first-appearance order; emits each supported name once; appends names whose builder set `is_required`; erases each name after its first pass; then writes both `properties` and `required` (including an empty required array). A null property builder result is omitted (`:133-150`).
- `:154-181`: empty-name form controls can generate a missing-name issue, but the issue path only reports for controls whose schema type is recognized (`:165-179`); it does not remove those controls from the subsequent schema pass.
- `:491-539`: dispatch order is text, date, datetime-local, month, week, time, number, select, range, checkbox, radio, color, custom element, file; no matching branch returns `nullptr` (`:494-539`).
- `:542-553`: a parameter name resolves to its full control vector. Most type predicates require exactly one control (`:1366-1402, 1424-1432`); checkbox and radio predicates accept a nonempty vector only when every member has that same type (`:1404-1421`). Thus same-name homogeneous checkbox/radio groups are supported; other multi-control groups and mixed-type same-name groups fail dispatch and are omitted (`:539`).

### Property schemas by control type

- **Text-like string** — one `input` of type `text`, `email`, `search`, `tel` (Blink `kInputTelephone`), `url`, or `password`, or a `<textarea>` (`:556-569, 1270-1287`): `type: "string"`; applies an HTML `pattern` if eligible below; computes description; required follows the element's `IsRequired()`. `email` and `url` receive no special `format`; no `minLength`/`maxLength` are set.
- **Hidden input** — `type=hidden` is recognized as text only when `toolparamdescription` is nonempty (`:1270-1286`, specifically `:1280-1282`); then it follows the text-string builder and can carry a valid pattern. Without that attribute it fails type dispatch and emits no property. Other description sources do not make an otherwise undescribed hidden input eligible.
- **Date** — `input type=date` (`:571-585, 1289-1292`): `type: "string"`, `format: "date"`, description plus date-format context, and `required` from `IsRequired()`. No `minimum`/`maximum` are emitted; the source explicitly notes those schema fields must contain numbers, not dates (`:580-584`).
- **Datetime-local** — `input type=datetime-local` (`:588-633, 1294-1298`): `type: "string"`; `format` is a regular-expression string selected from `StepRange.Step()`: `<1000` allows optional seconds and 1–3 fractional digits (`:606-613`), `<60000` allows optional seconds (`:614-621`), otherwise only `yyyy-MM-ddThh:mm` (`:622-629`). No min/max; description and required follow.
- **Month** — `input type=month` (`:635-649, 1300-1303`): `type: "string"`, `format: "^[0-9]{4}-(0[1-9]|1[0-2])$"`, description, required; no min/max.
- **Week** — `input type=week` (`:651-665, 1305-1308`): `type: "string"`, `format: "^[0-9]{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$"`, description, required; no min/max.
- **Time** — `input type=time` (`:667-701, 1310-1313`): `type: "string"`; `format` regex varies by step: `<1000` permits optional seconds/fraction (`:685-689`), `<60000` permits optional seconds (`:690-693`), otherwise `HH:mm` only (`:694-697`). No min/max; description and required follow.
- **Number** — `input type=number` (`:703-731, 1315-1318`): `type: "number"` (not `integer`, even with step); numeric `minimum`/`maximum` only when the `StepRange` has them (`:712-718`). `multipleOf` is set only when a step exists and the step base is divisible by that step (`:719-725`). Also applies the eligible HTML pattern, description and required. No `format`.
- **Select** — one `<select>` (`:733-771, 1320-1322`): for every listed option, creates `{type:"string", const: option.value, title: option.textContent}` and a direct `enum` value (`:741-750`). A single select is `type:"string"` with `anyOf` plus `enum` (`:760-764`); `multiple` is `type:"array"`, with `items:{type:"string", anyOf, enum}` and `uniqueItems:true` (`:752-759`). Description and `required` from the select. The option loop has no disabled-option filter (`:743-750`).
- **Range** — `input type=range` (`:773-796, 1324-1327`): `type: "number"`; always emits numeric `minimum` and `maximum` from `StepRange` (including HTML defaults) (`:781-785`); emits `multipleOf` only when step-base divisibility permits (`:786-792`). Description and required follow; no pattern or format.
- **Checkbox** — homogeneous checkbox group (`:798-837, 1329-1332, 1404-1411`). One checkbox gives `type:"boolean"`, required from that control, plus description (`:802-809`); it does not emit enum/anyOf. Multiple same-name checkboxes give `type:"array"`, `items:{type:"string", anyOf, enum}`, and `uniqueItems:true` (`:812-835`). Item `const` values are each input's current `Value()`; choice titles appear only when label text is nonempty; required is OR across the group (`:854-872`).
- **Radio** — homogeneous radio group (`:839-852, 1334-1337, 1414-1421`): `type:"string"`, `anyOf` choice objects and direct `enum` of values (`:843-850`); each choice has `const` and gets a `title` only if associated label text is nonempty (`:860-870`). Required is OR across group members (`:870`); description follows.
- **Color** — `input type=color` (`:875-891, 1339-1342`): `type:"string"`, `format:"^#[0-9a-zA-Z]{6}$"`, description and required. This is the exact source regex; no min/max. The regex class is broader than hexadecimal digits (`a-zA-Z`), despite the adjacent comment describing a six-digit hex value (`:883-889`).
- **Form-associated custom element** — `ElementInternals` with a nonempty `ToolParamSchema()` that parses to a JSON object (`:893-907, 1344-1355`): parsed object is the property schema, not a synthesized scalar type; `AddDescription` may set/override its description when a computed description exists; builder forces required false (`:899-905`). Other custom-element schema shapes are not recognized.
- **File** — `input type=file` only while `WebMCPDeclarativeFileInputEnabled` is on (`:909-928, 1357-1364`). Single file is `type:"string"`; `multiple` is `type:"array"` with `items:{type:"string"}` (`:917-924`). Description and `IsRequired()` are applied. No generated format, enum, bounds, uniqueness constraint or pattern.

### Choice operators, title/description, and constraints

- Choice arrays are emitted as `anyOf`, never as a generated `oneOf`. `ComputeSelectParameterSchema` names its local array `one_of` but stores it under JSON key `anyOf` (`:741-749, 752-763`); radio/checkbox group helpers likewise store under `anyOf` (`:826-828, 847-850`). The helper also writes redundant direct `enum` values; source comments say this is to help the agent generate input (`form_mcp_schema.h:105-121`). The custom-element schema is passed through, so any `oneOf` there would originate in authored schema, not these builders.
- No ordinary property builder generates a top-level `title`. Titles are attached to select choice objects using option text even if empty (`:743-748`), and to radio/checkbox choice objects only when `LabelText()` is nonempty (`:865-867`). An authored custom schema may retain its own title.
- `AddDescription` adds a `description` only when its computed string is nonempty; optional extra context is parenthesized after a nonempty description or used alone (`:1095-1109`). For a single control, `ComputeDescription` prefers `toolparamdescription`, then concatenated associated label text, then `aria-description` (`:1150-1173`; labels are whitespace-stripped and joined by `"; "` at `:1219-1235`). For multi-control parameters it uses only `toolparamdescription` on the nearest common-ancestor `<fieldset>` before the form (`:1175-1210`).
- `AddPattern` only stores a non-null HTML `pattern` that compiles as a regex; an empty-but-present valid pattern is retained, and an invalid one is omitted after a console error (`:1111-1145`). It is called for text and number schemas only (`:565, 727`); it does not synthesize patterns for the other built-in types. A custom schema may supply any pattern itself.
- Built-in `format` output is limited to date, datetime-local, month, week, time and color (`:577-580, 606-629, 641-645, 657-661, 674-697, 882-888`). Numeric minimum/maximum/multipleOf are limited to number and range, with the conditions above (`:712-725, 781-792`). The other built-in builders do not set these fields.

### Excluded and unnamed controls

- **Disabled or read-only:** `ProcessForm` immediately skips a `HTMLFormControlElement` for which `IsDisabledOrReadOnly()` is true (`:1238-1245`).
- **Buttons / unsupported types:** ordinary form controls are collected first, but no schema dispatch branch handles button/submit/reset/image or other unlisted types; they return null and therefore do not become properties (`:491-539, 1270-1364`). The first successful submit button is separately saved during form processing for submission (`:1247-1249`); this does not add a button schema branch.
- **Hidden:** not unconditionally skipped; see conditional `toolparamdescription` gate above (`:1280-1282`).
- **Empty parameter name:** regular `HTMLFormControlElement`s are inserted even when the returned WebMCP name is empty (`:1244-1246`); `ComputeJSON` has no empty-name guard and passes the name to `properties->SetObject` (`:133-149`). For a supported unnamed control, the source therefore attempts a property under the empty string and separately reports a missing-name issue (`:154-181`). This is source behavior; no runtime serialization was tested. By contrast, an `ElementInternals` entry with empty `GetName()` is explicitly skipped (`:1250-1255`).
- **Not form-listed control kinds / invalid groupings:** only listed form controls and `ElementInternals` are processed (`:1238-1257`); unsupported types, invalid custom schemas, and same-name combinations not accepted by the type predicates are omitted through the null-builder path (`:491-539, 1344-1355, 1366-1438`).

## Verbatim source excerpts

1. `form_mcp_schema.cc:564` — `schema->SetString("type", "string");`
2. `form_mcp_schema.cc:826-827` —
```cpp
items_schema->SetArray(
      "anyOf", ComputeAnyOfArray(controls_for_name, enum_array, required));
```
3. `form_mcp_schema.cc:1241-1243` —
```cpp
if (form_control->IsDisabledOrReadOnly()) {
  continue;
}
```
4. `form_mcp_schema.cc:1280-1282` —
```cpp
case FormControlType::kInputHidden:
  return !ToolParamDescriptionAttribute(control).empty();
```

## Proposed SOURCES entry

S071 already covers the `FillData` validation behavior at `form_mcp_schema.cc:208-243`; this proposal isolates the separate schema-construction scope at the same pinned primary source. Proposed 11-column contract row:

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 `form_mcp_schema.cc` and `.h` — [implementation](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), [header](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.h?format=TEXT) | code | A | Form-derived declarative WebMCP inputSchema construction at Chromium tag 154.0.8037.97 only | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `.cc:121-181, 491-539, 556-928, 1095-1236, 1238-1438`; `.h:41-50, 56-121, 148-158`; decoded `.cc` SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | Chromium 154 maps supported form-control groups to the listed JSON Schema property types and choice fields, with build-scoped required/description/constraint logic; it emits `anyOf`, not generated `oneOf`, and its empty-name behavior differs between form controls and ElementInternals | queued | 2026-10-21 | on-release | — |
## Evidence classification and limits

- **Observed in opened source:** the line-numbered dispatch, schema fields, descriptions, constraints, required rules, and form-control inclusion gates described above. The `.cc` body hash also matches the hash already recorded for this tagged source in the S071 dossier; the `.h` was independently fetched and hashed for this report.
- **[INFERENCE] Output consequence:** for a recognized unnamed HTML form control, the source passes an empty name through to `properties->SetObject`; therefore the builder attempts an empty-string property while reporting a missing-name issue. No runtime JSON serialization was observed.
- **Unresolved:** this is not evidence that Chromium 154 actually emitted each schema branch at runtime. The file-input schema's reachability depends on the effective `WebMCPDeclarativeFileInputEnabled` runtime state, which these source files alone do not establish. No schema-validator or runtime behavior was tested.
