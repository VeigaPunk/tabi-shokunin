# CensusFrontier — sourced note placement, touched rows, exact census commands

Seat: read-only scout. No production edit, no browser/REA/network, no test/linter/build.
Exercised: only reads plus two read-only executions of the baseline census
`node .ufo/waves/round-20/counts.mjs 5f585773258b33d2d514b00cd0b0775333578db6`
(same output both times). `sources-census.sh`/`check-sources.mjs` were **not** run here;
L1 executes checks once after integration. Read-time state: HEAD
`5f585773258b33d2d514b00cd0b0775333578db6`, with uncommitted round22 doc edits present
in the lane worktree (listed below); private writer clones are still at baseline.

## Frontier verdict (observed)

The round22 note is **on already-held ground**, not a new frontier surface.

- Held ground entered in round21: `corpus/README.md:466-479` ("finite non-autosubmit
  lifecycle observations ... enters the non-autosubmit runtime frontier"; "not twelve
  novel entries") and `corpus/README.md:436-444` (round20 completion-lifecycle source
  ground). The note reuses the same twelve retained S101 cases; no new browser run.
- **Axis correction is already on record** (observed pre-measurement, not a result
  relabel): `LOG.md:1523-1537` and `SCORECARD.md:1058-1069` retain the initial depth
  declaration as design history and set the sole operative C1 to **operability**
  (also lowest non-retired tie8), same metric/target0→12, scalar8→8; depth and the
  observation population stay12→12, no second claim. Census arithmetic is unaffected:
  no source row, note count or population change follows from the axis name.
- New note: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (98 lines at read
  time), admitted as **one** knowledge entry. Its first three lines are the required
  provenance trio:
  - `:1` `source: S101 — corpus/evidence/round-21/runtime/receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition .ufo/waves/round-21/runtime-execution-finalized.json`
  - `:2` `verified-at: 2026-10-21; historical Chromium154.0.8037.97 acquisition, not a new browser execution ...`
  - `:3` `recheck: node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV; node .ufo/waves/round-22/measure-c1.mjs --selftest; a different build/acquisition needs independently reviewed expectations`
- It explicitly separates evidence classes (`:10-19`): round21 observations stay the
  population; the oracle only makes the same cases semantically failure-capable.
  `:14-15`: "C1 counts twelve explicit semantically checked rows, not twelve new
  observations". Diagnostic strings are recorded, not derived from the evaluated receipt
  (`:17-23`, `:46-52`).
- Index/placement already present in the worktree:
  - `corpus/README.md:501-521` Round22 mapping table + "Population reuse is explicit:
    round21 observations12→12, new observations0, new branches0"; "No new source row
    or publisher-diversity credit is claimed; S101's mutable used-by cell gains this
    note" (`:507-513`).
  - `SKILL.md:2408-2441` Round22 decision table + runnable-artifact registry.
  - `LOG.md:1496-1543` Round22 declaration, census start receipt, and the
    pre-measurement classification correction (`:1523`).
  - `SCORECARD.md:1043-1069` Round22 declared claim (target0→12, scalar8, not a fresh
    run) plus the pre-measurement axis correction (`:1058`).
  - `corpus/QUALITY.md:269-275` new criterion 56: "Baseline zero for a new instrument is
    not absence of earlier knowledge: reused observations retain their old population
    count and receive no new coverage credit."
  - History protection at read time: all five doc edits are pure suffix appends
    (`git diff --numstat` = 49/0 LOG, 28/0 SCORECARD, 35/0 SKILL, 21/0 QUALITY,
    21/0 README), so the append-only protected files keep their committed prefixes;
    only `corpus/SOURCES.md` has a mutable-cell `1/1` replacement (S101). Numbers may
    grow as L1 appends executed-disposition text; the append property must hold.
- S101 receipt identity is unchanged at baseline:
  `corpus/evidence/round-21/runtime/receipt.json` sha256
  `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`; receipt producer
  `scripts/webmcp-lifecycle-round21.mjs`,
  `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`
  (`.ufo/waves/round-21/runtime-execution-finalized.json`). The note's W2 chronology
  statement (`:77-84`) uses these as history, not as a new acquisition.

## Rows touched old → new (observed; only mutable cells)

Only **S101 used-by** changes. No new registry row; no other cell changes.

`corpus/SOURCES.md:115` (S101, status `mined`, opened `2026-10-21`, recheck
`on-release`, all other cells unchanged):

- old used-by: `corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`
- new used-by: `corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`

Evidence: the new note cites only `S101` (grep of all `S###` tokens returns exactly
`S101`), so **S100 (`corpus/SOURCES.md:114`) is untouched**; its used-by keeps
`corpus/knowledge/webmcp-completion-lifecycle-round-20.md,
`corpus/knowledge/webmcp-nonautosubmit-round-21.md,
corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`. `git diff -U0 --
corpus/SOURCES.md` shows exactly one `-`/`+` row pair (S101).
Conditional: if the final note adds an `S100` citation (the ScribeEntry draft's
provenance line did; the production note at read time does not), then S100's used-by
must also append `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` and that
old→new must be logged in the round lesson. Otherwise S100 stays untouched.

Contract requirements this transition must still satisfy (pending, not observable yet):

- SOURCES contract rule 2 (frozen v1): only status/recheck/used-by change in place, and
  **each change is logged old→new in the round lesson**. No `corpus/lessons/round-22.md`
  exists at read time, so this log line is pending.
- The used-by path must exist in the same commit (`sources-census.sh` E11) and the note
  must contain the `S101` token (`scripts/check-sources.mjs` used-by uncited check).
- SOURCES contract rule 5: the bounded round22 reopening still needs its one prose
  **Search log** entry. At read time `corpus/SOURCES.md` has no round22 search-log line.
  Grounded content exists in `.ufo/waves/round-22/study.json`: identified2/screened2/
  included2/excluded0, stop "Finite held acquisition and exact routed conformance debt,
  not discovery completeness." This is an append inside the existing section, not a row.
- Immutable S101 cells (source/kind/tier/scope/anchor/teaches/opened) stay byte-identical;
  no supersession row is warranted (this is reuse, not a corrected source claim).

## Exact census commands and expected values

Baseline (actually executed here, exit0):

```sh
node .ufo/waves/round-20/counts.mjs 5f585773258b33d2d514b00cd0b0775333578db6
# {"revision":"5f585773258b33d2d514b00cd0b0775333578db6","rows":101,
#  "tiers":{"A":88,"B":4,"C":9},
#  "statuses":{"mined":73,"queued":19,"rejected":9},"knowledge":40}
```

After integration (L1; expected metrics are frozen in
`.ufo/waves/round-22/run-checks.py:84-87`):

```sh
node .ufo/waves/round-20/counts.mjs <FULL40HEXREV>
# expected: rows 101 (unchanged), knowledge 41 (one new note);
# tiers A88/B4/C9 and mined73/queued19/rejected9 unchanged (only S101 used-by moved).
```

Fleet source census — the start receipt is `.ufo/waves/round-22/census-before.json`
(argv `:2-7`, exit `:9`, stdout `:10`). Same exact command for the end receipt:

```sh
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
  --root /home/vgpnk/Projects/shokunin tabi
# start: exit 0, 16 W04 "duplicate url ... across scopes" warnings
#        (S058,S065,S066,S068,S069,S070,S073,S074,S075,S076,S077,S095,S096,S098,S099,S100)
#        plus "tabi<TAB>ok<TAB>/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md";
#        no E-codes.
# end: must be the same 16 W04 + ok, exit 0; E11 must not appear now that the new used-by
#      path exists. Retain the full streams (prior-round precedent:
#      .ufo/waves/round-20/final/census-after.json, .ufo/waves/round-21/final/census-after.json).
```

Structural gate (L1, post-integration; not run by this seat):

```sh
node scripts/check-sources.mjs          # expected exit 0; note must cite S101, path must exist
```

Contract §Census equivalents for the same registry (run from the lane root; from
`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` §Census):

```sh
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md        # 101
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md  # 0
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d  # empty
```

C1 measurement (not a census; do not substitute it for one):

```sh
node .ufo/waves/round-22/measure-c1.mjs 5f585773258b33d2d514b00cd0b0775333578db6
# expected: exit 0, value 0, verdict "baseline"
node .ufo/waves/round-22/measure-c1.mjs <FULL40HEXREV>
# expected: exit 0, value 12, verdict "clean" (metric c1_semantically_checked_lifecycle_rows)
node .ufo/waves/round-22/measure-c1.mjs --selftest   # expected exit 0; includes all-silent refusal
```

(Expected arms cross-checked against `.ufo/waves/round-22/w1/ConnPlanner.md:184-188` and
`run-checks.py:75-79`; no arm was run by this seat.)

No-harm old counter stays frozen and is re-run only as a no-harm arm by L1:
`node .ufo/waves/round-21/measure-c1.mjs <FULL40HEXREV>` →
`c1_lifecycle_observations=12`, `verdict:"clean"` (`run-checks.py:80-83`). The old
counter is not imported by, or used as, the new outcome oracle.

## Expansion credit: none, by construction (observed/inference)

- SOURCES contract rule 4: "Expansion is knowledge, not rows ... counts admitted
  `knowledge/` entries whose `source:` cites a `mined` row on **uncovered** coverage-map
  ground. There is no row quota." This note cites mined S101 on **covered** non-autosubmit
  runtime ground, so it earns no expansion credit.
- `corpus/README.md:507-513` states the same for this round; `corpus/README.md:446-447`
  already says "Extra SOURCES rows are not expansion or source diversity."
- QUALITY criterion 56 (`corpus/QUALITY.md:269-275`) forbids treating a new instrument's
  0 baseline as absent prior knowledge; reused observations keep their old population
  count and receive no new coverage credit.
- Therefore do **not** credit: the 101 registry rows (unchanged), the 41st knowledge file,
  the Gate's admitted/rejected row counts, the 64 dispatched seats, or the oracle's 12 as
  twelve new branches/observations. The operative C1 is **operability** 0→12
  (`.ufo/waves/round-22/w1-spec.json` still carries the superseded depth wording; the
  lane's `LOG.md:1523-1537` / `SCORECARD.md:1058-1069` correction is the current record):
  absence→presence of a failure-capable oracle on the same twelve round21 rows, with
  depth population12→12. Scalar8, saturation8/window3, coverage and capability rows
  remain unchanged.

## Remaining unknowns / pending placements

- At read time `.ufo/waves/round-22/measure-c1.mjs`,
  `corpus/evidence/round-22/semantic-expectations.json`,
  `.ufo/waves/round-22/check-review-chronology.mjs`,
  `.ufo/waves/round-22/debt-expectations.json` and `corpus/lessons/round-22.md` do not
  exist in the lane; only the private clones exist (still at baseline HEAD). The README/
  SKILL/note reference the first two, so they must land in the measured revision.
- The SOURCES search-log append and the round-22 lesson's used-by old→new log are
  pending; both are contract requirements, neither is a new row.
- Unknown: final commit identity of the measured revision and whether L1 retains the end
  census at `.ufo/waves/round-22/final/census-after.json` (precedent, not enforced by a
  checker I may run here). No conclusion is drawn from an unrun command.
- Inference (not observed): tiers/statuses stay A88/B4/C9 and mined73/queued19/rejected9
  after integration because the diff changes only one used-by cell; the run-checks census
  expectations assert only `rows:101` and `knowledge:41`.
