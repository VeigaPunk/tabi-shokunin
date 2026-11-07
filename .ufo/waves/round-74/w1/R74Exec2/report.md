CONFIRMED

Seat R74Exec2 (post-freeze repetition, capability `chromium-ime-composition-linux`, round 74 C1).
Three cold runs of the pinned driver; counter + battery on each, with the 12 PRE priors plus the L1 (a) receipt as 13th prior. Axes: repetition red rate (counter/battery), timeline near-match safety, leg-shape stability.

## 1. Cold runs (driver exit 0, predicate true, hypothesis CONFIRMED)
Command pattern: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-imecompose-round74.mjs --scratch /fast/scratch/hyaku/tabi-r74/R74Exec2/d<n> --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/w1/R74Exec2/d<n>.receipt.json --nonce tabi-r74-exec2-<n>-<hex> --http-port <p> --cdp-port <p+1>`
- d1: `tabi-r74-exec2-1-1f7185d3` ports 19241/19242, exit 0 (`EXIT:0`), predicate true, CONFIRMED, failures []
- d2: `tabi-r74-exec2-2-d9fb06e9` ports 19243/19244, exit 0, same verdict
- d3: `tabi-r74-exec2-3-a097757b` ports 19245/19246, exit 0, same verdict
- Receipts beside this report: `d1.receipt.json d2.receipt.json d3.receipt.json` (40 events each).
- Driver sha256 matches the pinned `afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc` (counter check `driver-pin` true in all three runs; counter exit 0 each).

## 2. Counter red rate — 0/148 per run, 0/148 over all 12 scored receipts
Command pattern (per run): `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-imecompose-r74.mjs --receipt <d<n>.receipt.json> --expect-driver-sha256 afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc --expect-nonce <nonce> --prior <9 PRE smokes plus 3 degenerates plus L1 (a) receipt> --json > d<n>.counter.json`; exit 0 each (`EXIT:0`).
- d1/d2/d3: verdict `clean`, checkCount 148, findings 0 (full JSON in `d1.counter.json d2.counter.json d3.counter.json`).
- Aggregated over the 9 PRE `pf-smoke<n>.counter.json` (each clean, 148, findings 0) plus my 3: 148 check ids seen, 0 checks with any red (0/148 per check across the 12 scored receipts; the pre-freeze smokes' counter JSONs were read from `.ufo/waves/round-74/controls/c1/pf-smoke<n>.counter.json`).
- No check is flaky at this n=12 sample: per-check red rate 0/12 for every declared id including `replay-event-timeline`, `event-time-quantum`, `fixture-hash`, `composition-data-chain`, `focus-events-bound`.

## 3. Battery failure rate — 0/239 per run, 2868/2868 over 12 runs
Command pattern: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-imecompose-r74.mjs --real <d<n>.receipt.json> --expect-driver-sha256 <pin> --expect-nonce <nonce> --prior <13 priors> --work /fast/scratch/hyaku/tabi-r74/R74Exec2/w<n> --laundered <3 degenerates> --json > d<n>.battery.json`; exit 0 each.
- d1/d2/d3 each: passed 239/239, failed [], coverageGap [], allOk true, isolatedCases 140, idsWithIsolatedCase 79 (`d1.battery.json d2.battery.json d3.battery.json`).
- Over the 9 PRE `pf-smoke<n>.battery.json` plus my 3: 2868 case runs, 0 failures, 0 per-case failures (every battery case name: fail 0/12). Per-case failure rate 0/239 per run, 0/2868 aggregate.
- Positive controls: `positiveOk` true in all three of my battery runs (counter clean on the unmutated real receipt).

## 4. Timeline near-match — no honest pair under 0.05 ms (min max-diff 1.0 ms over 78 pairs)
Measured over all 13 receipts (9 PRE + L1 (a) + d1/d2/d3), all with 40 events (equal length, so the counter's `replay-event-timeline` near-match predicate `<0.05 ms` on every event `ts` and `at` was evaluated for every pair):
- Minimum over pairs of the max per-event |ts|/|at| difference: **1.0 ms** (PRE smoke6 ~ PRE smoke7, max |ts| 0.9, max |at| 1.0). Next closest distinct pairs are 1.5 ms (smoke2~smoke8), 1.9 ms, 2.0 ms.
- No honest pair falls under the counter's 0.05 ms replay tolerance: `anyHonestPairUnder0.05: []` (78/78 pairs have max-diff >= 1.0 ms, 20x the tolerance). No pair is a counter near-match (`counterMatch` false for all 78).
- Off-grid events: 0 in every receipt (all 13 receipts: 0 events with `ts` or `at` off the 0.1 ms grid, i.e. `|v*10 - round(v*10)| <= 1e-4` fails) — total 0/520 events off-grid.
- Absolute offsets vary (first `ts` 617.0 to 661.1 ms, last 4550 to 4677.1 ms), but per-event *relative* offsets between honest pairs are always >= 1.0 ms somewhere, consistent with the counter's pre-freeze claim ("36 honest pre-freeze pairs differ by >= 1.0 ms somewhere"); that claim holds for the expanded 78-pair set including L1 and the 3 cold exec2 runs.
- Caveat (no counterexample, but the declared limit stands): the safety margin is clock-driven, not structural — all events in all receipts are identical modulo `ts`/`at` (see §5), so a forger still needs the counter's declared quantum shift; the tolerance is not being accidentally crossed by honest jitter.

## 5. Leg-shape identity — identical across all 13 (with expected run-binding variance)
- `legShape` (16 legs): **identical** across all 13 receipts (canonical JSON equal). The 16 leg shapes are stable.
- `focusin`/`focusout` sequence identical: `["focusin@compose-a:f","focusout@focus-ce:f","focusin@focus-ce:ce","focusout@blur:ce","focusin@nofocus-insert:ce"]` in all 13 (the "focusin leg" question: the only focusin events are in legs compose-a, focus-ce, nofocus-insert; no focusin occurs in `focus-f`/`focus-ce`/`blur` beyond that fixed sequence).
- What varies and why (all run-binding):
  - `nonce`, `host.launchToken`, `host.devtoolsListening.browserId`, CDP/fixture ports: unique per run (13/13 distinct tokens and browser ids).
  - `fixture.sha256`: differs per run solely because the nonce is embedded in the fixture (counter `fixture-hash` recomputes from the pinned driver + receipt nonce and passed everywhere).
  - `cdpSendLog` (56 entries each): identical except entry 5 `Page.navigate` URL (`?run=<nonce>` and port) and entry 6 `Runtime.evaluate` ready-expression nonce literal.
  - `events` sans `ts`/`at`: identical across all 13 (seq/type/leg/data/trust/target/value/selection all equal).
  - `plan`: identical.
  - `elapsedMs` per leg: 301-319 ms overall (PRE legs cluster 301-310, exec2 d1/d2/d3 a few ms slower, e.g. compose-a 315-319; the settle is ~300 ms nominal); `runWindow` 6014-6253 ms (PRE 6014-6069, L1 6087, exec2 6214-6253). No leg ever slipped below 301 ms or near the counter's 4 s run-window floor.
  - `ts`/`at` absolute ranges: first event 617-661 ms, last 4550-4677 ms (page-clock nominal schedule ~300 ms/leg after a ~620 ms first-event latency).

## Verdict
CONFIRMED: 3/3 cold runs clean (counter 148/148 findings=0, exit 0; battery 239/239, exit 0), zero red rate over 12 scored receipts on counter (0/148x12) and battery (0/2868), no honest timeline pair within 0.05 ms (min 1.0 ms), 0 off-grid events, 16 leg shapes byte-identical across all 13 receipts with only expected run-binding fields varying.

Tooling: no installs (host rules at `/home/vgpnk/.omp/agent/RULES.md` read; `pacman` untouched per seat bounds — `node` and `/usr/bin/chromium` were already present). Scratch `/fast/scratch/hyaku/tabi-r74/R74Exec2/` may be removed by the L1; receipts and counters/batteries JSON are copied into this report dir.

Report: .ufo/waves/round-74/w1/R74Exec2.md
