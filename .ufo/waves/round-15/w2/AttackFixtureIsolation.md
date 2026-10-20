# AttackFixtureIsolation: round-15 C2 (ARIA metadata gate) source falsification

Author-side, read-only source attack. Not a non-author verification. No gate, self-test, witness, browser, or counter was executed by this attacker. The only program run was a one-off `node -e` JSON.parse of the committed round-14 sidecar bytes to list its keys; no checker code was invoked.

## Scope and identity attacked

- Delivered revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD; baseline `7054a5e`), matching `.ufo/waves/round-15/build-snapshot.json`.
- Digests of HEAD bytes (match snapshot):
  - `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (3313 lines)
  - `scripts/check-user-round-contract.mjs` sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (C1, not attacked here)
  - `corpus/evidence/round-15/metadata/expected-fixtures.json` sha256 `d3bcc239b6f0b83cd771645c8ccf9f513178ed426228a1d8116be7459e3f4397`, `helpers: 3`
- Temporal drift, not attacked as delivered bytes: the working tree has uncommitted edits to `scripts/check-aria-metadata.mjs` (sha256 `5fae094087dc912b55ea639baa7288fff4bb66ba1a146897c1e6dc57e0c4da87`, 3363 lines, mtime 05:35:06, after commit 05:29:43) and to `expected-fixtures.json` (`helpers: 4`). The diff adds an `aggregateControls` block (~line 2786+) and changes `expectedMirrorValues` line 1004 to `derivedListeningAfter: complete ? cleanupDerived.listeningAfter : null`. Snapshot digest `5738…` no longer describes the working file. L1 must say which bytes it integrates. Findings below apply to HEAD; line numbers before line 2786 are identical in both.
- Temporal limit: no round-15 self-test or witness execution receipt exists (`corpus/evidence/round-15/` holds only `metadata/`, `misroot-recovery.json`, `source-index.json`; no `executions/` or `verification`). `corpus/lessons/round-15.md` is present but untracked. `.ufo/waves/round-15/w2/spec.json` records `verification: not yet exercised`. Nothing here is reported as a passing gate result.

## Verified preservation facts (source and byte reading)

1. Round-14 input bytes are unchanged in git. `git diff e570380 72dcf03 -- corpus/evidence/round-13 corpus/evidence/round-14 corpus/lessons` reports insertions only (0 deletions). `corrected.json` is not touched by `72dcf03`.
2. Anchored historical digests still match on disk: receipt `b458b351…`, pin `4d894756…`, manifest `56764241…`, spec `03cb4e17…`, config `87ae779b…`, producer `1d54c9e9…`, worker `0d0f00e2…`. These equal `ANCHORS` at lines 147-158.
3. Every round-14 fixture digest pinned in `round-14/aria-metadata/expected-fixtures.json` is carried unchanged into round-15 `fixtures`: malformed-receipt `a676bfc9…`, pin `f4a13da6…`, receipt-empty `1cf3b257…`, receipt-green `9bf68cb7…`, receipt-min `e625e27a…`, receipt-missing-summary `a73a4aa1…`, receipt-nonboolean `3a58c0ec…`, receipt-old `d1a4ce85…`.
4. All 15 round-14 case ids are present in round-15 with the same args and exit codes. Round-15 only adds `expectedClassification` and `expectedFailedFindings` assertions.
5. Case count: `cases` = 25 and `mirrorCases` = 10, total 35. This matches `caseCounts.cliCases = 35` and `minimumCliCases = 35`. The three helpers in code (`mirror-contract-fields`, `fixture-digest-set`, `derive-and-mirror-helper`, lines 2343, 2539, 2778) match `helpers: 3`.
6. The pinned `mirror-tamper-producer` mismatch digest `5c4cb198…` equals sha256(producer bytes + `\n// round15 selftest tamper\n`), computed with `cat`/`sha256sum`. Suffix at line 2213.
7. The round-14 sidecar `corrected.json` (sha256 `e156b922…`) carries exactly the six `cleanup` keys and eight `qualification` keys that `CLEANUP_MIRROR_FIELDS` (101-108) and `QUALIFICATION_MIRROR_FIELDS` (109-118) declare. The strengthened mirror check therefore does not refuse the round-14 input on field set.
8. `buildSidecar` (1560-1577) emits exactly the declared field sets, so the emitter and the enforcement table agree.
9. Isolation of the self-test: every write in `runSelfTest` goes to `mkdtempSync(join(tmpdir(), 'tabi-r15-aria-metadata-'))` (2353), mirror roots under that dir (2231), and is removed in `finally` (2739, 2867). `runWitnessMirrors` writes only to its own tmpdir (1984, removed 1997). Live repo writes occur only in `runDerive` (1669-1681, 1757) and are gated by `resolveOutPath`. `--derive` is not called from the self-test.

## Findings (ordered by severity)

### F1 HIGH: Snapshot authentication covers only default paths. Overridden inputs are evaluated with no digest or anchor check, and can return exit 0.

- `verifySnapshot()` (871-925) hashes the fixed `DEFAULT_RECEIPT`, `DEFAULT_PIN`, manifest, spec, config, producer, and worker. It never sees `--receipt` or `--pin`.
- `parseArguments` lets `--receipt` and `--pin` override those paths (3119-3122). `main` passes them through to `runCheck` (3259-3263) after the snapshot check has already run against the defaults.
- `evaluateAnchors` (826-869) enforces the receipt and pin sha only when the path is canonical (`canonicalReceipt`, `canonicalPin`, 828-833). When both overrides are non-canonical and the bytes are not byte-identical to the anchors, no anchor problem is pushed. The only canonical-pair check (846-851) fires when exactly one side is canonical.
- In check mode without a sidecar, `runCheck` returns `ok: preEvaluation.ok` and exit 0 (1398-1414).
- Consequence, by source reading: `node scripts/check-aria-metadata.mjs --receipt <copy> --pin <copy>`, where both copies are non-canonical and semantically valid, returns `verdict=clean` with exit 0. Edits to receipt-level fields that are not cross-checked against worker files (for example, a corrected `cleanup.server.listeningAfter` summary) are accepted without any authentication. Cleanup proofs remain anchored indirectly, because `workerContext.proofFinding` compares receipt proofs with the anchored worker file (649-653). Two surfaces remain unanchored on this route: the pin file (`pin.node.minimumMajor` drives the Node floor through `deriveNode`, 530 and 536, and the pin projection through 816), and any receipt field not compared with workers.
- The self-test asserts this route. `expected-fixtures.json` cases `clean-perworker-listening`, `node-observed-recorded`, `sidecar-valid-accepted`, `witness-red-to-clean`, and `witness-mirrors-differential` all pass `--receipt @…` and `--pin @pin`, and `pathFor` (2550-2558) maps those tokens to mkdtemp files. Those exit-0 expectations therefore assert that unanchored bytes are clean. The mirror tamper cases (`mirror-tamper-*`) prove only canonical-path tampering.
- Bounded correction (author's choice): in check, witness, and witness-mirrors, when either evaluated path is not `DEFAULT_*`, return could-not-evaluate with a named reason (for example `unanchored_input`), or require the evaluated sha to equal the anchor regardless of path. Then re-express the five exit-0 CLI expectations as mirror-root cases (canonical paths), or add an explicit unanchored-fixture expectation that is labelled as such. This changes expectations only, not round-14 input bytes.

### F2 HIGH: Sidecar acceptance takes the receipt and pin to evaluate from the sidecar itself, and binds them only to self-declared digests.

- `resolveCheckInput` (3033-3064) returns `original.receipt.path` and `original.pin.path` from the sidecar as the paths to evaluate (3052-3053, 3060-3061). `--check <sidecar>` therefore chooses the inputs with the attacker-writable file.
- `evaluateSidecar` checks that the sidecar's declared receipt and pin sha equal the file read at that path (1152-1173, 1168-1172). It requires only that the path is a non-empty string (1174-1179). It does not require the path to equal `DEFAULT_RECEIPT` or `DEFAULT_PIN`. The anchor checks at 1196-1207 cover only producer, spec, and manifest.
- Combined with F1, a self-consistent sidecar plus receipt and pin copies outside the repo should produce `accepted=true` and exit 0, by source reading. The header claim "Accept the sidecar only after digest/source/proof/Node/mirror checks" (lines 31-33) is therefore not a digest authentication on that route.
- Bounded correction: in `evaluateSidecar`, require `original.receipt.path === DEFAULT_RECEIPT`, `original.pin.path === DEFAULT_PIN`, and that the sidecar's receipt and pin sha equal `ANCHORS.receiptSha256` and `ANCHORS.pinSha256`. Otherwise return could-not-evaluate. Add a binding check for `source.receipt.sha256` and `source.pin.sha256` against the anchors.

### F3 MEDIUM: `authenticatedAnchors` is computed and reported but does not gate `ok` in `runWitness` or `runWitnessMirrors`.

- `runWitnessMirrors`: `authenticatedAnchors` is computed at 2032-2033. `ok` at 2034-2036 is `baselineAccepted && mirrorRejected && legacyCheckedFindingsAllPass && originalUnchanged`. It is reported at 2069 and in the payload at 2955 and 3001.
- `runWitness`: `authenticatedAnchors` at 1838-1839. `ok` at 1846-1848 is `!tamperPhase && red.exit === EXIT.semantic && redFinding && greenOk && originalUnchanged`. Reported at 1902.
- Consequence: the self-test `witness-red-to-clean` and `witness-mirrors-differential` can and do report green on non-anchored bytes while the payload says `authenticatedAnchors: false`. The C2 claim "authenticated" is not enforced by those verdicts.
- Bounded correction: add `authenticatedAnchors` to `ok` for both functions, or remove the field if it is not meant to gate.

### F4 MEDIUM: Tampering with anchored bytes at a non-canonical path is not classified as could-not-evaluate.

- `snapshotOutcome` produces exit 2 only from `verifySnapshot`, which hashes default paths (927-970).
- For a copy at a non-canonical path, the anchor check produces `anchored_receipt_bytes_at_noncanonical_path` only if the bytes are byte-identical to the anchor (834-839). A modified copy produces no snapshot finding. Depending on the other input, it becomes exit 1 (`canonical_pair:*`, 846-851) or exit 0 (F1). It never reaches exit 2.
- This contradicts the stated contract that authenticated snapshot tampering is could-not-evaluate. It is a classification gap, not a bypass of the canonical path.
- Bounded correction: follows from F1. Any anchored-sha mismatch on any evaluated input should be exit 2 with `snapshot_tampered`, regardless of path.

### F5 LOW: Digest verdict and evaluated bytes are read separately (TOCTOU).

- `verifySnapshot` reads each anchored file once (891, `readEntry`). `prepareContext` then re-reads the receipt, pin, and manifest (1021-1022, 1025), and `loadWorkerContext` re-reads workers (619). The evaluated bytes are not the bytes that were hashed.
- Consequence: a file replaced between the two reads passes the digest step and is evaluated under another digest. Low severity for a local tool, but it is the exact property the snapshot check claims.
- Bounded correction: thread `snapshot.entries[*].bytes` into `prepareContext` and `loadWorkerContext`, or compare the re-read sha with the snapshot sha and fail closed.

### F6 LOW: `qualification.qualified` is a constant, not an independent recomputation.

- `expectedMirrorValues` sets `qualified: true` (line 1008) regardless of proofs. `buildSidecar` hard-codes `qualified: true` and `status: 'qualified'` (1475-1476) and mirrors `qualified: true` at 1569.
- The mirror comparison (`mirrorFieldProblems`, 972-987) therefore cannot detect a sidecar whose `qualification.qualified` is wrong. The only gate is the top-level `sidecar.qualified !== true` check (1334). The header says mirror values are "independently recomputed from the raw per-worker proofs" (mirror-contract `description`).
- Bounded correction: derive `qualified` from `complete && allProofsPass && proofs.length >= 1`, and compute it in `buildSidecar` from the same predicate.

### F7 LOW: Fixture coverage does not falsify every emitted qualification mirror.

- Cleanup: all six fields are falsified in `sidecar-cleanup-mirrors` (2438-2446). Good.
- Qualification: falsified fixtures cover only `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` (2454-2456). `mirror-types` covers `everyProofClosed` as a number and `proofCount` as a string (2465-2466), a type check, not a value check. `witness-mirrors` (1981-1983) also covers the same three.
- No direct falsification exists for `allProofsComplete`, `allProofsSupportCorrection`, `everyProofNotListeningAfter`, or the `proofCount` value. Enforcement for those depends only on the generic loop.
- Bounded correction: add a self-test loop that flips each `QUALIFICATION_MIRROR_FIELDS` key in turn and expects `R14-ARIA-SIDECAR-QUALIFICATION-01` to fail.

### F8 LOW: `mirror-contract.json` is checked against code tables only inside `--self-test`.

- `contract.cleanup.fields` and `contract.qualification.fields` are compared with the code tables at 2323-2330, inside `runSelfTest`. Normal `check` mode never reads the asset. A drift between code and asset is therefore caught only if someone runs the self-test.
- Bounded correction: either document this as the intended boundary, or load the contract in `prepareContext` and refuse on mismatch.

### F9 LOW: The round-14 corrected sidecar is not digest-anchored.

- `ANCHORS` (147-158) has no sidecar entry. Editing `corrected.json` in a way that keeps it schema-valid yields exit 1 (semantic), not exit 2. The mirror-contract description says "Snapshot digest mismatches are could-not-evaluate", and this is an exception. The header (lines 36-43) does describe the sidecar as derived, so this may be intended.
- Bounded correction: either add `corrected.json` to `ANCHORS` (round-14 input, not regenerated), or state the exception in the mirror-contract description.

### F10 INFO: Derive writes a temp file into the destination directory before validation.

- `runDerive` writes `${out.abs}.derive-${pid}` with `wx` (1669-1671) before validating, then removes it best-effort (1680-1681). Not on the self-test path. A crash between write and remove leaves a stray file in `corpus/evidence/round-14/aria-metadata/`. The `wx` flag prevents overwrite.
- Bounded correction: write the temp file in `tmpdir()`, or document the residue behavior.

## Verification gaps for L1 (commands to run, not executed here)

- `node scripts/check-aria-metadata.mjs --self-test` at HEAD. This is the only source of truth for the fixture sha256 values in `fixtures`, which were not re-derived here. Those values depend on `stableStringify` output of generated sidecars and cannot be confirmed by reading.
- Before running, decide how F1 and F2 change the self-test expectations. Running as-is will likely show the five exit-0 CLI expectations passing on unanchored bytes.
- Compare the working-tree diff (`5fae0940…`) with HEAD before integrating. Its `helpers: 4` expectation requires the new `aggregateControls` helper to actually be pushed, or the count check fails.
- `node scripts/check-aria-metadata.mjs --witness-mirrors` and `--witness` after the F1 and F2 corrections, to confirm the red-to-green and mirror differential remain green on the canonical paths only.

## Not in scope

- C1 (USER counter diagnostics, `check-user-round-contract.mjs`) was not attacked in this report.
- No author-side seat is a non-author verifier. These are author-side source findings for L1 to adjudicate.
- No tools were installed or updated. No pacman transaction was used.
