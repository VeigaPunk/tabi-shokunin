# BlinkInvoke — Chromium 154 Blink tool-invocation path (source open, round 17)

VERDICT: PASS

Seat `TabiR17.SrcBlinkInvoke-2`. Opened 2026-10-20. Purpose: the build's own implementation of
tool invocation — the CDP→renderer entry, how `execute` results and exceptions map to an
`InvocationStatus`, and whether input is validated against `inputSchema`. C2 case ids
(`invoke-imperative-success`, `-throws`, `-rejects`, `-unknown-tool`, `-input-schema-mismatch`,
`-declarative-form`, `-after-unregister`, `-concurrent-ids`, `-flags-off-control`,
`-iframe-frameid`, `-navigation-pending`) are mapped to facts below.

## Opened source

| Field | Value |
|---|---|
| canonical URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT |
| grep-able URL (no `?format=TEXT`) | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc |
| revision | tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles ref JSON); git blob `c5ef637f8e676ecc56050982a07f1c8e9056218c` (matches local `git hash-object` of the decoded bytes) |
| access date | 2026-10-20 |
| raw-fetch sha256 (as served, base64, 66,824 B) | `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` |
| decoded sha256 (50,117 B, 1,245 lines) | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` |
| anchor | `ExecuteTool` 528-580; `ExecuteDeclarativeTool` 695-746; `ExecuteV8Tool` 752-811; `OnToolExecuted` 856-873; `GetToolErrorMessage` 183-209 |
| kind / tier / recheck | `code` / **A**, scoped to the Blink 154 invocation semantics at this tag / `on-release` |

**VERBATIM quote** (comment lines 748-750, file sha256 `474083d6…8823`; 22 words):

> `It converts the input argument string to a JSON object, calls the function, receives a Promise, waits for the promise to resolve`

**What it teaches the lane, one line:** `invokeTool` answers `invocationId` before any event, a
resolving `execute` becomes `Completed` (any value stringified), a throw or reject becomes `Error`
with the thrown value in `exception`, and no input is ever checked against `inputSchema`.

## Invoke path (source-read, end to end)

1. CDP `WebMCP.invokeTool{frameId, toolName, input}` → `content::protocol::WebMCPHandler::InvokeTool`
   (`content/browser/devtools/protocol/webmcp_handler.cc:58-116`). Disabled domain → `ServerError`;
   frame id not in this target → `InvalidParams`; `input` object serialized CBOR→JSON string,
   omitted `input` → `"{}"` (lines 90-99); an `UnguessableToken` is minted and memoized with the
   frame's last committed origin (101-102).
2. Renderer mojo `InvokeScriptToolForInspector` (`third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc:987-1006`)
   returns `success=true` **as soon as a registered declaration exists** — it checks
   `GetScriptToolDeclaration(tool_name)`, then posts `ExecuteTool` to the `kInternalInspector` task
   runner with a `base::DoNothing()` callback. No declaration → `Run(false)`.
3. Handler turns `false` into a **command failure** `InvalidParams("Tool not found")`
   (`webmcp_handler.cc:104-115`) and returns; the success path returns only the id. So the command
   result certifies "a tool of that name existed", never "execution succeeded".
4. `ModelContext::ExecuteTool` (`model_context.cc:528-580`) creates an `AbortController` in the main
   world, fires `probe::WebMCPToolExecuted` → CDP `toolInvoked` **before** the `tool_map_` lookup,
   then dispatches to the V8 callback or the declarative form. Unknown name →
   `ScriptToolError(kInvalidToolName, "Tool not found: "+name)` → `OnToolFailed`.
5. Imperative: `ExecuteV8Tool` (752-811) `JSON.parse`s the string and requires an **object**
   (`JSONStringToScriptObject`, 122-140; arrays count, primitives never) → calls the tool's
   `execute(input, {signal})` and attaches `Then` handlers (`ToolFunctionFinishedCallback`,
   250-294).
6. Result shaping (262-290): object → `JSON.stringify`; non-object → `ToString`; empty/absent →
   `"Operation succeeded"`; a stringify throw is routed to the failure path.

## Result and exception → `InvocationStatus`

| Trigger | Status | Payload |
|---|---|---|
| promise resolves (any value) | `Completed` | `output = ParseJSON(result)` — valid JSON delivered parsed, otherwise the raw string (`inspector_web_mcp_agent.cc:47-64, 208-218`) |
| `execute` throws **or** returned promise rejects | `Error` | `exception` = thrown value as `Runtime.RemoteObject`; `errorText` = `error.message` which is **empty** for this path (`model_context.cc:300-321, 856-873`; agent 219-244) |
| input string is not JSON or not an object | `Error` | `errorText` "Failed to parse input arguments"; `exception` absent (`model_context.cc:764-773`) |
| engine cancels (`cancelInvocation`, document teardown) | `Canceled` | `errorText` empty on the CDP probe path (the error carries no message); only `kToolCancelled` maps to Canceled (`model_context.cc:582-652`; agent 228-230). The text "Tool was cancelled" is `GetToolErrorMessage`'s conversion for the mojo `ExecuteScriptTool` path (`model_context.cc:183-209, 904-921`) |
| cross-origin navigation with invocation pending | `Error` | "Cannot return tool results after a cross-origin navigation" (`webmcp_handler.cc:118-158`) |

Console text for a JS failure is `WebMCP tool execution failed: <message>` (or `Unknown error`),
`model_context.cc:302-317` — it never reaches `errorText`.

## Schema validation — none at execution

`model_context_tool.idl:30-33` (tag 154.0.8037.97, sha256 `981610fc…c0def`). It first says the
input is expected to match `ModelContextTool#inputSchema`, then:

> This is currently not enforced upon tool execution

(lines 31-32, 8 words, verbatim; the comment continues "but will likely be when
https://github.com/webmachinelearning/webmcp/issues/92 is addressed").

What *is* checked: JSON syntax + "is an object" at invocation (above); at registration, tool name
1-128 chars of `[A-Za-z0-9_.-]` (`model_context.cc:108-120`), no duplicate name, `inputSchema`
must be an object that stringifies (77-106), and permissions-policy `tools` +
origin-keyed agent cluster (360-374, 955-969). Declarative tools differ: the browser fills and
submits the form, so HTML constraint validation applies and failures surface as
`kToolInvocationFailed` with `Form validation failed: …`
(`model_context_test.cc:613-650`, test-anchored).

## Facts this row supports (C2), each with its own anchor

- F1 `invokeTool` returns only `invocationId`; "Response is sent before tool events"; statuses are
  `Completed`, `Canceled`, `Error` — `webmcp.pdl:26-30, 59-69`.
- F2 Command success = declaration exists, execution is posted async — `local_frame_mojo_handler.cc:992-1001`.
- F3 Unknown/unregistered tool = command `InvalidParams("Tool not found")`, **no `toolInvoked` and no
  `toolResponded`** (probes live inside `ExecuteTool`, never posted) — `local_frame_mojo_handler.cc:994-1005`;
  covers `invoke-unknown-tool` and `invoke-after-unregister`, and the same no-declaration branch is
  what a flags-off page reaches once the domain is enabled (`invoke-flags-off-control`).
- F4 `toolInvoked` fires before the name lookup, so a post-check unregister still yields
  `toolInvoked` then `Error` — `model_context.cc:528-557` (race, not observed).
- F5 Imperative input must be valid JSON **object**; mismatch against `inputSchema` is ignored and
  reaches `execute` unchanged — `model_context.cc:122-140, 764-773`; `model_context_tool.idl:30-33`
  (covers `invoke-input-schema-mismatch`).
- F6 Resolution → `Completed`; object serialized, non-object `ToString`, empty → "Operation
  succeeded" — `model_context.cc:262-290` (covers `invoke-imperative-success`).
- F7 Throw and reject are indistinguishable in status: both `Error`, differing only in the
  `exception` RemoteObject value; `errorText` is empty — `model_context.cc:291-293, 302-321, 856-873`
  (covers `invoke-imperative-throws`, `invoke-imperative-rejects`).
- F8 `toolResponded.output` is `ParseJSON(result)`: valid JSON text becomes a parsed JSON value,
  otherwise a string — `inspector_web_mcp_agent.cc:47-64, 208-218`; [INFERENCE] "42" arrives as a
  number.
- F9 `Canceled` requires `kToolCancelled`; an imperative cancel aborts the signal, runs the failed
  callback, ignores the tool's later settlement and dispatches `toolcancel` — `model_context.cc:582-652`
  (covers concurrent ids + cancel; ids are per-invocation `UnguessableToken`s — `webmcp_handler.cc:101-102`,
  `model_context.cc:528-534`).
- F10 A tool that rejects with its own `AbortError` is `Error`, not `Canceled` — same mapping, F7/F9.
- F11 Declarative invocation fills and submits the form; `respondWith` or the navigated document's
  `<script type="application/ld+json">` supplies the result — `model_context.cc:695-746, 146-181,
  653-680` (covers `invoke-declarative-form`).
- F12 Iframe: the handler resolves `frameId` inside the target and rejects a frame from another
  target — `webmcp_handler.cc:72-86` (covers `invoke-iframe-frameid`).
- F13 Pending across navigation: cross-origin → `Error` with the navigation text; same-origin → new
  document's `ld+json` result — `webmcp_handler.cc:118-158` (covers `invoke-navigation-pending`).
- F14 JS `executeTool(tool, inputArguments: DOMString, options)` corroborates the r16 note's
  "DOMString, not an optional object" — `model_context.idl:98-104`.

C1: this source supports no C1 claim (C1 anchors lane scripts). C3: no sibling overlap created;
the CDP invocation surface itself is already under the routed integrator ruling.

## Registry row draft (splits to 13 fields on `|`)

| S0?? | Chromium 154 Blink ModelContext implementation — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | code | A | Chromium 154 Blink tool invocation: invoke entry, execute result and exception to CDP status, input validation | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), model_context.cc:528-580, 748-811, 856-873, blob c5ef637f, sha256 474083d6…8823 | invokeTool answers with an invocationId before any tool event; a resolving execute maps to Completed, a throw or reject to Error without errorText, Canceled needs kToolCancelled, and input is never checked against inputSchema | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |

Integration note for L1: assign the real id and make `corpus/knowledge/webmcp-invocation-round-17.md`
cite it (`check-sources.mjs` fails `used_by_missing`/`used_by_uncited` until both exist). URL is
distinct from the sibling PDL row (`…/domains/WebMCP.pdl`), so no `E04`.

## Gate entry

| Field | Value |
|---|---|
| URL | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT |
| access date | 2026-10-20 |
| revision | tag `154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, blob `c5ef637f8e676ecc56050982a07f1c8e9056218c` |
| quote + location | "It converts the input argument string to a JSON object, calls the function, receives a Promise, waits for the promise to resolve" — `model_context.cc:748-750` |
| sha256 | decoded `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`; as served (base64) `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` |

## Supporting files opened at the same tag (not row URLs)

| path | sha256 | role |
|---|---|---|
| `content/browser/devtools/protocol/webmcp_handler.cc` | `53793d1e…cb1a4` | browser `InvokeTool`, input serialization, navigation handling |
| `renderer/core/frame/local_frame_mojo_handler.cc` | `9311613a…3862` | declaration check → async `ExecuteTool` |
| `renderer/core/inspector/inspector_web_mcp_agent.cc` | `1cc55ef9…8475` | status selection, exception wrapping |
| `renderer/core/script_tools/model_context_tool.idl` | `981610fc…c0def` | the no-schema-enforcement comment |
| `renderer/core/script_tools/model_context.idl` | `66c5a747…5b39` | `executeTool` DOMString signature |
| `renderer/core/script_tools/model_context_test.cc` | `4e674954…542c` | declarative validation failure message |
| `third_party/blink/public/mojom/frame/frame.mojom` | `832a44ca…7128` | `InvokeScriptToolForInspector` → `(bool success)` |

Cross-check: `model_context_supplement.idl` re-fetched here as `50dd337d…6364`, byte-identical to
S033's recorded digest; tag commit matches S033/S034/S035.

## Deltas, contradictions, limits

- **No contradiction** with `corpus/knowledge/webmcp-chromium-loopback-round-16.md`: it says the
  probe's invoke returned an id and that `toolInvoked.input` is a JSON string (source agrees), and
  "No tool is invoked in the receipt" stays true — this row is static source, not a run.
- The note could not state what `status`/`exception` mean; F6-F9 now anchor that. New: an
  unknown tool is a **command failure with no events** (the note never claimed otherwise).
- `errorText` being omitted when the message is empty is [INFERENCE] about the generated
  serializer; the empty `error.message` itself is source-read.
- Static read only: no browser launch by this seat. The declarative form-tool implementation file
  was not opened; the "Form validation failed" string is taken from the in-tree test.
- WPT directory at the tag was listed but its files were not opened and are not cited.

## Structural validation of the row draft

Ran the real gate on a temp root (whole `corpus/` copied, row appended as `S041`, stub
`corpus/knowledge/webmcp-invocation-round-17.md` citing `S041`):
`node scripts/check-sources.mjs --root /tmp/srccheck2` → `SOURCES_GATE verdict=clean rows=41
tiers=A:32,B:4,C:5 status=queued:2,mined:34,rejected:5 findings=0`, exit 0. Without the note stub
the only finding for the row is `used_by_missing` (E11), i.e. no structural defect.

## Fetch log

`curl -sS '<gitiles>?format=TEXT' | base64 -d` at `refs/tags/154.0.8037.97` (all HTTP 200):
`model_context.cc`,
`.h`, `.idl`, `model_context_tool.idl`, `script_tool_types.h`, `script_tool_context.h`,
`model_context_test.cc`, `model_context_supplement.idl`, `inspector_web_mcp_agent.cc`,
`webmcp_handler.cc`, `webmcp.pdl`, `local_frame_mojo_handler.cc`, `frame.mojom`,
`local_frame.cc` (no `InvokeScriptToolForInspector`), directory listings for
`core/script_tools/`, `renderer/modules/`, `content/browser/devtools/protocol/`,
`core/html/forms/`, `web_tests/external/wpt/webmcp/imperative/`. Path sweeps: the obvious
`content/browser/devtools/protocol/web_mcp_handler.cc` is **404** (the real file is
`webmcp_handler.cc`); `renderer/modules/` has no model-context directory; `local_frame.cc` fetched
200 but contains no `InvokeScriptToolForInspector` (it is in `local_frame_mojo_handler.cc`). At 154
`core/script_tools/` has no `model_context_tool_invocation.*` or `tool.idl` (main-only), so the whole
invoke path lives in `model_context.cc` here. Tag ref JSON → commit above; file JSON → blob above.
