# SentinelHarness — round-16 wave 2 (FALSIFY)

Attack item: security review of `scripts/webmcp-loopback-round16.mjs` at
`b444ca8e024f386124418169e8e400221524bba3`. Checked: loopback bind, request abort,
websocket/service-worker denial, HOME redirect, no invokeTool/submit, temp profile
cleanup, receipt overwrite refusal.
Author-side report. This is not non-author certification.

**Overall verdict: BREAKS.** Four defects are reproduced (H1–H4). Six sub-surfaces HOLD (§HOLDS).

Identity: `git show b444ca8:scripts/webmcp-loopback-round16.mjs | sha256sum` gives
`961874e4…2be1`, the same as the working tree; lane `HEAD` = b444ca8. Node v24.21.0,
playwright 1.64.0 (fnm global), Chrome/154.0.8037.97.
Every run below used `--out /tmp/…` only. The probe runs also used a `/tmp` copy of the fixtures.
Scratch dir: `/tmp/sentinel-harness-r16-PzeZHP/`. It holds `orchestrate.mjs` (canary
listeners + process poller, foreground), `pidprobe.mjs`, and the result JSONs.
Nothing under the lane was modified except this file.

Reproduce:
`cd /tmp/sentinel-harness-r16-PzeZHP && node orchestrate.mjs $PWD probe`
(`SENTINEL_HOST=127.0.0.2` for the off-127.0.0.1 variant; `SENTINEL_NUL=1` for H2).
The orchestrator does four things:
1. Copies the committed fixtures.
2. Appends one probe `<script>` to the copied `plain.html`, plus `sentinel-{worker,shared,sw}.js` and two symlinks.
3. Binds canaries on the loopback: HTTP/WS TCP, TURN TCP, STUN UDP, WebTransport UDP.
4. Spawns the harness and polls `/proc` for its descendants.

## H1 — BREAKS (medium): loopback confinement escapes; the receipt still says `loopbackOnly: true`

Exploit path: a page served by the harness is target content (the header calls page
payloads "untrusted target data"; `--fixtures DIR` accepts any dir). Such a page reaches a
non-fixture port without the abort guard seeing it, and the request is never recorded.
`guardLoopback` (L379-419) is only `context.route('**/*')` + `context.routeWebSocket`.

Command: `node orchestrate.mjs /tmp/sentinel-harness-r16-PzeZHP probe`. Canary ports: http 39671,
turn 45447, stun 55828, wt 57820. The harness fixture server was on 35611.

Observed canary hits (`probe2.json`):

| Vector (origin 127.0.0.1:35611 page) | Reached canary? | In receipt `externalRequestsBlocked`? |
|---|---|---|
| page `fetch`/`<img>`/`sendBeacon`/`EventSource` | no | yes (aborted) |
| page `new WebSocket` | no | yes (`ws:ws://127.0.0.1:39671/v-ws`) |
| dedicated Worker `fetch` | no | yes |
| **dedicated Worker `WebSocket`** | **yes** `GET /v-worker-ws HTTP/1.1` ×2 | **no** |
| **SharedWorker `fetch`** | **yes** `GET /v-shared-fetch HTTP/1.1` ×3 | **no** |
| **SharedWorker `WebSocket`** | **yes** `GET /v-shared-ws HTTP/1.1` ×2 | **no** |
| **WebRTC STUN (UDP)** | **yes** 8 datagrams, `000100002112a442` (STUN Binding) | **no** |
| **WebRTC TURN (TCP)** | **yes** 2 conns, STUN-framed bytes | **no** |
| **WebTransport (QUIC UDP)** | **yes** 14 datagrams, 1250 B, `c1000000…` (QUIC Initial) | **no** |

That run's receipt (`/tmp/sentinel-harness-r16-PzeZHP/probe-out.json`):
- `verdict: "pass"`
- `safety.loopbackOnly: true`
- `safety.webSockets: "denied via context.routeWebSocket"`
- blocked list = the 6 caught URLs only

Off-127.0.0.1 variant: `SENTINEL_HOST=127.0.0.2 node orchestrate.mjs … probe` (`probe3.json`).
- **STUN UDP still reached 127.0.0.2:** 8 datagrams.
- The SharedWorker, worker-WS, TURN and WebTransport attempts to 127.0.0.2 got no hits. The host-resolver rule maps IP literals other than 127.0.0.1 to NOTFOUND.
- [INFERENCE] WebRTC STUN to a public IP literal would leave the host by the same path. Not tested (loopback-only contract).

Impact:
- The capability receipt's confinement claim is false for workers, WebRTC and WebTransport.
- A target page can talk to any local service on 127.0.0.1 (any port) and send UDP to arbitrary IP literals, with no trace in the receipt.
- The committed run is not shown to have egressed: the committed fixtures contain none of these vectors (grep `WebSocket|SharedWorker|new Worker|RTCPeerConnection|WebTransport|serviceWorker|fetch\(` → no matches).
- The defect is in the guard and in the claim, not in the committed run's bytes.

Smallest remediation:
1. Narrow `safety`/the claim to what is enforced: page and dedicated-worker HTTP, plus page WS.
2. Enforce more where Chromium allows it: `--force-webrtc-ip-handling-policy=disable_non_proxied_udp` and `--disable-features=WebTransport…`, or an init script removing `RTCPeerConnection`/`WebTransport`/`SharedWorker`.
3. Add a canary self-test case like this one, so `pass` requires zero canary hits.

## H2 — BREAKS (low-medium): a NUL byte in the request path crashes the fixture server and the whole harness

Exploit path: L288 `decodeURIComponent` turns `%00` into `\0`. The value goes straight into `realpathSync` (L304, inside a try) and then `lstatSync(abs)` (L309, **outside a try**). That throws `ERR_INVALID_ARG_VALUE` inside the `http` request handler, which is an uncaught exception.
Any local process, or a same-origin page `fetch('/x%00')`, which the route guard allows, kills the run.

Command: first `node orchestrate.mjs … probe` run (`result-probe-*.json`, earliest). It sent `GET /plain.html%00.txt` to the fixture server mid-run. Observed:
```
TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' must be a string, Uint8Array, or URL without null bytes. Received '/tmp/sentinel-harness-r16-PzeZHP/fixtures/plain.html\x00.txt'
    at lstatSync (node:fs:1765:10)
    at Server.<anonymous> (file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-loopback-round16.mjs:309:26)
```
- Harness exit code **1**. The header defines 1 as the `fail` verdict, but no receipt was written. `could_not_evaluate` would be 2.
- The next requests got `ECONNREFUSED`.
- Left behind: `/tmp/tabi-r16-webmcp-heeICC/flagged-profile-EZ7vSz` and `/tmp/tabi-r16-webmcp-proto-sZhlOT`. Browsers were reaped by Playwright (`alive: []`).

Smallest remediation: put L309 inside the try, or reject `pathname.includes('\0')` with 400 before `join`.

## H3 — BREAKS (low-medium): protocol-capture profile leaks on every run, outside the closure proof

Exploit path: `fetchProtocolDomain` (L615-685) calls `child.kill('SIGKILL')` (L678) and then `rmSync(profile)` (L682) right away, without waiting for `exit`.
The child processes keep writing after the removal: the network service writes `Default/.org.chromium.Chromium.Network Persistent State.XXXX`, and `Default/Cache/Cache_Data/index-dir/the-real-index` also reappears.
The closure proof cannot see this leak:
- `profileChecks` (L1466-1469) covers `launchedRuns` only.
- `findProcessesUsing(tmpBase)` (L1472) matches the `tmpBase` marker, not `tabi-r16-webmcp-proto-*`.
- So `closure.everyStopProof` stays `true`.

Observed: 6/6 of my harness runs left their proto dir (`uddLeft.exists: true`):
- `proto-sZhlOT`, `Hry6S7`, `gpC8av`, `z2gTII`, `wxWLGc`, `dLHmZu`.
- For example, `ls -la /tmp/tabi-r16-webmcp-proto-Hry6S7/Default` → `.org.chromium.Chromium.Network Persistent State.wSxKJ5` (111 B) and `Cache/`.

Host-wide: `ls -d /tmp/tabi-r16-webmcp-proto-* | wc -l` → **105** at 2026-10-20T12:05-03:00. The earliest birth time was 11:46:06. Only this script uses that prefix (lane grep).
[INFERENCE] The committed receipt's run (tmpBase `xwUH4U`) also leaked one. I can't map a specific dir to it, because the proto path is not recorded in the receipt.

Smallest remediation:
1. `await` the child's `exit` (with a bound) after SIGKILL, then `rmSync`.
2. Push `profile`/`home` into the closure `tempPaths`.
3. Use a marker that covers them (e.g. create them under `tmpBase`).

## H4 — BREAKS (medium): the argv-readback and PID stop-proofs are vacuous; the flag-off control passes by accident

Exploit path: `launchChromium` sends `SystemInfo.getProcessInfo` on a **page** CDP session (L710-712). The error is swallowed, so `pid = null`. This cascades:
- `effectiveArgv` is never read (L730), so `webmcpArgvTokens = []` (L731).
- The flag-off check `argvClean = run.webmcpArgvTokens.length === 0` (L775) is true without testing anything.
- The closure `pidChecks` set `gone: true` whenever `pid === null` (L1456-1464).
- `realExecutable`/`realExecutableSha256` are null.

Evidence:
- Committed `receipt.json`: `.runs[] | {label,pid,effectiveArgv}` → all three `pid: null, effectiveArgv: null`. The flag-off detail reads "effective argv clean (pid null)". `closure.pids` all `{pid:null, gone:true}`. `receipt-first-run-failed.json` has the same values.
- Root cause, `node /tmp/sentinel-harness-r16-PzeZHP/pidprobe.mjs` → `{"pageSessionError":"cdpSession.send: Protocol error (SystemInfo.getProcessInfo): SystemInfo.getProcessInfo is only supported on the browser target"}`.
- Latent: the real flag-off browser argv, read from `/proc` by my poller, contains `--user-data-dir=/tmp/tabi-r16-webmcp-SbS6pP/flag-off-profile-xNanJh`. That token matches `/webmcp/i`. If the PID readback were fixed as written, the flag-off control would **fail** on its own profile path.

Impact: the receipt asserts "effective argv is read back from /proc/<browser-pid>/cmdline; the flag-off control asserts no WebMCP feature token reaches that argv". That readback was not observed. It was fabricated by a default value. It is a provenance defect even though the behaviour below holds.

Smallest remediation:
1. Find the browser PID by scanning `/proc` for `--user-data-dir=<profile>` without `--type=` (the existing `findProcessesUsing` can do this).
2. Treat `pid === null` as a failed proof, not a passed one.
3. Match only `--enable-features=`/`--enable-blink-features=` values that contain `WebMCP`.

## HOLDS

- **Loopback bind — HOLDS.** Observed with `ss -Hltnp` during the probe run:
  - `127.0.0.1:35611 … MainThread pid=3806256` (the fixture server; the code also asserts this at L340).
  - `127.0.0.1:33405 … chromium pid=3806403` (proto DevTools, `--remote-debugging-address=127.0.0.1`).
  - The Playwright launches use `--remote-debugging-pipe`, so they open no TCP listener.
- **HTTP request abort — HOLDS** for page and dedicated-worker HTTP. Page `fetch`, `img`, `sendBeacon`, `EventSource` and worker `fetch` never reached the canary and are listed in `externalRequestsBlocked`. Not for worker WS, SharedWorker, WebRTC or WebTransport (H1).
- **Page WebSocket denial — HOLDS** (`ws:ws://127.0.0.1:39671/v-ws` blocked, no canary hit). Worker WebSockets break it (H1).
- **Service worker block — HOLDS.** `navigator.serviceWorker.register('sentinel-sw.js')` ran, but `sentinel-sw.js` never appears in `server.served`. It contains `sentinel-shared.js` and `sentinel-worker.js` only.
- **HOME/XDG redirect — HOLDS (behaviour).** `/proc/<pid>/environ` of all 4 browser processes:
  - `HOME=/tmp/tabi-r16-webmcp-…-home-…`, `XDG_CONFIG_HOME=<home>/.config`.
  - Env keys `CHROME_DESKTOP,CHROME_VERSION_EXTRA,CHROME_WRAPPER,HOME,LANG,PATH,TMPDIR,TZ,XDG_CONFIG_HOME`.
  - No token from `~/.config/chromium-flags.conf` (`--ozone-platform=wayland`, `TouchpadOverscroll…`, `--load-extension=…`, `Vulkan`) appears in any browser argv.
  - `/etc/chromium-flags.conf` is absent. The launcher ELF also reads it (string `chromium-flags.conf/etc`).
  - The receipt itself does not prove the redirect (H4).
- **No invokeTool/submit — HOLDS.** Grepping the harness for `invokeTool|cancelInvocation|executeTool|requestSubmit|\.submit\(|execute\(` finds only comments and the `safety` string. The fixtures match only README prose. The committed receipt has 0 cases with a `WebMCP.toolCalled` event.
- **Receipt overwrite refusal — HOLDS.**
  - Differing file: `node orchestrate.mjs … refuse /tmp/…/existing.json` → exit 2, `receipt_differs`. `sha256sum existing.json` was `01d09d19…9dee` before and after.
  - Symlink: `ln -sf victim.txt link.json; node orchestrate.mjs … refuse /tmp/…/link.json` → exit 2, `receipt_not_regular`. `victim.txt` still reads `victim`.
  - No `.receipt.*.tmp` residue.
  - Per L1593-1597, the symlink check runs before `--force` is consulted (read, not run with `--force`).
- **Fixture traversal/symlinks — HOLDS.** `/sentinel-link.html` (→/etc/hostname), `/sentinel-dir/hostname` (dir symlink → /etc), `/..%2f..%2f..%2fetc%2fhostname`, `/%2e%2e/%2e%2e/etc/hostname` and `//etc/hostname` all returned 404. `/plain.html` returned 200.

## Minor (low)

- **SIGINT leaves temp state.** `node orchestrate.mjs … sigint 4000` → exit 130 and no receipt. `tmpBase /tmp/tabi-r16-webmcp-Z3S4uI` with all three profiles remained, plus `proto-dLHmZu`. Browsers were reaped. There is no signal handler, and the L1615 watchdog `process.exit(2)` skips cleanup the same way (read, not run).
- **UNPROVEN:** the `data:` exemption (L386) admits every data: navigation, including subframes, not only "top-level" as the comment says. data: is not a network fetch, so there is no egress impact. Not exercised.

## Tooling

No installs or updates.

## Cleanup

I removed my own `/tmp` leftovers from these runs after recording the evidence above. This was attributed by run: `proto-{sZhlOT,Hry6S7,gpC8av,z2gTII,wxWLGc,dLHmZu}`, `tabi-r16-webmcp-{heeICC,Z3S4uI}`. I did not touch other agents' dirs. The scratch dir `/tmp/sentinel-harness-r16-PzeZHP/` is kept for replay.
