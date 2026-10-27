# RevC1Receipt — round 39 attempt 1

## Scope and inputs

Axes: coverage (C1 capability receipt) and calibration (control refusal). Read frozen claims at `.ufo/waves/round-39/claims.json`; it binds freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, baseline `5bc56a81d196caeb8d24551928b883802697aabb`, C1 counter SHA-256 `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`, and driver SHA-256 `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc`. The frozen baseline counter outputs read before acting were `measure/c1-before.txt` (`receipt-absent`, predicate not met at baseline) and `measure/c2-before.txt` (C2 not met, 34 seats, tally 23/11, census 144). This assignment rechecks C1 only.

Current lane tip observed: `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` (`round-39: preserve isolated C1 counter self-test`); worktree status count was 2 before clone. A shared clone was made under the seat scratch and detached at that explicit tip; clone status was clean.

## Exact counter command and output

Command:

```sh
node /fast/scratch/hyaku/tabi-r39/RevC1Receipt/repo/.ufo/waves/round-39/counters/c1-egress-session-bound.mjs --repo /fast/scratch/hyaku/tabi-r39/RevC1Receipt/repo --rev 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4 --json
```

Output (exit 0):

```json
{"schema":"tabi-r39-c1-egress-session-bound","rev":"1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4","receipt":{"schemaOk":true,"runs":2,"binding":true,"versionBound":true,"refused":false},"control":{"v1Present":true,"refusalReasons":["schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2","run1 has no owned pid tree","run1 sampleCount undefined < 8","run2 has no owned pid tree","run2 sampleCount undefined < 8"],"refused":true},"findings":[],"predicateSentence":"schema v2 AND two unrefused runs AND identical first-shot sha256 across runs AND per-run owned tree nonempty rooted at a child of the driver node process AND at least 8 socket samples per run over at least 1000 ms AND zero non-loopback socket observations on both the ss and /proc surfaces including the post-close final sweep AND zero survivors AND the fixture port closed AND the firefox version bound from the live session AND the round-38 v1 receipt refused by this counter","predicate":true}
```

The frozen counter and driver hashes in the clean clone matched the claim digests exactly. Committed receipt blob: `2e607b4aa60444e1caf0d183d8086da07fe84f49` at `corpus/evidence/round-39/playwright-egress/receipt.json`.

## Receipt predicates re-derived from committed bytes

The committed receipt schema is `tabi-pw-firefox-egress-receipt-v2`; it contains two runs, both `refused:false`. Their `firstShotSha256` values are identical: `ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0`.

Both `owned` records are nonempty; each root is a Firefox child under the same driver Node PID (`2430191`) and each tree contains five PIDs. Run 1 has 9 samples over 1560 ms; run 2 has 8 samples over 1461 ms. For each run the socket surfaces list `ss` and `proc`, each with 6 observations and 0 non-loopback observations. Each post-close `finalSweep` has one tick per surface and zero non-loopback observations (ss lines 0; proc inodes 0). Both runs have zero survivor PIDs, `survivors:0`, `portClosed:true`, and `egressNonLoopback:0`.

Both run and receipt-level browser version is `157.0`; user agent is `Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0`; binary is `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`. The round-38 v1 receipt is present and the frozen counter refuses it; output gives five refusal reasons, including the v1 schema mismatch, absent owned PID trees, and undefined sample counts. Counter output has no findings and predicate true.

The clone's top-level command output included `git status --porcelain` with no lines; clean clone was confirmed. No tool installs. Scratch clone removed before yielding.

## Evidence / verdict

Counter run and byte-derived details above are the observed evidence; no browser was launched because the frozen counter explicitly evaluates committed receipt bytes. No C1 predicate mismatch observed.

VERDICT ok — frozen C1 counter predicate met at current lane tip; v1 control refused
