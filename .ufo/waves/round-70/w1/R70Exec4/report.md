CONFIRMED

# R70Exec4 — Chromium singleton-socket path limit and the drivers' 240 s hang (reproduced, boundary measured)

Seat: R70Exec4, round 70 wave w1. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `90b9ff045542651fb59814fe32f73fee0d1d8243`, FREEZE `7c42ef25`.
Read-only w.r.t. production: instrument copies, receipts and raw transcripts live beside this report. No file under `scripts/` or `corpus/` was modified.
Host: Chromium 155.0.8059.84 (`/usr/bin/chromium`), Linux 7.2.11-arch1-1.

## Verdict in one line

The r70 control failure reproduces exactly: at `TMPDIR` = 63 bytes Chromium aborts 150 ms after launch with `FATAL … process_singleton_posix.cc:313] Socket path too long`, and both pinned CDP drivers then spend 241.9 s waiting for a page target that never appears; `verify-live-r70.mjs` refuses at its own 107-byte-model boundary with **no off-by-one** for symlink-free scratch paths, but its guard measures the lexical scratch path while the drivers may execute a `realpath`-derived `TMPDIR`, so it is one byte-relationship too strict when a symlink shortens the path and not a proof when a symlink lengthens it.

## 1. The exact threshold (Chromium, isolated variable)

Chromium creates its process-singleton socket at

```
$TMPDIR/org.chromium.Chromium.XXXXXX/SingletonSocket     (= TMPDIR + 45 bytes: 1 + 22 + 6 + 1 + 15)
```

Probe: `./probe-singleton-limit.mjs` pads `TMPDIR` to an exact byte length, holds HOME/XDG/user-data-dir at a fixed length, and launches the pinned drivers' argv (`--headless=new`, loopback CDP, fresh profile). Receipts: `probe-boundary-61-64.json` (each length three times), `probe-smoke.json`, `probe-longprofile.json`.

| TMPDIR bytes | socket path bytes | outcome | measured |
|---|---|---|---|
| 58 | 103 | OK | DevTools up in 201 ms, socket is a real AF_UNIX socket |
| 61 | 106 | OK (3/3) | DevTools up in 144–169 ms |
| 62 | 107 | OK (3/3) | DevTools up in 165–173 ms |
| 63 | 108 | **FATAL** (3/3) | SIGABRT 150 ms after spawn |
| 64 | 109 | **FATAL** (3/3) | SIGABRT 156 ms after spawn |

Fatal stderr (verbatim, `probe-boundary-61-64.json`):

```
[2810152:2810152:1106/173738.266922:FATAL:chrome/browser/process_singleton_posix.cc:313] Socket path too long: /fast/scratch/hyaku/tabi-r70/R70Exec4/probe/xxxxxxxxxxxxxxxxxxx/org.chromium.Chromium.HjhLrH/SingletonSocket.
```

So the accepted maximum is **socket path ≤ 107 bytes, i.e. TMPDIR ≤ 62 bytes**; 108 is fatal. Repeats are stable (3/3 at each of 61/62/63/64).

The 107-byte limit applies to the **TMPDIR-derived** socket only. The `SingletonSocket` that appears in the profile directory is a *symlink* to it (`socketKinds` in the receipts: `isSymlink:true, isSocket:false`) and its own path length is not checked: at TMPDIR 62 with a 180-byte profile-dir name the launch still succeeds (`probe-longprofile.json`, socket 107 OK), and at TMPDIR 63 the same profile length does not change the FATAL.

## 2. Driver threshold and time-to-failure

Both pinned drivers set `TMPDIR` to their `--scratch` value (`chrome-cdp-synthtap-round70.mjs:108`, `chrome-cdp-synthscroll-round69.mjs:131`) and put `profile-<12 hex>` / `home-<12 hex>` under it. **Their scratch layouts do not differ** — the wave premise says they do; measured, both are identical, so the threshold is the same byte value for both drivers: `--scratch` ≤ 62 passes, ≥ 63 fails.

The failure is not fast in the driver: the page-target poll is `for (let i = 0; i < 1600 …) … await sleep(150)` (`chrome-cdp-synthtap-round70.mjs:260-264`, `chrome-cdp-synthscroll-round69.mjs:277-281`) = 240 s, and the loop has **no child-exit listener** (it only checks `launchError`, the spawn error), so a Chromium that died at 150 ms is polled for the full 240 s.

| run | scratch bytes | exit | predicate | receipt wall | failure |
|---|---|---|---|---|---|
| r70 tap, `driver-tap-at62.json` | 62 | 0 | true | 10.409 s (`startedAt`→`finishedAt`) | none, 8 legs |
| r69 scroll, `driver-scroll-at62.json` | 62 | 0 | true | **10 s wall** (`driver-scroll-at62-rerun.json`, 5 legs) | none |
| r70 tap, `driver-tap-at63.json` | 63 | 1 | false | **241.939 s** | `drive-error` / `no loopback page target` |
| r69 scroll, `driver-scroll-at63.json` | 63 | 1 | false | **244 s wall** (`driver-scroll-at63-rerun.json`, external timing incl. ~2 s node start + teardown) | `drive-error` / `no loopback page target` |

Both failing receipts carry Chromium's FATAL in `host.stderrHead`, e.g. `driver-tap-at63.json`:

```
[…:FATAL:chrome/browser/process_singleton_posix.cc:313] Socket path too long: /fast/scratch/hyaku/tabi-r70/R70Exec4/d63-aaaaaaaaaaaaaaaaaaaaa/org.chromium.Chromium.EZIuET/SingletonSocket.
```

Time-to-failure decomposition: Chromium aborts at ~0.15 s; the remaining ~241.8 s is the driver's 1600 × 150 ms page-target poll plus ~1.5 s teardown — the driver never inspects the child's exit, so the FATAL in its own `stderrHead` is ignored.

## 3. `verify-live-r70.mjs` guard: exact at the boundary, off-by-one absent, path-canonicalisation blind spots

The guard (`scripts/verify-live-r70.mjs:132-133`):

```js
const sockLen = Buffer.byteLength(path.join(scratch, 'run-a', 'work', 'org.chromium.Chromium.XXXXXX', 'SingletonSocket'));
if (sockLen > 107) { out.findings.push('scratch-path-too-long'); … return finish(2); }
```

That expression is `byteLength(scratch) + 56`; the run TMPDIR is `scratch + 11` (`/run-a/work`), so the real socket is `scratch + 11 + 45 = scratch + 56`. The model is the measured Chromium model exactly (6 mkdtemp characters, `SingletonSocket`, 45-byte delta — all confirmed in §1).

Measured at the boundary (symlink-free scratch, receipts `raw/receipts-v51tap.out`, `raw/receipts-v51scroll.out`, `raw/receipts-v-toostrict.*`):

| scratch bytes | guard sockLen | guard | full live verifier |
|---|---|---|---|
| 51 | 107 | allowed | **exit 0**, predicate true — r70 profile 26 s, r69 profile 21 s (two cold runs, counter, agreement) |
| 52 | 108 | **exit 2**, `scratch-path-too-long` (`108 > 107 bytes`) | not reached |

So for symlink-free paths the guard is **exact**: the allow/refuse edge sits precisely at the measured Chromium limit; no off-by-one in either direction, and the allow side is not merely tolerated — a 51-byte scratch completes the full two-run live predicate.

Two path-canonicalisation findings on the same guard, both measured:

* **Too strict (verified).** `--scratch` = a 60-byte symlink (`…/sy2-cccc…`) whose realpath is 43 bytes is refused (`usage: --scratch too long for Chromium's singleton socket (116 > 107 bytes)`, exit 2, `raw/receipts-v-toostrict.json`), yet the pinned driver run on that same `--scratch` succeeds (`driver-tap-symlink-60.json`: predicate true, 8 legs, 10.3 s). The guard refuses a workable scratch because it measures `path.resolve` (lexical) while Chromium is handed the realpath.
* **Not a proof (verified).** `--scratch` = a 44-byte symlink (`…/sy-ccc`) whose realpath is 83 bytes passes the guard (100 ≤ 107) but cannot work. What happens next is not the socket FATAL: with the scratch's `run-a/work` absent, `validateScratch` realpaths *before* `mkdir` (`chrome-cdp-synthtap-round70.mjs:46-49`), keeps the lexical path, creates it, and `validateProfile` then compares a lexical child against the now-real parent and throws — uncaught — `PathError: profile escapes scratch` at `chrome-cdp-synthtap-round70.mjs:60` (from `:98`), exit 1 in ~51 ms with no receipt (`raw/receipts-vlax2.out`: `run-a-failed`, `run-b-failed`, `cross-run-unmeasurable`, `evidence-unmeasurable`). When `<scratch>/run-a/work` already exists, the driver keeps the real 94-byte `TMPDIR` (socket would be 139) and the same scratch degenerates into the §1 FATAL + §2 240 s wait: `receipt-symlink-existing-work-interrupted.json` shows `--user-data-dir=…/real-zzz…/run-a/work/profile-…` (so TMPDIR was the realpath) and the run was still polling with no DevTools at 60 s, when SIGTERM interrupted it; by §1 any TMPDIR ≥ 63 is fatal, so the FATAL is the only consistent cause (the receipt's own `stderrHead` is unset because the signal handler writes it before that field is filled).

Conclusion on the window: exact on the byte arithmetic (`>107`, 6-character mkdtemp suffix, fixed `/run-a/work` layout); the constant `56` is a duplicated literal of the verifier's own run layout, so any change to `run-<a|b>/work` or to the driver's TMPDIR derivation silently invalidates it; and any symlinked component of `--scratch` breaks the equality between the measured path and the path Chromium uses.

## 4. Operability notes

* Only the verifier has a guard (`verify-live-r70.mjs:132-133`). The drivers accept any `--scratch` (`chrome-cdp-synthtap-round70.mjs:68-70`, `chrome-cdp-synthscroll-round69.mjs:91-93`) and burn ~242 s each on a scratch ≥ 63 bytes. `chrome-cdp-synthtap-round70.mjs --scratch <63-byte dir>` reproduces this directly.
* The 240 s is deterministic, not a hang of the host: the poll count and interval are frozen constants and there is no `exit` handler on the child, so the driver cannot fail fast even though the FATAL text is already in its own `stderrHead`.
* Two live verifier runs on a scratch whose real path overflows cost ~484 s (2 × 242 s) plus overhead, all of it recoverable at zero cost by the existing length check.
* Calibration note, not a finding: the lane's earlier `TMPDIR length <= 40` heuristic (rounds 32/33) is ~22 bytes stricter than the measured 62-byte limit; nothing in the r69/r70 path depends on it.

## Reproduction

```bash
# 1. exact Chromium threshold, 3 repeats per length (~20 s)
node .ufo/waves/round-70/w1/R70Exec4/probe-singleton-limit.mjs \
  --scratch /fast/scratch/hyaku/tabi-r70/R70Exec4/probe \
  --lengths 61,62,63,64,61,62,63,64,61,62,63,64 --json probe-boundary-61-64.json

# 2. driver failure at 63-byte scratch (exit 1 after ~242 s, receipt has the FATAL)
S=/fast/scratch/hyaku/tabi-r70/R70Exec4/d63-aaaaaaaaaaaaaaaaaaaaa
node scripts/chrome-cdp-synthtap-round70.mjs --scratch "$S" --out /tmp/r.json \
  --nonce tabi-r70-exec4-at63 --http-port 41505 --cdp-port 41506

# 3. guard boundary (exit 2 / exit 0)
node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch /fast/scratch/hyaku/tabi-r70/R70Exec4/v52-aaaaaaaaaa --no-run   # exit 2
node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch /fast/scratch/hyaku/tabi-r70/R70Exec4/v51-aaaaaaaab --json      # exit 0
```

(`/tmp` above is only the driver's own `--out` target in the snippet; all executed runs in this seat wrote under the wave dir or `/fast/scratch/hyaku/tabi-r70/R70Exec4/`.)

## Evidence index (this directory)

* `probe-singleton-limit.mjs` — probe instrument (argv pinned to the drivers' launch argv).
* `probe-boundary-61-64.json` — 12 launches, boundary 61–64 ×3.
* `probe-smoke.json`, `probe-longprofile.json` — early scans / profile-path independence.
* `driver-tap-at62.json`, `driver-scroll-at62.json` — pass side of both drivers.
* `driver-tap-at63.json`, `driver-scroll-at63.json` (+ `driver-scroll-at63-rerun.json`) — fail side, FATAL in `host.stderrHead`, 241.9–244 s.
* `driver-scroll-at62-rerun.json` — r69 pass side, 10 s wall, 5 legs.
* `driver-tap-symlink-60.json` — driver passes a 60-byte-symlink scratch whose realpath is 43 bytes.
* `receipt-symlink-existing-work-interrupted.json` — real 94-byte TMPDIR from a symlinked scratch.
* `raw/receipts-v51tap.out`, `raw/receipts-v51scroll.out` — full live verifier predicate true at scratch = 51 (socket 107).
* `raw/receipts-v-toostrict.json|.err` — guard refusal of a workable 60-byte symlink scratch.
* `raw/receipts-vlax2.out|.err` — guard acceptance of a non-workable symlink scratch, then `run-a-failed`.
* `raw/receipts-timings.txt`, `raw/receipts-boundary.out`, `raw/receipts-*.out|.err` — batch transcripts.

Scratch `/fast/scratch/hyaku/tabi-r70/R70Exec4/` was removed after the receipts above were copied here.
