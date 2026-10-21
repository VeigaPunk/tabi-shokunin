# CounterErrors — static falsification of round21 C1 counter

## Scope and axes

Axes: (1) total evaluation of parseable but malformed evidence; (2) CLI separation of evaluated finding/exit 1 from acquisition or invocation failure/exit 2; (3) exact fixed-case identity and finite control completeness; (4) preservation of the finite-observation claim without new semantic/coverage authority.

Static review only. No counter, selftest, CLI control, browser, build, formatter, or linter was run. Outcomes below are **[INFERENCE] from JavaScript control flow**, not observed executions. No tool installation/update was needed. Production and fixture files were not changed.

## Finding 1 — null array members escape evaluated shape findings

**Concrete attack:** Starting from independently persisted `fixtures/positive-ordered.json`, parse `/files/corpus~1evidence~1round-21~1runtime~1na-pending.json`, set its `/frames/0` to `null`, serialize the evidence, and update the receipt's `/cases/0/evidence/sha256` to the new bytes. Leave the other 11 cases unchanged.

**Evidence:** `.ufo/waves/round-21/measure-c1.mjs:70-71` validates only that `frames` and `pageObservations` are arrays. Line 79 immediately reads `f.seq` inside `frames.some`; a null first member throws before an `order_mismatch` can be recorded. Further filters at lines 80, 83, 85-86, 90-93 likewise assume object members. The CLI's catch at lines 113-119 turns the exception into `verdict: could-not-evaluate`, `exit: 2`, with the engine error message as finding ID. Direct `evaluate(files)` instead throws. This is malformed acquired evidence, not failure to obtain a revision or blob.

The persisted positive fixture's na-pending `/frames/0` is the invoke command (seq 1, at 990); its `/pageObservations/0` is pre-action (seq 4, at 1250). The live runtime independently has an object at `corpus/evidence/round-21/runtime/na-pending.json:12-20`, so this is a proposed mutation, not an assertion that the current acquisition contains null.

**Independent adjacent route:** Set only evidence `/pageObservations/0 = null`, rehash the evidence, and keep frames intact. Array validation at line 71 succeeds; line 88's `find(p => p.label === 'pre-action')` dereferences null. Same inferred exit-2 misclassification, reached without corrupting a frame.

**Smallest safe correction:** Before any per-member callbacks, reject a non-plain member in either array with `case_shape` detail such as `na-pending:evidence`, then continue to the next case. Do not blanket-catch all exceptions as evaluated evidence findings; preserve exit 2 for actual revision/acquisition failures and unexpected implementation failures.

**Finite red controls for L1:**

- `null-frame-member`: `/frames/0 = null`, evidence digest refreshed; intended exit 1, value 0, finding `case_shape`.
- `null-observation-member`: `/pageObservations/0 = null`, evidence digest refreshed; intended exit 1, value 0, finding `case_shape`.

**Harness trap:** `selftest-c1.mjs:97` unconditionally assigns `f.seq` to every frame whenever `changed` is true. Adding the null-frame mutant through that common path crashes the fixture producer before the CLI is spawned at line 111. Persist this mutant directly and refresh its digest without the renumbering loop (a dedicated branch can serialize and return), so it actually exercises the evaluator. The observation-only mutant does not hit this particular trap.

**Impacted axes:** evaluator totality, meaningful exit classification, finite-red test reachability. Fixable defect; no reason to change metric scope or admit a coverage claim.

## Finding 2 — malformed case ID throws before exact-set rejection

**Concrete attack:** In the fixture receipt, replace `/cases/0/id` with the valid JSON object `{"toString":null}`. No evidence mutation or digest update is necessary: receipt case IDs are evaluated before following evidence paths.

**Evidence:** `measure-c1.mjs:44` accepts the receipt and cases array. Line 46 calls `.sort()` on untyped `c?.id` values; sorting this object against ordinary string IDs requires primitive/string conversion, which fails when its own `toString` is null and inherited `valueOf` returns the object. Even replacing the sort with a safe string-only comparison is insufficient on its own: line 65's rejected-shape detail calls `String(id)`, triggering the same conversion failure.

**[INFERENCE] Current outcome:** TypeError escapes `evaluate`; the CLI catch at line 119 reports exit 2 instead of the evaluated exact-case rejection. Expected intended findings after correction are `case_set` and `case_shape`, exit 1, value 0.

**Smallest safe correction:** Require every case ID to be a string before sorting/comparing the fixed case set, and make shape diagnostic formatting safe for JSON IDs (for example `JSON.stringify(id)` with an explicit missing-ID fallback). Preserve the existing case-sensitive fixed12 comparison; do not coerce/normalize IDs into valid names.

**Finite red control for L1:** `object-case-id`, applying only the receipt replacement above. The selftest's mutation initialization reads the original first case/evidence before its switch (`selftest-c1.mjs:18-20`), so this receipt-only mutation can use the ordinary non-`changed` serialization path and reach the CLI.

**Impacted axes:** exact-case identity, evaluator totality, CLI finding-vs-acquisition distinction. Fixable input-validation defect, not a tradeoff requiring broader semantics.

## Persisted-control completeness and oracle limit

`fixtures/expected.json:1-170` contains no null-frame, null-observation, or object-ID control. Its existing missing-case and duplicate-case controls are at lines 20-31; `selftest-c1.mjs:26-27` mutates only otherwise valid case entries. These do not traverse malformed member or coercion routes.

One additional finite exact-case check is worthwhile: change only `/cases/0/id` from `na-pending` to `NA-pending`; intended exit 1/value 0 with `case_set` and `case_shape`. Static evidence already shows case-sensitive rejection (`IDS` at measure lines 9, 46, 65); this is a missing regression control, **not a claimed present acceptance bug**.

The oracle assertion at `selftest-c1.mjs:113-115` checks subprocess status, value, and membership of a single expected finding, not the complete finding set, output `exit`, or verdict. Thus a red case may accumulate an unrelated finding and still pass. This is a diagnostic-completeness limitation, not evidence that existing tests have failed. If exact finding completeness is claimed, persist expected finding-ID arrays per control and compare sets, with expected verdict/exit fields checked; do not assume a red mutation yields exactly one finding, because several current mutations legitimately produce multiple diagnostics. Otherwise retain the narrower stated claim that each control checks its required finding.

## Boundaries

The current producer/receipt and note were read as context, not conflated with historical acquisitions. `corpus/knowledge/webmcp-nonautosubmit-round-21.md:9-21,45-67` explicitly limits this to finite observations and source interpretation. None of the proposed controls changes those authorities, creates novel branches, or supplies runtime execution evidence. L1 alone must execute final serial controls; no execution result is claimed here.

Report: .ufo/waves/round-21/w2/CounterErrors.md
