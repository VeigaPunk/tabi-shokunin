# CriticClaim — does the round22 durable oracle move depth or rename the r21 witness?

Seat: TabiR22.CriticClaim (critic, read-only). Baseline inspected: `5f585773258b33d2d514b00cd0b0775333578db6` (lane HEAD; all three private clones also sit at `5f58577` with no round22 files yet, so this attacks the spec/contract in `.ufo/waves/round-22/w1-spec.json`, not delivered code). No tests, builds or oracle runs executed. No tools installed or updated.

## Verdict

**As framed (C1 depth 0→12), the claim is a relabel of r21's already-credited depth population.** A real, falsifiable delta exists, but it is a *mechanization* delta (prose criterion + one-shot readings → committed, failure-capable, revision-bound gate). By `AXES.md` and this lane's own precedent, that is operability, not depth. Fixable defect, not a tradeoff: re-axis to operability (also a lowest tie at 8) and key the 12 rows to r21 identities with explicit no-additional-credit wording.

## Evidence (all observed)

1. **Same 12 rows already got depth credit.** `SCORECARD.md:1002`: r21 C1 depth "0→12 finite recorded observations … with raw/summary/producer/source binding **and separate semantic reading**". `.ufo/waves/round-22/round21-closure.json` `claims.C1.scope`: "Twelve finite receipt-bound loopback lifecycle observations **with independently checked raw semantics**". Its `verification.semantic_remeasurement` already verified the exact predicates r22 plans to encode: one pending, five Completed, two Canceled, four Error; native output `[{dummy:landing}]` with submits null; delayed marker15 < release16 < response17. Round22 declares the same population: `SCORECARD.md:1046-1050` ("over the retained round21 acquisition … not twelve additional observations").
2. **No new technical content.** Every outcome the oracle would check is already published in `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` (Observations table and decision rules 1–6: statuses, exact errorText strings, native array/null, delayed release, autosubmit controls answering before pre-action). `AXES.md:11` defines depth as "verifiable technical detail — decision tables with real thresholds, named error signatures, cited sources". The oracle adds no row, threshold or error signature to SKILL or the corpus. It enforces existing ones.
3. **The gap is real, so the delta is not empty.**
   - `.ufo/waves/round-21/measure-c1.mjs:139` checks only that the receipt summary matches the raw frames. No line constrains `status`, `output` or `errorText` per case.
   - The committed positive fixture `.ufo/waves/round-21/fixtures/positive-ordered.json` is all-silent: `final/semantic-contrast-witness.json` reports `syntheticControl.allSilent: true` with 12 cases. `fixtures/expected.json` scores that fixture `{name:'positive', exit:0, value:12}`.
   - The r21 witness script (`final/semantic-witness-command.json` argv[2]) only extracts and prints rows. It has no predicate and no failing exit, and its own `limits` record "A coherent changed status can remain structural while contradicting the published contrast".
   - `corpus/QUALITY.md:263` (criterion 55) keeps the semantic requirement as prose, met by a separate reading.
   - The r21 closure check was non-author, one-shot Python, and is not a committed runnable gate.
4. **Lane precedent puts new gates over existing ground under operability.** `SCORECARD.md:410` ("gate absent, receipt 0 → … clean" is operability 7→8), and lines 545, 610, 680, 751 and 794 are all "newly verified counters/contracts/anchor-safe 0→N" claims filed as operability. The depth rows at 882, 950 and 1002 each added new decisions, source rows or runtime observations.
5. **Operability is a lowest tie.** `SCORECARD.md:1003` (r21 row): coverage9, operability8, freshness8, calibration9, adjacency8, and depth8. Re-axising therefore still meets the lowest-axis rule in `AXES.md:33`.
6. **Pattern risk.** Three consecutive rounds claim "C1 depth 0→12" on one lifecycle topic: r20 source rows (`SCORECARD.md:950`), r21 runtime observations (`:1002`) and r22 oracle (`:1046`). Each time a new metric name is introduced and its "0" is defined by a missing new file (contract: "missing new expectations and note means baseline0"). The 0 measures file absence, not absence of semantic checking.

## Falsifiable substantive delta (what the claim may honestly assert)

> At `5f58577`, the only committed revision-bound C1 gate scores a coherent, digest-consistent receipt whose case outcomes contradict the published contrasts as clean 12. Its own committed all-silent positive fixture is an example. After round22, the committed oracle scores the real r21 acquisition as 12. It scores every coherent outcome-contradicting variant as failed (exit1), with the named `semantic_*` finding.

## Concrete falsifiers (L1 decides at integration; listed, not run)

- **F1 (pure-rename test).** Re-pin the r21 all-silent fixture coherently: receipt digests, `runtime-execution-finalized.json` artifact pins and `receiptSha256`. Add the r22 note and `corpus/evidence/round-22/semantic-expectations.json`, then evaluate with the new `measure-c1.mjs`.
  - Pass condition: exit1 with `semantic_status` for the 11 responding cases.
  - If it returns 12/exit0, the delta is null and the claim is pure rename.
- **F2 (per-case discrimination).** For each of the 12 cases, apply one coherent outcome swap that the r21 counter still accepts. Each must fail with its named finding:
  - `na-reset` Canceled → Completed: `semantic_status`.
  - `na-pending` gaining an in-window Completed response: `semantic_status`.
  - `na-native-submit` output object instead of array, or submits `[]` instead of null: `semantic_output` or `semantic_navigation`.
  - `na-delayed` response seq before the release frame (seq16), or `delayed-before-release` formActive false: `semantic_delayed`.
  - `na-reject` and `na-throw` errorText swapped: `semantic_error`.
  - Success output nonce ≠ case nonce: `semantic_output`.

  Any exit0 is a hole.
- **F3 (snapshot, not oracle).** Coherently re-nonce one case: new nonce and invocationId, consistently rewritten across the fixture HTML, sent input, toolInvoked/toolResponded, output.nonce/q, receipt and pins.
  - It must still count as semantically valid. A failure means the expectations transcribe r21 bytes, making the oracle a golden snapshot that duplicates the old `evidence_digest`/`execution_binding` hash pins.
  - "Exact current invocation" must mean correlation to the case's own invocationId, not fixed r21 IDs.
- **F4 (unreachable semantics).** If `semantic-expectations.json` pins the evaluated per-case evidence or acquisition SHA-256 values (e.g. `65b52c0c…7fe4`, `f17fe86f…796e`), every coherent mutation goes red on `evidence_binding` first. A deleted or no-op semantic predicate would then still show exit1. That defeats the contract's "red outcomes test semantics, not incidental stale hashes".
  - Required: either the expectations hold no hashes derived from the evaluated data, or the selftest asserts the *exact* finding set per mutation, not `includes`.
  - Binding the 12 rows to the retained r21 bytes belongs to L1's frozen no-harm comparison against r21 closure-verified pins, not to the fixed expectation file.
- **F5 (double count).** Each returned `rows[]` entry must carry its r21 case id, invocationId and evidence SHA-256, equal to `corpus/evidence/round-21/runtime/receipt.json` / closure-verified values. If any row lacks this identity, or the sum of C1 rows across r21 and r22 is reported as 24 anywhere (SCORECARD, LOG, report, trends), that is double counting.

## Acceptance boundary

- **Admissible:**
  - Operability C1, 0→12 r21 lifecycle rows newly enforced by a committed failure-capable outcome oracle. These are the same 12 r21 observations; no new knowledge, branch, coverage, browser run or producer.
  - F1 to F4 hold; scalar 8→8.
  - Alternatively, keep depth but state explicitly that the depth content delta is 0 and the only change is enforcement. The judge should then expect "unchanged" for depth.
- **Inadmissible:**
  - Depth "improved" on these 12 rows; r21 already took that credit with "independently checked raw semantics".
  - Expansion trend "improved" from the new note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`. It would move `.ufo/waves/round-20/counts.mjs` `knowledge` 40→41 and change the S101 used-by cell (`corpus/SOURCES.md:115`), but that is no new frontier and no new source.
  - Any reading of r21's 12 plus r22's 12 as distinct populations.
  - Treating the W1/W2 debt correction as a calibration move without a separate declared claim. `SCORECARD.md:1053-1056` declares C1 only.

## Impacted axes

- **Depth:** at risk of false "improved" (relabel).
- **Operability:** the actual home of the delta.
- **Calibration:** harmed if the axis choice or "0" baseline is presented as new expertise, because SCORECARD would no longer match repo state (`AXES.md:15`).
- **Expansion/quality trends:** must not double-credit.

## Smallest safe correction

1. Change `SCORECARD.md` round22 C1 axis from depth to operability. If L1 keeps depth, the C1 text must state "depth content delta 0; enforcement only".
2. Reword the C1 line to read: "same 12 r21 rows (ids, invocationIds and evidence hashes as r21), newly gate-enforced; not additive to r21 C1 depth 12".
3. Require the oracle and selftest to satisfy F1 to F4. In particular: no evaluated-data hashes in the fixed expectations, exact finding-set assertions, and a re-nonce positive control.
4. State that the round22 note is an enforcement or method entry, not a knowledge admission.
