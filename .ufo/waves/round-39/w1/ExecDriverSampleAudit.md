# ExecDriverSampleAudit — round-39 driver sample-timeline audit (operability)

Seat: `ExecDriverSampleAudit` · wave `round-39` / `w1` · attempt 1 · axis `operability` · milestone `executable-check`
Item: run the driver with `--runs 2` in a fresh scratch output and independently inspect the sample timeline —
samples monotonic, coverage duration consistent, both socket surfaces present, final sweep post-close;
report any sample gaps over 300 ms.

Lane bounds respected: no production lane file was edited, no git/jj mutation, no commit/push, no fleet or sibling
repo touched, no spawn. All writes are (a) this seat's report path and (b) this seat's evidence directory
`.ufo/waves/round-39/w1/ExecDriverSampleAudit/`. Scratch (`/fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit/`)
was used for the driver output and was removed after the evidence was copied out.

Tool installs: **none**. (`node` v24.21.0, `playwright` 1.64.0 at
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright`, firefox build
`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` were already present on the host.)

---

## 1. What was run

Driver under test (frozen digest `3fba8b68…` per `claims.json`):
`/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs`

Five independent invocations of `node scripts/playwright-firefox-egress-round39.mjs --out <fresh scratch file> --runs 2`
were made (invocation A is the one the item asks for; B–E repeat it to expose variance):

```
cd /fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit
HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit \
  node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round39.mjs \
  --out /fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit/receipt-run2.json --runs 2
```

Exit status and stdout of every invocation were `0` / `refused:false, binding:true, egress:0, survivors:0`, and every
run produced the same first-shot digest
`ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0`:

```
{"wrote":".../receipt-run2.json","runs":2,"refused":false,"binding":true,"egress":0,"survivors":0,
 "firstShot":["ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0",
              "ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0"]}
```
(evidence: `driver-stdout-run.txt`, `driver-stdout-run2b.txt` … `driver-stdout-run2e.txt`)

The fixture is a loopback-only `http.createServer` on `127.0.0.1`; the receipt's `httpLog` shows all 3 requests of
each run going to `127.0.0.1:<fixture port>` only.

## 2. Independent inspection method

The driver writes its own summary fields (`sampleCount`, `coverageMs`, `sockets.*`, `finalSweep`). To audit the
*timeline* rather than trust those summaries, every number below is **recomputed from the raw per-sample records**
(`runs[].samples[]`, each `{t, ss:{ticks,lines,nonLoopback}, proc:{ticks,inodes,nonLoopback}}`) by
`audit-timeline.py` (evidence copy) and aggregated by `aggregate.py` (evidence copy):

```
python3 audit-timeline.py receipt-run2.json > audit-run2.json   # per invocation
python3 aggregate.py                                            # table + invariant checks
```

The committed repository receipt `corpus/evidence/round-39/playwright-egress/receipt.json` was measured with the
same rules and is included in the table as `COMMITTED (repo)`.

### 2.1 Full table (evidence: `aggregate-table.txt`)

| invocation | run | samples | coverageMs | span_ms | cov-span | dmin | dmax | gaps>300 | mono | ssMiss | procMiss | ssMax | procMax | fsAfterLast | fsDelta | surv | portClosed | egress | recompEgress | tree | shot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A (invocation 1) | run1 | 10 | 1646 | 902 | 744 | 98 | 102 | 0 | True | 0 | 0 | 1 | 1 | True | 643 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| A (invocation 1) | run2 | 9 | 1544 | 800 | 744 | 97 | 103 | 0 | True | 0 | 0 | 1 | 1 | True | 640 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| B (invocation 2) | run1 | 16 | 2254 | 1497 | 757 | 95 | 104 | 0 | True | 0 | 0 | 1 | 1 | True | 652 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| B (invocation 2) | run2 | 10 | 1673 | 904 | 769 | 98 | 103 | 0 | True | 0 | 0 | 1 | 1 | True | 664 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| C (invocation 3) | run1 | 13 | 1948 | 1195 | 753 | 94 | 107 | 0 | True | 0 | 0 | 1 | 1 | True | 646 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| C (invocation 3) | run2 | 13 | 1946 | 1194 | 752 | 97 | 101 | 0 | True | 0 | 0 | 1 | 1 | True | 646 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| D (invocation 4) | run1 | 12 | 1881 | 1099 | 782 | 96 | 104 | 0 | True | 0 | 0 | 1 | 1 | True | 676 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| D (invocation 4) | run2 | 10 | 1678 | 903 | 775 | 95 | 107 | 0 | True | 0 | 0 | 1 | 1 | True | 675 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| E (invocation 5) | run1 | 10 | 1638 | 898 | 740 | 96 | 103 | 0 | True | 0 | 0 | 1 | 1 | True | 646 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| E (invocation 5) | run2 | 11 | 1740 | 994 | 746 | 94 | 103 | 0 | True | 0 | 0 | 1 | 1 | True | 636 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| COMMITTED (repo) | run1 | 9 | 1560 | 799 | 761 | 99 | 100 | 0 | True | 0 | 0 | 1 | 1 | True | 661 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |
| COMMITTED (repo) | run2 | 8 | 1461 | 701 | 760 | 99 | 101 | 0 | True | 0 | 0 | 1 | 1 | True | 660 | 0 | True | 0 | 0 | 5 | ebfae99c33fa |

`span_ms` = last sample `t` − first sample `t` (the real socket-observation window);
`cov-span` = recorded `coverageMs` − `span_ms`; `dmin/dmax` = inter-sample delta; `fsDelta` = final-sweep `t` −
last sample `t`.

## 3. Answers to the item's questions

**Samples monotonic — yes.** Every run (10 measured + 2 committed) is strictly increasing in `t`; zero negative
deltas, zero zero-deltas; inter-sample deltas 94–107 ms around the nominal 100 ms `SAMPLE_MS`, no drift.

**Sample gaps over 300 ms — none. Zero.** Largest inter-sample delta observed across all 12 runs: **107 ms**
(invocation C run1 / D run2). No gap of any size exceeded 300 ms; `gaps_over_300ms` is empty for every run.

**Coverage duration consistent — yes for the measurement, with a caveat on what is being measured.** Within an
invocation the two runs' `coverageMs` differ by 102 ms (A), 581 ms (B), 2 ms (C), 203 ms (D), 102 ms (E) — and the
`coverageMs − span` offset is a near-constant **740–782 ms in all 12 runs**. So the spread is entirely *session
speed* variance (session-length spread equals `coverageMs` spread exactly), not instrumentation drift. The
measurement is internally consistent; but see finding F1 — the quantity `coverageMs` is not the sampling window.

**Both socket surfaces present — yes, on every sample of every run.** `ss.ticks == 1` and `proc.ticks == 1` with
`unavailable` absent on **every** sample of **every** run (`ssMiss = 0`, `procMiss = 0` in all 12 runs). Dual-surface
agreement holds in the middle band: e.g. invocation A run1 samples 2–8 show `ss.lines = 1` **and** `proc.inodes = 1`
simultaneously, with `nonLoopback = 0` on both surfaces; samples 0–1 and the last sample show 0/0 on both surfaces
(browser not yet connected / already closed). Both surfaces are readable throughout, including the pre- and
post-connection parts of the window.

**Final sweep post-close — yes, and it is genuinely after the close.** In all 12 runs `finalSweep.t` is **636–676 ms
after the last sample**, matching the driver's `POST_CLOSE_TAIL_MS = 600` plus close time, i.e. the sweep is
executed after `await browser.close()`. Corroborated outside the driver: every pid in `runs[].owned.tree` (5 pids per
run) was already gone from `/proc` at final-sweep time (`survivors = 0`, `survivorPids = []`), the fixture ports
were closed (`portClosed = true`, and `ss -ltn` showed 0 listeners for ports 46065 / 46111 afterwards), and the
owned firefox pids from my runs were absent from `ps` afterwards. The final sweep reports
`ss.lines = 0, proc.inodes = 0, nonLoopback = 0`.

**Zero egress — reproduced.** Recomputed `ss.nonLoopback` + `proc.nonLoopback` over the raw samples equals the
receipt's `egressNonLoopback` for every run and is `0`; `survivors = 0`; `portClosed = true`;
`browserVersion = 157.0`; `userAgent` contains `Firefox/157.0`; `binary` matches `ms-playwright/firefox-\d+/`.

### 3.1 Independent (out-of-process) corroboration of the timeline

For invocation E a host-level observer ran *outside* the driver process, sampling `ss -Htnp` every ~80 ms and
logging wall-clock timestamps (`watch-sockets.sh`, log `external-observer-invE.log`):

* observer ticks: 70, span 5553 ms, deltas 75–85 ms, strictly monotonic, **no gap > 300 ms**;
* the driver's owned firefox pid (run1: 487785, run2: 491481) was seen holding exactly one socket whose peer is
  **loopback** (`127.0.0.1:43199`, `127.0.0.1:37723`) for 565 ms / 571 ms — and the driver samples falling inside
  those external windows (indices 3–7 and 3–8) are exactly the samples where the driver's own two surfaces each
  reported one socket. The driver's in-process timeline and the out-of-process timeline agree.

## 4. Findings

**F1 — the recorded coverage overstates the socket-observation window (claim "samples … over at least 1000 ms").**
`coverageMs` is measured from `t0` (set before the sampler starts) to *after* `browser.close()` and the 600 ms
post-close tail, so it contains ~740–782 ms during which **no sample is taken** (100 ms before the first sample +
~40–80 ms close + 600 ms tail). The real sampling window (`span_ms`) was 701–1497 ms and was **below 1000 ms in 8 of
12 runs, including both committed runs (799 ms and 701 ms)**. The frozen counter's `coverageMs >= 1000` test
therefore passes on a quantity that is ~48 % post-close tail in the committed run2 case (1461 ms recorded vs 701 ms
actually sampled). Under a strict reading of the predicate sentence ("at least 8 socket samples per run **over at
least 1000 ms**"), the committed receipt does not meet the 1000 ms element; it meets it only through the
tail-inclusive proxy. Fixing this needs no counter change (the counter is frozen): the driver could also record the
sampling window (first/last sample `t`), which is already present in the samples array.

**F2 — the committed receipt sits exactly on the counter's sample-count threshold.**
The counter requires `sampleCount >= 8`; the committed receipt's run2 has **exactly 8** (margin 0) and the sampling
window there was 701 ms — the shortest observed. Sample count is a direct function of session length
(observed 8, 9, 9, 10, 10, 10, 11, 12, 13, 13, 13, 16 over the 12 runs; span/100 ≈ count), and the driver does not
bound its 12-step session from below. A faster session (sampling window < ~600 ms) yields 7 samples, which the frozen
counter reports as `run2-samples: sampleCount 7 < 8` → predicate false. The capability row's reproducibility
therefore rests on a one-sample margin.

**F3 — the post-close final sweep's egress content is conditional on survivors (low evidential weight, not a
defect in this round's counter).** The sweep re-observes the owned tree pids; with `survivors = 0` those pids are
already dead, so `observeSs`/`observeProc` can only return zeros — "zero non-loopback in the final sweep" is
guaranteed by construction once survivors are 0 and cannot observe any pre-close egress. It remains a valid
survivor/egress-of-survivor check and its post-close timing is genuine (F-independent, measured 636–676 ms after
the last sample), but it adds no independent egress evidence.

**F4 — session binding is load-bearing on this host (positive confirmation, with a live counter-example).**
Throughout all measurements an unrelated Playwright Firefox was running on this host with the **same binary path**
(`/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`, pid 331494, parent `node prelaunch.mjs`,
`/tmp/playwright_firefoxdev_profile-SddDTI`) and it held a **non-loopback IPv6** connection
`[2a04:4e42:3b::347]:443`; a second unrelated firefox (158.0.1, marionette) held a loopback peer. The driver's
owned-set rule (direct children of *its own* node pid naming `ms-playwright/firefox-\d+/`, plus the `ps -eo pid=,ppid=`
descendant walk) excluded both — verified by the external observer, which saw those sockets while the driver's own
two surfaces reported only loopback. Under the round-38 v1 discovery method (global executable grep) those sockets
would have been attributed to the session and would have produced a false non-loopback egress finding. This is
direct evidence that C1's session-bound discovery is what makes the "zero non-loopback" result meaningful on this
host — and that a global-grep variant would be flaky here, not just weaker.

## 5. Risk / note for the integrator

* The counter passes at HEAD (`node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev HEAD --repo
  /home/vgpnk/Projects/shokunin/tabi-shokunin --json` → `"predicate": true`, `"findings": []`, exit 0; evidence
  `counter-HEAD.json`). Per F1/F2 that pass rests on the tail-inclusive `coverageMs` proxy and on a 0-sample
  margin in the committed run2 — both are measurement-fragility notes, not counter defects.
* Re-measuring the committed receipt on a faster host can drop run2 below 8 samples; re-running the driver to
  refresh the receipt should be done on a host whose Firefox startup is not faster than the one measured here, or
  the driver's session should be given a minimum duration (e.g. a floor on the sampling window) so the sample count
  cannot fall under the counter's threshold.

## 6. Evidence index

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-39/w1/ExecDriverSampleAudit/`:

| file | content |
|---|---|
| `receipt-invA-run2.json` … `receipt-invE-run2.json` | the five fresh `--runs 2` driver receipts (raw sample timelines) |
| `audit-invA.json` … `audit-invE.json` | per-invocation recomputation from the raw samples (monotonicity, deltas, gaps, surface presence, sweep timing, egress recompute) |
| `aggregate-table.txt` | the table in §2.1 plus the invariant summary lines |
| `audit-timeline.py`, `aggregate.py` | the two recomputation scripts (re-runnable) |
| `external-observer-invE.log`, `watch-sockets.sh` | out-of-process `ss` observer log and its script |
| `driver-stdout-run*.txt` | driver stdout (exit 0, `refused:false`, `binding:true`, `egress:0`, `survivors:0`) for each invocation |
| `counter-HEAD.json` | frozen counter output at HEAD (context only) |

Cleanup: the driver removed its own scratch trees (`HYAKU_SCRATCH` subdirectories are empty after each run); my
scratch root `/fast/scratch/hyaku/tabi-r39/ExecDriverSampleAudit/` was deleted after the evidence was copied into the
wave directory; no firefox/node process from my runs survived (`ps` shows none with my owned pids 296149, 296693,
457464, 460375, 487785, 491481).

VERDICT finding — the timeline instrumentation itself is sound (strictly monotonic in all 12 runs, **zero sample
gaps over 300 ms**, max delta 107 ms, both socket surfaces present on every sample with dual-surface agreement
independently corroborated out-of-process, final sweep genuinely post-close at 636–676 ms after the last sample,
zero egress/survivors, port closed), but F1 shows the recorded `coverageMs` overstates the sampling window by
740–782 ms so the "samples over at least 1000 ms" element is met only through a post-close tail (actual window
701–1497 ms; 8 of 12 runs, including both committed runs, below 1000 ms), F2 shows the committed receipt's run2
sample count is exactly the counter's threshold of 8 (one-sample margin, session-length dependent), and F3 records
that the post-close final sweep's egress content is vacuous whenever `survivors == 0`.
