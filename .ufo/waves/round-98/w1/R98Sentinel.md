# R98Sentinel — trust boundary: launch mode and confinement (tabi round 98, C1)

Seat: `R98Sentinel` (leaf; no dispatch, no commits, no git/jj mutation of the lane).
Scope: (a) mode laundering, (b) confinement of a real `--live` run, (c) what a clean `--live` verdict binds.
Verdict: **neutral** — no leg-level statement of the predicate is false on a `--live` run of the pinned
driver with the pinned libraries, and no re-derived count differs. The laundering experiments are
already-covered ground (declared limit 2) and, read precisely, they *confirm* the claim's own wording.

## Tooling (recorded per the operator directive)

- `npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` — npm registry, into
  `/fast/scratch/hyaku/tabi-r98/R98Sentinel/deps` (26 packages, 417 ms). No pacman transaction was
  needed and none was attempted (all pacman transactions are paused host-wide). Node v24.21.0,
  Chromium 155.0.8059.84 (Arch Linux, `/usr/bin/chromium`).
- I re-derived the deps tree hashes myself (same definition as the counter): puppeteer-core
  927 files / `968a85e8…d1e180`, playwright-core 116 files / `24584693…f5cd641`, and both
  `package-lock.json` integrity strings — byte-identical to the frozen pin in `claims.json`.

## (a) Mode laundering — which checks fire

Scratch lane `/fast/scratch/hyaku/tabi-r98/R98Sentinel/lane` holds a copy of the frozen driver whose
PUA/PLA/PLAB legs attach to a **runner-started** browser instead of launching one, keeping the recorded
`mode` field `'launch'`; the **frozen** counter (`scripts/check-client-oopif-uploadmodes-round98.mjs`,
sha256 `e55581ea…d3c5a`, byte-identical copy) was run `--live` against it with **the copy's own sha**
as `--expect-driver-sha256`. Ports 33671/33672/33673. Diff: `R98Sentinel-launder.diff`.

| variant | what the copy does | rc | verdict | findings |
|---|---|---|---|---|
| v0-control | unmodified in behaviour (launder flag off) | 0 | clean | 0 (256 checks) |
| v1-pw-remote | Playwright arms attach via `connectOverCDP(url)`, `isLocal` **absent** (remote) | **1** | findings | **3**: `child-events` on PLA-1, PLA-2, PLA-3 |
| v2-pw-islocal | Playwright arms attach via `connectOverCDP(url,{isLocal:true})` | **0** | **clean** | 0 (256 checks) |

- **v1** fires only `child-events` (`[["input",false],["change",false]]` vs expected `true/true`): a
  remote (non-collocated) attach converts the local path to a payload, so the events go untrusted.
  The counter detects the *semantic* change — never the recorded mode field.
- **v2** is clean: with `isLocal:true` the browser is treated as collocated, the path stays a path, and
  every recorded outcome is identical to the launched run. Nothing fires.
- **Proof run** (`lane2`, extra receipt field `ACTUAL_process_model`): rc 0, clean, 0 findings, 256
  checks, while the receipt shows **all 24 legs were `runner_started_client_attached`** and 9 of them
  recorded `mode:'launch'`. The counter cannot see the difference.
- **Fabricated browser ids** (`lane4`, every `browserId` replaced by `randomUUID()`): rc 0, clean, 0
  findings — the `fresh-browser` check reads the recorded id string only, so "each leg gets its own
  browser" is a driver-pin fact too.
- With the **frozen** pin the laundered copy is rejected before it runs: rc 1, finding `driver-pin`,
  `driver not run`.

**Precisely what the counter binds beyond the driver pin:** only the *recorded receipt fields* and the
*observed outcomes*. `mode`, `isLocal`, `browserId` (hence "each leg gets its own browser") are
driver-authored strings; the counter compares them against a constant table and never inspects the
process tree. This is exactly what declared limit 2 already says ("'launch' vs 'connect' is a
driver-pin fact: the counter sees the recorded `mode` field, the per-leg browser id and the outcomes,
not the process tree") and what the predicate's "Driver-pin facts … the counter enforces only their
recorded consequences" says. **No wording gap; the laundering confirms limit 2 rather than falsifying
it.**

## (b) Confinement of a real `--live` run

Real run of the frozen counting command (ports 33674/33675/33676, scratch `…/R98Sentinel/a`):
**rc 0, verdict clean, 0 findings, 256 checks, 24 legs** — artifact `R98Sentinel-reallive-counter.json`.

- **Profiles: all under `--scratch`.** 24 distinct `--user-data-dir` values, every one under
  `…/a/driver/`: 18 × `leg-*/profile` (runner-started legs + the Puppeteer launch `userDataDir`) and
  6 × `t/playwright_chromiumdev_profile-*` (the Playwright launch profile, created under the driver's
  `TMPDIR=<scratch>/t`). Sampled at 1 Hz over the whole run (`R98Sentinel-reallive-ps-samples.txt`):
  165 distinct chromium pids, all carrying a `--user-data-dir` under the scratch.
- **Chromium left after the run: 0** (both `pgrep -f "remote-debugging-port=33676"` and a
  scratch-path `pgrep` are empty). After **SIGTERM** to the counter: 0, and the frozen setup control
  reproduces (`rc 2 setup`, "driver group killed, 0 chromium processes swept").
- **A write under `/tmp` happens, outside `--scratch`.** Playwright binds its artifacts dir to
  `os.tmpdir()` at **module-load** time (`coreBundle.js:40647/44899/45997`,
  `ARTIFACTS_FOLDER{,2,3} = join(os.tmpdir(),"playwright-artifacts-")`), and the driver
  `require`s `playwright-core` at line 140 **before** it sets `process.env.TMPDIR` at line 164 — so
  the connectOverCDP legs create `/tmp/playwright-artifacts-XXXXXX`. A 50 Hz `/tmp` watcher over a
  clean run saw **12 distinct `/tmp/playwright-artifacts-*` dirs appear** (4 connectOverCDP arms × 3
  reps); a before/after diff sees none because Playwright removes them on clean exit. So the
  `--scratch` tree does **not** contain all of the run's writes, and the driver's own sweep (which
  matches `--user-data-dir=<scratch>/`) cannot see them. Declared limit 7 asserts the sweep reaches the
  Playwright *profile* — true; it does not assert that all writes stay under `--scratch`.
- **SIGKILL leaves orphans.** SIGKILL is uncatchable, so the counter's signal handler never runs: the
  detached driver group survives (7–11 pids), one chromium survives on port 33676, and the in-flight
  `/tmp/playwright-artifacts-*` dir survives with it; the driver self-cleans ~20 s later. SIGTERM is
  in the frozen control set and passes; SIGKILL is not, so this is an unmeasured path, not a broken
  frozen control.
- **Transitive deps unbound (already declared).** Tampering `node_modules/ws/index.js` and
  `node_modules/typed-query-selector/package.json` leaves both top-level tree hashes and both
  `package-lock.json` integrity strings byte-identical, so the counter's `libs` check stays clean.
  This is r97 A1 item 6, re-confirmed for r98 — declared, not a new gap.

## (c) What a clean `--live` verdict binds after r98

A clean `--live` verdict (rc 0, `verdict: clean`, 0 findings) binds exactly:

1. **Bytes**: the driver file at `<lane>/scripts/client-oopif-uploadmodes-round98.mjs` hashed
   `f8e95a98…92aa2` == the pin, checked *before* it ran (a laundered copy is rejected, driver not run).
2. **Recorded fields**: `lib`, `mode`, `isLocal`, `input`, the exact parent/child URLs, the frames list,
   the single iframe target, the 24 distinct UUID-shaped browser ids, the answer/payload descriptors,
   the absent path, the three ports, `reps: 3`, the nonce, and the two top-level library tree hashes.
3. **Observed outcomes**: per-leg `#s` files / events / read, the `#pp` emptiness, the browser version
   strings, the leg outcome (including PLLM's exact `ENOENT … stat '<path>'` and PUR's
   `NotFoundError` read), and the driver's exit status 0.

It does **not** bind: who started the browser, that the browser process was the client's own child,
that the 24 browser ids name 24 distinct real processes, that the browser was launched with the
recorded arguments, or that every write the run made landed under `--scratch`. All of those are
driver-pin facts (the driver's bytes) plus declared limits 2 and 7 — which is precisely and only what
the frozen sentence claims.

## Commands run (exact, with exit codes)

```
mkdir -p /fast/scratch/hyaku/tabi-r98/R98Sentinel/deps && cd …/deps && npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0      # rc 0
node …/check-client-oopif-uploadmodes-round98.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 f8e95a98…92aa2 --live --deps …/deps --scratch …/a --ports 33674,33675,33676 --json   # rc 0 (clean, 256 checks, 0 findings)
bash …/run-launder.sh        # v0 rc 0 | v1 rc 1 | v2 rc 0
node …/lane2/… --expect-driver-sha256 817288d7…90031 --live --scratch …/i --ports 33671,33672,33673   # rc 0 (clean)
node …/lane4/… --expect-driver-sha256 c06549d0…c5eb --live --scratch …/k --ports 33671,33672,33673   # rc 0 (clean)
node …/lane/… --expect-driver-sha256 f8e95a98…92aa2 --live --scratch …/d --ports 33671,33672,33673   # rc 1 (driver-pin, driver not run)
bash …/probe-confinement.sh # rc 0 (second real run; /proc sampling)
bash …/probe-tmpwatch.sh    # rc 0 (50 Hz /tmp watcher: 12 transient /tmp/playwright-artifacts-*)
bash …/probe-interrupt.sh   # rc 2 (SIGTERM): 0 chromium left, 0 leaked artifacts
bash …/probe-interrupt-late.sh # rc 2 (SIGTERM at t=26 s): 0 chromium left, 0 leaked artifacts
bash …/probe-kill-window.sh # SIGKILL: 1 chromium + driver group orphaned, 1 /tmp artifacts dir leaked
bash …/probe-sigkill.sh     # SIGKILL: victim dir survived the kill; driver self-cleaned after ~20 s
```

## Housekeeping

Scratch `/fast/scratch/hyaku/tabi-r98/R98Sentinel/` removed after copying the cited artifacts into
`.ufo/waves/round-98/w1/`. No chromium carrying my ports (33671–33676) or my scratch path is left
running; processes belonging to other seats were not touched. No lane file outside
`.ufo/waves/round-98/w1/` was written; no commit, no git/jj mutation of the lane or of the fleet repo.
Fixture repos were created with `git -C "$D" init -q` under my scratch and every later `git -C` call
asserted `rev-parse --show-toplevel` == that dir.

## Evidence

- `R98Sentinel-summary.json` — the machine-readable form of every claim above.
- `R98Sentinel-reallive-counter.json` — the clean real `--live` counter output.
- `R98Sentinel-reallive-ps-samples.txt` — 1 Hz `ps` samples of every chromium carrying port 33676.
- `R98Sentinel-reallive2-proc-samples.txt` — 1 Hz `/proc` samples (user-data-dir, TMPDIR, exe).
- `R98Sentinel-launder-v0-control.json` / `-v1-pw-remote.json` / `-v2-pw-islocal.json` — the three
  laundering variants' counter outputs.
- `R98Sentinel-launder.diff` — the exact diff of the laundering driver copy vs the frozen driver.

VERDICT C1: neutral
