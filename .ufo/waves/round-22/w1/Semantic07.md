# Semantic07 — na-reject adversarial semantic review

Scope: `na-reject` only. Read-only: no edits, no tests, no builds, no linters, no browser, no network, no installs.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Paths below are relative to it unless absolute.

Proposed API as it exists now:
- BuildOracle draft `corpus/evidence/round-22/semantic-expectations.json`, present only in the private clone `.ufo/waves/round-22/clones/BuildOracle/` (read 11:58). The lane has no `corpus/evidence/round-22/`.
- `measure-c1.mjs` for round 22 does not exist in the lane or in any clone. Every "predicted" result below is a static reading of text and code, not an execution. Points that depend on the unwritten implementation are tagged [INFERENCE].
- Lane note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (read 11:56; na-reject row at line 43).
- `SKILL.md:2408–2435` (round-22 decision table and registry) and the round-22 spec context.

Axes reviewed: status · output · error · timing/sequence · navigation/delayed · binding.

## 1. Bottom line

1. **Accepted outcome, derived from retained bytes without the witness:** Error from a declarative `respondWith` rejection. `status` = `Error`; `errorText` = exactly `respondWith promise was rejected`; no `output` or other payload key; exactly one terminal response for invocation `DAB4A9A79B522E21D49C7D2737F56E7E`, inside the action-to-after window; no navigation; no release or delayed markers.
2. The BuildOracle draft `na-reject` entry matches every predicate for the retained row (§3). It is **not sufficient as written**. Nine coherent mutations (FP-1…FP-9, §4) are accepted by the draft unless the implementation adds rules the draft does not state. FP-1 (second terminal response) and FP-2 (payload on an Error response; the note's own refusal list names it) are High.
3. One binding defect exists now: draft `sourceHeader` ≠ note line 1 (FN-2).
4. The frozen structural counter `.ufo/waves/round-21/measure-c1.mjs` never reads `status`, `errorText`, `output`, `requests`, `exception`, release markers or `agentInvoked` (grep-verified). It admits the all-silent control and every coherent mutation in §4.

## 2. Accepted outcome from retained bytes

Digests recomputed with `sha256sum`:

| File | sha256 | Bound by |
|---|---|---|
| `corpus/evidence/round-21/runtime/na-reject.json` | `a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741` | receipt case `evidence`; execution `artifacts`; witness |
| `corpus/evidence/round-21/runtime/na-reject.html` | `eb23b95526f9cea2dbf73b58e0b5f36b596d61fd361d8e41a1bf30fb6eb7f658` | raw `fixture.sha256`; draft `fixtureSha256` |
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | execution `receiptSha256` |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | witness `acquisitionSha256` |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | receipt `producer`; execution; draft |
| `.ufo/waves/round-21/sources/html_form_element.cc` (S100 body) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | S100 decoded sha |

Trail of `na-reject.json` (`frames`, 16 entries, seq 1–16 contiguous; `at` is Node-side `Date.now()` at push, `scripts/webmcp-lifecycle-round21.mjs:163`):

| seq | at (ms) | frame | content |
|---|---|---|---|
| 3 | 1792590712722 | `Page.frameNavigated` | initial load; no later navigation event in the trail |
| 9 | 1792590712731 | sent `WebMCP.invokeTool` (cmd 4) | `input.q` = `8e99a921-6728-42cd-82ed-30cd46cf238f` |
| 10 | 1792590712732 | result | `invocationId` `DAB4A9A79B522E21D49C7D2737F56E7E` |
| 11 | 1792590712732 | event `WebMCP.toolInvoked` | same id; `input` string equals sent input |
| 12 | 1792590712985 | observation `pre-action` | formActive true; formExists true; submits []; errors []; value = nonce; focused `go`; url `/na-reject` |
| 13 | 1792590712985 | action `dispatch-started` | `requestSubmit` |
| 14 | 1792590712986 | action-complete | `requestSubmit` |
| 15 | 1792590712986 | event `WebMCP.toolResponded` | params keys exactly `invocationId`, `status`=`Error`, `errorText`=`respondWith promise was rejected`; no `output` |
| 16 | 1792590713487 | observation `after-action` | submits: one `{agentInvoked:true, isTrusted:true, active:true, respondWith:"function", q:nonce}`; errors `["Uncaught Error: dummy rejection"]`; formActive false; same nonce; url unchanged |

Derived facts:
- Windows: pre = 253 ms (invoke result → pre marker; its start is producer `preStart`, not a raw frame). After = 502 ms (action → after marker). The response arrives 1 ms after dispatch start and 501 ms before the after marker.
- The invocation id appears in exactly seq 10, 11 and 15. There is one `toolResponded` for it in the whole trail.
- No frame follows seq 16. The same holds for all 12 retained cases (count check), and every case has at most one `toolResponded` per invocation.
- No `Page.frameNavigated` after seq 3. Receipt `requests`: GET `/na-reject` at 1792590712720, next GET `/na-throw` at 1792590713651, and no `/landing` request carrying this nonce. The after observation is the same document (same nonce, submit recorded in it) at the unchanged URL.
- Cleanup: 9 browser PIDs before and at close, identical start ticks; none after; `contextClosed` true; `blocked` and `downloads` empty.
- Cross-check: the receipt case, the witness entry (`preWindowMs` 253, `afterWindowMs` 502, `preResponseCount` 0, `responses`, `markers`, `postSubmits`, `postUrl`, `postNoncePresent`, cleanup 9→0), execution stdout (`LIFECYCLE_OBSERVED na-reject … statuses=Error`) and note row 38 all agree with the raw. They copy the raw; they are not independent corroboration.
- Git: the witness revision `2d5eaaa3c8317bce31e1180b49df4516db35d44b` is an ancestor of HEAD `5f585773258b33d2d514b00cd0b0775333578db6`. The na-reject raw, html and receipt are byte-identical at 2d5eaaa and HEAD (sha match in both).

Source correspondence (S100 body; line numbers as in the retained file):
- 295–297: running guard in `HandleWebMcpToolResponse`.
- 787–788: `declarative_webmcp_call = executing_tool && CurrentlyRunning()`.
- 790–794: take the respondWith promise; `CHECK(!should_submit)`.
- 798–806: bind the promise to `HandleWebMcpToolResponse` with `resolved=true` and `resolved=false`.
- 320–327 (rejection arm): `ReportException(value)` (this is the page-visible `Uncaught Error: dummy rejection`), then `CallDoneCallback(unexpected(kToolInvocationFailed, "respondWith promise was rejected"))`. The reason never enters the tool error.
- 807–813 is a different fixed literal (programming error). So the na-reject literal is reachable only through line 326. Under the S100 interpretation, this literal discriminates reject from throw and from invalid-submit without relying on status. Source interpretation only; no binary equivalence is claimed (the note says so).

Not observed by CDP: `preventDefault()` and handler order. The raw has no `defaultPrevented` field. They come from fixture bytes (pinned by `eb23b955…`) and from the absence of any landing navigation [INFERENCE]. The SKILL row at `SKILL.md:2376` ("retain handler ordering") cannot be met from the raw alone.

## 3. Draft entry vs retained row (static)

Draft entry: `cases[id=na-reject]` in the clone draft. Every predicate holds for the retained row:
- `autosubmit` false (`na-reject.json`:5); `action` `requestSubmit` (seq 13); `mode` `reject` (`na-reject.json`:7); `inputQ` = nonce (seq 9); `fixtureSha256` = `eb23b955…` (matches the html).
- `response`: `status` `Error` (seq 15), `errorText` exact.
- `responseWindow` `action-to-post`: seq 13 < 15 < 16.
- `pre`: minMs 250 ≤ 253; formActive true; formExists true; value = input; submitCount 0; statuses []; errors []; focused `go`; urlPath `/na-reject`; urlSearch "".
- `post`: minMs 500 ≤ 502; formActive false; formExists true; value = input; submitCount 1; statuses `["Error"]`; errors `["Uncaught Error: dummy rejection"]`; focused `go`; urlPath `/na-reject`; urlSearch "".
- `navigation` `none`: §2 evidence.

The row is accepted. The risks are in what the draft does not pin.

## 4. Risks with minimal coherent mutations

"Coherent" means raw and summary are edited together. Re-link set R = receipt `cases[na-reject].evidence.sha256` → receipt file sha → `.ufo/waves/round-21/runtime-execution-finalized.json` `artifacts[...]` for each edited file, plus `receiptSha256`. Old-counter predictions cite `.ufo/waves/round-21/measure-c1.mjs` line numbers.

**FP-1 (High) — second terminal response passes window-scoped statuses.**
- A (trailing): append to `na-reject.json` `frames` seq 17 `{"seq":17,"at":1792590713600,"dir":"event","method":"WebMCP.toolResponded","params":{"invocationId":"DAB4A9A79B522E21D49C7D2737F56E7E","status":"Completed","output":{"ok":true,"nonce":"8e99a921-6728-42cd-82ed-30cd46cf238f","q":"8e99a921-6728-42cd-82ed-30cd46cf238f"}}}`. Receipt unchanged (the window ends at post seq 16). Re-link R.
- B (in-window duplicate): insert the same event at seq 16 with `at` 1792590712986; renumber the after observation to 17 (and `pageObservations[1].seq`); append the Completed entry to receipt `after.responses`. Re-link R.
- Old counter: A and B pass. Line 118 (contiguity, `at` monotonic) holds. Line 139 compares only `seq < post.seq`, so A is invisible and B is coherent. No status is read.
- Draft: A passes (window-scoped). B passes if statuses are compared with `includes`; red only with exact array equality [INFERENCE].
- Fix: exact array equality for statuses, and a trail-wide predicate `toolRespondedForInvocation: 1` over all frames. The retained data satisfy it in all 12 cases.

**FP-2 (High) — payload on an Error response.** This is the note's named refusal ("adding success output", note line 43).
- Variants: (a) `"output":{"ok":true,"nonce":"8e99…","q":"8e99…"}` in seq 15 params and receipt `after.responses[0]`; (b) `"output":null`; (c) an `"exception":{"subtype":"error","className":"Error","description":"Error: dummy rejection"}` key. Re-link R.
- Old counter: all pass. Line 139 compares to the coherent summary; no output or status is read.
- Draft: no output or key-set predicate, so (a) and (c) pass and (b) passes any nullish test [INFERENCE].
- Source support: S100:324–326 (Error path carries only the fixed literal), S100:322–323 (the reason goes only to `ReportException`). Round-17 imperative error records show `errorText ""` plus an `exception` object (`corpus/knowledge/webmcp-invocation-round-17.md:51–52`). That the `exception` key is a CDP response field is [INFERENCE].
- Fix: `response` `{status:"Error", errorText:"respondWith promise was rejected", output:"absent", keys:["invocationId","status","errorText"]}`; test own-property presence (`Object.hasOwn`), never nullish. SKILL.md:2417 promises "fixed case-specific status/output/error predicates"; the na-reject draft has no output predicate.

**FP-3 (Medium; depends on matching strength) — error text matched loosely.**
- A: seq 15 `errorText` := the na-throw literal `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` (copy of na-throw seq 15). Re-link R.
- B: `errorText` := `""`. Re-link R.
- Old counter: both pass (errorText is never read).
- Draft: both red with `===`. A passes `includes('respondWith')`. B passes falsy or optional checks. Round-17 imperative error shape has empty `errorText`, so accepting `""` would merge the two paths.
- Fix: `===` only; no `includes`, prefix or falsy test for this row.

**FP-4 (Medium) — submit identity not pinned.**
- Mutation: `agentInvoked` := false (optionally also `active` := false) in `pageObservations[1].value.submits[0]`, in the seq 16 observation value, and in receipt `after.submits[0]` and `after.pageState.submits[0]`. Re-link R.
- Old counter: passes. Line 137 checks nonce and value only; line 139 compares to coherent copies.
- Draft: `submitCount` 1 only, so it passes.
- Basis: corrected note decision rule 4 (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:92–93`): `agentInvoked` is the attribution fact. [INFERENCE] The reject path (S100:787–806) does not test `agentInvoked`, so a page-script submit during a running tool would produce the same response. The row is about the agent-invoked path.
- Fix: pin `submits[0]` = `{agentInvoked:true, active:true, respondWith:"function", q:"$nonce"}`. `isTrusted` stays as recorded. No stable finding name currently owns submit identity; decide the owner.

**FP-5 (Medium) — release marker in a non-delayed row.**
- Mutation: insert `{"seq":16,"at":1792590713000,"dir":"release"}` after seq 15; renumber the after observation to 17 (and `pageObservations[1].seq`). Re-link R.
- Old counter: passes. It has no release check; lines 136 count only action, action-complete and the two observations; contiguity holds after renumbering.
- Producer: `release` and `delayed-before-release` are emitted only when `mode === 'delayed'` (`scripts/webmcp-lifecycle-round21.mjs:223`).
- Draft: no markers or release predicate, so it passes unless an implicit rule exists [INFERENCE].
- Fix: `markers: []` (or explicit `release:"absent"`, `delayedObservation:"absent"`) for na-reject.

**FP-6 (Medium) — response placed before the dispatch marker.**
- Mutation: move the `toolResponded` frame to seq 13 with `at` 1792590712985. Old 13 (action) becomes 14 and old 14 (action-complete) becomes 15; the after observation stays 16. Summary unchanged.
- Old counter: passes. Line 136 holds (10 < 12 < 14 < 15 < 16); line 139 gives responseCount 0 (seq < 12) and `after.responses` includes the response (seq < 16).
- Draft: `pre.statuses` [] and `post.statuses` `["Error"]` both hold. Passes if the `action-to-post` lower bound is the pre marker or action-complete. Red only if the lower bound is the dispatch-started marker [INFERENCE].
- Producer invariant: `frame('action', …)` (`scripts/webmcp-lifecycle-round21.mjs:220`) is pushed in the same synchronous block as the action call (:211–219), before any CDP event can be processed. In any genuine trace on this path, response seq > dispatch-started seq.
- Fix: `responseWindow` = (dispatch-started.seq, post.seq), exclusive. Unify it with `post.statuses` so there is one window definition.

**FP-7 (Medium) — `toolInvoked` placed after the pre observation.**
- Mutation: swap seq 11 (`toolInvoked`) and seq 12 (pre observation); set the `toolInvoked` `at` to 1792590712985 (tie); `pageObservations[0].seq` := 11. Re-link R.
- Old counter: passes. Line 136 does not order `toolInvoked`; line 126 checks responses against `toolInvoked` only; monotonic `at` holds with ties.
- Draft: `pre.formActive` true and `pre.statuses` [] hold, so it passes.
- Basis: formActive true at pre needs a running tool (`:tool-form-active`; S100:787–788 `CurrentlyRunning()`). Corrected note rule 2 (lines 86–88) requires a pre-action active state recorded before the action; a state seen before the invocation does not qualify.
- Fix: cross-field predicate `pre.formActive ⇒ toolInvoked.seq < pre.seq`; full seq order invoke-result < toolInvoked < pre < dispatch < response < after.

**FP-8 (Low) — summary window drift.**
- Mutation: receipt `cases[na-reject].after.start` := 1792590712900 and `after.windowMs` := 587 (raw unchanged). Re-link R.
- Old counter: passes. Line 138 checks only `after.start ≤ action.at`, `windowMs = end − start` and `end = post.at`.
- Draft: `post.minMs` 500 ≤ 587, so it passes.
- Fix: require `action.at − after.start` within a small tolerance (producer sets `actionAt` at `:211`, the action frame at `:220`, same synchronous block). Apply the same to `preAction.start` against the invoke result (`:185`, `:206`).

**FP-9 (Low) — server request log not checked for navigation.**
- Mutation: receipt `requests` += `{"at":1792590713000,"method":"GET","url":"/landing?q=8e99a921-6728-42cd-82ed-30cd46cf238f"}` (receipt only). Re-link R.
- Old counter: passes (`requests` never read).
- Draft: navigation `none` and post `urlPath` `/na-reject` both hold, so the conflicting server-side landing request goes unflagged.
- Fix: add an in-window request check to the navigation predicate. The same-document post observation already catches a real navigation, so this is defence in depth.

**FN-1 (Medium; implementation pitfall) — timestamp ties in the genuine row.**
- Equal `at` pairs: seq 10/11 (…712732), seq 12/13 (…712985), seq 14/15 (…712986). `after.start` = `pre.end` = action `at` = …712985.
- A strict `<` on `at`, or ordering by `at`, rejects the genuine row. Order by seq. Use `at` only for non-decreasing checks (old line 118) and window arithmetic.
- `at` is Node arrival time (`frame()` at `:163`; CDP listeners at `:180`), not browser event time. State timing claims as order and window membership only.

**FN-2 (Medium; present now) — `sourceHeader` mismatch.**
- Draft `sourceHeader`: `source: S101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; .ufo/waves/round-21/runtime-execution-finalized.json`
- Note line 1: `source: S101 — corpus/evidence/round-21/runtime/receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition .ufo/waves/round-21/runtime-execution-finalized.json`
- An exact comparison makes the honest note red. Align the draft to note line 1, or use token checks as the frozen counter does (`measure-c1.mjs:100`).

**FN-3 (Medium) — `acquisition.revision` points at bytes that are not there.**
- Draft `acquisition.revision` = `1b5f449ad15525d281fda4558aeef1086f1e4a65`. At that commit, `receipt.json` = `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` (not `4bc79636…`), `na-reject.json` = `4f27fb3d372798bcaaa803dc7eedb50d25d1350609e096ffcc50dbedee06d92a` (not `a57b41bd…`), and `runtime-execution-finalized.json` is absent. The retained bytes first appear at `2d5eaaa…`.
- An implementation that reads blobs at `acquisition.revision` rejects the retained run. Bind by the §2 digests at the evaluated revision. `measuredRevision: "uncommitted"` is provenance text only.

**FN-4 (Low) — window bounds.**
- Draft `post.maxMs` 10000, but the post window starts at `actionAt` (`:211`) and includes the action (bounded 10000 ms, `:221`), sleep 500 (`:224`) and observe (bounded 5000 ms, `:189`, `:225`). Worst case ≈15.5 s. Slow legitimate re-runs would go red. Conversely, a 9.9 s after window passes without changing the Error class.
- `post.minMs` 500 and `pre.minMs` 250 equal the producer sleeps (`:224`, `:207`). Retained margins are 2 ms and 3 ms (502, 253), on wall-clock arithmetic. No effect on the retained row.

## 5. Controls the draft already rejects (must stay red)

Predictions for the old counter are static. Draft predictions assume the implementation checks each pinned predicate.

- C-1 Silence: delete seq 15, renumber 16→15, receipt `after.responses` := []. Old counter PASS (this is the all-silent failure). Draft RED (`post.statuses` must be `["Error"]`).
- C-2 `errorText` := na-throw literal under exact match. Old PASS. Draft RED.
- C-3 Status flip: `status` := `Completed` with `output`, coherent. Old PASS. Draft RED.
- C-4 Page error swapped to `Uncaught Error: dummy submit handler throw` (`pageObservations[1].value.errors`, seq 16 observation, receipt `pageState.errors`). Old PASS. Draft RED via `post.errors`.
- C-5 Fixture mode edit: `na-reject.html` `const mode="reject"` → `"success"`, re-link the raw `fixture.sha256`. Old PASS: line 112 reads the JSON `mode`, not the HTML; line 114 checks the digest and nonce only. Draft RED via `fixtureSha256`.
- C-6 Extra submit (submitCount 2). Old PASS. Draft RED.
- C-7 Response before the pre marker (seq below 12). Draft RED via `pre.statuses`.
- C-8 Post `formActive` true, or post `value` cleared. Draft RED.
- C-9 Post URL changed to `/landing` with a matching navigation event. Draft RED via `post.urlPath`.

## 6. Implementation-dependent points (not decidable from the draft)

- Foreign-invocation response: rekey seq 15 to another id and set receipt `after.responses` := []. Old counter PASS (it filters by id, line 124). Draft RED only if the status lookup filters by the invoke-result id. A window that counts every `toolResponded` would wrongly accept Error for `DAB4…` [INFERENCE].
- Placeholders `$nonce` and `$input` must resolve from the raw sent input (seq 9 `params.input.q`) and from the fixture-embedded nonce, not from receipt summary fields. Otherwise the expectation is recomputed from the evaluated receipt, which the contract forbids.
- `responseWindow` lower bound: see FP-6.

## 7. Claim-level issues

- Note lines 21–25 say a coherently changed raw event and summary "must still fail the case's semantic expectation". That is not yet true for na-reject (FP-1, FP-2, FP-4…FP-9). The claim is overstated until those are closed.
- SKILL.md:2417 promises fixed status/output/error predicates. The na-reject draft has no output predicate (FP-2).
- Handler order (`preventDefault` before `respondWith`) is fixture-declared and source-supported, not CDP-observed. Label it that way and bind it through `fixtureSha256`.

## 8. Checks run, not run, installs

Run (read-only):
- Reads of the files cited above.
- `sha256sum` of the six §2 files and of the round-21 measurement artifacts.
- Git read-only queries on the lane root: `cat-file -t`, `log`, `show … | sha256sum`, `diff --stat`, `merge-base --is-ancestor`, `status --short`. No clone was touched.
- One read-only Python count over retained round-21 JSON (frames after the post marker, `toolResponded` per invocation, release markers, invocation-id occurrences).
- grep of `.ufo/waves/round-21/measure-c1.mjs` for `status|errorText|output|requests|exception|release|delayed|agentInvoked`. Only `mode`, CONFIG, digest and order checks matched.

Not run: `measure-c1.mjs` (absent), selftests, the producer, the browser, builds, linters, tests, network, REA.

Installs or updates: none.

## 9. For BuildSelftest (proposed; not executed)

Coherent-mutation cases with the expected red owner: FP-1A and FP-1B (status), FP-2a, FP-2b and FP-2c (output or key set), FP-3A and FP-3B (error), FP-4 (submit identity; owner to decide), FP-5 (markers), FP-6 and FP-7 (sequence), FP-8 (window), FP-9 (navigation). Keep C-1…C-9 as controls. Apply the re-link set R in each case so that red reflects semantics, not stale digests.
