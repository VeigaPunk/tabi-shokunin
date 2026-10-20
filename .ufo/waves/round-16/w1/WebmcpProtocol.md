# WebmcpProtocol — round 16 wave 1 report

## Deliverable

Wrote `corpus/evidence/round-16/webmcp/protocol-domain.json` (24,698 bytes, file sha256
`68cd3bec843711cfd972818df80ee6ea9b8b89fb4c11d4719735c34a241f27f4`, schema
`tabi-round16-webmcp-protocol-v1`).

## Method

Temp probe script `/tmp/webmcp-protocol-probe.mjs` (outside repo, not committed). Per run:
`spawn('/usr/lib/chromium/chromium', ['--headless','--disable-gpu','--no-first-run','--no-default-browser-check',
'--disable-extensions','--remote-debugging-port=0','--user-data-dir=<mkdtemp>', <flags>, 'about:blank'])`
with `HOME=<mkdtemp>`; polled `<profile>/DevToolsActivePort` for the bound loopback port; HTTP GET
`http://127.0.0.1:<port>/json/version` then `/json/protocol`; sha256 over exact response bytes;
extracted the `WebMCP` domain object verbatim. `SIGKILL` + `rm -rf` of profile and temp HOME in a
`finally` block.

**Executable caveat (from TabiR16.SentinelProbe-5 F1):** `/usr/bin/chromium` is the Arch launcher; it
merges `~/.config/chromium-flags.conf` into argv (observed: `--ozone-platform=wayland`,
`--ozone-platform-hint=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`,
`--load-extension=~/...` literal tilde, `--disable-features=Vulkan`). A first probe iteration ran
through that launcher (so "noflags" was not flag-free). This evidence re-ran against the real binary
`/usr/lib/chromium/chromium` — the same binary `runtime-pin.json` pins — with a clean `HOME`, so typed
argv = effective argv. Result unchanged: identical protocol sha256, WebMCP domain present both ways.

Command: `node /tmp/webmcp-protocol-probe.mjs /tmp/webmcp-protocol-raw.json` (Node on host, run twice total —
two browser launches inside one invocation).

Observed stdout:

```
noflags  webmcp-domain: present sha256 126cf5fa9b3d6e18 domains 58
webmcp   webmcp-domain: present sha256 126cf5fa9b3d6e18 domains 58
identical: true
```

## Runs

- **noflags:** no WebMCP flags (real binary, clean HOME). DevTools port 35439.
- **webmcp:** DevTools port 36855; flags `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`
  `--enable-blink-features=WebMCP,WebMCPTesting` (exact strings from PLAN.md §C2).

Both runs: `/json/version` → `Browser: Chrome/154.0.8037.97`, `Protocol-Version: 1.3`,
`V8-Version: 15.4.80.20`, UA `HeadlessChrome/154.0.0.0`. `/json/protocol` → HTTP 200, identical
byte length, **identical sha256 `126cf5fa9b3d6e18…`** (full digest in JSON), 58 domains in each run.

## WebMCP domain (present under BOTH flag sets; byte-identical)

`experimental: true`, `dependencies: [Runtime, Page, DOM]` (see JSON), `deprecated` absent.

- **Commands (4):** `enable` (emits `toolsAdded` for already-registered tools), `disable`,
  `invokeTool(frameId: Page.FrameId, toolName: string, input: object) → {invocationId: string}`,
  `cancelInvocation(invocationId: string)`.
- **Events (4):** `toolsAdded(tools: Tool[])`, `toolsRemoved(tools: RemovedTool[])`,
  `toolInvoked(toolName, frameId: Page.FrameId, invocationId, input: string)`,
  `toolResponded(invocationId, status: InvocationStatus, output?: any /* untrusted, prompt-injection
  warning in spec text */, …)` — full parameter list verbatim in the JSON.
- **Types (4):** `Annotation`, `InvocationStatus`, `Tool`, `RemovedTool`.

## Key finding for the harness seats

The `WebMCP` domain is declared in the compiled protocol **regardless of runtime flags** — the flag
set does not change `/json/protocol` bytes at all (same sha256, same 58-domain list). Flag-gating is
behavioral (`document.modelContext` presence, `toolsAdded` emission), not protocol-surface. This
matches PLAN.md's pre-probe note that `WebMCP.enable` returns `{}` even with no flags. Harness seats
should therefore treat `protocolDomain` in `receipt.json` as flag-invariant and assert behavior via
events/`modelContext` probes instead.

## Cleanup verified

`pgrep -af 'chromium.*webmcp-proto'` → no match; `ls /tmp/webmcp-proto-*` → nothing. Both browser
processes killed, temp profiles and temp HOMEs removed. Loopback 127.0.0.1 only; `about:blank`
target; no real site, no user profile.

## Files changed

- `corpus/evidence/round-16/webmcp/protocol-domain.json` (new, owned)

## Tooling

No installs or updates performed; used preinstalled `/usr/lib/chromium/chromium` 154.0.8037.97 (real
binary behind the `/usr/bin/chromium` launcher) and host Node.

## Risks / blockers

None. Evidence is self-contained; downstream seats can read `runs[1].protocolEndpoint.webmcpDomain`
for the domain definition and `comparison.webmcpDomainIdentical` for the flag-invariance fact.
