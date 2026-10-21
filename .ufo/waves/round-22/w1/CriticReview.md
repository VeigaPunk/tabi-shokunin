# CriticReview — W2 byte-identity chronology (round22 w1)

Scope: read-only critique of the round22 debt/chronology design (`w1-spec.json` items
BuildDebt and ScribeDebt, draft `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:60-87`)
against retained round21 evidence. No tests, builds or checker executions were run. The
only commands were `git show`/`git log`/`sha256sum`/`grep`/`stat` and Python JSON reads
over committed blobs and retained files. No tools were installed or updated.

Axes: (A1) byte identity of reviewed vs. final artifacts; (A2) chronology source
integrity; (A3) honesty/no relabeling of historical review; (A4) history preservation /
no-harm; (A5) C1 isolation (debt is not depth evidence).

## Bottom line

The draft note's conclusion is correct: W2 reviewed older bytes and not the final ones.
The evidence is stronger than the note says, because it does not depend on clocks. Every
W2 artifact that cites a digest cites a pre-final digest, and no W2 artifact cites any
final digest.

The BuildDebt classifier design (`w1-spec.json` item BuildDebt) keys on the producer
digest plus the review-return timestamp. That key is weaker than the note's own rule
("Review scope requires exact artifact identity", note:85). Two concrete inputs make it
fail; they are described below.

## Evidence (all observed)

| Fact | Value | Source |
|---|---|---|
| Producer digests, in run order | a273fe77 (12:39:42Z) → b99d1698 (12:51:32Z) → 847d0467 (12:53:34Z) → 5363d576 (13:07:01Z) → bc11e4d6 (13:51:46.597742Z, finished 13:51:58.460511Z) | `.ufo/waves/round-21/runtime-execution{-pinned,-ordered,-final,-bounded,-finalized}.json` |
| W2 return capture | `readAt` 2026-10-21T13:49:02.529912Z; `allActorQuiescenceCertified:false`; no per-seat timestamps (seat keys are only `name, role, latestOutput`) | `.ufo/waves/round-21/w2-returns.json` |
| Receipt W2 could read at checkpoint `1b5f449` | sha256 323ccd59…, producer 5363d576, startedAt 13:07:02.041Z; byte-equal to `history/runtime-v4/receipt.json` | `git show 1b5f449:corpus/evidence/round-21/runtime/receipt.json` |
| Producer blob at `1b5f449` | absent (empty sha e3b0c442…); first committed at `2d5eaaa` | `LOG.md:1414-1419`; `git show 1b5f449:scripts/webmcp-lifecycle-round21.mjs` |
| Final receipt / producer / counter | 4bc79636… / bc11e4d6… / 8d992423… (unchanged at `2d5eaaa`, `ab73abe`, `5f58577`) | `git show <rev>:…` |
| Counter that W2 could read at `1b5f449` | `.ufo/waves/round-21/measure-c1.mjs` sha256 4b6f271f… (≠ 8d992423) | `git show 1b5f449:…` |
| Other inputs changed after W2 (`1b5f449` → `2d5eaaa`) | `selftest-c1.mjs` c0a4cd27→1fa3d827; `run-checks.py` 8aaf5753→4ed74c8e; `corpus/knowledge/webmcp-nonautosubmit-round-21.md` 346925a8→8c9be28c; corrected note new (39a19b0f); `SKILL.md` 2822c8ca→54da3b2b | `git show` sha256 |
| W2 report citations | 31 of 58 `.ufo/waves/round-21/w2/*.md` cite 5363d576 / 323ccd59 / 4b6f271f / `1b5f449`; 0 of 58 (and 0 hits in `w2-returns.json`) cite bc11e4d, 4bc79636, 8d992423, `2d5eaaa` or `5f58577` | grep |
| Case identity across the acquisitions | all 12 invocation IDs and all 12 nonces differ between 323ccd59 and 4bc79636. Example: W2 `SemanticNaPending` cites invocation `1C19BCCE55B6BF9ED2F28E332BE16412`, which occurs 0 times in the final receipt; the final na-pending invocation starts `44555B4F` | `w2-returns.json` (2 hits); final `receipt.json` (0 hits) |
| Immutable chronology of W2 artifacts | `w2-returns.json`, every `w2/*.md`, `history/webmcp-lifecycle-v4.mjs`, `history/runtime-v4/` and `runtime-execution-finalized.json` were all **first committed together at `2d5eaaa` (14:16:50Z)**, i.e. after the finalized acquisition. The `w2/*.md` mtimes span 13:22:35Z–13:38:38Z, but mtimes are mutable | `git log --diff-filter=A`; `stat` |
| Existing fresh post-final check | `final/serial-checks.json`: revision `2d5eaaa…`, startedAt 14:16:58.193843Z, cites bc11e4d, 4bc79636 and 8d992423 (author-side L1). The closure `c1_remeasurement` reads blobs at `2d5eaaa`/`5f58577` (non-author) | `.ufo/waves/round-21/final/serial-checks.json`; `.ufo/waves/round-22/round21-closure.json` |

## Falsifiers

**F1 — a producer digest is not byte identity (axes A1, A3).**
- Counterexample: the round21 receipts at 12:39:34Z and 12:39:42Z (`runtime-execution.json` and `-pinned.json`) share producer a273fe77 but are different records. One is an exit-1 refusal with no artifacts; the other is a 12-case acquisition.
- More generally, re-running bc11e4d would produce new nonces and invocation IDs (all 12 differ between v4 and final, as shown above).
- Failing input: a reviewer that cites producer P and returns at t2 > t1 was classified as reviewing acquisition B (producer P, start t1). In fact it reviewed acquisition A (producer P, start t0 < t1).
- Smallest correction: key review scope on the artifact digests the reviewer cites or was pinned to (`receiptSha256` and per-artifact sha256), compared with the final `execution.artifacts` and `receiptSha256`. A producer-digest mismatch and acquisition-after-return remain sufficient **falsifiers**. A producer-digest match and before-return timing are **never sufficient** for a reviewed verdict.
- Expected finding: `review_scope_gap` when no cited artifact digest equals the final digest.

**F2 — the wrong clock flips the verdict (axis A2).**
- If the review time is taken from the Git commit of the W2 artifacts (14:16:50Z at `2d5eaaa`), the review appears to follow the finalized acquisition (13:51:46Z). A classifier would then mark W2 as covering the final bytes.
- File mtimes (13:22–13:38Z) and `readAt` (13:49:02Z) are mutable or self-asserted. `w2-returns.json` has no per-seat times.
- Smallest correction: accept only a declared return-capture time as the review time (`w2-returns.json.readAt`), labeled as asserted. Never use commit time, `closed_at` or mtime. Missing or ambiguous clocks give `unknown_clock`, not ordering.
- Because the F1 digest key falsifies W2 independently, this verdict needs no clock. The design SHOULD let a digest mismatch decide before any timestamp is compared.

**F3 — the review-scope set is too narrow (axes A1, A3).**
- BuildDebt compares only producer and acquisition. Four W2 seats cite counter 4b6f271f: `MutationOrdering.md`, `MutationProducer.md`, `MutationSummaries.md` and `MutationVacuity.md`. `MutationOrdering.md` also cites the pre-supersession note digest 346925a8. Many other W2 reports, including `ReviewNoteProvenance.md` and `ReviewCounterInputs.md`, cite the note or counter by path only, with no digest.
- After W2, all of these changed, as did the selftest, `run-checks.py` and `SKILL.md`.
- A classifier that reports the producer and acquisition gap but is silent on the counter could be read as saying "W2 reviewed the final counter".
- Smallest correction: the debt expectations should list every W2-reviewed path. Each path should carry a reviewed digest (or `uncited`) and the final digest, and a gap is reported per path. A path-only citation (no digest) or no citation at all is `uncited`, never `reviewed`.

**F4 — the reviewed producer digest is asserted, not read (axes A1, A2).**
- At `1b5f449` the producer blob is absent (`LOG.md:1414`). W2's 5363d576 therefore comes from the receipt's self-declared `producer.sha256` or from the working tree, not from an immutable blob.
- The v4 bytes first became immutable as `history/webmcp-lifecycle-v4.mjs` at `2d5eaaa`.
- Smallest correction: record the provenance of the reviewed digest (`cited_in_receipt` vs. `read_at_revision`). Neither value may be upgraded to "final-reviewed".

**F5 — relabeling (axes A3, A4).**
- Any new round22 text, expectation row or classifier fixture that credits a W2 seat name to bc11e4d, 4bc79636 or 8d992423 is a relabel. So is any edit to existing `round-21/w2/*.md`, `w2-returns.json` or the round21 report or lesson.
- Example: an expectation sourced from W2 `SemanticNaPending` invocation `1C19BCCE…` cannot match the final receipt. Copying the final ID into a row attributed to W2 is a false-provenance relabel.
- Currently clean: the draft note (:73-80) and `ConnPlanner.md:178-180` attribute final-byte support to L1 serial checks and the closure, not to W2.
- Correction: none needed. Keep it this way.

## Acceptance boundary

A check counts as a fresh immutable check of the final bytes only if **all** of the following hold:
1. It is a new record, not an edited W2 or round21 artifact.
2. It started after `runtime-execution-finalized.json` `finishedAt` (13:51:58.460511Z).
3. It reads blobs at a named full 40-hex revision where those bytes are present (`2d5eaaa…` or later; the bytes are identical through `5f58577…`), or it records the sha256 of each artifact it read.
4. Those digests equal receipt 4bc79636…, producer bc11e4d6… and counter 8d992423… (plus any other path it claims).
5. It states its authority honestly: L1 serial is author-side; the closure is non-author; neither is authenticated settlement.

- Existing qualifying checks: `final/serial-checks.json` (author) and the closure remeasurement (non-author). A round22 `measure-c1.mjs REV` run would be another such check of the same bytes. It is an outcome-oracle validation, not a W2 review and not new browser evidence.
- Classifier accept: W2 → `review_scope_gap` for producer, receipt and counter, decided by digest mismatch with or without clocks. Uncited seats → `uncited`. Absent per-seat event history → `unavailable`.
- Positive control: a reviewer whose cited `receiptSha256` equals the final digest, and whose return time follows the acquisition `finishedAt`, gives `reviewed_exact`. No round21 W2 seat qualifies.
- Reject: any `final-reviewed` (or equivalent) verdict for a W2 seat; any verdict decided by producer digest plus timestamp alone; any use of commit time or mtime as the review time; any history rewrite.
- C1 isolation: none of this changes C1 0→12 or scalar 8. Debt rows must not be counted as depth (`ConnPlanner.md:178`).

## Not verified here

- The BuildDebt clone `.ufo/waves/round-22/clones/BuildDebt` has no round22 commit yet (HEAD 5f58577). `check-review-chronology.mjs` and `debt-expectations.json` therefore could not be inspected. F1–F4 target the design as specified in `w1-spec.json`, not delivered code.
- Per-seat W2 terminal times (the closure's "final exit 13:45:46Z") are closure-reported; I did not re-derive them from transcripts.
