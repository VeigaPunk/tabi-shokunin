# CaseNavigationClearsTools — attack on receipt case `navigation-clears-tools`

Seat: `TabiR16.CaseNavigationClearsTools` (author-side reviewer; not non-author certification).
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (base `e38d2599…`). Access date 2026-10-20.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Lane left unmodified; all mutation probes ran on copies under `/tmp`.

## Verdict

| Question | Verdict |
|---|---|
| 1. Expectation from a named oracle **before** observation (QUALITY 17) | **BREAKS** — the passing `expected` was authored after the first observation; the first-run actual already satisfies the repaired predicate; the failing producer bytes are not retained. The named oracle and probe both predate the failure, so the repair is grounded, not invented. |
| 2. Is the pass vacuous? | **PARTLY** — `registeredNames.length > 0` and `removedNames.length === 0` are demonstrably live. The `staleToolsInNewDocument` half is a page-API, name-only check; it can be failed by a *fresh* same-name tool in the new document (mutation A), it never observes the CDP consumer registry the capability names, and the receipt contains no positive control that `getTools()` can return a non-empty list at all. |
| 3. Does the fixture bind? | **HOLDS at the revision, with a case-level gap** — both documents' digests equal their `b444ca8` blobs and the C2 counter returns 1 with no failures; but the case record binds only `declarative-form.html`; `plain.html` is bound only run-wide, and served bytes are not digest-verified per request. |

Overall: the observation is real and reproducible, and the case is not fabricated. As a QUALITY-17 negative control it does not hold as written: the passing expectation is post-observation, and half of the predicate measures the wrong surface for the claimed capability.

## 1. Reproduction and comparison (rerun)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-navigation-clears-tools.json
WEBMCP_CASE id=flags-off-negative-control status=pass
…
WEBMCP_CASE id=navigation-clears-tools status=pass
…
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-navigation-clears-tools.json
EXIT=0
```

Wall time 8.8 s; case `durationMs` 3064 vs 3057 in the committed receipt (the 3 s action window at `.mjs:1017-1018`). Producer of the fresh run: `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1`, equal to the receipt's `producerSha256`.

Fresh case vs committed receipt, deep-equal on `{status, expected, actual, detail, fixtureSha256, events, flags}`:

```
FRESH==RECEIPT: true
fresh producer: 961874e4…be1
receipt producer: 961874e4…be1
```

Observation is stable: both runs give `actual={toolsRemoved:[], toolsAddedAfterNavigate:[], getTools:[]}`, `events=["WebMCP.toolsAdded"]`, detail `navigation to plain.html: no toolsRemoved event; [search] absent from new document getTools`.

Counter load-bearing check:

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"…","c2_webmcp_held":1,"cited":["S020","S030","S031","S032","S033","S034","S035","S036"],
 "caseIds":[…11 ids…],"failures":[],
 "counterBlobAtRevisionSha256":"bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9", …}
$ node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2
{"…","c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"], …}
```

## 2. Oracle-before-observation — **BREAKS**

### 2.1 The first run had a guessed expectation, and the passing run's expectation was written after it

`receipt-first-run-failed.json` case (generatedAt `2026-10-20T14:46:36.879Z`):

```json
"expected": {"toolsRemovedOnNavigate": ["search"]},
"expectedProvenance": "harness-specified (navigation clears page-registered tools)",
"actual": {"toolsRemoved": [], "toolsAddedAfterNavigate": [], "getTools": []},
"status": "fail"
```

`receipt.json` case (generatedAt `2026-10-20T14:48:16.345Z`), script `.mjs:1024-1037`:

```js
// Expectation repaired after the first L1 run (which expected toolsRemoved
// and failed) …
expected: { toolsRemovedOnNavigate: [], staleToolsInNewDocument: [] },
expectedProvenance:
  'source oracle: devtools-frontend WebMCPModel.ts:192-203 (pin 66df492a) …; ' +
  'corroborated by ….ufo/waves/round-16/probes/WebmcpProbeLifecycle.json cross_document_navigation; ' +
  'first L1 run expected toolsRemoved and failed (retained)',
```

So the expected literal used by the passing receipt was authored between 14:46:36Z and 14:48:16Z, i.e. after the first observation. The provenance says so itself.

### 2.2 The repaired predicate is satisfied by the failed run's own actual — no new observation distinguishes them

Evaluating the repaired pass condition (`.mjs:1029`) on the first-run case data:

```
FIRST-RUN actual satisfies repaired pass: true {"names":["search"],"removed":[],"after":[],"stale":[]}
```

The first run's `actual` and the final run's `actual` are byte-identical. The repair reclassified the same observation from fail to pass by changing the expectation, not by observing a difference.

### 2.3 Mitigation: the oracle and corroborating probe both predate the failure

- S036 row: `corpus/SOURCES.md:50` — `WebMCPModel.ts`, pin `66df492aaa0129d090937e933dd44c5389ab24d2`, lines 192-203, sha256 `c23d575e…b632`, mined 2026-10-20.
- Re-opened this session (access date 2026-10-20) at
  `https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts:192-202`:
  `#executionContextDestroyed … if (executionContext.isDefault && executionContext.frameId) { … this.#tools.delete(executionContext.frameId); this.dispatchEventToListeners(Events.TOOLS_REMOVED, toolsToRemove); }`
  (≤25 words quoted of the handler body). The cited range is exact; the dispatch is at line 199.
- Probe `WebmcpProbeLifecycle.json` `generatedAt 2026-10-20T14:37:35.273Z` (9 min before the first harness run; file mtime 11:37:45 -0300). In its `cross_document_navigation` segment (seq 65→76), `WebMCP.toolsRemoved` count = **0**, while `toolA` had been announced before the navigation (seq 50). The probe was not built after the failure.

So the repair used pre-existing evidence. The defect is ordering, not fabrication: the author had the oracle and the probe before the first run and still shipped a guess; the corrected expectation was authored post-observation.

### 2.4 The red→green witness is not same-checker and cannot be re-run

- First-run producer: `cedccdf9b649fcead09b391cfe7b34fcbcb992ce503aac8adf21a55699149779` (inside the retained receipt only).
- The harness exists in exactly one commit and hashes to `961874e4…be1` there:
  ```
  $ git log --all --format='%h %ci' -- scripts/webmcp-loopback-round16.mjs
  8f7feb3 2026-10-20 11:54:43 -0300
  $ git cat-file blob $(git rev-parse 8f7feb3:scripts/webmcp-loopback-round16.mjs) | sha256sum
  961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  -
  ```
- `cedccdf9…` is reachable in no commit; a repo-wide blob search by a sibling seat found no match (`AttackRepairNav.md`, `RevengeFirstRun.md`). The failing checker's bytes are therefore unavailable, so the red→green pair cannot be reproduced with the same checker.

This also makes the note's wording "The first committed-code run (`receipt-first-run-failed.json` …)" inaccurate: the failing producer was never committed (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:98`; `.mjs` lands in `8f7feb3` at 11:54:43, after both runs).

### 2.5 Provenance overclaim for the second key

`staleToolsInNewDocument: []` is not covered by the cited oracle. S036 is the DevTools **frontend** registry (it reacts to an execution-context-destroyed event); it does not speak about the page's `document.modelContext.getTools()`. The probe's only `getTools` occurrences are method-name enumerations (`WebmcpProbeLifecycle.json:474,1789`); it never calls `getTools` or records a page-side snapshot. That expected key is a generic fresh-document expectation, and the provenance sentence names no oracle for it.

## 3. Is the pass vacuous? — **PARTLY**

Pass predicate, `.mjs:1029`:

```js
const pass = registeredNames.length > 0 && removedNames.length === 0 && Array.isArray(after) && stale.length === 0;
```

Mutation probes: fixtures copied to `mktemp -d` under `/tmp`, harness run from the lane with `--fixtures /tmp/<…>/fixtures` and `--out /tmp/…json`; lane untouched.

### M1 — stale clause is live, but flags a *fresh* same-name tool (`/tmp/w2-nav-mutA.O3zedW`)

`plain.html` gets an imperative `registerTool({name:'search', …})`.

```
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
nav: {"status":"fail","actual":{"toolsRemoved":[],"toolsAddedAfterNavigate":[{"name":"search", … "url":"http://127.0.0.1:33111/plain.html"}],"getTools":[{"name":"search"}]},"detail":"registered=[search] removed=[] stale=[search]"}
```

This proves (a) `getTools` can return a name on this build, and (b) the stale check is name-only: a freshly registered tool in the **new** document is flagged as "stale". It would catch a genuine leak only when the leaked name repeats; it cannot distinguish leak from fresh registration.

### M2 — precondition is live (`/tmp/w2-nav-mutB.guat80`)

`declarative-form.html` loses `toolname="search"`.

```
nav: {"status":"fail","actual":{"toolsRemoved":[],"toolsAddedAfterNavigate":[],"getTools":[]},"detail":"registered=[] removed=[] stale=[]"}
```

### M3 — the no-`toolsRemoved` clause is live (`/tmp/w2-nav-mutC.47MHFp`)

`declarative-form.html` removes its form at `DOMContentLoaded`.

```
nav: {"status":"fail","actual":{"toolsRemoved":["search"],"toolsAddedAfterNavigate":[],"getTools":[]},"events":["WebMCP.toolsAdded","WebMCP.toolsRemoved"],"detail":"registered=[search] removed=[search] stale=[]"}
```

So three of the four clauses can fail under fixture mutation; the pass is not structurally vacuous.

### What remains weak

1. **No in-receipt positive control for `getTools`.** The only `getTools` calls in `receipt.json` are this case (`[]`) and `declarative-missing-name` (`[]`). A `getTools()` that returned `[]` unconditionally would still pass this case. The cross-run evidence is the imperative probe `getTools_entries` (3 entries, `WebmcpProbeImperative.json` call 11) and mutation M1; neither is in the receipt. Q17's "positive control" clause is not met inside the artifact.
2. **Wrong surface for the named capability.** The case calls the page-side `document.modelContext.getTools()` (`.mjs:513-521`). The claimed capability is `webmcp-cdp-observation`. The receipt's own `toolsAdded`/`eventLog` still contains `search` after navigation and `events` has no removal, so a CDP consumer that keeps a registry from `toolsAdded`/`toolsRemoved` does hold the old tool. The sibling seat `AttackRepairNav` independently probed the `Runtime` wire and found `Runtime.executionContextsCleared` (no frameId), not `executionContextDestroyed`; `attachCdp` (`.mjs:435-455`) never enables `Runtime`. The page-API `[]` is true, but it does not certify the CDP observer.
3. **`Array.isArray(after)` is the only guard on the API call**; `getToolsSnapshot` returns `null` on a missing API/error (`.mjs:513-521`), which fails the predicate. That guard works; it is not a positive control.

## 4. Fixture binding — **HOLDS at the revision, gap at case level**

Digests at the measured revision:

```
$ git cat-file blob b444ca8:corpus/evidence/round-16/webmcp/fixtures/declarative-form.html | sha256sum
7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e  -
$ git cat-file blob b444ca8:corpus/evidence/round-16/webmcp/fixtures/plain.html | sha256sum
537793b5d4ac11f7c61f5bc526f506abb4692876f3d50672085b0addb0a7748d  -
$ sha256sum corpus/evidence/round-16/webmcp/fixtures/declarative-form.html
7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e  …/declarative-form.html
```

- Case record: `fixtureFile: "declarative-form.html"`, `fixtureSha256: 7816ea…350e` — matches.
- `plain.html` digest `537793…748d` is in `receipt.fixtures` and in the C2 counter's `inputsRead` (bound through `model-context-location` and `opaque-sandboxed-iframe`, whose `fixtureFile` is `plain.html`). C2 returns `failures: []`.
- Served evidence: `server.served` in both the receipt and the fresh run shows `declarative-form.html` (1100 B) immediately followed by `plain.html` (325 B) at the navigation case's position; both documents were fetched, and the byte counts match the inventory.

Gaps:

1. The case consumes **two** documents but its record binds only `declarative-form.html`. `plain.html` is bound only run-wide (and indirectly through other cases). For a "complete case-input manifest" (Q17), the case as an isolated unit is incomplete. `pushCase` (`.mjs:1344-1360`) takes one `fixtureFile`/`fixtureSha256`.
2. The server records `{path, bytes}` per request (`.mjs:324`) and serves from disk; the digest is computed at startup over the fixture inventory (`.mjs:1317-1328`). Served bytes are not hashed per response, so a mid-run file change with equal size would not be visible in the receipt. This is a TOCTOU-shaped residual, not an observed problem in this run (the committed blobs match and C2 passes).
3. The case's `actual` records no destination URL or navigation type; `attachCdp` sends `Page.enable` but subscribes only to WebMCP/Audits events, so `navigationType:"differentDocument"` is not captured (the probe captures it separately). Two-document delivery is inferred from `server.served` order, not recorded per case.

## 5. Findings by severity

1. **Major (Q17 ordering).** The passing expectation was authored after the first observation, and the first-run actual satisfies the repaired predicate; the failing producer bytes (`cedccdf9…`) are not retained, so the red→green witness is not reproducible and not same-checker. The oracle and probe predate the failure, so the repair is grounded and disclosed — the defect is that no named-oracle expectation preceded the first observation.
2. **Moderate (partial vacuity / wrong surface).** `staleToolsInNewDocument` is a name-only page-API check, not a CDP-registry check. The receipt has no positive control that `getTools()` can return a name; the CDP stream still holds `search` after navigation. The case cannot fail on the capability's actual consumer behaviour.
3. **Minor (manifest).** The case record binds one of the two documents; served bytes are not digest-verified per request; navigation type/URL not recorded in the case.
4. **Minor (provenance wording).** The note's "first committed-code run" is inaccurate; `cedccdf9…` was never committed. The provenance sentence overclaims oracle coverage for `staleToolsInNewDocument` (S036 is the frontend registry; the probe never calls `getTools`).

## 6. Residual risk and verification gaps

- The pre-repair harness cannot be re-run (bytes absent); the exact delta between `cedccdf9…` and `961874e4…` is unverified. The expectation change is visible from the two receipts' `expected` blocks.
- I did not reproduce the sibling's `Runtime.executionContextsCleared` probe; that claim is taken from `AttackRepairNav.md` E6/E7 and is flagged as cross-seat, not my measurement.
- C2's counter does not inspect `expectedProvenance`, expected-vs-actual ordering, or per-case input manifests; its `1` proves the receipt is internally consistent and digest-bound, not that Q17 is satisfied.
- No tools were installed or upgraded for this seat; nothing to record on the tooling directive.

## Appendix — commands run

```
node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-navigation-clears-tools.json
node -e '… deepStrictEqual(freshCase, receiptCase) …'                    → true
node .ufo/waves/round-16/measure.mjs b444ca8e… --claim C2                 → c2_webmcp_held 1, failures []
node .ufo/waves/round-16/measure.mjs e38d2599… --claim C2                 → c2_webmcp_held 0
git cat-file blob b444ca8:.../fixtures/{declarative-form,plain}.html | sha256sum
git log --all --format='%h %ci' -- scripts/webmcp-loopback-round16.mjs    → 8f7feb3 only
node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-nav-mutA.O3zedW/fixtures --out /tmp/w2-nav-mutA.json  → nav fail, stale=[search]
node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-nav-mutB.guat80/fixtures --out /tmp/w2-nav-mutB.json  → nav fail, registered=[]
node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-nav-mutC.47MHFp/fixtures --out /tmp/w2-nav-mutC.json  → nav fail, removed=[search]
curl -sSfL <S036 pin>/WebMCPModel.ts | nl -ba | sed -n '188,212p'          → #executionContextDestroyed at 192-202
```
