# Round 15 w2 — AttackLessonsCriteria (read-only falsification)

Seat: `TabiR15.AttackLessonsCriteria` (critic/reviewer, leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Author-side report. Not a non-author certification. No gate, self-test, counter, `--witness`, `--count-witness`,
`--diagnostic-witness`, `--witness-mirrors`, `metadata-witness.py`, browser or suite was executed. Every finding below is a
source-reading outcome. Predicted behaviour is marked `[INFERENCE]`.

## Axes (named)

- calibration: C2 sidecar mirrors and snapshot-tamper claims must match what the code enforces.
- operability: C1 negative controls must prove the intended refusal cause, and receipts must print observed facts.
- discernment: could-not-evaluate (exit 2) must not be reported as a semantic verdict (exit 1), and vice versa.

## Attacked bytes (exact)

| Object | Identity | Status |
|---|---|---|
| Build revision | `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD, `round-15: enforce historical metadata contracts and retain build wave`) | attacked |
| HEAD `scripts/check-aria-metadata.mjs` | blob sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` = snapshot | attacked |
| HEAD `scripts/check-user-round-contract.mjs` | blob sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` = snapshot | attacked |
| `.ufo/waves/round-15/measure.mjs` | sha256 `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` = snapshot | digest matched; not executed |
| `.ufo/waves/round-15/metadata-witness.py` | snapshot sha256 `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` matched at first hash; file is **now modified** (see drift) | read only, not run |
| Uncommitted docs at hash time (not in snapshot) | SKILL.md `e0fc5eaa…`, corpus/QUALITY.md `cdd2921c…`, corpus/README.md `dd20d0c2…`, corpus/SOURCES.md `44f2960b…`, corpus/lessons/round-15.md `a5f5aa26…`, corpus/evidence/round-15/source-index.json `fbfdb330…`, corpus/evidence/round-15/metadata/mirror-contract.json `18857a4d…`, corpus/evidence/round-15/metadata/expected-fixtures.json `d3bcc239…` (working tree) | attacked as uncommitted text |

### Temporal and drift limits (read first)

1. **Post-snapshot drift.** After `build-snapshot.json` was written, the working tree changed. `git status` shows
   ` M` on `scripts/check-aria-metadata.mjs` (now sha256 `5fae0940087dc912b55ea639baa7288fff4bb66ba1a146897c1e6dc57e0c4da87`,
   3363 lines, mtime 05:35:06), `scripts/check-user-round-contract.mjs` (now `ce1e49bfde9381b16ef6caa0f1bada319393416d54dd9a192aa18f32e20d399f`,
   1323 lines, mtime 05:35:19), `.ufo/waves/round-15/metadata-witness.py`, `.ufo/waves/round-15/w1/MetadataEnforce.md` and
   `corpus/evidence/round-15/metadata/expected-fixtures.json`. HEAD is 05:29:43. The post-snapshot diff adds mirror and aggregate
   controls, an `unavailable` self-test kind, and a `remove` option for mirror fixtures. **I did not attack those bytes.** Any
   finding about them needs a fresh snapshot and a fresh wave.
2. **No execution evidence yet.** `corpus/lessons/round-15.md` (untracked) has an empty `## Execution evidence` section (line 59).
   No round-15 red-before/green-after receipt or `metadata-witness.py` output file exists under `.ufo/waves/round-15/`.
   `build-snapshot.json` says `"verification": "not yet exercised"`. The measured red-before claim is therefore **not
   evidenced** and must not be recorded as passed.
3. **LOG/SCORECARD are not integrated.** Neither file has a working-tree change. Their round-15 rows are L1's to write.
4. **Stale wave reports.** `w1/QualityMirror.md`, `w1/PriorRouting.md`, `w1/CountWrongFailure.md`, `w1/TrendAudit.md` and
   `w1/HistoricalSourceIndex.md` cite line anchors from the pre-`72dcf03` bytes (for example `:1263-1280`, `:986`, `:391`,
   `:832`). They are predated source reconnaissance, not delivered-byte reviews. Their defect IDs are mapped to HEAD below.

All line anchors below are HEAD (`git show HEAD:<path>`) and were re-derived from HEAD blobs, not from the drifted tree.

## What holds at HEAD (verified by reading)

C2 (`scripts/check-aria-metadata.mjs`, HEAD):

- **Mirror enumeration and typing.** `CLEANUP_MIRROR_FIELDS` and `QUALIFICATION_MIRROR_FIELDS` (`:101-118`) plus `mirrorFieldProblems` (`:972-987`) check the field set, the type of every field and the value against `expectedMirrorValues`. The self-test checks the committed `mirror-contract.json` against those tables (`:2323-2330`).
- **Independent per-proof recomputation.** `expectedMirrorValues` (`:989-1018`) derives every mirror from `proofs` and `cleanupDerived`, not from another emitted sidecar. `everyProofListensBefore` is `proofs.every(listeningBefore===true)` (`:993-994`, `:1012`). This closes the seat's D1 and D4.
- **Sidecar source copies.** `source.spec.sha256` and `source.manifest.sha256` are compared to `ANCHORS` (`:1202-1207`). This closes D3.
- **Snapshot tamper class.** `verifySnapshot` hashes receipt, pin, manifest, spec, config, producer and each worker against `ANCHORS` (`:871-925`). A mismatch returns `could_not_evaluate` / `snapshot_tampered` / exit 2 with semantic evaluation skipped (`:927-950`, `EXIT.couldNotEvaluate = 2` at `:93`). `runCheck` calls it first (`:1385-1386`). The `mirrorCases` fixtures exercise each canonical input in an mkdtemp copy (`expected-fixtures.json`).
- **Mirror harness is compatible with the baseline.** The baseline checker `7054a5e` emits `acceptedCorrection` (`:1938` in that blob) and `R14-ARIA-SOURCE-01` (`:647`), which `metadata-witness.py` depends on.

C1 (`scripts/check-user-round-contract.mjs`, HEAD):

- **Closed reason vocabulary.** `COUNT_REASONS` (`:92-99`) and `fail()` rejects unregistered reasons (`:101-106`).
- **Every counting refusal carries a reason.** Emitters at `:413`, `:414`, `:420`, `:430`, `:616`, `:618`, `:619`. This closes the seat's D7 (four causes on one finding) and the `:391/:398/:408/:596` mapping.
- **Anchored, exact parser.** `receiptOf` (`:759-776`) matches `finding=([a-z_]+)` exactly and reads reason from the child's anchored `USER_ROUND_CONTRACT` line. This closes D9's substring match.
- **Literal comparator.** `receiptMatches` (`:781-786`) requires exit, finding and, when declared, reason and detail. A finding-only match cannot satisfy a reason-bearing control.
- **Marker applicability is separate.** `markerApplicable` and `markerOutcome` (`:1205-1221`) print `marker_applicable=0 ... no_marker=na` for non-marker controls, so N/A is not the same as absent. This closes D8.
- **Count witness asserts the reason.** `runCountWitness` `pass` requires `newArm.reason === 'unsupported_counting_command'` (`:903-909`). This closes D9's witness part and T-U5.

## Findings

Severity: H = criterion-level gap or delivery-binding failure; M = precision, attribution or receipt-fidelity defect; L = minor or calibration.

### F0 — H (delivery binding, not a code defect): post-snapshot drift

- Evidence: `git status` lists `M` on both scripts, `metadata-witness.py` and `expected-fixtures.json` after `build-snapshot.json` (`.ufo/waves/round-15/build-snapshot.json` lists HEAD digests; the working tree sha256 differs).
- Consequence: the build snapshot no longer describes the bytes L1 would integrate. A green check on the working tree would not be a check of the attacked revision.
- Bounded correction: L1 re-snapshots the exact integrated revision (commit first, then `build-snapshot.json` digests of that commit) and re-runs this attack against that revision, or confirms the drift is intentional and discards this report's HEAD findings where the drift fixes them.

### F1 — M (C2 discernment): snapshot verification is bound to default paths, not to the bytes evaluated

- Pointers: `verifySnapshot()` at `:871` takes no arguments and hashes `DEFAULT_RECEIPT` (`:70`), `DEFAULT_PIN`, `DEFAULT_MANIFEST` and `SOURCE_PATHS`. `runCheck` at `:1385-1386` calls `verifySnapshot()` with no path. `prepareContext` at `:1020-1022` reads `receiptPathText` and `pinPathText`, which come from `--receipt`, `--pin`, `--check <file>` (`main` `:3255-3257`, `resolveCheckInput` `:3033-3064`) or the sidecar's `original.receipt.path`/`original.pin.path` (`:3052-3053`).
- Evidence: a changed copy of the receipt passed through `--check` or `--receipt` is never hashed by the snapshot gate. `evaluateAnchors` (`:826-868`, `R14-ARIA-ANCHOR-01`) then returns semantic failure. `[INFERENCE: exit 1 with R14-ARIA-ANCHOR-01 from the anchor predicate; not executed]`.
- Conflict: `corpus/lessons/round-15.md` line 10 says "changed authenticated snapshot bytes yield `snapshot_tampered`/exit2 rather than a semantic verdict". The round-15 SKILL registry (working-tree `SKILL.md` aria row and the paragraph ending "Noncanonical receipt/pin inputs used for fixtures still receive semantic evaluation") scopes authentication to the canonical paths. The gate wording overclaims relative to the registry.
- Bounded correction (choose one, record it, do not leave both): (a) narrow the lesson gate and `corpus/QUALITY.md` item 20 to "changed canonical snapshot bytes at the default historical paths", and add one negative fixture in `expected-fixtures.json` that pins a path-substituted changed receipt as exit 1 `R14-ARIA-ANCHOR-01`, so the boundary is observable; or (b) hash the consumed receipt and pin in `runCheck` and return `snapshot_tampered` when their digest differs from `ANCHORS` for any path. Option (b) changes the meaning of exit 1 for any noncanonical receipt, so it needs a separate decision by L1.

### F2 — M (C2 calibration): absence still passes for three duplicated keys

- Pointers (HEAD): `:1232` `if (correction?.value !== undefined && correction.value !== correction.to)`; `:1295-1296` `execution.browserExecuted` optional-if-present; `:1297-1298` `execution.newBrowserRun` optional-if-present.
- Evidence: `buildSidecar` emits all three (`corrections[0].value: corrected`, `execution.browserExecuted: false`, `execution.newBrowserRun: false`, roughly `:1446-1600`). Deleting any one of them passes the semantic gate. The strict checks that remain cover the top-level duplicates (`:1293` `browserExecuted`, `:1294` `execution.browser`, `:1301-1302` provenance).
- Scope: the seat's D2 also named `node.exactRecordedMatch` and `node.observedMatchesRecorded`. Those are now strict (`:1269-1274`), so D2 is partly fixed. `QUALITY20` literally covers "cleanup/qualification mirror", so these three keys are outside its literal scope. The mirror contract, however, says it covers "every field buildSidecar emits".
- Bounded correction: either require presence with `=== false` / `=== to` for the three keys, or list them in `mirror-contract.json` with an explicit exclusion reason and say so in SKILL. Do not change the historical round-14 sidecar.

### F3 — M (C1 operability and receipt fidelity): printed reason fields are expectation literals, not observations

- Pointers (HEAD `corpus/` script `scripts/check-user-round-contract.mjs`):
  - `:1030` `wrongReason: unsupported.reason, correctReason: wrongAfter.reason` (literal expectation objects, `:996-1007`).
  - `:1045` prints `wrong_reason=${run.wrongReason} ... correct_reason=${run.correctReason}`. The observed reasons are `repaired.reason` and `repairedMissing.reason`, which are asserted in `:1016` and `:1019` but never printed.
  - `:1236-1237` `decoy` and `correctCause` are literal objects. `:1243` prints `wrong_reason=${decoy.reason}` and hard-codes `malicious_reason=unsupported_counting_command`, rather than `maliciousCause.reason`.
  - `:1228-1229` comment says "over two actual CLI receipts". Only `wrongCause` (`:1234`) is an observed receipt. The decoy and correct cause are expectations.
- Evidence: the verdict `pass` is computed from observed values (`:1013-1025`, `:1239-1242`), so the boolean is not wrong. The printed line can still show `wrong_reason=unsupported_counting_command` for a run whose observed reason is `after_count_mismatch`, which reads as an observation. `[INFERENCE: for the current bytes, repaired.reason is after_count_mismatch by the assertion at :1016]`.
- Relevance: QUALITY21 and the lesson's C1 gate require "actual receipts, not predicted passing evidence". A printed expectation labelled as an observation is a receipt-fidelity defect.
- Bounded correction: print observed fields as `observed_reason=${repaired.reason ?? 'none'}` and `observed_repaired_missing_reason=${repairedMissing.reason ?? 'none'}`, and print expectations as `expected_reason=...`. In `:1243` print `wrongCause.reason` and `maliciousCause.reason ?? 'none'`. Correct the `:1228` comment to say one observed receipt and two literal expectations.

### F4 — M (C2 calibration): the legacy arm is a constant printed as an observation

- Pointers (HEAD): `LEGACY_ROUND14` `legacyExitForSameBytes: 0` and `legacyExecuted: false` (`:138-139`); `legacyQualificationOk` computed from the falsified sidecar's own fields (`:2013-2021` in `runWitnessMirrors`, which starts at `:1915`); summary print `legacy_exit=${result.legacy?.legacyExitForSameBytes}` (`:3202`).
- Evidence: `--witness-mirrors` prints `legacy_exit=0` for a checker that was never executed. The `legacyExecuted=false` field is there, but the summary line does not show it as a static value. The lesson's gate "the same previously accepted false mirror fails after the code-only cutover" depends on a legacy run. The in-tree witness only shows that the new checker rejects it.
- Bounded correction: print `legacy_static_exit=0 legacy_executed=false` in the summary, or drop the field from the witness line. Claim "previously accepted" only from `metadata-witness.py` output, after L1 runs it.

### F5 — M (C2 discernment): exit 2 is not used for unavailable operator inputs or blocked self-test

- Pointers (HEAD): `resolveCheckInput` returns `ok:false` for unreadable/missing `--check` input (`:3033-3040`, `:3052-3056`); `main` prints `R14-ARIA-CHECK-INPUT-01` and returns exit 1 (`:3231-3253`, `exit: 1` at `:3238`, `return 1` at `:3253`). `runSelfTest` blocked branch (expectations or contract missing/invalid) returns exit 1 (`:2289-2318`, `exit: 1` at `:2303`, `return { exit: 1 }` at `:2318`).
- Contrast: a missing canonical receipt or pin is `snapshot_unavailable`, exit 2 (`snapshotOutcome` `:951-969`, `REASON.snapshotUnavailable`).
- Conflict: working-tree `SKILL.md` aria registry row says "2 could-not-evaluate including snapshot_tampered/snapshot_unavailable". An unreadable `--check` input, or a blocked self-test, is not a semantic verdict on the metadata, and the code treats them differently from an unreadable canonical snapshot.
- Bounded correction: return `EXIT.couldNotEvaluate` for `resolveCheckInput` failure and for the blocked self-test, with one fixture each; or write those two cases as exit 1 in the SKILL registry. Pick one and record it. The current split is inconsistent.

### F6 — L (C2 calibration): self-test authority files are not digest-pinned in code

- Pointers (HEAD): `DEFAULT_EXPECTATIONS` (`:74`) and `DEFAULT_MIRROR_CONTRACT` (`:75`) are read at `:2276-2277` in `runSelfTest` (`:2272`). The code checks `mirror-contract.json` field tables and `legacy` against code constants (`:2323-2342`), but it does not check the sha256 of `expected-fixtures.json`. That file holds all exit, finding and tamper expectations.
- Evidence: the working tree already modifies `expected-fixtures.json` (`M`). Nothing in code would detect an expectation change that is made to match changed gate behaviour.
- Bounded correction: pin the sha256 of `expected-fixtures.json` and `mirror-contract.json` in a code constant next to `ANCHORS`, and fail the self-test blocked branch if they differ. Record the digest in the lesson.

### F7 — L (C2 calibration): two mirrors are aggregate expressions, not independent claims

- Pointers (HEAD): `summaryServerOk: cleanupDerived.serverOk === true` (`:1005`), where `evaluateCleanup` returns `serverOk: derivedAllGood` and `derivedAllGood = allProofsPass` (`:415`, `:516`); `qualified: true` is a literal (`:1008`), checked again at `:1334`.
- Evidence: `summaryServerOk` and `allProofsSupportCorrection` (`:1011`) are the same value. Both come from raw proofs, so QUALITY20 is met. The seat's D4 trap (same-function equality) is not present for these two, but they cannot diverge.
- Bounded correction: none required for QUALITY20. Record in the lesson that these two mirrors are one aggregate value, so a future per-field change is not claimed as independent.

### F8 — L–M (documentation discernment): numeric tokens are corrupted by missing spaces

- Pointers: `corpus/lessons/round-15.md` line 18 ("Reopened S029 on2026-10-20", "`runtime.node`26.12.0 differs from `pin.node.recorded`24.21.0, with minimumMajor20"); line 46 ("round14's16 as16 independent CLI cases: those were15 CLI plus1 helper"); working-tree `SKILL.md` lines 1775-1776 ("Recorded24.21.0", "observed26.12.0").
- Evidence: these tokens are the exact values the lesson's number-drift class is about. As written they do not parse as the intended numbers (for example "were15 CLI plus1 helper" with "16 as16").
- Bounded correction: insert the spaces, re-read the three passages against `corpus/evidence/round-15/source-index.json` (`recheck`, `minimumMajor` 20, `recorded` 24.21.0) and the historical receipt, and do not infer counts from them.

## Defect-ID mapping for the stale w1 reports

| Seat ID | Status at HEAD `72dcf03` | Pointer or note |
|---|---|---|
| QualityMirror D1 (mirrors unchecked) | fixed | `:101-118`, `:972-987`, `:1315-1355` |
| QualityMirror D2 (optional-if-present) | partly open | nodes strict `:1269-1274`; open: `:1232`, `:1295-1298` (F2) |
| QualityMirror D3 (sidecar source copies) | fixed | `:1202-1207` |
| QualityMirror D4 (aggregate listensBefore) | fixed | `:1012`, `:993-994` |
| QualityMirror D5 (tamper exit class) | fixed for canonical default inputs; open for path substitution and classification of input errors | F1, F5 |
| QualityMirror D6 (could-not-evaluate as 1) | partly open | `:3238`, `:3253`, `:2303`, `:2318` (F5) |
| QualityMirror D7 (four causes share one finding) | fixed | reasons at `:413-430`, `:616-619`; `:781-786` |
| QualityMirror D8 (applicability absent) | fixed | `:1205-1221` |
| QualityMirror D9 (witness finding-only; substring) | fixed | `:908`, `:764` |
| QualityMirror D10 (missing-revision policy disagreement) | open, L1 decision | USER `:430` `counting_command_failed` exit 1; ARIA `snapshot_unavailable` exit 2 |
| CountWrongFailure T-U1..T-U6 | implemented, with F3 fidelity gap | `COUNT_REASONS` `:92-99`; `receiptMatches` `:781-786`; diagnostic `:1013-1025` |

## Commands L1 should run after integration (NOT run by this seat)

1. Re-snapshot the integrated revision; re-hash every file in this report's attacked-bytes table.
2. `node scripts/check-aria-metadata.mjs --self-test` and `node scripts/check-user-round-contract.mjs --self-test` (expect the new `mirror-*`, `reason_negative_control` and `diagnostic_witness_comparison` lines, `result=PASS`).
3. `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` (expect exit 0) and `--check` on a changed copy of the receipt (F1: expect the chosen classification, recorded).
4. `python3 .ufo/waves/round-15/metadata-witness.py` (confirm the baseline arm reports `acceptedCorrection` and `R14-ARIA-SOURCE-01` as this report observed at `7054a5e`).
5. Record `git diff --stat -- corpus/QUALITY.md` (expect 0 deletions) and `git diff --stat -- corpus/evidence/round-14 corpus/lessons` (expect 0 changes to historical files).
6. Author the round-15 "Execution evidence" section from actual receipts; keep the QUALITY20/21 pointers to `corpus/lessons/round-15.md#mistakes`.

## Out of scope / not claimed

- No outcome above is observed. Every "holds" statement is a reading of HEAD bytes. Re-run only by L1.
- No browser, coverage, scalar, or non-author spot-check claim. The round-14 outside verdict and the frozen step1/step4 certification remain external duties.
- Tools installed or updated by this seat: none. No pacman use (paused host-wide). One scratch file (`/tmp/_r15_base_aria.mjs`) was created to grep the baseline blob and removed. No other writes except this report.
