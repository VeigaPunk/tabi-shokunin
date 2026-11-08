# R92Sentinel — scope & hygiene audit of the round-92 instruments

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; scratch `/fast/scratch/hyaku/tabi-r92/R92Sentinel` (removed on yield);
ports 19401/19402/19403 (mine only). Instruments audited (sha256 verified against
`.ufo/waves/round-92/controls/instrument-sha256.txt`, all three matched):
`scripts/chrome-cdp-iframe-chooser-round92.mjs` (driver), `scripts/check-iframe-chooser-round92.mjs` (counter),
`scripts/negatives-iframe-chooser-round92.mjs` (battery). No instrument, pin, control or claim was edited.

Evidence: `.ufo/waves/round-92/w1/R92Sentinel-hygiene-probes.json`, `R92Sentinel-counter-full.json`,
`R92Sentinel-live-receipt.json`, `R92Sentinel-driver-reps1-receipt.json`, `R92Sentinel-battery.json`.

## Operational result (the counting command reproduces)

```
node scripts/check-iframe-chooser-round92.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688 \
  --live --scratch /fast/scratch/hyaku/tabi-r92/R92Sentinel/full --ports 19401,19402,19403 --json
# exit 0, verdict clean, checkCount 93, findings [], 6 legs, nonce tabi-r92-live-344d73f4e0bd
```
Battery re-run against the committed corpus receipt: exit 0, 31/31 killed, `failed: []`.

## F1 — (a) no hardcoded `/tmp`; scratch is honoured everywhere. CONFIRMED.
`grep -E '/tmp|TMPDIR|tmpdir|mktemp|os\.tmp|homedir|/fast/scratch'` over the three instruments: **0 matches**.
Every path is derived from `--scratch`/`--out` and must be absolute: driver:55 (`--scratch` absolute),
driver:69 (`--out` absolute `.json`), counter:62 (`--live` absolute `--scratch`), battery:16 (lane+scratch absolute).
Driver writes only inside scratch (answer file driver:80-81, profile driver:119, leg dir removed driver:206);
counter writes only inside scratch (counter:70 receipt path, counter:75 removes `scratch/driver`); battery writes
only case files under scratch (battery:60). Battery left the lane byte-identical
(`git status --porcelain | sha256sum` identical before/after). **No finding.**

## F2 — (b) servers bind loopback only; `localhost` resolves to ::1 first but the driver still works. CONFIRMED.
`ss -lntH` sampled during a live run showed only `127.0.0.1:19401`, `127.0.0.1:19402`, `127.0.0.1:19403`
(driver:101 binds `'127.0.0.1'`; driver:122 passes `--remote-debugging-port`, chromium binds loopback by default).
No `0.0.0.0`/`::` listener. `getent hosts localhost` → `::1  localhost` (IPv6 first), and a node client connecting
to `::1` on the driver's IPv4-bound port gets `ECONNREFUSED`. Chromium nevertheless reaches `http://localhost:19401/`
over **IPv4**: my one-off probe server logged `REQUEST from 127.0.0.1  host-header localhost:19401`.
Chromium's own resolver prefers IPv4 for `localhost` here, so the `::1`-first `getent` order is harmless.
Driver leg set on 19401-19403, `--reps 1` (exit 0, 2 legs, 0 failures):
X-1 → 1 attached `iframe`, 1 `browserIframeTargets`, chooser on `iframe` session, answer error null,
files `[["tabi-r92-answer.txt",22]]`; S-1 → 0 attached, 0 listed, chooser on `page` session, same file readback.
**No finding.** (Note the child's `Host:` is `localhost` while the socket peer is 127.0.0.1 — the site distinction is
by URL host, which is what the claim asserts; it is not "localhost vs a different machine".)

## F3 — (c) per-leg cleanup works on the normal path, but a killed driver orphans chromium + profile. DEFECT (low, operability).
Normal path: driver:204 `proc.kill('SIGTERM')`, driver:206 `rmSync(scratch/leg-<id>)`; after my run
`pgrep -f remote-debugging-port=19403` was empty and no `leg-*` dirs remained; after the counter's own `--live`
only `live-receipt.json` remained in scratch.
**Defect:** the cleanup lives in the driver's `finally` (driver:203-206), so it never runs if the driver process
dies first. I killed only the driver (SIGTERM, then SIGKILL) mid-leg: **8 chromium processes stayed alive on
port 19403 and 1 profile dir stayed on disk.** The next `--live` on the same triple then aborted with
`free-port precheck: port 19403 busy` and the counter reported it as **verdict `findings`, finding id
`receipt-unreadable`, exit 1** — i.e. an environment/port failure is indistinguishable from a claim failure in
the counter's output (counter:78-82 turns any unreadable/missing receipt into a finding). The kill rule names
"a setup/port/host-resource failure named as such"; here the failure is *reported* as a finding, not as setup
(counter's `refuse` path, exit 2, is only reachable for argument errors). Smallest remediation: on driver exit,
kill the whole chromium process group (and/or `spawn` with `detached:true` + `process.kill(-pid)`), and have the
counter report a driver exit≠0 with no receipt as verdict `setup` (exit 2) rather than a finding.
Severity: low — it does not falsify C1, but it can turn a stale-port accident into a spurious "C1 failed" report.

## F4 — (d) `--live` cannot be redirected to a stale receipt. CONFIRMED (no finding).
The live path is closed by construction: counter:49 refuses `--live` together with `--receipt`;
counter:70 fixes the receipt path to `<scratch>/live-receipt.json` (no CLI override); counter:72 removes that
file **before** the driver runs; counter:69 mints a fresh random nonce `tabi-r92-live-<12 hex>` and the counter
compares `receipt.nonce` to it (counter:88). Tests, all on my triple:
- planted stale receipt (nonce `tabi-r92-live-63a66abf7529`) at `live-receipt.json` → counter exit 0, verdict clean,
  but the file on disk after the run carried the **fresh** nonce `tabi-r92-live-3636af4d5daf`: the stale content was
  never read.
- planted **symlink** `live-receipt.json → stale-target.json` → counter exit 0 clean; the symlink target kept its
  old nonce (untouched) and the path was replaced by a regular file: `rmSync` unlinks the symlink, the driver
  then writes a fresh regular file. No stale read.
- planted **directory** at `live-receipt.json` → driver `EISDIR`, counter exit 1 `receipt-unreadable`: fail-closed.
- driver refused before writing (port 19401 blocked) → counter exit 1, `driverRun.status 2`, stderr
  `{"error":"usage","detail":"free-port precheck: port 19401 busy..."}` and finding `receipt-unreadable`;
  the pre-planted stale file was gone from scratch (it had been removed by counter:72). Fail-closed.
- wrong `--expect-driver-sha256` → exit 1, finding `driver-pin`, **no browser started** (counter:65-68).
- `--live` + `--receipt` → exit 2 `setup`; `--receipt` without `--expect-nonce` → exit 2 `setup`.
**No finding.** (Residual, disclosed: `--receipt` mode is forgeable by construction — declared limit 6.)

## F5 — (e) no secrets or credential material in the committed receipts. CONFIRMED.
Case-insensitive grep for `token|secret|password|passwd|api[_-]?key|authorization|bearer|cookie|credential|private[_-]key|BEGIN …PRIVATE KEY`
over `.ufo/waves/round-92/**` and `corpus/evidence/round92/**`: **0 matches** in receipts, controls, scored
artifacts. The corpus receipt contains only schema/nonce/sha256/version/ports/legs — no cookies, headers, tokens,
or filesystem paths (`grep -o '/home/…|/fast/…'` → none). **No finding.**
Only two committed files embed host paths (not secrets): `.ufo/waves/round-92/scored/c1-live.json`
(`receipt: /fast/scratch/hyaku/tabi-r92/l1/scored/live-receipt.json`) and `.ufo/waves/round-92/claims.json`
(absolute lane path in `countingCommand`). Informational only.

## F6 — SCOPE: the counter's "clean" does not by itself attest 6 legs; `reps` is caller-chosen. OBSERVATION.
Counter:44 `reps = opt('reps') || '3'` (1..10 accepted), and the leg-set expectation (counter:101-102) is derived
from that same `reps`. I ran the counter `--live --reps 1`: **exit 0, verdict clean, checkCount 37, legs
`["X-1","S-1"]`** — 2 legs, not 6. The claim's "3 repetitions … 6 legs" is therefore a property of the *frozen
counting command* (which passes no `--reps`, so the default 3 applies), not of the counter binary.
Impact: none on the frozen command (my run of it gave 93 checks / 6 legs / clean), but a wave artifact that ran
the counter with a non-default `--reps` would be quoting a "clean" that does not cover the claimed 6 legs.
The battery (battery:31 cases) does not cover a `reps` mismatch either. Smallest remediation: hard-code
`reps = 3` in the counter's live path (or reject `--reps` ≠ 3 in live mode), and add a battery case mutating
`reps`. Note this is a scope observation about the counter's surface, not a falsification of C1's wording:
C1's wording is about the frozen command, which I re-ran and which is clean.

## F7 — SCOPE: the receipt's own browser version is recorded but never checked; the version string checked is a launcher banner. OBSERVATION.
Driver:111 records `chromium` from `spawnSync('/usr/bin/chromium', ['--version'])`, and counter:93 checks only that
banner contains `155.0.8059.84`. The receipt also carries the *real* per-leg DevTools version
`leg.browserVersion = "Chrome/155.0.8059.84"` — **the counter never reads `browserVersion`** (grep: no match in the
counter or the battery), so the browser that actually served the legs is not version-bound by the counter; only the
launcher's banner is. Additionally `/usr/bin/chromium` is a 14 KB ELF launcher that execs `/usr/lib/chromium/chromium`
and injects **user-owned flags** from `/home/vgpnk/.config/chromium-flags.conf`
(`--ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation
--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url --disable-features=Vulkan`) — observed
live in the browser's own argv. Those flags are outside the sha256 pin and can change with user config
(e.g. a `--disable-features` touching site isolation would be material to this predicate).
Smallest remediation: have the counter check `leg.browserVersion` contains the tag, and have the driver record the
effective browser argv; optionally pin the wrapper config out of the measurement (e.g. `CHROME_WRAPPER`/`--no-*`).
No falsification on this host: `/usr/bin/chromium --version` = `Chromium 155.0.8059.84 Arch Linux`,
`/usr/lib/chromium/chromium --version` = `Chromium 155.0.8059.84`, and every leg of both my runs and the scored
receipt reports `Chrome/155.0.8059.84`.

## VERDICT C1: neutral

No artifact I produced shows C1's stated wording false, nor wider than what the counter enforces *for the frozen
counting command*: I re-ran that command on my own triple and got exit 0 / `verdict: clean` / 93 checks / 0 findings
over 6 legs, with per-leg X on the `iframe` session and S on the `page` session and the answer file read back as
`[["tabi-r92-answer.txt",22]]` — identical to the scored run (`tabi-r92-live-63a66abf7529`).
The findings above are hygiene/scope observations about the instruments' surroundings, none of which falsifies the
predicate: F1/F2/F4/F5 are explicit confirmations with evidence; F3 (orphaned chromium + a port failure reported as
a *finding* rather than as setup) and F6 (`--reps` widens what "clean" means) and F7 (browser version bound via a
launcher banner, user-config flags outside the pin) are defects/observations to record, each with a smallest
remediation, none changing the claim's truth on this host.

## Tooling / host hygiene
No tools installed, upgraded or removed; no `sudo`, no pacman transaction, no service restart, no sysctl change, no
git/jj mutation, nothing written outside my scratch and my own w1 files. Chromium processes I started were killed
only by my own port (`pkill -f remote-debugging-port=19403`); `pgrep -f remote-debugging-port=19403` is empty and
`ss -lntH` shows nothing on 19401-19403 at yield time.
