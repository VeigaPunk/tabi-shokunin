# RevengeSchemaDerive — declarative `<form>` → WebMCP `inputSchema`

Seat: `TabiR16.RevengeSchemaDerive-5` (leaf, read-only). Wave 1.
Slice: reconstruct, from Chromium source, how declarative forms map to `inputSchema`
(types, `required`, `enum`) and which Inspector issues fire. No browser, gate, counter
or selftest was run; every claim below is source/test evidence, not runtime observation.

## 0. Source pins and method

- Repo: `github.com/chromium/chromium`, branch `main`, pinned commit
  `05abdb878fa62ed76a61b413b0c3f9d55838b8b9` (resolved this session with
  `timeout 60 git ls-remote https://github.com/chromium/chromium.git refs/heads/main`
  → `05abdb878fa62ed76a61b413b0c3f9d55838b8b9	refs/heads/main`).
- Fetch method: `curl -sS https://raw.githubusercontent.com/chromium/chromium/<SHA>/<path>`
  per file, then re-fetched at the SHA and `diff -q`-verified identical to the `main`
  copies used for line numbers (all five diffs printed `SAME_*`).
- Access date: 2026-10-20. All anchors `path:line` refer to that commit.
- Files opened this session (line counts observed):
  - `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` (1440)
  - `third_party/blink/renderer/core/html/forms/form_mcp_schema.h` (205)
  - `third_party/blink/renderer/core/html/forms/html_form_element.cc` (1784)
  - `third_party/blink/renderer/core/html/forms/html_form_element.h` (399)
  - `third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc` (3603)
  - `third_party/blink/renderer/core/html/forms/html_form_control_element.cc`
  - `third_party/blink/renderer/core/script_tools/model_context.cc` (1369)
  - `third_party/blink/renderer/core/script_tools/model_context.h`
  - `third_party/blink/public/mojom/devtools/inspector_issue.mojom`
  - `third_party/blink/renderer/platform/wtf/text/wtf_string.h`

Located quotes (all ≤25 words, opened this session):

- `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:131-132` —
  "We must emit parameters in the same order they (first) appear in the ListedElements() traversal."
- `third_party/blink/renderer/core/html/forms/form_mcp_schema.h:112-114` —
  "Emitting the enum is redundant, but helps the agent figure out how to generate the input data."
- `third_party/blink/renderer/core/html/forms/html_form_element.cc:387-388` —
  "`title` is not required to form a valid tool; only `name` and `description` are required."
- `third_party/blink/public/mojom/devtools/inspector_issue.mojom:321-325` —
  the five `kFormModelContext*` `GenericIssueErrorType` enumerators.

## 1. When a `<form>` becomes a declarative tool

`HTMLFormElement::ScheduleDeclarativeWebMCPToolRegistration()` (`html_form_element.cc:377-445`):

- Returns immediately unless `ModelContext::IsDeclarativeWebMCPEnabled(...)` (377-380).
- Document must have a frame and not be sandboxed without `allow-scripts`
  (`CanDocumentHaveDeclarativeWebMCPTools`, 361-372).
- Validity test (385-389):
  `is_valid_mcp_form = isConnected() && name && description`, where `name`/`description`
  are `FastGetAttribute()` results and WTF `String::operator bool()` is `!IsNull()`
  (`wtf_string.h:209`, verified). **A present-but-empty attribute is "present".**
- Registration is posted as a task on the DOMManipulation task runner (439-444), then
  `RegisterDeclarativeWebMCPTool` (447-504) re-checks validity, computes the schema, builds
  an `HTMLFormMcpTool`, and calls `ModelContext::RegisterDeclarativeTool` (501).
  On rejection it drops the tool (`active_webmcp_tool_ = nullptr`), with no Inspector issue.
- Recompute triggers: insertion/removal (521, 584), the four tool attributes
  (`toolname`/`tooldescription`/`tooltitle`/`toolautosubmit`, 1187-1198), child changes
  (1677-1680), form-control attribute changes via `ScheduleWebMCPSchemaUpdateIfActive`
  (`html_form_control_element.cc:171-177`), associate/disassociate (1262, 1274).

At the browser boundary the schema is a **string**:
`script_tool->input_schema = declarative_tool->ComputeInputSchema();`
(`model_context.cc:890`), alongside `name`, `description`, `title` (885-890).

Registration gate in `ModelContext::RegisterDeclarativeTool` (`model_context.cc:862-901`)
silently returns `false` on: `tools` permissions-policy off (866-871), duplicate tool name
(873-875), invalid script-tool name (877-879). There is **no** `FormModelContext*` issue
type for any of these.

`HTMLFormMcpTool::ComputeInputSchema()` (`html_form_element.cc:288-294`) is exactly
`FormMCPSchema(*form_).ComputeJSON()->ToJSONString()` (or `"{}"`).

## 2. Top-level schema shape

`FormMCPSchema::ComputeJSON()` (`form_mcp_schema.cc:121-152`):

```
{ "type": "object", "properties": { ... }, "required": [ ... ] }
```

- `"type":"object"` always (123).
- `required` array **always emitted, possibly empty** (125, 149).
- Parameter order = first appearance in the `ListedElements()` traversal (131-133).
  `name_to_controls_.erase(name)` after the first emission (145) makes later duplicates a
  no-op.
- A `nullptr` from `ComputeParameterSchemaForName` means "unsupported": the name is omitted
  from both `properties` and `required` (135-144).
- `tooltitle` does **not** enter `inputSchema`; it travels separately as `ScriptTool.title`
  (`model_context.cc:889`).

## 3. Which controls become parameters (`ProcessForm`, 1238-1259)

Iterates `form.ListedElements()` in tree order:

- `HTMLFormControlElement`: skipped entirely if `IsDisabledOrReadOnly()` (1241-1243),
  which is `IsDisabledFormControl() || IsReadOnly()`
  (`html_form_control_element.cc:251-253`) — **readonly controls are excluded too**.
- Parameter name = `String(GetName()).StripWhiteSpace()` — i.e. the `name` content
  attribute, leading/trailing whitespace stripped (`html_form_control_element.cc:416-421`).
  No fallback to `id`/label.
- The first successful submit button is recorded for `SubmitButton()` (1247-1249); submit
  controls themselves are not parameters.
- `ElementInternals` (form-associated custom element): only added when
  `internals.GetName()` is non-empty (1250-1256).

## 4. Control → JSON Schema mapping

Dispatch order in `ComputeParameterSchemaForControls` (`form_mcp_schema.cc:491-540`);
`ControlVector` predicates require `size()==1` for the scalar types
(1366-1425) and "all members are type X" for checkbox/radio groups (1404-1421).

| HTML control | Schema emitted | Anchor |
|---|---|---|
| `input` text/email/search/tel/url/password, `textarea` | `{"type":"string"}` + `pattern` (if `pattern` attribute compiles) + `description` | 556-568, 1270-1287, `AddPattern` 1111-1145 |
| `input type=hidden` | treated as text **only when** `toolparamdescription` is non-empty; otherwise omitted | 1280-1281 |
| `input type=date` | `string`, `format:"date"`, description default `"Dates MUST be provided in 'YYYY-MM-DD' format."` (appended in parentheses to any own description) | 571-586, 582-583 |
| `input type=datetime-local` | `string`, `format` = regex chosen by `step`: `<1000` allows fractional seconds, `<60000` allows optional seconds, else `hh:mm` only | 588-633, 606-629 |
| `input type=month` | `string`, `format:"^[0-9]{4}-(0[1-9]|1[0-2])$"` | 635-649 |
| `input type=week` | `string`, `format:"^[0-9]{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$"` | 651-665 |
| `input type=time` | `string`, `format` = regex by `step` (fractional/seconds/minutes) | 667-701 |
| `input type=number` | `{"type":"number"}`, `minimum`/`maximum` when the step range has them, `multipleOf` only when `StepBase % Step == 0`, plus `pattern` when valid | 703-731 |
| `select` (single) | `string`, `anyOf:[{type:"string",const:option.value,title:option.textContent}...]`, `enum:[option.value()...]` | 733-771, 741-750 |
| `select[multiple]` | `array`, `items:{type:"string",anyOf,enum}`, `uniqueItems:true` | 752-759 |
| `input type=range` | `number`; `minimum`/`maximum` **always** (defaults 0/100); `multipleOf` when step base % step == 0 (default step 1 → `multipleOf:1`) | 773-796 |
| single `checkbox` | `{"type":"boolean"}` + description | 798-810 |
| multiple `checkbox` same name | `array`, `items:{type:"string",anyOf,enum}`, `uniqueItems:true` | 812-836 |
| `radio` group (all same name) | `string`, `anyOf:[{type:"string",const:input.Value(),title:label-if-nonempty}...]`, `enum:[...]` | 839-852, 854-873 |
| `input type=color` | `string`, `format:"^#[0-9a-zA-Z]{6}$"` | 875-891 |
| form-associated custom element | `ElementInternals::ToolParamSchema()` parsed verbatim as the parameter schema + `description`; `required` forced `false` | 893-907 |
| `input type=file` | `string`, or `array`+`items:{type:"string"}` when `multiple`; **only if** `WebMCPDeclarativeFileInput` is enabled, otherwise omitted | 909-928 |
| anything else (submit/reset/button/image, `output`, mixed types) | `nullptr` → property silently omitted | 491-540 |

Notes verified by unit tests in the same commit (`html_form_mcp_tool_test.cc`; fixture
enables `ScopedWebMCPForTest`, `ScopedDeclarativeWebMCPForTest`,
`ScopedWebMCPDeclarativeFileInputForTest` at 80-82):

- disabled *and* readonly excluded — 454-510.
- text/`textarea` baseline — 512-568.
- select single/multiple exact JSON — 821-897.
- number `minimum`/`maximum`/`multipleOf`/`pattern` matrix — 996-1057.
- checkbox boolean / group array — 1117-1222.
- range defaults and step-base rule — 1438-1526.
- date `format:"date"` — 1585-1612; datetime step regexes — 1640-1676.
- color format — 1876-1902; hidden/pattern — 1983-2026.
- radio anyOf/enum — 2304-2358; required propagation — 2458-2502.
- file single/multiple — 2780-2812; custom element — 2652-2708.
- duplicate text name `text2` → property omitted entirely — 749-777.
- radio+text sharing a name → property omitted entirely — 2425-2456.

## 5. `required` array rules

Computed inside each `Compute*ParameterSchema`; pushed only when the property is emitted
(`form_mcp_schema.cc:141-143`).

- Scalar controls: `required = element.IsRequired()` (567, 584, 631, 647, 663, 699, 729,
  768, 794, 807, 889, 926).
- Radio group / multi-checkbox group: `required |= input.IsRequired()` per member
  (`ComputeAnyOfArray`, 854-871) — **the whole group is required if any member is**;
  test 2458-2502.
- Custom elements: always `false` (905).
- A `required` name may never refer to a missing property: both are gated by the same
  non-null schema check (137-143).

## 6. `enum` / `anyOf` specifics

- `enum` and `anyOf` are emitted **together and redundantly** by design
  (`form_mcp_schema.h:105-117`).
- `anyOf` entry shape is `{"type":"string","const":<value>,"title":<human text>}`:
  - `select` options: `const = option.value()`, `title = option.textContent()`
    (unconditionally set, may be empty) — 743-749.
  - radio / multi-checkbox: `const = input.Value()` (defaults to `"on"` when no `value`
    attribute), `title = LabelText(input)` only when non-empty — 860-870.
- Option/value source is `GetOptionList()` / `input.Value()`; disabled `<option>`s are not
  filtered out of the advertised enum, and fill validation uses the same unfiltered value
  set (`ValidateSelectData`, 390-427).
- `select[multiple]` and multi-checkbox put `anyOf`/`enum` **inside `items`**, not at the
  property level; radio puts them at the property level.
- Single checkbox is a boolean, so it has no `enum`.

## 7. Descriptions (what suppresses the "missing title/description" issue)

`ComputeDescription` + `AddDescription` (`form_mcp_schema.cc:1095-1109, 1147-1189`):

1. Single-control parameter: `toolparamdescription` attribute → label text (all labels,
   `TextContentExcludingLabelable().StripWhiteSpace()`, joined `"; "`) → `aria-description`.
2. Multi-control parameter: `toolparamdescription` on the nearest common-ancestor
   `<fieldset>` (walk stops at the form, 1191-1211). Per-member `toolparamdescription` is
   ignored — test 1227-1276.
3. `date` appends the format hint in parentheses.

No form-derived branch ever sets `"title"`; only a custom element's own
`toolParamSchema` can. In practice `ReportParameterIssueIfNeeded`'s `title` check (187-189)
is therefore description-only for native controls.

## 8. Issues that fire

Enum defined at `third_party/blink/public/mojom/devtools/inspector_issue.mojom:321-325`:
`kFormModelContextParameterMissingTitleAndDescription`, `...MissingToolName`,
`...MissingToolDescription`, `...RequiredParameterMissingName`,
`...ParameterMissingName`. All are `GenericIssue` details; DevTools surfaces them as
`Audits.issueAdded` with those `errorType` names (test asserts the protocol enum directly,
`html_form_mcp_tool_test.cc:3349-3354`).

| Issue | Trigger (exact) | Violating node | Emitted from |
|---|---|---|---|
| `...MissingToolName` | connected form, document can have tools, **not** valid, `(name \|\| description)` non-null, and `name.empty()` | the `<form>` | `ReportInvalidMCPFormIssueIfNeeded`, `html_form_element.cc:341-359` (call at 394-396) |
| `...MissingToolDescription` | same preconditions, `name` non-empty and `description` null/empty | the `<form>` | same, 355-358 |
| `...ParameterMissingName` | during `ComputeJSON`: any control registered under the empty parameter name whose single-control schema is supported, and `IsRequired()` false | that control | `ReportMissingParamNameIssuesIfNeeded`, `form_mcp_schema.cc:154-182` (173-179) |
| `...RequiredParameterMissingName` | same, control `IsRequired()` true | that control | 172-178 |
| `...ParameterMissingTitleAndDescription` | each emitted property with neither `title` nor `description`; violating node is `controls.front()` | first control of that parameter | `ReportParameterIssueIfNeeded`, 184-206 |

Precise gating/details:

- Missing-name/description issues require `document_can_have_tools` and at least one of the
  two attributes; a form with **neither** attribute reports nothing (391-396; test
  3409-3420). Because `String` truthiness is null-ness, `toolname=""` counts as present:
  - `toolname="" tooldescription="x"` → passes `is_valid_mcp_form`, no issue, registration
    is silently rejected later by `IsValidScriptToolName("")` (`model_context.cc:877-879`).
  - `toolname=""` with no `tooldescription` → invalid, `name.empty()` true →
    `MissingToolName` (not `MissingToolDescription`).
  - `tooldescription=""` is accepted; the tool registers with an empty description.
- Parameter issues only fire when `ComputeJSON` runs, i.e. from
  `RegisterDeclarativeWebMCPTool` (494-497) or a recompute. They therefore require a
  connected form with both attributes non-null, and they fire even if the subsequent
  `RegisterDeclarativeTool` call is rejected.
- Unsupported unnamed controls produce **no** missing-name issue (test 3497-3518).
- No de-duplication: repeated schedule/recompute adds another issue (test 3381-3407).
- Within one `ComputeJSON`, all empty-name issues precede per-parameter
  title/description issues (test 3555-3600 asserts index 0 = required-missing-name,
  index 1 = missing title/description).
- If the document has no frame, both reporting helpers bail (155-157, 198-200).

## 9. Quirks a probe harness should encode (source-derived)

1. `required` is always present; `{"q":{...}}` with no `required` attribute yields
   `required: []` — matches the L1 probe observation.
2. Same-name duplicate text fields are dropped entirely (no property, no issue)
   [test 749-777].
3. Radio + text sharing a name drops the property entirely [test 2425-2456].
4. `enum` is advertised alongside `anyOf`; for `multiple`/checkbox-group it is nested inside
   `items` [source 752-759, 820-832].
5. Disabled **and readonly** controls vanish; `hidden` appears only with a non-empty
   `toolparamdescription` [source 1270-1287; tests 454-510, 1983-2026].
6. `file` inputs require the `WebMCPDeclarativeFileInput` feature; without it they are
   silently absent even when named/described [source 909-914, 1357-1364].
7. `format` is used as a raw regex string for color/datetime/time/month/week (non-standard
   JSON Schema `format` values); `date` uses the standard `"date"`.
8. Number/range use `minimum`/`maximum`/`multipleOf`; `multipleOf` is omitted when the step
   base is not a multiple of the step (e.g. `min=1 step=2`).

Two behaviours are code-derived but not covered by a unit assertion in this commit; label
them inference when probed:

- [INFERENCE] An unnamed but supported control (e.g. `<input type=text toolparamdescription=…>`)
  is reported under the empty name **and** still emitted as `properties[""]`; the loop at
  `form_mcp_schema.cc:133-146` does not skip the empty name, and only the issue branch
  (159-181) treats it specially.
- [INFERENCE] `ToolParamDescriptionAttribute` on a `fieldset` is used only when the
  parameter has >1 control (`ComputeDescription`, 1175-1188), so a lone control inside a
  described fieldset still triggers `ParameterMissingTitleAndDescription`.

## 10. What was not run

- No Chromium build, no unit-test execution, no headless browser, no CDP `WebMCP.enable`
  call. The L1 probe observation (`WebMCP.toolsAdded` with
  `{type:"object",properties:{q:{type:"string"}},required:[]}`) was **not** re-observed here;
  it is consistent with §2/§4 but this report adds source mapping, not new runtime evidence.
- No WPT/layout-test expectation file was opened; the Blink unit test
  `html_form_mcp_tool_test.cc` is the behavioural authority used above.
- Tool installs/updates: none (no package manager invoked).

## Evidence log (commands run, observed)

```
$ timeout 60 git ls-remote https://github.com/chromium/chromium.git refs/heads/main
05abdb878fa62ed76a61b413b0c3f9d55838b8b9	refs/heads/main

$ for p in ...; do curl -sS -m 90 -o <f> \
    "https://raw.githubusercontent.com/chromium/chromium/05abdb878.../$p"; done
$ diff -q sha_<file> <main-copy>
SAME_form_mcp_schema  (main == SHA)
SAME html_form_element (main == SHA)
SAME_ctrl SAME_mc SAME_issue SAME_test SAME_h
```

`curl` HTTP status of the raw host: `200` (verified at session start).
