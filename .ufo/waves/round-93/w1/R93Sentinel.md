# R93Sentinel — instrument hygiene probe (process groups, setup mapping, scratch)

Seat R93Sentinel (leaf, no dispatch). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; scratch
`/fast/scratch/hyaku/tabi-r93/R93Sentinel` (removed at end). Ports: 19441/19442/19443 and
19444/19445/19446 (mine only). **No instrument, plan, claim, control or claims.json was edited.**
Pins re-verified before and after every run: driver `a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0`
(= `.ufo/waves/round-93/controls/instrument-sha256.txt`), counter `3c721b66…`, battery `c8c15cc7…`.
Tools: none installed/upgraded (stock `node v24.21.0`, `/usr/bin/chromium 155.0.8059.84`, `ss`, `pgrep`);
`/home/vgpnk/.omp/agent/RULES.md` read, no pacman transaction needed. Below:
`D`=driver, `C`=counter, `B`=battery under `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/`,
`L`=lane dir, `P`=pin `a0deddda…`, `$S`=my scratch.

## S1 — process group killed on SIGTERM/SIGINT/SIGHUP and on exit (PASS)

```
node $D --lane $L --nonce tabi-r93-sentinel-pterm --scratch $S/scratch --out $S/receipt.json --http-port 19441 --child-port 19442 --cdp-port 19443 &
sleep 4; pgrep -af remote-debugging-port=19443; kill -TERM <driver pid>; sleep 3; pgrep -af remote-debugging-port=19443
```
t=4 s: 1 browser (pid 504973). `kill -TERM` rc 0. t=7 s: `pgrep` rc 1 = **0 survivors**, driver gone,
no receipt, `ss` 0 listeners on 19441/19442/19443. Repeat with `kill -INT` and `kill -HUP`: driver
wait rc **130** each, chromium after **0**, listeners left **0**, receipt **none**. The driver's claim
("kills its chromium process group on exit/signals") **holds** for every catchable signal:
`process.on(SIGINT|SIGTERM|SIGHUP)` → `killGroup` → `exit(130)`; each leg's `finally` also does
`process.kill(-pid,'SIGTERM')` + `killGroup`.

## S2 — SIGKILL mid-leg: chromium survives (bounded, uncatchable)

Same command on ports 19444/19445/19446 with `kill -KILL` → rc 0 (shell: `Killed`); t=7 s:
**6 survivors** (browser + renderers 517939/518092/518111/518140/518147/518189), driver gone, no
receipt. Killed only my own leftovers (`pkill -f remote-debugging-port=19446` → 0 left; other ports
untouched). SIGKILL cannot be caught — not a driver defect; the plan claims only catchable signals.
The residue **holds the CDP port**, so it poisons the next run on that triple — see S3, where the
counter then reports `setup` exit 2 instead of a false finding.

## S3 — setup mapping: driver exit 2 → counter verdict `setup`, exit 2 (PASS)

Listener I started, ss-verified: `LISTEN 0 511 127.0.0.1:19444 0.0.0.0:* users:(("MainThread",pid=566987,fd=23))`, then

```
node $C --lane $L --expect-driver-sha256 $P --live --scratch $S/scratch --ports 19444,19445,19446 --json
```
rc **2**, `{"verdict":"setup","detail":"driver refused (exit 2): {\"error\":\"usage\",\"detail\":\"free-port precheck: port 19444 busy: listen EADDRINUSE…"}"}`
(`R93Sentinel-counter-setup-busyport.json`). Same mapping when the refusal is caused by a **leftover
SIGKILL survivor** holding 19443 (S2 residue) → rc 2 `setup`, not "findings". The mapping keys off the
driver's own `r.status === 2`, so it is robust to *why* the driver refused.

## S4 — counter maps a **signalled** driver to `findings` exit 1, not `setup` (DEFECT, medium)

`node $C --lane $L --expect-driver-sha256 $P --live --scratch $S/scratch --ports 19441,19442,19443 --json &`
then `kill -KILL <driver child pid>` mid-leg: `driverRun = {"status":null,"signal":"SIGKILL"}`; the
`r.status === 2` test does not fire, so the counter reads a receipt that was never written → **rc 1**,
`{"verdict":"findings","findings":[{"id":"receipt-unreadable","detail":"ENOENT … live-receipt.json"}]}`
(`R93Sentinel-counter-signalled-driver.json`).

Impact: an infrastructure failure (killed/hung/OOM driver, or the `spawnSync` 600 s timeout firing)
is reported with the same `verdict:"findings"` shape as a genuine predicate failure. The plan's kill
rule exempts "a setup/port/host-resource failure **named as such**"; `receipt-unreadable` names no
cause and `driverRun.signal` is not in the finding's `detail`, so triage reading only
`verdict`/`findings[].id` cannot separate "the predicate is false" from "the driver was killed".
Does **not** falsify C1's wording (no leg-level statement that the predicate is false). Smallest
remediation (not applied — counter is frozen): `if (r.status === 2 || r.signal) refuse('driver refused …', …)`.

## S5 — counter killed mid-live orphans the driver and its chromium (DEFECT, medium)

`kill -TERM <counter pid>` while it drives the pinned driver: counter dies (`counter_alive=no`) but
its `spawnSync` child **survives as an orphan** (driver_count_post=1, pid 910115), still running legs
and holding ports (`chrom_count_post=7`); the counter's own cleanup (`fs.rmSync(scratch/driver)`)
never ran, leaving `scratch/driver/leg-X-3/profile/` residue. The counter installs no signal handler
and forwards nothing to the driver. Remediation (not applied): spawn the driver `detached:true` in
its own group and kill that group from a counter `exit`/signal handler, as the driver does for chromium.

## S6 — `--scratch` containment (PASS for the instruments; one Chromium caveat)

Lane file mtimes snapshotted before/after a run and compared with `comm` (excluding the `w1/` wave dir
other seats write): **lane: zero files modified** — the counter only *reads* `git -C <lane> rev-parse
master`. Driver writes only `tabi-r93-answer.txt` and `leg-<id>/profile/` under `--scratch`; per-leg
profile dirs are removed by the driver's `finally` (`fs.rmSync(scratch/leg-<id>)`), so a full run
leaves only the answer file; the receipt goes to `--out` (inside scratch). Counter `--live` writes
`scratch/live-receipt.json` and removes `scratch/driver` — after a clean live run the scratch tree is
exactly `live-receipt.json`. No `$HOME/.cache` writes; the only `$HOME` touch is
`~/.config/chromium/Crash Reports/settings.dat` (Chromium crashpad, 40 bytes).

**Caveat (low, Chromium-attributable):** each Chromium launch leaves one
`/tmp/org.chromium.Chromium.<rand>/` dir (the `SingletonSocket` target) — 6 per 6-leg run, measured
`before=283 after=289 delta=6` over one full 3-rep run; bare Chromium does the same (`delta=1` for a
single launch with `--user-data-dir` in scratch). So a `--scratch`-scoped run does write outside
`--scratch` and outside the lane, and those dirs are never reclaimed (~20 created by this seat; the
host already had 272 from other seats — I did not delete unidentified ones).

## S7 — counter edge cases (PASS; refusals are `setup` exit 2)

| case | rc | output |
|---|---|---|
| `--reps 0` / `--reps 11` | 2 | `{"verdict":"setup","detail":"--reps must be 1..10"}` |
| missing `--ports`; 2 / 4 values; `abc,def,ghi` | 2 | `--ports must be http,child,cdp` |
| `--ports 1,2,3` | 2 | driver refused `--http-port out of range` → setup |
| `--ports 19441,19441,19442` | 2 | driver refused `ports must differ` → setup |
| wrong pin (64 hex ≠ file) | 1 | `{"verdict":"findings","findings":[{"id":"driver-pin","detail":"… != pin … (driver not run)"}]}` — **driver not run**, no browser launched |
| malformed pin (`NOTHEX`) | 2 | `--expect-driver-sha256 must be 64 hex` |
| missing or relative `--scratch` | 2 | `--live needs an absolute --scratch` (driver likewise: `--scratch must be an absolute path`) |
| both `--live` and `--receipt` / neither | 2 | `exactly one of --live or --receipt` |

Artifacts `R93Sentinel-edge-*.json`. The wrong-pin case is the only non-`setup` refusal; it reports
`findings`/`driver-pin` with the explicit "(driver not run)" text and the driver is correctly not
executed (verified: no chromium spawned, `pgrep` empty afterwards). The plan's own wrong-site control
also expects rc 1 with behaviour ids, so I read this as intended, not defective — noted for the L1.

## S8 — stale-receipt hygiene (PASS)

Run 1 `--live` → rc 0 clean, `scratch/live-receipt.json` written; then hold port 19442 (ss-verified)
and re-run `--live` on the **same** scratch → rc 2 `setup`, and the stale `live-receipt.json` is
**absent** afterwards (`fs.rmSync(receiptPath)` before the run). A stale receipt can never be scored
as a fresh live run.

## S9 — battery re-run on my own fresh receipt (PASS)

`node $B --lane $L --receipt $S/live-receipt.json --expect-nonce tabi-r93-live-e153b5cfa87c --expect-driver-sha256 $P --scratch $S/batt`
→ `{"cases":65,"ok":65,"failed":[]}`, rc 0 — 65/65 killed (positive clean + 64 negatives).

## S10 — independent live reproduction of the predicate (supports C1)

`R93Sentinel-live-receipt.json` (my run: ports 19444/19445/19446, nonce `tabi-r93-live-e153b5cfa87c`,
6 legs, `failures: []`, 6 distinct browser ids, all `Chrome/155.0.8059.84`).
**X arm** (`childHost localhost`): 1 attached + 1 listed `iframe` target, same targetId = child frame
id, URL = child URL; chooser on the **iframe** session, `backendNodeId 2`; `describeNode(B)` on the
iframe session → `INPUT` (`type=file`,`id=s`); `describeNode(B)` on the **page** session → no error,
`nodeName "#document"`; page `getDocument{pierce:true}` → `pagePierceInputS 0`; page
`setFileInputFiles(B)` → error exactly `Node is not a file input element`; `filesAfterCross []`; then
the iframe-session answer → no error; `childFiles [["tabi-r93-answer.txt",22]]`; one trusted click on `s`.
**S arm** (`childHost 127.0.0.1`): 0 iframe targets; chooser on the **page** session, `backendNodeId 5`;
page `describeNode(B)` → `INPUT` `type=file` `id=s`; `pagePierceInputS 1`; no cross-session answer sent;
page answer → no error; `childFiles [["tabi-r93-answer.txt",22]]`.
Every clause of C1's stated wording I could observe held exactly as written on this host; nothing I
observed contradicts C1's wording or its numbers.

## Summary

PASS: S1 (0 survivors on every catchable signal, rc 130), S3 (driver exit 2 → `setup` exit 2), S8
(stale receipt cannot be scored), S9 (battery 65/65 on my receipt), S10 (independent live
reproduction; C1 wording holds). Bounded/low: S2 (SIGKILL leaves chromium — uncatchable; poisons only
that triple's next run, which the counter then reports as `setup`), S6 (Chromium's own
`/tmp/org.chromium.Chromium.*` dirs), S7 (wrong pin → `findings`; reads as intended).
DEFECTS: **S4** (signalled driver → counter `findings` exit 1 instead of `setup`; fix = treat
`r.signal` as setup) and **S5** (counter killed → orphaned driver + chromium; fix = detached driver
group + counter signal handler) — both medium, both worth fixing in a later round (instruments are
frozen here; the L1 decides). Neither changes C1's truth value: S4 yields no leg-level statement
that the predicate is false, and S5 is an orphan-process hygiene issue, not a measurement issue.
Final hygiene state: `pgrep -f "remote-debugging-port=1944[1-6]"` empty; scratch root removed.

VERDICT C1: neutral
Artifact: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-93/w1/R93Sentinel-live-receipt.json`
(independent clean live receipt reproducing every clause of the stated wording) —
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-93/w1/R93Sentinel-counter-live-clean.json`
(counter rc 0, `verdict clean`, 101 checks, 0 findings).
