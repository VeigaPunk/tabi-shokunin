# MutC1ReceiptB — scoped findings (round 39 w1, milestone: mutation)

C1 receipt mutation probe against the frozen counter
`.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`
(sha256 `75e823e4…` == `claims.json.frozenDigests`) at freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`.
Fixture: `corpus/evidence/round-39/playwright-egress/receipt.json`
(pristine sha256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`).

Baseline: pristine bytes → exit 0, `predicate=true`, `findings=[]` (conclusive precondition met).
Method: one scratch clone per mutant (freeze commit, toplevel asserted), one field mutated
per fixture, counter run on pristine / mutated / restored bytes; scratch deleted after evidence copy.

| mutant (run1, one field) | exit | finding id | verdict |
|---|---|---|---|
| `survivors: 0→1` | 1 | `run1-survivors` (survivors 1 != 0) | killed |
| `portClosed: true→false` | 1 | `run1-port` (fixture port not closed) | killed |
| `sampleCount: 9→7` | 1 | `run1-samples` (sampleCount 7 < 8) | killed |
| `coverageMs: 1560→999` | 1 | `run1-coverage` (coverageMs 999 < 1000) | killed |
| `egressNonLoopback: 0→1` | 1 | `run1-egress-total` (egressNonLoopback 1 != 0) | killed |

0 survivors. Each mutant diff vs freeze: `1 file changed, 1 insertion(+), 1 deletion(-)`.
Restoration: all five clones reset to `e894f1d5…` (byte-identical, clean status), counter
re-run on restored bytes exit 0 `predicate=true`; counter bytes unchanged throughout.
Raw outputs: `.ufo/waves/round-39/w1/MutC1ReceiptB/{pristine,mut-*,restored-*}.json|err`; full report:
`.ufo/waves/round-39/w1/MutC1ReceiptB/report.md`.
Observation (non-finding): counter header comment says the receipt is read from `--repo`'s
worktree, but the code reads `git show REV:path` from git objects.

VERDICT ok — C1 counter killed all five single-field receipt mutants (survivors=1, portClosed=false, sampleCount=7, coverageMs=999, egressNonLoopback=1); 0 survivors, pristine and restored bytes pass at exit 0.
