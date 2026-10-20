VERDICT: PASS

Seat `TabiR17.SrcBlinkInvoke-2` (leaf, no dispatch). Full dossier:
`.ufo/waves/round-17/sources/BlinkInvoke.md`.

## Opened

Chromium 154 Blink tool invocation, `third_party/blink/renderer/core/script_tools/model_context.cc`
at tag `154.0.8037.97` (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, git blob
`c5ef637f8e676ecc56050982a07f1c8e9056218c`, reproduced locally with `git hash-object`), fetched
2026-10-20 from
https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT

- raw (base64) sha256 `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`, 66,824 B
- decoded sha256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`, 50,117 B,
  1,245 lines
- Quote, lines 748-750 (22 words, verbatim): "It converts the input argument string to a JSON
  object, calls the function, receives a Promise, waits for the promise to resolve"
- Kind `code`, tier **A** scoped to Blink 154 invocation semantics at this tag, recheck `on-release`.
- Path finding: at 154 all invocation code is here; `core/script_tools/` has no
  `model_context_tool_invocation.*` or `tool.idl` (main-only, per the round-16 SrcChromiumIdl note,
  re-confirmed by directory listing).

## Invoke path (source-read)

1. `WebMCPHandler::InvokeTool` (`content/browser/devtools/protocol/webmcp_handler.cc:58-116`):
   disabled domain → `ServerError`; foreign frameId → `InvalidParams`; `input` object → CBOR → JSON
   string, absent → `"{}"`; mints `UnguessableToken` + memoizes committed origin.
2. `LocalFrameMojoHandler::InvokeScriptToolForInspector`
   (`renderer/core/frame/local_frame_mojo_handler.cc:987-1006`) answers `success=true` when
   `GetScriptToolDeclaration(name)` exists, then **posts** `ExecuteTool` to `kInternalInspector` with
   `base::DoNothing()`. So the command result means "declared", never "executed".
3. `ModelContext::ExecuteTool` (`model_context.cc:528-580`) probes `toolInvoked` **before** the
   `tool_map_` lookup, then runs the V8 callback or the declarative form.
4. Imperative `ExecuteV8Tool` (`:752-811`): `JSON.parse` + require object (`:122-140`), call
   `execute(input, {signal})`; result shaping at `:262-290`.

## Result / exception → status

- `Completed`: promise resolved. `output = ParseJSON(result)` — object was JSON-stringified,
  non-object `ToString`, empty → `"Operation succeeded"` (`inspector_web_mcp_agent.cc:47-64,208-218`).
- `Error`: throw or reject (`model_context.cc:291-293,302-321,856-873`). `exception` =
  `Runtime.RemoteObject` of the thrown value; `errorText` = `error.message`, **empty** on this path;
  console gets `WebMCP tool execution failed: <message>`.
- `Error`: input not valid JSON or not an object → `errorText` "Failed to parse input arguments"
  (`:764-773`); execute is never called.
- `Canceled`: only `kToolCancelled` (`inspector_web_mcp_agent.cc:228-230`) — CDP `cancelInvocation`
  → abort signal + failed callback + `toolcancel` (`model_context.cc:582-652`); errorText empty on
  the probe path. A tool's own `AbortError` rejection is `Error`.
- `Error`: cross-origin navigation while pending → "Cannot return tool results after a
  cross-origin navigation" (`webmcp_handler.cc:118-158`).

## Schema validation: none at execution

`model_context_tool.idl:30-33` (sha `981610fc…c0def`): "The structure of `input` is expected to
match the structure described in `ModelContextTool#inputSchema` above. This is currently not
enforced upon tool execution, but will likely be when". Only JSON-syntax + is-object is checked;
`inputSchema` is stringified at registration and never consulted at invocation. Declarative tools
instead get HTML form-constraint validation (`kToolInvocationFailed`, "Form validation failed: …",
`model_context_test.cc:613-650`).

## C2 case map (source expectation, fixed before the run)

| case | source-expected observation |
|---|---|
| `invoke-imperative-success` | command → id; `toolInvoked`; `toolResponded` Completed + output |
| `invoke-imperative-throws` | Error, `exception` = thrown value, no `errorText` |
| `invoke-imperative-rejects` | identical to throws; only the exception value differs |
| `invoke-unknown-tool` | command fails `InvalidParams("Tool not found")`; **zero** events |
| `invoke-input-schema-mismatch` | ignored; execute receives mismatched object; Completed on resolve |
| `invoke-declarative-form` | form filled+submitted; `respondWith` / ld+json supplies result |
| `invoke-after-unregister` | declaration gone → command failure, zero events |
| `invoke-concurrent-ids` | distinct tokens, per-id `pending_executions_`; correlate by id |
| `invoke-flags-off-control` | no model context → no declaration → command failure, no events |
| `invoke-iframe-frameid` | frameId resolved inside target; foreign target → `InvalidParams` |
| `invoke-navigation-pending` | cross-origin → Error with navigation text; same-origin → ld+json |

## Cross-checks and contradictions

- No contradiction with `corpus/knowledge/webmcp-chromium-loopback-round-16.md`. It agrees that
  `toolInvoked.input` is a string and that "No tool is invoked in the receipt" (this row is static).
  It did **not** state what `status`/`exception` mean, and never claimed unknown-tool emits events.
- Corroborates the note's seat-read "`executeTool` needs a JSON string": `model_context.idl:98-104`
  (`RegisteredTool`, `DOMString inputArguments`, options).
- S033/S034 pin agreement: same tag commit; `model_context_supplement.idl` re-fetch is
  `50dd337d…6364`, byte-identical to S033. No duplicate URL with sibling `PdlInvoke` (that row is
  `…/domains/WebMCP.pdl`).
- `DevToolsWebMCPSupport`/`WebMCP` gating (S034) is unchanged; this row is not a flag row.

## Draft registry row (13 split fields; L1 assigns the id)

`| S0?? | Chromium 154 Blink ModelContext implementation — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT | code | A | Chromium 154 Blink tool invocation: invoke entry, execute result and exception to CDP status, input validation | tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), model_context.cc:528-580, 748-811, 856-873, blob c5ef637f, sha256 474083d6…8823 | invokeTool answers with an invocationId before any tool event; a resolving execute maps to Completed, a throw or reject to Error without errorText, Canceled needs kToolCancelled, and input is never checked against inputSchema | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |`

Gate entry: URL + 2026-10-20 + quote `model_context.cc:748-750` + decoded sha256
`474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` (as-served
`039e24a0…d24d`).

Structural proof: whole `corpus/` copied to `/tmp/srccheck2`, row appended as `S041`, stub note
citing `S041` → `node scripts/check-sources.mjs --root /tmp/srccheck2` prints
`SOURCES_GATE verdict=clean rows=41 … findings=0`, exit 0. Without the stub the row's only finding
is `used_by_missing` (E11), so **the note must cite the assigned id before the row is appended**.

## Limits

- Static read only; no browser launched, no tool invoked by this seat. The exception/errorText
  semantics are source-read; errorText omission for an empty message is [INFERENCE] on the generated
  serializer. Declarative form-tool implementation not opened (test-anchored message). WPT files
  listed but not opened. No C1 or C3 support from this source.

Files written:
- `.ufo/waves/round-17/sources/BlinkInvoke.md`
- `.ufo/waves/round-17/w1/SrcBlinkInvoke.md`
