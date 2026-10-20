# AttackWorkerSnapshot: missing or changed worker vs empty-fixture semantic exit 1

Seat: `TabiR15.AttackWorkerSnapshot`. This is an author-side falsifier report. It is not a non-author certification.

Mode: source reading and digest computation only. I did not run any gate, self-test, witness, counter, test, or browser. I made no source edits and installed no tools.

## Attacked bytes

- `HEAD` = build-snapshot `revision` `72dcf031b9da24796b718517ea575f21e4f7caae`, baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- `scripts/check-aria-metadata.mjs` sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. I recomputed this digest and it equals the snapshot value. The other three snapshot digests also matched.
- `corpus/evidence/round-15/metadata/expected-fixtures.json` sha256 `d3bcc239b6f0b83cd771645c8ccf9f513178ed426228a1d8116be7459e3f4397`.
- `corpus/evidence/round-15/metadata/mirror-contract.json` sha256 `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`.
- `.ufo/waves/round-15/metadata-witness.py` sha256 `44cd37c5…45831`, the same as in the snapshot.
- Docs are uncommitted working-tree bytes and are not part of `72dcf03`:
  - `SKILL.md` `e3b1e39c…95e7b4`
  - `corpus/QUALITY.md` `cdd2921c…40f116`
  - `corpus/lessons/round-15.md` (untracked) `72f53c9d…c84d1`

## Time limits on this review

- No round15 execution receipt exists. `corpus/evidence/round-15/` holds only `metadata/`, `misroot-recovery.json` and `source-index.json`.
- `LOG.md` round-15 says outcomes "are recorded below only after actually exercised". None are recorded yet.
- So no self-test, witness or production verdict for these bytes is observed. Everything below comes from reading source.

## What held up under attack (source reading)

- **Changed anchored worker → exit 2 `snapshot_tampered`.** `runCheck` calls `verifySnapshot()` (`check-aria-metadata.mjs:1386`) before `prepareContext` (`:1397`). The worker is in the checks list (`:881-885`), and a mismatch goes to `snapshotOutcome` (`:929-949`) with exit 2.
  - The mirror case `mirror-tamper-worker` (`expected-fixtures.json:842-867`) pins `actualSha256 c7a8ebaa…0110`. I recomputed `sha256(worker || "\n")` = `c7a8ebaa6a5cefc8f041e78aec9b9830b6a6f892fc51b0b3f73ffabc3a700110`, which matches.
  - The receipt, pin, manifest, spec, config and producer tamper literals also match my recomputed digests.
- **Empty fixture → exit 1.** `receipt-empty` (`:2375-2379`, `workerCount: 0`) leaves the canonical snapshot intact, so the semantic path runs. Case `empty-perworker` (`expected-fixtures.json:97-116`) binds `expectedExit 1` plus PERWORKER/COUNT fail. The evaluator also checks `payload.exit` (`:2568`).
  - So exit code alone separates the empty fixture from a changed anchored worker.
- **Producer source bytes are now hashed.** The `producer` label is at `:880`. Worker `sourceSha256` bindings (`:723-733`) therefore cannot change without also changing the worker's own digest.

## Findings

### F1 — MEDIUM: a missing anchored worker (`snapshot_unavailable`) is never tested; a mutant that folds it into the empty-fixture exit-1 class survives

- **Exploit path (mutant).** Change `verifySnapshot`'s return to `ok: mismatches.length === 0` (`:920`), or drop the `unavailable` branch in `snapshotOutcome` (`:951-969`). Then delete `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json`. The check falls through to `loadWorkerContext` (`:619-623`, `workers[0]:file:missing`) and exits **1 evaluated/semantic_invalid**. That is the same class as the empty fixture.
  - No self-test case would fail. Every mirror mutation only appends bytes (`tamperedBytes` `:2207-2215`; `mirrorTargetFor` `:2193-2204`). None deletes, symlinks or makes an anchored input non-regular.
  - The `tamper` evaluator even asserts that `snapshot.unavailable` is empty (`:2665-2667`).
  - `mirror-contract.json:46-52` and the self-test contract checks (`:2331-2339`) bind only `snapshot_tampered`.
  - `metadata-witness.py:57-62` tampers only the spec.
- **Evidence the claim exceeds the tests.**
  - Working-tree `SKILL.md:1800` advertises "2 could-not-evaluate including snapshot_tampered/snapshot_unavailable".
  - The w1 plan `.ufo/waves/round-15/w1/TamperWitness.md:158,223` called for an "anchored input deleted → exit 2 snapshot_unavailable" case (`snapshot-producer-missing`). It was not delivered. Fixture inventory: 35 cases, 0 with reason `snapshot_unavailable`.
- **Impact.** Deleting an authenticated worker is a code-only distinction from empty-fixture semantic exit 1, not a verified one. SKILL's verdict map overstates what the tests check.
- **Smallest fix.**
  1. Add a `missing` mirror mode, e.g. `tamper: "worker-missing"`, which skips writing the anchored worker in `buildMirrorRoot`.
  2. Expect: exit 2, classification `could_not_evaluate/snapshot_unavailable`, `expectedFindingIds ["snapshot_unavailable"]`, and `snapshot.unavailable[0]` = `{label:"worker:worker-0-1530637-1792474958700.json", reason:"missing"}`. Branch the `tamper` evaluator so it checks `unavailable` instead of `mismatches` for this kind.
  3. Add `unavailable` to `mirror-contract.json` and to the contract checks at `:2331-2339`.
  4. Bump `caseCounts.cliCases` to 36.
  5. Otherwise, scope the SKILL row down to `snapshot_tampered` only.

### F2 — MEDIUM: adding an unanchored file to the authenticated worker directory gives semantic exit 1, the same class as the empty fixture

- **Exploit path.** Add `corpus/evidence/round-13/aria/actual/workers/worker-1-1-1.json` (any bytes). Then:
  - `verifySnapshot` hashes only `Object.entries(ANCHORS.workers)` (`:881-885`), so it reports ok.
  - `loadWorkerContext` lists the directory (`:660-662`) and pushes `workers:directory_set_mismatch` (`:668-670`).
  - Result: `R14-ARIA-WORKER-SET-01` fail, exit **1**, `evaluated/semantic_invalid`. This happens both for no-argument mode and for the registered `--check corrected.json`.
- **Evidence.** Which files sit in the worker directory is a semantic input (`:668`), but it is not part of the authenticated snapshot. Today the directory holds exactly one file (I listed it). Non-`.json` additions are ignored entirely (`:661`).
- **Impact.** Changing the historical worker set is reported as a semantic failure of the receipt. This contradicts the header's "authenticated snapshot digest drift → snapshot_tampered" (`:25-26`) and QUALITY20's separation of semantic failure from a changed pinned input. The result cannot be told apart from the empty fixture (both exit 1, both with WORKER-SET fail).
- **Smallest fix.**
  1. In `verifySnapshot`, list `WORKER_DIR` (all entries, not only `.json`) and compare the sorted list with `Object.keys(ANCHORS.workers)`.
  2. On any difference, push a mismatch `{label:"worker-dir", expected:[…], actual:[…]}`, which yields `snapshot_tampered`.
  3. Add a mirror case `worker-extra`.

### F3 — LOW-MEDIUM: `--check` input resolution runs before snapshot verification, so a tampered or missing worker can surface as exit 1 with no classification

- **Exploit path.** Tamper with or delete the anchored worker, then run `--check <missing-or-malformed path>`. `main` calls `resolveCheckInput` (`:3231-3254`) before `runCheck`, so `verifySnapshot` never runs. The result is exit **1**, `R14-ARIA-CHECK-INPUT-01` fail, and a payload with **no `classification`** field (`:3234-3246`).
  - The same branch also returns exit 1 when the registered input `corpus/evidence/round-14/aria-metadata/corrected.json` is itself missing. An unreadable input is not "evaluated" (header `:24`).
- **Evidence.** The branch is inherited unchanged from baseline (`7054a5e:scripts/check-aria-metadata.mjs:2206-2221`). Round15 did not move it under the new classification contract, and no fixture covers `CHECK-INPUT-01`.
  - It contradicts the comment at `:872-873`: "Authenticated input bytes are hashed before any semantic evaluator runs … never a failed verdict."
- **Smallest fix.**
  1. Call `verifySnapshot()` at the top of the check branch, before `resolveCheckInput`.
  2. Classify an unreadable or malformed `--check` input as exit 2 `could_not_evaluate` with an explicit reason (e.g. `input_unavailable`), or at minimum emit `classification`.
  3. Add one fixture.

### F4 — LOW: snapshot hashing and semantic evaluation read the files separately, so drift between the two reads gives exit 1

- **Path.** `verifySnapshot` reads each anchored file (`:891`). `prepareContext` then re-reads the receipt, pin and manifest (`:1021-1025`), each worker (`:619`), and the spec and config (`:735-736`).
  - If a worker changes between the two reads, the semantic findings `worker_sha256:<name>` (`evaluateAnchors` `:840-845`) or `workers[0]:file:missing` fire, giving exit 1.
  - The leftover digest checks on the semantic path (`:718-720`, `:738-740`, `:840-845`) are otherwise unreachable for canonical inputs. They still encode "drift → semantic fail".
- **Impact.** It takes a concurrent writer, but it is a concrete counterexample to "never a failed verdict" (`:873`).
- **Smallest fix.** Have `verifySnapshot` return its verified entries (bytes keyed by path). Make `readJson`/`readEntry` on canonical anchored paths inside `prepareContext`/`loadWorkerContext`/`evaluateSourceIdentity` use those cached bytes. Then delete or relabel the unreachable drift checks.

### F5 — LOW-MEDIUM: `empty-perworker` does not pin its classification or its full set of failed findings, and the fixture description overclaims

- **Evidence.**
  - `expected-fixtures.json:97-116` has no `expectedClassification` and no `expectedFailedFindings`.
  - The description (`:539`) says "cases bind CLI exits, finding ids/statuses, classification, and exact failed sets". In fact 19 of 35 cases have no classification (17 of the 19 exit-1 cases), and 9 of 35 have no failed set (jq count over `cases + mirrorCases`).
- **Mutant that survives.** Remove the `workers:missing_or_empty` push (`:586`) and the `no_worker_proofs` push (`:671`). The empty fixture still exits 1, because PERWORKER/COUNT still fail and `directory_set_mismatch` still fires. So the worker-side refusal for an empty set is not tested on its own. This is QUALITY21's "right finding for the wrong reason" pattern, unguarded in C2.
- **My inferred failed set for `receipt-empty`** ([INFERENCE] from `:381-502`, `:580-687`, `:752-791`, `:554-562`; `receipt-green` has an empty failed set):
  - MANIFEST-01
  - WORKER-SET-01
  - WORKER-PROOF-01
  - CLEANUP-PERWORKER-01, CLEANUP-PROOF-01, CLEANUP-LISTENING-AFTER-01, CLEANUP-CLOSED-01, CLEANUP-REFUSED-01, CLEANUP-SERVEROK-01, CLEANUP-COUNT-01
  - NODE-01
- **Smallest fix.**
  1. Add `expectedClassification {evaluated, semantic_invalid}` to `empty-perworker`.
  2. Add the exact `expectedFailedFindings`, taken from an observed L1 run, not from my inference.
  3. Either bind classification on all exit-1 cases or narrow the wording at `:539`.

## Out of scope / not claimed

- Whole-sidecar byte authentication (rejected in the lesson, `round-15.md:12`).
- Symlinked parent directories with identical bytes (content authentication still holds).
- C1 counter diagnostics.
- I make no claim that any check passes or fails when executed.

## Commands for L1 (I ran none of these)

- `node scripts/check-aria-metadata.mjs --self-test`: confirm 35 CLI + 3 helpers, then re-run after F1/F5 fixtures land.
- In an isolated copy (never the lane tree), the F1 probe:
  - `cp -a` the files in `mirrorInputList` into a tmp root
  - `rm <root>/corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json`
  - `node <root>/scripts/check-aria-metadata.mjs` → expect exit 2 `snapshot_unavailable`
- In the same tmp root, the F2 probe:
  - `cp <worker> <root>/…/workers/worker-1-1-1.json`
  - run → currently expected exit 1 `WORKER-SET-01` (the defect)
- In the same tmp root, the F3 probe: append `\n` to the worker, then `--check <root>/nope.json` → currently expected exit 1 `CHECK-INPUT-01` with no classification (the defect).
- `python3 .ufo/waves/round-15/metadata-witness.py`: covers the spec tamper only, not workers.
