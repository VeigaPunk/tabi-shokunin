# Receipt — round 30 w1, seat ScribeUsedBy23 (routed defect 1: `used-by` omission)

Frozen revision: `061e62024c0523d3c6c7e819506a773ff2cd7d75` (lane `tabi-shokunin`, branch `master`).
Scratch clone: `/fast/scratch/hyaku/tabi-r30/ScribeUsedBy23/clone` (`git clone --shared`,
`git rev-parse HEAD` = the frozen revision, `git status --porcelain` = ` M corpus/SOURCES.md` only).
Environment: linux 7.2.11-arch1-1, node v24.21.0, GNU bash 5.3.20. Timestamps UTC.

No tool install or upgrade was performed (nothing was needed); no network fetch was needed — this
defect is registry bookkeeping over already-committed bytes, so no URL/status/byte-count/sha256
fetch record exists to make.

## Commands and exit codes

| # | command | exit | reading |
|---|---|---|---|
| 1 | `git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75` | 0 | clone at the frozen revision |
| 2 | `TMPDIR=$S/tmp node scripts/check-sources.mjs` (clone, pre-edit) | 0 | `SOURCES_GATE verdict=clean rows=115 … findings=0` |
| 3 | 23 × in-place `used-by` edits in `corpus/SOURCES.md` | — | 19 appends after `, `, 4 `—` sentinels replaced by the single path |
| 4 | `git -C "$S/clone" diff 061e62024c0523d3c6c7e819506a773ff2cd7d75 -- corpus/SOURCES.md > usedby.patch` | 0 | 68481 B, sha256 `e6dcda397a109051786a9432dbaa256a5ed0053283eed66f09e9c084b68a38d1` |
| 5 | `TMPDIR=$S/tmp node scripts/check-sources.mjs` (clone, post-edit) | 0 | `SOURCES_GATE verdict=clean rows=115 tiers=A:100,B:6,C:9 status=queued:19,mined:87,rejected:9 findings=0` |
| 6 | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/clone/corpus/SOURCES.md"` | **0** | `ok <path>` plus the same 18 pre-existing `W04` warnings as baseline; warnings do not change the exit status |
| 7 | `bash …/sources-census.sh validate --file "$B/corpus/SOURCES.md"` (`$B` = `git archive 061e620… corpus/SOURCES.md corpus/knowledge corpus/lessons \| tar -x`) | 0 | baseline reading for comparison: `ok` + the same 18 `W04` lines; `diff` of the two path-normalised outputs is empty |
| 8 | `TMPDIR=$S/tmp node scripts/check-sources.mjs --root "$B" --file corpus/SOURCES.md` (baseline tree) | 0 | `verdict=clean rows=115 … findings=0` |
| 9 | cell-integrity check over the `-U0` diff (`verify-cells.txt`) | 0 | `changed_rows=23 non_usedby_cell_violations=0` |
| 10 | `git -C "$A" apply --check usedby.patch` then `git apply` in a fixture repo `$A` seeded with `git show 061e620…:corpus/SOURCES.md` | 0 / 0 | patch applies cleanly to the frozen bytes; result sha256 `f6388fd4…5124`, identical to the clone |

Caveat on #7/#8: `sources-census.sh validate --file` resolves `used-by` paths against the registry's
parent tree (E11). Pointing it at a file whose sibling `corpus/knowledge/` does not exist yields E11
on every row and exit 1 — a property of the comparison tree, not of the registry. The baseline tree
used for #7/#8 is therefore an extraction of `corpus/SOURCES.md`, `corpus/knowledge/` and
`corpus/lessons/` at the frozen revision.

Patch prefixes: the host-global git config (`/home/vgpnk/.config/git/config`) sets
`diff.mnemonicPrefix=true`, which would emit `c/`/`w/` headers; the delivered patch is regenerated
with `git -c diff.mnemonicPrefix=false diff`, so it carries the standard `a/`/`b/` prefixes and
applies with plain `git apply` (`-p1`) at the lane root. Patch byte length is unchanged (68481 B);
only the three header lines differ.

## Digests

| file | bytes | sha256 |
|---|---|---|
| `corpus/SOURCES.md` at 061e620 (baseline) | 101566 | `ed29d04e7ad048375528dd6cdf32cc07ee52bd2355a9e52c77cbc01943f6d85d` |
| `corpus/SOURCES.md` patched | 102788 | `f6388fd4a78a0c9205d4c1fbd2b5a6c2ee6125e1200ac9724b29e20880dd5124` |
| `usedby.patch` | 68481 | `e6dcda397a109051786a9432dbaa256a5ed0053283eed66f09e9c084b68a38d1` |

Row count 115 before and after; status tally `queued:19,mined:87,rejected:9` identical before and
after (no `status` or `recheck` cell touched).

## Coverage after the patch

All 31 ids named on `corpus/knowledge/chromium-156-release-pin-recheck.md:3` list the entry in
`used-by`: `S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096
S097 S098 S099 S100 S105 S106 S108 S109 S110 S111 S112 S113 S114 S115`. No row lists it twice
(`awk` `gsub` count over column 12: 0 rows with n>1).

## Files in this directory

`usedby.patch` (the deliverable patch, relative to `corpus/SOURCES.md` at 061e620) ·
`usedby-log.md` (the `id | used-by old → new` table for the round lesson) ·
`usedby-rows.md` (machine-generated table rows, same content) ·
`census-validate-patched.txt` · `census-validate-baseline-tree.txt` ·
`check-sources-patched.txt` · `check-sources-baseline.txt` ·
`verify-cells.txt` · `sha256.txt`.
