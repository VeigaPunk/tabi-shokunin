# Chrome declarative WebMCP documentation — source findings

## Verdict

**A Chrome declarative API page exists.** The WebMCP index links it at `/docs/ai/webmcp/declarative-api`; the dedicated page covers the four requested attributes, demonstrates generated `inputSchema`, and describes submission/event handling. Chrome's docs do **not** specify a general invoke-time JSON Schema validator or a standard validation-error payload. Their declarative example delegates validation to page code; other Chrome docs describe schema audits and generic error-writing guidance. Chromium 154 source provides implementation details below, but those are source-derived, not a runtime observation or a substitute for the docs' wording.

Confidence: **high** for the quoted Chrome docs and the pinned source branches; **no runtime validation probe was run for this assignment**.

## Exact pages opened

Accessed 2026-10-21:

1. WebMCP index — <https://developer.chrome.com/docs/ai/webmcp> (last updated 2026-10-07). It links both APIs and identifies the Declarative API as HTML-form annotations.
2. Declarative API — <https://developer.chrome.com/docs/ai/webmcp/declarative-api> (last updated 2026-09-25). Primary source for attributes, schema example and submit event.
3. WebMCP best practices — <https://developer.chrome.com/docs/ai/webmcp/best-practices> (last updated 2026-05-18). `Prioritize reliability` says schema constraints are not guaranteed and recommends code validation/descriptive errors.
4. WebMCP tool security — <https://developer.chrome.com/docs/ai/webmcp/secure-tools> (last updated 2026-09-01). Opened from the docs navigation; no additional declarative form-validation contract.
5. Build your user's agentic workflows with WebMCP tools — <https://developer.chrome.com/docs/ai/webmcp/build-tools> (last updated 2026-08-26). `Fail gracefully and enable recovery` gives generic actionable responses for invalid parameters and other tool errors.
6. WebMCP schema validity — <https://developer.chrome.com/docs/lighthouse/agentic-browsing/webmcp-schema-validity> (last updated 2026-05-05). This is a Lighthouse audit contract, not an invocation-time validator.

The declarative page's stable section anchors are `#tool_registration`, `#optional_tool_parameters`, and `#submit_the_form`. It is a rolling docs page with no source tag/commit exposed; the body digest below is the fetched-content anchor. The index and the dedicated page were both opened, so the “no declarative page” fallback does not apply.

## Decoded-body identity and retention

- URL: <https://developer.chrome.com/docs/ai/webmcp/declarative-api>
- Accessed: 2026-10-21
- Body used for quotes: HTTP-decompressed HTML response body (`curl --compressed`); SHA-256 `cc00b2e92a1ec0ac24d2a20c118b88e2f9209f7ad092f6521767a2039304cafb`; 153,277 bytes.
- Retained gzip: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SrcChromeDeclDocs.body.gz`; compressed SHA-256 `edb264f84305cc1744075aa4b3da59dcebb6ccbf0f604053857fb56d523007c5`; 20,441 bytes. `gzip -t` succeeded, and decompressing it reproduced the recorded body SHA-256 and 153,277-byte size.
- The decoded HTML line numbers below refer to that retained response body, not line numbers in Chrome's rendered page.

## Documented contract

### Form attributes and schema derivation

- `toolname` gives the tool's name; `tooldescription` gives its purpose/action. The page says removing either attribute unregisters the tool. Fields become tool parameters; the shown input names become property keys (`firstName`, `lastName`, `select`).
- `toolparamdescription` is optional and supplies the JSON Schema property description. In the page's documented fallback, absent that attribute Chrome uses associated `<label>` text (excluding labelable descendants), then `aria-description` if there is no label.
- The one generated-schema example maps plain text fields to `type: string`; the required `<select>` to a string property with `anyOf`/`const`/`title`, an `enum` of option values and `description`; and `required` to `required: ["select"]`. This is an example, not a complete field-to-schema algorithm. The page does not enumerate derivation for every control type or state that the generated schema is a complete runtime validator.
- `toolautosubmit` changes the documented flow from a manual Submit click to model-triggered submission and navigation. The same section says `SubmitEvent.agentInvoked` is true for an agent-triggered submission, `respondWith(Promise<any>)` supplies the serialized result, and `preventDefault()` is required to stop standard form submission.

### Validation, audit failures and errors

- The Declarative API `Submit the form` sample calls a site-defined `myFormIsValid()`. On its false path it calls `respondWith(myFormValidationErrorPromise)` only if `agentInvoked`, then returns. The docs do not define that variable, a standard validation-result shape, or a browser-generated text for this custom validation path. On the success path the example resolves a string result.
- The general WebMCP best-practices page recommends strict code validation and says schema constraints are not guaranteed; it asks authors to provide descriptive errors. The Build-tools page's `Fail gracefully and enable recovery` section similarly recommends actionable messages for malformed parameters and wrong-state failures. These are authoring recommendations, not promises about the browser's `toolResponded`/error status.
- Lighthouse's `How the WebMCP schema validity audit fails` section: the audit fails for a form with only one of `toolname`/`tooldescription`, or for a required field without `name`; it warns when an optional named field lacks both `toolparamdescription` and an associated label. These are audit outcomes, not a Chrome invocation-time rejection contract.
- Across the pages opened, no Chrome docs define which unknown input keys or invalid field values are rejected during tool invocation, the error text/status for those rejections, or a general JSON Schema validation guarantee. The declarative page documents app-authored submit handling, not those runtime decisions.

## Verbatim quotations

All four quotations are from the retained body at the URL above, accessed 2026-10-21, decoded SHA-256 `cc00b2e92a1ec0ac24d2a20c118b88e2f9209f7ad092f6521767a2039304cafb` (153,277 bytes). Raw HTML line locators are within that digest-bound body.

1. **§Tool registration**, raw HTML lines 4315–4316: “`toolname`: Clearly name the tool, based on its purpose. `tooldescription`: Describe what action the tool takes and its purpose.”
2. **§(Optional) Tool parameters**, raw HTML line 4333: “`toolparamdescription`: Map elements to a property description within the JSON Schema.”
3. **§Submit the form**, raw HTML lines 4411–4412: “Add `toolautosubmit` to trigger submission and a navigation when the model invokes this tool.”
4. **§Submit the form**, raw HTML lines 4429–4432 (sample invalid path): `if (!myFormIsValid()) { if (e.agentInvoked) { e.respondWith(myFormValidationErrorPromise) }; return; }`

## Chromium 154 source map — implementation, not documentation or a runtime probe

Existing registry evidence is **S071** in `corpus/SOURCES.md:85`: Chromium tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, `form_mcp_schema.cc` plus `html_form_element.cc` and `model_context.cc`. I fetched the three Gitiles `?format=TEXT` files and base64-decoded them before hashing. Decoded source identities:

- `form_mcp_schema.cc` — <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT> — SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, 51,703 bytes.
- `html_form_element.cc` — <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT> — SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68,278 bytes.
- `model_context.cc` — <https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT> — SHA-256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`, 50,117 bytes.

| Pinned source lines | Relevant branch / statement map |
|---|---|
| `html_form_element.cc:330-348` | Invalid form reporting distinguishes missing `toolname` from missing `tooldescription`; it reports an Audits issue. |
| `html_form_element.cc:350-407` | Registration requires WebMCP enabled, a frame, document connection, and both attributes. Invalid/removal cancels pending registration, cancels an active call when appropriate, and unregisters the old tool; valid forms schedule registration. |
| `html_form_element.cc:410-463` | Reads name, description, optional title and presence of `toolautosubmit`; rechecks connection/attributes; compares tool attributes and computed schema; cancels/replaces a changed tool and registers the new one. |
| `model_context.cc:813-854` | Registration is gated by `tools` Permissions Policy and `IsModelContextAllowed`; duplicate name returns without registering. It passes name/description/title and `ComputeInputSchema()` into the tool record. |
| `form_mcp_schema.cc:117-151` | `ComputeJSON()` builds an object schema, emits properties in first-appearance order, omits unsupported controls, places `is_required` names in the top-level `required` array, and erases each name after emission. |
| `form_mcp_schema.cc:154-205` | Reports missing-name issues for supported unnamed controls and a missing-title-and-description issue if a parameter schema has neither. These are audit diagnostics, not per-invocation validation errors. |
| `form_mcp_schema.cc:1238-1287` | `ProcessForm()` skips disabled/read-only controls, groups controls by `GetWebMCPParameterName()`, remembers the submit button, and includes named `ElementInternals`; hidden inputs are considered text only when they have `toolparamdescription`. |
| `form_mcp_schema.cc:491-553` | Routes each name's controls to a supported schema builder; unknown/unsupported type returns `nullptr`. |
| `form_mcp_schema.cc:556-700` | Text/textarea are strings; date, datetime-local, month, week, and time have string format metadata; datetime/time regex selection varies by `step` and comments explicitly say schema representation is not complete validation. Required state comes from the element. |
| `form_mcp_schema.cc:703-796` | Number emits `minimum`/`maximum` when present and `multipleOf` only for compatible step bases; range always emits min/max and conditionally `multipleOf`; select options become const/title and enum entries, with multi-select as a unique array. |
| `form_mcp_schema.cc:798-927` | Single checkbox is boolean; same-name checkbox group is an array of unique allowed values; radio is an enum string; color has a regex format; custom elements use their own declared parameter schema and are not marked required here; file is feature-gated and becomes string or string array. |
| `form_mcp_schema.cc:1095-1145` | Adds descriptions and optional type context. `pattern` is added only when a supplied input regex compiles; an invalid pattern produces a console error and is not included. |
| `form_mcp_schema.cc:1147-1235` | Single-control description precedence is `toolparamdescription` → concatenated associated-label text → `aria-description`. Multi-control groups use the nearest common ancestor `<fieldset>`'s `toolparamdescription`; there is no group-label fallback in this implementation. |
| `form_mcp_schema.cc:208-243` | `FillData()` first checks each supplied key/value without mutating controls: unknown key returns `kInvalidInputArguments` with “Input contains a parameter … but there is no such parameter for the tool”; bad values return “Invalid value …”. Only after all supplied entries validate does it fill values. This loop has no general JSON Schema walk or missing-required-key check. |
| `form_mcp_schema.cc:246-300` | Control-dispatch validation: text/date/datetime-local/month/week/time/color use text validation; number/range use number validation; select, checkbox, radio and file have dedicated validators; custom element validation returns true with a TODO; unsupported type returns false. |
| `form_mcp_schema.cc:302-449` | Text requires one control and a string; empty string is accepted here; HTML inputs use `SanitizeValue`, textarea accepts string. Number uses sanitized non-empty string. One checkbox expects boolean; groups expect arrays of unique values. Radio/select values must match controls/options; multiple select expects a unique array. File validation is feature-gated and checks accessible file objects. |
| `html_form_element.cc:174-222` | `ExecuteTool()` requires a submit button unless `toolautosubmit` is present; malformed/invalid form data returns the error before activation. Without autosubmit it focuses the submit button and pauses for user action; with it, it immediately calls `PrepareForSubmission()`. |
| `html_form_element.cc:231-259` | `FillFormControls()` rejects unparsable JSON, non-object input and a missing submit button when required, then calls `FormMCPSchema::FillData()`. |
| `html_form_element.cc:635-759` | Submission runs interactive native form validation before dispatching `submit`. On failure during a declarative call it returns `kToolInvocationFailed` with `Form validation failed: <name>: <validationMessage>.`; on success it sets `SubmitEvent.agentInvoked=true`. This branch is not described on the opened declarative docs page. |
| `html_form_element.cc:769-815` | A `respondWith` promise is accepted only when submission is canceled (`preventDefault()`); the promise is awaited. Canceling submit without `respondWith()` returns a programming-error failure. |
| `html_form_element.cc:290-328` | Resolved object output is JSON-serialized; serialization failure and rejected promise each return `kToolInvocationFailed`. A non-object result is converted to a string. |
| `model_context.cc:562-565, 695-745` | Invocation routes declarative forms through `ExecuteDeclarativeTool`; pending execution is correlated, then success emits `WebMCPToolResponded` and errors emit `WebMCPToolFailed`. |
| `model_context.cc:752-811` | Separate imperative path parses input JSON, reports parse failure, then calls the JavaScript function and awaits its promise; this is not the declarative form-fill validation path (as scoped in S071). |

**Interpretation boundary:** the source confirms Chromium 154 has per-control declarative input checks and more precise failure paths than the Chrome docs state. It does not support calling this a complete JSON Schema validator. In particular, `ComputeJSON()` emits required metadata, while `FillData()` only iterates submitted keys; native form validity is checked later in `PrepareForSubmission()`. No runtime result was inferred from this source map.

## Proposed SOURCES row (not added to the registry)

The docs page adds a distinct, official documentation scope beyond S032's WebMCP overview and S071's source-level validation row. Suggested row:

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Declarative API — Chrome for Developers — https://developer.chrome.com/docs/ai/webmcp/declarative-api | docs | A | Chrome's documented declarative HTML form attributes, schema example, parameter-description fallback, autosubmission and submit response; excludes build-specific invocation validation | Last updated 2026-09-25; §§Tool registration, (Optional) Tool parameters, Submit the form; captured body SHA-256 `cc00b2e92a1ec0ac24d2a20c118b88e2f9209f7ad092f6521767a2039304cafb` (rolling page; no docs tag/commit exposed) | Chrome documents toolname/tooldescription registration, toolparamdescription with label/aria fallback, one generated schema example, toolautosubmit and app-authored submit response; it does not specify a general runtime schema-validation/error contract | mined | 2026-10-21 | on-release | .ufo/waves/round-19/w1/SrcChromeDeclDocs.md (proposal only) |

## Unresolved gaps and method limits

- No Chromium 154 runtime harness was run here. Exact observable CDP `status`/`errorText`, missing-required-field behavior end-to-end, and custom validation outcomes remain for the runtime-probe seats.
- The Chrome docs page is rolling rather than tag-pinned; its last-updated date and decoded-body digest are the identity used here. The implementation comparator is pinned to Chromium 154.0.8037.97 / commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`.
- No `lsp` device/server route was exposed in this session. Grep was used only to locate symbols/branches; findings above are based on reading the exact pinned source ranges, not treating grep as semantic proof.
- No tools were installed or updated.

## Isolation

- Clone path: N/A — report-only scout; no production file was created.
- Branch: N/A; base: `66251bfc1aef393e4aec599e950a8deb867736bb`; commit: N/A (no clone or Git write).
- Changed paths: `.ufo/waves/round-19/w1/SrcChromeDeclDocs.md` (seat report) and `.ufo/waves/round-19/w1/SrcChromeDeclDocs.body.gz` (permitted retained body) only.
