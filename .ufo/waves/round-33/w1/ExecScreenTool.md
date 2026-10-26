# ExecScreenTool — C1 integration tool (round 33, w1)

**Verdict.** `assemble.mjs` is a dependency-free Node 24 merger/verifier for the round-33 C1
work: it folds any number of seat drafts (`rows.tsv` 9-column map rows, `screen.tsv` 5-column
screen rows, headerless) onto `corpus/adjacency.tsv` **as it exists at a given lane revision**,
withholds every row it can prove is not committable (shape, quote, ruling rate, duplicate,
cross-draft conflict, unresolved `L0PENDING`), writes the two merged files into a target dir,
and — with `--verify <clone>` — commits them in that scratch clone and runs the two frozen
instruments there, printing a per-row/per-candidate table, the gate's findings mapped back to
draft row ids, and the frozen counter's summary. It is proven end-to-end on two fabricated draft
dirs built from `baseline/c1-candidates.tsv` covering all five required cases (clean,
duplicate surface, duplicate pin, conflicting decision, bad quote) plus pending/l0, guard,
`--prefer`, base-defect and candidate-fallback paths. All demo runs behave as designed; the
merged map was accepted clean by `scripts/check-adjacency.mjs` (13 rows, 13 verified) and the
frozen C1 counter read the merged commit and reported the three new rows as `newMapped`, so the
tool's output is instrument-legible, not merely well-formed text. **The fixture rows are
mechanism fixtures, not claims about real overlap** (`fixture-*` surfaces; dispositions chosen to
exercise code paths). The tool does not judge semantics — that stays with the L1 and wave 2.

## What it does, mapped to the assignment

| Requirement | Implementation |
| --- | --- |
| (1) merge onto the map at a lane revision | base map + screen ledger read with `git show <rev>:<path>` (never the worktree); base rows are kept verbatim and new rows appended, so the merge is append-only (`renderMap`/`renderScreen`, `assemble.mjs:775-785`) |
| (2) duplicate + conflict reporting | folded `surface+sibling` and commit-independent sibling pin `lane@path:line` (check-adjacency's `duplicate_row` rule) including collisions with base rows; candidate identity = `sibling + cited line text` (the counter's `mapped` key) so disagreements across drafts, and against base, are reported as conflicts rather than duplicates (`assemble.mjs:664-773`) |
| (3) write merged files to a target dir | `--out <dir>` → `<dir>/corpus/adjacency.tsv` and `<dir>/corpus/adjacency-screen.tsv`, screen file only when it would carry rows |
| (4) commit + run both instruments in a scratch clone | `--verify <clone>`: toplevel check (`rev-parse --show-toplevel` must equal the clone), HEAD must equal `--rev`, `git -C <clone>` on every child, commit with `-c user.name/-c user.email`, then `check-adjacency --at <newRev> --repo <clone> --fleet <fleet> --json` and `c1-adjacency-sweep --rev <newRev> --repo <clone> --fleet <fleet> --json` (`assemble.mjs:787-830, 982-1019`) |

Local pre-checks mirror the gate's own rules (quote verbatim on the cited line, 4–25 words and
≥20 non-space chars, sibling commit reachable from that sibling's lane tip, `.ufo/` and map
self-citation refused, disposition vocabulary, ruling presence rule, `contested-open` needs a
`tabi | round-<N> |` l0 row naming the sibling, `ruled` quote must name the sibling). Screen rows
are validated against the **frozen** candidate list, loaded by importing the frozen counter's own
`candidates(fleet)` — not a re-implementation — with `--candidates <file>` as the documented
fallback when the fleet cannot resolve the pins.

`L0PENDING` handling is the L1-only path: a seat drafts the row, the `--l0` file supplies
`fleet@<40hex>:.ufo/l0-questions.md:<line>` plus quote, the tool verifies the l0 shape/quote locally
and the gate verifies it again. Rows with no mapping, an invalid mapping, or a mapping that fails the
l0 rules are reported as **pending** and are **not committed**.

## Evidence

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r33/ExecScreenTool`,
`TMPDIR=$S/tmp`. Clone: `git clone --shared <lane> $S/clone && git -C $S/clone checkout -q --detach e6b0a90…`
(toplevel `/fast/scratch/hyaku/tabi-r33/ExecScreenTool/clone`). Lane scripts ran only there; the
lane checkout was never written (`git -C <lane> status --porcelain` = the pre-existing untracked
wave scaffolding only, no tracked change). No browser, no network fetch, no tool install this seat.

Driver: `bash fixtures/run-demos.sh; bash fixtures/run-demos2.sh` → `done` (exit 0 both).
All receipts below are verbatim from `receipts/` in this directory; exit codes are the trailing
`exit=` lines written by the drivers.

### D1 — dry merge, both fixtures, five required cases + pending (`receipts/01-dry-merge.txt`)

```
node assemble.mjs --repo $S/clone --fleet /home/vgpnk/Projects/shokunin \
  --rev e6b0a9074d434ccc307badd312ae7379d1193fea \
  --draft fixtures/draft-a --draft fixtures/draft-b --l0 fixtures/l0.tsv --out $S/out1
ASSEMBLE schema=tabi-r33-assemble-v1 rev=e6b0a90… drafts=2 candidates=52 (frozen counter …c1-adjacency-sweep.mjs)
MAP base=10 new=3 total=13
SCREEN base=0 new=1

ROW                 STATUS    REASON                 DECISION              SURFACE                         SIBLING  PIN
draft-a:1           accept    -                      map:split-declared    fixture-crawl-discipline-split  kake     kake@PROVINCE.md:323
draft-a:2           accept    -                      map:split-declared    fixture-crawl-budget-frontier   kake     kake@PROVINCE.md:362
draft-a:3           withheld  duplicate-surface      map:split-declared    fixture-crawl-discipline-split  kake     kake@PROVINCE.md:338
    duplicate-surface: surface+sibling already on draft-a:1
draft-a:4           withheld  duplicate-pin          map:split-declared    fixture-crawl-duplicate-pin     kake     kake@PROVINCE.md:323
    duplicate-pin: sibling pin kake@PROVINCE.md:323 already cited by draft-a:1
draft-a:5           withheld  sibling-quote-absent   map:split-declared    fixture-bad-quote               kake     kake@PROVINCE.md:304
    sibling-quote-absent: sibling_quote not on kake@PROVINCE.md:304
draft-a:6           withheld  conflict               map:split-declared    fixture-per-engine-hygiene      kake     kake@PROVINCE.md:304
    conflict: one candidate, decisions: map:split-declared vs map:refused-route vs screen:not-browser-sense across drafts draft-a, draft-b
draft-a:screen:1    accept    -                      screen:not-browser..  -                               kake     kake-shokunin@0440…:PROVINCE.md:440
draft-b:1           withheld  conflict               map:refused-route     fixture-per-engine-refused      kake     kake@PROVINCE.md:304
    conflict: one candidate, decisions: map:split-declared vs map:refused-route vs screen:not-browser-sense across drafts draft-a, draft-b
draft-b:2           accept    -                      map:contested-open    fixture-janitor-cli-contested   kagi     kagi@PROVINCE.md:20
    note: l0 resolved from fixtures/l0.tsv:2
draft-b:3           pending   pending-unresolved     map:contested-open    fixture-unknown-contested       kagi     kagi@PROVINCE.md:59
    pending-unresolved: no --l0 mapping for draft-b:3 | pin:kagi-shokunin@69b61db…:PROVINCE.md:59 | kagi-shokunin@69b61db…:PROVINCE.md:59
draft-b:screen:1    withheld  conflict               screen:not-browser..  -                               kake     kake-shokunin@0440…:PROVINCE.md:304
    conflict: one candidate, decisions: map:split-declared vs map:refused-route vs screen:not-browser-sense across drafts draft-a, draft-b
draft-b:screen:2    withheld  screen-reason-unknown  screen:bogus-reason   -                               kake     kake-shokunin@0440…:PROVINCE.md:373
    screen-reason-unknown: reason="bogus-reason"
draft-b:screen:3    withheld  screen-surface-unma..  screen:same-surface   fixture-does-not-exist          kake     kake-shokunin@0440…:PROVINCE.md:420
    screen-surface-unmapped: surface "fixture-does-not-exist" is not a verified map surface of kake

CANDIDATE (frozen keys touched by drafts)
  kake-shokunin@0440…:PROVINCE.md:323  draft-a:1=accept draft-a:4=withheld(duplicate-pin)
  kake-shokunin@0440…:PROVINCE.md:304  draft-a:5=withheld(sibling-quote-absent) draft-a:6=withheld(conflict) draft-b:1=withheld(conflict) draft-b:screen:1=withheld(conflict)
  kagi-shokunin@69b61db…:PROVINCE.md:20  draft-b:2=accept
  kagi-shokunin@69b61db…:PROVINCE.md:59  draft-b:3=pending(pending-unresolved)
  …

SUMMARY accepted=4 withheld=9 pending=1 exit=1
exit=1
```

All five required cases appear: clean (`draft-a:1`, `draft-a:2`, `draft-b:2`), duplicate surface
(`draft-a:3`), duplicate pin (`draft-a:4`), conflicting decision (`draft-a:6` vs `draft-b:1` vs
`draft-b:screen:1`), bad quote (`draft-a:5`). The merged files are in `merged-dry/`.

### D2 — commit + frozen instruments (`receipts/02-verify-merge.txt`)

```
node assemble.mjs … --verify $S/clone
GATE verdict=clean rows=13 verified=13 findings=0 exit=0
COUNTER predicate=not-met adjacency=clean candidates=52 mapped=8 screened=1 unaccounted=43 newMapped=3 screenFindings=0 exit=1
  newMapped row=12 surface=fixture-crawl-discipline-split sibling=kake disposition=split-declared
  newMapped row=13 surface=fixture-crawl-budget-frontier sibling=kake disposition=split-declared
  newMapped row=14 surface=fixture-janitor-cli-contested sibling=kagi disposition=contested-open
COMMIT made b967a0b73cff3e6d19edd94579d26cb66e81cdcc
SUMMARY accepted=4 withheld=9 pending=1 exit=1
exit=1
merge1=b967a0b73cff3e6d19edd94579d26cb66e81cdcc
 b967a0b round-33: merge C1 adjacency drafts (3 map row(s), 1 screen row(s))
 corpus/adjacency-screen.tsv | 2 ++
 corpus/adjacency.tsv        | 3 +++
 2 files changed, 5 insertions(+)
```

Notes: the gate verified every merged row (so the fixture rows are structurally valid rows, not
just accepted text); the counter read the **merged** commit (mapped 5→8, screened 0→1,
unaccounted 47→43, newMapped 3); the diff stat proves the pending row and the nine withheld rows
never reached the commit (3 map rows + header+1 screen row = 5 insertions). Exit 1 is correct and
expected: the axis predicate is `unaccounted == 0`, which fabricated fixtures cannot reach.

### D3 — idempotence at the merged revision (`receipts/03-verify-rerun.txt`)

```
GATE verdict=clean rows=13 verified=13 findings=0 exit=0
COUNTER predicate=not-met adjacency=clean candidates=52 mapped=8 screened=1 unaccounted=43 newMapped=3 screenFindings=0 exit=1
COMMIT not needed (merged bytes equal b967a0b73cff3e6d19edd94579d26cb66e81cdcc)
SUMMARY accepted=0 withheld=13 pending=1 exit=1
head-after=b967a0b73cff3e6d19edd94579d26cb66e81cdcc
```

Re-running the same drafts against their own output withholds all 13 entries as duplicates of base
rows (`(base):12` etc.) and makes no commit — the merge cannot double-apply.

### D4 — `--prefer draft-b` resolves the three-way conflict (`receipts/04-prefer-draft-b.txt`)

```
draft-a:6           withheld  conflict-loss          map:split-declared  … fixture-per-engine-hygiene
    conflict-loss: --prefer draft-b keeps map:refused-route; this row says map:split-declared
draft-b:screen:1    withheld  conflict-loss          screen:not-browser..  … :PROVINCE.md:304
    conflict-loss: --prefer draft-b keeps map:refused-route; this row says screen:not-browser-sense
GATE verdict=clean rows=14 verified=14 findings=0 exit=0
COUNTER predicate=not-met adjacency=clean candidates=52 mapped=9 screened=1 unaccounted=42 newMapped=4 screenFindings=0 exit=1
COMMIT made 2a13fc207dfac1bda25aa7ab0dfbd6380cde71b2
SUMMARY accepted=5 withheld=8 pending=1 exit=1
```

### D5 — machine-readable report

`receipts/05-json.json` is one JSON object (`node -e JSON.parse(...)` → `json-ok`), carrying
`schema`, `rev`, `counts`, `candidates.source`, per-entry `status/reasons/notes`, and
`gate`/`counter` JSON when `--verify` is used.

### D6 — lane guards (`receipts/06a`, `06b`) — exit 2, nothing written

```
ASSEMBLE verdict=could-not-evaluate detail=--out /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus is inside the lane checkout; the tool never writes the lane
exit=2
ASSEMBLE verdict=could-not-evaluate detail=--verify /home/vgpnk/Projects/shokunin/tabi-shokunin is the lane checkout; commits happen only in a scratch clone
exit=2
```

### D7 — a base-map defect is surfaced, not hidden (`receipts/07-gate-finding-base-duplicate.txt`)

Scratch clone3 got one committed duplicate base row (my own scratch commit), then the tool merged
`draft-a` onto it:

```
GATE verdict=failed rows=14 verified=13 findings=1 exit=1
  finding row=12 draft_row=(base):12 reason=duplicate_row detail=surface=rea-browser-runtime-evidence sibling=revenger pin=revenger@PROVINCE.md:5 first_row=5
COUNTER predicate=not-met adjacency=failed candidates=52 mapped=8 screened=1 unaccounted=43 newMapped=3 screenFindings=0 exit=1
SUMMARY accepted=4 withheld=3 pending=0 exit=1
```

The gate's row number is translated back to the owning row (`(base):12`), so the L1 never has to
re-count TSV lines.

### D8 — `L0PENDING` edge cases (`receipts/08a`, `08b`) — neither is committed

```
draft-b:2           pending   l0-invalid             … fixture-janitor-cli-contested  kagi  kagi@PROVINCE.md:20
    l0-invalid: l0 .ufo/l0-questions.md:1 is not a 'tabi | round-<N> |' row
SUMMARY accepted=0 withheld=6 pending=2 exit=1      (08a: mapping points at a non-tabi fleet row)

draft-b:2           withheld  ruling-quote-absent    … fixture-janitor-cli-contested  kagi  kagi@PROVINCE.md:20
    ruling-quote-absent: ruling_quote not on fleet@ebeb396f…:.ufo/l0-questions.md:62
SUMMARY accepted=0 withheld=6 pending=1 exit=1      (08b: mapping quote is not on the l0 line)
```

### D9 — candidate-list fallback (`receipts/09-candidate-fallback.txt`)

With a fleet dir that has no sibling repositories, the frozen counter cannot enumerate, and the
tool falls back to the frozen list file, saying so:

```
ASSEMBLE … candidates=52 (file /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/baseline/c1-candidates.tsv)
MAP base=10 new=0 total=10            (every map row is sibling-unresolved against an empty fleet)
SCREEN base=0 new=1                   (the screen row was still validated against the frozen list)
SUMMARY accepted=1 withheld=6 pending=0 exit=1
```

### D10/D11/D12 — guards and fixture provenance

```
ASSEMBLE verdict=could-not-evaluate detail=--prefer draft-z is not one of the drafts (draft-a); an unknown name would silently leave every conflict withheld
exit=2                                       (receipts/10-prefer-unknown.txt)

assemble.mjs — round-33 C1 draft merger + verifier (tabi-shokunin)
… exit=0                                     (receipts/11-help.txt)

candidate kake-shokunin@0440…:PROVINCE.md:323 present
candidate kake…:362 present / :338 present / :304 present / :440 present / :373 present / :420 present
candidate kagi-shokunin@69b61db…:PROVINCE.md:20 present
candidate kagi…:59 present                   (receipts/12-fixture-provenance.txt)
```

Every fixture ref is a real frozen candidate key from `baseline/c1-candidates.tsv`, and every
quote is a verbatim substring of the sibling/tabi/l0 line at its pinned commit — the gate's clean
13/13 verdict at D2 is the independent confirmation.

## Deliverables

- `.ufo/waves/round-33/w1/ExecScreenTool/assemble.mjs` — the tool (1137 lines, no deps,
  `node --check` exit 0, sha256 `a32f25f3b106d9a3fd6d2f53b77c9d1b9c491c1aee7a6c6caf48921b67ec1af3`).
- `.ufo/waves/round-33/w1/ExecScreenTool/receipts/` — all 15 receipt files; the substantive
  outputs are pasted above (D5 and D11/D12 abridged).
- `.ufo/waves/round-33/w1/ExecScreenTool/merged-dry/` — the D1 merged `adjacency.tsv` /
  `adjacency-screen.tsv`.
- `.ufo/waves/round-33/w1/ExecScreenTool/fixtures/` — `draft-a/{rows,screen}.tsv`,
  `draft-b/{rows,screen}.tsv`, `l0.tsv`, `l0-not-tabi.tsv`, `l0-bad-quote.tsv`, and both drivers,
  so every paste above is reproducible from this directory.
- This report: `.ufo/waves/round-33/w1/ExecScreenTool.md`.

Usage for the L1:

```
node .ufo/waves/round-33/w1/ExecScreenTool/assemble.mjs \
  --repo <scratch clone at REV> --rev <REV 40-hex> --fleet /home/vgpnk/Projects/shokunin \
  --draft .ufo/waves/round-33/w1/AdjKagi --draft .ufo/waves/round-33/w1/AdjKakeA \
  --draft .ufo/waves/round-33/w1/AdjOthers --l0 <draft-to-l0 mapping> \
  --verify <scratch clone> [--prefer <draft>] [--json]
```

## Limits, and what the tool deliberately does not do

1. **No semantic judgement.** A row can be well-formed, non-duplicative and still not be a real
   overlap; the tool proves the former only. Cross-draft conflicts are reported, not adjudicated
   (`--prefer` is the L1's explicit choice, and an unknown name is refused rather than ignored).
2. **Mirrored, not imported, gate rules.** Local pre-checks re-implement `check-adjacency`'s
   quote, path, reachability, disposition and l0 rules so a bad draft row is caught before a
   commit. Divergence risk is structural: if the frozen gate changed, local checks could be
   looser. The gate remains authoritative — it runs at the merge commit and its findings are
   printed with the owning draft row. One known gap: the tool does not check the *author* of a
   `ruled` self-venue spot-check line (the gate does); such rows carry a note instead.
3. **Screen rows depend on the frozen candidate list.** With an unresolvable fleet the tool falls
   back to `--candidates` (or refuses to accept screen rows and marks them pending), rather than
   guessing candidate membership.
4. **Append-only on the map.** Base rows are never edited or dropped, so an existing base defect
   survives the merge and is reported by the gate (D7) instead of being silently cleaned.
5. **`--verify` requires HEAD == `--rev`.** Merging onto one revision and committing onto another
   is refused, because both the base read and the commit must describe the same map.
6. Not run here, by design: builds, linters, the lane's own gates on my deliverable, wave-2
   semantic attack on any real row. No real round-33 row was merged by this seat.

## Hygiene

- Lane checkout: read-only. `git -C <lane> status --porcelain` shows only the pre-existing
  untracked round-33 wave scaffolding (including this seat's output dir); no tracked file changed,
  no index/jj state touched, no sibling repo written (sibling reads were `cat-file`/`log`/
  `rev-parse` only), fleet repo untouched.
- Commits exist only in scratch clones (`clone`, `clone2`, `clone3`, `clone4`, each created for one
  demo and verified `rev-parse --show-toplevel` == itself before the first git call).
- Browser: none started. `pgrep -fa 'chromedriver|chromium'` → one line, `/usr/bin/earlyoom …`
  (its argv mentions chromium as a kill preference; not a process this seat started).
- Network: none. Tool installs: none (pacman is paused host-wide; nothing was needed).
- Scratch `$HYAKU_SCRATCH/tabi-r33/ExecScreenTool` removed after receipts were copied here.
