# Raw12 — finite semantic oracle for `auto-invalid`

Scout seat. Read-only: no production edits, no tests, no builds, no browser, no network, no REA.
All facts below are read from the retained round-21 acquisition at baseline
`5f585773258b33d2d514b00cd0b0775333578db6`; no value is recomputed from any round-22 receipt
(none exists yet — `corpus/evidence/round-22/` is absent at HEAD, confirmed by `ls`).

## 0. Evidence read (path + sha256)

| artifact | absolute path | sha256 |
|---|---|---|
| case evidence | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/auto-invalid.json` | `28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed` |
| fixture | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/auto-invalid.html` | `4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b` |
| receipt | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| producer | `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |
| acquisition record | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/runtime-execution-finalized.json` | file `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`; `receiptSha256 = 4bc79636…f937034`; `artifacts["…/auto-invalid.json"] = 28a37c0e…7326aed` |
| frozen old counter (not to be modified or imported as outcome oracle) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-21/measure-c1.mjs` | `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` |
| round-21 knowledge note (read for retained semantics; not modified) | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | line 43 already states: `auto-invalid` = no page action; toolautosubmit + malformed email; response in initial window: Error, native email validation text; no submit event |

Round-22 note `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
does **not** exist at HEAD (checked; `test -e` → no). Its creation and S101 first-line binding belong to
BuildOracle/Scribe, not to this seat.

## 1. Observed facts for `auto-invalid` (exact literals)

Fixture (`auto-invalid.html`):

- `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle" toolautosubmit action="/landing" method="get">`
- `<input name="q" required type="email">`, `<button id="go" type="submit">Run</button>`
- script: `mode="invalid"`; submit listener records `{agentInvoked,isTrusted,q,active,respondWith}`,
  calls `e.preventDefault()`; no `throw`, no `Promise.reject`, no delayed `window.release`;
  the only reachable branch is `respondWith(Promise.resolve({ok:true,nonce,q}))`.
- The control is an **email** input whose value is the malformed literal `not-an-email`; native
  constraint validation therefore blocks submit-event dispatch, so the listener never runs.

Receipt row (`receipt.json`, `cases[11]`):

- `id="auto-invalid"`, `nonce="ff88f4bf-6699-4a65-b4b5-7daeb34982be"`, `autosubmit=true`, `action="none"`, `mode="invalid"`.
- `invocationId="1CB23F49E89D91801A20D1C7DA8CB811"`, `invokeError=null`.
- `preAction={start:1792590717645,end:1792590717898,windowMs:253,responseCount:1,formActive:false}`.
- `after={start:1792590717898,end:1792590718399,windowMs:501,responses:[<one Error response>],submits:[],navigations:[],pageState:<equal to after-action observation>}`.

Evidence (`auto-invalid.json`) — 16 frames, all `seq` 1..16 and monotone `at`:

| seq | dir | method / action / label | payload |
|---|---|---|---|
| 1–2 | sent/result | `Page.enable` | — |
| 3 | event | `Page.frameNavigated` | `http://127.0.0.1:43143/auto-invalid`, frame `DAAC6FE7839A3ED3B29AB5F6E40B7A67` |
| 4–6 | sent/event/result | `WebMCP.enable` | `WebMCP.toolsAdded` tool `lifecycle`, annotation `autosubmit:true`, `inputSchema` requires `q` |
| 7–8 | sent/result | `Page.getFrameTree` | frame `DAAC6FE…A67` |
| 9 | sent | `WebMCP.invokeTool` `@1792590717645` | `{frameId:"DAAC6FE7839A3ED3B29AB5F6E40B7A67",toolName:"lifecycle",input:{q:"not-an-email"}}` |
| 10 | result | command 4 `@645` | `{invocationId:"1CB23F49E89D91801A20D1C7DA8CB811"}` |
| 11 | event | `WebMCP.toolInvoked` `@647` | `input:"{\"q\":\"not-an-email\"}"`, same frame/tool/invocationId |
| 12 | event | `WebMCP.toolResponded` `@647` | `{invocationId:"1CB23F49E89D91801A20D1C7DA8CB811",status:"Error",errorText:"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "}` — **no `output` property** |
| 13 | observation | `pre-action` `@898` | `{nonce:"ff88f4bf-6699-4a65-b4b5-7daeb34982be",submits:[],errors:[],url:"http://127.0.0.1:43143/auto-invalid",secureContext:true,formExists:true,formActive:false,value:"not-an-email",focused:""}` |
| 14 | action | `action:"none"`, `phase:"no-action"` `@898` | — |
| 15 | action-complete | `action:"none"` `@898` | — |
| 16 | observation | `after-action` `@8399` | byte-identical `value` object to seq 13 (`pre.value === post.value` is true) |

Exact errorText (Python `repr`, note trailing space and double period):
`"Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. "`.

Cleanup (evidence): `browserPidsBefore` = 9 positive PIDs `[1810183,1810190,1810191,1810212,1810232,1810248,1810270,1810279,1810281]`,
`browserPidsAtClose` identical, `browserPidsAfter=[]`, `browserPidsSeenAfterClose=[]`, `contextClosed=true`,
no `closeError`, `blocked=[]`, `downloads=[]`, `processIdentitiesAtLaunch == processIdentities` (9).
Receipt cleanup: `browserClosed=true`, `serverClosed=true`. Requests: `GET /auto-invalid` at
`1792590717633` is the last recorded request; no `/landing` request for this case.

## 2. Finite semantic oracle for `auto-invalid`

Fixed expectations are authored from the retained acquisition above and are frozen; the oracle must
compare the evaluated file set against them. **It must never derive expected status/output/error from
the evaluated receipt** (a self-consistent mutant would otherwise pass). No predicate below depends on
wall-clock or on the old counter.

### INV — invocation identity (fixed)

- `INV1` exactly one `dir:"sent", method:"WebMCP.invokeTool"` frame; `params.toolName === "lifecycle"`;
  `params.input` deep-equals `{q:"not-an-email"}`; input value is the malformed literal, **not** the nonce.
- `INV2` `params.frameId` is a non-empty string equal to the initial `Page.frameNavigated` frame id and to
  `Page.getFrameTree.frameTree.frame.id` (`DAAC6FE7839A3ED3B29AB5F6E40B7A67` in the retained bytes).
- `INV3` exactly one CDP result answered the invoke command; `result.invocationId` equals the receipt row
  `invocationId` (`1CB23F49E89D91801A20D1C7DA8CB811`) and equals the `invocationId` on the single
  `WebMCP.toolInvoked` and single `WebMCP.toolResponded` events; receipt `invokeError === null` and the
  result frame has no `message`.
- `INV4` `WebMCP.toolInvoked.params.input` is the exact JSON text `{"q":"not-an-email"}` and its
  `toolName`/`frameId` equal the sent params.
- `INV5` exactly one `WebMCP.toolResponded` in the whole frame log (one invocation id, one response).

### SEQ — pre/action/post sequence (fixed)

- `SEQ1` canonical order by `seq`:
  `invokeSent(9) < invokeResult(10) < toolInvoked(11) < toolResponded(12) < preObs(13) < action(14) < actionComplete(15) < postObs(16)`;
  frame `seq` is `1..N` strictly increasing and `at` non-decreasing.
- `SEQ2` the only `dir:"action"` frame has `action:"none"`, `phase:"no-action"`; the only
  `dir:"action-complete"` frame has `action:"none"`. No click/requestSubmit/submit/reset/remove action.
- `SEQ3` exactly one `pre-action` and one `after-action` observation, and their observation frames are the
  same `seq`/`at`/`value` as the named entries; `pre.at === receipt.preAction.end` and
  `post.at === receipt.after.end`.
- `SEQ4` the response event precedes the action frame and the pre-action observation
  (`responded.seq < pre.seq` and `responded.at <= pre.at`); the action frame lies in
  `[pre.at, post.at]` (retained: `action.at === pre.at`).
- `SEQ5` no `Page.frameNavigated` after the initial load navigation (the only one is seq 3, before invoke).

### OUT — exact status, output, error (fixed, not recomputed)

- `OUT1` the single `toolResponded.params.status === "Error"` (exact string).
- `OUT2` the params object has **no own `output` property**; `output:null` or `output:{}` is a mismatch, not
  a pass. Semantic output for this case is `absent`.
- `OUT3` `toolResponded.params.errorText` exactly equals the literal
  `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. `
  (trailing space and `..` included). Exact equality is admissible because the environment is pinned
  (`chromium 154.0.8037.97`) and the acquisition digest binds these bytes; the expectation is copied from
  the retained acquisition, not from the round-22 receipt.
- `OUT4` semantic family: native constraint-validation failure of control `q` with the malformed email
  value. It must not be the `preventDefault`-without-`respondWith` programming error (`na-throw`), the
  rejected-promise error (`na-reject`), or the empty-required-field error (`na-invalid-submit`).
- `OUT5` `receipt.after.responses` deep-equals `[toolResponded.params]` (length 1, same keys/values), and
  `receipt.preAction.responseCount === 1` equals the count of response events with `seq < pre.seq`.

### PAGE — page state limits (fixed)

- `PAGE1` `pre.value` and `post.value` each equal exactly:
  `{nonce:"ff88f4bf-6699-4a65-b4b5-7daeb34982be", submits:[], errors:[],
    url:"http://127.0.0.1:43143/auto-invalid", secureContext:true, formExists:true,
    formActive:false, value:"not-an-email", focused:""}`.
- `PAGE2` `pre.value` deep-equals `post.value` (no page mutation from the invocation).
- `PAGE3` `submits` is empty in both observations and in `receipt.after.submits`: **zero submit events**.
  This is the semantic consequence of the email constraint blocking dispatch, not an accident.
- `PAGE4` `errors` is empty in both observations: failure is reported through the tool protocol, not as an
  uncaught page exception (`na-throw` has `["Uncaught Error: dummy submit handler throw"]`).
- `PAGE5` `receipt.after.pageState` deep-equals `post.value`; `receipt.after.navigations` is `[]`.
- `PAGE6` `receipt.preAction.formActive === false` (autosubmit consumed/closed the form) and
  `pre.value.nonce === receipt.nonce === evidence.nonce`.
- `PAGE7` the URL path remains `/auto-invalid`; form still exists (not removed as in `na-remove`); value is
  not reset (`na-reset` yields `value:""`), and `focused` is `""` (do not invent a focus requirement; the
  retained observation records no focus).

### TIME — finite windows (fixed bounds, no wall clock)

- `TIME1` all of `preAction.windowMs`, `after.windowMs`, `start`, `end` are finite numbers;
  `preAction.windowMs === preAction.end - preAction.start >= 250`;
  `after.windowMs === after.end - after.start >= 500`;
  `after.start === preAction.end`; `preAction.end === pre.at`; `after.end === post.at`.
- `TIME2` response latency is finite: `0 <= responded.at - invokeSent.at <= preAction.windowMs`
  (retained: 2 ms; the bound, not the literal, is the predicate).
- `TIME3` `responded.at <= pre.at` and there is no response event after the action frame: the outcome is
  delivered inside the pre-action window. `receipt.after` contains zero new response events.
- `TIME4` semantic delayed = **false**: no release/deferred resolution is needed or observed; a response
  appearing only in the after window is `na-delayed` semantics, not `auto-invalid`.

### CLEAN — cleanup limits (fixed)

- `CLEAN1` `browserPidsBefore` non-empty, all positive integers; `browserPidsAfter === []`;
  `browserPidsSeenAfterClose === []`; `contextClosed === true`; no `closeError` key/value.
- `CLEAN2` `blocked === []` and `downloads === []`.
- `CLEAN3` `receipt.cleanup.browserClosed === true` and `receipt.cleanup.serverClosed === true`; no
  `contextError`, `serverError`, `tempError`; `finishedAt` parses after `startedAt`.
- `CLEAN4` `receipt.requests` contains exactly one request attributable to this case, `GET /auto-invalid`;
  no `/landing` request after it (retained request tail confirms this). The exact PID list is bound by the
  evidence digest; it is not a semantic predicate.

### BIND — evidence/acquisition binding (fixed)

- `BIND1` receipt row `evidence.path === "corpus/evidence/round-21/runtime/auto-invalid.json"` and
  `evidence.sha256 === 28a37c0e…7326aed`, equal to `sha256` of that retained file.
- `BIND2` `evidence.fixture.path === "corpus/evidence/round-21/runtime/auto-invalid.html"`,
  `evidence.fixture.sha256 === 4df78184…4051f6b`; fixture contains the case nonce and the
  `toolautosubmit` attribute; control `q` has `required` and `type="email"`.
- `BIND3` producer path/sha exactly `scripts/webmcp-lifecycle-round21.mjs` / `bc11e4d6…368748a811`, and
  `receipt.producer` matches.
- `BIND4` acquisition `.ufo/waves/round-21/runtime-execution-finalized.json`: `exit === 0`,
  `producerPath`/`producerSha256` match BIND3, `receiptSha256 === sha(receipt)`, and
  `artifacts["corpus/evidence/round-21/runtime/auto-invalid.json"] === sha(evidence)`; every runtime path
  in the file map is present exactly once in `artifacts`.
- `BIND5` case set is the fixed 12 ids including `auto-invalid` exactly once; `revision_input` is a full
  40-hex commit hash. Missing new expectations/note → baseline 0; partially missing → failed 0;
  `value` is 12 only when every case's explicit semantics pass (contract wording; aggregate rule is
  BuildOracle's to implement). Shape/binding failures map to `case_set`, `input_shape`,
  `evidence_binding`, `source_binding`, `revision_input`; semantic failures map to `semantic_status`,
  `semantic_output`, `semantic_error`, `semantic_timing`, `semantic_navigation`, `semantic_delayed`.

## 3. Fixed expectation record (candidate entry for `corpus/evidence/round-22/semantic-expectations.json`)

Shown for BuildOracle to transcribe; not written here (production file ownership). Keyed by case id:

```json
"auto-invalid": {
  "autosubmit": true,
  "action": "none",
  "mode": "invalid",
  "toolName": "lifecycle",
  "input": {"q": "not-an-email"},
  "inputIsNonce": false,
  "sequence": [
    [9,  "sent",    "WebMCP.invokeTool", null],
    [10, "result",  null, "invocationId"],
    [11, "event",   "WebMCP.toolInvoked", null],
    [12, "event",   "WebMCP.toolResponded", null],
    [13, "observation", null, "pre-action"],
    [14, "action",  "none", "no-action"],
    [15, "action-complete", "none", null],
    [16, "observation", null, "after-action"]
  ],
  "status": "Error",
  "output": "absent",
  "error": "Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ",
  "errorFamily": "native-constraint-validation",
  "responseCount": 1,
  "responsePhase": "pre-action",
  "delayed": false,
  "pageState": {
    "nonce": "ff88f4bf-6699-4a65-b4b5-7daeb34982be",
    "submits": [],
    "errors": [],
    "url": "http://127.0.0.1:43143/auto-invalid",
    "secureContext": true,
    "formExists": true,
    "formActive": false,
    "value": "not-an-email",
    "focused": ""
  },
  "preEqualsPost": true,
  "navigations": 0,
  "windows": {"preMinMs": 250, "afterMinMs": 500, "responseWithinPreWindow": true},
  "cleanup": {"pidsAfterEmpty": true, "seenAfterCloseEmpty": true,
              "contextClosed": true, "blockedEmpty": true, "downloadsEmpty": true,
              "receiptBrowserClosed": true, "receiptServerClosed": true},
  "binding": {
    "fixture": {"path": "corpus/evidence/round-21/runtime/auto-invalid.html",
                "sha256": "4df781840afdfed1e958e13bd05ad3e9d91ee81c3ab1805affc5014fc4051f6b"},
    "evidence": {"path": "corpus/evidence/round-21/runtime/auto-invalid.json",
                 "sha256": "28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed"},
    "producer": {"path": "scripts/webmcp-lifecycle-round21.mjs",
                 "sha256": "bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811"},
    "acquisition": {"path": ".ufo/waves/round-21/runtime-execution-finalized.json",
                    "receiptSha256": "4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034",
                    "artifactSha256": "28a37c0ed2563f1bd7f8649a8d7830701932c607b7fbafcb1a03576da7326aed"}
  }
}
```

`sequence` is illustrative of the required order; if BuildOracle prefers explicit seq integers, the
retained seq values are `9,10,11,12,13,14,15,16` as listed. A renderer may flatten it; the predicate is
the ordered `(seq, dir, method/action, label)` relation, not a text format.

## 4. Error-family and success-family discrimination (grounded in retained receipt rows)

| case | autosubmit | action | response phase | status | errorText | submits | page errors | navigation | formActive pre |
|---|---|---|---|---|---|---|---|---|---|
| `auto-invalid` | true | none | pre-action (seq 12 < pre 13) | Error | `Form validation failed: q: Please include an '@' … 'not-an-email' is missing an '@'.. ` | `[]` | `[]` | none | false |
| `na-invalid-submit` | false | invalidRequestSubmit | after action (seq 15 > action 13) | Error | `Form validation failed: q: Please fill out this field.. ` | `[]` | `[]` | none | true |
| `na-reject` | false | requestSubmit | after action | Error | `respondWith promise was rejected` | 1 (`agentInvoked:true`) | `["Uncaught Error: dummy rejection"]` | none | true |
| `na-throw` | false | requestSubmit | after action | Error | `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` | 1 | `["Uncaught Error: dummy submit handler throw"]` | none | true |
| `auto-positive` | true | none | pre-action | Completed | — | 1 | `[]` | none | false |

Consequences the oracle must enforce (all observed, none invented):

1. `auto-invalid` is the only Error case whose response is delivered **before** any action frame; the
   three non-autosubmit Error cases respond **after** the action frame. This is `semantic_timing`.
2. `auto-invalid` is the only case with a non-nonce, malformed email literal as invoke input; the three
   non-autosubmit cases send the nonce, and `na-invalid-submit` is the separate empty-value case.
3. `auto-invalid` and `na-invalid-submit` share the `Form validation failed:` prefix but differ by the
   constraint text and by the response phase; exact errorText equality plus phase separates them.
4. A `Completed` response with an output payload cannot coexist with `submits:[]` and `navigations:[]`
   for this fixture: `Completed` output requires the submit listener to have run (in-page handler) or a
   native navigation (`na-native-submit`). Neither occurred. This cross-field coherence rule is the core
   of the new oracle and is absent from the old structural counter.

## 5. Coherent semantic mutation the old structural count admits

**M1 — flip `auto-invalid` from the validation-error outcome to a fabricated successful completion,
keeping every structural link coherent.**

Mutation set (test-only synthetic file map; retained round-21 blobs must remain byte-identical):

1. `corpus/evidence/round-21/runtime/auto-invalid.json`: replace frame 12 `toolResponded.params` with
   `{"invocationId":"1CB23F49E89D91801A20D1C7DA8CB811","status":"Completed",
     "output":{"ok":true,"nonce":"ff88f4bf-6699-4a65-b4b5-7daeb34982be","q":"not-an-email"}}`
   (remove `errorText`). Leave seq 12, `at`, all other frames, page observations, PIDs, and fixture untouched.
2. `corpus/evidence/round-21/runtime/receipt.json`: set `cases[11].after.responses` to that same params
   object, and set `cases[11].evidence.sha256` to the new sha256 of the mutated evidence file.
   `preAction.responseCount` stays `1`; `after.submits` stays `[]`; `after.pageState`/`navigations` unchanged.
3. `.ufo/waves/round-21/runtime-execution-finalized.json`: set `receiptSha256` to the new receipt sha and
   `artifacts["corpus/evidence/round-21/runtime/auto-invalid.json"]` to the new evidence sha.
   (Digest links updated, per contract: red outcome must test semantics, not stale hashes.)

Why the old structural counter admits it — checked against every `add()` in
`.ufo/waves/round-21/measure-c1.mjs` (sha `8d992423…`), with no finding firing:

- `partial_state`, `receipt_shape`, `case_set`, `environment`, `cleanup`: untouched.
- `producer_digest`: producer path/sha and receipt.producer unchanged.
- `execution_binding`: `argv`/`exit`/`producerPath`/`producerSha256` unchanged; runtime path key set
  unchanged; the two digest comparisons are satisfied by step 3; `receiptSha256` by step 3.
- `source_binding`/`note_missing`: SOURCES.md, source-opening, carrier, and the round-21 note are untouched;
  the note already contains `` `auto-invalid` `` (line 43).
- `case_shape`/`nonce_reused`/`evidence_missing`/`evidence_digest`: shape unchanged, nonce unchanged,
  path unchanged, digest updated in step 2.
- `case_identity`: id/nonce/autosubmit/action unchanged; `e.mode === "invalid" === CONFIG[11][2]`.
- `fixture_digest`: fixture untouched; `toolautosubmit` still present.
- `order_mismatch` (frames): seq/at unchanged; `answered[0].seq=10 < pre 13 < action 14 < completed 15 < post 16`;
  pre/post markers unique and equal; `sent.at (…645) > preAction.start (…645)` is false, as before.
- `raw_invoke`: input `q === "not-an-email"` unchanged (mode invalid literal).
- `invoke_identity`: CDP result invocationId unchanged; `c.invocationId` unchanged; `invokeError` null and no
  result `message`.
- `event_identity`: `toolInvoked` unchanged; mutated `toolResponded.seq=12 > invoked.seq=11`, so
  `events.some(f => f.seq <= invoked[0].seq)` is false.
- `window_mismatch`: all timings untouched (253/501 ms, end equals observation `at`).
- `summary_mismatch`: `preAction.responseCount (1) === response events before pre (seq 12)`; step 2 makes
  `after.responses` deep-equal the raw event params; `after.pageState` equals post; `after.submits []` equals
  `post.value.submits []`; `after.navigations []` equals the only `frameNavigated` (seq 3, `at` before
  `after.start`) filtered out by the window.
- `context_cleanup`/`boundary_violation`: untouched.

Result: zero findings → `result(cases.length)` = **12**, `verdict:"clean"`, `exit:0`. The old counter never
inspects `status`, `output`, page `submits` alongside status, or `errorText`.

Why the new oracle rejects M1:

- `OUT1` fails (`Completed` ≠ fixed `Error`).
- `OUT2` fails (`output` present; expected absent).
- `OUT3` fails (expected exact validation error text, no errorText).
- `PAGE3` + cross-field rule fail: `Completed` with an output payload while `submits:[]` and
  `navigations:[]` is impossible for this fixture — the submit listener never ran, so no `respondWith`
  value could resolve; the email control's native constraint validation blocks dispatch first.
- `TIME`/`PAGE7` still pass, which is the point: the mutant is structurally impeccable and semantically false.

Secondary admitted mutation (same class, cheaper): keep `status:"Error"` but substitute another Error
string, e.g. the `na-throw` preventDefault/programming-error text or the `na-invalid-submit`
`Please fill out this field.` text, updating only the receipt row's `after.responses` and evidence digest.
The old counter never reads `errorText`, so it still returns 12; the new oracle rejects via `semantic_error`
(exact literal + native-constraint family). Not proposed as the primary mutation because it does not also
exercise `semantic_status`/`semantic_output`.

## 6. Constraints and remaining unknowns

- The mutation is a **selftest file-map mutation only**. The retained round-21 acquisition at baseline
  `5f585773258b33d2d514b00cd0b0775333578db6` must stay byte-identical; recorded receipt/acquisition digests
  remain authoritative. Do not rewrite history to make the mutant real.
- M1 is admitted only if the round-22 measure recomputes acquisition digests from the supplied file map (as
  the frozen round-21 counter does), rather than pinning `runtime-execution-finalized.json`'s sha as a
  constant. If BuildOracle pins that file's own sha, the mutant fails `evidence_binding` for a digest reason
  and does not exercise semantics — the selftest must update the acquisition record coherently.
- The frozen counter `8d992423…` is not to be edited and must not be imported as the round-22 outcome oracle;
  it remains as the historical structural check only.
- Round-22 note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` is absent at HEAD; the S101 canonical
  first-line requirement is BuildOracle/Scribe scope, noted here only as a prerequisite for `source_binding`.
- Aggregate value semantics (0 vs partial count) on one case's semantic failure is BuildOracle's rule; the
  contract wording ("Values12 only after explicit actual semantics", "partial missing means failed0")
  indicates all-or-nothing failed/0. Not asserted as a measured result — no measure exists at HEAD.
- No runtime confirmation was performed: per assignment, no tests, no builds, no browser. The old-counter
  admission is derived check-by-check from the frozen source; the evidence facts are file-read only.
