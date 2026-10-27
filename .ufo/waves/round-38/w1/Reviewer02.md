# W1-02 — calibration and coverage attack

## Findings

### C1 — frozen REV does not satisfy D1/D2 (and D5/D6 evidence is absent)

Re-ran the frozen counter against the assigned frozen commit:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit 1
```

The result reports `d1.stalePresent:true`, `d1.supersedingCorrection:false`; `d2.stated:null` while recomputation is 23 ok / 11 finding / 34 reports. Thus the frozen revision has neither the required append-only correction nor the corrected tally in the required LOG round-38 section. It also cannot establish the full C1 predicate: its `git ls-tree -r` listing at this REV contains only claims and the four counters under `.ufo/waves/round-38`; `measure/` and `baseline/m3-sentence-mutant.json` are absent. Specifically, the required D5 `measure/census-end.txt` and D6 numstat receipt are not committed at this REV. The worktree directories were also empty when checked. This is a counterexample to C1 being true at the frozen revision, not a claim about a later commit.

Falsifier: a later measured REV must contain the append-only scorecard correction, the LOG 23/11 statement, and committed D4/D5/D6 receipts, and the same frozen counter must return exit 0 there while returning nonzero at baseline.

### C2 — no committed runtime receipt at the frozen revision

The frozen claims require two runs and a committed receipt/knowledge row. At `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc`, `git ls-tree -r` lists no `corpus/evidence/round-38/playwright-firefox/receipt.json`, and no `corpus/knowledge/playwright-firefox-loopback-round-38.md`; `.ufo/waves/round-38/measure/` is absent. Therefore the frozen REV itself does not substantiate C2's target, regardless of subsequent uncommitted worktree evidence. I did not treat sibling reports or their cited later files as authority and did not rerun browser execution.

Falsifier: commit the receipt and knowledge/source row at a measured REV, then independently bind the two cold runs' screenshot digests, request URLs, socket-sampling observations, interaction results, and teardown evidence to that receipt.

## Residual risk and verification gaps

This attack establishes state at the frozen commit only. It does not evaluate a later candidate REV or independently replay the Firefox runtime. The five frozen instrument/driver digests match their committed bytes at `a8e7d50c` (and their current worktree bytes). No tools installed; scratch directory created but no files were written.

Report: .ufo/waves/round-38/w1/Reviewer02.md