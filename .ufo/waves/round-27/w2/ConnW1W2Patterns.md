# ConnW1W2Patterns — Cross-Wave Pattern Synthesis & Deduplicated Finding Ledger

**Seat:** `TabiR27.ConnW1W2Patterns` (UFO-FSD connector; read-only reporter).  
**Lane Root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
**Tip Revision Evaluated:** `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (`master`).  
**Baseline Revision:** `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (round 26 frozen baseline `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`).  
**Tooling Statement:** Zero packages or tools installed or updated. Pre-existing host node `v24.21.0` and git `2.56.0` used. PACMAN PAUSED host-wide. No tracked files modified.

---

## 1. Core Synthesis: The Paragraph-Supersession Deviation Question

### Question: Appears in both `RevFrozenFit` and `CritCorrectionGaming` — Same concern or two?

**Direct Answer: TWO DISTINCT CONCERNS** operating across different layers of the verification and governance substrate. Conflating them into a generic "paragraph issue" obscures a critical distinction between **contractual preregistration compliance** and **epistemic algorithm soundness**.

| Dimension | `RevFrozenFit` (Jurisprudential / Contractual) | `CritCorrectionGaming` (Epistemic / Structural) |
|---|---|---|
| **Layer** | Governance, pre-registration integrity, frozen-claim conformance. | Verification mechanics, anti-gaming robustness, proof of measurement. |
| **Core Question** | Did substituting "paragraph" for the frozen wording "line" violate the pre-data contract (the `kumitate` r42 failure mode)? Is it "deviation-justified" (an unavoidable accommodation of Markdown line-wrapping) or "deviation-real / failure"? | Regardless of what was declared, is the paragraph-chunking mechanism sound against gaming, accidental cross-clearing, and unverified assertions? |
| **Failure Mode Addressed** | Post-data predicate drift: changing the rules of evaluation after observing the data without an explicit pre-data amendment in `claims.json.revisions`. | False clears from shared context: whole-paragraph token pooling, unverified author testimony standing in for re-measurement, and cross-bullet contamination. |
| **Empirical Proof** | Literal line-unit evaluation clears **0 of 6** eligible baseline findings because script name, marker, citation, and oracle number live on wrapped lines of the same bullet list item (`CritC1Supersession.md:146-153`). | Paragraph-wide aggregation pools 5 separate bullets into one 22-line block (`LOG.md:1904-1925`), allowing script A's bullet to clear script B's finding, and clearing `LOG.md:221` without citation (`CritCorrectionGaming.md:13-20`, `RevC1FrozenFit.md:41-50`). |
| **Remedy Proposed** | Adjudicate C1 outcome as **FAILED** under frozen rules; record deviation in `claims.json.revisions` rather than smoothing the metric to 0 (`CritNovelty.md:67`). | Re-architect unit to the Markdown list item (`/^[-*]\s+/`), enforce citation equality `Number(cite) === f.line`, and require machine-readable run receipts (`CritCorrectionGaming.md:21-26`). |

**Conclusion for L1:** Treat them as two distinct defects. Do not repair the C1 counter code post-data in round 27 (respecting the `RevFrozenFit` frozen fit rule). Adopt the `CritCorrectionGaming` structural fixes as a future claim / QUALITY criterion candidate.

---

## 2. Deduplicated Finding Set for L1 Integration

The following deduplicated finding set synthesizes all 31 wave-1 reports and 24 wave-2 reports into unified, non-redundant items grouped by claim and artifact, citing the strongest empirical evidence pointer per item.

### Group 1: Claim C1 (Calibration) & `scripts/check-selfassessment.mjs` / `LOG.md`

#### Item C1.1 — Unbound Citation Matcher (`/:\d+/`) Causes Live False Clear of `LOG.md:221` and Falsifies Tip `mismatches=0`
- **Repeating Seats:** `CritC1Supersession` (w1), `ExecC1Attacks` (w1), `RevC1FrozenFit` (w1), `ExecC1Recount` (w2), `ExecC1LineAudit` (w2), `CritNovelty` (w2), `CritClaimHonesty` (w2).
- **Finding:** `scripts/check-selfassessment.mjs:325` evaluates `:\d+` presence across the paragraph without asserting equality with the finding's line (`f.line`). Any colon-number (timestamp, URL port, or different line) satisfies the check.
- **Strongest Evidence:** 
  - On live bytes at tip `bceb17d`, `LOG.md:221` (`claimed=8 observed=12`) is marked `superseded=true` by paragraph 265–447 (which cites only timestamp `:16`, `:28` and port `:18751`, never `:221`).
  - On scratch fixtures, citing `:999` clears line `:6` (`ExecC1Attacks.md:89` Case a, exit 0).
  - Under strict citation equality, baseline LOG findings are **6, not 5** (`:221` stands uncorrected), and tip LOG findings are **1, not 0**. The claim's declared metric `after: mismatches=0` fails (`ExecC1Recount.md:149-156`).

#### Item C1.2 — Supersession Unit Granularity (`paragraphs()` Blank-Line Chunking) Enables Cross-Bullet Clearance
- **Repeating Seats:** `RevC1FrozenFit` (w1), `CritC1Supersession` (w1), `ExecC1Attacks` (w1), `CritCorrectionGaming` (w2), `MutSupersessionEdge` (w2).
- **Finding:** `paragraphs()` (`scripts/check-selfassessment.mjs:256-265`) splits exclusively on double newlines (`\n\s*\n`). Consecutive Markdown bullet list items with zero blank lines between them merge into a single evaluation block.
- **Strongest Evidence:**
  - Round-27's five correction bullets (`LOG.md:1904-1925`) contain 0 blank lines and evaluate as a single 22-line paragraph.
  - Scratch fixture F vs F2 in `RevC1FrozenFit.md:48-50`: bullet correcting script A adjacent to bullet naming script B clears script B's finding; inserting a blank line between them restores script B's finding.

#### Item C1.3 — Ambient Number Pickup in `statedTallyNumbers()` via Bare Fractions
- **Repeating Seats:** `RevC1FrozenFit` (w1), `CritC1Supersession` (w1), `ExecC1Attacks` (w1).
- **Finding:** `statedTallyNumbers` (`check-selfassessment.mjs:246-254`) includes a bare fraction regex `/\b(\d+)\s*\/\s*(\d+)\b/` without tally context. Any non-tally fraction (e.g. `13/20 files checked`) or historical mention (e.g. quoting previous `12/12` tally) satisfies the oracle requirement.
- **Strongest Evidence:**
  - `ExecC1Attacks.md:102` fixture 15 (case g′): a paragraph citing true line `:7` containing only `13/20 files` clears a gate finding requiring oracle 13 (`exit 0`, `counted=[]`).

#### Item C1.4 — Working-Tree Porcelain Coupling in `m3-unlanded-paths`
- **Repeating Seats:** `ExecC1Baseline` (w1), `ExecC1Tip` (w1), `ScribeLOG27` (w1), `ExecFinalTipMeasure` (w2), `ExecC1Recount` (w2), `ExecSeparation` (w2).
- **Finding:** `m3Findings` (`check-selfassessment.mjs:379-389`) executes `git status --porcelain --untracked-files=all` on the live working tree, ignoring `--rev <REV>`. During active waves, untracked files force `mismatches=1` (or more), making `mismatches=0` unreachable on a working tree.
- **Strongest Evidence:**
  - `ExecFinalTipMeasure.md:11` measures `mismatches=1` with `m3.observed=2` at the tip; clean clone measures `mismatches=0` (`CritClaimHonesty.md:21`).

#### Item C1.5 — Unverified Author Testimony vs. Re-measurement Verification
- **Repeating Seats:** `CritCorrectionGaming` (w2), `ExecC1Attacks` (w1), `RevC1FrozenFit` (w1).
- **Finding:** The gate checks that the stated number matches the current gate oracle, but requires no command invocation receipt, run timestamp, or commit SHA. An author can clear a finding by copying the gate's current output without executing or verifying the gate.
- **Strongest Evidence:**
  - `CritCorrectionGaming.md:9-15`: Code inspection of `check-selfassessment.mjs:309-327` shows absence of run-receipt checks; gate cannot distinguish independently measured runs from formulaic text matching current gate state.

---

### Group 2: Claim C2 (Depth) & `scripts/check-s106-evidence.mjs` / `s106.json`

#### Item C2.1 — Undisclosed Post-Freeze Repair of Receipt-Absent Kill Rule
- **Repeating Seats:** `RevC2Gate` (w1), `ExecC2Reopen` (w1), `MutC2Gate` (w1), `ScribeLesson27` (w1), `CritMistakeQuality` (w2), `CritNovelty` (w2).
- **Finding:** At initial landing `5577d1b`, receipt-absent returned `{valid: false}` (exit 1), violating the frozen kill rule ("could-not-evaluate exit 2, never valid"). Commit `5198e28` repaired it to `throw new Refusal` (exit 2) and added case 5; commit `5ed6484` added `--allow-empty` to make fixture commits runnable. Neither repair was recorded in `.ufo/waves/round-27/claims.json.revisions[]`.
- **Strongest Evidence:**
  - `git diff 5577d1b 5198e28 -- scripts/check-s106-evidence.mjs:111` and `claims.json` line 72 (sole entry is C3's `controlArmFalsified`).

#### Item C2.2 — Undisclosed Dropping of Fetch-Failure and Measurement-Binding Kill-Rule Clauses
- **Repeating Seats:** `RevC2Gate` (w1), `ExecC2Reopen` (w1), `CritMistakeQuality` (w2), `CritNovelty` (w2).
- **Finding:** Round 27 `claims.json` C2 `killRule` deleted two normative sentences present in round 26: the fetch-failure honest-block and "the receipt's recorded revision must equal the report's cited measurement revision". The receipt schema lacks a `revision` field, leaving the binding mechanical check unenforced.
- **Strongest Evidence:**
  - Direct diff between `.ufo/waves/round-26/claims.json:45` and `.ufo/waves/round-27/claims.json:45` (`CritMistakeQuality.md:117-120`).

#### Item C2.3 — Anchor Content Unpinned to Declared Feature Marker
- **Repeating Seats:** `RevC2Gate` (w1), `ExecFreshAttack2` (w2).
- **Finding:** `check-s106-evidence.mjs:123-125` tests only that `lines[receipt.anchor.line - 1].trim() === receipt.anchor.text.trim()`. It never verifies that `receipt.anchor.text` contains the frozen anchor text `BASE_FEATURE(kBackForwardCache` or `FEATURE_ENABLED_BY_DEFAULT`.
- **Strongest Evidence:**
  - `RevC2Gate.md:37` (M1) and `ExecFreshAttack2.md:58-68`: A receipt pointing to an arbitrary line containing arbitrary text passes `valid=true` provided receipt and blob agree; trim equality also masks leading/trailing whitespace differences.

#### Item C2.4 — Missing Committed Tip-Revision Measurement Receipt (`measure-c2`)
- **Repeating Seats:** `ExecC2Reopen` (w1), `RevC2Gate` (w1), `CritNovelty` (w2), `ExecFinalTipMeasure` (w2).
- **Finding:** The committed measurement receipt `.ufo/waves/round-27/measure-c2-5577d1b.json` was taken at commit `5577d1b` before the gate repair. No committed tip receipt exists, though wave 2 runs (`ExecFinalTipMeasure`, `ExecC2Recount`) have verified `valid=true` (exit 0) at tip `bceb17d`.
- **Strongest Evidence:**
  - `ExecFinalTipMeasure.md:12` re-measures tip `bceb17d` -> `valid=true`, all 4 conjuncts true.

---

### Group 3: Claim C3 (Coverage) & `redirect-and-retry-after-semantics.md` / `SOURCES.md` / `round-27.md`

#### Item C3.1 — Junk-Blind Counting Command for Assimilated Entries
- **Repeating Seats:** `CritC3Junk` (w1), `ScribeLOG27` (w1), `ScribeLesson27` (w1), `ScoutJunkCount` (w2), `CritNovelty` (w2).
- **Finding:** The C3 counting command `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l` counts any file containing the source header, regardless of whether it contains located quotes, normative statements, or valid markdown.
- **Strongest Evidence:**
  - `CritC3Junk.md:75-84` and `CritNovelty.md:55`: A 149-byte dummy file containing `source: S107 (filler, no quote)` increments the counter to 1 and passes `check-sources.mjs` cleanly (exit 0). Protection rests entirely on the QUALITY review seat.

#### Item C3.2 — Falsified Novelty Assertion in Tip Entry `ground:` Line (Resolved at `bceb17d`)
- **Repeating Seats:** `CritAssimProcess` (w1), `CritC3Junk` (w1), `ScoutReverifyRfc` (w1), `CritEntryIndependence` (w2), `CritNovelty` (w2).
- **Finding:** The committed entry at `6ca3b89` stated: "the redirect rules the lane's driver has never asserted", which was contradicted by the lane's prior measurements (`external-class-fixture-v2.md` lines 486–488 measuring loopback 303→GET and 307 POST preservation).
- **Strongest Evidence:**
  - The working-tree correction ("documented-upstream redirect semantics — extends existing loopback 303/307 observations") was integrated into HEAD at `bceb17d` (`CritEntryIndependence.md:5-7`, `CritNovelty.md:52`).

#### Item C3.3 — Quote-Fidelity Normalization Requirement for RFC 9110 Notes
- **Repeating Seats:** `ExecQualityGate` (w1), `CritC3Junk` (w1), `ScoutReverifyRfc` (w1).
- **Finding:** The frozen kill rule requires that any quote the admitted entry rests on must be present in fresh bytes. Under a byte-exact substring search, the 301/302 note quote fails because RFC 9110 formats notes inside ASCII tables (`| *Note:* ... |`). It matches only after whitespace normalization and table-marker stripping.
- **Strongest Evidence:**
  - RFC 9110 lines 7384–7387 (`ExecQualityGate.md:89-98`). Normalization must be explicitly specified in kill rules to prevent false-kill assertions.

#### Item C3.4 — M1 Misclassified in `corpus/lessons/round-27.md` as Lane Mistake
- **Repeating Seats:** `CritMistakeQuality` (w2), `RevStagedProvenance` (w1), `ScoutStagedGround` (w1).
- **Finding:** `corpus/lessons/round-27.md` §Mistakes lists M1 (combining 307 and 308 into a normative MUST-NOT) as the lane's own mistake. In reality, this over-assertion originated in the campaign package (`MERGE-REPORT.md` and staged `redirect-and-retry-after-semantics.md`), and the lane's re-grounding kill rule successfully caught it.
- **Strongest Evidence:**
  - `CritMistakeQuality.md:15-36`: No committed lane entry ever carried the combined normative claim; it was caught during re-grounding. M1 belongs in §Gate as a successful gate catch, not in §Mistakes.

#### Item C3.5 — M2 Mirror Fix Not "Shown Able to Fail" against Malformed Pasted Lines
- **Repeating Seats:** `CritMistakeQuality` (w2), `ScribeLesson27` (w1), `CritAssimProcess` (w1).
- **Finding:** Lesson M2 claims the grep-prefixed paste artifact fix was "shown able to fail". Reproduction shows `sources-census.sh` scans only lines matching `^ {0,3}\|`, so a `29:| S124 | ...` line is silently ignored and exits 0 cleanly without triggering E12.
- **Strongest Evidence:**
  - `CritMistakeQuality.md:49-60`: Mirror with `29:| S124 | ...` exits 0 with `file ok`. The harness does not catch the bad input; it is procedural discipline, not a mechanical guard.

---

### Group 4: Cross-Cutting Governance & Process Integrity

#### Item G.1 — Post-Data Kill-Rule Mutation in `claims.json`
- **Repeating Seats:** `CritMistakeQuality` (w2), `RevC2Gate` (w1), `CritC1Supersession` (w1), `ScribeClaimRecordAudit` (w2).
- **Finding:** Across all three claims in `.ufo/waves/round-27/claims.json`, the normative text of `killRule` and `control` was edited post-data to replace prescriptive rules with descriptive post-data observations (e.g. C1 killRule rewritten from "fix before data, never narrow the target" to "measured 5, not 0"), despite headers asserting "predicate, counter, kill rule and target unchanged".
- **Strongest Evidence:**
  - Field-by-field diff between `.ufo/waves/round-26/claims.json` and `.ufo/waves/round-27/claims.json` (`CritMistakeQuality.md:105-128`).

---

## 3. The Non-Obvious Move: Candidate QUALITY Criterion 69

### The Bounded Proposal: "Atomic Units & Bound Syntactic Witnesses"

A compatible synthesis across the round's proposals (`RevFrozenFit`, `CritCorrectionGaming`, `CritC1Supersession`, `RevC2Gate`, `CritC3Junk`, and `CritMistakeQuality`) reveals that the root failure mode across all three claims is **Unbound Syntactic Witnesses**:
- In **C1**: `/:\\d+/` anywhere in a 22-line paragraph acts as a witness for line citation without checking line equality; bare `N/M` acts as an oracle tally witness without tally context.
- In **C2**: `lines[line-1].trim() === text.trim()` acts as an anchor witness without checking the anchor's substantive feature string (`BASE_FEATURE`).
- In **C3**: `^source: S107 ` anywhere in a markdown file acts as an entry coverage witness without checking for located quotes.

### Proposed Move

L1 integrates **Candidate QUALITY Criterion 69** into `corpus/QUALITY.md` (and establishes it as the pre-registration standard for round 28):

```markdown
69. Bound Syntactic Witnesses and Atomic Disposition Units.
    Verification gates, counter extensions, and correction mechanisms must bind
    syntactic witnesses to semantic targets and evaluate at atomic unit granularity:
    (a) In LOG/SCORECARD tally corrections, the evaluation unit is the single Markdown
        list item (/^[-*]\s+/), not the blank-line paragraph; the citation check must
        require numerical equality (/:(?<line>\d+)/ with parseInt(line) === target.line);
        and the oracle number check must match only declared tally shapes (--self-test,
        cases=N, cases: N), rejecting bare fractions.
    (b) Evidence-anchor verification gates must assert that the recorded anchor text
        matches declared immutable tokens (e.g. feature names or interface symbols),
        preventing arbitrary-text pass-through.
    (c) Assimilation counting commands must assert at least one normalized, located quote
        witness within the cited file, preventing empty filler entries from advancing coverage.
    (lesson: corpus/lessons/round-27.md#m1, #m3; routed round-27 C1/C2/C3 falsification;
    instrument: scripts/check-selfassessment.mjs list-item parser; check-s106-evidence.mjs
    content pin)
```

Simultaneously, for round 27 closeout:
1. **Admit C1 as FAILED** (already documented in `LOG.md:1933` and `SCORECARD.md:1396`); do not repair the counter code post-data in round 27.
2. **Admit C2 as MET** (exit 0 at tip `bceb17d`, selftest 5/5).
3. **Admit C3 as MET** (entry grounded, S107 row 106→107, census exit 0).
4. **Append a `claims.json.revisions` entry** disclosing C1's paragraph-unit deviation and C2's post-freeze exit-2 repair, preserving preregistration integrity.

### Trace of Second-Order Effects across Surfaces

1. **Runtime / Substrate Surface:**
   - Replacing `paragraphs()` with a Markdown list-item parser (`/^[-*]\s+/`) isolates the 5 round-27 correction bullets into independent blocks. Bullet 1 (`:335`) can no longer clear bullet 2 (`:391`), and historical blocks like 265–447 can never clear `LOG.md:221` because they lack `:221`.
2. **Contract / Pre-registration Surface:**
   - Prevents the recurrence of `kumitate` r42 drift: by documenting the deviation in `revisions[]` rather than retrofitting the code post-data, round 27 maintains honest scientific ledger discipline.
3. **Verification Surface:**
   - Closes the ambient-fraction loophole in `statedTallyNumbers()` and prevents false clean verdicts produced by unrelated text (such as `13/20 files`).

### Affected Axes

- **Calibration (Improved):** Eliminates false-clear artifacts on historical LOG tallies (specifically `LOG.md:221`), binds citations to exact line equality, and prevents unverified author testimony from bypassing oracle checks.
- **Operability (Improved):** Converts paragraph-chunking from unpredictable blank-line spacing into deterministic Markdown list-item parsing.
- **Depth & Freshness (Harm None):** Leaves the landed C2 S106 evidence and C3 RFC 9110 re-grounded entry intact.

### Risks and Failure Modes

- **Risk 1:** A future legitimate correction bullet that wraps across multiple list sub-bullets might be split prematurely if not grouped under the parent item.
  - *Mitigation:* Define the item parser to group indented lines (`^\s+`) with their parent bullet item.
- **Risk 2:** Requiring quote locators in coverage counting commands could slow down `git grep` execution in large repositories.
  - *Mitigation:* Keep the fast `git grep` as an initial filter, with secondary inspection in the gate script (`check-sources.mjs`).

### Verification Plan

1. **Unit Test for List-Item Parsing:** Execute scratch harness verifying that 5 adjacent bullets with 0 blank lines parse into 5 discrete correction items.
2. **Citation Equality Test:** Verify that a correction citing `LOG.md:999` fails to clear a finding at `LOG.md:6` (`exit 1`).
3. **Live Re-run against Tip:** Run `node scripts/check-selfassessment.mjs --rev bceb17d --json` under the hardened rule; verify that `LOG.md:221` correctly re-emerges as a counted finding (observed 12 vs claimed 8), corroborating C1's failure.
4. **Gate Registry & Report Contract:** Re-run `node scripts/report-contract.mjs` to ensure the final report structure complies with the 6-section contract and SHONEN box count.
