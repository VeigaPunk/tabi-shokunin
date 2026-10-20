# webmcp fixtures — round 16

Static loopback fixtures for `scripts/webmcp-loopback-round16.mjs` (owner:
TabiR16.WebmcpHarness). Serve this directory on `127.0.0.1`; no external URLs,
no network-loaded scripts. Chromium is launched with
`--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
--enable-blink-features=WebMCP,WebMCPTesting`.

API surface observed on this host (Chromium 154.0.8037.97, `/usr/bin/chromium`,
probed 2026-10-20): `document.modelContext` is a `ModelContext` EventTarget
exposing `registerTool(tool, options?) -> Promise` (resolves `undefined`),
`getTools()` -> Promise of plain objects `{name, description, inputSchema,
origin, title, window}`, `executeTool`, `ontoolchange`; `navigator.modelContext`
is undefined. **Unregistering requires `registerTool(tool, {signal})` — the
signal MUST be the second argument** (WebIDL drops it inside the tool dict;
verified: 2nd-arg signal + `abort()` → `toolsRemoved`, dict-position signal +
`abort()` → nothing).

## Driving contract

Every fixture sets `window.__webmcpFixture` (agreed with TabiR16.WebmcpHarness):

```js
{
  id: '<fixture name>',
  expectedTools: [ { name, description, inputSchema, frame? } ],
  actions: { <stepName>: async () => { ... } },   // optional
  actionOrder: [ '<stepName>', ... ],             // order harness calls them
  expectedRemoved: [ '<toolName>', ... ]          // lifecycle only
}
```

The harness may additionally derive expected values for `declarative-form.html`
from the served bytes (`toolname`/`tooldescription`/control `name=`).

| Fixture | Expected observation (verified 2026-10-20) |
|---|---|
| `declarative-form.html` | `toolsAdded` `search`/`Search`; schema properties: `q` `{type:"string",description:"Query text"}`, `category` `{type:"string",description:"Category filter"}`, `sort` `{type:"string",anyOf:[{const,title}…],enum:["relevance","date"],description:"Sort order"}`; `required:["category"]`. `toolparamdescription` overrides the label text as property `description`. |
| `declarative-missing-name.html` | No `toolsAdded` and no `Audits.issueAdded` observed for the toolname-less form (`FormModelContextMissingToolName` path). `expectedTools` empty. |
| `imperative.html` | `#mc-status`=`modelContext-typeof=object`; `#register-status`=`register=resolved result-typeof=undefined`; `toolsAdded` `echo`, `required:["q"]`. Guard records typeof and clears `expectedTools` when absent. Note: call-site `description` fields inside `inputSchema.properties` are NOT echoed back on the imperative path. |
| `lifecycle.html` | `toolsAdded` for `volatile` (imperative, 2nd-arg signal) and `transient` (declarative). Actions: `removeForm`→`toolsRemoved(transient)`; `abortRegistration`→`toolsRemoved(volatile)`. `expectedRemoved=[transient,volatile]`; `getTools()` → `[]` after both actions. |
| `plain.html` | No `toolsAdded`/`toolsRemoved`; `document.modelContext` present; `getTools()` → `[]`. |
| `frame-parent.html` | Parent declares no tools; `toolsAdded` `childSearch` with the child frame's `frameId`. `expectedTools[0].frame='child'` marks attribution. |
| `frame-child.html` | Declarative `childSearch` (`q` with `toolparamdescription`-style description absent; label text used). Directly loaded it behaves like a single-input declarative form. |

Negative control (harness-owned): load `declarative-form.html` or `plain.html`
without the flags — `document.modelContext` undefined (`imperative.html` would
record `modelContext-typeof=undefined`), `WebMCP.enable` still returns `{}`,
no events.
