# ExecLiveLeg — C2 live-leg probe (no-harm evidence for gate v2)

**Verdict (holds, with one scoped limitation).** On this host `/usr/bin/chromium` is not a script but a
14,424-byte stripped ELF launcher (package `chromium 154.0.8037.97-1`, built from foutrelis/chromium-launcher
v8) that prepends `/etc/chromium-flags.conf` and then `$XDG_CONFIG_HOME/chromium-flags.conf` to every launch and
`execv`s `/usr/lib/chromium/chromium`; the user flags file exists here (212 B, 5 lines) and `/etc` one does not,
so any run through `/usr/bin/chromium` carries host state this lane does not own — measured directly: the exec'd
argv is `[/usr/lib/chromium/chromium, --ozone-platform=…, --ozone-platform-hint=…, --enable-features=…,
--load-extension=…, --disable-features=…, …, <caller args>]`, i.e. all five flags-file flags ahead of the caller's
own arguments. The real binary can run **sandboxed**:
`chrome-sandbox` is setuid-root, `kernel.unprivileged_userns_clone=1`, a headless chromedriver session with
`binary=/usr/lib/chromium/chromium` and **no `--no-sandbox`** reaches HTTP 200, and its renderers sit in a
private user+net namespace with `Seccomp: 2`, so dropping `--no-sandbox` costs nothing on this host. The minimal
`live.patch` (default binary → `/usr/lib/chromium/chromium`, removal of `--no-sandbox`, explicit refusal when
neither setuid helper nor user namespaces are usable) applied and committed in a scratch clone gives
`--live --json` **exit 0, population 16, admitted 16, failing 0, binding null (first-screenshot binding holds),
clean true**, `--selftest` **27/27 exit 0**, and the offline run 16/16 clean. The one limitation: the new refusal
branch is unreachable on this host (both sandbox paths are available), so it is code-reviewed, not dynamically
exercised.

## 1. `/usr/bin/chromium` is a launcher that injects host flags

Commands (all exit 0 unless noted):

```
$ ls -l /usr/bin/chromium /usr/lib/chromium/chromium /usr/lib/chromium/chrome-sandbox
-rwxr-xr-x root root   14424 /usr/bin/chromium
-rwsr-xr-x root root   14560 /usr/lib/chromium/chrome-sandbox
-rwxr-xr-x root root 329260096 /usr/lib/chromium/chromium

$ file /usr/bin/chromium
ELF 64-bit LSB pie executable, x86-64, stripped, BuildID[sha1]=b60b9805a567483207ed7c08dc10d69a2b00aee4

$ pacman -Qo /usr/bin/chromium /usr/lib/chromium/chromium /usr/lib/chromium/chrome-sandbox
/usr/bin/chromium is owned by chromium 154.0.8037.97-1   (same for the other two)
$ pacman -Q chromium-launcher   → error: package 'chromium-launcher' was not found  (exit 1: launcher is compiled in, not a shell script)

$ strings -a /usr/bin/chromium | grep …
g_shell_parse_argv, g_slist_concat, execv, getenv
chromium-flags.conf, XDG_CONFIG_HOME, /etc, --help
CHROME_WRAPPER, CHROME_DESKTOP, CHROME_VERSION_EXTRA, Arch Linux
/usr/lib/chromium/chromium
"Chromium launcher %s -- for Chromium help, see `man %s`"
"Custom flags are read in order from the following files:"   "  %s\n  %s"
"Arguments included in those files are split on whitespace and shell quoting rules apply but no further
 parsing is performed. Lines starting with a hash symbol (#) are skipped. Lines with unbalanced quotes are skipped as well."
```

Source pin (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ScribeSrcLauncher/` pins the same
bytes I fetched independently): `launcher.c` v8 — `:15` `default_system_flags_conf_path()` →
`/etc/chromium-flags.conf`; `:18-29` `$XDG_CONFIG_HOME/chromium-flags.conf`, else `$HOME/.config/…`; `:34-70`
`get_flags()` via `g_shell_parse_argv`; `:93-94` `g_slist_concat(get_flags(system), get_flags(user))`;
`:101-124` `args = [CHROMIUM_BINARY] + flags + argv[1..]` then `execv(CHROMIUM_BINARY, args)` and
`g_setenv("CHROME_WRAPPER", argv[0], …)`. That is exactly why the exec'd process shows `argv[0]=/usr/lib/chromium/chromium`
with the flags file's flags ahead of the caller's.

Host flags-file state (metadata and flag **names** only; no values printed):

```
$ ls -l ~/.config/chromium-flags.conf   -rw-r--r-- vgpnk vgpnk 212 Oct 16 23:58
$ wc -l < ~/.config/chromium-flags.conf   → 5
$ sha256sum ~/.config/chromium-flags.conf → 478401f0547c197f211c9357c0c670dc6918f442dd5fc51eeb4a58e960dca101
$ awk '{for(i=1;i<=NF;i++) if($i ~ /^--/) {split($i,a,"="); print a[1]}}' ~/.config/chromium-flags.conf
--ozone-platform  --ozone-platform-hint  --enable-features  --load-extension  --disable-features
$ grep -cvE '^\s*(#|--|$)' ~/.config/chromium-flags.conf → 0   (no non-comment, non-flag lines)
$ ls -l /etc/chromium-flags.conf → No such file or directory
```

Values are not secret-shaped: value lengths 7 / 7 / 35 / 59 / 6; the only 24+ alphanumeric run is inside
`--enable-features` (a feature-name list), `--load-extension` is a filesystem path, and there are no
`=`/`:`/`/` characters in the feature value. No credential or token-bearing flag name is present
(`--password*`, `--proxy-server`, `--user-data-dir`, `--remote-debugging-port`, `--headless`: 0 occurrences).

Direct measurement of injection (receipt `launcher-probe-full.txt`, sha256
`0a439bb90edc731c6c9c36b2d57892624e0ef7ebf6656f8d9c203c1345fc577c`, which supersedes the truncated argv block in
`launcher-probe.txt`, sha256 `38214ace8dbf0055c91f949600e07ade3b3f5a0fa4518fe419d10b281c34e21d`, kept unchanged as
history) — I launched the launcher myself and read `/proc/<pid>/cmdline`, values redacted:

```
/usr/bin/chromium --headless=new --no-first-run --disable-gpu --user-data-dir=<tmp> about:blank
→ /usr/lib/chromium/chromium --ozone-platform=<value> --ozone-platform-hint=<value> --enable-features=<value>
  --load-extension=<value> --disable-features=<value> --headless=<value> --no-first-run --disable-gpu
  --user-data-dir=<value> --noerrdialogs --ozone-platform=<value> --ozone-override-screen-size=<value>
  --use-angle=<value> about:blank
flags-file flag names present in that complete argv: --ozone-platform 2, --ozone-platform-hint 1,
  --enable-features 1, --load-extension 1, --disable-features 1
```

All five flags of `~/.config/chromium-flags.conf` arrive **before** the caller's own arguments, exactly as
`launcher.c:106-107` appends `CHROMIUM_BINARY` then the flags list then `argv`. Reading caveat worth recording:
Chromium rewrites its process title into one space-joined string, so splitting `/proc/<pid>/cmdline` on NUL yields
`argc=1` and silently truncates the injected block — the first probe (`launcher-probe.txt`) showed only
`--ozone-platform` for that reason, not because only one flag is injected. (Peer `ScribeSrcLauncher` flagged the
same over-read risk; the counts above are from the unsplit cmdline.)

Independent corroboration from the same capture window: a peer seat's run through the launcher produced
`[/usr/lib/chromium/chromium, --ozone-platform=wayland, --ozone-platform-hint=wayland,
--enable-features=TouchpadOverscrollHistoryNavigation, --load-extension=~/.local/share/omarchy/…,
--disable-features=Vulkan, …, --no-sandbox, …]` — i.e. the host flags file *and* `--no-sandbox` both present.
That is the argv v2 must stop producing.

## 2. Sandboxed headless chromium works without `--no-sandbox`

```
$ ls -l /usr/lib/chromium/chrome-sandbox   → -rwsr-xr-x root root 14560   (setuid root)
$ sysctl kernel.unprivileged_userns_clone  → kernel.unprivileged_userns_clone = 1
```

Probe (receipt `sandbox-probe.txt`): `chromedriver --port=9595`, then `POST /session` with
`goog:chromeOptions.binary=/usr/lib/chromium/chromium` and
`args=["--headless=new","--no-first-run","--disable-gpu","--user-data-dir=<tmp>/profile"]` — **no `--no-sandbox`**.
Result: `HTTP 200`, `browser=154.0.8037.97`, `driver=154.0.8037.97`, and the process table with namespace and
seccomp state read from `/proc/<pid>/{status,ns/*}`:

```
shell:              uid=1000 ns_user=user:[4026531837] ns_net=net:[4026531833]
browser            1000 seccomp=0 user:[4026531837] net:[4026531833]
--type=zygote      1000 seccomp=0 user:[4026531837] net:[4026531833]   (setuid-sandbox zygote path)
--type=zygote      1000 seccomp=0 user:[4026533866] net:[4026533813]   (namespace-sandboxed zygote)
--type=utility     1000 seccomp=2 user:[4026533866] net:[4026533813]
--type=renderer    1000 seccomp=2 user:[4026533866] net:[4026533813]   (×4, all isolated)
no-sandbox-in-browser-argv: 0
```

Renderers and the sandboxed utility live in a **different user namespace and a different net namespace** from the
caller, with seccomp filter mode 2 — the namespace sandbox is genuinely active. (The browser and GPU process
staying in the host namespaces is Chromium's normal split.)

## 3. `live.patch` — the minimal v2 live-leg change

`live.patch` (77 lines, sha256 `0f90a784a94314338aa1670f1e47c9a9d79a6338c1b3d4af7f839cfecfda6df4`), 35 insertions /
5 deletions, one file, `scripts/check-bidi-runtime.mjs`, all inside `liveRecord` and its doc header:

1. signature default `chromium = "/usr/bin/chromium"` → **`"/usr/lib/chromium/chromium"`** (the real binary; the
   launcher is never used, so no flags-file flags can be injected);
2. `args: ["--headless=new", "--no-sandbox", …]` → **`args: ["--headless=new", …]`**;
3. new `sandboxStatus(binary)` preflight: passes when `dirname(binary)/chrome-sandbox` is `uid 0` + mode `04000`,
   or when `/proc/sys/kernel/unprivileged_userns_clone` is `1` (sysctl absent counts as allowed); otherwise
   `throw new Refusal("chromium sandbox unavailable for <binary> (<why>); refusing to launch the live leg
   unsandboxed")` → exit 2, the declared could-not-evaluate code;
4. launch-failure mapping: when the new-session message matches `/sandbox|zygote|namespace/i`, the gate refuses
   with `"chromium sandbox failed to start (…); refusing to relaunch <binary> unsandboxed"` instead of retrying
   loose;
5. header comment lines 24-28 state the binary, its exclusion of the launcher/flags file, and the refusal policy.

The patch was applied in the scratch clone, `node --check` exited 0, and committed as
`2b64a52eb3f5b790127b0e4f61c9acf766393c03` (parent `e6b0a9074d434ccc307badd312ae7379d1193fea`, scratch clone only;
`git -C <clone> rev-parse --show-toplevel` == the clone path). The delivered file has standard `a/`…`b/` prefixes
(the working tree's `diff.mnemonicPrefix` produced `i/`…`w/`, rewritten mechanically, hunks untouched) and was
re-validated on a fresh clone at `e6b0a907`: `git apply --check` exit 0, then `git apply` gave
`1 file changed, 35 insertions(+), 5 deletions(-)` — the same tree as the committed run.

## 4. Gate results at the patched commit

```
$ TMPDIR=/run/user/1000/tabi33-59u1Mi (28 bytes) node scripts/check-bidi-runtime.mjs \
    --rev 2b64a52eb3f5b790127b0e4f61c9acf766393c03 \
    --baseline d805d1d6132430118b206a848b85753ab35d1014 \
    --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
GATE_EXIT=0
{"population":16,"admitted":16,"failing":0,"entryFinding":null,"binding":null,"clean":true,
 "fixtureSha256":"343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843"}
rows admitted: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R17 (all "admitted":true, reason null)

$ node scripts/check-bidi-runtime.mjs --selftest --json      → SELFTEST_EXIT=0, cases 27, passed 27
$ node scripts/check-bidi-runtime.mjs --rev 2b64a52… --baseline d805d1d6… --entry … --json
                                                              → OFFLINE_EXIT=0, population 16, admitted 16, failing 0, clean true
```

**First-screenshot binding result: `"binding": null` = the binding predicate holds** — every run's first
`captureScreenshot` (after `setViewport` 640×480, `/a.html` complete, `window.__ready` settled) decodes to the same
bytes across both committed runs, both carry the same `chromedriverVersion`, and with `--live` those bytes and that
version equal this counter's own sandboxed session's. `live-err.txt` was empty; stderr produced nothing.

argv actually used, captured with `ps -eo args` during the run and filtered to this seat's unique profile path
(`/run/user/1000/tabi33-59u1Mi/tabi-bidi-live-flvtVI/profile`) — receipt `argv-gate.txt`, 11 unique process lines:

```
/usr/lib/chromium/chromium --allow-pre-commit-input --disable-background-networking … --disable-features=IgnoreDuplicateNavs,Prewarm
  --disable-gpu … --enable-automation --enable-logging --headless=new --log-level=0 --no-first-run --no-service-autorun
  --password-store=basic --remote-debugging-port=0 --test-type=webdriver --use-mock-keychain
  --user-data-dir=/run/user/1000/tabi33-59u1Mi/tabi-bidi-live-flvtVI/profile --noerrdialogs
  --ozone-platform=headless --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl data:,
types: 5 renderer, 2 zygote, 2 utility, 1 gpu-process
```

Forbidden-flag counts over those 11 lines: `--no-sandbox` **0**, `--load-extension` **0**,
`--enable-features=TouchpadOverscrollHistoryNavigation` **0**, `--disable-features=Vulkan` **0**,
`--ozone-platform=wayland` **0**. The `--disable-features=IgnoreDuplicateNavs,Prewarm` and
`--ozone-platform=headless` entries are chromedriver's own WebDriver switches, not flags-file values
(the flags file carries `Vulkan` and `wayland`). One zygote line carries `--no-zygote-sandbox` (no `--no-sandbox`);
that is a marker on the zygote's own command line `[INFERENCE: Chromium's namespace-sandbox launch path]`, and it
does not weaken the evidence above — the renderers in that same run *are* in a private user+net namespace with
seccomp 2 (§2 receipt, same launch arguments).

## 5. Limits and hygiene

- **Refusal branch not dynamically exercised.** On this host both sandbox paths are available
  (`chrome-sandbox` setuid-root *and* `unprivileged_userns_clone=1`), so `sandboxStatus` cannot return
  `refuse: true` and the launch-failure mapping cannot be triggered without changing host sysctl (forbidden here).
  The branch is code-reviewed only; v2's `--selftest` could cover it by injecting a `sandboxStatus` stub.
- **Capture contamination, disclosed.** The `ps` poll ran while other seats were driving browsers on the same host;
  the raw file held 339 lines across several seats, including a peer's launcher-based `--no-sandbox` run. All
  conclusions above come from the subset carrying this seat's unique `--user-data-dir`
  (`/run/user/1000/tabi33-59u1Mi/…`, 11 unique lines); the contaminated raw subset is not cited as evidence for
  anything except the launcher-injection corroboration in §1.
- **No-harm scope.** `--live` is not part of any frozen predicate (claims.json C2 killRule); this is no-harm
  evidence only. The patch changes nothing on the receipt leg: the offline run and all 27 selftest cases stay green
  at the patched commit.
- **Tooling.** Nothing installed or upgraded; host already provides chromium 154.0.8037.97, chromedriver
  154.0.8037.97, and node. No pacman transaction was run.
- **Network receipts** (read-only HTTPS GET, `curl -q -sS --proto =https`):

  | URL | UTC | HTTP | bytes | sha256 |
  |---|---|---|---|---|
  | `https://gitlab.archlinux.org/archlinux/packaging/packages/chromium/-/raw/main/PKGBUILD` | 2026-10-26T18:24:32Z | 200 | 18157 | `3acef740544ddc45d8652219388711e1816a6cbcec1a2f8e2a4ba98a5e8b08e0` |
  | `https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/launcher.c` | 2026-10-26T18:24:36Z | 200 | 3546 | `b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624` |
  | `https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/Makefile` | 2026-10-26T18:24:37Z | 200 | 1219 | `1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c` |
  | `https://raw.githubusercontent.com/foutrelis/chromium-launcher/v8/main.c`, `/chromium.c` | 2026-10-26T18:24:36Z | 404 | 14 | `d5558cd419c8d46bdc958064cb97f963d1ea793866414c025906ec15033512ed` |

  PKGBUILD corroboration: `pkgver=156.0.8078.47`, `_launcher_ver=8`,
  `source=(…/chromium-$pkgver-lite.tar.xz https://github.com/foutrelis/chromium-launcher/archive/v$_launcher_ver/…)`,
  `make -C chromium-launcher-$_launcher_ver` — i.e. the shipped launcher is the compiled C tool, not the old shell
  script (the round-32 note's "script" wording is wrong; the packaged file here is an ELF).
- **Cleanup.** Scratch `$HYAKU_SCRATCH/tabi-r33/ExecLiveLeg` deleted (`scratch_exists=no`), the leftover
  `/run/user/1000/tabi33-59u1Mi` TMPDIR and every per-run TMPDIR removed, and no browser of mine survives:
  `pgrep -fa 'chromedriver|chromium'` filtered to my paths and TMPDIRs → `own_count=0`.

## 6. Deliverables

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/ExecLiveLeg/`:

| file | sha256 | contents |
|---|---|---|
| `live.patch` | `0f90a784a94314338aa1670f1e47c9a9d79a6338c1b3d4af7f839cfecfda6df4` | 77-line unified diff against `e6b0a907…` (binary default, `--no-sandbox` removal, sandbox refusal, doc header) |
| `live-out.json` | `0f120a585bbb211d70cb243839eed56ace44ad88f8064a3f3f119d533dca3a6b` | full `--live --json` output at `2b64a52e…` (16/16 admitted, binding null, clean true) |
| `offline.json` | `c2fe41f7a395e0eb634cc8ffcd112168acf8a0162624586432e989ec01375092` | offline gate at the patched commit (16/16, clean) |
| `selftest.json` / `selftest.err` | `5c94e7790dbfb2adc067ae6932ba1ced3b5e458c24cefc5ac99dddc9551078e4` / empty | `--selftest` 27/27, exit 0 |
| `sandbox-probe.txt` | `9eb17373161ac488d4bf4d9cb946f3180a7b92c5810bf0e8375c100b513b5e1a` | no-`--no-sandbox` session + renderer namespace/seccomp table |
| `launcher-probe.txt` | `38214ace8dbf0055c91f949600e07ade3b3f5a0fa4518fe419d10b281c34e21d` | first injection probe; its argv block is truncated by NUL-splitting (see §1), superseded by the row below |
| `launcher-probe-full.txt` | `0a439bb90edc731c6c9c36b2d57892624e0ef7ebf6656f8d9c203c1345fc577c` | unsplit cmdline: all five flags-file flags injected ahead of the caller's args |
| `argv-gate.txt` | `b8ff66594514a0bd04ee0bd951a12a0e809464a56f027446b75156b8cd2a7972` | gate's own chromium argv (11 lines) + forbidden-flag counts all 0 |
| `ExecLiveLeg.md` | this report | — |
