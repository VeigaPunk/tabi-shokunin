# Semantic01: adversarial semantic review of na-pending (round-22 W1)

**Verdict:** The accepted outcome for na-pending is `pending-finite`: no correlated `WebMCP.toolResponded` in either recorded window. BuildOracle's WIP expectation row and the corrected note agree with the raw on every field I checked, so no expectation value needs changing. The defects are in what the proposed rules would still accept or reject: late, foreign, and cross-evidence responses; unbounded windows; text and mode traps; exact-equality brittleness; and encoding gaps.

**Scope.** Read-only. No edits, builds, tests, browser, network, or installs.
- Target: `corpus/evidence/round-21/runtime/na-pending.json` and `.html`, plus receipt `cases[0]` in `corpus/evidence/round-21/runtime/receipt.json`.
- Reviewed against the contract API text (findings `semantic_status` through `revision_input`) and the WIP expectation `.ufo/waves/round-22/clones/BuildOracle/corpus/evidence/round-22/semantic-expectations.json` (rows at lines 31-43).
- Not present at review time: `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-22/measure-c1.mjs`. The API was therefore reviewed as specified, not as code.
- "Predicted" old-counter outcomes below come from reading `.ufo/waves/round-21/measure-c1.mjs`. They were not executed.

## 1. Accepted outcome (derived from raw, not from expectation or note)

Invocation `44555B4FCF76A7EE11B1E96ACA81851F` got no correlated response in either window. The pre window is 254 ms and the post window is 503 ms, 757 ms in total from invoke result to post observation. No `WebMCP.toolResponded` frame exists anywhere in the 15 recorded frames.

| Item | Raw evidence (na-pending.json unless noted) |
|---|---|
| Invoke | seq 9 `invokeTool`, frame `27001C032351C5A5FEE40A6B9E99DE98`, tool `lifecycle`, input object `{q: 5956c381-7675-4fe7-a6b4-990d7cf866f9}`. seq 10 result `invocationId` 44555B4F…; receipt `invokeError: null`. |
| Invoked | seq 11 `toolInvoked`, same invocationId and frameId. Input is the JSON string `"{\"q\":\"5956c381-…\"}"`, which parses to the invoke input. |
| Pre window | seq 12 observation at t=707335; `preAction` start 707081, `windowMs` 254, `responseCount` 0. Page state: `submits []`, `errors []`, `formActive true`, `value` = nonce, `focused go`, path `/na-pending`. |
| Action | seq 13 `action` `none` phase `no-action`; seq 14 `action-complete`. Both at t=707335. |
| Post window | seq 15 observation at t=707838; `after.windowMs` 503, `responses []`, `submits []`, `navigations []`. Page state the same as pre. |
| Tail | Frames end at seq 15. Nothing is recorded after the post observation. |
| Server log | receipt `requests`, lines 686-691: only `GET /na-pending` at 707069. No `/landing?q=5956…` request. |
| Output | None. No `output` key in any toolResponded. The nonce appears only as input or page echo. |
| Error | None. `invokeError` null, no `errorText`, page `errors []`, no submit. |
| Navigation | None after action. |
| Delayed | Not applicable. `mode` success, no `release` frame, no `delayed-before-release` observation. |
| Cleanup | `contextClosed` true, `browserPidsAfter []`, `browserPidsSeenAfterClose []`, `blocked []`, `downloads []`. Receipt `cleanup` browserClosed and serverClosed true. |
| Producer label | Stdout `LIFECYCLE_OBSERVED na-pending pre=0 statuses=none-in-window` (`.ufo/waves/round-21/runtime-execution-finalized.json` line 17). Producer comment at `scripts/webmcp-lifecycle-round21.mjs` line 3: "Pending means only no correlated response in the recorded observation window." |

**Author witnesses compared (not used to derive).**

| Field | Raw-derived | WIP expectation (rows 31-43) | Corrected note (line 32) |
|---|---|---|---|
| autosubmit / action / mode | false / none / success | same | "no action" |
| response | none | `response: null`, `responseWindow: "none"` | "no matching response in either recorded window" |
| pre | 254 ms; formActive true; value nonce; submits 0; statuses []; errors []; focused go; /na-pending | min 250, max 10000; same values | "form active before and after" |
| post | 503 ms; formActive true; value nonce; submits 0; statuses []; errors []; focused go; /na-pending | min 500, max 10000; same values | same |
| navigation | none | `navigation: "none"` | not stated |
| fixtureSha256 | f7c86927… (matches file) | f7c86927… | not stated |

No value discrepancy for na-pending.

**Byte bindings (verified).**

| Artifact | Working tree sha256 | Execution artifacts / receipt | Baseline 5f585773 blob |
|---|---|---|---|
| na-pending.json | f17fe86f… | f17fe86f… | f17fe86f… |
| na-pending.html | f7c86927… | f7c86927… | f7c86927… |
| receipt.json | 4bc79636… | receiptSha256 4bc79636… | 4bc79636… |
| producer | bc11e4d6… | producerSha256 bc11e4d6… | bc11e4d6… |

The corrected note blob also exists at the baseline.

## 2. Findings (severity order)

| ID | Sev | Class / direction | Risk | Mutation | Expected semantic result | Old counter (predicted) |
|---|---|---|---|---|---|---|
| F1 | HIGH | status / FP | A correlated response recorded after the post observation is invisible to window-scoped checks. | M-LATE-1, M-LATE-2 | RED | GREEN |
| F2 | HIGH | status / FP | Responses with foreign or non-exact invocationId are ignored. No proposed finding ID covers them. | M-FOREIGN-1, M-FOREIGN-2 | RED | GREEN |
| F3 | HIGH | status / FP | Response and submit cross-evidence is not checked. A coherent Completed row would still pass structurally. | M-RESP-1, M-SUB-1, M-COMPLETE-1 | RED | GREEN |
| F4 | HIGH | status, output, error, delayed / FP and FN | Fixture text and `mode` traps: the HTML contains `ok:true`, throw, reject, and `window.release` branches that never ran. | C-TEXT (clean row) | pending-finite, output null, error null, delayed n/a | n/a |
| F5 | HIGH | timing / FP | An unbounded post window passes finiteness-only checks. | M-TIME-2 | RED | GREEN |
| F6 | HIGH | timing / FN on clean row | Strict `<` on retained equal millisecond timestamps rejects the clean row. | C-EQ (clean row) | GREEN | n/a |
| F7 | MEDIUM | error / FP | Page error recorded with no submit. | M-ERR-1 | RED | GREEN |
| F8 | MEDIUM | timing / FN | Exact-millisecond or retained-value matching rejects benign jitter. | M-TIME-3 | GREEN | GREEN |
| F9 | MEDIUM | status / FN | Exact global sequence or frame-count matching rejects benign frames. | M-BENIGN-1 | GREEN | GREEN |
| F10 | MEDIUM | input_shape / FN on clean row | `toolInvoked.input` is a JSON string, not an object. | C-PARSE (clean row) | GREEN | n/a |
| F11 | MEDIUM | status / FN and encoding | The na-pending row has no explicit pending token, and `responseWindow: "none"` is not used by any other row. | E1 | explicit encoding | n/a |
| F12 | MEDIUM | revision_input / binding | `acquisition.revision` and `baseline` do not byte-bind the retained raw. | E3 | byte-bind to evaluated revision | n/a |
| F13 | LOW | source_binding | WIP `sourceHeader` attaches the execution record to S101 and omits S100. | E4 | reconcile before note | n/a |

### 2.1 Details

**F1 (HIGH, status FP).** The old counter scopes responses to `seq < post.seq` at line 139, and only checks `seq <= invoked.seq` at line 126. The WIP expectation scopes `statuses` to the pre and post windows. Late events are recorded because the producer attaches `WebMCP.toolResponded` and `Page.frameNavigated` listeners at `scripts/webmcp-lifecycle-round21.mjs` line 180 and keeps them until context close. Per-case evidence is saved in `finally` after close (lines 228-236). A teardown-time event is therefore a coherent recorded-frame outcome. Pending-finite must require zero correlated responses across all recorded frames.

**F2 (HIGH, status FP).** The old counter filters `events` by exact `invocationId ===` at line 124, so foreign or differently cased ids are silently ignored. Each case runs in a fresh profile (lines 160 and 165), so a response for another invocation inside this case is contamination. No finding ID in the proposed list (`semantic_status` through `revision_input`) covers this.

**F3 (HIGH, status FP).** Nothing cross-checks a response against a submit or a submit against a response. The page only calls `respondWith` inside its submit handler (`na-pending.html` line 15), so a response with no submit is impossible. Likewise a submit with no response is not pending. COMPLETE-COHERENT is the independence check: it produces a self-consistent Completed row, which must still fail against the pending expectation. A pass there would mean the oracle accepts structural consistency over the fixed expectation.

**F4 (HIGH, text and mode traps).** `na-pending.html` contains, in code that does not execute:
- `const mode="success"` (line 10)
- `throw Error('dummy submit handler throw')` (line 11)
- `value={ok:true,nonce:…,q:…}` (line 12)
- `Promise.reject(Error('dummy rejection'))` (line 13)
- `window.release` delayed branch (line 14)

A status, output, error, or delayed rule that reads fixture text or `mode` will mislabel the unmutated row. Fixture bytes should be used only for `fixtureSha256` binding.

**F5 (HIGH, timing FP).** The old counter checks only finiteness and `end - start` (line 138). The WIP expectation supplies `maxMs 10000` on both windows, and the oracle must enforce it.

**F6 (HIGH, timing FN on clean row).** The retained evidence has exact equalities at ms resolution: invokeTool `at` = preAction.start = 707081, and pre `at` = action `at` = action-complete `at` = after.start = 707335. Strict `<` rejects the clean row. Ordering should use `seq` plus non-strict time bounds. Requiring `after.start == pre.end` exactly is fragile even though it holds here.

**F7 (MEDIUM, error FP).** The old counter does not compare `errors`. An error with no submit is contradictory and should be red.

**F8 (MEDIUM, timing FN).** Retained window values are wall-clock `Date.now()` samples. Exact-ms or retained-value equality would reject benign jitter. Bounds from the expectation (250/500 minimum, 10000 maximum) are the right form.

**F9 (MEDIUM, sequence FN).** A benign `WebMCP.toolsAdded` before invoke changes global seq numbers but no correlated event. Only relative order of correlated events should matter.

**F10 (MEDIUM, input_shape FN).** `invokeTool` input (seq 9) is an object. `toolInvoked` input (seq 11) is a JSON string. A deep-equal without `JSON.parse` rejects the clean row. The old counter parses at line 128.

**F11 (MEDIUM, encoding).** The row has `response: null` and `responseWindow: "none"`, and no explicit pending token. The other rows use `action-to-post` or `pre-action`. A closed enum may reject `none`, and `none` can also be misread as missing window data. The producer's own label is `none-in-window`, which is a better neutral token than a bare "pending". The row also lacks a sequence, a per-case evidence digest (receipt `cases[0].evidence.sha256` = f17fe86f…), and any invocation binding, all of which the contract requires for exact sequence and raw-summary hashes.

**F12 (MEDIUM, revision_input).** The WIP `acquisition` block (lines 10-18) records `revision` 1b5f449ad… and `baseline` e7cf11a8…, copied from the execution record (`measuredRevision: "uncommitted"`). At 1b5f449…, `corpus/evidence/round-21/runtime/na-pending.json` has blob sha `ae7e555b…`, which is not the retained `f17fe86f…`. At e7cf11a8…, the path does not exist. The retained bytes match the 5f585773 baseline blob. The oracle should byte-bind to the evaluated revision plus the execution artifacts map, and treat `acquisition.revision` and `baseline` as provenance only.

**F13 (LOW, source_binding).** WIP `sourceHeader` (line 5) reads `source: S101 — … receipt.json …; .ufo/waves/round-21/runtime-execution-finalized.json`. The corrected note header associates S100 and S101 with the receipt. `corpus/SOURCES.md` line 115 lists only `receipt.json` under S101. The old counter requires both S100 and S101 associations (lines 94-100). Reconcile before the new note header is written.

## 3. Minimal coherent mutations (in-memory; never write retained files)

**Digest-link rule.** After any edit to `na-pending.json`, update receipt `cases[0].evidence.sha256` and execution `artifacts["corpus/evidence/round-21/runtime/na-pending.json"]`. If `receipt.json` changes, also update execution `artifacts[...receipt.json]` and `receiptSha256`. Frames must stay contiguous in `seq` and non-decreasing in `at`.

| ID | Edit | Expected | Old counter (predicted) |
|---|---|---|---|
| M-LATE-1 | Append frame seq 16, `at` 1792590707900, `dir: event`, `method: WebMCP.toolResponded`, params `{invocationId: 44555B4FCF76A7EE11B1E96ACA81851F, status: Canceled, errorText: <placeholder>}`. Receipt unchanged. | RED, status | GREEN |
| M-LATE-2 | Append seq 16, `at` 1792590707900, `method: Page.frameNavigated`, frame url `http://127.0.0.1:43143/landing?q=5956c381-7675-4fe7-a6b4-990d7cf866f9`, `type: Navigation`. Receipt unchanged. | RED, navigation | GREEN |
| M-FOREIGN-1 | Insert at seq 15, `at` 707600: toolResponded `{invocationId: 5CE5ECE3023564847832ECEB5F305854, status: Completed, output: {ok: true, nonce, q}}`. Renumber old 15 to 16. Receipt unchanged. | RED, status | GREEN |
| M-FOREIGN-2 | As M-FOREIGN-1, but invocationId `44555b4fcf76a7ee11b1e96aca81851f` (own id, lowercased). | RED, status | GREEN |
| M-RESP-1 | Insert at seq 15, `at` 707600: toolResponded `{own invocationId, status: Completed, output: {ok: true, nonce, q}}`. Renumber. Receipt `after.responses` = `[that params]`. | RED, status | GREEN |
| M-SUB-1 | Set `submits` to `[{agentInvoked: false, isTrusted: true, q: nonce, active: true, respondWith: "function"}]` in seq 15 value, `pageObservations[1].value`, receipt `after.submits`, and receipt `after.pageState.submits`. `responses` unchanged. | RED, status | GREEN |
| M-COMPLETE-1 | Apply M-RESP-1 and M-SUB-1 together. Internally consistent Completed row. | RED, derived Completed vs expected pending | GREEN |
| M-ERR-1 | Set `errors` to `["Uncaught Error: dummy submit handler throw"]` in seq 15 value, `pageObservations[1].value`, and receipt `after.pageState.errors`. | RED, error | GREEN |
| M-ERR-2 | Set receipt `cases[0].invokeError` to `"respondWith promise was rejected"`, invocationId intact. | RED, error | RED (line 123) |
| M-TIME-1 | Post window 120: seq 15 `at` and `pageObservations[1].at` = 1792590707455; receipt `after.end` same, `windowMs` 120. | RED, timing (below minimum 500) | RED (line 138) |
| M-TIME-2 | Post window 3600503: `at` and `end` = 1792594307838; `windowMs` 3600503. | RED, timing (above maximum 10000) | GREEN |
| M-TIME-3 | Post window 547: `at` and `end` = 1792590707882; `windowMs` 547. | GREEN | GREEN |
| M-BENIGN-1 | Insert `WebMCP.toolsAdded` (params copied from seq 5), `at` 1792590707081, between seq 8 and invokeTool; renumber. | GREEN | GREEN |

Clean-row (unmutated) checks: C-TEXT (F4), C-EQ (F6), C-PARSE (F10), and `submits` is `[]` (array) not `null` (F11, consistent with the prompt's "unavailable submits null", which applies only to post-navigation rows).

## 4. Required rules for the proposed API (derived from na-pending)

- **R1.** Correlate every `WebMCP.toolResponded` and `WebMCP.toolInvoked` frame by exact invocationId across the whole frames array. Any response with a different or non-exact id is red. Any response for the case's own id anywhere is not pending-finite.
- **R2.** pending-finite requires: one invokeTool with `lifecycle` and `q` equal to the nonce; string invocationId with `invokeError` null; one matching toolInvoked with equal frameId and parsed input; zero responses across all frames; zero submits in pre and post; zero navigations after action; `formActive` and `formExists` true; value = nonce; focused `go`; path `/na-pending`; pre window in [250, 10000]; post window in [500, 10000]; `windowMs == end - start`; summary `end` equals the observation `at`.
- **R3.** Output, error, and delayed come only from toolResponded params and page observations. Never from fixture text or `mode`.
- **R4.** Ordering by `seq`, with non-strict time bounds. No exact-millisecond equality and no global-seq equality.
- **R5.** Expectation row gets an explicit semantic token (`pending-finite` or `no-response-in-window`), `responsesAnywhere: 0`, an explicit sequence, and the per-case evidence digest.
- **R6.** Byte-bind na-pending to the evaluated revision blob and the execution artifacts map. Treat `acquisition.revision` and `baseline` as provenance only.

## 5. Encoding and binding gaps

- **E1 (F11):** explicit pending token, `responsesAnywhere`, sequence, and evidence digest for the na-pending row.
- **E2 (F3):** encode the submit/response cross-check as a rule, not just as data.
- **E3 (F12):** `acquisition.revision` 1b5f449… and `baseline` e7cf11a8… do not byte-bind na-pending. Do not use either as the evaluation revision.
- **E4 (F13):** reconcile `sourceHeader` with the corrected note and `corpus/SOURCES.md` S101 (line 115) before the new note is written.

## 6. Checks actually run (read-only)

- **Reads:** `.ufo/waves/round-22/w1-spec.json` lines 8-10 and 147-151; `na-pending.json` frames, pageObservations, and process fields; `na-pending.html` in full; receipt `cases[0]` (lines 19-57) and `requests` (lines 686-752); `na-click.json` lines 186-215 and `na-reject.json` lines 196-212 for payload shapes; corrected note lines 1-12 and 32; `corpus/SOURCES.md` line 115; `.ufo/waves/round-21/measure-c1.mjs` lines 60-141 (including the event and summary blocks); `scripts/webmcp-lifecycle-round21.mjs` lines 226-240; WIP expectation lines 1-43; execution record lines 1-12.
- **Greps:** nonce `5956c381` and `landing\?q=` across `corpus/evidence/round-21/**`; WebMCP method vocabulary across `runtime/*.json`; producer listener and close patterns; `na-pending.html` patterns (`toolautosubmit|release|respondWith|mode`); WIP expectation response rows; execution record fields.
- **Bytes (sha256sum, working tree):** `na-pending.json`, `na-pending.html`, `receipt.json`, producer.
- **Bytes (bash, read-only `git --no-replace-objects cat-file`):** baseline 5f585773 presence and blob hashes for the four artifacts and the corrected note; execution record blob equals working tree (`65b52c0c…`); acquisition revision 1b5f449… blob for na-pending.json (`ae7e555b…`); baseline e7cf11a8… path absent; WIP expectation absent at baseline (expected, since it is WIP).
- **Quoted-key count (bash):** `"ok"` occurs 0 times in both `na-pending.json` and `na-pending.html`.
- **Existence:** round-22 `measure-c1.mjs` absent from the BuildOracle clone; WIP expectation present there.
- **Not run:** no oracle, no selftest, no browser, no network, no build, test, or lint, no Git writes, no S100 reopen.

## 7. Limits

- Old-counter outcomes are predictions from reading code, not runs.
- Only na-pending was reviewed. The other eleven rows, and whether they have legitimate teardown-time events, need per-row confirmation before the all-frames rule (R1) is adopted.
- S100 claims in the note (for example `S100:212-218`) were not checked, because S101 is the only source authorized for reopen.

## 8. Installs

None.

Report: .ufo/waves/round-22/w1/Semantic01.md
