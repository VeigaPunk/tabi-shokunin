# RevengeDevtoolsFrontend — DevTools frontend WebMCP panel/model (C2, wave 1)

Seat: `TabiR16.RevengeDevtoolsFrontend-5` (leaf, read-only). Date: 2026-10-20.
Scope: how Chrome DevTools frontend consumes the `WebMCP` CDP domain (`toolsAdded` / `toolsRemoved` /
`toolInvoked` / `toolResponded`, plus `enable` / `invokeTool` / `cancelInvocation`).
No writes outside this report. No browser/DevTools launch, no harness run, no gates or counters run.
Report is author-side advice; L1 re-verifies.

## 0. Answer for L1 (short)

- The frontend has a first-class WebMCP surface: SDK model `front_end/models/web_mcp/WebMCPModel.ts`
  and Application (Resources) panel view `front_end/panels/application/WebMCPView.ts`, entered from the
  sidebar tree element `WebMCPTreeElement.ts` labelled `WebMCP` with URL `webMcp://`.
- It consumes **only CDP**: the `WebMCP` domain for tools/invocations, plus `Audits` generic issues for
  malformed declarative forms (§3b). There is no `navigator.modelContext` reference; the only
  `modelContext` matches in a repo code search are three issue-code plumbing files
  (`models/issues_manager/GenericIssue.ts`, its `BUILD.gn`, `devtools_grd_files.gni`), i.e. string/enum
  plumbing, not the page JS API. Any claim of the form "DevTools observes the page JS API" is unsupported.
- Event→UI contract: `toolsAdded` populates the tool registry; `toolsRemoved` deletes; `toolInvoked`
  creates a *pending* call row; `toolResponded` attaches status/output/errorText/exception. Calls are
  never replayed (no history command), so a client that enables late sees the current tool catalog but
  **not** past invocations.
- Declarative-form defects are reported through a second CDP channel — `Audits.issueAdded` with
  `GenericIssueErrorType.FormModelContext*` (PAGE_ERROR) rendered in the Issues panel — and produce no
  `WebMCP` event (§3b).
- Registry keying is `(frameId → name)`, so same-named tools in different frames coexist and a
  re-registration of the same name in the same frame silently replaces the prior `Tool` object.
- Shipped Chromium 154 gate: both the model capability and the sidebar entry are behind
  `Root.Runtime.hostConfig.devToolsWebMCPSupport?.enabled`, fed from
  `blink::features::kDevToolsWebMCPSupport` (enabled-by-default at the 154 tag). Main (post-154) deleted
  that gate, so the same panel is unconditional there. The r16 pre-probe's `--enable-features=DevToolsWebMCPSupport`
  is therefore redundant on 154 but harmless.
- Because the model is `autostart: true` and its constructor calls `void this.enable()` (WebMCPModel.ts:165),
  attaching the DevTools frontend itself enables the domain and triggers the `toolsAdded` snapshot
  described by the protocol ("Enabling the domain will trigger a toolsAdded event for all currently
  registered tools", protocol-mapping pin:5287-5288). A CDP harness that enables the domain after page
  load can rely on the same snapshot behavior.

## 1. Pins used

| Purpose | Revision | How obtained |
|---|---|---|
| devtools-frontend main HEAD (analysis target) | `24a6a013f8b16cc19dd99f2631aaf63d4fb6955d` (2026-10-20T14:24:43Z, "Move UI code to sources panel") | `gh api repos/ChromeDevTools/devtools-frontend/commits/main --jq .sha` |
| Shipped frontend for Chromium `154.0.8037.97` | `66df492aaa0129d090937e933dd44c5389ab24d2` (branch `chromium/8037` head, 2026-09-15T12:04:02Z) | `curl .../chromium/chromium/154.0.8037.97/DEPS` → line 424 `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',`; `gh api repos/.../branches/chromium%2F8037` returns the same sha |
| Shipped browser protocol | `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` @ `154.0.8037.97` | raw fetch, 3969 bytes |
| devtools-protocol master (cross-check only) | `95b1af69d6a20161dc3558f8e38366b7fa7a27d1` | `gh api repos/ChromeDevTools/devtools-protocol/commits/master --jq .sha` |

Artifact digests (sha256):

```
c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632  WebMCPModel.ts            (IDENTICAL at 66df492 and 24a6a01)
4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f  WebMCPView.ts             (66df492, 1515 lines)
2f7b596e963c1f5dbc872b75f31484eb120897688b31c1ddcd7e821bb66fb4bf  WebMCPView.ts             (24a6a01, 1520 lines)
73aee9bf7b130b506a0940ce40f8a99340bb7ef8b78c3645f9932806596da9ae  WebMCPTreeElement.ts      (66df492)
05070fbaa5ea86b842eb4fbf74cf30f9656dc27342452b1c712b14635aa7c7b1  ApplicationPanelSidebar.ts (66df492)
7f5de8ce31799b1099661befdfde8a00b264d12e1e5de2f1e0be9a9f5665f387  core/sdk/Target.ts        (66df492)
8df118a9595f53ea890c40b5496ab0ebd0e6873988d5cfef1c296e9212316c47  generated/protocol-mapping.d.ts (66df492)
dc7480b404b784db04b7fb1d1f9c1f9db81d60e7bc044b57657eba0b2a44f368  generated/protocol-mapping.d.ts (24a6a01)
26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff  domains/WebMCP.pdl        (154.0.8037.97)
```

`WebMCPModel.ts` is byte-identical between the shipped 154 pin and main HEAD; `WebMCPView.ts` differs by
286 diff lines: i18n comment/string capitalization (`Available Tools` → `Available tools`, `Run Tool` →
`Run tool`, `In Progress` → `In progress`), Lit attribute renames (`sidebar-visibility=` → `show=`, tab
`title=` → `label=`), the added `pasteTooltip` string, and one constructor parameter type annotation.
**No behavioral change** between 154 and HEAD in the view either (verified by `diff -q` and reading all
six hunks).

## 2. Model contract (anchors are shared by both pins)

`front_end/models/web_mcp/WebMCPModel.ts`:

- `14-19` `Events` enum: `TOOLS_ADDED='ToolsAdded'`, `TOOLS_REMOVED`, `TOOL_INVOKED`, `TOOL_RESPONDED`
  (internal event names, not protocol names).
- `21-51` `Result` wraps `status` (`Protocol.WebMCP.InvocationStatus`), `output`, `errorText`, and a private
  `Runtime.RemoteObject` exception; `symbolizedError` lazily calls
  `Bindings.DebuggerWorkspaceBinding.createSymbolizedError(exception)`.
- `53-59` `Call = {invocationId, tool, input, result?, cancel}`.
- `61-139` `Tool`:
  - `80` `name`, `84` `description`;
  - `88-98` `inputSchema` — if the protocol value is a **string**, `JSON.parse` it, falling back to `{}`;
    non-object → `{}`;
  - `100-109` `flags` — keys of `annotations` whose value is `true`, **sorted alphabetically**;
  - `111-116` `frame` — `ResourceTreeModel.frameForId(tool.frameId)`;
  - `118-120` `isDeclarative` — exactly `Boolean(backendNodeId)`;
  - `122-126` `node` — `DeferredDOMNode(target, backendNodeId)`;
  - `128-139` `invoke(input)` → `target.webMCPAgent().invoke_invokeTool({toolName, frameId, input})`,
    returns `response.invocationId` or `undefined` on error.
- `141-146` `EventTypes`: added/removed carry `readonly Tool[]`; invoked/responded carry `Call`.
- `149` `#tools: Map<FrameId, Map<name, Tool>>`; `150` `#calls: Map<invocationId, Call>`; `152` `#enabled`.
- `154-166` constructor: registers the dispatcher, listens for `RuntimeModel.Events.ExecutionContextDestroyed`,
  then `void this.enable()`.
- `168-182` `tools` (flattened iterator), `toolCalls`, `toolCallForId`, `clearCalls`.
- `184-190` `enable()` is one-shot per model instance (`#enabled` guard); calls `agent.invoke_enable()` with
  no params.
- `192-203` `#executionContextDestroyed`: **only** when the destroyed context `isDefault` and has a `frameId`,
  delete that frame's entire tool map and dispatch `TOOLS_REMOVED` with the removed `Tool[]`.
- `204-215` `toolsRemoved`: for each `{name, frameId}` (`RemovedTool`), look up and delete; dispatch with the
  found tools (unknown pairs are ignored; event fires even if the array is empty of matches).
- `216-229` `toolsAdded`: for each `Tool`, create the frame map if needed, `frameTools.set(tool.name, tool)`
  (overwrite on name collision), dispatch with the newly constructed `Tool[]`.
- `230-248` `toolInvoked`: resolve `(params.frameId, params.toolName)`; **return silently if not found**;
  build `Call` with `input: params.input` (string) and `cancel` that calls
  `invoke_cancelInvocation({invocationId})` only when `call.result === undefined`; store and dispatch.
- `249-259` `toolResponded`: resolve `#calls.get(params.invocationId)`; **drop if unknown**; set
  `call.result = new Result(status, output, errorText, exception remote object)`; dispatch.
- `261` `SDK.SDKModel.SDKModel.register(WebMCPModel, {capabilities: SDK.Target.Capability.WEB_MCP, autostart: true});`

Agent accessor: `front_end/core/protocol_client/InspectorBackend.ts:503-505`
`webMCPAgent(): ProtocolProxyApi.WebMCPApi { return this.getAgent('WebMCP'); }`.

The frontend **never** calls `invoke_disable` (grep over `models/web_mcp` and `panels/application/WebMCPView.ts`
returns no hits); `cancelInvocation` is only reachable through a call row's context menu.

## 3. Panel placement and gating

- Sidebar entry (shipped 154, `ApplicationPanelSidebar.ts:384-387`):
  ```ts
  if (Root.Runtime.hostConfig.devToolsWebMCPSupport?.enabled) {
    this.webMcpTreeElement = new WebMCPTreeElement(panel);
    this.applicationTreeElement.appendChild(this.webMcpTreeElement);
  }
  ```
  Field declared at `340`; same file at HEAD (`381-382`) is **unconditional**.
- HostConfig key declared at `front_end/core/root/Runtime.ts:602` in the 154 pin
  (`devToolsWebMCPSupport: DevToolsWebMCPSupport,`); at HEAD `grep -c devToolsWebMCPSupport Runtime.ts` = `0`.
- Capability gate (`core/sdk/Target.ts:54-56` at 154):
  ```ts
  if (Root.Runtime.hostConfig.devToolsWebMCPSupport?.enabled) {
    this.#capabilitiesMask |= Capability.WEB_MCP;
  }
  ```
  at HEAD `Target.ts:55` it is part of the unconditional `Type.FRAME` mask:
  `... | Capability.DOM_STORAGE | Capability.WEB_MCP;` (`Capability.WEB_MCP = 1 << 21`, `Target.ts:321` at pin).
  Only `Type.FRAME` targets get it; workers/service workers do not.
- Browser side of the gate, Chromium `154.0.8037.97`:
  - `chrome/browser/devtools/devtools_ui_bindings.cc:2273-2277` sets
    `"devToolsWebMCPSupport"` `{"enabled": base::FeatureList::IsEnabled(blink::features::kDevToolsWebMCPSupport)}`.
  - `third_party/blink/common/features.cc:571`
    `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);`
    → on 154 the DevTools panel/model are on by default; `--enable-features=DevToolsWebMCPSupport` is redundant.
- Gate removal provenance: commit `f30a1d78b7af83c6b2911189052de2a42a4c8854` "Delete webmcp feature flag"
  (2026-09-02, `Reviewed-on: .../+/8331533`) removes the `DevToolsWebMCPSupport` host-config interface, the
  `Runtime.ts` entry, the two conditionals in `Target.ts`/`ApplicationPanelSidebar.ts`, and 18 lines of
  `WebMCPView.test.ts`. Compare API `f30a1d78b7af...66df492aaa01` → `status=diverged, ahead_by=5, behind_by=114`,
  i.e. the deletion is **not** in the 154 pin. So: 154 = gated (default on); main/155+ = ungated.
- Tree element (`WebMCPTreeElement.ts:14-40` at pin): title `'WebMCP'` (`18`), icon `document`, optional
  "New" badge via `UI.UIUtils.maybeCreateNewBadge('web-mcp')` (`21`; `UIUtils.ts:1907-1917` uses
  `PromotionManager`, not an experiment flag), `itemURL` = `'webMcp://'` (`30-31`), view created lazily on
  first `onselect` (`34-39`), `UIUserMetrics.panelShown('web-mcp')`.
- Visual-logging context `'web-mcp'` is a registered value (`ui/visual_logging/KnownContextValues.ts:4603`).
- Packaging: `panels/application/BUILD.gn` (pin) lists `webMCPView.css` (`30`), `WebMCPTreeElement.ts` (`69`),
  `WebMCPView.ts` (`70`), test (`192`); `models/web_mcp/BUILD.gn` builds module `web_mcp` with
  `WebMCPModel.ts` and deps `core/common`, `core/sdk`, `generated`, `bindings`, `stack_trace`; the entrypoint
  barrel `web_mcp.ts` exports only `WebMCPModel`. `panels/application/application.ts` exports
  `WebMCPTreeElement` and `WebMCPView` (pin and HEAD).

### 3b. Second consumption channel: WebMCP generic issues (Issues panel)

DevTools does not only consume the `WebMCP` domain; malformed declarative definitions reach the Issues
panel through the `Audits` generic-issue pipeline, independent of `WebMCPView`.

- Shipped protocol `third_party/blink/public/devtools_protocol/domains/Audits.pdl:405-409` (Chromium
  `154.0.8037.97`) enumerates five `GenericIssueErrorType` values:
  `FormModelContextParameterMissingTitleAndDescription`, `FormModelContextMissingToolName`,
  `FormModelContextMissingToolDescription`, `FormModelContextRequiredParameterMissingName`,
  `FormModelContextParameterMissingName`.
- Shipped frontend `front_end/models/issues_manager/GenericIssue.ts` maps each to a LazyMarkdownIssueDescription
  (definitions `221-247`, protocol-enum mapping `291-308`) and registers all five as
  `IssueKind.PAGE_ERROR` (`326-330`). The five markdown files exist at the pin (each HTTP 200), e.g.
  `genericFormModelContextMissingToolName.md`: "provide a tool name via the `toolname` attribute."
- Consequence for the harness: a declarative `<form>` missing `toolname` is expected to produce
  `Audits.issueAdded` with `genericIssueDetails.errorType = "FormModelContextMissingToolName"` (exact
  wire enum name, PascalCase) and a page-error severity in DevTools. This is the only DevTools-visible
  diagnostic for that defect; the `WebMCP` domain itself emits no error/`toolsAdded` for it.
  The plan's case "malformed declarative form (no toolname) → no tool (+ issue if observed)" can
  therefore assert the issue positively when the browser emits it, while remaining robust if it does not.

## 4. View behavior (what a user/CDP-adjacent observer sees)

Shipped pin line anchors; HEAD line numbers differ by ≤5 after `1053`.

- Layout: main split view `webmcp-view`, left/main = call log, sidebar = tool list/details
  (`WebMCPView.ts:455-745` region at pin).
- Tool list header literal `'Available Tools'` (pin `47`; HEAD `'Available tools'` at `47`), empty states
  `'Available WebMCP Tools'` / `'Registered WebMCP tools for this page will appear here. No tools have been
  registered or detected yet.'`; call-log empty state `'Tool Activity'` / `'Start interacting with your WebMCP
  agent to see real-time tool calls and executions here.'`.
- Call log columns: `Name`, `Status`, `Input`, `Output`. Status text: `Completed`, `Error`, `Canceled`,
  `In Progress` (pin `144`/`pending`; HEAD lowercased) with `undefined` result = pending/watch icon.
  Output cell: `JSON.stringify(call.result.output)` when `output !== undefined`, else `result.errorText ?? ''`;
  `null` output therefore renders as the literal `null` (commit `bb3aa3d0477e` "Properly display null output").
  Input cell renders the **raw string** `call.input`.
- Filters: free text matches tool name, input string, `JSON.stringify(output)`, and `errorText`
  (`filterToolCalls`, pin `264-...`); dropdowns `Imperative`/`Declarative` (pin `124`/`128`) and
  `Completed`/`Error`/`Canceled`/`In Progress` (`statusTypes`), plus per-tool status icon buttons that set
  name+status filters; `Clear filters`; `Clear log` calls `model.clearCalls()` for every model (pin `877-881`).
- Details tabs: `webmcp.tool-details`, `webmcp.call-inputs`, `webmcp.call-outputs` (pin `237-241`).
  `Details` shows name, description, `Flags` (annotations), `Frame` link, and `Origin`:
  declarative → resolved DOM node + "View in Elements panel"; imperative → expandable stack trace
  (`ToolDetailsWidget`, HEAD `1131-1290`). Output tab passes `symbolizedError` from `Result` into
  `PayloadWidget` (HEAD `981-1130`), which also parses JSON-looking payloads for display.
- `Run tool`: JSON editor built from `tool.inputSchema` via `parseToolSchema` (HEAD `1293-1519`) into
  `ProtocolMonitor.JSONEditor` parameters/types/enums; `Paste` reads clipboard JSON (object only);
  submitting/`Run tool` calls `onRunTool` → `tool.invoke(parameters)` and then auto-selects the resulting
  call by `invocationId` (pin `942-957`; see `#lastDevToolsInvocationId` handling at `861-869`).
- Context menu on a call row: `Reveal tool`, `Edit and run`, and `Cancel` only while `result === undefined`
  (pin `531-535`). On a tool: `Copy name`, `Copy description`.
- `#getTools()` sorts loaded tools by `name.localeCompare` across all target models (pin `899-903`).

## 5. Harness-facing decision table (assert exactly this, from these events)

| Expected observable | Evidence source | Exact shape / caveat |
|---|---|---|
| Tool catalog after enabling the domain | `WebMCP.toolsAdded` (snapshot) | Protocol: enable triggers toolsAdded for all currently registered tools (`protocol-mapping.d.ts` pin `5287-5291`). Tool fields: `name`, `description`, optional `inputSchema` object, optional `annotations`, `frameId`, optional `backendNodeId`, optional `stackTrace` (`WebMCP.pdl:33-48`). |
| Declarative form tool | same event | Distinguisher is `backendNodeId` presence only; frontend `isDeclarative = Boolean(backendNodeId)` (model `118-120`). No separate "declarative" flag/event. |
| Malformed declarative form (missing `toolname`) | `Audits.issueAdded` generic issue, **not** the WebMCP domain | `genericIssueDetails.errorType = FormModelContextMissingToolName`, severity `IssueKind.PAGE_ERROR` (`GenericIssue.ts` pin `291-308`, `326-330`); no tool is added. |
| Imperative `document.modelContext` tool | same event | No `backendNodeId`; `stackTrace` normally present (`WebMCP.pdl:47-48`). |
| Tool removal / unregister / navigation | `WebMCP.toolsRemoved` | Payload is `RemovedTool` = `{name, frameId}` only (`WebMCP.pdl:83-91`), **not** full `Tool`. Frontend additionally synthesizes a batch removal for all of a frame's tools when that frame's *default* execution context is destroyed (model `192-203`; test "cleans up tools when the corresponding execution context is destroyed"). |
| Invocation start | `WebMCP.toolInvoked` | `{toolName, frameId, invocationId, input}` where `input` is a **string** (`WebMCP.pdl:98-107`), even though `invokeTool` takes an object. |
| Invocation end | `WebMCP.toolResponded` | `{invocationId, status, output?, errorText?, exception?}`; `status ∈ Completed|Canceled|Error` (`WebMCP.pdl:25-30`); `output` present only for `Completed` (`WebMCP.pdl:116-118`); `exception` is `Runtime.RemoteObject`. |
| DevTools-initiated invocation | `invokeTool` return | Returns `invocationId`, "Response is sent before tool events" (`WebMCP.pdl:58-69`); then `toolInvoked`/`toolResponded` arrive. |
| Invocation of an unknown/removed tool | `toolInvoked` may arrive | Frontend model drops it (no Call row, model `230-233`). A CDP harness can still see the raw event; don't use frontend behavior as a filtering rule. |
| `toolResponded` without prior `toolInvoked` | possible on wire | Frontend drops it (model `249-253`). No history/backfill command exists in the domain (only `enable`, `disable`, `invokeTool`, `cancelInvocation`). |
| Same tool name in two frames | both valid | Registry keyed `(frameId, name)` (model `149`, `216-229`). |
| Re-register same name in same frame | `toolsAdded` again | Map overwritten; UI receives the new `Tool`; no explicit "replaced" signal. |
| DevTools frontend attached | implicit `WebMCP.enable` | Model capability `WEB_MCP` + `autostart: true` (`Target.ts` pin `54-56`, model `261`), constructor calls `void this.enable()` (`165`). On 154 this only happens when `DevToolsWebMCPSupport` is enabled (default true). |

## 6. Divergences, limits, inference

- **154 vs main flag divergence** (verified, not inference): 154 pin gates model+panel on
  `DevToolsWebMCPSupport`; main removed the flag in `f30a1d78b7af` and the 154 branch does not contain it
  (`compare` = diverged). Tests in the pin also set the host config: `WebMCPView.test.ts` at 66df492 has
  17 `updateHostConfig({devToolsWebMCPSupport: {enabled: true}})` calls, and `f30a1d78b7af` deletes 18
  lines from that file (`+0 -18`).
- **`inputSchema` type**: shipped PDL says `optional object` (`WebMCP.pdl:40`), but the frontend defensively
  accepts a JSON **string** and parses it (model `88-98`). That branch has no protocol basis in 154; do not
  assert string-form `inputSchema` from this code alone. `[INFERENCE]` It is legacy tolerance.
- **Annotations**: 154 PDL has four (`readOnly`, `untrustedContent`, `consequential`, `autosubmit`,
  `WebMCP.pdl:12-23`). devtools-protocol master adds `debugging`. A 154-era test should not assert `debugging`
  even though main's frontend `flags` getter would render it if the protocol type had it.
- **Panel observability**: DevTools exposes no CDP command to query or drive its own WebMCP panel; the panel
  is a consumer, not an oracle. `[INFERENCE]` Asserting UI behavior requires driving the frontend (screenshot/
  e2e), which this round does not do.
- **`toolsAdded` on enable is a snapshot, not a diff**: re-enabling after `disable` would re-emit; the
  frontend never disables, and its `#enabled` guard prevents re-enable per target.
- **Calls are volatile**: `clearCalls()` only drops the frontend's log; nothing on the browser side is cleared.
- **Prompt-injection warning is protocol text**: `toolResponded.output` is explicitly untrusted
  (`WebMCP.pdl:116-118`). A knowledge note quoting the panel should carry that caveat.
- **Local binary corroboration (partial, not proof of frontend packaging)**: `strings -a /usr/lib/chromium/chromium`
  yields `WebMCP`, `WebMCP.invokeTool`, `WebMCP.toolsAdded`, `WebMCP.toolsRemoved`, `WebMCP.toolInvoked`,
  `WebMCP.toolResponded`, `cancelInvocation`, `kDevToolsWebMCPSupport`, `devToolsWebMCPSupport`,
  `Enables WebMCP support in DevTools.`, `WebMCP domain is not enabled`. `/usr/lib/chromium/resources.pak`
  contains no plaintext even for `devtools`/`Console` (entries are compressed), so a negative string scan there
  proves nothing; I did not extract the pak. `[INFERENCE]` the Arch 154 package ships this frontend per the
  DEPS pin + default-on gate, but I did not observe the panel.

## 7. Opened-source evidence (all opened this session, access date 2026-10-20)

| # | URL (fetch method) | Located quote (≤25 words) |
|---|---|---|
| E1 | `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/DEPS` via `curl -sSfL` | line 424: `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` |
| E2 | `raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492.../front_end/models/web_mcp/WebMCPModel.ts` via `curl` | line 261: `SDK.SDKModel.SDKModel.register(WebMCPModel, {capabilities: SDK.Target.Capability.WEB_MCP, autostart: true});` |
| E3 | same file, line 165 | `void this.enable();` |
| E4 | same file, lines 216-229 | `frameTools.set(tool.name, tool);` / `addedTools.push(tool);` |
| E5 | `.../front_end/panels/application/ApplicationPanelSidebar.ts` @ 66df492 | line 384: `if (Root.Runtime.hostConfig.devToolsWebMCPSupport?.enabled) {` |
| E6 | `.../front_end/core/sdk/Target.ts` @ 66df492 | lines 55-56: `if (Root.Runtime.hostConfig.devToolsWebMCPSupport?.enabled) { this.#capabilitiesMask |= Capability.WEB_MCP; }` |
| E7 | `.../front_end/generated/protocol-mapping.d.ts` @ 66df492 | lines 5287-5288: "Enabling the domain will trigger a toolsAdded event for all currently registered tools." |
| E8 | `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` via `curl` (3969 bytes) | line 7: `experimental domain WebMCP`; lines 51-52: "Enabling the domain will trigger a toolsAdded event for all currently registered tools."; line 116: "Missing if `status` is anything other than Completed." |
| E9 | `.../chrome/browser/devtools/devtools_ui_bindings.cc` @ 154.0.8037.97 | lines 2274-2277: `"devToolsWebMCPSupport"` … `base::FeatureList::IsEnabled(blink::features::kDevToolsWebMCPSupport)` |
| E10 | `.../third_party/blink/common/features.cc` @ 154.0.8037.97 | line 571: `BASE_FEATURE(kDevToolsWebMCPSupport, base::FEATURE_ENABLED_BY_DEFAULT);` |
| E11 | `gh api repos/ChromeDevTools/devtools-frontend/commits/f30a1d78b7af` | message `Delete webmcp feature flag`; files `Runtime.ts`, `Target.ts`, `ApplicationPanelSidebar.ts`, two tests |
| E12 | `gh api -X GET search/commits -f q="repo:ChromeDevTools/devtools-frontend WebMCP"` | total 40; e.g. `ad7cc839bb76 [webmcp] Add a webmcp view to the Application panel` (2026-03-26), `76779fd73803 [webmcp] Add model skeleton` (2026-03-23) |
| E13 | `gh api -X GET search/code -f q="WebMCP repo:ChromeDevTools/devtools-frontend"` | total 26; includes `models/web_mcp/WebMCPModel.ts`, `panels/application/WebMCPView.ts`, `WebMCPTreeElement.ts`, 5 issue descriptions, `generated/protocol-mapping.d.ts` |
| E14 | `.../third_party/blink/renderer/platform/runtime_enabled_features.json5` @ 154.0.8037.97 | lines 7023-7036: `name: "WebMCP", origin_trial_feature_name: "WebMCP", ... status: "experimental"` (context only; browser side) |
| E15 | `.../front_end/models/issues_manager/GenericIssue.ts` @ 66df492 via `curl` | lines 221-242: five `genericFormModelContext*` LazyMarkdownIssueDescription definitions |
| E16 | same file, line 291 | `Protocol.Audits.GenericIssueErrorType.FormModelContextMissingToolName,` (mapping block `291-308`; PAGE_ERROR registrations `326-330`) |
| E17 | `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Audits.pdl` via `curl` | lines 405-409: `FormModelContextParameterMissingTitleAndDescription` … `FormModelContextParameterMissingName` |
| E18 | `.../front_end/models/issues_manager/descriptions/genericFormModelContextMissingToolName.md` @ 66df492 (HTTP 200) | "This form is intended to be used as a WebMCP declarative tool definition, but it doesn’t specify a name." |

`README`-level note for L1: E1/E2/E4/E5/E6/E7/E8/E12/E13/E15/E16/E17/E18 are opened primary devtools/protocol
sources and can back new "DevTools frontend consumes WebMCP over CDP" and "declarative-form issues" source
rows. E9/E10 are Chromium browser-side evidence for the flag gate (sibling `SrcChromiumPdl-5` owns the PDL
row; coordinate rather than double-row).

## 8. Commands run and observed outputs (selected, verbatim)

```
$ gh api -X GET search/code -f q="WebMCP repo:ChromeDevTools/devtools-frontend" --jq '.total_count, (.items[]|"\(.path)  \(.sha)")'
26
front_end/models/web_mcp/WebMCPModel.ts  61df033d...
front_end/panels/application/WebMCPTreeElement.ts  ba21f48d...
front_end/panels/application/webMCPView.css  febc1a42...
front_end/panels/application/WebMCPView.ts  d61c4c52...
... (26 rows)

$ curl -s -o /dev/null -w '%{http_code}\n' .../chromium/8037/front_end/panels/application/WebMCPView.ts
200
$ curl -s -o /dev/null -w '%{http_code}\n' .../chromium/8037/front_end/models/web_mcp/WebMCPModel.ts
200

$ grep -n "devtools_frontend_revision" /tmp/deps154
424:  'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',

$ diff -q WebMCPModel.ts@24a6a01 WebMCPModel.ts@66df492 && echo IDENTICAL
IDENTICAL
$ diff -u WebMCPView.ts@66df492 WebMCPView.ts@24a6a01 | wc -l
286

$ gh api repos/ChromeDevTools/devtools-frontend/compare/f30a1d78b7af...66df492aaa01 --jq '.status, .ahead_by, .behind_by'
diverged
5
114

$ curl -sSfL .../domains/Audits.pdl | grep -n FormModelContext
405:      FormModelContextParameterMissingTitleAndDescription
406:      FormModelContextMissingToolName
407:      FormModelContextMissingToolDescription
408:      FormModelContextRequiredParameterMissingName
409:      FormModelContextParameterMissingName

$ grep -n "FormModelContext" GenericIssue.ts@66df492 | head -3
221:export const genericFormModelContextMissingToolName: LazyMarkdownIssueDescription = {
226:export const genericFormModelContextMissingToolDescription: LazyMarkdownIssueDescription = {
231:export const genericFormModelContextParameterMissingTitleAndDescription: LazyMarkdownIssueDescription = {

$ strings -a /usr/lib/chromium/chromium | grep -E 'WebMCP' | sort -u
... WebMCP / WebMCP.invokeTool / WebMCP.toolInvoked / WebMCP.toolResponded / WebMCP.toolsAdded / WebMCP.toolsRemoved
... kDevToolsWebMCPSupport / devToolsWebMCPSupport / "Enables WebMCP support in DevTools." / "WebMCP domain is not enabled"
$ grep -a -c 'devtools' /usr/lib/chromium/resources.pak
0        # pak entries are compressed; negative result not usable
```

## 9. Not run / not claimed

- Did not launch Chromium or DevTools, did not open a CDP session (not this seat's authorization).
- Did not run `scripts/webmcp-loopback-round16.mjs` or any round-16 gate/counter.
- Did not extract `resources.pak`; local panel-presence claim is source-pin + default-on-flag inference only.
- Did not open the WebMCP spec (S020) or WPT; browser-side PDL/feature work belongs to `SrcChromiumPdl-5`.
- No tools installed or upgraded; only pre-existing `gh`, `curl`, `jq`, `sha256sum`, `strings` were used;
  pacman was not invoked. (Tooling directive acknowledged, nothing to record.)

## 10. Suggested use by L1 (one paragraph)

For the C2 knowledge note, the falsifiable frontend-side claims are: (a) DevTools has a dedicated WebMCP
model+panel that consumes the `WebMCP` domain over CDP, so a CDP harness is observing the same event stream
DevTools observes; (b) `enable` is a snapshot operation, so the harness may attach late and still obtain the
full declarative/imperative catalog; (c) `backendNodeId` is the sole declarative/imperative discriminator;
(d) `toolsRemoved` carries only `{name, frameId}`, and navigation manifests as default-context destruction
which the frontend mirrors as a frame-wide `toolsRemoved` batch; (e) invocation `input` is a string and
`output` is absent unless `Completed`; (f) on Chromium 154 the whole surface is gated by
`DevToolsWebMCPSupport` (default enabled), while main/155+ requires no flag; (g) declarative-form defects are
a second, independent CDP channel — `Audits.issueAdded` generic issues (`FormModelContext*`, PAGE_ERROR)
rendered in the Issues panel, with no corresponding `WebMCP` error event. Each of these is anchored to
the pin `66df492aaa0129d090937e933dd44c5389ab24d2` (shipped 154 frontend) or main
`24a6a013f8b16cc19dd99f2631aaf63d4fb6955d`, with the exact lines above.
