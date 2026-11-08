# R88Connector — Sibling-Overlap Scan & Synthesis (Tabi Round 88, Wave w1)

- **Seat**: `R88Connector` (UFO-FSD connector; leaf member, no subagent dispatch).
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (Base `f16f992d`, D `86f1dcec` / `93500a4e`).
- **Judged on**: Adjacency.
- **Milestone**: sibling-overlap scan.
- **Posture**: Read-only inspection of sibling lanes and local records; single report output. No commits, no pushes, no lane record edits, no host mutation.

---

## 1. Sibling-Overlap Scan Evidence

A comprehensive grep across `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/knowledge`, all lane `SCORECARD.md` files (and the fleet-root `SCORECARD.md`), and `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts` was performed for the six target tokens: `accept=`, `setFileInputFiles`, `showPicker`, `fileChooserOpened`, `selftest 10/10`, and record-drift counters.

### 1.1 `accept=`
- **`tabi-shokunin`** (Sole true owner of the HTML attribute ground):
  - `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:73`: Proves `accept=".png"` does not filter programmatic answers over CDP (`a.txt` accepted).
  - `corpus/knowledge/chromium-file-chooser-runtime-round-78.md:8`: Multi-element fixture input `#k` with `accept=".png"`.
  - `corpus/knowledge/chromium-showpicker-runtime-round-80.md:28`: Proves `accept=".png"` opens `selectSingle` mode without mode alteration.
  - `corpus/knowledge/chromium-showpicker-runtime-round-81.md:41-42,62`: Measures law that `accept` is a dialog hint, not a validator (`.txt` into `accept=".png"` accepted).
  - `corpus/knowledge/chromium-showpicker-runtime-round-82.md:29`: Carries forward `.txt` into `accept=".png"` acceptance law.
  - `corpus/knowledge/chromium-showpicker-runtime-round-83.md:22,35,59-60`: Measures PNG byte acceptance into `accept=".png"`; erratum notes MIME token was unexercised.
  - `corpus/knowledge/chromium-showpicker-runtime-round-84.md:33`: Re-derives extension-token acceptance law and accept-MIME byte answer.
  - `corpus/knowledge/chromium-showpicker-runtime-round-85.md:40,57`: Carries forward accept laws; frames frontier for token matrix.
  - `corpus/knowledge/chromium-showpicker-runtime-round-86.md:19-22,26`: Measures 3 token forms (`image/*`, `image/png, .txt`, `application/pdf`).
  - `corpus/knowledge/chromium-showpicker-runtime-round-87.md:21-25,28`: Expands to 7 token forms (`audio/*`, `video/*`, `image/png,application/pdf`, whitespace variant).
  - `corpus/knowledge/chromium-showpicker-runtime-round-88.md:22-25,29`: Expands to 10 token forms (`IMAGE/PNG`, `audio/*,video/*`, `image/png;q=0.9`).
  - `SCORECARD.md:4005,4069`: Rounds 81 and 83 record capability laws for `accept=".png"`.
  - `scripts/check-showpicker-r81.mjs` through `scripts/check-showpicker-round88.mjs`: Counter gating `accept-answer-law` and `accept-grammar-law`.
  - `scripts/chrome-cdp-showpicker-round81.mjs` through `scripts/chrome-cdp-showpicker-round88.mjs`: Driver fixtures staging `accept` inputs.
- **`tameshi-shokunin`** (Homonym, unrelated domain):
  - `corpus/knowledge/witness-equivalence-rule.md:56`: `ho_accept=6/6` (mutation runner assertion tally: accepted test cases, NOT HTML attribute).
  - `SCORECARD.md:1618,1633,1690,1704,1733,1745,1766,1791`: `v1_accept=8/8`, `ho_accept=6/6`, `pub_accept=3/3` (mutation test runner tallies).
- **All other 19 sibling lanes**: Zero hits in `corpus/knowledge` or `SCORECARD.md`.

### 1.2 `setFileInputFiles`
- **`tabi-shokunin`** (Sole owner):
  - `corpus/knowledge/`: Rounds 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88 document CDP command `DOM.setFileInputFiles` delivering file payloads, directory expansion via `webkitRelativePath`, and bypass of dialog validation.
  - `SCORECARD.md:3808,3814,3828,3984,4005,4008,4018,4175`: Records capability `chromium-file-chooser-linux` and `chromium-showpicker-linux`.
  - `scripts/`: `check-filechooser-r77.mjs`, `check-filechooser-r78.mjs`, `check-record-drift-r81.mjs` (checking typo `DOM.setInputFiles` -> `DOM.setFileInputFiles`), `check-showpicker-r80.mjs` through `round88.mjs`, `chrome-cdp-filechooser-round77.mjs`, `round78.mjs`, `chrome-cdp-showpicker-round80.mjs` through `round88.mjs`.
- **All 20 sibling lanes**: Zero hits across `corpus/knowledge`, `SCORECARD.md`, or scripts.

### 1.3 `showPicker`
- **`tabi-shokunin`** (Sole owner):
  - `corpus/knowledge/`: Rounds 79 through 88 document `HTMLInputElement.showPicker()` trigger laws, transient activation consumption, cross-origin `SecurityError`, and exemption boundaries.
  - `SCORECARD.md:3895,3918,3921,3926,4005,4043,4096,4167`: Capability generation records for `chromium-showpicker-linux`.
  - `scripts/`: `check-showpicker-r79.mjs` through `check-showpicker-round88.mjs`, `chrome-cdp-showpicker-round80.mjs` through `round88.mjs`, `negatives-showpicker-round88.mjs`.
- **All 20 sibling lanes**: Zero hits across `corpus/knowledge`, `SCORECARD.md`, or scripts.

### 1.4 `fileChooserOpened`
- **`tabi-shokunin`** (Sole owner):
  - `corpus/knowledge/`: Rounds 77 through 88 document CDP event `Page.fileChooserOpened`, mode reporting (`selectSingle`/`selectMultiple`), and `backendNodeId` binding.
  - `SCORECARD.md:3808,3814,3822,4133`: Capability records and falsifier analyses.
  - `scripts/`: `check-filechooser-r77.mjs`, `check-filechooser-r78.mjs`, `check-showpicker-r79.mjs` through `round88.mjs`, `chrome-cdp-filechooser-round77.mjs`, `round78.mjs`.
- **All 20 sibling lanes**: Zero hits across `corpus/knowledge`, `SCORECARD.md`, or scripts.

### 1.5 `selftest 10/10`
- **`kotodama-shokunin`**:
  - `corpus/knowledge/verification/index-sweep-verification.md:13`: Records round-20 sweep verification running with `selftest 10/10`.
- **`kaidoku-shokunin`**:
  - `SCORECARD.md:874,951,970,982,1014,3177`: Round 4 citation-drift probe records `selftest 10/10`.
- **`kake-shokunin`**:
  - `SCORECARD.md:4919`: Round 74 sidecar re-observation script runs with `selftest 10/10`.
- **`mori-shokunin`**:
  - `SCORECARD.md:3355,3587,3588,3642`: Rounds 67, 71, and 72 record tool selftest runs exiting clean with `selftest 10/10`.
- **`tabi-shokunin`**:
  - `SCORECARD.md:4199,4223`: Round 87 scored at D6 had 10 gates: `selftest 10/10 at D6`.
  - `SCORECARD.md:4236,4260`: Round 88 scored row records `selftest 10/10`.
  - Historical sweep defect: In round 87, a sweep mistakenly overwrote the historical tallies in rounds 44, 68, 79, 80, 81, 84, 85 to `10/10` when those rounds actually had `9/9` gates. Round 88 C2 statement 1 restores them to `9/9`.
  - `scripts/check-record-drift-r88.mjs:13,15,42,62,65`: Enforces that the seven swept sections read `9/9` and not `10/10`, and replaces `selftest 10/10 at D7` with the D6 value.

### 1.6 Record-Drift Counters
- **`chousa-shokunin`**:
  - `corpus/knowledge/chain-resolution-r3.md:42`, `exempt-hop-audit-r32.md:28`: Notes record drift when citation hop verifications fail.
- **`kama-shokunin`**:
  - `SCORECARD.md:3734`: Round 67 C1 repairs self-record drift via `worktree-landing-check`.
- **`tsukuroi-shokunin`**:
  - `SCORECARD.md:794,895,927,942,1008,1025,1052,1088,1123,1131,1149,1172,1237,1269,1286,1317,1373,1393,1545`: Extensive lineage of `tools/check-self-assessment.py` counting repo-state drift.
  - `tools/check-selftest-tally.py`: Pre-report stale-tally sweep (round 71) that compares added lines against `git diff -U0 <base>..<head>`, keeping historical lines strictly out of scope. Features hermetic `--selftest` mode with stable finding IDs (`SWEEP-MISMATCH`, `SWEEP-LABEL`, `SWEEP-NO-RECEIPT`).
- **`kaidoku-shokunin`**:
  - `SCORECARD.md:5207`: Documents the self-assessment gate lineage (`tsukuroi`'s `check-self-assessment.py`, `souji`'s `souji-capability-agreement.py`).
- **`tabi-shokunin`**:
  - `scripts/check-record-drift-r79.mjs` through `scripts/check-record-drift-r88.mjs`: Dedicated lineage of record-drift gates checking SCORECARD, SKILL, lessons, and QUALITY against repo state.

---

## 2. Contestation & Overlap Analysis

1. **Browser Automation Ground (C1 — Coverage)**:
   - **Status**: **Uncontested (100% Tabi-owned)**.
   - **Finding**: None of the 20 sibling lanes touch CDP file choosers, `showPicker()`, or file inputs. Plating the three new token forms (`accept="IMAGE/PNG"`, `accept="audio/*,video/*"`, `accept="image/png;q=0.9"`) expands Tabi's capability from 7 to 10 token forms (12 grammar legs) without encroaching on or conflicting with any sibling lane.
2. **Calibration Ground (C2 — Tally Restoration & Record Drift)**:
   - **Status**: **Uncontested (Locally bounded)**.
   - **Finding**: Restoring historical tallies in `tabi-shokunin/SCORECARD.md` (rounds 44, 68, 79, 80, 81, 84, 85 back to `9/9` from `10/10`) does not touch fleet-root `SCORECARD.md` or any sibling file. It repairs an internal regression caused by round 87's blanket sweep.
   - Sibling precedent in `tsukuroi-shokunin` (`check-selftest-tally.py`) confirms that historical sections must remain untouched and that sweeps must be scoped to the round's commit diff.

---

## 3. Patterns to Reuse Across Lanes

1. **Diff-Scoped Sweep Boundary (`tsukuroi-shokunin/tools/check-selftest-tally.py`)**:
   - Tsukuroi solved stale tally propagation in round 71 by evaluating only added lines (`git diff -U0 <base>..<head>`). Historical lines are out of scope by construction.
   - Tabi's defect D1 occurred precisely because QUALITY 161's sweep was an unanchored global search across `SCORECARD.md`. Adopting commit-range diff scoping prevents future sweeps from mutating historical round sections.
2. **Hermetic Selftest Verification with Stable Finding IDs (`tsukuroi-shokunin` & `tabi-shokunin`)**:
   - Tsukuroi's `check-selftest-tally.py` executes hermetic fixtures under `$TMPDIR` asserting stable IDs (`SWEEP-MISMATCH`, `SWEEP-LABEL`, `SWEEP-NO-RECEIPT`) and validates against a frozen `DECLARED` manifest.
   - Tabi's round-88 D3 gate-selftest convention correctly mandates `--selftest` with stable finding IDs, but currently tests this via static source grep rather than output binding (see Section 4).

---

## 4. The One Non-Obvious Move (Compatible Synthesis)

### 4.1 Grounded Evidence Across Round 88 Proposals & Audits
1. **C2-A Heading-Hijack Vulnerability (`R88Critic.md` §C2-A)**:
   - In `scripts/check-record-drift-r88.mjs:105-118`, the statement `scorecard-tallies` searches for each of the seven rounds using `rows.findIndex((l) => re.test(l))` and evaluates only up to the next `## Round \d+` heading.
   - A stub heading (`## Round 44` with `9/9`) preceding the real `## Round 44b` (carrying `10/10`) successfully hijacks the check, causing the gate to report green.
   - Furthermore, line 115 computes `const tallyLines = rows.filter((l) => /selftest 10\/10/.test(l));`, but line 116 only asserts `claim('scorecard-tallies', allRestored, 'secs=...')`. `tallyLines` is never asserted. Any `selftest 10/10` placed under an unmonitored round (e.g. `## Round 70` or an injected duplicate heading) passes unnoticed.
2. **C1 Top-Level vs. Per-Leg Attribution Gap (`R88Review2.md` §Method & Verdict)**:
   - In `scripts/check-showpicker-round88.mjs:758-763`, `accept-grammar-law` resolves the input descriptor solely from the top-level snapshot `r.fixtureInputs`.
   - Every leg carries its own copied mirror `leg.fixtureInputs`, but the counter never inspects `leg.fixtureInputs[target].accept`.
   - Mutation probe P3 proved that per-leg accept attributes can be forged, swapped, or stripped with zero counter failure (`exit 0, clean`).
3. **C2 Base Worktree Count Discrepancy (`R88Exec3.md` §1)**:
   - Running the frozen gate against base `f16f992d` yields **4 mismatches** (`scorecard-tallies`, `selftest-wording`, `gate-selftest`, `quality161-sweep`), because `gate-selftest` at base is false.

### 4.2 Affected Axes
- **Calibration (C2)**: Closed loophole against heading injection, duplicate sections, and unasserted historical tallies.
- **Coverage / Operability (C1)**: Closed attribution gap between top-level receipt metadata and per-leg recorded facts.
- **Adjacency**: Harmonization with Tsukuroi's diff-scoped sweep discipline.

### 4.3 Proposed Move
**Synthesize Card-Wide Tally Invariant Assertion with Leg-Descriptor Attribute Binding**:
1. **In `check-record-drift-r88.mjs` (or successor r89 calibration gate)**:
   - Close C2-A by activating the unused `tallyLines` computation: assert `tallyLines.length === 1` (prior to r88 scoring) or `tallyLines.length === 2` (matching exactly the sanctioned round 87 line and the newly scored round 88 line), and verify that every matching line belongs strictly to `{87, 88}`.
   - This eliminates the stub-heading hijack and prevents any `10/10` tally from existing in unmonitored historical sections without needing complex Markdown AST parsing.
   - Adopt Tsukuroi's rule (`check-selftest-tally.py`): future tally sweeps must take a git diff range `--range <base>..<head>` and reject any diff touching lines outside the declaring round's section.
2. **In `check-showpicker-round88.mjs` (or successor r89 counter)**:
   - In `accept-grammar-law`, add a single conjunct verifying that the leg's own page measurement agrees with the global descriptor:
     `arr(leg.fixtureInputs).find((d) => d.id === target)?.accept === desc.accept`.
   - This closes the attribution gap identified by `R88Review2`, ensuring that per-leg `fixtureInputs` is no longer dead weight and that individual leg measurements are cryptographically bound to the raw attribute.

### 4.4 Risks & Mitigations
- **Risk**: Hardcoding `tallyLines.length === 1` breaks once round 88 itself commits its scored `selftest 10/10` row.
- **Mitigation**: Rather than a scalar constant, assert that every line in `tallyLines` matches an explicit allowlist of sanctioned rounds:
  `const allowedRounds = ['87', '88']; const unauthorized = tallyLines.filter((l) => !allowedRounds.some((r) => l.includes(`Round ${r}`)));`.
- **Risk**: Adding per-leg descriptor checks in C1 might reject older r86/r87 probe receipts if those historical receipts omitted `leg.fixtureInputs`.
- **Mitigation**: The check is applied within the `GRAMMAR` loop only for r88+ legs (`ac`, `au`, `amc`) or gated on `Array.isArray(leg.fixtureInputs)`.

### 4.5 Verification
1. **Calibration Verification**:
   - `node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json` exits `0`, claims `4`, mismatches `0`.
   - Inject a duplicate heading (`## Round 44\nselftest 9/9\n## Round 44b\nselftest 10/10`): modified gate exits `1`, failing `scorecard-tallies`.
   - Inject an off-set tally (`## Round 70\nselftest 10/10`): modified gate exits `1`, failing `scorecard-tallies`.
2. **Capability Verification**:
   - `node scripts/check-showpicker-round88.mjs ...` exits `0`, clean `102` checks on the honest scored receipt.
   - Mutate `leg.fixtureInputs[ac].accept` from `IMAGE/PNG` to `image/png`: modified counter exits `1`, catching the forgery.
