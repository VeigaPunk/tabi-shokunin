VERDICT: ISSUES

Scope: `PLAN.md:108-133` (§C2 case list `:118-122`, receipt schema `:113-115`, counter `:131-133`)
against the round-16 note limits (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:69-73,115-129`),
the CDP domain committed at `corpus/evidence/round-16/webmcp/protocol-domain.json`
(`runs[*].protocolEndpoint.webmcpDomain`: 4 commands, 4 events, `InvocationStatus{Completed,Canceled,Error}`),
and the Chromium 154.0.8037.97 implementation read from googlesource at the tag
(`content/browser/devtools/protocol/webmcp_handler.cc`, `third_party/blink/renderer/core/script_tools/model_context.cc`,
`.../core/frame/local_frame_mojo_handler.cc`, `.../core/inspector/inspector_web_mcp_agent.cc`,
`third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`). I ran nothing: `corpus/evidence/round-17/`
and `.ufo/waves/round-17/probes/` did not exist at review time, so every "observable" verdict is source+prior-probe
anchored, not re-measured. The list is not wholly observable as written; repairs below are local to the plan/harness.

## Observability — 11 required ids

| id | observable on 154? | anchor / condition |
|---|---|---|
| invoke-imperative-success | YES | domain `invokeTool`→`invocationId`; `webmcp_handler.cc:96-117`; r16 probe echo (`WebMCPProbeInvoke.json` `invokeTool`/`toolRespondedEvent`) |
| invoke-imperative-throws | YES, but same CDP shape as `-rejects` | `model_context.cc:752-800` (`maybe_result` empty→AbortError "Failure" at `:791`; [INFERENCE] for a synchronous throw), `:856-868`, `inspector_web_mcp_agent.cc:220-243` |
| invoke-imperative-rejects | YES, not separable from `-throws` by status | both reach `OnToolExecuted` error → `ScriptToolError(kToolInvocationFailed)` **without a message** (`model_context.cc:863-866`) |
| invoke-unknown-tool | YES, deterministic | pre-check `local_frame_mojo_handler.cc:992-1005` → `webmcp_handler.cc:107-115` `-32602 "Tool not found"`, **no** toolInvoked (mirrors r16 probe) |
| invoke-input-schema-mismatch | YES; build does **not** validate | no schema use in `ExecuteTool`/`ExecuteV8Tool` (`model_context.cc:528-570,752-800`); inputSchema only in `BuildProtocolTool`; r16 `invalidInputInvoke` → `Completed`/`echo:undefined` |
| invoke-declarative-form | YES only with a named result channel | `ExecuteDeclarativeTool` `model_context.cc:696-750`; result via `respondWith`→`OnToolExecuted`, or agent navigation→`ComputeScriptToolResult` (JSON-LD scripts, `:146-180`), or cross-origin error `webmcp_handler.cc:144-150` |
| invoke-after-unregister | YES; needs an ordering clause | `toolsRemoved` (`model_context.cc:489-497`) then declaration lookup fails (`:500-505`) → `-32602` |
| invoke-concurrent-ids | YES; ids only, not order | domain "Response is sent before tool events"; post-then-callback `local_frame_mojo_handler.cc:995-1001` |
| invoke-flags-off-control | YES; the invoke error is **not** diagnostic | page surface off ⇒ no declarations ⇒ same `-32602` as unknown-tool; `-32000` only if `enable` skipped (`webmcp_handler.cc:62-66`) |
| invoke-iframe-frameid | YES for a same-origin iframe only | frame token lookup + target-ownership check `webmcp_handler.cc:72-86`; cross-origin ⇒ "FrameId does not belong to current target" |
| invoke-navigation-pending | CONDITIONALLY — only agent-initiated navigation | `DidFinishNavigation` ignores navigations without `GetScriptToolInvocationId()` (`webmcp_handler.cc:119-126`); only agent form submits carry it (`:128-156`) |

## High

H1. `invoke-navigation-pending` is not observable as named. A `Page.navigate` during an imperative
pending promise carries no script-tool invocation id, so `DidFinishNavigation` returns early
(`webmcp_handler.cc:120-126`) and no `toolResponded` is sent; `model_context.cc` has no document-destruction
path that fails `pending_executions_` (grep `pending_executions_` `:712,739,798,859` only). The only deterministic
forms are a declarative `toolautosubmit` navigation: same-origin ⇒ `Completed` with the new document's
`<script type="application/ld+json">` array (`ComputeScriptToolResult` `:146-180`), cross-origin ⇒
`Error`, `errorText "Cannot return tool results after a cross-origin navigation"` (`:144-150`). Repair: define the
case on the declarative channel, or prune per `PLAN.md:118` with this evidence. An absence/timeout predicate is the
r16 wave-1 flake pattern that produced `receipt-first-run-failed.json`.

H2. Predicate provenance is not mechanically bound. Only `producerSha256` is counter-checked (`PLAN.md:115,132`);
page-side observation code lives in fixtures, and `PLAN.md:113-115` says only "schema mirrors r16". r16 binds each
case to its fixture and cross-checks a counter-owned map (`.ufo/waves/round-16/measure.mjs:90-102,290-308`).
The r17 counter conditions (PLAN `:131-133`, C2Counter assignment) omit per-case `fixtureFile`/`fixtureSha256`,
summary-vs-case-list consistency, and the control cross-check (r16 `:277-280` `cases==passed==nCases`, `:311-313`).
Repair: copy the r16 checks verbatim, including the map, so a case cannot be re-pointed at a tool-less fixture
after the run; add "harness blob at REV contains every required id literal" so a pruned case cannot vanish silently.

H3. The receipt schema in `PLAN.md:113-115` contradicts the receipt it says to mirror. r16 nests `caseSetOk` at
`summary.caseSet.caseSetOk` (not `summary.caseSetOk`) and has **no** `runs[].gone` — closure lives at
`closure.pids[].gone` (`corpus/evidence/round-16/webmcp/receipt.json`: `runs[0]` keys `label,launchedArgs,pid,
effectiveArgv,webmcpArgvTokens,realExecutable,version`). A harness following the PLAN and a counter following r16
read different paths. Repair: pin one path in PLAN and in the counter; keep `closure` and `runs[].webmcpArgvTokens`
(the latter is what proves the control run had no WebMCP flags).

H4. `safety.toolInvocation` must not be copied. r16's receipt says `"none — ... no invokeTool/cancelInvocation/
executeTool/submit"`; an invocation receipt carrying that string is a false statement in committed evidence.
Repair: harness authors a new `safety` block; counter rejects the literal "none" in the r17 receipt.

## Medium

M1. `-throws` and `-rejects` are two fixtures for one CDP observable. Both fail through
`ToolFunctionFinishedCallback::HandleFailure` → `OnToolExecuted(unexpected)` → `ScriptToolError(kToolInvocationFailed)`
with **no message** (`model_context.cc:856-868`), and `WebMCPToolFailed` passes `error.message` as `errorText` and the
thrown value as `exception` (`inspector_web_mcp_agent.cc:220-243`). A predicate expecting the thrown text in
`errorText` is wrong; the text is in `exception.description`. Repair: assert `status:"Error"`, `output` absent,
`exception` present with `description` containing the fixture message; state in the note that the two ids are two page-side failure modes, not two CDP behaviours (else the case count overstates coverage).

M2. `cancelInvocation` / `Canceled` are uncovered. The domain declares the command and the enum member
(protocol-domain.json), and the source gives a deterministic path (`CancelTool` `model_context.cc:582-650`
aborts the signal → `OnToolFailed(kToolCancelled)`; `inspector_web_mcp_agent.cc:228-230` maps to `Canceled`).
No required id exercises it. Repair: add `invoke-cancel-pending` with a fixture tool awaiting `signal.aborted`, or record the omission as a note limit — "invoke" as a capability currently covers 3 of the 4 commands.

M3. `invoke-flags-off-control` as written can pass for the wrong reason. With the page feature off the invoke
returns the same `-32602 "Tool not found"` as `invoke-unknown-tool` (`local_frame_mojo_handler.cc:992-1005`);
without `WebMCP.enable` it returns `-32000 "WebMCP domain is not enabled"` (`webmcp_handler.cc:62-66`), which is a
domain-enable control, not a feature control. Repair: assert (a) control run argv has zero WebMCP tokens
(r16 `runs[].webmcpArgvTokens`), (b) `document.modelContext` undefined and zero `toolsAdded`, (c) no
`toolInvoked`/`toolResponded`, and pin which of `-32602`/`-32000` is expected.

M4. `PLAN.md:123-125` requires "the page-side observation (what `execute` received)" for every case; declarative
tools have no `execute`. Repair: per-case page-side observation — imperative: the recorded input object;
declarative: field values after fill + `toolactivate` (`model_context.cc:567-576`); controls: page-surface probe.

M5. Cross-origin cases collide with the loopback guard. `invoke-iframe-frameid` cross-origin and the cross-origin
navigation variant need a second loopback origin, but r16 confines page traffic to the exact origin
(`receipt.safety.claimScope`, `loopback.externalRequestCount`). Under the r16 guard the navigation is aborted →
`IsErrorPage` early return (`webmcp_handler.cc:120-123`) and the case is unobservable. Repair: either widen the
guard to "loopback origins" and restate `claimScope`/keep non-loopback count at 0, or constrain both cases to the
same origin and say so.

M6. Sourcing order. `corpus/SOURCES.md` ends at S040 (`:54`) and only L1 writes it (PLAN ownership table);
`PLAN.md:128-130` requires `source:` S041+ mined rows. A wave-1 scribe must not invent S### ids — the draft must
carry URLs and leave numbering to L1. Also: invocation is Chromium CDP, not spec, so a note citing S020/S030 for
invoke semantics is inadmissible under the r16 note's own decision table ("Spec says X for declarative or CDP
behaviour → no", note `:91-108`). The correct new rows are `webmcp_handler.cc` / `model_context.cc` /
`WebMCP.pdl` at the tag.

## Low

L1. `PLAN.md:123` "`WebMCP.invokeTool` → `invocationId`" is false for `invoke-unknown-tool` and
`invoke-flags-off-control` (protocol error, no id). Reword to "where the command succeeds".
L2. Keep predicates in the hashed harness; a separate predicates file is invisible to `producerSha256`.
L3. `invoke-concurrent-ids`: assert id-set membership and per-id pairing only, never completion order
(`local_frame_mojo_handler.cc:995-1001` posts execution after responding).
L4. `invoke-after-unregister`: assert `toolsRemoved` before the invoke, then `-32602` and zero invocation events;
otherwise it duplicates `invoke-unknown-tool`.
L5. `invoke-iframe-frameid`: state same-origin; the cross-origin variant tests CDP target ownership
(`webmcp_handler.cc:81-85`), not invocation, and r16's permissions-policy result rejects cross-origin/opaque
registration (note `:60`).

## What would make the capability claim overreach

1. Claiming invocation generally, instead of "flag-enabled Chromium 154.0.8037.97, loopback fixtures, CDP client"
   (r16 note `:39,96,122`).
2. Claiming agent-side / MCP-client invocation or "MCP tool invocation": out of scope (`:127-129`; note `:101`).
3. Claiming real-site invocation (operator approval absent, `corpus/README.md:302`).
4. Claiming input validation — the build demonstrably does not validate (`model_context.cc:752-800`, r16
   `invalidInputInvoke`).
5. Claiming navigation cancels pending invocations — only agent-initiated navigations do (H1).
6. Citing a control (`invoke-flags-off-control`) as evidence invocation works.
7. Counting the case list as N behaviors when 2 ids collapse to one observable (M1) or 1 is unobservable (H1).
8. Treating the page-side record as independent: it is the fixture's own log of what it received, and
   `output` is untrusted by the domain's own description ("prompt injection risk").
9. Citing the r16 probe (`WebmcpProbeInvoke.json`) as receipt evidence: it is prior provenance only; the r16
   note says "No tool is invoked in the receipt" (`:127`).

## What holds

The `invokeTool` path itself is real and source-anchored at the tag: browser handler `webmcp_handler.cc:58-117`,
renderer entry `local_frame_mojo_handler.cc:987-1006`, event surfaces `inspector_web_mcp_agent.cc:190-243`.
Eight of eleven cases are deterministically observable with schema-derived predicates (success, unknown-tool, input-mismatch, after-unregister, concurrent-ids, flags-off, same-origin iframe, declarative with a chosen channel). The two `status` values `Completed` and `Error` are reachable; `Canceled` is not in the list.

## Residual risk and verification gaps

- No run by me; C2Probe* output (`invoke-errorpaths`, `-declarative`, `-lifecycle`, `-concurrency`, `-frames`,
  `-controls`) will supersede every source-derived detail above. In particular `errorText` emptiness for the
  failure path is [INFERENCE] from `ScriptToolError(kToolInvocationFailed)` having no message argument.
- The fenced source read is at tag 154.0.8037.97; the installed binary reports `Chrome/154.0.8037.97` and its
  `/json/protocol` WebMCP domain matches the tag PDL (no `Annotation.debugging`), but binary≠source in principle.
  Do not cite the Blink `InspectorWebMCPAgent` for `invokeTool` — at the tag it implements only
  enable/disable/cancel plus the event probes; `invokeTool` lives in the content handler.
- No `lsp` device is mounted in this session (tool inventory has none; REA routes are lane-disabled), so no
  semantic caller/diagnostics pass was possible; all references come from source text and JSON, and this is
  recorded as unavailability, not as absence.

Files written: `.ufo/waves/round-17/w1/RevPlanC2.md`
