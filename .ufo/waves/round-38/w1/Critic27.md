# Critic27 — W1-27

Axes attacked: calibration (C1) and coverage (C2).

## Finding: C1 predicate fails at frozen REV

Exact bounded command:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit 1
```

Counter JSON reports `predicate:false`; specifically D1 `supersedingCorrection:false`, D2 `stated:null` despite recomputed `23 ok / 11 finding` (34 reports), all six D3 required hashes `presentInR38Section:false`, D4 lesson and mutant receipt absent, D5 census receipt absent, and D6 no numstat receipt. The command output is from the frozen REV itself, not another seat's report. This falsifies C1's predicate as applied to the frozen revision. It does not establish a runtime defect in C2; no C2 runtime was launched or independently observed, so C2 has no finding here.

Evidence of important limitation: the frozen commit is `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` (HEAD); the working tree has untracked round-38 material including `corpus/evidence/round-38/` and w1 orchestration artifacts. Counter checks git objects at `--rev`, so absent round-38 commits at that revision may reflect evaluation before the claimed round work was committed, rather than incorrect later evidence. Accordingly the falsifier is specifically: the claims predicate is false at frozen REV; it is not proof that post-REV working files cannot satisfy it.

## Smallest safe correction

Do not represent C1 as true at this frozen REV. After intended round artifacts are committed, rerun the unchanged counter against that exact measured commit; only claim true if it exits 0 and reports all D1–D6 satisfied. C2 requires a separate independently bound runtime receipt before asserting its coverage predicate.

No tools installed; no scratch files created.