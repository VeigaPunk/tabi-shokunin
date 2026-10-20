# Attack — decision table (note:84-95) vs receipt cases and sources

Seat: TabiR16.AttackNoteDecision (author-side critic; this is not non-author certification).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3`.
Target: `corpus/knowledge/webmcp-chromium-loopback-round-16.md:84-95` (decision table), note sha256
`91c0385b188a0e96c4a1febb3077f9ec1f7104fe4dedc52f0f99fb1ecd86ac22`.
Receipt: `corpus/evidence/round-16/webmcp/receipt.json`, sha256
`4429ed2303644755360c9a954087a4d00ed61289700956e9053db42dea172c1e`; producer
`scripts/webmcp-loopback-round16.mjs`, sha256 `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1`
(= receipt `.producer.sha256`, so the committed receipt was produced by the committed harness).
Access date for every re-opened source: **2026-10-20**.

## Verdict: **BREAKS (narrow)** — the direction of every row is sound, but row 1's admissible-scope
clause and row 5's navigation-evidence clause are false/unsatisfiable as written. Rows 2, 3, 6, 7
hold; row 4 holds with a wording defect. The 11/11 receipt itself is not invalidated.

## Per-row result

| Row (note line) | Claim | Verdict | One-line basis |
|---|---|---|---|
| 1 (88) | "Page P exposes tool T on build B" | **BREAKS (scope clause)** | "11 loopback fixtures … with flags" is false: 11 cases over 7 fixture files; 10 loopback + 1 `data:`; 9 full-flag + 1 partial + 1 no-flag; only 6 cases observed any tool |
| 2 (89) | "WebMCP is available in Chromium" | **HOLDS** | flags-off case: no `document.modelContext`, 0 `toolsAdded`; flagged cases: object + tools; the receipt supports only flag-gating, not a default-profile claim |
| 3 (90) | "`WebMCP.enable` succeeded, so WebMCP works" | **HOLDS** | flags-off case: `WebMCP.enable` → `{}` with `document.modelContext` undefined; domain-disabled case: `'WebMCP.enable' wasn't found` |
| 4 (91) | "No tools on page P" | **HOLDS; wording defect** | two full-flag secure cases (`model-context-location`, `declarative-missing-name`) record `toolsAdded: 0`, so the three-condition rule is demonstrable; only the `data:`-warning's "means nothing" is overbroad |
| 5 (92) | "Tool T was removed" | **BREAKS (evidence cell)** | direction is source-backed, but the event S036 names is the DevTools SDK's `ExecutionContextDestroyed` (synthesized); raw CDP 154 emits `Runtime.executionContextsCleared` (no id/frameId), and the receipt records neither |
| 6 (93) | "Spec says X" for declarative or CDP behaviour | **HOLDS** | S030 line 319: "it is not part of the specification at this time"; S035: `experimental domain WebMCP`; live S020 has zero "declarative" occurrences |
| 7 (94) | "Page tools are MCP tools" | **HOLDS** | S037: `tools/list` + `tools/call` returning a `content` array; receipt `protocolDomain`: `invokeTool` → `invocationId` then `toolInvoked`/`toolResponded`; vocabulary only |

## Findings

### F1 — S2/S3 — Row 1 overstates the tested surface (note:88)

The row says: `yes for the 11 loopback fixtures on 154 with flags`. That is not the receipt's shape.
Exact counts over the committed receipt:

```
$ node -e '
const r=require("./corpus/evidence/round-16/webmcp/receipt.json");
const full=JSON.stringify(r.flags.enabled);
let c={cases:r.cases.length,fixtures:r.fixtures.length,loop:0,data:0,full:0,partial:0,none:0,toolCases:0};
for(const x of r.cases){
 if(x.fixture.startsWith("data:")) c.data++; else c.loop++;
 const f=x.flags?JSON.stringify(x.flags):null;
 if(f===full)c.full++; else if(f)c.partial++; else c.none++;
 if((x.toolsAdded||[]).length>0)c.toolCases++;
}
console.log(JSON.stringify(c));'
{"cases":11,"fixtures":7,"loop":10,"data":1,"full":9,"partial":1,"none":1,"toolCases":6}
```

Per-case record (`toolsAdded` count | flag set | document kind):

```
$ node -e '
const r=require("./corpus/evidence/round-16/webmcp/receipt.json");
const full=JSON.stringify(r.flags.enabled);
for(const c of r.cases){
  const n=(c.toolsAdded||[]).length;
  const f=c.flags? (JSON.stringify(c.flags)===full?"FULL":JSON.stringify(c.flags)):"NONE";
  const loop=c.fixture.startsWith("data:")?"data:":"loopback";
  console.log([c.id,"toolsAdded="+n,f,loop,c.status].join(" | "));
}'
flags-off-negative-control | toolsAdded=0 | NONE | loopback | pass
devtools-domain-disabled | toolsAdded=0 | ["--enable-blink-features=WebMCP","--disable-features=DevToolsWebMCPSupport"] | loopback | pass
declarative-form-tool | toolsAdded=1 | FULL | loopback | pass
imperative-model-context | toolsAdded=1 | FULL | loopback | pass
lifecycle-removal | toolsAdded=2 | FULL | loopback | pass
navigation-clears-tools | toolsAdded=1 | FULL | loopback | pass
declarative-missing-name | toolsAdded=0 | FULL | loopback | pass
model-context-location | toolsAdded=0 | FULL | loopback | pass
frame-tools | toolsAdded=1 | FULL | loopback | pass
opaque-sandboxed-iframe | toolsAdded=0 | FULL | loopback | pass
data-url-declarative | toolsAdded=1 | FULL | data: | pass
```

So the admissible scope is not "11 loopback fixtures with flags". It is: **six cases that actually
observed a tool** — five loopback under the full flag set (`declarative-form-tool`,
`imperative-model-context`, `lifecycle-removal`, `navigation-clears-tools`, `frame-tools`) plus one
`data:` document under the full flag set (`data-url-declarative`). The other five cases are
absence/denial/control evidence: one no-flag launch, one partial-flag launch, and three full-flag
cases where no tool was announced (`declarative-missing-name`, `model-context-location`,
`opaque-sandboxed-iframe`). The note's own observation table (note:48-62) calls the set "11 cases"
and flags `data-url-declarative` as a divergence, so the decision row contradicts the body it
summarizes. The "11" is the receipt's case count, not a fixture count (the `fixtures` array has 7
files; the fixture directory has 7 HTML + README).

Smallest correction: `"yes for the six cases that observed a tool (five loopback + one data:
document), each with fixture sha256 and per-case flags; never for a real site …"`.

### F2 — S2 — Row 5's navigation evidence is the DevTools SDK event, not the CDP wire (note:92, also note:57)

Row 5 requires "`toolsRemoved` for explicit removal; **execution-context destruction** for
navigation" and admits "yes, but navigation emits no `toolsRemoved`". The removal direction is
source-backed (S036's `#executionContextDestroyed` deletes a frame's tools; the receipt's
`navigation-clears-tools` shows `toolsRemoved: []` and `getTools: []`). But a raw CDP consumer
cannot key on the named event. My probe (own `/tmp` copy of the two fixtures, same harness flags
and `/usr/bin/chromium`) logged every `Runtime`/`Page`/`WebMCP` event across the same navigation:

```
$ cd /tmp/w2-dec && node probe.mjs
VERSION {"protocolVersion":"1.3","product":"Chrome/154.0.8037.97","revision":"@b510e9d7cd3a2fbd78d0ddc42234103206c5f78d",...}
NAV-EVENTS
Runtime.executionContextsCleared
Runtime.executionContextsCleared
Page.frameNavigated {"frameId":"21C635C07950CF58E81852B6650E2665","url":"http://127.0.0.1:34369/plain.html"}
Runtime.executionContextCreated {"id":5,"aux":{"isDefault":true,"type":"default","frameId":"21C635C07950CF58E81852B6650E2665"}}
Runtime.executionContextCreated {"id":6,"aux":{"isDefault":false,"type":"isolated","frameId":"21C635C07950CF58E81852B6650E2665"}}
NAMES ["Runtime.executionContextsCleared","Runtime.executionContextsCleared","Page.frameNavigated","Runtime.executionContextCreated","Runtime.executionContextCreated"]
```

There is **zero** `Runtime.executionContextDestroyed`. The wire signal is
`Runtime.executionContextsCleared`, which carries no context id and no frameId; the new default
context is created afterwards under the same main-frame id. S036's
`#executionContextDestroyed(event)` is a **DevTools SDK** event: the frontend subscribes to
`SDK.RuntimeModel.Events.ExecutionContextDestroyed` at S036 lines 160-163, and its
`front_end/core/sdk/RuntimeModel.ts` synthesizes that event from `executionContextsCleared` at the
same pin, lines 111-118 (re-opened 2026-10-20; the sibling `AttackRepairNav` E7 read the same
two files). The receipt cannot verify the row's evidence cell either:
`navigation-clears-tools.actual` contains only `toolsRemoved`, `toolsAddedAfterNavigate`,
`getTools`; `attachCdp` (`scripts/webmcp-loopback-round16.mjs:443-450`) enables only `WebMCP`,
`Audits`, `Page` — never `Runtime` — so no context event is recorded.

Consequence: a CDP consumer that keys on `Runtime.executionContextDestroyed` (the wire name
matching S036's `#executionContextDestroyed`) waits for an event 154 does not send on main-frame
navigation and keeps the old `search` in its registry. The sibling
`AttackRepairNav` E6 measured the stale registry; my probe confirms the missing event. The
admissibility "yes" survives; the evidence instruction must name the wire event and the frame
mapping (drop the frame's tools on `executionContextsCleared` / `Page.frameNavigated`), not the SDK
event.

### F3 — S4 — Row 4's evidence requirement is demonstrable; only its data:-warning is overbroad (note:91)

The row reads: "absence on `data:`/non-secure origins means nothing about the page's intent;
declarative tools can still appear over CDP on `data:`". The evidence requirement is satisfiable
from the receipt: `model-context-location` and `declarative-missing-name` are loopback (secure
context), full-flag (page feature on), and `toolsAdded` is empty (`declarative-missing-name` also
records `getTools: []`). `attachCdp` calls `WebMCP.enable` before navigation for every case; the
per-case enable result is not stored for these two, but the same flagged run's tool-bearing cases
show the domain works:

```
$ node -e '
const r=require("./corpus/evidence/round-16/webmcp/receipt.json");
for(const id of ["model-context-location","declarative-missing-name"]){
 const c=r.cases.find(x=>x.id===id);
 console.log(id, JSON.stringify({doc:(c.actual.documentModelContextType??c.actual.documentModelContext),secure:c.actual.isSecureContext,nTools:(c.toolsAdded||[]).length,getTools:c.actual.getTools,issues:c.actual.issueErrorTypes}));
}'
model-context-location {"doc":"object","secure":true,"nTools":0}
declarative-missing-name {"getTools":[],"nTools":0,"issues":{"FormModelContextMissingToolName":4}}
```

So the row's three-condition rule is demonstrable; the note does demonstrate the absence protocol
for a secure, flagged page. The defect is in the warning's scope. The `data:` case shows
declarative tools **are** announced over CDP on a `data:` document (`isSecureContext: false`,
`documentModelContext: undefined`, `toolsAdded: 1`, `backendNodeId: 2`). If the mechanism fires
there, absence of `toolsAdded` on a `data:` page carrying a declarative form **is** informative for
declarative tools — it is not "nothing". "Means nothing" is true only for the imperative/page-API
axis (no `document.modelContext` on `data:`). Also, the "non-secure origins" half is probe-only and
page-API-scoped: the note's probe paragraph records `http://tabi.test` as "not a secure context and
has no `document.modelContext`" (note:65-66) and says nothing about declarative announcements
there, so the generalization to all non-secure origins is unproven.

Smallest correction: "On `data:`/non-secure origins `document.modelContext` is absent, so
`toolsAdded` absence cannot rule out imperative registration; declarative tools are still
observable over CDP on `data:` (receipt case), so state which path a no-tools claim covers."

### F4 — S4 — Row 1's "origin … recorded" is only harness-level, not per case (note:88)

The receipt records `server.bind: "127.0.0.1"`, `server.port: 43245`, per-case `fixtureFile` and
`fixtureSha256`, and the full `fixtures` array (paths, bytes, sha256). It does **not** record a
per-case URL/origin string; the `data:` case records `fixture: "data: (declarative-form.html
bytes)"` and no origin at all. The loopback origin is derivable
(`http://127.0.0.1:43245/<fixture>`), but a cold reader cannot read it from each case. If the
evidence requirement is meant to be per-case, record the URL; otherwise say "origin =
`http://127.0.0.1:<server.port>/<fixture>`" once.

### F5 — S4 — Row 1's "(or `getTools()`)" is weaker than it reads in this receipt (note:88)

`getToolsSnapshot` (`scripts/webmcp-loopback-round16.mjs:513-523`) maps each tool to `{name}` only.
The receipt's `declarative-form-tool.actual.getTools` is `[{"name":"search"}]` and
`imperative-model-context.actual.getTools` is `[{"name":"echo"}]`; no description or `inputSchema`
is recorded. A claim that needs the schema (the note's own declarative-form row records
`type/properties/required`) can therefore only use `toolsAdded`, not the receipt's `getTools()`
snapshot. The note's probe paragraph says page-side `getTools()` returns `inputSchema` as a JSON
string; that is probe-only and is not what the receipt records. Fix: say "`toolsAdded` (the
receipt's `getTools()` is names-only)" or widen the harness snapshot.

## Rows that hold — positive checks

- **R2 (note:89).** `flags-off-negative-control`: `documentModelContext` "undefined", navigator
  absent, `toolsAdded` 0; flagged `model-context-location`: `document.modelContext` object,
  `isSecureContext` true. The receipt's flags-off vs flagged pair supports "flag-gated"; the note's
  S034/probe citations are not re-opened in this item. The row's refusal of a default-profile or
  unflagged claim is conservative and correct.
- **R3 (note:90).** The same flags-off case records `webmcpEnableResult: {}` while
  `documentModelContext` is undefined; `devtools-domain-disabled` records
  `{"error":"cdpSession.send: Protocol error (WebMCP.enable): 'WebMCP.enable' wasn't found"}`.
  A successful send is therefore domain-presence evidence, not feature evidence. (The note's
  `protocol-domain.json` pointer at note:82 is independently correct: the committed artifact has a
  `noflags` run with `chromiumFlags: []` and `webmcpDomainPresentNoFlags: true`.)
- **R6 (note:93).** S030 re-opened (README, access 2026-10-20), §Future Exploration: Declarative
  API, line 319: "it is not part of the specification at this time" (10 words quoted). S035
  re-opened: line 7 "experimental domain WebMCP". Live S020 (`https://webmachinelearning.github.io/webmcp/`)
  has zero occurrences of "declarative". The row's "no" is exact.
- **R7 (note:94).** S037 re-opened (MCP Tools, access 2026-10-20): servers that declare the `tools` capability MUST
  answer `tools/list`; clients send `tools/call`; a call result is a `content` array (`resultType`,
  `isError`). The
  receipt's `protocolDomain.webmcp` declares `invokeTool` returning `invocationId`, then
  `toolInvoked`/`toolResponded` events. Shared `name`/`description`/`inputSchema` vocabulary,
  different list/call and result/lifecycle shapes — the row's "no" holds. S037 is marked `queued`
  in SOURCES, and the row discloses that; no overreach.

## Source re-opens (this session, access 2026-10-20)

- **S020** `https://webmachinelearning.github.io/webmcp/`: Draft Community Group Report, 20 October
  2026, `meta-revision: 51ed75653aaa7f174f8dbe05d1bc327359bbc57c`. §4.1 IDL:
  `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; }`.
  §4.4: "policy-controlled feature "tools", which has a default allowlist of 'self'" (10 words).
  The quote matches note:77; the **revision label does not** (see Adjacent).
- **S030** `https://github.com/webmachinelearning/webmcp/blob/main/README.md` line 319:
  "it is not part of the specification at this time" (10 words).
- **S035** `https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`
  line 7: "experimental domain WebMCP".
- **S036** `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts`
  lines 192-202: `#executionContextDestroyed(...)`; line 194 "if (executionContext.isDefault &&
  executionContext.frameId)"; it deletes the frame's tools and dispatches
  `Events.TOOLS_REMOVED`. The constructor subscribes it to
  `SDK.RuntimeModel.Events.ExecutionContextDestroyed` — an SDK event, not the wire event.
- **S037** `https://modelcontextprotocol.io/specification/2026-07-28/server/tools`: Tool definition
  fields `name`, `description`, `inputSchema`; `tools/list`; `tools/call` with a `content` result.

## Adjacent defect (outside the decision-table rows; not scored)

- **note:77** cites S020 §4.1 "rev `cb3d1696`". The live S020 today serves `meta-revision
  51ed7565…`; `cb3d1696` is the repo HEAD used by S030/S031
  (`cb3d16964ab3e92cfd5f09901ed0504373a906e8`). The quoted IDL is exact, so this is a revision
  label/freshness issue, not a content error: update to the served revision or label it "repo HEAD
  at read time".

## Residual risk and verification gaps

- One build, one host: Chromium `154.0.8037.97` (receipt runtime; my probe's
  `Browser.getVersion` product `Chrome/154.0.8037.97`, revision `@b510e9d7…`). Nothing here
  transfers to Chromium 152, CfT 156, or a default profile.
- The decision table's **directions** survive: no row wrongly admits a claim that the evidence
  cannot support, except the two scope/wire clauses above. The 11/11 receipt is unaffected; the
  first-run 8/11 receipt is retained and its three failures match the note's Corrections section.
- I did not run the whole harness or the counters; the receipt's producer digest matches the
  committed harness, and my probe was a minimal `/tmp` reproduction of the navigation event stream.
- F2 overlaps with the sibling `AttackRepairNav` E6/E7; my probe independently confirms the event
  gap, not the stale-registry measurement.
- No claim here is non-author certification.

## Lane hygiene

- Read-only on the lane. All probe code/output is under `/tmp/w2-dec/`; no lane file was written
  except this report. No tools installed or upgraded (none needed).
- `git status --porcelain` shows untracked `.ufo/waves/round-16/w2/` (the wave's reports, including
  this one) and `corpus/evidence/round-16/measurement-binding.json` (mtime 2026-10-20 11:57:18
  -0300, before my work; not mine).
