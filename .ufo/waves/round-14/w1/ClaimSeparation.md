# ClaimSeparation — Round-14 UFO-FSD Connector Report

- **Seat**: `TabiR14.ClaimSeparation` (Leaf UFO-FSD Connector subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Scope**: Read-only evaluation of `tabi-shokunin` scorecard, legacy gate scripts, round-13 closure verifier records, and round-14 spec.
- **Report Path**: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/w1/ClaimSeparation.md`

---

## 1. Naming the Axes (Godspeed Posture)

Under the Godspeed posture and `AXES.md` charter, the six ordinal axes and three learning trends are defined and evaluated:

| Axis | Baseline Scalar | Target Scalar | Impact of Round-14 Moves | Role in Round 14 |
|---|---|---|---|---|
| **Operability** | 8 | 8 | **Improved (C1)** | Directly worked by C1: eliminates host `bash -c` execution in both legacy gate counters (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`), replacing shell spawns with a deterministic, non-shell AST/argv parser and git-object byte evaluator. Operability remains a lowest non-retired tie (8), satisfying the lowest-axis obligation. |
| **Calibration** | 9 | 9 | **Improved (C2)** | Directly worked by C2: provides an independently verified, qualified derived metadata sidecar resolving historical Round-13 cleanup summary inversion (`listeningAfter: false`) and Node metadata (`26.12.0` observed vs `24.21.0` recorded), without altering historical bytes or claiming new browser execution. |
| **Depth** | 8 | 8 | **Unchanged / Protected** | Technical precision is sharpened: C1 specifies exact historical SCORECARD line-counting grammar and trailing-newline behavior; C2 formalizes the Evidence Ladder boundary between primary empirical browser signals and post-hoc analytical derivations. |
| **Coverage** | 9 | 9 | **Unchanged / Protected** | Preserves all historical pstack rounds (r01–r10) and user rounds (r01–r06). Spurious coverage expansion is explicitly prohibited for the derived C2 sidecar. |
| **Freshness** | 8 | 8 | **Unchanged / Protected** | Re-verification checks (`scripts/check-freshness.mjs`) remain intact; historical pins and timestamps are strictly preserved and not silently touched. |
| **Adjacency** | 8 | 8 | **Unchanged / Protected** | Strict domain perimeter maintained: Tabi declines generic test runner or security ownership, leaves parent protocol debt explicitly acknowledged, and performs zero sibling writes. |
| *Expansion (trend)* | — | — | **Protected** | Knowledge map remains intact (32 notes); no false capability credit claimed. |
| *Quality (trend)* | — | — | **Improved** | Cites and resolves routed defects from `round-13-verifier-spotcheck.md:158-161` without revising history. |
| *Discernment (trend)* | — | — | **Improved** | Keeps USER production red (`round_count 6/10`); treats analytical derivation as distinct from live execution. |

---

## 2. Independent Input/Output Acceptance & Disjoint Boundaries

The round-14 contract declares two causally separable claims:
- **C1 Operability**: Two non-shell counters with preserved semantics (0 → 2).
- **C2 Calibration**: Independently checked corrected round-13 cleanup/Node metadata sidecar (0 → 1).

### 2.1 Claim C1 Acceptance Specification (Operability)

- **Target Surface**:
  - `scripts/check-round-contract.mjs`
  - `scripts/check-user-round-contract.mjs`
  - `corpus/evidence/round-14/gates.json`
- **Historical Context & Defect**:
  Both legacy gates currently evaluate counting commands in `SCORECARD.md` via `spawnSync('bash', ['-c', command])` (`check-round-contract.mjs:292-295` and `check-user-round-contract.mjs:310-313`). This executes lane-authored shell code, introducing shell injection vulnerabilities and host shell dependencies.
- **Input Acceptance**:
  - Exact historical SCORECARD command grammar:
    1. `git ls-tree -r --name-only <rev> | grep <pattern> | wc -l` (`SCORECARD.md:242,266,274,282,289,298,306,314,336,344,353,361,369,377`)
    2. `git ls-tree -r --name-only <rev> | grep <pattern1> | grep <pattern2> | wc -l` (`SCORECARD.md:250,258`)
    3. Fixture generator grammar: `git grep -h <pattern> <rev> -- <path> | wc -l` (`check-round-contract.mjs:507`, `check-user-round-contract.mjs:580`)
  - Validated git object bytes through argv: no arbitrary commands, subshells, substitutions, pipes, or redirects outside this exact grammar. Unsupported syntax fails closed with `score_mismatch` without execution.
  - Line-counting semantics: strict newline splitting matching POSIX `wc -l` (counting newline characters `\n`, not trailing non-terminated fragments).
  - Preserved invariants: `HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c'`, `PSTACK_PIN = '92d700d6a8aa9855f1e9d2cc8e12c82f762a1367'`, and `CENSUS_SHA256 = 'b9c8dc3557b825f8bd4b18ff0db03909e16ddd526ef18554cb2bf68da696be9c'`.
- **Output Acceptance**:
  - `gates.json` records 2 valid gate entries:
    1. `scripts/check-round-contract.mjs`: matching code SHA-256 digest, 26 fixture PASS lines + 1 alias control = 27 passing SELFTEST records (`exit 0`), witness `history_rewritten -> clean` (`before.exit = 1`, `after.exit = 0`), production clean 10 rounds (`exit 0`).
    2. `scripts/check-user-round-contract.mjs`: matching code SHA-256 digest, 20 fixture cases + 1 alias control = 21 CLI controls (`exit 0`), witness `history_rewritten -> clean` with explicit `measuredRevision` and code digest (`before.exit = 1`, `after.exit = 0`), production honest failed `round_count 6/10` (`exit 1`).
  - Accepted cutover: `scripts/check-user-round-contract.mjs` updates `ROUND_SCRIPT_ACCEPTED_SHA256` (`check-user-round-contract.mjs:29-33`) to accept `RoundCounter`'s exact code digest.
  - Count: Evaluates to `c1_fixture_covered_repairs = 2`.

### 2.2 Claim C2 Acceptance Specification (Calibration)

- **Target Surface**:
  - `scripts/check-aria-metadata.mjs`
  - `corpus/evidence/round-14/aria-metadata/` (e.g. `aria-metadata-sidecar.json`)
  - `corpus/evidence/round-14/aria-metadata/receipt.json`
  - `corpus/lessons/round-14.md`
- **Historical Context & Defect**:
  In Round 13, `scripts/aria-loopback-round13.mjs:605` serialized `cleanup.server.listeningAfter: serverProofs.every(proof => proof.listeningAfter === false)`, which inverted the boolean in `corpus/evidence/round-13/aria/receipt.json:2521` to `true` despite the underlying worker proof at `:2529` recording `false`. Additionally, Node was observed as `26.12.0` while `runtime-pin.json` recorded `24.21.0` (with `minimumMajor: 20`).
- **Input Acceptance**:
  - Immutable historical Round-13 artifacts, preserved byte-for-byte:
    - `corpus/evidence/round-13/aria/receipt.json` (SHA-256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`)
    - `corpus/evidence/round-13/aria/runtime-pin.json` (SHA-256 `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`)
    - `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json` (SHA-256 `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7`)
    - `scripts/aria-loopback-round13.mjs` (SHA-256 `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`)
  - Failure-capable validation CLI `scripts/check-aria-metadata.mjs` supporting `--self-test`, `--witness`, `--derive`, and default check mode.
- **Output Acceptance**:
  - The derived sidecar in `corpus/evidence/round-14/aria-metadata/`:
    - Binds deterministically to all 4 input SHA-256 digests.
    - Explicitly marks `executed: false`, declaring analytical derivation with zero new browser processes or network probes.
    - Corrects `listeningAfter: false` exclusively supported by all worker proofs (`closed: true`, `listeningAfter: false`, `refusedAfterClose: true`, `refusalDetail: "ECONNREFUSED"`).
    - Qualifies Node version: observed `26.12.0` satisfies `minimumMajor: 20`, while `24.21.0` was stale descriptive metadata; refuses to claim exact Node equality was enforced at runtime.
  - Self-test verification: isolated CLI execution passes 11 distinct red control finding IDs (e.g., `json-malformed`, `field-not-boolean`, `perWorker-empty`, `proof-contradiction`, `input-not-regular-file`, `worker-path-escape`, `worker-missing`, `digest-mismatch`, `node-version-malformed`, `out-outside-round14`, `out-exists`).
  - Witness verification: proves red on original receipt's contradiction vs clean on derived sidecar.
  - Lesson admission: `corpus/lessons/round-14.md` admits the correction strictly under calibration.
  - Count: Evaluates to `c2_metadata_sidecar = 1`.

### 2.3 Disjoint Evaluation Boundaries

The causal separation of C1 and C2 is enforced by complete structural decoupling:

```
[Claim C1 Surface]                              [Claim C2 Surface]
scripts/check-round-contract.mjs                scripts/check-aria-metadata.mjs
scripts/check-user-round-contract.mjs           corpus/evidence/round-14/aria-metadata/
corpus/evidence/round-14/gates.json             corpus/evidence/round-13/aria/receipt.json (read-only)
SCORECARD.md historical command blocks         corpus/evidence/round-13/aria/runtime-pin.json (read-only)
                                                corpus/lessons/round-14.md
      │                                               │
      ▼                                               ▼
node measure.mjs REV --claim C1                 node measure.mjs REV --claim C2
  - Evaluates countC1()                           - Evaluates countC2()
  - Zero imports/reads of aria metadata           - Zero imports/reads of legacy gate scripts
  - Reports: c1_fixture_covered_repairs           - Reports: c2_metadata_sidecar
```

No file modified by C1 is read by C2, and no file modified by C2 is read by C1.

---

## 3. Concrete Failure Scenarios Demonstrating Mutual Independence

To establish that the claims are causally separable, each claim must possess a realistic failure mode that leaves the other claim fully measurable and passing.

### 3.1 Concrete Failure of C1 Leaving C2 Measurable

- **Scenario**:
  Suppose `RoundCounter` introduces a regex error or strict newline parsing failure in `check-round-contract.mjs` (e.g. failing to match multiple greps `grep pstack-20261015-r02/replay- | grep receipt.txt`), or `UserCounter` leaves `ROUND_SCRIPT_CURRENT_SHA256` as `'ROUND14_CUTOVER_DIGEST_PENDING'`, causing `checkHistory` to fail with `history_rewritten`.
- **C1 Measurement Impact**:
  - `node .ufo/waves/round-14/measure.mjs REV --claim C1` fails closed:
    - `c1_fixture_covered_repairs = 0`
    - Populates `errors` with `gate_digest_mismatch` or `self_test_red`.
    - Process exits 1.
- **C2 Measurability & Independence**:
  - `node .ufo/waves/round-14/measure.mjs REV --claim C2` executes completely unaffected:
    - It reads only `scripts/check-aria-metadata.mjs`, `corpus/evidence/round-14/aria-metadata/`, the byte-pinned Round-13 evidence, and `corpus/lessons/round-14.md`.
    - It verifies all 4 SHA-256 anchors, checks that `check-aria-metadata.mjs` self-test passes, and confirms `corpus/lessons/round-14.md` admits the sidecar.
    - Result: `c2_metadata_sidecar = 1`, `errors = []`, process exits 0.
  - In combined mode (`node .ufo/waves/round-14/measure.mjs REV`), the probe reports `c1_fixture_covered_repairs: 0` and `c2_metadata_sidecar: 1`. C1's failure does not suppress C2's valid measurement.

### 3.2 Concrete Failure of C2 Leaving C1 Measurable

- **Scenario**:
  Suppose `ReceiptRepair` produces a sidecar JSON with a syntax error, or sets `cleanup.server.listeningAfter: true`, or claims `executed: true` (masquerading as a new browser run), or fails to match the committed SHA-256 of `runtime-pin.json` (`4d894756...`).
- **C2 Measurement Impact**:
  - `node .ufo/waves/round-14/measure.mjs REV --claim C2` fails closed:
    - `c2_metadata_sidecar = 0`
    - Populates `errors` with `proof_contradiction`, `digest_mismatch`, or `unauthorized_runtime_claim`.
    - Process exits 1.
- **C1 Measurability & Independence**:
  - `node .ufo/waves/round-14/measure.mjs REV --claim C1` executes completely unaffected:
    - It reads only `corpus/evidence/round-14/gates.json`, `scripts/check-round-contract.mjs`, and `scripts/check-user-round-contract.mjs`.
    - It evaluates the 27 and 21 CLI controls, the witness `history_rewritten -> clean` transitions, and the production runs (ROUND clean 10, USER blocked 6/10).
    - Result: `c1_fixture_covered_repairs = 2`, `errors = []`, process exits 0.
  - In combined mode (`node .ufo/waves/round-14/measure.mjs REV`), the probe reports `c1_fixture_covered_repairs: 2` and `c2_metadata_sidecar: 0`. C2's failure does not suppress C1's valid measurement.

---

## 4. Assessment of All Six Axes No-Harm and Lowest-Axis Obligation

### 4.1 Axis-by-Axis No-Harm Assessment

| Axis | Baseline | Target | No-Harm Assessment & Epistemic Boundary |
|---|---|---|---|
| **Depth** | 8 | 8 | **Harm = None.** C1 eliminates opaque shell execution in favor of explicit, auditable git-blob parsing and exact line counting. C2 enforces the Evidence Ladder rule (`SKILL.md:366`): an analytical derivation cannot climb rungs or masquerade as a multi-signal Rung-3 witness. Technical depth is preserved without degradation. |
| **Coverage** | 9 | 9 | **Harm = None.** C1 preserves full coverage over all historical rounds (pstack r01–r10, user r01–r06). C2 explicitly forbids claiming expanded browser API coverage or test fixture coverage for a metadata sidecar. |
| **Operability** | 8 | 8 | **Harm = None (Improved).** C1 directly improves operability by removing host `bash` dependency, securing gates against command injection, and adding CLI self-tests. C2 provides an operable CLI tool (`check-aria-metadata.mjs`) with reproducible `--derive` and check modes. Zero scalar inflation (delta 0). |
| **Freshness** | 8 | 8 | **Harm = None.** Re-verification gates (`check-freshness.mjs`) and worktree/production checks remain active. Historical pins, digests, and timestamps remain byte-identical and unmutated. |
| **Calibration** | 9 | 9 | **Harm = None (Improved).** C2 resolves historical metadata defects through explicit, qualified derivation without rewriting historical receipts. C1 maintains honest calibration by keeping USER production red (`round_count 6/10`) rather than fabricating rounds. |
| **Adjacency** | 8 | 8 | **Harm = None.** Tabi maintains strict lane boundaries: no generic shell executor or test framework ownership, no parent protocol edits, no tampering with sibling files. |

### 4.2 Lowest-Axis Obligation Compliance

- **Rule (`AXES.md:33`)**:
  *"At least one claim works the lane's lowest-scoring non-retired axis, except when the stagnation nudge (below) waives it."*
- **Current Scores**:
  - `depth`: 8
  - `coverage`: 9
  - `operability`: 8
  - `freshness`: 8
  - `calibration`: 9
  - `adjacency`: 8
- **Evaluation**:
  The lowest non-retired score is **8** (a four-way tie among depth, operability, freshness, and adjacency).
  Claim C1 explicitly targets **operability** (baseline score 8).
  Therefore, C1 directly satisfies the lowest-axis obligation.
  No stagnation waiver is required or claimed. All six ordinal scalar deltas remain strictly 0.

---

## 5. UFO-FSD Connector Synthesis & Non-Obvious Move

### 5.1 The Synthesis: Resolving Cross-Seat Coupling Hazards

Reviewing the round proposals reveals three subtle second-order coupling risks:
1. **The Counting Probe Fault-Containment Hazard**:
   If `measure.mjs` uses a single shared `try/catch` block or exits immediately on the first error encountered in combined mode, a failure in C1 could abort execution before C2 is counted, creating artificial coupling in reporting.
2. **The Gate Protection Conflation Hazard**:
   `check-user-round-contract.mjs` checks `PSTACK_PATHS` and `protectedPath`. If an agent adds `check-aria-metadata.mjs` or `corpus/evidence/round-14/` into `PSTACK_PATHS` or `protectedPath`, it would tie C2's artifacts to the pstack baseline, causing spurious `history_rewritten` failures.
3. **The Lesson Multi-Commit Mutation Trap**:
   In `check-user-round-contract.mjs:204-212`, `lessonDrift` checks `git log --diff-filter=MDRT ${pstackPin}..HEAD -- corpus/lessons/round-14.md`. If `round-14.md` is modified across multiple commits in the wave branch, it triggers `history_rewritten`.

### 5.2 The Non-Obvious Move: Tri-Modal Measurement Isolation & Decoupled Cutover Handshake

The non-obvious move synthesizes these constraints into a unified contract across seats:

1. **Tri-Modal Independent Evaluation in `measure.mjs`**:
   - `MeasureClaims` MUST implement independent execution paths for `--claim C1`, `--claim C2`, and aggregate `measure.mjs REV`.
   - In aggregate mode, `countC1()` and `countC2()` MUST run in independent blocks. Errors from C1 are recorded in `c1.errors` and errors from C2 in `c2.errors`. The output JSON reports discrete fields (`c1_fixture_covered_repairs` and `c2_metadata_sidecar`), ensuring that a failure in one claim leaves the other claim's numerical result visible and verified.
2. **Decoupled Script Cutover Handshake**:
   - `RoundCounter` and `UserCounter` coordinate strictly via the accepted digest array in `check-user-round-contract.mjs`:
     `ROUND_SCRIPT_ACCEPTED_SHA256 = [ ROUND_SCRIPT_PRIOR_SHA256, ROUND_SCRIPT_CUTOVER_SHA256, ROUND_SCRIPT_CURRENT_SHA256 ]`.
   - Neither gate script shall reference, import, or place guards on `scripts/check-aria-metadata.mjs` or `corpus/evidence/round-14/`.
   - C2's sidecar validator `check-aria-metadata.mjs` remains an independent tool with its own isolated CLI self-test and witness commands, without modifying legacy gate contracts.
3. **Single-Addition Lesson Invariant**:
   - `corpus/lessons/round-14.md` must be added cleanly as an initial addition (`status 'A'`) and never amended across multiple committed revisions between `PSTACK_PIN` and `HEAD`, preserving the `lessonDrift` invariant.

### 5.3 Second-Order Effects Across Surfaces

- **Runtime Surface**:
  - Eliminates host `bash` invocations during gate checks, preventing shell environment leaks or command injection.
  - C2 runs zero browser instances, eliminating port collisions (19541–19543) and profile leaks.
- **Contract Surface**:
  - Satisfies `AXES.md` causal separability and lowest-axis obligations.
  - Resolves verifier-routed items 1, 2, and 4 from `round-13-verifier-spotcheck.md:158-161`.
- **Substrate Surface**:
  - Protects the cryptographic immutability of `corpus/evidence/round-13/aria/receipt.json` and `runtime-pin.json`.
  - Leaves `SHONEN.md` (four `[~]`) and `corpus/SOURCES.md` (28 rows) untouched.
- **Verification Surface**:
  - Enables L1 and orchestrator verifiers to execute non-destructive, deterministic verification commands with clean pass/fail isolation.

---

## 6. Verification Commands for L1

When all seats land, L1 should run the following commands to verify C1, C2, and claim separation:

```bash
# ----------------------------------------------------------------------
# 1. Verify Historical Evidence Immutability (Byte-Exact Baseline Check)
# ----------------------------------------------------------------------
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --exit-code bebe2efc4565bb068efd905e9ef78011bb6b4efd -- \
  corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/runtime-pin.json \
  corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json \
  scripts/aria-loopback-round13.mjs \
  SHONEN.md \
  corpus/SOURCES.md

# ----------------------------------------------------------------------
# 2. Verify C1 Non-Shell Gates (Operability)
# ----------------------------------------------------------------------
# A. ROUND gate self-test (expect 26 fixture PASS + alias = 27 records, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs --self-test

# B. USER gate self-test (expect 20 fixture cases + alias = 21 CLI controls, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --self-test

# C. Production ROUND contract (expect exit 0, 10 ROUND lines clean)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-round-contract.mjs

# D. Production USER contract (expect exit 1, finding=round_count, 6 of 10 rounds)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-user-round-contract.mjs --expect 10

# ----------------------------------------------------------------------
# 3. Verify C2 Metadata Sidecar (Calibration)
# ----------------------------------------------------------------------
# A. Checker self-test (expect exit 0, all red control IDs verified)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --self-test

# B. Checker witness mode (expect red on original receipt contradiction -> clean on sidecar)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs --witness

# C. Checker verification mode on committed sidecar (expect exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-aria-metadata.mjs \
  --sidecar /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-14/aria-metadata/aria-metadata-sidecar.json

# ----------------------------------------------------------------------
# 4. Verify Causal Separation via Revision-Based Measure Probe
# ----------------------------------------------------------------------
# A. Discrete C1 measurement (evaluates gates.json only, expect count=2, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs HEAD --claim C1

# B. Discrete C2 measurement (evaluates sidecar only, expect count=1, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs HEAD --claim C2

# C. Combined measurement (expect C1=2, C2=1, zero scalar deltas, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs HEAD

# D. Histogram and census validation (expect 28 rows, exit 0)
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/measure.mjs HEAD --histogram
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

---

## 7. Compliance and Handoff

- **Edits**: Written exclusively to `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-14/w1/ClaimSeparation.md`.
- **Untouched**: Zero modifications to historical evidence, lessons, scripts, `SHONEN.md`, `SCORECARD.md`, `LOG.md`, `~/.omp/agent`, or parent repositories.
- **Checks Executed**: Zero builds, tests, linters, formatters, smokes, or gates executed during authoring.
- **Tool Installs**: Zero tools installed or upgraded (no missing tools encountered).
- **Handoff**: Pointers, failure models, and synthesis are delivered to L1 for wave integration and independent verification.
