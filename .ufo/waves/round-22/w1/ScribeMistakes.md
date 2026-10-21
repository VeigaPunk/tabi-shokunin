# ScribeMistakes — round22 Gate/Mistakes draft material

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
Seat: `TabiR22.ScribeMistakes` (leaf scribe, read-only). Only this report was written. No production docs, lesson, LOG, census, or measurement file was edited. No build, test, linter, smoke, browser, network, or REA action was run. No install or upgrade was performed; no tool was added.

## 1. Source reopen: S101 reset quote

- Source: S101, own-work, `corpus/evidence/round-21/runtime/receipt.json`, reopened 2026-10-21.
- Quote (7 words, within the ≤25-word limit): "Tool execution cancelled by a form reset"
- JSON pointer: `cases[id=na-reset].after.responses[0].errorText` (receipt `startedAt` 2026-10-21T13:51:46.773Z).
- Raw corroboration: `corpus/evidence/round-21/runtime/na-reset.json`, line 201–205, `WebMCP.toolResponded` with `errorText` equal to the quote. The quote occurs once in that file. Its invocation is `B8BA3C97850919D25D5C04338D497F26`, status `Canceled`.
- Pinned digests observed by this reopen: `na-reset.json` sha256 `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4`; `receipt.json` sha256 `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`.
- Scope limit carried from the S101 row and corrected note: reset is an observation only, outside S100's registered anchors. It is not a general cancellation guarantee.

## 2. Two debt classes, kept separate

### A. Historical conformance debt (recorded, not erased)

Admitted round21 closure (`.ufo/waves/round-22/round21-closure.json`, `verification.wave_conformance_debt`) and `LOG.md` lines 1496–1502 record:

- Failure classes are first-terminal snapshots, not full final event history.
- Peer IRC reached five failed W1 seats, not only the two productive revivals.
- Main's routing broadcast reached 55 W1 seats, including 23 already failed. 24 failed seats show post-broadcast activity; 20 later failure notices exist.
- Three initial-Zai seats later exhausted Codex capacity. No new IDs, replacements, or policy-refusal rephrasing retry is evidenced.
- W1 returned at 13:15:40Z before four final exits (all exited by 13:19:45Z). `allActorQuiescenceCertified:false` is correct.
- W2 final exit 13:45:46Z precedes its returns at 13:49:02Z. W2 attacked the historical bounded producer/acquisition, not the final `bc11e4d` producer.

Rule for the round-22 lesson: cite these as conformance debt. Do not rewrite the round21 lesson, closure, or LOG entries to remove them.

### B. Semantic oracle gap (frozen counter cannot see outcomes)

The frozen round-21 counter `.ufo/waves/round-21/measure-c1.mjs` (sha256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`) checks structure, digests, identity, ordering, and summary equality. It compares `invocationId` and `invokeError` against the raw answer. It never maps `status` or `errorText` to the case's action or mode.

Evidence:
- `.ufo/waves/round-21/fixtures/positive-ordered.json` is all-silent. All 12 cases have `after.responses.length == 0`, and no status appears anywhere in that receipt. This is the structural positive.
- `.ufo/waves/round-21/fixtures/expected.json` has 83 controls. None checks outcome status. The only names touching status are `s101-status-drift` (a SOURCES.md registry cell, `S101` row status `queued`, `finding: source_binding`) and `false-pending`. `false-pending` is red only through `summary_mismatch` after a splice, not through any outcome criterion.
- Control `response-mismatch` changes only `first.after.responses` with no raw change. It fails as `summary_mismatch`, which is incoherent tampering, not semantic tampering.

Consequence: an all-silent synthetic receipt, or a receipt whose status was changed consistently across raw, summary, and digests, can satisfy the frozen counter. [INFERENCE: not executed here] The frozen counter should return exit 0 on a coherent status change, because every link is resealed.

Rule: the old counter remains frozen and unchanged. It is not imported as an outcome oracle. The new outcome oracle must be separate.

## 3. Observed outcome population (reference for the lesson)

From the closure's independent remeasurement of the raw frames, consistent with the round-21 witness:
- 12 cases: pending 1 (`na-pending`), Completed 5 (`na-click`, `na-requestsubmit`, `na-native-submit`, `na-delayed`, `auto-positive`), Canceled 2 (`na-reset`, `na-remove`), Error 4 (`na-reject`, `na-throw`, `na-invalid-submit`, `auto-invalid`).
- Ten non-autosubmit cases have no pre-action response. Two autosubmit controls already respond before pre-action.
- `na-native-submit` Completed follows landing navigation with output `[{dummy:landing}]`. Its old-document submits are unavailable/null, not zero. Completed here does not mean `respondWith` ran.

## 4. Mistake classes for the Gate and Mistakes table

| Class | Exact evidence | Criterion that should catch it | Failure-capable fixture required |
|---|---|---|---|
| silent-structural-positive | positive-ordered.json 12/12 zero responses; frozen counter exit 0 | Outcome oracle must distinguish all-silent from the finite expected classes | Coherent all-silent receipt (raw, summary, evidence/receipt/acquisition digests resealed) must go red on `semantic_status`, not pass |
| status-drift (coherent) | na-reset Canceled, errorText "Tool execution cancelled by a form reset" | `semantic_status` / `semantic_output`: Canceled only for reset/remove | Reseal na-reset with status Completed, output ok:true, plus summary and digests; must go red on `semantic_status` |
| error-class drift | na-reject, na-throw, na-invalid-submit, auto-invalid all Error | `semantic_error`: Error only for reject/throw/invalid-submit/auto-invalid, with exact errorText family | Swap na-reject errorText to the reset text, resealed; must go red on `semantic_error` |
| timing-misread | na-pending windowMs 254/503, zero responses | `semantic_timing` / `semantic_delayed`: pending means no correlated response in the finite window | Move a response for na-pending or na-delayed outside the window while keeping summary consistent; must go red |
| navigation-as-completion | na-native-submit Completed via landing navigation | `semantic_navigation`: Completed for native submit requires the recorded navigation, not respondWith | Remove the navigation while keeping Completed, resealed; must go red on `semantic_navigation` |
| circular expectation | Old receipts re-derive their own expectations | Independent fixed `semantic-expectations.json`, never recomputed from the evaluated receipt; missing expectations give baseline 0, partial missing gives failed 0 | Edit a receipt status and leave the fixed expectation unchanged; must go red. A recomputed expectation must not pass |
| stale-hash masking | Contract: tests must update digest links so red outcomes test semantics | Fixtures reseal summaries, raw, digests, and acquisition pins together | Each red fixture must still exit 1 on its semantic finding, not on `evidence_digest` or `execution_binding` |
| scope overclaim | reset/removal outside S100's anchors | Lesson wording plus `source_binding` for the note header | Note citing S100 for reset must go red on `source_binding` |
| selftest coverage illusion | 83 round-21 controls, none checks outcome semantics | New selftest needs at least one red control for each outcome class | Coverage table per class; a missing class must be visible |

These are draft requirements for the round-22 lesson. None has been executed.

## 5. Findings and limits

- Findings are in this report only. No production file was touched.
- Exact paths: `corpus/evidence/round-21/runtime/receipt.json`, `corpus/evidence/round-21/runtime/na-reset.json`, `.ufo/waves/round-21/measure-c1.mjs`, `.ufo/waves/round-21/fixtures/positive-ordered.json`, `.ufo/waves/round-21/fixtures/expected.json`, `.ufo/waves/round-22/round21-closure.json`, `LOG.md` lines 1496–1502.
- `corpus/evidence/round-22/semantic-expectations.json` and `.ufo/waves/round-22/measure-c1.mjs` did not exist when read. Their expectations are not verified here.
- Not executed: any selftest, the counter on coherent mutations, any build. Predictions are marked [INFERENCE].
- No install or update was performed.
