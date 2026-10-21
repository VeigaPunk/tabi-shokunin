# Raw07 — na-reject finite semantic oracle (round 22, W1)

Scope: leaf scout for `na-reject` only. I read retained round-21 acquisition; no browser run,
no network, no REA, no installs, no production edits. Only this report was written.
Old structural counter (`.ufo/waves/round-21/measure-c1.mjs`) is treated as frozen input context,
not as an outcome oracle; nothing below imports or recomputes through it.

## 1. Files inspected and observed hashes

| Path | Role | Observed |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-reject.json` | campaign evidence (16 CDP frames, 2 page observations) | `sha256 a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741` [OBSERVED: `sha256sum`] |
| `corpus/evidence/round-21/runtime/na-reject.html` | fixture, mode constant `"reject"` | `sha256 eb23b95526f9cea2dbf73b58e0b5f36b596d61fd361d8e41a1bf30fb6eb7f658` [OBSERVED] |
| `corpus/evidence/round-21/runtime/receipt.json` | receipt, 13 cases rows, `schema tabi-round21-runtime-v1` | reject row + digest cross-links read [OBSERVED] |
| `scripts/webmcp-lifecycle-round21.mjs` | producer claim | `sha256 bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` [OBSERVED] |

Evidence-internal fixture hash, receipt `evidence.sha256`, and the on-disk hashes agree
[OBSERVED]. `na-reject.json` `fixture.sha256 == eb23b955…f658` and receipt
`cases[na-reject].evidence.sha256 == a57b41bd…f741` [OBSERVED]. This report makes no new
producer claim: producer identity stays the acquisition's
`scripts/webmcp-lifecycle-round21.mjs` / `bc11e4d6…a811`; environment stays the pinned
Chromium `154.0.8037.97` / Node `v24.21.0` / Playwright `1.64.0` row.

## 2. Observed case facts (what the oracle must decide about)

From `receipt.json` `cases[]` row `na-reject` and `na-reject.json` [OBSERVED, exact]:

- Identity: `nonce 8e99a921-6728-42cd-82ed-30cd46cf238f`, `autosubmit false`,
  `action "requestSubmit"`, evidence `mode "reject"`, `invocationId DAB4A9A79B522E21D49C7D2737F56E7E`,
  `invokeError null`.
- Fixture source: form `toolname="lifecycle"`, `action="/landing"` `method="get"`,
  required input `q`; handler does `preventDefault()` then
  `e.respondWith(Promise.reject(Error('dummy rejection')))` for mode `reject`.
- Frame order and times [OBSERVED]:
  - seq 3 `Page.frameNavigated` → `http://127.0.0.1:43143/na-reject`, type `Navigation`, frame
    `3140D12E704C21B5F8ED48E670F10946` (only navigation frame in the file).
  - seq 9 `WebMCP.invokeTool` sent, `toolName "lifecycle"`, frameId above,
    `input {"q":"8e99a921-6728-42cd-82ed-30cd46cf238f"}`; seq 10 result
    `{"invocationId":"DAB4A9A79B522E21D49C7D2737F56E7E"}`; seq 11 `WebMCP.toolInvoked` with the
    same id and `input` JSON equal to the sent input.
  - seq 12 pre-action observation (`at 1792590712985`), seq 13 action
    `requestSubmit`/`dispatch-started`, seq 14 `action-complete`, seq 15
    `WebMCP.toolResponded {status:"Error", errorText:"respondWith promise was rejected"}`,
    seq 16 after-action observation (`at 1792590713487`).
  - Receipt windows: `preAction {start 1792590712732, end 1792590712985, windowMs 253,
    responseCount 0, formActive true}`; `after {start 1792590712985, end 1792590713487,
    windowMs 502}` with exactly one response (the seq-15 payload).
  - The invokeTool `result` frame has no `message`/`error` key; the toolResponded Error payload
    has **no `output` key** and exactly the `errorText` above.
- Page state, pre `[OBSERVED]`: `submits []`, `errors []`, `url http://127.0.0.1:43143/na-reject`,
  `secureContext true`, `formExists true`, `formActive true`, `value <nonce>`, `focused "go"`.
- Page state, post `[OBSERVED]`: one submit record
  `{agentInvoked true, isTrusted true, q <nonce>, active true, respondWith "function"}`,
  `errors ["Uncaught Error: dummy rejection"]`, same URL as pre, `secureContext true`,
  `formExists true`, `formActive false`, `value <nonce>`, `focused "go"`.
- Receipt navigation list is `[]`; evidence has no second `Page.frameNavigated`; the only
  `/landing` request in the receipt is `at 1792590710188` (`/landing?q=8a5839ad-…`) and belongs
  to the `na-native-submit` window, not to reject [OBSERVED]. No request is recorded inside
  `[1792590712985, 1792590713487)`.
- Cleanup `[OBSERVED]`: `contextClosed true`, no `closeError`, `browserPidsBefore` 9 positive
  ints, `browserPidsAfter []`, `browserPidsSeenAfterClose []`, `processIdentities` 9 entries with
  start ticks, `blocked []`, `downloads []`; receipt `cleanup {browserClosed true,
  serverClosed true}`.

`na-throw.json` [OBSERVED] is the contrast case: same status `Error` but `errorText`
`"The site has a programming error: it called preventDefault() on the 'submit' event, without
also calling respondWith() with the tool result"`, and page errors
`["Uncaught Error: dummy submit handler throw"]`. `na-reject` is the only row whose protocol
diagnostic is the rejection of a `respondWith` promise.

## 3. Finite semantic oracle for `na-reject`

Authored independently from the fixture and the lifecycle contract, not recomputed from the
evaluated receipt. `status` derives from the declared mode table (`reject → Error`); the literal
`errorText` is a fixed expectation for the pinned Chromium build and would require an explicit
re-author if the pinned build changes. The expectation row carries no reference to the old count.

Proposed expectations fragment (`corpus/evidence/round-22/semantic-expectations.json`, owner:
BuildOracle; this is an independent specification, not the final file):

```json
{
  "id": "na-reject",
  "autosubmit": false,
  "action": "requestSubmit",
  "mode": "reject",
  "expected": {
    "status": "Error",
    "output": { "present": false },
    "error": {
      "present": true,
      "errorText": "respondWith promise was rejected",
      "pageErrors": ["Uncaught Error: dummy rejection"]
    },
    "invocation": {
      "toolName": "lifecycle",
      "input": { "q": "<nonce>" },
      "invokeError": null
    },
    "pre": {
      "submits": 0, "errors": 0, "formActive": true,
      "formExists": true, "secureContext": true, "focused": "go"
    },
    "post": {
      "submits": 1,
      "submit": {
        "agentInvoked": true, "isTrusted": true, "active": true,
        "respondWith": "function", "q": "<nonce>"
      },
      "formActive": false, "formExists": true, "secureContext": true,
      "focused": "go", "value": "<nonce>"
    },
    "windows": { "preActionMsMin": 250, "afterMsMin": 500, "responses": 1 },
    "navigation": { "navigated": false, "landingRequests": 0, "urlUnchanged": true },
    "cleanup": {
      "contextClosed": true, "browserPidsAfterEmpty": true,
      "browserPidsSeenAfterCloseEmpty": true, "blockedEmpty": true,
      "downloadsEmpty": true, "serverClosed": true
    }
  }
}
```

`<nonce>` is substituted from the case identity at evaluation time; everything else is a literal.
Mapping to the contract's stable finding ids:

### semantic_status
- Exactly one `WebMCP.toolResponded` frame exists for `invocationId DAB4A9A79B522E21D49C7D2737F56E7E`
  in the whole evidence file (not merely before the post observation).
- `status === "Error"` and equals the mode table entry for `reject`; `invokeError == null`; the
  `WebMCP.invokeTool` result frame carries `invocationId` and no `message`/`error`.
- The response count inside the finite after window is exactly 1, and it is that frame.

### semantic_output
- The Error payload MUST NOT own an `output` key (`Object.hasOwn(params,"output") === false`).
  An empty object/array/null `output`, or any payload object, fails. This distinguishes a real
  Error terminal from a Completed-shaped summary with the status string edited.

### semantic_error
- `errorText === "respondWith promise was rejected"` byte-for-byte (the reject diagnostic; the
  throw diagnostic is a different string and MUST fail here).
- Page `errors` length 1 and `errors[0] === "Uncaught Error: dummy rejection"` (the rejection
  reason surfaced once; a missing entry, duplicated entry, or the throw text fails).
- Status/output/error are mutually exclusive: Error implies `errorText` present and no `output`;
  the Completed reading of this row fails even when all digests are coherent.
- `semantic_delayed` is not applicable to this row: no delayed-release evidence may be used to
  justify the terminal (the fixture has no `window.release` call on the reject path); the reject
  terminal must not be inferred from a delayed case.

### semantic_timing
- Invariants: `sent.seq < pre.seq <= action.seq < complete.seq <= responded.seq < post.seq`;
  `sent.at <= pre.at`; responded frame `at` lies in `[action.at, post.at]` inclusive.
- `pre.windowMs >= 250` and `pre.windowMs === pre.end - pre.start`; `after.windowMs >= 500` and
  `after.windowMs === after.end - after.start`; `after.start === action.at`; `pre.end === pre.at`;
  `after.end === post.at`; `after.start <= responded.at`.
- No second terminal event and no post-window terminal are admissible: the single finite window
  must contain the whole Error terminal. No retry/backstop claim is made.

### semantic_navigation
- Exactly one `Page.frameNavigated` in the evidence, URL path `/na-reject`, and it precedes the
  invocation; no navigation occurs after the action.
- Post URL is byte-equal to pre URL (origin + path `/na-reject`); `secureContext === true`.
- No receipt request in `[after.start, after.end)` has a URL whose path is `/landing`; the
  `action="/landing"` fixture form must not be reached (the rejection suppresses submission).
  Corroborating observation only: the retained window records zero requests, but the normative
  assertion is the navigation/landing boundary.

### pre/action/post sequence
- Exactly one each of `dir:"action"` and `dir:"action-complete"`, both `action:"requestSubmit"`;
  action phase `dispatch-started`; exactly one pre-action and one after-action observation
  marker, and each equals the corresponding `pageObservations` entry in seq, `at`, and value.
- Pre `pageState` exactly matches the observed pre state above (empty submits/errors, active form,
  nonce value, focus `go`); post `pageState` exactly matches the observed post state, including
  the single submit record and `formActive false` (tool-form-active cleared after terminal), and
  errors exactly the one rejection message.
- Page `submits[0].q === nonce` and `value === nonce`; `agentInvoked true` and `isTrusted true`
  bind an agent-invoked, trusted, `<form>`-mediated submit rather than a synthetic DOM call.

### evidence_binding / case_set / source_binding / input_shape / revision_input
- `evidence.sha256 === a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741`; fixture
  `sha256 === eb23b95526f9cea2dbf73b58e0b5f36b596d61fd361d8e41a1bf30fb6eb7f658`; receipt producer
  is `scripts/webmcp-lifecycle-round21.mjs` with `bc11e4d6…a811`; acquisition execution artifact
  digests recomputed from the blobs; note provenance first line still begins `source:` and
  associates S101 with `corpus/evidence/round-21/runtime/receipt.json` (canonical note source
  first line, no new producer claim).
- Case set remains the fixed 12 ids with `na-reject` exactly once; the fixture blob's mode
  constant is `"reject"` and evidence `mode === "reject"` (this is the binding the old count
  never made; fixture text is hashed so it cannot be mutated without a digest finding).
- Inputs are the Git blobs read through full 40-hex revision with `GIT_NO_REPLACE_OBJECTS=1`
  and isolated Git config; missing new expectations and note ⇒ baseline 0 (exit 0), partial
  missing ⇒ failed 0 (exit 1), could-not-evaluate ⇒ exit 2.

## 4. One coherent semantic mutation the old structural count admits

**Mutation:** swap the `toolResponded.errorText` strings of `na-reject` and `na-throw`
(both remain `status:"Error"`), mirror the swap in the two `receipt.cases[].after.responses`
entries, then update the digest chain coherently: recompute the two evidence file hashes, rewrite
their `cases[].evidence.sha256`, recompute receipt hash, rewrite the corresponding
`artifacts[]` digests and `receiptSha256` in `.ufo/waves/round-21/runtime-execution-finalized.json`.

Why the old structural count admits it: `.ufo/waves/round-21/measure-c1.mjs` checks only
(a) `event_identity` — presence/order/payload-of-input of `toolInvoked` and `toolResponded` for the
invocation, (b) `summary_mismatch` — `after.responses` deep-equals the toolResponded params,
`after.pageState` deep-equals the post observation, and (c) `evidence_digest` / `execution_binding`
— hashes that the mutation recomputes. It never compares `status`, `errorText`, `output`, or page
`errors` against the declared `mode`, and never requires an Error payload to lack `output`.
`case_identity` only pins `mode === "reject"`, which this mutation leaves intact. The page
`errors` entry (`Uncaught Error: dummy rejection`) is legitimate for reject, so the mutated pair
stays internally consistent; expected structural result is value 12 / exit 0 — i.e. the swap is
silent under the old counter, exactly the all-silent synthetic-case class the round-22 measure
must reject.

Expected under the new oracle: `na-reject` fails `semantic_error` (errorText no longer equals the
reject diagnostic; it now carries the throw diagnostic), and `na-throw` fails the symmetric check.
A second, coarser variant the old count also admits: change reject's status to `Completed` with
`output {ok:true,nonce,q}` and clear its `errorText`/page `errors`, mirroring the summary and
recomputing digests. That one flips the entire lifecycle outcome while structural checks still
pass; the new `semantic_status`/`semantic_output`/`semantic_error` assertions reject it.

## 5. Confidence and open items

- [OBSERVED] every literal value in §2 comes from the retained files; hashes verified with
  `sha256sum`. [INFERENCE] the normative reading that `respondWith` rejection must suppress the
  `/landing` navigation and clear tool-form-active is drawn from the fixture's own measured
  post-state; it is not a new producer claim and adds no branch-coverage credit.
- Unresolved: the final expectations file path/schema is BuildOracle's; this report supplies the
  independent `na-reject` row and finding mapping only. The exact `errorText` is pinned to
  Chromium `154.0.8037.97`; a later pinned build would require deliberate re-authoring of the
  literal, never recomputation from the receipt being evaluated.
