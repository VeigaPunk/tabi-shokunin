# Residual Boundary Review: One-Claim Scope, Provenance Integrity, and Measurement Binding Synthesis

**Seat**: `TabiR20.ResidualBoundary`  
**Role**: UFO-FSD Connector  
**Lane Root**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Revision**: `ac10319843f718489a10b89a8d2a568879aaf980`  
**Baseline**: `c49929430d996b016dde2e3a3a5be380f3433fdb`  
**Return Freeze**: `e0b5d02a6aef76b0d2799d92618f79f1bca40062`  
**Target Report**: `.ufo/waves/round-20/residual/ResidualBoundary.md`  

---

## 1. Naming the Axes (Godspeed Step 1)

In accordance with `/skill:godspeed`, `SCORECARD.md:886-894,924-934`, and the round-20 contract:

1. **`depth` (Primary Declared Axis for Round 20)**:
   - Target Claim C1: `c1_lifecycle_decisions` moving 0 → 12.
   - Pinned source-only Chromium 154 Blink reading (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, S096 / S100).
   - Zero whole-domain scalar score promotion: tied-lowest score 8 held.
   - Zero runtime capability or browser execution claim.
2. **`operability` (Score 8)**:
   - Gate determinism, minimal environment isolation, pure git plumbing without shell expansion, and reproducible measurement binding verification via `scripts/check-measurement-binding.mjs`.
3. **`calibration` (Score 9)**:
   - Strict adherence to ground truth: exact four-file counted inputs derived from loaded git blobs rather than speculative under-declarations; explicit distinction between author-side delivery observations and machine-complete actor quiescence.
4. **`freshness` (Score 8)**:
   - Anchored to pinned Chromium tag 154 (`154.0.8037.97`, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`), decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
5. **`coverage` (Score 9)**:
   - Finite sample of 12 documented decisions in manifest and knowledge note; no claim of an exhaustive decision universe or novel branches.
6. **`adjacency` (Score 8)**:
   - Zero conflict or write encroachment with fleet/sibling lanes (`kaidoku`, `kake`, `kagi`, `kama`).

---

## 2. Integrated Boundary Review

### 2.1 One-Claim Boundary (C1 Only, Zero Scalar Credit)
- **Claim Scope**: Round 20 declares strictly one claim: C1 (`depth: 0 → 12`).
- **Score Stability**: `SCORECARD.md:924-934` records that scalar depth remains 8 (lowest non-retired tie); no whole-domain scalar promotion is asserted.
- **Runtime Non-Claim**: Across `decisions.json:9`, `webmcp-completion-lifecycle-round-20.md:9-10`, `SKILL.md:2261-2262`, `corpus/README.md:440-445`, and `integration-final.json:8`, the scope is explicitly stated as:
  `"source-only Chromium 154.0.8037.97; no new runtime observation in round 20"`.
  No browser execution, host process control, wire mapping, or new runtime capability is claimed.
- **Coverage Denominator Guard**: The 12 decisions (LC01–LC12) are explicitly qualified as a finite sample of documented decisions from a single source body, not 12 novel independent branches or a complete state-machine universe.

### 2.2 Source Reuse and Curation Audit
- **Registry Rows**:
  - `S096` (`corpus/SOURCES.md:110`): Pinned Gitiles URL at tag `154.0.8037.97`, decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Immutable cells were untouched; only the mutable `used-by` cell was appended to point to `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
  - `S100` (`corpus/SOURCES.md:114`): Explicit same-body reuse of `S096` (same URL, tag, and decoded digest `8c8d6796...`), extending anchors to lines 174-328 and 635-842 specifically for LC11 (lines 787-815). `S100` explicitly disclaims independent corroboration, publisher diversity, or source-growth credit.
  - `S094` remains recorded as a rejected lead (HTTP 404 for guessed unit test).
- **Census Verification**:
  Evaluation of `node .ufo/waves/round-20/counts.mjs ac10319843f718489a10b89a8d2a568879aaf980` from the lane root yields:
  `{"revision":"ac10319843f718489a10b89a8d2a568879aaf980","rows":100,"tiers":{"A":87,"B":4,"C":9},"statuses":{"mined":72,"queued":19,"rejected":9},"knowledge":38}`.
  Compared to baseline `c4992943...` (rows 99, tier A 86, mined 71, knowledge 37), the delta is exactly +1 row (`S100`), +1 tier A, +1 mined, and +1 knowledge note (`webmcp-completion-lifecycle-round-20.md`). No phantom sources, tier reclassifications, or unrecorded deletions exist.

### 2.3 Append-Only Corpus Corrections
- **Non-Destructive History**:
  In both `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (lines 25-40) and `SKILL.md` (lines 2207-2228), the initial table and descriptions were retained verbatim as history.
- **Canonical Supersession**:
  The canonical corrected table was appended under:
  `## Round-20 falsification correction — canonical source guidance`
  `### Declarative WebMCP completion lifecycle — corrected source-scoped (round 20)`
  (`webmcp-completion-lifecycle-round-20.md:108-123`, `SKILL.md:2269-2284`).
- **Counter Routing**:
  `measure-c1.mjs:411-468` specifically identifies the unique corrected heading, bounds the current canonical section, validates manifest decisions against it, and tolerates the historical original section while rejecting any unauthorized LC rows outside those sections.
- **Corpus Cross-References**:
  `corpus/README.md:454-462` provides a dedicated `Round-20 falsification correction index` mapping historical pointers to canonical guidance; `corpus/QUALITY.md:229-241` appends criteria 50 and 51, anchored in round 20 lessons and reports.

### 2.4 Snapshot Withdrawal and Pushed Return Freeze
- **Wave-1 Flag Withdrawal**:
  In wave 1, `return.json` and `outcome.json` originally included `all64Settled` and `allSettledBeforeImport`. As established in `.ufo/waves/round-20/w1/ordering-correction.json` and `LOG.md:1232-1238`, peer messages can awaken parked subagents (e.g., `CriticIsolation` performed post-capture report edits). A task-return barrier is not an actor-quiescence barrier. These flags were formally withdrawn as all-actor assertions.
- **Wave-2 Separate Return Freeze**:
  In wave 2, all 64 task returns, reports, and `.ufo/waves/round-20/w2/return.json` were captured and committed in a separate pushed commit:
  `e0b5d02a6aef76b0d2799d92618f79f1bca40062` ("round-20: freeze falsification return before repair imports").
  Commit `e0b5d02...` contains zero production code, manifest, or corpus repairs.
- **Post-Freeze Repairs**:
  Post-falsification repairs (`check-wave.mjs`, `measure-c1.mjs`, `selftest-c1.mjs`, `expected.json`, `decisions.json`, `SKILL.md`, `corpus/`) were landed subsequently in:
  `ac10319843f718489a10b89a8d2a568879aaf980` ("round-20: land canonical source corrections and falsified gate repairs").
  This establishes an immutable cryptographic boundary proving that return capture preceded repair imports.

### 2.5 Exact Blob and Bundle Provenance
- **Clone Isolation**:
  Production writers operated in separate clones:
  - Wave 1: `.ufo/waves/round-20/clones/{ExecCounter, ExecFixtures, ExecFrozen, ScribeLifecycle}` based at `c4992943...` (`isolation-ledger.json:7-93`).
  - Repairs: `.ufo/waves/round-20/final-clones/{ExecCounter, ExecFixtures, ExecFrozen}` based at `4ae99816...` (`repair-ledger.json:6-118`).
- **Durable Bundles**:
  Throwaway clones were purged; durable git bundles were preserved in `.ufo/waves/round-20/writer-bundles/` and `.ufo/waves/round-20/writer-bundles/repairs/`. All seven bundles pass `git bundle verify` against their respective bases.
- **Blob-Level Ledger**:
  In `repair-ledger.json`, every imported blob records its `sourceCommit`, `sourceBlob`, exact SHA-256 digest, byte count, and provenance (`"importedFrom": "immutable git show blob, not worktree"`).
- **Disclosed Integrations**:
  Main modifications to donor payloads (such as documentary final design hashes or comment clarifications) are transparently disclosed in `integration-final.json:25-43` under `donorMainDifferences`.
- **Source Byte Verification**:
  In `source-opening.json`, the uncompressed HTTP base64 response body (`91040` B, SHA-256 `ff55d511...`) and the stored gzip archive (`.ufo/waves/round-20/source-opened.base64.gz`, `25397` B, SHA-256 `46966f05...`) are explicitly distinguished. Gunzipping and base64-decoding reproduces the exact retained source `corpus/evidence/round-20/sources/html_form_element.cc` (`68278` B, SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`).

### 2.6 Checkpoint Debts vs. Final False Claims
- **Intentional Deferred Debts**:
  - `corpus/lessons/round-20.md` does not exist yet; `integration-final.json:18` states it will be written exactly once after verification.
  - `.ufo/waves/round-20/measurement-binding.json` does not exist yet; `integration-final.json:19` states it will be created after the final code checkpoint.
  - Verification results in `SCORECARD.md` are explicitly labeled as declared, not executed.
- **Truthful Status**:
  The repository nowhere claims that these artifacts currently exist. Retaining them as checkpoint debts to be fulfilled serially by Main after residual review is fully compliant with the contract and distinct from fraudulent false claims.

---

## 3. Evidence & Core Contradiction

Across the round's proposals and verification surfaces, an important second-order tension exists:

1. **Counted Inputs Asymmetry (`ReviewBindingInputs` vs. Gate Execution)**:
   - Wave 1 `ReviewBinding.md` guessed a minimal 2-file input set (`decisions.json`, `html_form_element.cc`).
   - Wave 2 `ReviewBindingInputs.md` and `integration-final.json:1262-1263` correctly noted that `measure-c1.mjs:68-74` loads **four** regular blobs via git plumbing:
     1. `corpus/evidence/round-20/lifecycle/decisions.json`
     2. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`
     3. `corpus/SOURCES.md`
     4. `corpus/evidence/round-20/sources/html_form_element.cc`
   - Under `scripts/check-measurement-binding.mjs:67-68`, the binding gate evaluates:
     `git diff --name-only measuredRevision REV -- <countedInputs> <counter.path>`.
     If any counted input changes between `measuredRevision` and the delivered `REV`, the gate fails with `counted_input_changed`.
   - If `corpus/SOURCES.md` or `corpus/knowledge/...` is included in `countedInputs` (as correctness demands), but Main subsequently commits `corpus/lessons/round-20.md` while making any incidental edit to `corpus/SOURCES.md` (e.g. updating used-by or gate references), the binding check will fail.

2. **Curation Census Invocation Ambiguity**:
   - `counts.mjs:11-13` executes `git show ${revision}:corpus/SOURCES.md` and `git ls-tree ... corpus/knowledge/` without resolving repository root via `git rev-parse --show-toplevel`.
   - If invoked from a parent or sibling directory, `counts.mjs` exits 2 (`fatal: path 'corpus/SOURCES.md' does not exist`). In contrast, `measure-c1.mjs:679-684` resolves `repoRoot()` dynamically via `git rev-parse --show-toplevel` and passes `repo` as `cwd` to all git spawns.

---

## 4. Proposed Move (One Bounded Synthesis)

Synthesize the findings of `ReviewBindingInputs`, `ReviewReturnBoundary`, `CounterHeading`, and `isolation-ledger` into a strict **Binding-Closure Protocol**:

1. **Formalize the 4-File Counted-Input Contract**:
   When Main authors `.ufo/waves/round-20/measurement-binding.json`, `countedInputs` MUST contain exactly the four git-loaded blobs:
   ```json
   "countedInputs": [
     "corpus/evidence/round-20/lifecycle/decisions.json",
     "corpus/knowledge/webmcp-completion-lifecycle-round-20.md",
     "corpus/SOURCES.md",
     "corpus/evidence/round-20/sources/html_form_element.cc"
   ]
   ```
2. **Enforce Inviolable Commit Boundary for Binding**:
   - `measuredRevision` in `measurement-binding.json` must be set to the post-residual integration checkpoint (which includes all 8 residual reports and all code/manifest/note files).
   - In the final delivery commit (which adds `corpus/lessons/round-20.md`, `measurement-binding.json`, `LOG.md`, and `SCORECARD.md`), **none of the four counted inputs and neither counter script may be touched**.
   - `corpus/SOURCES.md` and `corpus/README.md` already reflect the S100 addition and correction indexes in `ac10319...`; they must remain strictly untouched in the lesson-landing commit.
3. **Specify Curation Probe Execution Contract**:
   Document that `counts.mjs` and `lesson-history.mjs` require execution with lane root as `cwd` (as documented in `SKILL.md:2245`), maintaining parity with `measure-c1.mjs` without modifying committed probe scripts mid-flight.

---

## 5. Affected Axes

- **`calibration` (Improved)**:
  Eliminates speculative under-declaration of binding inputs; ensures that every file read by `measure-c1.mjs` is tracked, preventing undetected drift across measurement and delivery.
- **`operability` (Improved)**:
  Guarantees that `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-20/measurement-binding.json --at HEAD --reproduce` executes cleanly with exit 0 and zero `counted_input_changed` findings.
- **`depth` (Protected, Harm None)**:
  Preserves the 12 lifecycle decisions and their source-only scope intact without dilution.
- **`freshness`, `coverage`, `adjacency` (Protected, Harm None)**:
  Maintains exact Chromium 154 pins, 12-decision finite coverage, and lane boundaries.

---

## 6. Risks & Verification

### Risks
- If Main edits `corpus/SOURCES.md` while authoring `corpus/lessons/round-20.md`, `check-measurement-binding.mjs` will flag `counted_input_changed`.
- *Mitigation*: The S100 and S096 rows are already fully curated and audited at `ac10319...`. The round-20 lesson only cites existing rows and does not require editing `corpus/SOURCES.md`.

### Verification (To be executed by Main post-integration)
1. **Binding Conformance**:
   ```sh
   node scripts/check-measurement-binding.mjs --check .ufo/waves/round-20/measurement-binding.json --at HEAD --reproduce
   ```
   *Expectation*: Exit 0, 0 findings, `reproducedCount: 12`.
2. **C1 Counter**:
   ```sh
   node .ufo/waves/round-20/measure-c1.mjs HEAD
   ```
   *Expectation*: Exit 0, `c1_lifecycle_decisions: 12`, `findings: []`.
3. **Curation Census**:
   ```sh
   node .ufo/waves/round-20/counts.mjs HEAD
   ```
   *Expectation*: Exit 0, `rows: 100`, `tiers: {"A":87,"B":4,"C":9}`, `statuses: {"mined":72,"queued":19,"rejected":9}`, `knowledge: 38`.
4. **Frozen Wave Gate**:
   ```sh
   node .ufo/waves/round-20/check-wave.mjs --frozen .ufo/waves/round-20/w1/frozen
   ```
   *Expectation*: Exit 0, clean verdict.

---
Report: .ufo/waves/round-20/residual/ResidualBoundary.md
