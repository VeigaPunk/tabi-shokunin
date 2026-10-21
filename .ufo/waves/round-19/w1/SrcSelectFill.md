# SrcSelectFill — Chromium 154 select assignment path

**Axes:** pinned-source coverage; direct-setter versus declarative-fill distinction; reproducible provenance.

## Source identity and provenance

| Key | Source | Accessed | Decoded bytes | Decoded SHA-256 |
|---|---|---:|---:|---|
| H (requested target) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc?format=TEXT` | 2026-10-21 | 86,429 | `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e` |
| F (declarative schema caller) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT` | 2026-10-21 | 51,703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| E (form entry caller) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT` | 2026-10-21 | 68,278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| T (selection-type callbacks) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/select_type.cc?format=TEXT` | 2026-10-21 | 84,599 | `a71377f80a013f79c9fea46a9b78018d507cf193a90487f70aaa4957fc962491` |

Tag `154.0.8037.97` is commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (also recorded in `corpus/SOURCES.md` / the S071 dossier). H is 2,413 source lines. The requested decoded body is retained at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/TabiR19-2.SrcSelectFill-4.body.gz` (gzip size 19,798 bytes; gzip SHA-256 `f2a595b1d6bafc0d1a01e4a9b0304a6266825de84a78d6d1a5fa370577e677dd`).

Semantic LSP navigation was unavailable: `read xd://lsp` returned `No such tool` and listed mounted devices without LSP. Grep was used only to locate names; conclusions below are from the pinned source bodies and line-numbered reads, not from grep as semantic proof.

## Line-numbered map

### Caller: declarative form fill

- **E `html_form_element.cc:231-259`** — `HTMLFormMcpTool::FillFormControls` parses input as JSON, requires an object, builds `FormMCPSchema`, then returns `mcp_schema.FillData(*json_obj)` at 258. The existing S071 dossier traces the preceding WebMCP invocation chain into this call (`.ufo/waves/round-18/sources/DeclarativeValidation.md:26-29`).
- **F `form_mcp_schema.cc:208-243`** — `FillData` first checks every supplied property. Unknown parameter names return `kInvalidInputArguments` at 214-220; a value failing `ValidateParameterData` returns `kInvalidInputArguments` at 221-231. Only after the validation loop succeeds does the second loop apply values at 234-241. The source comment at 210 explicitly says invalid data leaves control states unchanged.
- **F `form_mcp_schema.cc:246-299`** — `ValidateParameterData` branches on control family; select controls dispatch to `ValidateSelectData` at 274-276.
- **F `form_mcp_schema.cc:390-427`** — `ValidateSelectData` collects option values at 398-401. A single select requires a string matching that set at 403-405. A multiple select requires an array at 408-411; each item must stringify and belong to the set at 413-421, and erasing each accepted value makes repeated requested values fail at 422-424. An empty array passes these loops.
- **F `form_mcp_schema.cc:451-489`** — `FillParameterData` selects `FillSelectData` for select controls at 472-473.
- **F `form_mcp_schema.cc:1021-1054`** — Single-select fill calls `SelectOptionByValue(selected_value, /*send_events=*/true, ...)` at 1026-1031. Multiple-select fill converts the array to a set of strings, walks options to collect matching option indices at 1034-1051, then calls `SelectMultipleOptions` at 1053. It therefore does not use a scalar value setter for a multiple-select array. Because it walks the option list, matching duplicate-valued option elements are all included; JSON input values themselves must be unique by validation above.

### Requested target: `html_select_element.cc`

- **H `HTMLSelectElement::Value`, 291-295** — getter returns the first `SelectedOption()`'s value, or `""` when none is selected.
- **H `setValueForBinding`, 297-309** — WebIDL binding entry records old value/autofill state, then calls `SelectOptionByValue(value, false, ...)` at 301-304 (no input/change event flag). It also notifies the page's `ChromeClient` at 305-308. In this target the binding setter is named `setValueForBinding`; the declarative caller instead calls `SelectOptionByValue` directly for the single-select case.
- **H `SelectOptionByValue`, 311-325** — starts with a null option, scans `GetOptionList()` for exact `item.value() == value`, selects the first match and breaks at 317-321, then delegates even if no match at 324. No unmatched-value error is returned here.
- **H `SelectOptionByElement`, 327-347** — a non-null option owned by another select returns early at 335-337; null does not take that guard. It clears the suggested option, initializes flags with `kDeselectOtherOptionsFlag | kMakeOptionDirtyFlag` at 339-340, adds input/change dispatch only when requested at 341-342, and calls `SelectOption(option, ...)` at 343.
- **H `selectedIndex`, 871-887** — scans options and returns the first selected index; if none is selected it returns `-1` at 882. `setSelectedIndex` passes `item(index)` to `SelectOption` with deselect-other and dirty flags at 885-887.
- **H `SelectOption`, 1047-1108** — a non-null element is made selected and optionally dirty at 1056-1069. If the deselect flag is set, it calls `DeselectItemsWithoutValidation(element)` at 1071-1073. Selected-content updates branch on `IsMultiple()` at 1075-1081; then `DidSelectOption(element, ...)` runs at 1084-1086. Nothing in this path raises an error for a null element.
- **H `DeselectItemsWithoutValidation`, 1162-1184** — the optimized `last_on_change_option_` path is limited to non-multiple menu lists at 1165-1169. Otherwise it walks owned options and clears each selected state, skipping only the excluded element at 1171-1182. For a missing value, the excluded element is null, so every owned option is eligible to be deselected, including on a multiple select.
- **H `ResetToDefaultSelection`, 776-820**, plus **T `MenuListSelectType::DidSelectOption`, 922-952, and `ListBoxSelectType::DidSelectOption`, 1598-1617** — reset-to-default is a separate routine, not invoked by the value-miss path. The selection callbacks update presentation/state; neither callback selects a fallback option when passed null. This closes the single-select default-option caveat for the traced miss path.
- **H `SelectMultipleOptions`, 180-210** — separate multiple-selection API (`DCHECK(IsMultiple())`): snapshots and clears old selection, selects each valid list index and marks it dirty, updates text/validity, and dispatches input/change only if selection changed. This is the API reached by declarative multiple-select fill.

## Outcome: source facts and source-derived result

**Source facts:** Declarative select validation happens before `FillSelectData`. A supplied option value not present in the form's option list fails `ValidateSelectData`; `FillData` converts that to `kInvalidInputArguments` (`Invalid value ... for parameter ...`) before its apply loop, so a stable form's unmatched declarative value is an error and the current form-control state is left unchanged. For multiple-select arrays the same holds for an unknown member; a valid empty array reaches `SelectMultipleOptions([])` and clears existing selection. Valid multiple arrays rebuild the selected set; they do not preserve old selections outside the array.

**[INFERENCE] Direct setter behavior from the traced source:** assigning a string absent from the options through `HTMLSelectElement.value` / `setValueForBinding` is not an error path. The value scan leaves `option == nullptr`; the shared selection routine deselects the current option(s); the callbacks do not restore a default. `selectedIndex` then reports `-1`, and `Value()` reports `""`. On a multiple select, this scalar setter still leaves no selected options on a miss; with a match it selects only the first matching option and deselects other options. This is distinct from declarative multiple fill, which uses the array/list-index path above.

No runtime probe was run. Confidence is high for the pinned source path; runtime-specific observations are not claimed. Remaining unknown: behavior was not exercised in a live 154 page, including possible script-driven DOM mutations during the eventful declarative fill.

## Verbatim source quotes

1. H, `html_select_element.cc:315-316`: “Find the option with value() matching the given parameter and make it the current selection.” (URL, access date, decoded SHA-256: H above.)
2. H, `html_select_element.cc:882`: `return -1;` (URL, access date, decoded SHA-256: H above.)
3. F, `form_mcp_schema.cc:210`: “If the data isn't valid, form control states remain unchanged.” (URL, access date, decoded SHA-256: F above.)
4. F, `form_mcp_schema.cc:1053`: `select.SelectMultipleOptions(selected_indices);` (URL, access date, decoded SHA-256: F above.)

## Proposed SOURCES row (11-column contract)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 HTMLSelectElement — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc | code | A | Chromium 154.0.8037.97 binding value setter and option-selection mechanics only; caller-side validation remains S071 | tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; `html_select_element.cc:291-347, 871-887, 1047-1108, 1162-1184, 180-210` | Direct scalar value selection uses the first exact option; an unmatched value clears selection and yields `selectedIndex == -1` without a setter error. The separate multiple list-index API clears/rebuilds a selection set; declarative caller and prevalidation are in `form_mcp_schema.cc` / S071. | queued | 2026-10-21 | on-release | — |

## Isolation

No clone or commit was created; this is a source-scout assignment. Only the requested seat-owned compressed source body and this report were written under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/`. No production source, `corpus/SOURCES.md`, sibling lane, or fleet state was changed.