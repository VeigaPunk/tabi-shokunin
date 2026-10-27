# RevC2D2D3 — scoped finding

At round-39 baseline `5bc56a81d196caeb8d24551928b883802697aabb` and current tip `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`, frozen C2 D1–D3 all evaluated true. D1: stale and correction lines present, 34 seats, no w2 artifacts. D2: stated and recomputed tally both 23 ok / 11 finding across 34 reports. D3: all six logged round-37 commit hashes are exact, commit objects, and ancestors at both revisions; freeze landing reported true.

Observed LOG text (`LOG.md:2533`) correctly identifies `34ed508c` as carrying the freeze-entry work, not `99437d29`. However, counter D3 at `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs:147-148` only tests for substring `34ed508c` and excludes one narrow `99437d29` phrase. It does not bind the claimed landing to a full hash or its attribution, so an incorrect attribution retaining that substring can pass. This is an actionable calibration/instrument finding; current LOG itself has no observed typo.

Counter complete predicate was false at both revisions: baseline missing D4/D5/D6/D7; tip missing D5/D6. Full command output and values: `.ufo/waves/round-39/w1/RevC2D2D3/report.md`.

VERDICT finding — D3's freeze-landing claim is verified only by a weak substring check, although all six actual ledger hashes and ancestry checks pass.
