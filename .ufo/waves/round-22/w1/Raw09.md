# Raw09 — na-delayed finite semantic oracle

Seat: `TabiR22.Raw09`, scout/leaf. Read-only: this report is the only file written. No
production, clone, VCS, fleet, sibling or other-clone mutation. No tests, builds, linters,
formatters, smokes, producer runs or counter runs. No browser, network, service, REA or
credential access. No tools installed or updated (nothing needed). LSP is not applicable
here: the inspected artifacts are retained JSON/HTML data, not code symbols, so reading the
exact blobs is the only applicable method; the old counter was read as source, not executed.

Lane root for every path below: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## 1. Observed facts (no inference in this section)

### 1.1 Files and digests

| Artifact | Path | Observed value |
|---|---|---|
| Case evidence | `corpus/evidence/round-21/runtime/na-delayed.json` | sha256 `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2` |
| Fixture | `corpus/evidence/round-21/runtime/na-delayed.html` | sha256 `adde17227bbabf98d082ee7797f0ea646dff613ba057f331ea0c204070eae279` |
| Receipt | `corpus/evidence/round-21/runtime/receipt.json` | sha256 `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| Execution record | `.ufo/waves/round-21/runtime-execution-finalized.json` | `artifacts["corpus/evidence/round-21/runtime/na-delayed.json"] = 146adde4…b2344f2`; `receiptSha256 = 4bc7963…f937034` |
| Producer (receipt-declared) | `scripts/webmcp-lifecycle-round21.mjs` | sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |
| Semantic contrast witness | `.ufo/waves/round-21/final/semantic-contrast-witness.json` | na-delayed row: preWindowMs 252, afterWindowMs 755, responses[seq 17], markers seq 12/13/14/15/16/18, cleanup before 9, after [], closed true |
| Old structural counter | `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-21/measure-c1.mjs` | metric `c1_lifecycle_observations`; `CONFIG[8] = [false,'requestSubmit','delayed']` |

Receipt row `cases[id=na-delayed]` keys: `id, nonce, autosubmit, action, invocationId,
invokeError, preAction, after, evidence` — no `mode` key in the receipt row (mode exists only
in the case evidence). `invokeError` is `null`.

### 1.2 Fixture semantics (retained text)

`na-delayed.html` declares `<form id="f" toolname="lifecycle" tooldescription="Dummy
loopback lifecycle" action="/landing" method="get">`, one `required` text input `name="q"`
(no `type="email"`), submit button `id="go"`, no `toolautosubmit` attribute. Its submit
handler records `{agentInvoked,isTrusted,q,active,respondWith}`, calls `preventDefault()`,
sets `const mode="delayed"`, and executes
`e.respondWith(new Promise(resolve=>{window.release=()=>resolve(value)}))` with
`value={ok:true,nonce:<fixture nonce>,q:f.elements.q.value}`. Nonce literal:
`8aab9c3a-3485-4dfd-94de-4488f908909d`.

### 1.3 Frame timeline (evidence `frames`, seq is contiguous 1..18, `at` non-decreasing)

| seq | dir | method / label / action | at | delta |
|---|---|---|---|---|
| 1 | sent | `Page.enable` | 1792590714581 | — |
| 2 | result | — | 1792590714581 | 0 |
| 3 | event | `Page.frameNavigated` (`http://127.0.0.1:43143/na-delayed`) | 1792590714585 | 4 |
| 4 | sent | `WebMCP.enable` | 1792590714592 | 7 |
| 5 | event | `WebMCP.toolsAdded` (`lifecycle`, backendNodeId 2) | 1792590714593 | 1 |
| 6 | result | — | 1792590714593 | 0 |
| 7 | sent | `Page.getFrameTree` | 1792590714593 | 0 |
| 8 | result | frame id `B8AF6A2A51332A343DB6159C30A00731` | 1792590714595 | 2 |
| 9 | sent | `WebMCP.invokeTool` `{frameId, toolName:'lifecycle', input:{q:nonce}}` | 1792590714595 | 0 |
| 10 | result | `{invocationId:"6E3D45F0282C001E2A5FCCAB4DF99082"}` | 1792590714595 | 0 |
| 11 | event | `WebMCP.toolInvoked` (input as JSON string `{"q":"<nonce>"}`) | 1792590714595 | 0 |
| 12 | observation | `pre-action` | 1792590714847 | 252 |
| 13 | action | `requestSubmit`, phase `dispatch-started` | 1792590714847 | 0 |
| 14 | action-complete | `requestSubmit` | 1792590714848 | 1 |
| 15 | observation | `delayed-before-release` | 1792590715100 | 252 |
| 16 | release | — | 1792590715100 | 0 |
| 17 | event | `WebMCP.toolResponded` status `Completed` | 1792590715100 | 0 |
| 18 | observation | `after-action` | 1792590715602 | 502 |

### 1.4 Receipt row values

- `preAction = {start:1792590714595, end:1792590714847, windowMs:252, responseCount:0,
  formActive:true}` — `start` equals the invoke result frame `at`, `end` equals the
  `pre-action` observation `at`.
- `after` summary: `start:1792590714847`, `end:1792590715602`, `windowMs:755`,
  `responses` = one entry `{invocationId:"6E3D45…9082", status:"Completed",
  output:{ok:true, nonce, q:nonce}}`, `submits` = one entry `{agentInvoked:true,
  isTrusted:true, q:nonce, active:true, respondWith:"function"}`, `navigations:[]`,
  `pageState` = the `after-action` observation value. `start` equals the `action` frame
  `at`; `pageState` and `submits` are deep-equal to the `after-action` observation value
  and its `submits`.
- `evidence.sha256` equals the case file digest above.

### 1.5 Page-state observations (`pageObservations[*].value`)

| field | pre-action (seq 12) | delayed-before-release (seq 15) | after-action (seq 18) |
|---|---|---|---|
| `nonce` | nonce | nonce | nonce |
| `submits` | `[]` | one record (`agentInvoked:true, isTrusted:true, q:nonce, active:true, respondWith:"function"`) | identical one record |
| `errors` | `[]` | `[]` | `[]` |
| `url` | `http://127.0.0.1:43143/na-delayed` | same | same |
| `secureContext` | true | true | true |
| `formExists` | true | true | true |
| `formActive` | true | **true** | **false** |
| `value` | nonce | nonce | nonce |
| `focused` | `"go"` | `"go"` | `"go"` |

`Page.frameNavigated` occurs exactly once (seq 3, before the invoke). `receipt.requests` has
exactly one `GET /na-delayed` (`at 1792590714583`); the only `/landing` request in the whole
receipt is `GET /landing?q=8a5839ad-…` at `1792590710188`, which precedes this case's
navigation and belongs to `na-native-submit`.

### 1.6 Cleanup / boundary values

`contextClosed:true`; `closeError` and `forcedCleanup` absent; `browserPidsAfter:[]`;
`browserPidsSeenAfterClose:[]`; `blocked:[]`; `downloads:[]`; `browserPidsBefore` and
`browserPidsAtClose` are the same ordered 9-PID list `[1809561,1809568,1809569,1809590,
1809610,1809626,1809647,1809656,1809658]`; `processIdentitiesAtLaunch` and
`processIdentities` both hold 9 entries with matching `startTicks` (6 distinct tick values).
`receipt.cleanup = {browserClosed:true, serverClosed:true}` with no error fields.

### 1.7 Old structural counter's actual reading of this row

`grep` over the round-21 `measure-c1.mjs` finds no use of `status`, `output`, `errorText`,
`delayed-before-release` or `release` as data fields (the only `status` hits are
`spawnSync(...).status` at the Git/CLI plumbing). The counter looks up page observations only
by the labels `pre-action` and `after-action`; the `delayed-before-release` observation and
the `release` frame are never referenced. Its summary check requires receipt/evidence
equality (`after.responses` versus matching `toolResponded` params before the post marker),
`pageState`/`submits`/`navigations` equality, and window arithmetic — it never evaluates
whether the outcome is consistent with `mode:"delayed"`.

## 2. Independent finite semantic oracle for `na-delayed`

This is a specification for `BuildOracle`'s `evaluate(files)`; the expectations singleton for
this case must be authored as fixed content, not recomputed from the receipt under
evaluation. The oracle must not import or call the old counter as an outcome oracle. All
checks below are finite predicates over the retained bytes; none asserts liveness beyond the
recorded windows.

### 2.1 Expectations record (content that must exist for this case)

```
id:            "na-delayed"
mode:          "delayed"            (evidence + fixture literal `const mode="delayed"`)
autosubmit:    false                (fixture has no `toolautosubmit` attribute)
action:        "requestSubmit"
nonce:         "8aab9c3a-3485-4dfd-94de-4488f908909d"
invocationId:  "6E3D45F0282C001E2A5FCCAB4DF99082"
toolName:      "lifecycle"
input:         {"q":"<nonce>"}
status:        "Completed"
output:        {"ok":true,"nonce":"<nonce>","q":"<nonce>"}
error:         absent / null
labels:        ["pre-action","delayed-before-release","after-action"]
seq kinds:     {12:"pre-action",13:"action:requestSubmit",14:"action-complete:requestSubmit",
                15:"delayed-before-release",16:"release",17:"toolResponded",18:"after-action"}
windows:       pre>=250ms, hold>=200ms and <=2000ms, release->response<=1000ms, after>=500ms
page:          pre.formActive true; hold.formActive true; post.formActive false;
               submits exactly 1; errors exactly 0; no navigation after the action
cleanup:       contextClosed true; pidsAfter 0; seenAfterClose 0; blocked 0; downloads 0
```

Invariants that must survive regeneration (so the record is semantic, not a frozen copy):
the invoke `input.q`, `output.nonce`, `output.q`, page `nonce`/`value`, and submit `q` all
equal the fixture nonce; the invoke `frameId` equals the `Page.getFrameTree` frame id; the
invocation id is identical across the invoke result, `toolInvoked`, `toolResponded` and the
receipt row; URL origin/path are identical across `Page.frameNavigated`, `toolsAdded`,
`getFrameTree` and all three observations. Port, nonce and invocation id are
acquisition-specific literals; they must be re-authored from a new independent acquisition,
never copied out of the receipt being judged.

The `seq kinds` map is the retained acquisition's literal numbering and is fixed for this
receipt. The semantic requirement is the relative order and the exact marker set, not the
integers, so a re-authored acquisition may legitimately renumber `seq` while remaining valid.

### 2.2 Finding mapping and exact predicates

`case_set` — the case exists exactly once with `id:"na-delayed"`; the fixed 12-ID set is
unchanged. Missing expectations while the note/other entries exist is a failure, not a
baseline; both note and expectations absent is baseline `value:0`, `exit:0`.

`input_shape` — exactly one `sent` frame with `method:"WebMCP.invokeTool"`; its
`params.toolName === "lifecycle"`; `params.frameId` is a non-empty string equal to the
`Page.getFrameTree` result frame id and to the `toolsAdded` tool `frameId`;
`params.input` deep-equals `{q:nonce}` (exact key set, no extra keys). Exactly one
`result`/`error` frame answers that command id; it is a `result` whose
`result.invocationId` is the non-empty correlation string; no `error` frame exists for that
command; receipt `invokeError === null`.

`semantic_status` — the single `toolResponded` frame with this
`invocationId` has `params.status === "Completed"` exactly. `Error` and `Canceled` are
failures regardless of any other coherent field in the bundle.

`semantic_output` — that frame's `params.output` deep-equals
`{ok:true, nonce:<nonce>, q:<nonce>}`: `ok` is boolean `true`, both strings equal the nonce,
and the key set is exactly `{ok,nonce,q}`. A missing `output`, an array output (the
`na-native-submit` shape), or any altered field fails.

`semantic_error` — `params.errorText` is absent (or `null`) on that frame, the receipt
`after.responses` entry has no error text, and the page-state `errors` array is empty in all
three observations. `invokeError` is `null`. Any error text on a Completed delayed row fails.

`semantic_timing` — every duration used is a finite number from the recorded timestamps:
`preAction.windowMs === preAction.end - preAction.start`, `end === pre.at`, and
`windowMs >= 250`; `after.windowMs === after.end - after.start`, `end === post.at`,
`after.start === action.at`, and `windowMs >= 500`; the hold interval
`hold.at - actionComplete.at` is finite in `[200, 2000]` ms (observed 252); the release
frame `at >= actionComplete.at`; the response satisfies `seq > release.seq` and
`release.at <= response.at <= release.at + 1000` (observed 0 ms), and
`response.at < post.at`. Null/NaN/negative/absent durations fail; a response outside the
recorded post window fails.

`semantic_delayed` — exactly one observation labelled
`delayed-before-release`, positioned strictly after `action-complete` and strictly before
the `release` frame; at that observation the matching response count is zero (no
`toolResponded` with this invocation id at any lower seq), `formActive === true`, the submit
record count is already 1 with `active:true`, and `errors` is empty. Exactly one `release`
frame exists, followed by exactly one matching `toolResponded`, and the `after-action`
observation follows it. This is the evidence that the `respondWith` promise was held
unresolved across a finite observed interval and settled only after the explicit release.

`semantic_navigation` — `after.navigations` deep-equals `[]`
and equals the independently computed list of `Page.frameNavigated` frames with
`at >= after.start && seq < post.seq`. The post `url` is unchanged from the pre `url`
(no `/landing` navigation); the case's interval contains no request other than the single
`GET /na-delayed` in `receipt.requests`. `formExists` stays true in all three observations.

`semantic_status`/`semantic_output`/`semantic_error`/`semantic_timing`/`semantic_delayed`/
`semantic_navigation` above are the row's explicit actual semantics; a row that satisfies
the old structural predicates but fails any of them must not contribute to `value:12`.

`evidence_binding` — `receipt.cases[id].evidence.path === "corpus/evidence/round-21/runtime/
na-delayed.json"`, its declared `sha256` is 64 lowercase hex and equals the recomputed hash
of the loaded blob; the fixture path/digest equals the retained fixture and the fixture text
contains the nonce and `const mode="delayed"`; producer path/digest matches the receipt
declaration; the acquisition record's artifact digest for this file and for `receipt.json`
match, and its `receiptSha256` matches the receipt. `after.responses` deep-equals the list of
matching `toolResponded` `params` with `seq < post.seq`; `after.pageState` deep-equals the
post observation value; `after.submits` deep-equals its `submits`; `preAction.formActive`
equals the pre observation's `formActive`; `preAction.responseCount` equals the number of
matching responses with `seq < pre.seq` (0).

`revision_input` — `evaluate` receives exact Git blobs for a full 40-hex revision, read
shell-free with isolated Git env / no replace objects; a malformed revision or unreadable
input yields `exit:2` (`could-not-evaluate`), never a semantic finding or a fabricated zero.
A partial bundle (one of note/expectations missing) is `value:0`, `exit:1`. A baseline with
both absent is `value:0`, `exit:0`. `value:12` only when all twelve rows have explicit
semantics and no findings; `exit:1` otherwise.

### 2.3 Page-state and cleanup limits (explicit)

Page state is accepted only in the three recorded forms of §1.5. It is a finite DOM
snapshot, not a claim about browser-internal state: `formActive` is read from
`#f.matches(':tool-form-active')` at observation time; the transition true→true→false across
pre/hold/post is treated as evidence that settlement occurred after the release, not as a
general focus/pause guarantee. Cleanup accepts only: `contextClosed:true`, no
`closeError`/`forcedCleanup`, `browserPidsAfter:[]`, `browserPidsSeenAfterClose:[]`,
`browserPidsAtClose` equal to `browserPidsBefore` (non-empty, same ordered list),
`processIdentities` matching launch identities, `blocked:[]`, `downloads:[]`, and receipt
`cleanup.browserClosed === true` with `serverClosed === true` and no error fields. These are
finite owned-process observations; they do not prove universal process liveness or absence
of hostile-host effects, and they do not authenticate the publisher or any actor.

## 3. One coherent semantic mutation the old structural count admits

**Named mutation M09-delayed-reject.** Turn the retained "hold, then complete" acquisition
into a coherent "hold, then reject" acquisition, keeping every structural predicate intact.

Edits, all inside the same bundle:

1. `corpus/evidence/round-21/runtime/na-delayed.html` — in the submit handler, keep
   `const mode="delayed"` and the hold, but make the release reject:
   `e.respondWith(new Promise((resolve,reject)=>{window.release=()=>reject(Error('dummy
   rejection'))}))`. The delayed branch still holds an unresolved `respondWith` promise
   until `window.release()` is called.
2. `corpus/evidence/round-21/runtime/na-delayed.json` — rewrite the single `toolResponded`
   frame (seq 17) `params` to
   `{invocationId:"6E3D45F0282C001E2A5FCCAB4DF99082", status:"Error", errorText:"respondWith
   promise was rejected"}`. Leave `frames` 1–16 and 18 otherwise untouched. In the
   `after-action` observation only, set `errors:["Uncaught Error: dummy rejection"]`
   (the string observed in the retained `na-reject` row). The `pre-action` and
   `delayed-before-release` observations keep `errors:[]`, `formActive:true`, one submit
   record and the nonce value.
3. `corpus/evidence/round-21/runtime/receipt.json` — mirror the new `after.responses[0]`
   object and the new `after.pageState`/`after.submits`; `preAction` is unchanged.
4. Relink digests coherently: the case `fixture.sha256` and the receipt
   `cases[na-delayed].evidence.sha256` to the new file hashes; in
   `runtime-execution-finalized.json`, `artifacts[na-delayed.html]`,
   `artifacts[na-delayed.json]` and `artifacts[receipt.json]` plus `receiptSha256` to the
   new hashes. No other case's digests change.

Why it is coherent: it is a self-consistent delayed-then-rejection acquisition. The hold is
still evidenced (pre-release observation with one agent-invoked submit, `formActive:true`,
zero responses, then an explicit `release`), the error text and page error match the
retained `na-reject` shapes (`status:"Error"`, one `respondWith` submit record, `value`
nonce, `formActive:false`, one uncaught rejection message), and every declared digest equals
its recomputed blob. No field contradicts another.

Why the old structural count admits it: `measure-c1.mjs` reads no `status`, `output` or
`errorText` field and never inspects the `release`/`delayed-before-release` frames or the
fixture's handler branch; it only requires the fixture digest to match and the fixture to
contain the nonce. With the receipt mirror and digests updated, `case_identity` still passes
(`mode:"delayed"` and `autosubmit:false` untouched), `event_identity` still passes (one
`toolResponded` after `toolInvoked`), `summary_mismatch` still passes (`after.responses`
equals the raw event params, `pageState`/`submits` equal the observation), and all
window/order/cleanup predicates are unchanged — so its metric remains 12 with `exit:0`.

Why the specified oracle rejects it: `semantic_status` fails (`"Error" !== "Completed"`);
`semantic_output` fails (no `output` object); `semantic_error` fails (error text present on
a delayed row whose defined semantics require a clean completion). The row contributes 0, so
the metric is `value:0`, `verdict:"failed"`, `exit:1` — a semantic red, not an incidental
stale-hash red. This is the concrete contrast between counting structurally valid rows and
evaluating the case's actual outcome.

A second artifact-coherent variant exists for the timing axis (delete the
`delayed-before-release` observation and its frame, renumber `seq`, shift the post window
and relink digests); it is not the named mutation, but it is admitted by the same blind spot:
the old counter never references that label.

## 4. Residual unknowns and limits

- The exact expectations schema is `BuildOracle`'s; this report specifies required content
  and predicates, not their file layout. Literal JSON key order is irrelevant; exact key
  sets and values are not.
- Hold `[200,2000]` ms and release→response `<=1000` ms upper bounds are proposed here
  (`[INFERENCE]`), derived from the producer's 250 ms/500 ms sleeps, the 5000 ms observation
  deadlines and the observed 252 ms/0 ms; they are finite design bounds, not published
  claims. The lower bounds (250/500) match the retained receipt arithmetic.
- The nonce, port `43143`, frame id and invocation id are acquisition-specific. They are
  pinned only as fixed expectations for this retained acquisition; a regenerated receipt
  requires a newly authored independent acquisition, never recomputation from the receipt
  under evaluation.
- The oracle does not and cannot claim: publisher/actor authentication; a general
  eventual-settlement guarantee; browser-internal state-machine equivalence; full effective
  argv or served-wire body; universal liveness or every-OS-fault behavior. The delayed row's
  meaning is bounded to the recorded hold window and the explicit release marker.
- No source was reopened and no source-anchor claim is added here. The note's existing
  delayed anchors (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`,
  S100:290-319,787-806) are cited as the note's boundary text, not as new evidence.
- No execution of the old counter, the new measure, the producer or any test was performed
  in this seat; all statements about counter behavior above come from reading its source.

— `TabiR22.Raw09` · trailer relative to lane root: `.ufo/waves/round-22/w1/Raw09.md`
