## Round 32 — WebDriver BiDi runtime: transport choice per evidence row (2026-10-26; append-only; never edit above)

WebDriver BiDi moved from docs-held to runtime-held on this host this round. The matrix entry
`corpus/knowledge/webdriver-bidi-capability-matrix.md` §2 keeps its seventeen `locally measured: no`
bytes as written; the runtime evidence is a separate entry,
`corpus/knowledge/webdriver-bidi-runtime-round-32.md`, whose table `| Row | Surface | BiDi method |
Measured | Evidence |` carries R1..R17 in matrix order (`:60` browser identity … `:76` user prompts),
each `Measured: yes` row citing the committed receipt `corpus/evidence/round-32/bidi/receipt.json`
(two cold runs) and its run transcripts. The gate is `scripts/check-bidi-runtime.mjs`; it admits a row
only when the receipt binds both runs to a real rendering of its frozen loopback `FIXTURE` (identical
first-screenshot bytes and `chromedriverVersion` across runs, and with `--live` equal to the gate's own
session), the row's predicate (`PREDICATES.R<n>`) holds on every committed run and, with `--live`, on
the gate's own session. R16 has no BiDi command and is never admitted (`x2-no-counterpart`). Host pins:
chromium and chromedriver 154.0.8037.97, headless, throwaway profile, `127.0.0.1` fixtures only.

Choose the transport per evidenced surface, never by protocol branding (matrix §3). The table below is
the row-by-row ruling; `either` means both are admissible for that surface's evidence, with the
qualifier in the why column being the condition that decides. Each row id is also the row id in the
runtime entry's table, so a row's *measured* status is cited as `corpus/knowledge/webdriver-bidi-runtime-round-32.md`
row R<n> plus the receipt that row names, while the matrix line cited in the why column is the
spec-level contrast the row rules on.

| Row | Surface | Transport | Why (matrix row / predicate / observed) |
|---|---|---|---|
| R1 | Browser identity at launch | either | `session.new` capabilities carry `browserName`, `browserVersion` and the loopback `webSocketUrl`; `PREDICATES.R1` requires `browserVersion` to equal the receipt's and a `ws://127.0.0.1\|localhost` URL, plus one successful command on the socket. `/json/version`'s product string and `Protocol-Version` have no BiDi field (matrix `:60`), so a capture that needs those stays CDP. Observed: `browserVersion 154.0.8037.97`, `chrome.chromedriverVersion` `154.0.8037.97 (b510e9d7…@#1673)`, `webSocketUrl ws://127.0.0.1:<port>/session/<id>` |
| R2 | Target inventory | either | `browsingContext.getTree` returns browsing contexts, not `page`/`worker`/`service_worker` target types (matrix `:61`); `PREDICATES.R2` needs ≥1 context with a string `context` field. Worker or target-type inventory therefore stays CDP (`/json/list`, `Target.getTargets`); page-context inventory is either |
| R3 | Navigate | either | `PREDICATES.R3` wants `browsingContext.navigate` whose result `url` is the loopback `/a.html` and a `browsingContext.load` event for that exact URL. Observed: navigate result `{navigation, url}` plus one `load` for the same URL. Milestone events still do not establish tabi's payload settle (matrix `:62`), so the `window.__ready` await below stays mandatory — the load event alone is not the settle |
| R4 | Screenshot (rung L7) | either | `PREDICATES.R4` wants a PNG decoded at the pinned 640x480. Observed on this build: a shot taken before `setViewport` came back 780x437, after `setViewport` 640x480 — so the first shot must follow the viewport pin. The spec has `origin: viewport\|document` and `clip` and no `captureBeyondViewport` (matrix `:63`), so full-page/beyond-viewport geometry stays CDP |
| R5 | DOM shape/state (rung L6) | CDP | `locateNodes` returns locator matches, and no command defines the columnar `documents`+`strings` snapshot schema (matrix `:64`); `PREDICATES.R5` admits `locateNodes {type: css, value: "#h"}` → exactly one node with `localName: "h1"`, i.e. a locator probe, not a snapshot. A caller-supplied `script.evaluate` serialization is caller-defined shape, not a contract equivalent |
| R6 | Wait predicates / volatile readouts | either | `script.evaluate` with `awaitPromise: true` returned `"settled"` for `window.__ready`; `PREDICATES.R6` requires exactly that. This build refuses the call without the member (`invalid argument` / `Required in "awaitPromise".`), and `RemoteValue` differs from CDP `returnByValue` (matrix `:65`), so a predicate written against `RemoteObject` shapes does not port |
| R7 | Viewport pin | either | `setViewport` takes `viewport` plus `devicePixelRatio` and has no `mobile` parameter (matrix `:66`); `PREDICATES.R7` needs `innerWidth` 640 measured after the pin. Observed: `setViewport` returns `{}` and the next screenshot decodes 640x480; the `innerWidth` read itself is the driver run's to record (pending below). Mobile emulation stays CDP |
| R8 | Click input | either | `PREDICATES.R8` requires a pointer `performActions` with `pointerDown`+`pointerUp` and then `#out` reading `clicked:tabi` — the effect is the evidence, so the click must follow the typing test. BiDi actions are tick/action-list based and more verbose than `Input.dispatchMouseEvent` (matrix `:67`), so either transport is admissible but the recorded action list is part of the evidence |
| R9 | Text fill | either | The dated draft defines no `input.insertText` (matrix `:68`); `PREDICATES.R9` requires key actions whose `keyDown` values concatenate to include `tabi` and `#t.value === "tabi"` afterwards. Fast insertion has no BiDi command, so a capture that needs CDP `Input.insertText` side-effects stays CDP; the typing effect against the frozen fixture is the driver run's to record |
| R10 | Network client events | either | `PREDICATES.R10` requires `network.beforeRequestSent` and `network.responseCompleted` for the `/a.html` URL. Observed with a subscription made before the navigation: both events for every request, each carrying a `request.request` handle (two shapes on this build — a 32-hex id for the document request, `<pid>.<n>` for page-side `fetch`es), so always take the handle from the event. Subscribe first (matrix `:69`); event names and fields differ from CDP's |
| R11 | Wire truth (raw status/headers) | CDP | `responseCompleted` carries `status`, `statusText`, protocol and serialized header fields — observed `status 200` and the header object `{name: "x-tabi-fixture", value: {type: "string", value: "r32"}}` — but no `ExtraInfo`-style raw header-block bytes or byte-exact status line (matrix `:70`). `PREDICATES.R11` uses the fixture-header marker as an identity check, not as wire truth; do not claim parity |
| R12 | Byte truth | either | Collector-gated: a `response` data collector must exist when the response is created, not when it is read (matrix `:71` and its 2026-10-20 correction). Observed: `network.getData` with no collector → `no such network data`; `addDataCollector {dataTypes: ["response"], maxEncodedDataSize: 65536}` issued before the fetch → `getData` returned the served body verbatim (`tabi-bidi-body-0123456789\n`, the gate's `DATA_TEXT`, served by a scribe fixture). `PREDICATES.R12` needs the collector before the `getData`, on that collector's response, and the body equal to `DATA_TEXT`; the frozen `FIXTURE`'s own bytes are the receipt's to record |
| R13 | Pre-settle hold | either | `network.addIntercept {phases: ["beforeRequestSent"]}` plus `network.continueRequest` is the only hold; `PREDICATES.R13` needs a blocked `beforeRequestSent` carrying the intercept id for `/data.txt` and a `continueRequest` for that request id afterwards. String `urlPatterns` must be exact absolute URLs on this build: `?held=1` accepted, `*` wildcards refused `invalid argument`/`Forbidden characters`, `"/data.txt"` refused `Failed to construct 'URL': Invalid URL '/data.txt'` (`.ufo/waves/round-32/w1/ExecInterceptPhases/pattern-probe.json`). Binding coverage varies (matrix `:72`) |
| R14 | Navigation history witness | CDP | No command returns the history-entry list (matrix `:73`), so `Page.getNavigationHistory` remains the witness. `traverseHistory {delta: -1}` traverses only, and on empty history it returns success and leaves the context on `about:blank` (observed: `location.href` `about:blank`, new realm, a `load` event for `about:blank`). Use it only after a real forward navigation, and re-read `location.pathname` afterwards — `PREDICATES.R14` requires `/a.html` after the traversal |
| R15 | Cookies | either | `storage.getCookies` returns `cookies` plus a partition descriptor (matrix `:74`); `PREDICATES.R15` needs the fixture cookie `tabi_fixture=1`. Match the partition/scope explicitly; browser-wide CDP parity is not implied |
| R16 | Stop loading / nav-cancel | CDP | The draft has no navigation-stop command (`stopScreencast` stops screencasting only, matrix `:75`), and the gate marks the row `x2-no-counterpart`. A second `navigate` is a supersede, not a stop; the lane's own CDP stop evidence was weak (0/8 abort-marked) |
| R17 | User prompts / dialogs | BiDi | `browsingContext.handleUserPrompt` is the only command, and the lane had no CDP anchor for dialogs (matrix `:76`). `PREDICATES.R17` requires `userPromptOpened` with `message: "tabi-alert"` and a `handleUserPrompt` after it. Keeps only with `unhandledPromptBehavior: "ignore"` (recipe step 1): under `dismiss and notify` the dialog was gone before the handler and the handle failed `no such alert` |

### Session bootstrap recipe (BiDi over classic session)

The order below is the gate's `liveRecord` order and the round's driver order; the surface rows above
depend on it, so a capture that reorders it is not comparable evidence.

1. Preconditions: chromium and chromedriver 154.0.8037.97 on PATH; a short `TMPDIR` for the driver and
   browser (chromium's singleton socket path is capped at 108 bytes — under a deep scratch dir chromium
   exits with `session not created: Chrome instance exited`, the round's freeze note), throwaway
   `--user-data-dir`, and a fixture you serve yourself on `127.0.0.1`.
2. Classic bootstrap: `POST /session` with `alwaysMatch: {browserName: "chrome", webSocketUrl: true,
   unhandledPromptBehavior: "ignore", "goog:chromeOptions": {binary, args: ["--headless=new",
   "--no-sandbox", "--no-first-run", "--disable-gpu", "--user-data-dir=<throwaway>"]}}`; retry the POST
   while the driver is still binding its port. `unhandledPromptBehavior: "ignore"` is what keeps an
   opened dialog available to R17 — the default `dismiss and notify` destroys it.
3. Open the BiDi WebSocket at `capabilities.webSocketUrl`. Keep the classic session id: teardown is an
   HTTP `DELETE /session/<id>`, not a socket close.
4. `session.subscribe` **before any navigation**: `["browsingContext.load",
   "browsingContext.userPromptOpened", "network.beforeRequestSent", "network.responseCompleted"]`.
   Subscribe is all-or-nothing — one unknown name fails the whole call.
5. `browsingContext.getTree` → first context id.
6. `browsingContext.setViewport {context, viewport: {width: 640, height: 480}, devicePixelRatio: 1}` —
   **before the first screenshot** (pre-pin shots come back window-sized, 780x437 observed).
7. `network.addDataCollector {dataTypes: ["response"], maxEncodedDataSize: 65536}` — **before the
   request whose body you want**; a collector added after `responseCompleted` recovers nothing.
8. `browsingContext.navigate {context, url: <loopback /a.html>, wait: "complete"}`, then wait for
   `browsingContext.load` for that exact URL.
9. `script.evaluate "window.__ready", awaitPromise: true` → `"settled"`; then
   `script.evaluate "window.innerWidth", awaitPromise: false` → 640.
10. `browsingContext.captureScreenshot` — the **first** screenshot belongs here, after the settle and
    the pin: the gate hashes it across runs for the rendering binding.
11. `browsingContext.locateNodes` with a CSS locator for each element, then `input.performActions`
    (pointer action with element origin for a click; key actions for text) and an evaluate after each
    action to read the effect.
12. Page-side `fetch` through `script.evaluate` (relative URLs resolve against the loopback document),
    then `network.getData {dataType: "response", request: <request id from responseCompleted>}`.
13. `storage.getCookies` for the fixture cookie.
14. `network.addIntercept {phases: ["beforeRequestSent"], urlPatterns: [{type: "string", pattern:
    "<exact absolute loopback URL including query>"}]}` → page-side fetch → wait the `isBlocked` event
    with the returned intercept id → `network.continueRequest {request}`.
15. Navigate to a second loopback page, `browsingContext.traverseHistory {context, delta: -1}`, wait
    the `load`, poll `location.pathname` until `/a.html`.
16. `script.evaluate "setTimeout(function(){alert('tabi-alert')},0),1"` → wait `userPromptOpened` with
    that message → `browsingContext.handleUserPrompt {context, accept: true}`.
17. Teardown: close the socket, `DELETE /session/<id>`, kill chromedriver, remove the profile and the
    scratch tree. No driver or browser may outlive the run.

### Error signatures observed on this build

Five error codes and two silent failures, each observed in a **scribe-side probe** (not the receipt:
`.ufo/waves/round-32/w1/ScribeSkillDistill/probe*.json`); the counter's predicates treat each as a
missing witness, not as a retry cue.

1. `no such alert` / `No dialog is showing` — `browsingContext.handleUserPrompt` when no dialog is
   showing: on a fresh context with no prompt, after a prompt was already handled once, and under the
   default `dismiss and notify` after the dialog auto-dismissed. A handle is single-use; never handle
   twice, and take the context id from the `userPromptOpened` event.
2. `invalid argument` / `Required in "awaitPromise".` — `script.evaluate` sent without the
   `awaitPromise` member. Every evaluate in the recipe passes it explicitly, `false` when the result
   is not a promise.
3. `invalid argument` / `Unknown event: <name>` — `session.subscribe` with one unknown event name
   fails the whole subscription; the four names in step 4 must be exact.
4. `no such network data` / `No collected response data` — `network.getData` for a response no
   collector holds. This is the collector-timing rule showing up as an error: collection is decided
   when the response is created, so step 7 precedes step 8.
5. `invalid argument` / `Forbidden characters` (and `Failed to construct 'URL': Invalid URL`) —
   `network.addIntercept` string `urlPatterns`: exact absolute URLs pass, `*` wildcards and
   root-relative paths do not. Patterns are exact-match, not globs.
6. Silent: a **page exception inside a successful command**. `script.evaluate` returns
   `type: "success"` with `result.type: "exception"` and a `TypeError: Failed to parse URL from
   /data.txt` after a `traverseHistory` had left the context on `about:blank`. Read `result.type`, not
   just the command's `type`; `PREDICATES.*` do (they require `res(c).type === "success"`).
7. Silent: `browsingContext.traverseHistory {delta: -1}` with empty history returns success and moves
   the context to `about:blank` (new realm, `load` for `about:blank`). Nothing errors; only the
   pathname re-read catches it.

Pending the ExecDriver run (not observed by this scribe, so not asserted above): the click/typing DOM
effects (`clicked:tabi`, `#t.value === "tabi"`) against the gate's frozen `FIXTURE`; the byte body of
`getData` from that fixture's `/data.txt`; the blocked-and-continued `/data.txt?held=1` request on that
fixture; the `tabi_fixture=1` cookie; the `/b.html` → `traverseHistory` → `/a.html` path with real
history; and the cross-run identity of the first screenshot bytes. The entry's `Measured` cells and
the gate's admitted count are the ExecDriver receipt's to fill.
