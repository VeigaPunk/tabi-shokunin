# Commands run (seat CritC1Equivalence, round 30 w1)

All runs in scratch; the lane checkout was never written. `S=/fast/scratch/hyaku/tabi-r30/CritC1Equivalence`.

## Freeze reading (before)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75
git -C "$S/clone" status --porcelain            # 0 lines
sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json scripts/check-frontier-admission.mjs
# 02945f88…3a55 / cd1c27a2…3833 / cadef57e…9eca  (all three match claims.json frozenDigests)

TMPDIR=$S/tmp node clone/scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone" --work "$S/work" --json
# exit 1 → fault_total 27, fault_survivors 14, benign_total 13, benign_killed 0
#   receipt: counter-at-freeze.json
```

## Per-mutant distinguishability (production mode on scratch fixtures)

```
python3 "$S/harness.py"                          # exit 0; ALL: True
# receipt: distinguishability/results.json (+ per-mutant pristine.json / mutant.json)
```

Harness per mutant: builds a fixture git repo, writes the mutant gate as a copy of the
pristine bytes with the catalogue `find`→`replace` applied exactly once, then runs

```
node <pristine|mutant gate> --repo <fixture> --rev HEAD [--stable 156.0.8078.47] --json
```

14/14: pristine exit 1 (invalid / unresolved 1) vs mutant exit 0 (valid / unresolved 0);
`pins-f3-bytes-absent` is 1 vs 1 with the mutant emitting no JSON (ERR_INVALID_ARG_TYPE).

## Reachability probe (CASES-only change, scratch clone)

```
git clone --shared … "$S/clone2"; git -C "$S/clone2" checkout -q 061e620…
python3 "$S/add_cases.py"                        # 3 s106 cases + 9 release-pin cases
node "$S/clone2/scripts/check-s106-evidence.mjs"  --selftest --json   # exit 0, cases 10 passed 10
node "$S/clone2/scripts/check-release-pins.mjs"   --selftest --json   # exit 0, cases 29 passed 29
git -C "$S/clone2" -c user.name=CritC1Equivalence -c user.email=CritC1Equivalence@scratch.local \
    commit -q -am "…"                            # 4c490ec1bbd65afb7437ccc8c8ffd1da09c41b3d

TMPDIR=$S/tmp node clone/scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone2" --work "$S/work2" --json
# exit 0 → fault_total 27, fault_killed 27, fault_survivors 0, benign_total 13, benign_killed 0
#   receipt: counter-with-cases.json
```

Guard checks on the same tree:

```
# diff is insertion-only inside CASES: 54 insertions, 0 deletions
git -C "$S/clone2" diff 061e620…4c490ec --stat
# every catalogue find string occurs exactly once in both pristine and modified bytes
node -e '… count(find) === 1 for all 40 catalogue rows …'   # find_string_counts_ok: true
# counter/catalogue bytes in clone2 still frozen
sha256sum clone2/scripts/gate-mutants.json clone2/scripts/check-gate-mutants.mjs
# cd1c27a2…3833 / 02945f88…3a55
# production readings unchanged on the real lane revision
node clone/scripts/check-s106-evidence.mjs    --repo clone --rev 061e620… --json   # exit 0, valid true
node clone2/scripts/check-s106-evidence.mjs   --repo clone --rev 061e620… --json   # exit 0, valid true
node clone/scripts/check-release-pins.mjs     --repo clone --rev 061e620… --stable 156.0.8078.47 --json
node clone2/scripts/check-release-pins.mjs    --repo clone --rev 061e620… --stable 156.0.8078.47 --json
# identical JSON (diff of the two receipts → empty)
```

## Doc-bound tally (no-harm surface)

```
node clone/scripts/check-selfassessment.mjs --repo "$S/clone"  --rev 061e620… --json   # exit 0, mismatches 0
node clone/scripts/check-selfassessment.mjs --repo "$S/clone2" --rev 4c490ec…  --json  # exit 1, mismatches 4
#   SCORECARD.md:1438 claimed 5 observed 10; :1466 claimed 7 observed 10; :1479 claimed 7 observed 10;
#   :1485 claimed 20 observed 29
# after appending the round-30 correction block (clone2 commit 72adbba…):
node clone/scripts/check-selfassessment.mjs --repo "$S/clone2" --rev HEAD --json
# exit 0, mismatches 0 (all four stale lines superseded)
TMPDIR=$S/tmp node clone/scripts/check-gate-mutants.mjs --rev HEAD --repo "$S/clone2" --work "$S/work3" --json
# exit 0 → 27/27 killed, 0 benign killed, both pristine self-tests clean (10/10, 29/29)
```

Note: the first selfassessment run used a relative `--repo` and reported could-not-evaluate
("self-test printed no tally") for every gate; re-running with an absolute `--repo` produced the
counted readings above. The relative-path readings are not cited.
