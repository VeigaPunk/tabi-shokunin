# Raw03 — `na-requestsubmit` finite semantic oracle

## Scope, axes, method

Fixed-case source/evidence read only. No edits, no tests, no browser, no network, no REA, no
new acquisition, no production file touched. The five axes are: **outcome exactness**
(status/output/error), **sequence and finite-window binding**, **page-state transition**,
**navigation/cleanup limits**, and **mutation discrimination** against the old structural count.

The `lsp` device is not mounted (`read xd://lsp` returned `No such tool: xd://lsp` and the
device inventory contains no LSP route). Literal `grep`/`awk` was used only to locate line
anchors; no conclusion below rests on search output as semantic proof. Proof is direct reading
of the retained raw JSON, receipt JSON, and the reopened S100 source body.

## O — observed facts (not oracle design)

### O1. Fixture

`corpus/evidence/round-21/runtime/na-requestsubmit.html:1-16`:

- line 2: `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle"
  action="/landing" method="get">` with `<input name="q" required>` and
  `<button id="go" type="submit">`.
- line 5: `window.observations={nonce:"99664eb6-d5ed-46f6-a516-39720ab87c27",submits:[],errors:[]}`.
- lines 7-9: one `submit` listener pushes `{agentInvoked,isTrusted,q,active,respondWith}` then
  calls `e.preventDefault()` before any mode branch.
- line 10: `const mode="success"`; line 12: `value={ok:true,nonce:<nonce>,q:f.elements.q.value}`;
  line 15: `e.respondWith(Promise.resolve(value))`.
- Fixture SHA-256 (verified by `sha256sum`): `1796f206a10c85b94d21db0381610858150c971cb8131c0ae40cfab8fbbd2085`
  (also raw line 10).

### O2. Invocation

`corpus/evidence/round-21/runtime/na-requestsubmit.json:133-165`:

| seq | at | dir | payload |
|---|---|---|---|
| 9 | 1792590708996 | sent | `WebMCP.invokeTool` command 4, `frameId CD8BCA22EC82E0F3C027AFE1E09B6BB2`, `toolName "lifecycle"`, `input {"q":"99664eb6-d5ed-46f6-a516-39720ab87c27"}` |
| 10 | 1792590708997 | result | command 4, `{"invocationId":"56322DDB67194D60972B07E2BCABB7B7"}` |
| 11 | 1792590708997 | event | `WebMCP.toolInvoked`, same tool/frame, `input "{\"q\":\"99664eb6-…\"}"` |
| 12 | 1792590709250 | observation | `pre-action` |
| 13 | 1792590709250 | action | `{"action":"requestSubmit","phase":"dispatch-started"}` |
| 14 | 1792590709251 | action-complete | `{"action":"requestSubmit"}` |
| 15 | 1792590709252 | event | `WebMCP.toolResponded` `{"invocationId":"56322DDB…","status":"Completed","output":{"ok":true,"nonce":"99664eb6…","q":"99664eb6…"}}` |
| 16 | 1792590709753 | observation | `after-action` |

Initial load is seq 3 `Page.frameNavigated` at 1792590708986, URL
`http://127.0.0.1:43143/na-requestsubmit`. `WebMCP.toolsAdded` (seq 5) contains exactly one tool,
`lifecycle`, with required property `q`.

### O3. Page observations

`corpus/evidence/round-21/runtime/na-requestsubmit.json:238-279`:

- pre `at 1792590709250`, `seq 12`: `{nonce, submits:[], errors:[], url:"http://127.0.0.1:43143/na-requestsubmit",
  secureContext:true, formExists:true, formActive:true, value:<nonce>, focused:"go"}`.
- post `at 1792590709753`, `seq 16`: `{nonce, submits:[{agentInvoked:true,isTrusted:true,q:<nonce>,
  active:true,respondWith:"function"}], errors:[], url:<same URL>, secureContext:true,
  formExists:true, formActive:false, value:<nonce>, focused:"go"}`.
- Exactly two observations, labels `["pre-action","after-action"]`. No `delayed-before-release`
  and no `dir:"release"` frame anywhere in this file. (Contrast: `na-delayed.json` has a third
  observation and a `release` frame; `na-native-submit` navigates.)

### O4. Receipt row

`corpus/evidence/round-21/runtime/receipt.json:123-184`:

- `nonce 99664eb6…`, `autosubmit false`, `action "requestSubmit"`,
  `invocationId "56322DDB67194D60972B07E2BCABB7B7"`, `invokeError null` (123-128).
- `preAction {start:1792590708997, end:1792590709250, windowMs:253, responseCount:0,
  formActive:true}` (129-135).
- `after {start:1792590709250, end:1792590709753, windowMs:503}` (136-139) with exactly one
  response `{status:"Completed", output:{ok:true,nonce,q}}` (140-150), exactly one submit
  record (151-159), `navigations:[]` (160), and `pageState` deep-equal to the raw post value
  (161-179).
- `evidence.path` = raw path, `evidence.sha256` = `4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa`
  (181-183). Recomputing `sha256sum` on the retained raw gives the same digest.

### O5. Acquisition binding

`.ufo/waves/round-21/runtime-execution-finalized.json:12-13,26-27,47`: producer
`scripts/webmcp-lifecycle-round21.mjs`, producer SHA
`bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`, raw artifact digest
`4b8245d7…`, fixture digest `1796f206…`, `receiptSha256 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`
(verified: `sha256sum` of `receipt.json` = `4bc79636…`). The execution stdout records
`LIFECYCLE_OBSERVED na-requestsubmit pre=0 statuses=Completed` (line 17). This is the retained
round-21 acquisition; no round-22 producer exists or is claimed.

### O6. Source grounding for the expected outcome

Retained S100 `.ufo/waves/round-21/sources/html_form_element.cc` (decoded SHA
`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`):

- The submit event is created in C++ and gets `setAgentInvoked(true)` for an active declarative
  call (lines ~766-770), so `agentInvoked:true` is source-entailed for this path.
- A `respondWith()` promise is taken only when default submission was canceled; the source has
  `CHECK(!should_submit)` on that branch (lines ~790-793), so no native navigation may occur
  when the promise path is taken.
- Promise resolution JSON-stringifies an object result and calls
  `CallDoneCallback(result)` (lines ~296-319) → observed `Completed` with the fixture's
  `value` object. Rejection produces the `respondWith promise was rejected` error (lines
  ~320-327); a listener that prevents default without `respondWith` produces the
  "programming error" callback (lines ~807-814).
- `CallDoneCallback` clears the running flag, submit button, invocation id and the
  `:tool-form-active` pseudo-state (lines ~261-275), which explains the observed
  `formActive:false` after completion.

`isTrusted:true` is observed and consistent with a C++-dispatched submit event, but the oracle
should assert the observed literal, not derive a general trust rule; the note itself limits
this row to Playwright's user-gesture treatment (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:34`).

## Finite semantic oracle for `na-requestsubmit`

### Definition of "finite" and counting rule

The oracle is a closed decision procedure over one enumerated case: every required observation
is either an exact scalar comparison or a deep equality over a fixed key set; missing required
evidence fails, never passes vacuously; no check accepts a regex/substring where an exact literal
is available; no expected value is derived from the receipt being evaluated (the expectation
document is authored once and compared to the files). A row is **semantically checked** only when
every requirement below passes. Any finding → metric value `0`, `verdict:"failed"`, `exit:1`
(partial input also fails to `0`); `value:12`, `verdict:"clean"`, `exit:0` only when all twelve
rows pass; missing expectations *and* note together → baseline `0`, `exit:0`; malformed or
partially missing expectations → failed `0`, `exit:1`.

### E1. Expectation entry content (illustrative shape; field names are BuildOracle's)

The entry must contain these fixed literals (all values below are the retained actuals, not
recomputed at evaluation time):

```json
{"id":"na-requestsubmit",
 "nonce":"99664eb6-d5ed-46f6-a516-39720ab87c27",
 "autosubmit":false, "action":"requestSubmit", "mode":"success",
 "invocationId":"56322DDB67194D60972B07E2BCABB7B7", "invokeError":null,
 "frameId":"CD8BCA22EC82E0F3C027AFE1E09B6BB2", "toolName":"lifecycle",
 "fixtureSha256":"1796f206a10c85b94d21db0381610858150c971cb8131c0ae40cfab8fbbd2085",
 "evidenceSha256":"4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa",
 "preAction":{"start":1792590708997,"end":1792590709250,"windowMs":253,"responseCount":0,"formActive":true},
 "after":{"start":1792590709250,"end":1792590709753,"windowMs":503},
 "respondedAt":1792590709252,
 "status":"Completed",
 "output":{"ok":true,"nonce":"99664eb6-d5ed-46f6-a516-39720ab87c27","q":"99664eb6-d5ed-46f6-a516-39720ab87c27"},
 "submitRecord":{"agentInvoked":true,"isTrusted":true,"q":"99664eb6-d5ed-46f6-a516-39720ab87c27","active":true,"respondWith":"function"},
 "prePageState":{"nonce":"99664eb6-d5ed-46f6-a516-39720ab87c27","submits":[],"errors":[],
   "url":"http://127.0.0.1:43143/na-requestsubmit","secureContext":true,"formExists":true,
   "formActive":true,"value":"99664eb6-d5ed-46f6-a516-39720ab87c27","focused":"go"},
 "postPageState":{"nonce":"99664eb6-d5ed-46f6-a516-39720ab87c27",
   "submits":[{"agentInvoked":true,"isTrusted":true,"q":"99664eb6-d5ed-46f6-a516-39720ab87c27","active":true,"respondWith":"function"}],
   "errors":[],"url":"http://127.0.0.1:43143/na-requestsubmit","secureContext":true,
   "formExists":true,"formActive":false,
   "value":"99664eb6-d5ed-46f6-a516-39720ab87c27","focused":"go"},
 "navigations":[],
 "observationLabels":["pre-action","after-action"],
 "cleanup":{"browserPidsBeforeCount":9,"browserPidsAfter":[],"contextClosed":true,
   "pidsAtCloseEqualBefore":true,"pidsSeenAfterClose":[],"processIdentitiesEqualLaunch":true,
   "blocked":[],"downloads":[],"receiptBrowserClosed":true,"receiptServerClosed":true},
 "producerSha256":"bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811"}
```

### R1. Invocation (findings: `semantic_status`, `evidence_binding`)

1. Exactly one sent frame `WebMCP.invokeTool`; it has `toolName:"lifecycle"`,
   `frameId:"CD8BCA22EC82E0F3C027AFE1E09B6BB2"`, and `input` deep-equal to `{q:<nonce>}`
   (exactly one key).
2. Exactly one result frame for that command and zero error frames; the result's
   `invocationId` is exactly `56322DDB67194D60972B07E2BCABB7B7`; `invokeError` is exactly `null`.
3. Exactly one `WebMCP.toolInvoked` with that `invocationId`; its `toolName`/`frameId` match the
   sent frame; its `input` parsed as JSON deep-equals `{q:<nonce>}` (parse, do not compare raw
   serialization order); its `seq` is greater than the invoke result `seq`.
4. Exactly one `WebMCP.toolResponded` with that `invocationId`; it must exist (absence is a
   `semantic_status` finding "response_missing", not a vacuous pass); its `seq` is greater than
   `toolInvoked.seq`.
5. `WebMCP.toolsAdded` contains exactly one tool named `lifecycle` whose `inputSchema.required`
   is exactly `["q"]`.

### R2. Pre / action / post sequence (findings: `semantic_timing`)

Ordered monotonically by `seq` and by `at`:

```
invoke-sent (9, 1792590708996)
  → invoke-result (10, 1792590708997)
  → toolInvoked (11, 1792590708997)
  → pre-action observation (12, 1792590709250)
  → action requestSubmit dispatch-started (13, 1792590709250)
  → action-complete requestSubmit (14, 1792590709251)
  → toolResponded (15, 1792590709252)
  → after-action observation (16, 1792590709753)
```

Required relations: exactly one `action` frame and exactly one `action-complete` frame, both
`action:"requestSubmit"`; `action.phase === "dispatch-started"`; exactly one embedded
`observation` marker for each of `pre-action`/`after-action`, with marker `seq` and `at` equal to
the corresponding `pageObservations` entry and marker `value` deep-equal to the observation
value; `responded.seq` strictly between `action-complete.seq` and the after marker `seq` — do
**not** require the response before `action-complete` (the actual evidence has it after);
`sent.at <= invoke-result.at == preAction.start`; `preAction.end == pre.at == action.at ==
after.start`; `action.at <= action-complete.at <= responded.at <= after.end == post.at`.
Absolute `seq` numbers are not semantic requirements; ordering relations are. (This keeps a
coherent mutation that renumbers frames from failing for incidental numbering rather than
outcome.)

### R3. Exact status / output / error (findings: `semantic_status`, `semantic_output`, `semantic_error`)

6. `toolResponded.params.status` is exactly the string `"Completed"` (case-sensitive); exactly
   one response for the invocation; a duplicate or second response fails.
7. `toolResponded.params.output` deep-equals exactly
   `{"ok":true,"nonce":"99664eb6-d5ed-46f6-a516-39720ab87c27","q":"99664eb6-d5ed-46f6-a516-39720ab87c27"}`
   — three keys, boolean `true` (not `"true"`), both strings equal to the nonce, no extra keys,
   not an array, not `null`. (Contrast `na-native-submit` output is `[{"dummy":"landing"}]`; output
   shape is case-specific and must not be generalized.)
8. The response params key set is exactly `{invocationId,status,output}`: no `error` and no
   `errorText` key. `case.invokeError === null`; no `dir:"error"` frame for the invoke command.
9. `after.pageState.errors` is exactly `[]`; the raw post observation `errors` is exactly `[]`.
   Any page error message (as in `na-reject`/`na-throw`) fails this row.

### R4. Finite windows and timing (finding: `semantic_timing`)

10. `preAction.start == 1792590708997`, `preAction.end == 1792590709250`,
    `preAction.windowMs == 253 == end - start`, `windowMs >= 250`.
11. `after.start == 1792590709250`, `after.end == 1792590709753`,
    `after.windowMs == 503 == end - start`, `windowMs >= 500`.
12. `preAction.responseCount === 0`; `after.responses` has length exactly 1 and its single
    element deep-equals the raw `toolResponded` params (raw-summary binding).
13. The single response `at` (1792590709252) lies inside `[after.start, after.end]` and is at or
    after the action `at`. Do not impose a minimum latency: the actual latency is 2 ms and the
    `delayed` semantics belong to `na-delayed` only.
14. Receipt `after.start` equals the action frame `at`; receipt `preAction.end` equals the pre
    observation `at`; receipt `after.end` equals the post observation `at`.

### R5. Page-state transition (findings: `semantic_status`, `semantic_error`)

15. Pre value deep-equals `prePageState` above: form exists, is active, no submit yet, no error,
    value equals the nonce, focus on `go`, URL unchanged.
16. Post value deep-equals `postPageState` above: exactly one submit record with exactly the
    five fields and values `agentInvoked:true`, `isTrusted:true`, `q:<nonce>`, `active:true`,
    `respondWith:"function"`; no second record; `errors:[]`; `formActive:false`; form still
    exists with value still the nonce (no reset/remove semantics); focus still `go`; URL
    unchanged.
17. `formActive:false` alone is **not** sufficient for success (it also occurs in
    `na-reject`/`na-throw`); the outcome is established only by the conjunction of R3 + R5.
    Likewise the submit record alone is not sufficient (reject/throw also record one).

### R6. Navigation limits (finding: `semantic_navigation`)

18. `after.navigations` is exactly `[]`; the raw frame log contains no `Page.frameNavigated`
    with `seq >= after.start`. Exactly one navigation event exists in the whole case (the
    initial load, seq 3), and its URL is `http://127.0.0.1:43143/na-requestsubmit`.
19. Pre and post `url` both exactly equal that initial URL: loopback origin, path
    `/na-requestsubmit`, no query string. `formExists:true` after the action (contrast
    `na-native-submit`: URL `/landing?q=<nonce>`, `formExists:false`).
20. The acquisition request log contains no request whose URL is `/landing?q=` plus this case's
    nonce. The only `/landing` request in the receipt (`receipt.json:710`) carries the
    `na-native-submit` nonce `8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`; it does not belong to this
    row. The source `CHECK(!should_submit)` on the promise branch (S100 ~790-793) independently
    explains why navigation is impossible on this path.

### R7. Delayed distinction (finding: `semantic_delayed`)

21. `pageObservations` labels are exactly `["pre-action","after-action"]` in that order; no
    `delayed-before-release` observation; no frame with `dir:"release"`. The response is not
    gated by any release step. Do not treat "response inside the 500 ms window" as delayed
    semantics; `na-delayed` additionally requires the intermediate observation and release
    marker, which this row must not have.

### R8. Cleanup limits (finding: `evidence_binding`)

22. Raw: `browserPidsBefore` non-empty (9 positive integers), `browserPidsAfter` exactly `[]`,
    `browserPidsAtClose` deep-equals `browserPidsBefore`, `browserPidsSeenAfterClose` exactly
    `[]`, `contextClosed:true`, no `closeError`. `processIdentitiesAtLaunch` deep-equals
    `processIdentities` and matches the close set by `(pid,startTicks)`; do not pin PID literals
    as semantic content, only the count and identity relations.
23. Receipt: `cleanup.browserClosed:true` and `cleanup.serverClosed:true`, with no
    `contextError`/`serverError`/`tempError`.
24. Raw: `blocked:[]` and `downloads:[]`; no download or blocked-boundary event for this case.
25. Evidence/acquisition binding: raw `fixture.sha256` equals the fixture digest above and
    `sha256(fixture blob)`; receipt `evidence.path` is the raw path and `evidence.sha256` equals
    the raw digest above and `sha256(raw blob)`; producer path/SHA equal the frozen round-21
    values; the execution receipt binds `receiptSha256` and each artifact digest. A fixture,
    raw, producer, or execution digest mismatch is `evidence_binding`, never a silent pass.

### Finding attribution map (stable IDs from the API)

| Requirement group | Finding |
|---|---|
| R1 response missing/duplicate, R3 status literal, R5 page-state transition | `semantic_status` |
| R3 output object | `semantic_output` |
| R3 error surfaces, R5 `errors` | `semantic_error` |
| R2 order, R4 windows/counts/latency | `semantic_timing` |
| R6 navigation/URL/landing query | `semantic_navigation` |
| R7 release/label markers | `semantic_delayed` |
| R1 identity literals, R8 digests/cleanup/raw-summary | `evidence_binding` |
| exact 12 ids, one `na-requestsubmit` entry | `case_set` |
| note first line S101 + receipt backlink + no new producer claim | `source_binding` |
| closed expectation key set, literal-only values | `input_shape` |
| full 40-hex argv, bad/missing argv → exit 2 | `revision_input` |

Any deviation attributable to page state that is not URL/error (submit count or field values,
`formActive`, retained `value`, focus) maps to `semantic_status`; URL/`formExists` maps to
`semantic_navigation`; `errors` maps to `semantic_error`. This partition keeps every failure in
one of the eleven fixed IDs without inventing a new one.

### Explicitly out of scope for this row

The oracle establishes only: within this retained acquisition, this invocation produced one
`Completed` response with the dummy object, exactly one agent-invoked submit record, no
navigation, no error, the measured finite windows, and complete browser/server cleanup. It does
not establish general `requestSubmit` behavior outside WebMCP, human activation semantics,
behavior beyond the 500 ms post window, `isTrusted` as a universal rule, other modes, or branch
coverage. It is not a new acquisition and grants no new producer credit.

## Named coherent semantic mutation the old structural count admits

**M1 — flip the completion status while keeping every structural identity.** Change
`na-requestsubmit.json:204` `"status":"Completed"` → `"status":"Canceled"` and the mirror at
`receipt.json:143` `"status":"Completed"` → `"Canceled"`; keep the same `invocationId`, the same
`output {ok:true,…}`, the same page state, and refresh the digest links (raw SHA in
`receipt.evidence.sha256`, receipt SHA and raw artifact digest in
`runtime-execution-finalized.json`).

Why the old structural count still returns 12/clean: `.ufo/waves/round-21/measure-c1.mjs` never
reads `params.status` or `params.output` (literal search over the producer finds no such reads;
its only `status` occurrence is `r.status` from `spawnSync`). Its `event_identity` check
(lines 124-126) only requires one `toolInvoked` and that no `toolResponded` precedes it; its
`summary_mismatch` check (line 139) compares the receipt's `after.responses` to the raw
`toolResponded` params **wholesale**, so a status changed in both documents remains equal. Every
other check (sequence, windows, page state, hashes, cleanup) is untouched by the status string.
The mutation is therefore invisible to the structural measure while being semantically false:
the fixture's `mode:"success"` resolves `respondWith` (fixture line 15), and S100's resolved
branch calls back with the JSON result (S100 ~296-319), so `Canceled` — the status of the
`na-reset`/`na-remove` no-result paths — cannot occur. Under the new oracle this fails
`semantic_status` (expected literal `"Completed"`).

The same blindness class also admits the degenerate **all-silent** variant already named in the
wave context: delete the `toolResponded` frame, renumber the after marker, set
`after.responses:[]`, `after.submits:[]`, `pageState.submits:[]`, `formActive:true`, and refresh
digests. The old counter returns clean because its response check is vacuous on an empty event
list (`events.some(...)` is false; `responseCount` 0 compares to zero events; empty arrays equal
empty arrays). The new oracle rejects it at `semantic_status` ("response_missing") plus
`semantic_output`, by requiring exactly one `Completed` response and the exact output object.

For semantics tests under the new oracle, refresh only the digest/identity links the mutation
invalidates and keep the semantic literals (status, output, submit record, page state) fixed;
otherwise the test is exercising `evidence_binding`, not `semantic_status`/`semantic_output`.

## Confidence and remaining unknowns

**High confidence (observed, verified):** all values in O1-O5; the exact frame order and window
arithmetic; the digest links; the absence of any `status`/`output` read in the old counter
(lines 124-126, 139 plus literal search); S100's resolved-promise callback and `CHECK(!should_submit)`.

**Inference (stated, not observed):** `isTrusted:true` as a consequence of a C++-dispatched
submit event rather than a page-script event; the choice to assert sequence relationally rather
than pin absolute `seq` numbers; the finding-attribution map above (the API fixes the eleven IDs
but not which page-state field maps to which ID — I recommend the partition in the table).

**Unresolved / dependent on BuildOracle:** `corpus/evidence/round-22/semantic-expectations.json`
and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` do not exist at report time (the
round-22 evidence directory is absent), so the exact expectation schema and note wording are not
yet observable; my entry above is semantics-complete but field names must be reconciled with the
owned schema. The retained round-21 receipt's measured revision recorded in
`corpus/evidence/round-21/measurements.json:3` is `2d5eaaa3c8317bce31e1180b49df4516db35d44b`,
while the round-22 baseline is `5f585773258b33d2d514b00cd0b0775333578db6`; I did not verify that
the baseline commit contains byte-identical retained blobs, so the measure's revision input must
be the revision where the receipt and its twelve raws are present and hash-matching. No separate
`na-requestsubmit`-specific unknown remains in the evidence itself.

Report: .ufo/waves/round-22/w1/Raw03.md
