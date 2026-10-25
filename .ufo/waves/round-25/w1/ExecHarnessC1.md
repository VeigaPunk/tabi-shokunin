# ExecHarnessC1: loopback bfcache journey probe (prototype), wave 1, round 25

Seat: L1Tabi25.ExecHarnessC1 (executor, leaf). Lane tip when I ran: `git rev-parse HEAD` -> `c8ef3084c6363f265b9d23285296ab3547654f57`.
Scratch: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/ExecHarnessC1/`. I wrote no tracked files, made no git writes on the lane, and installed no tools.

## Result

**OBSERVED:** the positive journey (A -> B -> back to A through a real history step, back/forward cache NOT disabled) produced a main-frame `Page.frameNavigated` with `type: "BackForwardCacheRestore"`. It happened on both positive attempts.

Both negative controls produced no restore:
- **No history step (A -> B only):** 0 restores.
- **Journey run with `--disable-back-forward-cache`:** 0 restores. The back step came in as a plain `Navigation`, and a `Page.backForwardCacheNotUsed` event cited `BackForwardCacheDisabledByCommandLine`.

All three runs cleaned up fully. Both browser and server were killed by explicit pid, both ports were free afterwards, and curl exited with 7 on both ports.

## Axes (godspeed)

| Axis | What it means here |
|---|---|
| Evidence fidelity | Every number comes from a raw CDP log line, and each receipt event carries its raw `seq`. |
| Control separation | The positive run differs from each control by exactly one variable. |
| Cleanup hygiene | Kills are by pid, and port/curl/pgrep checks prove the cleanup. |
| Counter compatibility | The draft receipt is scored by the sibling's untracked `scripts/check-bfcache-receipt.mjs`. |

Every change I kept improved one of these axes without harming another: the stream-finish fix, the argv split fix, and the receipt reshape.

## Probe

- **`probe.mjs`** (sha256 `3eba5f58f8140c52b8542f1f6811e0aba85711c2e7fb2b32c16709d58abac55c`)
  - Plain node with no npm dependencies. Uses the `node:*` built-ins, the global `WebSocket`, and `fetch`. Node is `v24.21.0` (`node --version`).
  - Usage: `node probe.mjs <positive|nohistory|disabled>`.
  - Picks free ports by binding port 0 on 127.0.0.1.
  - Starts `python3 -m http.server <port> --bind 127.0.0.1 --directory fixture`.
  - Launches chromium and connects to the first `page` target from `/json/list`.
  - Enables `Page`, `Network` and `Runtime`, then records **every** inbound CDP message to `runs/<mode>/events.jsonl` (`{seq,t,msg}`) and every outbound command to `commands.jsonl`.
- **`fixture/a.html`, `fixture/b.html`**
  - Each page sets a random `window.__nonce` at load and records `pageshow.persisted` into `window.__pageshow`.
  - Neither page has an unload handler, and python's http.server sends no `Cache-Control: no-store`.
- **Steps**
  1. `Page.navigate` to A, then wait for `Page.loadEventFired`.
  2. `Page.navigate` to B, then wait for `Page.loadEventFired`.
  3. The history step:
     - It first sends the literal `Page.goBack`, which **does not exist in CDP**. The recorded reply is `{"code":-32601,"message":"'Page.goBack' wasn't found"}`.
     - It then calls `Page.getNavigationHistory`, asserts that `entries[currentIndex-1].url == A`, and calls `Page.navigateToHistoryEntry {entryId}`. This is the primitive Puppeteer's `page.goBack()` uses.
     - Afterwards it waits for a main-frame `Page.frameNavigated` and lets things settle for 1500 ms.
     - `historyAfter.currentIndex` drops from 2 to 1, so this is a real history step, not a fresh navigation.
- **Screenshots and page state:** a `Page.captureScreenshot` PNG is taken after each step, along with a `Runtime.evaluate` of nonce, `pageshow` and `performance` navigation type.
- **Per-run outputs:** `events.jsonl`, `commands.jsonl`, `steps.json`, `meta.json`, `cleanup.json`, `receipt.draft.json`, `countercheck.json`, the PNGs, `http-server.log` and `chromium.log`.

## Launch argv

**Requested** (spawn of `/usr/bin/chromium`, with `env XDG_CONFIG_HOME=<scratch>/xdg-empty`):

```
/usr/bin/chromium --headless=new --remote-debugging-port=<dbg> --remote-debugging-address=127.0.0.1 --user-data-dir=<scratch>/runs/<mode>/profile --no-first-run --disable-gpu [--disable-back-forward-cache  (disabled run only)] about:blank
```

**Effective child process line** (`/proc/<pid>/cmdline` once `/json/version` answered; the launcher execs, so the pid stays the same):
- positive (pid 1314355):
  `/usr/lib/chromium/chromium --headless=new --remote-debugging-port=41561 --remote-debugging-address=127.0.0.1 --user-data-dir=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-25/scratch/ExecHarnessC1/runs/positive/profile --no-first-run --disable-gpu --noerrdialogs --ozone-platform=headless --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl about:blank`
- nohistory (pid 1314356): identical, with `--remote-debugging-port=38103` and `.../runs/nohistory/profile`.
- disabled (pid 1314358): identical, with `--remote-debugging-port=42239`, `.../runs/disabled/profile`, and `--disable-back-forward-cache` after `--disable-gpu`.
- Browser `Chrome/154.0.8037.97`, protocol `1.3` (from `/json/version`; `chromium --version` reports `Chromium 154.0.8037.97 Arch Linux`).

Where the effective line differs from the request:
- **Headless appends switches itself.** `--noerrdialogs --ozone-platform=headless --ozone-override-screen-size=800,600 --use-angle=swiftshader-webgl` were added by chromium in headless mode. I did not pass them.
- **The launcher's user flags were deliberately excluded.** The Arch launcher `/usr/bin/chromium` normally injects `~/.config/chromium-flags.conf`, which here contains `--ozone-platform=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=…/copy-url` and `--disable-features=Vulkan`. An empty `XDG_CONFIG_HOME` keeps them out, and the effective lines above show none of them.
- **Chromium rewrites its argv region.** `/proc/<pid>/cmdline` therefore comes back as one space-joined string, and the probe splits it.

## Per-run observations

The final runs are from one parallel batch, about 3.6 s wall time:
`node probe.mjs positive & node probe.mjs nohistory & node probe.mjs disabled & wait`.

### Main-frame `Page.frameNavigated` types (raw seq in `events.jsonl`)

| Run | `frameNavigated` types | Restores | `backForwardCacheNotUsed` |
|---|---|---|---|
| positive | seq13 `Navigation` (a.html), seq39 `Navigation` (b.html), seq57 **`BackForwardCacheRestore`** (a.html) | 1 | none |
| nohistory | seq13 `Navigation` (a.html), seq39 `Navigation` (b.html) | 0 | none |
| disabled | seq13 `Navigation` (a.html), seq39 `Navigation` (b.html), seq58 `Navigation` (a.html) | 0 | seq60: `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine`, `BrowsingInstanceNotSwapped` (all `Circumstantial`) |
| positive, attempt 0 (harness hung, see below) | seq13 `Navigation`, seq39 `Navigation`, seq57 **`BackForwardCacheRestore`** | 1 | none |

### Corroboration of the restore (observed in the positive run)

- **Same document:** the restore event has `loaderId` `1941FE13C74DB519D590080CA2038552`, identical to A's original seq13 load. The disabled run's back step got a new `loaderId` (`518E03F4…` versus `49691757…`).
- **Same JS heap:** the page nonce `ferby0qy2fb` was the same after step 1 and after the back step, and `__pageshow` went from `[false]` to `[false, true]`, i.e. the second pageshow had `persisted=true`. In the disabled run the nonce changed (`f01ya2qwvl` -> `uyv96cfii2c`), `pageshow` stayed `[false]`, and the navigation type was `back_forward`.
- **Navigation type is not a signal:** after the restore, `performance` navigation type still read `navigate`. That is the original entry, so it should not be used to detect restores. **[INFERENCE]** this matches how bfcache restores behave in general.
- **Server log:** it showed `GET /a.html` twice, `GET /favicon.ico` and `GET /b.html`, and no third `GET /a.html` in any run. The first `GET /a.html` is the probe's own readiness fetch. The disabled run's back load also made no server request; **[INFERENCE]** it was served from the HTTP cache. So the server log separates nothing here; the nonce, `loaderId` and `pageshow` do.
- **Screenshots:** `runs/positive/3-a-back.png` (sha256 `842069fe5a08f928ce3c65a4a4cba5fcd92b0012797f5a35adea6bcdb8f6f075`; all screenshot digests are also in `receipt.draft.json` under `corroboration.screenshots`). Page text after the restore: `A nonce=… pageshow persisted=true count=2`.

### Raw log digests (`sha256sum runs/*/events.jsonl`)

- positive `76a8b7c7969874989e30d7d250e35e151e1ed7b778ec9729cb1764ca3743cc1f` (61 lines)
- nohistory `7469868238c90ed2a94ce8d1a766b91a6c4bc52c1d48eff43668fc5c3262b45c`
- disabled `474ea935bc7849d1d662d2518bda13e813d7e61bcb1307ae8ae7a2495e344398`
- attempt 0 `e853c85ecc7660e57db688acc77dc309e1441b4113e372dab150c21e84f42abe`

## Cleanup proof (`runs/<mode>/cleanup.json`)

In every run the probe did the following:
1. Sent `process.kill(<chromium pid>, SIGTERM)` and waited for the exit.
2. Ran `pgrep -f -- <profile>` to sweep for strays and SIGKILL them by pid. No strays were found in any run.
3. Sent `process.kill(<http pid>, SIGTERM)`.
4. Recorded the proof checks.

| Run | Pids killed (exited after SIGTERM) | `ss -Hltn ( sport = :H or sport = :D )` | curl to http port | curl to debug port | `pgrep -f profile` | `clean` |
|---|---|---|---|---|---|---|
| positive | chromium 1314355 (exit 0), http 1314353 | empty | exit 7 (`:35729/a.html`) | exit 7 (`:41561/json/version`) | exit 1 | true |
| nohistory | chromium 1314356 (exit 0), http 1314354 | empty | exit 7 (`:42491`) | exit 7 (`:38103`) | exit 1 | true |
| disabled | chromium 1314358 (exit 0), http 1314357 | empty | exit 7 (`:40925`) | exit 7 (`:42239`) | exit 1 | true |

Global sweep after all runs: `pgrep -fa ExecHarnessC1` -> exit 1 (nothing left). The throwaway profiles and `xdg-empty` were then deleted with `rm -rf runs/*/profile xdg-empty`.

**Attempt 0 hang.** The first positive run hung after the journey because of a harness bug: I attached the stream `finish` listener after the event had already fired. Its in-probe cleanup therefore never ran, and I cleaned up by hand:
- Ran `kill -TERM 1184215 1184214` (chromium and http.server, identified with `ss -Hltnp`). The node probe (pid 1184207) then exited by itself with exit code 13, Node's "unsettled top-level await" at `probe.mjs:251`. Total wall time was 81.53 s.
- All pids were then gone. `pgrep` exit 1, `ss` empty, curl exit 7 on `:42245` and `:36227`.
- Details are in `runs/positive-attempt0-harness-hang/cleanup-manual.txt`. The bug is fixed in the current `probe.mjs`.

## Draft receipt and counter fit

`runs/<mode>/receipt.draft.json` uses schema `tabi-bfcache-journey-v1`:
- `run.flags_requested`, `run.flags_effective` (taken from `/proc`), `run.argv_effective` and `run.steps`.
- `events`: verbatim `Page.frameNavigated` and `Page.backForwardCacheNotUsed` params, each keyed by its raw `seq`.
- `events_sha256` = sha256 of `JSON.stringify(events)`.
- `rawEventLog {path, sha256, lines}`, `summary {restores, navigations, goBacks, ...}`, and `corroboration` (page states, fixture GETs, screenshot digests), plus `cleanupClean`.

I scored each draft against the sibling's **untracked** `scripts/check-bfcache-receipt.mjs`, using a throwaway git repo inside my scratch that I deleted afterwards:
`node scripts/check-bfcache-receipt.mjs --repo <scratch>/countercheck/<mode> --rev HEAD`

| Draft | Counter exit | Counter output |
|---|---|---|
| positive | 0 | `{"valid":true,"restores":1,"findings":[],"clean":true}` |
| nohistory | 1 | `{"valid":false,"restores":0,"findings":[{"class":"f3-no-history-step"}]}` |
| disabled | 1 | `{"valid":false,"restores":0,"findings":[{"class":"f4-forbidden-flag"}]}` |

## Deviations from the item text

- **`Page.goBack` does not exist in CDP** (error -32601, recorded in `steps.json` under `goBackAttempt`). The real history step is `Page.navigateToHistoryEntry` with the previous entry's id. The receipt step is labelled `action:"goBack"` with `cdpMethod:"Page.navigateToHistoryEntry"`. Whoever writes the claim or knowledge entry should describe it that way rather than as "CDP Page.goBack".
- **`--remote-debugging-port=<dbg>`** is passed with `=`, because chromium switches take values that way.
- **Profile path:** each run used `<scratch>/runs/<mode>/profile`, created fresh and deleted after the run, instead of one shared `<scratch>/profile`. This keeps the parallel runs isolated.
- **Lost stdout summaries:** `out-nohistory.json` and `out-disabled.json` contain only `exit=0`. In the final batch, `rm -f out-*.json` raced with the backgrounded runs. The authoritative per-run data is in `runs/<mode>/`.

## Risks for the L1 (advisory)

- **[OBSERVED in source]** The counter's `f5` binds `events_sha256` only to the receipt's own `events` array (lines 101-111). A forged receipt with made-up events and a recomputed sha would pass. The kill rule requires restores to "trace to a real Page.frameNavigated event in the run's committed raw event log", but the counter never reads a raw log. My drafts carry `rawEventLog.sha256` and per-event raw `seq` to make that check possible, but `events.jsonl` would also need to be committed next to the receipt and checked.
- **[OBSERVED in source]** Restores are counted as any event with `params.type == "BackForwardCacheRestore"` (line 112). The counter does not check that the event comes after the goBack step or that its URL matches the step target. My summary does check both (main frame, `seq >= goBack.fromEventSeq`, `url == step.url`).
- **[OBSERVED in source]** `f4` only reads the self-reported `run.flags_effective`. My drafts fill it from `/proc/<pid>/cmdline`, not from the requested argv.
- **[INFERENCE]** Headless chromium appends switches of its own (`--ozone-platform=headless`, `--use-angle=swiftshader-webgl`). A future counter that whitelists `flags_effective` would need to allow those.
- **[INFERENCE]** On a host where the launcher injects `chromium-flags.conf` (for example `--load-extension`), bfcache behaviour could differ. That configuration was not exercised here, because the `XDG_CONFIG_HOME` isolation was used throughout.

## Files written

- `scratch/ExecHarnessC1/`:
  - `probe.mjs`, `fixture/{a,b}.html`, `out-{positive,nohistory,disabled}.json`
  - `runs/{positive,nohistory,disabled}/*`
  - `runs/positive-attempt0-harness-hang/*`
- This report.
