# W1-14 — adversarial review (C1/C2)

## Findings

### High — C1 is false at current measured revision; D3's LOG correction is absent

At `REV=3bc0b108708c46c800f9050a1caa25bfe3bf5e5a`, running the frozen command

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev HEAD --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

returned `predicate:false`. D3 reported all six required hashes absent from the Round 38 LOG section (`present=false`, while each was a commit and ancestor), and `freezeLandingStated:false`. `LOG.md:2525-2531` has the Round 38 section and its prose, but contains neither the six full hashes nor the required `34ed508c` freeze-entry attribution. This directly falsifies the frozen C1 predicate at that measured revision; adding only the hash's existence/ancestry does not repair the missing LOG evidence. The same counter run also reported D1 `w1-results.json` absent, D4's captured-by/M3 row and mutant receipt absent, D5 `census-end.txt` absent, and D6 numstat receipt absent. D2 did re-derive 34 reports as 23 ok / 11 finding, matching LOG.

### Medium — C1 D6 baseline pin disagrees with frozen claims baseline

`claims.json:5-6` freezes `baseline` as `98239d0396ff32c3feb14638b3214fe688e8b122`; the frozen counter hardcodes `BASELINE = 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35` (`.ufo/waves/round-38/counters/c1-routed-defects.mjs:13`). D6 only checks that the receipt contains the counter's `BASELINE` (lines 219-222), so it can accept a `3f42a5c..REV` receipt even though the frozen claim's `baseline` field is `98239d0`. The LOG distinguishes the round-start baseline from the later frozen-instrument candidate (`LOG.md:2527`), but the claim's own baseline field does not. A D6 receipt using the claim's baseline while the counter expects 3f42a5c—or vice versa—falsifies the claim's endpoint contract. At the measured revision the receipt was absent, so no endpoint comparison could pass.

### Medium — C2's egress/cleanup observations do not cover the claimed process interval/set

The bounded two-run driver execution succeeded and produced identical first-shot SHA `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, Playwright `1.64.0`, browser `157.0`, loopback-only recorded HTTP request URLs, `binding:true`, zero sampled non-loopback TCP lines, zero recorded survivors, and closed fixture ports. This supports the observed run, but the driver can miss counterexamples: `scripts/playwright-firefox-loopback-round38.mjs:73-83` launches Firefox and snapshots PIDs before starting the 400ms `ss -tnp` sampler; the sampler checks TCP only. Cleanup at lines 137-142 counts only the initially captured PIDs. Thus a non-loopback socket during launch/before sampling (or a descendant Firefox PID created after the snapshot) is outside the measurement and could coexist with a zero receipt. A launch-time non-loopback TCP connection or a surviving post-snapshot child is a concrete falsifier of the broad egress/zero-survivor interpretation; the current receipt would not observe it. No such event was observed in my run.

## Residual risk and verification

- C2 receipt content is written under `--out`; this seat's receipt was intentionally scratch-only and removed. `git ls-tree` at the measured revision showed the knowledge row but no committed round-38 `measure/` or `baseline/` receipts; the C1 counter independently confirmed its required receipt absences.
- I did not run a baseline-control counter; no claim of baseline-control success/failure is made.
- No tools installed or updated. Scratch `/fast/scratch/hyaku/tabi-r38/Reviewer14/` was removed before reporting.

Report: `.ufo/waves/round-38/w1/Reviewer14.md`
