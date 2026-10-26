# ReopenS128 — S128 re-opened at 042d6d9 (tabi round 33 w2, C2)

**Verdict: defect, severity low — three locator/stamp precision defects (row anchor cell, Gate-row accessed stamp, Gate-prose pointers); every substantive cell of S128 and its Gate line holds.** Re-opened independently at the attacked revision `042d6d9abf97d567d495652a85eabc851b81adc1`: fresh read-only fetches of the Arch PKGBUILD at pinned commit `871c2ad960ad54af03579cb90a1c9656485ea598` (HTTP 200, 18,285 B, sha256 `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be` — equal to the row's pinned digest and to w1's lane receipt, byte-for-byte) and chromium-launcher v8 `launcher.c` + `Makefile` at pinned commit `a7ed2cb89fe28c91199524c828866201c9d6b5e5` (3,546 B / `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624`; 1,219 B / `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c`), with tag-`v8` byte-identity and the ref `154.0.8037.97-1` → `871c2ad9` mapping re-confirmed from the atom feeds (both byte-identical to w1's receipts). Every quoted line verifies verbatim at its cited line number (`launcher.c:26`, `:124`; `Makefile:5`; `PKGBUILD:86,110,328,438,444`), the installed `/usr/bin/chromium` matches the pinned source (pacman -Qo → `chromium 154.0.8037.97-1`; 14,424 B ELF, sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` — the digest the lane's round-16/17 receipts already record — carrying launcher.c's distinctive literals), and `node scripts/check-sources.mjs` in a clean clone at `042d6d9` reads `verdict=clean rows=129 findings=0`, exit 0. The defects: (D1) the row's anchor cell cites `PKGBUILD:13` for `_launcher_ver=8`, which sits at `PKGBUILD:12` in the pinned bytes (`:13` is `_manual_clone=1`); (D2) the Gate row's accessed cell stamps the PKGBUILD fetch at `18:26:26Z`, but the seat's own fetch-receipts.tsv stamps the pinned-commit fetch at `18:24:16Z` (`18:26:26Z` belongs to the byte-identical `0b95e2e` corroboration fetch); (D3) the Gate prose bullet's two pointers into the draft file do not resolve at the attacked revision (row at `row-S128.md:10`, cited `:7`; Gate table row at `:53`, cited `:50`). No digest, quote, byte count, or mechanism claim is affected; the v2 gate header's S128 citation is accurate.

## Attacked artifacts (all read at `042d6d9abf97d567d495652a85eabc851b81adc1`)

- `corpus/SOURCES.md:142` — the S128 row (11 cells).
- `corpus/lessons/round-33.md:36` — the Gate table row for S128; `:51-57` — the Gate prose bullet; `:83-88` — recorded row limits.
- `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:1` — the `source:` sentence attributing the launcher facts to S128.
- `scripts/check-bidi-runtime.mjs:25-28,558-562,576,594-601` (read in the scratch clone) — where S128's ground is wired into gate v2's live leg.

## Evidence

### 1. Independent fetches (7 read-only HTTPS GETs, `curl -q -sS --proto =https`; full log in `fetch-receipts.tsv`)

| fetch | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| PKGBUILD.871c2ad9 | gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/871c2ad960ad54af03579cb90a1c9656485ea598/PKGBUILD | 2026-10-26T18:49:43Z | 200 | 18,285 | `a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be` |
| launcher.c.a7ed2cb8 | raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb89fe28c91199524c828866201c9d6b5e5/launcher.c | 2026-10-26T18:49:44Z | 200 | 3,546 | `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624` |
| Makefile.a7ed2cb8 | …/a7ed2cb89fe28c91199524c828866201c9d6b5e5/Makefile | 2026-10-26T18:49:45Z | 200 | 1,219 | `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c` |
| launcher.c.tag-v8 | raw.githubusercontent.com/foutrelis/chromium-launcher/v8/launcher.c | 2026-10-26T18:49:45Z | 200 | 3,546 | `b2772fe0…` (identical to the commit fetch) |
| Makefile.tag-v8 | …/v8/Makefile | 2026-10-26T18:49:45Z | 200 | 1,219 | `1bed55f7…` (identical to the commit fetch) |
| gitlab-commits-154.0.8037.97-1.atom | gitlab.archlinux.org/…/-/commits/154.0.8037.97-1?format=atom | 2026-10-26T18:49:45Z | 200 | 29,839 | `5e73eba6bbb2b63746cf4a0bfa6be10c4bb2b741626881d12a20b239034d15b8` |
| github-commits-v8.atom | github.com/foutrelis/chromium-launcher/commits/v8.atom | 2026-10-26T18:50:03Z | 200 | 15,912 | `c1ea5b725bb53f3581880bd135ee47d5dc08945933994944aa15c06153a8d94a` |

Hosts used: gitlab.archlinux.org (2), raw.githubusercontent.com (4), github.com (1) — all on the seat's allowed list. No tokens, cookies, or consequential actions.

**Digest identity (three-way).** My fetches = the row's pinned digests = w1's lane receipts:

```
$ sha256sum $L/.ufo/waves/round-33/w1/ScribeSrcLauncher/receipts/{PKGBUILD.871c2ad9…,launcher.c.a7ed2cb…,Makefile.a7ed2cb…,PKGBUILD.ref-154.0.8037.97-1,commits-v8.atom,gitlab-commits-154.0.8037.97-1.atom}
a6fd458b…961be  PKGBUILD.871c2ad960ad54af03579cb90a1c9656485ea598      exit=0
b2772fe0…82624  launcher.c.a7ed2cb89fe28c91199524c828866201c9d6b5e5    exit=0
1bed55f7…b508c  Makefile.a7ed2cb89fe28c91199524c828866201c9d6b5e5      exit=0
a6fd458b…961be  PKGBUILD.ref-154.0.8037.97-1                          exit=0
c1ea5b72…8d94a  commits-v8.atom                                       exit=0
5e73eba6…d15b8  gitlab-commits-154.0.8037.97-1.atom                   exit=0
```

All six equal my fresh fetches byte-for-byte, and all equal the digests in `corpus/SOURCES.md:142` and `corpus/lessons/round-33.md:36`.

**Ref/tag pins.** The GitLab atom (byte-identical to w1's) carries commit `871c2ad960ad54af03579cb90a1c9656485ea598` with feed title `chromium:154.0.8037.97-1 commits`, first `<updated>2026-10-09T14:24:18+02:00</updated>`, entry title `upgpkg: 154.0.8037.97-1` — ref tip = the pinned commit. The GitHub v8 atom carries `a7ed2cb89fe28c91199524c828866201c9d6b5e5` (feed `Recent Commits to chromium-launcher:v8`) — tag `v8` tip = the pinned launcher commit, and the tag-ref fetches are byte-identical to the commit-ref fetches.

### 2. Quoted lines, verbatim at the cited line numbers (grep -n over the sha256-verified fetched bytes)

`launcher.c` @ `a7ed2cb8`:
- `:15` — `return g_build_filename("/etc", CHROMIUM_NAME "-flags.conf", NULL);` (system file, unconditional) ✓
- `:18-29` — `default_user_flags_conf_path()`: `:23-24` `$XDG_CONFIG_HOME/chromium-flags.conf` when set, `:25-26` else `$HOME/.config/chromium-flags.conf` ✓
- `:26` — `path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);` — the Gate row's quote, verbatim ✓
- `:48` — `if (!g_shell_parse_argv(buf, &argcp, &argvp, NULL))` — grounds the teaches cell's "shell-splits each line" ✓
- `:93-94` — `GSList *flags = g_slist_concat(get_flags(system_flags_conf_path), get_flags(user_flags_conf_path));` — system-then-user ✓
- `:98-102` — the `--help` branch (deliberately not executed on the host; see Limits) ✓
- `:106-107,109-110` — argv = `CHROMIUM_BINARY`, then flags, then the caller's args ✓
- `:124` — `return execv(CHROMIUM_BINARY, exec_args);` — the Gate row's quote, verbatim ✓

`Makefile` @ `a7ed2cb8`: `:5` — `CHROMIUM_BINARY  = /usr/lib/$(CHROMIUM_NAME)/$(CHROMIUM_NAME)` (verbatim, double space included) ✓; `:30` — `install -D $(CHROMIUM_NAME) "$(DESTDIR)$(PREFIX)/bin/$(CHROMIUM_NAME)"` ✓; `:12-13` — `-DCHROMIUM_BINARY=\"$(CHROMIUM_BINARY)\"` compiled in ✓.

`PKGBUILD` @ `871c2ad9`: `:10` `pkgver=154.0.8037.97`, `:11` `pkgrel=1`, **`:12` `_launcher_ver=8`**, `:13` `_manual_clone=1`; `:86` — `https://github.com/foutrelis/chromium-launcher/archive/v$_launcher_ver/chromium-launcher-$_launcher_ver.tar.gz` ✓; `:110` — `'213e50f48b67feb4441078d50b0fd431df34323be15be97c55302d3fdac4483a'` (launcher tarball sha256, pairing with the `:86` source entry) ✓; `:328` — `make -C chromium-launcher-$_launcher_ver` ✓; `:438` — `make PREFIX=/usr DESTDIR="$pkgdir" install` ✓; `:444` — `install -Dv out/Release/chrome "$pkgdir/usr/lib/chromium/chromium"` ✓.

### 3. Host cross-check (queries only; exit codes inline)

```
pacman -Qo /usr/bin/chromium        → "/usr/bin/chromium is owned by chromium 154.0.8037.97-1"   exit=0
pacman -Qi chromium                 → Version 154.0.8037.97-1; Build Date Fri 09 Oct 2026 07:41:57 AM -03  exit=0
pacman -Ql chromium | grep -E '…'   → /usr/bin/chromium; …/chromium.desktop; …/LICENSE.launcher  exit=0
file -L /usr/bin/chromium           → ELF 64-bit LSB pie executable, x86-64 … stripped           exit=0
stat -c '%s %a' /usr/bin/chromium   → 14424 755                                                  exit=0
sha256sum /usr/bin/chromium         → eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b  exit=0
sha256sum /usr/lib/chromium/chromium→ 95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a  exit=0
strings -a /usr/bin/chromium | grep -nE '…' → 43:chromium-flags.conf 45:XDG_CONFIG_HOME 46:.config
                                        55:/usr/lib/chromium/chromium
                                        56:"Chromium launcher %s -- for Chromium help, see `man %s`"  exit=0
strings … | grep -c 'Custom flags are read in order…' → 1                                        exit=0
printenv XDG_CONFIG_HOME            → /home/vgpnk/.config   (set — the note's host fact)         exit=0
ls -l /etc/chromium-flags.conf      → No such file or directory                                  exit=2
stat -c '%s %a' ~/.config/chromium-flags.conf → 212 644 ; wc -l → 5                             exit=0
grep -cF -- '--no-sandbox' ~/.config/chromium-flags.conf      → 0                               exit=1
grep -cF -- '--load-extension' ~/.config/chromium-flags.conf  → 1                               exit=0
```

The installed launcher's sha256 equals the digest the lane's round-16/17 artifacts already record (`.ufo/waves/round-16/probes/WebmcpProbeDeclarative.json:9` and siblings; `.ufo/waves/round-16/w1/ReconLaneWebmcp.md:179-180`), and its string literals sit at the same `strings` offsets w1's `host-crosscheck.md` records (43/45/46/55/56). `/usr/lib/chromium/chromium` (329,260,096 B, `95b17db7…`) is the exec target `Makefile:5` names. Flag counts are counts only; the file's contents were never printed.

### 4. Row structure and gate wiring

```
$ node $S/clone/scripts/check-sources.mjs --root $S/clone --file corpus/SOURCES.md   # clone at 042d6d9
SOURCES_GATE verdict=clean rows=129 tiers=A:114,B:6,C:9 status=queued:15,mined:105,rejected:9 findings=0 file=corpus/SOURCES.md
exit=0
```

Gate v2 actually consumes the row's ground (`scripts/check-bidi-runtime.mjs` in the clone at `042d6d9`): header `:25-28` — "The live leg launches the real browser binary (/usr/lib/chromium/chromium), not the /usr/bin/chromium launcher (which prepends ~/.config/chromium-flags.conf, host state this run does not own — S128) and never passes --no-sandbox (S129)"; `:576` — default `chromium = "/usr/lib/chromium/chromium"`; `:594-601` — throwaway `HOME`/`XDG_CONFIG_HOME`/`XDG_CACHE_HOME` and a short chromium TMPDIR. The Gate line's rule-4 shape also holds: the `corpus/lessons/round-33.md:36` row carries https URLs, 64-hex sha256s, and its first URL's host (`gitlab.archlinux.org`) equals the registry row's source-URL host.

## Defects (findings only; nothing repaired)

**D1 — low — `corpus/SOURCES.md:142` anchor cell, first locator off by one.** The cell cites `PKGBUILD:13,86,110,328,438,444 at commit 871c2ad9…`; the meaning mapping (`PKGBUILD:13` = `_launcher_ver=8`) is in the seat's draft (`row-S128.md:28`) and report (`ScribeSrcLauncher.md:71`). In the pinned bytes `_launcher_ver=8` is at **`:12`**; `:13` is `_manual_clone=1` (grep -n over the sha256-verified fetch). w1's own receipts corroborate: `fetch-receipts.tsv:18` records "same `_launcher_ver=8` **(:12)**" for the sibling 154-era commit `07d629c`, while the `:13` cite matches the **main-branch** layout (`tsv:2`, pkgver 156.0.8078.47) — the cite was taken from the wrong revision's layout. Blast radius: `corpus/SOURCES.md:142`, plus wave artifacts `.ufo/waves/round-33/w1-results.json:106`, `w1/ScribeSrcLauncher.md:71`, `w1/ScribeSrcLauncher/row-S128.md:28`. Not propagated: the knowledge note's S128 sentence and the lesson's Gate section carry no `PKGBUILD:13`. Substance unaffected — the assignment exists and `:86`/`:110` pin the launcher independently.

**D2 — low — `corpus/lessons/round-33.md:36` accessed cell, PKGBUILD stamp is not the pinned-URL fetch's stamp.** The Gate row stamps the PKGBUILD at `2026-10-26T18:26:26Z`; the seat's own `fetch-receipts.tsv:15` stamps the pinned-commit fetch (`…-/raw/871c2ad9…/PKGBUILD`) at **`18:24:16Z`**. `18:26:26Z` is the stamp of the byte-identical `0b95e2e` corroboration fetch (`tsv:17`; also `07d629c`, `tsv:18`). The launcher.c stamp (`18:23:50Z`) matches its pin fetch (`tsv:14`) exactly, so the asymmetry reads as an error, not a convention. Bytes and digest are unaffected (`a6fd458b…` at all three PKGBUILD stamps).

**D3 — low — `corpus/lessons/round-33.md:51-52` pointers into the draft file do not resolve.** The bullet cites "row `row-S128.md:7`" and "Gate line `:50`". At the attacked revision the registry row is at `row-S128.md:**10**` (`:7` is the "Paste only the single line…" prose) and the Gate table row is at `:**53**` (`:50` is the "## Gate line for …" header) — verified by `git grep -n '^| S128 |'` at both `bf48b81` (the only commit touching both files) and `042d6d9`, so the pointers were never accurate at a landed revision. Same-drift check for the S127/S129 bullets (`:46`, `:58`) not performed — those rows belong to sibling seats.

## Holds (verified, no finding)

- All sha256s and byte counts in the row anchor and Gate row (PKGBUILD `a6fd458b…`/18,285 B; launcher.c `b2772fe0…`/3,546 B; Makefile `1bed55f7…`/1,219 B; tarball pin `213e50f4…4483a` as recorded at `PKGBUILD:110`).
- Tag `v8` = commit `a7ed2cb8` (byte identity) and ref `154.0.8037.97-1` tip = commit `871c2ad9` (atom), both re-derived from fresh fetches.
- Quoted lines verbatim: `launcher.c:26`, `:124`, `Makefile:5` (Gate row quote cell); `launcher.c:15`, `:18-29`, `:93-94`, `:124` and `Makefile:5`, `:30` (row anchor); `PKGBUILD:86`, `:110`, `:328`, `:438`, `:444`.
- Installed-binary identity: pacman ownership `chromium 154.0.8037.97-1`, 14,424 B stripped ELF, sha256 `eaed39c3…a172b` equal to the lane's round-16/17 records, launcher literals present, exec target `/usr/lib/chromium/chromium` present with the recorded digest.
- Host facts in the note and Gate prose: `XDG_CONFIG_HOME` set (`/home/vgpnk/.config`); `/etc/chromium-flags.conf` absent; user flags file 212 B, 5 lines, mode 644; `--no-sandbox` 0 matches, `--load-extension` 1 match (as of 2026-10-26 — a property of the file that day, as the note itself scopes it).
- Teaches cell mechanism: shell-split (`:48`), flags prepended to argv (`:106-107`, `:109-110`), `execv` of `/usr/lib/chromium/chromium` (`:124`) — "a recorded typed command is not the executed command".
- Row cells `kind=code`, `tier=A` (scoped), `scope` (mechanism + exec target; exclusions stated), `status=mined`, `opened=2026-10-26`, `recheck=90d` (consistent with `round-33.md:26-27`'s recorded reason), `used-by` note present and citing `S128`; `check-sources.mjs` clean, rows=129, findings=0, exit 0 at `042d6d9`.
- The knowledge note's S128 sentence: every line cite (`:15`, `:18-29`, `:93-94`, `:124`), both commit pins, the ELF size/digest, and both host facts verified.

## Limits (stated, not hidden)

- The launcher **tarball** sha256 (`213e50f4…4483a`, `PKGBUILD:110`) is pinned by the recipe and was not re-downloaded: `github.com/…/archive/v8/…` redirects to `codeload.github.com`, which is outside this seat's allowed hosts (same limit w1 recorded). What is verified: `launcher.c`/`Makefile` byte-identical at tag `v8` and at the pinned commit.
- The installed package's build stamp (2026-10-09 07:41:57 -03) is not matched to a packaging commit (w1's limit, restated); identity rests on pacman ownership + digest continuity with the lane's round-16/17 records + binary literals.
- `/usr/bin/chromium --help` deliberately not run: `launcher.c:98-102` with `:82-87` would print the host flags file's contents ("Currently detected flags"), which the wave's live-leg rule forbids. Binary literals establish identity instead.
- No browser or chromedriver was started by this seat; no live-leg run (that is other seats' surface). `pacman` queries only — transactions are paused host-wide and none was needed. No tool was installed or upgraded (operator rule 2026-10-19: nothing needed; `curl`/`git`/`node`/`pacman` present).

## Commands (paste of the decisive ones; exit codes inline above)

```
S=/fast/scratch/hyaku/tabi-r33/ReopenS128
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && \
  git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1   # → 042d6d9…, toplevel=$S/clone
bash "$S/fetch.sh"                                                                  # 7 GETs → fetch-receipts.tsv, exit=0
pacman -Qo /usr/bin/chromium; pacman -Qi chromium; pacman -Ql chromium | grep -E '…' # queries only
sha256sum /usr/bin/chromium /usr/lib/chromium/chromium
strings -a /usr/bin/chromium | grep -nE 'chromium-flags\.conf|XDG_CONFIG_HOME|…'
node "$S/clone/scripts/check-sources.mjs" --root "$S/clone" --file corpus/SOURCES.md # exit=0, rows=129, findings=0
git -C <lane> grep -n '^| S128 |' 042d6d9… -- .ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md  # :10 and :53
```

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/ReopenS128.md` — this report.
- `.ufo/waves/round-33/w2/ReopenS128/fetch-receipts.tsv` — the 7 fetches (URL, UTC, HTTP status, bytes, sha256).
- `.ufo/waves/round-33/w2/ReopenS128/fetch.sh` — the fetch script (receipt of method).
- `.ufo/waves/round-33/w2/ReopenS128/receipts/` — the pinned bytes: `PKGBUILD.871c2ad9`, `launcher.c.a7ed2cb8`, `Makefile.a7ed2cb8`, `launcher.c.tag-v8`, `Makefile.tag-v8`, `gitlab-commits-154.0.8037.97-1.atom`, `github-commits-v8.atom`.

Scratch `/fast/scratch/hyaku/tabi-r33/ReopenS128` (including the clone) deleted after receipts were copied; no chromedriver/chromium process was started by this seat (final `pgrep -fa 'chromedriver|chromium'` reported in the yield).
