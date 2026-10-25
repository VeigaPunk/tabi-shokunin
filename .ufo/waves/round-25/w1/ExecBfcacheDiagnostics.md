# ExecBfcacheDiagnostics — round 25, wave 1

**Scope: feasibility/diagnostic probe only. This is NOT the C1 claim measurement.** Nothing here is a
committed receipt; all bytes live in the throwaway scratch dir
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/ExecBfcacheDiagnostics/`.
No tracked file was edited, no git/jj write was run, no external site was contacted (the browser ran
with `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`, and the fixture server logs show
only loopback GETs).

## Verdict

- **A real `BackForwardCacheRestore` is observable on this host's loopback** with Chromium
  154.0.8037.97 `--headless=new`, with no `--disable-back-forward-cache`: **4 of 4 default-flag runs**
  emitted `Page.frameNavigated` with `type: "BackForwardCacheRestore"` on the history step back to A.
- **The control run with `--disable-back-forward-cache`** emitted `type: "Navigation"` instead, plus
  `Page.backForwardCacheNotUsed`. That gives restores=0, and the JS state was lost.
- **JS state survives a restore.** `window.__counter` (set to 42 on A before leaving) still read 42
  after going back, the per-load random `__loadId` was unchanged, `pageshow.persisted` was `true`, and
  `document.visibilityState` was `"visible"`. In the control, the counter came back as 0, `__loadId`
  was new, and only `pageshow persisted=false` fired.
- **`Page.goBack` does not exist in CDP.** It returned
  `{"code":-32601,"message":"'Page.goBack' wasn't found"}` in all four runs that tried it. The real
  CDP history step is `Page.navigateToHistoryEntry` with the previous entry's id from
  `Page.getNavigationHistory`. In-page `history.back()` (sent through `Runtime.evaluate`) also restored.
  **The wording of frozen claim C1 ("via CDP Page.goBack") names a method that does not exist** — see
  Hazards.

## Axes (godspeed)

These were the success criteria for the probe:

- **restore observed**: a `frameNavigated` event with type `BackForwardCacheRestore`.
- **control discriminates**: the bfcache-disabled flag flips the result.
- **state-survival signal**: the counter and `loadId` read before leaving A and after returning.
- **reproducibility**: the same result across repeat runs.
- **cleanup proven**: kill by pid, ports free, connections refused.

Each variant was a separate cheap run on disjoint ports. All axes held, and nothing regressed.

## Exact flags

Default runs (`runs/v1-goback/argv.txt`; the other runs differ only in port and profile path):

```
chromium --headless=new --remote-debugging-port=19522 --remote-debugging-address=127.0.0.1 --user-data-dir=<scratch>/runs/v1-goback/profile --no-first-run --no-default-browser-check --disable-extensions --host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1 about:blank
```

Control (`runs/v3-control-disabled/argv.txt`) is the same, plus `--disable-back-forward-cache`.
`rg -c "disable-back-forward-cache" runs/*/argv.txt` matches only `runs/v3-control-disabled/argv.txt:1`.

Fixture server: `python3 -m http.server <port> --bind 127.0.0.1 -d <scratch>/fixture`. It sends no
`Cache-Control` header, and it does send `Last-Modified`.

Driver: raw CDP over Node v24.21.0's built-in `WebSocket`, connected to the page target's
`webSocketDebuggerUrl`. It enables `Page.enable`, `Page.setLifecycleEventsEnabled{enabled:true}`,
`Runtime.enable`, and `Network.enable`. No Playwright.

Sequence: `Page.navigate` to A, then wait for lifecycle `load`, then
`Runtime.evaluate window.__counter = 42`, then `Page.navigate` to B and wait for `load`, then
`Page.getNavigationHistory`. The back step is then one of two things:

- `goBack` mode: `Page.goBack`, which fails, then
  `Page.navigateToHistoryEntry{entryId: entries[currentIndex-1].id}`.
- `historyBack` mode: `Runtime.evaluate "history.back()"`.

After that the driver waits for the top-frame `Page.frameNavigated`, sleeps 1 s, calls
`Page.getNavigationHistory`, and reads the state with `Runtime.evaluate`.

## Per-run results

Produced by `node counts.mjs v1-goback v1-goback-r2 v1-goback-r3 v2-historyback v3-control-disabled`
in the scratch dir. "fN types" is the sequence of `Page.frameNavigated` types; "Reqs" is the number of
`Network.requestWillBeSent` events for `a.html` after the back step; "load" is the number of
`Page.loadEventFired` events after the back step; "NotUsed" is the number of
`Page.backForwardCacheNotUsed` events.

| Run | Back step | fN types | Restores | Same loaderId as A | Reqs | load | NotUsed | Counter before/after | Same loadId | pageshow.persisted |
|---|---|---|---|---|---|---|---|---|---|---|
| v1-goback | navigateToHistoryEntry | Navigation, Navigation, BackForwardCacheRestore | 1 | true | 0 | 0 | 0 | 42/42 | true | false, true |
| v1-goback-r2 | navigateToHistoryEntry | same | 1 | true | 0 | 0 | 0 | 42/42 | true | false, true |
| v1-goback-r3 | navigateToHistoryEntry | same | 1 | true | 0 | 0 | 0 | 42/42 | true | false, true |
| v2-historyback | history.back() | same | 1 | true | 0 | 0 | 0 | 42/42 | true | false, true |
| v3-control-disabled | navigateToHistoryEntry | Navigation, Navigation, Navigation | 0 | false | 1 | 1 | 1 | 42/0 | false | false |

In every run, `document.visibilityState` after the back step was `"visible"`. In the restore runs,
A's in-page log also recorded the transition sequence: `pagehide persisted=true` then
`visibilitychange hidden` on leaving, and `visibilitychange visible` then `pageshow persisted=true` on
return. Source: `read-after-back` step in each `capture.json`.

The navigation history after the back step was `currentIndex=1` in every run (entries: about:blank,
a.html, b.html), so a real history step occurred.

## Raw events, run v1-goback

From `node summarize.mjs v1-goback`, where `t` is milliseconds since driver start. The full raw stream
is in `runs/v1-goback/capture.json` (sha256 below).

```
t=33  Page.frameNavigated type=Navigation url=http://127.0.0.1:19521/a.html loaderId=8DFC0ECCFCED3BB7BE3BF2671ECE9056
t=38  Page.lifecycleEvent DOMContentLoaded / load  loaderId=8DFC0ECC…
t=55  Page.lifecycleEvent firstMeaningfulPaintCandidate / firstContentfulPaint / firstPaint  loaderId=8DFC0ECC…
t=340 step set-counter-A -> {"counter":42,"loadId":"ce4eb9fuqir","vis":"visible"}
t=344 Page.frameNavigated type=Navigation url=http://127.0.0.1:19521/b.html loaderId=623A3878FA9FC694401A074FE4BDA52F
t=349 Page.lifecycleEvent DOMContentLoaded / load  loaderId=623A3878…
t=851 step Page.goBack -> ERROR {"code":-32601,"message":"'Page.goBack' wasn't found"}
t=851 Page.frameStartedNavigating historyDifferentDocument
t=852 step Page.navigateToHistoryEntry -> {}
t=852 Page.frameStartedLoading
t=857 Page.frameStoppedLoading
t=857 Runtime.executionContextsCleared
t=857 Runtime.executionContextCreated origin=http://127.0.0.1:19521
t=857 Page.frameNavigated type=BackForwardCacheRestore url=http://127.0.0.1:19521/a.html loaderId=8DFC0ECCFCED3BB7BE3BF2671ECE9056
t=1859 step read-after-back -> {"href":".../a.html","counter":42,"loadId":"ce4eb9fuqir","vis":"visible",
        "log":[["pageshow",false,"visible",7.5],["pagehide",true,"visible",316.1],["visibilitychange","hidden",316.1],
               ["visibilitychange","visible",826.3],["pageshow",true,"visible",826.3]]}
```

After the restore there was no `Page.lifecycleEvent` for A's loaderId: the only lifecycle events after
t=851 are B's late `networkAlmostIdle`, `firstMeaningfulPaint`, and `networkIdle`. There was no
`Page.loadEventFired`, no `Page.domContentEventFired`, and no `Network.requestWillBeSent`.
`Page.backForwardCacheNotUsed` did not fire.

## Control run v3-control-disabled: `Page.backForwardCacheNotUsed` verbatim

```
t=855 Page.frameNavigated type=Navigation url=http://127.0.0.1:19525/a.html loaderId=7D441B5F2C2002FA44A76CB75DE9494D
t=856 Page.backForwardCacheNotUsed loaderId=7D441B5F2C2002FA44A76CB75DE9494D
  notRestoredExplanations=[{"type":"Circumstantial","reason":"BackForwardCacheDisabled"},
                           {"type":"Circumstantial","reason":"BackForwardCacheDisabledByCommandLine"},
                           {"type":"Circumstantial","reason":"BrowsingInstanceNotSwapped"}]
  notRestoredExplanationsTree={"url":"http://127.0.0.1:19525/a.html","explanations":[...same three...],"children":[]}
t=860 Page.lifecycleEvent DOMContentLoaded / load  loaderId=7D441B5F…   (plus Page.loadEventFired)
```

## Hazards for the C1 journey probe and counter

These are observed, not inferred.

1. **`Page.goBack` is not a CDP method** on 154.0.8037.97: it returned error -32601 in four runs.
   C1's declared wording "via CDP Page.goBack" can only be met literally through a client wrapper
   such as Playwright's `page.goBack()` [INFERENCE: it wraps `navigateToHistoryEntry`; not verified
   here], or through `Page.navigateToHistoryEntry` directly. The receipt and the counter's
   "history step executed" check should name the method that was actually sent. A probe that sends a
   literal `Page.goBack` gets an error and no history step.
2. **A restore emits no `load` or `DOMContentLoaded` lifecycle event and no `Page.loadEventFired`.**
   A driver that waits for `load` after the back step will time out on a successful restore. Wait on
   the top-frame `Page.frameNavigated` instead.
3. **`Runtime.executionContextsCleared` and `Runtime.executionContextCreated` fire on a restore even
   though the JS heap survives** (the counter is still 42). A cleared context does not mean lost state.
4. **The fixture server log cannot tell a restore from a re-navigation.** In the control run, CDP
   recorded a new `requestWillBeSent` for `a.html` after the back step, but `server.log` shows a
   single `GET /a.html`, because `Network.responseReceived` had `fromDiskCache: true` (python
   http.server sends `Last-Modified` and no `Cache-Control`). Only the CDP stream discriminates the
   two cases.
5. **The restore keeps A's original loaderId.** The `BackForwardCacheRestore` event's
   `frame.loaderId` equals the loaderId returned by the first `Page.navigate` to A. The control's
   re-navigation got a new loaderId. A validator can use this as a cross-check.
6. **Timestamps are in different time zones.** Driver and report times are UTC; the python
   `server.log` uses local time (UTC−3: 09:16 corresponds to 12:16Z).

## Cleanup proof

Each run's `driver.log` (via `run.sh`) records the following:

- **Precheck:** `ss -ltn | grep -E ":(HP|CP)\b"` found nothing, logged as `precheck: ports … free`.
- **Pre-kill listeners:** `ss -ltnp` showed python3 and chromium listening, with their pids.
- **Kill by explicit pid:** the chromium root pid, its profile-matched children found by scanning
  `/proc/*/cmdline` (using a `profil[e]` regex so the scan cannot match its own grep), and the server
  pid. No `pkill -f`.
- **Post-kill:** no profile-matched pids remained, `ss` showed both ports not listening, and
  `curl` to the CDP and HTTP ports exited 7 (connection refused). Profile dirs were removed.

| Run | Ports (HTTP/CDP) | Killed pids (server; chromium root) | Post-kill pids | Ports listening | curl exit |
|---|---|---|---|---|---|
| v1-goback | 19521/19522 | 1134859; 1134860 (+10 children) | [] | none | 7/7 |
| v2-historyback | 19523/19524 | 1135482; 1135483 (+10 children) | [] | none | 7/7 |
| v3-control-disabled | 19525/19526 | 1136116; 1136117 (+10 children) | [] | none | 7/7 |
| v1-goback-r2 | 19527/19528 | 1179838; 1179839 (+10 children) | [] | none | 7/7 |
| v1-goback-r3 | 19529/19530 | 1179909; 1179910 (+10 children) | [] | none | 7/7 |

Two kinds of noise are benign:

- `run.sh: /proc/<pid>/cmdline: No such file or directory` lines in the first three logs come from
  processes that exited while the scan was running.
- `chromium.log` holds 3 lines per run. Its zygote `GetTerminationStatus` error is shutdown noise.

## Retained evidence (sha256)

```
5e62d4e492fbc33cd7b12d03c623fa2f3e353d84e306c646429f2334bcaed8e5  driver.mjs
b3434b1845e77c0654a62956c10a47f73c24ebfa9e379a48ba94309bd5d930dd  run.sh
69c8ad9e6f5c034e7f2a9481360cbb3da1dc395238b1cd6964c2731d1d525618  counts.mjs
8bfaa3396b1553e97a9585a6972e10d849d0007f18e414805d37ced2ad18be33  summarize.mjs
f2a257931e3ce8b0e269d2dd1c157a55afbb73b40d557fdf7c96793cd30b555b  fixture/a.html
eca3bba355c1f909e8a666ddcd34bb8dca695cceb51f840e35a077aab58a1fe2  fixture/b.html
0a23ff90330a660c9f10cdf056f24d552076e91678d07c283ba665da0be73636  runs/v1-goback/capture.json
1c934dde7eaa24638287dbe5b78285051f4838815673b0bd48ee484f13969b38  runs/v1-goback-r2/capture.json
007a38eee6801e9600b3e8c3327a6ede6c79e9e665749ba07599e73d7c0d3c94  runs/v1-goback-r3/capture.json
3bdc8f3bc9a798a970a45c9c6fdb3445edbafaaa81c2a561b111e23cb2b7da5a  runs/v2-historyback/capture.json
fa01524efe2c25a9f9d3f69d3efeb8df393970857a5e9fce550ad3e8c2330a75  runs/v3-control-disabled/capture.json
00b24f187ed9bb6cb6e983c420fee7990c954c71ae285a36d52d234b4a69707d  runs/v1-goback/server.log
44f72e777608f0fe519d812a1b612f4dd0bb1e8af274ee2bdc8833e83616df88  runs/v2-historyback/server.log
47080ae23cb9318c3b148f269f0c07227cbc19f27a42f3391fb171a9f2515e20  runs/v3-control-disabled/server.log
46fec47e9cb2f40881eb609758ee5f603ed2400e98543d2a1c5101de9be895f2  runs/v1-goback/argv.txt
2d1a361f0b0474bc015b1bfce6555fdbfc7395a3c1152e5a4da85f1414a02955  runs/v2-historyback/argv.txt
c3b15a41dd36d0b37500315100a482370d97af24905f9fc7f8e23ceacb8dd4aa  runs/v3-control-disabled/argv.txt
```

These hashes are only verifiable while the scratch dir exists. A C1 receipt must be produced by the
claim's own committed probe, not copied from here.

## Observation, inference, and unknowns

- **Observed:** everything in the tables and event excerpts above, at Chromium 154.0.8037.97,
  `--headless=new`, on loopback 127.0.0.1, on 2026-10-25 around 12:16–12:17Z.
- **[INFERENCE]:** that Playwright `page.goBack()` maps to `Page.navigateToHistoryEntry`; not tested.
- **Unknown:** whether bfcache behaves the same in headed mode or with a cross-origin A/B pair (only
  same-origin loopback was tested), and the restore rate under load (5 runs total, 4 with default
  flags, all restored).

## Tooling

Nothing was installed or upgraded. The probe used tools already present: `/usr/bin/chromium`
154.0.8037.97, node v24.21.0, and `/usr/bin/python3`. No pacman transaction was run.
