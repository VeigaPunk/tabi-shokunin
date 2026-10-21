# SrcFormSchemaFill — Chromium 154 declarative form input source map

## Provenance and scope

- **URL:** https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- **Access date:** 2026-10-21; Gitiles GET returned HTTP 200 (68,940-byte base64 carrier).
- **Pinned source:** tag `154.0.8037.97`, Chromium commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- **Decoded body:** 51,703 bytes; 1,440 lines; SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- **Retained body:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SrcFormSchemaFill.body.gz`; gzip SHA-256 `7556e07f43ee91790c83430134b67794fa50d7497d961574baf3926a306a9f26`.
- **Method:** decoded the `?format=TEXT` response and inspected source only; no browser, test, build, or runtime probe. The local source-dossier S071 has the same decoded digest and records Git blob `9c546c66839da38bde273f5dd43042ff9785ce76` (`.ufo/waves/round-18/sources/DeclarativeValidation.md:9-12`).

## Findings — observed source

`ProcessForm` builds the name-to-controls map from form controls that are not disabled/read-only, and adds named `ElementInternals` controls only when their name is nonempty (`form_mcp_schema.cc:1238-1258`). `FillData` therefore validates against this map, not by independently validating arbitrary JSON Schema text.

### FillData errors and transaction boundary

- **Unknown parameter** (`FillData`, lines 208-220): for each input object member, look up its key in `name_to_controls_`; if absent, return `ScriptToolErrorCode::kInvalidInputArguments` (216-219). Message: `Input contains a parameter "<parameter_name>" but there is no such parameter for the tool`.
- **Known name, rejected value** (221-231): if `ValidateParameterData` is false, try `ToString` on the rejected JSON value. If it succeeds, return `kInvalidInputArguments` with `Invalid value "<coerced_value>" for parameter <parameter_name>` (223-227). Otherwise return the same code with `Invalid value for parameter <parameter_name>` (228-231).
- **Preflight then fill** (210-243): the first loop validates every supplied member; only after all pass does the second loop call `FillParameterData` (234-241). Thus the source does not start filling later entries after finding an invalid entry. Members omitted from the input are not visited in either loop and are not explicitly reset. Empty input likewise makes no setter call. These are consequences of the loops and do not establish runtime event behavior.
- The source has only these two `ScriptToolError` return sites (grep of the fetched body); both use `kInvalidInputArguments`. No fill helper returns a `ScriptToolError`.

### Coercion helpers

- `ToString` (`49-69`) accepts JSON strings, integers, doubles, and booleans; numbers become `String::Number`, booleans become lowercase `true`/`false`. Other JSON kinds fail conversion.
- `ToBoolean` (`71-92`) accepts a JSON boolean; an integer as false iff zero; or a string equal case-insensitively to `true`/`false`, or exactly `1`/`0`. It does not accept doubles or other strings.
- These conversions are used by validation and again by fill helpers. Consequently “string” parameters need not arrive as JSON strings, and a one-checkbox parameter accepts more than a JSON boolean.

### Validation dispatch and branch coverage

`ValidateParameterData` (`246-300`) dispatches as follows; a group matching no listed predicate returns false at 299-300 and reaches the generic invalid-value error above.

| Lines | Predicate / controls | Validation and rejection conditions |
|---|---|---|
| 253-269 → 302-319 | `IsText`, `IsDate`, `IsDatetimeLocal`, `IsMonth`, `IsWeek`, `IsTime`; each uses `ValidateTextData` | Exactly one control; value must convert with `ToString`. Empty string is accepted. For an `HTMLInputElement`, require `SanitizeValue(s)` nonempty; otherwise the control must be a `HTMLTextAreaElement`. Covers text/email/search/tel/url/password inputs, textarea, date/datetime-local/month/week/time inputs, plus color at 286-287. Hidden input is `IsText` only when `ToolParamDescriptionAttribute` is nonempty (`1270-1287`). |
| 271-272 and 277-278 → 321-335 | `IsNumber` and `IsRange`; `ValidateNumberData` | Exactly one input; `ToString` must succeed and yield a nonempty string whose input `SanitizeValue` is nonempty. It does not itself compare the original value against a separately implemented JSON-number rule. |
| 274-275 → 390-427 | `IsSelect`; `ValidateSelectData` | Must be an `HTMLSelectElement`. Allowed values are option values. Single select: one `ToString`-convertible value exactly present in the options. Multiple select: JSON array; every member converts to string, matches an option, and is unique (the allowed-value set is erased after each match). |
| 280-281 → 337-372 | `IsCheckbox`; `ValidateCheckboxData` | One checkbox: `ToBoolean` must succeed. Multiple same-name checkboxes: JSON array; each item converts to string, matches a control's value, and is unique (erase from allowed-values set). Empty array is accepted. |
| 283-284 → 374-388 | `IsRadio`; `ValidateRadioData` | Value must convert to string and equal one radio control's value; no array branch. |
| 289-292 | `IsCustomElement` | The predicate requires `ElementInternals`, nonempty `ToolParamSchema`, and a parsed JSON object (`1344-1355`), but validation itself returns `true` unconditionally. The source has a TODO about custom-element validation; no shape/value validation is applied here. |
| 293-297 → 429-449 | `IsFile`; `ValidateFileData` | Feature-gated by `WebMCPDeclarativeFileInputEnabled`; exactly one input. A multiple file input requires an array and every item must pass `IsAccessibleFile`; a non-multiple input requires one passing item. `IsAccessibleFile` (`94-111`) requires an execution context, `ToString`, an absolute path, and `GetFileMetadata(...).has_value()`. `std::all_of` means an empty multiple-file array passes validation. |
| 299-300 | Any mapped group matching none of the above | `false`, then the generic `Invalid value for parameter <name>` error unless the value is stringifiable, in which case the stringified-value form is used. |

The individual control predicates and group cardinality rules are at `1270-1438`: text/date/datetime-local/month/week/time/number/select/range/color/custom/file predicates are single-control predicates at `1366-1402`, `1424-1437`; checkbox and radio accept nonempty groups only when every member has that type (`1404-1421`). File matching additionally requires the runtime feature (`1357-1364`).

### Fill dispatch, skips, and control mutations

`FillParameterData` (`451-489`) mirrors the validation predicates: text/date/datetime-local/month/week/time/color → `FillTextData`; number/range → `FillNumberData`; select → `FillSelectData`; checkbox → `FillCheckboxData`; radio → `FillRadioData`; custom → `FillCustomElementData`; file → feature check then `FillFileData`. It has no final `else` action; preflight's false result normally prevents unsupported groups from reaching the second loop.

- **Text-like fields** — `FillTextData` (`933-948`): if `ToString` fails it returns without setting. Otherwise an input or textarea receives `SetValue` with `kDispatchInputAndChangeEvent` (941-946). This covers the text/date/time/etc. mappings above, including color and conditional hidden input.
- **Number/range** — `FillNumberData` (`950-960`): for an input, converts with `ToString`, `CHECK`s success with the message `ValidateNumberData should be called first`, then `SetValue` with input/change event behavior (957-958).
- **Single checkbox** — `FillCheckboxData` (`962-975`): `CHECK(ToBoolean(...))`, `SetChecked(checked, kDispatchInputAndChangeEvent)`, explicit `DispatchChangeEvent`, then return (969-974).
- **Checkbox group** — `FillCheckboxData` (`977-1001`): builds a set from the validated array, then sets *each* checkbox checked iff its `Value()` is in the set, dispatching change for each (982-1000). Thus omitted group values are unchecked when the parameter itself is supplied.
- **Radio group** — `FillRadioData` (`1003-1019`): a failed `ToString` returns without a set (1005-1008); otherwise only controls whose value equals the string get `SetChecked(true, ...)` and `DispatchChangeEvent` (1009-1017). No explicit `SetChecked(false)` appears for nonmatching controls.
- **Single select** — `FillSelectData` (`1021-1032`): converts value (CHECK), then calls `SelectOptionByValue(..., send_events=true, WebAutofillState::kNotFilled)` and returns.
- **Multiple select** — `FillSelectData` (`1034-1054`): CHECKs array and string conversions, computes indices of options whose value is selected, then calls `SelectMultipleOptions`.
- **Custom element** — `FillCustomElementData` (`1056-1064`): enqueues a tool-fill callback for the target with `value.ToJSONString()`; no native input/textarea setter is called.
- **File input** — `FillFileData` (`1065-1093`): feature-gated. `add_if_valid` silently returns for a path that no longer passes `IsAccessibleFile` (1074-1081). For a multiple input, a non-array returns before setting files (1083-1088); otherwise it visits each item. For a non-multiple input it checks the one value, then calls `SetFilesFromPaths(paths)` (1089-1092). With stable state, validation precludes invalid values; if metadata/context changes between preflight and fill, the fill helper can omit an invalid item instead of returning a `ScriptToolError`. The source itself flags a privacy-review TODO at 1067.

### Verbatim source quotations (all under 25 words)

1. `form_mcp_schema.cc:210` — `// If the data isn't valid, form control states remain unchanged.`
2. `form_mcp_schema.cc:218-219` — `StrCat({"Input contains a parameter \"", parameter_name,` / `                  "\" but there is no such parameter for the tool"}));`
3. `form_mcp_schema.cc:225-226` — `StrCat({"Invalid value \"", string_value,` / `                                       "\" for parameter ", parameter_name}));`
4. `form_mcp_schema.cc:290` — `// TODO(andruud): How to do validation for custom elements?`

## Proposed SOURCES row (11 columns)

This is a fresh, narrower scope supplement to S071, not a change to its existing row. S071 currently records `FillData:208-243` and was opened 2026-10-20; the directly observed unknown-parameter branch is `216-219`. A newly opened row is needed for a 2026-10-21 source citation and for the per-control validation/coercion/fill decisions. The exact URL duplicates S071, so retain the narrow scope below rather than claim a new independent source.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 Blink declarative form input validation and fill — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | code | A | Chromium 154 declarative form parameter coercion, per-control validation, error templates, and value/fill branches; not general JSON Schema conformance | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `form_mcp_schema.cc:49-111,208-490,930-1093,1238-1438`; decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | Unknown keys and rejected supported values return `kInvalidInputArguments`; validation dispatch is type-specific, custom elements bypass validation, and successful branches mutate supported controls through their corresponding setters. Source-level only. | mined | 2026-10-21 | on-release | `SKILL.md` — round-19 declarative WebMCP input-validation decision table |

## Evidence boundary / remaining unknowns

- Observed here: the tag-pinned source branches, exact strings, helper logic, setter calls, Gitiles status, decoded size/digest, and retained gzip artifact.
- Source-derived inference: an invalid later property prevents the fill loop from starting; custom-element inputs are not value-validated by this function; file-fill skips can arise if accessible-file state changes after preflight.
- Not established: any live Chromium 154 `toolResponded` status/error text or control state, actual event dispatch effects, or general JSON Schema compliance. This is not a runtime validation probe.
- LSP was not exposed among the available tools. Existing S071 dossier `DeclarativeValidation.md:28-30` records the source call path through `html_form_element.cc:258` into `FillData`; this report confines its new map to the assigned file.
