source: S020
source: S030
source: S031
source: S032
source: S033
source: S034
source: S035
source: S036
source: S037
verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)
recheck: on chromium package change; S020/S032 on-release

# Native WebMCP on Chromium 154 — loopback CDP observation (round 16)

**Locally measured: yes, for one build, flag-enabled, loopback fixtures only.**
Receipt: `corpus/evidence/round-16/webmcp/receipt.json` (schema `tabi-round16-webmcp-v1`,
11/11 cases pass), produced by `scripts/webmcp-loopback-round16.mjs`; the receipt's
`producerSha256` is the committed harness blob. Its history is recorded in §Corrections:
a pre-commit 8/11 run, an 11/11 run committed at `8f7feb3`, and the current 11/11 run after
the wave-2 falsification repairs.

This note supersedes, for Chromium 154 only, the round-3/kaika frontier statement
"Native WebMCP in chromium 152 — unprobed (census U3)" (`corpus/README.md:35`, `:181`,
`:194`; `knowledge/browser-surface-census.md:188`). It does not certify Chromium 152, which
stays unprobed at runtime. The census asked whether the build "exposes
`navigator.modelContext`" and the kaika README row added "not `navigator.modelContext`"
without checking the spec: the spec had already moved the attribute to `Document`
(S020 §4.1), so `document.modelContext` is spec-aligned, not a divergence.

## Scope and runtime identity

| Item | Value | Evidence |
|---|---|---|
| Browser | Chromium `154.0.8037.97` (Arch package `154.0.8037.97-1`); CDP `Browser.getVersion` product `Chrome/154.0.8037.97` | `corpus/evidence/round-16/webmcp/runtime-pin.json`; receipt `.runtime.observed` |
| Launch path vs engine | `/usr/bin/chromium` is a 14 KB launcher (sha256 `eaed39c3…a172b`, hashed by the receipt) that execs `/usr/lib/chromium/chromium` (sha256 `95b17db7…b330a`, pinned by runtime-pin). Each receipt run records the browser main pid and its `/proc/<pid>/exe` path (`/usr/lib/chromium/chromium`) and effective argv | receipt `.runs[]`; runtime-pin.json |
| Host flag file | The launcher reads `~/.config/chromium-flags.conf`; the harness redirects `HOME`/`XDG_CONFIG_HOME` to a temp dir per launch | harness header; receipt `.runs[].effectiveArgv` |
| Driver | Playwright `1.64.0` (global npm root), Node `24.21.0` | receipt `.runtime.observed` |
| Origin | `http://127.0.0.1:<ephemeral>`; page-level HTTP(S), beacon and page-WebSocket requests to other origins are aborted (0 recorded) | receipt `.loopback`, `.safety.claimScope` |
| Flags (receipt run) | `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting` | receipt `.flags` |

Minimal flag set (probe, not receipt): any one of `--enable-blink-features=WebMCP`,
`--enable-features=WebMCP`, `--enable-blink-features=WebMCPTesting`,
`--enable-experimental-web-platform-features` exposes `document.modelContext` and the CDP
event stream on this build (`.ufo/waves/round-16/probes/WebmcpProbeFlags.json`, 14 launch
variants; an explicit `--disable-blink-features=WebMCP` wins). Source agrees: at the 154 tag,
`WebMCP` is `experimental` and `implied_by` `WebMCPTesting` (S034, lines 7023-7035). S034
has no runtime feature named `DeclarativeWebmcp`; that the token has no observed effect is
shown by the flags probe and a wave-2 re-run (`.ufo/waves/round-16/w2/ReopenS034.md`), not by
S034 alone (the binary contains a `kDeclarativeWebmcp` string whose declaration is unresolved).
`DevToolsWebMCPSupport` is enabled by default at 154 (Chromium `blink/common/features.cc:571`,
read by seat SrcChromiumFlags; not a SOURCES row).

## What the receipt observed (11 cases, Chromium 154, loopback)

| Case | Observation |
|---|---|
| flags-off-negative-control | No WebMCP feature flag in the browser's own `/proc` argv: no `document.modelContext`, no `WebMCP.toolsAdded`; `WebMCP.enable` still returns `{}` — the CDP domain is advertised without the page feature, so `enable` success is not feature evidence |
| devtools-domain-disabled | `--disable-features=DevToolsWebMCPSupport` with the page feature on: `document.modelContext` present, `WebMCP.enable` → `'WebMCP.enable' wasn't found` |
| declarative-form-tool | `<form toolname tooldescription>` produces one `WebMCP.toolsAdded` tool with derived `inputSchema` (`type:"object"`, `properties`, `required`), `frameId` and `backendNodeId`; `toolparamdescription` becomes the property `description`; `<select>` becomes `anyOf`/`enum` (the harness comparator ignores `enum`/`anyOf` values — wave-2 CaseDeclarativeFormTool) |
| imperative-model-context | `document.modelContext.registerTool({name, description, inputSchema, execute})` produces `toolsAdded` with `frameId` and `stackTrace`, no `backendNodeId` |
| lifecycle-removal | Removing the declarative form and aborting the `signal` passed as the **second** argument to `registerTool` each produce `WebMCP.toolsRemoved` `{name, frameId}` |
| navigation-clears-tools | Cross-document navigation sends **no** `toolsRemoved` (Chromium sends that event only on explicit removal, `inspector_web_mcp_agent.cc:178-191` at the 154 tag, seat-read). The case's second clause (old names absent from the new document's `getTools()`) checks the page API, not a CDP consumer's list |
| declarative-missing-name | A form with `tooldescription` but no `toolname` registers nothing and raises `Audits.issueAdded` `GenericIssue` with `errorType` `FormModelContextMissingToolName` (emitted more than once per page) |
| model-context-location | `document.modelContext` is a real `[object ModelContext]` with `registerTool`, inherited (not an own property); `'modelContext' in navigator` is false; `isSecureContext` true on `127.0.0.1` |
| frame-tools | A same-origin iframe's declarative tool arrives with the iframe's own `frameId`; its `<label>` text becomes the parameter `description` |
| opaque-sandboxed-iframe | In `sandbox="allow-scripts"` (opaque origin) `document.modelContext` exists but `registerTool` rejects with `NotAllowedError: Access to the feature "tools" is disallowed by permissions policy.`; no tool is announced |
| data-url-declarative | **Divergence:** on a `data:` document `document.modelContext` is undefined, yet CDP still announces the declarative form tool. This is scheme-specific: a non-secure `http://tabi.test` page announced nothing (Secure probe) |

Probe-only observations (wave evidence `.ufo/waves/round-16/probes/`, not receipt cases):
`http://tabi.test` mapped to 127.0.0.1 by resolver rules is not a secure context and has no
`document.modelContext` (Secure); `WebMCP.invokeTool{frameId, toolName, input}` returns an
`invocationId`, then `toolInvoked` carries the input as a JSON **string** and `toolResponded`
carries `status`/`output` (Invoke, loopback echo tool only); `getTools()` returns
`inputSchema` as a JSON string while CDP gives an object, and 154's `executeTool` requires a
JSON string second argument, not an optional object (Imperative); the 154 prototype has
`ontoolchange` but no `ontoolactivated`/`ontoolcancel` (Flags, Declarative). A label without
`toolparamdescription` becomes the description per Chromium 154 `form_mcp_schema.cc`
`ComputeDescription` (seat-read) and the Issues probe's `param-with-label` case.

## Spec versus this build

| Question | Spec / proposal (S020, S030, S031) | Chromium 154 observed / declared (receipt, S033, S035) | Verdict |
|---|---|---|---|
| Entry point | `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }` (§4.1; read at rev `cb3d1696`; an editor-only rev `51ed7565` appeared later the same day) | Same IDL at the 154 tag (S033 line 11); observed `document.modelContext` | agree; `navigator.modelContext` guidance is stale (S038 rejected; S039/S040) |
| Declarative form tools | Not in the spec: "not part of the specification at this time" (S030); explainer says Chromium implements "a loose version" (S031) | Observed `toolname`/`tooldescription` forms in `toolsAdded` | Chromium-only surface; never cite S020 for it |
| Events | §4.3 requires `ontoolchange`, `ontoolactivated`, `ontoolcancel` | Only `ontoolchange` on the 154 prototype (probe) | build lags spec; not "events broken" |
| `executeTool` input | spec: optional `object` | 154: required JSON `DOMString` (probe; `model_context.idl` seat-read, no SOURCES row) | build-scoped difference |
| Permissions policy `tools` | §4.4, default `'self'` | opaque sandboxed iframe → `NotAllowedError` | agree |
| CDP domain | not in the WebMCP spec; S035 (Chromium main) marks `experimental domain WebMCP` | present at 154 even with no flags (`protocol-domain.json`) | Chromium-only, build-scoped, unsupported posture as for all CDP (S002) |

## Decision table — what a WebMCP claim may assert from which evidence

| Claim | Evidence required | Admissible from this note? |
|---|---|---|
| "Page P exposes tool T on build B" | CDP `toolsAdded` (or `getTools()`) on B, with origin, flags and fixture bytes recorded | yes for the fixtures whose cases observed tools (6 of the 11 cases: 5 loopback, 1 `data:`) on 154 with flags; never for a real site (no operator approval, `corpus/handoffs/operator-approval-request.md`) |
| "WebMCP is available in Chromium" | runtime observation per build and flag set | only "flag-gated on 154.0.8037.97"; no default-profile or unflagged claim |
| "`WebMCP.enable` succeeded, so WebMCP works" | — | **no**: the domain is advertised with the page feature off |
| "No tools on page P" | `toolsAdded` absence after `enable` **and** the page feature on **and** a secure context | absence on non-secure origins carries no page-intent information; on `data:` declarative tools can still appear over CDP |
| "Tool T was removed" | `toolsRemoved` for explicit removal | yes; for navigation there is no event — a CDP consumer must drop that target's tools on `Runtime.executionContextsCleared` / the frame's new navigation (DevTools synthesizes a per-frame removal from it, `RuntimeModel.ts:111-118` + S036); this consumer rule is source-read, not measured by the receipt |
| "Spec says X" for declarative or CDP behaviour | — | **no**: neither is spec text |
| "Page tools are MCP tools" | — | **no**: shared vocabulary only (`name`, `description`, `inputSchema`; S037); result shapes and lifecycles differ |

## Corrections inside this round (append-only record)

1. The first L1 run was **pre-commit**: its producer (`cedccdf9…`) was never committed and only
   its receipt is retained (`receipt-first-run-failed.json`, 8/11). Between it and the
   `8f7feb3` run, three cases were repaired and two fixtures changed (`frame-child.html`,
   `frame-parent.html` gained the observed label description): navigation-clears-tools
   expected a `toolsRemoved` event (harness guess) and was repaired from S036 and the
   lifecycle probe that predated the run; frame-tools omitted the label-derived description;
   opaque-sandboxed-iframe read only a synchronous throw although `registerTool` returns a Promise.
2. Wave 2 (`.ufo/waves/round-16/w2/`) then falsified harness mechanics and the receipt was
   regenerated (`8f7feb3` keeps the earlier 11/11 bytes): the browser pid came from a page-target
   `SystemInfo` call that always failed, so argv/exit proofs were vacuous (now found in `/proc`
   by the run's unique `--user-data-dir`; null pid now fails closure); the argv filter matched the
   profile path (now only feature switches); model-context-location accepted `null` (now requires
   a real `ModelContext`); opaque-sandboxed-iframe passed whenever the API was absent (now requires
   the `NotAllowedError` rejection); a `%00` request path crashed the server (now 404).

## Limits and unknowns

- One build, one host, flags on; Chromium 152 and the Playwright-managed CfT 156 are untested.
- Confinement is page-level only: WebRTC UDP/TCP, WebTransport and SharedWorker traffic from a
  hostile page are not blocked or recorded (wave-2 SentinelHarness H1); the fixtures contain none.
- Each run of the protocol-domain capture leaves a re-created temp profile directory after the
  browser is killed (wave-2 H3; not covered by the closure proof).
- No tool is invoked in the receipt; invocation is a probe observation only.
- Agent-side consumption (any MCP client or the kimi-webbridge daemon) is not observed;
  kimi-webbridge 1.11.3 has no WebMCP surface (`.ufo/waves/round-16/w1/ReconKimiWebbridge.md`).

## Adjacency (report, never absorb)

Observing page-registered tools over CDP is browser craft, but kaidoku's Core row "Runtime
observation (CDP)" (`kaidoku-shokunin/PROVINCE.md:53`) covers the same self-launched CDP
surface; this overlap is **contested scope awaiting an integrator ruling**, reported in the
round-16 report, not settled here. The REA `discover_webmcp_tools` verb and MCP server
registration are kaidoku's; the agent-side MCP plane is kumitate's; authoring WebMCP tools for
the operator's own published properties is kake's; trust of page-declared metadata
(prompt-injection risk the PDL itself names) is unassigned between kasegi/kagi. Page tool
strings recorded here are untrusted target data.

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
