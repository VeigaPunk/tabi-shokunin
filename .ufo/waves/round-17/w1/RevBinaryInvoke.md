VERDICT: PASS

# RevBinaryInvoke — WebMCP invocation strings in Chromium 154 (read-only, lane tabi)

Artifact: `/usr/lib/chromium/chromium`, sha256 `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a`
(329,260,096 B, ELF pie, stripped, BuildID `a97a59aed26d2d01106de09daa4168bd35094b4d`), `Chromium 154.0.8037.97`.
Also searched: `resources.pak` (`35892fd6…`), `chrome_100_percent.pak`, `chrome_200_percent.pak` — 0 hits for
`WebMCP`/`modelContext`/`invokeTool`/`respondWith` (DevTools frontend carries no WebMCP JS).

Method (all read-only, no installs, nothing added to any package manager):
1. `strings -n 6 /usr/lib/chromium/chromium` → 1,052,709 strings (`/tmp/r17-invoke/chromium.str`).
2. `grep -boa` for every candidate → byte offsets below (decimal, as `grep -boa` prints). Segment 02 is
   `LOAD offset=0 VA=0`, so for `.rodata` **file offset == VA**; `.text` (`0x1887000`) VA = offset + `0x1000`.
3. LEA cross-reference: scanned `.text` (289 MB) for `REX.W 8D /r` with `mod=00,rm=101` and resolved each
   RIP-relative displacement against the candidate string VAs (`/tmp/r17-invoke/codestrings.py`). This groups
   strings into the *same code cluster* as the protocol method/event names — the evidence chain below.
4. Live confirmation on the same build: three loopback probes (`/tmp/r17-invoke/probe{,2,3}.mjs`,
   `/usr/lib/chromium/chromium` headless, `--remote-debugging-port=0`, temp `--user-data-dir` + temp `HOME`,
   page served on `127.0.0.1:<ephemeral>`, flags `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
   --enable-blink-features=WebMCP,WebMCPTesting`). Page surface: `document.modelContext` (constructor
   `ModelContext`), prototype `ontoolchange, executeTool, getTools, registerTool`; `'modelContext' in navigator`
   false; `'ontoolactivated' in form` false; `window` keys `ModelContext, WebMCPEvent`. Raw evidence:
   `/tmp/r17-invoke/probe2-result.json`, `/tmp/r17-invoke/probe3-result.json`, `/tmp/r17-invoke/probe-result.json`.

## String table (offset = file byte offset; `.rodata` VA == offset)

Protocol names/fields (Blink/agent side; refs at `.text` 0x555b697…0x555bc53, and browser-side dispatch at 0x6dfb468…0x6dfbee5):
```
3903550  WebMCP.invokeTool          3903557  invokeTool              5997633  cancelInvocation
7420056  WebMCP.toolInvoked         7420063  toolInvoked             5065009  WebMCP.toolResponded
5065016  toolResponded              7652560  WebMCP.toolsAdded       7652567  toolsAdded
895171   WebMCP.toolsRemoved        895178   toolsRemoved            7633232  invokeTool (2nd)
2979817  invocationId               23506893 invocationId (2nd)
```
InvocationStatus enum values — the exact literals referenced by the invocation bookkeeping code (refs 0xf87e746/0xf87e8bc/0xf87e8c3):
```
22677735 Completed  22677745 Canceled  22677754 Error   5588464 %016lX%016lX   (id format: 2x uint64 -> 32 upper hex)
```
CDP-visible protocol errors (code cluster 0x5823ff3…0x5824dd5 = WebMCP domain handler; all `ServerError`/`InvalidParams`):
```
3904960  WebMCP domain is not enabled                  (ref 0x5823ff3)
3675467  No frame for given id found                   (ref 0x5824174; the 2nd copy 2883895 belongs to another handler, ref 0xebc0117)
7635001  FrameId does not belong to current target     (ref 0x5824266)
875106   Cannot return tool results after a cross-origin navigation (ref 0x5824ca6)
6706998  Tool not found                                (ref 0x5824dd5; the 5190104 copy is the renderer's "...: " form)
2660495  Invalid invocation id                         (ref 0xf87e279)
6611203  No pending execution for invocation id         (ref 0xf87e2fb)
```
Renderer/`core/script_tools/model_context.cc` strings (path string itself at 6599090; refs 0xe83a886…0xe855818):
```
5190104  Tool not found:                       7068107  Failed to parse input arguments
1700999  Tool execution cancelled by abort signal
3335363  Cannot execute tools that live in a document with an opaque origin.
3335431  WebMCP tool execution failed:        (console prefix observed: "WebMCP tool execution failed: Uncaught Error: …")
3335209  Description is required              1933485  Invalid tool name
4263757  Duplicate tool name                  4753105  Duplicate tool name:
6150267  Tool name cannot be empty.           4031972  JSON input arguments must be an object
1699373  invalid input schema: toJSON() returns undefined
4281018  Failed to serialize inputSchema for tool:
3350830  Tool inputSchema must have a 'type' property that is a string for tool:
3587050  Tool inputSchema 'properties' must be an object if present for tool:
5666599  Tool inputSchema 'type' must be 'object' for tool:
6150294  Tool inputSchema 'required' must be an array if present for tool:
1699422  Tool was executed but the invocation failed. For example, the script function threw an error
770827   Tool execution cancelled by a form reset
```
Declarative/`agentInvoked`/`respondWith` surface (present as strings; dispatch path unobserved — see Divergences):
```
4975360,6600346  agentInvoked
6600288  You can only call respondWith on an submit event that has agentInvoked == true.
1245035  To call respondWith, you must first call preventDefault.
1934605  To call respondWith, the event must be currently being dispatched.
7563372  respondWith() was already called.        4730097  respondWith promise was rejected
4032011  respondWith promise resolved with an object that could not be serialized to JSON
6134896  The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result
1244936  No submit button was found, but for a form without `toolautosubmit`, there must be a submit button
4499149,6606521 toolactivated   4499147 ontoolactivated   1475172,4500609 toolcancel   1475170 ontoolcancel
1476973,1705885 toolchange      1705883 ontoolchange     6606903 toolname     6606912 toolparamdescription
1244988,1707435 toolautosubmit
```
Crash-key/mojom enum names for the declarative/script-tool result path (never seen on the wire):
`kScriptToolInvocationFailed` 4157640, `kScriptToolNoResponse` 3924341, `kScriptToolCancelled` 5547099,
`kScriptToolInvalidInputArguments` 2773779, `kScriptToolCrossOriginNavigation` 1365791,
`kScriptToolNavigationDidNotCommit` 1365824, `kScriptToolNavigationFailedLoad` 2062311,
`kScriptToolNavigationCommittedErrorPage` 662617, `kScriptToolMissingRequiredSubmitButton` 3002486.

**Absent from this build** (whole-file byte search, count 0 in ELF and all `.pak`): `requestUserInteraction`,
`userInteraction`, `InvocationStatus`, `ModelContextTesting`/`modelContextTesting`. Type/enum *names* from
`/json/protocol` (e.g. `InvocationStatus`) are not plain rodata at all — the 1.57 MB protocol document is served
from a compressed resource (only 32 `WebMCP` occurrences exist in the whole ELF; r16's `protocol-domain.json`
is the authority for type names). Do not infer absence of a protocol feature from a missing type-name string.

## Observed CDP decoding (probe2/probe3, verbatim)

| action | observed response / event |
|---|---|
| invokeTool before `WebMCP.enable` | `-32000 "WebMCP domain is not enabled"`, no events |
| unknown toolName | `-32602 "Tool not found"`, no events |
| empty toolName `""` | `-32602 "Tool not found"` |
| bogus frameId `DEADBEEF` | `-32602 "No frame for given id found"` |
| `input: 5` (non-object) | `-32602 "Invalid parameters"`, `data:"Failed to deserialize params.input - CBOR: map start expected at position 68"` (protocol layer, not rodata) |
| successful invoke | `{invocationId}` then `toolInvoked{input:"{\"a\":1}"}` (JSON **string**) then `toolResponded{status:"Completed", output:<any>}` |
| execute throws | `toolResponded{status:"Error", errorText:"", exception:{className:"Error",description:"Error: boom-throw …"}}`; console `WebMCP tool execution failed: Uncaught Error: boom-throw` |
| execute rejects | same shape, `status:"Error"`, `errorText:""`, description `Error: boom-reject` |
| input violates inputSchema (missing required) | **no error**: `status:"Completed"`, tool received `undefined` (`"echo:undefined"`) — schema is registration metadata only |
| cancel bogus id | `-32602 "Invalid invocation id"` |
| cancel completed id | `-32602 "No pending execution for invocation id"` |
| cancel pending | `{}` + `toolResponded{status:"Canceled", errorText:""}` |
| after abort-signal unregister | `toolsRemoved`, then `-32602 "Tool not found"` |
| iframe tool, iframe frameId | normal `Completed`; same tool + main frameId → `-32602 "Tool not found"` |
| concurrent invokes | independent ids, both `Completed` |
| navigate while pending (same- and cross-origin) | no `toolResponded` within 6 s; `toolsAdded` re-announced for the new document |

## Which strings predict which C2 case

- `invoke-imperative-success` → `Completed` (22677735); `toolInvoked.input` is a JSON string, `output` any JSON.
- `invoke-imperative-throws` / `-rejects` → `Error` (22677754), `errorText` **empty**, evidence in `exception`;
  console prefix `WebMCP tool execution failed: ` (3335431). `Tool was executed but the invocation failed…` (1699422) was never emitted.
- `invoke-unknown-tool` / `invoke-after-unregister` / flags-off → CDP `-32602 "Tool not found"` (6706998). The
  renderer's `Tool not found: ` (5190104) is an in-page `executeTool` error, not the CDP message.
- `invoke-input-schema-mismatch` → **no error string applies**; predicate must be `status:"Completed"` with the tool
  observing missing fields. `JSON input arguments must be an object` (4031972) belongs to in-page `executeTool`, not CDP.
- `invoke-declarative-form` → `toolInvoked` only; no `toolResponded` and no page `submit`/`toolactivated` dispatch
  observed after CDP `invokeTool` (probe3, 6 s, three listener types per form). Do not predicate on a response.
- `invoke-iframe-frameid` → works with the iframe `frameId`; main-frame `frameId` gives `Tool not found`.
- `invoke-flags-off-control` → page has no `document.modelContext` (r16 receipt `flags-off-negative-control`);
  my unflagged probe observed `WebMCP.enable → {}` and `invokeTool → -32602 "Tool not found"`.
- `invoke-navigation-pending` → no terminal event; predicate on absence + re-`toolsAdded`.
- `invoke-concurrent-ids` → two ids, two `Completed` (order: invoked/responded interleaved per invocation).

## Divergences / inference

- **Divergence (observed):** the `agentInvoked`/`respondWith` strings form no reachable CDP path: the M154 form
  prototype has no `ontoolactivated`/`ontoolcancel`, and CDP declarative invocation never dispatched `submit` or
  `toolactivated` to capture listeners. `respondWith` behaviour in this build is unproven; never cite it as observed.
- `FrameId does not belong to current target` (7635001) and `Cannot return tool results after a cross-origin navigation`
  (875106) are [INFERENCE] predicates (cross-target frameId; result-after-nav); neither was triggered above.
- Process split [INFERENCE]: the 0x5823ff3…0x5824dd5 cluster also references `ProcessReadyInBrowser`,
  `FrameCommittedInBrowser`, `FrameDeletedInBrowser`, i.e. content/browser DevTools; the 0xf87e2xx cluster that
  validates invocation ids and maps `Completed/Canceled/Error` is the invocation bookkeeping that the CDP handler
  forwards. Static evidence is the shared code cluster, not a symbol table (binary is stripped).

## Limits

- One build, one host (2026-10-20); flags on; loopback page-level only; temp profile/HOME, SIGKILLed + removed; no MCP client, no real site, no user profile.
- `strings -n 6` cannot see strings inside the compressed `/json/protocol` resource; type names come from r16's
  `/json/protocol` capture, not from offsets here.
- Any offset here is build-specific; re-derive (`grep -boa`) after a chromium package change.

Files written: .ufo/waves/round-17/w1/RevBinaryInvoke.md
