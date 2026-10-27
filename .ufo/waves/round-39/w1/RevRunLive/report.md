# RevRunLive — round 39 independent driver rerun

Axes: coverage, calibration. Frozen claims read from `claims.json`; C1 requires two identical first-shot hashes, session-bound Firefox version, owned trees, >=8 samples / >=1000 ms per run, zero non-loopback on ss and /proc including final sweep, zero survivors and closed fixture port. Frozen C1 counter source read before execution. No tools installed.

## Commands and observed output

```sh
S=/fast/scratch/hyaku/tabi-r39/RevRunLive
mkdir -p "$S" "$S/tmp"
export HYAKU_SCRATCH="$S" TMPDIR="$S/tmp"
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/playwright-firefox-egress-round39.mjs --out "$S/receipt.json" --runs 2
```

Driver process exited 0. Exact stdout:

```text
{"wrote":"/fast/scratch/hyaku/tabi-r39/RevRunLive/receipt.json","runs":2,"refused":false,"binding":true,"egress":0,"survivors":0,"firstShot":["ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0","ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0"]}
```

Per-run observed details:

```text
run1 hash=ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0 version=157.0 owned tree=[212240,212342,212349,212358,212367] samples=17 coverageMs=2367 ss observations=9 nonLoopback=0 proc observations=9 nonLoopback=0 finalSweep ss(ticks=1,lines=0,nonLoopback=0) proc(ticks=1,inodes=0,nonLoopback=0) egressNonLoopback=0 survivors=0 portClosed=true
run2 hash=ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0 version=157.0 owned tree=[214202,214317,214323,214333,214342] samples=24 coverageMs=3095 ss observations=14 nonLoopback=0 proc observations=14 nonLoopback=0 finalSweep ss(ticks=1,lines=0,nonLoopback=0) proc(ticks=1,inodes=0,nonLoopback=0) egressNonLoopback=0 survivors=0 portClosed=true
```

## Comparison with committed receipt

Committed receipt `corpus/evidence/round-39/playwright-egress/receipt.json` reports schema v2, browserVersion 157.0, binding true, total egressNonLoopback 0 and survivors 0. Run1 firstShotSha256 matches exactly (`ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0`). Its run1 records 9 samples / 1560 ms; ss 6 observations and proc 6, each zero non-loopback; final sweep both zero; fixture port closed. This rerun also had zero non-loopback observations on both surfaces, zero survivors, port closed and the same session-bound version. Rerun sample counts and durations exceeded the predicate minima. Detailed rerun receipt: `.ufo/waves/round-39/w1/RevRunLive/rerun-receipt.json`; stdout/stderr saved alongside.

Cleanup: driver exit handler removes its browser profile scratch; shell EXIT trap removed `/fast/scratch/hyaku/tabi-r39/RevRunLive`. No separate fixture service process was launched (the driver owns its loopback server); its per-run receipt records portClosed=true. No browser process survivor was reported.

VERDICT ok — independent two-run driver rerun matched committed run1 first-shot hash and session-bound Firefox version; per-run sampling, dual-surface egress, survivor and port-close observations met the stated C1 checks.
