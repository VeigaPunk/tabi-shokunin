# ExecLoopbackRun — round 40 / attempt 2 — one live loopback capture

Seat: leaf executor. Scope: one independent loopback-only Playwright Firefox capture in isolated
scratch, measuring the round-40 C1 predicate surfaces without producing a round-40 receipt or
touching lane files. Frozen claim read from `.ufo/waves/round-40/claims.json` (C1), frozen bytes
scored verbatim. No predicate amendment, no widen.

## Frozen-bytes check (read-only)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && sha256sum \
    scripts/playwright-firefox-egress-round39.mjs scripts/measure-c1-round40.mjs \
    scripts/selftest-measure-c1-round40.mjs .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b  scripts/playwright-firefox-egress-round39.mjs
a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735  scripts/measure-c1-round40.mjs
5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82  scripts/selftest-measure-c1-round40.mjs
0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c  .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
```

All four match `claims.json.frozenDigests` exactly (driver, wrapper, selftest, counter). Toolchain:
node v24.21.0, Playwright 1.64.0 (`.../node_modules/playwright/package.json`), Playwright-managed
binary `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` present and executable.

## Capture method

Frozen driver `scripts/playwright-firefox-egress-round39.mjs` was **not modified**. A lane-local
harness (`/fast/scratch/hyaku/tabi-r40/ExecLoopbackRun/harness.mjs`, scratch-only) imported its
exported `runOnce({ runName, profileRoot, runNonce })` and invoked it **once**, with `--round40`
present in the harness argv so the driver's `ROUND40` strict path was active inside the run
(`observeSs` → `spawnSync ss -Htnp`, strict `/proc/net` null → unavailable, 1000 ms span gate,
`ss -Hlt` port-closure proof). One fresh 64-hex nonce was generated with
`crypto.randomBytes(32)` and passed as `runNonce`. Scratch:
`/fast/scratch/hyaku/tabi-r40/ExecLoopbackRun/run-scratch/` (profiles inside), removed in a
`finally`.

```
$ node .../harness.mjs /fast/scratch/hyaku/tabi-r40/ExecLoopbackRun/run-scratch \
    .../w1/ExecLoopbackRun/measurement.json --round40
(wrote measurement.json; exit=0; wall 2.63 s)
```

Evidence: `.ufo/waves/round-40/w1/ExecLoopbackRun/measurement.json`
(schema `tabi-r40-exec-l1-single-run-measurement`; the raw per-sample rows, owned tree, commands
and console/HTTP events are inside; it is *not* a `tabi-pw-firefox-egress-receipt-r40`).

## Observed result (real execution, single run)

| Quantity | Observed |
|---|---|
| nonce | `d3dd2c90b3c3285a5d499380243679f61c66c8b67d42a14db4dc1e30a8b65cb4` (64-hex, echoed by the run) |
| run refused | `false`, `refuseReason: null` |
| samples | **13** (cadence 100 ms) |
| strictly increasing `t` | yes |
| first sample `t` / last sample `t` | `1793129723356` / `1793129724553` |
| **actual first→last span** | **1197 ms** (≥1000) |
| coverageMs (driver) | 1988 ms |
| `ss` surface | available on 13/13 samples, `ticks=1` each, `nonLoopback=0` each |
| `proc` surface | available on 13/13 samples, `ticks=1` each, `nonLoopback=0` each |
| observed socket rows (ss sum / proc sum) | 11 / 11 (samples 3–13; samples 1–2 pre-navigation) |
| observed nonLoopback (all samples + final sweep) | **0** |
| final sweep (post-close) | `ss {ticks:1, lines:0, nonLoopback:0}`, `proc {ticks:1, inodes:0, nonLoopback:0}` — both usable |
| owned tree | node pid 2079845, root 2079859 (`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`), tree `[2079859,2079961,2079964,2079974,2079983]` — size 5, nonempty |
| survivors | `0`, `survivorPids: []`; independent check: all five pids `gone` afterwards |
| fixture port | `44153`, `portClosed: true`; independent check: `ss -Hlt`/`ss -Htn` listeners on `:44153` = **0** |
| browserVersion | `157.0`; userAgent `Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0` |
| firstShotSha256 | `ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0` (25382 B, 64-hex) |
| HTTP witnessed | only `http://127.0.0.1:44153/{a.html,b.html,a.html}`; 6 request/response events, 0 console errors |
| step witnesses | navigate.hydrated 183 ms, title, shape (static text intact, `hydrated`), click.effect `count=1 items=1 confirm="confirmed 1"`, evaluate `innerWidth=800 items=1`, history.traverse `/a.html`, history-reset-and-click `0→1`, tree.size 5 |

## Frozen-counter cross-check on this run's real data

The only receipt-shaped artifact allowed here is a scratch probe derived from these captured rows
(single run, current nonce), kept out of `corpus/` and deleted before yield:

```
$ node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs derived-single-run-probe.json --nonce d3dd…
{"nonceMatched":true,"predicate":false,"findings":["run-set"]}   exit=1
```

So on live captured evidence every clause the frozen counter can check per run is satisfied —
nonce binding, schema, `refused:false`, ≥8 strictly increasing samples, span 1197 ms, both
surfaces with positive ticks on every sample and final sweep, zero nonLoopback, nonempty owned
tree, zero survivors, closed port, bound version, 64-hex first-shot hash — and the **only**
finding is `run-set`, i.e. the "exactly two runs" clause that this seat deliberately does not
produce. This is a probe result, not a claim pass: the operative claim counts only the wrapper's
two-run, nonce-bound receipt (`measure-c1-round40` → out path under `corpus/evidence/round40/…`).

## Negative guards exercised (cheap, no browser)

```
$ node scripts/playwright-firefox-egress-round39.mjs --round40 --runs 1 \
    --out /fast/scratch/.../should-not-exist.json --scratch /fast/scratch/.../guard-scratch --nonce cccc…
usage: --out <fresh receipt.json> [--runs 2] [--round40 --scratch <dir> --nonce <64-hex one-use-token>]
exit=64 ; should-not-exist.json absent ; guard-scratch never created
```

The `--round40` driver refuses to produce anything other than a fresh-path, nonce-bound two-run
receipt, before launching a browser or creating scratch. Wrapper pre-existing-output refusal was
not re-run; it is the committed control `controls/c1-measure-selftest-v2.json` (case
`wrapper-refuses-pre-existing-synthetic-replay`).

## Limitations (explicit, not predictions)

- **One run, not two.** Identical-`firstShotSha256`-across-runs, the two-run receipt file and its
  `runNonce` binding were not evaluated here by design; the frozen counter's `run-set` finding is
  the honest boundary of this seat.
- No round-40 receipt was created; `measurement.json` is a lane-local measurement, not a
  claim artifact, and must not be scored as one.
- Round-39 replay refusal (`run-nonce-mismatch` + sample-span findings) was not re-executed;
  committed control `controls/c1-round39-replay-v3.json` covers it.
- Sampling is wall-clock `Date.now()` at 100 ms; 13 samples and 1197 ms span reflect this
  machine's run length, not a guaranteed invariant. Samples 1–2 had 0 observed socket rows (before
  first navigation) while `ticks` stayed positive as the predicate requires.
- Host is shared: seven long-lived Firefox processes from unrelated sessions (pids 785258 et al.,
  `/tmp/playwright_firefoxdev_profile-*`) existed before and after the run; they are outside this
  run's owned tree and were not touched. This run's five pids are all gone.

## Hygiene

Scratch root `/fast/scratch/hyaku/tabi-r40/ExecLoopbackRun/` removed after capture
(`ls` shows only the harness at the time of writing; harness and probes deleted before yield).
No writes outside this seat's report dir; no `git`/`jj` command, no commit/push, no network
beyond `127.0.0.1`, no agents spawned, no pacman, no tool installs (none needed).

VERDICT ok — one live loopback Playwright Firefox run executed through the frozen driver's strict round-40 path (nonce `d3dd2c90…cb4`, Firefox 157.0 / Playwright 1.64.0, bounded tree of 5, 0 nonLoopback on 13/13 samples plus final sweep, span 1197 ms, 0 survivors, port 44153 closed); frozen counter flags only `run-set` on the derived single-run probe, so all per-run clauses are demonstrably live and only the two-run receipt clause remains for the seat that carries it.
