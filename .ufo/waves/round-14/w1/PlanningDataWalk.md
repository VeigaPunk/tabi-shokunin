# PlanningDataWalk — Bounded Planner Data-Walk (Tabi Round 14)
agent: TabiR14.PlanningDataWalk (scout)
timestamp: 2026-10-20
repo-root: /home/vgpnk/Projects/shokunin/tabi-shokunin
baseline-head: bebe2efc4565bb068efd905e9ef78011bb6b4efd
predecessor-delivery: c70228678b5be4af23474d7c927035de54e3a885

================================================================================
1. EXECUTIVE SUMMARY & ROUND-14 CONTEXT
================================================================================

- Round 14 Baseline & Campaign Posture:
  - Baseline commit: `bebe2efc4565bb068efd905e9ef78011bb6b4efd` (clean working tree, valid source census exit 0).
  - Preceding round 13 delivery: `c70228678b5be4af23474d7c927035de54e3a885`, formally admitted by outside non-author verifier @m_strong (`corpus/lessons/round-13-verifier-spotcheck.md:7`).
  - L1 holds canonical planner; this scout data-walk establishes bounded factual grounding and obligations without offering a competing top-level plan.

- Declared Claims for Round 14:
  - C1 Operability (lowest tie 8): Eliminate execution of lane-authored SCORECARD shell commands in both legacy gates (`scripts/check-round-contract.mjs` and `scripts/check-user-round-contract.mjs`), replacing shell execution (`spawnSync('bash', ['-c', command])`) with a dedicated non-shell parser and runner. Preserve exact historical git-blob line-count semantics, expected counts (10 pstack rounds, 6 user rounds), and honest red findings (USER gate `round_count 6/10`).
  - C2 Calibration (tied 9): Deliver an independently checked, corrected round-13 cleanup and Node metadata sidecar (0 → 1) addressing routed verifier defects (`round-13-verifier-spotcheck.md:158-159`). Retain the original round-13 receipt and runtime pin byte-for-byte; do not modify historical files or pretend new browser execution took place.
  - Scalar Policy: All six ordinal scalars remain unchanged (deltas = 0). Improvements are measured as discrete, verifiable qualitative evidence and counter increments, preventing premature score inflation.
  - Causal Separation: Claims are causally separable; neither claim depends on the other's code, evidence files, or execution outcomes.

================================================================================
2. SCORECARD LOWEST AXES ANALYSIS & TRAJECTORY
================================================================================

- Historical Score Progression:
  - Probation Rounds 1–3: Initial baseline (depth 7, coverage 5, operability 5, freshness 3, calibration 6, adjacency 5).
  - Training Rounds 4–11: Closed terminal refresh at HEAD `d24b98d` (`SCORECARD.md:92-101`).
  - Pstack Continuation (2026-10-15): 10 rounds advanced scores to depth 7, coverage 7, operability 6, freshness 7, calibration 7, adjacency 7 (`SCORECARD.md:218-235`).
  - User Continuation (2026-10-15): 6 admitted rounds brought depth 8, coverage 8, operability 7, freshness 8, calibration 8, adjacency 8 (`SCORECARD.md:322-330`).
  - Kaika Fleet Round 1 (2026-10-19): Outside admission (`corpus/lessons/round-1-verifier-spotcheck.md:17`):
    - depth: 8
    - coverage: 8 → 9 (+ capability `sources-registry`, 27 SOURCES rows)
    - operability: 7 → 8 (`scripts/check-sources.mjs`, 26 self-tests)
    - freshness: 8
    - calibration: 8 → 9 (drift resolved, 7 QUALITY criteria)
    - adjacency: 8
  - Round 12 (2026-10-20): Admitted with all scalar deltas = 0 (`SCORECARD.md:471-478`):
    - depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8.
  - Round 13 (2026-10-20): Admitted by outside verifier @m_strong (`corpus/lessons/round-13-verifier-spotcheck.md:7`, `SCORECARD.md:534-542`):
    - depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8.
    - All ordinal scalar deltas were 0.

- Current Scores at Round 14 Entry:
  - depth: 8
  - coverage: 9
  - operability: 8
  - freshness: 8
  - calibration: 9
  - adjacency: 8

- Lowest Non-Retired Axes Analysis:
  - Lowest non-retired score value: 8.
  - Lowest non-retired set: {depth, operability, freshness, adjacency} (all tied at 8).
  - Retired axes: None (`SCORECARD.md:523`, `SCORECARD.md:589`).
  - Trend Tie-Break Rule (`AXES.md:20-23`):
    - Three learning trends:
      1. Expansion ↔ coverage (9) + adjacency (8) [average 8.5].
      2. Quality ↔ depth (8) + freshness (8) + operability (8) [all 8.0].
      3. Discernment ↔ calibration (9) [9.0].
    - Rule: "Pick the round's axis from the trend furthest behind" (`AXES.md:22-23`).
    - Quality is the trend furthest behind, with all three constituent axes at 8.
    - Working Operability (8) directly advances the Quality trend and satisfies both `AXES.md:22-23` (trend furthest behind) and `AXES.md:33-34` ("At least one claim works the lane's lowest-scoring non-retired axis").
  - Calibration (9) in C2:
    - C2 addresses Calibration (9), which is not in the lowest set, but carries a scalar delta of 0.
    - `AXES.md:27-34` authorizes 1–3 claims per round as long as at least one claim works the lowest-scoring non-retired axis and claims name distinct axes. Working Operability (lowest) alongside Calibration (non-lowest) is strictly compliant.

================================================================================
3. SCORE SATURATION & CAPABILITY WINDOW
================================================================================

- Saturation Line:
  - Saturation line is established at 8 (`SCORECARD.md:523`, `SCORECARD.md:588`).
  - All six lane axes currently sit at or above the saturation line (depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8).

- Stagnation Window & Stagnation Nudge (`AXES.md:66-73`):
  - Stagnation window parameter: N = 3 rounds (`SCORECARD.md:588`).
  - Stagnation nudge rule: "When every axis the lane owns sits at or above the lane's saturation line and no capability has entered the table within the lane's stagnation window (both recorded in SCORECARD.md), the lowest-axis obligation is waived: the round should be a frontier/capability move" (`AXES.md:68-73`).
  - Capability entry history:
    - `sources-registry` entered in Kaika Fleet Round 1 (`SCORECARD.md:428-433`).
    - Round 12 was stagnation window round 2 (no capability entered; docs-only entry).
    - `aria-locator-template-loopback` entered the capability table in Round 13 (`SCORECARD.md:572-575`, :588: "the demonstrated capability restarts the stagnation window at round13").
  - Evaluation at Round 14:
    - Round 14 is window round 1 following the Round 13 capability entry.
    - Because a capability entered in the immediate prior round (Round 13), the stagnation window (N = 3) has NOT elapsed.
    - Stagnation nudge does NOT fire.
    - The lowest-axis obligation is NOT waived and remains fully active. C1's focus on Operability (tied lowest at 8) fulfills this mandatory contract.

================================================================================
4. EXACT CLAIM OBLIGATIONS: C1 (OPERABILITY: NON-SHELL SCORECARD COUNTING)
================================================================================

- Context & Verifier Mandate:
  - Defect Citation: Outside verifier noted in `round-13-verifier-spotcheck.md:161`: "inherited broader gate debt retained: lane-authored SCORECARD shell execution... remain uncredited".
  - Existing implementation in both `scripts/check-round-contract.mjs:292-296` and `scripts/check-user-round-contract.mjs:310-314`:
    ```javascript
    function runCount(root, command) {
      const result = spawnSync('bash', ['-c', command], { cwd: root, encoding: 'utf8', timeout: 30000 });
      if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
      return result.stdout.trim();
    }
    ```
  - This pattern passes arbitrary lane-authored shell strings from `SCORECARD.md` directly to `/bin/bash`, creating arbitrary command execution vulnerabilities in gate verification.

- Exact Historical Counting Grammar Observed in `SCORECARD.md`:
  1. Single grep pipeline (`SCORECARD.md:238-244, 262-268, 270-276, 278-284, 286-292, 294-300, 302-308, 310-316` and `:332-379`):
     `git ls-tree -r --name-only <commit> | grep <pattern> | wc -l`
  2. Double grep pipeline (`SCORECARD.md:246-252, 254-260`):
     `git ls-tree -r --name-only <commit> | grep <pattern1> | grep <pattern2> | wc -l`
  3. Fixture generator pipeline (`scripts/check-round-contract.mjs:507`, `scripts/check-user-round-contract.mjs:580`):
     `git grep -h '<pattern>' <commit> -- <file> | wc -l`

- Technical Acceptance Requirements for C1:
  - C1.1: Replace `spawnSync('bash', ...)` with Non-Shell Execution
    - Eliminate all invocations of `/bin/bash`, `/bin/sh`, or any shell binary in `runCount()`.
    - Execute `git` directly using explicit argument arrays (`spawnSync('git', [...])`).
    - Perform all pipeline transformations (grep matching, filtering, line counting) directly in JavaScript.
  - C1.2: Enforce Strict Grammar Whitelist & Fail-Closed Parser
    - Parse counting commands against the exact historical grammar.
    - Reject any command containing shell control operators (`;`, `&`, `&&`, `||`, `|` if outside the recognized grep pipeline, backticks, `$()`, `${}`, redirect `<`/`>`, newlines, quotes outside patterns).
    - Reject option injection or argument tampering fail-closed (`score_mismatch` or `missing_score`).
  - C1.3: Preserve Exact Git-Blob Line-Count Semantics
    - Splitting output on newlines (`\n`) must handle trailing newlines identically to `wc -l` (i.e. an empty string yields 0 lines; lines ending in `\n` count the number of newline characters).
    - Matching logic must match POSIX `grep` semantics for literal and basic patterns as used in historical records.
  - C1.4: Inviolable Historical Anchor Preservation
    - `HARD_BASELINE` (`7f506affa55f6fb892d3c8073c75151c998bdf2c`) in both gates MUST NOT MOVE.
    - `PSTACK_PIN` (`92d700d6a8aa9855f1e9d2cc8e12c82f762a1367`) in `check-user-round-contract.mjs` MUST NOT MOVE.
    - Historical census SHA256 (`b9c8dc35...`) in `corpus/evidence/pstack-20261015/baseline-census.tsv` MUST NOT MOVE.
    - Historical lesson files `corpus/lessons/round-1.md` through `round-10.md` remain immutable.
  - C1.5: Preserved Gate Outcomes
    - Production ROUND gate (`node scripts/check-round-contract.mjs`): MUST exit 0 with `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`.
    - Production USER gate (`node scripts/check-user-round-contract.mjs`): MUST exit 1 with `USER_ROUND_CONTRACT verdict=failed finding=round_count` ("Found 6 user rounds, expected 10"). Do NOT manufacture missing user rounds or reduce `--expect 10`.
  - C1.6: Pinned Tooling Cutover in UserGate
    - `scripts/check-round-contract.mjs` is guarded in `check-user-round-contract.mjs` via policy digest.
    - Repaired RoundGate script's new SHA-256 digest must be pinned in UserGate or `legacy-history-policy.json`. Blanket exemptions are forbidden.
  - C1.7: Self-Test Expansion with Hostile Malicious Controls
    - Expand `--self-test` in both gates to assert rejection of:
      - Command chaining attempts (`git ls-tree ...; rm -rf ...`).
      - Shell injection attempts (`git ls-tree ... $(cat /etc/passwd)`).
      - Redirection attempts (`git ls-tree ... > out.txt`).
      - Unknown binary execution (`sh -c ...`, `python -c ...`).
      - Unsupported option flags and arguments.

================================================================================
5. EXACT CLAIM OBLIGATIONS: C2 (CALIBRATION: METADATA SIDECAR QUALIFICATION)
================================================================================

- Context & Verifier Mandate:
  - Outside verifier identified two status-neutral metadata defects in Round 13 evidence (`round-13-verifier-spotcheck.md:158-159`):
    1. Defect 1: Summary field inversion in `scripts/aria-loopback-round13.mjs:605` where `listeningAfter` was assigned `serverProofs.every((proof) => proof.listeningAfter === false)`. When all workers were confirmed not listening, the field evaluated to `true`, contradicting the per-worker proofs (`listeningAfter=false`, `closed=true`, `ECONNREFUSED`).
    2. Defect 2: Stale recorded Node version in `corpus/evidence/round-13/aria/runtime-pin.json:15` (`"recorded": "24.21.0"`), whereas the host runtime observed by the verifier was `26.12.0` and the enforced contract was `minimumMajor: 20`.
  - Verifier instruction: "Correct the field semantics or name in new evidence and preserve this original receipt; keep admission tied to correct per-worker closed/false/refused controls. Add a failure-capable summary consistency check." And "distinguish observed Node26.12.0 from runtime-pin.json's recorded24.21.0 and minimumMajor20; correct stale recorded metadata through a qualified new artifact, without pretending exact Node equality was enforced."

- Technical Acceptance Requirements for C2:
  - C2.1: Byte-for-Byte Preservation of Historical Round 13 Evidence
    - `corpus/evidence/round-13/aria/receipt.json` MUST NOT BE MUTATED.
    - `corpus/evidence/round-13/aria/runtime-pin.json` MUST NOT BE MUTATED.
    - `scripts/aria-loopback-round13.mjs` MUST NOT BE RETROACTIVELY EDITED to disguise historical run output.
  - C2.2: Deliver Validated Metadata Sidecar
    - Create a new metadata sidecar artifact in `corpus/evidence/round-14/aria-metadata/` (e.g. `aria-metadata-sidecar.json`).
    - Cryptographically pin the SHA-256 of the historical Round 13 receipt (`182B...`) and runtime pin (`4B4A...`).
    - Truthfully derive the aggregate server cleanup status from per-worker proofs, explicitly documenting and correcting the line-605 inversion defect.
    - Explicitly distinguish three Node version dimensions:
      1. Observed runtime: Node 26.12.0 (captured during execution).
      2. Recorded historical metadata: Node 24.21.0 (stale template value in pin).
      3. Enforced compatibility boundary: minimumMajor 20.
  - C2.3: Failure-Capable Validator CLI Gate (`scripts/check-aria-metadata.mjs`)
    - Deliver new standalone checker `scripts/check-aria-metadata.mjs`.
    - Validates sidecar schema, digest binding to historical Round 13 files, cleanup consistency, and Node metadata trifecta.
    - Supports `--self-test` asserting detection and rejection of:
      - Tampered Round 13 receipt digest.
      - Inconsistent worker vs aggregate cleanup states.
      - Missing or conflated Node version fields.
      - Spurious / unanchored sidecar records.
  - C2.4: Zero Fake Browser Execution
    - MUST NOT pretend a new browser run occurred.
    - No browser processes, no Playwright execution, no regenerated snapshot YAML.
    - Strictly author-side calibration and metadata qualification.

================================================================================
6. CAUSAL SEPARATION & SCALAR DISCIPLINE
================================================================================

- Structural Separation of Surfaces:
  - C1 (Operability): Touches `scripts/check-round-contract.mjs`, `scripts/check-user-round-contract.mjs`, and associated legacy history policy/evidence. Reads git history and `SCORECARD.md`.
  - C2 (Calibration): Touches `scripts/check-aria-metadata.mjs` and `corpus/evidence/round-14/aria-metadata/`. Reads historical Round 13 ARIA evidence in `corpus/evidence/round-13/aria/`.
  - Shared files: ZERO.
  - Shared runtime dependencies: ZERO.

- Independent Measurement Modes in `.ufo/waves/round-14/measure.mjs`:
  - `node .ufo/waves/round-14/measure.mjs <REV> --claim C1`:
    - Evaluates ONLY legacy contract gates: checks that both gates implement non-shell runCount, pass self-tests (including malicious rejection controls), and preserve exact production findings (ROUND clean 10, USER failed 6/10).
    - Does NOT inspect or execute ARIA metadata sidecars.
  - `node .ufo/waves/round-14/measure.mjs <REV> --claim C2`:
    - Evaluates ONLY ARIA metadata sidecar and validator: checks that sidecar exists, pins Round 13 receipt, corrects cleanup inversion, distinguishes Node metadata, and passes `check-aria-metadata.mjs --self-test`.
    - Does NOT execute or depend on legacy round/user contract gates.

- Failure Orthogonality:
  - Total failure of C1 (e.g. legacy gate regression or syntax error) leaves C2 completely measurable and verifiable.
  - Total failure of C2 (e.g. metadata digest mismatch or missing sidecar) leaves C1 completely measurable and verifiable.

- Scalar Discipline:
  - All six ordinal scalars hold at 0 delta:
    - depth: 8 → 8
    - coverage: 9 → 9
    - operability: 8 → 8 (counted improvement: 0 → 2 non-shell legacy gates)
    - freshness: 8 → 8
    - calibration: 9 → 9 (counted improvement: 0 → 1 verified metadata sidecar)
    - adjacency: 8 → 8
  - No scalar inflation; discrete counting probes prevent unearned score upgrades before independent outside verification.

================================================================================
7. COMPREHENSIVE FALSIFIERS FOR ROUND 14
================================================================================

- Falsifiers for C1 (Operability: Non-shell Legacy Gates):
  1. Spawning Shell Interpreters: Calling `spawnSync('bash', ...)`, `spawnSync('sh', ...)`, or `execSync('...')` anywhere in `runCount` or the counting pipeline.
  2. Broad Grammar Bypass: Allowing arbitrary git subcommands or arbitrary arguments rather than strictly parsing the observed historical grammar.
  3. Swallowing Script Failures: Suppressing non-zero git exit codes or returning dummy 0 counts on git errors.
  4. Moving Historical Baseline Pins: Changing `HARD_BASELINE` (`7f506aff...`) or `PSTACK_PIN` (`92d700d...`).
  5. Mutating Historical Census: Changing `baseline-census.tsv` SHA256 (`b9c8dc35...`).
  6. Falsifying USER Green: Lowering `--expect 10` or synthesizing missing user rounds to force `check-user-round-contract.mjs` to exit 0.
  7. Unpinned RoundGate Cutover: Blanketing or ignoring diffs on `scripts/check-round-contract.mjs` in UserGate without digest pinning.
  8. Missing Negative Controls: Failing to prove rejection of command injections, shell control operators, or invalid command tokens in `--self-test`.

- Falsifiers for C2 (Calibration: Metadata Sidecar Qualification):
  1. Mutating Historical Round 13 Files: Editing `corpus/evidence/round-13/aria/receipt.json` or `runtime-pin.json` in place.
  2. Retroactively Editing Round 13 Runner: Altering `scripts/aria-loopback-round13.mjs` to claim it never had the line-605 defect.
  3. Faking Browser Execution: Claiming a new Playwright execution or generating new `.aria.yml` snapshots during round 14.
  4. Unanchored Metadata: Producing a sidecar that lacks cryptographic SHA-256 binding to the original Round 13 receipt.
  5. Conflating Node Dimensions: Failing to clearly delineate observed Node (26.12.0) from recorded metadata (24.21.0) and enforced major version (20).
  6. Vacuous Validator: Writing `scripts/check-aria-metadata.mjs` without self-tests proving rejection of corrupted sidecars or mismatched digests.

================================================================================
8. DIRECTIVES & VERIFICATION COMMANDS FOR L1 (CANONICAL PLANNER)
================================================================================

L1 alone integrates and executes verification commands after all leaf seats land. The following exact verification suite must be executed:

1. Step 1: Pre-Flight Source Census Integrity
   ```sh
   /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
   ```
   Must exit 0 with: `tabi\tok\t/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.

2. Step 2: C1 Legacy Gate Self-Tests (Including Malicious Controls)
   ```sh
   node scripts/check-round-contract.mjs --self-test
   node scripts/check-user-round-contract.mjs --self-test
   ```
   Both must exit 0, asserting all fixture cases, legacy aliases, and hostile command injection rejections.

3. Step 3: C1 Production Legacy Contract Checks
   ```sh
   node scripts/check-round-contract.mjs
   ```
   Must exit 0 with `ROUND_CONTRACT verdict=clean rounds=10 consequential=0`.
   ```sh
   node scripts/check-user-round-contract.mjs
   ```
   Must exit 1 with `USER_ROUND_CONTRACT verdict=failed finding=round_count` ("Found 6 user rounds, expected 10").

4. Step 4: C2 ARIA Metadata Validator Self-Tests & Production Gate
   ```sh
   node scripts/check-aria-metadata.mjs --self-test
   node scripts/check-aria-metadata.mjs
   ```
   Both must exit 0, confirming valid digest binding, corrected cleanup derivation, and explicit Node metadata qualification.

5. Step 5: Revision-Based Measurement Probes
   ```sh
   node .ufo/waves/round-14/measure.mjs <BASELINE_REV> --claim C1
   node .ufo/waves/round-14/measure.mjs <HEAD_REV> --claim C1
   node .ufo/waves/round-14/measure.mjs <BASELINE_REV> --claim C2
   node .ufo/waves/round-14/measure.mjs <HEAD_REV> --claim C2
   node .ufo/waves/round-14/measure.mjs <HEAD_REV> --histogram
   ```
   - C1 baseline exits 0 (repairs = 0); HEAD exits 0 (repairs = 2).
   - C2 baseline exits 0 (sidecar = 0); HEAD exits 0 (sidecar = 1).
   - Source histogram confirms 28 rows, A22/B4/C2, mined23/queued3/rejected2 unchanged.

6. Step 6: Non-Regression & Freshness Verification
   ```sh
   node scripts/check-sources.mjs --self-test
   node scripts/check-sources.mjs
   node scripts/check-freshness.mjs --worktree
   ```
   All must exit 0 with clean outcomes.
