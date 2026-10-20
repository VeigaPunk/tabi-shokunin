# TabiR15.AttackConformance — round-15 C1/C2 source attack (author-side, read-only)

Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin
Attacked revision: 72dcf031b9da24796b718517ea575f21e4f7caae (HEAD; baseline 7054a5e1068538349b4dbb0d291c2fe8643802f2)
Snapshot: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json (verification field: "not yet exercised")

Source digests attacked (sha256, recomputed at read time; all match the snapshot):
- scripts/check-user-round-contract.mjs `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (1302 lines)
- scripts/check-aria-metadata.mjs `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (3313 lines)
- .ufo/waves/round-15/measure.mjs `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7`
- .ufo/waves/round-15/metadata-witness.py `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831`

Method and limits: source reading only. No gate, self-test, witness, counter, browser, build, or python witness was executed. `git status` shows the two checkers, measure.mjs and metadata-witness.py unmodified relative to HEAD, so the attacked bytes are the committed bytes. No installs or upgrades were performed. Findings are author-side; they are not non-author certification.

## Verdict summary

- C1 (USER counter refusal diagnostics): the reason vocabulary, refusal plumbing and CLI-isolated expected-reason comparator hold in source. One truthfulness defect in SELFTEST output lines (F6).
- C2 (ARIA metadata mirror gate and snapshot classification): the mirror field tables match the emitted fields and the falsification path is real. The authenticity claim does not hold for non-canonical inputs or for the sidecar itself (F1, F2). The snapshot-to-evaluation binding is not single-read (F3). Mirror values are self-referential (F4).

## Findings (ranked)

### F1 — High (C2 authenticity): non-canonical receipt/pin pair bypasses anchors; verified bytes are not the evaluated bytes
Pointers:
- scripts/check-aria-metadata.mjs:826-852 `evaluateAnchors`. Lines 828-829 define `canonicalReceipt` and `canonicalPin` by path. Lines 846-852 emit the canonical-pair problems only inside `if (canonicalReceipt || canonicalPin)`. When both paths are non-canonical, the block is skipped and R14-ARIA-ANCHOR-01 passes whenever the worker and source checks pass. Line 837 only refuses anchored pin bytes at a non-canonical path; it does not refuse unanchored bytes.
- scripts/check-aria-metadata.mjs:1385-1397 `runCheck`. `verifySnapshot()` (line 1386) hashes the constants DEFAULT_RECEIPT/DEFAULT_PIN, but `prepareContext(receiptPathText, pinPathText)` (line 1397) evaluates the caller-supplied paths. The same pattern appears in runDerive (1618 vs 1632) and runWitnessMirrors (1916 vs 1928).
- scripts/check-aria-metadata.mjs:3107-3137 `resolveCheckInput` takes `receiptPathText` from the sidecar's own `original.receipt.path` and `original.pin.path`. parseArguments (3119-3124) accepts any `--receipt`/`--pin` value. The check-mode route is 3306-3337.
- scripts/check-aria-metadata.mjs:689-750 `evaluateSourceIdentity` and 793-825 `evaluatePin` validate only fields the receipt and pin declare about themselves. A forger who copies the anchor-literal fields satisfies them.

Consequence (source-derived, [INFERENCE] until someone runs it): `--receipt <forged> --pin <re-serialized pin>` (same JSON values, different bytes, so the pin sha is not anchored) makes every ANCHOR and SOURCE check pass. A forged receipt that sets `cleanup.server.listeningAfter` to false while the canonical worker proofs remain raw-false would then return exit 0 `clean`. This contradicts the header contract (lines 23-26), which says that surface refusals are exit 2. The canonical default run is not affected; the defect is the explicit-path surface.

Bounded correction: in production mode (not fixture mode), refuse any receipt or pin path other than the canonical pair with exit 2 and a surface reason. Alternatively, anchor the evaluated receipt and pin bytes by content regardless of path. Make verifySnapshot return the buffers it hashed, and have prepareContext consume those buffers so the verified bytes and the evaluated bytes are the same. Keep the path-based fixture mode only behind a self-test-only entry.

### F2 — High/Medium (C2 snapshot scope): the sidecar and the contract assets are not authenticated; sidecar acceptance is not tamper-classified
Pointers:
- scripts/check-aria-metadata.mjs:147-158 ANCHORS covers receipt, pin, producer, spec, config, manifest, and one worker. It has no sidecar digest.
- scripts/check-aria-metadata.mjs:871-886 verifySnapshot checks list has no entry for DEFAULT_SIDECAR (corrected.json), corpus/evidence/round-15/metadata/mirror-contract.json, or expected-fixtures.json.
- scripts/check-aria-metadata.mjs:2175-2191 mirrorInputList copies corrected.json (line 2188), but mirrorTargetFor (2193-2206) has no sidecar case, and the expected-fixtures mirrorCases contain tamper cases only for receipt, receipt-clean, pin, manifest, spec, config, worker, and producer.
- scripts/check-aria-metadata.mjs:1141-1214 sidecar binding checks only receipt, pin, and proof digests against the evaluated inputs. Nothing ties the sidecar's own bytes to a known digest.
- scripts/check-aria-metadata.mjs:1416-1437 `runCheck` with a sidecar returns `ok` from the post-correction evaluation. The red pre-correction findings are not in the returned findings array, so `--check <any self-consistent sidecar>` prints `verdict=clean` and exits 0 even though the canonical receipt is red.
- corpus/evidence/round-15/metadata/expected-fixtures.json case `sidecar-advisory-text-accepted` expects exit 0 when only free text changes. mirror-contract.json says free text is outside the contract. Together these mean an altered corrected.json that keeps the checked fields is accepted without any snapshot classification.
- mirror-contract.json `tamper` block declares exit 2 for snapshot digest mismatches. Code checks only findingId and status (scripts/check-aria-metadata.mjs:2331-2332). No code path classifies mirror-contract.json or expected-fixtures.json drift as snapshot_tampered.

Bounded correction: add the sha256 of corrected.json to ANCHORS and to verifySnapshot, and add a sidecar tamper case to mirrorTargetFor and mirrorCases. Either refuse an unanchored `--check <sidecar>` with exit 2 (could_not_evaluate, reason unanchored/snapshot_unavailable) or label its output as an unanchored correction rather than `clean`. Either add mirror-contract.json and expected-fixtures.json to verifySnapshot or remove the claim in their tamper blocks.

### F3 — Medium (C2 TOCTOU): verified bytes are read twice
Pointers:
- verifySnapshot reads and hashes at scripts/check-aria-metadata.mjs:891. prepareContext then calls readJson again at 1021-1022 and 1025.
- loadWorkerContext re-reads worker files at 619.
- evaluateSourceIdentity re-reads spec and config at 735-736.
The comment at 872 says "Authenticated input bytes are hashed before any semantic evaluator runs". The hashed buffers are discarded, so the evaluators act on separate reads. A write between the two reads is classified as a semantic result, not as snapshot_tampered.

Bounded correction: read each input once. verifySnapshot returns the entry objects with bytes, and prepareContext, loadWorkerContext and evaluateSourceIdentity consume those entries. Alternatively, re-run verifySnapshot after evaluation and classify any difference as snapshot_tampered.

### F4 — Medium (C2 oracle): expected mirror values are self-referential
Pointers:
- scripts/check-aria-metadata.mjs:989-1018 `expectedMirrorValues` is the only source of expected cleanup and qualification values. It is called from buildSidecar (1315 path via evaluateSidecar, and 1469).
- witness-mirrors (1915-2061) builds its baseline with buildSidecar (1968) and evaluates it with the same function. A wrong derivation in expectedMirrorValues therefore yields a consistent baseline and a consistent refusal of the falsified copy. The witness cannot detect it.
- mirror-contract.json pins field names and types only (cleanup 6 fields, qualification 8 fields), not values. Its description says values are "independently recomputed", which is true only of the code. expected-fixtures.json asserts exit classes for mirror-authentic cases, not mirror values.

Bounded correction: pin the literal expected mirror values for the authentic round-13 proofs in expected-fixtures.json and compare them in witness-mirrors. For the authentic receipt they are: cleanup perWorkerCount 1, allClosed true, allRefusedAfterClose true, allNotListeningAfter true, derivedListeningAfter false, summaryServerOk true; qualification proofCount 1, qualified true, and all six boolean qualification mirrors true. These match the committed corrected.json cleanup and qualification blocks, as read from that file (not executed).

### F5 — Low (C2 coverage): witness falsifies 3 of 8 qualification mirrors
Pointers: scripts/check-aria-metadata.mjs:1969-1983. The cleanup block falsifies all six fields, but the qualification block falsifies only everyProofListensBefore, everyProofClosed, and everyProofRefusedAfterClose. qualified, proofCount, allProofsComplete, allProofsSupportCorrection, and everyProofNotListeningAfter have only the generic path. metadata-witness.py (lines listing `mirrors`) covers 9 of 14 fields. Correction: add single-field falsification cases for the five untested qualification fields to expected-fixtures.json mirrorCases or to witness-mirrors.

### F6 — Medium (C1 truthfulness): SELFTEST lines print literal or derived exit codes
Pointers:
- scripts/check-user-round-contract.mjs:1243 (`reason_negative_control`) prints `expected_exit=0 actual_exit=0` as literals. Line 1244 then throws when result=FAIL, so the line reports actual_exit=0 for a failed control.
- :1252 (`count_committed_*`) prints `expected_exit=0 actual_exit=0` as literals for an in-process runCount, which has no exit status. It can print actual_exit=0 with result=FAIL.
- :1265 and :1273 derive `actual_exit` from the boolean match (`witnessMatch ? 0 : 1`, `diagnosticMatch ? 0 : 1`), not from an observed child exit.
Correction: print observed values only. For in-process lines, emit `exit=none` or omit the exit field. For the negative control, print the literal comparison outcome (correct_match, decoy_match) without an exit field. Keep `actual_exit=${observed.exit}` for CLI lines, which is already truthful at :1222 and :1282.

### F7 — Low (C1 residual, not reachable today): receiptOf trusts the last USER_ROUND_CONTRACT stderr line
Pointers: scripts/check-user-round-contract.mjs:759-776 (receiptOf takes the last stderr line that starts with the prefix). The catch at :1300 interpolates `error.message` without newline escaping. Current detail sources are fixed strings or single-line values (`command` is single-line by the `(.+)$` regex at :405; ls-tree quotes control characters in paths), so I found no reachable forgery. Correction for hardening: escape or reject newlines in `detail` before printing at :1300.

## Checked and held (negative results)

- C1 reason vocabulary: COUNT_REASONS (:92-99) has six ids and all six are thrown by the counting path (:413, :414, :416, :418-420, :430, :618, :619). Unregistered reasons convert to could_not_evaluate exit 2 (:101-106).
- C1 counting parser: TREE_COUNT and GREP_COUNT (:364-365) are closed grammars, `countPattern` (:370-378) is an allowlist, and runCount (:418-441) uses spawnSync argv with no shell. The `masked` status is limited to grep status 1 (:429).
- C1 isolated CLI assertions: selfTest cases (:1059-1186) run as separate CLI subprocesses with a fresh /var/tmp root. receiptMatches (:781-786) compares exit, finding, reason and detail independently.
- C1 malicious-command controls: tee, sh -c and git option injection are refused as unsupported_counting_command before any process starts (cases :1061-1072, grammar at :364-365).
- C2 emitted-mirror coverage: buildSidecar emits exactly the fields in CLEANUP_MIRROR_FIELDS (6, :101-108) and QUALIFICATION_MIRROR_FIELDS (8, :109-118), checked against buildSidecar at :1560-1577, and mirrorFieldProblems (:972-987) rejects extra or missing keys and type mismatches.
- C2 snapshot classification for the anchored inputs: snapshotOutcome (:927-970) yields exit 2 with reason snapshot_tampered; the anchored set covers receipt, pin, manifest, spec, config, producer, and the worker. The default canonical run is protected up to F3.
- Payload keys used by metadata-witness.py (acceptedCorrection, findings[].id/status, snapshot.mismatches[].path) exist in checkPayload (:2921-2960).

## Temporal limits

- No round-15 C1 or C2 witness receipts exist under corpus/evidence/round-15 (present: source-index.json, misroot-recovery.json, metadata/expected-fixtures.json, metadata/mirror-contract.json). Witness outputs are therefore unobserved; nothing here is an execution result.
- corpus/lessons/round-15.md is untracked and was not read by me; it is outside this attack's surface.
- w2 registry: swarm-registry.json now binds 32 non-null agentIds, while validation.json records agentId null. This is consistent with validation predating dispatch, not a defect. I did not audit the dispatch chain further.

## Commands for L1 to run after integration (not run by me)

- `node scripts/check-aria-metadata.mjs --self-test` (after F1-F4 corrections; expect fixture-count changes).
- `node scripts/check-user-round-contract.mjs --self-test` (after F6; expect SELFTEST line changes only).
- Confirm on the non-author side that a non-canonical `--receipt/--pin` pair is refused after F1 (exit 2).
- Confirm that a changed corrected.json free-text byte is refused after F2 (snapshot_tampered, exit 2).
