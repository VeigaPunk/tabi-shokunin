VERDICT: ISSUES

Attacked: the C2 harness `scripts/webmcp-invoke-round17.mjs` at M=6c97851 (lines cited at M, read from sandbox clone
`/tmp/tabi-r17w2-SentinelHarnessAfter-8AoS/repo`, detached at M) against wave-1 SentinelBrowser S1–S9. I ran it under `unshare -rn`
and probed its abnormal-exit, download and DevTools-port behavior in the same netns. The C2 receipt claims (11/11 + 4 controls)
reproduce. The defects found are in harness robustness and safety, not in the counted behavior.

## Live run under `unshare -rn` (feasible: PASS)
- Command: `env TMPDIR=$D/tmp HOME=$D/home unshare -rn sh -c 'ip link set lo up; exec unshare --user --map-user=$U --map-group=$G node scripts/webmcp-invoke-round17.mjs --out $D/out/receipt.json'`.
  Witness `netns=net:[4026533758]` vs host `net:[4026531833]`; the only interface is `lo 127.0.0.1/8` (checked with `ip -br a`).
- Output: `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4`, exit 0, 16 s. Closure `everyStopProof:true`, 0 strays,
  `externalRequestCount:0`. Nothing was left in TMPDIR or HOME, so the node side writes nothing to HOME.
- The receipt records no netns witness. `JSON.stringify(r).includes("ns/net")` gives false, and `safety` has no netns or interfaces key.
  So the stronger confinement is available, but the harness does not claim it.

## Findings (wave-1 ID → status at M)
**H1 MEDIUM (new): SIGTERM does not stop the run, and the run then reports the external kill as a product `fail`.**
- Exploit path: `kill -TERM <node>` at 5 s. Playwright's default handleSIGTERM closes the browsers, and its listener stops Node from exiting.
  `main` keeps going: the case in flight and 3 controls error with `browserContext.newPage: Target page, context or browser has been closed`.
  A new `domain-disabled` browser is launched after the signal (pid 2749585). The receipt is written with `verdict=fail`, exit 1.
- The only finding is `case_failed invoke-navigation-pending`. There is no `run_aborted`, and failed controls add no finding (catch at :958-966).
  The verdict logic (:1992-1996) maps a crashed or killed browser to `fail`, not `could_not_evaluate`.
- Impact: `timeout`, a systemd stop or a supervisor SIGTERM produces a "behavior failed" receipt. With `--force` that receipt can replace
  the committed one. [INFERENCE] SIGHUP behaves the same way (same Playwright handler class); not run.
- Repair: register SIGTERM/SIGHUP/SIGINT handlers that set `aborted` and run cleanup, then `exit(2)`. Pass `handleSIGTERM:false,
  handleSIGHUP:false, handleSIGINT:false` to launch. Classify any "Target … closed" or browser `disconnected` as `run_aborted`, i.e.
  `could_not_evaluate`.

**H2 MEDIUM (S4 not fixed): abnormal exits leak the profile/HOME tree and Chromium temp dirs.**
- Watchdog (sandbox copy with `RUN_TIMEOUT_MS=6000`, everything else byte-identical): exit 2. No processes remain, because Playwright's exit
  handler killed them. Left behind:
  - `tabi-r17-webmcp-invoke-WXf9ny/{flagged,flag-off}-{profile,home}-*`;
  - `org.chromium.Chromium.27iMoW/SingletonCookie` and `org.chromium.Chromium.2nQRwO/…` in TMPDIR.
- SIGINT at 5 s: node status 130, no processes, but `tabi-r17-webmcp-invoke-DhQnwi/{flagged,flag-off}-{profile,home}-*` remain.
- Code: the only `rmSync(tmpBase)` is on the normal path (:1938). The watchdog (:2118-2121), `main().catch` (:2124-2127) and `failStart`
  (:817-820) all call `process.exit` directly.
- `minimalBrowserEnv` gives Chromium `TMPDIR: tmpdir()` (:221), so `org.chromium.Chromium.*` sits outside tmpBase and outside the closure
  proof (:1937-1940). A clean close removes it; a hard exit does not.
- Repair: one idempotent `cleanup()` used by every exit path that closes the contexts, waits for the pids and then `rmSync(tmpBase)`.
  Set the browser `TMPDIR` to a dir inside tmpBase, so the strays scan and the removal cover it.

**H3 MEDIUM (S9 regressed): every run exposes an unauthenticated DevTools TCP port.**
- The receipt argv carries both `--remote-debugging-port=0` (:91, :599) and Playwright's `--remote-debugging-pipe`.
- A separate client in the same netns read `DevToolsActivePort` and did `curl /json/list`. It got the
  `webSocketDebuggerUrl` values for the `page` target and the `browser_ui chrome://omnibox-popup.top-chrome/` target.
- On a host run (the committed receipt ran without a netns), any local process or UID can reach 127.0.0.1:<port> for the whole run. It can
  attach, evaluate script and inject frames into the "verbatim" CDP evidence stream. Only the profile dir hides the port number, and a
  port scan finds it.
- `safety.cdpChannel` calls the port "run-owned", which describes its lifetime but not its access control.
- Repair (pick one): drive WebMCP over Playwright `context.newCDPSession(page)` on the existing pipe and drop the port (my probe invoked
  WebMCP.invokeTool that way successfully); or require the netns, so the port is unreachable from the host.

**H4 MEDIUM (S5 not fixed): a tool's execute can write host files through a download, and nothing records it.**
- Probe `probe-dl.mjs` used the harness's launch options verbatim (no `acceptDownloads`). A WebMCP tool invoked over CDP clicked a `blob:`
  download.
- Result: `downloads:[{name:"sentinel.txt", path:"$TMPDIR/playwright-artifacts-eZRqYt/dea44d2d-…"}]`, route guard `blocked:[]`.
  Playwright removed the artifacts dir both on close and on `process.exit(2)`.
- The harness has no `acceptDownloads:false` and no `download` listener (grep: none). So an invoked tool can write page-chosen bytes to the
  host temp dir, outside tmpBase, and the receipt does not show it.
- Also unchanged:
  - a non-`/__ledger` POST gets 405 and is never recorded (:335-337);
  - `served` drops the query (:376);
  - the ledger stores `{seq, at, ...payload}` (:303), so page JSON can overwrite `seq` and `at`, and entries carry no case id.
- Repair:
  - set `acceptDownloads:false` and record `page.on('download')` as a finding;
  - log `{method, rawUrl}` on every hit;
  - build the ledger as `{...payload, seq, at, caseId}`.

**S1 ISSUES (audited, not merged).** `featureSwitches` now records which switch wins (:624-645), but the tokens are still appended.
- Receipt counts: flagged `enableFeatures:2`, so Playwright's `--enable-features=CDPScreenshotNewSurface` is dropped. That means flagged and
  flag-off also differ by that feature.
- `domain-disabled` has `disableFeatures:2`, last = `--disable-features=DevToolsWebMCPSupport`. That turns Translate, OptimizationHints,
  NetworkTimeServiceQuerying, MediaRouter, DialMediaRouteProvider and HttpsUpgrades back on.
- Mitigation present: `--disable-background-networking` and `--disable-component-update` are in all three argvs.
- Repair: emit one merged enable token and one merged disable token, and assert that each count is 1.

**S3 PARTIAL.** `XDG_CONFIG_HOME` is redirected (:219), which closes the user conf. The launcher binary still holds the `chromium-flags.conf`
string (`strings /usr/bin/chromium`), and `/etc/chromium-flags.conf` is read whatever HOME is set to (absent today). There is still no argv
allowlist: grepping for `load-extension|proxy-server|no-sandbox` assertions at M finds nothing. Repair: reject those flags, plus a foreign
`--user-data-dir`, in `effectiveArgv`.

**S2 HONEST, WITH TWO OVERCLAIMS.**
- `claimScope` (:2055) and note `:93` correctly say "page-level … no claim of global host no-egress".
- Overclaim 1: the boolean `loopbackOnly: true` (:2053) and note `:39` ("Origin … externalRequestCount 0") read stronger than that scope.
- Overclaim 2: `webSockets: 'denied via context.routeWebSocket'` (:2059) is written unconditionally, although an install failure is
  swallowed (:462-465).
- WebRTC check: a loopback STUN probe (UDP listener on a non-fixture port) got 0 packets. This is not reproduced and is inconclusive, not
  proof of confinement.
- Repair: run under the netns, and record `/proc/self/ns/net`, `os.networkInterfaces()` and a boolean for whether `routeWebSocket` was
  actually installed.

**S6 PARTIAL.** Stdout prints only id and status (:928, :970). Page-side expectations are gone (`__webmcpFixture` and `expectedTools` not
found). But CDP frames, `output` and `exception` are stored verbatim with no cap (:513-516, :893-898). The committed receipt is 308507 B with
a largest string of 541 chars: fine for these fixtures, but unbounded by design. A ledger POST is capped at 64 KiB, with no limit on the
number of POSTs. Repair: cap each field and store the sha256 of the full value.

**S7 FIXED.** There is no `toolCalled` subscription. The raw socket records all events, and the negatives use protocol errors (-32602, -32601,
-32000).

**S8 UNCHANGED (LOW).** The harness still searches `NODE_PATH` (:187-188), the version check reads only package.json (:205), and there is no
sha of the entry module.

**S4b.** The per-case `Promise.race` timer is never cleared (:883). Contamination is limited by giving each case its own raw socket and page.
Not reproduced.

## Smallest repair set (priority order)
1. One cleanup/abort path plus signal handlers with Playwright's handlers off; a browser disconnect yields `could_not_evaluate`; browser `TMPDIR` inside tmpBase (H1, H2).
2. Drop `--remote-debugging-port=0` and use Playwright's `newCDPSession` over the pipe (H3).
3. `acceptDownloads:false` plus a download finding (H4).
4. Merged feature switches and an argv allowlist (S1, S3).
5. Netns witness in `safety` (S2).

## My actions / cleanup
- Everything ran in `/tmp/tabi-r17w2-SentinelHarnessAfter-8AoS`: the clone, `wd-probe.mjs` (a timeout-only copy) and `probe-dl.mjs`.
  Every browser ran inside the loopback-only netns with temp profiles.
- `pgrep -af tabi-r17w2-SentinelHarnessAfter` was empty after the runs. The sandbox was removed after this report was written.
- No installs or upgrades, no pacman, no jj or git writes in the lane, no real sites, no port 9222.

Files written:
- .ufo/waves/round-17/w2/SentinelHarnessAfter.md
