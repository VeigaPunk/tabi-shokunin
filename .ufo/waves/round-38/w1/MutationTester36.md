# W1-36 — C2 Firefox runtime falsification

**Verdict: finding (measurement boundary), not a counterexample to the recorded receipt values.** Frozen claims `claims.json` C2 predicate says “zero observed non-loopback sockets”; the driver/receipt do not establish that no non-loopback connection occurred during the run. This is falsifiable by a short-lived non-loopback TCP connection between sampler ticks.

## Concrete C2 gap

At `scripts/playwright-firefox-loopback-round38.mjs:73-83`, Firefox is launched, its PIDs are snapshotted, then a `setInterval(..., 400)` calls `ss -tnp` and increments `nonLoopback` only for lines matching those PIDs. Thus sockets that open and close within the 400 ms sampling interval are never observed; connections opened before PID capture are also outside the sample. The committed receipt reports zero samples’ non-loopback count (`corpus/evidence/round-38/playwright-firefox/receipt.json:153-157,334-338,379-381`), not continuous socket exclusion. A falsifying detector test is a fixture/browser process making a non-loopback connection wholly between two sampler ticks: the receipt would still pass despite actual egress. This limits the claim to sampled-observation evidence, not comprehensive egress absence.

Other receipt dimensions are internally consistent: lines 4-6 identify Playwright 1.64.0 and browserVersion 157.0 (but `firefoxVersion` is null); lines 158 and 339 show equal first-shot SHA-256 values; lines 189-190 and 370-371 show zero surviving PIDs and closed ports; aggregate lines 379-381 say binding=true, egress=0, survivors=0. Driver lines 131-143 close browser and server, then check survivors/port closure. No contradiction in those recorded outputs found.

## Frozen-byte evidence

The five digests in claims.json match the working-tree files exactly:

```
sha256sum .ufo/waves/round-38/counters/c1-routed-defects.mjs .ufo/waves/round-38/counters/c1-adjacency-sweep-v6.mjs .ufo/waves/round-38/counters/c2-firefox-bidi-v4.mjs .ufo/waves/round-38/counters/c2-battery-mutants.mjs scripts/playwright-firefox-loopback-round38.mjs
209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7  c1-routed-defects.mjs
704da8068783b6c1debcefcf31a46cf503438e8974a27ebde73ade5053a890bb  c1-adjacency-sweep-v6.mjs
6a14d8ca9200270e1fbd8537ddd74b986c181112eb97a9cfbc98dbb64047fecf  c2-firefox-bidi-v4.mjs
6d7a925b563cdb1dcf30828087f9600d0b0f9deb98df21deb54d2a7cf91e503c  c2-battery-mutants.mjs
4cf3a8499ad30158dd03d0b518ce8a79967bd0afafd2ea0f8b5730b0b02e75c1  playwright-firefox-loopback-round38.mjs
```

`git rev-parse HEAD` returned `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, matching the assignment’s frozen commit; `claims.json` itself records `frozenAt` and `baseline` as `98239d0396ff32c3feb14638b3214fe688e8b122`, which is the parent commit in the observed log (`a8e7d50 round-38: freeze calibration and Firefox capability claims`; `98239d0 round-38: add frozen-instrument candidates and Firefox driver`). This is consistent with frozen instrument baseline vs claim landing, not a discrepancy.

## C1 observation / mutation status

The inspected C1 counter is frozen and computes D1-D6 from committed evidence (`.ufo/waves/round-38/counters/c1-routed-defects.mjs:78-223`). No bounded pristine/mutated/restored C1 detector run was performed: the required clean clone and a contained runtime mutation probe were not created, so this is not a killed mutant and no C1 verdict is asserted. Likewise, the C2 detector mutation battery was not run. No production bytes were mutated; no tool installed. Scratch directory `/fast/scratch/hyaku/tabi-r38/MutationTester36/` was left empty.
