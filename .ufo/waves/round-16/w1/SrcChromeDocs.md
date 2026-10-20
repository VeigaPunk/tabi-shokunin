# SrcChromeDocs — Chrome's own WebMCP docs/blog, opened this session

Seat: `TabiR16.SrcChromeDocs-5` (scout, leaf). Access date for every URL below: **2026-10-20**.
Scope: Chrome-for-Developers WebMCP docs + blog, Chrome Status API, Chromium source pinned at the
host's installed milestone tag. No browser launched, no counter run, no gate executed, no REA device used.

Host context used only as given by L1's plan (not re-verified here): Chromium `154.0.8037.97`.

---

## 1. Search strings issued (all via `web_search`, 2026-10-20)

1. `developer.chrome.com WebMCP document.modelContext Chrome flag enable-webmcp-testing`
2. `site:developer.chrome.com WebMCP`
3. `Chrome WebMCP early preview program origin trial Chrome 154 milestone`
4. `site:developer.chrome.com "WebMCP" release-notes 149 OR 150 OR 151`

## 2. What I excluded (and why) — none of these were opened

| URL | Reason |
|---|---|
| `mcpservers.org/learn/chrome-webmcp` | third-party aggregator, not Chrome |
| `salamexperts.com/blog/ai/enable-webmcp-chrome` | third-party; claims "Chrome 146" |
| `webmcpverify.com/blog/chrome-146-webmcp-early-preview` | third-party; same 146 claim |
| `nerova.ai/news/...chrome-149-agent-websites-june-2026` | third-party commentary |
| `agentready.to/blog/webmcp-browser-support-tracker` | third-party tracker |
| `developer.chrome.com/docs/ai/webmcp?hl=zh-cn` (+de/fr/ar/id/ru/vi) | locale duplicates of row 1 |
| `chromestatus.com/feature/5117755740913664` (HTML) | JS shell, body empty (observed); replaced by `/api/v0/` JSON |
| `chromedevtools.github.io/devtools-protocol/tot/WebMCP/` | HTTP body is only a redirect stub; replaced by protocol JSON/PDL |
| Google Docs dev-trial / OT instruction docs (`docs.google.com/document/d/1ZaQvuj…`, `1rtU1fRPS0b…`) | linked from Chrome Status as `devtrial_instructions`; auth-gated, not opened |
| `developer.chrome.com/release-notes/149` | **opened**, see §5 — it does *not* mention WebMCP |

## 3. Pages opened (fetch method: `read` tool, native HTTP)

### 3.1 `https://developer.chrome.com/docs/ai/webmcp` — "WebMCP | AI in Chrome"
Published **2026-05-18**, last updated **2026-10-07**.

- **Chrome milestone / OT**: "Join the WebMCP origin trial from Chrome 149." — section `## Get started`.
- **Local flag (the documented one)**: `chrome://flags/#enable-webmcp-testing`, set **Enabled**, relaunch —
  section `### Local WebMCP` ("Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`").
- **Permissions gate**: "Both APIs are gated by the `tools` Permissions Policy." Policy "defaults to `self`" —
  section `### Permissions policy`.
- **Limitations (relevant to C2's claim bounds)**: section `### Limitations` says headless use "may be possible"
  but the API "is primarily designed for local browser workflows with a human in the loop" (paraphrase of the
  bullet, 24 words verbatim: "While it may be possible to run WebMCP tools in headless environments, this API is
  primarily designed for local browser workflows with a human in the loop.").
- Links out: OT registration `origintrials/#/register_trial/4163014905550602241`, Chromium
  `chromestatus.com/feature/5117755740913664`, bug component `2021259`.

### 3.2 `https://developer.chrome.com/docs/ai/webmcp/imperative-api` — "Imperative API"
Published **2026-05-18**, last updated **2026-10-16**.

- **API surface is `document.modelContext`**, never `navigator.modelContext`, on this page:
  "Use the `modelContext` interface to register tools." — section `## Provide model context`.
  Code in sections `### WebMCPza Maker`, `### Get order status`, `### Tool annotations (optional)`,
  `### Handle tool cancellation` is uniformly `await document.modelContext.registerTool({…})`.
- **Named members**: `registerTool(tool, {signal})`, `getTools({fromOrigins})`, `executeTool(tool, input, {signal})`,
  `annotations` = `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, `debugging`; event `toolchange`;
  cross-origin `exposedTo`.
- **Version-scoped statements**:
  - "As of Chrome 153, you can unregister a tool without cancelling and breaking in-flight executions."
    — section `### Unregister tools`.
  - "`debugging` (boolean, defaults to `false`, available from Chrome 156)" — section `### Tool annotations (optional)`.
  - "This asynchronous method returns an alphabetically ordered list of tools" — section `## Discover tools`.

### 3.3 `https://developer.chrome.com/docs/ai/webmcp/declarative-api` — "Declarative API"
Published **2026-05-18**, last updated **2026-09-25**.

- **Form annotations named**: `toolname`, `tooldescription`, `toolparamdescription`, `toolautosubmit` —
  section `## Tool registration` and `### (Optional) Tool parameters`.
- **Lifecycle**: "If you remove either the `toolname` or `tooldescription` HTML attribute, the tool is unregistered."
  — section `## Tool registration` (16 words).
- **Events on `document.modelContext`**: "This fires on the `document.modelContext` once form fields are pre-filled."
  (`toolactivated`) — section `### Submit the form`; `toolcancel` fires on cancel/reset.
- **Submit hook**: "The `SubmitEvent` interface introduces the `agentInvoked` boolean attribute." and
  `respondWith(Promise<any>)` — same section.
- **CSS**: `:tool-form-active` on the form, `:tool-submit-active` on the submit button — section
  `## Modify focus indicator`.

### 3.4 `https://developer.chrome.com/blog/new-in-devtools-149` — "What's new in DevTools (Chrome 149)"
Published **2026-06-02**.

- **Two flags named here, and only here**: "Enable the `#devtools-webmcp-support` and `#enable-webmcp-testing`
  flags on chrome://flags to start experimenting." — section `## WebMCP` (15 words).
- Panel description: inspect client-side tools/schemas, manual run with custom parameters, filter invocation
  events, monitor return payloads. Chromium issue `494516094`.

### 3.5 `https://developer.chrome.com/docs/devtools/application/webmcp` — "Debug WebMCP tools"
Last updated **2026-05-12** (no published date on page).

- WebMCP **pane inside the Application panel**; "Invoked Tools" / "Available Tools"; per-tool invocation counter;
  filters by status and by **Declarative / Imperative**.
- DevTools-for-agents command: `--categoryExperimentalWebmcp` — section `### Command-line flags`;
  tools `list_webmcp_tools` and `execute_webmcp_tool` ("turned off by default").

### 3.6 `https://developer.chrome.com/docs/devtools/agents/webmcp-debugging`
Last updated **2026-09-23**. **Shared with `TabiR16.SrcAgentsDocs-5` (its F5, S021 child nav) — one SOURCES row,
not two.** Their independent byte/hash/JSON-LD readings agree with this session's date.

- "This feature requires Chrome 149+ with WebMCP features enabled." — section
  `When working with WebMCP, keep the following in mind:`.
- Same `--categoryExperimentalWebmcp` requirement; points at the OT or the local flag.

### 3.7 `https://developer.chrome.com/blog/webmcp-epp` — "WebMCP is available for early preview"
Published **2026-02-10**. **No milestone and no flag string on this page.**
"WebMCP is available for prototyping to early preview program participants." — section
`## Join the early preview program`. Names the two APIs (Declarative = HTML forms, Imperative = JavaScript).

### 3.8 `https://developer.chrome.com/blog/ai-webmcp-origin-trial` — "Join the WebMCP origin trial"
Published **2026-06-09**. "In Chrome 149, you can sign up for the WebMCP origin trial." — lead paragraph.

### 3.9 `https://developer.chrome.com/blog/agent-ready-toolkit` — "A developer toolkit…"
Published **2026-06-22**. Lighthouse **Agentic browsing** category "available starting from M150"; its WebMCP
audits "Check for the availability of registered WebMCP tools, forms missing declarative WebMCP, and schema
validity" — section `### Audit your website agentic-readiness`. Uses `--categoryExperimentalWebmcp` + `--channel=canary`.

## 4. Chrome Status (machine-readable) — `https://chromestatus.com/api/v0/features/5117755740913664`
Fetch: `read` tool, `application/json` (the HTML page is an empty JS shell). `updated.when = 2026-09-28`.

| Field | Value (verbatim) |
|---|---|
| `name` | `WebMCP` |
| `web_feature` | **`document-modelcontext`** |
| `flag_name` | `Experimental Web Platform features` |
| `finch_name` | `WebMCP` |
| `origin_trial_id` (stage 150) | `4163014905550602241`, `ot_chromium_trial_name: "WebMCP"` |
| `ot_use_counter_bucket_number` / `ot_webfeature_use_counter` | `5791` / `kModelContextRegisterTool` |
| dev-trial stage (130) `desktop_first`/`android_first` | **146** / 146 |
| OT stage (150) `desktop_first` / `desktop_last` | **149** / 156 |
| OT extension stage (151) `desktop_last` | **162** |
| `debuggability` | "Explicit debugging support through a new WebMCP Chrome DevTools Protocol domain." … "Registration issues for declarative tools (e.g., missing names or descriptions) are reported through the Audits domain." |

`debuggability` is the primary-source justification for the C2 harness design (WebMCP domain + `Audits.issueAdded`).

## 5. Chrome 149 release notes — an observed absence
`https://developer.chrome.com/release-notes/149`, stable **2026-06-02**. The `## New origin trials` section lists
**Gamepad event-driven input API**, **Permissions Policy: `focus-without-user-activation`**, **WebAssembly custom
descriptors** — **WebMCP is not listed**. WebMCP's OT is documented on the product page/blog and the OT registry,
not in the milestone release notes; do not cite release notes for the WebMCP milestone.

## 6. Chromium source, pinned at `refs/tags/154.0.8037.97`
Fetch: `curl` on gitiles `?format=TEXT` → `base64 -d` → `grep` (200 OK, byte sizes noted). These bind the
documented `chrome://flags` names to the actual feature strings used by `--enable-features`/`--enable-blink-features`.

| Anchor | Content (verbatim) |
|---|---|
| `chrome/browser/about_flags.cc:13016-13018` | `{"devtools-webmcp-support", flag_descriptions::kDevToolsWebMCPSupportName, … FEATURE_VALUE_TYPE(blink::features::kDevToolsWebMCPSupport)},` |
| `chrome/browser/about_flags.cc:13058-13060` | `{"enable-webmcp-testing", flag_descriptions::kWebMCPName, … FEATURE_VALUE_TYPE(blink::features::kWebMCP)},` |
| `chrome/browser/flag_descriptions.h:3525-3526` | `kWebMCPName[] = "WebMCP for testing"`, `kWebMCPDescription[] = "Enables the WebMCP API."` |
| `chrome/browser/flag_descriptions.h:2179-2182` | `kDevToolsWebMCPSupportName[] = "WebMCP support in DevTools"` |
| `third_party/blink/common/features.cc:571` | `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);` |
| `third_party/blink/renderer/platform/runtime_enabled_features.json5:7023-7035` | `name: "WebMCP"`, `origin_trial_feature_name: "WebMCP"`, `origin_trial_allows_third_party: true`, `public: true`, `base_feature_status: "enabled"`, `copied_from_base_feature_if: "overridden"`, `implied_by: ["WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting"]`, `status: "experimental"` |
| same file `:7037-7050` | `WebMCPDeclarativeFileInput` (`test`), `WebMCPFormAssociatedCustomElements` (`experimental`), `WebMCPTesting` (`experimental`) |
| `third_party/blink/public/devtools_protocol/browser_protocol.pdl:62` | `include domains/WebMCP.pdl` |
| `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (123 lines) | see §6.1 |

### 6.1 CDP `WebMCP` domain at 154 (verbatim structure)
- `experimental domain WebMCP`, `depends on Runtime / Page / DOM`.
- `type Annotation { optional boolean readOnly, untrustedContent, consequential, autosubmit }`
  (`autosubmit` comment: "If the declarative tool was declared with the autosubmit attribute.").
- `type InvocationStatus` = `Completed | Canceled | Error`.
- `type Tool { string name, string description, optional object inputSchema, optional Annotation annotations,
  Page.FrameId frameId, optional DOM.BackendNodeId backendNodeId, optional Runtime.StackTrace stackTrace }`.
- commands: `enable`, `disable`, `invokeTool {frameId, toolName, input} -> invocationId`, `cancelInvocation {invocationId}`.
- events: `toolsAdded {tools}`, `toolsRemoved {RemovedTool[]}`, `toolInvoked {toolName, frameId, invocationId, input}`,
  `toolResponded {invocationId, status, optional any output, optional string errorText, optional Runtime.RemoteObject exception}`.
- `command enable` quote (13 words): "Enabling the domain will trigger a toolsAdded event for all currently registered tools."
  → **harness ordering matters**: attach+enable after load still yields the initial `toolsAdded`; do not assume the
  event only fires on later registrations.

## 7. What this settles for C2 (and what it does not)

**Settled, from sources opened here**
1. Chrome's own docs consistently use `document.modelContext`; `navigator.modelContext` appears on **none** of the
   pages opened. Chrome Status names the web feature **`document-modelcontext`**. L1's probe (`'modelContext' in
   navigator === false`, `document.modelContext` present) is the *documented* surface, not an anomaly to explain.
2. The documented enablement for local dev is `chrome://flags/#enable-webmcp-testing` → `blink::features::kWebMCP`
   → Blink runtime feature `WebMCP` (`status: experimental`, `base_feature_status: enabled`). The CDP domain is
   separately gated by `kDevToolsWebMCPSupport`, which is **ENABLED_BY_DEFAULT at 154** — so a 154 run needs only
   the WebMCP feature, not the DevTools one.
3. `WebMCPTesting` **implies** `WebMCP` at 154 (`implied_by`), so `--enable-blink-features=WebMCPTesting` alone is
   sufficient; the pair used by L1 is redundant but harmless.
4. `WebMCP.enable` semantics, the four events, and the tool shape (incl. `backendNodeId` for declarative tools) are
   protocol-level facts at 154, matching L1's observed `WebMCP.toolsAdded` payload.
5. Declarative field naming in the **protocol** is `annotations.readOnly|untrustedContent|consequential|autosubmit`,
   while the **docs** use `readOnlyHint|untrustedContentHint|consequentialHint|debugging`. Do not translate names
   across the boundary without an observation.

**Not settled / remaining unknowns**
- No IDL found at 154 under `third_party/blink/renderer/modules/` or `core/frame/` (directory listings grepped for
  `model*`/`webmcp` returned nothing; `core/dom/document.idl` has no `modelContext`). The `partial interface Document`
  home (likely a generated/`*.idl` in a directory I did not enumerate) was not located. The Document-scoping claim
  rests on docs + `document-modelcontext` + probe, not on IDL.
- `kDeclarativeWebmcp` (seen by L1 as a binary string) was **not** found in
  `third_party/blink/common/features.cc` or `runtime_enabled_features.json5` at 154 by case-insensitive grep. It may be
  a `base::Feature` in a file I did not open, or a stale string. Unresolved, not a contradiction.
- At **main** (Oct 2026) `about_flags.cc` carries only `enable-webmcp-testing`; `devtools-webmcp-support` is absent.
  At 154 both exist. The DevTools flag documented in the Chrome 149 post is therefore not guaranteed in later
  milestones — flag presence must be re-checked per milestone, never assumed.
- Chrome's docs do **not** name `--enable-features=…`/`--enable-blink-features=…` at all. The command-line strings in
  the C2 harness are sourced from `about_flags.cc`/`runtime_enabled_features.json5`, not from Chrome docs; the note
  should attribute them that way.
- The early-preview page names no milestone; the `146` dev-trial milestone comes only from Chrome Status stage 130.

## 8. Citation-ready rows (URL + access 2026-10-20 + ≤25-word quote + section + method)

1. `https://developer.chrome.com/docs/ai/webmcp` — "Join the WebMCP origin trial from Chrome 149." `## Get started`. native.
2. `https://developer.chrome.com/docs/ai/webmcp` — "Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`" `### Local WebMCP`. native.
3. `https://developer.chrome.com/docs/ai/webmcp` — "Both APIs are gated by the `tools` Permissions Policy." `### Permissions policy`. native.
4. `https://developer.chrome.com/docs/ai/webmcp/imperative-api` — "Use the `modelContext` interface to register tools." `## Provide model context`. native.
5. `https://developer.chrome.com/docs/ai/webmcp/imperative-api` — "As of Chrome 153, you can unregister a tool without cancelling and breaking in-flight executions." `### Unregister tools`. native.
6. `https://developer.chrome.com/docs/ai/webmcp/imperative-api` — "`debugging` (boolean, defaults to `false`, available from Chrome 156)" `### Tool annotations (optional)`. native.
7. `https://developer.chrome.com/docs/ai/webmcp/declarative-api` — "If you remove either the `toolname` or `tooldescription` HTML attribute, the tool is unregistered." `## Tool registration`. native.
8. `https://developer.chrome.com/docs/ai/webmcp/declarative-api` — "This fires on the `document.modelContext` once form fields are pre-filled." `### Submit the form`. native.
9. `https://developer.chrome.com/blog/new-in-devtools-149` — "Enable the `#devtools-webmcp-support` and `#enable-webmcp-testing` flags on chrome://flags to start experimenting." `## WebMCP`. native.
10. `https://developer.chrome.com/docs/devtools/agents/webmcp-debugging` — "This feature requires Chrome 149+ with WebMCP features enabled." `When working with WebMCP…`. native. **(shared with SrcAgentsDocs-5 F5 — emit one row only)**
11. `https://developer.chrome.com/blog/webmcp-epp` — "WebMCP is available for prototyping to early preview program participants." `## Join the early preview program`. native.
12. `https://developer.chrome.com/blog/ai-webmcp-origin-trial` — "In Chrome 149, you can sign up for the WebMCP origin trial." lead. native.
13. `https://chromestatus.com/api/v0/features/5117755740913664` — `"web_feature": "document-modelcontext"` and `"desktop_first": 149, "desktop_last": 156`. native JSON.
14. `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` — "Enabling the domain will trigger a toolsAdded event for all currently registered tools." `command enable`. curl+base64+grep.
15. `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/browser/flag_descriptions.h` — `"WebMCP for testing"` / `"Enables the WebMCP API."` lines 3525-3526. curl+base64+grep.

Suggested SOURCES row shape (L1 owns the file): one row per URL above, `access 2026-10-20`, method as listed,
"used by" = the C2 knowledge note section it backs. The four strongest new rows are #1/#4 (Document scope + milestone),
#9/#14 (DevTools flag + CDP domain), #13 (machine-readable milestone/OT window).

## 9. Tooling
No installs, no upgrades, no pacman/uv/npm transactions this session. Scratch used: `/tmp/srcchrome.*`, `/tmp/*.b64`,
`/tmp/t.txt`, `/tmp/mod.json`, `/tmp/ref.json5` — all outside the lane and outside the fleet repo; nothing written in
`tabi-shokunin` except this report.
