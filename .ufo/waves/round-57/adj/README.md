# round 57 / C1 — the r57 ledger rebind (post-freeze, L1-only)

`rebind-r57.mjs` is the C1 rebind tool. It is authored in wave w1 and shipped in the
FREEZE commit (code only). **The L1 runs it after the freeze commit, at its own fresh
snapshot, and commits the two ledgers it produces as DATA.**

It writes candidates only: it refuses `--out` inside `<lane>/corpus`, so the ledgers reach
`corpus/` by an explicit copy in the data commit, never by the tool.

## The exact post-freeze command line

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
mkdir -p /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data
node .ufo/waves/round-57/adj/rebind-r57.mjs \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin \
  --out /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data \
  --json > /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data/rebind-receipt.json
echo "rebind exit=$?"
```

`--rev` defaults to the lane's `HEAD`, which is the freeze commit at that moment — that is
what the tool reads `corpus/adjacency.tsv` (the ruled map) from. `--snapshot-out` defaults
to `adj/rebind-snapshot.json` next to the tool and records the ONE sibling-head snapshot
every audit/delta row is bound to. `--also-screen` defaults to
`kaidoku-shokunin,revenger-shokunin` (the two map-covered lanes whose provinces carry
browser-ground lines and whose dispositions must keep being screened; the uncovered roster
lanes are derived from the map automatically).

Then copy the two ledgers into the corpus and commit them with the lane helper:

```sh
cp /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data/adjacency-host-audit-r57.tsv \
   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-audit-r57.tsv
cp /fast/scratch/hyaku/tabi-r57/TabiR57/rebind-data/adjacency-host-delta-r57.tsv \
   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-delta-r57.tsv
# L1 commits corpus/adjacency-host-{audit,delta}-r57.tsv (the DATA commit)
```

Then the C1 "after" command, at the data revision:

```sh
node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs \
  --rev <DATA-REV> \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin --json
# expect: exit 0, predicate true, findingCount 0
```

## Exit codes

| exit | meaning | what the L1 does |
|---|---|---|
| 0 | both ledgers written, preflight green (`verify` findings `[]`, `predicateFrom` true) | commit them |
| 2 | usage error, or `--out` inside `<lane>/corpus` | point `--out` at scratch |
| 3 | one or more browser-ground hit lines have no disposition in the frozen vocabulary — **nothing was written** except `unresolved.json` | adjudicate the listed lines and re-run with `--adjudications` |
| 4 | environment/source-pin failure (meter source lists drifted, unreadable map, non-UTF-8 province) | treat as an instrument defect; do not hand-edit a ledger |
| 5 | preflight: the v17 pure core rejects the candidate ledgers — nothing written | the tool or the snapshot is wrong; fix, do not weaken the meter |

### The exit-3 path (new hit lines only)

Dispositions are never invented. The tool carries them from the previous generation's delta
ledger (`corpus/adjacency-host-delta-r56.tsv`) by **exact whole-line quote match**
(lane + path + the complete line). Lines that do not carry are listed in
`<out>/unresolved.json`. To adjudicate, write a JSON array (quote taken from
`unresolved.json`, byte-exactly) and re-run with `--adjudications`:

```json
[{"lane":"<lane>","path":"PROVINCE.md","quote":"<the complete line, byte-exact>","disposition":"no-tabi-ground"}]
```

The disposition must be one of the frozen vocabulary: `no-tabi-ground`, `overlap-declared`,
`contested-open`.

## Head races

The ledgers bind the snapshot heads. If any sibling head moves between the rebind and the
meter run, v17 reports `lane-screen-head-mismatch` (or an audit status drift). That is the
r52/r55/r56 correction cycle, not a ledger bug: re-run the rebind at a fresh snapshot,
re-commit, re-run the meter. The kill rule allows at most TWO correction cycles.

## What it does not do

- It never writes `corpus/`, `corpus/adjacency.tsv`, the `-r55`/`-r56` ledgers, or any
  sibling lane. It does not run a mutating git command anywhere: every byte is read with
  `git -C <lane> cat-file -p <head>:<path>`, and `git rev-parse HEAD` is the only other git
  call.
- SHA cells are hashed from RAW bytes (`execFileSync` without an encoding; the Buffer
  itself is hashed) — the r56 trimEnd correction. The UTF-8 round-trip is verified per
  province so a raw-byte sha can never silently diverge from the meter's re-encoding path.
- It creates no temporary files; `TMPDIR` is never consulted. `--scratch <dir>` optionally
  writes byte-identical copies of the two ledgers for inspection.

## Receipts in this directory

- `v17-line-audit.txt` — every changed logic line of the v16→v17 bump against the frozen
  declared change set (a)/(b), plus the `verify()` byte-identity proof.
- `v17-selftest.json` — 18/18 green at the committed bytes.
- `m4-kill-selfdev.json` (+ `m4-kill-selftest-raw.json`) — the scratch-only `predicateFrom`
  inversion kills both `predicate-assert` cases; allPass false; the committed instrument is
  unmodified and re-runs 18/18 green.
- `v17-predata-red.json` — the ONE pre-data smoke at the base revision: exit 1, 30 findings,
  all in the ledger-file-absent family (16 `audit-missing`, 14 `roster-lane-uncovered`) —
  the expected pre-data state, not a code bug.
- `rebind-r57-receipt.json` — the authoring test matrix (fresh run, meter dry-run green,
  status equivalence vs `--list-observed`, refusal, explicit-adjudication, corpus guard).
- `rebind-dryrun-meter-green.json` — v17 green over a scratch fixture carrying the
  candidate ledgers.
- `rebind-snapshot.authoring-test.json` — the authoring-time snapshot (NOT the data-time
  one; the L1's run writes `rebind-snapshot.json`).
