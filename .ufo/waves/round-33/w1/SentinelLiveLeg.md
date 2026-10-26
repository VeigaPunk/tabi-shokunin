# SentinelLiveLeg — C2 security review (round 33, w1)

**Verdict (one paragraph).** The frozen forgery battery and its controls **hold**: executed from my
own `--shared` clone at `e6b0a9074d434ccc307badd312ae7379d1193fea` under `strace -f`, it makes **zero
non-zero-port TCP connections and zero writes outside its own clone and `$TMPDIR`**, never runs the gate
with `--live`, re-asserts the gate's blob digest before every variant (battery:202), and reproduces the
frozen baseline exactly (honest H0/H1/H2 true, `forgeriesAccepted 8/8`, gate `--selftest` exit 0 at
27/27 cases, `digestLiterals []`, counter exit 1). The **gate's live leg does not hold** on two counts I
measured at REV and nowhere reported before: with `--live` it writes outside `$TMPDIR` into the
operator's home (`~/.pki/nssdb/{cert9,key4}.db` — the shared NSS client-certificate store — and
`~/.config/chromium/Crash Reports/settings.dat`), contradicting the header's "write scope: stdout/stderr
only … never reads credentials or session material"; and in its `chromeTmp = caller TMPDIR` branch it
**deletes `.org.chromium.Chromium.*` directories it did not create** (6 of 6 planted foreign dirs gone),
which can kill a concurrently starting chromium in the same TMPDIR. chromedriver's port **is**
loopback-only (127.0.0.1 and ::1, measured), and every run left no chromedriver/chromium behind. The
planned v2 live-leg change is **net-positive and no-harm on this host**: dropping `--no-sandbox` turns
renderer processes from `Seccomp 0`, flat pid namespace into `Seccomp 2`, nested pid namespaces while
the gate still admits 16/16 with a bound live screenshot; running `/usr/lib/chromium/chromium` directly
also admits 16/16 and removes a user-controlled flag-injection channel (`--load-extension`,
`--enable-features`, `--disable-features`, `--ozone-platform`, `--ozone-platform-hint`) whose current
`--load-extension` target does not exist. The two real losses are portability (hard-coded Arch path) and
a hard dependency on a working SUID/userns sandbox (root or userns-restricted hosts → exit 2).

## What I attacked

1. **The battery + controls posture** (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`,
   `.ufo/waves/round-33/baseline/controls.mjs`): lane writes, commit scope, gate execution source,
   network, temp handling — by reading the code and by running the battery once under
   `strace -f -e trace=connect,openat,unlink,unlinkat,mkdir,rename`.
2. **The v1 live leg** as executed at REV (`scripts/check-bidi-runtime.mjs:372-492`), plus **the planned
   v2 live-leg change** (`--no-sandbox` removed, `/usr/bin/chromium` → `/usr/lib/chromium/chromium`),
   built as three scratch copies and measured against the honest round-32 receipt.

No repair was attempted (attack-seat scope).

## 1. Battery + controls: posture holds

Provenance: `git clone --shared …/tabi-shokunin "$S/clone"`, `git -C "$S/clone" checkout -q --detach
e6b0a9074d434ccc307badd312ae7379d1193fea` (exit 0, `rev-parse HEAD` = that hex). Counter bytes
`51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b` = `claims.json` `frozenDigests`.
`TMPDIR=/fast/scratch/hyaku/tabi-r33/SentinelLiveLeg/tmp`.

```
strace -f -e trace=connect,openat,unlink,unlinkat,mkdir,rename -o probe/battery.strace \
  node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
       --repo "$S/clone" --rev e6b0a9074d434ccc307badd312ae7379d1193fea --json
# exit 1  (predicate not met — expected at REV, v1 gate)
# predicate=false honest={H0,H1,H2}=true forgeriesAccepted=8/8
# acceptedForgeries=[F1..F8] selftest.exit=0 "verdict=clean cases=27 passed=27" digestLiterals=[]
```

- **No network.** 17 `connect()` calls in the whole run: 1 `AF_UNIX` to `/run/systemd/resolve/io.systemd.Resolve`,
  9 `AF_INET` + 7 `AF_UNSPEC`, **every port 0** (glibc RFC-3484 route probes). `ports: {0: 16}`,
  `non-zero-port connects: 0` — `probe/battery-connect.txt`. Nothing was fetched; no `--live`, no browser
  (battery:21 states it, and the gate only constructs a live session under `live && rows.length`).
- **No writes outside its own tree.** 2043 write-intent `openat()`s, all under
  `/fast/scratch/hyaku/...` (its clone + `$TMPDIR`), `/dev/null`, and one failing `/dev/tty` `ENXIO`
  (`probe/battery-writes.txt`). **Zero** write-intent opens, unlinks or renames under the lane
  `/home/vgpnk/Projects/shokunin/tabi-shokunin` (its 13,137 lane-path syscalls are all `O_RDONLY`
  `git show`/object reads) — so "no lane writes" is measured, not asserted.
- **Commits only in the clone.** Every `git` call is `-C <clone>` with `-c user.name/email` and
  `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_NO_REPLACE_OBJECTS=1`; the clone's
  toplevel is verified before the first commit (battery:140-142). Lane access is `git show` only.
- **Gate identity is re-asserted per variant** — `probe <= 200`: `sha256(onDisk) !== gateSha` →
  `Refusal('variant … changed the gate bytes')`; the golden generator is imported from the digest-pinned
  v1 blob at `GOLDEN_REV` (`GOLDEN_GATE_SHA256` checked), so golden transcripts cannot drift with REV.
- `--keep` is off by default and the scratch clone is removed in `finally`; `$TMPDIR` was empty afterwards.

**Verdict: holds** (battery = offline, hermetic, read-only on the lane). Residual, informational: the
digest-pinned `golden-gate-v1.mjs` is materialised and `import()`ed from `$TMPDIR`; a hostile `TMPDIR`
would be code execution, so the battery inherits the caller's `TMPDIR` trust (no action for a
scratch-under-`$HYAKU_SCRATCH` run).

## 2. Gate live leg at REV — two defects, two holds

All three variants were run from my clone with the honest round-32 entry and receipt:

```
node <gate-copy> --repo "$S/clone" --rev e6b0a90… --baseline d805d1d6… \
     --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
# L1 (v1 pristine)                         exit 0  admitted 16  failing 0  binding null  live true
# L2 (v1 − --no-sandbox)                  exit 0  admitted 16  failing 0  binding null
# L3 (L2 + /usr/lib/chromium/chromium)    exit 0  admitted 16  failing 0  binding null
```

### S1 — medium — `--live` writes into the operator's home and opens the shared NSS cert store read/write

`strace -f -e trace=connect,openat,unlink,unlinkat,mkdirat` around the L3 live run
(`live-L3.strace`, extract `live-L3-writes.txt`):

```
/home/vgpnk/.pki/nssdb/cert9.db
/home/vgpnk/.pki/nssdb/key4.db
/home/vgpnk/.config/chromium/Crash Reports/settings.dat
```

Content check after the runs (all three paths, `stat`): `settings.dat` mtime advanced to the run
(`2026-10-26T18:31Z`, 40 B) — a real write; `cert9.db` and `key4.db` keep their `2026-10-16` mtime, so
today's runs took **write-intent opens** (`O_RDWR|O_CREAT`) and locks on the shared client-certificate
store without changing its bytes. So: one file is written, two shared DBs are opened read/write.

Why it happens: the gate redirects only `TMPDIR`/`TMP`/`TEMP` for the chromedriver child
(`scripts/check-bidi-runtime.mjs:390` — `env: { ...process.env, TMPDIR: chromeTmp, … }`), so chromium
keeps the real `$HOME`: the NSS client-certificate database and the shared crash-reporter config are
**not** covered by `--user-data-dir` (`:401`).

Impact / exploit path: (a) the header's write scope (`scripts/check-bidi-runtime.mjs:19-26`: "Write
scope: stdout/stderr only … never reads credentials or session material") is false under `--live`;
(b) the run mutates a *shared* store other NSS apps use, and holds a write-intent handle on it while
another browser may be running; (c) chromium opens the user's client-certificate private-key store
during a "local" gate run — nothing off-host receives it (the only navigations are loopback), but a
future `--live` reader cannot rely on the header to conclude "no credential store touched".
Not measured: whether the shared handle can make a concurrent NSS app fail (would raise this above
medium).

Smallest remediation (≈4 lines): create `join(scratch,"home")` and pass `HOME: <that>` in the
chromedriver spawn env at `:390`, plus `--disable-breakpad` in the args at `:401` (the same class of
redirect already done for `TMPDIR`). Then re-run the trace to prove `$HOME` is untouched.

### S2 — medium (narrow trigger) — the caller-TMPDIR branch deletes foreign chromium singleton dirs

`scripts/check-bidi-runtime.mjs:382-389, 489`:

```js
const runtime = process.env.XDG_RUNTIME_DIR;
let chromeTmp = base; let ownChromeTmp = false;
if (scratch.length <= 60) chromeTmp = scratch;
else if (runtime && runtime.length <= 40) { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")); ownChromeTmp = true; }
const preexisting = new Set(readdirSync(chromeTmp));          // :387  snapshot
…
} finally {
  …
  else if (chromeTmp === base) for (const n of readdirSync(base))
    if (!preexisting.has(n) && /^\.?org\.chromium\.Chromium\./.test(n)) rmSync(join(base, n), { recursive: true, force: true });  // :489
```

Measured (`probe/victim.txt`, `probe/live-delete.json`, gate exit 0):

```
# TMPDIR=/fast/scratch/hyaku/tabi-r33/SentinelLiveLeg/tmpX (len 49), XDG_RUNTIME_DIR unset
mid-run: . .. .org.chromium.Chromium.V1 … V6  org.chromium.Chromium.chromium_chrome_url_fetcher_.JOlSb6  tabi-bidi-live-qZsZil
after:   . ..
foreign dirs surviving: 0 of 6
```

Trigger: `TMPDIR` base of 40–62 bytes (so `scratch` > 60) **and** no usable `XDG_RUNTIME_DIR`. The
deletion is by name prefix, not by ownership, so any chromium that starts in the same shared TMPDIR
during the gate run (a CI sibling job, an operator browser pointed at that TMPDIR) loses the directory
holding its `SingletonSocket`; per chromium's launch contract that is a failed or wedged launch. It is
also the branch that deletes the gate's *own* `org.chromium.Chromium.chromium_chrome_url_fetcher_*`
dir, i.e. the code cannot tell "mine" from "not mine" either way.

Smallest remediation: delete only entries whose names the run itself recorded, or drop the branch and
**refuse** (`Refusal` → exit 2 with the byte length) when neither a short `TMPDIR` nor a short
`XDG_RUNTIME_DIR` is available. The latter is smaller and keeps the tool honest.

### H1 — holds — chromedriver's port is loopback-only

```
/usr/bin/chromedriver --port=9517 &
ss -ltnp 'sport = :9517'
LISTEN 0 5 127.0.0.1:9517 0.0.0.0:*  users:(("chromedriver",pid=927947,fd=8))
LISTEN 0 5    [::1]:9517    [::]:*  users:(("chromedriver",pid=927947,fd=7))
```

No `0.0.0.0`, no LAN interface. `--port` is the only network argument the gate passes
(`:390`), and the gate talks to `http://127.0.0.1:${port}`. Residual (low, same-uid only): chromedriver
serves its HTTP API unauthenticated, and `freePort()` (`:361-367`) closes its picker socket *before*
chromedriver binds (`:389-390`), so a local process in the same uid can win the port and impersonate
the driver — including replaying the receipt's own first-screenshot bytes into the binding check.
Anything that can win that race can already write the receipt, so this is hardening, not a boundary:
smallest fix is one line — after `newSession`, assert the session body's `webSocketUrl` port equals
`port` (R1 already forces a loopback ws URL).

### H2 — holds — process cleanup and navigation scope

Every measured run (L1, L2, L3, the deletion-branch run, the seccomp probes) ended with
`pgrep -fa 'chromedriver|chromium'` showing **no process of mine** (only the host's `earlyoom`).
`finally` at `:481-491` does `DELETE /session/<id>`, `cd.kill("SIGTERM")`, `fx.close()`, then removes
its dirs; no `.org.chromium.Chromium.*` or `tabi-bidi-*` leftover in `$TMPDIR`/`XDG_RUNTIME_DIR`.
Navigation stays on the loopback fixture (`R3`/`R10` pin the base URL), and `--user-data-dir` is a
`mkdtemp`-created 0700 directory under the scratch tree.

### Informational — the browser still talks to Google (known, unresolved at REV)

`live-L3-connect.txt` (non-zero-port only):

```
  2  OFFHOST  2001:4860:4860::8888   port=443 connected=True    (IPv6 reachability probe)
  1  OFFHOST  2001:4860:4845:400::   port=443 connected=True
  1  OFFHOST  2001:4860:4845:400::   port=443 connected=False
  2  OFFHOST  2001:4860:4827:7700::  port=443 connected=False
  2  OFFHOST  2800:3f0:4003:c02::54  port=443 connected=False
  1  OFFHOST  2800:3f0:4004:813::200e port=80  connected=False
  1  OFFHOST  2800:3f0:4004:816::200e port=443 connected=False
```

This is the round-32 finding (`.ufo/waves/round-32/w1/ExecNoNetwork.md` §2: 8 TCP connections, 17.8 kB
out / 41.1 kB in, six Google endpoints) still present at REV and in the planned configuration — the
planned live-leg change does **not** address it. It does not touch any predicate (`R10`–`R13` filter on
the loopback base), but the header's "loopback only" is only true of *navigation*. ExecNoNetwork already
measured the fix with 16/16 predicates holding: `--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE
127.0.0.1` (`suppress-all` = resolver pin + background flags → 0 external TCP, 0 bytes). Cheapest v2
line: add the resolver pin to `:401` and cite that measurement.

### Holds on the parsing/plumbing layer

`resolveRev` restricts the revision charset (`:309-314`), `blob` rejects absolute and `..` paths
(`:314-317`), all git calls use argument arrays (no shell), `which()` passes the binary as `"$1"` to `sh
-c` (`:373`) — no injection path from `--rev`, `--entry`, `--receipt`, or a receipt's `driver` string.
The fixture server binds `127.0.0.1` and serves a fixed table (`:126-140`).

## 3. The planned live-leg change: what each edit gains and loses

Measured on this host (`chromium 154.0.8037.97`, `chromedriver 154.0.8037.97`, uid 1000,
`/usr/lib/chromium/chrome-sandbox` mode `4755 root:root`, `kernel.unprivileged_userns_clone=1`, no
`apparmor_restrict_unprivileged_userns`, AppArmor profiles `chromium`/`chrome` present).

### 3a. Remove `--no-sandbox` (`:401`)

**Gains (measured).** Mid-run `/proc/<pid>/status` of the gate's own browser tree:

| variant | renderer `Seccomp` | renderer `NSpid` | admitted |
|---|---|---|---|
| L1 = v1 (`--no-sandbox`) | `0` (browser, zygote, gpu, utility and all five renderers) | flat (`2855611`) | 16 |
| L2 = v1 − `--no-sandbox` | `2` | nested (`2995624  11  1`) | 16 |

So the sandbox becomes real (seccomp-bpf filter + nested pid namespace) *under chromedriver*, with the
same 16/16 admission and a live screenshot still byte-identical to the receipt. For a gate that renders
attacker-shaped content this is the only edit with a security value of its own.

**Loses (measured / inferred).** Nothing on this host. [INFERENCE] On a host where the sandbox cannot
start — root, a missing setuid `chrome-sandbox`, or `kernel.apparmor_restrict_unprivileged_userns=1`
without a `userns,` profile — chromium exits at launch and the gate becomes `exit 2
could-not-evaluate` for every `--live` run instead of measuring. That is an honest failure (better than
passing unsandboxed), but the gate should say so: refuse `--live` when `process.getuid() === 0` and keep
the `(chromium TMPDIR … )` style diagnostic for launch refusal.

### 3b. `/usr/bin/chromium` → `/usr/lib/chromium/chromium` (`:372`)

**What `/usr/bin/chromium` actually is here:** a 14,424-byte compiled launcher (not a shell script) that reads
`/etc/chromium-flags.conf` (**absent**) and `$XDG_CONFIG_HOME/chromium-flags.conf`, then `execve`s
`/usr/lib/chromium/chromium` with the parsed arguments appended — proven with
`strace -f -e trace=execve /usr/bin/chromium --headless=new --version` (the execve line carries
`--ozone-platform --ozone-platform-hint --enable-features --load-extension --disable-features`).

**Gains.** The gate's browser stops inheriting operator-controlled flags: with `--load-extension` the
executed page context was one operator config edit away from arbitrary extension code inside the
gate's headless browser, and `--enable-features`/`--disable-features` change rendering — the one receipt
byte that is not attacker-authored JSON is the PNG, so flag-level render drift is a false-failure (or
false-binding) source. Bypassing the wrapper makes the five arguments at `:401` the complete flag set.

**Loses.** (i) Portability: the path is Arch-specific; [INFERENCE] Debian/Fedora has no
`/usr/lib/chromium/chromium` → exit 2. Keep a `--chromium <path>` argument, or probe
`/usr/lib/chromium/chromium` then fall back and **refuse** if the found binary is the distro wrapper.
(ii) `CHROME_WRAPPER`/`CHROME_DESKTOP` env the launcher sets (strings in the launcher) — irrelevant to
the gate. (iii) Nothing the *operator* relies on for the gate: the flag **names** in
`~/.config/chromium-flags.conf` are `--ozone-platform`, `--ozone-platform-hint`, `--enable-features`,
`--load-extension`, `--disable-features` (values not recorded here; mtime 2026-10-16). Its
`--load-extension` target **does not exist** (checked without printing values), so nothing is loaded
today; the remaining flags serve the operator's desktop session, and L3 measured that the honest
receipt still binds without them (`binding null`, admitted 16) — i.e. the receipt does not depend on
the file.

**Verdict on the planned change:** both edits improve the security axis and harm no measured axis
(three variants, 16/16 each, no leftovers); ship them with (a) the `$HOME` redirect and the S2 branch fix
in the same commit, and (b) the resolver pin, which is the edit that actually closes the off-host
traffic ExecNoNetwork reported and still 16/16.

## Severity summary

| # | Item | Severity | Evidence |
|---|---|---|---|
| S1 | `--live` writes/reads the shared NSS cert DB and crash-reporter config in `$HOME` | medium | `live-L3-writes.txt`, gate:390,401; header:19-26 |
| S2 | `chromeTmp === base` branch deletes foreign `.org.chromium.Chromium.*` dirs | medium (narrow trigger) | `victim.txt`, gate:387,489 |
| S3 | unauthenticated chromedriver + `freePort` close-then-rebind race | low | `ss` output, gate:361-367,389-390 |
| S4 | off-host TLS during `--live` (known round-32; not fixed by the planned change) | informational | `live-L3-connect.txt`, ExecNoNetwork §2 |
| — | battery: offline, lane-read-only, clone-only commits, gate-digest re-asserted | holds | `battery-connect.txt`, `battery-writes.txt`, battery:140-142,202 |
| — | chromedriver port bound loopback only | holds | `ss` |
| — | process cleanup, loopback navigation, `--user-data-dir` 0700 | holds | every run's `pgrep` |
| — | planned edits (`--no-sandbox` out, direct binary) | no harm, net gain | seccomp table, L2/L3 JSON |

## Commands and exit codes (all from `/fast/scratch/hyaku/tabi-r33/SentinelLiveLeg`)

| Command | Exit |
|---|---|
| `git clone --shared …/tabi-shokunin "$S/clone"`; `git -C clone checkout --detach e6b0a90…` | 0 |
| `strace -f … node .ufo/…/c2-bidi-forgery-battery.mjs --repo "$S/clone" --rev e6b0a90… --json` | 1 (predicate not met at REV — expected) |
| `node probe/gate-L1.mjs --repo clone --rev e6b0a90… --baseline d805d1d6… --entry … --live --json` | 0 |
| `node probe/gate-L2.mjs … --live --json` (`live-L2.exit`) | 0 |
| `node probe/gate-L3.mjs … --live --json` (`live-L3.exit`) | 0 |
| `strace -f -e trace=connect,openat … node probe/gate-L3.mjs … --live` | 0 |
| `env -u XDG_RUNTIME_DIR TMPDIR=$S/tmpX node probe/gate-L3.mjs … --live` (planted 6 foreign dirs) | 0 |
| `/usr/bin/chromedriver --port=9517` + `ss -ltnp 'sport = :9517'` | 0 (loopback only) |
| `strace -f -e trace=execve /usr/bin/chromium --headless=new --version` | 0 (wrapper execs with the 5 file flags) |
| `kernels: /proc/sys/kernel/unprivileged_userns_clone` = 1; `apparmor_restrict_unprivileged_userns` absent; `ls -l /usr/lib/chromium/chrome-sandbox` = `-rwsr-xr-x root root` | — |

**Honesty / boundaries.** No repair was made and no lane file was touched (lane reads only; the three
gate copies are scratch fixtures built from my clone). My own live runs exercised the gate as shipped,
so they produced S1's effect on this host themselves — `~/.config/chromium/Crash Reports/settings.dat`
mtime is now `2026-10-26T18:31Z` (that is the defect demonstrating itself, not an incidental cleanup).
No network fetch was performed, so there are no URL/time/status/sha256 fetch receipts to record. Not
tested: a root run, a host without the setuid sandbox or with AppArmor userns restriction (marked
[INFERENCE]), a network-namespace run (ExecNoNetwork covers it), and whether the NSS write-intent
handle can fail a concurrent NSS app. The raw 18 MB battery strace is not retained; its derived extracts
and totals are. My runs' chromedriver/chromium are all gone
(`pgrep -fa 'chromedriver|chromium'` → only the host's `earlyoom`); `$TMPDIR` is empty; the scratch tree
is removed after the receipts above were copied. No tools installed or upgraded.

## Deliverables

`.ufo/waves/round-33/w1/SentinelLiveLeg/` — `battery.json`, `battery.err`, `battery-connect.txt`,
`battery-writes.txt`, `live-L1.json`, `live-L2.json`, `live-L3.json`, `live-L2.exit`, `live-L3.exit`,
`live-L1-connect.txt`, `live-L3-connect.txt`, `live-L3-writes.txt`, `seccomp-L1.txt`, `seccomp-L2.txt`,
`victim.txt`, `live-delete.json`, `ss-chromedriver.txt`, `wrapper-execve-flags.txt`, `wrapper.strace`,
`runs.txt`, and the three gate copies
(`gate-L1-v1-pristine.mjs` = sha256 `2f25af5a…c393`, `gate-L2-no-no-sandbox.mjs`,
`gate-L3-direct-binary.mjs`).

`probe/…` names quoted in the body above are the scratch names those receipts had while the runs were
live; the same bytes are delivered here under their bare names. The 18 MB battery `strace` is not
retained — its derived counts and path extracts (`battery-connect.txt`, `battery-writes.txt`) are.
