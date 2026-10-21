# Raw06 — finite semantic oracle for `na-remove`

Scout seat, read-only. Inputs read from the retained round-21 acquisition; no file was modified,
no build/test/lint/browser/network run was performed, no REA or service was used.

## Inputs read (exact paths and digests)

| Path | sha256 | Note |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-remove.json` | `e7e32f5f202a7d34262f143217bf4d370b89e1497493655259a9ecc0c6339e69` | equals receipt row `evidence.sha256` and `.ufo/waves/round-21/runtime-execution-finalized.json` `.artifacts["corpus/evidence/round-21/runtime/na-remove.json"]` |
| `corpus/evidence/round-21/runtime/na-remove.html` | `af61bae3898d84fd4e77825b3a40237337adc0726839eac4292ee5488d1af90f` (1079 bytes) | equals evidence `.fixture.sha256`; contains the nonce; has no `toolautosubmit` attribute |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | equals `runtime-execution-finalized.json` `.receiptSha256` |
| `scripts/webmcp-lifecycle-round21.mjs` | producer, receipt sha `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | action/probe semantics at lines 105–125, 189, 217 |
| `.ufo/waves/round-21/measure-c1.mjs` | old structural counter | line 139 is its only outcome-adjacent check (receipt summary vs raw) |
| `.ufo/waves/round-21/selftest-c1.mjs` | old counter selftest | `response-payload-mismatch` at line 176 mutates one side only |

Fixture logic (`na-remove.html`): form `#f` with `toolname="lifecycle"`, `action="/landing"`,
`method="get"`, one required `input[name=q]`, button `#go`; submit listener records an observation
and calls `respondWith`, with `mode="success"` resolving `{ok:true,nonce,q}`. The producer's
`remove` action is `document.querySelector('#f').remove()` (`scripts/webmcp-lifecycle-round21.mjs:217`),
which dispatches no submit event, so the listener — and every `respondWith` call — is unreachable
on this path.

## 1. Observed case facts (S101 raw, not inferred)

Identity: `id "na-remove"`, `nonce 6278395f-f2f9-4082-8c53-1279cad1f220`, `autosubmit false`,
`action "remove"`, `mode "success"`, `schema "tabi-round21-case-v1"`. Main frame
`C5BA845E4E29A378CAAB9A832DC2D46D`, loader `B517731F23A89133CDCF877A38BA8BA9`, URL
`http://127.0.0.1:43143/na-remove`. One registered tool `lifecycle`
(`Dummy loopback lifecycle`, schema requires string `q`). One invocation
`622C2C1C9C93235581AB3F8C14A14EC5`, invoked with `{"q":"6278395f-f2f9-4082-8c53-1279cad1f220"}`;
`invokeError: null`.

Full frame trail (16 frames, `seq` contiguous, `at` non-decreasing):

| seq | at | dir | object | terminal |
|---|---|---|---|---|
| 1 | 1792590711782 | sent | `Page.enable` | — |
| 2 | 1792590711783 | result | command 1 | — |
| 3 | 1792590711789 | event | `Page.frameNavigated` → `http://127.0.0.1:43143/na-remove` | — |
| 4 | 1792590711796 | sent | `WebMCP.enable` | — |
| 5 | 1792590711797 | event | `WebMCP.toolsAdded` (one tool) | — |
| 6 | 1792590711798 | result | command 2 | — |
| 7 | 1792590711798 | sent | `Page.getFrameTree` | — |
| 8 | 1792590711798 | result | command 3 (frame id above) | — |
| 9 | 1792590711798 | sent | `WebMCP.invokeTool` command 4 | — |
| 10 | 1792590711798 | result | command 4 → `invocationId` | invocation accepted |
| 11 | 1792590711798 | event | `WebMCP.toolInvoked` same id/input | — |
| 12 | 1792590712051 | observation | `pre-action` | — |
| 13 | 1792590712051 | action | `remove`, `dispatch-started` | — |
| 14 | 1792590712052 | action-complete | `remove` | — |
| 15 | 1792590712052 | event | `WebMCP.toolResponded` `Canceled`, `errorText "Tool execution cancelled, since tool definition was updated"` | terminal |
| 16 | 1792590712554 | observation | `after-action` | — |

Receipt row summary (`receipt.json` `cases[id=na-remove]`): `preAction {start 1792590711798,
end 1792590712051, windowMs 253, responseCount 0, formActive true}`; `after {start 1792590712051,
end 1792590712554, windowMs 503, responses [the seq-15 object], submits [], navigations [],
pageState {nonce, submits [], errors [], url "http://127.0.0.1:43143/na-remove", secureContext true,
formExists false, formActive false, value null, focused ""}}`; `evidence {path, sha256}` as above.

Pre observation: same `nonce`, `submits []`, `errors []`, URL unchanged, `secureContext true`,
`formExists true`, `formActive true`, `value` = nonce, `focused "go"`.
Post observation: same `nonce`, `submits []`, `errors []`, URL unchanged, `secureContext true`,
`formExists false`, `formActive false`, `value null`, `focused ""` (probe is
`document.activeElement?.id ?? null`, so `""` is the body's empty id after the focused control was
removed).

Navigation/requests: exactly one `Page.frameNavigated` (seq 3, pre-invocation); none after the
action; receipt `navigations []`. Receipt `requests` contains exactly one `GET /na-remove`
(at 1792590711786) and **zero** `/landing` requests (no submit occurred).

Cleanup: evidence `contextClosed true`, `closeError null`, `browserPidsBefore` 9 positive ints,
`browserPidsAfter []`, `browserPidsAtClose` the same 9 pids, `browserPidsSeenAfterClose []`,
`processIdentitiesAtLaunch`/`processIdentities` 9 pid+startTicks entries, `blocked []`,
`downloads []`; receipt `cleanup {browserClosed true, serverClosed true}`, no error fields.

## 2. Finite semantic oracle for `na-remove`

Independently authored from the fixture and the recorded row, not recomputed from the evaluated
receipt. `<nonce>` substitutes the row nonce; every other string is a fixed literal. Outcome class
is `canceled` (contract: reset/remove).

```json
{
  "id": "na-remove",
  "autosubmit": false,
  "action": "remove",
  "mode": "success",
  "class": "canceled",
  "expected": {
    "status": "Canceled",
    "output": { "present": false },
    "error": {
      "present": true,
      "errorText": "Tool execution cancelled, since tool definition was updated"
    },
    "invocation": {
      "toolName": "lifecycle",
      "input": { "q": "<nonce>" },
      "invokeError": null,
      "answeredBy": "result"
    },
    "pre": {
      "nonce": "<nonce>",
      "submits": 0, "errors": 0,
      "url": "http://127.0.0.1:43143/na-remove",
      "secureContext": true,
      "formExists": true, "formActive": true,
      "value": "<nonce>", "focused": "go",
      "responses": 0
    },
    "post": {
      "nonce": "<nonce>",
      "submits": 0, "errors": 0,
      "url": "http://127.0.0.1:43143/na-remove",
      "secureContext": true,
      "formExists": false, "formActive": false,
      "value": null, "focused": ""
    },
    "windows": {
      "preActionMsMin": 250, "afterMsMin": 500,
      "responsesInPre": 0, "responsesInAfter": 1
    },
    "navigation": {
      "initialNavigations": 1, "postActionNavigations": 0,
      "landingRequests": 0, "urlUnchanged": true
    },
    "cleanup": {
      "contextClosed": true, "closeErrorFalsy": true,
      "browserPidsAfterEmpty": true, "browserPidsSeenAfterCloseEmpty": true,
      "browserPidsAtCloseSameSet": true, "blockedEmpty": true,
      "downloadsEmpty": true, "serverClosed": true
    }
  }
}
```

### 2.1 Invocation / input shape

- Exactly one `dir:"sent"`, `method:"WebMCP.invokeTool"` frame; `params.toolName === "lifecycle"`;
  `params.frameId` equals the `Page.getFrameTree` frame id and the `toolsAdded` tool `frameId`;
  `params.input` deep-equals `{q:"<nonce>"}` — exactly one own key, value byte-equal to the nonce.
- The command is answered by exactly one `dir:"result"` frame for the same command id carrying a
  non-empty `invocationId`; no `dir:"error"` frame for that command; `invokeError === null`.
- Exactly one `WebMCP.toolInvoked` for the same `invocationId`, with `toolName`/`frameId` equal to
  the sent frame and the parsed `params.input` string deep-equal to the sent input object.
- Exactly one `WebMCP.toolsAdded` registration exposing `lifecycle`; no second tool.

### 2.2 Pre/action/post sequence and finite windows (`semantic_timing`)

- `sent(invokeTool).seq < result(answered).seq < toolInvoked.seq < pre.seq`; `sent.at <= pre.at`.
- `pre.windowMs === pre.end - pre.start >= 250`; `pre.end === pre.at`; zero `toolResponded` frames
  with `seq < pre.seq` (`preAction.responseCount === 0`), so the invocation is genuinely pending in
  the pre window.
- Exactly one `dir:"action"` frame with `action:"remove"` and `phase:"dispatch-started"`, and
  exactly one `dir:"action-complete"` with `action:"remove"`; `action.seq < complete.seq`,
  `action.at <= complete.at`.
- Exactly one `WebMCP.toolResponded` for the invocation id in the whole file (no second terminal,
  no post-window terminal): `action.seq < responded.seq < post.seq`, `action.at <= responded.at <=
  post.at`, `responded.at` inside `[after.start, after.end]`.
- `after.start <= action.at`; `after.end === post.at`; `after.windowMs === after.end -
  after.start >= 500`; exactly one in-window response and it is that frame
  (`after.responses` list membership alone is not sufficient because the producer records
  `responses(post.seq)`, not a lower-bounded window).
- One pre-action and one after-action observation marker; each equals the corresponding
  `pageObservations` entry in `seq`, `at`, and value; `pre.seq < action.seq`,
  `complete.seq < post.seq`.
- Observed but not asserted as cross-case semantics: the response arrives after `action-complete`
  (seq 15 > 14). `na-click` has the Completed response before its `action-complete` and
  `na-requestsubmit` has it after, so this distance is producer/CDP timing, not a causal invariant;
  the asserted causal bound is dispatch < terminal < post marker.

### 2.3 Exact status / output / error (`semantic_status`, `semantic_output`, `semantic_error`)

- `status === "Canceled"`, exactly (case-sensitive). `Completed`, `Error`, or any other string is a
  failure; the old count's silence about this literal is the gap this row closes.
- `Object.hasOwn(params, "output") === false`. `output: null`, `output: {}`, or any output object
  fails. A Completed output is also contradicted by `post.submits.length === 0`: the submit
  listener pushes its observation *before* any `respondWith`, so an empty submits list proves the
  handler — the only `respondWith` callsite — never ran on this path.
- `errorText` byte-equal to `Tool execution cancelled, since tool definition was updated`. The
  reset diagnostic `Tool execution cancelled by a form reset` (retained in
  `corpus/evidence/round-21/runtime/na-reset.json`) MUST fail this row: the text encodes which DOM
  mutation caused cancellation, and this row is removal, not reset.
- Response payload own keys are exactly the observed `{invocationId, status, errorText}`; an extra
  payload key is a shape failure, not a tolerable extension.
- `after.responses` in the receipt is exactly one element deep-equal to the raw terminal params;
  `after.submits === []`; `after.navigations === []`; `after.pageState` deep-equals the post
  observation value; `preAction.formActive === true`.

### 2.4 Page-state limits

- Pre: exact literals in the fragment above. `value === nonce` is the agent-input echo, `focused
  "go"` is the fixture's submit control holding focus, `formActive true` is the active tool-form
  marker, `formExists true`.
- Post: `formExists false` and `formActive false` (the removal took effect), `value null` (the
  named input no longer exists), `focused ""` (focus fell to the body), `submits []`, `errors []`,
  `nonce` unchanged, URL unchanged, `secureContext true`.
- `value:null`/`focused:""` are probe-pinned (`scripts/webmcp-lifecycle-round21.mjs:189`); the
  semantic requirement is "form and named input absent; focus no longer on a form control". A
  reauthored probe literal requires reauthoring the expectation, not relaxing the form-absence
  check.

### 2.5 Navigation and request boundary (`semantic_navigation`)

- Exactly one `Page.frameNavigated` in the evidence, URL exactly `http://127.0.0.1:43143/na-remove`,
  before the invocation; zero navigations at/after `after.start`; `after.navigations === []`.
- Receipt requests: exactly one `GET /na-remove`; zero requests whose path is `/landing` or any
  other path; no navigation-carried output is admissible for a Canceled row.

### 2.6 Cleanup limits (`evidence_binding`, `case_set`)

- Evidence `contextClosed === true`; `closeError` absent/null; `browserPidsBefore` non-empty
  positive integers; `browserPidsAfter === []`; `browserPidsSeenAfterClose === []`;
  `browserPidsAtClose` is the same pid set as `browserPidsBefore`; every pid in
  `browserPidsBefore` appears in `processIdentitiesAtLaunch` with a non-empty `startTicks`, and
  `processIdentities` matches that set (pid values are environment-specific and MUST NOT be
  asserted as literals).
- `blocked === []` and `downloads === []`; receipt `cleanup.browserClosed === true` and
  `cleanup.serverClosed === true`; no `contextError`/`serverError`/`tempError`.
- Identity/binding: `id`, `nonce`, `autosubmit:false`, `action:"remove"`, `mode:"success"`,
  `fixture.path`/`fixture.sha256` (above), evidence `sha256` (above), receipt `sha256` (above),
  producer path/digest (receipt) unchanged; the round-22 acquisition binding must carry these
  digests. The expectation row carries no reference to, or import of, the old counter.

## 3. One coherent semantic mutation the old structural count admits

**Mutation (status/output swap, all links resealed):** in `na-remove.json` replace the seq-15
terminal params with

```json
{"invocationId":"622C2C1C9C93235581AB3F8C14A14EC5","status":"Completed",
 "output":{"ok":true,"nonce":"6278395f-f2f9-4082-8c53-1279cad1f220","q":"6278395f-f2f9-4082-8c53-1279cad1f220"}}
```

(drop `errorText`), put the identical object in `receipt.json`
`cases[id=na-remove].after.responses`, and leave the fixture, pre/post page state
(`formExists false`, `formActive false`, `value null`, `focused ""`, `submits []`), windows, and
action frames untouched. Reseal every digest link that would otherwise go stale:
`receipt.cases[na-remove].evidence.sha256` = new evidence sha; `runtime-execution-finalized.json`
`.artifacts["corpus/evidence/round-21/runtime/na-remove.json"]` = new evidence sha and
`.receiptSha256` = new receipt sha (and, for round-22, the corresponding acquisition-binding
entries). In the private test clone only; never in lane production or lane VCS.

Why the old structural count admits it: `measure-c1.mjs` contains no `Canceled`/`Completed`/`Error`
literal (grep: zero matches). Its only outcome-adjacent check is `summary_mismatch` at line 139,
which merely requires `receipt.after.responses` to equal the raw `toolResponded` params, plus
digest equality. Because both sides are mutated identically and every digest is resealed, no
finding fires and the count stays 12/clean/exit 0. The old selftest does not cover this: its
`response-payload-mismatch` case (`selftest-c1.mjs:176`) deliberately makes receipt and raw
disagree, so it tests summary equality, not outcome semantics. The mutated row is the
"all-silent synthetic case" family: structurally sealed but semantically impossible — a Completed
terminal with zero submits and a removed form, where the only `respondWith` callsite is the submit
handler that provably never ran.

Why the new oracle rejects it: `semantic_status` (`"Completed" !== "Canceled"`), `semantic_output`
(output present on a Canceled row; additionally no submit/`respondWith` evidence can support any
output), and `semantic_error` (required removal-specific `errorText` absent) all fire; value stays
below 12 and the run is `failed`/exit 1.

**Cheaper variant, same family:** keep `status:"Canceled"` and only replace `errorText` with the
reset text `Tool execution cancelled by a form reset` in raw and summary, resealing the same links.
The old count still reports 12/clean; the new oracle fails `semantic_error` alone. Both variants
keep the evaluated receipt's own values untouched as expectations — the fixed row above is what
judges them.

## 4. Limits and unresolved gaps

- `errorText`, `focused:""`, and `value:null` are pinned to Chromium `154.0.8037.97` and the
  recorded probe; a build or probe change requires explicit reauthoring of these literals, not a
  relaxed comparison.
- This row is one build, one private loopback fixture, one generated nonce, finite windows of 253 ms
  (pre) and 503 ms (after). A missing or late terminal is not an eventual-settlement guarantee, and
  no general cancellation claim is made for arbitrary DOM edits (round-21 note limitation).
- `after.responses` is not lower-bounded by the producer (`responses(post.seq)`); the oracle must
  count terminals by `seq` within the finite window. For `na-remove` the sole terminal happens to be
  in-window, but a mutation that moves it before the action must still fail `semantic_timing`.
- The response's position relative to `action-complete` is observed (after) but not normative
  across cases (`na-click` precedes, `na-requestsubmit` follows); it must not be asserted as
  semantics.
- `corpus/evidence/round-22/semantic-expectations.json` and round-22 `measure-c1.mjs` did not exist
  when this report was written; the fragment above is an independent specification for BuildOracle,
  not a read-back of that file. Pid literal values were not asserted and no checks beyond the ones
  listed were invented.

Report: .ufo/waves/round-22/w1/Raw06.md
