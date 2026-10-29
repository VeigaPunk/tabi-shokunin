# ExecTsvBlobs — r42 TSV evidence blob verification

Full report with every command and output: `.ufo/waves/round-43/w1/ExecTsvBlobs/report.md`
(evidence: `w1/ExecTsvBlobs/evidence-ev-rows.tsv`, `evidence-ev-mention.tsv`,
`evidence-c2-at-freeze.json`, `evidence-c2-at-baseline.json`, `evidence-c2-at-head.json`,
`evidence-mut-floor5000.json`, `evidence-r4-discrimination.txt`, `evidence-slice-ids.sorted`,
`evidence-tsv-ids.sorted`). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` read-only at
frozen rev `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`; scratch
`/fast/scratch/hyaku/tabi-r43/ExecTsvBlobs/` removed. Judged axis: calibration.

## Receipt

**38 / 38 PASS — zero failing rows.** Every one of the 38 evidence paths in
`.ufo/waves/round-42/quarantine/re-adjudication.tsv` resolves at the frozen rev to object type
`blob` with committed size >= 200 (observed range 1777 to 6838 bytes; all 38 are mode `100644`,
all 38 distinct, all under `.ufo/waves/round-42/w1/`).

## Decision

The r4 clause of the frozen C2 predicate holds on real data. Three independent legs:

1. **My own loop** over the 38 committed TSV rows: `git cat-file -t` == `blob` and
   `git cat-file -s` >= 200 for 38/38 (`evidence-ev-rows.tsv`).
2. **The frozen checker** at the freeze rev: exit 0, `predicate: true`, `findingCount: 0` — the r4
   branch contributes no finding (`evidence-c2-at-freeze.json`). Same at lane HEAD `ba433c94…`,
   and 38/38 by my loop there too.
3. **Non-vacuity**: a scratch copy of the checker with the numeric floor `200` → `5000` produces 36
   r4 findings on the real rows (S131=6838 and S133=5536 stay above it) — the branch demonstrably
   iterates every row (`evidence-mut-floor5000.json`).

Ten synthetic-fixture probes then show the gate discriminates: tree → `not-a-blob`, 5-byte blob →
`too-small`, absent → `absent`, gitlink → refused, 199 → rejected, 200/201 → clean,
300-byte blob → clean (`evidence-r4-discrimination.txt`).

Baseline `ab592825…` is red for r5/r6 only (`r5-claims-absent`, `r6-probe-absent`); r4 is already
satisfied there, so the r4 result does not depend on the r5/r6 hardening.

## Observations routed as findings (no amendment proposed — checker bytes are frozen)

- A mode-120000 **symlink** entry is a `blob` whose `cat-file -s` is the link-text length, so a
  symlink with a >=200-character target passes both gates while pointing at a possibly
  non-existent path. Not violated by the real data (all 38 are `100644`); it bounds the gate's
  evidential reach.
- The r4 branch does **not** enforce a 1:1 row-id → evidence-path binding (two distinct ids may
  share one path), does not cross-check the verdict against the evidence body, and ignores extra
  TSV columns. The real TSV satisfies all three incidentally (38 distinct paths; 38 distinct ids;
  every row exactly 3 columns; every evidence body names its own slice id — 38/38).

## Limitations

Verifies the r4 clause only — not that the r42 verdicts are substantively correct, and not any
revision other than `7ca6f018…` (plus HEAD). Scratch removed; no lane writes, no commits, no
pushes, no pacman, no agents, no network.

VERDICT ok 38/38 evidence paths are committed blobs of >=200 bytes at 7ca6f018; no failing rows; r4 branch independently shown live and discriminating.
