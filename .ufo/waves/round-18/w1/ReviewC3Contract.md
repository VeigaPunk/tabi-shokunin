VERDICT: ISSUES

# Round-18 C3 counter review

Reviewed PLAN §C3 and `measure-c3.mjs` against routed defects 1–5 in `corpus/lessons/round-17-verifier-spotcheck.md:157-165`, including the current round-18 correction, runner and evidence artifacts. Findings concern counter acceptance gaps, not present artifact falsity.

## Findings (severity order)

### MEDIUM — D5 counts failing reruns as closed

`measure-c3.mjs:484-487` accepts any non-empty `receipt.verdict` when it matches the index; it does not require `pass`, index exit `0`, or the expected 11/11 cases and four passing controls. Thus seven committed, hash-matched failure receipts can satisfy D5, although the seven round-17 reruns that prompted defect 5 were all passing and the round-18 closure presents its new reruns as replacement evidence. Require successful verdict/exit and the expected case/control outcome before counting a run.

The current evidence itself is honest and passes those stronger conditions: `corpus/evidence/round-18/routed/harness-reruns/index.json:8-20,23-32` explicitly says these are new reruns replacing unrecoverable `/tmp` outputs, not the same runs; all seven entries report exit 0, `pass`, 11/11 cases and 4/4 controls, with full receipt-byte SHA-256 values. `.ufo/waves/round-18/w1/D5HarnessReruns.md:5-19` records the same distinction and outcomes. `corpus/lessons/round-18.md:73-75` also says the new receipts do not reconstruct the lost bytes. Therefore new reruns are an honest replacement for the missing durable evidence, not recovery of the original seven.

### MEDIUM — D4 can pass without correcting the publisher fact

`measure-c3.mjs:423-428` verifies a unique S058 row, the `supersedes S057 —` prefix and absence of the literal `individual publisher`; it does not require the correction to state the true publisher or bind it to the round-18 re-opened listing evidence. A row with an empty or wrong publisher claim could therefore count as closed. The current row is substantively corrected: `corpus/SOURCES.md:72` says the developer is Google Ireland, Ltd. and points to `.ufo/waves/round-18/sources/S058Listing.md`; `corpus/lessons/round-18.md:62-65` explains the old S053/S057 records remain historical and superseded. Tighten D4 to verify the corrected fact and its fresh evidence pointer, not only removal of the bad phrase.

### LOW — D1 counter omits one of the two named erroneous locations

The correction is legally routed: PLAN freezes round-17 lessons already existing at B (`.ufo/waves/round-18/PLAN.md:53-56`), so `corpus/lessons/round-17.md` must not be edited. A new correction in `corpus/lessons/round-18.md` is the appropriate append-only surface. Its lines 55-60 correct both the lane lesson and the fleet report, and explicitly retain the protected historical bytes. The defect’s second source is `/home/vgpnk/Projects/shokunin/.ufo/reports/round-17/tabi.md:35`, which says “10 rows, 7 siblings” and is outside the lane’s write boundary.

However, `measure-c3.mjs:261-268` only requires the round-18 correction line to cite `corpus/lessons/round-17.md:116` and contain the computed integer. It does not require acknowledging the fleet report line 35, so D1 could still count if a later correction left that named instance unaddressed. Add the report citation to the D1 predicate. The checked count is six: distinct `sibling` values in `corpus/adjacency.tsv` are `kagi`, `kaidoku`, `kake`, `kama`, `kumitate`, `revenger`; count at 93bfead and the round-17 delivered tip T is 6.

## Closed as specified / residual checks

- **D2 closes:** `corpus/evidence/round-18/routed/harm-at-93bfead.json:1-36` identifies revision `93bfead1f5f25f584353df3152a60209bbd89a2e`, the round-18 runner (`892466566850fd5edce2e901e20ca81dc79fa7a9957fa45380e12dfa6f03b98f`), attached-master sandbox setup and the six gate-script digests. The runner at `corpus/evidence/round-18/routed/harm-runner.mjs:8,70-73,87-105` pins the revision, clones/checks it out and attaches `refs/heads/master` before running the baseline commands. The receipt records 20/20 equal exits. `measure-c3.mjs:281-342` checks the historical revision, complete gate identities/argv, baseline exits and 64-hex stdout/stderr digests, plus the historical gate-script digest map.
- **D3 closes:** `corpus/evidence/round-18/routed/adjacency-selftest.json:2-15` records exit 0, `cases=57`, clean verdict, matching stdout digest `d77890f2247dfd48b26b9704d8bd7236d06f2bc893f004e8eeac1e388c686b24`, and producer digest `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (the checker blob at 93bfead). `measure-c3.mjs:362-389` cross-checks stdout bytes/digest, clean verdict, case count and producer. The `could_not_evaluate=6` suffix is not six skipped tests: `scripts/check-adjacency.mjs:1658-1663` counts expected exit-2 reason coverage and requires all such reason categories for a clean self-test.
- **D1 fact and destination are correct:** `corpus/lessons/round-17.md:116` is the “10 rows, 7 siblings” line, and PLAN’s new round-18 correction surface respects the protected-file rule. The correction itself covers both sources even though the counter currently enforces only one.
- **D5 provenance is honest:** the original `/tmp` outputs cannot be restored; the index and lesson accurately label the committed artifacts as seven fresh runs, not the original executions. The seven current full receipt digests are in the index, and the round-17 harness producer is the pinned full digest `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.

## Verification gaps

No LSP device was exposed, so no LSP status/references/definition/diagnostics requests were available; this review relies on direct file and receipt inspection, not grep as semantic proof. I did not execute the counter or any tests. At inspection time, `git status --porcelain` showed `corpus/SOURCES.md` modified and the round-18 wave/evidence/lesson files untracked; consequently I cannot attest these artifacts are committed or that the integrated-revision counter result is 5. The committed-byte check remains for the integrator.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReviewC3Contract.md`
