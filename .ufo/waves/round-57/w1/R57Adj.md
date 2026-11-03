# R57Adj — C1 instrument generation (v17 meter + rebind tool), round 57 w1

Seat: R57Adj (single-seat, leaf). Lane base `ef43ececde883cc0368c6c7cfbabe30ef937b717`.
Nothing here is committed: the L1 owns the FREEZE commit. Corpus ledgers were **not** written.

## Files authored (all inside the seat's named paths)

| path | what it is |
|---|---|
| `.ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs` | the v17 meter (457 → 500 lines) |
| `.ufo/waves/round-57/counters/v16-v17-meter.diff` | `diff -u` v16 → v17 (6 diff hunks, all in the declared set) |
| `.ufo/waves/round-57/adj/rebind-r57.mjs` | the r57 rebind tool (L1 runs it post-freeze) |
| `.ufo/waves/round-57/adj/README.md` | the exact post-freeze command line for the L1 |
| `.ufo/waves/round-57/adj/v17-line-audit.txt` | every changed logic line vs the frozen change set + `verify()` byte-identity |
| `.ufo/waves/round-57/adj/v17-selftest.json` | 18/18 green at the committed bytes |
| `.ufo/waves/round-57/adj/m4-kill-selfdev.json` (+ `m4-kill-selftest-raw.json`) | the OR-class mutant kill |
| `.ufo/waves/round-57/adj/v17-predata-red.json` | the ONE pre-data smoke (expected red family) |
| `.ufo/waves/round-57/adj/rebind-r57-receipt.json` | the rebind test matrix |
| `.ufo/waves/round-57/adj/rebind-dryrun-meter-green.json` | v17 green over the candidate ledgers in a scratch fixture |
| `.ufo/waves/round-57/adj/rebind-authoring-run.json` | the tool's own stdout at the authoring snapshot |
| `.ufo/waves/round-57/adj/rebind-snapshot.authoring-test.json` | authoring-time heads snapshot (the canonical `rebind-snapshot.json` is written by the L1's run) |

Untouched: `corpus/` (all of it, including `adjacency.tsv` and the `-r55`/`-r56` ledgers),
`.ufo/waves/round-56/**`, any sibling lane, the fleet root, `.ufo/state/`, `scripts/`.

## 1. The v17 generation — declared change set only

`v16` bytes are frozen and unmodified; `git status` shows no change under `round-56/`.

**(a) relabel.** `AUDIT_REL`/`DELTA_REL` → `corpus/adjacency-host-{audit,delta}-r57.tsv`; every
schema string → `tabi-adjacency-host-v17` (die, selftest output, run output); the predicate
sentence (both the header comment and the emitted `predicateSentence`) names the `-r57`
ledgers; the three usage lines and the running usage error name v17; the header names round 57
and carries a new round-57 delta block. Zero non-comment `-r56` occurrences remain in code
(checked by script; the only remaining mentions are historical comment prose in earlier
round-delta blocks).

**(b) the routed R56Mutant-m4 fix.** One module-level helper:

```js
export const predicateFrom = (findings) => findings.length === 0;
```

used by the run output (`predicate: predicateFrom(findings)`) **and** by the selftest. Two
new cases assert the emitted predicate:

- `predicate-assert-green` — the honest-green fixture, `expect: 0`, `assertPredicate: true`.
- `predicate-assert-partial` — the delta-quote-spliced fixture (exactly one failing clause:
  its single finding is `delta-quote-not-whole-line`), `assertPredicate: false`,
  `assertFindingCount: 1`.

The harness gains `assertPredicate` / `assertFindingCount` terms (undefined on every original
case, so their `ok` expression is unchanged) and reports each case's emitted `predicate` +
`findingCount` in the receipt.

**Nothing else moved.** Line audit (`adj/v17-line-audit.txt`):

```
v16: total 457 / blank 20 / comment 160 / logic 277
v17: total 500 / blank 21 / comment 195 / logic 284     (delta +7)
changed logic lines: 27   —  (a) 14, (b) 13,  UNCLASSIFIED 0
verify() extracted text: v16 sha256 1b47e724…97e74 (4182 B) == v17 sha256 1b47e724…97e74 (4182 B)
parse helpers tsvParse / parseRef / observedStatus: byte-identical
```

## 2. Selftest and the mutant kill

`node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs --selftest` → exit 0,
`schema: tabi-adjacency-host-v17-selftest`, **18/18** (`allPass: true`). Receipt:
`adj/v17-selftest.json`.

Mutation (`adj/m4-kill-selfdev.json`), scratch copy only —
`predicateFrom` inverted to `findings.length !== 0`, one line, nothing else:

```
node <scratch>/m4-mutant.mjs --selftest   → exit 1, allPass false, 16/18
failing: predicate-assert-green    (emitted false, frozen true, 0 findings)
         predicate-assert-partial  (emitted true,  frozen false, 1 finding)
```

Committed instrument sha256 `7305b6726ff5da8060f063422e87dde4de1018e80a08cf98416c2f68b21a6054`
(34,736 bytes) was never modified; its re-run is 18/18 green. That digest is the one the wave's
independent seats also bound — the mutant-tester (R57MutMeter) recorded the identical pristine
sha and its `m4-prime` mutant copy hashes to the same `a6f87595…` as mine, and the critic's
observed v16→v17 diff was taken against these bytes. (One intermediate comment-only rewording
of the round-57 header block was reverted to restore this exact digest after those receipts
landed; the reverted text is a comment and no logic line ever differed between the two states.) The OR-class mutant is killed by the two
predicate-assert cases, which is exactly what the r56 closure routed.

### A surviving mutant another seat found — reported, not amended

`mutant/results.tsv` (seat R57MutMeter) records `m4b` as **SURVIVED**: weakening `parseRef`'s
line-number regex (`/^\d+$/` -> `/^\d+/`) keeps the selftest 18/18 green. That is a genuine
coverage gap and it is **outside C1's frozen change set**: `parseRef` is a frozen parse helper
(byte-identical v16→v17), and a case for it would be a THIRD selftest case while (b) freezes
"two new selftest cases" both asserting the emitted predicate. I did not add it — widening the
declared change set to chase a mutant is exactly what the freeze rule forbids. Live effect
today: none — with the weakened regex a malformed ref would decode to `line: NaN` and be
audited `stale`/`moved` instead of `map-ref-unparseable`, but every one of the 16 map refs
parses strictly (the pre-data run shows zero `map-ref-unparseable`), so no green path is
masked. Routed to the r57 closure as a carry-in: a `map-ref-unparseable` selftest case in the
v18 generation.

## 3. Pre-data smoke (expected red, not a code bug)

`node …v17.mjs --rev ef43ecec… --repo <lane> --fleet <fleet> --json` → **exit 1**,
`predicate: false`, `findingCount: 30`, counts `roster 20 / mapRows 16 / auditRows 0 /
deltaLanes 0`. Finding ids: `audit-missing` ×16 and `roster-lane-uncovered` ×14.

Both families are the absent-ledger consequence: the audit ledger does not exist at that rev
(one `audit-missing` per map row) and the delta ledger does not exist, so the 14 roster lanes
that the ruled map does not cover have no delta lane row. No other id fires — no code bug.
Receipt: `adj/v17-predata-red.json`.

## 4. The rebind tool (L1-exclusive runner; tested only against scratch copies)

`adj/rebind-r57.mjs` reads ONE head snapshot (`git rev-parse HEAD` per roster lane, recorded in
`adj/rebind-snapshot.json` by default), re-derives the audit rows from `corpus/adjacency.tsv`
at `--rev` (default lane `HEAD`) with the meter's status vocabulary, re-screens each covered
province's `PROVINCE.md` with the meter's keyword list, hashes **RAW bytes**
(`execFileSync` without an encoding, the Buffer itself hashed — the r56 trimEnd lesson), and
writes the two `-r57` ledgers into `--out`. `--out` inside `<lane>/corpus` is refused (exit 2):
the ledgers reach the corpus only by the L1's explicit copy in the data commit.

Dispositions are never invented: they are carried from `corpus/adjacency-host-delta-r56.tsv`
by **exact whole-line quote match** (lane + path + the complete line), overridden only by
`--adjudications`. An unresolved hit line aborts the run (exit 3) and nothing but the pending
list is written.

Before writing, the candidate rows go through the v17 pure core (`verify` +
`predicateFrom`, imported from the meter). A finding aborts with exit 5 and no output.

Measured (all against scratch): fresh run exit 0 at `2026-11-03T19:07:22Z`, counts
`roster 20 / mapRows 16 / auditRows 16 / deltaLanes 16 / deltaLineRows 30`, audit statuses
`stale 5 / unchanged 10 / moved 1`, `carried 30 / explicit 0`, preflight green; the meter over
a scratch fixture carrying those ledgers → **exit 0, predicate true, findingCount 0**; the
rebind's statuses agree with the meter's `--list-observed` on all 16 rows (0 mismatches),
including the moved note (`kumitate SCORECARD.md:1723 → :1736`, verbatim line quoted in the
note). Refusal path: exit 3, 30 unresolved, ledgers absent. Explicit-adjudication path: exit 0
and the 4 `contested-open` rows prove the carry is really read (forcing all 30 to
`no-tabi-ground` changes exactly those 4). Determinism: five snapshots produced a
byte-identical audit ledger; the delta differed only in `souji-shokunin`'s lane-row head cell,
twice, because that head moved twice (`ab8c1fc → 5b34efe7 → 8ec412c6`) while its
`PROVINCE.md` bytes stayed identical (`c60046df`, 323 lines, 0 hits) — the snapshot binding
working as designed. Final authoring delta sha256 `562570d1ba15816a22ad2a39126041ef1e159ecd9f0866b76814a183d256a3eb`.

## 5. What the L1 must run (post-freeze)

See `adj/README.md` for the full text. The essential line:

```sh
node .ufo/waves/round-57/adj/rebind-r57.mjs \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin \
  --out /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data --json
```

then copy the two TSVs into `corpus/`, commit the data, and run the C1 "after" command at the
data rev. Expected counts shape is the r56 shape: `roster 20 / mapRows 16 / auditRows 16 /
deltaLanes 16` — the four map-covered lanes (`kagi`, `kake`, `kama`, `kumitate`) are covered by
the ruled map, not by a delta lane row; the 14 uncovered roster lanes plus the two carried
screening lanes (`kaidoku`, `revenger`, via `--also-screen` default) make 16. This satisfies
P2 (`map ∪ delta = roster`), and it is the same shape as the round-open receipt.

## 6. Head state at the authoring snapshot (informational, not the data snapshot)

`kengaku 5f517fe7…`, `kagi 064d4b64…`, `souji 8ec412c6…` have moved since the r56 snapshot /
round open (`souji` moved twice during this seat). Of the three, the two that the delta screens (kengaku, souji) did
not change their `PROVINCE.md` bytes, so every delta row carried
verbatim (30 line rows, 0 new, 0 dropped, 0 disposition changes; lane-row sha/lines/hits all
unchanged). The L1's run re-derives at its own snapshot, so this section explains a possible
difference, it does not bind the data pass.

## Risks / notes

- **Head race.** The ledgers bind the snapshot heads; if a sibling head moves between the
  rebind and the meter run, v17 reports `lane-screen-head-mismatch` (or an audit status drift).
  That is the r52/r55/r56 correction cycle: re-run the rebind at a fresh snapshot. Kill rule
  allows at most two cycles.
- **Exit 3 is the only place the L1 has to think.** A province that gains a browser-ground line
  after the freeze needs an explicit disposition in the frozen vocabulary; the tool will not
  guess. The pending lines are listed byte-exactly in `<out>/unresolved.json`.
- **`adj/rebind-snapshot.json` is intentionally absent from this wave** — it is the L1's
  data-time artifact (the tool's default). The authoring snapshot is kept as
  `adj/rebind-snapshot.authoring-test.json`.
- **No tool installs** this seat (nothing was needed; pacman untouched). Scratch
  `/fast/scratch/hyaku/tabi-r57/R57Adj/` was removed after copying the receipts.
- **Blockers:** none. **Cross-seat contract deltas:** none.
