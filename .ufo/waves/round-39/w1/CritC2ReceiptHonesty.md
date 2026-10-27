# CritC2ReceiptHonesty — C2 receipt authenticity

Axes: coverage, calibration. Finding impacts calibration (C2).

D4 is forgeable: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` lines 162–174 trusts JSON fields and checks only numeric nonzero `observedExit`, a different string `mutantPredicateSentence`, and two unequal 64-hex strings. It does not execute the counter, validate the hashes against claims, or authenticate output. A scratch forgery setting exit to 1, an arbitrary different sentence, and hashes to all-zero/all-one passed the field predicates. The counter reads the committed receipt from `REV`, so that scratch artifact was not fed into it; acceptance follows directly from the D4 conditions. An actual invocation at the frozen REV returned `mutantRefused:true` from the existing committed receipt, which proves only structural acceptance, not its asserted run.

Smallest safe correction: make the counter execute the mutant control and inspect actual nonzero exit plus expected refusal output, or bind and validate hashes to actual frozen/mutant blobs, ensure the mutation is exactly the intended predicate-only edit, and independently verify the resulting refusal. More receipt fields alone do not fix forgery.

Evidence: `.ufo/waves/round-39/w1/CritC2ReceiptHonesty/report.md` contains commands and output; relevant counter lines noted above. Scratch removed by EXIT trap; no installs.

VERDICT finding — D4 accepts forged assertions without proof a counter run occurred.
