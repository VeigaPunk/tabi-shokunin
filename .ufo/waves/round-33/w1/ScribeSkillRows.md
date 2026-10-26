# ScribeSkillRows — C2 SKILL/registry drafts (round 33, w1)

## Verdict

The round-33 append for `SKILL.md` is drafted as four append-only blocks — the `bidi-runtime` gate registry row that
supersedes `SKILL.md:2626`, the sibling-overlap sweep and screen-ledger section, the map-row-versus-screen-row
decision rule, and the round-33 corrections — with separate `SCORECARD.md` and `LOG.md` correction lines and a census
of every line that states this gate's self-test tally. The registry row is field-conformant and really does supersede:
`scripts/check-gate-registry.mjs` at a scratch commit carrying the append reads 41 rows, 22 gates, `nonconformant 0`,
`findings []`, with `check-bidi-runtime` reported at row 2813, `rows: 2`, `missing: []` (baseline: row 2626,
`rows: 1`) — the gate read the new row and not the old one. The append is 115 added / 0 deleted lines. Every tally
slot stays `<N>`: no v2 gate exists at the read revision, so a number would be unmeasured. The tally 27 appears on
exactly three lines — `SKILL.md:2626`, `SCORECARD.md:1657`, `LOG.md:2154` — and on none in `corpus/README.md`. The C1
section's numbers were re-derived from the frozen baseline receipts, and one drafted sentence was corrected against
them: the 52 candidates sit in seven of the twenty scanned sibling lanes, not "over twenty siblings".

## Evidence

### 1. Tally census (the requested `grep -n`)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin && \
grep -nE "cases=27|passed=27|27/27|\(27\)" SKILL.md SCORECARD.md corpus/README.md LOG.md
```
exit 0. Raw output in `w1/ScribeSkillRows/grep-bidi-tally.txt`; three matches:

| file:line | tally | what the line is |
|---|---|---|
| `SKILL.md:2626` | `(cases=27, passed=27)` | round-32 `bidi-runtime` registry row (the row superseded this round) |
| `SCORECARD.md:1657` | `(27/27)` | round-32 measurement block's self-test line |
| `LOG.md:2154` | `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` | round-32 "Self-tests at the freeze" line |

`corpus/README.md`: zero. `grep -nE "bidi" corpus/README.md | grep 27` → one match, `corpus/README.md:716`, whose "27"
is inside `127.0.0.1`; `corpus/README.md:659` ("26 of the 27 catalogued faults") is the `check-gate-mutants` fault
catalogue for `check-s106-evidence.mjs` / `check-release-pins.mjs`, not this gate. Outside the four named documents,
`grep -rnE "cases=27|passed=27|27/27" corpus/QUALITY.md corpus/SOURCES.md corpus/knowledge/*.md` → no match (exit 1).

### 2. Baseline facts re-derived, not copied

```
python3  # candidates + distribution from .ufo/waves/round-33/baseline/c1-candidates.tsv and corpus/adjacency.tsv
```
exit 0: 52 candidates; kake 42, kagi 4, kaidoku 2, tsukuroi 1, revenger 1, kotoba 1, kengaku 1. `corpus/adjacency.tsv`
header is the nine expected columns and carries 10 data rows. The mapped five are matched by line **text**, not by
pin — `kake-shokunin@7c61c8cc…:PROVINCE.md:30` and `:35` read the same as `kake-shokunin@04404859…:PROVINCE.md:34`
and `:39` (checked with `git -C kake-shokunin show <pin>:PROVINCE.md | sed -n '<n>p'`), so the sweep's `kake:34` /
`kake:39` are the map's rows. That subtlety is now stated in the draft.

### 3. Registry conformance of the drafted row (draft self-check, scratch clone only)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea
# baseline, no edits:
node scripts/check-gate-registry.mjs --repo "$S/clone" --rev e6b0a90… --json
```
- baseline: exit 0, rows 40, gates 22, `nonconformant 0`; `check-bidi-runtime` → `row 2626, rows 1, missing []`
  (`w1/ScribeSkillRows/registry-baseline.json`).
- after appending `skill-append.md` to the clone's `SKILL.md` and committing as
  `d553f24e4f27420f48f98cf1004eb4c5650f3da5` (`draft-commit.txt`; three earlier text passes,
  `1724acf74d88b1223ec8d6998455d0e17d03fb61`, `d2966a27c4e93a00a336d7966bf8b64d5e43d371` and
  `eb754988797d8aa407a424b8a072777e7ce608e1`, are superseded by the delivered bytes):
  `git -C "$S/clone" diff --numstat e6b0a90…..HEAD` → `115  0  SKILL.md`; `node scripts/check-gate-registry.mjs
  --repo "$S/clone" --rev HEAD --json` → exit 0, rows 41, gates 22, `nonconformant 0`, `findings []`,
  `check-bidi-runtime` → `row 2813, rows 2, missing []` (`w1/ScribeSkillRows/registry-draft.json`). The `rows: 2`
  plus the new row line is what proves the latest-row-wins read (`scripts/check-gate-registry.mjs:263-264`) picked up
  my row instead of 2626.

### 4. Schema facts the drafts rest on (read from frozen bytes, not assumed)

- `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:61` — `SCREEN_HEADER = ['sibling_ref','reason','surface',
  'quote','note']`; `:62` — the four `SCREEN_REASONS`; `:64` — `NEW_TARGET = 4`; `:189` — header compared by exact
  join (`screen-header`); `:197` — column count; `:201` — reason vocabulary; `:204` — `same-surface` needs a verified
  map surface of the same sibling (`screen-surface-unmapped`); `:206` — duplicate ref (`screen-duplicate`). The
  `note` column is never inspected beyond its presence — the draft says so.
- `scripts/check-gate-registry.mjs:61` — the eight `FIELDS`; `:219` `missingFields` (what each cell must contain).
- `scripts/check-adjacency.mjs:53-77` — the nine columns and the four dispositions; `:85` — `contested-open` is
  exactly `fleet@<40-hex>:.ufo/l0-questions.md:<line>` naming a `tabi | round-<N> |` row that names the sibling.

### 5. Process hygiene

- `pgrep -fa 'chromedriver|chromium'` → no chromedriver/chromium. Two matching lines, neither mine: the system
  `earlyoom --prefer (…|chromium|…)` at pid 1371 and another seat's `curl … gitlab.archlinux.org/…/PKGBUILD`.
- No network fetch, no browser run, no tool install by this seat; nothing written outside
  `.ufo/waves/round-33/w1/ScribeSkillRows/`, `.ufo/waves/round-33/w1/ScribeSkillRows.md` and the scratch dir.
- Scratch clone and temp dir removed (`/fast/scratch/hyaku/tabi-r33/ScribeSkillRows`); receipts copied here first.

## Deliverables (all under `.ufo/waves/round-33/w1/ScribeSkillRows/`)

| file | sha256 | content |
|---|---|---|
| `skill-append.md` | `382d05ad9e5cde39c9bc911edb522ee3ea15f4c6ef68eb9c257840bb351f08fc` | 115 lines to append at the end of `SKILL.md`: §registry row (6 numbered v2 rules + the 8-field row), §sibling-overlap sweep and screen ledger, §decision rule, §corrections |
| `scorecard-append.md` | `8c7f9b57fb0ee7a2819f418d9f3460adf9e7623103cea671a5fddbb97d360758` | correction superseding `SCORECARD.md:1657` |
| `log-append.md` | `6d3209188685efe341c856f8830bd3721ec4a761e52663a41d9beea6d2a0a859` | correction superseding `LOG.md:2154` |
| `tally-lines.md` | `bd8c41424061680a3de683556509413f2c85d82b62dcd38fad79dc6e71c64213` | the census, the empty `corpus/README.md` result, and the `<N>` discipline |
| `grep-bidi-tally.txt` | `9b48fbc24b82c04af87fc2bc08d6f427a1ffc8e8b090d09448d040cb5bd5a06d` | raw grep output |
| `registry-baseline.json` | `97079eb487aa5a590809fd6afa18a311dbf89b756908e9d363f03e76cc6f9b9a` | gate reading at `e6b0a90`, no edits |
| `registry-draft.json` | `f2b48b6b266a226a9a66140ca2ab8ace68c0a468e099a950c1c0728020bd3bc8` | gate reading with the append applied |
| `skill-diff-numstat.txt` | `82b820a3412542f487f01546bd80d187c5438c3ff0188fb9e4073afd3a18a7ca` | `115 0 SKILL.md` |
| `draft-commit.txt` | `e47b25799d483278d195153875a133021abd5eb1a42dbb196ef5bd7e22d4df10` | the scratch commit the row was checked at (`d553f24e…`) |

## Findings and limits

1. **Two `<N>` slots must be filled together.** The round-33 row's Self-test cell and all three correction lines
   carry `<N>`. The calibration counter treats a later statement of a gate's tally as the current one, so filing the
   row with a measured N while leaving a correction at `<N>` (or the reverse) is a mismatch in the making.
2. **The drafted predicates are contracts, not observations.** The row's verdict map and the six rules describe v2 as
   specified by this wave's build assignment; the numbers (`admitted 16`, `failing 0`, eight refusals) are quoted from
   the frozen battery's predicate, and the prose says the measured readings are the round's receipts. The 27 + F1–F8 +
   M04/M06/M09/M10/M11/M14/M17/M18/M19 case plan is a plan; I did not assert a total (44 would be arithmetic on a
   plan, not a measurement).
3. **The row pins a note that does not exist yet.** Its pinned-value cell cites
   `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`; `check-gate-registry` tests only cell shape, so the row would
   pass while pointing at an absent path. The note must land in the same commit as the row (the note draft is another
   seat's deliverable). Same for `corpus/adjacency-screen.tsv`: the counter treats it as absent-until-created
   (`screened 0`), so no gate breaks, but the sweep predicate cannot pass until it exists.
4. **The screen ledger's `note` column is unguarded.** The counter checks only that five TAB columns exist; a note
   that does not justify the reason passes. The section says the semantic guard is the attack wave and the closure
   spot-check, consistent with `claims.json` C1 `feasibilityDisclosed`.
5. **`same-surface` cannot point at a surface the map lacks.** The counter's rule (`:204`) is a verified map row of
   the same sibling, so a new surface name with no map row behind it is `screen-surface-unmapped`. The decision rule
   therefore forces the map row first, which is the intended ordering.
6. **One claim I could not make:** whether `check-selfassessment.mjs` will accept the new row's `cases=<N>` shape as a
   tally. I did not run it (calibration is `notClaimed` this round), and the section does not assert it.

## Out of scope (not done, correctly)

C1/C2 counters not run (seats own them); no v2 gate built or edited; no lane tracked file, lane index, sibling repo
or fleet file touched; no `SKILL.md`/`SCORECARD.md`/`LOG.md`/`corpus/README.md` edit — the drafts are text for the L1 to
place.
