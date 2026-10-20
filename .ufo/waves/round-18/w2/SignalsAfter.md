VERDICT: ISSUES

# Tabi round 18 — signal-after falsification

## Scope and artifact identity

Tested only `scripts/webmcp-invoke-round18.mjs` at measured revision `530f40a9bc3f10436161a2af1ca0fe9bffffc004`, checked out detached in private clone `/tmp/s18-1O8dKy/repo` using `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/s18-1O8dKy/repo` followed by `git -C /tmp/s18-1O8dKy/repo checkout --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004`. The measured script SHA-256 is `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`.

Runtime: Node `v24.21.0`; `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`, exit 0. No tools were installed or updated. The controller command was `node /tmp/tabi-r18-signals-YCLy92/driver.mjs` (cwd `/tmp/s18-1O8dKy`); controller SHA-256 `af0c6c86b56221a2791a7c7c3fd35899ddf739b9d932ccdf1a5dd72f3f58f58e`. It ran three harness children with fresh TMPDIRs `/tmp/s18-1O8dKy/{a,b,c}`. Each target command, all captured from the child argv, is listed below.

## Finding F1 — LOW — an in-flight launch executes Chromium after abort

**Exploit path.** Hold the configured Chromium launcher after Playwright has spawned it but before it `exec`s `/usr/bin/chromium`; send SIGTERM twice to the live harness child; release the gate. Chromium's executable image then starts after the abort signals. This models a slow/hung executable startup. The harness had already initiated `launchPersistentContext`, but no Chromium main process existed before either signal or at gate release.

**Evidence.** `scripts/webmcp-invoke-round18.mjs:917-925` tracks the asynchronous launch; `:933-945` awaits `chromium.launchPersistentContext`; `:981-995` checks `abortState` only after that await resolves and then closes the context; `:701-708` makes cleanup wait for `pendingLaunches`; signal handling is at `:2781-2795`.

- Run 1 harness PID `1791497`, start ticks `2632566`. The gated launcher marker appeared at t=142 ms with PID `1791509`; browser-main PID list was empty and stdout was empty.
- SIGTERM at t=155 ms and repeated SIGTERM at t=275 ms: each `process.kill` returned `true`; immediately before and after each send PID `1791497` was alive with the same start ticks.
- Gate released at t=286 ms. No Chromium main PID existed at release. At t=296 ms `/proc` showed PID `1791509`, start ticks `2632580`, now executing `/usr/lib/chromium/chromium`. This is the same PID as the pre-abort shell launcher (`exec`), not a second PID; the Chromium image itself did not appear until after abort. Its argv ended in `about:blank`; no fixture case was emitted.
- Child exit: code 2, signal null, t=495 ms. Exact stdout: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM\n`; stderr empty. Receipt absent; TMPDIR entries `[]`; residual run-browser PIDs `[]`; surviving harness descendants `[]`.

This is a LOW operability defect against the literal “no browser launch after abort” acceptance: a browser image started after abort, although it was the already-spawned launcher PID and was closed without navigating or running a case. If “launch” means only a new Playwright call/PID, this run did not create a second one; the post-abort image transition is the precise observed boundary.

**Smallest remediation.** On abort, cancel or terminate only the exact in-flight launch process before waiting for `pendingLaunches` to settle; preserve the existing identity-bound cleanup. If the launch API cannot be cancelled, the acceptance must explicitly distinguish “no further browser image startup” from “no navigation/case after an already-started launch.”

## Three bounded signal runs

All targets were started as children of the controller. For all recorded sends, the child was alive immediately before delivery, `process.kill` returned `true`, and the same process identity remained alive immediately afterward. The three counted runs used a maximum 30 s stage wait, 15 s post-release browser wait and 30 s child-exit wait; each observed stage completed within 784 ms. Only loopback fixture pages were used. The controller never used a blanket Chromium kill.

### 1. Launch — SIGTERM, repeated SIGTERM

Exact target argv:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /tmp/s18-1O8dKy/repo/scripts/webmcp-invoke-round18.mjs --out /tmp/s18-1O8dKy/a/receipt.json --chromium /tmp/s18-1O8dKy/run-launch-I2GZbM/chromium-gated.sh --fixtures /tmp/s18-1O8dKy/repo/corpus/evidence/round-17/webmcp-invoke/fixtures
```

The private executable gate was SHA-256 `35da302cec4d8b93842446419ce3814069e7b6a59a9fabfa9e0ff22095b96adf`; its exact body was:

```sh
#!/bin/sh
printf '%s\n' "$$" > '/tmp/s18-1O8dKy/run-launch-I2GZbM/launch.started'
while [ ! -e '/tmp/s18-1O8dKy/run-launch-I2GZbM/launch.release' ]; do /bin/sleep 0.01; done
exec /usr/bin/chromium "$@"
```

The post-abort Chromium argv observed at t=296 ms was exactly:

```json
[
  "/usr/lib/chromium/chromium",
  "--disable-field-trial-config",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-back-forward-cache",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-extensions-with-background-pages",
  "--disable-component-update",
  "--no-default-browser-check",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-edgeupdater",
  "--disable-extensions",
  "--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,Auto-DeElevate,OptimizationHints,NetworkTimeServiceQuerying,AimEnabled,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion",
  "--allow-pre-commit-input",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-popup-blocking",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-updater-scheduler",
  "--force-color-profile=srgb",
  "--metrics-recording-only",
  "--no-first-run",
  "--password-store=basic",
  "--use-mock-keychain",
  "--no-service-autorun",
  "--export-tagged-pdf",
  "--disable-search-engine-choice-screen",
  "--unsafely-disable-devtools-self-xss-warnings",
  "--edge-skip-compat-layer-relaunch",
  "--disable-infobars",
  "--disable-search-engine-choice-screen",
  "--disable-sync",
  "--enable-unsafe-swiftshader",
  "--headless",
  "--hide-scrollbars",
  "--mute-audio",
  "--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
  "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1",
  "--enable-blink-features=WebMCP,WebMCPTesting",
  "--enable-features=CDPScreenshotNewSurface,WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp",
  "--user-data-dir=/tmp/s18-1O8dKy/a/tabi-r18-webmcp-invoke-q2f6VU/flagged-profile-9JMkZL",
  "--remote-debugging-pipe",
  "about:blank"
]
```

Output SHA-256 `8aad54253c49c0ff8f23fd5b663f3480cfe2685f2d5108dde5b9f6baabb6a83f`; empty-stderr SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. No pass/fail line or receipt.

### 2. First case — SIGINT

Exact target argv:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /tmp/s18-1O8dKy/repo/scripts/webmcp-invoke-round18.mjs --out /tmp/s18-1O8dKy/b/receipt.json --chromium /usr/bin/chromium --fixtures /tmp/s18-1O8dKy/run-first-case-Hivase/fixtures
```

The private fixture copy patched `invoke-imperative.html` so that, if the first `echo` execution is reached, it holds that execution with a pending loopback request. Its full file SHA-256 was `06c22da09bb8fdf9c8c0f822ecef1bc37b26cd8ef9e86158e0267403c8b61323`. Target first-case entry is `:1576-1581`; case completion output is only printed at `:1486`.

- Browser PID `1792011`, start ticks `2632632`, was observed at t=168 ms with its run-specific `--user-data-dir=/tmp/s18-1O8dKy/b/tabi-r18-webmcp-invoke-efF5ec/flagged-profile-HqYmoo`.
- At t=509 ms an established Chromium-to-fixture loopback TCP socket was observed (`pid=1792232`, inode `146195971`, local `0100007F:83CC`, remote `0100007F:815D`). At t=642 ms, before any `WEBMCP_INVOKE_CASE` output, SIGINT delivery to harness PID `1791691` (start ticks `2632618`) returned `true`; it remained alive after the send.

The `/proc` observation contains socket endpoints/state only, not HTTP path or body. Combined with the code's ordering (case 1 starts immediately after browser launch), it establishes the first-case fixture navigation was active; it does not independently prove the injected `echo` callback had run by t=509 ms.

- Child exit: code 2, signal null, t=725 ms. Exact stdout: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGINT\n`; stderr empty. Output SHA-256 `8ef873e18a162f878a7c4993640a99ce388d37c55cade6cb9360bec59fb2b565`; empty-stderr SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Receipt absent; TMPDIR entries `[]`; no residual browser PID or harness descendant.

### 3. Cleanup — SIGTERM, then SIGHUP

Exact target argv:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /tmp/s18-1O8dKy/repo/scripts/webmcp-invoke-round18.mjs --out /tmp/s18-1O8dKy/c/receipt.json --chromium /usr/bin/chromium --fixtures /tmp/s18-1O8dKy/run-cleanup-vXUqTf/fixtures
```

- Browser PID `1794831`, start ticks `2632707`, was observed at t=172 ms with run profile `/tmp/s18-1O8dKy/c/tabi-r18-webmcp-invoke-z2rAtz/flagged-profile-x1JGWl`. First-case loopback socket was observed at t=511 ms (`pid=1795042`, inode `146153464`, local `0100007F:821E`, remote `0100007F:9EC1`).
- A 2 MiB cleanup pad (4096 files) was created only inside that run tree. SIGTERM at t=673 ms to living harness PID `1794282` (start ticks `2632692`) returned `true`; it was still alive afterward.
- At t=721 ms the owned browser PID list was empty, while `/tmp/s18-1O8dKy/c/tabi-r18-webmcp-invoke-z2rAtz` still existed and harness PID `1794282` was alive: cleanup was in progress. SIGHUP delivered at t=721 ms returned `true`, with the same process identity alive afterward.
- Child exit: code 2, signal null, t=784 ms. Exact stdout: `WEBMCP_INVOKE verdict=could_not_evaluate finding=run_aborted signal=SIGTERM\n`; stderr empty. The first signal remains the reported abort cause; there was no duplicate output. Output SHA-256 `8aad54253c49c0ff8f23fd5b663f3480cfe2685f2d5108dde5b9f6baabb6a83f`; empty-stderr SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Receipt absent; TMPDIR entries `[]`; no residual browser PID or harness descendant.

## Boundary and finite-limit notes

The three counted runs delivered SIGTERM twice during launch, SIGINT during first-case fixture navigation/execution, and SIGTERM followed by SIGHUP during cleanup: four successful deliveries over three separate harness runs. All three aborted outputs were `could_not_evaluate/run_aborted`; none contained `verdict=pass`, `verdict=fail`, or a `WEBMCP_INVOKE_CASE` line. Receipt paths `/tmp/s18-1O8dKy/{a,b,c}/receipt.json` were absent. The controller recorded no browser strays or surviving harness descendants, and each fresh TMPDIR was empty after exit.

A discarded long-TMPDIR calibration did not send a signal and is not counted: the target's socket-path guard at `:1344-1349` chose `/tmp` because the probe path was at least 100 bytes, so the first controller's outer-TMPDIR process filter missed the browser. Those two un-aborted sandbox-only runs completed with exit 1 and private `verdict=fail` receipts; their receipt SHA-256 values were `0f8b6891c801ced567440f708f4f59cda3339f481211cfef730a409addc57380` and `53d7335dfef3307f88e058bad73009dff1256cf099f21235434eae8dbc0b2a95`. They were excluded from all signal claims and the disposable sandboxes were removed. The final counted run used the short, distinct TMPDIRs above.

No production files, fleet files, sibling files, Git index or lane VCS state were written. Temporary clones, wrappers, fixture copies, receipts and logs were removed after evidence capture.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/SignalsAfter.md
