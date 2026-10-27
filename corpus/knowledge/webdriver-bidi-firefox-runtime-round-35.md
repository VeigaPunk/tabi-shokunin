<!-- corpus entry — tabi-shokunin round 35 (2026-10-26), claim C2 (coverage + capability, sourced). Adds a second engine to the round-32 BiDi runtime evidence: Firefox 158.0.1 driven by geckodriver 0.37.1, loopback fixture only, one host build. Every `yes` below is a predicate the round's frozen counter (.ufo/waves/round-35/counters/c2-firefox-bidi.mjs) re-evaluates on the receipt's two committed Firefox transcripts and on its own live Firefox session; the per-row predicates are the round-33/34 gate's (scripts/check-bidi-runtime.mjs, unchanged, sha256 370e8e95…). Source ids S134–S141 were registered by the L1 at integration (round-35 lesson §Gate). The receipt existed at wave-1 close in the executor's output (`.ufo/waves/round-35/w1/ExecFirefoxDriver/receipt.json`, destined for `corpus/evidence/round-35/bidi-firefox/receipt.json`); this scribe recomputed both transcript digests and re-evaluated the sixteen gate predicates on both transcripts with the frozen gate, and records the executor's counter reading (population 17, admitted 16, failing 0, unmeasured 1, entry/receipt/binding null, rev 245c4c6140aed4712a273b0dfca277b933d287fa). The counter's own live leg was not run by this scribe — no browser was launched here. Nothing here is a support matrix. -->

# WebDriver BiDi on a second engine — matrix §2 rows on Firefox 158.0.1 / geckodriver 0.37.1

source: S134 https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html (`--websocket-port PORT` "Port to use to connect to WebDriver BiDi. Defaults to 9222.", Flags.html:496; `--profile-root`, `--port`); S135 https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html ("Most of these are documented on MDN." — `webSocketUrl` and `moz:geckodriverVersion` absent from its bytes); S136 https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs (`webSocketUrl` read at :510-513 sets `use_websocket` at :522-523); S137 https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs (`moz:geckodriverVersion` inserted into the New Session capabilities at :767); S138 https://firefox-source-docs.mozilla.org/remote/Prefs.html ("With the end of the CDP support, WebDriver BiDi is the only available protocol, and the preference was removed in Firefox 141."); S139 https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes (locator `type`/`value`; `css` takes a selector string); S140 https://ftp.mozilla.org/pub/firefox/releases/158.0.1/ (SHA256SUMS line for linux-x86_64/en-US/firefox-158.0.1.tar.xz, Good signature by Mozilla key 14F26682…D98F0353); S141 https://github.com/mozilla/geckodriver/releases/tag/v0.37.1 (linux64 asset and its .asc); earlier rows S007 (MDN BiDi connection guide), S124 (W3C WD 2026-10-08 §4.1) and S125.
verified-at: 2026-10-26T21:11:51Z–2026-10-26T21:13:31Z (source pages fetched, hashed and quoted this round — receipts in the round-35 lesson `## Gate` and `.ufo/waves/round-35/w1/Scribe*/`; host binaries pinned by `--version` and sha256: geckodriver 0.37.1 `f831b7e6…`, Firefox 158.0.1 `firefox-bin` `46e2c204…`). Row verdicts are not admitted by this text: they are the frozen counter's reading at the measured revision over the two committed transcripts (`corpus/evidence/round-35/bidi-firefox/run1.jsonl` sha256 `0ef2e7e5…`, `run2.jsonl` `6754ec2d…`, both first screenshots `7a3ae6a9b0d65497…`) plus its own live Firefox session.
recheck: `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <40-hex REV> --repo <clean clone of the lane> --json` at the measured revision — re-run on a new Firefox or geckodriver build, on a third engine, or when the dated WD republishes; never promote a row from this entry to support for another build, driver, fixture or engine.

The round-32 entry moved the matrix's §2 rows from docs-held to runtime-held on **one**
implementation: chromium 154.0.8037.97 through chromedriver, where the BiDi socket is served by
chromium-bidi's CDP mapper. That left the lane's capability statement engine-scoped: every row's
`yes` was a statement about one driver's translation layer. This entry adds the same sixteen rows
on a second engine whose BiDi path is not a CDP translation — geckodriver drives Firefox through
Marionette for the HTTP WebDriver side (firefox-source-docs remote/index.html (unregistered page fetched this round; receipt `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md`)), and the BiDi socket Firefox
exposes is the browser's own remote agent (S138; S007 supports only that the socket is reached directly). It fills the same table
with the same predicates; it does not re-litigate the matrix's gap analysis, and it does not
turn two builds into a support matrix.

## 1. What a second engine adds [observation + inference]

- **An independent implementation, not a second reading of the same code.** Chromium's BiDi is
  the chromium-bidi mapper translating to CDP inside a driver-created tab (round-32 entry, §1).
  Firefox's BiDi is the remote agent in the browser process, with Marionette underneath for the
  HTTP WebDriver commands (firefox-source-docs remote/index.html (unregistered page fetched this round; receipt `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md`)). Firefox's *other* debug surface — the one
  `moz:debuggerAddress` turns on — is documented as "a low-level debugging interface that
  implements a subset of the Chrome DevTools Protocol (CDP)" (S135 Capabilities.html); the BiDi
  path this entry measures is neither that surface nor a mapper over it.
- **The identity shape is different, and the counter now depends on it.** geckodriver returns a
  UUID `sessionId` and a `webSocketUrl` of `ws://127.0.0.1:<port>/session/<that uuid>` (S007 MDN
  connection guide: "Firefox exposes the BiDi WebSocket directly at: ws://127.0.0.1:PORT/session";
  observed in this round's sessions), and it adds `moz:geckodriverVersion` to the new-session
  capabilities from its own build info (S137 marionette.rs:767). Chromium's session id is 32
  lowercase hex and its browsing contexts are 32 uppercase hex. The frozen counter therefore
  refuses a Chromium transcript relabelled as Firefox (control `c2-J2-chromium-copy`) and refuses
  a Chromium rendering spliced in behind a Firefox-shaped header (control `c2-J3-relabelled-chromium`).
- **Same fixture, same viewport, same predicates.** The counter imports the gate's `FIXTURE`,
  `serveFixture`, `VIEWPORT`, `ROWS` and `PREDICATES` (allow-list: `FIXTURE`, `FIXTURE_SHA256`,
  `FIXTURE_HEADER`, `VIEWPORT`, `DATA_TEXT`, `serveFixture`), so the sixteen admitted rows here
  are the same predicates as round 32, not a relaxed Firefox variant.
- **What it does not add.** No wire-truth parity (R11 is status plus serialized headers on both
  engines), no columnar DOM snapshot, no history-entry list, no `input.insertText`, and no R16
  command. A row admitted on two engines is a row admitted twice at one predicate granularity,
  not a row that has become a portable contract.
- **Standing evidence behind the cells, at wave-1 close.** Five independent Firefox sessions, from
  three seats' recorders, produced the same first screenshot: the pre-freeze instrument check
  (`.ufo/waves/round-35/baseline/c2-instrument-check.json`: sessions `59aa1fd4-…`, `df776540-…`,
  distinct loopback websocket ports, every gate predicate `null` for R1–R15 and R17, R16
  `no-bidi-counterpart`, zero errors), the engine-delta session
  (`.ufo/waves/round-35/w1/ExecFirefoxDelta/firefox-raw.jsonl`, 28 successful commands), and the
  wave-1 executor's two receipt runs (`w1/ExecFirefoxDriver/run1.jsonl`, `run2.jsonl`: 28 commands
  and 20 events each, session ids `bc272ba1-…` / `08b0adaa-…`, every one of the sixteen gate
  predicates re-evaluated here with zero failures). All five sessions' first screenshot is
  `sha256 7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` (9,451 bytes, 640×480).
  The committed receipt is not those two runs: the L1 re-recorded both runs after adding the DNS-off
  prefs (`corpus/evidence/round-35/bidi-firefox/run1.jsonl` / `run2.jsonl`, transcript sha256
  `0ef2e7e5…` / `6754ec2d…`), with the same first-screenshot digest.
  What this does not license: the digest equality is a rendering-identity observation, not a
  provenance proof (see Limits), and the admission still belongs to the counter's reading at the
  measured revision — the executor recorded 16 admitted / 0 failing / 0 binding findings at
  `245c4c61…` (its scratch commit), in `w1/ExecFirefoxDriver/counter-check.json`.

## 2. Launch discipline on this host [observation, grounded in the flags documented above]

- **Two ports, both free, never 9222.** geckodriver's WebDriver server defaults to `--host
  127.0.0.1` and `--port 4444` (S134 Flags.html), and its BiDi WebSocket defaults to 9222 —
  "Port to use to connect to WebDriver BiDi. Defaults to 9222." (S134 Flags.html). On this host
  `127.0.0.1:9222` is the operator's musketeer CDP lease port (a host fact recorded in this
  round's seat contract, not a fetched source), so every run passes an ephemeral `--port` and an
  ephemeral `--websocket-port`; the docs' own suggestion is to "bind to 0 to get the system to
  atomically assign a free port" (S134 Flags.html). A run that omits `--websocket-port` would
  try to bind the operator's lease port.
- **Profiles and HOME go into scratch.** `--profile-root` is the directory geckodriver creates
  temporary profiles in, defaulting to the system temporary directory, and "Both geckodriver and
  Firefox must have read-write access to this path" (S134 Flags.html). The counter points it at
  its own scratch and also sets `HOME`, `TMPDIR` and `XDG_{CONFIG,CACHE,DATA,STATE}_HOME` inside
  that scratch, so no Firefox state lands in the operator's home.
- **The binary is pinned, headless is explicit.** `--binary` names "the Firefox binary to use"
  (S134 Flags.html) — here `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` — and headlessness is
  requested through `moz:firefoxOptions.args`, whose documented example is `["-headless"]`
  (MDN firefoxOptions (unregistered page fetched this round; receipt `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md`): args "must include the leading dash ( - ) where required"). The
  counter sets `MOZ_HEADLESS=1` in the child environment as well; both the delta session and the
  instrument check report `moz:headless` and `moz:windowless` in the capabilities.
- **Origin-header boundary left in place.** geckodriver rejects requests carrying an `Origin`
  header by default ("to protect against malicious websites trying to access geckodriver running
  on the local machine", S134 Flags.html). The lane's client is a plain HTTP/WebSocket client and
  sends none, so the run does not pass `--allow-origins` and does not widen the driver's exposure.
- **Firefox's remote agent, not a CDP layer.** The client never probes `/json/version`, never
  opens a `--remote-debugging-port`, and never speaks CDP: it takes `webSocketUrl` out of the
  classic `POST /session` response (the `webSocketUrl: true` opt-in) and speaks BiDi frames on
  that socket (S007 MDN connection guide; S124 WD §4.1).
- **Teardown is part of the run.** `DELETE /session/<sessionId>`, `SIGTERM` to geckodriver, and
  removal of the scratch tree, so no Firefox or driver process outlives its transcript.
- **Loopback only.** The only server is the gate's own fixture on an ephemeral `127.0.0.1` port.
  What Firefox does with background network traffic is not measured in this entry; the round's
  sentinel seat owns that question, and this text claims nothing about it.

## 3. Runtime verdicts (R1–R17, matrix §2 order)

`yes` means: the gate's predicate for that row holds on both committed Firefox run transcripts
**and** on the counter's own live Firefox session, with the counter's `firefox` and `binding`
clauses (UUID session/context ids, `moz:geckodriverVersion` and `browserVersion` equal across
runs, receipt and live session, and a first screenshot byte-identical across all three). The
Evidence column names the row's predicate and cites the transcript pair; the counter command is
the `recheck:` line above and `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` in full.

| Row | Surface | BiDi method | Measured | Evidence |
|---|---|---|---|---|
| R1 | Browser identity at launch | classic `POST /session` with `webSocketUrl: true`, then any BiDi command | yes | caps `browserName: "firefox"`, `browserVersion` equal to the receipt's, `moz:geckodriverVersion` present, `webSocketUrl` matching `^ws://` on `127.0.0.1` or `localhost`, ending `:<port>/session/<sessionId>`, ≥1 successful command — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R2 | Target inventory | `browsingContext.getTree` | yes | a successful `getTree` whose `contexts` is non-empty and whose every `context` is a string (UUID here) — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R3 | Navigate | `browsingContext.navigate` + `browsingContext.load` | yes | a successful navigate to the loopback `/a.html` returning that same `url`, plus a `browsingContext.load` event carrying it — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R4 | Screenshot | `browsingContext.captureScreenshot` | yes | a successful screenshot decoding as a PNG whose IHDR is exactly 640×480 (the pinned viewport) — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R5 | DOM shape/state | `browsingContext.locateNodes` with css locator `#h` | yes | exactly one node returned, its `value.localName` is `h1` — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R6 | Wait predicates / volatile readouts | `script.evaluate` of `window.__ready` with `awaitPromise: true` | yes | the awaited evaluate succeeds and returns the string `settled` — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R7 | Viewport pin | `browsingContext.setViewport` then `script.evaluate` of `window.innerWidth` | yes | after a 640×480 `setViewport`, a later `innerWidth` read is the number 640 — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R8 | Click input | `input.performActions` with a mouse pointer source (move to element, down, up) | yes | `document.getElementById('out').textContent` reads `clicked:tabi` in a read taken after the pointer down/up — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R9 | Text fill | `input.performActions` with key actions spelling `tabi` | yes | `document.getElementById('t').value` reads `tabi` in a read taken after the key actions — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R10 | Network client events | `session.subscribe` then `network.beforeRequestSent` and `network.responseCompleted` | yes | both events observed for the loopback `/a.html` request — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R11 | Wire truth (raw status/headers) | `network.responseCompleted` `response.status` and `response.headers` | yes | that event reports status 200 and a header `x-tabi-fixture` with value `r32` — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R12 | Byte truth | `network.addDataCollector` (dataTypes contains `response`) then `network.getData` | yes | a collector registered before the request, then a `getData` of type `response` whose decoded bytes equal the `/data.txt` body — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R13 | Pre-settle hold | `network.addIntercept` (phase `beforeRequestSent`) then `network.continueRequest` | yes | a `beforeRequestSent` for `/data.txt` is `isBlocked` and lists the registered `intercept`, and a `continueRequest` for that request follows it — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R14 | Navigation history witness | `browsingContext.traverseHistory` with `delta: -1` | yes | after navigating `/b.html`, the traverse is followed by `location.pathname` reading `/a.html` — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R15 | Cookies | `storage.getCookies` | yes | the result contains a cookie named `tabi_fixture` whose value is `1` — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |
| R16 | Stop loading / nav-cancel | none — the draft's `browsingContext` command list has no navigation stop | no — no BiDi command in the draft (§7.3.3) | none: there is no command to run, so no committed run (corpus/evidence/round-35/bidi-firefox/run1.jsonl, run2.jsonl) can carry it, and the gate refuses a `yes` here (`x2-no-counterpart`); only `browsingContext.stopScreencast` exists — counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` reports the row unmeasured, never admitted |
| R17 | User prompts / dialogs | `browsingContext.userPromptOpened` then `browsingContext.handleUserPrompt` | yes | the `tabi-alert` prompt event is observed, then a successful `handleUserPrompt` follows it — corpus/evidence/round-35/bidi-firefox/run1.jsonl + run2.jsonl; counter `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` |

### What each `yes` does not show

The predicates are the round-32 gate's, unchanged, so the round-32 entry's §3 per-row caveats
carry row for row: no `/json/version` parity (R1), browsing contexts only and no target-type list
(R2), no settle contract (R3), no `origin: "document"`/`clip` full-page capture (R4), no columnar
DOM snapshot (R5), no `RemoteValue` mapping study and no worker realm (R6), no `mobile`
override or `emulation.*` matrix (R7), no full Actions model (R8), no `Input.insertText` parity
(R9), the document request only (R10), no raw header-block bytes or byte-exact status line (R11),
collector-gated body retrieval and no cost measurement (R12), `beforeRequestSent` only (R13),
delta-only history traversal (R14), default cookie filter only (R15), nothing at all (R16), one
`alert` with `unhandledPromptBehavior: "ignore"` (R17). Two caveats are Firefox-specific:
browsing contexts, prompts and network events arrive with a `userContext` field Chromium's do not
carry, and Firefox's realm and shared-node ids are UUID-shaped rather than Chromium's integer
realm and hex ids — both are shape facts of this build, not a contract either way.

## 4. Which engine for which evidence surface [inference, conditions from §2–§3]

| Evidence surface | Engine / driver | Condition under which it is the right choice | What it cannot give you |
|---|---|---|---|
| Any single matrix row the lane already captures through BiDi (R1–R15, R17) | either engine | the row's gate predicate holds on that engine's committed runs **and** the counter's live session; the two are evaluated, never assumed | the same row on a third engine or another build |
| A statement that a BiDi row is engine-independent | both engines, each at its own pinned build | both admit the row at the measured revision, and the entry says so per build | removal of the build/fixture scope; only two implementations are sampled |
| The lane's shipped CDP capture recipe (columnar `DOMSnapshot`, `ExtraInfo` header bytes, `Page.getNavigationHistory`, `Input.insertText`) | Chromium CDP | the evidence contract needs one of those shapes | any of them from Firefox's BiDi surface: the rows that admit these surfaces admit strictly less (R5, R11, R14, R9) |
| Dialog / prompt evidence | either engine's BiDi | the session sets `unhandledPromptBehavior: "ignore"` so `userPromptOpened` is observable, and the prompt is handled explicitly | `confirm`/`prompt` coverage and default-handler interference (unmeasured) |
| Body bytes of a loopback response | either engine | a `response` data collector is registered before the response is cloned; `getData` afterwards is retrieval only | retroactive retrieval, stream collectors, a cost comparison |
| Raw status line / header block | neither | no condition reaches it: the standard defines status, `statusText`, protocol and serialized header fields, not raw block bytes | wire-truth parity; U2 stays open |
| A Firefox-specific behaviour question (setViewport geometry, prompt fields, cookie `sameSite` default, `userContext` fields) | Firefox 158.0.1 / geckodriver 0.37.1 | the question is about this engine, and the answer is published as build-scoped | anything about another Firefox version, headed mode, or another engine |
| Launch isolation (profiles outside the system temp dir, scrubbed HOME/XDG) | Firefox / geckodriver | `--profile-root` is needed because profiles otherwise land in the system temporary directory with read-write access for both processes | an equivalent knob on the Chromium path; isolation there comes from `--user-data-dir` |
| A cost or latency comparison between the engines | each engine on its own build, same recipe and fixture | every run is recorded and the sample size is stated; this round's delta records one run per engine | a benchmark: n=1 wall times (2,332 ms Firefox vs 1,054 ms Chromium for the same 28-command recipe, sibling artifact `w1/ExecFirefoxDelta/shapes.json`) are an observation, not a measurement of variance |
| A claim about "the lane's BiDi evidence" without an engine qualifier | both engines, per row | every row the claim touches is admitted on both engines at the measured revision | a support matrix; the §2 row set is the gate's, not the spec's |

## 5. Engine differences

Measured by w1 ExecFirefoxDelta on one session per engine with the same 28-command recipe and fixture (Chromium 154.0.8037.97 / chromedriver vs Firefox 158.0.1 / geckodriver 0.37.1; raw records `.ufo/waves/round-35/w1/ExecFirefoxDelta/`). Both engines satisfy the same sixteen gate predicates; they differ on 11 of 17 rows in shape, never in predicate outcome. A one-session diff is an observation, not a variance measurement.

### D1. Identity grammars: session, browsing context, realm, sharedId (R1, R2, R5, R6, R13)
Chromium: `sessionId` 32 lowercase hex (`0393b1f74e694563191cc4dc795d0d03`, `chromium-raw.jsonl:1`);
context id 32 **uppercase** hex (`9941EDA1CAC951169DB976699136A439`, `chromium-raw.jsonl:5`);
`clientWindow` a decimal string (`"670821243"`); `realm` a dotted decimal pair
(`"-1657667056582648833.-557790419596291681"`, `chromium-raw.jsonl:16`, a different pair again at `:18`);
`sharedId` a structured composite that leaks the context and document ids in clear —
`f.9941EDA1CAC951169DB976699136A439.d.BD28158C69CE68AE137D56D77EE8F90A.e.4` (`chromium-raw.jsonl:22`).
Firefox: session id and context id are UUIDs (`561d933b-a79d-4fac-8368-e4ffaf0b32c5`,
`3a6aef5e-1ea9-4477-aa64-70a0a193cf02`, `firefox-raw.jsonl:1`, `:5`); `clientWindow` a UUID;
`realm` a UUID (`64f43ffb-5042-44cd-ba75-91bf138cc439`, `firefox-raw.jsonl:16`); `sharedId` an opaque
UUID (`107d6d60-ce6e-44ec-b506-30a5d52e7c53`, `firefox-raw.jsonl:24`).
Consequence, and the reason the counter carries its own shape checks: the gate's
`SESSION_ID = /^[0-9a-f]{32}$/` and `CONTEXT_ID = /^[0-9A-F]{32}$/` (gate lines 145–146) refuse a
Firefox record outright, and the counter's `UUID` (counter line 81) refuses a Chromium record. A
schema written from Chromium transcripts only, that validates `sharedId` against the
`f.<ctx>.d.<doc>.e.<n>` grammar, will reject every Firefox node.

### D2. Capability namespaces; the driver version is a flat capability on Firefox only (R1)
Chromium `caps` keys: `acceptInsecureCerts browserName browserVersion chrome fedcm:accounts
goog:chromeOptions goog:processID networkConnectionEnabled pageLoadStrategy platformName proxy
setWindowRect strictFileInteractability timeouts unhandledPromptBehavior webSocketUrl
webauthn:extension:* webauthn:virtualAuthenticators` (22 keys, `chromium-raw.jsonl:1`).
Firefox: `… moz:accessibilityChecks moz:buildID moz:geckodriverVersion moz:headless
moz:platformVersion moz:processID moz:profile moz:shutdownTimeout moz:webdriverClick
moz:windowless … userAgent webSocketUrl` (22 keys, `firefox-raw.jsonl:1`).
Firefox publishes `moz:geckodriverVersion` and `userAgent` as flat keys; Chromium has no flat
driver-version key — its driver version sits nested at `chrome.chromedriverVersion` (corrected by w2
CritEntryDifferences). `moz:profile` is an absolute path — inside the recorder's
throwaway scratch here, but it is a host path in a committed transcript unless the author strips or
redacts it (the counter starts its own sessions with `--profile-root` under its scratch but does not
check where a receipt's profile lived; the receipt's transcript carries whatever geckodriver reports).

### D3. `userContext` on every Firefox event; `goog:resource*` on every Chromium request (R3, R10, R13, R17)
Firefox event params carry `userContext: "default"` on `browsingContext.load`
(`firefox-raw.jsonl:14`), `network.beforeRequestSent` / `network.responseCompleted` (`:12`, `:13`)
and `browsingContext.userPromptOpened` (`:75`). Chromium emits none of these events with
`userContext` (`chromium-raw.jsonl:12`, `:13`, `:14`, `:69`) but adds `goog:resourceType` and
`goog:resourceInitiator` **inside** `request` (`chromium-raw.jsonl:12`). Every value the frozen
predicates read is identical; only the key sets differ. A validator that requires exact key-set
equality per event/method fails 4 of the 16 measurable rows on one engine or the other.

### D4. Screenshot bytes: same viewport, same PNG header, different pixels (R4)
Both `browsingContext.captureScreenshot` responses are `{data: <base64 string>}` and both decode to
a 640x480 PNG (IHDR `00000280 000001e0`). Chromium: 8836 base64 chars, **6626 bytes**, sha256
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5` (`chromium-raw.jsonl:20`).
Firefox: 12604 chars, **9451 bytes** (+42.6 %), sha256
`7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` (`firefox-raw.jsonl:22`).
Pixel differences are the renderer's (rasteriser, font hinting), so cross-engine screenshot
equality can never bind; within one engine the bytes were identical across this seat's two
independent executions of the recipe (both runs produced exactly the two hashes above), which is the
binding the counter asks for (per engine, first screenshot, across that engine's runs).

### D5. Firefox fetches `/favicon.ico` by itself; Chromium headless does not (R10)
Chromium: 5 `network.beforeRequestSent`, 0 of them favicon. Firefox: 8, of which 3 are
`/favicon.ico` — one after the first `/a.html` load (`firefox-raw.jsonl:17-18`), one after
`/b.html` (`:62-63`), one after the history traversal back to `/a.html` (`:69-70`); the traversal
re-fetch interleaves between the `traverseHistory` send (`:64`) and the `location.pathname` probe
(`:71`). Consequence: event counts differ by engine for the same page loads, and any "read the next
`responseCompleted`" heuristic on Firefox can pick up the favicon 404 instead of the document; the
frozen predicates key on URL, which is why R10/R11/R12 hold on both.

### D6. Request header list: Chromium repeats five names, Firefox is one-each and Host-first (R10)
Chromium's `request.headers` for `/a.html` has **19 entries, 14 unique names**, with
`Upgrade-Insecure-Requests`, `User-Agent`, `sec-ch-ua`, `sec-ch-ua-mobile`, `sec-ch-ua-platform`
each appearing twice, verbatim (`chromium-raw.jsonl:12`); first entry
`{"name":"Upgrade-Insecure-Requests","value":{"type":"string","value":"1"}}`. Firefox has **11,
all unique**, `Host` first (`{"name":"Host","value":{"type":"string","value":"127.0.0.1:42849"}}`,
`firefox-raw.jsonl:12`). Both encode values as `{"type":"string","value":…}` — the header *value*
encoding is the one thing that matches exactly. Consequence: a first-match header lookup is safe on
both; a header count, a "headers are unique" assertion, or a header-order fixture is not.

### D7. Response fields mean different things: `bodySize`, `content.size`, `mimeType`, header order (R11)
Same 200, same `statusText: "OK"`, same `x-tabi-fixture: r32` — R11's predicate holds on both. But
for the same 474-byte `/a.html`: Chromium reports `bodySize: 703`, `content: {"size": 474}`,
`headersSize: 198`, `mimeType: "text/html"`, header order
`Connection, Date, Keep-Alive, Transfer-Encoding, cache-control, content-type, x-tabi-fixture`
(`chromium-raw.jsonl:13`); Firefox reports `bodySize: 474`, `content: {"size": 0}`,
`headersSize: 217`, `mimeType: "text/html;charset=utf-8"`, header order
`content-type, cache-control, x-tabi-fixture, Date, Connection, Keep-Alive, Transfer-Encoding`
(`firefox-raw.jsonl:13`). `bytesReceived` is 703 on both. Consequence: `bodySize` must not be
compared across engines (Chromium's 703 is not the 474-byte document), `content.size` is
unpopulated on Firefox (0), `mimeType` carries the charset on Firefox only, and the header order is
Chromium's proxy view vs Firefox's server-emission order.

### D8. Cookies: `sameSite` default differs, Chromium adds `goog:` fields, `partitionKey` shape differs (R15)
The fixture sets `document.cookie='tabi_fixture=1; path=/'` — no `SameSite` attribute. Chromium
reports `sameSite: "none"` and decorates the cookie with `goog:priority: "Medium"`,
`goog:session: true`, `goog:sourcePort`, `goog:sourceScheme: "NonSecure"`; its result-level
`partitionKey` is `{"userContext":"default"}` (`chromium-raw.jsonl:44`). Firefox reports
`sameSite: "default"`, no `goog:` fields, and `partitionKey: {}` (`firefox-raw.jsonl:46`). Both:
`httpOnly: false`, `secure: false`, `size: 13`, value `{"type":"string","value":"1"}`, no
cookie-level `partitionKey`. Consequence: an evidence reader who takes Chromium's `sameSite: "none"`
as the cookie's declared policy will mis-state Firefox's reading of the same Set-Cookie, and an
assertion on `sameSite` breaks across engines.

### D9. Intercept/collector/`getData` — same shapes, so R12 holds unchanged (R12, R13)
`network.addDataCollector` → `{collector: <uuid>}` and `network.addIntercept` → `{intercept: <uuid>}`
on **both** engines (`chromium-raw.jsonl:9`, `:46`; `firefox-raw.jsonl:9`, `:48`); both block the
`/data.txt?held=1` request, report one `isBlocked` event with `intercepts: [<id>]`, and complete
`network.continueRequest` with `{}`. `network.getData` returns **`bytes: {type: "string", value:
"tabi-bidi-body-0123456789\n"}` on both**, 26 chars, byte-identical to `DATA_TEXT`
(`chromium-raw.jsonl:42`, `firefox-raw.jsonl:44`). Firefox 158 therefore needs no `base64` decode
path for R12; a decoder that only accepts `type: "base64"` would be wrong on both engines.

### D10. Ids on the network side, and the fields that do match exactly
`request.request` (the request id a `continueRequest`/`getData` must echo) has two shapes on
Chromium — 32 uppercase hex for navigation requests (`BD28158C69CE68AE137D56D77EE8F90A`,
`chromium-raw.jsonl:12`) and decimal-dotted for fetch/subresource requests (`"483282.3"` in the
committed round-32 transcripts; corrected by w2 CritEntryDifferences) — and `<int>-<uuid>` on Firefox
(`7-24915bfc-606c-4e0f-b9c7-8f9e6ac805b9`, `firefox-raw.jsonl:12`). By contrast `navigation` is a
UUID on both (`chromium-raw.jsonl:11`, `firefox-raw.jsonl:11`), `browsingContext.getTree` returns
the same seven keys on both (`children clientWindow context originalOpener parent url userContext`),
`setViewport`, `traverseHistory` and `handleUserPrompt` return `{}` on both, `innerWidth` is 640 on
both, and `#out` is `clicked:tabi` / `#t` is `tabi` on both. `timings` differ in kind, not just
value: Chromium emits all-zero deltas with a non-zero integer `timeOrigin`, Firefox emits
`timeOrigin: 0` with a real fractional `requestTime` (`chromium-raw.jsonl:12`, `firefox-raw.jsonl:12`).

### D11. Egress at launch (Firefox only) — found by w1 SentinelFirefoxEgress

With geckodriver's recommended automation prefs alone, the Firefox parent process opened three outbound TLS connections (remote-settings and content-signature hosts on Mozilla CDNs) within about two seconds of every launch, although the fixture is loopback. `network.dns.disabled: true` with `network.trr.mode: 5` in `moz:firefoxOptions.prefs` measured 0 non-loopback sockets; the lane driver `scripts/bidi-firefox-loopback-round35.mjs` sets both, and its integration run sampled 0 non-loopback firefox/geckodriver sockets (`.ufo/waves/round-35/measure/driver-egress-sample.txt`). The frozen C2 counter's own live leg does not set them, so a counter run is not loopback-only; that limit is recorded, not fixed, this round (the counter is frozen). The prefs are safe only while every navigated URL is an IP literal.

## 6. Limits

- **One host build.** Firefox 158.0.1 (`Mozilla Firefox 158.0.1` from `--version`) with
  geckodriver 0.37.1 (`geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`), headless on
  Arch Linux, paths `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` and
  `/home/vgpnk/.local/bin/geckodriver`. geckodriver's support table lists 0.37.1 as requiring
  Firefox "115 ESR" or newer with no maximum (geckodriver Support.html (unregistered page fetched this round; receipt `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md`)) — a version-range statement,
  not a conformance statement about 158.0.1.
- **One fixture.** The gate's loopback fixture only (`/a.html`, `/b.html`, `/data.txt`, the
  `tabi_fixture=1` cookie, `x-tabi-fixture: r32`): no TLS, proxy, auth, redirect or third-party
  origin. Headed mode is untested; `remote.active-protocols` and other prefs were not varied.
- **The counter binds shape and identity, not a driver log.** It checks the classic new-session
  body, the UUID shapes, `moz:geckodriverVersion` and `browserVersion` agreement, distinct
  session ids, distinct transcript digests, a driver that is neither the counter nor a byte copy
  of the gate, and a first screenshot byte-identical across the two runs and its own live
  session. A fabricated transcript pair that reproduced Firefox's rendering of this fixture
  byte-for-byte would not be excluded — reproducing it needs Firefox's own rendering, and that
  digest is cheap to obtain: this round saw it in five separate sessions, from three different
  seats' recorders. The binding therefore proves the fixture was rendered by this build, not that
  these two runs happened. That is the same trade round 32 recorded, and it is why the live leg
  re-tests every admitted row on a session the counter starts itself.
- **Predicate-scoped verdicts.** A `yes` is exactly the predicate in §3; §3's "what each `yes`
  does not show" lists what it leaves open. No row here is a claim that Firefox's BiDi surface
  can replace the CDP capture for the lane's evidence ladder.
- **No performance numbers.** The single-run wall times quoted in §4 are the delta's observation
  (n=1 per engine), not this entry's measurement.
- **R16 is unmeasurable by construction** — there is no BiDi command to run.

## 7. Rejected

- **"Sixteen rows measured on two engines."** Rejected as a portability claim: two builds, one
  fixture, one host, sixteen of seventeen rows. It is two measurements of the same predicates.
- **"Firefox gives R16 a counterpart."** Rejected: the dated draft's `browsingContext` command
  list has no navigation stop, and the gate refuses a `yes` on R16 (`x2-no-counterpart`).
- **"Firefox's BiDi is a CDP path like Chromium's."** Rejected: Firefox's CDP-ish surface is the
  `moz:debuggerAddress` remote protocol, documented as a *subset* of CDP (S135 Capabilities.html);
  the BiDi socket is the browser's own remote agent (S138), reached directly (S007 MDN connection guide).
- **"The 9222 default is convenient."** Rejected on this host: geckodriver's documented BiDi
  default (S134 Flags.html) is the operator's musketeer CDP lease port, so a run that does not
  pass `--websocket-port` is a collision waiting to happen.
- **"The receipt proves the runs happened."** Rejected as stated: the binding ties the receipt to
  this build's rendering of this fixture (see Limits), and provenance rests on the driver being
  re-runnable, as round 32 wave 2 recorded.

## 8. Unknowns

- **U1 (per-command support)** — answered for these two builds at these predicates only; no WPT
  result data was read this round, and no other engine or version is sampled.
- **U3 (realm model)** — open. Firefox returns UUID realm and shared-node ids in this run, but no
  worker realm was evaluated.
- **U4 (cost of collector-gated body capture)** — open. R12 shows feasibility on Firefox; the
  delta's wall times are n=1 and not a comparison.
- **U5 (binding stability)** — open. The client is a plain Node WebSocket client; no binding
  stability promise is measured.
- **U6 (Firefox egress on this host)** — not measured here; the round's sentinel seat owns it.

## Corrections

- 2026-10-27 (round 36): §5 D11's sentence "its integration run sampled 0 non-loopback
  firefox/geckodriver sockets" cited `.ufo/waves/round-35/measure/driver-egress-sample.txt`,
  which is committed but empty (0 bytes) — the committed sample lives at
  `.ufo/waves/round-35/w2/SentinelDriverEgress/evidence/sockets-summary.txt` (27 samples, 0
  non-loopback). Re-pointed by the round-35 verifier spot-check routed defect 1; the 0-byte
  file is left in place as evidence of the defect.
