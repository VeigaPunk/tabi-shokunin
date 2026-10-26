# MutC1Counter — environment & commands

Seat: MutC1Counter (leaf; no subagents used). Date: 2026-10-26 UTC.
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin (read-only). Scratch: /fast/scratch/hyaku/tabi-r31/MutC1Counter (clone + mutants + TMPDIR).
Node: v24.21.0 (preinstalled; no tools installed or upgraded — nothing to record under the tooling authorization).

Commands (all exit codes as run):

```
S=/fast/scratch/hyaku/tabi-r31/MutC1Counter
mkdir -p "$S" && git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # exit 0
git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d                      # exit 0
git -C "$S/clone" rev-parse --show-toplevel   # = $S/clone (fixture-scope check per contract)
git -C "$S/clone" rev-parse HEAD              # 9505a10eb80b2a0b273ebaba3f7f872ad302192d
sha256sum "$S/clone/scripts/check-decision-table.mjs"
# d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832  == claims.json frozenDigests.check-decision-table.mjs

# detector baseline, pristine bytes, run twice (before mutants / after all mutants):
TMPDIR=$S/tmp/pristine-before  node $S/clone/scripts/check-decision-table.mjs --selftest --json   # exit 0, cases=34 passed=34 ok=true
TMPDIR=$S/tmp/pristine-nonjson node $S/clone/scripts/check-decision-table.mjs --selftest          # exit 0, DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34 (2.67 s)
TMPDIR=$S/tmp/pristine-after   node $S/clone/scripts/check-decision-table.mjs --selftest --json   # exit 0, cases=34 passed=34 ok=true

# 60 mutants, one mutated copy each under $S/mutants/<id>.mjs (pristine bytes never modified):
python3 $S/mutate.py   # exit 0; per mutant: TMPDIR=$S/tmp/<id> node $S/mutants/<id>.mjs --selftest --json
#                       wall 24.0 s, 8 workers; results in results.json, per-mutant diffs in diffs/<id>.diff

# integrity after all runs:
sha256sum $S/clone/scripts/check-decision-table.mjs   # d15f3bd7...f482f6832 — unchanged
git -C $S/clone status --porcelain                    # (empty)
git -C $S/clone rev-parse HEAD                        # 9505a10eb80b2a0b273ebaba3f7f872ad302192d — unchanged
```

Notes: one earlier non-JSON pristine run failed (exit 1, ENOENT) because its TMPDIR leaf was not pre-created — a harness bug, rerun correctly above; it is detector-independent evidence only.
No network fetches were made (the self-test injects its fetcher; l1 is exercised offline by design).
