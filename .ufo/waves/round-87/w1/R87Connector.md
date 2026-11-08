# R87Connector — Sibling-overlap scan and UFO-FSD connection proposal

Seat: `R87Connector` (connector, leaf member; no subagent dispatch).  
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · round 87 · wave `w1` · base `24765dd9` · D `3dd4b0802d67` · nonce `tabi-r87-l1-3dd4b0802d67`.  
Judged on: **adjacency**. Milestone: *sibling-overlap scan*.  
Bounds: read-only leaf; no lane edits except this report; no git/jj mutation; no write into `corpus/evidence/round87`; no edits to lane records or sibling lanes. Tooling: no install or upgrade; existing host node v24.21.0 and python3.

---

## 1. Sibling-overlap scan methodology and results

A scan was executed across 1,816 files in all 21 sibling lanes and the fleet root, targeting:
1. `*-shokunin/corpus/knowledge/*`
2. `SCORECARD.md` (fleet `/home/vgpnk/Projects/shokunin/SCORECARD.md` and all 20 lane `SCORECARD.md` files)
3. `scripts/*` (fleet `/home/vgpnk/Projects/shokunin/scripts` and all 20 lane `scripts/` directories)

For the five assigned tokens: `accept=`, `setFileInputFiles`, `showPicker`, `fileChooserOpened`, and `record-drift` (including `check-record-drift`).

### Summary of hits across targeted directories

| Term | `tabi-shokunin` | Sibling lanes | Details of sibling matches |
|---|---|---|---|
| `accept=` | 30 files | 5 files (`kake`: 3, `tameshi`: 2) | Disjoint domains: Python test fixture argument (`kake`), mutation tally audit vector (`tameshi`). Zero browser/HTML file input hits. |
| `setFileInputFiles` | 39 files | 0 files | Sole owner in the fleet. (Incidental hits only in temporary connector scans or runtime binary dumps outside targeted dirs). |
| `showPicker` | 64 files | 0 files | Sole owner in the fleet. |
| `fileChooserOpened` | 56 files | 0 files | Sole owner in the fleet. |
| `record-drift` / `check-record-drift` | 19 files | 3 files (`lore`: 1, `chousa`: 2) | Disjoint domains: markdown cell table consistency (`lore`), citation chain resolution (`chousa`). No sibling has a lane-record drift counter. |

---

## 2. Which lanes have measured the same ground (paths + one-line state each)

**Finding: ZERO sibling lanes have measured or claimed the same capability ground as `tabi-shokunin`.**  
Tabi is the sole fleet owner of the `chromium-file-chooser-linux` and `chromium-showpicker-linux` capability lines (rounds 77 through 87).

Paths and one-line states across all lanes matching any target query:

1. **`tabi-shokunin`**
   - Paths: `corpus/knowledge/chromium-showpicker-runtime-round-80..87.md`, `scripts/check-showpicker-r81..r87.mjs`, `scripts/chrome-cdp-showpicker-round81..r87.mjs`, `scripts/check-record-drift-r79..r87.mjs`, `SCORECARD.md`.
   - One-line state: **Active and verified (rounds 77–87)**; measures CDP `DOM.setFileInputFiles`, `Page.fileChooserOpened`, `Page.setInterceptFileChooserDialog`, and `HTMLInputElement.showPicker()` on headless Chromium on Linux.

2. **`kake-shokunin`**
   - Paths: `scripts/robots_audit_selftest.py:234`, `scripts/source_recheck_hardening_selftest.py:121,263`, `scripts/source_recheck_selftest.py:181,286,574,636,666`.
   - One-line state: **Active crawler/source-recheck harness**; `accept=` is a Python function parameter (`accept=None` / `accept=[alt(...)]`) specifying tolerated alternative test fixture exits/outcomes for HTTP robots and manifest audits; zero overlap with HTML `<input accept>`.

3. **`tameshi-shokunin`**
   - Paths: `corpus/knowledge/witness-equivalence-rule.md:56`, `SCORECARD.md:1618,1633,1690,1704,1733,2236,2921`.
   - One-line state: **Active mutation testing and tally-audit framework**; `accept=` represents mutation acceptance counts (`ho_accept=6/6`, `v1_accept=8/8`) and the `always-accept` control cheat; measures runner kill/accept tallies, not browser input elements.

4. **`lore-shokunin`**
   - Paths: `corpus/knowledge/r93-r8-worked-example.md:191,207`.
   - One-line state: **Active record-auditing methodology**; defines `R8_RECORD_DRIFT` (exit 1) as a predicate for validating markdown table cells (separating cell-empty, cell-filler, and uncanonical cell edits); measures documentation table integrity, not lane git drift.

5. **`chousa-shokunin`**
   - Paths: `corpus/knowledge/chain-resolution-r3.md:37,42,46,94,100,102,185,196`, `corpus/knowledge/exempt-hop-audit-r32.md:28,48`.
   - One-line state: **Active research gate verification**; checks citation chain resolution (`RESEARCH_GATE: CLEAN` vs `RESEARCH_GATE: DRIFT`); measures scholarly source provenance and hop anchors, not code or record drift.

---

## 3. Contestation analysis

**Will any sibling lane contest if this round plates four new token forms (`accept="audio/*"`, `accept="video/*"`, `accept="image/png,application/pdf"`, `accept="  image/png ,  .txt  "`)?**

**Verdict: UNCONTESTED.**

Reasons grounded in local repository evidence:
1. **Territorial exclusivity**: No sibling lane measures, registers, or plans any browser CDP or DOM file input capability. Tabi's capability domain is bounded exclusively to headless Chromium on Linux.
2. **Law extension, not frontier redefinition**: The four new token forms are pure extensions of Tabi's existing measured law from round 86: *"accept is not a validator on a programmatic answer — every delivered file lands in the input's file list with its bytes, trusted input+change, page-read hex; the raw attribute is read from the page."*
3. **No shared mutable state or fleet assets**: Tabi's fixtures, drivers, counters, and receipts live entirely under `tabi-shokunin/`. No fleet-wide registry or sibling file is modified or contested.
4. **Syntactic disjunction**: Sibling matches for `accept=` (`kake`'s fixture argument, `tameshi`'s mutation acceptance) are orthogonal lexical collisions in unrelated subsystems.

---

## 4. Patterns this lane should reuse

1. **From `tameshi-shokunin` — Behavioral Witness Equivalence (`corpus/knowledge/witness-equivalence-rule.md`)**:
   `tameshi` establishes that equivalent acceptance requires a positive behavioral witness rather than merely observing the absence of an error. In Tabi's C1, this pattern is already partially realized by having the page execute `FileReader.readAsArrayBuffer()` and emit a `read` event with `hex:<bytes>`, verifying that the file delivered through `DOM.setFileInputFiles` actually landed in the DOM with intact content. Tabi should continue this pattern when extending grammar checks.

2. **From `tameshi-shokunin` — Non-Trivial Control Sets (`SCORECARD.md`)**:
   `tameshi` pairs every positive run with discriminating negative controls (`always-accept`, `fingerprint`, `empty-blob-unsound`). In Tabi, C1's do-nothing controls (`nowork-r86-under-r87.json` and `noreceipt.txt`) demonstrate that prior-generation receipts cannot pass the current counter. Tabi should reuse `tameshi`'s pattern of testing against an `always-clean` synthetic mutant in its battery.

3. **From `lore-shokunin` & `chousa-shokunin` — Partitioned Drift Taxonomy (`r93-r8-worked-example.md`, `chain-resolution-r3.md`)**:
   Both `lore` and `chousa` cleanly separate structural absence (`anchor-missing`, `cell-empty`) from semantic discrepancy (`drift`). As `R87Exec3` demonstrated, Tabi's C2 currently conflates two different categories of mismatches: 3 statements measure modifications to pre-existing base files, while 2 statements measure the absence of r87-introduced files (`lesson-proof/README.md`, `corpus/lessons/round-87.md`). Partitioning the drift counter into `structural-presence` vs `record-drift` would clarify calibration attribution.

---

## 5. Non-obvious move (UFO-FSD connector synthesis)

### Evidence
1. **The C2 record-drift narrowing sweep vs C1 script text contradiction**:
   In C2, statement 1 (`accept-headline`) audits `SKILL.md`, `plans/round-86.md`, and `QUALITY.md:161` to enforce the narrowed phrasing *"not a validator on a programmatic answer"*, replacing *"filters the dialog, never a programmatic answer"* and *"never a validator"*.  
   However, the frozen counter `scripts/check-showpicker-r87.mjs` line 14 and line 659 still emit:  
   `'a .txt answered into an accept=".png" input must be ACCEPTED (accept filters the dialog, not a programmatic answer): answer ...'`  
   Furthermore, line 680 describes the grammar matrix as `'Three forms are measured'` (carried from r86, despite plating nine legs across seven forms).  
   *Contradiction:* C2 enforced a documentation sweep, but the verification instrument itself retained the superseded pre-narrowing phrasing and count.
2. **`claims.json` C1 `countingCommand` carries superseded D2 nonce**:
   `claims.json` line 18 records `--expect-nonce tabi-r87-l1-42a489b9d4be` (the superseded D2 nonce), whereas `freeze.txt`, `claims.json.nonce`, and the scored receipt carry `tabi-r87-l1-3dd4b0802d67` (D3/D4). Executing the counting command verbatim from line 18 fails with finding `nonce-expected`.
3. **Receipt fixture pin vs instrument bytes decoupling (`R87Review1` finding F1)**:
   `check-showpicker-r87.mjs:414-415` verifies `r.driverSha256 === pin` and `r.fixture.sha256 === expectFixture` from CLI arguments without reading on-disk script bytes, whereas `tameshi-shokunin` enforces strict disk-content binding.
4. **Leg attribution decoupling (`R87Review2` findings F1–F3)**:
   The four new legs are strictly verified at the page-read layer (`stateAfter`, `read` hex, `accept-grammar-law`), but `fixture.patch` is unbound in the receipt, and `fixtureInputs` is recorded only from leg 0's initial read.
5. **Worker non-determinism in kill-power (`R87Exec2` finding F1)**:
   `killpower-a.json` differs in raw byte hash from `scored/killpower-a.json` solely due to worker completion order under `CONCURRENCY = 8`, while per-mutant outcomes are 100% deterministic (66/66 killed).

### Affected axes
- **`calibration`**: Resolves the cross-instrument wording contradiction between the C2 drift checker and the C1 counter's failure diagnostic strings.
- **`coverage`**: Maintains the 99 checks, 34 legs, 209 battery cases, and 66 kill-power mutants with zero regression.
- **`operability`**: Preserves absolute stability of frozen w1 instruments while pre-registering clean forward calibration.
- **`adjacency`**: Directly implements sibling best practices from `tameshi-shokunin` and `lore-shokunin`.

### Proposed move
**Pre-register an Instrument-Parity Calibration Check for r88 (Reusing Tameshi's Text-Binding Pattern) while Bounding r87 Claims to Page-Read Hex Delivery.**

1. **For round 87 (Wave w1)**: Maintain the frozen state intact. Record the observed contradictions in the wave report:
   - The C1 counting command nonce mismatch in `claims.json` line 18 (D2 vs D3);
   - The kill-power worker completion ordering variation;
   - The counter's failure string retaining the pre-narrowing phrase *"accept filters the dialog, not a programmatic answer"*;
   - The 2-of-5 C2 base mismatches relying on new r87 file introduction rather than pre-existing record drift.
2. **For round 88 calibration (pre-registered move)**:
   Extend `scripts/check-record-drift-r88.mjs` statement 1 (or add a dedicated instrument-parity check) to audit the active counter's failure strings and header comments against the calibrated headline narrowing, ensuring that scripts cannot emit diagnostic messages that contradict the lane's registered capability rules.
3. **For round 88 coverage (pre-registered move)**:
   When moving the frontier to case-insensitivity (`accept="IMAGE/PNG"`) and MIME parameters (`accept="image/png;q=0.9"`), decompose `accept-grammar-law` into distinct, named per-grammar checks rather than an aggregate loop, removing the need for secondary exception exemptions in the negative battery.

### Risks
- *Risk:* Proposing script edits during a frozen wave would violate the `freeze.txt` instrument pins.
  *Mitigation:* The proposal is strictly forward-looking for round 88 pre-registration; r87 instruments remain completely untouched.
- *Risk:* Auditing script comments for drift could introduce brittleness against formatting changes.
  *Mitigation:* Use regex normalization on semantic phrases rather than exact byte hashing, matching `lore-shokunin`'s whitespace-tolerant cell audit pattern.

### Verification
- **In round 87**:
  - `check-showpicker-r87.mjs` verifies clean at checkCount 99 with 0 findings.
  - `check-record-drift-r87.mjs` exits 0 with 5 claims, 0 mismatches on the lane, and exits 1 with 5 mismatches on base `24765dd9`.
  - `selftest-r87-gates.mjs` exits 0, 9/9 gates green.
- **In round 88**:
  - The extended drift gate will assert both documentation (`SKILL.md`, `plans/`, `QUALITY.md`) and instrument strings (`check-showpicker-r88.mjs:14, 659`) match the narrowed wording, with 0 mismatches across both surfaces.

---

## 6. Files changed
- This report only: `.ufo/waves/round-87/w1/R87Connector.md`.
- No script, fixture, lane record, evidence file, or fleet-root file was written.
- Scratch directory `/fast/scratch/hyaku/tabi-r87/R87Connector` was created for temporary checks and removed before yielding.

## 7. Blockers
None. All data verified against committed and frozen repository state.
