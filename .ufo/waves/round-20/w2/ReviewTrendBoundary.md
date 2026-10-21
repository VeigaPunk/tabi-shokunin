# ReviewTrendBoundary — Expansion, Quality, Discernment Trends & Sibling/L0 Boundaries

**Seat:** `TabiR20.ReviewTrendBoundary` (leaf member — no subagent dispatch).  
**Role:** UFO-FSD Connector.  
**Lane Root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
**Baseline:** `c49929430d996b016dde2e3a3a5be380f3433fdb`.  
**Checkpoint:** `4ae99816b8994fdedc159156d8d9d242dd5c4782`.  
**Scope:** Check expansion, quality, and discernment trends; audit sibling and L0 boundaries; ensure source-only source-reading remains strictly within browsercraft rather than forensics; formulate one non-obvious synthesis move that improves declared axes without harming another.  
**Production Tree Posture:** Read-only inspection; only this report file is written.

---

## 1. Naming the Axes (Godspeed Step 1)

Per `AXES.md` and `SCORECARD.md`, the six craft axes governing `tabi-shokunin` are:

1. **`depth` (Declared Target Axis for Round 20):**
   - Metric: `c1_lifecycle_decisions` moving 0 → 12 documented source-only decisions (`LC01`–`LC12`).
   - Current Scorecard state: Tied-lowest non-retired axis at score **8** (`SCORECARD.md:888`).
   - Round contract: Strictly source-only Chromium 154 Blink reading (`third_party/blink/renderer/core/html/forms/html_form_element.cc`, S096/S100). **Zero scalar promotion** (delta 0); no runtime capability or host execution claim (`design.json:8,131`; `SCORECARD.md:923-925`).
2. **`coverage` (Score 9):** Fraction of browser automation domain surfaces governed. Must remain flat; reopening S096 and minting S100 does not expand domain coverage or source diversity.
3. **`operability` (Score 8):** Gate stability, zero regressions on lane-owned checkers, deterministic reproducible counter execution without shell injection.
4. **`freshness` (Score 8):** Byte-level source verification against pinned Chromium tag 154 commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, decoded body SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
5. **`calibration` (Score 9):** Uncompromising separation of observation, inference, and unknown (`QUALITY.md` Criterion 3). Preservation of evidence class boundaries (`QUALITY.md` Criterion 14).
6. **`adjacency` (Score 8):** Clean cross-domain boundary awareness; reporting vs absorbing sibling scope; zero collision with sibling lanes (`kaidoku`, `kake`, `kagi`, `kama`).

---

## 2. Audit: Expansion, Quality, and Discernment Trends

### 2.1 Expansion Trend: Neutral / Zero (0)
- **Claim Under Test:** C1 `c1_lifecycle_decisions` 0 → 12 is **strictly one source deepening claim**.
- **No Extra-Axis Credit:** No claims are made on `coverage`, `operability`, `freshness`, `calibration`, or `adjacency`. `SCORECARD.md:926-928` explicitly records: *"Other axes, capabilities, saturation8/window3 and retirement status are unchanged."*
- **No Capability Credit:** The round explicitly disclaims host runtime capability, browser execution, or page-level guarantees. `SKILL.md:2197-2198` notes: *"This deepens the existing declarative WebMCP ground; it acquires no runtime capability."* `corpus/knowledge/webmcp-completion-lifecycle-round-20.md:9-10` reinforces: *"This is not a runtime claim. No row says a browser did this; no row says a page, agent or site completes, responds, or is cancelled in any observed run."*
- **No Source Diversity Credit:** The source body for `LC01`–`LC12` reuses the exact bytes of `html_form_element.cc` already retained in round 19 (SHA-256 `8c8d6796...`). S100 extends the line anchor to `174-328,635-842` for `LC11`'s span, but carries the identical URL, tag, and hash. `corpus/README.md:447` confirms: *"Extra SOURCES rows are not expansion or source diversity."*
- **Verdict on Expansion:** **EXPANSION IS FLAT.** Any round-20 lesson or log text claiming "expansion improved" would be a calibration defect.

### 2.2 Quality Trend: Technical Deepening Improved, Conformance Held
- **Evidence Class Preservation (`QUALITY.md` Criterion 14):** All 12 decisions (`LC01`–`LC12`) maintain strict source-scoped framing in `SKILL.md`, `decisions.json`, and the round-20 knowledge note. Callsite invocations (`PrepareForSubmission`, `Focus`, `PauseExecution`) are explicitly segregated from downstream effects (navigation, completion, or CDP wire output).
- **Immutable Source Protection (`QUALITY.md` Criterion 50):** The immutable anchor of S096 (`174-328,729-758,818-842`) was not mutated in place to fit `LC11` (`787-815`). Instead, S100 was minted as an explicit same-source supersession row starting with `supersedes S096 —`, satisfying `check-sources.mjs` E04 without corrupting historical audit logs.
- **Committed Bytes (`QUALITY.md` Criteria 28 & 38):** The source body `corpus/evidence/round-20/sources/html_form_element.cc` is tracked and committed in git at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (1740 lines, 68,278 B, SHA-256 `8c8d6796...`).
- **Operational Conformance:** The inherited USER gate refusal set `{corpus/lessons/round-18.md, corpus/lessons/round-19.md}` (size 2) is held at 2 without new harm. Per Main's orchestrator ruling (`.ufo/waves/round-19/final/l0-ruling.txt`), this is inherited lane-side conformance debt with axes unaffected.
- **Verdict on Quality:** **QUALITY IS TECHNICALLY IMPROVED** on depth and verification precision; operational conformance remains held under orchestrator ruling.

### 2.3 Discernment Trend: Author-Side Only, Outside Closure Pending
- **Pending External Closures:**
  - Round 19 outside admit/reject closure is **absent and pending** (`round-19.md:200-202`; `SCORECARD.md:872`; `ScoutOutsideReview.md:9-14`). No `corpus/lessons/round-19-verifier-spotcheck.md` exists in git history.
  - Round 20 wave seats (`TabiR20.*`) are all author-side. No lane-dispatched review constitutes independent non-author verification (PROTOCOL.md:63-68; LEARNING.md:42-46).
- **Zero Promotion Credit:**
  - `SHONEN.md` retains four `[~]` boxes (blob `9dcb2687...`), identical to baseline. Zero `[x]` marks are claimed or written.
  - No capability row, no lease credit (CDP lease or fleet runner lease), and no promotion from shonen to shokunin is claimed (`SKILL.md:2255`).
- **Verdict on Discernment:** **HELD AUTHOR-SIDE.** Discernment cannot be claimed as "improved" for Round 20; it must be recorded as "pending external closure" in the closeout lesson.

---

## 3. Audit: Sibling and L0 Boundaries

### 3.1 Browsercraft vs Forensics (`tabi-shokunin` vs `kaidoku-shokunin`)
- **Sibling Province:** `kaidoku-shokunin` governs reverse engineering and forensics on shipped artifacts (native ELF binaries, ASAR archives, JS bundles, APKs, decompiled pseudocode; `kaidoku-shokunin/PROVINCE.md:3-6`). In contrast, `kaidoku`'s `PROVINCE.md:106-107` explicitly refuses: *"Source-available reconstruction of ordinary repositories — REA's own anti-trigger (unowned)."*
- **Tabi Province:** `tabi-shokunin` governs browser automation, loopback CDP interaction, DOM/ARIA capture, and webflake mitigation (`tabi-shokunin/PROVINCE.md:3-10`). `PROVINCE.md:15` explicitly refuses: *"Reverse engineering as forensics (→ revenger/kaidoku)."*
- **Jurisdictional Boundary Test:**
  - `tabi`'s reading of `html_form_element.cc` is an upstream open-source C++ reading from Google Gitiles tag `154.0.8037.97`.
  - It is **browsercraft** because it deduces the browser engine's execution control flow, state machine transitions, and error-string templates to explain or predict browser automation / CDP observations (e.g. why `toolautosubmit` bypasses interactive pausing; why `preventDefault()` without `respondWith()` returns a `kToolInvocationFailed` diagnostic over CDP).
  - It would drift into **forensics** if it:
    1. Analyzed compiled binary structures, machine instructions, or disassembly of Chromium binaries on this host;
    2. Asserted that the local host's installed unbranded Chromium binary (`152.0.7977.82-1`) executes this code path without verifying it via a browsercraft protocol harness; or
    3. Treated internal memory state variables (`is_currently_running_`, `active_submit_button_`) as observed runtime facts rather than static C++ invariants.
- **Verification:** The round-20 artifacts landed at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` maintain this firewall rigorously: `SKILL.md:2237-2244` explicitly instructs the practitioner to use the table as source-scoped troubleshooting without asserting host binary execution. Existing `corpus/adjacency.tsv:3` (`refused-route`) holds cleanly.

### 3.2 Browser Engine Execution vs Web Publishing (`tabi-shokunin` vs `kake-shokunin`)
- **Sibling Province:** `kake-shokunin` owns web properties, HTML publishing, metadata, and authoring guidelines (`kake-shokunin/PROVINCE.md:3`). `tabi` refuses web publishing (`tabi-shokunin/PROVINCE.md:16`).
- **Boundary Risk:** `LC11` quotes Blink's diagnostic: `"The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"`.
- **Firewall:** `tabi` frames this strictly as **browser engine callback semantics** delivered over CDP to the tool invoker (`CallDoneCallback` with `kToolInvocationFailed`), not as web developer markup authoring guidance. `corpus/adjacency.tsv:6` (`split-declared`) holds cleanly.

### 3.3 L0 Governance Boundary & Frozen USER Gate
- **Inherited Conformance Debt:** The frozen USER gate `lessonDrift` check flags any lesson absent at baseline with `MDRT` commits after `92d700d`. The refusal set is currently `{corpus/lessons/round-18.md, corpus/lessons/round-19.md}` (count 2).
- **L0 Ruling Scope:** Main's orchestrator ruling (`.ufo/waves/round-19/final/l0-ruling.txt`) confirmed that this refusal growth is inherited conformance debt with axes unaffected. The frozen gate scripts and historical lesson files must NOT be modified.
- **Write-Once Discipline:**
  - `round-20.md` must be written exactly once in the final closeout commit by Main, with no intermediate checkpoint commits.
  - `PROVINCE.md` must not be touched: although listed in `APPEND_ONLY`, it is pinned by blob equality in the round gate census (`corpus/evidence/pstack-20261015/baseline-census.tsv:24`, blob `c2222b16...`), and appending to it would trigger `Census blob drifted`.

---

## 4. UFO-FSD Connector Move: The Compatible Synthesis

### 4.1 The Contradiction Across Round Proposals
The w1 and w2 proposals expose a sharp multi-way tension across the round's review seats:
1. **The Depth vs. Denominator Tension (`CriticCount` vs `ConnPlanner`):** `CriticCount` demonstrated that a hand-written 12-row target without an enumerated denominator risks becoming self-referential, leaving 5 completion sites in `html_form_element.cc` unrowed. `ConnPlanner` established that 9 of the 12 rows are unexercised in runtime receipts, representing genuine engine depth.
2. **The Scope vs. Wire Observation Tension (`CriticScope` vs `ConnEvidence`):** `CriticScope` showed that `PrepareForSubmission` has 4 silent early returns where no callback is run, and that LC12's `base::ok(String())` is an internal C++ sentinel rather than observed navigation. `ConnEvidence` proved that CDP receipts cannot observe internal Blink sentinels directly.
3. **The Lesson Conformance vs. Trend Grading Tension (`ReviewPromotion` vs `CriticNoHarm` vs `ScoutOutsideReview`):** In Round 19, an author-side trend grading of "quality harmed" was superseded by an orchestrator ruling to "quality improved", while outside admit/reject closure remained absent. If Round 20 repeats a blanket "quality improved" or claims "expansion improved" in `round-20.md`, it breaks calibration and inflates author-side progress. If it edits `round-20.md` iteratively across commits, it trips the frozen USER gate `lessonDrift` rule.

### 4.2 The Proposed Move: The Tri-Partite Trend Boundary & Browsercraft Adjacency Firewall
Synthesize these findings into **one bounded, non-obvious operational directive** for Main's single closeout commit authoring `corpus/lessons/round-20.md`:

#### A. Tri-Partite Trend Partitioning in `round-20.md`
Rather than reporting a blended scalar trend or inheriting Round 19's disputed grading, `round-20.md` MUST record the author-side trend across three explicitly partitioned dimensions:
1. **Expansion: Neutral / Flat (0).** Explicitly declare zero domain surface growth, zero runtime capability gain, and zero source diversity (S100 is an anchor extension of existing S096 bytes). This permanently prevents false coverage inflation.
2. **Quality: Depth Improved (0 → 12 verified source rows under QUALITY 50), Conformance Held (USER refusal set {round-18, round-19} held at 2 under L0 ruling).** Explicitly distinguish technical depth precision (finite mechanical counter, 40-case selftest with zero shell execution) from historical gate conformance debt.
3. **Discernment: Held Author-Side / External Closure Pending.** State explicitly that Round 19 outside closure remains pending and Round 20 is author-side only. All four SHONEN boxes remain `[~]`; zero `[x]` marks; zero promotion or lease credit.

#### B. The Browsercraft Adjacency Firewall Clause
In the lesson's Adjacency section, explicitly codify the **Browsercraft Adjacency Firewall**:
> *"Source-available browser engine reading is admitted to tabi as browsercraft strictly to map engine control flow, state transitions, and error-string templates to observable CDP protocol diagnostics and automation failure modes. It is refused as forensics (→ kaidoku) whenever it claims host binary instruction truth without source or lacks protocol relevance. It is refused as publishing (→ kake) whenever it prescribes site markup standards rather than browser callback mechanics."*

#### C. Static Pre-Verification Receipt for USER Refusal Invariant
In `round-20.md`, include the pre-computed static git query confirming that `git log -m --diff-filter=MDRT 92d700d..HEAD -- corpus/lessons/round-20.md` is empty, ensuring that `round-20.md` lands once with zero post-creation mutations, holding the USER gate refusal count strictly at 2.

### 4.3 Second-Order Effects & Affected Axes
- **`calibration` (Score 9 → Reinforced):** Prevents conflating source-scoped depth with runtime expansion, stops author-side self-promotion from masquerading as external discernment, and transparently preserves the open status of Round 19 external closure.
- **`adjacency` (Score 8 → Reinforced):** Formally delineates the boundary between `tabi`'s browsercraft and `kaidoku`'s binary forensics, eliminating jurisdictional ambiguity without requiring edits to frozen `PROVINCE.md` or `corpus/adjacency.tsv`.
- **`operability` (Score 8 → Protected):** Eliminates the risk of triggering `lessonDrift` on `round-20.md` under the frozen USER gate.
- **`depth` (Score 8, Target 12 Documented Rows → Protected):** Preserves the full technical rigor of Claim C1 without overclaiming branch novelty or whole-axis promotion.
- **Harm to Other Axes:** **None.** Coverage, freshness, and saturation metrics remain completely unharmed.

### 4.4 Risks and Mitigations
- **Risk:** Main or an external reviewer might interpret "Expansion: Flat" as a negative finding or missed target.
  - *Mitigation:* Explicitly cite `SCORECARD.md:923-928` and `LOG.md:1190-1195`, which define Round 20 as a depth-only deepening of existing declarative WebMCP ground.
- **Risk:** The pending Round 19 outside closure could be forgotten across future rounds.
  - *Mitigation:* Keeping "Discernment: Pending external closure" prominently in the round-20 lesson ensures the orchestrator/operator maintains the external verification debt in the fleet tracking queue.

### 4.5 Verification
Main can verify this synthesis post-integration via pure, read-only commands:
1. `git log -m --diff-filter=MDRT 92d700d..HEAD -- corpus/lessons/round-20.md` → must be empty (0 lines).
2. `git diff --name-only c49929430d996b016dde2e3a3a5be380f3433fdb..HEAD -- PROVINCE.md corpus/adjacency.tsv` → must be empty (0 lines).
3. `node .ufo/waves/round-20/measure-c1.mjs HEAD` → exits 0 with `c1_lifecycle_decisions: 12`.
4. `grep -c '\- \[x\]' SHONEN.md` → must output 0.

---

## 5. Tooling and Artifact Disclosures

- **Tools Installed / Updated:** None. Zero packages or tools were installed, updated, or removed in this seat.
- **Commands Executed:** All inspections were performed using read-only filesystem and git inspection tools (`git show`, `git log`, `git status`, `git diff`).
- **Code Execution:** No test suites, full gate suites, or formatters were executed mid-flight, respecting the lane contract.

Report: .ufo/waves/round-20/w2/ReviewTrendBoundary.md
