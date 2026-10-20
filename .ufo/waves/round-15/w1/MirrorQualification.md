# MirrorQualification — critic, round 15 w1 (C2 slice)

Scope: does `qualification.everyProofListensBefore`, `everyProofClosed` and `everyProofRefusedAfterClose` each carry a truth derived independently from the historical receipt, and is each one enforced? I only read code. I ran no gates, tests, selftests, counters or browsers, and I edited no source. Every exit-code claim below comes from reading the code. All are marked [INFERENCE].
I installed no tools.

## Source anchors (scripts/check-aria-metadata.mjs @ HEAD 7054a5e, worktree clean apart from .ufo/waves/round-15/)

| Concern | Lines |
|---|---|
| Per-proof value predicates (listeningBefore/closed/listeningAfter/refusedAfterClose/closeError/refusalDetail) | 283-294 |
| Aggregates `derivedClosed` (`every closed===true`), `derivedRefused` (`every refusedAfterClose===true`), `derivedListeningAfter` (`some listeningAfter===true`), `allProofsPass` | 310-322 |
| Exported `derived.cleanup` (it has no `listensBefore` or `notListeningAfter` aggregate) | 411-426 |
| Producer `allValuesOk = cleanupDerived.allProofsPass === true` | 1174 |
| Producer `cleanup` mirror (`allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter`, `summaryServerOk`, `perWorkerCount`) | 1263-1270 |
| Producer `qualification` mirror | 1271-1280 |
| Validator `R14-ARIA-SIDECAR-QUALIFICATION-01` | 1060-1081 |
| Derive gate: emits only when `allProofsPass && complete && listeningAfter===false` | 1333-1344 |
| Selftest tamper-fixture pattern (`clone(sidecarValid)` + mutate + `writeFixture`) | 1742-1763 |
| CLI case grammar (`@fixture`, expectedExit, expectedFindings) | corpus/evidence/round-14/aria-metadata/expected-fixtures.json:205-239 |
| Committed sidecar values (all true, proofCount 1) | corpus/evidence/round-14/aria-metadata/corrected.json:83-92 |

## Findings

### F1 — Not enforced (defect, blocks the C2 "checks all emitted mirrors" claim)
`R14-ARIA-SIDECAR-QUALIFICATION-01` (1060-1075) checks only `qualified`, `status`, `qualification.qualified`, `proofCount`, `allProofsSupportCorrection`, `allProofsComplete` and `everyProofNotListeningAfter`. It never reads `everyProofListensBefore`, `everyProofClosed` or `everyProofRefusedAfterClose`. No validator line reads the `sidecar.cleanup.*` mirror either (grep shows `allClosed`, `allRefusedAfterClose` and `summaryServerOk` appear only in the producer, 1265-1269).

- **Counterexample [INFERENCE]:** take `corrected.json` (or the selftest `sidecar-valid`) and set `qualification.everyProofClosed=false`, or `everyProofRefusedAfterClose="yes"`, or `cleanup.allClosed=false`, or `cleanup.derivedListeningAfter=true`, or delete `qualification.everyProofListensBefore`. The sidecar's `receipt`/`pin`/`proofSet` binding is unchanged, so every sidecar finding still passes and `runCheck` returns exit 0, accepted.
- **Impact:** the emitted claims carry no authority. They look like provenance, but a validator that ignores them cannot certify them.

### F2 — `everyProofListensBefore` is not independently derived (identity conflation)
Line 1276 sets `everyProofListensBefore: allValuesOk`, and `allValuesOk = allProofsPass` (1174). The same single bit is also published under `allProofsSupportCorrection` (1275), `everyProofNotListeningAfter` (1279) and `cleanup.allNotListeningAfter` (1267). That is four field-specific labels for one conjunction over six predicates. `evaluateCleanup` never computes a per-field `listeningBefore` aggregate (411-426).

- **Counterexample [INFERENCE]:** a proof with `listeningBefore:true, closed:true, listeningAfter:false, refusedAfterClose:true, closeError:null, refusalDetail:'ETIMEDOUT'` gives `allProofsPass=false`. `buildSidecar` would then publish `everyProofListensBefore:false`, which is false: every proof did listen before. A proof with `closeError:'x'` breaks `everyProofNotListeningAfter` the same way.
- **Masking:** the derive gate (1339-1344) only emits when `allProofsPass` is true. As a result, the shipped artifact always shows these fields as `true`, and the defect cannot be seen in `corrected.json`. The defect is real: the label claims a per-field derivation that does not exist.

### F3 — `everyProofClosed` / `everyProofRefusedAfterClose` are independently derived (no defect)
Line 1277 uses `cleanupDerived.closed === true` and line 1278 uses `cleanupDerived.refusedAfterClose === true`. Both come from per-proof `every(... === true)` over the receipt (316-321), and both are null-safe on an empty `perWorker` (they become `false` through `=== true`). Pre-evaluation also cross-checks them against the receipt summary through `CLEANUP-CLOSED-01` / `REFUSED-01` (355-382).

There is one tradeoff, not a defect: `refusedAfterClose` aggregates the boolean only. `refusalDetail==='ECONNREFUSED'` and `closeError===null` are enforced only through `allProofsPass`. That is acceptable as long as the label stays field-literal.

There is also one asymmetry: `cleanup.allClosed` / `allRefusedAfterClose` (1265-1266) emit the raw value, which can be `null`, while `qualification.*` coerces it to a boolean. The two mirrors of the same fact can therefore differ in type when `perWorker` is empty. The derive gate makes that unreachable in emitted bytes, but the validator should pin both.

### F4 — Duplicate-authority risk in the obvious fix
If the validator fix compares the sidecar against `buildSidecar(context, preEvaluation)` output, or against the same `allValuesOk` alias, producer and validator share one authority, and F2 gets certified instead of caught. The expected value must be recomputed inside `evaluateSidecar` from `context.receipt.cleanup.server.perWorker`, field by field.

### F5 — Open key set (minor, tradeoff)
`qualification` and `cleanup` are not checked for an exact key set, so a tamper that adds a key like `everyProofAuthenticated:false` is silently accepted. The smallest guard is an exact key-set check against the producer's key list. The canonical judge may reasonably treat this as optional.

## Smallest safe correction (code owner: TabiR15.MetadataEnforce)
1. In `evaluateCleanup` (316-321, 418-421), add independent aggregates: `listensBefore = every(p => p?.listeningBefore === true)` and `notListeningAfter = every(p => p?.listeningAfter === false)`, both null on an empty `perWorker`, and export them in `derived`.
2. In `buildSidecar`, bind `everyProofListensBefore: cleanupDerived.listensBefore === true` and `everyProofNotListeningAfter` / `cleanup.allNotListeningAfter: cleanupDerived.notListeningAfter === true`. Keep `allProofsSupportCorrection: allProofsPass`. For the historical receipt the values and key set stay identical (all true), so the bytes of `corrected.json` / `sidecar-valid` do not change. No historical rewrite is needed and `deriveIdentical` still holds [INFERENCE: the stableStringify input is unchanged].
3. In `R14-ARIA-SIDECAR-QUALIFICATION-01`, or in a new sibling `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`, require each of the following to strictly equal its value recomputed from the receipt, with boolean type:
   - `qualification`: `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` and `everyProofNotListeningAfter`.
   - `cleanup`: `perWorkerCount`, `allClosed`, `allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter` (=== `cleanupDerived.listeningAfter`) and `summaryServerOk` (=== `cleanupDerived.serverOk`).
   - Optionally, an exact key set on both objects.

## Proposed tests (follow the existing pattern at 1742-1763 and the case grammar in expected-fixtures.json)
Every tamper case uses args `--receipt @receipt-old --pin @pin --sidecar @<fixture>` and expects exit 1. The expected finding is `R14-ARIA-SIDECAR-QUALIFICATION-01` for `qualification.*` tampers and the cleanup-mirror finding (or QUALIFICATION-01, if folded in) for `cleanup.*` tampers.

| Fixture | Mutation |
|---|---|
| `sidecar-q-listensbefore` | `qualification.everyProofListensBefore = false` |
| `sidecar-q-closed` | `qualification.everyProofClosed = false` |
| `sidecar-q-refused` | `qualification.everyProofRefusedAfterClose = false` |
| `sidecar-q-nonboolean` | `qualification.everyProofClosed = "true"` (type, not truthiness) |
| `sidecar-q-missing` | delete all three keys |
| `sidecar-c-closed` | `cleanup.allClosed = false` |
| `sidecar-c-refused` | `cleanup.allRefusedAfterClose = false` |
| `sidecar-c-notlistening` | `cleanup.allNotListeningAfter = false` |
| `sidecar-c-derived` | `cleanup.derivedListeningAfter = true` |
| `sidecar-c-serverok` | `cleanup.summaryServerOk = false` |
| `sidecar-c-count` | `cleanup.perWorkerCount = 2` |

Add one in-process selftest assertion for F2. Clone the `receipt-old` proof with `refusalDetail:'ETIMEDOUT'`, run `evaluateAll`, then `buildSidecar`, and assert that `qualification.everyProofListensBefore === true` while `allProofsSupportCorrection === false`. This is reachable only in-process, because the derive gate refuses that receipt by design.

Fixture expectations need no new `fixtures{}` hash entries: only named entries are hash-checked (1765-1780), and `sidecar-valid` is not pinned. Adding `cases[]` entries changes the bytes of `expected-fixtures.json`. That is L1's integration call, because the file is round-14 evidence. The safe option is a round-15 expectations path, or an explicit, recorded amendment.

## Axes impacted
- Calibration (C2): F1 and F2 block the "every emitted mirror is enforced and truthful" contract.
- Provenance/identity: F2 publishes one aggregate under per-field labels; F4 is the duplicate-authority trap.
- No browser, coverage or scalar impact.

## Commands for L1 (after integration; I did not run them)
- `node scripts/check-aria-metadata.mjs --self-test` — the new tamper cases must report exit 1 with the named finding, and `sidecar-valid` must stay accepted.
- `node scripts/check-aria-metadata.mjs` (no args: check mode with `sidecar: null`, lines 2076-2081) — expected exit 1. With no sidecar, the original round-13 receipt is checked and `R14-ARIA-CLEANUP-LISTENING-AFTER-01` reports the historical contradiction, which matches the registry and the previous lesson. This must remain unchanged.
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (or `--sidecar corpus/evidence/round-14/aria-metadata/corrected.json`) — expected exit 0, accepted, with `corrected.json` bytes unchanged. Correction note: an earlier version of this report wrongly said the no-arg run should exit 0. All expectations here come from reading the code; nothing was executed.
- Re-derive into a temp path under the evidence dir and byte-compare it with `corrected.json` (`git diff --exit-code corpus/evidence/round-14/aria-metadata/corrected.json`).
