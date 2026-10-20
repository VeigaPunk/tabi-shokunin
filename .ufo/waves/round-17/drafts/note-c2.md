source: <<S041+ — round-17 rows opened this round, tier A, mined; ids unassigned, sources/*.md not yet written>>
verified-at: <<RECEIPT-DATE>> (round 17, Chromium 154.0.8037.97, loopback only)
recheck: on chromium package change; <<S0xx>> on-release

# Native WebMCP tool invocation on Chromium 154 — loopback CDP (round 17)

**Locally measured: yes, for one build, flag-enabled, loopback fixtures only.**
Receipt: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (schema `<<RECEIPT-SCHEMA>>`,
`<<RECEIPT-SUMMARY>>`), produced by `scripts/webmcp-invoke-round17.mjs`; the receipt's
`producerSha256` (`<<RECEIPT-PRODUCER>>`) is the sha256 of that harness file. Any failing earlier
run is kept as `receipt-first-run-failed.json` and disclosed in §Corrections.

This note extends `corpus/knowledge/webmcp-chromium-loopback-round-16.md`, whose receipt observed
tool registration and invoked no tool (`webmcp-chromium-loopback-round-16.md:127`, "No tool is
invoked in the receipt"). It changes no round-16 row. The round-16 probe
`.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` (echo tool only) is probe evidence, not receipt
evidence; it is cited below only where it motivates a case.

## Scope and runtime identity

| Item | Value | Evidence |
|---|---|---|
| Browser | Chromium `154.0.8037.97`; `/usr/bin/chromium` launcher, engine `/usr/lib/chromium/chromium` | `webmcp-chromium-loopback-round-16.md:34-35`; receipt `.runtime.observed` |
| Launch | headless, fresh `--user-data-dir` per run, no user profile, never CDP port 9222 | `.ufo/waves/round-17/PLAN.md:112-113` |
| Minimal env | `HOME`/`XDG_CONFIG_HOME` redirected to a temp dir (isolates the launcher's `chromium-flags.conf`) | `scripts/webmcp-loopback-round16.mjs:17-20`, `:231-233` |
| Flags (flagged cases) | `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting` | `scripts/webmcp-loopback-round16.mjs:67-69`; PLAN `:113` (exactly as r16's flagged run) |
| Controls | flag-off run; `--disable-features=DevToolsWebMCPSupport` run | `scripts/webmcp-loopback-round16.mjs:71-74`, `:1428-1429` |
| Origin | `http://127.0.0.1:<ephemeral>`; loopback only | PLAN `:111-112`; `scripts/webmcp-loopback-round16.mjs:1599` (page-level abort scope); receipt `.loopback.externalRequestCount` = `<<RECEIPT>>` |
| Driver | `<<RECEIPT: driver name and version>>` | receipt `.runtime.observed` |
| Browser pids | `<<RECEIPT: runs[].pid, gone>>`; found in `/proc` by the run's unique profile path | `scripts/webmcp-loopback-round16.mjs:756-757` (argv token filter: feature switches only); `webmcp-chromium-loopback-round-16.md:112-116` |
| Invocation path | `WebMCP.invokeTool{frameId, toolName, input}` → `invocationId`; then `WebMCP.toolInvoked` and `WebMCP.toolResponded{status, output}` | probe `WebmcpProbeInvoke.json` keys `invokeTool`, `toolInvokedEvent`, `toolRespondedEvent`, `verdict.invocationPathExists:true` |

## Cases (11 required ids; L1 may prune an unobservable one with a recorded reason)

Each predicate is fixed in code before the run (PLAN `:124-125`). Observed values are receipt
values and stay placeholders until the run.

| Case | Fixture | Predicate (in code) | Observed |
|---|---|---|---|
| `invoke-imperative-success` | `imperative.html` | `invokeTool` returns `invocationId`; `toolInvoked` and `toolResponded` carry the same id; `status` `Completed`; `output` equals the page-side value `execute` received | `<<RECEIPT>>` |
| `invoke-imperative-throws` | `<<new fixture>>` | `execute` throws synchronously; `toolResponded.status` recorded as observed | `<<RECEIPT>>` |
| `invoke-imperative-rejects` | `<<new fixture>>` | `execute` returns a rejected Promise; status and output recorded as observed, not assumed | `<<RECEIPT>>` |
| `invoke-unknown-tool` | `plain.html` | `invokeTool` with a name never registered; expected JSON-RPC error (probe: `-32602 "Tool not found"`) | `<<RECEIPT>>` |
| `invoke-input-schema-mismatch` | `imperative.html` | `input` violating its own `inputSchema` (required field omitted); records whether the build rejects or runs the tool | `<<RECEIPT>>` |
| `invoke-declarative-form` | `declarative-form.html` | `invokeTool` on a `toolname` form tool; `toolResponded` recorded; no form submit (r16 harness never submits: `scripts/webmcp-loopback-round16.mjs:22-24`) | `<<RECEIPT>>` |
| `invoke-after-unregister` | `lifecycle.html` | tool registered as `registerTool(def, { signal })` (the options dictionary; a bare `AbortSignal` in the second position fires nothing and the tool stays invokable, `.ufo/waves/round-17/w1/C2ProbeLifecycle.md` item 8; re-runnable A/B in case `signal-form-ab`, `.ufo/waves/round-17/probes/invoke-lifecycle.mjs`: removed `["sigopt"]` only, `sigraw` returns `Completed`); `abort()`; predicate: `toolsRemoved {name, frameId}`, `getTools()` no longer lists the name, `invokeTool` → `-32602 "Tool not found"` with zero further events | `<<RECEIPT>>` |
| `invoke-concurrent-ids` | `imperative.html` | two overlapping `invokeTool` calls; each `invocationId` pairs with its own `toolResponded` | `<<RECEIPT>>` |
| `invoke-flags-off-control` | `imperative.html` (flag-off) | no page feature, no tool registered, so no invocation path; `WebMCP.enable` success is not feature evidence (`webmcp-chromium-loopback-round-16.md:57`) | `<<RECEIPT>>` |
| `invoke-iframe-frameid` | `frame-parent.html` + `frame-child.html` | tool registered in a same-origin iframe; `invokeTool` with the iframe `frameId` (`webmcp-chromium-loopback-round-16.md:65`) | `<<RECEIPT>>` |
| `invoke-navigation-pending` | `lifecycle.html` | `invokeTool` issued (tool timer 10 s), then same-origin navigation. Predicate: no `toolResponded` for the `invocationId` through ≥ 10,500 ms; no `toolsRemoved` for the old name; order `Runtime.executionContextsCleared` → `Page.frameNavigated` → new-document `toolsAdded`. Not asserted: `Canceled`, a frameId change (`.ufo/waves/round-17/w1/C2ProbeLifecycle.md` item 4) | `<<RECEIPT>>` |

Probe observations that motivated cases (round-16 probes, not receipt; re-observe under the receipt):
- `toolInvoked.input` is a JSON **string**; `toolResponded` carries `status` and `output`
  (`WebmcpProbeInvoke.json` `toolInvokedEvent`, `toolRespondedEvent`; `webmcp-chromium-loopback-round-16.md:71-74`).
- Unknown tool: `protocol_error` `-32602 "Tool not found"` (`WebmcpProbeInvoke.json` `unknownToolInvoke`).
- Input violating `inputSchema` (required field omitted) was **not rejected**: `Completed`, `output`
  `echo:undefined` (`WebmcpProbeInvoke.json` `invalidInputInvoke`). Hence `invoke-input-schema-mismatch`
  records observed behaviour and asserts no validation claim.
- Before `WebMCP.enable`: `protocol_error` `-32000 "WebMCP domain is not enabled"` (`WebmcpProbeInvoke.json` `invokeBeforeEnable`).
- Status enum `Completed | Canceled | Error` (`WebmcpProbeInvoke.json` `protocolDomain.types`, id `InvocationStatus`).
- The probe reports `testingApiPresent:false` (`WebmcpProbeInvoke.json` `verdict`); the invoke path used was CDP `WebMCP.invokeTool`, not a testing API.
- Lifecycle measurements (peer probe, Chromium 154 loopback; `.ufo/waves/round-17/w1/C2ProbeLifecycle.md`, repro `.ufo/waves/round-17/probes/invoke-lifecycle.mjs`; 8/8 predictions held):
  - `WebMCP.enable` must be sent on the **page** session: on the browser session it returns `-32601 "'WebMCP.enable' wasn't found"`; on the page session it returns `{}` (`C2ProbeLifecycle.md`, CDP placement note).
  - Reload with a pending invocation: no `toolResponded` in a 14,027 ms window; the new document re-announces each tool in its own `toolsAdded`; no `toolsRemoved` (item 6).
  - Close target with a pending invocation: `Target.detachedFromTarget` then `Target.targetDestroyed`; no `toolResponded` in a 10,502 ms window; a later `Runtime.evaluate` on that session returns `-32001 "Session with given id not found."` (item 7).
  - Unregistration mid-flight does not cancel: `toolsRemoved` at +1 ms, then `toolResponded` `Completed` at +2501 ms (item 3).
  - Imprecise wording to fix: `webmcp-chromium-loopback-round-16.md:61` says "the signal passed as the **second** argument". The measured requirement is the `signal` property of the options dictionary in the second argument.

## Decision table — what an invocation claim may assert from which evidence

| Claim | Evidence required | Admissible from this note? |
|---|---|---|
| "Page P's tool T, invoked with input I, returned output O on build B" | `invoke-imperative-success` (or `invoke-declarative-form`): matched `invocationId` across `invokeTool`, `toolInvoked`, `toolResponded`; page-side record of what `execute` received; flags and fixture bytes recorded | yes: loopback fixture, flags on, 154 only; never a real site (no operator approval: `webmcp-chromium-loopback-round-16.md:95`) |
| "`invokeTool` returned an `invocationId`, so the tool ran" | the `invocationId` alone | **no**: the id names an accepted request; the outcome is `toolResponded.status` and the page-side observation |
| "The tool's output is O" | `toolResponded.output` matched to its `invocationId` | yes for that run only; output is page-declared untrusted data (`webmcp-chromium-loopback-round-16.md:139-140`) |
| "Tool T rejected input that violates its schema" | `invoke-input-schema-mismatch` | **no** unless the receipt shows a protocol error; the probe shows the build ran the tool (`echo:undefined`) |
| "A throwing or rejecting tool reports `Error`" | `invoke-imperative-throws` / `-rejects` with observed `status` | only the observed status; `Error` is a member of the enum (`WebmcpProbeInvoke.json` `protocolDomain.types`) |
| "A tool was cancelled" | — | **no**: no case cancels; `Canceled` is a member of the enum only |
| "Tool T is unavailable after unregistration" | `invoke-after-unregister` with `toolsRemoved` for explicit removal | yes for explicit removal; navigation carries no event (`webmcp-chromium-loopback-round-16.md:62`) |
| "A pending invocation completes after navigation, reload or target close" | — | **no**: no `toolResponded` in the measured windows (`C2ProbeLifecycle.md` items 4, 6, 7); the invocation is dropped, not cancelled |
| "Unregistering a tool cancels its in-flight invocation" | — | **no**: `Completed` still arrived 2.5 s after removal (`C2ProbeLifecycle.md` item 3) |
| "Invocation works without the page feature" | `invoke-flags-off-control` | **no**: `WebMCP.enable` success is not feature evidence (`webmcp-chromium-loopback-round-16.md:97`) |
| "Declarative form tool invocation is spec behaviour" | — | **no**: declarative tools are outside the spec (`webmcp-chromium-loopback-round-16.md:85`; S030 `README.md:319`); cite the receipt and S033–S035, never S020 |
| "Page tools are MCP tool calls" | — | **no**: shared vocabulary only (S037); invocation shapes differ |
| "An agent or MCP client can invoke the tool" | — | **no**: agent-side consumption is not observed (`webmcp-chromium-loopback-round-16.md:128-129`) |
| "Triggering the page tool's side effects is safe" | — | **no**: the harness invokes only fixture-owned tools with no external effect; no claim about real-site tools |

## Spec versus this build

| Question | Spec / proposal | Chromium 154 observed / declared | Verdict |
|---|---|---|---|
| `executeTool` input | spec: optional `object` (`webmcp-chromium-loopback-round-16.md:87`) | required JSON `DOMString` (probe; `model_context.idl` seat-read, no SOURCES row) | build-scoped difference |
| Invocation CDP command | not in the spec; the CDP domain is Chromium-only (`webmcp-chromium-loopback-round-16.md:89`) | `WebMCP.invokeTool` exists (probe `verdict.invocationPathExists`); the experimental domain is declared in S035 (`corpus/SOURCES.md:49`) | Chromium-only, build-scoped |
| Invocation semantics (`execute` contract, sync vs promise, cancellation) | `<<SRC: S0xx — SrcSpecExecute row; spec text not yet opened this round>>` | `<<RECEIPT>>` | pending source row; until then no spec claim |
| Declared statuses `Completed` / `Canceled` / `Error` | `<<SRC: S035 WebMCP.pdl; SrcPdlInvoke row>>` | enum present in the 154 probe's `protocolDomain`; observed statuses per receipt | enum is source-declared; behaviour is receipt-observed |

## Limits and unknowns

- One build, one host, flags on; Chromium 152 and the Playwright-managed CfT 156 are untested (`webmcp-chromium-loopback-round-16.md:122`).
- Confinement is page-level only: WebRTC UDP/TCP, WebTransport and SharedWorker traffic are not blocked or recorded (`webmcp-chromium-loopback-round-16.md:123-124`).
- Protocol-domain captures leave a re-created temp profile after the browser is killed (`webmcp-chromium-loopback-round-16.md:125-126`); the invoke run inherits this unless `<<RECEIPT: profile cleanup>>`.
- Input validation at invoke time is not enforced on this build (probe `invalidInputInvoke`); no claim about other builds.
- Tool names, descriptions, inputs and outputs are page-declared untrusted data (`webmcp-chromium-loopback-round-16.md:139-140`).
- Probe-only observations are not receipt evidence until the receipt re-observes them.
- Real-site invocation is out of scope (operator approval absent, `webmcp-chromium-loopback-round-16.md:95`).
- A "no response" result for pending invocations is bounded by the measured windows (23,383 / 14,027 / 10,502 ms, each above the 10 s tool timer, `C2ProbeLifecycle.md` Limits); it is not established for other timers or builds.
- `cancelInvocation` and a mid-flight `AbortSignal` delivered to `execute` were not probed; no case may assert `status: "Canceled"` (`C2ProbeLifecycle.md`, predicates).
- Reload and close-target are peer measurements, not required ids; adopting either as a receipt case is the L1's decision.

## Adjacency (report, never absorb)

- **Integrator ruling (recorded; L1 writes the C3 row).** tabi owns live browser/CDP page
  observation, including the WebMCP page-tool surface; kaidoku keeps CDP only as an REA provider
  surface for shipped-artifact analysis (`corpus/lessons/round-16-verifier-spotcheck.md:141-142`;
  kaidoku `PROVINCE.md:53`, "Runtime observation (CDP)"). Whether "page-tool surface" covers
  invoking a page tool (an action, not observation) is `[INFERENCE]`: the ruling names the surface,
  not invocation (`:138-142`). This note reports that overlap and does not settle it.
- REA `discover_webmcp_tools` verb and MCP server registration: kaidoku (`webmcp-chromium-loopback-round-16.md:136-137`).
- Agent-side MCP plane: kumitate (`webmcp-chromium-loopback-round-16.md:137`).
- Authoring WebMCP tools for the operator's own properties: kake (`webmcp-chromium-loopback-round-16.md:137-138`).
- Trust of page-declared metadata and tool output (prompt-injection risk): unassigned between kasegi/kagi (`webmcp-chromium-loopback-round-16.md:138-139`).

## Cross-references

- `knowledge/webmcp-chromium-loopback-round-16.md`: predecessor; registration-only receipt. This note supersedes its `:127` "No tool is invoked" for Chromium 154 loopback only.
- `knowledge/cdp-evidence-patterns.md`: effective launch line and closure.
- `knowledge/chrome-remote-debugging-profile-boundary.md`: fresh run-owned profile; CDP shapes are build-scoped.
- `knowledge/webdriver-bidi-capability-matrix.md`: WebMCP is CDP-only; no BiDi module (`webmcp-chromium-loopback-round-16.md:147-148`).
- `knowledge/aria-loopback-round-13.md`: the loopback isolation contract this harness follows.

## Corrections inside this round (append-only record)

`<<RECEIPT-HISTORY: first-run-failed receipt and its case failures, if any; otherwise "none">>`

## Recheck procedure

`node scripts/webmcp-invoke-round17.mjs --out /tmp/webmcp-invoke-recheck.json` from the lane root.
Exit codes are expected to match the round-16 harness (0 pass, 1 a case failed, 2 could not
evaluate; `webmcp-chromium-loopback-round-16.md:153-155`) `[INFERENCE until the harness lands]`.
Compare `.runtime.observed.chromium.version` with this note; any version change makes every row
above a historical observation until re-run. Compare `producerSha256` with
`sha256sum scripts/webmcp-invoke-round17.mjs`.
