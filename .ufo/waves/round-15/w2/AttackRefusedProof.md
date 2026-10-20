# AttackRefusedProof — round15 C2 `qualification.everyProofRefusedAfterClose`

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin
Author-side source-reading attack. Not a non-author verifier certification.

## Attacked bytes

- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD).
- `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. Matches `build-snapshot.json`. `git status` shows the script clean, so working-tree bytes equal HEAD.
- `scripts/check-user-round-contract.mjs` sha256 `abf174c3…60a3d` (matches snapshot; not attacked).
- `.ufo/waves/round-15/measure.mjs` sha256 `62e98fa8…f02e7` (matches snapshot).
- `.ufo/waves/round-15/metadata-witness.py` sha256 `44cd37c5…45831` (matches snapshot).
- Line numbers below are current-HEAD lines. The w1 reports (`CausalWitness`, `MirrorQualification`, `MirrorServer`, `MirrorContexts`, `HistoricalImmutable`) cite the 7054a5e line layout (e.g. 1263–1280, 853–1110). They are not delivered-byte reviews and were not relied on.
- Nothing was executed: no gate, selftest, witness, node, test, or browser run. No source was edited. No tool was installed.

## Temporal limit

- `corpus/lessons/round-15.md` exists (untracked). It states C2 outcomes at lines 10 and 37 (for example "the same previously accepted false mirror fails after the code-only cutover"). Those outcomes are not evidenced here.
- No committed round-15 witness output exists for `metadata-witness.py` or `--witness-mirrors`. Nothing under `corpus/evidence/round-15/` or `.ufo/waves/round-15/w2/` records a run. Pass/fail for the witness is unobserved, not inferred.

## What holds (source-verified)

For `qualification.everyProofRefusedAfterClose` specifically:

- **Deletion** is rejected. `mirrorFieldProblems` (lines 972–987) compares the sorted key set against `QUALIFICATION_MIRROR_FIELDS` and also type-checks the value. A missing key yields `qualification:field_set` and `qualification.everyProofRefusedAfterClose:type`. Finding `R14-ARIA-SIDECAR-QUALIFICATION-01` fails, so `accepted` is false (lines 1345–1355, 1369–1370). Exit mapping in `runCheck` (1419–1425) gives 1.
- **False** is rejected when the receipt proofs are all refused. The expected value is `true`, and `value !== expected` produces a problem (line 984).
- **String refusal** (`"true"`, `"false"`, `1`) is rejected by `typeof value === 'boolean'` (line 982).
- The expected value comes from `expectedMirrorValues` (989–1018) over `context.receipt.cleanup.server.perWorker` (1129–1131), which is the receipt read at prepare time. It is not read from the sidecar.

## Findings

### F1 — HIGH — Sidecar mode evaluates an unauthenticated receipt; anchors only guard canonical paths

Pointers:
- `resolveCheckInput` (3033–3064): in sidecar mode `receiptPathText = value.original.receipt.path` and `pinPathText = value.original.pin.path` (3052–3062). Both come from the sidecar under check.
- `prepareContext` (1020–1024) reads those paths. `preEvaluation` and `expectedMirrorValues` (1129–1131) then run on the resulting receipt.
- `evaluateAnchors` (826–856): the receipt sha check runs only if the entry resolves to the canonical `DEFAULT_RECEIPT` (828–832). A non-canonical file with non-anchored bytes triggers no problem. The only non-canonical rejection (834) is for bytes that equal the anchor. The `canonicalPin` branch is analogous.
- `verifySnapshot` (871–886) hashes only the canonical receipt, pin, manifest, spec, config, producer, and workers. It does not hash the file the evaluator actually used.
- The binding block (1152–1172) compares the sidecar's own claimed `original.receipt.sha256` to the bytes read from that same path. A self-consistent forged file passes.

Consequence [INFERENCE, not executed]: a sidecar may name a non-canonical receipt copy. The `refused` mirror and all other mirrors are then recomputed from that copy, and `correction.from` and `binding.proofSetSha256` are taken from it. Per-proof values are still constrained by worker files: `loadWorkerContext` (580–690, comparisons at 650–655) requires receipt cleanup and server proofs to equal the anchored worker bytes. So forging the refused/closed fact per proof is blocked. Non-proof receipt fields (verdict, aggregate `cleanup.server.listeningAfter`, `correction.from`, runtime block) are not anchored on that path. The "authenticated" claim in the lesson and in `SKILL.md:1780` does not hold for sidecar mode.

Bounded correction:
- In `evaluateSidecar` (or `evaluateAnchors`), require `original.receipt.path` and `original.pin.path` to resolve to `DEFAULT_RECEIPT` and `DEFAULT_PIN`, and require `context.receiptRead.entry.sha256 === ANCHORS.receiptSha256` and the pin sha equal to `ANCHORS.pinSha256`. Fail as `R14-ARIA-ANCHOR-01` (semantic exit 1). Do not change the committed sidecar bytes.
- Red fixture for L1 to run: copy the canonical receipt to a temp path, change one non-proof aggregate, point a copied sidecar at it. Expect exit 1 with `R14-ARIA-ANCHOR-01` failed and `accepted=false`.

### F2 — MEDIUM — `everyProofRefusedAfterClose` is computed from a weaker predicate than its label

Pointers:
- `expectedMirrorValues` line 996: `refused = complete && proofs.every(p => p?.refusedAfterClose === true)`.
- `complete` (line 395 of `evaluateCleanup`) is shape-only. `proofShapeProblems` (350–366) checks types, not `refusalDetail === 'ECONNREFUSED'` or `closeError === null`.
- `proofValueProblems` (368–379) does require `refusalDetail === 'ECONNREFUSED'` and `closeError === null`, but that feeds only `allProofsPass` (396).
- The same shape-only predicate drives `derivedRefused` (403–406) and the `cleanup.allRefusedAfterClose` mirror (1002). The `closed` mirror (995) has the same gap for `closeError`.

Consequence: a receipt whose every proof has `refusedAfterClose: true` but `refusalDetail: "TimeoutError"` makes the expected mirror `true`. The sidecar mirror then matches. Acceptance is still blocked by `R14-ARIA-CLEANUP-PROOF-01` and `proofs_do_not_all_pass` (1252), so no false acceptance was found. The defect is that the mirror asserts a refusal the same checker rejects. The `[INFERENCE]` label is that the field is not a refusal fact on its own.

Bounded correction: `refused = complete && proofs.every(p => p?.refusedAfterClose === true && p?.refusalDetail === 'ECONNREFUSED')`, mirrored in `derivedRefused` and `cleanup.allRefusedAfterClose`. Apply the same to `closed` with `closeError === null` if the team agrees. The committed `corrected.json` has `ECONNREFUSED` and `closeError: null`, so its bytes should not change. L1 must confirm with a run.

### F3 — MEDIUM — Sidecar duplicate keys make the mirror value parser-dependent

Pointers:
- `decodeJson` (302–317) uses `JSON.parse` with no duplicate-key rejection. `readEntry` (243–300) does not digest the sidecar. `verifySnapshot` does not list the sidecar.
- `qualification.everyProofRefusedAfterClose` is checked by the last occurrence, because JS `JSON.parse` keeps the last duplicate.

Consequence: bytes `{"everyProofRefusedAfterClose": false, … "everyProofRefusedAfterClose": true}` pass the checker. A first-occurrence reader sees `false`. The committed `corpus/evidence/round-14/aria-metadata/corrected.json` has exactly one occurrence (grep count 1) and ends with `}\n`, so it is not affected.

Bounded correction: reject duplicate keys in `decodeJson` for the sidecar path, or require `sidecar bytes === stableStringify(parsed) + "\n"` for the derive-emitted form. Add a red fixture with the duplicate key.

### F4 — MEDIUM — No single-field negative exists for the named mirror (evidence gap)

Pointers:
- In-checker witness (1970–1983) sets `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` to `false` together.
- Generated fixture `sidecar-qualification-mirrors` (2454–2458) sets all three to `false` together. Expected entry `sidecar-qualification-mirror-refusal` (`corpus/evidence/round-15/metadata/expected-fixtures.json` 336–362) cites that file.
- `sidecar-mirror-types` (2463–2467) sets `everyProofClosed = 1` and `cleanup.allClosed = 'true'`. It does not touch `everyProofRefusedAfterClose`.
- `.ufo/waves/round-15/metadata-witness.py` lines 40–44 flip only booleans (`not value`) or add 1 to integers. It has no deletion case and no string case. Lines 50–51 judge pass only on the `SIDECAR` finding.
- Lesson `corpus/lessons/round-15.md:37` says C2 "ships single-field CLI negatives". For `everyProofRefusedAfterClose` alone, no committed fixture exists for deletion, string, or a single `false`. The code path is generic (`mirrorFieldProblems`), so behavior is likely correct, but that is `[INFERENCE]` until L1 runs.

Bounded correction: add three generated fixtures, each a copy of `sidecar-valid` with exactly one change: `qualification.everyProofRefusedAfterClose = false`, set to the string `"true"`, and deleted. Each expects exit 1 with `R14-ARIA-SIDECAR-QUALIFICATION-01` and `R14-ARIA-SIDECAR-ACCEPTED-01` failed. Add matching entries and digests to `expected-fixtures.json`. Digests must be regenerated by the checker's own derive path, not hand-written.

### F5 — LOW — Snapshot scope vs. "authenticated snapshot" wording

`verifySnapshot` (874–886) covers receipt, pin, manifest, spec, config, producer, and workers. It does not cover the sidecar, `expected-fixtures.json`, `mirror-contract.json`, or the checker itself. The `snapshot_tampered` / exit 2 classification therefore applies only to those inputs. A tampered sidecar is a semantic exit 1 by design (`metadata-witness.py` line 51 expects 1). That is consistent with the lesson, but `SKILL.md` wording should say so explicitly. Adjacent unverified: `source.spec.sha256` and `source.manifest.sha256` mirrors are not compared in `evaluateSidecar` (only the producer sha at 1199–1200 is seen). Not reviewed further.

## Verification gaps and commands for L1

No command was run by this author. L1 should run, once, after integration:

1. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect 0).
2. `python3 .ufo/waves/round-15/metadata-witness.py` (inspect `pass`, `mirrors[*].after`, `tamper`).
3. F1 red: sidecar with copied receipt at a non-canonical path (expect fail after fix; currently unobserved).
4. F3 red: duplicate-key sidecar.
5. F4: the three single-field fixtures once added.

## Not claimed

No certification of C2. No claim that the witness passes. No claim that any w1 report describes the delivered bytes.
