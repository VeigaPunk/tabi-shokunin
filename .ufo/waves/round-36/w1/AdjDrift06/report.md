# AdjDrift06 — C1 independent drift re-derivation (chunk of 20 rows)

Round tabi-36 attempt 1, wave w1. Seat: executor `AdjDrift06`. Milestone C1 (axis: adjacency).
Input chunk: `.ufo/waves/round-36/w1-chunks/AdjDrift06.tsv` (20 rows, format `sibling_ref<TAB>status<TAB>note`).
Frozen at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; claims read first (`.ufo/waves/round-36/claims.json`).
Derivation source: git objects only (`git show <rev>:<path>`), never the worktree.

## Result

**20 rows derived, 0 mismatches against the committed ledger** `corpus/adjacency-screen-drift.tsv`.

| derived status | rows |
|---|---|
| `unchanged` | 20 |
| `moved :N` | 0 |
| `stale` | 0 |

All 20 rows cite `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`; the frozen delta head for
`kaidoku` is `1ed29de2cdd6061315fb2f5478d5029b7d570675` (`baseline/c1-delta-pins.json`). Both commits resolve
(`cat-file -t` = commit) and the pin is an ancestor of the head (`merge-base --is-ancestor` exit 0).

Cited files (3 distinct, 20 cited lines):
- `corpus/knowledge/2026-10-14-r10-01-queue-ops.md` — lines 301, 302
- `corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md` — lines 3, 16, 17, 28, 45, 99, 161, 187, 196, 198, 220, 234
- `corpus/knowledge/2026-10-14-r11-01-queue-ops.md` — lines 1, 13, 30, 63, 68, 74

## Method (per row, spec order)

1. `git -C .../kaidoku-shokunin show 49096c7e…:<path>` → take line `<line>`, trim → CITED text.
2. `git -C .../kaidoku-shokunin show 1ed29de2…:<path>` → compare trimmed line `<line>`: equal → `unchanged`;
   else scan head for a line whose trimmed text equals CITED → `moved :N`; else `stale`. (Absent pin line →
   `stale: pin line absent`; absent head file → `stale: head file absent`.)
3. Match the row by `sibling_ref` in the committed ledger; compare status (and, for `moved`, the relocation line).

Trim = strip leading/trailing spaces, tabs, CR. Exact commands: `commands.txt`.

## Corroboration (independent route)

The three cited files are **byte-identical** between pin and head — pin blob == head blob for all three
(`394e175f7303`, `bd5b24d3bb81`, `1c93ddf213aa`; `git diff --stat <pin> <head> -- <paths>` empty). Blob
identity is a strictly stronger statement than trimmed-line equality, so `unchanged` for all 20 rows holds
under a second, independent derivation. Per-row pin/head cited-text sha256 pairs: `evidence.txt` (20/20 `EQ`).

**Positive control (non-vacuity of the moved branch).** My chunk contains no `moved` row, so the line-shift
branch was exercised against rows outside it: the three kaidoku `SKILL.md` rows the claim names resolve
verbatim at the frozen head — 585→748, 621→784, 652→815 — and ledger rows 6–8 record exactly
`moved / verbatim at :748 | :784 | :815`. The instrument therefore does detect relocation and does not
report `unchanged` by default.

## Ledger context

`corpus/adjacency-screen-drift.tsv`: 307 data rows, 0 duplicate `sibling_ref`, status split 304 `unchanged`
/ 3 `moved` / 0 `stale`. All 20 chunk refs are present in the ledger (none missing). The 3 `moved` rows are
the kaidoku `SKILL.md` relocations above, consistent with the C1 surface sentence ("307 screen rows cite
drifted lanes … 3 kaidoku rows' cited lines moved verbatim (SKILL.md 585->748, 621->784, 652->815); 0 stale").

## Limits / disclosures

- My chunk covers one lane (`kaidoku`), one status class (`unchanged`), and three files that did not change
  between pin and head. It confirms 20/307 ledger rows; it does not sample the `moved` or `stale` classes,
  and it cannot speak for the other 11 drifted lanes or the empty post-pin delta pool. Those remain wave-2
  attack surface. This is a coverage observation, not a mismatch.
- Note-format difference (no effect here): my `moved` notes are rendered `:N` per the seat spec, whereas the
  ledger writes `verbatim at :N`. Status equality is what was compared; no chunk row is `moved`.
- No pacman, no git mutation, no network, no installs. Scratch `/fast/scratch/hyaku/tabi-r36/AdjDrift06/`
  created and deleted; writes confined to `.ufo/waves/round-36/w1/AdjDrift06/` and `.ufo/waves/round-36/w1/AdjDrift06.md`.

## Seat files

- `receipt.tsv` — 20 rows: `sibling_ref / my-status / my-note / ledger-status / agree|MISMATCH`, plus
  summary `# AdjDrift06: 20 rows, 0 mismatches`.
- `commands.txt` — exact per-row git/awk commands plus the corroboration and control commands.
- `evidence.txt` — per-row pin/head cited-text sha256 pairs and the three blob-id pairs.

VERDICT ok 20/20 rows re-derived from git objects at pin 49096c7e6f226af0c750c4b003be58883cb6049f and frozen delta head 1ed29de2cdd6061315fb2f5478d5029b7d570675 (all unchanged, corroborated by blob identity), every status equal to the committed ledger corpus/adjacency-screen-drift.tsv; 0 mismatches; moved branch positively controlled on the 3 SKILL.md relocations outside my chunk.
