VERDICT: PASS

Read-only recon of `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (sha256 `ff1157d3…174f6`,
156 lines) and `corpus/evidence/round-16/webmcp/protocol-domain.json` (sha256 `26d90b72…7459e`,
`tabi-round16-webmcp-protocol-v1`, 710 lines), corroborated by the round-16 invoke probe and receipt.
No browser launched, no lane write except this report, no tool installed.

## A. What is already known about the three messages

Wire contract, Chromium 154 `/json/protocol` (identical in both `protocol-domain.json` runs):

- Domain is `experimental: true`, `dependencies: [Runtime, Page, DOM]` (`protocol-domain.json:96-98`,
  again `:444-446`). It is advertised **with no flags**: run `noflags` (`:10`) and run `webmcp` (`:355`)
  each return 1,578,134 bytes / sha256 `126cf5fa…865e7d` / 58 domains, and
  `comparison.webmcpDomainPresentNoFlags` + `webmcpDomainIdentical` are `true` (`:703-708`).
- `invokeTool` (`:219-245`): `frameId` → `Page.FrameId` (`:223-226`), `toolName` string (`:227-231`),
  `input` **`type:"object"`**, "matching the tool's inputSchema" (`:232-236`); returns `invocationId`
  string, "Response is sent before tool events" (`:240-243`).
- `toolInvoked` (`:288-311`): `toolName` (`:292-295`), `frameId` (`:296-300`), `invocationId` (`:301-305`),
  and `input` **`type:"string"`** (`:306-310`) — the one asymmetry against the command. Observed value is
  the JSON text of the passed object (`WebmcpProbeInvoke.json` `toolInvokedEvent.input`; `jq -r … | jq -c .`
  re-parses to `{"text":"round16-invoke-probe"}`).
- `toolResponded` (`:313-345`): `invocationId` (`:317-321`), `status` → `InvocationStatus` (`:322-326`),
  `output` optional `any`, "Missing if `status` is anything other than Completed", flagged untrusted /
  prompt-injection (`:327-332`), `errorText` optional (`:333-338`), `exception` optional
  `Runtime.RemoteObject` (`:339-344`). **No `toolName`, no `frameId`** — pair by `invocationId` only.
- `InvocationStatus` = `Completed | Canceled | Error` (`:136-143`, again `:484-490`). `cancelInvocation`
  is declared (`:247-256`) and **never called** by any r16 probe (`grep -rn cancelInvocation
  .ufo/waves/round-16/probes/*.mjs` → one detection site at `:138`).
- `Annotation` (`:108-132`) names `readOnly`, `untrustedContent`, `consequential`, `autosubmit`; the only
  annotation any probe emitted is `{"autosubmit": true}` (2×, tool `autosub`, `WebmcpProbeDeclarative.json`).

Observed behaviour (probe `WebmcpProbeInvoke.json`, sha256 `8dee9bf6…8f87ea`; its `producerSha256`
`34bcb776…dac6d` == `sha256sum .ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs`, re-verified):

- Success: `invokeTool{frameId, toolName:'echo', input:{text}}` → `{invocationId:"FCE0008E…426C"}` (32-hex
  upper), then `toolInvoked` (same id, string input), then `toolResponded`
  `{status:"Completed", output:"echo:round16-invoke-probe"}` (`echoResultShape…MatchesInvokeResult:true`).
- Unknown tool: JSON-RPC `{code:-32602, message:"Tool not found"}` and **no** events (`unknownToolInvoke`;
  `.mjs:275-283`).
- Domain not enabled on that session: `{code:-32000, message:"WebMCP domain is not enabled"}`
  (`invokeBeforeEnable`; `.mjs:302-335` sends from a **second websocket to the same target** → enablement
  is per-session, not per-target).
- Input schema **not enforced**: `input:{}` vs `required:["text"]` → `status:"Completed"`,
  `output:"echo:undefined"`; no protocol error, no `errorText` (`invalidInputInvoke`; `.mjs:284-300`).
- `status:"Error"` appeared once, via the *page-side* `executeTool` object-input path:
  `toolInvoked.input` was the literal string `"[object Object]"`, then
  `{status:"Error", errorText:"Failed to parse input arguments"}` with no `output`/`exception`
  (`allWebmcpEvents[6..7]`). No throwing or rejecting `execute` was ever exercised.
- The note records only the thin version: `:69-76`, clauses at `:71-73`. It does not carry unknown-tool,
  pre-enable, schema-mismatch or Error-shape facts.

## B. Exact flags (do not re-derive)

- Flagged: `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp
  --enable-blink-features=WebMCP,WebMCPTesting` — receipt `.flags.enabled`, defined at
  `scripts/webmcp-loopback-round16.mjs:67-70`; note `:39`.
- Controls: `.flags.controlArgs` = `[]` (flags-off = absent, not disabled); `domainDisabledArgs` =
  `--enable-blink-features=WebMCP --disable-features=DevToolsWebMCPSupport` (`:71-74`, wiring `:1428-1429`);
  resolver rule `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1` (`:75`).
- Minimal set: any one of `--enable-blink-features=WebMCP`, `--enable-features=WebMCP`,
  `--enable-blink-features=WebMCPTesting`, `--enable-experimental-web-platform-features` (`:41-49`);
  explicit `--disable-blink-features=WebMCP` wins.
- Engine identity: receipt `.runtime.observed.chromium.realExecutableSha256` = `95b17db7…b330a`
  (`/usr/lib/chromium/chromium`), verified live today (`sha256sum` → `95b17db7512c…`); launcher
  `/usr/bin/chromium` = `eaed39c3…a172b`. Host still `Chromium 154.0.8037.97 Arch Linux`.
- The r16 invoke probe is **less isolated than the receipt**: `WebmcpProbeInvoke.mjs:31-36` has no
  resolver rule, `:100-101` spawns without the `HOME`/`XDG_CONFIG_HOME` redirect (`:230-236` in the
  harness), records no request count, and `cleanup` (`:69-73`) never removes the temp profile. Its
  `scope` string is a scope *statement*, not enforced confinement — do not cite it as such.

## C. "Limits and unknowns" (`:120-129`) — status for round 17

| r16 limit | r17 status |
|---|---|
| `:122` one build, one host, flags on; 152 and CfT 156 untested | keep verbatim |
| `:123-124` page-level confinement only; WebRTC/WebTransport/SharedWorker unblocked | keep; the invoking harness inherits it |
| `:125-126` protocol-domain capture leaves a re-created temp profile | keep for that capture; the invoke probe is worse (`:69-73`) |
| `:127` "No tool is invoked in the receipt; invocation is a probe observation only" | **must be superseded, never repeated** — this is the C2 delta |
| `:128-129` agent-side consumption unobserved; kimi-webbridge has no WebMCP surface | keep: a CDP harness invoking is not an agent consuming |

## D. Must NOT repeat in the round-17 note

1. `:127` "No tool is invoked in the receipt" — it becomes false; supersede with a pointer only (the draft
   does this correctly at `.ufo/waves/round-17/drafts/note-c2.md:13-15`).
2. Round-16 probe error paths as *new* knowledge: `-32602`, `-32000`, the non-validated mismatch are
   probe-only and must be re-observed under the receipt.
3. The receipt's `.safety.toolInvocation` text — "none — … no invokeTool/cancelInvocation/executeTool/submit"
   (`scripts/webmcp-loopback-round16.mjs:1600`); copying it into an invoking run makes the receipt's own
   safety block false.
4. `:39`/`:41-49` as new evidence: the flags are unchanged (PLAN `:113`); cite as inherited.
5. Any "input is validated" / "mismatch errors" claim: observed value is `Completed` + `echo:undefined`.
6. Any `Canceled`/cancel semantics: enum member exists, command never called.
7. Agent/MCP-client consumption inferred from a CDP invocation: `:128-129` still holds.
8. Declarative invocation as spec behaviour: declarative tools are outside the spec (`:85`, S030); never S020.
9. The 154 wire shape from S035 alone — S035 is `WebMCP.pdl` at **Chromium main**, not the 154 tag
   (`corpus/SOURCES.md:49`); the 154 shape is `protocol-domain.json`.
10. The `navigator.modelContext` / `data:` / flag narrative (`:22-28`, `:57-58`, `:67`) — one cross-reference.
11. Any implication the r16 probe was confined and request-counted like the receipt (see B).
12. A `toolResponded.toolName` field: it does not exist (`:313-345`).

## E. Must newly hold (round-17 note)

1. Header `source:` rows S041+ that are **mined, tier A, opened this round**. None exist yet:
   `corpus/SOURCES.md` last row is S040 at `:54`; `.ufo/waves/round-17/sources/` is absent (`ls`, exit 2).
   Every mechanism in §A rests on evidence files today, so each new mechanism needs its S041+ row.
2. Receipt fields mapped to real r16 anchors, not invented: `summary{cases,passed,failed,missing,caseSetOk}`
   ↔ `.summary`/`.summary.caseSet`; `producerSha256` binds the harness file (r16 `.producerSha256`
   `0adbbe0e…` == `sha256sum scripts/webmcp-loopback-round16.mjs`, verified); `runs[]{pid,argv,gone}` ↔
   `.runs[]` + `.closure.pids[].gone`; `realExecutableSha256`; `loopback.externalRequestCount` (r16 = 0).
3. Facts absent from every r16 artifact, one receipt case each:
   error shape when `execute` throws/rejects (`status`, `errorText`, `exception`, `output` absence);
   concurrent id pairing (no r16 data at all); invoke after `toolsRemoved` (`-32602` by analogy only →
   [INFERENCE]); invoking a **declarative form** tool (observed only, never invoked; `autosubmit` the only
   annotation emitted); flags-off invocation — r16 proves only `enable` → `{}` with no page feature and no
   `toolsAdded` (`:57`), and the draft's "no invocation path" (`note-c2.md:48`) is [INFERENCE] that must
   become the observed reply; iframe `frameId` invocation — the iframe tool does carry its own `frameId`
   (`:65`) but a second session's `enable` replayed only `top_tool` (`WebmcpProbeFrames.json`
   `findings.lateAttach_replay`); invocation in flight across navigation (no `toolsRemoved`, `:62`);
   per-session `enable` as a stated precondition of every invoking session.
4. A decision-table row for "tool T ran with input I and returned O": matched `invocationId` across the
   three messages, page-side record of what `execute` received, flags/origin/fixture sha.
5. A replacement safety statement: only fixture-owned read-only tools on loopback, never a real site, plus
   the honest `:123-124` confinement scope.
6. `realExecutableSha256` as browser identity, never the launcher sha.
7. A recheck line comparing `.runtime.observed.chromium.version` and `producerSha256`.

## F. Harness traps implied by the evidence

- Call `WebMCP.enable` on every session that invokes; enablement does not cross sessions (`.mjs:302-335`).
- `invokeTool`'s ack precedes the events (`protocol-domain.json:241`): wait for `toolResponded`; `output`
  exists only for `Completed` (`:329`).
- `toolInvoked.input` is a JSON **string** — parse once, never string-compare against the command input.
- Key by `invocationId`; `toolResponded` carries no tool name or frame id.
- Do not gate `invoke-iframe-frameid` on `toolsAdded` replay from a second session.

`.ufo/waves/round-17/probes/invoke-concurrency.json` already exists (sibling C2Probe artifact, in flight,
`capturedAt 2026-10-20T15:49:30Z`, `producerSha256: null`) and reports
`verdict.respondedCarriesToolName:false`, `invocationIdUnique:true`, `completionOrder:[beta-fast,alpha-slow]`.
Those are that seat's claims; the note must not adopt them until the probe is committed.

Files written:
- `.ufo/waves/round-17/w1/ReconWebmcpNote.md`
