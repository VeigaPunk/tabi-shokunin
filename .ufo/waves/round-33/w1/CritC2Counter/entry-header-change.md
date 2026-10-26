<!-- corpus entry — tabi-shokunin round 32 (2026-10-26), claim C1 (coverage: capability acquisition). Moves corpus/knowledge/webdriver-bidi-capability-matrix.md §2 from docs-held to runtime-held on this host: Chromium 154.0.8037.97 + ChromeDriver 154.0.8037.97, loopback fixture only, one host build. Every `yes` below is a predicate the round's gate (scripts/check-bidi-runtime.mjs) re-evaluates on two committed transcripts and on its own live session. -->

# WebDriver BiDi at runtime — matrix §2 rows on this host build

source: S124 https://www.w3.org/TR/webdriver-bidi/ (dated Working Draft https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/, 8 October 2026, revision f922e6af669ead51496db85f37813f39438ef171: §4.1 "WebDriver clients opt in to a bidirectional connection by requesting the WebSocket URL capability with value true", the §7.3–§7.9 command/event definitions named in each row below); S125 https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc (Chrome's own driver source at the measured tag: `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` at :288-289 under `if (session->web_socket_url)` at :287, and "Create a hidden target for running  BiDi-CDP mapper in it" at :407 — the capability is issued by ChromeDriver itself and the mapper runs in a driver-created target); S126 https://www.w3.org/TR/webdriver2/ (dated Working Draft https://www.w3.org/TR/2026/WD-webdriver2-20260702/, 2 July 2026: §7 `unhandledPromptBehavior` default "dismiss and notify" and §16.1 the "ignore" handler, the lever that keeps chromedriver from answering the page dialog before BiDi `browsingContext.handleUserPrompt` can); receipt corpus/evidence/round-32/bidi/receipt.json (schema `tabi-bidi-receipt-v1`, at least two runs, each with a committed JSONL transcript digest and the driver's own blob digest)
verified-at: 2026-10-26T16:02:34Z–2026-10-26T16:04:28Z (source pages fetched and hashed this round, per-fetch URL, status, byte count and sha256 in `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md`; host binaries pinned by `--version`; the live measurements are the receipt's runs plus this round's gate run, not this fetch)
recheck: `node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` at that revision — re-run on a new ChromeDriver build, on a second engine, or when S124 republishes; do not promote a row to support for a different build from this entry

The capability matrix (S005, earlier rounds) compared tabi's CDP surfaces with the W3C draft and
stated `locally measured: no` for all seventeen §2 rows: no BiDi endpoint had ever been contacted
on this host. This entry replaces that one blanket statement with per-row runtime verdicts,
scoped to one host build and one loopback fixture. It does not re-litigate the matrix's gap
analysis; it fills the "measured" column and keeps the gaps explicit in a separate table.

## 1. What was run [observation]

- **Host binaries.** `chromium --version` → `Chromium 154.0.8037.97 Arch Linux`;
  `chromedriver --version` → `ChromeDriver 154.0.8037.97
  (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`. Both are
  distribution binaries at `/usr/bin/`; nothing was built or upgraded for this round.
- **BiDi opt-in.** A classic `POST /session` with `alwaysMatch: {browserName: "chrome",
  webSocketUrl: true, unhandledPromptBehavior: "ignore", goog:chromeOptions: {binary,
  args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu",
  --user-data-dir=<throwaway>]}}` returns a `webSocketUrl` on loopback; the run then speaks
  BiDi on that socket (S124 §4.1: the opt-in is the `webSocketUrl` capability).
- **Mapper.** ChromeDriver's BiDi transport is the chromium-bidi mapper compiled into the
  driver binary and loaded into a driver-created tab: `third_party/bidimapper/README.chromium`
  at Chromium tag `154.0.8037.97` gives `Version: 17.0.2`, `Date: 2026-07-06`,
  `Revision: 237806b5551fab0bc7d34b2d4e26b61e160aec07` (fetched 2026-10-26T16:03:42Z,
  HTTP 200, 1957 B decoded, sha256
  `be5e15ca920b888db1fe2bbf00535397fa9912f67c7aff8c6ec8b401676c845e`). The binary carries
  `bidi-mapper-path=PATH`, `window.runMapperInstance(%s)`, `Failed to initialize BiDi Mapper`
  and a `BiDi-CDP Mapper` page, and carries **no** chromium-bidi version string
  (`strings /usr/bin/chromedriver | grep -o 'chromium-bidi[/@][^",; )]*'` → no match), so the
  version above is read from the source tag, not from the binary.
- **Fixture.** Served by the gate's own `serveFixture()` on an ephemeral `127.0.0.1` port:
  `/a.html` (title, `#h`, `#t` input, `#b` button writing `#out`, `#next` link, a
  `window.__ready` promise resolving to `settled` after 50 ms, and a `tabi_fixture=1`
  cookie), `/b.html`, and `/data.txt` (`tabi-bidi-body-0123456789` followed by a newline). Every response carries
  `x-tabi-fixture: r32` and `cache-control: no-store`. The receipt's `fixtureSha256` must equal
  the gate's exported `FIXTURE_SHA256`, which digests exactly these bodies, types and header
  pair; a fixture change therefore fails the gate rather than silently re-baselining.
- **Sessions.** The receipt's committed driver runs (the gate requires at least two) plus the
  gate's own independent live session. Every run and the gate's live session take the first
  screenshot at the same point (after `setViewport 640x480`, a complete
  `browsingContext.navigate` to `/a.html`, and the awaited `window.__ready`), and the gate
  requires those first screenshots to be byte-identical and carry the same
  `chromedriverVersion` — the binding that distinguishes a real rendering from a synthesised
  transcript.
- **Perimeter.** Navigation is loopback only: the driver navigates to `127.0.0.1` URLs it serves
  itself, and the gate's navigate predicate accepts only a `127.0.0.1`/`localhost` `/a.html` URL,
  so a non-loopback target cannot satisfy R3. The browser itself is not fenced: a netlog of one
  session with the gate's own argv shows background URL requests to eight non-loopback Google
  hosts (`clients2.google.com`, `update.googleapis.com`, `accounts.google.com`, `www.google.com`
  among them), and a proxy test saw live CONNECTs, despite `--disable-background-networking`
  (`.ufo/waves/round-32/w1/SentinelPerimeter.md` F3). No page of an external site was requested
  by the fixture or the driver.

## 2. Runtime verdicts (R1–R17, matrix §2 order)

`yes` means: the gate's predicate for that row holds on both committed run transcripts **and**
on the gate's own live session against the same fixture, with the binding checks above. The
Evidence column names that predicate; the gate's source is the authority for its exact code.

| Row | Surface | BiDi command | Measured | Evidence |
|---|---|---|---|---|
| R1 | Browser identity at launch | classic `POST /session` with `webSocketUrl: true`, then any BiDi command | yes | caps `browserName` present, `browserVersion` equals the receipt's `browserVersion`, `webSocketUrl` matches `^ws://(127.0.0.1 or localhost):port/`, at least one successful command on the socket |
| R2 | Target inventory | `browsingContext.getTree` | yes | a successful `getTree` whose `contexts` is non-empty and every entry has a string `context` |
| R3 | Navigate | `browsingContext.navigate` + `browsingContext.load` | yes | a successful navigate to the loopback `/a.html` returns that same `url`, and a `browsingContext.load` event carries it |
| R4 | Screenshot | `browsingContext.captureScreenshot` | yes | a successful screenshot decodes as a PNG whose IHDR is exactly 640x480 (the pinned viewport) |
| R5 | DOM shape/state | `browsingContext.locateNodes` with css locator `#h` | yes | exactly one node is returned, `value.localName` is `h1` |
| R6 | Wait predicates / volatile readouts | `script.evaluate` of `window.__ready` with `awaitPromise: true` | yes | the awaited evaluate succeeds and returns the string `settled` |
| R7 | Viewport pin | `browsingContext.setViewport` then `script.evaluate` of `window.innerWidth` | yes | after a 640x480 setViewport, the later `window.innerWidth` read is the number 640 |
| R8 | Click input | `input.performActions` with a mouse pointer source (move to the element, down, up) | yes | `document.getElementById('out').textContent` reads `clicked:tabi` in a read taken after the pointer down/up |
| R9 | Text fill | `input.performActions` with key actions spelling `tabi` | yes | `document.getElementById('t').value` reads `tabi` in a read taken after the key actions |
| R10 | Network client events | `session.subscribe` then `network.beforeRequestSent` and `network.responseCompleted` | yes | both events are observed for the loopback `/a.html` request |
| R11 | Wire truth (raw status/headers) | `network.responseCompleted` `response.status` and `response.headers` | yes | that event reports status 200 and a header `x-tabi-fixture` with value `r32` |
| R12 | Byte truth | `network.addDataCollector` (dataTypes contains `response`) then `network.getData` | yes | a collector registered before the request is followed by a `getData` of type `response` whose decoded bytes equal the `/data.txt` body |
| R13 | Pre-settle hold | `network.addIntercept` (phase `beforeRequestSent`) then `network.continueRequest` | yes | a `beforeRequestSent` for `/data.txt?held=1` is `isBlocked` and lists the registered `intercept`, and a `continueRequest` for that same request follows it |
| R14 | Navigation history witness | `browsingContext.traverseHistory` with `delta: -1` | yes | after navigating `/b.html`, the traverse is followed by `location.pathname` reading `/a.html` |
| R15 | Cookies | `storage.getCookies` | yes | the result contains a cookie named `tabi_fixture` whose value is `1` |
| R16 | Stop loading / nav-cancel | none — the draft's `browsingContext` command list has no navigation stop | no — no BiDi command | none: the gate refuses a `yes` here (`x2-no-counterpart`); only `browsingContext.stopScreencast` exists |
| R17 | User prompts / dialogs | `browsingContext.userPromptOpened` then `browsingContext.handleUserPrompt` | yes | the `tabi-alert` prompt event is observed, then a successful `handleUserPrompt` follows it |

## 3. What each `yes` does not show

A row verdict is a predicate verdict, not contract equivalence with the CDP surface it is
paired with. Each cell names the part of the matrix gap that survives this round.

| Row | What `yes` does not show |
|---|---|
| R1 | Not `/json/version` parity: this is WebDriver capability data, not the CDP product string, `Protocol-Version` or `webSocketDebuggerUrl`; the socket's URL is chromedriver-issued and its stability across launches or reachability outside the driver is untested |
| R2 | Not a target inventory: browsing contexts only, no `page`/`worker`/`service_worker` target types, and no re-identify-by-URL sweep beyond the single page context |
| R3 | Not a settle contract: the load event fired, but the driver still used an awaited DOM predicate to settle, as the lane already does; `navigationFailed`, `domContentLoaded` and event-race behaviour were not exercised |
| R4 | Not full-page capture: no `origin: "document"`, no `clip`, and no comparison with `Page.captureScreenshot {captureBeyondViewport: true}` geometry |
| R5 | Not a DOM snapshot: one css locator match with a `localName`; nothing about CDP's columnar `documents`/`strings` schema or snapshot-scale traversal |
| R6 | Not a `RemoteValue` mapping study: one awaited string; no `SharedReference`, no serialization-option matrix, no worker realm (U3 untouched) |
| R7 | Not an emulation equivalent: `devicePixelRatio` side effects, the text-layout `mobile` override and the separate `emulation.*` commands were not measured |
| R8 | Not the full Actions model: one mouse pointer on one element, no coordinate semantics, tick grouping, hover or non-mouse pointer types |
| R9 | Not `Input.insertText` parity: key actions only, no composition/IME path, no measurement of fast-insertion side effects |
| R10 | Not a complete request ledger: the document request only; subresources, caching behaviour and cross-event ordering guarantees are unmeasured |
| R11 | Not wire truth: status plus one serialized header value; no raw header-block bytes, no byte-exact original status line, no `ExtraInfo` analogue (the matrix's gap stands) |
| R12 | Not post-hoc retrieval: the collector had to exist before the request; `maxEncodedDataSize` and total-storage behaviour, stream collectors and retrieval cost (U4) are unmeasured |
| R13 | Not the phase matrix: `beforeRequestSent` only; `responseStarted`, `authRequired`, `failRequest` and `provideResponse` were not exercised here |
| R14 | Not a history witness: traversal by delta only; no command returns the history-entry list, and forward traversal was not exercised |
| R15 | Not browser-wide parity: the default filter only; partition/scope semantics and cookie mutation were not exercised |
| R16 | Nothing: no runtime verdict is possible; the lane's weak CDP stop behaviour (0/8 abort-marked) has no BiDi counterpart to compare against |
| R17 | Not dialog coverage: one `alert` with `accept: true`, and only with `unhandledPromptBehavior: "ignore"` in the session request; `confirm`/`prompt`, `userPromptClosed`, and the default handler's interference were not measured |

## 4. Unknowns, disposed

- **U1** (which §2 commands chromium-bidi implements): resolved for this build and this
  fixture by the round's committed-run receipt and the gate's own live session — every row with a
  BiDi counterpart (R1–R15, R17) held. Still open for other builds, other engines, and the WPT
  results surface: no per-browser result data was read (`locally measured` here is this host,
  not the support matrix).
- **U2** (can extra fields reproduce raw status-line/header bytes): open. R11 shows only
  `ResponseData` status and serialized header fields.
- **U3** (`script.evaluate` on a shared worker / realm model vs the lane's page-target scope):
  open. R6 evaluated on the page context only.
- **U4** (cost of collector-gated body capture vs post-hoc `getResponseBody`): open on cost.
  R12 now shows the gating itself — a collector registered before the request, `getData`
  returning the body — so the *feasibility* half is measured; no timing was recorded here.
- **U5** (whether a binding tabi could drive ships stable intercept APIs): resolved narrowly.
  A plain Node client over the platform `WebSocket` drove chromedriver's BiDi socket,
  including `network.addIntercept`/`continueRequest` (R13). Other bindings, and any stability
  promise for these commands, remain unmeasured; the Selenium-Python status read in an
  earlier round was not re-read.

## 5. Limits

- **One host build.** Chromium and ChromeDriver 154.0.8037.97 on Arch Linux, `--headless=new`,
  chromium-bidi mapper 17.0.2. Nothing here generalizes to another version, another engine, or
  headed mode; the entry is build-scoped, like every recorded protocol shape in this lane.
- **Loopback only.** One locally served fixture with no TLS, proxy, auth, redirect or
  third-party content. Browser perimeters that need a real origin are untested.
- **Predicate-scoped verdicts.** `yes` is exactly the predicate in §2, re-evaluated by the
  gate; §3 lists what each predicate leaves open. A row's `yes` is not a claim that the BiDi
  surface can replace the CDP capture for the lane's evidence ladder.
- **No performance numbers.** None are recorded here; timing probes belong to their own
  receipts and are not summarized in this entry.
- **R16 is unmeasurable by construction** — there is no BiDi command to run.

## 6. Rejected

- **"Seventeen of seventeen rows measured."** Rejected: R16 has no BiDi command in the dated
  draft, and the gate refuses a `yes` on it (`x2-no-counterpart`). Marking it measured would
  be a fabricated capability.
- **"BiDi can replace the CDP capture pipeline."** Rejected for the same three
  load-bearing contracts the matrix already identified (DOMSnapshot's columnar shape, the
  history-entry list, `insertText`), plus collector-gated body retrieval. This round adds
  runtime support to individual rows, not equivalence to those contracts.
- **"Wire-truth parity."** Rejected: R11 is status plus one header value, with no raw header
  block and no byte-exact status line.
- **"Cross-browser BiDi support."** Rejected: one browser, one driver, one mapper version, one
  host build. The matrix's implementation-vs-spec distinction is unchanged.
- **"A screenshot proves a real browser."** Rejected as stated: the binding requires the first
  screenshot to be byte-identical across every run *and* to the gate's own live session, with
  a `chromedriverVersion`; a single screenshot alone would not be enough.

## 7. What the runs carried that the predicates do not read (round 32 wave 1)

- **Host launcher flags.** `/usr/bin/chromium` is the Arch launcher script; it prepends the host
  user's `~/.config/chromium-flags.conf` to every browser it starts, so both receipt runs and the
  gate's live session ran with `--ozone-platform=wayland`, `--enable-features=TouchpadOverscrollHistoryNavigation`,
  `--disable-features=Vulkan` and `--load-extension=<a host copy-url extension>` in front of the
  driver's own argv (executed argv in `.ufo/waves/round-32/w1/SentinelPerimeter.md`). The first-screenshot
  binding holds under those flags; a run without them (the `/usr/lib/chromium/chromium` binary
  directly) is a different configuration and is not evidenced here.
- **`--no-sandbox`.** Not needed on this host: a session without it succeeds and its renderers
  run sandboxed (SentinelPerimeter F1). The receipt runs and the gate keep the flag; its removal
  would change the frozen gate, so it is recorded here and routed, not changed.
- **Driver socket.** chromedriver listens unauthenticated on `127.0.0.1` and `[::1]` with no
  `--allowed-ips`/`--allowed-origins` (SentinelPerimeter F4); acceptable on this single-user host,
  stated so a later multi-user run does not inherit it silently.
- **Transcript contents.** Each committed transcript keeps the classic new-session response
  verbatim, including `chrome.userDataDir` (a deleted scratch path), the dead `sessionId` /
  `webSocketUrl`, `goog:processID` and `debuggerAddress`. None is credential or session material
  of a real site; `chrome.chromedriverVersion` must stay verbatim for the binding.

## 8. Gate limits found after the freeze (round 32 wave 1)

The gate's frozen bytes admit four constructions the claim's prose excludes
(`.ufo/waves/round-32/w1/CritC1Forgery.md`): a row id listed more than once counts once per
listing; one transcript cited as both runs passes the two-run rule; a receipt whose `driver` is
the gate's own bytes under another path passes the driver check (only the path is refused); and a
synthetic transcript with one real first screenshot spliced in passes the binding. The live leg
still re-tests every admitted row on a session the gate starts itself, so the runtime verdicts in
§2 do not rest on the receipt alone. For this entry the plain counts that close those four holes
are recorded with the round's measurement (`.ufo/waves/round-32/measure/`): sixteen distinct row
ids, two distinct transcript digests, a driver digest different from the gate's, and a driver that
imports neither `liveRecord` nor `PREDICATES`.

## Corrections — round 32 wave 2 (append-only; the text above keeps its bytes)

- §1 "Sessions", the sentence ending "the binding that distinguishes a real rendering from a synthesised transcript"
  (`:47-49`): read instead — the binding ties a receipt to this host build's rendering of the fixture; it does not prove
  that the receipt's runs were executed. A synthetic transcript carrying one real first screenshot (obtainable from any
  one session, CDP included — the CDP render is byte-identical) passes the binding (`.ufo/waves/round-32/w1/CritC1Forgery.md`,
  `.ufo/waves/round-32/w2/CritForgeryRecheck.md`).
- §8, "the plain counts that close those four holes" (`:188-190`): three of the four. Distinct row ids, distinct
  transcript digests and the driver checks close the duplicate, same-transcript and gate-as-driver constructions; the
  spliced-screenshot construction passes the plain counts too (`.ufo/waves/round-32/w2/RerunDistinct.md`,
  `CritForgeryRecheck.md`). The provenance of the committed runs rests on the driver being re-runnable: a third,
  independent run of `scripts/bidi-loopback-round32.mjs` at `b234a589` reproduced the method sequence, the
  predicate values and the first-screenshot digest (`.ufo/waves/round-32/w2/RerunDriver.md`).
- §3 R12, "`maxEncodedDataSize` and total-storage behaviour, stream collectors and retrieval cost (U4) are unmeasured"
  (`:103`): the size limits were measured in this round by w1 ExecCollectorTiming (`.ufo/waves/round-32/w1/ExecCollectorTiming/runs/out10`–`out12`):
  on this build a body far above `maxEncodedDataSize` is returned whole, and `getData` fails with `no such network data`
  only when the limit is below a threshold that tracks the response header block size, not the body; a
  `maxTotalCollectedSize` below the body still returns it. Only stream collectors and retrieval cost stay unmeasured.
