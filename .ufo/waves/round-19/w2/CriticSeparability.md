# CriticSeparability — round 19, wave 2

## Advisory result and axes

**The literal file-removal/zero-only promise is not demonstrated at R.** The dedicated C1-file removal produces an unevaluable counter, not an observed zero; dedicated C3-file removal retains two closures. Surviving C1/C3 counters show no cross-claim decrement. C2 has a separate reproducibility defect: identical repository inputs produced both 0 and 2 because ordinary Chromium profile metadata was classified as a new download artifact. Do not interpret that variation as claim coupling.

Axes: **depth (C1), operability (C2), calibration (C3)**. This is advisory falsification, not a canonical Rust judgment, admission, integration, or production change.

- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- The PLAN's final revision controls: C1 `c1_validation_decisions` (27), C2 `c2_h4_properties` (2 possible), C3 `c3_routed_closed` (4 possible). H1/F6 are informational, not additional C2 credit.
- Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, its directory first in PATH. Observations used the counters' pinned Chromium 154.0.8037.97 / Playwright 1.64.0 browser paths and fresh private loopback fixtures; no real browser profile or site was used.

## Method and exact removal boundary

One private clone at R contains three independent child commits, each with parent R. Alternate Git indexes formed deletion-only trees; `commit-tree` and private refs retained them without changing the R measurement drivers. Every counter command used the unmodified R driver and a full treatment commit hash. Nothing was integrated into LANE.

All three measurement drivers were preserved. No B-era file was removed. `SKILL.md`, `corpus/SOURCES.md`, `LOG.md`, `SCORECARD.md`, and `corpus/QUALITY.md` remain byte-identical to R in every treatment. Their complete hashes and per-treatment equality are retained in the evidence artifact.

| Treatment | Commit | Own counted files deleted |
|---|---|---:|
| R control | `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` | 0 |
| no-C1 | `c63d2b26574536cb7747f3bc768e021691ebaa62` | 38 |
| no-C2 | `0f99e52872c0e04fa7904ef552719e3c8c1be99b` | 1 |
| no-C3 | `f43d60a8286394dd0aa35b5c32bdb3799a1a8859` | 6 |

The exact path lists are in `CriticSeparability.evidence.json` → `mutations.<treatment>.deletedPaths`:

- **C1:** `scripts/webmcp-validation-round19.mjs`; the 15 JSON case files and 15 HTML fixtures directly under `validation/cases/` and `validation/fixtures/`; `validation/decisions.json`; `validation/receipt.json`; and the five source bodies actually referenced by decisions: `WebMCP.pdl.gz`, `form-control-infrastructure.html.gz`, `form_mcp_schema.cc.gz`, `html_form_element.cc.gz`, `input.html.gz`, all under `corpus/evidence/round-19/sources/`.
- **C2:** `scripts/webmcp-invoke-round19.mjs`. No witness successor exists. The counter generates its UUID-file mutant and replay fixture internally; it does not read the stored `c2-mutants/` specimens, so those uncounted specimens were not removed. Frozen round-17 fixtures, round-18 invoke/counter, and `scripts/freshness-witness.mjs` were preserved.
- **C3:** `.ufo/waves/round-19/corrections/r18-registry-wave-null.md`; `isolation/check-isolation.mjs`; `isolation/ledger.json`; and `w1/{record.json,spec.json,swarm-registry.json}` under that round directory. LOG/SCORECARD correction regions are in shared historical files, not dedicated removable files, and were deliberately preserved.
- Uncounted probes, self-test receipts, isolation sidecars, knowledge documents, and other historical evidence were not deleted to force a result.

## Empirical removal matrix

**All 12 cells below were directly run. No C2 cache result was substituted.** Two initial R controls (C1/C3) ran together; the remaining ten invocations ran as an awaited concurrent batch. This was the assigned removal probe, not a full repository suite.

Cell format: **observed scalar (process exit)**. N/E means no scalar was emitted, not zero.

| Revision | C1 depth | C2 operability | C3 calibration |
|---|---:|---:|---:|
| R | **27 (0)** | **0 (0)** | **4 (0)** |
| no-C1 | **N/E (2)** | **0 (0)** | **4 (0)** |
| no-C2 | **27 (0)** | **0 (0)** | **4 (0)** |
| no-C3 | **27 (0)** | **2 (0)** | **2 (1)** |

All four C2 outputs reported `evaluationStatus: complete` and empty baseline/revision `probeErrors`. C2 exit 0 means evaluated, not that its metric reached 2. The no-C2 candidate selected the preserved round-18 invoke harness and had `eligibleRound19Artifact: false`, explaining its zero independently of profile-write variation.

### Strongest counterexample: C2 is not stable even on identical repository inputs

The complete static C2 repository-input descriptor has SHA-256:

- R = no-C1 = no-C3: `89da8055b9f0a17bf8e7835d9281654428e9e8f32e34b92ea313c305f3bdbfd3`.
- no-C2: `177987e5d33328c19c759ae81eefeac050ffa96a4a8b76a598aa1da694dbc75a`.

Descriptor construction: UTF-8 compact JSON with recursively sorted object keys; selected candidate invoke/witness paths and file SHA-256s; candidate round-17 fixture inventory; R counter SHA-256; B identity and the B counter/invoke/witness/fixture file hashes. The complete descriptors are in `c2RepositoryInputDescriptors` in the evidence artifact. These are **static repository-input digests**, not a claim that revision arguments, fresh nonces, generated UUIDs, process state, or filesystem timing are identical. This distinction is why fresh invocations, not cached scalar replacement, were used.

The R and no-C1 clean runs both observed the nonce echo, real invocation, response, canceled download, and browser identities. Nevertheless their complete filesystem scans rejected one ordinary profile file created after the before-download snapshot:

- R: `/tmp/tabi-r19-webmcp-invoke-jifFqp/flagged-profile-1g45OA/extensions_crx_cache/metadata.json`, stage `afterClose`.
- no-C1: `/tmp/tabi-r19-webmcp-invoke-UMnwlb/flagged-profile-qBk0u6/extensions_crx_cache/metadata.json`, stage `afterClose`.

Their clean harness receipts had exit 1 / verdict `fail`, so both H4 properties lost credit even though their UUID mutants were correctly rejected. The no-C3 clean scan had `newFiles: []`, its clean run passed, and both properties counted. R's replay-source record also failed the clean-record prerequisite; no-C1's replay check itself passed.

The causal source boundary is `scripts/webmcp-invoke-round19.mjs:812-838,881-932`: the root inventory includes the entire run tree, including the Chromium profile, and the summary treats any new regular file in every root as a new download file. The counter gates both properties on the clean run (`measure-c2.mjs:964-986,1002-1021,1058-1075`). This explains the recorded result without attributing it to C1 or C3 contents. **Whether concurrency increased the timing exposure is untested; no timing-causality claim is made.**

**Impacted axis:** operability, plus confidence in the empirical separability evidence.

**Smallest safe correction:** make the any-new-file predicate apply to the download-capable artifact roots required by G-H4, not the browser's unrelated mutable profile tree. Preserve the nonce, browser ownership, producer binding, marker-byte scan, and UUID-mutant rejection. Do not filename-allowlist `metadata.json`, discard the failed control, or select the successful value from a cache. A valid fix must keep the planted UUID red and a normal profile write non-download; this review did not implement or verify that fix.

### C1 file removal is fail-closed, not an observed zero

no-C1 emitted no stdout and exited 2 with the observed diagnostic:

`C1_COUNTER_ERROR {"reason":"manifest_missing","message":"corpus/evidence/round-19/validation/decisions.json is missing at c63d2b26574536cb7747f3bc768e021691ebaa62"}`

The shared SKILL declaration/table is still present. `measure-c1.mjs:804-816` returns its clean absent-claim zero only when both the manifest and table heading are absent; a present table with missing manifest raises an error. Treating this exit as scalar zero would fabricate measurement evidence.

**Impacted axis:** depth claim removal semantics, not a demonstrated depth regression at R (the fresh R control measured 27).

**Smallest safe correction:** keep fail-closed behavior. Define the ablation as an owned content projection that removes the C1 table region from the shared SKILL file as well as C1 dedicated inputs, without deleting shared history. Alternatively describe dedicated-file removal as unevaluable rather than promising a numeric zero. The projected-table variant was not run in this files-only assignment.

### C3 dedicated-file removal retains d1 and d2

no-C3 measured 2, with:

- d1 passed: `correction_line_and_7_criteria_rederived`.
- d2 passed: `correction_line_and_5_plus_1_ids_match` (five substring assertions and the one nonempty-message assertion).
- d3 failed: `no_round19_registries;no_round19_records;r18_registry_correction_incomplete`.
- d4 failed: `checker_missing_at_revision`.

This is not evidence that C3 depends on C1's validation files or C2's successor harness. d1 is the C3-owned correction line at `LOG.md:1116` plus historical QUALITY 33–39; d2 is the C3-owned line at `SCORECARD.md:870` plus the round-17/18 harness blobs read **at B**, not the candidate successor. Deleting LOG/SCORECARD/QUALITY wholesale would destroy shared history and would not be a valid claim-specific ablation.

**Impacted axis:** calibration's file-level zero-only promise.

**Smallest safe correction:** name C3's owned LOG/SCORECARD correction regions explicitly in the ablation contract, alongside its six dedicated metadata files. Remove only those owned regions for a full claim-removal probe. Source logic predicts that d1/d2 would then stop counting, but this content-projection variant was not run and is not reported as an observed zero.

## C3 writer inventory and shared-path coupling

The C3 isolation ledger has **23 entries**:

| Production writer category | Entries | Seats |
|---|---:|---|
| C1 | **17** | 15 `Fam*` writers; `ExecValidationHarness`; `ExecMeasureC1-4` |
| C2 | **3** | `ExecInvokeR19-4`; `ExecC2Mutants-4`; `ExecMeasureC2-4` |
| C3 | **2** | `ExecIsolationLedger`; `ExecMeasureC3-4` |
| Shared no-harm | **1** | `ExecHarmBaseline` |

`ledger.json:9-319` inventories the C1 writers; `321-350,395-408` inventories the C2 writers. `check-isolation.mjs:356-446` resolves the absolute writer clones, reads their Git objects, and compares B-to-writer-commit changed paths against assignments. `measure-c3.mjs:364-389,418-422` executes this checker from temporary copied C3 blobs but leaves those absolute clone references intact.

**Observed:** no-C1 and no-C2 each retained C3 = 4, including d4's clean 23-entry result. Their entire C3 stdout is byte-identical to R, SHA-256 `1fe399290fbba60c75e1883bb84f6fe17d20de0eb93cb7e149a051c208e31ec3`. Removing final-revision C1/C2 files does not remove the historical writer clones/commits, so the ledger still validates. This is inventory/provenance dependency, not an observed cross-claim count decrement.

**External lifetime coupling:** C3 is not a function of revision blobs alone: the checker still needs 20 C1/C2 writer clones plus the other three clones on the host. `[INFERENCE]` making one of these clones unavailable would make the live checker incomplete and lose d4 even if R's bytes did not change (`check-isolation.mjs:360-365,394-429,464-470`). No external clone was changed, hidden, deleted, or probed destructively. The ledger therefore must not be described as self-contained immutable audit evidence.

**Shared paths:**

- C1 reads the complete `SKILL.md` and `corpus/SOURCES.md` blobs, then selects its table and referenced rows S077/S078/S079/S082/S083 (`measure-c1.mjs:122-135,804-839,872-876`).
- `SKILL.md:2094-2103` registers C1, C2, C3, isolation, and both harnesses in one shared appendix. `SOURCES.md:91-107` contains both C1's new source rows and C2 hazard rows S091/S092. These are physical shared-file authorities even though the C2 scalar counter does not consume those documentation blobs.
- C3 does not read SKILL/SOURCES for d1–d4. None of its 23 recorded writer entries lists `SKILL.md`, `corpus/SOURCES.md`, `LOG.md`, or `SCORECARD.md` as a changed path; the PLAN reserves shared-file integration to the L1. The absence of those paths in the writer ledger must not be misrepresented as proof about the L1's shared-file integration.
- The correct safe boundary is owned **regions/rows**, not removal of the entire shared file. Preserve historical source rows, old SKILL content, and baseline derivation sources. Do not delete C1/C2 writer inventory from C3 merely to make dependency diagrams appear disjoint.

**Smallest safe provenance correction:** qualify the claim as historical writer-isolation validation with live external clone prerequisites. If durable self-contained calibration is required, retain content-addressed writer commits/bundles and the same assignment/changed-path checks under C3-owned audit evidence; do not replace authenticated writer evidence with a second hand-maintained inventory. Whether the present live-clone dependency is an admissible tradeoff belongs to the canonical judge, not this critic.

## Evidence and source locators

Complete command argv, revision, elapsed time, exit, stdout, stderr, parsed output, stdout/stderr hashes, removal manifests, counter/source hashes, per-treatment shared-file hashes, writer census, and C2 input descriptors are retained in:

- `.ufo/waves/round-19/w2/CriticSeparability.evidence.json`
- Artifact size: **297017 bytes**; SHA-256 **`b7e8ec3c7f37624a933b67bcd8e3dc715a07b6ae3d94f40b97e9edc5456f8870`**.
- Scratch envelopes: `/fast/scratch/tabi-r19/fx-CriticSeparability/critic-separability/{R,no-C1,no-C2,no-C3}-{c1,c2,c3}.json`; combined `matrix.json`, `mutations.json`, `input-evidence.json`.

The command template was the absolute pinned Node executable, absolute sandbox `.ufo/waves/round-19/measure-cN.mjs`, and the full revision hash; exact argv are in each envelope. No cached result was relabeled as a fresh revision observation.

All source locators below refer to the R bytes in the sandbox, accessed **2026-10-21**. SHA-256s are for their decoded UTF-8 bodies. No external page was fetched or quoted by this seat.

| Source / exact anchor | Local URL | Body SHA-256 |
|---|---|---|
| PLAN, separability lines 58–61; final revision 139–156 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/PLAN.md#L58-L61` | `abe72ddd1088de226926f373ff6ffd1ccbf4dd7ab032382d438f70a2c21fc496` |
| C1 absence and dependency checks, lines 804–879 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/measure-c1.mjs#L804-L879` | `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858` |
| C2 clean prerequisite/comparison, lines 964–1189 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/measure-c2.mjs#L964-L1189` | `a8003530f0a7b95ef830f3eeb6fa6d9d9b420855396beea8911ac02ea1ec53a1` |
| C3 revision inputs, lines 393–429 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/measure-c3.mjs#L393-L429` | `eaca75db1e26f26894eff87c9d2a124ae47052b6a4f3356bff2ae4ce72bad744` |
| Writer inventory, lines 9–408 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/isolation/ledger.json#L9-L408` | `49aef3dc06bb092e7183206d25828a780345385fe714cab6877b67dd0e7623be` |
| External clone reads, lines 356–446 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/.ufo/waves/round-19/isolation/check-isolation.mjs#L356-L446` | `5c42b0af4cb1b88902a20aa81b72a1e6b822a34ebc62a0ab7abb36a42b7145a0` |
| Download scan roots and summary, lines 812–932 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/scripts/webmcp-invoke-round19.mjs#L812-L932` | `953d209352976ce540764764c9ea4570d07e4d8e7649dc9b5c0ac2d56ebe77b9` |
| Shared SKILL table/registry, lines 2049–2103 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/SKILL.md#L2049-L2103` | `ed34bcc8b89d74d669f3f5a44c861ac0148050f795802c336e0770dd805d5d74` |
| Shared source rows, lines 91–107 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/corpus/SOURCES.md#L91-L107` | `8e05e8bc47d71df25061734a0b07a09eb42dff57061f8a68c4db6d2626fb6b45` |
| d1 correction, line 1116 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/LOG.md#L1116` | `ffff35e72b01b9e2cd1dc57fe3d5a5e9de4fb58c2d6c1fc81f21ebec989fa7af` |
| d2 correction, line 870 | `file:///fast/scratch/tabi-r19/fx-CriticSeparability/SCORECARD.md#L870` | `54ecbfb30f3013cdef82c7e305ae97e95bedf7daa0944d17054db1c2105cb8d2` |

## Verification limits and cleanup

- Exercised: the 12 requested counter cells, direct repository-input hashing/census, and targeted process cleanup observation. No build, lint, formatter, full repository suite, judge, other orchestration runtime, or production mutation was run.
- The four C2 runs together exposed 40 distinct recorded Chromium PID/starttime identities. After completion, targeted `ps` over those PIDs returned no rows (exit 1); all 12 direct counter subprocesses had exited. The counters cleaned their own temporary sandboxes/profiles/servers. No persistent job or service was started by this seat.
- No packages/tools were installed or updated.
- C2's varying clean control prevents a clean numeric diagonal-separability conclusion. Do not replace the recorded R zero with the earlier cached two or infer that removing C3 improved C2.
- The missing-manifest C1 outcome and retained C3 correction lines are contract/granularity defects, not grounds to weaken validation or discard historical provenance. The suggested region-level ablations and scanner correction are recommendations, not exercised fixes.

## Isolation

- Seat: `CriticSeparability` (read-only critic; report-only production scope).
- Clone: `/fast/scratch/tabi-r19/fx-CriticSeparability`.
- Base branch: `r19/fx-CriticSeparability`; HEAD/attacked base `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, per falsification override). Canonical round baseline B is `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Sandbox branch `r19/fx-CriticSeparability-no-C1`, commit `c63d2b26574536cb7747f3bc768e021691ebaa62`: deletes only the 38 C1 paths enumerated above and in the retained manifest.
- Sandbox branch `r19/fx-CriticSeparability-no-C2`, commit `0f99e52872c0e04fa7904ef552719e3c8c1be99b`: deletes only `scripts/webmcp-invoke-round19.mjs`.
- Sandbox branch `r19/fx-CriticSeparability-no-C3`, commit `f43d60a8286394dd0aa35b5c32bdb3799a1a8859`: deletes only the six C3 paths enumerated above and in the retained manifest.
- Changed paths are deletion-only; none existed at B. The private alternate-index intermediate C3 tree was superseded before any counter run; the retained no-C3 ref and all reported measurements use `f43d60a8286394dd0aa35b5c32bdb3799a1a8859`.
- LANE writes: only `.ufo/waves/round-19/w2/CriticSeparability.md` and `.ufo/waves/round-19/w2/CriticSeparability.evidence.json`. No LANE Git write, production edit, shared-file edit, sibling-clone mutation, external browser profile access, or host/service mutation.
