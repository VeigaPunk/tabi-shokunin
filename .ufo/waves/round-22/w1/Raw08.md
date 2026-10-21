# Raw08 — `na-throw` finite semantic oracle (round 22, W1)

Scope: leaf scout for `na-throw` only. Retained round-21 acquisition was read directly; no
browser run, network, REA, installs or production edits. Only this report was written. The old
structural counter is frozen input context, not an outcome oracle; nothing below imports,
recomputes through, or edits it.

Method note: no `lsp` device is mounted in this seat (`read xd://lsp` returns
`No such tool: xd://lsp`). JSON/HTML evidence has no language server; the only code-semantics
anchor is the retained single-file Blink excerpt, traced by literal callsite, not by an LSP
definition/reference result. This unavailability is recorded rather than presenting grep/read
as semantic proof.

## 1. Files and observed identities

| Path | Role | Observed |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-throw.json` | case evidence, 16 recorded frames (CDP + producer markers), 2 page observations | `sha256 e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a` [OBSERVED: `sha256sum`] |
| `corpus/evidence/round-21/runtime/na-throw.html` | fixture, `const mode="throw"` | `sha256 579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e` [OBSERVED] |
| `corpus/evidence/round-21/runtime/receipt.json` | receipt, schema `tabi-round21-runtime-v1`, 12 cases | `sha256 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` [OBSERVED] |
| `scripts/webmcp-lifecycle-round21.mjs` | producer claim | `sha256 bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` [OBSERVED] |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | acquisition binding, `exit 0` | `receiptSha256 4bc79636…f937034`; na-throw artifact pins below [OBSERVED] |
| `.ufo/waves/round-21/measure-c1.mjs` | old structural counter (frozen, unchanged) | `sha256 8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` [OBSERVED] |
| `.ufo/waves/round-21/sources/html_form_element.cc` | S100 decoded source excerpt | error literal at lines 810–813; branch at 807 [OBSERVED] |

Receipt/case cross-links agree with disk: `cases[na-throw].evidence.sha256 == e46d751e…d1a`,
`na-throw.json fixture.sha256 == 579ab87b…539e`, and the finalized execution pins
`na-throw.json == e46d751e…d1a`, `na-throw.html == 579ab87b…539e`,
`receipt.json == 4bc79636…f937034` [OBSERVED]. No new producer claim is made; producer,
environment and acquisition identities remain the round-21 ones.

## 2. Observed case facts the oracle must decide

Identity: `id "na-throw"`, `nonce 085b6a21-656a-452a-9a0d-83271e42bc29`, `autosubmit false`,
`action "requestSubmit"`, `mode "throw"`, `invocationId 3CE04A035739A78B887F37C518AD62A9`,
receipt `invokeError null` [OBSERVED].

Fixture semantics (`na-throw.html`) [OBSERVED]: form `toolname="lifecycle"`,
`tooldescription="Dummy loopback lifecycle"`, `action="/landing" method="get"`, required input
`q`, submit button `#go`; the single `submit` listener runs for any submit, pushes one
observation record, calls `e.preventDefault()`, then executes
`if(mode==='throw') throw Error('dummy submit handler throw')`, so `respondWith` is never
called on this path.

Frame/observation sequence [OBSERVED, exact]:

| seq | at | dir/kind | detail |
|---|---|---|---|
| 1–2 | 1792590713648 | send/result | `Page.enable` |
| 3 | 1792590713653 | event | initial `Page.frameNavigated` → `http://127.0.0.1:43143/na-throw`, frame `F997389D2C55CAA9A6B8821493E1B74C`, loader `0053610D3DB06342455AF4FF5DF11FE4` |
| 4–6 | 1792590713662–664 | send/event/result | `WebMCP.enable`; `WebMCP.toolsAdded` one tool `lifecycle` with `inputSchema` requiring string `q`; same `frameId` |
| 7–8 | 1792590713664 | send/result | `Page.getFrameTree`, frame id/url identical to the case URL |
| 9 | 1792590713664 | sent | `WebMCP.invokeTool`, command `4`, `{frameId:F997…, toolName:"lifecycle", input:{q:<nonce>}}` |
| 10 | 1792590713664 | result | command `4`, `{invocationId:"3CE04A035739A78B887F37C518AD62A9"}`, no `message`/`error` |
| 11 | 1792590713664 | event | `WebMCP.toolInvoked`, same `toolName`/`frameId`/`invocationId`, `input` JSON string parsing to the sent object |
| 12 | 1792590713917 | observation | `pre-action` |
| 13 | 1792590713917 | action | `requestSubmit`, `phase:"dispatch-started"` |
| 14 | 1792590713918 | action-complete | `requestSubmit` |
| 15 | 1792590713918 | event | `WebMCP.toolResponded`, same `invocationId`, `status:"Error"`, exact `errorText` below; **no `output` key** |
| 16 | 1792590714419 | observation | `after-action` |

The tool-level `errorText` is exactly 139 characters and has no double spaces [OBSERVED]:

```
The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result
```

Source entailment [OBSERVED at S100 `html_form_element.cc:807–813`]: after
`DispatchEvent(*submit_event)`, Blink reads `should_submit`; if `declarative_webmcp_call` is
still running, `TakeRespondWithPromise()` is null (never called) and `!should_submit` (because
`preventDefault()` ran), so it calls
`executing_tool->CallDoneCallback(base::unexpected(ScriptToolError(
ScriptToolErrorCode::kToolInvocationFailed, <that exact literal>)))`. The JS throw is a page
error surfaced through `window`'s error listener, not the tool error text. Also because
`should_submit` is false, `ScheduleFormSubmission` is not reached, so no `/landing` navigation
occurs [OBSERVED source branch + OBSERVED zero navigation/request in-window].

Receipt row [OBSERVED]: `preAction {start 1792590713664, end 1792590713917, windowMs 253,
responseCount 0, formActive true}`; `after {start 1792590713917, end 1792590714419,
windowMs 502, responses:[seq-15 params], submits:[one record], navigations:[], pageState:<post>}`
[OBSERVED].

Page state [OBSERVED, exact equality with the seq-12/seq-16 observations]:

- pre: `nonce 085b6a21…bc29`, `submits []`, `errors []`,
  `url http://127.0.0.1:43143/na-throw`, `secureContext true`, `formExists true`,
  `formActive true`, `value 085b6a21…bc29`, `focused "go"`.
- post: same nonce/url/secureContext/formExists/value/focus; `submits` exactly
  `[{agentInvoked:true, isTrusted:true, q:<nonce>, active:true, respondWith:"function"}]`;
  `errors ["Uncaught Error: dummy submit handler throw"]`; `formActive false`.

The one submit record is captured *inside* the handler while `:tool-form-active` still
matched (`active:true`), while `formActive` sampled after the terminal is false; both values
are evidence, not a contradiction [OBSERVED].

Cleanup [OBSERVED]: `browserPidsBefore` 9 positive integers with 9 distinct PIDs;
`processIdentitiesAtLaunch` has the same 9 `(pid, startTicks)` pairs — distinct PIDs, while
`startTicks` values legitimately repeat across distinct PIDs (e.g. `8969689` for pids
1809438/1809439); `browserPidsAtClose` deep-equals `browserPidsBefore`;
`processIdentities` deep-equals `processIdentitiesAtLaunch`;
`browserPidsAfter []`; `browserPidsSeenAfterClose []`; `contextClosed true`; no `closeError`
key; `blocked []`; `downloads []`; receipt `cleanup {browserClosed:true, serverClosed:true}`
with no error fields [OBSERVED].

Navigation/request boundary [OBSERVED]: one `Page.frameNavigated` (seq 3, initial load, before
the invocation); no second navigation at any seq; `after.navigations []`; no receipt request in
`[1792590713917, 1792590714419)` — the sole `/na-throw` GET is at `1792590713651`, and the sole
`/landing?q=…` GET (`1792590710188`) belongs to the `na-native-submit` window [OBSERVED].

## 3. Finite semantic oracle for `na-throw`

Authored independently from the fixture + S100 literal + retained raw, not recomputed from the
receipt being evaluated. `<nonce>` is the only runtime substitution; every literal below is a
fixed expectation bound to the retained acquisition and pinned Chromium `154.0.8037.97`.
Proposed fragment for `corpus/evidence/round-22/semantic-expectations.json` (owner:
BuildOracle; this is an independent specification, not the final file):

```json
{
  "id": "na-throw",
  "autosubmit": false,
  "action": "requestSubmit",
  "mode": "throw",
  "expected": {
    "status": "Error",
    "output": { "present": false },
    "error": {
      "present": true,
      "errorText": "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result",
      "pageErrors": ["Uncaught Error: dummy submit handler throw"]
    },
    "invocation": {
      "invocationId": "3CE04A035739A78B887F37C518AD62A9",
      "toolName": "lifecycle",
      "frameId": "F997389D2C55CAA9A6B8821493E1B74C",
      "input": { "q": "<nonce>" },
      "invokeError": null
    },
    "pre": {
      "submits": 0, "errors": 0, "formActive": true,
      "formExists": true, "secureContext": true, "focused": "go",
      "value": "<nonce>"
    },
    "post": {
      "submits": 1,
      "submit": {
        "agentInvoked": true, "isTrusted": true, "active": true,
        "respondWith": "function", "q": "<nonce>"
      },
      "errors": 1,
      "formActive": false, "formExists": true, "secureContext": true,
      "focused": "go", "value": "<nonce>"
    },
    "windows": {
      "preActionMs": 253, "afterMs": 502,
      "preMsMin": 250, "afterMsMin": 500, "responses": 1
    },
    "navigation": { "navigated": false, "landingRequests": 0, "urlUnchanged": true },
    "cleanup": {
      "contextClosed": true, "browserPidsAfterEmpty": true,
      "browserPidsSeenAfterCloseEmpty": true, "blockedEmpty": true,
      "downloadsEmpty": true, "serverClosed": true
    }
  }
}
```

Mapping to the contract's stable finding ids:

### semantic_status
- Exactly one `WebMCP.invokeTool` sent frame exists; exactly one `result` frame with the same
  `command` and `result.invocationId === 3CE04A…2A9`; no `error`-dir frame for that command;
  receipt `invokeError === null`.
- Exactly one `WebMCP.toolInvoked` and exactly one `WebMCP.toolResponded` for that
  `invocationId` in the whole file (not merely before the post marker).
- `toolResponded.params.status === "Error"`, the mode-table outcome for `throw`. A
  `Completed`/`Canceled`/missing status fails. Response count inside the finite after window is
  exactly one and is that frame.

### semantic_output
- `Object.hasOwn(toolResponded.params, "output") === false`; `result`/`output`/`value` keys
  are absent. `output:null`, `output:{}`, `output:[]`, or any object/array payload fails: the
  `ScriptToolError` terminal carries no tool result, so a success-shaped payload is
  semantically contradictory even when the status string still says `Error`.

### semantic_error
- `errorText` equals the 139-byte literal above, byte-for-byte. The page throw text
  (`"Uncaught Error: dummy submit handler throw"`) is a *different* diagnostic and MUST fail if
  substituted here; so must the reject text (`"respondWith promise was rejected"`).
- Post page `errors` is exactly `["Uncaught Error: dummy submit handler throw"]` (length 1,
  exact string). Missing, duplicated or reordered entries fail.
- The two diagnostics coexist for one reason: `preventDefault()` sets `should_submit=false`
  while `respondWith()` was never called, so Blink reports the programming error to the tool,
  and the handler's throw independently reaches `window.onerror`. Status, tool error, and page
  error are checked as a triple; any pair alone is insufficient.
- `semantic_delayed` is not applicable: this path has no `window.release`, no held promise and
  no before/after release marker. A `Completed` terminal, or one derived from the delayed case,
  fails.

### semantic_timing
- Ordering is by `seq`, not wall time: `sent(9) < result(10) < toolInvoked(11) < pre(12)
  < action(13) < complete(14) < responded(15) < post(16)`. Recorded `at` ties (seq 9/10/11 at
  3664; 14/15 at 3918) are admissible; the oracle must not infer concurrency from equal
  millisecond stamps.
- `preAction.start === sent.at` (3664), `preAction.end === pre.at` (3917),
  `preAction.windowMs === 253 === end-start`, `preAction.windowMs >= 250`,
  `preAction.responseCount === 0`, and no `toolResponded` seq precedes `pre`.
- `after.start === action.at` (3917), `after.end === post.at` (4419),
  `after.windowMs === 502 === end-start`, `after.windowMs >= 500`; `responded.seq` lies inside
  `(complete.seq, post.seq)`; action seq < complete seq < post seq.
- Exactly one `dir:"action"` and one `dir:"action-complete"`, both `action:"requestSubmit"`,
  action phase `dispatch-started`; exactly one pre marker and one post marker, each deep-equal
  in `seq`, `at`, and `value` to the matching `pageObservations` entry.
- The 1 ms response latency is incidental; the semantic requirement is only "terminal after
  action dispatch and inside the finite after window". No minimum-latency or delayed-release
  shape may be imported from `na-delayed`.

### semantic_navigation
- Exactly one `Page.frameNavigated` in the evidence (the initial `/na-throw` load at seq 3),
  and it precedes the invocation.
- No `Page.frameNavigated` after the action; `after.navigations` is `[]`.
- Post URL byte-equals pre URL; `secureContext === true`; `formExists === true`; `value`
  remains `<nonce>`.
- No receipt request in `[after.start, after.end)` has path `/landing`; the fixture's
  `action="/landing"` must not be reached. This is source-entailed by `should_submit=false`
  skipping `ScheduleFormSubmission`; the empty request window is corroboration, not the whole
  assertion.

### page-state and sequence (pre/action/post)
- Pre is exactly the observed pre state: empty `submits`/`errors`, `formActive true`, nonce
  `value`, `focused "go"`, `formExists true`, `secureContext true`.
- Post is exactly the observed post state: one submit record with all five fields as listed,
  one page error, `formActive false`, same URL/nonce/focus.
- `submits[0].q === nonce` and post `value === nonce`; `agentInvoked:true` and `isTrusted:true`
  bind an agent-invoked, trusted form submit, not a synthetic DOM-only call.
- `active:true` (handler-time `:tool-form-active`) and `formActive:false` (post-terminal) must
  both be preserved. Rewriting either to the other's value, or dropping the submit record,
  fails the fixed page-state expectation above. (The precise stable finding id for a page-state
  contradiction is BuildOracle's mapping; the mutation in §4 is unaffected because it preserves
  both values and only changes the terminal and `errors`.)

### cleanup
- `contextClosed === true`, no `closeError`; `browserPidsBefore` nonempty all positive
  integers with distinct PIDs; `browserPidsAtClose` equals `browserPidsBefore`;
  `processIdentities` matches `processIdentitiesAtLaunch` as the same `(pid, startTicks)`
  pairs (repeated `startTicks` across distinct PIDs is valid); `browserPidsAfter` and
  `browserPidsSeenAfterClose` are strictly `[]`; `blocked` and `downloads` are `[]`; receipt
  `cleanup.browserClosed` and `cleanup.serverClosed` are `true` with no asserted error fields.
- These are sampled observations around close. Empty survivor lists mean "none sampled", not
  universal quiescence; a nonempty `browserPidsAtClose` is expected and must not be treated as
  failure. No PID-reuse proof and no OS-level fault injection are claimed.

### evidence_binding / case_set / source_binding / input_shape / revision_input
- Evidence `sha256 === e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a`;
  fixture `sha256 === 579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e`;
  receipt `sha256 === 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`;
  producer `scripts/webmcp-lifecycle-round21.mjs` /
  `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`; execution `exit 0`,
  four-element argv including `--out .ufo/waves/round-21/runtime-finalized-candidate`, and
  per-artifact pins recomputed from the blobs including the three na-throw/receipt entries.
  Receipt environment must be Node `v24.21.0`, Chromium `154.0.8037.97`, Playwright `1.64.0`,
  and the recorded four flags.
- Case set is the fixed 12 ids exactly once; `na-throw` once; its nonce and invocation id are
  not reused elsewhere. Evidence `schema === "tabi-round21-case-v1"` and
  `mode === "throw"`; receipt `schema === "tabi-round21-runtime-v1"` and `producer.path` /
  `producer.sha256` as above.
- Note provenance: the canonical new note (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`)
  MUST begin its first line with `source:` and its S101 association MUST include
  `corpus/evidence/round-21/runtime/receipt.json`; the oracle must not accept a body-only
  identifier as provenance. This row adds no producer or freshness claim.
- Input shape/revision: evaluation reads exact Git blobs at a full 40-hex revision, shell-free,
  with isolated Git config and no replacement objects. Missing new expectations **and** note
  means baseline `0`/exit `0`; partial missing means failed `0`/exit `1`; could-not-evaluate
  means exit `2`. The expectations literals above are never recomputed from the receipt under
  evaluation.

## 4. One coherent semantic mutation the old structural count admits

**Mutation `M-throw-silent-completed`:** in `na-throw.json` seq 15, replace the terminal with
`{invocationId:"3CE04A…2A9", status:"Completed", output:{ok:true, nonce:<nonce>, q:<nonce>}}`
and drop `errorText`; set `errors` to `[]` in **both** copies of the post-action page state
(`frames[seq=16].value` and `pageObservations[after-action].value`); mirror the same payload in
`receipt.cases[na-throw].after.responses` and the same post state in `after.pageState`; leave
every other frame, timestamp, window, submit record, PID/cleanup field and the fixture
untouched. Then update the digest chain coherently:

1. recompute `sha256(na-throw.json)` and write it to `cases[na-throw].evidence.sha256`;
2. recompute `sha256(receipt.json)` and write it to
   `.ufo/waves/round-21/runtime-execution-finalized.json` `receiptSha256` and
   `artifacts["corpus/evidence/round-21/runtime/receipt.json"]`;
3. update `artifacts["corpus/evidence/round-21/runtime/na-throw.json"]` to the new case hash.

Why the old count admits it — `.ufo/waves/round-21/measure-c1.mjs` is a structural mirror, not
an outcome oracle:

- `summary_mismatch` (line 139) only requires `after.responses` to deep-equal the raw
  `toolResponded` params before the post marker and `after.pageState` to deep-equal the raw post
  observation. The mutation edits both sides, so the mirror agrees.
- `event_identity` (lines 126–129) checks only the invocation id's presence/order and the
  invoked-input payload; it never reads `status`, `errorText`, or `output`.
- `case_identity` (line 112) pins the literal `mode === "throw"` but does not derive an outcome
  from it; the fixture's `if(mode==='throw') throw …` is never executed or compared.
- `evidence_digest` (line 108) and `execution_binding` (line 70) are satisfied by steps 1–3;
  `fixture_digest` (lines 114–116) is untouched; `producer_digest`, `environment`, `cleanup`,
  `source_binding`, `note_missing`, `case_set`, `window_mismatch`, `order_mismatch`,
  `context_cleanup`, and `boundary_violation` are unchanged.
- The fixture stays byte-identical and still contains `if(mode==='throw') throw …`;
  `fixture_digest` only hashes it and checks the nonce substring, never that the recorded
  terminal follows from the fixture's mode branch. That is the structural blind spot, not a
  hash gap.

Expected result: old counter `value 12`, `exit 0`, `findings []` — the mutation is silent under
the old counter. It is exactly the all-silent synthetic-positive class the round-22 oracle must
reject: raw and summary are mutually coherent and every digest link is fresh, but the declared
`throw` outcome is replaced by a success payload.

Expected under the new oracle: at minimum the stable findings `semantic_status` (expected
`Error`, observed `Completed`), `semantic_output` (expected absent, observed object), and
`semantic_error` (expected programming-error literal and one page error, observed missing
`errorText` and empty page `errors`). If a variant also claims the `/landing` navigation, add
`semantic_navigation`. The mutation must not be caught by `evidence_binding` or
`revision_input`; those stay green by construction, proving the red outcome is semantic rather
than an incidental stale hash.

A second, weaker variant the old count also admits (not the named mutation): keep
`status:"Error"` but swap in the page throw text as `errorText`. Old checks pass because no
status/error literal is fixed; the new `semantic_error` rejects it. The named mutation above is
preferred because it flips the whole lifecycle outcome, not just one diagnostic. For the
minimal silent form, replacing the output with `{}` (or omitting it) is equally admitted by the
old counter and equally rejected by `semantic_status`/`semantic_output`/`semantic_error`; the
richer `{ok:true,nonce,q}` payload above is used only because it matches the fixture's own
success branch and makes the semantic disagreement explicit.

## 5. Confidence, limits and open items

- [OBSERVED] every literal, sequence number, timestamp, hash and page-state value above was read
  from the retained files and re-verified with `sha256sum`/JSON parsing. The tool error literal
  matches the concatenated S100 source literal at `html_form_element.cc:810–813` byte-for-byte.
- [INFERENCE] `preventDefault()` + no `respondWith()` ⇒ programming-error tool terminal and no
  `ScheduleFormSubmission` navigation is the source-entailed reading of the S100 branch; the
  recorded raw agrees. The uncaught throw appearing only in page `errors` is the observed web
  error-reporting path, not a new producer claim.
- Limits: this is validation of retained historical bytes, not authenticity or a fresh browser
  observation. The CDP transcript is producer-mediated; effective browser argv, served-wire
  bytes, actor authentication, real sites, and every browser/OS hang or signal fault remain
  unexercised. Page state is asserted only at the two observation markers, not continuously;
  cleanup is sampled, not universal quiescence. `formActive` clearing is observed post-state,
  not a timing guarantee. The exactly-one-terminal requirement is scoped to the retained case
  file's recorded frames; it does not prove that no later response could arrive after the
  recorded window, consistent with the note's finite-window limit. The note's own limit applies:
  a throw before `preventDefault()` is a different, untested fixture and must not be generalized
  from this row.
- Open items: the final expectations schema/path is BuildOracle's; this report supplies only
  the independent `na-throw` row, mutation and finding mapping. The exact error literal is
  pinned to Chromium `154.0.8037.97`; a later pinned build requires deliberate re-authoring,
  never recomputation from the evaluated receipt. No tests were run.
