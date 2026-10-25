# MutClassFalsifiers — mutation probe of the six auditor classes on real round-22 bytes

Seat: lane-dispatched mutation-tester (L1Tabi23.MutClassFalsifiers). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Target: round-22 committed bytes at lane `HEAD` = `a89f193` (the tree an auditor sees at rev `be271a2`/`a89f193`), plus the
L0 report `69449ed:.ufo/reports/round-22/tabi.md` (fleet repo). Scratch-only mutations; no tracked file touched.
Reference detector (throwaway, this probe only): `.ufo/waves/round-23/scratch/MutClassFalsifiers/audit.mjs`
sha256 `0759d481…d9686373`. `base/` = 46 round-22 evidence files materialised via `git show` (lesson, SCORECARD, LOG,
w1/w2/w2b specs, spawn results, registries, 24 refusal receipts, 9 attempt receipts) + the report. Command form:
`node .ufo/waves/round-23/scratch/MutClassFalsifiers/audit.mjs --root <root> --round <N> --lane "$PWD"`.

| class | repair mutation applied (must clear) | defect mutation applied on repaired copy (must re-trip) | observed |
|---|---|---|---|
| c1-refusal-arithmetic | `23`→`24` at lesson:130, SCORECARD:1111, LOG:1584, report:19, report:182 (5 sites; derived = 13 w2 + 11 w2b receipts) | d1: lesson:130 back to `23` | repair 0, d1 1 (c1) |
| c2-wave-caps | `"maxLanes":65`→`64`, `seats=65`→`64`, `Spawned 65`→`Spawned 64` (3 sites; 64+0+64=128) | d2: `"maxLanes":64`→`65` | repair 0, d2 1 (c2) |
| c3-gate-spotcheck | insert `- **Spot-check:** …` inside `## Gate` (lesson) | d3: delete that line | repair 0, d3 1 (c3) |
| c4-stale-attempts | replace `**Stale-lane:** none …` (2 lines) with 3 per-attempt grades; "dispatched three times" sets N=3 | d4: restore `Stale-lane: none` | repair 0, d4 1 (c4) |
| c5-registry-identities | fill all 65 `"agentId": null` in `w2b/swarm-registry.json` | d5: re-null one (`RowOutcome01`) | repair 0, d5 1 (c5) |
| c6-landed-log-binding | report row 2 commit `47bfb5f…`→`fbee618…` (only LOG-touching commit; `git show --name-only --format= <h>` lists `LOG.md` for fbee618, not for 47bfb5f) | d6: `fbee618…`→`47bfb5f…` | repair 0, d6 1 (c6) |

## Observed outcomes (all commands from the lane root)

```
node …/audit.mjs --root …/base     → exit 1  classes=6 findings=7
node …/audit.mjs --root …/repaired → exit 0  classes=0 findings=0
node …/audit.mjs --root …/variants/d1…d6 → exit 1  classes=1 findings=1 each (exactly the mutated class)
```

Each class is independently falsifiable in both directions **under the report-inclusive detector**. Partial repairs
fix the "smallest mutation that MUST flip" boundary: `variants/p2` (only `maxLanes` 65→64) still exit 1 — c2 needs the
spawn receipt rewritten too; `variants/p3` (sibling `round-22-verifier-spotcheck.md` added, Gate unchanged) still exit 1
— c3 correctly ignores file existence (at lane HEAD that sibling file *does* exist, so a file-existence rule would
score 0); `variants/p5` (one of 65 ids filled) still exit 1 — c5 needs all 65; `variants/d1` shows the converse (4 of 5
c1 sites repaired, one at `23` → still exit 1).

## Classes that survive — drop or re-scope before counting six

1. **c6 survives both directions under the frozen `--rev` API.** `variants/lane-only` (no report) → exit 1, classes=5,
   c6 absent. The report is not in the lane repo: `git -C <lane> cat-file -e 69449ed` fails; it exists only at
   `69449ed` in `/home/vgpnk/Projects/shokunin`. With `--rev <lane-rev> --round 22` alone c6 reads clean in both
   directions → fake class. **Required:** add `--report <path>` or `--fleet-rev`; with it, 6/6 reproduces (`base`).
2. **c3 cannot be cleared by the round-21 control.** `variants/round21` (round-21 lesson, specs, registries, report;
   `--round 21`) → exit 1, c3 only: round-21's `## Gate` (95 lines) also has no spot-check row. Fleet `LEARNING.md:70`
   states the rule and predates round 21, so this is a real round-21 defect, not a scoping error. Either scope c3
   effective-from round 22 by rule, or the claim's "round-21 evidence must yield 0" arm fails for c3 and its green
   side rests on a synthetic Gate fixture.
3. **c2's "repair" is evidence falsification.** Clearing it requires rewriting `Spawned 65 background agents` in
   `w2b-spawn-result.json`. A stricter spawned-vs-registry-members cross-check (65 members) would keep tripping even
   then; c2's green mutant must be a synthetic ≤64/≤128 wave set, not an edited round-22 receipt.
4. **c6 instance count is rule-dependent.** Item-scoped rows (LOG cell names `item <n>`) yield the one routed instance
   (row 2). Row-scoped binding additionally flags row 6 (`be271a2`, `LOG.md`-touch count 0); the green mutant must
   fix both rows under that stricter rule.

## Derivation rules the L1 must encode (each verified by a failing run above)

- **Round-scope prose.** Whole-file scan of SCORECARD/LOG makes round-21 trip on round-22's `23 whole-payload`
  (observed before scoping: round21 → 2 classes). Scope to the `## Round<N>` block and the last `## Round<N>` landing block.
- **c1 absence.** `receipts>0` with no citation = finding; `receipts=0` with no citation = clean (else round21 trips).
- **c2 sources.** Wave cap from `*-spec.json:maxLanes` vs policy `waveMaxLanes=64`
  (`scripts/hyaku/ufo-wave-policy.json`, fleet repo); round total from `*-spawn-result.json` (`Spawned N` / `seats=N`)
  vs 128 (round-22 prompt §6 addendum). Not from spec sums (64+64+65=193 would be wrong).
- **c4.** Attempt count from the round block ("dispatched three times"); parse grades across the whole stale-lane
  paragraph, not the first `attempt N` (my first parser stopped at attempt 1 and left the repaired copy red).
- **c5.** Only waves with a successful spawn require ids: W2's 64 nulls are legitimate (0 spawned). A null-anywhere
  rule conflates W2 with W2b and inflates the repair to 129 cells.
- **`--selftest` wrapper cases to add (12-case minimum):** report-absent must be an explicit refusal/skip, never a
  silent clean; single-site repairs for c1/c2/c5 must stay red; sibling-file-present must not clear c3.

## Restoration and scope

Mutations only under `.ufo/waves/round-23/scratch/MutClassFalsifiers/`; `diff -rq pristine-snapshot base` → identical,
manifest sha256 `e8892465…a542ff`. `git status --porcelain -- corpus/lessons/round-22.md SCORECARD.md LOG.md
.ufo/waves/round-22` → 0 lines. Detector exits 1 on findings / 0 clean, matching the spec'd CLI. No tool
installs/updates, no git/jj writes, no spawns, no messages, no services.
