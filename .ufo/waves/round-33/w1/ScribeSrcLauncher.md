# ScribeSrcLauncher — C2 source row S128 (tabi round 33, w1)

**Verdict.** `/usr/bin/chromium` on Arch is not Chromium: it is Deepak's-style wrapper
`chromium-launcher` **v8** (ELF, 14,424 B, sha256 `eaed39c3…a172b`), built by the `chromium`
package from the sha256-pinned launcher tarball, and it prepends arguments read from
`/etc/chromium-flags.conf` and then the user flags file (`$XDG_CONFIG_HOME/chromium-flags.conf`,
else `$HOME/.config/chromium-flags.conf`) ahead of its own argv before `execv`-ing
`/usr/lib/chromium/chromium` — so the typed command is never the executed command. Everything in
that sentence is now sourced from pinned upstream bytes (launcher v8 commit `a7ed2cb…`; Arch PKGBUILD
commit `871c2ad…`, ref `154.0.8037.97-1`) and cross-checked against the host (pacman ownership,
binary literals, and the launcher digest the lane already recorded). The 11-cell row S128 and its
Gate line are drafted; the row passes `scripts/check-sources.mjs` in a scratch clone (rows 126→127,
findings 0) with two red controls that go red on the properties that matter (`bare_anchor`,
`used_by_uncited`). One dependency is stated for the L1: the `used-by` note
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` must land and contain the literal `S128`.
Known limits: the launcher **tarball** digest is pinned by the PKGBUILD but not re-downloaded
(`codeload.github.com` is outside this seat's allowed hosts), and which packaging commit built the
installed package is not settled (all three 154-era commits and current `main` carry
`_launcher_ver=8` and the same launcher sha256, so the claim is invariant).

Not attacked, not repaired: this is a build seat — no lane file was edited, no defect was fixed.

## Evidence

All commands ran in a scratch clone at `e6b0a9074d434ccc307badd312ae7379d1193fea`
(`git clone --shared`, `git checkout --detach`; `git rev-parse HEAD` → `e6b0a90…`) or read-only on
the host. Network: `curl -q -sS --proto =https`, read-only GETs, hosts limited to
gitlab.archlinux.org, github.com, raw.githubusercontent.com, archlinux.org. No pacman transaction
(queries only). No tool installed or upgraded.

### Host cross-check (exit codes)

| command | exit | result |
|---|---|---|
| `pacman -Qi chromium` | 0 | `Version: 154.0.8037.97-1`, `Build Date: Fri 09 Oct 2026 07:41:57 AM -03`, packager tippfehlr |
| `pacman -Qo /usr/bin/chromium` | 0 | `/usr/bin/chromium is owned by chromium 154.0.8037.97-1` |
| `pacman -Ql chromium \| grep -E '/usr/bin/chromium$\|LICENSE.launcher\|chromium.desktop$'` | 0 | `/usr/bin/chromium`, `/usr/share/applications/chromium.desktop`, `/usr/share/licenses/chromium/LICENSE.launcher` |
| `file -L /usr/bin/chromium` | 0 | `ELF 64-bit LSB pie executable, x86-64 … stripped` (14,424 B) |
| `sha256sum /usr/bin/chromium` | 0 | `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` (= the digest the lane's round-16/17 receipts recorded) |
| `sha256sum /usr/lib/chromium/chromium` | 0 | `95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` (= round-16/17 exec-target digest) |
| `strings -a /usr/bin/chromium \| grep -nE 'chromium-flags\.conf\|XDG_CONFIG_HOME\|\.config\|/usr/lib/chromium/chromium\|Chromium launcher'` | 0 | lines 43 `chromium-flags.conf`, 45 `XDG_CONFIG_HOME`, 46 `.config`, 55 `/usr/lib/chromium/chromium`, 56 `Chromium launcher %s -- for Chromium help, see \`man %s\`` |
| `strings -a /usr/bin/chromium \| grep -c 'Custom flags are read in order from the following files:'` | 0 | `1` (launcher.c's help template, same phrase count in the pinned source) |
| `stat -c '%s %a' ~/.config/chromium-flags.conf` / `wc -l` | 0 | `212 644` / `5` (metadata only; contents never printed) |
| `grep -cF -- <flag> ~/.config/chromium-flags.conf` | 0 | `--no-sandbox` 0, `--disable-web-security` 0, `--user-data-dir` 0, `--remote-debugging-port` 0, `--headless` 0, `--load-extension` **1** |
| `ls -l /etc/chromium-flags.conf` | 2 | absent |
| `pgrep -fa 'chromedriver\|chromium'` | 0 | only `1371 /usr/bin/earlyoom …` (its own `--prefer` pattern text); no chromium/chromedriver of mine |

Deliberate non-run: `/usr/bin/chromium --help`. `launcher.c:98-102` returns help **plus a
"Currently detected flags" dump of the real flags file**, i.e. it would print the host user's flag
lines — forbidden by the wave's live-leg rule. Binary literals established identity instead.

### Source reads (pin + byte identity)

Pins: PKGBUILD ref `154.0.8037.97-1` = commit `871c2ad960ad54af03579cb90a1c9656485ea598`
("upgpkg: 154.0.8037.97-1", 2026-10-09T14:24:18+02:00, from `…/-/commits/154.0.8037.97-1?format=atom`);
launcher tag `v8` = commit `a7ed2cb89fe28c91199524c828866201c9d6b5e5` ("Bump launcher version to v8",
2021-08-02T14:38:56Z, from `commits/v8.atom`). Both verified by byte identity, not just by the atom
feed: `launcher.c` at tag `v8` and at commit `a7ed2cb…` are both sha256
`b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624` (3,546 B); `Makefile` at both refs
is `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c` (1,219 B); `PKGBUILD` at ref
name and at commit `871c2ad…` (and at `0b95e2e…`) is
`a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be` (18,285 B).

Located facts (`file:line`, pinned bytes):

- `launcher.c:15` — `return g_build_filename("/etc", CHROMIUM_NAME "-flags.conf", NULL);` (system file, unconditional).
- `launcher.c:18-29` — `$XDG_CONFIG_HOME/chromium-flags.conf` when `XDG_CONFIG_HOME` is set, else `$HOME/.config/chromium-flags.conf`.
- `launcher.c:93-94` — `g_slist_concat(get_flags(system…), get_flags(user…))`: system flags first, then user.
- `launcher.c:124` — `return execv(CHROMIUM_BINARY, exec_args);`
- `Makefile:5` — `CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)`; `Makefile:30` — installs to `$(DESTDIR)$(PREFIX)/bin/$(CHROMIUM_NAME)`.
- `PKGBUILD:13` `_launcher_ver=8`; `:86` launcher tarball source URL; `:110` tarball sha256 `213e50f4…4483a`; `:328` `make -C chromium-launcher-$_launcher_ver`; `:438` `make PREFIX=/usr DESTDIR="$pkgdir" install`; `:444` `install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"`.

The ≤25-word locating quote used for the row:

> `launcher.c:26` — `path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);` (9 words)

### Row structure validation (scratch clone, lane gate copied from the same revision)

`node "$C/scripts/check-sources.mjs" --root "$C" --file corpus/SOURCES.md`:

| state | exit | output |
|---|---|---|
| baseline, no S128 row | 0 | `verdict=clean rows=126 … findings=0` |
| + S128 row, note stub citing `S128` | 0 | `verdict=clean rows=127 tiers=A:112,B:6,C:9 status=queued:15,mined:103,rejected:9 findings=0` |
| red control: anchor cell emptied | 1 | `FINDING id=bare_anchor row=S128 detail=anchor_missing` (line 140 patched) |
| red control: note without `S128` | 1 | `FINDING id=used_by_uncited row=S128 detail=row_id_absent` |

The row splits into 13 `|`-fields = 11 cells and adds exactly one row and one tier-A/mined row.

## Findings

1. **`[INFERENCE]` → sourced (improves the note's standing).** Four lane notes already assert the
   launcher's behaviour but from observation or inference: `corpus/knowledge/cdp-evidence-patterns.md:18`
   (explicitly "Inference, strong"), `corpus/knowledge/webmcp-chromium-loopback-round-16.md:35-36`,
   `corpus/knowledge/webmcp-invocation-round-17.md:36,40` and `SKILL.md:106,452`. S128 replaces the
   inference with a pinned source; no lane file was edited here.
2. **`attribution` / factual word, severity low — `corpus/knowledge/webdriver-bidi-runtime-round-32.md:163`**
   calls `/usr/bin/chromium` the "Arch launcher **script**". It is an ELF binary (14,424 B, `file`
   output above; the same note's sibling `webmcp-chromium-loopback-round-16.md:35` says "14 KB
   launcher"). The mechanism the round-32 note describes is correct; only the noun is wrong. Sent to
   `ScribeGateV2Note` as a precision note.
3. **`scope` — the round-32 note's `~/.config/chromium-flags.conf` claim is conditional on
   `XDG_CONFIG_HOME`.** With `XDG_CONFIG_HOME` set (this host: `/home/vgpnk/.config`), `launcher.c:23-24`
   reads `$XDG_CONFIG_HOME/chromium-flags.conf` and `HOME` redirection alone does not move it. Also
   `/etc/chromium-flags.conf` is read unconditionally (`launcher.c:15,91-94`), so redirecting
   `HOME`/`XDG_CONFIG_HOME` never covers it — matching the open item at
   `corpus/knowledge/harness-hardening-round-18.md:62`. Sent to `ExecLiveLeg`.
4. **Live-leg grounding (facts, no repair).** The host flags file today injects one
   `--load-extension` into every launcher-mediated launch (count 1) and contains no `--no-sandbox`
   (count 0). A launcher-mediated launch therefore cannot satisfy "no `--no-sandbox`" as a
   *guarantee* — only as today's file content — which is the sourced reason the v2 live leg launches
   `/usr/lib/chromium/chromium` directly.
5. **Independent confirmation (peer seat, after my pins landed; not my run).** `ExecLiveLeg`
   measured the mechanism: `.ufo/waves/round-33/w1/ExecLiveLeg/launcher-probe-full.txt` (sha256
   `0a439bb9…577c`) gives the complete exec'd argv — `/usr/lib/chromium/chromium` then five
   flags-file flags (`--ozone-platform`, `--ozone-platform-hint`, `--enable-features`,
   `--load-extension`, `--disable-features`) before the caller's args, exactly
   `launcher.c:106-107,124` + `Makefile:5`; `sandbox-probe.txt` shows a `--no-sandbox`-free session
   on `/usr/lib/chromium/chromium` reaching HTTP 200 with renderers in
   `user:[4026533866]`/`net:[4026533813]` and `Seccomp: 2`.
6. **`method` — `/proc/<pid>/cmdline` undercounts Chromium arguments (peer-corrected, general
   lesson for the round's §Mistakes).** An earlier probe (`launcher-probe.txt`, kept byte-identical,
   sha256 `38214ace…`, now superseded) listed only one injected flag because Chromium rewrites its
   process title into a single space-joined string: splitting on NUL yields `argc=1` and truncates
   the block. The full receipt reads raw bytes and replaces NULs with spaces. My file-side count
   agrees with it (`~/.config/chromium-flags.conf`: 5 newlines, one `--load-extension`). Any lane
   note that cites argv counts must read cmdline unsplit. **Routing:** filed as
   `.ufo/waves/round-33/w1/ScribeSrcLauncher/mistakes-candidate.md` for ScribeLesson — that seat is
   registered but unspawned in this wave (`swarm-registry.json` → `agentId: null`;
   `write agent://ScribeLesson` → "Unknown agent"), so it is delivered by file and in this report
   rather than by message.

## Out of scope / not done

- No lane tracked file, index, jj state, fleet repo or sibling repo was written; no commit outside
  the scratch clone (none was needed).
- No build/lint/format of the lane; no live browser run, no chromedriver, no HTTP fixture.
- Launcher tarball bytes not fetched (host allow-list); `pacman` transactions not used (paused
  host-wide anyway).
- The note `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` is not mine; its drafting seat is
  `ScribeGateV2Note`, and it must contain `S128` for the row's `used-by` to pass.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md` — the 11-cell row (ready to paste), cell
  rationale, the §Gate table row + Gate prose, and four stated limits.
- `.ufo/waves/round-33/w1/ScribeSrcLauncher/fetch-receipts.tsv` — 17 fetches with URL, UTC, HTTP
  status, bytes, sha256, note (including the two 404/JS-rendered dead ends, kept as history).
- `.ufo/waves/round-33/w1/ScribeSrcLauncher/host-crosscheck.md` — every host command with exit code,
  flag-count table (contents never printed), and the deliberate non-run.
- `.ufo/waves/round-33/w1/ScribeSrcLauncher/receipts/` — the pinned bytes:
  `launcher.c.a7ed2cb…` (`b2772fe0…`), `Makefile.a7ed2cb…` (`1bed55f7…`),
  `PKGBUILD.871c2ad…` and `PKGBUILD.ref-154.0.8037.97-1` (both `a6fd458b…`), `commits-v8.atom`
  (`c1ea5b72…`), `gitlab-commits-154.0.8037.97-1.atom` (`5e73eba6…`).
