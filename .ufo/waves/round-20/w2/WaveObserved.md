# Wave metadata guard review

**Axes:** guard correctness; regression-test discrimination; provenance/isolation boundary. **Checkpoint:** `4ae99816b8994fdedc159156d8d9d242dd5c4782` (`HEAD`).

## Findings

1. **Nested reconstruction markers evade the guard.** `checkSnapshot` iterates only `Object.entries(snapshot)` and examines root keys and root string values (`check-wave.mjs:101-105`); there is no closed snapshot schema. Thus a snapshot with otherwise-clean required fields and `capture: { method: "reconstructed from mtimes" }` has no reconstruction finding: the root key does not match, and its object value is not a string. This is a code-derived counterexample, **not executed**. The intended comment says reconstruction markers are prohibited outside `status` and `trackedDiff` (`:17-20`), so arbitrary nested metadata leaves a hole. The existing marker fixture tests only root `method` (`:206-208`); `wave-check-expected.json:14` does not cover nesting.
   - **Impacted axes:** metadata-guard correctness and provenance-marker detection.
   - **Smallest safe correction:** either recursively inspect metadata while excluding only the actual `status`/`trackedDiff` payloads, or validate a closed snapshot schema and reject unexpected nested values. Add a nested-marker expected fixture.

2. **The self-test does not independently protect the `observed === true` predicate.** The implementation rejects false (`check-wave.mjs:99`), but `snapshot_reconstructed` changes both `phase` and `observed` (`:199-202`). Since the wrong phase alone produces the expected finding, deleting the observed check would still satisfy this case; the expected cases have no standalone observed-false case (`wave-check-expected.json:5-15`). This is a test-coverage counterexample, **not an observed defect in the current predicate**.
   - **Impacted axis:** regression-test discrimination for false observation metadata.
   - **Smallest safe correction:** add an `observed_false` fixture with correct phase, baseline, status, and empty `trackedDiff`, changing only `observed` to `false`, and expect `snapshot_reconstructed`.

## Evidence boundary / disposition

The guard is correctly documented as a finite author-authored metadata check, not independent certification: its header says it reads asserted fields and cannot prove who captured a snapshot or when (`check-wave.mjs:2-12`). `w1/return.json` asserts `phase: return-before-integration`, `observed: true`, the pinned baseline, `all64Settled: true`, and a capture actor; the checker does not authenticate the actor/order or independently substantiate those assertions. The root `.ufo/waves/round-20/isolation-ledger.json` records four writer clone/branch/base/commit/path/bundle-hash entries and explicitly says snapshot limits leave actor/order unproved (`:7-95`). Root `.ufo/waves/round-20/integration.json` records the integration account and says verification was not yet run (`:19-65`). These are useful process/accounting metadata, but do not turn the checker into actual capture or isolation evidence. This is a **scope boundary, not a defect**, provided no stronger isolation/capture claim is attached.

No checker, self-test, build, or gate was run. The nested-marker counterexample is reasoned from the implementation; the false-observed fixture gap is established by the fixture and expected-case source.

Report: .ufo/waves/round-20/w2/WaveObserved.md
