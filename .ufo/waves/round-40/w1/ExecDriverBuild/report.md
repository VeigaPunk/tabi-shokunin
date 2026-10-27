# ExecDriverBuild — round 40 / attempt 2 — driver change outline + executed loopback evidence

Seat: leaf executor (report-only). Axes: **coverage**, **operability**.
Item: outline a concrete implementation change to the existing C1 driver that (1) records
per-sample timestamps across >=1000 ms, (2) refreshes owned process identity, (3) fails closed
on unavailable `ss`/`proc`; execute the current driver in a loopback-only scratch copy where
practical. Production tree was not edited; no commit, no agent dispatch, no external site
interaction, no pacman, no tool installs.

Frozen claim read from `.ufo/waves/round-40/claims.json` (C1 only). Predicate was not widened,
amended or re-interpreted anywhere below.

## 1. Frozen bytes verified (read-only)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && sha256sum \
    scripts/playwright-firefox-egress-round39.mjs scripts/measure-c1-round40.mjs \
    scripts/selftest-measure-c1-round40.mjs .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b  scripts/playwright-firefox-egress-round39.mjs
a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735  scripts/measure-c1-round40.mjs
5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82  scripts/selftest-measure-c1-round40.mjs
0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c  .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
```

`git show 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4:<each path> | sha256sum` returned the same four
digests, so the freeze commit is exactly the bytes I ran. `git diff --stat 07e99cf..HEAD --
scripts/ .ufo/waves/round-40/counters/ .ufo/waves/round-40/claims.json` printed nothing (HEAD is
`c925d92`; the three later commits do not touch claim bytes).

Toolchain: node v24.21.0 (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`),
Playwright 1.64.0, binary `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`.
Scratch only: `/fast/scratch/hyaku/tabi-r40/ExecDriverBuild/` (deleted before yield).

## 2. Baseline: the frozen driver, executed unmodified (byte-identical scratch copy)

```
$ cp scripts/playwright-firefox-egress-round39.mjs $S/driver-frozen-copy.mjs   # sha256 1f8a15f0…545b
$ node driver-frozen-copy.mjs --round40 --runs 2 --out $S/frozen-receipt.json \
    --scratch $S/s1 --nonce $N            # $N = openssl rand -hex 32
exit=0   (wall 5.30 s)
{"wrote":"…/frozen-receipt.json","runs":2,"refused":false,"binding":true,"egress":0,
 "survivors":0,"firstShot":["ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0",
 "ebfae99c33fa602d5e68bdaa0265e5bf29ad69e7c94f26c731dfc3976c56cbf0"],
 "runNonce":"8e0bfb50259e8cdcf62ecd373ca6d98b5830f39783622bfe17c50633afa54ab8"}
$ node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs $S/frozen-receipt.json --nonce $N
{"schema":"tabi-r40-c1-measured-v3", … "nonceMatched":true,"predicate":true,"findings":[]}  exit=0
```

| run | samples | first→last span | min gap | owned tree | ss lines (sum) | proc inodes (sum) | final sweep | survivors | port closed | version |
|---|---|---|---|---|---|---|---|---|---|---|
| run1 | 12 | 1103 ms | 99 ms | 5 pids, fixed at launch | 10 | 10 | ss ticks 1 / lines 0, proc ticks 1 / inodes 0 | 0 | true | 157.0 |
| run2 | 13 | 1199 ms | 99 ms | 5 pids, fixed at launch | 11 | 11 | as above | 0 | true | 157.0 |

`ls -la $S/s1` after exit: empty (driver scratch removed on exit). **This is not claim evidence**:
the claim's counting command writes `corpus/evidence/round40/playwright-egress/receipt.json` through
`measure-c1-round40.mjs`, which is a production write and out of this seat's scope. What it shows is
that on this host the frozen bytes currently do satisfy the frozen counter, with 12–13 samples and a
103–199 ms margin over the 1000 ms floor.

## 3. Defects found in the frozen driver (the three assigned items)

### D1 — per-sample timestamps exist but the driver never enforces the counter's floors
`sampleSockets` stamps `t: Date.now()` **after** both surfaces are read, and the round-40 gate is:

```js
while (!sampleError && (rec.samples.length < 2 ||
       rec.samples.at(-1).t - rec.samples[0].t < 1000) && Date.now() < spanDeadline) await sleep(20);
if (!sampleError && (rec.samples.length < 2 || … < 1000)) sampleError = new FailClosed('observed sample span did not reach 1000 ms');
```

The counter requires `samples.length >= 8` **and** span `>= 1000`; the driver's own success gate
checks `2` samples and a wall-clock difference, so a session that produced 2–7 samples over 1001 ms
would exit 0 and be refused only afterwards by the counter. Observed margin: 12 and 13 samples —
4–5 above the counter floor, but that margin is incidental (100 ms tick vs. 1.1 s session), not
enforced. There is no per-sample interval record, no sample-start/sample-end pair, and the span is
computed from two `Date.now()` reads that a clock step can distort.

### D2 — owned process identity is captured once, at launch
`rec.owned.tree = tree0` is computed 400 ms after launch and reused for every sample and for the
post-close final sweep. Measured with a loopback probe that reproduces the driver's own selection
rule (`ps -eo pid=,ppid=,args=`, children of the node pid naming `ms-playwright/firefox-*`, plus
descendant walk), against a real Playwright Firefox session carrying the same fixture shape:

| snapshot | owned pids |
|---|---|
| launch + 400 ms | `2085305, 2085389, 2085392, 2085401, 2085410` (5) |
| after first navigation | + `2085449` (6) — `addedVsLaunch: [2085449]` |

So a Firefox process spawned after launch is never in the observed set; in the frozen receipts the
tree is exactly 5 pids for the whole session and ss lines are 10/11, versus 13/12 when the set is
refreshed (below). Survivors are also tested with `existsSync('/proc/<pid>')` only, so a recycled pid
is indistinguishable from a live owned process.

### D3 — fail-open paths (three, measured)
1. **Final sweep.** `rec.finalSweep = sampleSockets(rec.owned.tree)` records `{unavailable:true}`
   but never sets `refused`. Demonstrated (mutant D, frozen bytes, `ss -Htnp` failing only after the
   browser exited): run1 → `refused:false, finalSweep:{unavailable:true}`, driver counts the run as
   successful; only the counter objects (`run1-final-ss-unavailable`, `run1-final-proc-unavailable`).
2. **Egress.** `rec.egressNonLoopback > 0` never refuses. Mutant E (slow `ss`, below): `egress:106`,
   `refused:false`, driver exit 0, counter exit 1.
3. **Surface-probe conflation.** `pidPpidTable()` runs `ps` through `sh()`, which returns `''` on
   failure — a broken `ps` is indistinguishable from "no Firefox process"; `observeProc` maps every
   `/proc/<pid>/fd` error (including `EACCES`) to "exited mid-sample" via `catch { return null }`,
   and `observeSs` treats `LISTEN` rows (peer printed as `0.0.0.0:*`) as non-loopback egress, a
   false-positive route that could fail a clean run.

## 4. The proposed change (concrete, minimal, 346-line diff: +175 / −41)

Files: `.ufo/waves/round-40/w1/ExecDriverBuild/driver-proposed.mjs` (full file, sha256
`6a8d2a5e2ed39a755fdbafcfef7f6d2c2560320a4764eaa36c19426987721923`) and
`driver-proposed.diff` (labels `a/scripts/…` / `b/scripts/…`, applies with `patch -p1` at the repo
root; verified: dry-run exit 0 and the patched copy reproduces the proposed sha256). The file path
is unchanged, so `measure-c1-round40.mjs` needs no edit — but the driver digest in
`claims.json.frozenDigests` changes, so adopting it requires a new **pre-data** freeze that
supersedes `07e99cf`, before any dispatch or data.

**Hunk 1 — one monotonic clock for sample stamps.**
```js
const CLOCK0 = Date.now(), MONO0 = process.hrtime.bigint();
const monoMs = () => Number(process.hrtime.bigint() - MONO0) / 1e6;
const nowT = () => CLOCK0 + Math.round(monoMs());
let lastSampleT = 0;
function stamp() { const m = monoMs(), t = CLOCK0 + Math.round(m);
  const ordered = t > lastSampleT; if (ordered) lastSampleT = t; return { t, m, ordered }; }
```
`sampleSockets` now stamps at observation start and returns `{t, m, ordered, tEnd, pids, ss, proc}`.
A non-increasing stamp is not silently published: the sampler aborts the run.

**Hunk 2 — wait for the counter's floors, not a surrogate.**
```js
const MIN_SAMPLES = 8, MIN_SPAN_MS = 1000, COVERAGE_BUDGET_MS = 8000;
const spanMs = () => (rec.samples.length >= 2 ? rec.samples.at(-1).t - rec.samples[0].t : 0);
while (!sampleError && (rec.samples.length < MIN_SAMPLES || spanMs() < MIN_SPAN_MS) && Date.now() < deadline) await sleep(20);
if (!sampleError && (rec.samples.length < MIN_SAMPLES || spanMs() < MIN_SPAN_MS))
  sampleError = new FailClosed(`sample coverage short: n=${rec.samples.length} span=${spanMs()}ms (need n>=8 and span>=1000ms)`);
```
The receipt also carries `sampleSpanMs` and `sampleIntervalsMs` (measured min gap 97–103 ms), so the
coverage claim is auditable from the receipt rather than recomputed.

**Hunk 3 — refresh owned identity before every observation.**
```js
function refreshOwned(nodePid, state) {          // one fresh `ps` snapshot per call
  const rows = pidPpidTable(); if (rows === null) return { available:false, reason:'process table unreadable (ps exited nonzero)', roots:[], tree:[] };
  const roots = rows.filter(([pid, ppid, args]) => ppid === nodePid && /ms-playwright\/firefox-\d+\//.test(args))…;
  const tree = ownedTreeFromRows(rows, roots.map(r => r.pid));
  state.refreshes += 1;
  if (!roots.length || !tree.length) return { available:false, reason:'owned pid set empty on refresh', roots, tree };
  for (const pid of tree) if (!state.seen.has(pid)) state.seen.set(pid, procStartTime(pid));  // /proc/<pid>/stat field 22
  return { available:true, roots, tree };
}
```
Selection is still exclusively "children of this node process naming the Playwright Firefox" plus a
descendant walk, so nothing outside this process's own spawn set can enter. `rec.owned` keeps
`tree` (union of every pid seen, non-empty for the counter), adds `liveTree`, `treeSizeBySample`,
`refreshes`; survivors are now `pid + starttime` matches, so pid reuse cannot fake a survivor.

**Hunk 4 — surfaces distinguish "unavailable" from "nothing there".**
`ss`: skip `LISTEN` rows for egress and score the bind address separately
(`nonLoopback` = peer egress, `nonLoopbackBind` = wildcard/external bind, `listeners`), because a
`LISTEN` row prints `0.0.0.0:*` and was being counted as outbound traffic.
`proc`: `socketInodesOfPid` returns `{gone, inodes, code}` — `ENOENT/ESRCH` means the pid exited,
any other code means the fd table was unreadable; `observeProc` reports `{ticks, inodes, nonLoopback,
livePids, denied}` and returns `null` when **every** owned pid was unreadable, so EACCES can never be
reported as a clean empty sample. `sampleSockets` returns `{unavailable:true, missing:['ss'|'proc']}`
so refusal messages name the dead surface.

**Hunk 5 — fail-closed ladder after teardown, with cleanup evidence retained.**
```js
clearInterval(sampler);                       // window ends when shutdown starts (see §5, finding)
try { await browser.close(); } catch {}
…
rec.finalSweep = sampleSockets(rec.owned.liveTree);
rec.survivorPids = [...ownedState.seen.entries()].filter(([pid, start]) => start !== null && procStartTime(pid) === start).map(([pid]) => pid);
… port check …
if (sampleError)                         → refused 'sampling aborted: …'
if (rec.finalSweep.unavailable)          → refused 'final sweep socket observation unavailable (ss|proc)'
if (!(finalSweep.ss.ticks > 0 && finalSweep.proc.ticks > 0)) → refused 'final sweep ticks nonpositive'
if (!rec.portClosed)                     → refused 'fixture listen-port closure unavailable or still listening'
```
Final sweep now targets the **last live** owned tree (post-launch processes included) and cleanup
evidence is written before any refusal, so a refused receipt still shows survivors/port state.

## 5. Executed proposal (scratch copy, loopback only)

```
$ node driver-proposed.mjs --round40 --runs 2 --out $S/proposed3-receipt.json \
    --scratch $S/s4 --nonce $N3            # fresh openssl rand -hex 32
exit=0
{"wrote":"…/proposed3-receipt.json","runs":2,"refused":false,"binding":true,"egress":0,"survivors":0,
 "firstShot":["ebfae99c…cbf0","ebfae99c…cbf0"],"runNonce":"19ecb10cb8759181f19ee8fa4ec66be306d45f9766e5fc6ffc41d749929d3924"}
$ node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs $S/proposed3-receipt.json --nonce $N3
{"predicate":true,"findings":[],"nonceMatched":true}   exit=0
```

| run | samples | span | intervals | tree sizes per sample | pids seen | refreshes | ss lines | proc inodes | final sweep | survivors | port | version |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| run1 | 16 | 1499 ms | 98–103 ms | 6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7 | 7 | 17 | 13 | 13 | ss `{ticks:1,lines:0,listeners:0,nonLoopback:0,nonLoopbackBind:0,pidCount:7}`, proc `{ticks:1,inodes:0,livePids:0,denied:0}` | 0 | true | 157.0 |
| run2 | 15 | 1397 ms | 97–101 ms | 6,6,6,7,7,7,7,7,7,7,7,7,7,7,7 | 7 | 16 | 12 | 12 | as above | 0 | true | 157.0 |

`tree sizes per sample` is the visible effect of the refresh: the set grows 6→7 **inside** the run,
and ss/proc observations rise from 10/11 (frozen) to 13/12 because the later pid's sockets are now
observed. Span margins over the 1000 ms floor are 499/397 ms versus the frozen 103/199 ms.

**A first attempt at this change was refused by its own new guard**, and that result is kept as
evidence rather than hidden: `proposed2-receipt.json` shows both runs
`refused:true, reason:"sampling aborted: owned process identity refresh failed: owned pid set empty on refresh"`
(n=18/15, span 1700/1403 ms) because the frozen `finally` clears the sampler **after**
`await browser.close()`, so ticks land during teardown where a live-set refresh legitimately finds
nothing. Hunk 5's `clearInterval`-before-close ordering is the fix; it also means the observation
window ends exactly at shutdown start.

## 6. Fail-closed mutants exercised against the proposal (all loopback only)

`ss` replaced by a PATH shim; `ps` left real; exact outputs retained.

| mutant | shim behaviour | driver result | refusal text (verbatim) |
|---|---|---|---|
| A | `ss` exits 1 always | exit 1, both runs refused | `socket observation surface unavailable at pre-flight (ss)` |
| B | `ss` ok for 3 calls, then exit 1 | exit 1; run1 n=2, run2 pre-flight | `sampling aborted: socket observation became unavailable mid-session (ss)` / `…at pre-flight (ss)` |
| C | `ss -Htnp` fails once a marker is touched after the browser exits | exit 1; run1 sampled 18/1706 ms then refused | `final sweep socket observation unavailable (ss)`, `finalSweep:{unavailable:true, missing:["ss"]}` |
| D | same as C, **frozen** driver | run1 `refused:false` with `finalSweep:{unavailable:true}`; run2 refused at pre-flight | — (this is D3.1, the fail-open) |
| E | `ss` real but `sleep 0.25` first | **frozen** driver: exit 0, `refused:false`, `egress:106`, n=158/157, span 43/42 s | counter exit 1, per-sample `ss-egress`/`proc-egress` findings (this is D3.2) |
| F | same as E, proposed driver | exit 0, `refused:false`, `egress:130`, n=132/132, span 38.5/38.9 s | counter exit 1, per-sample egress findings |

Mutants E/F exposed a claim-relevant fact beyond the fail-open: under main-thread contention the
session stretched to ~44 s and a **real outbound connection from the launched Firefox process**
appeared. A logging `ss` shim (frozen driver, 1 run, non-round40 path) captured, for the run's own
Firefox root pid 2176993: 66 matched rows, 42 to `127.0.0.1:35177` (the fixture) and **24 to
`[2a04:4e42:3b::347]:443`** — a Fastly-hosted Mozilla endpoint. Example row verbatim:

```
ESTAB   0      0      [2804:14d:5c56:36ef:2ed8:aeff:0:2c0]:41228                      [2a04:4e42:3b::347]:443   users:(("firefox",pid=2176993,fd=85))
```

The driver has no `--offline`/proxy isolation, so "all observed nonLoopback counts are zero" holds
today only because the session ends in ~2 s. The fixture is not network-isolated; that is a coverage
risk for C1 as frozen, and it is recorded here rather than fixed (fixing it means new prefs or a
proxy, i.e. a driver/predicate decision above this seat).

## 7. Cross-checks

* Frozen control suite still green: `node scripts/selftest-measure-c1-round40.mjs <scratch>` →
  exit 0, `{"cases":7,"passed":7,"failures":[]}` (parser-only synthetic positive passes the counter;
  the four unavailable mutants, the stale round-39 nonce and the pre-existing-output wrapper case are
  each refused with their expected finding). So the counter/wrapper side of C1 is unchanged by the
  driver proposal.
* Counter semantics note (no widening requested): `usable()` only needs `ticks > 0`, and `ticks` is
  a constant `1` per completed surface sweep. In the frozen run several samples had `ss.lines: 0`
  (nothing to see yet) yet `ticks: 1`. "Positive ticks on every sample" therefore evidences surface
  availability, not observation volume; the proposal keeps `ticks` meaning "sweep completed" and adds
  `pidCount`/`livePids`/`denied`/`listeners` so the distinction is visible.
* Ownership hygiene: 7 `firefox-1555` processes from 14:42Z (another seat's session) were visible in
  `ps` throughout; the drivers' `ppid === process.pid` + argv filters exclude them by construction,
  and the probe showed that foreign pid had only loopback peers.

## 8. Limitations

* The claim itself was **not** scored: the counting command writes
  `corpus/evidence/round40/playwright-egress/receipt.json` (production, read-only for this seat). All
  receipts here come from a scratch copy, so `predicate:true` above is capability evidence, never a
  claim verdict.
* The `proc`-unavailable branch is code-inspected only. Forcing `/proc/net/tcp{6}` or the fd tables
  to fail needs root/namespace changes that would violate the host guard; mutants A–C cover the `ss`
  side, and the proc side shares the same `{unavailable:true, missing:[…]}` return path.
* Mutants E/F are a contrived environment (250 ms blocking `ss` per 100 ms tick). The resulting
  session stretch (~44 s) and the external endpoint are real observations, but they are not the
  production timing.
* The patch is a proposal: `claims.json.frozenDigests["scripts/playwright-firefox-egress-round39.mjs"]`
  would become `6a8d2a5e…` and a superseding pre-data freeze is required before dispatch. Control
  receipts (`round39-replay-v3`, selftest) remain valid as-is.
* No per-sample peer list is stored in receipts (only counts); the endpoint evidence above comes from
  the logging shim, not from a scored receipt.

## 9. Retained evidence (all relative to this report directory)

```
report.md                     this file
driver-proposed.mjs           proposed driver, sha256 6a8d2a5e…1923 (node --check OK)
driver-proposed.diff          unified diff vs frozen, applies with patch -p1
driver-frozen-copy.mjs        byte-identical frozen copy, sha256 1f8a15f0…545b
frozen-receipt.json           frozen driver, 2 runs, nonce 8e0bfb50…4ab8  (counter predicate true)
frozen-stdout.txt             frozen driver stdout
proposed3-receipt.json        proposed driver, 2 runs, nonce 19ecb10c…3924 (counter predicate true)
proposed3-stdout.txt          proposed driver stdout
proposed2-receipt.json        first proposal attempt, self-refused on teardown ordering (§5)
counter3-out.json             frozen counter output for proposed3 (predicate true, findings [])
mutantA-*.json|txt            pre-flight ss unavailability (refused, exact reason)
mutantB-*.json|txt            mid-session ss unavailability (refused, exact reason)
mutantC-*.json|txt            post-close final-sweep ss unavailability (refused, exact reason)
mutantD-*.json|txt            same mutant on frozen bytes → run1 refused:false (fail-open)
mutantE-*.json|txt            slow-ss frozen run: exit 0, egress 106, counter exit 1
mutantF-*.json|txt            slow-ss proposed run: exit 0, egress 130, counter exit 1
tree-probe.mjs|json           loopback owned-tree lifecycle probe (5 → 6 pids; survivors 0)
egress-probe-receipt.json     frozen driver, 1 run, logging ss (egress 48, refused false, exit 0)
egress-peer-summary.json      24 non-loopback rows → [2a04:4e42:3b::347]:443 (pid 2176993)
selftest-out.txt              frozen selftest: 7/7 cases passed, exit 0
bin-ssfail/ bin-ssflaky/ bin-sslow/ bin-sspostclose/ bin-sslog/   PATH shims used above
```

Scratch `/fast/scratch/hyaku/tabi-r40/ExecDriverBuild/` removed before yield. No writes outside this
report directory and that scratch; no tool installed; no production file modified.

VERDICT finding — the freeze-commit driver bytes run clean on this host (2 loopback runs, nonce-bound, identical first-shot `ebfae99c…cbf0`, 12/13 samples over 1103/1199 ms, counter predicate true) but are fail-open in three measured places — post-close final-sweep unavailability records `refused:false` (mutant D), nonzero observed egress never refuses (mutant E: `egress:106`, exit 0), and the owned pid set/coverage floor are never enforced by the driver (tree frozen at 5 pids while a 6th process exists; gate waits for 2 samples where the counter needs 8) — and the concrete fix (346-line diff, per-sample monotonic timestamps, per-tick owned-set refresh with start-time identity, unavailability-naming fail-closed ladder, `clearInterval` before close) was executed on a scratch copy where it satisfies the frozen counter (`predicate:true`, findings `[]`, 16/15 samples over 1499/1397 ms, tree 6→7, zero survivors, port closed) and refuses each injected surface failure with the exact surface named; adopting it requires a superseding pre-data freeze because the driver digest changes.
