# ConnMcpAdjacency — WebMCP `toolsAdded` ↔ MCP `Tool` ↔ REA `discover_webmcp_tools`

Seat: `TabiR16.ConnMcpAdjacency-5` (connector, read-only adjacency slice, round 16 wave 1).
Access date for every external source below: **2026-10-20**. Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Method: read-only. No browser, gate, counter, selftest, or commit was run by this seat. The
`WebMCP.toolsAdded` sample is **L1's pre-probe** (`PLAN.md:18-24`), quoted — not re-observed here.

## 0. Answer in one paragraph

The `toolsAdded` payload is a **structural sibling** of an MCP `Tool` (shared `name` /
`description` / `inputSchema` vocabulary) but it is **not an MCP tool registration**. Three
distinct registries exist: (A) the agent↔server MCP tool list that the host consumes (REA's own
`discover_webmcp_tools` lives here), (B) the page↔browser WebMCP model context (`toolsAdded`
items live here), and (C) REA's normalized evidence inventory, which copies B into an evidence
result with a third identity (`tool_key`) and a literal `trust: page-declared-untrusted`. No
observed path promotes a B item into A. Agent-side MCP consumption is owned by **kumitate**
(MCP/orchestration plane) for the client/config layer and **kaidoku** for the REA server
registration/tool catalog; **tabi** owns only the page-side production/observation. No lane owns
page-tool → agent invocation.

## 1. Anchors opened this session

| # | Source | Locator | Verbatim quote (≤25 words) | Fetch method |
|---|---|---|---|---|
| A1 | WebMCP spec (CG-DRAFT, 20 October 2026; `meta-revision cb3d16964ab3e92cfd5f09901ed0504373a906e8`) | https://webmachinelearning.github.io/webmcp/ §1 Introduction, rendered line 63 | “Web pages that use WebMCP can be thought of as Model Context Protocol [MCP] servers” | `read` (native HTML render) |
| A2 | WebMCP spec | §4.2.1 `inputSchema`, line 930 | “A JSON Schema object describing the expected input parameters for the tool” | same |
| A3 | WebMCP spec | §4.2 `registerTool`, line 484 | “if the given name or description are empty strings, or if the inputSchema is invalid” | same |
| A4 | Chromium CDP PDL, branch-heads/8037 (Chromium 154.0.8037.x), revision `13490686045341e0e01e9572294856a2d37f2a32` | https://chromium.googlesource.com/chromium/src/+/refs/branch-heads/8037/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT — lines 33–46, 51–52, 78–83, 92, 110–120; local sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | “Enabling the domain will trigger a toolsAdded event for all currently registered tools.” | `curl … ?format=TEXT` then `base64 -d` |
| A5 | Chromium CDP PDL, `main`, revision `48bd8be7969ba1295501a2f83908c41e9693a2a1` | same path on `main`; local sha256 `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | diff vs A4: `+ optional boolean debugging` (one hunk, +2 lines) | same |
| A6 | MCP specification 2026-07-28 (the current revision; `/specification/latest` 307→`2026-07-28`) | https://modelcontextprotocol.io/specification/2026-07-28/schema §Schema Reference → `Tool`, line 1205 | “Definition for a tool the client can call.” | `read`/`curl` of `/schema.md` |
| A7 | MCP 2026-07-28 | https://modelcontextprotocol.io/specification/2026-07-28/server/tools §Tools, lines 10–11 | “Each tool is uniquely identified by a name and includes metadata describing its schema.” | `curl …/server/tools.md` |
| A8 | MCP 2026-07-28 | §Tools → “Listing Tools”, line 80 | “clients send a tools/list request. This operation supports pagination and caching” | same |
| A9 | MCP 2026-07-28 | §Schema Reference → `ToolAnnotations`, line 1220 | “Clients should never make tool use decisions based on ToolAnnotations received from untrusted servers.” | `curl …/schema.md` |
| A10 | REA 6.5.0 (OMP pin per kaidoku `PROVINCE.md:15-21`), tool contract | `~/.npm/_npx/ad9a3fdbcad992c6/node_modules/rea-agents/dist/contracts/browserToolContracts.js:169-186` (name `:170`, description `:172`) | description quoted in §4 below | local `grep -n` |
| A11 | REA 6.5.0, tool registration | `…/dist/server/registerBrowserTools.js:17,33-36` | `server.registerTool(webMcpContract.name, …)` | local `grep -n` |
| A12 | REA 6.5.0, normalized item schema | `…/dist/domain/webMcpDiscovery.js:14-56` (item `:14-40`, result `:42-56`) | `trust: z.literal("page-declared-untrusted")` | local `cat -n` |
| A13 | REA 6.5.0, CDP implementation (bundled) | `…/dist/mcp/browserObservation-C0s4i8UI.js:3545,3582,3712-3805,3837-3841` | `Discovery uses only WebMCP.enable and toolsAdded/toolsRemoved; WebMCP.invokeTool is never called.` | local `sed -n` |
| A14 | REA 6.7.0 (Kimi pin) | `~/.npm/_npx/a1722018f28f9df2/node_modules/rea-agents/dist/browser/CdpWebMcpDiscovery.js:15,56,62,226`; `dist/domain/webMcpDiscovery.js:14-40`; `dist/contracts/browserToolContracts.js:183` | same two limitation strings; `// CDP sends the enable response before the required toolsAdded replay.` | local `grep -n`/`sed` |
| A15 | Host tool list (this session) | `read xd://mcp__rea_discover_webmcp_tools` | “Metadata is page-declared-untrusted; REA never registers or invokes discovered tools.” (full description in §4) | `read` (`xd://` doc + schema) |
| A16 | Playwright 1.64.0 (global npm) | `…/playwright/node_modules/playwright-core/lib/tools/cli-client/help.json:762,768`; `…/playwright-core/lib/tools/skills/playwright-cli/SKILL.md:216-243` | “webmcp tools (page-provided, untrusted)” | local `grep -n`/`sed -n` |
| A17 | tabi prior census | `corpus/knowledge/browser-surface-census.md:145-153` | “The only WebMCP surface evidenced on this host is the `rea-agents` CDP tool `discover-webmcp-tools`” | local `sed -n` |
| A18 | tabi province | `PROVINCE.md:3-21` | “Refuses: reverse engineering as forensics (→ revenger/kaidoku)” | local `sed -n` |
| A19 | kaidoku province | `kaidoku-shokunin/PROVINCE.md:8-24,42-46,64-66` | “Cross-lane registry this lane maintains: the REA surface map — per-client registration state” | local `grep -n` |
| A20 | kumitate province | `kumitate-shokunin/PROVINCE.md:20,26` | “MCP protocol revisions as they bear on orchestration — `corpus/SOURCES.md` rows, queued.” | local `grep -n` |
| A21 | kumitate MCP plane note | `kumitate-shokunin/corpus/knowledge/kimi-mcp-plane.md:1-70` (`:49`, `:67-68`) | “Tool names are `mcp__<server>__<tool>`” · “the `rea` MCP server registration itself is kaidoku's surface” | local `read`/`grep -n` |
| A22 | Fleet absence check | `grep -rli --include=*.md --include=*.json --include=*.mjs --exclude-dir=node_modules --exclude-dir=.git webmcp /home/vgpnk/Projects/shokunin` | counts `63 tabi-shokunin`, `25 kaidoku-shokunin`, `9 tabi-local .ufo`; **0 kumitate** | shell grep |

No tool install or upgrade was needed or performed.

## 2. Shape comparison (the actual cross-domain edge)

| Field | CDP `WebMCP.Tool` (wire, A4) | WebMCP spec `ModelContextTool` (A1–A3) | MCP `Tool` 2026-07-28 (A6) | REA normalized item (A12) |
|---|---|---|---|---|
| name | `string name` **required** | `required DOMString name`; 1–128 chars, ASCII alnum `_ - .` only | `name: string` **required** | `name: string`; plus `tool_key` |
| title | — | `DOMString title` optional | `title?: string`; display precedence `title`, `annotations.title`, then `name` | — (dropped) |
| description | `string description` **required** | `required DOMString description`; empty rejected (A3) | `description?: string` **optional** | `description: string`; missing wire value coerced to `""` (A13:3772) |
| input schema | `optional object inputSchema` (“Schema for the tool's input parameters.”) | `object inputSchema` optional; stored as stringified JSON (A2) | `inputSchema: { $schema?: string; type: "object"; [key: string]: unknown }` **required** | `input_schema: JSON value \| null` + `input_schema_sha256: hex \| null` |
| annotations | `readOnly?`, `untrustedContent?`, `consequential?`, `debugging?` (main only), `autosubmit?` | read-only hint, untrusted-content hint, consequential hint, debugging | `readOnlyHint?`, `destructiveHint?`, `idempotentHint?`, `openWorldHint?`, `title?` | `read_only`, `untrusted_content`, `consequential?`, `autosubmit` (all tri-state bool/null) |
| provenance | `frameId` required, `backendNodeId?`, `stackTrace?` | per-document model context; origin list/policy | no frame/origin concept; `_meta`, `icons?` | `frame_id`, `frame_url`, `owner_origin`, `declaration_kind`, `registration_source{url,line,column}` |
| identity | name + frame | name unique **within a model context** | name unique per server | `webmcp_<sha256(compositeKey([frame_url, frame_id, name]))>` (A13:3837-3841) |
| lifecycle | `WebMCP.enable` replays all current tools as `toolsAdded`; later `toolsAdded`/`toolsRemoved` | `toolchange` event; `getTools()` request | `tools/list` request/response, pagination + caching; `notifications/tools/list_changed` | one-shot capture over `observation_ms` (default 100 ms) |
| execution | `WebMCP.invokeTool` exists in the domain (unused by REA) | `document.modelContext.executeTool(...)` | `tools/call` JSON-RPC | none by design |

## 3. Cross-domain edges (E1–E8)

- **E1 — Shared vocabulary, nothing more.** `name` / `description` / `inputSchema` are the only
  shared spellings. It is safe to say the `toolsAdded` payload is *MCP-shaped*; it is not safe to
  say it is an MCP tool. The WebMCP spec itself only offers the analogy (A1); the wire protocol
  below it is CDP, not JSON-RPC.
- **E2 — `inputSchema` optionality is inverted and must not be collapsed.** MCP requires
  `inputSchema` with `type: "object"`; CDP and WebMCP make it optional; REA preserves absence as
  `null` plus a `null` digest. A mapper that emits `{type:"object"}` for a missing schema would
  fabricate a declaration. Any tabi note comparing the two must say: *page tools may carry no
  input schema; MCP tools may not.*
- **E3 — description requiredness is inverted.** CDP requires `description`; the WebMCP
  registration algorithm rejects an empty one; MCP marks it optional. REA's `?? ""` coercion
  (A13:3772) means an empty string in REA output is **not** evidence of a page-declared empty
  description — do not quote it as such.
- **E4 — Three identities, no shared key.** MCP identity is per-server name (hosts compose
  `mcp__<server>__<tool>`, A21:49). WebMCP identity is per-model-context name; duplicate names
  across frames are real, which is why Playwright's CLI has a `--frame` disambiguator (A16).
  REA adds a third identity, a SHA-256 over `(frame_url, frame_id, name)` (A13:3837-3841).
  Consequence: a page tool cannot be addressed by the MCP name alone; any future agent-side
  consumption needs a namespace that composes *origin/frame + name*, and no lane defines one.
- **E5 — Event stream vs paginated list.** `WebMCP.enable` triggers a replay of all currently
  registered tools, then incremental `toolsAdded`/`toolsRemoved` events (A4). MCP `tools/list`
  is client-requested, paginated, cacheable, with an optional `listChanged` notification (A8).
  A consumer must not model the CDP replay as one page of a paginated list, nor treat event
  arrival order as a list order contract.
- **E6 — Trust does not transfer.** MCP says annotations are untrusted “unless they come from
  trusted servers” (A9); WebMCP metadata is page-declared, i.e., the untrusted principal is the
  page itself. REA encodes this literally (`trust: "page-declared-untrusted"`, A12) and CDP marks
  `toolResponded.output` as a prompt-injection risk (A4:110-120). An agent that consumes an MCP
  tool which *returns* page tools must not inherit MCP's server-trust assumption for those items.
- **E7 — Four execution authorities, none equivalent.** `tools/call` (server executes),
  `document.modelContext.executeTool` (browser agent/in-page), `WebMCP.invokeTool` (CDP domain,
  never called by REA, A13:3545), and Playwright CLI `webmcp-call` (A16). `discover_webmcp_tools`
  has no invocation surface at all.
- **E8 — Registry boundary (the load-bearing edge).** `discover_webmcp_tools` is itself an MCP
  tool (A10/A11): the host's MCP tool list contains it, and its **output** contains the page
  tools. No observed path enters the page tools into the host's MCP tool list. Evidence classification agrees:
  `toolEffects.js:587` maps it to `browserEvidence`; `BrowserEvidence.js:118-119` types it
  `rea.webmcp-discovery`; `browserCompleteness.js:23,50` scopes it to the `webmcp_tools`
  completeness section.

## 4. REA tool ↔ host tool list

- Host description (A15): “Passively inventory every page-registered WebMCP tool and its
  complete structural input-schema summary using the experimental CDP WebMCP domain. Metadata is
  page-declared-untrusted; REA never registers or invokes discovered tools.” It is word-for-word
  the contract string at `dist/contracts/browserToolContracts.js:172` (6.5.0) and `:183` (6.7.0)
  — verified by `grep -n` over both local packages; the two versions carry identical text.
- Input schema (`dist/domain/webMcpDiscovery.js:8-13`): `cdp_endpoint` (literal loopback
  `http://127.0.0.1:PORT` or `ws://…/devtools/browser/ID`), `allowed_origins?`, `target_id`
  (exact CDP target), `observation_ms` default 100. There is **no tool-name/argument input**;
  the tool inventories, it does not address an item. That is the operational difference from
  MCP `tools/call` (name + arguments) and from Playwright's `webmcp-call <name> --params`.
- Output (`webMcpDiscoverySchema`, A12): `browser`, `target{target_id,url,origin}`,
  `status available|unavailable`, `tools{total,items[]}`, `completeness`, `limitations[]`.
  Each item is the table row 4 in §2.
- Implementation facts: only `WebMCP.enable` + `WebMCP.toolsAdded`/`toolsRemoved`; the enable
  response arrives before the replay, hence the `observation_ms` wait (A13:3582-3586, A14:62);
  `WebMCP.invokeTool` is never called (A13:3545); frame navigation/detach removes tools and
  scopes by allowed origin (A13:3616-3675); `declaration_kind` is inferred from
  `backendNodeId` presence (declarative vs imperative, A13:3795).
- Naming edge: the MCP tool name is `discover_webmcp_tools` (`:170`), while the CLI verb is
  `discover-webmcp-tools` (`dist/cli/browserAdvancedCommands.js:42`). `browser-surface-census.md:150`
  uses the CLI hyphen form. Searches for the MCP tool by the census spelling miss it.

## 5. Which lane owns agent-side MCP consumption

| Surface | Owner lane | Anchor | What is actually held |
|---|---|---|---|
| Page-side WebMCP production, browser observation, page evidence | **tabi** | `PROVINCE.md:3-19`; `PLAN.md:84-96` limits | Browser/CDP observation; explicitly refuses RE and consequential actions; C2 note may not claim agent integration |
| REA MCP server registration + tool catalog (207 MCP tools, per-client pins, `tools_sha256`) | **kaidoku** | `kaidoku-shokunin/PROVINCE.md:8-24,42-46,64-66` | Per-client registration state, provider availability, tool catalog identity |
| Agent-side MCP plane: client config (`mcp.json`), `mcp__<server>__<tool>` naming, deferred loading, timeouts | **kumitate** | `PROVINCE.md:20`; `kimi-mcp-plane.md:1-70` | Scope claim + `kimi-mcp-plane.md` (verified 2026-10-19) and `omp-task-contract.md` (round 34); “MCP protocol revisions” is a **queued frontier row**, not held ground |
| MCP/OAuth security practice | **kasegi / kagi** | `kumitate/PROVINCE.md:26` | Adjacent-only, report-never-absorb |
| Page-tool → agent invocation | **no lane** | — | Playwright CLI can call (`webmcp-call`, A16), but no lane claims it as held ground; tabi's province bars consequential actions without operator approval |

Kumitate's own note draws the same boundary from the other side: “the `rea` MCP server
registration itself is kaidoku's surface (report, never absorb — QUALITY Q9)”
(`kimi-mcp-plane.md:67-68`). So the C2 adjacency line should read:

> tabi produces and observes page-declared tools; kaidoku owns the REA MCP surface that
> inventories them; kumitate owns the agent-side MCP plane that could consume that surface.
> No lane currently owns promoting page tools into agent-callable tools, and `discover_webmcp_tools`
> deliberately does not do it.

## 6. Contradictions and non-collapsible differences

1. **“MCP server” is an analogy, not a transport.** A1 says pages “can be thought of as” MCP
   servers; the same spec's §5.2 says browser-agent exposure is *implementation-defined*, and the
   concrete wire is CDP. There is no JSON-RPC, no `initialize`, no `tools/list`/`tools/call` on
   the page side. The CDP domain is experimental and build-scoped.
2. **MCP revision matters.** `/specification/latest` redirects to **2026-07-28**, not
   2025-06-18. In 2026-07-28 `inputSchema` accepts full JSON Schema 2020-12
   (`$schema?`, `type:"object"`, open index) and `ToolAnnotations` keeps its untrusted warning.
   A note citing the older 2025-06-18 narrowing (fixed `properties`/`required` subset) would be
   stale. Cite 2026-07-28.
3. **Chromium main vs 154 branch.** Branch-heads/8037 (the installed 154.0.8037.x line) lacks
   the `debugging` annotation that `main` adds. REA 6.5.0 and 6.7.0 also lack `debugging`, so
   there is no loss for the installed build; there will be a future skew when the annotation
   ships. Do not claim `debugging` is observable on this host.
4. **REA coerces, it does not reject.** Missing `description` → `""`; invalid/absent
   `inputSchema` → `null` + completeness exclusion, but the item is still emitted. These are
   normalization choices, not page declarations. An evidence consumer must read
   `input_schema_sha256 == null` as “no valid schema captured,” never as “empty schema.”
5. **`consequential` is not `destructiveHint`.** WebMCP's consequential hint means
   booking/transferring money; MCP's `destructiveHint` means irreversible updates. `untrustedContent`
   has no MCP schema peer at all. Any crosswalk is lossy and must be stated as lossy.
6. **Fleet coverage.** `grep` over the fleet finds WebMCP only in tabi (63 files), kaidoku
   (25 files — all REA-tool/references), and tabi-local `.ufo` reports (9). No kumitate/kasegi/kagi note
   mentions WebMCP. This adjacency is new ground, not a restatement of another lane's held fact.

## 7. What the C2 knowledge note may and may not say

May assert (each grounded above):

- `WebMCP.toolsAdded` items share the `name`/`description`/`inputSchema` vocabulary with MCP
  `Tool` but carry extra provenance (`frameId`, `backendNodeId`, `stackTrace`) and different
  requiredness.
- REA's `discover_webmcp_tools` normalizes those items into evidence with a digest identity and
  a `page-declared-untrusted` literal, and never registers or invokes them.
- The payload is a CDP-domain observation of a page's model context; it is not an MCP tool list
  and does not populate the host's MCP tool list.

Must not assert:

- that page tools are “MCP tools available to the agent”;
- that `inputSchema` is always present;
- that the host's MCP plane (kumitate) or REA's catalog (kaidoku) has been exercised against page
  tools — neither has been shown to consume them;
- any agent-integration claim (this is also the PLAN's own C2 limit).

## 8. Verification commands (all read-only; re-runnable)

```sh
# 1. Chromium 154 branch domain shape (expect the quoted lines)
curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/branch-heads/8037/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT' \
  | base64 -d | grep -n 'type Tool\|optional object inputSchema\|event toolsAdded\|event toolsRemoved'
# observed: 33 type Tool / 40 optional object inputSchema / 78 event toolsAdded / 92 event toolsRemoved

# 2. Revision pin for that fetch
curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/branch-heads/8037/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=JSON' | head -6
# observed: "id": "13490686045341e0e01e9572294856a2d37f2a32"

# 3. Main adds only `debugging`
#    diff of the two decoded files observed exactly one hunk:
#    + optional boolean debugging   (after `consequential`)
# sha256: 8037 = 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff
#         main = f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f

# 4. REA 6.5.0 contract + normalized schema
grep -n 'name: "discover_webmcp_tools"\|Passively inventory every page-registered' \
  ~/.npm/_npx/ad9a3fdbcad992c6/node_modules/rea-agents/dist/contracts/browserToolContracts.js
# observed: 170 (name), 172 (description)
sed -n '14,40p' ~/.npm/_npx/ad9a3fdbcad992c6/node_modules/rea-agents/dist/domain/webMcpDiscovery.js

# 5. Never-invoke limitation + event ordering
grep -n 'WebMCP.invokeTool is never called\|CDP sends the enable response' \
  ~/.npm/_npx/ad9a3fdbcad992c6/node_modules/rea-agents/dist/mcp/browserObservation-C0s4i8UI.js \
  ~/.npm/_npx/a1722018f28f9df2/node_modules/rea-agents/dist/browser/CdpWebMcpDiscovery.js

# 6. Fleet WebMCP coverage
grep -rli --include=*.md --include=*.json --include=*.mjs --exclude-dir=node_modules \
  --exclude-dir=.git webmcp /home/vgpnk/Projects/shokunin | awk -F/ '{print $2}' | sort | uniq -c
# observed: 63 tabi-shokunin, 25 kaidoku-shokunin, 9 .ufo
```

## 9. Handoff/source-row advice for L1 (L1 writes SOURCES)

- **S020 re-open candidate** — WebMCP spec, https://webmachinelearning.github.io/webmcp/,
  accessed 2026-10-20, fetched with `read` (native render), revision
  `cb3d16964ab3e92cfd5f09901ed0504373a906e8`, dated “20 October 2026”. Located quote (≤25 words):
  “Web pages that use WebMCP can be thought of as Model Context Protocol [MCP] servers”
  (§1 Introduction, line 63). A second locatable quote for the schema field:
  “A JSON Schema object describing the expected input parameters for the tool”
  (§4.2.1 `inputSchema`, line 930).
- **New primary row candidate** — Chromium CDP `WebMCP.pdl`, branch-heads/8037 (154 line),
  revision `13490686045341e0e01e9572294856a2d37f2a32`, sha256 `26e6…37ff`, fetched via
  `curl …?format=TEXT` + `base64 -d`; quote “Enabling the domain will trigger a toolsAdded
  event for all currently registered tools.” (lines 51–52). This is the only primary source that
  grounds the *wire* shape, and it is version-pinned to the installed 154 line.
- **MCP 2026-07-28** is a candidate row only if the note actually leans on MCP semantics:
  https://modelcontextprotocol.io/specification/2026-07-28/schema, `Tools` pages; quote
  “Each tool is uniquely identified by a name and includes metadata describing its schema.”
  (§Tools, lines 10–11). Do not use the 2025-06-18 schema for current claims.
- No source-row inflation is implied by this report: the three candidates map to (a) an existing
  queued row re-open, (b) one new primary Chromium row, (c) one optional MCP revision row.

## 10. Unknowns retained

- Whether the host's OMP/Kimi MCP clients ever expose page tools to a model: not exercised, no
  lane evidence. `[INFERENCE]` today the only evidenced page-tool call surface is Playwright CLI
  (`webmcp-call`), which is not MCP.
- Whether Chromium 154.0.8037.97's shipped `/json/protocol` matches branch-heads/8037 exactly:
  the L1 pre-probe observed the domain at runtime, but this seat did not query `/json/protocol`;
  branch-heads/8037 is the source-tree pin, not a runtime receipt.
- Whether `WebMCP.toolsAdded` ordering is stable across frames: the PDL says nothing; REA sorts
  by `tool_key` (A13:3831) but does not claim wire order.

## 11. Proposed move (one, bounded — connector return format)

**Evidence.** E1–E8 above: the payload shares only vocabulary with MCP; REA normalizes it into
evidence with a third identity and never registers/invokes it; the lane split is explicit in
kumitate `kimi-mcp-plane.md:67-68` and kaidoku `PROVINCE.md:64-66`.

**Affected axes.** `adjacency` (currently 8, a lowest-axis tie): the note would carry a sourced
cross-lane edge it does not currently have. `coverage` (9) and C1 `operability` (8) are
untouched: no new source row, no new counter, no gate change.

**Move.** When L1 integrates
`corpus/knowledge/webmcp-chromium-loopback-round-16.md`, add a short **“Registry boundary”**
subsection containing exactly three statements, each already anchored in this report:
(a) `toolsAdded` items are page-declared inventory, not MCP registrations;
(b) REA's `discover_webmcp_tools` never registers or invokes them (A13/A14);
(c) the agent-side MCP plane is kumitate's surface and the REA server registration is kaidoku's
(kumitate `kimi-mcp-plane.md:67-68`; kaidoku `PROVINCE.md:64-66`), with tabi limited to
page-side evidence (tabi `PROVINCE.md:15-19`).

**Risks.** (1) Adjacency absorption: naming kumitate/kaidoku surfaces could read as a tabi claim;
mitigate by using “report, never absorb” wording and no edits outside tabi. (2) Over-claiming:
“not MCP” must be paired with the spec's own analogy (A1), not presented as a contradiction of
the spec. (3) Source inflation: the subsection uses only rows already opened here; it must not
mint a capability name beyond the declared `webmcp-cdp-observation`.

**Verification (L1 runs after integration; this seat ran none).**
`grep -n "Registry boundary\|page-declared inventory\|kumitate\|kaidoku" corpus/knowledge/webmcp-chromium-loopback-round-16.md`
→ the three statements present. Then run both counters at the pre-note and post-note revisions
(`node .ufo/waves/round-16/measure.mjs <REV> --claim C1`, `… --claim C2`); both values must be
identical, because the knowledge note is not a counted input of either claim. This is the
separability check for the move: adjacency improves, C1/C2 measurements do not move.
