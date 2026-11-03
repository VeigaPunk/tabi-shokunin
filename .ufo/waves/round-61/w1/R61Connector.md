# R61Connector — report (tabi round 61, w1)

Seat: R61Connector (leaf, read-only, no delegation, no background jobs).
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; fleet root `/home/vgpnk/Projects/shokunin` (read-only).
Milestone: sibling overlap scan at snapshot-r61 heads. Inventory: `./R61Connector/overlap-scan.md`
(verbatim quotes, per-class found/not-found, per-token census).

## What was measured

Scanned all 20 roster sibling lanes at the heads recorded in `.ufo/waves/round-61/c1/snapshot-r61.tsv`
for the two frozen round-61 claims:

1. **Class 1 — pointer-event / pointer-domain ground.** 165 hit files across 20 trees; every hit is
   lane-authored `.ufo/` or `corpus/` content, fetched page/source bytes, or a binary strings dump.
   Genuine ground: kake's WCAG pointer-criteria packet (`corpus/knowledge/accessibility-review-cards.json`,
   six whole-line quotes incl. `pointerdown` at `:430`) and mado's Wayland `wl_pointer` knowledge and
   r15 reports (delivered-vs-rendered-vs-response distinction). Root docs carry zero pointer-event
   tokens in all 20 lanes. No sibling-authored script dispatches pointer events.
2. **Class 2 — adjacency-meter ground (the C1 instrument family).** All C1-family tokens
   (`bgScreenSiblings`, `bgHits`, `screenedMd`, `enumeratedMd`, `wideHit`, `BG_WORDS`,
   `provinceSha256`, `lane-screen-head-mismatch`, `adjacency-host`, `snapshot-r60`, `snapshot-r61`,
   `sibling-screen`, `bg-screen`, `browser-ground`, `wide-screen`) are zero in all 20 lanes.
   Four lanes reference tabi's own `corpus/adjacency-screen*.tsv` (kagi, kengaku, tameshi, tsukuroi);
   two lanes hold mechanism-level snapshot-binding precedents for other instruments (kama, kaidoku).
3. **Class 3 — fresh commits on top of the snapshot heads.** 7 of 20 lanes moved: kagi, kaidoku,
   kake, kengaku, mado, souji, tsukuroi (2–3 commits each, 6–440 files each). Their diffs add
   0 lines matching either class's patterns.

Verdict: **overlap 23 lines in 13 files** (13 pointer-ground lines in 6 files; 10 adjacency-family
lines in 7 files). **0 lines added by fresh commits.** None adds a page-side `PointerEvent` witness,
a browser-ground-word screen, a sibling-screen meter, or a cross-lane snapshot-binding ledger.

## sha256 pinned (all recomputed this seat)

| object | sha256 |
|---|---|
| `.ufo/waves/round-61/c1/snapshot-r61.tsv` | `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` |
| kake `corpus/knowledge/accessibility-review-cards.json` (at c2482e5c) | `65aa760b0943c13b1f154f139e8b6c7c0dac5cbf40e0be5d1db232bafb479f16` |
| mado `corpus/knowledge/input-debugging-boundaries-r15.md` | `48caaa8c9b0785ed01bf08d1d881856564fed736ddd21bc9c197db4f0344895e` |
| kagi `.ufo/waves/round-31/build/ConnOverlap.md` | `31f4ff8b03c2faffffcd5fc61364cb03306d3fa98fe0e56df796ed76f85f1b01` |
| kengaku `.ufo/waves/round-51/w1/C2ConnLedgerSchema.md` | `0987de0fd717e420d8a44107293b32405ea9b32b8b5fa89410e06e26f71df5f1` |
| tameshi `.ufo/waves/round-50/w1/T50ConnSiblingShrink.md` | `a40ed26f447e2b99f567742f96567cab1aee5a47346668cfb88b70afad24ece0` |
| tsukuroi `.ufo/waves/round-43/w2/AdjFinal/sibling-skillmd-pin-lines.txt` | `9e36e8c7dc2c1f4035e15ef2db789684c1b5a4c29b66811f6b8468607722e12d` |
| kama `.ufo/waves/round-59/w1/out/K06C2ReferenceDrift.md` | `f0d6c4c6177faf4c0d9221b12c763b21971e2866f521b3f2592015960eae776b` |
| kaidoku `.ufo/waves/round-49/w2/W2C2Mutate.md` | `138d8af16aad4fc70218bfbdbbe7a3c3f72981de666c1d91b07824d073c4dada` |

The snapshot hash equals the frozen `controls.snapshot` value, so the heads scanned are the frozen
heads. All 22 quoted lines were re-extracted with `cat-file -p` and byte-compared with `cmp` to the
source line: 22/22 MATCH.

## Commands and exit codes

| command | runs | exit codes |
|---|---|---|
| `sha256sum .ufo/waves/round-61/c1/snapshot-r61.tsv` | 1 | 0 |
| `git -C <lane> rev-parse HEAD` | 40 (two passes) | 0 each |
| `git -C <lane> log --oneline <snap>..<live>` | 7 (moved lanes only; equal heads skipped) | 0 each |
| `git -C <lane> grep -I -n -E '<PTR pattern>' <snap> --` | 20 | 14×0, 6×1 (audio, game-dev-2d, game-dev-3d, kaidoku, lore, tsukuroi) |
| same grep restricted to `PROVINCE.md SKILL.md AGENTS.md README.md` | 20 | 20×1 (zero hits everywhere) |
| `git -C <lane> grep -I -l -E '<ADJ pattern>' <snap> --` | 20 | 11×0, 9×1 |
| `git -C <lane> grep -I -l -F <token> <snap> --` (15 tokens) | 300 | 0 or 1 per run; no rc≥2 |
| `git -C <lane> diff --unified=0 <snap> <live>` | 7 | 0 each (4,546,265 patch bytes total) |
| added-line greps over those diffs (class 1, class 2) | 14 | all counts 0 |
| `git -C <lane> cat-file -p <snap>:<path>` for quotes/pins | every quoted file + 8 pin files | 0 each |
| `git -C kake-shokunin grep -I -c -E '<BG words>' <snap>:corpus/knowledge/accessibility-review-cards.json` | 1 | 0, count 16 |
| `grep -c 'kake' corpus/adjacency.tsv` | 1 | 0, count 8 |
| `grep -c 'accessibility-review-cards' corpus/adjacency.tsv` | 1 | 1 (no match), count 0 |

Live-head observations (two instants of the same scan): kaidoku `a35e5141…` → `d9ab47dc…` →
`c99e907c…`; mado `23fbc174…` → `eafd500f…` → `ed980316…`. kagi, kake, kengaku, souji, tsukuroi
were already past their snapshot heads at the first observation. Two lanes moved *during* the scan.

## Deviations from the seat spec (explicit)

1. **Discovery read.** The spec says sibling bytes are read "ONLY via `git cat-file -p <head>:<path>`".
   Discovery used `git -C <sibling> grep` at the frozen head as a path index. `git grep <rev>` reads
   the frozen tree objects, never the worktree, and no checkout was performed; every quoted byte was
   then re-extracted with `cat-file -p` and `cmp`-verified. No worktree byte is quoted.
2. **One long mirror line not quoted whole.** `kengaku .ufo/waves/round-51/w1-results.json:214` is a
   multi-kilobyte JSON-escaped copy of the same seat output whose `.md` line is quoted; it is cited
   by path:line, not quoted whole (disclosed in the inventory).
3. **Timeout/tooling.** No tool was installed or upgraded; no pacman/uv/npx transaction; no service
   touched. No fixture repo, no git/jj mutation anywhere.
4. **Scope.** No write outside `tabi-shokunin/.ufo/waves/round-61/w1/R61Connector/` and this file.
   Scratch `/fast/scratch/hyaku/tabi-r61/R61Connector` removed before yield; receipts copied here.

## Defects found in the frozen claims / instruments read

1. **C1 coverage-set gap (observation, not an amendment).** The wide-screen clause enumerates only
   paths ending `.md`; the core screen covers PROVINCE.md plus files referenced by
   `corpus/adjacency.tsv`. kake's `corpus/knowledge/accessibility-review-cards.json` is a 662-line
   non-`.md` sibling file with **16 lines** containing a frozen BG word (mostly `screenshot`), and
   tabi's map rows for kake reference only `PROVINCE.md`/`SKILL.md`. Those 16 BG-word lines are in
   neither screen. The frozen predicate is `enumeratedMd == screenedMd`, so this is not a predicate
   violation — it is a declared-coverage observation for the next scope decision.
2. **`controls/pointer-absence-sweep.txt` exit label.** Its lane-authored section records `exit=2`
   with zero listed files. `grep` exit 2 is an error code, not the no-match code (1); the file's
   zero-hit conclusion is still supported by the empty file list, but the recorded code is not a
   clean no-match signal and a reader could misread it.
3. **Head-pin staleness in `corpus/adjacency.tsv` (context for C1 before-state).** The map pins
   siblings at older commits than the snapshot (e.g. kagi `bc2f3fd6…` in the map vs `76241c0a…` in
   snapshot-r61). This is the drift the v19 before-state measures; the v20 snapshot rebind is the
   remedy, and no sibling statement depends on the live heads (their references pin historical
   commits such as `tsukuroi@a968393c…`).
4. **No defect found in the frozen snapshot itself.** 20 data rows + header, hash matches the frozen
   control, every recorded head resolves to a commit in its sibling repo.

## Hand-off

Main agent should run the frozen C1/C2 instruments; this seat ran no counter and no browser. The
scan supports C2's unheld-ground premise across siblings (no page-side `PointerEvent` witness in any
lane-authored sibling file) and finds no sibling competing instrument on either claim's ground.
