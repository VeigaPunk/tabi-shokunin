# DeclarativeValidation — S071 source dossier (S042 supersession)

Fetched 2026-10-20 by seat TabiR18.LiveS042-2 via public GET only. Source tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; author and committer both 2026-09-30 21:20:00. Channel: Chromium gitiles `?format=TEXT` (base64 carrier). No code, test, browser or fixture execution.

## Provenance (tag-pinned)

| File | URL | HTTP | Carrier bytes | Carrier sha256 | Decoded bytes | Decoded sha256 | Git blob |
|---|---|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT` | 200 (wire 25450 B) | 91040 | `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed` | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` |
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT` | 200 (wire 15486 B) | 68940 | `290b093eb67d181161dac25aac727747d382c28ba621cbff95e21a008884aa94` | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `9c546c66839da38bde273f5dd43042ff9785ce76` |

Tree binding: `…/third_party/blink/renderer/core/html/forms/?format=JSON` at the same tag lists `html_form_element.cc` id `cd7efa45…` and `form_mcp_schema.cc` id `9c546c66…`, matching `git hash-object` of the decoded bodies. `Carrier sha256` is of the base64 bytes as served; `Decoded sha256` is of the decoded UTF-8 source.

## Gate quote (19 words, inside FillData)

`form_mcp_schema.cc:216-219`, `FormMCPSchema::FillData`, unknown-parameter rejection; normalized offset 7285; occurs once:

> `return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Input contains a parameter \"", parameter_name, "\" but there is no such parameter for the tool"}));`

Secondary (`form_mcp_schema.cc:224-226`, invalid-value rejection; 11 words; offset 7593; once):

> `return ScriptToolError(ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Invalid value \"", string_value, "\" for parameter ", parameter_name}));`

Both sit in `FillData` (`form_mcp_schema.cc:208-243`): unknown name at 214-220, invalid value at 221-231, values applied only after both loops pass at 234-241. Normalizer for offsets: NFC, curly quotes/dashes folded, whitespace runs collapsed (the round-18 producer's normalizer). The quote is C++ code; backslashes are as in the file.

## Declarative call path (same invoke entry)

`content/browser/devtools/protocol/webmcp_handler.cc:58-116` (`InvokeTool`; input serialized at 90-99; call at 104-105) → `third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc:987-1000` (`InvokeScriptToolForInspector` posts `ModelContext::ExecuteTool` at 998-1000) → `model_context.cc:528` (`ExecuteTool`; declarative dispatch at 562-565) → `model_context.cc:695` (`ExecuteDeclarativeTool`) → `model_context.cc:719` (`tool->ExecuteTool`) → `html_form_element.cc:174` (`HTMLFormMcpTool::ExecuteTool`) → `html_form_element.cc:192` (`FillFormControls`) → `html_form_element.cc:237` (`ParseJSON`), 245-247 (object check), 249 (`FormMCPSchema`), 258 (`mcp_schema.FillData(*json_obj)`) → `form_mcp_schema.cc:208-243` (quoted rejection). `HTMLFormMcpTool::ComputeInputSchema` (`html_form_element.cc:277-282`) serializes the same `FormMCPSchema`; `model_context.cc:841` stores it as the tool's `input_schema`.

Finite counterexample: declarative form tool with `<input name="x">`, CDP `invokeTool` with `input: {"y":1}` → `kInvalidInputArguments` "Input contains a parameter \"y\" but there is no such parameter for the tool"; the tool does not execute. A value failing `ValidateParameterData` takes the second rejection.

## Claim supported and limits

Supports: S042's universal clause "input is never checked against inputSchema" (`corpus/SOURCES.md:56`) is false for declarative tools; the planned S071 row can quote `form_mcp_schema.cc:216-219` as the direct rejection.

- Static source only; no running build or fixture was invoked for this dossier. The rejection is [INFERENCE] from the complete call chain, not observed at runtime.
- The check is against the form-derived parameter map (`name_to_controls_`), the same form data `ComputeInputSchema` serializes; it is not a byte comparison of the JSON Schema text.
- `ValidateParameterData` is type-specific; custom elements return true (`form_mcp_schema.cc:289-292`), so not every declarative control type is validated. This does not affect the unknown-parameter falsification.
- L1 owns the S071 row and Gate; no SOURCES row, Gate or production file was edited here.
