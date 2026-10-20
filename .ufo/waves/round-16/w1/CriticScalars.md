# CriticScalars — tabi round 16, w1 (critic, leaf), 2026-10-20

Seat `TabiR16.CriticScalars-5`. Writes only this file. I read files only. I ran no gates, selftests, counters or browsers. I installed or updated nothing.
Labels: [OBS] means I read it this session. [INF] means it is my inference.
Baseline is `e38d259` (clean). Untracked at review: `.ufo/waves/round-16/`, `corpus/evidence/round-16/` (from `git status --short`).

## Verdict

- **coverage 9→10: REJECT.** This is premature saturation. The lane's own frontier map, the PROVINCE denominator, and the exact structural precedent (round 13) all contradict a 10. The judge has to reject it. Rewording does not fix it.
- **operability 8→9: NOT SUPPORTED this round.** It is a weaker case and it could be fixed in a later round. A counter-precedent exists (kaika 7→8 for a new gate and selftest). But the operability signal is still contradicted by a red production gate the lane owns. No re-derivable operability denominator exists either.
- **Recommendation:** all scalar deltas stay 0. The declared counts (C1 0→1, C2 0→1) and the capability row are the claims. Flat scalars with improved verdicts stay consistent with r12–r15.

## 1. coverage 9→10

### Arguments for
- P1 [OBS] The AXES signal is "PROVINCE.md lists every surface; none unexplored **without reason**" (`/home/vgpnk/Projects/shokunin/AXES.md:12`). Suppose C2 lands both WebMCP rows (`corpus/README.md:181,194`). Every remaining open row then has a recorded reason:
  - Real-site rate/ToS and journeys are blocked by rule: "untested by rule" (`corpus/README.md:183`), and operator approval is absent (`corpus/README.md:39-41`).
  - The extension↔daemon handshake has been explored but was never observed up: "four `/status` samples", and `/command` is "unprobed by rule" (`corpus/README.md:180`).
- P2 [OBS] C2 is runtime evidence, not documentation. The plan has a negative control plus positive, imperative, removal, navigation and malformed cases (`PLAN.md:85-87`), and it adds a capability row. The r12 objection was "one documentation-only entry" (`.ufo/waves/round-12/w1/ClaimAttack.txt:83`). That objection does not apply word for word.
- P3 [INF] Coverage was 9 in r12, r13 and r15 even though the lane added new ground each time. A scalar that new runtime-held ground never moves cannot register expansion.

### Arguments against (stronger)
- A1 **Exact precedent** [OBS]. Round 13's C2 was "coverage + capability": a real isolated loopback demonstration of previously unheld ground plus a capability row. It stayed at **9→9** (`SCORECARD.md:537,546`; `corpus/lessons/round-13.md:3,16`, which rejected "unsupported scalar increases"). The non-author closure confirmed "all six ordinal scalars remain unchanged" (`corpus/lessons/round-13-verifier-spotcheck.md:135`). Round-16 C2 has the same shape: a loopback runtime demonstration plus a capability, on frontier ground. Giving it 10 would treat like cases differently.
- A2 **The r12 ruling** [OBS]. The 9→10 move was proposed and then withdrawn after critics found "premature saturation" (`SCORECARD.md:466-469`; `.ufo/waves/round-12/w1/ClaimAttack.txt:72-87`; `.ufo/waves/round-12/w1/CoverageAttack.txt:5-15`). The outside closure recorded "No … scalar increase is admitted" and "scalar stays9" (`corpus/lessons/round-12-verifier-spotcheck.md:12,132`).
- A3 **The frontier denominator, re-derived** [OBS, statuses from `corpus/README.md:180-194,215,242,283-285`]. There are 9 non-superseded frontier rows:
  - open 5: handshake, native WebMCP, rate/ToS, real-site journeys, WebMCP spec
  - docs-held 3: Chrome≥136 profile boundary, BiDi, flake receipts
  - runtime-held 1: ARIA, round 13

  [INF] Best case after C2: open 3, docs-held 3–4, held 2. That is a held fraction of 2/9 and a held-plus-docs fraction of at most 6/9. No reading gives 10/10.
- A4 **The PROVINCE denominator** [OBS]. `PROVINCE.md:6-13` lists seven owned surfaces. Two of them have no real-surface record: "site-specific gotchas" and "rate/rights discipline" (:10-11). The scorecard's ceiling already says "rate/rights/site-gotcha records still unmeasured" (`SCORECARD.md:96`). WebMCP is not a separately listed PROVINCE surface. It is a CDP domain, so it falls under "CDP session discipline" (:9), which is already governed. [INF] Under the PROVINCE denominator, C2 adds a new edge class but does not raise the numerator.
- A5 **The reason clause is not met as written** [OBS]. P1 depends on "PROVINCE.md lists every surface". PROVINCE.md has no Core/Frontier/Adjacent split (`LEARNING.md:75-77` requires it). It does not mention WebMCP, BiDi or Playwright. The "lists every surface" half of the signal fails before the "with reason" half can be applied.
- A6 **Ceiling effects** [OBS]. 10 is the top of the 0–10 range (`AXES.md:79`). Reaching it makes the axis eligible for retire or split on saturation (`AXES.md:37-38`). After that, future WebMCP, handshake or real-site expansion could never register on the axis. Under the count convention the next entry would need an 11 (`CoverageAttack.txt:18`).
- A7 **The current 9 is already a count** [OBS]. It was admitted "as a note/row count, not the AXES fraction" (`corpus/lessons/round-1-verifier-spotcheck.md:17`). Adding more count increments does not make it a fraction.
- A8 **Scope of the C2 evidence** [OBS]. The PLAN limits are: flag-gated, Chromium 154.0.8037.97 only, `document.modelContext` rather than `navigator.modelContext`, "loopback only, no real site, no agent integration claim" (`PLAN.md:17-24,93`). A capability bounded to one build and five flags is narrow ground. It is not saturation.

### Evidence threshold for coverage 10 (none of it is met at `e38d259`)
All of the following are required:
1. PROVINCE.md publishes a re-derivable denominator: Core/Frontier/Adjacent per `LEARNING.md:75`, listing WebMCP, BiDi and Playwright explicitly.
2. A committed count shows numerator = denominator − (surfaces each carrying a recorded refusal reason with an authority pointer). Before and after are both measured at a pinned revision.
3. Every Core surface has at least one **runtime-held** note. This includes site-specific gotchas and rate/rights. Under the loopback-only rule (`corpus/README.md:39-41`) that requires operator approval, so it is out of reach for this round.
4. A **non-author** ruling, recorded in a verifier lesson, that rule-blocked ground counts as "unexplored with reason" for scoring. That ruling must explicitly supersede the r12 and r13 rulings.

The honest alternative if the lane wants scale headroom is a split (`AXES.md:37-38`) into loopback coverage and real-site coverage. A split needs its own SCORECARD reason line. It must not be smuggled in through a 10.

## 2. operability 8→9

### Arguments for
- P1 **Precedent** [OBS]. The only admitted operability scalar move had the same shape as C1: a new hermetic gate plus selftest gave operability "score 7→8" (`corpus/lessons/round-1-verifier-spotcheck.md:17`; `SCORECARD.md:410`). C1 is also a new gate with a selftest of at least 12 cases, every reason exercised, and a positive control for each (`PLAN.md:68-77`).
- P2 **Accumulation** [OBS]. Operability verdicts were "improved" in r13, r14 and r15, all at 8→8 (`SCORECARD.md:538,603,673`). Round 16 would be the fourth. [INF] A scalar frozen through four verified improvements is a calibration smell. The protocol says "a score no reader can re-derive is an opinion" (`AXES.md:53-55`), and a score that never moves is not re-derivable either.
- P3 [OBS] C1 closes outside-routed defects 1 and 2 (`PLAN.md:10-13`; `corpus/lessons/round-15-verifier-spotcheck.md:44`). The defects come from outside, so the work is not self-chosen.

### Arguments against (stronger this round)
- A1 **The kaika move removed a named ceiling; this one does not** [OBS]. The prior operability ceiling was literally "no repo-local gate scripts (`ls corpus/*.sh scripts/` → none)" (`SCORECARD.md:97`). Kaika went 0→1 gates. `ls scripts` now shows 6 `check-*` gates plus 5 helpers (observed). [INF] A seventh gate adds to a count. It does not cross a new rung.
- A2 **The signal is contradicted by a red gate the lane owns** [OBS]. The operability signal is "A checklist item can be run and produces the stated outcome" (`AXES.md:13`). USER production is still "failed6/10 exit1" (`SCORECARD.md:698`; `corpus/lessons/round-15-verifier-spotcheck.md:54`, "Found 6 user rounds, expected 10"). It has been listed as inherited debt for consecutive rounds (`round-15-verifier-spotcheck.md:124`). The frozen closure-checker certification is "still absent" (`:40,:123`).
- A3 **Meta-tooling, not domain operability** [INF, from `PLAN.md:31,34-77`]. The binding gate checks that the lane's own measurements are bound to identities. That improves calibration-adjacent hygiene. It adds no runnable browser or web-interaction artifact. The r15 critics already scoped C1-type work as "precision of held contracts" (`SCORECARD.md:671`).
- A4 **It exposes a prior weakness** [OBS, `PLAN.md:64-67`]. `--legacy` is expected to exit 1 on the real round-15 file. That shows the r15 C1 count was not identity-bound. [INF] Crediting a scalar for discovering that an earlier scalar-adjacent claim was unbound counts the same ground twice.
- A5 **Partial self-application** [OBS]. The PLAN manifest example binds only `C1` (`PLAN.md:42-50`). The draft claims a digest "for each claim" (`drafts/DraftScorecard.md:21`). [INF] Suppose `measurement-binding.json` does not include C2, with its `countedInputs` and digest, and pass `--check --reproduce` at **delivered** HEAD. Then the gate covers 1 of 2 round claims and repeats r15 defect 2 (measured revision ≠ delivered HEAD) for C2.
- A6 **Plan bar** [OBS]. "Scalars stay unless a counted move justifies them" (`PLAN.md:32`). No operability denominator exists to show the move.
- A7 **Author-side only** [OBS]. Under `AXES.md:47-49`, every r16 seat is the lane. The r15 closure evidence-verified gates but did not execute them (`round-15-verifier-spotcheck.md:9`). A scalar move with no non-author re-execution has weaker footing than kaika's, which was admitted by an outside reviewer after post-review fixes.

### Evidence threshold for operability 9
All of the following are required:
1. A re-derivable denominator, for example the lane's production gate set {ROUND, USER, FRESHNESS, SOURCES, ARIA-METADATA, MEASUREMENT_BINDING, closure checker}. Commit the clean-at-delivered-HEAD fraction before and after.
2. No production gate red. USER 6/10 must be resolved honestly, without relaxing the expected count of 10 (`SCORECARD.md:726-727`). Alternatively, a non-author must rule it out of scope for operability.
3. `check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at <delivered HEAD> --reproduce` exits 0 with **every** round claim bound (C1 and C2).
4. A non-author executes the gate and selftest (not only evidence-verifies them) and records agreement.

Alternative route: an operator or protocol ruling that N consecutive verified same-axis improvements step the scalar. No such rule exists in `AXES.md:25-38` or `LEARNING.md:26-38`. The lane must not invent one.

## 3. Smallest safe correction for L1

- In the SCORECARD round-16 block, replace `8→PENDING` and `9→PENDING` (`drafts/DraftScorecard.md:9-14`) with fixed `9→9` and `8→8` plus verdict text. Add one sentence: "no scalar move; coverage 10 is withheld: frontier open 5→≤3 of 9, held 1→≤2; PROVINCE rate/rights and site-gotchas still unrecorded; precedent round 13 (`SCORECARD.md:537,546`)."
- Record the operability threshold in Planned (§2 items 1–4). The move then becomes a falsifiable target for later rounds, not an unspoken freeze.
- Make sure `measurement-binding.json` binds C2 as well as C1 (A5). If it does not, write "C2 unbound" explicitly.
- Saturation note [OBS `drafts/DraftScorecard.md:37`; `AXES.md:66-73`]: all axes are at least 8, and r14–r16 brought no new capability. If `webmcp-cdp-observation` does not enter, the nudge window is exhausted and round 17 is a frontier/capability round. If it does enter, the window restarts. Either way the scalar stays as it is.

## Impacted axes
- **coverage**: a 10 asserts saturation, which A3, A4 and A5 contradict.
- **calibration**: a scalar claiming more than its measure (`AXES.md:15,53-55`).
- **operability**: a scalar step without a denominator while a red gate stands.

None of depth, freshness or adjacency is harmed by keeping the deltas at 0.

**Tradeoff vs defect.** Coverage 10 is a tradeoff that the canonical judge must reject. Operability 9 is a fixable defect: it lacks the threshold evidence in §2, which a later round can supply.
