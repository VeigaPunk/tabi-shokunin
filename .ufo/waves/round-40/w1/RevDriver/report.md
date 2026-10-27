# RevDriver — round 40 C1 driver review

## Scope and frozen inputs

Reviewed the frozen bytes at `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` for:

- `scripts/playwright-firefox-egress-round39.mjs` — SHA-256 `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b`
- `scripts/measure-c1-round40.mjs` — SHA-256 `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735`
- `scripts/selftest-measure-c1-round40.mjs` — SHA-256 `5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82`
- `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` — SHA-256 `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c`

The four digests match `claims.json` `frozenDigests`; `git diff 07e99cf1… HEAD -- <these four paths>` and path-scoped `git status --porcelain` were empty. No production files were changed.

## Findings

### Medium — the owned process set is a one-time PID snapshot, not refreshed during sampling or cleanup

In `scripts/playwright-firefox-egress-round39.mjs`, `runOnce` calls `ownedRoots(process.pid)` and `ownedTree(...)` once, after a fixed 400 ms delay, then stores `tree0` as `rec.owned.tree`. Every interval sample and the post-close final sweep call `sampleSockets(rec.owned.tree)`; `ownedTree` is not called again. The header comment says the full descendant tree is enumerated “once per sample tick,” but the code does not do that.

Concrete false-green: a Firefox descendant created after the snapshot (for example, a late content/GPU process or a replacement after a crash) is absent from both `ss` PID matching and `/proc/<pid>/fd` inode matching for every sample and final sweep. If it holds a non-loopback TCP connection, that connection is uncounted. If it remains after `browser.close()`, `survivorPids` also checks only the snapshot, so the receipt can report zero survivors while that descendant remains alive. The counter checks that the snapshot is nonempty, not that it is current or complete. This is a defect in the evidence boundary, even though my happy-path runs did not demonstrate a late child.

Related attribution limitation: survivor detection uses bare PID existence (`existsSync('/proc/<pid>')`) without process start-time/identity checks. PID reuse can make an unrelated process look like a surviving owned process (false refusal); identity is also not established for the collected socket owners. The dominant false-green is the omitted post-snapshot descendant, not PID reuse by itself.

### Medium — preflight socket observations are discarded

The driver obtains `const preflight = sampleSockets(tree0)` and uses it only to test `.unavailable`. It does not retain or add its `ss`/`proc` `nonLoopback` counts to `rec.samples`, `rec.finalSweep`, or the reported aggregate. Thus a non-loopback socket observed at preflight can be dropped from the scored receipt; if it closes before the first interval tick, all scored counts can remain zero. There is also an unobserved interval from browser launch through the 400 ms sleep, root discovery, and tree construction before preflight. This is a concrete blind window for the broader “no observed egress” interpretation; the frozen counter only scores samples and final sweep.

### Low — the first-to-last span uses wall-clock time, not a monotonic clock

Samples record `Date.now()` and the counter accepts a span when `last - first >= 1000`. A forward wall-clock adjustment during the run can inflate that value without one second of elapsed monotonic time; the driver’s own span wait uses `Date.now()` too. This leaves a false-green route for the actual-elapsed-span requirement under a forward clock step. Backward adjustments generally produce non-increasing timestamps and fail closed. I did not induce a clock adjustment.

### Low — “surface available” can mean a successful empty observation

In round-40 mode, `observeSs` treats `ss` exit status 0 as a successful tick even when stdout is empty; it returns `{ticks:1, lines:0, nonLoopback:0}`. `observeProc` treats a failed `/proc/<pid>/fd` directory read as `null` and skips that PID, then still returns a successful tick when `/proc/net/tcp{,6}` is readable. The counter’s `usable()` checks positive ticks and finite `nonLoopback`, not successful per-PID coverage or positive observations. Thus status-0 empty `ss` output and/or inaccessible owned PID fd directories can score as available zero-count observations. This is a counter/driver evidence-strength gap, not a claim that those conditions occurred in my run.

## Exercised checks and output

Commands were run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`; all generated files were under `/fast/scratch/hyaku/tabi-r40/RevDriver/` and removed before handoff.

- Environment: `node -v` → `v24.21.0`; `ss -V` → `ss utility, iproute2-7.2.0`; Firefox binary existed at `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`; Playwright package version → `1.64.0`.
- `node scripts/selftest-measure-c1-round40.mjs /fast/scratch/hyaku/tabi-r40/RevDriver/selftest` → output began `{"schema":"tabi-r40-c1-measure-selftest-v2","cases":7,"passed":7,...}`; exit 0. The 7/7 suite covers its parser-only synthetic positive, four unavailable-surface mutants, stale round-39 replay, and pre-existing-output refusal. It does not test late descendants, PID identity/reuse, dropped preflight counts, or wall-clock adjustment.
- Direct driver: `node scripts/playwright-firefox-egress-round39.mjs --round40 --runs 2 --out /fast/scratch/hyaku/tabi-r40/RevDriver/live-receipt.json --scratch /fast/scratch/hyaku/tabi-r40/RevDriver/driver-scratch --nonce e9d49ef390dc6f9adecc3491dffb6f4176da8420051bc7fda4043d77a089a4ae` → `{"wrote":"…/live-receipt.json","runs":2,"refused":false,"binding":true,"egress":0,"survivors":0,"firstShot":["ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0","ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0"],"runNonce":"e9d49ef390dc6f9adecc3491dffb6f4176da8420051bc7fda4043d77a089a4ae"}`; `SELFTEST_EXIT=0 DRIVER_EXIT=0`. Runs had 13/12 samples, spans 1201/1100 ms, five PIDs in each stored tree, zero survivors, closed port, and `browserVersion:"157.0"`.
- Measured wrapper with scratch output: `node scripts/measure-c1-round40.mjs --out /fast/scratch/hyaku/tabi-r40/RevDriver/wrapper-receipt.json --scratch /fast/scratch/hyaku/tabi-r40/RevDriver/wrapper-scratch` → wrapper JSON included `driverExit:0`, `nonceMatches:true`, `counterExit:0`; `WRAPPER_EXIT=0`. Both runs had 13 samples and 1199 ms span. Samples had positive ticks on both surfaces and zero nonLoopback counts. In each run the first two and last sampled ticks had `ss.lines:0` and `proc.inodes:0`; intervening ticks had one observation. The final sweep likewise had ticks 1 but zero observations. This directly illustrates the accepted empty-observation behavior above; it is not itself a predicate failure because the frozen predicate requires positive ticks, not positive observation counts.
- The scratch wrapper run printed `driverSha256` equal to the frozen driver digest and a fresh 64-hex nonce. No external site was contacted; the driver’s fixture binds to `127.0.0.1`.

The direct and wrapper receipts lived only in scratch and were deleted, so no durable receipt path is supplied. I did not perturb process trees, clocks, `/proc`, or `ss`; the false-green scenarios above are grounded in the frozen control flow and counter predicates rather than a destructive host experiment. No tools were installed.

## Residual risk and verification gaps

The live path and included selftest passed on this host, but they do not validate descendant refresh/completeness or PID identity. TCP-only measurement is also intentionally narrower than general network egress: `ss -t` and `/proc/net/tcp{,6}` do not observe UDP. Version checking only requires each run’s `browserVersion` to be a nonempty string; the counter does not enforce equality between run versions or cross-check against the binary/user-agent, though the exercised runs reported `157.0` and the expected Firefox binary path. I did not rerun the project’s full measurement/data workflow or alter any frozen predicate.

VERDICT finding — frozen run passed exercised checks, but stale owned-tree membership and discarded preflight counts admit concrete unobserved-process/egress false greens.