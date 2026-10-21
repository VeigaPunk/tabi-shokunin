# Raw10 — `na-invalid-submit`: finite semantic oracle specification

Read-only scout. No production edits, no tests, no browser, no installs. Baseline revision
`5f585773258b33d2d514b00cd0b0775333578db6` was verified to contain exactly the retained blobs below
(`git cat-file blob REV:<path> | sha256sum`). LSP device unavailable (`read xd://lsp` → "No such tool");
all path/line references here are literal reads, not semantic LSP proof.

Axes used: **A1 semantic outcome discrimination** (status/output/error vs. structural mirror),
**A2 evidence binding** (fixture/producer/raw/receipt digests and summary mirrors), **A3 finite-window
bounds** (250 ms pre / 500 ms post, sequence cutoffs), **A4 no-harm** (no rewrite of retained evidence,
no import of the frozen structural counter as an outcome oracle).

## 1. Observed evidence (round-21 actual acquisition, not new execution)

Paths relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

| Artifact | SHA-256 (observed) |
|---|---|
| `corpus/evidence/round-21/runtime/na-invalid-submit.html` | `53058248453754b0f6742a0cb38d07e1eba571546db208de43857130245e8148` |
| `corpus/evidence/round-21/runtime/na-invalid-submit.json` | `e7712c1b8568c3c814881ab89744e07eccbf48e78bde0ed84dcd05091795506f` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |

Case identity: `id=na-invalid-submit`, `nonce=5d25defa-672e-489d-a4cc-769ad5c9dc7f`,
`autosubmit=false`, `action=invalidRequestSubmit`, `mode=success`; receipt row evidence path/sha256
equals the raw case file digest above; fixture object path/sha256 equals the HTML digest above.

Fixture semantics (`na-invalid-submit.html`, observed source): declarative form
`toolname="lifecycle"`, `tooldescription="Dummy loopback lifecycle"`, **no** `toolautosubmit`,
`action="/landing" method="get"`; one `<input name="q" required>` with **no** `type="email"` (the
`mode==='invalid'` email attribute is absent because `mode=success`); submit handler records
`observations.submits.push({agentInvoked,isTrusted,q,active,respondWith})`, then `preventDefault()`,
then — because `mode==="success"` — `respondWith(Promise.resolve({ok:true,nonce,q}))`. The handler is
the only producer of a `respondWith`; it runs only on a real `submit` event.

Producer action (`scripts/webmcp-lifecycle-round21.mjs`, observed source): `invalidRequestSubmit` is
`page.evaluate(() => { document.querySelector('[name=q]').value = ''; document.querySelector('#f').requestSubmit(); })`.
The `value=''` write is **not** a recorded CDP/page-observation event; only its consequence appears in
the post observation. Request ordering: `invokeTool` sent → answered with `invocationId` →
`toolInvoked` → pre-action observation → dispatch action → action-complete → `toolResponded` →
post-action observation.

Exact raw trail (seq / dir / method-or-label / at):

| seq | dir | method/label | at |
|---|---|---|---|
| 9 | sent | `WebMCP.invokeTool` | 1792590715781 |
| 10 | result | command 4 | 1792590715781 |
| 11 | event | `WebMCP.toolInvoked` | 1792590715781 |
| 12 | observation | `pre-action` | 1792590716033 |
| 13 | action | `invalidRequestSubmit`, phase `dispatch-started` | 1792590716033 |
| 14 | action-complete | `invalidRequestSubmit` | 1792590716035 |
| 15 | event | `WebMCP.toolResponded` | 1792590716035 |
| 16 | observation | `after-action` | 1792590716537 |

Invocations: sent params `{frameId:"55003E37DC943976382EC05A7CFBE993", toolName:"lifecycle",
input:{q:"5d25defa-672e-489d-a4cc-769ad5c9dc7f"}}`; result `{invocationId:"38E3FB2410D1BD2D7DEA938A1688E885"}`;
`toolInvoked` same ID/tool/frame, `input` canonical JSON `{"q":"5d25defa-672e-489d-a4cc-769ad5c9dc7f"}`.
`invokeError=null`. No `WebMCP.toolCanceled` anywhere.

Pre-action value: `{nonce:<same>, submits:[], errors:[], url:"http://127.0.0.1:43143/na-invalid-submit",
secureContext:true, formExists:true, formActive:true, value:"5d25defa-672e-489d-a4cc-769ad5c9dc7f", focused:"go"}`.
Receipt `preAction={start:1792590715781,end:1792590716033,windowMs:252,responseCount:0,formActive:true}`;
`start` equals the invoke result `at`, `end` equals the pre marker `at`, `windowMs = end-start`.

Outcome (the whole point of the row): exactly one `WebMCP.toolResponded`, params keys exactly
`{errorText, invocationId, status}`; `status === "Error"`; **no `output` property**;
`errorText === "Form validation failed: q: Please fill out this field.. "` — final code units are
`0x2e 0x2e 0x20` (two periods then one space; the doubled period is not a typo in this report). Receipt
`after.responses` deep-equals this one params object.

Post-action value: `{nonce:<same>, submits:[], errors:[], url:<same>,
secureContext:true, formExists:true, formActive:false, value:"", focused:""}`. Receipt
`after={start:1792590716033,end:1792590716537,windowMs:504,responses:[<error>],submits:[],
navigations:[],pageState:<post value>}`; `start` equals the action `at`, `end` equals the post marker
`at`, `windowMs = end-start`. No `Page.frameNavigated` in the after window; `downloads=[]`, `blocked=[]`.

Cleanup recorded: `browserPidsBefore` 9 PIDs = `browserPidsAtClose`; `contextClosed:true`;
`browserPidsSeenAfterClose:[]`; `browserPidsAfter:[]`; 9 `processIdentities`/`processIdentitiesAtLaunch`
`{pid,startTicks}`; no `closeError`, no `forcedCleanup`; receipt `cleanup={browserClosed:true,
serverClosed:true}` only.

## 2. Finite semantic expectation for this row (fixed, not recomputed from the evaluated receipt)

Independent derivation: from section 1 raw bytes + fixture bytes + producer source only. The frozen
structural counter (` .ufo/waves/round-21/measure-c1.mjs`) is **not** an input to this expectation and
must not be imported as an outcome oracle.

```
case: na-invalid-submit
fixture: path + sha256 above            # binds the no-autosubmit, required-no-email fixture
producer: path + sha256 above           # binding only; no new producer claim
invocation:
  exactly one sent WebMCP.invokeTool, toolName "lifecycle", frameId from getFrameTree
  input deep-equals {q: nonce}          # agent fill uses the case nonce
  exactly one answering result/error, its invocationId non-empty string, invokeError null
  exactly one toolInvoked for that invocationId, same toolName/frameId, parsed input equals sent input
  order: sent.seq < answer.seq < toolInvoked.seq < pre-marker.seq
pre:
  exactly one observation label "pre-action"; receipt mirrors it (seq, at, value)
  value.nonce == nonce; value.submits == []; value.errors == []; value.secureContext == true
  value.formExists == true; value.formActive == true
  value.value == input.q == nonce       # pending tool form is filled and active
  preAction.responseCount == 0          # no correlated response in the 252 ms pre window
  preAction.formActive == true
  preAction.end == pre.at and preAction.windowMs == pre.end - pre.start and windowMs >= 250
action:
  exactly one action frame, action == "invalidRequestSubmit", phase == "dispatch-started"
  exactly one action-complete, same action, seq after action
  action.seq > pre-marker.seq; no "release" frame and no extra observation labels
post:
  exactly one observation label "after-action"; receipt mirrors it
  exactly one correlated toolResponded in the whole trail, seq > action-complete.seq and seq < post-marker.seq
  after.responses deep-equals [that event's params]; after.submits == []; after.navigations == []
  after.pageState deep-equals the post observation value
  after.end == post.at and after.windowMs == after.end - after.start and windowMs >= 500
outcome:
  status == "Error"
  output property ABSENT
  errorText == "Form validation failed: q: Please fill out this field.. "   # exact equality, no prefix/substring
  zero WebMCP.toolCanceled for this invocationId
page state:
  nonce unchanged; url unchanged (same document, no navigation frame ≥ after.start and < post.seq)
  formExists true; secureContext true; formActive false; value == ""; submits == [] (observed zero,
  not null/unavailable); errors == []
cleanup:
  contextClosed true; no closeError/forcedCleanup; browserPidsBefore nonempty and ⊇ browserPidsAtClose;
  browserPidsAfter == []; browserPidsSeenAfterClose == []; processIdentities nonempty {pid,startTicks};
  receipt cleanup browserClosed == true, serverClosed == true, no contextError/serverError/tempError
  blocked == []; downloads == []
```

Stable finding IDs this row must be able to emit (per contract): `semantic_status` (status literal),
`semantic_output` (output presence/absence), `semantic_error` (error text presence/exactness),
`semantic_timing` (window arithmetic/bounds/order), `semantic_navigation` (unexpected navigation/URL
change), `semantic_delayed` (unexpected release/delayed markers), `evidence_binding` (raw↔receipt mirror
and digests), `case_set`, `source_binding`, `input_shape`, `revision_input`. Exact mapping of each
predicate to a finding is the API owner's; the invariant demanded here is: any atomic mismatch in the
block above yields **no semantic credit for this row** (and, at minimum, `semantic_status` fires for
the mutation in §3).

Semantic reading this encodes, no more: the agent-filled required field was cleared in the page
context and `requestSubmit()` was then blocked by native submit-time constraint validation, so the
submit handler never ran and no `respondWith` result exists. The correlated outcome is an `Error`
with the browser's validation text; the same document survives with the tool form inactive. This is
**not** a claim about initial-fill refusal, about a human submit, or about a general validation-message
contract; the literal text is build-bound (Chromium 154.0.8037.97).

## 3. One coherent semantic mutation the old structural count admits

**M1 — outcome flip to `Completed` with a fabricated output.** Edit only the single response in
`corpus/evidence/round-21/runtime/na-invalid-submit.json` frame seq 15: remove `errorText`, set
`status:"Completed"`, add `output:{"ok":true,"nonce":"5d25defa-672e-489d-a4cc-769ad5c9dc7f","q":""}`.
Apply the identical params object to `receipt.json` case row `na-invalid-submit.after.responses`.
Leave fixture, page observations (`submits:[]`, `errors:[]`, `formActive:false`, `value:""`), nonces,
sequences, windows, cleanup and the note untouched. Refresh every digest link so the change is
coherent, not stale-hash noise:

1. `receipt.json` case row `evidence.sha256` := new raw-file SHA-256;
2. `.ufo/waves/round-21/runtime-execution-finalized.json` `artifacts["corpus/evidence/round-21/runtime/na-invalid-submit.json"]` := new raw SHA-256;
3. `artifacts["corpus/evidence/round-21/runtime/receipt.json"]` and `receiptSha256` := new receipt SHA-256.

Why the old structural count admits it (predicates from `.ufo/waves/round-21/measure-c1.mjs`
`evaluate`, all still satisfied): `raw_invoke`/`invoke_identity`/`event_identity` inspect only the
invoke input and invocationId; `order_mismatch` inspects marker/action/response seq ordering only;
`case_identity` requires `pre.value.value == input.q` (unchanged) and `post.value.nonce == nonce`
(unchanged), never the outcome; `window_mismatch` inspects the arithmetic only; `summary_mismatch`
requires the receipt array to mirror the raw events, which M1 does exactly; `cleanup`/`boundary`
are untouched; note/source probes are untouched. The old counter has **no** status, output, errorText
or canceled-event predicate — it treats `after.responses` as an opaque mirrored array — so it still
returns `exit 0`, `value 12`.

Why M1 is semantically false despite being digest-coherent: the fixture's only `respondWith` lives in
the submit handler, and the post observation records `submits: []`, i.e. no SubmitEvent fired in the
observed document. A `Completed` output (or any output at all) for this invocation is therefore
contradicted by the case's own page state. The new oracle must reject the row via `semantic_status`
(expected `Error`, observed `Completed`) and `semantic_output` (output present where absence is
required), with `semantic_error` also firing because the expected errorText is missing; the row must
yield no semantic credit (11 of 12, not 12), not merely a different finding label.

Same gap, second instance (corroboration, not a second named mutation): swapping the status to
`Canceled` with `errorText:"Tool execution cancelled by a form reset"` and no output is also admitted
by the old counter; its post page state (`value:""`, `formActive:false`) even resembles the retained
`na-reset` row, so page state alone cannot substitute for the exact status/error predicate.

## 4. Limits of this expectation (do not over-claim)

- **Served bytes not independently attested.** Fixture/response-body equality is bound by producer
  source (same `html` string is written to disk and routed) plus SHA-256 of the retained file; there is
  no HTTP-body digest in the case record. Fixture authenticity against a malicious author is not claimed.
- **Action internals not observed.** The `value=''` write and `requestSubmit()` call are producer-source
  facts; the raw trail records the action label, its ack, and the resulting page state only. The post
  `value:""` is written by the action itself, so it cannot by itself prove browser-clearing behavior;
  the discriminating facts are `submits:[]` + `Error` + native validation text.
- **Focus field is weak.** `focused` records only `document.activeElement?.id`; post `""` cannot
  distinguish "the id-less required input was focused by validation" from "body focused". Do not use it
  as a focus-placement oracle.
- **Timing is ms-resolution and revision-bound.** Action, action-complete and response share or nearly
  share timestamps (13/14 at :...16033/:...16035, 15 at :...16035); a response arriving before the
  action-complete ack is causally possible in another acquisition. Pin order by `seq`, not wall-clock
  latency; the exact `preAction.start == invoke-result.at` and `after.start == action.at` coincidences
  are observations here, not producer guarantees (use `start <= marker.at` as the durable form).
- **Finite windows are not pending/completion proofs.** A response absent before the pre marker or
  after the post marker proves only absence in that recorded interval; the 252 ms/504 ms durations are
  nominal producer sleeps bounded by the observation-marker cutoff.
- **Cleanup is sampled, not universal.** PID sets are checked at launch, pre-close and one post-close
  sample with `{pid,startTicks}` reuse guards; `serverClosed` is a boolean from `!server.listening`,
  not an independent port probe. No hostile-host, signal-exhaustion or profile-residue claim.
- **Expectation is conformance to these fixed bytes, not observation authenticity.** Anyone able to
  author a fully mirrored raw/receipt pair could satisfy the shape; only the digest/source binding and
  the separate semantic review limit that. Error message equality is exact and therefore will fail
  legitimately on punctuation/localization/build drift — that requires a new revision/expectation, not
  silent prefix matching.
- No real site, credentials, network, another browser build or new producer behavior is claimed; the
  frozen structural counter and all retained round-21 bytes remain unchanged by this report.

Verification performed: file reads, `sha256sum`, `git cat-file blob REV:<path> | sha256sum` at baseline
`5f58577…`, and JSON arithmetic/deep-equality inspection only. No tests, builds, linters, formatters,
browser, network probes or installs were run.

Report: .ufo/waves/round-22/w1/Raw10.md
