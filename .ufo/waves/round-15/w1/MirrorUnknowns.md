# MirrorUnknowns — round 15 w1 (read-only audit)

Scope: unknown extra sidecar fields and optional mirrors; explicit checked-contract boundary of the
ARIA metadata correction sidecar (`scripts/check-aria-metadata.mjs`, sidecar
`corpus/evidence/round-14/aria-metadata/corrected.json`). Author-side report; not non-author certification.

Mode: read-only. No gate, counter, test, suite, self-test, witness, or browser was executed. No source edits.
Read-only shell facts only: `sha256sum` on the checker and sidecar, `git rev-parse --short HEAD`, `git status --short`.
Tools installed or updated: none.

## Axes

1. Coverage of emitted sidecar fields by `evaluateSidecar` (what the emitter writes vs. what the checker reads).
2. Strictness of unknown keys and absent optional mirrors (present-and-wrong vs absent vs extra).
3. Strictness of schema/kind routing (single identity vs disjunction).
4. Consistency between check mode and derive mode (byte identity vs field checks).
5. Fixture coverage of the boundary (what the persisted expectations actually exercise).

## Anchors (checker bytes sha256 ef37387217c7…, matches `verification.json.checkerSha256`; sidecar sha256 e156b922d0f5…, matches `verification.json.sidecar.sha256`)

- `SIDECAR_SCHEMA` L58; `isPlainObject` L121; `decodeJson` L217-232 (JSON.parse, last-key-wins, no duplicate detection); `readJson` L234-238.
- `evaluateAnchors` L731-774: canonical-only checks L733-744; `canonical_pair` L751-757.
- `prepareContext` L776-824.
- `buildSidecar` L1151-1282 (the emitter; defines the mirror set).
- `evaluateSidecar` L853-1109 (the checker; defines the enforced set).
- `runCheck` L1111-1143; `runDerive` L1320-1484 (byte-identity refusal L1400-1453).
- `resolveCheckInput` L2029-2062 (sidecar-chosen receipt/pin paths L2050-2051); `--check-input` dispatch L2199-2225.
- Self-test sidecar fixtures L1734-1763; `expected-fixtures.json` cases.

## Findings (ordered by severity)

### F1 (high) — Entire top-level `cleanup` mirror is emitted and never checked
- Emitted: `buildSidecar` L1263-1270 writes `cleanup.{perWorkerCount, allClosed, allRefusedAfterClose, allNotListeningAfter, derivedListeningAfter, summaryServerOk}`.
- Present in live `corrected.json` (top-level key `cleanup`).
- Checked: no reference to `sidecar.cleanup` anywhere in `evaluateSidecar` L853-1109 (grep for `sidecar?.cleanup` / `sidecar.cleanup` in `scripts/`: only the emitter hits at L1266-1269).
- Consequence: `cleanup.derivedListeningAfter: true` or `allNotListeningAfter: false` in a sidecar is silently accepted. This is the "emitted cleanup mirror" leg of the C2 requirement.
- Proposed test (new fixture, do not rewrite round-14 expectations): `sidecar-cleanup-mirror-wrong` = valid sidecar with `cleanup.derivedListeningAfter=true`; expect exit 1 and a new finding id (e.g. `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`) whose problems include `cleanup.derivedListeningAfter`. Add one case per cleanup key.

### F2 (high) — Qualification mirrors partly unchecked
- Emitted L1271-1280: `qualification.{qualified, proofCount, allProofsComplete, allProofsSupportCorrection, everyProofListensBefore, everyProofClosed, everyProofRefusedAfterClose, everyProofNotListeningAfter}`.
- Checked L1060-1075: `qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete`, `everyProofNotListeningAfter`.
- Unchecked: `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`.
- Proposed test: `sidecar-qualification-everyProofClosed-false` → exit 1; same for the other two.

### F3 (medium) — `corrections[0].derived` and `rule` text unchecked; only the `correction` mirror is cross-checked
- Emitted `corrections[0].derived` L1229; `corrections[0].rule` L1231; `correction.rule` L1243.
- Checked: `correction.derived` L997 only. `corrections[0]` checks cover path/from/to/value(optional)/supportingProofs (L976-991).
- Proposed test: `sidecar-corrections0-derived-wrong` (`corrections[0].derived=true`, `correction.derived` left false) → expect exit 1.

### F4 (medium) — Identity mirrors `claim`, `wave`, `execution.source` unchecked
- Emitted `wave` L1178 (`receipt.wave ?? 'tabi-round-13-w1'`), `claim` L1179 (`receipt.claim ?? 'C2'`), `execution.source` L1188.
- None read by `evaluateSidecar`. Live sidecar: `claim:"C2"`, `wave:"tabi-round-13-w1"`, `execution.source:"historical-static-bytes"`.
- A sidecar claiming a different claim/wave, or a different execution source, is accepted.
- Proposed test: `sidecar-claim-mismatch` (`claim:"C1"`) and `sidecar-wave-mismatch` → exit 1; compare `wave` to `context.receipt.wave` and `claim` to the receipt-declared claim, and pin `execution.source` to its single allowed literal.

### F5 (medium) — Source mirrors unchecked inside the sidecar
- Emitted `source.producer.{path, role}` L1203-1205; `source.spec.{path, sha256}` L1207-1210; `source.manifest.{path, sha256}` L1211-1214; `source.receipt.{path, bytes}` and `source.pin.{path, bytes}` L1200-1201 (via `receiptMeta`/`pinMeta`).
- Checked: only `source.producer.sourceSha256` (L959-961) and `source.receipt.sha256` (candidate list L912-917). `source.spec.sha256` and `source.manifest.sha256` are compared only at receipt level (`evaluateSourceIdentity` L616-645 against canonical files), never against the sidecar's own copies.
- Proposed test: `sidecar-source-spec-sha-wrong` (`source.spec.sha256=zeros`) → exit 1 (current code predicts exit 0 — [INFERENCE] from reading, not run).

### F6 (high-impact contract gap) — Unknown-field policy does not exist in check mode
- No allowlist, `additionalProperties`, or unknown-key logic anywhere in `check-aria-metadata.mjs` (grep: none).
- Extra top-level, `original`, `source`, `binding`, `corrections[i]`, `correction`, `node`, `cleanup`, `qualification`, `execution`, `provenance` keys are silently accepted in `evaluateSidecar`.
- The only place an extra key is rejected is `runDerive` L1400-1453, which requires the existing file to be byte-identical to `buildSidecar` output. So `--derive` refuses a sidecar with an extra key while `--sidecar`/`--check`/`--check-input` (L2199-2225) accepts it. Check mode is strictly laxer than derive mode.
- Proposed test: `sidecar-unknown-top-key` = valid sidecar plus `"unexpected": true` → expect exit 1, new finding `R14-ARIA-SIDECAR-UNKNOWN-01` naming the key path. Negative control: unmodified `corrected.json` must stay exit 0.
- Proposed contract: an explicit key-path allowlist per object (top, original, source, binding, cleanup, qualification, node, execution, provenance, corrections[i], correction), with `value`, `exactRecordedMatch`, `observedMatchesRecorded`, `execution.browserExecuted`, `execution.newBrowserRun`, `original.*.bytes` marked as the only optional keys. Derive the allowlist from the same key tree as `buildSidecar` so the two cannot drift.

### F7 (medium) — Absent optional mirrors pass silently (`!== undefined` skip)
- L917-923 (candidates filtered with `!== undefined`; any one of the four receipt/pin sha candidates suffices), L940-945 (`original.{receipt,pin}.bytes`), L986-988 (`corrections[0].value`), L1016-1023 (`node.exactRecordedMatch`, `node.observedMatchesRecorded`), L1040-1043 (`execution.browserExecuted`, `execution.newBrowserRun`).
- Effect: deleting those keys yields pass, which is a "could-not-evaluate" situation classified as pass. Live sidecar currently contains all of them, so this is a boundary gap, not a live failure.
- Proposed test: `sidecar-optional-mirror-removed` for each of `node.exactRecordedMatch`, `execution.newBrowserRun` → expect exit 1 under a presence-required policy. Keep `corrections[0].value` optional only if the schema declares it optional.

### F8 (medium) — Contradictory OR-mirrors accepted
- `recordedRole !== 'descriptive' && recordedIsDescriptive !== true` (L1028-1030) passes when either mirror is correct. Input `{recordedRole:'descriptive', recordedIsDescriptive:false}` passes.
- Proposed fix: AND (`recordedRole === 'descriptive' && recordedIsDescriptive === true`). Proposed test: `sidecar-recorded-role-contradiction` → exit 1.

### F9 (medium) — Schema identity is a disjunction; kind regex can stand in for schema
- `schemaOk` L897-901: `sidecar.schema === SIDECAR_SCHEMA || (kind matches /metadata/i && /correct/i)`.
- Router `resolveCheckInput` L2038-2040 uses the same disjunction.
- Input `{schema:'tabi-aria-metadata-correction-v2', kind:'cleanup-and-node-metadata-correction', ...}` passes `R14-ARIA-SIDECAR-SCHEMA-01`.
- Proposed fix: route and validate by `schema === SIDECAR_SCHEMA` only. A sidecar with a wrong schema becomes `R14-ARIA-SIDECAR-SCHEMA-01` fail. Proposed test: `sidecar-schema-v2-kind-match` → exit 1.

### F10 (low–medium) — Duplicate JSON keys silently resolved by last-wins
- `decodeJson` L225-231 uses `JSON.parse`, which keeps the last duplicate. A sidecar with `"browserExecuted": false` followed later by `"browserExecuted": true` is read as `true`; the earlier value is invisible to every reader and to the review.
- Cheap closure: in check mode require the raw text to equal `stableStringify(value)` (the canonical bytes `runDerive` already writes at L1365-1370). Duplicate keys and non-canonical ordering then fail. Note this does not reject extra keys by itself; F6 is still needed.
- Proposed test: `sidecar-duplicate-key` → exit 1.

### F11 (adjacent, cross-lane pointer) — Fully non-canonical receipt/pin pair does not trip the anchor gate
- `evaluateAnchors` L733-744 and L751-757 only fire when at least one of receipt/pin is at the canonical path. A pair that is entirely at non-canonical paths, with bytes that do not equal the anchors, produces no `R14-ARIA-ANCHOR-01` failure.
- Under `--check-input`, the receipt and pin paths come from the sidecar's own `original.*.path` (L2050-2051, L2058-2059).
- Existing fixture `sidecar-auto-detect-check-input` (`expected-fixtures.json`, expectedExit 0, finding `R14-ARIA-SIDECAR-ACCEPTED-01`) codifies acceptance of a self-chosen non-canonical pair (self-test source L1758-1763).
- Mitigations seen: worker proofs are anchored by filename and sha (`ANCHORS.workers` L69-72, L745-750) and cross-checked by `R14-ARIA-WORKER-PROOF-01` (L587-590). Receipt-level fields (`cleanup.server.listeningAfter`, manifest and source copies) are not independently anchored when the pair is non-canonical. Exploitability is [INFERENCE] from code reading only; not executed.
- Proposed test: `noncanonical-pair-check-input` (copy of receipt-old, pin and sidecar into a temp dir, sidecar auto-routed) → expect exit 1 with `R14-ARIA-ANCHOR-01`, or a dedicated could-not-evaluate finding. Keep `sidecar-auto-detect-check-input` as a witness only if its expectation is reworded.
- Owner for the tamper contract: TamperWitness / TamperManifest / TamperReceipt lanes (ids in the TabiR15 roster). Not my slice to resolve.

### F12 (low) — Sidecar bytes are not bound by any enforced digest; `verification.json` is an unenforced mirror
- `R14-ARIA-SIDECAR-01` L858-868 reports the sidecar sha256 and bytes but nothing compares them to an expected value.
- `corpus/evidence/round-14/aria-metadata/verification.json` records `sidecar.sha256 = e156b922…` (matches current `corrected.json`), `checkerSha256 = ef373872…` (matches current checker), and `codeRevision = e570380…` (matches the checker's last committed revision). No file under `scripts/` reads `verification.json` (grep for `verification.json`: no hits). These are records, not enforcement.
- Proposed: if the sidecar is meant to be digest-bound, the expected digest must come from a code constant or a committed manifest the checker reads. Otherwise document `verification.json` as record-only.
- Pitfall for L1: any checker change to close F1–F10 changes `checkerSha256`. Round-14 `verification.json` and `expected-fixtures.json` are historical evidence; new cases belong in a round-15 expectations file, not in a rewrite of round-14 bytes.

### F13 (low) — Fixture coverage does not exercise the boundary
- Sidecar-related cases in `expected-fixtures.json`: `sidecar-valid-accepted`, `sidecar-auto-detect-check-input`, `sidecar-bad-receipt-digest`, `sidecar-wrong-direction`, `sidecar-false-exact-node`, `witness-red-to-clean`, `witness-rejects-bad-sidecar`.
- Builder fixtures L1741-1763: `sidecar-valid`, `sidecar-baddigest`, `sidecar-wrongto`, `sidecar-exactnode`, `sidecar-auto`.
- Absent: unknown key, cleanup mirror, qualification mirror, `corrections[0].derived`, claim/wave/execution.source, source mirror, optional-mirror removal, OR-contradiction, schema/kind disjunction, duplicate keys, non-canonical pair.

## Live sidecar boundary snapshot (read-only)

Top-level keys of `corrected.json`: `binding, browserExecuted, claim, cleanup, correction, corrections, derivedFromHistoricalRuntime, execution, kind, node, original, provenance, qualification, qualified, schema, source, status, wave`.
Keys never read by `evaluateSidecar`: `cleanup` (all six), `claim`, `wave`, `corrections[0].derived`, `corrections[0].rule`, `correction.rule`, `execution.source`, `node.note`, `qualification.everyProof{ListensBefore,Closed,RefusedAfterClose}`, `source.{producer.path,producer.role,spec,manifest}`, `source.{receipt,pin}.{path,bytes}`.

## Proposed test set for MetadataEnforce (not executed)

1. Negative control: unmodified `corrected.json` stays exit 0 after any fix.
2. Unknown top-level key → exit 1 (F6).
3. Unknown nested key under `cleanup`, `qualification`, `corrections[0]` → exit 1 (F6).
4. Cleanup mirror wrong, per key → exit 1 (F1).
5. Qualification mirror wrong for `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` → exit 1 (F2).
6. `corrections[0].derived` wrong → exit 1 (F3).
7. `claim` ≠ `C2`, `wave` ≠ receipt wave, `execution.source` ≠ literal → exit 1 (F4).
8. `source.spec.sha256` / `source.manifest.sha256` wrong → exit 1 (F5).
9. Optional mirrors removed (`node.exactRecordedMatch`, `execution.newBrowserRun`, `original.receipt.bytes`) → exit 1 (F7).
10. `recordedRole` / `recordedIsDescriptive` contradiction → exit 1 (F8).
11. `schema` v2 with matching `kind` → exit 1 (F9).
12. Duplicate key → exit 1 (F10).
13. Non-canonical receipt/pin pair via `--check-input` → exit 1 (F11).
14. Derive-vs-check parity: any sidecar that `--derive` would refuse for byte mismatch is also refused by check mode (F6 proof).

## Commands L1 should run after integration (not run by me)

- `node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` (negative control; expect exit 0 post-fix).
- `node scripts/check-aria-metadata.mjs --self-test` (after new fixtures are registered in a round-15 expectations file).
- `node scripts/check-aria-metadata.mjs --witness` (must still show `original receipt/pin byte-identical`).
- `sha256sum scripts/check-aria-metadata.mjs` and compare with any new `checkerSha256` record.

## Peer messages sent

- `TabiR15.MetadataEnforce` (code-related: checker defects F1–F10, F11 cross-pointer).
- `TabiR15` (summary pointer to this report).

## Residual risk / verification gaps

- All defects are from code reading and fixture inspection. Nothing was executed; the "predicted exit" statements are [INFERENCE] until L1 runs the proposed fixtures.
- F11 exploitability is not demonstrated; it depends on whether receipt-level fields can be made self-consistent with the anchored worker files.
- `verification.json` contents were compared by hash only; the recorded self-test stdout was not re-run.
