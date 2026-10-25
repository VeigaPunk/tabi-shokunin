<!-- corpus entry — tabi-shokunin round 6 (2026-10-14), lane B6-2 (ufo-round-plan-v1; 32-lane wave). Assignment: assess a kimi-webbridge revival per the substrate's own docs — what a local restart requires, whether the extension handshake can be re-established operator-free. This is an ASSESSMENT, not a revival: no daemon was started or stopped, no `/command` POSTed, no `/status` probed (no daemon exists; A3's iff-condition would not be met). Method: read-only probes (`ss`, `pgrep`, `ps`, `ls`, `stat`, `cat` on the pointer files, `sha256sum`, `free`, `uptime`), a first-hand re-read of the plugin's `SKILL.md` / `references/operations.md`, and the lane's prior notes. Loopback only; no external site; secrets/session material shape-only (`identity.json`, daemon logs, `Cookies` never content-read). Write scope: this file only — LOG / coverage row / SKILL distillation are the integrating round's, per precedent. -->
# WebBridge revival assessment (B6-2)

Round 6, 2026-10-14. Measurement window 17:38:40Z–17:42Z (local = UTC−3;
where a source note used local times they are converted, original in
parentheses). Scratch: `/tmp/w6-tabi-b62/` (volatile; pins §8).

**Verdicts (summary).**
- **Restart mechanics: local, doc-specified, no dependencies beyond the
  binary and the loopback port.** Recovery for connection-refused is one
  command (`operations.md:11-14`). Assessed, **not executed** (§4).
- **Handshake: not doc-authorizable operator-free.** The extension↔daemon
  handshake has never been observed up in this corpus, and the docs route
  every extension-side failure to *user* actions (§5).
- **Current enabling state (new this round):** the operator's chromium is
  running with the Kimi extension installed; the daemon side is the only
  missing half — the browser-side precondition for a handshake test
  currently holds for the first time while the daemon is down (§3, §5).
- **This lane performed no revival act** and no write outside this file
  and its scratch namespace (§11).

## 1. Substrate pins + authority map (read-only; re-derived 17:40:47Z)

| file | lines | sha256 (first 12) | vs prior records |
|---|---|---|---|
| `kimi.plugin.json` (version `1.11.3`, :4) | 24 | `e70aff5c40ff` | matches round-1 pin (`webbridge-plugin-anatomy.md:8-14`) |
| `skills/kimi-webbridge/SKILL.md` | 158 | `84a8e69d04c5` | matches round-1 pin |
| `skills/kimi-webbridge/references/operations.md` | 34 | `b811d9c23dfd` | matches round-1 pin |

Unchanged since round 1; this round is the fifth recorded pass (r1
capture, r2, r4, r5, now) with no delta. All line citations below are
stable against these bytes.

The whole revival contract in the substrate, verbatim-equivalent:
- `operations.md:7` — binary `~/.kimi-webbridge/bin/kimi-webbridge`;
  HTTP daemon on `127.0.0.1:10086`; status/PID/logs under `~/.kimi-webbridge/`.
- `operations.md:11-14` — **the recovery step**: daemon not reachable
  (connection refused) → "start it yourself, don't ask the user"; `start`
  is idempotent; concurrent starts converge to a single daemon (single
  binder). Linux command at `:12-13`.
- `operations.md:16` — binary missing → install page (user).
- `operations.md:17-19` — **extension missing / won't connect → user
  actions**: Chrome Web Store (id `fldmhceldgbpfpkbgopacenieobmligc`) or
  the unpacked ZIP fallback. No agent-side reconnect exists in the docs.
- `operations.md:20-22` — still broken after a `start` + retry → help
  page; **no deep troubleshooting**.
- `operations.md:26` — **never run `stop`/`restart`/`uninstall`**; they
  kill the daemon and fight the Kimi Desktop App's own daemon management;
  ask the user. Restated `SKILL.md:151`.
- `operations.md:28-34` — `/status` field docs (5 fields).
- `SKILL.md:11` (endpoint), `:149-151` (failure routing to
  `operations.md` + the same no-stop rule), `:153-158` (version skew →
  tell the user, never reconcile).

## 2. The death, as recorded (measured vs inferred)

Timeline on file (all Z; local = Z−3):
- **13:46:31Z** — round-2 doc-authorized `start`; pid 3934817 listening
  (`webbridge-daemon-disposition.md:89-112`). Not this lane.
- **16:08:46Z** — last measured alive: LISTEN + `/status` sample,
  `running:true`, `uptime_seconds:8532`, `extension_connected:false`
  (`hygiene-sweep-r4.md:97-99`).
- **16:10:59Z (13:10:59 local)** — journal, first-hand read:
  `user@1000.service: Main process exited, code=killed, status=9/KILL`;
  "the kernel OOM killer killed some processes in this unit"; unit peak
  28.5G memory / 34.2G swap; sddm session closed; session/Hyprland
  restarted (`webbridge-daemon-disposition.md:271`).
- **16:20:40Z / 16:21:07Z** — gone: `ps` no process, no listener,
  `/status` exit 7 (`hygiene-sweep-r4.md:100-102`; disposition
  `:249-254`). No core entry; no shutdown write to the log
  (`hygiene-sweep-r4.md:106-107`).
- **17:07Z** (round-5 refresh) and **17:38:40Z–17:42Z** (this lane) —
  still down (§3).

Epistemic split, kept as recorded: [observation] the daemon died **inside
the OOM-teardown window** of the user session; [inference, carried] it was
terminated with the session cycle (it was a child of the then-current
`systemd --user`; `hygiene-sweep-r4.md:123-128`); **per-process victim
attribution is not measured** — no per-process OOM line exists
(`journalctl -k`), so "died to OOM" is the environment-level reading, not
a victim measurement. Nothing has resurrected it: no systemd unit, no
autostart entry (disposition `:87`; re-checked this lane:
`~/.config/systemd/user/` has no webbridge unit).

## 3. Current measured state (this lane; 17:38:40Z, 17:40:47Z, 17:42Z)

- **Daemon — down.** `ss -ltn | grep 10086` → no listener (two samples);
  `pgrep -x kimi-webbridge` → none; full `ss -ltn` shows only system
  services. No `/status` probe attempted (no daemon; A3's iff-condition —
  "only a daemon this task itself started" — is unmet).
- **Pointers — stale, the known post-shutdown pattern.** `daemon.pid` 8 B
  `3934817`; `daemon.addr` 16 B `127.0.0.1:10086`; both mtime 13:46:31Z
  (the r2 start's write) — after a kill they keep the old values until the
  next `start` rewrites them (disposition U5).
- **Binary — present, unchanged.** 10,031,288 B, mode 755, sha256
  `71067480bd99c2ba0f6d76df50a17e4911917cec8878320c107105066f8ad35d`
  = the r2 §8 pin → deploy bytes unchanged across the death.
- **Install-root shapes (never content-read):** `identity.json` 36 B mode
  600; `logs/daemon.log` 3,591 B (mtime 15:46Z), `daemon.log.prev` 19,532 B
  (mtime 2026-10-11 18:39 local). Contents of both logs and
  `identity.json` stay unread (may carry user page URLs; PROVINCE secrets
  rule).
- **Browser — live, first time in a daemon-down window.** chromium pid
  2552209 (ppid 1203474), started **17:23:16Z**, cmdline
  `--ozone-platform=wayland --ozone-platform-hint=wayland
  --enable-features=TouchpadOverscrollHistoryNavigation
  --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`
  — default profile, no `--user-data-dir`, no `--remote-debugging-port`.
  [inference, high] the operator's interactive browser, not a lane harness
  (default profile + exactly the flags from `~/.config/chromium-flags.conf`
  + the omarchy extension, `browser-surface-census.md:25-30`; tabi
  harnesses always carry their own profile dir, e.g.
  `hygiene-sweep-r4.md:56-61`). Two renderer processes carry
  `--extension-process` in argv (pids 2552375/2552377) — extension
  machinery active, but that signal does not identify *which* extension.
- **Extension — installed.** `~/.config/chromium/Default/Extensions/fldmhceldgbpfpkbgopacenieobmligc/2.0.23_0/`
  (dir mtimes 2026-10-10 17:14/17:20 local). Declarative manifest rows
  (read at key level only, no code): `:5-6` `background.service_worker =
  background.js`; `:27` `host_permissions ["<all_urls>"]`; `:35`
  `manifest_version 3`; `:36` name `Kimi`; `:40` permissions include
  `debugger`, `tabGroups`, `alarms`, `webNavigation`; `:45` `version
  "2.0.23"`. Same id/version as the docs' Web Store URL
  (`operations.md:18`) and the r1 census (`browser-surface-census.md:69`).
- **No Kimi Desktop App identified:** the only `kimi`-named processes (2)
  resolve to `/home/vgpnk/.kimi-code/bin/kimi` (the Kimi Code CLI);
  `/opt` holds no Kimi install; no webbridge unit/autostart. So
  `operations.md:26`'s Desktop-App conflict has no measured actor on this
  host (within this check's scope).
- **Headroom (17:39:31Z, one sample):** 30 GiB total / **19 GiB
  available**; swap 34 GiB with 2.2 GiB used; load 4.75 (32-lane wave in
  flight). The fatal event's unit peak (28.5G/34.2G) is context, not a
  prediction — one sample, not a trend.
- **Socket sample (weak negative):** one `ss -tanp | grep 10086` → no
  socket. Refused connects are microsecond-lived, so this cannot settle
  whether the extension currently retries (see §5).

## 4. What a local restart requires — operator checklist (assessed; NOT executed)

Preconditions, all measured present at 17:40Z unless stated:
1. Binary present and executable — yes (§3).
2. Port 10086 free — yes; no other listener; no Desktop-App daemon
   identified.
3. No configuration needed: no `config.json` in the install root; default
   addr; no systemd unit; no autostart (disposition `:87` + this lane).
   No `sudo`, no external network, no external site.

Command (the doc line, `operations.md:12-13`):
`~/.kimi-webbridge/bin/kimi-webbridge start` — **`start`, never
`restart`** (`:26` forbids agent-run restart even with the daemon dead;
with nothing running, `start` is the documented recovery and is
idempotent).

Effects to expect (measured on the round-2 run; disposition §4):
- spawns `… run --addr 127.0.0.1:10086`; survives the spawning shell as a
  session-manager child (no unit — dies with a session event, §2);
- rewrites `daemon.pid` (`37800 → 3934817` observed then) and
  `daemon.addr`;
- rotates logs: current `daemon.log` → `.prev`, fresh log created — the
  present `daemon.log.prev` generation (19,532 B) would be replaced
  (contents never read here; recorded as a side effect, not a loss this
  lane can judge);
- prints `Kimi Browser Extension daemon started (pid N) on 127.0.0.1:10086`.

Verification after a start: `ss -ltnp | grep 10086` → LISTEN;
`curl -s http://127.0.0.1:10086/status` → JSON with `running:true`,
`version`, `uptime_seconds` (+ the extension fields, §5).

Constraints and standing debts:
- The docs authorize an agent's `start` (A1 in
  `interaction-approval-table.md:135`) **but** this wave assigns revival
  to the operator — a scope decision, not a doc reading; this note takes
  no third reading on the A1 tension (§6).
- A revived daemon recreates the **A4 debt**: only the operator may stop
  it (`operations.md:26`). The round-2 instance's stop was owed until the
  OOM killed it (disposition D2/§10).
- Revival does **not** address OOM durability: with no unit and no
  autostart, a similar session event kills it again (the r2 instance died
  by exactly this path, §2) — [inference].
- Do not improvise `upgrade` / `install-skill` / config edits: not needed
  for a revival; the docs never connect them to it.

## 5. The extension handshake — can it be re-established operator-free?

What it is: a WebSocket client — the browser extension — attached to the
loopback daemon; observable as `/status.extension_connected` +
`extension_id` (`operations.md:32-33`). "Operator-free" here = executable
by the agent (or any local process) with no user action.

Corpus history: **the handshake has never been observed up.** Every
`/status` sample on record carries `extension_connected:false` /
`extension_id:""` — three in round 2 (no browser running;
`webbridge-daemon-disposition.md:128-134`) and one at 16:08:46Z
(`hygiene-sweep-r4.md:97-99`). The frontier entry says it plainly ("the
handshake is not [held]"; `corpus/README.md:30-34`), and the approval
packet lists it among honest gaps (`operator-approval-request.md:86`).

Docs: the *only* documented remedies for extension trouble are user
actions — installation paths (`operations.md:17-19`) and the help page
(`:20-22`, no deep troubleshooting). No agent-side reconnect procedure
exists in the substrate docs. **Per its own docs, handshake
re-establishment is not operator-free; it is routed to the user.**

The open question (disposition U2, round 2): does the extension
auto-attach when a daemon appears while the browser is already running?
Not documented; never measured — round 2 had no browser, and the r4
window's browser died with the session before any daemon returned. As of
this round the *browser side is live* (§3), so the experiment is enabled;
it is a revival act, hence deferred here.

Decisive experiment (for an operator-scoped execution): `start` the
daemon while the browser runs; sample `/status` at t≈0, +30 s, +5 min.
- Falsifier: `extension_connected:false` at +5 min with the browser
  running ⇒ the auto-attach reading is false for this configuration
  (extension `2.0.23` vs daemon as-revived; re-check `version` at revive
  time).
- Positive result discharges U2 and makes handshake revival
  operator-free **in effect** for this configuration.
- If negative: the docs' user paths (`:17-22`) are the only named route;
  no deep troubleshooting.

Version state: extension `2.0.23` (`:45`); daemon last reported
`v2.0.23` (disposition §5); plugin bundle `1.11.3` (manifest `:4` —
separate versioning, disposition U6). No mismatch signal; the A7 class
(tell the user, never reconcile) is not currently indicated.

Side-effect unknowns: whether a reconnect is user-visible (badge /
sidepanel / notification) — unmeasured; whether an attached extension is
inert absent commands — [inference] yes by the tool-call model
(`/command` POSTs drive it), unverified.

## 6. Cross-note findings (for the scribe; append-only — nothing edited here)

- **Field-count finding — the "8-field `/status`" figure undercounts.**
  The recorded samples (`webbridge-daemon-disposition.md:129-131`;
  `hygiene-sweep-r4.md:98`) carry **9 keys** (mechanically counted, §7
  SC3), and the disposition note's own delta line reads "5 documented …
  adds `extension_version`, `port`, `skills`, `tab_id_arg`" — implying 9.
  The "8-field" shorthand appears in five places (disposition `:137` and
  `:247`; approval table `:137`; hygiene sweep `:99`; anatomy `:282`).
  No live re-probe is possible this round (daemon down; A3 iff unmet).
  Flagged for errata by the owning editor — not repaired here.
- **Pin re-verification:** substrate trio + daemon binary re-derived, no
  delta (§1, §3).
- **A1 tension remains on record, unreconciled:** the anatomy's
  operator-scoped reading (`webbridge-plugin-anatomy.md:261-265`) vs the
  r2 plan/disposition's agent-authorized reading (disposition §2; approval
  table `:205-206`). This note adds no third reading; it records that this
  wave's operator-owned framing is a scope decision layered on the docs.
- **Round-6 plan linkage:** the bridge precondition is "daemon up +
  `extension_connected:true`" (`plans/round-6.plan.md:55-60`). This
  assessment: the daemon half is mechanically cheap and local; the
  handshake half is the unproven one — and its outcome is exactly the U2
  experiment (§5).

## 7. Spot-checks (re-runnable; executed 17:41–17:42Z)

- **SC1 — pins:** `sha256sum` over the plugin trio + daemon binary → the
  four hashes equal §1/§3. (Ran; match.)
- **SC2 — live state:** `ss -ltn | grep 10086` → no listener;
  `pgrep -x kimi-webbridge` → none; `cat ~/.kimi-webbridge/daemon.pid` →
  `3934817` (stale). (Ran; as stated.)
- **SC3 — field count:** `python3` count over the §5 sample string → 9
  keys (`/tmp/w6-tabi-b62/05-status-count.txt`). (Ran; 9.)
- **SC4 — plan cite:** `grep -n 'extension_connected:true'
  plans/round-6.plan.md` → `:58`. (Ran; matches §6.)

## 8. Evidence anchors (/tmp/w6-tabi-b62/ — volatile; pins first-12)

| file | lines | sha256 (first 12) |
|---|---|---|
| `01-live-state.txt` | 35 | `188507399110` |
| `02-substrate-pins.txt` | 8 | `dad32fe7df67` |
| `03-browser-extension.txt` | 20 | `3f8607859882` |
| `04-headroom.txt` | 7 | `8544c63d4d05` |
| `05-status-count.txt` | 16 | `20d9f149a08e` |

Reproduce (read-only): `date -u`; `ss -ltn | grep 10086`;
`pgrep -x kimi-webbridge`; `ls -la ~/.kimi-webbridge/ ~/.kimi-webbridge/logs/`;
`sha256sum ~/.kimi-webbridge/bin/kimi-webbridge`; `ps -eo pid,ppid,etime,comm,args | grep chromium`;
`free -h`; `uptime`.

## 9. Unknowns (falsifiable)

- **U1 (carried from disposition U2, still open).** Whether the extension
  auto-attaches when a daemon appears while the browser runs; window and
  reliability. Test + falsifier in §5. Not resolvable without a revival
  act (operator-scoped).
- **U2.** Whether a successful handshake is user-visible or otherwise
  side-effecting; whether an attached extension is inert absent commands.
- **U3.** Whether the extension made connection retries during the down
  window — sampling cannot see microsecond-refused connects; only a
  listener-side test settles it (also §5).
- **U4.** The live `/status` field count and the semantics of `skills` /
  `tab_id_arg` (disposition U1) — deferred; record the as-is shape on the
  next live probe, including the §6 finding's resolution.
- **U5.** Daemon durability across session/OOM events (no unit/no
  autostart; one forced-cycle datum; disposition U3/U4 largely carried).
- **U6.** Whether an operator-side revival happens at all this wave; not
  assumed (the plan's branch structure does not depend on it for loopback
  work).

## 10. Errata (append-only — never edit above; append dated blocks below)

- (none yet)

## 11. Discipline notes

- **No revival act and no state mutation:** no `start`/`stop`/`restart`,
  no daemon-binary run, no `/command` POST, no `/status` probe; no writes
  outside `/tmp/w6-tabi-b62/` and this note. Substrates read-only (plugin
  tree, browser profile, `~/.kimi-webbridge/`).
- **No external site**; loopback-only probes (`ss`, `pgrep`, `ps`, `ls`,
  `stat`, `sha256sum`, `free`, `uptime`; `cat` on the two pointer files,
  which are not secrets).
- **Secrets/session material shape-only:** `identity.json`, `daemon.log*`,
  `Cookies`, `Login Data` never content-read; the extension manifest was
  read at declarative-key level only (no code inspected).
- **Observation / inference / unknown kept separate throughout**; the
  assignment's "died to OOM" shorthand is read precisely in §2 (the
  per-process victim attribution stays inference, as round 4 recorded).
- Freshness note: every live row is 2026-10-14T17:38–17:42Z; a later
  stable state supersedes it and should land as append-only errata.
