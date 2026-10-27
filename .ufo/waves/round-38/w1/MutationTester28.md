# W1-28 — mutation probe / C1–C2

**Primary axis: calibration (C1 D5 census). Secondary axis: coverage (C2 Firefox receipt).** Inspected frozen claims at `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`; working-tree `claims.json` SHA-256 equals that commit's blob (`90290008aee738cc0362801bb71f96adb44d6434030582716a1e53ff5587185b`). No tools installed.

## C1 D5: counterexample at the frozen revision

Ran the frozen counter against the frozen revision:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit 1
... "d5-receipt" ... "census-end.txt absent at REV"
... "d6-file" ... "no numstat receipt under .ufo/waves/round-38/measure"
... "predicate":false
```

The frozen claim's C1 target requires all D1–D6 and says the target predicate is true. At this named REV, the D5 receipt is absent, so the census-count equality cannot be established and the target predicate is false. This falsifies the target claim **at this revision**; it does not establish what a later measurement REV may contain. The working-tree `measure/` directory was empty when inspected. The counter implementation at `c1-routed-defects.mjs:178–207` also parses histograms, but no histogram comparison can run without its required receipt.

**Mutation probe:** copied the pinned counter (before SHA-256 `209d86a0cc6fd35f9f87d0e74a769df8666d952a5e9fdec8a75df60b149d57f7`) into isolated scratch and mutated D5 row accumulation at line 188 from `mine.rows += 1` to `mine.rows += 2`. Same bounded detector on the mutant exited 1 with `d5-receipt: census-end.txt absent at REV` and predicate false, identical D5 baseline finding. **Verdict: inconclusive, not killed**—baseline has no D5 receipt, so the detector cannot reveal whether the mutant is caught when D5 evidence exists. Restored scratch copy SHA-256 to the original pinned hash and deleted `/fast/scratch/hyaku/tabi-r38/MutationTester28/` before completion. Production counter was not modified.

## C2: bounded receipt review; no runtime re-run

Committed working-tree `corpus/evidence/round-38/playwright-firefox/receipt.json` records two runs with matching first-shot SHA-256 `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, `binding: true`, `egressNonLoopback: 0`, `survivors: 0`; each run records `portClosed: true` (receipt lines 158–191, 338–381). The knowledge row says the evidence uses Playwright 1.64.0 / Firefox 157.0 and cites S144 (knowledge file lines 1–9). These observations support the receipt assertions; I found no receipt-level counterexample in this bounded review.

The driver source (`scripts/playwright-firefox-loopback-round38.mjs:68–83`) binds its fixture server to `127.0.0.1` and samples socket connections every 400 ms only after launch/PID discovery. Consequently, `egressNonLoopback: 0` is evidence of **zero observed** non-loopback sockets, not proof that no brief connection occurred between samples. This is a measurement limitation, not an observed C2 violation. I did not rerun the browser runtime.
