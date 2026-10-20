# WebmcpProbeImperative — round 16 wave 1 probe report

Seat: `TabiR16.WebmcpProbeImperative-5`. Owned files:
`.ufo/waves/round-16/probes/WebmcpProbeImperative.mjs` + `.ufo/waves/round-16/probes/WebmcpProbeImperative.json`
(schema `tabi-round16-webmcp-probe-imperative-v1`).

Run: `node .ufo/waves/round-16/probes/WebmcpProbeImperative.mjs` →
`WEBMCP_PROBE_IMPERATIVE {"calls":31,"events":7,"toolsAdded":6,"toolsRemoved":1}` (~11 s).

## Runtime (observed, recorded in JSON `runtime`)

- `/usr/bin/chromium` `Chromium 154.0.8037.97 Arch Linux`, sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`
- Playwright `1.64.0` (global npm root via `createRequire`), Node `v24.21.0`
- Flags: `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting`
- Loopback `http://127.0.0.1:<ephemeral>/` served by the probe itself (no fixture dependency); all non-loopback requests aborted; fresh ephemeral Playwright profile.
- `WebMCP.enable` → `{}`; `Audits.enable` → `{}`.

## document.modelContext surface (observed)

- `document.modelContext` exists (typeof `object`, constructor `ModelContext`, extends `EventTarget`). `document` does **not** have it as own property — accessor on Document prototype. `'modelContext' in navigator` → **false** (navigatorModelContext recorded `false`).
- `ModelContext` own prototype members: `registerTool` (arity 1, writable function), `getTools` (arity 0), `executeTool` (arity 2), `ontoolchange` (enumerable accessor, getter+setter). Plus `Symbol.toStringTag`.
- **Absent members** (all `typeof undefined`, all throw "is not a function"): `provideContext`, `unregisterTool`, `clearContext`, `unregisterAllTools`, `removeTool`. Imperative unregister is via AbortSignal (below), not a method.
- `ownKeys` on the instance: `[]` (empty object, everything on prototype).

## Calls observed (JSON `calls[]`, 31 entries)

### registerTool — `registerTool(ModelContextTool tool, optional options?)`

Canonical valid call:
```js
document.modelContext.registerTool({
  name: 'probe_echo', description: 'Echo the supplied text',
  inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  execute: async (args) => ({ content: [{ type: 'text', text: String(args.text) }] })
});
```
- **Returns a `Promise` that resolves `undefined`** (`rawIsPromise: true`, `rawType: 'object'` — recorded for every successful registration). No handle object; registration IS the commitment; unregister is signal-based.
- Valid registration → one `WebMCP.toolsAdded` CDP event. Params: `{tools:[{name, description, inputSchema (as object), frameId, stackTrace:{callFrames}}]}` — stackTrace points at the registering script.
- `annotations: { readOnlyHint: true }` accepted; event reports translated `annotations:{readOnly:true, untrustedContent:false, consequential:false}`.
- Errors (all thrown synchronously):
  - missing `name` → `TypeError` "Failed to read the 'name' property from 'ModelContextTool': Required member is undefined."
  - missing `description` → same TypeError shape for `'description'`
  - missing `execute` → same TypeError shape for `'execute'`
  - `inputSchema` non-object (`'not-an-object'` or `null`) → `TypeError` "Failed to read the 'inputSchema' property from 'ModelContextTool': Failed to convert value to 'object'."
  - duplicate `name` → `DOMException` **InvalidStateError** "Duplicate tool name" (code 11)
  - no args → `TypeError` "1 argument required, but only 0 present."
  - string arg → `TypeError` "The provided value is not of type 'ModelContextTool'."
- **`inputSchema.type:'bogus'` is ACCEPTED** — registers fine, fires toolsAdded, no schema validation of `type` value. (Also `inputSchema` is re-serialized as a **JSON string** on getTools output — see below.)

### Removal — AbortSignal in second argument

- `registerTool(tool, { signal })` then `controller.abort()` → **`WebMCP.toolsRemoved`** `{tools:[{name:'probe_signal_opt', frameId}]}` (no description/schema in removal payload). Tool dropped from getTools.
- `signal` **inside** the tool dict (`{...tool, signal}`) is silently ignored: abort fires nothing, tool remains registered.
- `getTools`/`finalToolNames` after opt-signal abort: `probe_signal_opt` gone; `probe_signal_dict` still present (still abortable? — its controller was aborted too but since dict-signal isn't wired, no removal happened; the tool persists).

### getTools
- Returns a **Promise** resolving to an Array of plain `Object`s (constructor `Object`, `Symbol.toStringTag` `[object Promise]` on the raw return). Entries' own keys: `description, inputSchema, name, origin, title, window`.
  - `inputSchema` is a **JSON string** (e.g. `'{"type":"bogus"}'`), not an object.
  - `origin` = page origin (`http://127.0.0.1:<port>`), `title` = `""`, `window` = object (Window proxy — not serializable across evaluate boundary), **`execute` is absent** (cannot re-call via the returned object directly).
- These plain objects ARE accepted by `executeTool` as the `RegisteredTool` argument.

### executeTool — `executeTool(RegisteredTool tool, DOMString inputJson)`

- Arg 1 must be a `RegisteredTool` **object** (one returned by `getTools()`); passing the tool **name string** → `TypeError` "The provided value is not of type 'RegisteredTool'." Arity 2 required.
- Arg 2 must be a **JSON string**: `executeTool(tool, '{"text":"via-json-string"}')` → executes the tool's `execute`, resolves to a **JSON string** of the result: `'{"content":[{"type":"text","text":"via-json-string"}]}'`.
- Passing an object as arg 2 → `DOMException` **UnknownError** "Failed to parse input arguments" (code 0). Same error for malformed JSON string `'not json at all'`.
- `'{}'` against `required:['text']` → still executes, `args.text` `undefined` — **no JSON-schema input validation on execute** (consistent with `type:'bogus'` acceptance).
- Wrong-field object input also UnknownError.

### toolchange / when

- `addEventListener('toolchange', cb)` and `ontoolchange` setter both work; the event fires **asynchronously** after registerTool (captured 8 late events: registrations 4 + removals? — recorded verbatim in `tcEventsLate`; each is a plain trusted `Event` type `toolchange`, `bubbles:false, cancelable:false, composed:false`, `eventPhase` 2). **No `WebMCP` payload fields** — consumers call `getTools()` to diff.
- `modelContext.when('toolchange')` (new EventTarget.when) resolves to the event object.
- Note: `captured:[]` inside the registering evaluate — dispatch is a task, not synchronous.

## CDP events

7 total: 6 `WebMCP.toolsAdded`, 1 `WebMCP.toolsRemoved`. No `Audits.issueAdded`. Added payloads carry `inputSchema` as object + `frameId` + `stackTrace`; removed payload carries only `{name, frameId}`.

## Divergences vs common spec shape (for the knowledge note)

- Lives on `document.modelContext` (not `navigator.modelContext`).
- No `provideContext`/`clearContext` — this build's ModelContext is tools-only.
- Removal is `registerTool(tool, {signal})` + abort; **no** `unregisterTool` and no returned registration handle.
- `getTools` → Promise of plain objects with `inputSchema` as JSON string and a `window` member; `executeTool` wants `(RegisteredTool, JSON-string)` and returns a JSON string.
- `toolchange` is a bare `Event` (no tool list in the event).
- Schema `type` values and execute-time inputs are NOT validated against inputSchema.

## Limits

Loopback origin only, headless, this build (154.0.8037.97) with these exact flags. No real site, no agent-integration claim. `execute` callback invocation was exercised via `executeTool` only (no agent/frontend cross-check).

## Tooling

No installs; all components pre-installed. Not sent to other agents' files; harness/fixtures seats were messaged with the canonical call shapes.
