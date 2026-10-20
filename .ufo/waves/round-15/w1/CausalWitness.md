# CausalWitness — round 15 C2 mirror differential

Read-only, bounded source audit. No source/evidence edits, gates, counters, tests, self-tests, browser runs, or other checks were performed. No tools were installed or updated. This is author-side static analysis, not a runtime verification.

## Axes

- **Calibration:** distinguish raw cleanup truth in the historical worker proof from duplicated sidecar metadata mirrors.
- **Operability:** make the malformed-mirror refusal observable through an isolated CLI expectation, not a silent internal predicate.
- **Integrity/provenance:** use one unchanged historical receipt/pin pair and preserve their original bytes while mutating only a disposable sidecar copy.

## Finding: current validator admits a false emitted cleanup mirror

In `scripts/check-aria-metadata.mjs` at the read snapshot, `buildSidecar` emits six `cleanup` mirror fields (`perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`) at lines 1263–1269. It emits `qualification.everyProofListensBefore`, `everyProofClosed`, and `everyProofRefusedAfterClose` at lines 1271–1280.

`evaluateSidecar` validates correction/binding, Node and provenance at lines 897–1058, then checks only a subset of qualification (`qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, `everyProofNotListeningAfter`) at lines 1060–1080. It does not read/compare `sidecar.cleanup` anywhere in lines 853–1108, and does not compare those three emitted `everyProof*` mirrors. The acceptance decision is `findings.every(pass)` at lines 1095–1107; `runCheck` maps an accepted sidecar with successful post-evaluation to exit 0 at lines 1126–1142.

### Concrete differential vector (not executed)

1. Start with the valid generated sidecar (the existing self-test constructs it as `sidecar-valid` at lines 1730–1741).
2. Change exactly `sidecar.cleanup.allClosed` from `true` to `false`; leave the receipt, pin, worker proof, correction, binding, and every other sidecar field byte-for-byte as they were.
3. Static old-path result: this mismatch is invisible because the old validator does not inspect the emitted `cleanup` object. Its existing binding checks cover receipt/pin/proof identities, not this sidecar mirror (lines 908–968); therefore all old findings remain passing and the CLI accepts it (inferred from the direct call path, not observed by running it).
4. New expected result: a stable cleanup-mirror mismatch finding and nonzero refusal (expected CLI exit 1), while the unmodified canonical sidecar remains the green control. This mirror mismatch is not evidence that the authenticated historical snapshot changed, so it should not be labeled `snapshot_tampered`/could-not-evaluate.
5. Assert the exact same malformed sidecar bytes, receipt bytes and pin bytes are supplied to old and new arms. Record old `exit=0, accepted=true` and new `exit=1, accepted=false` plus the named mirror finding. Independently assert receipt and pin hashes are unchanged before/after; do not edit the historical receipt to make the mirrors agree.

A second one-field vector for the separately omitted qualification checks is `qualification.everyProofClosed: true → false`. It exercises the qualification mirror gap directly; retain the first vector as the primary test of the wholly unchecked `cleanup` object. The round-15 test matrix should cover both if it claims all emitted cleanup and qualification fields are enforced.

The existing `--self-test` builds `sidecar-valid`, bad-receipt-digest, wrong-direction and false-exact-node variants at lines 1741–1757; the persisted `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` includes valid-sidecar acceptance and these other failures, but no cleanup- or qualification-mirror mutation. Thus the proposed vector fills a real case gap rather than duplicating an existing persisted CLI case.

## Truth and original-byte boundary

The historical invariant is the unchanged worker-level proof: the committed receipt and pin are pinned by checker constants at lines 62–73; `evaluateCleanup` derives its cleanup values from the nonempty per-worker proofs at lines 296–323. `runWitness` hashes receipt and pin before/after at lines 1486–1505, but its current green arm uses the ordinary valid sidecar; it does not exercise a corrupted mirror. Use the same fixture inputs for both differential arms and assert the original hashes remain constant. Do not rewrite `corpus/evidence/round-13/aria/receipt.json`, `runtime-pin.json`, or the committed `corrected.json` to stage this test.

Prior routed evidence already identifies this exact contract gap: `corpus/lessons/round-14-verifier-spotcheck.md:131` says the complete sidecar bytes/all duplicate descriptive fields are not validated; lines 184–186 route enforcement of cleanup and qualification mirrors and separately route authenticated-snapshot tamper classification. The prior report records the old checker at revision `e570380d77180ab394256dd6187cac0c5eaf62ec`, SHA-256 `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6` (`:123`). That provides a candidate pinned old arm for an actual later differential; this audit did not invoke it.

## Evidence limits and confidence

- **High confidence** in the source-level gap: direct reads show the emitted fields, omitted comparisons, and acceptance/exit path.
- **Static inference only** that the malformed sidecar exits 0 under the prior checker; no gate or CLI was run, per assignment. The new refusal is a proposed expected behavior, not an observed result.
- No LSP device is mounted: reading `xd://lsp` returned `No such tool`. Findings use direct source reads rather than grep as semantic proof.
- Source/case anchors above describe the read snapshot and may move as the executor edits. Main should run its own post-integration verification; this report certifies no run.
