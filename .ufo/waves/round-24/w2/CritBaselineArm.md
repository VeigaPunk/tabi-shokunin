# CritBaselineArm — attack on the C1/C2 before-arms (round 24, wave 2)

- Seat: `L1Tabi24.CritBaselineArm` (critic, leaf; no subagent dispatch, no peer messages)
- Date: 2026-10-25
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Frozen claims: `.ufo/waves/round-24/claims.json`
- Attacked artifacts (COMMITTED at lane tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`):
  - `scripts/check-gate-registry.mjs` (C1 counter, 464 lines)
  - `scripts/check-selfassessment.mjs` (C2 counter, 574 lines)
  - `corpus/evidence/round-24/c1-measurements.json`, `c2-measurements.json`, `c2-baseline.json`, `c2-tip.json`
- Method: re-ran both counters against the baseline revision `573c99e` *and* against an isolated
  reconstruction of the baseline tree (`git archive` of `573c99e` committed into a throwaway
  fixture repo under `.ufo/waves/round-24/scratch/CritBaselineArm/{base,base2,base3}`), then
  mutated those fixture trees and re-ran. All fixture repos are scratch-only; no tracked lane
  file was edited, no git write touched the lane repo. Host note honored (TMPDIR exported to
  `/home/vgpnk/tmp-tabi24` before every node run).

## 1. The strongest objection, stated

Both counters exist **only at the tip** and are run *backwards* against the baseline. The
before-counts therefore depend on (a) the counter's own definition of what counts as a gate /
a tally / an unlanded path, authored by the same L1 that then "fixed" the baseline, and (b)
parser coverage (`regexes, table shapes, digit spellings) chosen after seeing the data. A
before-arm is only as strong as its ability to move predictably under mutation *and* to see
the defects it claims to count. I tested both:

- **Mutation battery (does the count move as predicted?)** — all predicted moves reproduced.
- **Coverage battery (does the counter see the class of defect it claims to count?)** — found
  three blind spots where the counter's own definition silently excludes defects it claims to
  judge (C1), and a worktree term that makes the C2 before/after arms non-reproducible from
  committed bytes.

## 2. C1 (gate-registry counter): mutation results

Fixture: `base` = isolated reconstruction of baseline `573c99e` (6232 files, incl. `.ufo`).
Baseline reproduced exactly: **G12 gates, nonconformant=3** (`check-adjacency`,
`check-measurement-binding`, `round-evidence-audit`; all `e1-missing-row`) — matches
`c1-measurements.json` before. Commands:
`git -C base archive 573c99e | tar -x`, `git init/commit`, then
`node scripts/check-gate-registry.mjs --repo base --rev HEAD --json`.

| Mutant | Change to baseline SKILL.md | Predicted | Observed |
|---|---|---|---|
| M1 | append conformant 8-column row for `round-evidence-audit` | 3→2 | **3→2** ✓ |
| M2 | break one conformant field on `check-freshness` latest row (drop `--self-test`) | +1 | **2→3** ✓ (e2-field-incomplete: selftest) |
| M3 | append rows for `check-adjacency` + `check-measurement-binding` | 3→1 | **3→1** ✓ |
| M4 | restore the broken field | 1→0 | **1→0** ✓ (positive control: green is reachable by rows alone) |
| M5 | add `scripts/checkCamel.mjs`, `scripts/measure-c2.mjs` (no rows) | 0 (invisible) | **0** ✓ |
| M6 | supersede adjacency row with word-salad row `xxxxxxxx`/`owner` etc. | 0 (passes predicates) | **0** ✓ (row=2462, missing=[]) |
| DEL | delete `check-adjacency.mjs`, `check-measurement-binding.mjs`, `round-evidence-audit.mjs` (base2) | 3→0 | **3→0** ✓ |

**Findings**
1. **The count is a function of the script set, not just registry completeness.** Deleting the
   three unregistered gate scripts yields `nonconformant=0` (exit 0) with **zero** registry work.
   `after=0` is therefore reachable by *shrinking the gate set*, a state the counter cannot
   distinguish from full conformance. The lane reached 0 by adding rows (receipt shows gates
   12→14), so the claim itself is not of this form — but the metric admits the state.
2. **The gate set is author-defined and silently excludes declared gates.** The set is
   `scripts/` files matching `^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$` plus
   row-named scripts. Consequences, verified at both baseline and tip:
   - `scripts/checkCamel.mjs`-style scripts (uppercase) are invisible (M5).
   - Scripts named **only in registry rows whose kind cell is `"<role> / gate"`** are invisible:
     `parseRows` requires the kind cell to *begin* with `gate`/`probe`. The baseline (and tip)
     SKILL.md declares five such gates — `validation counter / gate`, `download binding counter /
     gate`, `routed correction counter / gate`, `writer isolation / gate` (round-19), `wave-1
     provenance metadata / gate` (round-20) — none of which the counter parses or counts, and
     the round-24 restatement block (11 canonical rows) never restates them.
   - **Scripts outside `scripts/` are never convention-scanned.** `.ufo/waves/round-19/isolation/
     check-isolation.mjs` exists at baseline and is registry-declared, but is absent from the
     counter's 12-gate set (its only mention is in an invisible `<role> / gate` row).
   - The claim's declared "derives the lane's gate set" is therefore true only for the
     *author's* set; a registry row that "proves" registry completeness cannot see rows its own
     parser refuses.
3. **The verdict-map/entry predicates are syntactic, not semantic.** M6's row (entry
   `xxxxxxxx`, self-test `run it with --selftest`, pinned `see ./somewhere`, scope `nothing
   written anywhere`, owner `owner`) passes all eight field checks. `after=0` thus certifies
   cell *shape*, not that the entry cell contains a command or the scope cell a real scope
   (PROTOCOL §Gate standard: "entry command", "write scope"). Not a live defect — the lane's
   own rows are substantive — but the observed 0 is a bound on shape.
4. **Two of the three "missing row" gates are not row-less.** At baseline, `check-adjacency`
   (line 1940) and `check-measurement-binding` (lines 1840, 1939) have full registry-shaped rows
   (entry, verdict map, self-test cases, pinned digests) in tables whose headers lack a Kind
   column. The counter reports them `e1-missing-row` ("no gate-kind registry row names this
   gate") — accurate per its own definition, and the tip restatement says "no gate-kind row at
   all" — but the claim's shorthand "the row round 23 never wrote" is true only for
   `round-evidence-audit`. The count "3" conflates one absent row with two rows the parser
   refuses to read (e1 vs e2 attribution). The unit defect (round-evidence-audit) is real.

## 3. C2 (self-assessment counter): mutation results

Fixture: `base3` = isolated baseline reconstruction (clean worktree). Baseline reproduced:
**mismatches=4, all m1** (lines 410 25→26, 1138/1139/1151 12→13), m2=75 CNE, **m3=0**
(clean fixture). Commands: `node scripts/check-selfassessment.mjs --repo base3 --rev HEAD --json`.

| Mutant | Change to baseline SCORECARD.md | Predicted | Observed |
|---|---|---|---|
| N1 | (baseline, clean tree) | 4 | **4** ✓ |
| N2 | "earlier **eight**-case helper" → "earlier **8**-case helper" | 4→5 | **4→5** ✓ (line 200, 8→12) |
| N3 | append correct `(13/13)` tally, no marker | supersede? | no effect (5) — rule requires marker |
| N3c | append `(13/13) supersedes the tally at line:1138` | 5→2 | **5→2** ✓ (superseded=3) |
| N3d | same but cite `line:1` | (citation decorative?) | still 5→2, superseded=3 — cite is decorative |
| N4b | stale tally on script-less line inside a 2-script section | CNE, not counted | **CNE (ambiguous script association), mismatch count unchanged** |
| N5 | touch untracked file; then commit it (same rev) | 4→5→4 | **4→5→4** ✓ |
| N6 | add JSON receipt `{"command":"git cat-file -e deadbeef…:SKILL.md","exit":0}` | 4→5 | **4→5** ✓ (observed 128 vs claimed 0) |

**Findings**
1. **The m3 term is not a function of the revision; the before/after arms are not
   reproducible from committed bytes.** `m3` reads `git status --porcelain --untracked-files=all`
   of the *worktree* and counts all untracked paths. Same revision, three different numbers:
   - lane worktree now: **5** (untracked wave-2 orchestration files: `w2-dispatch.json`,
     `gen-w2.mjs`, `w2-spec.json`, `w2-dispatch.err`, `w2/swarm-registry.json`); plus 43
     untracked files total at this moment (wave-2 seat reports, incl. this one).
   - `c2-baseline.json` / `c2-measurements.json` before (recorded when the worktree had 4
     untracked paths): **4**.
   - isolated clean fixture: **0**.
   The routed-defect figure in the frozen claim ("one unlanded-path mismatch over 89 porcelain
   paths") matches none of them. PROTOCOL §Gate standard is explicit: "a gate grades the tree it
   runs on, so a run over a moving worktree is not comparable to one over the cited commit" —
   m3 does exactly what that forbids.
2. **C2's `after=0` has no committed receipt on disk; the lane's own receipts say 1, and
   the post-freeze revision (added to claims.json at 05:56, i.e. during this review) admits
   the discrepancy.**
   - `c2-tip.json` (recorded at `b973fde`): `mismatches=1` (m3, observed 4).
   - `c2-measurements.json` after (same rev): `mismatches=1`.
   - claims.json originally declared `after: 0`; its `revisions` block (empty at my first
     read, then populated during this review) now records: *"after 0, measured at the final
     clean tree; the m3 class is a live-tree property, so mid-wave runs read 1 while wave
     artifacts are uncommitted; the final receipt records the clean-tree run."* The cited
     clean-tree receipt is not among the committed receipts I can see
     (`c2-measurements.json`/`c2-tip.json` both record after=1 at `b973fde`).
   - Re-running at the claimed tip `ad125e8` in the live worktree gives **1** (m3, observed 5).
     The 0 is attainable only at a moment when the worktree has no untracked files — an
     unstated precondition that the wave-2 process itself (untracked seat reports) violates.
     The revision's own wording concedes this ("mid-wave runs read 1").
3. **claims.json's frozen `before: 4` contradicts the lane's own receipt (`5`) and the
   counter (5 in situ, 4 on an isolated tree).** The frozen prose ("three stale 12/12 figures,
   one unlanded-path mismatch" = 4) also misdescribes the counted set: the instrument counts
   **four** m1 findings (including `check-sources` 25 vs 26 at line 410) and **one** m3. The
   SCORECARD's own claims table (line 1220) says "5 → 0". The post-freeze revision now records
   the correction (`before 4` → `before 5 (measured; the counter found a fourth stale tally:
   check-sources 25 vs 26 at SCORECARD.md:410)`); my independent isolated-tree measurement
   (4× m1, m3=0 on a clean tree) supports both the corrected before and the decomposition:
   4 m1 + 1 m3 (live tree) = 5.
4. **Word-numeral blind spot: a stale tally that is invisible is the lane's own.** The "eight
   isolated CLI cases" figure (check-freshness) that the round-24 corrections block says is
   superseded was never counted by m1 (digit-only patterns). N2 shows the identical statement
   spelled "8-case" moves the count. The before-arm missed a stale figure the lane itself admits
   — parser coverage chosen after seeing the data.
5. **Supersession's "cites the superseded line" is decorative.** N3c/N3d: `supersedes the
   tally at line:1` clears all three stale round-evidence-audit tallies exactly as `line:1138`
   does (superseded=3 both times). Any later marked line with the correct number clears every
   earlier stale mention of that script regardless of the cited line.
6. **Stale tallies can be hidden in multi-script sections** (N4b): a script-less tally line in
   a section naming ≥2 scripts becomes `could-not-evaluate (ambiguous script association)` and
   never counts — a defined escape hatch.
7. **m2 is a disclosed null class but its disclosure is inconsistent.** Baseline m2 = 75 CNE +
   1 evaluated, 0 counted; the claim's "five" before-count only includes m1+m3. Per the
   killRule ("if a class yields no finding at the baseline it is disclosed as a null class"),
   m2 yields findings but zero *counted* findings — the null disclosure appears in the instrument
   output (`couldNotEvaluate: 75`) and receipts, but not in the claim's or SCORECARD's prose.
8. **SHONEN.md is never read.** The claim's declared says the counter compares "SCORECARD.md
   blocks … and SHONEN.md"; `grep -ni shonen scripts/check-selfassessment.mjs` finds only the
   header comment. m1/m3 read SCORECARD.md only; m2 reads `corpus/evidence/*.json`. Minor
   overstatement of scope, no effect on the count.

## 4. C1's own before-arm is solid; C2's is not

- C1: baseline 3 reproduces exactly on the isolated tree; mutation battery moves as predicted
  (+/−1); the tip 0 is field-sensitive (M2 red, M4 green). The instrument's verdict is a pure
  function of committed bytes. Verified **green at tip**: `nonconformant=0, gates=14, clean`
  (`node scripts/check-gate-registry.mjs --rev ad125e8`), selftest 22/22.
- C2: the tip count is 1 in the live worktree (m3), 0 only on a clean tree; the 0 has no
  receipt; the frozen before (4) contradicts both the receipts (5) and the counter's in-situ
  run (5). The m1/m2 arms are byte-reproducible; m3 is not.

## 5. Controlling / evidence summary (every number has its command)

- Baseline C1 in lane: `node scripts/check-gate-registry.mjs --rev 573c99e --json` → 3/12.
- Baseline C2 in lane: `node scripts/check-selfassessment.mjs --rev 573c99e --json` → 5 (m3=5 now).
- Isolated baseline C1/C2: same commands `--repo …/base --rev HEAD` → 3/12 and 4 (m3=0).
- Tip C2 in lane: `… --rev ad125e8 --json` → 1 (m3=5). `c2-tip.json` (b973fde) → 1 (m3=4).
- C3 (sanity, not in scope): `git grep -lE '^source: S10[45] ' 573c99e -- corpus/knowledge | wc -l` → 0; at `ad125e8` → 1 (`navigation-history-bfcache-evidence.md`, S104/S105 rows with fetched bytes and sha256). C3's 0→1 holds.
- Controls: `.ufo/waves/round-24/w1/ExecControlSkip.md` recorded both skip-work controls meeting the after-target at baseline (vacuous); consistent with this attack — the before-arms are what carry the claims, and C2's carries a non-reproducible term.
- No tools installed; no lane files modified; no git writes to the lane repo; no services/browser/network.

## 6. Smallest safe correction (for the L1/integrator, not for me to apply)

1. **C2 m3:** scope it to the measured revision and to lane-owned round work only — e.g. count
   only porcelain paths under `corpus/`, `scripts/`, `SKILL.md`, `SCORECARD.md`, `LOG.md`
   (never `.ufo/waves/*/scratch/`, never reports of other seats), and *commit* the check by
   recording the porcelain snapshot digest in the receipt alongside the count. Or drop m3 from
   the counted set and disclose it as a worktree-state note (PROTOCOL's own "moving worktree"
   rule).
2. **C2 freeze integrity:** the claim frozen at wave start said `before 4` / `after 0`; the
   `revisions` block added to claims.json at 05:56 during this review records `before 4 → 5`
   and `after 0 (measured at the final clean tree; m3 is a live-tree property)`. What remains
   unrecorded on disk: a clean-tree receipt showing `mismatches=0` (both committed receipts
   `c2-measurements.json` / `c2-tip.json` still record after=1 at `b973fde`), and a restated
   target that does not depend on an implicit clean-worktree precondition (e.g. report
   `after=0` on the committed tip *without* the m3 term, with m3 disclosed as worktree state).
3. **C1 gate set:** stop letting the counter define the set it judges — derive the set from the
   registry (all rows whose kind cell is `gate` *or ends in* `/ gate`, plus convention scripts),
   or explicitly disclose that the count covers only `scripts/` + canonical-kind rows. Either
   define the five `<role> / gate` rows as malformed (then they should be red, not invisible) or
   include them.
4. **C1 predicates:** add a minimum check that the entry cell contains a command token (a
   `.mjs`/`.sh` path or shell vector); document that `after=0` certifies shape only.
5. **C2 m1:** accept spelled-out numerals in tally patterns (or document that word-numeral
   tallies are out of scope); make supersession cite the actual superseded line (resolve `:N`
   to a line whose finding exists), not any trailing `:N`.

## 7. Mid-review note on `claims.json` revisions

At my first read, `claims.json`'s `revisions` block was empty. At 05:56 (during this review)
the L1 appended three revision entries: C1.after clarification (before measured at 3), C2.before
4 → 5 (fourth stale tally, check-sources 25 vs 26 at :410) and C2.after ("0, measured at the
final clean tree; m3 is a live-tree property; mid-wave runs read 1"). Those entries record
exactly the two discrepancies this report independently found (§3 findings 2–3) and concede
the m3 live-tree property that is my central objection; they do not change the mutation
evidence or the coverage findings (§2, §3 findings 1, 4–8). The only remaining gap is the
absence of a committed clean-tree receipt showing `mismatches=0`.
