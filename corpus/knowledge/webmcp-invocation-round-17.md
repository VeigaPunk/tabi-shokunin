source: S041
source: S042
source: S043
source: S044
source: S045
source: S046
source: S047
source: S054
source: S048
verified-at: 2026-10-20 (round 17, Chromium 154.0.8037.97, loopback only)
recheck: on chromium package change; S041/S042/S044/S045 on-release (tag-pinned); S043/S046/S047/S048/S054 on-release

# Native WebMCP tool invocation on Chromium 154 — loopback CDP (round 17)

**Locally measured: yes, for one build, flag-enabled, loopback fixtures only.**
Receipt: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (schema
`tabi-round17-webmcp-invoke-v1`, `verdict pass`, 11/11 required cases, 4/4 supplementary
controls), produced by `scripts/webmcp-invoke-round17.mjs`; the receipt's `producerSha256`
is the sha256 of that harness file. One pre-receipt smoke run with two failing cases is kept as
`corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` (§Corrections).

This note extends `knowledge/webmcp-chromium-loopback-round-16.md`, whose receipt observed
registration and invoked no tool (`:127`). It changes no round-16 row. Round 16 did invoke tools
in its probes, e.g. `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` (echo tool,
`invocationId` → `toolInvoked` → `toolResponded` `Completed`, unknown tool `-32602`, a schema-violating input run as `Completed`, before
enable `-32000`) — probe evidence without run identity, controls or fixed predicates. What is
new here is the step from that probe to a receipt with run identity, plus seven behaviours
no round-16 artifact holds: throw/reject shape, declarative-form invocation, invocation after
unregistration, concurrent ids, iframe `frameId` routing, a pending invocation across a
navigation, and `cancelInvocation` → `Canceled`.

## Scope and runtime identity

| Item | Value | Evidence |
|---|---|---|
| Browser | Chromium `154.0.8037.97`; `/usr/bin/chromium` launcher (sha256 `eaed39c3…a172b`) execs `/usr/lib/chromium/chromium` (sha256 `95b17db7…b330a`) | receipt `.runtime.observed.chromium` |
| Runs | flagged pid 951249, flag-off pid 951978, domain-disabled pid 956298; each `gone:true`, `/proc/<pid>/exe` = `/usr/lib/chromium/chromium` | receipt `.runs[]`, `.closure.runs[]` |
| Flags | flagged: `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp --enable-blink-features=WebMCP,WebMCPTesting`; flag-off: none; domain-disabled: `--enable-blink-features=WebMCP --disable-features=DevToolsWebMCPSupport` as the last of two disable switches (Chromium honours only the last `--disable-features`, so the driver's default disable list was not in force there) | receipt `.flags`, `.runs[2].featureSwitches` |
| Driver | Playwright `1.64.0` owns the page and the loopback route guard; a raw Node WebSocket to the run's own DevTools port (`--remote-debugging-port=0`) records every CDP frame verbatim | receipt `.runtime.observed`, `.safety.cdpChannel` |
| Origin | `http://127.0.0.1:<ephemeral>`; `externalRequestCount 0`; `--host-resolver-rules` denies other hosts; `HOME`/`XDG_CONFIG_HOME` redirected (the launcher reads `chromium-flags.conf`) | receipt `.loopback`, `.flags.browserArgsAll` |
| Page-side record | each fixture `execute` POSTs what it received to the loopback server ledger `/__ledger`, independent of the CDP socket; a per-case nonce travels through `invokeTool.input`, `toolInvoked.input` and the ledger, and into `toolResponded.output` for the echo-type tools (5 of 15 records) | harness header; receipt `.cases[].actual`, `.server.ledger` |

## Cases (receipt, 11 required + 4 controls)

Predicates are fixed in the harness before the run; each case records the predicate text and
the sha256 of its function source.

| Case | Observed on 154 |
|---|---|
| `invoke-imperative-success` | `invokeTool` → 32-hex `invocationId`; `toolInvoked.input` is a JSON **string**; `toolResponded` `Completed`, `output` `echo:<nonce>`; `execute` received an object; one ledger entry |
| `invoke-imperative-throws` | `Error`, no `output` key, `errorText ""`, `exception {subtype:"error", className:"Error", description:"Error: round17-throw…"}` |
| `invoke-imperative-rejects` | same shape as throws; one CDP observable for both |
| `invoke-unknown-tool` | command error `{code:-32602, message:"Tool not found"}`; no WebMCP event, no `execute` |
| `invoke-input-schema-mismatch` | accepted and run: `Completed` `echo:undefined`; input passed through deep-equal (keys reordered) — **no `inputSchema` enforcement** |
| `invoke-declarative-form` | trusted `SubmitEvent` with `agentInvoked=true`, `:tool-form-active` matches, `respondWith` value returned as `Completed` output, no navigation |
| `invoke-after-unregister` | first call `Completed`; `abort()` on the `signal` passed in the options dictionary → `toolsRemoved` carries the tool; second call `-32602`; exactly one `execute` |
| `invoke-concurrent-ids` | two distinct ids, each paired with its own `toolResponded`; both sends precede the first response; two ledger inputs |
| `invoke-flags-off-control` | `document.modelContext` undefined, 0 tools, zero WebMCP argv tokens, `invokeTool` `-32602` (the error alone is not the control's evidence) |
| `invoke-iframe-frameid` | tool in a same-origin iframe: call with the child `frameId` → `Completed`, `toolInvoked.frameId` = child; same tool with the main `frameId` → `-32602`. The raw session recorded no `toolsAdded` for the iframe tool (recording gap; invocation is the asserted fact) |
| `invoke-navigation-pending` | imperative `slow-echo`: navigation started before `toolInvoked` arrived; `execute` entered (ledger); no `toolResponded` within the 8,000 ms window; no tools in the new document |
| control `invoke-before-enable` | `-32000 "WebMCP domain is not enabled"` |
| control `invoke-cancel` | `cancelInvocation` on a pending call → `toolResponded {status:"Canceled", errorText:""}` |
| control `invoke-declarative-navigation-result` | a `toolautosubmit` form that navigates completes with the new document's result (`Completed`) |
| control `invoke-domain-disabled` | page feature on (`document.modelContext` object), `WebMCP.invokeTool` → `-32601` (domain absent) |

## Decision table — what an invocation claim may assert from which evidence

| Claim | Evidence required | Admissible from this note? |
|---|---|---|
| "Tool T on page P, invoked with input I, returned O on build B" | one `invocationId` across `invokeTool`, `toolInvoked`, `toolResponded`; the same nonce in the page-side ledger; flags and fixture digests | yes: loopback fixtures, flags on, 154 only |
| "`invokeTool` returned an id, so the tool ran" | the id alone | **no**: the command answers before tool events (S041 line 68; S042 posts execution without waiting); outcome is `toolResponded.status` |
| "The tool failed with message M" | `status:"Error"` + `exception.description` | yes; `errorText` is empty on throw/reject, never read M from it |
| "Chromium validated the input against `inputSchema`" | — | **no**: mismatching input ran (`invoke-input-schema-mismatch`); the 154 Blink invoke path checks only JSON syntax and is-object (S042 `model_context.cc`; the row's anchor range 748-811 covers `ExecuteV8Tool`) |
| "A pending call is cancelled by navigation / unregistration" | — | **no**: navigation left no `toolResponded` in the window; unregistration mid-call does not cancel (lifecycle probe case `invoke-unregister-while-pending`, `.ufo/waves/round-17/probes/invoke-lifecycle.json`; not a receipt case); only `cancelInvocation` produced `Canceled` |
| "`toolResponded` identifies tool and session" | — | **no**: it carries `invocationId`/`status`/`output`/`errorText`/`exception` only; pair through `toolInvoked` (S041; S044 binds by id) |
| "Invocation works without the page feature" | — | **no**: flag-off has no `document.modelContext`; `WebMCP.enable` still returns `{}` |
| "Declarative invocation is spec behaviour" | — | **no**: declarative tools are outside the spec (S046; S043 removed them from `index.bs`); cite the receipt |
| "An agent or MCP client invoked the tool" | — | **no**: a test harness drove CDP; agent-side consumption is unobserved |
| "Invoking a real site's tool is safe" | — | **no**: only fixture-owned tools with no external effect were invoked |

## Spec versus this build

| Question | Spec / docs | Chromium 154 | Verdict |
|---|---|---|---|
| Agent-side invocation format | not prescribed (S043 `index.bs:1570-1572`) | CDP `WebMCP.invokeTool` (S041) | build-scoped, Chromium-only |
| Input to `execute` | object; schema not validated by the algorithm (S043 `:555-560`) | CDP takes an object; the page API's JSON-string form is deprecated from Chrome 155 (S047, corrected scope S054); the 154 string requirement is round-16 probe evidence, not S047 text | build-scoped |
| Unregistration mid-call | does not cancel in-flight work (S043 `:639-643`) | consistent in the lifecycle probe (`invoke-unregister-while-pending`), not in the receipt | agree (probe-level) |
| Error mapping | DOMException names (S043 `:260-301`) | CDP `Error` + `exception` RemoteObject with `errorText` separate (S041 lines 115-122); empty `errorText` observed (receipt) | different layers |
| Status vocabulary | DevTools UI adds "In Progress" (S048) | protocol `Completed`/`Canceled`/`Error` (S041) | key predicates on the protocol enum |

## Limits and unknowns

- One build, one host, flags on; Chromium 152, real sites and a default profile are untested; unflagged was run only as the negative control.
- Confinement is page-level; WebRTC, WebTransport and SharedWorker traffic are not recorded.
- The navigation result is bounded by its 8,000 ms window; declarative navigation completion is a separate control.
- The iframe tool's `toolsAdded` was not seen on the raw session; invocation by child `frameId` was.
- Cross-origin iframes, `Canceled` from page-side abort, and upstream web-test expectations (S045) are not re-run here.
- Tool names, schemas and outputs are page-declared untrusted data.
- Harness limits found by the round-17 wave-2 sentinel (`.ufo/waves/round-17/w2/SentinelHarnessAfter.md`):
  each run also opens an unauthenticated loopback DevTools port (`--remote-debugging-port=0`);
  an external SIGTERM yields a `verdict=fail` receipt rather than `could_not_evaluate`; temp
  profiles survive abnormal exits; downloads triggered by a page tool are not refused or recorded;
  the flagged run carries two `--enable-features` switches (Chromium keeps the last). None
  changes a case outcome (the receipt reproduced 7 times, `w2/ReRunHarness.md`); all are open debt.
- `predicate.fixedBeforeRun` is a literal in the harness; predicate provenance rests on
  `fnSha256` equal to the committed function source (`w2/CriticPredicates.md`), and
  `invoke-navigation-pending` proves absence of `toolResponded` within 8,000 ms only.

## Adjacency (report, never absorb)

- Integrator ruling (`corpus/lessons/round-16-verifier-spotcheck.md:141-142`): tabi owns live
  browser/CDP page observation including the WebMCP page-tool surface; kaidoku keeps CDP only
  as an REA provider surface. Reading "page-tool surface" as covering invocation of
  fixture-owned tools is tabi's own reading, recorded here only; `corpus/adjacency.tsv` has no
  invocation row, and the ruling's reach to revenger/kama is an open L0 question (fleet
  `.ufo/l0-questions.md:65`).
- Agent-side MCP plane: kumitate. Authoring tools for the operator's own properties: kake.

## Cross-references

- `knowledge/webmcp-chromium-loopback-round-16.md`: predecessor (registration); its `:61`
  "the signal passed as the second argument" means the `signal` of the options dictionary — a
  bare `AbortSignal` as the second argument unregisters nothing (lifecycle probe case
  `signal-form-ab`, `.ufo/waves/round-17/probes/invoke-lifecycle.json`).
- `knowledge/cdp-evidence-patterns.md`; `knowledge/chrome-remote-debugging-profile-boundary.md`.

## Corrections inside this round (append-only record)

- One pre-receipt smoke run failed two cases (`invoke-after-unregister` dropped an `observations`
  key; `invoke-navigation-pending` read `toolInvoked` before delivery); kept in
  `preflight-smoke-failed.json`. Navigation-pending's predicate hash is identical in both runs;
  after-unregister's pre-repair predicate text was not recorded, so "not weakened" is unproven for it.

## Recheck procedure

`node scripts/webmcp-invoke-round17.mjs --out /tmp/webmcp-invoke-recheck.json` from the lane
root (exit 0 pass, 1 a case failed, 2 could not evaluate). Compare
`.runtime.observed.chromium.version` and `realExecutableSha256` with this note; a change makes
every row historical until re-run. Compare `producerSha256` with
`sha256sum scripts/webmcp-invoke-round17.mjs`.

## Round-29 recheck at Chromium 156.0.8078.47 (2026-10-26; append-only)

S042 drifted at the current Stable tag and is superseded by **S109**. Still true at 156: the invocation id arrives before tool events, a throw/reject yields an empty `errorText`, `Canceled` only via `cancelInvocation`, and no `inputSchema` enforcement on imperative input. Stale: the S042 range `748-811` (`ExecuteV8Tool`) now sits at 156 `744-807` with the invocation id passed by value (old line 753), and `528-580` moved to `527-577`, where `toolactivated` is dispatched by `ModelContext::DispatchEvent(*ToolActivatedEvent::Create(...))` instead of a `WebMCPEvent` on the window (156 `:567-574`). Receipt and bytes: `corpus/evidence/round-29/release-pins/`; summary `corpus/knowledge/chromium-156-release-pin-recheck.md`. The 154 observations above stay true of the 154 build; earlier lines are not edited.

S045 (wave-1 attack `.ufo/waves/round-29/w1/CritSemanticDrift.md` §2): both cited lines of `executeTool-abort.https.html` survive verbatim at 156 (154:87 → 156:108, 154:113 → 156:134), so the release-pin counter computes `holds`, but the contract they witness changed: at 156 the test listens on `document.modelContext` for `ToolActivatedEvent`/`toolcancel` instead of `window`, and calls `executeTool(tool, {})` with an object instead of the JSON string `'{}'`. The event-order assertion therefore describes model-context dispatch at 156; the window-dispatch reading above is a 154 statement only.
