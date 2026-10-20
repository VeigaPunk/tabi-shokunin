# Round-15 cleanup-context audit

## Scope and method

Read-only audit of `scripts/check-aria-metadata.mjs` cleanup evaluation, its worker-set validation, and the committed CLI self-test fixture matrix. No gate, counter, self-test, suite, browser, or runtime was executed; no source was edited. The requested LSP route was not mounted (`xd://lsp` returned “No such tool”); I inspected the relevant source ranges directly with `read`. Literal grep results were used only to locate symbols/cases, not as semantic proof.

## Reconstructed contract and evidence

- `evaluateCleanup` (`scripts/check-aria-metadata.mjs:296-426`) treats `cleanup.server.perWorker` as the raw proof set. Missing/non-array/empty is a shape failure (`:299-305`). Each entry must have boolean listening/close/refusal fields, a present `closeError`, string refusal detail, and valid loopback origin (`proofShapeProblems`, `:265-280`); proof values then require listening before, closed, not listening after, refusal, null close error, and `ECONNREFUSED` (`:283-294`).
- The any-listening algebra is correct in the current evaluator: for a nonempty set, `derivedListeningAfter` is `perWorker.some(proof => proof?.listeningAfter === true)` (`:312-315`); no set derives `null`. `R14-ARIA-CLEANUP-LISTENING-AFTER-01` passes only when the top-level field is a boolean and equals this derived value (`:338-353`). The all-closed/refused and all-proof-success aggregates intentionally use `every` separately (`:316-322`).
- Nonempty/equal worker cardinality is enforced by `R14-ARIA-CLEANUP-COUNT-01`: it compares `receipt.workers.length`, integer `summary.workers`, `cleanup.server.perWorker.length`, and `receipt.server.perWorker.length`; all must be integers, equal, and at least one (`:397-409`).
- Full cross-file worker coverage is enforced outside `evaluateCleanup`, by `loadWorkerContext` (`:485-592`) and included in the gate result by `evaluateAll` (`:826-844`). It rejects absent/empty `receipt.workers` (`:490-492`), invalid/escaping paths and filename/worker identity mismatches (`:503-523`), unreadable worker files (`:524-537`), worker identity disagreement and mismatch between the canonicalized three proof copies (`:538-559`), duplicate file refs or any difference between referenced files and all directory `*.json` names (`:563-575`), and no readable worker proofs (`:576`). `evaluateManifest` additionally rejects missing/duplicate worker cases and requires the worker case union to equal the manifest (`:657-695`).
- `evaluateAll` requires every independent finding to pass (`:829-844`). `runDerive` proceeds only if the sole failing finding is the summary contradiction, the original verdict passes, cleanup is complete/all proof values pass, and the derived raw listening state is false (`:1331-1364`). Thus `cleanup.derived.complete` is a local shape-completeness bit (`:304-311`), not by itself the whole cross-file worker-set guarantee; the set/proof/count findings supply that guarantee at admission.
- Historical receipt behavior is consistent with this check: the receipt has one worker (`corpus/evidence/round-13/aria/receipt.json:2364-2385`, `summary.workers` at `:2610`); the aggregate says `cleanup.server.listeningAfter: true`, while its sole raw proof says false (`:2519-2534`). This should produce the red summary-consistency finding because `some([false])` is false.

## Divergence / test gap

I found no cleanup-evaluator acceptance bypass in the inspected source. The material gap is self-test coverage for the general worker-set and any-algebra branches:

- The persisted self-test only has a clean one-proof/false case, the historical one-proof/false with aggregate true contradiction, an all-zero empty case, and one nonboolean proof (`corpus/evidence/round-14/aria-metadata/expected-fixtures.json:3-117`). The empty case asserts `PERWORKER` and `COUNT` fail (`:83-101`), but does not assert that `LISTENING-AFTER` fails or that its derived value is null.
- The fixture factory can only produce one proof/worker or zero (`scripts/check-aria-metadata.mjs:1562-1571`); `FIXTURE_WORKER_REF` and `FIXTURE_PROOF` are each single-worker constants (`:98-111`). Consequently current CLI fixtures never distinguish `.some(raw === true)` from an all-workers predicate: one boolean has identical any/all results. The historical discrepancy also has just one worker.
- There are no committed self-test controls for one-at-a-time count mismatches, duplicate/missing/extra worker files, worker ID/name mismatch, or disagreement among the three proof copies. These checks exist in code, but current CLI test inputs do not exercise their red branches. The historical worker anchor map is also deliberately one exact file (`:61-73`), so this checker is scoped to its pinned historical worker rather than evidence of general multi-worker production admission.

## Proposed isolated CLI controls for L1

1. Add a two-proof mixed case `[false, true]` with aggregate `true`; assert `R14-ARIA-CLEANUP-LISTENING-AFTER-01` passes (the independent cleanup proof-value finding may fail because the `true` proof is not a good teardown). Add `[false, false]` with aggregate `false` as the clean all-false case. This distinguishes the required any-listening algebra from `every` and from the historical inverted expression.
2. Keep an empty-proof case with the other worker counts nonzero and assert: `PERWORKER` fails, `COUNT` fails, `LISTENING-AFTER` fails, and derived `listeningAfter` is `null`; do not rely only on an all-zero fixture.
3. Exercise each cardinality source mismatch independently against the other three equal nonzero values; require `R14-ARIA-CLEANUP-COUNT-01` red. Include missing `summary.workers`/non-integer values.
4. In an isolated worker-inventory fixture, assert `R14-ARIA-WORKER-SET-01`/`R14-ARIA-WORKER-PROOF-01` red for missing or extra `*.json`, duplicate ref, identity/file-name mismatch, and each one-copy divergence; ensure no sidecar acceptance/derive output occurs. Preserve the current immutable artifact/anchor constraints when designing fixtures.

## Confidence

High for the described branch behavior and existing control coverage: directly inspected source, persisted expectations, and historical receipt. The multi-worker properties above are source-derived but are not exercised by the current fixture suite; no execution claim is made.