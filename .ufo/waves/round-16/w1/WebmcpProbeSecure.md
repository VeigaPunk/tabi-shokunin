# WebmcpProbeSecure — round 16 wave 1 report

Seat: `TabiR16.WebmcpProbeSecure-5` (leaf, no delegation used).
Scope: secure-context × WebMCP exposure/CDP observation matrix on Chromium 154 with the PLAN flags.
Artifacts (owned): `.ufo/waves/round-16/probes/WebmcpProbeSecure.mjs`, `.ufo/waves/round-16/probes/WebmcpProbeSecure.json`.

## Run

- Command: `node .ufo/waves/round-16/probes/WebmcpProbeSecure.mjs` (default output = sibling `.json`; atomic tmp+rename write).
- Environment (pinned into JSON `runtime`): Chromium 154.0.8037.97 Arch Linux (`/usr/bin/chromium`, sha256 recorded), Playwright 1.64.0 (global npm `playwright` package), Node v24.21.0.
- Flags (PLAN set): `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`, `--enable-blink-features=WebMCP,WebMCPTesting`, plus `--host-resolver-rules=MAP tabi.test 127.0.0.1` so the non-loopback alias never leaves loopback.
- Server: `node:http` on `127.0.0.1:0` serving only `/frame.html`; the alias connects to the same listener in-process. Exit 0, 7 cases, ~10.5 s wall.

## Secure-context rule actually observed

`isSecureContext` follows the **potentially-trustworthy-URL rule inherited through the browsing-context tree**, not the URL's own scheme string:

| Case | URL surface | `isSecureContext` | `window.origin` | `typeof document.modelContext` | `toolsAdded` events |
|---|---|---|---|---|---|
| `http_loopback_ip` | `http://127.0.0.1:<port>` | true | `http://127.0.0.1:<port>` | `object` | 2 (decl `frame_tool` + imp `imp_ping`) |
| `http_localhost` | `http://localhost:<port>` | true | `http://localhost:<port>` | `object` | 2 |
| `http_alias_tabi_test` | `http://tabi.test:<port>` → 127.0.0.1 | **false** | `http://tabi.test:<port>` | **`undefined`** | **0** |
| `data_url` | `data:text/html,...` | **false** | `null` | **`undefined`** | **1** (decl `decl_search`) |
| `about_blank` | `about:blank` (+ `setContent`) | **false** | `null` | **`undefined`** | **1** (decl `decl_search`) |
| `sandbox_iframe_opaque` | `sandbox="allow-scripts"` iframe on loopback parent | **true** | `null` | `object` | **0** |
| `sandbox_iframe_same_origin` | `sandbox="allow-scripts allow-same-origin"` | true | `http://127.0.0.1:<port>` | `object` | 2 |

Concretely: loopback IP and `localhost` are secure; a **non-loopback DNS name mapped to 127.0.0.1 by `--host-resolver-rules` is NOT secure** (the trustworthy-URL check is lexical on the host, not on the resolved address — the "secure tunnel" carve-out only covers `localhost`/`*.localhost` and IP literals). `data:` and `about:blank` standalone documents are insecure (opaque origin). A **`sandbox="allow-scripts"` iframe keeps `isSecureContext=true` even though `window.origin` is `null`** — secure-context is inherited from the parent browsing context, not recomputed from the sandboxed opaque origin.

## WebMCP observations (beyond the mapping)

- `document.modelContext` exposure is gated by `[SecureContext]`: `object` exactly where `isSecureContext` is true, `undefined` elsewhere. `'modelContext' in navigator` is `false` in every context — confirms PLAN's finding that the API hangs off `document`, not `navigator`.
- **`WebMCP.toolsAdded` is NOT gated the same way**: declarative `<form toolname tooldescription>` inside insecure `data:` and `about:blank` documents still produced a well-formed `toolsAdded` event (`{tools:[{name,description,inputSchema:{type:"object",properties:{q:{type:"string"}},required:[]},frameId,backendNodeId}]}`) even though `document.modelContext` is undefined there. The CDP event stream reports declarative registration without a secure-context check — an observed spec/intent divergence worth flagging in the note (declarative registration bypasses the API's secure-context gate at the protocol layer).
- Sandboxed iframe (opaque origin, `allow-scripts` only): `document.modelContext` is present (`isSecureContext` inherited) but `registerTool` throws **`NotAllowedError: Access to the feature "tools" is disallowed by permissions policy`** and the declarative form emits no event — WebMCP is also gated by a `tools` permissions policy, which a sandboxed-without-`allow-same-origin` frame fails. `allow-same-origin` restores both paths (2 events).
- Imperative registration works on secure surfaces: `document.modelContext.registerTool({name,description,inputSchema,execute})` returns a promise, resolves cleanly, and emits a second `toolsAdded` carrying a `stackTrace` block (declarative events carry `backendNodeId` instead).
- `WebMCP.enable` returned `{}` on every page session including insecure/opaque-origin pages — domain availability is flag-gated, not context-gated.

## Falsifier value for the harness (WebmcpHarness-5)

1. Positive controls must use `127.0.0.1`/`localhost`; asserting "secure context ⇒ API" needs the alias negative (`tabi.test`: secure=false, API absent, zero events).
2. A `toolsAdded`-on-`data:` case would show the event stream is observable even where the DOM API is not — do not assume "no `modelContext` ⇒ no events".
3. Sandboxed-iframe case exposes the second gate (permissions policy `tools`), with the exact `NotAllowedError` string as an assertion anchor.

## Risks / limits

- Loopback only; `tabi.test` resolution was pinned in-process by `--host-resolver-rules` — no real DNS was touched.
- Single run, single build (154.0.8037.97); events reflect the `WebMCPTesting`/`DeclarativeWebmcp` flag set and may differ unflagged (flag-off negative control belongs to WebmcpHarness).
- `toolsAdded` on `data:`/`about:blank` is an observation, not a spec claim — flag for S020 row when the note is drafted.
- No installs performed; host pacman pause respected, no tooling changes needed.
