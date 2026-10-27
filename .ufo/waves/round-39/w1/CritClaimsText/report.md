# CritClaimsText — round 39, attempt 1

Axes: coverage; calibration. Source anchors: claims freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, round-start baseline `5bc56a81d196caeb8d24551928b883802697aabb`; both resolve in the lane repository. Claims read at `.ufo/waves/round-39/claims.json`. C1 and C2 predicate strings byte-equal their respective frozen `PREDICATE_SENTENCE` constants (direct UTF-8 byte comparison).

Scratch experiment used `/fast/scratch/hyaku/tabi-r39/CritClaimsText` and was removed by shell EXIT trap. Four C2 claim sentence mutants were supplied through `--claims`: appended punctuation, doubled whitespace, changed `AND` case, and token replacement. Exact commands:

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 9c09ebb1e2ff594c70ce72093b5d4133c1734dca --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --claims "$f" --json
```

Observed on all four: exit 1, `predicate=false`, finding `d7-sentence-mismatch`, `d7.sentenceMatch=false`. Important counterexample: the token mutant replaced first `34` with `35`; claims parser still reports `sentenceMatch=true` and emits no D7 finding, because the sentence contains repeated `34` tokens, and the naive replacement changed a later `34` rather than the frozen token occurrence. The frozen counter does *not* refuse every one-token mutant. A discriminating token mutant (`schema v2` → `schema v3`) is refused (exit 1, predicate false, D7 mismatch). This is a meaningful mutation-selection blind spot, not a byte-comparison failure.

C1 CLI has no `--claims` override (as inspected in usage and evaluator); it reads claims from `REV`’s git blob. Therefore independent C1 claims-input mutation could not be exercised without altering frozen repo data. Do not claim its mutants were tested. C2 invocation also has pre-existing non-D7 findings at this frozen tip; D7 result is directly reported in JSON and the overall exit 1 is consistent with refusal.

Evidence path: `.ufo/waves/round-39/w1/CritClaimsText/report.md`. No tool installs.

VERDICT finding — C2 D7 misses a one-token sentence mutation when that token replacement is a no-op on the selected repeated value; C1 mutation path not independently exercisable via published CLI.
