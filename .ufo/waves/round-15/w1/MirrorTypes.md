# MirrorTypes — round 15 w1 (read-only audit)

Scope: malformed mirror types, strict equality versus truthiness/coercion, in the C2 ARIA metadata checker and its sidecar mirrors. Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Author-side report; not non-author certification.

Method: static reading only. No checker, self-test, witness, gate, counter, test, suite or browser was executed. Data reads were limited to JSON field-type inspection of committed evidence (`corpus/evidence/round-14/aria-metadata/corrected.json`, `corpus/evidence/round-13/aria/receipt.json`, worker JSON). Every behavior claim below is a static derivation from source and is tagged [static]; nothing here is observed runtime behavior.

Tool installs: none.

## Snapshot anchor (important)

`scripts/check-aria-metadata.mjs` changed while this audit ran (a sibling executor is editing it). Snapshots read:

| Tag | Lines | Notes |
|---|---|---|
| #FB3C | 2263 | first read; original basis for most line anchors below |
| #B7CF | 2343 | mid-edit; `snapshot_tampered` constant appears |
| #22D6 | 2345 | sha256 `e1436de0628d41a4f8f6a459021fd5d85213456c3bd2bb95df344b567e1f5468` |

Line anchors below are tagged. Function names are stable; in-function lines are B7CF numbering unless marked otherwise. Lines after ~510 shifted by +2 between B7CF and #22D6. Findings must be re-verified against the final checker bytes before any count or verdict is used.

At #22D6 the new tables and constants are defined but I found no consumer call sites: `CLEANUP_MIRROR_FIELDS` (98), `QUALIFICATION_MIRROR_FIELDS` (106), `LEGACY_ROUND14` (119), `TAMPER_FINDING` (92), `TAMPER_STATUS` (93), `REASON.snapshotTampered` (89), `EXIT.couldNotEvaluate` (91). Status of each finding at #22D6 is stated explicitly.

## Summary

Defects found: 9 checker/contract, 1 USER counter (routed). Strict equality is used correctly for most leaves (`!== true`, `=== false`, `typeof ... === 'boolean'`, `Number.isInteger`, `Array.isArray`). The defects cluster in four places: (1) emitted fields with no predicate, (2) optional-skip via `!== undefined`, (3) OR-fallbacks that accept a mirror without its identity, (4) `String(...)` coercion on identity.

Every proposed stricter predicate is satisfied by the committed `corrected.json` (verified by reading its values), so old corrected-sidecar acceptance is preserved by these changes.

## Findings

### F1 — High — emitted mirror leaves with no predicate [static]
`buildSidecar` emits 26 leaves under `cleanup`, `qualification`, `source`, `execution`, `corrections`, `correction`, `node`, and top-level `wave`/`claim` (B7CF 1233–1363). `evaluateSidecar` (B7CF 935–1190) has no equality predicate for these:

- top-level: `wave`, `claim`
- `execution.source`
- `source.receipt.path`, `source.receipt.bytes`
- `source.pin.path`, `source.pin.bytes`
- `source.producer.path`, `source.producer.role`
- `source.spec.path`, `source.spec.sha256`
- `source.manifest.path`, `source.manifest.sha256`
- `corrections[0].derived`, `corrections[0].rule`, `correction.rule`
- `node.note`
- `cleanup.{perWorkerCount, allClosed, allRefusedAfterClose, allNotListeningAfter, derivedListeningAfter, summaryServerOk}` (6)
- `qualification.{everyProofListensBefore, everyProofClosed, everyProofRefusedAfterClose}` (3)

The last 9 (cleanup 6 + qualification 3) are declared in `CLEANUP_MIRROR_FIELDS` / `QUALIFICATION_MIRROR_FIELDS` at #22D6 (98–115) but have no consumer yet. The remaining 17 have no declaration at all, so they stay unchecked even after those tables are wired.

Round-14 spot-check item 2 (`corpus/lessons/round-14-verifier-spotcheck.md:185`) and SKILL.md:1777 ("Recompute each emitted mirror from the authenticated complete nonempty worker set; do not accept a false mirror merely because the primary correction matches") both require these to be checked.

Proposed fix: recompute each emitted mirror from its own predicate and compare with strict `===`/`typeof`. Put the 17 undeclared leaves in an enforced table, and require the committed mirror-contract asset to list exactly the emitted set.

Proposed tests (mutate a temp copy of `corrected.json`; never the committed file):
- `mirror-unchecked-source-spec-sha`: `source.spec.sha256` → a different string → expect semantic exit 1, new finding (e.g., `R14-ARIA-SIDECAR-MIRROR-01`).
- `mirror-unchecked-wave`: `wave` → `"x"` → expect exit 1.
- `mirror-unchecked-cleanup-allClosed`: `cleanup.allClosed` → `false` → expect exit 1.
- `mirror-unchecked-qualification-everyProofClosed`: `qualification.everyProofClosed` → `false` → expect exit 1.

Preservation: committed `corrected.json` has all 26 leaves present (verified by reading); each is emitted from `ANCHORS` or the derived predicate, so the recomputed value equals the committed value [INFERENCE for the file-level equality of `source.*` path strings; L1 should confirm with `--check`].

### F2 — High — optional-skip on emitted keys (deletion passes silently) [static]
`!== undefined` guards make these keys optional, although `buildSidecar` always emits them (B7CF 1233–1363) and the committed `corrected.json` contains them:

| Key | Guard (B7CF) | Emitted by buildSidecar |
|---|---|---|
| `execution.browserExecuted` | 1120–1121 | yes (`execution.browserExecuted: false`) |
| `execution.newBrowserRun` | 1122–1123 | yes |
| `node.exactRecordedMatch` | 1096–1097 | yes |
| `node.observedMatchesRecorded` | 1100–1101 | yes |
| `corrections[0].value` | 1066–1067 | yes |
| `original.receipt.bytes` | 1020–1021 | yes (`97073` in committed file) |
| `original.pin.bytes` | 1023–1024 | yes (`1154` in committed file) |

Verified by reading `corrected.json`: all seven keys are present and carry the expected values (`false`, `false`, `false`, `false`, `false`, `97073`, `1154`).

Proposed fix: require presence (`Object.hasOwn`) and strict value; drop the `!== undefined` skips. Behaviour on the committed file is unchanged.

Proposed tests: delete each key one at a time from a temp copy → expect exit 1, `R14-ARIA-SIDECAR-…` finding for that key. Currently [static] each deletion produces no failing finding.

### F3 — Medium — OR-fallback accepts a sidecar by `kind` regex without its schema identity [static]
- `evaluateSidecar` schema check, B7CF 977–980: `sidecar?.schema === SIDECAR_SCHEMA || (typeof sidecar?.kind === 'string' && /metadata/i && /correct/i)`.
- `resolveCheckInput`, #22D6 2111–2120 (B7CF 2109–2120): same OR. A file with no or a wrong `schema` but a matching `kind` is routed into the sidecar branch, and its `original.receipt.path` / `original.pin.path` pick the receipt and pin to check.

Test `mirror-schema-wrong-kind-matches`: `schema: "tabi-aria-metadata-correction-v0"`, `kind` unchanged → expect exit 1, `R14-ARIA-SIDECAR-SCHEMA-01` fail. Currently [static] the schema finding passes.

Fix: schema identity only; reject any other `schema` value.

### F4 — Medium-low — contradictory role mirrors accepted via OR [static]
`evaluateSidecar` B7CF 1108–1109: `sidecarNode?.recordedRole !== 'descriptive' && sidecarNode?.recordedIsDescriptive !== true` fails only when both disagree. `recordedRole: "enforced"` with `recordedIsDescriptive: true` passes.

Test `mirror-role-contradiction`: `node.recordedRole = "enforced"`, `recordedIsDescriptive = true` → expect exit 1 (`node.recordedRole`). Currently [static] accepted.

Fix: require both, each exact (`'descriptive'` and `true`). `buildSidecar` already emits both (1336–1337).

### F5 — Medium — type-blind worker identity via `String(...)` [static]
`String(x ?? '')` coerces number, string and null alike at:
- filename vs receipt, B7CF 599–601: `expectedIndex`/`expectedPid`
- worker-file identity, B7CF 618–620: `actualIndex`/`actualPid`
- `server.perWorker` identity, B7CF 629–631 → `proofProblems`

Real evidence types (verified by reading): `workers[].worker.index` = str, `pid` = int; worker files = str / int; `server.perWorker[].worker` = str / int. The checker accepts the same identity if typed differently, e.g. `index: 0` (number) matches `"0"`, and `pid: "1530637"` (string) matches `1530637`.

Test `identity-index-numeric`: `server.perWorker[0].worker.index = 0` → expect `proof[0]:server_worker_identity_mismatch` / exit 1. Currently [static] passes. Same for `pid` as string.

Fix: `typeof index === 'string' && index === expected`; `Number.isInteger(pid) && pid === expected`; keep the filename regex as the string source. Committed evidence already has these types, so acceptance is unchanged.

### F6 — Medium-low — derived `listeningAfter` uses `=== true` against its documented rule [static]
`evaluateCleanup` B7CF 392–395: `derivedListeningAfter = perWorker.some(proof?.listeningAfter === true)`.

The rule text emitted in `corrections[0].rule` and `correction.rule` (buildSidecar, FB3C 1231–1245; present in committed file) reads: "false only when every proof reports false". A non-boolean proof value (`"false"`, `null`, missing) is treated as not-listening, so the derived mirror reports `false` while `PROOF-01`/`PERWORKER-01` fail. Acceptance is not bypassed (`proofs_not_complete` at CORRECTION-01 still fails), but the derived mirror and the emitted rule disagree.

Test `proof-listening-string-false`: `perWorker[0].listeningAfter = "false"` → expect derived ≠ `false`, `R14-ARIA-CLEANUP-PERWORKER-01` fail, derive refused. Currently [static] `derived.listeningAfter` reports `false`.

Fix: `some(proof?.listeningAfter !== false)` (non-boolean → treated as possibly listening), still gated by `complete`.

### F7 — Medium — aliased mirrors cannot be independently verified [static]
`buildSidecar` assigns the same aggregate to several predicates:
- `cleanup.allNotListeningAfter` = `allValuesOk` (B7CF 1347)
- `qualification.everyProofListensBefore` = `allValuesOk` (1356)
- `qualification.everyProofNotListeningAfter` = `allValuesOk` (1359)
- `qualification.allProofsSupportCorrection` = `allValuesOk` (1355)

`allValuesOk` = `allProofsPass` (evaluateCleanup), which also includes `closed`, `refusedAfterClose`, `closeError` and `refusalDetail`. So `everyProofListensBefore` is not derived from `listeningBefore` and cannot disagree with the proofs independently.

Test `mirror-everyProofListensBefore-false`: set only `qualification.everyProofListensBefore = false` (proofs unchanged, `listeningBefore: true`) → expect exit 1. Currently [static] (field unchecked) accepted.

Fix: each mirror recomputed from its own predicate: `everyProofListensBefore = every(listeningBefore === true)`; `everyProofNotListeningAfter = every(listeningAfter === false)`; `allNotListeningAfter` = same; `allProofsSupportCorrection` = `allProofsPass`. Committed proofs satisfy each (verified: `listeningBefore: true`, `listeningAfter: false`, `closed: true`, `refusedAfterClose: true`, `closeError: null`).

### F8 — High — `snapshot_tampered` / exit 2 is documented but not implemented [static; partly in progress]
- Header, #22D6 23–24 (FB3C 23–24): "exit 2 could not evaluate … authenticated snapshot digest drift, which is classified as reason snapshot_tampered". At #FB3C the code had no `snapshot_tampered` emitter, and every failure path returned exit 1 (`runCheck`, FB3C 1111–1143; `main`, exit 2 only for fatal/usage/derive-out).
- #22D6: constants defined (`REASON.snapshotTampered` 89, `EXIT.couldNotEvaluate` 91, `TAMPER_FINDING` 92, `TAMPER_STATUS` 93). I found no call site emitting them at #22D6. Until one exists, the contract is unimplemented.
- SKILL.md:1778 requires: "A committed source/snapshot digest no longer matches → `snapshot_tampered`, exit2 could-not-evaluate; semantic disagreement remains exit1 failed." Round-14 spot-check item 3 (`corpus/lessons/round-14-verifier-spotcheck.md:186`) records the same gap.
- Anchor gating, #22D6 813–835 (B7CF 811–834): receipt/pin digests are compared to `ANCHORS` only when the path is the canonical default (`canonicalReceipt && sha !== ANCHOR`, 831–833 gated by `canonicalReceipt || canonicalPin`). When neither file is canonical, a digest mismatch yields no `R14-ARIA-ANCHOR-01` failure at all. `resolveCheckInput` (#22D6 2111) lets a sidecar-shaped input choose those non-canonical receipt/pin paths from `original.*.path`. A snapshot change at a non-canonical location is therefore not classified as tamper.
- Sidecar binding mismatches (`receipt_sha256`, `pin_sha256`, `proofSetSha256`, `binding.perWorker[i]`) emit `R14-ARIA-SIDECAR-BINDING-01` → exit 1 (semantic), not `snapshot_tampered` exit 2. Whether a sidecar-binding digest drift is "snapshot tampering" is a classification decision for L1; the SKILL row above favors exit 2.

Proposed tests:
- `snapshot-noncanonical-receipt-copy`: copy `receipt.json` to a temp path with one byte changed, run with `--receipt <copy> --pin <canonical pin>` → expect exit 2, `snapshot_tampered`. Currently [static] no ANCHOR failure.
- `snapshot-binding-receipt-sha-altered`: alter `binding.receiptSha256` in a temp sidecar → expect exit 2 `snapshot_tampered` (decision required; if L1 rules sidecar-binding is semantic, expect exit 1 and document the boundary).
- Byte preservation: `git diff --exit-code -- corpus/evidence/round-13 scripts/aria-loopback-round13.mjs corpus/evidence/round-14/aria-metadata/corrected.json` must be empty after any change.

### F9 — Low — `??` fallback validates a value that was never emitted [static]
`evaluateSidecar` B7CF 1164 `applyCorrection(context.receipt, correction?.to ?? cleanupDerived.listeningAfter)` and 1181 `correctedValue: correction?.to ?? null`. If `corrections[0].to` is `null`/missing, the residual evaluation silently uses the derived value. Not a bypass: `corrections[0].to` (`typeof` check) fails independently and `accepted` requires every finding to pass.

Fix: if `typeof correction.to !== 'boolean'`, skip the residual evaluation and report `corrections[0].to` as the only residual failure.

Test `correction-to-null`: `corrections[0].to = null` → expect exit 1 with residual limited to `corrections[0].to`.

### F10 — Info — vacuous worker agreement when both sides are undefined [static]
`deriveNode` (#22D6 511): `workerNodes.every(value => value === observedRaw)` is true when both are `undefined`. `R14-ARIA-NODE-01` still fails through `shapesOk` (which requires a parsed observed version), so there is no bypass. The reported `workerAgreement: true` with no observed node is misleading. Fix: require `typeof observedRaw === 'string'` before agreement.

### F11 — Medium — USER counter truthiness/reason conflation (routed; CounterDiagnostics)
`scripts/check-user-round-contract.mjs` (tag #F083):
- Line 991: `no_marker=${test.noMarker ? (leaked ? 0 : 1) : 0}` → `0` means both "not applicable" and "marker leaked". Same at 1016 (`no_marker=0` for witness) and 1004.
- `score_mismatch` is reused for unrelated refusals: unsupported counting command (391, 398), failed count command (408), before/after comparison (593–597), malicious controls (867–891) assert only `score_mismatch`, not the intended reason.

SKILL.md:1779 requires: "Reject the control unless its expected reason also matches; marker absence and marker-not-applicable are separate states." Round-14 spot-check item 4 records the same.

Test `usercounter-reason-mismatch`: a malicious control producing a different `score_mismatch` reason must fail the expected-reason assertion. Owned by CounterDiagnostics; not my slice to edit.

## Strict-vs-truthiness classification (summary)

Correct strict use (no action): `typeof` on proof booleans/strings (`proofShapeProblems`, 265–294); `proof.listeningBefore/closed/refusedAfterClose !== true`; `correction.to !== false`; `sidecar.qualified !== true`; `status !== 'qualified'`; `Number.isInteger` on counts and pin minimum; `isPlainObject` excludes arrays; `nextValue` rejects empty/`--` values; `parseVersion` requires a string; `receiptShaCandidates` filter keeps `null` (checked as a mismatch).

Truthiness/coercion sites: `Boolean(server)`, `Boolean(cleanup)` (presence only, fine); `if (!cleanupProof || !serverProof)` (falsy → missing, fails closed); `String(... ?? '')` (F5); OR-fallbacks (F3, F4); `!== undefined` skips (F2); `??` fallback (F9); `=== true` derivation (F6).

## Preservation check

For each proposed stricter predicate I checked the committed `corrected.json` / `receipt.json` / worker JSON by reading (no checker run):
- all optional keys in F2 present with the expected values;
- all emitted leaves in F1 present (`source.*`, `wave`, `claim`, `execution.source`, `node.note`, `corrections[0].rule`);
- proof predicates satisfy F7 (single proof: listeningBefore true, closed true, listeningAfter false, refusedAfterClose true, closeError null);
- worker identity types match F5 (str/int).

No proposed predicate rejects the committed evidence, so acceptance of the corrected sidecar is preserved [static].

## Verification gaps and commands for L1 (not run by me)

1. Record `sha256sum scripts/check-aria-metadata.mjs` at the final checker bytes (audit basis #22D6 `e1436de0…`, 2345 lines).
2. `node scripts/check-aria-metadata.mjs --self-test` (expect exit 0 once new cases land).
3. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0: old acceptance preserved).
4. `node scripts/check-aria-metadata.mjs --witness` (expect `transition=red->clean`, `original_unchanged=true`).
5. `git diff --exit-code -- corpus/evidence/round-13 scripts/aria-loopback-round13.mjs corpus/evidence/round-14/aria-metadata/corrected.json corpus/evidence/round-14/aria-metadata/expected-fixtures.json` (byte preservation).
6. Confirm the assets the checker now points at exist: `DEFAULT_EXPECTATIONS` = `corpus/evidence/round-15/metadata/expected-fixtures.json` and `DEFAULT_MIRROR_CONTRACT` = `corpus/evidence/round-15/metadata/mirror-contract.json` (#22D6 73–74). I did not verify their existence.
7. Confirm `snapshot_tampered` has a real emitter (F8) and the mirror tables have consumers (F1, F2, F7); re-grep after the final edit.
8. Run each proposed mutation in a temp directory only (never mutate committed evidence).

Note on checker sha: the round-14 legacy checker sha `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6` (`LEGACY_ROUND14`, 120–121) differs from the current checker; the legacy boundary is documented static data, not executed.

## Limits

- Static reading only; nothing executed. Line anchors are tagged by snapshot and may move.
- The checker was mid-edit by a sibling during this audit; findings that the in-progress tables already address are marked as such (F1, F8). Final status depends on the final bytes.
- F11 is in a file outside this slice and is routed to CounterDiagnostics.
