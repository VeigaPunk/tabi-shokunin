# Round 15 C2 witness/tamper falsification

## Scope and attacked bytes

This is a source-reading review of the delivered round-15 build, not a gate or runtime result. The snapshot at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json` names revision `72dcf031b9da24796b718517ea575f21e4f7caae`; the inspected repository `HEAD` is that revision. The two relevant source hashes match the snapshot exactly:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs`: `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py`: `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`.

No gate, test, self-test, counter, browser, or smoke command was run. The LSP device was unavailable (`xd://lsp` is not mounted), so pointers below are direct source locations, not LSP-derived call-graph claims. The build snapshot says verification is “not yet exercised” at line 33. `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-15.md:57-59` likewise says execution evidence is pending; there is no round-15 metadata witness receipt in `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/`. Thus none of the behaviors below is reported as executed or passed.

## Finding 1 — witness-mirrors can report clean for unanchored caller-selected inputs

**Evidence chain:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:1915-1929` calls `verifySnapshot()` on the fixed in-repository snapshot, then builds its evaluation context from caller-selected `receiptPathText` and `pinPathText`. The CLI exposes those overrides for `--witness-mirrors` at `:3073`, parses them at `:3119-3123`, and passes them at `:3189-3193`.

The anchor logic at `:826-852` only requires the selected pair to be canonical when at least one selected path is canonical; for a pair of noncanonical files with non-anchor digests, `canonicalReceipt` and `canonicalPin` are both false and no canonical-pair or digest problem is added. `evaluatePin` at `:793-818` checks that the receipt advertises the selected pin's digest and says `pinPath === DEFAULT_PIN`, but does not require the selected pin file itself to be at `DEFAULT_PIN`. A semantically equivalent alternate receipt/pin pair can therefore be rebound to each other without matching the immutable original byte digests, while the canonical snapshot files in the repository still satisfy `verifySnapshot()`.

The witness calculates `authenticatedAnchors` at `:2032-2033`, but its success predicate at `:2034-2035` omits that value. `originalUnchanged` at `:2023-2031` only means the caller-selected receipt and pin bytes were stable across the witness. Consequently, this source admits a clean result (`exit: 0`) for an unanchored input pair with `authenticatedAnchors: false`; the `baselineSidecar` is generated from that same unanchored context at `:1966-1969`, so it does not restore the missing authentication. `runWitness` has the same omission: its `ok` predicate at `:1838-1847` computes `authenticatedAnchors` but does not require it.

**Bounded correction:** for both witness modes, either disallow caller-selected receipt/pin paths and use only the canonical pair, or require the selected paths and bytes to satisfy the authenticated identities before reporting success. Include `authenticatedAnchors` in the success predicate. Keep `originalUnchanged` explicitly scoped to before/after byte stability; it is not an authenticity predicate.

**L1 follow-up command/check:** after correction, add an isolated CLI negative control with a noncanonical, semantically re-bound receipt/pin pair and assert that the witness cannot return clean; retain the canonical `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --witness-mirrors` positive control. Do not interpret the source-only review here as either result.

## Finding 2 — the source-tamper witness does not assert the full could-not-evaluate contract

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py:26-29` reduces non-pass findings to IDs and discards finding status/detail and top-level classification. Its tamper oracle at `:57-62` checks current exit `2` and presence of the `snapshot_tampered` finding ID, but not `payload.classification.outcome === "could_not_evaluate"`, `payload.classification.reason === "snapshot_tampered"`, finding status `could_not_evaluate`, or `detail.semanticEvaluation === "skipped"`.

The delivered checker currently constructs those facts in `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:927-948`; `runCheck` returns before context preparation or semantic evaluation on a bad snapshot at `:1385-1396`. This is a **witness-oracle gap**, not an observed wrong classification in the delivered checker. The Python witness's existing assertion could still pass if a future implementation retained exit 2 and the finding ID but regressed the promised classification/status or ran semantic evaluation.

**Bounded correction:** assert the exact structured payload fields above (including that the changed authenticated input is reported and semantic evaluation is skipped), rather than checking only a finding-name substring/ID and exit. Keep the baseline comparison as the distinct old-code control (`:47-51`, `:57-62`).

**L1 follow-up command/check:** run the corrected isolated metadata witness and CLI expected-reason case after integration; require the structured exit/outcome/reason/status tuple, not merely `exit 2` plus the finding ID.

## Original-unchanged evidence meaning

The Python witness's `originalsUnchanged` at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py:32-34,63-68` is a baseline identity comparison: it hashes the eight staged evidence inputs against their repository copies after the temporary tests. It is not an observed run receipt here, and it does not include the checker source as an original evidence input. The JS witness property `originalUnchanged` is narrower: `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:1827-1837` and `:2023-2031` compare only the selected receipt/pin bytes before and after; anchor identity is separate. The latter separation is important because the success predicates currently fail to require `authenticatedAnchors` (Finding 1).

## Confidence and boundary

High confidence in the two source-level gaps from the cited control flow. No runtime outcome is claimed. These are author-side falsification findings, not non-author certification; the final lesson and receipts remain temporally pending as recorded above.