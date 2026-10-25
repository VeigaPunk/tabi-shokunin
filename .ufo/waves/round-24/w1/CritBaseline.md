# CritBaseline — attack on the round-24 before-arms (C1/C2)

Seat: L1Tabi24.CritBaseline · date 2026-10-25 · lane root /home/vgpnk/Projects/shokunin/tabi-shokunin
Claims read first: `.ufo/waves/round-24/claims.json` (authoritative). Baseline rev `573c99e4885382db38babc3a6fc90e77afeb42a6` (= `HEAD`, `origin/master`). No installs performed; no tracked file edited; only the scratch fixture copies under `.ufo/waves/round-24/scratch/L1Tabi24.CritBaseline/`.

## 0. Accepted facts (read-only measurements)

| # | Observation | Command (exact) |
|---|---|---|
| F1 | `scripts/` at baseline has **neither** `check-gate-registry.mjs` **nor** `check-selfassessment.mjs` (21 scripts; all listed) | `git ls-tree -r --name-only 573c99e… -- scripts/` |
| F2 | Neither path ever existed in any commit | `git log --all --format='%H %s' -- scripts/check-gate-registry.mjs scripts/check-selfassessment.mjs` → empty |
| F3 | Routed defect 1 present at baseline: `round-evidence-audit` appears on **0** lines of `SKILL.md` | `git grep -c 'round-evidence-audit' 573c99e… -- SKILL.md` → exit 1, no hits |
| F4 | `12/12` lines in `SCORECARD.md` at baseline: **4** (77, 79, 1139, 1151). Only 1139 and 1151 are `--selftest` tallies of `scripts/round-evidence-audit.mjs`; 77/79 are historical round-4/6 pin statements. `SHONEN.md`: **0**. A third stale phrase "12-case in-memory matrix" sits at 1138 | `git grep -n '12/12' 573c99e… -- SCORECARD.md SHONEN.md`; `git show 573c99e…:SHONEN.md` |
| F5 | The round-23 report (`.ufo/reports/round-23/tabi.md`) — the verifier's third stale-figure location — is **absent from baseline bytes**; only `.ufo/reports/fleet-round-1-attempt-20261015/tabi.md` exists | `git ls-tree -r --name-only 573c99e… -- .ufo/reports/` |
| F6 | The shipped gate has **13** selftest cases at baseline | verifier lesson, `round-23-verifier-spotcheck.md` §2 (`grep -c 'runFixtureCase('` − 1 = 13); LOG.md:1730 agrees |
| F7 | C2's m2 candidate receipt is **consistent** at baseline: `before.exit: 128` matches the command it names (`git cat-file -e …` → 128) | `git show 573c99e…:corpus/evidence/round-23/c1-measurements.json`; `git show c90dffd…:…` identical |
| F8 | Current worktree: 2 modified tracked (`.ufo/waves/round-23/w2/W2LandedCites.md`, `W2Simplifier.md`) + 88 untracked (round-24 wave scaffolding, sibling scratch, numeric-named root dirs, `scripts/check-gate-registry.mjs` draft) — count today is **90**, not 89 | `git status --porcelain`; `wc -l` |
| F9 | Registry rows already exist in baseline `SKILL.md` for: freshness (`closeout-pin-witness`), sources (`sources-census`), claim-record (`claim-record-discipline`), round-contract, user-round-contract, aria-metadata, measurement-binding, and adjacency (round-17 "Registry — round 17"). Table shapes differ (6-col, 5-col, 4-col, 8-col); **no row exists for `round-evidence-audit`** | `SKILL.md` §1555/§1610/§1653/§1665/§1751/§1836/§1933 (read from baseline bytes) |

## 1. C1 — before-arm over committed bytes with an instrument absent at the revision

**Question:** is a baseline count produced by an instrument that did not exist at baseline legitimate or self-serving?

**Verdict: legitimate only if the instrument is a pure, pinned function of the committed bytes AND its defining predicates are anchored to pre-existing authority; presently the before-arm is unwitnessed (no run exists) and the number is definition-dependent — so the claim is not yet falsifiable at the baseline.**

### 1.1 Strongest objection
The "before" is not an observation; it is a prediction of the instrument's own definitions. The gate is authored by the same lane that owns both the defect and the fix, after the defect is known. Its boundary conditions — what counts as a gate (regex `check-*.mjs|*audit*.mjs`), what counts as a complete row (eight fields), how differently-shaped existing rows parse — are all choices made this round. Determinism over immutable bytes removes **repeatability** doubt but not **calibration** doubt: a reproducible ruler can still be tuned so baseline yields N>0 and tip yields 0 regardless of the actual routed defect. Evidence of the degrees of freedom:
- With row-presence as the only predicate, baseline N = 1 (`round-evidence-audit` is the only convention-matched gate with no row, F9).
- With a strict eight-field parse, N jumps: existing rows use 4–8-column tables (measurement-binding §1836 is 5-col; adjacency's round-17 row is 4-col), so several rows would emit `e2-field-incomplete`. Same bytes, very different N. The frozen claim's "N" is not a number the bytes determine alone.

### 1.2 Why it can still be legitimate
Committed bytes are immutable; the counting command (`--rev <40-hex>`) is deterministic; the routed defect is objectively in the baseline bytes (F3, `grep`→0). A retrospective audit of a frozen state with a fixed instrument is a normal audit — the defect is not the retrospectivity, it is the **timing and authorship of the calibration** plus the absence of any recorded run.

### 1.3 Minimal evidence that would defeat the objection
1. **Same-instrument baseline run** (recorded before any tree change this round): `node scripts/check-gate-registry.mjs --rev 573c99e… --json` → `nonconformant >= 1`, findings include `e1-missing-row` for `round-evidence-audit`, exit 1; raw JSON saved to `corpus/evidence/round-24/c1-measurements.json` alongside the instrument's commit digest.
2. **Baseline-blob mutation differential** (in the scratch fixture repo; never touching the lane): copy baseline `SKILL.md`; (a) append the complete eight-field row for `round-evidence-audit` → `nonconformant` drops by exactly 1; (b) drop one field from that row → `e2-field-incomplete` replaces the finding; (c) remove the row → back to `e1`; (d) revert → original count. Red/green per field is thereby shown on the *baseline* blob, not only on synthetic fixtures.
3. **Gate-set anchoring:** the derived gate set must equal the set from a pre-existing normative enumeration (PROTOCOL §Gate naming), not solely the new regex — otherwise the denominator (and N) is author-chosen.
4. **Stability:** run 1 twice; identical JSON (byte-equal output).

## 2. C2 — same test applied to the committed-byte classes (m1, m2)

### 2.1 m1 (stale tallies) — same post-hoc-instrument objection, plus a byte-level ambiguity
Same objection as §1.1. Additionally, the frozen "three stale `--selftest` 12/12 figures" is **not a byte-determined count**:
- `SCORECARD.md` holds exactly two literal `12/12` figures tied to the round-evidence-audit gate (1139, 1151; F4) and one more stale phrase "12-case in-memory matrix" (1138) — three stale statements total **if** "12-case matrix" counts as a tally cell.
- `SHONEN.md` has none; the verifier's third *literal* `12/12` location was the round-23 report, which is **not in the baseline tree** (F5).
So the same baseline bytes yield m1 = 2 (literal `12/12` only), 3 (including 1138's "12-case"), or a different count if the report path is included from memory. The before value (3) is only reproducible once the cell predicate is fixed; the frozen control sentence ("greps SCORECARD.md for '12/12'… prints 0 mismatches must fail") is also loose — that grep finds 4 lines, of which 2 are historical and non-stale.

**Minimal defeating evidence:** same-instrument run at baseline → `mismatches = 4` exactly, with per-finding `{class, doc, line, claimed, observed}`; plus mutants: restore-stale-figure fixture → m1 fires; clean fixture → no m1; and a written decision on whether "12-case matrix" is a tally cell (the control arm is then consistent).

### 2.2 m2 (receipt exit contradicts re-run) — null at baseline, per the bytes
F7: the only candidate receipt (`c1-measurements.json`) already reads `before.exit: 128`, matching its command. The routed defect 5 wording ("`before.exit` is 1") describes a state that is **not present at the baseline revision** — it was corrected by the time of `dfae5cd`/`03c1b4d` (receipt history). Consequences:
- m2 is a **null class at baseline**; the claim's before = 4 (3 m1 + 1 m3) already excludes it, which is consistent with the kill rule (null classes disclosed, not counted).
- Re-derivation must reproduce the receipt's fields (the claim already says so). No defeating evidence beyond the baseline run + one receipt mutant is needed for this class.

## 3. C2 m3 — the before is a working-tree property, not committed bytes

**Question:** does the same-instrument test apply? **No.** m3's object (`git status --porcelain` → 89 at round-23 closure, F8) is an event, not bytes. It cannot be re-derived from `573c99e` — a commit's tree is clean by construction — and re-running today yields a different set (2 M + 88 ??, including this wave's own scaffolding). A same-instrument baseline run cannot observe the object; the 89 is unrepeatable.

**Strongest objection:** the before value is an anecdote unless (a) a contemporaneous record exists, and (b) the counter's scope is defined so the count is meaningful. Both are resolvable:
- The record **exists**: the non-author verifier's transcript (`corpus/lessons/round-23-verifier-spotcheck.md` §1, line 20) — `git -C tabi-shokunin status --porcelain | wc -l` → **89** (2 `M`, 87 `??`), with the two modified files named. That is the admissible evidence; it is observational, not derivable.
- Sensitivity is trivially demonstrable on the **live** tree (create/remove one scratch file → ±1), but the counter's semantics must decide what counts as "unlanded": without an exclusion policy for coordinator scaffolding (`.ufo/waves/round-24/**`, `scratch/`, dispatch jsons, my own report file), the counter cannot reach 0 at tip while the wave runs, and the "before 89" numeral shifts with every wave. State the scope explicitly (e.g., ignore `.ufo/waves/**`, `.gitignore`d runtime, and known driver dirs) and record the exclusion in the counter.

**Minimal defeating evidence:** (1) cite the verifier transcript (file:line) as the before observation; (2) a live differential run on today's tree showing the count moves with one added/removed path and hits 0 on a clean scope; (3) the explicit scope/exclusion list, so "4 → 0" is a well-defined transition rather than a number that depends on who is executing.

## 4. Summary

| Arm | Object | Same-instrument baseline run possible? | Verdict | Required to defeat the objection |
|---|---|---|---|---|
| C1 N@baseline | committed bytes | yes (after gate ships) | legitimate **only if** run + mutants + anchored gate set; currently unwitnessed | §1.3 E1–E4 |
| C2 m1 3 stale figures | committed bytes | yes | same; before-count needs cell-level predicate (2 vs 3) | §2.1 (baseline run + mutants + cell decision) |
| C2 m2 receipt exit | committed bytes | yes | null at baseline (F7); defect-5 text describes pre-baseline state | §2.2 (baseline run; one receipt mutant) |
| C2 m3 89 paths | working-tree event | **no** | observational; the 89 is unrepeatable; the counter must define scope | §3 (transcript citation + live differential + exclusion list) |

**Smallest safe correction:** before any round edit, (1) run both gates at `573c99e…` with `--json`, save raw outputs (instrument commit digest included) to `corpus/evidence/round-24/`; (2) commit the gate-set derivation and the m1 cell predicate to PROTOCOL/registry text so N and the "three figures" are byte-anchored; (3) record the m3 exclusion scope in the counter; (4) add the baseline-blob mutants (add field / drop field / remove row) to `--selftest` — the claim's kill rule already demands them, and that is the check that turns the before-arm from self-serving into audited.
