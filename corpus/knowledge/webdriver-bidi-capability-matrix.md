<!-- corpus entry — tabi-shokunin kaika round 1 (2026-10-19), lane tabi-bidi (claim C2, coverage expansion). Method: documentation-only review — all eight source URLs listed below were reopened and fetched as raw bytes this session, then hashed with sha256sum; the WPT dashboard URL returned an app shell only and is an unread-results lead, not a source. Local anchors were spot-checked in this worktree. No browser was launched or BiDi endpoint contacted; locally measured: no. -->

# WebDriver BiDi capability matrix vs tabi's CDP evidence surfaces

source: S005 https://www.w3.org/TR/webdriver-bidi/ — dated WD https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/, §§7.1–7.10, revision f922e6af669ead51496db85f37813f39438ef171; S006 https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules — “List of modules”, “Commands”, “Events”, MDN content commit 253bed3def8e1680475ea75987d24ca62ee9f989; S007 https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection — “Launching the browser”, “Getting the WebSocket URL”, MDN content commit f83c12ab41865e0e195dd36ad9cdcad511a36957; S008 https://www.selenium.dev/documentation/webdriver/bidi/ — “Enabling BiDi in Selenium”, last modified 2026-08-15, content commit 7a6516d16481aec8f6c60c442140b37ab468c3ba; S009 https://www.selenium.dev/documentation/webdriver/bidi/w3c/network/ — “Add network intercept”, Selenium v4.32 example, page modified 2026-07-23; S010 https://developer.chrome.com/blog/webdriver-bidi-2023 — “Where are we now?”, last updated 2023-05-09; S011 https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi — Firefox support and “CDP support in the future”, last updated 2024-08-07; S012 https://github.com/GoogleChromeLabs/chromium-bidi — README “WebDriver BiDi for Chromium”, commit 1c6f4363b532258da7f4732deba2656a1a4fea45
verified-at: 2026-10-19 (all eight cited source pages reopened and re-fetched this session; WPT dashboard returned a raw app shell only, so no result data was read; nothing run against a live browser)
recheck: 90d or on W3C republication — re-fetch https://www.w3.org/TR/webdriver-bidi/, record the dated WD URL and source revision; re-audit the cited command/type/event anchors in §§7.1–7.10; refresh MDN, Selenium, and chromium-bidi README revisions; do not promote a WPT app shell to support evidence without reading its result data

The lane's measured evidence pipeline is CDP-native. This is a spec-level map, not a
browser or binding support matrix: **locally measured: no**; no BiDi endpoint or browser
was probed. It compares only CDP surfaces tabi actually uses (the `SKILL.md` /
`corpus/knowledge/` anchors below) with the W3C 2026-10-08 Working Draft. Any future
runtime probe must remain inside tabi's loopback-first perimeter (`SKILL.md:687-695`).
For Chromium specifically, the chromium-bidi README describes a JavaScript layer
translating between BiDi and CDP inside a Chrome tab (S012). That is an
implementation-architecture statement, not proof of individual command support or a
claim about every WebDriver BiDi implementation.

## 1. What the spec is [observation]

- The W3C 2026-10-08 Working Draft defines WebDriver BiDi as "a mechanism for remote
  control of user agents" (Abstract, S005). Its §7 has ten modules: session,
  browser, browsingContext, emulation, network, script, storage, log, input, and
  webExtension (§§7.1–7.10, S005). The current MDN index also lists bluetooth,
  permissions, and userAgentClientHints (S006); those extra index entries are not
  module sections in this dated draft.
- BiDi commands and events use WebSocket transport. A command has `id`, `method`, and
  `params`; events are pushed, and clients subscribe/unsubscribe with
  `session.subscribe` / `session.unsubscribe` (§§3.1, 3.6, 4, 7.1.3, S005;
  command/event overview, S006).
- Browser identity is returned in `session.new`'s capabilities (`browserName`,
  `browserVersion`; `#command-session-new`). `session.status` reports `ready` and
  `message`, not a standardized browser identity (`#command-session-status`,
  S005).
- There are distinct setup paths: classic WebDriver can request `webSocketUrl: true`;
  direct command-line access is documented for Firefox, while Chromium-based browsers
  require the Chromium BiDi wrapper (MDN connection guide, S007). A BiDi WebSocket
  bootstrap is not CDP's `/json/version` or `/json/list` HTTP discovery API.
- A Working Draft describes the standard, not which commands any browser/binding
  implements. The WPT dashboard is the intended results surface (Chrome blog,
  S010; chromium-bidi README, S012), but the URL opened on 2026-10-19 returned
  only an app shell: no per-browser results were read, so it remains an unread-results
  lead, not implementation evidence.
- Chrome's 2023 blog reports Chrome/ChromeDriver 106 and Firefox 102 shipped initial
  BiDi support in 2022 (S010; historical statement). A 2024 Chrome blog describes
  Firefox 129 plus Puppeteer 23 as production-ready and says Puppeteer's Chrome CDP
  support remained unchanged (S011; version-scoped announcement).
- Selenium's guide documents the `webSocketUrl` capability and says it focuses on
  user-facing APIs rather than documenting low-level BiDi domains (S008). Its
  network page identifies Python `_add_intercept` as the currently available API,
  pending a stable public API, in its Selenium v4.32 example (S009). This is a
  binding-specific documentation statement, not a spec-wide support claim.

## 2. The matrix: tabi surface → CDP (anchor) → BiDi (spec anchor) → gap

`locally measured: no` for every row — no row has been run on a BiDi endpoint.

| tabi surface (evidence use) | CDP used (anchor) | BiDi counterpart (WD-20261008 anchor) | known gaps / notes | locally measured |
|---|---|---|---|---|
| Browser identity at launch | `/json/version` → `Browser`, `Protocol-Version`, `webSocketDebuggerUrl` (`SKILL.md:142-145`; `cdp-evidence-patterns.md:40-42`) | `session.new` result capabilities (`browserName`, `browserVersion`; `#command-session-new`) | `session.status` only standardizes readiness/message. These are WebDriver capability fields, not `/json/version`'s product string, `Protocol-Version`, or WebSocket URL; direct CLI setup differs by engine (S007) | no |
| Target inventory | `/json/list`, `Target.getTargets` (`SKILL.md:156`; `cdp-evidence-patterns.md:54-56`) | `browsingContext.getTree` (`#command-browsingContext-getTree`) | returns browsing contexts, not the raw target-type list (`page`/`worker`/`service_worker` types are CDP-isms); re-identify-by-URL recipe carries over | no |
| Navigate | `Page.navigate` (`SKILL.md:352`; `cdp-evidence-patterns.md:66`) | `browsingContext.navigate` (`#command-browsingContext-navigate`) and `browsingContext.navigationStarted` / `navigationCommitted` / `navigationFailed` / `domContentLoaded` / `load` events (`#event-browsingContext-navigationStarted`, `#event-browsingContext-navigationCommitted`, `#event-browsingContext-navigationFailed`, `#event-browsingContext-domContentLoaded`, `#event-browsingContext-load`) | Milestone events do not establish tabi's payload-specific settle predicate; the lane measured `readyState` polling as robust after load-event races (`SKILL.md:166-168`) | no |
| Screenshot (rung L7) | `Page.captureScreenshot {captureBeyondViewport:true}` (`SKILL.md:353,401`) | `browsingContext.captureScreenshot` (`#command-browsingContext-captureScreenshot`) | Spec has `origin:"viewport"|"document"` and optional `clip`; it has no `captureBeyondViewport` flag. Full-page geometry and clipping must be compared with the lane's screenshot contract, not inferred as equivalent | no |
| DOM shape/state (rung L6) | `DOMSnapshot.captureSnapshot` (`SKILL.md:354,402`); `DOM.getDocument` (`cdp-evidence-patterns.md:75`) | `browsingContext.locateNodes` (`#command-browsingContext-locateNodes`) + caller-supplied `script.evaluate` | No standard command defines CDP's columnar `documents` + `strings` snapshot schema. `locateNodes` returns locator matches; custom script serialization would have caller-defined shape and traversal (`cdp-evidence-patterns.md:75-77`; `layer-routing-synthesis.md:57`) | no |
| Wait predicates / volatile readouts | `Runtime.evaluate {awaitPromise, returnByValue}` (`SKILL.md:350`) | `script.evaluate` / `script.callFunction` (`#command-script-evaluate`, `#command-script-callFunction`) | Both expose script execution for predicates/readouts, but BiDi `RemoteValue` / `SharedReference` and serialization options differ from CDP `returnByValue` / `RemoteObject`; await/return mapping is not measured | no |
| Viewport pin | `Emulation.setDeviceMetricsOverride` (`SKILL.md:351,164`) | `browsingContext.setViewport` (`#command-browsingContext-setViewport`) + separate `emulation.*` commands | `setViewport` exposes viewport dimensions and `devicePixelRatio`; it has no CDP `mobile` parameter. The separate text-layout `"mobile"` override is not a full mobile-emulation equivalent (§7.4.2.12) | no |
| Click input | `Input.dispatchMouseEvent` (`SKILL.md:355`) | `input.performActions` (pointer sources) (`#command-input-performActions`) | actions are tick/action-list based (WebDriver Actions model), more verbose than a single dispatch call | no |
| Text fill | `Input.insertText` (`multi-step-journey.md:34,290`) | `input.performActions` key actions; `input.setFiles` for file inputs only (`#command-input-setFiles`) | The 2026-10-08 draft defines no `input.insertText` command (§7.9.3); ordinary text requires key actions, and matching CDP's fast insertion side-effects is unmeasured | no |
| Network client events | `Network.enable` + `requestWillBeSent`/`responseReceived` (`SKILL.md:374,403`) | `network.beforeRequestSent` / `network.responseStarted` / `network.responseCompleted` / `network.fetchError` (`#event-network-beforeSendRequest`, `#event-network-responseStarted`, `#event-network-responseCompleted`, `#event-network-fetchError`) | Subscribe with `session.subscribe` first; event names/fields differ. `ResponseData` includes `bytesReceived`, `headersSize`, and `bodySize` (§7.5.4.17) | no |
| Wire truth (raw status/headers) | `responseReceivedExtraInfo`/`requestWillBeSentExtraInfo` (`SKILL.md:374`; `layer-routing-synthesis.md:53`) | `network.responseStarted` / `network.responseCompleted` carry `network.ResponseData` (`#event-network-responseStarted`, `#event-network-responseCompleted`, §7.5.4.17) | The spec defines status, `statusText`, protocol, serialized header fields, and byte-size fields; it does not define CDP `ExtraInfo`-style raw header-block bytes or a byte-exact original status line. Do not claim wire-truth parity | no |
| Byte truth | `loadingFinished.encodedDataLength` + `Network.getResponseBody` (`SKILL.md:435`; `network-evidence-rung.md:25`) | `responseCompleted` byte fields + `network.addDataCollector`/`network.getData`/`network.disownData` (`#command-network-addDataCollector`, `#command-network-getData`, `#command-network-disownData`) | Response-body retrieval is collector-gated: a `"response"` data collector must exist when the response body is collected (§7.5.2, §7.5.5.1); `maxEncodedDataSize` limits each item and total storage is implementation-defined. Default collector type is `"blob"`; `"stream"` is future work (§7.5.4.6). No CDP-style after-the-fact body command | no |
| Pre-settle hold | `Fetch.enable` Request stage + `Fetch.continueRequest` (`SKILL.md:518`; `async-step-evidence.md:64-68`) | `network.addIntercept` + `network.continueRequest`/`failRequest`/`provideResponse` (`#command-network-addIntercept` etc.) | spec phases exist; Selenium Python API is `_add_intercept`, "currently the available Python API" (S009) — binding coverage varies | no |
| Navigation history witness | `Page.getNavigationHistory` (`multi-step-journey.md:107`) | `browsingContext.traverseHistory` (`#command-browsingContext-traverseHistory`) | It traverses by `delta` and returns an empty result; the WD defines no command returning the history-entry list, so the lane's chrome-side witness is not reproduced | no |
| Cookies | `Network.getCookies` browser-level (`stateful-fixture-evidence.md:488`) | `storage.getCookies` (`#command-storage-getCookies`) | BiDi accepts a filter/partition descriptor and returns `cookies` plus `partitionKey` (§7.7.3.1); match the partition/scope explicitly rather than assume browser-wide CDP parity | no |
| Stop loading / nav-cancel | `Page.stopLoading`, second-`Page.navigate` supersede (`stateful-fixture-evidence.md:427-428,597-603`; `SKILL.md:1000`) | No navigation-stop command in the WD's `browsingContext` command list (§7.3.3); `browsingContext.stopScreencast` stops only screencasting | No spec command equivalent to stopping an in-flight navigation; a new `navigate` is not a stop. Lane's CDP stop behavior was weak (0/8 abort-marked) | no |
| User prompts / dialogs | not currently a tabi surface (no anchor — honest lane-coverage gap) | `browsingContext.handleUserPrompt`, `browsingContext.userPromptOpened` / `userPromptClosed` (`#command-browsingContext-handleUserPrompt`, `#event-browsingContext-userPromptOpened`, `#event-browsingContext-userPromptClosed`) | A standard BiDi surface not present in the current CDP capture recipe; candidate only if tabi needs dialog evidence | no |

## 3. Decision rule [inference, grounded in the rows above]

Choose the transport **per evidenced feature, never by protocol branding**. BiDi's
standardized command/event surface is a portability option, but a Working Draft command
is not proof that a browser or binding implements the feature. CDP remains the lane's
measured evidence substrate. The standard does not define identical contracts for
several lane-critical surfaces: DOMSnapshot's columnar shape, the history-entry list,
`Input.insertText`, or CDP's raw `ExtraInfo` header block. A custom script or vendor
extension might approximate a result, but that does not make its shape/provenance the
same standard contract. BiDi response-body collection also requires a configured data
collector; it is not a drop-in after-completion `Network.getResponseBody`.

The chromium-bidi README describes one Chromium implementation translating BiDi and
CDP inside a Chrome tab (S012); that architecture does not certify any individual
row. Before claiming support here, compare the required evidence contract on a pinned
browser and binding against a loopback fixture. Keep the same evidence ladder
(`SKILL.md:374,401-403`) and settle discipline (DOM predicate plus network witness,
`SKILL.md:503-510`); any future probe stays within the loopback-first perimeter
(`SKILL.md:687-695`).

## Rejected

- **Replace every CDP capture with BiDi now.** Rejected: at least three load-bearing
  contracts have no matching standard command/data shape (DOMSnapshot's columnar
  shape, `getNavigationHistory`'s entry list, and `insertText`); response-body capture
  is collector-gated rather than post-hoc (`getResponseBody`). The chromium-bidi
  project describes one Chromium implementation translating BiDi and CDP in a Chrome
  tab (S012), and the cited W3C document is a Working Draft (S005). Flip: a
  pinned per-row runtime/evidence-contract comparison showing every required output,
  scope, and provenance is preserved.
- **Treat `webSocketUrl` capability as equivalent to `/json/list` discovery.**
  Rejected: `webSocketUrl` negotiates a BiDi WebSocket through classic WebDriver; it
  does not return CDP target records (S005, S007). Direct launch is
  engine-specific: MDN documents Firefox directly and Chromium through its wrapper;
  tabi's Chromium runbook uses `--remote-debugging-port` for the CDP endpoint
  (`SKILL.md:127-135`), not as evidence that a BiDi socket exists.

## Unknowns

- U1: Which §2 commands/events are actually implemented in chromium
  152.0.7977.82 via chromium-bidi — unmeasured; the WPT BiDi results URL returned an
  app shell only, so no browser results were read (unread-results lead, not a source).
- U2: Whether any browser/binding exposes more than the draft's standardized
  `ResponseData` fields, and whether those fields can reproduce raw status-line/header
  bytes matching CDP `responseReceivedExtraInfo` — not measured.
- U3: Whether `script.evaluate` on a shared worker / the realm model matches
  the lane's page-target scope (realm handling not probed).
- U4: Performance cost of the collector-gated body capture vs post-hoc
  `getResponseBody` on this host — unmeasured.
- U5: Whether any binding tabi could actually drive (Node WS client → chromium-
  bidi) ships stable intercept APIs; only Selenium-Python status was read.
