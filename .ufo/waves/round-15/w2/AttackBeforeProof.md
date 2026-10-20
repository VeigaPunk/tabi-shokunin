# AttackBeforeProof — C2 `qualification.everyProofListensBefore` (round 15, source-reading only)

Author-side falsification. Not a non-author verdict. No gate, self-test, witness, test, counter or browser was executed. No source was edited. No tool was installed.

## Attacked bytes

- Repository root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- HEAD: `72dcf031b9da24796b718517ea575f21e4f7caae` (`72dcf03 round-15: enforce historical metadata contracts and retain build wave`). Matches `build-snapshot.json` `revision`. Baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- `git status`: `scripts/check-aria-metadata.mjs`, `scripts/check-user-round-contract.mjs`, `.ufo/waves/round-15/measure.mjs` and `metadata-witness.py` are clean, so working-tree bytes equal HEAD.
- Digests re-read from the working tree and from `git show HEAD:` (both agree):
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (blob `259d2505…`)
  - `scripts/check-user-round-contract.mjs` `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
  - `.ufo/waves/round-15/metadata-witness.py` `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`
- Not part of HEAD (working-tree only, uncommitted): `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md` (modified); `corpus/lessons/round-15.md` (untracked). Doc claims below are therefore working-tree claims, not committed bytes.
- Historical sidecar `corpus/evidence/round-14/aria-metadata/corrected.json` sha256 `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`, identical at `7054a5e` and HEAD. Committed `qualification` block: all eight fields present, `everyProofListensBefore: true`.

## Temporal limit (not invented success)

- `corpus/evidence/round-15/` contains only `metadata/expected-fixtures.json`, `metadata/mirror-contract.json`, `misroot-recovery.json`, `source-index.json`.
- `corpus/evidence/round-15/metadata-differential.json` (the receipt `.ufo/waves/round-15/measure.mjs:151` requires for C2) does **not exist**. No round-15 self-test or witness output is committed.
- The lesson's statements that single-field negatives and the before/after differential "ship"/"are retained" are therefore unevidenced in the tree. Nothing below certifies a run outcome.

## What the code does for `everyProofListensBefore` (read, not executed)

- Predicate table: `scripts/check-aria-metadata.mjs:114` (`QUALIFICATION_MIRROR_FIELDS`); legacy unchecked list `:133-137`.
- Independent recomputation: `expectedMirrorValues` `:989-1018`. `listensBefore = complete && proofs.every(p => p?.listeningBefore === true)` (`:992-994`), published at `:1012`. It does not read `allProofsPass`. This part is sound.
- Producer sample is real: `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:475` `listeningBefore: SERVER ? SERVER.listening : false`, sampled in `closeServerAndProve` before close (`:472-500`). Worker file `worker-0-1530637-1792474958700.json:2148` and `:2375` agree.
- Decision path: `evaluateSidecar` compares every qualification mirror with `mirrorFieldProblems` (`:972-987`, `value !== expected[name]` at `:984`) into `R14-ARIA-SIDECAR-QUALIFICATION-01` (`:1337-1355`). Acceptance is `findings.every(pass) && postEvaluation.ok` (`:1369-1370`); `postEvaluation.ok` is `evaluateAll(...).ok` (`:1087`), which includes `R14-ARIA-CLEANUP-PROOF-01` (`allProofsPass`).
- `buildSidecar` emits `everyProofListensBefore` from the same `expectedMirrorValues` (`:1469`, `:1573`).

## Defects

### D1 — medium — no single-field isolation for `everyProofListensBefore` in any in-tree control

- Evidence:
  - `scripts/check-aria-metadata.mjs:2453-2461`: `sidecar-qualification-mirrors` sets `everyProofListensBefore`, `everyProofClosed` and `everyProofRefusedAfterClose` to `false` together.
  - `scripts/check-aria-metadata.mjs:1981-1983`: `runWitnessMirrors` falsifies the same three together. Its `mirrorRejected` (`:2008-2011`) only checks that the cleanup and qualification findings fail, so it cannot tell which qualification field is responsible.
  - `corpus/evidence/round-15/metadata/expected-fixtures.json:335-360` (`sidecar-qualification-mirror-refusal`) asserts only finding IDs and statuses (`:345-357`). No problem string is pinned.
  - The only single-field negative is for cleanup: `silentMirror` at `scripts/check-aria-metadata.mjs:2469-2470` / fixture `sidecar-mirror-silent` (`expected-fixtures.json:395`, `:606-610`). No qualification analogue exists.
  - The single-field loop exists only in `.ufo/waves/round-15/metadata-witness.py:40-44`, which is outside the self-test and not yet run.
- Consequence [INFERENCE from code reading, not executed]: if the decision for `everyProofListensBefore` were dropped (for example a filter in the `mirrorFieldProblems` loop or in the qualification problem aggregation), the three-field control would still fail through `closed` and `refusedAfterClose`. No in-tree control would fail. The C2 claim "every emitted qualification mirror is enforced" is then untested for this field in-tree.
- Bounded correction: in `corpus/evidence/round-15/metadata/expected-fixtures.json`, add `sidecar-q-listensbefore` (`sidecarValid` with only `qualification.everyProofListensBefore = false`), plus matching `-closed` and `-refused` single-field fixtures. Each expects exit 1 and failed set `{R14-ARIA-SIDECAR-QUALIFICATION-01, R14-ARIA-SIDECAR-ACCEPTED-01}`. Add `expectedProblems` to the schema and assert `qualification.everyProofListensBefore` for the listensBefore case. Build the fixtures in `scripts/check-aria-metadata.mjs` near `:2453`, and add a single-field arm to `runWitnessMirrors` (`:1981`). Fixture additions are L1's integration call; the round-14 expectation and sidecar bytes stay frozen.

### D2 — medium — the independent listening-before computation is not discriminated by any pinned expectation

- Evidence: `postEvaluation.ok` (`:1087`) requires `R14-ARIA-CLEANUP-PROOF-01` to pass, which requires `allProofsPass` (`:396`). That forces every `listeningBefore === true` and `complete`. So for every acceptable input, the independent expectation (`:992-994`) and the aliased expectation `allProofsPass` both evaluate to `true`. The two implementations differ only on rejected inputs, and only in the `problems` detail of `R14-ARIA-SIDECAR-QUALIFICATION-01`. `expected-fixtures.json` pins IDs and statuses only, so the difference is invisible to the self-test.
- Consequence [INFERENCE]: reverting `:992-994` to `allProofsPass` (the defect MirrorQualification F2 and MirrorContexts #3 describe) would not change any pinned exit code, failed-ID set or accepted value. The "independent" claim is therefore not checked by the self-test.
- Bounded correction: add one in-process helper case (not a CLI fixture, because `derive` refuses receipts with failing proofs by design). Clone the round-13 receipt with one proof's `closeError` set to a string (`listeningBefore` stays `true`). Hand-write the honest qualification object with literal values: `everyProofListensBefore: true, everyProofClosed: true, everyProofRefusedAfterClose: true, everyProofNotListeningAfter: true`, and `allProofsSupportCorrection: false`. Assert that `evaluateSidecar` yields no `qualification.everyProofListensBefore` problem. Literal expectations, not `buildSidecar` output. This also discriminates the alias that D2 describes.

### D3 — medium — sidecar duplicate-key shadowing reaches the mirror check unchanged

- Evidence: `scripts/check-aria-metadata.mjs:302-317` (`decodeJson`) calls `JSON.parse` with no duplicate-member rejection. `readJson` (`:319`) feeds `evaluateSidecar`. The sidecar bytes are not digest-pinned (ANCHORS `:147-158` cover receipt, pin, manifest, spec, config, producer and worker only).
- Example: `"everyProofListensBefore": false, "everyProofListensBefore": true` parses to `true`, passes `:984`, and can be accepted. The first occurrence is what a first-wins reader would see.
- Consequence [INFERENCE]: a sidecar's mirror value is ambiguous and depends on the parser that reads it. The checker decides on last-wins.
- Bounded correction: reject duplicate member names in the sidecar before semantic evaluation (for example a short token scan of the object keys), or require canonical bytes in check mode: `Buffer.compare(bytes, stableStringify(JSON.parse(text)))`. The derive path already uses this comparison (`:1716-1721`). Historical `corrected.json` should satisfy it [INFERENCE: consistent with HistoricalImmutable D3; L1 must confirm without a new run].

### D4 — medium — `measure.mjs` does not require coverage of the three qualification mirrors unless the receipt declares them

- Evidence: `.ufo/waves/round-15/measure.mjs:950-961` takes the coverage set only when `receipt.emittedMirrors` is present; `:991-994` (`mirror_missing_differential`) runs only inside `if (declared)`. `metadata-witness.py:64-68` emits a result with no `emittedMirrors`, so a differential set covering only one field (for example `cleanup.allClosed`) passes this probe while `qualification.everyProofListensBefore` has no differential.
- The probe's own comment (`measure.mjs:114-116`) says it does not demand differentials for fields the old checker already enforced. Old checker `legacy.checkedCleanupMirrorFields` is empty, and `uncheckedQualificationFields` lists `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` (`corpus/evidence/round-15/metadata/mirror-contract.json:23-31`). The required set is therefore fixed by the contract: 6 cleanup fields plus those 3 qualification fields.
- Bounded correction: when `emittedMirrors` is absent, require exactly those nine fields, each once (`mirror_missing_differential`). Also have `metadata-witness.py` emit `emittedMirrors` so the coverage check is explicit. This is L1's probe change.

### D5 — medium (documentation overclaim) — lesson and SKILL wording exceeds shipped controls

- `corpus/lessons/round-15.md:37` says C2 "ships single-field CLI negatives". For qualification it does not; only `sidecar-mirror-silent` is single-field, and it is cleanup. `:10` and `:37` also describe a before/after outcome that has not been run (no receipt, see temporal limit).
- `SKILL.md:1800-1806` correctly calls `metadata-witness.py` a "round evidence probe, not an independent truth authority", but the lesson does not carry that qualifier.
- Bounded correction: either add the D1 fixtures before the wording stands, or change `:37` to "single-field differential in `metadata-witness.py` (not in the self-test)" and mark the outcome as pending until `corpus/evidence/round-15/metadata-differential.json` exists.

### D6 — low — derive identity check is circular for mirrors

- `scripts/check-aria-metadata.mjs:2763-2766` compares derived mirror output with `expectedMirrorValues(...)`, the same function `buildSidecar` calls (`:1469`). The derive-identity assertion therefore proves only that the emitter agrees with itself. The literal checks are the canonical `corrected.json` acceptance and the D1/D2 fixtures; those need to carry the weight.
- Bounded correction: pin the committed mirror literals from `corrected.json` (listed in `expected-fixtures.json` or the helper) instead of comparing against `expectedMirrorValues`.

## Verified non-defects (for L1's record)

- `listeningBefore` is a real `SERVER.listening` sample taken before close (spec `:475`, `:472-500`); it is not hard-coded.
- `expectedMirrorValues` `listensBefore` does not depend on `allProofsPass`; it is computed from the per-proof predicate.
- The python witness's `before` arm reads `acceptedCorrection` from `checkPayload`, which exists at both `7054a5e` (`check payload`, around line 1938) and HEAD (`:2891`). Not a defect.
- `mirrorFieldProblems` type-checks booleans before value comparison (`:982-984`); a string `"false"` is rejected by type.

## Commands for L1 (not run here)

1. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --check /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-14/aria-metadata/corrected.json; echo exit=$?` (expect 0 if the canonical sidecar still passes).
2. `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --self-test; echo exit=$?`
3. `python3 /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/metadata-witness.py > /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/metadata-differential.json` (the redirect is required; the script prints to stdout only).
4. After D1 fixtures land: confirm that a one-field mutation of only `everyProofListensBefore` fails the in-tree self-test, and that removing the decision for that field (in a scratch copy) makes it pass. That is the discrimination test D1 asks for.

## Residual risk / verification gaps

- No outcome above is executed. Acceptance, exit codes and digest pins for new fixtures are [INFERENCE] until L1 runs the commands.
- The historical receipt and sidecar pass/fail under the current code is read-only reasoning only.
- This is not a non-author certification.
