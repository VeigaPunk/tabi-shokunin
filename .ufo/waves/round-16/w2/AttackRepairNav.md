# AttackRepairNav — round 16 wave 2 (FALSIFY)

Seat: TabiR16.AttackRepairNav (critic, author-side; not non-author certification).
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (base `e38d2599…`). Access date 2026-10-20.
Target: the post-failure repair of case `navigation-clears-tools`. The first run expected `toolsRemoved`; the repair changed it to "no event, no stale tools", citing devtools-frontend `WebMCPModel.ts:192-203` and the lifecycle probe.

## Verdict: **BREAKS** (partly). The "no event" half HOLDS. The "no stale tools" half and the consumer rule BREAK.

The expectation change is not back-fitting. The oracle existed before the failure, the citation is accurate, and Chromium's backend source independently confirms that navigation sends no event. The repaired oracle overclaims in two places:
1. `staleToolsInNewDocument: []` is true by construction for this fixture pair, so it cannot fail.
2. The consumer rule published in the note and SKILL ("drop a frame's tools when that frame's default execution context is destroyed") does not match what the CDP wire carries on main-frame navigation. The harness never measures it.

## Evidence

### E1 — Only the expectation changed; the measurement did not (HOLDS, honest)
```
jq '{producerSha256, generatedAt, case: (.cases[]|select(.id=="navigation-clears-tools"))}' corpus/evidence/round-16/webmcp/{receipt-first-run-failed,receipt}.json
```
- First run: producer `cedccdf9…9779`, 14:46:36.879Z, `expected:{toolsRemovedOnNavigate:["search"]}`, `expectedProvenance:"harness-specified (navigation clears page-registered tools)"`, `actual:{toolsRemoved:[],toolsAddedAfterNavigate:[],getTools:[]}`, status fail.
- Repaired run: producer `961874e4…e1`, 14:48:16.345Z, `expected:{toolsRemovedOnNavigate:[],staleToolsInNewDocument:[]}`, `actual` identical to the first run, status pass.
- The failure is retained and labelled. The first guess was honestly marked "harness-specified".

### E2 — The oracle predates the failure (HOLDS)
```
jq '.generatedAt' .ufo/waves/round-16/probes/WebmcpProbeLifecycle.json   → "2026-10-20T14:37:35.273Z"
jq '.cases[]|select(.name=="cross_document_navigation")|{toolsRemoved}' …  → {"toolsRemoved": []}
```
The probe recorded no `toolsRemoved` on cross-document navigation 9 minutes before the first L1 run (14:46:36Z). L1 had the evidence and ignored it, then corrected. The probe was not built after the failure.

### E3 — The source citation is accurate and pinned (HOLDS)
```
curl 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/DEPS?format=TEXT' | base64 -d | grep devtools_frontend_revision
  → 424:  'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',
curl '…/devtools/devtools-frontend/+/66df492a/front_end/models/web_mcp/WebMCPModel.ts?format=TEXT' | base64 -d | sha256sum
  → c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632   (matches S036 "c23d575e…b632")
```
Lines 192-202 are `#executionContextDestroyed(...)`; line 194 reads "if (executionContext.isDefault && executionContext.frameId) {". The constructor subscribes it to `SDK.RuntimeModel.Events.ExecutionContextDestroyed`.

### E4 — Backend source independently confirms "no event" (HOLDS; stronger than the cited oracle)
```
curl '…/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT' | base64 -d | sha256sum
  → 1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475
grep -n -iE 'removed|Navigat|Detach|DidCommit' agent.cc agent.h
  → only agent.cc:178-191 WebMCPToolRemoved / agent.h:48
```
`toolsRemoved` is sent only from the `WebMCPToolRemoved` probe. Lines 180-183 read "LocalFrame* frame = document->GetFrame(); if (!enabled_.Get() || !frame) { return; }". The agent has no navigation or commit hook. The absence is a property of the code, not a timing artifact. The lane does not cite this direct oracle; it relies on the frontend's indirect evidence.

### E5 — Rerun reproduces the result (HOLDS)
```
node scripts/webmcp-loopback-round16.mjs --out /tmp/arn.wwdP/rerun-receipt.json
  → WEBMCP_CASE id=navigation-clears-tools status=pass … verdict=pass cases=11 passed=11
  → detail "navigation to plain.html: no toolsRemoved event; [search] absent from new document getTools"
```

### E6 — `staleToolsInNewDocument` cannot fail (BREAKS)
Harness `scripts/webmcp-loopback-round16.mjs:1020-1029`:
- `after = getToolsSnapshot(page)` calls page-side `document.modelContext.getTools()` in the new Document.
- `stale = registeredNames.filter(n => afterNames.includes(n))`.

The second fixture `plain.html` declares `expectedTools: []` and has no forms. A new Document gets a new ModelContext, so `stale` is `[]` for any Chromium behaviour that creates a new document.

Mutation probe (my own `/tmp/arn.wwdP/navprobe.mjs`; fixtures read from the lane, lane untouched; system chromium 154 with the harness flags):
```
node /tmp/arn.wwdP/navprobe.mjs
 run declarative-form → plain.html:
   getToolsAfter=[]          harnessPredicateStale=[]
   rawConsumerToolsAfter=[["3F0D0DAA…8B9F/search",2]]
 run declarative-form → declarative-form-copy.html (mutant: 2nd doc re-declares "search"):
   getToolsAfter=["search"]  harnessPredicateStale=["search"]   (a fresh registration, backendNodeId 8, gets flagged as "stale")
```
The predicate measures what the second fixture contains, not staleness.

It is also on the wrong surface. The claimed capability is **`webmcp-cdp-observation`**, and a CDP observer that keeps a registry from `toolsAdded`/`toolsRemoved` **does** hold a stale `search` after navigation:
- The main-frame `frameId` is unchanged across the navigation: `Page.frameNavigated frameId 3F0D0DAA…8B9F` is the same as the tool's `frameId`.
- The committed receipt shows the same thing: `.toolsAdded` after navigation still holds `{"name":"search","frameId":"BA6C673A…7C11"}`.

The note's wording "the old tools are absent from the new document's `getTools()`" is true only for the page API. Read as a CDP-observation result, "no stale tools" is the opposite of what a raw CDP consumer observes.

### E7 — The consumer rule does not match the wire and is unmeasured (BREAKS)
The note says (line 57): "A consumer must drop a frame's tools when that frame's default execution context is destroyed, as DevTools does (S036)". It repeats this at line 92 and in SKILL.md:1876 ("infer removal from execution-context destruction").

My probe enabled `Runtime` and logged all events after the second `page.goto`:
```
{"m":"Runtime.executionContextsCleared","params":{}}
{"m":"Runtime.executionContextsCleared","params":{}}
{"m":"Page.frameNavigated","frameId":"3F0D0DAA…8B9F","url":"http://127.0.0.1:39261/plain.html",…}
{"m":"Runtime.executionContextCreated","id":5,"auxData":{"isDefault":true,"type":"default","frameId":"3F0D0DAA…"}}
{"m":"Runtime.executionContextCreated","id":6,"auxData":{"isDefault":false,"type":"isolated",…}}
```
The navigation produced **zero** `Runtime.executionContextDestroyed`. The wire event is `Runtime.executionContextsCleared`, which carries no context id and no frameId.

DevTools only sees a "destroyed" event because its SDK synthesizes one. `RuntimeModel.ts` at the same pin (sha256 `a324bc3f…1e75b`), lines 111-118, `executionContextsCleared()`, loops `dispatchEventToListeners(Events.ExecutionContextDestroyed, contexts[i])`.

So a CDP consumer that implements the published rule literally, keying on `Runtime.executionContextDestroyed`, never drops the tools and keeps `search` stale. The harness cannot catch this: `attachCdp` (`:435-455`) subscribes only to WebMCP and Audits events and enables only `WebMCP`, `Audits` and `Page`. `Runtime` is never enabled, so receipt.json contains no context event. Even so, the note's admissibility row "Tool T was removed … execution-context destruction for navigation — yes" admits a rule that the round never measured.

### E8 — Minor provenance point
Note line 98 says "The first committed-code run (`receipt-first-run-failed.json` …)". Only one commit touches the harness:
```
git log --format='%h %ad' -- scripts/webmcp-loopback-round16.mjs
  → 8f7feb3 2026-10-20 11:54:43 -0300   (sha256 at 8f7feb3 = 961874e4…)
```
The first-run producer `cedccdf9…` was never committed, and its bytes are not retained; only the digest appears inside the receipt. The pre-repair harness therefore cannot be diffed. The expectation change for this case is still visible from the two receipts' `expected` blocks.

## Impacted axes
- **C2 capability `webmcp-cdp-observation`, honesty of the knowledge note:** "no stale tools" is wrong for a CDP observer (E6). The consumer rule names an SDK-synthesized event, not the wire event (E7).
- **C2 coverage, discriminating power:** the case still passes on its real assertion (`removedNames.length === 0`, which is discriminating and source-backed by E4). Half of its predicate is vacuous. I see no evidence that the 11/11 count or the C2 counter value is inflated; I did not run the counter.
- **Provenance:** the citation is accurate (E3) but indirect; the direct backend oracle is missing (E4). The "first committed-code run" wording is inaccurate (E8).
- **Not impacted:** this is not back-fitting. The observation is identical across both runs, the oracle predates the failure, and the failure is retained (E1, E2).

## Smallest safe correction
1. In the harness, replace the page-side `staleToolsInNewDocument` with an observer-side assertion:
   - add `Runtime.enable` and record `Runtime.executionContextsCleared`/`executionContextDestroyed`/`executionContextCreated`;
   - assert that a raw `toolsAdded`/`toolsRemoved` registry still holds `<frameId>/search` after navigation (the hazard);
   - assert that `executionContextsCleared` arrived before the new `frameNavigated` for that frameId.

   If the harness is not changed, drop "no stale tools" from expectation, detail and note, or relabel it "fresh-realm getTools() is empty (page API only)".
2. Note line 57/92 and SKILL.md:1876: state the wire rule. On main-frame cross-document navigation Chromium 154 sends `Runtime.executionContextsCleared` (no id), not `executionContextDestroyed`. Drop all tools for the frame on `executionContextsCleared`. For other cases, map `executionContextDestroyed.executionContextId` to `auxData.frameId`/`isDefault` from the earlier `executionContextCreated`. Mark the rule as unmeasured until step 1 lands.
3. Add the backend oracle `inspector_web_mcp_agent.cc` @154.0.8037.97 lines 178-191 (sha256 `1cc55ef9…8475`) as the direct source for "no `toolsRemoved` on navigation".
4. Note line 98: change "first committed-code run" to "first run of the uncommitted pre-repair producer `cedccdf9…` (bytes not retained)".

## Lane hygiene
- Read-only on the lane. The harness ran only with `--out /tmp/arn.wwdP/rerun-receipt.json`; the probe and its outputs are under `/tmp/arn.wwdP/`.
- `git status` shows untracked `corpus/evidence/round-16/measurement-binding.json`, mtime 11:57:18 -0300. That is before my first run (12:00), so it is not mine.
- No tools were installed or updated.
