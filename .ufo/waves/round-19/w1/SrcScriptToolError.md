# C1 source finding — ScriptToolError to CDP WebMCP.toolResponded

## Verdict

At Chromium tag `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), a declarative fill rejection is a Blink `ScriptToolError`; `kInvalidInputArguments` reaches CDP as `toolResponded.status = "Error"`, `errorText = error.message`, and no exception object. The error code itself is not exposed as a distinct CDP status or integer. This is source-level evidence only; no browser/CDP run was made here.

## Retained source and provenance

- Opened URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/script_tool_types.h?format=TEXT
- Access date: 2026-10-21.
- The Gitiles `format=TEXT` transfer was base64-decoded before hashing and retention. Decoded body: SHA-256 `ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d`, 1431 bytes.
- Retained decoded source, gzip-compressed: `.ufo/waves/round-19/w1/SrcScriptToolError.body.gz` (source is `script_tool_types.h`).
- All additional files below were fetched from the same tag and decoded before hashing; exact URLs use the common prefix `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/` and the listed path followed by `?format=TEXT`.

| Gitiles path | Decoded SHA-256 | Bytes |
|---|---|---:|
| `third_party/blink/renderer/core/script_tools/script_tool_types.h` | `ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d` | 1431 |
| `third_party/blink/public/web/web_script_tool_types.h` | `1f65d83f4057523691a450671ccdb501d28635a6c59de6928560f1f773a3a5b0` | 1588 |
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | 51703 |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | 68278 |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | 50117 |
| `third_party/blink/public/mojom/frame/frame.mojom` | `832a44caec24aa2c32ee93cb7818cea8e8860210df40249edb1aa44bf89e7128` | 70495 |
| `third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc` | `9311613afbf96a6d5a10e87d8f78c633f3ac29948550144d2b2870f899263862` | 62152 |
| `third_party/blink/renderer/core/probe/core_probes.pidl` | `35d473989420038afb268fefc970a5f9e03d86d3f6666d7d45e14a0d094bf151` | 19224 |
| `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` | 8585 |
| `content/browser/devtools/protocol/webmcp_handler.cc` | `53793d1ebb5e2027abbb95c0f8cb909dd0d4bccae18f9309f658651d722cb1a4` | 5765 |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | 3969 |

## Line-numbered path map

1. **Error representation and public mirror.** `third_party/blink/renderer/core/script_tools/script_tool_types.h:16-22` defines `ScriptToolErrorCode` with, in order, `kInvalidToolName`, `kInvalidInputArguments`, `kMissingRequiredSubmitButton`, `kToolInvocationFailed`, `kToolCancelled`; `:24-36` defines `ScriptToolError { code, message }`; `:48-49` carries it as `base::expected<String, ScriptToolError>` in `ScriptToolExecutedCallback`. `third_party/blink/public/web/web_script_tool_types.h:17-39,49-51` contains the corresponding `WebScriptToolErrorCode`, `WebScriptToolError`, and public result callback. `model_context.cc:58-67` has a `STATIC_ASSERT_ENUM` for each matching member. The source declares no explicit numeric assignments.

2. **Declarative fill rejects before mutation.** `third_party/blink/renderer/core/html/forms/html_form_element.cc:174-198` starts declarative execution, derives `require_submit_button` as the inverse of `toolautosubmit` (`:181-185`), calls `FillFormControls` inside a `CEReactionsScope` (`:189-194`), and immediately invokes `done_callback` with `base::unexpected(error)` and returns on any error (`:196-198`). `:231-259` shows its branches: malformed JSON → `kInvalidInputArguments` / `Failed to parse input string as JSON` (`:237-241`); non-object JSON → `kInvalidInputArguments` / `JSON input arguments must be an object` (`:243-247`); missing submit button when required → `kMissingRequiredSubmitButton` (`:249-256`); otherwise delegate to `FormMCPSchema::FillData` (`:258`).

3. **Specific `FillData` branches.** `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:208-220` walks every JSON property and returns `kInvalidInputArguments` with `Input contains a parameter "<name>" but there is no such parameter for the tool` when the name is absent. `:221-231` returns the same code when `ValidateParameterData` rejects a value: if `ToString` succeeds, the message is `Invalid value "<value>" for parameter <name>`; otherwise it is `Invalid value for parameter <name>`. `:234-243` is a separate second pass that applies values only after all supplied properties validated, then returns `nullopt`; this is why a `FillData` rejection leaves earlier fields unapplied. `:246-300` dispatches validation by control family: text/date/datetime-local/month/week/time/color to text validation; number/range to number validation; select, checkbox, radio, and feature-gated file input to their validators; custom elements currently return true with a TODO; an unhandled control family returns false.

4. **CDP invoke starts asynchronously and does not transport the fill error in its command reply.** `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl:25-30` declares string status members `Completed`, `Canceled`, `Error`; `:58-69` declares `invokeTool` and says its invocation id is returned before tool events. `content/browser/devtools/protocol/webmcp_handler.cc:58-99` checks enabled state, host, frame and target, then serializes the input object to JSON (or `{}`). `:101-115` creates/stores the invocation token, calls `InvokeScriptToolForInspector`, and sends command success with the token if the tool was found; only a missing tool becomes `InvalidParams("Tool not found")` (`:109-113`). `third_party/blink/public/mojom/frame/frame.mojom:1112-1119` documents the method as starting an invocation and returning only `(bool success)`, not a `ScriptToolError` or message. `third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc:987-1005` checks that a model context and tool declaration exist, posts `ModelContext::ExecuteTool(..., base::DoNothing())` to the internal-inspector task runner, and returns `true`; absent tool returns `false`. Thus an invalid fill on an existing tool is reported via the asynchronous event, not by changing the invoke command reply.

5. **Blink executes the declared form tool and raises a failure probe.** `third_party/blink/renderer/core/script_tools/model_context.cc:528-580` creates the abort controller, calls `probe::WebMCPToolExecuted` (`:546`), and selects the declarative branch (`:562-565`). `:695-745` records the pending execution, calls the declarative tool (`:719-745`), and for a returned `ScriptToolError` calls `probe::WebMCPToolFailed(document, result.error(), invocation_id, /*exception=*/std::nullopt)` (`:735-738`) before forwarding the result to the pending callback. The probe contract is declared in `third_party/blink/renderer/core/probe/core_probes.pidl:253-256`; the `InspectorWebMCPAgent` header labels its corresponding handlers as probes (`inspector_web_mcp_agent.h:46-60`).

6. **Inspector converts the failure probe into the CDP event.** `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc:193-206` emits `toolInvoked`; `:208-218` emits `Completed` for successful output. On failure, `:220-230` maps only `kToolCancelled` to `Canceled` and every other `ScriptToolErrorCode` to `Error`; `:231-239` wraps a V8 exception only when the optional exception exists and is non-empty; `:241-243` calls `toolResponded(invocationId, status, nullptr, error.message, remote_object)`. For `FillData` errors the caller explicitly passed `nullopt`, so this branch supplies no exception object; `output` is null and `errorText` is the original `ScriptToolError.message`.

7. **Wire event contract.** `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl:109-123` declares `toolResponded` parameters `invocationId`, `status`, optional `output`, optional `errorText`, and optional `Runtime.RemoteObject exception`; its comment says `output` is missing unless status is `Completed`. A fill rejection therefore has CDP status string `Error`, an error message in `errorText`, and no `output` or `exception`. This is not a numeric status code and does not expose `kInvalidInputArguments` as a separate protocol field.

8. **Related but distinct branches.** `html_form_element.cc:729-759` can turn native HTML form constraint-validation failure after filling into `kToolInvocationFailed` with a built error message; `:807-814` does the same for `preventDefault()` without `respondWith()`. `:290-328` shows `respondWith` rejection/serialization failure paths (the rejection is reported separately to the console, then passed as `kToolInvocationFailed`). These still enter the same declarative failure-probe route. The navigation success path returns a null string (`:824-830`); `model_context.cc:728-738` intentionally suppresses `toolResponded` for that result so navigation handling is separate. `model_context.cc:183-210,904-920` has `GetToolErrorMessage` for the separate `ExecuteScriptTool` callback path; the inspector event path above instead passes `error.message` directly.

## Verbatim source quotes

1. `"kInvalidToolName, kInvalidInputArguments, kMissingRequiredSubmitButton, kToolInvocationFailed, kToolCancelled,"` — `script_tool_types.h:16-22`; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/script_tool_types.h?format=TEXT; accessed 2026-10-21; decoded SHA-256 `ee9006f7cc92f6451ff3fc9a0930d55bd291bb27a263c26aa8a7b4d2774ca25d`, 1431 bytes.
2. `"// If the data isn't valid, form control states remain unchanged."` — `form_mcp_schema.cc:210`; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT; accessed 2026-10-21; decoded SHA-256 `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`, 51703 bytes.
3. `"# Error text for protocol users."` — `WebMCP.pdl:119`; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT; accessed 2026-10-21; decoded SHA-256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`, 3969 bytes.
4. `"GetFrontend()->toolResponded(String(invocation_id.ToString()), status, nullptr, error.message, std::move(remote_object));"` — `inspector_web_mcp_agent.cc:241-243`; URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT; accessed 2026-10-21; decoded SHA-256 `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`, 8585 bytes.

## Search and remaining gaps

- Searched Gitiles directory inventories for Blink `script_tools`, `core/inspector`, content DevTools protocol, Blink `public/mojom`, `public/mojom/ai`, and `public/mojom/frame`; opened the matching tool, inspector, handler, PDL, public-type, and frame-interface sections above. The `public/mojom/ai` inventory has no `model_context` or `script_tool` file; the frame Mojo method carries only the invoke-start boolean, while error code/message are Blink C++ types.
- LSP device is unavailable in this tool environment: reading `xd://lsp` returned “No such tool: xd://lsp”. Local literal symbol searches located source ranges; all claims here come from opening the cited source, not treating search results as semantic proof.
- Confidence: high for the tag-pinned source path and field mapping. Remaining gap: runtime observation on Chromium 154 is not supplied by this source scout; the validation family receipt must establish actual behavior independently.

## Proposed SOURCES row

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 ScriptToolError and WebMCP response path — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/script_tool_types.h?format=TEXT | code | A | Declarative form fill errors mapped to experimental CDP WebMCP.toolResponded at Chromium 154.0.8037.97 only | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; `script_tool_types.h:16-49`, `form_mcp_schema.cc:208-300`, `html_form_element.cc:174-259`, `frame.mojom:1112-1119`, `local_frame_mojo_handler.cc:987-1005`, `model_context.cc:528-580,695-745`, `inspector_web_mcp_agent.cc:220-243`, `WebMCP.pdl:25-30,109-123` | `FillData` rejects invalid declarative input with `kInvalidInputArguments`; for that error the inspector emits CDP status `Error`, forwards `ScriptToolError.message` as `errorText`, and has no exception object. The error enum is not exposed as a distinct CDP field; source-level, not a JSON Schema or runtime claim. | mined | 2026-10-21 | on-release | `SKILL.md` C1 declarative validation table (round 19, proposed) |

## Isolation

- Scope: read-only source scout. No production files, registry rows, or domain source trees were edited.
- Authorized lane artifacts: this report and `.ufo/waves/round-19/w1/SrcScriptToolError.body.gz` only.
- Production clone, branch, base, commit, and changed production paths: not applicable; no production files were authored.
