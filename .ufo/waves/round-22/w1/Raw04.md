# Raw04 — `na-native-submit` finite semantic oracle

Scope: read-only inspection of the retained round-21 acquisition and matching receipt row.
Nothing was run, mutated, built, tested, or reformatted. This report specifies predicates
only; it does not implement them. No browser, network, REA, or service was used.

## 1. Evidence read (exact paths and digests)

| Artifact | Path | Observed sha256 |
|---|---|---|
| Case evidence | `corpus/evidence/round-21/runtime/na-native-submit.json` | `28a20412dc11d4d1ed690b4d80414a359193db491518b32277cff5a12eebc9b5` |
| Served fixture | `corpus/evidence/round-21/runtime/na-native-submit.html` | `c95abb9cca63862ad93d580ba121d2aa398d97710b1c7d22692aba3cd2dad186` |
| Receipt | `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| Producer | `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |
| Execution binding | `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` |
| Corrected note | `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | row for this case at line 35 |

The case declares `fixture.path` = the fixture above and `fixture.sha256` =
`c95abb…d186`, which equals the actual fixture bytes. The receipt case's
`evidence.sha256` = `28a204…c9b5`, which equals the actual evidence bytes.
The execution artifact records both the same digests, `receiptSha256` =
`4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`, `exit:0`,
`producerSha256` = the producer digest above, and argv
`node scripts/webmcp-lifecycle-round21.mjs --out .ufo/waves/round-21/runtime-finalized-candidate`.
These are the acquisition-identity literals; none were recomputed from an outcome.

### 1.1 Observed invocation and timeline

Receipt row (read directly from `receipt.json`, case `id:"na-native-submit"`):

- `nonce` `8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`; `autosubmit:false`; `action:"submit"`;
  `invocationId:"0950796B8BFFB4979B8CA2A0ABE34A66"`; `invokeError:null`.
- `preAction` = `{start:1792590709930,end:1792590710183,windowMs:253,responseCount:0,formActive:true}`.
- `after` = `{start:1792590710183,end:1792590710686,windowMs:503,responses:[{invocationId:"0950796B8BFFB4979B8CA2A0ABE34A66",status:"Completed",output:[{"dummy":"landing"}]}],submits:null,navigations:[<one frameNavigated params>],pageState:{url:"http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4",secureContext:true,formExists:false,formActive:false,value:null,focused:""}}`.

Evidence frames (seq, dir/method or marker, `at`):

| seq | frame | at |
|---|---|---|
| 1 | sent `Page.enable` command 1 | 1792590709916 |
| 2 | result command 1 `{}` | 1792590709916 |
| 3 | event `Page.frameNavigated` → `http://127.0.0.1:43143/na-native-submit` | 1792590709922 |
| 4 | sent `WebMCP.enable` command 2 | 1792590709929 |
| 5 | event `WebMCP.toolsAdded` (`lifecycle`) | 1792590709930 |
| 6 | result command 2 `{}` | 1792590709930 |
| 7 | sent `Page.getFrameTree` command 3 | 1792590709930 |
| 8 | result command 3 (frame id `3F62022BA8EB4F1C7A8BAD21B535C727`) | 1792590709930 |
| 9 | sent `WebMCP.invokeTool` command 4, `{frameId, toolName:"lifecycle", input:{q:nonce}}` | 1792590709930 |
| 10 | result command 4 `{invocationId:"0950796B8BFFB4979B8CA2A0ABE34A66"}` | 1792590709930 |
| 11 | event `WebMCP.toolInvoked` (same invocationId, `input:"{\"q\":\"<nonce>\"}"`) | 1792590709931 |
| 12 | observation `pre-action` | 1792590710183 |
| 13 | action `{action:"submit",phase:"dispatch-started"}` | 1792590710183 |
| 14 | action-complete `{action:"submit"}` | 1792590710184 |
| 15 | event `Page.frameNavigated` → `http://127.0.0.1:43143/landing?q=<nonce>` (loaderId `F10DC0860EC568D9B6A6B51607869230`) | 1792590710190 |
| 16 | event `WebMCP.toolResponded` `{invocationId, status:"Completed", output:[{"dummy":"landing"}]}` | 1792590710196 |
| 17 | observation `after-action` | 1792590710686 |

Pre-action value (exact):
`{"nonce":"8a5839ad-fc49-4ed6-8661-501aa2c5c4a4","submits":[],"errors":[],"url":"http://127.0.0.1:43143/na-native-submit","secureContext":true,"formExists":true,"formActive":true,"value":"8a5839ad-fc49-4ed6-8661-501aa2c5c4a4","focused":"go"}`

Post-action value (exact, no `nonce`, `submits`, or `errors` keys):
`{"url":"http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4","secureContext":true,"formExists":false,"formActive":false,"value":null,"focused":""}`

Producer facts that generate this shape:
`scripts/webmcp-lifecycle-round21.mjs:18` fixes the tuple `[false,'submit','success']`;
`:107` renders the fixture form (`action="/landing" method="get"`, no `toolautosubmit`);
`:215` dispatches `page.evaluate(() => document.querySelector('#f').submit())`;
`:206-207` sleeps 250 ms then observes pre-action; `:211` fixes `actionAt`;
`:220` and `:222` emit the two action markers; `:224-226` sleeps 500 ms, observes
after-action, and builds `after.submits` as `Array.isArray(post.value.submits) ?
post.value.submits : null`. `:135-137` serves the landing document with only
`<script type="application/ld+json">{"dummy":"landing"}</script>`.

## 2. Observed semantics (facts) versus inference

Observed facts:

1. The invocation and fixture identity are exact and mutually bound by digests.
2. The pre-action document exists, is a secure loopback context, has the tool form
   present and `:tool-form-active`, has the nonce in `q`, focuses `go`, and records
   no submit or error before the action.
3. The action marker says `submit`; the effect is a real navigation to
   `/landing?q=<nonce>` (new loaderId) followed by one `Completed` tool response
   whose output is an array containing the landing document's JSON-LD object.
4. The after document is the landing document: the original form, its value and focus
   are gone; the old document's `submits`/`errors` counters are not present.
5. The receipt encodes the unavailable old-document submit state as `null`, not `[]`.
6. Cleanup evidence shows the owned browser process set present at close, context closed,
   no process remaining after close, no forced cleanup, no blocked request, no download.
7. The receipt's request list contains one GET `/na-native-submit` and one GET
   `/landing?q=<nonce>` between the initial request and the next case's request.

Inference (not to be encoded as observation):

- `HTMLFormElement.submit()` bypasses submit-event dispatch and interactive validation;
  therefore the fixture's submit listener cannot have executed. Corroboration: the
  action is `form.submit()` (`producer:215`), the document navigated instead of being
  held by the listener's `preventDefault()`, and the output is the destination
  document's JSON-LD array rather than the listener's `{ok,nonce,q}` value.
- The output's provenance as "landing document JSON-LD" rests on the observed literal
  and the pinned producer's landing body (`:135-137`); no separate landing-document
  file or HTTP response body was retained. The oracle must assert the literal output,
  not claim it re-parsed a retained landing file.
- The CDP transcript does not contain an action payload naming `HTMLFormElement.submit()`;
  the only action attestation is the harness marker plus the semantic effects. The
  oracle must not claim the submit event "was not dispatched" universally, only that
  no submit record exists in the retained post-navigation document and that the
  handler's response value did not appear.

## 3. Finite semantic oracle for `na-native-submit`

The oracle is a pure function of the retained blobs (`files` map) and independent fixed
expectations. It must not import the round-21 counter as an outcome oracle and must not
derive expected status/output/error/page-state from the evaluated receipt. Derived values
(nonce, origin) may parameterize relations but must come from the input/invocation, not
from the observed outcome.

### 3.1 Case set and input shape (`case_set`, `input_shape`)

- Evidence schema `tabi-round21-case-v1`, `id:"na-native-submit"`, `nonce` equal to the
  receipt case nonce, `autosubmit:false`, `action:"submit"`, `mode:"success"`.
- Fixture path is exactly `corpus/evidence/round-21/runtime/na-native-submit.html`;
  its sha256 is exactly `c95abb9cca63862ad93d580ba121d2aa398d97710b1c7d22692aba3cd2dad186`.
  The fixture text contains `toolname="lifecycle"`, `action="/landing"`, `method="get"`,
  an input named `q` with `required`, a submit button with id `go`, and no
  `toolautosubmit` attribute. The fixture must contain the case nonce (fixture interior,
  `window.observations` and handler value).
- Evidence `mode` is exactly `"success"`; the receipt case's `autosubmit:false` and
  `action:"submit"` agree with the evidence, and all three fields agree with the fixed
  case configuration. (The receipt row itself carries no `mode` field.)
- `WebMCP.toolsAdded` must contain exactly the `lifecycle` tool for the inspected frame
  before invocation, with `inputSchema.type:"object"`, a `q` property of type string,
  and `required:["q"]`. `backendNodeId` is observed as `2` but is incidental and must
  not be required.
- Exactly one `WebMCP.invokeTool`: `toolName:"lifecycle"`, `frameId` equal to the
  `Page.getFrameTree` root frame id, `input` deep-equal to `{q:<case nonce>}`. Exactly
  one matching command result, whose `invocationId` is a non-empty 32-character
  hexadecimal string equal to the receipt `invocationId`; `invokeError` strictly null.
- Exactly one `WebMCP.toolInvoked` for that invocationId, with the same toolName and
  frameId and `params.input` a JSON string exactly `{"q":"<case nonce>"}` (deep-equal
  after parse). No other invocation identity occurs in this case.

### 3.2 Sequence (`semantic_timing` / order)

For this retained case the exact sequence is:

1. `Page.enable` sent, then its single result.
2. Initial `Page.frameNavigated` to `<origin>/na-native-submit` before `WebMCP.enable`.
3. `WebMCP.enable` sent/result; `Page.getFrameTree` sent/result; `WebMCP.invokeTool`
   sent/result; `WebMCP.toolInvoked`.
4. Exactly one `pre-action` observation marker (seq 12, `at` 1792590710183), with its
   value deep-equal to the corresponding `pageObservations` entry.
5. Exactly one `action` marker `{action:"submit",phase:"dispatch-started"}` (seq 13),
   then exactly one `action-complete` `{action:"submit"}` (seq 14).
6. Exactly one post-action `Page.frameNavigated` to the landing URL (seq 15).
7. Exactly one correlated `WebMCP.toolResponded` (seq 16).
8. Exactly one `after-action` observation marker (seq 17), deep-equal to its
   `pageObservations` entry.

Order constraints by frame sequence (not by tied millisecond timestamps):
`invoke result < toolInvoked < pre < action < action-complete < navigation < response < post`.
No correlated `toolResponded` frame may have `seq < pre.seq`; in particular the
pre-action window must contain zero correlated outcomes (`preAction.responseCount === 0`).
There must be no `release` frame and no `delayed-before-release` observation for this case.
Frame sequence numbers must be contiguous from 1 and frame `at` values nondecreasing.

### 3.3 Timing bounds (`semantic_timing`)

- `preAction.windowMs === preAction.end - preAction.start`, `preAction.end === pre.at`,
  and `250 <= preAction.windowMs <= 5000`. Observed: 253.
- `after.windowMs === after.end - after.start`, `after.end === post.at`,
  `500 <= after.windowMs <= 5000`, and `after.start <= action.at`. Observed: 503.
- `after.start <= navigation.at <= response.at <= post.at`; the response must not
  precede the action or the navigation, and the post observation must follow both.
- `response.at - after.start <= 5000` and `post.at - response.at <= 5000`; all four
  timestamps must be finite numbers. Observed: action→navigation 7 ms,
  navigation→response 6 ms, response→post 490 ms.
- A missing response is not "pending in this case": pending is a different fixed case
  (`na-pending`). For `na-native-submit` the finite expected outcome is `Completed`
  within the after window. The exact observed 253/503 ms are acquisition facts, not
  requirement constants; the bounds above are the semantic limit.

### 3.4 Exact outcome (`semantic_status`, `semantic_output`, `semantic_error`)

- Exactly one correlated `WebMCP.toolResponded` for the case invocationId.
- `params.status` is exactly `"Completed"` (case-sensitive; no other status event for
  the invocationId).
- `params.output` is exactly the literal JSON value `[{"dummy":"landing"}]`:
  a one-element array, whose element is an object with exactly one key `dummy` and
  string value `"landing"`. No extra array elements, keys, casing changes, wrapper
  object, `null`, string encoding, or the fixture handler's `{ok:true,nonce,q}` object
  may substitute.
- No `errorText` property is present on the response, and no `dir:"error"` frame exists.
- The receipt's `invokeError` is null, `after.responses` deep-equals the array containing
  exactly that one response params object, and there is no `Error`/`Canceled` outcome.
- A zero-response case must fail `semantic_status` and `semantic_output`; a `Completed`
  response carrying the handler object must fail `semantic_output`; an `Error` or
  `Canceled` response must fail `semantic_status` and `semantic_error`.

### 3.5 Page state and navigation (`semantic_navigation`, `semantic_status`)

- Exactly two `Page.frameNavigated` events: one initial navigation to
  `<origin>/na-native-submit` before `WebMCP.enable`, and one post-action navigation.
  Within `[after.start, post.seq)` there is exactly one navigation.
- The post-action navigation frame has: the same frame id as the initial frame; a
  different loaderId; `type:"Navigation"`; `mimeType:"text/html"`; the same loopback
  origin/securityOrigin as the initial document; `securityOriginDetails.isLocalhost:true`;
  and URL exactly `<origin>/landing?q=<case nonce>` (path `/landing`, one query parameter
  `q` equal to the nonce, no extra query parameters or fragment). Observed URL:
  `http://127.0.0.1:43143/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`.
- `after.navigations` deep-equals the recorded post-action frameNavigated params array
  (one element). No navigation to any other URL.
- Post page state must deep-equal exactly:
  `{"url":"<landing URL>","secureContext":true,"formExists":false,"formActive":false,"value":null,"focused":""}`.
  It must not contain `nonce`, `submits`, or `errors` keys; `after.pageState` deep-equals it.
- Pre page state must deep-equal exactly:
  `{"nonce":"<case nonce>","submits":[],"errors":[],"url":"<origin>/na-native-submit","secureContext":true,"formExists":true,"formActive":true,"value":"<case nonce>","focused":"go"}`.
- `after.submits` must be JSON `null`, and the evidence post value must lack the
  `submits` key. This encodes "unavailable after cross-document navigation", not an
  observed zero. `[]`, `0`, a missing receipt key, or a post value containing
  `submits: []` must fail. The old-document counters cannot be observed after navigation.
- `formActive:false`, `formExists:false`, `value:null`, `focused:""` post-condition is
  part of the Completed semantics: the original tool form was replaced by the landing
  document, not left active.

### 3.6 Cleanup and acquisition boundary (`evidence_binding`)

Per-case evidence:

- `contextClosed === true`; no `closeError` property; `browserPidsAfter` exactly `[]`;
  `browserPidsSeenAfterClose` exactly `[]`; no `forcedCleanup` property.
- `browserPidsBefore` is non-empty, unique positive integers (observed 9:
  `1808763,1808770,1808771,1808804,1808824,1808845,1808868,1808877,1808879`);
  `browserPidsAtClose` is non-empty and equal to `browserPidsBefore` in this acquisition
  (equality is observed, not a universal requirement; the semantic limit is that no
  owned process remains after close).
- `processIdentitiesAtLaunch` covers every `browserPidsBefore` pid with a `startTicks`
  string; `processIdentities` is a superset with the same pid/startTicks pairs (no pid
  reuse). Observed: 9 identities, no reused ticks.
- `blocked` exactly `[]` and `downloads` exactly `[]` (loopback-only, no download).

Receipt:

- `cleanup.browserClosed === true`, `cleanup.serverClosed === true`, and no
  `contextError`, `serverError`, or `tempError`.
- Environment exactly `node:"v24.21.0"`, `chromium:"154.0.8037.97"`,
  `playwright:"1.64.0"`, and the four recorded flags:
  `--enable-features=CDPScreenshotNewSurface,WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp`;
  `--enable-blink-features=WebMCP,WebMCPTesting`;
  `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`; `--disable-extensions`.
- Requests: exactly one GET `/na-native-submit` and exactly one GET
  `/landing?q=<nonce>` for this case, with no other request URL between the initial
  request and the next case's initial request. Observed: `/na-native-submit` at
  1792590709919 and `/landing?q=…` at 1792590710188, then `/na-reset` at 1792590710852.
- Producer/execution binding: producer path and digest `bc11e4…a811`; execution
  `exit:0`, argv as recorded, `receiptSha256` equal to the actual receipt bytes, and
  `artifacts` digests equal to the actual case JSON/fixture bytes.

### 3.7 Provenance and revision input (`source_binding`, `revision_input`)

- The new note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` must exist and
  its first line must begin `source: S101` and associate the retained receipt/case
  evidence; S100 is source-interpretation only for the native path and must not be
  presented as proof of this Arch binary's behavior.
- The fixed expectation for this case must cite the literal evidence path/digests above
  and the literal status/output/page-state; it must not be computed by reading the
  evaluated receipt's `after.responses`.
- CLI revision input remains a full 40-hex Git revision with the isolated Git
  environment and no replace objects. Missing new expectation/note => baseline value 0;
  partial missing => failed 0; otherwise exit 0 clean, 1 failed/red semantics,
  2 could-not-evaluate. Values count only after these semantic predicates pass.

### 3.8 Finding-ID mapping (use only the stable IDs)

| Predicate group | Finding id |
|---|---|
| identity, fixture/action/mode, invocation format, tool registration | `case_set`, `input_shape` |
| raw invoke/toolInvoked identity and payload | `input_shape` |
| pre/action/post order, zero pre outcomes, finite windows | `semantic_timing` |
| exactly one status, `Completed` | `semantic_status` |
| exact landing-array output | `semantic_output` |
| absence of error frame/errorText/Error/Canceled | `semantic_error` |
| landing URL, loader/frame/origin, post document state | `semantic_navigation` |
| asserts absence of release markers for this non-delayed case | `semantic_delayed` |
| digests, producer, execution, cleanup, requests, environment | `evidence_binding` |
| note provenance | `source_binding` |
| full-40-hex CLI input and baseline/partial behavior | `revision_input` |

Do not invent additional finding IDs for page state: post URL/document identity maps to
`semantic_navigation`; pre form/filled/focused state and invocation shape map to
`input_shape`; formActive/Completed coupling maps to `semantic_status`.

### 3.9 Checks that must NOT be invented for this case

- Do not require a submit event record. `form.submit()` does not dispatch one, and the
  document navigated; `pre.submits:[]` is only pre-action evidence, and post `null` is
  unavailability.
- Do not require `isTrusted`, `agentInvoked`, `respondWith`, `active`, or any submit
  handler record for this case.
- Do not require a `release` frame, a `delayed-before-release` observation, or a
  controlled settlement marker; those belong to `na-delayed`.
- Do not require the fixture handler's `{ok:true,nonce,q}` value; it is the click /
  requestSubmit semantics, and its absence here is the semantic distinction.
- Do not require `pre.at < action.at` strictly; the retained timestamps tie at
  1792590710183 and order is attested by sequence numbers.
- Do not require exact 253/503 ms, `backendNodeId:2`, ad-frame fields
  (`adFrameType`, `gatedAPIFeatures`), `crossOriginIsolatedContextType`, or exactly nine
  browser pids; those are acquisition facts, not semantic outcomes.

## 4. Named coherent semantic mutation admitted by the old structural count

**Named mutation: silent outcome deletion (all-silent synthetic case).** Hypothetical
only; not applied here (read-only seat).

Exact mutation steps inside a disposable/private copy:

1. In `corpus/evidence/round-21/runtime/na-native-submit.json`, delete the single frame
   `{"seq":16,"dir":"event","method":"WebMCP.toolResponded","params":{"invocationId":"0950796B8BFFB4979B8CA2A0ABE34A66","status":"Completed","output":[{"dummy":"landing"}]}, ...}`.
   Renumber the following `after-action` observation from `seq:17` to `seq:16`. Keep its
   `at`, label, and value unchanged; keep the navigation frame, action markers, probe
   observations, and cleanup fields unchanged.
2. In `corpus/evidence/round-21/runtime/receipt.json`, set that case's
   `after.responses` to `[]` and update `evidence.sha256` to the new evidence digest.
   Keep `preAction.responseCount:0`, `preAction.windowMs:253`, `after.windowMs:503`,
   `after.end`, `after.submits:null`, `after.navigations`, and `after.pageState` unchanged.
3. In `.ufo/waves/round-21/runtime-execution-finalized.json`, update
   `artifacts["corpus/evidence/round-21/runtime/na-native-submit.json"]` to the new
   evidence digest and `receiptSha256` to the new receipt digest. Do not change the
   fixture or its digest.
4. Do not touch the corrected note row (line 35 still describes the original Completed
   observation). This keeps the mutation a pure evidence-graph mutation; updating the
   note would rewrite historical knowledge and is outside this test.

Why the old structural count still passes (source: `.ufo/waves/round-21/measure-c1.mjs`):

- Line 124 collects correlated `toolResponded` frames into `events`; line 126 requires
  only that `invoked.length === 1` and that no event precedes `toolInvoked`. It imposes
  no minimum event count, no status, and no output check. With the frame deleted,
  `events` is empty and the condition is false (`events.some(...)` is false).
- Lines 124-139 never read `params.status`, `params.output`, or any `errorText`
  (confirmed by grep: the only `.status` use is the external process status at line 146).
- Line 138 checks only `after.windowMs >= 500`, `after.end === post.at`, and
  `after.start <= action.at`; the unchanged 503/end/start still satisfy them.
- Line 139 compares `after.responses` to `events` before `post.seq` (now `[]` equals
  `[]`), `after.pageState` to the unchanged post value, `after.submits` to
  `Array.isArray(post.value.submits) ? ... : null` (still null), and `after.navigations`
  to the unchanged navigation frame. All pass.
- Line 137 skips the post-action nonce echo when `c.action === 'submit'`, so the
  landing page's missing nonce is not checked.
- Lines 140-141 cleanup/boundary checks are unchanged.
- The case still contains the `na-native-submit` backticked token required by
  `case_shape`, so `note_missing` is unaffected.

Expected old result: value remains 12, verdict `clean`, exit 0 — an invocation with no
outcome at all is counted exactly like a semantically checked Completed row.

What the new oracle must reject: `semantic_status` (no `Completed` response) and
`semantic_output` (missing literal `[{"dummy":"landing"}]`); also `semantic_timing`
(no outcome within the finite after window). The fixed expectation prevents treating
this as pending: pending is `na-pending`, while `na-native-submit` expects Completed.

Why this is coherent rather than an incidental stale-hash failure: the evidence, receipt
summaries, and execution artifact digests are updated together; the fixture, invocation,
navigation, timing windows, and cleanup remain mutually consistent; all summary fields
are recomputed from the mutated raw frames. The record is structurally consistent and
semantically false.

Related admitted variant (not the named mutation): because status and output are never
read, replacing `Completed` with `Canceled`/`Error`, or replacing the output array with
the fixture handler's `{ok,nonce,q}` object while keeping one response event, also passes
the old count after the same digest-link updates. The new oracle must reject those via
`semantic_status`, `semantic_output`, and `semantic_error`. This is why the oracle cannot
treat "one response exists" as sufficient.

## 5. Remaining unknowns and limits

- The landing document body is not a retained per-case file; the output literal is
  observed, and its JSON-LD provenance is supported by the pinned producer (`:135-137`),
  not by a captured HTTP response. The oracle asserts the literal, not a re-parse.
- The action marker only names `submit`; `HTMLFormElement.submit()` is inferred from the
  producer line and corroborated by navigation + landing output + missing handler value.
  The oracle must not claim a universal fact about submit-event dispatch beyond this
  retained record.
- Pre-action observation and action marker share `at` 1792590710183; strict wall-clock
  order is not attested, so ordering must be by frame sequence.
- `browserPidsAtClose` equality to `browserPidsBefore` and the count 9 are observed
  acquisition facts, not semantic guarantees; do not pin the count in the oracle.
- No test was written or run, per assignment. No production file was modified; this
  report is the only write.

Report: .ufo/waves/round-22/w1/Raw04.md
