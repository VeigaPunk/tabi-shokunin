# R89Connector — Sibling-Overlap Scan & Synthesis (Tabi Round 89, Wave w1)

- **Seat**: `R89Connector` (UFO-FSD connector; leaf member, no subagent dispatch).
- **Lane**: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (Base `5a901163`, D `7bde5e6c2f2d`).
- **Judged on**: Adjacency.
- **Milestone**: Sibling-overlap scan.
- **Posture**: Read-only inspection of sibling lanes and local records; single report output. No mutating git/jj commands, no lane record edits (SKILL, SCORECARD, LOG, plans, corpus, scripts), no fleet-root touches, no sibling lane mutation.

---

## 1. Sibling-Overlap Scan Evidence

A comprehensive grep across `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/knowledge`, all lane `SCORECARD.md` files (and the fleet-root `SCORECARD.md`), and `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts` was performed for the six target tokens: `acceptTokens`, `domRead`, `comma-separated`, `setFileInputFiles`, `showPicker`, and record-drift counters.

### 1.1 `acceptTokens`
- **`tabi-shokunin`** (Sole true owner; ground introduced in Round 89):
  - `scripts/chrome-cdp-showpicker-round89.mjs:142`: `PATCH_ACCEPT_TO` in-page patch defines `acceptTokens` on file inputs via `a.split(',').map(p => p.trim().toLowerCase()).filter(Boolean)` in `window.__inputs()`.
  - `scripts/check-showpicker-round89.mjs:447-466`: `FIXTURE_INPUTS` array declares `acceptTokens` expectations across 20 input descriptors (`[]`, `['image/*']`, `['image/png', '.txt']`, etc.).
  - `scripts/check-showpicker-round89.mjs:789`: `accept-domread-law` asserts `toksOk = desc.acceptTokens === toks && desc.accept === raw`.
  - `scripts/kill-power-round89.mjs:172`: Mutant `domread-tokens-dropped` verifies kill power when `desc.acceptTokens` check is dropped.
  - `scripts/negatives-showpicker-round89.mjs:359`: Negative test case `accept-domread-law` verifies that tampering with `acceptTokens` (`['image/png']` instead of `['image/*']`) triggers counter failure.
- **Sibling lanes (`*-shokunin`)**:
  - `corpus/knowledge`: Zero matches across all 20 sibling lanes.
  - `SCORECARD.md`: Zero matches across all sibling lanes and fleet root.

### 1.2 `domRead`
- **`tabi-shokunin`** (Sole true owner; ground introduced in Round 89):
  - `scripts/check-showpicker-round89.mjs:192-195`: Declares four `showpicker-domread` legs (`sp89-accept-domread-text`, `sp89-accept-domread-png`, `sp89-accept-domread-multimime`, `sp89-accept-domread-whitespace`).
  - `scripts/check-showpicker-round89.mjs:475`: Declares `domRead` in `LEG_KEYS` schema.
  - `scripts/check-showpicker-round89.mjs:786-799`: Law loop iterates over `DOMREAD_LEGS`, reading `desc = arr(leg.domRead).find(d => d.id === target)` and evaluating `domread-raw`, `domread-tokens`, `answer-files`, `state-after`, and `read-bytes`.
  - `scripts/chrome-cdp-showpicker-round89.mjs:213-216,285,597`: Captures `rec.domRead = JSON.parse(await evalValue('window.__inputs()'))` at settle on `showpicker-domread` legs.
  - `scripts/kill-power-round89.mjs:172-173`: Semantic mutants `domread-tokens-dropped` and `domread-raw-dropped`.
  - `scripts/negatives-showpicker-round89.mjs:359-361`: Negative cases `accept-domread-law`, `accept-domread-law-bytes`, and `accept-domread-law-state`.
- **Sibling lanes (`*-shokunin`)**:
  - `corpus/knowledge`: Zero matches in any sibling knowledge base (occurrences in `chousa` and `kagi` are third-party bundled HTML/JS captures, e.g., Wix `fastdom` or GTM `callOnDomReady`, unrelated to DOM evaluation).
  - `SCORECARD.md`: Zero matches across all sibling lanes and fleet root.

### 1.3 `comma-separated`
- **`audio-shokunin`**:
  - `corpus/fixtures/measure_audio.py:8841,9679,9726`: PipeWire node prop parser supports space- or comma-separated property strings.
- **`game-dev-3d-shokunin`**:
  - `corpus/knowledge/unreal-mcp/executability/gameplay-gas.md:63`: Describes Unreal Gameplay Ability System (GAS) tags and functional descriptors as comma-separated clauses.
- **`kagi-shokunin`**:
  - `corpus/knowledge/claim-ledger.md:217`: Verification field grammar specifies `Reverify:` takes comma-separated row IDs.
- **`kaidoku-shokunin`**:
  - `corpus/knowledge/2026-11-04-r83-positive-source-attribution.md:19`: Source attribution parser binds a comma-separated leading list of source IDs (`S...`).
- **`kake-shokunin`** (Web standard list parsing in knowledge):
  - `corpus/knowledge/cache-control-effective.md:42`: RFC 9111 `Cache-Control` header grammar for comma-separated directive lists.
  - `corpus/knowledge/http-list-and-method-grammar.md:16,23`: RFC 9110 §5.6.1.2 list members are comma-separated with optional whitespace (OWS).
  - `corpus/knowledge/meta-robots-directives.md:31`: Multiple robots rules combined in comma-separated list.
  - `corpus/knowledge/policy-value-classes.md:5,28,36`: Frozen comma-separated `name[=parameter]` policy grammar.
  - `corpus/knowledge/referrer-policy-effective.md:27`: `Referrer-Policy` token list processed left to right over comma-separated values.
  - `corpus/knowledge/response-header-expectations.md:207`: Evaluates comma-separated header list semantics.
  - `corpus/knowledge/x-robots-tag-header.md:37,43`: Multi-rule comma-separated `X-Robots-Tag` headers.
- **`kama-shokunin`**:
  - `corpus/knowledge/served-identity-crosswalk.md:27,43`: `llama.cpp` CLI `--alias` documentation takes comma-separated model names.
- **`kotoba-shokunin`**:
  - `corpus/knowledge/allowed-tools-surfaces-round80.md:14,32,43,51`: Claude Code skill frontmatter `allowed-tools` accepts a space- or comma-separated string or YAML list.
- **`mado-shokunin`**:
  - `corpus/knowledge/hyprland-dispatcher-dispatch-r51.md:64,204`, `keybind-rule-semantics.md:73`, `workspace-rules-r27.md:26`: Hyprland configuration syntax for comma-separated dispatchers and workspace rules.
- **`revenger-shokunin`**:
  - `corpus/knowledge/round-98-rea-host-readiness.md:97`: `rea-doctor` CLI diagnostic prints comma-separated installation paths.
- **`tsukuroi-shokunin`**:
  - `corpus/knowledge/module-parameter-plane-r71.md:18`: Kernel module parameter `module_blacklist` takes comma-separated entries.
  - `corpus/knowledge/systemd-job-transaction-plane-r75.md:110`: Documents systemd job transaction items as eight comma-separated clauses.
  - `SCORECARD.md:6308`: Round 76 C2 records erratum naming eight comma-separated items.
- **`tabi-shokunin`**:
  - `scripts/chrome-cdp-showpicker-round89.mjs:142`: Splitting raw HTML `accept` attribute on commas (`a.split(',')`).
  - `scripts/check-showpicker-round89.mjs:458,463,464,466`: Multiple `accept` attribute test vectors (`'image/png, .txt'`, `'image/png,application/pdf'`, `'  image/png ,  .txt  '`, `'audio/*,video/*'`).

### 1.4 `setFileInputFiles`
- **`tabi-shokunin`** (Sole true owner):
  - `corpus/knowledge/`: Documented across Rounds 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88 as the CDP command `DOM.setFileInputFiles` used to answer file choosers, verifying that programmatic input bypasses UI dialog filtering.
  - `SCORECARD.md:3808,3814,3828,3984,4005,4008,4018,4175`: Capability records for `chromium-file-chooser-linux` and `chromium-showpicker-linux`.
  - `scripts/`: `check-filechooser-r77.mjs`, `check-filechooser-r78.mjs`, `check-showpicker-r80.mjs` through `round89.mjs`, `chrome-cdp-showpicker-round80.mjs` through `round89.mjs`, `negatives-showpicker-round89.mjs`.
- **Sibling lanes (`*-shokunin`)**:
  - `corpus/knowledge`: Zero matches across all 20 sibling lanes (hits in `chousa` are read-only external citation audits scanning `tabi`'s `SOURCES.md:223`).
  - `SCORECARD.md`: Zero matches across all sibling lanes and fleet root.

### 1.5 `showPicker`
- **`tabi-shokunin`** (Sole true owner):
  - `corpus/knowledge/`: Documented across Rounds 79 through 88 as `HTMLInputElement.showPicker()`, establishing activation consumption laws, cross-origin security boundaries, and input type exemptions.
  - `SCORECARD.md:3895,3918,3921,3926,4005,4043,4096,4167`: Capability generation records for `chromium-showpicker-linux`.
  - `scripts/`: `check-showpicker-r79.mjs` through `check-showpicker-round89.mjs`, `chrome-cdp-showpicker-round79.mjs` through `round89.mjs`, `negatives-showpicker-round89.mjs`, `kill-power-round89.mjs`.
- **Sibling lanes (`*-shokunin`)**:
  - `corpus/knowledge`: Zero matches in any sibling domain knowledge base (hits in `chousa` and `tameshi` are audit logs indexing `tabi`'s files).
  - `SCORECARD.md`: Zero matches across all sibling lanes and fleet root.

### 1.6 Record-Drift Counters
- **`tsukuroi-shokunin`**:
  - `SCORECARD.md:794-1545`: Origin of the repo-state drift counter family (`tools/check-self-assessment.py` and `tools/check-selftest-tally.py`).
  - `tools/check-selftest-tally.py`: Scopes tally audits to `git diff -U0 <base>..<head>`, asserting hermetic isolated fixtures with stable error IDs (`SWEEP-MISMATCH`, `SWEEP-LABEL`, `SWEEP-NO-RECEIPT`).
- **`kaidoku-shokunin`**:
  - `SCORECARD.md:5207`: Records lineage of self-assessment counters (`tsukuroi`'s `check-self-assessment.py`, `souji`'s `souji-capability-agreement.py`).
- **`kama-shokunin`**:
  - `SCORECARD.md:3734`: Round 67 calibration gate repairing self-record drift via `tools/worktree-landing-check.py`.
- **`chousa-shokunin`**:
  - `corpus/knowledge/chain-resolution-r3.md:42`, `exempt-hop-audit-r32.md:28`: Formulates citation-drift and provenance verification checks.
- **`tabi-shokunin`**:
  - `scripts/check-record-drift-r79.mjs` through `scripts/check-record-drift-r89.mjs`: Dedicated lineage of record-drift instruments auditing SCORECARD, SKILL, lessons, and QUALITY against repo state.

---

## 2. Contestation & Adjacency Analysis

1. **Browser Automation & File Chooser Ground (C1 — Coverage)**:
   - **Status**: **Uncontested (100% Tabi-owned)**.
   - **Finding**: None of the 20 sibling lanes touch CDP browser automation, file picker dialogs, `HTMLInputElement.showPicker()`, or DOM accept token lists. Plating four DOM-parsed token-list legs (`sp89-accept-domread-text`, `sp89-accept-domread-png`, `sp89-accept-domread-multimime`, `sp89-accept-domread-whitespace`) expands Tabi's capability from raw attribute strings to settled DOM descriptors without encroaching on any sibling domain.
2. **Calibration Ground (C2 — Record Drift & Selftest)**:
   - **Status**: **Uncontested (Locally bounded)**.
   - **Finding**: Auditing SCORECARD tallies, selftest wording, and QUALITY §161 sweep statements against local repo state is strictly internal to `tabi-shokunin`. It modifies no fleet-root contracts and causes no friction with sibling calibration gates.

---

## 3. Patterns to Reuse Across Lanes

1. **Web Standard Normalization Disclosure (`kake-shokunin`)**:
   - `kake-shokunin` (`http-list-and-method-grammar.md`, `referrer-policy-effective.md`) rigorously distinguishes between wire-format list parsing (ASCII whitespace, case-folding) and general JavaScript defaults (`trim()`, `toLowerCase()`).
   - Tabi should reuse this discipline: explicitly document in knowledge notes that the in-page `split(',').map(...)` logic is a fixture-level normalization harness matching WHATWG §2.3.8 comma-separated token conventions, rather than Chromium's internal file dialog filter.
2. **Diff-Scoped Verification Sweeps (`tsukuroi-shokunin`)**:
   - `tsukuroi-shokunin` (`check-selftest-tally.py`) avoids cross-round tally corruption by binding sweeps to git diff ranges (`--range <base>..<head>`).
   - Tabi's defect D1 (sweeping historical rounds 44, 68, 79, etc., to `10/10`) occurred because QUALITY §161 ran an unanchored global regex across `SCORECARD.md`. Adopting scoped sweeps prevents future accidental mutation of historical round records.
3. **Hermetic In-Process Fixture Isolation**:
   - Both `tsukuroi` and `tabi`'s r89 drift gate instantiate hermetic fixture lanes with stable finding IDs. Ensuring clean removal in-process prevents scratch directory contamination across consecutive runs.

---

## 4. The One Non-Obvious Move (Compatible Synthesis)

### 4.1 Grounded Evidence Across Round 89 Audits & Proposals
1. **The Sentence-Binding Loophole (`R89Critic.md` §C2)**:
   - In `scripts/check-showpicker-round89.mjs:939-943`, `replay-limit-consistency` computes `limBad` by recalculating `absNeed` and verifying `sims.every(p => p.refused === ...)`.
   - However, the printed `limit.sentence` is assembled via string interpolation on line 953 *after* the check has executed.
   - No check parses the rendered `limit.sentence` string to verify that the printed parenthesized `absNeed` numbers (`(${sims.map(x => x.absNeed).join(',')})`) match the computed array. A mutant or typo in `limit.sentence` passes undetected. The claim that the check "binds the printed sentence" is currently an unverified tautology.
2. **The Selftest Runner Constant Desynchronization (`R89Critic.md` §C1 & `scripts/selftest-r89-gates.mjs:55`)**:
   - In `scripts/selftest-r89-gates.mjs:55`, the `counter-clean` gate asserts:
     `r.json.verdict === 'clean' && r.json.checkCount === 102`.
   - But in round 89, six new checks were added (four domread laws, one `accept-domread-law`, and one `replay-limit-consistency`), bringing the true check count to **108**.
   - As a result, `selftest-r89-gates.mjs` fails on committed bytes (`checkCount 108 !== 102`), rendering C1 leg (c) ("selftest green") technically red under the frozen runner.
3. **The Baseline Mismatch Ambiguity (`R89Exec3.md` §1)**:
   - `claims.json` C2 leg (b) states: "the BEFORE control ... exits 1 with mismatches 2 (`selftest-wording`, `quality161-sweep`)".
   - But R89Exec3 proved that running `check-record-drift-r89.mjs` against a clean worktree of base `5a901163` produces **3 mismatches** (`selftest-wording`, `gate-selftest`, `quality161-sweep`), because `scripts/*round89.mjs` are absent at base, failing `gate-selftest`.
   - The "2 mismatches" count holds only if `gate-selftest` is evaluated against live-lane files or exempted on base runs.

### 4.2 Affected Axes
- **Calibration (C2)**: Transformed from an internal math restatement into a genuine bidirectional verification gate that validates printed evidence against computed numbers.
- **Coverage & Operability (C1)**: Resolves the runner `checkCount` conflict (108 vs 102), making the selftest causal and green without relaxing check rigor.
- **Adjacency**: Aligns Tabi with `tsukuroi` and `kake` verification patterns.

### 4.3 Proposed Move: Bidirectional Replay-Sentence Parsing and Selftest Count Synchronization
1. **In `scripts/check-showpicker-round89.mjs` (or successor r90 counter)**:
   - Update `replay-limit-consistency` to parse the printed `limit.sentence` string directly:
     ```javascript
     const sent = limitSentenceTemplate(sims);
     const parsedNeeds = (sent.match(/perPrior \(([\d,]+)\)/)?.[1] || '').split(',').map(Number);
     const sentMatches = same(parsedNeeds, sims.map((x) => x.absNeed));
     check('replay-limit-consistency', limBad.length === 0 && sentMatches && sims.every((p) => p.refused === (p.absMatched >= p.absNeed) || p.absNeed === 0), ...);
     ```
   - This closes the verification gap identified by `R89Critic`, ensuring that the printed sentence cannot diverge from the underlying calculation.
2. **In `scripts/selftest-r89-gates.mjs`**:
   - Synchronize line 55 to assert `r.json.checkCount === 108` (matching the 108 checks verified on the r89 scored receipt and probes), resolving the C1 leg (c) failure.
3. **In C2 Calibration Claims & Records**:
   - Clarify the baseline mismatch semantics: state explicitly that base `5a901163` produces 3 mismatches when evaluated as a strict headless checkout (due to absent r89 scripts under `gate-selftest`), or 2 mismatches when evaluating record-file drift specifically.

### 4.4 Risks & Mitigations
- **Risk**: Modifying `limit.sentence` formatting could break regex consumers in historical test harnesses.
- **Mitigation**: The regex `/perPrior \(([\d,]+)\)/` binds strictly to the exact parenthesized list format introduced in round 88 and carried in round 89, without modifying surrounding prose.
- **Risk**: Changing the selftest runner constant requires updating frozen pin hashes if performed mid-flight.
- **Mitigation**: Under current frozen pins (D `7bde5e6c2f2d`), seats operate in read-only observation; this synthesis provides the clean integration blueprint for L1 `TabiR89` during wave closeout or successor round planning.

### 4.5 Verification Protocol
1. **Calibration Check**:
   - `node scripts/check-record-drift-r89.mjs --lane <ABS lane> --json` exits 0 with claims 4, mismatches 0 once the r89 lesson and QUALITY §161 updates land.
   - Mutate a numeral inside `limit.sentence`: `replay-limit-consistency` exits 1, proving causal detection of sentence tampering.
2. **Selftest & Capability Check**:
   - `node scripts/selftest-r89-gates.mjs --lane <ABS lane> --work <ABS scratch> --json` exits 0 with all gates passing under `checkCount === 108`.
   - Scored receipt `corpus/evidence/round89/chromium-showpicker/receipt.json` validates clean at 108 checks.
