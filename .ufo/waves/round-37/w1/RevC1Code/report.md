# RevC1Code — C1 v4→v5 line-level review

Reviewed the complete unified diff from v4 at `ed8ccfc00ad3784bc424aa118e056f8edf4ee803` to frozen v5 at `99437d29de036415a9f2d0524343617a3b19988a`. Contract read first: round-37 claims at the frozen revision; routed C1 defects read from the round-36 spot-check. The only available review tools in this session were file/read and shell; no LSP device/server was available, so no semantic LSP references/diagnostics checks were performed.

## Hunk-by-hunk

1. **Header/amendment description (diff hunk 1): approved.** Correctly identifies B1–B3 and says the split meter semantics remain unchanged.
2. **Predicate sentence (hunk 2): approved.** Header sentence matches the frozen C1 claim predicate text byte-for-byte, including the final digest term. It changes the documentation from the older prose predicate to the declared canonical sentence.
3. **Schema version (hunk 3): approved.** Bumps the receipt schema to round-37 v5; no weakened check.
4. **Frozen pins path and digest constant (hunk 4): approved.** The constant `810193…0655` matches SHA-256 of the frozen `corpus`/baseline pins blob at the frozen revision (computed over the blob bytes).
5. **Predicate sentence constant (hunk 5): approved.** `PREDICATE_SENTENCE` matches the frozen claim sentence byte-for-byte.
6. **Digest binding and JSON order (hunk 6): approved.** `blob()` returns `spawnSync` stdout as a Buffer; `sha256` passes that Buffer directly to `createHash('sha256').update(b)` with no encoding or text conversion. A missing blob or mismatched digest throws `Refusal`; the CLI catches `Refusal`, prints `verdict=could-not-evaluate`, and exits 2. JSON parsing occurs only after the digest comparison, as required.
7. **Canonical moved-note parser and checks (hunk 7): approved.** `/\bverbatim at :([1-9][0-9]*)\b/` has no nested/repeated ambiguous quantifiers and presents no catastrophic-backtracking risk. The surrounding unchanged checks still read the named line from the frozen head (`headLines(..., deltaPins[...], ...)`) and compare its trimmed text to the cited text read from the cited commit/path/line. The relocation check remains bounded by head-file length.
8. **Receipt fields (hunk 8): approved.** The output carries both `deltaPinsSha256: pinsDigest` and `predicateSentence: PREDICATE_SENTENCE`.
9. **Predicate digest term (hunk 9): approved.** `out.predicate` includes `pinsDigest === DELTA_PINS_SHA256`; mismatch is also refused before output, so this is a consistent explicit predicate term.
10. **CLI version labels (hunk 10): approved.** Human-readable success/refusal labels are versioned v5; exit semantics remain 0 for predicate true, 1 for false, 2 for refusal.

## No-harm / residual risk

No v4 predicate condition is weakened in the implementation: the clean adjacency gate, completeness accounting, nonempty drift, full audit coverage, audit/stale zero findings, delta accounting, and zero delta-screen findings remain enforced. Frozen-head resolvability remains a refusal in the unchanged evaluation path. The new digest binds exact frozen pins bytes. The removed v4 predicate prose mentioned these implemented conditions less precisely; the v5 canonical sentence includes equivalent output-field names and the digest term.

This is a static diff review, not a counter run or fixture reproduction. I did not independently run the honest/reordered-pins/decoy-note fixtures, verify the builder format against all moved rows, or verify the separate build-tool repair. No tools were installed.

VERDICT ok — all ten v4→v5 hunks approved for the assigned C1 code review; no actionable finding identified.
