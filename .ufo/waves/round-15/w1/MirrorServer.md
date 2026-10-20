# MirrorServer: buildSidecar cleanup.server mirrors and nested field completeness

Scope: read-only audit of `buildSidecar` (emitter) against `evaluateSidecar` (acceptor) in `scripts/check-aria-metadata.mjs`, plus the committed sidecar `corpus/evidence/round-14/aria-metadata/corrected.json`. No gates, counters, tests, suites, browser runs, or source edits were executed. Line numbers are from the lane at read time.

## Verdict

The `cleanup.server` **source** predicates are sound. The gap is downstream: the emitted sidecar carries nested `cleanup.*` and `qualification.*` mirrors and several provenance/source fields that the acceptor never recomputes or never reads. A sidecar that mutates those fields still returns `accepted: true`. Nine defects follow. D1 through D3 are the load-bearing ones.

## What is already correct (do not re-litigate)

- Proof predicates are complete. `proofValueProblems` (`scripts/check-aria-metadata.mjs:283-294`) requires `listeningBefore === true`, `closed === true`, `listeningAfter === false`, `refusedAfterClose === true`, `closeError === null`, and `refusalDetail === 'ECONNREFUSED'`. `proofShapeProblems` (`:265-281`) covers the boolean and origin shape.
- The aggregate is recomputed. `evaluateCleanup` (`:296-427`) derives `listeningAfter = some(listeningAfter === true)` (`:312-315`) and checks the summary against it in `R14-ARIA-CLEANUP-LISTENING-AFTER-01` (`:338-354`). It also checks `closed`, `refusedAfterClose`, `ok`, and their top-level mirrors (`:356-395`), plus `R14-ARIA-CLEANUP-COUNT-01` (`:397-409`).
- The top-level `corrections[0]` is tied to the receipt. `from` is checked against the receipt's `cleanup.server.listeningAfter` (`:979-981`), `to` against the derived value (`:982-985`), and `supportingProofs` (`:989-991`).
- The worker, cleanup, and server copies of each proof are deep-compared (`:543-558`). The worker filename is anchored to `worker.index` and `worker.pid` (`:515-516`). Worker digests are anchored in code (`ANCHORS.workers`, `:69-72`, checked at `:747-749`).
- `proofValueProblems` checks `listeningBefore`, so `qualification.everyProofListensBefore` is backed by a real predicate. It is not a defect.
- The derive path self-validates. `derive` writes the sidecar to a temp file and re-runs `evaluateSidecar` (`:1376-1378`). It writes only if `accepted` and `postEvaluation.ok` (`:1381-1390`). Any field that is checked is therefore enforced at derive time too.

## Field inventory: emitted by `buildSidecar` (`:1151-1282`) vs read by `evaluateSidecar` (`:853-1109`)

| Emitted path (buildSidecar) | Source line | Read by acceptor? | Acceptor anchor |
|---|---|---|---|
| `schema`, `kind`, `wave`, `claim` | 1176-1179 | schema/kind only, with fallback (D7) | `:897-906` |
| `qualified`, `status` | 1180-1181 | yes | `:1061-1062` |
| `browserExecuted`, `derivedFromHistoricalRuntime` | 1182-1183 | yes | `:1037-1038` |
| `execution.browser`, `execution.browserExecuted`, `execution.newBrowserRun` | 1185-1187 | browser yes; browserExecuted and newBrowserRun optional (D6) | `:1039-1043` |
| `execution.source` | 1188 | **no** (D7) | — |
| `provenance.*` | 1191-1196 | yes (note checked non-empty) | `:1044-1055` |
| `original.receipt.{path,sha256,bytes}`, `original.pin.{path,sha256,bytes}` | 1198, 1166-1172 | sha yes; path non-empty only; bytes optional (D4, D6) | `:909-945` |
| `source.receipt.*`, `source.pin.*` | 1200-1201 | sha yes; path and bytes **no** (D4) | `:912-933` |
| `source.producer.{path,role}` | 1202-1206 | sourceSha256 yes; path and role **no** (D3) | `:959-960` |
| `source.spec.{path,sha256}` | 1207-1210 | **no** (D3) | — |
| `source.manifest.{path,sha256}` | 1211-1214 | **no** (D3) | — |
| `binding.receiptSha256`, `binding.pinSha256` | 1217-1218 | yes | `:912-933` |
| `binding.proofSetSha256`, `binding.perWorker[]` | 1219-1220 | yes | `:946-955` |
| `binding.producerSourceSha256` | 1221 | yes | `:956-958` |
| `corrections[0].{path,from,to}` | 1225-1227 | yes | `:976-985` |
| `corrections[0].value` | 1228 | **optional** (D5) | `:986-988` |
| `corrections[0].derived`, `corrections[0].rule`, `corrections[0].supportingProofs` | 1229-1233 | supportingProofs yes; derived and rule **no** (D5) | `:989-991` |
| `correction.{field,pointer,observed,corrected,derived,supportingProofs,rule}` | 1237-1245 | all but `rule` | `:992-998` |
| `node.{observed,recorded,exactMatch,minimumMajor,minimumMajorSatisfied,descriptiveOnly,recordedRole,recordedIsDescriptive}` | 1248-1257 | yes | `:1010-1030` |
| `node.exactRecordedMatch`, `node.observedMatchesRecorded` | 1250-1252 | **optional** (D6) | `:1016-1023` |
| `node.note` | 1258-1261 | **no** (acceptable: descriptive text, but see D9) | — |
| `cleanup.perWorkerCount`, `cleanup.allClosed`, `cleanup.allRefusedAfterClose`, `cleanup.allNotListeningAfter`, `cleanup.derivedListeningAfter`, `cleanup.summaryServerOk` | 1264-1269 | **none of them** (D1) | — |
| `qualification.qualified`, `proofCount`, `allProofsComplete`, `allProofsSupportCorrection`, `everyProofNotListeningAfter` | 1272-1279 | yes, but only as `=== true` against the sidecar's own claim, not recomputed (D2) | `:1061-1075` |
| `qualification.everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` | 1276-1278 | **no** (D2) | — |

Committed `corrected.json` agrees with the emitter on every field above (cleanup at `:16-23`; qualification at `:83-92`; source at `:95-119`; corrections at `:33-43`; execution at `:45-50`).

## Defects

### D1 — HIGH — The whole `cleanup` mirror is unread
- **Source:** `buildSidecar` emits `cleanup` at `scripts/check-aria-metadata.mjs:1263-1270`. `evaluateSidecar` never reads `sidecar.cleanup` (grep: no reference in `:853-1109`).
- **Counterexample:** take `corpus/evidence/round-14/aria-metadata/corrected.json`, set `cleanup.allClosed` to `false` and `cleanup.derivedListeningAfter` to `true`. The acceptor still returns `accepted: true`, because the only checks are `correction.to` (`:982`) and `derived_not_false` (`:1001`), and neither reads `cleanup.*`.
- **Proposed mutation:** after `:1001`, add a recompute block (see D9 for the preferred form). Minimal form: for each of `perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`, require `sidecar.cleanup?.<key> === <recomputed>`, with recomputed values taken from `cleanupDerived` (`closed`, `refusedAfterClose`, `listeningAfter`, `serverOk`, `perWorkerCount`) and from `every(p.listeningAfter === false)` for `allNotListeningAfter`. Push `'cleanup.<key>'` into `correctionProblems` on mismatch.

### D2 — HIGH — Three `qualification` mirrors are unread, and the read ones are not recomputed
- **Source:** `buildSidecar:1276-1278` emits `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose`. `evaluateSidecar:1067-1074` reads only `allProofsSupportCorrection`, `allProofsComplete`, and `everyProofNotListeningAfter`, and only tests that they are `=== true`.
- **Counterexample:** set `qualification.everyProofClosed = false` in a valid sidecar. It passes `R14-ARIA-SIDECAR-QUALIFICATION-01` (the three read keys are still true).
- **Proposed mutation:** in `evaluateSidecar`, extend `qualificationProblems` (`:1060-1075`) with `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` (each must be `=== true`). Then, to make the test non-circular, compare each `qualification.*` boolean to its recomputed value from the receipt proofs, not to `=== true`: `every(p.listeningBefore === true)`, `every(p.closed === true)`, `every(p.refusedAfterClose === true)`, `every(p.listeningAfter === false)`.

### D3 — HIGH — `source.spec` and `source.manifest` digests are unbound
- **Source:** `buildSidecar:1207-1214` emits `source.spec.sha256 = ANCHORS.specSha256` and `source.manifest.sha256 = ANCHORS.manifestSha256`. `evaluateSidecar` (`:908-968`) checks `source.producer.sourceSha256` (`:959-960`) but nothing under `source.spec` or `source.manifest`.
- **Counterexample:** set `source.spec.sha256` to `"0"*64` in a valid sidecar. `R14-ARIA-SIDECAR-BINDING-01` still passes.
- **Anchors that already exist and should be reused:** `ANCHORS.specSha256` (`:62-68`) and `ANCHORS.manifestSha256` are already enforced for the receipt side in `R14-ARIA-SOURCE-01` (`:613-645`, `:621-623`, `:642-643`). The sidecar side is simply not enforced.
- **Proposed mutation:** in the binding block (`:956-961`), add:
  - `if (source.spec?.sha256 !== ANCHORS.specSha256) bindingProblems.push('source.spec.sha256');`
  - `if (source.manifest?.sha256 !== ANCHORS.manifestSha256) bindingProblems.push('source.manifest.sha256');`
  - `if (source.producer?.path !== SOURCE_PATHS.producer) bindingProblems.push('source.producer.path');`
  - `if (source.spec?.path !== SOURCE_PATHS.spec) bindingProblems.push('source.spec.path');`
  - `if (source.manifest?.path !== SOURCE_PATHS.manifest) bindingProblems.push('source.manifest.path');`

  Path equality for these is safe: they are constants (`SOURCE_PATHS`, `:75-80`) and are not the per-run receipt/pin labels (see D4).

### D4 — MEDIUM — Byte counts are optional or unread; path labels are unchecked
- **Source:** `evaluateSidecar:940-945` checks `original.receipt.bytes` and `original.pin.bytes` only `if !== undefined` (optional). `source.receipt.bytes`, `source.pin.bytes`, and all `source.*.path` are never read. `original.*.path` is only tested as non-empty (`:934-939`).
- **Counterexample:** delete `original.receipt.bytes`; it passes. Set `source.receipt.bytes` to 1; it passes.
- **Proposed mutation:**
  - Make the byte checks mandatory: `if (original.receipt?.bytes !== context.receiptRead.entry.bytesLength) bindingProblems.push('original.receipt.bytes');` and the same for `original.pin.bytes`, `source.receipt.bytes`, `source.pin.bytes`. Drop the `!== undefined` guard.
  - Do not add path-equality for `original.*.path` or `source.receipt|pin.path`. The self-test fixture `sidecar-auto` (`scripts/check-aria-metadata.mjs:1758-1763`) sets those to absolute tmp paths and expects acceptance (`expected-fixtures.json`, case `sidecar-auto-detect-check-input`, `expectedExit: 0`). Path labels are intentionally non-authoritative; the digests bind the bytes. If path equality is wanted, first update that fixture expectation; that is a scope decision for L1.

### D5 — MEDIUM — `corrections[0]` mirror fields are optional or unchecked
- **Source:** `evaluateSidecar:986-988` only checks `value` `if (correction?.value !== undefined && ...)`. `corrections[0].derived` and `corrections[0].rule` are never read. `correction.rule` (`buildSidecar:1243-1245`) is also never read.
- **Counterexample:** delete `corrections[0].value`, or set `corrections[0].derived = true`. Both pass.
- **Proposed mutation:** replace `:986` with `if (correction?.value !== correction?.to) correctionProblems.push('corrections[0].value');`. Add `if (correction?.derived !== cleanupDerived.listeningAfter) correctionProblems.push('corrections[0].derived');`. Add `if (correction?.rule !== RULE_TEXT) correctionProblems.push('corrections[0].rule');` and the same for `mirror.rule`, with `RULE_TEXT` extracted to one constant used by `buildSidecar:1232-1233` and `:1244-1245`. Extracting it removes the duplicated literal that can drift.

### D6 — MEDIUM — Emitted fields are optional on read
- **Source:** these are always emitted by `buildSidecar` but skipped when absent in the acceptor:
  - `node.exactRecordedMatch` (`:1016`), `node.observedMatchesRecorded` (`:1020`)
  - `execution.browserExecuted` (`:1040`), `execution.newBrowserRun` (`:1042`)
  - `original.receipt.bytes` (`:940`), `original.pin.bytes` (`:943`)
- **Counterexample:** delete `node.exactRecordedMatch` or `execution.newBrowserRun` from a valid sidecar; it passes. Deleting `execution.newBrowserRun` also removes the only signal that a new browser run did not happen.
- **Proposed mutation:** treat presence as required. Replace each `!== undefined &&` guard with a strict `!==` comparison against the expected literal or computed value. Example: `if (sidecarNode?.exactRecordedMatch !== node.exactMatch) nodeProblems.push('node.exactRecordedMatch');`, and `if (sidecar?.execution?.newBrowserRun !== false) provenanceProblems.push('execution.newBrowserRun');`.

### D7 — MEDIUM — Schema can be bypassed; `execution.source` and `wave`/`claim` are unread
- **Source:** `schemaOk` (`:897-901`) accepts `sidecar.schema === SIDECAR_SCHEMA` OR any object whose `kind` matches `/metadata/i` and `/correct/i`. A sidecar with no `schema` field and a matching `kind` passes `R14-ARIA-SIDECAR-SCHEMA-01`. The `--check` router uses the same fallback (`:2038-2040`).
- `execution.source` (`buildSidecar:1188`, value `'historical-static-bytes'`) is never read. `wave` and `claim` (`:1178-1179`) are never read.
- **Counterexample:** delete `schema` from `corrected.json`; it still passes. Set `execution.source` to `"live-browser"`; it still passes.
- **Proposed mutation:** `schemaOk = sidecar?.schema === SIDECAR_SCHEMA && sidecar?.kind === 'cleanup-and-node-metadata-correction'`. Remove the regex fallback at `:897-901` and at `:2038-2040`. Add `if (sidecar?.execution?.source !== 'historical-static-bytes') provenanceProblems.push('execution.source');`. Add `wave` and `claim` equality against `context.receipt.wave ?? 'tabi-round-13-w1'` and `context.receipt.claim ?? 'C2'`, mirroring `:1178-1179`.

### D8 — MEDIUM — Four emitted qualification/cleanup fields are aliases of one boolean
- **Source:** `buildSidecar:1174` sets `allValuesOk = cleanupDerived.allProofsPass`. It is then reused for `cleanup.allNotListeningAfter` (`:1267`), `qualification.allProofsSupportCorrection` (`:1275`), `qualification.everyProofListensBefore` (`:1276`), and `qualification.everyProofNotListeningAfter` (`:1279`).
- **Consequence:** `allNotListeningAfter` is named as a listeningAfter predicate but is the conjunction of every proof predicate. A reader or a mutation test cannot tell which predicate failed. A single-bit mutation in one alias is indistinguishable from the others.
- **Proposed mutation:** compute each field from its own predicate in `buildSidecar`:
  - `everyProofListensBefore = proofs.every(p => p?.listeningBefore === true)`
  - `everyProofClosed = proofs.every(p => p?.closed === true)`
  - `everyProofRefusedAfterClose = proofs.every(p => p?.refusedAfterClose === true)`
  - `everyProofNotListeningAfter = proofs.every(p => p?.listeningAfter === false)`
  - `allNotListeningAfter` = same as `everyProofNotListeningAfter`
  - `allProofsSupportCorrection = cleanupDerived.allProofsPass` (keep)
  - Guard all four with `proofs.length > 0` (empty `every` is vacuously true; see ClaimSeparation and ReviewSecurity RS-5).

### D9 — LOW (structural, closes D1 through D8 at once) — Acceptor has no whole-object recompute
- **Observation:** `evaluateSidecar` checks fields one at a time. Each new emitted field needs a new check, and any field nobody added is silently unchecked. The derive path already recomputes the whole object (`:1341-1392`, `buildSidecar` then compare). Check mode does not.
- **Proposed mutation:** in `evaluateSidecar`, after `:1007`, build the expected object via `buildSidecar({ context, preEvaluation, receiptLabel: sidecar.original?.receipt?.path, pinLabel: sidecar.original?.pin?.path })` and compare with `stableStringify` after removing exactly these label fields from both sides: `original.receipt.path`, `original.pin.path`, `source.receipt.path`, `source.pin.path`. Emit one finding `R14-ARIA-SIDECAR-RECOMPUTE-01` with the differing dotted paths (a recursive key diff). This is the only check that closes unknown nested fields.
- **Caveat:** the recompute reuses the same `buildSidecar` as the emitter, so a shared producer bug would not be caught. That is why D2 and D8 require per-field predicates computed independently from the proofs, and why the fixture expectations in D10 pin concrete values.
- **Node note:** `node.note` (`:1258-1261`) is a derived prose string; it is covered by the recompute, not by a bespoke check.

### D10 — Schema, kind, and label gaps are caught by a fixture batch, not by today's expectations
Proposed fixtures derived from `sidecar-valid` in the self-test block (`scripts/check-aria-metadata.mjs:1741-1763`, same pattern as `sidecar-wrongto` and `sidecar-exactnode`), each with an expected finding id in `expected-fixtures.json`. "Red today" means the acceptor currently accepts it, so the test would fail before the fix:

| Fixture (mutation of sidecar-valid) | Expected finding | Red today? |
|---|---|---|
| `sidecar-cleanup-allclosed-false`: `cleanup.allClosed=false` | R14-ARIA-SIDECAR-RECOMPUTE-01 (or a new cleanup-mirror id) | yes |
| `sidecar-cleanup-derived-true`: `cleanup.derivedListeningAfter=true` | same | yes |
| `sidecar-qual-everyproofclosed-false` | R14-ARIA-SIDECAR-QUALIFICATION-01 | yes |
| `sidecar-qual-listensbefore-false` | R14-ARIA-SIDECAR-QUALIFICATION-01 | yes |
| `sidecar-spec-digest-zero`: `source.spec.sha256 = "0"*64` | R14-ARIA-SIDECAR-BINDING-01 | yes |
| `sidecar-manifest-digest-zero`: `source.manifest.sha256 = "0"*64` | R14-ARIA-SIDECAR-BINDING-01 | yes |
| `sidecar-missing-correction-value`: delete `corrections[0].value` | R14-ARIA-SIDECAR-CORRECTION-01 | yes |
| `sidecar-correction-derived-wrong`: `corrections[0].derived=true` | R14-ARIA-SIDECAR-CORRECTION-01 | yes |
| `sidecar-missing-node-exactrecorded`: delete `node.exactRecordedMatch` | R14-ARIA-SIDECAR-NODE-CLAIM-01 | yes |
| `sidecar-missing-newbrowserrun`: delete `execution.newBrowserRun` | R14-ARIA-SIDECAR-PROVENANCE-01 | yes |
| `sidecar-missing-original-bytes`: delete `original.receipt.bytes` | R14-ARIA-SIDECAR-BINDING-01 | yes |
| `sidecar-source-receipt-bytes-wrong`: `source.receipt.bytes=1` | R14-ARIA-SIDECAR-BINDING-01 | yes |
| `sidecar-no-schema-kind-only`: delete `schema` | R14-ARIA-SIDECAR-SCHEMA-01 | yes |
| `sidecar-execution-source-live`: `execution.source="live-browser"` | R14-ARIA-SIDECAR-PROVENANCE-01 | yes |
| `sidecar-wave-changed`: `wave="tabi-round-14-w1"` | R14-ARIA-SIDECAR-RECOMPUTE-01 | yes |

Controls that must stay green: `sidecar-valid` (`R14-ARIA-SIDECAR-ACCEPTED-01` pass) and `sidecar-auto` (absolute label paths, `--check` exit 0). The `derive-deterministic-sidecar` check (`:1866-1890`) must remain byte-identical.

Note: `sidecar-wrongto`, `sidecar-exactnode`, and `sidecar-baddigest` already exist and must not change.

## Proposed mutation list (exact, ordered)

1. `scripts/check-aria-metadata.mjs:897-901` and `:2038-2040`: drop the `kind` regex fallback. `schemaOk` requires `schema === SIDECAR_SCHEMA`.
2. `:956-961`: add the `source.spec`, `source.manifest`, `source.producer.path`, `source.spec.path`, `source.manifest.path` checks from D3.
3. `:939-945`: make `original.*.bytes` mandatory; add `source.receipt.bytes` and `source.pin.bytes` checks against `context.receiptRead.entry.bytesLength` and `context.pinRead.entry.bytesLength` (D4).
4. `:986-991`: make `corrections[0].value` mandatory and equal to `to`; add `corrections[0].derived` and `corrections[0].rule` (D5).
5. `:1016-1023` and `:1040-1043`: make `node.exactRecordedMatch`, `node.observedMatchesRecorded`, `execution.browserExecuted`, `execution.newBrowserRun` mandatory (D6).
6. `:1060-1075`: add `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` to the qualification set (D2).
7. `:1174`, `:1267`, `:1275-1279` in `buildSidecar`: split the alias into per-predicate `every()` values with `proofs.length > 0` guards (D8).
8. After `:1007`: add the whole-object recompute `R14-ARIA-SIDECAR-RECOMPUTE-01` with the four label-path exclusions (D9).
9. `:1188`, `:1178-1179`: add `execution.source`, `wave`, `claim` equality (D7).
10. `:1232-1233` and `:1244-1245`: extract the RULE literal to one constant (D5).
11. `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` and the self-test block at `:1741-1763`: add the D10 fixtures and expectations. Keep `sidecar-valid` and `sidecar-auto` unchanged.

Do not modify `corpus/evidence/round-14/aria-metadata/corrected.json` or `corpus/evidence/round-13/aria/receipt.json`. The sidecar is an immutable accepted artifact for this round. If D8 or D9 changes emitted field values, the committed corrected.json will no longer match `buildSidecar` output. That is a scope decision for L1: either keep check-mode recompute non-byte-strict for committed sidecars, or re-derive into a new round-15 sidecar path and leave the round-14 file byte-for-byte.

## Commands L1 should run after integration (not executed by this agent)

- `node scripts/check-aria-metadata.mjs --self-test` (all D10 fixtures, plus existing `sidecar-valid` and `sidecar-auto` controls).
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (committed sidecar must stay accepted after D2 through D9).
- `node scripts/check-aria-metadata.mjs --witness --receipt corpus/evidence/round-13/aria/receipt.json --pin corpus/evidence/round-13/aria/runtime-pin.json --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` (witness must still be red-to-clean).
- `sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json corpus/evidence/round-14/aria-metadata/corrected.json` (historical bytes must match `ANCHORS.receiptSha256` `b458b351…`, `pinSha256` `4d894756…`, and the committed sidecar's recorded digest).

## Residual risk and gaps

- The acceptor recomputes from the same `buildSidecar` after D9. A shared bug in `buildSidecar` would be invisible to D9 alone. D2 and D8 mitigate this with independent `every()` predicates; the D10 fixtures pin concrete literal values.
- Path labels (`original.*.path`, `source.*.path` for receipt and pin) are intentionally non-authoritative. Digests and bytes are authoritative. This is a deliberate trade-off that `sidecar-auto` encodes.
- I did not verify the worker-file snapshot tamper path (the C2 "could-not-evaluate" classification). That is a separate slice (`TamperWitness` / `QualityTamper`).
- I did not run any command. All line numbers are from reading the file at lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Tool installs: none.

## Messages

- Summary pointer sent to `TabiR15` (the planner seat). I did not message `MetadataEnforce` or `CounterDiagnostics`: neither exact id is visible in my roster, and the contract forbids guessing names.
