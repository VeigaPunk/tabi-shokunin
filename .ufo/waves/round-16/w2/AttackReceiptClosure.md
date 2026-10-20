# AttackReceiptClosure — round-16 wave 2: closure and loopback-confinement evidence

Seat `TabiR16.AttackReceiptClosure`, author-side attack (not certification).
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD
`b444ca8e024f386124418169e8e400221524bba3`. Target of attack: `corpus/evidence/round-16/webmcp/receipt.json`
(`.closure`, `.loopback`, `.server`, `.safety`) against QUALITY 18 (`corpus/QUALITY.md:54-59`).
I launched browsers loopback-only, ran the harness only with `--out /tmp/...`, and mutated only
copies under `/tmp`. Nothing in the lane was modified except this report. No tools installed.

## Verdict

| # | Item attacked | Verdict |
|---|---|---|
| 1 | Is closure proven per run? (`.closure.pids[*].gone`, `everyStopProof`) | **BREAKS** — every per-run "worker gone" is the loop initializer, not a measurement; `pid` is structurally always `null`. |
| 2 | Is the closure proof set *complete*? (protocol-domain browser + its temp dirs) | **BREAKS** — a fourth Chromium process and 2/8 temp dirs are outside every proof; the profile is re-created after deletion and persists (reproduced 2/2). |
| 3 | Is `externalRequestCount: 0` meaningful given SW/WS/host-resolver? | **BREAKS as confinement evidence** (`UNPROVEN` for the `page-level exact-origin confinement` claim). Holds only as the much narrower "0 blocked HTTP(S)/WS requests were recorded". |
| 4 | `.server.portRefusedAfterClose` classification | Minor defect; observed value is correct (`ECONNREFUSED`), but a client timeout is reported as `refused: true`. |
| 5 | QUALITY 18 historical clause (same-checker red→green witness) | Not satisfied by the retained pair: red and green were produced by different producer blobs. |

The closure machinery has a real global backstop (proven below by mutation), but the *summary as
emitted* asserts a per-worker and complete stop proof it does not have.

## Evidence

### E1 — `gone: true` is the initializer; `pid` can never be collected (BREAK)

`scripts/webmcp-loopback-round16.mjs:1454-1465`:

```js
1454	  const pidChecks = launchedRuns.map((r) => {
1455	    let gone = true;
1456	    if (r.pid !== null) {
1457	      try {
1458	        process.kill(r.pid, 0);
1459	        gone = !existsSync(`/proc/${r.pid}`);
1460	      } catch {
1461	        gone = true;      // ESRCH = gone: legitimate
1462	      }
1463	    }
1464	    return { label: r.label, pid: r.pid, gone };
1465	  });
```

When `r.pid === null`, `gone` is never computed — it is the literal `true` from line 1455 and it
enters `stopProofs` (line 1474). The committed receipt is exactly this case for **all three** runs:

```json
"pids":[
 {"label":"flagged","pid":null,"gone":true},
 {"label":"flag-off","pid":null,"gone":true},
 {"label":"domain-disabled","pid":null,"gone":true}]
...
"everyStopProof": true
```

`corpus/evidence/round-16/webmcp/receipt.json` (same shape in `receipt-first-run-failed.json`), e.g.

```
$ node -e 'const r=require("./corpus/evidence/round-16/webmcp/receipt.json");console.log(JSON.stringify({pids:r.closure.pids,everyStopProof:r.closure.everyStopProof}))'
{"pids":[{"label":"flagged","pid":null,"gone":true},{"label":"flag-off","pid":null,"gone":true},{"label":"domain-disabled","pid":null,"gone":true}],"everyStopProof":true}
```

Why `pid` is always `null` — root cause observed, not inferred. `launchChromium` collects the pid
from `SystemInfo.getProcessInfo` on a **page** CDP session (`:709-717`). On this Playwright/Chromium
pair that call always fails:

```
$ node /tmp/clos-probe/wt.mjs
SystemInfo on page session: {"ok":false,"err":"cdpSession.send: Protocol error (SystemInfo.getProcessInfo): SystemInfo.getProcessInfo is only supported on the browser target"}
```

Probe launched the same `launchPersistentContext` shape as the harness (persistent profile, minimal
env, `HOST_RESOLVER_DENY`) and called `context.newCDPSession(page).send('SystemInfo.getProcessInfo')`.
Every live run I made reproduced `pid: null` (committed receipt, red receipt, two instrumented runs,
one plain run). So the per-run branch at `:1456-1463` is dead code in this configuration and the
summary's "worker stopped" claim is carried by three unmeasured initializers. That is precisely
QUALITY 18's first clause: the cleanup summary does not agree with a complete nonempty set of
*worker proofs*.

### E2 — closure set is incomplete: the protocol-domain browser and its profile are outside every proof (BREAK)

`fetchProtocolDomain` (`:615-670`) spawns a fourth Chromium, before the three counted runs:

```
617	  const profile = mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-proto-'));
618	  const home = mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-protohome-'));
...
  } finally {
    try { child.kill('SIGKILL'); } catch { ... }
    rmSync(profile, { recursive: true, force: true });
    rmSync(home, { recursive: true, force: true });
  }
```

That process is never pushed to `launchedRuns`, so it has no `.closure.pids` entry, no
`.closure.tempPaths` entry, and its marker is not `tmpBase` so `findProcessesUsing(tmpBase)`
(`:1472`) cannot see it. `.closure.tempPaths` therefore lists 6 of the 8 temp dirs the run creates,
and `.closure.pids` lists 3 of 4 browser processes. `everyStopProof` is still `true`.

The omission is material: the `finally` races the SIGKILLed process tree and the profile is
re-created *after* a successful delete. Instrumented copy of the lane harness (one added
`console.error`; no behavioural change):

```
$ node /tmp/clos-probe/inst2.mjs --fixtures <lane fixtures> --out /tmp/clos-probe/inst2-out.json
PROTO_PROFILE=/tmp/tabi-r16-webmcp-proto-JMWczB
AFTER_RM exists=false throw=null
AFTER_WAIT exists=true entries=Default
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
```

`rmSync` genuinely removed the directory (`exists=false`, no throw); 1.5 s later it existed again
with `Default` re-created. Reproduced on both instrumented runs (`...-dOcDea`, `...-JMWczB`); the
leftovers contain `Default/Cache/Cache_Data` and
`Default/.org.chromium.Chromium.Network Persistent State.*`, i.e. Chromium's network service wrote
after the browser pid was killed. `pgrep -af <profile>` afterwards: no surviving process, so this is
a directory/state leak rather than a permanent process leak — but it is still unproven cleanup, and
it is invisible to `.closure`.

Host has 80+ such dirs accumulated during this wave (concurrent peer runs also execute the lane
harness, so the count alone is not attributable). One is time-consistent with the committed run:

```
$ ls -ld --time-style=full-iso /tmp/tabi-r16-webmcp-proto-6B9gZu
drwx------ 3 vgpnk vgpnk 21 2026-10-20 11:48:08.214802969 -0300 /tmp/tabi-r16-webmcp-proto-6B9gZu
$ node -e 'console.log(require("./corpus/evidence/round-16/webmcp/receipt.json").generatedAt)'
2026-10-20T14:48:16.345Z     # = 11:48:16 -0300
```

The protocol probe runs ~8 s before a receipt is written; an 11:48:08 proto dir fits the committed
run. `[INFERENCE]` — peers were also running the harness in this window, so this correlation is
suggestive, not unique attribution. The two instrumented runs are deterministic proof that the
current code path leaks.

A failed `launchPersistentContext` has the same blind spot: `profile`/`home` are created at
`:693-694` but the run is only pushed to `launchedRuns` at `:752`, after the launch succeeds.

### E3 — `externalRequestCount: 0` is a vacuous negative, and one page egress channel is invisible (BREAK for the confinement claim)

Emission (`:1573-1575`):

```
1573	    loopback: {
1574	      externalRequestsBlocked: blocked,
1575	      externalRequestCount: blocked.length,
1576	    },
```

`externalRequestCount` is not a census of egress; it is the length of the array of requests the
route guard *aborted*. Nothing in the shipped run populates it — the fixtures contain no external
reference at all:

```
$ grep -rnoE 'https?://|wss?://|fetch\(|XMLHttpRequest|sendBeacon|WebTransport|new WebSocket|serviceWorker' corpus/evidence/round-16/webmcp/fixtures/
(none)
$ grep -nE 'https?://' scripts/webmcp-loopback-round16.mjs | grep -v '127.0.0.1'
(none)
```

So `externalRequestBlocked: []` / `externalRequestCount: 0` means "no attempt was made", not "egress
would be confined". QUALITY 18's negative-property clause applies: a negative property is not the
proposition under test.

The counter is live when exercised — mutation: copy of the fixtures with an egress probe appended to
`plain.html` (DNS name, literal IPv4, `localhost`, `127.0.0.2`, `[::1]`, beacon, WebSocket), run
through the unmodified lane harness:

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/clos-probe/fx --out /tmp/clos-probe/fx-egress.json
"externalRequestCount": 21
blocked sample:
  "ws:ws://127.0.0.1:1/probe-ws"
  "http://example.com/probe-http"
  "http://93.184.216.34/probe-ip"
  "http://localhost:43933/probe-localhost"
  "http://127.0.0.2:43933/probe-altloop"
  "http://[::1]:43933/probe-ipv6"
  "http://example.com/probe-beacon"
```

That establishes the guard is armed for HTTP(S), `sendBeacon` and WebSocket (`ws:` prefix).
It also establishes why "0" cannot be read as confinement:

1. **WebTransport is invisible.** Probe with the same guard code (`context.route('**/*')` +
   `context.routeWebSocket`), page served from loopback:

   ```
   $ node /tmp/clos-probe/wt.mjs
   page __wt = rejected:WebTransportError
   blocked = ["http://example.com/probe-http","ws:ws://127.0.0.1:1/probe-ws"]
   ```

   The page constructed a `WebTransport` and attempted the connection (`__wt` is the rejection of
   `wt.ready`, so the attempt ran), while the guard recorded nothing for it. WebTransport is
   page-level egress (HTTP/3 over UDP) in the claim's own scope, and neither `context.route` nor
   `context.routeWebSocket` observes it. `.safety.claimScope: 'page-level exact-origin confinement'`
   is therefore broader than the mechanism it names.

2. **Service workers are asserted, not observed.** `.safety.serviceWorkers: "block"` is a constant
   string in the receipt (`:1565`); no case registers a worker, and no receipt field records the
   outcome. Independent probe under the same option: `navigator.serviceWorker.register()` resolved
   `undefined` instead of a registration (reading `.scope` threw), i.e. the option does block — but
   that observation is not in the receipt and is not produced by any shipped case.

3. **Host-resolver rules work and are the only name-level jail — but only the argv string is
   recorded.** With the resolver rule and *no* Playwright routing, both a DNS name and a literal LAN
   IP fail before any connection:

   ```
   resolver-only LAN literal IP: {"loaded":false,"name":"Error","msg":"page.goto: net::ERR_NAME_NOT_RESOLVED at http://192.168.0.253:34633/lan"} serverSaw []
   resolver-only DNS name: {"loaded":false,"name":"Error","msg":"page.goto: net::ERR_NAME_NOT_RESOLVED at http://example.com/"}
   ```

   So the resolver rule blocks literal IPs too in this build (I had expected a numeric-IP bypass;
   the observation corrects that). This is a real control, but the receipt records only
   `hostResolverRules: "--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1"` — descriptive
   argv text with no observed outcome, exactly the "descriptive vs observed" distinction QUALITY 18
   requires.

`.safety.webSockets: "denied via context.routeWebSocket"` is likewise descriptive. The installation
is wrapped in a bare `catch {}` (`:410-418`), so if `routeWebSocket` were unavailable the receipt
would be identical while WS were unguarded by `context.route` (Playwright's `route` does not
intercept WS upgrades). The run therefore cannot distinguish "armed" from "silently absent".

### E4 — `portRefusedAfterClose` treats timeout as refusal (minor)

`:367-370`:

```js
    req.on('timeout', () => {
      req.destroy();
      resolvePromise({ refused: true, reason: 'timeout' });
    });
```

A hung connection is scored `refused: true`. In the committed receipt the value is the honest
`{"refused":true,"reason":"ECONNREFUSED"}`, and the drain proof itself is sound: `closeServer`
awaits `server.close(cb)` after `closeAllConnections` (`:350-358`). The note in the receipt
("this is the drain proof, not the stop proof") is accurate. Defect is the classifier, not this
run's value.

### E5 — Historical correction lacks a same-checker red→green witness (QUALITY 18, third clause)

Retained red (`receipt-first-run-failed.json`) and green (`receipt.json`) were emitted by different
producer blobs:

```
red    producerSha256 cedccdf9b649fcead09b391cfe7b34fcbcb992ce503aac8adf21a55699149779  2026-10-20T14:46:36.879Z  verdict fail
green  producerSha256 961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  2026-10-20T14:48:16.345Z  verdict pass
$ sha256sum scripts/webmcp-loopback-round16.mjs
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  scripts/webmcp-loopback-round16.mjs
```

The red receipt cannot witness the corrected checker (expectations were changed after it ran), and
no retained case-level mutation witness for the repaired expectations exists under
`corpus/evidence/round-16/`. Input digests are retained per case (`fixtureSha256`) and producer
digests are retained, but the "same-checker red→green witness" and an explicit
"this is historical / not re-executed" qualifier for the red run are absent. My survivor mutation
(below) is exactly such a same-checker red witness for the closure gate, and the harness does not
ship one.

## What holds (counter-evidence I produced)

- **The stray-process scan is real and catches live browsers.** Mutant copy that neutralises
  `context.close()`:

  ```
  $ node /tmp/clos-probe/mut-survivor.mjs --fixtures <lane fixtures> --out /tmp/clos-probe/mut-survivor.json
  WEBMCP_LOOPBACK verdict=fail cases=11 passed=11 failed=0 missing=0
  everyStopProof false  strays 36  verdict fail  findings ["closure_incomplete"]
  ```

  36 Chromium processes (browser, zygote, renderer, GPU, network, crashpad) were detected by
  `findProcessesUsing(tmpBase)`; the survivors were killed and the mutant tmp tree removed.
  So the global backstop works — the defect is that the receipt also counts vacuous per-run proofs,
  omits one process tree, and presents the aggregate as complete.

- **The route guard and counter are live** for HTTP(S), `sendBeacon` and WebSocket (E3, 21 entries).
- **The resolver rule blocks both names and literal IPs** when routing is absent (E3.3).
- **Server drain** is proven: `server.close(cb)` after `closeAllConnections`, and the observed
  post-close probe is `ECONNREFUSED`.
- **Receipt↔producer binding holds**: `sha256sum scripts/webmcp-loopback-round16.mjs` equals
  `receipt.producerSha256` (`961874e4…`) at HEAD.

## Residual risk / verification gaps

- `.runtime.observed.chromium.realExecutable` and `realExecutableSha256` are `null` in the receipt
  (pid null), while
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md` §Scope says "Both are recorded; they are
  different files". The launch-path hash is recorded; the engine hash is only in `runtime-pin.json`
  as a `sha256sum` transcript. The note overstates what this receipt observed. `[OUT OF PRIMARY
  SCOPE — noted because it is the same observed/descriptive confusion]`
- `.closure.tempPaths` proves removal of paths that were all deleted by one bulk
  `rmSync(tmpBase)`; it is one observation, not six independent worker proofs.
- I did not test WebRTC/STUN egress or a reachable HTTP/3 endpoint, so whether the WebTransport
  attempt would *succeed* unblocked is untested; only its invisibility to the guard is proven.
- `flags-off-negative-control` passes `argvClean` from `run.webmcpArgvTokens.length === 0`, which is
  vacuously true when `effectiveArgv` is `null` (`:775`); the note already admits the argv readback
  is unproven, but the case detail still prints "effective argv clean (pid null)".
- Concurrent peers run the same harness on this host; host-wide `/tmp` counts are not attributable
  to any single run. The re-creation sequence is attributed because the profile name was printed by
  the instrumented copy itself.

## Minimum change that would close the two BREAKs

1. Make `gone` nullable/tri-state: only count a pid proof when `pid !== null`; otherwise record
   `proven:false` and either obtain the pid (browser-level CDP session / `/proc` parent-of-crashpad
   scan) or fail the closure gate. `stopProofs` must not receive an unmeasured `true`.
2. Include `fetchProtocolDomain` in the tracked-run set (pid + profile + home), wait for its child
   tree to exit (or kill the process group) before deleting, and include its dirs in
   `.closure.tempPaths`; scan strays against `tmpdir()` prefixes, not only `tmpBase`.
3. Either add a positive-control case that attempts external HTTP/WS (and asserts the recorded
   abort) or rename the field to what it measures (`blockedHttpRequests`) and drop
   `loopbackOnly`/`claimScope` to the tested transport set; declare WebTransport/WebRTC untested.
4. Record `routeWebSocket` installation and `serviceWorkers` enforcement as observed booleans
   (catch the install failure into a receipt field rather than swallowing it).

## Commands run (all read-only on the lane; mutations only under /tmp)

```
node scripts/webmcp-loopback-round16.mjs --out /tmp/r16-closure-1792508335-3092.json
node /tmp/clos-probe/inst.mjs  --fixtures <lane>/corpus/evidence/round-16/webmcp/fixtures --out /tmp/clos-probe/inst-out.json
node /tmp/clos-probe/inst2.mjs --fixtures <lane>/corpus/evidence/round-16/webmcp/fixtures --out /tmp/clos-probe/inst2-out.json
node /tmp/clos-probe/mut-survivor.mjs --fixtures <lane>/corpus/evidence/round-16/webmcp/fixtures --out /tmp/clos-probe/mut-survivor.json
node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/clos-probe/fx --out /tmp/clos-probe/fx-egress.json
node /tmp/clos-probe/wt.mjs
node /tmp/clos-probe/lan.mjs
grep -rnoE 'https?://|wss?://|fetch\(|XMLHttpRequest|sendBeacon|WebTransport|new WebSocket|serviceWorker' corpus/evidence/round-16/webmcp/fixtures/
node -e '<receipt field extracts>'
ls -ld --time-style=full-iso /tmp/tabi-r16-webmcp-proto-*
```

No tool installed or upgraded; nothing written under the lane except this report.
