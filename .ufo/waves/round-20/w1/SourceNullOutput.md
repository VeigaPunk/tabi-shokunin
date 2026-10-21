# SourceNullOutput: null String sentinel, ParseJSON fallback, omitted output vs JSON null

Scope: Chromium 154.0.8037.97, source-only (QUALITY 14). No browser run, no runtime observation, no capability claim. Leaf seat `TabiR20.SourceNullOutput`; no dispatch. Writes: this report only.

## Answer

- **Omitted** = the `output` key is absent. This occurs only for non-Completed statuses, because the failure path passes `nullptr` (inspector_web_mcp_agent.cc:241-243) and the generated serializer skips null `unique_ptr` fields (protocol_core.h:94-100).
- **JSON null** = `"output": null`. It occurs only for a Completed event whose text is `null`, which parses to `Value::null()` (Values_cpp.template:105-106, serialized at :218-220).
- **Null String sentinel** = a C++ `IsNull()` control signal, not JSON null. On the audited paths it is suppressed before `toolResponded` (model_context.cc:732). If it ever reached `ParseJSON`, it would become `output: {}` (inspector_web_mcp_agent.cc:48-49), a latent branch.

## 1. Pins

Observed: Gitiles TEXT fetch, base64-decoded, `sha256` of the decoded bytes. Form: `curl -sfL "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/<path>?format=TEXT" | base64 -d | sha256sum`.

| Path under tag | sha256 | bytes / lines | Status |
|---|---|---|---|
| `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` | 8585 / 245 | matches R19 pin (`.ufo/waves/round-19/w1/SrcCdpToolResponded.md`); not a design.json pin |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | 68278 / 1740 | matches design.json S096; lane copy `corpus/evidence/round-20/sources/html_form_element.cc` byte-identical |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | 50117 / 1245 | matches R19 pin |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | 3969 / 123 | matches R19 pin |
| `third_party/blink/renderer/core/probe/core_probes.pidl` | `35d473989420038afb268fefc970a5f9e03d86d3f6666d7d45e14a0d094bf151` | 19224 / 257 | matches R19 pin |
| `third_party/blink/renderer/core/script_tools/script_tool_types.h` | `ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d` | 1431 / 53 | new this round |
| `third_party/blink/renderer/bindings/core/v8/script_value.cc` | prefix `5d9153fc07424c4f` | 2875 / 69 | new this round |
| `third_party/inspector_protocol/` `lib/Values_cpp.template`, `lib/Values_h.template`, `lib/ValueConversions_cpp.template`, `templates/TypeBuilder_cpp.template`, `crdtp/protocol_core.h`, `crdtp/json.cc`, `crdtp/cbor.cc`, `crdtp/serializable.h`, `code_generator.py` | prefixes `e076e25e`, `2a3b7bab`, `2c51450e`, `a6cbf72e`, `9d468381`, `4d304760`, `92358d76`, `fc67f2bc`, `d603a6c4` | see fetch | vendored in-tree at the tag; DEPS at the tag has no `inspector_protocol` match |

Retained artifact (see F5): `corpus/evidence/round-19/validation/receipt.json` current sha256 `25392bc69bc85c15554b3eb0553d9100da8c5482a225867a51c406e659189601` (1,081,672 B). `.ufo/waves/round-19/w2/SourceS079.md` cites `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` for the same path.

Tooling: no tool installed or upgraded. Used existing `curl`, `base64`, `sha256sum`, and `python3` (counting only). Scratch copies sit under `/tmp/tabi-r20-sourcenulloutput/`; the Gitiles URLs and hashes above are the citable roots.

## 2. Source chain (observed; line numbers against the pinned bytes)

**A. Sentinel origin.** `html_form_element.cc:825-830`: when a declarative tool is running after submission, `executing_tool->CallDoneCallback(base::ok(String()))`. Comment at :827-828: "Return a null string to indicate that a navigation has been triggered." A second producer sits at :837-841 (`form.submit()` from inside a submit handler), same `base::ok(String())`.

**B. Null is not JSON null.** `String()` has `IsNull()` true. The text `null` is a non-null `String`. `ToString` on JS null gives the non-null text `"null"` (`html_form_element.cc:316-319`; `model_context.cc:280-285`). The two are separated only by `IsNull()`.

**C. Declarative path suppresses the probe.** `model_context.cc:728-734`: `if (result.has_value()) { if (!result->IsNull()) probe::WebMCPToolResponded(...); }`. Then :739-743 runs the pending callback with the null result. No `toolResponded` is emitted for the sentinel.

**D. Other probe sites cannot carry null (audited callers).**
- `model_context.cc:655-656` and `:665` use `ComputeScriptToolResult` (:146-181), which returns `"[" ... "]"` and is never null.
- `model_context.cc:865` (`OnToolExecuted`) has no null guard, but within `model_context.cc` its only callers are :290 and :319 (no callers were enumerated in other files). Lines :287-288 replace null or empty with `"Operation succeeded"` before :290. :319 is the failure branch.
- So `ParseJSON(null)` is not reached on any audited site.

**E. ParseJSON (`inspector_web_mcp_agent.cc:47-64`).**
- :48-49: null `String` returns `protocol::DictionaryValue::create()`, which serializes as `{}`. Latent on audited sites.
- :51-58: crdtp JSON-to-CBOR. :59-62: `parseBinary` returns the root when status is ok (`Values_cpp.template:188-189`), otherwise `nullptr` (:190).
- JSON `null` yields `Value::null()` through `HandleNull` (`Values_cpp.template:105-106`); the root is set in `AddValueToParent` (:139-143). Non-null.
- :63 fallback: `StringValue::create(value)`, the raw text. Any input that is not one complete JSON value falls here: `ConvertJSONToCBOR` error clears the CBOR buffer (`cbor.cc:516-521`), and `ParseCBOR` on empty bytes errors (`cbor.cc:1013-1016`). So `"abc" def` becomes the raw text, not a partial parse.
- `ParseJSON` never returns `nullptr`, so every Completed event carries a non-null `output`.

**F. Completed vs failure.**
- `inspector_web_mcp_agent.cc:208-218`: `WebMCPToolResponded` emits `toolResponded(id, Completed, ParseJSON(result))` at :215-217, gated by `enabled_` (:212-214).
- :228-230: status `Canceled` only for `kToolCancelled`, otherwise `Error`.
- :241-243: `toolResponded(id, status, nullptr, error.message, remote_object)`.

**G. Omitted vs null on the wire.**
- `templates/TypeBuilder_cpp.template:99-123`: each event parameter is passed to `ObjectSerializer::AddField`.
- `crdtp/protocol_core.h:94-100`: `AddField(const std::unique_ptr<T>&) { if (!value) return; ... }`. A `nullptr` output therefore produces no key.
- `protocol_core.h:315-316` traits call `value.AppendSerialized`. `Values_cpp.template:218-220`: null serializes as CBOR null; `crdtp/json.cc:364-368` emits `null` in JSON.
- `WebMCP.pdl:116`: "Missing if `status` is anything other than Completed." Same contract.
- Optional `any` maps to `std::unique_ptr<protocol::Value>` (`code_generator.py:556-560`).

## 3. Wire outcome by C++ input (source-derived; not runtime-observed)

| Input | Route | Probe emitted | ParseJSON branch | Wire `output` |
|---|---|---|---|---|
| Error / Canceled | inspector :241-243 | yes (failure) | none (`nullptr`) | **absent** |
| Null String sentinel, declarative navigation | form :829 → model_context :732 | **no** | not reached | no event from this path |
| Null String if passed to :208-218 | none on audited sites | n/a | :48-49 | `{}` (latent) |
| JS `null`, or string `"null"` | ToString → `"null"` → parse | yes | `Value::null()` | **`null`** |
| JS `undefined`, or string `"undefined"` | parse fails | yes | fallback | `"undefined"` |
| JS `42`, or string `"42"` | parse | yes | number | `42` |
| JS object | JSON.stringify → parse | yes | dictionary | object |
| Declarative `respondWith("")` | no substitution (form :298-319; model_context :719-745) | yes [INFERENCE, §5.1] | fallback | `""` |
| Imperative `return ""` | model_context :287-288 | yes | fallback | `"Operation succeeded"` |
| Declarative navigation completion | model_context :146-181, :656 / :665 | yes | parse `[...]` | array; `[]` when no `application/ld+json` script |

## 4. Findings

- **F1. LC12 evidence scope.** LC12 (S096 :818-830) states the sentinel decision. Its wire consequence (no `toolResponded`) is decided at `model_context.cc:732`, which lies outside S096 (sha `474083d6…`). Either add a `model_context.cc:729-734` row or narrow LC12 to the form-side claim. Candidate quote inside the span: "Return a null string to indicate that a navigation has been triggered." (S096 :827-828, 12 words across a line break).
- **F2. `{}` is latent, not a navigation outcome.** `inspector_web_mcp_agent.cc:48-49` would emit `{}` if the sentinel reached :208-218. Nothing in `WebMCPToolResponded` guards it. No note should say "navigation yields `output: {}`".
- **F3. Second sentinel producer.** S096 :841 (`form.submit()` inside a submit handler) emits the same sentinel and is outside LC12's span.
- **F4. Empty-string asymmetry (source-only).** Declarative `respondWith("")` reaches the wire as `""`; imperative `return ""` reaches it as `"Operation succeeded"`. The declarative path has no counterpart to `model_context.cc:287-288`. Depends on §5.1.
- **F5. Retained-artifact digest mismatch.** `corpus/evidence/round-19/validation/receipt.json` hashes to `25392bc6…`, not the `b7846d37…` cited in `.ufo/waves/round-19/w2/SourceS079.md`. Counting the current bytes (python, no runtime re-run): raw `toolResponded` records are 31 Completed, all 31 with an `output` key, and 32 Error, all 32 without. These counts agree with the omission rule, but the cited pin does not bind; treat as unpinned until the lane settles canonical bytes. Not a Chromium 154 runtime observation.
- **F6. Aliasing (QUALITY 14).** The wire type follows the text after `ToString`, not the JS type: JS `null` and string `"null"` both give `null`; JS `42` and `"42"` both give `42`; the text `"{}"` gives an object. `.ufo/waves/round-17/sources/BlinkInvoke.md:109` marked "[INFERENCE] '42' arrives as a number". The parse mechanism is now source-held. Still no runtime claim.
- **F7. "Not JSON null" holds on audited paths.** The sentinel never appears as `output: null`. `output: null` requires the text `"null"`; absence requires a non-Completed status.

## 5. Unknowns and inferences (not verified)

1. `ToCoreString` of a zero-length, non-empty v8 string yields a non-null WTF `String`. [INFERENCE]; affects F4 and the `""` row. Not fetched.
2. The `ScriptValue` given to `HandleWebMcpToolResponse` is non-empty; `ScriptValue::ToString` returns false only when empty (`script_value.cc:53-55`). [INFERENCE]
3. Callers of `probe::WebMCPToolResponded` outside `model_context.cc` were not enumerated (no repo-wide search). "Unreached" is scoped to the audited sites.
4. The generated `web_mcp.cc` (Blink build output) is not in source. Omission is derived from the generator template and `protocol_core.h`, not generated bytes.
5. `errorText` is `std::optional<String>` (`protocol_core.h:86-92`), so it is emitted whenever a `String` is passed, including a null `error.message`. Emitted content not examined.
6. Not examined: `model_context.cc:146-181` beyond the return shape, and the `tool_executed_cb` consumer that receives the sentinel after :739-743.

## 6. Checks for the main agent (not run here)

- Repo-wide search for `WebMCPToolResponded(` callers, to close §5.3.
- Resolve the round-19 receipt pin (F5).
- Decide LC12 scope (F1).

Report: `.ufo/waves/round-20/w1/SourceNullOutput.md`
