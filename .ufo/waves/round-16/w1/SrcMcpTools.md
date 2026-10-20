# SrcMcpTools — MCP 2026-07-28 Tools page ↔ WebMCP `toolsAdded`

Seat: `TabiR16.SrcMcpTools-5` (scout, read-only). Round 16 W1, C2 adjacency context.
No subagents, no browser launch, no gate/selftest/counter, no source-row or SOURCES edit.
Only file written: this report.

**Answer in one line.** MCP defines a tool as `name` + `description` + `inputSchema`
(plus optional `title`, `icons`, `outputSchema`, `annotations`) and returns calls as a
typed `content[]` array with optional `structuredContent` and `isError`. Chromium 154's
`WebMCP.toolsAdded` carries only the *definition* subset plus browser coordinates
(`frameId`, `backendNodeId?`, `stackTrace?`); results arrive separately as
`toolResponded {status, output?, errorText?, exception?}`, which is not MCP's content-block
shape. Definition-level adjacency holds; result-shape adjacency does not.

## 0. What I opened this session (all 2026-10-20, UTC)

| # | Source | Revision / pin | Method | Observed |
|---|---|---|---|---|
| A | `https://modelcontextprotocol.io/specification` | redirect target | `curl -sSI` | `HTTP/2 307`, `location: /specification/2026-07-28` |
| B | `https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md` | protocol rev **2026-07-28** | `curl -sS` → `/tmp/mcp-tools-2026-07-28.md` | HTTP 200, 797 lines, `sha256 09be49a064940ef288b47f8df09e95e6e3dc087c3f94e466acd60ec66dff25c3`, 2026-10-20T14:29:24Z |
| C | `https://raw.githubusercontent.com/modelcontextprotocol/specification/main/schema/2026-07-28/schema.ts` | the schema B itself cites | `curl -sS` → `/tmp/mcp-schema-2026-07-28.ts` | HTTP 200, 3197 lines, `sha256 742750af0bb8c716e7030c4977c992b55d1adc4407e9e66997db5846baedc2cd` |
| D | `https://modelcontextprotocol.io/llms.txt` | index | `curl -sS` → `/tmp/mcp-llms.txt` | 364 lines; 2026-07-28 tools entry at `:150`, listed before 2025-11-25 `:173`, 2025-06-18 `:194`, 2025-03-26 `:214`, 2024-11-05 `:232` |
| E | `https://webmachinelearning.github.io/webmcp/` (S020) | CG-DRAFT, **Draft Community Group Report, 20 October 2026**, `meta-revision cb3d16964ab3e92cfd5f09901ed0504373a906e8` | reader fetch + `curl -sS` → `/tmp/webmcp-spec.html` | HTTP 200, 505949 bytes, `sha256 180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a` |
| F | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT` | tag **154.0.8037.97** (host Chromium per PLAN L1 pre-probe) | `curl … ?format=TEXT \| base64 -d` → `/tmp/WebMCP-154.pdl` | HTTP 200, 123 lines, `sha256 26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`; included by `browser_protocol.pdl:62`, same tag |

`/specification` 307 → `/specification/2026-07-28` plus D's ordering is the basis for
calling 2026-07-28 the latest dated revision. B's own header links C, so the schema is the
same revision, not a rolling `main` document.

## 1. MCP tool definition fields (observed, quoted)

All quotes are from B; line anchors are B's raw markdown. `§ Data Types → Tool` starts at
`B:282`; the field list is `B:284-302`. C's `Tool` interface is `C:1973-2015`.

| Field | Normative status | Quote (≤25 words) | Anchor |
|---|---|---|---|
| `name` | required | "Unique identifier for the tool" | `B:286`; `C:958` (`BaseMetadata`) |
| `title` | optional | "Optional human-readable name of the tool for display purposes." | `B:287`; `C:968` |
| `description` | listed without "optional"; schema marks it optional | "Human-readable description of functionality" | `B:288`; `C:1979` (`description?: string`) |
| `icons` | optional | "Optional array of icons for display in user interfaces" | `B:289`; `C:934` (`Icons`) |
| `inputSchema` | required, root object | "JSON Schema defining expected parameters" | `B:290`; `C:1997` |
| `inputSchema` validity | MUST | "MUST be a valid JSON Schema object (not null)" | `B:293` |
| `inputSchema` root | required | "Tool arguments are always JSON objects, so `type: \"object\"` is required at the root." | `C:1984` |
| `outputSchema` | optional | "Optional JSON Schema defining expected output structure" | `B:299`; `C:2005` |
| `annotations` | optional | "Optional properties describing tool behavior" | `B:302`; `C:2012` |
| `_meta` | optional | — (schema only) | `C:2014` |

Schema default for both schemas: JSON Schema 2020-12 when no `$schema` (`B:292`, `B:301`).

Name rules (`B:311-316`): "Tool names **SHOULD** be between 1 and 128 characters in length
(inclusive)."; case-sensitive; only `[A-Za-z0-9_.-]`; "Tool names **SHOULD** be unique
within a server." Uniqueness is per server only; aggregation collisions are left to the
client (`B:322-330`).

`annotations` sub-fields in C: `title?`, `readOnlyHint?`, `destructiveHint?`,
`idempotentHint?`, `openWorldHint?` (`C:1912-1954`). B warns clients "**MUST** consider
tool annotations to be untrusted unless they come from trusted servers" (`B:304-306`).

## 2. MCP call and result content shape (observed, quoted)

- Listing: servers "**MUST** respond to `tools/list` requests with the set of tools
  currently available to the requesting client" (`B:62-63`); the set may be empty and may
  vary by authorization, but must not vary per-connection (`B:63-69`).
- `tools/list` result: `resultType: "complete"`, `tools[]`, `nextCursor`, `ttlMs`,
  `cacheScope` (`B:103`, `B:104`, `B:128-130`). `Result.resultType` is mandatory for this
  protocol version; absent means `"complete"` for older servers (`C:225-234`).
- `tools/call` params: `name` + `arguments` (`B:145-149`); retry adds `inputResponses` and
  optional `requestState` (`B:174-233`), producing `resultType: "input_required"`
  (`B:187`).
- Unstructured result: "**Unstructured** content is returned in the `content` field of a
  result" (`B:404`). Content block variants: `text` (`B:414`), `image` (`B:423`), `audio`
  (`B:437`), `resource_link` (`B:447`), `resource` (`B:469`). C types this as required
  `content: ContentBlock[]` (`C:1813`) over the union
  `TextContent | ImageContent | AudioContent | ResourceLink | EmbeddedResource`
  (`C:2305-2306`).
- Structured result: "**Structured** content is returned as a JSON value in the
  `structuredContent` field of a result." (`B:494`); optional in C
  (`structuredContent?: unknown`, `C:1821`); SHOULD also be serialized into a text block
  (`B:496`); conforms to `outputSchema` when present (`B:503-509`).
- Failure split: protocol errors are JSON-RPC `error` objects (`B:730-748`); tool execution
  errors "are reported in tool results with `isError: true`" (`B:759`), `isError?: boolean`
  in C (`C:1837`).
- Shell: `CallToolResult` = `{content, structuredContent?, isError?}` (`C:1809-1838`);
  response is `CallToolResult | InputRequiredResult` (`C:1848-1850`).
- Change notification: `notifications/tools/list_changed` (`B:236-247`), emitted when the
  declared `listChanged` capability is on and a `subscriptions/listen` stream carries
  `toolsListChanged: true`.

## 3. Map against WebMCP `toolsAdded`

Mapping target is the payload recorded by L1's pre-probe:
`WebMCP.toolsAdded {tools:[{name:"search",description:"Search",inputSchema:{type:"object",properties:{q:{type:"string"}},required:[]},frameId,backendNodeId}]}`
(`.ufo/waves/round-16/PLAN.md:22`). I did not re-run that probe; the payload is L1-recorded,
not author-verified. Its members are a legal subset of F's `Tool` type — the three required
ones plus optional `inputSchema` and `backendNodeId`; optional `annotations` and
`stackTrace` are simply absent — which is independent corroboration that the event uses
F's shape.

### 3a. Definition layer

| MCP `Tool` (B/C) | WebMCP tool definition (E §3 / §4.2.1) | CDP `WebMCP.Tool` (F) |
|---|---|---|
| `name` required; 1–128; `[A-Za-z0-9_.-]`; unique per server (SHOULD) | `name` must be 1–128, same character set, uniqueness enforced at registration (`E §3`, `E §4.2` step 9) | `string name` (F:36) |
| `description` listed; schema optional | required non-empty string (`E §4.2` step 10) | `string description` (F:38) |
| `inputSchema` required, root `type:"object"` | `object inputSchema`; stored stringified: "This is the stringified representation of the `inputSchema` passed to `registerTool()`" (`E §3` note) | `optional object inputSchema` (F:40) |
| `title` optional | `title` display string (`E §4.2.1`, USVString) | **absent** — no `title` member anywhere in F |
| `icons` optional | absent | absent |
| `outputSchema` optional | absent; `executeTool` is `Promise<DOMString>` (`E §4.2`) | absent |
| `annotations` `{title, readOnlyHint, destructiveHint, idempotentHint, openWorldHint}` | `ToolAnnotations {readOnlyHint, untrustedContentHint, consequentialHint, debugging}` (`E §4.2.1`) | `optional Annotation {readOnly, untrustedContent, consequential, autosubmit}` (F:13-23) |
| — | `exposed origins` (`E §3`), `execute` callback (`E §4.2.1`) | `frameId` (44), `backendNodeId?` (46), `stackTrace?` (48) |
| `_meta` | — | — |

E's own framing is the adjacency claim, quoted: "MCP servers that implement tools in
client-side script instead of on the backend" (`E §1`). Both sides also sort or expect
deterministic tool order (MCP `B:71-74`; E §4.2 `getTools` sorts ascending by `name`).

### 3b. Result layer — divergence

| MCP (`tools/call` result) | CDP `WebMCP` invocation |
|---|---|
| required `content: ContentBlock[]` (`C:1813`) | no content array |
| `structuredContent?: unknown` (`C:1821`) | `optional any output` (F:118) — "Output or error delivered as delivered to the agent." (F:116) |
| `isError?: boolean` (`C:1837`) | `InvocationStatus status` = `Completed \| Canceled \| Error` (F:26-30, F:115) |
| protocol errors as JSON-RPC `error` (`B:730-748`) | `optional string errorText` (F:120), `optional Runtime.RemoteObject exception` (F:122) |
| `resultType` (`C:225-234`) | `string invocationId` (F:69, F:113) |

E's error model is exception-based, not result-flag based: author failures "can also be
reported to the tool caller in the response JSON string" (`E §3`), while platform failures
surface as `DOMException` names (`NotFoundError`, `DataError`, `OperationError`,
`AbortError`; `E §3` table). So `isError` has no WebMCP counterpart; the nearest analogue
is `status: "Error"` plus `errorText`/`exception`.

### 3c. Event correspondence

- `toolsAdded` / `toolsRemoved` (F:77-95) correspond to MCP's `list_changed` +
  re-`tools/list` cycle (`B:236-247`), not to a call. F also exposes `invokeTool`
  (F:58-69), `cancelInvocation` (F:72) and events `toolInvoked` (F:98) / `toolResponded`
  (F:110) — a CDP-side call surface, but not MCP wire messages.

## 4. Divergences worth carrying into the note

1. **Definition subset only.** `toolsAdded` transports `name`, `description`,
   `inputSchema?` (+ annotations, browser coordinates). It cannot carry `title`,
   `icons`, `outputSchema` — F has no such members. A claim like "pages expose titled
   tools over CDP" is unobservable from this event, regardless of what the page declared.
2. **`inputSchema` optionality is inverted.** MCP requires it (`C:1997`, root
   `type:"object"`, `C:1984`); WebMCP allows registration without one (empty string
   stringified schema; `E §4.2` steps 11-12) and CDP marks it optional (F:40).
3. **Name rules: SHOULD vs enforced.** MCP states 1–128 / charset / uniqueness as SHOULD
   (`B:311-316`); WebMCP rejects violators with `InvalidStateError` (`E §4.2` steps 9-10,
   14).
4. **Annotation vocabulary diverges.** MCP `destructiveHint`/`idempotentHint`/
   `openWorldHint` have no WebMCP counterpart; WebMCP `untrustedContentHint` and
   `consequentialHint` have no MCP member; CDP flattens the `*Hint` suffix
   (`readOnly` vs `readOnlyHint`) and adds `autosubmit` (declarative-only, F:22-23).
5. **Schema dialect unstated on the WebMCP side.** MCP pins JSON Schema 2020-12 default
   (`B:292`); E says only "A JSON Schema object" (`E §4.2.1`) with `[[JSON-SCHEMA]]`
   citation and no default dialect.
6. **Trust posture is symmetric but worded differently.** MCP: annotations untrusted
   unless from trusted servers (`B:304-306`). CDP: "The output is untrusted and poses a
   prompt injection risk." (F:117).
7. **Recorded payload had no `annotations`.** That is legal per F (optional) and says
   nothing about whether the declarative form emits `autosubmit`; a probe question, not a
   doc question.

## 5. Tier implications

- **What is established at what tier (my reading, author-side advice).**
  MCP side: primary spec text + the revision's own schema, both opened today — tier-A
  material, but currently **not** registry rows. If the WebMCP note cites MCP, L1 must open
  or add a row this round (SOURCES is L1-only); my fetch is a lead, not an admission.
  WebMCP side: E is a W3C CG draft (`CG-DRAFT`, no Standards Track), row S020, still
  `queued`. F is Chromium source at a version tag — primary, but *documented, not
  measured* on this host: no build of 154.0.8037.97 was launched here.
- **C2 (`webmcp-cdp-observation`, held 0→1).** This page supports only the
  *definition-level* adjacency sentence: both models describe a tool as
  `{name, title?, description, inputSchema(JSON Schema)}`. It cannot support "WebMCP is
  MCP", "pages expose MCP servers over CDP", or any result-parity claim. If the knowledge
  note wants the MCP framing, scope it to definitions and cite the divergence rows above;
  keep the held entry itself grounded in the harness receipt, not in MCP text.
- **Registry caution (S020 drift).** `corpus/SOURCES.md:34` records "CG-DRAFT 2026-10-16,
  revision f14762e6"; E fetched today declares "Draft Community Group Report, 20 October
  2026" with `meta-revision cb3d16964ab3e92cfd5f09901ed0504373a906e8`. Do not cite
  `f14762e6` as current; refresh the row if it is mined this round. (The two values may be
  different identifiers — git commit vs Bikeshed revision — but the page date moved either
  way.)
- **Where the CDP evidence sits.** F is what makes `toolsAdded`'s field list citable at
  all; the PLAN's payload alone is one observed instance. Pair them: schema from F,
  instance from the harness receipt. F is version-pinned to the host's Chromium string, so
  it is the strongest available definition of the event without a browser run.

## 6. Remaining unknowns (mine, not the lane's)

- Whether the host binary's actual `WebMCP` domain matches F exactly (e.g. `invokeTool`,
  `toolResponded` present and experimental). Needs the harness, not a doc.
- `toolResponded.output` encoding: F types it `any` (F:118) while E resolves `executeTool`
  to a stringified JSON string (`E §4.2`). Whether CDP transports the parsed value or the
  raw string is unresolved by these sources.
- Whether declarative forms emit `annotations` (notably `autosubmit`) in `toolsAdded`.
- Whether `toolsAdded` fires for imperative `registerTool` as it does for declarative; F's
  `enable` comment says enabling "will trigger a toolsAdded event for all currently
  registered tools", which suggests yes, but the comment is not the algorithm.
- B is 797 lines; I read all of it across two reads (1-300, 301-797), but I did not diff
  against 2025-11-25 to attribute each field to a revision change. Not needed for
  adjacency; do not claim "new in 2026-07-28" for any field.

## 7. Exact commands (reproducible)

```sh
curl -sS -w 'HTTP %{http_code}\n' https://modelcontextprotocol.io/specification/2026-07-28/server/tools.md -o /tmp/mcp-tools-2026-07-28.md
# HTTP 200; 797 lines; sha256 09be49a0…ff25c3

curl -sSI https://modelcontextprotocol.io/specification | tr -d '\r' | grep -i '^location'
# location: /specification/2026-07-28

curl -sS https://raw.githubusercontent.com/modelcontextprotocol/specification/main/schema/2026-07-28/schema.ts -o /tmp/mcp-schema-2026-07-28.ts
# HTTP 200; 3197 lines; sha256 742750af…edc2cd

code=$(curl -sS -w '%{http_code}' -o /tmp/webmcp.pdl.b64 \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT')
echo "HTTP $code"; base64 -d /tmp/webmcp.pdl.b64 > /tmp/WebMCP-154.pdl
# HTTP 200; 123 lines; sha256 26e62f29…0a37ff
```

No installs or upgrades were needed (curl, base64, awk, grep already present); nothing was
added to the host. No browser process was started. No repo file other than this Report was
written.
