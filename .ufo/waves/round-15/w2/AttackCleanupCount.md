# AttackCleanupCount — round-15 C2 `cleanup.perWorkerCount` refusal (source-reading only)

Author-side falsification. Not a non-author verdict. No gate, selftest, test, counter, or browser was executed.

## Attacked bytes

- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (`git rev-parse HEAD`; equals build-snapshot `revision`). Commit subject: "round-15: enforce historical metadata contracts and retain build wave".
- `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (matches snapshot; file is not in `git status`, so working-tree bytes equal HEAD). 3313 lines.
- `corpus/evidence/round-15/metadata/mirror-contract.json` sha256 `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`.
- `corpus/evidence/round-15/metadata/expected-fixtures.json` sha256 `d3bcc239b6f0b83cd771645c8ccf9f513178ed426228a1d8116be7459e3f4397`.
- Uncommitted worktree docs (`SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`) and untracked `corpus/lessons/round-15.md` are not in the snapshot digest set; not treated as delivered script bytes.

Tools used: `sha256sum`, `git rev-parse`, `git status` (read-only). Installed/updated: none.

## Temporal limits (stale-source reports)

The `.ufo/waves/round-15/w1/*.md` mirror reports (CausalWitness, MirrorContexts, MirrorServer, MirrorUnknowns, SidecarIdentity, PriorRouting, MirrorTypes, TamperManifest, RoundBaseline, QualityMirror, MirrorQualification, SelftestOracle) describe a pre-change checker: they cite `buildSidecar` at ~1263–1281 and say `evaluateSidecar` never reads `sidecar.cleanup`. At `72dcf03` that is no longer true: `buildSidecar` is at `:1446–1579`, and `evaluateSidecar` enforces both mirror tables at `:1315–1331` (CLEANUP-MIRROR-01) and `:1333–1355` (QUALIFICATION-01), using `CLEANUP_MIRROR_FIELDS`/`QUALIFICATION_MIRROR_FIELDS` (`:101–118`). The w1 "source.spec.sha256 currently ACCEPTED" claim is also stale (checked at `:1202–1204`). Those reports are reconnaissance only and are not delivered-byte reviews; I do not rely on them.

No round-15 execution receipts for C2 exist in `corpus/evidence/round-15/` (only `metadata/expected-fixtures.json`, `metadata/mirror-contract.json`, `misroot-recovery.json`, `source-index.json`). Build snapshot states `verification: not yet exercised`. Any "passed" claim for C2 is therefore unevidenced at this revision.

## Attack 1 — perWorkerCount deletion / string / zero mismatch: HELD (source reading)

Path for a sidecar with `cleanup` present:

1. `evaluateSidecar` (`:1097`) recomputes `expectedMirrorValues(proofs, cleanupDerived)` (`:1315`, `:989–1018`) from `context.receipt.cleanup.server.perWorker`. `perWorkerCount = proofs.length` (`:1000`).
2. `mirrorFieldProblems('cleanup', sidecar.cleanup, expected, CLEANUP_MIRROR_FIELDS)` (`:972–987`):
   - Deletion: `Object.keys` set differs → `cleanup:field_set`; `observed.perWorkerCount` is `undefined` → `typeOk` false → `cleanup.perWorkerCount:type`. Refused.
   - String (`"1"`): `Number.isInteger("1")` is false → `:type`. Refused even when the digits equal the true count.
   - Zero with one proof: `Number.isInteger(0)` true, `0 !== 1` → `cleanup.perWorkerCount`. Refused.
   - Missing whole `cleanup` → `cleanup:missing` (`:973`). Refused.
3. `pushFinding(... 'R14-ARIA-SIDECAR-CLEANUP-MIRROR-01', fail)` (`:1322–1331`) → `sidecarResult.accepted = false` (`:1369–1370`) → `runCheck` `ok=false`, `exit: EXIT.semantic` = 1 (`:1419–1425`).
4. Perwork count is itself anchored: `loadWorkerContext` requires the receipt's worker set to equal the on-disk directory set (`workers:directory_set_mismatch`, `:666–670`) and each cleanup proof to equal the authentic worker file (`:648–651`). Since `worker-*.json` and `receipt`/`manifest` are canonical, snapshot-hashed (`verifySnapshot` `:874–886`), the count cannot be forged independently of authenticated worker files.

Precision notes (not defects):
- Zero is refused by the mirror only when `proofs.length ≥ 1`. With an empty `perWorker`, expected is `0`, so a sidecar `0` passes the mirror check; it is refused by `R14-ARIA-CLEANUP-PROOF`/`perWorker:missing_or_empty` (`:386–390`) and the residual post-evaluation (`:1357–1367`). Any single-field "zero" fixture must therefore use a one-proof receipt (`@receipt-old`/`@pin`), or the expected finding set will be wrong.

## Attack 2 — isolation of the perWorkerCount refusal: DEFECT (coverage gap, Medium)

The lesson promises single-field CLI negatives for C2 (`corpus/lessons/round-15.md:37`: "ships single-field CLI negatives"; `SKILL.md` row lists per-field cases). The committed `expected-fixtures.json` does not isolate `perWorkerCount`:

- `sidecar-cleanup-mirror-refusal` (`expected-fixtures.json:309–334`) mutates `perWorkerCount` together with five other cleanup fields (generator `check-aria-metadata.mjs:2438–2451`, `perWorkerCount: 2`).
- `sidecar-mirror-type-refusal` (`:361–387`) types `allClosed`, `everyProofClosed`, `proofCount` — not `perWorkerCount`.
- `sidecar-silent-cleanup-mirror` (`:388–409`) mutates only `allNotListeningAfter`.
- `mirror-witness` in-process mutation (`:1973–1980`) sets `perWorkerCount: baseline + 1` among five other fields.
- `grep perWorkerCount` over `corpus/evidence/round-15/metadata/` finds only `mirror-contract.json:8`.

So deletion, string, and zero-mismatch for `perWorkerCount` have no single-field CLI case. Their refusal is correct by reading, but unproven as an isolated diagnostic. Bounded correction (for L1 to decide; not applied by me): add three generated sidecar cases from `sidecarValid` (receipt-old, one proof): `cleanup.perWorkerCount` deleted; `"1"`; `0`. Each expects exit 1 with failed set `{R14-ARIA-SIDECAR-CLEANUP-MIRROR-01, R14-ARIA-SIDECAR-ACCEPTED-01}` and no `snapshot_tampered`. Commit literal `sha256`/`bytes` for the new fixtures in `expected-fixtures.json`.

## Attack 3 — "authenticated snapshot" scope: DEFECT (High for the C2 classification claim)

`verifySnapshot()` (`:871–925`) hashes only fixed paths: `DEFAULT_RECEIPT`, `DEFAULT_PIN`, manifest, spec, config, producer, and workers. It takes no arguments. Meanwhile the evaluated inputs are caller-chosen:

- CLI `--receipt`/`--pin` (`parseArguments` `:3119–3124`) → `runCheck({receiptPathText, pinPathText})` → `prepareContext` (`:1020–1021`, `:1397`). `runCheck` calls `verifySnapshot()` with no path argument (`:1386`).
- `--check <sidecar>` takes receipt and pin paths from the sidecar's own `original.receipt.path`/`original.pin.path` (`resolveCheckInput` `:3033–3063`, binding `:1174–1185`). A sidecar can point at any file.
- `evaluateAnchors` (`:826–852`) enforces the receipt/pin anchor only when `canonicalReceipt`/`canonicalPin` (`:828–833`). The `anchored_*_at_noncanonical_path` rules (`:834–839`) fire only if the bytes already equal the anchor. Any other non-canonical bytes produce anchor PASS.

Consequence (static trace, not executed): a plain check with `--receipt <other> --pin <other>` runs the full semantic evaluation on unauthenticated bytes while the snapshot is still reported as clean. If the semantic checks pass, `runCheck` returns exit 0 (`:1419–1425`). A self-consistent sidecar pointing at the same forged receipt also passes binding (`:1164–1173`, `:1199–1207` use anchors only for `source.*`, which the forger copies from the public `ANCHORS`). The canonical-byte criterion (changed canonical files → exit 2) is met; the claim that every clean verdict rests on authenticated inputs is not.

Limits of this claim: [INFERENCE] a forged body must still satisfy the semantic checks (node/pin binding, correction, provenance, residual). I did not trace every semantic check for a forged body; the worker-set and proof-to-worker binding do hold (see Attack 1, item 4). The `@receipt-old` fixtures (`expected-fixtures.json:309–318`) use a non-canonical receipt on purpose, so this is a scope hole in CLI/derived-verdict semantics, not a fixture regression.

Bounded correction (for L1 to decide; not applied by me): in `runCheck` and `runDerive`, compare resolved receipt and pin against `DEFAULT_RECEIPT`/`DEFAULT_PIN`. If they differ and the verdict would be clean, return `could_not_evaluate` with a new reason such as `snapshot_unauthenticated_input` (exit 2), or label the run `evaluated_unauthenticated` and refuse clean. Keep the `@receipt-old` fixture path behind an explicit self-test-only option. Document the chosen behavior in `SKILL.md`/`QUALITY.md`, and add an isolated case with a non-canonical clean receipt pair.

## Attack 4 — sidecar mirror tamper classification: HELD (not a defect)

`corpus/lessons/round-15.md:47` and `mirror-contract.json` specify: changed authenticated snapshot → exit 2 `snapshot_tampered`; sidecar false semantic claims → exit 1. The code matches that (mirror tamper in the committed sidecar yields exit 1 through `:1315–1331`, and `DEFAULT_SIDECAR` is not in `ANCHORS`). I do not raise sidecar mirror tamper as a classification defect.

## Verification gaps and commands for L1 (not run by me)

- No C2 execution receipts exist yet. After integration, L1 should run `node scripts/check-aria-metadata.mjs --self-test` and `node scripts/check-aria-metadata.mjs --witness-mirrors` once, then compare against `expected-fixtures.json`.
- Verify Attack 2 by adding the three single-field fixtures and confirming each reports exit 1 with the expected fail set.
- Verify Attack 3 by a non-canonical clean receipt/pin pair and confirm exit 0 at HEAD. This is the falsifier to refute or fix.
- Do not treat the `w1/*.md` mirror reports as evidence for the delivered bytes; they predate `72dcf03`.
