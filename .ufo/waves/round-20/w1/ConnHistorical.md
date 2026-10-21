# ConnHistorical — Connecting r19 partial C3 missing snapshot to present report-only wave ownership

Seat: `TabiR20.ConnHistorical` · Role: UFO-FSD connector (leaf member, no subagent dispatch).  
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline: `c49929430d996b016dde2e3a3a5be380f3433fdb`.  
Only own report write (`.ufo/waves/round-20/w1/ConnHistorical.md`). No mid-flight tests, builds, or formatters run. No tools installed or updated.

---

## 1. Name the Axes

- **`depth`**: Round-20 primary declared axis (C1 completion lifecycle decisions, 0 → 12). Must advance from unheld to source-held on Chromium 154 (`html_form_element.cc`, S096) without false runtime/capability inflation.
- **`contract` / `rigor`**: Strict adherence to QUALITY criteria:
  - **QUALITY 45**: Concurrent production writers prove clone isolation by committed ledger; before and after lane `git status --porcelain=v1 -uall` snapshots must differ only by files under the round's wave directory; tracked diff must be empty.
  - **QUALITY 48**: A reconstructed return-time status or tracked diff (even backed by mtimes) is NOT an observed before/after snapshot; checkers must reject reconstruction for closure credit; an irrecoverable historical observation stays unprovable.
  - **QUALITY 28**: Every evidence pointer in a lesson, note, or scorecard resolves as committed bytes.
- **`hygiene` / `isolation`**: Zero unassigned writes to the shared lane production tree; clean segregation between isolated clone writers and report-only seats.
- **`no-harm`**: No regression of existing gates, selftests, baseline status, or historical records. Round 19 C3 d4 remains permanently unprovable; no retrospective fabrication is admitted.

---

## 2. Local Evidence & Historical Context

### A. Round-19 Historical Defect (Partial C3, Unprovable d4)
- In round 19, calibration claim C3 aimed at target 4 (d1: LOG count, d2: SCORECARD assertion wording, d3: registry wave labels, d4: clone isolation ledger).
- C3 achieved only 3 of 4: **d4 remained unprovable** (`corpus/lessons/round-19.md:142-145, 190-191, 212-213`).
- **Root cause**: At round-19 wave-1 return, L1 failed to capture a direct `git status --porcelain=v1 -uall` snapshot of the lane before importing files from writer clones into the shared tree (`corpus/lessons/round-19.md:84`).
- **The retrospective repair failure**: To salvage the missing observation, L1 reconstructed what the after-status would have been using file modification times (mtimes) and explicitly marked the ledger as `RECONSTRUCTED` (`.ufo/waves/round-19/isolation/ledger.json:4-8`).
- **Refusal by counter**: `.ufo/waves/round-19/measure-c3.mjs:356-358` strictly rejected this:
  ```javascript
  if (/reconstruct/i.test(String(ledger.laneStatusAfterMethod ?? ''))
    || /reconstruct/i.test(String(ledger.trackedDiffMethod ?? ''))) {
    return { pass: false, reason: 'direct_return_snapshot_missing_reconstruction_is_not_observation' };
  }
  ```
- **Codification in QUALITY 48**: "A reconstructed return-time status or tracked diff, even backed by mtimes, is not an observed before/after snapshot. The checker must reject that provenance for closure credit; an irrecoverable historical observation stays unprovable."
- In round-19 continuation wave 2, L1 captured an actual snapshot, but captured it **after** L1 had already integrated independent corrections, yielding `isolation/w2-return-after-L1-integration.txt`, which could not retroactively validate wave 1 (`corpus/lessons/round-19.md:193-196`).

### B. Round-20 Present Wave Structure & Ownership
- Round-20 wave 1 dispatched 64 seats (`.ufo/waves/round-20/w1/dispatch.json`):
  - **4 Clone Writers** (`ExecCounter`, `ExecFixtures`, `ExecFrozen`, `ScribeLifecycle`): assigned isolated working trees under `.ufo/waves/round-20/clones/<SeatName>/` branching from baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`.
  - **60 Report-Only Seats** (`Conn*`, `Source*`, `Critic*`, `Review*`, `Scribe*`, `Attack*`, `Reverse*`): assigned leaf report paths strictly at `.ufo/waves/round-20/w1/<SeatName>.md` in the lane tree.
- **Before-dispatch snapshot exists**: `.ufo/waves/round-20/w1/before.json` recorded at `2026-10-21T09:50:49.209998+00:00`:
  - `phase`: `"before-dispatch"`
  - `observed`: `true`
  - `baseline`: `"c49929430d996b016dde2e3a3a5be380f3433fdb"`
  - `trackedDiff`: `""` (empty)
  - `status`: contains untracked clone directories, `.ufo/waves/round-20/design.json`, `w1/` dispatch files, and preexisting untracked `corpus/evidence/round-20/sources/html_form_element.cc`.

---

## 3. The Connection: Report-Only Wave Ownership vs. Retrospective Repair

1. **Retrospective repair is impossible and forbidden**:
   - In round 19, L1 fell into the trap of attempting a retrospective repair when a physical observation was missed. Once the wave returns and files are imported, the wave-return state is physically destroyed. Reconstructing it via mtimes is epistemically invalid (QUALITY 48).
   - In round 20, we do **not** attempt to retroactively repair round 19. Round 19's C3 d4 defect is an immutable, honest historical limit (`corpus/lessons/round-19.md:142-145`).

2. **The architectural duality of round 20 wave ownership**:
   - The shared production tree (`corpus/`, `scripts/`, `SKILL.md`) is declared `READ-ONLY` for every seat during wave 1.
   - However, 60 report seats write directly to `.ufo/waves/round-20/w1/*.md` in the lane tree, while 4 clone seats write inside their private clones under `.ufo/waves/round-20/clones/*`.
   - Under QUALITY 45, before and after lane snapshots must differ **only by files under the round's wave directory**, and tracked diff must be empty.
   - If L1 conflates *wave return* with *integration* — for instance, by pulling/importing clone outputs into `corpus/evidence/round-20/lifecycle/decisions.json` or editing `SKILL.md` before taking the return snapshot — round 20 will repeat round 19's exact failure!

3. **Untracked baseline file preservation**:
   - As reported by `ScribeGate.md` (finding F1), `corpus/evidence/round-20/sources/html_form_element.cc` was already untracked (`??`) in `before.json`.
   - Any valid return snapshot must prove that `html_form_element.cc` was **not mutated or touched** during the wave by any of the 64 seats, and that no new untracked files appeared outside `.ufo/waves/round-20/`.

---

## 4. Proposed Move: The Two-Shutter Pre-Integration Boundary Protocol

To guarantee QUALITY 45 and QUALITY 48 compliance without risking another unprovable isolation ledger:

### Step 1: Formalize the Return Shutter (`w1/return.json`)
Immediately upon the conclusion of wave 1 execution — and **strictly before** L1 imports any file from `.ufo/waves/round-20/clones/`, merges any clone commit, or edits any lane file — L1 must execute a direct, observed snapshot and save it to `.ufo/waves/round-20/w1/return.json`.

Required schema for `.ufo/waves/round-20/w1/return.json`:
```json
{
  "phase": "wave-return",
  "observed": true,
  "baseline": "c49929430d996b016dde2e3a3a5be380f3433fdb",
  "status": "<raw output of git status --porcelain=v1 -uall>",
  "trackedDiff": "<raw output of git diff against baseline/index>",
  "capturedAt": "<ISO 8601 UTC timestamp>"
}
```

### Step 2: Implement the Deterministic Delta Invariant Check
The wave-check gate (being authored by `ExecFrozen` as `check-wave.mjs`) must verify the differential between `w1/before.json` and `w1/return.json`:
1. **Tracked diff invariant**: `before.trackedDiff === ""` and `return.trackedDiff === ""`.
2. **Path containment invariant**: Let `delta = set(return.status.lines) - set(before.status.lines)`.
   - Every added entry in `delta` must match `?? .ufo/waves/round-20/w1/*.md`, `?? .ufo/waves/round-20/w1/*.json`, or `?? .ufo/waves/round-20/clones/*`.
   - `delta` must contain **zero** entries outside `.ufo/waves/round-20/`.
3. **Preexisting file integrity**: Preexisting entries (such as `?? corpus/evidence/round-20/sources/html_form_element.cc`) must be byte-for-byte identical between before and return.
4. **No-reconstruction assertion**: `return.observed === true`, and neither status nor trackedDiff contains `"reconstruct"` or mtime-derived markers.

### Step 3: Explicit Phase Gate Before Clone Integration
L1's integration workflow must enforce an unskippable sequence:
1. Wave 1 dispatch returns.
2. Shutter: Capture `w1/return.json`.
3. Validate: Run differential check between `w1/before.json` and `w1/return.json`.
4. Only upon exit 0 of the differential check may L1 begin importing clone outputs (`ExecCounter`, `ExecFixtures`, `ExecFrozen`, `ScribeLifecycle`) and committing changes into the lane.

---

## 5. Affected Axes and Second-Order Effects

| Axis / Surface | Impact | Analysis |
|---|---|---|
| **Depth** (C1 lifecycle decisions) | Improves | Prevents C1 outputs from being tainted or rejected due to disputed author-side writer isolation or mixed clone contamination. |
| **Contract** (QUALITY 45 / 48) | Improves | Eliminates the possibility of a reconstructed return state. Establishes forward-looking, verifiable physical observations. |
| **Hygiene / Isolation** | Improves | Proves that 60 report seats strictly honored their `.ufo/waves/round-20/w1/*.md` boundaries and 4 clone writers operated strictly within their isolated clones. |
| **No-Harm** | Neutral / Safe | Preserves historical lesson bytes; explicitly treats round-19 C3 d4 as unprovable rather than attempting a forbidden historical rewrite. |

---

## 6. Risks and Countermeasures

- **Risk 1: L1 or an integration script modifies a file before taking `return.json`.**  
  *Countermeasure*: The `check-wave.mjs` contract must require `return.json` timestamp to precede the timestamps of any clone integration commits or imported files in `corpus/`.
- **Risk 2: Preexisting untracked `html_form_element.cc` flagged as a leak.**  
  *Countermeasure*: The differential check must compute the mathematical set difference `status_return \ status_before`, verifying that preexisting untracked files are recognized as unchanged baseline state rather than wave-1 leaks.
- **Risk 3: Conflation of report seats and clone writers.**  
  *Countermeasure*: The isolation ledger must distinguish between the 4 production clone writers (tracked via clone commit SHA and `git diff --name-only base commit`) and the 60 report-only seats (tracked via presence of assigned markdown report in `w1/`).

---

## 7. Verification

When wave 1 returns, L1 can verify the shutter and delta invariant mechanically:

```bash
# 1. Capture return snapshot (MUST BE RUN BEFORE CLONE IMPORT)
node -e '
const { execSync } = require("child_process");
const fs = require("fs");
const status = execSync("git status --porcelain=v1 -uall", { encoding: "utf8" });
const diff = execSync("git diff", { encoding: "utf8" });
const record = {
  phase: "wave-return",
  observed: true,
  baseline: "c49929430d996b016dde2e3a3a5be380f3433fdb",
  status,
  trackedDiff: diff,
  capturedAt: new Date().toISOString()
};
fs.writeFileSync(".ufo/waves/round-20/w1/return.json", JSON.stringify(record, null, 2));
'

# 2. Assert delta containment
node -e '
const fs = require("fs");
const before = JSON.parse(fs.readFileSync(".ufo/waves/round-20/w1/before.json", "utf8"));
const ret = JSON.parse(fs.readFileSync(".ufo/waves/round-20/w1/return.json", "utf8"));

if (ret.trackedDiff !== "") { console.error("FATAL: trackedDiff not empty"); process.exit(1); }
if (!ret.observed || /reconstruct/i.test(ret.status)) { console.error("FATAL: reconstructed status"); process.exit(1); }

const beforeLines = new Set(before.status.trim().split("\n").filter(Boolean));
const retLines = ret.status.trim().split("\n").filter(Boolean);
const added = retLines.filter(line => !beforeLines.has(line));

const leaks = added.filter(line => !line.startsWith("?? .ufo/waves/round-20/"));
if (leaks.length > 0) {
  console.error("FATAL: files leaked outside wave directory:", leaks);
  process.exit(1);
}
console.log("PASS: wave containment verified, new wave entries:", added.length);
'
```

Expected output: `PASS: wave containment verified, new wave entries: <N>` with exit code 0.
