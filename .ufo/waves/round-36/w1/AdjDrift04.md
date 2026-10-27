# AdjDrift04 — C1 drift verification (independent re-derivation, 20 rows)

Round: tabi 36 (attempt 1), wave w1. Milestone C1 (axis: adjacency). Seat: AdjDrift04 (executor/leaf).
Frozen contract read first: `.ufo/waves/round-36/claims.json` (digest-pinned baseline `11c64b96…`, C1 predicate:
`check-adjacency` clean AND `completeness.unaccounted == 0` AND `drift.total >= 1` AND
`drift.auditCoverage == drift.total` AND `drift.auditFindings == 0` AND `drift.staleFindings == 0` AND
`delta.unaccounted == 0` AND `delta.screenFindings == 0`).

## Assignment

Re-derive, from git objects only, the audit status of the 20 ledger rows in
`.ufo/waves/round-36/w1-chunks/AdjDrift04.tsv` (`sibling_ref<TAB>status<TAB>note`), and compare each
derivation with the committed ledger row in `corpus/adjacency-screen-drift.tsv`.

## Inputs

- Chunk rows: 20, no duplicate refs. All 20 are `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f` citing two files:
  `corpus/knowledge/2026-10-13-r4-08-observe-verbs.md` (4 rows: 198, 203, 239, 247) and
  `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md` (16 rows: 180, 181, 183, 185, 264, 521, 524, 525, 561, 568, 612, 666, 676, 677, 678, 719).
- Frozen delta head for kaidoku (`baseline/c1-delta-pins.json`): `1ed29de2cdd6061315fb2f5478d5029b7d570675`.
  Both commits resolve (`git cat-file -t` → `commit`).
- Committed ledger pool: 308 lines = header + 307 rows (304 `unchanged`, 3 `moved`, 0 `stale`).

## Method (exactly as assigned; read-only git only)

For each row `<lane>-shokunin@<pin>:<path>:<line>`:

1. `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>`, take line `<line>`, `.strip()` → CITED text.
   Pin file absent → `stale` (`pin file absent`); line absent → `stale` (`pin line absent`).
2. `git -C … show <H>:<path>` with H = `c1-delta-pins.json[<lane>]`; absent → `stale` (`head file absent`).
   Line `<line>` at head, trimmed, equals CITED → `unchanged`; else all head lines whose trimmed text equals CITED →
   `moved` (`verbatim at :N[,:M]`); none → `stale` (`cited text absent at head`).
3. Look up the committed ledger row by exact `sibling_ref`; compare status. For `moved`, the ledger note must name a
   relocation line (`:<N>`).

Line handling mirrors the frozen counter (`c1-adjacency-sweep-v4.mjs` lines 403–413): split on `\n`, strip a trailing
`\r`, `.trim()` each line. No counter or fleet script was executed for this derivation — only `git show`/`git cat-file`/
`git rev-parse`/`git diff` (read-only). Exact command list: `commands.txt` (55 lines, includes the delta-head map and
the control commands). Derivation driver: scratch `derive.py` (contents reproduced by `commands.txt` + this method).

## Result — 20/20 agree, 0 mismatches

| derivation | rows | ledger status | comparison |
|---|---|---|---|
| `unchanged` | 20 | `unchanged` (note `-`) | agree 20 |
| `moved` | 0 | — | — |
| `stale` | 0 | — | — |

`receipt.tsv` = 20 lines `sibling_ref<TAB>my-status<TAB>my-note<TAB>ledger-status<TAB>agree` + summary
`# AdjDrift04: 20 rows, 0 mismatches` (sha256 `22b894d4ea9a4d2d32206a061ecde5f892171dae774181fde29715c7339fe918`).
Every one of the 20 refs was found in the committed ledger by exact `sibling_ref` (absence would have been reported
as MISMATCH); no duplicate refs in the chunk, so no row was silently collapsed.

### Structural corroboration (independent of the line loop)

The two cited files are **blob-identical at pin and at the frozen delta head**, which forces `unchanged` for every row
on them:

```
git rev-parse  49096c7…:corpus/knowledge/2026-10-13-r4-08-observe-verbs.md   -> 46912a28b62fb2ee7ea74baa14266db8aa2343f7
git rev-parse  1ed29de…:corpus/knowledge/2026-10-13-r4-08-observe-verbs.md   -> 46912a28b62fb2ee7ea74baa14266db8aa2343f7
git rev-parse  49096c7…:corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md -> 9c79d113e5153075798ccbd1aed078dc270e7468
git rev-parse  1ed29de…:corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md -> 9c79d113e5153075798ccbd1aed078dc270e7468
```

`git diff --numstat <pin> <head> -- <each path>` → empty for both (pin 291 → head 291 lines; pin 979 → head 979 lines).
Lane-wide `git diff --stat pin head` = 4428 files changed — the kaidoku delta is real and large, but it does not touch
the two paths my chunk cites, so `unchanged` here is a verified fact rather than a default.

## Sensitivity controls (instrument is not a rubber stamp)

Run against the same code path, expecting a specific answer (`controls.txt`, commands appended to `commands.txt`):

| control | derived | expected | verdict |
|---|---|---|---|
| POS `SKILL.md:585` | `moved  verbatim at :748` | moved | PASS |
| POS `SKILL.md:621` | `moved  verbatim at :784` | moved | PASS |
| POS `SKILL.md:652` | `moved  verbatim at :815` | moved | PASS |
| CTRL `…-observe-verbs.md:198` | `unchanged -` | unchanged | PASS |
| NEG `…-observe-verbs.md:900` (beyond 291 lines) | `stale  pin line absent` | stale | PASS |
| NEG nonexistent path | `stale  pin file absent` | stale | PASS |

6/6 pass. The three `moved` relocations reproduce the ledger's `verbatim at :748/:784/:815` exactly and match the
claim text — i.e. the derivation genuinely reaches the `moved` class; the 20 `unchanged` rows are not a truncated code
path.

## Risks / limits (shape-only, no mitigation claimed)

1. **Class coverage inside the chunk is degenerate.** All 20 rows cite two files untouched by the delta, so chunk
   evidence alone cannot falsify the `moved`/`stale` classes or the "moved note names a verifying relocation line"
   leg of the C1 predicate. I supplied that sensitivity only as a control (3 known moves + 2 negatives); the
   independent `moved`/`stale` auditing must come from sibling chunks. A lane-wide 307-row pass is a separate seat,
   not this one.
2. `unchanged` equality is on trimmed text, matching the counter; it does not detect a line whose content is unchanged
   but whose surrounding block moved (irrelevant to the predicate, which is line+text based).
3. `pin line absent` here means "line index > line count" (or the file is shorter than 291/979); an empty cited line
   after trim would compare as `unchanged` against another empty head line — not exercised by these 20 rows (all cited
   lines are non-empty prose, as shown by the spot check of `:198`).
4. The ledger `note` column was compared semantically only for `moved` (relocation ref present); for the 20 rows here
   both sides carry `-`, so this leg was not exercised.
5. I did not run `scripts/check-adjacency.mjs`, `measure.sh`, or any committed counter (out of scope for a leaf in the
   editing wave; the parent owns gate execution). This receipt is method-level evidence, not a counter run.

## Tooling

No installs, no upgrades, no `pacman` (host-wide pause respected). Python 3 (system) + git only; no network.

## Scratch

`/fast/scratch/hyaku/tabi-r36/AdjDrift04/` created for the driver scripts and `TMPDIR`; deleted on exit. All retained
evidence lives in this seat dir: `receipt.tsv`, `commands.txt`, `controls.txt`, `report.md`.

No sibling repo, fleet-root file, or lane file outside my seat dir was written; every git invocation was read-only and
named an explicit `-C` path.

VERDICT ok — 20/20 chunk rows re-derived from git objects agree with the committed ledger (20 `unchanged`, 0 `moved`, 0 `stale`); 0 mismatches; instrument sensitivity proven 6/6 by controls.
