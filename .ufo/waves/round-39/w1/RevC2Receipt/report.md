# RevC2Receipt — round 39 C2 mutation control

Commands run from `/home/vgpnk/Projects/shokunin`; replay was executed with cwd `/fast/scratch/hyaku/tabi-r39/RevC2Receipt` and a shell EXIT trap removing that scratch directory. No tools installed.

Receipt inspected: `.ufo/waves/round-39/baseline/c2-sentence-mutant.json`.

Frozen counter and claim source inspected: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`, `claims.json`, and `baseline/c2-mutant-claims.json`. The receipt command was replayed with absolute paths:

```sh
node "$L/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs" --rev 9c09ebb1e2ff594c70ce72093b5d4133c1734dca --repo "$L" --claims "$L/.ufo/waves/round-39/baseline/c2-mutant-claims.json"
```

Observed hashes/output:

```text
sha256sum of claims.json in current worktree: ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6
sha256sum of mutantClaims:                  a2ba6eea5164f70cc2a87302df5e23147937631c9a2c31a71b4686f3011cf11e
sha256sum of frozen claims.json blob at 9c09ebb1e2ff594c70ce72093b5d4133c1734dca: 40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009
```

The frozen-commit hash equals the receipt's `frozenClaimsSha256`; the mutant hash equals its `mutantClaimsSha256`. The current worktree claims file has since changed, so its hash is not the frozen-claims hash. Structural comparison after normalizing only `claims[1].predicate` did not report equality (`all_other_claim_fields_equal=false`); the one predicate token/count variant is indeed `23 ok 11 finding` vs `23 ok 12 finding` (`predicate_diff_count=1`). Thus the intended single-token mutant is observed, but the stronger claim that the entire fixture differs from frozen claims only in that field is not established: the recorded worktree comparison found other structural differences (including potentially frozenAt metadata); cannot certify the full mutant-only invariant from this comparison.

Replay emitted:

```text
FINDING d5-receipt .ufo/waves/round-39/measure/census-end.txt absent at REV
FINDING d6-file .ufo/waves/round-39/measure/numstat-at-9c09ebb1.txt absent at REV
FINDING d7-sentence-mismatch claims[1].predicate is not byte-identical to the counter sentence (mutated-sentence control must be refused)
C2_ROUTED_DEFECTS_V2 predicate=not-met rev=9c09ebb1e2ff594c70ce72093b5d4133c1734dca findings=3 seats=34 tally=23/11 census=undefined d7=false
OBSERVED_EXIT=1
```

The actual replay exit was 1, independently confirming the stored nonzero status. `d7-sentence-mismatch` appeared. The counter also reported the expected d5/d6 missing receipt findings at this frozen REV. For the requested four checks: hashes correct against frozen commit/receipt; actual nonzero exit; d7 present; single predicate count token differs. Full-claims-only mutation check is not cleanly established by the available structural comparison.

VERDICT finding — replay confirms nonzero refusal and d7, and receipt hashes match their sources; full fixture differs beyond only the C2 predicate field under structural comparison.
