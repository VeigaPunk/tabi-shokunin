# AttackCleanupListening — round15 wave2 (author-side critic, read-only)

Target: C2 `cleanup.allNotListeningAfter` / `cleanup.derivedListeningAfter`. The question is whether either predicate is inverted or vacuous.

## Bytes attacked

- Revision `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD). It matches `build-snapshot.json` `revision`. The baseline is `7054a5e1…`.
- `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. It matches the snapshot. I recomputed it with `sha256sum`.
- `.ufo/waves/round-15/metadata-witness.py` sha256 `44cd37c5…45831`. It matches the snapshot.
- Evidence read: `corpus/evidence/round-15/metadata/{expected-fixtures.json,mirror-contract.json}`, `corpus/evidence/round-14/aria-metadata/corrected.json` (sha256 `e156b922…56745`, identical to the baseline blob), `corpus/evidence/round-13/aria/receipt.json`.
- Docs read: `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/lessons/round-15.md`. All are uncommitted working-tree bytes (`git status`: M/??).
- Method: source reading only. I ran only read-only `node -e` JSON projections of committed evidence. I did not run the gate, selftest, witness, counter or browser. I installed nothing.
- Temporal limit: `build-snapshot.json` says "verification: not yet exercised". No round15 receipts of executed selftest or witness output are present under `corpus/evidence/round-15`. This report therefore makes no claim about runtime outcomes.

## Propositions that survived the attack (no defect)

| # | Proposition | Evidence |
|---|---|---|
| S1 | Neither predicate is inverted. | `evaluateCleanup` computes any-listening as `some(listeningAfter === true)` (`check-aria-metadata.mjs:397-400`). `expectedMirrorValues` computes all-not-listening as `complete && every(listeningAfter === false)` (`:997`, `:1003`). It sets `derivedListeningAfter` to `cleanupDerived.listeningAfter` (`:1004`). The historical receipt has one proof with `listeningAfter: false` (summary says `true`). From that, the code expects `allNotListeningAfter = true` and `derivedListeningAfter = false`. The frozen literal `corrected.json:18,20` holds `true` and `false`, so they agree. |
| S2 | Neither predicate is vacuous on an empty set. | `allNotListeningAfter` is guarded by `complete && proofs.length >= 1` (`:992`), so an empty set gives `false`, not `every([])` = `true`. `derivedListeningAfter` gives `null` on an empty set (`:398-400`). The mirror type is `boolean` (`:106`), so `mirrorFieldProblems` (`:982-984`) rejects every boolean the sidecar could carry. |
| S3 | An inversion mutant is caught. | The writer now emits values from `expectedMirrorValues` (`:1469`, `:1564-1565`). An inversion such as `!notListening` would change the `sidecar-valid` bytes, which are pinned (`expected-fixtures.json:636-639`, compared at `:2515-2518`). It would also fail the writer-independent round-14 literal `corrected.json` (`mirror-authentic-clean`). Separately, `metadata-witness.py:40-51` flips each of the two fields on its own. |
| S4 | The round-14 aliasing defect is gone. | The writer no longer feeds `allNotListeningAfter` from `allValuesOk`/`allProofsPass`. `expectedMirrorValues` derives it from its own field predicate. |

## Defects

### D1 — MEDIUM — every listening oracle has at most one worker and one fixed expected value

**Counterexample (from source, not executed).** Replace `:997` with `proofs.some((p) => p?.listeningAfter === false)`, or with the constant `complete`. Replace `:1004` with `false`, or with `proofs.every((p) => p?.listeningAfter === true)`. Each mutant survives every shipped oracle:

- **Fixture builder.** `fixtureReceipt` builds `proofs = workerCount === 0 ? [] : [clone(proof)]` (`:2088-2091`). No fixture has two or more workers. The only proof is `FIXTURE_PROOF`, with `listeningAfter: false` (`:192`).
- **Sidecar-mode CLI cases.** All 14 use `@receipt-old` (`expected-fixtures.json`: `sidecar-*` and `witness-*` cases). The `mirrorCases` use the historical receipt, which has `perWorker.length === 1` and `[false]`; I checked this with a read-only `node -e`. In every evaluation the expected values are therefore exactly `allNotListeningAfter = true` and `derivedListeningAfter = false`. Neither mirror is ever expected to take its opposite value, so the recomputation cannot be told apart from a hard-coded constant. The `every`↔`some` mutants give byte-identical output when n = 1, so the pinned digests do not catch them either.
- **Witness and helper.** `metadata-witness.py` and `--witness-mirrors` (`:1968-1983`) mutate the same n = 1 historical sidecar.
- **Shared evaluator.** The same blind spot covers `evaluateCleanup`'s `derivedListeningAfter` (`:397-400`). That value drives `R14-ARIA-CLEANUP-LISTENING-AFTER-01`, `correction.to` (`:1228`), `derived_not_false` (`:1254`) and the derive gate (`:1640-1645`).
- **This repeats a known hazard.** `round-14/w1/CleanupSemantics.md:27` named "one Boolean whose meaning changes with worker count", and QUALITY18 (`corpus/QUALITY.md:54-56`) states the every-versus-negative distinction. Yet no oracle exercises it.

**Impacted axes.**
- Calibration (C2 says "verified enforced contract"): the claim is enforced at n = 1 only.
- Provenance: lesson `:37` says "ships single-field CLI negatives". That is true, but they are single-cardinality only.

**Smallest safe correction.** Add one helper case, or literal-expectation CLI case, with two proofs. Use `FIXTURE_PROOF` clones with `listeningAfter` set to `[false, true]`, and also `[false, false]`. Assert literal hand-written expectations rather than `expectedMirrorValues` output:
- `[false, true]` → `allNotListeningAfter = false`, `derivedListeningAfter = true`.
- `[false, false]` → `true`, `false`.

Add a sidecar negative over the mixed set that carries `derivedListeningAfter: false` and expects `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` to fail. A unit-level helper that calls `evaluateCleanup` and `expectedMirrorValues` directly avoids the two-worker file and `loadWorkerContext` overhead. Keep it out of the CLI-case count, as the lesson's helper/CLI split already does. This adds new fixtures only; no historical bytes change.

### D2 — LOW — `derivedListeningAfter` is the only good-polarity mirror without a completeness guard

**Counterexample.** The comment at `:990-991` says "Empty or incomplete proof sets cannot support any all-true mirror". Lines `:993-997` guard the four sibling predicates with `complete`. `:1004` does not: it passes through `cleanupDerived.listeningAfter`, and `:399` evaluates `some(proof?.listeningAfter === true)` without any completeness guard.

Take a nonempty set where the proof has `listeningAfter: "true"` (a string). Then:
- `complete = false`, so `allNotListeningAfter = false`;
- `derivedListeningAfter = false`, which is the "nothing listening" polarity.

A sidecar that carries `false` there passes `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` for that field. This contradicts the emitted rule text (`:1527-1528`: "false only when every proof reports false"). It also contradicts the SKILL table row `SKILL.md:1780` ("recompute each emitted mirror from the authenticated complete nonempty worker set"). The two mirrors also stop being complements in exactly this case.

**Why it is not an admission bypass.** `R14-ARIA-SIDECAR-CORRECTION-01` still fails on `proofs_not_complete` / `proofs_do_not_all_pass` (`:1252-1253`). `R14-ARIA-CLEANUP-PERWORKER-01` fails on the non-boolean shape. `--derive` refuses (`:1640-1645`). The defect is a locally vacuous mirror finding plus a mismatch with the documentation. It is not a false acceptance.

**Smallest safe correction.** At `:1004`, use `complete ? cleanupDerived.listeningAfter : null` (`complete` is the local at `:992`). A boolean sidecar value then always fails on incomplete sets. The historical n = 1 complete set and all pinned fixture bytes are unchanged; this is an inference from `:992` and `:1004`, since the value is identical whenever `complete` is true. Optionally add a sidecar case against `@receipt-nonboolean` that expects the mirror finding to fail.

### D3 — MEDIUM (provenance wording) — "independent of the writer" overstates what the code does

**Counterexample.** Several sources claim independence:
- Lesson `corpus/lessons/round-15.md:37`: "C2 recomputes cleanup/qualification fields independently of the writer".
- The helper message `derive:mirrors_not_independently_derived` (`:2777`).

In the code, the writer is `buildSidecar`, and it takes its mirrors from the checker's own function: `const expectedMirrors = expectedMirrorValues(proofs, cleanupDerived)` (`:1469`). So the comparison in `derive-and-mirror-helper` (`:2763-2777`) is a tautology. It cannot fail unless someone deletes the call at `:1469`. A wrong predicate in `expectedMirrorValues` would flow consistently into both the emitted sidecar and the acceptance check.

The narrower claim in `mirror-contract.json:12` ("never from a previously emitted sidecar") is accurate. The writer-independent anchors that actually exist are the frozen round-14 literal `corrected.json` and the pinned fixture sha256 values, and both are n = 1 only (see D1).

**Smallest safe correction.** Two edits are needed:
1. Reword lesson `:37` (owned by L1) to say "writer and checker share one recomputation (`expectedMirrorValues`); writer-independent anchors are the frozen round14 literal sidecar and pinned fixture digests".
2. Relabel the helper problem string as determinism/shared-source, or drop it. Alternatively, keep the independence claim and back it by adding literal expected mirror objects to `expected-fixtures.json`, which also covers D1.

## Not attacked / limits

- I make no runtime claims. Whether the selftest, witness or CLI cases pass at `72dcf03` is for L1 to execute.
- The C1 counter and the `snapshot_tampered` classification are out of scope here, apart from noting that the `mirrorCases` cardinality is n = 1.
- This is an author-side critic report. It is not non-author certification.

## Commands for L1 (not run here)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/check-aria-metadata.mjs --self-test
python3 .ufo/waves/round-15/metadata-witness.py
node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json
# D1 mutant probe (on a temp copy only): replace :997 every->some and :1004 with `false`; rerun --self-test; expect it to still pass today (demonstrates gap), and to fail after the D1 fixture lands.
```
