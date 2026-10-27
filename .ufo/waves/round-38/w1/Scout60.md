# Scout60 — W1-60

Axes: calibration, coverage. Read-only source/evidence reconnaissance. No installs or scratch created.

## C1 — counter is stricter than the promised count comparison

Observed frozen claim `.ufo/waves/round-38/claims.json:24-29`: C1 promises all D1-D6 re-derived/corrected, baseline control failure, and names the round-37 spot-check as source. That spot-check enumerates the six defects at `corpus/lessons/round-37-verifier-spotcheck.md:111-134`: D1 wave-block seats; D2 seat verdict tally; D3 LOG freeze landing/hash ledger; D4 M3 captured-by/red control; D5 census parsed counts; D6 numstat endpoints.

Potential counterexample in frozen counter `.ufo/waves/round-38/counters/c1-routed-defects.mjs:193-207,226-233`: D5 computes `receiptTier` and `receiptStatus`, and emits findings if either histogram differs (lines 205-207), but final `out.predicate` checks only `receiptRows === counterRows` (line 232), not histogram equality. This is currently masked because any histogram mismatch adds a finding (predicate begins with `findings.length === 0`, line 227), but interpretation depends on finding population being intact; more directly, D6 checks only textual presence of baseline and REV identifiers (`:219-222`), not that a numstat actually diffs those endpoints or that it contains numstat data. A fabricated/irrelevant receipt containing both identifiers could satisfy the D6 predicate. Thus the counter's D6 evidence does not itself establish the claim's “window endpoints” semantics. Falsify this concern by demonstrating the counter parses/validates actual diff endpoints and change rows (or independently verify its receipt generation and bind it to commit/REV).

Distinct issue: C1 requires “baseline control must fail” (`claims.json:27`), but the examined predicate implementation has no baseline-control execution/check in `evaluate`/final predicate (`c1-routed-defects.mjs:226-233`). The baseline is a constant (`:52`), but use as control must be established by execution evidence elsewhere; absent such evidence, this clause remains unresolved. Falsify by providing a recorded baseline run with nonzero exit and findings, or code path explicitly evaluating it.

## C2 — bounded source-review finding

Observed claims (`claims.json:35-41`) specify two cold runs, same first screenshot hash, loopback-only requests, zero *observed* non-loopback sockets and zero survivors. Existing review note `w1/Critic17.md:11-13` records driver sampling concern: periodic 400ms sampling does not prove absence of transient egress, and no independent runtime receipt was available in that inspection. This is limitation, not falsification of the literal “zero observed” predicate. Remaining gap for this scout: I did not execute the driver or inspect its receipt, so cannot confirm current C2 runtime evidence.

## Confidence / unresolved

High confidence in the cited frozen source facts. No semantic LSP device was available in the provided tools; conclusions here are text/source evidence only. Key falsifiers: inspect/execute D6 receipt producer and counter on deliberately misleading receipt bytes; locate recorded baseline control output; inspect committed C2 receipt and run output to assess runtime predicate.