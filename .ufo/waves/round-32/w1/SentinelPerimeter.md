# SentinelPerimeter — C1 browser-run perimeter review (round 32, w1)

Seat: SentinelPerimeter (leaf, attack-only: findings, no repairs).
Scope attacked: `scripts/check-bidi-runtime.mjs` `liveRecord()`/`serveFixture()` (frozen bytes,
sha256 `2f25af5a…c393`) and the launch flags C1's browser runs will use; the committed
transcripts C1's receipt will carry. Not attacked: C2, the counter's admission logic
(accept/reject), the claim arithmetic.

## Verdict

**The frozen counter's live leg works on this host, but four deviations from the perimeter it
documents are real.** (1) `--no-sandbox` is **not needed here** — a chromedriver session without
it succeeds and its renderers are genuinely sandboxed (Seccomp 2 / NoNewPrivs 1 / own user
namespace), while with it every renderer runs at Seccomp 0 in the caller's namespace as uid 1000
(Medium: needless privilege removal on every evidence run; the frozen bytes keep it). (2) The
`/usr/bin/chromium` launcher **prepends the host user's `~/.config/chromium-flags.conf`** to every
launched browser — confirmed in the executed argv — so an evidence run inherits host-user flags;
I demonstrated with a local proxy that `--proxy-server` + `--proxy-bypass-list=<-loopback>` sends
the "loopback only" fixture request off loopback (Medium: the counter enforces loopback by choosing
URLs, not by a fence, and the measured pixels depend on host config). (3) Even with the counter's
own argv, the browser opens URL requests to **eight non-loopback Google hosts** (netlog), and a
proxy test showed live CONNECTs — the header's "serves FIXTURE on 127.0.0.1 only, never navigates
off loopback" is true for navigation only (Medium). (4) chromedriver listens unauthenticated on
127.0.0.1 **and [::1]** with no `--allowed-ips`/`--allowed-origins` and spawns a browser as the
invoking user: `nobody` got `200 ready:true` from `/status` on my live port (Low on a single-human-
user host; the same loopback race as `freePort()` lets a local racer impersonate the driver).
The fixture server itself is clean: 127.0.0.1-only, ephemeral, traversal-safe, and the R15 cookie
is fixture-only (exactly one cookie in a throwaway profile). The transcripts **do** carry one host
path (`capabilities.chrome.userDataDir`) plus dead session material (`webSocketUrl`/`sessionId`,
`goog:processID`, `debuggerAddress`), all unconsumed by the counter's predicates and therefore
safe to redact before commit; `chrome.chromedriverVersion` must stay verbatim or t3 breaks.

## Evidence (commands, exit codes)

Setup: `git clone --shared … tabi-shokunin "$S/clone"` → `git -C "$S/clone" checkout -q --detach 4181fffb…` exit 0,
`git status --porcelain | wc -l` = `0`, `sha256sum scripts/check-bidi-runtime.mjs` =
`2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` (matches `claims.json` frozenDigests).
`S=/fast/scratch/hyaku/tabi-r32/SentinelPerimeter`, all runs `TMPDIR=$S/tmp` or `/run/user/1000`.

### F1 — `--no-sandbox` is not required on this host (Medium)

Counter: `scripts/check-bidi-runtime.mjs:401` —
`args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", ...]`.

Host state: `/usr/lib/chromium/chrome-sandbox` is `-rwsr-xr-x root root` (SUID sandbox present),
`/proc/sys/kernel/unprivileged_userns_clone` = `1`, `/usr` mounted `rw,noatime,…` (no `nosuid`),
`systemd-detect-virt` = `none`.

Probe (`probe-d.mjs`, chromedriver 154.0.8037.97 + `/usr/bin/chromium` 154.0.8037.97, profile under
`/run/user/1000/probe-d-*/profile`, exit 0 both runs):

| session args | new session | renderer `/proc/<pid>/status` | `/proc/<pid>/ns/user` |
|---|---|---|---|
| `--headless=new --no-first-run --disable-gpu` | **created** (`session.ok:true`) | `Seccomp: 2`, `Seccomp_filters: 1`, `NoNewPrivs: 1`, `CapEff: 0`, `NSpid: <pid> <n> 1` | `user:[4026533796]` (≠ shell `4026531837`) |
| same + `--no-sandbox` | created | `Seccomp: 0`, `Seccomp_filters: 0`, `NoNewPrivs: 1`, `NSpid: <pid>` | `user:[4026531837]` (same as shell) |

Receipts: `w1/SentinelPerimeter/probe-d-nosandbox.json`, `probe-d-withsandboxflag.json`.

Not the sandbox, but worth pinning so nobody re-attributes it: a session **without** `--no-sandbox`
under a long TMPDIR fails with
`FATAL:chrome/browser/process_singleton_posix.cc:313] Socket path too long: …/org.chromium.Chromium.*/SingletonSocket`
(`probe-c.mjs`), i.e. the `5ad1fcbf` TMPDIR fix, not the sandbox.

Exploit path / impact: with `--no-sandbox`, a compromised renderer (fixture script, or any extension
loaded via F2) executes as uid 1000 with the user's full file access; the same renderer under the
default sandbox is confined to a new user namespace with seccomp. Today the fixture is static and
attacker-free, so this is latent, not reachable — but it is a free risk reduction this host does
not need to carry, and the lane's own evidence runs are the thing being hardened.

Smallest remediation (next freeze; bytes are frozen this round): drop `--no-sandbox` from line 401,
re-run the two committed driver runs, confirm the first `captureScreenshot` bytes are unchanged
(t3 compares live vs committed on one host, so both legs must use the same flags), re-freeze the
digest. If any leg fails without it, record *why* in the receipt rather than reverting silently.

### F2 — the host user's `chromium-flags.conf` is injected into every evidence run (Medium)

`/usr/bin/chromium` is the Arch launcher (ELF, strings: `chromium-flags.conf`, `XDG_CONFIG_HOME`,
`/usr/lib/chromium/chromium`). `~/.config/chromium-flags.conf` on this host:
`--ozone-platform=wayland`, `--ozone-platform-hint=wayland`,
`--enable-features=TouchpadOverscrollHistoryNavigation`,
`--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`,
`--disable-features=Vulkan`.

My own chromedriver session executed exactly that list **first**, then chromedriver's args
(`probe-d-withsandboxflag.json`, first `procs[]` entry; same shape in the sibling
`ExecInterceptPhases` run visible in `pgrep`):

```
/usr/lib/chromium/chromium --ozone-platform=wayland --ozone-platform-hint=wayland
  --enable-features=TouchpadOverscrollHistoryNavigation
  --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url
  --disable-features=Vulkan --allow-pre-commit-input … --headless=new … --user-data-dir=…
```

Exploit path: whoever can write that file (the user, or any process running as them — an install
script, a compromised editor plugin) adds `--proxy-server=http://… --proxy-bypass-list=<-loopback>`
and the evidence run's "loopback only" navigation leaves the host. Demonstrated entirely on
loopback: with `--proxy-server=http://127.0.0.1:39301 --proxy-bypass-list='<-loopback>'`, chromium's
navigation of `http://127.0.0.1:40163/a.html` arrived at my proxy
(`GET http://127.0.0.1:40163/a.html HTTP/1.1` in `proxy2.log`) and `--dump-dom` rendered the proxy's
`PROXIED-BY-CONFIG` body instead of the fixture (chrome exit 0). The same file can add
`--load-extension=/abs/path` (page-privileged code in the "throwaway" profile — the literal `~` in
the current entry is not shell-expanded, so *that* entry probably fails to load; an absolute path
would load), `--host-resolver-rules`, `--force-device-scale-factor`, etc.

Impact: (a) perimeter — "loopback only" is a property of the URLs the counter chooses, not of the
transport; (b) claim integrity — the measured first screenshot is a function of host-user config,
so the t3 byte-equality is host-relative and an ambient change silently re-baselines it; the
counter never records which flags were actually in force.

Smallest remediation (next freeze): launch the real binary (`/usr/lib/chromium/chromium`, the
launcher's `execv` target) instead of `/usr/bin/chromium`, or pass an explicit
`--user-data-dir`-style override plus `--disable-extensions`; and record the executed browser argv
(or its sha256) in the receipt. This round: the receipt should state the launcher was used and the
host's flags file exists.

### F3 — live runs do make non-loopback requests (Medium)

`probe-f.mjs`: the counter's own chromedriver argv (including `--headless=new --no-sandbox
--no-first-run --disable-gpu --user-data-dir=…`; chromedriver adds `--disable-background-networking`
itself), one navigation to the loopback fixture, `--log-net-log`, 6 s idle. Netlog URL hosts
(`probe-f-out.json`, 840 843 bytes of netlog):

```
clients2.google.com 4, accounts.google.com 4, update.googleapis.com 8, www.google.com 4,
content-autofill.googleapis.com 8, edgedl.me.gvt1.com 4, android.clients.google.com 16,
csp.withgoogle.com 1        ← all non-loopback
127.0.0.1:34653 10          ← the fixture
```

The earlier proxy test (F2) showed these are not just netlog bookkeeping: the browser issued
`GET http://clients2.google.com/time/1/current?…`, `CONNECT update.googleapis.com:443`,
`CONNECT accounts.google.com:443`, `CONNECT www.google.com:443`, `CONNECT redirector.gvt1.com:443`
through the proxy, with `--disable-background-networking` on the command line.

Impact: the counter header (`:20-24`) and the wave contract say loopback only; navigation is
loopback-only, traffic is not. Any claim that an evidence run is network-isolated, reproducible
offline, or leaves no trace on third parties is false as written. No fixture data leaves (the
requests are Chrome's own services and carry no page content), so this is claim integrity, not
exfiltration.

Smallest remediation (next freeze): add `--disable-component-update --disable-domain-reliability
--no-pings --disable-features=OptimizationHints,AutofillServerCommunication,MediaRouter` (and keep
`--disable-background-networking`), or better run the browser behind a loopback-only proxy sink so
the property is enforced rather than configured. This round: state it in the receipt.

### F4 — unauthenticated chromedriver reachable by any local uid; `freePort()` is a race (Low)

listen (`probe-b.mjs`, my driver pid 11295):
```
LISTEN 0 5 127.0.0.1:46817 0.0.0.0:* users:(("chromedriver",pid=11295,fd=8))
LISTEN 0 5     [::1]:46817    [::]:* users:(("chromedriver",pid=11295,fd=7))
```
Cross-uid probe: `sudo -n -u nobody curl http://127.0.0.1:39555/status` →
`{"value":{"build":{"version":"154.0.8037.97 (b510e9d7…)"},"message":"ChromeDriver ready for new sessions.",…,"ready":true}}`, status 200.
`chromedriver --help`: `--allowed-ips=LIST …` / `--allowed-origins=LIST …` — neither is passed by the
counter (grep over the frozen file: no match). `POST /session` from another uid would make
**vgpnk's** chromedriver spawn a browser as vgpnk.

`freePort()` (`:366`) binds port 0, closes, and `:389`/`:390` hand the number to `chromedriver
--port=` — a local process that binds it first either DoSes the run or plays driver: the counter
then POSTs the session to the squatter and `new WebSocket(body.value.capabilities.webSocketUrl)`
(`:408`) trusts the returned URL, so the `l1-live` leg would score attacker frames.

Impact: on this host there is exactly one interactive human (`getent passwd` uid≥1000: `vgpnk`,
`earlyoom`), so the cross-uid path needs a local attacker who already has an account; the same-user
race needs a local process. Severity Low, but it is the only unauthenticated service the lane
exposes, and it spawns a browser.

Smallest remediation (next freeze): pass `--url-base=/<random-32-hex>` (per-run secret path) so the
endpoint is unaddressable without the nonce, and after spawn `GET /status` and refuse unless
`build.version` matches the expected driver build before creating the session (this also closes the
squatter path, since the squatter cannot know/pass the build check and the nonce).

### F5 — transcripts carry one host path and dead session material (Low; redaction required)

`probe-a-out.json` (one full `liveRecord()` run, default flags: `PROBE_A_DONE 28 14`, node exit 0)
— the field the counter consumes and the fields it does not:

```
"chrome": { "chromedriverVersion": "154.0.8037.97 (b510e9d7…)",        ← t3 REQUIRES verbatim
            "userDataDir": "/fast/scratch/hyaku/tabi-r32/SentinelPerimeter/tmp/tabi-bidi-live-h8I3uy/profile" },
"goog:chromeOptions": { "debuggerAddress": "localhost:39341" },
"goog:processID": 2729222,
"webSocketUrl": "ws://127.0.0.1:36715/session/3632b2d195eda134966dbf8ed28bc4bc",
"sessionId": "3632b2d195eda134966dbf8ed28bc4bc"
```
Scan of the whole record: `/fast/scratch` ×1, `/home/vgpnk` ×0, `tabi-bidi-live` ×1; the only
absolute-path strings are `/a.html` and the profile path above. So the committed transcript (`t1`
requires the `/session` body verbatim in the `http-res` line) will carry the scratch path — no
username as long as TMPDIR is not under `$HOME` — plus a port, a dead 32-hex session id, a
host-local pid. `evaluate()` consumes only `capabilities.chrome.chromedriverVersion` (`:546-554`)
and the first `captureScreenshot` bytes; `cdv`/`firstShot` never read `userDataDir`,
`webSocketUrl`, `sessionId` or `goog:processID`. Redaction is therefore free.

Cookies (`storage.getCookies` at `:463`, unfiltered): exactly **one**, and it is fixture-only —
```
{ "domain": "127.0.0.1", "name": "tabi_fixture", "value": {"type":"string","value":"1"},
  "path":"/", "secure":false, "httpOnly":false, "goog:session":true, "goog:sourcePort":37957 }
```
No host-profile cookie appears because the profile is throwaway. But `R15` (`:294`) only asserts
*that* `tabi_fixture=1` is present; a transcript that also carried host cookies would still be
admitted. That is the one transcript-side trap left.

Redactions the L1 MUST apply before committing `corpus/evidence/round-32/bidi/run*/transcript.jsonl`
(then recompute `run.transcriptSha256`; leave `fixtureSha256`, `driverSha256`, `browserVersion`,
`chromedriverVersion`, screenshot data and the cookie untouched):

1. `value.capabilities.chrome.userDataDir` → `"<scratch>/profile"`.
2. `value.capabilities.webSocketUrl` → `"ws://127.0.0.1:<port>/session/<session-id>"` (or drop the
   id); `value.sessionId` → constant (`"SESSION"`).
3. Drop `value.capabilities.goog:processID`; set
   `value.capabilities["goog:chromeOptions"].debuggerAddress` → `"127.0.0.1:<port>"`.
4. Verify before commit:
   `grep -nE '/home/|/fast/scratch|/tmp/tabi-bidi-live|_[0-9a-f]{32}' corpus/evidence/round-32/bidi/*/transcript.jsonl`
   must be empty, `grep -c '"domain"'` per transcript must be `1`, and every `"domain"` must be
   `127.0.0.1`; `grep -c 'chrome_crashpad_handler'` must be `0`.
5. Do not commit a transcript whose `storage.getCookies` lists any cookie other than
   `tabi_fixture` — that would mean the profile was not throwaway; re-run instead.

### F6 — the run mutates the user's real Chromium profile dir (Low)

Every launched browser's crashpad handler runs with
`--database=/home/vgpnk/.config/chromium/Crash Reports` (observed in my probe's `crashpad[]` and in
the sibling seat's process list), i.e. **outside** the throwaway `--user-data-dir`. During my run
`~/.config/chromium/Crash Reports/settings.dat` mtime advanced `1793030748 → 1793030756` (size 40);
`pending/` already holds a 1.28 MB `.dmp` from the user's real browser. A crash of an evidence-run
renderer would drop its dump (fixture page memory, loopback URLs) into that shared directory, and
`liveRecord`'s cleanup (`:485-490`) removes only `scratch`/`chromeTmp`, not this.

Impact: the "throwaway profile" is only the profile; crash reporting is host-global. No credentials
or cookies are involved (dumps are 0600, same user), so Low.

Smallest remediation (next freeze): add `--disable-breakpad --disable-crash-reporter` to the
launch args; this round, note it in the receipt.

### Verified-holds (no action)

- **Fixture server binds loopback only**: `serveFixture()` `server.listen(0, "127.0.0.1", …)` (`:136`);
  `ss` while live: `LISTEN 0 511 127.0.0.1:44625 … users:(("MainThread",…))` — no `0.0.0.0`, no `[::]`.
  Cross-uid reachability is the same as any loopback service (`sudo -n -u nobody curl …/a.html` →
  `status=200`), but the content is the public frozen `FIXTURE`.
- **No path traversal / no listing**: `curl --path-as-is …/../etc/passwd` → `404`;
  `…/%2e%2e/etc/passwd` → `404`; unknown paths → `404`. Lookup is an exact `FIXTURE[path]` map
  after `?`-stripping (`:126-135`), no decoding, no filesystem access.
- **R15 cookie is fixture-only**: see F5 — one cookie, `127.0.0.1`, `tabi_fixture=1`, session
  cookie, no expiry, in a throwaway profile.
- **Chromedriver is not reachable off-host**: bound `127.0.0.1` + `[::1]` only (above), no
  `0.0.0.0`/`[::]` listener.
- **Process cleanup of my own runs**: after every probe,
  `pgrep -fa 'chromedriver|chromium' | grep SentinelPerimeter` → `none owned by SentinelPerimeter`;
  `$S/tmp` empty; `/run/user/1000/tabi-bidi-*` absent. The `chromedriver`/`chromium` lines still in
  `pgrep` at report time all carry `--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…`
  (sibling seat), not mine; I did not touch them.

## Residual risks not exercised

- I did not run the full `evaluate()`/counter command; the admission arithmetic is C1's and the
  predicates' critic's. My only counter-side execution is `liveRecord()` (one run, exit 0) plus the
  module's unchanged `serveFixture()`/`FIXTURE` exports.
- The `--allowed-origins` (browser-origin) attack on the driver port — a malicious page in the
  user's *normal* browser POSTing `text/plain` to the ephemeral port during the ~40 s window — is
  the same surface as F4 and was not exercised (it would need an attacker page in the host browser;
  out of contract).
- Concurrent sibling seats run the same `liveRecord()` on the same host; my observations of
  crashpad/`settings.dat` are shared-state observations and could in principle be partly a
  sibling's, but the argv evidence (`--database=…`) is per-process and unambiguous.

## Hygiene

Scratch `$S=/fast/scratch/hyaku/tabi-r32/SentinelPerimeter` (172 MB: shared clone + probes + copied
receipts) deleted after copying `probe-a-out.json`, `probe-d-nosandbox.json`,
`probe-d-withsandboxflag.json`, `probe-f-out.json` to
`.ufo/waves/round-32/w1/SentinelPerimeter/`. No tool installed or upgraded (nothing was needed);
no lane file, lane index, jj state, fleet repo or sibling lane touched; the only git operations
were `clone`/`checkout --detach`/`rev-parse`/`status` inside my own scratch clone. Network: no
external fetch; the only off-host traffic was Chromium's own background requests observed and
blocked at my loopback proxy (recorded in F3).
