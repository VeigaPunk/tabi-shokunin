# Semantic03: na-requestsubmit adversarial semantic review

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Wave: round-22 / w1. Seat: reviewer (read-only).

## Scope and method

- Read-only. The only write is this file. No edits, builds, tests, linters, browser, network, REA, or producer/counter execution.
- Executed: file reads, greps, and `sha256sum` over lane files.
- Proposed API: `.ufo/waves/round-22/w1-spec.json` (`context` "API:" paragraph; BuildOracle item, line 10). The BuildOracle clone was not opened, so predictions about the oracle are spec-level.
- Baseline read line by line: `.ufo/waves/round-21/measure-c1.mjs` (old counter) and `scripts/webmcp-lifecycle-round21.mjs` (producer). Predictions about them come from reading, not execution.
- Derivation order: the note (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`) and the round-21 witness (`.ufo/waves/round-21/final/semantic-contrast-witness.json`) were opened first for orientation. Every outcome field in section 2 is taken from raw frames or receipt fields and was then compared with those two documents.
- Notation: `N` = nonce `99664eb6-d5ed-46f6-a516-39720ab87c27`. "Raw" = `corpus/evidence/round-21/runtime/na-requestsubmit.json`. "Receipt" = `corpus/evidence/round-21/runtime/receipt.json`. "Acq" = `.ufo/waves/round-21/runtime-execution-finalized.json`. "Seq n" = raw `frames[].seq`.

## Verdict

- The accepted outcome is `Completed` (requestSubmit, mode success, non-autosubmit). Output is `{ok:true,nonce:N,q:N}`. There is no errorText. Exactly one response falls inside the after window. Navigations are zero. The case is not delayed. Pre-response count is 0.
- The canonical bindings are internally consistent (section 1).
- The proposed API text names the status and the windows. It does not state these rules: output nonce binding; response membership in the window; response cardinality; zero navigations for requestSubmit; the non-delayed rule; submit cardinality and attributes; fixture-mode binding.
- The old counter has no status, output, or errorText predicate, and mirrors the other fields. Every mutation in section 4 (16 in total, S1 included) is accepted by it, by reading.
- False-negative risks: a strict response-vs-action-complete order (T4), and string comparison of the invoked input (I1).

## 1. Artifact bindings (verified with sha256sum)

| Artifact | Path | sha256 | Cross-checks |
|---|---|---|---|
| Raw | `corpus/evidence/round-21/runtime/na-requestsubmit.json` | 4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa | receipt line 183; acq line 26; witness line 123. Match. |
| Fixture | `corpus/evidence/round-21/runtime/na-requestsubmit.html` | 1796f206a10c85b94d21db0381610858150c971cb8131c0ae40cfab8fbbd2085 | raw line 10; acq line 27. Match. |
| Receipt | `corpus/evidence/round-21/runtime/receipt.json` | 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034 | acq lines 21 and 47. Match. The witness does not pin it. |
| Producer | `scripts/webmcp-lifecycle-round21.mjs` | bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811 | receipt line 6; `.ufo/waves/round-21/history/index.json` line 31. Match. |
| Acquisition | `.ufo/waves/round-21/runtime-execution-finalized.json` | 65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4 | witness line 6 (`acquisitionSha256`). Match. |
| Old counter | `.ufo/waves/round-21/measure-c1.mjs` | 8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb | Not pinned by the reviewed records. |

Pins: the producer enforces Node v24.21.0 (line 125) and Chromium 154.0.8037.97 (line 168). The receipt `environment` block matches.

## 2. Independently derived outcome

Source: raw frames (lines 12 to 237), raw `pageObservations` (lines 238 to 279), receipt row (lines 122 to 185).

| Seq | Node ms | Frame | Derived fact |
|---|---|---|---|
| 9 | 708996 | sent `WebMCP.invokeTool` | input is the object `{q:N}` |
| 10 | 708997 | result | invocationId `56322DDB67194D60972B07E2BCABB7B7` |
| 11 | 708997 | event `WebMCP.toolInvoked` | same ID; `input` is a JSON string that parses to `{q:N}` |
| 12 | 709250 | observation pre-action | formActive true; submits []; errors []; value N; url `/na-requestsubmit` |
| 13 | 709250 | action dispatch-started | `requestSubmit` |
| 14 | 709251 | action-complete | none |
| 15 | 709252 | event `WebMCP.toolResponded` | same ID; status `Completed`; output `{ok:true,nonce:N,q:N}`; no errorText key |
| 16 | 709753 | observation after-action | one submit `{agentInvoked:true,isTrusted:true,q:N,active:true,respondWith:"function"}`; errors []; formActive false; url unchanged |

Further derived facts:

- Identity: seq 10, seq 11, seq 15, and receipt line 127 carry the same invocation ID.
- Windows: pre is 253 ms (receipt lines 129 to 135), against a producer `sleep(250)` (line 207). After is 503 ms (receipt lines 136 to 180), against `sleep(500)` (line 224). Response latency is +2 ms from dispatch-start and +1 ms from action-complete (Node receipt times).
- Navigation: `Page.frameNavigated` appears only at seq 3, the initial load before invoke. Receipt `requests` (lines 698 to 703) show GET `/na-requestsubmit` at 708984, then GET `/na-native-submit` at 709919. No request falls in the window.
- Delayed: none. Mode is success. There are only two observations. There is no `release` frame. The producer's delayed branch (line 223) is not executed.
- Cleanup: 9 browser PIDs before, 0 after. `contextClosed` is true. `forced` is null (witness cleanup block).
- Ties: `at` values tie at seq 10 and 11 (708997), and at seq 12 and 13 (709250). Ordering must use `seq`.

What the trail does not prove:

- The fill of `q`. The only evidence is the seq 12 value.
- The requestSubmit call itself. Producer line 214 issues `page.evaluate(... requestSubmit())`. The frames carry producer markers only.
- Attribution of the submit to the action. This rests on the interval between seq 12 and seq 16.
- Page-reported fields are split. `submits` and `errors` come from the fixture's own listeners (HTML lines 5 to 9). `formActive`, `url`, and `value` come from the producer's `page.evaluate` (producer line 189). None of these is browser-reported.
- `respondWith:"function"` is a typeof read taken before the call. It is not evidence the call happened. The browser-reported output in seq 15 is the evidence that respondWith ran.

## 3. Baseline: old counter on this row (read, not executed)

- Status, output, and errorText are never read. The only `status` matches are process exit codes (lines 146 and 159).
- `errors`, `agentInvoked`, `isTrusted`, `respondWith`, and `release` are never read.
- `pageState`, `submits`, `navigations`, `formActive`, and `responseCount` are checked only as mirrors of the raw (line 139).
- Responses are checked only for being after toolInvoked (line 126). Their position against pre, action, and after is not checked (line 136 excludes them).
- Window checks are lower bounds only, 250 and 500 (line 138). There is no upper bound.
- Fixture: nonce presence is a substring test (line 114). The mode is compared from raw `mode`, not from the HTML constant (line 112).
- Input: JSON.parse plus deep equal (lines 127 to 129). This is correct and should be kept.

## 4. False positives: the oracle would accept a wrong outcome

Conventions. Each mutation changes only the listed fields. Renumber seq so `seq = index+1` and `at` is non-decreasing (old counter line 118). Digest links: recompute the raw sha into receipt line 183, then the receipt sha into acq lines 21 and 47. When raw or fixture bytes change, also update acq lines 26 and 27. Acq line 17 is a rendering of the same receipt fields; a fully coherent copy would also rewrite it. Old-counter outcomes are by reading.

| ID | Dim | Minimal coherent mutation | Correct verdict | Old counter | Spec text | Risk |
|---|---|---|---|---|---|---|
| S1 | status | Seq 15 `status` "Completed" becomes "Error"; `output` removed; add `errorText` "respondWith promise was rejected". Mirror in receipt `after.responses[0]`. | red, `semantic_status` | accepted (no status predicate) | "Completed requestSubmit" names the status. Control. | Control. Shows the baseline gap. |
| O1 | output | Seq 15 `output.nonce` and `output.q` become `d57a9461-7725-447a-94ee-5031820695a6` (the na-click output, receipt line 82). Mirror in receipt `after.responses[0].output`. Submits and input stay N. | red, `semantic_output`: output.nonce must equal N and output.q must equal submit q and input q | accepted (output unread; line 137 covers only the page echo) | silent on output content | FP, HIGH |
| O2 | output | Seq 15 `output.ok` becomes false. Mirror. | red: the success fixture returns ok:true (HTML line 12) | accepted | silent | FP, MED |
| O3 | output / fixture | HTML line 10 `const mode="success";` becomes `"reject"`. Recompute raw `fixture.sha256` and acq line 27. Trail stays Completed. | red: the reject path (HTML lines 13 and 15) yields Error, which contradicts the observed Completed | accepted (line 112 compares raw mode; line 114 checks sha and substring) | "fixture/producer/acquisition hashes" are satisfied by the coherent hash update | FP, HIGH unless the expectation pins the mode constant and the respondWith branch, not only the sha |
| E1 | error | Seq 15 adds `errorText` "Tool execution cancelled by a form reset" and keeps status Completed. Mirror. | red: Completed carries no errorText | accepted (errorText unread) | `semantic_error` is listed, but the Completed rule is not stated | FP, HIGH |
| E2 | error | Raw seq 16 `value.errors` becomes `["Uncaught Error: x"]`. Mirror to pageObservations[1] and receipt `after.pageState.errors`. Status unchanged. | policy: recommend red for accepted success rows (the note row claims a clean Completed) | accepted (errors unread) | silent | FP (policy), MED |
| T1 | timing / sequence | Move the toolResponded frame to between seq 11 and 12 (at about 709000). Receipt `preAction.responseCount` 0 becomes 1. `after.responses` stays (the producer's `responses()` is cumulative, line 209). | red: a response before action is not non-autosubmit pending. Acq stdout `pre=0` is the reference. | accepted (line 126 needs only seq > toolInvoked; line 139 mirrors responseCount) | "exact ... sequence" is named, but the pre-count-zero rule is not | FP, HIGH |
| T2 | timing / window | Move the toolResponded frame after seq 16 (at at least 709753). Receipt `after.responses` becomes []. | red: no Completed inside the after window | accepted (line 139 mirror; no existence requirement) | "finite windows" is named, but the membership rule is not | FP, HIGH |
| T3 | timing / bound | Stretch the after window: post observation at +60000 ms (`after.end`, `windowMs` 60000); response at +59000 ms. | red once a maximum is fixed from producer constants. Candidates: observe timeout 5000 (line 189), action timeout 10000 (line 221). No window maximum exists yet. | accepted (line 138 lower bounds only) | "finite" is named with no maximum | FP, MED |
| N1 | navigation | Insert `Page.frameNavigated` (url `http://127.0.0.1:43143/landing?q=N`) between seq 15 and 16. Set `after.navigations` to [it] and `after.pageState.url` to the landing URL. Add GET `/landing?q=N` inside the window in receipt `requests`. | red: preventDefault plus respondWith means no navigation; expected navigations are [] | accepted (line 139 mirror) | `semantic_navigation` is listed, but the zero-navigation rule for requestSubmit is not | FP, HIGH |
| N2 | navigation / url | Change only the URL: raw seq 16 `value.url`, pageObservations[1], and receipt `after.pageState.url` become `.../na-requestsubmit?x=1`. Navigations stay []. | red: URL must match the fixture | accepted (url only mirrored) | silent on URL. The recorder sees only `Page.frameNavigated` (producer line 180), so same-document changes are invisible. | FP, MED |
| D1 | delayed | Insert frame `release` after seq 14 and an observation labelled `delayed-before-release` before seq 16. Renumber. | red: these markers exist only in delayed mode (producer line 223) | accepted (neither is checked) | `semantic_delayed` is listed, but the non-delayed rule is not | FP, MED |
| C1 | cardinality | Add a second toolResponded for `56322DDB67194D60972B07E2BCABB7B7` (status Error, errorText "respondWith promise was rejected") after seq 15. Receipt `after.responses` gets two entries. | red: exactly one terminal response per invocation | accepted (line 126 checks only seq > toolInvoked) | silent on cardinality | FP, HIGH (first-match selection accepts) |
| C2 | cardinality | Duplicate the submit entry in raw seq 16 `value.submits`, pageObservations[1], receipt `after.submits`, and `after.pageState.submits`. | red: exactly one submit | accepted | silent | FP, MED |
| A1 | submit attrs | `submits[0].agentInvoked` becomes false in the same four places. | red, provided the note row's `agentInvoked true` is pinned as expected | accepted | silent | FP, MED |
| P1 | pre-state | Pre `formActive` becomes false (seq 12, pageObservations[0], receipt `preAction.formActive`). | red: pending requires an active form (note decision rule 2) | accepted (line 139 mirror) | silent | FP, LOW-MED |

## 5. False negatives: the oracle would reject a valid or benign variant

| ID | Mutation | Correct verdict | Risk |
|---|---|---|---|
| T4 | Swap seq 14 (action-complete) and seq 15 (toolResponded). Keep `at` non-decreasing (709251 for the response, 709252 for action-complete). Receipt unchanged. | green. The response follows dispatch-start by event-loop order. Its order against action-complete depends on transport. [INFERENCE: plausible, not observed.] | FN if the oracle requires response.seq > action-complete.seq. The old counter accepts (line 136 excludes responses). MED. |
| I1 | Change the seq 11 `input` string from `{"q":"N"}` to `{ "q" : "N" }`. | green: same parsed object | FN if the oracle compares strings. The old counter parses (lines 128 to 129). LOW-MED. |
| (no mutation) | Ordering by `at` | n/a | Ties exist (section 2). History index line 7 records superseding run 1 for "cross-array timestamp ties". Order by seq. |
| (no mutation) | Pinning windows to 253 and 503 (the witness values) | n/a | Rejects any legitimate re-acquisition. The producer guarantees only minimums of 250 and 500. [INFERENCE.] Do not pin. |

## 6. Verdict-level and test-design hazards

- V1, verdict. The spec says missing expectations and note mean baseline 0 (exit 0). Deleting both artifacts from a candidate revision therefore exits 0 with value 0. Bind baseline to the fixed revision `5f585773258b33d2d514b00cd0b0775333578db6`. Missing artifacts on any other revision should exit non-zero. MED.
- H1, digest coherence versus pins. A mutation that updates receipt and raw but not the independently pinned acq record (lines 21, 26, 27, 47) fails evidence binding, not semantics. A mutation that also updates a fixed pin defeats the pin. Define each mutation over every artifact that pins the changed bytes. Acq line 17 is a rendering of receipt fields and must be rewritten too (T1 gives `pre=1`; T2 gives `statuses=none-in-window`; S1 gives `statuses=Error`). Pin semantic constants (mode, status, output shape, submit count), not only shas.
- H2, the acq stdout line `statuses=Completed` (line 17) is rendered by producer line 239 from the same receipt. It is not corroboration.
- H3, replication. Superseded runs `.ufo/waves/round-21/history/runtime-v1` to `runtime-v4` (receipts, line 143) all show requestSubmit Completed with per-run nonces. The superseding reasons are producer defects (index lines 7, 13, 19, 25), not outcome changes. The status is therefore replicated across five acquisitions. The note makes no determinism claim. The oracle must bind only the canonical receipt sha; older runs are different invocations and must not be admitted.
- H4, mechanism. The note's "through Playwright evaluate" matches producer line 214. The trail does not show the evaluate call. The oracle must not encode human or user-activation semantics for this row.

## 7. Residual limits (not solvable at receipt level)

- A coherent replacement of N across fixture, raw, input, and output is undetectable. The BuildOracle prompt itself disclaims authenticity.
- Recorder scope: only four methods are recorded (producer line 180): `WebMCP.toolsAdded`, `WebMCP.toolInvoked`, `WebMCP.toolResponded`, `Page.frameNavigated`. `Page.enable` is sent (line 196), but other page events are dropped. An absence in frames means absence among these four.
- Windows are Node `Date.now()` receipt times in milliseconds, not page or browser clocks.
- Page-reported fields come from fixture code. Output is browser-reported through WebMCP.toolResponded.

## 8. Spec additions that would close section 4 (minimal)

Each applies to requestSubmit success. Each is a rule the oracle must encode, derived from the fields above.

1. Exactly one toolResponded for the invocation. `status === "Completed"`. `errorText` absent.
2. `output` deep-equals `{ok:true,nonce:N,q:N}`, where N = raw.nonce = submits[0].q = parsed toolInvoked input.q. The fixture constant must equal N.
3. Pre: responseCount 0; formActive true; submits []; errors [].
4. Sequence by seq: invokeTool result < toolInvoked < pre < dispatch-start < response < after. The response may precede action-complete (T4).
5. Windows: pre at least 250 ms and after at least 500 ms (producer lines 207 and 224), plus a maximum taken from producer constants.
6. Navigations []. `pageState.url` equals the fixture URL. State the recorder scope (section 7).
7. No `release` frame. No `delayed-before-release` observation. Observations are exactly pre and after.
8. Exactly one submit: isTrusted true, agentInvoked true, active true, respondWith "function".
9. Fixture: parse the mode constant and the respondWith branch. Compare with CONFIG mode (producer line 17) and with the expected status.
10. Input shape: JSON.parse toolInvoked.input and deep-equal to the invokeTool input.
11. Verdict: baseline 0 only on the fixed baseline revision.

## 9. Checked and clean (should stay green)

- Every digest in section 1 matches.
- Invocation identity is consistent across seq 10, 11, 15, and receipt line 127. The invoke result precedes toolInvoked. The input parses equal.
- Pre and after windows meet the producer minimums. Pre (seq 12) precedes dispatch (seq 13). After (seq 16) follows action-complete (seq 14).
- No in-window navigation. URL unchanged. Cleanup survivors empty. No forced kill.
- Note first line begins `source: S101` (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` line 1).
- Chromium and Node pins are enforced by the producer (lines 125 and 168).

Bottom line: the derived outcome is Completed and is correct. The bindings are clean. Accepting na-requestsubmit as Completed is sound only after the spec adds rules 1 to 11 in section 8. As written, the spec does not state the rules that reject the section 4 mutations, and the old counter accepts all of them by reading.
