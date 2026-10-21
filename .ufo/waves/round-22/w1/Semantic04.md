# Semantic04 — na-native-submit adversarial semantic review (round 22, W1)

Seat: TabiR22.Semantic04 (read-only reviewer, leaf — no subagent dispatch). Scope: the retained
`na-native-submit` case only, actual raw+receipt against the proposed round-22 oracle API
(`evaluate(files)` → `{schema, metric:'c1_semantically_checked_lifecycle_rows', value, …, findings, rows}`;
stable findings `semantic_status/semantic_output/semantic_error/semantic_timing/semantic_navigation/
evidence_binding/case_set/source_binding/input_shape/revision_input`; exit 0/1/2). No edits, no tests,
no browser, no installs, no VCS writes. The old structural counter
`.ufo/waves/round-21/measure-c1.mjs` is read as frozen context only, never as outcome oracle.
Baseline `5f585773258b33d2d514b00cd0b0775333578db6` verified present and is HEAD
(`git cat-file -t` → `commit`; `rev-parse HEAD` → same). Only this report was written.

## 1. Files inspected and observed identity

| Path | Role | sha256 [OBSERVED: `sha256sum`] |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-native-submit.json` | case evidence, 17 frames, 2 page observations | `28a20412dc11d4d1ed690b4d80414a359193db491518b32277cff5a12eebc9b5` |
| `corpus/evidence/round-21/runtime/na-native-submit.html` | fixture, mode constant `"success"`, no `toolautosubmit` | `c95abb9cca63862ad93d580ba121d2aa398d97710b1c7d22692aba3cd2dad186` |
| `corpus/evidence/round-21/runtime/receipt.json` | receipt, 12 cases, schema `tabi-round21-runtime-v1` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` |
| `scripts/webmcp-lifecycle-round21.mjs` | producer claim (no new producer claim made here) | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` |

Each digest is triple-bound: computed on disk, and equal in the receipt row
(`receipt.json:247-250`), and in the execution artifacts map / `receiptSha256`
(`.ufo/waves/round-21/runtime-execution-finalized.json:28-29,47`). Environment pinned
`node v24.21.0 / chromium 154.0.8037.97 / playwright 1.64.0` (`receipt.json:12-25`);
`cleanup {browserClosed:true, serverClosed:true}` (`receipt.json:681-684`). Producer stdout for
this row: `LIFECYCLE_OBSERVED na-native-submit pre=0 statuses=Completed` (execution
`:17`). `corpus/evidence/round-22/semantic-expectations.json` and
`.ufo/waves/round-22/measure-c1.mjs` were absent in production and in
`.ufo/waves/round-22/clones/BuildOracle/` at review time; this review therefore binds the
proposed API + independently derived outcome, and §3 is the row BuildOracle's file must match.

## 2. Independently derived accepted outcome (no author witness)

Identity: `id na-native-submit`, `nonce 8a5839ad-fc49-4ed6-8661-501aa2c5c4a4`,
`autosubmit false`, `action "submit"`, `mode "success"` (evidence header
`na-native-submit.json:3-7`; receipt row `receipt.json:187-190`; CONFIG row
`[false,'submit','success']`, `.ufo/waves/round-21/measure-c1.mjs:13`). `invocationId
0950796B8BFFB4979B8CA2A0ABE34A66`, `invokeError null` (`receipt.json:191-192`).

Mechanism [OBSERVED in artifacts, not from the note]: the producer dispatches the native case
with `page.evaluate(() => document.querySelector('#f').submit())`
(`scripts/webmcp-lifecycle-round21.mjs:215`). An imperative `form.submit()` fires no `submit`
event, so the fixture's listener (which would `preventDefault()` and `respondWith`) never runs.
Three independent observations prove this from the retained bytes alone: (a) the browser
navigated to the form action although the unexecuted listener contains `preventDefault()`;
(b) the post observation value has **no** `submits`/`errors`/`nonce` keys (the listener that
would have populated them never ran, and the document was replaced); (c) the terminal output is
the landing document's declarative JSON-LD object, not the fixture's `respondWith` value
`{ok:true,nonce,q}`. The landing route serves
`<script type="application/ld+json">{"dummy":"landing"}</script>`
(`scripts/webmcp-lifecycle-round21.mjs:135-139`), which the native submission path returns as
the tool output array.

Frame timeline [OBSERVED, `na-native-submit.json`], `at` in ms:

| seq | at | frame |
|---|---|---|
| 3 | 1792590709922 | `Page.frameNavigated` → `http://127.0.0.1:43143/na-native-submit`, loaderId `FBB71EFC87ABEFB92ABCD8A0D73EB280` |
| 5 | 1792590709930 | `WebMCP.toolsAdded` — exactly one, tool `lifecycle` |
| 9 | 1792590709930 | sent `WebMCP.invokeTool`, `input {q:<nonce>}`, frameId `3F62022BA8EB4F1C7A8BAD21B535C727` |
| 10 | 1792590709930 | result `invocationId 0950796B8BFFB4979B8CA2A0ABE34A66` |
| 11 | 1792590709931 | `WebMCP.toolInvoked`, parsed input deep-equals sent input |
| 12 | 1792590710183 | observation `pre-action`: `submits []`, `errors []`, url `/na-native-submit`, `formExists true`, `formActive true`, `value <nonce>`, `focused "go"` |
| 13 | 1792590710183 | action `submit` / `dispatch-started` |
| 14 | 1792590710184 | action-complete `submit` |
| 15 | 1792590710190 | `Page.frameNavigated` → `http://127.0.0.1:43143/landing?q=<nonce>`, same frameId, new loaderId `F10DC0860EC568D9B6A6B51607869230` |
| 16 | 1792590710196 | `WebMCP.toolResponded`: `{invocationId, status:"Completed", output:[{"dummy":"landing"}]}` — no `errorText` key |
| 17 | 1792590710686 | observation `after-action`: url `/landing?q=<nonce>`, `secureContext true`, `formExists false`, `formActive false`, `value null`, `focused ""`; **no `submits`/`errors`/`nonce` keys** |

Whole-trail frame inventory: 17 frames, seq 1..17 dense, `at` nondecreasing; exactly one
`toolsAdded`, one `invokeTool` sent, one matching result, one `toolInvoked`, **exactly one**
`toolResponded` for the invocationId in the entire file (seq 16, not merely before post),
exactly two `Page.frameNavigated` (seq 3, seq 15), zero `toolsRemoved`, zero `release`, zero
`error`-dir frames. Receipt windows: `preAction {start 1792590709930, end 1792590710183,
windowMs 253, responseCount 0, formActive true}`; `after {start 1792590710183, end
1792590710686, windowMs 503, responses [the seq-16 payload], submits null, navigations [the
seq-15 params], pageState = post value}` (`receipt.json:193-246`). The receipt request log holds
`GET /na-native-submit` at `1792590709919` (before `preAction.start`) and the campaign's only
`GET /landing?q=8a5839ad-…` at `1792590710188`, inside the after window
(`receipt.json:700-711`). Cleanup: `browserPidsBefore` = `browserPidsAtClose` (same 9 pids),
`browserPidsAfter []`, `browserPidsSeenAfterClose []`, `contextClosed true`, `blocked []`,
`downloads []`, 9 process identities with start ticks, no `closeError`
(`na-native-submit.json:265-386`).

Exact accepted semantics the expectation row must pin:

1. Status literal `"Completed"`; payload keys exactly `{invocationId, status, output}`;
   `errorText` key absent (`Object.hasOwn(params,"errorText") === false`, not merely
   `== null`); `invokeError === null`.
2. Output deep-equals `[{"dummy":"landing"}]`: an array (not object), length exactly 1, single
   object with exactly key `dummy` = `"landing"`. This is the landing document's declared
   output — **not** the fixture's `respondWith` value, which is dead code on this path.
3. Old-document page observability is destroyed: post value must have **no** `submits`,
   `errors`, or `nonce` keys, and receipt `after.submits === null` (the producer's
   null-coalescing at `scripts/webmcp-lifecycle-round21.mjs:226`). `[]` is a different,
   fabricated state.
4. Exactly one landing navigation inside the after window, URL path `/landing` with query
   `q === <nonce>` (binds the navigation to this invocation's input; do not freeze port
   `43143` — parse path+query). Post url path/query identical. Exactly one matching request
   entry in `receipt.requests` inside `[after.start, after.end)`.
5. Finite windows: `preAction.windowMs === end-start ≥ 250`, `preAction.end === pre.at`,
   `responseCount 0`, `sent.at ≤ preAction.start`; `after.windowMs === end-start ≥ 500`,
   `after.end === post.at`, `after.start ≤ action.at` (observed equal at `…183`; equality is a
   same-ms coincidence of `scripts/webmcp-lifecycle-round21.mjs:206,211`, not a law);
   `nav.seq < responded.seq < post.seq` with both `at ∈ [after.start, after.end)`. The
   navigation **precedes** the response — output can only be extracted after the landing
   document commits [necessity INFERENCE from output provenance; the order itself is OBSERVED].
6. Pre state: `formActive true`, `formExists true`, `value === nonce`, `focused "go"`,
   `submits []`, `errors []`, url path `/na-native-submit`, `secureContext true`.
7. Bindings: evidence/fixture digests as in §1; fixture contains the nonce and has no
   `toolautosubmit`; note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` first line
   begins `source: S101 — corpus/evidence/round-21/runtime/receipt.json …` [OBSERVED]; no new
   producer claim. The fixture's `mode="success"` constant must not be read as the outcome
   source for this case (dead branch); the fixture digest pins it, nothing more.

Distinctiveness within the fixed 12: `na-native-submit` is the only case with non-empty
`after.navigations`, `after.submits === null`, a changed post URL path, an array output, and
nav-before-response ordering. `formExists:false + value:null + focused:""` alone is shared with
`na-remove` (`receipt.json:296-338`, same-document observation with `submits []`/`errors []`
keys present) and cannot discriminate alone.

## 3. Proposed expectation fragment (independent specification, not the final file)

```json
{
  "id": "na-native-submit",
  "autosubmit": false,
  "action": "submit",
  "mode": "success",
  "expected": {
    "status": "Completed",
    "payloadKeys": ["invocation", "status", "output"],
    "output": { "present": true, "deepEqual": [{ "dummy": "landing" }] },
    "error": { "errorTextKeyAbsent": true, "invokeError": null, "pageErrorKeysAbsent": true },
    "invocation": { "toolName": "lifecycle", "input": { "q": "<nonce>" }, "invokeError": null },
    "pre": { "submits": 0, "errors": 0, "formActive": true, "formExists": true,
             "secureContext": true, "focused": "go", "value": "<nonce>", "urlPath": "/na-native-submit" },
    "post": { "keysAbsent": ["nonce", "submits", "errors"], "urlPath": "/landing",
              "urlQuery": { "q": "<nonce>" }, "secureContext": true, "formExists": false,
              "formActive": false, "value": null, "focused": "" },
    "receipt": { "afterSubmits": null, "landingNavigations": 1, "landingRequestsInWindow": 1 },
    "windows": { "preActionMsMin": 250, "afterMsMin": 500, "preResponses": 0,
                 "navBeforeResponse": true, "responseInAfterWindow": true },
    "trail": { "toolRespondedTotal": 1, "toolInvokedTotal": 1, "frameNavigatedTotal": 2,
               "toolsAddedTotal": 1, "toolsRemoved": 0, "releaseFrames": 0, "errorFrames": 0 },
    "cleanup": { "contextClosed": true, "browserPidsAfterEmpty": true,
                 "browserPidsSeenAfterCloseEmpty": true, "blockedEmpty": true,
                 "downloadsEmpty": true, "serverClosed": true }
  }
}
```

`<nonce>` substituted from the case identity at evaluation time; everything else literal.
Mapping: 1→`semantic_status`; 2→`semantic_output`; 3+error half of 1→`semantic_error`; 5→
`semantic_timing`; 4→`semantic_navigation`; 7→`evidence_binding`/`source_binding`/
`case_set`/`input_shape`/`revision_input`. `semantic_delayed` is not applicable: no
`release` frame may exist in this trail and no delayed-release evidence may justify the
terminal.

## 4. False-positive risks — minimal coherent mutations the old count admits

Every mutation below keeps the round-21 counter at 12/clean because its checks never read
outcome literals: `event_identity` (`.ufo/waves/round-21/measure-c1.mjs:125-129`) only counts
correlated frames; `summary_mismatch` (`:139`) deep-equals `after.*` against the same mutated
evidence; `window_mismatch`/`order_mismatch` never order navigation vs response; `case_identity`
reads `e.mode` from the evidence header, not the fixture text or the outcome. Digest-chain
updates (case row `evidence.sha256`, execution artifacts entry, `receiptSha256`) are part of
each mutation and keep `evidence_digest`/`execution_binding` green.

- **M1 object-collapse (the note's named reject).** `output [{dummy:"landing"}]` →
  `{ok:true,nonce:"8a5839ad-…",q:"8a5839ad-…"}`; mirror `after.responses`. The row becomes
  indistinguishable from `na-click`/`na-requestsubmit` success semantics. Must fire
  `semantic_output` (array shape + landing literal).
- **M2 status flip.** `Completed`→`Error` + fabricated `errorText` + delete `output`. Must fire
  `semantic_status`+`semantic_output`+`semantic_error` (errorText must be *absent*, and the
  reject diagnostic is a different case's literal).
- **M3 silent terminal.** Delete frames seq 15+16, set `after.responses=[]`,
  `after.navigations=[]`. `events.some(seq<=invoked)` is false and both summaries collect `[]`
  — green. The row becomes pending-like. Must fire: exactly one whole-trail `toolResponded`
  (`semantic_status`) and exactly one landing navigation (`semantic_navigation`).
- **M4 window escape.** Relocate the `toolResponded` frame after the post observation
  (renumber, later `at`), mirror `after.responses=[]`. Old summary only collects events before
  `post.seq` — silent. Must fire `semantic_timing` (`responded.seq < post.seq`, `at <
  after.end`).
- **M5 nav/response order flip.** Swap payloads of seq 15/16 keeping monotone `at` (respond at
  `…190`, navigate at `…196`), mirror both summaries. All structural checks stay green; the
  recorded response then precedes the landing navigation, which contradicts output provenance.
  Must fire `semantic_timing` (`nav.seq < nav-responded` ordering).
- **M6 query strip.** Landing URL loses `?q=<nonce>` in seq 15, post `pageState.url`, and
  `after.navigations[0]`. No structural check reads URL content — silent. Must fire
  `semantic_navigation` (`q === nonce` binding).
- **M7 navigation erasure.** Rewrite seq 15 to the case path (or drop the frame) and post
  `pageState.url` to `/na-native-submit`, keeping `formExists:false, value:null` (a
  remove-looking state), mirror `after.navigations`. No cross-check of `pageState.url` against
  recorded navigations exists — silent. Must fire `semantic_navigation` (landing navigation
  required; post url path `/landing`).
- **M8 null-to-empty collapse (the note's named reject).** Add `submits:[], errors:[],
  nonce:"8a5839ad-…"` keys to the post value and set `after.submits=[]`/`after.pageState`
  to match. `Array.isArray(post.value.submits)` now yields `[]` and mirrors — silent.
  Fabricates observability the navigation destroyed. Must fire `semantic_error`/
  `semantic_status` post-state clauses (`keysAbsent`, `after.submits === null`).
- **M9 cross-case outcome swap native↔remove.** Exchange the two `toolResponded` payloads and
  the two post pageStates (url `/landing`↔`/na-remove`, navigations, submits) with full digest
  chains. Each case's summary still deep-equals its own mutated evidence — silent. Per-case
  literals in §3 reject it.

## 5. False-negative risks — template traps that would fail the genuine acquisition

- **T1** Expecting `output {ok:true,nonce,q}` (copied from `na-click`/`na-requestsubmit`,
  `receipt.json:79-84,143-148`) — the genuine native output is the landing array
  (`receipt.json:207-212`).
- **T2** Expecting `post.submits` to hold one `{agentInvoked,isTrusted,q,active,respondWith}`
  record (click/requestsubmit/reject shape) — the key is absent after navigation.
- **T3** Expecting `post.submits === []` (reset/remove shape) — absent ≠ empty;
  `after.submits` must be `null`, not `[]`.
- **T4** Expecting `page errors []` present — key absent in the post value.
- **T5** Expecting `urlUnchanged` / `navigations:[]` / "no `/landing` request in the window"
  (every other non-autosubmit row) — inverted for this case; the navigation is the semantics.
- **T6** Expecting `focused:"go"` post — genuine post value is `""`.
- **T7** Expecting the nonce echo in the post value — absent; the old counter itself skips the
  nonce-echo check exactly when `action==='submit'` (`.ufo/waves/round-21/measure-c1.mjs:137`).
- **T8** Requiring response-before-navigation (a natural template from suppress-navigation
  rows) — genuine order is nav seq 15 (`…190`) before response seq 16 (`…196`).
- **T9** Byte-pinning the full post URL including port `43143` — bind path+query only; the port
  is acquisition-specific (same point as Raw05 for `na-reset`).
- **T10** Deriving the expected output from the fixture's `mode="success"` constant — dead code
  on this path (§2); fixture digest binding suffices, fixture-mode→outcome derivation is
  invalid for `submit` action.
- **T11** Requiring `preAction.start === sent.at` or `after.start === action.at` equality —
  holds here only as same-ms coincidence of producer timestamps (`:206,:211`); assert the
  inequalities of §2.6 instead.
- **T12** Treating `formExists:false + value:null + focused:""` as sufficient native
  identification — identical triple exists in `na-remove` with keys present and url unchanged;
  the discriminating spine is navigation + landing-array output + `submits === null` +
  `Completed`.

## 6. Observed vs inference; residual risk and verification gaps

- [OBSERVED] every literal, hash, frame, window, request, and cleanup value in §1-§2 was read
  from the retained bytes at the baseline revision; digests recomputed with `sha256sum` and
  cross-bound to the receipt row and the execution artifacts map. No check was executed, no
  semantic value was recomputed from the evaluated receipt's own summaries (the §3 literals are
  fixed data; `<nonce>` is the only identity substitution).
- [INFERENCE] the necessity (not merely the occurrence) of nav-before-response, from output
  provenance (landing JSON-LD extraction requires landing commit); and that `form.submit()`
  fires no `submit` event, from the three mutually consistent observed facts in §2 — the C++
  path itself is outside this seat's scope (S100 anchors belong to the author-side record).
- Gaps: (a) BuildOracle's final `corpus/evidence/round-22/semantic-expectations.json` and
  `.ufo/waves/round-22/measure-c1.mjs` did not exist at review time; §3 is the binding row to
  diff against, including the `payloadKeys`/`keysAbsent`/`afterSubmits:null` strictness that
  M1/M5/M8 exploit if loosened. (b) Whether the new measure requires a SKILL.md backlink for
  the *new* note path (the old counter checked only the old note) is BuildOracle's design
  choice; not invented here. (c) `errorText` strictness must be key-absence, not `== null` —
  a `null`-valued key on a Completed payload is unobserved in this acquisition and should fail
  rather than normalize. (d) The single retained acquisition cannot prove no other Completed
  shape exists on other builds; the oracle is finite and build-pinned by design (note:
  "a different build/acquisition needs independently reviewed expectations").
