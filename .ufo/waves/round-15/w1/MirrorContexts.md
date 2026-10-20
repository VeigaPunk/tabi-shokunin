# Round 15 W1 — MirrorContexts (read-only audit)

Author: TabiR15.MirrorContexts. Author-side report; not non-author certification.
Scope: `buildSidecar` emitted fields (cleanup / qualification mirrors, plus contexts/profile/temp-root facts) versus what `evaluateSidecar` actually re-derives.
Method: static reading only. No gate, counter, test, self-test, browser, or build was executed. No source was edited. No peer message was sent (see Open items).

## Anchors

| Item | Location |
|---|---|
| `buildSidecar` | `scripts/check-aria-metadata.mjs:1151-1282` |
| emitted `cleanup` block | `:1263-1270` |
| emitted `qualification` block | `:1271-1280` |
| emitted `source` block (spec/manifest/producer) | `:1199-1215` |
| emitted `wave` / `claim` (receipt fallbacks) | `:1178-1179` |
| emitted `corrections[0]` / `correction` mirror (`rule`, `derived`) | `:1223-1246` |
| emitted `node` block | `:1247-1262` |
| `evaluateSidecar` (all sidecar checks) | `:853-1109` |
| schema check with `kind` OR-fallback | `:897-906` |
| binding checks | `:908-968` |
| correction checks | `:970-1007` |
| node-claim checks | `:1009-1034` |
| provenance checks | `:1036-1058` |
| qualification checks | `:1060-1081` |
| `evaluateCleanup` (receipt-side derivation) | `:296-427` |
| proof shape/value helpers | `:265-294` |
| self-test sidecar mutations | `:1742-1763`; determinism `:1884` |
| committed sidecar | `corpus/evidence/round-14/aria-metadata/corrected.json` (all values read) |
| historical receipt cleanup | `corpus/evidence/round-13/aria/receipt.json:2387-2561` (`caseCleanup` x8 at `:2388-2516`; top-level `server`/flags `:2518-2561`) |

## Emitted fields that `evaluateSidecar` never reads

Each row was confirmed by grep: no reference in `check-aria-metadata.mjs` outside `buildSidecar` for the named key.

| Emitted field (buildSidecar line) | Gate reads it? | Defect |
|---|---|---|
| `cleanup.perWorkerCount` (1264) | no | unchecked count mirror |
| `cleanup.allClosed` (1265) | no | unchecked; may be `null` when perWorker empty |
| `cleanup.allRefusedAfterClose` (1266) | no | unchecked |
| `cleanup.allNotListeningAfter` (1267) | no | unchecked; value is `allValuesOk` (see mislabel below) |
| `cleanup.derivedListeningAfter` (1268) | no | unchecked; must equal `false` for a qualified sidecar |
| `cleanup.summaryServerOk` (1269) | no | unchecked; should mirror `cleanupDerived.serverOk` |
| `qualification.everyProofClosed` (1277) | no | unchecked |
| `qualification.everyProofRefusedAfterClose` (1278) | no | unchecked |
| `qualification.everyProofListensBefore` (1276) | no | unchecked; value is `allValuesOk` (mislabel) |
| `source.spec.path` / `source.spec.sha256` (1207-1210) | no | **spec digest mirror never compared**; `ANCHORS.specSha256` is only checked against the live file in `evaluateSourceIdentity` (`:643`), not against the sidecar copy |
| `source.manifest.path` / `source.manifest.sha256` (1211-1214) | no | **manifest digest mirror never compared** (live check is `:623`, sidecar copy unread) |
| `source.producer.path` / `source.producer.role` (1202-1206) | no | unchecked (only `sourceSha256` is read, `:959`) |
| `source.receipt.path` / `source.pin.path` (1200-1201, via `receiptMeta`/`pinMeta`) | no | path mirror unchecked; only `sha256` read (`:912-932`) |
| `source.receipt.bytes` / `source.pin.bytes` (1167, 1172) | no | bytes mirror unchecked (only `original.*.bytes` read, `:940-944`) |
| `wave` (1178) | no | emitted from `receipt.wave ?? 'tabi-round-13-w1'` — silent fallback, never compared to the receipt |
| `claim` (1179) | no | emitted from `receipt.claim ?? 'C2'` — silent fallback, never compared |
| `corrections[0].derived` (1229) | no | unchecked (only `to` and `value` are read) |
| `corrections[0].rule` (1231) / `correction.rule` (1243) | no | unchecked prose-as-contract |
| `node.note` (1258) | no | unchecked |
| `execution.source` (1188) | no | unchecked |

## Defects that let a wrong value pass

1. **Schema bypass via `kind` (`:897-901`).** `schemaOk = schema === SIDECAR_SCHEMA || (kind matches /metadata/ && /correct/)`. A sidecar with a wrong or absent `schema` passes if its `kind` string matches two regexes. Proposed: require `sidecar.schema === SIDECAR_SCHEMA` strictly; drop the `kind` fallback. The committed `corrected.json:94` already carries the exact schema, so this preserves old acceptance.

2. **Conditional-key passes (absent key = pass).** These checks run only `if (x !== undefined)`:
   - `node.exactRecordedMatch` (`:1016-1019`)
   - `node.observedMatchesRecorded` (`:1020-1023`)
   - `corrections[0].value` (`:986-988`)
   - `execution.browserExecuted` / `execution.newBrowserRun` (`:1040-1043`)
   - `original.receipt.bytes` / `original.pin.bytes` (`:940-944`)

   Deleting any of these keys from a sidecar still accepts it. Proposed: require presence (`=== true|false|number`), not `undefined`-skip. The committed sidecar contains all of them (`corrected.json:41,55,60,49,72,67`), so presence-required does not break old acceptance.

3. **Mislabelled predicates.** `allNotListeningAfter` (`:1267`), `allProofsSupportCorrection` (`:1275`), `everyProofListensBefore` (`:1276`), and `everyProofNotListeningAfter` (`:1279`) are all set to `allValuesOk` = `cleanupDerived.allProofsPass` (`:1174`). That predicate conjoins listeningBefore, closed, listeningAfter, refusedAfterClose, closeError, and refusalDetail. So `everyProofListensBefore` and `everyProofNotListeningAfter` are not the predicates their names state. Currently all proofs pass, so values are identical; the defect is that the emitted names don't carry their own predicate. Proposed: compute each name from its own predicate in `buildSidecar`, e.g. `proofs.every(p => p.listeningBefore === true)`. For the committed single-proof data every such value is `true`, so the emitted bytes should not change [INFERENCE from code reading; not executed].

4. **Fallback defaults.** `wave: receipt.wave ?? 'tabi-round-13-w1'` and `claim: receipt.claim ?? 'C2'` (`:1178-1179`) let a receipt lacking those fields produce a sidecar that looks well-formed. Proposed: fail closed (refuse derive) instead of defaulting, and have `evaluateSidecar` compare `sidecar.wave === receipt.wave` and `sidecar.claim === receipt.claim`. Verify the real receipt's top-level `wave`/`claim` before relying on this [INFERENCE: fixture at `:1574-1575` shows them, real receipt not yet grepped].

5. **Path binding is non-empty-only (`:934-939`).** `original.receipt.path` / `original.pin.path` are checked only for non-empty strings. Exact-path equality would break self-test `sidecar-auto` (`:1758-1763`), which deliberately rewrites paths to tmp fixtures. Proposed: check `source.X.path === original.X.path` (internal mirror consistency) and `bytes` equality; reserve canonical-path equality for the real-canonical mode only.

## Proposed enforced checks (for the sidecar gate; not applied)

Each row is "emitted field → independently recomputed value → proposed finding detail". All comparisons use strict `===` on the recomputed value and fail when the key is absent.

- `cleanup.perWorkerCount` → `proofs.length`
- `cleanup.allClosed` → `proofs.every(p => p.closed === true)`
- `cleanup.allRefusedAfterClose` → `proofs.every(p => p.refusedAfterClose === true)`
- `cleanup.allNotListeningAfter` → `proofs.every(p => p.listeningAfter === false)` (own predicate, not `allValuesOk`)
- `cleanup.derivedListeningAfter` → `proofs.some(p => p.listeningAfter === true)`, and must be `false` for qualified
- `cleanup.summaryServerOk` → `cleanupDerived.serverOk`
- `qualification.everyProofClosed` → `proofs.every(p => p.closed === true)`
- `qualification.everyProofRefusedAfterClose` → `proofs.every(p => p.refusedAfterClose === true)`
- `qualification.everyProofListensBefore` → `proofs.every(p => p.listeningBefore === true)`
- `qualification.everyProofNotListeningAfter` → `proofs.every(p => p.listeningAfter === false)`
- `qualification.allProofsSupportCorrection` → `cleanupDerived.allProofsPass`
- `source.spec.{path,sha256}` → `SOURCE_PATHS.spec`, `ANCHORS.specSha256`
- `source.manifest.{path,sha256}` → `SOURCE_PATHS.manifest`, `ANCHORS.manifestSha256`
- `source.producer.path` → `SOURCE_PATHS.producer`
- `source.receipt.bytes` / `source.pin.bytes` → `context.receiptRead.entry.bytesLength` / `context.pinRead.entry.bytesLength`
- `source.receipt.path` / `source.pin.path` → equal to `original.receipt.path` / `original.pin.path` (mirror consistency)
- `wave` / `claim` → equal to `receipt.wave` / `receipt.claim` (no fallback)
- `corrections[0].derived` and `correction.derived` → equal to `cleanupDerived.listeningAfter` (already read on mirror at `:997`; add to `corrections[0]`)
- `corrections[0].rule` / `correction.rule` → exact string equality to the emitted rule constant (or delete the field; prose is not a contract)
- `execution.source` → `'historical-static-bytes'`

Backward compatibility check (by reading committed `corrected.json`, not executed): every proposed key except `wave`/`claim`-fallback and path-canonical is present in the committed sidecar. Its values are `true`/`1`/`false` consistent with the receipt's single proof (`closed:true`, `refusedAfterClose:true`, `listeningAfter:false`, `listeningBefore:true`; receipt `:2528-2531`). The committed sidecar should therefore still be accepted. L1 must confirm by running the gate, not by trusting this reading.

## Proposed self-test cases (new mutations, each a single-field change on `sidecar-valid`)

Each entry: fixture name, mutation, expected exit and finding. Exit codes follow the existing `sidecar-*` cases (exit 1 = reject).

- `sidecar-cleanup-count` — `cleanup.perWorkerCount = 2` → reject, `R14-ARIA-SIDECAR-*` (new mirror finding)
- `sidecar-cleanup-listening` — `cleanup.derivedListeningAfter = true` → reject
- `sidecar-qual-closed` — `qualification.everyProofClosed = false` → reject
- `sidecar-source-spec` — `source.spec.sha256 = zero` → reject (currently ACCEPTED: defect)
- `sidecar-source-manifest` — `source.manifest.sha256 = zero` → reject (currently ACCEPTED: defect)
- `sidecar-wave` — `wave = 'other'` → reject (currently ACCEPTED: defect)
- `sidecar-schema-kind` — `schema` removed, `kind` kept matching → reject (currently ACCEPTED: defect)
- `sidecar-node-key-absent` — delete `node.exactRecordedMatch` → reject (currently ACCEPTED: defect)
- `sidecar-corr-derived` — `corrections[0].derived = true` → reject (currently ACCEPTED: defect)

"currently ACCEPTED" is read from the code path, not executed. L1 should confirm each by running the new fixtures after integration.

Adding fixtures changes `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` digests (`:1765-1780`). Adding fields to `buildSidecar` changes `corrected.json` bytes unless values are unchanged, and the deterministic-derive case compares against `sidecar-valid.json` (`:1884`). L1 owns regenerating these artifacts; this audit does not touch them.

## Context / profile / temp-root facts (out of the buildSidecar mirror)

`buildSidecar` emits no context, profile, or temp-root fields. The historical receipt does record them, and the gate reads none of them. Grep of `check-aria-metadata.mjs` for `caseCleanup`, `tempRoot`, `profileDir`, `contextPresent`, `contextClosed`, `profileRemoved`, `tempRootRemoved`, `tempRootsRemoved`, `profilesRemoved`, `childrenAfter`, `browserProcessesAfter`, `browserProcs`, `allCaseCleanup`, `outputConfinementOk`, `rootOutputs*`, `artifactsDir`, `newPageRejected`, `childProbeSupported` returns **no matches**.

Unread receipt facts:
- per case, `cleanup` blocks at `receipt.json:763-776`, `:905-918`, `:1073-1086`, `:1227-1240`, `:1407-1420`, `:1566-1579`, `:1772-1785`, `:2013-2026`, and `caseCleanup` entries at `:2388-2516`. Fields: `tempRoot`, `profileDir`, `childProbeSupported`, `childrenBefore`, `contextPresent`, `contextClosed`, `closeError`, `newPageRejected`, `childrenAfter`, `browserProcessesAfter`, `profileRemoved`, `tempRootRemoved`, `ok`.
- top level `cleanup` at `:2518-2561`: `allCaseCleanup`, `contextClosed`, `browserProcs`, `artifactsDir`, `artifactsEntries`, `rootOutputs{Before,After,Introduced}`, `outputConfinementOk`, `tempRootsRemoved`, `profileRemoved`, `profilesRemoved`, `browserProcessesAfter`.

These are not "cleanup.server" and are not in `buildSidecar`'s emitted set. Adding them is a scope decision, not a defect in the emitted mirror. The round-15 spec asks to enforce "ALL fields emitted by buildSidecar cleanup and qualification", which excludes them. **Decision for L1**: either (a) record the gap as an explicit non-goal, or (b) add a separate receipt-side check. Option (b) would be a new contract and must be scoped as such; this audit does not recommend it as a default.

Internal-consistency check that is independently recomputable and needs no run-specific values: for each `caseCleanup` entry, `profileDir === tempRoot + "/profile"`, `tempRoot` under `os.tmpdir()`, `contextPresent === contextClosed`. Verified by reading `:2391-2392`, `:2407-2408`, `:2423-2424`, `:2439-2440`, `:2455-2456`, `:2471-2472`, `:2487-2488`, `:2503-2504` (all consistent).

## Concrete source-level pointers for TabiR15 integration

- Insert the proposed checks in `evaluateSidecar` after the existing qualification block (`:1081`) and before the residual check (`:1083`), so a failing mirror is reported before the post-correction re-evaluation.
- Change `buildSidecar` `kind`/`schema`/`wave`/`claim` lines (`:1176-1179`) to fail-closed.
- Change `buildSidecar` `qualification` (`:1271-1280`) and `cleanup` (`:1263-1270`) so each name uses its own predicate.
- Change `evaluateSidecar` conditional checks (`:986`, `:1016`, `:1020`, `:1040`) to presence-required.
- Keep the `:1084` `applyCorrection(context.receipt, correction?.to ?? ...)` path unchanged; `to` is already pinned to `cleanupDerived.listeningAfter` and to `false` at `:982-985`.

## Open items / not done

- **Peer messages not sent.** The brief asked for code-related findings to go to `MetadataEnforce` or `CounterDiagnostics` by exact id. Neither id appears in my visible roster, and inventing one is forbidden. L1 should route this report to the correct metadata-enforcement owner.
- **Snapshot tampering / could-not-evaluate** classification is the separate C2 snapshot slice and is not covered here.
- **Commands L1 should run after integration (not run by this audit):** `node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0 for the committed sidecar); `node scripts/check-aria-metadata.mjs --self-test` (expect new fixtures to reject); `node scripts/check-aria-metadata.mjs --derive <receipt> <pin> --out corpus/evidence/round-14/aria-metadata/corrected.json` only if bytes are intentionally regenerated, then re-check digests in `expected-fixtures.json`. Do not run `--derive` onto the committed path without explicit approval.
- **Tool installs:** none performed by this audit.
