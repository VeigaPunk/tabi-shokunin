# Round 15 W2 — AttackCausalHarness

## Scope and attacked bytes

Axes examined: delivered-source identity, old/new input pairing, mirror-refusal causality, snapshot-tamper classification, and evidence timing.

The attacked build is revision `72dcf031b9da24796b718517ea575f21e4f7caae` (the checked-out `HEAD` matched the snapshot revision), baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`. The build snapshot at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json:2-8` records:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py` SHA-256 `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` (locally hashed bytes matched).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs` SHA-256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (locally hashed bytes matched).
- The snapshot explicitly says verification is “not yet exercised; wave2 source attacks precede L1 execution” at line 33.

No gate, test, self-test, counter, or browser execution was performed. This is a source-only author-side attack, not an independent certification. The LSP route was unavailable (`xd://lsp` was not mounted); grep/read results below are literal source observations, not semantic LSP proof.

## Findings

### F1 — The nine old/new mutations are paired on one target, but the refusal oracle is not field-causal

`metadata-witness.py:40-51` constructs six cleanup-field mutations and three qualification-field mutations, writes each mutated JSON once to `mutated-sidecar.json` at line 45, then passes that same path to old and current checker bytes at lines 47-50. Thus the source does set up the same nine malformed target files for both arms. These are specifically the six cleanup fields plus the three qualification fields listed as unchecked by the legacy contract; the current emitted field inventories are six and eight respectively (`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:101-118`).

The causal assertion is weaker than the mutation design: line 51 accepts any new-arm exit 1, `acceptedCorrection` false, and *any* failed finding whose ID contains `SIDECAR`. It does not require `evaluated/semantic_invalid`, the cleanup-vs-qualification mirror finding, or a diagnostic naming the mutated key. It could therefore pass if a generic or unrelated semantic sidecar rejection caused the refusal, without demonstrating that the target mirror itself was recomputed and enforced. This is a proof-precision defect in the differential harness, not an observed runtime failure of the checker.

The implementation source itself is consistent with the intended contract: `expectedMirrorValues` recomputes the mirror values from proofs at `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:989-1017`; `mirrorFieldProblems` checks exact field sets, types, and expected values at lines 972-987; `evaluateSidecar` checks cleanup and qualification mirrors separately and makes acceptance depend on all findings at lines 1315-1379. I found no static C2 enforcement omission in those paths.

**Bounded correction:** keep the same one-field-at-a-time paired inputs, but assert for each key the exact classification and exact failed-finding set: cleanup mutations must fail `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`, qualification mutations must fail `R14-ARIA-SIDECAR-QUALIFICATION-01`, the respective finding detail must contain `cleanup.<key>` or `qualification.<key>`, and the summary `R14-ARIA-SIDECAR-ACCEPTED-01` must fail. Record/check the target digest before both arms if the evidence is intended to attest byte identity, rather than only reusing a path.

### F2 — The spec-tamper differential does not assert the promised exact reason/status

At `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py:57-62`, the harness changes the isolated historical spec by appending bytes and records the original/computed digests. The old arm is considered sufficient if exit is 1, the sidecar is not accepted, and `R14-ARIA-SOURCE-01` appears among failed IDs. The new arm is considered sufficient if exit is 2 and `snapshot_tampered` appears among failed IDs. `failed_ids` at lines 28-29 treats every status other than `pass` as equivalent. Neither arm checks exact classification; the new arm also does not assert that the finding status is `could_not_evaluate`, that the mismatch is the `spec` entry, that it is the sole mismatch, or that no snapshot input is unavailable.

This leaves a false-positive path in the witness oracle: an exit-2 result with a different reason/status could satisfy the new-arm predicate if its findings contain an entry named `snapshot_tampered`. Likewise, the old-arm source finding could be caused by a different source problem rather than `spec.currentSha256`. The current checker does implement the intended branch statically: `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:927-969` maps snapshot mismatches to `could_not_evaluate/snapshot_tampered`, exit 2, and marks semantic evaluation skipped; source evaluation names a spec digest mismatch `spec.currentSha256` at lines 735-749.

A stronger exact oracle already exists for the new checker’s isolated spec-tamper self-test: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/metadata/expected-fixtures.json:791-815` specifies classification, exit, exact finding ID/status, and exact spec mismatch hashes, and `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs:2560-2681` checks those fields. That separate self-test specification does not strengthen the old/new causal result emitted by `metadata-witness.py` itself.

**Bounded correction:** for the current arm, require exact classification `{outcome: "could_not_evaluate", reason: "snapshot_tampered"}`, exit 2, exactly one `snapshot_tampered` finding with status `could_not_evaluate`, one mismatch labelled `spec` with the expected and computed digests, and no unavailable inputs. For the baseline arm, require the source finding detail to identify `spec.currentSha256` and reject any other unexpected failed IDs. Keep the old and new checker runs over the same isolated changed-spec bytes.

## Evidence timing and confidence

`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-15.md:57-59` still says actual command receipts and measurements are to be added before the lesson’s first commit. The metadata evidence directory currently contains only `mirror-contract.json` and `expected-fixtures.json`, not execution receipts. Therefore no execution-level success or failure is claimed; L1 must run the approved checks and retain their receipts after integration.

Confidence: **high** that the two Python predicates are under-specific, based directly on their source expressions; **high** that the current checker contains the named mirror and snapshot-classification enforcement paths; **no runtime conclusion** about the harness result, because execution was expressly out of scope and the snapshot says it has not yet been exercised.