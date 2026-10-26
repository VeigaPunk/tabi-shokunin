# Round 32 freeze receipts

Produced by `controls.sh 5ad1fcbfbae947e56ed448c7d24af0632b534e80 d805d1d6132430118b206a848b85753ab35d1014 <this dir>` (scratch clones under $HYAKU_SCRATCH/tabi-r32/L1/controls, removed on exit).
Counters frozen at `5ad1fcbfbae947e56ed448c7d24af0632b534e80` (sha256 in `frozen-counter-sha256.txt`); every junk tree is a commit in a scratch clone whose
commit and TREE digest are recorded in `<control>.provenance` (the tree digest is reproducible from the script; the
clone commit is not in the lane by design — round-31 routed defect 5).

| Control | Counter reading | Exit |
|---|---|---|
| c1-J1-do-nothing | population 0, admitted 0, e1-entry-absent | 1 |
| c1-J2-docs-only | population 16, admitted 0, s1-source-row | 1 |
| c1-J3-forgery-offline | population 16, admitted 16 (offline only) | 0 |
| c1-J3-forgery-live | population 16, admitted 0, t3-binding (screenshot differs from live) | 1 |
| c1-J4-counter-as-driver | population 16, admitted 0, t1-receipt (driver is the counter) | 1 |
| c2-J1-do-nothing | mismatches 18 (3 m4 + 15 m1) | 1 |
| c2-J2-delete-words | mismatches 15, numstat 3/3 SCORECARD.md (deletion leg fails) | 1 |
| c2-J3-uncited-correction | mismatches 18 | 1 |

Self-tests at the freeze: `c1-counter-selftest.txt` (BIDI_RUNTIME_SELFTEST cases=27 passed=27, exit 0),
`c2-counter-selftest.txt` (SELFASSESSMENT_SELFTEST cases=41 passed=41, exit 0). Census at round start:
`census-start.txt` (exit 0).
