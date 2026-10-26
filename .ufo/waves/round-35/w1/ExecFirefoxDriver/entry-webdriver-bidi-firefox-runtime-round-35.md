<!-- corpus entry — tabi-shokunin round 35 (2026-10-26), claim C2 (coverage + capability acquisition, second engine). Re-measures the seventeen rows of corpus/knowledge/webdriver-bidi-capability-matrix.md §2 on a second engine, Firefox 158.0.1 through geckodriver 0.37.1, loopback fixture only, one host build. The round-32 entry (corpus/knowledge/webdriver-bidi-runtime-round-32.md) measured the same rows through ChromeDriver 154.0.8037.97; this entry does not replace it. Every `yes` below is a predicate of scripts/check-bidi-runtime.mjs, re-evaluated by the round-35 C2 counter on two committed Firefox transcripts and on the counter's own live Firefox session. -->

# WebDriver BiDi at runtime — matrix §2 rows on Firefox 158.0.1 through geckodriver 0.37.1

source: S134 https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html (geckodriver's own flags page, section `--websocket-port PORT`: "Port to use to connect to WebDriver BiDi. Defaults to 9222."; the same page documents `--profile-root`, `--binary` and `--port`)
verified-at: 2026-10-26T21:16:34Z (S134 fetched read-only, HTTP 200, 41,404 B, sha256 `2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc`; the driver's measurements are the two committed runs at 2026-10-26T21:13Z and the C2 counter's own live session, not this fetch; host binaries pinned by `--version`)
recheck: `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <REV> --repo <clean clone> --json` at that revision — re-run on a new Firefox or geckodriver build, on a third engine, or when S134 republishes; do not promote a row to support for a different build from this entry

The round-32 entry left the matrix's runtime column filled for one engine only: every admitted
row had been observed through ChromeDriver, and Firefox was recorded as absent from this host.
This round installs Firefox from Mozilla's official release and geckodriver from Mozilla's own
release, and re-asks the same seventeen predicates on that engine with the same frozen fixture.
What follows is scoped to one build pair and one loopback origin; it is not a support matrix and
not a cross-browser guarantee.

## 1. What was run [observation]

- **Host binaries.** `/home/vgpnk/.local/opt/firefox-158.0.1/firefox --version` → `Mozilla Firefox
  158.0.1`; `/home/vgpnk/.local/bin/geckodriver --version` → `geckodriver 0.37.1 (300705c65d1b
  2026-07-17 09:25 +0000)`. Both sit in the operator's `~/.local` prefix, not in the
  distribution packages. This seat used them as given — it installed and built nothing for the
  measurement — and changed nothing in the distribution.
- **BiDi opt-in.** A classic `POST /session` with `alwaysMatch: {browserName: "firefox",
  webSocketUrl: true, unhandledPromptBehavior: "ignore", moz:firefoxOptions: {args:
  ["-headless"]}}` returns a `webSocketUrl` on `127.0.0.1`. Firefox does not serve BiDi itself:
  geckodriver brokers the session and owns the WebSocket port (S134).
- **Driver launch.** `geckodriver --port <free> --websocket-port <free> --binary
  /home/vgpnk/.local/opt/firefox-158.0.1/firefox --profile-root <scratch>/profiles`, with `HOME`,
  `TMPDIR`, `XDG_{CONFIG,CACHE,DATA,STATE,RUNTIME}_DIR` inside a per-run throwaway directory and
  `MOZ_HEADLESS=1`. The BiDi port is pinned to a free port on every launch because geckodriver's
  default is 9222 (S134), a port this host's CDP lease already owns.
- **Fixture.** The gate's own `serveFixture()` on an ephemeral `127.0.0.1` port: `/a.html`
  (title, `#h`, `#t` input, `#b` button writing `#out`, `#next` link, the `window.__ready`
  promise resolving to `settled` after 50 ms, and the `tabi_fixture=1` cookie), `/b.html`, and
  `/data.txt` (`tabi-bidi-body-0123456789` and a newline). Every 200 response carries
  `x-tabi-fixture: r32` and `cache-control: no-store`. The receipt's `fixtureSha256` equals the
  gate's exported `FIXTURE_SHA256`, so a fixture change fails rather than re-baselines.
- **Sessions.** `scripts/bidi-firefox-loopback-round35.mjs` runs twice, each run with a fresh
  geckodriver process, a fresh profile root and a fresh `HOME`/`TMPDIR`, and records every frame
  in the gate's transcript format: 77 lines per run (one classic new-session body, 28 commands,
  28 responses and 20 events, zero error frames). The counter then starts a third, independent
  Firefox session of its own with the gate's recipe.
- **Binding.** All three sessions take their first screenshot at the same point — after
  `setViewport 640x480`, a complete navigate to `/a.html`, and the awaited `window.__ready` — and
  every session's first screenshot is byte-identical: a 9,451-byte PNG, 640x480, sha256
  `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`. The frozen pre-data
  instrument check (`.ufo/waves/round-35/baseline/c2-instrument-check.json`) recorded the same
  digest on two earlier sessions of the same build pair.
- **Perimeter.** Navigation is loopback only: the driver navigates to `127.0.0.1` URLs it serves
  itself, and the gate's navigate predicate accepts only a `127.0.0.1`/`localhost` `/a.html` URL.
  The browser is not otherwise fenced; this entry makes no claim about Firefox's background
  traffic.

## 2. Runtime verdicts (R1–R17, matrix §2 order)

`yes` means: the gate's predicate for that row holds on both committed run transcripts **and** on
the counter's own live Firefox session against the same fixture, with the binding above. The
Evidence column names the predicate; the gate's source is the authority for its exact code. Where
Firefox's wire shape differs from ChromeDriver's, the difference is named.

| Row | Surface | BiDi method | Measured | Evidence |
|---|---|---|---|---|
| R1 | Browser identity at launch | classic `POST /session` with `webSocketUrl: true`, then any BiDi command | yes | caps carry `browserName: "firefox"`, `browserVersion: "158.0.1"` and `moz:geckodriverVersion: "0.37.1"`; the `webSocketUrl` is `ws://127.0.0.1:<port>/session/<uuid>` with a geckodriver-shaped UUID session id (not ChromeDriver's 32 hex), and at least one command on the socket succeeds |
| R2 | Target inventory | `browsingContext.getTree` | yes | a successful `getTree` returns one context whose id is a UUID |
| R3 | Navigate | `browsingContext.navigate` + `browsingContext.load` | yes | the navigate to the loopback `/a.html` returns that same `url` and a `browsingContext.load` event carries it (navigate seq 10, load event seq 13) |
| R4 | Screenshot | `browsingContext.captureScreenshot` | yes — 9,451 B PNG, 640x480 | the first screenshot decodes as a PNG whose IHDR is exactly the pinned viewport, taken before any input action (seq 21) |
| R5 | DOM shape/state | `browsingContext.locateNodes` with css locator `#h` | yes | exactly one node, `value.localName` is `h1`; Firefox returns a UUID `sharedId` per node |
| R6 | Wait predicates / volatile readouts | `script.evaluate` of `window.__ready` with `awaitPromise: true` | yes | the awaited evaluate returns the string `settled` (seq 15) |
| R7 | Viewport pin | `browsingContext.setViewport` then `script.evaluate` of `window.innerWidth` | yes | after the 640x480 setViewport, `window.innerWidth` reads the number 640 (seq 19) |
| R8 | Click input | `input.performActions` with a mouse pointer source (move to element, down, up) | yes | `document.getElementById('out').textContent` reads `clicked:tabi` after two element-origin clicks (`#t` seq 29, `#b` seq 35, read seq 37) |
| R9 | Text fill | `input.performActions` with key actions spelling `tabi` | yes | `document.getElementById('t').value` reads `tabi` after the key actions (seq 31, read seq 33) |
| R10 | Network client events | `session.subscribe` then `network.beforeRequestSent` and `network.responseCompleted` | yes | both events are observed for the loopback `/a.html` request (beforeRequestSent seq 11, responseCompleted seq 12) |
| R11 | Wire truth (raw status/headers) | `network.responseCompleted` `response.status` and `response.headers` | yes | that event reports status 200 and a header entry named `x-tabi-fixture` with value `r32`; Firefox serialises header names as strings and values as `{type: "string", value}` |
| R12 | Byte truth | `network.addDataCollector` (dataTypes contains `response`) then `network.getData` | yes | a collector registered before the request (seq 8) is followed by `getData` (seq 43) whose bytes equal the `/data.txt` body; Firefox returns them as `{type: "string"}`, not base64 |
| R13 | Pre-settle hold | `network.addIntercept` (phase `beforeRequestSent`) then `network.continueRequest` | yes | a `beforeRequestSent` for `/data.txt?held=1` is `isBlocked` and lists the registered intercept (seq 51), and `continueRequest` for the same request follows (seq 52) |
| R14 | Navigation history witness | `browsingContext.traverseHistory` with `delta: -1` | yes | after navigating `/b.html`, the traverse (seq 64) is followed by `location.pathname` reading `/a.html` (seq 71) |
| R15 | Cookies | `storage.getCookies` | yes | the result contains a cookie named `tabi_fixture` whose value is `{type: "string", value: "1"}` (seq 45) |
| R16 | Stop loading / nav-cancel | none — the draft's `browsingContext` command list has no navigation stop | no — no BiDi command | none: the counter refuses a `yes` here (`x2-no-counterpart`); Firefox 158 adds no command the draft lacks |
| R17 | User prompts / dialogs | `browsingContext.userPromptOpened` then `browsingContext.handleUserPrompt` | yes | the `tabi-alert` prompt event is observed (seq 75) with `handler: "ignore"` from the session capability, then a successful `handleUserPrompt` follows (seq 76) |

## 3. What each `yes` does not show

A row verdict is a predicate verdict, not contract equivalence with the CDP surface it is paired
with, and not parity with the Chromium measurement of the same row. Each cell names what survives.

| Row | What `yes` does not show |
|---|---|
| R1 | Not `/json/version` parity: WebDriver capability data only; Firefox exposes no such HTTP endpoint to a BiDi client, so no CDP product string exists on this engine to compare against |
| R2 | Browsing contexts only — no `page`/`worker`/`service_worker` target inventory, and geckodriver's own broker is not enumerable from the session |
| R3 | Not a settle contract: the load event fired, and the driver still awaited the page's own `window.__ready` promise; `navigationFailed`, `domContentLoaded` and event-race behaviour were not exercised |
| R4 | Not full-page capture: no clip, no origin option, and no comparison with a CDP capture of the same page |
| R5 | One css locator match with a `localName`; no snapshot-scale traversal, and Firefox's UUID `sharedId` shape is not a DevTools target id |
| R6 | One awaited string; no serialization-option matrix, no worker realm |
| R7 | Not an emulation equivalent: only the viewport override plus `devicePixelRatio: 1`; text-layout, mobile and DPR side effects were not measured |
| R8 | One mouse pointer source, two element-origin clicks; no coordinate semantics, tick grouping, hover, or other pointer types |
| R9 | Key actions only; no `Input.insertText` analogue, no composition/IME path, no insertion-rate behaviour |
| R10 | The document request only; subresources, caching behaviour and cross-event ordering guarantees are unmeasured (the runs do show Firefox's own `favicon.ico` requests, §7) |
| R11 | Not wire truth: status plus one serialized header value; no raw header-block bytes and no byte-exact status line |
| R12 | The collector had to exist before the request; `maxEncodedDataSize` limits, stream collectors and retrieval cost were not measured |
| R13 | `beforeRequestSent` only; `responseStarted`, `authRequired`, `failRequest` and `provideResponse` were not exercised |
| R14 | Traversal by delta only; no command returns the history-entry list, and forward traversal was not exercised |
| R15 | The default filter only; partition/scope semantics and cookie mutation were not exercised |
| R16 | Nothing: no runtime verdict is possible, on any engine, without a BiDi command to run |
| R17 | One `alert` with `accept: true`; `confirm`/`prompt`, `userPromptClosed` and the default handler's interference were not measured |

## 4. Unknowns, disposed

- **Which §2 commands a second engine implements:** resolved for this build pair and this fixture.
  Every row with a BiDi counterpart (R1–R15, R17) held on both committed runs and on the
  counter's live session. Open for other Firefox and geckodriver builds, and for any per-browser
  support claim beyond these binaries.
- **Cross-engine shape:** the ids differ per driver, not per protocol — geckodriver issues UUID
  session ids and UUID browsing-context ids, ChromeDriver 154 issues 32-hex ids. A receipt-shaped
  check written for one driver refuses the other; the round-35 C2 counter therefore checks
  geckodriver's shape explicitly and refuses Chromium's. Nothing in the draft requires either
  shape.
- **Byte-for-byte rendering across engines:** open and untested here. Firefox's and Chromium's
  screenshots of this fixture were each deterministic across sessions, but they are not compared
  with each other; the binding is same-engine only.
- **Cost of collector-gated body capture on Firefox:** open. R12 shows feasibility; no timing was
  recorded.

## 5. Limits

- **One host build.** Firefox 158.0.1 and geckodriver 0.37.1 on Arch Linux, `-headless`, one
  profile discipline. Nothing here generalises to another version pair, another engine or headed
  mode.
- **Loopback only.** One locally served fixture with no TLS, proxy, auth, redirect or third-party
  content.
- **Predicate-scoped verdicts.** `yes` is exactly the predicate in §2; §3 lists what each leaves
  open.
- **No performance numbers.** None are recorded here.
- **R16 is unmeasurable by construction** — there is no BiDi command to run.
- **Two cold runs plus one live session on one machine.** The receipt is re-runnable
  (`scripts/bidi-firefox-loopback-round35.mjs` takes `--out`, `--geckodriver`, `--firefox`), and a
  reproduction is only as strong as that rerun, not as the committed bytes.

## 6. Rejected

- **"Seventeen of seventeen rows measured on Firefox."** Rejected: R16 has no BiDi command in the
  dated draft, and the counter refuses a `yes` on it (`x2-no-counterpart`).
- **"Cross-engine parity."** Rejected: the same predicate holds on two engines, which is not the
  same as the same wire bytes, the same id shapes or the same rendering.
- **"BiDi replaces the CDP capture pipeline on Firefox."** Rejected: no CDP exists on this engine,
  and the load-bearing contracts the matrix already identified (columnar DOM snapshot, history
  entry list, `insertText`) are still absent — the Firefox runs show that more sharply, not less.
- **"The 9222 port is geckodriver's to use here."** Rejected: S134 states the default, and this
  host's 9222 is leased; every launch pins a free `--websocket-port` instead.
- **"A screenshot proves a real browser."** Rejected as stated: the binding ties the receipt to
  this build's rendering of the fixture; it does not prove a run was executed, and the live leg is
  what the capability verdict rests on.

## 7. What the runs carried that the predicates do not read

- **geckodriver's 9222 default.** S134: `--websocket-port` "Defaults to 9222". Both run
  transcripts carry a `webSocketUrl` on a free port (`127.0.0.1:44115` and `127.0.0.1:34019` in
  these runs), because the driver binds a free port and refuses 9222 explicitly.
- **Id shapes.** Session ids and browsing-context ids are UUIDs
  (`bc272ba1-5207-4ac5-abe5-3b55b9ac708f`, `08b0adaa-2476-439d-a46c-8db47f3baf6f`); `sharedId`s
  returned by `locateNodes` are UUIDs too. A round-32-shaped check would reject these transcripts.
- **`getData` byte encoding.** Firefox returns `bytes` as `{type: "string"}` for this text body;
  the round-32 Chromium transcripts carry base64. A decoder that assumes one encoding fails on the
  other; the gate's `decodeBytes` handles both.
- **Header serialisation.** Firefox names headers as plain strings and types their values
  (`{name: "x-tabi-fixture", value: {type: "string", value: "r32"}}`), and the fixture's
  `Date`/`Connection`/`Keep-Alive`/`Transfer-Encoding` headers come from the Node fixture server.
- **Firefox's own `favicon.ico` requests.** Each document load produces a `favicon.ico` request
  that the fixture answers 404 (§1's 404 branch); three of them appear per run. They are network
  events the predicates ignore.
- **Prompt handler echo.** `browsingContext.userPromptOpened` carries `handler: "ignore"` (the
  session capability) and `userContext: "default"`; the alert had to be handled explicitly, and
  the predicate checks the event plus the `handleUserPrompt`, not the echo.
- **Realm replacement after traversal.** The traversal replaces the realm; the driver reads
  `location.pathname` in a bounded retry loop and records each attempt, so only a successful read
  counts (none was needed beyond the first attempt in these runs).
- **Zero error frames.** Both transcripts contain 28 successful commands and 48 received frames
  with no `type: "error"` response: no Firefox command in the recipe was refused on this build.
