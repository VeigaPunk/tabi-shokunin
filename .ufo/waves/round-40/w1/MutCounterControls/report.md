# MutCounterControls — round 40 C1 receipt mutation

## Probe

Tested the frozen C1 scorer against one live, nonce-bound two-run Firefox receipt, three output-receipt-only mutants, then the unchanged pristine receipt again. The scoring detector was the frozen `c1-sample-span-v3.mjs`; no counter/runner bytes were modified. Scratch: `/fast/scratch/hyaku/tabi-r40/MutCounterControls/` (removed before handoff).

Fresh nonce: `ed3546ed39ae97b0533dab074a28190777098b59113798092cf81afaab62607e`.

## Frozen-byte evidence

- Freeze: `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`.
- Counter SHA-256 before and after the probe: `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` (matches `claims.json`).
- Runner SHA-256 at freeze and in working tree: `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b`.
- Measurement wrapper SHA-256 in working tree: `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735`.
- `RULES.md` was read; no tools were installed or updated.

## Commands and observed output

Live receipt generation (cwd was the isolated scratch directory):

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs --round40 --runs 2 --out /fast/scratch/hyaku/tabi-r40/MutCounterControls/receipt-pristine.json --scratch /fast/scratch/hyaku/tabi-r40/MutCounterControls/driver-scratch --nonce ed3546ed39ae97b0533dab074a28190777098b59113798092cf81afaab62607e
```

Driver stdout, exit 0:

```json
{"wrote":"/fast/scratch/hyaku/tabi-r40/MutCounterControls/receipt-pristine.json","runs":2,"refused":false,"binding":true,"egress":0,"survivors":0,"firstShot":["ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0","ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0"],"runNonce":"ed3546ed39ae97b0533dab074a28190777098b59113798092cf81afaab62607e"}
```

The generated runs each had 12 strictly increasing samples: first-to-last spans were 1101 ms and 1100 ms; each `ss`/`proc` sample and final sweep had positive ticks; non-loopback counts were zero; owned trees had 5 PIDs; both ports were closed; browser version was `157.0`; survivors were zero; first-shot hashes matched. The recorded full receipts are in `evidence/receipt-pristine.json`.

The same counter command was applied to pristine, mutated, and restored receipt bytes:

```text
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-40/counters/c1-sample-span-v3.mjs <receipt-file> --nonce ed3546ed39ae97b0533dab074a28190777098b59113798092cf81afaab62607e
```

The five counter calls were run by `node run-cases.mjs` after `node mutate-receipt.mjs`; `evidence/counter-results.json` preserves each full parsed stdout, stderr, and exit status. Results (all nonce matches true):

| Receipt bytes | Exit | Predicate | Findings | Receipt SHA-256 |
|---|---:|---|---|---|
| pristine before | 0 | true | `[]` | `10531669e85c83c41428b290cf2d49756b2af0899afdf7e6013f4c318b2ce87f` |
| tail-inclusive duration | 1 | false | `run1-sample-span`, `run2-sample-span` | `e753a9258d8fd0be9c4292f6d0ccf9b156a064dc728ed93cdc3ec2615715e90d` |
| synthetic zero sample | 1 | false | `run1-sample13-ss-unavailable`, `run1-sample13-proc-unavailable`, `run2-sample13-ss-unavailable`, `run2-sample13-proc-unavailable` | `37db1d84c229a79757b4f0d7e40bafd5136f4924faaa0361e946a0486bcf5fcf` |
| sample count without time coverage | 1 | false | `run1-sample-span`, `run2-sample-span` | `9db2d38676f80e0f569294de82fd6d6ab64b12b4ea7930650cde42563605f0ed` |
| pristine restored/replayed | 0 | true | `[]` | `10531669e85c83c41428b290cf2d49756b2af0899afdf7e6013f4c318b2ce87f` |

## Mutants and disposition

- **Tail-inclusive duration:** rescaled each run's sample timestamps to a strictly increasing 999 ms span while retaining the actual `coverageMs` values (1897/1893 ms) and adding `durationMs` from that tail-inclusive coverage. The counter rejected both runs on sample span; it scores the observed sample timestamps, not the claimed duration.
- **Synthetic zero:** appended a sample to each run with `ss.ticks=0` and `proc.ticks=0` (while keeping count and span sufficient). The counter rejected both zero-tick observations.
- **Sample count without time coverage:** retained all 12 samples per run but set timestamps to 1 ms increments (11 ms total span). The counter rejected both runs on sample span.

Mutants were separate files; the pristine receipt was not changed. The restored/replayed pristine receipt produced the same SHA-256 and green result as the initial pristine pass.

Evidence files (relative to `tabi-shokunin`):

- `.ufo/waves/round-40/w1/MutCounterControls/evidence/receipt-pristine.json`
- `.ufo/waves/round-40/w1/MutCounterControls/evidence/mut-tail-inclusive.json`
- `.ufo/waves/round-40/w1/MutCounterControls/evidence/mut-synthetic-zero.json`
- `.ufo/waves/round-40/w1/MutCounterControls/evidence/mut-count-no-coverage.json`
- `.ufo/waves/round-40/w1/MutCounterControls/evidence/counter-results.json`

## Scope limitation

This isolated probe invoked the frozen driver directly to obtain a fresh receipt, then invoked the frozen scorer on pristine/mutated/restored receipt bytes. It did not invoke the measurement wrapper; wrapper integration is therefore not asserted by this report. No external site was contacted. The only production-tree writes were this lane's report and evidence files.

VERDICT ok — all three receipt mutants were refused; pristine and restored receipt passed; frozen counter digest remained unchanged.
