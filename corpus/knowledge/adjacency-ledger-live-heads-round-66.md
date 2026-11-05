source: .ufo/waves/round-66/measure/snapshot-live-r66.tsv (live sibling heads read with git cat-file, own-work); frozen meter .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs (own-work); adjudicated ledger .ufo/waves/round-66/c1/adjudicated/ (generator .ufo/waves/round-66/counters/rebind-ledger-r66.mjs)
verified-at: 2816adb359a50c2fd83fa975e39f0650aa189984 (round-66 base); scored at b1ecd665508b85b9f94ab155c4cd04bce3e51fee
recheck: `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev <HEAD> --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --audit .ufo/waves/round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --json` (expect predicate true, findingCount 0)

# The sibling-overlap ledger at live sibling heads

The r62 sibling ledger (`corpus/adjacency-host-delta-r62.tsv`, `corpus/adjacency-host-audit-r62.tsv`)
was bound to the r62 heads. At the round-66 snapshot, 16 of 20 sibling lanes had moved.

## Measured (scored at b1ecd665)

| Input | Predicate | findingCount | Finding classes |
|---|---|---|---|
| r62 ledger at live heads (do-nothing) | false | 40 | head 21, sha 9, lines 8, quote 1, audit note 1 |
| mechanical-only rebind (lane rows and audit note) | false | 1 | quote 1 (kake-shokunin:SKILL.md:1358) |
| adjudicated rebind | true | 0 | none |

Receipts: `.ufo/waves/round-66/scored/c1-*.json`. Disposition column: 0 changes across 149
line rows (`.ufo/waves/round-66/c1/diff-summary.json`). Changed: 21 lane rows (provenance
columns), one quote (kake-shokunin:SKILL.md:1358, whole current line, disposition kept
`no-tabi-ground` with reason in `c1/adjudication.md`), one audit note (kumitate SCORECARD.md
note `:1885` to re-derived `:1898`, status `moved` unchanged).

## What this does and does not show

- It shows the ledger is current with the frozen snapshot heads; the meter's findings are cleared.
- It does not show adjacency content improved. Two critics read the move as freshness, not
  adjacency (`R66Critic.md` F4; `round-65/w1/R65Critic`). The meter checks only that a
  disposition is in the vocabulary: 149 of 149 in-vocabulary flips survive
  (`R66MutTester2.md`, sweep `.ufo/waves/round-66/w1/R66MutTester2/evidence/sweep-survivors-line-rows.tsv`). A wrong but valid
  disposition is invisible to the meter.
- The connector scan found no new browser-ground line in any moved lane (`R66Connector.md` §3):
  the hit-line set is unchanged; only the kake quote text changed.
- Drift disclosed, not a finding: kama, kengaku and kotoba moved after the snapshot.
