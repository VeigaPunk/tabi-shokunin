VERDICT: PASS

- The plan's D3 counter requires the adjacency self-test receipt to exit 0, contain `cases=57`, and pin the checker hash at 93bfead (`.ufo/waves/round-18/PLAN.md:97-101`). The receipt is at `corpus/evidence/round-18/routed/adjacency-selftest.json:1-34`.
- At revision `93bfead1f5f25f584353df3152a60209bbd89a2e`, ran argv `node scripts/check-adjacency.mjs --self-test` from `/tmp/tabi-r18-D3AdjSelftest-93.wd5rGK/lane`; exit 0, runtime 2080.355 ms. Stdout's final line was `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6`; all case lines report `verdict=pass`. Full stdout and parsed `cases=57`, `verdict=clean` are retained in the receipt (lines 8, 11); stdout SHA-256 `d77890f2247dfd48b26b9704d8bd7236d06f2bc893f004e8eeac1e388c686b24`; stderr SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- Ran the same argv at baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c` from `/tmp/tabi-r18-D3AdjSelftest-B.yBeqxs/lane`; exit 0, runtime 2081.385 ms, `cases=57`, `verdict=clean`. Full output and hashes are retained in the receipt (lines 16-27); stdout and stderr hashes match the measured-revision run above.
- Producer hash from `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 93bfead1f5f25f584353df3152a60209bbd89a2e:scripts/check-adjacency.mjs | sha256sum`: `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`. The equivalent `git show` at baseline produced the same hash. `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat 93bfead1f5f25f584353df3152a60209bbd89a2e 2bff864fdfee684ddbcd066cc8e735adaba2735c -- scripts/check-adjacency.mjs` produced no output; matching source hashes record identical checker bytes (receipt lines 12-14, 28-32).
- `--fleet` was not passed: the checker documents its self-test as constructing disposable fixture repositories and rejects `--fleet` with `--self-test` (`scripts/check-adjacency.mjs:33-41, 165-170, 1156-1158`). Both temporary sandboxes were removed after capture.
- Risks/blockers: none observed. No tool installs; no other checks run.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/adjacency-selftest.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/D3AdjSelftest.md`
