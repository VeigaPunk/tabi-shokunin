# QualificationEmpty — round 15 w1 (critic, read-only, author-side)

Scope: does `qualification` stay true on an empty proof set (all values true but vacuous), and what
already refuses that case, in `scripts/check-aria-metadata.mjs` (snapshot tag FB3C, 2263 lines) and
`corpus/evidence/round-14/aria-metadata/{expected-fixtures.json,corrected.json}`.
Nothing was run: no gate, self-test, counter, browser, or install. Anything about runtime behaviour
below comes from reading the code and is marked [INFERENCE].

## Verdict

- **Acceptance cannot be exploited today.** An empty or missing `perWorker` set is refused
  end to end by several independent checks.
- **Two findings still report `pass` on an empty proof set:** `R14-ARIA-SIDECAR-QUALIFICATION-01`
  and `R14-ARIA-SIDECAR-BINDING-01`. This is a fixable truthfulness defect. C2's claim is "checks
  all emitted mirrors against independently recomputed context", and neither finding does that.
- **The self-test has no case that exercises it.** No fixture puts a sidecar over an empty
  receipt, and no case runs derive on an empty receipt.

## Checks that already refuse an empty proof set (concrete anchors)

| Layer | Anchor | Behaviour on `perWorker: []` |
|---|---|---|
| Shape | `:301-302` | `perWorker:missing_or_empty` sets `complete=false`, so `R14-ARIA-CLEANUP-PERWORKER-01` fails |
| Values | `:307`, `:311` | value loop skipped; `allProofsPass = complete && …` is false, so `PROOF-01` fails |
| Derived aggregates | `:312-321` | `listeningAfter` / `closed` / `refusedAfterClose` are `null` (guarded by `length > 0`), never a vacuous `[].every()===true` |
| Summary mirrors | `:343-346`, `:358-390` | `LISTENING-AFTER-01` fails because derived is null. `CLOSED-01`, `REFUSED-01` and `SERVEROK-01` fail because a summary `true` does not equal a derived `null` or `false` |
| Counts | `:406-408` | `countValues[0] >= 1` makes `COUNT-01` fail |
| Worker set | `:491`, `:573-576` | `workers:missing_or_empty`, `directory_set_mismatch` (the real worker dir is non-empty), `no_worker_proofs` |
| Node | `:439` | `workerNodes.length > 0 &&` guard |
| Sidecar correction | `:982`, `:999-1001` | `corrections[0].to` (typeof boolean vs null), `proofs_do_not_all_pass`, `proofs_not_complete`, `derived_not_false` |
| Residual | `:1083-1093` | the post-correction re-evaluation still contains PERWORKER/COUNT/… fails, so `RESIDUAL-01` fails |
| Acceptance | `:1095-1096`, `:1129-1132` | needs every finding to pass, so it is refused |
| Derive | `:1335-1345` | `shapeOk` needs `onlyContradiction` and `complete===true` and `allProofsPass===true`, so `R14-ARIA-DERIVE-REFUSED-01` (exit 1) is returned before `buildSidecar` (`:1364`) or any write (`:1370`, `:1456`) |
| Self-test | `expected-fixtures.json` case `empty-perworker` | `--receipt @receipt-empty` expects exit 1 plus a `CLEANUP-PERWORKER-01` fail. The fixture is `fixtureReceipt({workerCount:0})`, `:1702-1706` |

`corrected.json` (`qualification.proofCount: 1`, all `true`) is not vacuous. With one proof,
`allValuesOk` agrees with each per-field predicate.

## Defects (counterexample · evidence · impacted axes · smallest safe correction)

### QE-1 · MEDIUM · `QUALIFICATION-01` passes vacuously when `proofs.length === 0`
- **Counterexample:** take `receipt-empty` and build a sidecar with the same keys as
  `buildSidecar`:
  - `qualified: true`, `status: 'qualified'`
  - `qualification: { qualified: true, proofCount: 0, allProofsComplete: true, allProofsSupportCorrection: true, everyProofNotListeningAfter: true, … }`
  - `binding.perWorker: []`, `binding.proofSetSha256 = sha256('[]')`
- **Evidence:**
  - `:1060-1075` compares each field only to the literal `true`. The one context-bound check,
    `proofCount !== proofs.length` (`:1064`), accepts `0 === 0`.
  - There is no `proofs.length >= 1` guard and no comparison with `cleanupDerived`.
  - [INFERENCE] `QUALIFICATION-01` is emitted as `pass` with `proofCount: 0`, while acceptance is
    refused only because other findings fail.
- **Axes:** calibration (C2's "independently recomputed" claim), conformance/truthfulness of
  per-finding diagnostics.
- **Correction:** in `evaluateSidecar`, compute an independent qualification object from `proofs`:
  - `nonEmpty = proofs.length >= 1 && cleanupDerived.complete === true`
  - `everyProof<X> = nonEmpty && proofs.every(p => p?.<x> === <expected>)` for `listeningBefore===true`, `closed===true`, `refusedAfterClose===true`, `listeningAfter===false`
  - `allProofsSupportCorrection = cleanupDerived.allProofsPass`

  Then require:
  - `typeof sidecar.qualification[k] === 'boolean' && === recomputed[k]` for every emitted key
    (including the three keys that are not checked today: `everyProofListensBefore`,
    `everyProofClosed`, `everyProofRefusedAfterClose`)
  - `proofCount >= 1`, with a stable problem such as `qualification.proofCount:empty`
  - `qualified === true` only when every recomputed value is `true`.

### QE-2 · LOW · `BINDING-01` and the `supportingProofs` checks pass vacuously on an empty set
- **Evidence:**
  - `:885-887` falls back to `proofs = []` when `perWorker` is missing or not an array. That
    erases the difference between "missing" and "empty".
  - `:946-955`: `sha256(stableStringify([]))` equals itself, and the `forEach` over zero entries
    reports nothing.
  - `:989` and `:998`: `supportingProofs` `0 === 0`.
- **Correction:**
  - Keep `proofs = null` when `perWorker` is not an array.
  - Add `binding.perWorker:empty` and `supportingProofs:empty` problems when `length < 1`.
  - Keep `proofSetSha256` binding as it is.

### QE-3 · LOW (producer truthfulness) · `buildSidecar` emits per-field mirrors from one conflated aggregate
- **Evidence:**
  - `:1174` sets `allValuesOk = allProofsPass`, which is all six value checks
    (`:285-292`, including `closeError` and `refusalDetail`).
  - It is then serialized as `everyProofListensBefore` (`:1276`), `everyProofNotListeningAfter`
    (`:1279`), `allNotListeningAfter` (`:1267`) and `allProofsSupportCorrection` (`:1275`).
  - `qualified: true` and `qualification.qualified: true` are hard-coded (`:1180`, `:1272`).
  - `cleanup.allClosed` / `allRefusedAfterClose` carry the raw nullable derived values
    (`:1265-1266`), so an empty set would serialize `null`, not `false`.
- **Not reachable today:** derive refuses first (`:1339-1345`), and the self-test calls
  `buildSidecar` only on the non-empty `receipt-old` (`:1735-1740`).
- **Hidden regression risk:** a future caller that skips `shapeOk` would emit `qualified: true`
  over an empty set.
- **Example:** a proof with `listeningAfter: false` and `refusalDetail: 'ETIMEDOUT'` would wrongly
  serialize `everyProofNotListeningAfter: false`. That is understatement, not inflation.
- **Correction:** derive each mirror from its own field predicate (the same helper as QE-1, shared
  by producer and checker).
- **Fixture digests:**
  - If you change the producer, verify that the old `corrected.json` and the `sidecar-valid`
    fixture digests in `expected-fixtures.json` stay byte-identical. For one passing proof every
    predicate is `true`, so the bytes should not move [INFERENCE].
  - If you do not want to rely on that, leave the producer alone and only harden the checker. The
    contract says old corrected-sidecar acceptance and originals must be preserved.

### QE-4 · LOW · The self-test does not cover vacuity on the sidecar or derive paths
- **Evidence:**
  - The case list in `expected-fixtures.json` (15 cases) has no sidecar over `receipt-empty` and
    no derive case at all.
  - `empty-perworker` asserts only exit 1 and the `PERWORKER-01` fail. Exit 1 is overdetermined
    (COUNT, WORKER-SET, WORKER-PROOF and LISTENING-AFTER all fail too), so the case cannot isolate
    a guard regression.

## Proposed round-15 tests (for TabiR15.MetadataEnforce; fixture assets under `corpus/evidence/round-15/metadata/`)

1. **`sidecar-empty-alltrue`**
   - Fixture: a sidecar generated in the self-test from `receipt-empty`, with every qualification
     and cleanup mirror set to `true`, `proofCount: 0`, `supportingProofs: 0`, and binding over `[]`.
   - Args: `--receipt @receipt-empty --pin @pin --sidecar @sidecar-empty-alltrue`.
   - Expect: exit 1; `R14-ARIA-SIDECAR-QUALIFICATION-01` fail (problem includes
     `qualification.proofCount:empty`); `R14-ARIA-SIDECAR-ACCEPTED-01` fail.
   - Failure-capable: against current code, `QUALIFICATION-01` is expected to be `pass`
     [INFERENCE], so this assertion is red before the fix.
2. **`sidecar-empty-binding`**
   - Args: same as test 1.
   - Expect: `R14-ARIA-SIDECAR-BINDING-01` fail (`binding.perWorker:empty`).
3. **`derive-empty-refused`**
   - Args: `--derive --receipt @receipt-empty --pin @pin --out <fresh rel path under EVIDENCE_DIR>`.
   - Expect: exit 1; `R14-ARIA-DERIVE-REFUSED-01` fail; destination absent afterwards.
   - Note: `EVIDENCE_DIR` is still `corpus/evidence/round-14/aria-metadata` (`:55`, `:1289-1292`),
     so the out path must sit under it or the constant must change.
4. **Isolation for `empty-perworker`**
   - Add expected fail findings `R14-ARIA-CLEANUP-COUNT-01` and
     `R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
   - Assert `derived.cleanup.listeningAfter === null`, not `false`.
5. **Mixed-field mirror test (non-empty, one proof)**
   - Fixture: `sidecar-valid` with `qualification.everyProofClosed: false` (or
     `cleanup.allClosed: false`).
   - Expect: exit 1 (currently accepted [INFERENCE], because `:1060-1075` and the `cleanup` block
     go unchecked). This overlaps the MirrorTypes / MetadataMissing slices; listed here only for
     the empty-set predicate it shares.

## Commands for L1 (not executed here)
```sh
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --receipt corpus/evidence/round-13/aria/receipt.json --pin corpus/evidence/round-13/aria/runtime-pin.json --sidecar corpus/evidence/round-14/aria-metadata/corrected.json
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-14/aria-metadata/corrected.json   # expect b458b351… and unchanged corrected digest
```

Tools installed or updated: none.
