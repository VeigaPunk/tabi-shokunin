# CritSparseSamples — C1 timestamp-array counterexamples (round 40, w1)

Judged axis: coverage. Milestone: falsification. Leaf seat; no installs (RULES.md read; no tool installed/updated); no frozen bytes changed; no git/jj mutation.

## Method
Scratch `/fast/scratch/hyaku/tabi-r40/CritSparseSamples/` (deleted before yield). I took the committed round-39 receipt (`corpus/evidence/round-39/playwright-egress/receipt.json`) as a shape donor. I rewrote `schema` to `tabi-pw-firefox-egress-receipt-r40`, stamped a nonce (`ab`×32) on the receipt and both runs, and set `refused=false`, `survivors=0`, `portClosed=true`. Every sample and final sweep carries valid `ss`/`proc` (ticks 1, nonLoopback 0). I varied only `runs[*].samples[*].t` (and a few non-scored fields). Each mutant was scored by the **frozen counter** `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs <file> --nonce <N>`.

Frozen digests, taken before and after (`frozen-hashes-after.txt`), all match `claims.json#frozenDigests`:
- driver `1f8a15f0…4545b`
- wrapper `a0e564c7…0735`
- selftest `5a0b702d…d82`
- counter `0b452eac…253c`

Harnesses and raw output are in this folder: `harness1.mjs`, `harness2.mjs`, `run1-stdout.txt`, `run2-stdout.txt`. They write mutants to the cwd (scratch).

Timestamps below are offsets in ms from T0=1793120277000 unless noted. "Both" means run1 and run2 gave the same result.

## Results (exact counter outcomes)

| # | Mutant (samples[].t) | exit | predicate | findings |
|---|---|---|---|---|
| A | control, 9 samples @125 ms, span 1000 | 0 | true | none |
| B | 8 samples @143 ms (span 1001) | 0 | true | none |
| E | 7 samples @100 ms + last at 999 (window 999) | 1 | false | `run{1,2}-sample-span` |
| WIN999b | last at 999.999 | 1 | false | `sample-span` |
| WIN1000 | last at exactly 1000 (8 samples) | 0 | true | none (boundary inclusive, as frozen `>=1000`) |
| G | r39-like 9@100 ms, span 800 | 1 | false | `sample-span` |
| Q | 7 samples, span 1200 | 1 | false | `sample-count` only |
| T | `sampleCount:20`, `coverageMs:5000` lie, 8 samples span 700 | 1 | false | `sample-span`. The lying fields are ignored and cannot help. |
| S | samples span 800, `finalSweep.t`=+1560, `coverageMs`=1560 (tail-inclusive) | 1 | false | `sample-span`. A tail-inclusive window is correctly NOT counted. |
| U | run1 span 1050, run2 span 700 | 1 | false | `run2-sample-span` only |
| H/D2 | duplicate final timestamp (…1200,1200) | 1 | false | `sample-order` |
| D3 | duplicate first pair (0,0,250…) | 1 | false | `sample-order` |
| I | decreasing last (…1200,500) | 1 | false | `sample-order` + `sample-span` |
| J | decreasing middle (0,300,200,600…1400), last-first=1400 | 1 | false | `sample-order` |
| K2/K3 | `t` key absent mid, or at first and last | 1 | false | `sample-order` |
| L | NaN (serialises to null) | 1 | false | `sample-order` |
| O | null first | 1 | false | `sample-order` |
| P | Infinity last (serialises to null) | 1 | false | `sample-order` + `sample-span` |
| M/N | numeric strings in the middle, or all strings (`"1793120277600"`) | 1 | false | `sample-order` (`Number.isFinite` does not coerce) |
| Z | `samples[2]=5` (non-object) | 1 | false | run1 only: `run1-sample-order`, `run1-sample3-ss-unavailable`, `run1-sample3-proc-unavailable` (in `run1-stdout.txt`) |

Every malformed-timestamp class is refused fail-closed.

**Passes, not refused by the frozen counter** (exit 0, predicate true, findings `[]`):

| # | Mutant | Observation |
|---|---|---|
| C | `[0,100,…,600,1000]` | 400 ms hole between samples 7 and 8. |
| D | `[0,500,501,…,505,1000]` | 500 ms holes on both sides of a 6-sample cluster. |
| V | run1 dense, run2 = C | Per-run gaps are not compared. |
| TT | 7 live samples 0..600 + a "tail" sample at 1000 (e.g. taken after browser close) | Passes. |
| TT2 | 7 samples in 0..300 + tail sample at 1000 | Live window is 300 ms. Passes. |
| TT3 | 7 samples within ~0.006 ms + tail at 1000 | Effectively 1 instant of live coverage. Passes. |
| X/NEG0/ZERO | negative or zero-anchored finite `t` (e.g. −1793120377000…), or far-future `t` (8.99e15) (Y) | Timestamps are not anchored to a wall clock or to `measuredAt`. |
| R3 | `t` in absurd units (steps of 200 000) | The unit is not bound. |

## Interpretation (separate fixable defect from tradeoff)
1. **Malformed timestamps (missing, NaN, string, null, Infinity, duplicate, decreasing) and a sampled window ≤999 ms: no counterexample.** The counter refuses all of them with specific findings.
   - Boundary is `>=1000`, tested at 999, 999.999 and 1000.
   - Tail-inclusive coverage cannot be smuggled in through `coverageMs`, `sampleCount` or `finalSweep.t`, because the counter reads only `samples[].t`.
2. **Sparse samples inside the window pass (C, D, V, TT, TT2, TT3).** This is exactly what the frozen predicate says: "first-to-last observed timestamp span >=1000ms", with 8 or more strictly increasing samples. It is **not a violation of the frozen predicate**, and it is a tradeoff for the claim as written, not an admission bug.
   - But the C1 title and killRule speak of "actual sample-span" coverage. A receipt with `{0,100,…,600,1000}`, or 7 clustered samples plus a single tail point, scores true although egress in the 400–700 ms hole is unobserved.
   - The counter has no max-inter-sample-gap bound, no check that `t` falls between session start and browser close, and no check that the last sample precedes the final sweep or `coverageMs`.
   - In the live path this is mitigated only by the driver's 100 ms `setInterval` and its span-wait loop (driver lines 277-283 and 325-327). The counter does not enforce that.
3. **Timestamp provenance is unanchored (X/Y/R3/NEG0).** A hand-forged receipt is refused only by nonce binding, which is the wrapper's job. The wrapper generates a nonce per invocation and the counter takes `--nonce`, so a synthetic receipt cannot obtain it. This is a defence-in-depth gap only, not a pass path through the measured command.
4. Driver caveat (out of scope to change): the live driver's `samples[*].t` is `Date.now()` at the moment of sampling (driver line 232). The 1000 ms span wait is a driver fail-closed (`FailClosed` at lines 326-327), independent of the counter.

## Smallest safe corrections (NOT applied; the freeze forbids amendment this round)
For a later round, as a new frozen predicate before data:
- add a max adjacent-gap bound, e.g. every `t[j]-t[j-1] <= 250` (the live cadence is ~100 ms, with the r39 receipt showing 99-101 ms steps);
- bind `finalSweep.t > samples.at(-1).t`;
- bind `samples[0].t >= run start` and `samples.at(-1).t <= run end/coverage`;
- require `t` within a plausible epoch window of `receipt.measuredAt` or the wrapper wall clock.

Under the round-40 frozen predicate, none of the sparse cases can be classed as a failure of C1.

## Limitations
- I did not run the live Firefox wrapper (not assigned). All results come from synthetic receipts scored by the frozen counter alone, not through `measure-c1-round40.mjs`, so the nonce-generation and driver-spawn paths are untested here.
- Fractional-ms cases are subject to double precision at epoch scale (about 0.0002 ms), so TT3's exact offsets are approximate.
- Case Z is in `run1-stdout.txt` (harness1). Its non-object sample yields `t` undefined, hence the `sample-order` finding alongside the two unavailable findings.

VERDICT finding — C1 frozen counter refuses duplicate, decreasing, missing, NaN, string, null and Infinity timestamps, a sampled window ≤999 ms, and tail-inclusive coverage via finalSweep/coverageMs/sampleCount. It admits sparse-sample receipts with large inter-sample gaps and a tail sample (first-to-last span exactly ≥1000 ms), which is within the frozen predicate wording but leaves the coverage claim's observation density unbounded. No frozen byte changed.
