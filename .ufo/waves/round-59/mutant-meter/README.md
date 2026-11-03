# R59MutMeter — mutation receipts for the v19 adjacency meter (round 59, C1)

Instrument: `.ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs`
sha256 `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c`, 53 384 bytes.
The canonical instrument was read and copied only; every mutant lived in
`/fast/scratch/hyaku/tabi-r59/R59MutMeter/` and was restored to the pristine bytes after its run.

Baseline (independent of the authoring seat): `node …v19.mjs --selftest` → exit 0,
`allPass true`, **38/38 cases**. Fixture probe baseline: 5/5 fixtures green
(`probe-pristine.json`).

| mutant | single logic change | failing selftest cases | failing fixture | verdict |
|---|---|---|---|---|
| M1 | `caseOk` verdict drops the findings term (`return okPredicate && okCount`) | `harness-guard-findings-predicate-match`, `harness-guard-findings-count-match` | — (harness-level; probe N/A) | **KILLED** |
| M2 | `parseRef` replaced by a lenient parser (accepts alpha/empty/signed/no-`@`/no-colon) | `map-ref-unparseable`, `map-ref-alpha-suffix`, `map-ref-empty-suffix`, `map-ref-signed-suffix`, `map-ref-no-at`, `map-ref-no-second-colon` | `F2-map-ref-alpha-suffix` | **KILLED** |
| M3 | `bg-hit-unadjudicated` emission deleted from the universal screen | `bg-hit-unadjudicated-map-lane`, `kama-screen-weakening-observable` | `F3-bg-hit-unadjudicated`, `F6-screen-vocabulary` | **KILLED** |
| M4 | `orphan-line-row` guard deleted | `orphan-line-row` | `F4-orphan-line-row` | **KILLED** |
| M5 | stray-line-row relPath re-scoped lane-only (lane's first lane-row path) | `line-row-unscreened-file`, `kama-invented-row`, `kama-quote-spliced`, `kama-head-citation`, `kama-mixed-forgery`, `kaidoku-multi-file-keyed-green` | `F5-line-row-unscreened-file` | **KILLED** |
| M6 | `BG_WORDS` gutted to `['cdp','headless','screenshot']` | `kama-invented-row`, `kama-quote-spliced`, `kama-head-citation`, `kama-mixed-forgery`, `kama-screen-weakening-observable`, `kaidoku-multi-file-keyed-green` | `F6-screen-vocabulary` | **KILLED** |

No survivor. Every receipt records the mutant sha, the exact unified diff, the
baseline/mutant/restored detector outputs, and restoration evidence
(`equalsPristine true`, both detectors green again, canonical sha unchanged).

## Files

| path | content |
|---|---|
| `M1-kill.json` … `M6-kill.json` | one receipt per mutant (pinned identity, sha, diff, failing case ids, verdict, restore) |
| `fixture-probe.mjs` | the independent 5-fixture behavioral detector (imports the meter's `verify`) |
| `selftest-baseline.json`, `probe-pristine.json` | pristine detector outputs |
| `runs/` | raw selftest/probe outputs for mutant and restored states, and `diff-M*.patch` |
| `manifest.sha256` | sha256 of the 39 files present when it was generated (this README was written after and is not self-listed) |
