# WebmcpProbeFlags — round-16 wave-1 report

Seat: `TabiR16.WebmcpProbeFlags-5` (probe/executor). Date 2026-10-20.
Owns: `.ufo/waves/round-16/probes/WebmcpProbeFlags.mjs`, `.ufo/waves/round-16/probes/WebmcpProbeFlags.json`.

## Assignment

Matrix of launch flags against a loopback `http://127.0.0.1` page carrying a declarative
`<form toolname="search" tooldescription="Search"><input name="q" title="Query"></form>`;
for each flag set record `typeof document.modelContext`, `'modelContext' in navigator`,
the `WebMCP.enable` CDP result, and `WebMCP.toolsAdded` events. Determine the minimal
flag set for (a) `document.modelContext` and (b) the CDP event.

## Files changed

- `.ufo/waves/round-16/probes/WebmcpProbeFlags.mjs` — probe (Node ESM, Playwright 1.64.0
  loaded from the global npm root via `createRequire` candidates matching
  `scripts/aria-loopback-round13.mjs:117-144`; serves the fixture itself on
  `127.0.0.1:0`; aborts every non-loopback request; fresh `mkdtemp` profile per case via
  `launchPersistentContext`).
- `.ufo/waves/round-16/probes/WebmcpProbeFlags.json` — recorded observations
  (schema `tabi-round16-webmcp-flags-probe-v1`; runtime pin, per-case records, summary).

## Method (exact)

`node .ufo/waves/round-16/probes/WebmcpProbeFlags.mjs` (exit 0, ~11 s).
Per case: `chromium.launchPersistentContext(profile, {executablePath: '/usr/bin/chromium',
headless: true, args: caseArgs})` → `context.newCDPSession(page)` → subscribe
`WebMCP.toolsAdded|toolsRemoved|toolsUpdated` → `WebMCP.enable` **before** navigation →
`page.goto(loopbackUrl, {waitUntil:'load'})` → 800 ms drain → `page.evaluate` surface read.
11 cases: none; `--enable-features=WebMCP`; `--enable-blink-features=WebMCP`;
`--enable-features=DevToolsWebMCPSupport`; `--enable-features=DeclarativeWebmcp`;
`--enable-experimental-web-platform-features`; features-WebMCP+blink-WebMCP;
blink-WebMCP+DevToolsWebMCPSupport; blink-WebMCP+DeclarativeWebmcp;
blink-WebMCP+DeclarativeWebmcp+DevToolsWebMCPSupport; full PLAN set.

## Observed (all in JSON; run 2026-10-20, this host)

Runtime: `Chromium 154.0.8037.97 Arch Linux` (`/usr/bin/chromium`,
sha256 recorded in JSON), Playwright 1.64.0, Node v24.21.0.

- `WebMCP.enable` returned `{}` in **every** case including no flags — the CDP domain is
  registered regardless — **except** when `DevToolsWebMCPSupport` is explicitly disabled:
  `blink-WebMCP+disable-DevToolsWebMCPSupport` → `WebMCP.enable` fails with
  `'WebMCP.enable' wasn't found`. So `DevToolsWebMCPSupport` (enabled by default in this
  build) registers the entire WebMCP CDP domain, not merely the event stream.
- Positive cases (doc.modelContext `object` AND toolsAdded fired): `features-WebMCP`,
  `blink-WebMCP`, `experimental-web-platform-features`, `blink-WebMCPTesting`, and all
  supersets including the full PLAN set.
- Negative cases: `none`, `features-DevToolsWebMCPSupport`, `features-DeclarativeWebmcp`
  (each alone), and `features-WebMCP+disable-blink-WebMCP` — no `document.modelContext`,
  zero WebMCP events.
- `toolsAdded` params (every positive case, identical shape):
  `{tools:[{name:"search",description:"Search",inputSchema:{type:"object",
  properties:{q:{type:"string"}},required:[]},frameId:"<hex>",backendNodeId:3}]}`.
- `'modelContext' in navigator` was `false` in all cases; `navigator.modelContext`
  undefined — confirms PLAN's document-vs-navigator surface claim.
- API surface when enabled (blink-WebMCP and full-plan-set identical proto keys):
  `[ontoolchange, executeTool, getTools, registerTool, constructor]`;
  `registerTool` function; `unregisterTool`/`provideContext`/`ModelContextTool`
  undefined; `globalThis.ModelContext` is a function. `WebMCPTesting` added nothing
  to this proto on this build.

## Minimal flag sets (ablation-backed)

Ablation cases were added mid-probe against CriticC2-5's source-scoped predictions
(runtime_enabled_features: `WebMCP` experimental, `implied_by: WebMCPTesting`;
`kDevToolsWebMCPSupport` enabled-by-default). All predictions confirmed:

- **(a) `document.modelContext`: the blink runtime feature `WebMCP` must be on.** Any
  single one of: `--enable-blink-features=WebMCP`, `--enable-blink-features=WebMCPTesting`
  (implies WebMCP), `--enable-features=WebMCP` (base feature copied to blink — proven by
  `features-WebMCP+disable-blink-WebMCP` being negative), or
  `--enable-experimental-web-platform-features`. Zero flags is negative.
- **(b) `WebMCP.toolsAdded`: blink `WebMCP` on (as above) AND `DevToolsWebMCPSupport`
  on.** The latter is enabled by default — only `--disable-features=DevToolsWebMCPSupport`
  removes it — so in practice the same single flags suffice, but the event/domain depends
  on both gates: `blink-WebMCP` + disabled `DevToolsWebMCPSupport` keeps
  `document.modelContext` yet `WebMCP.enable` itself is unregistered.
- `DeclarativeWebmcp` as a sole flag is negative and unnecessary — no separate
  declarative gate was needed for the `toolname` form to register a tool on this build.
- Recommended harness arg set for `WebmcpHarness`: `['--enable-blink-features=WebMCP']`
  (or `--enable-features=WebMCP`; equivalent here). `WebMCP.enable` must precede
  navigation for the event to be captured.

## Tooling

No installs. Reused already-present global Playwright 1.64.0
(`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules`)
and system `/usr/bin/chromium`. Pacman untouched (pause honored).

## Gotchas for harness/fixture seats

- Playwright `chromium.launch` **rejects** `--user-data-dir` in `args` ("Pass
  userDataDir parameter to browserType.launchPersistentContext instead") — use
  `launchPersistentContext`.
- `browserVersion` via `browser.version()` is unavailable under persistent context;
  `Browser.getVersion` CDP returns `product: "Chrome/154.0.8037.97"`.

## Coordination
Findings messaged to `TabiR16.WebmcpHarness-5`; ablation confirmations to `TabiR16.CriticC2-5`.

## Risks / limits

- Loopback only, fresh temp profiles, this one build (154.0.8037.97). Feature names/
  defaults may differ on other channels or versions; `--enable-features=WebMCP` working
  implies the base::Feature and blink flag share the name on this build.
- The 800 ms post-load drain is empirical; all events arrived before it on this host.
- Author-side advice only; L1 owns final gate re-runs.
