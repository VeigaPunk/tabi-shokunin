# AttackSpecSnapshot — C2 manifest/spec/config tamper → stable `snapshot_tampered`, isolated CLI expectations

Author-side falsifier, read-only source review. This is not a non-author certification and does not judge admission.

## Attacked identity
- Revision `72dcf031b9da24796b718517ea575f21e4f7caae` (HEAD; baseline `7054a5e1…`), from `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json`.
- Recomputed sha256 values match the snapshot: `scripts/check-aria-metadata.mjs` 5738296263a3…e83e4eb0, `.ufo/waves/round-15/measure.mjs` 62e98fa858c0…7e02e7, `.ufo/waves/round-15/metadata-witness.py` 44cd37c52aa8…f45831, `scripts/check-user-round-contract.mjs` abf174c31db6…60a3d.
- Expectations at the revision: `corpus/evidence/round-15/metadata/expected-fixtures.json` d3bcc239…4397 and `mirror-contract.json` 18857a4d…308e.
- Timing limit: SKILL.md (e0fc5eaa…), corpus/QUALITY.md (cdd2921c…), README.md (dd20d0c2…) and SOURCES.md (44f2960b…) are **uncommitted working-tree edits**. `corpus/lessons/round-15.md` (a5f5aa26…) is **untracked**. No C2 receipt exists: `corpus/evidence/round-15/metadata-differential.json` is absent, and so are any self-test or witness outputs. I make no claim that anything succeeded at runtime. All findings below come from reading source. I did run two literal regex tests with `node -e` and hashed the tamper bytes offline in Python. I did not run the gate, self-test, witness, or measure.

## Holds (checked by reading source)
- Every ANCHORS digest (`check-aria-metadata.mjs:147-158`) matches the bytes on disk for receipt, pin, manifest, spec, config, producer, and worker.
- I reproduced the mirror tamper expectations offline, using the same suffix rule as `tamperedBytes` (`:2207-2215`). The results match `expected-fixtures.json` `mirrorCases` exactly: manifest `62e6ec0a…bd4f4`, spec `449dbf65…8ffe`, config `bf3179bb…92c2`, and also receipt, pin, producer, and worker.
- `verifySnapshot` (`:871-925`) runs before semantic evaluation in `runCheck`/`runDerive`/`runWitnessMirrors` (`:1386`, `:1618`, `:1916`), and `runWitness` goes through `runCheck`. A mismatch takes precedence over unavailable (`:929`). The payload carries the classification and snapshot (`:2871-2883`).
- The baseline checker sends spec/config/manifest drift to `R14-ARIA-SOURCE-01` with exit 1 (baseline `:616-645`), so a real exit1→exit2 differential exists.

## Defects

### F1 — HIGH: the self-test summary line can never satisfy measure, so C2 cannot count 1
- `measure.mjs:887` requires `/^ARIA_METADATA_SELFTEST verdict=clean cases=(\d+)\b/m`.
- The checker prints `ARIA_METADATA_SELFTEST verdict=clean cli_cases=35 helpers=3` (`check-aria-metadata.mjs:2838-2839`; the blocked variant is at `:2316`).
- Literal regex test: `false`. Result: `self_test_not_green` on every green run.
- **Fix:** change one side only. Either the checker emits `cases=<cliCases.length>` right after `verdict=` (CLI count only, no helpers, so the count is not inflated), or measure accepts `cli_cases=`.

### F2 — HIGH: the witness tamper record fails measure's identity-field rule
- `metadata-witness.py:62` sets `'field': spec_path`, which is `corpus/evidence/round-13/aria/aria-loopback.spec.mjs`.
- `measure.mjs:173` `SNAPSHOT_FIELD = /sha256|digest|hash|bytes|revision|pin|snapshot|input|identity/i`, applied at `:1010-1011`. Literal test against that path: `false`. Result: `snapshot_field`.
- Measure's own contract comment (`:91-92`, `:123-124`) says `field` is an identity field name, not a path.
- **Fix:** have the witness emit `field: 'source.spec.sha256'` (or `specSha256`) and a separate `path`. Do not hand-edit the record after the run.

### F3 — MEDIUM: the witness output is not a complete measure receipt
- It shares the schema `tabi-round15-metadata-differential-v1`, but it lacks `selfTest`, which measure requires at `:879-881`.
- Its `positive` is the raw `run()` dict (`metadata-witness.py:56`) with no `sidecar: {path, sha256}`, which measure requires at `:1048-1050`.
- Unless the harness changes, L1 would have to assemble or edit the receipt by hand. That risks false provenance for an "L1-owned durable" probe.
- **Fix:** the witness itself should run and embed `--self-test` stdout/exit and `positive.sidecar`.

### F4 — MEDIUM (adjacent to C2 mirrors; flagged only): mirror after-arm findings are ambiguous to measure
- The new checker's mirror refusal reports two failed findings: `…CLEANUP-MIRROR-01` plus `…SIDECAR-ACCEPTED-01`. See `expected-fixtures.json` `sidecar-silent-cleanup-mirror` `expectedFailedFindings`, and `:1418` findings concatenation.
- `findingFromValue` returns null when there are two or more failed ids (`measure.mjs:366-370`).
- The stdout `ARIA_METADATA findings A,B` line fails `:340`; literal test: `false`.
- Result: every witness mirror record gets `mirror_finding … no unambiguous named finding` (`:984`).
- **Fix:** measure picks the failed id that matches MIRROR_FINDING, excluding the `ACCEPTED` umbrella. Alternatively the checker labels its primary finding.

### F5 — MEDIUM: the snapshot is read twice, so the classification is not stable
- `verifySnapshot` hashes the files and then throws the bytes away (`:890-918`; `entries` keep only the sha).
- The evaluators then read the same paths again:
  - receipt and pin: `prepareContext` `:1021-1022`
  - manifest: `:1025`
  - workers: `:619`
  - spec and config: `evaluateSourceIdentity` `:735-740`
- If spec, config, or manifest changes between the gate and those reads, the run returns `R14-ARIA-SOURCE-01` (`spec.currentSha256`, `config.currentSha256`, or `manifest.currentSha256`) with exit 1 and `semantic_invalid`. That is exactly the misclassification C2 claims to remove (lesson `round-15.md:10,47`; SKILL working-tree row "A committed source/snapshot digest no longer matches").
- Outside that race, the problems at `:718-721` and `:735-740` are unreachable, so two digest authorities check the same anchors.
- **Fix:** keep the authenticated buffers in `verifySnapshot` entries and pass them into `prepareContext`/`evaluateSourceIdentity`/`loadWorkerContext`, reading each file once. Then delete the redundant `*.currentSha256` branches. Alternative: re-run `verifySnapshot` after evaluation and reclassify any drift as `snapshot_tampered`.

### F6 — MEDIUM-LOW: the worker directory set is authenticated only semantically
- `verifySnapshot` hashes only the named anchor worker (`:881-885`).
- Adding an extra `*.json` to `corpus/evidence/round-13/aria/actual/workers/` passes the gate. It then fails `R14-ARIA-WORKER-SET-01` `workers:directory_set_mismatch` (`:658-670`), included at `:1079`.
- So `--check corrected.json` becomes exit 1 `semantic_invalid`, not `snapshot_tampered`. ANCHORS.workers already lists the whole authenticated set.
- **Fix:** `verifySnapshot` lists `WORKER_DIR/*.json` and records any set difference as a tamper mismatch labeled `worker-set`. Add a mirror case.

### F7 — MEDIUM-LOW: tamper-case coverage is controlled by the data file, not code
- `mirrorCases`, `caseCounts`, and `minimumCliCases` all live in the same unpinned `expected-fixtures.json` (`runSelfTest` `:2715`, `:2792-2809`).
- Deleting `mirror-tamper-config` (or the manifest or spec case) and decrementing both counts keeps `--self-test` green. Nothing in code requires the tamper labels to cover the labels `verifySnapshot` checks.
- This conflicts with the round's own "code-owned tables must match the asset" rule (`:98-100`, `:2323-2342`).
- **Fix:** in `runSelfTest`, assert that the set of `kind:'tamper'` labels in `mirrorCases` equals the `verifySnapshot` label set {receipt, pin, manifest, spec, config, producer, worker}.

### F8 — LOW-MEDIUM: the self-test reports a snapshot tamper as test failures
- The fixture CLI cases run the repo checker with `cwd=ROOT` (`:2709-2713`). Their fixture receipts point at the canonical worker (`FIXTURE_WORKER_REF` `:183-186`), and every evaluation reads the canonical manifest, spec, and config (`:1025`, `:735-736`). Each spawned process runs the canonical `verifySnapshot`.
- `buildMirrorRoot` throws `mirror source drifted` on any anchor drift (`:2238-2240`).
- So when the canonical spec, config, or manifest is tampered, `--self-test` exits 1 with `verdict=blocked` and about 35 FAIL lines (every CLI case fails). It never classifies the cause as `snapshot_tampered`. This repeats the lesson row 38 attribution mistake, one layer up.
- The header at `:45` ("Isolated mkdtemp fixtures") overstates the isolation.
- **Fix:** run `verifySnapshot` at the start of `runSelfTest`. On mismatch, print `verdict=could-not-evaluate reason=snapshot_tampered` and exit 2. Reword the header to say the fixtures depend on the canonical snapshot.

### F9 — LOW: the `--check` input refusal runs before the gate and returns exit 1
- `resolveCheckInput` failure returns exit 1 `R14-ARIA-CHECK-INPUT-01` with no classification (`:3231-3253`).
- The header at `:24-26` assigns surface refusals to exit 2.
- With a tampered snapshot plus an unreadable `--check` path, the result is exit 1, not `snapshot_tampered`.
- **Fix:** run `verifySnapshot` first, or make this exit 2 with `could_not_evaluate`/`input_unavailable`.

### F10 — LOW (coverage note): tamper CLI cases use only no-argument mode
- Every tamper mirror case uses `args: []`.
- The registered entry is `--check corpus/evidence/round-14/aria-metadata/corrected.json`. Under that command, only spec tampering has evidence, and it comes from `metadata-witness.py:57-62`.
- Manifest and config tampering under the registered command have no CLI evidence. The risk is low because both modes share `runCheck`.

## Impacted axes
calibration9 (C2 count admissibility: F1–F4 block measure, F5–F7 weaken the "stable `snapshot_tampered`" claim); operability (F8, F9 exit-class truthfulness). No scalar or coverage inflation observed.

## L1 checks to run after integration
- `node scripts/check-aria-metadata.mjs --self-test` — confirm `cli_cases=35 helpers=3` and the summary token from F1.
- `python3 .ufo/waves/round-15/metadata-witness.py` — inspect `tamper.field` (F2) and the failed-id count in the mirror `after` arms (F4).
- Run the measure C2 path in `.ufo/waves/round-15/measure.mjs` against the assembled `corpus/evidence/round-15/metadata-differential.json`. Expect `self_test_not_green`, `snapshot_field`, `sidecar_shape`, and `mirror_finding` unless F1–F4 are fixed.

Tools installed or updated: none.
