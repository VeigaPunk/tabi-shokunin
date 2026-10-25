# ScoutBfcacheHazards — round 25, wave 1 (read-only scout, feeds C1 harness design)

Lane HEAD `c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`; one commit past baseline `9e136667`).
Claims read first: `.ufo/waves/round-25/claims.json` (C1: A -> B -> A, no `--disable-back-forward-cache`,
`Page.frameNavigated` recorded; the kill rule requires a real history step and raw-event backing).
**No browser was launched.** No process was left running. Tool installs/updates: **none**.

## 0. Sources used, and their freshness

| src | bytes used | how |
|---|---|---|
| S104 web.dev/articles/bfcache | my fresh GET 2026-10-25T12:15:27Z (server `date`): **HTTP 200, 157667 B, sha256 `0832def10a2c18ee2dbd9ea53dc047c9934411a52da09bfcec0194b5b2804d3f`**, saved at `.ufo/waves/round-25/scratch/ScoutBfcacheHazards/bfcache-2026-10-25.html` (+ `headers.txt`) | `curl -sS -L -o bfcache-2026-10-25.html -D headers.txt -w 'status=%{http_code} bytes=%{size_download}\n' https://web.dev/articles/bfcache` |
| S104 committed | `corpus/evidence/round-24/sources/bfcache.html`, 157667 B, `0dd45292…8e07` (matches row S104 anchor) | `sha256sum` |
| S104 sibling fetch | `scratch/ScoutOpenS106/bfcache.html`, 157663 B, `46dac3cd…515e` | `sha256sum` |
| S105 Page.pdl @154.0.8037.97 | `corpus/evidence/round-24/sources/page.pdl` = `scratch/ScoutOpenS106/Page.pdl`, both `e944a3b1…05be` | `sha256sum` |
| S106 content_features.cc @154.0.8037.97 | `scratch/ScoutOpenS106/content_features.cc`, 73952 B, `9b93fe64…6c44` (fetched by ScoutOpenS106, report `w1/ScoutOpenS106.md`) | `sha256sum` |

**Body stability (observed).** All three S104 copies differ only on lines 3418 (CSP nonce) and 3423 (devsite
flag config) — `diff committed fresh | grep -E '^[0-9]'` → `3418c3418`, `3423c3423`. Body-only digest with
those two lines dropped is **identical for all three**: `sed '3418d;3423d' <file> | sha256sum` →
`fbfa4292668fab7b20ba671ce3e29c74539bbe78616882830d3b7ba91af734bd` (committed, my fetch, sibling fetch).
So every S104 line number below holds in the committed bytes too. Response headers (my fetch,
`headers.txt`): `last-modified: Fri, 16 Oct 2026 07:00:00 GMT`, `cache-control: no-cache, must-revalidate`.

Quotes below are rendered text (tags stripped, entities decoded; `rendered-2509-2925.txt` in my scratch dir,
produced by a one-shot python3 strip over lines 2509–2925). The raw bytes carry inline `<code>`/`<a>`/`<em>`.

## 1. Top finding — the claim's command name does not exist in the pinned protocol

- **Observed:** `grep -c goBack corpus/evidence/round-24/sources/page.pdl` → **0** (also `goForward` → 0).
  The Page domain's history surface is `command getNavigationHistory` (PDL:850, returns `currentIndex` +
  `entries`) and `command navigateToHistoryEntry` with `integer entryId` (PDL:913–916).
- **Consequence for the harness:** "CDP `Page.goBack`" in `claims.json` C1 is a client-library name
  (Puppeteer/Playwright-style) — `[INFERENCE]` — not a protocol method. The probe must issue either
  `Page.getNavigationHistory` → `Page.navigateToHistoryEntry{entryId: entries[currentIndex-1].id}`
  (browser-initiated), or `Runtime.evaluate("history.back()")` (renderer-initiated), and the receipt
  must name which raw method was sent. Calling a non-existent `Page.goBack` returns a CDP error and
  performs **no** history step → the run lands in the "no-history → restores=0" control shape.
- The counter/receipt should key "a history step happened" on the sent method + `getNavigationHistory`
  index before/after, not on the string `goBack`.

## 2. Hazard checklist — what can stop a loopback A -> B -> A restore

Columns: **Hazard** · **Ground** (located quote ≤25 words, or held path:line) · **Harness/fixture rule** ·
**PDL reason that would name it** (S105 `BackForwardCacheNotRestoredReason` enum, PDL:1505–1660).

### 2a. Browser-launch hazards (the lane's own history is the biggest risk)

| # | Hazard | Ground | Rule | PDL reason |
|---|---|---|---|---|
| H1 | `--disable-back-forward-cache` inherited from reused flag arrays | `.ufo/waves/round-17/probes/invoke-lifecycle.mjs:61` and `invoke-declarative.mjs:53` carry `'--disable-back-forward-cache'`; `:54-55` says the array is copied from `corpus/evidence/round-16/webmcp/receipt.json` `effectiveArgv` (`:45`, also `:108,168,896`) | Build argv fresh; never copy `R16_FLAGS`. Assert absence in the **effective** child argv, not the typed one | `BackForwardCacheDisabledByCommandLine` (PDL:1537) |
| H2 | Host launcher injects flags, incl. an extension | `.ufo/waves/round-13/w1/SafetyBrowser.txt:11-12`: `/usr/bin/chromium` reads `chromium-flags.conf`; `~/.config/chromium-flags.conf` today (read 2026-10-25) = `--ozone-platform=wayland`, `--ozone-platform-hint=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=…/copy-url`, `--disable-features=Vulkan`; `SKILL.md:150-152` records them on the child line | Launch `/usr/lib/chromium/chromium` directly or add `--disable-extensions`; record the effective child line (`SKILL.md:148-149`) | `EmbedderExtensions`, `EmbedderExtensionMessaging`, `EmbedderExtensionFrame` (PDL:1650–1654) — `[INFERENCE]` that a loaded extension can trigger these |
| H3 | Feature default / field trials | S106 `content_features.cc:186-187`: "// Enable using the BackForwardCache. BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);" ; `:201-202` memory controls "enabled only on Android" | Do not pass `--disable-features=BackForwardCache`; record `--enable/--disable-features` lists verbatim | `BackForwardCacheDisabled` (PDL:1508), `BackForwardCacheDisabledByLowMemory` (PDL:1536) |
| H4 | Entry timeout | S106 `content_features.cc:189-191`: "Set a time limit for the page to enter the cache. Disabling this prevents flakes during testing." | Do not stall the browser between leaving A and B committing (no debugger pause on A) | `TimeoutPuttingInCache` (PDL:1535), `Timeout` (PDL:1518) |
| H5 | Cache lifetime | S104:2889 "Even without those exclusions the bfcache will be discarded after a period to conserve memory." | Go back promptly after B loads; record wall-clock gap A-leave → back | `Timeout` (PDL:1518), `CacheLimit` (PDL:1519) |
| H6 | Session restore / tab duplication / restart | S104:2882–2884 "when the user quits the browser and starts it again / when the user duplicates a tab / when the user closes a tab and reopens it" | One browser, one tab, no restart between A and back | `SessionRestored` (PDL:1527) |
| H7 | Headless mode | **Unknown** — no held note or fetched source says whether `--headless` (new) supports bfcache | Record `/json/version` `Browser` (HeadlessChrome vs Chrome) and whether a NotUsed reason names it | — |
| H8 | Build drift vs pinned PDL | `SKILL.md:143` still says `Chrome/152.0.7977.82`; committed receipts carry both: `git grep -h -o -E '(Headless)?Chrome/15[0-9]\.0\.[0-9]+\.[0-9]+' HEAD -- corpus/evidence \| sort \| uniq -c` → 193× `Chrome/152.0.7977.82`, 58× `Chrome/154.0.8037.97` | Record `/json/version`; the enum strings in §3 are only pinned for 154.0.8037.97 | — |

### 2b. Page-feature disqualifiers named by S104 (fixture A must avoid all)

| # | Hazard | Ground (S104 line, rendered) | Fixture rule | PDL reason |
|---|---|---|---|---|
| H9 | `unload` listener | 2621 "The most important way to optimize for bfcache in all browsers is to never use the unload event. Ever!"; 2627 Chrome deprecated it | No `unload` anywhere in A (incl. inline handlers); optional `Permissions-Policy: unload=()` (2642) | `UnloadHandlerExistsInMainFrame` / `…InSubFrame` (PDL:1550–1551), `UnloadHandler` (PDL:1622) |
| H10 | `beforeunload` | 2650 "The beforeunload event won't make your pages ineligible for bfcache in modern browsers' bfcache but previously it did" | None on A; it also raises a dialog | `EmbedderModalDialog` (PDL:1649) if a dialog appears `[INFERENCE]` |
| H11 | `Cache-Control: no-store` on the page | 2697 "when Cache-Control: no-store is set on the page resource itself … browsers have chosen not to store the page in bfcache" | Serve A without `no-store`. Observed: `grep -c 'Cache-Control' /usr/lib/python3.14/http/server.py` → 0 (python 3.14.8 `SimpleHTTPRequestHandler` sends only Content-type/Content-Length/Last-Modified, `server.py:830-834`). S106 `:236-241` `kCacheControlNoStoreEnterBackForwardCache` is enabled-by-default at 154, so no-store may not block — still avoid it | `MainResourceHasCacheControlNoStore` (PDL:1574), `CacheControlNoStore*` (PDL:1553–1555) |
| H12 | Cookie changes under no-store | S106 `:212-214`, `:236-238` (cookie-change eviction params) | Set no cookies in A or B | `CacheControlNoStoreCookieModified` (PDL:1554), `CookieFlushed` (PDL:1563) |
| H13 | `window.opener` / popups | 2742 "a page with a non-null window.opener reference can't safely be put into bfcache" | Open A with `Page.navigate` in a plain tab; never `window.open`/`target=_blank` | `RelatedActiveContentsExist` (PDL:1509) `[INFERENCE]` mapping |
| H14 | Open IndexedDB | 2757 "Pages with an open IndexedDB connection." | No IndexedDB in A | `IndexedDBEvent` (PDL:1614) |
| H15 | In-flight fetch/XHR at leave time | 2758 "Pages with in-progress fetch() or XMLHttpRequest." | A must finish all requests before the A→B navigation (wait for `Page.loadEventFired` + network idle) | `OutstandingNetworkRequestFetch`/`XHR`/`Others` (PDL:1598–1599, 1580) |
| H16 | Still loading when leaving | (PDL only) `Loading` (PDL:1512) | Navigate to B only after A's `loadEventFired` (PDL:1717) | `Loading` |
| H17 | WebSocket / WebRTC | 2759 "Chrome (as of 149) and Safari do no block on open WebSockets but other browsers do." | None in A anyway | `WebSocket`, `WebRTC`, `WebTransport` (PDL:1571–1573) |
| H18 | Same-origin shared APIs | 2752 "APIs that are also accessible from other pages in the same origin (for example: IndexedDB, Web Locks, WebSockets)" | No Web Locks, BroadcastChannel, SharedWorker, ServiceWorker | `WebLocks` (1591), `BroadcastChannel` (1586), `SharedWorker` (1588), `ServiceWorker*` (1526–1532) |
| H19 | iframes | 2569 "The main frame can also be blocked from using the bfcache if an embedded iframe uses APIs that block this." | A has no iframes (simplest) | per-frame reasons in `notRestoredExplanationsTree` (PDL:1693–1700) |
| H20 | Same-document ("soft") navigation | 2573 "bfcache works with browser-managed navigations, it doesn't work for 'soft navigations' within a single-page app (SPA)." | A→B must be a cross-document load of a different file (`/a.html` → `/b.html`), never `pushState`/`#fragment` | — (`Page.navigatedWithinDocument` fires instead, PDL:1721–1735) |
| H21 | Non-GET / non-200 / non-http | (PDL only) `HTTPMethodNotGET` (1516), `HTTPStatusNotOK` (1510), `SchemeNotHTTPOrHTTPS` (1511), `ErrorDocument` (1559), `HTTPAuthRequired` (1562) | A loaded by GET, 200, over `http://127.0.0.1:<port>/`; no form POST; never `about:blank`/`file:`/`data:` as "A" | as named |
| H22 | Not the immediately previous entry | (PDL only) `NotMostRecentNavigationEntry` (1543) | Go back exactly one entry (index `currentIndex-1`) | as named |
| H23 | Harness-side mutations between A and back | (PDL only) `UserAgentOverrideDiffers` (1545), `InjectedJavascript` (1611), `InjectedStyleSheet` (1612), `JavaScriptExecution` (1520) | No `Emulation.setUserAgentOverride` mid-journey. `[INFERENCE]` keep `Page.addScriptToEvaluateOnNewDocument` and `Runtime.evaluate` off A during the journey (only read-backs after restore); whether CDP-side evaluation triggers 1611/1520 is **unknown** | as named |
| H24 | Media/permission/printing features | 2759 + PDL `RequestedMIDIPermission`…`Printing`… (1581–1609) | Static HTML only | as named |

## 3. What the harness must record (CDP events/fields + in-page witnesses)

Ordered by evidentiary weight. "PDL:n" = `corpus/evidence/round-24/sources/page.pdl` line.

| # | Record | Ground | Why |
|---|---|---|---|
| R1 | `Page.enable` sent before the first navigation (and, for R6, `Page.setLifecycleEventsEnabled{enabled:true}`) | PDL:666 "Enables page domain notifications."; PDL:1143–1147 | Without it no `frameNavigated` arrives — a silent zero |
| R2 | Every `Page.frameNavigated` verbatim, incl. `params.type` and `params.frame.{id,loaderId,url}` | PDL:1347–1352 "Fired once navigation of the frame has completed…" `experimental NavigationType type`; enum `Navigation` / `BackForwardCacheRestore` (PDL:1342–1345) | The only positive restore marker. Count a restore only when `type=="BackForwardCacheRestore"` on the main frame with `frame.url` == A |
| R3 | Every `Page.backForwardCacheNotUsed` verbatim: `loaderId`, `frameId`, full `notRestoredExplanations[]` (`type`, `reason`, `context`, `details[{url,function,lineNumber,columnNumber}]`), `notRestoredExplanationsTree` | PDL:1702–1715; PDL:1680–1700 field shapes; reason types `SupportPending`/`PageSupportNeeded`/`Circumstantial` (PDL:1663–1667) | The negative marker with the cause. PDL:1702–1704: "Do not assume any ordering with the Page.frameNavigated event." Fired "only for main-frame history navigation where the document changes" |
| R4 | `Page.frameStartedNavigating` with `navigationType` and `loaderId` | PDL:1369–1388 enum incl. `historyDifferentDocument`, `historySameDocument` | Proves the step was a cross-document history traversal (H20); `historySameDocument` → bfcache never in play |
| R5 | `Page.getNavigationHistory` result before A→B, before back, after back (`currentIndex`, `entries[].{id,url,transitionType}`) | PDL:850–855, PDL:361–372 | The "matching before/after target" the C1 kill rule needs; `multi-step-journey.md:107-112` is the lane's held use of this witness |
| R6 | The exact history command + its CDP response (`Page.navigateToHistoryEntry{entryId}` or `Runtime.evaluate("history.back()")`) | PDL:913–916; §1 above | Kill rule: "the run must have executed a history step"; never `Page.goBack` (absent, §1) |
| R7 | `Page.lifecycleEvent` (`frameId`,`loaderId`,`name`,`timestamp`) and `Page.loadEventFired` | PDL:1493–1502, PDL:1717–1719 | Gate for H15/H16 (A fully loaded before leaving). Whether `load` re-fires on restore is **unknown** — record, don't assert |
| R8 | `Page.navigatedWithinDocument` | PDL:1721–1735 | Detects an accidental same-document step (H20) |
| R9 | Network slice for the back step (`Network.enable` + `requestWillBeSent` for A's URL) and the python `http.server` access log | S104:2531 "the entire page can be restored from memory, without having to go to the network at all."; `navigation-history-bfcache-evidence.md:24-31` | Supporting only: zero GET of `/a.html` after the back step is consistent with restore; a GET means a fetch. Never decisive alone (`navigation-history-bfcache-evidence.md` §3 last row) |
| R10 | In-page `pageshow` `event.persisted` (fixture A writes it to DOM/console; harness reads via `Runtime.consoleAPICalled` or DOM after the step) | S104:2585 "The pageshow event has a persisted property, which is true if the page was restored from bfcache and false otherwise." | Independent second witness from the renderer side |
| R11 | In-page `pagehide` `event.persisted` on leaving A | S104:2602 "persisted being true doesn't guarantee that a page will be cached." | Shows intent to cache; never counts as a restore |
| R12 | JS-heap sentinel: A sets `window.__tabiNonce=<random>` at load; read after back | S104:2552 "bfcache is a snapshot of the entire page in memory, including the JavaScript heap" | Third witness: the nonce survives only on a restore |
| R13 | Do **not** use `performance.getEntriesByType('navigation')[0].type` as a restore witness | S104:2907 "The back_forward navigation type in the Navigation Timing API is not to be confused with bfcache restores." | A re-fetched back nav also reports `back_forward` |
| R14 | Launch provenance: effective child argv (`ps -eo pid,ppid,args`), `/json/version` `Browser`+`Protocol-Version` | `SKILL.md:142-152`; H1/H2/H8 | Kill rule: any `--disable-back-forward-cache` → invalid; host-injected flags must be visible |
| R15 | Optional cross-check: `window`-side NotRestoredReasons API | S104:2893 "The Chrome team has added the NotRestoredReasons API to help expose the reasons why pages don't use bfcache" | Name differs from protocol (`notRestoredExplanations`; `grep -c notRestoredReasons page.pdl` → 0). Receipt must say which surface it pinned (`navigation-history-bfcache-evidence.md:74-75`) |

**Ambiguity rule the receipt should carry.** PDL:1702 says the NotUsed event fires "if BackForwardCache
feature is enabled". `[INFERENCE]` A run with the feature disabled (H1/H3) can therefore produce **neither**
`BackForwardCacheRestore` **nor** `backForwardCacheNotUsed` — silence is not evidence of eligibility; only R14
distinguishes "cache off" from "event missed". A valid back step should yield exactly one of R2-restore or
R3 for A's main frame.

## 4. Minimal fixture shape implied (inference from §2, not tested)

`[INFERENCE]` `/a.html` and `/b.html` static, served by `python3 -m http.server --bind 127.0.0.1` (no
Cache-Control emitted, H11), no scripts except a `pageshow`/`pagehide` logger and the R12 nonce, no
iframes/cookies/storage/unload/beforeunload; journey = `Page.navigate(A)` → wait `loadEventFired` →
`Page.navigate(B)` → wait `loadEventFired` → `getNavigationHistory` → `navigateToHistoryEntry(prev)` →
collect R2/R3/R4 within a bounded window; launch `/usr/lib/chromium/chromium` with a fresh
`--user-data-dir` and `--disable-extensions` (H2), argv asserted free of `--disable-back-forward-cache`.

## 5. Observation / inference / unknown

**Observed (commands inline above):** fresh S104 GET 200/157667 B/`0832def1…`; body digest `fbfa4292…` equal
across committed + two fresh copies; every S104 quote above at the stated line; PDL lines cited;
`goBack`/`goForward`/`notRestoredReasons` counts 0 in PDL; S106 `kBackForwardCache` enabled-by-default
(`:186-187`), entry timeout (`:189-191`), CCNS-enter enabled (`:236-241`); lane flag sites H1; host flags
file H2; python `http.server` emits no Cache-Control.

**Inference (labelled `[INFERENCE]` in place):** `Page.goBack` is a library name; extension flags map to
`Embedder*` reasons; `window.opener` maps to `RelatedActiveContentsExist`; CDP evaluation may trigger
`InjectedJavascript`/`JavaScriptExecution`; silence when the feature is off; fixture shape §4.

**Unknown:** whether `--headless` (new) on 154.0.8037.97 restores from bfcache at all (H7); whether
`load`/lifecycle events re-fire on restore (R7); whether restored `frame.loaderId` equals A's original
loaderId (record both, assert nothing); whether the host binary today is 152 or 154 (no browser run, H8);
the origin of the r16 argv set (Playwright-shaped; `playwright-core` not found under
`~/.local/share/fnm/node-versions/*/installation/lib/node_modules/` today, so not re-verified).

## 6. Side effects

Wrote only this report and scratch files under `.ufo/waves/round-25/scratch/ScoutBfcacheHazards/`
(`bfcache-2026-10-25.html`, `headers.txt`, `rendered-2509-2925.txt`). One external GET (S104). No
process started besides `curl`/one-shot `python3`; nothing to kill. Read `scratch/ScoutOpenS106/*` read-only.
