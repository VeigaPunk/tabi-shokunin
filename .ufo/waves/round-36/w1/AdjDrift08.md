# AdjDrift08 — independent C1 drift re-derivation (kake, 20 rows)

Seat: AdjDrift08 (leaf executor, C1 drift-verification chunk).
Input chunk: `.ufo/waves/round-36/w1-chunks/AdjDrift08.tsv` (20 rows, single lane: kake-shokunin).
Pin (cited revision, per row): `044048597d62f3199494b63b36e90dd57825e350`
Frozen delta head for kake (`.ufo/waves/round-36/baseline/c1-delta-pins.json`): `437f53b1f6cd22dbf307f1187f41d1c0850a1ac2`
Committed ledger compared against: `corpus/adjacency-screen-drift.tsv` (worktree bytes identical to the frozen revision `2e7b7a89…`; sha256 `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`).
Method: git objects only (`git show <rev>:<path>`), no worktree reads of the lane repo, no mutation. Derivation script kept verbatim at `derive.sh`; exact commands at `commands.txt`.

## Result

20 rows derived, 20 agree with the committed ledger, **0 mismatches**. All 20 are `unchanged`.
Summary line in `receipt.tsv`: `# AdjDrift08: 20 rows, 0 mismatches`.

Status distribution derived: unchanged 20, moved 0, stale 0.

| path | cited lines | derivation |
|---|---|---|
| SKILL.md | 131, 160, 367, 424, 431, 432, 433, 519, 520, 521, 696 | unchanged ×11 |
| corpus/knowledge/drift-detection.md | 53 | unchanged |
| corpus/knowledge/field-performance-cwv.md | 66, 76, 134 | unchanged ×3 |
| corpus/knowledge/fleet-registry.md | 51, 66, 111, 112 | unchanged ×4 |
| corpus/knowledge/free-read-verbs.md | 217 | unchanged |

## Why "unchanged" is an observation, not a default

1. Per-row raw (untrimmed) byte equality of the pin line and head line was asserted separately from the trimmed comparison: 20/20 `identical-raw`, 0 `RAWDIFF` (`evidence/rows-cited.txt` carries pin text, head text and the equality flag for every row).
2. `git merge-base --is-ancestor` confirms the pin is an ancestor of the delta head, so "unchanged" means "survived a real interval", not "head == pin".
3. Hunk positions corroborate the equality, i.e. no cited line can have shifted or been rewritten (`evidence/pin-to-head-hunks.txt`): the kake interval changes only `SKILL.md` (88+/10-, hunks at 213, 1215-1216, 1233-1234, 1254, 1273-1276, plus an append at 1281-1358). Every cited SKILL.md line (131 … 696) falls outside all of those hunks. The four other cited files are byte-identical over the interval (0+/0-), so their cited lines cannot have moved or gone stale.
4. Coverage/identity guards: every chunk `sibling_ref` occurs in the ledger (0 missing), the ledger holds no duplicate `sibling_ref`, and each chunk lane row maps to kake's frozen head rather than a stale or invented pin.

Nearest changed line to a cited row: `SKILL.md:213` (one-line replacement, same-numbered, so no downstream shift). No cited row sits at or after it in the changed span until 1215; the cited block 424-433 and 519-521 is untouched.

## Evidence files (this seat dir)

- `receipt.tsv` — 20 rows: `sibling_ref \t my-status \t my-note \t ledger-status \t agree|MISMATCH`, then the summary line.
- `commands.txt` — exact read-only git commands and the ledger lookup.
- `derive.sh` — the derivation script, verbatim.
- `evidence/rows-cited.txt` — per row: pin line text, head line text, raw-equal flag.
- `evidence/pin-to-head-hunks.txt` — per cited path numstat pin..head and all `-U0` hunk headers.

## Scope limits (stated, not worked around)

- This chunk is kake-only and covers 20 of the 51 kake rows in the ledger; the other kake rows and the other 11 drifted lanes belong to sibling seats. Nothing here should be read as a statement about them.
- Only statuses were derived. The delta leg (post-pin added browser-ground lines) and the `delta.unaccounted` / `delta.screenFindings` counters are outside this seat's item and were not evaluated.
- Tooling: no installs or upgrades were needed (git, awk, coreutils only; pacman untouched).
- The intermediate "head file absent" pass seen in my first run was my own parsing bug (a leading space in the JSON value broke `<rev>:<path>`), fixed before any record was written; the buggy output was discarded, never written to the seat dir, and the fix changed the conclusion for every row. Recorded here so the parent can see the derivation was not one-pass.

VERDICT ok 20/20 rows agree with the committed ledger (kake @044048597d62f3199494b63b36e90dd57825e350 → head 437f53b1f6cd22dbf307f1187f41d1c0850a1ac2); 0 mismatches, 0 moved, 0 stale derived.
