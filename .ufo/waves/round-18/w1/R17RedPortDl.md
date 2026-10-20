VERDICT: PASS

# Round-17 harness C2 red-before evidence at B

Baseline used: `2bff864fdfee684ddbcd066cc8e735adaba2735c`.

## H3 — TCP DevTools listener and port flag reproduced

Evidence source: frozen `scripts/webmcp-invoke-round17.mjs:80-91, 593-607`. The harness sets `DEVTOOLS_PORT_ARG = '--remote-debugging-port=0'` and passes it in `launchChromium`'s args. The command line also contains Playwright's `--remote-debugging-pipe`; the pipe does not prevent this TCP listener.

Sandbox: cloned LANE with `git clone --no-hardlinks`, checked out detached at B, and confirmed `git -C /tmp/tabi-r18-RedPortDl-KGggYx/repo rev-parse HEAD` → `2bff864fdfee684ddbcd066cc8e735adaba2735c`.

Command (observer ran the harness as a child in the shown cwd, and sampled `ss -ltnp`, `/proc/<pid>/cmdline`, and nested profile directories every 50 ms):

```text
node /tmp/tabi-r18-RedPortDl-KGggYx/observe-h3.mjs
inner: node /tmp/tabi-r18-RedPortDl-KGggYx/repo/scripts/webmcp-invoke-round17.mjs --out /tmp/tabi-r18-RedPortDl-KGggYx/h3b-receipt.json
cwd: /tmp/tabi-r18-RedPortDl-KGggYx/repo
TMPDIR: /tmp/tabi-r18-RedPortDl-KGggYx/tmp-h3b
exit: 0; elapsedMs: 15065
stdout: WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-RedPortDl-KGggYx/h3b-receipt.json
```

At 15,020 ms (45 ms before exit), the profile scan found these live `DevToolsActivePort` files:

```text
.../domain-disabled-profile-y4xyny/DevToolsActivePort: 33043\n/devtools/browser/44fa8900-8a76-41a1-8ea4-b5c5b0f49001
.../flag-off-profile-s3zXNr/DevToolsActivePort: 33003\n/devtools/browser/74238588-3a9d-43ae-a0c3-0519192e5e05
.../flagged-profile-gz3JGJ/DevToolsActivePort: 40187\n/devtools/browser/3957324b-88e9-424d-818a-43b200852824
```

For the active domain-disabled profile, the concurrently sampled outputs were:

```text
ss -ltnp
LISTEN 0      10         127.0.0.1:33043      0.0.0.0:*    users:(("chromium",pid=901852,fd=82))

/proc/901852/cmdline (selected exact arguments)
--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1
--remote-debugging-port=0
--enable-blink-features=WebMCP
--disable-features=DevToolsWebMCPSupport
--user-data-dir=/tmp/tabi-r18-RedPortDl-KGggYx/tmp-h3b/tabi-r17-webmcp-invoke-xBZGFF/domain-disabled-profile-y4xyny
--remote-debugging-pipe
```

Thus a live loopback TCP DevTools listener and the `--remote-debugging-port=0` argv flag were observed together on PID 901852 during a normal B harness run. An initial observer iteration scanned only TMPDIR's top level and captured no profile evidence; I corrected it to recurse through the run/profile directories and repeated the run with a separate fresh TMPDIR, which produced the evidence above.

## H4 — WebMCP-triggered download reproduced

The throwaway script `/tmp/tabi-r18-RedPortDl-KGggYx/h4-blob-download.mjs` served only a loopback fixture. It copied the baseline launch setup from `scripts/webmcp-invoke-round17.mjs:80-91` (feature and port args), `:214-225` (minimal browser environment), and `:596-607` (`launchPersistentContext` options). It used `/usr/bin/chromium`, `headless: true`, the source args/env, `serviceWorkers: 'block'`, `chromiumSandbox: true`, and did not set `acceptDownloads`. It registered a page tool in the same style as `corpus/evidence/round-17/webmcp-invoke/fixtures/invoke-imperative.html:32-43`, attached to the page target over raw CDP, and invoked `WebMCP.invokeTool` using the source protocol shape at `scripts/webmcp-invoke-round17.mjs:729-745`. The page tool created a blob URL and clicked a download link.

Command and observed output (Playwright 1.64.0, matching the harness pin):

```text
TMPDIR=/tmp/tabi-r18-RedPortDl-KGggYx/tmp-h4 node /tmp/tabi-r18-RedPortDl-KGggYx/h4-blob-download.mjs
probeError: null
fixtureUrl: http://127.0.0.1:35839/
acceptDownloadsOptionPresent: false
invokeResult: {"invocationId":"FBDD5D231C02DF0012C0DFBA806D1F7F"}
toolResponded: {"invocationId":"FBDD5D231C02DF0012C0DFBA806D1F7F","status":"Completed","output":"download-triggered"}
download.suggestedFilename: r17-h4-download.txt
download.path: /tmp/tabi-r18-RedPortDl-KGggYx/tmp-h4/playwright-artifacts-rrBDAP/b0b2bad3-0085-4abb-ade7-0b8482c56f8a
failure: null
existsBeforeContextClose: true
bytes: 27
sha256: 8f48e105eeb141ab6dbb757856bae77e64a38b67bf3158a9b0ec50e99e5362d5
cleanup after context close: afterCloseArtifacts=[], tmpBaseRemoved=true, tmpDirChildren=[]
```

The download therefore landed under `TMPDIR/playwright-artifacts-*` while the context was open; Playwright removed the artifacts directory when the context closed. This is a confirmed B red-before for H4, not a claim that the file persisted after teardown.

## Cleanup and scope

No lane implementation files were changed, no tools were installed, and no external sites were contacted. The sandbox clone, probe scripts, receipt files, and temporary run data were removed after recording these results.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/R17RedPortDl.md`
