# Wave null/blank metadata guard review

## Axes
- **Detection:** Reject missing, null, non-string, empty, and whitespace-only wave fields.
- **Regression coverage:** Ensure tests independently exercise `spec.wave` and `registry.wave`.
- **Evidence boundary:** Keep metadata validation distinct from proof of isolation or capture provenance.

## Finding — fixture coverage gap, not a current guard failure
**Counterexample:** A regression that removes the `spec.wave` validation from `checkWave` would accept `{ "wave": null }` in the spec when the registry still has its valid wave. The current `wave_null` fixture would not catch it: `buildFixtures()` changes only `f.registry.wave` to `null`; all fixtures retain the valid spec wave. Likewise, no fixture supplies a blank or whitespace-only value. This is a plausible false-negative in the self-test suite, not an observed false-negative in the current implementation.

**Evidence:** At checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`, `.ufo/waves/round-20/check-wave.mjs:51,71-77` defines `isNonBlank` as string-and-trim-nonempty and applies it to both extracted fields before comparing them. By inspection, the current guard rejects null, missing, non-string, empty, and whitespace-only values on either side as `wave_null`; no implementation defect for this facet was found. But `.ufo/waves/round-20/check-wave.mjs:194-198` has only the registry-null invalid fixture, and `corpus/evidence/round-20/wave-check-expected.json:6-15` has only one corresponding `wave_null` expectation.

The actual checkpoint metadata has matching nonblank values (`w1/spec.json:2`, `w1/swarm-registry.json:3`, both `tabi-round-20-w1`). `w1/before.json:2-6` labels a pre-dispatch snapshot; `w1/return.json:2-10` asserts return-before-integration, observed, and `all64Settled`; `isolation-ledger.json:4-6,94-95` points to that direct return and records `beforeIntegration: true` while explicitly limiting the snapshot claim. These records are author-supplied metadata, not independently authenticated capture/isolation evidence. The checker itself says it cannot prove who captured a snapshot or when (`check-wave.mjs:5-12`).

**Impacted axes:** Regression coverage only. The currently inspected finite metadata guard handles both wave operands; the observed actual values are valid. No evidence supports upgrading the snapshot to isolation/capture proof.

**Smallest safe correction:** Keep the guard. Add expected self-test fixtures that independently set `spec.wave` to null/missing and whitespace-only, and `registry.wave` to empty/whitespace-only (retaining the existing registry-null case), each expecting `wave_null`. This makes an operand-specific regression detectable without broadening the checker’s claims.

**Verification:** Static review only; no tests or checker execution performed.