# MutC2Tree — C2 missing-receipt probe

Commands run:
```sh
S=/fast/scratch/hyaku/tabi-r39/MutC2Tree; R=$S/fixture
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/fixture"
git -C "$R" rev-parse --show-toplevel  # /fast/scratch/hyaku/tabi-r39/MutC2Tree/fixture
git -C "$R" checkout --detach 9c09ebb1e2ff594c70ce72093b5d4133c1734dca
node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 9c09ebb1e2ff594c70ce72093b5d4133c1734dca --repo "$R" --json
for p in claims.json census-end.txt numstat-at-9c09ebb1e2ff594c70ce72093b5d4133c1734dca.txt; do [ -f "$p" ] && remove/run/restore; done
```

Observed: fixture top-level assertion matched fixture path; checkout succeeded. Pristine counter exited 1 (output truncated by tool display; predicate false). At this frozen rev all three target files were absent from the checked-out tree: claims.json, census-end.txt, and numstat receipt. Therefore removal and endpoint-mutation runs were not performed; d7/d5/d6 deletion refusals and endpoint behavior could not be evaluated. No scratch restoration claim: scratch tree removed by EXIT trap. No tools installed.

VERDICT could-not-evaluate — frozen revision did not contain any requested receipt endpoints, so the assigned delete/mutate experiments could not be run.
