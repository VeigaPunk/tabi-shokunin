# Chromium 154 WebMCP `toolResponded` source findings

## Observed source identity

Tag: `154.0.8037.97`, Chromium commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. Access date for all three decoded files: **2026-10-21**.

| Source | URL opened | Decoded body SHA-256 / bytes / lines | Retained decoded body |
|---|---|---|---|
| WebMCP protocol declaration | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` / 3,969 B / 123 lines | `.ufo/waves/round-19/w1/SrcCdpToolResponded.body.gz` |
| Blink inspector event emitter | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` / 8,585 B / 245 lines | `.ufo/waves/round-19/w1/SrcCdpToolResponded.agent.cc.gz` |
| ModelContext caller paths | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` / 50,117 B / 1,245 lines | `.ufo/waves/round-19/w1/SrcCdpToolResponded.model_context.cc.gz` |

Hashes and sizes are for the decoded file bytes, not the Gitiles base64 response or gzip artifact.

## Source map

**PDL (`WebMCP.pdl`)**

- **25–30:** Declares `InvocationStatus` as a string enum with exactly `Completed`, `Canceled`, and `Error`.
- **58–69:** `invokeTool` takes `frameId`, `toolName`, and object `input`; its comment states the invocation ID response precedes tool events. This is the ordering claim already covered by S041.
- **109–115:** `toolResponded` carries required `invocationId` and `status` parameters.
- **116–118:** Describes `output` as optional and absent for statuses other than `Completed`; separately warns output is untrusted.
- **119–120:** Declares optional `errorText` (`string`).
- **121–123:** Describes and declares optional `exception` (`Runtime.RemoteObject`) for a JavaScript tool throw. Line 123 is outside S041's explicit 58–122 line anchor.

**Emitter (`inspector_web_mcp_agent.cc`)**

- **47–64 (`ParseJSON`):** Null input produces an empty protocol dictionary; 8-bit and 16-bit strings take their respective JSON-to-CBOR conversions; a parsed protocol value is returned when available, otherwise the original string is returned.
- **193–205 (`WebMCPToolExecuted`):** When enabled, sends `toolInvoked` with name, frame ID, invocation ID, and input. This is lifecycle context, not a `toolResponded` path.
- **208–218 (`WebMCPToolResponded`):** Returns without emitting if the domain is disabled; otherwise sends `toolResponded` with the same invocation ID, status `Completed`, and `ParseJSON(result)` as output.
- **220–230 (`WebMCPToolFailed`):** Returns if disabled. It maps only `kToolCancelled` to `Canceled`; every other `ScriptToolErrorCode` maps to `Error`.
- **231–239:** Initializes no remote object by default; wraps the supplied exception into a V8 inspector `RemoteObject` only when the optional exception exists and its `ScriptValue` is non-empty.
- **241–243:** Emits `toolResponded` for the failure path with `output = nullptr`, `errorText = error.message`, and the optional wrapped exception. The message is forwarded as supplied; this function does not derive it from the exception.

**Caller trace (`model_context.cc`)**

- **518–525 (`OnToolFailed`):** Calls the `WebMCPToolFailed` probe with `exception = nullopt`, then posts the execution callback. This is the no-exception failure path.
- **582–648 (`CancelTool`):** For declarative tools, delegates to `DeclarativeTool()->CancelTool()` (613–619). For the imperative path, removes the pending execution, aborts its controller when possible, and calls `OnToolFailed` with `kToolCancelled` (621–640); both paths dispatch the page-side `toolcancel` event (643–647). The source read here does not establish that declarative cancellation reaches the same `kToolCancelled` path.
- **651–670 (`GetCrossDocumentScriptToolResult`):** Emits `WebMCPToolResponded` with the computed result immediately if parsing is finished (654–658), or from the queued callback after parsing (661–670).
- **684–746 (`ExecuteDeclarativeTool`):** The comments describe navigation-response and `respondWith()` result paths (684–695). In the callback, a non-null successful result emits `WebMCPToolResponded` (728–734); a null-string result suppresses that event because the new document handles the response (729–731); an error emits `WebMCPToolFailed` with no exception (735–738).
- **856–871 (`OnToolExecuted`):** A successful `expected` result emits `WebMCPToolResponded` (864–866); a failed result creates `kToolInvocationFailed` and forwards `result.error()` separately as the exception to `WebMCPToolFailed` (868–870).

These are static source observations, not a runtime probe. They show the emitter's field mapping and the relevant ModelContext probe call sites. The generated probe-dispatch implementation between those hooks and the agent methods was not opened.

## Verbatim quotes

> “Output or error delivered as delivered to the agent. Missing if `status` is anything other than Completed.”
>
> — `WebMCP.pdl:116`; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT; accessed 2026-10-21; decoded SHA-256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`.

> `optional string errorText`
>
> — `WebMCP.pdl:120`; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT; accessed 2026-10-21; decoded SHA-256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`.

> `optional Runtime.RemoteObject exception`
>
> — `WebMCP.pdl:123`; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT; accessed 2026-10-21; decoded SHA-256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`.

> `const char* status = error.code == ScriptToolErrorCode::kToolCancelled ? protocol::WebMCP::InvocationStatusEnum::Canceled : protocol::WebMCP::InvocationStatusEnum::Error;`
>
> — `inspector_web_mcp_agent.cc:228–230`; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT; accessed 2026-10-21; decoded SHA-256 `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`.

## S041 decision and proposed registry row

S041 is the existing PDL row: its explicit anchor is `WebMCP.pdl:7,58–122`, and it teaches invocation ordering/outcome delivery. The reopened PDL has the same full digest as S041's recorded truncated digest. Reuse S041 for that existing contract; do not duplicate its invocation-order claim. The distinct addition here is the explicit enum-member anchor at 25–30, the exception declaration at 123, and especially the separate Blink emitter implementation at 208–243, which maps those statuses and fields. Propose this one scoped row; `SOURCES.md` was not edited.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Chromium 154 WebMCP PDL and inspector emitter — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl; https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc | code | A | Chromium 154 only: `toolResponded` status vocabulary, payload fields, and Blink's outcome-to-event mapping | tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; `WebMCP.pdl:25–30,109–123` (SHA-256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`); `inspector_web_mcp_agent.cc:208–243` (SHA-256 `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475`) | The emitter sends successful results as `Completed` with parsed output; maps `kToolCancelled` to `Canceled` and other `ScriptToolError`s to `Error`; on failure it sends null output, `error.message`, and a wrapped exception only when present and non-empty. This is implementation-source mapping, not runtime evidence. | mined | 2026-10-21 | on-release | `SKILL.md` round-19 declarative WebMCP decision table (proposed use) |

## Limits and tooling

- No runtime behavior was exercised; observed consequences still require the assigned loopback cases.
- `errorText` content depends on the incoming `ScriptToolError.message`; the emitter forwards it and does not equate it to exception text.
- The `xd://lsp` lookup returned “No such tool” and the mounted-device inventory has no LSP device. I used direct source reads for the cited statements; no text-search result is presented as semantic proof.
- No tools were installed or updated.

## Isolation

- Clone path: none; this scout produced no production file. The report and retained source bodies are the explicitly permitted seat-owned lane artifacts.
- Branch: not applicable.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (no clone created).
- Commit: none.
- Changed paths: `.ufo/waves/round-19/w1/SrcCdpToolResponded.md`; `.ufo/waves/round-19/w1/SrcCdpToolResponded.body.gz`; `.ufo/waves/round-19/w1/SrcCdpToolResponded.agent.cc.gz`; `.ufo/waves/round-19/w1/SrcCdpToolResponded.model_context.cc.gz`.