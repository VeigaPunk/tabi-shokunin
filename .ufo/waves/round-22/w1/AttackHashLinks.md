# AttackHashLinks — round-22 W1

Seat: TabiR22.AttackHashLinks (reviewer, leaf, read-only). Target: shared oracle/debt design. Question: a coherent raw change with every digest link re-sealed — is it still rejected for wrong semantics?

## 0. Axes, inputs, limits

Axes: (A) digest-link closure under coherent re-seal; (B) fields the round-21 counter reads versus fields that carry semantics; (C) false clean (exit 0, value 12); (D) over-rejection of preserving edits; (E) debt-side chronology and digest links.

Read (retained, read-only):
- `.ufo/waves/round-21/measure-c1.mjs` (full, lines 1-163) — the frozen structural counter.
- `.ufo/waves/round-21/selftest-c1.mjs` (mutate; `sealAcquisition` at 187-193).
- `.ufo/waves/round-21/fixtures/expected.json` (controls named below).
- `.ufo/waves/round-21/runtime-execution-finalized.json` (called E below).
- `scripts/webmcp-lifecycle-round21.mjs` (producer, 1-268).
- `corpus/evidence/round-21/runtime/receipt.json` and the 12 case JSON and fixture HTML files (projected with `?q=`).
- `.ufo/waves/round-21/w2-returns.json` (structure and cited digests); `.ufo/waves/round-21/w2/MutationSummaries.md`; `.ufo/waves/round-21/w2/MutationOrdering.md`.
- `.ufo/waves/round-22/w1-spec.json` (BuildOracle, BuildDebt, AttackHashLinks items).

Not present at review (checked by path): `.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`, `.ufo/waves/round-22/clones/BuildOracle/.ufo/waves/round-22/`. Findings therefore attack the design as written in the wave API and finding list. L1 must re-check each row against the implemented code.

Executed: read-only JSON projections, grep, and `sha256sum`. No counter, selftest, build, test, linter, browser, network probe, service, install, or peer message. Tools installed or updated: none.

## 1. Verdict

1. The retained round-21 chain is intact. All 25 runtime files (receipt, 12 case JSON, 12 fixture HTML) hash to the `artifacts` map in E, entry for entry. The receipt is `4bc79636…`. The producer `scripts/webmcp-lifecycle-round21.mjs` is `bc11e4d6…`, equal to the counter's `PRODUCER_SHA` (`measure-c1.mjs:31`).
2. Every link is checked by the round-21 counter (:67, :70, :83, :108, :114), but the chain is self-sealing. Only the producer and the S100 source are code-pinned (`measure-c1.mjs:31, 38, 83`). Receipt, case JSON, and fixtures link only to each other; E links to them and nothing links to E. `selftest-c1.mjs:187-193` re-seals the whole acquisition in one pass.
3. The counter never reads status, errorText, pageErrors, requests, release ordering, navigation URL content, the fixture mode literal, native `submits` shape, or execution stdout. Those fields are only mirror-compared (:139) or not read. Coherent semantic counterexamples CE1–CE10 and CE15 (with variants CE3b, CE6b) stay at exit 0, value 12 under round-21.
4. Two design paths give false clean unless pinned: expectations read from REV without a code pin (CE13), and fixtures bound only by a link to the case JSON (CE14, CE14b).
5. The four behaviours the BuildOracle prompt names each have a coherent counterexample that round-21 accepts: native landing output array (CE5); unavailable submits null (CE15); reject and throw exact errors (CE3a, CE3b); delayed-before-release (CE8).
6. Debt side: retained W2 returns cite digests and invocation IDs from other acquisitions. A coherent relabel of the digest does not cure the chronology (DCE1–DCE4).

## 2. Digest-link inventory

| # | Link | Round-21 check | Code-pinned | Closure needed on coherent edit |
|---|---|---|---|---|
| L1 | `receipt.producer.sha256`, `E.producerSha256` → producer | :67, :70 | yes, `PRODUCER_SHA` :31 | n/a (edit yields `producer_digest`) |
| L2 | `E.receiptSha256` → receipt.json | :70 | no | recompute if receipt edited |
| L3 | `E.artifacts` keys and digests ↔ every file under `corpus/evidence/round-21/runtime/` | :70 | no | recompute per edited file; set equality |
| L4 | `cases[id].evidence.sha256` → case JSON | :108 | no | recompute if case JSON edited |
| L5 | `cases[id].fixture.sha256` → `<id>.html` | :114 | no | recompute if fixture edited |
| L6 | nonce string present in fixture | :114 | no | none |
| L7 | S100 decoded sha; `source-opening.json` rawSha256 | :83, :85-91 | yes (`SOURCE_SHA` :38; `ff55d511…` :83) | n/a |
| L8 | new: expectation link fields (raw-summary, fixture, producer, acquisition hashes) | not implemented | no | recompute for every edited file |

Verified: the 25 runtime files match E.artifacts. Spot values: `na-click.html 1ac88d83…`, `na-throw.html 579ab87b…`, `na-delayed.html adde1722…`, `receipt.json 4bc79636…`.

## 3. Fields the round-21 counter never reads

Evidence: full read of `measure-c1.mjs`. Grep for `requests|errorText|pageErrors|release|delayed|navigations|status` matches only `r.status` spawn checks (:146, :159), CONFIG and IDS rows, the case-shape check at :104, and the mirror at :139.

| Field (retained location) | Round-21 treatment | Why it carries semantics |
|---|---|---|
| `cases[].after.responses[].{status,errorText,output}` and `WebMCP.toolResponded` params | whole-object mirror only (:139 `equal(c.after.responses, events…map(f=>f.params))`) | status class, error text, payload |
| `pageState.errors`, `pageObservations[].value.errors`, observation frames' `value.errors` | mirror only (:136, :139) | reject and throw page errors |
| `pageState.submits`/`after.submits` on native landing (absent → null) | mirror only (:139: null unless the post observation has an array) | "unavailable" versus "empty" |
| `receipt.requests[]` (13 entries; landing at `at 1792590710188`) | never read | native navigation must be backed; click must not reach /landing |
| `release` frame; `delayed-before-release` observation (seq 15, submits 1, formActive true) | never read (:130-131 use only pre-action and after-action) | delayed semantics |
| position of `WebMCP.toolResponded` relative to `release` | not checked (:126 checks only > toolInvoked; :139 counts before pre and before post) | delayed ordering |
| `navigations[].frame.url`, `pageState.url` | mirror only; never compared to `/<id>` or `/landing?q=<nonce>` | navigation semantics |
| fixture `const mode="…"` literal | never read (:112 checks case `mode` against CONFIG only) | fixture/case identity |
| `E.stdout` (`LIFECYCLE_OBSERVED … statuses=…`) | never read | duplicate status claim |
| `E.revision`, `E.baseline`, `E.measuredRevision:"uncommitted"` | never read | acquisition is not bound to a commit |
| `receipt.cases` order | sorted (:66) | low |

## 4. Counterexamples

Closure rule CC (all rows): after an edit, recompute sha256 of each edited file and write it into: `cases[id].evidence.sha256` (edited case JSON); `cases[id].fixture.sha256` (edited fixture); `E.artifacts[path]` (each edited runtime file); `E.receiptSha256` (edited receipt); round-22 expectation link fields (if edited). Preserve JSON key order: the counter compares `JSON.stringify` (:35). Paths are under `corpus/evidence/round-21/runtime/` unless stated. Frame `seq` values are renumbered with `at` non-decreasing (:118).

Expected results: rows that name a required ID → exit 1, value 0 (round-21 convention `result(findings.length?0:…)`, :143). Digest-separation rule for semantic rows (CE1–CE10, CE15, and variants CE3b, CE6b): findings must include the required ID and must not include `evidence_binding`, `case_set`, `revision_input`, or `source_binding`. CE11 is a binding row; CE12 is a documented limit; both state their expectations in the row.

| ID | Surface | Coherent edit (CC applied) | Round-21 result | Required finding (case) | Severity |
|---|---|---|---|---|---|
| CE1 | status | na-click `WebMCP.toolResponded` (seq 14) `params.status` and receipt `responses[0].status`: Completed → Error; output kept | exit 0, value 12 | `semantic_status` (na-click) | High |
| CE2 | status class | na-reset toolResponded (seq 15) and receipt status: Canceled → Error; errorText kept | exit 0, value 12 | `semantic_status` (na-reset) | High |
| CE3a | error text | na-throw toolResponded (seq 15) `params.errorText` and receipt copy: replace with `Uncaught Error: dummy submit handler throw` | exit 0, value 12 | `semantic_error` (na-throw) | High |
| CE3b | page error | na-reject: remove `Uncaught Error: dummy rejection` from receipt `pageState.errors`, `pageObservations[after-action].value.errors`, and the after-action observation frame value | exit 0, value 12 | `semantic_error` (na-reject) | High |
| CE4 | output payload | na-click response `output.q`: nonce → `00000000-0000-4000-8000-00000000c1c1` (frame and receipt; submitted q unchanged) | exit 0, value 12 | `semantic_output` (na-click) | High |
| CE5 | output shape | na-native-submit response (seq 16) `output`: `[{"dummy":"landing"}]` → `{"dummy":"landing"}` (frame and receipt) | exit 0, value 12 | `semantic_output` (na-native-submit) | High |
| CE6 | requests | delete receipt `requests` entry `{"at":1792590710188,"method":"GET","url":"/landing?q=8a5839ad-fc49-4ed6-8661-501aa2c5c4a4"}` | exit 0, value 12 | `semantic_navigation` (na-native-submit) | High |
| CE6b | requests | insert `{"at":1792590708500,"method":"GET","url":"/landing?q=d57a9461-7725-447a-94ee-5031820695a6"}` between `/na-click` (708004) and `/na-requestsubmit` (708984) | exit 0, value 12 | `semantic_navigation` (na-click) | High |
| CE7 | navigation | na-click: insert `Page.frameNavigated` (params copied from the native navigation, `frame.url` = `http://127.0.0.1:43143/landing?q=d57a9461-7725-447a-94ee-5031820695a6`) at `at 1792590708400`, between action-complete (seq 15) and after-action; mirror into `after.navigations`, `pageState.url`, after-action observation `url`, and `requests` | exit 0, value 12 | `semantic_navigation` (na-click) | High |
| CE8 | delayed order | na-delayed: swap `release` (seq 16) and `WebMCP.toolResponded` (seq 17); both `at 1792590715100` | exit 0, value 12 | `semantic_delayed` (na-delayed) | High |
| CE9 | pending window | na-pending: insert a Completed toolResponded (`params {invocationId:"44555B4FCF76A7EE11B1E96ACA81851F",status:"Completed",output:{ok:true,nonce:"5956c381-7675-4fe7-a6b4-990d7cf866f9",q:"5956c381-7675-4fe7-a6b4-990d7cf866f9"}}`) between action-complete (seq 14) and after-action; set `after.responses` to it | exit 0, value 12 | `semantic_timing` (na-pending) | High |
| CE10 | auto window | auto-positive: move its toolResponded from before pre-action to after after-action; `preAction.responseCount` 1 → 0; `after.responses` → `[]` | exit 0, value 12 | `semantic_timing` (auto-positive) | High |
| CE15 | native submits | na-native-submit: add `"submits": []` to the after-action observation value and its frame, to `cases[na-native-submit].after.pageState`, and set `after.submits` to `[]` (currently null) | exit 0, value 12 | `input_shape` (na-native-submit) | High |
| CE11 | runtime set | add `corpus/evidence/round-21/runtime/na-click-alt.json` (any content) and its `E.artifacts` entry; receipt untouched | exit 0, value 12 | `case_set` (runtime set ≠ 25 retained) | Medium |
| CE12 | stdout | `E.stdout` line `LIFECYCLE_OBSERVED na-click pre=0 statuses=Completed` → `statuses=Error` (nothing digests E) | exit 0, value 12 | none unless cross-checked; then `evidence_binding` | Low |
| CE13 | expectation self-edit | CE1 raw flip plus `corpus/evidence/round-22/semantic-expectations.json` na-click expected status → Error and refreshed link fields | exit 0, value 12 if read from REV unpinned | `revision_input` (requires R2) | High (design) |
| CE14 | fixture | `na-reject.html`: `const mode="reject";` → `const mode="success";`; raw stays Error; CC via L5 | exit 0, value 12 | `evidence_binding` (na-reject) with R1/R3 | High (design) |
| CE14b | fixture | `auto-invalid.html`: remove `type="email"` from input `q`; raw stays Error; CC via L5 | exit 0, value 12 | `evidence_binding` (auto-invalid) with R1/R3 | High (design) |

Silence proofs (round-21 counter, the reason each edit passes):
- CE1, CE2, CE3a, CE4, CE5: :139 compares `after.responses` to the same edited frame params; no status, errorText, or output predicate exists (grep).
- CE3b: :136 and :139 compare the three page-error copies, which are edited together.
- CE6, CE6b, CE7: `requests` is unread. CE7 navigations and page URL are mirror-only (:139), and order holds (:136: completed before post).
- CE8: :126 holds (response seq 17 > toolInvoked seq 11); :139 holds (`after.responses` = events before post, unchanged); :136 holds (action-complete seq 14 < post). No release predicate.
- CE9: :139 holds (`responseCount` 0 before pre; `after.responses` = in-window events). Round-21 has only the incoherent variant `false-pending` (`expected.json`, expects `summary_mismatch`); the coherent variant has no control.
- CE10: :139 holds after the move (`responseCount` 0; `after.responses` = []); :126 holds (response seq > toolInvoked).
- CE15: :139 holds (`after.submits` = [] equals the post observation's array); :136 and the page-state mirror hold because all copies are edited together. Round-21 has only the incoherent variant `unavailable-to-empty` (`selftest-c1.mjs:62-70`, observation left without submits).
- CE11: :70 set equality holds because E lists the extra file. No case references it.
- CE12: E is read only for exit, argv, artifacts, receiptSha256 (:68-70).
- CE13 and CE14: fixture digest (:114) and nonce (:114) hold after re-link; `toolautosubmit` (:116) unchanged; no handler or mode predicate.

Notes on the rows:
- CE1 with unchanged output on an Error status also breaks shape. The test must assert `semantic_status` present and `evidence_binding` absent, unless the oracle keys output and errorText predicates on status.
- CE9 also has a second contradiction: no `submit` event appears in its pageObservations. Both may fire. The test asserts `semantic_timing` present.
- CE8 is the strongest delayed case. The `delayed-before-release` observation (seq 15) shows `submits: 1` and `formActive: true`; the response must still come after release.

## 5. Bounded preserving positives (must stay exit 0, value 12, findings `[]`)

- PP-A. Retained acquisition, unedited. Includes rules that over-rejecting predicates would break: na-click response (seq 14) precedes action-complete (seq 15); auto-positive and auto-invalid responses precede pre-action (`preAction.responseCount` 1); na-delayed release (seq 16) precedes its response (seq 17); na-native-submit has `submits: null`, an output array, and exactly one landing navigation.
- PP-B. Invocation ID rotation applied coherently to `cases[id].invocationId`, `responses[].invocationId`, the invoke result frame `result.invocationId`, and `WebMCP.toolInvoked`/`toolResponded` `params.invocationId`. CC applies.
- PP-C. Uniform clock shift of +86400000 ms over every `at`, `preAction.start/end`, `after.start/end`, `pageObservations[].at`, and `requests[].at`; `windowMs` unchanged. CC applies. Tests that no absolute clock is compared.
- PP-D. Late post-window response appended after after-action, summary unchanged. Round-21 control `late-response-outside-window` in `.ufo/waves/round-21/fixtures/expected.json` requires exit 0 and value 12 (verified). Pending is a finite-window property.
- PP-E. Link-only refresh of the expectations file after PP-B: link fields recomputed, semantic fields untouched. Must stay clean; proves R2 pins only the semantic subset.
- PP-F. Round-21 control `unavailable-null-positive` (`expected.json`): native `submits` null with an unavailable observation. Exit 0, value 12 (verified). The null form must not be rejected.

## 6. Required design changes (BuildOracle; L1 to verify)

- R1. Pin the 12 retained fixture digests in code (values from E.artifacts, e.g. `na-click.html 1ac88d83…`, `na-throw.html 579ab87b…`). Compatible with CE1–CE10, CE15, and PP-B..F, none of which edit fixtures. Converts CE14/CE14b to `evidence_binding`.
- R2. Pin the canonical sha256 (sorted keys, no whitespace) of the semantic subset of `semantic-expectations.json`, excluding link fields, in code. Mismatch → `revision_input`, exit 1, value 0. Converts CE13. Compatible with PP-E.
- R3. Static fixture predicates: `const mode="…"` literal equals case `mode`; `type="email"` present iff mode is `invalid`; `required` on q; form `action="/landing" method="get"`; `toolautosubmit` iff autosubmit (already :116). Mismatch → `evidence_binding`.
- R4. Read `receipt.requests`. Expected: 12 page GETs in CASES order plus exactly one `/landing?q=<na-native-submit nonce>` between `/na-native-submit` and `/na-reset`, no other `/landing`; the native navigation must be backed by it. Landing or nonce mismatch → `semantic_navigation`; page-GET set or order → `case_set`.
- R5. Read status, errorText, output, and pageErrors from raw `WebMCP.toolResponded` and page-observation frames, compare to the fixed expectations, and treat receipt-copy mismatch as `evidence_binding`. Native landing: `submits` must be absent/null; any array → `input_shape` (CE15). The new finding list has no successor for round-21 `summary_mismatch` (:139); map it to `evidence_binding` explicitly, otherwise incoherent summary-only edits are a silent regression.
- R6. Ordering. Delayed: exactly one `release`; response seq > release seq; `delayed-before-release` seq < release seq, submits ≥ 1, formActive true. Non-delayed: no release frame; response before action-complete allowed (PP-A). Violation → `semantic_delayed` (delayed) or `semantic_timing` (window).
- R7. Windows. Pending: no toolResponded for the invocation with seq < post.seq. Auto: exactly one with seq < pre.seq. Post-window responses excluded from the summary (PP-D). Violation → `semantic_timing`.
- R8. Runtime set must be exactly 25 files (receipt, 12 JSON, 12 HTML). Otherwise `case_set` (CE11).
- R9. Stdout unused, or cross-checked per case (status token equals raw status). Mismatch → `evidence_binding` (CE12).
- R10. Explicit mapping for round-21 IDs. The 11-ID round-22 list has no name for these 16 round-21 IDs: `order_mismatch`, `window_mismatch`, `invoke_identity`, `event_identity`, `raw_invoke`, `nonce_reused`, `fixture_digest`, `evidence_digest`, `execution_binding`, `producer_digest`, `environment`, `cleanup`, `context_cleanup`, `boundary_violation`, `case_identity`, `summary_mismatch`. Five more also need a mapping: `partial_state`, `receipt_shape`, `note_missing`, `case_shape`, `evidence_missing`. `case_set` and `source_binding` are shared names. Dropping any of them is a silent regression of the frozen structural checks (no-harm).
- R11. Record `measuredRevision:"uncommitted"` as a limit. The retained acquisition is self-sealing and unauthenticated; claim only "retained-acquisition consistency", never authenticity or commit binding.

Digest-separation rule for L1: each coherent semantic row (CE1–CE10, CE15, CE3b, CE6b) must produce its required semantic or `input_shape` ID and no binding ID. Each binding row (CE11, CE13, CE14, CE14b) must produce its binding ID and no semantic ID.

## 7. Debt side (BuildDebt; W2 chronology and digest links)

Verified facts:
- `.ufo/waves/round-21/w2-returns.json`: `wave tabi-r21-w2`; `readAt 2026-10-21T13:49:02.529912+00:00`; `taskReturnBarrierObserved true`; `allActorQuiescenceCertified false`; 64 seats. Each seat carries only `name`, `role`, `latestOutput` text. No returnedAt and no structured reviewed digest.
- E: `startedAt 2026-10-21T13:51:46.597742+00:00`; `finishedAt 2026-10-21T13:51:58.460511+00:00`; `measuredRevision "uncommitted"`.
- Across all 64 seat texts the only cited 64-hex digest is `ff256afa1d4fd97f9db939d8d8951897ae43c48da9ef04885519c2177a3da740` (FixtureNaThrow). The final producer `bc11e4d6…` is cited by no seat.

- DCE1 (digest mismatch). FixtureNaThrow cites `na-throw.html` = `ff256afa…` and evidence `bbe5fcac…`. Final: `579ab87b…` and `e46d751e…` (both verified). Required: `review_scope_gap`. Never `final-reviewed`.
- DCE2 (invocation mismatch). SemanticNaPending cites `1C19BCCE55B6BF9ED2F28E332BE16412` (final na-pending `44555B4FCF76A7EE11B1E96ACA81851F`). SemanticNaRequestsubmit cites `DE3108EE3368EA4B38BE5A3FE48F7178` (final `56322DDB67194D60972B07E2BCABB7B7`). SemanticNaInvalidSubmit cites `C07B3CBD3C55966BDC7CDB9BEBA364BD` (final `38E3FB2410D1BD2D7DEA938A1688E885`). Required: `review_scope_gap` each. Their "no contradiction" verdicts describe other acquisitions.
- DCE3 (coherent relabel; chronology still wins). Rewrite DCE1's reviewed digest to `579ab87b…`. Exact digest match, but `readAt` (13:49:02Z) precedes acquisition start (13:51:46Z). Required: `review_scope_gap` (acquisition-after-return). [INFERENCE: `taskReturnBarrierObserved` bounds every seat's return at or before `readAt`.]
- DCE4 (forged chronology; digest mismatch). Move returnedAt after `finishedAt` and keep `ff256afa…`. Required: `review_scope_gap` (exact-digest mismatch).
- DCE5 (missing structure). Seat records without returnedAt or reviewed digest → `unknown`/unavailable. Not reconstructed from prose. FixtureNaThrow's "re-evaluating the current producer's fixture template gives identical bytes" is a reviewer re-derivation, not a review of finalized bytes.
- DPP1 (synthetic positive only). Reviewed digest `579ab87b…` and returnedAt after `finishedAt`: non-gap class, labelled record-consistency only. No retained seat satisfies it; not creditable (no authenticity; `allActorQuiescenceCertified false`).

## 8. Verification gaps and checks for L1 (named only; not run here)

- Implementation absent at review. After integration, run once: CE1–CE15 (with CE3b, CE6b, CE11–CE14b), DCE1–DCE5, DPP1, and PP-A..PP-F against the implemented oracle and classifier.
- Confirm the implementation reads raw status, errorText, output, and pageErrors (R5); requests (R4); release ordering (R6); fixture mode literal (R3); native submits shape (R5); pins (R1, R2); stdout (R9).
- Expected: each row that names a required ID exits 1 with value 0 and that ID; each PP row exits 0 with value 12 and no findings.
- Not verified here: fixture JavaScript behaviour is not executed by any predicate; only pinned digests and static predicates bound it (R1, R3). Browser behaviour of the retained acquisition is not re-observed.

## 9. Actions

Read-only inspection and checksums only. No writes outside this report. No installs or updates. No peer messages. No subagents.

Report: .ufo/waves/round-22/w1/AttackHashLinks.md
