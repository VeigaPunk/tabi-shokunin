# NodeSemantics Scout Report: Round-13 Node Version Tri-Part Distinction & Enforcement Anchors

- **Seat**: `TabiR14.NodeSemantics` (Leaf Scout subagent)
- **Wave**: `tabi-round-14-w1`
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- **Date**: 2026-10-20
- **Target**: Read-only round13 runtime pin/receipt/spec under `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-13/aria`. Distinguish observed Node, minimumMajor, and recorded metadata; exact enforcement/source anchors; send ReceiptRepair.
- **Report Path**: `.ufo/waves/round-14/w1/NodeSemantics.md`

---

## 1. Godspeed Axes

1. **Precision**: Establishing an unambiguous tri-part epistemic distinction between:
   - Actual observed execution engine (`Node 26.12.0`).
   - Sole enforced syntactic runtime constraint (`minimumMajor >= 20`).
   - Stale descriptive metadata (`recorded: "24.21.0"` in `runtime-pin.json`).
2. **Groundedness**: Providing resolvable line-level, byte-level, and cryptographic SHA-256 anchors across `aria-loopback.spec.mjs`, `scripts/aria-loopback-round13.mjs`, `receipt.json`, `runtime-pin.json`, and worker outputs.
3. **Integrity & Immobility**: Retaining the historical round-13 evidence, receipts, and pins byte-for-byte; zero retro-editing of committed artifacts; zero simulated or fabricated browser execution runs.
4. **Calibration**: Directly informing Claim C2 calibration (`scripts/check-aria-metadata.mjs` and derived sidecar `corpus/evidence/round-14/aria-metadata/corrected.json`), ensuring the validator rejects false "Node mismatch" or false "exact Node pin" claims while enforcing fail-closed contract rules.
5. **Operability**: Strictly leaf-bounded execution. Zero test runner executions, zero git mutations, zero gate runs. Clean, non-destructive verification commands provided for L1.

---

## 2. Artifact Identification & Cryptographic Identity

All analyzed files are committed, read-only artifacts under `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

| Artifact | Relative Path | Bytes | SHA-256 Digest |
|---|---|---|---|
| **Runtime Pin** | `corpus/evidence/round-13/aria/runtime-pin.json` | 1,040 | `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2` |
| **Committed Receipt** | `corpus/evidence/round-13/aria/receipt.json` | 97,893 | `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` |
| **Worker Receipt** | `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json` | 91,436 | `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7` |
| **Test Spec** | `corpus/evidence/round-13/aria/aria-loopback.spec.mjs` | 61,570 | `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc` |
| **Runner Script** | `scripts/aria-loopback-round13.mjs` | 25,141 | `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c` |

Verification: `receipt.runtime.pinned.pinSha256` (`receipt.json:37`) exactly matches `runtime-pin.json` (`4d894756…`). `receipt.sourceSha256` (`receipt.json:8`) exactly matches `scripts/aria-loopback-round13.mjs` (`1d54c9e9…`).

---

## 3. The Tri-Part Distinction of Node Semantics

An exact reading of the source code and committed evidence reveals three distinct concepts that must never be conflated:

### A. Observed Node: `"26.12.0"`
- **Definition**: The live Node.js engine version active when the test suite executed on 2026-10-20.
- **Source Anchor (Producer)**:
  - `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:226-227`:
    ```javascript
    return {
      node: process.versions.node,
      nodeMajor: Number(process.versions.node.split('.')[0]),
      ...
    };
    ```
  - `scripts/aria-loopback-round13.mjs:92`:
    `node: process.versions.node,`
  - `scripts/aria-loopback-round13.mjs:405`:
    `node: runtimeSource?.node ?? process.versions.node,`
- **Evidence Anchors (Recorded Facts)**:
  - `receipt.json:20`: `"node": "26.12.0"` (under `runtime`).
  - `actual/workers/worker-0-1530637-1792474958700.json:24`: `"node": "26.12.0"` (under `runtime`).
  - `corpus/evidence/round-13/aria-initial-receipt.json:20`: `"node": "26.12.0"`.
  - `corpus/evidence/round-13/aria-second-receipt.json:24`: `"node": "26.12.0"`.

### B. Enforced Node Constraint: `minimumMajor: 20`
- **Definition**: The minimum major version required by the test harness.
- **Source Anchor (Enforcement)**:
  - `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:269`:
    ```javascript
    function assertPinnedRuntime() {
      expect(RUNTIME.pwtVersion).toBe(PIN.playwrightTest);
      expect(RUNTIME.playwrightVersion).toBe(PIN.playwright);
      expect(RUNTIME.coreVersion).toBe(PIN.playwrightCore);
      expect(RUNTIME.executablePath.endsWith(PIN.chromium.executableSuffix)).toBe(true);
      expect(RUNTIME.executableSha256).toBe(PIN.chromium.executableSha256);
      expect(RUNTIME.executableBytes).toBe(PIN.chromium.bytes);
      expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor);
    }
    ```
- **Semantics**: The assertion is strictly an **inequality comparison** (`>= 20`).
- **Evaluation**: Observed major version was `26`. Because `26 >= 20` evaluates to `true`, this enforcement completely and honestly **passed**.
- **Evidence Anchors**:
  - `runtime-pin.json:16`: `"minimumMajor": 20`.
  - `receipt.json:63`: `"minimumMajor": 20` (in embedded copy of pin).
  - `worker-0-1530637-1792474958700.json:63`: `"minimumMajor": 20`.

### C. Recorded Descriptive Metadata: `"24.21.0"`
- **Definition**: A historical baseline note from the environment in which `runtime-pin.json` was authored or initially captured.
- **Source Anchor**:
  - `runtime-pin.json:15`:
    ```json
      "node": {
        "recorded": "24.21.0",
        "minimumMajor": 20
      },
    ```
- **Enforcement Status**: **ZERO ENFORCEMENT**.
  - `PIN.node.recorded` is **never referenced or compared** anywhere in `aria-loopback.spec.mjs` or `scripts/aria-loopback-round13.mjs`.
  - In `aria-loopback.spec.mjs:241-260` (`runtimePinStatus()`):
    ```javascript
    function runtimePinStatus() {
      if (!RUNTIME || !PIN) {
        return { matched: false, playwrightMatched: false, chromiumMatched: false, browserVersionMatched: false };
      }
      const playwrightMatched =
        RUNTIME.pwtVersion === PIN.playwrightTest &&
        RUNTIME.playwrightVersion === PIN.playwright &&
        RUNTIME.coreVersion === PIN.playwrightCore;
      const chromiumMatched =
        RUNTIME.executableSha256 === PIN.chromium.executableSha256 &&
        RUNTIME.executableBytes === PIN.chromium.bytes &&
        RUNTIME.executablePath.endsWith(PIN.chromium.executableSuffix);
      const browserVersionMatched = BROWSER_VERSION === PIN.chromium.version;
      return {
        matched: playwrightMatched && chromiumMatched && browserVersionMatched,
        playwrightMatched,
        chromiumMatched,
        browserVersionMatched,
      };
    }
    ```
  - In `scripts/aria-loopback-round13.mjs:396-403`:
    ```javascript
    const chromiumMatched = Boolean(
      chromium.executablePath &&
        chromium.executableSha256 === pin.chromium.executableSha256 &&
        chromium.executableBytes === pin.chromium.bytes,
    );
    const browserVersionMatched = browserVersion === pin.chromium.version && browserVersions.length <= 1;
    const runtimePinMatched = playwrightMatched && chromiumMatched && browserVersionMatched;
    ```
  - Both status functions calculate `matched = playwrightMatched && chromiumMatched && browserVersionMatched`.
  - **Node version matching is completely absent from `runtimePinMatched`.**
  - Consequently, `receipt.json:38` `"matched": true` applies **exclusively to Playwright and Chromium**, not Node.

---

## 4. Verification History & Non-Author Spotcheck Rulings

The distinction established here directly corroborates the outside spot-check from round 13 and the gate definitions of round 14:

1. **Round 13 Verifier Spotcheck** (`corpus/lessons/round-13-verifier-spotcheck.md:100`):
   > *"Observed Node26.12.0 satisfies enforced minimumMajor20; pin.node.recorded24.21.0 is stale descriptive metadata, not an exact enforced Node pin."*
2. **Round 13 Verifier Recommendation** (`corpus/lessons/round-13-verifier-spotcheck.md:159`):
   > *"2. tabi — reproducibility wording: distinguish observed Node26.12.0 from `runtime-pin.json`'s recorded24.21.0 and minimumMajor20; correct stale recorded metadata through a qualified new artifact, without pretending exact Node equality was enforced."*
3. **Round 14 Gate Specification** (`corpus/lessons/round-14.md:12`):
   > *"- rejected: treating Node's descriptive recorded24.21.0 as an enforced exact version. The retained runtime observed26.12.0; minimumMajor20 is a minimum, not equality. Flip: a separately exercised exact-version check and new runtime evidence."*

---

## 5. Requirements Delivered to `TabiR14.ReceiptRepair`

The findings and formal rules were transmitted via agent messaging to `TabiR14.ReceiptRepair` to guide the implementation of `scripts/check-aria-metadata.mjs` and the derivation of `corpus/evidence/round-14/aria-metadata/corrected.json`:

1. **Sidecar Node Structure**:
   The sidecar must not emit a naive `nodeMatched: true` or pretend Node equality was checked. Instead, it must serialize explicit, granular qualifications:
   ```json
   "node": {
     "observed": "26.12.0",
     "minimumMajor": 20,
     "minimumMajorSatisfied": true,
     "recorded": "24.21.0",
     "exactRecordedMatch": false,
     "descriptiveOnly": true
   }
   ```
2. **Fail-Closed Validation Contracts**:
   - Parse `receipt.runtime.node` and `worker.runtime.node` strictly against SemVer `/^(\d+)\.(\d+)\.(\d+)$/`. Any parse failure must produce finding `node-version-malformed`.
   - Require `receipt.runtime.node === worker.runtime.node`. A disagreement must fail with finding `node-version-discrepancy`.
   - Assert `nodeMajor >= minimumMajor`. A violation must produce finding `node-minimum-major-violation`.
   - Validate that `pin.node.recorded` and `pin.node.minimumMajor` exist with proper types (string and integer).
3. **Epistemic Derivation Boundary**:
   - The sidecar must explicitly state `executed: false` and `derivedFrom: "historical-round-13-runtime"`.
   - Zero claims of a new browser run, new execution timestamp, or new accessibility audit capability.
   - Historical artifacts (`corpus/evidence/round-13/aria/receipt.json` and `runtime-pin.json`) remain strictly byte-pinned and immutable.

---

## 6. Recommended Verification Commands for L1

L1 should run the following commands to confirm node semantics, digest binding, and metadata calibration:

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin

# 1. Verify byte-exact identity of round-13 evidence and pins
sha256sum \
  corpus/evidence/round-13/aria/runtime-pin.json \
  corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json \
  scripts/aria-loopback-round13.mjs
# Expected:
# 4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2  corpus/evidence/round-13/aria/runtime-pin.json
# b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  corpus/evidence/round-13/aria/receipt.json
# 0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7  corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json
# 1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c  scripts/aria-loopback-round13.mjs

# 2. Verify check-aria-metadata self-test and witness once landed by ReceiptRepair
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --witness

# 3. Verify sidecar qualification and hash preservation
node scripts/check-aria-metadata.mjs --check
```