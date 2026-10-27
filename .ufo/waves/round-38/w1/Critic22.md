# W1-22 — calibration / coverage falsification

Axes: calibration (C1) and coverage (C2).

## Counterexample: C1 is not true at the frozen measured revision

Exact bounded check (lane repo, frozen `HEAD` = `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`):

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev HEAD --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit 1
```

Counter output reports `d1.supersedingCorrection:false` and `d2.stated:null`, while it independently recomputes D2 as `ok:23, finding:11, reports:34`. Its own findings therefore reject the predicate at this revision. More directly, counter source `.ufo/waves/round-38/counters/c1-routed-defects.mjs:85-89` requires an append-only round-38 correction after the stale scorecard line, and `:108-111` requires `23 ok / 11 finding` inside the LOG round-38 slice. Both are absent per the command output. This falsifies the frozen predicate as applied to the frozen commit; it does not establish that no later revision can satisfy it. A later frozen/evaluated revision with both correction and tally plus all remaining D1-D6 checks passing would falsify this counterexample.

D5/D6 further cannot be independently affirmed from this frozen tree: counter source `:180-183` requires `.ufo/waves/round-38/measure/census-end.txt`; `git show HEAD:.ufo/waves/round-38/measure/census-end.txt` returns `fatal: path ... does not exist in 'HEAD'`. These absent receipts are a specific failure of the claimed measurement surface, not evidence of a numeric mismatch.

## C2: no runtime finding

Did not run the browser driver or infer runtime properties from its source. Frozen claim requires two cold runs with matching first screenshot hashes, loopback-only requests, zero observed external sockets, zero survivors, and verified interaction evidence (claims.json lines 34-41). No committed C2 runtime receipt was available in this inspection. Therefore C2 remains unverified here; a receipt demonstrably bound to the frozen driver/runtime and passing those checks would falsify any concern based only on missing evidence.

No installs or source changes. Report is the only write.