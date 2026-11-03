# R60Exec1 — C1 wide adjacency screen counter

Round 60, wave w1 (the only wave). Lane root /home/vgpnk/Projects/shokunin/tabi-shokunin.
Authority: `.ufo/waves/round-60/claims.json` C1 (statement, before, after, kill K1-K7,
mutantsC1 M1-M5). No predicate, kill rule or mutant list was changed. Nothing was committed.

## Deliverable (frozen at authoring)

- `.ufo/waves/round-60/counters/c1-wide-screen-r60.mjs`
  sha256 `ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920`, 841 lines,
  node ESM, no npm deps, executable.
- `.ufo/waves/round-60/controls/c1-scope-map-at-freeze.json`
  sha256 `50faa261783c17a33619a44273197ced19698edaa1d9a7bb6b463a130575df02` (PREfreeze control run).
- `.ufo/waves/round-60/c1/wide-screen-prefreeze-r60.json`
  sha256 `da36b04090102fcdfaeaec1a7ec5dec99036c775507ae137537798dc330092d1` (PREfreeze wide run).

Snapshot `.ufo/waves/round-60/c1/snapshot-r60.tsv` sha256
`9480fb74465beda3c88d0914591156e82a9d063f98d93ef80616f58bf8046420` (20 rows,
header `lane<TAB>head`). Map bytes `git show 67d6f70e:corpus/adjacency.tsv` sha256
`39a04a3c516ffefb296ac64665f481f240d95ae024394dfe631a4a754c35b309`.

## Behaviour (as authored; no data-dependent change)

CLI: `--scope wide|map --snapshot <tsv> [--fleet <root>] [--verify-rows <tsv>]
[--rows-out <tsv>] [--json] [--map-file <tsv>] [--map-rev <rev>] [--map-repo <dir>]`,
`--selftest`. Exit 0 = predicate true, 1 = evaluated and false, 2 = could not evaluate
(missing/invalid `--scope`, bad snapshot header, unreadable snapshot/map/rows file).
`--scope` has NO default: the round-59 map scope is the do-nothing control, not a fallback.

- Heads: `git -C <fleet>/<lane> cat-file -t <head>` must print `commit`; otherwise
  `counts.unresolvableHead++` and the predicate is false (M4).
- Enumeration: `git ls-tree -r -z --long <head>`, blobs whose path ends in the bytes `.md`
  (path set identical to `--name-only`; `--long` adds mode/size for symlink detection and
  chunking). Gitlinks are not blobs and are not enumerated.
- Bytes: `git cat-file blob <head>:<path>`, batched as `cat-file --batch` (chunks bounded by
  800 files / 48 MiB) with a one-file argv fallback for paths containing CR/LF. The worktree is
  never read and no checkout happens (M3). A symlink entry named `*.md` is enumerated when git
  lists it; its screened bytes are the blob git stores for the path (the link target string),
  never the linked file.
- sha256 over RAW blob bytes. Lines = LF count + 1 iff the final line is unterminated; an empty
  blob is 1 unterminated empty line — exactly v19's `text.replace(/\n$/, '').split('\n').length`.
- Hits: v19's `BG_WORDS` array copied verbatim from `c1-adjacency-host-v19.mjs:83`; a line is a
  hit when its lowercase text (one trailing CR stripped) contains any word; one hit per line.
- `scope=map` mirrors v19 `verify()` (d): every roster lane starts with `{PROVINCE.md}` and each
  9-column map row whose col-3 ref parses as `<lane>@<rev>:<path>:<line>` adds `path` to that
  roster lane's set (the ref's own rev is ignored; the snapshot head is the byte authority).
  Map-scope counts are intersected with the `.md` enumeration, so `screenedMd`/`unscreenedMd`
  always partition `enumeratedMd`. Non-`.md` map targets stay in the v19 meter's screen only.
- Predicate (one expression for both scopes): `screenedMd == enumeratedMd AND unscreenedMd == 0
  AND unresolvableHead == 0 AND roster == 20 AND rowMismatch == 0`. At `scope=map` it is expected
  false. `rowMismatch` is 0 when `--verify-rows` is absent (vacuously) and otherwise counts rows
  whose sha256/lines/bgHits do not re-derive at the recorded head, whose path is not in the
  lane's `.md` enumeration, or whose lane is not in the snapshot. (The seat item's one-line
  predicate summary lists the first four conjuncts; `rowMismatch` is included here because the
  frozen claim statement in claims.json C1 names `counts.rowMismatch == 0` as part of the same
  predicate. The wider reading was chosen; it can only make the run stricter.)
- `perLane` carries lane-level aggregates (head, headResolvable, enumerated/screened/unscreened,
  hit files/lines, blobReadErrors, first five unscreened paths). Per-file rows are the
  `--rows-out` receipt, so the JSON receipt stays small (7 KB wide, 12 KB map).
- `--rows-out` writes `lane, path, sha256, lines, bgHits` (escaped: backslash first, then
  `\t \n \r`); `--verify-rows` decodes before re-deriving. This was added after a real-data
  run refused a tracked path with an embedded newline; see below. No file is dropped.

## Selftest

`node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --selftest` → exit 0,
`allPass true`, **17/17 cases**. Fixtures are built only under `$TMPDIR` (a 20-lane fleet in a
`mktemp -d` dir; `roster == 20` is pinned, so a smaller fixture could not show `scope=wide`
green), removed in a `finally`; every fixture git call names `-C <D>` and asserts
`rev-parse --show-toplevel` equals the fixture dir before the first commit.

Cases: `wide-green-25`, `nested-md-screened`, `space-and-nonascii-path`,
`newline-path-roundtrip`, `symlink-md-screened-as-blob`, `wide-hit-counts`,
`map-red-on-unreferenced-nested-md`, `verify-rows-genuine`, `forged-row-sha`,
`forged-row-lines`, `forged-row-hits`, `forged-row-path-not-enumerated`,
`worktree-differs-from-head`, `unresolvable-head-refused`, `missing-scope-exits-2`,
`invalid-scope-exits-2`, `bad-snapshot-header-exits-2`.

Mutant mapping: M1 → wide-green-25 + nested-md-screened (exact count 25 and the nested rows
must exist); M2 → three forged-row cases (sha / lines / hits each forced to `rowMismatch == 1`,
predicate false, exit 1); M3 → worktree-differs-from-head (worktree rewritten after commit must
not change the reported head sha/hits); M4 → unresolvable-head-refused
(`unresolvableHead == 1`, predicate false, other lanes still enumerated); M5 →
missing-scope-exits-2 (+ invalid-scope-exits-2); K4 path coverage → forged-row-path-not-enumerated.

## Pre-data runs (PREfreeze; before the instrument freeze commit)

Run from the lane root, exactly the frozen before command:

1. `--scope map --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --json` → **exit 1**,
   predicate false, `enumeratedMd 85598`, `screenedMd 25`, `unscreenedMd 85573`,
   `unresolvableHead 0`, `roster 20`, `wideHitLines 141`, `wideHitFiles 15`, `blobReadErrors 0`.
   25 = 20 `PROVINCE.md` + 5 map-referenced extras (kaidoku 2, kake `SKILL.md`, kama
   `corpus/knowledge/listener-census.md`, kumitate `SCORECARD.md`). This is the do-nothing
   control: red, `unscreenedMd > 0`, as frozen.
2. `--scope wide --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --json` → **exit 0**,
   predicate true, `enumeratedMd 85598`, `screenedMd 85598`, `unscreenedMd 0`,
   `unresolvableHead 0`, `rowMismatch 0`, `roster 20`, `blobReadErrors 0`,
   **`wideHitLines 19049`, `wideHitFiles 6129`**. Run twice → byte-identical JSON (no timestamp).
   Per-lane totals in the receipt (largest hit sets: kake 7703/1462, game-dev-2d 2229/863,
   game-dev-3d 1945/460, kaidoku 1993/531, mado 1032/657).
3. Wide-set hits vs map-scope hits at this snapshot: 19,049 − 141 = **18,908 hit lines are
   outside the v19 map screen**. (Round 59 recorded 18,869 at its own snapshot; that number is
   lineage, not reused here.)

Real-data K4 evidence (scratch only, not a lane artifact): `--rows-out $TMPDIR/rows.tsv` then
`--verify-rows $TMPDIR/rows.tsv` over the same snapshot → **rowsChecked 85598, rowMismatch 0,
rowsMissing 0**, rows file 85,599 lines (header + 85,598), every line 5 fields. The live snapshot
contains 3 tracked `.md` paths with an embedded newline (all in `souji-shokunin`:
`.ufo/waves/round-26/.../r/nl/first<LF>second.md` and two siblings); they are enumerated, read
through the one-file fallback, escaped in the rows file and decoded by `--verify-rows`.

Wall time: wide pass 12.6 s, max RSS 417 MB, 103% CPU. Disk checked before the pass:
404 GB free on /fast; `disk-guard.sh` was not on PATH (unavailable), so no disk-guard verdict.

Independent reviewer reconciliation (R60Reviewer A1, uncommitted message): a naive
`git ls-tree -r --name-only <head> | grep -c '\.md$'` gives 85,594, i.e. 4 fewer than this
counter's 85,598; the delta is 1 CJK-quoted path in `kengaku-shokunin` plus the 3 literal-newline
filenames in `souji-shokunin`, which line-mode output quotes even with `core.quotepath=false`.
The NUL-delimited `ls-tree -r -z` form used here is required; after that correction the
reviewer's per-lane counts match at every lane. The reviewer also re-ran `scope=wide` at the
earlier instrument bytes (2757978a) and reproduced the same prefreeze numbers (85,598 / 85,598 /
0, 19,049 hit lines, 6,129 hit files).

## Risks / notes for the integrator

- **`rowMismatch` is vacuous unless `--verify-rows` is supplied.** The predicate is true with
  `rowMismatch 0` when no rows file is given. For the data pass to exercise K4, run:
  `node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot
  .ufo/waves/round-60/c1/snapshot-r60.tsv --rows-out <rows.tsv> --json` followed by the same
  command with `--verify-rows <rows.tsv>` (or one invocation with both, which writes and
  verifies independently). Measured cost: ~12 s per pass.
- The two receipts above are PREfreeze runs. The L1 must commit the counter code only, record the
  sha256, and only then run the data pass at the DATA-REV (`--scope wide ... >
  .ufo/waves/round-60/c1/wide-screen-data-r60.json`), per C1 `after`.
- I did not run the v19 map meter (K7 is the L1's data-rev command) and did not run any lane
  build/lint/test suite or formatter. v19 and every other counter are untouched.
- Mutants M1-M5 were not executed by me; they are R60MutC1's copies. My selftest asserts the
  kill conditions and the exact counts a mutant would move.
- Wide hits are reported only as counts plus per-file `bgHits`; adjudication of the hit lines is
  the named residual and stays out of this claim.
- No tool was installed or upgraded. No commit, no push, no sibling write.

## Files not written by me

`corpus/`, `claims.json`, `MANIFEST.json`, `.ufo/state/`, sibling lanes: untouched. Scratch
`/fast/scratch/hyaku/tabi-r60/R60Exec1/` was removed by the trap at the end of each shell.
