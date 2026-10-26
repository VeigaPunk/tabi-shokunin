# Second engine delta — Firefox 158.0.1 (geckodriver 0.37.1) against Chromium 154.0.8037.97 (chromedriver 154), same BiDi recipe

Round 35, wave w1, seat ExecFirefoxDelta. One Chromium session through the lane gate's own
recorder (`liveRecord`, `scripts/check-bidi-runtime.mjs`) and one Firefox session through the
frozen counter's recorder (`liveRecordFirefox`,
`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`), both over the same 28-command recipe and
the gate's loopback `FIXTURE`. Nothing was synthesised: both records are the recorders' returned
`{newSession, cmds, events}` objects, re-serialised as JSONL in the gate's transcript shape.

Provenance (all hashes and versions in `versions.txt`):

| item | value |
|---|---|
| lane rev | `a4bfef0f75027c915e715649950b1d46dcb33d83` (scratch clone `--shared`, detached) |
| gate | `scripts/check-bidi-runtime.mjs` sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` = the counter's frozen `GATE_SHA256` |
| counter | `.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` sha256 `7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e` |
| Chromium | `Chromium 154.0.8037.97` (`/usr/lib/chromium/chromium`, the binary, not the `/usr/bin/chromium` launcher) |
| chromedriver | `ChromeDriver 154.0.8037.97` (`/usr/bin/chromedriver`, `--port` ephemeral) |
| Firefox | `Mozilla Firefox 158.0.1` (`/home/vgpnk/.local/opt/firefox-158.0.1/firefox`) |
| geckodriver | `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)` |
| node | `v24.21.0` |
| fixture | `FIXTURE_SHA256 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`; `/a.html` body 474 B, `/data.txt` 26 B |
| TMPDIR | `/fast/r35d` (10 B, symlink into the seat scratch) so the gate's chromium singleton-socket check took its `scratch.length <= 60` branch; geckodriver ran with `--profile-root`, `HOME`, `TMPDIR`, `XDG_*` inside the recorders' own scratch, `--port` and `--websocket-port` both ephemeral |

Run shape: 28 commands and 0 error responses on both engines (`shapes.json.roundTrip`); 14 events
on Chromium, 20 on Firefox. Both records, re-parsed by the gate's own `recordFromTranscript`,
satisfy every frozen row predicate the matrix allows: R1–R15 and R17 `holds`, R16
`no-bidi-counterpart` (it has no BiDi command by construction) — on both engines, on this live
session. The recipe was executed twice end to end; the archived pair is the second execution, and
both executions produced byte-identical screenshots per engine (see D5).

`differs` in `delta.tsv` is a **shape** verdict: response/event key sets, value type classes and
identifier grammars, plus the two axes the seat spec names explicitly (screenshot byte size; the
`getData` byte type). Value-level and ordering differences on rows marked `no` are listed under
"The rows that do not differ" so nothing is hidden by the definition.

## The differences an evidence author must know

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

### D2. Capability namespaces; the driver version lives in capabilities on Firefox only (R1)
Chromium `caps` keys: `acceptInsecureCerts browserName browserVersion chrome fedcm:accounts
goog:chromeOptions goog:processID networkConnectionEnabled pageLoadStrategy platformName proxy
setWindowRect strictFileInteractability timeouts unhandledPromptBehavior webSocketUrl
webauthn:extension:* webauthn:virtualAuthenticators` (22 keys, `chromium-raw.jsonl:1`).
Firefox: `… moz:accessibilityChecks moz:buildID moz:geckodriverVersion moz:headless
moz:platformVersion moz:processID moz:profile moz:shutdownTimeout moz:webdriverClick
moz:windowless … userAgent webSocketUrl` (22 keys, `firefox-raw.jsonl:1`).
Firefox publishes `moz:geckodriverVersion` and `userAgent`; Chromium publishes **no**
chromedriver-version capability at all. `moz:profile` is an absolute path — inside the recorder's
throwaway scratch here, but it is a host path in a committed transcript unless the author strips or
redacts it (the counter requires the profile to live under scratch; the receipt's transcript will
carry whatever geckodriver reports).

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
`request.request` (the request id a `continueRequest`/`getData` must echo) is 32 uppercase hex on
Chromium (`BD28158C69CE68AE137D56D77EE8F90A`, `chromium-raw.jsonl:12`) and `<int>-<uuid>` on Firefox
(`7-24915bfc-606c-4e0f-b9c7-8f9e6ac805b9`, `firefox-raw.jsonl:12`). By contrast `navigation` is a
UUID on both (`chromium-raw.jsonl:11`, `firefox-raw.jsonl:11`), `browsingContext.getTree` returns
the same eight keys on both (`children clientWindow context originalOpener parent url userContext`),
`setViewport`, `traverseHistory` and `handleUserPrompt` return `{}` on both, `innerWidth` is 640 on
both, and `#out` is `clicked:tabi` / `#t` is `tabi` on both. `timings` differ in kind, not just
value: Chromium emits all-zero deltas with a non-zero integer `timeOrigin`, Firefox emits
`timeOrigin: 0` with a real fractional `requestTime` (`chromium-raw.jsonl:12`, `firefox-raw.jsonl:12`).

## The rows that do not differ, and what does differ in them

| row | shape verdict | value/order differences present in the observation text |
|---|---|---|
| R8 click | no | `#out` = `clicked:tabi` both, 3 `performActions` success both; only the `script.evaluate` `realm` id shape differs (D1) |
| R9 text fill | no | `#t` = `tabi` both, one key `performActions` both; same realm caveat |
| R11 wire truth | no | status/`statusText`/fixture header identical; `bodySize`, `content.size`, `mimeType`, `headersSize`, header order differ (D7) |
| R12 byte truth | no | `bytes.type` = `"string"`, 26 chars, identical value on both (D9) |
| R14 traverse | no | `{}` on both; `pathname` = `/a.html` on both; realm shape differs |
| R16 | no | no BiDi command in either engine (the matrix row has no counterpart by construction) |

## Predicate round-trip (not the C2 verdict)

Both archived records, parsed by the gate's `recordFromTranscript` and graded by
`gate.PREDICATES` with each session's own `browserVersion`, give:

| engine | cmds | events | R1–R15, R17 | R16 |
|---|---|---|---|---|
| Chromium 154.0.8037.97 | 28 | 14 | holds | `no-bidi-counterpart` |
| Firefox 158.0.1 | 28 | 20 | holds | `no-bidi-counterpart` |

This is evidence about *this* pair of sessions, not the C2 verdict: that verdict also needs two
committed Firefox runs, the receipt's driver/transcript digests, the `## Gate` rows and the
counter's own live leg. What it does establish is that the Firefox engine supports all 15 matrix
commands the recipe exercises — including `network.addDataCollector`, `network.getData`,
`network.addIntercept`, `browsingContext.traverseHistory` and `browsingContext.handleUserPrompt`,
none of which returned an error — on a headless loopback run at a pinned 640x480 viewport.

## geckodriver default that must never be inherited

`geckodriver --help`, verbatim:

```
      --websocket-port <PORT>
          Port to use to connect to WebDriver BiDi [default: 9222]
```

9222 is the operator's musketeer CDP lease port. The counter passes `--websocket-port <free>`
(counter line 195); a Firefox run that forgets the flag binds it. This seat passed both `--port`
and `--websocket-port` from `freePort()` and nothing was listening on 9222 before or after the run.

## How to reproduce

```
S=<scratch>; git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q --detach \
  a4bfef0f75027c915e715649950b1d46dcb33d83
CLONE="$S/clone" OUT=<output dir> TMPDIR=/fast/r35d XDG_RUNTIME_DIR=/fast/r35d \
  node "$S/delta.mjs"            # delta-driver.mjs in this directory, byte-for-byte
```

`delta.mjs` imports the gate and the counter read-only from the clone, calls
`liveRecord({timeoutMs:120000})` then `liveRecordFirefox({gate, firefox, geckodriver,
timeoutMs:180000})` sequentially, re-serialises both records with `toTranscript()` (the gate's
transcript shape: `http-res /session`, then `send`/`recv` frames ordered by their wire index), and
derives `delta.tsv` and `shapes.json` mechanically. Walls: Chromium 1054 ms, Firefox 2332 ms.

## Files

| file | what |
|---|---|
| `delta.tsv` | R1..R17 × (method, chromium observation, firefox observation, differs) |
| `delta.md` | this note |
| `chromium-raw.jsonl` | the Chromium record, 71 lines, gate transcript shape |
| `firefox-raw.jsonl` | the Firefox record, 77 lines, gate transcript shape |
| `shapes.json` | per-row signatures, command/event inventories with error codes, round-trip predicate table |
| `versions.txt` | every `--version` invoked, gate/counter digests, clone rev |
| `geckodriver-help.txt` | full `geckodriver --help` |
| `delta-driver.mjs` | the scratch driver that produced the four artifacts above |
