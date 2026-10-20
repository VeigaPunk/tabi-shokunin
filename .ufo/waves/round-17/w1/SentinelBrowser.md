VERDICT: ISSUES

# SentinelBrowser — C2 invoke-harness safety review (round 17, wave 1, read-only)

Scope: PLAN.md §C2 (`.ufo/waves/round-17/PLAN.md:108-133`) and the r16 pattern
`scripts/webmcp-loopback-round16.mjs` (cited `r16:<line>`). `scripts/webmcp-invoke-round17.mjs`
does not exist yet (`ls` → No such file), so findings are guards the new harness must carry.
Every probe ran on 127.0.0.1 only, with a mkdtemp profile and HOME. Each was killed and removed (details at the end).

## Findings

**S1 — HIGH (control validity + browser egress): duplicate `--enable-features`/`--disable-features` switches are last-wins.**
- Exploit path: Playwright adds its own `--disable-features=<long list>` and `--enable-features=CDPScreenshotNewSurface`
  (r16 receipt `runs[*].effectiveArgv` idx 15/16). The harness then appends its own switches (r16:67-74, r16:721).
  In the r16 domain-disabled run, `--disable-features=DevToolsWebMCPSupport` sits at idx 44. That replaces Playwright's
  entire disable list, so Translate, OptimizationHints, NetworkTimeServiceQuerying, MediaRouter,
  DialMediaRouteProvider and HttpsUpgrades are back on, and some of those make browser-level network or LAN requests. The flagged run
  silently drops CDPScreenshotNewSurface, so the flagged and control runs differ in more than the WebMCP flags.
- Evidence: I ran a probe on Chromium 154 (`/usr/lib/chromium/chromium`, loopback page, `typeof document.modelContext`):
  `webmcp-only`→`object`; `webmcp-then-other` (`--enable-features=WebMCP… --enable-features=CDPScreenshotNewSurface`)→`undefined`;
  `other-then-webmcp`→`object`; `--disable-features=WebMCP --disable-features=Translate`→`object` (the first disable was lost).
- Impact: any control that adds a `--disable-features` token (planned `invoke-flags-off-control`, or a copy of the r16
  domain-disabled run) weakens browser-level confinement without any warning. `externalRequestCount` cannot detect this (see S2).
- Smallest fix: build exactly one merged `--enable-features` and one merged `--disable-features` token, including Playwright's
  defaults (or use `ignoreDefaultArgs` for those two and re-add the merged lists). Then assert from `/proc/<pid>/cmdline` that each switch
  appears exactly once, and record the effective value.

**S2 — MEDIUM (claim scope): `externalRequestCount` only counts requests the page-context route aborted.**
- Measurement: `blocked` (r16:1374) is filled only by `context.route('**/*')` aborts and the `routeWebSocket` close (r16:397-436).
  The receipt writes `externalRequestCount: blocked.length` (r16:1611).
- Not seen: allowed loopback requests, browser-process traffic (component, variations or time services; see S1), WebRTC
  UDP/TCP, WebTransport, SharedWorker, and preconnect sockets. The r16 receipt states this honestly (r16:1599).
- The `fetchProtocolDomain` browser (r16:637-650) has no route at all, and it lacks Playwright's `--disable-background-networking`
  and `--disable-component-update`. Only `--host-resolver-rules` stands in front of it, and that blocks host names, not IP literals.
- Fabrication risk: when `routeWebSocket` is missing, the failure is swallowed (r16:433-436), yet the receipt still says
  `webSockets: 'denied via context.routeWebSocket'` unconditionally (r16:1602).
- Kernel-level witness (feasible, tested): `unshare -rn sh -c 'ip link set lo up; …'` → `lo 127.0.0.1/8` only.
  Inside it, node `fetch http://1.1.1.1` → `ENETUNREACH` and loopback fetch → `ok`. Sandboxed Chromium (no `--no-sandbox`), run under a nested
  `unshare --user --map-user=$(id -u) --map-group=$(id -g)`, rendered the 127.0.0.1 page. The page's own `fetch("http://1.1.1.1/")` ended `FETCHFAIL`
  (dump-dom). Run the whole harness (node + server + browser) like that, and record `/proc/self/ns/net` plus
  `os.networkInterfaces()` in the receipt. Then a count of 0 is backed by "no route out of the host", not only "no page-level abort".

**S3 — MEDIUM (profile/flag injection): HOME redirect does not isolate the launcher's system config.**
- `/usr/bin/chromium` is the Arch ELF launcher. With `env -i HOME=/tmp/nohome`, `--help` reports
  `/etc/chromium-flags.conf` and `$XDG_CONFIG_HOME/chromium-flags.conf`. The `/etc` file is read whatever HOME is set to (absent today:
  `ls` → No such file).
- The user's own conf carries `--load-extension=~/…` (round-16 `protocol-domain.json` launcherNote). The live omp
  daemon Chromium (pid 2082972, profile under `~/.omp/run/daemons/…`, `127.0.0.1:39017`) shows that conf merged in.
- r16 only checks WebMCP tokens, and only in the flag-off control (r16:756-757, :801).
- Fix: allowlist-assert `effectiveArgv` on every run. Reject `--load-extension`, `--proxy-*`, `--remote-debugging-port`,
  `--no-sandbox`, any `--user-data-dir` other than ours, and duplicated feature switches (S1). Otherwise fail as could_not_evaluate.

**S4 — MEDIUM (cleanup on abnormal exit, plus a case-timeout leak that matters more for invocation).**
- Abnormal exits skip `closeServer`/`rmSync(tmpBase)`/closure: the watchdog `process.exit(2)` (r16:1651-1655), `failStart` (r16:1326-1329) and
  `main().catch` (r16:1657-1660). [INFERENCE] Playwright's own exit handler kills the browsers it launched, but it
  does not delete the caller-supplied `userDataDir`, so tmpBase leaks.
- The `fetchProtocolDomain` child (r16:637) is not `detached` and not in `launchedRuns`, so it is outside the closure proof.
- The per-case `Promise.race` timeout (r16:1444-1449) does not cancel the loser, and its timer is never cleared. A timed-out invoke case keeps
  running alongside the next one on the shared flagged context (r16:1418). A late `WebMCP.toolResponded` or a still-pending `execute`
  can then contaminate the next case's events.
- Profile-removal ordering hazard (r16 H3), reproduced: in my first probe I deleted the profile while Chromium was alive.
  Chromium re-created `/tmp/sentinel-r17-prof-4rgN/Default` (observed `ls -la`).
- Fix:
  - one `cleanup()` registered for `exit`/SIGINT/SIGTERM/SIGHUP/watchdog that closes contexts, kills the process group and then removes tmpBase;
  - a fresh page per invoke case (fresh context for controls), closed with `cancelInvocation` for pending ids before the next case;
  - stamp events with the case id and fail if any arrive after the case closes.

**S5 — MEDIUM (invoked tool → host filesystem/network side effects).**
- Downloads: [INFERENCE] Playwright contexts accept downloads by default. An `execute` that clicks a `blob:` link (not
  routed; blob is not network) writes bytes host-side into Playwright's temp artifacts dir. Fix: `acceptDownloads: false`, and
  record any `download` events as findings.
- Declarative/autosubmit invocation submits the form. The fixture server answers POST with 405 without recording it (r16:292-294).
  `served` stores only the decoded pathname without the query (r16:298, :342), so a submission triggered by an invocation is invisible.
  Fix: log method + raw URL + case id for every server hit, and allow only GET/HEAD plus an explicitly fixture-declared form target.
- Kept guards: `chromiumSandbox: true` (r16:728; probe argv shows sandboxed zygote/renderers), `serviceWorkers: 'block'`
  (r16:727). Keep `--disable-popup-blocking` (Playwright default) in mind: popups must stay inside the routed context.

**S6 — MEDIUM (untrusted payload / evidence integrity).**
- `WebMCP.toolResponded` carries `output: any` and `exception: Runtime.RemoteObject`
  (`protocol-domain.json` events), which is unbounded data controlled by the page under test. Cap the size per field, store the sha256
  of the full value, never print page strings to stdout (keep r16's id/status-only lines, r16:1460), never pass them to
  exec/paths/`eval`, and never call `Runtime.callFunctionOn` on the returned objectId.
- r16 takes several expectations from the page under test (`__webmcpFixture.expectedTools`, r16:895, :953, :1016, :1215).
  PLAN:125 requires predicates fixed in code. Expected inputs and outputs must be harness constants, compared with CDP
  `toolInvoked.input` (a string) and `toolResponded`. The page-side "what execute received" is a second, page-controlled witness, never the oracle.

**S7 — MEDIUM (vacuous negative): r16 subscribes to `WebMCP.toolCalled` (r16:457), which does not exist.**
- The live domain lists the events `toolsAdded`, `toolsRemoved`, `toolInvoked`, `toolResponded`, and the commands
  `invokeTool{frameId,toolName,input}` → `invocationId` and `cancelInvocation`.
- A copied subscription list makes "no invocation observed" predicates (unknown-tool, flags-off, after-unregister) pass vacuously.
- Fix: check subscribed names against the live `/json/protocol` WebMCP domain. Base negative cases on the `invokeTool`
  response/error or on `toolResponded.status`, not on missing events.

**S8 — LOW (Playwright resolution): `NODE_PATH` entries are searched (r16:203-204), and the version check reads only `package.json.version`
(r16:221).** An environment-planted module that claims `1.64.0` gets loaded. Fix: record the realpath and sha256 of the resolved Playwright entry
in the receipt, and ignore `NODE_PATH`, or record it.

**S9 — LOW (local CDP port): `fetchProtocolDomain` opens an unauthenticated DevTools port** on 127.0.0.1:0 (r16:641-642). Any local
process can attach for its lifetime. Prefer the committed protocol artifact or a pipe. If a port is used, never add `--remote-allow-origins`.

## Checked and OK (no change needed beyond copying)
- Loopback bind is asserted: `listen(0,'127.0.0.1')` plus an address check (r16:356-361). Traversal, symlink and NUL guards: r16:309-340.
- No CDP 9222 and no user profile: Playwright uses `--remote-debugging-pipe` (r16 receipt argv). The protocol fetch uses port 0 (r16:642).
  Profiles come from mkdtemp under tmpBase (r16:719-720). No `connectOverCDP` anywhere.
- Process attribution is by unique marker (r16:253-271). Renderer, zygote and GPU children carry `--user-data-dir` (probe pgrep), so
  `findProcessesUsing(tmpBase)` (r16:1508) catches orphans as long as HOME stays under tmpBase (the crashpad db lives under HOME).
  The host has unrelated Chromium instances (pid 2082972), so never kill by name.
- Receipt write refuses a symlink or non-regular file and writes a `wx` tmp file, then renames it (r16:1627-1643). The r16 receipt closure is all `gone/removed: true`, with port
  `ECONNREFUSED` and `externalRequestCount: 0` (as scoped in S2).

## Must-have guards for `scripts/webmcp-invoke-round17.mjs`
1. Server bind 127.0.0.1:0 with an address assert; GET/HEAD only. Every hit is logged as {caseId, method, raw URL}, and anything else is denied and recorded.
2. The browser starts through Playwright `launchPersistentContext` (pipe CDP). Never 9222, never `connectOverCDP`, never `--remote-allow-origins`.
3. Profile and HOME are mkdtemp'd under one tmpBase; the env is minimal (r16:232-241); no DISPLAY/WAYLAND.
4. Every run's `effectiveArgv` is allowlist-asserted (S3). There is exactly one merged enable-features token and one merged disable-features token (S1).
5. `chromiumSandbox: true`, `serviceWorkers: 'block'`, `acceptDownloads: false`; the route guard and `routeWebSocket` are installed on
   every context, controls included. The receipt records whether each guard was actually installed (S2).
6. RECOMMENDED: run inside the loopback-only netns (S2, tested) and record the netns witness in `safety`.
7. Use only harness-constant tool inputs and predicates. `output`/`exception` are capped and hashed and never executed or printed (S6, S7).
8. Each case gets a fresh page (fresh context for controls). Timeouts close the page or context and `cancelInvocation` pending ids. Events that arrive after a case closes fail the case (S4).
9. One idempotent cleanup runs on exit, signals and the watchdog: close contexts, SIGKILL the process group, wait for exit, then `rmSync`.
   The closure proof covers every spawned pid, including any protocol-fetch child (S4).
10. Bound concurrency for `invoke-concurrent-ids` (fixed N ≤ 8) and bound the per-case log size.

## Probe log (my own actions)
- Run 1, a bash `&` launch: `$!` came back empty, so `kill` failed and one headless Chromium (marker `/tmp/sentinel-r17-prof-4rgN`)
  outlived the script for about 1 minute. I killed it with `pkill -9 -f 'user-data-dir=/tmp/sentinel-r17-prof-'` and removed the re-created dir.
  `pgrep` then came back empty.
- Probes 2 and 3 were node scripts in /tmp: `detached` + `process.kill(-pid)`, wait for exit, then rm. All reported `cleaned:true`. The scripts were deleted.
- netns probe: `unshare -rn` (no privilege). Temp dir removed.
- No installs, no pacman, no jj/git, no writes in LANE except this report.

Files written:
- .ufo/waves/round-17/w1/SentinelBrowser.md
