# W1-10 — Reviewer10

## Axes
- **Calibration (primary, C1 D1/D2): finding.** The frozen counter evaluated against the specified frozen REV does not satisfy the claim predicate.
- **Coverage (C2): no independent finding.** No bounded C2 rerun was performed; this report does not certify it.

## Finding — C1 predicate is false at frozen REV (high)

**Evidence:** From `/home/vgpnk/Projects/shokunin/tabi-shokunin`, ran:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Exit status **1**. Counter output for that exact REV reports `predicate:false`; specifically D1 `supersedingCorrection:false`, D2 `stated:null` despite recomputed `ok:23, finding:11, reports:34`; all six D3 hashes have `presentInR38Section:false` (although each is a commit and ancestor); and it reports absent D4 lesson/red-control receipt, D5 census receipt, and D6 numstat receipt. The counter’s `findings` includes `d1-results` (`w1-results.json absent`) and `d2-stated` (LOG section lacks “23 ok / 11 finding”). This directly falsifies C1’s target predicate at the frozen revision; it does not establish that later uncommitted or subsequent work lacks those artifacts.

**What would falsify this finding:** re-run the same frozen counter against a clearly identified measured REV whose committed bytes contain all required corrections and receipts, and obtain exit 0 / `predicate:true` with D2 stated tally matching the recomputed 23/11.

## C2 and residual scope

No independent C2 falsifier established here. C2’s runtime binding, egress, and cleanup properties remain unverified by this seat. No tools installed. No production files changed.
