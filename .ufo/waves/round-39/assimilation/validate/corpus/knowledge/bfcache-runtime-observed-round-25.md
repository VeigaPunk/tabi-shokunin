# bfcache restore observed on loopback — round 25

opening source: `corpus/evidence/round-25/bfcache/receipt.json` (schema
`tabi-bfcache-journey-v1`), `corpus/evidence/round-25/bfcache/events.jsonl`,
`corpus/evidence/round-25/bfcache/controls.json`; screenshot files
`1-a.png`/`2-b.png`/`3-a-back.png`
verified-at: `git rev-parse HEAD` (the round-25 evidence commit); receipt sha256
`250767649fa16532d892d1fc2478f6cf7439d7d00de153c554a9a6212a7ca526`
recheck: on-release (browser-level behavior; re-run the journey probe when the
Chromium version used here is no longer installed)

## What is observed

On this host (Linux x64, Chromium 154.0.8037.97 `--headless=new`, Node v24.21.0)
a loopback journey **A → B → back-to-A** with the history step sent as
`Page.navigateToHistoryEntry` (entryId of `currentIndex-1`) restores A from the
BackForwardCache:

- `Page.frameNavigated` fires `type: "BackForwardCacheRestore"` for A exactly
  once, with **A's original `loaderId`** (`1941FE13C74DB519D590080CA2038552`).
- No `Page.loadEventFired`, no `Page.domContentEventFired`, no
  `Page.lifecycleEvent` for A's loaderId, and no `Network.requestWillBeSent` for
  A after the back step.
- No `Page.backForwardCacheNotUsed` event fires.
- JS state survives: `window.__counter` was 42 before leaving A and still 42
  after return; the per-load `__loadId` nonce is unchanged; `pageshow` fires
  `persisted=true` on return; `document.visibilityState` is `"visible"`.
- Navigation history before: `currentIndex=2`; after: `currentIndex=1`
  (entries `about:blank`, `a.html`, `b.html`) — a real history step.

Negative controls (each differs from the positive journey by exactly one
variable):

- **No history step** (A → B only): no restore; `frameNavigated` types are
  `Navigation, Navigation`.
- **`--disable-back-forward-cache`** (A → B → back): the back navigation
  re-navigates (`type: "Navigation"`), `Page.backForwardCacheNotUsed` fires with
  reasons `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine`,
  `BrowsingInstanceNotSwapped`, a fresh `requestWillBeSent` for A occurs, and the
  JS counter returns 0 with a new `__loadId`.

## Method (measured, not inferred)

The probe (scratch `ExecHarnessC1`; retained hashes in the wave-1 report) uses
raw CDP over Node's built-in WebSocket: `Page.enable`,
`Page.setLifecycleEventsEnabled`, `Runtime.enable`, `Network.enable`. Launch
argv (effective): `/usr/lib/chromium/chromium --headless=new
--remote-debugging-port=41561 --remote-debugging-address=127.0.0.1
--user-data-dir=<scratch>/profile --no-first-run --disable-gpu
--noerrdialogs --ozone-platform=headless --ozone-override-screen-size=800,600
--use-angle=swiftshader-webgl about:blank`. `--disable-back-forward-cache` is
absent (see controls). Fixture served by `python3 -m http.server` bound to
127.0.0.1 (no `Cache-Control` header). Cleanup: kill by pid, ports free, curl
exit 7; recorded in `cleanup.json` of the run.

Copied from the harness run, the raw event log (61 lines) and screenshots of A,
B, and the restored A are committed next to the receipt.

## Source spans

- S106 (new, opened this round): Chromium 154 `content_features.cc` declares
  `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` and
  `// Enable using the BackForwardCache.` — the feature ships enabled by default,
  so a clean launch without the disable flag exercises bfcache.
- S104 (web.dev/articles/bfcache): what bfcache is and what disqualifies pages;
  the fixture pages avoid the listed disqualifiers (no unload handlers, no
  `Cache-Control: no-store`, same-origin).
- S105 (Page.pdl): `Page.frameNavigated` `type` enum names
  `BackForwardCacheRestore`.

All three quotes re-located in fresh bytes on 2026-10-25 (wave-1 recon).

## Frontier status

Round-24 U1 ("no committed probe performs a history step at all") is closed:
the bfcache surface moves from **documented-upstream** to **runtime-held on this
host for same-origin loopback A→B→back** (one browser, one OS, one day).

## Unknowns

- Headed mode and cross-origin pairs are unprobed.
- Restore stability under load: 4/4 default-flag runs restored (plus this
  committed journey); the restore rate is not characterized.
- Whether Playwright's `page.goBack()` wraps `Page.navigateToHistoryEntry`
  [INFERENCE, unverified here].
- Chromium versions other than 154.0.8037.97 are unprobed.
