VERDICT: PASS

# C2 harness - WebMCP invocation over raw CDP as committed evidence (round 17)

Producer: `scripts/webmcp-invoke-round17.mjs` (new), sha256
`de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.
Receipt: `corpus/evidence/round-17/webmcp-invoke/receipt.json` (schema
`tabi-round17-webmcp-invoke-v1`), sha256
`0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346`;
stdout `receipt.stdout.txt`; `verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4`.
Every case predicate is hashed in the receipt (`predicate.fnSha256`, `fixedBeforeRun: true`);
predicates were written before the receipt run and never edited afterwards.

## Runtime / run identity (receipt-grounded)
- Chromium `Chrome/154.0.8037.97`; real exe `/usr/lib/chromium/chromium` sha256
  `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` (matches round-16
  `runtime.observed`); launcher `/usr/bin/chromium`; Playwright 1.64.0; Node 24.21.0.
- Runs (all real pid + `/proc/<pid>/cmdline` argv + gone after close):
  flagged pid 951249 gone=true port 42709 argv=49 tokens=2; flag-off pid 951978 gone=true
  port 40851 argv=47 tokens=0; domain-disabled pid 956298 gone=true port 42413 argv=49 tokens=1.
- Feature-switch last-wins audit (`runs[].featureSwitches`): flagged last
  `--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp` (ours, last);
  flag-off `webmcpInLastEnable=false`, zero WebMCP tokens in any enable switch; domain-disabled
  last `--disable-features=DevToolsWebMCPSupport` (`devtoolsSupportInLastDisable=true`).
- Loopback: `externalRequestCount=0`; closure `everyStopProof=true`; `strayProcesses=[]`;
  fixture server served 18 paths, denied 0; ledger entries 12; all temp profiles/HOME removed.

## Per-case observed payloads (verbatim clusters live in `receipt.cases[].actual` + `cdp.frames`)
1. `invoke-imperative-success` - invocationId `D30A04...DBC5` (matches `/^[0-9A-F]{32}$/`);
   toolInvoked input JSON `{"text":"success-..."}`; Completed `echo:success-...`; page execute
   object + ledger POST `{tool:echo,input:{text:...}}`; responded after invoked. PASS.
2. `invoke-imperative-throws` - Error; `output` absent; `errorText==""`;
   `exception{subtype:error,className:Error,description:"Error: round17-throw\n at execute ..."}`. PASS.
3. `invoke-imperative-rejects` - same Error shape with `Error: round17-reject`. PASS.
4. `invoke-unknown-tool` - command error `{code:-32602,message:"Tool not found"}`; no
   invocationId, zero WebMCP events, no page call, no ledger. PASS.
5. `invoke-input-schema-mismatch` - accepted and Completed (`echo:undefined`); `toolInvoked.input`
   and execute input deep-equal to the sent object (key order normalized); no Chromium-side schema
   rejection. Recorded as a divergence (`divergence:true`), not a pass-through of the declared schema. PASS.
6. `invoke-declarative-form` - trusted `SubmitEvent`, `agentInvoked=true`,
   `:tool-form-active=true`, `respondWith` callable returning `undefined`; Completed
   `{ok:true,q,via:"respondWith"}`; `navigationCount=0`; ledger POST `decl-form`. PASS.
7. `invoke-after-unregister` - first Completed `temp-ok:<nonce>`; `toolsRemoved` carries
   `temp-tool`; second call -32602 "Tool not found"; exactly one temp-tool execute and one ledger
   POST. PASS.
8. `invoke-concurrent-ids` - two distinct 32-hex ids, each paired by id to its nonce/output;
   both sends precede the first toolResponded (seq 9 < 14); page execute twice; ledger two inputs. PASS.
9. `invoke-flags-off-control` - no `document.modelContext` (`undefined`), `navigatorModelContext=false`,
   fixture readiness `{ok:false,reason:"no-modelContext"}`, zero toolsAdded, invokeTool -32602
   "Tool not found" (CDP-level, no events), argv carries zero WebMCP tokens. PASS.
10. `invoke-iframe-frameid` - child-frame invocation Completed `child-echo:<nonce>` with
    `toolInvoked.frameId` = child frame id (F04494EF..., != main); same name with the main frameId
    fails -32602 with no invocation; ledger child-echo input. Recorded observation: the raw
    page-target session received no `WebMCP.toolsAdded` for the iframe tool on this build
    (recording gap noted in `actual.toolsAddedNote`); invocation evidence is primary. PASS.
11. `invoke-navigation-pending` - imperative `slow-echo` still in flight when a non-agent
    `page.goto(plain.html)` replaces the document: invokeTool returned an invocationId; execute
    was entered (ledger POST + sessionStorage); `Page.frameNavigated` to plain.html observed;
    `toolResponded` absent for the whole 8000 ms window (`responded:null`, `windowMs:8000`), and
    the new document exposes no tools. The toolInvoked event (seq 12) arrives during
    navigation start, before frameNavigated (seq 13) - observed absence, no cancellation claim. PASS.

## Controls (supplementary, all pass)
- `invoke-before-enable` - -32000 "WebMCP domain is not enabled".
- `invoke-cancel` - `WebMCP.cancelInvocation` on a pending slow-echo -> Canceled, `errorText=""`,
  no output (L1 asked to include cancel if observable; it is observable).
- `invoke-declarative-navigation-result` - declarative `toolautosubmit` without preventDefault
  navigates to `invoke-decl-result.html?q=<nonce>` and completes with the landing document's
  ld+json array `[{result:"round17-nav",ok:true},{second:1}]`; this is the complement to case 11,
  kept out of the eleven-case summary.
- `invoke-domain-disabled` - API present, -32601 "'WebMCP.invokeTool' wasn't found"; last disable
  switch carries DevToolsWebMCPSupport.

## Failures kept / preflight record
No failed official first run: the receipt command's first full run passed and is the committed
receipt. Two pre-receipt smoke runs (to /tmp) failed and are preserved as
`corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json`:
(i) `invoke-after-unregister` TypeError from a dropped `observations,` key in that case's return
object; (ii) `invoke-navigation-pending` read `toolInvoked` before it was delivered (early read,
not missing evidence). Both were wiring/predicate-read bugs in the harness, repaired before the
receipt run; no case behavior was changed to make it pass.

## Safety / confinement
Loopback `127.0.0.1:<ephemeral>` fixture origin only; temp `--user-data-dir`, temp HOME and
XDG_CONFIG_HOME (isolates Arch `chromium-flags.conf`); raw CDP WebSocket on a run-owned
`--remote-debugging-port=0` port; service workers blocked, WebSockets denied, host-resolver rules
deny non-loopback DNS; page requests to other origins are aborted and counted (0). `safety.toolInvocation`
now states invokeTool/cancelInvocation were exercised against the loopback fixtures' own tools and
that all payloads/outputs are untrusted target data. No real site, no user profile, no port 9222.

## Files written
- `scripts/webmcp-invoke-round17.mjs` (new producer)
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-imperative.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-declarative.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-decl-nav.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-iframe-child.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-iframe-parent.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-decl-result.html`
- `corpus/evidence/round-17/webmcp-invoke/fixtures/plain.html`
- `corpus/evidence/round-17/webmcp-invoke/receipt.json`
- `corpus/evidence/round-17/webmcp-invoke/receipt.stdout.txt`
- `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` (pre-receipt diagnostic run)
- `.ufo/waves/round-17/w1/C2Harness.md` (this report)

No tools installed or upgraded; no package-manager transactions; no `jj`/git write in LANE.
