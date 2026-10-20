# ReconKimiWebbridge — round 16 wave 1 report

Read-only seat. No owned file written (source recon only). Everything below was observed this
session, 2026-10-20, on host `vgpnk` (no network fetches; local reads only).

## Answer

**No WebMCP / modelContext / MCP / tool-exposure-as-protocol mention exists anywhere in tabi's
primary substrate documentation.** The plugin is a 14-action browser-automation skill over a local
HTTP daemon, not an MCP host and not a model-context tool provider. The only generic CDP path it
exposes is documented as a raw `chrome.debugger` passthrough.

Grepped tree (complete, 5 files, no others):

```
2703   03-browser-extension.txt
338    04-headroom.txt
1273   kimi.plugin.json
2422   skills/kimi-webbridge/references/operations.md
11880  skills/kimi-webbridge/SKILL.md
```

Exact commands and observed output (cwd `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/`):

```
$ grep -rniE 'webmcp|modelcontext' .
exit=1                      # no output at all

$ grep -rniE 'mcp|model.?context|tool.?expos' .
exit=1                      # no output at all

$ grep -rniE 'toolname|tooldescription|navigator\.model|document\.model' .
exit=1                      # no output at all

$ grep -rniE 'chrome\.debugger|registerTool|unregisterTool' .
./skills/kimi-webbridge/SKILL.md:23:| `cdp` | `method`, `params` | raw CDP response | Raw `chrome.debugger` passthrough — what `evaluate` is to JS, `cdp` is to CDP. Low-level escape hatch for cases the tools above don't cover |
exit=0
```

`PROVINCE.md` (lane root):

```
$ grep -nE 'webmcp|WebMCP|modelContext|model_context' PROVINCE.md
exit=1
```

The only substrate anchor in `PROVINCE.md` is `PROVINCE.md:6-8`:
"**Owns (surfaces):** the kimi-webbridge plugin (`~/.kimi-code/plugins/managed/kimi-webbridge/`)
as primary substrate documentation". No capability claim about page-side tool exposure, WebMCP,
or `modelContext` is made there.

## tool-exposure surface that does exist (what the plugin actually exposes)

- `skills/kimi-webbridge/SKILL.md:13-30` — `## Tools` table, 14 actions (rows 17-30):
  `navigate, find_tab, snapshot, click, fill, evaluate, cdp, screenshot, network, upload,
  save_as_pdf, list_tabs, close_tab, close_session`. Exposure is HTTP
  `POST http://127.0.0.1:10086/command` with a top-level `session` (`SKILL.md:41-66`), not MCP.
- `SKILL.md:22` — `evaluate` runs arbitrary JS in the page realm (hence `document.modelContext`
  would be reachable as a *value read*, never as a documented capability).
- `SKILL.md:23` — `cdp` = raw method/params passthrough over `chrome.debugger`; the only route by
  which a `WebMCP.*` CDP method could be issued through the plugin.
- `SKILL.md:146` — protocol-level trusted input is explicitly framed as "the `cdp` escape hatch".
- `SKILL.md:151` — substrate discipline: "never stop, restart, or uninstall the daemon automatically".
- `SKILL.md:3-4` — model-facing trigger text (frontmatter `description`), i.e. the whole
  "tool exposure" contract is prose + a stub table, not a schema.
- `kimi.plugin.json:6-13` — keywords `browser/webbridge/cdp/automation/web/scraping`; no `mcp`.

Extension-side capability (from the substrate doc, `03-browser-extension.txt:34`): permissions
include `"debugger"`, `host_permissions` `"<all_urls>"`, MV3 service worker. This is what makes the
`cdp` action possible; it is not WebMCP-aware.

## Versions (pinned this session; substrate docs are stale by one extension release)

| Component | Version | Anchor |
|---|---|---|
| Plugin (skill package) | **1.11.3** | `kimi.plugin.json:4` `"version": "1.11.3"`; `SKILL.md:6` `metadata.version: "1.11.3"` |
| Daemon binary | **v2.0.23** | `/home/vgpnk/.kimi-webbridge/logs/daemon.log:12,17` `hello from extension v2.0.23 (daemon v2.0.23)`; binary literals `v2.0.23` ×3 |
| Daemon binary digest | sha256 `71067480bd99c2ba0f6d76df50a17e4911917cec8878320c107105066f8ad35d` | `sha256sum ~/.kimi-webbridge/bin/kimi-webbridge`; `file` → statically linked, stripped ELF x86-64, 10,031,288 B |
| Extension — as recorded in the vault doc | **2.0.23** | `03-browser-extension.txt:35` `"version": "2.0.23"` (doc stamped `2026-10-14T17:40:47Z`) |
| Extension — actually installed now | **2.0.24** | `~/.config/chromium/{Default,"Profile 1"}/Extensions/fldmhceldgbpfpkbgopacenieobmligc/2.0.24_0/manifest.json` → `"version": "2.0.24"` (mtime 2026-10-18 10:30); no `2.0.23_0` directory remains |
| Chromium — as recorded in the vault doc | **152.0.7977.82** | `03-browser-extension.txt:3-4` crashpad `--annotation=ver=152.0.7977.82` |
| Chromium on host now | 154.0.8037.97 | PLAN.md pre-probe + sibling `WebmcpRuntimePin.md`; noted here as drift, not re-measured by this seat |

Doc-set digests (for immutability checks by L1):

```
e70aff5c40fffdeaa8a7c1e50087dd908bfc5fd91febe3c7c09f61417403695d  kimi.plugin.json
4314671c31292875ebf1c25f0b53a4e6b7dfb6dbe18bc5787574a31267665844  03-browser-extension.txt
0e8a63ab11ed12a9a7d9cb0186939034a2a383605db85cbee88d5f01a14c995d  04-headroom.txt
84a8e69d04c5b810e69695dec8d8e16c1cd9735b96ba81c39433b0c0451bea4b  skills/kimi-webbridge/SKILL.md
b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc  skills/kimi-webbridge/references/operations.md
```

## Auxiliary checks (same substrate, shape-only, no credential contents read)

- **Daemon not running.** `~/.kimi-webbridge/daemon.pid` = `3736881` but `ps -p 3736881` returns no
  process, and `ss -ltnp | grep 10086` → `no-listener-10086`. This matches the doc's own sample
  `04-headroom.txt:7` `no-socket-to-10086-sample`; the daemon has not run since
  `daemon.log` last line `2026/10/15 12:51:43` (no `v2.0.24` anywhere in either log; binary is v2.0.23).
- **Extension bundle 2.0.24 is not WebMCP-aware.** Case-insensitive counts over the whole
  `2.0.24_0/` tree: `webmcp` 0, `modelcontext` 0, `model_context` 0, `tooldescription` 0,
  lowercase `toolname` 0, `toolDescription` 0, `chrome.debugger` 13. The 40 case-insensitive
  `toolname` hits are `toolName`×36 + `ToolName`×4, all in `background.js`, and are internal
  tool-call plumbing — e.g.
  ``.push(`${k(t,`transcript.env`)} 权限确认: ${r.request.toolName}(${r.request.domain})`)`` and
  ``{kind:`rejected`,toolCall:t,toolName:n,args:i,...}`` — not the WebMCP declarative form attribute.
- **Daemon binary is WebMCP-blind and imposes no visible CDP allowlist.** `grep -a -i -o` counts on
  the binary: `webmcp` 0, `WebMCP` 0, `modelContext` 0, `model_context` 0, `toolname` 0; and no
  `Page.`/`Runtime.`/`Network.`/`WebMCP.`-style domain literals at all. Method dispatch lives in
  the extension, which forwards verbatim:
  `chrome.debugger.sendCommand({tabId:e}, t, n)` with caller-supplied `t`/`n`.
- **Hygiene note.** `daemon.log` DEBUG lines contain an installation `user_unique_id` and an
  `X-Mcs-Appkey` header (DataRangers telemetry to a remote endpoint). Both values are omitted from
  this report; nothing else credential-shaped was opened. No browser profile contents, cookies, or
  tokens were read.

## Implications for C2 (all `[INFERENCE]`, not measured by this seat)

- The WebBridge substrate can **issue** `WebMCP.*` CDP methods against the user's already-running
  browser via the `cdp` action, but it cannot **create** a WebMCP-enabled environment: it never
  launches a browser and never sets `--enable-features`/`--enable-blink-features`. The recorded
  live process args (`03-browser-extension.txt:2`) carry no WebMCP flags, so the plugin is not a
  route to a flagged WebMCP runtime for the round-16 evidence.
- Because the documented `cdp` return is a "raw CDP response" with no event-subscription action,
  `WebMCP.toolsAdded`/`toolsRemoved` events most likely cannot be observed through the plugin at
  all — only the synchronous reply of `WebMCP.enable`. The round-16 loopback harness (own Chromium
  launch + flags + Playwright CDP session) remains the only viable observation path.
- The plugin's docs would need a version bump before any WebMCP claim could cite them: the doc
  records extension 2.0.23 while 2.0.24 is installed, and records Chromium 152 while the host has
  154. Anything sourced from `03-browser-extension.txt` must be date-stamped as of 2026-10-14.

## Commands run (all read-only; no gate/selftest/counter/browser/daemon started)

`find`, `ls -la`, `cat -n`, `sed -n`, `grep -rniE`, `grep -a -o[iE]`, `sha256sum`, `file`, `wc -l`,
`tail`, `ps -p`, `ss -ltnp`. No installs or upgrades performed; no pacman transaction run (guard
honored). No subagent dispatched, no commits, no background jobs.

## Remaining unknowns

1. Whether Chromium 154's `chrome.debugger` surface accepts a `WebMCP.enable` issued by an extension
   (Chrome validates method names per build and may hide experimental domains from `chrome.debugger`
   even when the DevTools protocol declares them) — needs a flagged-loopback experiment, not docs.
2. Whether extension 2.0.24 forwards *events* from `chrome.debugger` at all (the bundle has a 13-hit
   `chrome.debugger` surface but the plugin's public action list has no event stream); if it does not,
   `toolsAdded` capture through WebBridge is impossible regardless of version.
3. Exact `~/.kimi-code/mcp.json` role (249 B, outside the assigned slice and not opened) — irrelevant
   to the WebMCP question since the webbridge plugin is `skills/`-based, but L1 may want that
   disambiguated elsewhere.
