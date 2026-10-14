<!-- corpus entry — tabi-shokunin round 4 (2026-10-14), fleet lane T4-3 (plan: plans/round-4.plan.md:1-11). Assignment: hygiene sweep of rounds 1-3 from live state — every scratch port closed, every chromium dead, every server gone, webbridge daemon state recorded. Read-only audit: nothing killed, stopped, restarted or deleted; writes confined to scratch /tmp/w4-t4-3-sweep/ and this file (write scope: this file only — LOG.md append per AGENTS.md:3 and the coverage row are left to the integrating round, same pattern as cdp-evidence-patterns.md:1). An earlier in-flight attempt of this lane left /tmp/tabi-r4-3-sweep/ (writes 13:06–13:10; last write 13:10:52, followed by the 13:11:07 session cycle of §4 — interruption consistent with the cycle, no other trace; integrity re-verified, SC1). Its 13:08:33 snapshot is cited below as the pre-teardown datum. -->
# Hygiene sweep — rounds 1-3 (TABI-R4-3)

Round: tabi round 4, 2026-10-14. Horizon audited: rounds 1-3 (fixture work
09:54–12:55; round records 10:5x–12:52). Sweep passes: 13:08:33 (prior
attempt, pre-teardown), 13:20:40, 13:23:05, 13:24:36 (this lane) — all
read-only. Context: the round-4 wave is in flight while this sweep runs
(peer lanes minted chromium runtime dirs 13:22–13:24; round-4 errata
appends to all 8 corpus notes landed 13:24, `git diff --stat` +201/−8; a
round-4 record draft is being written, plans/round-4-record-draft.md mtime
13:25). All pins below are as-of their stated pass.

**Verdict (as of 13:24:36):**
- **Ports — all closed.** Every port rounds 1-3 (including the r2b/r3b
  audit lanes) ever opened answers no listener (`ss`) and curl exit 7 —
  at all four passes. Closure already held at 13:08:33, *before* the
  session cycle of §4, so it is not an artifact of that teardown.
- **Chromium — none.** No chromium-family browser process at any pass
  (13:08:33, 13:20:40, 13:24:36, 13:25:13). The only chrome-named
  process is 1Password's Electron crashpad handler (args-proven, §3).
- **Servers — none.** No `http.server`/python3/node process; no live
  process holds an fd, a cwd, or a cmdline under `/tmp/tabi*` (§3).
- **Daemon — gone; state change recorded.** kimi-webbridge pid 3934817
  (TABI-R2-2 start, left running per D2) was alive at 13:08:46 and is
  gone at 13:20:40; measured cause-chain: the user session was replaced
  at ~13:11 and the daemon was a child of the old session manager (pid
  1573, now gone). The D2 "operator stop owed" item is moot; a new stale
  pid pointer remains (§4).

## 1. Method (read-only)

Per pass: `ss -ltnp` (full listener list) + per-port `ss -ltn | grep
":$p "` + `curl -s -o /dev/null -m 1 http://127.0.0.1:$p/` (exit 7 =
connection refused); comm-based process scans (`ps -eo pid,ppid,comm,args`
+ `awk`, and `pgrep -x`) to avoid the args-self-match incident
(cdp-evidence-patterns.md:105); `/proc/<pid>/fd` and `/proc/<pid>/cwd`
scans over all user pids for `/tmp/tabi*`; daemon: `ps -p 3934817`,
`ss -ltnp | grep 10086`, read-only `/status` GET (authorized as D4's
live-state recheck, webbridge-daemon-disposition.md:163; a fleet-tracked
daemon was listening at the first pass — the round-2 lane-specific
iff-condition :122-124 is separate), `stat`/`ls` shapes for state files/logs
(contents never read); pins via `sha256sum`; forensics via `coredumpctl
list`, `journalctl --user` (filtered), `loginctl list-sessions`, `last
-x`. Discipline: loopback only, no external sites; secrets shape-only;
substrates read-only.

## 2. Port audit — all closed

Ports rounds 1-3 ever opened (re-derived per scratch group, §5; "closed"
= `ss` no listener + curl exit 7 at 13:20:40 and 13:24:36; same verdict
at 13:08:33):

| port | opened by (round; evidence) | state |
|---|---|---|
| 19333 | r1 TABI-3 CDP (cdp-evidence-patterns.md:20-34; closure proof :103) | closed |
| 19441 | r1 re-measure + audit2 (cdp-evidence-patterns.md:134; /tmp/tabi-audit2-cdp/probe.mjs:5) | closed |
| 19411, 19412 | r2 TABI-R2-1 (live-dynamic-capture.md:24-25); reused by r3 executor + smoke (executor-test-sufficiency.md:68-69; /tmp/tabi-r3-3-smoke/) | closed |
| 19421, 19422 | r3 TABI-R3-1 (multi-step-journey.md:31,39-40,47) | closed |
| 19471, 19472 | r2b audit TABI-A1 (/tmp/tabi-a1-r2b-capture/run1: chromium `--user-data-dir=/tmp/tabi-a1-r2b-capture/run1/profile --remote-debugging-port=19472`; server 19471) | closed |
| 19481, 19482 | r3b audit TABI-B1 (/tmp/tabi-b1-r3b-journey/final-sweep.sh:4 own PASS line; run3-warm/journey.json base :19481) | closed |
| 9232 | r3-4 executor capture (/tmp/tabi-r3-4-work/scripts/executor-run.sh:2,24 "self-launched chromium + data: fixture + CDP :9232") | closed |
| 8891 | **not tabi's** — kaidoku-shokunin r11 queue-ops port, cited by tabi SKILL.md:476 as the network-capture precedent (that note's :1 records both its ports closed at cleanup) | closed |

Notes: (a) each round's plan required cleanup verification
(round-2.plan.md:11, round-3.plan.md:9, round-4.plan.md:8-9); LOG closure
claims re-verified — r2 "ports 19411/19412 closed, no chromium/http.server
survivors", r3 "ports 19411/19412/19421/19422 closed, no chromium
survivors" (LOG.md:110-111). (b) The audit-lane ports (19441, 19471/19472,
19481/19482) and executor port 9232 had **no prior closure claim on
record** — this sweep closes that coverage gap. (c) No other listeners
exist: the full `ss -ltnp` shows only system services (5355, 631, 53s);
no tabi listener of any kind.

## 3. Process audit (13:20:40 / 13:24:36 / 13:25:13)

- chromium-family comm scan → single hit: `chrome_crashpad` pid 1203560 =
  `/opt/1Password/chrome_crashpad_handler` (Electron 42.11.1 crashpad;
  args-proven) — not a browser, not tabi, not actionable.
- `pgrep -x chromium|chrome|headless_shell` → none; `pgrep -x node` →
  none; python3 processes → none; `http.server` arg matches → none.
- fd/cwd/cmdline scan: no live process holds anything under `/tmp/tabi*`;
  the only `tabi` cmdline match is the concurrent peer lane T4-4's poll
  script (`/tmp/w4-t4-4-tabi/poll-rung.sh`) — round-4, out of scope.
- Ambient context (not r1-3): the old session logged six Chromium app
  scopes `app-org.chromium.Chromium-*.scope` 13:08:45–13:10:34 (journal,
  `systemd[1573]`) — peer lanes' browsers in the old session; all died
  with it; none alive now. Fresh `/tmp/org.chromium.Chromium.*` runtime
  dirs were minted 13:22–13:24 by peer round-4 lanes (43 dirs total,
  residue only — no live singleton holder at scan instants; not deleted:
  outside this lane's write scope).

## 4. Webbridge daemon end-state + the session cycle

Lifecycle (all measured):
- 10:46:31 — TABI-R2-2 doc-authorized start; pid 3934817 listening
  127.0.0.1:10086 (webbridge-daemon-disposition.md:89-112).
- 13:08:46 — prior pass: listener present; `/status` (read-only GET):
  `{"extension_connected":false,"extension_id":"","extension_version":"","port":10086,"running":true,"skills":[],"tab_id_arg":true,"uptime_seconds":8532,"version":"v2.0.23"}`
  — 8-field shape, no session material ever present.
- 13:20:40 — this lane: `ps -p 3934817` → no process; no 10086 listener;
  `/status` → empty body, curl exit 7. Re-checked 13:23:05, 13:24:36:
  same.
- State files (shapes only): `daemon.pid` 8 B `3934817` (mtime 10:46:31);
  `daemon.addr` 16 B `127.0.0.1:10086` (mtime 10:46:31); `identity.json`
  36 B mode 600 (mtime 10-03; contents never read). Logs: `daemon.log`
  3591 B mtime 12:46 — unchanged through the death (no shutdown write);
  `daemon.log.prev` 19532 B mtime 10-11 (contents never read).
- Binary pin `71067480bd99c2ba0f6d76df50a17e4911917cec8878320c107105066f8ad35d`
  = round-2 pin → substrate unchanged.

The cycle (observations):
- `ps -p 1573` (old `systemd --user`, the daemon's recorded parent,
  disposition §4) → gone. Current ancestry: shell → kimi → alacritty →
  Hyprland 1203316 (`--watchdog-fd 4`) → start-hyprland → new
  `systemd --user` 1203171 (journal "Queued start job for default target
  Main User Target", 13:11:07.37).
- `coredumpctl`: Hyprland SIGSEGV at 13:11:07 (core "inaccessible"); no
  kimi-webbridge core entry in the whole list.
- `last -x`: old `tty1` session "Tue Oct 13 11:02 – 13:10"; new `tty2`
  login "Wed Oct 14 13:11 still logged in". `loginctl`: sessions 4 (tty2)
  and 5 (manager). Old manager's last journaled actions: chromium scope
  starts through 13:10:34, then silence.
- [Inference, high confidence] The daemon was terminated when the old
  user-manager instance was replaced — it was a child of 1573, the death
  window (13:08:46, 13:20:40) contains the cycle, and no other trace
  exists (no core, no log write). [Unknown] what triggered the cycle (the
  Hyprland SIGSEGV is the nearest recorded event; causality unproven) and
  whether any explicit `stop` also occurred (indistinguishable read-only).

Disposition vs the record:
- `webbridge-daemon-disposition.md` D2 ("operator stop owed", :161) →
  **moot**: nothing is left to stop. D4 remains the procedure before any
  future reuse (recheck `ss`/`/status`; start only per `operations.md:11-13`).
- Disposition U3 (lifespan across session end, :205-206) gains its datum:
  a forced session cycle ended the daemon; no autostart resurrection (no
  listener ≥9 min after the new login). Clean logout/login and reboot
  remain untested.
- The stale-pid-file pattern repeats: new stale `3934817` supersedes the
  round-2 stale `37800` (disposition :76-78) — after a shutdown the
  pointer files keep old values/mtimes until the next start rewrites them.

## 5. Scratch inventory (r1-3 leftovers; archive debt stands)

Groups (files | size | mtime, 13:20:40): tabi3-cdp 202|46M|09:54:26 ·
tabi-audit2-cdp 360|144M|10:26:32 · tabi-a1-r2b-capture 412|6.9M|11:23:39
· tabi-a2-r2b-evidence 3|12K|11:20:36 · tabi-b1-r3b-journey 412|6.8M|12:55:16
· tabi-b1-r3b-scratch 0|0|12:32:54 · tabi-r2-1-capture 414|6.9M|10:49:34 ·
tabi-r2-3-verify 7|56K|10:57:19 · tabi-r2-4-poll 2|8.0K|10:45:22 ·
tabi-r3-1-journey 373|6.6M|11:47:20 · tabi-r3-2-spot 11|48K|11:50:01 ·
tabi-r3-3-anchors 3|12K|11:55:05 · tabi-r3-3-smoke 165|3.2M|11:45:46 ·
tabi-r3-4-work 726|13M|11:47:11 · plus /tmp/tabi-r2-2-* 6 files|24K.

All mtimes ≤ 12:55:16 → no r1-3 scratch dir was written during the
13:06–13:11 window or the 13:11 cycle; the bytes are the same artifact
set the round records pin. Archive debt per cdp-evidence-patterns.md:92
still owed (executor fixture bytes first, G1). Concurrent round-4
scratch: /tmp/tabi-r4-1-network, tabi-r4-2-async, tabi-r4-3-sweep (this
lane's earlier attempt), w4-t4-4-tabi (peer), w4-t4-3-sweep (this sweep)
— out of audit scope.

## 6. Spot-checks

- **SC1 — prior attempt integrity:** `sha256sum -c /tmp/tabi-r4-3-sweep/PINS.txt`
  → 8/8 OK (PINS.txt sha256 `2a76e40f855c00968f9593b7d1081b930d2f650e96049ccf739a918193970748`).
- **SC2 — artifact pins (13:20:40):** r1 screenshot
  `c1ba9588baa833dd33f9378a10f4f0e9a1cb50e06667ddd99b1198fd58c93b6e`;
  r3 methodology `b52074a33876…`/`9509c07f49f9…`/`ecce1c73dc56…`; r2-2
  `b255d1f80d59…`/`869fda13…` — all match their in-note/LOG citations.
- **SC3 — repo pins (13:20:40, pre-append):** all 8 corpus notes =
  committed blobs @094c27a (census `70d1d455ee18`, cdp `599e7d323c48`,
  executor `1262708864db`, approval `70ce826303d0`, live `56224aa88430`,
  journey `67447c028e90`, daemon-note `9240f1d66a8c`, anatomy
  `5e0fbe35feea`); SKILL.md `452bc514d387…` = r3 pin; daemon binary =
  r2 pin. (Round-4 peer appends landed 13:24 — after this pin; in
  flight, out of scope.)
- **SC4 — closure re-measured** at four passes (13:08:33, 13:20:40,
  13:23:05, 13:24:36) — identical verdict for every port.

## 7. Errata (append-only; no other file edited by this lane)

- **E1 — live-state supersession.** The r2/r3 records' "daemon left
  running; operator stop owed (D2)" no longer holds as of 13:20:40 (§4).
  The disposition note's text stands as-of its round; this note is the
  live-state pointer.
- **E2 — line accounting in the r3 record, resolved.** `corpus/README.md:5-7`
  states "1944 lines" and "298" for `executor-test-sufficiency.md`;
  LOG.md:92 and LOG.md:129 repeat "298". On the r3-pinned artifact
  (`1262708864db…`; committed blob @094c27a, 25063 B, last byte `0x2e` —
  no trailing newline): `wc -l` → **297**, 8-note total → **1943**;
  `awk 'END{print NR}'` / `grep -c ''` → 298 (those count the
  unterminated last line). `SKILL.md:41`'s "(297 lines — `wc -l`)" is
  the figure that reproduces; the "298" readings mix count definitions.
  Errata pointer for the integrating seat (outside this lane's write
  scope).
- **E3 — closure-coverage gap closed.** No prior record claimed closure
  for audit-lane ports 19441/19471/19472/19481/19482 or executor port
  9232; all measured closed (§2).

## 8. Evidence files and pins

/tmp/w4-t4-3-sweep/ (this sweep; volatile — sha256 pins, first 12):

| file | lines | sha256 (first 12) |
|---|---|---|
| ports.log | 41 | `426e3ed7e67a` |
| procs.log | 32 | `6a9c8d57befb` |
| daemon.log | 30 | `d4835eb773b7` |
| pins.log | 114 | `1e5f151225ca` |
| forensics.log | 67 | `fe35495e5d2b` |
| strict-ports.txt | 47 | `09eb36591d28` |

Scripts: ports.sh (24), procs.sh (38), daemon.sh (27), pins.sh (60) —
full list + `PINS.txt` in the directory.

/tmp/tabi-r4-3-sweep/ (earlier attempt of this lane; intact): 01–08 files
+ PINS.txt — `sha256sum -c` 8/8 OK.

Reproduce (read-only): `ss -ltnp`; the per-port loop (§1); `ps`/`pgrep`
scans; `curl -s http://127.0.0.1:10086/status` (expect exit 7 while the
daemon is down); `sha256sum -c /tmp/tabi-r4-3-sweep/PINS.txt`;
`git show 094c27a:corpus/knowledge/<note>.md | sha256sum` for the
pre-append pins.

## 9. Unknowns (falsifiable)

- U1. Exact daemon termination mechanism (manager-replacement SIGTERM vs
  an explicit `stop` by any actor) — no core, no log line; not
  distinguishable read-only.
- U2. Trigger of the 13:11 session cycle — Hyprland SIGSEGV at 13:11:07
  is adjacent; causality unproven; outside this lane's scope.
- U3. Whether the r1-3 notes' pre-append bytes stay retrievable after the
  round-4 appends — yes while `094c27a` is in history; the post-append
  worktree is a peer lane's in-flight state.
- U4. Daemon lifespan across a *clean* logout/login and a reboot
  (disposition U3 partially discharged by the forced cycle, §4).
- U5. Whether the `/tmp/org.chromium.Chromium.*` residue (43 dirs) is
  later reclaimed by chromium or the OS tmp policy — not observed; not
  this lane's write scope.
- U6. Peer round-4 lanes' current capture ports (T4-1 network / T4-2
  async) — deliberately not audited here; their cleanup is their own
  round's verification to record.

## 10. Discipline notes

- No kills, stops, restarts, deletions; no writes outside
  `/tmp/w4-t4-3-sweep/` and this file.
- Loopback only: `ss`, refused `curl` probes on `127.0.0.1`, and one
  read-only `/status` GET (refused at all passes after the daemon died);
  no external sites.
- Secrets/session material shape-only: `identity.json` and daemon-log
  sizes/mtimes only — contents never read; the 13:08:46 `/status` sample
  carried no session values (empty id fields).
- Substrates read-only: plugin files, the kaidoku citation target, and
  all corpus notes were read-only to this lane; nothing outside
  `/tmp/w4-t4-3-sweep/` and this file was written.