# R66MutTester2 — C1 adjacency mutation probe (round 66, w1)

Target: adjudicated ledger `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` + `adjacency-host-audit-r66.tsv`, copied to scratch (never edited). Frozen meter: `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs`, sha256 `4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5` (unchanged, run only). Argv: `--rev 2816adb359a50c2fd83fa975e39f0650aa189984 --repo <lane> --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --delta <file> --audit <file> --json`.

Input sha256 (adjudicated copies, identical to source): delta `3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105` (175 lines), audit `0a5f3aa87df229efa7128735d0a11825fb91fce55338fd617f99d39a87e427bd` (17 lines).

## Results

| Case | Edit (on scratch copy) | predicate | findingCount | exit | first finding id |
|---|---|---|---|---|---|
| baseline | none | true | 0 | 0 | — |
| (a) | `audio-shokunin` line row `PROVINCE.md:4`: disposition `no-tabi-ground` → `overlap-declared` | **true** | 0 | 0 | **SURVIVOR** (none) |
| (b) | delete line row `audio-shokunin` `PROVINCE.md:4` (browser-ground hit, quote contains "headless") | false | 1 | 1 | `delta-line-missing: audio-shokunin:PROVINCE.md:4` |
| (c) | lane row `audio-shokunin` head `f9da7ee97e0ba95da1803c2afe9c616c519bae18` → `0000…0000` (40 hex) | false | 1 | 1 | `lane-screen-head-mismatch: audio-shokunin` |
| (d) | lane row `audio-shokunin` `PROVINCE.md` provinceSha256 `20d881a6…c149` → `0`×64 | false | 1 | 1 | `lane-screen-sha-mismatch: audio-shokunin:PROVINCE.md` |
| (e) | second line row on key `audio-shokunin:PROVINCE.md:4` with `overlap-declared` (after the first) | false | 1 | 1 | `delta-disposition-conflict: audio-shokunin:PROVINCE.md:4: no-tabi-ground vs overlap-declared` |
| (f) | audit row `kumitate-shokunin@89cbd998…:SCORECARD.md:1723` status `moved` → `unchanged` (meter derives `moved`) | false | 1 | 1 | `audit-status-mismatch: …:SCORECARD.md:1723: claimed unchanged observed moved` |
| control (extra) | disposition `no-tabi-ground` → `bogus-disp` (out of vocabulary) | false | 1 | 1 | `delta-disposition: audio-shokunin:PROVINCE.md:4: bogus-disp` |

Survivors: **(a)**. The meter stays predicate true when an in-vocabulary disposition is replaced.

## Survivor analysis (coverage finding, not a contract change)

The meter checks a line row's disposition only for vocabulary membership (`DISPOSITIONS.includes(rowFor[7])`). It never compares it to any adjudication/ruling source, so a wrong but valid disposition is invisible. Sweep: every one of the 149 line rows was flipped to each of the two other in-vocabulary values, one at a time (298 meter runs, all exit 0 or 1, none exit 2). **149 of 149 line rows survive**; zero kills. The list is in `evidence/sweep-survivors-line-rows.tsv`. Only out-of-vocabulary dispositions are caught (control above).

## Commands and exit codes

- `sha256sum` on the meter → matches the README value.
- Baseline and mutants (a)–(f): meter exits 0, 0, 1, 1, 1, 1, 1 for baseline, a, b, c, d, e, f. Receipts in `evidence/mutants/*.json|.exit|.stderr`.
- Mutant generator `harness/mutate.mjs` exit 0; the audit-side (f) target chosen from `meter --list-observed --fleet … --snapshot …` (output `observed.json`, exit not separately captured, file produced and used).
- OOV control: meter exit 1.
- Sweep `harness/sweep.mjs`: exit 0.
- Harness driver `harness/run.sh` exit 0 (prints `done`).
- No meter exit 2 anywhere.

## Notes

- A first dry run used the r62 ledgers and gave baseline predicate false (findingCount 40), so those mutant results were inconclusive and discarded. I also built a stand-in baseline by rebinding r62 to the snapshot before the adjudicated ledger existed; it was discarded once the real ledger landed (predicate true, findingCount 0, also confirmed by R66Executor1). No results in this report come from the stand-in.
- Tools installed: none. No git writes; the meter and lane were read only. Scratch `/fast/scratch/hyaku/tabi-r66/R66MutTester2` is removed before yield.
- Harness to rerun: `harness/run.sh <delta> <audit> <outdir>` (needs `mutate.mjs` and `summ.mjs` alongside; `sweep.mjs <delta> <audit> <outdir>` for the sweep).
