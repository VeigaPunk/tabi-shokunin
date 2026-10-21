# Raw01 — `na-pending` finite semantic oracle (independent scout)

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline revision read: `5f585773258b33d2d514b00cd0b0775333578db6`.
Posture: read-only inspection and static rule-walk. No execution, no test, no build, no
browser run, no installs, no writes outside this report.

## 1. Evidence actually inspected (observed)

| Path | Baseline Git blob | sha256 of bytes |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-pending.json` | `1250c731322c0f2759a4407450c4966c655ea3e3` | `f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e` |
| `corpus/evidence/round-21/runtime/na-pending.html` | `196642e35ea30eb9db878e2aded2f45a3e24ca65` | `f7c869270c8218f7351ad2be3143d8e7d6f2458e6505966d6c9b4bc747af60c6` |
| `corpus/evidence/round-21/runtime/receipt.json` | `59912421a0051187990f9e4ceab4473aba44b01d` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `e76b0d8590685d674a4333542c9b1dd7a403a199` | receiptSha256 field `4bc79636…`; artifacts map entry for `na-pending.json` = `f17fe86f…` |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `1941f766fcad495c669c800d0f16e20bd505dbbb` | line 32 is the `na-pending` row |
| `SKILL.md` | baseline tree | line 2372: “Filled non-autosubmit form, active pseudo-state — Record a finite no-response window, never an indefinite guarantee — na-pending” |

The baseline blob bytes hash to the same sha256 values as the working tree, so the
retained acquisition is revision-stable. Producer identity unchanged:
`scripts/webmcp-lifecycle-round21.mjs`, sha256
`bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`.

### 1.1 Fixture (`na-pending.html`, 16 lines, served loopback)

- Line 2: `<form id="f" toolname="lifecycle" tooldescription="Dummy loopback lifecycle" action="/landing" method="get">`
  — declarative tool named `lifecycle`, **no `toolautosubmit` attribute**.
- Line 3: `input name="q" required`; submit button `id="go"`.
- Lines 5–14: observations object seeded with the nonce; submit handler pushes a submit
  record and calls `e.preventDefault()`; `const mode="success"` selects
  `e.respondWith(Promise.resolve(value))` — but only inside a `submit` event, which this
  case never dispatches (`action:"none"`).
- `mode` is fixture configuration, **not** an observed outcome. The oracle must not infer
  `Completed` from `mode:"success"`.

### 1.2 Raw transcript (`na-pending.json`) — 15 frames, exactly as recorded

| seq | dir | content |
|---|---|---|
| 1–2 | sent/result | `Page.enable` (setup) |
| 3 | event | `Page.frameNavigated`, type `Navigation`, frame `27001C032351C5A5FEE40A6B9E99DE98`, URL `http://127.0.0.1:43143/na-pending` |
| 4–6 | sent/event/result | `WebMCP.enable`; `WebMCP.toolsAdded` with `{name:"lifecycle", frameId:"27001C03…", backendNodeId:2}`, **no `annotations`** |
| 7–8 | sent/result | `Page.getFrameTree` (frame id/URL repeated) |
| 9 | sent | `WebMCP.invokeTool` command 4: `{frameId:"27001C03…", toolName:"lifecycle", input:{q:"5956c381-7675-4fe7-a6b4-990d7cf866f9"}}` |
| 10 | result | command 4 → `{invocationId:"44555B4FCF76A7EE11B1E96ACA81851F"}` — acknowledgement only, **no status/output/error** |
| 11 | event | `WebMCP.toolInvoked` `{toolName:"lifecycle", frameId:"27001C03…", invocationId:"44555B4F…", input:"{\"q\":\"5956c381-…\"}"}` |
| 12 | observation | `pre-action` at `1792590707335`, value in §1.3 |
| 13 | action | `{action:"none", phase:"no-action"}` at `1792590707335` |
| 14 | action-complete | `{action:"none"}` at `1792590707335` |
| 15 | observation | `after-action` at `1792590707838`, value equal to seq 12; **last frame in transcript** |

There is **no `WebMCP.toolResponded` frame anywhere** for
`44555B4FCF76A7EE11B1E96ACA81851F` (or for any other invocation id). There is no
`dir:"error"` frame. Frame `at` values are non-decreasing; seq is contiguous 1–15.

### 1.3 Page state (both observations, and receipt `after.pageState`, identical)

```json
{"nonce":"5956c381-7675-4fe7-a6b4-990d7cf866f9","submits":[],"errors":[],
 "url":"http://127.0.0.1:43143/na-pending","secureContext":true,
 "formExists":true,"formActive":true,
 "value":"5956c381-7675-4fe7-a6b4-990d7cf866f9","focused":"go"}
```

### 1.4 Matching receipt row (`receipt.json` case at line 21)

```json
{"id":"na-pending","nonce":"5956c381-7675-4fe7-a6b4-990d7cf866f9",
 "autosubmit":false,"action":"none","invocationId":"44555B4FCF76A7EE11B1E96ACA81851F",
 "invokeError":null,
 "preAction":{"start":1792590707081,"end":1792590707335,"windowMs":254,
              "responseCount":0,"formActive":true},
 "after":{"start":1792590707335,"end":1792590707838,"windowMs":503,
          "responses":[],"submits":[],"navigations":[],
          "pageState":{…as §1.3…}},
 "evidence":{"path":"corpus/evidence/round-21/runtime/na-pending.json",
             "sha256":"f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e"}}
```

Receipt `requests` records exactly one request for this case: `GET /na-pending` at
`1792590707069`. `receipt.cleanup = {browserClosed:true, serverClosed:true}`.

### 1.5 Cleanup block in the raw case

- `contextClosed:true`, `closeError:null`, `blocked:[]`, `downloads:[]`.
- `browserPidsBefore` = `browserPidsAtClose` = 9 pids
  `[1808058,1808066,1808067,1808085,1808108,1808123,1808145,1808152,1808154]`.
- `browserPidsAfter:[]`, `browserPidsSeenAfterClose:[]`.
- `processIdentitiesAtLaunch` = `processIdentities` = the same 9 `{pid,startTicks}` pairs
  (`8969013`, `8969023`, `8969023`, `8969028`, `8969029`, `8969033`, `8969036`,
  `8969037`, `8969037`).

## 2. Actual semantics of `na-pending` (observed, not the fixture label)

The case is a **pending finite** observation, established only by: (a) an accepted
invocation (`invokeTool` result carries the invocation id; `toolInvoked` present for the
same id), (b) zero `toolResponded` for that id inside a terminated transcript whose end is
the `after-action` marker, (c) no page-state transition (no submit record, no error, no
navigation, form still `:tool-form-active`), (d) a completed close with no blocked
requests or downloads.

The retained note row (line 32) says the same thing in prose: “no matching response in
either recorded window; form active before and after”, with the S100:212-218 boundary that
this is **not an indefinite pending guarantee**. The note is the lane's own S101 record,
consistent with the raw bytes; it is not independent corroboration.

## 3. Independent fixed expectation for `na-pending`

These are authored literals bound to this retained acquisition (baseline revision pinned
above). They must be stored as constants and **must not be recomputed from the receipt at
evaluate time**. Field names are proposed for the owned expectations file; the semantic
content is the requirement.

```json
{
  "id": "na-pending",
  "action": "none",
  "autosubmit": false,
  "toolName": "lifecycle",
  "nonce": "5956c381-7675-4fe7-a6b4-990d7cf866f9",
  "invocationId": "44555B4FCF76A7EE11B1E96ACA81851F",
  "expectedStatus": "pending",
  "expectedOutput": null,
  "expectedError": null,
  "frameId": "27001C032351C5A5FEE40A6B9E99DE98",
  "pageUrl": "http://127.0.0.1:43143/na-pending",
  "preWindowMs": 254,
  "afterWindowMs": 503,
  "minPreWindowMs": 250,
  "minAfterWindowMs": 500,
  "pageState": {
    "nonce": "5956c381-7675-4fe7-a6b4-990d7cf866f9",
    "submits": [], "errors": [],
    "url": "http://127.0.0.1:43143/na-pending",
    "secureContext": true, "formExists": true, "formActive": true,
    "value": "5956c381-7675-4fe7-a6b4-990d7cf866f9", "focused": "go"
  },
  "submits": [], "navigations": [],
  "fixture": {"path":"corpus/evidence/round-21/runtime/na-pending.html",
              "sha256":"f7c869270c8218f7351ad2be3143d8e7d6f2458e6505966d6c9b4bc747af60c6"},
  "evidence": {"path":"corpus/evidence/round-21/runtime/na-pending.json",
               "sha256":"f17fe86f9fe8c6ba0e9d71303d7d23cfc7518a0e9e6288a55d0b5f37047b796e"},
  "producerSha256": "bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811",
  "receiptSha256": "4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034"
}
```

## 4. Oracle checks for `na-pending`

### 4.1 Input shape / case set (`input_shape`, `case_set`)

- The fixed 12 ids remain exactly the set; `na-pending` appears once with
  `action:"none"`, `autosubmit:false`, the nonce and invocation id above.
- The expectation entry above exists as a literal; a missing `na-pending` expectation is
  measure-level `baseline0`, any other missing entry is `failed0` (contract), never a
  silent credit.

### 4.2 Evidence binding (`evidence_binding`) — separate from semantics

- Fixture path/sha256 exact; fixture bytes contain the nonce; the first `<form>` has
  `toolname="lifecycle"` and **no `toolautosubmit` attribute** (declarative, non-auto).
- Evidence path/sha256 exact; receipt case `evidence.path`/`sha256` exact; receipt sha256
  matches the pinned literal and `runtime-execution-finalized.json` (`receiptSha256`,
  `artifacts[receipt.json]`, `artifacts[na-pending.json]`).
- Producer path/sha256 exact.
- `toolsAdded` contains exactly one tool: name `lifecycle`, `frameId` = frame id above,
  and no `annotations.autosubmit` (contrast: `auto-positive`/`auto-invalid` carry
  `annotations:{autosubmit:true}`).
- `invokeTool` sent exactly once: same `frameId`, `toolName`, `input.q` = nonce; its
  result contains `invocationId` and nothing outcome-shaped; `toolInvoked` has the same
  tool/frame/invocation id and its `input` parses to `{"q":nonce}`.
- Raw summary equality (binding, not semantics): `preAction.{start,end,windowMs,responseCount,formActive}`,
  `after.{start,end,windowMs,responses,submits,navigations,pageState}`, `invokeError`
  equal the raw-derived values; the receipt is cross-checked against the transcript, never
  used as the source of the expected or observed outcome.

### 4.3 Sequence (`semantic_timing` for ordering; identity under `evidence_binding`)

Required ordered subsequence, each element once:

```
frameNavigated(/na-pending) < toolsAdded(lifecycle) < sent invokeTool(cmd C)
  < result(C, invocationId I) < toolInvoked(I) < pre-action observation
  < action{none, no-action} < action-complete{none} < after-action observation
```

and `after-action` is the final frame (`post.seq === frames.length`), seq contiguous from
1, `at` non-decreasing. The invoke result is an acknowledgement, not an outcome; setup
commands (`Page.enable`, `WebMCP.enable`, `Page.getFrameTree`) are not outcome evidence.

### 4.4 Status (`semantic_status`) — exact derivation and expected value

Derive the observed outcome **only from raw frames matching `invocationId`**:

- If exactly one `WebMCP.toolResponded` with `params.invocationId === I` exists → observed
  status = `params.status`; observed output = `params.output` if present else `null`;
  observed error = `params.errorText` if present else `null`.
- If zero such frames exist **and** the invocation was accepted (`invokeTool` result has
  `invocationId === I`, `toolInvoked(I)` present) **and** the transcript terminates at the
  `after-action` marker → observed status = `"pending"`.
- If zero such frames exist but the invocation was not accepted, or the after marker is
  missing/duplicated, or the transcript extends past it without a response → not
  `pending`; emit `semantic_status`/`semantic_timing` failure. Absence of evidence must
  never be laundered into `pending`.

Expected: `"pending"`. Any `toolResponded` for `I` inside the finite windows, or anywhere
in the terminated transcript, with status `Completed`/`Canceled`/`Error` is a
`semantic_status` failure. `pending` is not `delayed`: no release mechanism, no
`window.release` marker, and no later observation exist here.

Additionally require the post-action page state to be unchanged from pre-action (§4.6);
a page that submitted, errored, navigated, or dropped `:tool-form-active` while claiming
`pending` fails `semantic_status`.

### 4.5 Output and error (`semantic_output`, `semantic_error`)

Expected `null` / `null`. With zero `toolResponded`, no `output` and no `errorText` exist
for `I`; the invoke result's `{invocationId}` is not output. A non-null output object or
any non-null `errorText` for `I` is red on the corresponding finding.

### 4.6 Page state (`semantic_status` for the semantic transition; `evidence_binding` for
summary/raw equality)

- `pre-action` and `after-action` each exactly once; `pre.value` deep-equals
  `post.value`, and both deep-equal the fixed `pageState` literal in §3:
  `nonce` fixed, `submits:[]`, `errors:[]`, URL unchanged, `secureContext:true`,
  `formExists:true`, `formActive:true`, `value` = nonce, `focused:"go"`.
- Receipt `after.submits` `[]`, `after.navigations` `[]`, `after.pageState` deep-equal
  `post.value`, `preAction.responseCount` 0, `preAction.formActive` true.
- Limit: this asserts only what the page reported at two sampled instants; it does not
  prove the tool cannot later settle, and it does not prove `:tool-form-active` semantics
  generally (S100:212-218 covers focus/pause callsites only).

### 4.7 Navigation (`semantic_navigation`)

Exactly one `Page.frameNavigated` in the transcript: type `Navigation`, frame id above,
URL the fixed `/na-pending` URL, and `seq` before the `pre-action` marker. No navigation
frame at or after `after.start`; receipt `after.navigations` `[]`.

### 4.8 Delayed (`semantic_delayed`)

Not applicable to `na-pending`. The oracle must not emit `semantic_delayed` here and must
not accept a delayed-release transcript as `pending`; delayed completion belongs to
`na-delayed` with its explicit release marker.

### 4.9 Finite timing (`semantic_timing`)

- `preAction.windowMs` and `after.windowMs` finite numbers equal to `end−start`, equal to
  the fixed literals 254 and 503 (this acquisition), and above floors 250/500.
- `preAction.start` = invoke sent `at`; `preAction.end` = `pre-action.at`;
  `after.start` = `pre-action.at`; `after.end` = `after-action.at`;
  `action.at`/`action-complete.at` within `after`; `after.end > after.start`.
- The pending claim is scoped to frames with `seq < after-action.seq`, and the transcript
  contains nothing after that marker. Missing, negative, zero, or widened windows are
  `semantic_timing` failures — never a semantic pass. This is the “finite” in
  “pending finite”.

### 4.10 Cleanup limits (`evidence_binding` / cleanup class)

Required: `contextClosed === true`; no `closeError`; `browserPidsBefore` non-empty, unique
positive integers (recorded 9 pids listed in §1.5); `browserPidsAtClose` deep-equal
`browserPidsBefore`; `browserPidsAfter` `[]`; `browserPidsSeenAfterClose` `[]`;
`processIdentitiesAtLaunch` and `processIdentities` non-empty and mutually equal with
`{pid,startTicks}` pairs for those pids; `blocked` `[]`; `downloads` `[]`; receipt
`cleanup.browserClosed && cleanup.serverClosed` true with no cleanup error fields.

Limits: these are bounded samples taken before launch, before close, and after close.
Empty `browserPidsAfter` / `browserPidsSeenAfterClose` mean “not seen by this scan”, not
universal process death; empty `blocked`/`downloads` are harness collections, not
browser-wide network isolation; `startTicks` pairing only guards against PID reuse in the
sampled set.

### 4.11 Revision input (`revision_input`)

Evaluate only from exact Git blobs at a full 40-hex revision, shell-free, with isolated
Git env and no replace objects. At baseline `5f58577…`, `na-pending.json` blob
`1250c7…` must hash to `f17fe86f…`; a mismatch is `revision_input`/`evidence_binding`
red, never a semantic pass. The old counter is not imported as an outcome oracle; it
stays frozen and unchanged.

## 5. Coherent semantic mutation the old structural count admits

**Mutation `pending → Completed`**: turn the pending observation into a settled one
without breaking any transcript/summary/digest link.

Recipe (all inside the mutated fixture set):

1. `corpus/evidence/round-21/runtime/na-pending.json`: insert one frame at seq 15, e.g.
   `{"seq":15,"at":1792590707400,"dir":"event","method":"WebMCP.toolResponded",
   "params":{"invocationId":"44555B4FCF76A7EE11B1E96ACA81851F","status":"Completed",
   "output":{"ok":true,"nonce":"5956c381-7675-4fe7-a6b4-990d7cf866f9","q":"5956c381-7675-4fe7-a6b4-990d7cf866f9"}}}`,
   and renumber the `after-action` observation to seq 16 (same `at`). Frame `at`
   (`1792590707400`) lies inside the after window `[1792590707335, 1792590707838]`.
2. `receipt.json`: set `after.responses` to `[that params object]` (its `seq < 16`, so the
   in-window summary is coherent); leave `preAction` unchanged (the event's seq 15 is
   after `pre-action` seq 12, so `responseCount` stays 0); refresh `evidence.sha256`.
3. `.ufo/waves/round-21/runtime-execution-finalized.json`: refresh
   `artifacts["corpus/evidence/round-21/runtime/na-pending.json"]`,
   `artifacts["corpus/evidence/round-21/runtime/receipt.json"]` and `receiptSha256`.
4. If the new expectations pin `evidence.sha256`/`receiptSha256`, refresh those digest
   links only; the semantic literals (`expectedStatus:"pending"`, `expectedOutput:null`,
   `expectedError:null`, sequence and page-state) stay unchanged.

**Why the frozen `c1_lifecycle_observations` counter still yields 12 / clean / exit 0**
(static walk of `.ufo/waves/round-21/measure-c1.mjs`, not executed):

- `order_mismatch`: seqs are contiguous 1–16 and `at` non-decreasing; the action-order
  clause only requires `result(I).seq < pre.seq < action.seq < complete.seq < post.seq`
  (10 < 12 < 13 < 14 < 16), all unaffected.
- `raw_invoke` / `invoke_identity` / `event_identity`: still exactly one `invokeTool`, one
  matching result, one `toolInvoked`; the new `toolResponded` has `seq > toolInvoked.seq`
  and the same invocation id, which is all that is checked; the event's payload is never
  compared against a declared outcome.
- `summary_mismatch`: `after.responses` is compared for equality with the raw events
  (`seq < post.seq`), so updating the receipt with the injected event keeps it green;
  `pageState`, `submits` and `navigations` are untouched.
- `case_identity`: id/nonce/autosubmit/action/mode and the page nonce echo are unchanged;
  the counter never compares the observed status with any case semantics.
- No rule forbids a `toolResponded` when `action === "none"`, so the “pending” shape and
  a settled shape are indistinguishable to the structural measure. That is the
  all-silent admission.

**Expected verdict under the new oracle:** `semantic_status` red (expected `pending`,
observed `Completed` inside the finite after window) and `semantic_output` red (expected
`null`, observed `{ok:true,nonce,q}`); `semantic_error`, `semantic_timing`,
`semantic_navigation`, `evidence_binding`, `case_set` and cleanup stay green once digest
links are refreshed. The case therefore must not contribute to
`c1_semantically_checked_lifecycle_rows` (value < 12, exit 1; whether the metric reports
11 or 0 on any failure is the implementer's contract, but 12 is impossible), whereas the
old metric reports 12.

Confidence: §1 values are byte-exact observations (high); §3/§4 are a proposed
specification (normative, not yet implemented); the §5 admission walk is a static
inference from the frozen counter source (high, unexecuted by contract).

Secondary admitted variant (same gap, no frame insertion): flip `after.pageState.formActive`
`true → false` coherently in raw and receipt; the old counter stays green because it only
compares summary with raw, while the §4.6 page-state assertion turns red.

## 6. Limits and non-claims

- `pending` here is only the absence of a matching response in a terminated, finite,
  recorded acquisition (254 ms pre / 503 ms post windows; transcript ends at the after
  marker). It is not an indefinite-pending guarantee, not liveness, and not a proof that a
  response can never arrive.
- The invoke result is only an acknowledgement; no status/output/error may be read from it.
- The fixture's `mode:"success"` is configuration, not observed outcome.
- Cleanup evidence is a sampled own-process observation, not a hostile-host or
  network-isolation guarantee.
- Loopback-only, one Chromium build (`154.0.8037.97`), Playwright `1.64.0`, Node
  `v24.21.0`; no rerun was performed and none is claimed.
- This report specifies an oracle; it does not assert the oracle is implemented, and the
  mutation-admission walk is inference from the frozen counter source, not an executed
  red/green run.

## 7. Remaining unknowns

- The exact expectations-file schema and finding-to-check allocation remain owned by
  `TabiR22.BuildOracle`; §3/§4 give the required semantics under proposed names.
- Whether the selftest’s coherent-mutation harness refreshes pinned expectation digests
  (rather than only receipt/execution links) is not visible to this seat; if it does not,
  the injected-response mutation would also trip `evidence_binding` unless that binding is
  refreshed, and the red would not isolate `semantic_status`.
