# WebBridge daemon disposition (TABI-R2-2)

Round: tabi round 2, 2026-10-14. Assignment: read the kimi-webbridge
plugin's own daemon-lifecycle docs; attempt only a doc-authorized local
start of the daemon on a scratch basis (no system-level changes); probe
`127.0.0.1:10086/status` if and only if a daemon started by this lane is
listening; otherwise record an honest blocker row with the exact unblock
action (`plans/round-2.plan.md:10-11`).

Scratch namespace: `/tmp/tabi-r2-2-*` (6 files, 173 lines; sha256s in §8).
Substrate files were read-only; the only writes outside scratch are the
daemon's own state files under `~/.kimi-webbridge/` (§6).

**Verdict (summary):**
- Start: **locally authorized by the substrate's own docs and executed
  successfully** — pid 3934817 listening on `127.0.0.1:10086` (§4).
- Stop / return-to-baseline: **blocked for the agent** — the docs forbid
  agent-run `stop`/`restart`/`uninstall`; operator action required (§6).
  The daemon started by this lane is therefore **left running**.
- `/status`: probed (iff-condition met); extension disconnected, daemon
  inert w.r.t. the user's browser at probe time (§5).

## 1. Substrate pins (read-only; hashes verified 2026-10-14)

| File | Lines | Bytes | sha256 (first 12) |
|---|---|---|---|
| `skills/kimi-webbridge/SKILL.md` | 158 | 11880 | `84a8e69d04c5` |
| `skills/kimi-webbridge/references/operations.md` | 34 | 2422 | `b811d9c23dfd` |
| `kimi.plugin.json` (manifest; `"version": "1.11.3"`, :3) | 24 | 1273 | — (not hashed) |

Both hashes match the round-1 pins
(`corpus/knowledge/webbridge-plugin-anatomy.md:13-14`) → substrate
unchanged since round 1; all line citations below are stable.

Authority lines (the whole daemon-lifecycle contract in the substrate):
- `operations.md:7` — binary `~/.kimi-webbridge/bin/kimi-webbridge`;
  serves `127.0.0.1:10086`; status/PID/logs under `~/.kimi-webbridge/`.
- `operations.md:11-13` — **start is authorized**: "Daemon not reachable
  (connection refused) → start it yourself, don't ask the user. `start`
  is idempotent: it no-ops if the daemon is already up, and concurrent
  starts converge to a single daemon". Linux command:
  `~/.kimi-webbridge/bin/kimi-webbridge start`.
- `operations.md:26` — **stop is forbidden to the agent**: "Never run
  `stop` / `restart` / `uninstall` on your own. They kill the running
  daemon; ... ask the user to do it themselves."
- `SKILL.md:11` — daemon endpoint `http://127.0.0.1:10086`;
  `SKILL.md:151` — same prohibition restated: "never stop, restart, or
  uninstall the daemon automatically".

## 2. Authority analysis (doc-grounded)

- **Authorized, local-only, no system change:** run `start` (idempotent;
  single-binder convergence). The install root has **no `config.json`**
  (measured, §3), so `start` used the default addr; no `sudo`, no
  systemd unit, no config edits are involved.
- **Not authorized:** `stop` / `restart` / `uninstall` (agent).
- **Not addressed by the docs:** what happens to a daemon an *agent*
  started — no TTL, no cleanup rule, no scratch mode. `start --foreground`
  ("run in foreground (for dev/debug)") and `start --addr <addr>`
  ("Listen address for this run only (not saved)") exist as CLI surfaces
  (§4) but the docs never connect them to a disposable-agent-daemon
  pattern. Recorded as a calibration gap, not a rule violation.
- **Reading history (shape):** round-1 anatomy read the start
  authorization as operator-scoped — "an exception to pure read-only
  posture for the *operator*, not for corpus builders. This note did not
  start anything" (`webbridge-plugin-anatomy.md:136-138`). Round-2's plan
  (`:10-11`) revisits that reading and directs a doc-authorized start
  attempt; this lane executed under the plan's authority. Both readings
  stay on record; flagged for the round scribe, not reconciled here.

## 3. Pre-run state (measured; /tmp/tabi-r2-2-baseline.txt, 13:45:49Z)

- `ss -ltn | grep :10086` → **NO-LISTENER-10086**; `pgrep -x
  kimi-webbridge` → no process. (Round-1 census agrees:
  `browser-surface-census.md:134-143`.)
- Stale pointers: `daemon.pid` = `37800` (6 B, mtime 2026-10-11 10:39;
  round 1 confirmed the pid was dead, `anatomy:147-148`); `daemon.addr`
  = `127.0.0.1:10086` (16 B, mtime 2026-10-11 10:39).
- `identity.json` — 36 B, mode 600: **shape only, not read** (PROVINCE
  secrets rule; same treatment as round 1 `anatomy:154-156`).
- `logs/` — `daemon.log` 19,532 B mtime 2026-10-11 18:39;
  `daemon.log.prev` 2,281 B mtime 2026-10-11 10:39. **Shapes only;
  contents never read** (may hold user page URLs).
- Binary: `bin/kimi-webbridge`, 10,031,288 B, ELF x86-64 static,
  stripped, BuildID `c5b012564e14e6d4e9a95b0df4668654c3106fb3`,
  sha256 `71067480bd99c2ba0f6d76df50a17e4911917cec8878320c107105066f8ad35d`.
- No `config.json` / no systemd user unit / no autostart entry for kimi.

## 4. Start attempt (measured; /tmp/tabi-r2-2-start.log, 13:46:31Z)

Executed per `operations.md:11-13`:
```
$ ~/.kimi-webbridge/bin/kimi-webbridge start
Kimi Browser Extension daemon started (pid 3934817) on 127.0.0.1:10086
start_exit=0
```
Verification (same call, plus a fresh shell ~2 min later —
/tmp/tabi-r2-2-status-2.txt, /tmp/tabi-r2-2-final-state.txt):
- `ss -ltnp` → `LISTEN ... 127.0.0.1:10086 users:(("kimi-webbridge",
  pid=3934817,fd=5))` (seen in 3 separate shells; persists).
- Process cmdline: `.../kimi-webbridge run --addr 127.0.0.1:10086`.
- `daemon.pid` rewritten `37800` → `3934817` (6 B → 8 B, mtime 10-14
  10:46); `daemon.addr` rewritten (content unchanged, mtime 10-14 10:46).
- Log rotation at start (shapes only): previous `daemon.log` (19,532 B)
  became `daemon.log.prev`; fresh `daemon.log` 2,281 B, mtime 10-14
  10:46. Contents not read.
- Persistence: process survived the spawning shells. `ps -p 3934817` →
  PPID `1573` = `/usr/lib/systemd/systemd --user` (session manager);
  still **no systemd unit** and **no autostart entry** (autostart names
  observed: OnePassword, Fcitx5, walker). [Inference] lifetime is bounded
  by the user session; not auto-restarted at login. Confidence: medium —
  a logout/reboot cycle was not run.

CLI inventory (`--help`, /tmp/tabi-r2-2-cli-help.txt; exit 0): commands
`completion help install-skill logs restart start status stop uninstall
upgrade`; self-described "Kimi Browser Extension daemon and toolkit
(formerly Kimi WebBridge)". Relevant flags for future scratch work:
`start --foreground` (dev/debug) and `start --addr` (run-only, not
saved; warns that `0.0.0.0:<port>` exposes the daemon on all interfaces —
security risk).

## 5. `/status` probe (measured; iff-condition met)

Condition per assignment: pre-state had no listener and no process, and
the listening daemon is the one this lane started at 13:46:31Z → probe
allowed. Samples (verbatim):
```json
# 13:46:36Z (uptime 2)
{"extension_connected":false,"extension_id":"","extension_version":"","port":10086,"running":true,"skills":[],"tab_id_arg":true,"uptime_seconds":2,"version":"v2.0.23"}
# 13:48:42Z  → same, uptime_seconds:127
# 13:50:26Z  → same, uptime_seconds:231
```
- `extension_connected:false` and `extension_id:""` in all samples —
  **no value was ever present to read**; nothing session-shaped captured.
- Field delta vs the 5 fields the docs list (`operations.md:28-34`:
  running, version, extension_connected, extension_id, uptime_seconds):
  observed response has 8 — adds `extension_version`, `port`, `skills`,
  `tab_id_arg`. Semantics of `skills` (observed `[]`) and `tab_id_arg`
  (observed `true`) are [Unknown] (U1).
- Version lattice (observed): daemon reports `version:"v2.0.23"`; plugin
  bundle is `1.11.3` (`kimi.plugin.json:3`); the installed extension was
  `2.0.23_0` in round 1 (`browser-surface-census.md:69`). Daemon and
  extension share the `2.0.23` number; bundle versioning is separate.
  Not reconciled (U6).
- Inertness: the only browser-family process observed was
  `chrome_crashpad` (no browser main process). [Inference] the extension
  is disconnected because no compatible browser is running; with no
  extension attached the daemon cannot drive the user's browser and has
  no user-visible effect. Confidence: high on "no browser main process",
  medium on the causal reading.
- `/command` auth: docs show no auth material in calls
  (`SKILL.md:42-44`); **not probed** — no command was ever POSTed (that
  would drive a browser and is outside this assignment). Loopback-only
  binding is the observed security boundary (§4 warning).

## 6. Disposition rows (honest blockers + exact unblock actions)

| # | Question | Disposition | Exact action |
|---|---|---|---|
| D1 | May this lane start the daemon locally? | **Yes — authorized** (`operations.md:11-13`), executed, verified | none needed |
| D2 | May this lane stop it / return to baseline? | **No — blocked** (`operations.md:26`, `SKILL.md:151`; stop/restart/uninstall are never agent-run) | **Operator** runs `~/.kimi-webbridge/bin/kimi-webbridge stop` by hand (or manages it via the Kimi Desktop App); the agent must not do this |
| D3 | Can webbridge drive the browser now? | **No — extension disconnected** (`extension_connected:false`); a condition, not an operator-authority blocker | Operator uses a supported browser with the WebBridge extension enabled; nothing else needed (auto-connect unverified, U2) |
| D4 | Before a future round reuses this? | Recheck live state first — process may be gone after logout (no unit, no autostart) | `ss -ltnp | grep 10086` then `curl -s http://127.0.0.1:10086/status` |

**State change introduced by this lane (not reverted):** daemon pid
3934817 left running, listening `127.0.0.1:10086`, extension
disconnected; `daemon.pid`/`daemon.addr` updated and `logs/daemon.log`
rotated by the daemon itself (old log preserved as `.prev`). Return to
the pre-round state requires D2's operator action.

## 7. Proposed (untested) future pattern — flagged, not executed

`start --foreground --addr 127.0.0.1:<scratch-port>` would create a
run-only daemon on a non-default port that the agent could own as a
foreground child and end without invoking the forbidden `stop` command.
Not tested this round: the assignment authorized **one** doc-standard
start, and whether ending an agent-spawned foreground dev instance falls
inside the spirit of the stop prohibition is a round/operator decision.
Candidate for a later round with explicit scope.

## 8. Evidence files (scratch; volatile — pins recorded here)

| File | Lines | sha256 |
|---|---|---|
| `/tmp/tabi-r2-2-baseline.txt` | 31 | `b255d1f80d59d4ea7a8119f4010002918a451f3ca7c4562be416802216d03902` |
| `/tmp/tabi-r2-2-cli-help.txt` | 47 | `931d48d84d26477065dfe969a6b1e0c8e1c4a3409fa4dbe8ab5a8d3e316f5140` |
| `/tmp/tabi-r2-2-start.log` | 32 | `869fda1350005f8b41381281202b0d827163cc4e30ea25938452e8e8d49424e1` |
| `/tmp/tabi-r2-2-poststart.txt` | 10 | `bb81e7d884c814d1996c9f415d9ee2695cc132805e7bb1faacc71df31b8003b8` |
| `/tmp/tabi-r2-2-status-2.txt` | 21 | `d74795b70fe39ba50f73378a18c6b0e23bc9c1a92370d276a8a74305da328c6f` |
| `/tmp/tabi-r2-2-final-state.txt` | 32 | `7c508bdbe3c922e47cd7416f132f1045473f2755a54606e4d64f8f73f82038b1` |

Check sequence to reproduce: (1) baseline — `ss -ltn | grep :10086`,
`pgrep -x kimi-webbridge`, `ls -la ~/.kimi-webbridge/ ~/.kimi-webbridge/logs/`,
`sha256sum ~/.kimi-webbridge/bin/kimi-webbridge`; (2)
`~/.kimi-webbridge/bin/kimi-webbridge start`; (3) `ss -ltnp | grep :10086`,
`curl -s http://127.0.0.1:10086/status`.

## 9. Unknowns (falsifiable, for later rounds)

- U1. Semantics of `tab_id_arg` (observed `true`) and `skills`
  (observed `[]`) in `/status`.
- U2. Whether the extension auto-connects when a browser starts later
  while this daemon is already listening (not testable now: no browser;
  per browser-surface census the extension exists in a profile).
- U3. Daemon lifespan across logout/reboot (no unit, no autostart; a
  session-manager child observed — but no login-cycle test was run).
- U4. Log rotation policy/retention (only two generations observed;
  the fresh log's 2,281 B is exactly the old `.prev` size — unexplained;
  contents not read).
- U5. Whether the previous daemon (pid 37800, stale) was stopped by
  crash/kill/uninstall — the trace is identical for all
  (`anatomy:174-178` I1); this round adds a datum: after an ordinary
  shutdown the pointer files keep old mtimes until the next `start`
  rewrites them (observed: 37800 → 3934817, 10-14 10:46).
- U6. Version reconciliation between bundle `1.11.3` and daemon/extension
  `2.0.23` (`SKILL.md:153-158` covers extension-only mismatch text; no
  daemon version check is documented).
- U7. `/command` auth requirements (not probed by design, §5).

## 10. Errata (append-only; no other file edited by this lane)

- Round-1 `anatomy:168` O4 ("daemon not running") was true at census
  time (09:54) and is **superseded as live state** by this round's start
  (§4); the anatomy text itself is unchanged and time-stamped to census.
- Cross-ref candidates for the round scribe: the `anatomy:136-138`
  scope-note reading vs `plans/round-2.plan.md:10-11` (§2); O4/I1 are
  now discharged with a measured start/shutdown trace (§4, U5).

## 11. Discipline notes

- No external sites touched; no network calls beyond loopback
  `127.0.0.1:10086` (`/status` only).
- Secrets/session material: `identity.json` and `logs/` contents never
  read (shape only); `/status` exposed no extension id (empty at all
  samples).
- Substrate read-only: plugin files unmodified; the only on-disk changes
  are the daemon's own state files under `~/.kimi-webbridge/` (§6).

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Pre-append sha256 of this file:
`9240f1d66a8ca5b5dd7c16c1c7f932f22d3921c3c0dd38483f09aaefd9bf8eec`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, state change] DOWN — the running state this note recorded is
  superseded.** Same host/day timeline: 16:08:33Z (sibling read-only sweep)
  `ss -ltnp` → `127.0.0.1:10086` LISTEN pid 3934817, `/status` → the 8-field
  shape (`running:true`, `uptime_seconds:8532`, `extension_connected:false`).
  16:21:07Z (this lane): `ps -p 3934817` → gone; no listener on 10086; `curl
  /status` → exit 7. Pointer files present, stale (`daemon.pid` 8 B,
  `daemon.addr` 16 B, mtime 10:46:31 — the U5 pattern for a shutdown that was
  not followed by a `start`); `logs/` shapes only: `daemon.log` 3,591 B mtime
  12:46, `.prev` 19,532 B (never content-read). Cause unmeasured — if the
  operator ran the owed `stop` (D2/A4), that discharges the baseline row; no
  in-repo record of who or when.
- **[2026-10-14, fresh re-run] VERIFIED — §8 pins re-held.** 6 files / 173
  lines; `b255d1f80d59…3902` (baseline), `869fda135000…24e1` (start.log);
  binary `sha256sum` → `71067480bd99…d35d` (= `:86`). Cross-lane calibration:
  a sibling sweep's scratch line ("start b869fda1… hmm") transposes this pin;
  the §8 value is the one on disk.
- **[2026-10-14, §5 note] `/status` unreachable now** — the iff-condition
  (daemon this task started) governs; no probe was attempted beyond the single
  refusal check.

Appended 2026-10-14 (tabi round 4, lane ERR-B, second block — same sweep;
environment-event context (OOM teardown) routed here; transcript
`/tmp/w4-erb-b-sweep/17-env-event.txt`, proof `/tmp/w4-erb-b-append-proof/`).
Nothing above is edited. Pre-append sha256 of this file:
`a3abb49b22846246e24d163f02828852a39c40163b018cf70fa139c5371c8deb`.

- **[2026-10-14, environment context — refines the "cause unmeasured" line above] OOM-teardown event, first-hand journal read.** Journal window 13:10:59 local (= 16:10:59Z): `user@1000.service: Main process exited, code=killed, status=9/KILL`; `user-1000.slice: The kernel OOM killer killed some processes in this unit`; unit consumed 28.5G memory peak / 34.2G swap peak; sddm session closed (`sddm-helper exited with 9`), session/Hyprland restarted. `coredumpctl` since 13:00 shows a godot/love SIGABRT stream 13:03–13:06 (other lanes' binaries — attribution by name only). Per-process victim list: **unknown** (`journalctl -k | grep -i oom` has no per-process line for this event). The daemon's death is *consistent with* the teardown (alive 13:08:46 → gone by 13:26; SIGKILL leaves no shutdown bytes — matches the stale pid file and unchanged `daemon.log` shape), so victim attribution stays **inference**, not measurement (independently recorded by the round-4 scribe-prep draft, `plans/round-4-record-draft.md` §3 O1–O5/I1). Restart authority unchanged, unexercised; pid file stale again (round-2 pre-state pattern). Transcript: `/tmp/w4-erb-b-sweep/17-env-event.txt`.

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `03af1fb0693ed15894554278a2cc750d8a25a191bf1873f4dd3efd832343204c`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §8 six evidence files + daemon binary re-derived; file pin held.** `b255d1f80d59…3902` / `931d48d84d26…5140` / `869fda135000…24e1` / `bb81e7d884c8…03b8` / `d74795b70fe3…8c6f` / `7c508bdbe3c9…38b1` all match §8; `sha256sum ~/.kimi-webbridge/bin/kimi-webbridge` → `71067480bd99…d35d` (= `:86`). No listener on 10086 at 17:07Z (`ss -ltn`; read-only — the `/status` probe stays A3-gated, this lane started no daemon), so the 16:21:07Z down record stands. This note's hash → `03af1fb0693e…`. Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).