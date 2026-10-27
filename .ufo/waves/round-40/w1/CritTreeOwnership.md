# CritTreeOwnership — critic report (round 40 w1, claim C1, milestone falsification)

Scope: owned-tree condition (`per-run owned tree is nonempty`) and its link to browser/socket samples.
Frozen bytes read, digests re-checked unchanged (sha256 prefixes): driver `1f8a15f0…`, wrapper `a0e564c7…`, counter v3 `0b452eac…` (match `claims.json` frozenDigests). Nothing in the predicate was widened or amended; no production file written. No tool installs (RULES.md read; none needed).

## Verdict summary
The predicate as frozen says only "owned tree is nonempty". The frozen counter implements exactly that and **nothing more** about ownership. In the live driver, ownership is a driver-side construction; the counter cannot distinguish a genuine owned tree from any nonempty array. I found **no way for the live wrapper path to produce a false C1 pass** through this surface (wrapper generates the receipt itself and the driver derives the tree from `ps`), but found a real soundness gap in the *counter* (it is mutation-insensitive to every ownership defect except empty) and an unobserved-coverage gap (descendant churn). Neither contradicts the frozen predicate wording; they bound what a C1 pass proves.

## Counter-checked vs driver-asserted (exact lines)
| Fact | Counter-checked? | Where |
|---|---|---|
| `owned.tree` is a non-empty Array | **Yes** (counter line `if(!Array.isArray(r.owned?.tree)||r.owned.tree.length===0)`) | c1-sample-span-v3.mjs |
| Tree elements are integers / live / not 1 / belong to this run / differ between runs | **No** | – |
| `owned.roots`, `owned.nodePid`, `owned.source` present or consistent with tree | **No** | – |
| Root is a direct child of the driver node pid naming `ms-playwright/firefox-N/` | Driver-asserted (`ownedRoots`: `ppid===nodePid` + regex on args) | driver L91-94 |
| Tree = BFS descendants of roots at ONE instant (launch+400 ms) | Driver-asserted | driver L254-255, `ownedTree` |
| Samples use that frozen `rec.owned.tree` for the whole run (never re-walked) | Driver-asserted; receipt stores only `tree0`, not per-sample trees | driver L279 |
| `ss`/`proc` observations are over the tree pids | Driver-asserted; counter only checks `ticks>0` and `nonLoopback` finite/0. `ticks` is the **literal `1`** in the driver (L135, L223), so "positive ticks" proves surface-readable, not tree-bound | driver L135/L223 |
| Samples observed ≥1 socket of the tree | **No** (counter never reads `ss.lines`/`proc.inodes`) | – |
| `survivors`/`survivorPids` | Counter requires 0/[]; computed by driver only over the frozen `tree0` via `/proc/<pid>` existence | driver L345 |
| Final sweep "positive ticks" | Counter-checked, but sweep runs **after** `browser.close()` on a tree whose pids are dead (survivors==0 is a precondition) so it is vacuously 0 egress by construction | driver L344 |

## Counterexamples / evidence

### E1. Counter accepts any nonempty array as "owned tree" (counter-level, mutation test)
Method: take a real nonce-bound receipt produced by the frozen driver (`evidence/probe-receipt-nonce-abab.json`, driver run with `--round40 --runs 2` and test nonce `abab…`, exit 0, binding true, egress 0, survivors 0; **this is a probe receipt, not the C1 measurement**), mutate one field, run frozen counter with the same nonce. Output (`evidence/mutation-output.txt`):
```
0   baseline                                                true []
1   tree-empty                                              false ["run1-owned-empty"]
0   tree-stale-unrelated-pid1                               true []
0   tree-nonexistent-pid                                    true []
0   tree-garbage-strings                                    true []
0   tree-null-elem                                          true []
0   tree-negative/dup                                       true []
0   wrong-root(roots=[] but tree nonempty)                  true []
0   roots-missing                                           true []
0   nodePid-missing                                         true []
0   nodePid-wrong                                           true []
0   source-missing                                          true []
0   root-not-in-tree                                        true []
0   run2-tree==run1-tree (overlap)                          true []
1   owned-missing-entirely                                  false ["run1-owned-empty"]
0   zero observations (ss.lines/proc.inodes=0 everywhere)   true []
0   survivorPids-vs-tree decoupled                          true []
1   owned.tree as object not array                          false ["run1-owned-empty","run2-owned-empty"]
```
Only empty/absent/non-array trees are refused. Stale unrelated PID (`[1]`), nonexistent PID, wrong root, missing owner fields, run-overlapping trees, and samples that observed zero sockets all score `predicate=true`. Impacted axes: coverage (the "owned" qualifier of C1 is satisfied by non-evidence), calibration. This is why the counter alone is not a verdict on ownership; the pass rests on the unchanged frozen driver being the sole receipt producer (the wrapper does not verify the driver digest against `frozenDigests`; it records `driverSha256` only — so receipt-level integrity of "driver is the frozen one" is a reviewer check, not a gate).

### E2. Empty tree / wrong root / stale PID through the LIVE driver
- Empty tree: driver refuses (`refused=true`, reason "owned pid set empty at launch") and returns before sampling; counter then fails `runN-refused`, `sample-count`, `owned-empty`. Fail-closed on both sides. `sh()` failure (ps missing) also yields empty rows → empty roots → refuse.
- Wrong root / stale unrelated PID: cannot enter via `ownedRoots` — requires `ppid===process.pid` AND argv matching `ms-playwright/firefox-\d+/`. In the probe the independent poller (own `ps` walk from the driver pid, `evidence/seen.json`) showed the recorded root was the only direct firefox child; all tree pids had ppid chain to it. Residual: any *other* direct child of the driver pid whose args contain that path (none exists in this driver) would be adopted. Pid reuse can only cause false *survivors* (fail-closed direction).
- Run 2 root is selected from the same node pid; a leaked run-1 Firefox reparents to init, so it neither pollutes run-2's root nor is covered by survivors for run 2 (it is in run 1's tree, checked once, at run 1's end).

### E3. Descendant churn — the tree is a one-shot snapshot (driver-level)
Independent poller (40 ms `ps` BFS from the driver pid, `evidence/seen.json`) vs recorded `owned.tree`, same live session:
- run1 recorded tree `[2076440,2076536,2076542,2076552,2076562]` (root, forkserver and 3 children, snapshot at ~400 ms).
- Descendants observed later and **NOT in the tree**: `2076656`, `2076658` (content procs, +974 ms), `2076713` (sandboxed tab proc, +1134 ms); run 2 likewise `2077078`, `2077232`, `2077293`. Also short-lived `gfxtest` children (not in tree, exit quickly).
- Consequence: samples never re-walk the tree (driver L279 uses `rec.owned.tree`), so sockets held by late descendants are unobserved by both `ss` and `/proc` surfaces, and `survivorPids` is computed only over `tree0`, so a late-descendant survivor would not be counted. The receipt cannot show this because it stores only `tree0`.
- Mitigating, observed: second probe `evidence/p2-output.txt` (fresh Firefox 157 headless via Playwright, loopback fetch, then full descendant listing with `/proc/<pid>/fd` × `/proc/net/tcp{,6}`):
```
2080958 IN-tree0 parent tcp: 0100007F:B70E->0100007F:8723/01
2081041 IN-tree0 forkserver tcp: -
2081044 IN-tree0 socket tcp: -
2081053 IN-tree0 tab tcp: -
2081063 IN-tree0 rdd tcp: -
2081106 LATE tab tcp: -
2081148 LATE utility tcp: -
```
  The only TCP socket is held by the root parent (in tree); late `tab`/`utility` descendants held none in this scenario. So the gap is a **coverage limitation of a one-shot tree, not an observed hole** on this fixture. A scenario where a late-spawned process opens a non-loopback TCP socket would be missed; the fixture never navigates off 127.0.0.1, so the strong C1 claim ("zero non-loopback") is "none observed from the 400 ms-snapshot tree" rather than "none from all browser descendants".

### E4. Link between tree and samples
- `ss` uses regex `pid=(?:<tree>)[,\)]` over the global `ss -Htnp`; `proc` walks `/proc/<pid>/fd` for tree pids. Both are properly scoped to `rec.owned.tree` (as the frozen snapshot).
- Observed non-vacuity in the probe: `ss.lines` = 0,0,1,1,… and `proc.inodes` identical series (run1 13 samples, run2 12) — the two surfaces agree and the tree does hold the loopback socket. But the counter never requires `lines>0`/`inodes>0`, so a tree that misses the socket holder (E1 "zero observations" row) would still pass with `nonLoopback=0`. Also the first two samples are 0 (before navigation), so absence of observation is normal pre-load, not an error signal.
- `ticks:1` is hard-coded; "positive ticks on every sample and final sweep" is satisfied by readable surfaces, and by the final sweep over dead pids.

## Smallest safe corrections (do not require widening the frozen predicate; for a future round / reviewer gate)
1. Counter: require `owned.tree` elements to be unique positive integers, `roots[].pid ⊆ tree`, `nodePid` integer, tree disjoint between runs, and `Σ ss.lines>0 && Σ proc.inodes>0` per run (a nonvacuity check on the owned set). Mutation script above is the regression test (should flip every 0 row except baseline to 1).
2. Driver: re-walk the tree each sample (union with previous), record `treeSeen` per run, and compute survivors over the union; record per-pid holder in `ss.byPid` (declared in the code comment but not emitted).
3. Wrapper: refuse unless `driverSha256` equals `frozenDigests` entry (currently recorded only).
Until then, treat C1 ownership as: counter-checked = nonempty array; driver-asserted = ppid-rooted, 400 ms snapshot, TCP only (v4/v6 via /proc, ss -t).

## Limitations
- I did not run `node scripts/measure-c1-round40.mjs` (the counting command) — it is the main agent's measurement and writes to the fixed `TabiR40a2` scratch/out path; my probe used the frozen driver directly into my own scratch with a test nonce, so no claim-verdict is asserted here.
- Probe fixture is loopback-only; E3's "late descendant opens non-loopback socket" was reasoned from code and process-spawn observation, not demonstrated (external sites forbidden).
- Poller timestamps have ~40 ms resolution and its own `ps`/`ss` processes are filtered by visual inspection (they appear as NOT-IN-TREE helper children of the driver, harmless).

## Evidence paths (relative to tabi-shokunin)
- `.ufo/waves/round-40/w1/CritTreeOwnership/evidence/mut.mjs`, `mutation-output.txt`
- `.ufo/waves/round-40/w1/CritTreeOwnership/evidence/probe.mjs`, `seen.json`, `probe-receipt-nonce-abab.json`
- `.ufo/waves/round-40/w1/CritTreeOwnership/evidence/p2.mjs`, `p2-output.txt`
- Scratch `/fast/scratch/hyaku/tabi-r40/CritTreeOwnership/` deleted before yield.

VERDICT finding — C1 owned-tree is counter-checked only as "nonempty array" (17-case mutation: stale/unrelated/garbage/nonexistent PIDs, missing/wrong roots/nodePid, run-overlap and zero-observation trees all score predicate=true); owned tree is a one-shot 400 ms driver snapshot, late descendants (tab/content procs) are neither socket-sampled nor survivor-checked, though in the observed loopback session the only TCP socket sat in the in-tree root and the live wrapper path produced no false pass.
