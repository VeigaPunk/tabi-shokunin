# R56Sentinel — probe evidence log (verbatim raw outputs)

Seat: R56Sentinel (security review, read-only). Host: linux 7.2.11-arch1-1 x64.
Scratch used: `$HYAKU_SCRATCH/tabi-r56/R56Sentinel/` (removed on exit).
No repo file was read-modified; no mutating git/jj was run; no chromium was left alive.

Host facts used:
- `/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch Linux) — it is an **ELF launcher wrapper**, not the browser binary.
- `/usr/bin/chromium` launcher strings contain: `chromium-flags.conf`, `XDG_CONFIG_HOME`, `.config`, `CHROME_WRAPPER`.
- `curl` 8.23.0 (x86_64-pc-linux-gnu).
- `/home/vgpnk/.config/chromium-flags.conf` (212 B) exists and contains:
  ```
  --ozone-platform=wayland
  --ozone-platform-hint=wayland
  --enable-features=TouchpadOverscrollHistoryNavigation
  --load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url
  --disable-features=Vulkan
  ```
- `/home/vgpnk/.config/chromium/` (the user default profile) EXISTS.
- `/home/vgpnk/.netrc` ABSENT; `/home/vgpnk/.curlrc` ABSENT.

---

## E1 — effective argv of a contract-shaped launch (default HOME)

Command:
```
/usr/bin/chromium --headless=new --remote-debugging-port=0 --remote-debugging-address=127.0.0.1 \
  --user-data-dir=<scratch>/profile-<tok> --no-first-run --no-default-browser-check about:blank
```
`/proc/<pid>/cmdline` (verbatim):
```
/usr/lib/chromium/chromium
--ozone-platform=wayland
--ozone-platform-hint=wayland
--enable-features=TouchpadOverscrollHistoryNavigation
--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url
--disable-features=Vulkan
--headless=new
--remote-debugging-port=0
--remote-debugging-address=127.0.0.1
--user-data-dir=/fast/scratch/hyaku/tabi-r56/R56Sentinel/probe16/profile-18f448e69e44724b
--no-first-run
--no-default-browser-check
about:blank
```
The five flags.conf flags are PREPENDED by the launcher, before the caller's own flags.

## E2 — the injected extension is LIVE in the fixture browser

`GET http://127.0.0.1:<devtools-port>/json/list`:

| case | flags | service_worker target |
|---|---|---|
| A default HOME, no `--disable-extensions` | — | `chrome-extension://baflhghklkoibehmofgdmfdfkgpmngkg/background.js` |
| B default HOME, `--disable-extensions` | r46 flag list | `[]` |
| C HOME+XDG_CONFIG_HOME redirected | — | `[]` |

Control: launching with an explicit `--load-extension=/home/vgpnk/.local/share/omarchy/default/chromium/extensions/copy-url`
produced the SAME id `baflhghklkoibehmofgdmfdfkgpmngkg` — attribution confirmed.
The extension manifest (`copy-url/manifest.json`) declares `permissions: ["activeTab","scripting","notifications"]`
and its `background.js` calls `chrome.scripting.executeScript` + `navigator.clipboard.writeText`.

## E3 — HOME+XDG redirect removes the injection entirely

With `HOME=<scratch>/uh` and `XDG_CONFIG_HOME=<scratch>/uh/.config`:
```
/usr/lib/chromium/chromium --headless=new --remote-debugging-port=0 --remote-debugging-address=127.0.0.1 \
 --user-data-dir=<scratch>/profile-<tok> --no-first-run --no-default-browser-check about:blank
```
injected flags.conf flags present: False

## E4 — default-HOME launch WRITES into the user's default Chromium profile

Control (HOME+XDG redirected):
```
--- CONTROL: HOME+XDG redirected ---
  files in USER DEFAULT crash dir changed: []
  new files: []
```
Test (default HOME):
```
--- TEST: default HOME (launch inherits HOME=/home/vgpnk) ---
  files in USER DEFAULT crash dir changed: ['settings.dat']
  new files: []
```
Directory: `/home/vgpnk/.config/chromium/Crash Reports/settings.dat`.

## E5 — the crashpad handler is OUTSIDE the token-keyed group

`chrome_crashpad_handler` cmdline of the launch's own handler (uniquely attributed via a per-run HOME):
```
pid=4136518 ppid=1487 token_in_cl=False db=['--database=/fast/scratch/hyaku/tabi-r56/R56Sentinel/probe17/uh/.config/chromium/Crash Reports']
pid=4136522 ppid=1487 token_in_cl=False db=['--database=/fast/scratch/hyaku/tabi-r56/R56Sentinel/probe17/uh/.config/chromium/Crash Reports']
```
It is reparented to `systemd --user` (ppid 1487) and carries NO `--user-data-dir=<token>`.
With default HOME the same handler's `--database` is `/home/vgpnk/.config/chromium/Crash Reports`.
Token-keyed sweep after killing the main pid: `token_sweep survivors: 0` — the handler is invisible to that sweep.

## E6 — a naive image-name sweep WOULD hit the user's own live browser

```
=== NAIVE image-name sweep ('chromium' substring) on this host ===
  total processes matched: 31
  of which the USER'S OWN desktop Chromium (no --user-data-dir, no --type=): [1368, 1162567, 1162596, 1162598]
    pid=1162567 ppid=1487 :: /usr/lib/chromium/chromium --ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation --load-extens
```
`pid=1162567` is the operator's own session Chromium (no `--user-data-dir`, no `--type=`) — killing it would end
the user's browser. `1162596`/`1162598` are its crashpad handlers; `1368` is `earlyoom` (matched only because its
`--prefer` regex mentions `chromium`).

Token sweep (fresh random `profile-<16 hex>`) before launch: `matched: 0`.

## E7 — sibling-seat browser paths are live on this host (cross-seat sweep hazard)

```
pid=2627211 :: ... --user-data-dir=/fast/scratch/hyaku/tabi-r56/R56Scout/tabi-r56-dry-a2c6b5e6caf5 ...
pid=2634449 :: ... --user-data-dir=/fast/scratch/hyaku/tabi-r56/R56LabProbe/runs/H1-run1/profile ...
```
Any sweep token that is an ancestor directory of the scratch root (`tabi-r56`, `hyaku/tabi-r56`) would match these.

## E8 — DevTools socket is loopback-only (both with and without the explicit address flag)

```
=== A: NO --remote-debugging-address (r46 precedent shape) ===
  ss: LISTEN 0 10 127.0.0.1:36099 0.0.0.0:*  users:(("chromium",pid=1321863,fd=72))
  connect_192.168.0.253: refused(ConnectionRefusedError)
=== B: WITH --remote-debugging-address 127.0.0.1 (r56 contract) ===
  ss: LISTEN 0 10 127.0.0.1:34061 0.0.0.0:*  users:(("chromium",pid=1417457,fd=72))
  connect_192.168.0.253: refused(ConnectionRefusedError)
```
Host IPv4: `192.168.0.253`. `127.0.0.1:<port>` connected successfully in both cases.

## E9 — node http server binds the wildcard when the host argument is omitted

```
node listen(0) with NO host -> {"address":"::","family":"IPv6","port":38569}
node listen(0,"127.0.0.1") -> {"address":"127.0.0.1","family":"IPv4","port":34145}
```
`ss -ltn` for the no-host case shows the socket on `0.0.0.0:*`/`[::]:*` (all interfaces).

## E10 — curl reads `$HOME/.curlrc` and injects its headers; `-q` (first argument) suppresses it

Server-side capture, `HOME` pointed at a dir containing `.curlrc` with `header = "Cookie: SESSION=SECRET-TOKEN-123"`:
```
=== default curl (reads $HOME/.curlrc) ===
  REQUEST HEADERS SEEN BY SERVER:
     GET /x HTTP/1.1
     Host: 127.0.0.1:39012
     User-Agent: curl/8.23.0
     Accept: */*
     Cookie: SESSION=SECRET-TOKEN-123
=== same with -q as FIRST arg ===
  REQUEST HEADERS SEEN BY SERVER:
     GET /x HTTP/1.1
     Host: 127.0.0.1:39013
     User-Agent: curl/8.23.0
     Accept: */*
```

## E11 — `curl -L` follows a cross-host redirect by default

```
  requested host=127.0.0.1  effective host=localhost  -> CROSS-HOST redirect followed by default curl -L
  curl: (1) Protocol "file" is disabled (in redirect)
```
`file://` redirect is refused by curl 8.23 defaults; an `http://` cross-host redirect is NOT refused.
With `--proto '=https' --proto-redir '=https'` an `http://` URL is refused outright:
`curl: (1) Protocol "http" is disabled`.

## E12 — house precedent for the safe curl shape

`scripts/check-decision-table.mjs:194-196`:
```js
const r = spawnSync("curl", ["-q", "-sS", "--proto", "=https", "--proto-redir", "=https", "-L", "--max-redirs", "5", "--max-time", "60",
  "-o", "-", "-w", "\n%{http_code} %{url_effective}", url], ...);
```
and `scripts/check-decision-table.mjs:210-213` re-checks the effective host:
```js
if (!/^https:\/\//.test(res.effective) || hostOf(res.effective) !== hostOf(url)) return false;
```

## E13 — precedent profile handling (r46) is scratch-only and Windows-shaped

`scripts/chrome-cdp-loopback-round46.mjs`:
- `:170-172` `const profileDir = path.join(scratch, launchToken); fs.rmSync(...); fs.mkdirSync(...)`
- `:199` `` `--user-data-dir=${profileDir}` ``
- `:231` reads `path.join(profileDir, 'DevToolsActivePort')` only.
- `:191` `server.listen(0, '127.0.0.1', ...)`
- `:160-162` `if (!/^127\.0\.0\.1:\d+$/.test(wsHost)) { ... die(...) }`
- grep for `HOME|APPDATA|USERPROFILE|XDG|process.env`: **no match**.
- grep for `.config/chromium|Cookies`: **no match** in r46.
- r46 browser candidates are `C:/Program Files/...chrome.exe` / `msedge.exe`; sweep uses PowerShell
  `Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%${token}%'"`; kill uses `taskkill /PID <pid> /F /T`.
- r46 flag list includes `--disable-extensions` (`:202`).

## E14 — house precedent for the browser-side HOME isolation

`scripts/webmcp-loopback-round16.mjs:234-235`:
```js
    HOME: homeDir,
    XDG_CONFIG_HOME: join(homeDir, '.config'),
```
and `:1605` `minimalEnv: 'HOME/XDG_CONFIG_HOME redirected to temp dir (isolates Arch chromium-flags.conf)'`.
`scripts/webmcp-loopback-round16.mjs:22-27` states the same in the header.
`scripts/webmcp-loopback-round16.mjs:279-345` is the hardened disk-backed fixture server (realpath + prefix + symlink + isFile checks).

## E16 — crashpad lifetime (attributed, per-run unique HOME)

```
our crashpads: [663132, 663139]
  t+3s: crashpad alive=[]  token-sweep survivors=[]
  -> crashpad EXITED with the browser (no orphan observed)
```
A second attributed run (default HOME, E5 attribution via `--crashpad-handler-pid`) also showed
`after SIGKILL main + 8s: our crashpad alive? []`. Lifetime is timing-dependent; the handler is nonetheless
**never visible to a token-keyed sweep** (E5), so the closure proof must not rely on token identity alone.
`--disable-breakpad` was probed as a suppressor and did **not** prevent the crashpad handler from being spawned
(4 handlers on host in both the with- and without-flag cases), so it is not a usable substitute for the
HOME/`XDG_CONFIG_HOME` redirect.

## E17 — contract-shaped fixture server: traversal and reflection

Fixed-route fixture bound to `('127.0.0.1', 41969)`, routes `GET /form` and `GET /echo?field=&field2=`:
```
  GET '/form' -> (200, b'<!doctype html><form method=GET action=/echo><input name=field><input name=field2><input id=f3><button>go</button></form>')
  GET '/echo?field=abc&field2=' -> (200, b'field=abc')
  GET '/../../etc/passwd' -> (404, b'')
  GET '/%2e%2e/%2e%2e/etc/passwd' -> (404, b'')
  GET '/etc/passwd' -> (404, b'')
  GET '/echo?field=<script>alert(1)</script>' -> (200, b'field=<script>alert(1)</script>')
```
Traversal is unreachable because no route reads the filesystem; the `/echo` reflection is **unescaped**.

## E18 — default-HOME launch writes the user's default profile (A/B control)

```
--- CONTROL: HOME+XDG redirected ---
  files in USER DEFAULT crash dir changed: []
  new files: []
--- TEST: default HOME (launch inherits HOME=/home/vgpnk) ---
  files in USER DEFAULT crash dir changed: ['settings.dat']
  new files: []
```
Directory: `/home/vgpnk/.config/chromium/Crash Reports/`.

## E19 — session-material discipline precedents in this lane

- `PROVINCE.md`: "**Refuses:** ... secrets (→ kagi — session material is shape-only, never content-read)."
- `scripts/bidi-loopback-round32.mjs:215-216` and `scripts/bidi-firefox-loopback-round35.mjs:319-320` DO read cookie
  values (`${c.name}=${c.value}`) — for their own fixture cookie only; a precedent NOT to copy into the r56 receipt.
- `.ufo/waves/round-21/w1/ReviewFreshContext.md:35` records the r21 redaction-posture inconsistency between
  `browser.argv` and `effectiveFlags`.
