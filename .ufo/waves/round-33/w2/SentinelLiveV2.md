# SentinelLiveV2 — C2 live-leg security re-check at `042d6d9a` (round 33, w2)

**Verdict.** Four of the five items I was sent to attack **hold**; **item 1 is a defect (severity:
medium)**. The integrated v2 gate still reaches the operator's real home when `--live` runs:
`scripts/check-bidi-runtime.mjs:601` overrides `TMPDIR/TMP/TEMP/HOME/XDG_CONFIG_HOME/XDG_CACHE_HOME`
for the chromedriver child but **not `XDG_DATA_HOME`**, and this host exports
`XDG_DATA_HOME=/home/vgpnk/.local/share`, so chromium's NSS initialisation escapes the throwaway
`HOME` and opens the operator's *client-certificate and private-key store*
`/home/vgpnk/.local/share/pki/nssdb/cert9.db` and `key4.db` with `O_RDWR|O_CREAT` (measured identically
in two independent live runs), plus a fontconfig `unlink()` attempt on
`/home/vgpnk/.local/share/fonts/.uuid` (`ENOENT`). Both the file-header claim
(`:21-22` "the operator's ~/.pki NSS store and ~/.config/chromium are never opened … never reads
credentials") and the code comment (`:594-595` "so the operator's home is never touched") are therefore
false under `--live`. No bytes of the store changed in these runs (mtimes still 2026-10-03), `~/.pki`
specifically and `~/.config/chromium` are not touched, and the escape is causally pinned: with
`XDG_DATA_HOME` unset the same store is created **inside the scratch home** and the run leaves **zero**
write-intent opens under `/home`. The rest holds: no deletion outside dirs the gate created (both the
`chromeTmp = scratch` and the `XDG_RUNTIME_DIR` branches, with foreign `.org.chromium.Chromium.*` dirs
planted in both and all of them surviving); chromium's execve argv is the real binary
`/usr/lib/chromium/chromium` with `--no-sandbox` **0** occurrences and none of the host flags-file's five
flags, with renderers genuinely sandboxed (`Seccomp=2`, `NSpid` depth 3); chromedriver binds loopback
only (`127.0.0.1` + `::1`, from `bind()` syscalls and from `ss` for its own pid); and both
singleton-socket refusal branches exit **2**, print the byte lengths, spawn no browser, remove only their
own `mkdtemp` scratch and leave no leftovers.

## What I attacked and how

One live `--shared` clone, every run at the integrated revision, gate blob taken from the clone:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1 # exit 0
git -C "$S/clone" rev-parse --show-toplevel  → /fast/scratch/hyaku/tabi-r33/SentinelLiveV2/clone
sha256(HEAD:scripts/check-bidi-runtime.mjs) = 62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75
                                             = the lane worktree file (diff empty) → my line citations are at REV
```

Every live invocation is the honest round-33 configuration, unchanged from `measure.sh:44`:

```
node "$CLONE/scripts/check-bidi-runtime.mjs" --repo "$CLONE" \
  --rev 042d6d9abf97d567d495652a85eabc851b81adc1 \
  --baseline d805d1d6132430118b206a848b85753ab35d1014 \
  --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
```

| run | configuration | exit | gate result |
|---|---|---|---|
| 1 | `TMPDIR=$S/tmp_long` (52 B), `XDG_RUNTIME_DIR=/tmp/sv2rt` (10 B); `strace -f -e trace=openat,unlinkat,rmdir,connect,execve` | 0 | live true, population 17, admitted 16, failing 0, unmeasured 1, binding null, clean true |
| 2A | `XDG_RUNTIME_DIR` unset, `TMPDIR=$S/tmp_long`; same strace set | **2** | refused, no browser |
| 2B | `XDG_RUNTIME_DIR=$S/rt` (46 B > 40), `TMPDIR=$S/tmp_long` | **2** | refused, no browser |
| 3 | `TMPDIR=/tmp/sv2t` (9 B → `chromeTmp = scratch`); same strace set | 0 | 16/16, clean |
| 4 | `TMPDIR=/tmp/sv2u`; `strace -e trace=bind,connect,execve` | 0 | 16/16, clean |
| 5 | `XDG_DATA_HOME` and `XDG_STATE_HOME` unset, `TMPDIR=/tmp/sv2v`; `strace -e trace=openat,execve` | 0 | 16/16, clean |
| 7 | `TMPDIR=/tmp/sv2x`; `/proc` poll keyed on the run's unique `--user-data-dir` | 0 | 16/16, clean |
| 8 | `TMPDIR=/tmp/sv2y`; `strace -e trace=unlink,unlinkat,rename,renameat,renameat2,rmdir,mkdirat,execve` | 0 | 16/16, clean |

(Run 6 was a shell-based `/proc` poll that captured only 2 pids; it is superseded by run 7 and is not
cited. An earlier attempt at case 2A was malformed — `env TMPDIR=… -u XDG_RUNTIME_DIR` gave exit 127
without running the gate — and was rerun with the option first; the receipt notes this.)

## Item 1 — open/write under the real `$HOME`: **defect (medium)**

Evidence (run 1; run 3 reproduces the same two lines; both are full straces of the gate):

```
$ grep -E 'openat\(' run1/live.strace | grep -E 'O_WRONLY|O_RDWR|O_CREAT' | grep -F '"/home/'
98241 openat(…, "/home/vgpnk/.local/share/pki/nssdb/cert9.db",
             O_RDWR|O_CREAT|O_NOFOLLOW|O_CLOEXEC, 0644) = 143</home/vgpnk/.local/share/pki/nssdb/cert9.db>
98241 openat(…, "/home/vgpnk/.local/share/pki/nssdb/key4.db",
             O_RDWR|O_CREAT|O_NOFOLLOW|O_CLOEXEC, 0644) = 145</home/vgpnk/.local/share/pki/nssdb/key4.db>
98241 openat(…, "/home/vgpnk/.local/share/pki/nssdb/pkcs11.txt", O_RDONLY) = 143
```

* **Exactly two write-intent opens under `/home` in the whole trace**, both the NSS store; the same two
  appear in run 3 (`915032`) and in *neither* run does anything else under `/home` get a write-intent
  handle (`home-write-audit.txt`).
* `~/.pki` (the path the header names) is **not** opened; `~/.config/chromium` is **not** opened —
  crashpad was redirected correctly (`--database=…/tabi-bidi-live-VTF6hV/home/.config/chromium/Crash
  Reports`, `settings.dat` created there). The escape is a *different* XDG root.
* Non-`openat` write attempts under `/home` (run 8): `1804495 unlink("/home/vgpnk/.local/share/fonts/.uuid")
  = -1 ENOENT` — fontconfig resolving the real `XDG_DATA_HOME`; no such file exists, nothing removed,
  `~/.local/share/fonts` mtime still `2026-10-03 17:44`.
* Causal proof (run 5, identical command with `XDG_DATA_HOME`/`XDG_STATE_HOME` unset): the same store is
  created **inside the scratch home** —
  `/tmp/sv2v/tabi-bidi-live-t9bNy1/home/.local/share/pki/nssdb/{pkcs11.txt,cert9.db,key4.db,*.db-journal}`
  — and the write-intent opens under `/home` drop to **0**. So the escape is the inherited
  `XDG_DATA_HOME`, not `HOME`.

**Exploit path.** Any `--live` run from a shell with `XDG_DATA_HOME` exported (this host's default is
`/home/vgpnk/.local/share`) holds a read-write handle on `key4.db` — the operator's client-certificate
private-key database — for the duration of the session, from a run advertised as local and
credential-free. Consequences that do not need an attacker page: an NSS/Chromium schema change or a
write during session teardown mutates or journals the shared store; a crash between open and close can
leave a journal or lock behind; a concurrently running NSS consumer contends on the same file locks.
Navigation stayed on the loopback fixture, so nothing off-host received the store.

**Line evidence.** `scripts/check-bidi-runtime.mjs:601` is the defect site (`env: { ...process.env,
TMPDIR: chromeTmp, TMP: chromeTmp, TEMP: chromeTmp, HOME: home, XDG_CONFIG_HOME: join(home, ".config"),
XDG_CACHE_HOME: join(home, ".cache") }` — no `XDG_DATA_HOME`/`XDG_STATE_HOME`; the string
`XDG_DATA_HOME` does not occur anywhere in the file). `:596-598` create only `home/.config` and
`home/.cache`. The falsified claims are `:21-22` (header) and `:594-595` (comment "so the operator's
home is never touched", written directly above the incomplete env).

**Smallest remediation** (≈3 lines at `:596-598`/`:601`): `mkdirSync(join(home, ".local/share"))` and
`mkdirSync(join(home, ".local/state"))`, then add `XDG_DATA_HOME: join(home, ".local/share"),
XDG_STATE_HOME: join(home, ".local/state")` to the spawn env — the configuration run 5 already measures
as leaving `$HOME` untouched — and drop the now-false absolutes in `:21-22`/`:594-595`. (A stricter
variant: replace `...process.env` with an allow-list, which also removes the session-bus inheritance
noted below.)

## Item 2 — deletion outside dirs the gate created: **holds**

Planted before each run, never removed:

| planted | where | after run |
|---|---|---|
| `.org.chromium.Chromium.FAKE1`, `FAKE2` (`+marker`) | `/tmp/sv2rt` (the `XDG_RUNTIME_DIR` branch) | both present |
| `.org.chromium.Chromium.FAKE3`, `FAKE4` | `$S/tmp_long` (caller `TMPDIR` base) | both present |
| `.org.chromium.Chromium.SVFAKE1..3` | `/tmp/sv2t`, the `chromeTmp = scratch` branch | all three present |

All 243 deletion syscalls in run 1 resolve to the gate's own `mkdtemp` tree
`…/tmp_long/tabi-bidi-live-VTF6hV` (profile, scratch `home`, crash dumps) or to its own
`XDG_RUNTIME_DIR` scratch `/tmp/sv2rt/tabi-bidi-WywHnt` — including the removal of that scratch itself
(`deletion-audit.txt`: "non-scratch absolute targets" is empty for run 1, run 3 and run 8). Run 8 adds
the syscalls the first trace set could not see (`unlink`, `rename`): all 24 `unlink` and 34 `rename`
targets are under `…/tabi-bidi-live-iBhtzw`, `mkdirat` count 0, and no deletion or rename names `/home`,
`/run`, `/usr`, `XDG_RUNTIME_DIR` outside its own dir, or the `TMPDIR` base. The w1 S2 defect
(name-prefix deletion of foreign `.org.chromium.Chromium.*` in the caller's `TMPDIR`) is genuinely gone:
`:593` refuses instead, and `:703-704` remove only `ownChromeTmp` and `scratch`.

## Item 3 — chromium execve argv: **holds**

Full browser argv (`execve-argv-audit.txt`, pid 97531):

```
/usr/lib/chromium/chromium --allow-pre-commit-input --disable-background-networking
  --disable-background-timer-throttling --disable-backgrounding-occluded-windows
  --disable-client-side-phishing-detection --disable-default-apps
  --disable-features=IgnoreDuplicateNavs,Prewarm --disable-gpu --disable-hang-monitor
  --disable-popup-blocking --disable-prompt-on-repost --disable-sync --enable-automation
  --enable-logging --headless=new --log-level=0 --no-first-run --no-service-autorun
  --password-store=basic --remote-debugging-port=0 --test-type=webdriver --use-mock-keychain
  --user-data-dir=/…/tabi-bidi-live-VTF6hV/profile
```

* real binary: `execve("/usr/lib/chromium/chromium"…) = 3` execs (browser + 2 zygotes);
  `execve("/usr/bin/chromium"…) = 0` — the flags-injecting launcher is never run.
* `--no-sandbox`: **0 occurrences in the entire trace** (all processes). The only sandbox-related
  token is `--no-zygote-sandbox` on one zygote's own command line, Chromium's namespace-sandbox
  launch marker (the other zygote execs without it).
* host flags-file flags: `--ozone-platform` 0, `--ozone-platform-hint` 0, `--load-extension` 0,
  `--enable-features=TouchpadOverscrollHistoryNavigation` 0, `--disable-features=Vulkan` 0. The
  `--disable-features=IgnoreDuplicateNavs,Prewarm` entry is chromedriver's own WebDriver switch (the
  host flags file carries `Vulkan`, which is absent).
* the sandbox is actually engaged (run 7, `/proc` poll of the whole browser tree):
  `--type=renderer seccomp=2 nspid_depth=3` ×5, `--type=utility seccomp=2 nspid_depth=3`,
  two zygotes at `nspid_depth=2` — i.e. seccomp-bpf filters plus nested pid namespaces, not a flat
  unsandboxed tree.

## Item 4 — chromedriver bound to loopback only: **holds**

Syscall-level (run 4 `bind()`, the gate's own chromedriver on port 39283):

```
bind(8, {AF_INET,  sin_port=39283, sin_addr=inet_addr("127.0.0.1")}) = 0
bind(7, {AF_INET6, sin6_port=39283, inet_pton(AF_INET6,"::1")})     = 0
```

No `bind()` to `0.0.0.0` anywhere in the trace; the other `AF_INET` binds are chromium's
`--remote-debugging-port=0` sockets, all on `127.0.0.1`, plus the singleton socket
`/tmp/sv2u/tabi-bidi-live-VemLtl/org.chromium.Chromium.UZlsPq/SingletonSocket`. Socket-level, for the
gate's *own* chromedriver pid (from the strace execve, so not a sibling seat's browser):

```
run1 pid 95374:  LISTEN 127.0.0.1:37287 / LISTEN [::1]:37287
run3 pid 913479: LISTEN 127.0.0.1:35455 / LISTEN [::1]:35455
run3 ss sample: 30 rows, rows not on 127.0.0.1/::1 = 0
```

Residual, unchanged from w1 S3 and **not** a regression: `freePort()` (`:361-367`) closes its picker
socket before chromedriver binds (`:601`), so a same-uid process can win the port; anything that can do
that can already write the receipt. One-line hardening remains available (assert the session body's
`webSocketUrl` port equals `port`).

## Item 5 — refusal branches exit 2 cleanly, no leftovers: **holds**

| case | exit | stderr | chromedriver/chromium spawns | deletions | leftovers |
|---|---|---|---|---|---|
| A: `TMPDIR` 52 B, `XDG_RUNTIME_DIR` unset | **2** | `could-not-evaluate detail=no short directory for chromium's singleton socket (TMPDIR 52 bytes, XDG_RUNTIME_DIR unset); set a TMPDIR of at most 40 bytes` | 0 | only `rmdir(…/tmp_long/tabi-bidi-live-PmNqvO)` (its own scratch) | 0 `tabi-bidi*`; both planted foreign dirs intact |
| B: `TMPDIR` 52 B, `XDG_RUNTIME_DIR` 46 B | **2** | same, `XDG_RUNTIME_DIR 46` | 0 | only `rmdir(…/tabi-bidi-live-79mL7z)` | 0 `tabi-bidi*`; FAKE7/FAKE8 intact |

stdout is empty in both (0 bytes) — a refusal never prints a JSON verdict a caller could mistake for a
measurement — and `pgrep -fa 'chromedriver|chromium'` shows no process of mine afterwards. The
`which()` preflight still runs `sh -c 'command -v chromedriver'` before the refusal (harmless, no
browser). The third refusal path (sandbox unavailable, `:579-580`, `:618`) is not dynamically
reachable on this host: both `chrome-sandbox` (setuid root) and `kernel.unprivileged_userns_clone=1`
are available.

## Residuals and non-findings (reported, not defects of v2)

* **Off-host TLS during `--live` persists** (known from round 32, not addressed by v2): 9 non-zero-port
  off-host `connect()` rows in run 1, two of them successful, both `2001:4860:4860::8888:443`
  (Google anycast); the rest `-1` (unreachable v6). Loopback rows are the fixture (`:43391`), the
  four chromedriver/webSocket ports, and one `127.0.0.1:443`. The header's "loopback only" is true of
  *navigation*, not of the process's sockets.
* **Session environment is inherited, not scrubbed** (`:601` spreads `process.env`): the child keeps
  `DBUS_SESSION_BUS_ADDRESS`/`XDG_RUNTIME_DIR` and connected to `/run/user/1000/bus` (2×) and
  `/run/dbus/system_bus_socket` (1×). Same root cause class as the item-1 defect; no credential was
  read through it in these runs.
* **`XDG_RUNTIME_DIR` scratch is a write outside `TMPDIR`** when the caller's `TMPDIR` is long
  (`:591-592`): the gate creates and removes its own `tabi-bidi-*` dir there. Documented in the code
  comment and confirmed harmless to foreign dirs (item 2), but it is not covered by the header's
  "dirs under TMPDIR" wording.
* 41 port-0 `connect()` calls are glibc/Chromium RFC-3484 route probes (no connection), and 7
  `/run/systemd/resolve/io.systemd.Resolve` connects are the resolver — both benign.

## Limits of this check

* The live leg is not part of the frozen C2 predicate (`claims.json` killRule) — this is no-harm /
  security evidence only. I did not run the forgery battery or `--selftest`; other seats own those.
* One host build (`chromium`/`chromedriver` 154.0.8037.97), one uid, no `AppArmor` userns restriction;
  the item-1 escape is a function of the *exported* `XDG_DATA_HOME`, which is common but not universal.
* No `--no-sandbox` can be observed absent from *another* code path: this is a measurement of the
  integrated gate at `042d6d9a`, not a proof about future edits.

## Commands and exit codes

All from `S=/fast/scratch/hyaku/tabi-r33/SentinelLiveV2`, `TMPDIR` always under `$S` or a short
`/tmp/sv2*` dir, gate run only from `$S/clone`.

| command | exit |
|---|---|
| `git clone --shared …tabi-shokunin "$S/clone"`; `checkout --detach 042d6d9a…`; `rev-parse --show-toplevel` | 0 |
| `bash run1.sh` (honest `--live`, `strace -f -e trace=openat,unlinkat,rmdir,connect,execve`) | gate 0 |
| `bash run2.sh` — case B (`XDG_RUNTIME_DIR` 46 B) | gate **2** |
| `env -u XDG_RUNTIME_DIR TMPDIR=$S/tmp_long strace … node … --live --json` — case A | gate **2** |
| `bash run3.sh` (short `TMPDIR`, planted foreign dirs) | gate 0 |
| `bash run4.sh` (`strace -e trace=bind,connect,execve`) | gate 0 |
| run 5 (`env -u XDG_DATA_HOME -u XDG_STATE_HOME … --live`, openat trace) | gate 0 |
| run 7 (`python3 poll_tree.py /tmp/sv2x/ …` + `--live`) | gate 0 |
| run 8 (`strace -e trace=unlink,unlinkat,rename,renameat,renameat2,rmdir,mkdirat,execve … --live`) | gate 0 |
| `pgrep -fa 'chromedriver\|chromium'` after every run and at exit | no browser process of mine; at exit the only match is the host's `earlyoom` whose own `--prefer` regex text contains the word `chromium` (1371), filtered out → `no browser process of any seat` |

**Hygiene.** No lane file, lane index/jj state, fleet repo, sibling repo or `/home/vgpnk/Projects/shokuknow`
was written; every git call was `git -C "$S/clone"` with the toplevel asserted
(`/fast/scratch/hyaku/tabi-r33/SentinelLiveV2/clone`), no commit was made anywhere. No tool was
installed or upgraded (host `chromium`/`chromedriver` 154.0.8037.97 and node v24.21.0 sufficed), no
pacman transaction ran, and I made **no external HTTPS requests** (so no fetch receipts). All browser
runs navigated only to the gate's own `127.0.0.1` fixture. Scratch
(`$HYAKU_SCRATCH/tabi-r33/SentinelLiveV2`, incl. the clone) and `/tmp/sv2{rt,t,u,v,w,x,y}` are removed
after the receipts below were copied.

## Deliverables (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/SentinelLiveV2/`)

| file | sha256 | contents |
|---|---|---|
| `home-write-audit.txt` | `748c656968e74a333861d7827c89d54520bd400223f1916448ccc8f213a2c2e0` | write-intent opens under `/home` for runs 1/3/5, all `/home` paths by dir, run-8 non-open syscalls under `/home`, run-5 scratch-NSS proof |
| `execve-argv-audit.txt` | `4bc5d302a3e349d1ddbebb9a2755b2e034f11cff21fbde09d0334aa9fa633e87` | full browser argv, zygote argv, forbidden-flag counts, launcher count |
| `deletion-audit.txt` | `20ada78ab0eccf0d860e8390b1d33578d093b2eea8072f66458ba75cda67b40b` | every deletion/rename target of runs 1/3/8, grouped, plus the non-scratch subset (empty) |
| `network-audit.txt` | `35e1ca48976302a7dd2906369c642443355834928210913cf29464c33715151c` | parsed connect destinations (loopback/off-host), `bind()` syscalls, `ss` rows for the gate's own chromedriver pid |
| `refusal-summary.txt` | `96e048d835eed4f7107c3a1c74517e9b95a684c6cdb4f8ecf47a2cf8707af507` | both refusal cases: exit, stderr, spawn count, deletions, leftovers, foreign dirs |
| `foreign-dir-survival.txt` | `0996a74287605d95ce2e70864303ca4a5ccd11d00001e1768bfae78556b0d900` | planted dirs before/after in `TMPDIR` base, `XDG_RUNTIME_DIR`, and the short-`TMPDIR` branch |
| `sandbox-state.txt` | `d9cbc1849d4bba705fb68c188930d7b76981a315a93c97ac38bd7e7a7d33b385` | run-7 `/proc` table: type × Seccomp × NSpid depth |
| `live-run1.json`, `live-run3.json`, `live-run5.json`, `live-run7.json`, `live-run8.json` | `1e49aa11d4baeec0be0fd030e6dc891a3231fede2e5af0c51841b85331dd84e4` (all five identical — deterministic output) | full `--live --json` verdicts (16 admitted, failing 0, binding null, clean true) |
| `SentinelLiveV2.md` | this report | — |
