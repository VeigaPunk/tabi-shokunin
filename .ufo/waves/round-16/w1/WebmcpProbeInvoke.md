# WebmcpProbeInvoke — round-16 wave-1 report (author-side advice)

**Seat:** `TabiR16.WebmcpProbeInvoke-5` · **Date:** 2026-10-20
**Owned files:** `.ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs`, `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json`

## Answer

**A tool-invocation path exists: `WebMCP.invokeTool` (CDP command).**
Source of truth: the `WebMCP` domain in the running browser's own `/json/protocol` (experimental,
`dependencies: [Runtime, Page, DOM]`, in Chromium 154's tip-of-tree protocol). Exact parameters,
read live from the domain schema: `invokeTool(frameId: Page.FrameId, toolName: string,
input: object) → { invocationId: string }` — the input parameter name is **`input`**, not
`inputArguments` (the blink-side token `inputArguments` belongs to the page IDL, not the CDP
command). Companion command `cancelInvocation(invocationId)` exists (declared, not exercised).
Events: `toolsAdded`, `toolsRemoved`, `toolInvoked`, `toolResponded` (types: `Tool`,
`RemovedTool`, `Annotation`, `InvocationStatus ∈ {Completed, Canceled, Error}`).

**No in-page testing API.** `'modelContextTesting' in document` and `'modelContextTesting' in
navigator` are both `false` on the flagged loopback origin; no `WebMCPTesting` window interface is
exposed (window keys matching /modelcontext|webmcp/i: only `ModelContext`, `WebMCPEvent`). The
`WebMCPTesting` blink feature flag does not surface a page-visible object here.

**Secondary in-page path: `document.modelContext.executeTool` works.** Proto props on
`ModelContext`: `ontoolchange, executeTool, getTools, registerTool`. Signature (confirmed by
iterative TypeErrors and a critic cross-check against chromium `model_context.idl`):
`executeTool(RegisteredTool tool, DOMString inputArguments)` — the `RegisteredTool` descriptor
requires `name`, `origin`, `description`, **and `window`**, and `inputArguments` is a **required
JSON string**, not an object (object input → `UnknownError: Failed to parse input arguments`;
one argument → "2 arguments required"). Observed working call this run:
`mc.executeTool({name:'echo', origin:location.origin, description:'…', window:window},
 JSON.stringify({text:'inpage-execute'}))` → `'echo:inpage-execute'` (recorded as
`inPageExecuteTool.jsonStringInput` / `.objectInput` in the JSON). Correction credited to
`TabiR16.CriticSourced-5` (CE1). Other surface facts: `registerTool` returns `undefined`;
`getTools()` serializes to `{}` from `Runtime.evaluate` (RegisteredTool values are
non-enumerable — a serialization artifact, not an empty registry).

## Exercised invocation (loopback only, read-only echo)

Fixture served on `127.0.0.1` (embedded in the probe; fresh `mkdtemp` profile; only the
fixture's own `echo` tool — a pure string transform — was ever invoked).

1. `document.modelContext.registerTool({name:'echo', …, execute: async i => 'echo:'+i.text})`
   → `WebMCP.toolsAdded` with name/description/inputSchema verbatim, `frameId` =
   `Page.navigate` frameId, plus a registration `stackTrace`.
2. `WebMCP.invokeTool{frameId, toolName:'echo', input:{text:'round16-invoke-probe'}}`
   → result `{invocationId:'…'}` (returned **before** the events).
3. `WebMCP.toolInvoked` `{toolName:'echo', frameId, invocationId, input:'{"text":"round16-invoke-probe"}'}`
   — note `input` is a **JSON string**, not an object.
4. `WebMCP.toolResponded` `{invocationId, status:'Completed', output:'echo:round16-invoke-probe'}`
   — `output` is `type:any`, delivered verbatim from the tool's execute return (string here).
5. Error paths (all still against only the echo tool):
   - `toolName:'no-such-tool'` → protocol error `{code:-32602, message:'Tool not found'}`
     (no `toolInvoked`/`toolResponded`).
   - `input:{}` (missing required `text`) → **not rejected**: `toolResponded`
     `{status:'Completed', output:'echo:undefined'}` — no renderer-side inputSchema
     validation was observed at the invoke boundary for imperative tools; the tool's own
     JS ran and produced `undefined` input.
   - `invokeTool` on a second page-session WebSocket where `WebMCP.enable` was never called
     (enablement is per-session) → protocol error `{code:-32000, message:'WebMCP domain is
     not enabled'}` — matches the binary string at .rodata `0x3b95c0` reported by
     `TabiR16.RevengeBinary-5`.

Result shape: command → `{invocationId}`; completion arrives only via `toolResponded`
(`status` + `output`/`errorText`/`exception`), correlated by `invocationId`.
(Exact `invocationId`/frameId values per run are in the JSON.)

## Runtime / flags (measured this run)

- `/usr/bin/chromium` = `Chrome/154.0.8037.97` (sha256 `eaed39c3…833a172b`), Node v24.21.0,
  `--headless`, flags `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
  --enable-blink-features=WebMCP,WebMCPTesting`.
- `document.modelContext` is **not** exposed on `about:blank` even with flags (`'modelContext' in
  document` false); it appears only after navigating to an http(s) origin — loopback
  `http://127.0.0.1:<port>` worked. `navigator.modelContext` absent everywhere.
- Cross-seat note (CriticSourced, sourced finding — not re-opened here): `WebMCP.enable`
  returning `{}` flag-off is consistent with `kDevToolsWebMCPSupport` being enabled by
  default in 154 (`features.cc:571`); the flag-off control is "page surface off", not
  "CDP domain off". Where Arch's Chromium differs from the upstream 154 tag is unverified;
  observed behavior here matched the tag.
- No dependencies, no Playwright: raw CDP over `DevToolsActivePort` + global `WebSocket` (Node 24).

## Verdict (JSON `verdict` block)

`invocationPathExists: true` · path `WebMCP.invokeTool` · `echoInvoked: true` ·
`echoOutput: 'echo:round16-invoke-probe'` · `testingApiPresent: false`.
(The in-page `executeTool` path also works — JSON-string input required — but the CDP
`invokeTool` command is the cleaner agent-facing path: no page-side scaffolding needed.)

## Reproduce

```
node .ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs
# stdout: WEBMCP_INVOKE_PROBE verdict=path-exists echo=echo:round16-invoke-probe out=.../WebmcpProbeInvoke.json
```

Observed stdout this run (exit 0):
`WEBMCP_INVOKE_PROBE verdict=path-exists echo=echo:round16-invoke-probe out=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/probes/WebmcpProbeInvoke.json`

## Implications for WebmcpHarness (advisory)

- `invokeTool` needs the **frameId from `Page.navigate`** (matches the `frameId` in `toolsAdded`);
  a CDP-driven invocation lane is directly feasible.
- Response is event-based: wait for `toolResponded` matching `invocationId`; the command result
  alone does not carry tool output. `output` is `any` and untrusted per its own description.
- Do **not** rely on inputSchema enforcement at the CDP boundary: `input:{}` against
  `required:['text']` completed with `output:'echo:undefined'`.
- `WebMCP.enable` is required **per CDP session** before `invokeTool` (else `-32000 "WebMCP
  domain is not enabled"`); a second session to the same target does not inherit enablement.
- Cancel path is declared (`cancelInvocation`); exercising it against a pending invocation is
  open (echo completes too fast to cancel deterministically — would need a slow fixture tool).
- Testing-API lane (`modelContextTesting`) is **closed** on this build despite `WebMCPTesting` flag.
- If an in-page lane is wanted instead, `executeTool` requires the full `RegisteredTool`
  descriptor incl. `window` and a **JSON-string** `inputArguments` (object input fails with
  `UnknownError: Failed to parse input arguments` — corroborates CriticSourced CE1).
- Binary-evidence cross-check (RevengeBinary-5, strings-only): `WebMCP.invokeTool`,
  `toolInvoked`, `toolResponded`, `cancelInvocation` tokens and the "WebMCP domain is not
  enabled" error string all corroborate this runtime result; renderer-side status strings
  (e.g. "Tool was not executed due to invalid input arguments") were **not** observed here
  for the imperative path — see the invalid-input finding above.

## Limits / non-claims

- Loopback only; no real site, no user's profile, nothing outside the fixture was invoked.
- `cancelInvocation`, `toolsRemoved`, declarative-form invocation, and annotation fields were
  declared-but-not-exercised or out of scope here.
- Whether `executeTool` emits `toolInvoked`/`toolResponded` on the CDP stream was not captured
  (WebMCP was not enabled during that particular sub-probe); the events were observed for the
  `invokeTool` path.
- Status `Canceled`/`Error` and `errorText`/`exception` fields of `toolResponded` were not
  exercised.

## Files changed / evidence retained

- `.ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs` — probe (producerSha256
  `34bcb776…ad9ac6d` after CE1 fix + error-path probes).
- `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` — full capture incl. verbatim WebMCP
  protocol domain (`protocolDomain`), all events, surface checks, three error paths, both
  `executeTool` input encodings.
- No tools installed/upgraded this seat (pacman pause honored; none needed). No sources opened —
  all facts are first-party runtime observations (browser's own `/json/protocol` + live CDP);
  IDL/binary details arrived via CriticSourced CE1 and RevengeBinary leads, not in-seat opens.

## Risks / blockers

None. Risk noted for the harness: `modelContextTesting` absence means any test plan relying on a
WebMCP testing object must route through `WebMCP.invokeTool` (or in-page `executeTool` with the
full descriptor + string input).
