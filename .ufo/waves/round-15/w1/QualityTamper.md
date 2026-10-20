# QualityTamper — round 15 w1 (C2 tamper classification, mirror enforcement, selftest oracle)

Role: scribe, read-only audit. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Executed by me: reads, `git show HEAD:… | sha256sum`, `git status`/`git diff --stat`, `ls`, `wc -l`, and `sha256sum` over the anchored inputs. No gate, self-test, counter, test, browser, edit, install, or commit. Tool installs: none.

## Moving target (read first)

`scripts/check-aria-metadata.mjs` was being edited by a sibling (MetadataEnforce lane) while I read it. I observed at least six distinct states (file tags FB3C → B7CF → 22D6 → 80EA → 94F5 → A4B3; 2263 → 2356 → 2468 → 2479 lines). Every line anchor below is tagged with the state it was observed in. The final state I hashed is `sha256 0f8ae0042b723158939643e5c3d68214f058e9543e45905a89078a212dc542e2`, 2479 lines. Re-verify all anchors at integration.

Baselines:
- HEAD `e570380` gate: `sha256 ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6`, 2263 lines. This matches `LEGACY_ROUND14.checkerSha256` in the working tree and the round-14 digest in the lesson, so HEAD anchors below are reliable.
- Working tree vs HEAD: `git diff --stat HEAD` over `scripts/check-aria-metadata.mjs` and `SKILL.md` = 260 insertions, 17 deletions in total. `corpus/evidence/round-13` and `round-14` are unchanged vs HEAD.

## Axes

- A1 exit taxonomy: exit 0 clean / exit 1 semantic invalidity / exit 2 could-not-evaluate, with stable reason and finding ids. Required by the round-15 spec: "Snapshot/input digest mismatches must emit stable snapshot_tampered and exit2 could-not-evaluate, distinct from semantic invalidity exit1."
- A2 mirror coverage: every field `buildSidecar` emits under `cleanup`/`qualification`/`correction`/`node`/`source` is independently recomputed and checked.
- A3 selftest oracle independence: persisted literal expectations, exact finding sets, every refusal class asserted, every generated fixture pinned.
- A4 snapshot identity coverage and binding: every authenticated input is hashed before semantic evaluation, and the bytes hashed are the bytes evaluated.

## Summary verdict

C2 is not a verified 0→1 at the observed state. The working tree contains the right design (header lines 22–26, constants 83–94, `verifySnapshot` 869–909, `tamperOutcome` 911–930, `mirrorFieldProblems` 932–947, `expectedMirrorValues` 949–979, `LEGACY_ROUND14` 120–142; all at state A4B3 unless noted), but:

1. None of `verifySnapshot`, `tamperOutcome`, `mirrorFieldProblems`, `expectedMirrorValues` has a call site. `runCheck`, `runDerive`, and `runWitness` still return exit 0/1 only. Grep for `EXIT.`, `REASON.`, `TAMPER_FINDING` shows definitions plus the body of `tamperOutcome`, nothing else.
2. `DEFAULT_EXPECTATIONS` (line 74) and `DEFAULT_MIRROR_CONTRACT` (line 75) point to `corpus/evidence/round-15/metadata/*`. That directory does not exist (`ls`). Self-test therefore hits the blocked branch (`ARIA_METADATA_SELFTEST verdict=blocked`, exit 1; observed at state 22D6 lines 1757–1759) on every run until the file lands.
3. HEAD has no classification at all: every anchor or digest drift is a `fail` finding, so exit 1. The lane SKILL registry row (`SKILL.md:1755`) already promises "0 clean, 1 failed, 2 could-not-evaluate" over behaviour that exists only as the uncalled helpers above.

## Current bytes match the anchors (safe to wire)

Read-only `sha256sum` against the `ANCHORS` constants (HEAD lines 62–73):

| input | path | sha256 | = anchor |
|---|---|---|---|
| receipt | corpus/evidence/round-13/aria/receipt.json | b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7 | yes |
| pin | corpus/evidence/round-13/aria/runtime-pin.json | 4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2 | yes |
| manifest | corpus/evidence/round-13/aria/manifest.json | 56764241df4f4a644af39e368b2e47f35d3f4bbbdf17e7cef3fa848ee0d72112 | yes |
| spec | corpus/evidence/round-13/aria/aria-loopback.spec.mjs | 03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc | yes |
| config | corpus/evidence/round-13/aria/playwright.config.mjs | 87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4 | yes |
| producer | scripts/aria-loopback-round13.mjs | 1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c | yes |
| worker | corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json | 0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7 | yes |

The worker directory holds exactly one `*.json`, the same file. Wiring `verifySnapshot` on the current bytes produces no false tamper on canonical inputs.

## Findings

### F1 — Tamper classification is unwired (blocking, A1)
- Observed: `tamperOutcome` (911) sets `exit: EXIT.couldNotEvaluate` (2), `reason: snapshot_tampered`, finding `R14-ARIA-SNAPSHOT-TAMPERED-01` with status `could_not_evaluate`, and `semanticEvaluation: 'skipped'`. Its only caller is itself. Nothing reaches it.
- Consequence at HEAD: `runCheck` (HEAD 1111–1143) returns `exit: ok ? 0 : 1`. Canonical tamper is therefore exit 1, indistinguishable from `old-contradiction`. The fatal branch (HEAD 2247–2262) also returns 2, but as `verdict=red` with no finding id. An exit 2 from a thrown exception is therefore not distinguishable from an authenticated-snapshot classification. QUALITY #17 (lines 48–53) requires asserting the actual cause, not "any exception".
- Fix: call `verifySnapshot()` first in `runCheck`, `runDerive` (1413+), and `runWitness` (1568+). On mismatch return `tamperOutcome`. Give the fatal branch its own id (for example `R14-ARIA-INTERNAL-ERROR-01`, exit 2) so tests can separate the two.

### F2 — Snapshot scope and ordering (A4; must be fixed before wiring)
Evidence at state A4B3:
- (a) `verifySnapshot` line 897: `if (!entry.ok) continue;`. Missing, symlinked, non-regular, or unreadable anchored inputs are silently skipped. They should be `could_not_evaluate` with a refusal finding (proposed `R14-ARIA-INPUT-REFUSED-01`, reason from `readEntry`). The `readEntry` refusal codes (HEAD 172–177: `symlink`, `not_regular`, and ELOOP at 186) are already there.
- (b) The checks at lines 873–883 use fixed canonical constants (`DEFAULT_RECEIPT`, `DEFAULT_PIN`, …), not the `--receipt`/`--pin` arguments that semantic evaluation actually reads. A non-canonical receipt+pin pair can therefore pass the snapshot clean and still reach semantic evaluation. This is the path-gating problem: HEAD `evaluateAnchors` (813–850) gates receipt/pin anchors on canonical path equality, while manifest/spec/config/workers are unconditional. Decision for L1: either hash the evaluated paths, or refuse non-canonical inputs in `--check`/`--witness`/`--derive` with `could_not_evaluate` (reason `non_canonical_input`). If the second option is chosen, the tmp-fixture self-tests must move to an explicit fixture-root mode. Do not silently keep them on the canonical-only path.
- (c) Worker directory membership is not in the snapshot. An extra `*.json` in `WORKER_DIR` is only a semantic `R14-ARIA-WORKER-SET-01` failure (HEAD `loadWorkerContext`, `directory_set_mismatch`). Directory identity drift is snapshot drift and should be `snapshot_tampered`.
- (d) Ordering: `prepareContext` (HEAD 776–824) and `runDerive` (1424–1425 at A4B3) run `evaluateAll` before any snapshot check. Snapshot verification must precede semantic evaluation in every entry point.
- (e) Optional, for L1: anchor the committed `corpus/evidence/round-14/aria-metadata/corrected.json` (sha `e156b922…a56745`, per lesson) for the canonical `--check`. Currently the accepted correction is bound only by verification evidence, so a tampered canonical sidecar gives exit 1 (BINDING), not `snapshot_tampered`.

### F3 — Mirror enforcement exists but is unwired, and the emitter disagrees with the recomputation (A2)
- The checker side is correct. `expectedMirrorValues` (949–979) recomputes each field from raw proofs with per-field predicates (`every(listeningAfter===false)`, `every(listeningBefore===true)`, and so on). `CLEANUP_MIRROR_FIELDS` (98–106) and `QUALIFICATION_MIRROR_FIELDS` (106–116) enumerate every emitted key. `mirrorFieldProblems` (932–947) checks key sets, types, and values. None of this is called.
- The emitter still mislabels. `buildSidecar` (state A4B3 lines 1390, 1483, 1491, 1492, 1495) sets `allValuesOk = cleanupDerived.allProofsPass`, a conjunction over closed/refused/closeError/refusalDetail too, and uses it for `cleanup.allNotListeningAfter`, `qualification.allProofsSupportCorrection`, `everyProofListensBefore`, and `everyProofNotListeningAfter`. Those names are single-field predicates.
- Consequence once wired: `derive` could emit a sidecar that its own strict check rejects on a proof set where a single field differs from the conjunction. Example: `listeningAfter=false` with `closed=false`. Fix: have `buildSidecar` take its mirror values from `expectedMirrorValues` (one source of truth), not from `allValuesOk`.
- Committed evidence still checks out on paper. The committed `corrected.json` has one proof (`listeningBefore`, `closed`, `refusedAfterClose` true; `listeningAfter` false), so every per-field predicate equals `allValuesOk` = true. The strict check should still accept it. L1 must confirm by running `--check` (not done here).
- `LEGACY_ROUND14` (120–142) records that the round-14 checker compared only five qualification fields. This is the right disclosure, and it implies the new checker must reject mutated mirrors on new outputs while still accepting the historical bytes.
- Node note (state A4B3 line 1477): buildSidecar still emits `…is the enforced floor`, unqualified. This is routed item 1 in `round-14-verifier-spotcheck.md:184`. The header (lines 11–16) now says the floor is "enforced retrospectively by THIS checker"; the emitted note should say the same. The historical producer does not read `pin.node` (verifier line 129).

### F4 — Schema check (resolved in evaluateSidecar; residual routing laxity, low)
- At A4B3 `evaluateSidecar` line 1102 is strict: `schemaOk = sidecar?.schema === SIDECAR_SCHEMA`. The loose `kind`-regex alternative that was present at state 22D6 (`/metadata/` and `/correct/` on `kind`) is gone from this function.
- Residual: `resolveCheckInput` (2254–2256) still routes any file whose `kind` matches the regex as a sidecar. The strict check then rejects it (exit 1), so this is a routing inconsistency, not an acceptance hole. Route on `schema` alone.

### F5 — Selftest oracle (blocking for C2 evidence, A3)
Observed at the cited states:
- (a) Expectations file missing (see Summary item 2). Self-test cannot produce a verdict.
- (b) Blocked branch exits 1 (22D6 lines 1757–1759; `expectRead` failure path). Should be `could_not_evaluate`, exit 2, with a finding id.
- (c) Printed finding echoes the expectation. `finding: testCase.expectedFindings?.[0]?.id ?? payload?.redFinding ?? 'none'` (A4B3 2075) feeds `expected_finding=${…} finding=${…}` (A4B3 2136). A PASS line and a FAIL line both print the expected id. Observed finding ids are not printed.
- (d) Exact sets are not enforced. For exit-1 cases only presence of each listed finding is checked (A4B3 2062–2065). For exit-0 cases only unexpected `fail`s are rejected (2059–2060). A mutation that adds unrelated failures to an exit-1 case still passes.
- (e) Floor: `results.length >= 4` (A4B3 2114).
- (f) Pinning: committed `expected-fixtures.json` (round-14, unchanged vs HEAD) pins 8 fixtures (`malformed-receipt`, `pin`, `receipt-empty`, `receipt-green`, `receipt-min`, `receipt-missing-summary`, `receipt-nonboolean`, `receipt-old`). The sidecar fixtures `sidecar-valid`, `sidecar-baddigest`, `sidecar-wrongto`, `sidecar-exactnode`, `sidecar-auto` are generated (HEAD 1741–1763) and never pinned; the fixture loop (1845–1860 at 22D6) iterates only expectation keys. The acceptance-path fixture is therefore not pinned at all.
- (g) Self-generated oracle: `sidecar-valid` is produced by `buildSidecar`, the same code under test. A digest pin on it is a regression pin, not independent content validation. Independence needs literal expected mirror values per fixture (the derive-determinism case at 1964–1973 compares `buildSidecar` to itself and to that file; it is code-literal and not persisted).
- (h) Zero exit-2 cases. The committed expectations contain 15 CLI cases, all exit 0 or 1. `readEntry` refuses symlink/non-regular/ELOOP (HEAD 172–177, 186), and nothing asserts it. QUALITY #6 (lines 10–12) requires each refusal to be asserted with an expected exit/finding pair. Template: `scripts/check-sources.mjs:70–72` (`symlinked-registry`, `non-regular-registry`, `missing-file` → exit 2 `could_not_evaluate`) and the runner at 512–517 (exact exit and exact finding regex).
- (i) Tamper branch unreachable from tmp fixtures. Receipt/pin anchor checks are path-equality gated (HEAD 733–738), so tmp fixtures never trigger them. Proposed copy-tree harness (T4).

### F6 — Routed-items status (round-14 verifier, `round-14-verifier-spotcheck.md:184–189`)
- Item 1 (metadata enforcement wording): partly addressed in the header; the emitted note is not (F3).
- Item 2 (mirror validation and 15+1 tally): mirror tables and recomputation exist, not wired (F3); tally wording must be "15 CLI cases plus one deterministic helper" until the new suite lands.
- Item 3 (tamper classification): constants, `verifySnapshot`, `tamperOutcome` exist, not wired (F1, F2).
- Item 4 (USER counter diagnostics): outside this slice. Not audited here.
- Items 5–6: traceability and inherited boundaries, not in this slice.

## Proposed tests (literal expectations; put in a NEW round-15 expectations file)

Keep `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` byte-identical (historical; `git diff` already clean). Create the round-15 file as the authoritative oracle and record the migration (for example `malformed-receipt`: exit 1 `R14-ARIA-INPUT-01` becomes exit 2 once refusals move; state that change explicitly, do not edit the old file).

- T1 `snapshot-receipt-byte` — copy tree (below), flip one byte in `receipt.json`. Expect exit 2, `R14-ARIA-SNAPSHOT-TAMPERED-01` status `could_not_evaluate`, reason `snapshot_tampered`, `semanticEvaluation: skipped`, mismatch label `receipt`.
- T2 `snapshot-pin-byte` → exit 2, label `pin`.
- T3 `snapshot-manifest-byte` → exit 2, label `manifest`.
- T4 `snapshot-spec-byte` / `snapshot-config-byte` → exit 2, labels `spec` / `config`.
- T5 `snapshot-producer-byte` (`scripts/aria-loopback-round13.mjs`) → exit 2, label `producer`.
- T6 `snapshot-worker-byte` → exit 2, label `worker:worker-0-1530637-1792474958700.json`.
- T7 `snapshot-worker-extra-file` (add `worker-0-0-0.json`) → exit 2 (after F2c is implemented).
- T8 `refusal-receipt-symlink`, `refusal-receipt-directory`, `refusal-receipt-missing`, `refusal-sidecar-missing` → exit 2, finding `R14-ARIA-INPUT-REFUSED-01` with the exact reason. (Missing sidecar class is an L1 decision.)
- T9 `original-contradiction-exact-set` — `receipt.json` unchanged, no sidecar → exit 1, failing-id set equals exactly `{R14-ARIA-CLEANUP-LISTENING-AFTER-01}`.
- T10 `sidecar-valid-accepted-pinned` — pin the generated `sidecar-valid` digest AND literal mirror values per key from `expectedMirrorValues`.
- T11 mirror mutations on the valid sidecar, one per key in `CLEANUP_MIRROR_FIELDS`/`QUALIFICATION_MIRROR_FIELDS`, each with a flipped value → exit 1 with the mirror finding id and an exact fail set.
- T12 multi-proof edge: two proofs, `listeningAfter=false` on both, one `closed=false`. Expect `derive` output's `cleanup.allNotListeningAfter` = true (per-field predicate), and a checker that rejects a sidecar carrying the conjunction value.
- T13 schema: `schema='tabi-aria-metadata-correction-v0'`, `kind='metadata-correction'` → exit 1, `R14-ARIA-SIDECAR-SCHEMA-01` fail only.
- T14 printed finding: a deliberately failing case must print the observed fail ids, not the expected id.

Copy-tree harness for T1–T8: copy `scripts/check-aria-metadata.mjs`, `scripts/aria-loopback-round13.mjs`, `corpus/evidence/round-13/aria/**`, `corpus/evidence/round-14/aria-metadata/**`, and the round-15 metadata dir into `mkdtemp`. `ROOT` derives from the script location, so canonical paths resolve in the copy. Mutate one file, run the copy's CLI, assert exit and finding. Keep the mutated tree in the temp dir; never mutate the repo.

## Commands L1 should run after integration (none run by me)

1. `node scripts/check-aria-metadata.mjs --self-test` — expect exit 0 and the round-15 case list.
2. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` — expect exit 0, `accepted=true` (historical sidecar must still pass under strict mirrors).
3. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-13/aria/receipt.json` — expect exit 1 with `R14-ARIA-CLEANUP-LISTENING-AFTER-01` as the only failing id.
4. `node scripts/check-aria-metadata.mjs --witness --receipt corpus/evidence/round-13/aria/receipt.json --pin corpus/evidence/round-13/aria/runtime-pin.json --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` — expect red→clean, `original_unchanged=true`.
5. `git diff --quiet HEAD -- corpus/evidence/round-13 corpus/evidence/round-14` — must stay clean.
6. `sha256sum scripts/aria-loopback-round13.mjs` — must equal `1d54c9e9…f8e4af9c` before the live producer read is enabled. Confirmed equal at the observed state.
7. Reconcile `SKILL.md:1751–1762` (registry row says `2 could-not-evaluate`; the metadata decision table says "Node … descriptive") with the final code and exit ids. The working-tree SKILL.md is modified; check it against this report.

## Scope limits

- Read-only. No gate, self-test, counter, browser, or test was executed. Hashes were computed with `sha256sum` only.
- Findings are pinned to the observed working-tree state (sha `0f8ae004…`, 2479 lines). The file is still being edited by a sibling; re-verify all anchors before integration.
- Not audited: `CounterDiagnostics` (USER counter, round-14 verifier item 4) and the USER counter scripts; the round-15 expectations file (absent); the full body of `mirrorFieldProblems` beyond lines 932–947 at the observed state.

## Messages

Delivered: pointer to `TabiR15` (this report path, planner); integration pointers 1–5 (from F1–F5) to `TabiR15.MetadataEnforce`. Both writes returned "Delivered".
