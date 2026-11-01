source: S158 (Microsoft Learn — Debug WebView2 apps with VS Code; the host-side
  remote-debugging route), S159 (Microsoft.Web.WebView2 SDK header WebView2.h;
  the COM ABI the minimal host declares)
verified-at: 2026-11-01 (live runs receipted at corpus/evidence/round48/webview2-cdp/
  and .ufo/waves/round-48/measure/c3-repro-postfreeze-receipt.json; counter
  .ufo/waves/round-48/counters/webview2-receipt-r48.mjs predicate true)
recheck: node scripts/webview2-cdp-loopback-round48.mjs --scratch <dir> --out <receipt.json>
  then node .ufo/waves/round-48/counters/webview2-receipt-r48.mjs <receipt> --shot <png>
  --driver scripts/webview2-cdp-loopback-round48.mjs --hostsrc scripts/webview2-host-round48.cs
  (exit 0; fresh nonce per invocation)

# WebView2 over raw CDP on Windows — the third Chromium-class surface (round 48)

The WebView2 runtime (`msedgewebview2.exe`, fixed version
`C:\Program Files (x86)\Microsoft\EdgeWebView\Application\<version>` on this host)
is a full Chromium browser WITHOUT a browser shell: **the browser process exits
cleanly (code 0) within seconds when no host application holds a CoreWebView2**,
even with `--user-data-dir`, `--headless=new`, `--embedded-browser-webview=1` and
`--remote-debugging-port` on the command line (7 launcher variants measured at the
r48 round open, receipts `.ufo/waves/round-48/controls/webview2-standalone-probes/`).
The documented remote-debugging route (S158) is therefore HOST-side: the host
process is started with `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<port>`
(and `WEBVIEW2_USER_DATA_FOLDER`), and the browser writes the active port to
`<profile>\EBWebView\DevToolsActivePort` — note the **`EBWebView` subdirectory**,
one level below the profile root, unlike msedge.exe/chrome.exe which write it at
the root.

## The minimal host (no NuGet, C# 5)

`scripts/webview2-host-round48.cs` (~250 lines) is the smallest working host found:

- Compiled by the in-box Framework 4.8 `csc.exe` (`-r:System.Windows.Forms.dll
  -r:System.Drawing.dll`); no SDK, no NuGet, no admin.
- Loads the redistributable `WebView2Loader.dll` via `LoadLibraryW` +
  `GetProcAddress("CreateCoreWebView2EnvironmentWithOptions")` and a
  `Marshal.GetDelegateForFunctionPointer` delegate (this host's copy ships with
  the WSL Settings app; any redistributable copy works — the loader is not part
  of the runtime package itself).
- Declares the four COM interfaces it needs **from the SDK header's vtable order
  (S159)**: `ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler`
  (4e8a3389-…), `ICoreWebView2CreateCoreWebView2ControllerCompletedHandler`
  (6c4819f3-…), `ICoreWebView2Environment` (b96d755e-…, slot 0 =
  `CreateCoreWebView2Controller`), `ICoreWebView2Controller` (4d00c0d1-…,
  Close = slot 21, `get_CoreWebView2` = slot 22), `ICoreWebView2` (76eceacb-…,
  slot 2 = `Navigate`). Unused slots stay as stubs so offsets line up.
- **Creation must happen on the STA UI thread before `Application.Run`** (the
  completion handler is dispatched through that message pump): creating the
  environment on a background MTA thread never fires the handler.
- The controller is `put_IsVisible(1)` on an **offscreen window (-32000,-32000)**:
  a hidden (`IsVisible=0`) controller stops producing frames and
  `Page.captureScreenshot` times out; an offscreen visible one renders and
  captures while nothing appears on the desktop.
- Host lifetime contract printed on stdout: `WEBVIEW2_HOST starting` →
  `WEBVIEW2_HOST ready` → (`--auto-close-ms`) → `WEBVIEW2_HOST closing`.

## The drive (runner)

`scripts/webview2-cdp-loopback-round48.mjs`: compiles the host if the scratch exe
is absent, spawns it with the two documented env vars over a throwaway tokened
profile, discovers the port from `EBWebView\DevToolsActivePort`, confirms identity
by `/json/version` (**reports `Edg/<runtime version>`; the User-Agent has a
different Edg/ marketing version**), attaches over the WebSocket to the data:-URL
page, re-reads the invocation-bound nonce from `document.title`, captures a PNG,
then kills the HOST tree — the browser subprocess **exits by itself when the host
dies** (measured), and the keyed sweep over all processes carrying the profile
token reaches 0. Identity finding on this host (156.0.4314.50 runtime, launcher
probes 2026-11-01): `/json/version` → `Browser: "Edg/156.0.4314.50"`.

## Decision table — WebView2 vs the declared chrome/edge surfaces

| Question | chrome.exe / msedge.exe (r44/r45) | msedgewebview2.exe (r48) |
|---|---|---|
| Runs standalone with `--remote-debugging-port`? | yes | no — exits 0 without a COM host |
| CDP endpoint discovery | stderr line (Chrome) / `<profile>\DevToolsActivePort` (Edge) | `<profile>\EBWebView\DevToolsActivePort` |
| `/json/version` identity | `Chrome/…` / `Edg/…` | `Edg/<runtime version>` |
| Keeping alive | the browser process itself | the HOST process; browser follows it |
| Teardown | kill the browser tree | kill the host tree; browser already gone (verify by keyed sweep) |

## Declared residuals

- The counter binds receipt shape and committed bytes; browser-ness re-derives by
  re-running the committed runner (fresh nonce per invocation) and re-compiling
  the host from the committed `.cs` — the same residual model as r44/r45.
- A `file://` or `http://` fixture page and cross-page navigation were not
  exercised (the data:-URL nonce page is the measured surface).
- The loader DLL path is host-specific (declared per invocation via `--loader`);
  a host without any redistributable copy cannot run this surface.
