# AttackCleanupRefused — round-15 wave2 falsification (source reading only)

Author-side falsifier report. Not a non-author verdict. No checks, gates, self-tests, counters, browser runs or source edits were executed by this seat.

## Attacked bytes

- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD; `git status` shows `scripts/check-aria-metadata.mjs` unmodified against it).
- Baseline: `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`, equal to `.ufo/waves/round-15/build-snapshot.json`. 3313 lines.
- `.ufo/waves/round-15/metadata-witness.py` sha256 `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` (snapshot match).
- `.ufo/waves/round-15/measure.mjs` sha256 `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` (snapshot match).
- `scripts/check-user-round-contract.mjs` sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (snapshot match; not in scope of C2).

## Temporal limits

- The w1 reports (`.ufo/waves/round-15/w1/CausalWitness.md`, `MirrorQualification.md`, `MirrorServer.md`, `MirrorUnknowns.md`, `SidecarIdentity.md`, `TrendAudit.md`, `RoundBaseline.md`, and others) cite line numbers of an older checker (`buildSidecar` near 1264, validator 1060–1081, no `sidecar.cleanup` reader). Those reports predate the delivered bytes. In `72dcf031` the cleanup and qualification mirrors ARE read: `evaluateSidecar` compares them at lines 1315–1355 via `expectedMirrorValues` (989–1018). Their "no mirror enforcement" findings are NOT live defects of the delivered bytes and are not re-reported here.
- The round-15 lesson exists but is uncommitted: `corpus/lessons/round-15.md` (untracked). QUALITY.md, README.md, SOURCES.md and SKILL.md are modified but uncommitted. The round-15 metadata fixtures and mirror contract exist (`corpus/evidence/round-15/metadata/`). No round-15 ARIA receipt exists; the historical receipt is `corpus/evidence/round-13/aria/receipt.json` and the corrected sidecar is `corpus/evidence/round-14/aria-metadata/corrected.json`.
- LOG.md and SCORECARD.md do not exist at `corpus/`; nothing was checked there.

## Findings (by severity)

### F1 — HIGH — The authenticated-snapshot gate is keyed by path, not by bytes; a forged receipt/pin pair can reach a clean verdict

Claim under attack: "changed authenticated snapshot bytes yield `snapshot_tampered`/exit 2" (`corpus/lessons/round-15.md:10,38,47`; `corpus/QUALITY.md:65-71`; `SKILL.md` round-15 table row for aria-historical-metadata).

Source facts:
- `verifySnapshot()` (`scripts/check-aria-metadata.mjs:871-925`) hashes only the default constants: `DEFAULT_RECEIPT`, `DEFAULT_PIN` (875–876), manifest, spec, config, producer and workers. It takes no arguments.
- `runCheck` calls `verifySnapshot()` with no arguments (1386), then `prepareContext(receiptPathText, pinPathText)` (1397). `prepareContext` reads the caller-supplied paths (1021–1022). The hash gate and the parsed input are therefore different files whenever `--receipt`/`--pin` are overridden.
- `parseArguments` accepts `--receipt`/`--pin` (3119–3122) with defaults at 3081–3082.
- `evaluateAnchors` (826–869) enforces receipt/pin digests only when the path is canonical (828–833). A non-canonical receipt whose bytes differ from `ANCHORS.receiptSha256` is not flagged at all: the only non-canonical flag is for anchored bytes at a non-canonical path (834–839). With a non-canonical pin as well, the `canonical_pair` checks (846–852) are skipped entirely.
- `evaluatePin` (793–824) binds the receipt to the pin only through the receipt's own fields: `receipt.runtime.pinned.pinSha256` must equal the pin file's sha (808–810) and `receipt.pin` must equal the pin projection (814–818). Both are forgeable as a pair.
- `--check <sidecar>` (`resolveCheckInput` 3033–3064, applied at 3255–3257) takes the receipt and pin paths from the sidecar's own `original.receipt.path` / `original.pin.path` (3052–3053). The sidecar selects which file is authenticated.
- `runDerive` (1617–1662) accepts any receipt/pin path, calls `verifySnapshot()` for defaults only (1618), and writes a qualified sidecar whose `original.receipt.sha256` is taken from the forged read (`buildSidecar` 1459–1468).
- Mirror-tamper fixtures (`corpus/evidence/round-15/metadata/expected-fixtures.json`, the `mirror-tamper-*` cases around lines 686–893) use `args: []` and mutate only canonical paths (`mirrorTargetFor`, lines 2193–2198). No fixture overrides `--receipt`/`--pin` with a changed copy.

Counterexample (source-derived, [INFERENCE] until L1 runs it):
1. Copy `corpus/evidence/round-13/aria/receipt.json` and `runtime-pin.json` to a temp directory.
2. In the receipt copy set `cleanup.server.listeningAfter` to `false` and `runtime.pinned.pinSha256` to the sha of the pin copy.
3. Run `node scripts/check-aria-metadata.mjs --receipt <tmp>/receipt.json --pin <tmp>/runtime-pin.json`.
- Predicted: `verifySnapshot` passes (defaults untouched); both anchors are skipped (non-canonical, no anchored bytes); worker proofs still match the authenticated worker files because the workers come from the canonical directory and are hash-checked; `R14-ARIA-CLEANUP-LISTENING-AFTER-01` passes because `server.listeningAfter` now equals the derived value; `preEvaluation.ok` is true and `runCheck` returns exit 0 (1398–1414). The historical contradiction, which the usage header (`scripts/check-aria-metadata.mjs:30`) says must stay red, disappears.
- Variant: with the canonical pin and a changed receipt copy, `canonical_pair:receipt_not_canonical` fires (846–848) and the verdict is exit 1 `semantic_invalid`, not exit 2 `snapshot_tampered`. This is a classification defect against the stated contract.

Impact: the "authenticated snapshot" guarantee holds only for the literal default path. C2's second clause (snapshot tampering must be could-not-evaluate) is not met for any path override, `--check` of a crafted sidecar, or `--derive` of a forged receipt.

Bounded correction:
- Authenticate by bytes: in `runCheck`, `runDerive`, `runWitness`, `runWitnessMirrors`, compare `context.receiptRead.entry.sha256` and `context.pinRead.entry.sha256` to `ANCHORS` regardless of path, and return `snapshot_tampered` (exit 2) on mismatch before semantic evaluation. Keep the `verifySnapshot` worker/manifest/spec/config/producer checks as they are.
- Or reject non-canonical receipt/pin paths in every authenticated mode with exit 2, and make `resolveCheckInput` ignore sidecar-declared paths (use canonical paths; compare the declared sha to the anchor).
- Add fixtures: changed receipt copy via `--receipt` → exit 2 `snapshot_tampered`; changed pin copy via `--pin` → exit 2; crafted sidecar with non-canonical `original.receipt.path` via `--check` → exit 2; `--derive` on a changed copy → exit 2, no output written.

### F2 — MEDIUM — "Independent recomputation" is overstated: writer and validator share one authority, and `summaryServerOk` is a pass-through

Claim under attack: `corpus/lessons/round-15.md:37` ("C2 recomputes cleanup/qualification fields independently of the writer"); `corpus/evidence/round-15/metadata/mirror-contract.json` description ("independently recomputed from the raw per-worker proofs and cleanup derivation").

Source facts:
- One function, `expectedMirrorValues(proofs, cleanupDerived)` (989–1018), is used by both the writer `buildSidecar` (1469, emitted at 1561–1577) and the validator `evaluateSidecar` (1315, compared at 1316–1331 and 1337–1355). Producer and validator therefore share one authority, which is the duplicate-authority risk the w1 report `MirrorQualification.md` F4 described.
- `summaryServerOk` (1005) is `cleanupDerived.serverOk === true`. `cleanupDerived.serverOk` is `derivedAllGood = allProofsPass` (415, 516), i.e. the output of `evaluateCleanup`'s value predicate (`proofValueProblems`, 368–378). No per-field predicate exists for this mirror in `expectedMirrorValues`.
- `derivedListeningAfter` (1004), `allProofsComplete` (1010), `allProofsSupportCorrection` (1011) and the `complete` gate (992) all come from the same `cleanupDerived` object.
- `qualification.qualified` is the literal `true` (1008), not derived from acceptance. It is enforced only via `sidecar.qualified === true` (1334).
- No literal mirror expectations exist in round-15 fixtures: the expected-fixtures file contains no literal values for `allRefusedAfterClose`, `summaryServerOk` or `everyProofClosed`. The SelftestOracle plan (`.ufo/waves/round-15/w1/SelftestOracle.md`, items 1–3: literal values, raw-predicate recomputation, one single-field negative per mirror) is not implemented in the fixture contract.

Counterexample sketch (source-derived, [INFERENCE]): regress `proofValueProblems` by deleting the `refusedAfterClose` check (line 373). Then `allProofsPass` is true for a `refusedAfterClose:false` proof; both writer and validator emit and expect `summaryServerOk: true`; the mirror finding passes. Only `allRefusedAfterClose` (raw `every`, 1002) would still flag the regression, and only if its literal path is exercised.

Mitigation present: the committed round-14 `corrected.json` carries literal cleanup values (`allClosed:true`, `allRefusedAfterClose:true`, `summaryServerOk:true`, etc.; `corpus/evidence/round-14/aria-metadata/corrected.json`), and `evaluateSidecar` compares it against the recomputation at check time. That literal check covers the canonical all-true case only, not the negative semantics.

Bounded correction:
- Give the validator its own predicate: in `evaluateSidecar`, compute `summaryServerOk` (and `derivedListeningAfter`, `allProofsSupportCorrection`) from `context.receipt.cleanup.server.perWorker` field by field, in a function the writer does not call. Keep `buildSidecar` on the writer function.
- Add literal expectations to the round-15 fixtures (values from `corrected.json` for the canonical case; each single-field flip expects exit 1 with the stable mirror finding), per SelftestOracle items 1–3.
- Correct the lesson sentence at line 37 to say "recomputed by a shared function; producer and validator are not independent".
- Make `qualification.qualified` a derived value or document it as a constant claim.

### F3 — LOW — Sidecar binding failures on non-canonical paths are classified semantic, not could-not-evaluate

Source: `evaluateSidecar` binding checks at 1164–1173 and 1186–1207 produce `R14-ARIA-SIDECAR-BINDING-01` failures; `runCheck` maps them to `exit: EXIT.semantic` (1423–1425). The w1 `RoundBaseline.md` item 2 proposed mapping receipt/pin binding failures to exit 2. The delivered code does not. For canonical paths this case is unreachable, because `verifySnapshot` fails first (F1 covers the reachable routes). Fix together with F1: a receipt/pin sha mismatch on any path must be `snapshot_tampered`, not a semantic failure.

### F4 — LOW — `summaryServerOk` and the three `everyProof*` mirrors are checked by equality only, with no fixture-level proof

`mirrorFieldProblems` (972–987) checks field set, type and equality. Those checks are sound for the cases exercised, but the only single-field negatives are the in-process `sidecar-cleanup-mirrors` and `sidecar-qualification-mirrors` fixtures (expected-fixtures lines 309–360). Their expected findings are the coarse `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` and `-QUALIFICATION-01`, so a single failing field is not identifiable from the exit alone. Low priority; addressed by F2's correction.

## Checked and not found defective

- Digests: all four snapshot files named in the build snapshot match the working tree (see the attacked-bytes list above).
- Legacy checker digest in `corpus/evidence/round-15/metadata/mirror-contract.json` (`checkerSha256 ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6`) equals `git show e570380d:scripts/check-aria-metadata.mjs | sha256sum`. Static only; `legacyExecuted:false` is consistent with that.
- Canonical-path tamper of receipt/pin/manifest/spec/config/producer/workers is exit 2 via `snapshotOutcome` (927–970); fixture expectations for those cases (`expected-fixtures.json` 686–893) match the code.
- `allRefusedAfterClose` expected value (1002, `complete && every(refusedAfterClose===true)`) is computed from raw proofs; it does not depend on `cleanupDerived.serverOk`. It is the one mirror that is raw-recomputed.
- Sidecar-level tamper of cleanup mirrors on a canonical receipt is exit 1 semantic (the sidecar is not anchored, which the lesson records as a rejected scope at `corpus/lessons/round-15.md:12`). Consistent with the contract.

## Commands L1 should run (not executed here)

- Confirm F1 variant A: copy receipt and pin to a temp directory, change `cleanup.server.listeningAfter` and `runtime.pinned.pinSha256` in the receipt copy, run `node scripts/check-aria-metadata.mjs --receipt <tmp>/receipt.json --pin <tmp>/runtime-pin.json`. Expected per contract: exit 2 `snapshot_tampered`. Predicted from source: exit 0.
- Confirm F1 variant B: same copy with the canonical `--pin`. Expected per contract: exit 2. Predicted from source: exit 1 with `canonical_pair:receipt_not_canonical`.
- Confirm F1 sidecar-path route: a sidecar whose `original.receipt.path` names an absolute temp copy, run with `--check`.
- Confirm F2 by an in-process regression on a temp copy of `proofValueProblems`, not on committed bytes.

## Tooling

No installs or updates were performed. No pacman use (host pause in effect).

## Scope and authority

Author-side falsifier output for the delivered revision `72dcf031`. Not a non-author certification. Predictions marked [INFERENCE] are source-derived and must be confirmed by L1 execution; no outcome in this report was observed by running code.
