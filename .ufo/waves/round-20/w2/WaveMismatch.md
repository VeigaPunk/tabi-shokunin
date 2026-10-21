# Wave metadata guard review

## Axes
- **Wave-pair consistency:** detect when the supplied spec and registry wave identifiers differ.
- **Active-wave identity:** bind those identifiers to the intended `round-20/w1` wave, rather than only to each other.
- **Isolation/capture provenance:** distinguish asserted metadata from evidence of actual capture timing and clone isolation.

## Counterexample
The assigned unequal-wave case is handled: `checkWave()` rejects nonblank unequal values using strict `!==` (`check-wave.mjs`, `checkWave`; the `wave_mismatch` fixture changes registry wave from `tabi-round-20-w1` to `tabi-round-20-w0`, and the expected fixture requires that finding). Current checkpoint inputs agree: `w1/spec.json.wave` and `w1/swarm-registry.json.wave` are both `tabi-round-20-w1`.

[INFERENCE; not executed] The strongest gap is the equal-but-wrong pair: if both fields were changed to `tabi-round-20-w0` while checking the actual w1 artifacts, this predicate would not report `wave_mismatch`. That does **not** falsify its documented equality-only predicate; it matters only if the checker is meant to bind the inputs to the active w1 identity. Its positive and negative fixtures cover unequal values, but not this identity-binding case.

## Evidence and boundary
- `check-wave.mjs` lines 71–78 checks only that `spec.wave` and `registry.wave` are nonblank and equal. `wave-check-expected.json` explicitly scopes its fixtures to an author-authored metadata guard.
- The checker does not consume `isolation-ledger.json` or `integration.json`. It therefore cannot independently establish that the return snapshot was captured directly after all members settled, before import, or by the asserted actor. The source comments at `check-wave.mjs` lines 5–12 explicitly state this limit and label capture order an operational requirement.
- The checkpoint's `isolation-ledger.json` points to `before.json` and `return.json` and asserts `beforeIntegration: true`; `integration.json` records the import and says verification is pending. These are relevant author-side records, distinct from the checker proving their truth.
- No tests or runtime checks were run.

## Finding / smallest safe correction
No defect found for the narrow **unequal spec-wave versus registry-wave** predicate: the strict comparison catches that case, and the observed pair is equal. Keep the current disclaimer; do not describe a clean verdict as isolation or capture certification. If active-wave identity is also intended, the smallest correction is to bind both fields to an explicit expected identifier (`tabi-round-20-w1`) and add an equal-but-wrong fixture. Otherwise leave the predicate as-is and treat identity binding as out of scope.

Report: `.ufo/waves/round-20/w2/WaveMismatch.md`
