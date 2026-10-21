# Chromium 154 declarative WebMCP form schema/fill tests

## Finding and source identity

At tag `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), form-schema/fill tests exist. The file named `form_mcp_schema_unittest.cc` is not present at the expected forms-directory path; the actual C++ unit-test file is `third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc`, covering the schema and fill behavior. Separate declarative WPT coverage exists under both `third_party/blink/web_tests/external/wpt/webmcp/declarative/` and `third_party/blink/web_tests/wpt_internal/webmcp/`.

Primary implementation fetched from Gitiles on **2026-10-21**:
- URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`
- Decoded body: **51,703 bytes**, SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`.
- Retained decoded body, gzip: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/TabiR19-2.SrcFormSchemaTests-4.body.gz` (9,091 bytes; gzip SHA-256 `7556e07f43ee91790c83430134b67794fa50d7497d961574baf3926a306a9f26`).

The main C++ test source was fetched from the same Gitiles tag: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc?format=TEXT`; decoded file 106,254 bytes, SHA-256 `944ee9e45eb9c400143a3746296af16fcbfdea3249dec669580b751f0ae27be6`.

Relevant WPT files were extracted from tag-pinned Gitiles archives. Their exact paths, line anchors and decoded-file digests are included below. No test suite was run; the results below are source assertions, not a claim that this checkout executed them.

## Exact searches and test inventory

- Gitiles directory listing: `.../third_party/blink/renderer/core/html/forms/?format=JSON`; it names `form_mcp_schema.cc`, `form_mcp_schema.h`, and `html_form_mcp_tool_test.cc`.
- Direct Gitiles blob requests for `.../third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT` and the sibling `form_mcp_schema_test.cc?format=TEXT` both returned **HTTP 404**. This establishes absence at those exact forms-directory paths, not a claim of repository-wide absence under every possible name. A secondary web search for `"form_mcp_schema_unittest" chromium` returned no direct matching source result.
- Enumerated `https://chromium.googlesource.com/chromium/src/+archive/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp.tar.gz`; its `declarative/` subtree contains the schema/fill and mutation tests cited below, including `getTools-declarative-schema.https.html`, `execute_tool_change_event.https.html`, `select-multiple-events.https.html`, `toolchange-on-control-add-remove.https.html`, and `toolchange-on-name-change.https.html`.
- The initial repository-root path `.../wpt_internal/webmcp/` was not a tree (HTML response); the correct Blink test path, `.../third_party/blink/web_tests/wpt_internal/webmcp/`, returned 200. Its tag-pinned archive contains `custom-element-fill.https.html`, `custom-element-invalid-schema.https.html`, `custom-element-cease-param.https.html`, `abort_registration_gc.https.window.js`, and `css/tool-active-pseudo-parsing.html`. The three custom-element files are directly relevant here.
- LSP semantic server/tool was not available in this task's tool inventory; Gitiles listings, direct source reads and literal search were used for discovery. Reported outcomes are grounded in line-read source assertions, not grep inference.

## Line-numbered implementation map

All anchors below are in `form_mcp_schema.cc` at the URL above.

| Lines | Relevant branch/statement and effect |
|---|---|
| 49–68 | `ToString`: accepts JSON string, integer, double, or boolean (booleans become lowercase text); rejects other JSON kinds. |
| 71–91 | `ToBoolean`: accepts boolean; integer maps by nonzero; string accepts case-insensitive `true`/`false` or `1`/`0`; other values fail. |
| 94–111 | File admissibility: requires the file-input feature and live execution context; converts to string, requires an absolute path, then requires `GetFileMetadata` to find it. |
| 117–119, 1238–1267 | Constructor calls `ProcessForm`; disabled/read-only form controls are skipped; named controls and named form-associated custom elements are grouped by parameter; first successful submit button is retained. |
| 121–151 | `ComputeJSON` emits an object with `properties` and `required`; traverses first-seen names in order, omits unsupported parameter schemas, records required names, and erases each emitted name so duplicate name entries emit once. |
| 246–300 | Validation dispatch: text/date/datetime-local/month/week/time/color → text validator; number/range → number; select, checkbox, radio, custom element, and feature-gated file each have distinct branches; unsupported types return false. Custom elements currently return true here (no value validation). |
| 302–319 | Text values require one control and a `ToString`-convertible value; empty string passes; a nonempty input must have nonempty sanitized value; otherwise only textarea is accepted. |
| 321–335 | Number/range require one input and a stringifiable, nonempty sanitized value. |
| 337–372 | One checkbox accepts `ToBoolean`; a same-name checkbox group requires an array of stringifiable, allowed values, each unique. |
| 374–388 | Radio requires a stringifiable value matching one radio option. |
| 390–427 | Select must be an `HTMLSelectElement`; a single select takes one stringifiable allowed option value; multiple select requires an array of allowed, unique values. |
| 429–449 | File requires one control; multiple files require an array; every supplied path must pass file admissibility. |
| 208–244 | `FillData` first validates *every* JSON object entry. Unknown names return `kInvalidInputArguments` with “no such parameter”; invalid values return the same error code, with a string value included when coercible. Only after the validation loop succeeds does it fill each field; success returns no error. |
| 451–489 | Fill dispatch mirrors the supported types: text/date/datetime-local/month/week/time/color → text fill; number/range → number fill; select, checkbox, radio, custom element, and file → corresponding handler. |
| 933–959 | Text and numeric fill call `SetValue` with input/change dispatch behavior; textarea also uses that path. |
| 962–1001 | Single checkbox sets its coerced boolean; grouped checkboxes set membership from the value array, checking present values and unchecking absent values; dispatches change explicitly after `SetChecked`. |
| 1003–1019 | Radio checks the matching option and dispatches change. |
| 1021–1054 | Single select picks the matching value with events; multiple select builds selected indexes from the array and calls `SelectMultipleOptions`. |
| 1056–1063 | Custom-element fill enqueues `toolFillCallback` with the value serialized as JSON. |
| 1065–1093 | File fill filters admissible paths, then sets the single/multiple path list. |
| 491–540 | Schema dispatch mirrors the supported control types; unrecognized/unsupported groups return null and are omitted by `ComputeJSON`. |
| 556–730 | Text/textarea schema is `string` plus valid HTML pattern/description and `required`; date is `string` + `format: date`; datetime-local and time choose regex format by step thresholds (`<1000`, `<60000`, otherwise); month/week have fixed HTML-microsyntax regexes; number carries bounds and `multipleOf` only if the step base aligns with the step. |
| 733–771 | Select options become `anyOf` const/title entries plus `enum`; multiple select changes the property to array/items and `uniqueItems: true`; required follows the select. |
| 773–795 | Range is numeric with min/max (including defaults) and `multipleOf` only for an aligned step base. |
| 798–852 | Single checkbox is boolean; same-name checkbox group is an array of unique string values/enums; radio group is string enum/anyOf. Required is accumulated from member controls. |
| 854–873 | Shared option builder emits const values, optional label titles, enum values, and accumulates required state. |
| 875–928 | Color schema uses six-hex-digit regex; custom-element schema parses a top-level JSON object and adds description, but marks it not required; file schema is string or array of strings behind its runtime feature. |
| 1095–1145, 1147–1237 | Description is attached only when nonempty. For one control priority is `toolparamdescription` > concatenated labels > `aria-description`; label strings join with `; `. Multi-control descriptions come only from a `toolparamdescription` on the nearest common ancestor fieldset inside the form. HTML patterns are emitted only when present and a valid regex; invalid regex is omitted (with console message). |
| 1270–1364 | Control classifier branches: text/email/search/tel/url/password, hidden only when described, textarea; date, datetime-local, month, week, time, number, select, range, checkbox, radio, color; custom elements only when `ElementInternals` has nonempty valid top-level object JSON; file only with file-input feature. |

## Test input → asserted outcome map

### C++ unit tests: `html_form_mcp_tool_test.cc`

The following are the test source's assertions, not an independent run.

**Fill acceptance, rejection, and atomicity**

- `FillFormControls_Basic` (`:215–245`): `{"text1":"foo","text2":"bar"}` succeeds → values `foo` and `bar`. `FillFormControls_Partial` (`:247–276`): only `text2=bar` succeeds → `text1` remains `initial1`, `text2=bar`.
- Number inputs (`:278–380`): `42` → `"42"`; `3.14` → `"3.14"`; string `"35"` → `"35"`; string `"foo"` fails and the initial `"15"` remains.
- `FillFormControls_InvalidJsonFailure` (`:382–394`): malformed object `{"x":"y",}` and top-level array `["unknown"]` both fail. `FillFormControls_UnknownParamFailure` (`:396–417`): `{"unknown":"UNKNOWN"}` fails.
- `FillFormControls_Transactional` (`:419–451`): `text1=foo`, then unknown name, then `text2=bar` fails as a whole; both controls remain `initial1`/`initial2`.
- Multiple selects (`:898–993`; includes size=1 MenuList variant): `select1:[v1,v3]` selects options 1 and 3 only; `[v2]` selects only option 2; `[]` clears all selections. Both widget variants assert the same outcomes.
- Single checkbox (`:1143–1173`): `{check1:true,check2:false}` → first checked, initially checked second unchecked. Checkbox group (`:1277–1350`): `fruit:[melon]` selects melon; `[grape]` replaces it; `[]` clears; `[melon,grape,apple]` selects all; `[grape,apple]` unchecks only melon.
- Invalid checkbox groups (`:1352–1435`): unknown-only, valid+unknown, extra value, duplicate value, boolean/object/string instead of an array all fail; all three controls remain unchecked after each rejected fill.
- Range/date/datetime-local/month/week/time (`:1558–1582`, `:1613–1637`, `:1677–1701`, `:1731–1755`, `:1785–1809`, `:1849–1873`): `75` → range `"75"`; `"2026-01-27"` → same date value; `"2026-02-11T14:13"`, `"2026-02"`, `"2026-W05"`, and `"20:20:39"` each fill the named control with the same string.
- Color and textarea (`:1903–1927`, `:1956–1980`): `"#FaB000"` → sanitized `"#fab000"`; textarea `"This is textarea content"` → same value.
- Base text / hidden controls (`:2082–2238`): email `john@doe.org`, search `cat videos`, telephone `+47 555 55 555`, and URL `https://www.google.com` each fill verbatim. Hidden input without `toolparamdescription` is rejected and remains `initial1`; described hidden input accepts `1234`.
- Invalid values and empty strings (`:2240–2301`): date `error`, number `error`, time `25:00:00`, time with `+00:00`, multi-select unknown values, non-array multi-select, and duplicate option values are rejected. Empty strings are accepted for date/email/password/search/tel/url; the test does not submit empty values for its number or range controls.
- Radio groups (`:2549–2649`): `size:s`, then `m`, then `l` each succeeds and leaves only the corresponding radio checked. `size:xl` fails and leaves all unchecked.
- File input (`:2813–2935`; feature-enabled fixture with mock file metadata): granted absolute path succeeds and is set in file list; multiple granted paths fill two entries in order; relative `avatar.png` and absolute but ungranted path fail.

**Schema inputs → expected schema**

- Disabled and read-only fields (`ParameterSchema_Disabled`, `ParameterSchema_Readonly`, `:453–509`): only enabled writable `text1:string` is emitted; disabled/read-only input and textarea fields are omitted.
- Text schema and requiredness (`:511–567`): `text1` emits `string`; marking `text2` required adds only `text2` to `required`. Description assertions (`:569–745`): toolparamdescription emits `Some nice text`; one label emits `Some text`; multiple labels join as `Label one; Label two`; ARIA description is fallback; label beats ARIA; toolparamdescription `ATTR` beats label and ARIA. Implicit label around a required select yields option enum/titles plus description `LABEL` (`:778–818`). Duplicate same-name text controls (`:748–776`) omit `text2`, retaining `text1` only.
- Select schema (`:820–896`): single select is a required string with `anyOf`/`enum` for `Option 1..3` and option labels as titles; multiple select is a required array of those string options with `uniqueItems: true`.
- Number schema (`:995–1114`): min/max/step examples assert `num1 minimum=10 maximum=100 multipleOf=1`, `num2 min=30 max=60 multipleOf=10`, `num3 min=15` (no `multipleOf` because base is misaligned), `num4 multipleOf=13`, `num5 multipleOf=0.1`, `num6 min=0.15` (no `multipleOf`), and `num7 multipleOf=1` plus pattern `[1-4]{3}`. Min-only produces `minimum=10,multipleOf=1`; max-only produces `maximum=100,multipleOf=1`.
- Checkbox schema (`:1116–1141`, `:1175–1275`): one checkbox emits boolean; repeated `fruit` checkboxes emit array of unique strings with enum/anyOf `apple,melon,grape`; member `toolparamdescription` values `ERR1/ERR2` do not describe that multi-control property.
- Range schema (`:1437–1557`): explicit min=0/max=50/step default emits min/max/multipleOf=1; omitted constraints emit HTML defaults 0/100 and multipleOf=1; step=2 emits multipleOf=2; min=1/max=11/step=2 emits no multipleOf because base is misaligned.
- Date/temporal/color schema (`:1584–1902`): date is string/date with documented format description; datetime-local format is minute-only by default, permits seconds at step 1, and fractional seconds at step 0.001; month and week emit their HTML regexes; time uses minute/second/fractional-second patterns by corresponding step; color emits `^#[0-9a-zA-Z]{6}$`.
- Textarea and base text (`:1929–2026`): textarea emits string; email/search/tel/url emit strings; hidden without description is excluded, hidden with `DESC` emits a described string. Pattern tests (`:2027–2080`) emit valid `[A-Z]{10}` for the supported text-like controls; invalid regex `[)]` is omitted while its described string property remains.
- Radio schema (`:2303–2547`): radio group values `s,m,l` form enum/anyOf; labels become per-option titles; separate names form separate option lists; mixing radio and text controls under one name omits that conflicted parameter; any required member makes the group required; member `toolparamdescription` values are ignored for multi-control groups.
- Custom and file schema (`:2651–2811`): form-associated custom element with `setToolParamSchema({"type":"string"})` yields a string property plus its description; one file input emits string and multiple file input emits array of strings.
- Fieldset descriptions (`:2998–3331`): a shared fieldset gives radio/checkbox group description; nearest nested fieldset wins; an outer fieldset description is not inherited through a nearer fieldset lacking the attribute; no common fieldset means no description; a fieldset outside the form is ignored; a single text control does not inherit fieldset description and its own `toolparamdescription` wins.

### External WPT and `wpt_internal`

- External WPT `declarative/getTools-declarative-schema.https.html` (`:10–42`): form fields `query` (required text + “The search query”), `limit` (number + “Max results count”), and `safe_search` (checkbox + “Enable safe search filtering”) → expected object schema with string/number/boolean fields, matching descriptions, and `required:["query"]`; tool name/description asserted as `search_tool` / `Search the web`. File body: 1,489 bytes, SHA-256 `3cd6b459273bfdea6bc6af152a39fb296565d18b69e0358e2434cf5e60131a58`.
- External WPT `declarative/execute_tool_change_event.https.html` (`:8–75`): input JSON `{text:"regular text", number:42, checkbox:true, radio:"radio2", textarea:"some text area content", select:"opt2"}` → all six form control values/states asserted; text/number/checkbox/radio/textarea/select input and change events asserted (radio1 false, radio2 true). Body 3,248 bytes, SHA-256 `cc0338de164452bd703beeb9d62166d6044b757bf1a7eb688363823bfd23e032`.
- External WPT `declarative/select-multiple-events.https.html` (`:10–57`): `{fruits:["apple","banana"]}` → apple and banana selected, orange not; exactly one input and one change event. Repeating the same input keeps both event counts at one. Body 1,763 bytes, SHA-256 `f63d38c2343aea8fab1f1ce1e40c741244ced616e1ae3f4657704ab2dc7cbfbf`.
- External WPT `declarative/toolchange-on-control-add-remove.https.html` (`:10–34`): baseline schema has only `input_name:string`; adding text control `new_input` yields both string properties; removing it returns to `input_name` only. Body 1,343 bytes, SHA-256 `84c0c7aaabef58e1d42deb7ecde0f54dc93179a26b0dd27228b3fefdabe37d7b`.
- External WPT `declarative/toolchange-on-name-change.https.html` (`:8–60`): changing text name/type/required/description, checkbox name/type/required/description, select name/multiple/required/description, or textarea name/required/description is followed by a `toolchange` event. It asserts event invalidation for each mutation, not the exact resulting schema body. Body 2,573 bytes, SHA-256 `40032bd0ea083083c81dca227112273ae43a6ad901582c37595487f28b58e844`.
- `wpt_internal/webmcp/custom-element-invalid-schema.https.html` (`:7–82`): empty, nonsense, trailing-comma JSON, top-level array, and top-level string schemas are absent from properties; valid top-level object `{"type":"string"}` remains. Body 3,130 bytes, SHA-256 `48e0a33f4d45bb2b4fb7fb38a602a5f05e97bd3ea98bf2e227ac3d789cb5bd5a`.
- `wpt_internal/webmcp/custom-element-fill.https.html` (`:7–58`): valid string-schema custom control plus ordinary text receives `{text:"regular text",mytext:"very custom text"}`; `toolFillCallback` parses the JSON value and the asserted shadow text is `Custom text: very custom text`. Body 1,762 bytes, SHA-256 `fbaf2e2e1de88a99c4570d0cb4ab2b2dab9012d57bdb468d068008ad215bcc5d`.
- `wpt_internal/webmcp/custom-element-cease-param.https.html` (`:23–49`): initial schema contains `my-param:string`; after `setToolParamSchema(null)`, schema has empty properties. Body 1,709 bytes, SHA-256 `4856862aa57c6ba6cd379db72cc85677e8e2456327d2646b3dbb2deee99ca1ed`.

The WPT URLs are the corresponding files under `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/` followed by the path above. All those bodies were obtained from Gitiles archives for tag `154.0.8037.97` on 2026-10-21.

## Verbatim source quotes

All three quotes are from the decoded `form_mcp_schema.cc` body identified above (Gitiles URL, access date 2026-10-21, SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`):

1. `form_mcp_schema.cc:210` — “If the data isn't valid, form control states remain unchanged.”
2. `form_mcp_schema.cc:234` — “Now apply the values. This step must not fail.”
3. `form_mcp_schema.cc:367` — “Specified values must be unique.”

## Proposed SOURCES row (single)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 declarative HTML form MCP unit tests — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_mcp_tool_test.cc?format=TEXT | code | A | Chromium 154.0.8037.97 tag test assertions for form-derived parameter schemas and form filling only; not general JSON Schema semantics or broad runtime support | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `html_form_mcp_tool_test.cc:215–451,453–2811,2998–3331` | The pinned test source pairs declarative form inputs with schema/fill assertions across supported controls, including invalid and transactional rejection | queued | 2026-10-21 | on-release | — |

## Isolation

- Production files: none; this scout produced no implementation, fixture, case, counter, or evidence file. No production clone, branch, or commit.
- Permitted LANE artifacts written: this report and `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/TabiR19-2.SrcFormSchemaTests-4.body.gz` only.
- Source/test downloads and inspection copies: `/fast/scratch/tabi-r19/TabiR19-2.SrcFormSchemaTests-4`.
- No tools were installed or updated.