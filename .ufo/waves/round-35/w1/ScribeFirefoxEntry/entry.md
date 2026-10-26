<!-- corpus entry — tabi-shokunin round 35 (2026-10-26), claim C2 (coverage + capability, sourced). Adds a second engine to the round-32 BiDi runtime evidence: Firefox 158.0.1 driven by geckodriver 0.37.1, loopback fixture only, one host build. Every `yes` below is a predicate the round's frozen counter (.ufo/waves/round-35/counters/c2-firefox-bidi.mjs) re-evaluates on the receipt's two committed Firefox transcripts and on its own live Firefox session; the per-row predicates are the round-33/34 gate's (scripts/check-bidi-runtime.mjs, unchanged, sha256 370e8e95…). WAVE-1 STATE: the `source:` ids are `S13x` placeholders for the round's registry slots (mapping in the wave-1 fetch-receipts) and the L1 substitutes the registered ids before publication. The receipt existed at wave-1 close in the executor's output (`.ufo/waves/round-35/w1/ExecFirefoxDriver/receipt.json`, destined for `corpus/evidence/round-35/bidi-firefox/receipt.json`); this scribe recomputed both transcript digests and re-evaluated the sixteen gate predicates on both transcripts with the frozen gate, and records the executor's counter reading (population 17, admitted 16, failing 0, unmeasured 1, entry/receipt/binding null, rev 245c4c6140aed4712a273b0dfca277b933d287fa). The counter's own live leg was not run by this scribe — no browser was launched here. Nothing here is a support matrix. -->

# WebDriver BiDi on a second engine — matrix §2 rows on Firefox 158.0.1 / geckodriver 0.37.1

source: S13x https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html (`--websocket-port PORT` "Port to use to connect to WebDriver BiDi. Defaults to 9222."; `--profile-root PROFILE_ROOT` "Path to the directory to use when creating temporary profiles."; `--port` "Defaults to 4444."; `--host HOST` "Defaults to 127.0.0.1."; `--allow-origins` "By default any request with an Origin header is rejected …"); S13x https://firefox-source-docs.mozilla.org/testing/geckodriver/Support.html (support table row "0.37.1 ≥ 3.11 (3.14 Python) 115 ESR n/a"); S13x https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html ("a low-level debugging interface that implements a subset of the Chrome DevTools Protocol (CDP)" — Firefox's `moz:debuggerAddress` surface, not the BiDi path); S13x https://raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs:767 `capabilities.insert("moz:geckodriverVersion".into(), build::build_info().into());`; S13x https://firefox-source-docs.mozilla.org/remote/index.html ("Marionette is used … by geckodriver to implement the WebDriver (HTTP) specification"; "The WebDriver BiDi specification extends WebDriver HTTP to add bidirectional communication."); S13x https://developer.mozilla.org/en-US/docs/Web/WebDriver/How_to/Create_BiDi_connection ("Firefox exposes the BiDi WebSocket directly at: ws://127.0.0.1:PORT/session"); S13x https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/Capabilities/firefoxOptions (args "must include the leading dash ( - ) where required, e.g., ["-headless"]"); S13x https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/ (dated WD, revision f922e6af669ead51496db85f37813f39438ef171; this round's bytes sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4`, equal to the round-32 registry row's digest, so the §7.x anchors cited in the round-32 entry are unchanged).
verified-at: 2026-10-26T21:12:09Z–2026-10-26T21:13:31Z (the source pages above fetched, hashed and quoted this round — per-fetch URL, UTC, status, byte count and sha256 in `.ufo/waves/round-35/w1/ScribeFirefoxEntry/fetch-receipts.md`; host binaries pinned by `--version`: geckodriver 0.37.1, Mozilla Firefox 158.0.1). Row verdicts: this text does not admit them. The two committed run transcripts were read and re-evaluated against all sixteen gate predicates by this scribe at wave-1 close (0 failures; digests b916c5df…/af84675f…; first screenshots both sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`), and the admission is the counter's reading at the measured revision over those transcripts plus its own live session, which this scribe did not run.
recheck: `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <40-hex REV> --repo <clean clone of the lane> --json` at the measured revision — re-run on a new Firefox or geckodriver build, on a third engine, or when the dated WD republishes; never promote a row from this entry to support for another build, driver, fixture or engine.

The round-32 entry moved the matrix's §2 rows from docs-held to runtime-held on **one**
implementation: chromium 154.0.8037.97 through chromedriver, where the BiDi socket is served by
chromium-bidi's CDP mapper. That left the lane's capability statement engine-scoped: every row's
`yes` was a statement about one driver's translation layer. This entry adds the same sixteen rows
on a second engine whose BiDi path is not a CDP translation — geckodriver drives Firefox through
Marionette for the HTTP WebDriver side (S13x remote/index.html), and the BiDi socket Firefox
exposes is the browser's own remote agent (S13x MDN connection guide). It fills the same table
with the same predicates; it does not re-litigate the matrix's gap analysis, and it does not
turn two builds into a support matrix.

## 1. What a second engine adds [observation + inference]

- **An independent implementation, not a second reading of the same code.** Chromium's BiDi is
  the chromium-bidi mapper translating to CDP inside a driver-created tab (round-32 entry, §1).
  Firefox's BiDi is the remote agent in the browser process, with Marionette underneath for the
  HTTP WebDriver commands (S13x remote/index.html). Firefox's *other* debug surface — the one
  `moz:debuggerAddress` turns on — is documented as "a low-level debugging interface that
  implements a subset of the Chrome DevTools Protocol (CDP)" (S13x Capabilities.html); the BiDi
  path this entry measures is neither that surface nor a mapper over it.
- **The identity shape is different, and the counter now depends on it.** geckodriver returns a
  UUID `sessionId` and a `webSocketUrl` of `ws://127.0.0.1:<port>/session/<that uuid>` (S13x MDN
  connection guide: "Firefox exposes the BiDi WebSocket directly at: ws://127.0.0.1:PORT/session";
  observed in this round's sessions), and it adds `moz:geckodriverVersion` to the new-session
  capabilities from its own build info (S13x marionette.rs:767). Chromium's session id is 32
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
  (`.ufo/waves/round-35/w1/ExecFirefoxDelta/firefox-raw.jsonl`, 28 successful commands), and both
  receipt runs (`w1/ExecFirefoxDriver/run1.jsonl`, `run2.jsonl`: 28 commands and 20 events each,
  session ids `bc272ba1-…` / `08b0adaa-…`, every one of the sixteen gate predicates re-evaluated
  here with zero failures). All five sessions' first screenshot is
  `sha256 7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` (9,451 bytes, 640×480).
  What this does not license: the digest equality is a rendering-identity observation, not a
  provenance proof (see Limits), and the admission still belongs to the counter's reading at the
  measured revision — the executor recorded 16 admitted / 0 failing / 0 binding findings at
  `245c4c61…`, in `w1/ExecFirefoxDriver/counter-check.json`.

## 2. Launch discipline on this host [observation, grounded in the flags documented above]

- **Two ports, both free, never 9222.** geckodriver's WebDriver server defaults to `--host
  127.0.0.1` and `--port 4444` (S13x Flags.html), and its BiDi WebSocket defaults to 9222 —
  "Port to use to connect to WebDriver BiDi. Defaults to 9222." (S13x Flags.html). On this host
  `127.0.0.1:9222` is the operator's musketeer CDP lease port (a host fact recorded in this
  round's seat contract, not a fetched source), so every run passes an ephemeral `--port` and an
  ephemeral `--websocket-port`; the docs' own suggestion is to "bind to 0 to get the system to
  atomically assign a free port" (S13x Flags.html). A run that omits `--websocket-port` would
  try to bind the operator's lease port.
- **Profiles and HOME go into scratch.** `--profile-root` is the directory geckodriver creates
  temporary profiles in, defaulting to the system temporary directory, and "Both geckodriver and
  Firefox must have read-write access to this path" (S13x Flags.html). The counter points it at
  its own scratch and also sets `HOME`, `TMPDIR` and `XDG_{CONFIG,CACHE,DATA,STATE}_HOME` inside
  that scratch, so no Firefox state lands in the operator's home.
- **The binary is pinned, headless is explicit.** `--binary` names "the Firefox binary to use"
  (S13x Flags.html) — here `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` — and headlessness is
  requested through `moz:firefoxOptions.args`, whose documented example is `["-headless"]`
  (S13x MDN firefoxOptions: args "must include the leading dash ( - ) where required"). The
  counter sets `MOZ_HEADLESS=1` in the child environment as well; both the delta session and the
  instrument check report `moz:headless` and `moz:windowless` in the capabilities.
- **Origin-header boundary left in place.** geckodriver rejects requests carrying an `Origin`
  header by default ("to protect against malicious websites trying to access geckodriver running
  on the local machine", S13x Flags.html). The lane's client is a plain HTTP/WebSocket client and
  sends none, so the run does not pass `--allow-origins` and does not widen the driver's exposure.
- **Firefox's remote agent, not a CDP layer.** The client never probes `/json/version`, never
  opens a `--remote-debugging-port`, and never speaks CDP: it takes `webSocketUrl` out of the
  classic `POST /session` response (the `webSocketUrl: true` opt-in) and speaks BiDi frames on
  that socket (S13x MDN connection guide; S13x WD §4.1).
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
| A cost or latency comparison between the engines | each engine on its own build, same recipe and fixture | every run is recorded and the sample size is stated; this round's delta records one run per engine | a benchmark: n=1 wall times (2,312 ms Firefox vs 1,104 ms Chromium for the same 28-command recipe, sibling artifact `w1/ExecFirefoxDelta/shapes.json`) are an observation, not a measurement of variance |
| A claim about "the lane's BiDi evidence" without an engine qualifier | both engines, per row | every row the claim touches is admitted on both engines at the measured revision | a support matrix; the §2 row set is the gate's, not the spec's |

## 5. Engine differences

Placeholder — the L1 fills this section from the wave-1 executor's delta
(`.ufo/waves/round-35/w1/ExecFirefoxDelta/delta.tsv`, `shapes.json`, `firefox-raw.jsonl`,
`chromium-raw.jsonl`). Raw material already on disk, one run per engine and not final:
identity shapes (UUID vs 32-hex session, context, realm, shared-id and intercept ids), Firefox's
extra `userContext` field on context-ish event payloads, the JSON key order and header-name order
in `network.responseCompleted` (the same seven header names on both), R11/R12 payloads equal in
content, cookie `sameSite` `default` on Firefox vs `none` on Chromium for the same fixture cookie,
and first-screenshot sizes 9,451 B (Firefox) vs 6,626 B (Chromium) at the same 640×480 IHDR.
Anything a reader needs as a contract belongs in the filled section, not here.

## 6. Limits

- **One host build.** Firefox 158.0.1 (`Mozilla Firefox 158.0.1` from `--version`) with
  geckodriver 0.37.1 (`geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`), headless on
  Arch Linux, paths `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` and
  `/home/vgpnk/.local/bin/geckodriver`. geckodriver's support table lists 0.37.1 as requiring
  Firefox "115 ESR" or newer with no maximum (S13x Support.html) — a version-range statement,
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
  `moz:debuggerAddress` remote protocol, documented as a *subset* of CDP (S13x Capabilities.html);
  the BiDi socket is the browser's own remote agent, reached directly (S13x MDN connection guide).
- **"The 9222 default is convenient."** Rejected on this host: geckodriver's documented BiDi
  default (S13x Flags.html) is the operator's musketeer CDP lease port, so a run that does not
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
