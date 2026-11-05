# R66Executor1 — Tabi round 66, w1, C1 rebind (adjacency)

## Result
- Generator built, deterministic (rerun sha256 of adjudicated delta identical: `3739288392ad7083`), and run.
- Mechanical control: **predicate=false, findingCount=1, exit 1**. Finding quoted verbatim: `delta-quote-not-whole-line | kake-shokunin:SKILL.md:1358`.
- Adjudicated ledger: **predicate=true, findingCount=0, exit 0**.
- Disposition changes: **0** (list: none). Quote changes: **1** (`kake-shokunin:SKILL.md:1358`, quote set to the complete head line). Audit note changes: **1** (`kumitate-shokunin@89cbd998…:SCORECARD.md:1723`, `:1885` → `:1898`, status `moved` unchanged). Lane rows changed: **21** (provenance columns only).

## Files
- Generator: `.ufo/waves/round-66/counters/rebind-ledger-r66.mjs`
- Mechanical: `.ufo/waves/round-66/c1/mechanical/adjacency-host-delta-r66.tsv`, `.../adjacency-host-audit-r66.tsv`
- Adjudicated: `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv`, `.../adjacency-host-audit-r66.tsv`
- Residue: `.ufo/waves/round-66/c1/quote-residue.tsv`; decisions `.ufo/waves/round-66/c1/adjudication-decisions.tsv`; rationale `.ufo/waves/round-66/c1/adjudication.md`
- Diff summary: `.ufo/waves/round-66/c1/diff-summary.json`
- Meter outputs: `.ufo/waves/round-66/c1/meter/mechanical.json`, `.ufo/waves/round-66/c1/meter/adjudicated.json`

## Commands and exit codes
1. `node rebind-ledger-r66.mjs --lane <tabi> --fleet /home/vgpnk/Projects/shokunin --snapshot <snap> --out-dir <c1> --decisions <c1>/adjudication-decisions.tsv` (phase 1, decisions absent): exit 2 by design (adjudicated skipped; mechanical and residue written).
2. Same command with the decisions file written: **exit 0**.
3. `node c1-adjacency-host-v22.mjs --rev 4bea87d5… --repo <tabi> --fleet <fleet> --snapshot <snap> --audit <c1>/mechanical/adjacency-host-audit-r66.tsv --delta <c1>/mechanical/adjacency-host-delta-r66.tsv --json`: **exit 1**, predicate false, findingCount 1.
4. Same meter with `adjudicated/` inputs: **exit 0**, predicate true, findingCount 0, counts roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20, unresolvableHead 0.
5. Rerun of the generator: exit 0, identical adjudicated delta sha256.
6. Independent diff vs r62 (node): mechanical delta 176 rows, 0 line rows differ, 21 lane rows differ; adjudicated 1 line row differs (quote only); audit 1 row differs (note only).

## Frozen-meter findings at the live heads (for the L1)
- Mechanical: `delta-quote-not-whole-line | kake-shokunin:SKILL.md:1358` (only one).
- Adjudicated: none.
- Drift disclosed by the meter (informational, not in the predicate): kama-shokunin `24d1895d` → live `95ad1dbb`; kengaku-shokunin `00462b59` → `c3f81f72`; kotoba-shokunin `4df1e800` → `89579c77`. The ledgers are bound to the snapshot as specified.

## Notes
- The lane HEAD is `4bea87d5`, not the lane base `2816adb`; the meter was run with `--rev 4bea87d5` (the task's `<HEAD>`).
- The generator's residue rule is "line row quote != complete head line". Only one residue existed; no head line was missing or tab-containing (both would refuse).
- The adjudication is judgment recorded in `adjudication-decisions.tsv` (fits=yes for kake SKILL.md:1358); the generator applies it mechanically.
- No sibling, corpus, frozen counter, fleet-root file or r62 ledger was written. Only read-only git was used (`rev-parse`, `cat-file -p`, `cat-file -e`). Scratch was `/fast/scratch/hyaku/tabi-r66/R66Executor1` and was removed by trap.
- Tools: none installed or updated.
