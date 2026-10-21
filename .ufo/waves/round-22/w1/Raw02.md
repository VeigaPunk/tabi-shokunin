# Raw02 — `na-click` finite semantic oracle (independent)

Report: `.ufo/waves/round-22/w1/Raw02.md`

Scope: read-only inspection of the retained round-21 acquisition and frozen round-21 counter. No browser, network, REA, tests, builds, or installs. This report validates retained bytes against fixed expectations derived from the raw case, fixture, and producer; the receipt row is checked as a raw mirror, not used to derive the expected outcome. It does not authenticate the acquisition or re-execute it. No browser-run, branch-coverage, or scalar movement is claimed. The frozen counter `.ufo/waves/round-21/measure-c1.mjs` is not modified or imported as an outcome oracle.

Confidence: **[OBS]** direct bytes, **[INF]** inference, **[UNK]** unresolved.

## 1. Inputs inspected

| Path | SHA-256 | Role |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-click.json` | `36502a284bad8b0b84c13346f40b1f1de1eeb8c5b6d5ce11fa8b971f877927ba` | Case raw evidence |
| `corpus/evidence/round-21/runtime/na-click.html` | `1ac88d83a4993c95265af1747f69b950c6db8d04bc18bc99b25938c017e87662` | Fixture |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | Receipt, `na-click` row |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | Producer |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | Acquisition pins |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | Note; `na-click` row at line 33 |
| `.ufo/waves/round-21/measure-c1.mjs` | frozen | Old structural counter (read-only reference) |

Verified bindings **[OBS]**:

- The evidence SHA equals `receipt.cases[na-click].evidence.sha256` and the execution artifact digest for `na-click.json`; the fixture SHA equals `na-click.json.fixture.sha256` and the execution artifact digest for `na-click.html`.
- `runtime-execution-finalized.json` has `exit: 0`, producer path/SHA equal above, `receiptSha256` equal to the actual receipt SHA, and `artifacts` covering the 25 runtime files including `na-click.json` and `na-click.html`.
- Receipt case row: `nonce d57a9461-7725-447a-94ee-5031820695a6`, `autosubmit false`, `action click`, `invocationId 5CE5ECE3023564847832ECEB5F305854`, `invokeError null`.
- `preAction = {start:1792590708016, end:1792590708268, windowMs:252, responseCount:0, formActive:true}`.
- `after = {start:1792590708268, end:1792590708815, windowMs:547, responses:[one Completed], submits:[one], navigations:[], pageState:<post observation>}`.
- Raw cleanup: 9 browser PIDs before, `browserPidsAfter []`, `browserPidsAtClose` the same 9 PIDs, `browserPidsSeenAfterClose []`, `contextClosed true`, no `closeError`, `blocked []`, `downloads []`; receipt `cleanup.browserClosed/serverClosed true` with no errors.

## 2. Observed `na-click` frame timeline

`seq` / offset from first frame / frame / exact content **[OBS]**:

| Seq | Δms | Frame | Content |
|---:|---:|---|---|
| 1–2 | 0 | `Page.enable` sent/result | command 1, `{}` |
| 3 | +5 | `Page.frameNavigated` | frame `9967ED1565B1659BFC7B3D6C348C354B`, URL `http://127.0.0.1:43143/na-click`, type `Navigation` |
| 4–6 | +13/+14 | `WebMCP.enable` sent/result | command 2; tool `lifecycle`, frame `9967ED…`, inputSchema `q:string` required |
| 7–8 | +14 | `Page.getFrameTree` sent/result | frame id `9967ED…` |
| 9 | +14 | `WebMCP.invokeTool` sent | command 4; `{frameId:"9967ED…", toolName:"lifecycle", input:{q:"d57a9461-7725-447a-94ee-5031820695a6"}}` |
| 10 | +15 | result | `invocationId:"5CE5ECE3023564847832ECEB5F305854"` |
| 11 | +15 | `WebMCP.toolInvoked` | same invocationId; input string exactly `{"q":"d57a9461-7725-447a-94ee-5031820695a6"}` |
| 12 | +267 | observation `pre-action` | `{nonce:"d57a…", submits:[], errors:[], url:"http://127.0.0.1:43143/na-click", secureContext:true, formExists:true, formActive:true, value:"d57a…", focused:"go"}` |
| 13 | +268 | action | `{action:"click", phase:"dispatch-started"}` |
| 14 | +313 | `WebMCP.toolResponded` | `{invocationId:"5CE5…", status:"Completed", output:{ok:true, nonce:"d57a…", q:"d57a…"}}` |
| 15 | +313 | action-complete | `{action:"click"}` |
| 16 | +814 | observation `after-action` | `{nonce:"d57a…", submits:[{agentInvoked:true, isTrusted:true, q:"d57a…", active:true, respondWith:"function"}], errors:[], url:"http://127.0.0.1:43143/na-click", secureContext:true, formExists:true, formActive:false, value:"d57a…", focused:"go"}` |

Exact times **[OBS]**: invoke result `1792590708016`; pre observation `1792590708268` (252 ms later); action frame `1792590708269`; receipt `after.start` (= producer `actionAt`) `1792590708268`; response `1792590708314` (45 ms after the action frame, 46 ms after `actionAt`); action-complete `1792590708314`; post observation `1792590708815` (546 ms after the action frame, 547 ms after `actionAt`, 501 ms after action-complete).

Only one `Page.frameNavigated` exists, and it precedes the invocation. Only one `WebMCP.toolResponded` exists in the whole file. No `release` frame and no `delayed-before-release` observation exist. Receipt `requests` contains `GET /na-click` at `1792590708004` and no `/landing` request for this nonce; the only `/landing` request belongs to `na-native-submit` (`q=8a5839ad-…`).

Fixture/producer causal facts **[OBS]**: fixture lines 7–15 register one `submit` handler on `#f`, push the observation, call `preventDefault()`, and with `mode="success"` (line 10) call `e.respondWith(Promise.resolve({ok:true,nonce:"d57a…",q:f.elements.q.value}))`; producer line 213 performs `page.locator('#go').click({timeout:5000})`; producer lines 209/226 derive the response list from `WebMCP.toolResponded` frames correlated by `invocationId`.

## 3. Independently specified finite semantic oracle for `na-click`

The evaluation MUST be a closed predicate over the hashed raw JSON, the matching receipt row, the hashed fixture, the producer/acquisition pins, and the fixed expectation. It MUST NOT execute the fixture, scan the filesystem beyond the supplied file map, read live Chrome, or infer an expected outcome from the evaluated receipt. The expected nonce is fixed by the fixture hash/acquisition (literal `d57a9461-7725-447a-94ee-5031820695a6` for this historical corpus), not recomputed from `receipt.after.pageState` or `receipt.after.responses`.

### 3.1 Invocation binding

1. Case identity: `id=="na-click"`, `autosubmit===false`, `action==="click"`, `mode==="success"`; evidence path `corpus/evidence/round-21/runtime/na-click.json`; fixture path `corpus/evidence/round-21/runtime/na-click.html`; the fixture and evidence SHAs equal the pinned values above; receipt `evidence.sha256` equals the actual evidence SHA; execution pins match.
2. Registration: exactly one `WebMCP.toolsAdded` tool named `lifecycle`, `frameId=="9967ED1565B1659BFC7B3D6C348C354B"`, input schema type `object` with required `q`.
3. Exactly one `sent` `WebMCP.invokeTool` with params exactly `{frameId:"9967ED1565B1659BFC7B3D6C348C354B", toolName:"lifecycle", input:{q:"d57a9461-7725-447a-94ee-5031820695a6"}}` — exact key set; no extra input keys.
4. That command MUST be answered exactly once by a `result` (not an `error` frame) carrying string `invocationId=="5CE5ECE3023564847832ECEB5F305854"`; receipt `invocationId` and `invokeError===null` mirror it.
5. Exactly one `WebMCP.toolInvoked` with that invocationId, matching `toolName`/`frameId`, and `input` that parses to exactly `{q:"d57a9461-7725-447a-94ee-5031820695a6"}`; it follows the invocation result.
6. The only `WebMCP.toolResponded` event in the file is the one specified in §3.3; there is no second terminal event and no terminal event for any other `invocationId`.

### 3.2 Pre / action / post sequence

1. Exactly one `pre-action` observation frame and exactly one matching `pageObservations` entry with identical `seq`, `at`, and `value`; it precedes the action.
2. Exactly one action frame `{action:"click", phase:"dispatch-started"}` and exactly one `action-complete` `{action:"click"}`; no `no-action` phase, no `release` frame, no `delayed-before-release` observation.
3. Exactly one `after-action` observation frame and exactly one matching `pageObservations` entry with identical `seq`, `at`, and `value`; it follows action-complete.
4. Required strict ordering for this acquisition: invocation result seq `10` < `toolInvoked` `11` < pre `12` < action `13` < `toolResponded` `14` < action-complete `15` < post `16`; frames are `seq`-contiguous 1..16 with finite nondecreasing `at`. The clause `responded < action-complete` is exact acquisition shape; the semantic causal core is `action < responded < post`.
5. The pre observation MUST show zero responses (`preAction.responseCount===0`); no terminal response may exist before the action.

### 3.3 Exact terminal status / output / error

Exactly one `WebMCP.toolResponded` for the invocation, after the action and before the post observation, with:

- `params` has required keys `invocationId`, `status`, `output`; `errorText` is optional and admitted only as absent or `null`; any other key or a non-null `errorText` fails `semantic_error` for this row;
- `invocationId=="5CE5ECE3023564847832ECEB5F305854"`;
- `status==="Completed"` (case-sensitive, exact);
- `output` deep-equals exactly `{ok:true, nonce:"d57a9461-7725-447a-94ee-5031820695a6", q:"d57a9461-7725-447a-94ee-5031820695a6"}` — exact key set, `ok` boolean `true`, both string values exactly the nonce;
- no `Error`/`Canceled` status and no error text; no second terminal event for the invocation in the entire file;
- receipt `after.responses` deep-equals exactly the one `params` object.

`output.ok` is a fixture-defined field (fixture line 12) and is not a product guarantee.

### 3.4 Page-state and navigation limits

Pre `value` exact (9-key object): `nonce` = case nonce; `submits==[]`; `errors==[]`; `url=="http://127.0.0.1:43143/na-click"`; `secureContext===true`; `formExists===true`; `formActive===true`; `value` = case nonce; `focused=="go"`.

Post `value` exact: `nonce` unchanged; `submits` is exactly one 5-key object `{agentInvoked:true, isTrusted:true, q:<case nonce>, active:true, respondWith:"function"}`; `errors==[]`; `url` identical to pre (no navigation); `secureContext===true`; `formExists===true`; `formActive===false`; `value` = case nonce; `focused=="go"`.

Navigation/network boundary: exactly one `Page.frameNavigated` in the file, before the invocation, URL `http://127.0.0.1:43143/na-click`; zero navigations with `seq > invocation seq`; `after.navigations==[]`; no `/landing` request carrying this nonce in `receipt.requests`; `blocked==[]`; `downloads==[]`. The fixture’s `action="/landing"` must not be reached because the handler calls `preventDefault()` (fixture line 9).

Receipt mirror (checked, not an expectation source): `preAction.formActive` equals pre `formActive`; `preAction.responseCount===0`; `after.pageState` deep-equals post `value`; `after.submits` deep-equals post `submits`; `after.navigations===[]`; `after.end===post.at`; `after.responses` deep-equals the §3.3 `params` array.

Limits: this predicate uses only the observation fields above. It does not claim accessibility conformance, DOM completeness, network truth, human input, or general browser behavior. `agentInvoked`/`isTrusted` are UA event fields; `active` is the fixture’s `:tool-form-active` reading at submit dispatch; the `true→false` `formActive` transition delimits the observed settlement and must not be inferred from note prose. **[INF]** for the general meaning of `:tool-form-active`; **[OBS]** for the recorded transition.

### 3.5 Finite timing windows

1. `preAction.start` equals the invocation result `at` (`1792590708016`); `preAction.end===pre.at`; `preAction.windowMs===end-start`; `windowMs>=250` (observed 252); `pre.at < action.at`.
2. `after.start===1792590708268` (producer `actionAt`, line 211); `after.end===post.at`; `after.windowMs===end-start`; `windowMs>=500` (observed 547); `after.start <= action.at` (observed 8268 <= 8269); the pre observation precedes the action frame.
3. The terminal response MUST have `at >= action.at` (8269), `seq > action.seq`, and `seq < post.seq`; for this acquisition it is at `1792590708314`, 45 ms after the action frame and 501 ms before the post observation.
4. No unbounded “eventually” predicate is allowed: the Completed outcome MUST be present inside the recorded closed frame set before the post observation. A response only after the post observation is not a pass for this row.
5. All `at` values are finite safe integers and `seq` values are finite contiguous integers; no wall-clock or external timing source is read.

### 3.6 Cleanup limits

1. `browserPidsBefore` is a non-empty list of positive integers (observed 9 PIDs); `browserPidsAfter===[]`; `contextClosed===true`; no `closeError`.
2. `browserPidsAtClose` as a set equals `browserPidsBefore`; `browserPidsSeenAfterClose===[]`; `processIdentitiesAtLaunch` covers the before-PID set with `{pid,startTicks}` pairs and has no extra PID.
3. `blocked===[]`; `downloads===[]`; receipt `cleanup.browserClosed===true`, `serverClosed===true`, and no context/server/temp error.
4. The oracle checks only these recorded boundaries; it does not probe `/proc`, does not prove OS-level process death beyond `browserPidsSeenAfterClose==[]`, and does not authenticate the acquisition.
5. Recommended mapping: cleanup violations are boundary/evidence failures (`evidence_binding` or `input_shape` as the shared oracle defines), not `semantic_status`; they must never mint semantic lifecycle credit on their own.

### 3.7 Finding mapping (recommendation to the shared oracle owner)

| Predicate failure | Stable finding |
|---|---|
| Missing/duplicate/wrong terminal status | `semantic_status` |
| Wrong `output` object, wrong page-state echo, wrong submit record | `semantic_output` |
| Non-null `errorText` on a claimed Completed outcome | `semantic_error` |
| Response outside `(action, post)`, response in pre window, window arithmetic/threshold failure, exact relative-order failure | `semantic_timing` |
| Any post-invocation navigation or `/landing` request | `semantic_navigation` |
| `release`/`delayed-before-release` markers on this non-delayed row | `semantic_delayed` |
| Digest/acquisition mismatch, raw-vs-receipt mirror mismatch, cleanup boundary | `evidence_binding` |
| Malformed/missing/extra frames, non-contiguous seq | `input_shape` |
| Case-set, note provenance, revision pins | `case_set` / `source_binding` / `revision_input` |

Page state has no dedicated stable finding in the stated list; `semantic_output` is the closest place to encode the post-action page-state echo so a semantic mutation always produces a `semantic_*` finding. This is a naming recommendation, not an extra check. At minimum the `na-click` entry in `rows` should identify the case and make the failing predicate attributable (invocation, sequence, status, output, error, page state, navigation, timing, cleanup) so a red result names the semantic defect rather than only a generic row failure.

Acceptance boundary: the unmutated retained corpus is the positive boundary. `na-click` contributes exactly one semantically checked row only when every predicate in §3.1–§3.6 passes; the shared contract’s clean total is `value 12`, `exit 0`, `findings []` only when all 12 fixed expectations and the note are present and met. Missing new expectations/note is the baseline 0 case; a partially missing expectation set is the failed 0 case. This report specifies only the `na-click` expectation and does not raise the count by itself.

## 4. Why the frozen structural count admits a silent synthetic row

The old counter reads structure, not outcomes **[OBS]**:

- `.ufo/waves/round-21/measure-c1.mjs:124` filters `WebMCP.toolResponded` events into `events`; an empty array is valid.
- `:126` only rejects `events.some(f => f.seq <= invoked[0].seq)`; on an empty array this is vacuously false. `invoked.length===1` and a string invocationId are the only terminal-related requirements.
- `:136` requires `answered < pre < action < action-complete < post`; `WebMCP.toolResponded` is absent from the ordering entirely.
- `:139` compares `after.responses` to the same filtered event list and mirrors `pageState`/`submits`; it never compares status, output, `errorText`, output-to-input nonce, submit count, or `formActive` semantics to the case action/mode.
- `:143` returns `cases.length` when there are no findings. A case with no terminal response therefore contributes 1 to the count.
- `:104` checks the note only via `note.includes('`'+id+'`')`; the note’s line 33 claim “Completed with the dummy response object” is not cross-checked against raw.
- No occurrence of `status`, `output`, `errorText`, `browserPidsAtClose`, `browserPidsSeenAfterClose`, or `requests` exists as a check in the old counter (verified by search of `.ufo/waves/round-21/measure-c1.mjs`; the only `status` matches are the unrelated `spawnSync().status`/`exitCode` plumbing).

Therefore an all-silent `na-click` raw row — invocation and observations only, no terminal response — is structurally clean and still counts. The same omission leaves terminal status, `output`, `errorText`, and post page-state semantics unchecked; §5 names a shape-preserving instance that changes only those.

## 5. Named coherent semantic mutation the old count admits

**M1 — “success becomes a reset-style cancellation.”** Keep all 16 frames, the invocation, the pre observation, the click, the timing, and the frame count; replace only the outcome and its mirrored page state.

Exact transformation:

1. In `corpus/evidence/round-21/runtime/na-click.json`, replace the `seq 14` `WebMCP.toolResponded` `params` with exactly `{invocationId:"5CE5ECE3023564847832ECEB5F305854", status:"Canceled", errorText:"Tool execution cancelled by a form reset"}` (remove `output`). Keep its `at` (`1792590708314`) and all 16 frames/`seq` values unchanged.
2. In the same file’s `seq 16` after-action observation frame and its mirrored `pageObservations` `after-action` value, set `submits:[]` and `value:""` (reset-shaped), keep `formActive:false`, `focused:"go"`, `nonce`, `errors:[]`, `url`, `secureContext:true`, `formExists:true`. This is the exact post-state shape recorded by `na-reset`, transplanted onto the still-present click sequence.
3. In `corpus/evidence/round-21/runtime/receipt.json` `cases[id=="na-click"]`, set `after.responses` to the new single canceled `params`, `after.submits=[]`, and `after.pageState` to the new post value. Keep `after.start/end/windowMs`, `after.navigations`, and `preAction` unchanged.
4. Recompute `evidence.sha256` for the new `na-click.json`; then recompute the receipt SHA.
5. In `.ufo/waves/round-21/runtime-execution-finalized.json`, update `artifacts["corpus/evidence/round-21/runtime/na-click.json"]`, `artifacts["corpus/evidence/round-21/runtime/receipt.json"]`, and `receiptSha256`. Keep `exit:0`, producer path/SHA, and argv unchanged.
6. Do not change `na-click.html`, `scripts/webmcp-lifecycle-round21.mjs`, or the note. The note still says Completed at line 33; the old counter does not read that claim.

Static trace through the frozen counter **[OBS from the cited code]**:

- `case_shape`, `nonce_reused`, `evidence_digest`, `fixture_digest`, `case_identity`: unchanged or updated coherently → pass.
- `order_mismatch`: 16 contiguous `seq` values with nondecreasing `at` (the canceled event keeps `seq 14` and `at 1792590708314`) → pass.
- `raw_invoke`, `invoke_identity`: invocation and result untouched → pass.
- `event_identity`: `invoked.length===1`; the canceled event is at `seq 14`, after `toolInvoked` at `seq 11`, so `events.some(f => f.seq <= invoked[0].seq)` is false; invocationId is a nonempty string → pass.
- `order_mismatch:action`: `10 < 12 < 13 < 15 < 16` (answered, pre, action, action-complete, post); `WebMCP.toolResponded` is still absent from this ordering → pass.
- `case_identity:page echo`: pre `nonce`/`value` untouched; post `nonce` still equals `c.nonce` for `action!=="submit"` → pass.
- `window_mismatch`: 252 ≥ 250 and 547 ≥ 500, exact arithmetic and ends unchanged → pass.
- `summary_mismatch`: `after.responses` mirrors the new canceled `params`; `after.pageState` mirrors the new post value; `after.submits===[]` mirrors the post `submits`; `after.navigations===[]`; `preAction.responseCount` remains 0 → pass.
- `context_cleanup`, `boundary_violation`, `execution_binding`: unchanged/updated pins → pass.
- Result: `findings=[]`, so `value=cases.length=12`, `verdict:"clean"`, `exit:0` — the reset-style cancellation is admitted as a `na-click` lifecycle observation.

Against the specified oracle **[INF from §3]**: `semantic_status` fails (`Canceled` where exactly one `Completed` is required); `semantic_output` fails (the expected `{ok:true,nonce,q}` object is absent and the post page-state is reset-shaped); `semantic_error` fails (non-null `errorText` on a row that must record a Completed success); `semantic_timing` passes (the response is still inside `(action, post)` at `1792590708314`); `semantic_navigation` and `semantic_delayed` pass; `input_shape` passes (all 16 frames and `seq` values intact); `evidence_binding` passes (digests and receipt mirror coherently updated). Expected result: `value 0`, `exit 1`, with semantic findings rather than stale-hash or malformed-shape artifacts. This mutation is a falsifier for tests, not an allegation that the retained acquisition itself is wrong; the unmutated retained bytes remain the positive baseline.

## 6. Residual unknowns and boundaries

- **[OBS/INF]** The raw evidence proves a trusted submit with `agentInvoked:true` after a producer `page.locator('#go').click()` (producer line 213). It cannot by itself distinguish a Playwright input-pipeline click from a scripted `element.click()`; the note’s line 33 already limits the claim to “not a claim of human intervention.” The oracle must not claim human input or general browser behavior.
- **[INF]** `:tool-form-active` semantics are inferred from the recorded pre/post transition and fixture line 8; they are not independently source-verified in this lane. The expectation should encode the observed transition only.
- **[OBS]** Receipt `after.start` (`1792590708268`) precedes the action frame (`1792590708269`) by 1 ms, a producer bookkeeping order. The causal test must use `response.seq > action.seq` and `response.at >= action.at`, not treat `after.start` as the action instant.
- **[OBS]** The URL port `43143` is acquisition-specific. For this historical oracle the exact literal is legitimate; if generality is ever wanted, bind the URL to the hashed initial navigation/fixture, never to receipt mirror fields.
- **[UNK]** The shared oracle’s exact finding for post page-state is not fixed by the stated stable list; `semantic_output` is recommended, but the owner must choose one stable finding and avoid duplicating the same defect across findings.
- **[UNK]** The old counter does not read `browserPidsAtClose`/`browserPidsSeenAfterClose`; adopting those as new cleanup evidence is a recommendation. They do not change the lifecycle outcome and must not mint semantic credit.
- The fixed literal nonce is historical. A different acquisition needs new expectations; deriving the expected nonce from the evaluated receipt would make the oracle self-attesting and is prohibited.

## 7. Tooling

No installs, upgrades, services, or external probes were performed. No project files outside this report were written.

Report: `.ufo/waves/round-22/w1/Raw02.md`
