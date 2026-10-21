# Semantic08: adversarial semantic review of `na-throw` against the proposed round-22 oracle API

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
Read-only review. No edits, builds, tests, linters, browser runs, network, or subagents.
Every "predicted" result below is reasoning from the spec and the retained bytes. Nothing was executed.

## 0. Findings in brief

- **The retained bytes are self-consistent.** Every digest link for the `na-throw` row resolves (section 1).
- **Browser-attested outcome.** One `WebMCP.toolResponded` for invocation `3CE04A035739A78B887F37C518AD62A9`, with `status` "Error" and the programming-error `errorText`. It has no `output` key, no navigation, one in-window response, and zero pre-window responses.
- **The `throw` label is not browser-attested (F1, High).** Chromium's error branch fires on "default prevented, no respondWith promise, tool still running" (`.ufo/waves/round-21/sources/html_form_element.cc` L773-776, L787-794, L807-814). The throw is an author-chosen literal in the fixture, echoed back as a page error. A fixture that returns instead of throwing produces the same browser fields. The exported finding list in `.ufo/waves/round-22/w1-spec.json:3` has no finding that covers the page-error or fixture identity.
- **Top false-positive risks.** Status-only or errorText-only checks (F2). Cumulative receipt fields used as window membership (F3). Single-source navigation (F4). Absent/null/success output conflation (F6). Receipt-only or raw-only edits (F7). Fixture-blind identity (F1, F8).
- **Top false-negative risks.** These would reject the genuine row. Global navigation or request scans (F5). Strict `at` ordering on tied timestamps, and exact window equality (F9).

## 1. Digest links and path shorthands

Shorthands used below (all relative to the lane root):

- **raw** = `corpus/evidence/round-21/runtime/na-throw.json`
- **html** = `corpus/evidence/round-21/runtime/na-throw.html`
- **receipt** = `corpus/evidence/round-21/runtime/receipt.json`
- **producer** = `scripts/webmcp-lifecycle-round21.mjs`
- **finalized** = `.ufo/waves/round-21/runtime-execution-finalized.json`
- **witness** = `.ufo/waves/round-21/final/semantic-contrast-witness.json`
- **spec** = `.ufo/waves/round-22/w1-spec.json`
- **note** = `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`
- **S100 copy** = `.ufo/waves/round-21/sources/html_form_element.cc`

| Artifact | sha256 | Links that agree |
|---|---|---|
| raw | `e46d751e5b5f1927175b5a2395e3ed48e0b2033ffa80e14cb4a92ac1d44b9d1a` | receipt case `na-throw` `evidence.sha256`; finalized `:36`; witness `:412`; HEAD blob equal |
| html | `579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e` | raw `:10` `fixture.sha256`; finalized `:37`; HEAD blob equal |
| receipt | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | finalized `:21` and `:47` (`receiptSha256`); HEAD blob equal |
| producer | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | receipt `:6` `producer.sha256`; finalized `:13`; HEAD blob equal |
| S100 copy (S100 decoded) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `.ufo/waves/round-21/source-opening.json:6` `decodedSha256` |

The receipt carries no fixture sha. Only raw carries it.

## 2. Accepted outcome derived from raw frames and receipt (author witnesses not used)

Class key: **B** = browser CDP event or result. **H** = harness-recorded marker or window. **P** = page-authored value (`window.observations`, written by fixture code). **S** = server request log.

| Element | Derived value | Class | Location |
|---|---|---|---|
| Invocation | tool `lifecycle`; id `3CE04A035739A78B887F37C518AD62A9`; input `q` = `085b6a21-656a-452a-9a0d-83271e42bc29` | B | raw seq 9 L132-145 (input L141-142); seq 10 result L146-154; seq 11 `toolInvoked` L155-166 |
| Pre-window | 253 ms; zero `toolResponded` for this id; `formActive` true; `submits` []; `errors` [] | H, P | raw seq 12 L167-183; receipt `preAction` |
| Dispatch | `requestSubmit` dispatch-started seq 13 at ...917; action-complete seq 14 at ...918 | H | raw L184-196; producer `:214`, `:220`, `:222` |
| Response | exactly one `toolResponded`, seq 15 at ...918: `status` "Error", `errorText` exact (below), **no `output` key** | B | raw L197-207 (status L204, errorText L205); receipt L422-424 |
| After-window | 502 ms; ends at seq 16 (...419) | H | raw L208-234 |
| Submit record | exactly one: `agentInvoked` true, `isTrusted` true, `q` = nonce, `active` true, `respondWith` typeof "function" | P | raw L214-223 (seq 16); L259-267 (pageObservations) |
| Page error | exactly `["Uncaught Error: dummy submit handler throw"]` | P (listener in fixture; message formatted by browser) | raw L224-226 and L268-270; receipt L448-450 |
| Navigation | none after dispatch. CDP `Page.frameNavigated` only at seq 3 (raw L28-53, before invocation). Server log: `GET /na-throw` at ...651 (receipt L728-730, before invocation). No `/landing` request in the window | B, S | raw L28-53; receipt L686-752 (`requests`) |
| Delayed | not applicable. No release frame | H | producer `:223` (delayed branch only) |
| Cleanup | 9 pids before, 0 after, closed; `blocked` []; `downloads` [] | H | raw L280-294 |
| Fixture | `<form>` has no `toolautosubmit` (html L2); `action="/landing" method="get"`; handler: `preventDefault()` L9, `const mode="throw"` L10, `throw Error(...)` L11, no respondWith on this path | fixture bytes | html |

Exact `errorText`: `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result`. It matches raw L205, receipt L424, and the S100 copy L810-813, after string concatenation.

**Derived semantic label.** Browser-attested: Error, programming-error class (preventDefault without respondWith), no output, no navigation, one in-window response. The word "throw" is an author-side label. It is corroborated only by html L11 and the page error at raw L225 and L269.

**Sequencing.** Seq is strictly increasing 9 < 10 < 11 < 12 < 13 < 14 < 15 < 16. Timestamps tie: seq 9-11 at ...664, seq 12-13 at ...917, seq 14-15 at ...918. Ordering by `at` is ambiguous here.

**Author witness versus raw.** `.ufo/waves/round-21/final/semantic-contrast-witness.json` L409-468 agrees with raw on every field it records: invocation id, evidence sha, windows, responses, markers, submits, url, nonce presence, and cleanup. It records no navigation and no output fields. Its response filter (`.ufo/waves/round-21/final/semantic-witness-command.json:5`) uses the cumulative `seq < post.seq` definition, the same one the producer uses (F3).

## 3. Mechanism in retained Chromium source (S100 copy)

- L769-772: `setAgentInvoked(true)` when `declarative_webmcp_call`. Matches raw `agentInvoked: true`.
- L773-776: SubmitEvent dispatched. `should_submit = DispatchEvent(...) == kNotCanceled`.
- L787-789: `declarative_webmcp_call = executing_tool && executing_tool->CurrentlyRunning()`.
- L790-806: if `TakeRespondWithPromise()` is non-null, the promise path runs, with `CHECK(!should_submit)` at L794.
- L807-814: else if `!should_submit`, then `CallDoneCallback(kToolInvocationFailed, "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result")`.
- L818-831: if `should_submit`, navigation is scheduled and `CallDoneCallback(base::ok(String()))` runs.
- L321-326: rejected promise gives "respondWith promise was rejected". L732-733: "Form validation failed: ".

**Consequence.** The Error predicate is (default prevented) AND (no respondWith promise) AND (tool still running). A listener exception is not an input to it. [INFERENCE from standard DOM dispatch semantics: listener exceptions are reported, dispatch continues, and the canceled flag persists. Not browser-tested here.] So:

- preventDefault, then throw (na-throw): predicate true, so Error.
- preventDefault, then return, no throw: same predicate, same Error. Browser-indistinguishable. [INFERENCE]
- throw before preventDefault: predicate false, so the navigation path at L818-831 runs. Not Error. [INFERENCE]
- respondWith, then throw: promise path, not the programming-error text. [INFERENCE from L790-806]
- respondWith rejected: "respondWith promise was rejected" (`na-reject`, receipt L360-362).

## 4. Findings

Convention for every mutation below: change the named bytes, then update every digest link the oracle reads. That means the receipt `evidence.sha256` for `na-throw`, finalized `:21`, `:36`, `:37`, `:47` as applicable, and the witness `:412` if it is an input. The point is that red results come from semantics, not stale hashes. Predicted verdicts are not executed. Section 7 summarizes them.

### F1. High. The `throw` identity is author-side, and no exported finding covers it

- **Risk (FP).** Status, output, errorText, timing, and navigation are identical for a fixture that returns after `preventDefault()`. Only the fixture bytes (html L10-11), the fixture-owned `error` listener (html L6) that records `e.message` into `observations.errors`, and the producer's echo `"mode": "throw"` (raw L7) distinguish them.
- **Harness blindness.** The harness's own CDP session sends only `Page.enable`, `WebMCP.enable`, `Page.getFrameTree`, and `WebMCP.invokeTool` (raw seq 1, 4, 7, 9). It subscribes to four events (producer `:180`). It never captures a runtime exception event. No browser-side state records the throw.
- **Ambiguity in spec text.** `.ufo/waves/round-22/w1-spec.json:10` says "rejection/throw exact errors". That could mean errorText or the page error. The exported finding list (`.ufo/waves/round-22/w1-spec.json:3`) has no finding that checks the page-error list or the fixture ordering.
- **M-J (return instead of throw, coherent).** In html L11, change `throw Error('dummy submit handler throw');` to `return;`. Update the fixture sha (raw L10, finalized `:37`). Empty `errors` at raw L225 and L269, and receipt L448-450. Leave raw L7 `mode` as "throw". Keep status, errorText, timing, and navigation.
  - Predicted under the spec as written: PASS on every listed finding, so the row is counted as "Error throw". **FP.**
  - Predicted with the fixes in section 4 (F1 spec fix): FAIL on the pinned fixture sha and on the page-error list.
- **M-C (page-error neighbor).** Change raw L225 and L269, and receipt L449, from "Uncaught Error: dummy submit handler throw" to "Uncaught Error: dummy rejection". Keep errorText.
  - Predicted as written: PASS under a status or errorText check, or FAIL only if "exact errors" is read as page errors. **Ambiguous FP.**
- **Spec fix (text).** State that "throw" is author-side and fixture-bound. Make the page-error list and fixture sha part of the Error-throw expectation. Reword `.ufo/waves/round-22/w1-spec.json:10` to say which "exact errors".

### F2. High. errorText is the only browser discriminator among Error neighbors

- Neighbors: `na-reject` (receipt L360-362, "respondWith promise was rejected", page error "Uncaught Error: dummy rejection" at L386-388), `na-invalid-submit` (receipt L548-550), and `auto-invalid` (receipt L656-658). A status-only check accepts all of them.
- **M-B.** Change raw L205 and receipt L424 `errorText` to "respondWith promise was rejected". Keep the page error. Predicted: FAIL under exact errorText, the spec's stated rule. **FP if the implementation checks status only.**
- **M-A.** Change raw L204 `status` "Error" to "Completed". Replace raw L205 errorText with `"output": {"ok": true, "nonce": "085b6a21-656a-452a-9a0d-83271e42bc29", "q": "085b6a21-656a-452a-9a0d-83271e42bc29"}`. Mirror in receipt L422-424. Predicted: FAIL on status, output, and error.

### F3. High. Receipt timing fields are cumulative, not window-bounded

- `producer:209` (`responses(through)` filters `seq < through`), `producer:210` (`preAction.responseCount` counts `seq < pre.seq`), and `producer:226` (`after.responses` counts `seq < post.seq`). The frozen round-21 counter checks the same cumulative equality (`.ufo/waves/round-21/measure-c1.mjs:139`).
- A response that arrives between invocation and dispatch therefore appears in both `preAction.responseCount` and `after.responses`. A check that reads only `after.responses` cannot tell that the response came before the action.
- **M-F (pre-window response, coherent).** Move the seq-15 event to just after seq 11. Renumber so seq stays contiguous: the event becomes seq 12, pre-observation 13, dispatch 14, action-complete 15, after-observation 16. Set receipt `preAction.responseCount` to 1. Leave `after.responses` unchanged, because the filter is cumulative. Predicted: FAIL on semantic_timing (pre-window must be zero). **FP if only `after.responses` is checked.**
- **M-G (post-window response, coherent).** Move the event after the after-observation: seq 17, `at` 1792590714420. Receipt `after.responses` becomes [] and `preAction.responseCount` stays 0. Predicted: FAIL, since no in-window Error exists. **FP if the check scans every raw event for the invocation id.**
- **Spec fix.** Define window membership by raw seq position. Require dispatch-started (13) < toolResponded < after-observation (16), and zero toolResponded before pre-observation (12). Do not use receipt cumulative fields for membership.

### F4. High. Navigation needs two independent sources

- Raw: `Page.frameNavigated` is subscribed (producer `:180`). For `na-throw` it is captured only at seq 3 (raw L28-53).
- Server: every request is logged (producer `:131-133`, serialized as receipt `requests`, L686-752). A default submission of `action="/landing" method="get"` (html L2) would produce `GET /landing?q=nonce`. None appears in the window. Only `/na-throw` at receipt L728-730 appears, before the invocation.
- Receipt `after.navigations` (L436) is derived from frames only (`producer:226`). It cannot see a server request that has no frame event.
- **M-H (server-only navigation).** Insert `{"at": 1792590714100, "method": "GET", "url": "/landing?q=085b6a21-656a-452a-9a0d-83271e42bc29"}` into receipt `requests` between L727 and L733. Raw is unchanged. Predicted: FAIL on navigation (cross-source conflict). **FP if frames only are checked.**
- **M-I (frame-only navigation).** Add a raw `Page.frameNavigated` event for `http://127.0.0.1:43143/landing?q=...` inside the window (seq 16, with the after-observation becoming 17). Add it to receipt `after.navigations`. Leave `requests` unchanged. Predicted: FAIL. **FP if the server log only is checked.**
- **Spec fix.** Navigation is the union of raw `Page.frameNavigated` with seq in (dispatch, post] and server requests with `at` in [dispatch.at, post.at]. Any hit is a failure.

### F5. High (false negative). Navigation and request scans must be scoped

- The genuine raw has `Page.frameNavigated` at seq 3 (raw L28-53), before the invocation.
- The receipt has `GET /na-throw` at ...713651 (receipt L728-730). The invocation is at ...664, so this request comes before it.
- `GET /landing` at receipt L708-710 belongs to `na-native-submit`, a different case.
- Any global scan (any frameNavigated, any `/landing`, any `/na-throw` in `requests`) rejects the genuine row. Guards G1 and G2 in section 5.

### F6. Medium. Output: absent, null, and success are three different things

- Raw L201-205 and receipt L422-424: no `output` key on the Error response.
- Native-submit rows use null for unavailable submits (receipt L215 `"submits": null`; note `:36`). A canonicalizer that maps absent to null would make the two conventions interchangeable.
- **M-D.** Add `"output": null` to the raw seq-15 params and the receipt response. Predicted: FAIL if absence is required. **FP if absent and null are canonicalized together.**
- **M-E.** Add a success output object to the same response. Predicted: FAIL if output is checked for all Error rows. **FP if output is checked only for Completed rows.**
- **Spec fix.** For Error rows, the expectation is "key absent", distinct from null.

### F7. Medium. Evidence binding

- **M-K (cross-invocation).** Change raw L203 `invocationId` to `DAB4A9A79B522E21D49C7D2737F56E7E` (the `na-reject` id, receipt L360) and mirror in receipt L422. The invokeTool result (seq 10, raw L146-154) and toolInvoked (seq 11, raw L155-166) still carry `3CE04A...`. Predicted: FAIL on evidence_binding. **FP under status or errorText checks only.**
- **M-L (receipt-only drift).** Change receipt L424 `errorText` to "respondWith promise was rejected". Leave raw unchanged. Update the receipt sha, then finalized `:21` and `:47`, so that the only mismatch is raw versus receipt summary. Predicted: FAIL on raw-summary. **FP if semantics are read from the receipt.**

### F8. Medium. Fixture and echo fields

- Raw L7 `"mode": "throw"` is the producer's input echo. It is not an observation. The operative mode is html L10.
- **M-M.** Add a `toolautosubmit` attribute to the `<form>` in html L2. Update the fixture sha. Raw L5 `autosubmit` stays false. Predicted: FAIL on fixture-versus-raw automation declaration. **FP if the fixture is not inspected.**
- **M-N.** Change the nonce in html L5 and L12, and update the fixture sha. Raw nonce stays the same. Predicted: FAIL on evidence_binding (page echo versus input nonce, raw L141-142). **FP if the page nonce is not compared.**

### F9. Medium (false negative). Timestamps, windows, and response ordering

- **Ties.** Raw L134, L148, L157 are all ...664. L169 and L186 are ...917. L193 and L199 are ...918. Strict `at` ordering rejects the genuine row. Order by seq.
- **Harness time.** `at` is `Date.now()` in Node inside `frame()` (`producer:163`), i.e. harness receipt time, not browser event time. No browser latency claim is supported. The +1 ms from action-complete to response is harness delivery timing.
- **Boundary.** Pre-window end, after-window start, and dispatch are all ...917 (raw L169 and L186; `producer:210-211`). Assign events by seq, not by `at`.
- **Windows vary.** na-throw has pre 253 ms and after 502 ms. na-delayed has after 755 ms (receipt `cases[na-delayed].after`). Use the same thresholds the frozen counter uses: pre at least 250 ms and after at least 500 ms (`.ufo/waves/round-21/measure-c1.mjs:138`). Do not require equality.
- **Response versus action-complete.** `producer:214` issues the evaluate, `producer:220` records dispatch-started, and `producer:222` records action-complete. The CDP event (raw L201) may arrive on either side. The retained order is 14 before 15. Do not encode `response.seq > action-complete.seq` as a semantic property.

### F10. Medium. Expectation provenance

- The expectations must be literal values (section 6), not copied from the receipt or raw. The spec says "Independent fixed expectations must not be recomputed from the evaluated receipt" (`.ufo/waves/round-22/w1-spec.json:3`).
- If they pin the raw sha `e46d751e...` or the receipt sha `4bc79636...`, every coherent-mutation test goes red for digest reasons, which the spec's test rule forbids. Pin only the fixture sha `579ab87b...`. That is the artifact that defines the throw.

### F11. Low. Non-discriminating fields must not be used as evidence

- `submits[].respondWith` "function" (raw L221, L265) shows that the method exists, not that it was called. The corrected round-21 note rejects "Completed implies respondWith ran" (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:100-101`).
- `submits[].isTrusted` true (raw L218, L262) reflects an engine-created SubmitEvent (S100 copy L773-776). [INFERENCE] It is not human-actor evidence. The round-22 note already limits this (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:91-93`).
- `pageState.formActive` false, `focused` "go", and `value` equal to the nonce (receipt L437-451) also appear in Completed rows. They do not discriminate Error. `pageState.url` unchanged corroborates no navigation but is not sufficient alone.

### F12. Low. Provenance and revision gaps for source_binding and revision_input

- `finalized:3` records revision `1b5f449ad15525d281fda4558aeef1086f1e4a65`. `finalized:5` records `measuredRevision` "uncommitted". `git cat-file` shows `scripts/webmcp-lifecycle-round21.mjs` is absent at `1b5f449`. Producer identity is by sha only (`bc11e4d6...` is at HEAD `5f585773`). The acquisition cannot be described as revision-bound to `1b5f449`.
- `finalized:6-11` argv writes to `.ufo/waves/round-21/runtime-finalized-candidate`. That directory no longer exists. The artifacts now live at `corpus/evidence/round-21/runtime/`. The move is not recorded. The digest links still verify.
- Working tree at review time differs from HEAD: `corpus/SOURCES.md` (S101 row L115, used-by cell appended; round-22 log at L156), `corpus/QUALITY.md`, `corpus/README.md`. The new note is untracked. The spec's blob-reading rule is required, and the working tree is not evidence.
- `.ufo/waves/round-21/measure-c1.mjs` is frozen. Its grep hits are shape and summary-equality checks only (L104, L136, L138-139; CONFIG L15). It has no status, errorText, output, or navigation predicate. The new API must not import it, as the spec requires.

### F13. Low. Note wording

- `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:40` says "Error, programming-error diagnostic naming preventDefault without respondWith" and rejects "a different handler ordering or ordinary promise rejection". It does not name the browser-indistinguishable variant (preventDefault, then return). It does not say that "throw" is author-side. The corrected round-21 note has the same gap at `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:39` and `:99-101`.
- Suggested text for the new note: browser-attested class is "preventDefault without respondWith". "throw" is a fixture-bound label (fixture sha `579ab87b...`). Throw before preventDefault yields the navigation path, which is untested.

## 5. Stay-green guards (must PASS for the genuine row and for neutral variants)

- **G0.** Genuine bytes. Expected PASS.
- **G1.** Raw seq 3 `Page.frameNavigated` (raw L28-53) is before the invocation. Not a failure.
- **G2.** Receipt `GET /na-throw` (L728-730) is before the invocation. Receipt `GET /landing` (L708-710) belongs to `na-native-submit`. Neither is a failure for `na-throw`.
- **G3.** Equal `at` values (raw L134, L148, L157; L169, L186; L193, L199) pass seq-based ordering.
- **G4.** Windows of 253 ms and 502 ms pass the at-least thresholds. Equality is not required.
- **G5.** Swap seq labels of 14 and 15 (response before action-complete), payloads unchanged. [INFERENCE] Must PASS under the window rule in F3 and F9.
- **G6.** `isTrusted` and `respondWith` typeof have no required value for Error. If checked, check only for binding consistency.

## 6. Literal expectations for `na-throw` (for `semantic-expectations.json`, not copied from the receipt)

- `status`: `"Error"`.
- `errorText`: exact string in section 2.
- `output`: key absent, not null.
- Responses for this invocation: zero before dispatch-started; exactly one after dispatch-started and before after-observation.
- Navigation: none after dispatch-started, from both CDP `Page.frameNavigated` and the server request log, each scoped to the window.
- Submits in window: exactly one, with `agentInvoked` true, `isTrusted` true, `q` equal to the case nonce, and `active` true.
- Page errors: exactly `["Uncaught Error: dummy submit handler throw"]`, recorded as author-side corroboration.
- Delayed: not applicable.
- Pinned digest: fixture sha256 `579ab87bfba2cf0acbc954ff4468b6733014ef3fc47ec458a815fb448fb4539e`. No other digest is pinned.
- Windows: pre at least 250 ms and after at least 500 ms.

## 7. Predicted results (not executed)

| ID | Coherent mutation | Spec as written | Spec with section 4 fixes |
|---|---|---|---|
| M-A | status to Completed with output | FAIL | FAIL |
| M-B | errorText to rejected text | FAIL under exact errorText; FP if status-only | FAIL |
| M-C | page error to "dummy rejection" | Ambiguous FP | FAIL |
| M-D | `"output": null` added | FAIL if absence required; FP if canonicalized | FAIL |
| M-E | success output added | FAIL if checked for all Error rows; FP otherwise | FAIL |
| M-F | response moved before dispatch | FP if only `after.responses` is checked | FAIL |
| M-G | response moved after after-observation | FP if any-event check | FAIL |
| M-H | server-only `/landing` request | FP if frames only | FAIL |
| M-I | frame-only navigation | FP if server log only | FAIL |
| M-J | throw replaced by return; errors emptied | FP | FAIL (fixture pin and page error) |
| M-K | invocationId swapped to na-reject's | FAIL | FAIL |
| M-L | receipt-only errorText drift | FP if semantics read from receipt | FAIL |
| M-M | fixture gains `toolautosubmit` | FP if fixture not inspected | FAIL |
| M-N | fixture nonce drift only | FP if page nonce not compared | FAIL |
| G0-G6 | genuine and neutral variants | PASS | PASS |

Each "FP" entry means the row would be counted in Values12 when the mutation should make it red.

## 8. Verification gaps and limits

- No `measure-c1.mjs` or `corpus/evidence/round-22/semantic-expectations.json` exists at review time, in the lane or in the BuildOracle clone. I reviewed the API as spec text (`.ufo/waves/round-22/w1-spec.json:3`, `:10`) and as the note. No implementation was evaluated.
- Chromium behavior comes from retained S100 source text (decoded sha verified). Exception-dispatch equivalence and the return-variant outcome are [INFERENCE], not browser-tested.
- The harness and producer define what each receipt field means. The receipt is an index over raw frames, not independent evidence (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:27-29`).
- No mutation was applied or evaluated. All predictions are reasoning.

## 9. Disclosures

- Commands run: `sha256sum`; a read-only `node -e` JSON parse of the receipt (no files written); `git rev-parse`, `git log -1`, `git cat-file -p`, `git diff`, and `git status`.
- One early `git status --porcelain` and one `git rev-parse` ran at lane root without `GIT_OPTIONAL_LOCKS=0`. They can refresh the index stat cache but change no content. Later Git calls used `GIT_OPTIONAL_LOCKS=0`.
- No installs. No pacman, uv, npx, network, browser, REA, or peer messages. No subagents. The only file written is this report.
- Concurrent peer edits were observed in the working tree (`corpus/SOURCES.md`, `corpus/QUALITY.md`, `corpus/README.md`, and round-22 files). I did not make them.
