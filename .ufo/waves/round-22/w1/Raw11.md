# Raw11 — finite semantic oracle for `auto-positive`

Scout seat. Read-only: no production edits, no tests, no builds, no browser, no network, no REA, no installs.
All facts below are read from the retained round-21 acquisition at baseline
`5f585773258b33d2d514b00cd0b0775333578db6`; no expected value is derived from any round-22 receipt
(`corpus/evidence/round-22/` and `.ufo/waves/round-22/measure-c1.mjs` are absent at HEAD; confirmed by `ls`).

## 0. Evidence read (path + sha256)

| artifact | absolute path | sha256 |
|---|---|---|
| case evidence | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/auto-positive.json` | `62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe` |
| fixture | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/auto-positive.html` | `5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19` |
| receipt | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| producer | `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |
| acquisition record | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/runtime-execution-finalized.json` | file `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`; `receiptSha256 = 4bc79636…f937034`; `artifacts["…/auto-positive.json"] = 62f257e9…099e0fe`; `artifacts["…/auto-positive.html"] = 5bc14077…c7641a19` |
| frozen old counter (must not be edited; not an outcome oracle) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/measure-c1.mjs` | `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` |
| retained round-21 note (read only) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | line 42: `auto-positive` = “no page action; toolautosubmit present … response already present in initial window: Completed with dummy response object … held-ground positive control, not a new non-autosubmit branch” |

Round-22 note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and
`corpus/evidence/round-22/semantic-expectations.json` do not exist at HEAD. Their creation and the
S101 first-line provenance binding belong to BuildOracle/Scribe, not to this seat.

## 1. Observed facts for `auto-positive` (exact literals)

Fixture (`auto-positive.html`):

- Line 2: `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle" toolautosubmit action="/landing" method="get">`
- Line 3: `<label>Dummy<input name="q" required ></label><button id="go" type="submit">Run</button></form>` (no `type="email"`; the control is a plain required text input)
- Line 6: error listener pushes `e.message` into `observations.errors`.
- Line 8: submit listener records `{agentInvoked:e.agentInvoked, isTrusted:e.isTrusted, q:f.elements.q.value, active:f.matches(':tool-form-active'), respondWith:typeof e.respondWith}`.
- Line 9: `e.preventDefault()`; line 10: `const mode="success"`; lines 13–14 contain unreachable `reject`/`delayed` branches; line 15: `else e.respondWith(Promise.resolve(value))` with `value={ok:true,nonce,q}`.
- The only path that can produce a `WebMCP.toolResponded` for this fixture is entry into this submit listener
  and a call to `e.respondWith(...)`; the declarative `toolautosubmit` attribute is the only trigger, since the
  case dispatches no page action.

Receipt row (`receipt.json`, `cases[10]`, the 11th case):

- `id:"auto-positive"`, `nonce:"87f23377-4b21-45d9-b50b-2845277ff7d4"`, `autosubmit:true`, `action:"none"`.
- `invocationId:"4F3E02707F9A539DF7284C78EC392F5A"`, `invokeError:null`.
- `preAction:{start:1792590716712,end:1792590716965,windowMs:253,responseCount:1,formActive:false}`
  (`windowMs === end-start`; one `toolResponded` already exists before the pre-action observation).
- `after:{start:1792590716965,end:1792590717466,windowMs:501,responses:[<one Completed response>],submits:[<one submit record>],navigations:[],pageState:<equal to after-action observation>}`.
- Evidence pin `evidence.path = "corpus/evidence/round-21/runtime/auto-positive.json"`,
  `evidence.sha256 = 62f257e9…099e0fe`.

Evidence (`auto-positive.json`) — exactly 16 frames, `seq` 1..16, non-decreasing `at`:

| seq | dir | method / action / label | payload (exact) |
|---|---|---|---|
| 1–2 | sent/result | `Page.enable` | command 1, `{}` |
| 3 | event | `Page.frameNavigated` | `http://127.0.0.1:43143/auto-positive`, frame `F3C0371BCCA1541F1D77BAF77C53116B`, type `Navigation` |
| 4–6 | sent/event/result | `WebMCP.enable` | `WebMCP.toolsAdded` tool `{name:"lifecycle",description:"Dummy loopback lifecycle",inputSchema:{type:"object",properties:{q:{type:"string",description:"Dummy"}},required:["q"]},annotations:{autosubmit:true},frameId:"F3C0371BCCA1541F1D77BAF77C53116B",backendNodeId:2}` |
| 7–8 | sent/result | `Page.getFrameTree` | frame id `F3C0371BCCA1541F1D77BAF77C53116B` |
| 9 | sent | `WebMCP.invokeTool` @1792590716711 | command 4; `{frameId:"F3C0371BCCA1541F1D77BAF77C53116B",toolName:"lifecycle",input:{q:"87f23377-4b21-45d9-b50b-2845277ff7d4"}}` |
| 10 | result | command 4 @1792590716712 | `{invocationId:"4F3E02707F9A539DF7284C78EC392F5A"}` |
| 11 | event | `WebMCP.toolInvoked` @1792590716712 | `{toolName:"lifecycle",frameId:"F3C0371BCCA1541F1D77BAF77C53116B",invocationId:"4F3E02707F9A539DF7284C78EC392F5A",input:"{\"q\":\"87f23377-4b21-45d9-b50b-2845277ff7d4\"}"}` |
| 12 | event | `WebMCP.toolResponded` @1792590716712 | `{invocationId:"4F3E02707F9A539DF7284C78EC392F5A",status:"Completed",output:{ok:true,nonce:"87f23377-4b21-45d9-b50b-2845277ff7d4",q:"87f23377-4b21-45d9-b50b-2845277ff7d4"}}` — no `errorText` |
| 13 | observation | `pre-action` @1792590716965 | `{nonce:"87f23377-4b21-45d9-b50b-2845277ff7d4",submits:[{agentInvoked:true,isTrusted:true,q:"87f23377-4b21-45d9-b50b-2845277ff7d4",active:true,respondWith:"function"}],errors:[],url:"http://127.0.0.1:43143/auto-positive",secureContext:true,formExists:true,formActive:false,value:"87f23377-4b21-45d9-b50b-2845277ff7d4",focused:""}` |
| 14 | action | `action:"none"`, `phase:"no-action"` @1792590716965 | — |
| 15 | action-complete | `action:"none"` @1792590716965 | — |
| 16 | observation | `after-action` @1792590717466 | value object byte-identical to seq 13 (`pre.value === post.value` is `true`) |

Cleanup and boundaries (evidence, verified):

- `browserPidsBefore` = `[1810050,1810058,1810059,1810078,1810098,1810114,1810137,1810146,1810148]` (9 positive integers).
- `browserPidsAtClose` equals `browserPidsBefore` exactly; `browserPidsAfter=[]`; `browserPidsSeenAfterClose=[]`.
- `processIdentitiesAtLaunch` has 9 `{pid,startTicks}` records and deep-equals `processIdentities`;
  every launch pid appears in `browserPidsBefore`; the close pid set equals the launch pid set.
- `contextClosed=true`; no `closeError`; `blocked=[]`; `downloads=[]`.
- Receipt cleanup: `browserClosed=true`, `serverClosed=true`, keys exactly `["browserClosed","serverClosed"]`
  (no error fields); `startedAt=2026-10-21T13:51:46.773Z` < `finishedAt=2026-10-21T13:51:58.439Z`.
- Requests: `GET /auto-positive @1792590716700` is this case's only request. The only `/landing` request in the
  whole acquisition is `GET /landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4 @1792590710188`, which belongs to
  `na-native-submit` (its nonce) and precedes `auto-positive`'s page GET. No `/landing` carries the
  `auto-positive` nonce.
- Environment: `node v24.21.0`, `chromium 154.0.8037.97`, `playwright 1.64.0`, the four recorded `FLAGS` entries.

## 2. Finite semantic oracle for `auto-positive`

Fixed expectations are authored from the retained acquisition above and frozen. The oracle compares the
evaluated file map against them and **must not recompute expected status/output/error/page state from the
evaluated receipt** (a self-consistent mutant would otherwise pass). No predicate uses wall-clock time or the
frozen counter as an oracle.

### INV — invocation identity (fixed)

- `INV1` exactly one `dir:"sent", method:"WebMCP.invokeTool"` frame; `params.toolName === "lifecycle"`;
  `params` key set exactly `{frameId,toolName,input}`; `params.input` deep-equals
  `{q:"87f23377-4b21-45d9-b50b-2845277ff7d4"}` (the nonce, not `"not-an-email"`, not empty).
- `INV2` `params.frameId` is a non-empty string equal to the initial `Page.frameNavigated` frame id, the
  `Page.getFrameTree.frameTree.frame.id`, the `toolsAdded` tool `frameId`, and the `toolInvoked` `frameId`
  (all `F3C0371BCCA1541F1D77BAF77C53116B` in the retained bytes). The same frame id is used for the invoke
  and every event; no sentinel/placeholder frame id.
- `INV3` exactly one `result` answered the invoke command (`answered.length === 1`), with
  `result.invocationId === "4F3E02707F9A539DF7284C78EC392F5A"`, equal to the receipt `invocationId` and to the
  single `toolInvoked` and single `toolResponded` `invocationId`; `invokeError === null`; no `error`-dir frame.
- `INV4` `WebMCP.toolInvoked.params.input` parses to exactly `{q:"87f23377-4b21-45d9-b50b-2845277ff7d4"}`
  (serialized form `{"q":"87f23377-4b21-45d9-b50b-2845277ff7d4"}`) and its `toolName`/`frameId` equal the sent params.
- `INV5` exactly one `WebMCP.toolResponded` in the whole frame log; exactly one `WebMCP.toolsAdded`, whose tool
  is `lifecycle` with `annotations.autosubmit === true` and `inputSchema.required` containing `"q"`.
- `INV6` the invoke input carries the per-case nonce that the page echoes back (`pre.value.nonce`,
  `pre.value.value`), so a case cannot borrow another run's nonce and still pass.

### SEQ — pre/action/post sequence (fixed)

- `SEQ1` canonical order by `seq`:
  `invokeSent(9) < invokeResult(10) < toolInvoked(11) < toolResponded(12) < preObs(13) < action(14) < actionComplete(15) < postObs(16)`;
  `seq === index+1` for all 16 frames; `at` non-decreasing and finite.
- `SEQ2` the action frames are exactly one `dir:"action"` with `action:"none"`, `phase:"no-action"` and one
  `dir:"action-complete"` with `action:"none"`. No click/requestSubmit/submit/reset/remove/
  invalidRequestSubmit action exists for this case; the `none` action resolves without touching the page.
- `SEQ3` exactly one `pre-action` and one `after-action` observation (no extra observation labels, no
  `delayed-before-release`), and the observation frames carry the same `seq`/`at`/`value` as the named entries;
  `pre.at === receipt.preAction.end`, `post.at === receipt.after.end`.
- `SEQ4` the response precedes the action and the pre-action observation:
  `responded.seq === 12 < pre.seq === 13`; `responded.at <= pre.at`; the action frame lies in
  `[pre.at, post.at]` (retained `action.at === pre.at === actionComplete.at === after.start`).
- `SEQ5` no `Page.frameNavigated` after the initial load navigation: exactly one in the whole log (seq 3,
  before invoke), none with `at >= receipt.after.start`; `receipt.after.navigations === []`.

### OUT — exact status, output, error (fixed, not recomputed)

- `OUT1` the single `toolResponded.params.status === "Completed"` (exact string). `"Canceled"`/`"Error"`/
  `"Pending"` are mismatches, not alternates.
- `OUT2` `toolResponded.params.output` deep-equals exactly
  `{ok:true,nonce:"87f23377-4b21-45d9-b50b-2845277ff7d4",q:"87f23377-4b21-45d9-b50b-2845277ff7d4"}`;
  key set exactly `{ok,nonce,q}`; `output.nonce === output.q === case nonce`; `output.ok === true`.
  `output:null`, `{}`, or a foreign/different UUID is a mismatch.
- `OUT3` `toolResponded.params` key set exactly `{invocationId,status,output}`: **no `errorText` property**
  (not `undefined`, not empty string), and the response is not the native-validation family of `auto-invalid`,
  the rejected-promise text of `na-reject`, or the preventDefault/programming-error text of `na-throw`.
- `OUT4` `receipt.invokeError === null`; no `dir:"error"` frame; no second response; page `errors` empty
  (a Completed response must not coexist with an uncaught page exception).
- `OUT5` `receipt.after.responses` deep-equals `[toolResponded.params]` (length 1, same keys/values), and
  `receipt.preAction.responseCount === 1` equals the number of `toolResponded` events with `seq < pre.seq`
  — i.e. the outcome is already present in the pre-action window (the autosubmit path), unlike every
  non-autosubmit case whose response is in the after window.

### PAGE — page state and submit-record limits (fixed)

- `PAGE1` `pre.value` and `post.value` each deep-equal exactly:
  `{nonce:"87f23377-4b21-45d9-b50b-2845277ff7d4",submits:[S],errors:[],url:"http://127.0.0.1:43143/auto-positive",secureContext:true,formExists:true,formActive:false,value:"87f23377-4b21-45d9-b50b-2845277ff7d4",focused:""}`
  where `S = {agentInvoked:true,isTrusted:true,q:"87f23377-4b21-45d9-b50b-2845277ff7d4",active:true,respondWith:"function"}`.
  Key set exactly the nine keys shown; `focused` is `""` (no focus is recorded — do not invent one).
- `PAGE2` `pre.value` deep-equals `post.value` (the invocation plus the `none` action produced no further page
  mutation after the response).
- `PAGE3` **submit causality:** `submits` has length exactly `1` in `pre.value`, `post.value`, and
  `receipt.after.submits`; its single element deep-equals `S`. This is the only recorded proof that the
  declarative autosubmit dispatched the submit listener and enabled `respondWith`. `Completed` with zero
  submit records is semantically impossible for this fixture/mode: the fixture's `Completed` value is produced
  only inside the submit handler (fixture lines 8–15), and the producer records every listener entry at
  `scripts/webmcp-lifecycle-round21.mjs:113`.
- `PAGE4` `S.agentInvoked === true`, `S.isTrusted === true`, `S.respondWith === "function"`, `S.active === true`,
  `S.q === case nonce`. `active` is the live `f.matches(':tool-form-active')` value captured at dispatch
  (producer line 113); `pre.value.formActive === post.value.formActive === false` is the later sample after the
  Completed response. The pair `(S.active:true, pre/post formActive:false)` is the recorded activation
  transition; the oracle asserts the literals, not a general lifecycle law.
- `PAGE5` `receipt.after.pageState` deep-equals `post.value`; `receipt.after.submits` deep-equals `[S]`.
- `PAGE6` URL is loopback (`host 127.0.0.1`), path `/auto-positive`, equal to the initial `Page.frameNavigated`
  URL and unchanged at `post`; `secureContext === true`; `formExists === true` (form not removed, as `na-remove`);
  `value` is not reset (not `""`, as `na-reset` would show).
- `PAGE7` `errors === []` in both observations; no page mutation other than the recorded submit record and the
  transient activation flag.

### TIME — finite windows (fixed bounds, no wall clock)

- `TIME1` all of `preAction.start/end/windowMs` and `after.start/end/windowMs` are finite numbers;
  `preAction.windowMs === preAction.end - preAction.start >= 250` (retained 253);
  `after.windowMs === after.end - after.start >= 500` (retained 501); `preAction.end === pre.at`;
  `after.end === post.at`; `after.start === preAction.end` (retained equality);
  both windows are bounded (`windowMs <= 5000`, the producer's observation bound) so an absurd/synthetic
  window cannot pass.
- `TIME2` response latency is finite and positive: `0 <= responded.at - invokeSent.at <= preAction.windowMs`
  (retained 1 ms); the bound, not the literal, is the predicate.
- `TIME3` the response is delivered before the action and before the pre-action sample:
  `responded.seq < pre.seq` and `responded.at <= pre.at`; `receipt.after.responses` contains no event with
  `seq >= pre.seq`, so the after-window adds zero responses.
- `TIME4` semantic delayed = **false** for `auto-positive`: no `release` frame, no `delayed-before-release`
  observation, no deferred resolution. A response appearing only after the action frame is `na-delayed`
  semantics, not this case.
- `TIME5` the sequence arithmetic is reproduced from the raw markers, not trusted from the receipt summary:
  `preAction.responseCount === count(toolResponded with seq < pre.seq)`, `after.responses === map(params) of
  toolResponded with seq < post.seq`, and `receipt.windowMs === end-start` for both windows.

### NAV — navigation limits (fixed)

Mapped to `semantic_navigation`:

- `NAV1` exactly one `Page.frameNavigated` total, initial only (seq 3), URL path `/auto-positive`.
- `NAV2` zero `Page.frameNavigated` with `at >= after.start` and `seq < post.seq`; `after.navigations === []`
  reproduces that filter.
- `NAV3` `post.value.url` equals `pre.value.url` and the initial navigated URL; `post.value.secureContext === true`.
- `NAV4` no `/landing` request carries this case's nonce; in the retained acquisition the single `/landing`
  request is `q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4` (`na-native-submit`) at 1792590710188. A landing
  navigation after a `Completed` `respondWith(Promise.resolve(...))` would contradict the listener's
  `preventDefault` (fixture line 9). This predicate is enforceable only if the round-22 `INPUT_PATHS`/file map
  includes `receipt.requests`; if it does not, `NAV1–NAV3` remain the mandatory navigation checks.

### CLEAN — cleanup limits (fixed)

- `CLEAN1` `browserPidsBefore` non-empty, every entry a positive integer; `browserPidsAfter === []`;
  `browserPidsSeenAfterClose === []`; `contextClosed === true`; no `closeError`.
- `CLEAN2` `processIdentitiesAtLaunch` non-empty and deep-equal to `processIdentities`; every launch pid is in
  `browserPidsBefore`; `browserPidsAtClose` equals `browserPidsBefore`; each identity has a non-empty
  `startTicks` string. (The exact PID numbers are bound by the evidence digest and are not a semantic predicate.)
- `CLEAN3` `blocked === []` and `downloads === []`.
- `CLEAN4` `receipt.cleanup.browserClosed === true`, `receipt.cleanup.serverClosed === true`; no
  `contextError`/`serverError`/`tempError`; `Date.parse(finishedAt) > Date.parse(startedAt)`.
- `CLEAN5` `receipt.requests` contains exactly one request attributable to this case, `GET /auto-positive`;
  no later request in this case's interval before the next case's `GET /auto-invalid`.

### BIND — evidence/acquisition binding (fixed) and API shape

- `BIND1` receipt row `evidence.path === "corpus/evidence/round-21/runtime/auto-positive.json"` and
  `evidence.sha256 === 62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe`, equal to the
  `sha256` of the retained file.
- `BIND2` `evidence.fixture.path === "corpus/evidence/round-21/runtime/auto-positive.html"`,
  `fixture.sha256 === 5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19`; the fixture contains
  the case nonce, the boolean `toolautosubmit` attribute, `action="/landing"`, `method="get"`, `name="q"` with
  `required`, and `mode="success"`; `e.autosubmit === true`, `e.action === "none"`, `e.mode === "success"`.
- `BIND3` producer path/sha exactly `scripts/webmcp-lifecycle-round21.mjs` / `bc11e4d6…368748a811`;
  `receipt.producer` matches; the fixture-evidence pair is consistent with the producer's per-case write
  (`scripts/webmcp-lifecycle-round21.mjs:203,210,226,227,235`).
- `BIND4` acquisition `.ufo/waves/round-21/runtime-execution-finalized.json`: `exit === 0`,
  `producerPath`/`producerSha256` match BIND3, `receiptSha256 === sha(receipt)`, and
  `artifacts["corpus/evidence/round-21/runtime/auto-positive.json"] === sha(evidence)`; every runtime path in
  the file map appears exactly once in `artifacts`.
- `BIND5` (`case_set`/`input_shape`/`revision_input`/`source_binding`) the case set is the fixed 12 ids with
  `auto-positive` exactly once; `revision_input` is a full 40-hex commit read with an isolated Git env and no
  replace objects; the new expectations file and the new note
  (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, first line starting `source:` and associating S101
  with `corpus/evidence/round-21/runtime/receipt.json` and S100 with the Chromium source URL) are inputs.
  Missing expectations/note → baseline 0; partially missing → failed 0; 12 only after every case's explicit
  semantics pass (aggregate rule is BuildOracle's).
- Stable finding mapping: `semantic_status` (OUT1/OUT5/PAGE3 submit causality, TIME2/TIME3 delivery),
  `semantic_output` (OUT2), `semantic_error` (OUT3/OUT4), `semantic_timing` (TIME1/TIME4/TIME5),
  `semantic_navigation` (NAV1–NAV4), `semantic_delayed` (absence of deferred-release shape),
  `evidence_binding` (BIND1–BIND4), `case_set`/`input_shape`/`source_binding`/`revision_input` (BIND5).
  There is **no dedicated submit-record finding id** in the stable list; the PAGE3 signal must still be red
  under one of the stable ids — recommend `semantic_status`, because a `Completed` response whose required
  submit dispatch is absent is an outcome/causality contradiction, not formatting.

## 3. Fixed expectation record (candidate entry for `corpus/evidence/round-22/semantic-expectations.json`)

Shown for BuildOracle to transcribe; not written here (production ownership). Keyed by case id:

```json
"auto-positive": {
  "autosubmit": true,
  "action": "none",
  "mode": "success",
  "toolName": "lifecycle",
  "toolAnnotationAutosubmit": true,
  "input": {"q": "87f23377-4b21-45d9-b50b-2845277ff7d4"},
  "inputIsNonce": true,
  "invocationId": "4F3E02707F9A539DF7284C78EC392F5A",
  "frameId": "F3C0371BCCA1541F1D77BAF77C53116B",
  "sequence": [
    [9,  "sent",           "WebMCP.invokeTool",  null],
    [10, "result",         null,                 "invocationId"],
    [11, "event",          "WebMCP.toolInvoked", null],
    [12, "event",          "WebMCP.toolResponded", null],
    [13, "observation",    null,                 "pre-action"],
    [14, "action",         "none",               "no-action"],
    [15, "action-complete","none",               null],
    [16, "observation",    null,                 "after-action"]
  ],
  "status": "Completed",
  "output": {"ok": true,
             "nonce": "87f23377-4b21-45d9-b50b-2845277ff7d4",
             "q": "87f23377-4b21-45d9-b50b-2845277ff7d4"},
  "error": "absent",
  "errorFamily": null,
  "responseCount": 1,
  "responsePhase": "pre-action",
  "delayed": false,
  "pageState": {
    "nonce": "87f23377-4b21-45d9-b50b-2845277ff7d4",
    "submits": [{"agentInvoked": true, "isTrusted": true,
                 "q": "87f23377-4b21-45d9-b50b-2845277ff7d4",
                 "active": true, "respondWith": "function"}],
    "errors": [],
    "url": "http://127.0.0.1:43143/auto-positive",
    "secureContext": true,
    "formExists": true,
    "formActive": false,
    "value": "87f23377-4b21-45d9-b50b-2845277ff7d4",
    "focused": ""
  },
  "preEqualsPost": true,
  "navigations": 0,
  "windows": {"start": 1792590716712, "end": 1792590716965, "windowMs": 253,
              "afterStart": 1792590716965, "afterEnd": 1792590717466, "afterWindowMs": 501,
              "preMinMs": 250, "afterMinMs": 500, "responseWithinPreWindow": true},
  "cleanup": {"pidsAfterEmpty": true, "seenAfterCloseEmpty": true,
              "contextClosed": true, "blockedEmpty": true, "downloadsEmpty": true,
              "receiptBrowserClosed": true, "receiptServerClosed": true},
  "binding": {
    "fixture": {"path": "corpus/evidence/round-21/runtime/auto-positive.html",
                "sha256": "5bc140779dbd8da73dbbe130a444675675ae04d83dc1838c752d8443c7641a19"},
    "evidence": {"path": "corpus/evidence/round-21/runtime/auto-positive.json",
                 "sha256": "62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe"},
    "producer": {"path": "scripts/webmcp-lifecycle-round21.mjs",
                 "sha256": "bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811"},
    "acquisition": {"path": ".ufo/waves/round-21/runtime-execution-finalized.json",
                    "receiptSha256": "4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034",
                    "artifactSha256": "62f257e90e2bc3b5a445bb08d5dc144895abe188f20570ad6ab806358099e0fe"}
  }
}
```

`sequence` is illustrative of the required order relation; a renderer may flatten it. Timestamps in `windows`
may be pinned exactly for this retained acquisition (contract: match the exact current acquisition and finite
windows); the semantic predicates additionally require `start/end/windowMs` arithmetic, the lower bounds, the
5000 ms finite ceiling, and the ordering in TIME.

## 4. Discrimination from the sibling cases (grounded in retained receipt rows)

- `na-click` / `na-requestsubmit` record the same `S` shape but only in the **after** window, because their
  submit is dispatched by a synthetic page action; their `pre.value.submits` is `[]` and their
  `preAction.responseCount` is `0`. `auto-positive` is inverted: submit and response exist before the pre
  sample (`preAction.responseCount === 1`, `pre.submits.length === 1`), and the action is `none`.
- `na-native-submit` (`action:"submit"`) records `post.submits === null` (the native `form.submit()` bypasses the
  submit listener; the post state is unavailable after navigation) and one navigation. `auto-positive` must
  have an **object array** submit record and zero navigations.
- `auto-invalid` is `autosubmit:true` too, but its `mode:"invalid"` email control blocks dispatch: `submits` is
  empty, status is `Error` with native validation text, and there is no output. A `Completed`-with-output
  `auto-positive` mutant cannot borrow that shape, and `auto-invalid` cannot pass with a Completed response.
- `na-pending` has no response at all (`after.responses === []`, `preAction.responseCount === 0`); a
  `Completed` in `auto-positive` must not be synthesized from it.

## 5. One coherent semantic mutation the old structural count admits — M1: erase the submit record

**Mutation M1 (all-silent positive control).** Keep `status:"Completed"` and the exact output object, but
remove the single submit record from the pre/post observations and from the receipt summary, and update the
digest links so every hash is coherent:

1. `corpus/evidence/round-21/runtime/auto-positive.json`:
   - `frames[12].value.submits` (seq 13, `pre-action`) → `[]`;
   - `frames[15].value.submits` (seq 16, `after-action`) → `[]`;
   - `pageObservations[0].value.submits` and `pageObservations[1].value.submits` → `[]`;
   - leave `nonce`, `value`, `url`, `errors`, `formActive` and every frame timestamp/seq unchanged.
2. `corpus/evidence/round-21/runtime/receipt.json`:
   - `cases[10].after.submits` → `[]`;
   - `cases[10].after.pageState.submits` → `[]`;
   - `cases[10].evidence.sha256` → `sha256(mutated evidence)`;
   - leave `preAction.{start,end,windowMs,responseCount,formActive}`, `after.responses`,
     `after.navigations`, `after.windowMs` and the nonce/invocationId unchanged.
3. `.ufo/waves/round-21/runtime-execution-finalized.json`: set
   `artifacts["corpus/evidence/round-21/runtime/auto-positive.json"]` to the new evidence sha and
   `receiptSha256` to the new receipt sha. (Digest links updated so a red outcome tests semantics, not stale
   hashes.)

**Why the frozen structural counter admits M1 — checked against every `add()` in
`.ufo/waves/round-21/measure-c1.mjs` (sha `8d992423…`), no finding firing:**

- `partial_state`, `receipt_shape`, `case_set`, `environment`, `cleanup`: untouched.
- `producer_digest`: producer path/sha and `receipt.producer` unchanged.
- `execution_binding` (line 70): `argv`/`exit`/`producerPath`/`producerSha256` unchanged; runtime path key set
  unchanged; both digest comparisons satisfied by step 3.
- `source_binding`/`note_missing`: SOURCES.md, source-opening, carrier and the round-21 note untouched; the
  note already contains `` `auto-positive` `` (line 42).
- `case_shape`/`nonce_reused`/`evidence_missing`/`evidence_digest`: the evidence shape still has
  `submits` as an array (line 110 only checks `Array.isArray`), the nonce is unchanged, the path is unchanged,
  and the digest is updated in step 2.
- `case_identity` (line 112): id/nonce/autosubmit/action unchanged; `e.mode === "success" === CONFIG[10][2]`.
- `fixture_digest` (lines 114–116): fixture untouched; `toolautosubmit` still present.
- `order_mismatch` (lines 118, 136): seq/at unchanged; `answered.seq 10 < pre 13 < action 14 < completed 15 <
  post 16`; `sent.at (…711) > preAction.start (…712)` is false; pre/post markers unique and equal.
- `raw_invoke` (line 120): input `q` is still the nonce; toolName/frameId unchanged.
- `invoke_identity` (line 123): result invocationId and `invokeError:null` unchanged.
- `event_identity` (lines 126, 129): `toolInvoked` and `toolResponded` frames unchanged, including the exact
  output/payload.
- `window_mismatch` (line 138): timings untouched (253/501 ms; `end` equals observation `at`).
- `summary_mismatch` (line 139): `preAction.responseCount` still equals the one response before `pre.seq`;
  `after.responses` still deep-equals the raw event params; step 2 makes `after.submits []` equal
  `post.value.submits []`, and `after.pageState` equal to the mutated `post.value`; `after.navigations []`
  equals the filtered empty list.
- `context_cleanup`/`boundary_violation` (lines 140–141): untouched.

Result: zero findings → `result(cases.length)` = **12**, `verdict:"clean"`, `exit:0`. The old counter never
reads the **content** of `submits` (only `Array.isArray` and summary/raw equality; grep of `submits` returns
lines 110 and 139 only), never compares `status`/`output` against an expectation, and never relates `Completed`
to a dispatched submit.

**Why the new oracle must reject M1:**

- `PAGE1`/`PAGE3` fail: expected `submits` is exactly `[S]` (length 1) in `pre.value`, `post.value`, and
  `receipt.after.submits`; the mutant has `[]`.
- `PAGE4` fails: `S.agentInvoked/isTrusted/active/respondWith` cannot be verified absent the record.
- `OUT1`+`PAGE3` is a semantic contradiction: the fixture's only `Completed` value is produced by
  `e.respondWith(Promise.resolve(value))` inside the submit listener (fixture lines 8–15), and the listener is
  reached only by an actual submit dispatch (recorded by producer line 113). A `Completed` response with zero
  recorded submit events is an impossible event trace for `mode:"success"`; it is an “all-silent” synthetic
  case, precisely the class the round-22 metric must not count.
- `TIME2`/`TIME3` still pass, and `OUT2` still passes, which is the point: M1 is structurally impeccable and
  semantically false. It must yield `exit:1` with a stable-named finding (recommend `semantic_status`; no
  dedicated submit id exists in the stable list) and must not contribute to `value:12`.

Secondary admitted mutations of the same class (cheaper, listed for the selftest matrix, not the primary):
substitute a different valid UUID in `output.q`/`output.nonce` while the submit `q` remains the case nonce
(structural counter never compares output to nonce → `semantic_output`); flip `S.active` `true→false`
(structural counter never reads the record → `semantic_status`); drop `toolsAdded.annotations.autosubmit`
while the fixture attribute and receipt `autosubmit:true` remain (structural counter never inspects
`toolsAdded` → `input_shape`/`semantic_status`).

## 6. Constraints and remaining unknowns

- M1 is a **selftest file-map mutation only**. The retained round-21 acquisition at baseline
  `5f585773258b33d2d514b00cd0b0775333578db6` must stay byte-identical; recorded receipt/acquisition digests
  remain authoritative. Do not rewrite history to make the mutant real.
- M1 is admitted by the frozen counter only if the round-22 measure recomputes acquisition digests from the
  supplied file map (as the frozen round-21 counter does at lines 70 and 108) rather than pinning
  `runtime-execution-finalized.json`’s own sha as a constant. If BuildOracle pins that file’s sha, the mutant
  fails `evidence_binding` for a digest reason and does not exercise semantics; the selftest must update the
  acquisition record coherently (as above).
- Aggregate value semantics on one case’s semantic failure is BuildOracle’s rule; the contract wording
  (“Values12 only after explicit actual semantics”, “partial missing means failed0”) indicates all-or-nothing
  failed/0. Not asserted here as a measured result — no round-22 measure exists at HEAD.
- `S.active:true` at dispatch versus `formActive:false` at both observations is recorded fact; the
  “activation deactivates on Completed response” reading is [INFERENCE] from two samples, not a general law.
  The oracle asserts the literals only.
- The URL port `43143` is an ephemeral loopback port. The fixed expectation pins the retained acquisition’s
  URL string; the semantic predicate requires only loopback host + `/auto-positive` + equality with the
  initial `Page.frameNavigated` URL.
- `NAV4` (no `/landing` for this nonce) is enforceable only if the round-22 input set includes
  `receipt.requests`; otherwise `NAV1–NAV3` are the mandatory navigation checks. Not invented as a required
  input beyond the contract’s `INPUT_PATHS` ownership.
- Round-22 note and expectations are absent at HEAD; the S101 canonical first-line requirement and the
  note’s `auto-positive` mention are BuildOracle/Scribe scope, noted here as a prerequisite for
  `source_binding`, not authored by this seat.
- No runtime confirmation was performed: per assignment, no tests, no builds, no browser, no installs. The
  old-counter admission is derived check-by-check from the frozen source; the rejection is a specification of
  the new oracle, which does not yet exist. Confidence: observed facts high (byte reads + digest equality);
  M1 structural admission high (static check-by-check); finding-id mapping medium (design choice within the
  fixed stable list).

Report written only at
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-22/w1/Raw11.md`.
