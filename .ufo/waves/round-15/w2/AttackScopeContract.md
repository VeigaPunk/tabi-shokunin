# AttackScopeContract — round-15 C2 (ARIA metadata gate), read-only falsification

Author-side seat. Not a non-author verifier; no certification claimed.

## Attacked identity

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Revision: `72dcf031b9da24796b718517ea575f21e4f7caae` (`git rev-parse HEAD`; equals `build-snapshot.json` `revision`).
- Checker `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. Matches the snapshot and `git show HEAD:` blob. `git status` shows no modification to this file.
- Committed inputs read or hashed (static only):
  - `corpus/evidence/round-14/aria-metadata/corrected.json` `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`
  - `corpus/evidence/round-13/aria/receipt.json` `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`
  - `corpus/evidence/round-13/aria/runtime-pin.json` `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`
  - `corpus/evidence/round-15/metadata/mirror-contract.json` `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`
  - `corpus/evidence/round-15/metadata/expected-fixtures.json` `d3bcc239b6f0b83cd771645c8ccf9f513178ed426228a1d8116be7459e3f4397`

No gate, self-test, witness, derive, test, browser, or counter was executed. No source was edited. No tool was installed or updated. Line numbers are from `scripts/check-aria-metadata.mjs` at the digest above.

## Temporal limit (reported, not invented)

- No round-15 C2 execution receipt exists in the delivered bytes. `corpus/evidence/round-15/` holds only `source-index.json`, `misroot-recovery.json`, and the `metadata/` contract and fixtures.
- `corpus/lessons/round-15.md` is untracked. Its line 36-38 refers to "actual receipts below", but the grep shows no C2 receipt section. Only line 30 records a pre-run observation.
- `build-snapshot.json` says `verification: not yet exercised`.
- Every C2 pass or fail claim below is therefore a static derivation from source. Items marked `[static]` are not executed.

## Findings (by severity)

### F1 — High — Snapshot authentication binds constant canonical paths, not the evaluated inputs

- `runCheck` calls `verifySnapshot()` at :1386. That function takes no arguments and hashes only the constants `DEFAULT_RECEIPT`/`DEFAULT_PIN` (:875-876, :881-885).
- It then evaluates whatever `--receipt`/`--pin` supplied: `prepareContext(receiptPathText, pinPathText)` at :1397. `--receipt` and `--pin` are parsed at :3119-3122 and fed through main at :3228-3263.
- `evaluateAnchors` (:826-869) pins the receipt and pin digests only when the path is canonical (:828-829, :846-852). A non-canonical pair with arbitrary bytes produces no `R14-ARIA-ANCHOR-01` failure.
- The self-test intends this. `expected-fixtures.json:7-18` expects exit 0 for `--receipt @receipt-green --pin @pin`, a non-canonical temp receipt.
- Static counterexample `[static]`: copy the committed receipt to a temp path. Correct only the aggregate `cleanup.server.listeningAfter` to `false`, which matches the per-worker `false` values the gate derives. Run check with `--receipt <tmp>` and a pin copy. `verifySnapshot` passes on the untouched canonical files. The evaluation is clean, and the output (:3277-3282) prints the sidecar and input but not the receipt path. The C2 claim "changed authenticated snapshot → exit 2" then holds only for in-place edits of canonical files.
- `evaluateSidecar` binds the sidecar to the evaluated receipt (:1152-1173). A sidecar derived from the copy would therefore bind self-consistently.
- Bounded correction: in `runCheck` and `runWitnessMirrors`, refuse non-canonical receipt or pin paths with exit 2 and an explicit reason. Alternatively, run the ANCHORS comparison on the evaluated bytes. Move the semantic-only fixtures to an explicit fixture entry point, and re-express the `@receipt-green` exit-0 expectations as a clean cutover. Print the evaluated receipt path and sha256 in the verdict line.

### F2 — High — Whole-sidecar overclaim; emitted known keys are outside the stated exclusion

Documented exclusion: only free-text notes and unknown extension keys are advisory. This appears in the checker header (:15-16), `mirror-contract.json` description, and the SKILL registry (`SKILL.md` ~:1808-1809). Keys that are neither notes nor unknown extensions are not checked:

- `wave` and `claim`. Emitted at `buildSidecar` :1473-1474. No reader exists; the grep finds only the emitter.
- `kind`. Emitted at :1472. It appears only in the detail payload at :1144, never as a comparison.
- `execution.source` (:1483). Only `execution.browser`, `execution.browserExecuted`, and `execution.newBrowserRun` are read (:1294-1298).
- `source.receipt.bytes`, `source.pin.bytes`, and all `source.*.path` / `source.producer.role` (emitted :1495-1510). The checks at :1152-1163 and :1199-1207 cover sha256 only.
- `original.receipt.path` and `original.pin.path`. Only non-empty is checked (:1174-1179).
- Optional-skip guards that accept deletion: `original.*.bytes` (:1180-1185), `corrections[0].value` (:1232), `execution.browserExecuted` and `newBrowserRun` (:1295-1298).
- `correction.rule` and `corrections[0].rule`. Only equality and non-empty are checked (:1241, :1251).

Static counterexample `[static]`: set `wave` to `"x"` in a copy of `corrected.json`. Expected exit 0, since no finding reads that field.

The committed values for these keys in `corrected.json` (`claim` line 15, `kind` line 51, `execution.source` line 49, `wave` line 121, and the source paths and bytes at lines 95-119) are consistent with strict checks. A correction therefore preserves the committed acceptance, by reading.

Bounded correction, either: (a) add an `R14-ARIA-SIDECAR-IDENTITY-01` finding. It would require exact `schema` and `kind`, `wave` and `claim` equal to the receipt, `execution.source === 'historical-static-bytes'`, and the source and original byte counts and paths equal to the canonical constants. It would also require presence for every emitted key. Or (b) narrow the stated boundary to name these keys explicitly. Option (a) is the stronger one.

### F3 — Medium — The sidecar's own bytes are not authenticated by the checker

- `ANCHORS` (:147-158) and `verifySnapshot` (:874-886) omit `corrected.json`.
- The header claim at :19 ("digest-bound statement") binds only the receipt, pin, and worker digests (:1511-1517). It does not bind the sidecar itself.
- The sidecar digest `e156b922…` is held in `verification.json` and in the `measure.mjs` C2 check (`.ufo/waves/round-15/measure.mjs:1049-1073`), not in the gate.
- Consequence `[static]`: an edit in an unchecked field (F2) is accepted by the gate alone. An edit in a checked field gives exit 1 (semantic), not exit 2. The lesson (round-15.md:47) says sidecar false claims stay exit 1, so this may be intended, but the header wording then overclaims.
- Decision for L1: either anchor the canonical sidecar digest in `ANCHORS`, so drift at the canonical path is `snapshot_tampered`, or document the gate as semantic-only for the sidecar and rely on `measure.mjs` for the digest. This does not require rewriting the historical file.

### F4 — Medium — Worker-directory membership is outside the snapshot classification

- `ANCHORS.workers` (:154-157) anchors exactly one filename. `verifySnapshot` (:881-885) hashes only that file.
- The directory listing is compared in `loadWorkerContext` (:658-670) and reported as `R14-ARIA-WORKER-SET-01`. That is a semantic failure: `evaluateAll` (:1079) then `runCheck` (:1419-1425) give exit 1, not 2.
- Static consequence: adding an extra `worker-*.json` under `actual/workers/` yields exit 1 "semantic invalid". The round-15 contract says "changed authenticated snapshot bytes → exit 2".
- Bounded correction: hash the sorted directory listing in `verifySnapshot` and classify drift as `snapshot_tampered`. Otherwise narrow the contract to say directory drift is semantic.

### F5 — Low — `qualification.qualified` mirror is a literal, not recomputed

- `expectedMirrorValues` sets `qualified: true` as a constant (:1007-1008). The other qualification mirrors are recomputed (:1011-1015).
- `mirror-contract.json` description (line 12) says all values are "independently recomputed from the raw per-worker proofs".
- Not a false accept: the top-level `qualified` must be true (:1334), and all proofs must pass (:1252-1253).
- Bounded correction: derive `qualified` as `complete && proofs.length >= 1 && allProofsPass`, or reword the contract to exclude `qualified`.

## Prior-lane anchors re-checked against 72dcf03

- Closed by reading at this revision: the emitted cleanup and qualification mirrors are now compared by exact field set and type (:972-987, :1315-1355). The per-field `everyProofListensBefore` and `everyProofNotListeningAfter` are independently derived (:993-997, :1012-1015). The source spec and manifest sha256 are checked (:1202-1207). `snapshot_tampered` is emitted for canonical anchored-file drift (:927-944, :1386-1396). The `--witness-mirrors` parser path exists (:3104).
- Still open: sidecar digest anchor (F3), and the sidecar-declared `wave`, `claim`, `kind`, and `execution.source` fields (F2).
- The round-14 Node-minimum erratum was not re-litigated here, as instructed.

## Commands L1 should run after integration (not run by this seat)

- `node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0 on committed bytes).
- `node scripts/check-aria-metadata.mjs --receipt <temp copy> --pin <pin>` on a corrected-aggregate copy. This is the F1 reproduction: confirm whether it exits 0 and reports no receipt path.
- A temp copy of `corrected.json` with `wave` changed, run with `--sidecar`. This is the F2 reproduction.
- A temp `actual/workers/` extra file under an isolated root, run check. This is the F4 reproduction, and must not touch committed evidence.
- Digest check: `sha256sum` on the files listed above, against the values in this report.

## Residual risk and verification gaps

- All findings are static. Nothing was executed. F1 and F2 are the highest-confidence reproductions but must be confirmed by L1 in isolated temp roots.
- No round-15 C2 receipt exists in the delivered bytes, so the claims in `round-15.md` cannot be checked against them.
- This report is an author-side read. It is not non-author certification.
