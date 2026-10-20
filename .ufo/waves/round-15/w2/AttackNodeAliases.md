# AttackNodeAliases — round15 C2 falsification (source-reading only)

Author-side attack report. Not a non-author verdict. No gate, test, self-test, counter, browser, or build was executed. Digests and read-only `git show`/`git status` were used only to pin bytes.

## Attacked revision and bytes

- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (`round-15: enforce historical metadata contracts and retain build wave`), equal to `HEAD` and to `build-snapshot.json` `revision`.
- Baseline per snapshot: `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- Digests re-read from disk and matching the snapshot:
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`
  - `scripts/check-user-round-contract.mjs` `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
  - `.ufo/waves/round-15/metadata-witness.py` `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`
- Not digest-bound by the snapshot, and not at the attacked revision: `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md` are modified and uncommitted. `corpus/lessons/round-15.md` is untracked. Their current bytes are `e3b1e39c…e7b4`, `cdd2921c…f116`, `dd20d0c2…d6a6`, `44f2960b…c79a`, `72f53c9d…84d1`. Doc claims below are therefore attacked against these uncommitted bytes only as a temporal limit, not as a delivered-byte review.
- Legacy checker check: `git show e570380:scripts/check-aria-metadata.mjs` hashes to `ef37387217c7…4343f6`, matching `LEGACY_ROUND14.checkerSha256`. The legacy qualification-checked fields (`qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, `everyProofNotListeningAfter`) match the constant at `check-aria-metadata.mjs:122-144`, and the legacy source has no cleanup-mirror checks. That part of the static legacy basis holds.
- Sidecar under test: `corpus/evidence/round-14/aria-metadata/corrected.json` `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`.
- Receipt and pin anchors match the code constants: receipt `b458b351…89b7`, pin `4d894756…ccd2`, manifest `56764241…2112`, worker `0d0f00e2…a5e7`.
- Temporal limit: L1 has not executed any gate. `build-snapshot.json` says `verification: not yet exercised`. The round-15 lesson exists (`corpus/lessons/round-15.md`, untracked). Wave-2 artifacts (`w2/validation.json`, `w2/record.json`, etc.) exist but were not used as evidence of success.

## Findings, by severity

### F1 — HIGH: fully non-canonical receipt+pin pairs pass the anchor finding, and the clean verdict ignores authentication

Code propositions:
- `evaluateAnchors` (`scripts/check-aria-metadata.mjs:826-869`) enforces the canonical pair only inside `if (canonicalReceipt || canonicalPin)` at `:846-852`. When neither the receipt nor the pin is at its canonical path, no problem is emitted for their bytes. The only other anchor problem is the narrow `:834-839` / `:837-839` case, where exact anchored bytes sit at a non-canonical path. Arbitrary different bytes at non-canonical paths pass `R14-ARIA-ANCHOR-01`.
- `resolveCheckInput` (`:3033-3064`) takes `receiptPathText` and `pinPathText` from the sidecar's own `original.receipt.path` / `original.pin.path` (`:3052-3053`). `readEntry` (`:243-245`) accepts any absolute or ROOT-relative path. The `--receipt` and `--pin` CLI options (`:3119-3122`) also accept any path.
- `verifySnapshot` (`:874-886`) hashes only the canonical receipt, pin, manifest, spec, config, producer, and worker. It never sees a substituted receipt or pin. `runCheck` (`:1386-1396`) therefore reaches a clean result with a non-canonical pair.
- `runCheck` returns `ok` at `:1419-1422` from `sidecarResult.accepted`, `postEvaluation.ok`, and sidecar findings. It never consults `authenticatedAnchors`, which is not computed in `runCheck` at all.
- Consequence: the Node floor comes from the pin. `deriveNode` (`:527-530`) reads `minimumMajor` from the supplied pin, and `evaluateNode` (`:571-576`) enforces it. `evaluatePin` (`:793-824`) checks only type shape, `pinSha256` equality with the receipt, and `pinPath === DEFAULT_PIN`. A non-canonical pin with a lower `minimumMajor` therefore changes the Node verdict and is not classified `snapshot_tampered`.
- Forging requirements, from reading only [INFERENCE, not executed]: a copied receipt with edited bytes, whose `runtime.pinned.pinSha256` equals the substituted pin's sha, whose `source`, `inputs`, `manifest`, and `summary` fields match the anchors, whose `cleanup.server.perWorker` equals the real worker `cleanup.server` (`:638-654`), and whose `runtime.node` equals the real worker node (`:531-534`). Nothing in the checker prevents this.
- The task's acceptance requires authentication. Here an authenticated-looking clean verdict (exit 0) is reachable from non-authenticated substitute bytes.

Bounded correction:
- In `runCheck`, `runWitness`, and `runWitnessMirrors`, refuse any acceptance or `ok` unless the evaluated receipt and pin are the canonical paths and their sha equals `ANCHORS.receiptSha256` / `ANCHORS.pinSha256`. Use `authenticatedAnchors` (computed at `:1838-1839` and `:2032-2033`) as a gate, not as a reported field.
- Make `evaluateAnchors` emit `canonical_pair:*` problems when neither path is canonical, not only when one is.
- Alternatively refuse non-canonical inputs with exit 2 `snapshot_unavailable`, matching the lane's standard that unauthenticated bytes are could-not-evaluate.

### F2 — HIGH: "descriptive" booleans and the three Node aliases are self-asserted tautologies

Code propositions:
- The builder writes literal `descriptiveOnly: true` and `recordedIsDescriptive: true` and `recordedRole: 'descriptive'` at `:1550-1552`, regardless of the receipt.
- The checker compares the sidecar to the same literals at `:1278-1282`, and emits `historicalRuntimePinMatchIncludesNode: false` as a hard-coded literal in the finding detail at `:1287`.
- `R14-ARIA-NODE-RECORDED-01` (`:563-570`) passes whenever `shapesOk` holds and emits `descriptiveOnly: true` and `recordedRole: 'descriptive'` as literals. It never derives descriptiveness from anything. A recorded value that did participate in the pin match would still pass.
- The historical receipt does not include node in its pin match: `corpus/evidence/round-13/aria/receipt.json:35-46` has `runtime.pinned.matched` with keys `playwrightMatched`, `chromiumMatched`, `browserVersionMatched`, `runtimeConsistent`, and no node key. The checker never reads those keys. The exclusion is asserted, not checked.
- Aliases: `deriveNode` (`:543-545`) sets `exactMatch`, `exactRecordedMatch`, and `observedMatchesRecorded` from the same expression. The sidecar builder (`:1545-1547`) and checker (`:1268-1274`) then compare three names that can only ever agree. The "exact aliases" check tests one value three times and cannot falsify the aliases independently.
- Also, `expectedMirrorValues` (`:1008`) sets `qualification.qualified: true` as a constant, and the checker compares it to the constant `true`. That mirror is tautological.

Bounded correction:
- Derive `historicalRuntimePinMatchIncludesNode` from the keys of `receipt.runtime.pinned` (node present means fail). Derive `descriptiveOnly` from that. Make `R14-ARIA-NODE-RECORDED-01` fail when the derived value is not descriptive, instead of emitting literals.
- Either remove two of the three aliases and keep one canonical field, or derive each from a distinct comparison (for example, `observedMatchesRecorded` from raw string equality of `observedRaw` and `recordedRaw`).
- Drop the constant `qualified` mirror or derive it from something other than the constant.

### F3 — MEDIUM: witness `ok` expressions exclude the authentication they compute

- `runWitness` computes `authenticatedAnchors` at `:1838-1839` and reports it at `:1902`, but `ok` at `:1846-1848` omits it. A witness can be green on substitute receipt and pin paths via `--receipt` / `--pin` or via the sidecar's self-declared original paths.
- `runWitnessMirrors` computes `authenticatedAnchors` at `:2032-2033` and reports it at `:2069`, but `ok` at `:2034-2036` omits it. The same green-on-substitute outcome is available.

Bounded correction: include `authenticatedAnchors` in both `ok` expressions, and fold it into F1's refusal.

### F4 — MEDIUM: round-15 mirror-contract and expected-fixtures assets are not authenticated and are not consumed by the gate

- `verifySnapshot` (`:874-886`) anchors six artifacts plus workers and omits `DEFAULT_MIRROR_CONTRACT` and `DEFAULT_EXPECTATIONS` (`:74-75`). Those assets are read only inside `runSelfTest` (`:2276-2347`). The header claim at `:98-100` that "the committed mirror-contract asset must match [the code tables] exactly" is therefore enforced only by a self-test that the gate's `--check` path never runs.
- The asset `corpus/evidence/round-15/metadata/mirror-contract.json` declares `tamper.exit: 2` and `snapshot_tampered`, but no code path consumes that block. Editing the asset changes nothing in the gate and is not classified as tampering.
- Current bytes (sha256 read from disk): `corpus/evidence/round-15/metadata/mirror-contract.json` `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`; `corpus/evidence/round-15/metadata/expected-fixtures.json` `d3bcc239b6f0b83cd771645c8ccf9f513178ed426228a1d8116be7459e3f4397`.

Bounded correction: add both assets to `ANCHORS` and to `verifySnapshot`, and make `runCheck` consult the committed contract so the code tables and the asset are compared on every check, not only in self-test.

### F5 — LOW: digest-then-reread (TOCTOU)

- `verifySnapshot` reads each anchored file through `readEntry` (`:891`), hashes it, and discards the bytes.
- `prepareContext` re-reads the receipt, pin, and manifest by path (`:1021-1025`) and evaluates those second reads.
- The evaluated bytes are therefore not the bytes that were hashed. A local writer that swaps a canonical file between the two reads defeats the snapshot. Low severity because it needs local write access, but it contradicts "authenticated input bytes are hashed before any semantic evaluator runs" at `:872`.

Bounded correction: have `verifySnapshot` return the verified entries, and have `prepareContext` consume those entries for canonical paths.

### F6 — LOW: the legacy arm is a constant and a proxy, not an observation

- `LEGACY_ROUND14.legacyExitForSameBytes: 0` (`:138`) is a literal, printed as `legacy_exit=0` at `:3202` and `legacyExitForSameBytes` in the witness output.
- `legacyQualificationOk` (`:2013-2021`) tests the falsified mirror sidecar's qualification fields, which the baseline acceptance already implies. `legacyCheckedFindingsAllPass` (`:2022`) is therefore `baselineAccepted` restated.
- The static basis is verified at the field level (see Scope above). The "exit 0 for same bytes" value is not derived from the legacy source, and the witness output presents it in the same form as an observed exit code.

Bounded correction: label the printed value as static (`legacy_exit_static=0`), or remove the printed exit and keep only the field-set comparison.

## Old sidecar acceptance (static reading, not executed)

- `corpus/evidence/round-14/aria-metadata/corrected.json` (`e156b922…7456`) has a `cleanup` block with exactly the six keys in `CLEANUP_MIRROR_FIELDS` (`:101-108`) and a `qualification` block with exactly the eight keys in `QUALIFICATION_MIRROR_FIELDS` (`:109-118`). Values `true`, `true`, `true`, `false`, `1`, `true` for cleanup and `true`, `1`, `true`, `true`, `true`, `true`, `true`, `true` for qualification agree with `expectedMirrorValues` (`:989-1018`) for the one-proof receipt, given the proof values at `:368-379`.
- The `node` block has exactly the keys the checker reads at `:1265-1282`, with values equal to the derived `deriveNode` output.
- The `correction` mirror and `corrections[0]` agree with `:1218-1254`.
- Therefore the new checker should accept the old sidecar on these bytes. This acceptance rests on the receipt, pin, manifest, and worker bytes matching their anchors. It is inference from source, not an observed run.
- "Unchanged" is not witnessed by the gate. No `ANCHORS` entry covers `corrected.json`, and the lesson at `corpus/lessons/round-15.md:12` rejects whole-sidecar authentication. Its unchanged status rests on git history (`f942c62`, `e570380`) only.

## Commands the Main agent should run after integration (not executed here)

- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0 for the old sidecar under the canonical pair).
- Repro for F1 by a substitute-path clean check. Build a copied receipt and pin at non-canonical paths and point a copied sidecar at them. Expect exit 0 today; expect exit 2 after the F1 correction.
- `node scripts/check-aria-metadata.mjs --witness-mirrors` and `--witness` with `--receipt` / `--pin` substituted to non-canonical copies. Expect green today; expect refusal after F3.

## Residual risk and verification gaps

- No verification was executed. All findings are source-reading, with line pointers. F1's forging sequence is [INFERENCE] from reading the checks and must be confirmed by L1.
- The legacy checker's cleanup-mirror absence and qualification field set were verified by grep of the legacy source only, not by running it.
- Docs and lesson bytes are uncommitted and outside the snapshot digests. Doc-claim accuracy was not reviewed against delivered bytes.
- No author-side seat is a non-author verifier. This report is author-side attack reconnaissance only.
