VERDICT: ISSUES

# Round 18 harm gate at 530f40a

The complete inherited 23-gate set ran once, sequentially, against `530f40a9bc3f10436161a2af1ca0fe9bffffc004` in a private fleet sandbox. Comparing each result to the corrected baseline exit in `harm-baseline.json`, all 23 exits match: 22 are `0`, and the existing production USER `round_count` gate remains `1` (no new exit regression). The retained receipt is `corpus/evidence/round-18/harm-after.json`.

## Results

| Gate family | Entries | Exit comparison |
|---|---:|---|
| Round contract | 4 | 4/4 match baseline; all `0` |
| USER round contract | 5 | 5/5 match baseline; production remains `1`, other four `0` |
| Freshness | 3 | 3/3 match baseline; all `0` |
| Sources | 2 | 2/2 match baseline; all `0` |
| ARIA metadata | 4 | 4/4 match baseline; all `0` |
| Measurement binding | 3 | 3/3 match baseline; all `0` |
| Adjacency | 2 | 2/2 match baseline; all `0` |

USER production emitted the expected unchanged red line: `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10`; exit `1`, stderr SHA-256 `47e9ffdc4fa167e16d3635ee9aca74d30ea8f365dc571dc21b03566a3daada53`. Baseline records the same exit and bytes at `.ufo/waves/round-18/harm-baseline.json:221-264`; after-run details are in `corpus/evidence/round-18/harm-after.json:36`.

All seven gate producer script SHA-256 values at the candidate match the pinned values in the baseline map. Round-17 binding reproduction emitted `MEASUREMENT_BINDING verdict=clean claims=3 bound=3`, exit `0`; adjacency production emitted `ADJACENCY verdict=clean rows=10 verified=10`, exit `0`. Every exact argv tail, exit/baseline exit, stdout/stderr byte count and full SHA-256, clipped final output line, and producer path is recorded per gate at `corpus/evidence/round-18/harm-after.json:32-54`. The executable and working directory are recorded at `:8`; the candidate producer digests are at `:30`. The argv is the recorded `nodeExecutable` plus that record's `argvTail`; only `check-adjacency-production` replaces the production fleet argument with the private fleet clone.

## Sandbox and limits

Setup used the known-good layout reported by `TabiR18.HarmBaseline18`: fleet root `/tmp/tabi-r18-harm-after-Q1PCFx/fleet`, with the real lane clone directly at `fleet/tabi-shokunin`. The lane was cloned with `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-harm-after-Q1PCFx/fleet/tabi-shokunin` and checked out with `git -C /tmp/tabi-r18-harm-after-Q1PCFx/fleet/tabi-shokunin checkout -q -B master 530f40a9bc3f10436161a2af1ca0fe9bffffc004`. The real fleet and six real sibling clones used `--shared --no-hardlinks --no-checkout`; their branch tips and reachable pins are listed at `corpus/evidence/round-18/harm-after.json:19-28`. Repository directories were not symlinks. The lane clone was clean before measurement and after every gate. The private sandbox was removed after capture; no writes were made to the production lane, fleet, or sibling repositories.

The effective gate process was `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` followed by each argv tail in the receipt, with cwd `/tmp/tabi-r18-harm-after-Q1PCFx/fleet/tabi-shokunin`, inherited environment, one process at a time, 900,000 ms per-gate timeout, and a 67,108,864-byte cap per output stream. No timeout or output cap was reached. SHA-256 values cover the complete captured streams; the receipt retains byte counts and a final-line summary capped at 80 characters, not complete output bodies. Receipt SHA-256: `3c54c98af6ddee8616915b6ed907e7091612f4b9a43d499b321185e3755edb59`.

**Confinement issue:** inherited self-test code creates temporary fixture directories under hard-coded `/var/tmp` (for example, USER witness output named `/var/tmp/tabi-user-witness-eJZ7lY/repo`). Relevant code uses cleanup in `finally` (`scripts/check-user-round-contract.mjs:898-923, 972-1012, 1054-1147`; `scripts/check-round-contract.mjs:1053-1082`; `scripts/check-aria-metadata.mjs:1986-1999`). These built-in scratch paths are outside the private clone even though the gate commands ran from the clone. The gates exited normally and their cleanup paths executed, but I did not independently enumerate `/var/tmp`; therefore strict temp-write confinement is not claimed. The task required a single run, so no second run was made.

Tools installed or updated: none.

Report: .ufo/waves/round-18/w2/HarmAfter.md

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/harm-after.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/HarmAfter.md
