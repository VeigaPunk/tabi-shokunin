source: S020
source: S030
source: S031
source: S032
source: S033
source: S034
source: S035
source: S036
verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)
recheck: on chromium package change; S020/S032 on-release

# Native WebMCP on Chromium 154 — loopback CDP observation (round 16)

**Locally measured: yes, for one build, flag-enabled, loopback fixtures only.**
Receipt: `corpus/evidence/round-16/webmcp/receipt.json` (schema `tabi-round16-webmcp-v1`,
11/11 cases pass), produced by `scripts/webmcp-loopback-round16.mjs`. The first L1 run
failed 3/11 cases and is retained unchanged as
`corpus/evidence/round-16/webmcp/receipt-first-run-failed.json` (see §Corrections).

This note supersedes, for Chromium 154 only, the round-3/kaika frontier statement
"Native WebMCP in chromium 152 — unprobed (census U3)" (`corpus/README.md:35`, `:181`;
`knowledge/browser-surface-census.md:188`). It does not certify Chromium 152, which stays
unprobed at runtime. The census guess "not `navigator.modelContext`" was an unsourced
hypothesis: the current spec puts the attribute on `Document` (S020 §4.1), so
`document.modelContext` is spec-aligned, not a divergence.

## Scope and runtime identity

| Item | Value | Evidence |
|---|---|---|
| Browser | Chromium `154.0.8037.97` (Arch package `154.0.8037.97-1`); CDP `Browser.getVersion` product `Chrome/154.0.8037.97` | `corpus/evidence/round-16/webmcp/runtime-pin.json`; receipt `.runtime.observed` |
| Launch path vs engine | `/usr/bin/chromium` is a 14 KB launcher (sha256 `eaed39c3…a172b`, hashed by the receipt) that execs `/usr/lib/chromium/chromium` (sha256 `95b17db7…b330a`, pinned by runtime-pin). Both are recorded; they are different files | runtime-pin.json; receipt |
| Host flag file | The launcher reads `~/.config/chromium-flags.conf`; the harness redirects `HOME`/`XDG_CONFIG_HOME` to a temp dir per launch so that file is not applied | harness header; receipt `.safety` |
| Driver | Playwright `1.64.0` (global npm root), Node `24.21.0` | receipt `.runtime.observed` |
| Origin | `http://127.0.0.1:<ephemeral>`; every other request aborted; 0 external requests recorded | receipt `.loopback` |
| Flags (receipt run) | `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting` | receipt `.flags` |

Minimal flag set (probe, not receipt): any one of `--enable-blink-features=WebMCP`,
`--enable-features=WebMCP`, `--enable-experimental-web-platform-features` exposes
`document.modelContext` and the CDP event stream on this build
(`.ufo/waves/round-16/probes/WebmcpProbeFlags.json`, 11 launch variants). Source agrees:
at the 154 tag, `WebMCP` is `experimental`, follows `base_feature_status: "enabled"` only when
overridden, and is `implied_by` `WebMCPTesting` (S034, lines 7023-7035); there is no
`DeclarativeWebmcp` runtime feature at 154 (that token is inert here; main later added
`DeclarativeWebMCP`). `DevToolsWebMCPSupport` is enabled by default at 154 (Chromium
`blink/common/features.cc:571`, read by seat SrcChromiumFlags; not a SOURCES row).

## What the receipt observed (11 cases, Chromium 154, loopback)

| Case | Observation |
|---|---|
| flags-off-negative-control | No WebMCP feature flag: no `document.modelContext`, no `WebMCP.toolsAdded`; `WebMCP.enable` still returns `{}` — the CDP domain is advertised without the page feature, so `enable` success is not feature evidence |
| devtools-domain-disabled | `--disable-features=DevToolsWebMCPSupport` with the page feature on: `document.modelContext` present, `WebMCP.enable` → `'WebMCP.enable' wasn't found` |
| declarative-form-tool | `<form toolname tooldescription>` produces one `WebMCP.toolsAdded` tool with derived `inputSchema` (`type:"object"`, `properties`, `required`), `frameId` and `backendNodeId`; a `<label>` or `toolparamdescription` becomes the property `description`; `<select>` becomes `anyOf`/`enum` |
| imperative-model-context | `document.modelContext.registerTool({name, description, inputSchema, execute})` produces `toolsAdded` with `frameId` and `stackTrace`, no `backendNodeId` |
| lifecycle-removal | Removing the declarative form and aborting the `signal` passed as the **second** argument to `registerTool` each produce `WebMCP.toolsRemoved` `{name, frameId}` |
| navigation-clears-tools | Cross-document navigation sends **no** `toolsRemoved`; the old tools are absent from the new document's `getTools()`. A consumer must drop a frame's tools when that frame's default execution context is destroyed, as DevTools does (S036) |
| declarative-missing-name | A form with `tooldescription` but no `toolname` registers nothing and raises `Audits.issueAdded` `GenericIssue` with `errorType` `FormModelContextMissingToolName` (emitted more than once per page) |
| model-context-location | `document.modelContext` is an object, `'modelContext' in navigator` is false, `isSecureContext` true on `127.0.0.1` |
| frame-tools | A same-origin iframe's declarative tool arrives with the iframe's own `frameId` |
| opaque-sandboxed-iframe | In `sandbox="allow-scripts"` (opaque origin) `registerTool` rejects with `NotAllowedError: Access to the feature "tools" is disallowed by permissions policy.`; no tool is announced |
| data-url-declarative | **Divergence:** on a `data:` document `document.modelContext` is undefined, yet CDP still announces the declarative form tool |

Probe-only observations (wave evidence `.ufo/waves/round-16/probes/`, not receipt cases):
`http://tabi.test` mapped to 127.0.0.1 by resolver rules is not a secure context and has no
`document.modelContext` (Secure); `WebMCP.invokeTool{frameId, toolName, input}` returns an
`invocationId`, then `toolInvoked` carries the input as a JSON **string** and `toolResponded`
carries `status`/`output` (Invoke, loopback echo tool only); `getTools()` returns
`inputSchema` as a JSON string while CDP gives an object, and 154's `executeTool` takes a JSON
string argument, not an object (Imperative); the 154 prototype has `ontoolchange` but no
`ontoolactivated`/`ontoolcancel` (Flags, Declarative).

## Spec versus this build

| Question | Spec / proposal (S020, S030, S031) | Chromium 154 observed / declared (receipt, S033) | Verdict |
|---|---|---|---|
| Entry point | `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }` (§4.1, rev `cb3d1696`) | Same IDL at the 154 tag (S033 line 11); observed `document.modelContext` | agree; `navigator.modelContext` is stale guidance (rejected S038, S039) |
| Declarative form tools | Not in the spec: "not part of the specification at this time" (S030); explainer says Chromium implements "a loose version" (S031) | Observed `toolname`/`tooldescription` forms in `toolsAdded` | Chromium-only surface; never cite S020 for it |
| Events | §4.2 lists `ontoolchange`, `ontoolactivated`, `ontoolcancel` | Only `ontoolchange` on the 154 prototype (probe) | build lags spec; not "events broken" |
| `executeTool` input | spec: optional `object` | 154: JSON `DOMString` (probe + seat IDL read) | build-scoped difference |
| Permissions policy `tools` | §4.4, default `'self'` | opaque sandboxed iframe → `NotAllowedError` | agree |
| CDP domain | not in any spec; S035 marks `experimental domain WebMCP` | present at 154 even with no flags (`protocol-domain.json`) | Chromium-only, build-scoped, unsupported posture as for all CDP (S002) |

## Decision table — what a WebMCP claim may assert from which evidence

| Claim | Evidence required | Admissible from this note? |
|---|---|---|
| "Page P exposes tool T on build B" | CDP `toolsAdded` (or `getTools()`) on B, with origin, flags and fixture bytes recorded | yes for the 11 loopback fixtures on 154 with flags; never for a real site (no operator approval, `corpus/handoffs/operator-approval-request.md`) |
| "WebMCP is available in Chromium" | runtime observation per build and flag set | only "flag-gated on 154.0.8037.97"; no default-profile or unflagged claim |
| "`WebMCP.enable` succeeded, so WebMCP works" | — | **no**: the domain is advertised with the page feature off |
| "No tools on page P" | `toolsAdded` absence after `enable` **and** the page feature on **and** a secure context | absence on `data:`/non-secure origins means nothing about the page's intent; declarative tools can still appear over CDP on `data:` |
| "Tool T was removed" | `toolsRemoved` for explicit removal; execution-context destruction for navigation | yes, but navigation emits no `toolsRemoved` |
| "Spec says X" for declarative or CDP behaviour | — | **no**: neither is spec text |
| "Page tools are MCP tools" | — | **no**: shared vocabulary only (`name`, `description`, `inputSchema`; S037 queued as adjacency); result shapes and lifecycles differ |

## Corrections inside this round (append-only record)

The first committed-code run (`receipt-first-run-failed.json`, producer digest inside it)
failed three cases; the repair changed expectations or probe mechanics, each with a named
oracle, and the original bytes are kept:
1. navigation-clears-tools expected `toolsRemoved` on navigation (harness guess); repaired to
   "no event, no stale tools" from S036 and the lane's lifecycle probe.
2. frame-tools expected no `description` for a labelled input; repaired from the label rule
   already observed in `declarative-form-tool`.
3. opaque-sandboxed-iframe read only a synchronous throw, but `registerTool` returns a Promise;
   repaired to await the rejection and require `NotAllowedError`.

## Limits and unknowns

- One build, one host, flags on; Chromium 152 and the Playwright-managed CfT 156 are untested.
- The receipt's flag-off case asserts page-API and event absence; its effective-argv readback
  from `/proc/<pid>/cmdline` recorded `pid null`, so "no WebMCP token reached the browser argv"
  is not independently proven beyond the harness's own argument list.
- No tool is invoked in the receipt; invocation is a probe observation only.
- Agent-side consumption (any MCP client or the kimi-webbridge daemon) is not observed;
  kimi-webbridge 1.11.3 has no WebMCP surface (`.ufo/waves/round-16/w1/ReconKimiWebbridge.md`).

## Adjacency (report, never absorb)

Observing page-registered tools over CDP is tabi's browser craft. The REA
`discover_webmcp_tools` verb and MCP server registration are kaidoku's surface; the agent-side
MCP plane is kumitate's; authoring WebMCP tools for published properties is kake's; trust of
page-declared metadata (prompt-injection risk the PDL itself names) is kasegi/kagi ground.
Page tool strings recorded here are untrusted target data.

## Cross-references

- `knowledge/cdp-evidence-patterns.md` — effective launch line, channel identity and closure.
- `knowledge/chrome-remote-debugging-profile-boundary.md` — fresh run-owned profile rule; CDP
  shapes are build-scoped.
- `knowledge/webdriver-bidi-capability-matrix.md` — WebMCP is CDP-only; the W3C BiDi WD has no
  WebMCP module (`.ufo/waves/round-16/w1/ConnBidiWebmcp.md`).
- `knowledge/aria-loopback-round-13.md` — the loopback isolation contract this harness follows.

## Recheck procedure

`node scripts/webmcp-loopback-round16.mjs --out /tmp/webmcp-recheck.json` from the lane root
(exit 0 = all cases pass; 1 = a case failed; 2 = could not evaluate). Compare
`.runtime.observed.chromium.version` with this note; any version change makes every row above a
historical observation until re-run.
