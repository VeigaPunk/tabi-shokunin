HOLDS

# R71Exec4 — host-robustness probe: r70 routed defect R4 on the pinch driver

Seat: R71Exec4 (leaf executor). Lane `tabi-shokunin`, round 71 w1. Read-only on lane files; all
drivers/verifiers were copied to scratch and only the copies were mutated. No git/jj mutation.
Host: Chromium 155.0.8059.84 (`/usr/bin/chromium`), node v24.21.0, Linux 7.2.11-arch1-1.
Scratch `/fast/scratch/hyaku/tabi-r71/R71Exec4` (deleted before yield; receipts copied here).

Verdict: the pinch driver's two r70-R4 repairs hold. The singleton-socket guard refuses with
exit 2 before any child exists, at exactly the byte where real Chromium aborts, and it resolves
symlinks through realpath in both directions. The `child.on('exit')` listener fires 13 ms after
launch and ends the run in 0.87 s (receipt clock) where the same driver without the listener takes
61.1 s and the r70 tap driver takes 242.1 s.

## 1. Guard refusal (unmodified lane driver)

`scripts/chrome-cdp-synthpinch-round71.mjs:56-59` computes
`byteLength(realpath(scratch) + '/org.chromium.Chromium.XXXXXX/SingletonSocket')` and refuses when
it exceeds 107. `:77` calls `validateScratch` before `:258` spawns the child.

Scratch realpath 63 bytes (modeled socket 108), fully valid args
(`--nonce tabi-r71-refuse --http-port 41100 --cdp-port 41101`):

```
{"schema":"tabi-chrome-cdp-synthpinch-r71","error":"usage","detail":"--scratch too long for Chromium's singleton socket (108 > 107 bytes)"}
exit=2  wall=0.034 s
```

After the refusal the scratch held 0 entries (no `fixture.html`, no `profile-*`, no `home-*`), the
`--out` receipt was not created, and `ps -eo pid,args` matched no process referencing the scratch.
A second refusal at a 74-byte scratch gave the same shape (exit 2, 0.061 s, `119 > 107 bytes`).
Receipt: `R71Exec4/refuse-l63-exact.txt`.

## 2. Exact threshold by bisection

Sentinel method: a syntactically invalid `--nonce` makes the driver exit 2 with the nonce detail
iff the scratch guard accepted the path; the scratch detail wins when it refuses. No Chromium is
launched by either outcome. Bisection over realpath byte length (invariant: L=50 accepted,
L=80 refused), `R71Exec4/probe-guard.mjs`, raw `R71Exec4/guard-probe.json`:

| realpath bytes | modeled socket bytes | exit | outcome |
|---|---|---|---|
| 50 | 95 | 2 | accepted (nonce detail) |
| 57 | 102 | 2 | accepted |
| 61 | 106 | 2 | accepted |
| **62** | **107** | 2 | **accepted** |
| **63** | **108** | 2 | **refused** (`108 > 107 bytes`) |
| 65 | 110 | 2 | refused |
| 80 | 125 | 2 | refused |

Threshold: `byteLength(realpath(scratch)) <= 62` accepted, `>= 63` refused; equivalently the
modeled socket must be `<= 107` bytes. The guard's `> 107` comparison is the exact complement.

Calibration against real Chromium at the same boundary (real `/usr/bin/chromium`, short
`--user-data-dir`, TMPDIR set to the measured path, `timeout -k 2 5`):

| TMPDIR bytes | modeled socket | observed |
|---|---|---|
| 61 | 106 | `DevTools listening on ws://127.0.0.1:…` (exit 124 = timeout kill) |
| 62 | 107 | `DevTools listening on ws://127.0.0.1:…` (exit 124) |
| 63 | 108 | `FATAL:chrome/browser/process_singleton_posix.cc:313] Socket path too long: /fast/scratch/hyaku/tabi-r71/R71Exec4/calib/t63/ddddddddddddddd/org.chromium.Chromium.GtGTJm/SingletonSocket.` exit 134 |

So the guard's constant is not merely safe, it is exact: 107 launches, 108 aborts, and the FATAL
names the same `<TMPDIR>/org.chromium.Chromium.XXXXXX/SingletonSocket` shape the guard models.
Logs: `R71Exec4/out-exact-62.log`, `R71Exec4/out-exact-63.log`.

## 3. Symlinked scratch: realpath-based guarding holds

`validateScratch` returns `realNorm(given)` (`:43`, `:48-61`) and `:112` sets `TMPDIR: scratchDir`, so the
guard and the child see the same resolved path. Probes (`guard-probe.json`):

| case | literal path bytes | literal socket | realpath socket | exit | outcome |
|---|---|---|---|---|---|
| short link → long target | 52 | 97 | 115 | 2 | refused (`115 > 107`) |
| long link → short target | 102 | 147 | 87 | 2 | accepted (nonce detail) |
| link → link → long target | — | — | 115 | 2 | refused |

The accepted long-literal case was then run with the wrapper copy: the receipt's
`host.argv` carries `--user-data-dir=/fast/scratch/hyaku/tabi-r71/R71Exec4/x/dd/profile-6803c3525c26`,
i.e. the real target, not the 102-byte link. The guard's model and the child's TMPDIR cannot
disagree through a symlink. Receipt: `R71Exec4/lf-symlink.json`.

## 4. Launch failure the guard cannot see

Fault: the driver copies' `chromiumArg` points at `wrap/chromium-wrapper.sh`, which answers
`--version` with `Chromium 155.0.8059.84` and exit 0, then prints
`FATAL:simulated_launch_failure: wrapper refuses to start the browser` to stderr and exits 1.
Copies differ from the lane bytes only in that one constant; the control copy additionally drops
`child.on('exit')` at `:261` (`copy-diffs.patch`, hashes in `launchfail-summary.json`).

| case | wall | receipt elapsed | exit | `host.childExit` | `failures[]` |
|---|---|---|---|---|---|
| pinch copy, listener present (scratch 62 B, socket 107) | 3.00 s | 0.867 s | 1 | `{code:1, signal:null}` at **+13 ms** | `drive-error: chromium exited during the run: code 1 signal null` |
| pinch copy, listener removed (control) | 63.21 s | 61.094 s | 1 | `null` (never set) | `drive-error: no loopback page target` |
| r70 tap driver copy | 244.31 s | 242.148 s | 1 | field absent | `drive-error: no loopback page target` |

The pinch driver's listener (`:261`) is the only writer of `host.childExit` (initialised `null` at
`:215`), so the non-null value with a 13 ms latency is direct evidence that it fired. The loop at
`:266-267` checks `launchError` each 150 ms iteration, so the exit is observed on the next pass.
Without the listener the same code path burns the full 400 x 150 ms budget (61.1 s); the r70 tap
driver burns 1600 x 150 ms (`chrome-cdp-synthtap-round70.mjs:260-261`) and has no exit listener at
all (`:254` is the only `child.on`). Ratio on the receipt clock: 242.148 / 0.867 = **279x**;
wall clock 244.31 / 3.00 = 81x. All three runs ended with a clean teardown
(`postKillSweepCount 0`, survivors `[]`, both ports `closed`, curl exit 7).

## 5. R4 status

- Pinch driver: **fixed**. Guard refuses before launch at the exact Chromium byte limit; the
  child-exit listener turns a launch failure into a 0.87 s red receipt with an explicit
  `chromium exited during the run: code 1 signal null` finding instead of a 4-minute wait.
- r70 tap driver: **still open**, as routed. No socket guard (`validateScratch` at
  `chrome-cdp-synthtap-round70.mjs:46-53`), no `child.on('exit')`; the same fault costs 242 s and
  reports the misleading `no loopback page target`.
- The r70 R4 note "verifier guard is exact only for symlink-free paths" does not carry over to
  this driver's guard: it is realpath-based and held in both symlink directions.

## 6. Limits and disclosures

- The injected fault is a stand-in process, not Chromium itself. The listener observes any child
  exit, so the mechanism generalises; a real Chromium launch abort at the same threshold was
  observed separately (section 2, exit 134) but not through the driver.
- Wall times include host load (the fleet was running dozens of agents); the receipt-internal
  `startedAt`→`finishedAt` figures are the comparable ones.
- One setup error, disclosed: the first pinch fault run was pointed at a 74-byte scratch instead
  of the 62-byte boundary dir, so the guard refused it (exit 2, 46 ms, no receipt). The corrected
  run is the `pinch-copy` row above; the bad attempt is recorded in `launchfail-summary.json`
  under `firstAttempt`.
- No lane, control, corpus or sibling file was modified. No tool was installed or upgraded.
- The guard models the TMPDIR socket; the driver also passes `--user-data-dir`, whose socket is
  `scratch + 37` bytes, shorter than the modeled `scratch + 45`, so the TMPDIR socket is the
  binding constraint — consistent with the observed FATAL naming the TMPDIR path.

## 7. Reproduction

```
# refusal (unmodified lane driver)
D63=/fast/scratch/hyaku/tabi-r71/R71Exec4/bisect/b63/dddddddddddddd
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round71.mjs \
  --scratch "$D63" --out /fast/scratch/hyaku/tabi-r71/R71Exec4/out/refuse.json \
  --nonce tabi-r71-refuse --http-port 41100 --cdp-port 41101     # exit 2, socket 108 > 107

# bisection + symlinks
cd /fast/scratch/hyaku/tabi-r71/R71Exec4 && node probe-guard.mjs

# launch-failure timing (copies; wrapper answers --version, fails the launch)
cd /fast/scratch/hyaku/tabi-r71/R71Exec4 && node probe-launchfail.mjs
```

## 8. Artifacts (this directory)

`guard-probe.json` (bisection + symlink raw), `refuse-l63-exact.txt`, `out-exact-62.log`,
`out-exact-63.log`, `lf-pinch-copy.json` (+ `.stdout`), `lf-pinch-nolistener-control.json`,
`lf-tap-r70-copy.json`, `lf-symlink.json`, `launchfail-probe.json`, `launchfail-summary.json`,
`copy-diffs.patch`, `probe-guard.mjs`, `probe-launchfail.mjs`, `chromium-wrapper.sh`,
`drivers/` (the three copies that ran: `pinch.mjs` `c52c3133…`, `tap.mjs` `20873738…`,
`pinch-nolistener.mjs` `48ea87f9…`).
