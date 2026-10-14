# Browser & profile surface census — TABI-2

- Date: 2026-10-14 (commands run 09:50–09:57 -03:00; host: Arch Linux, user `vgpnk`).
- Method: read-only shell census — `command -v`, `pacman -Q`, `ls -la`, `stat`, `du -sh`,
  `find -maxdepth`, `ps`, `ss -ltnp`, `curl -m 2` on loopback. No profile data file
  (Cookies, Login Data, Local State, identity.json, daemon logs) was content-read;
  profiles are reported **shape-only** (kind/mode/size/mtime).
- Substrates outside `tabi-shokunin/` are read-only; this note is the only file written.

Observation / inference / unknown are kept separate (§5). Every claim carries a measured
anchor: `path:line` for files, `command → output` for shell observations.

## 1. Browser inventory

### 1.1 Installed and runnable

| Browser | Binary | Version | Evidence |
|---|---|---|---|
| Chromium | `/usr/bin/chromium` | 152.0.7977.82-1 | `command -v chromium` → `/usr/bin/chromium`; `pacman -Q chromium` → `local/chromium 152.0.7977.82-1`; `chromium --version` → `Chromium 152.0.7977.82 Arch Linux` |

- Default browser: `xdg-settings get default-web-browser` → `chromium.desktop`.
- Install root: `ls -d /usr/lib/chromium` → `/usr/lib/chromium`.
- Second chromium lineage (automation, not system browser): `~/.cache/ms-playwright/`
  contains `chromium-1248`, `chromium_headless_shell-1248`, `ffmpeg-1013`.
- Wayland/user flags in effect: `~/.config/chromium-flags.conf`
  - `:1` `--ozone-platform=wayland`
  - `:2` `--ozone-platform-hint=wayland`
  - `:3` `--enable-features=TouchpadOverscrollHistoryNavigation`
  - `:4` `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`
    (target exists: `~/.local/share/omarchy/default/chromium/extensions/copy-url/`, `ls` observed 2026-10-03 17:42)

### 1.2 Not installed (measured absences, rejections kept)

- Firefox: no `firefox`/`firefox-esr` on PATH; `pacman -Q firefox` → `error: package 'firefox' was not found`.
- Brave: no binary on PATH; `pacman -Q brave-browser` → not found.
- Vivaldi: no binary on PATH; `pacman -Q vivaldi` → not found.
- google-chrome/edge/opera/librewolf/epiphany/qutebrowser: none found via `command -v` sweep of 16 names; `ls -d /opt/google/chrome` → absent (`/opt` holds only: `1Password claude-code containerd intel packages spotify`).
- No flatpak (`flatpak list` → empty) and no snap (`snap list` → empty) package channels observed.

**Rejected claim** (kept per QUALITY.md): "Brave / Google Chrome / Vivaldi are installed
because their config directories exist." Rejected — those dirs contain only a
`NativeMessagingHosts/` shell and the same 1Password manifest; no binary, no package
(§2.4).

## 2. Profile directory shapes (shape-only; no cookie/token contents read)

### 2.1 `~/.config/chromium` — primary live profile tree

Top level (`ls -la`): device/browser-support dirs (`ActorSafetyLists`, `component_crx_cache`,
`Crash Reports`, `Safe Browsing`, …) plus four profile roots:

| Profile dir | Mode | `du -sh` | Key sensitive-file shapes (mode 600, size only) |
|---|---|---|---|
| `Default` | `drwxr-xr-x` | 323M | `Cookies` 229,376 B · `History` 1,867,776 B · `Login Data` 40,960 B · `Preferences` 84,958 B · `Favicons` 720,896 B |
| `Profile 1` | `drwx------` | 28M | `Cookies` 106,496 B |
| `Profile 2` | `drwx------` | 30M | `Cookies` 98,304 B |
| `System Profile` | `drwx------` | (small; 336 B dir entry) | `Preferences` 5,573 B |

- Whole-tree `du -sh ~/.config/chromium` → `287M` — smaller than Default+Profile1+Profile2
  sum (381M) because `du` de-duplicates hardlinked files; both figures are as-measured.
- Latest mtimes at census time: `Default` 2026-10-14 09:32, `Profile 1`/`Profile 2`
  2026-10-14 09:25, `Local State` 09:32 (§5-U1).
- `Local State` (8,620 B, mode 600), `first_party_sets.db` (69,632 B) exist; not content-read.

### 2.2 Extensions installed in `Default` (IDs and names only)

| Extension ID | Identification | Anchor |
|---|---|---|
| `fldmhceldgbpfpkbgopacenieobmligc` | "Kimi" v2.0.23_0 (the WebBridge extension, §3.3) | `.../Extensions/fldmhceldgbpfpkbgopacenieobmligc/2.0.23_0/manifest.json:36` name, `:45` version |
| `aeblfdkhhhdcdjpifhhbdiojplfjncoa` | 1Password `8.12.41.1_0` (matches NMH `allowed_origins` and `/opt/1Password` path) | `.../Extensions/aeblfdkhhhdcdjpifhhbdiojplfjncoa/8.12.41.1_0/manifest.json:89` (localized name `__MSG_extName__`) |

- `Profile 1`/`Profile 2`: `Extensions/` empty (no output from `ls`).
- Preferences strings (grep, names only): `"Kimi Browser Extension — for AI agents. AI can open pages, click, fill forms, extract info, and automate web tasks."` in `Default/Preferences`.

### 2.3 Native messaging hosts

- `~/.config/chromium/NativeMessagingHosts/com.1password.1password.json` (543 B, mode 600,
  mtime 2026-10-13 11:02): `:2` name `com.1password.1password`, `:4` path
  `/opt/1Password/1Password-BrowserSupport`, six `allowed_origins` chrome-extension IDs.
  This is config, not secret material — quoted by field only.

### 2.4 Chrome-family profile shells (dirs that look like installs but are not)

All of these contain **only** `NativeMessagingHosts/com.1password.1password.json` (543 B),
mode 700 dirs, mtimes 2026-10-11 10:26 (dirs) / 10:33 (NMH dirs):

- `~/.config/google-chrome/`, `~/.config/google-chrome-beta/`,
  `~/.config/google-chrome-unstable/` — same NMH shell.
- `~/.config/google-chrome-for-testing/` — only `Crash Reports/` (no NMH).
- `~/.config/BraveSoftware/` — eight variant dirs (`Brave-Browser`, `Brave-Browser-Beta`,
  `Brave-Browser-Development`, `Brave-Browser-Nightly`, `Brave-Origin`, `Brave-Origin-Beta`,
  `Brave-Origin-Development`, `Brave-Origin-Nightly`), each an NMH-only shell.
- `~/.config/vivaldi/` — NMH-only shell.
- `~/.mozilla/` — only `native-messaging-hosts/com.1password.1password.json` (324 B,
  mtime 2026-10-13 11:02); **no Firefox profile directory** (`find ~/.mozilla -maxdepth 3 -type d`
  → only the two dirs above). Firefox never profiled on this host.

### 2.5 Transient / profile-like dirs outside `~/.config`

| Path | Shape | Reading |
|---|---|---|
| `/tmp/r10-01-chromium-profile` | mode 700, 2.1M | persisted artifact of kaidoku round r10-01 CDP work (MINT.md names r10-01) |
| `/tmp/tabi3-cdp` | mode 755, 3.2M, contains `cdp-summary.json`, `cdp-probe.mjs` | sibling probation lane (TABI-3) working state; live chromium, see §4 |
| `/tmp/org.chromium.Chromium.*` (6 dirs) | crashpad temp dirs | chromium runtime litter |

No `*chrome-profile*` / `*chromium-profile*` dirs exist under `~` at find-depth ≤5
(searched `~` and `/tmp`; only the two above matched).

## 3. MCP / browser-automation configs

### 3.1 kimi-webbridge plugin (the lane's primary substrate)

- Installed & enabled: `~/.kimi-code/plugins/installed.json:5-11` —
  id `kimi-webbridge`, root `~/.kimi-code/plugins/managed/kimi-webbridge`,
  source `zip-url`, `enabled: true`, `installedAt 2026-10-03T21:06:32.435Z`.
- Manifest: `~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json:3` name,
  version `1.11.3`; `:20` longDescription — daemon `http://127.0.0.1:10086` drives
  Chrome/Edge "through a browser extension over CDP"; keywords `browser webbridge cdp
  automation web scraping`.
- Skill: `.../skills/kimi-webbridge/SKILL.md:11` — daemon at `http://127.0.0.1:10086`;
  call format `POST /command` with session-scoped JSON (`:42` example).
- Daemon ops reference: `.../skills/kimi-webbridge/references/operations.md:7` — binary at
  `~/.kimi-webbridge/bin/kimi-webbridge`; `:22-23` extension install paths
  (Chrome Web Store id `fldmhceldgbpfpkbgopacenieobmligc` = the installed Kimi extension, §2.2).

### 3.2 MCP servers configured for Kimi Code

- `~/.kimi-code/config.toml:1285-1293`: the **only** `[mcp_servers.*]` block is `rea` —
  `:1286` command `npx`, `:1287` args `["-y", "rea-agents@6.4.0", "mcp"]`,
  `:1290-1292` env `GHIDRA_INSTALL_DIR`, `JAVA_HOME` (paths; no secrets shown).
- No other MCP config files found among common locations (`~/.claude.json` 22 B,
  `~/.config/opencode/opencode.json` 95 B — neither contains mcp section).

### 3.3 WebBridge daemon state at census time (2026-10-14 ~09:54)

- **Not listening**: `ss -ltnp | grep 10086` → no match; `curl -s -m 2 http://127.0.0.1:10086/`
  → exit 7 (connection refused).
- `~/.kimi-webbridge/` shape: `bin/kimi-webbridge` (10,031,288 B, `-rwxr-xr-x`);
  `daemon.pid` = `37800` — `ps -p 37800` → not running; `daemon.addr` = `127.0.0.1:10086`;
  `identity.json` 36 B mode 600 (**shape only, not read**); `logs/daemon.log` 19,532 B
  mtime 2026-10-11 18:39:45, `daemon.log.prev` 2,281 B (logs not content-read).
- No systemd user unit for the daemon (`systemctl --user list-units` grep and
  `~/.config/systemd/user/` → none).

### 3.4 WebMCP

- No WebMCP configuration exists in browser flags (`chromium-flags.conf` §1.1), the
  webbridge plugin tree, or kimi config (`grep -ri webmcp` over those → no matches).
- The only WebMCP surface evidenced on this host is the `rea-agents` CDP tool
  `discover-webmcp-tools` (kaidoku corpus anchors:
  `kaidoku-shokunin/corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md:185,597,608`;
  `.../2026-10-14-r10-02-queue-ops-2.md:3`).
- Native WebMCP support in chromium 152 was not probed (§5-U3).

## 4. Live runtime snapshot (transient — re-check before reuse)

- Headless chromium running at census time: pid 1315427, started 09:53, flags
  `--headless=new --remote-debugging-port=19333 --remote-debugging-address=127.0.0.1
  --user-data-dir=/tmp/tabi3-cdp/profile --no-first-run --disable-gpu --use-angle=swiftshader-webgl about:blank`
  (`ps aux` line; `ss -ltnp` → `127.0.0.1:19333 LISTEN ... pid=1315427`).
- Its crashpad handlers write to `~/.config/chromium/Crash Reports` (ps annotation
  `--database=/home/vgpnk/.config/chromium/Crash Reports`) — headless runs share the
  crash dir with the real profile tree.
- Adjacent pointer (not censused here): `~/.tower/comms/missions/M5-burnerchrome-cdp-host-launcher.md`
  references a prior "burner chrome CDP host launcher" effort.

## 5. Observation / Inference / Unknown

### Observations
O1–O8 are the anchored statements in §1–§4 (each row cites path or command output).

### Inferences (flagged)
- I1: The Chrome-family/Vivaldi/Mozilla config shells (§2.4) were created in one
  1Password BrowserSupport install pass — all dir mtimes 2026-10-11 10:26–10:33 and the
  NMH manifest content is byte-identical across them (543 B). The manifest mtimes
  (10-13 11:02) show it was re-written later. Inference from clustering, not an installer log.
- I2: The `fldmhceldgbpfpkbgopacenieobmligc` "Kimi" extension is the bridge named by
  webbridge `operations.md:22-23` — same extension ID appears in the Web Store URL there.
  The extension→daemon link could **not** be verified live because the daemon is down (§3.3).

### Unknowns
- U1: Which process modified `~/.config/chromium` (`Default` 2026-10-14 09:32) at census
  time — no interactive chromium in `ps` then; sibling lane (TABI-3) used its own
  `/tmp/tabi3-cdp/profile`. Operator activity or another lane is possible; unresolvable
  from this session's evidence.
- U2: Whether Brave/Vivaldi/Google Chrome exist via non-pacman paths (AppImage, manually
  unpacked). PATH sweep + pacman + `/opt` listing are negative, but no full-disk scan was run.
- U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag
  configured and no runtime probe performed in this census.
- U4: Daemon last-health beyond mtime: `daemon.log` deliberately not content-read (may
  carry session material); daemon stopped some time after 2026-10-11 18:39.
- U5: Whether `/tmp/r10-01-chromium-profile` and `/tmp/tabi3-cdp` outlive this probation
  wave (they are the only `chrome-profile`-shaped dirs found; scoped to depth ≤5 under
  `~` and `/tmp`).

## 6. Errata

(Append-only. No corrections yet.)

Appended 2026-10-14 (tabi round 2, lane TABI-R2-3; command transcripts staged
at `/tmp/tabi-r2-3-verify/`, volatile). Entries below supersede the
placeholder above; nothing above is edited. Pre-append sha256 of this file:
`9e4d69dcd65838387bd2077aa5896005c21e5fabfcb635404a4672380df2becc` (= the
`SKILL.md:23-27` pin `9e4d69dcd658` at append time). The post-append hash
necessarily differs — re-derive with `sha256sum` and refresh the pin.

- **[2026-10-14, fresh read] CORRECTED — the `operations.md` cite is off by
  4 lines.** §3.1 (:123-124) and I2 (:178) cite `operations.md:22-23` for the
  extension install paths / the Web Store URL that carries id
  `fldmhceldgbpfpkbgopacenieobmligc`. Actual file (34 lines, sha256
  unchanged): install paths are `:17-19`; the Chrome Web Store URL containing
  the id is `:18`; `:22` is the 中文 help URL and carries no extension id.
  The substance (the id appears in the Web Store URL) holds — the anchors
  were wrong.
- **[2026-10-14, re-run] RE-VERIFIED.** Anchors re-ran clean: chromium
  `152.0.7977.82-1` (`pacman -Q chromium` → `local/chromium
  152.0.7977.82-1`); `xdg-settings get default-web-browser` →
  `chromium.desktop`; `~/.config/chromium-flags.conf` 4 lines; Brave shell =
  `NativeMessagingHosts/` only (§1.2/:40 rejection held); `~/.mozilla/` = NMH
  only, no profile dir; Kimi extension
  `.../fldmhceldgbpfpkbgopacenieobmligc/2.0.23_0/manifest.json:36` name
  `Kimi`, `:45` version `2.0.23`; NMH json `:2`/`:4`; `config.toml:1285-1293`
  rea block; `/opt` = `1Password claude-code containerd intel packages
  spotify`. As-of-capture figures (du, mtimes, `Cookies` sizes, live pids)
  were not re-measured and stay capture-scoped.
- **[2026-10-14, state change] SUPERSEDED AS LIVE STATE — the daemon-down
  reading (§3.3 :136; `NO-LISTENER-10086`) and §4's live chromium snapshot.**
  A doc-authorized `start` at 13:46:31Z by the sibling round-2 seat put pid
  3934817 on `127.0.0.1:10086`, left running
  (`webbridge-daemon-disposition.md` §4/§6); `ss -ltn` at re-verify time
  shows `127.0.0.1:10086` LISTEN, and no chromium process survives. The
  round-1 rows stand as-of-capture; re-measure before reuse (§4's own header
  says re-check).
- **[2026-10-14, re-run] U5 partial status.** `/tmp/tabi3-cdp/` and
  `/tmp/r10-01-chromium-profile/` still exist (the wave-1 audit added
  `/tmp/tabi-audit2-cdp/`, and round 2 added `/tmp/tabi-r2-1-capture/`); U5
  (do they outlive the probation wave?) not yet falsified — the /tmp
  exposure remains.

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Pre-append sha256 of this file:
`70d1d455ee188f8f6ff1759bf6585042b5970dcc7d76af8f755fcc7cecbdf57a`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, fresh re-run] VERIFIED — the round-2 re-runs held.** chromium
  `152.0.7977.82-1` (`pacman -Q` + `--version`); `xdg-settings
  get default-web-browser` → `chromium.desktop`; `~/.config/chromium-flags.conf`
  4 lines; Brave dir = `NativeMessagingHosts` only (fourth consecutive hold);
  `~/.mozilla/` = NMH only; Kimi extension manifest `:36` name `Kimi`, `:45`
  version `2.0.23`; NMH json `:4` `path`, `:6` `allowed_origins`; `/opt` =
  `1Password claude-code containerd intel packages spotify`.
- **[2026-10-14, state change] daemon DOWN (16:21:07Z) — supersedes the
  round-2 LISTEN supersession recorded above.** pid 3934817 gone, port 10086
  closed, `/status` exit 7 (it answered `running:true` at a sibling sweep's
  16:08:33Z probe). Pointer files stale at 10:46:31; cause unmeasured.
- **[2026-10-14, status] U5 grows, still open.** Scratch census now also
  includes round-3 groups (`/tmp/tabi-r3-1-journey`, `-r3-2-spot`,
  `-r3-3-anchors`, `-r3-3-smoke`, `-r3-4-work`, `/tmp/tabi-b1-r3b-*`) and
  round-4 groups (`/tmp/tabi-r4-1-network`, `-r4-2-async`, `-r4-3-sweep`); all
  present at 16:22Z — U5 (do they outlive the wave?) not falsified; every group
  still carries the archive obligation (`cdp-evidence-patterns.md:92`).