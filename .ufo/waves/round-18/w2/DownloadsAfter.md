VERDICT: PASS

Axes: H4 download denial; unique payload-byte persistence in the live browser profile/TMPDIR; TCP DevTools exposure by the launched browser.

## Finding

**Severity:** None observed for H4 in the measured candidate. The scoped exploit path was exercised and refused.

**Exploit path tested:** the embedded fixture registers `download-blob`, builds a `Blob` from `tabi-r18-download-` plus `crypto.randomUUID()`, creates an object URL, and clicks an `<a download="webmcp-refused-download.txt">` (`scripts/webmcp-invoke-round18.mjs:95-126`). The `invoke-download-refused` case calls it through `WebMCP.invokeTool` and waits for the download event/failure (`:2471-2525`).

**Impact observed:** the WebMCP invocation completed, Playwright emitted one settled download event with a non-null denial failure, and no unique fixture payload bytes appeared in the live profile/TMPDIR tree. Direct `/proc` argv and `ss` observations found no TCP listener owned by this run's Chromium PIDs. A separate host Chromium listener was visible and is explicitly not attributed to this run (details below).

**Smallest remediation:** none for H4 based on these probes; retain the explicit `acceptDownloads: false`, event/failure check, and whole-run-tree byte scan. This is limited to the fixture and observed runs; it is not a claim about all download types or all host processes.

## Exact, unmodified candidate run

- Lane `refs/heads/master` resolved to `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (the requested REV).
- Private clone commands and results:
  - `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/r-tScLXU/repo` → exit 0; stderr `Cloning into '/tmp/r-tScLXU/repo'...` then `done.`
  - `git -C /tmp/r-tScLXU/repo checkout --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004` → exit 0; stderr `HEAD is now at 530f40a round-18: source rechecks, guarded harness, routed correction evidence and build wave`.
- Exact producer `/tmp/r-tScLXU/repo/scripts/webmcp-invoke-round18.mjs`: 117990 bytes; SHA-256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`. `acceptDownloads: false` is explicitly passed to `launchPersistentContext` at line 940 (`:933-945`).
- Runtime: Node `v24.21.0`; `/usr/bin/chromium --version` → `Chromium 154.0.8037.97 Arch Linux`.
- The run used a short private sandbox root `/tmp/r-tScLXU`; `TMPDIR`, `TMP`, and `TEMP` were `/tmp/r-tScLXU/p`, with private `HOME=/tmp/r-tScLXU/p/home` and `XDG_CONFIG_HOME=/tmp/r-tScLXU/p/xdg`. Candidate path-length calculation for Chromium's `SingletonSocket` probe was 92 bytes, keeping the harness-created run tree under that private root (candidate fallback logic at `:1344-1351`).
- Exact argv (working directory `/tmp/r-tScLXU/repo`):
  `[/run/user/1000/fnm_multishells/2768_1792501039009/bin/node, /tmp/r-tScLXU/repo/scripts/webmcp-invoke-round18.mjs, --out, /tmp/r-tScLXU/p/receipt-exact.json]`.
- Observed exit 0, empty stderr; stdout ended exactly:
  `WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/r-tScLXU/p/receipt-exact.json`
  and included `WEBMCP_INVOKE_CASE id=invoke-download-refused status=pass`.
- Receipt: `/tmp/r-tScLXU/p/receipt-exact.json`, 335544 bytes, SHA-256 `e017b2e1c959b569866a414d5bc0378b0129f4106f1cb0347fc4e61094fc1cfc`; `receipt.producerSha256` equals the exact producer SHA above. Fixture SHA-256 `47591bd9ef8d80e82bb4ee3ea2acfe632e6d403fdba83d6c2f72152ce0e481f6`.
- H4 record: status `pass`; request method `WebMCP.invokeTool`, tool `download-blob`, invocation ID `2D651C21EEC3C000C2EE9B1F6D7F0605`, invocation error `null`; response `Completed`, output `download-triggered`. One event reported suggested filename `webmcp-refused-download.txt`, `failureSettled: true`, `failureError: null`, and failure text `Pass { acceptDownloads: true } when you are creating your browser context.` Marker SHA-256 `c8498ccc2cdc7b16cd24f0a23f2350e57559fa0ff46c246b596f00c7819267da`.
- The unmodified receipt's before-context-close scans both named the same full run tree `/tmp/r-tScLXU/p/tabi-r18-webmcp-invoke-aXbg0j`: each scanned 462 files, `complete: true`, `matches: []`, `errors: []`. After close, both scans had 460 files, no matches/errors, and `browserGone: true`. The producer scanner recursively reads regular files and reports errors (`:644-682`); the live external scans below independently inspected the tree while Chromium remained alive.

## Exact marker bytes while the browser was alive

To reveal the fixture's generated marker to an independent scanner, I made a **temporary clone-only instrumentation** to the harness body: print the marker immediately before the existing invoke; after the real download failure settles, print its event record and wait 500 ms before the existing pre-close scan/close. No production or lane file was changed. The original source SHA was `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`; the instrumented clone producer SHA was `138def0646c43ed1d98f944d290a446e02f9a35cfd4a00d0de3f416639052f72` (118189 bytes). This run is corroboration, not substituted for the unmodified run above.

- Instrumented command argv: `[/run/user/1000/fnm_multishells/2768_1792501039009/bin/node, /tmp/r-tScLXU/repo/scripts/webmcp-invoke-round18.mjs, --out, /tmp/r-tScLXU/p/receipt-symlink.json]`, cwd `/tmp/r-tScLXU/repo`, same isolated environment as above.
- Exit 0, empty stderr; stdout ended `WEBMCP_INVOKE verdict=pass cases=12 passed=12 failed=0 missing=0 controls=4 out=/tmp/r-tScLXU/p/receipt-symlink.json`. H4 status `pass`; instrumented receipt SHA-256 `cf654efe775dc2603dd3cfbc6df7647154a34086d4e83daeea7d9b3868e23200`, producer SHA `138def0646c43ed1d98f944d290a446e02f9a35cfd4a00d0de3f416639052f72`.
- Actual generated payload marker: `tabi-r18-download-9af7b891-95dd-4aad-80bc-8513d476f717`, 54 bytes, SHA-256 `438d71b163fc0fc0f6b54b46c414711e88b1111ae665e3d80d0e71a823a8c6c3`. At `2026-10-20T20:14:48.943Z`, the real download event had settled with the same non-null failure and no `failureError`.
- Independent scanner began at `2026-10-20T20:14:48.971Z`, immediately after that event, while all three Chromium main PIDs remained alive before and after the scan: flagged/H4 PID `1770595`, flag-off PID `1770992`, domain-disabled PID `1779848`. H4's profile was `/tmp/r-tScLXU/p/tabi-r18-webmcp-invoke-1FTVzo/flagged-profile-GG1JO9`; its observed `/proc/1770595/environ` had `TMPDIR=/tmp/r-tScLXU/p/tabi-r18-webmcp-invoke-1FTVzo/t`.
- The external scanner read the complete run tree rooted at `/tmp/r-tScLXU/p/tabi-r18-webmcp-invoke-1FTVzo` (all profiles and browser TMPDIR): 461 regular files / 8920110 bytes, exact-marker matches `[]`, errors `[]`. It also inspected symlinks: 12 total, 3 `SingletonSocket` symlinks resolving to sockets inside the run tree, 9 broken Chromium `SingletonLock`/`SingletonCookie` symlinks, and zero resolvable symlink targets outside the run tree. The producer's subsequent before-context-close scan reported 462 files, no marker matches/errors, complete; its post-close scan reported 460 files, no marker matches/errors, complete, `browserGone: true`.

## Direct effective argv and TCP listener inspection

These are live `/proc` and `ss` observations, not receipt fields. At the event-time scan above, `/proc/1770595/cmdline` (flagged Chromium main process) returned this effective argv:

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
  "--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,BlockOriginHeaderModificationOnRedirect,Translate,AutoDeElevate,OptimizationHints,NetworkTimeServiceQuerying,AimEnabled,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion",
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
  "--user-data-dir=/tmp/r-tScLXU/p/tabi-r18-webmcp-invoke-1FTVzo/flagged-profile-GG1JO9",
  "--remote-debugging-pipe",
  "about:blank"
]
```

It contains `--remote-debugging-pipe` and no `--remote-debugging-port` argument. `ss -ltnp` was run at the same live event-time sample; exact argv/exit/output:

```text
argv: ["ss","-ltnp"]
exit: 0
State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess
LISTEN 0      4096       127.0.0.1:631        0.0.0.0:*
LISTEN 0      4096      127.0.0.54:53         0.0.0.0:*
LISTEN 0      512        127.0.0.1:36381      0.0.0.0:*    users:(("omp",pid=3092,fd=98))
LISTEN 0      10         127.0.0.1:39017      0.0.0.0:*    users:(("chromium",pid=2082972,fd=77))
LISTEN 0      4096      172.17.0.1:53         0.0.0.0:*
LISTEN 0      5          127.0.0.1:8796       0.0.0.0:*    users:(("python3",pid=1511,fd=3))
LISTEN 0      5          127.0.0.1:8795       0.0.0.0:*    users:(("python3",pid=1512,fd=3))
LISTEN 0      512        127.0.0.1:8793       0.0.0.0:*    users:(("python3",pid=1516,fd=3))
LISTEN 0      512        127.0.0.1:8791       0.0.0.0:*    users:(("python3",pid=1515,fd=3))
LISTEN 0      5          127.0.0.1:8790       0.0.0.0:*    users:(("python3",pid=1517,fd=3))
LISTEN 0      5          127.0.0.1:8789       0.0.0.0:*    users:(("python3",pid=1513,fd=3))
LISTEN 0      5          127.0.0.1:8788       0.0.0.0:*    users:(("python",pid=1518,fd=3))
LISTEN 0      256        127.0.0.1:8787       0.0.0.0:*    users:(("python3",pid=1514,fd=3))
LISTEN 0      4096   127.0.0.53%lo:53         0.0.0.0:*
LISTEN 0      511        127.0.0.1:43651      0.0.0.0:*    users:(("MainThread",pid=1770583,fd=21))
LISTEN 0      4096         0.0.0.0:5355       0.0.0.0:*
LISTEN 0      4096           [::1]:631           [::]:*
LISTEN 0      4096            [::]:5355          [::]:*
```

None of the harness browser PIDs (`1770595`, `1770992`, `1779848`) owned a listener in that table. PID `2082972` is an additional host Chromium listener not among those run PIDs; I did not inspect or alter it and make no claim about its purpose. The fixture server is loopback-bound by source (`:613-620`).

## Limits and cleanup

- The unmodified candidate run verifies the producer hash and end-to-end case. The exact-marker live scan used the narrowly instrumented temporary clone to expose the generated marker and hold the context open for observation; that clone-only timing/logging change is disclosed above.
- One preliminary long-path setup was excluded: this harness deliberately falls back to `/tmp` when its `SingletonSocket` path probe is at least 100 bytes (`:1348-1349`), so the first external scanner root did not cover the actual run tree. I reran with the 92-byte short-path sandbox above; only the short-path evidence is used for the live-tree finding.
- After testing, the clone was restored to the candidate producer SHA, all run directories were already removed by the harness, no browser process with this sandbox profile remained, and `/tmp/r-tScLXU` was removed. No tools were installed or updated.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/DownloadsAfter.md