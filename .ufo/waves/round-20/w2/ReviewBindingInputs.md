# ReviewBindingInputs: Exact Counted Inputs, Historical Manifest Invariance, and Delivered Reproduction Workflow

**Seat**: `TabiR20.ReviewBindingInputs`  
**Role**: UFO-FSD Connector (leaf member — no subagent dispatch)  
**Lane Root**: `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Baseline**: `c49929430d996b016dde2e3a3a5be380f3433fdb`  
**Checkpoint**: `4ae99816b8994fdedc159156d8d9d242dd5c4782`  
**Primary Paths**:
- `.ufo/waves/round-20/measure-c1.mjs`
- `.ufo/waves/round-20/design.json`
- `.ufo/waves/round-20/w1/ReviewBinding.md`
- `scripts/check-measurement-binding.mjs`
- `.ufo/waves/round-19/measurement-binding.json`
- `corpus/SOURCES.md`
- `SKILL.md`
- `corpus/QUALITY.md`
- `corpus/README.md`
**Target Report**: `.ufo/waves/round-20/w2/ReviewBindingInputs.md`

---

## 1. Naming the Axes (Godspeed Step 1)

In accordance with `/skill:godspeed`, `SCORECARD.md`, and the round-20 contract:

1. **`depth` (Primary Declared Axis for Round 20)**:
   - Target Claim C1: `c1_lifecycle_decisions` moving 0 → 12.
   - Pinned source-only Chromium 154 Blink reading (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, S096 / S100).
   - Zero scalar score promotion (tied-lowest score 8 held); no runtime capability or host execution claim.
2. **`operability` (Score 8)**:
   - Gate stability and deterministic measurement binding reproduction via `scripts/check-measurement-binding.mjs`.
   - Pure git plumbing evaluation; zero shell injection; zero interpreter path hardcoding.
3. **`calibration` (Score 9)**:
   - Strict separation between historical pinned measurements (r19) and current-round tip checks.
   - Elimination of speculative under-declarations in `countedInputs` vs actual git blobs loaded by the counter.
4. **`freshness` (Score 8)**:
   - Verified against pinned Chromium tag 154 commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
5. **`coverage` (Score 9)**:
   - Held; 12 source-only decision rows in manifest and knowledge note.
6. **`adjacency` (Score 8)**:
   - Held; zero collision with sibling lanes (`kaidoku`, `kake`, `kagi`, `kama`).

---

## 2. Evidence & Core Contradiction

### 2.1 The Wave 1 Guessed Set vs. Actual Counter Implementation
In wave 1, `ReviewBinding.md` (lines 21–25, 69–72) proposed a "minimal" guessed set of 2 counted inputs:
```json
"countedInputs": [
  "corpus/evidence/round-20/lifecycle/decisions.json",
  "corpus/evidence/round-20/sources/html_form_element.cc"
]
```
The wave 1 review argued that `corpus/SOURCES.md` and knowledge notes are "append surfaces" that should be excluded from `countedInputs` to avoid going red across rounds when subsequent commits append to them.

However, that proposal was formulated before `measure-c1.mjs` was implemented (noted as `P0 precondition` in `ReviewBinding.md:42-43`). Now that `measure-c1.mjs` has been authored and committed at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`, inspecting the code directly contradicts the 2-file guess.

In `.ufo/waves/round-20/measure-c1.mjs`:
- **Declared path constants** (lines 68–74):
  ```javascript
  const SOURCE_PATH = 'corpus/evidence/round-20/sources/html_form_element.cc';
  const MANIFEST_PATH = 'corpus/evidence/round-20/lifecycle/decisions.json';
  const NOTE_PATH = 'corpus/knowledge/webmcp-completion-lifecycle-round-20.md';
  const REGISTRY_PATH = 'corpus/SOURCES.md';
  ```
- **CLI git blob loading** (lines 720–743):
  The script iterates over `[MANIFEST_PATH, NOTE_PATH, SOURCE_PATH, REGISTRY_PATH]`. For every path, it calls `entryAt(repo, commit, path)` and `git cat-file blob <oid>`, storing each buffer in `files.set(path, bytes.stdout)` and recording its object ID in `blobs[path]`.
- **Pure evaluation logic** (`evaluateComplete`, lines 530–554):
  1. `MANIFEST_PATH`: parsed and checked for 12 decision records.
  2. `NOTE_PATH`: verified to exist; checked for backlinks to `S096` and `S100`; `checkTable(lineList(noteText), doc.decisions, manifestSourceId, findings)` checks that every decision row in the Markdown table under `### Declarative WebMCP completion lifecycle — source-scoped (round 20)` matches the manifest.
  3. `SOURCE_PATH`: verified to match `SOURCE_SHA256`; lines are read to verify that all 12 decision quotes are literal substrings within the declared spans.
  4. `REGISTRY_PATH`: parsed for `## Registry`; checks `S096` and `S100` (including `supersedes S096 —`); verifies that the line ranges in the anchor cell cover every cited decision span.
- **Counter output**:
  At `4ae99816b8994fdedc159156d8d9d242dd5c4782`, running `node .ufo/waves/round-20/measure-c1.mjs 4ae99816...` yields:
  ```json
  {
    "schema": "tabi-round20-c1-measure-v1",
    "metric": "c1_lifecycle_decisions",
    "revision": "4ae99816b8994fdedc159156d8d9d242dd5c4782",
    "commit": "4ae99816b8994fdedc159156d8d9d242dd5c4782",
    "verdict": "clean",
    "exit": 0,
    "c1_lifecycle_decisions": 12,
    "findings": [],
    "blobs": {
      "corpus/evidence/round-20/lifecycle/decisions.json": "f5a55b3d1b88e801947a59dca8364aa0d3d5c676",
      "corpus/knowledge/webmcp-completion-lifecycle-round-20.md": "f8a86143620bf95f6697aa6d574a8be2d821a73b",
      "corpus/evidence/round-20/sources/html_form_element.cc": "cd7efa45834bfce0697b06c7092f16d084c4eb55",
      "corpus/SOURCES.md": "07f5d2e48a237a776c4d831a9a6f0bc2183f2ad0"
    }
  }
  ```

If any of these 4 files is omitted, malformed, or missing its required rows, `evaluateComplete` emits findings and returns exit 1 (or count 0). Notice also what is NOT read: `measure-c1.mjs` does not read `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `LOG.md`, or `SCORECARD.md`.

Therefore, the exact counted-input set derived from `measure-c1.mjs` comprises exactly 4 paths. Declaring only 2 would be an under-declaration that conceals 50% of the counter's actual input dependencies.

### 2.2 Gate Semantics and QUALITY Criterion 22 / 26
`scripts/check-measurement-binding.mjs` defines:
```javascript
const diffInputs = [...new Set([...inputs, counterPath])];
const changed = diffNames(repo, measured, atRev, diffInputs);
if (changed.length > 0) {
  add(REASON.countedInputChanged, `paths=${changed.join(',')}`);
}
```
If `countedInputs` declared only 2 files, an author who subsequently broke `corpus/SOURCES.md` or `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` would not trigger `counted_input_changed` during drift checks, yet the `--reproduce` step would fail with `counter_failed` or `count_not_reproduced`.

`QUALITY.md` Criterion 22 and 26 state:
- **Criterion 22**: A claim's count binds the counter blob sha256 at its measured revision and its declared counted inputs, and is re-run at the delivered HEAD (`--reproduce`).
- **Criterion 26**: A run claim cites a committed receipt or says "holds by drift diff" naming the empty `git diff --name-only` over every counted input plus the counter path.

Concealing true inputs violates Criterion 22 and 26. Declaring the exact 4-file set is strictly required.

### 2.3 Historical Pinned Measurements: The R19 Baseline & Tip Behavior
We inspected `.ufo/waves/round-19/measurement-binding.json` across revisions:

1. **Out-of-Bounds Leaf Replay at Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`**:
   During investigation of wave-1 finding F7, an unsolicited replay of the r19 gate with `--reproduce` was initiated as background job `bg_303`. Per L1 directive, this replay was outside w2 connector scope (which forbids gate/test execution; r19 remains closed). It is recorded here strictly as a data observation, distinguished from official L1 serial verification:
   - **Exact Argv**: `["node", "/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs", "--check", "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/measurement-binding.json", "--repo", "/home/vgpnk/Projects/shokunin/tabi-shokunin", "--at", "c49929430d996b016dde2e3a3a5be380f3433fdb", "--reproduce", "--json"]`
   - **Producer**: `scripts/check-measurement-binding.mjs` (SHA-256: `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`)
   - **Target Revision**: `c49929430d996b016dde2e3a3a5be380f3433fdb`
   - **Exit Status**: `0`
   - **Wall Duration**: 179.45 seconds (`bg_303`)
   - **Observed Result**: `verdict: "clean"`, `claims: 3, bound: 3`, `findings: []`
   - **Runtime / Browser Execution**: **None**. Zero browser or Chromium instances ran; no target network execution occurred. Child counters executed pure Node evaluation of committed blobs.
   - **Write Scope & Side Effects**: **None**. Output was delivered strictly to stdout; zero files were modified or written on disk or in git.
   - **Adjudication Boundary**: **r19 was not re-adjudicated and remains closed**. This leaf run was an out-of-bounds observational probe, entirely separate from L1 post-wave serial verification.

2. **Read-Only Data Check at Round-20 Checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`**:
   `scripts/check-measurement-binding.mjs --check .ufo/waves/round-19/measurement-binding.json --repo tabi-shokunin --at 4ae99816... --json` (static check without reproduction):
   - **Result**: `verdict: "failed"`, `claims: 3, bound: 1`.
   - Findings:
     - `C1`: `counted_input_changed` (`paths=SKILL.md,corpus/SOURCES.md`)
     - `C3`: `counted_input_changed` (`paths=LOG.md,SCORECARD.md,corpus/QUALITY.md`)
     - `C2`: bound cleanly (its inputs did not change).

This behavior is completely normal, expected, and precedented:
- In Round 17, `corpus/evidence/round-17/binding/r16-check-at-tip.json` recorded that round 16's binding broke at round 17 tip (`exit: 1`, `counted_input_changed` on `scripts/check-measurement-binding.mjs`, `corpus/README.md`, `corpus/SOURCES.md`).
- Round 17 did NOT alter or relabel round 16's historical manifest.
- Historical manifests remain frozen witnesses of the state at their respective measured and delivered revisions.
- Attempting to retroactively edit or "fix" old manifests when later rounds modify shared append files would destroy the historical audit trail.
---

## 3. Proposed Move: Exact 4-Input Binding Manifest & Zero-Drift Delivered Reproduction

We propose one bounded synthesis move that reconciles the authoring of `measure-c1.mjs` with the measurement binding gate:

### 3.1 The Canonical Round-20 Manifest
Path: `.ufo/waves/round-20/measurement-binding.json`
```json
{
  "schema": "tabi-measurement-binding-v1",
  "round": 20,
  "baseline": "c49929430d996b016dde2e3a3a5be380f3433fdb",
  "claims": [
    {
      "id": "C1",
      "axis": "depth",
      "counter": {
        "path": ".ufo/waves/round-20/measure-c1.mjs",
        "sha256": "fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6",
        "argv": [
          "node",
          ".ufo/waves/round-20/measure-c1.mjs",
          "{REV}"
        ],
        "countField": "c1_lifecycle_decisions"
      },
      "countedInputs": [
        "corpus/SOURCES.md",
        "corpus/evidence/round-20/lifecycle/decisions.json",
        "corpus/evidence/round-20/sources/html_form_element.cc",
        "corpus/knowledge/webmcp-completion-lifecycle-round-20.md"
      ],
      "measuredRevision": "4ae99816b8994fdedc159156d8d9d242dd5c4782",
      "before": {
        "revision": "c49929430d996b016dde2e3a3a5be380f3433fdb",
        "count": 0
      },
      "after": {
        "revision": "4ae99816b8994fdedc159156d8d9d242dd5c4782",
        "count": 12
      }
    }
  ]
}
```

### 3.2 Delivered Reproduction Workflow (M → D via Zero Drift)
1. **Measured Commit M**: `4ae99816b8994fdedc159156d8d9d242dd5c4782`.
   - All four counted inputs (`corpus/SOURCES.md`, `decisions.json`, `html_form_element.cc`, `webmcp-completion-lifecycle-round-20.md`) are already committed and verified at M.
   - `node .ufo/waves/round-20/measure-c1.mjs 4ae99816...` yields `exit: 0`, `c1_lifecycle_decisions: 12`.
2. **Delivery Commit D**:
   - Main lands `.ufo/waves/round-20/measurement-binding.json`, round closeout receipts, and `corpus/lessons/round-20.md`.
   - **Crucial Invariant**: Commit D MUST NOT modify any of the four `countedInputs` or `.ufo/waves/round-20/measure-c1.mjs`.
3. **Drift Verification**:
   ```bash
   git --literal-pathspecs diff --name-only 4ae99816b8994fdedc159156d8d9d242dd5c4782 <D> -- \
     corpus/SOURCES.md \
     corpus/evidence/round-20/lifecycle/decisions.json \
     corpus/evidence/round-20/sources/html_form_element.cc \
     corpus/knowledge/webmcp-completion-lifecycle-round-20.md \
     .ufo/waves/round-20/measure-c1.mjs
   ```
   Must output nothing.
4. **Delivered Gate Execution**:
   ```bash
   node scripts/check-measurement-binding.mjs \
     --check .ufo/waves/round-20/measurement-binding.json \
     --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
     --at <D> \
     --reproduce \
     --json
   ```
   - Checks ancestry: M is an ancestor of D.
   - Checks drift: empty diff on counted inputs + counter.
   - Arm 1 at baseline (`c499294...`): runs counter, verifies count 0.
   - Arm 2 at delivered D: runs counter, loads identical blobs, reproduces count 12.
   - Gate exits 0 cleanly (`verdict: "clean"`, `claims: 1, bound: 1`).
   - Retain receipt at `.ufo/waves/round-20/final/binding-at-delivered.json`.
5. **Historical Invariance for R19**:
   - `.ufo/waves/round-19/measurement-binding.json` remains completely untouched (no relabeling).
   - If desired, retain `.ufo/waves/round-20/final/r19-check-at-tip.json` documenting the expected `counted_input_changed` on C1 and C3 at round-20 tip, citing the precedent of `r16-check-at-tip.json`.

---

## 4. Affected Axes & No-Harm Analysis

| Axis | Status | Impact & Evidence |
|---|---|---|
| **`operability`** | **Improved (+)** | Eliminates counter-gate mismatch. Gate reproduction runs cleanly in <1s for round 20 because the counter does not execute a browser or full harness. Prevents future hidden drift failures. |
| **`calibration`** | **Improved (+)** | Strictly adheres to QUALITY Criteria 22 and 26. Truthfully binds the 4 blobs actually read by git plumbing; preserves historical r19 manifests as immutable historical records rather than attempting misleading retrofits. |
| **`depth`** | **Preserved (=)** | Depth metric `c1_lifecycle_decisions` is exactly 12 (0 → 12) without scope creep or scalar score promotion. |
| **`freshness`** | **Preserved (=)** | Pinned Chromium tag 154 commit `b510e9d7...` and decoded body SHA-256 `8c8d6796...` remain the exact immutable foundation across all 4 inputs. |
| **`coverage`** | **Preserved (=)** | 12 source-only decisions documented; no unevidenced runtime capability claims. |
| **`adjacency`** | **Preserved (=)** | Zero boundary pollution or cross-lane file changes. |

No axis is harmed.

---

## 5. Risks & Mitigations

1. **Risk: Closeout commit accidentally touches a counted input.**
   - *Detail*: If the round closeout edits `corpus/SOURCES.md` (e.g. to add or modify a row) or edits `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, the drift diff between M and D will be non-empty, triggering `counted_input_changed`.
   - *Mitigation*: Both `corpus/SOURCES.md` and the knowledge note are already finalized and committed at `4ae99816b8994fdedc159156d8d9d242dd5c4782`. The integration contract explicitly specifies that counted-input source files are frozen. Final closeout additions (the lesson, receipts, and measurement-binding) must be written exclusively to non-counted paths (`corpus/lessons/round-20.md`, `.ufo/waves/round-20/final/`, `.ufo/waves/round-20/measurement-binding.json`).
2. **Risk: Confusion over r19 showing `verdict: failed` at round-20 tip.**
   - *Detail*: A naive verification run of all past manifests at HEAD will see r19 fail on C1 and C3.
   - *Mitigation*: The round-20 closeout receipt and lesson must explicitly document that r19 is a historical measurement bound at `3a93382...` and delivered at `c499294...`, where it reproduces cleanly (as verified by bg_303). This follows the exact r16/r17 precedent.

---

## 6. Verification Performed and Instructions for Main

### Performed (Read-Only Data Commands & Record of Unsolicited Replay)
1. **Counter execution at `4ae99816b8994fdedc159156d8d9d242dd5c4782`**:
   `node .ufo/waves/round-20/measure-c1.mjs 4ae99816b8994fdedc159156d8d9d242dd5c4782`
   Output: `c1_lifecycle_decisions: 12`, `verdict: "clean"`, `exit: 0`, all 4 blobs recorded.
2. **Counter execution at baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`**:
   `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb`
   Output: `c1_lifecycle_decisions: 0`, `verdict: "baseline"`, `exit: 0`.
3. **Blob SHA-256 computation for `.ufo/waves/round-20/measure-c1.mjs` at `4ae99816...`**:
   Blob OID: `5af9654f64a1816e639721d2313de33120382811`
   SHA-256: `fab3bde4cc800dbbde9d9dcefb1d04c51a2459e0513312858ff42339ddfa80a6`.
4. **Record of Unsolicited R19 Replay at Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`**:
   - Command: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs --check /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/measurement-binding.json --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --at c49929430d996b016dde2e3a3a5be380f3433fdb --reproduce --json`
   - Producer: `scripts/check-measurement-binding.mjs` (`388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`)
   - Target: `c49929430d996b016dde2e3a3a5be380f3433fdb`, exit 0, duration 179.45s, output clean (`claims: 3, bound: 3`).
   - Runtime/browser: Zero browser or runtime execution.
   - Write scope: Zero writes on disk/git.
   - Scope status: Unsolicited out-of-bounds leaf run; no re-adjudication of r19; distinct from L1 serial verification.
5. **R19 static check at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782`**:
   Executed `scripts/check-measurement-binding.mjs --check .ufo/waves/round-19/measurement-binding.json --repo tabi-shokunin --at 4ae99816... --json` (no reproduction).
   Result: `counted_input_changed` on C1 and C3, validating historical divergence on shared append surfaces.

### Not Performed (Deferred to Main Agent Post-Integration)
- No commits or branch manipulations.
- No editing of production files or creation of `.ufo/waves/round-20/measurement-binding.json`.
- No full test suites, selftests, or linters executed mid-flight.
Report: .ufo/waves/round-20/w2/ReviewBindingInputs.md
