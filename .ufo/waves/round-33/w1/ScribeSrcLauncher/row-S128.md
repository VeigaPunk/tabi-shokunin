# S128 — registry row draft (seat ScribeSrcLauncher, tabi round 33 w1, C2)

Ready-to-paste registry row (13 `|`-split fields = 11 cells, no `|` inside any cell). Place in
`corpus/SOURCES.md` `## Registry` after S127.

**Paste only the single line inside the fenced block below** — the Gate table further down this
file also starts with the cell `| S128 |` and must not be copied into the registry.

```markdown
| S128 | Arch chromium PKGBUILD and the chromium-launcher v8 it builds at package 154.0.8037.97-1 — https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD | code | A | what the Arch chromium launcher does with chromium-flags.conf and which binary it execs at package 154.0.8037.97-1; not Chromium's own semantics for those flags and not other distros' wrappers | PKGBUILD:13,86,110,328,438,444 at commit 871c2ad960ad54af03579cb90a1c9656485ea598 (ref 154.0.8037.97-1, PKGBUILD sha256 a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be; launcher tarball source line 86, sha256sums line 110 = 213e50f48b67feb4441078d50b0fd431df34323be15be97c55302d3fdac4483a); launcher.c:15,18-29,93-94,124 and Makefile:5,30 at chromium-launcher v8 commit a7ed2cb89fe28c91199524c828866201c9d6b5e5 (launcher.c sha256 b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624; Makefile sha256 1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c) | /usr/bin/chromium is the chromium-launcher v8 binary: it reads /etc/chromium-flags.conf then $XDG_CONFIG_HOME/chromium-flags.conf (else $HOME/.config/chromium-flags.conf), shell-splits each line, and prepends those flags to argv before execv of /usr/lib/chromium/chromium, so a recorded typed command is not the executed command | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md |
```

## Cell rationale

- `id` — S128 (S127 = ChromeDriver session id, S129 = sandbox docs; disjoint).
- `source` — title + one URL. The Arch-authoritative artifact is the packaging recipe at the
  commit that carries the installed `pkgver`; it names the launcher tarball (`:86`), pins its
  sha256 (`:110`), builds it (`:328`), installs it to `$(PREFIX)/bin` (`:438` → `/usr/bin/chromium`)
  and installs the exec target (`:444` → `/usr/lib/chromium/chromium`). The behaviour lines live in
  `launcher.c` at the pinned launcher commit, named in `anchor`.
- `kind` — `code` (build recipe + C source; not `docs`: the flags-file contract has no upstream
  documentation page, only the binary's own `--help` text and source).
- `tier` — `A`, scoped in `scope` to *what the Arch launcher does with chromium-flags.conf at
  154.0.8037.97-1*. It is not tier A for Chromium's flag semantics (that would be S129/Chromium
  docs) nor for other distros.
- `scope` — the mechanism and exec target only. Excluded: what any individual flag means, whether
  the sandbox is on, and non-Arch wrappers.
- `anchor` — `PKGBUILD:13` (`_launcher_ver=8`), `:86` (source URL), `:110` (launcher sha256),
  `:328` (`make -C chromium-launcher-$_launcher_ver`), `:438` (`make PREFIX=/usr DESTDIR=... install`),
  `:444` (`install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"`); `launcher.c:15`
  (`/etc/chromium-flags.conf`), `:18-29` (XDG_CONFIG_HOME / `$HOME/.config` path),
  `:93-94` (system-then-user concatenation), `:124` (`execv(CHROMIUM_BINARY, exec_args)`);
  `Makefile:5` (`CHROMIUM_BINARY = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)`), `:30`
  (installs `$(DESTDIR)$(PREFIX)/bin/$(CHROMIUM_NAME)`).
- `teaches` — the one grounded benefit: for any browser run on this host the *executed* argv is
  launcher output, not the typed command, and the launcher adds a user-writable flag vector plus a
  fixed `/etc` one. This is the fact `SKILL.md:106,452`, `corpus/knowledge/cdp-evidence-patterns.md:18`
  (marked "Inference, strong"), `corpus/knowledge/webmcp-chromium-loopback-round-16.md:35-36` and
  `corpus/knowledge/webdriver-bidi-runtime-round-32.md:163-164` already rely on without a source row.
- `status` — `mined` (row opened this round by this seat's own read-only GETs; the C2 note cites it).
- `opened` / `recheck` — `2026-10-26` / `90d` (packaging recipe changes on release; the launcher
  tarball pin is version-independent, so 90d is the floor, `on-release` would also be defensible).
- `used-by` — `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` (drafted by seat
  ScribeGateV2Note, which names S127, S128, S129 in its `source:` line). **Gate dependency:**
  `scripts/check-sources.mjs` refuses `used_by_missing` (E11) if the note is absent and
  `used_by_uncited` if the note does not contain the literal `S128`; the L1 must land the note and
  the row in the same revision, and the note must contain `S128` (its spec's `source:` line does).

## Gate line for `corpus/lessons/round-33.md` §Gate

| row | URL | accessed | receipt quote (≤25 words, located in the fetched bytes) |
|---|---|---|---|
| S128 | https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD and https://raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c | 2026-10-26T18:26:26Z and 2026-10-26T18:23:50Z (ScribeSrcLauncher; both HTTP 200; PKGBUILD 18,285 B sha256 `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be`, launcher.c 3,546 B sha256 `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624`; launcher.c bytes at tag `v8` identical to the commit fetch) | `launcher.c:26`: "path = g_build_filename(home, \".config\", CHROMIUM_NAME \"-flags.conf\", NULL);" (9 words); `launcher.c:124`: "return execv(CHROMIUM_BINARY, exec_args);" with `Makefile:5`: "CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)" |

Gate prose for the same section:

```
S128 (Arch chromium launcher): opened 2026-10-26 by ScribeSrcLauncher with read-only GETs —
PKGBUILD at ref 154.0.8037.97-1 (commit 871c2ad960ad54af03579cb90a1c9656485ea598; HTTP 200, 18,285 B,
sha256 a6fd458b…, byte-identical at ref name, at commit 0b95e2e and at commit 871c2ad) and
chromium-launcher launcher.c + Makefile at tag v8 = commit a7ed2cb89fe28c91199524c828866201c9d6b5e5
(launcher.c HTTP 200, 3,546 B, sha256 b2772fe0…; Makefile 1,219 B, sha256 1bed55f7…). Host
cross-check: pacman -Qo /usr/bin/chromium → chromium 154.0.8037.97-1; the installed 14,424 B ELF
carries the launcher's own literals (chromium-flags.conf, XDG_CONFIG_HOME, .config,
/usr/lib/chromium/chromium, the help template) and sha256 eaed39c3…a172b, the binary the lane's
round-16/17 receipts already recorded. Scope: what the Arch launcher does, not flag semantics.
```

## Independent confirmation (peer seat's observation, not mine)

Seat `ExecLiveLeg` measured the mechanism after my source pins landed; I did not run these probes:

- `.ufo/waves/round-33/w1/ExecLiveLeg/launcher-probe-full.txt` (sha256
  `0a439bb90edc731c6c9c36b2d57892624e0ef7ebf6656f8d9c203c1345fc577c`) — the complete exec'd argv for
  a launcher-mediated headless launch: `/usr/lib/chromium/chromium` followed by **five** flags-file
  arguments (`--ozone-platform`, `--ozone-platform-hint`, `--enable-features`, `--load-extension`,
  `--disable-features` — one each, `--ozone-platform` then also appearing as Chromium's own headless
  flag) **before** the caller's `--headless=new --no-first-run --disable-gpu --user-data-dir=…`, which
  is `launcher.c:106-107,124` + `Makefile:5` exactly. Values are redacted in that receipt.
- `.ufo/waves/round-33/w1/ExecLiveLeg/sandbox-probe.txt` — a chromedriver session on
  `/usr/lib/chromium/chromium` without `--no-sandbox` reaches HTTP 200 with renderers in a private
  user/net namespace and `Seccomp: 2`, `no-sandbox-in-browser-argv: 0`.

**Why an earlier probe undercounted (resolved, general lesson).** `launcher-probe.txt` (kept
byte-identical, sha256 `38214ace…`, now labelled superseded) listed only `1 --ozone-platform`
because Chromium rewrites its process title into a single space-joined string, so splitting
`/proc/<pid>/cmdline` on NUL yields `argc=1` and silently truncates the injected block; the full
receipt replaces NULs with spaces without splitting. My file-side check agrees with the full
receipt: `~/.config/chromium-flags.conf` has 5 newlines and one `--load-extension`
(`grep -cF`, count 1). Lesson for any lane note: **never count a Chromium process's arguments from
`/proc/<pid>/cmdline` by NUL-splitting**; read the raw bytes and replace NULs with spaces.

## Known limits (stated, not hidden)

1. **Launcher tarball sha256 not re-downloaded.** The PKGBUILD pins the v8 tarball at
   `213e50f4…4483a` (`:110`), but `https://github.com/foutrelis/chromium-launcher/archive/v8/…`
   redirects to `codeload.github.com`, which is outside this seat's allowed host list; the tarball
   bytes were therefore not fetched and that digest is reported as *pinned by the PKGBUILD*, not as
   re-verified here. What *was* verified: `launcher.c` fetched at tag `v8` and at the tag's commit
   are byte-identical (`b2772fe0…`), and the host binary carries that file's help template verbatim.
2. **Which packaging commit built the installed package is not settled by this seat.** Three commits
   (`07d629c`, `0b95e2e`, `871c2ad`) carry `pkgver=154.0.8037.97`; `_launcher_ver=8` and the same
   launcher sha256 appear in all three, the ref `154.0.8037.97-1` and current `main`
   (`156.0.8078.47`, `:13`/`:110`), so the mechanism claim is invariant across them. The installed
   package's build stamp (2026-10-09 07:41:57 -03) is not matched to a commit here.
3. **`--help` was not run.** `launcher.c:98-102` makes `--help` print "Currently detected flags"
   from the real flags file; running it would print the host user's flag file contents, which the
   wave's live-leg rule forbids. Identity was established from binary literals instead.
4. **No claim about flag semantics.** The row does not say what `--ozone-platform` or
   `--load-extension` do; that is not in its scope.
