---
source: S020
source: S0xx-PLACEHOLDER-A (CDP WebMCP domain: S002 CDP viewer re-open; L1 assigns ID)
source: S0xx-PLACEHOLDER-B (primary Chromium source/docs actually opened; none opened by this seat)
draft-author: TabiR16.DraftNote-5 (scribe; L1 integrates into corpus/knowledge/webmcp-chromium-loopback-round-16.md)
status: DRAFT, no commits, no receipts written by this seat
---

# WebMCP on Chromium 154 loopback — round 16 knowledge draft

Tags used throughout (kept separate on purpose, QUALITY 3, 14):
- **[OBS]** observed by a seat this round, with a named artifact or source row.
- **[SPEC]** quoted from the WebMCP draft spec (S020), with section.
- **[PRE]** pre-probe result recorded in PLAN.md by L1. This seat did not reproduce it. Not admissible as evidence until a probe receipt backs it.
- **[PENDING]** the claim needs a probe or receipt that does not exist yet.
- **[INF]** inference from the cited items. Not an observation.
- **[UNK]** unknown; no evidence in hand.

## Scope

- Surface: loopback only. Pages are served from `http://127.0.0.1:<port>`. No real site, no user browser profile, no agent integration. [PLAN, Contract]
- Browser: Chromium 154.0.8037.97 at `/usr/bin/chromium` [PRE, PLAN C2 pre-probe]. Executable sha256 is [UNK] until the runtime pin (`corpus/evidence/round-16/webmcp/runtime-pin.json`) exists.
- Driver: Playwright 1.64.0 from the global npm root; Node v24.21.0 [PRE, PLAN C2].
- Flags for the feature-on case [PRE, PLAN C2]:
  `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`
  `--enable-blink-features=WebMCP,WebMCPTesting`
- Flag-off case: no flags. Expected negative control [PENDING].
- Spec under reference: WebMCP Draft Community Group Report, dated 20 October 2026, `meta-revision` `cb3d16964ab3e92cfd5f09901ed0504373a906e8` [OBS, S020 header as read 2026-10-20]. The spec is a CG draft and not a W3C Standard [SPEC, "Status of this document"].

## What the spec says (S020)

Source: https://webmachinelearning.github.io/webmcp/ . Accessed 2026-10-20 with the `read` tool, reader-markdown output (`Method: native`), not raw HTML. Quotes below are verbatim from that reader text, with link markup removed. Section numbers are the spec's own. Line numbers refer to the reader-text rendering and are not spec line numbers.

1. §1 Introduction: "expose their web application functionality as “tools” - JavaScript functions with natural language descriptions and structured schemas" [SPEC]
2. §4.1 Extensions to Document: "Each Document object has an associated ModelContext, which is a ModelContext object." [SPEC]
3. §4.2 ModelContext Interface: "The ModelContext interface provides methods for web applications to register and manage tools that can be invoked by agents." [SPEC]
4. §4.2 IDL: `Promise<undefined> registerTool(ModelContextTool tool, optional ModelContextRegisterToolOptions options = {});` [SPEC]
5. §4.2 registerTool method: "Returns a rejected promise if a tool with the same name is already registered" [SPEC]
6. §3 tool definition, name item: "The name’s length must be between 1 and 128, inclusive" (the character set follows in the same sentence: ASCII alphanumerics, `_`, `-`, `.`) [SPEC]
7. §3 Note on input schema: "This is the stringified representation of the inputSchema passed to registerTool()." [SPEC]
8. §4.4 Permissions policy integration: "Access to the APIs in this specification is gated behind the policy-controlled feature" (feature name `tools`, default allowlist `'self'`) [SPEC]
9. §3.1 and §4.3: `toolactivated` and `toolcancel` events exist on `ModelContext` objects, with `ToolActivatedEvent` and `ToolCancelEvent` [SPEC]
10. §3 tool execution error table: "tool not found" maps to `NotFoundError`; "invalid input" maps to `DataError` [SPEC]
11. §6.3.4 Violation of Same-Origin Boundaries: "TODO: Document risks and implications of agents carrying state from one origin to another." The spec is incomplete here [SPEC, TODO in source].

Negative grep over the same reader text (pattern set: `navigator.modelContext`, `toolname`, `tooldescription`, `declarative`, `Chromium`) returned no hits for the first four. It returned one hit for `Chromium`, which is an APC citation in §5.2 [OBS]. So the spec text contains no navigator surface and no declarative-form surface [OBS, reader text only]. The reader text may have dropped content. A raw-HTML re-fetch is an open item (see Recheck).

## What Chromium 154 exposes (PRE-probe; not reproduced by this seat)

Every item below comes from the PLAN pre-probe [PRE]. Each one carries a probe pointer. Until a probe writes a receipt, all of them stay [PENDING].

- With the feature-on flags, a loopback page has `document.modelContext`. [PRE] Probe: WebmcpProbeImperative, WebmcpHarness case "imperative".
- `'modelContext' in navigator` is false. [PRE] Probe: WebmcpHarness case "navigator absent".
- A declarative form `<form toolname="search" tooldescription="Search"><input name="q"></form>` yields CDP event `WebMCP.toolsAdded` with `{name:"search", description:"Search", inputSchema:{type:"object", properties:{q:{type:"string"}}, required:[]}, frameId, backendNodeId}`. [PRE] Probe: WebmcpProbeDeclarative, WebmcpHarness case "declarative positive".
- With no flags: `WebMCP.enable` returns `{}`, `document.modelContext` is absent, no event fires. [PRE] Probe: WebmcpProbeFlags, WebmcpHarness case "flag-off negative".
- `Bogus.enable` fails with "wasn't found". This shows the CDP domain lookup works; it does not show WebMCP-specific behavior. [PRE] Probe: WebmcpProtocol.
- Binary strings present: `kWebMCP`, `kWebMCPTesting`, `kDeclarativeWebmcp`, `kDevToolsWebMCPSupport`, `kWebMCPDeclarativeFileInput`, `kWebMCPFormAssociatedCustomElements`, `ModelContextRegisterToolOptions`, `FormModelContextMissingToolName`, `FormModelContextMissingToolDescription`, `FormModelContextParameterMissingName`, `FormModelContextParameterMissingTitleAndDescription`, `FormModelContextRequiredParameterMissingName`. [PRE] String presence is not behavior. These strings support a feature-existence claim only. They do not show when the errors fire. Probe: WebmcpProbeIssues.

## Decision table

Only rows marked ADMISSIBLE may be asserted in the knowledge note. Everything else is blocked until the named evidence exists.

| # | Claim | Evidence needed | Admissible now? |
|---|---|---|---|
| D1 | Spec defines the WebMCP surface as `document.modelContext` with `registerTool`, `getTools`, `executeTool` | S020 quotes 2–4 | ADMISSIBLE (spec-side only, [SPEC]) |
| D2 | Spec defines a tool-name grammar of 1–128 chars from `[A-Za-z0-9_.-]` | S020 quote 6 | ADMISSIBLE (spec-side only) |
| D3 | Spec gates the API behind the `tools` permissions-policy feature, default `'self'` | S020 quote 8 | ADMISSIBLE (spec-side only) |
| D4 | Chromium 154 with flags exposes `document.modelContext` | Probe receipt with `document.modelContext` typeof=object, from the harness | BLOCKED: [PENDING] |
| D5 | Chromium 154 does not expose `navigator.modelContext` | Probe receipt, `'modelContext' in navigator` false | BLOCKED: [PENDING]. Spec-side absence is [INF] from negative grep only. |
| D6 | Declarative `<form toolname>` registers a tool, with exact name/description/schema | Harness receipt case "declarative positive", plus `WebMCP.toolsAdded` payload | BLOCKED: [PENDING]. Spec is silent (no `toolname` in S020), so this is a Chromium-only claim and must be labeled as such. |
| D7 | Flag-off: no `document.modelContext`, no `toolsAdded` | Harness receipt, flag-off case | BLOCKED: [PENDING] |
| D8 | `WebMCP.enable` succeeds with flags off | Harness receipt | BLOCKED: [PENDING]. PLAN gives `{}` as pre-probe. |
| D9 | Unregistering via `AbortSignal` causes `WebMCP.toolsRemoved` | Harness receipt, abort case. Spec side: §4.2 `registerTool` options with `signal`, example abort/re-register [SPEC] | BLOCKED: [PENDING] for the Chromium event. The spec side is ADMISSIBLE as "spec describes signal-based unregistration". |
| D10 | Navigation clears tools | Harness receipt, navigation case | BLOCKED: [PENDING]. Spec-side reasoning: the model context is per Document (S020 quote 2), so a new Document has a new context [INF]. Not stated as a rule in S020. |
| D11 | Malformed declarative form (no `toolname`) yields no tool, plus an issue | Harness receipt, malformed case, `Audits.issueAdded` payload | BLOCKED: [PENDING]. Binary strings alone are not admissible. |
| D12 | Tool names with characters outside the spec grammar are rejected in declarative form | No case yet in PLAN. Would need a new fixture. | BLOCKED: [UNK] |
| D13 | Chromium's `inputSchema` in `WebMCP.toolsAdded` is an object, while the spec stores `inputSchema` as a string | Probe payload, plus S020 quote 7 | BLOCKED: [PENDING]. Even then this is a representation difference (CDP serialization vs spec internal string), not a proven divergence. |
| D14 | Spec-level claims about `toolchange`, `toolactivated`, `toolcancel` events fire in Chromium | Not in PLAN | BLOCKED: [UNK] |
| D15 | Chromium 154 implements the `tools` permissions policy as the spec describes | Cross-origin iframe probe. Not in PLAN. | BLOCKED: [UNK] |

## Divergences (document.modelContext vs spec surface)

- Surface name: spec and PRE both use `document.modelContext` [SPEC, PRE]. Divergence on this name: none observed. Shape of `navigator` absence matches spec omission [INF].
- Declarative forms: the spec has no `toolname`, `tooldescription`, or form-based surface [SPEC, negative grep]. Chromium 154 carries `DeclarativeWebmcp` and form-related feature strings [PRE]. This is a Chromium-only surface beyond the spec text. It must not be presented as spec behavior.
- Events on the CDP layer: `WebMCP.toolsAdded` and `WebMCP.toolsRemoved` are CDP events [PRE]. The spec defines page-side events `toolactivated` / `toolcancel` / `toolchange` [SPEC]. No spec mapping for the CDP layer exists. Treat them as separate surfaces.
- Input schema representation: spec says a string [SPEC quote 7]. Chromium CDP payload shows an object [PRE]. Pending D13.
- Error surface: spec defines exception names (NotFoundError, DataError, OperationError, AbortError) [SPEC]. No Chromium probe for error names is in PLAN. [UNK]
- Spec is a CG draft with an acknowledged TODO (§6.3.4) [SPEC]. Chromium behavior is not governed by the draft's open items. Do not assume the draft is complete.

## Limits and unknowns

- Loopback only, `127.0.0.1`. No claim about any real site, extension, or agent.
- One Chromium version (154.0.8037.97). No claim about other versions. PLAN's "Chromium 152 unprobed" frontier is not addressed here.
- Flag-dependent: every feature-on claim depends on the four `--enable-features` and two `--enable-blink-features` flags above. Without them the surface is absent [PRE, flag-off case pending].
- Spec side read through reader-text output, not raw HTML. Links and some markup dropped. Test suite (wpt.fyi/results/webmcp) not consulted [OBS, reader fetch].
- Spec revision pinned at `cb3d1696…` as of 2026-10-20. The draft can change.
- No Chromium source file was opened by this seat. Primary Chromium source rows are placeholder B and are [UNK] until L1 or a seat opens them.
- Harness, fixtures, and receipts are not written by this seat. Everything marked PENDING waits on them.

## Recheck procedure

Run by L1 after integration. This seat did not run any of these steps.

1. Re-fetch the spec: `read https://webmachinelearning.github.io/webmcp/`. Confirm `meta-revision` still equals `cb3d16964ab3e92cfd5f09901ed0504373a906e8`. If it differs, every S020 quote must be re-checked against the new text.
2. Fetch the raw HTML (`read ...:raw`) to confirm the negative grep (`navigator.modelContext`, `toolname`, `tooldescription`, `declarative`). The reader may drop content.
3. Confirm the Chromium binary and version: `/usr/bin/chromium --version` must print 154.0.8037.97. Record executable sha256 in `corpus/evidence/round-16/webmcp/runtime-pin.json`.
4. Run the harness (L1 only): `node scripts/webmcp-loopback-round16.mjs`. Check that `corpus/evidence/round-16/webmcp/receipt.json` has schema `tabi-round16-webmcp-v1` and `summary` with `failed: 0`. Any failed case blocks the matching D-row.
5. Compare the CDP WebMCP domain from `/json/protocol` against `corpus/evidence/round-16/webmcp/protocol-domain.json`. Mismatch blocks D8 and D9.
6. Re-open S002 (CDP viewer) for the WebMCP domain and add a used-by line. Only then promote the CDP-event rows.
7. For any Chromium source claim, open the primary source this round with URL, access date 2026-10-20, a located quote of 25 words or fewer, and the fetch method. Otherwise keep it [UNK].
8. Only ADMISSIBLE rows (D1–D3) may be asserted in `corpus/knowledge/webmcp-chromium-loopback-round-16.md` before step 4 passes.
