# Raw05 — na-reset finite semantic oracle

Seat: TabiR22.Raw05 (read-only). Scope: independently specify the finite semantic
oracle for the retained `na-reset` case and name one coherent semantic mutation that
the round-21 structural count admits. No tests, builds, or mutations were run; this
seat wrote only this report.

Baseline revision verified present: `5f585773258b33d2d514b00cd0b0775333578db6`.
All working-tree bytes below equal their baseline blob bytes (checked with
`git cat-file blob` + sha256).

## Evidence read (observed)

| Path | Baseline blob | sha256 |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-reset.json` | `6dd1f24e4e291627af1e495c59479225c277dff6` | `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4` |
| `corpus/evidence/round-21/runtime/na-reset.html` | `588085a55f06b2740a8ed94becabb685b4e04cf3` | `67eca08e1d1539e59416d836e655d6a8db1a8b26f2c04c6c86d3a8a70df1af55` |
| `corpus/evidence/round-21/runtime/receipt.json` | `59912421a0051187990f9e4ceab4473aba44b01d` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `scripts/webmcp-lifecycle-round21.mjs` | `e25b5f07de39e71c477905926ee07eb4fb2939a3` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |

Supporting reads: receipt case row `na-reset` at `receipt.json:252-295` (cleanup at
`:681-684`); evidence frames 1-16 and `pageObservations`; fixture HTML; producer
action/observation code at `scripts/webmcp-lifecycle-round21.mjs:195-227`; claim row
`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:36`.

Round-22 files observed absent: `.ufo/waves/round-22/measure-c1.mjs`,
`corpus/evidence/round-22/semantic-expectations.json`, and the round-22 note. The
only round-22 wave files present are W1 records under `.ufo/waves/round-22/w1/`.

## Observed facts for na-reset

Identity: `id=na-reset`, `nonce=658f0668-98cc-4edb-89c2-a170fec93f00`,
`autosubmit=false`, `action=reset`, `mode=success` (`receipt.json:253-256`;
`na-reset.json:2-6`). Fixture is the served `na-reset.html` (sha above) containing the
same nonce, `<form id="f" toolname="lifecycle" action="/landing" method="get">`, one
required input `name=q`, button `#go`, and a submit listener that records into
`window.observations`, calls `preventDefault()`, and resolves `respondWith` with
`{ok:true,nonce,q}` when a submit ever fires. Reset fires no submit.

Invocation: exactly one `WebMCP.invokeTool` command (seq 9, cmd 4,
`frameId=1C4D44941BDA8A86E77A69CE02D4A325`, `toolName=lifecycle`,
`input={"q":"658f…f00"}`), answered by a `result` (seq 10) with
`invocationId=B8BA3C97850919D25D5C04338D497F26`; one matching `WebMCP.toolInvoked`
(seq 11) with identical toolName/frameId and JSON input.

Timeline (`na-reset.json`, seq / at / kind):

| seq | at | frame |
|---|---|---|
| 8 | 1792590710864 | result `Page.getFrameTree` |
| 9 | 1792590710864 | sent `WebMCP.invokeTool` |
| 10 | 1792590710864 | result `invocationId=B8BA…F26` |
| 11 | 1792590710864 | event `WebMCP.toolInvoked` |
| 12 | 1792590711116 | observation `pre-action` |
| 13 | 1792590711116 | action `reset` / `dispatch-started` |
| 14 | 1792590711117 | action-complete `reset` |
| 15 | 1792590711117 | event `WebMCP.toolResponded` `Canceled` |
| 16 | 1792590711619 | observation `after-action` |

Response event params are exactly
`{invocationId:B8BA…F26, status:"Canceled", errorText:"Tool execution cancelled by a form reset"}`
— no `output` key, and no other matching `toolResponded` in the retained trail.

Page state (`pageObservations`, identical to the observation frames and to the receipt
`after.pageState`):

- pre: `nonce=658f…f00`, `submits=[]`, `errors=[]`,
  `url=http://127.0.0.1:43143/na-reset`, `secureContext=true`, `formExists=true`,
  `formActive=true`, `value=658f…f00`, `focused="go"`.
- post: same nonce/url/secureContext/formExists, `submits=[]`, `errors=[]`,
  `formActive=false`, `value=""`, `focused="go"`.

Receipt row: preAction `start=1792590710864`, `end=1792590711116`,
`windowMs=252`, `responseCount=0`, `formActive=true`; after
`start=1792590711116`, `end=1792590711619`, `windowMs=503`,
`responses=[{invocationId:B8BA…F26,status:"Canceled",errorText:"Tool execution cancelled by a form reset"}]`,
`submits=[]`, `navigations=[]`; evidence path/sha as above.

Cleanup: `browserPidsBefore` nonempty (9 pids 1808934…1809031),
`processIdentitiesAtLaunch` maps each to a `startTicks`, `browserPidsAtClose` is the
same 9, `browserPidsAfter=[]`, `browserPidsSeenAfterClose=[]`, `contextClosed=true`,
no `closeError`, `blocked=[]`, `downloads=[]`; receipt
`cleanup={browserClosed:true,serverClosed:true}` with no error fields.

## Required semantic oracle (finite, case-scoped)

Expectation must be fixed data for `na-reset` (not derived from the case's
`after.responses`). Identity relations may reference `evidence.nonce`; outcome
literals must be constants.

1. **Invocation** — exactly one `WebMCP.invokeTool` sent; `toolName=="lifecycle"`;
   `frameId` equals the main frame in `Page.getFrameTree`; `input` deep-equals
   `{q: <case nonce>}`; its command is answered by a `result` with a non-empty string
   `invocationId` and no `error`; exactly one `WebMCP.toolInvoked` with that id, same
   toolName/frameId, and parsed input deep-equal to the sent input.
2. **Sequence** — result(invoke) seq < `toolInvoked` seq ≤ pre-action observation seq
   < action(`reset`,`dispatch-started`) seq < action-complete(`reset`) seq < post-action
   observation seq; exactly one action frame, one action-complete, one pre marker, one
   post marker, and no action frame for any other verb. The response must be after the
   action dispatch frame and before the post marker. (Observed: response after
   action-complete; event/ack interleaving makes `> action-complete` incidental, not a
   semantic necessity.)
3. **Status/output/error** — exactly one matching `WebMCP.toolResponded` in the whole
   retained trail, and it lies in the after window (seq < post marker, at ≥
   after.start). `status` must be the literal `"Canceled"`; `errorText` must be the
   literal `"Tool execution cancelled by a form reset"`; `output` must be absent;
   no `"Completed"`, no `"Error"`, no second response. A missing response is a failure,
   not silence-pass — the reset case is required to produce this exact cancellation.
4. **Page state** — pre `formActive===true` and `value===nonce`; post
   `formExists===true`, `formActive===false`, `value===""`, `submits===[]`,
   `errors===[]`, nonce unchanged, URL unchanged and path `/na-reset`
   (the port is acquisition-specific; do not freeze `43143` in a reusable fix),
   `secureContext===true`. `focused` was `"go"` pre and post but is incidental
   environment state; it must not carry semantic weight. Receipt `after.pageState`
   must equal the post observation value; `after.submits`/`after.navigations` must be
   `[]`.
5. **Finite timing** — preAction and after windows must be finite numbers;
   `preAction.windowMs == preAction.end - preAction.start` with `windowMs >= 250` and
   `preAction.end == pre.at`; `after.windowMs == after.end - after.start` with
   `windowMs >= 500` and `after.end == post.at`; `after.start >= pre.at` and
   `after.start <= action.at`; `preAction.responseCount == 0`; matching response `at`
   inside `[after.start, after.end)` and `>= action.at`. Observed 252/503 ms; do not
   pin those exact values as the semantic requirement. Absence after the post marker
   is outside the finite claim — "no response in the retained trail" is not "never".
6. **Navigation/network/boundary** — `after.navigations == []`; no
   `Page.frameNavigated` in the after window; URL unchanged; `blocked == []`,
   `downloads == []`; receipt request log contains the loopback `GET /na-reset`.
7. **Evidence binding** — receipt row path/sha equal the retained file
   (`097b88…`); fixture path/sha equal retained `na-reset.html` (`67eca0…`) and the
   fixture contains the case nonce; case nonce/action/autosubmit/mode match the fixed
   case set; invocationId is the row's id; producer sha is `bc11e4…`; execution
   `receiptSha256` is `4bc796…` and its artifact map binds the na-reset sha; baseline
   blob ids as listed above. Source/note binding per contract: new note first line
   `source: S101 — <receipt/raw paths>; S100 — <URL>`, and the na-reset error text is
   observation-only (S101), not a new S100 producer claim.
8. **Cleanup limits** — `browserPidsBefore` nonempty integer pids;
   `browserPidsAtClose` equals before; `browserPidsAfter==[]`;
   `browserPidsSeenAfterClose==[]`; `contextClosed===true`; no `closeError`;
   `blocked==[]`; `downloads==[]`; receipt `browserClosed===true`,
   `serverClosed===true`, no bound error fields. This is case-boundary cleanup
   evidence (run-owned tree observed gone at close), not a global no-leak guarantee.

Failure mapping: any mismatch above → `value:0`, `verdict:"failed"`, exit 1 under the
new metric. Missing expectation/note → baseline 0; partially missing expectation set →
failed 0; unusable revision/input → exit 2 could-not-evaluate. `na-reset` contributes
one of the twelve only when all of 1-8 hold; the old structural counter must not be
imported as the outcome oracle.

## Coherent semantic mutation the old structural count admits

**M1 — silent cancellation (all-silent synthetic case).** Edit
`corpus/evidence/round-21/runtime/na-reset.json`: delete frame seq 15
(`WebMCP.toolResponded`), renumber seq 16 to 15 (keep `at=1792590711619` and the
post-action value); in `receipt.json` set the na-reset `after.responses` to `[]`
(`preAction.responseCount` is already 0); update the row `evidence.sha256` and the
execution artifact-map entry to the new file sha. The page state, action frames,
windows and cleanup stay exactly as observed.

Why round-21 structural `evaluate` still returns 12/clean: it only requires one
answered invoke (`answered` result, unchanged), one `toolInvoked` (unchanged),
`events.some(seq <= invoked.seq)` (vacuously false with no events),
`after.responses` deep-equal to the matching events it itself collects (`[] == []`),
and marker/window consistency (post seq 15 > action-complete 14; `windowMs` still
`1792590711619-1792590711116=503>=500`). No structural finding reads `status`,
`errorText`, or `output` at all. The result is an `na-reset` row with no observed
outcome whatsoever — semantically indistinguishable from `na-pending` apart from
id/action fields — still counted as a checked lifecycle observation.

Corroborating variant (not the primary): keep one response but set
`status:"Completed"` with `output={ok:true,nonce,q}` and update `after.responses` to
the same object; the old count still passes (it copies event params into the summary
and never checks the outcome literal), even though reset cleared the value and dropped
`:tool-form-active`. Both variants must be rejected by oracle items 3 and 4.

## Observed vs inference vs unresolved

- Observed: all frame numbers, timestamps, literals, page fields, cleanup arrays, and
  hashes above come from the retained files at the baseline blobs.
- Inference (labeled): the `Canceled` outcome is caused by the dispatched
  `form.reset()` because the action frame is the only intervening action, no submit
  fired (`submits=[]`), and the error text names a form reset; the exact causal
  implementation path is not itself visible in this evidence.
- Unresolved: (a) the source location of reset-cancellation is outside S100's
  registered anchors, so no S100 citation is made; (b) why `focused` is `"go"` in
  both observations is not established by the fixture (no autofocus) and is treated
  as incidental; (c) a response absent from the retained trail is not proof it could
  never arrive — only the finite windows are claimed; (d) cleanup observations are
  bounded by process-tree scanning at close and do not exclude PID-reuse races;
  (e) no semantic result was executed here — this is a specification for the
  round-22 oracle, and L1 must run the single verification after integration.
