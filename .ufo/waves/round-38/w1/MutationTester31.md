# W1-31 — MutationTester31

## C1 D1/D2 (primary): no falsifying counterexample at the frozen input

Ran the frozen C1 counter against the isolated scratch clone at `REV=a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`:

```text
node .../c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo <scratch clone> --json
exit 1
schema=tabi-r38-c1-routed-defects
D1 stalePresent=true; supersedingCorrection=false; w2Absent=true
D2 stated=null; recomputed={ok:23,finding:11,error:0,none:0,reports:34}
```

The frozen commit is the baseline/control, and its counter correctly returns nonzero rather than claiming the full predicate. The D2 derived tally matches 23/11 across 34 reports, but the frozen `LOG.md` section does not yet state the correction (`stated=null`); D1 likewise has no detected superseding correction. This is expected baseline failure, so it does not falsify the later-REV predicate. It also does not establish that later-REV D1/D2 evidence passes. No finding from this bounded check.

## C2

No C2 runtime/evidence probe performed; no finding asserted.

## Mutation / scratch evidence

Created an isolated shared clone under `/fast/scratch/hyaku/tabi-r38/MutationTester31/lane`, asserted its top-level path, and checked out the frozen commit. Ran the pristine C1 counter once as above. No behavior-bearing mutant was executed: the fixed frozen REV has no later D1 correction in its object set, and this baseline detector result is already false/inconclusive for the claimed positive predicate. I did not treat that as a killed mutant or infer later-REV behavior. Scratch clone was removed before completion. No production files or git/jj state were changed; no installations performed.
