# Host cross-check for S128 (seat ScribeSrcLauncher, round 33 w1)

All commands read-only; no pacman transaction was run (queries only). `pacman` transactions are
paused host-wide per the operator rule, and nothing needed installing.

## Commands and outcomes

```
$ pacman -Qi chromium                          # exit 0
Name            : chromium
Version         : 154.0.8037.97-1
Install Date    : Tue 20 Oct 2026 09:16:36 AM -03
Build Date      : Fri 09 Oct 2026 07:41:57 AM -03
Packager        : Jonathan Grotelüschen <tippfehlr@archlinux.org>
Install Reason  : Explicitly installed

$ pacman -Qo /usr/bin/chromium                 # exit 0
/usr/bin/chromium is owned by chromium 154.0.8037.97-1

$ pacman -Ql chromium | grep -E '/usr/bin/chromium$|LICENSE.launcher|chromium.desktop$'   # exit 0
chromium /usr/bin/chromium
chromium /usr/share/applications/chromium.desktop
chromium /usr/share/licenses/chromium/LICENSE.launcher

$ file -L /usr/bin/chromium                    # exit 0
/usr/bin/chromium: ELF 64-bit LSB pie executable, x86-64, ... stripped
$ ls -la /usr/bin/chromium                     # exit 0
-rwxr-xr-x 1 root root 14424 Oct  9 07:41 /usr/bin/chromium

$ sha256sum /usr/bin/chromium
eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b   # == the launcher digest the lane's
                                                                    # round-16/17 receipts already recorded
$ sha256sum /usr/lib/chromium/chromium
95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a   # == round-16/17 exec-target digest

$ strings -a /usr/bin/chromium | grep -nE 'chromium-flags\.conf|XDG_CONFIG_HOME|\.config|/usr/lib/chromium/chromium|Chromium launcher'   # exit 0
43:chromium-flags.conf
45:XDG_CONFIG_HOME
46:.config
55:/usr/lib/chromium/chromium
56:Chromium launcher %s -- for Chromium help, see `man %s`

$ strings -a /usr/bin/chromium | grep -c 'Custom flags are read in order from the following files:'
1
$ strings -a /usr/bin/chromium | grep -n 'Currently detected flags\|Arguments included in those files\|unbalanced quotes'
48:Currently detected flags:
60:Arguments included in those files are split on whitespace and shell quoting
62:symbol (#) are skipped. Lines with unbalanced quotes are skipped as well.
```

`launcher.c` at the pinned commit contains the same three help-template phrases
(`grep -c 'Custom flags are read in order from the following files' launcher.c` → 1), so the
installed 14,424-byte ELF carries the pinned source's literals verbatim.

## Flags-file presence (metadata and match counts only — contents never printed)

```
$ ls -l /etc/chromium-flags.conf
ls: cannot access '/etc/chromium-flags.conf': No such file or directory
$ ls -l "$HOME/.config/chromium-flags.conf"
-rw-r--r-- 1 vgpnk vgpnk 212 Oct 16 23:58 /home/vgpnk/.config/chromium-flags.conf
$ echo "${XDG_CONFIG_HOME:-<unset>}"
/home/vgpnk/.config
$ stat -c '%s %a' ~/.config/chromium-flags.conf  ->  212 644
$ wc -l < ~/.config/chromium-flags.conf         ->  5
$ grep -cF -- <flag> ~/.config/chromium-flags.conf
--no-sandbox                0
--disable-web-security      0
--user-data-dir             0
--remote-debugging-port     0
--headless                  0
--load-extension            1
```

Consequences for the live leg (facts only, no repair):

1. `XDG_CONFIG_HOME` is set, so `launcher.c:23-24` selects
   `$XDG_CONFIG_HOME/chromium-flags.conf` — exactly the file above. Redirecting `HOME` alone does
   **not** move it; `XDG_CONFIG_HOME` must be redirected too (consistent with
   `corpus/knowledge/webmcp-chromium-loopback-round-16.md:36`).
2. `/etc/chromium-flags.conf` does not exist on this host, but `launcher.c:15,91-94` reads it
   unconditionally before the user file, so `HOME`/`XDG_CONFIG_HOME` redirection does not cover it
   (consistent with `corpus/knowledge/harness-hardening-round-18.md:62`).
3. The host flags file today injects one `--load-extension` argument — i.e. extension code into
   every launch through `/usr/bin/chromium`, which is a positive reason the v2 live leg launches
   `/usr/lib/chromium/chromium` directly rather than through the launcher.
4. `--no-sandbox` is absent from the host flags file today (count 0); that is an observation about
   this file on 2026-10-26, not a property of the launcher — a launcher-mediated launch executes
   whatever the file says, so "no `--no-sandbox`" cannot be guaranteed from the typed argv.

## Deliberate non-run

`/usr/bin/chromium --help` was **not** run: `launcher.c:98-102` returns the help text plus a
"Currently detected flags" dump of the real flags file, which would print the host user's flag
lines. Identity was established from the binary literals above instead. No chromedriver/chromium
process was started by this seat (`pgrep -fa 'chromedriver|chromium'` shows no process of mine).
