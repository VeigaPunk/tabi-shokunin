# ScribeLesson — round 34 w1 (frontier): round-34 lesson skeleton

**Verdict.** The skeleton is drafted at `.ufo/waves/round-34/w1/ScribeLesson/round-34.md` (326 lines, 89
`<L1: …>` slots) in the round-33 shape, with all seven required sections — `## Gate` (claims, freeze
`59f1b47a`, controls, the S130+ source-row table, admits/rejects slots, assimilation, spot-check),
`## C1 gate decisions` (candidate scope and rules, the 13 existing map surfaces, the frozen candidate
allocation for all 67 rows by seat, a new-row table with the C1 counter's newMapped conditions, the screen
ledger vocabulary and summary table, the carried round-33 relabels, reversal slots), `## C2 kill cases` (all
20 mutants with their rule anchor re-located at the baseline gate blob, round-33 outcome, kill-case slot,
owning seat, plus the four design constraints and the M03/M10 equivalence disclosure), `## Mistakes` (the
lead-anchoring entry pre-filled and independently re-verified, plus slots for ScribeMistakeSweep and the w2
attack seats), `## Errata intake` (round-33 routed defects 1–7 mapped to the round-34 seats that carry
each), `## Search log`, `## Receipts`, `## Misroot sweep`. Every L1-must-fill value is a `<L1: …>`
placeholder; every value I did fill is a read from a committed object, cited with its command below.
Nothing in the lane was edited, no checker was run against the lane worktree, and the one fact class I
could not settle (the scouts' fetch receipts, the after-measurements, the assimilation verdict) is left as
placeholders rather than guessed.

## Evidence (commands, exit codes, file:line)

All reads are read-only git/jq against the lane repo and the sibling repos at their pins; no network
fetch, no browser, no build, no linter. Working directory for each block: the lane or sibling repo named.

**E1 — frozen digests equal the blobs at the freeze `59f1b47aae277e1670e4a824173da8cde7e388ee`** (exit 0):

```
for p in .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs .ufo/waves/round-34/counters/c2-gate-mutants.mjs \
         .ufo/waves/round-34/baseline/controls.mjs .ufo/waves/round-34/measure.sh; do
  printf '%s  %s\n' "$(git show 59f1b47a…:$p | sha256sum | cut -d' ' -f1)" "$p"; done
# 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e  c1-adjacency-sweep-v2.mjs
# 3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82  c2-gate-mutants.mjs
# 18c95d673c55f3d3521dd08d418b8ef894dc5c8f89233e57417565576bcf035e  baseline/controls.mjs
# 0a11973daf308e6f5af59698568d561e537e6bb3f1959de31ece9fb28a08602c  measure.sh
git show 59f1b47a…:scripts/check-adjacency.mjs | sha256sum   # 4e2c2a64…24aac
git cat-file -t 59f1b47a… → commit;  git cat-file -t 15dfaccb… → commit
```

All four equal `claims.json` `frozenDigests`, and the adjacency gate equals both its `frozenDigests` value
and the C1 counter's `ADJ_GATE_SHA256` (`c1-adjacency-sweep-v2.mjs:73`).

**E2 — baseline counter readings** (`jq` on committed receipts, exit 0):

```
jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency,screenFindings}' \
  .ufo/waves/round-34/baseline/measure-at-baseline/c1-at-15dfacc.json
# {"predicate":false,"candidates":67,"mapped":1,"screened":0,"unaccounted":66,"newMapped":0,
#  "adjacency":{"verdict":"clean","rows":13,"verified":13,"findings":0},"screenFindings":[]}
jq -c '{candidatesBySet,perLane,adjGateSha256}' …/c1-at-15dfacc.json
# {"candidatesBySet":{"A":38,"B":29},"perLane":{"kake":13,"kotoba":13,"kaidoku":9,"mori":8,"kumitate":5,
#  "tameshi":5,"kagi":4,"kama":4,"kasegi":3,"tsukuroi":2,"chousa":1,…},"adjGateSha256":"4e2c2a64…24aac"}
jq -c '{predicate,killedCount,survivors,unappliable,twinsFailing,pristine,neutral,decoy,battery}' \
  …/c2-at-15dfacc.json
# {"predicate":false,"killedCount":8,"survivors":["M01","M03","M04","M05","M06","M07","M08","M09","M10",
#  "M16","M18","M19"],"unappliable":[],"twinsFailing":[],
#  "pristine":{"exit":0,…},"neutral":{"exit":0,…},"decoy":{"exit":0,…},
#  "battery":{"predicate":true,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0}}
jq -c '[.[]|{name,predicate,exit}]' .ufo/waves/round-34/baseline/controls-summary.json
# 9 controls, every one {"predicate":false,"exit":1}
jq -c '{predicate,candidates,mapped,screened,unaccounted,newMapped}' …/r33c1-at-15dfacc.json
# {"predicate":false,"candidates":52,"mapped":8,"screened":44,"unaccounted":0,"newMapped":3}
jq -c '{mismatches,clean}' …/selfassessment-at-15dfacc.json  # {"mismatches":0,"clean":true}
```

Both claims red at the baseline; the round-33 no-harm leg holds (`unaccounted 0` over its 52 candidates).

**E3 — mutant anchors re-located at the baseline gate blob.** I read each `find` text out of the frozen
counter's `MUTANTS` array (`.ufo/waves/round-34/counters/c2-gate-mutants.mjs:52-173`, 20 entries) and
located it in `git show 15dfaccb…:scripts/check-bidi-runtime.mjs` (blob sha256
`eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1` = `claims.json` C2's baseline gate
sha). Every find text occurs exactly once (consistent with `unappliable []`). Line numbers used in the
skeleton's C2 table: M01 `:843`, M02 `:149`, M03 `:373`, M04 `:797`, M05 `:798`, M06 `:145`, M07 `:388`,
M08 `:146`, M09/M10 `:144`, M11 `:434`, M12 `:447`, M13 `:778`, M14 `:757`, M15 `:753`, M16 `:750`,
M17 `:860`, M18 `:867`, M19 `:811`. These differ from MutGateV2's round-33 anchors (e.g. duplicate-id
`:839` → `:843`), so citing the round-33 numbers in the lesson would have been `reference-drift`.

**E4 — the pre-filled Mistakes entry, independently re-verified.** I parsed
`.ufo/waves/round-33/w1/ConnSiblingScan/leads.tsv` (41 rows, 7 columns) and tested each quote against its
cited line at the cited commit, then ±2, then a 4-consecutive-word window (the counter's own rule):

- 37 leads hit their cited line verbatim.
- 1 is re-anchored: `kake corpus/knowledge/mirror-pitfalls.md:39@04404859…` — line 39 is blank (`''`), the
  quote `Lease first: \`webzites lease acquire --owner <n> --ttl-ms 900000\`; release` is line 40. The
  committed counter reading agrees: `leadsReanchored` = `["corpus/knowledge/mirror-pitfalls.md:39@044048597d62f3199494b63b36e90dd57825e350 -> 40"]`,
  `leadsUnresolved` = `[]` (`.ufo/.../c1-at-15dfacc.json`). The round-34 candidate file already carries
  the anchored key as row 56 (set B).
- 3 quote text wrapped over two lines, so no single-line anchor exists: `kake
  corpus/knowledge/js-rendering-queue.md:77` (quote = `:76` + `:77`), `kotoba
  corpus/knowledge/sibling-overlap-census-round74.md:150` (`:150` + `:151`), `kotoba
  corpus/knowledge/sibling-description-rewrites-round8.md:136` (`:136` + `:137`). All three lines also
  match set A's `/\btabi\b/i`, so they survive as candidates and are hidden from the `leadsReanchored`
  report by the A-first de-dupe — recorded in the entry so the fix's green state is read correctly.

**E5 — baseline facts the skeleton asserts, read from the baseline blob** (not the worktree):

```
git show 15dfaccb…:SKILL.md        | grep -c 'Round 34'                      → 0
git show 15dfaccb…:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' → 129
git show 15dfaccb…:corpus/adjacency-screen.tsv | wc -l                     → 45
git show 15dfaccb…:corpus/adjacency-screen-skill.tsv                       → does not exist
git show 15dfaccb…:corpus/QUALITY.md | grep -oE '^[0-9]{1,3}\.' | tail -1 → 91.
sed -n '/^const PINS = Object.freeze({/,/^});/p' .ufo/.../c1-adjacency-sweep-v2.mjs | grep -c ':' → 20
jq '.items|length' .ufo/waves/round-34/w1-spec.json                        → 37
grep -n '^| tabi | round-34 |' .ufo/l0-questions.md (fleet, read-only)     → no match
```

So: no round-34 SKILL declaration section yet, 129 registry rows (S130 next free), the round-33 screen
ledger at 44 rows + header, the new skill-screen ledger absent, QUALITY at 91, 20 sibling pins, 37 w1
seats, and no `tabi | round-34 |` L0 line for a `contested-open` row to cite.

**E6 — existing map surfaces.** `awk -F'\t' 'NR>1{…}' corpus/adjacency.tsv` → 13 data rows: kaidoku
`cdp-runtime-observation` (ruled), `reverse-engineering-of-shipped-artifacts` (refused-route); revenger
`reverse-engineering-of-shipped-artifacts` (refused-route), `rea-browser-runtime-evidence`
(contested-open); kake `crawler-discipline-vs-publishing`, `musketeer-cdp-9222-profile-lease`
(contested-open), `js-rendering-browser-execution`, `robots-txt-publisher-audit-vs-client-obedience`,
`accessibility-browser-at-execution`; kagi `musketeer-cdp-9222-profile-lease`, `secrets-vault-ops`;
kumitate `kimi-webbridge-plugin-internals`; kama `cdp-live-target-census`. Candidate 59's row is the
`cdp-live-target-census` row at file line 11 — the skeleton notes that data-row order and file line differ
by one, because the assignment and the file disagree on the label "row 11".

**E7 — candidate allocation.** The 67 frozen rows were grouped from `c1-candidates.tsv` (numbered 1–67 in
file order) against the Adj* seat items in `w1-spec.json`: 1,2,3,5,52,53 / 4,6,7,54,55,56,57 / 8–12,66 /
13–18,65 / 19–23 / 24–31 / 32–38,67 / 39–47 / 48–51,58,60,61 / 62–64 = 66 rows, plus row 59 already
mapped. Sums to 67 with no candidate unassigned and none assigned twice.

## Deliverables

- `.ufo/waves/round-34/w1/ScribeLesson/round-34.md` — the lesson skeleton (326 lines, 89 `<L1: …>` slots).
- `.ufo/waves/round-34/w1/ScribeLesson.md` — this report.

## Findings and limits

1. **`leadsReanchored` hides three of the four defects it fixes.** The A-first de-dupe means the three
   wrapped-quote leads are absorbed by set-A candidates on the same lines and never appear in
   `leadsReanchored`; only the mirror-pitfalls move is visible. The fix is still real (the counter reads by
   quote, not by line number), but the round's report should not claim "four defects caught" from that
   array alone — the skeleton's M1 entry states the mechanism and the three lines explicitly. Captured-by
   in round 33 was `none`.
2. **The fixture for M1 cannot be committed.** `leads.tsv` is a round-33 artefact read from the baseline,
   and the no-harm rule forbids editing prior-round bytes, so the red/green fixture lives as a
   counter-side construction (a synthetic leads table run through a scratch copy) — the skeleton says so
   rather than pointing at a committed control that does not exist. The live red state is the baseline
   `leadsReanchored` entry itself.
3. **M03 and M10 remain equivalence risks** (claims `feasibilityDisclosed` says so verbatim). The skeleton
   records them as "if equivalent, the target is MISSED, not narrowed", and gives the green-side wording
   for M10 (an honest driver importing `serveFixture` must stay ADMITTED) so the kill case is not built
   as a refusal test.
4. **C1's `same-surface` label needs the round-33 relabel to have landed first.** Three of my skeleton's
   screen-reason groups (`kake 396/422/440`) depend on ScribeScreenRelabel's rows; if that draft is not
   landed, the round-33 ledger stays `no-claim-declared` and the `## Errata intake` row 5 entry must say
   "carried again" instead of "landed".
5. **The S130+ table is empty by design.** The scouts' fetches happen in other seats this wave; I cite the
   count arithmetic only (129 rows, next free S130) and leave URL/status/bytes/sha/quote per row as
   placeholders. No row is asserted here as admitted.
6. **`S128` supersession and `S125` cadence** are drafted by other frontier seats; the skeleton points at
   them and marks the id as `S13X`, because the scouts' consumption of S130–S132 decides the next free id.

Nothing was installed or upgraded (no pacman, no `uv tool`, no npx), no network fetch was made, no browser
was started, no lane/fleet/sibling file was written, and no scratch tree was left: the only temporary file
was `/tmp/g34.mjs` (31 KB, the baseline gate blob for E3), removed in the same command.

Report: .ufo/waves/round-34/w1/ScribeLesson.md
