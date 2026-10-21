# RevPreservation: round-22 W1 reverse-engineering report

- Seat: TabiR22.RevPreservation (revenger, read-only leaf). No subagents, no peer messages, no lane writes.
- Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Paths below are lane-relative unless absolute.
- Scope: (1) source/counter binding, (2) old silent-positive design intent, (3) compatibility classification with no rewrite, (4) bounded oracle constraints and surviving positive controls.
- Not done: no build, test, selftest, smoke, linter, measurement run, browser, network, REA, credential, install, or update. The frozen counter and selftest were never executed. Git was used only for read-only plumbing (`git rev-parse`, `git hash-object`, `git cat-file -e`, `git --no-optional-locks diff`). JSON projections and sha256 recomputation were done read-only.
- Tooling limit: this seat has no `lsp` tool. Call sites were established by literal grep and are labelled as such.
- Tags: **[OBS]** read or recomputed this session. **[READ]** derived from reading code, not executed. **[INF]** inference beyond explicit text. **[PROP]** proposal for BuildOracle, not executed.

## 0. Findings in brief

1. **[OBS]** The round-21 counter's success value is outcome-blind. It returns `cases.length` whenever no structural finding fires (`.ufo/waves/round-21/measure-c1.mjs:143`). It binds bytes, identities, ordering, windows, and raw-to-summary equality. No line reads a response's `status`, `output`, or `errorText`, and none checks a navigation expectation, the delayed release, a fixture `mode` literal, or a submit expectation.
2. **[OBS]** The gate's own positive control is silent. `.ufo/waves/round-21/fixtures/positive-ordered.json` has 12 of 12 rows with zero responses and zero navigations. That includes `auto-positive` and `auto-invalid`, whose retained raw each carry one pre-action response. Its selftest row `positive` expects exit 0, value 12.
3. **[OBS]** Byte binding is strong. All 25 execution-record artifact pins, the receipt digest, all 12 evidence digests, all 12 fixture digests, and all 12 nonce/id identities re-derive equal. The source body, its base64-gzip carrier, and the S100 decoded sha256 agree.
4. **[INF]** Silence was designed as "pending" only (`scripts/webmcp-lifecycle-round21.mjs:3`). The all-silent base was designed as a structural control, not a semantic oracle (`corpus/lessons/round-21.md:49-50`; `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:78-80`; witness `syntheticControl`). The counter never enforced that restriction, so silence is admitted for every row.
5. **[OBS]** The retained raw matches the note's population: 1 pending, 5 Completed, 2 Canceled, 4 Error. Its frame order and the cited Chromium 154 body anchors support the row claims (section 4 and section 6).
6. **[OBS]** One naive ordering must not be encoded. For `na-click`, the Completed response (seq 14) precedes the action-complete ack (seq 15). Only the orderings in section 7, C-09, are safe.
7. **[OBS]** Working-tree drift exists. `corpus/SOURCES.md` (S101 used-by cell plus one new log line) and `SKILL.md` (+35/-0) differ from HEAD `5f585773`. `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` exists untracked. Blob-based evaluation at a committed revision is unaffected.

## 1. Binding chain

Hashes are sha256 unless marked as a blob id. "HEAD" is `5f585773258b33d2d514b00cd0b0775333578db6`.

| Artifact (lane path) | Blob / state | sha256 | Role and check |
|---|---|---|---|
| `.ufo/waves/round-21/measure-c1.mjs` | blob `267b557c106205460de332c631923bbf38de2c44`, HEAD = worktree | `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb` | Frozen round-21 counter. Matches the pins in `measurement-binding.json` and `corpus/evidence/round-21/measurements.json`. |
| `.ufo/waves/round-21/selftest-c1.mjs` | blob `58ffcc6b9428efa1b2c84b7ca17ef1f14ada4cb4`, HEAD = worktree | `1fa3d8278e4b74ef4fd4e886dbf551a21c16de663e490709030247b3fd29c953` | Frozen selftest. Builds mutated copies in temporary git repositories (L187-214). Not run here. |
| `.ufo/waves/round-21/fixtures/expected.json` | blob `1a6290a4613944ecdd39290ce86bf5320439927c`, HEAD = worktree | `37cc2995fd0ca24f445439e7716ebf8d0daba514745f5ab3738603a21d918eec` | Frozen expectation table: 83 rows, each with exit, value, and finding. |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | blob `7e266fc65c8d2980c54b306964d7de79554ba4f8`, HEAD = worktree | `aa3726264f2a4f883855aecbce0fec15dcc3d597e6e19ec943fcfe78817f8e75` | Synthetic all-silent base: invocation ids `invocation-00..11`, small synthetic `at` values. |
| `scripts/webmcp-lifecycle-round21.mjs` | blob `e25b5f07de39e71c477905926ee07eb4fb2939a3`, HEAD = worktree | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | Producer. Equals `PRODUCER_SHA` (counter L31), `receipt.producer.sha256`, and `execution.producerSha256`. |
| `corpus/evidence/round-21/runtime/receipt.json` | blob `59912421a0051187990f9e4ceab4473aba44b01d` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | Equals `execution.receiptSha256`. |
| `.ufo/waves/round-21/runtime-execution-finalized.json` | not captured | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | Record: argv, exit 0, 25 artifact pins. All 25 pins re-derived equal. |
| `corpus/evidence/round-21/runtime/<id>.json` and `<id>.html` (12 each) | not captured | per-file pins in the execution record | `evidence.sha256` equals the JSON bytes (12/12). `evidence.fixture.sha256` equals the HTML bytes (12/12). `nonce` and `id` match the receipt row (12/12). |
| `.ufo/waves/round-21/sources/html_form_element.cc` | not captured | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` (1740 lines) | Identical to `corpus/evidence/round-20/sources/html_form_element.cc`. Equals the S100 decoded sha in `corpus/SOURCES.md:114`. |
| `.ufo/waves/round-21/sources/html_form_element.cc.base64.gz` | not captured | stored `46966f0544d0d9628cd6d3823b1898fe224116a80aaff2e24a5b38da34281e52` | Equals `source-opening.json` `storedSha256`. Gunzip gives `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`, which equals `rawSha256`. Gunzip then base64-decode gives the body sha above. |
| `.ufo/waves/round-21/source-opening.json` | not captured | n/a | `location` `html_form_element.cc:213-214`. The quote is on line 213. The counter's only text-level source check is this quote (counter L83). The body bytes are pinned by sha256 (counter L91). |
| `corpus/SOURCES.md` | HEAD blob `5b09a843c211e33e1477f5e4c5a9eb037210cabd`; worktree blob `ba46acb705132fe8ef84dbce72c8e81bf51d1c41` (drift) | n/a | Line 114 is the S100 row: URL, anchors `174-328,635-842`, decoded sha, mined, used-by three notes. Line 115 is the S101 row: own-work, tier A, mined, receipt path. |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | blob `1941f766fcad495c669c800d0f16e20bd505dbbb` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | Canonical round-21 entry. Line 1 begins `source: S101 ...; S100 ...`. The counter parses this header (counter L94-100). |
| `corpus/knowledge/webmcp-nonautosubmit-round-21.md` | blob `b4aa4e4a307844530880ff68009125c177afcae5` | `8c9be28c7becea24b8ea588f54d8962af3ea665f479d98eb4b984bc6b7215d2c` | Superseded historical prefix. Not admitted. |
| `corpus/lessons/round-21.md` | blob `847edc036bb47c0dc5a619cf19bc2c1ade851787` | `e2a28794ad83559c0843c4162520ef78dbe8e3859060c6f028fc5ba661e5517c` | Written once (`:135-136`). Not a counted input. |
| `SKILL.md` | HEAD blob `0ebee45fd75e040d83d633c39eebb0b1e4a2da66`; worktree blob `7058140faa418d1de367e5aba177c8a0f5441760` (drift +35/-0) | n/a | Counted input. Required string `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` present (worktree line 2365). |
| `corpus/evidence/round-20/lifecycle/decisions.json` | not captured | n/a | S096-era anchors LC01-LC12. Eight of twelve re-confirmed by line grep (LC01, LC03, LC04, LC05, LC06, LC10, LC11, LC12). LC02, LC07, LC08, and LC09 were not re-read. |
| `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` | absent at HEAD; worktree untracked, 7718 bytes | n/a | New round-22 entry. Line 1 begins `source: S101 —`. |
| `corpus/evidence/round-22/semantic-expectations.json`, `.ufo/waves/round-22/measure-c1.mjs` | absent (`corpus/evidence/round-22` does not exist) | n/a | Created by BuildOracle. Absent at `5f585773`, so the contract baseline is 0. |
| `.ufo/waves/round-21/final/semantic-contrast-witness.json` | not captured | n/a | Witness. `syntheticControl = {class: "structural only, not a semantic oracle", cases: 12, allSilent: true}`. Limit: "A coherent changed status can remain structural while contradicting the published contrast." |

**Binding strength.** Digest and identity bindings are strong. Grammar bindings (note header, SOURCES cell positions, attribute grammar) are structural. Source-content binding is one quote, so it is weak. Outcome semantics are unbound.

## 2. Counter reverse-engineering (`.ufo/waves/round-21/measure-c1.mjs`)

### 2.1 Check map

| Lines | Check | Outcome-sensitive? |
|---|---|---|
| 31-33 | `PRODUCER_SHA`; `INPUT_PATHS` (8 named paths plus the 25-file `runtime/` prefix = 33 inputs); 23 finding IDs | n/a |
| 61-62 | Missing receipt and note gives baseline 0. Only one present gives `partial_state` (exit 1). | no |
| 63, 66, 104-105 | Receipt schema, exact 12 IDs, case shape, unique nonces | no |
| 67, 70 | Producer blob digest; execution record exit, argv, artifact pins, receipt digest | no |
| 72-73 | Environment pins (node, chromium, playwright, flags); cleanup flags | no |
| 74-84, 91 | Carrier gunzip/base64 chain (74-84); body sha256 (91); quote contained in lines 213-214 (83) | no (one quote only; no other anchor is read) |
| 85-100 | S100 row and S101 row checks; note header associations; SKILL reference | no |
| 107-110 | Evidence path and sha; evidence shape | no |
| 112 | Evidence `id`, `nonce`, `autosubmit`, `action`, `mode` against `CONFIG` | mode is the evidence's self-declared field, not the fixture's |
| 114-116 | Fixture path and sha; nonce substring; `toolautosubmit` attribute presence | no mode, `type`, or `release` check |
| 118 | Sequence contiguous; `at` monotone | no |
| 119-123 | Exactly one `invokeTool`; input `q` equals nonce, or `not-an-email` when evidence mode is `invalid`; invocation id identity | no |
| 124-129 | Exactly one `toolInvoked`; no response before invoke; payload identity | response count unbounded |
| 130-137 | Markers, action phase, order answered < pre < action < completed < post; page nonce echo | response placement unbounded |
| 138 | Minimum windows: pre >= 250 ms, after >= 500 ms, after starts before action | no maximum |
| 139 | Equality of summary to raw: `responseCount`, `formActive`, `responses`, `pageState`, `submits`, `navigations` | equality only |
| 140-141 | Context cleanup; no blocked requests or downloads | no |
| 143 | `result(findings.length ? 0 : cases.length)` | — |

### 2.2 Outcome-blind admissions

- **A1 [READ].** Silence is unbounded for any row. Nothing requires any `toolResponded` (L124, L139). The base fixture passes at 12 with all 12 rows silent.
- **A2 [OBS grep + read].** Response payload fields are never read. `status`, `errorText`, and `output` appear nowhere in the counter. The only `status` tokens are the two spawn exit-status reads, at L146 and L159.
- **A3 [OBS grep + read].** Fixture semantics are unbound. The counter has no `const mode`, `type="email"`, or `window.release` reference. Mode is checked only as the evidence field (L112), and the fixture is checked only for nonce and autosubmit (L114-116).
- **A4 [OBS grep].** Delayed semantics are unbound. `release` and `delayed-before-release` never appear. `delayed` appears only as a CONFIG string (L16).
- **A5 [OBS grep].** Native navigation is not required. `landing` never appears, and L139 compares navigations only to the raw frames.
- **A6 [READ].** `formActive` is compared for consistency only (L139). No expected value is required.
- **A7 [READ].** Response placement between the pre-marker and action dispatch is unbound. L136 orders markers and action frames only. A response in that gap is admitted if the summary is coherent.
- **A8 [READ].** Duplicate responses per invocation are admitted. L124 collects all matches and nothing counts them.
- **A9 [READ].** There is no expectation that autosubmit rows have `responseCount` 1 or that non-autosubmit rows have 0. L139 is equality only.
- **A10 [OBS grep + read].** Submit expectations are absent. The counter has no `agentInvoked`, `isTrusted`, or submit-count check (grep), and no `active` check (full read).
- **A11 [READ].** `pageState.errors` is compared only by equality (L139).
- **A12 [READ].** Window maxima are absent (L138).

The selftest's response-related reds test binding coherence, not semantics:

- `false-pending` (selftest L41-46) sets `after.responses` but not `preAction.responseCount`. It also inserts the response at index 2, before `invokeTool`. Its red therefore comes from `summary_mismatch` and `event_identity`.
- `response-mismatch` (L47) and `response-payload-mismatch` (L176-180) change only the summary.
- No selftest row tests a coherent semantic change.

### 2.3 Silent instances already in the retained gate

- Base fixture: 12/12 rows have `resp=0`, `pre=0`, `submits=[]`, and `navs=0`. This includes the two autosubmit rows, which are non-silent in the retained raw.
- `expected.json` exit-0 rows (7 in total, including `baseline`):
  - `positive`: value 12
  - `baseline`: value 0
  - `unavailable-null-positive`: value 12
  - `late-response-outside-window`: value 12
  - `foreign-response-ignored`: value 12
  - `boolean-false-attribute-green`: value 12
  - `quoted-attribute-green`: value 12
- These base mutations use synthetic `at` values (e.g., 1500, 1800) that are valid only in the synthetic timeline. Re-basing them onto the retained acquisition requires real timestamps, or `order_mismatch` fires.

## 3. Old silent-positive design intent

Quoted design text:

- Producer header (`scripts/webmcp-lifecycle-round21.mjs:2-3`): "Finite loopback observations, not a browser conformance suite." and "Pending means only no correlated response in the recorded observation window."
- Counter header (`measure-c1.mjs:2`): "Counts finite evidence-backed observations, NOT semantic entailment or branch coverage."
- Lesson (`corpus/lessons/round-21.md:49-50`): "The structural positive fixture is deliberately all-silent and is not a semantic oracle."
- Corrected note (`webmcp-nonautosubmit-round-21-corrected.md:78-80`): "The gate's positive CLI fixture is deliberately structural and all-silent; it is not a semantic oracle for the real contrasts. Separate case/sequence-anchored review is retained in the round's semantic contrast witness."
- Witness: `syntheticControl` (class "structural only, not a semantic oracle", `allSilent: true`) and the limit quoted in section 1.
- Closure (`.ufo/waves/round-22/round21-closure.json`, C1 scope): "independently checked raw semantics". The closure's `semantic_remeasurement` records that this was done by non-author manual reading, not by the counter.

Reconstruction:

- **[INF] (a)** "Silence" was defined as the representation of pending: a finite window with no correlated response. It was not defined as success or failure.
- **[INF] (b)** The gate was built to prove retained-acquisition integrity and internal consistency. It needed a structurally valid positive fixture. The all-silent synthetic base was the cheapest such fixture, and since the counter never asks what each row should have produced, silence passes.
- **[INF] (c)** Outcome claims were deferred to a separate case-anchored witness. The problem is that the count (12) was presented beside the claim of independently checked semantics, with no machine-checked outcome behind it.
- **[OBS] (d)** Source intent for non-autosubmit forms is pause-and-wait for the user (`html_form_element.cc:213-217`). The same file carries an open TODO saying the mechanism should key off the autosubmit attribute (`:201-203`). So "pending" is build-scoped design intent, not a stable contract. The raw shows agent-invoked completion in the same form (`agentInvoked: true`), which the note correctly rejects as "only a human can complete".

## 4. Source anchors (retained body, 1740 lines)

| Note claim | Note anchor | Body verification [OBS] |
|---|---|---|
| Auto-positive is immediate | S100:218-221 | Lines 219-220: `PrepareForSubmission` called directly |
| Non-autosubmit pauses | S100:212-218 | Line 215 `submit_button->Focus()`; line 217 `context->PauseExecution()`; lines 213-214 the quoted comment |
| Click/requestSubmit dispatch; agent flag | S100:298-319, 720-815 | Line 771 `setAgentInvoked(true)`; dispatch inside `PrepareForSubmission` (635-832) |
| Validation gate and text | S100:729-758 | Line 729 gate with `should_submit = false` at 730; line 733 `"Form validation failed: "`; name, `": "`, `validationMessage()`, and `". "` appended in the loop that follows |
| Reject | S100:320-327, 787-806 | Lines 322-323 `ReportException`; line 326 `"respondWith promise was rejected"` |
| Throw (preventDefault without respondWith) | S100:807-813 | Lines 810-813 concatenated: "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result" |
| Delayed completion | S100:290-319, 787-806 | `HandleWebMcpToolResponse` (290-328) resolve path |
| Native submit (navigation sentinel) | S100:834-842 | `submitFromJavaScript` (834-843); line 841 `CallDoneCallback(base::ok(String()))`; line 829 in `PrepareForSubmission` |
| Reset cancel | outside registered ranges | Body line 1104: "Tool execution cancelled by a form reset" |
| Remove cancel | outside registered ranges | Body lines 393-394 and 451: "Tool execution cancelled, since tool definition was updated" |
| Abort cancel (not exercised) | outside registered ranges | Lines 224-229: "Tool execution cancelled by abort signal" |

- Registered S100 ranges are `174-328` and `635-842` (`corpus/SOURCES.md:114`). Every S100 citation in the corrected note falls inside them [OBS, by reading].
- The reset and remove texts are present in the retained body but outside the registered ranges. They can be cited only as S101 observations, not as S100 anchors.
- The source is tag 154.0.8037.97, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` per `SOURCES.md:114`. It was not re-fetched (no network). Binding is to the retained bytes only.
- Round-20 `S096` anchors inherit from the same bytes: decoded sha equal, anchors `174-328,729-758,818-842`. S100 extends that set (`SOURCES.md:110, 114`).

## 5. Compatibility classification (no rewrite)

| Artifact | Class | Round-22 treatment |
|---|---|---|
| `.ufo/waves/round-21/measure-c1.mjs` | Retain verbatim. Historical structural counter. | Not imported and not edited. Its metric `c1_lifecycle_observations` remains a binding tally. |
| `.ufo/waves/round-21/selftest-c1.mjs` and `fixtures/expected.json` | Retain verbatim | Structural selftest. Not the round-22 selftest. |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | Retain verbatim; label as structural-only | Not a semantic positive. Excluded from round-22 controls (R-01). |
| `.ufo/waves/round-21/fixtures/source-carrier.gz` | Retain | Binding input for the frozen selftest only. |
| `.ufo/waves/round-21/history/*` | Retain | Historical acquisitions. The index maps old paths. |
| `corpus/evidence/round-21/runtime/*` | Retain; immutable raw | The only outcome input for round-22, read by blob at the revision. |
| `scripts/webmcp-lifecycle-round21.mjs` (sha `bc11e4d6...`) | Retain; producer frozen | No new producer claim. Its `CASES` table (lines 14-27) and its `fixture()` template (105-123) are the constant source for expectations. |
| `.ufo/waves/round-21/source-opening.json`, `sources/*` | Retain | Binding inputs. |
| `corpus/SOURCES.md` S100 row (line 114) | Immutable cells | Do not widen anchors. Reset and remove lines are body-only observations. |
| `corpus/SOURCES.md` S101 row (line 115) | Mutable used-by per policy | Worktree already appends the round-22 note path. Reconcile at integration. Status stays `mined`. |
| Corrected note | Canonical round-21 entry | Retain; not rewritten. |
| Original round-21 note | Superseded prefix | Retain; not admitted. |
| `corpus/lessons/round-21.md` | Written once | Retain; no edit. |
| `SKILL.md` | Counted input | Retain the required string. The worktree +35/-0 change is for the integration owner to commit or drop. |
| Round-22 note (worktree untracked) | New entry | Keep first line `source: S101 —`. |
| Round-22 expectations and gate | To be created | Absent at HEAD, so baseline 0. |
| Metric names | Two coexist | Keep `c1_lifecycle_observations` (frozen) and `c1_semantically_checked_lifecycle_rows` (new). Never derive the new metric from the old. |

Old finding IDs mapped to the contract's export names (candidate mapping):

| Old finding (L33) | Round-22 export |
|---|---|
| `partial_state`, `receipt_shape`, `case_shape` | `input_shape` |
| `case_set`, `nonce_reused` | `case_set` |
| `source_binding`, `note_missing` | `source_binding` |
| `producer_digest`, `execution_binding`, `environment`, `cleanup`, `context_cleanup`, `boundary_violation`, `evidence_missing`, `evidence_digest`, `fixture_digest`, `case_identity`, `raw_invoke`, `invoke_identity`, `event_identity`, `summary_mismatch` | `evidence_binding` |
| `order_mismatch`, `window_mismatch` | `semantic_timing` |
| — (new) | `semantic_status`, `semantic_output`, `semantic_error`, `semantic_timing` (placement), `semantic_navigation`, `semantic_delayed`, `revision_input` |

Baseline and partial rules (L61-62) should be kept: both absent gives baseline 0 with exit 0, and partial gives exit 1. The contract already says this.

## 6. Retained raw, frame level [OBS]

Frame sequence numbers are from each `<id>.json` (`frames[].seq`). Every row has one `toolInvoked` at seq 11 and zero `error` frames.

| Row | Response (seq, status) | Pre-marker | Action (seq) | Complete | Other | Post-marker |
|---|---|---|---|---|---|---|
| na-pending | none | 12 | 13 none | 14 | — | 15 |
| na-click | 14 Completed | 12 | 13 click | 15 | — | 16 |
| na-requestsubmit | 15 Completed | 12 | 13 requestSubmit | 14 | — | 16 |
| na-native-submit | 16 Completed | 12 | 13 submit | 14 | navigation 15 | 17 |
| na-reset | 15 Canceled | 12 | 13 reset | 14 | — | 16 |
| na-remove | 15 Canceled | 12 | 13 remove | 14 | — | 16 |
| na-reject | 15 Error | 12 | 13 requestSubmit | 14 | — | 16 |
| na-throw | 15 Error | 12 | 13 requestSubmit | 14 | — | 16 |
| na-delayed | 17 Completed | 12 | 13 requestSubmit | 14 | observation 15 (`delayed-before-release`), release 16 | 18 |
| na-invalid-submit | 15 Error | 12 | 13 invalidRequestSubmit | 14 | — | 16 |
| auto-positive | 12 Completed (before pre) | 13 | 14 none | 15 | — | 16 |
| auto-invalid | 12 Error (before pre) | 13 | 14 none | 15 | — | 16 |

Pre and post state:

| Row | Pre: formActive, focused, submits | Post: formActive, value, submits, errors | Post URL |
|---|---|---|---|
| na-pending | T, go, 0 | T, nonce, [], [] | own path |
| na-click | T, go, 0 | F, nonce, 1, [] | own path |
| na-requestsubmit | T, go, 0 | F, nonce, 1, [] | own path |
| na-native-submit | T, go, 0 | F, null, null (absent), absent | `/landing?q=<nonce>` |
| na-reset | T, go, 0 | F, "", [], [] | own path |
| na-remove | T, go, 0 | F (formExists false), null, [], [] | own path |
| na-reject | T, go, 0 | F, nonce, 1, ["Uncaught Error: dummy rejection"] | own path |
| na-throw | T, go, 0 | F, nonce, 1, ["Uncaught Error: dummy submit handler throw"] | own path |
| na-delayed | T, go, 0 (1 at the delayed marker) | F, nonce, 1, [] | own path |
| na-invalid-submit | T, go, 0 | F, "", [], [] | own path |
| auto-positive | F, "", 1 | F, nonce, 1, [] | own path |
| auto-invalid | F, "", 0 | F, "not-an-email", [], [] | own path |

Every submit event in a tool row has `active: true` and `agentInvoked: true` (6 of 6 rows with submits). `isTrusted` is `true` for all of them, but it is not evidence of a human.

## 7. Bounded oracle constraints [PROP]

These are proposals for BuildOracle's independent expectation file. They are derived from the producer `CASES` table, the fixture template, and the Chromium anchors in section 4. They are not computed from the receipt, and none has been executed.

### 7.1 Per-row expectation table

Payload notation: `N` is the case nonce. "Pending" means no matching response in either recorded window.

| Row | Autosubmit | Action | Mode | Status | Payload or errorText (exact unless marked) | Pre responses | In-window responses | Navigations (in window) | Submits | Page errors |
|---|---|---|---|---|---|---|---|---|---|---|
| na-pending | F | none | success | pending | none | 0 | 0 | 0 | 0 | [] |
| na-click | F | click | success | Completed | output `{"ok":true,"nonce":N,"q":N}` | 0 | 1 | 0 | 1 | [] |
| na-requestsubmit | F | requestSubmit | success | Completed | same as above | 0 | 1 | 0 | 1 | [] |
| na-native-submit | F | submit | success | Completed | output `[{"dummy":"landing"}]` | 0 | 1 | 1: `^http://127\.0\.0\.1:\d+/landing\?q=N$` | null (unavailable, not zero) | absent |
| na-reset | F | reset | success | Canceled | errorText "Tool execution cancelled by a form reset" | 0 | 1 | 0 | 0 | [] |
| na-remove | F | remove | success | Canceled | errorText "Tool execution cancelled, since tool definition was updated" | 0 | 1 | 0 | 0 | [] |
| na-reject | F | requestSubmit | reject | Error | errorText "respondWith promise was rejected" | 0 | 1 | 0 | 1 | ["Uncaught Error: dummy rejection"] |
| na-throw | F | requestSubmit | throw | Error | errorText "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result" | 0 | 1 | 0 | 1 | ["Uncaught Error: dummy submit handler throw"] |
| na-delayed | F | requestSubmit | delayed | Completed | output `{"ok":true,"nonce":N,"q":N}`, only after release | 0 | 1 (after release) | 0 | 1 (already 1 at the delayed marker) | [] |
| na-invalid-submit | F | invalidRequestSubmit | success | Error | pattern `^Form validation failed: q: .+\. $` (trailing space); observed "Form validation failed: q: Please fill out this field.. " | 0 | 1 | 0 | 0 | [] |
| auto-positive | T | none | success | Completed | output `{"ok":true,"nonce":N,"q":N}` | 1 | 1 | 0 | 1 (already at pre) | [] |
| auto-invalid | T | none | invalid | Error | pattern as above; observed "Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. " | 1 | 1 | 0 | 0 | [] |

### 7.2 Cross-row constraints

- **C-01 (case_set, input_shape).** Exactly the 12 ids. Nonces and invocation ids are unique. Evidence `id` and `nonce` equal the receipt row. [Re-derived 12/12.]
- **C-02 (evidence_binding).** Receipt digest equals `execution.receiptSha256`. Each of the 25 pins equals the file bytes. Each case's evidence sha and fixture sha equal the bytes. [Re-derived.]
- **C-03 (evidence_binding).** Producer sha `bc11e4d6...` equals `receipt.producer.sha256`, `execution.producerSha256`, and the committed producer blob at the revision.
- **C-04 (source_binding).** Body sha equals S100 decoded sha and the round-20 copy. Carrier chain holds (stored, raw, decoded). The quote is contained in lines 213-214. The S101 row is own-work, tier A, mined, with the receipt path. The note's first line begins `source: S101 —` and contains S100 with its URL. [Verified.]
- **C-05 (source_binding).** Every S100 line citation in the note lies inside `174-328` or `635-842`. This can be enforced by regex and range comparison. [Verified by reading.]
- **C-06 (source_binding).** The reset and remove texts may be cited only as S101 observations. Body lines 1104, 393-394, and 451 are body-present but outside the registered S100 ranges. The oracle must not present them as S100 anchors.
- **C-07 (semantic_status).** Each row's status is from the table in 7.1. The allowed set is {pending, Completed, Canceled, Error}. Expectations are authored constants, not computed from the receipt.
- **C-08 (semantic_status).** Pending means zero responses for the invocation in [invoke, post-marker]. Only `na-pending` may be silent. Every other row has exactly one `toolResponded` in the full trail. [Raw: 11 rows have exactly one response; na-pending has zero.]
- **C-09 (semantic_timing, semantic_navigation, semantic_delayed).** Verified orders only:
  - Auto rows: invoke < response < pre-marker (11 < 12 < 13).
  - Non-auto non-pending rows: pre-marker < action < response < post-marker. Action-complete is not a bound, because `na-click` has response 14 before complete 15.
  - Native: navigation < response (15 < 16).
  - Delayed: delayed marker < release < response (15 < 16 < 17).
- **C-10 (semantic_status).** Submit counts: 1 for click, requestSubmit, delayed, reject, throw, and auto-positive (already 1 at pre); 0 for pending, reset, remove, invalid-submit, and auto-invalid; null for native. Each submit has `active === true` and `agentInvoked === true`. Do not treat `isTrusted` as evidence of a human. [Source: line 771 sets `agentInvoked` only on the declarative path. Line 729-730 suppresses submit when validation fails.]
- **C-11 (semantic_output, semantic_error).** Completed carries exactly `{invocationId, output, status}`. Error and Canceled carry exactly `{errorText, invocationId, status}`. [Raw key sets confirmed.]
- **C-12 (semantic_output).** Non-native Completed output deep-equals `{"ok":true,"nonce":N,"q":N}` (producer line 117; source JSON serialization in lines 290-319). Native output deep-equals `[{"dummy":"landing"}]` (producer line 137 landing JSON-LD). This native mapping is runtime-observed, not source-proven.
- **C-13 (semantic_error).** Exact strings for reject, throw, reset, and remove, as listed in 7.1. Validation rows match `^Form validation failed: q: .+\. $`. The structure (prefix, name, `: `, message, `. `) follows source lines 733 and the loop after it. The message itself is environment-dependent.
- **C-14 (semantic_error).** Page errors: reject yields "Uncaught Error: dummy rejection" (source 322-323 `ReportException`). Throw yields "Uncaught Error: dummy submit handler throw" (producer line 116). Other rows yield [], or the key is absent for native.
- **C-15 (semantic_navigation).** Native has exactly one in-window `Page.frameNavigated` with the landing URL and nonce. Every other row has zero in-window navigations.
- **C-16 (semantic_delayed).** Only the delayed row has a `delayed-before-release` observation (submits 1, formActive true, no response yet). It has exactly one `release` frame between that observation and the response.
- **C-17 (semantic_status, semantic_timing).** Pre-state: non-autosubmit rows have formActive true and focused `go` (source line 215 `Focus`). Autosubmit rows have formActive false and focused "" (no Focus call on that branch, lines 218-220). `responseCount` is 1 for autosubmit rows and 0 otherwise.
- **C-18 (semantic_output).** Post-state values: nonce for click, requestSubmit, delayed, reject, throw, pending, and auto-positive; "" for reset and invalid-submit; null for remove and native; "not-an-email" for auto-invalid. formActive is true only for pending.
- **C-19 (semantic_timing).** Pre window >= 250 ms and equal to end minus start. After window >= 500 ms and equal to end minus start. After starts no later than the action. No `error` frames. A maximum window is optional; if added, cite the producer's `bounded()` constants (10 s action, 5 s observe).
- **C-20 (evidence_binding).** Fixture literal `const mode="<mode>";` equals the row mode (12 of 12 match). `type="email"` appears only in `auto-invalid` (12 of 12 checked). `toolautosubmit` is present iff autosubmit. `<input name="q" required` and `action="/landing" method="get"` are present in all 12.

### 7.3 Must-not-assert

- Human or trusted identity from `isTrusted`; absent user activation.
- Pending indefinitely (only finite windows).
- That Completed implies respondWith ran (native completes through the navigation sentinel).
- That a null C++ string maps to the native output array (runtime-only mapping).
- That reset and remove universally cancel, or that every DOM mutation cancels.
- That throw always navigates, or that autosubmit guarantees success.
- Locale-independent validation text.
- Source-to-binary equivalence or publisher authenticity.
- That the counter checks any S100 anchor beyond the 213-214 quote.

## 8. Surviving positive controls and retired controls

Surviving means a positive control whose expectation still holds once silent admission is removed. Retired means a positive that passes only because silence is admitted.

**Surviving [PROP]:**

- **P-01.** The unmodified retained acquisition at a committed revision gives exit 0 and value 12 (rows 12/12 under 7.1).
- **P-02.** Baseline: no expectation file and no note gives exit 0 and value 0. Old analogue: `baseline` (0).
- **P-03.** Partial: only one of expectation file or note gives exit 1 and value 0. Old analogue: `partial` (exit 1, `partial_state`).
- **P-04.** A late response after the post-marker on `na-pending` leaves it pending and clean. Old analogue: `late-response-outside-window` (exit 0, value 12). Must be re-based onto real timestamps.
- **P-05.** A foreign-invocation response inside the window on `na-pending` is ignored. Old analogue: `foreign-response-ignored`.
- **P-06.** Native `submits: null` is clean. Old analogue: `unavailable-null-positive`. The old `unavailable-to-empty` red is only an incoherent summary/raw mismatch. A coherent `[]` must be red under the new oracle (NC-06).
- **P-07.** `toolautosubmit="false"` is still autosubmit, by attribute presence. Old analogue: `boolean-false-attribute-green`.
- **P-08.** A quoted attribute value containing `toolautosubmit` on a non-autosubmit row is not an attribute. Old analogue: `quoted-attribute-green`.
- **P-09.** The two held-ground rows (`auto-positive`, `auto-invalid`) are real non-silent positive and negative pipeline controls. They are not new non-autosubmit branches.

**Retired:**

- **R-01.** `fixtures/positive-ordered.json` used as a semantic positive. Under the new oracle, 11 of its 12 rows fail `semantic_status`. It remains a structural-only control in the frozen selftest.
- **R-02.** The frozen `positive` row (value 12) as evidence of semantic correctness.

## 9. Proposed negative controls [PROP, not run]

Each must reseal raw, summary, and digest links coherently, so that red reflects semantics rather than stale hashes (contract). "Old" states whether the frozen counter would admit the coherent variant, by reading only.

| ID | Mutation (coherent) | Expected new finding | Old counter (reading) |
|---|---|---|---|
| NC-01 | `na-click`: remove its response frame; summary `[]`; `responseCount` unchanged | semantic_status | admitted (A1) |
| NC-02 | `na-pending`: insert Completed response after `toolInvoked` and before pre-marker; update `responseCount` | semantic_status | admitted (A1, A7) |
| NC-03 | `na-reject`: change response to Completed with output `{ok,nonce,q}` | semantic_status, semantic_output | admitted (A2) |
| NC-04 | `na-reset`: replace errorText with the remove sentence | semantic_error | admitted (A2) |
| NC-05 | `na-native-submit`: remove the in-window navigation; `navigations: []` | semantic_navigation | admitted (A5) |
| NC-06 | `na-native-submit`: post `submits: []` instead of null | semantic_output | admitted (A10) |
| NC-07 | `na-delayed`: move response before release; renumber seq | semantic_delayed | admitted (A4) |
| NC-08 | `na-reject`: rewrite fixture literal `const mode="reject"` to `"success"`; reseal fixture and evidence sha | evidence_binding | admitted (A3) |
| NC-09 | `auto-positive`: move response after pre-marker; `responseCount` 0 | semantic_timing | admitted (A9) |
| NC-10 | `na-click`: add a second Error response with the same invocation id | semantic_status | admitted (A8) |
| NC-11 | `na-pending`: formActive false at pre and post | semantic_status | admitted (A6) |
| NC-12 | `na-throw`: errorText replaced with the reject text | semantic_error | admitted (A2) |
| NC-13 | `na-invalid-submit`: add a submit event (active true) | semantic_status | admitted (A10) |
| NC-14 | `na-reset`: add a page error | semantic_error | admitted (A11) |
| NC-15 | `na-click`: move response into the pre-to-action gap; update `responseCount` | semantic_timing | admitted (A7) |

Existing binding reds (producer edit, source edit, evidence edit, fixture edit, invocation mismatch, summary-only mismatch) remain valid as binding controls.

## 10. Working tree, history, and peer draft

- **[OBS] `corpus/SOURCES.md`.** The worktree differs from HEAD in two places. Line 115 (S101 used-by) adds `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. A new line 156 is a 2026-10-21 round22 study log entry. HEAD has neither. The counter reads HEAD blobs at a revision, so it is unaffected. Integration owner decides.
- **[OBS] `SKILL.md`.** +35/-0. No deletions. Required corrected-note string retained (worktree line 2365).
- **[OBS] Round-22 draft note** (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`). Its line 1 has the S101-first grammar. Its per-case table (lines 35-48) matches the raw verified in section 6. Its independence claim (lines 24-25) is achievable with producer- and source-derived constants. Its line 3 names `--selftest`; the round-22 selftest must not reuse the all-silent base (R-01).
- **[OBS]** The draft's chronology section (lines 64-91) concerns wake history, outside this seat's scope. Not verified here.
- **[OBS]** No round-22 directory `corpus/evidence/round-22` and no `.ufo/waves/round-22/measure-c1.mjs` exist. Consistent with contract baseline 0.

## 11. Limits and confidence

- Nothing was executed. Every negative-control admission in section 9 is [READ]. None has been confirmed by running the counter.
- Four round-20 LC anchors (LC02, LC07, LC08, LC09) were not re-read.
- Blob identities for the 33 inputs at the measured revision `2d5eaaa3` were not compared. The blob checks were HEAD versus worktree at `5f585773` for the files listed in section 1.
- The S100 commit `b510e9d7...` was not re-fetched. Source identity claims bind to the retained bytes only.
- Validation message text depends on environment (locale, Chromium build). Exact matches hold only for the pinned environment. Section 7 uses a pattern for structure.
- The pre-action focus constraint (C-17) depends on the line 215 `Focus` call. That source is build-scoped and carries an open TODO at lines 201-203.
- Confidence: binding values **high** [OBS]. Outcome-blind admissions: **high** for the code facts (grep-verified), **medium** for coherent-variant admission (READ only). Design-intent reconstruction: **medium-high** (quoted text plus labelled inference). Per-row expectations: **high** for raw and for the verified source lines.
- Installs and updates: none.

Report: .ufo/waves/round-22/w1/RevPreservation.md
