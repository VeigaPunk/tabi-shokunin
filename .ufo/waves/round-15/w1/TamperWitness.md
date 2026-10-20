# TamperWitness — tabi round-15 w1 (revenger)

Report: `.ufo/waves/round-15/w1/TamperWitness.md`

**Slice.** Design an isolated source-hash alteration that moves the old checker's **failed / exit 1** to the new checker's **`snapshot_tampered` / exit 2**, with no mutation of the original live files.

**Status.** This is an author-side design and audit, not a certification. Nothing was executed: no gate, self-test, counter, measure probe or browser, and no `check-aria-metadata.mjs` in any mode. The only commands I ran were read-only: `sha256sum`, `git show/log/rev-parse/merge-base/diff --quiet/status`, and Python hashing of git blobs.

**Tool installs/updates.** None.

## Axes
- **calibration (C2):** authenticated-input drift reads as could-not-evaluate, not as a failed verdict, and the old→new differential is causal rather than coincidental.
- **integrity:** live inputs are byte-identical before and after the run, and evidence is bound to committed revisions and digests.
- **operability:** L1 can reproduce the run from argv alone, with no shell and no new CLI root input.

## 1. Reconstructed contract

### Old checker
Revision `e570380d77180ab394256dd6187cac0c5eaf62ec`, sha256 `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6`. The blob is identical at round baseline `7054a5e`, and `e570380` is an ancestor of `7054a5e`. All line numbers in this subsection refer to `git show e570380:scripts/check-aria-metadata.mjs`.

- **ROOT is fixed by the script's location.** `ROOT = resolve(dirname(SCRIPT), '..')` (:47-48). Every anchored read is relative to ROOT:
  - default receipt and pin (:50-51, `readEntry` :159);
  - manifest (:781);
  - spec and config (:640-641);
  - the worker directory listing (:565) and each worker file (:524).
  - No CLI or env flag sets ROOT. Anchors are code constants (:61-73).
- **Receipt and pin anchors bind only at canonical paths.** They apply only when `abs === resolve(ROOT, DEFAULT_*)` (:733-738). Worker anchors always apply (:745-750). Spec, config and manifest current bytes are checked inside `R14-ARIA-SOURCE-01` (:623-626, :640-645).
- **Producer bytes are never read.** `scripts/aria-loopback-round13.mjs` appears only in declared-digest comparisons (:613-618, :629-636, :956-960). The canonical `corrected.json` digest is likewise never compared to a constant (:855-868).
- **Every problem is binary pass/fail.**
  - `pushFinding` produces pass/fail only (:154-156).
  - `runCheck` exits only 0 or 1 (:1117, :1135).
  - `main` prints `verdict=clean|red` (:2234).
  - Exit 2 occurs only for usage errors (:2153) and fatal errors (:2261).
  - **Consequence:** any drift in an authenticated input becomes exit 1 `verdict=red`. The registry row (`SKILL.md:1755`) maps that to `failed`.
- **The witness proves less than its name suggests.** `--witness` proves `originalUnchanged` for receipt and pin only (:1499-1505).

### Target contract
- **Gate standard** (`/home/vgpnk/Projects/shokunin/PROTOCOL.md:394-397`): "the gate verifies those digests before comparing verdicts: an edited snapshot is `snapshot_tampered` (could-not-evaluate), not a compared verdict".
- **Routed defect 3** (`corpus/lessons/round-14-verifier-spotcheck.md:186`): "Anchor/source mismatches currently become exit1 failed findings, rather than a `snapshot_tampered` could-not-evaluate outcome."

### New checker (in progress)
This is MetadataEnforce's working tree, which changed during the audit. I last read snapshot tag `801E`; at 08:16Z the file sha256 was `d8ff2975…`.

- **Snapshot authentication.** `verifySnapshot` hashes receipt, pin, manifest, spec, config, **producer** and the anchored worker before any semantic evaluator runs.
- **Outcome.** `snapshotOutcome` returns exit 2 with:
  - reason `snapshot_tampered`, or `snapshot_unavailable` for an unreadable input;
  - finding `R14-ARIA-SNAPSHOT-TAMPERED-01` with status `could_not_evaluate`.
- **Wiring.** The check is wired into `runCheck`, `runDerive`, `runWitnessMirrors` and the `runWitness` early return.

## 2. Isolation design (no live mutation)

### Why relocating the checker is mandatory
- ROOT derives from the script path, and the receipt/pin anchors fire only at `resolve(ROOT, DEFAULT_*)`.
- A temporary `--receipt` or `--pin` path is therefore non-canonical and can never reach the receipt or pin tamper branch.
- Spec, config, manifest and worker have no CLI path at all.
- The only isolated way to exercise the authenticated snapshot is to run a **copy** of the checker inside a shadow tree.

Several siblings reached the same isolation conclusion: InputTrust, TamperReceipt, TamperWorker, TamperManifest, SelftestOracle and PriorRouting. The lane already has a precedent for running a pinned legacy arm next to the new arm: `check-user-round-contract.mjs` `runCountWitness` verifies the pinned legacy blob, fails with exit 2 on mismatch, uses mkdtemp, and runs legacy then new on one input (working tree :844-901).

### Recipe for both arms
1. **Create and guard the shadow root.** `S = realpath(mkdtemp(tmpdir()/tabi-r15-aria-tamper-))`. Refuse (exit 2) if `relative(realpath(LANE), S)` does not start with `..`, because a TMPDIR inside the lane would write into the live tree.
2. **Materialize inputs from git blobs at BASE `7054a5e`, not from the live worktree.**
   - Verify each blob's sha256 against its anchor before writing.
   - Write regular files only. `readEntry` refuses symlinks (:172-174), so a symlink would show up as reason `symlink` and confound the test.
   - The worker directory must contain exactly one `.json`, because of the directory-set check (:571-575).

   | path | sha256 (BASE = anchor) | bytes |
   |---|---|---|
   | corpus/evidence/round-13/aria/receipt.json | b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7 | 97073 |
   | corpus/evidence/round-13/aria/runtime-pin.json | 4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2 | 1154 |
   | corpus/evidence/round-13/aria/manifest.json | 56764241df4f4a644af39e368b2e47f35d3f4bbbdf17e7cef3fa848ee0d72112 | 8264 |
   | corpus/evidence/round-13/aria/aria-loopback.spec.mjs | 03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc | 59228 |
   | corpus/evidence/round-13/aria/playwright.config.mjs | 87ae779bbe194eb7b5a3d555de5d31184fc50a1bcc49c8499a2a81287707b3f4 | 775 |
   | corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json | 0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7 | 93039 |
   | scripts/aria-loopback-round13.mjs | 1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c | 32177 |
   | corpus/evidence/round-14/aria-metadata/corrected.json | e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745 | 4308 |

   The new checker currently reads `DEFAULT_MIRROR_CONTRACT` and `DEFAULT_EXPECTATIONS` only in self-test mode. If a later revision reads a round-15 asset in check mode, copy it from `codeRevision`. The new-arm control (step 5) detects an incomplete shadow.
3. **Install the checker bytes at `S/scripts/check-aria-metadata.mjs`.**
   - Old arm: `git show e570380:scripts/check-aria-metadata.mjs`, verified as `ef37387…`.
   - New arm: `git show <codeRevision>:…`, verified equal to the receipt's `checkerSha256`. Commit first; never take the new arm from the live worktree.
   - The checker imports only `node:` builtins (:29-45), so the shadow needs no `node_modules`.
4. **Run the registered entry argv inside S.**
   - Argv: `[process.execPath, S/scripts/check-aria-metadata.mjs, '--check', 'corpus/evidence/round-14/aria-metadata/corrected.json']`. This is the registered entry command (`SKILL.md:1755`).
   - `corrected.json` stores its original paths relatively (`corpus/evidence/round-13/aria/receipt.json` and the runtime-pin path), so they resolve inside S.
   - Spawn options: `cwd=S`, `env={PATH,HOME,TZ:'UTC'}` (pattern from :1799), no shell, a timeout, and exactly one `ARIA_METADATA_JSON` line parsed.
5. **Use a fresh S per variant, and run controls first.** For every variant, run an untampered control for **both** arms in that S, then apply the tamper, then run both arms again.
   - Old control: exit 0, `verdict=clean`, `accepted=true`.
   - New control: the same.
   - Without the controls, old exit 1 cannot be attributed to the tamper.
6. **Prove the live tree did not change.** Compare sha256 of the 8 live paths plus the checker against the BASE blobs before the first arm and after the last. `git status --porcelain=v1 --` on those paths must be unchanged.
7. **Do not pin raw stdout digests.** Stdout embeds S through `absPath` (:1941, :1947). Record `shadowRoot` alongside the raw stdout instead.

## 3. Tamper vectors and committed literals

The values below were computed from the `7054a5e` blobs. Appending LF keeps JSON parseable, and the nibble flip keeps the byte length. Both isolate digest drift from parse failure.

| id | path | operation | tampered sha256 | bytes |
|---|---|---|---|---|
| **receipt-sourcehash** (primary) | receipt.json | byte 300 `0x63 'c'` → `0x64 'd'`: last nibble of the unique top-level `sourceSha256` value (key at `receipt.json:8`, offset 220) | aa3665faff59269cddbe63eac17195f549ae23a06000718066acf08354d08bf1 | 97073 |
| spec-lf | spec | append `0a` | d18ea80b5db54a2aedff231e1bad668c463ed542a0d819e2b532b6d07f01c57f | 59229 |
| config-lf | config | append `0a` | fe7ea5568f7bafa1b6e92a9ada3f6d712b7cf641207cf1668468272377f6c60a | 776 |
| manifest-lf | manifest | append `0a` | 62e6ec0a7f0c7415bc6911c01957c41ee4da7505711bb9e625ffb369a94bd4f4 | 8265 |
| receipt-lf | receipt | append `0a` | 481b49935d0450a53820a512f66cf0f26c54fe35eb096f6431cb02ac57f6bd54 | 97074 |
| pin-lf | pin | append `0a` | c59c52042fadd49d3764a79b829dfdb765e4be29ea63d8c3793d0ee2b88fc0bd | 1155 |
| worker-lf | worker | append `0a` | c7a8ebaa6a5cefc8f041e78aec9b9830b6a6f892fc51b0b3f73ffabc3a700110 | 93040 |
| producer-lf | producer | append `0a` | 9014d5efc2f8a48355b5018cd042532cac93316e657b94a753d869ef081ca5df | 32178 |
| sidecar-lf | corrected.json | append `0a` | 1f70b2bdd51fc516fca5a8e2e5c7dc7e1379231fcd9758f1aeff5c6b63b77858 | 4309 |
| witness-py spec | spec | append `\n// isolated snapshot identity alteration\n` (`metadata-witness.py:51`) | 871459825d48bb53eb5fd6600dae656c423a47b76aebb1976aa54beea0abcd84 | 59270 |
| selftest spec | spec | append `\n// round15 selftest tamper\n` (new `tamperedBytes`) | 449dbf65dd8663acb17e8a24673717ac15b13cf3d0ded0850b74c9cfb6f28ffe | 59256 |
| selftest config | config | same suffix | bf3179bbdeb3481d66e738d00e9eef3dd6b78354b163a0726acb0eb78de492c2 | 803 |
| selftest producer | producer | same suffix | 5c4cb198f7124104ffa9ca86057bcd210db1ff6cd73b25406a291d873e867842 | 32205 |

The self-test's JSON targets use LF only, so they share the `*-lf` digests above.

`receipt-sourcehash` is the most literal reading of "source hash alteration". It changes only the authenticated `sourceSha256` field, so the semantic finding (`R14-ARIA-SOURCE-01: receipt.sourceSha256`) and the byte drift (`receipt_sha256`) co-occur. That co-occurrence is what demonstrates precedence: the tamper result must win over the semantic failure.

### Old arm: expected results
These are **[INFERENCE]** from source reading; the old checker was not executed. They are corroborated by the round-14 recorded baselines: 18 findings / exit 1 without sidecar (`executions/before.json`) and 27 findings / exit 0 accepted with sidecar (lesson :127).

How the counts arise:
- 7 context findings + 8 cleanup findings (:325-409) + 3 node findings (:462-476) = 18; adding 9 sidecar findings gives 27.
- Context findings are computed once and reused by `postEvaluation` (:1083-1087).
- Any context failure therefore becomes a `residualFailures` entry (:1088-1093) and forces `R14-ARIA-SIDECAR-ACCEPTED-01` to fail (:1095-1104).

With sidecar, using the registered argv:

| variant | exit | verdict line | failed ids, in order | tamper-attributable detail |
|---|---|---|---|---|
| control | 0 | `verdict=clean findings=27 failed=0 accepted=true` | — | — |
| receipt-sourcehash | 1 | `verdict=red findings=27 failed=5 accepted=false` | ANCHOR-01, SOURCE-01, SIDECAR-BINDING-01, SIDECAR-RESIDUAL-01, SIDECAR-ACCEPTED-01 | ANCHOR `receipt_sha256`; SOURCE `receipt.sourceSha256`; BINDING `receipt_sha256` |
| spec-lf / config-lf / manifest-lf | 1 | `failed=3 accepted=false` | SOURCE-01, SIDECAR-RESIDUAL-01, SIDECAR-ACCEPTED-01 | `spec.currentSha256` / `config.currentSha256` / `manifest.currentSha256` |
| worker-lf | 1 | `failed=3` | ANCHOR-01, SIDECAR-RESIDUAL-01, SIDECAR-ACCEPTED-01 | `worker_sha256:worker-0-1530637-1792474958700.json` |
| receipt-lf | 1 | `failed=4` | ANCHOR-01, SIDECAR-BINDING-01, RESIDUAL, ACCEPTED | `receipt_sha256`; BINDING `receipt_sha256`, `original.receipt.bytes` |
| pin-lf | 1 | `failed=5` | PIN-01, ANCHOR-01, SIDECAR-BINDING-01, RESIDUAL, ACCEPTED | PIN `receipt.runtime.pinned.pinSha256`; ANCHOR `pin_sha256`, `receipt_pin_binding`; BINDING `pin_sha256`, `original.pin.bytes` |
| producer-lf | **0** | `verdict=clean … accepted=true` | — | not read by the old checker |
| sidecar-lf | **0** | `verdict=clean … accepted=true` | — | not anchored by the old checker |

Without sidecar (`node scripts/check-aria-metadata.mjs`, the precedence controls):

| variant | exit | failed ids |
|---|---|---|
| control | 1 | `R14-ARIA-CLEANUP-LISTENING-AFTER-01` only (18 findings) |
| spec-lf | 1 | SOURCE-01, CLEANUP-LISTENING-AFTER-01 |
| receipt-sourcehash | 1 | ANCHOR-01, SOURCE-01, CLEANUP-LISTENING-AFTER-01 |

### New arm: required results
These are the contract, not observations.

- **Every anchored-input tamper, including the producer:**
  - exit 2;
  - JSON `classification = {outcome: could_not_evaluate, reason: snapshot_tampered}`;
  - `mismatches` equals exactly `[tampered path]`, and its `actualSha256` equals the committed literal from the table above;
  - `accepted=false`, and no semantic findings compared.
- **Tamper stdout** must include `verdict=could-not-evaluate` (or `classification=could-not-evaluate`) and exactly one finding token, `finding=snapshot_tampered`. It must have no `verdict=clean` and no single-token `ARIA_METADATA findings <R14-id>` line (see D2).
- **Tamper with no sidecar:** exit **2**, not 1. Tamper outranks the semantic red.
- **No-sidecar control:** exit 1 with `R14-ARIA-CLEANUP-LISTENING-AFTER-01` and reason `semantic_invalid`. This keeps semantic invalidity distinct from could-not-evaluate.
- **Anchored input deleted in S:** exit 2 with `snapshot_unavailable`, never 0 and never `snapshot_tampered`.
- **Semantic controls stay exit 1:**
  - non-canonical fixtures (`sidecar-baddigest`, `malformed-receipt`);
  - declared-digest mismatches inside a fixture receipt;
  - false-mirror sidecars placed at non-canonical paths, as `metadata-witness.py:40` already does.

## 4. Divergences and defects

**D1 — HIGH — The measure probe's C2 rule contradicts the actual old behaviour, so C2 risks counting 0.**
- `.ufo/waves/round-15/measure.mjs` rule 4 (:102-106) runs the snapshot through the shared `oldArm` (:418-448), which requires old `exit 0` (:442), `verdict=clean` (:444) and `accepted=true` with no `accepted=false` (:445-447).
- The real old checker detects drift in every anchored input as exit 1 `verdict=red accepted=false` (§3).
- `metadata-witness.py:55` asserts old `exit==1`.
- Fed with the witness's spec case, `countC2` therefore records four `snapshot_old` errors and counts 0.
- Only vectors the old checker could not see satisfy rule 4: `producer-lf` (now authenticated by the new `verifySnapshot`) and `sidecar-lf` (only if the canonical sidecar gets anchored). Those prove a detection gain, not the reclassification that routed defect 3 asks for.
- **Fix (L1, owner of the C2 contract):** keep the snapshot old/new differential as old failed1 → new `snapshot_tampered` 2, and give the snapshot its own old-arm check (§6c). Optionally record `producer-lf` as an additional old-clean0 → new-2 case. Choose the probe to fit the claim, not the vector to fit the probe.

**D2 — MEDIUM — The new checker's tamper stdout fails measure's parser and mislabels the outcome.** At snapshot `801E`:
- The `main` check path prints `verdict=red` on exit 2 (`const verdict = result.ok ? 'clean' : 'red'`).
- The filter `status !== 'pass'` counts the `could_not_evaluate` tamper finding as `failed=1`.
- It prints `ARIA_METADATA findings R14-ARIA-SNAPSHOT-TAMPERED-01`.
- Witness and derive modes also print `verdict=red` on exit 2.
- Measure then rejects the run three ways:
  - it requires `verdict=` or `classification=could-not-evaluate` text (:856-859);
  - `namedFinding` (:321-326) picks the single-token R14 id;
  - `normalizeReason` (:215) of that id is not `snapshot_tampered` (:852-854).
- Self-test lines also need the literal `expected_finding=snapshot_tampered` (:789-793).
- The per-phase witness stdout already computes `could-not-evaluate` correctly; reuse that rule.
- Two other early defects were fixed during the audit after I messaged MetadataEnforce: the null-context TypeError crash in `checkPayload` (a fatal handler producing a counterfeit exit 2) and `verifySnapshot` skipping unreadable inputs (deleting the producer gave exit 0).

**D3 — MEDIUM — The new self-test's tamper oracle is not independent.**
- `buildMirrorRoot` copies from the live ROOT with no pre-check against the anchors.
- Its tamper cases assert only exit, classification and finding ids.
- If a live input had already drifted, the case for another target would still pass.
- **Required:** assert `detail.mismatches` maps to exactly `[mirror.tamperedPath]` with `actualSha256` equal to the committed literal. Require the untampered mirror control to be exit 0 accepted before any tamper case counts.

**D4 — MEDIUM — `.ufo/waves/round-15/metadata-witness.py` has gaps in causality and isolation.**
1. There is no old untampered control. Only the new arm has a `positive` run (:48-49). Old `exit==1` is never attributed to the tamper; any old red passes, including one from an incomplete shadow.
2. The old pass is a bare `exit==1` (:55). Assert the §3 failed-id list and the SOURCE-01 `spec.currentSha256` detail instead.
3. The new pass is a substring check, `'snapshot_tampered' in stdout+stderr` (:55). Instead require:
   - exactly one JSON line with schema `tabi-aria-metadata-check-v1`, not `fatal-v1`;
   - `classification.reason == 'snapshot_tampered'`;
   - `mismatches == [spec]` with `actualSha256 == 871459825d48…` (or switch to `spec-lf` or `receipt-sourcehash`);
   - no `verdict=clean`.
4. The tampered-bytes digest is never recorded or asserted, and the tamper fixture is not committed. Measure requires a fixture under `corpus/evidence/round-15/metadata/` (`fixtureRef` :396-416).
5. `subprocess.run` inherits the full environment (:20), so `NODE_OPTIONS` and similar can leak. `TemporaryDirectory` (:30) has no guard against landing inside the lane. Use `env={PATH,HOME,TZ:'UTC'}` and a commonpath guard.
6. The output keys `tamper.before/after` do not match measure's `snapshot.old/new{revision,checkerSha256}`. L1 must map them, and should add `oldControl` and `newControl`.

**D5 — LOW — An early `runWitness` return asserts more than it observed.** In the new tree it sets `originalUnchanged: true` and copies the before-sha into `afterSha256` without re-reading. Either re-read the files or mark the value as not re-measured.

**D6 — LOW — The registry row overstates the old checker's producer pin.** `SKILL.md:1755` says "Checker ANCHORS pin original receipt/pin/worker/spec/config/manifest/producer". For `e570380` the producer was a declared digest only; its bytes were never read. The new `verifySnapshot` makes the bytes claim true. L1's round-15 lesson should state that boundary change rather than imply the old checker was already pinning the producer's bytes.

**D7 — LOW — Neither checker authenticates the canonical `corrected.json` bytes.** Only measure rule 5 does (:107-111). Option: anchor `e156b922…` at `DEFAULT_SIDECAR` only. That turns `sidecar-lf` into old 0 → new 2, while mirror and bad-sidecar variants at non-canonical paths stay semantic exit 1. This is optional and must be stated explicitly if adopted.

## 5. Proposed tests

**(a) New self-test.** NEW checker only. It runs from the live tree, writes only to mkdtemp, and spawns the shadow copy. The expectations live in round-15 `expected-fixtures.json`; the round-14 file stays untouched.

| case | argv in S | expected exit | expected finding | digest literal |
|---|---|---|---|---|
| snapshot-control | `--check corrected.json` | 0 | clean, accepted=true | shadow script sha == SCRIPT sha |
| snapshot-control-nosidecar | (none) | 1 | R14-ARIA-CLEANUP-LISTENING-AFTER-01 / semantic_invalid | — |
| snapshot-receipt-sourcehash | `--check corrected.json` | 2 | snapshot_tampered | aa3665fa…8bf1 |
| snapshot-spec | `--check corrected.json` | 2 | snapshot_tampered | 449dbf65…8ffe (suffix) or d18ea80b…c57f (LF) |
| snapshot-producer | `--check corrected.json` | 2 | snapshot_tampered | 5c4cb198…7842 or 9014d5ef…a5df |
| snapshot-spec-nosidecar | (none) | **2** | snapshot_tampered | as above |
| snapshot-producer-missing | `--check corrected.json` | 2 | snapshot_unavailable | — |

Each case line must carry `isolation=cli expected_exit=… actual_exit=<observed> expected_finding=snapshot_tampered finding=<observed child finding> expected_sha256=<literal> actual_sha256=<observed>`.

**(b) L1 old/new differential** (revised `metadata-witness.py`, per D4). For each of `receipt-sourcehash` (primary), `spec-lf` and `producer-lf`, use a fresh S and record:
- old control → old tamper;
- new control → new tamper;
- no-sidecar old and new tamper;
- live digests compared with BASE.

Pass conditions are exactly the tables in §3.

## 6. Proposed C2 receipt pieces

### 6a. Committed tamper descriptor
Place it under `corpus/evidence/round-15/metadata/`; it satisfies `fixtureRef`.

```json
{"schema":"tabi-aria-snapshot-tamper-v1","baseline":"7054a5e1068538349b4dbb0d291c2fe8643802f2",
 "path":"corpus/evidence/round-13/aria/receipt.json","field":"sourceSha256",
 "operation":{"kind":"replace-byte","offset":300,"fromHex":"63","toHex":"64"},
 "before":{"sha256":"b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7","bytes":97073},
 "after":{"sha256":"aa3665faff59269cddbe63eac17195f549ae23a06000718066acf08354d08bf1","bytes":97073}}
```

The harness applies the operation in S and must observe `after.sha256` before running either arm. That makes the oracle independent of the recomputation.

### 6b. Receipt `snapshot` block
This is measure's shape (:77-79) plus the controls.

```text
snapshot: { field: "receipt.sourceSha256", fixture: {path, sha256},
  oldControl: {revision: e570380…, checkerSha256: ef37387…, exit: 0, stdout},
  old:        {revision: e570380…, checkerSha256: ef37387…, exit: 1, stdout},
  newControl: {exit: 0, stdout}, new: {exit: 2, stdout}, shadowRoot, originalsUnchanged }
```

Do not put the R14 id in `snapshot.new.finding`. `structuredFinding` (:304-319) would take it ahead of the stdout tokens and fail the `snapshot_tampered` check.

### 6c. Measure rule-4 change (L1)
- Replace `oldArm(snapshot.old, …)` with a snapshot-specific check that keeps the revision and digest checks (:423-441).
- Accept **either** of:
  - (i) old exit 0 with clean and `accepted=true` (detection gain);
  - (ii) old exit 1, no `verdict=clean`, `accepted=false`, the comma list from `^ARIA_METADATA findings (.+)$` containing `R14-ARIA-SOURCE-01`, `R14-ARIA-ANCHOR-01` or `R14-ARIA-PIN-01`, **and** `snapshot.oldControl` exit 0 with clean and `accepted=true`.
- Note that the existing `findingTokens` single-token regex (:300) does not match comma lists.

## 7. Commands for L1 after integration (none run here)
- `git show e570380d77180ab394256dd6187cac0c5eaf62ec:scripts/check-aria-metadata.mjs | sha256sum` → `ef37387217c7…e4343f6`
- `python3 .ufo/waves/round-15/metadata-witness.py` (after the D4 fixes) → pass with old control 0, old tamper 1 (§3 ids), new control 0, new tamper 2 `snapshot_tampered`, `originalsUnchanged` all true.
- `node scripts/check-aria-metadata.mjs --self-test` → includes the §5a cases, `verdict=clean`.
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` → exit 0, `verdict=clean`, `accepted=true`.
- `node scripts/check-aria-metadata.mjs` → exit 1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01` only.
- `node .ufo/waves/round-15/measure.mjs <REV> --claim C2` → after D1, the snapshot case counts.
- `sha256sum` of the 8 §2 paths → equal to the §2 table. Also `git status --porcelain=v1 -- corpus/evidence/round-13/aria scripts/aria-loopback-round13.mjs corpus/evidence/round-14/aria-metadata` → empty.

## 8. Evidence I observed
- **Live inputs match the anchors.** `sha256sum` of the 8 live inputs equals the anchors. `git diff --quiet 7054a5e -- corpus/evidence/round-13/aria corpus/evidence/round-14/aria-metadata scripts/aria-loopback-round13.mjs` reported no difference.
- **Checker identity.** `git show HEAD:scripts/check-aria-metadata.mjs | sha256sum` and the same at `e570380` both give `ef37387…`, and `e570380` is an ancestor of `7054a5e`. Round-14 `verification.json` records `codeRevision e570380`, `checkerSha256 ef37387…`, sidecar `e156b922…`.
- **Tamper literals.** The §3 digests were computed as `{ git show 7054a5e:PATH; printf SUFFIX; } | sha256sum`. The `receipt-sourcehash` digest came from a Python single replacement: the key occurs once (offset 220), and the result still parses.
- **Producer and sidecar reads.** In the old blob, the producer and `DEFAULT_SIDECAR` have no read site other than `--witness` defaults (Python scan of the `e570380` blob).
- **Working-tree state at 08:16Z.** `scripts/check-aria-metadata.mjs` was modified (sha256 `d8ff2975…`) and `corpus/evidence/round-15/` was untracked. I edited neither.

## 9. Confidence
- **High:** that relocating the checker is necessary; the old checker's 0/1-only structure; that the old checker never read producer or sidecar bytes; the digest literals; the D1 contradiction (from the code text of both files).
- **Medium-high [INFERENCE]:** the exact old failed-id lists and counts per variant, derived from source and corroborated by the round-14 counts 18 and 27.
- **Medium:** in-progress observations of the new checker. The file changed several times during the audit, so L1 should re-verify D2 and D3 against the final committed bytes.

## Messages sent
- `TabiR15`: D1 and D4 summary.
- `TabiR15.MetadataEnforce`: three messages covering
  - the isolation constraints and the LF digests;
  - measure's token constraints (D2);
  - precedence and the tamper-classification boundary;
  - the null-context crash and the unreadable-input skip (both since fixed in `801E`);
  - the remaining `verdict=red`/`failed=1` mislabel;
  - the D3 oracle precision and the self-test suffix digests.
