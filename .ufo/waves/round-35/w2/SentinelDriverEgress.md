# C2 sentinel — lane driver runtime footprint (egress, home, listeners, cleanup, D11 evidence)

Seat: SentinelDriverEgress (leaf). Milestone C2. Attacked revision (wave-1 integration):
`083c5c643be7aa5965a5de3458a32ed0d289ead3`. Attacked surface:
`scripts/bidi-firefox-loopback-round35.mjs` (sha256 `fb8c5fdfeb4350948dc7b62c26883b657efe5d0190274dbd8c0ea8716320ba9b`, equal in the
lane worktree, the clone and `corpus/evidence/round-35/bidi-firefox/receipt.json` `driverSha256`). Findings only; **no lane file
was edited** and no lane/browser state was mutated outside my scratch (lane `git status --porcelain` shows only other seats' wave dirs;
clone `git status --porcelain` empty after four driver invocations).

## Verdict

**The driver's runtime footprint holds on all four measured checks — 0 non-loopback sockets, no write or mtime change under
`~/.mozilla`/`~/.cache/mozilla`/`~/.config/mozilla`/`~/.local/share/mozilla`, every listener bound to `127.0.0.1` (never `0.0.0.0` or
`[::]`), `127.0.0.1:9222` never bound, connected to or probed, and no process of the 22-pid run tree alive afterwards — but the entry's
D11 claim is cited to a void artifact: the committed sample `.ufo/waves/round-35/measure/driver-egress-sample.txt` is 0 bytes
(`git cat-file -s 083c5c6:…` → `0`) and no committed command produces it, so the paragraph "its integration run sampled 0 non-loopback
firefox/geckodriver sockets (`driver-egress-sample.txt`)" (`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md:273`, repeated in
`corpus/lessons/round-35.md:76`) rests on a file that records neither that a sampler ran nor what it saw — a defect (medium, provenance),
because QUALITY 100 makes a socket sample the required citation for a loopback assertion, and an empty file is indistinguishable from a
sampler that never ran. The behavioural fact itself is true and I reproduced it four times (three independent instruments, one with a
concurrent live non-loopback session proving the host had egress in the same window); the defect is confined to the evidence, not to
the driver.**

## Axes attacked

Egress containment · home/config containment · listener exposure · process cleanup · evidence honesty of the D11 citation.

## Commands run (exact, with exit codes)

Scratch `S=/fast/scratch/hyaku/tabi-r35/SentinelDriverEgress`; every browser/driver env var (`TMPDIR`, `HOME`, `XDG_*`) inside `$S`;
all lane-script runs were in `$S/clone` (checked out at `083c5c6…`), never in the lane checkout.

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3`; `git -C "$S/clone" rev-parse --show-toplevel` → the clone; `sha256sum` driver clone vs lane | 0,0,0,0 (digests equal) |
| 2 | `bash "$S/run-driver.sh"` — `TMPDIR=$S/tmp node "$S/clone/scripts/bidi-firefox-loopback-round35.mjs" --out "$S/out2"` under a pid-scoped `ss` sampler (`monitor2.mjs`, `setInterval(…,200)`) | 0 (`driver_exit=0`, 4,198 ms for two cold runs) |
| 3 | `TMPDIR="$S/tmp2" strace -f -qq -y -s 256 -e trace=connect,sendto,sendmmsg -o "$S/strace-driver.log" node "$S/clone/scripts/bidi-firefox-loopback-round35.mjs" --out "$S/out3"` | 0 |
| 4 | `bash "$S/run5.sh"` — same driver run + sampler + a concurrent held TCP session to an allowed public host (`ftp.mozilla.org:443`) as a positive control for the network path and the detector | 0 (`driver_exit=0`, `control_exit=0`, 4,210 ms) |
| 5 | `node monitor2.mjs <python-control-pid> …` (instrument sensitivity test: same sampler, pointed at a pid that *does* hold a non-loopback socket) | 0 → 13 non-loopback lines |
| 6 | `sha256sum scripts/bidi-firefox-loopback-round35.mjs` lane vs clone vs `receipt.json:driverSha256` | 0 (all `fb8c5fdf…`) |
| 7 | `git -C "$S/clone" status --porcelain`; `pgrep -a -f -- "--profile-root $S/tmp*"`; `find "$S/tmp*" -mindepth 1` after each run | 0 (empty); 1 (none); empty |
| 8 | `find ~/.mozilla ~/.cache/mozilla ~/.config/mozilla ~/.local/share/mozilla -xdev -printf '%T@ %s %p\n' \| sort` before every run and after runs 2–5 | 0 (all four inventories byte-identical, sha256 `08d7d368…`) |
| 9 | `git cat-file -s 083c5c6:.ufo/waves/round-35/measure/driver-egress-sample.txt`; `stat -c '%s' …`; `grep -rn 'driver-egress-sample'` over `scripts/ .ufo/waves/round-35/{*.sh,baseline,counters}` | 0 (`0`); (`0`); 1 (no producer) |

A first invocation (18:40) sampled with an empty `$!` (the launcher put `cd … && node …` in one backgrounded AND-list), so the monitor
rooted at pid 0 and captured system-wide sockets (1,202 samples, 89,816 socket lines) instead of a pid tree; it is **discarded as
evidence** and `monitor2.mjs` now refuses `pid <= 0`. Everything below comes from runs 2–5.

## Check 1 — outbound connections: HOLDS (0 non-loopback), and the sampler is shown able to fail

Run 5 (27 samples over 5,259 ms, ≈195 ms cadence, pid set growing 1→10→1 as each cold run's geckodriver + Firefox + content processes
come and go):

```
samples 27; pids observed 22
non-loopback socket lines: 0
distinct peer endpoints: 127.0.0.1:33317, :34195, :37537, :39425, :42260, :42302, :43037, :43383,
                          :44148, :45577, :46521, :47970, :49958, :50674, :51408, :51790
profile user.js prefs captured while live: user_pref("network.dns.disabled", true);
                                           user_pref("network.trr.mode", 5);
```

(`evidence/run5-sockets.txt`; raw samples `evidence/monitor5.json`.) In the same window the positive control held an established
session to an allowed public host — `ESTAB … [2804:14d:…:2c0e]:38892 [2a04:4e42:2a::787]:443 users:(("python3",pid=1886713))`,
12/12 self-samples (`evidence/control-out5.json`) — so the network path was up while the driver tree had no non-loopback peer. Pointing
the *same* sampler at that control pid reports 13 non-loopback lines (`evidence/monitor-control.json`), so a zero reading is a
measurement, not blindness.

Run 3 adds syscall truth (`evidence/strace-driver.log`, `evidence/run3-strace-summary.txt`), which cannot miss a short-lived
connection between `ss` samples:

```
connect() calls: 35
AF_INET: 11  AF_INET6: 2  AF_UNIX: 22
distinct inet peers: inet_addr("127.0.0.1")  inet_pton(AF_INET6, "::1")
htons(443): 0   htons(53): 0   htons(9222): 0
AF_UNIX paths: 18 sun_path="/run/dbus/system_bus_socket"  4 sun_path="/run/systemd/resolve/io.systemd.Resolve"
```

The two `AF_INET6` calls are geckodriver's loopback availability probe (`::1`, `sin6_port=htons(65535)`, `= 0`); the only name looked
up is this host's own hostname `plazir27` through systemd-resolved's varlink socket (local IPC, same noise w1 recorded). No 443, no
direct 53, no Mozilla CDN peer — i.e. the `network.dns.disabled: true` + `network.trr.mode: 5` fence written into the throwaway
profile (`user.js`, captured live, 3,200 bytes) does what D11 says it does. Four runs produced the same first-screenshot digest
`7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`, byte-identical to the committed receipt.

Not re-run by me: the *negative* control (driver without the prefs → 3 TLS connections), which w1 SentinelFirefoxEgress measured
under strace; reproducing it would need an edited driver copy and would deliberately egress.

## Check 2 — writes outside scratch: HOLDS

`~/.mozilla` (1 file), `~/.cache/mozilla` (empty dir), `~/.config/mozilla` (Crash Reports/Pending Pings), `~/.local/share/mozilla`
(absent) were inventoried as `%T@ %s %p` before the first run and after runs 2, 3 and 5. All four inventories are byte-identical
(sha256 `08d7d3680af93fb9f5f03de00f36e24bfa880a89cb01539c6bc49d5eb8b8fcf7`; `evidence/home-before.txt`, `home-after2.txt`,
`home-final.txt`), and `~/.local/share/mozilla` still does not exist. The driver hands geckodriver a fresh env — `HOME`, `TMPDIR`,
`TMP`, `TEMP`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_RUNTIME_DIR`, `MOZ_HEADLESS=1`
(`scripts/bidi-firefox-loopback-round35.mjs:120-131`) under a per-run `mkdtempSync(join(TMPDIR,"fx-"))` (`:98`) — and the live profile
really was inside scratch (`…/tmp/fx-akpzvf/profiles/rust_mozprofilenWDyUs/user.js`), with `$TMPDIR` empty after every run
(`rmSync(runDir)` at `:378`). The committed transcript's own `moz:profile`
(`/fast/scratch/hyaku/tabi-r35/L1/int/tmp/fx-AlSY1s/profiles/rust_mozprofileWHMBIQ`) corroborates the same containment for the
integration run.

## Check 3 — listeners: HOLDS (never `0.0.0.0`, never `[::]`)

Eight distinct listeners across both cold runs of run 5, every one bound to `127.0.0.1`:

```
LISTEN 127.0.0.1:39425 geckodriver   LISTEN 127.0.0.1:37537 geckodriver
LISTEN 127.0.0.1:33317 firefox-bin   LISTEN 127.0.0.1:43037 firefox-bin   (run 1: Marionette + remote agent)
LISTEN 127.0.0.1:43383 firefox-bin   LISTEN 127.0.0.1:45577 firefox-bin   (run 2)
LISTEN 127.0.0.1:34195 MainThread    LISTEN 127.0.0.1:46521 MainThread    (the gate's serveFixture, one per run)
```

`wildcard bind (0.0.0.0 or [::]) among driver-tree listeners: False`. The fixture server is the gate's own
(`scripts/check-bidi-runtime.mjs:198` `server.listen(0, "127.0.0.1", …)`), so the driver adds no new bind surface. `ss` and strace
contain no `9222` in any form; the driver's only guard is the post-`freePort` equality check at `:116`, and no sampled line ever
carried the port. (Inherent, and identical in the gate and the counter: for the ~2 s of a run the ephemeral WebDriver listener and the
fixture accept unauthenticated local clients. Not a defect of this driver.)

## Check 4 — no process survives: HOLDS

The 22 pids sampled in run 5 (node driver, two geckodrivers, two `firefox-bin` mains, their content processes) are all absent after
exit (`pids present after exit: []`); run 2's 21 sampled pids likewise. `pgrep -a -f -- "--profile-root $S/tmp*"` → exit 1 (none) after
runs 2, 3, 4 and 5, and the run dirs are gone. Cleanup is `process.kill(-gd.pid, "SIGTERM")` → 700 ms → `SIGKILL` → `rmSync`
(`:373-378`) on a geckodriver spawned `detached: true` (`:134`); the group kill is what catches Firefox, which is why nothing leaks.

## Check 5 — comparison with the entry's D11 claim and `driver-egress-sample.txt`: DEFECT (medium, evidence)

| D11 sentence (`corpus/knowledge/…-round-35.md:271-276`) | checked against | verdict |
|---|---|---|
| "the lane driver sets both [prefs]" | live `user.js` in the throwaway profile; driver `:155` | holds |
| "its integration run sampled 0 non-loopback firefox/geckodriver sockets (`…/measure/driver-egress-sample.txt`)" | `git cat-file -s 083c5c6:…` → `0`; `stat` → `0`; no producer in `scripts/`, `measure.sh`, `baseline/`, `counters/` | **defect**: the cited artifact has no bytes |
| "The frozen C2 counter's own live leg does not set them" | w1 SentinelFirefoxEgress / lesson M3 | holds (already recorded; not re-reported) |
| "safe only while every navigated URL is an IP literal" | fixture base `http://127.0.0.1:<port>` (gate `:198`), no hostname navigation | holds |

Exploit path of the defect: a reader (or a verifier applying QUALITY 100) opens the cited file to check the loopback assertion and finds
nothing; the claim "sampled" and "never sampled" are indistinguishable, and the round's own new criterion — *"the receipt or entry that
asserts loopback cites that sample"* (`corpus/QUALITY.md:700-706`) — is satisfied only in form. Impact is bounded because the fact
reproduces: my four runs and strace show 0 non-loopback sockets, so nothing in the entry's §2 table or the C2 count changes. It is a
provenance defect, not a behavioural falsehood. Aggravating detail: the committed transcripts do not carry the `/session` **request**
body (`receipt.json` stores the response only), so no committed artifact demonstrates the prefs were in force for the two committed
runs; the empty sample was the only claimed socket evidence, and it is void.

Smallest remediation (not applied): either delete the parenthetical citation at `:273` and the mirror at
`corpus/lessons/round-35.md:76`, or commit the sample it claims — a `ss`-derived file with its command, UTC time, pid scope and
byte count, in the shape of `evidence/run5-sockets.txt` here. Deleting the citation without adding bytes leaves the loopback sentence
asserted and uncited, which criterion 100 disallows.

## Secondary observations (not defects of the shipped behaviour)

1. **Stale digest equality in the wave-1 report.** `.ufo/waves/round-35/w1/ExecFirefoxDriver.md:74` states the driver
   `f95dac5e…` "= receipt `driverSha256`". The committed receipt's `driverSha256` is `fb8c5fdf…` (the integration re-record after the
   DNS prefs), and `fb8c5fdf…` does equal the committed driver. The receipt is self-consistent; the w1 table is a snapshot, so this is
   an annotation for the closure record, not a lane defect.
2. **Port race (low, robustness).** `freePort()` binds, closes and returns the port (`:75-82`), and `--port` / `--websocket-port` are
   drawn independently; a local squatter in the gap, or the kernel re-issuing the same port twice, makes geckodriver fail to start.
   Not observed in four runs; availability only.
3. **Error-path masking (low).** `finally` references `gd` (`:373`), which is declared after `serveFixture()`/env setup; if
   `mkdirSync(env.XDG_RUNTIME_DIR)` (`:130-131`) throws, the `finally` hits the temporal dead zone and a refusal surfaces as "run
   failed" (exit 1) instead of exit 2. Cosmetic classification bug on a path no observed run took.
4. **`--out` is caller-controlled** (`resolve(ROOT, outRel)`, `:393`, non-ASCII refused) — with an absolute path it writes outside the
   clone, which is how this seat ran it; with the default it writes into the lane tree. Matches its header; no traversal guard needed
   for a tool whose caller is the lane itself.

## Deliverables

- Report: `.ufo/waves/round-35/w2/SentinelDriverEgress.md` (this file)
- Evidence: `.ufo/waves/round-35/w2/SentinelDriverEgress/evidence/`

| file | sha256 |
|---|---|
| `evidence/run5-sockets.txt` | `4fdd993f2ebbea188f0c6cf95945a6bdd78dd6a054da18a3b81537edb01ef0b9` |
| `evidence/monitor5.json` (run 5 raw samples, 27 × pid-scoped sockets) | `eb5ea183b8fa7021f24ce9298953953e04d00f31cc01891cd5d3f8e494c4ca85` |
| `evidence/monitor2.json` (run 2 raw samples) | `a8045409e47e9b2c997d7f4449469b4fc736846f1ecce7c2c3002c3cb7734fdb` |
| `evidence/monitor-control.json` (instrument positive test) | `869d6b42cbd2b12f341bf06fd300282c05aed17c42b03c4138ca45e4a7dfa76a` |
| `evidence/strace-driver.log` (run 3, full trace) | `05f2fa764bbcc02e64cbeb3419ca5a822126c255d0d160ba368284e44b1fb9ed` |
| `evidence/run3-strace-summary.txt` | `3d5fb855fc0a1e141f9f8fe66620f122172128b8fc642cd23ae8f7da6f4b56ff` |
| `evidence/control-out5.json` (concurrent public-host session) | `bfd1be361568a9a8a2d18e35aca7b74fb0e904413a025a9514646488ee9b03b5` |
| `evidence/home-before.txt` / `home-after2.txt` / `home-final.txt` | `08d7d3680af93fb9f5f03de00f36e24bfa880a89cb01539c6bc49d5eb8b8fcf7` (all three) |
| `evidence/run5-receipt.json` (run 5 driver receipt) | `8518a94bddce93eed59bee299a4de4bbaa478ec9a287225b168257db795a5509` |
| `evidence/run3-strace-receipt.json` (run 3 driver receipt) | `c90c1dc0205be99d7234cc2f258fa37b34325cda1e0f889d473551427d893542` |
| `evidence/run5.sh` | `fd89543c5e6209d3490d23a0a7bd6829af3f0c66a6dcaebe3cc2f5ba7993db84` |
| `evidence/run-driver.sh` | `3a7d1a94e86051800b99b32da7231b70f204eae3f75405c6cea733a0999265cc` |
| `evidence/monitor2.mjs` | `877a6fc1cdea9369d5d29c668af2ed8cfc21f3331d1af054872a0b056de901e5` |
| `evidence/control.py` | `0022b23f0bc5a8e2dd519e7a80313866863679d799ff96b33270862678748ace` |

Tooling: none installed or upgraded this round (no pacman; no `uv`/`npx`); `node` and `ss` from the host as-is. Scratch
`/fast/scratch/hyaku/tabi-r35/SentinelDriverEgress` deleted after these receipts were copied; no browser or driver process from this
seat survives (checked after each run).
