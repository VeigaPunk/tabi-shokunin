# SentinelProbe — round 16 wave 1 report (security review, C2 WebMCP harness/probes design)

Scope: PLAN.md §C2 (`.ufo/waves/round-16/PLAN.md:79-90`) as a design. At write time
`scripts/webmcp-loopback-round16.mjs` and `.ufo/waves/round-16/probes/*` do **not exist** (glob: probes/ empty),
so this report reviews the design plus local evidence. It is author-side advice and does not certify anything.
No browser session launched by this seat. The only binaries I ran were the launcher `--help`, which printed its text and exited 0,
and `strace … /usr/bin/chromium --version`. I installed nothing.

Axes: egress containment · profile/session-material isolation · side-effect freedom · provenance truth (typed vs effective) · cleanup.

## Findings (severity · exploit path · evidence · impact · smallest remediation)

### F1 — HIGH — `/usr/bin/chromium` is a flag-injecting launcher; typed flags ≠ effective argv
- **Evidence.** `file -L /usr/bin/chromium` → `ELF 64-bit … pie executable` (14,424 B, pacman owner `chromium 154.0.8037.97-1`).
  `/usr/bin/chromium --help` → "Custom flags are read in order from … `/etc/chromium-flags.conf`, `/home/vgpnk/.config/chromium-flags.conf`".
  The detected flags are `--ozone-platform=wayland --ozone-platform-hint=wayland --enable-features=TouchpadOverscrollHistoryNavigation --load-extension=<path> --disable-features=Vulkan`.
  `strace -f -e trace=execve -s 400 /usr/bin/chromium --version` →
  `execve("/usr/lib/chromium/chromium", ["/usr/lib/chromium/chromium", "--ozone-platform=wayland", …, "--enable-features=TouchpadOverscrollHistoryNavigation", "--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url", "--disable-features=Vulkan", "--version"], …)`.
  This shows that the conf flags are **prepended** before the caller's arguments. Conf file shape: `-rw-r--r-- vgpnk 212 B mtime 2026-10-16 23:58`, owned and writable by the user.
  Earlier lane record of the same effect: `SKILL.md:150-151` ("host-injected flags … `--load-extension=…`").
- **Exploit path.** Any process running as the user can append to `~/.config/chromium-flags.conf`, for example
  `--proxy-server=…`, `--remote-debugging-port=…`, `--remote-allow-origins=*`, or `--load-extension=<dir>`. The harness browser then picks up an
  egress route, a second control channel, or extension code that Playwright `route()` cannot see. None of this would show in the harness's typed args.
  The current `--load-extension` value is a literal `~/…` path. The launcher does no expansion ("no further parsing", `--help`), and there is no `~` directory in the cwd (`test -d "$PWD/~"` → none), so `[INFERENCE]` that extension is not loaded today. The injection channel is still live.
- **Provenance impact.** `receipt.flags` and the **flag-off negative control** would record typed flags. In fact even the "no flags" run already carries
  `--enable-features=TouchpadOverscrollHistoryNavigation --disable-features=Vulkan`. Also, `runtime-pin.json:13-15` pins
  sha256 of `/usr/lib/chromium/chromium`, while PLAN `:82` launches `/usr/bin/chromium`. The launched executable (the launcher) is unpinned.
  The same applies to `w1/WebmcpProtocol.md:12-13`: its "noflags" `/json/protocol` run went through the launcher, so its effective argv included the conf flags.
- **Remediation (smallest).** Launch with `executablePath: '/usr/lib/chromium/chromium'`, which is the pinned binary and bypasses both conf files.
  Then record the browser's **effective argv** from `/proc/<browser.process().pid>/cmdline` into the receipt. Assert that it has no `--load-extension`,
  no `--proxy-server`, no `--remote-debugging-port`, and exactly one `--user-data-dir` under `os.tmpdir()`.

### F2 — HIGH — "aborts every non-loopback request" is incomplete if implemented as `page.route`
- **Evidence.** Playwright 1.64.0 `types/types.d.ts:10401-10405`: route "will not intercept requests intercepted by Service Worker … We recommend
  disabling Service Workers … setting `serviceWorkers` to 'block'". WebSockets are a separate API (`routeWebSocket`).
  Browser-internal traffic is outside page routing entirely. The lane already measured GCM egress from a fresh headless profile that
  `--disable-background-networking` did not stop (`SKILL.md:418-421`, `cdp-evidence-patterns.md:36`).
- **Exploit path.** A fixture or WebMCP code path that registers a service worker, opens a WebSocket, or relies on browser background
  networking reaches non-loopback hosts unobserved. The receipt's "loopback only" then becomes a false claim.
  A naive check like `url.startsWith('http://127.0.0.1')` or `includes('127.0.0.1')` also passes `http://127.0.0.1.evil.example/`.
- **Remediation.** Make all of these MUST:
  - `browser.newContext({ serviceWorkers: 'block' })`.
  - Call `context.route('**/*', h)` **before** the first `newPage()`. Its allowlist is `u = new URL(req.url())` with
    `u.protocol === 'http:' && u.hostname === '127.0.0.1' && u.port === String(serverPort)`, else `route.abort('blockedbyclient')`.
  - `context.routeWebSocket(/.*/, ws => ws.close())`.
  - Append every abort `{url, resourceType}` to `receipt.blocked[]`; the expected value is `[]`.
  - Add browser-level DNS denial `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`. Playwright itself emits this syntax (`coreBundle.js:44771`); it covers background networking that never reaches page routing.
  - The receipt keeps the caveat "loopback ≠ zero egress" (`SKILL.md:381`). IP-literal non-loopback URLs are not covered by resolver rules, only by `route`.

### F3 — HIGH — `WebMCP.invokeTool` exists; invocation runs page code or submits forms
- **Evidence.** `corpus/evidence/round-16/webmcp/protocol-domain.json:215,243` (`invokeTool`, `cancelInvocation`) and `:325`: "The output is untrusted and
  poses a prompt injection risk." WebMCP spec <https://webmachinelearning.github.io/webmcp/> was fetched 2026-10-20 with `curl -sSL`
  (200, 505,949 B, sha256 `180c55ba…0d1a`). From its text dump: §6.3.1 (line 2387) "Prompt injection represents a threat to WebMCP where malicious
  instructions are embedded in tool metadata, inputs, or outputs". §4.2.1 (line 2069) says `readOnlyHint`: "If true, indicates that the tool does not modify any state".
- **Exploit path.** An invocation (CDP `invokeTool`, or a page script calling a tool's `execute`) runs fixture JS. For a declarative tool it fills and submits the
  form, which means navigation or a POST to `action`. Tool names, descriptions and outputs that are copied verbatim into receipts or notes become a prompt-injection channel for scribe or L1 agents.
- **Remediation.** The PLAN cases (`:85-87`) need **no** invocation, so treat invocation as forbidden:
  - The harness and probes must contain no `invokeTool`, `cancelInvocation`, `executeTool`, `requestSubmit`, or `.submit(`. A static grep of the producer source is enough, and its sha256 is already in the receipt as `producerSha256`.
  - Fixtures: imperative `execute` bodies must be pure (`return {…}` with no fetch, storage, navigation or timers). Forms must have no `action` or a same-origin `action`, and `method="get"`.
  - Receipts store page-declared strings as JSON data only. The note labels them page-declared and untrusted.

### F4 — MEDIUM — fixture server bind and path resolution
- **Evidence.** Node docs <https://nodejs.org/api/net.html> (fetched 2026-10-20 with `curl -sSL`, 200, sha256 `900451a6…afaf`, "Node.js v26.12.0 documentation"),
  §`server.listen([port[, host[, backlog]]])`: "If host is omitted, the server will accept connections on the unspecified IPv6 address (::)".
- **Exploit path.** `server.listen(0)` with no host exposes the fixture server and its directory to the LAN.
  Serving `fixtures/*.html` by joining the raw path lets `GET /..%2f..%2fSOURCES.md` (or a symlink inside fixtures) read repo or host files.
- **Remediation.**
  - `listen(0, '127.0.0.1')`; assert `server.address().address === '127.0.0.1'` and record it.
  - Serve only names from a `readdirSync(fixturesDir)` allowlist (exact match after `decodeURIComponent`, no `/` or `..`).
  - `lstat` each served file and refuse symlinks.
  - Allow GET/HEAD only.
  - SHOULD: require `Host === 127.0.0.1:<port>` (DNS-rebinding defense).

### F5 — MEDIUM — temp profile, debug transport, session material
- **Evidence.** Playwright `coreBundle.js:41176-41183`: without `userDataDir` it `mkdtemp`s `playwright_${name}dev_profile-` and adds it to `tempDirectories`.
  Those directories are removed on close or exit (`:10126-10128`; the exit handler is at `:10081`). `--user-data-dir` in `args` throws (`:44747-44749`).
  Transport is `--remote-debugging-pipe` (`:44738`), so there is no TCP debug port. The defaults include `--password-store=basic` and `--use-mock-keychain` (`:36238-36239`), so the keyring is not touched.
  The browser env defaults to the full `process.env` (`:41211`). strace showed 260 inherited vars.
  `SKILL.md:1606` says never to rely on the browser's refusal as the guard, because unbranded Chromium does not refuse the default dir (S001/S027 lesson, `corpus/lessons/kaika-fleet-round-1.md:82`).
- **Remediation.**
  - Use `chromium.launch()` with no `userDataDir`, never `launchPersistentContext` on an existing directory. If a persistent context is needed, use its own `mkdtemp` and `rm` it in `finally`.
  - Never pass `--remote-debugging-port`, `--remote-allow-origins`, or any path under `~/.config/chromium`.
  - `protocolDomain`: take it from the committed `protocol-domain.json` (by sha256), or from CDP over the pipe. Do not open a TCP port.
  - Pass a minimal `env`: PATH, LANG, TZ=UTC, and `HOME`/`XDG_CONFIG_HOME` set to a temp dir. `[INFERENCE]` This keeps `~/.pki` and other HOME state out of the browser.
  - Session-material reads are forbidden: `context.cookies()`, `storageState()`, `Network.getCookies`/`getAllCookies`, `Storage.getCookies`, and any read inside the profile dir (`SKILL.md:660-663`).

### F6 — MEDIUM — cleanup on the failure path, and cleanup proof
- **Evidence.** The reused r13 pattern `fail()` calls `process.exit(code)` synchronously (`scripts/aria-loopback-round13.mjs:111-115`).
  Playwright's exit handler kills the browser and runs the sync `rmSync` (`coreBundle.js:10081,10126-10128`). It does not close the harness's own HTTP server, and it does not remove any directory the harness created.
- **Remediation.**
  - Wrap the run in `try { … } finally { await browser?.close(); server.closeAllConnections(); await close(server); rm(ownTemp) }`.
  - Set an overall hard timeout (`AbortSignal.timeout`), with cleanup running before exit.
  - Never call `process.exit` while the browser or server is live.
  - Write closure proof into the receipt: no `/proc/*/cmdline` contains the profile path, the profile directory is absent, and connecting to the server port fails with `ECONNREFUSED`. This matches `SKILL.md:552-555` (curl exit 7 equivalent).

### F7 — LOW — module resolution and receipt write
- **Playwright loading.** The r13 search (`aria-loopback-round13.mjs:117-127`) returns the first directory with a matching package name and also trusts `NODE_PATH`.
  For r16, load only `resolve(dirname(process.execPath), '../lib/node_modules/playwright')`, which matches `npm root -g` per `runtime-pin.json:32-34`. Require `version === '1.64.0'` exactly and record that package.json's path and sha256.
- **Receipt write.** Resolve ROOT from `import.meta.url`. `lstat` the receipt path and refuse a symlink. Write with `wx` to a temp file in the same directory, then `rename`. Keep the PLAN rule "refuse differing bytes".
- **Sandbox.** Playwright adds `--no-sandbox` unless `chromiumSandbox: true` (`coreBundle.js:44764-44765`). Set `chromiumSandbox: true`. If the launch fails, record `sandbox:false` in the receipt instead of hiding it. The risk is low because fixtures are lane-authored.

## Must-have checklist (sent to TabiR16.WebmcpHarness-5)
1. `executablePath: '/usr/lib/chromium/chromium'`; receipt records effective argv from `/proc/<pid>/cmdline` (F1).
2. Flag-off control: effective argv has no `WebMCP*` feature (F1).
3. `serviceWorkers:'block'`; `context.route('**/*')` before any page, with exact `URL` allowlist on protocol/host/port; `routeWebSocket` deny; `receipt.blocked[]` expected `[]` (F2).
4. `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1` (F2).
5. No `invokeTool`, `cancelInvocation`, `executeTool`, `submit` or `requestSubmit` anywhere in the producer; fixtures pure, with no external or POST action; page strings stored as untrusted data (F3).
6. `listen(0,'127.0.0.1')` plus address assert; fixture filename allowlist with no symlinks; GET/HEAD only (F4).
7. Playwright-owned temp profile; pipe transport only; no debug port or remote-allow-origins; minimal `env`; zero cookie/storage/profile reads (F5).
8. `try/finally` close of browser and server, a hard timeout, no `process.exit` while anything is live, closure proof in the receipt (F6).
9. Exact Playwright path and version pin; symlink-safe atomic receipt write; `chromiumSandbox:true` or disclose that it is off (F7).
The same items 1–8 apply to every `.ufo/waves/round-16/probes/WebmcpProbe*.mjs`.

## Commands run (exact, observed)
- `file -L /usr/bin/chromium` → ELF pie executable; `pacman -Qo` → both paths owned by `chromium 154.0.8037.97-1` (read-only query).
- `timeout 5 /usr/bin/chromium --help` → launcher v8 text quoted above, exit 0 (the extension path was redacted in display only).
- `strace -f -e trace=execve -s 400 /usr/bin/chromium --version` → execve argv quoted in F1; `Chromium 154.0.8037.97 Arch Linux`.
- `stat` of `~/.config/chromium-flags.conf` (shape only); flag names extracted with `grep -oE -- '--[A-Za-z0-9-]+'`.
- `curl -sSL` of the WebMCP spec and Node net docs into `/tmp/sentinelprobe-*` (outside the repo).
- Greps on `playwright-core/lib/coreBundle.js` and `types/types.d.ts` (Playwright 1.64.0, global npm root).

## Tooling
No installs or updates. Used `strace` (`/usr/bin/strace`, already installed), `curl`, `node` v24.21.0.

## Files changed
- `.ufo/waves/round-16/w1/SentinelProbe.md` (this report). Scratch `/tmp/sentinelprobe-webmcp-spec.{html,txt}` and `/tmp/sentinelprobe-node-net.html` are outside the repo.

## Follow-up (same wave)
- WebmcpProtocol-5 says it accepted F1 and re-ran on the real binary. I checked `corpus/evidence/round-16/webmcp/protocol-domain.json:5-7`. They now show
  `chromiumExecutable: /usr/lib/chromium/chromium`, a temp `HOME`, and a `launcherNote` listing the 5 injected flags. I did not re-run their probe.
  Nits I sent back: launcherNote calls the 14,424 B ELF launcher a "script". Its claim "typed argv is the effective argv" is unmeasured, because no `/proc/<pid>/cmdline` is recorded; it should be captured or marked `[INFERENCE]`.
- WebmcpProtocol-5 could not act on the nits: its wake turn failed on a rate-limit error ("resource_exhausted … reset … at 16:11 UTC"). Both nits are **open** for L1 at integration. Either fix the "script" wording and capture or mark `[INFERENCE]` the effective-argv claim, or carry them as disclosed limits.
