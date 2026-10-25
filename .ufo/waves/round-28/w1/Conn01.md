# Conn01 — UFO-FSD Connector: Sibling Overlap Scan and Unified Synthesis

- Seat: `Conn01` (item 57, connector, UFO-FSD fleet).
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- Baseline: `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (HEAD == baseline).
- Frozen claims read: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json` (`schema: tabi-round-claims-v1`, `frozenAt: 2026-10-25`, `frozenBeforeData: true`).
- Prior defect evidence: `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.
- Report path: `.ufo/waves/round-28/w1/Conn01.md` (relative to lane root).

---

## 1. Sibling Overlap Scan (C1 Depth & C2 Calibration)

A comprehensive cross-seat scan across all wave-1 artifacts (`Exec01`, `Exec04`, `Exec05`, `Exec07`, `Exec08`, `Exec09`, `Exec10`, `Exec11`, `Exec14`, `Exec16`, `Exec17`, `Exec19`, `Exec20`, `Exec22`, `Exec24`, `Crit01`, `Crit02`, `Crit04`, `Crit06`, `Crit08`, `Scribe01`, `Scribe02`, `Scribe03`, `Scribe04`, `Scribe05`, `Scribe06`, `Scribe08`) identifies broad convergence on baseline defects, but critical contradictions in proposed implementations.

### 1.1 C1 S106 Receipt Revision Binding (`scripts/check-s106-evidence.mjs`)
- **Baseline Consensus (Observed):**
  - Gate selftest has 5 cases (`clean-fixture-valid`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid`, `missing-bytes-could-not-evaluate`, `missing-receipt-could-not-evaluate`). All 5 pass; exit 0. Below target $\ge 7$.
  - Target receipt `corpus/evidence/round-26/sources/s106.json` (14 top-level keys) carries **no revision field**.
  - `evaluate()` evaluates receipt and bytes at `--rev`, but never reads or enforces any revision identity.
  - Mismatch fixtures currently pass green with `valid=true` (reproduced by `Crit02`, `Crit04`, `Crit06`, `Crit08`).
- **Core Contradiction Across Proposals:**
  - *Camp A (Strict Revision Equality — Exec01, Crit04, Crit06, Crit08):* Propose checking `receipt.revision === resolvedRev`.
  - *Camp B (Lineage / Ancestry Binding — Exec07, Exec14, Exec19):* Propose checking `git merge-base --is-ancestor receipt.measured_rev resolvedRev`.
  - *Camp C (Cross-Revision Content Binding — Crit02):* Propose verifying bytes committed *at* `receipt.measured_rev`.
  - *The Circularity & Operability Hazard (Crit02, Exec07, Exec19):* A git commit hash is a content-addressed SHA over the tree containing the receipt blob. A receipt cannot contain its own commit hash without an unresolvable fixed point. If strict equality (`rev === receipt.revision`) is enforced, evaluating the gate at tip or any subsequent commit (round 29+) will fail with `valid=false`. This destroys `operability` and violates C1's kill rule ("runtime gate at its committed target receipt remains valid").
  - *The Atomicity / Legacy Receipt Trap (Exec08, Exec20, Crit02, Crit06):* Committed `s106.json` lacks a revision field. If `parseReceipt` strictly requires a revision field without updating `s106.json` in the same commit, the runtime gate on the committed target receipt immediately flips from `valid=true` to `Refusal` (exit 2 CNE), failing the kill rule.

### 1.2 C2 Self-Assessment LOG Matcher (`scripts/check-selfassessment.mjs`)
- **Baseline Consensus (Observed):**
  - `LOG.md:221` (freshness selftest tally: claimed 8, observed oracle 12) is falsely marked `superseded=true`.
  - Matcher condition at `scripts/check-selfassessment.mjs:325` uses loose `/:\d+/`, matching *any* colon-digit token in a later paragraph.
  - In `LOG.md`, paragraph 265–284 contains timestamp `2026-10-15T05:16:28Z` (`:16`, `:28`) and states `cases: 12`, clearing `:221` as collateral without citing line 221.
  - Selftest has 17 cases, all passing. It contains positive exact citation (`m1-log-stale-then-corrected`, citing `:6`) and wrong number (`m1-log-wrong-number-correction`), but **no red unrelated-citation case**.
- **Contradictions & Refinements Across Proposals:**
  - *Naive Regex Pitfall (Crit01):* Simply checking for `f.line` after any colon (`/:\d+/`) can falsely match timestamps (e.g. `12:21` or `02:21` containing `221`). Line citations must be parsed in citation context (`/(?:LOG\.md)?:\s*(\d+)\b/g` or `/(?:supersedes|LOG\.md)[^:\n]*:(\d+)\b/g`).
  - *Collateral Windows (Exec14, Crit01, Exec09):* `m1Findings` (the SCORECARD window, lines 231–240) also uses `/:\d+/`. Exec09 verified that all existing SCORECARD supersessions cite their exact lines, so tightening will not induce false-mismatch regressions there.
  - *Test Fixture Efficiency (Exec04, Exec10, Exec16, Exec22):* Exec22 proposed an adversarial fixture with two stale lines (6 and 8), where a correction only cites 8. This cleanly proves both the positive control (8 clears) and the red control (6 remains a mismatch) in a single fixture.

---

## 2. Affected Axes

- **depth (C1):** Direct claim axis. Baseline score 8. Improved by enforcing measurement-revision binding and expanding selftest cases from 5 to $\ge 7$ with verified red/green revision fixtures.
- **calibration (C2):** Direct claim axis. Baseline score 9. Improved by eliminating the `LOG.md:221` false-clear and introducing red unrelated-citation regression coverage.
- **operability (Axis at 8):** **Protected from regression.** Strict equality in C1 would break runtime gate execution on future descendant commits and violate C1's kill rule; lineage binding preserves operability indefinitely.
- **freshness / adjacency / coverage (Scores 8, 8, 9):** Unharmed; no un-scoped source admissions, no tracked drift outside the coordinated changes.

---

## 3. Proposed Non-Obvious Move: The Coordinated Lineage & Exact Citation Contract

Synthesizing across the proposals, execute a single bounded, non-obvious move that resolves the circularity, atomicity, and regex-leakage hazards simultaneously:

1. **Adopt Lineage Binding (`is-ancestor`) over Strict Equality for C1:**
   - In `scripts/check-s106-evidence.mjs`:
     - Add `measured_rev` to receipt schema validation (`parseReceipt`).
     - In `evaluate()`, resolve `measured_rev` via `resolveRev(repo, receipt.measured_rev)`.
     - Enforce that `measured_rev` is an ancestor of or equal to the evaluated `rev`: `git merge-base --is-ancestor <measured_rev> <rev>`.
     - On mismatch: return `invalid` (exit 1, `valid: false`, `rev_match: false`). Unresolvable revision yields `could-not-evaluate` (exit 2).
     - Keep blob integrity verification: bytes at the evaluated revision (or at `measured_rev`) must match `decoded_sha256` and the anchor.
2. **Atomic Target Receipt Stamping:**
   - In the exact same change, update `corpus/evidence/round-26/sources/s106.json` to include:
     `"measured_rev": "0c666adc217685e1ece2af8596b732b303a3b15c"` (the round-26 commit introducing the decoded bytes).
   - Because `0c666adc...` is an ancestor of baseline `eb23c0b8...` and of the round-28 tip, `node scripts/check-s106-evidence.mjs --rev <tip> --json` remains `valid=true`, satisfying the C1 kill rule without circular self-reference.
3. **C1 Two-Commit Selftest Expansion (5 $\rightarrow$ 7 cases):**
   - Add Case 6: `revision-match-valid` (green, exit 0, `measured_rev` is parent commit).
   - Add Case 7: `revision-mismatch-invalid` (red, exit 1, `measured_rev` is an unmerged orphan commit).
   - Retain all 5 existing cases (including missing-bytes and missing-receipt CNE cases, exit 2).
4. **Context-Bounded Exact Citation Token Matching for C2:**
   - In `scripts/check-selfassessment.mjs:319-327` (`m1LogFindings`):
     - Replace `/:\d+/` with an exact-citation extractor: parse line citations matching `/(?:LOG\.md)?:\s*(\d+)\b/g` while ignoring ISO timestamp patterns (`T\d{2}:\d{2}:\d{2}`).
     - Require `citedLines.has(f.line)`.
   - Adopt Exec22's dual-stale selftest fixture (lines 6 and 8 stale; correction cites 8):
     - Line 8 clears (positive exact-citation control).
     - Line 6 remains counted mismatch (red unrelated-citation control).
     - Selftest increases 17 $\rightarrow$ 18 cases; header updated.
5. **Harmonized Verification:**
   - At tip, `LOG.md:221` becomes `superseded=false` (mismatch), meeting C2 target.
   - `scripts/check-s106-evidence.mjs` remains runnable by `check-selfassessment.mjs`'s `gateTally` (meeting `RUNNABLE_GATE` contract).

---

## 4. Risks and Failure Modes

- **Risk 1 (Circularity Fallacy):** If an executor naively attempts `receipt.measured_rev === rev`, no commit containing the receipt can ever pass at that commit without hash alteration. Lineage binding (`is-ancestor`) completely eliminates this risk.
- **Risk 2 (Atomicity Split):** If the gate script is modified before `corpus/evidence/round-26/sources/s106.json` is stamped with `measured_rev`, the runtime gate on the committed receipt will fail with exit 2 (CNE), triggering C1's kill rule. They must land together.
- **Risk 3 (Environmental Mismatches in C2):** `check-selfassessment.mjs` reports `m3-unlanded-paths` due to untracked `.ufo/waves/` files during active runs. Evaluators must verify that `LOG.md:221` is specifically present in `findings` with `superseded=false`, rather than relying solely on scalar `mismatches === 1`.
- **Risk 4 (Timestamp Token Collision):** If the citation regex uses plain `/:(\d+)/` without prefix/digit boundaries, times such as `02:21` could falsely match line 221. The regex must isolate line citation tokens.

---

## 5. Verification Commands

For the main agent / integrator post-landing:

1. **C1 Selftest ($\ge 7$ cases):**
   ```sh
   node scripts/check-s106-evidence.mjs --selftest --json
   # Expect: cases >= 7, passed == cases, exit 0
   ```
2. **C1 Runtime Gate at Tip:**
   ```sh
   node scripts/check-s106-evidence.mjs --rev HEAD --json
   # Expect: valid: true, sha_match: true, rev_match: true, exit 0
   ```
3. **C2 Selftest ($\ge 18$ cases):**
   ```sh
   node scripts/check-selfassessment.mjs --selftest --json
   # Expect: cases >= 18, passed == cases, exit 0
   ```
4. **C2 Mismatch Verification at Tip:**
   ```sh
   node scripts/check-selfassessment.mjs --rev HEAD --json | jq '.findings[] | select(.doc=="LOG.md" and .line==221)'
   # Expect: claimed: 8, observed: 12, superseded: false (counted mismatch)
   ```

---

## 6. Final Answer (at most 6 lines)

1. Sibling scan exposes a fatal circularity in strict C1 revision equality (`rev === receipt.revision`) and an atomicity kill-rule trap if `s106.json` is not stamped concurrently.
2. The non-obvious move synthesizes Lineage Binding (`is-ancestor`) with atomic `measured_rev: 0c666adc...` stamping for C1, and Context-Bounded Line Token Matching for C2.
3. C1 selftest expands 5 $\rightarrow$ 7 cases (red orphan-mismatch + green ancestor-match; missing-source CNE preserved); runtime gate at tip stays valid.
4. C2 selftest expands 17 $\rightarrow$ 18 cases via Exec22's dual-stale fixture (line 8 clears, line 6 fails); timestamp false-clears are eliminated.
5. `LOG.md:221` correctly remains a counted mismatch at tip; `depth` and `calibration` improve while `operability` is protected from future breakage.
6. Report written to `.ufo/waves/round-28/w1/Conn01.md`.
