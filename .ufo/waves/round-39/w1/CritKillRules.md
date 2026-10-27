# CritKillRules findings

C1 contains concrete kill-rule gaps: owned tree membership checks are only value inclusion, not process ancestry, and `finalSweep:{}` passes because missing `ss`/`proc` objects do not trip comparisons. Version binding checks matching strings rather than provenance from a live session. Relevant frozen code: `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs:100-118,127-130`.

C2 D4 trusts receipt-shaped fields (nonzero exit, differing sentence, unequal well-formed hashes) without verifying a counter run or hashing claims contents; D6 checks baseline/REV with substring searches rather than parsing exact window metadata. Relevant code: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs:168-174,213-228`.

Smallest safe correction: validate typed PIDs and actual parent links against a captured process-tree observation; require both final-sweep surfaces and sample metadata; bind browser version to recorded live-session response; independently re-hash mutant/frozen claim bytes and retain/validate invocation evidence; parse exact baseline..REV receipt header. Full command/evidence details are in `w1/CritKillRules/report.md`.
