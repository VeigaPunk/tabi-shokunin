# WebmcpFixtures — wave 1 report (2026-10-20)

Scope: `corpus/evidence/round-16/webmcp/fixtures/` only. All files written;
every expected observation verified live on the host browser (loopback
127.0.0.1, fresh temp Playwright profile, `/usr/bin/chromium` 154.0.8037.97,
Playwright 1.64.0 global npm, Node v24.21.0). No installs needed.

## Files → expected observation (verified)

| File | Expected observation |
|---|---|
| `declarative-form.html` | `toolsAdded` `search`/`Search`; schema `properties`: `q` `{type:"string",description:"Query text"}`, `category` `{type:"string",description:"Category filter"}`, `sort` `{type:"string",anyOf:[{const,title}…],enum:["relevance","date"],description:"Sort order"}`; `required:["category"]`. No `Audits.issueAdded`. Verified verbatim. |
| `declarative-missing-name.html` | No `toolsAdded`, no `Audits.issueAdded` observed for the toolname-less form. Verified: events `[]`. |
| `imperative.html` | DOM `modelContext-typeof=object`, `register=resolved result-typeof=undefined`; `toolsAdded` `echo` with `required:["q"]`. Verified. |
| `lifecycle.html` | `toolsAdded` `volatile` + `transient`; `removeForm`→`toolsRemoved[transient]`; `abortRegistration`→`toolsRemoved[volatile]`; `getTools()`→`[]` after both. Verified end-to-end. |
| `plain.html` | No events; `document.modelContext` present; `getTools()`→`[]`. Verified. |
| `frame-parent.html` | `toolsAdded` `childSearch` attributed to the child `frameId` (parent declares nothing). Verified. |
| `frame-child.html` | Declarative `childSearch` (`q`); standalone-loadable. |
| `README.md` | Fixture index, driving contract, verified-schema table. |

## Driving contract (coordinated with TabiR16.WebmcpHarness-5)

Every fixture sets `window.__webmcpFixture = {id, expectedTools, actions,
actionOrder, expectedRemoved}`. Harness confirmed all filenames.
`declarative-form.html` uses the PLAN example (`toolname="search"
tooldescription="Search"`, input `q`) plus required `category` and `sort`
select for schema-derivation coverage.

## New evidence for C2 notes (probed this session)

- `document.modelContext` = `ModelContext` EventTarget: `registerTool`,
  `getTools`, `executeTool`, `ontoolchange`. `navigator.modelContext` undefined.
- `registerTool(tool, options?)` returns a Promise resolving `undefined`.
  **Unregistering requires `{signal}` as the SECOND argument** — verified:
  2nd-arg signal + `abort()` → `toolsRemoved` + tool gone from `getTools()`;
  same signal inside the tool dict → silently dropped (WebIDL), `abort()` no-op.
  Caught by CriticC2; both positions probed.
- `getTools()` returns plain objects `{name,description,inputSchema,origin,
  title,window}` — no unregister methods.
- Declarative schema derivation: control `name`→property key; `required`
  attr→`required[]`; `toolparamdescription`→property `description` (falls back
  to label text); `<select>`→`{type:"string", anyOf:[{const,title}…], enum:[…]}`.
- Imperative `inputSchema` is echoed verbatim; call-site per-property
  `description` fields are NOT present unless authored.
- `toolsRemoved` payload: `{tools:[{name, frameId}]}`.
- Form-associated custom elements (`WebMCPFormAssociatedCustomElements` flag)
  registered no tool — probed, zero events.
- Malformed declarative form (tooldescription, no toolname): zero events AND
  zero `Audits.issueAdded` on this build.

## Risks / blockers

- None. CriticC2 defect (signal position) fixed and re-verified; harness
  re-notified with final contract.
- Probe scripts lived in `/tmp/webmcp-probe/` (throwaway, not committed).
- No tooling installs performed or needed.

Report: .ufo/waves/round-16/w1/WebmcpFixtures.md
