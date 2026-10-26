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

## Dated correction — 2026-10-20 (round 13): collector timing and getData retrieval

Appends to the §2 "Byte truth" row (`:71`) and the §3 sentence at `:87–88`. Earlier
bytes above are unchanged; only the collector-timing wording is superseded. The row's
verdict and `locally measured: no` are unchanged.

Source reopened: https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/#network-data-collection
(§7.5.2, fetched 2026-10-20T05:07:39Z, HTTP 200, 4,235,856 bytes,
sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`; the page
carries revision `f922e6af669ead51496db85f37813f39438ef171`).

- [OBSERVATION: SOURCE] "WebDriver BiDi clone network response body"
  (`#webdriver-bidi-clone-network-response-body`) creates the network-data record only
  when the session's collector map satisfies "network collectors is not empty", and
  sets its `cloned body` in that same step. A collector must therefore already be
  registered when the response is created/cloned; `network.addDataCollector` (§7.5.5.1)
  registers into `session's network collectors`, and adding one after
  `network.responseCompleted` cannot recover that response body.
- [OBSERVATION: SOURCE] The §7.5.2 note at `#maybe-collect-network-response-body`
  states the same timing: "there are no collectors setup when the response is created",
  and in that case the clone step "does not clone the corresponding body."
- [OBSERVATION: SOURCE] `network.getData` (§7.5.5.8, `#command-network-getData`)
  "retrieves a network data if it is available": it calls "get collected data", returns
  `no such network data` when no record exists, and `unavailable network data` when the
  record's `bytes` is null. A `pending` record makes it await the "network data
  collected" event, i.e. wait for collection already begun at clone time; it never
  starts collection. `getData` is retrieval, not retroactive collection.
- [OBSERVATION: SOURCE] Whether `bytes` is stored depends on a collector whose
  `dataTypes` includes `"response"` and whose context matches the request's top-level
  navigable, with the body within that collector's `max encoded item size`
  (`#maybe-collect-network-data`). Total collected storage is capped by the
  implementation-defined `max total collected size` (`#max-total-collected-size`).

Read the row's "must exist when the response body is collected" as a true but
under-specified necessary condition: the operational deadline is response
creation/clone, before any `getData`. No BiDi endpoint, browser, or collector was
exercised for this correction.

## Dated correction — 2026-10-26 (round 32): runtime measurement of R1–R15 and R17

Appends to §2 (`:54-76`) and to the §3 sentence at `:82-83` ("CDP remains the lane's
measured evidence substrate"). Earlier bytes above are unchanged, including `:10`
("**locally measured: no**"), `:56` ("`locally measured: no` for every row") and every
row's last-column `no`: those bytes describe the 2026-10-19 documentation-only pass and
stay as written. This block records a later, separate measurement; it does not re-verify
S005–S012 and no cited source page was re-fetched for it.

Runtime state now: for the seventeen §2 rows, measured at round 32: **yes** for R1–R15
and R17; R16 (stop loading / nav-cancel) stays **no BiDi command**. The measurement is a
chromedriver-negotiated BiDi session (`webSocketUrl: true`) on this host's chromium
154.0.8037.97 and chromedriver 154.0.8037.97. The counter serves its frozen fixture on
127.0.0.1 and takes each row's base only from a loopback `/a.html` navigate (a
non-loopback base fails the row predicate — self-test case `off-loopback-navigate`); the
driver opened no CDP endpoint of its own (chromedriver's chromium-bidi 17.0.2 mapper speaks CDP inside the driver) and no credential or session material was touched. Per-row
evidence, hosts and transcript format: `corpus/knowledge/webdriver-bidi-runtime-round-32.md`
(machine-read table `| Row | Surface | BiDi method | Measured | Evidence |`). Admission is
the frozen counter `scripts/check-bidi-runtime.mjs` in the round-32 mode

    node scripts/check-bidi-runtime.mjs --rev REV \
      --baseline d805d1d6132430118b206a848b85753ab35d1014 \
      --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json

whose per-row verdicts are `x2-no-counterpart`, `t1-receipt`, `t3-binding`, `t2-run` and
`l1-live`; the two committed driver-run transcripts are named in `corpus/evidence/round-32/bidi/receipt.json`;
the observed `population` / `admitted` / `failing` counts are the round's measurement (`.ufo/waves/round-32/measure/`).

| Row | Surface (§2 line) | Measured at round 32 | What the counter admits for the row |
|---|---|---|---|
| R1 | Browser identity at launch (`:60`) | yes | `newSession` capabilities carry `browserName`, the counter's `browserVersion`, and a loopback `webSocketUrl`, with at least one successful command on that socket |
| R2 | Target inventory (`:61`) | yes | `browsingContext.getTree` returns ≥1 context, each with a string `context` |
| R3 | Navigate (`:62`) | yes | successful `browsingContext.navigate` to the loopback `/a.html` with a matching result url, plus a `browsingContext.load` event for it |
| R4 | Screenshot (`:63`) | yes | `browsingContext.captureScreenshot` returns a PNG at the pinned 640×480 viewport |
| R5 | DOM shape/state (`:64`) | yes | `browsingContext.locateNodes` with a css `#h` locator returns exactly one node whose `localName` is `h1` |
| R6 | Wait predicates / volatile readouts (`:65`) | yes | `script.evaluate` of `window.__ready` with `awaitPromise:true` resolves to `settled` |
| R7 | Viewport pin (`:66`) | yes | `browsingContext.setViewport` 640×480 succeeds and a later `window.innerWidth` reads 640 |
| R8 | Click input (`:67`) | yes | `input.performActions` pointer source with pointerDown/pointerUp, after which `#out` reads `clicked:tabi` |
| R9 | Text fill (`:68`) | yes | `input.performActions` key source whose keyDown values spell `tabi`, after which `#t` reads `tabi` |
| R10 | Network client events (`:69`) | yes | `network.beforeRequestSent` and `network.responseCompleted` both observed for `/a.html` |
| R11 | Wire truth (`:70`) | yes | that `responseCompleted` carries status 200 and the fixture header `x-tabi-fixture: r32` |
| R12 | Byte truth (`:71`) | yes | `network.addDataCollector` (`response`, registered first) then `network.getData` returns the fixture body `tabi-bidi-body-0123456789` |
| R13 | Pre-settle hold (`:72`) | yes | `network.addIntercept` on `beforeRequestSent`, a blocked `network.beforeRequestSent` for `/data.txt` naming that intercept, then `network.continueRequest` for it |
| R14 | Navigation history witness (`:73`) | yes | `browsingContext.traverseHistory` delta −1 after a `/b.html` navigate, after which `location.pathname` is `/a.html` |
| R15 | Cookies (`:74`) | yes | `storage.getCookies` returns `tabi_fixture=1` |
| R16 | Stop loading / nav-cancel (`:75`) | no BiDi command | refused as `x2-no-counterpart`: the WD defines no navigation-stop command, so nothing is admittable here |
| R17 | User prompts / dialogs (`:76`) | yes | `browsingContext.userPromptOpened` with message `tabi-alert`, then `browsingContext.handleUserPrompt` |

Evidence for every row above is that row of the entry: the entry's table row of the same
id (`R1`..`R17`) plus the counter command given above. A row is admitted only when its
predicate holds on both committed driver-run transcripts (`t2-run`) and on the counter's
own live session (`l1-live`), with `t1-receipt` / `t3-binding` binding those transcripts
to a real rendering; R16 has nothing to admit (`x2-no-counterpart`).

### §3 amendment: what is measured now, and what is still not

Read `:82-83` ("CDP remains the lane's measured evidence substrate") in this form: choose
the transport **per evidenced feature** (unchanged, `:80`). CDP remains the substrate the
lane's shipped capture recipe is built on, and every CDP rung/citation above keeps its
standing. BiDi is no longer documentation-only on one pinned pair: the sixteen admittable
rows above were produced and admitted at runtime on chromium 154.0.8037.97 +
chromedriver 154.0.8037.97 over loopback. So "a Working Draft command is not proof that a
browser or binding implements the feature" (`:81-82`) now has a measured counter-example
on this host for these sixteen rows — and only for them.

Still not measured, and not to be claimed from the rows above:

- **No wire-truth parity.** R11 is admitted on `status` plus one fixture header inside the
  `network.responseCompleted` payload (`network.ResponseData`). Neither the spec's
  `ResponseData` nor this measurement
  produces CDP `ExtraInfo`'s raw header-block bytes or a byte-exact original status line
  (`:70`, U2 stays open).
- **No DOMSnapshot columnar shape.** R5 is `locateNodes` returning one matching node;
  any broader serialization in a run is a caller-supplied `script.evaluate` shape, not the
  CDP `documents` + `strings` table (`:64`).
- **No history-entry list.** R14 traverses by `delta` and then reads `location.pathname`;
  no command returns the history entries CDP's `Page.getNavigationHistory` returns (`:73`).
- **No `input.insertText`.** R9 types through key actions; CDP-equal fast insertion
  side-effects remain unmatched (`:68`).
- **No retroactive body retrieval.** R12 needs its `response` data collector registered
  before the response is cloned; it is not a drop-in after-completion `getResponseBody`
  (`:71`, and the 2026-10-20 collector-timing correction above).
- **R16** has no BiDi command at all (`:75`).
- **One host, one pinned pair, one fixture.** No cross-browser, cross-version, worker/realm
  scope (U3), performance/cost comparison against the CDP path (U4), or binding-API
  stability finding (U5). U1 is answered only for 154.0.8037.97, not for the 152.0.7977.82
  build U1 names.

What this block does **not** change: the `## Rejected` flip condition (`:100-107`, a
pinned per-row runtime/evidence-contract comparison preserving every required output,
scope and provenance) is met for the sixteen rows at the granularity the counter checks,
not for the three contracts named above. A row marked yes here is a runtime observation of that
row's admitted BiDi command/event pair on loopback; it is not a support claim for other
builds, bindings, fixtures or evidence contracts.
