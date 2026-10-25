# CriticClaim (w2b) — is round22 C1 genuine operability, and is "lowest non-retired tie8" true?

Seat: TabiR22-2.CriticClaim-16 (critic, static, author-side falsification; not admission).
Revision reviewed: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (all lane cites below are `git show e3cf4e0:PATH`, line numbers at that revision). Fleet `AXES.md` read at the fleet working tree (last touching commit `84bade03e64323ebe6edc13492ff1f9704394021`).

## Verdict

1. **Axis move: genuine operability, not relabeled depth, but scoped as a frozen-acquisition regression lock.** The oracle adds failure-capable per-case predicates that round21's counter explicitly lacked. Depth content is genuinely unchanged: the round22 note restates the round21 case table. Three calibration defects remain fixable: one stale "deepens" sentence (F1), atomic {0,12} counting not stated in SCORECARD (F2), and W1 falsifier F3 (snapshot vs oracle) unmet and undispositioned (F3).
2. **"Lowest non-retired tie8": the tie itself is true, but only through the supersession chain. The only table named "Axes" contradicts it (F4).** The claim also omits the stagnation-nudge state. By the lane's own declared saturation8/window3, the nudge has been active since round20, and round22 is window position 5 after the round17 capability (F5). That is an unreported SHOULD deviation, not a hard reject; the operator rules.

## Evidence for verdict 1 (genuine operability)

- **Round21 counter is not semantic.** `.ufo/waves/round-21/measure-c1.mjs:2` says: "Counts finite evidence-backed observations, NOT semantic entailment". `SCORECARD.md:1025` says: "Its silent structural fixture is not a semantic oracle." `final/semantic-contrast-witness.json` (round21) is an extracted data listing with no predicate and no failing exit.
- **Round22 adds independent predicates per case.** `.ufo/waves/round-22/measure-c1.mjs:285-301` covers status/output/errorText; `:302-307` the response windows; `:309-326` landing navigation; `:328-343` delayed release. Expected values come from the SHA-pinned `corpus/evidence/round-22/semantic-expectations.json` (pin at `measure-c1.mjs:22`, `:392-393`), using `$nonce` tokens rather than copied observed values.
- **Per-row failure capability is demonstrated in the fixture list.** `.ufo/waves/round-22/fixtures/expected.json` carries a `wrong-status` mutant for every one of the 12 case IDs (each expecting exit1, value0, `semantic_status`), plus output, error-text, landing and delayed mutants.
- **The selftest reseals digests and refuses stale-binding passes.** `selftest-c1.mjs:63` (`resealAcquisition`) and `:383` (`noStaleBinding`) together answer W1 F4: a semantic mutant cannot pass merely because a hash went stale.
- **This fits AXES and lane precedent.** `AXES.md:13` defines operability as "scripts that run … produces the stated outcome". Lane precedent files new gates over held ground under operability: `SCORECARD.md:410`, `:744`, `:787`.
- **Depth content delta is 0.**
  - `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:37-48` (case table) restates `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:32-43` row for row: same statuses, same errorText strings, the native array/null contrast, and the delayed release.
  - The note says so itself at `:16-19`, and `SCORECARD.md:1060-1067` and `LOG.md` agree.
  - No new decision threshold, error signature or observation is introduced.

## Findings

### F1 — SKILL.md still asserts depth ("deepens") after the axis correction

- **Where:** `SKILL.md:2412-2413`: "This deepens retained round21 observations; it is not a new browser acquisition or twelve new branches."
- **Contradicts:**
  - `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:16-18`: "The operative axis is operability … depth content is unchanged".
  - `SCORECARD.md:1060-1067`.
  - `corpus/SOURCES.md` round22 log line: "the operative claim is operability, not additional depth observations".
- **Counterexample:** `AXES.md:11` makes SKILL.md the reader-facing depth surface ("A reader can act on SKILL.md alone"). A reader of SKILL alone sees round22 framed as a depth move on the same 12 rows, which is the relabel W1 rejected (`w1/CriticClaim.md` verdict).
- **Preserving positive:** keep the rest of the SKILL section unchanged: the decision table `:2416-2422` and the registry `:2431-2436`. Keep the note's `:16-19` operability statement.
- **Impacted axes:** calibration (SCORECARD/SKILL do not match each other), and depth (false-improve risk).
- **Smallest fix:** replace "This deepens retained round21 observations" with "This adds a failure-capable recheck over retained round21 observations (operability; depth content unchanged)".

### F2 — "absent→twelve rows" hides that the aggregate is atomic {0,12}

- **Where:**
  - `measure-c1.mjs:480-485`: `blocked = findings.length > 0`, and a row counts only if `!blocked && semanticMatch`.
  - `fixtures/expected.json`: every single-case mutant expects `value 0`, never 11.
  - `SCORECARD.md:1065`: "absent→twelve failure-capable semantic-oracle rows".
- **Counterexample:** one row's regression (for example `status-na-click`) yields 0, not 11. The reachable values are {0 baseline, 0 failed, 12}. So the "12" is the fixed round21 population size (the same 12 depth already holds), carried by one atomic gate that has 12 per-row discriminators. It is not 12 separable operability units.
- **Disclosure is partial:**
  - It is disclosed in the note at `:59-60` ("target12 is conditional on all twelve rows").
  - It is also disclosed in `integration-changes.json` change 1.
  - It is not disclosed in SCORECARD.
- **Preserving positive:** keep the atomic design. It correctly refuses partial credit on a semantic red, as `integration-changes.json` reasons. Keep the per-row mutants.
- **Impacted axes:** calibration (unit wording). The scalar is unaffected (8→8).
- **Smallest fix:** in the round22 executed-disposition block, state "atomic gate; reachable values {0,12}; the 12 per-row discriminators are evidenced by the 12 `wrong-status` mutants, not by a partial count".

### F3 — W1 falsifier F3 is unmet and undispositioned: the gate is a golden snapshot of one acquisition

- **Where:**
  - `semantic-expectations.json:37,50,63,…,181` pins a per-case `fixtureSha256`.
  - The oracle enforces it at `measure-c1.mjs:166` (`raw.fixture.sha256 !== expected.fixtureSha256` → `evidence_binding`).
  - The fixture bytes embed the per-run nonce: `corpus/evidence/round-21/runtime/na-click.html:5` and `:12` both contain `d57a9461-7725-447a-94ee-5031820695a6`, which equals receipt `na-click.nonce`.
  - The oracle also pins `PRODUCER_SHA256` (`:23`), acquisition revision `1b5f449…` (`:87`), and Chromium `154.0.8037.97` plus flags (`:92`).
  - The case identity is hardcoded: `landing = … id === 'na-native-submit'` (`:117`) rather than driven by `expected.navigation === 'landing'`.
- **Counterexample:** W1 F3 (`w1/CriticClaim.md:41`) says to coherently re-nonce one case. That must stay semantically valid; otherwise the oracle is a snapshot. Here a re-nonced fixture changes the HTML bytes, so the result is exit1 `evidence_binding:case-identity-or-fixture`. `fixtures/expected.json` contains no re-nonce positive, and `git grep -i -E 're-?nonce|stagnation|nudge'` over `.ufo/waves/round-22` and `LOG.md` at e3cf4e0 finds no disposition. The same holds for a fresh run of the same producer: it fails on binding before any semantic predicate runs.
- **Why it does not void the claim:**
  - The raw per-case JSON is not pinned by the fixed expectations. It is pinned only through round21's own `runtime-execution-finalized.json` and the receipt, both co-editable inputs.
  - So a coherent rewrite of raw, receipt and execution pins still meets the semantic predicates. That is the real delta W1 named, and the claim's scope is "the SAME retained round21 observations".
  - The limitation is a tradeoff the claim already scopes; the note's recheck line `:3` says "a different build/acquisition needs independently reviewed expectations".
- **What is wrong:** the W1 falsifier was left without a recorded disposition, and the operability artifact is registered in `SKILL.md:2433` as a reusable "gate". It cannot evaluate any acquisition but this one.
- **Preserving positive:** keep `fixtureSha256` identity binding (it prevents fixture substitution) and keep the 12 `wrong-status` mutants.
- **Impacted axes:** operability (overstated reuse), and calibration (W1 falsifier not closed).
- **Smallest fix:** append a W1-F3 disposition saying "accepted limitation: frozen-acquisition regression lock; fixture digest embeds per-run nonce; not runnable against a new acquisition". Also qualify the `SKILL.md:2433` registry row the same way. If reuse is wanted later, the alternative is a nonce-normalized fixture template digest plus a re-nonce positive, but that is new scope and is not required for this claim.

### F4 — The only SCORECARD section titled "Axes" contradicts the operability-lowest-tie8 statement

- **Where:**
  - `SCORECARD.md:91` "## Axes — final state (refresh landed round 11)".
  - Rows `:95-100`: depth 7, coverage 5, **operability 5**, **freshness 3**, calibration 6, adjacency 5.
  - `:97` still says "Ceiling: no repo-local gate scripts".
- **Counterexample:** a judge reading the table titled "Axes" (`AXES.md:79` contract: "axes | Axis name → score … → last-change round") gets freshness 3 as the unique lowest axis. Operability 5 is neither lowest nor tied, and there is no 8.
- **The tie is true only via the chain:**
  - Kaika table `:402-405`: claimed depth8/cov9/op8/fresh8/cal9/adj8.
  - Admitted by `corpus/lessons/round-1-verifier-spotcheck.md` Adjudication ("operability … score 7→8"; freshness/depth/adjacency unchanged).
  - Superseded into current state at `:460-463`: "older training/user tables remain historical … Lowest non-retired tied axes: depth, operability, freshness, adjacency (8)".
  - Every later round table is scalar-neutral (`:473-478`, `:536-541`, `:601-606`, `:671-676`, `:742-747`, `:785-790`, `:829-834`, `:888-893`, `:951`, `:1003`).
  - `retired: none` holds throughout (`:444`, `:774`, `:817`, `:862`).
  - So depth/operability/freshness/adjacency = 8 and coverage/calibration = 9; "operability is a lowest non-retired tie8" is **true**.
- **Preserving positive:** keep `:91-100` bytes (append-only history) and the `:460-463` supersession.
- **Impacted axes:** calibration (no current axes field matching repo state).
- **Smallest fix:** append one current axes table: depth8 (r9 last move; later 8→8), coverage9 (kaika-1), operability8 (kaika-1), freshness8, calibration9 (kaika-1), adjacency8. Each row gets an evidence pointer, and the table is headed "supersedes `:91-100` current-state interpretation". Alternatively, add one line under `:91` pointing to `:460-463`.

### F5 — Round22 omits the stagnation-nudge state, which has been active since round20

- **Rule:**
  - `AXES.md:66-73`: when every axis is ≥ the saturation line and no capability entered within window N, "the lowest-axis obligation is waived: the round should be a frontier/capability move".
  - The lane declared line 8, N=3 (`SCORECARD.md:430-433`: "the nudge fires only after all six axes reach 8 and three consecutive rounds pass with no new capability row").
- **Chronology:**
  - The last capability row is round17 (`:803-807`; `:816` "round 18 = position 1"; `:862` confirms position1).
  - There is no capability row in r18 (`:857`), r19 (`:907`), r20 (`:962`, `:969`), r21 (`:1031`) or r22 (`:1051`).
  - All six axes are ≥8.
  - So round20 = position 3 (nudge active), round21 = 4, and **round22 = 5**.
- **The lane's own precedent records this state:** `:736-738` (round16 at position 3): "the waiver would apply under the position reading, but C1 satisfies the lowest-axis rule regardless". Round22's declaration (`:1043-1056`) and correction (`:1058-1069`) say only "saturation8/window3 remain unchanged". They give no position and no nudge status.
- **Counterexample:** the claim justifies itself with the lowest-tie rule (`:1046`, `:1064-1065`), and that obligation is waived here. AXES says the round SHOULD instead be a frontier/capability move, and C1 declares "no capability, retirement or promotion".
- **Not a hard reject:** the waiver is permissive, a lowest-tie claim remains allowed, and AXES uses "should".
- **Defect:** an unreported deviation, so calibration does not match observed state.
- **Preserving positive:** keep C1 as operability. Keep "no capability preclaimed"; inventing a capability to satisfy the nudge would be worse.
- **Impacted axes:** calibration; frontier/expansion (the nudge's purpose).
- **Smallest fix:** append to the round22 SCORECARD block: "Stagnation: all axes ≥8; round22 is position5 after the round17 capability; nudge active since round20 (AXES.md:66-73); lowest-tie C1 retained under the waiver; no frontier/capability move this round — operator rules."

## Out of item (pointer only, not attacked)

- The SKILL decision row at `SKILL.md:2419` and the note at `:40` say native-submit old-document submits are "unavailable/null". The oracle, however, requires the `submits` key to be absent (`measure-c1.mjs:121-122`) and would reject a retained `submits: null`. This is a doc/oracle wording gap for the row-outcome seats.

## Exercised commands (all read-only, lane cwd; exit 0 unless noted)

- `git show --stat e3cf4e0`; `git log --oneline -8 e3cf4e0`; `git ls-tree -r --name-only e3cf4e0`. All exit 0.
- `git show e3cf4e0:{SCORECARD.md, .ufo/waves/round-22/{claim-classification,classification-ruling,baseline,post-crash-repair,integration-changes}.json, measure-c1.mjs, selftest-c1.mjs, fixtures/expected.json, w1/CriticClaim.md, SKILL.md, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/lessons/round-1-verifier-spotcheck.md, corpus/evidence/round-22/semantic-expectations.json, corpus/evidence/round-21/runtime/{receipt.json,na-click.html}, .ufo/waves/round-21/{measure-c1.mjs,final/semantic-contrast-witness.json}}`. All exit 0.
- `diff <(git show 0f24164:…/measure-c1.mjs) <(git show e3cf4e0:…/measure-c1.mjs)`. Exit 1 (differences shown: D1/D2 hunks only).
- `git diff 5f58577 e3cf4e0 -- SKILL.md LOG.md corpus/{README,QUALITY,SOURCES}.md`. Exit 0.
- `git grep -n -i -E 'stagnation|nudge|…|re-?nonce' e3cf4e0 -- .ufo/waves/round-22 LOG.md`. Exit 0, with no stagnation, nudge or re-nonce disposition hits.
- `node -e` one-liners used only to parse piped `git show` JSON (fixtures list; na-click nonce). These are not lane scripts.
- A first attempt to stage `git show` output under `/tmp` failed: `/tmp` was 100% full (`df -h /tmp`: 141M free). I removed my own earlier `/tmp/criticclaim-sc.md` and continued with pipes only.

## Unrun checks (honest)

I did not execute `measure-c1.mjs` (CLI or `--selftest`), `run-checks.py`, any re-nonce mutant, or a fresh acquisition. The F3 consequence (exit1 `evidence_binding` on a re-nonce) is `[INFERENCE]` from `measure-c1.mjs:166`, `semantic-expectations.json` `fixtureSha256` pins, and the nonce embedded in `na-click.html:5,12`. It was not observed by a run.

## Tooling

No tools were installed or updated.
