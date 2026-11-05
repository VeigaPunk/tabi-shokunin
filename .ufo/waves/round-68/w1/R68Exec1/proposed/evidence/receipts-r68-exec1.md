# R68Exec1 receipts — C1 worksheet generation, production gate, controls, forgeries

Producer shas (sha256, working tree at base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8; both gate and counter are uncommitted `??` files):

| producer | sha256 |
|---|---|
| scripts/check-adjacency-adjudication-r68.mjs (gate) | e7f042916833828096c9550b299085934ad195aa318b864cfd7f68cc86963c1e |
| .ufo/waves/round-68/counters/build-worksheet-r68.mjs (counter) | 85e168020e95634c875b93b5384940805e9a0bec0d7f0e0a63a375d616a31750 |
| .ufo/waves/round-68/w1/R68Exec1/proposed/gen-worksheet-r68-R68Exec1.mjs (independent generator) | a0de26dd3979dd58014b2f11ae43ff3515cfd44802c4a9c81621acd1422695d4 |
| .ufo/waves/round-68/w1/R68Exec1/proposed/audit-line-resolution-r68.mjs (line audit) | 3f693e580725146743b78c3822a33d450e01710673e6af9c1abb172e2edf2431 |
| .ufo/waves/round-68/w1/R68Exec1/proposed/evidence/fixtures/ws-lineswap.tsv | 182577ffd27beaa6fb84dfc391a9c5c4e0a2120149b4205ef557d6f3ca3955dc |

Input pins (sha256):
- ledger `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` = `3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105` (49 contested-open rows counted via awk before any gate run)
- snapshot `.ufo/waves/round-66/measure/snapshot-live-r66.tsv` = `a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74`
- worksheet (mine) = `a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91`
- forged line-swap ledger = `b7d44ad084aa33393369784988480e2fb4c2bdc7464d8ac54a0393fa3a662c05`

Runtime: node v24.21.0 (preinstalled; no tool installs performed; RULES.md read; pacman untouched).

## R0 — independent generation (determinism + counter cross-check)

```
node proposed/gen-worksheet-r68-R68Exec1.mjs --ledger <LEDGER> --snapshot <SNAPSHOT> --out /fast/scratch/hyaku/tabi-r68/R68Exec1/ws-mine-a.tsv
→ {"ok":true,"rows":49,"out":".../ws-mine-a.tsv","worksheetSha256":"a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91"} rc=0
```
Second run to `ws-mine-b.tsv`: rc=0, `cmp` byte-identical → determinism=byte-identical.
Counter (corrected r[6]) run to `ws-counter.tsv`: rc=0 → `independent-diff=identical-to-counter`; sha256 identical (a6028e70…). 50 lines (header + 49).

## R1 — C1 production gate on R68Exec1 worksheet

```
node scripts/check-adjacency-adjudication-r68.mjs \
  --ledger  .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv \
  --worksheet /fast/scratch/hyaku/tabi-r68/R68Exec1/ws-mine-a.tsv \
  --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv \
  --fleet /home/vgpnk/Projects/shokunin \
  --expect-ledger-sha256 3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105 \
  --expect-snapshot-sha256 a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74 \
  --expect-pending 49 --max-adjudicated 0 --json true   (cwd=/fast/scratch/hyaku/tabi-r68/R68Exec1)
→ {"ok":true,"findings":[],"byCheck":{},"checked":49,"pending":49,"adjudicated":0,"gate":"check-adjacency-adjudication-r68"} rc=0
```

## R2 — C1 15-case selftest

```
node scripts/check-adjacency-adjudication-r68.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r68/R68Exec1/selftest-c1
→ {"verdict":"clean","cases":15,"failed":0,"results":[...green, missing-worksheet, missing-row, duplicate-key, unknown-key, quote-mismatch, head-mismatch, status-vocabulary, pending-fields-dirty, adjudicator-missing, adjudicator-author, reason-missing, adjudicated-over-ceiling, quote-unresolved, ledger-pin ...]} rc=0
```
(selftest wrote only into the given scratch; 192K fixture tree, deleted at cleanup.)

## R3 — line-specific resolution audit (gate does not perform this)

```
node proposed/audit-line-resolution-r68.mjs --ledger <LEDGER> --snapshot <SNAPSHOT> --fleet /home/vgpnk/Projects/shokunin --out proposed/evidence/line-resolution-audit-r68.json
→ {"rows":49,"resolved":49,"lineExact":49,"substringOnly":0,"unresolved":0,"noLineSuffix":0,"headMismatches":0} rc=0
```

## R4 — controls and forgeries through the production CLI (same pins as R1 unless noted)

| id | argv delta vs R1 | rc | stdout (verbatim JSON) |
|---|---|---|---|
| P1 missing-worksheet | `--worksheet $S/nope.tsv` | 1 | `{"ok":false,"findings":["worksheet-missing: 1"],"byCheck":{"worksheet-missing":1},"checked":49,"pending":0,"adjudicated":0,…}` |
| P2 header-only | `--worksheet $S/ws-header-only.tsv` | 1 | `{"ok":false,"findings":["missing-key: kagi-shokunin:PROVINCE.md:64", … ×49 keys …,"pending-count: 0"],"byCheck":{"missing-key":49,"pending-count":1},"checked":49,"pending":0,"adjudicated":0,…}` — note: NO `worksheet-header` token; a valid header with zero rows fails via coverage only |
| P3 wrong-quote (row1 quote=`-`) | `--worksheet $S/ws-wrong-quote.tsv` | 1 | `{"ok":false,"findings":["quote-mismatch: 2"],"byCheck":{"quote-mismatch":1},…}` (no quote-unresolved: `-` is a substring of the file at head — includes() is loose) |
| P4 wrong-head (row1 head=`c`×40) | `--worksheet $S/ws-wrong-head.tsv` | 1 | `{"ok":false,"findings":["head-mismatch: 2","path-unresolved: 2"],"byCheck":{"head-mismatch":1,"path-unresolved":1},…}` |
| P5 author-lane adjudicator | `--worksheet $S/ws-author-tabi-shokunin.tsv` (row1 → status adjudicated-agree, adjudicator `tabi-shokunin`, verdict agree, reason set, date 2026-11-05), NO `--max-adjudicated` | **0** | `{"ok":true,"findings":[],"byCheck":{},"checked":49,"pending":48,"adjudicated":1,…}` — author-lane adjudication passes GREEN |
| P6 exact `tabi` adjudicator | `--worksheet $S/ws-author-tabi.tsv`, NO `--max-adjudicated` | 1 | `{"ok":false,"findings":["adjudicator-author: 2"],"byCheck":{"adjudicator-author":1},"checked":49,"pending":48,"adjudicated":1,…}` |
| P7 line-swap | `--ledger $S/ledger-lineswap.tsv --worksheet $S/ws-lineswap.tsv --expect-ledger-sha256 b7d44ad084aa33393369784988480e2fb4c2bdc7464d8ac54a0393fa3a662c05 --expect-pending 49 --max-adjudicated 0` | **0** | `{"ok":true,"findings":[],"byCheck":{},"checked":49,"pending":49,"adjudicated":0,…}` — quotes of `kama-shokunin corpus/knowledge/listener-census.md:241` and `:242` swapped in BOTH ledger and worksheet; gate green |

Fixture bytes persisted at `.ufo/waves/round-68/w1/R68Exec1/proposed/evidence/fixtures/` (7 files + builder script).
