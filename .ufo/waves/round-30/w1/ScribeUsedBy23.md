# ScribeUsedBy23 — round 30 w1: routed defect 1 (`used-by` omission for the 156 recheck entry)

**Verdict.** The defect is closed in a patch that changes nothing but `used-by` cells:
`corpus/knowledge/chromium-156-release-pin-recheck.md:3` names 31 S-ids, and its 23 re-opened rows
(`S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096 S097 S098
S099 S100 S105 S106`) now each list the entry; the remaining eight on that line (`S108`–`S115`)
already did and are byte-identical. Exactly 23 lines changed, 19 by appending
`, corpus/knowledge/chromium-156-release-pin-recheck.md` after the existing path and 4 (`S080`,
`S081`, `S093`, `S098`) by replacing the empty sentinel `—` with the single path, which is the form
CORPUS rule 2 permits ("Only `status`, `recheck` and `used-by` change in place, and each change is
logged old→new in the round lesson" — `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:49-51`). Every
non-`used-by` cell was verified byte-identical over the diff, the lane's own structural gate reads
`verdict=clean rows=115 findings=0`, and the fleet census on the patched clone exits **0** with the
same 18 pre-existing `W04` warnings as the baseline tree. One consequence needs a follow-up the
patch does not make: the entry's own text still says "S080 and S081 have no citing knowledge
entry", which this patch falsifies (finding F1 below).

## Environment and provenance

- Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; frozen revision
  `061e62024c0523d3c6c7e819506a773ff2cd7d75` (verified with `git rev-parse HEAD` in the clone).
- One scratch clone: `/fast/scratch/hyaku/tabi-r30/ScribeUsedBy23/clone`
  (`git clone --shared … && git checkout -q 061e620…`; `git status --porcelain` = ` M corpus/SOURCES.md`).
- TMPDIR/`--work` under `$HYAKU_SCRATCH/tabi-r30/ScribeUsedBy23/`. Nothing was written under the
  fleet root, the lane tree, the lane index or jj state; no lane tracked file was edited in place —
  the change leaves as `usedby.patch`.
- No tool install/upgrade; no network fetch. This defect is registry bookkeeping over already
  committed bytes (`corpus/evidence/round-29/release-pins/`), so there is no URL/HTTP-status/byte-count
  /sha256 fetch record to produce, and none is claimed.

## Evidence (commands, exit codes)

Run inside `$S/clone` unless stated; `$S=/fast/scratch/hyaku/tabi-r30/ScribeUsedBy23`.

| command | exit | observed |
|---|---|---|
| `TMPDIR=$S/tmp node scripts/check-sources.mjs` (pre-edit) | 0 | `SOURCES_GATE verdict=clean rows=115 tiers=A:100,B:6,C:9 status=queued:19,mined:87,rejected:9 findings=0` |
| 23 × in-place `used-by` edit (unique anchors, each `grep -cF` pre-checked to 1) | — | 23 rows changed, 0 collateral |
| `git diff 061e620… -- corpus/SOURCES.md > usedby.patch` | 0 | 68481 B, sha256 `e6dcda397a109051786a9432dbaa256a5ed0053283eed66f09e9c084b68a38d1`; `1 file changed, 23 insertions(+), 23 deletions(-)` |
| cell-integrity check over `git diff -U0` (`verify-cells.txt`) | 0 | `changed_rows=23 non_usedby_cell_violations=0` — columns 1–11 and 13 byte-identical on every changed line; each used-by transition is either `old + ", corpus/knowledge/chromium-156-release-pin-recheck.md"` or `—` → the single path |
| `TMPDIR=$S/tmp node scripts/check-sources.mjs` (post-edit) | 0 | `verdict=clean rows=115 … findings=0` (identical tally) |
| `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$S/clone/corpus/SOURCES.md"` | **0** | `ok <path>` + 18 `W04` duplicate-URL warnings (`S058 S065 S066 S068 S069 S070 S073 S074 S075 S076 S077 S095 S096 S098 S099 S100 S114 S115`) |
| same census on the baseline tree `$B` (`git archive 061e620… corpus/SOURCES.md corpus/knowledge corpus/lessons \| tar -x`) | 0 | `ok` + the same 18 `W04` lines; `diff` of path-normalised outputs empty → the patch adds and removes no finding |
| `node scripts/check-sources.mjs --root "$B" --file corpus/SOURCES.md` | 0 | `verdict=clean rows=115 … findings=0` |
| `git apply --check` + `git apply` of `usedby.patch` in a fixture repo seeded with `git show 061e620…:corpus/SOURCES.md` | 0 / 0 | applies cleanly to the frozen bytes; result sha256 `f6388fd4a78a0c9205d4c1fbd2b5a6c2ee6125e1200ac9724b29e20880dd5124`, identical to the clone |

Coverage check after the patch: all 31 ids on the entry's `source:` line list the entry, and no row
lists it twice (`awk -F'|'` count over column 12: 0 rows with n>1). Byte/digest pair:
baseline `ed29d04e7ad048375528dd6cdf32cc07ee52bd2355a9e52c77cbc01943f6d85d` (101566 B) →
patched `f6388fd4…5124` (102788 B), +1222 B, row count 115 → 115.

`corpus/SOURCES.md` lines touched: 47, 48, 55, 56, 59, 76, 78, 85, 88, 91–95, 107, 108, 110–114,
119, 120 (the `-U0` diff is authoritative). The patch is regenerated with
`git -c diff.mnemonicPrefix=false diff` because the host-global config sets `diff.mnemonicPrefix=true`
(it would otherwise emit `c/`/`w/` headers); byte length is unchanged and only the three header
lines differ.

## Findings

- **F1 — the entry's own sentence is now false and needs an appended note.** The section "What this
  means for held knowledge" states "S080 and S081 have no citing knowledge entry." After this patch
  both rows name the entry in `used-by`, as do `S093` and `S098`. Append-only corpus practice means
  this is a note appended to the entry (or to the round lesson), not an edit of that sentence. This
  patch deliberately does not touch the knowledge file: the assignment scopes the deliverable to
  `corpus/SOURCES.md`.
- **F2 — four rows change category, not just text.** `S080`, `S081`, `S093` are `status: queued` and
  `S094` is `status: rejected`; all four previously carried `used-by: —`. The census `W03` rule fires
  only for `mined` rows without a used-by, so nothing warns, and `E11` passes because the path exists.
  The lane's convention is therefore extended: `used-by` can now cite an entry from a row that was
  re-opened but never promoted to `mined`. That matches what the entry actually does (it reports a
  verdict for each re-opened row regardless of status) but should be stated in the round lesson so
  the next auditor does not read `used-by` on a `queued` row as a status error.
- **F3 — measurement method note.** `sources-census.sh validate --file` resolves `used-by` paths
  against the registry's parent tree, so pointing it at a lone `SOURCES.md` outside a tree with
  `corpus/knowledge/` produces `E11` on every row and exit 1 (observed while building the baseline
  comparison). Any before/after census comparison must use a tree, not a copied file. Both readings
  reported above use trees.
- **F4 — routed-defect wording.** Defect 1 says "cites all 23 re-opened rows … e.g. `SOURCES.md:47`
  S033, `:55` S041, `:59` S045, `:85` S071, `:92` S078" and "append the path"; all five cited line
  numbers match the frozen file exactly, and all 23 re-opened rows were the missing set — no extra
  row needed a change and no cited row was already correct.

## Out of scope / not run

- C1 (`check-gate-mutants.mjs`) and C2 (`check-frontier-admission.mjs`) counters, `check-release-pins.mjs`,
  `check-selfassessment.mjs`, `check-gate-registry.mjs`, `check-s106-evidence.mjs`, and the fleet
  `sources-census.sh validate --root … tabi` no-harm reading: other seats own those; nothing here
  touches `scripts/` or `corpus/knowledge/`.
- Routed defects 2–6 (lesson table rows, errata wording, population-rule naming, S044's anchor): untouched.
- No knowledge entry, lesson, script or `.ufo` wave artifact other than this seat's directory was written.

## Artifacts

`.ufo/waves/round-30/w1/ScribeUsedBy23/`: `usedby.patch` ·
`usedby-log.md` (`id | used-by old → new` table for the lesson) · `usedby-rows.md` ·
`receipt.md` · `census-validate-patched.txt` · `census-validate-baseline-tree.txt` ·
`check-sources-patched.txt` · `check-sources-baseline.txt` · `verify-cells.txt` · `sha256.txt`.
