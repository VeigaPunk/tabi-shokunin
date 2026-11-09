# R95Sentinel — setup controls and trust boundary, claim C1 (round 95, wave w1)

Seat: R95Sentinel (leaf, no subagents, no commits, no git/jj mutation). Lane read-only.
Ports used: 32051,32052,32053 (triples A and forgery) and 32054,32055,32056 (baseline). Scratch:
/fast/scratch/hyaku/tabi-r95/R95Sentinel (removed before yield; every cited artifact copied below).
Tools installed or upgraded: none. Host: Chromium 155.0.8059.84 (`/usr/bin/chromium`), node v24.21.0.

## 0. Instrument pins (verified first)

    $ sha256sum scripts/chrome-cdp-backendnode-misdelivery-round95.mjs \
        scripts/check-backendnode-misdelivery-round95.mjs scripts/negatives-backendnode-misdelivery-round95.mjs
    24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82  driver      (= pin)
    b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775  counter     (= pin)
    1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0  battery     (= pin)

All three match the bytes pinned in `claims.json` and the task. Counter `--expect-driver-sha256` used throughout.

## 1. Setup controls (a)-(e) — reproduced, all rc 2 `setup`, 0 chromium left

Commands run from my scratch; `rc` lines in `R95Sentinel-controls.json` (`rc_lines`).

| control | command (abridged) | rc | verdict / evidence | chromium left |
|---|---|---|---|---|
| (a) busy port | counter `--live --ports 32051,32052,32053` with 32051 held by a python listener | 2 | `setup`; driverRun.status 2, driver stderr `free-port precheck: port 32051 busy` | 0 |
| (b) counter SIGTERM 8 s in | `kill -TERM` the counter | 2 | `setup`, `driverRun.interruptedBy: "SIGTERM"`, `orphansSwept 0` | 0 |
| (c) driver SIGKILL 8 s in | `pkill -KILL -f "chrome-cdp-…round95.mjs --lane <L> --scratch <S>/kill/driver"` | 2 | `setup`, `driverRun.signal: "SIGKILL"`, `orphansSwept 14` (counter sweep) | 0 |
| (d) receipt path is a directory | counter `--receipt <dir>` | 2 | `setup`, "receipt path is not a regular file" | n/a |
| (e) TMPDIR 131 bytes | counter `--live --reps 1` with `TMPDIR` of 131 bytes | 2 | `setup`, driver exit 3 ("chromium never answered its DevTools endpoint"), launchFailures 6 | 0 |

Exit codes: `node check-…round95.mjs … ; echo rc=$?` → 2 for each. Outputs: `R95Sentinel-controls.json`.

Extra setup case, not in the frozen control table — **contract breach**:

| control | command | observed | expected (counter header: `1: findings; 2: usage/setup refusal`) |
|---|---|---|---|
| (f) unwritable scratch | `chmod 555 ro-scratch`; counter `--live --scratch <ro-scratch>` | **rc 1**, no JSON on stdout, Node stack `EACCES: permission denied, mkdtemp '…/ro-scratch/receipt-XXXXXX'` | rc 2 `setup` |

The throw is raised by the counter's own `fs.mkdtempSync` at the top of `--live`, before the driver spawns; no chromium was started, so nothing leaked. The defect is operability: a host-resource setup failure exits with the findings code, and nothing machine-readable is written. The same class is reachable from code reading (not run): any other uncaught throw in the `--live` path (e.g. `mkdirSync(scratch)` failing) exits 1 the same way.

## 2. Baseline reproduction (no forger)

    $ node scripts/check-…round95.mjs --lane <L> --expect-driver-sha256 <pin> --live --scratch <S>/baseline --ports 32054,32055,32056 --json; echo rc=$?
    rc=0  verdict clean  checkCount 336  findings 0  driverRun.status 0  legs 18  failures 0  launchFailures 0
    branches: misdelivery [P286-2]; collision [P286-1, P287-1, P288-1, P289-1, P287-2, P288-2, P289-2, P286-3, P287-3, P288-3, P289-3]; miss [Z-1, Z-2, Z-3]
    leftover chromium on 32056: 0

A live run of the pinned driver on this host reproduces 336 checks and 0 findings. The branch split (1 misdelivery, 11 collision, 3 miss) differs from the scored run only by jitter in which P leg misdelivers, which the frozen limit 3 says is not claimed.

Re-derivation of the scored record (receipt mode, no chromium):

    $ node scripts/check-…round95.mjs --lane <L> --expect-driver-sha256 <pin> \
        --receipt corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json \
        --expect-nonce tabi-r95-live-36ad06703d0b --reps 3 --json; echo rc=$?
    rc=0  verdict clean  checkCount 336  findings 0  receiptSha256 e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404
    branches: misdelivery [P286-1]; collision 11 P legs; miss [Z-1, Z-2, Z-3]

This matches `.ufo/waves/round-95/scored/c1-live.json` (336, 0 findings, same branch sets, same receipt sha256). Evidence: `R95Sentinel-rederive-scored-receipt.json`, `R95Sentinel-baseline-live.json`.

## 3. Trust boundary — F1 narrowing

### 3a. Can a same-UID non-ancestor read the nonce and the receipt path? YES.

`R95Sentinel-proc-exposure.json`: a sibling process (not an ancestor of the target) running as the same UID reads the target's `/proc/<pid>/environ` (contains `TABI_R95_NONCE`) and `/proc/<pid>/cmdline` (contains `--out <receipt path>`). `/proc/sys/kernel/yama/ptrace_scope` = 1, and reads of `environ`/`cmdline` are permitted anyway: Yama restricts PTRACE_ATTACH, not PTRACE_MODE_READ of a dumpable same-UID process. The `/proc` mount is `rw,nosuid,nodev,noexec`, no `hidepid`. So F1's "a same-UID writer can still read `/proc/<pid>/environ`" is confirmed, and the narrowing from `argv` to `environ` removes the nonce from `ps` output but not from a same-UID reader.

### 3b. Does the forgery succeed? YES, both variants (harmless, under my scratch only).

`forger.py` (source in `R95Sentinel-harness-sources.json`) scans `/proc` for a `--live` driver whose argv carries MY scratch path, reads the nonce from `environ` and the receipt path from `cmdline`, then writes a whole receipt: the lane's committed scored receipt with only `nonce` replaced by the live one, and a `forgedBy` marker. It never signals a process and writes only under my scratch.

- **Variant A (deterministic pre-write, mode 0444):** the driver's own final `writeFileSync` fails `EACCES` (driverRun.status **1**, stderr `EACCES … live-receipt-….json`). The counter does not refuse on driver status 1, reads the forged bytes, and prints:
  `verdict clean, checkCount 336, findings 0, receiptSha256 0e769f3a…`
  Evidence: `R95Sentinel-forgery-A-counter.json`, `R95Sentinel-forgery-A-forger.json`, `R95Sentinel-forged-receipt-A.json`. The forged receipt's `ports` is `{http 31991, child 31992, cdp 31993}` while the counter was given `--ports 32051,32052,32053`; the counter still returns clean (see 3d).

- **Variant B (race, overwrite after the genuine write):** the driver writes its genuine receipt (sha `a13a77b2…`, driverRun.status **0**, stdout `legs:18, failures:0`), then the forger overwrites it before the counter reads it. The counter reads the forged bytes (sha `6640258e…`) and prints `verdict clean, checkCount 336, findings 0`, with `driverRun.status 0` and the driver's own stdout intact.
  Evidence: `R95Sentinel-forgery-B-counter.json`, `R95Sentinel-forgery-B-forger.json`, `R95Sentinel-forged-receipt-B.json`. Variant B is the one that matters for the scored run: its output is indistinguishable from a genuine run.

Both forged runs: `forger_rc=0 counter_rc=0`, 0 chromium left under my scratch or ports.

### 3c. Does a forgery make a false claim read clean on the scored run? Not retroactively, and the scored artifacts cannot rule it out.

- A forgery cannot change `corpus/evidence/round95/…/receipt.json` (sha `e5d13b76…`) or `scored/c1-live.json`. Nothing I ran touched them.
- Whether the scored receipt was produced by the pinned driver during the scored run is not verifiable from its bytes. Its `driverRun` block (status 0, stdout `legs 18`) is written by the driver and is exactly what variant B leaves intact. So the scored verdict's provenance rests on the process that ran it, not on the counter. I found no evidence of substitution; I also cannot exclude it.
- The forged receipts reproduce the scored run's leg outcomes verbatim, so the leg-level statements read clean as statements about the scored run's receipt. They are not statements about any run that actually happened on this host during the forgery.

### 3d. Binding gaps in the `--live` counter (each shown by the forgery, not by a genuine run)

1. **Ports are not bound to the run.** The counter passes `--ports` to the driver and checks the receipt's child/parent URLs against `receipt.ports`, but never checks `receipt.ports` against the `--ports` it was given (grep: `opt('ports')` at line 94 vs `receipt.ports` at 183-212). The variant A forged receipt has ports 31991-31993 under `--ports 32051-32053` and is clean.
2. **Driver exit status is ignored when a receipt exists.** `driverRun.status 1` (uncaught driver exception, the EACCES case) passes through to the receipt checks. In a genuine run a status-1 receipt always has `failures`, so this only matters under substitution.
3. **Nonce and path are not secret from same-UID processes.** The nonce is a 48-bit random value in `environ`, and the receipt path is in `cmdline`. The receipt directory is `mkdtemp` (0700), which does not stop a same-UID writer.

## 4. Verdict on the frozen wording

The frozen claim (§Claim, "exits 0 iff every leg…") and §Declared limit 6 describe the `--live` counting command as the one that defeats a receipt-only forgery: limit 6 says "a forger who writes a whole consistent receipt passes that mode [--receipt]", and the counter header says "that is why the claim's counting command is --live". The committed `--live` instrument does not enforce that. It accepts any receipt whose nonce it generated and whose pin is right, and it does not check that the pinned driver produced that receipt for this run (3b, 3d). Limit 6 is scoped to `--receipt`; the plan's F1 record item says "limit 6 stands", but limit 6 as frozen does not name `--live`. So the committed instrument enforces a narrower property than the frozen sentence states. No leg-level statement of a genuine driver run is false (the 336 baseline and the scored re-derivation are clean), so this is wording, not a number or a leg falsification. Within r95, frozen amendments are not available (`frozenAmendments: []`); the honest options are to state in the r95 report that the `--live` verdict is a receipt-provenance claim bounded by same-UID substitution, or to narrow the claim in a later round.

## 5. Smallest remediations (for the next round; none applied here, lane read-only)

- Bind receipt to run: `--live` checks `receipt.ports` deep-equals the `--ports` it passed.
- Wrap the `--live` path in a try/catch that emits `verdict: setup` and exits 2 for any throw before the verdict is printed (fixes (f)).
- Treat `driverRun.status` not in {0, 1-with-failures} as setup or findings explicitly.
- Add a counter-side or driver-side check that cannot be forged by a same-UID reader (none exists with environment or argv secrets; an honest statement of the boundary is the cheap fix).

## 6. Artifacts (all under .ufo/waves/round-95/w1/)

- `R95Sentinel-controls.json` — setup controls (a)-(f), rc lines, verdicts.
- `R95Sentinel-baseline-live.json` — clean live run on ports 32054-32056 (336 / 0).
- `R95Sentinel-rederive-scored-receipt.json` — receipt-mode re-derivation of the scored receipt (336 / 0).
- `R95Sentinel-forgery-A-counter.json`, `R95Sentinel-forgery-A-forger.json`, `R95Sentinel-forged-receipt-A.json` — variant A.
- `R95Sentinel-forgery-B-counter.json`, `R95Sentinel-forgery-B-forger.json`, `R95Sentinel-forged-receipt-B.json` — variant B.
- `R95Sentinel-proc-exposure.json` — same-UID non-ancestor environ/cmdline read.
- `R95Sentinel-harness-sources.json` — forger, probe and run script sources, with sha256.

Teardown: scratch `/fast/scratch/hyaku/tabi-r95/R95Sentinel` removed after copying; `pgrep` for `remote-debugging-port=3205[1-6]` → 0; no background jobs left; no lane file touched.

VERDICT C1: falsifies-wording
